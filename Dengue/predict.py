#!/usr/bin/env python3
"""
Dengue Guard - fast Python inference from the serialized model (models/dengue_gbt.joblib).

Loads the joblib file written by train.py, builds the same per-ward lag features, and prints the
ward ranking for one warning window. No retraining and no API calls; a full 60-ward forecast takes
a few milliseconds once the model is loaded.

Usage
  python predict.py                       # latest week in the data, +3 week window, top 10 wards
  python predict.py --horizon 4 --top 15  # +4 week window
  python predict.py --origin 2025-09-01   # warning issued in the week of 2025-09-01
"""
import argparse
import time

import joblib
import numpy as np
import pandas as pd

import train


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", default="models/dengue_gbt.joblib")
    ap.add_argument("--csv", default="data/dataset.js", help="weekly ward data (.csv or data/dataset.js)")
    ap.add_argument("--horizon", type=int, default=3, choices=train.HORIZONS, help="weeks ahead")
    ap.add_argument("--origin", default=None, help="week the warning is issued (YYYY-MM-DD); default = latest week")
    ap.add_argument("--top", type=int, default=10)
    a = ap.parse_args()

    bundle = joblib.load(a.model)
    models, thr, tiers, feats = bundle["models"][a.horizon], bundle["thresholds"], bundle["tiers"], bundle["features"]

    df = train.clean(train.load_csv(a.csv))
    f = train.origin_features(df)
    origin = pd.Timestamp(a.origin) if a.origin else f.date.max()
    f = f[f.date == origin].copy()
    if f.empty:
        raise SystemExit(f"No ward has 8 weeks of history ending {origin.date()}")
    doy = (origin + pd.Timedelta(days=7 * a.horizon)).dayofyear
    f["season_sin"], f["season_cos"] = np.sin(2 * np.pi * doy / 365.25), np.cos(2 * np.pi * doy / 365.25)

    t0 = time.perf_counter()
    X = f[feats].to_numpy(dtype=float)
    mean = np.clip(models["mean"].predict(X), 0, None)
    lo = np.minimum(np.clip(models["lo"].predict(X), 0, None), mean)
    hi = np.maximum(np.clip(models["hi"].predict(X), 0, None), mean)
    ms = (time.perf_counter() - t0) * 1000

    out = pd.DataFrame({"ward_id": f.ward_id.values, "city": f.city.values, "expected_cases": mean.round(1),
                        "range_80pct": [f"{l:.1f}-{h:.1f}" for l, h in zip(lo, hi)],
                        "tier": [tiers[i] for i in train.tier_idx(mean, thr)]})
    out = out.sort_values("expected_cases", ascending=False)
    print(f"Warning issued {origin.date()}, window +{a.horizon} weeks (target week {(origin + pd.Timedelta(days=7 * a.horizon)).date()})")
    print(out.head(a.top).to_string(index=False))
    print(f"\n{len(out)} wards forecast in {ms:.0f} ms ({out.tier.value_counts().to_dict()})")


if __name__ == "__main__":
    main()
