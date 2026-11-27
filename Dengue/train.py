#!/usr/bin/env python3
"""
Dengue Guard - offline training pipeline (Python).

What it does
  1. Loads the weekly ward dataset (data/dataset.js by default, or --csv).
  2. Builds per-ward multi-week lag features (rainfall lags 0-7w, 2/4/8w sums,
     temperature / humidity lags, recent case trend, ward vulnerability, seasonality).
     Every feature uses only data available at the *origin* week (no future leakage).
  3. Splits CHRONOLOGICALLY by target date: train <= 2022, validation = 2023, test = 2024-2025.
  4. For each horizon (+2w, +3w, +4w) trains 3 HistGradientBoosting models:
       mean (Poisson), lo (10th percentile), hi (90th percentile).
     The number of trees is picked on the validation year, then the model is refit on
     train + validation. The test years are touched exactly once, for the final metrics.
  5. Exports:
       <out>/model.js, <out>/metrics.js      -> same format the browser dashboard reads
       <out>/dengue_gbt.joblib               -> serialized sklearn models (joblib)
     With --write-app the two .js files are written straight into data/ and the joblib into
     models/ (replaces the shipped model; models/dengue_gbt.joblib is what predict.py loads).

Usage
  pip install -r requirements.txt
  python train.py                 # writes to ./training_output
  python train.py --write-app     # also overwrite data/model.js, data/metrics.js + models/dengue_gbt.joblib
"""
import argparse
import io
import json
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_pinball_loss, mean_poisson_deviance, r2_score

HORIZONS = [2, 3, 4]
TIERS = ["Low", "Medium", "High", "Critical"]
TIER_QUANTILES = [0.70, 0.92, 0.97]   # tier cut-offs, calibrated on validation-year weekly cases
TRAIN_END, VAL_END = pd.Timestamp("2022-12-31"), pd.Timestamp("2023-12-31")
MAX_ITER = 600
SEED = 42

# Feature order must match what engine.js expects (data/model.js "features").
FEATURES = (
    [f"rain_lag{k}w" for k in range(8)]
    + ["rain_sum_2w", "rain_sum_4w", "rain_sum_8w", "rain_sum_wk4_7"]
    + ["temp_lag0w", "temp_lag2w", "temp_lag4w", "temp_mean_4w"]
    + ["hum_lag0w", "hum_lag2w", "hum_lag4w", "hum_mean_4w"]
    + ["cases_t0", "cases_t1", "cases_t2", "cases_t3", "cases_mean_4w", "cases_trend"]
    + ["population_density_sqkm", "water_logging_risk_index", "sanitation_score", "vulnerability_index"]
    + ["season_sin", "season_cos"]
)
RAIN_COLS = [f"rain_lag{k}w" for k in range(8)] + ["rain_sum_2w", "rain_sum_4w", "rain_sum_8w", "rain_sum_wk4_7"]
GROUPS = {
    "Rainfall lags (1-8 wk)": RAIN_COLS,
    "Temperature": ["temp_lag0w", "temp_lag2w", "temp_lag4w", "temp_mean_4w"],
    "Humidity": ["hum_lag0w", "hum_lag2w", "hum_lag4w", "hum_mean_4w"],
    "Recent case trend": ["cases_t0", "cases_t1", "cases_t2", "cases_t3", "cases_mean_4w", "cases_trend"],
    "Ward vulnerability": ["population_density_sqkm", "water_logging_risk_index", "sanitation_score", "vulnerability_index"],
    "Seasonality": ["season_sin", "season_cos"],
}
WEATHER_COLS = GROUPS["Rainfall lags (1-8 wk)"] + GROUPS["Temperature"] + GROUPS["Humidity"]


# ----------------------------------------------------------------------------- data
def load_csv(path):
    p = Path(path)
    text = p.read_text(encoding="utf-8-sig")
    if p.suffix == ".js":                       # data/dataset.js = window.DATASET_CSV="...";
        text = json.loads(text[text.index("=") + 1:].strip().rstrip(";"))
    df = pd.read_csv(io.StringIO(text), parse_dates=["date"])
    df.columns = [c.strip().lower() for c in df.columns]
    return df.sort_values(["ward_id", "date"]).reset_index(drop=True)


def clean(df):
    """Same cleaning as engine.js: ffill(limit=2) then ward median; cases NaN -> 0; rain >= 0."""
    df = df.copy()
    for col in ["avg_temp_c", "rainfall_mm", "relative_humidity_pct"]:
        g = df.groupby("ward_id")[col]
        df[col] = g.ffill(limit=2)
        df[col] = df[col].fillna(g.transform("median"))
    df["dengue_cases"] = df["dengue_cases"].fillna(0)
    df["rainfall_mm"] = df["rainfall_mm"].clip(lower=0)
    return df


def origin_features(df):
    """Per-ward lag features at every origin week (grouped by ward_id, no cross-ward leakage)."""
    g = df.groupby("ward_id")
    f = pd.DataFrame({"ward_id": df.ward_id, "city": df.city, "date": df.date})
    for k in range(8):
        f[f"rain_lag{k}w"] = g.rainfall_mm.shift(k)
    lag = lambda a, b: f[[f"rain_lag{k}w" for k in range(a, b)]].sum(axis=1, min_count=b - a)
    f["rain_sum_2w"], f["rain_sum_4w"], f["rain_sum_8w"], f["rain_sum_wk4_7"] = lag(0, 2), lag(0, 4), lag(0, 8), lag(4, 8)
    for tag, col in [("temp", "avg_temp_c"), ("hum", "relative_humidity_pct")]:
        for k in (0, 2, 4):
            f[f"{tag}_lag{k}w"] = g[col].shift(k)
        f[f"{tag}_mean_4w"] = sum(g[col].shift(k) for k in range(4)) / 4
    for k in range(4):
        f[f"cases_t{k}"] = g.dengue_cases.shift(k)
    f["cases_mean_4w"] = f[[f"cases_t{k}" for k in range(4)]].mean(axis=1)
    f["cases_trend"] = f.cases_t0 - f.cases_t3
    f["population_density_sqkm"] = df.population_density_sqkm
    f["water_logging_risk_index"] = df.water_logging_risk_index
    f["sanitation_score"] = df.sanitation_score
    f["vulnerability_index"] = (0.4 * df.water_logging_risk_index + 0.3 * (1 - df.sanitation_score)
                                + 0.3 * (df.population_density_sqkm / 75000).clip(0, 1))
    f["_cases_now"] = df.dengue_cases
    return f.dropna(subset=["rain_lag7w"])      # need >= 8 weeks of history


def horizon_frame(f, df, h):
    """Attach the +h week target and target-week seasonality; keep rows whose target exists."""
    d = f.copy()
    d["target_date"] = d.date + pd.Timedelta(days=7 * h)
    tgt = df.set_index(["ward_id", "date"]).dengue_cases
    d["y"] = tgt.reindex(pd.MultiIndex.from_arrays([d.ward_id, d.target_date])).to_numpy()
    d = d.dropna(subset=["y"]).copy()
    doy = d.target_date.dt.dayofyear
    d["season_sin"] = np.sin(2 * np.pi * doy / 365.25)
    d["season_cos"] = np.cos(2 * np.pi * doy / 365.25)
    return d


# ----------------------------------------------------------------------------- models
def make_model(kind, n_iter):
    kw = dict(learning_rate=0.05, max_iter=n_iter, max_leaf_nodes=31, min_samples_leaf=40,
              l2_regularization=1.0, early_stopping=False, random_state=SEED)
    if kind == "mean":
        return HistGradientBoostingRegressor(loss="poisson", **kw)
    return HistGradientBoostingRegressor(loss="quantile", quantile=0.1 if kind == "lo" else 0.9, **kw)


def val_loss(kind, y, pred):
    if kind == "mean":
        return mean_poisson_deviance(y, np.clip(pred, 1e-6, None))
    return mean_pinball_loss(y, pred, alpha=0.1 if kind == "lo" else 0.9)


def fit_with_val_selection(kind, Xtr, ytr, Xva, yva, Xall, yall):
    """Pick number of trees on the validation year (chronological), then refit on train+val."""
    m = make_model(kind, MAX_ITER).fit(Xtr, ytr)
    losses = [val_loss(kind, yva, p) for p in m.staged_predict(Xva)]
    best = int(np.argmin(losses)) + 1
    return make_model(kind, best).fit(Xall, yall), best


# ----------------------------------------------------------------------------- export
def export_model(est):
    nodes_per_tree = []
    for it in est._predictors:
        n = it[0].nodes
        nodes_per_tree.append({
            "f": n["feature_idx"].astype(int).tolist(),
            "t": [float(x) for x in n["num_threshold"]],
            "l": n["left"].astype(int).tolist(),
            "r": n["right"].astype(int).tolist(),
            "v": [round(float(x), 8) for x in n["value"]],
            "leaf": n["is_leaf"].astype(int).tolist(),
        })
    return {"base": float(np.ravel(est._baseline_prediction)[0]), "poisson": est.loss == "poisson", "trees": nodes_per_tree}


def tier_idx(v, thr):
    return np.searchsorted(np.asarray(thr), v, side="right")


def reg_metrics(y, p):
    return {"mae": float(mean_absolute_error(y, p)), "rmse": float(np.sqrt(np.mean((y - p) ** 2))), "r2": float(r2_score(y, p))}


def perm_mae(model, X, y, cols, rng, repeats=3):
    base = mean_absolute_error(y, np.clip(model.predict(X), 0, None))
    idx = [FEATURES.index(c) for c in cols]
    out = []
    for _ in range(repeats):
        Z = X.copy()
        Z[:, idx] = Z[rng.permutation(len(Z))][:, idx]
        out.append(mean_absolute_error(y, np.clip(model.predict(Z), 0, None)) - base)
    return float(np.mean(out))


# ----------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--csv", default="data/dataset.js", help="dataset (.csv, or data/dataset.js)")
    ap.add_argument("--out", default="training_output", help="output directory")
    ap.add_argument("--write-app", action="store_true", help="also overwrite data/model.js and data/metrics.js")
    a = ap.parse_args()
    t0 = time.time()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)

    df = clean(load_csv(a.csv))
    feats = origin_features(df)
    print(f"{len(df):,} ward-weeks, {df.ward_id.nunique()} wards, {df.date.min().date()} -> {df.date.max().date()}")

    frames = {h: horizon_frame(feats, df, h) for h in HORIZONS}
    # Tier thresholds: calibrated on validation-year weekly case counts (never on test)
    val_cases = frames[3].loc[(frames[3].target_date > TRAIN_END) & (frames[3].target_date <= VAL_END), "y"]
    thr = [float(x) for x in np.quantile(val_cases, TIER_QUANTILES)]
    print("tier thresholds (cases/ward-week):", [round(t, 2) for t in thr])

    models, metrics_h, joblib_models = {}, {}, {}
    rng = np.random.default_rng(SEED)
    perm_groups, perm_rain = None, None
    monthly = None
    all_for_baseline = None

    for h in HORIZONS:
        d = frames[h]
        tr = d.target_date <= TRAIN_END
        va = (d.target_date > TRAIN_END) & (d.target_date <= VAL_END)
        te = d.target_date > VAL_END
        trva = tr | va
        X = d[FEATURES].to_numpy(dtype=float)
        y = d.y.to_numpy(dtype=float)
        print(f"+{h}w: train {tr.sum():,} | val {va.sum():,} | test {te.sum():,}")

        fitted, iters = {}, {}
        for kind in ("mean", "lo", "hi"):
            fitted[kind], iters[kind] = fit_with_val_selection(kind, X[tr], y[tr], X[va], y[va], X[trva], y[trva])
        print(f"   trees selected on validation: {iters}")
        models[str(h)] = {k: export_model(v) for k, v in fitted.items()}
        joblib_models[h] = fitted

        # ---- single pass over the held-out test years
        mean = np.clip(fitted["mean"].predict(X[te]), 0, None)
        lo = np.minimum(np.clip(fitted["lo"].predict(X[te]), 0, None), mean)
        hi = np.maximum(np.clip(fitted["hi"].predict(X[te]), 0, None), mean)
        yt = y[te]
        dt = d[te]

        persistence = dt["_cases_now"].to_numpy(dtype=float)
        month_tbl = df[df.date <= VAL_END].assign(m=lambda x: x.date.dt.month).groupby(["ward_id", "m"]).dengue_cases.mean()
        seasonal = month_tbl.reindex(pd.MultiIndex.from_arrays([dt.ward_id, dt.target_date.dt.month])).to_numpy()
        seasonal = np.where(np.isnan(seasonal), np.nanmean(seasonal), seasonal)

        keep = [i for i, c in enumerate(FEATURES) if c not in WEATHER_COLS]
        abl, _ = fit_with_val_selection("mean", X[tr][:, keep], y[tr], X[va][:, keep], y[va], X[trva][:, keep], y[trva])
        ablation = np.clip(abl.predict(X[te][:, keep]), 0, None)

        ta, tp = tier_idx(yt, thr), tier_idx(mean, thr)
        conf = np.zeros((4, 4), dtype=int)
        for i, j in zip(ta, tp):
            conf[i, j] += 1
        hi_a, hi_p = ta >= 2, tp >= 2
        metrics_h[str(h)] = {
            "n_test": int(te.sum()),
            "model": reg_metrics(yt, mean),
            "baseline_persistence": reg_metrics(yt, persistence),
            "baseline_seasonal_ward_month": reg_metrics(yt, seasonal),
            "ablation_no_weather": reg_metrics(yt, ablation),
            "interval_80_coverage": float(np.mean((yt >= lo) & (yt <= hi))),
            "tier_accuracy": float(np.mean(ta == tp)),
            "tier_within_one": float(np.mean(np.abs(ta - tp) <= 1)),
            "high_plus_precision": float((hi_a & hi_p).sum() / max(hi_p.sum(), 1)),
            "high_plus_recall": float((hi_a & hi_p).sum() / max(hi_a.sum(), 1)),
            "confusion": conf.tolist(),
            "mae_by_ward": {w: round(float(np.mean(np.abs(yt[(dt.ward_id == w).to_numpy()] - mean[(dt.ward_id == w).to_numpy()]))), 3)
                            for w in sorted(dt.ward_id.unique())},
        }
        m = metrics_h[str(h)]["model"]
        print(f"   TEST  MAE {m['mae']:.3f}  RMSE {m['rmse']:.3f}  R2 {m['r2']:.3f}  "
              f"tier acc {metrics_h[str(h)]['tier_accuracy']:.3f}  80% cov {metrics_h[str(h)]['interval_80_coverage']:.3f}")

        if h == 3:
            Xt = X[te]
            perm_groups = {g: perm_mae(fitted["mean"], Xt, yt, c, rng) for g, c in GROUPS.items()}
            perm_rain = {c: perm_mae(fitted["mean"], Xt, yt, [c], rng) for c in [f"rain_lag{k}w" for k in range(8)]}
            mdf = pd.DataFrame({"month": dt.target_date.dt.to_period("M").dt.to_timestamp().dt.strftime("%Y-%m-%d").to_numpy(),
                                "actual": yt, "pred": mean, "lo": lo, "hi": hi})
            monthly = [{"month": k, **{c: round(float(v), 10) for c, v in r.items()}}
                       for k, r in mdf.groupby("month")[["actual", "pred", "lo", "hi"]].sum().iterrows()]
            # reference values used by the dashboard's "what drove this forecast" breakdown
            baseline = {c: float(np.mean(X[trva][:, FEATURES.index(c)])) for c in FEATURES}

    model_js = {"features": FEATURES, "thresholds": thr, "baseline": baseline,
                "trained_through": str(VAL_END.date()), "full_refit": False, "models": models}
    metrics_js = {"split": {"train": "2016-01..2022-12", "validation": "2023", "test": "2024-01..2025-12 (held out)"},
                  "horizons": metrics_h, "thresholds": thr, "tiers": TIERS, "full_refit": False,
                  "perm_importance_groups_h3": perm_groups, "perm_importance_rain_lags_h3": perm_rain}

    dump = lambda o: json.dumps(o, separators=(",", ":"))
    (out / "model.js").write_text("window.MODEL=" + dump(model_js) + ";\n", encoding="utf-8")
    (out / "metrics.js").write_text("window.METRICS=" + dump(metrics_js) + ";window.MONTHLY=" + dump(monthly) + ";\n", encoding="utf-8")
    joblib.dump({"features": FEATURES, "thresholds": thr, "tiers": TIERS, "models": joblib_models}, out / "dengue_gbt.joblib", compress=3)
    if a.write_app:
        for name in ("model.js", "metrics.js"):
            (Path("data") / name).write_text((out / name).read_text(encoding="utf-8"), encoding="utf-8")
        Path("models").mkdir(exist_ok=True)
        (Path("models") / "dengue_gbt.joblib").write_bytes((out / "dengue_gbt.joblib").read_bytes())
        print("data/model.js, data/metrics.js and models/dengue_gbt.joblib overwritten")
    print(f"done in {time.time() - t0:.0f}s -> {out}/")


if __name__ == "__main__":
    main()
