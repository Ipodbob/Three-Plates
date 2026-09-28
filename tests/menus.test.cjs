const { test } = require("node:test"),
  assert = require("node:assert/strict");
require("../recipes.js");
require("../batch-v3.js");
require("../recipes-rated.js");
require("../recipes-diverse.js");
require("../recipes-expanded.js");
require("../recipes-specialists.js");
require("../core-v3.js");
require("../phase1.js");
const C = require("../menus.js"),
  R = PLATES_DATA.recipes,
  I = PLATES_DATA.ingredients,
  now = Date.parse("2026-09-28T10:00:00Z");
function fresh(
  s,
  date = "2026-09-28",
  meal = "Lunch",
  recipeId = "pesto-pea-pasta",
  servings = 2,
) {
  s.plans.push({
    id: C.uid(),
    kind: "cook",
    lotId: null,
    recipeId,
    date,
    meal,
    serveTime: C.mealTimes[meal],
    servings,
    side: "none",
    cooked: false,
  });
}
test("five stored work lunches copy as fresh recipes with sides and no duplicate reservations", () => {
  const s = C.defaults();
  s.pantry = [
    { id: "pasta", qty: 10000, always: false },
    { id: "beef-mince", qty: 10000, always: false },
  ];
  s.batches.push({
    id: "batch",
    recipeId: "prep-bolognese",
    date: "2026-09-28",
    servings: 10,
    cooked: false,
  });
  C.finishBatch(
    s,
    "batch",
    {
      eat: 0,
      fridge: 0,
      freezer: 10,
      cookedAt: new Date(now - 60000).toISOString(),
      freezerConfirmed: true,
    },
    R,
    now,
  );
  C.scheduleLot(s, s.lots[0].id, "2026-09-28", "Lunch", 2, 5, "pasta", R, now);
  const m = C.saveMenu(s, "Work lunches", "2026-09-28", "Lunch", R),
    stock = C.clone(s.pantry),
    lots = C.clone(s.lots);
  assert.equal(m.entries.length, 5);
  const copied = C.applyMenu(s, m.id, "2026-10-05", 3, R);
  assert.equal(copied.length, 5);
  assert.ok(
    copied.every(
      (p) =>
        p.kind === "cook" &&
        !p.cooked &&
        p.lotId === null &&
        p.servings === 3 &&
        p.side === "pasta",
    ),
  );
  assert.deepEqual(s.pantry, stock);
  assert.deepEqual(s.lots, lots);
  assert.equal(C.reserved(s, s.lots[0].id), 10);
  assert.equal(C.requirements(s, R)["beef-mince"], 1875);
  assert.equal(C.requirements(s, R).pasta, 2250);
  C.finishPlan(s, copied[0].id, R, now);
  assert.equal(C.stock(s, "pasta"), 9730);
  assert.equal(C.reserved(s, s.lots[0].id), 10);
  assert.throws(() => C.finishPlan(s, copied[0].id, R, now));
  assert.deepEqual(C.migrate(C.clone(s), R, I), s);
});
test("copy conflicts and current exclusions reject the entire operation before any write", () => {
  const s = C.defaults();
  fresh(s);
  fresh(s, "2026-09-29");
  const m = C.saveMenu(s, "Week", "2026-09-28", "all", R);
  fresh(s, "2026-10-06");
  let before = C.clone(s);
  assert.throws(
    () => C.applyMenu(s, m.id, "2026-10-05", null, R),
    /already has a meal/,
  );
  assert.deepEqual(s, before);
  s.plans.pop();
  s.prefs.exclusions = ["pasta"];
  before = C.clone(s);
  assert.throws(
    () => C.applyMenu(s, m.id, "2026-10-05", null, R),
    /food preferences/,
  );
  assert.deepEqual(s, before);
});
test("saved menus validate on restore and legacy backups gain an empty menu list", () => {
  const s = C.defaults();
  fresh(s);
  C.saveMenu(s, "Week", "2026-09-28", "all", R);
  assert.deepEqual(C.migrate(C.clone(s), R, I), s);
  const old = C.clone(s);
  delete old.menus;
  assert.deepEqual(C.migrate(old, R, I).menus, []);
  for (const corrupt of [
    (m) => (m.entries[0].day = 7),
    (m) => (m.entries[0].side = "unknown"),
    (m) => m.entries.push({ ...m.entries[0] }),
    (m) => (m.entries[0].recipeId = "missing"),
    (m) => (m.id = "__proto__"),
  ]) {
    const bad = C.clone(s);
    corrupt(bad.menus[0]);
    assert.throws(() => C.migrate(bad, R, I));
  }
  assert.throws(() => C.migrate({ ...s, menus: {} }, R, I));
});
test("menu selection uses seven calendar days and preserves complete baking yields", () => {
  const s = C.defaults(),
    bake = R.find((r) => r.baking);
  fresh(s, "2026-09-28", "Baking", bake.id, bake.base);
  fresh(s, "2026-10-05");
  const m = C.saveMenu(s, "Bake", "2026-09-28", "all", R);
  assert.equal(m.entries.length, 1);
  const p = C.applyMenu(s, m.id, "2026-10-12", 1, R)[0];
  assert.equal(p.servings, bake.base);
  assert.equal(p.meal, "Baking");
  assert.throws(() => C.saveMenu(s, "", "2026-09-28", "all", R));
  assert.throws(() => C.saveMenu(s, "None", "2026-09-28", "Dinner", R));
  assert.throws(() => C.previewMenu(s, m.id, "2100-12-31", null, R));
});
