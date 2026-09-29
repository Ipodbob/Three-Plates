/* Reviewed catalogue metadata; evidence in docs/catalogue/classification-review.json. */
(function (root) {
  "use strict";
  const originalPlanningNotes = new Map(
    root.PLATES_DATA.recipes.map((r) => [r.id, r.planningNotes]),
  );
  const fishIngredientCorrections = [
    {
      recipeId: "sp-gfmore-lentil-tuna-salad",
      ingredient: {
        id: "tuna-water-160g-can",
        name: "Tuna in water (160g can, drain before use)",
        unit: "each",
        group: "Cupboard",
      },
      qty: 2,
      avoidIds: ["tuna"],
      source: "https://www.bbcgoodfood.com/recipes/lentil-tuna-salad",
      omittedText:
        "2 x 160g cans tuna steaks in spring water, drained and flaked",
    },
    {
      recipeId: "sp-skinnytaste-sardine-salad",
      ingredient: {
        id: "sardines-water-4-4oz-tin",
        name: "Sardines in water (4.4oz / 125g tin, drain before use)",
        unit: "each",
        group: "Cupboard",
      },
      qty: 1,
      avoidIds: [],
      source: "https://www.skinnytaste.com/sardine-salad/",
      omittedText:
        "1 4.4-ounce tin  no-salt-added sardines in water (drained (such as Wild Planet) )",
    },
    {
      recipeId: "sp-skinnytaste-tuna-and-white-bean-salad",
      ingredient: {
        id: "tuna-water-3oz-packet",
        name: "Tuna in water (3oz / 85g packet, drain before use)",
        unit: "each",
        group: "Cupboard",
      },
      qty: 2,
      avoidIds: ["tuna"],
      source: "https://www.skinnytaste.com/tuna-and-white-bean-salad/",
      omittedText: "2 3-ounce  packets tuna in water (drained)",
    },
  ];
  for (const correction of fishIngredientCorrections) {
    const r = root.PLATES_DATA.recipes.find(
      (r) => r.id === correction.recipeId,
    );
    if (!r) continue;
    const item = correction.ingredient;
    root.PLATES_DATA.ingredients[item.id] = item;
    if (!r.ingredients.some((i) => i.id === item.id))
      r.ingredients.push({
        id: item.id,
        qty: correction.qty,
        avoidIds: correction.avoidIds,
      });
    const prefix =
      "Not included in shopping (serving extras, optional items or equipment): ";
    r.planningNotes = r.planningNotes
      .replace(correction.omittedText + "; ", "")
      .replace(prefix + correction.omittedText, "");
    const note =
      "Catalogue correction: fish is included in shopping as the publisher's tin/packet count, not drained grams. Check the stated pack size; existing uncooked plans now include this requirement.";
    if (!r.planningNotes.includes(note))
      r.planningNotes = (r.planningNotes.trim() + " " + note).trim();
  }
  // Evidence: docs/catalogue/required-ingredient-corrections.json.
  const requiredIngredientCorrections = [
    {
      recipeId: "gf2-next-level-carrot-cake",
      source: "https://www.bbcgoodfood.com/recipes/next-level-carrot-cake",
      items: [
        {
          id: "ex-rye-flour-d9f0eba1",
          oldQty: 0,
          qty: 50,
          avoidIds: ["flour"],
        },
      ],
      replace: [
        [
          "; 50g rye or spelt flour (optional – use a total of 200g self-raising flour if you prefer)",
          "",
        ],
      ],
      note: "Includes 150g self-raising flour and 50g rye flour for the full cake. The publisher also offers 200g self-raising flour instead of that combination; this shopping list uses rye.",
    },
    {
      recipeId: "gf2-chicken-gyros",
      source: "https://www.bbcgoodfood.com/recipes/chicken-gyros",
      items: [
        {
          id: "lemon",
          oldQty: 0.5,
          qty: 1.5,
        },
      ],
      replace: [
        [
          "zest and juice 1 lemon plus 1 lemon cut into wedges to serve",
          "1 lemon cut into wedges to serve",
        ],
      ],
      note: "Includes one lemon for the marinade plus half a lemon for the tzatziki per four servings. The extra serving lemon is not included.",
    },
    {
      recipeId: "sp-gfmore-chicken-mango-noodle-salad",
      source: "https://www.bbcgoodfood.com/recipes/chicken-mango-noodle-salad",
      items: [
        {
          id: "lime",
          oldQty: 0,
          qty: 2,
        },
        {
          id: "honey",
          oldQty: 15,
          qty: 20,
        },
      ],
      replace: [
        [
          "2 limes juiced, plus wedges to serve (optional)",
          "extra lime wedges to serve (optional)",
        ],
        [
          "Additional dusting/greasing/serving amounts are not included: 1 tbsp honey plus 1 tsp",
          "",
        ],
      ],
      note: "Includes two limes for the dressing and the full tablespoon plus teaspoon of honey (20ml) per four servings. Extra serving wedges are optional.",
    },
    {
      recipeId: "sp-gfmore-spinach-falafel-hummus-bowl",
      source: "https://www.bbcgoodfood.com/recipes/spinach-falafel-hummus-bowl",
      items: [
        {
          id: "lemon",
          oldQty: 0,
          qty: 1,
        },
      ],
      replace: [
        [
          "1 lemon juiced, plus extra to serve (optional)",
          "extra lemon to serve (optional)",
        ],
      ],
      note: "Includes one lemon for the hummus per four servings; extra lemon for serving is optional.",
    },
    {
      recipeId: "sp-gfmore-pasta-e-fagioli",
      source: "https://www.bbcgoodfood.com/recipes/pasta-e-fagioli",
      items: [
        {
          id: "olive-oil",
          oldQty: 0,
          qty: 30,
        },
      ],
      replace: [
        [
          "2 tbsp extra virgin olive oil plus extra to serve (optional)",
          "extra olive oil to serve (optional)",
        ],
      ],
      note: "Includes two tablespoons of olive oil (30ml) for cooking the full recipe. Extra serving oil remains optional.",
    },
  ];
  // Counted herb evidence: docs/catalogue/herb-ingredient-corrections.json.
  const herbIngredients = [
    {
      id: "parsley-small-bunch",
      name: "Fresh parsley (small bunch)",
      unit: "each",
      group: "Fruit & veg",
    },
    {
      id: "basil-small-bunch",
      name: "Fresh basil (small bunch)",
      unit: "each",
      group: "Fruit & veg",
    },
    {
      id: "coriander-small-bunch",
      name: "Fresh coriander (small bunch)",
      unit: "each",
      group: "Fruit & veg",
    },
    {
      id: "spring-onion-bunch",
      name: "Spring onions (bunch)",
      unit: "each",
      group: "Fruit & veg",
    },
    {
      id: "sage-leaf",
      name: "Fresh sage leaves",
      unit: "each",
      group: "Fruit & veg",
    },
  ];
  for (const item of herbIngredients)
    root.PLATES_DATA.ingredients[item.id] = item;
  requiredIngredientCorrections.push(
    ...[
      {
        recipeId: "gf2-one-pan-seafood-roast-smoky-garlic-butter",
        source:
          "https://www.bbcgoodfood.com/recipes/one-pan-seafood-roast-smoky-garlic-butter",
        items: [
          {
            id: "parsley-small-bunch",
            oldQty: 0,
            qty: 1,
            avoidIds: ["parsley"],
          },
        ],
        replace: [
          [
            "small bunch parsley chopped, plus a little to serve",
            "extra parsley to serve",
          ],
        ],
        note: "One small bunch of parsley is included for the garlic butter; garnish is extra. Bunches remain separate from weighed herb stock; no gram conversion is assumed.",
      },
      {
        recipeId: "gf2-slow-cooker-pork-casserole",
        source:
          "https://www.bbcgoodfood.com/recipes/slow-cooker-pork-casserole",
        items: [
          {
            id: "bay",
            oldQty: 0,
            qty: 2,
          },
          {
            id: "sage-leaf",
            oldQty: 0,
            qty: 3,
            avoidIds: ["ex-sage-264fda70", "ex-sage-babdcfce"],
          },
          {
            id: "thyme",
            oldQty: 0,
            qty: 4,
          },
        ],
        replace: [
          [
            "bundle of woody herbs (bouquet garni) – we used 2 bay leaves, 3 sage leaves and 4 thyme sprigs, plus a few thyme leaves to serve",
            "extra thyme leaves to serve",
          ],
        ],
        note: "Includes the publisher's herb bundle: two bay leaves, three sage leaves and four thyme sprigs for four servings. Bunches remain separate from weighed herb stock; no gram conversion is assumed.",
      },
      {
        recipeId: "gf2-slow-cooker-ratatouille",
        source: "https://www.bbcgoodfood.com/recipes/slow-cooker-ratatouille",
        items: [
          {
            id: "basil-small-bunch",
            oldQty: 0,
            qty: 1,
            avoidIds: ["basil"],
          },
        ],
        replace: [
          [
            "small bunch of basil roughly chopped, plus a few extra leaves to serve",
            "extra basil leaves to serve",
          ],
        ],
        note: "Includes one small bunch of basil for the cooked sauce; garnish is extra. Bunches remain separate from weighed herb stock; no gram conversion is assumed.",
      },
      {
        recipeId: "gf2-thai-fried-rice-prawns-peas",
        source:
          "https://www.bbcgoodfood.com/recipes/thai-fried-rice-prawns-peas",
        items: [
          {
            id: "coriander-small-bunch",
            oldQty: 0,
            qty: 1,
            avoidIds: ["fresh-coriander"],
          },
        ],
        replace: [
          [
            "small bunch coriander roughly chopped, plus a few leaves to serve",
            "extra coriander leaves to serve",
          ],
        ],
        note: "Includes one small bunch of coriander stirred through the rice; garnish is extra. Bunches remain separate from weighed herb stock; no gram conversion is assumed.",
      },
      {
        recipeId: "sp-gfmore-courgette-potato-cheddar-soup",
        source:
          "https://www.bbcgoodfood.com/recipes/courgette-potato-cheddar-soup",
        items: [
          {
            id: "spring-onion-bunch",
            oldQty: 0,
            qty: 1,
            avoidIds: ["spring-onion", "ex-spring-onions-6a259c37"],
          },
        ],
        replace: [
          [
            "bunch spring onion sliced - save 1 for serving, if eating straight away; good grating fresh nutmeg plus extra to serve",
            "extra nutmeg to serve",
          ],
        ],
        note: "Includes one bunch of spring onions; reserve one onion from that bunch for serving if desired. Freshly grated nutmeg is also required in the soup, but the publisher gives no measured amount: check it before shopping; it is not quantified in automatic shopping or stock deductions. Bunches remain separate from weighed herb stock; no gram conversion is assumed.",
      },
      {
        recipeId: "sp-gfmore-no-cook-veggie-fajitas",
        source: "https://www.bbcgoodfood.com/recipes/no-cook-veggie-fajitas",
        items: [
          {
            id: "coriander-small-bunch",
            oldQty: 0,
            qty: 1,
            avoidIds: ["fresh-coriander"],
          },
        ],
        replace: [
          [
            "small bunch coriander chopped, plus extra, shredded, to serve",
            "extra coriander to serve",
          ],
        ],
        note: "Includes one small bunch of coriander split between the filling and avocado; garnish is extra. Bunches remain separate from weighed herb stock; no gram conversion is assumed.",
      },
    ],
  );
  // Evidence: docs/catalogue/baking-ingredient-corrections.json.
  requiredIngredientCorrections.push(...[
  {
    "recipeId": "sp-sally-apple-cinnamon-rolls",
    "source": "https://sallysbakingaddiction.com/apple-cinnamon-rolls/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 563
      }
    ],
    "replace": [
      [
        "4 and 1/2 cups (563g) all-purpose flour or bread flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 563g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-asiago-bread",
    "source": "https://sallysbakingaddiction.com/asiago-bread/",
    "items": [
      {
        "id": "ex-bread-flour-7cab183f",
        "oldQty": 0,
        "qty": 423,
        "avoidIds": [
          "flour"
        ]
      }
    ],
    "replace": [
      [
        "3 and 1/4 cups (423g) bread flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 423g bread flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-berry-galette",
    "source": "https://sallysbakingaddiction.com/berry-galette/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 156
      },
      {
        "id": "ex-cold-buttermilk-e5557548",
        "oldQty": 0,
        "qty": 60,
        "avoidIds": [
          "milk"
        ]
      }
    ],
    "replace": [
      [
        "1 and 1/4 cups (156g) all-purpose flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ],
      [
        "1/4 cup (60ml) cold buttermilk, plus more as needed",
        "extra buttermilk as needed (amount not specified)"
      ]
    ],
    "note": "Includes 156g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method. Includes 60ml cold buttermilk for the crust, separate from the milk in the egg wash."
  },
  {
    "recipeId": "sp-sally-blueberry-galette",
    "source": "https://sallysbakingaddiction.com/blueberry-galette/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 156
      },
      {
        "id": "ex-cold-buttermilk-e5557548",
        "oldQty": 0,
        "qty": 60,
        "avoidIds": [
          "milk"
        ]
      }
    ],
    "replace": [
      [
        "1 and 1/4 cups (156g) all-purpose flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ],
      [
        "1/4 cup (60ml) cold buttermilk, plus more as needed",
        "extra buttermilk as needed (amount not specified)"
      ]
    ],
    "note": "Includes 156g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method. Includes 60ml cold buttermilk for the crust, separate from the milk in the egg wash."
  },
  {
    "recipeId": "sp-sally-ciabatta-bread-recipe",
    "source": "https://sallysbakingaddiction.com/ciabatta-bread-recipe/",
    "items": [
      {
        "id": "ex-bread-flour-7cab183f",
        "oldQty": 130,
        "qty": 455,
        "avoidIds": [
          "flour"
        ]
      }
    ],
    "replace": [
      [
        "2 and 1/2 cups (325g) bread flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 455g bread flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-gingerbread-cinnamon-rolls",
    "source": "https://sallysbakingaddiction.com/gingerbread-cinnamon-rolls/",
    "items": [
      {
        "id": "ex-bread-flour-7cab183f",
        "oldQty": 0,
        "qty": 520,
        "avoidIds": [
          "flour"
        ]
      }
    ],
    "replace": [
      [
        "4 cups (520g) bread flour&nbsp;(spooned & leveled), plus more as needed for hands/work surface",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 520g bread flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-homemade-apple-fritters",
    "source": "https://sallysbakingaddiction.com/homemade-apple-fritters/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 594
      }
    ],
    "replace": [
      [
        "4 and 1/2 cups (563g) all-purpose flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ],
      [
        "1/4 cup (31g) all-purpose flour, plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 594g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-homemade-berry-fritters",
    "source": "https://sallysbakingaddiction.com/homemade-berry-fritters/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 500
      }
    ],
    "replace": [
      [
        "4 cups (500g) all-purpose flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 500g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-homemade-brioche",
    "source": "https://sallysbakingaddiction.com/homemade-brioche/",
    "items": [
      {
        "id": "ex-bread-flour-7cab183f",
        "oldQty": 0,
        "qty": 423,
        "avoidIds": [
          "flour"
        ]
      }
    ],
    "replace": [
      [
        "3 and 1/4 cups (423g) bread flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 423g bread flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-lemon-blueberry-babka",
    "source": "https://sallysbakingaddiction.com/lemon-blueberry-babka/",
    "items": [
      {
        "id": "ex-bread-flour-7cab183f",
        "oldQty": 24,
        "qty": 382,
        "avoidIds": [
          "flour"
        ]
      }
    ],
    "replace": [
      [
        "2 and 3/4 (358g) bread flour or all-purpose flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 382g bread flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-no-knead-cranberry-nut-bread",
    "source": "https://sallysbakingaddiction.com/no-knead-cranberry-nut-bread/",
    "items": [
      {
        "id": "ex-bread-flour-7cab183f",
        "oldQty": 0,
        "qty": 390,
        "avoidIds": [
          "flour"
        ]
      }
    ],
    "replace": [
      [
        "3 cups + 2 Tablespoons (390g) bread flour or all-purpose flour&nbsp;(spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 390g bread flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-overnight-cinnamon-rolls",
    "source": "https://sallysbakingaddiction.com/overnight-cinnamon-rolls/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 563
      }
    ],
    "replace": [
      [
        "4 and 1/2 cups (563g) all-purpose flour or bread flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 563g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-pumpkin-sugar-cookies",
    "source": "https://sallysbakingaddiction.com/pumpkin-sugar-cookies/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 281
      }
    ],
    "replace": [
      [
        "2 and 1/4 cups (281g) all-purpose flour&nbsp;(spooned & leveled), plus more as needed for rolling and work surface",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 281g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-rough-puff-pastry",
    "source": "https://sallysbakingaddiction.com/rough-puff-pastry/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 167
      }
    ],
    "replace": [
      [
        "1 and 1/3 cups (167g) all-purpose flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 167g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-sweet-potato-dinner-rolls",
    "source": "https://sallysbakingaddiction.com/sweet-potato-dinner-rolls/",
    "items": [
      {
        "id": "ex-bread-flour-7cab183f",
        "oldQty": 0,
        "qty": 715,
        "avoidIds": [
          "flour"
        ]
      }
    ],
    "replace": [
      [
        "5 and 1/2 cups (715g) bread flour* (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 715g bread flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-white-chocolate-snickerdoodle-blondies",
    "source": "https://sallysbakingaddiction.com/white-chocolate-snickerdoodle-blondies/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 291
      },
      {
        "id": "ex-white-chocolate-morsels-9c7d30dc",
        "oldQty": 180,
        "qty": 191
      }
    ],
    "replace": [
      [
        "2 and 1/3 cups (291g) all-purpose flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ],
      [
        "Additional dusting/greasing/serving amounts are not included: 180g white chocolate morsels, plus 1 tbsp for topping",
        "The measured white-chocolate topping is included as a planning estimate."
      ]
    ],
    "note": "Includes 291g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method. Includes 180g white chocolate in the dough plus an estimated 11g for its 1 tbsp topping (191g total). The estimate uses the publisher's 180g per cup divided by 16 tablespoons and rounded to whole grams. Morsel size and packing vary: use the publisher's tablespoon measure when cooking."
  },
  {
    "recipeId": "sp-sally-whole-wheat-bread",
    "source": "https://sallysbakingaddiction.com/whole-wheat-bread/",
    "items": [
      {
        "id": "ex-whole-wheat-flour-21c11971",
        "oldQty": 260,
        "qty": 433,
        "avoidIds": [
          "flour"
        ]
      }
    ],
    "replace": [
      [
        "1 and 1/3 cups (173g) whole wheat flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ]
    ],
    "note": "Includes 433g whole wheat flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-zucchini-biscuits",
    "source": "https://sallysbakingaddiction.com/zucchini-biscuits/",
    "items": [
      {
        "id": "flour",
        "oldQty": 0,
        "qty": 313
      },
      {
        "id": "buttermilk",
        "oldQty": 240,
        "qty": 270,
        "avoidIds": [
          "milk"
        ]
      }
    ],
    "replace": [
      [
        "2 and 1/2 cups (313g) all-purpose flour (spooned & leveled), plus more as needed",
        "extra flour as needed (amount not specified)"
      ],
      [
        "Additional dusting/greasing/serving amounts are not included: 240ml buttermilk, cold, plus 2 tbsp for brushing on top",
        "The measured buttermilk for brushing is included."
      ]
    ],
    "note": "Includes 313g plain flour for the full recipe, including any measured flour used in separate components. Unspecified extra flour for handling or dough adjustment is not quantified; follow the publisher method. Buttermilk totals 270ml: 240ml in the dough and two 15ml tablespoons for brushing."
  },
  {
    "recipeId": "gf2-brioche",
    "source": "https://www.bbcgoodfood.com/recipes/brioche",
    "items": [
      {
        "id": "eggs",
        "oldQty": 4,
        "qty": 5
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 4 eggs at room temperature, beaten, plus 1 for egg wash",
        "Measured finishing amounts are included."
      ]
    ],
    "note": "Includes four eggs for the dough and one for the egg wash: five eggs for the full loaf."
  },
  {
    "recipeId": "gf2-best-ever-macaroni-cheese-recipe",
    "source": "https://www.bbcgoodfood.com/recipes/best-ever-macaroni-cheese-recipe",
    "items": [
      {
        "id": "butter",
        "oldQty": 28.2,
        "qty": 42.3
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 2 tbsp butter plus 1 tbsp melted",
        "Measured finishing amounts are included."
      ],
      [
        "Planning conversion: 2 tbsp butter plus 1 tbsp melted → 28.2g Butter",
        "Planning conversion: 3 tbsp butter in total → approximately 42.3g Butter"
      ]
    ],
    "note": "Includes three tablespoons of butter: two for the sauce and one melted for the bread topping. Uses the existing approximate planning conversion of 14.1g per tablespoon (42.3g total)."
  },
  {
    "recipeId": "gf2-classic-cheese-scones",
    "source": "https://www.bbcgoodfood.com/recipes/classic-cheese-scones",
    "items": [
      {
        "id": "milk",
        "oldQty": 100,
        "qty": 115
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 90-100ml milk plus 1 tbsp for glazing",
        "Measured finishing amounts are included."
      ]
    ],
    "note": "Includes up to 100ml milk for the dough plus 15ml for glazing (115ml total). Add dough milk gradually as the publisher instructs."
  }
]);
  requiredIngredientCorrections.push(...[
  {
    "recipeId": "gf2-egg-bacon-pie",
    "source": "https://www.bbcgoodfood.com/recipes/egg-bacon-pie",
    "items": [
      {
        "id": "eggs",
        "oldQty": 4,
        "qty": 5
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 4 eggs beaten, plus 1 egg beaten separately for glazing",
        "Measured egg wash is included."
      ]
    ],
    "note": "Includes four eggs in the filling and one separate egg for glazing (five eggs for the full pie)."
  },
  {
    "recipeId": "sp-sally-ham-cheese-scones",
    "source": "https://sallysbakingaddiction.com/ham-cheese-scones/",
    "items": [
      {
        "id": "ex-cold-buttermilk-e5557548",
        "oldQty": 160,
        "qty": 175
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 160ml cold buttermilk, plus 1 tbsp for brushing",
        "Measured brushing buttermilk is included."
      ]
    ],
    "note": "Includes 160ml buttermilk in the dough plus 15ml for brushing (175ml total). Any further dough adjustment remains separate; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-make-crepes",
    "source": "https://sallysbakingaddiction.com/make-crepes/",
    "items": [
      {
        "id": "butter",
        "oldQty": 43,
        "qty": 99
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 43g unsalted butter, plus 3-4 more tbsp for the pan",
        "Measured pan butter is included."
      ]
    ],
    "note": "Includes 43g butter in the batter plus up to 56g for the pan (99g total), using the upper end of the publisher's 43–56g pan allowance. This is a planning allowance; actual pan use can vary."
  }
]);
  requiredIngredientCorrections.push(...[
  {
    "recipeId": "gf2-cherry-pie",
    "source": "https://www.bbcgoodfood.com/recipes/cherry-pie",
    "items": [
      {
        "id": "ground-almonds",
        "oldQty": 50,
        "qty": 61
      },
      {
        "id": "salt",
        "oldQty": 0,
        "qty": 0.25
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 50g ground almonds plus 2 tbsp",
        "Measured almonds beneath the filling are included as a planning estimate."
      ]
    ],
    "note": "Includes 50g ground almonds in the pastry plus 2 tbsp beneath the filling, estimated as 11g (61g total). The estimate uses King Arthur Baking's almond-meal reference of 84g per cup, divided by 16 tablespoons and rounded to whole grams. Grind and packing vary: use the publisher's 2 tbsp when cooking. Also includes the 1/4 tsp salt specified in the pastry method. Unspecified dusting and sprinkling extras remain separate."
  },
  {
    "recipeId": "gf2-citrus-almond-yogurt-cake",
    "source": "https://www.bbcgoodfood.com/recipes/citrus-almond-yogurt-cake",
    "items": [
      {
        "id": "sugar",
        "oldQty": 200,
        "qty": 224
      },
      {
        "id": "yoghurt",
        "oldQty": 75,
        "qty": 103
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 200g golden caster sugar plus 2 tbsp",
        "Measured syrup sugar is included as a planning estimate."
      ],
      [
        "Additional dusting/greasing/serving amounts are not included: 75g natural yogurt plus 2 tbsp",
        "Measured icing yogurt is included as a planning estimate."
      ]
    ],
    "note": "Includes 200g caster sugar in the cake plus 2 tbsp in the syrup, estimated as 24g (224g total), and 75g yogurt in the cake plus 2 tbsp in the icing, estimated as 28g (103g total). Estimates use King Arthur Baking's caster-sugar and yogurt references of 190g and 227g per cup, divided by 16 tablespoons and rounded to whole grams. Product density varies: use the publisher's spoon measures when cooking."
  }
]);
  requiredIngredientCorrections.push({
  "recipeId": "gf2-baileys-cheesecake",
  "source": "https://www.bbcgoodfood.com/recipes/baileys-cheesecake",
  "items": [
    {
      "id": "ex-powdered-gelatine-a81e7eb5",
      "oldQty": 1,
      "qty": 2
    }
  ],
  "replace": [
    [
      "Additional dusting/greasing/serving amounts are not included: 11g pack powdered gelatine plus 1 tsp",
      "The additional measured gelatine is included."
    ]
  ],
  "note": "Includes 11g gelatine plus 1 tsp for the cheesecake, and a further heaped tsp for the coffee jelly. Shopping keeps 11g and an approximate 2 tsp as separate measured amounts; the heaped spoon is counted nominally. Follow the publisher spoon measures when cooking. Gram and teaspoon pantry stock are not automatically interchangeable."
});
  requiredIngredientCorrections.push(...[
  {
    "recipeId": "gf2-hot-spicy-sweet-potatoes",
    "source": "https://www.bbcgoodfood.com/recipes/hot-spicy-sweet-potatoes",
    "items": [
      {
        "id": "sweet-potato",
        "oldQty": 400,
        "qty": 1000
      },
      {
        "id": "thyme",
        "oldQty": 0,
        "qty": 2
      }
    ],
    "replace": [
      [
        "Planning conversion: 2 large  sweet potatoes (about 500g/1lb 4oz each) → 400g Sweet potatoes",
        "Publisher weight allowance: two sweet potatoes at about 500g each, about 1kg total."
      ],
      [
        "Additional dusting/greasing/serving amounts are not included: 2 tbsp fresh  thyme leaves, plus 2 sprigs of fresh thyme",
        "Both the measured thyme leaves and two additional sprigs are included."
      ]
    ],
    "note": "Uses the publisher allowance of two sweet potatoes at about 500g each (1000g total), replacing the generic size estimate. Includes 2 tbsp thyme leaves plus two sprigs placed in the parcels; sprigs stay separate from spoon-measured leaves."
  },
  {
    "recipeId": "sp-sally-double-chocolate-banana-bread",
    "source": "https://sallysbakingaddiction.com/double-chocolate-banana-bread/",
    "items": [
      {
        "id": "ex-semi-sweet-chocolate-chips-43880849",
        "oldQty": 135,
        "qty": 157
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 135g semi-sweet chocolate chips, plus 2 tbsp for topping",
        "The measured chocolate topping is included."
      ]
    ],
    "note": "Includes 135g chocolate chips in the batter and the publisher's measured 22g topping, 157g total. No spoon-to-weight estimate is needed. Follow the publisher method for the hot water, which is not a shopping item."
  }
]);
  requiredIngredientCorrections.push(...[
  {
    "recipeId": "gf2-new-york-cheesecake",
    "source": "https://www.bbcgoodfood.com/recipes/new-york-cheesecake",
    "items": [
      {
        "id": "eggs",
        "oldQty": 3,
        "qty": 4
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 3 large eggs plus 1 yolk",
        "Extra yolks are included in the whole-egg shopping allowance."
      ]
    ],
    "note": "Whole-egg shopping allowance: the full recipe uses 3 whole eggs plus 1 extra yolk. Separate 1 egg and reserve the spare white. Adjust this split if changing portions; follow the publisher method. Cooking deducts the opened whole eggs; spare whites are not automatically recorded as pantry stock.",
    "ingredientGuidance": "Whole-egg shopping allowance: the full recipe uses 3 whole eggs plus 1 extra yolk. Separate 1 egg and reserve the spare white. Adjust this split if changing portions; follow the publisher method."
  },
  {
    "recipeId": "gf2-next-level-chocolate-chip-cookies",
    "source": "https://www.bbcgoodfood.com/recipes/next-level-chocolate-chip-cookies",
    "items": [
      {
        "id": "eggs",
        "oldQty": 1,
        "qty": 3
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 1 large egg plus 2 large yolks",
        "Extra yolks are included in the whole-egg shopping allowance."
      ]
    ],
    "note": "Whole-egg shopping allowance: the full recipe uses 1 whole egg plus 2 extra yolks. Separate 2 eggs and reserve the spare whites. Adjust this split if changing portions; follow the publisher method. Cooking deducts the opened whole eggs; spare whites are not automatically recorded as pantry stock.",
    "ingredientGuidance": "Whole-egg shopping allowance: the full recipe uses 1 whole egg plus 2 extra yolks. Separate 2 eggs and reserve the spare whites. Adjust this split if changing portions; follow the publisher method."
  },
  {
    "recipeId": "gf2-smoked-trout-tartlets",
    "source": "https://www.bbcgoodfood.com/recipes/smoked-trout-tartlets",
    "items": [
      {
        "id": "eggs",
        "oldQty": 2,
        "qty": 3
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 2 eggs plus 1 egg yolk",
        "Extra yolks are included in the whole-egg shopping allowance."
      ]
    ],
    "note": "Whole-egg shopping allowance: the full recipe uses 2 whole eggs plus 1 extra yolk. Separate 1 egg and reserve the spare white. Adjust this split if changing portions; follow the publisher method. Cooking deducts the opened whole eggs; spare whites are not automatically recorded as pantry stock.",
    "ingredientGuidance": "Whole-egg shopping allowance: the full recipe uses 2 whole eggs plus 1 extra yolk. Separate 1 egg and reserve the spare white. Adjust this split if changing portions; follow the publisher method."
  },
  {
    "recipeId": "sp-sally-soft-chewy-chocolate-chip-cookie-bars",
    "source": "https://sallysbakingaddiction.com/soft-chewy-chocolate-chip-cookie-bars/",
    "items": [
      {
        "id": "eggs",
        "oldQty": 1,
        "qty": 2
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 1 large egg plus 1 large egg yolk",
        "Extra yolks are included in the whole-egg shopping allowance."
      ]
    ],
    "note": "Whole-egg shopping allowance: the full recipe uses 1 whole egg plus 1 extra yolk. Separate 1 egg and reserve the spare white. Adjust this split if changing portions; follow the publisher method. Cooking deducts the opened whole eggs; spare whites are not automatically recorded as pantry stock.",
    "ingredientGuidance": "Whole-egg shopping allowance: the full recipe uses 1 whole egg plus 1 extra yolk. Separate 1 egg and reserve the spare white. Adjust this split if changing portions; follow the publisher method."
  }
]);
  // Publisher-verified mixed quantities; incompatible units remain separate.
  for (const ingredient of [
  {
    "id": "caramel-sauce-ml",
    "name": "Caramel sauce (drizzle)",
    "unit": "ml",
    "group": "Cupboard"
  },
  {
    "id": "jalapeno-brine",
    "name": "Jalapeño brine (from the jar)",
    "unit": "ml",
    "group": "Cupboard"
  }
]) root.PLATES_DATA.ingredients[ingredient.id] = ingredient;
  requiredIngredientCorrections.push(...[
  {
    "recipeId": "gf2-easy-caramel-cake",
    "source": "https://www.bbcgoodfood.com/recipes/easy-caramel-cake",
    "items": [
      {
        "id": "caramel-sauce-ml",
        "oldQty": 0,
        "qty": 45
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 70g caramel sauce dulce de leche or caramel spread, plus 3 tbsp to serve",
        ""
      ]
    ],
    "note": "The icing uses 70g sauce and the final drizzle uses a further 3 tbsp (45ml). Keep mass and volume separate: sauce density is not assumed. Extra tin-greasing butter remains unquantified.",
    "ingredientGuidance": "For the full cake: 70g caramel sauce for icing, plus 3 tbsp for the drizzle. Both can come from the same jar; the separate quantities do not mean two products. Scale both when changing portions."
  },
  {
    "recipeId": "gf2-lebanese-poussin-spiced-aubergine-pilaf",
    "source": "https://www.bbcgoodfood.com/recipes/lebanese-poussin-spiced-aubergine-pilaf",
    "items": [
      {
        "id": "olive-oil",
        "oldQty": 15,
        "qty": 30
      },
      {
        "id": "ex-allspice-0aad6291",
        "oldQty": 0.25,
        "qty": 0.5
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 1 tbsp olive oil plus a bit extra",
        ""
      ],
      [
        "Additional dusting/greasing/serving amounts are not included: ¼ tsp allspice plus 2 good pinches",
        ""
      ]
    ],
    "note": "The method uses 1 tbsp oil for aubergine and another for pilaf, so includes 30ml despite the ingredient list stating 1 tbsp. Additional skin oil remains unquantified. Allspice includes the 1/4 tsp plus two pinches, estimated at 1/8 tsp per pinch; pinches vary.",
    "ingredientGuidance": "For two servings: 1 tbsp oil for aubergine, 1 tbsp for pilaf, plus a little for the birds. Use 1/4 tsp allspice in the pilaf and two pinches on the birds; the 1/2 tsp shopping total is approximate. Scale for your portions."
  },
  {
    "recipeId": "gf2-lemon-sponge",
    "source": "https://www.bbcgoodfood.com/recipes/lemon-sponge",
    "items": [
      {
        "id": "salt",
        "oldQty": 0,
        "qty": 0.5
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 3 large unwaxed lemons zested, plus 4-4 ½ tbsp juice",
        ""
      ],
      [
        "Not included in shopping (serving extras, optional items or equipment): lemon zest or candied peel, to serve (optional)",
        "Optional candied-peel ingredients are included in this shopping version."
      ]
    ],
    "note": "The three unwaxed lemons provide zest and the 4–4.5 tbsp icing juice; juice yield varies. Includes the method’s 1/2 tsp salt. The existing extra two lemons and 200g sugar for optional candied peel remain included.",
    "ingredientGuidance": "For the full cake: zest three unwaxed lemons, then measure 4–4½ tbsp of their juice for the icing. The list also includes two lemons and 200g of the sugar for optional candied peel. Scale for your portions."
  },
  {
    "recipeId": "gf2-peach-raspberry-almond-crumble-cake",
    "source": "https://www.bbcgoodfood.com/recipes/peach-raspberry-almond-crumble-cake",
    "items": [
      {
        "id": "sugar",
        "oldQty": 200,
        "qty": 212
      },
      {
        "id": "salt",
        "oldQty": 0,
        "qty": 0.125
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 200g golden caster sugar plus 1 tbsp",
        ""
      ]
    ],
    "note": "Includes the listed additional tablespoon of caster sugar, estimated as 12g from King Arthur’s 190g/cup superfine sugar reference (190/16, rounded). Total 212g; the publisher method does not allocate that extra spoon to a separate step. The method’s salt pinch is estimated at 1/8 tsp.",
    "ingredientGuidance": "Full cake: the source lists 200g caster sugar plus 1 tbsp. Shopping estimates that extra spoon as 12g; measure the spoon when cooking. A pinch of salt is also included approximately. Scale for your portions."
  },
  {
    "recipeId": "gf2-roast-cod-paella-saffron-olive-oil",
    "source": "https://www.bbcgoodfood.com/recipes/roast-cod-paella-saffron-olive-oil",
    "items": [
      {
        "id": "ex-mussels-34ebd4b6",
        "oldQty": 0,
        "qty": 18
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: handful cooked, shelled mussels plus 18 in their shells",
        ""
      ],
      [
        "Estimated 25g for: handful cooked, shelled mussels plus 18 in their shells",
        "Estimated 25g for the shelled handful only; the 18 shell-on mussels are counted separately."
      ]
    ],
    "note": "Includes 18 shell-on mussels in addition to the shelled handful. The existing 25g handful remains an estimate and is not a conversion of the 18 counted mussels.",
    "ingredientGuidance": "For six servings: a handful of cooked shelled mussels, plus 18 mussels in their shells. The handful is estimated as 25g; shell-on mussels are counted separately. Follow the publisher preparation method and scale for your portions."
  },
  {
    "recipeId": "sp-gfmore-microwave-garam-masala-vegetable-curry",
    "source": "https://www.bbcgoodfood.com/recipes/microwave-garam-masala-vegetable-curry",
    "items": [
      {
        "id": "ex-coriander-fabde51f",
        "oldQty": 3,
        "qty": 6
      },
      {
        "id": "tomato-tin",
        "oldQty": 400,
        "qty": 400,
        "oldId": "tomato",
        "avoidIds": [
          "tomato"
        ]
      },
      {
        "id": "salt",
        "oldQty": 0,
        "qty": 0.125
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 1 tbsp coriander plus 1 tbsp chopped coriander leaves to garnish",
        ""
      ]
    ],
    "note": "Includes both tablespoons of fresh coriander (6 tsp total). The source specifies 400g tinned chopped tomatoes, replacing the incorrect fresh-tomato requirement without converting existing pantry stock. The method’s salt pinch is estimated at 1/8 tsp.",
    "ingredientGuidance": "For two servings: use a 400g tin of chopped tomatoes and 2 tbsp chopped fresh coriander in total, reserving half for garnish. A pinch of salt is included approximately. Scale for your portions."
  },
  {
    "recipeId": "sp-gfmore-raspberry-ripple-blondies",
    "source": "https://www.bbcgoodfood.com/recipes/raspberry-ripple-blondies",
    "items": [
      {
        "id": "brown-sugar",
        "oldQty": 200,
        "qty": 204
      },
      {
        "id": "salt",
        "oldQty": 0,
        "qty": 0.125
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 200g light brown soft sugar plus 1 tsp",
        ""
      ]
    ],
    "note": "Includes 200g brown sugar for the batter plus 1 tsp for the raspberry mixture. The extra spoon is estimated as 4g from King Arthur’s 213g/cup packed brown sugar reference (213/48, rounded), giving 204g total. Packing varies. The method’s salt pinch is estimated at 1/8 tsp.",
    "ingredientGuidance": "Full batch: use 200g brown sugar in the batter and 1 tsp in the raspberry mixture. Shopping estimates that teaspoon as 4g; use the spoon when cooking. A pinch of salt is also included approximately. Scale for your portions."
  },
  {
    "recipeId": "sp-gfmore-spicy-tuna-wrap",
    "source": "https://www.bbcgoodfood.com/recipes/spicy-tuna-wrap",
    "items": [
      {
        "id": "jalapeno-brine",
        "oldQty": 0,
        "qty": 30,
        "avoidIds": [
          "ex-jalapenos-67689d2d"
        ]
      }
    ],
    "replace": [
      [
        "Additional dusting/greasing/serving amounts are not included: 30g jalapeños finely chopped, plus 2 tbsp of the brine",
        ""
      ]
    ],
    "note": "Includes 30ml (2 tbsp) jalapeño brine separately from the 30g peppers. Reserve the liquid from the same jar; no conversion from pepper weight to brine volume is assumed.",
    "ingredientGuidance": "For two wraps: reserve 2 tbsp brine from the jalapeño jar as well as 30g peppers. The brine line is liquid from that jar, not an extra jar or extra peppers. Scale for your portions."
  }
]);
  // Reviewed quantified omissions; sources and decisions are retained in docs/catalogue.
  for (const ingredient of [{"id":"prepared-mashed-potato","name":"Prepared mashed potato (not raw)","unit":"g","group":"Chilled"}]) root.PLATES_DATA.ingredients[ingredient.id] = ingredient;
  requiredIngredientCorrections.push(...[
  {
    "recipeId": "sp-amyjacky-instant-pot-beef-broccoli",
    "source": "https://www.pressurecookrecipes.com/instant-pot-beef-broccoli/",
    "items": [
      {
        "id": "cornflour",
        "oldQty": 0,
        "qty": 22.5
      }
    ],
    "replace": [
      [
        "2 - 3 tablespoons cold water + 2 ½ tablespoons (22.5g) cornstarch",
        "water for the thickener (not stocked)"
      ]
    ],
    "note": "Includes the publisher's 22.5g cornflour for the sauce thickener. Its water is not pantry stock; unspecified seasoning remains adjustable.",
    "ingredientGuidance": "Includes the publisher's 22.5g cornflour for the sauce thickener. Its water is not pantry stock; unspecified seasoning remains adjustable."
  },
  {
    "recipeId": "sp-sally-stamped-chocolate-espresso-cookies",
    "source": "https://sallysbakingaddiction.com/stamped-chocolate-espresso-cookies/",
    "items": [
      {
        "id": "ex-unsweetened-natural-cocoa-powder-34c6cb2e",
        "oldQty": 0,
        "qty": 62,
        "avoidIds": [
          "cocoa"
        ]
      }
    ],
    "replace": [
      [
        "3/4 cup (62g) unsweetened natural or Dutch-process cocoa powder, plus more as needed",
        "extra cocoa for stamping (amount not specified)"
      ]
    ],
    "note": "Includes 62g cocoa powder for the cookie dough. Extra cocoa for stamping remains unquantified.",
    "ingredientGuidance": "Includes 62g cocoa powder for the cookie dough. Extra cocoa for stamping remains unquantified."
  },
  {
    "recipeId": "sp-sally-chocolate-pastry-pop-tarts",
    "source": "https://sallysbakingaddiction.com/chocolate-pastry-pop-tarts/",
    "items": [
      {
        "id": "ex-unsweetened-natural-1668438f",
        "oldQty": 10,
        "qty": 31,
        "avoidIds": [
          "cocoa"
        ]
      }
    ],
    "replace": [
      [
        "1/4 cup (21g) unsweetened natural or dutch-process cocoa powder, plus more as needed for rolling",
        "extra cocoa for rolling (amount not specified)"
      ]
    ],
    "note": "Includes 21g cocoa in the pastry plus 10g in the icing (31g total). Extra cocoa for rolling remains unquantified.",
    "ingredientGuidance": "Includes 21g cocoa in the pastry plus 10g in the icing (31g total). Extra cocoa for rolling remains unquantified."
  },
  {
    "recipeId": "sp-sally-classic-chocolate-cupcakes-with-vanilla-frosting",
    "source": "https://sallysbakingaddiction.com/classic-chocolate-cupcakes-with-vanilla-frosting/",
    "items": [
      {
        "id": "icing-sugar",
        "oldQty": 0,
        "qty": 480
      }
    ],
    "replace": [
      [
        "4 cups (480g) confectioners' sugar, plus more as needed",
        "extra icing sugar for consistency (amount not specified)"
      ]
    ],
    "note": "Includes the 480g icing sugar required for the buttercream. Further sugar to adjust its consistency is optional and unquantified.",
    "ingredientGuidance": "Includes the 480g icing sugar required for the buttercream. Further sugar to adjust its consistency is optional and unquantified."
  },
  {
    "recipeId": "sp-sally-homemade-lemon-cupcakes-with-vanilla-frosting",
    "source": "https://sallysbakingaddiction.com/homemade-lemon-cupcakes-with-vanilla-frosting/",
    "items": [
      {
        "id": "icing-sugar",
        "oldQty": 0,
        "qty": 480
      }
    ],
    "replace": [
      [
        "4 cups (480g) confectioners' sugar, plus more as needed",
        "extra icing sugar for consistency (amount not specified)"
      ]
    ],
    "note": "Includes the 480g icing sugar required for the buttercream. Further sugar to adjust its consistency is optional and unquantified.",
    "ingredientGuidance": "Includes the 480g icing sugar required for the buttercream. Further sugar to adjust its consistency is optional and unquantified."
  },
  {
    "recipeId": "sp-gfmore-classic-potato-salad",
    "source": "https://www.bbcgoodfood.com/recipes/classic-potato-salad",
    "items": [
      {
        "id": "ex-mayonnaise-5bde4603",
        "oldQty": 0,
        "qty": 9
      }
    ],
    "replace": [
      [
        "3 tbsp mayonnaise or to taste",
        "extra mayonnaise to taste (amount not specified)"
      ]
    ],
    "note": "Includes the listed 3 tablespoons of mayonnaise (9 teaspoons). Adjust to taste; optional capers and cornichons remain optional.",
    "ingredientGuidance": "Includes the listed 3 tablespoons of mayonnaise (9 teaspoons). Adjust to taste; optional capers and cornichons remain optional."
  },
  {
    "recipeId": "sp-lovelemons-roasted-cauliflower",
    "source": "https://www.loveandlemons.com/roasted-cauliflower/",
    "items": [
      {
        "id": "olive-oil",
        "oldQty": 0,
        "qty": 30
      }
    ],
    "replace": [
      [
        "2 tablespoons extra-virgin olive oil (plus more as needed)",
        "extra olive oil as needed (amount not specified)"
      ]
    ],
    "note": "Includes 2 tablespoons of olive oil (30ml) for roasting. Extra oil for a larger cauliflower remains adjustable.",
    "ingredientGuidance": "Includes 2 tablespoons of olive oil (30ml) for roasting. Extra oil for a larger cauliflower remains adjustable."
  },
  {
    "recipeId": "sp-skinnytaste-deviled-egg-salad",
    "source": "https://www.skinnytaste.com/deviled-egg-salad/",
    "items": [
      {
        "id": "ex-dijon-mustard-cadd5781",
        "oldQty": 0,
        "qty": 1
      }
    ],
    "replace": [
      [
        "1 teaspoon Dijon mustard (or more to taste)",
        "extra Dijon mustard to taste (amount not specified)"
      ]
    ],
    "note": "Includes 1 teaspoon of Dijon mustard in the dressing. Further mustard and optional garnishes remain adjustable.",
    "ingredientGuidance": "Includes 1 teaspoon of Dijon mustard in the dressing. Further mustard and optional garnishes remain adjustable."
  },
  {
    "recipeId": "sp-kingarthur-sour-cream-chive-potato-bread-or-rolls-recipe",
    "source": "https://www.kingarthurbaking.com/recipes/sour-cream-chive-potato-bread-or-rolls-recipe",
    "items": [
      {
        "id": "prepared-mashed-potato",
        "oldQty": 0,
        "qty": 135,
        "avoidIds": [
          "potato"
        ]
      },
      {
        "id": "ex-green-spring-onions-93581d5c",
        "oldQty": 0,
        "qty": 24,
        "avoidIds": [
          "onion"
        ]
      }
    ],
    "replace": [
      [
        "heaping 1/2 cup (135g) prepared mashed potatoes, leftover is fine, so long as they're not highly salted",
        ""
      ],
      [
        "1/4 to 1/2 cup finely chopped scallion tops or fresh or dried chives, to taste",
        ""
      ]
    ],
    "note": "Includes 135g prepared mashed potato, kept separate from raw potato stock. Plans the upper end of the herb range: half a US cup of finely chopped spring onion tops (24 teaspoons); chives are an alternative. Optional dough flavouring remains optional.",
    "ingredientGuidance": "Includes 135g prepared mashed potato, kept separate from raw potato stock. Plans the upper end of the herb range: half a US cup of finely chopped spring onion tops (24 teaspoons); chives are an alternative. Optional dough flavouring remains optional."
  },
  {
    "recipeId": "sp-sally-healthy-berry-streusel-bars",
    "source": "https://sallysbakingaddiction.com/healthy-berry-streusel-bars/",
    "items": [
      {
        "id": "flaked-almonds",
        "oldQty": 0,
        "qty": 64
      },
      {
        "id": "ex-old-fashioned-whole-rolled-oats-39f8b507",
        "oldQty": 213,
        "qty": 218
      },
      {
        "id": "ex-almond-butter-b2e86a6d",
        "oldQty": 255,
        "qty": 255,
        "avoidIds": []
      }
    ],
    "replace": [
      [
        "for topping: 1/2 cup (64g) sliced or chopped almonds and 1 extra Tablespoon oats",
        ""
      ]
    ],
    "note": "Includes 64g sliced almonds and an extra tablespoon of oats for the topping. Plans 218g oats total: 213g plus an estimated 5g, rounded from the publisher's 213g per 2.5 cups. Almond butter is a plant ingredient; the listed coconut-oil option is used.",
    "ingredientGuidance": "Includes 64g sliced almonds and an extra tablespoon of oats for the topping. Plans 218g oats total: 213g plus an estimated 5g, rounded from the publisher's 213g per 2.5 cups. Almond butter is a plant ingredient; the listed coconut-oil option is used."
  },
  {
    "recipeId": "sp-skinnytaste-pumpkin-spice-pancakes-with-pumpkin",
    "source": "https://www.skinnytaste.com/pumpkin-spice-pancakes-with-pumpkin/",
    "items": [
      {
        "id": "ex-pumpkin-pie-spice-7e1a1fd5",
        "oldQty": 0,
        "qty": 1
      }
    ],
    "replace": [
      [
        "1 teaspoon pumpkin pie spice (or more to taste)",
        "extra pumpkin pie spice to taste (amount not specified)"
      ]
    ],
    "note": "Includes 1 teaspoon of pumpkin pie spice. The existing 15ml oil total includes 10ml in the batter plus a labelled 5ml planning allowance for spraying the pan.",
    "ingredientGuidance": "Includes 1 teaspoon of pumpkin pie spice. The existing 15ml oil total includes 10ml in the batter plus a labelled 5ml planning allowance for spraying the pan."
  },
  {
    "recipeId": "sp-skinnytaste-crock-pot-carne-guisada-latin-beef-stew",
    "source": "https://www.skinnytaste.com/crock-pot-carne-guisada-latin-beef-stew/",
    "items": [
      {
        "id": "salt",
        "oldQty": 0,
        "qty": 1
      }
    ],
    "replace": [
      [
        "1  kosher salt ( or more to taste)",
        "initial pinch and extra salt to taste (amount not specified)"
      ]
    ],
    "note": "Includes 1 teaspoon of salt from the method: three quarters for the beef and one quarter for the slow cooker. The initial pinch and further seasoning to taste remain unquantified.",
    "ingredientGuidance": "Includes 1 teaspoon of salt from the method: three quarters for the beef and one quarter for the slow cooker. The initial pinch and further seasoning to taste remain unquantified."
  },
  {
    "recipeId": "sp-budgetbytes-slow-cooker-chicken-noodle-soup",
    "source": "https://www.budgetbytes.com/slow-cooker-chicken-noodle-soup/",
    "items": [
      {
        "id": "salt",
        "oldQty": 0,
        "qty": 3
      }
    ],
    "replace": [
      [
        "1 Tbsp salt (or to taste) ($0.10)",
        "further salt to taste (amount not specified)"
      ]
    ],
    "note": "Includes the listed 1 tablespoon of salt (3 teaspoons) for planning. The publisher recommends adding it gradually to taste.",
    "ingredientGuidance": "Includes the listed 1 tablespoon of salt (3 teaspoons) for planning. The publisher recommends adding it gradually to taste."
  },
  {
    "recipeId": "sp-budgetbytes-slow-cooker-meatball-subs",
    "source": "https://www.budgetbytes.com/slow-cooker-meatball-subs/",
    "items": [
      {
        "id": "salt",
        "oldQty": 0.25,
        "qty": 1.25
      }
    ],
    "replace": [
      [
        "1 tsp  salt (to taste, $0.03)",
        "further salt to taste (amount not specified)"
      ]
    ],
    "note": "Includes 1 teaspoon of salt in the sauce plus a quarter teaspoon in the meatballs (1.25 teaspoons total). Optional sauce sugar remains optional.",
    "ingredientGuidance": "Includes 1 teaspoon of salt in the sauce plus a quarter teaspoon in the meatballs (1.25 teaspoons total). Optional sauce sugar remains optional."
  },
  {
    "recipeId": "sp-amyjacky-instant-pot-chicken-noodle-soup",
    "source": "https://www.pressurecookrecipes.com/instant-pot-chicken-noodle-soup/",
    "items": [
      {
        "id": "ex-unsalted-chicken-stock-e334b367",
        "oldQty": 1440,
        "qty": 1500
      },
      {
        "id": "carrot",
        "oldQty": 240,
        "qty": 220
      }
    ],
    "replace": [
      [
        "1 tablespoon (15ml) freshly squeezed lemon juice ((can add more to taste))",
        "optional lemon juice to finish"
      ],
      [
        "US cup estimated as 240ml: 6 cups (1.5L) unsalted chicken stock",
        "Publisher metric quantity: 1.5L unsalted chicken stock"
      ],
      [
        "Planning conversion: 3 (220g) carrots (, chopped) → 240g Carrots",
        "Publisher metric quantity: 220g carrots"
      ]
    ],
    "note": "Includes 1500ml unsalted chicken stock and 220g carrots, using the publisher’s explicit metric quantities. Lemon juice is an optional finishing addition and is not included in shopping.",
    "ingredientGuidance": "Includes 1500ml unsalted chicken stock and 220g carrots, using the publisher’s explicit metric quantities. Lemon juice is an optional finishing addition and is not included in shopping."
  }
]);
  for (const correction of requiredIngredientCorrections) {
    const r = root.PLATES_DATA.recipes.find(
      (r) => r.id === correction.recipeId,
    );
    if (!r) continue;
    for (const item of correction.items) {
      const existing = r.ingredients.find((i) => i.id === (item.oldId || item.id));
      if (existing) {
        existing.id = item.id;
        existing.qty = item.qty;
        if (item.avoidIds) existing.avoidIds = item.avoidIds;
      }
      else
        r.ingredients.push({
          id: item.id,
          qty: item.qty,
          ...(item.avoidIds ? { avoidIds: item.avoidIds } : {}),
        });
    }
    if (correction.ingredientGuidance) r.ingredientGuidance = correction.ingredientGuidance;
    for (const [oldText, newText] of correction.replace)
      r.planningNotes = r.planningNotes.replace(oldText, newText);
    const note =
      "Catalogue correction: " +
      correction.note +
      " Existing uncooked plans include these corrected amounts.";
    if (!r.planningNotes.includes(note))
      r.planningNotes = (r.planningNotes.trim() + " " + note).trim();
  }
  // Imported batch guidance embeds the planning notes; retain its separate
  // batch instructions while replacing the reviewed ingredient guidance.
  for (const r of root.PLATES_DATA.recipes) {
    const original = originalPlanningNotes.get(r.id);
    if (r.batch && original && original !== r.planningNotes)
      r.batch.note = r.batch.note.replace(original, r.planningNotes);
  }
  // Required seasoning confirmed in the publisher's courgette soup method.
  const soup = root.PLATES_DATA.recipes.find(
    (r) => r.id === "sp-gfmore-courgette-potato-cheddar-soup",
  );
  if (soup)
    soup.unmeasuredIngredients = [
      {
        id: "ex-fresh-nutmeg-8f09666c",
        avoidIds: ["nutmeg", "ex-whole-nutmeg-07230ac5"],
        note: "Freshly grate to season the soup. The publisher gives no measured amount; check what you have and follow the method.",
      },
    ];
  root.PLATES_DATA.unspecifiedFishIngredients = ["ex-dashi-a03a1e85"];
  // Reviewed preference aliases only; original recipe/stock records stay intact.
  root.PLATES_DATA.ingredientPreferenceAliases = {
    "ex-ground-black-peppercorn-8bda9b84": ["black-pepper"],
    "ex-black-pepper-426afb4b": ["black-pepper"],
    "ex-whole-black-peppercorn-5d2a2e00": ["black-pepper"],
    "ex-whole-black-peppercorns-d58baed3": ["black-pepper"],
    "ex-ground-black-pepper-ede01e79": ["black-pepper"],
    "ex-ground-black-pepper-848029a9": ["black-pepper"],
    "black-pepper": ["black-pepper"],
    "ex-cracked-black-pepper-de856107": ["black-pepper"],
    "ex-grinds-of-black-pepper-cd32773d": ["black-pepper"],
    "ex-fresh-ground-black-pepper-e0ae6248": ["black-pepper"],
    "ex-salt-and-black-pepper-bb887bdf": ["black-pepper"],
    "ex-green-peppercorn-b334a3cc": [],
    "ex-peppercorns-197d9e27": [],
    "ex-peppermint-extract-9f005f6b": [],
    "white-pepper": ["white-pepper"],
  };
  // Explicit plant identities: milk/butter words alone do not imply dairy.
  Object.assign(root.PLATES_DATA.ingredientPreferenceAliases, {
  "ex-peanut-butter-crunchy-is-best-c44b310a": [
    "peanut-butter"
  ],
  "coconut-milk": [],
  "ex-crunchy-peanut-butter-38430980": [
    "peanut-butter"
  ],
  "peanut-butter": [],
  "ex-unsweetened-almond-milk-43e7ab45": [],
  "ex-coconut-cream-9fb5e725": [],
  "ex-soy-milk-063db2a4": [],
  "ex-thick-coconut-cream-e63e7e94": [],
  "ex-fortified-soya-yogurt-fdfe987f": [],
  "ex-almond-butter-b887b1db": [],
  "ex-almond-milk-ea4b318d": [],
  "ex-vegan-butter-block-a3c31248": [],
  "ex-soya-milk-381c8e30": [],
  "ex-vegan-cheddar-ab35a1df": [],
  "ex-creamy-natural-peanut-butter-0807e03a": [
    "peanut-butter"
  ],
  "ex-full-fat-coconut-milk-e1884b0d": [
    "coconut-milk"
  ],
  "ex-nondairy-milk-56216a75": [],
  "ex-creamy-peanut-butter-bd60003d": [
    "peanut-butter"
  ],
  "ex-almond-butter-b2e86a6d": [],
  "ex-smooth-peanut-butter-978c3c18": [
    "peanut-butter"
  ],
  "ex-unsweetened-vanilla-almond-milk-51ae3389": [],
  "ex-pbfit-peanut-butter-powder-afaf56f7": [
    "peanut-butter"
  ]
});
  // Preference families never combine stock or convert ingredient quantities.
  root.PLATES_DATA.preferenceFamilies = [
    {
      anchors: ["chicken", "chicken-thigh"],
      members: [
        "chicken",
        "chicken-thigh",
        "chicken-breast-count",
        "chicken-thigh-count",
        "chicken-thigh-bone",
        "whole-chicken",
        "chicken-stock",
        "chicken-stock-cube",
        "ex-boneless-and-skinless-chicken-thighs-e12206cc",
        "ex-chicken-stock-pot-55e1d287",
        "ex-low-salt-chicken-stock-2e39c1d4",
        "ex-boneless-skinless-chicken-thighs-2c2e2be9",
        "ex-chicken-livers-a7f7c493",
        "ex-fresh-chicken-stock-6bd878bb",
        "ex-low-salt-chicken-stock-5ac0f721",
        "ex-boneless-chicken-thigh-750770b2",
        "ex-low-sodium-chicken-stock-52bbf67e",
        "ex-chicken-wings-5812fa3e",
        "ex-skinless-boneless-chicken-thighs-6fed608d",
        "ex-chicken-mini-fillets-b861916c",
        "ex-chicken-dbe196c4",
        "ex-cooked-skinless-chicken-breasts-1ee4e665",
        "ex-chicken-drumsticks-9ec39a45",
        "ex-unsalted-chicken-stock-e334b367",
        "ex-chicken-thighs-f9f4a37a",
        "ex-boneless-skinless-chicken-breasts-e5024b3d",
        "ex-chicken-drumsticks-01a4789a",
        "ex-boneless-chicken-breasts-574ed814",
        "ex-chicken-wings-drumettes-a79924c9",
        "ex-good-quality-whole-chicken-28886fd7",
        "ex-whole-chicken-f4f40712",
        "ex-chicken-breasts-1db2e96b",
        "ex-boneless-skinless-chicken-breasts-138587eb",
        "ex-split-chicken-breasts-515c83cc",
        "ex-boneless-skinless-chicken-breast-afe56ae2",
        "ex-skinless-chicken-thighs-26893a35",
        "ex-chicken-stock-cube-crumbled-2497d7f9",
        "ex-boneless-skinless-chicken-thighs-f62c145e",
        "ex-leftover-roast-chicken-shredded-81a82462",
        "ex-boneless-and-skinless-chicken-thighs-3ea0a139",
        "ex-skinless-and-boneless-chicken-breast-ce86b250",
        "ex-chicken-legs-a69e6b1e",
        "ex-skin-on-chicken-thighs-41d3f81e",
        "ex-skin-on-bone-in-chicken-thighs-efaca27a",
        "ex-chicken-thighs-skin-on-9cb9c331",
        "ex-rotisserie-chicken-3220f508",
        "ex-cooked-chicken-09eae3f6",
        "ex-boiling-hot-stock-chicken-be01b180",
        "ex-cooked-chicken-fillets-9a1490a2",
        "ex-bone-in-chicken-thighs-and-drumsticks-761f276c",
        "ex-skin-on-bone-in-chicken-thighs-60fcb9d4",
        "ex-cooked-skinless-chicken-breasts-shredded-f53c95c8",
        "ex-skinless-chicken-breast-fillet-0206fb6a",
        "ex-bone-in-chicken-thighs-skin-and-any-fat-remov-44907f8f",
        "ex-chicken-stock-made-with-low-salt-chicken-stoc-e30e69b0",
        "ex-s-chicken-stock-a0490dc2",
        "ex-chicken-thighs-skin-on-and-bone-in-7e99321e",
        "ex-cooked-chicken-breasts-54a0a48e",
        "ex-reduced-sodium-chicken-stock-c8c80832",
        "ex-ground-chicken-06bee616",
        "ex-chicken-tenders-02a6d542",
        "ex-chicken-wingettes-and-drumettes-74f6f517",
        "ex-low-sodium-chicken-stock-10373357",
        "ex-chicken-tenderloins-cb5756fe",
        "ex-boneless-and-skinless-chicken-breasts-f5148d99",
        "ex-boneless-skinless-chicken-breast-aeea65a5",
        "ex-low-sodium-chicken-stock-71b0b3ff",
        "ex-bone-in-chicken-drumsticks-c75afe54",
        "ex-chicken-thighs-871b706e",
      ],
      meat: true,
    },
    {
      anchors: ["beef", "beef-mince"],
      members: [
        "beef",
        "beef-mince",
        "beef-stock-cube",
        "beef-stock",
        "ex-thin-cut-minute-steak-afec6c06",
        "ex-concentrated-liquid-beef-stock-c5d3cd0b",
        "ex-sirloin-steaks-5a9d9137",
        "ex-lean-beef-mince-3f381f50",
        "ex-rump-steak-aaac0a8d",
        "ex-rich-beef-stock-06f07332",
        "ex-beef-meatballs-049841c5",
        "ex-beef-strips-bf9cd0d4",
        "ex-chuck-steak-50029c55",
        "ex-beef-brisket-8c3a00a6",
        "ex-corned-beef-6aade533",
        "ex-beef-finger-meat-c5ff4d34",
        "ex-lean-ground-beef-ba56b4c0",
        "ex-well-marbled-chuck-steak-839d286d",
        "ex-ground-beef-0ce713cf",
        "ex-beef-chuck-roast-c5775b8a",
        "ex-beef-broth-9ef6e4d1",
        "ex-beef-stew-meat-1705b4a6",
        "ex-steak-mince-aa57196d",
        "ex-minced-beef-b9f56145",
        "ex-warm-beef-stock-86d27c1a",
        "ex-beef-stewing-628fd0a4",
        "ex-slices-corned-beef-93fb15a4",
        "ex-beef-roasting-joint-0c86db29",
        "ex-lean-minced-beef-5857c6b0",
        "ex-top-round-steak-07150f9a",
        "ex-chuck-beef-a55d94f9",
        "ex-beef-cheeks-d785cd5a",
        "ex-beef-broth-stock-e4d0f462",
        "ex-chuck-beef-stew-meat-8b077828",
        "ex-boneless-beef-chuck-roast-1ba6a19e",
        "ex-beef-bone-broth-ff789720",
        "ex-low-sodium-beef-broth-c1354ad4",
        "ex-ground-sirloin-beef-62302618",
        "ex-flank-steak-354eede3",
        "ex-beef-top-sirloin-2be3265c",
        "ex-steaks-747c7530",
        "ex-steaks-c3f04e0f",
      ],
      meat: true,
    },
    {
      anchors: ["pork", "sausages"],
      members: [
        "pork",
        "sausages",
        "bacon",
        "bacon-lardons",
        "ex-thick-slice-of-ham-3a4d8c7c",
        "ex-boneless-pork-leg-533e4d76",
        "ex-thick-pork-belly-pork-slices-f9510d94",
        "ex-chunky-bacon-lardons-35fef56a",
        "ex-rashers-back-bacon-22dd9fc3",
        "ex-pancetta-cubes-35dc3db7",
        "ex-smoked-bacon-rashers-0fc51942",
        "ex-cooked-ham-carved-into-thick-slices-10c5a6d4",
        "ex-slices-prosciutto-fat-removed-7ab0ce71",
        "ex-pork-shoulder-steaks-5400764f",
        "ex-pork-tenderloin-65b5a225",
        "ex-rashers-smoked-back-bacon-f9f2bbba",
        "ex-strips-bacon-88f3abb3",
        "ex-bacon-3e59b487",
        "ex-bone-in-well-marbled-pork-loin-center-chops-2f990278",
        "ex-boneless-pork-butt-287e7167",
        "ex-pork-butt-6b22d5ad",
        "ex-cubetti-di-pancetta-4826499e",
        "ex-cooked-crispy-bacon-rashers-broken-into-piece-3ff561a7",
        "ex-streaky-bacon-ae83765c",
        "ex-prosciutto-ee36bbcf",
        "ex-rashers-streaky-bacon-34439294",
        "ex-bacon-lardon-8dcbdde5",
        "ex-slices-smoked-ham-ea0fb3da",
        "ex-pork-shoulder-skinless-and-boneless-af486e20",
        "ex-smoked-ham-torn-25cd9afb",
        "ex-thin-cut-pork-loin-steaks-21891701",
        "ex-lard-3019229e",
        "ex-cooked-bacon-cbb4778e",
        "ex-slices-bacon-429f9d43",
        "ex-ham-cc3ff06f",
        "ex-center-cut-boneless-pork-chops-47c31867",
        "ex-pork-loin-cutlets-9ade1158",
        "ex-slices-center-cut-bacon-e85809ba",
        "chorizo",
        "kielbasa",
        "ex-chorizo-ring-85c95a26",
        "ex-cooking-chorizo-skin-removed-and-99182caa",
        "ex-cooking-chorizo-66599d7f",
        "ex-ring-chorizo-18dcf07b",
        "ex-raw-chorizo-715bceaa",
        "ex-italian-sausage-892a77ed",
        "ex-country-sausage-65efbbea",
        "ex-chorizo-sausage-3d8e0058",
      ],
      meat: true,
    },
    {
      anchors: ["salmon", "tuna", "prawns"],
      fish: true,
      members: [
        "tuna-water-160g-can",
        "sardines-water-4-4oz-tin",
        "tuna-water-3oz-packet",
        "ex-eomuk-a86f582c",
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
  root.PLATES_DATA.unspecifiedMeatIngredients = [
    "ex-good-quality-sausages-277dbc67",
    "ex-sausages-of-your-choice-ef7dba6f",
    "ex-sausagemeat-6605e123",
    "ex-ground-sausage-a22abf31",
    "ex-smoked-sausage-9e67d273",
    "ex-sausages-skins-removed-ec022881",
    "ex-uncooked-mild-italian-sausage-20a5f2b4",
    "ex-pepperoni-slices-d83045ab",
  ];
  const patches = {
    "sp-sally-berry-galette": { baking: true, meals: ["Dessert", "Baking"] },
    "sp-sally-blueberry-galette": { baking: true, meals: ["Dessert", "Baking"] },
    "sp-sally-lemon-blueberry-babka": { baking: true, meals: ["Dessert", "Baking", "Breakfast"] },
    "sp-sally-white-chocolate-snickerdoodle-blondies": { baking: true, meals: ["Dessert", "Baking"], method: "oven" },
    "sp-sally-sweet-potato-dinner-rolls": { baking: true, meals: ["Baking"], dishRole: "side" },
    "sp-sally-rough-puff-pastry": {
      meals: ["Baking"], dishRole: "component", method: "no-cook",
      methodNote: "Unbaked pastry dough only. This preparation includes chilling and folding; bake it as directed by the recipe that uses the dough.",
    },
    "gf2-miso-soup": {
      methodNote:
        "Dashi can contain fish. This listing keeps a fish classification unless a verified plant-based stock is used.",
    },
    "gf2-cheesy-black-bean-quesadillas": { kind: "vegetarian", emoji: "🫓" },
    "sp-gfmore-chicken-mango-noodle-salad": {
      method: "no-cook",
      methodNote:
        "Soak the rice noodles in boiling water, then drain and rinse. Use ready-cooked roast chicken; the publisher method does not cook raw chicken.",
    },
    "sp-gfmore-no-cook-chicken-couscous": {
      method: "no-cook",
      methodNote:
        "Uses ready-cooked chicken and boiling-hot stock; a kettle or another way to heat the stock is needed.",
    },
    "gf2-quick-sushi-bowl": {
      method: "hob",
      methodNote:
        "Cook the rice following its pack instructions. Uses ready-cooked salmon.",
    },

    "gf2-greek-style-roast-fish": { kind: "fish" },
    "sp-gfmore-peppered-mackerel-pink-pickled-onion-salad": { kind: "fish" },

    "sp-gfmore-philly-cheesesteak": { kind: "meat" },
    "sp-recipetineats-beef-rice-noodles": { kind: "meat" },
    "sp-recipetineats-beef-steak-marinade": {
      kind: "meat",
      dishRole: "main",
      meals: ["Lunch", "Dinner"],
    },
    "sp-skinnytaste-thai-marinated-steak-salad": { kind: "meat" },
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
