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

test("reviewed no-bake recipes match their actual preparation and retain heat requirements", () => {
  const s = C.defaults();
  const checks = {
    "sp-lovelemons-no-bake-protein-balls": "no-cook",
    "sp-sally-chocolate-peanut-butter-no-bake-cookies": "hob",
    "sp-sally-mini-no-bake-cheesecakes": "no-cook",
    "sp-sally-no-bake-cheesecake": "no-cook",
    "sp-sally-no-bake-pumpkin-cheesecake": "no-cook",
    "gf2-no-bake-pbj-cheesecake-squares": "no-cook",
    "gf2-lemon-cheesecake": "hob",
    "sp-sally-pumpkin-pie-in-a-jar": "hob",
  };
  for (const [id, method] of Object.entries(checks)) {
    const r = find(id);
    const f = { ...s.filters, meal: r.meals[0], time: "any", method };
    assert.equal(C.matching(r, f, s, R, I), true, id);
    assert.equal(C.matching(r, { ...f, method: "oven" }, s, R, I), false, id);
  }
  assert.match(
    find("sp-sally-mini-no-bake-cheesecakes").methodNote,
    /optional/,
  );
  assert.match(find("sp-sally-no-bake-cheesecake").methodNote, /Melted butter/);
  assert.match(find("gf2-no-bake-pbj-cheesecake-squares").methodNote, /kettle/);
});

test("longer-time filter includes additional chilling or proving without admitting quick meals", () => {
  const s = C.defaults();
  for (const id of [
    "gf2-lemon-cheesecake",
    "gf2-no-bake-pbj-cheesecake-squares",
    "gf2-focaccia",
  ]) {
    const r = find(id),
      f = { ...s.filters, meal: r.meals[0], method: "any" };
    assert.equal(C.matching(r, { ...f, time: "long" }, s, R, I), true, id);
    assert.equal(C.matching(r, { ...f, time: "30" }, s, R, I), false, id);
  }
  const quick = find("pesto-pea-pasta");
  assert.equal(
    C.matching(quick, { ...s.filters, meal: "Dinner", time: "long" }, s, R, I),
    false,
  );
});

test("reviewed animal ingredients exclude eleven recipes from vegetarian and vegan discovery", () => {
  const meat = [
    "gf2-air-fryer-crispy-chilli-beef",
    "gf2-korean-style-fried-rice",
    "sp-gfmore-deli-pasta-salad",
    "sp-gfmore-healthy-ragu",
    "sp-sally-my-favorite-pepperoni-pizza-dip",
    "sp-kingarthur-flaky-pastry-recipe",
    "sp-kingarthur-strawberry-filled-angel-food-cake-recipe",
  ];
  const fish = [
    "sp-sally-easy-coconut-shrimp",
    "sp-skinnytaste-scallops-grapefruit-arugula-and-spinach",
    "sp-skinnytaste-shrimp-piccata-foil-packets",
    "sp-skinnytaste-shrimp-tacos",
  ];
  for (const id of [...meat, ...fish]) {
    const r = find(id),
      s = C.defaults();
    assert.equal(r.kind, meat.includes(id) ? "meat" : "fish", id);
    for (const diet of ["vegan", "vegetarian"])
      assert.equal(C.foodAllowed(r, { ...s.prefs, diet }), false, id);
    assert.equal(
      C.foodAllowed(r, { ...s.prefs, diet: "pescatarian" }),
      fish.includes(id),
      id,
    );
    assert.equal(C.foodAllowed(r, s.prefs), true, id);
  }
});
