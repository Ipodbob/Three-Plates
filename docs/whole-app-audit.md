# Whole-app evidence history

For current requirements, release evidence and remaining exit checks, use [current-completion-audit.md](current-completion-audit.md). Entries below are historical observations, not current release declarations.

Goal: a comprehensive, simple, uniform and functional Three Plates across Choose, Plan, Shopping, Pantry and Settings. This register records evidence; it is not a claim that the whole goal is complete. User decisions override the original handover: shared Choose/Batch screen, simple meal and headcount controls, broad rated catalogue, scanning and used-stock adjustments.

## Plant ingredient preferences and pantry cancellation checks

- Corrected 22 explicit plant ingredient preference aliases that the importer associated with dairy milk, including coconut/almond/soya milk, nut butters, soya yoghurt and explicitly vegan butter/cheese. Recipe records, quantities and pantry identities stay intact. Peanut-butter variants retain a peanut-butter preference alias. Exact ingredient exclusions still apply. The publisher-named coconut yoghurt used in dhansak remains excluded for milk, supported by its manufacturer's dairy ingredients; there is no broad coconut keyword exemption.
- Source decisions and IDs are recorded in `catalogue/plant-preference-corrections.json`. Catalogue tests cover every reviewed ID, actual recipe inclusion/exclusion, unchanged dairy stock and separate coconut-milk deduction. Connected UI test adds a Milk preference, finds and plans the curry, reloads it, then adds Coconut milk avoidance and confirms discovery changes without deleting the existing plan or stock.
- Added valid/invalid draft cancellation checks for pantry linking, portion correction, partial discard and defrost completion, plus whole-lot discard confirmation cancellation. Each compares exact persisted text and checks focus returns; reload retains four thawing portions and unchanged stock. No new UI behavior was needed for these cases.
- Validation: 52 checks passed (29 catalogue, two connected UI, 17 Phase 1 and four menu checks). Latest full-suite baseline remains v3.11.44 with 267 passes. Browser at 320px verified native rejection of a zero usable amount, readable linking form/save action, Close focus return and unchanged 250g after reload. Only the synthetic Audit penne item was removed through its own action; no broad reset. Physical phone keyboards and other matrix gaps remain unverified.

## Remaining numeric-plus quantity candidates resolved

- Verified the final eight candidates against their Good Food ingredient lists and methods. The register `mixed-quantity-corrections.json` records caramel drizzle, poussin oil/allspice, lemon icing/salt, crumble-cake extra sugar, counted mussels, curry coriander/tinned tomatoes, blondie jam sugar and jalapeño brine. The finite queue has 14 corrections and one conditional amount left unchanged, with no pending or unregistered candidates. This is not a complete catalogue accuracy claim.
- Mass, volume and counted stock remain separate. Caramel and brine guidance explains when two requirements can come from one jar. Spoon-weight and pinch estimates are labelled. The lemon cake retains its existing optional candied-peel allowance and now says so. Curry planning uses canned tomatoes; existing fresh-tomato pantry stock is preserved.
- Full regression suite: 267 passed (32 core plus 235 Node checks), zero failures, cancellations or skips. The Node stage took 178 seconds.
- New regression exercises all corrected items at half portions through requirements, shopping, migration, stock deduction and duplicate-cooking rejection. It asserts unchanged weighed shellfish/fresh-tomato stock and preserved caramel/pepper quantities. Browser confirmed curry guidance in Recipe and Cooking, and corrected shopping after reload on isolated localhost:4174. The single test meal was removed via its own action, leaving the plan empty. A broad reset was cancelled following an approval-review rejection; no backup deletion was performed.
- Review also observed a pre-existing coconut-milk-to-milk exclusion alias on the curry. This is a separate preference-mapping follow-up, not established dietary verification of all imports.

## Required yolks and visible egg usage

- Source-verified extra yolks now contribute to whole-egg shopping allowances: New York cheesecake 4 eggs (3 whole + 1 yolk), next-level cookies 3 (1 whole + 2 yolks), smoked-trout tartlets 3 (2 whole + 1 yolk), and Sally cookie bars 2 (1 whole + 1 yolk).
- A visible ingredient-guidance paragraph in Recipe and Cooking explains the full-recipe split, spare whites and scaling. It is outside collapsed source notes. Cooking deducts opened whole eggs once; no spare whites are automatically credited to stock. Only affected recipes gain guidance metadata; unaffected cooking signatures retain their previous shape.
- All 43 catalogue/cooking checks passed, plus three focused recipe UI checks. The new UI regression verifies the visible split, scaled allowance, shopping and cooking guidance. Browser confirmed the full cookie-bar recipe and cooking checklist show the split without expanding notes; isolated data was cleared via Settings. The finite queue now has eight pending candidates.

## Finite quantity review queue and source weights

- Added a read-only candidate screen and a 15-entry source-review queue for numeric-plus amounts still marked omitted. It records two source-confirmed corrections, one previously verified conditional addition and 12 pending decisions. The script detects unregistered matches; zero unregistered entries is coverage of this heuristic, not proof of complete recipe accuracy.
- Good Food hot/spicy sweet potatoes now use the publisher's approximate 500g per potato, two potatoes (1000g total), replacing the generic 400g estimate. The two thyme sprigs required in the parcels are included separately from the existing measured leaves.
- Sally double-chocolate banana bread includes 135g chocolate in the batter plus the publisher's explicit 22g topping (157g total). Hot water remains outside shopping, with a reminder to follow the method.
- All 27 catalogue checks passed; the existing migration/shopping/once-only-deduction test now exercises all three changed quantities. Browser verified scaled amounts and the full six-portion sweet-potato recipe with its separate leaves/sprigs and revised notes. Isolated preferences were cleared. Other pending sources have not been automatically corrected.

## Required gelatine and chocolate topping

- Publisher verification identified a missing 1 tsp gelatine in Good Food Baileys cheesecake, in addition to its separate 11g quantity and heaped tsp for the jelly. The spoon identity now totals a nominal 2 tsp, with the heaped approximation explicit. Gram and spoon stock remain separate; no inferred density conversion is added.
- Sally snickerdoodle blondies now include their required white-chocolate topping: 180g dough plus an estimated 11g topping, 191g total. The estimate uses the publisher's 180g-per-cup reference divided by 16 tablespoons and rounded to whole grams; morsel packing varies and the original tablespoon measure is retained in the note.
- Updated the existing source-correction registers and runtime corrections, preserving recipe/ingredient identities and rating snapshots. All 27 catalogue checks passed, including shopping/scaling, unchanged saved stock, once-only deductions, and separate gelatine units. Browser confirmed 11g plus 2 tsp in the cheesecake recipe and shopping after reload. Isolated test data was cleared through Settings. Other imported recipe quantities remain under review.

## Menu and backup cancellation

- Added UI regressions for cancelling an edited menu-save draft, valid/occupied-date menu-copy drafts and a validated backup replacement preview. Exact persisted text and opener focus remain unchanged; the backup cancellation retains the original shop on reload.
- Ten selected UI checks and all four menu-domain checks passed. Browser at 320px showed the occupied-date warning and disabled Copy without horizontal clipping; Close returned focus to Saved menus and reload preserved the original meal. Synthetic test data was cleared on localhost through Settings.
- Updated the dialog evidence matrix to close these particular gaps. Native phone file-picker and keyboard behaviour remain unverified. No runtime/version changes; the earlier full baseline remains 262 checks, with these two additional regressions verified separately.

## Consolidated dialog evidence and full regression

- Added docs/dialog-verification.md to distinguish success, invalid-state, cancellation, narrow-browser and physical-device evidence per dialog. Untested combinations remain explicit.
- New connected UI regression edits and cancels nine dialogs, comparing exact saved text and verifying focus return: pantry add, recipe portions, plan portions, side search, pack size, purchase correction, batch creation, batch allocation and stored booking.
- Full npm test completed successfully against v3.11.40 runtime plus the new regression: 32 core checks and 230 Node checks, 262 total, zero failures/cancellations/skips; Node stage 160.0 seconds. The current completion audit now references the latest deployed runtime and this result. No runtime or version change in this audit.

## Always-stocked pantry form

- Browser reproduction found an invalid amount blocked native Save even when Always stocked was checked and the amount was ignored by the save handler. Amount and reminder inputs now disable for Always stocked, including when opening an existing staple. Toggling back retains draft values and restores native validation. Unit stays available because new custom ingredients still need an identity/unit.
- Twelve relevant pantry UI checks and 22 Phase 1/unmeasured checks passed. The new regression covers invalid drafts, toggle restoration, native submit, reload, cancellation with exact saved-state preservation/focus return, and conversion back to 250g measured stock.
- Browser confirmed the original obstruction, successful save after the fix, disabled inputs on reopening, and return to Edit. A 320px screenshot shows the complete dialog and Save action without horizontal clipping. This is desktop narrow-layout evidence, not physical-keyboard testing. Synthetic pantry data was cleared via Settings on isolated localhost.

## Stored-meal serving time

- Changing Meal in Plan stored portions now updates the suggested serving time until the user edits it. Explicitly chosen or cleared times remain untouched by later meal changes.
- The regression first failed with Breakfast retaining 12:00, then passed with 08:00. It checks successive defaults, custom and blank values, required-field validity, no saved-state changes before submission, persistence after booking/reload, and unchanged pantry stock.
- Four focused UI checks and all 17 Phase 1 checks passed, covering allocation, reservations, migration and once-only ingredient deduction. This entry records automated verification, not physical-phone validation or a live deployment claim.

## Scanner detection, skip and save feedback

- Continuous-camera Skip reused a next-item message starting Saved even though it never committed stock. The next-item transition now receives the actual save outcome; skipping says Skipped. Nothing was saved, while successful confirmation says Saved. Detection also now says Will be added as a separate product instead of Saved as its own product before confirmation.
- All 30 scanner/unit/relay checks passed. The camera regression failed with the misleading pre-fix message, then verified skip preserves the exact saved text and saved count, leaves the stream running, accepts the next scan and saves exactly once. Confirmation and cancellation use separate callbacks so a click event cannot be mistaken for a successful save flag.
- Browser used a real Open Food Facts Nutella lookup via barcode entry, verified the new pre-confirmation text, skipped it and reloaded an unchanged empty pantry. No synthetic stock or matches were saved. Physical iPhone continuous-camera behaviour remains unverified; the camera lifecycle check here uses the existing mocked stream.

## Required topping estimates and pastry salt

- Resolved both pending finishing-ingredient reviews. Cherry pie now includes an estimated 11g for its additional two tablespoons of ground almonds (61g total), plus the exact 0.25 tsp salt in the method. Citrus cake includes estimated 24g syrup sugar (224g total) and 28g icing yogurt (103g total).
- Publisher methods establish that these are required components. The King Arthur Baking weight chart supplies reference cup weights for almond meal, caster sugar and yogurt; two tablespoons are estimated using 16 tablespoons per reference cup, rounded to whole grams. These are labelled planning estimates, not exact density conversions or instructions to replace the publisher's spoon measures. No global stock-unit equivalence is introduced. Source links, arithmetic and decisions are recorded in the finishing-ingredient register.
- All 26 catalogue checks passed, covering source/identity preservation, every new amount, scaling, shopping, migration, and once-only stock deduction. The earlier full baseline remains 256 checks. Browser verified cake totals and the density explanation in Source & quantity notes, then confirmed both totals in Shopping after reload. Test bake and preferences were cleared on isolated localhost.

## Compact recipe view and accessible primary actions

- Recipe method and planning actions now appear beside the portion controls, before the ingredient list. On narrow screens they fill the available width; source methods still open at the publisher. Existing-plan views expose the method without offering a duplicate planning action.
- Long source, import and conversion details are collapsed under Source & quantity notes. The rating, timing note, method notes, measured quantities and unmeasured required-ingredient reminders remain available outside that disclosure. A short visible explanation identifies planning estimates and where to inspect their notes.
- Nine distinct focused UI checks passed across fresh/source/batch/stored/contextual recipes, portion steppers, ratings, required seasonings and the new action/provenance flow. The new test verifies a single planning action, correct external link, full expandable correction text and seven-portion planning without duplicate actions in context. Prior complete-suite baseline is 256 checks; no full rerun claimed for this presentation change.
- Browser inspected both full-width actions at 320px, expanded the source notes, adjusted eight scones to seven and saved the correct plan. Isolated localhost test data was cleared through Settings afterward. No source quantities or saved formats changed.

## Measured egg wash, brushing and pan amounts

- Three source-verified corrections restore a separate glazing egg in Good Food egg-and-bacon pie (five total), 15ml brushing buttermilk in Sally ham-and-cheese scones (175ml total), and up to 56g pan butter in Sally crepes (99g total including batter). The pan value uses the upper end of the publisher range and is labelled a planning allowance. Source decisions are in docs/catalogue/finishing-ingredient-corrections.json.
- The hot-cross-bun milk flag was reviewed and left at 300ml: the method uses that amount and the flour tip allows extra only for dry dough. It is not a mandatory glazing quantity. Cherry-pie extra almonds and citrus-cake syrup sugar/icing yogurt still need reviewed spoon-to-mass decisions and are recorded as pending rather than silently treated as resolved.
- All 25 catalogue checks passed, including the new measured-finishing regression, preservation, scaled shopping, reload and once-only deduction. Prior complete-suite baseline is 256 checks. Browser verified the full eight-scone recipe and Shopping show 175ml buttermilk after reload; isolated localhost records were cleared through Settings.

## Optional menu headcount validation

- The optional people input remained required while hidden. Clearing it (or entering an out-of-range/fractional value) and then unticking Change people per meal left an invisible invalid control that could prevent native form submission. The input is now disabled whenever adjustment is off, and enabled again when selected. Saved yields, date conflicts, food preferences and stock behaviour are unchanged.
- Six relevant checks passed: all four saved-menu domain checks, the existing copy/conflict/reload UI journey and a new native-form-validity regression covering empty, excessive and fractional headcounts. The new regression failed before the fix. Prior full-suite baseline remains 251 checks; no additional full-suite run is claimed.
- Browser verified clearing the enabled field, unticking adjustment, copying a meal week and reloading with both original and copied two-portion meals intact. Synthetic localhost records were removed through Settings afterward.

## Consistent pantry, history and prep searches

- Pantry, finished meals, prep selection and prep ingredient searches now use the same accent/punctuation-tolerant, order-independent word matching as Choose. Finished-meal and prep-selection searches retain exact YYYY-MM-DD matching so date components cannot match a different day. Search never changes quantities or saved selections.
- Prep selection reports how many selected meals are hidden by the current query, provides Clear search with focus returned to the field, and explains empty results. The existing Build checklist action still includes all selected meals, including the explicitly reported hidden ones.
- Reproduced both reordered recipe/date failures before the fix. All 29 focused checks passed: 27 prep/domain/history checks plus both pantry-search UI checks. Prior full baseline is 251; this localized presentation change does not claim a new full-suite run.
- Browser verified reordered recipe/date matching, retained hidden selection, Clear search and the 320px empty state with visible selection status and Build checklist. All synthetic localhost records were cleared through Settings afterward. Physical phone testing remains outstanding.

## Baking ingredients and full-bake classification

- Checked publisher lists and methods for 21 recipes and restored 24 measured ingredient amounts. Eighteen Sally recipes had required flour omitted because the same line allowed extra flour as needed. Existing starter and topping amounts are summed with the restored dough quantities. Two galettes regain measured buttermilk; other corrections include measured brushing milk/buttermilk, brioche egg wash and macaroni topping butter. Exact records and source links are in docs/catalogue/baking-ingredient-corrections.json.
- Six related classification corrections make sweet bakes discoverable under Baking/Dessert, preserve full-bake yields, classify dinner rolls as a side and keep unbaked rough-puff dough as a searchable component. Saved recipe identities, pantry balances, source ratings, completed records and storage formats remain unchanged. Existing uncooked plans acquire corrected requirements.
- The original scratch importer discarded whole lines containing optional/as-needed wording. Do not reuse that importer unchecked. The new regression guards against these numeric flour omissions; this review does not establish that every remaining optional-extra or conversion note is correct. Unspecified handling extras remain unquantified.
- Browser verified the full 16-piece blondie bake shows 291g flour in both recipe and Shopping and retains the requirement after reload. Synthetic localhost test data was cleared through Settings; other origins were untouched. Physical phone validation remains outstanding.

- Validation: all 251 full-suite checks passed (32 core plus 219 Node checks), including scanner, shopping, migration, cooking, prepared portions and the new baking regressions. An initial UI assertion selected a different publisher's same-named pastry; it was corrected to target the intended recipe before this clean run.

## Reviewed guidance in batch dialogs

- A catalogue audit found four batch notes still embedded their pre-correction omission claims: pork casserole, ratatouille, courgette soup and pasta e fagioli. The reviewed planning notes were already correct and their quantities already included the restored ingredients. Catalogue review now replaces the embedded original text while retaining the surrounding batch instructions. No new ingredient amounts, source ratings or storage guidance are introduced.
- Batch creation/editing puts the complete guidance in expandable Recipe notes so long source/conversion explanations do not push the main action down. Base-only and uncooked status remain visible above the notes; original examples retain their notes too.
- All 25 relevant checks passed: 23 catalogue checks (including all recipe identities, source metadata, documented quantities, unchanged non-note batch metadata and saved-plan requirements), plus two batch UI workflows. The note-consistency regression failed before the fix. Browser verified the courgette dialog shows a compact initial view and expands to the corrected spring-onion and required-nutmeg guidance. No synthetic batch was saved; test search was cleared.
- This consistency correction does not verify every remaining catalogue omission note or claim an additional full-suite run.

## Cooked-batch and empty-portion history

- The remaining cooked-batch and empty-container histories rendered every saved record. Both now use a shared searchable archive component: twenty records initially, newest cooking dates first, exact local date search, Clear, and Show older records with keyboard focus on the first added result. Stable record identities, allocations, capacities, stock and storage deadlines remain unchanged.
- Cooked batches now offer contextual Recipe access; the dialog uses original batch portions and labels the batch Cooked rather than Planned. Empty records retain their recipe reference and correction controls. A restored discarded portion leaves the empty archive and returns to active prepared meals without deducting ingredients again.
- All 42 relevant checks passed: 38 history/storage/phase checks plus four connected shopping/batch checks. New regressions exercise 1,002 records in each archive, old-date discovery, focus, unchanged saved data, original recipe portions and restoring one mistakenly discarded portion. Prior full-suite baseline remains 242 checks; this release does not claim a new full-suite run.
- Browser verified creating a two-portion batch, finding its cooked record and original recipe, discarding a container, finding its empty record, restoring one portion and retaining that portion after reload. Synthetic localhost data was cleared through Settings afterward. Physical phone checks remain outstanding.

## Searchable purchase history

- Purchase history previously rendered every saved entry inside its collapsed section. It now uses the same progressive history pattern as finished meals: twenty recent records initially, Show older purchases, search and Clear, with focus maintained after filtering and loading. Every saved record remains available; browsing does not persist changes or trim history.
- Search covers ingredient, shop, local calendar date, status and saved product name. YYYY-MM-DD matches an exact local date; rendered entries include the year. Status labels explain Waiting for pantry, Added to pantry and Replaced by correction while retaining their existing stored values.
- All 40 relevant checks passed (36 history/storage/phase tests plus four connected shopping/batch flows). New checks exercise 1,101 purchases, an old record outside the initial page, shop/date/status search, empty results, clearing, the last partial page, focus and unchanged saved text. The prior full-suite baseline is 242 passing checks; this presentation change did not alter domain arithmetic or storage formats.
- Browser verified correction search, clearing and status change after transfer. Search and Clear controls fit at 320px. All fabricated localhost purchases, stock and plans were cleared through Settings afterward. This remains distinct from physical iPhone testing.

## Purchases covered by later pantry additions

- Found a saved purchase became invisible and uneditable when a later pantry addition covered the recipe requirement: it left To buy but was not treated as a purchase from a changed plan. Bought extras now shows every pending purchase outside To buy, including both covered ingredients and removed plans. Active shopping rows remain single entries, and no amounts or history are rewritten by rendering.
- Connected regressions cover adding 200g existing pasta after recording a 500g purchase, correcting the purchase to 450g, reloading, transferring to 650g stock and cooking 180g once to leave 470g. Removed-plan purchases remain editable down to zero without adding stock. The visibility regression failed before the fix.
- Browser confirmed the 500g extra stays visible, 450g correction survives reload and transfer produces 650g. The correction dialog was inspected at 320px; its input, Save and Close controls fit. Synthetic localhost records were cleared through Settings afterward; other origins were untouched.
- Full validation passed all 242 checks (32 core plus 210 Node test-runner checks), including scanner, migration, catalogue preservation, shopping, stored portions, cooking and prep regressions.

## Cooking timer keyboard continuity

- Reproduced lost focus when Pause/Resume replaced the timer controls. Controls now retain focus on the same timer after a successful change; removing a timer selects the next remaining Remove control (or previous at the end), and removing the last returns to the timer-name field. Rebuilding timers does not move focus from elsewhere in the dialog.
- Pause and Resume accessible names include the timer name, while their compact visible labels remain unchanged. Failed persistence keeps the original control and focus. Timer calculations, saved formats and pantry deductions are unchanged.
- All 26 cooking/prep domain and connected UI checks passed. Regression failed before the change and passed afterward; browser verified Pause Pasta -> Resume Pasta -> Pause Pasta and final removal -> timer-name field. Temporary isolated localhost meal removed after checking. Physical phone and screen-reader interaction remain outstanding.

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

## Narrow batch allocation and prepared-portion dialogs

- Reproduced clipped plus buttons in the batch allocation dialog at 320px: three fixed columns were narrower than the shared stepper's minimum button widths. At mobile widths, allocation fields now use stacked label-and-stepper rows with 140px-wide controls. No calculation or persistence changes.
- Before/after browser screenshots confirmed all minus, value and plus controls are visible. Used the narrow UI to allocate five test portions as one eaten, one refrigerated and three frozen, then corrected the frozen record to two; reloaded and verified one fridge plus two freezer portions. Booked the fridge portion through the narrow dialog without adding shopping requirements.
- Pantry addition, portion correction and stored booking dialogs were inspected for narrow layout. Correction and booking Save actions worked; longer dialogs scroll with their close control accessible. This does not verify physical iPhone keyboard behaviour.
- Used a separate localhost:4174 origin for fabricated cooking records and cleared those test records via the UI afterward. Initial 127.0.0.1:4174 test batch/search also removed. Prior 221-check functional baseline retained; CSS-only fix verified in browser, with git diff --check passing.

## Readable ingredient pickers

- Replaced internal IDs in preference, recipe-link and scanner suggestions with ingredient names and explicit units. Pantry suggestions now use the same labels, so entries such as Milk (ml) and Milk (g) can be selected independently. Saved preference chips also show units. Barcode-specific products show their actual barcode; manually named products are labelled My pantry.
- Exact selected labels resolve before accent-insensitive search; ambiguous bare names do not silently choose the first catalogue entry or create another pantry item. Legacy ID inputs remain accepted internally for compatibility. Ingredient IDs and saved stock units are unchanged.
- Catalogue regression checks every label round-trip, including accented variants and same-name custom products. Connected tests cover unit-specific pantry creation/edit/reload, preference selection and scanner saving. Browser verified Milk (g) saves 125g, edits to 75g and survives reload; temporary stock removed.

- Validation: full run passed 224 checks. After the final ambiguity guard and chip-label adjustment, all 19 catalogue checks and 17 focused pantry/preference/scanner UI checks passed. Browser confirmed readable unit-labelled suggestions, edit/reload persistence and selected preference labels; test stock/preferences cleared.


## Scanner confirmation and real barcode audit

- At 320px, used real Open Food Facts lookups for Nutella (400g, 3017620422003) and Coca-Cola Original (330ml, 5449000000996). The compact confirmation and Add & scan next were visible without scrolling to advanced fields. Saved half the Nutella pack and the full drink in one session; reloaded and verified 200g and 330ml.
- Re-scanned the remembered Nutella in Update amount left, selected half, saved and reloaded: 100g remained and the drink stayed 330ml. This replaces stock rather than deducting a recipe a second time.
- Lookup hid the focused barcode field without moving focus into the result. Product headings now receive programmatic focus without scrolling or saving automatically. Browser verified the detected Nutella heading is active; regression covers first lookup, remembered lookup, mode changes and return to barcode entry after confirmation.
- All 30 scanner unit, UI and relay tests passed. Tests cover mocked camera continuity, persistence, storage failure, cancellation and stock corrections. Real mobile-width browser checks used barcode-number entry; physical iPhone camera/permission/VoiceOver behaviour remains unverified.
- Isolated localhost:4174 test stock and remembered matches were cleared through Settings after verification. The user's saved data on other origins was not touched.


## Flexible recipe search and shopping-to-cooking review

- Reproduced an empty result for `pesto pea pasta` although Pesto & pea pasta was eligible. Recipe search required an exact contiguous phrase. Shared search now requires every entered word, in any order, across the existing recipe search fields. Punctuation, accents, repeated spaces and the and/ampersand conjunction are handled consistently. Fresh, Batch and recipe-side searches use the same matching; recipe IDs, saved queries and preference/method/time gates are retained.
- Browser verified `pasta pea pesto`, `sauce beef bolognese` and `radishes air fryer` return the intended fresh, batch and side recipes. Domain/connected regressions cover reordered words, cross-field ingredient terms, exclusions, method/meal restrictions, planning and query reload.
- Completed a separate browser stock journey: planned Pesto & pea pasta for two, purchased the displayed pack amounts (500g pasta, 1kg peas, one lemon, 50g pesto), transferred purchases and marked the meal finished. Reload retained the expected 320g pasta, 840g peas, half lemon and zero pesto. This verifies the tested recipe/pack path, not every catalogue quantity.
- Fabricated records and preferences on isolated localhost:4174 were cleared through Settings; other origins were untouched. Physical phone checks remain outstanding.

- Validation: all 227 full-suite checks passed (32 core and 195 Node test-runner checks). The final reordered side-query assertion passed separately after its test wording was updated; no production code changed after the full run.


## Required ingredients hidden by optional-extra wording

- Reviewed publisher ingredients and methods for five confirmed omissions. Classic carrot cake retains its 150g self-raising flour and now includes 50g rye flour (the first publisher option), with the all-self-raising alternative explained. Chicken souvlaki now includes the marinade lemon as well as the existing half-lemon for tzatziki. Chicken, mango & noodle salad restores two dressing limes and the missing teaspoon of honey (20ml total). Spinach falafel & hummus restores its hummus lemon. Pasta e fagioli restores 30ml cooking oil; optional serving extras remain separate.
- Source decisions and exact before/after quantities are recorded in docs/catalogue/required-ingredient-corrections.json. Existing IDs, ratings, pantry balances and completed records remain unchanged. Uncooked saved plans now require the corrected amounts. Preservation tests permit only these explicit changes plus the earlier fish additions; targeted tests cover shopping, scaling context, reload and once-only deduction.
- The same noodle-salad publisher method confirms cold assembly with kettle-soaked noodles and ready-cooked chicken. Corrected Hob to No cook and added a preparation note; raw chicken stock remains a separate ingredient identity.
- Browser verified the two-person noodle salad shows one lime and 10ml honey in both recipe and Shopping, appears under No cook after reload, and shows its preparation note. The full carrot cake shows 150g self-raising plus 50g rye flour and the substitution note. Isolated localhost test records cleared afterward.
- Further screening found mixed herb/serving lines in the seafood roast, pork casserole, ratatouille, Thai fried rice, courgette soup and no-cook fajitas. These need publisher checks and defensible units before changing quantities. This release does not claim that all catalogue omission notes or ingredient amounts have been verified.

- Validation: full suite passed 228 checks (32 core and 196 Node checks) before the final noodle-salad method correction. All 21 catalogue checks passed after that correction. Browser verified the final method and quantities.


## Required bunches, leaves and sprigs

- Verified all six mixed herb/serving lines against publisher ingredients and methods. Restored parsley in the seafood roast, basil in ratatouille, coriander in Thai fried rice and no-cook fajitas, spring onions in courgette soup, and the specified bay/sage/thyme bundle in pork casserole. Source decisions and definitions are in docs/catalogue/herb-ingredient-corrections.json.
- Bunches use counted stock identities, separate from gram-based herbs. The casserole uses two bay leaves, three sage leaves and four thyme sprigs per four servings. No assumed bunch weight or leaf-to-gram conversion is introduced. Existing measured stock and completed meals remain unchanged; uncompleted plans acquire the required counts.
- Shared amounts now label these counts as bunches, leaves or sprigs across recipe, shopping, pantry and cooking. Generic count labels correctly use item for a single item. Browser checked a two-person rice recipe, a whole-bunch purchase and a 320px pantry layout; controls and quantity remain visible.
- Courgette soup also requires freshly grated nutmeg without a stated measurement. The recipe now explicitly identifies it as required but unquantified in automatic shopping/deductions. This is a remaining limitation for unmeasured seasonings, not a fabricated exact amount or a claim that the ingredient is optional.
- Initial connected test used the default 30-minute filter, which correctly excluded this additional-time recipe. Using Any time allowed the intended herb workflow; the updated test passed. This was a test setup correction, not a production filter change.

- Browser finished the synthetic meal and confirmed 0.5 bunch remains after reload. The isolated localhost test stock, purchase history and meal were cleared through Settings afterward.

- Final validation: all 231 checks passed (32 core plus 199 Node test-runner checks), including the end-to-end bunch purchase/cook/reload test and all catalogue preservation checks.


## Required ingredients without a measured amount

- Added explicit unmeasured-ingredient metadata for the publisher-confirmed nutmeg in courgette soup. Shopping and copied lists now include a Check amount entry; recipe, Cooking and combined Prep show the same reminder separately from measured totals. No amount, purchase quantity or stock deduction is invented.
- Active fresh plans, uncooked batches and fresh recipe sides contribute reminders. Finished meals and already-cooked stored mains do not. The same ingredient in multiple active recipes retains recipe context. Ingredient exclusions and search include these entries; No shopping excludes recipes needing an unknown amount. Favourite ranking includes the known ingredient identity without pretending a quantity.
- Prep counts explicitly describe measured ingredients. Existing ordinary cooking signatures retain their prior shape; an affected recipe asks for an updated checklist after its required-ingredient information changes. Saved stock, quantities, backups and completed records retain their existing formats.
- Domain/connected tests cover copy, search, exclusions, no-shopping, stored/fresh-side separation, unchanged stock, completion removal, stale affected checks and all displayed workflow stages. Browser verified Shopping, Cooking and Prep display the nutmeg reminder with the source method available. This mechanism currently covers reviewed metadata, not automatic interpretation of every remaining catalogue note.

- Validation: full suite passed 236 checks (32 core and 204 Node checks). After the final favourite-ranking and side-search inclusion adjustment, four unmeasured-domain checks and the connected UI flow passed again. Browser test plan/prep state was cleared through Settings on isolated localhost.


## Explicit always-stocked choice for unknown amounts

- Follow-up review found the new No shopping gate ignored the existing Always stocked — assume enough choice. The gate now accepts an unmeasured ingredient only when that exact pantry identity is explicitly always stocked; an ordinary recorded quantity or a different nutmeg variant does not imply coverage. Measured ingredients must still be sufficient after reservations.
- Recipe coverage, Shopping/Cooking/Prep reminders and copied lists show the same assumption. Reminders still retain the publisher's preparation guidance and never invent a deduction. Unticking Always stocked restores the amount-check requirement.
- All 24 focused checks passed: 22 quantity/phase/unmeasured domain checks and two connected UI workflows. They cover full coverage/no-shopping, reload, changing the flag, different identities, copied labels and unchanged stock. Browser verified an always-stocked nutmeg entry survives reload and contributes 1 of 6 covered ingredients. No full-suite rerun was needed for this localized policy adjustment; prior full baseline was 236 passing checks.

- Browser confirmed Shopping says Always stocked — assumed enough while retaining the method reminder. All fabricated localhost stock, plan and settings were cleared through the UI afterward.

## Visible dialog errors and narrow form checks (v3.11.46)

- A 320px stored-booking test exposed a real feedback problem: the fridge-deadline guard rejected correctly, but its page-level toast was behind the native modal and absent from the active accessibility tree. Added an inline dialog alert for validation/persistence failures, retaining drafts and moving the explanation into view. Other toast feedback is also available inside an open dialog. Reopening starts clean; successful retries clear old feedback.
- New connected tests failed before the fix and now verify the visible alert, retained date/quantity draft, exact unchanged saved text, corrected booking and cancellation focus. The full suite first caught a timer-focus regression from focusing every alert. Cooking's in-place controls now keep their original focus on failed saves while the alert becomes visible; the timer test additionally checks unchanged saved state and successful retry.
- Full regression passed 272 checks (32 core plus 240 Node checks), no failures/cancellations/skips, Node duration 163 seconds. After the final successful-retry feedback clearing adjustment, all three directly affected tests passed again.
- At 320px, checked batch zero-portion rejection and valid four-portion creation, pack zero-size rejection and unchanged default after cancellation, side-picker empty search and radish ingredient preview, booking past its fridge deadline and corrected save, reservation-preserving portion correction, and partial-discard native maximum. Errors/actions were readable. Cancellation returned focus to the relevant opener. Defrost cancellation retained the thawing booking after reload; the automation could not enter the invalid native datetime value, so that particular error layout remains unverified.
- The fabricated two bookings and four portions were individually removed/discarded on isolated localhost:4174. Empty archived portion/cooking records remain; no broad reset or backup deletion was performed. Physical iPhone/Android scanning, mobile keyboard obstruction and background timer behaviour remain unverified. No catalogue-wide accuracy claim is implied.

## Scanner units for existing saved records (v3.11.47)

- The scanner hard-coded g/ml/each/tsp options although valid restored custom ingredients may use kg/l/tbsp. Selecting one left the disabled unit field empty, prevented additions and omitted the unit from remaining-stock previews. The scanner now adds the selected existing unit to its options and keeps it locked. Choosing a new separate product retains only supported g/ml/each options. No stored unit or quantity is rewritten.
- New regression failed before the fix (empty unit instead of kg). It covers all four non-base/spoon units: explicit amount required for an incompatible product weight, additive 4+2 stock, remembered pack/unit, reload and half-remaining correction to 3. All 27 barcode/domain/UI checks and 17 Phase 1 checks passed (44 total). The latest full-suite baseline is the preceding 272-check v3.11.46 run, not a new full run.
- Browser checked the normal manual-entry path separately: four tablespoons becomes 12 teaspoons, then a barcode lookup plus explicit existing-item selection and half-remaining confirmation leaves 6 tsp after reload. Thus the missing kg/l/tbsp options affect valid restored records, not newly normalized manual entries. The synthetic pantry item was individually removed afterward on localhost:4174; no real stock or barcode mapping was saved. The preserved-unit restore cases are connected UI tests, not claimed as physical-phone tests.
- Previous release evidence: PR #58 merged v3.11.46 at 46943cb412d1f858f4edee38e38c02498100ca9e. Pages run 36536530683 succeeded; all 21 checked public assets matched and a fresh browser displayed v3.11.46. Physical phone scanning/keyboard/background checks remain outstanding.

## Scanner repeat-use focus (v3.11.48)

- After camera confirmation or Skip, removing the product card left focus on the document body. Photo confirmation/Skip attempted to focus the manual number input even when its details section was closed. Return focus now follows the current input method: Pause camera while the live stream continues, Use photo after photo results, or the expanded barcode input after manual entry. Pausing or a failed camera restart returns focus to the enabled Start camera control.
- Extended the connected camera/photo/manual tests with saved and skipped paths, exact unchanged stock on Skip, no repeated permission request during continuous scanning, successful partial additions and camera restart failure after a simulated background event. The camera/photo focus assertions failed before the fix. All 27 barcode/domain/UI checks passed afterward. The photo repeat test advances its fake clock through the existing lookup cooldown instead of bypassing provider limits; the manual helper now opens the same details section a user must open.
- A real Open Food Facts lookup at 320px focused the detected product heading. Skip returned to the visible, expanded, empty barcode-number input; the skipped status, lookup action and Done button were readable without horizontal clipping. Done returned focus to Scan barcode. No stock or remembered mapping was saved during this browser check. Photo/camera focus paths use mocked media in automated tests; physical iPhone/Android and mobile keyboard behaviour remain unverified.
- Preceding release v3.11.47: PR #59 merged at 9a4b6bde8c45a3546585313701a25870aff397b2. Pages run 36537079784 succeeded and all 21 public assets matched. An unversioned browser navigation initially displayed cached v3.11.46; navigation with the release query displayed v3.11.47. Do not confuse a cached document with the current public asset check.

## Whole-app checkpoint and defrost evidence (v3.11.48, tests/docs follow-up)

- Re-read the handover against the current requirement matrix and later user decisions. The shared Choose/Batch workflow, expanded rated catalogue and scanner supersede the original separate Batch navigation/deferred expansion. Main was re-fetched and remained 1791eda943f50216289167f1afb3b873d40ee781. No runtime change is made in this follow-up.
- Closed the documented defrost browser gap with one synthetic portion. Future times were rejected by native validation; a completion before thawing began showed an inline error and retained the edited value. Both error layouts were readable at 320px, with the primary action visible. Cancellation returned focus to Fully defrosted and reload retained the thawing reservation. A valid completion then produced Defrosted · fridge and a next-day deadline, both surviving reload. Individual discard removed the test portion and its reservation; archived synthetic history remains.
- Added a connected rejection/correction/reload test with exact saved-text equality on failure and unchanged raw stock/portion count after success. Initial test authoring corrected expectations for native datetime normalization and the existing thawed state value; neither required a production fix. The new test plus two related UI checks and all 17 Phase 1 checks passed.
- Final full regression: 274 passed (32 core + 242 Node), no failures/cancellations/skips; Node stage 148 seconds. The quantity-review script reports two remaining heuristic matches, zero pending and zero unregistered candidates. This is not an exhaustive recipe audit.
- Updated the current audit to the v3.11.48 deployment rather than leaving an older release reference. Pages run 36537734715 succeeded for the exact main commit; all 21 checked assets and the release-query browser version were verified in the preceding turn. Physical phone camera/photo picker, keyboard and background behaviour remain open checks; desktop evidence does not replace them.

## Required quantities hidden by optional-wording import rules (v3.11.49)

- Expanded the finite screen to quantified lines in the Not included clause. It found 36 recipe candidates, separate from the earlier numeric-plus queue: five corrected here, 31 pending source decisions. The read-only script decodes numeric entities before splitting entries and distinguishes water alone from water mixed with food. Matches are review candidates, not automatic corrections or proof of all catalogue quantities.
- Checked publisher ingredient lists and methods for five corrections: Amy + Jacky beef/broccoli adds 22.5g cornflour for its slurry; Sally stamped chocolate cookies add 62g cocoa; chocolate pastry pop tarts include 21g pastry cocoa plus the existing 10g icing cocoa; chocolate and lemon cupcakes each add 480g icing sugar for their buttercream. Source URLs and exact removed omission lines are retained in the register. Unknown extras remain unquantified. Existing ingredient IDs/stock stay intact and methods remain at their publishers.
- The new required-quantity test failed before the data fix. All 51 catalogue/domain checks now pass, including identity/rating preservation, combined shopping with partial stock, scaling, migration and once-only consumption. One connected UI test passes for recipe guidance, full-bake shopping and reload. Initial test authoring used half an odd bake yield, which correctly failed integer plan validation; it now checks a valid full bake. No production validation was weakened.
- Browser verified the cupcake recipe shows its required 480g icing sugar, shopping includes 480g, and the same requirement survives reload. The one synthetic plan was individually removed on isolated localhost:4174 afterward; no stock was purchased. Current whole-app baseline remains the preceding 274 passing checks; this localized follow-up ran 52 relevant checks, not a new full suite.
- Main at start was d68f96640b7e7670fe6e551d91664426b4e5a9c0 (PR #61). Its Pages run 36538742573 succeeded and all 21 checked public assets matched v3.11.48. Pending source reviews and physical phone checks keep the wider goal open.
