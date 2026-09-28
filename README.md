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

`npm test` runs 133 checks: 31 core regressions, 17 added domain checks,
20 catalogue checks, 37 DOM checks and 28 barcode/relay checks.
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
frontend v3.7.1 was verified live after PR #4 (merge bef323f, successful
Pages run 36492957596 and all 16 checked public assets matched). The fallback shares 100 requests per
day across users, with a cooldown between requests. See [setup and testing details](docs/barcode-scanning.md).
Physical iPhone/Safari and Android camera support still needs device testing.

## Phase 1

Pantry also supports optional Use soon reminder dates. Due reminders appear in
date order through the next three days, with an ingredient-search action that
retains the current meal and food filters. They are personal reminders, not safety
or expiry determinations. Scanning and purchases retain the existing reminder;
linking products keeps the earliest date, and consuming the final stock clears it.
Dates are included in normal backups. This feature branch is not yet deployed.

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

## Verification and release status

The latest baseline inspected was `dd700a9`, which already supplied most Phase 1
screens. This feature branch completes missing controls and strengthens preservation,
provenance and correction rules. Earlier testing claims in `UPGRADE-v3.md` describe
that baseline, not this branch.

This branch was checked in the Codex in-app browser at 320, 390, 430 and 1280 px:
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
- Phase 2 remaining: richer side recipes, cooking mode/timers/screen wake,
  reusable weeks and combined prep checklists.
- Verified retailer catalogue, advance allocation of uncooked planned batches,
  and physical-device/WebKit testing.
