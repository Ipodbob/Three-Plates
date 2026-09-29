# Whole-app completion audit

Goal: a comprehensive, simple, uniform and functional Three Plates across Choose, Plan, Shopping, Pantry and Settings. This register records evidence; it is not a claim that the whole goal is complete. User decisions override the original handover: shared Choose/Batch screen, simple meal and headcount controls, broad rated catalogue, scanning and used-stock adjustments.

## Verified release baseline
- Main 8367ded (PR #19): Pages run 36508219070 succeeded, all 21 checked public assets matched v3.11.10, and a fresh live navigation displayed v3.11.10. This release includes the defrost save-recovery fix. Earlier live scanner and UPC fallback checks also passed.
- The user verified the previous scanner on iPhone. That does not establish the redesigned continuous-camera behaviour.

## Implemented on the current feature branch
- Recipe views opened from Plan and Batch use the selected record's portions, not the Choose filters. Stored meal views show fresh-side amounts separately, with already-cooked ingredients collapsed as reference. Prepared lot views show the original cooked batch quantities. Contextual views do not offer an accidental duplicate planning action.
- The scanner and consistency changes below are now in the verified v3.7.0 release. Optional ingredient reminder dates, due-soon ordering and ingredient-search actions are deployed in v3.7.2.
- Reminders survive validated migration, barcode additions, stock corrections and purchases. Linking combines dates conservatively; full consumption clears the reminder. Existing v1/v3 entries need no dates.
- Camera opens immediately; compact product confirmation, partial-pack slider, consecutive saves and remaining-stock correction.
- Explicit product-to-recipe linking combines stock and remaps remembered full-pack quantities. Editing cannot silently overwrite another ingredient.
- Shared in-app confirmations for removal, cooking, freezing, meal replacement, backup restore, reset and batch-size adjustment. Forgetting barcode matches uses inline confirmation. No native confirm/prompt calls remain in the active app/scanner scripts.
- Shared portion steppers; searchable Pantry, ingredients and cuisines; active-trip labels in pack dialogs and copied lists.
- All app changes require persistence. Failed writes roll back; restore detects intervening saved-data changes; failed reset attempts to restore removed keys.
- Existing IDs, v3 backups, measured-unit separation, purchase history and three-choice workflow are retained.

- Released v3.8.0 adds saved seven-day meal menus, optional headcount changes and atomic conflict/preferences checks. Stored slots become fresh recipes with sides, without copying reservations or changing stock. Old backups remain valid. The menu dialog was also checked on the live site.

- Released v3.8.1 adds 54 reviewed metadata corrections and progressive search display. No recipe identities, source ratings or ingredient quantities change. Two former bake classifications retain their historical portion limit so old plans and menus remain readable.

- Released v3.9.0 adds 44 recipe sides for fresh and stored plans, preference-aware search, ingredient/method previews and touch steppers throughout recipe/allocation dialogs. Recipe side links persist through backup and menu copy. A discovered old 1,000-entry pantry truncation is removed. Sweet protein balls are classified as snacks rather than dinner sides.

- Released v3.10.0 adds persisted ingredient and original-method checks, publisher method links, named pause/resume timers, opt-in screen wake and fallbacks. Changes use the existing atomic persistence path and never deduct stock until the existing finish action. Changed quantities require a confirmed checklist reset. Mobile shortcuts reach ingredients, method and timers, with the close control kept visible.

- Released v3.11.0 adds a saved, searchable combined ingredient checklist for up to 20 meals/batches, with per-recipe amounts and cooking links. Stored meals add fresh sides only. Changes invalidate affected ready checks, and finished/removed meals leave the totals. Prep checks never change pantry, cooking progress, timers or finish status.

- Released v3.11.1 removes remaining count cutoffs for custom products, meals, batches and lots. Damaged v3 records fail safely before saved data replacement. The formatted-backup limit increases from 2 MB to 20 MB, and menu copies can extend histories beyond 1,000 meals.

## Verification evidence
- Seafood preferences: 206 full-suite checks passed, plus four targeted checks after adding pollock/hake coverage. 74 explicit imported/base ingredient identities covered by the broad exclusion, including pollock, hake, shrimp, scallops, stocks and sauces. Oyster mushrooms are excluded from the family. Targeted checks cover every consuming recipe, raw/cooked stock separation, unchanged saved preferences, specific salmon/prawn scope, compact group reload/removal and unchanged catalogue quantities. Browser verified the single chip survives reload, excludes shrimp piccata, and removing it restores the recipe. Isolated test settings were cleared afterward.

- Diet/navigation review: all 203 checks passed. Eleven incorrect Vegetarian classifications corrected against included ingredient records and linked publisher pages. Seven now use meat and four fish; tests exercise vegan, vegetarian, pescatarian and unrestricted preferences. Saved ingredient quantities and identities remain covered by the catalogue preservation regression. Browser: shrimp piccata disappears under Vegetarian and returns labelled Fish without a diet filter. Skip to content was reproduced redirecting Pantry to Choose; it now retains Pantry and focuses main. The regression covers all six routes without saved-data changes. Isolated test filters were restored afterward.

- Preference/pack validation: all 201 checks passed. Malformed current-format preference lists, diet/equipment fields, pack containers, retailer keys and discarded pack records now reject restore instead of silently dropping entries. Domain checks retain valid preferences and exact/pack overrides, tolerate omitted optional fields and retain v1 compatibility. Connected UI covers save blocking with original text intact and rejected imports before replacement confirmation. Real browser retained Vegan and disabled slow-cooker preferences across reload without a storage warning; local test preferences were restored afterward.

- Rating policy: all 197 checks passed. Boundary/malformed-rating checks enforce 4/5 and five whole-number ratings for publisher discovery. Connected UI proves the low-count soup disappears from search while its saved plan still opens, explains its status, and generates shopping. Local browser verified the empty exact search and 993-rated-recipe count in Settings. Existing original examples stay visibly unrated.

- Search-draft fix: all 195 checks passed. Three connected UI regressions cover independent Choose/Batch drafts across method/headcount/navigation changes, no per-keystroke persistence, submit/reload, clear/reset, storage-failure retry and pantry shortcuts. Browser reproduced the original loss and verified pesto survives Hob selection and a Batch round trip while bolognese stays independent; Search then applies the correct text. Test filters were restored afterward.

- v3.11.3 method review: six no-bake method classifications corrected against the linked publisher instructions, with visible preparation notes. Hob-cooked no-bake cookies and custard remain Hob; cold assembly with kettle water or melted butter is described explicitly. The longer-time filter now includes additional-time recipes. Browser verified mini cheesecakes under No cook, the optional crust note on both card and dialog, and lemon cheesecake under Longer / extra time + Hob. Recipe identities, source snapshots, quantities and existing plan requirements remain covered by the catalogue preservation regression.
- Rating snapshot audit: 993 of 995 linked recipes meet 4+ stars and 5+ ratings. Two existing Workweek Lunch editorial selections have 3 and 2 ratings, with selection reasons stored and displayed. The v3.11.5 branch excludes these from new Choose/Batch discovery while preserving saved references and quantities. This is a stored-data audit, not a refresh of every live rating.

- v3.11.2 branch: all 190 checks passed. Four new DOM regressions verify 1,101 finished records render in pages of 20, search reaches older records, saves remain unchanged, and native/button dialog closure restores focus after rerender. Real browser: finished a synthetic meal, searched its ISO date, cleared the search, and closed its recipe back to the Recipe button. Search controls were inspected at 320px. Isolated port-4174 data only.

- Large-history fix: all 186 checks passed, including eight new domain/connected UI regressions. Verified 601 custom products, 1,101 meals, 1,002 batches/lots and a formatted 9,000-meal backup above 2 MB. Connected UI proves a later preference save retains every custom stock record and damaged stock leaves the original saved text untouched.
- Correction browser check: recorded five refrigerated portions, discarded one, then corrected back to five. The increase control stopped at capacity; cooking time/deadline stayed unchanged and the result survived reload. The correction form's stepper and date/time field were visually inspected at 320px. Isolated port-4174 records only.

- Combined prep: 178 full-suite checks passed, followed by ten targeted prep checks after search/date-order polish. Browser: two- and three-portion meals combined to 450 g pasta; its ready check survived reload. At 320 px, ingredient search and expansion showed the separate 180 g / 270 g shares. Finishing the first meal changed the total to 270 g, cleared the affected ready check and displayed an explanation. Isolated port-4174 data only.

- Cooking mode: full suite 166 passed; 14 targeted follow-up checks passed, including two added regressions for delayed dialog close events and expired alert cleanup (168 checks now in the suite). Real browser: two checked items and a one-minute timer survived a reload; the elapsed timer displayed Time's up on return. The 320px checklist and timer cards were visually inspected, including the sticky Close control. Changing from two to three portions required an explicit reset and then showed 270 g pasta; a new timer counted down correctly after reset. These are isolated port-4174 test records. Physical iPhone wake-lock and timer behaviour remains unverified.

- Meal sides: full suite 154 passed, with targeted follow-up passing after the dynamic day-limit improvement. Browser: radish side survived reload and scaled to 340.2 g when a fresh meal changed from two to three portions. Six bolognese portions were split two fridge/four freezer; the two fridge portions were booked with roast potatoes. Shopping contained the 500 g potato side, not the cooked beef ingredients. Recording eaten left 500 g of a 1,000 g potato stock and four freezer portions after reload. The side picker was inspected at 320 px; its initially small search field was corrected. These were isolated port-4174 test records, not production pantry data.

- Catalogue quality: 145 checks passed, including all 1,040 recipes migrating with unchanged planned quantities, preserved recipe/ingredient/source data, savoury meal categories, baking sides, corrected microwave filters, progressive search and keyboard focus. Real browser: chicken search starts at 12 of 148, Show more reveals 24 and focuses the first new heading; microwave macaroni is found under Microwave. Its recipe dialog was inspected at 320 px.

- Menu suite: 140 total checks pass. Domain tests cover five stored lunches copied as fresh meals, unchanged reservations, side shopping and once-only deduction, backup validation, conflicts and baking yields. Connected UI verifies save/copy/reload/delete. At 320 px, the real browser saved a menu, rejected an occupied date, copied two portions as three into a new week and retained both after reload.

- Real browser: ten-portion variety planning proposed six portions of bolognese and four of dhal. Both batches were recorded cooked; bolognese split into two fridge and four freezer portions, dhal into four freezer portions. Booking two fridge portions with pasta left only 180 g pasta on Shopping after both batches were cooked.
- Real browser: booking and partially defrosting two freezer portions left the other two frozen. Both meals were marked eaten. A 500 g pasta purchase minus the 180 g side left 320 g after reload. Temporary active test stock was removed/discarded; the original six prepared portions remained. Test history records remain locally.
- This workflow exposed a save-reload failure: a whole-second defrost completion could precede its millisecond start within the same second. Regression and browser recovery are verified. The isolated data fix was merged and verified live as PR #4. It does not require resetting or replacing saved data. Full release suite: 125 passed. Full feature-branch suite: 133 passed.
- Reminder browser check: saved Pasta with a reminder, reloaded, and opened ingredient search with existing meal/filters retained. Desktop screenshot inspected. The browser viewport override was ineffective; a local fixed-width iframe preview resolved that limitation. Actual narrow layouts were inspected at 320, 390 and 430 pixels, including long product names. At 320 pixels, reminder entry/reload/search, planned recipe amounts and modal close controls were exercised. Shopping and Settings layouts were also inspected. This is browser layout evidence, not a physical iPhone camera test.
- Narrow preview revealed squeezed pantry item names; phone rows now give the ingredient name a full row above quantity and actions. Preview-origin test records were cleared separately from the original local app and live site.
- The development server returned 404 for the vendor barcode decoder. It now serves the exact pinned bundle; HTTP tests verify the bundle, case-sensitive app path and rejection of metadata/dependency/script paths. The corrected server was verified on port 4174; Windows denied process inspection of the older 4173 server, which was left running.
- Full regression suite recorded separately in README and PR; targeted tests cover the newest confirmation/recovery paths.
- Connected UI test: 100 g existing pasta + 500 g purchased - 180 g cooked = 420 g remaining after reload. Finished cooking has no repeat action.
- Local browser: a real partial product saved as 200 g and survived reload. A separate product linked to Pasta and retained 250 g after reload. Test stock was removed using the new in-app confirmation and reload verified cleanup; production stock was untouched.
- Current page states checked at 320, 390, 430 and 1280 px: no horizontal overflow on Choose, Plan, Shopping, Pantry or Settings. Batch and two prepared-meal cards also fit at 320 px.
- Scanner at 320 x 844: name, slider and save button visible without scrolling (button y=569–617). Reset confirmation and cancellation checked at 320 px without deleting data. Viewport overrides restored afterward.

## Remaining whole-goal work

- Inspect remaining dialogs and alternate states (recipe/modal number fields now use the shared touch steppers; remaining states need inspection): keyboard/focus, labels, touch targets, overflow, navigation clearance and long product names.
- Continue remaining correction-dialog checks (partial discard/capacity restoration now verified at 320px). The ordinary fresh-meal browser check passed: 100 g pasta + 500 g purchased - 180 g cooked = 420 g after reload. Multi-batch allocation, fridge/freezer booking, partial defrost, eating, side deduction and discard now have browser evidence above.
- Physical iPhone test of continuous scanning, several products, opened packs and stock updates.
- Review large-catalogue performance, component/side classification, ingredient equivalence and exclusions across imported ingredients. The v3.8.1 review corrects 54 identified role/category/method errors, including Radishes and Microwave macaroni. Full independent kitchen/ingredient validation remains incomplete.
- The handover's cooking aids and combined prep are released. Large-history preservation is released; history navigation and focus changes are released; no-bake filter corrections are released; search-draft preservation is released; publisher-rating discovery policy is released; preference/pack validation is released; diet classification and skip-link fixes are released; seafood preference coverage is verified live as v3.11.8 (PR #17, Pages run 36507041960, 21 matching assets). Use-soon reminders and their responsive layout are verified in-browser; physical-device checks remain distinct.
- Release via PR and verify the exact Pages run and live assets after merge. Do not equate committed code with deployment.

## Limits to communicate
Recorded dates cannot prove actual food safety. Recipe-specific freezer suitability and independent kitchen validation remain unknown. Lookup can miss products or be rate-limited. Custom products need explicit recipe linkage. None of these limitations justifies weakening data preservation or silently inventing verified facts.

## v3.11.9 meat preference review

- Added explicit preference-only mappings for 69 chicken, 42 beef and 38 pork ingredient variants; broad groups render as one removable chip. No stock, quantity or saved-ID migration.
- Full suite: 208 checks passed; three targeted regressions also passed after final generic-steak review: catalogue preservation, ingredient coverage/false-positive checks and group reload/removal. Browser verified all three chips survive reload and can be removed. Temporary preferences were cleared.
- Unspecified sausages and mixed cured meats still require review; this is not a claim of complete ingredient validation. Release verification pending.

## Pack editor review

- Browser reproduced an exact-weight save blocked by a zero pack size. Disabled unused size validation now allows saving, and the exact-weight choice survives reload. Returning to pack mode restores required validation; a connected UI regression checks product metadata retention as well.
- The mobile editor now puts Save before expandable optional product details. Inspected in a 320px iframe. 209 full-suite checks passed. Browser screenshot confirms Save is visible and the dialog fits at 320px. Temporary test meal, pack override and search were cleared; release verification follows merge.

## Multiple-tab data preservation

- Added pre-save comparison against the last read/written saved text, covering delayed storage events. Full-clear events now pause stale tabs too; a visible Reload saved data action recovers. Restore and reset update the baseline.
- Targeted regressions preserve newer pantry records and keep cleared storage absent, both before and after event delivery. Browser: changing one tab to Vegetarian paused another tab; its Reload action loaded Vegetarian, after which the original preference was restored.
- No production data changed. This protects stale saves; it is not a claim of atomic concurrent transactions across devices.

## Requirement reconciliation (29 September)

The handover is a brief, not evidence of completion. Later user choices supersede its separate Batch navigation tab with the shared Choose/Batch screen; recipe expansion and the barcode relay were subsequently requested explicitly.

| Requirement | Current evidence | Outstanding scope |
| --- | --- | --- |
| Three choices, refresh/keep, search and shared meal/batch controls | Core/DOM regressions and recorded browser search/filter checks | Remaining alternate UI states |
| Batch allocation, reservations, once-only deductions and fresh sides | phase1/sides tests; recorded browser split, defrost and consumption checks | Further correction-dialog inspection |
| Optional pack estimates, trip shop, actual purchases and leftovers | phase1 tests for trip snapshots, corrections and unknown packs; shopping browser arithmetic and pack-editor checks | No live retailer catalogue is promised |
| Migration, backup, failed saves and saved-data preservation | v1/v3 roundtrips, damaged-data rejection, large histories and storage-failure tests | Ongoing validation review; stale-tab guard in current change |
| Menus, reminders, cooking aids and combined prep | Dedicated domain/UI suites and recorded browser workflows | Physical phone wake/timer behaviour |
| Broad rated catalogue with dessert and baking | 993 qualifying publisher snapshots, source links, metadata preservation and discovery tests | Ambiguous imported ingredients and independent quantity review; no absolute best-rated claim |
| Barcode addition, partial packs and used-stock correction | Barcode/relay suites, saved partial pack and stock-link browser checks | Physical iPhone continuous camera, multiple products and reload |
| Uniform responsive UI and accessible interactions | Six routes inspected; 320–1280px previews and focus regressions | Remaining dialogs and device keyboard/camera interactions |
| GitHub Pages and PR delivery | Exact merge/run and public asset proofs for each release | Verify each new release separately |

Independent kitchen testing of every publisher recipe is not a deliverable claimed by this app; the planning-estimate label remains necessary. Physical-phone checks are not substituted by DOM tests.

## Favourite ingredient consistency

- Fresh and batch ranking now expands the reviewed favourite ingredient families, so imported cuts receive the preference weight too. Exclusions still win. The UI renders broad favourites as one chip, preserving existing anchor IDs.
- Domain checks verify imported ground chicken receives extra weight in both modes, vegan chicken does not, exclusions still reject the dish, and saved IDs round-trip. Connected UI checks reload and removal without changing an unrelated exclusion. Browser verified the compact Chicken group survives reload and removes cleanly; test preference cleared.

- Verification accounting: the full run passed 212 checks and failed the new UI test because its setup selected the same liked and excluded group. Existing conflict handling correctly removed the favourite. After correcting the test to use an unrelated exclusion, both new targeted checks passed. No production code changed after that full run.

## Sausage and cured-meat review

- Reviewed all 18 previously unmapped sausage/chorizo/pepperoni ingredient identities. Ten map to pork using publisher definitions, categories or explicit substitutions. Eight retain unspecified/variable species and are omitted under broad meat exclusions only. The source register records each decision; no uncertain identity is boosted as a favourite.
- Targeted checks cover every consuming recipe, unrestricted discovery, unchanged stock separation and original catalogue preservation. Browser verified Air fryer sausages disappears with Pork excluded and returns after removing it. Test filters were restored.
- This resolves the recorded sausage ambiguity through explicit uncertainty handling; it does not claim independent validation of all imported quantities or product labels.

- Four further beef classifications corrected: Philly cheesesteak, Beef Rice Noodles, Beef Steak Marinade and Thai Steak Salad. A catalogue-wide regression checks all recipes containing reviewed meat against vegetarian, vegan and pescatarian diets. Full suite passed 214 checks before these final four metadata corrections; all 12 catalogue-review checks passed afterward. Browser verified Beef Steak Marinade disappears under Pescatarian and returns unrestricted. Test preferences restored.

- The steak marinade recipe includes two steaks and their cooking method; corrected its component-only role to a main for Lunch/Dinner. Browser confirmed the corrected main appears unrestricted, disappears under Pescatarian, and returns when the diet is removed. All 12 catalogue-review checks passed after the final role correction.

## Seafood diet consistency

- Greek-style roast fish and Peppered mackerel & pink pickled onion salad contained explicit fish ingredients but were labelled vegetarian. Publisher pages confirmed pollock and smoked mackerel respectively; both now use Fish, preserving portions and dish roles.
- Catalogue-wide regression covers every recipe containing the 74 reviewed seafood identities: all reject Vegetarian/Vegan. Both corrected recipes remain allowed for Pescatarian. Browser verified Greek-style roast fish disappears under Vegetarian and returns labelled Fish under Pescatarian. Test settings restored.
- A separate read-only inventory review found no non-meat classifications among recipes containing named lamb, turkey or gelatine ingredients. Vegan recipe ingredient-name review found plant alternatives (coconut/oat/soy milk, vegetable stock, nut butter), not animal dairy among the inspected matches. This is ingredient-record review, not label/allergen validation.

- Seafood diet release validation: all 216 full-suite checks passed.

## Remaining compact touch targets

- Rendered audit found 42px mode/pantry tabs and smaller pantry row buttons. Shared CSS now gives these, scanner fraction presets and summary headings a 44px minimum height; pantry row buttons/presets also have a 44px minimum width.
- Browser measured mode tabs, pantry tabs and Settings summary headings at 44px; pantry Edit/Remove measured 44 by 44px. A 320px pantry screenshot was inspected with stock present. Temporary 500g Pasta test stock was removed and reload completed.
- CSS-only change plus release version. `git diff --check` passed; no new calculation logic or test suite rerun was needed. Prior functional baseline remains 216 passing checks. Physical phone ergonomics remain unverified.

## Pepper preference aliases

- Reviewed 15 explicit black/white/green peppercorn and peppermint identities that incorrectly inherited the vegetable Peppers exclusion. A separate preference alias map corrects filtering without rewriting original ingredients, quantities or saved stock. Explicit black-pepper identities now respect the Black pepper exclusion too.
- 64 recipes use these mistaken links; 51 no longer disappear solely because Peppers is excluded. Other recipes with actual pepper ingredients remain excluded. Ambiguous seasonings and compound foods were not inferred from names.
- Regression covers every affected recipe, exact ingredient exclusions, remaining vegetable exclusions and unchanged saved recipe/stock records. Browser verified Grasshopper Cupcakes is available with Peppers excluded; all test settings restored.

- Full release validation: all 217 checks passed (31 core checks and 186 Node test-runner checks).

## Cooking method follow-up

- Publisher methods confirm No-cook chicken couscous uses cooked chicken and hot stock; changed Hob to No cook with an explicit heating note. Quick sushi bowl requires cooking rice; changed No cook to Hob with a cooked-salmon note. Original ingredient identities and quantities remain unchanged.
- Reviewed title/method matches across all air-fryer, microwave, pressure/Instant Pot and slow-cooked titles. The only apparent mismatch was the pork cider hotpot; the publisher confirms both hob and oven, so retained that classification. Smoothie and overnight-oat titles already use No cook; overnight cinnamon rolls correctly use Oven. Title checks are screening evidence, not verification of every recipe method.
- Browser verified couscous appears under No cook and disappears under Hob; sushi bowl does the reverse with Any time selected. Both display preparation notes. Test search and filters restored.

- Corrected Cheesy black bean quesadillas from Fish to Vegetarian using the publisher classification and ingredient list. The method mentions a fish slice as equipment.
- Newly found outstanding ingredient completeness gaps: Lentil & tuna salad, Sardine Salad and Tuna White Bean Salad have no fish ingredient records. Review publisher quantities and saved-plan effects before changing requirements. Miso soup (dashi) and Tteokbokki (eomuk) also need their imported ingredient identities reviewed for broad fish exclusions. These are now explicit outstanding audit items.

- Validation: full run passed 218 checks before the final quesadilla metadata correction; all 16 catalogue checks passed afterward. Browser confirmed vegetarian quesadilla discovery and restored the diet preference. Replaced its misleading fish illustration with flatbread.

## Missing fish ingredients and saved plans

- Restored the three omitted core fish ingredients using publisher package counts: two 160g tuna cans for four servings of Lentil & tuna salad; one 4.4oz sardine tin per Sardine Salad; two 3oz tuna packets for two servings of Tuna White Bean Salad. No drained-weight conversion is assumed. Sizes appear in ingredient names and corrected planning notes.
- Original recipe IDs, quantities and stock identities remain intact. Existing uncooked plans now correctly require the missing fish. Completed records and pantry balances do not change on migration/reload, and a completed meal cannot deduct again. Regression checks cover scaling, shopping, exclusions, exact stock separation and once-only deduction for all three.
- Eomuk is explicitly fish cakes in the publisher recipe and now belongs to broad fish exclusions. Dashi has fish and plant variants; broad fish exclusions omit the unspecified entry without inventing a favourite match. Miso soup explains the uncertainty.
- A scan of omitted-item notes for cans/tins/packets found these three core fish omissions; remaining matches were equipment, optional nuts, serving condiments or greasing. This screening is not proof that all 530 omission notes are correct.
- Browser verified the lentil salad shows one 160g can for two portions and the same one-can requirement on Shopping. Temporary meal removed after verification.

- Full release validation: all 221 checks passed (31 core and 190 Node test-runner checks).
