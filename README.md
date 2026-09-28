# Three Plates

A mobile-first UK meal planner hosted on GitHub Pages at `/Three-Plates/`.
Static HTML, CSS and JavaScript; no backend, account or runtime API keys.

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

`npm test` runs 67 checks: 31 core regressions, 11 added domain checks,
9 catalogue checks and 16 DOM interaction checks. jsdom is test-only; it does not validate rendering
or replace real browser checks. No development dependency is loaded by the app.

## Phase 1

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
loads pause saving and retain the original export. Failed writes report a warning;
export the current in-memory state. Cross-tab changes pause saving to avoid
overwriting another tab. Export/restore is available in Settings.

## Rated recipe catalogue

The expanded library now contains **72 linked recipes from seven publishers**,
plus the 45 preserved original examples. The latest 32 additions broaden the
selection to traybakes, meal-prep bowls, soups, international dishes and baking.
Ratings are one selection signal rather than a strict admission gate; each new
entry records its reason for inclusion. See [coverage, sources and mapping notes](docs/collection-expansion.md).

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
- Original 400-recipe target: there are now 72 checked source links.
  Continue deduplicated sourcing using the revised quality/coverage policy; expand publisher
  coverage and verify licensing before hosting full cooking methods or photographs.
- Phase 2: use-soon dates, richer side recipes, cooking mode/timers/screen wake,
  reusable weeks and combined prep checklists.
- Verified retailer catalogue, advance allocation of uncooked planned batches,
  and physical-device/WebKit testing.
