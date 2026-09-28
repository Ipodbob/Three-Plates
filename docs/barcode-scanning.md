# Pantry barcode scanning

Pantry → **Scan barcode** starts the rear camera immediately, with a barcode-photo input and a manual number fallback. A viewfinder leads into a compact product card. Recognising a product does not change stock: **Add & scan next** is the explicit save action. The camera remains running while confirming; repeated frames cannot save stock. Move the barcode out of view before scanning the same item again. A visible session count confirms successful saves. The scanner uses a pinned, locally served ZXing browser bundle, loaded only when scanning an image or starting the camera. Native `BarcodeDetector` is not required. Camera access needs HTTPS (or localhost), browser permission and a suitable camera. The video uses `playsinline` for Safari. EAN-8, EAN-13, UPC-A and ITF are decoded; numeric input also accepts valid GTIN-14. This does not analyse food/label photos without a barcode.

Camera frames and uploaded photos stay on the device. New barcode numbers are sent to Open Food Facts; confirmed matches can be reused without a network request. The photo input allows capture or selection according to the phone/browser's picker. Permission denial, absent cameras, unreadable photos, offline requests, timeouts and missing products retain the number/manual-ingredient fallbacks.

## Confirm before stock changes

The product name, source and stated pack size appear with suggested recipe ingredients. Suggestions never add stock automatically. Recognised products default to a separate custom product with their reported pack size, or one item when no unambiguous size is available. Recipe ingredient matching is optional under Edit and is never inferred automatically. Users confirm the usable amount and pack count. A 5% step slider and quarter/half/three-quarter/full presets select the amount remaining in each pack. Additions accumulate rather than replace stock. Count and mass/volume units cannot silently convert; an incompatible mapping clears the suggested amount. Multipack quantities require confirmation rather than guessed multiplication. Common drained ingredients deliberately require an entered usable weight instead of using net tin weight. Always-stocked entries must be edited first.

Optional confirmed matches are bounded to 500 and stored in `barcodeMatches` within the existing `three-plates-v3` state. They roundtrip with backup/export; old backups remain valid. Invalid optional matches are discarded without altering pantry data. Forgetting matches leaves stock untouched. No scan changes shop purchase history or creates a bought transaction. Scanner writes are successful only if browser persistence succeeds; failed writes roll back and retain the confirmation card.

### Used items and recipes

**Update amount left** scans a remembered product or lets the user choose an existing measured pantry ingredient. Its slider is a percentage of the currently recorded total across all packs, not the original package size. The confirmation states the exact amount that will remain; Empty removes the pantry entry. Exact remaining amounts can be entered under Edit. Corrections reject stale stock values, cannot increase stock, and retain barcode matches. For planned meals, **Open meal plan** leads to the established cooking workflow, which deducts ingredients once. The scanner does not independently subtract recipe ingredients or claim to track individual physical packs.

## Providers and the deployed UPC backup

Open Food Facts is called directly with public identification fields. API documentation: https://openfoodfacts.github.io/openfoodfacts-server/api/. Source attribution and an ODbL link are shown with matches. Product availability and quantities are not guaranteed. Direct read requests are throttled to at most one every 4.1 seconds per running page; rapid scans wait for their provider slot instead of being treated as unknown products. Repeated confirmed products are local. Provider/IP limits can still apply across tabs or devices.

**The free UPCitemdb fallback is deployed and configured on this feature branch.** Its free endpoint returned `Access-Control-Allow-Origin: https://www.upcitemdb.com` when tested with the GitHub Pages origin on 28 September 2026. Browsers therefore cannot call it directly from Three Plates. We do not use public CORS proxies or expose paid credentials.

`relay/upc-worker.mjs` is the deployed Cloudflare Worker for the free UPC endpoint. It accepts only the configured frontend origins, a valid barcode and the fixed `/lookup` route, with an eight-second client timeout. A SQLite Durable Object stores a global counter: at most 100 upstream requests per UTC day, separated by at least 10.1 seconds. The free quota is shared across this relay's users, not 100 per person; upstream shared-IP limits may be tighter. Origin checks are not authentication: a non-browser client could consume the bounded quota. It returns minimal product fields and has no arbitrary URL proxy or API secret.

Cloudflare supports SQLite Durable Objects on its Workers Free plan: https://developers.cloudflare.com/durable-objects/platform/pricing/. UPC free limits: https://www.upcitemdb.com/wp/docs/main/development/plan/. Stay on free plans; no paid provider is required.

### Redeploy the relay

This requires the owner's Cloudflare account and deployment authorization. The website continues to run on GitHub Pages.

1. From `relay/`, authenticate Wrangler to the account: `npx wrangler login`.
2. Check `wrangler.toml`: `ALLOWED_ORIGINS` must include the actual Pages origin, currently `https://ipodbob.github.io`. Add localhost only when deliberately testing locally.
3. Deploy with `npx wrangler deploy`. This creates the worker and its SQLite quota object.
4. Set `upcRelay` in `barcode-config.js` to the returned HTTPS worker URL plus `/lookup`, then publish the frontend change.
5. Verify the fallback from the actual Pages origin with a product absent from Open Food Facts but present in UPCitemdb. Verify quota/error responses do not mutate stock.

The owner authorized deployment on 28 September 2026. The live endpoint is `https://three-plates-upc.three-plates-ipodbob.workers.dev/lookup`, allowing `https://ipodbob.github.io` and the deliberately enabled local test origin `http://127.0.0.1:4173`. No paid provider subscription was created.

Live checks verified a UPCitemdb product response, correct CORS, invalid barcode rejection (400), disallowed origin rejection (403), and the persistent cooldown (429). The local pantry UI also retrieved test barcode `4002293401102` through UPCitemdb after Open Food Facts missed it. This is a kitchen-tool test product, not food; no stock or remembered match was saved. The Worker uses manual redirect handling because the Cloudflare runtime does not support `redirect: "error"`; redirects are rejected as upstream failures.

The relay and frontend are live. The v3.7.2 Pages run 36494047521 succeeded and all 16 public assets matched the released code.

## Validation and remaining device checks

Automated tests cover barcode checksums, the actual bundled decoder against a generated EAN-13 image, product parsing, mass/volume separation, additive stock, backup preservation, local matches, provider failures/cooldowns, cancellation, escaped product names, barcode-photo handling, camera denial and late permission grants. Relay tests cover origin/route validation, quotas and minimal responses. The full existing regression suite remains part of `npm test`.

Local real-browser testing checked an Open Food Facts lookup, product confirmation and responsive controls. No pantry stock was added during that browser smoke test. **Physical iPhone 17 Pro Max camera/Safari and Android camera testing remain unverified**; desktop emulation cannot establish autofocus, capture-picker behaviour or camera permission behaviour on those phones. The redesigned frontend was released; physical-device verification remains separate.

The local vendor bundle comes from `@zxing/browser@0.2.1` with its dependency decoder; package-lock pins the dependency tree. MIT/Apache license files are retained in `vendor/`; only the unavailable source-map reference was removed from the minified file.

## Scanner redesign, v3.7.0

The user confirmed that the old flow stopped at detection, with the save controls hidden behind ingredient selection. The redesign makes confirmation visible by default and supports consecutive saves in one session. Research references: [Yuka product cards/history](https://yuka.io/en/app/), [Out of Milk barcode entry](https://support.outofmilk.com/hc/en-us/articles/208246423-Android-Using-the-Barcode-Scanner-to-add-items), and [Grocy quick stock entry and recipes](https://grocy.info/). These informed the flow; no artwork or proprietary scanner SDK was copied.

Validation: 108 automated checks pass, including default product persistence/reload, partial consecutive additions, storage-failure handling, remaining-stock corrections and camera-stream reuse. Local browser testing saved a half-full real product, reloaded it as 200 g, and exercised the stock-update card. The user verified the previous camera implementation on iPhone; the redesigned continuous-camera flow still needs a physical-device check.
