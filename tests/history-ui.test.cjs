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
function batchRecords(s, C, count = 1002) {
  for (let n = 0; n < count; n++) {
    const date = C.addDays('2020-01-01', n), cookedAt = date + 'T12:00:00.000Z';
    s.batches.push({id:'batch'+n, recipeId:'prep-bolognese', date, servings:2, cooked:true, cookedAt, allocation:{eat:0,fridge:0,freezer:2}});
    s.lots.push({id:'lot'+n, batchId:'batch'+n, recipeId:'prep-bolognese', portions:0, capacity:2, consumed:0, location:'freezer', cookedAt, frozenAt:date+'T12:10:00.000Z', thawedAt:null, thawStartedAt:null});
  }
}
test('batch and empty-portion histories page and search all records without deleting data', (t) => {
  for (const key of ['batch', 'empty']) {
    const a=app(batchRecords); t.after(()=>a.dom.window.close());
    route(a,key==='batch'?'batch':'pantry');
    if(key==='empty')a.q('[data-act="pantry-tab"][data-id="prepared"]').click();
    const saved=a.w.localStorage.getItem('three-plates-v3');
    const panel='#'+key+'-archive';
    assert.equal(a.w.document.querySelectorAll(panel+' .archive-record').length,20);
    assert.equal(a.q(panel+' .archive-record').dataset.archiveId,key==='batch'?'batch1001':'lot1001');
    a.q(panel).open=true;
    a.q(panel+' [data-act="archive-more"]').click();
    assert.equal(a.w.document.querySelectorAll(panel+' .archive-record').length,40);
    assert.equal(a.w.document.activeElement.dataset.archiveId,key==='batch'?'batch981':'lot981');
    a.q('#'+key+'-archive-search').value='2020-01-01';
    a.q(panel+' form').dispatchEvent(new a.w.Event('submit',{bubbles:true,cancelable:true}));
    assert.equal(a.w.document.querySelectorAll(panel+' .archive-record').length,1);
    assert.equal(a.q(panel+' .archive-record').dataset.archiveId,key==='batch'?'batch0':'lot0');
    assert.equal(a.w.document.activeElement.id,key+'-archive-search');
    assert.ok(a.q(panel+' [data-act="recipe"]'));
    a.q(panel+' [data-act="recipe"]').click();
    assert.match(a.q('#sheet').textContent,key==='batch'?/Cooked batch/:/Original cooked batch/);
    assert.match(a.q('#sheet').textContent,/2 portions/);
    a.q('#sheet [data-act="close"]').click();
    a.q(panel+' [data-act="archive-clear"]').click();
    assert.equal(a.w.document.querySelectorAll(panel+' .archive-record').length,20);
    assert.equal(a.w.localStorage.getItem('three-plates-v3'),saved);
  }
});
function purchases(s, C, count = 1101) {
  for (let n = 0; n < count; n++) s.purchaseHistory.push({
    id: 'purchase' + n, ingredientId: 'pasta', qty: 500, unit: 'g',
    retailer: n === 0 ? 'Aldi' : 'Tesco', pack: null,
    purchasedAt: C.addDays('2020-01-01', n) + 'T12:00:00.000Z',
    status: n === 0 ? 'corrected' : 'stocked',
  });
}
test('an older empty record can reopen its recipe and restore a mistaken discard without deducting ingredients', (t) => {
  const a=app((s,C)=>batchRecords(s,C,25)); t.after(()=>a.dom.window.close());
  route(a,'pantry'); a.q('[data-act="pantry-tab"][data-id="prepared"]').click();
  a.q('#empty-archive').open=true;
  a.q('#empty-archive-search').value='2020-01-01';
  a.q('#empty-archive-form').dispatchEvent(new a.w.Event('submit',{bubbles:true,cancelable:true}));
  a.q('#empty-archive [data-act="recipe"]').click();
  assert.match(a.q('#sheet').textContent,/2 portions/);
  assert.equal(a.q('#sheet [data-act="batch-add"]'),null);
  a.q('#sheet [data-act="close"]').click();
  a.q('#empty-archive [data-act="lot-correct"]').click();
  a.q('#lot-count').value='1';
  a.q('#lot-correction-form').dispatchEvent(new a.w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(a.state().lots.find(x=>x.id==='lot0').portions,1);
  assert.deepEqual(a.state().pantry,[]);
  assert.equal(a.state().batches.length,25);
  assert.match(a.q('#empty-archive').textContent,/No records match/);
  assert.ok(a.q('.prepared-grid [data-id="lot0"]'));
});
test('purchase history pages all saved records without changing stock or persistence', (t) => {
  const a = app(purchases); t.after(() => a.dom.window.close()); route(a, 'shop');
  const saved = a.w.localStorage.getItem('three-plates-v3');
  assert.equal(a.w.document.querySelectorAll('.purchase-record').length, 20);
  assert.equal(a.q('.purchase-record').dataset.purchaseId, 'purchase1100');
  a.q('#purchase-history').open = true;
  a.q('[data-act="purchase-more"]').click();
  assert.equal(a.w.document.querySelectorAll('.purchase-record').length, 40);
  assert.equal(a.w.document.activeElement.dataset.purchaseId, 'purchase1080');
  assert.equal(a.q('#purchase-history').open, true);
  assert.equal(a.w.localStorage.getItem('three-plates-v3'), saved);
});
test('purchase search reaches older records by shop, date, ingredient and status', (t) => {
  const a = app(purchases); t.after(() => a.dom.window.close()); route(a, 'shop');
  a.q('#purchase-history').open = true;
  const saved = a.w.localStorage.getItem('three-plates-v3');
  for (const query of ['Aldi pasta', '2020-01-01', 'Replaced by correction']) {
    a.q('#purchase-search').value = query;
    a.q('#purchase-search-form').dispatchEvent(new a.w.Event('submit', {bubbles:true,cancelable:true}));
    assert.equal(a.w.document.querySelectorAll('.purchase-record').length, 1);
    assert.equal(a.q('.purchase-record').dataset.purchaseId, 'purchase0');
    assert.equal(a.w.document.activeElement.id, 'purchase-search');
  }
  a.q('#purchase-search').value = 'no matching purchase';
  a.q('#purchase-search-form').dispatchEvent(new a.w.Event('submit', {bubbles:true,cancelable:true}));
  assert.match(a.q('#purchase-history').textContent, /No purchases match/);
  a.q('[data-act="purchase-clear"]').click();
  assert.equal(a.w.document.querySelectorAll('.purchase-record').length, 20);
  assert.equal(a.w.document.activeElement.id, 'purchase-search');
  assert.equal(a.w.localStorage.getItem('three-plates-v3'), saved);
});
test('the last purchase page removes its load button and preserves focus on the first added record', (t) => {
  const a = app((s, C) => purchases(s, C, 45)); t.after(() => a.dom.window.close()); route(a, 'shop');
  a.q('#purchase-history').open = true;
  a.q('[data-act="purchase-more"]').click();
  a.q('[data-act="purchase-more"]').click();
  assert.equal(a.w.document.querySelectorAll('.purchase-record').length, 45);
  assert.equal(a.q('[data-act="purchase-more"]'), null);
  assert.equal(a.w.document.activeElement.dataset.purchaseId, 'purchase4');
});
function route(a, name) {
  a.w.location.hash = name;
  a.w.dispatchEvent(new a.w.HashChangeEvent("hashchange"));
}
function meals(s, C, count = 45) {
  for (let n = 0; n < count; n++)
    s.plans.push({
      id: "meal" + n,
      recipeId: "pesto-pea-pasta",
      date: C.addDays("2025-01-01", n),
      meal: "Dinner",
      serveTime: "18:30",
      servings: 2,
      kind: "cook",
      lotId: null,
      side: "none",
      cooked: true,
    });
}
test("finished history initially renders only twenty newest records and older meals keep focus and saved data", () => {
  const a = app((s, C) => meals(s, C, 1101));
  route(a, "plan");
  const before = a.w.localStorage.getItem("three-plates-v3");
  assert.equal(a.w.document.querySelectorAll(".finished-record").length, 20);
  assert.equal(a.q(".finished-record").dataset.historyId, "meal1100");
  a.q("#finished-history").open = true;
  a.q('[data-act="finished-more"]').focus();
  a.q('[data-act="finished-more"]').click();
  assert.equal(a.w.document.querySelectorAll(".finished-record").length, 40);
  assert.equal(a.w.document.activeElement.dataset.historyId, "meal1080");
  assert.equal(a.q("#finished-history").open, true);
  assert.equal(a.w.localStorage.getItem("three-plates-v3"), before);
  a.dom.window.close();
});
test("finished-meal search reaches records outside the rendered page and can clear without deleting history", () => {
  const a = app(meals);
  route(a, "plan");
  a.q("#finished-history").open = true;
  a.q("#finished-search").value = "2025-01-01";
  a.q("#finished-search-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(a.w.document.querySelectorAll(".finished-record").length, 1);
  assert.equal(a.q(".finished-record").dataset.historyId, "meal0");
  assert.equal(a.w.document.activeElement.id, "finished-search");
  a.q('[data-act="finished-clear"]').click();
  assert.equal(a.w.document.querySelectorAll(".finished-record").length, 20);
  assert.equal(a.state().plans.length, 45);
  a.dom.window.close();
});
test("modal close returns to the recreated opener after a save rerenders its page", () => {
  const a = app((s, C) => meals(s, C, 1));
  route(a, "plan");
  a.q("#finished-history").open = true;
  const opener = a.q('[data-act="recipe"]');
  opener.focus();
  opener.click();
  assert.equal(a.w.document.activeElement.dataset.act, "close");
  // A data update can rerender the page behind an open dialog.
  a.w.dispatchEvent(
    new a.w.StorageEvent("storage", {
      key: "three-plates-v3",
      newValue: a.original,
    }),
  );
  assert.equal(opener.isConnected, false);
  a.q('[data-act="close"]').click();
  assert.equal(a.w.document.activeElement.dataset.act, "recipe");
  assert.equal(a.w.document.activeElement.dataset.record, "meal0");
  a.dom.window.close();
});
test("native dialog close returns keyboard focus and a new dialog focuses its Close button", () => {
  const a = app();
  route(a, "plan");
  const opener = a.q('[data-act="prep"]');
  opener.focus();
  opener.click();
  a.q("#sheet").close();
  assert.equal(a.w.document.activeElement, opener);
  route(a, "you");
  const reset = a.q('[data-act="reset"]');
  reset.focus();
  reset.click();
  assert.equal(a.w.document.activeElement.dataset.act, "close");
  a.q("#sheet").close();
  assert.equal(a.w.document.activeElement, reset);
  a.dom.window.close();
});
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

test("damaged food preferences pause saves and leave the original saved text untouched", () => {
  const a = app((s) => {
    s.prefs.exclusions = ["missing-food"];
  });
  assert.match(a.q("main").textContent, /saving is paused/i);
  a.q("#slow-cooker").click();
  assert.equal(a.w.localStorage.getItem("three-plates-v3"), a.original);
  a.dom.window.close();
});

test("restore refuses damaged preferences and packs before offering replacement", async () => {
  for (const patch of [
    { prefs: { exclusions: ["missing-food"] } },
    { packs: { Tesco: { rice: { size: -1 } } } },
  ]) {
    const a = app((s) => {
      s.pantry = [{ id: "rice", qty: 500, always: false }];
    });
    const content = JSON.stringify({ ...a.state(), ...patch });
    Object.defineProperty(a.q("#backup-file"), "files", {
      value: [{ size: content.length, text: async () => content }],
    });
    a.q("#backup-file").dispatchEvent(
      new a.w.Event("change", { bubbles: true }),
    );
    await tick();
    assert.equal(a.q("#confirm-action"), null);
    assert.match(a.q("#toast").textContent, /Invalid/);
    assert.equal(a.w.localStorage.getItem("three-plates-v3"), a.original);
    a.dom.window.close();
  }
});
