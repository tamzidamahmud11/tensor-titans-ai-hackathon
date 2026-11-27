// Generates the /exports sample dispatch pack fully offline:
//   node scripts/generate_exports.js [origin YYYY-MM-DD] [horizon] [stock%] [crews]
const fs = require("fs"), path = require("path"), load = require("./_load.js");
const c = load(["ops.js"]), { DW, OPS } = c;
const wards = DW.buildWards(DW.parseCSV(c.DATASET_CSV)), origins = DW.originsOf(wards);
let [origin, h, stock, crews] = process.argv.slice(2);
h = +(h || 3); stock = +(stock || 60); crews = +(crews || 20);
if (!origin) {   // default = the dashboard's default: peak predicted week among the last 60 warnings
  let best = -1;
  for (const o of origins.slice(-60)) { let s = 0; for (const w of wards) { const r = DW.forecast(w, o, 3); if (r) s += r.pred; } if (s > best) { best = s; origin = o; } }
}
const rows = wards.map(w => DW.forecast(w, origin, h)).filter(Boolean);
for (const r of rows) r.driver = DW.topDriver(DW.contributions(r.feats, h));
const p = OPS.plan(rows, { stockPct: stock, crews, allWards: wards });
const out = path.join(__dirname, "..", "exports"); fs.mkdirSync(out, { recursive: true });
const act = p.items.filter(x => x.status !== "OK" || x.crews > 0);
const w = (f, s) => { fs.writeFileSync(path.join(out, f), s, "utf8"); console.log("wrote exports/" + f); };
w("sms_alerts.txt", `# SMS dispatch (one 160-char segment each) - warning ${p.origin}, target ${p.target}, stock ${stock}%, ${crews} crews\n` +
  act.map(x => `${x.ward_id}\t${OPS.smsNotice(p, x)}`).join("\n") + "\n");
w("whatsapp_alerts.txt", act.map(x => OPS.whatsappNotice(p, x)).join("\n\n----------\n\n") + "\n");
w("commissioner_brief_all_cities.html", OPS.briefHTML(p, { title: "Commissioner brief - all 60 wards" }));
for (const city of Object.keys(p.cities)) w(`commissioner_brief_${city.replace(/\s+/g, "_")}.html`, OPS.briefHTML(p, { city, title: `Commissioner brief - ${city}` }));
w("allocation_plan.csv", OPS.planCSV(p) + "\n");
w("overflow_transfers.csv", OPS.transfersCSV(p) + "\n");
w("dispatch.json", JSON.stringify({ generated_offline: true, origin: p.origin, target: p.target, horizon_weeks: h, stock_pct: stock, crews_total: crews,
  stock: p.stock, cities: p.cities, transfers: p.transfers,
  wards: p.items.map(x => ({ ward_id: x.ward_id, city: x.city, tier: x.tier, predicted_cases: +x.pred.toFixed(2), saline_bags_needed: x.saline_bags_needed,
    saline_bags_allocated: x.saline_bags_allocated, diagnostic_kits_needed: x.diagnostic_kits_needed, diagnostic_kits_allocated: x.diagnostic_kits_allocated,
    hospital_beds_required: x.bedsReq, local_beds: x.bedCap, net_bed_deficit: x.netDeficit, spraying_crews: x.crews, cases_prevented_2_4wk: +x.casesPrevented.toFixed(2),
    status: x.status, alerts: x.alerts })) }, null, 2) + "\n");
console.log(`origin ${p.origin} +${h}wk, stock ${stock}%, crews ${crews}: ${p.totals.critical} critical, ${p.transfers.length} transfers, ${p.totals.prevented.toFixed(1)} cases prevented`);
