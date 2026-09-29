const { test } = require("node:test"),
  assert = require("node:assert/strict");
for (const f of [
  "recipes",
  "batch-v3",
  "core-v3",
  "phase1",
  "menus",
  "cooking",
])
  require("../" + f + ".js");
const C = require("../prep.js"),
  R = PLATES_DATA.recipes,
  I = PLATES_DATA.ingredients;
function plans(s, count) {
  for (let n = 0; n < count; n++)
    s.plans.push({
      id: "meal" + n,
      recipeId: "pesto-pea-pasta",
      date: C.addDays("2023-01-01", n),
      meal: "Dinner",
      serveTime: "18:30",
      servings: 2,
      kind: "cook",
      side: "none",
      lotId: null,
      cooked: n < count - 1,
    });
}
test("more than 500 scanned custom products retain every pantry amount and purchase after reload", () => {
  const s = C.defaults();
  for (let n = 0; n < 601; n++) {
    const id = "custom-product" + n;
    s.custom[id] = { id, name: "Product " + n, unit: "g", group: "Other" };
    s.pantry.push({ id, qty: n + 1, always: false });
  }
  s.bought = { "custom-product600": 500 };
  s.purchaseHistory = [
    {
      id: "purchase",
      ingredientId: "custom-product600",
      qty: 500,
      unit: "g",
      retailer: "none",
      status: "pending",
      purchasedAt: "2026-09-29T00:00:00Z",
      pack: null,
    },
  ];
  const restored = C.migrate(C.clone(s), R, I);
  assert.deepEqual(restored.custom, s.custom);
  assert.deepEqual(restored.pantry, s.pantry);
  assert.deepEqual(restored.bought, s.bought);
  assert.equal(restored.purchaseHistory[0].ingredientId, "custom-product600");
});
test("more than 1000 meals preserve history, current shopping, cooking progress and prep selection", () => {
  const s = C.defaults();
  plans(s, 1101);
  s.plans.at(-1).side = "rice";
  const view = C.cookingView(s, "plan", "meal1100", R);
  C.checkCooking(s, view, "main:ingredient:0", true);
  C.addCookingTimer(s, view, "Pasta", 10);
  C.selectPrep(s, ["plan:meal1100"], R);
  const restored = C.migrate(C.clone(s), R, I);
  assert.deepEqual(restored.plans, s.plans);
  assert.deepEqual(C.requirements(restored, R), C.requirements(s, R));
  assert.deepEqual(restored.cooking, s.cooking);
  assert.deepEqual(restored.prep, s.prep);
  assert.equal(restored.plans.filter((p) => p.cooked).length, 1100);
});
test("more than 1000 batch containers retain capacity, consumed history and a late reservation", () => {
  const s = C.defaults();
  for (let n = 0; n < 1002; n++) {
    s.batches.push({
      id: "batch" + n,
      recipeId: "prep-bolognese",
      date: "2026-09-29",
      servings: 2,
      cooked: true,
      cookedAt: "2026-09-29T00:00:00.000Z",
      allocation: { eat: 0, fridge: 0, freezer: 2 },
    });
    s.lots.push({
      id: "lot" + n,
      batchId: "batch" + n,
      recipeId: "prep-bolognese",
      portions: n === 1001 ? 2 : 0,
      capacity: 2,
      consumed: n === 1001 ? 0 : 2,
      location: "freezer",
      cookedAt: "2026-09-29T00:00:00.000Z",
      frozenAt: "2026-09-29T00:10:00.000Z",
      thawedAt: null,
      thawStartedAt: null,
    });
  }
  s.plans.push({
    id: "late",
    recipeId: "prep-bolognese",
    date: "2026-09-30",
    meal: "Dinner",
    serveTime: "18:30",
    servings: 2,
    kind: "stored",
    lotId: "lot1001",
    side: "rice",
    cooked: false,
  });
  const restored = C.migrate(C.clone(s), R, I);
  assert.deepEqual(restored.batches, s.batches);
  assert.deepEqual(restored.lots, s.lots);
  assert.equal(C.reserved(restored, "lot1001"), 2);
  assert.deepEqual(C.requirements(restored, R), { rice: 150 });
});
test("copying a menu past 1000 historical meals does not require deleting history", () => {
  const s = C.defaults();
  plans(s, 1000);
  s.menus.push({
    id: "week",
    name: "Lunch",
    entries: [
      {
        day: 0,
        meal: "Lunch",
        recipeId: "pesto-pea-pasta",
        servings: 2,
        side: "none",
        serveTime: "12:30",
      },
    ],
  });
  const old = C.clone(s.plans);
  C.applyMenu(s, "week", "2027-01-01", null, R);
  assert.equal(s.plans.length, 1001);
  assert.deepEqual(s.plans.slice(0, 1000), old);
  assert.equal(C.migrate(C.clone(s), R, I).plans.length, 1001);
});
test("damaged v3 food and meal records fail restoration instead of silently disappearing", () => {
  const original = C.defaults();
  plans(original, 2);
  for (const mutate of [
    (s) => (s.plans[1].recipeId = "missing"),
    (s) => s.plans.push({ ...s.plans[0] }),
    (s) => (s.pantry = [{ id: "missing", qty: 10, always: false }]),
    (s) => (s.custom = { "custom-x": { name: "X", unit: "invalid" } }),
    (s) => (s.bought = { pasta: -1 }),
    (s) => (s.custom = []),
    (s) => (s.bought = []),
  ]) {
    const bad = C.clone(original);
    mutate(bad);
    const before = C.clone(bad);
    assert.throws(
      () => C.migrate(bad, R, I),
      /Original data has not been replaced/,
    );
    assert.deepEqual(bad, before);
  }
});
