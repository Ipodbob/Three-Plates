const { test } = require("node:test"),
  assert = require("node:assert/strict");
require("../recipes.js");
require("../batch-v3.js");
require("../core-v3.js");
const C = require("../phase1.js"),
  B = require("../pantry-scan.js"),
  I = PLATES_DATA.ingredients,
  R = PLATES_DATA.recipes,
  code = "3017620422003";
test('barcode additions and used-stock adjustments retain optional pantry reminders',()=>{
 const s=C.defaults();s.pantry=[{id:'pasta',qty:100,always:false,useSoon:'2026-09-29'}];
 B.add(s,I,{code,name:'Pasta'},{ingredientId:'pasta',qty:500,unit:'g',packs:1,fraction:0.5,remember:true});
 assert.equal(s.pantry[0].qty,350);assert.equal(s.pantry[0].useSoon,'2026-09-29');
 B.setRemaining(s,I,'pasta',350,50);assert.equal(s.pantry[0].useSoon,'2026-09-29');B.setRemaining(s,I,'pasta',50,0);assert.equal(s.pantry.length,0);
});
test("GTIN validation retains leading zeros and rejects damaged codes", () => {
  assert.equal(B.barcode("036000291452"), "0036000291452");
  assert.equal(B.barcode("3017 6204 22003"), code);
  for (const bad of [
    "3017620422004",
    "https://example.com",
    "123",
    "123456789",
  ])
    assert.throws(() => B.barcode(bad));
});
test("quantities keep mass and volume distinct and reject uncertain multipacks", () => {
  assert.deepEqual(B.quantity("1.5 kg"), { qty: 1500, unit: "g" });
  assert.deepEqual(B.quantity("750ml"), { qty: 750, unit: "ml" });
  assert.equal(B.quantity("4 x 400 g"), null);
  assert.equal(B.quantity("400 g 4 pack"), null);
  assert.equal(B.quantity("Large"), null);
});
test("scanning adds amounts once and remembers full packs rather than consumed fractions", () => {
  const s = C.defaults();
  s.pantry = [{ id: "pasta", qty: 100, always: false }];
  B.add(
    s,
    I,
    { code, name: "Penne" },
    {
      ingredientId: "pasta",
      qty: 500,
      unit: "g",
      packs: 2,
      fraction: 0.5,
      remember: true,
    },
  );
  assert.equal(s.pantry[0].qty, 600);
  assert.equal(s.barcodeMatches[code].qty, 500);
  const restored = C.migrate(JSON.parse(JSON.stringify(s)), R, I);
  assert.deepEqual(restored.barcodeMatches, s.barcodeMatches);
  assert.deepEqual(restored.pantry, s.pantry);
});
test("invalid scanned quantities and incompatible units leave stock unchanged", () => {
  for (const patch of [
    { qty: NaN },
    { qty: -1 },
    { unit: "ml" },
    { packs: 0 },
    { fraction: 0 },
    { ingredientId: "bad" },
  ]) {
    const s = C.defaults(),
      before = JSON.stringify(s);
    assert.throws(() =>
      B.add(
        s,
        I,
        { code, name: "Pasta" },
        {
          ingredientId: "pasta",
          qty: 500,
          unit: "g",
          packs: 1,
          fraction: 1,
          remember: true,
          ...patch,
        },
      ),
    );
    assert.equal(JSON.stringify(s), before);
  }
  const s = C.defaults();
  s.pantry = [{ id: "pasta", qty: 0, always: true }];
  assert.throws(() =>
    B.add(
      s,
      I,
      { code },
      { ingredientId: "pasta", qty: 500, unit: "g", packs: 1, fraction: 1 },
    ),
  );
});
test("unknown products stay separate and invalid optional matches cannot corrupt old backups", () => {
  const s = C.defaults();
  B.add(
    s,
    I,
    { code, name: "Chocolate spread" },
    {
      ingredientId: "new",
      qty: 400,
      unit: "g",
      packs: 1,
      fraction: 1,
      remember: true,
    },
  );
  assert.ok(s.custom["custom-barcode-" + code]);
  const restored = C.migrate(JSON.parse(JSON.stringify(s)), R, I);
  assert.equal(
    restored.barcodeMatches[code].ingredientId,
    "custom-barcode-" + code,
  );
  s.barcodeMatches[code].unit = "ml";
  assert.deepEqual(C.migrate(s, R, I).barcodeMatches, {});
  const old = C.defaults();
  delete old.barcodeMatches;
  assert.deepEqual(C.migrate(old, R, I).barcodeMatches, {});
});
test("remembered scans work without any network calls", async () => {
  const lookup = B.lookupClient({
    fetcher: () => {
      throw Error("network should not run");
    },
  });
  const p = await lookup(code, {
    [code]: { name: "Pasta", ingredientId: "pasta", qty: 500, unit: "g" },
  });
  assert.equal(p.provider, "Your confirmed match");
  assert.equal(p.amount.qty, 500);
});
test("lookup falls back on missing products and network failure, validates returned barcode", async () => {
  for (const failure of ["missing", "offline"]) {
    const calls = [];
    const lookup = B.lookupClient({
      relay: "https://relay.example/lookup",
      fetcher: async (url) => {
        calls.push(url);
        if (calls.length === 1) {
          if (failure === "offline") throw Error("Offline");
          return { ok: true, json: async () => ({ status: 0 }) };
        }
        return {
          ok: true,
          json: async () => ({
            items: [{ ean: code, title: "Spread", size: "400 g" }],
          }),
        };
      },
    });
    const p = await lookup(code);
    assert.equal(p.provider, "UPCitemdb");
    assert.equal(calls.length, 2);
    assert.equal(p.amount.qty, 400);
  }
  assert.equal(
    B.product(
      { product: { code: "0036000291452", product_name: "Wrong" } },
      "Open Food Facts",
      code,
    ),
    null,
  );
});
test("unconfigured backup fails honestly and provider cooldown prevents repeated traffic", async () => {
  let calls = 0;
  const lookup = B.lookupClient({
    now: () => 100000,
    fetcher: async () => {
      calls++;
      return { ok: false, status: 429 };
    },
  });
  const p = await lookup(code);
  assert.equal(p.backupAvailable, false);
  assert.match(p.issue, /limit/);
  await lookup(code);
  assert.equal(calls, 1);
});
test("cancelled lookup never starts the secondary provider", async () => {
  const c = new AbortController();
  let calls = 0;
  const lookup = B.lookupClient({
    relay: "https://relay.example/lookup",
    fetcher: async () => {
      calls++;
      c.abort();
      throw Error("Cancelled");
    },
  });
  await assert.rejects(lookup(code, {}, c.signal));
  assert.equal(calls, 1);
});
test("bundled ZXing decodes a generated EAN-13 image with the actual browser decoder", () => {
  const { JSDOM } = require("jsdom"),
    fs = require("fs"),
    dom = new JSDOM("", { runScripts: "outside-only" });
  dom.window.eval(
    fs.readFileSync(
      require.resolve("../vendor/zxing-browser-0.2.1.min.js"),
      "utf8",
    ),
  );
  const browser = dom.window.ZXingBrowser;
  // EAN-13 3017620422003: leading 3 selects L L G G G L parity.
  const bars =
      "0000000000" +
      "101" +
      "0001101" +
      "0011001" +
      "0010001" +
      "0000101" +
      "0011011" +
      "0001101" +
      "01010" +
      "1011100" +
      "1101100" +
      "1101100" +
      "1110010" +
      "1110010" +
      "1000010" +
      "101" +
      "0000000000",
    width = bars.length * 3,
    pixels = new Uint8ClampedArray(width * 120 * 4);
  for (let y = 0; y < 120; y++)
    for (let x = 0; x < width; x++) {
      const n = (y * width + x) * 4,
        v = bars[Math.floor(x / 3)] === "1" ? 0 : 255;
      pixels[n] = pixels[n + 1] = pixels[n + 2] = v;
      pixels[n + 3] = 255;
    }
  const canvas = {
    width,
    height: 120,
    getContext: () => ({ getImageData: () => ({ data: pixels }) }),
  };
  const reader = new browser.BrowserMultiFormatReader(
    new Map([[2, [6, 7, 8, 14]]]),
  );
  assert.equal(reader.decodeFromCanvas(canvas).getText(), code);
  dom.window.close();
});
test("remaining-stock corrections preserve matches and cannot subtract twice or affect other items", () => {
  const s = C.defaults();
  s.pantry = [
    { id: "pasta", qty: 500, always: false },
    { id: "rice", qty: 300, always: false },
  ];
  B.setRemaining(s, I, "pasta", 500, 125);
  assert.equal(s.pantry[0].qty, 125);
  assert.throws(() => B.setRemaining(s, I, "pasta", 500, 125), /Stock changed/);
  assert.throws(() => B.setRemaining(s, I, "pasta", 125, -1));
  B.setRemaining(s, I, "pasta", 125, 0);
  assert.deepEqual(s.pantry, [{ id: "rice", qty: 300, always: false }]);
});
