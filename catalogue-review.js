/* Reviewed catalogue metadata; evidence in docs/catalogue/classification-review.json. */
(function (root) {
  "use strict";
  // Preference families never combine stock or convert ingredient quantities.
  root.PLATES_DATA.preferenceFamilies = [
    {
      anchors: ["salmon", "tuna", "prawns"],
      members: [
        "salmon",
        "tuna",
        "prawns",
        "raw-prawns",
        "anchovy",
        "oyster-sauce",
        "fish-sauce",
        "ex-skinless-cod-loins-7b7654e9",
        "ex-frozen-small-atlantic-cooked-prawns-defrosted-837cfb9a",
        "ex-prawns-571121fc",
        "ex-dressed-crab-48094b28",
        "ex-fish-stock-fa752599",
        "ex-white-crabmeat-eee983fc",
        "ex-brown-crabmeat-37b070eb",
        "ex-raw-prawns-2867dc61",
        "ex-ready-cooked-mussels-1f2011f4",
        "ex-peeled-prawns-aecfd7cd",
        "ex-raw-king-prawns-shelled-and-a0767334",
        "ex-frozen-lobster-8a4e9f2f",
        "ex-brown-crab-meat-3f87a103",
        "ex-mussels-cleaned-and-beards-removed-1906a346",
        "ex-raw-tiger-prawns-in-their-shells-3eb47d4f",
        "ex-mussels-38f8b4fd",
        "ex-squid-1be2787d",
        "ex-prawns-heads-and-shells-on-0d1747bf",
        "ex-mussels-34ebd4b6",
        "ex-squids-with-tentacles-311544e8",
        "ex-shrimp-paste-0c1864f3",
        "ex-smoked-salmon-3bdb2bdf",
        "ex-cooked-salmon-fillets-a6eed50b",
        "ex-prawn-72c00655",
        "ex-cooked-shelled-mussels-4d3cda6d",
        "ex-cod-fillets-364cbdf6",
        "ex-clams-98ce79c8",
        "ex-prawns-shells-and-heads-on-4f22cd21",
        "ex-smoked-trout-2b9b6aa1",
        "ex-sardines-in-sunflower-oil-d169028f",
        "ex-trout-fillets-9cabe4fd",
        "ex-whole-raw-king-prawns-e27acc41",
        "ex-oyster-sauce-333242a0",
        "ex-cooked-prawns-b45ce0ad",
        "ex-white-fish-loin-aed8cc2a",
        "ex-side-of-salmon-skinned-and-pin-boned-35774d83",
        "ex-skinless-salmon-fillets-abcc72d4",
        "ex-cod-fillets-1c41a693",
        "ex-white-fish-fillets-85fb0724",
        "ex-hot-fish-stock-80771bbf",
        "ex-raw-prawn-defrosted-if-frozen-e6a9ca22",
        "ex-smoked-haddock-fillets-baf81a39",
        "ex-peppered-smoked-mackerel-torn-into-pieces-ce0093bc",
        "ex-salmon-fillet-294c43c8",
        "ex-cooked-king-prawns-39693914",
        "ex-prawns-thawed-if-frozen-1bb14e3b",
        "ex-cooked-king-prawns-defrosted-if-frozen-d66400b9",
        "ex-slices-smoked-salmon-92d15411",
        "ex-aldi-specially-selected-lightly-smoked-scotti-f2086003",
        "ex-skinless-poached-salmon-fillets-flaked-a769e9f5",
        "ex-fresh-mussels-191dfb2c",
        "ex-hot-fish-stock-heated-to-a-simmer-4c6896e1",
        "ex-raw-shelled-king-prawns-c7dfdebc",
        "ex-fish-stock-made-a7a3796b",
        "ex-fish-pie-mix-0b47458e",
        "ex-cooked-mixed-shellfish-2ed81f6c",
        "ex-cooked-prawns-salmon-cd4c34d0",
        "ex-un-dyed-smoked-haddock-fillet-a76cff1f",
        "ex-sardines-in-chilli-olive-oil-541aa455",
        "ex-raw-large-shrimp-c5471e1c",
        "ex-wild-salmon-fillets-7b7406f6",
        "ex-sea-scallops-36ef9847",
        "ex-raw-shrimp-a2bb72e4",
        "ex-jumbo-shrimp-936733cf",
        "ex-fresh-skinless-pollock-fillets-285cf6e4",
        "ex-skinless-hake-fillets-73b8dbfe",
        "ex-skinless-pollock-fillets-551c7e04",
      ],
    },
    {
      anchors: ["prawns"],
      members: [
        "prawns",
        "raw-prawns",
        "ex-frozen-small-atlantic-cooked-prawns-defrosted-837cfb9a",
        "ex-prawns-571121fc",
        "ex-raw-prawns-2867dc61",
        "ex-peeled-prawns-aecfd7cd",
        "ex-raw-king-prawns-shelled-and-a0767334",
        "ex-raw-tiger-prawns-in-their-shells-3eb47d4f",
        "ex-prawns-heads-and-shells-on-0d1747bf",
        "ex-shrimp-paste-0c1864f3",
        "ex-prawn-72c00655",
        "ex-prawns-shells-and-heads-on-4f22cd21",
        "ex-whole-raw-king-prawns-e27acc41",
        "ex-cooked-prawns-b45ce0ad",
        "ex-raw-prawn-defrosted-if-frozen-e6a9ca22",
        "ex-cooked-king-prawns-39693914",
        "ex-prawns-thawed-if-frozen-1bb14e3b",
        "ex-cooked-king-prawns-defrosted-if-frozen-d66400b9",
        "ex-raw-shelled-king-prawns-c7dfdebc",
        "ex-cooked-prawns-salmon-cd4c34d0",
        "ex-raw-large-shrimp-c5471e1c",
        "ex-raw-shrimp-a2bb72e4",
        "ex-jumbo-shrimp-936733cf",
      ],
    },
    {
      anchors: ["salmon"],
      members: [
        "salmon",
        "ex-smoked-salmon-3bdb2bdf",
        "ex-cooked-salmon-fillets-a6eed50b",
        "ex-side-of-salmon-skinned-and-pin-boned-35774d83",
        "ex-skinless-salmon-fillets-abcc72d4",
        "ex-salmon-fillet-294c43c8",
        "ex-slices-smoked-salmon-92d15411",
        "ex-aldi-specially-selected-lightly-smoked-scotti-f2086003",
        "ex-skinless-poached-salmon-fillets-flaked-a769e9f5",
        "ex-cooked-prawns-salmon-cd4c34d0",
        "ex-wild-salmon-fillets-7b7406f6",
      ],
    },
  ];
  const patches = {
    "sp-skinnytaste-shrimp-tacos": { kind: "fish" },
    "sp-skinnytaste-shrimp-piccata-foil-packets": { kind: "fish" },
    "sp-skinnytaste-scallops-grapefruit-arugula-and-spinach": { kind: "fish" },
    "sp-sally-easy-coconut-shrimp": { kind: "fish" },
    "sp-kingarthur-strawberry-filled-angel-food-cake-recipe": { kind: "meat" },
    "sp-kingarthur-flaky-pastry-recipe": { kind: "meat" },
    "sp-gfmore-healthy-ragu": { kind: "meat" },
    "sp-gfmore-deli-pasta-salad": { kind: "meat" },
    "gf2-korean-style-fried-rice": { kind: "meat" },
    "gf2-air-fryer-crispy-chilli-beef": { kind: "meat" },
    "gf2-no-bake-pbj-cheesecake-squares": {
      method: "no-cook",
      methodNote:
        "No oven or hob required; boiling kettle water melts the butter and dissolves the jelly.",
    },
    "sp-sally-no-bake-pumpkin-cheesecake": {
      method: "no-cook",
      methodNote:
        "Cold assembly and chilling. Melted butter is needed for the base.",
    },
    "sp-sally-no-bake-cheesecake": {
      method: "no-cook",
      methodNote:
        "Cold assembly and chilling. Melted butter is needed for the base.",
    },
    "sp-sally-mini-no-bake-cheesecakes": {
      method: "no-cook",
      methodNote:
        "Cold filling with melted butter in the base. Baking the crust is optional.",
    },
    "sp-sally-chocolate-peanut-butter-no-bake-cookies": {
      method: "hob",
      methodNote:
        "No oven needed. The mixture is boiled on the hob, then chilled.",
    },
    "sp-lovelemons-no-bake-protein-balls": {
      method: "no-cook",
      methodNote: "Mix, shape and chill; no heating required.",
      dishRole: "snack",
      meals: ["Breakfast", "Dessert"],
    },
    "sp-amyjacky-instant-pot-rice": {
      dishRole: "side",
      meals: ["Lunch", "Dinner"],
    },
    "sp-budgetbytes-carrot-feta-salad": {
      dishRole: "side",
    },
    "sp-budgetbytes-creamy-cucumber-salad": {
      dishRole: "side",
    },
    "sp-gfmore-classic-potato-salad": {
      dishRole: "side",
    },
    "sp-gfmore-fried-bread": {
      dishRole: "side",
    },
    "sp-gfmore-red-lentil-sweet-potato-pate": {
      dishRole: "side",
    },
    "sp-gfmore-tomato-cucumber-coriander-salad": {
      dishRole: "side",
    },
    "sp-lovelemons-celery-salad": {
      dishRole: "side",
    },
    "sp-lovelemons-corn-casserole": {
      dishRole: "side",
    },
    "sp-lovelemons-roasted-cauliflower": {
      dishRole: "side",
    },
    "sp-lovelemons-roasted-delicata-squash": {
      dishRole: "side",
    },
    "sp-lovelemons-roasted-sweet-potatoes": {
      dishRole: "side",
    },
    "sp-mealprepmanual-broccoli-cheddar-rice": {
      dishRole: "side",
    },
    "sp-recipetineats-marinated-bbq-vegetables": {
      dishRole: "side",
    },
    "sp-sally-apple-brie-phyllo-galette": {
      dishRole: "side",
    },
    "sp-sally-bacon-wrapped-cheesy-stuffed-jalapenos": {
      dishRole: "side",
    },
    "sp-sally-baked-sweet-potato-fries": {
      dishRole: "side",
    },
    "sp-sally-cornbread-muffins-recipe": {
      dishRole: "side",
      meals: ["Lunch", "Baking"],
    },
    "sp-sally-cranberry-brie-puff-pastry-tarts": {
      dishRole: "side",
      meals: ["Lunch", "Baking"],
    },
    "sp-sally-mushroom-puff-pastry-tarts": {
      dishRole: "side",
      meals: ["Lunch", "Baking"],
    },
    "sp-sally-my-favorite-cornbread": {
      dishRole: "side",
    },
    "sp-sally-my-favorite-pepperoni-pizza-dip": {
      kind: "meat",
      dishRole: "side",
    },
    "sp-skinnytaste-air-fryer-radishes": {
      dishRole: "side",
    },
    "sp-skinnytaste-grilled-green-bean-salad": {
      dishRole: "side",
    },
    "sp-skinnytaste-parmesan-asparagus-fries": {
      dishRole: "side",
    },
    "sp-skinnytaste-rainbow-potato-salad": {
      dishRole: "side",
    },
    "sp-skinnytaste-skinny-buffalo-chicken-potato-skins": {
      dishRole: "side",
    },
    "gf2-hot-spicy-sweet-potatoes": {
      dishRole: "side",
    },
    "gf2-greek-bouyiourdi": {
      dishRole: "side",
    },
    "sp-gfmore-slow-cooker-bread": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-courgette-cheddar-soda-bread": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-courgette-mushroom-bread": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-easy-white-bread": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-focaccia": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-irish-soda-bread": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-naan-bread": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-olive-oil-bread": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-pitta-bread": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-quick-puffy-flatbreads": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-simple-soda-bread": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-steamed-bao-buns": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "gf2-toasted-cumin-flatbreads": {
      dishRole: "side",
      meals: ["Baking"],
    },
    "sp-sally-apple-spice-cupcakes-with-salted-caramel-frosting": {
      dishRole: null,
      meals: ["Dessert", "Baking"],
    },
    "sp-sally-classic-chocolate-cupcakes-with-vanilla-frosting": {
      dishRole: null,
      meals: ["Dessert", "Baking"],
    },
    "sp-sally-dark-chocolate-cupcakes": {
      dishRole: null,
      meals: ["Dessert", "Baking"],
    },
    "sp-sally-peach-bundt-cake-with-brown-butter-icing": {
      dishRole: null,
      meals: ["Dessert", "Baking"],
    },
    "sp-sally-snickerdoodle-cupcakes-cinnamon-swirl-frosting": {
      dishRole: null,
      meals: ["Dessert", "Baking"],
    },
    "sp-sally-triple-chocolate-crunch-granola": {
      dishRole: null,
      meals: ["Breakfast"],
    },
    "sp-sally-vanilla-almond-granola": {
      dishRole: null,
      meals: ["Breakfast"],
    },
    "sp-recipetineats-asian-slaw": {
      dishRole: "side",
    },
    "gf2-spicy-kimchi-pancake-kimchi-jeon": {
      meals: ["Lunch", "Dinner"],
      baking: false,
      legacyMaxServings: 48,
      tags: ["savoury"],
      method: "hob",
    },
    "gf2-tteokbokki-spicy-rice-cakes": {
      meals: ["Lunch", "Dinner"],
      baking: false,
      legacyMaxServings: 48,
      tags: ["savoury"],
      method: "hob",
    },
    "sp-gfmore-microwave-chilli": {
      method: "microwave",
    },
    "sp-gfmore-microwave-macaroni-cheese": {
      method: "microwave",
    },
  };
  for (const r of root.PLATES_DATA.recipes) {
    const patch = patches[r.id];
    if (patch) {
      Object.assign(r, patch);
      if (r.dishRole === null) delete r.dishRole;
      if (patch.meals && !patch.meals.includes("Dessert"))
        r.tags = (r.tags || []).filter(
          (t) => !["dessert", "cake", "cookies"].includes(t),
        );
    }
  }
})(globalThis);
