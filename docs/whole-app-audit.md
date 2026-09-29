# Whole-app completion audit

Goal: a comprehensive, simple, uniform and functional Three Plates across Choose, Plan, Shopping, Pantry and Settings. This register records evidence; it is not a claim that the whole goal is complete. User decisions override the original handover: shared Choose/Batch screen, simple meal and headcount controls, broad rated catalogue, scanning and used-stock adjustments.

## Verified release baseline
- Main 20b7729 (PR #9): Pages run 36501405285 succeeded, all 21 checked public assets matched v3.11.0, and the live Plan/prep entry displayed v3.11.0. This release includes the defrost save-recovery fix. Earlier live scanner and UPC fallback checks also passed.
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

- Branch fix/preserve-large-histories removes remaining count cutoffs for custom products, meals, batches and lots. Damaged v3 records fail safely before saved data replacement. The formatted-backup limit increases from 2 MB to 20 MB, and menu copies can extend histories beyond 1,000 meals.

## Verification evidence
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
- The handover's cooking aids and combined prep are released. Large-history fixes await release verification. Use-soon reminders and their responsive layout are verified in-browser; physical-device checks remain distinct.
- Release via PR and verify the exact Pages run and live assets after merge. Do not equate committed code with deployment.

## Limits to communicate
Recorded dates cannot prove actual food safety. Recipe-specific freezer suitability and independent kitchen validation remain unknown. Lookup can miss products or be rate-limited. Custom products need explicit recipe linkage. None of these limitations justifies weakening data preservation or silently inventing verified facts.
