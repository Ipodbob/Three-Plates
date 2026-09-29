# Three Plates

A mobile-first UK meal planner hosted on GitHub Pages at `/Three-Plates/`.
Static HTML, CSS and JavaScript; no user account or runtime API keys. Barcode
lookup uses Open Food Facts; a free UPC fallback relay is deployed on Cloudflare.

## Develop and test

Use Node 20 or later:

```sh
npm ci
npm test
npm start
```

Open `http://127.0.0.1:4173/Three-Plates/`. The development server deliberately
uses the case-sensitive Pages prefix. There is no production build step: Pages
continues serving the repository root. Do not replace its hosting configuration.

For responsive checks, open `/preview?width=320&page=pantry` on the development
server. It embeds the real app in a fixed-width viewport; supported widths are
320, 390, 430 and 1280. Pages are choose, batch, plan, shop, pantry and you. This
preview exists only in the local server. `PORT` can select an alternate local port;
the deployed UPC relay allows the default 4173 origin, not arbitrary preview ports.
The server serves the local vendor decoder while keeping repository metadata,
scripts and dependencies unavailable through HTTP.

`npm test` runs 209 checks: 31 core regressions, 46 added domain checks,
30 catalogue checks, 72 DOM checks, 28 barcode/relay checks and two server checks.
jsdom is test-only; it does not validate rendering or replace real browser checks.
The pinned ZXing browser bundle is served locally and loaded only for camera/photo scanning.

## Pantry barcode scanning

Pantry has live rear-camera scanning, barcode-photo capture/upload and a number
fallback. Product lookup suggests ingredients and amounts; users confirm before
stock is added. A visible Add & scan next action, continuous camera, remaining-percentage slider
and pack counter support fast cupboard setup. Update amount left corrects total
stock or clears an item; planned meals retain their existing cooking deduction. Confirmed
barcode matches stay on the device and are included in the existing backups.
Separate pantry products have a Link to recipes action that combines stock with
a confirmed ingredient and updates remembered barcode matches. Ordinary editing
cannot overwrite another ingredient.
Camera/photo decoding stays local; only new barcode numbers are looked up online.

Open Food Facts works directly. **The free UPCitemdb relay is deployed and verified
from the local pantry UI.** This branch configures the live relay; GitHub Pages
frontend v3.11.0 was verified live after PR #9 (merge 20b7729, successful
Pages run 36501405285 and all 21 checked public assets matched). The fallback shares 100 requests per
day across users, with a cooldown between requests. See [setup and testing details](docs/barcode-scanning.md).
Physical iPhone/Safari and Android camera support still needs device testing.

## Catalogue review and search

A reviewed metadata layer corrects 55 dish roles, meal categories and cooking
methods; the evidence register is [classification-review.json](docs/catalogue/classification-review.json).
Savoury pastries stay in Baking, complete cakes are no longer hidden as icing
components, and sides stay out of automatic main-meal choices while remaining
searchable. Bread remains available as a Baking suggestion. Broad searches start
with 12 cards and reveal more on request, moving keyboard focus to the new results.
Recipe IDs, ratings, ingredients and existing plan quantities remain intact.

## Fresh sides

Plan → Add side / Change side offers rice, pasta, bread, wraps and 44 searchable
recipe sides. Preview scaled ingredients and open the publisher method, then choose
one fresh side for the meal. Whole breads/bakes stay separate in Baking. Food
preferences apply; recipes retain their published yield for checking serving sizes.
Side amounts follow the meal portions. Fresh meals add both recipes to shopping;
stored portions add only the side, then deduct it once when eaten. Saved menus and
backups preserve the side link. Missing side references stop restore rather than
silently changing shopping. The pantry import no longer truncates valid entries
after the first 1,000. Recipe and allocation counts use the shared touch steppers.

## Reusable menus

Plan → Saved menus saves seven days of meal slots, optionally one meal type.
Copy a menu to a new week with its saved portions or a new headcount; whole bakes
keep their yield. Preview checks occupied dates and current food preferences before
copying anything. Stored meals copy as fresh recipes with their sides; prepared
stock, batch records and reservations are never duplicated. Saved menus are included
in backups, with up to 50 menus. Old backups remain supported.

## Phase 1

Pantry also supports optional Use soon reminder dates. Due reminders appear in
date order through the next three days, with an ingredient-search action that
retains the current meal and food filters. They are personal reminders, not safety
or expiry determinations. Scanning and purchases retain the existing reminder;
linking products keeps the earliest date, and consuming the final stock clears it.
Dates are included in normal backups and were released in v3.7.2.

Planned recipe views now use the selected meal or batch's own portions. Stored
meals separate fresh sides from already-cooked ingredients; prepared containers
show their original batch quantities for reference. These views do not offer an
accidental duplicate planning action.

The released defrost fix recovers older whole-second completion timestamps within
the same second as their millisecond start, without resetting stock or history.
Genuinely reversed timestamps still fail validation.

Choose keeps three suggestions with refresh/keep, food exclusions, favourites,
pantry matching and individual meal headcounts. Name/ingredient search is also
available. Choose is one shared screen with a visible Batch cook switch and inline
days, people, meal pattern and portion totals. Bottom navigation is Choose / Plan /
Shopping / Pantry; the header has a labelled Settings link. Existing `#batch` links
still open the shared screen with batch cooking enabled.

Batch Cook supports people × days, repetition or variety, meal/time/method and
pantry filters, and multiple editable batches. Variety starts with roughly half
the days and favours overlap with planned batches without bypassing exclusions.
Cooking records immediate/fridge/freezer allocations and deducts ingredients once.
Prepared meals can be reserved, partially defrosted, consumed, discarded and
corrected. Only fresh sides create further shopping requirements. Corrections
cannot restore eaten portions, overbook stock, repeat ingredient deductions or
extend food history. Cancel reservations before reducing their stock.

Shopping distinguishes recipe needs, pantry stock, remaining needs, estimated
packs, actual purchases and surplus. Choose a usual shop or a saved one-trip
override; untick the override to return to the usual shop. Exact amounts support
loose purchasing. Pack records store ingredient, unit, retailer, product/variant,
usable-weight basis, entered/estimated provenance, source URL and label-check date.
Purchase history snapshots the actual pack and retailer; changing shops never
rewrites purchases. Moving purchases to pantry adds the whole purchased amount.
No retailer sizes, prices, availability or integrations are claimed as verified.

## Cooking mode (released in v3.10.0)

Plan > Start cooking opens large ingredient and method check-offs for that meal
or batch. Check-offs persist across reloads and backups without changing pantry
stock. Stored meals list only their fresh side; original recipes have in-app step
checks, while publisher recipes link to their full method and offer a method
completion check. Ingredients, Method and Timers shortcuts reduce scrolling.

Up to eight named timers per meal support pause, resume and removal. Saved finish
times recover elapsed time after returning to the page; they are not background
phone alarms. The UI says to use a phone alarm when leaving or locking the app.
Screen-awake is opt-in and releases when the dialog closes. Unsupported or denied
requests show a screen-timeout fallback. Physical-device behaviour is unverified.

Changing a meal's portions or side requires an explicit checklist restart so old
checks cannot describe different quantities. Finishing uses the existing meal or
batch confirmation and stock transaction. The feature has 14 domain/connected UI
checks, plus the existing regression suite. Implementation references:
[Screen Wake Lock specification](https://www.w3.org/TR/screen-wake-lock/) and
[MDN timer throttling](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#reasons_for_delays_longer_than_specified).

## Combined prep checklist (released in v3.11.0)

Plan > Prep checklist combines the ingredients for up to 20 selected meals and
batches. Select by recipe, meal or date, then gather from one searchable list.
Each ingredient expands to show the amounts for its individual recipes. Finished
meals are excluded and stored meals contribute only their fresh side.

Ready checks persist through reloads and backups. Only checks whose recipe
allocations and quantities still match are retained; changed amounts are shown
unchecked with a notice. Gathering checks are separate from cooking progress and
never change stock, purchases, timers or meal status. Recipe cards lead to the
existing recipe and cooking views. The list is not a combined cooking schedule
and does not predict a common finish time.

Ten domain/connected UI checks cover totals, stored portions, changes, failed
saves, restoration and independence from pantry/cooking state. The browser
verified 450 g pasta split into 180 g and 270 g, saved checks after reload, the
320px ingredient search/breakdown, and removal of finished meal quantities.

## Large-history preservation (current feature branch)

Reload no longer truncates custom products at 500 or meal plans at 1,000, and
histories over 1,000 batches/containers can load. Menu copies no longer require
deleting older meals. Invalid v3 stock, purchase or meal records reject the restore
instead of silently disappearing; original saved data stays available for export.
Legacy v1 migration is retained. Backup import accepts files up to 20 MB, with
normal validation and an explicit replacement confirmation; failed storage writes
do not replace current data.

Regression checks cover 601 custom products, 1,101 meals, 1,002 batch containers,
late reservations and a formatted backup containing 9,000 meals larger than 2 MB.
Cooking progress, prep choices, purchase history and quantities round-trip.

## Saved data

Keep `three-plates-v3` and its existing version-3 schema. `phase1.js` adds validated,
optional metadata to the established `core-v3.js` rules. Version-1 migration leaves
the original `three-plates-v1` value untouched. Existing v3 backups remain supported.
Legacy purchases retain their amounts without invented retailer/pack history.
Legacy portion corrections are bounded by their known remaining stock.

Invalid linked batch/portion backups are rejected before replacement. Failed
loads pause saving and retain the original export. Failed writes report a warning and roll back the attempted change;
the form stays open for retry. Cross-tab changes pause saving to avoid
overwriting another tab. Export/restore is available in Settings.

## Rated recipe catalogue

The library now contains **995 linked recipes from ten publishers**, plus the 45 preserved original examples: **1,040 recipes total**. The latest pass adds **657 recipes**, each rated at least **4/5 from five or more ratings or reviews**, checked on 28 September 2026. Breakfast, lunch, dinner, meal prep, soups, cakes, pastries and savoury bakes all gain substantial coverage. See the [specialist source register and quantity review](docs/specialist-catalogue-expansion.md). The earlier catalogue is preserved under its original admission policy.

Visible cooking-method buttons now include **Pressure cooker**, **Barbecue** and **Microwave**, alongside hob, oven, air fryer, slow cooker and no-cook choices. Recipe components stay searchable without appearing as automatic main-meal suggestions.

**Dessert** and **Baking** are separate meal choices with planning and shopping
support. Cakes, breads and pastries default to the full recipe yield; their saved
plans allow up to 48 pieces/portions. Standard meals keep existing headcounts.
Search supports dish style, publisher and effort (for example `traybake`, `pastry`,
`soup`, `simple` or `complex`). Source batch recipes can also be planned fresh.

The first expansion added 40 distinct Good Food recipes, each with a visible publisher
rating of at least 4.5/5 from at least 50 ratings, checked on 28 September 2026.
Four use an air fryer and 13 are available in Batch cook. These are selected
recipes, not a claim to rank the entire web. See [the source register](docs/recipe-sources.md).
The full method remains on the publisher's site; no publisher photographs or
method text are republished. Reading that method requires internet access.

Cards show ratings and counts. Recipe details show author, source, retrieval date,
source yield, and quantity assumptions. Spoon weights, handfuls, count-to-weight
conversions and unspecified tin sizes use explicitly disclosed planning estimates.
Optional accompaniments are identified when omitted. Counted chicken pieces are
separate ingredients from weighed chicken: the app does not silently convert a
pantry weight into an assumed number of pieces. Saved original recipe IDs and all
original ingredient definitions remain unchanged.

## Storage guidance and limitations

The 40 original recipes and five batch variants remain examples, not independently
kitchen-tested or rated selections. Batch variants label a complete meal versus
a base that needs a side. Uncooked preparation cannot be recorded as cooked stock.
Recipe-specific freezer suitability and quality duration are **unknown**. Recording
freezing requires checking instructions for the recipe actually cooked; the app
does not certify safety. No allergy guarantee is provided.

General guidance checked on 28 September 2026:

- [UK chilling, freezing and defrosting guidance](https://www.gov.uk/government/publications/how-to-chill-freeze-and-defrost-food-safely/how-to-chill-freeze-and-defrost-food-safely)
- [UK student food-safety guidance, including rice](https://www.gov.uk/government/publications/student-guide-to-food-safety-and-hygiene/student-guide-to-food-safety-and-hygiene)

General refrigerator reminders use 48 hours, rice 24 hours, and fully defrosted food
24 hours. Freeze/cook/defrost history is retained. Storage dates cannot prove actual
cooling or temperature. Stored batches must currently be recorded within two hours
of cooking. Plan stored portions after cooking; advance allocation is a backlog item.

Finished meals show the newest 20 records first, with recipe/date/meal search
across the entire saved history and an option to show 20 more. All records remain
saved. Closing a dialog returns keyboard focus to its opener even after a page
refresh replaces that button.

The Longer / extra time filter includes recipes requiring additional chilling,
proving or resting. These remain excluded from the quick filters. Six reviewed
no-bake recipes now have corrected methods and concise heat/preparation notes;
no-bake recipes which boil a mixture or cook custard remain under Hob. Evidence
and publisher links are in `docs/catalogue/classification-review.json`.

Unsubmitted recipe text survives filters, headcount changes and navigation in
the current session. Choose and Batch keep independent drafts; Search applies
and saves the text. Clear/reset, backup restore and pantry recipe shortcuts
replace drafts deliberately. Failed saves retain drafts for retry. Drafts are
not persisted on every keystroke or restored after a full page reload.

Publisher recipes offered in Choose/Batch suggestions and search must have a
stored rating of at least 4/5 and at least five ratings. Currently 993 qualify.
Two earlier Workweek Lunch selections (three and two ratings) remain in the
catalogue for saved plans, menus and favourites; quantities and identifiers are
unchanged. Their recipe views explain why they are no longer in discovery.
The 45 original examples remain explicitly labelled unrated. Stored ratings
are snapshots, not a live feed.

Current-format backups with invalid food preferences or pack override records
are rejected before replacement. Loading damaged local records pauses saving
and retains the original text for recovery. Valid exclusions, favourites, diets,
equipment preferences, pack sizes and exact-weight overrides survive restore;
version-1 compatibility and omitted legacy optional fields are retained.

Eleven reviewed recipes containing steak, cured meat, seafood, lard or gelatin
now use the appropriate meat/fish classification, excluding them from vegetarian
and vegan discovery. Source links and reasons are recorded in the classification
review; recipe quantities are unchanged. This is not a complete allergy audit.
The Skip to content link focuses the current page without changing its route.

Fish & seafood exclusions use 74 explicitly listed catalogue ingredient variants,
including stocks and sauces, while excluding oyster mushrooms from the family.
Existing saved salmon/tuna/prawn group selections gain this coverage without a
state rewrite. Salmon and prawn exclusions also cover their reviewed variants.
Settings shows the broad exclusion as one removable chip. These relationships
apply only to preference matching; they never combine raw/cooked stock or units.
The reviewed mapping is in `docs/catalogue/seafood-preferences.json`.

## Verification and release status

The latest verified release is v3.11.7 at `3f305d4` (PR #16): Pages run
36506074752 succeeded, all 21 checked public assets matched, and a fresh live
navigation displayed v3.11.7. The current v3.11.8 seafood preference coverage
awaits release verification. Earlier claims in `UPGRADE-v3.md` describe the original baseline.

The earlier whole-app layout was checked in the browser at 320, 390, 430 and 1280 px:
all six destinations fit without horizontal overflow or fields leaving the viewport.
The local `/Three-Plates/` page loaded real assets and browser persistence; batch
allocation, reload, prepared-meal booking and side-only shopping were exercised.
WebKit and physical iPhone/Safari testing have not been performed. Screenshots show
local testing, not deployment.

Publishing the feature branch or opening a PR does not deploy it. Merge to `main`
and verify the Pages run and live assets for that exact commit before calling this
version live. The existing live baseline was inspected; Pages configuration is unchanged.

## Backlog

- Recipe-specific freezing/storage provenance and independently tested quantity mappings.
- Continue deduplicated sourcing and improve ingredient equivalence and method classification. Verify licensing before hosting full publisher methods or photographs.
- Finish whole-app dialog/correction checks and release verification for new changes.
- Verified retailer catalogue, advance allocation of uncooked planned batches,
  and physical-device/WebKit testing.

## Meat preference coverage

Chicken, beef and pork exclusions cover 149 reviewed ingredient variants, including
imported cuts and stocks. Each broad exclusion appears as one removable chip.
Existing saved anchor IDs remain valid; these mappings do not substitute pantry
stock or convert quantities. Vegan chicken, unrelated steaks, seasoning and graham
crackers stay outside the relevant families. The [review register](docs/catalogue/meat-preferences.json)
records scope and remaining ambiguous sausage/cured-meat review.

## Shopping pack editor

The pack editor puts the amount and Save first, with optional product provenance
in an expandable section. Exact-weight mode disables the unused pack-size field
so an invalid previous size cannot block saving. Returning to pack mode restores
required positive-size validation. Existing product details remain saved.
