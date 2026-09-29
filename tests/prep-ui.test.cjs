const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");
function app(saved) {
  const dom = new JSDOM(
      fs.readFileSync(path.join(root, "index.html"), "utf8"),
      {
        url: "https://ipodbob.github.io/Three-Plates/#plan",
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
  const s = saved || w.PlatesCore.defaults();
  if (!saved)
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
  w.localStorage.setItem("three-plates-v3", JSON.stringify(s));
  w.eval(fs.readFileSync(path.join(root, "app-v3.js"), "utf8"));
  const q = (s) => w.document.querySelector(s),
    click = (s) => {
      assert.ok(q(s), s);
      q(s).click();
    },
    state = () => JSON.parse(w.localStorage.getItem("three-plates-v3")),
    submit = () =>
      q("#prep-select-form").dispatchEvent(
        new w.Event("submit", { bubbles: true, cancelable: true }),
      );
  return { dom, w, q, click, state, submit };
}
function choose(a) {
  a.click('[data-act="prep"]');
  a.click('[value="plan:p1"]');
  a.click('[value="plan:p2"]');
  a.submit();
}
test("combined prep selection, exact recipe breakdown and ready checks survive reload", () => {
  let a = app();
  a.click('[data-act="prep"]');
  assert.equal(a.q("#prep-build").disabled, true);
  a.click('[value="plan:p1"]');
  a.click('[value="plan:p2"]');
  a.submit();
  assert.match(a.q("#prep-panel").textContent, /450 g/);
  const row = a.q('[data-prep-id="pasta"]').closest("section");
  assert.match(row.textContent, /180 g/);
  assert.match(row.textContent, /270 g/);
  a.click('[data-prep-id="pasta"]');
  assert.match(a.q("#prep-progress").textContent, /1 of 4/);
  const s = a.state();
  assert.deepEqual(s.pantry, []);
  assert.ok(s.plans.every((p) => !p.cooked));
  a.dom.window.close();
  a = app(s);
  a.click('[data-act="prep"]');
  assert.equal(a.q('[data-prep-id="pasta"]').checked, true);
  a.click('#prep-panel [data-act="cooking"]');
  assert.match(a.q("#sheet-title").textContent, /Cooking/);
  assert.equal(a.q('[data-cook-check="main:ingredient:0"]').checked, false);
  a.dom.window.close();
});
test("failed persistence leaves selection open and rolls back ready checks", () => {
  let a = app();
  a.click('[data-act="prep"]');
  a.click('[value="plan:p1"]');
  a.w.Storage.prototype.setItem = () => {
    throw Error("quota");
  };
  a.submit();
  assert.ok(a.q("#prep-select-form"));
  assert.deepEqual(a.state().prep.selected, []);
  a.dom.window.close();
  a = app();
  choose(a);
  a.w.Storage.prototype.setItem = () => {
    throw Error("quota");
  };
  a.click('[data-prep-id="pasta"]');
  assert.equal(a.q('[data-prep-id="pasta"]').checked, false);
  assert.deepEqual(a.state().prep.checked, []);
  a.dom.window.close();
});
test("changed quantities uncheck affected prep rows and clear checks requires confirmation", () => {
  let a = app();
  choose(a);
  a.click('[data-prep-id="pasta"]');
  const s = a.state();
  s.plans[0].servings = 4;
  a.dom.window.close();
  a = app(s);
  a.click('[data-act="prep"]');
  assert.match(a.q("#prep-panel").textContent, /630 g/);
  assert.match(a.q("#prep-panel").textContent, /plan changed/);
  assert.equal(a.q('[data-prep-id="pasta"]').checked, false);
  a.click('[data-prep-id="pasta"]');
  a.click('[data-act="prep-reset"]');
  a.click('.sheet [data-act="close"]');
  assert.equal(a.state().prep.checked.length, 1);
  a.click('[data-act="prep"]');
  a.click('[data-act="prep-reset"]');
  a.click("#confirm-action");
  assert.equal(a.state().prep.checked.length, 0);
  assert.equal(a.state().prep.selected.length, 2);
  a.dom.window.close();
});
test("meal search hides irrelevant choices while preserving selected recipes", () => {
  const a = app();
  a.click('[data-act="prep"]');
  a.click('[value="plan:p1"]');
  a.q("#prep-search").value = "30 Sept";
  a.q("#prep-search").dispatchEvent(new a.w.Event("input", { bubbles: true }));
  assert.equal(a.q('[value="plan:p1"]').closest("label").hidden, true);
  assert.equal(a.q('[value="plan:p2"]').closest("label").hidden, false);
  a.submit();
  assert.deepEqual(a.state().prep.selected, ["plan:p1"]);
  a.dom.window.close();
});

test('prep search matches reordered words and exposes selected meals outside the results', () => {
 const a=app(); a.click('[data-act="prep"]'); a.click('[value="plan:p1"]');
 const search=(value)=>{a.q('#prep-search').value=value;a.q('#prep-search').dispatchEvent(new a.w.Event('input',{bubbles:true}));};
 search('pasta pesto 2026-09-30');
 assert.equal(a.q('[value="plan:p2"]').closest('label').hidden,false);
 assert.equal(a.q('[value="plan:p1"]').closest('label').hidden,true);
 assert.match(a.q('#prep-selection-count').textContent,/1 selected.*1 hidden by search/);
 assert.equal(a.q('#prep-search-clear').hidden,false);
 search('nothing matches'); assert.equal(a.q('#prep-no-meals').hidden,false);
 a.click('#prep-search-clear'); assert.equal(a.q('#prep-search').value,'');
 assert.equal(a.w.document.activeElement.id,'prep-search');
 assert.equal(a.q('[value="plan:p1"]').checked,true);
 assert.equal(a.q('[value="plan:p1"]').closest('label').hidden,false);
 a.submit(); assert.deepEqual(a.state().prep.selected,['plan:p1']);
 a.dom.window.close();
});

test('prep ingredient search accepts reordered terms without losing ready checks',()=>{
 const a=app();choose(a);a.click('[data-prep-id="peas"]');
 a.q('#prep-ingredient-search').value='peas frozen';a.q('#prep-ingredient-search').dispatchEvent(new a.w.Event('input',{bubbles:true}));
 assert.equal(a.q('[data-prep-id="peas"]').closest('.prep-item').hidden,false);
 assert.equal(a.q('[data-prep-id="pasta"]').closest('.prep-item').hidden,true);
 assert.equal(a.q('[data-prep-id="peas"]').checked,true);assert.equal(a.q('#prep-no-matches').hidden,true);
 const saved=a.state();a.dom.window.close();const b=app(saved);b.click('[data-act="prep"]');assert.equal(b.q('[data-prep-id="peas"]').checked,true);b.dom.window.close();
});
