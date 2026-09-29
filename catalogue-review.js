/* Reviewed catalogue metadata; evidence in docs/catalogue/classification-review.json. */
(function (root) {
  "use strict";
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
  for (const correction of requiredIngredientCorrections) {
    const r = root.PLATES_DATA.recipes.find(
      (r) => r.id === correction.recipeId,
    );
    if (!r) continue;
    for (const item of correction.items) {
      const existing = r.ingredients.find((i) => i.id === item.id);
      if (existing) existing.qty = item.qty;
      else
        r.ingredients.push({
          id: item.id,
          qty: item.qty,
          ...(item.avoidIds ? { avoidIds: item.avoidIds } : {}),
        });
    }
    for (const [oldText, newText] of correction.replace)
      r.planningNotes = r.planningNotes.replace(oldText, newText);
    const note =
      "Catalogue correction: " +
      correction.note +
      " Existing uncooked plans include these corrected amounts.";
    if (!r.planningNotes.includes(note))
      r.planningNotes = (r.planningNotes.trim() + " " + note).trim();
  }
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
