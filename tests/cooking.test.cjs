const { test } = require("node:test"),
  assert = require("node:assert/strict");
require("../recipes.js");
require("../batch-v3.js");
require("../core-v3.js");
require("../phase1.js");
require("../menus.js");
const C = require("../cooking.js"),
  R = PLATES_DATA.recipes,
  I = PLATES_DATA.ingredients;
const now = Date.parse("2026-09-29T12:00:00Z");
function setup() {
  const s = C.defaults();
  s.plans.push({
    id: "meal1",
    kind: "cook",
    recipeId: "pesto-pea-pasta",
    date: "2026-09-29",
    meal: "Dinner",
    servings: 2,
    side: "rice",
    cooked: false,
    serveTime: "18:30",
  });
  return s;
}
test("cooking checks and timers roundtrip without altering stock, purchases, menus or plans", () => {
  const s = setup();
  s.pantry = [{ id: "pasta", qty: 500, always: false }];
  s.bought = { rice: 1000 };
  const before = JSON.stringify({ ...s, cooking: {} });
  const v = C.cookingView(s, "plan", "meal1", R);
  assert.equal(v.groups.length, 2);
  assert.equal(v.groups[0].ingredients.find((i) => i.id === "pasta").qty, 180);
  C.checkCooking(s, v, v.groups[0].ingredients[0].key, true);
  C.checkCooking(s, v, v.groups[0].steps[0].key, true);
  C.addCookingTimer(s, v, "Pasta", 10, now);
  assert.equal(JSON.stringify({ ...s, cooking: {} }), before);
  const restored = C.migrate(C.clone(s), R, I);
  assert.deepEqual(restored.cooking, s.cooking);
  assert.equal(
    C.timerRemaining(restored.cooking[v.key].timers[0], now + 600000),
    0,
  );
  assert.equal(C.defaults().cooking.constructor, Object);
  assert.deepEqual(
    C.migrate({ ...setup(), cooking: undefined }, R, I).cooking,
    {},
  );
});
test("timers pause, survive reload, resume against wall time and reject invalid values", () => {
  const s = setup(),
    v = C.cookingView(s, "plan", "meal1", R);
  C.addCookingTimer(s, v, "", 10, now);
  const t = s.cooking[v.key].timers[0];
  C.changeCookingTimer(s, v, t.id, "pause", now + 120000);
  assert.equal(t.remaining, 480000);
  assert.equal(C.timerRemaining(t, now + 900000), 480000);
  C.changeCookingTimer(s, v, t.id, "resume", now + 900000);
  assert.equal(C.timerRemaining(t, now + 960000), 420000);
  const before = JSON.stringify(s);
  for (const n of [0, -1, 721, 1.5, NaN])
    assert.throws(() => C.addCookingTimer(s, v, "x", n, now));
  assert.equal(JSON.stringify(s), before);
  C.changeCookingTimer(s, v, t.id, "remove", now);
  assert.equal(s.cooking[v.key].timers.length, 0);
});
test("changed portions invalidate the checklist and explicit restart leaves stock untouched", () => {
  const s = setup();
  let v = C.cookingView(s, "plan", "meal1", R);
  C.checkCooking(s, v, v.groups[0].steps[0].key, true);
  C.addCookingTimer(s, v, "test", 1, now);
  s.plans[0].servings = 3;
  v = C.cookingView(s, "plan", "meal1", R);
  assert.equal(v.stale, true);
  assert.throws(
    () => C.checkCooking(s, v, v.groups[0].steps[0].key, true),
    /changed/,
  );
  C.restartCooking(s, v);
  assert.equal(C.cookingView(s, "plan", "meal1", R).stale, false);
  assert.deepEqual(s.cooking[v.key].checked, []);
  assert.deepEqual(s.cooking[v.key].timers, []);
  s.plans[0].cooked = true;
  assert.throws(() => C.cookingView(s, "plan", "meal1", R), /finished/);
});
test("stored meals exclude cooked main ingredients; publisher methods remain external", () => {
  const s = setup();
  s.plans[0].kind = "stored";
  let v = C.cookingView(s, "plan", "meal1", R);
  assert.equal(v.groups.length, 1);
  assert.equal(v.groups[0].ingredients[0].id, "rice");
  const r = {
    ...R[0],
    id: "external",
    source: { publisher: "Example", url: "https://example.org/recipe" },
    steps: ["Do not copy this"],
  };
  s.plans[0].kind = "cook";
  s.plans[0].recipeId = r.id;
  v = C.cookingView(s, "plan", "meal1", [r, ...R]);
  assert.deepEqual(v.groups[0].steps, []);
  assert.equal(v.groups[0].methodKey, "main:method");
  C.checkCooking(s, v, "main:method", true);
  assert.throws(() => C.checkCooking(s, v, "main:step:0", true));
});
test("malformed progress fails restoration instead of replacing existing data", () => {
  const s = setup(),
    v = C.cookingView(s, "plan", "meal1", R);
  C.addCookingTimer(s, v, "A", 1, now);
  for (const mutate of [
    (s) => (s.cooking = []),
    (s) => (s.cooking[v.key].checked = ["<script>"]),
    (s) => (s.cooking[v.key].timers[0].endAt = "bad"),
    (s) => (s.cooking[v.key].timers[0].remaining = -1),
    (s) => s.cooking[v.key].timers.push(s.cooking[v.key].timers[0]),
  ]) {
    const bad = C.clone(s);
    mutate(bad);
    assert.throws(() => C.migrate(bad, R, I), /progress/);
  }
});
test("batch checklist uses all planned portions and cannot consume pantry stock", () => {
  const s = setup(),
    r = R.find((r) => r.batch);
  s.batches.push({
    id: "batch1",
    recipeId: r.id,
    date: "2026-09-29",
    servings: 8,
    cooked: false,
  });
  const v = C.cookingView(s, "batch", "batch1", R);
  assert.deepEqual(
    v.groups[0].ingredients.map(({ key, ...i }) => i),
    C.scaled(r, 8),
  );
  for (let n = 0; n < 8; n++) C.addCookingTimer(s, v, "Timer " + n, 1, now);
  assert.throws(() => C.addCookingTimer(s, v, "Too many", 1, now), /eight/);
  assert.deepEqual(s.pantry, []);
  assert.equal(s.batches[0].cooked, false);
});
