/* Pilot batch variants of the original examples. No invented ratings or retailer data. */
(function (root) {
  "use strict";
  const data = root.PLATES_DATA;
  const variants = [
    {
      id: "prep-chilli",
      from: "slow-chilli",
      name: "Beef & bean chilli",
      omit: "rice",
      type: "base",
      method: "slow-cooker",
      end: "Taste the cooked chilli and portion it without rice. Prepare an accompaniment separately when you eat.",
      note: "Chilli only. Add rice, wraps or bread when planning a portion.",
    },
    {
      id: "prep-bolognese",
      from: "turbo-bolognese",
      name: "Beef bolognese sauce",
      omit: "pasta",
      type: "base",
      method: "hob",
      steps: [
        "Finely chop the onion, carrot and garlic. Soften them in the oil in a wide saucepan.",
        "Add the beef mince and break it up as it browns. Cook it thoroughly, then add passata and herbs. Simmer until the vegetables are tender and the sauce is cooked through; add a little water if needed.",
        "Portion the sauce without pasta. Cook pasta or another accompaniment freshly when serving.",
      ],
      note: "Sauce only. Pasta is bought and cooked for the meals you schedule.",
    },
    {
      id: "prep-dal",
      from: "red-lentil-dal",
      name: "Coconut red lentil dal",
      omit: "rice",
      type: "base",
      method: "hob",
      steps: [
        "Rinse the lentils. Finely chop the onion and soften it in the oil. Stir in the curry powder briefly.",
        "Add lentils, tomatoes, coconut milk and enough water to cover. Simmer, stirring and adding water as needed, until the lentils are completely tender. Follow any lentil packet instructions.",
        "Check the dal is cooked through. Portion without rice; prepare your chosen accompaniment separately.",
      ],
      note: "Dal only. Add freshly cooked rice or bread when serving.",
    },
    {
      id: "prep-chicken",
      from: "slow-chicken",
      name: "Tomato chicken",
      omit: "bread",
      type: "base",
      method: "slow-cooker",
      end: "Check the chicken is cooked through. Break into pieces if preferred and portion the chicken and sauce without bread.",
      note: "Chicken and sauce only. Add bread or another side later.",
    },
    {
      id: "prep-cottage",
      from: "lentil-cottage",
      name: "Lentil cottage pie",
      type: "complete",
      method: "oven-hob",
      note: "Includes the potato topping. No separate side is required.",
    },
  ];
  for (const v of variants) {
    const original = data.recipes.find((r) => r.id === v.from);
    if (!original) continue;
    const r = JSON.parse(JSON.stringify(original));
    r.id = v.id;
    r.name = v.name;
    r.method = v.method;
    r.ingredients = r.ingredients.filter((i) => i.id !== v.omit);
    if (v.steps) r.steps = v.steps;
    else if (v.end) r.steps[r.steps.length - 1] = v.end;
    r.batch = {
      type: v.type,
      note: v.note,
      fridgeHours: 48,
      freezer: null,
      qualityMonths: null,
      storageProvenance: {
        url: "https://www.gov.uk/government/publications/how-to-chill-freeze-and-defrost-food-safely/how-to-chill-freeze-and-defrost-food-safely",
        verifiedOn: "2026-09-28",
        scope: "General UK guidance only; recipe-specific storage unverified",
      },
    };
    r.description = v.note;
    r.example = true;
    data.recipes.push(r);
  }
  root.PLATES_STORAGE_GUIDE =
    "https://www.gov.uk/government/publications/how-to-chill-freeze-and-defrost-food-safely/how-to-chill-freeze-and-defrost-food-safely";
})(globalThis);
