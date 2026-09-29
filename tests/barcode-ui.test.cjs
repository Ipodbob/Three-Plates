const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path"),
  { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, ".."),
  code = "3017620422003";
function app(seed = {}, setup = () => {}) {
  const dom = new JSDOM(
      fs.readFileSync(path.join(root, "index.html"), "utf8"),
      {
        url: "https://ipodbob.github.io/Three-Plates/#pantry",
        runScripts: "outside-only",
      },
    ),
    w = dom.window;
  w.scrollTo = () => {};
  w.confirm = () => true;
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  w.fetch = async () => ({
    ok: true,
    json: async () => ({
      product: { code, product_name: "Penne pasta", quantity: "500 g" },
    }),
  });
  setup(w);
  for (const [k, v] of Object.entries(seed)) w.localStorage.setItem(k, v);
  for (const f of [
    "recipes.js",
    "batch-v3.js",
    "core-v3.js",
    "phase1.js",
    "menus.js",
    "cooking.js",
    "prep.js",
    "cooking-ui.js",
    "barcode-config.js",
    "pantry-scan.js",
    "app-v3.js",
  ])
    w.eval(fs.readFileSync(path.join(root, f), "utf8"));
  const q = (s) => w.document.querySelector(s),
    click = (s) => {
      assert.ok(q(s), s);
      q(s).click();
    };
  return {
    dom,
    w,
    q,
    click,
    state: () => JSON.parse(w.localStorage.getItem("three-plates-v3")),
  };
}
const tick = () => new Promise((r) => setImmediate(r));
test("scanner preserves existing pantry units through additions, partial use and reload", async (t) => {
  for (const unit of ["kg", "l", "tbsp", "tsp"]) {
    const id = "custom-unit-" + unit;
    const seed = {version:3, custom:{[id]:{id,name:"Test stock",unit,group:"Other"}},pantry:[{id,qty:4,always:false}]};
    const a = app({"three-plates-v3":JSON.stringify(seed)});
    t.after(() => a.dom.window.close());
    await lookup(a);
    const picker = a.q("#scan-ingredient");
    picker.value = "Test stock";
    picker.dispatchEvent(new a.w.Event("change", {bubbles:true}));
    assert.equal(a.q("#scan-unit").value, unit);
    assert.equal(a.q("#scan-unit").disabled, true);
    assert.equal(a.q("#scan-qty").value, "", "incompatible lookup weight needs an explicit amount");
    a.q("#scan-qty").value = "2";
    a.q("#scan-qty").dispatchEvent(new a.w.Event("input", {bubbles:true}));
    assert.match(a.q("#scan-preview").textContent, new RegExp("2 " + unit));
    a.click("#scan-save");
    assert.equal(a.state().pantry.find(p=>p.id===id).qty, 6);
    assert.equal(a.state().barcodeMatches[code].unit, unit);
    const b = app({"three-plates-v3":JSON.stringify(a.state())});
    t.after(() => b.dom.window.close());
    await lookup(b);
    b.click("#scan-use-mode");
    assert.equal(b.q("#scan-unit").value, unit);
    b.click('[data-fraction="0.5"]');
    assert.match(b.q("#scan-preview").textContent, new RegExp("3 " + unit));
    b.click("#scan-save");
    assert.equal(b.state().pantry.find(p=>p.id===id).qty, 3);
    assert.equal(b.state().custom[id].unit, unit);
  }
});
async function lookup(a) {
  a.click('[data-act="pantry-scan"]');
  a.q("#barcode-number").closest("details").open = true;
  a.q("#barcode-number").value = code;
  a.q("#barcode-number-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await tick();
}
test("pantry scan confirms an additive amount, persists match, and prevents repeat submit", async () => {
  const a = app();
  await lookup(a);
  assert.match(a.q("#scan-result").textContent, /Penne pasta/);
  a.click('[data-match="pasta"]');
  a.q("#scan-packs").value = 2;
  a.q("#scan-fraction").value = "0.5";
  const form = a.q("#scan-confirm-form");
  form.dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  form.dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(a.state().pantry.find((i) => i.id === "pasta").qty, 500);
  assert.equal(a.state().barcodeMatches[code].qty, 500);
  assert.equal(a.q("#sheet").open, true);
  assert.match(a.q("#scan-session").textContent, /1 saved/);
  a.dom.window.close();
});
test("lookup focuses confirmation without saving and returns to entry for the next item", async () => {
  const a = app();
  await lookup(a);
  assert.equal(a.w.document.activeElement, a.q("#scan-product-title"));
  assert.equal(a.q("#scan-product-title").textContent, "Penne pasta");
  assert.equal(a.state()?.pantry?.length || 0, 0);
  a.click('[data-fraction="0.5"]');
  a.click("#scan-save");
  assert.equal(a.state().pantry[0].qty, 250);
  assert.equal(a.q("#barcode-number").closest("details").open, true);
  assert.equal(a.w.document.activeElement, a.q("#barcode-number"));
  a.w.fetch = async () => {
    throw Error("Remembered match must not need a lookup");
  };
  a.q("#barcode-number").value = code;
  a.q("#barcode-number-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await tick();
  assert.equal(a.w.document.activeElement, a.q("#scan-product-title"));
  assert.equal(a.state().pantry[0].qty, 250);
  a.click("#scan-use-mode");
  assert.equal(a.w.document.activeElement, a.q("#scan-product-title"));
  a.click('[data-fraction="0.5"]');
  a.click("#scan-save");
  assert.equal(a.state().pantry[0].qty, 125);
  assert.equal(a.w.document.activeElement, a.q("#barcode-number"));
  a.dom.window.close();
});
test("barcode photo uses local decoding and revokes its temporary URL", async () => {
  let revoked, decoded;
  let now = Date.now();
  const a = app({}, (w) => {
    w.Date.now = () => now;
    w.URL.createObjectURL = () => "blob:local-test";
    w.URL.revokeObjectURL = (u) => (revoked = u);
    w.ZXingBrowser = {
      BrowserMultiFormatReader: class {
        async decodeFromImageUrl(url) {
          decoded = url;
          return { getText: () => code };
        }
      },
    };
  });
  a.click('[data-act="pantry-scan"]');
  a.click("#scan-photo-open");
  Object.defineProperty(a.q("#scan-photo"), "files", {
    value: [new a.w.File(["test"], "barcode.jpg", { type: "image/jpeg" })],
  });
  a.q("#scan-photo").dispatchEvent(new a.w.Event("change", { bubbles: true }));
  await tick();
  assert.equal(decoded, "blob:local-test");
  assert.equal(revoked, "blob:local-test");
  assert.match(a.q("#scan-result").textContent, /Penne pasta/);
  const before = a.w.localStorage.getItem("three-plates-v3");
  a.click("#scan-skip");
  assert.equal(a.w.document.activeElement, a.q("#scan-photo-open"));
  assert.equal(a.q("#barcode-number").closest("details").open, false);
  assert.equal(a.w.localStorage.getItem("three-plates-v3"), before);
  now += 5000;
  a.q("#scan-photo").dispatchEvent(new a.w.Event("change", { bubbles: true }));
  await tick();
  a.click("#scan-save");
  assert.equal(a.w.document.activeElement, a.q("#scan-photo-open"));
  assert.equal(a.state().pantry[0].qty, 500);
  a.dom.window.close();
});
test("untrusted product names render as text, and incompatible units require a new amount", async () => {
  const a = app(
    {},
    (w) =>
      (w.fetch = async () => ({
        ok: true,
        json: async () => ({
          product: {
            code,
            product_name: "<img src=x onerror=alert(1)> pasta",
            quantity: "500 ml",
          },
        }),
      })),
  );
  await lookup(a);
  assert.equal(a.q("#scan-result img"), null);
  a.click('[data-match="pasta"]');
  assert.equal(a.q("#scan-qty").value, "");
  assert.equal(a.q("#scan-unit").value, "g");
  a.dom.window.close();
});
test("closing during a late camera permission grant releases the acquired track", async () => {
  let grant,
    stopped = 0;
  const a = app({}, (w) => {
    Object.defineProperty(w.navigator, "mediaDevices", {
      value: { getUserMedia: () => new Promise((r) => (grant = r)) },
    });
    w.ZXingBrowser = {
      BrowserMultiFormatReader: class {
        async decodeFromStream() {
          throw Error("should not attach late stream");
        }
      },
    };
  });
  a.click('[data-act="pantry-scan"]');
  a.click("#scan-camera");
  await tick();
  a.click('[data-act="close"]');
  grant({ getTracks: () => [{ stop: () => stopped++ }] });
  await tick();
  assert.equal(stopped, 1);
  a.dom.window.close();
});
test("camera denial keeps photo and number fallbacks available", async () => {
  const a = app({}, (w) => {
    Object.defineProperty(w.navigator, "mediaDevices", {
      value: {
        getUserMedia: async () => {
          const e = Error();
          e.name = "NotAllowedError";
          throw e;
        },
      },
    });
    w.ZXingBrowser = { BrowserMultiFormatReader: class {} };
  });
  a.click('[data-act="pantry-scan"]');
  a.click("#scan-camera");
  await tick();
  assert.match(a.q("#scan-status").textContent, /permission was denied/);
  assert.equal(a.q("#scan-camera").disabled, false);
  assert.ok(a.q("#scan-photo"));
  a.dom.window.close();
});
test("stale lookup result cannot reopen a dismissed scanner", async () => {
  let complete;
  const a = app(
    {},
    (w) => (w.fetch = () => new Promise((r) => (complete = r))),
  );
  a.click('[data-act="pantry-scan"]');
  a.q("#barcode-number").value = code;
  a.q("#barcode-number-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await tick();
  a.click('[data-act="close"]');
  complete({
    ok: true,
    json: async () => ({ product: { code, product_name: "Pasta" } }),
  });
  await tick();
  assert.equal(a.q("#sheet").open, false);
  assert.equal(a.q("#scan-result").textContent, "");
  a.dom.window.close();
});
test("detected product has a visible save action without recipe matching and survives reload", async () => {
  const a = app();
  await lookup(a);
  assert.match(a.q("#scan-selection").textContent, /Will be added/);
  assert.doesNotMatch(a.q("#scan-selection").textContent, /^Saved/);
  assert.ok(a.q("#scan-save"));
  assert.equal(a.q("#scan-amount").hidden, false);
  a.click("#scan-save");
  assert.equal(a.state().pantry[0].qty, 500);
  const id = a.state().pantry[0].id;
  assert.equal(a.state().custom[id].name, "Penne pasta");
  const b = app({ "three-plates-v3": JSON.stringify(a.state()) });
  assert.match(b.q("main").textContent, /Penne pasta/);
  assert.equal(b.state().pantry[0].qty, 500);
  a.dom.window.close();
  b.dom.window.close();
});
test("storage failure keeps confirmation open and never claims saved", async () => {
  const a = app();
  await lookup(a);
  a.w.Storage.prototype.setItem = () => {
    throw Error("full");
  };
  a.click("#scan-save");
  assert.ok(a.q("#scan-save"));
  assert.match(a.q("#scan-error").textContent, /Not saved/);
  assert.equal(a.q("#scan-session").textContent, "");
  assert.equal(a.state(), null);
  a.dom.window.close();
});
test("multiple confirmations add partial packs without closing scanner", async () => {
  const a = app();
  await lookup(a);
  a.click('[data-fraction="0.25"]');
  a.click("#scan-save");
  a.q("#barcode-number").value = code;
  a.q("#barcode-number-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await tick();
  a.click('[data-fraction="0.5"]');
  a.click("#scan-save");
  assert.equal(a.state().pantry[0].qty, 375);
  assert.match(a.q("#scan-session").textContent, /2 saved/);
  assert.equal(a.q("#sheet").open, true);
  a.dom.window.close();
});
test("update mode sets absolute stock left and empty removes only that item", async () => {
  const a = app();
  await lookup(a);
  a.click("#scan-save");
  a.q("#barcode-number").value = code;
  a.q("#barcode-number-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await tick();
  a.click("#scan-use-mode");
  a.click('[data-fraction="0.5"]');
  a.click("#scan-save");
  assert.equal(a.state().pantry[0].qty, 250);
  a.q("#barcode-number").value = code;
  a.q("#barcode-number-form").dispatchEvent(
    new a.w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await tick();
  a.click('[data-fraction="0"]');
  a.click("#scan-save");
  assert.equal(a.state().pantry.length, 0);
  a.dom.window.close();
});
test("camera starts once and continues after confirmation without another permission request", async () => {
  let now = Date.now();
  let callback,
    starts = 0,
    stops = 0,
    failRestart = false;
  const a = app({}, (w) => {
    w.Date.now = () => now;
    Object.defineProperty(w.navigator, "mediaDevices", {
      value: {
        getUserMedia: async () => {
          starts++;
          if (failRestart) throw Error("Camera unavailable on return");
          return { getTracks: () => [{ stop: () => stops++ }] };
        },
      },
    });
    w.ZXingBrowser = {
      BrowserMultiFormatReader: class {
        async decodeFromStream(stream, video, cb) {
          callback = cb;
          return { stop: () => {} };
        }
      },
    };
  });
  a.click('[data-act="pantry-scan"]');
  await tick();
  callback({ getText: () => code });
  await tick();
  const before = a.w.localStorage.getItem("three-plates-v3");
  a.click("#scan-skip");
  assert.match(a.q("#scan-status").textContent, /Skipped/);
  assert.doesNotMatch(a.q("#scan-status").textContent, /^Saved/);
  assert.equal(a.w.localStorage.getItem("three-plates-v3"), before);
  assert.equal(a.q("#scan-session").textContent, "");
  assert.equal(starts, 1); assert.equal(stops, 0);
  assert.equal(a.w.document.activeElement, a.q("#scan-stop"));
  now += 5000;
  callback(null); callback({ getText: () => code }); await tick();
  a.click("#scan-save");
  assert.match(a.q("#scan-status").textContent, /^Saved/);
  assert.match(a.q("#scan-session").textContent, /1 saved/);
  assert.equal(a.w.document.activeElement, a.q("#scan-stop"));
  assert.equal(starts, 1);
  callback({ getText: () => code });
  await tick();
  assert.equal(a.q("#scan-result").textContent, "");
  callback(null);
  callback({ getText: () => code });
  await tick();
  assert.ok(a.q("#scan-save"));
  failRestart = true;
  Object.defineProperty(a.w.document, "hidden", {value:true,configurable:true});
  a.w.document.dispatchEvent(new a.w.Event("visibilitychange"));
  Object.defineProperty(a.w.document, "hidden", {value:false,configurable:true});
  a.click("#scan-save");
  await tick();
  assert.equal(starts, 2);
  assert.equal(a.q("#scan-stop").hidden, true);
  assert.equal(a.w.document.activeElement, a.q("#scan-camera"));
  assert.equal(a.q("#scan-camera").disabled, false);
  failRestart = false;
  a.click("#scan-camera");
  await tick();
  a.click("#scan-stop");
  assert.equal(a.w.document.activeElement, a.q("#scan-camera"));
  a.click("#scan-done");
  assert.ok(stops > 0);
  a.dom.window.close();
});
test("forgetting barcode matches requires explicit confirmation and never changes pantry stock", async () => {
  const a = app();
  await lookup(a);
  a.click("#scan-save");
  const before = JSON.stringify(a.state().pantry);
  a.click("#scan-forget");
  assert.ok(a.state().barcodeMatches[code]);
  a.click("#scan-forget-no");
  assert.ok(a.state().barcodeMatches[code]);
  a.click("#scan-forget");
  a.click("#scan-forget-yes");
  assert.deepEqual(a.state().barcodeMatches, {});
  assert.equal(JSON.stringify(a.state().pantry), before);
  a.dom.window.close();
});

test("scanner ingredient picker uses readable units and saves the selected identity", async () => {
  const a = app();
  await lookup(a);
  const list = [...a.w.document.querySelectorAll("#scan-options option")].map(
    (o) => o.value,
  );
  assert.ok(list.includes("Milk (ml)"));
  assert.ok(list.includes("Pasta (g)"));
  assert.ok(list.every((x) => !x.includes("[ex-")));
  const input = a.q("#scan-ingredient");
  input.value = "Milk (ml)";
  input.dispatchEvent(new a.w.Event("change", { bubbles: true }));
  assert.equal(input.value, "Milk (ml)");
  assert.equal(a.q("#scan-unit").value, "ml");
  a.q("#scan-qty").value = "200";
  a.q("#scan-qty").dispatchEvent(new a.w.Event("input", { bubbles: true }));
  a.click("#scan-save");
  assert.equal(a.state().pantry[0].id, "milk");
  assert.equal(a.state().pantry[0].qty, 200);
  a.dom.window.close();
});
