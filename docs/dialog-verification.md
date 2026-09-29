# Dialog verification matrix

Reviewed through v3.11.48, main `1791eda943f50216289167f1afb3b873d40ee781`, with the defrost completion follow-up below. Evidence is deliberately separated: jsdom assertions do not prove mobile layout or a physical keyboard experience.

## Shared cancellation check

`tests/ui.test.cjs`: **cancelled dialog drafts preserve saved data and return focus across planning shopping and pantry** opens each of nine dialogs from a focused real control, edits a draft, closes it, compares the exact persisted text and checks focus returned to its opener. Cases: pantry add, recipe portions, plan portions, recipe-side search, pack size, purchase amount, batch creation, cooked-batch allocation and stored-meal booking. It exercises real app event handlers. It does not claim Escape/backdrop cancellation or storage-failure coverage for every form.

## Evidence by dialog

| Dialog | Successful / invalid input evidence | Cancellation / persistence evidence | Narrow browser evidence and remaining gaps |
| --- | --- | --- | --- |
| Pantry ingredient | UI reminder, identity, always-stocked validation and reload checks | Shared cancellation test; always-stocked edit cancellation preserves exact state | 320px full form and Save visible; physical keyboard unverified |
| Pantry link | UI combines stock; Phase 1 rejects stale/incompatible mappings before mutation | Valid/invalid link drafts cancel with exact saved-text and focus checks; stock survives reload | 320px zero-amount rejection, readable form/save action, Close focus and unchanged 250g after reload verified |
| Recipe / plan portions | UI scaling, contextual recipe, cooking/shopping and reload checks | Shared cancellation test covers both dialogs | Recipe actions checked at 320px; physical keyboard unverified |
| Recipe side picker | UI previews, save/reload, side failure keeps picker open | Shared cancellation test covers an edited search | 320px empty search, radish result/ingredients and Close focus checked; no side added on cancellation |
| Pack editor | Exact-weight toggle test restores validation and saves metadata | Shared cancellation test covers size draft | 320px zero-size native rejection, Save/Close visibility and unchanged 250g default on reopen checked |
| Purchase correction | Covered/removed-plan purchase UI cases, correction and transfer | Shared cancellation test preserves bought snapshot | 320px correction form, Save and Close checked in prior browser audit |
| Batch creation | Reviewed ingredient-note and portion-stepper UI checks | Shared cancellation test covers portions draft | 320px zero-portion rejection, visible Save and Close focus checked; subsequent valid four-portion batch saved |
| Cooked-batch allocation | UI whole allocation and Phase 1 once-only deduction/freezer confirmation | Shared cancellation test covers eat-now/freezer draft | 320px stacked allocation controls previously checked |
| Stored booking | UI meal/time defaults, custom time, blank validity, booking/reload; Phase 1 overbooking guards; rejected date remains editable and corrected draft saves | Shared cancellation test covers meal/time/portion draft | 320px beyond-fridge-deadline error now visible inside dialog, focused with draft retained; correcting date saves |
| Defrost / correction / discard | Core and Phase 1 deadlines, reservations, corrections; history UI restores mistaken discard; UI rejects earlier-than-start completion, retains draft, then accepts corrected time and survives reload | Valid/invalid correction, partial discard and defrost drafts cancel with exact saved-text/focus checks; whole-lot discard confirmation also cancels; reload retains original portions | 320px reserved-count rejection and partial-discard native limit readable. Defrost early-time inline alert and future-time native message both checked at 320px; Close returns focus, reload remains thawing. Valid completion and next-day deadline survive reload |
| Save/copy menu | UI saved-week copy, hidden-input validation; menus suite rejects conflicts/preferences atomically | UI test cancels save draft, valid copy draft and occupied-date copy; exact persisted text and Plan opener focus checked | 320px occupied-date warning, disabled Copy action and Close fit; cancellation returns focus to Saved menus and original meal survives reload |
| Backup restore | UI round-trip, malformed JSON, stale-tab refusal; history UI large backup/damaged preferences | UI replacement-preview Cancel preserves exact saved text, returns focus to Restore backup and retains original shop on reload | Native file picker and physical-phone restore not established |
| Scanner | Barcode UI product confirmation, partial packs, reload, camera denial and save failure | Skip preserves exact state; dismissal rejects late lookups and releases camera tracks | 320px and real barcode-entry checks recorded; continuous physical camera/keyboard remains unverified |

`tests/history-ui.test.cjs` additionally checks focus recovery after an opener is recreated and native dialog close events. Browser checks of the actual Close button returned focus to Pantry Add/Edit. Those shared checks support the mechanism without asserting every possible dialog state has been verified.

## Menu and backup follow-up

Two additional UI regressions cover menu save/copy cancellation and backup replacement-preview cancellation. Ten selected UI checks and all four menu-domain checks passed. Narrow browser testing used one synthetic meal/menu on isolated localhost:4174: occupied date produced a readable warning and disabled Copy; Close returned focus to Saved menus; reload retained only the original meal. Synthetic data was cleared through Settings. The backup test supplies a mocked selected file to the app handler; it does not claim a physical native file-picker test.

## Exit rule

Remaining cells require the stated evidence; they are not waived by a green suite. Reuse an existing test or recorded browser journey only when it covers the same interaction and state. Physical iPhone/Android results must be recorded separately from mocked camera and narrow desktop screenshots. This matrix does not establish accuracy of all imported recipe quantities.

## Defrost completion follow-up

A synthetic one-portion batch on isolated localhost:4174 was frozen, booked and moved into thawing. A future completion time triggered native validation without saving; an earlier-than-start time showed the inline dialog alert with the draft intact. Both messages were inspected at 320px. Close returned focus to Fully defrosted; reload still showed the thawing reservation. Reopening and confirming a valid time displayed Defrosted · fridge and a deadline 24 hours later, unchanged after reload. The single synthetic portion and its reservation were removed using its discard action; archived cooking/empty-portion history remains. No user origin or backup was reset.

The new connected UI regression complements the browser check with exact persisted-text equality after rejection, unchanged raw stock and portion count, corrected completion timestamp and reload equality. This closes the earlier unsupported datetime-input check: the browser accepted minute-precision ISO input. No physical-phone or food-handling claim follows from these synthetic records.

## iPhone feedback and scanner fallback — v3.11.54

On 29 September 2026 the user reported "Phone scanning works" and "It did save" on their iPhone 17 Pro Max. Record scanning and saving as user-confirmed; do not infer confirmation of precise partial amounts, reload, uninterrupted multi-item scanning, keyboard ergonomics or timers.

A separate desktop browser check at 320px on isolated localhost:4174 confirmed that camera denial leaves photo and barcode-number entry usable. Submitting 123 showed readable validation; the input, submit action and Done fitted without horizontal overflow. Done returned focus to Scan barcode. Reload retained an empty pantry; no test stock or mapping was saved.
