/* Reviewed catalogue metadata; evidence in docs/catalogue/classification-review.json. */
(function (root) {
  "use strict";
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
