/* Pure state and quantity rules; shared by the UI and regression tests. */
(function (root) {
  "use strict";
  const round = (n) => Math.round((Number(n) + Number.EPSILON) * 1000) / 1000;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const text = (x) =>
    String(x || "")
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");
  const idOK = (x) =>
    typeof x === "string" &&
    /^[a-zA-Z0-9_-]{1,80}$/.test(x) &&
    !["__proto__", "constructor", "prototype"].includes(x);
  const units = {
    g: ["mass", 1],
    kg: ["mass", 1000],
    ml: ["volume", 1],
    l: ["volume", 1000],
    each: ["count", 1],
    tsp: ["spoon", 1],
    tbsp: ["spoon", 3],
  };
  const shops = [
    "none",
    "Tesco",
    "Waitrose",
    "Co-op",
    "Lidl",
    "Aldi",
    "Sainsbury’s",
    "Asda",
    "Morrisons",
    "Other",
  ];
  const mealTimes = {
    Breakfast: "08:00",
    Lunch: "12:00",
    Dinner: "18:00",
    Dessert: "20:00",
    Baking: "15:00",
  };
  const meals = Object.keys(mealTimes);
  const has = (o, k) => Object.hasOwn(o, k);
  const sides = {
    none: [],
    rice: [{ id: "rice", qty: 75 }],
    pasta: [{ id: "pasta", qty: 90 }],
    bread: [{ id: "bread", qty: 2 }],
    wraps: [{ id: "wraps", qty: 2 }],
  };
  // Estimates only, in the ingredient's base unit. Not product listings or live stock.
  const commonPacks = {
    "beef-mince": 500,
    chicken: 500,
    "chicken-thigh": 500,
    beef: 500,
    pork: 500,
    pasta: 500,
    rice: 1000,
    lentils: 500,
    "cooked-lentils": 250,
    "tomato-tin": 400,
    "kidney-beans": 240,
    chickpeas: 240,
    "black-beans": 240,
    "coconut-milk": 400,
    milk: 1000,
    cheddar: 400,
    butter: 250,
    spinach: 200,
    peas: 1000,
    wraps: 8,
    eggs: 6,
    oats: 1000,
    yoghurt: 500,
    passata: 500,
  };
  const uid = () =>
    root.crypto?.randomUUID?.() ||
    "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  function today() {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  }
  function validDate(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v || "")) return false;
    const d = new Date(v + "T12:00:00");
    return (
      !isNaN(d) &&
      d.getFullYear() >= 2020 &&
      d.getFullYear() <= 2100 &&
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` ===
        v
    );
  }
  function addDays(v, n) {
    const d = new Date(v + "T12:00:00");
    d.setDate(d.getDate() + n);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  }
  function integer(x, min = 1, max = 48) {
    return Number.isInteger(x) && x >= min && x <= max;
  }
  function convert(q, from, to) {
    if (!units[from] || !units[to] || units[from][0] !== units[to][0])
      throw Error("Choose compatible units.");
    if (!Number.isFinite(+q) || +q < 0) throw Error("Enter a valid amount.");
    return round((+q * units[from][1]) / units[to][1]);
  }
  function defaults() {
    return {
      version: 3,
      filters: {
        date: today(),
        meal: "Dinner",
        servings: 2,
        time: "30",
        method: "any",
        mode: "any",
        query: "",
      },
      batchFilters: {
        people: 1,
        days: 5,
        meal: "Lunch",
        time: "any",
        method: "any",
        query: "",
      },
      prefs: {
        diet: "any",
        exclusions: [],
        likedIngredients: [],
        cuisines: [],
        favourites: [],
        hidden: [],
        slowCooker: true,
      },
      shop: "none",
      packMode: "exact",
      packs: {},
      pantry: [],
      plans: [],
      batches: [],
      lots: [],
      bought: {},
      custom: {},
    };
  }
  function migrate(raw, recipes, baseIngredients) {
    if (!raw || ![1, 3].includes(raw.version))
      throw Error("Use a Three Plates version 1 or 3 backup.");
    const s = defaults(),
      ids = new Set(recipes.map((r) => r.id));
    for (const [id, i] of Object.entries(raw.custom || {}).slice(0, 500))
      if (
        idOK(id) &&
        id.startsWith("custom-") &&
        i &&
        typeof i.name === "string" &&
        has(units, i.unit)
      )
        s.custom[id] = {
          id,
          name: i.name.slice(0, 80),
          unit: i.unit,
          group: "Other",
        };
    const ing = new Set([
        ...Object.keys(baseIngredients),
        ...Object.keys(s.custom),
      ]),
      f = raw.filters || {},
      p = raw.prefs || {};
    if (validDate(f.date)) s.filters.date = f.date;
    for (const [key, allowed] of Object.entries({
      meal: meals,
      time: ["any", "15", "30", "long", "slow"],
      method: [
        "any",
        "hob",
        "oven",
        "oven-hob",
        "air-fryer",
        "pressure-cooker",
        "barbecue",
        "microwave",
        "slow-cooker",
        "no-cook",
      ],
      mode: ["any", "pantry", "only"],
    }))
      if (allowed.includes(f[key])) s.filters[key] = f[key];
    if (integer(f.servings, 1, 12)) s.filters.servings = f.servings;
    s.filters.query = typeof f.query === "string" ? f.query.slice(0, 100) : "";
    for (const k of [
      "exclusions",
      "likedIngredients",
      "favourites",
      "hidden",
      "cuisines",
    ])
      s.prefs[k] = [
        ...new Set(
          (Array.isArray(p[k]) ? p[k] : []).filter((v) =>
            k === "cuisines"
              ? recipes.some((r) => r.cuisine === v)
              : ["favourites", "hidden"].includes(k)
                ? ids.has(v)
                : ing.has(v),
          ),
        ),
      ];
    if (["any", "vegetarian", "vegan", "pescatarian"].includes(p.diet))
      s.prefs.diet = p.diet;
    s.prefs.slowCooker = p.slowCooker !== false;
    const b = raw.batchFilters || {};
    for (const k of ["people", "days"])
      if (integer(b[k], 1, k === "people" ? 6 : 7)) s.batchFilters[k] = b[k];
    for (const [k, allowed] of Object.entries({
      meal: meals,
      time: ["any", "15", "30", "long", "slow"],
      method: [
        "any",
        "hob",
        "oven",
        "oven-hob",
        "air-fryer",
        "pressure-cooker",
        "barbecue",
        "microwave",
        "slow-cooker",
        "no-cook",
      ],
    }))
      if (allowed.includes(b[k])) s.batchFilters[k] = b[k];
    s.batchFilters.query =
      typeof b.query === "string" ? b.query.slice(0, 100) : "";
    if (shops.includes(raw.shop)) s.shop = raw.shop;
    if (["exact", "packs"].includes(raw.packMode)) s.packMode = raw.packMode;
    for (const shop of shops) {
      const out = {};
      for (const [id, v] of Object.entries(raw.packs?.[shop] || {}))
        if (
          ing.has(id) &&
          v &&
          Number.isFinite(v.size) &&
          v.size >= 0 &&
          v.size <= 1e6
        )
          out[id] = { size: v.size };
      if (Object.keys(out).length) s.packs[shop] = out;
    }
    const seen = new Set();
    for (const p of (Array.isArray(raw.pantry) ? raw.pantry : []).slice(
      0,
      1000,
    ))
      if (
        p &&
        ing.has(p.id) &&
        !seen.has(p.id) &&
        Number.isFinite(p.qty) &&
        p.qty >= 0 &&
        p.qty <= 1e7
      ) {
        s.pantry.push({
          id: p.id,
          qty: p.qty,
          always: p.always === true,
          ...(p.qty > 0 && !p.always && validDate(p.useSoon)
            ? { useSoon: p.useSoon }
            : {}),
        });
        seen.add(p.id);
      }
    for (const [id, v] of Object.entries(raw.bought || {}))
      if (ing.has(id) && Number.isFinite(v) && v >= 0 && v <= 1e7)
        s.bought[id] = v;
    const batchIds = new Set();
    for (const b of (Array.isArray(raw.batches) ? raw.batches : []).slice(
      0,
      1000,
    ))
      if (
        b &&
        idOK(b.id) &&
        !batchIds.has(b.id) &&
        recipes.some((r) => r.id === b.recipeId && r.batch) &&
        integer(b.servings) &&
        validDate(b.date)
      ) {
        s.batches.push({
          id: b.id,
          recipeId: b.recipeId,
          servings: b.servings,
          date: b.date,
          cooked: b.cooked === true,
        });
        batchIds.add(b.id);
      }
    const lotIds = new Set();
    for (const l of (Array.isArray(raw.lots) ? raw.lots : []).slice(0, 1000))
      if (
        l &&
        idOK(l.id) &&
        !lotIds.has(l.id) &&
        ids.has(l.recipeId) &&
        integer(l.portions, 0) &&
        ["fridge", "freezer", "thawing", "thawed"].includes(l.location) &&
        Number.isFinite(Date.parse(l.cookedAt))
      ) {
        if (
          ["thawed"].includes(l.location) &&
          !Number.isFinite(Date.parse(l.thawedAt))
        )
          throw Error("A defrosted portion is missing its defrosting time.");
        s.lots.push({
          id: l.id,
          batchId: idOK(l.batchId) ? l.batchId : "",
          recipeId: l.recipeId,
          portions: l.portions,
          location: l.location,
          cookedAt: new Date(l.cookedAt).toISOString(),
          frozenAt: Number.isFinite(Date.parse(l.frozenAt))
            ? new Date(l.frozenAt).toISOString()
            : null,
          thawedAt: Number.isFinite(Date.parse(l.thawedAt))
            ? new Date(l.thawedAt).toISOString()
            : null,
          thawStartedAt: Number.isFinite(Date.parse(l.thawStartedAt))
            ? new Date(l.thawStartedAt).toISOString()
            : null,
        });
        lotIds.add(l.id);
      }
    const slots = new Set(),
      planIds = new Set();
    for (const p of (Array.isArray(raw.plans) ? raw.plans : []).slice(0, 1000))
      if (
        p &&
        ids.has(p.recipeId) &&
        validDate(p.date) &&
        meals.includes(p.meal) &&
        integer(
          p.servings,
          1,
          recipes.find((r) => r.id === p.recipeId)?.baking ? 48 : 12,
        ) &&
        !slots.has(p.date + "|" + p.meal)
      ) {
        const kind = p.kind === "stored" ? "stored" : "cook";
        if (
          kind === "stored" &&
          (!lotIds.has(p.lotId) ||
            s.lots.find((l) => l.id === p.lotId).recipeId !== p.recipeId)
        )
          throw Error("A planned stored meal is missing its matching batch.");
        const id = idOK(p.id) && !planIds.has(p.id) ? p.id : uid();
        s.plans.push({
          id,
          kind,
          lotId: kind === "stored" ? p.lotId : null,
          recipeId: p.recipeId,
          date: p.date,
          meal: p.meal,
          servings: p.servings,
          side: has(sides, p.side) ? p.side : "none",
          serveTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(p.serveTime || "")
            ? p.serveTime
            : mealTimes[p.meal],
          cooked: p.cooked === true,
        });
        slots.add(p.date + "|" + p.meal);
        planIds.add(id);
      }
    for (const l of s.lots)
      if (reserved(s, l.id) > l.portions)
        throw Error("A backup allocates more portions than a batch contains.");
    return s;
  }
  function scaled(r, servings) {
    if (!r || !integer(servings)) throw Error("Choose 1–48 portions.");
    return r.ingredients.map((i) => ({
      id: i.id,
      qty: round((i.qty * servings) / r.base),
    }));
  }
  function sideIngredients(side, n) {
    return (sides[side] || []).map((i) => ({
      id: i.id,
      qty: round(i.qty * n),
    }));
  }
  function requirements(s, recipes) {
    const needs = {};
    const add = (items) =>
      items.forEach((i) => (needs[i.id] = round((needs[i.id] || 0) + i.qty)));
    for (const p of s.plans)
      if (!p.cooked) {
        if (p.kind === "stored") add(sideIngredients(p.side, p.servings));
        else {
          const r = recipes.find((r) => r.id === p.recipeId);
          if (r) add(scaled(r, p.servings));
        }
      }
    for (const b of s.batches)
      if (!b.cooked) {
        const r = recipes.find((r) => r.id === b.recipeId);
        if (r) add(scaled(r, b.servings));
      }
    return needs;
  }
  function stock(s, id) {
    const p = s.pantry.find((p) => p.id === id);
    return p?.always ? Infinity : p?.qty || 0;
  }
  function shopping(s, recipes) {
    const needs = requirements(s, recipes);
    return Object.entries(needs).map(([id, qty]) => {
      const have = stock(s, id),
        bought = s.bought[id] || 0,
        need = round(Math.max(0, qty - have)),
        remaining = round(Math.max(0, need - bought));
      return {
        id,
        qty,
        have,
        bought,
        need,
        remaining,
        covered: need === 0,
        checked: need > 0 && remaining === 0,
      };
    });
  }
  function packFor(s, id) {
    const v = s.packs[s.shop]?.[id];
    if (v?.size === 0) return null;
    return v
      ? { size: v.size, basis: "Your saved size" }
      : commonPacks[id]
        ? { size: commonPacks[id], basis: "Generic estimate" }
        : null;
  }
  function purchase(s, id, qty, ingredients) {
    if (qty <= 0) return { qty: 0, count: 0, extra: 0, pack: null };
    const p = s.packMode === "packs" ? packFor(s, id) : null;
    const amount = p
      ? round(Math.ceil((qty - 0.00001) / p.size) * p.size)
      : ingredients[id]?.unit === "each"
        ? Math.ceil(qty - 0.00001)
        : qty;
    return {
      qty: amount,
      count: p ? Math.ceil((qty - 0.00001) / p.size) : null,
      extra: round(amount - qty),
      pack: p,
    };
  }
  function transferBought(s) {
    for (const [id, qty] of Object.entries(s.bought))
      if (qty > 0) {
        let p = s.pantry.find((p) => p.id === id);
        if (!p) {
          p = { id, qty: 0, always: false };
          s.pantry.push(p);
        }
        if (!p.always) p.qty = round(p.qty + qty);
      }
    s.bought = {};
  }
  function deduct(s, items) {
    for (const i of items) {
      const p = s.pantry.find((p) => p.id === i.id);
      if (p && !p.always) {
        p.qty = round(Math.max(0, p.qty - i.qty));
        if (!p.qty) delete p.useSoon;
      }
    }
  }
  function reserved(s, lotId) {
    return s.plans
      .filter((p) => p.kind === "stored" && p.lotId === lotId && !p.cooked)
      .reduce((a, p) => a + p.servings, 0);
  }
  function lotAvailable(s, l) {
    return Math.max(0, l.portions - reserved(s, l.id));
  }
  function expiry(l, recipes) {
    if (["freezer", "thawing"].includes(l.location)) return null;
    const r = recipes.find((r) => r.id === l.recipeId);
    const hours = Math.min(
      48,
      r?.batch?.fridgeHours || 48,
      r?.ingredients.some((i) => i.id === "rice") ? 24 : 48,
    );
    return l.location === "thawed"
      ? Date.parse(l.thawedAt) + 24 * 3600000
      : Date.parse(l.cookedAt) + hours * 3600000;
  }
  function expired(l, recipes, now = Date.now()) {
    const e = expiry(l, recipes);
    return e !== null && e <= now;
  }
  function finishBatch(s, id, allocation, recipes, now = Date.now()) {
    const b = s.batches.find((b) => b.id === id);
    if (!b || b.cooked)
      throw Error("This batch has already been recorded or is missing.");
    const { eat, fridge, freezer, cookedAt } = allocation;
    for (const v of [eat, fridge, freezer])
      if (!integer(v, 0)) throw Error("Use whole portions from 0–48.");
    if (eat + fridge + freezer !== b.servings)
      throw Error("The portions must add up to the batch size.");
    const t = Date.parse(cookedAt);
    if (!Number.isFinite(t) || t > now + 60000)
      throw Error("Enter a cooking time that is not in the future.");
    // Storing old untracked food is intentionally not inferred safe.
    if ((fridge || freezer) && now - t > 2 * 3600000)
      throw Error(
        "For this first version, record stored batches within two hours of cooking. Do not use this form to validate old leftovers.",
      );
    const r = recipes.find((r) => r.id === b.recipeId);
    if (!r?.batch) throw Error("Batch metadata is missing.");
    if (freezer && !r.batch.freezer)
      throw Error("This recipe has not been marked for freezing.");
    transferBought(s);
    deduct(s, scaled(r, b.servings));
    b.cooked = true;
    for (const [location, n] of [
      ["fridge", fridge],
      ["freezer", freezer],
    ])
      if (n)
        s.lots.push({
          id: uid(),
          batchId: b.id,
          recipeId: b.recipeId,
          portions: n,
          location,
          cookedAt: new Date(t).toISOString(),
          frozenAt: location === "freezer" ? new Date(now).toISOString() : null,
          thawedAt: null,
        });
  }
  function scheduleLot(
    s,
    id,
    date,
    meal,
    servings,
    repeats,
    side,
    recipes,
    now = Date.now(),
    serveTime = mealTimes[meal],
  ) {
    const l = s.lots.find((l) => l.id === id);
    if (!l || expired(l, recipes, now))
      throw Error(
        "These portions are unavailable or past their recorded storage limit.",
      );
    if (
      !integer(servings, 1, 12) ||
      !integer(repeats, 1, 7) ||
      !validDate(date) ||
      !meals.includes(meal) ||
      !has(sides, side) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(serveTime)
    )
      throw Error("Check the date, meal, portions and number of days.");
    if (
      !foodAllowed(
        recipes.find((r) => r.id === l.recipeId),
        s.prefs,
      ) ||
      sideIngredients(side, 1).some((i) => s.prefs.exclusions.includes(i.id))
    )
      throw Error("This meal or side conflicts with your food preferences.");
    if (servings * repeats > lotAvailable(s, l))
      throw Error("Not enough unallocated portions remain.");
    const dates = Array.from({ length: repeats }, (_, i) => addDays(date, i)),
      limit = expiry(l, recipes);
    for (const d of dates) {
      if (d < dateLocal(now)) throw Error("Choose today or a later date.");
      if (limit !== null && Date.parse(d + "T" + serveTime + ":00") >= limit)
        throw Error(
          "That date is beyond the recorded fridge limit. Use frozen portions for later days.",
        );
      if (s.plans.some((p) => p.date === d && p.meal === meal))
        throw Error(
          "A selected date and meal already has a plan. Remove it first or choose another slot.",
        );
    }
    for (const d of dates)
      s.plans.push({
        id: uid(),
        kind: "stored",
        lotId: id,
        recipeId: l.recipeId,
        date: d,
        meal,
        serveTime,
        servings,
        side,
        cooked: false,
      });
  }
  function finishPlan(s, id, recipes, now = Date.now()) {
    const p = s.plans.find((p) => p.id === id);
    if (!p || p.cooked)
      throw Error("This meal has already been recorded or is missing.");
    if (p.kind === "stored") {
      const l = s.lots.find((l) => l.id === p.lotId);
      if (!l || l.portions < p.servings || expired(l, recipes, now))
        throw Error(
          "Stored portions are unavailable or past their storage limit.",
        );
      if (["freezer", "thawing"].includes(l.location))
        throw Error(
          "Thaw in the fridge and mark fully defrosted in Pantry before eating.",
        );
      transferBought(s);
      deduct(s, sideIngredients(p.side, p.servings));
      l.portions -= p.servings;
    } else {
      transferBought(s);
      deduct(
        s,
        scaled(
          recipes.find((r) => r.id === p.recipeId),
          p.servings,
        ),
      );
    }
    p.cooked = true;
  }
  function dateLocal(now) {
    const d = new Date(now);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  }
  function foodAllowed(r, p) {
    return (
      !!r &&
      !r.ingredients.some(
        (i) =>
          p.exclusions.includes(i.id) ||
          (i.avoidIds || []).some((id) => p.exclusions.includes(id)),
      ) &&
      !(p.diet === "vegetarian" && r.vegetarianSuitable === false) &&
      !(p.diet === "vegetarian" && !["vegan", "vegetarian"].includes(r.kind)) &&
      !(p.diet === "vegan" && r.kind !== "vegan") &&
      !(p.diet === "pescatarian" && r.kind === "meat")
    );
  }
  function permitted(r, p) {
    return (
      foodAllowed(r, p) &&
      !p.hidden.includes(r.id) &&
      !(
        p.slowCooker === false &&
        (r.method === "slow-cooker" || (!r.method && r.slow))
      )
    );
  }
  function changeStorage(s, id, action, recipes, now = Date.now(), at = null) {
    const l = s.lots.find((l) => l.id === id);
    if (!l || !l.portions) throw Error("No portions remain.");
    if (expired(l, recipes, now))
      throw Error(
        "Past the recorded storage limit. Do not reset the date or freeze to extend it.",
      );
    if (action === "freeze" && l.location === "fridge") {
      l.location = "freezer";
      l.frozenAt = new Date(now).toISOString();
    } else if (action === "thaw" && l.location === "freezer") {
      l.location = "thawing";
      l.thawStartedAt = new Date(now).toISOString();
    } else if (action === "defrosted" && l.location === "thawing") {
      const t = Date.parse(at);
      if (
        !Number.isFinite(t) ||
        t > now + 60000 ||
        t + 1000 < Date.parse(l.thawStartedAt || l.frozenAt || l.cookedAt)
      )
        throw Error(
          "Enter the actual time fully defrosted, after thawing started and not in the future.",
        );
      l.location = "thawed";
      // The form records whole seconds; do not place completion just before
      // its millisecond-precision start when both occur within one second.
      l.thawedAt = new Date(
        Math.max(t, Date.parse(l.thawStartedAt || l.frozenAt || l.cookedAt)),
      ).toISOString();
    } else throw Error("That storage change is not available.");
  }
  // Split off only the servings needed for one planned meal; the rest stay frozen.
  function thawPlan(s, id, recipes, now = Date.now()) {
    const p = s.plans.find(
        (p) => p.id === id && !p.cooked && p.kind === "stored",
      ),
      l = p && s.lots.find((l) => l.id === p.lotId);
    if (!p || !l || l.location !== "freezer" || l.portions < p.servings)
      throw Error("Frozen portions are not available.");
    if (l.portions === p.servings) {
      changeStorage(s, l.id, "thaw", recipes, now);
      return l.id;
    }
    const part = {
      ...l,
      id: uid(),
      portions: p.servings,
      location: "thawing",
      thawStartedAt: new Date(now).toISOString(),
      thawedAt: null,
    };
    l.portions -= p.servings;
    s.lots.push(part);
    p.lotId = part.id;
    return part.id;
  }
  function discardLot(s, id) {
    const l = s.lots.find((l) => l.id === id);
    if (!l) throw Error("These portions are missing.");
    l.portions = 0;
    s.plans = s.plans.filter((p) => p.cooked || p.lotId !== id);
  }
  function matching(r, f, s, recipes, ingredients) {
    if (!permitted(r, s.prefs) || !r.meals.includes(f.meal)) return false;
    if (
      (f.time === "15" && (r.total > 15 || r.additionalTime)) ||
      (f.time === "30" && (r.total > 30 || r.additionalTime)) ||
      (f.time === "long" && r.total <= 30) ||
      (f.time === "slow" && !r.slow)
    )
      return false;
    if (
      f.method &&
      f.method !== "any" &&
      !(
        r.method === f.method ||
        (r.method === "oven-hob" && ["oven", "hob"].includes(f.method))
      )
    )
      return false;
    const q = text(f.query);
    if (
      q &&
      !text(
        [
          r.name,
          r.cuisine,
          ...(r.tags || []),
          ...(r.tags || []).map((tag) => tag.replaceAll("-", " ")),
          ...(r.tags || []).map(
            (tag) =>
              ({
                traybake: "tray bake traybakes tray bakes sheet pan",
                pastry: "pastries",
                savoury: "savory",
                cake: "cakes",
                soup: "soups",
                bread: "breads",
                cookies: "biscuits",
              })[tag] || "",
          ),
          r.effort,
          r.effort === "project"
            ? "complex advanced"
            : r.effort === "simple"
              ? "easy beginner"
              : "",
          r.source?.publisher,
          ...r.ingredients.map((i) => ingredients[i.id]?.name),
        ].join(" "),
      ).includes(q)
    )
      return false;
    if (f.mode === "only") {
      const req = requirements(s, recipes);
      if (
        scaled(r, r.baking ? r.base : f.servings || 1).some(
          (i) =>
            Math.max(0, stock(s, i.id) - (req[i.id] || 0)) + 0.0005 < i.qty,
        )
      )
        return false;
    }
    return true;
  }
  function suggestBatchSize(s, b, recipes, ingredients) {
    if (s.packMode !== "packs") return null;
    const r = recipes.find((r) => r.id === b.recipeId);
    const focus = r.ingredients.find((i) =>
      [
        "beef-mince",
        "chicken-thigh",
        "chicken",
        "lentils",
        "cooked-lentils",
      ].includes(i.id),
    );
    if (!focus) return null;
    const row = shopping(s, recipes).find((i) => i.id === focus.id);
    if (!row) return null;
    const p = purchase(s, row.id, row.remaining, ingredients),
      extra = p.extra;
    const more = Math.floor((extra + 0.00001) / (focus.qty / r.base));
    const total = b.servings + more;
    return more > 0 && total <= 48
      ? { servings: total, id: focus.id, extra }
      : null;
  }
  const api = {
    mealTimes,
    meals,
    dateLocal,
    foodAllowed,
    thawPlan,
    discardLot,
    round,
    clone,
    text,
    units,
    shops,
    sides,
    commonPacks,
    uid,
    today,
    validDate,
    addDays,
    integer,
    convert,
    defaults,
    migrate,
    scaled,
    sideIngredients,
    requirements,
    stock,
    shopping,
    packFor,
    purchase,
    transferBought,
    deduct,
    reserved,
    lotAvailable,
    expiry,
    expired,
    finishBatch,
    scheduleLot,
    finishPlan,
    changeStorage,
    permitted,
    matching,
    suggestBatchSize,
  };
  root.PlatesCore = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
