# Current completion audit

Reviewed 29 September 2026 against main `bf2c7d8e5a141504439ad6e1a7504b6847c7d8fd` (v3.11.52), with the v3.11.53 catalogue follow-up. This is a scope-and-evidence register, not a declaration that the whole product is complete. Earlier observations are retained in [whole-app-audit.md](whole-app-audit.md).

## Authority and scope

The original THREE_PLATES_CODEX_HANDOVER.md supplies the implementation brief. Later user decisions take precedence: one shared Choose/Batch screen; touch controls; air fryer; a broad catalogue including Dessert and Baking; discovery minimum 4/5 from five ratings; continuous confirmed barcode additions, partial packs and remaining-stock correction. The original separate Batch navigation item and deferred recipe expansion are superseded. Photo barcode decoding is implemented; arbitrary food-image recognition was discussed but is not claimed as shipped.

The goal remains comprehensive, simple, consistent and functional across Choose, Batch, Plan, Shopping, Pantry and Settings. A green suite proves its tested cases, not every recipe quantity or physical-phone interaction.

## Current delivery evidence

- Latest verified deployment: PR #65 merged v3.11.52 at the main commit above. Pages run [36542066120](https://github.com/Ipodbob/Three-Plates/actions/runs/36542066120) succeeded; all 21 checked public assets matched. Static GitHub Pages hosting and the case-sensitive /Three-Plates/ path are unchanged.
- v3.11.53 candidate completes the 36-entry omitted-quantity review: 34 recipes corrected and two optional/conditional omissions retained. This follow-up corrects 19 recipes, including salt across main/dressing components, baking flavourings, chilli and missing watercress. It also restores 2.25-teaspoon oil/vinegar quantities that had been misread as 0.25. Watercress weight and the nominal heaped-salt amount are explicitly labelled planning estimates.
- Targeted checks: 72 passed (71 catalogue/review/Phase 1 and one connected UI check for new flavouring/watercress shopping, purchase and reload). Full regression: **281 passed** (32 core plus 249 Node checks), zero failures, cancellations or skips; Node stage 160 seconds. Deployment is a separate check.
- Browser records use isolated localhost:4174. Cleanup removes only test-created plans and portions through their individual UI actions; synthetic archived history remains. User origins and production data are not reset.

## Requirement-by-requirement evidence

| Requirement | Evidence inspected | Conclusion and practical limit |
| --- | --- | --- |
| Three choices, refresh unseen first, keep individual cards | core-v3.js; core-v3.test.cjs; ui.test.cjs refresh/lock tests | Implemented and regression-covered; search deliberately expands beyond three cards. |
| Shared Choose/Batch; meal, people, days, time and method controls | app-v3.js; UI tests for shared screen, steppers, air fryer and persisted filters; recorded responsive checks | Implemented; physical touch/keyboard ergonomics still need device evidence. |
| Exclusions override favourites; cuisine/diet/equipment; reversible hidden recipes | core and catalogue-review suites; seafood/meat/sausage and plant-preference source registers; browser preference checks | Implemented for documented mappings. Imported ingredient equivalence is not universally verified and is never used to merge stock automatically. |
| Pantry-first/no-shopping and ingredient search | core-v3.test.cjs; phase1.test.cjs; unmeasured.test.cjs; pantry/search UI tests | Covered, including explicit always-stocked treatment of unknown amounts. |
| Multiple complementary batches and ten portions | phase1.test.cjs ten-portion split; batch UI/browser allocation checks | Covered. Allocation into storage is recorded when cooking finishes; advance booking of uncooked batches remains an extension. |
| Complete/base/uncooked distinction and storage uncertainty | catalogue-review.js; app-v3.js batch labels; phase1 unknown-freezer-confirmation test | Explicit labels implemented. No recipe-specific freezing guarantee. |
| Fridge/freezer, reservations, partial defrost, discard/correction | core-v3/phase1 tests; recorded narrow allocation, correction and consumption browser journeys | Tested workflows covered, including overbooking and once-only deduction. Recorded dates cannot establish actual food handling. |
| Raw ingredients once; stored mains excluded; fresh sides counted | core-v3, sides and prep suites; browser stock arithmetic and stored-side checks | Covered for tested workflows; imported source quantity accuracy is separate. |
| Shop selector, trip override, optional packs, exact weight, immutable purchases | phase1 acceptance case 750g -> two 500g packs; UI pack editor and purchase correction tests | Implemented, including 250g excess calculation. Generic sizes are labelled; no live retailer catalogue claimed. |
| Purchases transferred at actual amount, surviving changed plans | UI tests for covered purchases, corrections, removed plans and once-only transfer/cooking | Covered. Historical quantities remain saved when shops change. |
| Compatible units and explicit product linking | core/phase1 tests; barcode tests; readable-label catalogue tests; browser link/reload checks | Measured/count/drained identities kept separate; explicit linkage required. |
| Saved data, v1 migration, backups and save failures | history/phase1/UI suites; malformed imports, large backups, rollback and stale-tab tests | Covered by automated state and connected UI tests. No account/cloud sync promised. |
| Barcode lookup, quick confirmation and multiple items | barcode, barcode-ui and relay suites; real OFF barcode-entry browser checks | Partial packs save/reload; remaining-stock correction works. Continuous camera uses a mocked camera in tests; physical iPhone/Android still unverified. |
| Reminders, menus, cooking tools, combined prep | phase1, menus, cooking, prep and connected UI suites; recorded browser journeys | Implemented; menu hidden-field fix verified. Wake lock/background timing remains device-dependent and unverified physically. |
| Broad rated recipes, dessert, savoury baking and sources | catalogue suites and source registers; discovery policy | 993 qualifying publisher snapshots plus 45 labelled original examples; two earlier source recipes retained for saved references. No absolute best-rated ranking. |
| Uniform mobile layout, tap targets, labels, focus and navigation | recorded route checks at 320/390/430/1280; focus tests; screenshots; scanner and prep 320px checks | Substantial browser evidence; not proof of every dialog/input combination or Safari rendering. |
| Static hosting, branch/PR delivery, no runtime secrets | index/package/server files; barcode relay config; merged PRs and exact Pages/asset evidence | Static frontend preserved. User-authorized optional Cloudflare fallback is distinct from frontend hosting. |

Test paths in this table are under `tests/`. Source decisions are under `docs/catalogue/`. See the historical audit for the exact browser flows and limitations rather than treating test names as physical-device proof.

## Remaining work with explicit exit checks

The [omitted-quantity register](catalogue/omitted-quantity-review.json) now records 36 source decisions: **34 corrected recipes, two reviewed optional/conditional omissions, zero pending**. The remaining two heuristic matches are intentional omissions. Run node scripts/review-omitted-quantities.cjs to identify new unregistered candidates. Every registered correction is covered by scaled shopping, reload, ingredient-exclusion and once-only deduction tests. The narrower numeric-plus queue also has zero pending entries. These finite reviews do not establish universal accuracy of all imported quantities.

1. **Imported recipe accuracy:** Known omissions in the registered queues are resolved. Retain publisher links, explicit conversion estimates and compatible stock identities. Any further suspect quantity or conversion found during use or review must be checked against the actual publisher before changing it. Do not bulk rerun the original scratch importer: it discarded some required lines containing adjustment wording. The watercress estimate uses the documented 34g-per-cup chopped-raw reference; the recipe's leaf packing can vary.
2. **Dialog coverage:** [dialog-verification.md](dialog-verification.md) now records evidence and gaps per dialog, including a nine-dialog exact-state/focus cancellation regression plus pantry-link, correction, discard and defrost draft coverage. Close remaining evidence gaps using this explicit matrix of normal, invalid and cancelled states for save/copy menu, pantry ingredient/link, pack/purchase correction, recipe/side selection, batch creation/allocation, stored booking/defrost/correction, backup restore and scanner fallback. Existing evidence can be reused when it covers the exact state. Check 320px overflow, visible primary action, focus return, and no mutation on cancel/failed save. Record untested combinations rather than claiming all dialogs checked.
3. **Physical phones:** on the user's iPhone, open Pantry once, allow the camera, confirm several different barcodes continuously, select a half-used pack, reload, then update one item's remaining amount. Verify actual saved quantities and one recipe deduction. Also check keyboard obstruction and return from a backgrounded timer. Android/WebKit support claims require corresponding device/browser evidence; desktop mocks cannot supply it.
4. **Final gate:** run the appropriate complete regression suite after remaining functional changes; review the requirement table again; verify the exact final Pages commit and public files. Do not mark the overall goal complete while a required check is still unverified.

A live retailer product catalogue, arbitrary image recognition and advance booking of uncooked batch portions are extensions, not evidence that the delivered manual/scan/pack workflows are broken. Their status must stay explicit rather than being silently presented as implemented.
