# Dialog verification matrix

Reviewed against v3.11.40, main `a77db4e0c14a8053d6c0c0ec4d254108d073044a`, plus the cancellation regression introduced with this document. Evidence is deliberately separated: jsdom assertions do not prove mobile layout or a physical keyboard experience.

## Shared cancellation check

`tests/ui.test.cjs`: **cancelled dialog drafts preserve saved data and return focus across planning shopping and pantry** opens each of nine dialogs from a focused real control, edits a draft, closes it, compares the exact persisted text and checks focus returned to its opener. Cases: pantry add, recipe portions, plan portions, recipe-side search, pack size, purchase amount, batch creation, cooked-batch allocation and stored-meal booking. It exercises real app event handlers. It does not claim Escape/backdrop cancellation or storage-failure coverage for every form.

## Evidence by dialog

| Dialog | Successful / invalid input evidence | Cancellation / persistence evidence | Narrow browser evidence and remaining gaps |
| --- | --- | --- | --- |
| Pantry ingredient | UI reminder, identity, always-stocked validation and reload checks | Shared cancellation test; always-stocked edit cancellation preserves exact state | 320px full form and Save visible; physical keyboard unverified |
| Pantry link | UI combines stock; Phase 1 rejects stale/incompatible mappings before mutation | Valid/invalid link drafts cancel with exact saved-text and focus checks; stock survives reload | 320px zero-amount rejection, readable form/save action, Close focus and unchanged 250g after reload verified |
| Recipe / plan portions | UI scaling, contextual recipe, cooking/shopping and reload checks | Shared cancellation test covers both dialogs | Recipe actions checked at 320px; physical keyboard unverified |
| Recipe side picker | UI previews, save/reload, side failure keeps picker open | Shared cancellation test covers an edited search | Broader result and invalid-state 320px checks not consolidated |
| Pack editor | Exact-weight toggle test restores validation and saves metadata | Shared cancellation test covers size draft | Earlier pack journey recorded; every error layout not verified |
| Purchase correction | Covered/removed-plan purchase UI cases, correction and transfer | Shared cancellation test preserves bought snapshot | 320px correction form, Save and Close checked in prior browser audit |
| Batch creation | Reviewed ingredient-note and portion-stepper UI checks | Shared cancellation test covers portions draft | Earlier batch browser checks; invalid form at 320px still needed |
| Cooked-batch allocation | UI whole allocation and Phase 1 once-only deduction/freezer confirmation | Shared cancellation test covers eat-now/freezer draft | 320px stacked allocation controls previously checked |
| Stored booking | UI meal/time defaults, custom time, blank validity, booking/reload; Phase 1 overbooking guards | Shared cancellation test covers meal/time/portion draft | Narrow invalid/expiry states still need browser evidence |
| Defrost / correction / discard | Core and Phase 1 deadlines, reservations, corrections; history UI restores mistaken discard | Valid/invalid correction, partial discard and defrost drafts cancel with exact saved-text/focus checks; whole-lot discard confirmation also cancels; reload retains original portions | Prior browser journeys exist; error-state layouts not consolidated |
| Save/copy menu | UI saved-week copy, hidden-input validation; menus suite rejects conflicts/preferences atomically | UI test cancels save draft, valid copy draft and occupied-date copy; exact persisted text and Plan opener focus checked | 320px occupied-date warning, disabled Copy action and Close fit; cancellation returns focus to Saved menus and original meal survives reload |
| Backup restore | UI round-trip, malformed JSON, stale-tab refusal; history UI large backup/damaged preferences | UI replacement-preview Cancel preserves exact saved text, returns focus to Restore backup and retains original shop on reload | Native file picker and physical-phone restore not established |
| Scanner | Barcode UI product confirmation, partial packs, reload, camera denial and save failure | Skip preserves exact state; dismissal rejects late lookups and releases camera tracks | 320px and real barcode-entry checks recorded; continuous physical camera/keyboard remains unverified |

`tests/history-ui.test.cjs` additionally checks focus recovery after an opener is recreated and native dialog close events. Browser checks of the actual Close button returned focus to Pantry Add/Edit. Those shared checks support the mechanism without asserting every possible dialog state has been verified.

## Menu and backup follow-up

Two additional UI regressions cover menu save/copy cancellation and backup replacement-preview cancellation. Ten selected UI checks and all four menu-domain checks passed. Narrow browser testing used one synthetic meal/menu on isolated localhost:4174: occupied date produced a readable warning and disabled Copy; Close returned focus to Saved menus; reload retained only the original meal. Synthetic data was cleared through Settings. The backup test supplies a mocked selected file to the app handler; it does not claim a physical native file-picker test.

## Exit rule

Remaining cells require the stated evidence; they are not waived by a green suite. Reuse an existing test or recorded browser journey only when it covers the same interaction and state. Physical iPhone/Android results must be recorded separately from mocked camera and narrow desktop screenshots. This matrix does not establish accuracy of all imported recipe quantities.
