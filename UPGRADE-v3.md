# Three Plates v3

## Implemented

Dedicated Batch Cook navigation; people x days targets; multiple editable planned batches; five clearly labelled pilot variants of the example recipes. Bases are separated from optional sides. Cooking a batch deducts ingredients once and creates fridge/freezer portion records. Schedule stored portions across consecutive days without duplicating ingredient purchases. Defrost one planned meal without thawing the whole batch. Record the actual fully-defrosted time; track deadlines and prevent repeat deductions or over-allocation.

Shopping has a saved shop selector, exact quantities or common-pack estimates, editable per-shop pack sizes, exact-weight overrides, fixed actual purchase records, whole-pack pantry transfers and optional batch-size suggestions. There is no live retailer catalogue, stock check or price feed. Generic sizes are explicitly labelled, including drained-weight notes.

Everyday and batch recipe search; existing favourites, hidden meals, dietary preferences, pantry matching and headcounts; Settings moved to the header. The original 40 examples remain. The 400 sourced recipes have NOT been added. The five batch variants are also examples, not independently kitchen-tested recipes or online-rated selections.

## Data and privacy

A validated version-1 migration writes to `three-plates-v3` and leaves the original `three-plates-v1` browser data untouched. Version-1 and version-3 backup imports are supported. No account, server database, analytics, retailer credentials or user-data upload. A second tab's update pauses saving until reload to avoid overwriting it. Export backups from Settings. Deleting local app data explicitly removes both version keys.

## Tests and scope

31 pure quantity/state tests passed. Run `node tests/core-v3.test.cjs`.

46 isolated Chromium browser checks passed during development, including the ordinary-meal and batch workflows, partial defrost, kg/g conversion, shop switching, old-data migration and six screens at 320, 390, 430, 768 and 1280 pixels. These used inline application assets and an explicit in-memory localStorage double because navigation is restricted in the test environment. They do not constitute tests of physical iPhone Safari, real browser persistence, external networking or live retail data. Four new application asset hashes were compared with the tested local files before publishing.

## Food guidance

Storage dates are guidance, not proof of safe cooling or storage. The initial stored-batch form accepts freshly cooked batches recorded within two hours, not untracked old leftovers. Refer to the linked UK guidance and packaging; check appliance capacity and doneness. No recipe-specific freezer quality period is invented.

Sources checked for this update:
- https://www.gov.uk/government/publications/how-to-chill-freeze-and-defrost-food-safely/how-to-chill-freeze-and-defrost-food-safely
- https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/storing-and-reheating-food/

## Later phases

Verified recipe expansion with source attribution and storage metadata; verified retailer pack data; reusable weeks; a dedicated cooking mode; ingredient expiry prioritisation and multi-recipe prep workflows. Batch portions can currently be scheduled after the batch is recorded cooked, not allocated in advance of cooking.
