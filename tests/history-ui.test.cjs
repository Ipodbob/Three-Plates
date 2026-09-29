const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");
function app(seed) {
  const dom = new JSDOM(
      fs.readFileSync(path.join(root, "index.html"), "utf8"),
      {
        url: "https://ipodbob.github.io/Three-Plates/#you",
        runScripts: "outside-only",
      },
    ),
    w = dom.window;
  w.scrollTo = () => {};
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  for (const f of [
    "recipes",
    "batch-v3",
    "core-v3",
    "phase1",
    "menus",
    "cooking",
    "prep",
    "cooking-ui",
  ])
    w.eval(fs.readFileSync(path.join(root, f + ".js"), "utf8"));
  const s = w.PlatesCore.defaults();
  seed?.(s, w.PlatesCore);
  const original = JSON.stringify(s);
  w.localStorage.setItem("three-plates-v3", original);
  w.eval(fs.readFileSync(path.join(root, "app-v3.js"), "utf8"));
  return {
    dom,
    w,
    original,
    q: (s) => w.document.querySelector(s),
    state: () => JSON.parse(w.localStorage.getItem("three-plates-v3")),
  };
}
const tick = () => new Promise((r) => setImmediate(r));
test("a normal preference save after loading 601 custom products retains every stock amount", () => {
  const a = app((s) => {
    for (let n = 0; n < 601; n++) {
      const id = "custom-" + n;
      s.custom[id] = { id, name: "Product " + n, unit: "g", group: "Other" };
      s.pantry.push({ id, qty: n + 1, always: false });
    }
  });
  a.q("#slow-cooker").click();
  assert.equal(Object.keys(a.state().custom).length, 601);
  assert.equal(a.state().pantry.length, 601);
  assert.equal(a.state().pantry.at(-1).qty, 601);
  a.dom.window.close();
});
test("damaged v3 stock pauses app saves and preserves the original backup text", () => {
  const a = app((s) => {
    s.pantry = [{ id: "missing", qty: 500, always: false }];
  });
  assert.match(a.q("main").textContent, /saving is paused/i);
  a.q("#slow-cooker").click();
  assert.equal(a.w.localStorage.getItem("three-plates-v3"), a.original);
  a.dom.window.close();
});
test("a valid formatted backup over 2 MB can be reviewed and restored without losing long history", async () => {
  const a = app(),
    s = a.w.PlatesCore.defaults();
  for (let n = 0; n < 9000; n++)
    s.plans.push({
      id: "meal" + n,
      recipeId: "pesto-pea-pasta",
      date: a.w.PlatesCore.addDays("2020-01-01", n),
      meal: "Dinner",
      serveTime: "18:30",
      servings: 2,
      kind: "cook",
      lotId: null,
      side: "none",
      cooked: true,
    });
  const content = JSON.stringify(s, null, 2);
  assert.ok(Buffer.byteLength(content) > 2e6);
  const input = a.q("#backup-file");
  Object.defineProperty(input, "files", {
    value: [{ size: Buffer.byteLength(content), text: async () => content }],
  });
  input.dispatchEvent(new a.w.Event("change", { bubbles: true }));
  await tick();
  assert.ok(a.q("#confirm-action"));
  assert.equal(a.state().plans.length, 0);
  a.q("#confirm-action").click();
  assert.equal(a.state().plans.length, 9000);
  assert.equal(a.state().plans.at(-1).id, "meal8999");
  a.dom.window.close();
});
