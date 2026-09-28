const { test } = require("node:test"),
  assert = require("node:assert/strict");
for (const f of [
  "recipes",
  "batch-v3",
  "recipes-rated",
  "recipes-diverse",
  "recipes-expanded",
  "recipes-specialists",
  "catalogue-review",
  "core-v3",
  "phase1",
])
  require("../" + f + ".js");
const C = require("../menus.js"),
  R = PLATES_DATA.recipes,
  I = PLATES_DATA.ingredients,
  now = Date.parse("2026-09-29T10:00:00Z");
const radishes = "recipe:sp-skinnytaste-air-fryer-radishes";
const plan = (s, id = "p", recipeId = "chicken-roast") => {
  s.plans.push({
    id,
    recipeId,
    date: "2026-09-29",
    meal: "Dinner",
    serveTime: "18:00",
    servings: 2,
    kind: "cook",
    lotId: null,
    side: "none",
    cooked: false,
  });
  return s.plans.at(-1);
};
const stockAll = (s) => {
  s.pantry = Object.values(I).map((i) => ({
    id: i.id,
    qty: 10000,
    always: false,
  }));
};
test("fresh recipe side combines shared ingredients, changes shopping only, and deducts once", () => {
  const s = C.defaults();
  plan(s);
  stockAll(s);
  const stock = C.clone(s.pantry),
    base = C.requirements(s, R);
  C.setPlanSide(s, "p", radishes, R);
  assert.deepEqual(s.pantry, stock);
  const ingredients = C.sideIngredients(radishes, 2, R),
    needs = C.requirements(s, R);
  for (const i of ingredients)
    assert.equal(needs[i.id], C.round((base[i.id] || 0) + i.qty));
  assert.ok(
    ingredients.some((i) => base[i.id] > 0),
    "exercise shared ingredients",
  );
  C.finishPlan(s, "p", R, now);
  for (const [id, qty] of Object.entries(needs))
    assert.equal(C.stock(s, id), C.round(10000 - qty));
  const after = C.clone(s);
  assert.throws(() => C.finishPlan(s, "p", R, now));
  assert.throws(() => C.setPlanSide(s, "p", "rice", R));
  assert.deepEqual(s, after);
});
test("stored portions buy and consume only the fresh recipe side, preserving the cooked base", () => {
  const s = C.defaults();
  stockAll(s);
  s.batches.push({
    id: "b",
    recipeId: "prep-bolognese",
    date: "2026-09-29",
    servings: 6,
    cooked: false,
  });
  C.finishBatch(
    s,
    "b",
    {
      eat: 0,
      fridge: 2,
      freezer: 4,
      cookedAt: new Date(now - 60000).toISOString(),
      freezerConfirmed: true,
    },
    R,
    now,
  );
  const l = s.lots.find((l) => l.location === "fridge"),
    beef = C.stock(s, "beef-mince");
  C.scheduleLot(s, l.id, "2026-09-29", "Dinner", 2, 1, "none", R, now);
  const p = s.plans[0];
  C.setPlanSide(s, p.id, radishes, R);
  assert.deepEqual(
    C.requirements(s, R),
    Object.fromEntries(
      C.sideIngredients(radishes, 2, R).map((i) => [i.id, i.qty]),
    ),
  );
  assert.equal(C.reserved(s, l.id), 2);
  C.finishPlan(s, p.id, R, now);
  assert.equal(C.stock(s, "beef-mince"), beef);
  assert.equal(l.portions, 0);
  assert.equal(s.lots.find((l) => l.location === "freezer").portions, 4);
  assert.deepEqual(C.migrate(C.clone(s), R, I), s);
});
test("recipe sides roundtrip through backups and menu copies; damaged side links fail without mutation", () => {
  const s = C.defaults();
  plan(s);
  C.setPlanSide(s, "p", radishes, R);
  const menu = C.saveMenu(s, "Dinner with side", "2026-09-29", "all", R);
  const restored = C.migrate(C.clone(s), R, I);
  C.applyMenu(restored, menu.id, "2026-10-06", 3, R);
  assert.equal(restored.plans[1].side, radishes);
  assert.equal(restored.plans[1].servings, 3);
  assert.deepEqual(C.migrate(C.clone(restored), R, I), restored);
  const broken = C.clone(restored);
  broken.plans[0].side = "recipe:missing";
  const before = C.clone(broken);
  assert.throws(() => C.migrate(broken, R, I), /side recipe/);
  assert.deepEqual(broken, before);
  assert.throws(() => C.sideIngredients("recipe:missing", 2, R));
  C.setPlanSide(s, "p", "pasta", R);
  assert.equal(s.plans[0].side, "pasta");
  C.setPlanSide(s, "p", "none", R);
  assert.deepEqual(
    C.requirements(s, R),
    C.requirements(
      { ...s, plans: s.plans.map((p) => ({ ...p, side: undefined })) },
      R,
    ),
  );
});
test("sides enforce dietary aliases, hidden recipes and equipment preferences before changing a meal", () => {
  const s = C.defaults();
  plan(s);
  s.prefs.exclusions = ["garlic"];
  const before = C.clone(s);
  assert.equal(C.sideAllowed(radishes, s.prefs, R), false);
  assert.throws(() => C.setPlanSide(s, "p", radishes, R));
  assert.deepEqual(s, before);
  s.prefs.exclusions = [];
  s.prefs.diet = "vegan";
  assert.equal(C.sideAllowed("recipe:gf2-caprese-salad", s.prefs, R), false);
  s.prefs.diet = "any";
  s.prefs.hidden = ["sp-skinnytaste-air-fryer-radishes"];
  assert.equal(C.sideAllowed(radishes, s.prefs, R), false);
  s.prefs.hidden = [];
  s.prefs.slowCooker = false;
  assert.equal(
    C.sideAllowed(
      "recipe:sp-gfmore-slow-cooker-cheesy-creamed-greens",
      s.prefs,
      R,
    ),
    false,
  );
  assert.throws(() => C.setPlanSide(s, "p", "recipe:chicken-roast", R));
  assert.throws(() => C.setPlanSide(s, "p", "recipe:gf2-focaccia", R));
  assert.throws(() =>
    C.setPlanSide(s, "p", "recipe:sp-lovelemons-no-bake-protein-balls", R),
  );
});
test("every eligible side has usable quantities and may be attached without changing stock or reservations", () => {
  const sides = R.filter((r) => r.dishRole === "side" && !r.baking);
  assert.ok(sides.length >= 40);
  for (const r of sides) {
    const s = C.defaults();
    plan(s);
    C.setPlanSide(s, "p", "recipe:" + r.id, R);
    for (const n of [1, 2, 12]) {
      const quantities = C.sideIngredients(s.plans[0].side, n, R);
      assert.ok(quantities.length);
      for (const i of quantities) {
        assert.ok(I[i.id]);
        assert.ok(Number.isFinite(i.qty) && i.qty > 0, r.id);
      }
    }
    assert.equal(C.migrate(C.clone(s), R, I).plans[0].side, "recipe:" + r.id);
    assert.deepEqual(s.pantry, []);
    assert.deepEqual(s.lots, []);
  }
});

test("large valid pantries are not silently truncated when a backup is restored", () => {
  const s = C.defaults();
  stockAll(s);
  assert.ok(s.pantry.length > 1000);
  const restored = C.migrate(C.clone(s), R, I);
  assert.deepEqual(restored.pantry, s.pantry);
});
