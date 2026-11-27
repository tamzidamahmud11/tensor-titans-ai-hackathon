// Loads the browser engine files into a Node VM sandbox (no DOM, no network).
const fs = require("fs"), path = require("path"), vm = require("vm");
module.exports = function load(extra = []) {
  const root = path.join(__dirname, "..");
  const ctx = { console, Math, Date, JSON, Map, Set, Object, Array, Number, String, Infinity, NaN, isFinite, parseFloat, parseInt };
  ctx.window = ctx; vm.createContext(ctx);
  for (const f of ["data/model.js", "data/dataset.js", "engine.js", ...extra])
    vm.runInContext(fs.readFileSync(path.join(root, f), "utf8").replace(/^\uFEFF/, ""), ctx, { filename: f });
  return ctx;
};
