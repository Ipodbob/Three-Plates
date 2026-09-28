const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");
function app(saved, setup = () => {}) {
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
  setup(w);
  for (const f of [
    "recipes.js",
    "batch-v3.js",
    "core-v3.js",
    "phase1.js",
    "menus.js",
    "cooking.js",
    "cooking-ui.js",
  ])
    w.eval(fs.readFileSync(path.join(root, f), "utf8"));
  const C = w.PlatesCore,
    s = saved || C.defaults();
  if (!saved)
    s.plans.push({
      id: "meal1",
      recipeId: "pesto-pea-pasta",
      kind: "cook",
      date: "2026-09-29",
      meal: "Dinner",
      servings: 2,
      side: "none",
      serveTime: "18:30",
      cooked: false,
    });
  w.localStorage.setItem("three-plates-v3", JSON.stringify(s));
  w.eval(fs.readFileSync(path.join(root, "app-v3.js"), "utf8"));
  const q = (s) => w.document.querySelector(s),
    click = (s) => {
      assert.ok(q(s), s);
      q(s).click();
    },
    state = () => JSON.parse(w.localStorage.getItem("three-plates-v3"));
  return { dom, w, q, click, state };
}
const tick = () => new Promise((r) => setImmediate(r));
test("expired timer alerts clear on removal and shortcuts focus their headings", () => {
  let a = app();
  a.click('[data-act="cooking"]');
  a.q("#cooking-timer-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  const s = a.state();
  s.cooking["plan:meal1"].timers[0].endAt = Date.now() - 1000;
  a.dom.window.close();
  a = app(s);
  a.w.HTMLElement.prototype.scrollIntoView = function () {};
  a.click('[data-act="cooking"]');
  assert.match(a.q("#cooking-alert").textContent, /time's up/);
  a.click('[data-cook="jump"][data-value="cook-timers-heading"]');
  assert.equal(a.w.document.activeElement.id, "cook-timers-heading");
  a.click('[data-cook="remove"]');
  assert.equal(a.q("#cooking-alert").textContent, "");
  a.dom.window.close();
});
test("a delayed close event from a replaced dialog cannot stop a reopened cooking timer", () => {
  const a = app();
  let poll;
  a.w.setInterval = (fn) => {
    poll = fn;
    return 99;
  };
  let cleared = false;
  a.w.clearInterval = () => {
    cleared = true;
  };
  a.click('[data-act="cooking"]');
  a.q("#sheet").dispatchEvent(new a.w.Event("close"));
  assert.equal(cleared, false);
  assert.equal(typeof poll, "function");
  a.click('[data-act="close"]');
  assert.equal(cleared, true);
  a.dom.window.close();
});
test("connected cooking mode saves checks and timers, resumes after reload and finishes via normal deduction once", () => {
  let a = app();
  a.click('[data-act="cooking"]');
  assert.match(a.q("#cooking-panel").textContent, /Get ingredients ready/);
  a.click('[data-cook-check="main:ingredient:0"]');
  a.click('[data-cook-check="main:step:0"]');
  a.q("#cooking-timer-label").value = "Pasta";
  a.q("#cooking-timer-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  let s = a.state();
  assert.equal(s.cooking["plan:meal1"].checked.length, 2);
  assert.equal(s.cooking["plan:meal1"].timers.length, 1);
  assert.equal(s.plans[0].cooked, false);
  a.dom.window.close();
  a = app(s);
  a.click('[data-act="cooking"]');
  assert.equal(a.q('[data-cook-check="main:step:0"]').checked, true);
  assert.match(a.q("#cooking-timers").textContent, /Pasta/);
  a.click('[data-cook="pause"]');
  assert.equal(a.state().cooking["plan:meal1"].timers[0].endAt, null);
  a.click('[data-cook="resume"]');
  assert.ok(a.state().cooking["plan:meal1"].timers[0].endAt);
  a.click('#cooking-panel [data-act="plan-finish"]');
  assert.match(a.q("#sheet").textContent, /deducted once/);
  a.click("#confirm-action");
  assert.equal(a.state().plans[0].cooked, true);
  assert.equal(a.q('[data-act="cooking"]'), null);
  a.dom.window.close();
});
test("failed persistence rolls back checkboxes and timer changes", () => {
  const a = app();
  a.click('[data-act="cooking"]');
  a.w.Storage.prototype.setItem = function () {
    throw Error("quota");
  };
  a.click('[data-cook-check="main:ingredient:0"]');
  assert.equal(a.q('[data-cook-check="main:ingredient:0"]').checked, false);
  assert.match(a.q("#toast").textContent, /cannot save/);
  a.q("#cooking-timer-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(a.q("[data-timer-clock]"), null);
  assert.deepEqual(a.state().cooking, {});
  a.dom.window.close();
});
test("changed portions require explicit checklist reset and use updated quantities", () => {
  let a = app();
  a.click('[data-act="cooking"]');
  a.click('[data-cook-check="main:ingredient:0"]');
  const s = a.state();
  s.plans[0].servings = 3;
  a.dom.window.close();
  a = app(s);
  a.click('[data-act="cooking"]');
  assert.match(a.q("#cooking-panel").textContent, /meal's portions/);
  assert.equal(a.q("[data-cook-check]"), null);
  a.click('[data-cook="restart"]');
  a.click("#confirm-action");
  assert.match(a.q("#cooking-panel").textContent, /270 g/);
  assert.equal(a.q("[data-cook-check]").checked, false);
  a.dom.window.close();
});
test("wake lock handles unsupported and denied devices without blocking cooking", async () => {
  for (const setup of [
    () => {},
    (w) =>
      Object.defineProperty(w.navigator, "wakeLock", {
        value: {
          request: async () => {
            throw Error("denied");
          },
        },
      }),
  ]) {
    const a = app(undefined, setup);
    a.click('[data-act="cooking"]');
    a.click('[data-cook="wake"]');
    await tick();
    assert.match(a.q("#wake-status").textContent, /phone's screen timeout/);
    a.click("[data-cook-check]");
    assert.equal(a.q("[data-cook-check]").checked, true);
    a.dom.window.close();
  }
});
test("late wake-lock grant is released after closing cooking mode", async () => {
  let resolve,
    release = 0;
  const a = app(undefined, (w) =>
    Object.defineProperty(w.navigator, "wakeLock", {
      value: { request: () => new Promise((r) => (resolve = r)) },
    }),
  );
  a.click('[data-act="cooking"]');
  a.click('[data-cook="wake"]');
  a.click('[data-act="close"]');
  resolve({ release: async () => release++ });
  await tick();
  assert.equal(release, 1);
  a.dom.window.close();
});
test("wake lock releases on close and is reacquired on returning from a hidden tab", async () => {
  let requests = 0,
    releases = 0,
    visible = "visible",
    releaseListener,
    lock;
  const a = app(undefined, (w) => {
    Object.defineProperty(w.document, "visibilityState", {
      get: () => visible,
    });
    Object.defineProperty(w.navigator, "wakeLock", {
      value: {
        request: async () => {
          requests++;
          return (lock = {
            released: false,
            addEventListener: (type, fn) => (releaseListener = fn),
            release: async () => {
              releases++;
              lock.released = true;
              releaseListener?.();
            },
          });
        },
      },
    });
  });
  a.click('[data-act="cooking"]');
  a.click('[data-cook="wake"]');
  await tick();
  assert.match(a.q("#wake-status").textContent, /stays awake/);
  visible = "hidden";
  await lock.release();
  visible = "visible";
  a.w.document.dispatchEvent(new a.w.Event("visibilitychange"));
  await tick();
  assert.equal(requests, 2);
  a.click('[data-act="close"]');
  await tick();
  assert.equal(releases, 2);
  a.dom.window.close();
});
