# Whole-app completion audit

Goal: a comprehensive, simple, uniform and functional Three Plates across Choose, Plan, Shopping, Pantry and Settings. This register records evidence; it is not a claim that the whole goal is complete. User decisions override the original handover: shared Choose/Batch screen, simple meal and headcount controls, broad rated catalogue, scanning and used-stock adjustments.

## Verified release baseline
- Main 50cdec2 (PR #2): Pages run 36490963520 succeeded, all 16 checked public assets matched v3.7.0, and the live Pantry opened the redesigned scanner. Earlier live UPC fallback checks also passed.
- The user verified the previous scanner on iPhone. That does not establish the redesigned continuous-camera behaviour.

## Implemented on the current feature branch
- The scanner and consistency changes below are now in the verified v3.7.0 release. Branch feat/pantry-use-soon adds optional ingredient reminder dates, due-soon ordering and ingredient-search actions; it is not yet deployed.
- Reminders survive validated migration, barcode additions, stock corrections and purchases. Linking combines dates conservatively; full consumption clears the reminder. Existing v1/v3 entries need no dates.
- Camera opens immediately; compact product confirmation, partial-pack slider, consecutive saves and remaining-stock correction.
- Explicit product-to-recipe linking combines stock and remaps remembered full-pack quantities. Editing cannot silently overwrite another ingredient.
- Shared in-app confirmations for removal, cooking, freezing, meal replacement, backup restore, reset and batch-size adjustment. Forgetting barcode matches uses inline confirmation. No native confirm/prompt calls remain in the active app/scanner scripts.
- Shared portion steppers; searchable Pantry, ingredients and cuisines; active-trip labels in pack dialogs and copied lists.
- All app changes require persistence. Failed writes roll back; restore detects intervening saved-data changes; failed reset attempts to restore removed keys.
- Existing IDs, v3 backups, measured-unit separation, purchase history and three-choice workflow are retained.

## Verification evidence
- Reminder browser check: saved Pasta with a reminder, reloaded, and opened ingredient search with existing meal/filters retained. Desktop screenshot inspected. The viewport override returned successfully but DOM width stayed 1280; the new panel's narrow-phone rendering remains unverified. Temporary viewport overrides were reset.
- Full regression suite recorded separately in README and PR; targeted tests cover the newest confirmation/recovery paths.
- Connected UI test: 100 g existing pasta + 500 g purchased - 180 g cooked = 420 g remaining after reload. Finished cooking has no repeat action.
- Local browser: a real partial product saved as 200 g and survived reload. A separate product linked to Pasta and retained 250 g after reload. Test stock was removed using the new in-app confirmation and reload verified cleanup; production stock was untouched.
- Current page states checked at 320, 390, 430 and 1280 px: no horizontal overflow on Choose, Plan, Shopping, Pantry or Settings. Batch and two prepared-meal cards also fit at 320 px.
- Scanner at 320 x 844: name, slider and save button visible without scrolling (button y=569–617). Reset confirmation and cancellation checked at 320 px without deleting data. Viewport overrides restored afterward.

## Remaining whole-goal work
- Inspect remaining dialogs and alternate states: keyboard/focus, labels, touch targets, overflow, navigation clearance and long product names.
- Complete real-browser ordinary meal and multi-batch flows beyond the automated coverage: allocation, fridge/freezer booking, defrosting, eating, discarding and corrections.
- Physical iPhone test of continuous scanning, several products, opened packs and stock updates.
- Review large-catalogue performance, component/side classification, ingredient equivalence and exclusions across imported ingredients.
- Continue the handover's Phase 2 direction: finish phone verification of use-soon reminders, then richer sides, cooking aids, reusable weeks and prep checklists. Keep this broader scope visible.
- Release via PR and verify the exact Pages run and live assets after merge. Do not equate committed code with deployment.

## Limits to communicate
Recorded dates cannot prove actual food safety. Recipe-specific freezer suitability and independent kitchen validation remain unknown. Lookup can miss products or be rate-limited. Custom products need explicit recipe linkage. None of these limitations justifies weakening data preservation or silently inventing verified facts.
