const { test } = require("node:test"),
  assert = require("node:assert/strict");
for (const f of [
  "recipes",
  "batch-v3",
  "recipes-rated",
  "recipes-diverse",
  "recipes-expanded",
  "recipes-specialists",
])
  require("../" + f + ".js");
const before = JSON.parse(JSON.stringify(PLATES_DATA));
require("../catalogue-review.js");
require("../core-v3.js");
require("../phase1.js");
const C = require("../menus.js"),
  R = PLATES_DATA.recipes,
  I = PLATES_DATA.ingredients;
const find = (id) => R.find((r) => r.id === id);
test("review preserves all saved recipe identities, ratings, ingredients and existing plan quantities", () => {
  assert.equal(R.length, before.recipes.length);
  assert.deepEqual(I, before.ingredients);
  for (const old of before.recipes) {
    const r = find(old.id);
    assert.ok(r);
    assert.deepEqual(r.ingredients, old.ingredients, old.id);
    assert.deepEqual(r.source, old.source, old.id);
    assert.deepEqual(r.batch, old.batch, old.id);
    const s = C.defaults();
    s.plans = [
      {
        id: "old-plan",
        recipeId: old.id,
        date: "2026-09-28",
        meal: old.meals[0],
        servings: old.baking ? 48 : 12,
        side: "none",
        cooked: false,
      },
    ];
    const migrated = C.migrate(s, R, I);
    assert.equal(migrated.plans.length, 1, old.id);
    assert.equal(migrated.plans[0].servings, s.plans[0].servings, old.id);
    assert.deepEqual(
      C.requirements(migrated, R),
      C.requirements(s, before.recipes),
      old.id,
    );
  }
});
test("complete cakes and breakfast granola are available while accompaniments are marked separately", () => {
  assert.equal(find("sp-skinnytaste-air-fryer-radishes").dishRole, "side");
  assert.equal(find("sp-lovelemons-roasted-cauliflower").dishRole, "side");
  assert.equal(find("sp-recipetineats-asian-slaw").dishRole, "side");
  const cake = find("sp-sally-peach-bundt-cake-with-brown-butter-icing");
  assert.equal(cake.dishRole, undefined);
  assert.ok(cake.meals.includes("Dessert"));
  assert.equal(find("sp-sally-vanilla-almond-granola").dishRole, undefined);
  assert.deepEqual(find("sp-sally-vanilla-almond-granola").meals, [
    "Breakfast",
  ]);
  assert.equal(
    find("sp-kingarthur-classic-puff-pastry-pate-feuilletee-recipe").dishRole,
    "component",
  );
  assert.deepEqual(find("gf2-focaccia").meals, ["Baking"]);
  assert.ok(
    find("sp-sally-mushroom-puff-pastry-tarts").meals.includes("Baking"),
  );
  assert.ok(
    !find("sp-sally-mushroom-puff-pastry-tarts").meals.includes("Dessert"),
  );
});
test("microwave recipes and savoury Korean meals use the right filter and preserve old saved menu yields", () => {
  const s = C.defaults();
  for (const id of [
    "sp-gfmore-microwave-chilli",
    "sp-gfmore-microwave-macaroni-cheese",
  ]) {
    const r = find(id);
    assert.ok(
      C.matching(
        r,
        { ...s.filters, meal: "Dinner", time: "any", method: "microwave" },
        s,
        R,
        I,
      ),
    );
    assert.equal(
      C.matching(
        r,
        { ...s.filters, meal: "Dinner", time: "any", method: "hob" },
        s,
        R,
        I,
      ),
      false,
    );
  }
  for (const id of [
    "gf2-tteokbokki-spicy-rice-cakes",
    "gf2-spicy-kimchi-pancake-kimchi-jeon",
  ]) {
    const r = find(id);
    assert.equal(r.baking, false);
    assert.ok(!r.tags.includes("baking"));
    assert.equal(r.method, "hob");
    assert.ok(r.meals.includes("Lunch"));
    assert.ok(!r.meals.includes("Dessert"));
    const state = C.defaults();
    state.plans = [
      {
        id: "old",
        recipeId: id,
        date: "2026-09-28",
        meal: "Baking",
        servings: 48,
        side: "none",
        cooked: false,
      },
    ];
    const m = C.saveMenu(state, "Old bake", "2026-09-28", "all", R);
    const restored = C.migrate(state, R, I);
    const copies = C.applyMenu(restored, m.id, "2026-10-05", null, R);
    assert.equal(copies[0].servings, 48);
    assert.equal(C.migrate(restored, R, I).plans.length, 2);
  }
  // Slow cooking in an oven must not acquire a slow-cooker appliance requirement.
  assert.equal(
    find("sp-gfmore-slow-cooked-pork-cider-sage-hotpot").method,
    "oven-hob",
  );
});
