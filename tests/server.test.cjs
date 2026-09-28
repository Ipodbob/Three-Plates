const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const { createServer } = require("../scripts/serve.cjs");
test("development server serves the exact local decoder and protects unpublished paths", async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const r = await fetch(
      base + "/Three-Plates/vendor/zxing-browser-0.2.1.min.js",
    );
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type"), /javascript/);
    assert.equal(
      await r.text(),
      fs.readFileSync(
        path.join(__dirname, "../vendor/zxing-browser-0.2.1.min.js"),
        "utf8",
      ),
    );
    for (const p of [
      "/three-plates/",
      "/Three-Plates/.git/config",
      "/Three-Plates/node_modules/jsdom/package.json",
      "/Three-Plates/scripts/serve.cjs",
      "/Three-Plates/vendor/../../package.json",
    ])
      assert.equal((await fetch(base + p)).status, 404, p);
    assert.equal((await fetch(base + "/Three-Plates/")).status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
test("responsive preview accepts only known widths and app routes", async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const r = await fetch(base + "/preview?width=320&page=pantry");
    assert.equal(r.status, 200);
    assert.match(await r.text(), /width:320px/);
    assert.equal(
      (await fetch(base + "/preview?width=1&page=pantry")).status,
      400,
    );
    assert.equal(
      (await fetch(base + "/preview?width=320&page=%3Cscript%3E")).status,
      400,
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
