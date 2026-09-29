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
function setup() {
  const s = C.defaults();
  for (let n = 1; n <= 2; n++)
    s.plans.push({
      id: "p" + n,
      recipeId: "pesto-pea-pasta",
      kind: "cook",
      date: "2026-09-" + (28 + n),
      meal: "Dinner",
      serveTime: "18:30",
      servings: n + 1,
      side: "none",
      cooked: false,
    });
  return s;
}
test("combined prep totals shared ingredients and preserves individual portions without stock changes", () => {
  const s = setup();
  s.pantry = [{ id: "pasta", qty: 1000, always: false }];
  s.bought = { peas: 1000 };
  const before = C.clone(s);
  C.selectPrep(s, ["plan:p1", "plan:p2"], R);
  let v = C.prepView(s, R),
    pasta = v.items.find((i) => i.id === "pasta");
  assert.equal(pasta.qty, 450);
  assert.deepEqual(
    pasta.parts.map((p) => p.qty),
    [180, 270],
  );
  C.checkPrep(s, "pasta", true, pasta.signature, R);
  assert.equal(
    C.prepView(s, R).items.find((i) => i.id === "pasta").checked,
    true,
  );
  assert.deepEqual({ ...s, prep: before.prep }, before);
  assert.deepEqual(C.migrate(C.clone(s), R, I).prep, s.prep);
});
test("selection order does not lose progress and changes only invalidate affected ingredients", () => {
  const s = setup();
  C.selectPrep(s, ["plan:p1", "plan:p2"], R);
  for (const i of C.prepView(s, R).items)
    C.checkPrep(s, i.id, true, i.signature, R);
  C.selectPrep(s, ["plan:p2", "plan:p1"], R);
  assert.ok(C.prepView(s, R).items.every((i) => i.checked));
  s.plans[0].side = "rice";
  let v = C.prepView(s, R);
  assert.equal(v.items.find((i) => i.id === "rice").checked, false);
  assert.equal(v.items.find((i) => i.id === "pasta").checked, true);
  s.plans[0].servings = 4;
  v = C.prepView(s, R);
  assert.equal(v.items.find((i) => i.id === "pasta").checked, false);
  assert.ok(v.outdated);
  assert.equal(v.items.find((i) => i.id === "pasta").qty, 630);
});
test("stored main ingredients are excluded while fresh side and uncooked batch are included", () => {
  const s = setup();
  s.plans[0].kind = "stored";
  s.plans[0].side = "rice";
  s.batches.push({
    id: "b",
    recipeId: "prep-bolognese",
    servings: 6,
    date: "2026-09-29",
    cooked: false,
  });
  C.selectPrep(s, ["plan:p1", "batch:b"], R);
  let v = C.prepView(s, R);
  assert.equal(
    v.items.some((i) => i.id === "pasta"),
    false,
  );
  assert.equal(v.items.find((i) => i.id === "rice").qty, 150);
  assert.ok(v.items.some((i) => i.id === "beef-mince"));
  assert.equal(v.chosen.length, 2);
  s.batches[0].cooked = true;
  v = C.prepView(s, R);
  assert.equal(
    v.items.some((i) => i.id === "beef-mince"),
    false,
  );
  assert.equal(v.missing.length, 1);
});
test("finishing or removing one meal updates totals and rejects a stale checkbox submission", () => {
  const s = setup();
  C.selectPrep(s, ["plan:p1", "plan:p2"], R);
  const row = C.prepView(s, R).items.find((i) => i.id === "pasta");
  C.checkPrep(s, row.id, true, row.signature, R);
  s.plans[0].cooked = true;
  const before = C.clone(s);
  assert.throws(
    () => C.checkPrep(s, row.id, true, row.signature, R),
    /quantities changed/,
  );
  assert.deepEqual(s, before);
  const v = C.prepView(s, R);
  assert.equal(v.items.find((i) => i.id === "pasta").qty, 270);
  assert.equal(v.items.find((i) => i.id === "pasta").checked, false);
  assert.deepEqual(v.missing, ["plan:p1"]);
});
test("invalid selections and malformed backups never replace valid data", () => {
  const s = setup();
  C.selectPrep(s, ["plan:p1"], R);
  const before = C.clone(s);
  for (const selected of [[], ["plan:missing"], ["plan:p1", "plan:p1"], null])
    assert.throws(() => C.selectPrep(s, selected, R));
  assert.deepEqual(s, before);
  for (const prep of [
    null,
    { selected: ["bad"], checked: [] },
    { selected: ["plan:p1"], checked: [{ id: "pasta", signature: 7 }] },
    { selected: ["plan:p1"], checked: [{ id: "unknown", signature: "x" }] },
  ])
    assert.throws(() => C.migrate({ ...s, prep }, R, I), /prep checklist/);
  const legacy = { ...s };
  delete legacy.prep;
  assert.deepEqual(C.migrate(legacy, R, I).prep, { selected: [], checked: [] });
});
test("saved cooking checks and timers stay independent from the combined prep checklist", () => {
  const s = setup(),
    v = C.cookingView(s, "plan", "p1", R);
  C.checkCooking(s, v, "main:ingredient:0", true);
  C.addCookingTimer(s, v, "Pasta", 10);
  const cooking = C.clone(s.cooking);
  C.selectPrep(s, ["plan:p1"], R);
  const row = C.prepView(s, R).items[0];
  C.checkPrep(s, row.id, true, row.signature, R);
  assert.deepEqual(s.cooking, cooking);
  assert.deepEqual(C.migrate(C.clone(s), R, I).cooking, cooking);
});
