// Offline "math defense" checks: node scripts/selftest.js  (also: npm test). Any network call fails the run.
const http = require("http"), https = require("https"), net = require("net");
for (const m of [http, https]) m.request = m.get = () => { throw new Error("network used during self-test"); };
net.connect = net.createConnection = () => { throw new Error("network used during self-test"); };
const load = require("./_load.js"), c = load(["ops.js"]), { DW, OPS } = c;
const wards = DW.buildWards(DW.parseCSV(c.DATASET_CSV)), origins = DW.originsOf(wards);
let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log("FAIL", msg); } };

// water-filling unit tests
ok(OPS.waterFill([10, 10], [1, 1], 10).join() === "5,5", "equal weights split equally");
ok(OPS.waterFill([10, 10], [4, 1], 10).join() === "8,2", "higher priority gets a higher fill ratio");
ok(OPS.waterFill([3, 10], [4, 1], 10).join() === "3,7", "high priority is capped at its demand, rest flows on");
ok(OPS.waterFill([5, 7], [1, 2], 100).join() === "5,7", "enough stock = full demand");

const sample = [origins[origins.length - 1], "2025-06-09", "2024-09-02", "2023-08-07", "2022-01-03"];
for (const o of sample) for (const h of [2, 3, 4]) for (const stock of [30, 55, 80, 100]) for (const crews of [0, 7, 30]) {
  const rows = wards.map(w => DW.forecast(w, o, h)).filter(Boolean);
  const p = OPS.plan(rows, { stockPct: stock, crews, allWards: wards }), tag = `${o} h${h} s${stock} c${crews}`;
  for (const k of ["saline_bags_needed", "diagnostic_kits_needed"]) {
    const s = p.stock[k], a = k.replace("_needed", "_allocated");
    ok(s.allocated === Math.min(s.available, s.required), `${tag} ${k}: allocates exactly the available stock`);
    ok(p.items.every(x => x[a] >= 0 && x[a] <= x[k] && Number.isInteger(x[a])), `${tag} ${k}: 0 <= alloc <= demand, integer`);
    const fill = x => (x[k] ? x[a] / x[k] : 1), srt = p.items.slice().sort((x, y) => y.priority - x.priority);
    ok(srt.every((x, i) => i === 0 || fill(srt[i - 1]) + 1 / Math.max(1, srt[i - 1][k]) + 1 / Math.max(1, x[k]) + 1e-9 >= fill(x)), `${tag} ${k}: fill ratio follows priority (±1 unit rounding each)`);
  }
  if (stock === 100) ok(p.items.every(x => x.saline_bags_allocated === x.saline_bags_needed), `${tag} full stock => no supply deficit`);
  const city = id => p.items.find(x => x.ward_id === id).city;
  ok(p.transfers.every(t => city(t.from) === t.city && city(t.to) === t.city), `${tag} transfers stay inside the city`);
  ok(p.items.every(x => x.sent + x.netDeficit === x.overflow), `${tag} overflow = sent + net deficit`);
  ok(p.items.every(x => Math.min(x.bedsReq, x.bedCap) + x.received <= x.bedCap), `${tag} receivers never exceed capacity`);
  ok(Object.values(p.cities).every(cc => cc.headroom >= 0 && cc.occupied <= cc.bedCap), `${tag} city headroom >= 0`);
  ok(p.crewsUsed <= crews, `${tag} crews used <= available`);
  ok(p.items.every(x => x.casesPrevented >= 0), `${tag} crews never add cases`);
  ok(p.items.every(x => OPS.smsNotice(p, x).length <= 160), `${tag} every SMS fits one 160-char segment`);
}
const curve = OPS.crewCurve(wards[0], "2025-06-09");
ok(curve.every((x, i) => i === 0 || x.prevented >= curve[i - 1].prevented - 1e-9), "more crews never prevent fewer cases");
ok(OPS.crewEfficacy(2) - OPS.crewEfficacy(1) < OPS.crewEfficacy(1), "crew efficacy has diminishing returns");
const r = wards.map(w => DW.forecast(w, "2025-06-09", 3)), run = () => JSON.stringify(OPS.plan(r, { stockPct: 45, crews: 12, allWards: wards }).items);
ok(run() === run(), "plan is deterministic");
console.log(`${checks - fails}/${checks} checks passed${fails ? "" : " (no network used)"}`);
process.exit(fails ? 1 : 0);
