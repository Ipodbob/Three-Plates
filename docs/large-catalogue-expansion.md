# Large catalogue expansion

Checked 28 September 2026. Adds **266 linked Good Food recipes** to the preceding 117, for **383 recipes: 338 linked publisher recipes and 45 preserved original examples**. The overall collection still spans seven publishers. This pass broadens the metric-quantity Good Food selection; it does not claim to have imported another publisher or app.

## Coverage

The additions include **101 full-yield bakes, 86 dessert choices, and 39 batch options** (overlapping categories), with 22 cuisine labels including the generic Everyday category. Regional additions include Moroccan, Brazilian, Caribbean, Mexican, Korean, Japanese, Thai, Indian, Greek and Turkish dishes. Cakes, cookies, breads, savoury pastries, soups, stews, seafood, vegetarian dishes and multi-stage projects are represented.

## Selection and source limitations

391 recipe candidates had usable public rating metadata after collection-page discovery. This pass admitted 266 and held 125 for ambiguous quantities, missing components, unsupported yields or scope (such as standalone drinks/condiments). The admitted recipes have published ratings of at least 4.3/5 from at least five ratings. These values are observations for this pass, not a new permanent admission policy. Recipe ratings and popularity are selection signals, not independent testing or a claim these are the best recipes on the web.

Public structured ingredients and visible ratings were collected, then normalised and checked against the planner's units. The added recipes' pages were rechecked for preparation/cooking time and method metadata. Named authors are retained; one page without an individual author is explicitly attributed to its publisher. No method text, photographs, comments, login-only data or paid app collections are republished. The method link opens the publisher page.

## Quantity audit

[Source ingredient facts and conversion notes](catalogue/expansion-quantities.json) record every admitted recipe. Common ingredients reuse existing pantry IDs. Ingredients with incompatible units, preparation states or specific forms keep separate IDs; existing definitions and saved amounts are not rewritten. Counted meat is not equated with weighed meat. Cooked rice is separate from dry rice; canned lentils are separate from dried lentils. Compatible first-choice alternatives, metric amounts and spoon-volume conversions are retained.

Weights for informal handfuls/bunches, drained tins and some spoon/count conversions are planning estimates disclosed in each recipe. Optional serving extras, unquantified dusting/greasing and equipment are omitted and listed in the notes; allow for these when shopping. Tinned pulses use a disclosed 60% drained-weight estimate where a tin weight is given. Real package yields differ. Full-bake quantities start at the source yield. These mappings have not been kitchen-tested.

## Filtering and preservation

Resting/proving/chilling recipes show “prep/cook + extra time” and cannot appear in the up-to-15/30-minute filters. Where a publisher's total is shorter than prep plus cook, the sum is used with an explanatory note. This is not an exact elapsed-time promise. Barbecue-only and packet-dependent recipes have explicit method labels. Sides/starters remain searchable and plannable with a visible label; they do not displace mains in automatic three-choice suggestions.

Diet filtering follows the actual mapped variant, including animal-rennet cheese and dashi. Unverified recipe-specific freezing remains unknown. Batch rice retains the shorter reminder. Existing meal workflow, storage keys, ingredient definitions, source recipe IDs and GitHub Pages configuration are preserved.

## Validation

74 automated checks: 31 core, 11 Phase 1 domain, 14 catalogue and 18 DOM checks. Every added recipe is scaled and roundtripped through a saved plan. Regressions cover dry/cooked separation, excluded ingredient aliases, extra time, batch rice, full bake shopping and labelled side dishes. Browser checks cover search, method/timing labels and mobile recipe detail layout. Code is on the feature PR; this document does not claim a live deployment.

## Added recipe register

| Recipe | Rating / count | Meal slots | Method |
|---|---:|---|---|
| [10-minute couscous salad ](https://www.bbcgoodfood.com/recipes/10minute-couscous-salad) | 4.7/5 · 262 | Lunch, Dinner | no-cook |
| [Quick seafood linguine ](https://www.bbcgoodfood.com/recipes/20minute-seafood-pasta) | 4.5/5 · 226 | Lunch, Dinner | hob |
| [Air fryer roast potatoes ](https://www.bbcgoodfood.com/recipes/air-fried-roast-potatoes) | 4.5/5 · 24 | Lunch, Dinner | air-fryer |
| [Air fryer banana bread ](https://www.bbcgoodfood.com/recipes/air-fryer-banana-bread) | 4.6/5 · 48 | Dessert, Baking | air-fryer |
| [Air-fryer brussels sprouts ](https://www.bbcgoodfood.com/recipes/air-fryer-brussels-sprouts) | 4.7/5 · 24 | Lunch, Dinner | air-fryer |
| [Air fryer cheese & ham toastie ](https://www.bbcgoodfood.com/recipes/air-fryer-cheese-ham-toastie) | 4.5/5 · 46 | Lunch, Dinner | air-fryer |
| [Air fryer chicken nuggets ](https://www.bbcgoodfood.com/recipes/air-fryer-chicken-nuggets) | 4.5/5 · 36 | Lunch, Dinner | air-fryer |
| [Air fryer crispy chilli beef ](https://www.bbcgoodfood.com/recipes/air-fryer-crispy-chilli-beef) | 4.3/5 · 96 | Lunch, Dinner | air-fryer |
| [Air fryer gyros ](https://www.bbcgoodfood.com/recipes/air-fryer-gyros) | 4.9/5 · 9 | Lunch, Dinner | air-fryer |
| [Air fryer halloumi ](https://www.bbcgoodfood.com/recipes/air-fryer-halloumi) | 4.8/5 · 27 | Lunch, Dinner | air-fryer |
| [Air fryer meatballs ](https://www.bbcgoodfood.com/recipes/air-fryer-meatballs) | 4.5/5 · 32 | Lunch, Dinner | air-fryer |
| [Air fryer patatas bravas ](https://www.bbcgoodfood.com/recipes/air-fryer-patatas-bravas) | 4.3/5 · 8 | Lunch, Dinner | air-fryer |
| [Air fryer pork joint ](https://www.bbcgoodfood.com/recipes/air-fryer-pork-joint) | 4.8/5 · 34 | Lunch, Dinner | air-fryer |
| [Air fryer sausages ](https://www.bbcgoodfood.com/recipes/air-fryer-sausages) | 4.5/5 · 40 | Lunch, Dinner | air-fryer |
| [Air fryer sweet potato fries ](https://www.bbcgoodfood.com/recipes/air-fryer-sweet-potato-fries) | 4.5/5 · 34 | Lunch, Dinner | air-fryer |
| [Peanut butter double chocolate chip cookies ](https://www.bbcgoodfood.com/recipes/all-american-chocolate-chunk-cookies) | 4.3/5 · 52 | Dessert, Baking | oven-hob |
| [Almond cake ](https://www.bbcgoodfood.com/recipes/almond-cake) | 4.8/5 · 25 | Dessert, Baking | oven |
| [Anzac biscuits ](https://www.bbcgoodfood.com/recipes/anzac-biscuits) | 4.5/5 · 334 | Dessert, Baking | oven-hob |
| [Apple crumble sundae ](https://www.bbcgoodfood.com/recipes/apple-crumble-sundae) | 4.4/5 · 24 | Dessert | hob |
| [Arroz al horno (baked rice) ](https://www.bbcgoodfood.com/recipes/arroz-al-horno-baked-rice) | 4.8/5 · 15 | Lunch, Dinner | oven-hob |
| [Aubergine parmigiana lasagne ](https://www.bbcgoodfood.com/recipes/aubergine-parmigiana-lasagne) | 4.5/5 · 36 | Lunch, Dinner | oven-hob |
| [Aubergine, tomato & halloumi pie ](https://www.bbcgoodfood.com/recipes/aubergine-tomato-halloumi-pie) | 4.5/5 · 51 | Lunch, Dinner | oven-hob |
| [Baby pancakes ](https://www.bbcgoodfood.com/recipes/baby-pancakes) | 5/5 · 10 | Dessert, Baking | hob |
| [Baileys cheesecake ](https://www.bbcgoodfood.com/recipes/baileys-cheesecake) | 4.4/5 · 43 | Dessert, Baking | hob |
| [Baked raspberry & lemon cheesecake ](https://www.bbcgoodfood.com/recipes/baked-raspberry-lemon-cheesecake) | 4.5/5 · 117 | Dessert, Baking | oven |
| [Baked ratatouille & goat’s cheese ](https://www.bbcgoodfood.com/recipes/baked-ratatouille-goats-cheese) | 4.7/5 · 118 | Lunch, Dinner | oven-hob |
| [Balsamic steaks with peppercorn wedges ](https://www.bbcgoodfood.com/recipes/balsamic-steaks-peppercorn-wedges) | 4.8/5 · 13 | Lunch, Dinner | oven |
| [Banana traybake with cream cheese frosting ](https://www.bbcgoodfood.com/recipes/banana-traybake-with-cream-cheese-frosting) | 4.8/5 · 27 | Dessert, Baking | oven |
| [Beef enchiladas ](https://www.bbcgoodfood.com/recipes/beef-enchiladas) | 4.4/5 · 76 | Lunch, Dinner | oven-hob |
| [Best ever chocolate brownies recipe ](https://www.bbcgoodfood.com/recipes/best-ever-chocolate-brownies-recipe) | 4.8/5 · 2980 | Dessert, Baking | oven-hob |
| [Best ever macaroni cheese recipe ](https://www.bbcgoodfood.com/recipes/best-ever-macaroni-cheese-recipe) | 4.7/5 · 454 | Lunch, Dinner | oven-hob |
| [Black bean turkey tinga with avocado crema ](https://www.bbcgoodfood.com/recipes/black-bean-turkey-tinga-with-avocado-crema) | 5/5 · 6 | Lunch, Dinner | hob |
| [Blackberry & coconut squares ](https://www.bbcgoodfood.com/recipes/blackberry-coconut-squares) | 4.8/5 · 195 | Lunch, Dinner | oven |
| [Blackberry & orange cake ](https://www.bbcgoodfood.com/recipes/blackberry-orange-cake) | 4.8/5 · 25 | Dessert, Baking | oven-hob |
| [Blood orange & dark chocolate madeleines ](https://www.bbcgoodfood.com/recipes/blood-orange-dark-chocolate-madeleines) | 4.3/5 · 7 | Dessert, Baking | oven-hob |
| [Brazilian cheese bread (pão de queijo) ](https://www.bbcgoodfood.com/recipes/brazilian-cheese-bread-pao-de-queijo) | 4.4/5 · 26 | Lunch, Baking | oven-hob |
| [Brazilian chocolate truffles - brigadeiro ](https://www.bbcgoodfood.com/recipes/brazilian-chocolate-truffles-brigadeiro) | 4.8/5 · 13 | Dessert | hob |
| [Bread in four easy steps ](https://www.bbcgoodfood.com/recipes/bread-four-easy-steps) | 4.8/5 · 161 | Baking | oven |
| [Breakfast hash ](https://www.bbcgoodfood.com/recipes/breakfast-hash) | 5/5 · 6 | Breakfast | oven-hob |
| [Banana bread ](https://www.bbcgoodfood.com/recipes/brilliant-banana-loaf) | 4.5/5 · 2344 | Dessert | oven |
| [Brioche ](https://www.bbcgoodfood.com/recipes/brioche) | 4.3/5 · 70 | Baking | oven |
| [Broccoli & stilton soup ](https://www.bbcgoodfood.com/recipes/broccoli-stilton-soup) | 4.8/5 · 579 | Lunch, Dinner | hob |
| [Burnt basque cheesecake ](https://www.bbcgoodfood.com/recipes/burnt-basque-cheesecake) | 4.7/5 · 88 | Dessert, Baking | oven |
| [Butterfly cupcakes ](https://www.bbcgoodfood.com/recipes/butterfly-cupcakes) | 5/5 · 5 | Dessert, Baking | oven-hob |
| [Butternut squash & cherry tomato crumble ](https://www.bbcgoodfood.com/recipes/butternut-squash-cherry-tomato-crumble) | 4.5/5 · 59 | Lunch, Dinner | oven-hob |
| [Butternut squash soup ](https://www.bbcgoodfood.com/recipes/butternut-squash-soup-chilli-creme-fraiche) | 4.8/5 · 809 | Lunch, Dinner | oven-hob |
| [Campfire stew ](https://www.bbcgoodfood.com/recipes/campfire-stew) | 4.4/5 · 26 | Lunch, Dinner | oven-hob |
| [Caprese salad (tomato and mozzarella salad) ](https://www.bbcgoodfood.com/recipes/caprese-salad) | 4.3/5 · 20 | Lunch, Dinner | no-cook |
| [Easy carrot cake ](https://www.bbcgoodfood.com/recipes/carrot-cake) | 4.4/5 · 639 | Dessert, Baking | oven |
| [Cauliflower cheese soup ](https://www.bbcgoodfood.com/recipes/cauliflower-cheese-soup) | 4.6/5 · 212 | Lunch, Dinner | hob |
| [Celery soup ](https://www.bbcgoodfood.com/recipes/celery-soup) | 4.7/5 · 398 | Lunch, Dinner | hob |
| [Cheese flan ](https://www.bbcgoodfood.com/recipes/cheese-flan) | 4.5/5 · 10 | Lunch, Dinner | oven-hob |
| [Cheese & Marmite scones ](https://www.bbcgoodfood.com/recipes/cheese-marmite-scones) | 4.5/5 · 21 | Lunch, Baking | oven |
| [Cheese omelette ](https://www.bbcgoodfood.com/recipes/cheese-omelette) | 4.5/5 · 12 | Breakfast | hob |
| [Cheese & pesto whirls ](https://www.bbcgoodfood.com/recipes/cheese-pesto-whirls) | 4.5/5 · 71 | Lunch, Baking | oven |
| [Cheese & piccalilli tart ](https://www.bbcgoodfood.com/recipes/cheese-piccalilli-tart) | 5/5 · 6 | Lunch, Baking | oven |
| [Cheese & rosemary biscuits ](https://www.bbcgoodfood.com/recipes/cheese-rosemary-biscuits) | 4.4/5 · 22 | Lunch, Baking | oven |
| [Cheesy black bean quesadillas ](https://www.bbcgoodfood.com/recipes/cheesy-black-bean-quesadillas) | 4.3/5 · 18 | Lunch, Dinner | hob |
| [Cheesy seafood bake ](https://www.bbcgoodfood.com/recipes/cheesy-seafood-bake) | 4.7/5 · 29 | Lunch, Dinner | oven-hob |
| [Cherry, custard & almond sponge cake ](https://www.bbcgoodfood.com/recipes/cherry-custard-almond-sponge-cake) | 5/5 · 6 | Dessert, Baking | oven-hob |
| [Homemade cherry pie ](https://www.bbcgoodfood.com/recipes/cherry-pie) | 4.5/5 · 20 | Dessert, Baking | oven-hob |
| [Chicken & bean enchiladas ](https://www.bbcgoodfood.com/recipes/chicken-bean-enchiladas) | 4.4/5 · 125 | Lunch, Dinner | oven-hob |
| [Chicken souvlaki ](https://www.bbcgoodfood.com/recipes/chicken-gyros) | 4.8/5 · 230 | Lunch, Dinner | oven-hob |
| [Chicken pasta bake ](https://www.bbcgoodfood.com/recipes/chicken-pasta-bake) | 4.6/5 · 1031 | Lunch, Dinner | oven-hob |
| [Chilli prawn linguine ](https://www.bbcgoodfood.com/recipes/chilli-prawn-linguine) | 4.5/5 · 246 | Lunch, Dinner | hob |
| [Chocolate, cardamom & hazelnut torte ](https://www.bbcgoodfood.com/recipes/chocolate-cardamom-hazelnut-torte) | 4.5/5 · 18 | Dessert | oven-hob |
| [Chocolate cheesecake ](https://www.bbcgoodfood.com/recipes/chocolate-cheesecake) | 4.5/5 · 125 | Dessert, Baking | microwave |
| [Chocolate chip traybake ](https://www.bbcgoodfood.com/recipes/chocolate-chip-traybake) | 4.5/5 · 46 | Dessert, Baking | oven |
| [Chocolate Guinness cake ](https://www.bbcgoodfood.com/recipes/chocolate-stout-cake) | 4.5/5 · 31 | Dessert, Baking | oven-hob |
| [Chocolate tiffin ](https://www.bbcgoodfood.com/recipes/chocolate-tiffin) | 4.7/5 · 126 | Dessert | hob |
| [Chorizo & soft-boiled egg salad ](https://www.bbcgoodfood.com/recipes/chorizo-soft-boiled-egg-salad) | 4.7/5 · 23 | Lunch, Dinner | hob |
| [Cinnamon balls ](https://www.bbcgoodfood.com/recipes/cinnamon-balls) | 4.5/5 · 9 | Dessert | oven |
| [Citrus, almond & yogurt cake ](https://www.bbcgoodfood.com/recipes/citrus-almond-yogurt-cake) | 4.8/5 · 26 | Dessert, Baking | oven-hob |
| [Classic cheese scones ](https://www.bbcgoodfood.com/recipes/classic-cheese-scones) | 4.8/5 · 497 | Lunch, Baking | oven |
| [Classic crêpes ](https://www.bbcgoodfood.com/recipes/classic-crepes) | 4.3/5 · 123 | Dessert | hob |
| [Classic spaghetti Bolognese ](https://www.bbcgoodfood.com/recipes/classic-spaghetti-bolognese) | 4.7/5 · 24 | Lunch, Dinner | hob |
| [Coconut & jam macaroon traybake ](https://www.bbcgoodfood.com/recipes/coconut-jam-macaroon-traybake) | 4.7/5 · 17 | Dessert, Baking | oven-hob |
| [Coconut quindim ](https://www.bbcgoodfood.com/recipes/coconut-quindim) | 4.6/5 · 5 | Dessert | oven |
| [Coconut & squash dhansak ](https://www.bbcgoodfood.com/recipes/coconut-squash-dhansak) | 4.7/5 · 358 | Lunch, Dinner | oven-hob |
| [Cookie dough pizza ](https://www.bbcgoodfood.com/recipes/cookie-dough-pizza) | 4.3/5 · 45 | Dessert, Baking | oven |
| [Courgette & cheddar soda bread ](https://www.bbcgoodfood.com/recipes/courgette-cheddar-soda-bread) | 4.7/5 · 40 | Lunch, Baking | oven |
| [Courgette & mushroom bread ](https://www.bbcgoodfood.com/recipes/courgette-mushroom-bread) | 4.3/5 · 52 | Lunch, Baking | oven-hob |
| [Crab & asparagus pappardelle ](https://www.bbcgoodfood.com/recipes/crab-asparagus-pappardelle) | 4.4/5 · 33 | Lunch, Dinner | hob |
| [Crab & saffron risotto ](https://www.bbcgoodfood.com/recipes/crab-saffron-risotto) | 4.3/5 · 12 | Lunch, Dinner | hob |
| [Creamy courgette lasagne ](https://www.bbcgoodfood.com/recipes/creamy-courgette-lasagne) | 4.5/5 · 738 | Lunch, Dinner | oven-hob |
| [Creamy leek, pesto & squash pie ](https://www.bbcgoodfood.com/recipes/creamy-leek-pesto-squash-pie) | 4.4/5 · 64 | Lunch, Dinner | oven-hob |
| [Spanakopita ](https://www.bbcgoodfood.com/recipes/crispy-greek-style-pie) | 4.6/5 · 535 | Baking | oven-hob |
| [Dorset apple traybake ](https://www.bbcgoodfood.com/recipes/dorset-apple-traybake) | 4.6/5 · 527 | Baking | oven |
| [Double bean & roasted pepper chilli ](https://www.bbcgoodfood.com/recipes/double-bean-roasted-pepper-chilli) | 4.7/5 · 449 | Lunch, Dinner | oven-hob |
| [Double-dipped shortbread cookies ](https://www.bbcgoodfood.com/recipes/double-dipped-shortbread-cookies) | 4.7/5 · 13 | Dessert, Baking | oven |
| [Double ginger cookies ](https://www.bbcgoodfood.com/recipes/double-ginger-cookies) | 4.6/5 · 33 | Dessert, Baking | oven-hob |
| [Easy baked tomato risotto ](https://www.bbcgoodfood.com/recipes/easy-baked-tomato-risotto) | 4.6/5 · 10 | Lunch, Dinner | oven-hob |
| [Easy caramel cake ](https://www.bbcgoodfood.com/recipes/easy-caramel-cake) | 4.5/5 · 131 | Dessert, Baking | oven-hob |
| [Easy chocolate molten cakes ](https://www.bbcgoodfood.com/recipes/easy-chocolate-molten-cakes) | 4.6/5 · 192 | Dessert, Baking | oven-hob |
| [Easy cornflake tart ](https://www.bbcgoodfood.com/recipes/easy-cornflake-tart) | 4.8/5 · 64 | Dessert, Baking | oven-hob |
| [Easy millionaire’s shortbread ](https://www.bbcgoodfood.com/recipes/easy-millionaires-shortbread) | 4.3/5 · 430 | Dessert, Baking | oven-hob |
| [Easy white bread ](https://www.bbcgoodfood.com/recipes/easy-white-bread) | 4.7/5 · 693 | Lunch, Baking | oven |
| [Egg & bacon pie ](https://www.bbcgoodfood.com/recipes/egg-bacon-pie) | 4.8/5 · 8 | Lunch, Baking | oven-hob |
| [Lemon & elderflower celebration cake ](https://www.bbcgoodfood.com/recipes/elderflower-lemon-celebration-cake) | 4.7/5 · 129 | Dessert, Baking | oven |
| [English muffins ](https://www.bbcgoodfood.com/recipes/english-muffins) | 4.5/5 · 7 | Baking | hob |
| [Espresso martini cheesecake ](https://www.bbcgoodfood.com/recipes/espresso-martini-cheesecake) | 4.7/5 · 15 | Dessert, Baking | hob |
| [Fajita chicken rice bowl with burnt lime ](https://www.bbcgoodfood.com/recipes/fajita-chicken-rice-bowl-with-burnt-lime) | 4.3/5 · 92 | Lunch, Dinner | oven-hob |
| [Five-bean chilli ](https://www.bbcgoodfood.com/recipes/five-bean-chilli) | 4.3/5 · 70 | Lunch, Dinner | hob |
| [Flamiche ](https://www.bbcgoodfood.com/recipes/flamiche) | 4.9/5 · 11 | Lunch, Dinner | oven-hob |
| [Flan ](https://www.bbcgoodfood.com/recipes/flan) | 4.5/5 · 6 | Dessert | oven-hob |
| [Flourless chocolate & almond cake ](https://www.bbcgoodfood.com/recipes/flourless-chocolate-almond-cake) | 4.8/5 · 55 | Dessert, Baking | oven-hob |
| [Focaccia ](https://www.bbcgoodfood.com/recipes/focaccia) | 4.5/5 · 358 | Lunch, Baking | oven |
| [Frango churrasco (Grilled lemon & garlic chicken) ](https://www.bbcgoodfood.com/recipes/frango-churrasco-grilled-lemon-garlic-chicken) | 4.8/5 · 18 | Lunch, Dinner | oven |
| [Gambas al ajillo ](https://www.bbcgoodfood.com/recipes/gambas-al-ajillo) | 4.4/5 · 5 | Lunch, Dinner | hob |
| [Giant cookie ](https://www.bbcgoodfood.com/recipes/giantcookie) | 4.4/5 · 73 | Dessert, Baking | oven-hob |
| [Gigantes plaki ](https://www.bbcgoodfood.com/recipes/gigantes-plaki) | 4.8/5 · 72 | Lunch, Dinner | oven-hob |
| [Gluten-free apple crumble ](https://www.bbcgoodfood.com/recipes/gluten-free-apple-crumble) | 4.5/5 · 27 | Dessert | oven-hob |
| [Gluten-free banana bread ](https://www.bbcgoodfood.com/recipes/gluten-free-banana-bread) | 4.8/5 · 45 | Dessert, Baking | oven |
| [Gluten-free shortbread ](https://www.bbcgoodfood.com/recipes/gluten-free-shortbread) | 4.7/5 · 9 | Dessert, Baking | oven |
| [Gluten-free victoria sponge ](https://www.bbcgoodfood.com/recipes/gluten-free-victoria-sponge) | 4.3/5 · 6 | Dessert | oven |
| [Greek bouyiourdi ](https://www.bbcgoodfood.com/recipes/greek-bouyiourdi) | 4.9/5 · 24 | Lunch, Dinner | oven |
| [Greek lamb & macaroni bake ](https://www.bbcgoodfood.com/recipes/greek-lamb-macaroni-bake) | 4.6/5 · 106 | Lunch, Dinner | oven-hob |
| [Greek lamb with orzo ](https://www.bbcgoodfood.com/recipes/greek-lamb-orzo) | 4.6/5 · 253 | Lunch, Dinner | oven |
| [Greek lamb with potatoes & olives ](https://www.bbcgoodfood.com/recipes/greek-lamb-potatoes-olives) | 4.6/5 · 54 | Lunch, Dinner | oven |
| [Greek lamb tray bake ](https://www.bbcgoodfood.com/recipes/greek-lamb-tray-bake) | 4.5/5 · 110 | Lunch, Dinner | oven |
| [Greek roast lamb ](https://www.bbcgoodfood.com/recipes/greek-roast-lamb) | 4.8/5 · 75 | Lunch, Dinner | oven-hob |
| [Greek-style beans ](https://www.bbcgoodfood.com/recipes/greek-style-beans) | 4.4/5 · 20 | Lunch, Dinner | hob |
| [Greek-style roast fish ](https://www.bbcgoodfood.com/recipes/greek-style-roast-fish) | 4.3/5 · 183 | Lunch, Dinner | oven |
| [Hake & seafood cataplana ](https://www.bbcgoodfood.com/recipes/hake-seafood-cataplana) | 4.8/5 · 35 | Lunch, Dinner | hob |
| [Halloumi & quinoa fattoush ](https://www.bbcgoodfood.com/recipes/halloumi-quinoa-fattoush) | 4.6/5 · 29 | Lunch, Dinner | oven-hob |
| [Next level turkey & ham pie ](https://www.bbcgoodfood.com/recipes/ham-turkey-pie) | 4.4/5 · 80 | Lunch, Dinner | oven-hob |
| [Hearty pasta soup ](https://www.bbcgoodfood.com/recipes/hearty-pasta-soup) | 4.6/5 · 392 | Lunch, Dinner | hob |
| [Herby lamb fillet with caponata ](https://www.bbcgoodfood.com/recipes/herby-lamb-fillet-caponata) | 4.5/5 · 9 | Lunch, Dinner | oven-hob |
| [Hob-to-table moussaka ](https://www.bbcgoodfood.com/recipes/hob-table-moussaka) | 4.8/5 · 195 | Lunch, Dinner | hob |
| [Hot cross buns ](https://www.bbcgoodfood.com/recipes/hot-cross-buns-2) | 4.3/5 · 306 | Baking | oven-hob |
| [Hot & spicy sweet potatoes ](https://www.bbcgoodfood.com/recipes/hot-spicy-sweet-potatoes) | 4.3/5 · 26 | Lunch, Dinner | barbecue |
| [Huevos rancheros ](https://www.bbcgoodfood.com/recipes/huevos-rancheros) | 4.7/5 · 34 | Breakfast | hob |
| [Hummus flatbread pizzas with roasted veg ](https://www.bbcgoodfood.com/recipes/hummus-flatbread-pizzas-with-roasted-veg) | 4.9/5 · 9 | Lunch, Baking | oven-hob |
| [Irish soda bread ](https://www.bbcgoodfood.com/recipes/irish-soda-bread) | 4.5/5 · 298 | Baking | oven |
| [Jam doughnut pancakes ](https://www.bbcgoodfood.com/recipes/jam-doughnut-pancakes) | 5/5 · 5 | Dessert, Baking | hob |
| [Jerk chicken with rice & peas ](https://www.bbcgoodfood.com/recipes/jerk-chicken-rice-peas) | 4.5/5 · 197 | Lunch, Dinner | oven-hob |
| [Juicy prawn & lemongrass burgers ](https://www.bbcgoodfood.com/recipes/juicy-prawn-lemongrass-burgers) | 4.8/5 · 12 | Lunch, Dinner | hob |
| [Korean BBQ wings ](https://www.bbcgoodfood.com/recipes/korean-bbq-wings) | 4.8/5 · 11 | Lunch, Dinner | oven-hob |
| [Korean bibimbap ](https://www.bbcgoodfood.com/recipes/korean-bibimbap) | 4.8/5 · 8 | Lunch, Dinner | hob |
| [Korean hot dogs ](https://www.bbcgoodfood.com/recipes/korean-hotdog) | 4.3/5 · 7 | Lunch, Dinner | packet |
| [Korean rice pot ](https://www.bbcgoodfood.com/recipes/korean-rice-pot) | 4.8/5 · 12 | Lunch, Dinner | hob |
| [Korean-style fried rice ](https://www.bbcgoodfood.com/recipes/korean-style-fried-rice) | 4.3/5 · 9 | Lunch, Dinner | hob |
| [Lamb kleftiko ](https://www.bbcgoodfood.com/recipes/lamb-kleftiko) | 4.6/5 · 92 | Lunch, Dinner | oven |
| [Lamb koftas ](https://www.bbcgoodfood.com/recipes/lamb-koftas) | 4.5/5 · 148 | Lunch, Dinner | oven-hob |
| [Homemade soft pretzels ](https://www.bbcgoodfood.com/recipes/learn-to-make-pretzels) | 4.7/5 · 58 | Lunch, Baking | oven-hob |
| [Lebanese poussin with spiced aubergine pilaf ](https://www.bbcgoodfood.com/recipes/lebanese-poussin-spiced-aubergine-pilaf) | 4.8/5 · 20 | Lunch, Dinner | oven-hob |
| [Leek, goat’s cheese, walnut & lemon tart ](https://www.bbcgoodfood.com/recipes/leek-goats-cheese-walnut-lemon-tart) | 4.7/5 · 70 | Lunch, Baking | oven-hob |
| [Lemon cheesecake (no-bake) ](https://www.bbcgoodfood.com/recipes/lemon-cheesecake) | 4.7/5 · 321 | Dessert, Baking | hob |
| [Lemon drizzle cake ](https://www.bbcgoodfood.com/recipes/lemon-drizzle-cake) | 4.7/5 · 3175 | Dessert, Baking | oven |
| [Lemon & elderflower traybake ](https://www.bbcgoodfood.com/recipes/lemon-elderflower-traybake) | 4.4/5 · 5 | Dessert, Baking | oven |
| [Easy lemon layer cake ](https://www.bbcgoodfood.com/recipes/lemon-layer-cake-with-soft-cheese-icing) | 4.7/5 · 83 | Dessert, Baking | oven-hob |
| [Lemon & raspberry doughnut pudding ](https://www.bbcgoodfood.com/recipes/lemon-raspberry-doughnut-pudding) | 4.3/5 · 22 | Dessert | oven-hob |
| [Lemon sponge cake ](https://www.bbcgoodfood.com/recipes/lemon-sponge) | 4.3/5 · 60 | Dessert | oven-hob |
| [Lighter chicken cacciatore ](https://www.bbcgoodfood.com/recipes/lighter-chicken-cacciatore) | 4.4/5 · 137 | Lunch, Dinner | hob |
| [Fruity traybake ](https://www.bbcgoodfood.com/recipes/lindas-fruity-traybake) | 4.4/5 · 25 | Baking | oven |
| [Lobster mac & cheese ](https://www.bbcgoodfood.com/recipes/lobster-mac-cheese) | 5/5 · 13 | Lunch, Dinner | oven-hob |
| [Madeleines ](https://www.bbcgoodfood.com/recipes/madeleines) | 4.8/5 · 43 | Dessert, Baking | oven |
| [Malt chocolate cheesecake ](https://www.bbcgoodfood.com/recipes/malt-chocolate-cheesecake) | 4.7/5 · 176 | Dessert, Baking | no-cook |
| [Mexican fiesta rice ](https://www.bbcgoodfood.com/recipes/mexican-fiesta-rice) | 4.3/5 · 75 | Lunch, Dinner | hob |
| [Middle Eastern carrot salad ](https://www.bbcgoodfood.com/recipes/middle-eastern-carrot-salad) | 5/5 · 5 | Lunch, Dinner | no-cook |
| [Mini lentil shepherd’s pies ](https://www.bbcgoodfood.com/recipes/mini-lentil-shepherds-pies) | 4.9/5 · 36 | Lunch, Dinner | oven-hob |
| [Miso soup ](https://www.bbcgoodfood.com/recipes/miso-soup) | 4.3/5 · 16 | Lunch, Dinner | hob |
| [Moroccan-style chickpea soup ](https://www.bbcgoodfood.com/recipes/moroccan-chickpea-soup-0) | 4.6/5 · 325 | Lunch, Dinner | hob |
| [Moroccan meatball tagine with lemon & olives ](https://www.bbcgoodfood.com/recipes/moroccan-meatball-tagine-lemon-olives) | 4.8/5 · 95 | Lunch, Dinner | hob |
| [Mushroom pie ](https://www.bbcgoodfood.com/recipes/mushroom-pie) | 4.9/5 · 6 | Lunch, Dinner | oven-hob |
| [Mushroom soup ](https://www.bbcgoodfood.com/recipes/mushroom-soup) | 4.8/5 · 422 | Lunch, Dinner | hob |
| [Mussels with chorizo, beans & cavolo nero ](https://www.bbcgoodfood.com/recipes/mussels-chorizo-beans-cavolo-nero) | 4.9/5 · 11 | Lunch, Dinner | hob |
| [Naan bread ](https://www.bbcgoodfood.com/recipes/naan-bread) | 4.8/5 · 401 | Lunch, Baking | oven-hob |
| [Nanaimo bars ](https://www.bbcgoodfood.com/recipes/nanaimo-bars) | 4.3/5 · 24 | Dessert | hob |
| [Easy chocolate fudge cake ](https://www.bbcgoodfood.com/recipes/naughty-chocolate-fudge-cake) | 4.7/5 · 1183 | Dessert, Baking | oven |
| [New York cheesecake ](https://www.bbcgoodfood.com/recipes/new-york-cheesecake) | 4.7/5 · 653 | Dessert, Baking | oven-hob |
| [Next level bakewell tart ](https://www.bbcgoodfood.com/recipes/next-level-bakewell-tart) | 4.5/5 · 18 | Dessert, Baking | oven-hob |
| [Classic carrot cake ](https://www.bbcgoodfood.com/recipes/next-level-carrot-cake) | 4.9/5 · 33 | Dessert, Baking | oven-hob |
| [Next level chicken pie ](https://www.bbcgoodfood.com/recipes/next-level-chicken-pie) | 4.5/5 · 197 | Lunch, Dinner | oven-hob |
| [Next level brown butter cookies ](https://www.bbcgoodfood.com/recipes/next-level-chocolate-chip-cookies) | 4.6/5 · 85 | Dessert, Baking | oven-hob |
| [Next level paella ](https://www.bbcgoodfood.com/recipes/next-level-paella) | 4.5/5 · 38 | Lunch, Dinner | hob |
| [No-bake orange cheesecake ](https://www.bbcgoodfood.com/recipes/no-bake-orange-cheesecake) | 4.6/5 · 51 | Dessert, Baking | no-cook |
| [No-bake PB&J cheesecake squares ](https://www.bbcgoodfood.com/recipes/no-bake-pbj-cheesecake-squares) | 5/5 · 9 | Dessert, Baking | hob |
| [Baklava ](https://www.bbcgoodfood.com/recipes/nutty-baklava) | 4.5/5 · 36 | Dessert, Baking | oven-hob |
| [Olive oil bread ](https://www.bbcgoodfood.com/recipes/olive-oil-bread) | 4.8/5 · 142 | Baking | oven-hob |
| [One-pan seafood roast with smoky garlic butter ](https://www.bbcgoodfood.com/recipes/one-pan-seafood-roast-smoky-garlic-butter) | 4.9/5 · 24 | Lunch, Dinner | oven-hob |
| [Oreo cheesecake ](https://www.bbcgoodfood.com/recipes/oreo-cheesecake) | 4.8/5 · 10 | Dessert, Baking | hob |
| [Orzo & chickpea soup ](https://www.bbcgoodfood.com/recipes/orzo-chickpea-soup) | 4.6/5 · 31 | Lunch, Dinner | hob |
| [Padron peppers ](https://www.bbcgoodfood.com/recipes/padron-peppers) | 4.8/5 · 32 | Lunch, Dinner | air-fryer |
| [Panang chicken curry (kaeng panang gai) ](https://www.bbcgoodfood.com/recipes/panang-chicken-curry-kaeng-panang-gai) | 4.8/5 · 11 | Lunch, Dinner | hob |
| [Peach & raspberry almond crumble cake ](https://www.bbcgoodfood.com/recipes/peach-raspberry-almond-crumble-cake) | 4.8/5 · 7 | Dessert, Baking | oven |
| [Peanut butter cookies ](https://www.bbcgoodfood.com/recipes/peanut-butter-cookies) | 4.5/5 · 375 | Dessert, Baking | oven |
| [Pesto salmon & bean gratins ](https://www.bbcgoodfood.com/recipes/pesto-salmon-bean-gratins) | 4.3/5 · 23 | Lunch, Dinner | oven |
| [Pitta bread ](https://www.bbcgoodfood.com/recipes/pitta-bread) | 4.8/5 · 131 | Baking | oven |
| [Pizza Margherita in 4 easy steps ](https://www.bbcgoodfood.com/recipes/pizza-margherita-4-easy-steps) | 4.7/5 · 569 | Lunch, Dinner | oven |
| [Ultimate plum & apple cobbler ](https://www.bbcgoodfood.com/recipes/plum-apple-cobbler) | 4.9/5 · 39 | Dessert | oven-hob |
| [Plum & marzipan pie ](https://www.bbcgoodfood.com/recipes/plum-marzipan-pie) | 4.5/5 · 9 | Dessert, Baking | oven-hob |
| [Poached eggs with smoked salmon and bubble & squeak ](https://www.bbcgoodfood.com/recipes/poached-eggs-smoked-salmon-and-bubble-squeak) | 4.5/5 · 9 | Breakfast | hob |
| [Pomegranate chicken with almond couscous ](https://www.bbcgoodfood.com/recipes/pomegranate-chicken-almond-couscous) | 4.7/5 · 202 | Lunch, Dinner | hob |
| [Pot-roast beef with French onion gravy ](https://www.bbcgoodfood.com/recipes/pot-roast-beef-french-onion-gravy) | 4.5/5 · 210 | Lunch, Dinner | oven-hob |
| [Prawn orzo saganaki-style ](https://www.bbcgoodfood.com/recipes/prawn-orzo-saganaki-style) | 4.8/5 · 15 | Lunch, Dinner | hob |
| [Prawn tikka masala ](https://www.bbcgoodfood.com/recipes/prawn-tikka-masala) | 4.8/5 · 133 | Lunch, Dinner | hob |
| [Pumpkin soup ](https://www.bbcgoodfood.com/recipes/pumpkin-soup) | 4.5/5 · 231 | Lunch, Dinner | hob |
| [Punjabi cauliflower with potatoes (aloo gobi) ](https://www.bbcgoodfood.com/recipes/punjabi-cauliflower-with-potatoes-aloo-gobi) | 4.4/5 · 5 | Lunch, Dinner | hob |
| [Quick & easy tiramisu ](https://www.bbcgoodfood.com/recipes/quick-easy-tiramisu) | 4.5/5 · 27 | Dessert | hob |
| [Easy soft flatbreads ](https://www.bbcgoodfood.com/recipes/quick-puffy-flatbreads) | 4.5/5 · 83 | Baking | hob |
| [Quick sushi bowl ](https://www.bbcgoodfood.com/recipes/quick-sushi-bowl) | 4.8/5 · 12 | Lunch, Dinner | no-cook |
| [Railway lamb curry ](https://www.bbcgoodfood.com/recipes/railway-lamb-curry) | 4.4/5 · 43 | Lunch, Dinner | hob |
| [Roast cod with paella & saffron olive oil ](https://www.bbcgoodfood.com/recipes/roast-cod-paella-saffron-olive-oil) | 4.7/5 · 9 | Lunch, Dinner | oven-hob |
| [Roasted red pepper soup with crispy croutons ](https://www.bbcgoodfood.com/recipes/roasted-red-pepper-soup-with-crispy-croutons) | 4.6/5 · 17 | Lunch, Dinner | oven-hob |
| [Roasted sweet potato & carrot soup ](https://www.bbcgoodfood.com/recipes/roasted-sweet-potato-carrot-soup) | 4.8/5 · 298 | Lunch, Dinner | oven-hob |
| [Roasted tomato, basil & parmesan quiche ](https://www.bbcgoodfood.com/recipes/roasted-tomato-basil-parmesan-quiche) | 4.7/5 · 226 | Lunch, Baking | oven |
| [Salted caramel cheesecake ](https://www.bbcgoodfood.com/recipes/salted-caramel-cheesecake) | 4.3/5 · 43 | Dessert, Baking | oven |
| [Shellfish, orzo & saffron stew ](https://www.bbcgoodfood.com/recipes/shellfish-orzo-saffron-stew) | 4.7/5 · 7 | Lunch, Dinner | hob |
| [Simit bread ](https://www.bbcgoodfood.com/recipes/simit-bread) | 4.8/5 · 5 | Baking | oven-hob |
| [Simple coconut & bean soup ](https://www.bbcgoodfood.com/recipes/simple-coconut-bean-soup) | 4.8/5 · 27 | Lunch, Dinner | hob |
| [Easy soda bread ](https://www.bbcgoodfood.com/recipes/simple-soda-bread) | 4.3/5 · 133 | Baking | oven |
| [Slow cooker beef stew with dumplings ](https://www.bbcgoodfood.com/recipes/slow-cooker-beef-stew-with-dumplings) | 4.3/5 · 44 | Lunch, Dinner | slow-cooker |
| [Slow-cooker beef stew ](https://www.bbcgoodfood.com/recipes/slow-cooker-beef-stew) | 4.8/5 · 684 | Lunch, Dinner | slow-cooker |
| [Slow cooker beef brisket ](https://www.bbcgoodfood.com/recipes/slow-cooker-brisket-with-golden-ale-gravy-horseradish-mash) | 4.5/5 · 55 | Lunch, Dinner | slow-cooker |
| [Slow cooker chilli con carne ](https://www.bbcgoodfood.com/recipes/slow-cooker-chilli-con-carne) | 4.5/5 · 147 | Lunch, Dinner | slow-cooker |
| [Slow cooker gammon in cola ](https://www.bbcgoodfood.com/recipes/slow-cooker-gammon) | 4.6/5 · 154 | Lunch, Dinner | slow-cooker |
| [Slow cooker lamb tagine ](https://www.bbcgoodfood.com/recipes/slow-cooker-lamb-tagine) | 4.3/5 · 48 | Lunch, Dinner | slow-cooker |
| [Slow cooker leg of lamb ](https://www.bbcgoodfood.com/recipes/slow-cooker-leg-lamb) | 4.8/5 · 64 | Lunch, Dinner | slow-cooker |
| [Slow cooker pork casserole ](https://www.bbcgoodfood.com/recipes/slow-cooker-pork-casserole) | 4.5/5 · 155 | Lunch, Dinner | slow-cooker |
| [Slow cooker ratatouille ](https://www.bbcgoodfood.com/recipes/slow-cooker-ratatouille) | 4.3/5 · 41 | Lunch, Dinner | slow-cooker |
| [Slow-cooker sausage casserole ](https://www.bbcgoodfood.com/recipes/slow-cooker-sausage-casserole) | 4.7/5 · 225 | Lunch, Dinner | slow-cooker |
| [Smashed peas on toast ](https://www.bbcgoodfood.com/recipes/smashed-peas-on-toast) | 5/5 · 8 | Breakfast | hob |
| [Smoked salmon & poppy seed palmiers ](https://www.bbcgoodfood.com/recipes/smoked-salmon-poppy-seed-palmiers) | 4.6/5 · 17 | Lunch, Baking | oven |
| [Smoked trout tartlets ](https://www.bbcgoodfood.com/recipes/smoked-trout-tartlets) | 4.8/5 · 5 | Lunch, Baking | oven |
| [S'mores dip ](https://www.bbcgoodfood.com/recipes/smores-dip) | 4.3/5 · 20 | Dessert | oven-hob |
| [Spanish sardines on toast ](https://www.bbcgoodfood.com/recipes/spanish-sardines-toast) | 4.7/5 · 38 | Lunch, Dinner | hob |
| [Speedy Moroccan meatballs ](https://www.bbcgoodfood.com/recipes/speedy-moroccan-meatballs) | 4.5/5 · 69 | Lunch, Dinner | hob |
| [Spiced bulgur wheat with roasted peppers ](https://www.bbcgoodfood.com/recipes/spiced-bulgur-wheat-roasted-peppers) | 4.7/5 · 26 | Lunch, Dinner | microwave |
| [Spiced cauliflower roast ](https://www.bbcgoodfood.com/recipes/spiced-cauliflower-roast) | 4.9/5 · 21 | Lunch, Dinner | oven-hob |
| [Spiced tortilla ](https://www.bbcgoodfood.com/recipes/spiced-tortilla) | 4.3/5 · 20 | Lunch, Dinner | oven-hob |
| [Kimchi pancake (kimchi jeon) ](https://www.bbcgoodfood.com/recipes/spicy-kimchi-pancake-kimchi-jeon) | 4.9/5 · 10 | Dessert, Baking | oven-hob |
| [Steamed bao buns ](https://www.bbcgoodfood.com/recipes/steamed-bao-buns) | 4.5/5 · 68 | Baking | hob |
| [Sticky jerk salmon with mango slaw ](https://www.bbcgoodfood.com/recipes/sticky-jerk-salmon-mango-slaw) | 4.6/5 · 15 | Lunch, Dinner | oven |
| [Vegan sticky toffee pear pudding ](https://www.bbcgoodfood.com/recipes/sticky-toffee-pear-pudding) | 4.5/5 · 44 | Dessert | oven-hob |
| [Strawberry panna cotta ](https://www.bbcgoodfood.com/recipes/strawberry-panna-cotta) | 5/5 · 25 | Dessert | hob |
| [Summer couscous salad ](https://www.bbcgoodfood.com/recipes/summer-couscous-salad) | 4.7/5 · 187 | Lunch, Dinner | hob |
| [Easy sausage rolls ](https://www.bbcgoodfood.com/recipes/super-sausage-rolls) | 4.7/5 · 70 | Lunch, Baking | oven |
| [Sweet potato & lentil soup ](https://www.bbcgoodfood.com/recipes/sweet-potato-lentil-soup) | 4.7/5 · 361 | Lunch, Dinner | hob |
| [Tarator-style salmon ](https://www.bbcgoodfood.com/recipes/tarator-style-salmon) | 5/5 · 14 | Lunch, Dinner | oven |
| [Thai beef stir-fry ](https://www.bbcgoodfood.com/recipes/thai-beef-stir-fry) | 4.4/5 · 128 | Lunch, Dinner | hob |
| [Thai fried rice with prawns & peas ](https://www.bbcgoodfood.com/recipes/thai-fried-rice-prawns-peas) | 5/5 · 16 | Lunch, Dinner | hob |
| [Thai pork & peanut curry ](https://www.bbcgoodfood.com/recipes/thai-pork-peanut-curry) | 4.8/5 · 416 | Lunch, Dinner | hob |
| [Thai shredded chicken & runner bean salad ](https://www.bbcgoodfood.com/recipes/thai-shredded-chicken-runner-bean-salad) | 5/5 · 24 | Lunch, Dinner | hob |
| [Thai-style steamed fish ](https://www.bbcgoodfood.com/recipes/thai-style-steamed-fish) | 4.5/5 · 246 | Lunch, Dinner | hob |
| [The breakfast club ](https://www.bbcgoodfood.com/recipes/the-breakfast-club) | 5/5 · 10 | Breakfast | oven-hob |
| [Tiger bread ](https://www.bbcgoodfood.com/recipes/tiger-bread) | 4.3/5 · 65 | Lunch, Baking | oven |
| [Easy gluten-free flatbread ](https://www.bbcgoodfood.com/recipes/toasted-cumin-flatbreads) | 4.3/5 · 84 | Baking | oven |
| [Toffee apple bread & butter pudding ](https://www.bbcgoodfood.com/recipes/toffee-apple-bread-butter-pudding) | 4.4/5 · 19 | Dessert, Baking | oven |
| [Tom yum soup with prawns ](https://www.bbcgoodfood.com/recipes/tom-yum-soup-with-prawns) | 5/5 · 15 | Lunch, Dinner | hob |
| [Tres leches cake (milk cake) ](https://www.bbcgoodfood.com/recipes/tres-leches-cake) | 4.5/5 · 31 | Dessert, Baking | oven |
| [Tteokbokki (spicy rice cakes) ](https://www.bbcgoodfood.com/recipes/tteokbokki-spicy-rice-cakes) | 4.8/5 · 5 | Dessert, Baking | hob |
| [Tzatziki ](https://www.bbcgoodfood.com/recipes/tzatziki) | 4.7/5 · 76 | Lunch, Dinner | oven |
| [Vegan apple crumble ](https://www.bbcgoodfood.com/recipes/vegan-apple-crumble) | 4.5/5 · 29 | Dessert | oven |
| [Vegan banana bread ](https://www.bbcgoodfood.com/recipes/vegan-banana-bread) | 4.5/5 · 549 | Dessert, Baking | oven |
| [Vegan banana muffins ](https://www.bbcgoodfood.com/recipes/vegan-banana-cupcakes) | 4.5/5 · 52 | Dessert, Baking | oven |
| [Vegan brownies ](https://www.bbcgoodfood.com/recipes/vegan-brownies) | 4.5/5 · 118 | Dessert, Baking | oven-hob |
| [Vegan chickpea curry jacket potatoes ](https://www.bbcgoodfood.com/recipes/vegan-chickpea-curry-jacket-potato) | 4.7/5 · 107 | Lunch, Dinner | air-fryer |
| [Vegan jambalaya ](https://www.bbcgoodfood.com/recipes/vegan-jambalaya) | 4.5/5 · 124 | Lunch, Dinner | hob |
| [Vegan scones ](https://www.bbcgoodfood.com/recipes/vegan-scones) | 4.8/5 · 61 | Dessert, Baking | oven |
| [Veggie okonomiyaki ](https://www.bbcgoodfood.com/recipes/veggie-okonomiyaki) | 4.3/5 · 17 | Lunch, Dinner | hob |
| [Veggie shepherd's pie with sweet potato mash ](https://www.bbcgoodfood.com/recipes/veggie-shepherds-pie-sweet-potato-mash) | 4.6/5 · 767 | Lunch, Dinner | oven-hob |
| [Vintage chocolate chip cookies ](https://www.bbcgoodfood.com/recipes/vintage-chocolate-chip-cookies) | 4.8/5 · 1340 | Dessert, Baking | oven |
| [White chocolate cheesecake ](https://www.bbcgoodfood.com/recipes/white-chocolate-cheesecake) | 4.5/5 · 100 | Dessert, Baking | hob |
| [White chocolate, mascarpone & pistachio cheesecake ](https://www.bbcgoodfood.com/recipes/white-chocolate-mascarpone-pistachio-cheesecake) | 4.5/5 · 23 | Dessert, Baking | oven-hob |
| [Carrot cake ](https://www.bbcgoodfood.com/recipes/yummy-scrummy-carrot-cake-recipe) | 4.7/5 · 1310 | Dessert, Baking | oven |
