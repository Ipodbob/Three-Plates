# Whole-app completion audit

Goal: a comprehensive, simple, uniform and functional Three Plates across Choose, Plan, Shopping, Pantry and Settings. This is an evidence register, not a completion claim. User decisions override the original handover: shared Choose/Batch screen; simple meal and headcount controls; broad rated catalogue; scanning and used-stock adjustments.

## Verified baseline
- main f8d37ec: Pages build 36483515025 succeeded; frontend assets matched release; live UPC fallback worked.
- PR 2 scanner branch: 108 tests passed before the broader consistency pass; real local browser verified scan lookup, explicit save, reload and stock removal. iPhone camera worked on the previous release, per user.

## Current work
- Main stock/meal actions now use shared in-app confirmations with cancellation and single execution. Plan portion editing uses the shared stepper. Full suite: 119 passing tests.
- All five pages checked at 320/390/430/1280 px in their current populated/empty state: no horizontal overflow. Prepared meals (two containers) and Batch also fit at 320 px. Scanner review at 320 x 844 displayed name, slider and save button without scrolling (save button y=569–617). Viewport override reset afterward.
- Full suite now passes 117 tests. Browser verified custom product -> recipe ingredient -> reload with 250 g retained. Cleanup initially hit a native dialog timeout. Recovered in a fresh tab; new in-app Cancel preserved stock, Remove cleared the 250 g test item, and reload confirmed removal. Production stock was not touched.
- Product-to-recipe linking combines stock and remaps full-pack barcode quantities after explicit confirmation. Ordinary editing rejects implicit moves between ingredients. Domain and UI regressions cover merging, stale values and overwrite prevention.
- Connected UI test verifies partial pantry -> whole-pack purchase -> transfer -> cook -> reload: 100 g + 500 g - 180 g = 420 g, with no second cooking action.
- Implemented persistence failure atomicity across all forms, not only scanning; no false Saved messages.
- Implemented pantry search, searchable ingredient/cuisine preferences and the active-trip shop label.
- Verification: 111 checks passed before the cuisine control change; five focused UI checks then passed, including the new cuisine add/remove test (112 total tests now). Browser inspection confirmed searchable controls render on Pantry and Settings.
- Keep stable IDs, v3 storage, measured-unit separation, bought history and three-choice workflow.

## Still to verify or complete
- Complete remaining dialog and alternate-state review beyond the verified page-width checks; keyboard/focus, touch targets, screen-reader labels, overflow and navigation clearance.
- End-to-end ordinary meal -> plan -> shopping -> purchase -> pantry -> cook, including already-owned stock and repeat cook prevention.
- Multi-batch -> allocation -> fridge/freezer -> booking -> defrost -> eat/discard/correct; side-only shopping and retained history.
- Scanner review on physical iPhone after stream-reuse changes; missing products, multiple packs, partial products, recipe linkage and use-mode terminology.
- Settings/backup/export/restore/reset, cross-tab conflicts and all failed-write paths. Existing tests cover subsets; inspect actual interaction before broad completion claims.
- Large-catalogue performance and quality: distinguish recipes/components/sides; maintain ingredient equivalence, source assumptions and exclusions across new ingredients.
- Assess Phase 2 directions from handover after core audit: use-soon dates, richer sides, cooking aids, reusable weeks and prep checklists. Do not silently redefine the whole-system objective to the scanner alone.
- Publish reviewed changes via feature branch/PR; after any authorized merge, verify exact Pages run and live assets again.

## Known limits
No app can verify actual food storage safety. No paid catalogue or cloud account required. Product lookup can miss items or be rate-limited. Recipe-specific freezer suitability and independent kitchen validation remain unknown; expose that honestly. New scanners default to custom products; recipe ingredient matching must remain explicit unless equivalence can be established.

Remaining native confirmations: replacing a meal, backup restore, complete local reset, optional batch-size adjustment and forgetting scanner matches. Review these for consistent in-app handling; do not weaken consent for data replacement.
