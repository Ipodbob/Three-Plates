/* Additive v3 state rules. No network or DOM dependencies. */
(function (root) {
  "use strict";
  const C = root.PlatesCore;
  const original = { ...C };
  const safeText = (value) =>
    typeof value === "string" ? value.slice(0, 300) : "";
  const date = (value) => (C.validDate(value) ? value : null);
  const time = (value) =>
    typeof value === "string" && Number.isFinite(Date.parse(value))
      ? new Date(value).toISOString()
      : null;
  const url = (value) => {
    if (!value) return "";
    try {
      const u = new URL(value);
      return ["http:", "https:"].includes(u.protocol) &&
        !u.username &&
        !u.password
        ? u.href
        : "";
    } catch {
      return "";
    }
  };
  C.activeShop = (s) => s.tripShop || s.shop;
  C.defaults = () => ({
    ...original.defaults(),
    tripShop: null,
    purchaseHistory: [],
    batchFilters: {
      ...original.defaults().batchFilters,
      style: "repeat",
      mode: "any",
    },
  });

  C.packRecord = (id, shop, size, ingredients, details = {}) => {
    if (
      !ingredients[id] ||
      !C.shops.includes(shop) ||
      !Number.isFinite(size) ||
      size < 0 ||
      size > 1e6
    )
      throw Error("Check the ingredient, shop and pack size.");
    return {
      ingredientId: id,
      retailer: shop,
      size,
      unit: ingredients[id].unit,
      product: safeText(details.product),
      variant: safeText(details.variant),
      weightBasis: ingredients[id].name.toLowerCase().includes("drained")
        ? "drained"
        : "recipe unit",
      provenance:
        details.provenance === "estimated" ? "estimated" : "user-entered",
      url: url(details.url),
      verifiedOn: date(details.verifiedOn),
      enteredOn: date(details.enteredOn) || C.today(),
    };
  };
  C.packFor = (s, id) => {
    const record = s.packs[C.activeShop(s)]?.[id];
    if (record?.size === 0) return null;
    if (record)
      return {
        ...record,
        basis:
          record.provenance === "estimated"
            ? "Generic estimate"
            : "Your saved size",
      };
    return C.commonPacks[id]
      ? {
          size: C.commonPacks[id],
          basis: "Generic estimate",
          provenance: "estimated",
          retailer: null,
          verifiedOn: null,
          url: "",
        }
      : null;
  };
  C.purchase = (s, id, qty, ingredients) => {
    if (!Number.isFinite(qty) || qty < 0) throw Error("Enter a valid amount.");
    if (!qty) return { qty: 0, count: 0, extra: 0, pack: null };
    const pack = s.packMode === "packs" ? C.packFor(s, id) : null;
    const count = pack ? Math.ceil((qty - 0.00001) / pack.size) : null;
    const amount = pack
      ? C.round(count * pack.size)
      : ingredients[id]?.unit === "each"
        ? Math.ceil(qty - 0.00001)
        : qty;
    return { qty: amount, count, extra: C.round(amount - qty), pack };
  };
  // History stores the purchase's own pack and retailer; changing trips never rewrites it.
  C.recordPurchase = (
    s,
    id,
    qty,
    ingredients,
    { replace = false, pack = null } = {},
  ) => {
    if (!ingredients[id] || !Number.isFinite(qty) || qty < 0 || qty > 1e7)
      throw Error("Enter a valid purchased quantity.");
    s.purchaseHistory ??= [];
    if (replace)
      for (const p of s.purchaseHistory)
        if (p.ingredientId === id && p.status === "pending")
          p.status = "corrected";
    s.bought[id] = C.round((replace ? 0 : s.bought[id] || 0) + qty);
    if (qty)
      s.purchaseHistory.push({
        id: C.uid(),
        ingredientId: id,
        qty,
        unit: ingredients[id].unit,
        retailer: C.activeShop(s),
        pack: pack
          ? C.packRecord(id, C.activeShop(s), pack.size, ingredients, pack)
          : null,
        purchasedAt: new Date().toISOString(),
        status: "pending",
      });
  };
  C.transferBought = (s) => {
    original.transferBought(s);
    for (const p of s.purchaseHistory || [])
      if (p.status === "pending") p.status = "stocked";
  };
  C.suggestBatchSize = (s, b, recipes, ingredients) =>
    original.suggestBatchSize(
      { ...s, shop: C.activeShop(s) },
      b,
      recipes,
      ingredients,
    );

  C.migrate = (raw, recipes, baseIngredients) => {
    // Reject damaged linked records instead of silently losing food during restore.
    for (const key of ["plans", "pantry", "batches", "lots", "purchaseHistory"])
      if (raw?.[key] !== undefined && !Array.isArray(raw[key]))
        throw Error("Invalid " + key + " records.");
    const s = original.migrate(raw, recipes, baseIngredients),
      ingredients = { ...baseIngredients, ...s.custom };
    if (raw.version === 3) {
      for (const key of ["custom", "bought"])
        if (
          raw[key] !== undefined &&
          (!raw[key] || typeof raw[key] !== "object" || Array.isArray(raw[key]))
        )
          throw Error(
            "Invalid " + key + " records. Original data has not been replaced.",
          );
      for (const key of ["pantry", "plans"])
        if ((raw[key]?.length || 0) !== s[key].length)
          throw Error(
            "Invalid " + key + " record. Original data has not been replaced.",
          );
      for (const key of ["custom", "bought"])
        if (Object.keys(raw[key] || {}).length !== Object.keys(s[key]).length)
          throw Error(
            "Invalid " + key + " record. Original data has not been replaced.",
          );
    }
    if (
      (raw.lots?.length || 0) !== s.lots.length ||
      (raw.batches?.length || 0) !== s.batches.length
    )
      throw Error(
        "Invalid batch or portion record. Original data has not been replaced.",
      );
    s.tripShop = C.shops.includes(raw.tripShop) ? raw.tripShop : null;
    s.batchFilters.style =
      raw.batchFilters?.style === "variety" ? "variety" : "repeat";
    s.batchFilters.mode = ["any", "pantry", "only"].includes(
      raw.batchFilters?.mode,
    )
      ? raw.batchFilters.mode
      : "any";
    for (const [shop, records] of Object.entries(s.packs))
      for (const [id, p] of Object.entries(records)) {
        const source = raw.packs[shop][id];
        if (source.unit && source.unit !== ingredients[id].unit)
          throw Error("Pack units do not match the ingredient.");
        records[id] = C.packRecord(id, shop, p.size, ingredients, source);
      }
    s.purchaseHistory = (raw.purchaseHistory || []).map((p) => {
      if (
        !p ||
        !ingredients[p.ingredientId] ||
        !Number.isFinite(p.qty) ||
        p.qty <= 0 ||
        p.qty > 1e7 ||
        !time(p.purchasedAt) ||
        !["pending", "stocked", "corrected"].includes(p.status) ||
        !C.shops.includes(p.retailer) ||
        p.unit !== ingredients[p.ingredientId].unit
      )
        throw Error("Invalid purchase history.");
      return {
        id: safeText(p.id),
        ingredientId: p.ingredientId,
        qty: p.qty,
        unit: p.unit,
        retailer: p.retailer,
        pack: p.pack
          ? C.packRecord(
              p.ingredientId,
              p.retailer,
              p.pack.size,
              ingredients,
              p.pack,
            )
          : null,
        purchasedAt: time(p.purchasedAt),
        status: p.status,
      };
    });
    for (const l of s.lots) {
      const source = raw.lots.find((x) => x.id === l.id),
        b = s.batches.find((x) => x.id === l.batchId);
      if (!b || !b.cooked || b.recipeId !== l.recipeId)
        throw Error("A portion record is missing its cooked batch.");
      l.capacity = source.capacity === undefined ? l.portions : source.capacity;
      l.consumed = source.consumed === undefined ? 0 : source.consumed;
      if (
        !C.integer(l.capacity, 0) ||
        !C.integer(l.consumed, 0) ||
        l.portions + l.consumed > l.capacity
      )
        throw Error("Invalid portion correction history.");
      for (const stamp of ["frozenAt", "thawStartedAt", "thawedAt"])
        if (l[stamp] && Date.parse(l[stamp]) < Date.parse(l.cookedAt))
          throw Error("Storage dates are out of order.");
      if (l.location !== "fridge" && !l.frozenAt)
        throw Error("Frozen portions need a freezing date.");
      if (["thawing", "thawed"].includes(l.location) && !l.thawStartedAt) {
        throw Error("Defrosting portions need the recorded thaw-start time.");
      }
      if (l.thawedAt && Date.parse(l.thawedAt) < Date.parse(l.thawStartedAt)) {
        const completion = Date.parse(l.thawedAt),
          start = Date.parse(l.thawStartedAt);
        // Recover the whole-second value written by older forms, only within
        // the same second. Genuine reversed history remains invalid.
        if (Math.floor(completion / 1000) === Math.floor(start / 1000))
          l.thawedAt = l.thawStartedAt;
        else throw Error("Defrosting dates are out of order.");
      }
    }
    for (const b of s.batches) {
      const src = raw.batches.find((x) => x.id === b.id);
      if (
        s.lots
          .filter((l) => l.batchId === b.id)
          .reduce((n, l) => n + l.capacity, 0) > b.servings
      )
        throw Error("Stored portions exceed the cooked batch.");
      if (src.allocation) {
        const a = src.allocation;
        if (
          ![a.eat, a.fridge, a.freezer].every((v) => C.integer(v, 0)) ||
          a.eat + a.fridge + a.freezer !== b.servings
        )
          throw Error("Invalid batch allocation.");
        b.allocation = { eat: a.eat, fridge: a.fridge, freezer: a.freezer };
      }
      if (src.cookedAt) b.cookedAt = time(src.cookedAt);
    }
    return s;
  };
  C.finishBatch = (s, id, allocation, recipes, now = Date.now()) => {
    const b = s.batches.find((x) => x.id === id),
      r = recipes.find((x) => x.id === b?.recipeId);
    if (
      allocation.freezer &&
      r?.batch?.freezer !== true &&
      !allocation.freezerConfirmed
    )
      throw Error(
        "Freezer suitability is unknown. Check instructions for the recipe you actually cooked and confirm before recording frozen portions.",
      );
    if (r?.batch?.type === "uncooked")
      throw Error(
        "Prepared ingredients still need cooking before they can become cooked portions.",
      );
    const checkedRecipes = recipes.map((x) =>
      x.id === r?.id
        ? {
            ...x,
            batch: {
              ...x.batch,
              freezer: allocation.freezerConfirmed || x.batch.freezer,
            },
          }
        : x,
    );
    original.finishBatch(s, id, allocation, checkedRecipes, now);
    b.allocation = {
      eat: allocation.eat,
      fridge: allocation.fridge,
      freezer: allocation.freezer,
    };
    b.cookedAt = new Date(allocation.cookedAt).toISOString();
    for (const l of s.lots.filter((x) => x.batchId === id)) {
      l.capacity = l.portions;
      l.consumed = 0;
      l.thawStartedAt = null;
    }
    for (const p of s.purchaseHistory || [])
      if (p.status === "pending") p.status = "stocked";
  };
  C.finishPlan = (s, id, recipes, now = Date.now()) => {
    const p = s.plans.find((x) => x.id === id),
      l = p?.kind === "stored" ? s.lots.find((x) => x.id === p.lotId) : null;
    original.finishPlan(s, id, recipes, now);
    if (l) l.consumed = (l.consumed || 0) + p.servings;
    for (const p of s.purchaseHistory || [])
      if (p.status === "pending") p.status = "stocked";
  };
  C.thawPlan = (s, id, recipes, now = Date.now()) => {
    const p = s.plans.find((x) => x.id === id),
      l = s.lots.find((x) => x.id === p?.lotId);
    const lid = original.thawPlan(s, id, recipes, now);
    if (lid !== l.id) {
      const part = s.lots.find((x) => x.id === lid);
      l.capacity -= part.portions;
      part.capacity = part.portions;
      part.consumed = 0;
    }
    return lid;
  };
  C.changeStorage = (
    s,
    id,
    action,
    recipes,
    now = Date.now(),
    at = null,
    confirmed = false,
  ) => {
    const l = s.lots.find((x) => x.id === id),
      r = recipes.find((x) => x.id === l?.recipeId);
    if (action === "freeze" && r?.batch?.freezer !== true && !confirmed)
      throw Error(
        "Check recipe-specific freezing instructions first; suitability is unknown.",
      );
    original.changeStorage(s, id, action, recipes, now, at);
  };
  // Record corrections never repeat raw ingredient deductions or reset food history.
  C.correctLot = (s, id, portions, cookedAt) => {
    const l = s.lots.find((x) => x.id === id);
    if (
      !l ||
      !C.integer(portions, 0) ||
      portions > C.round(l.capacity - l.consumed)
    )
      throw Error("Corrections cannot create portions or restore eaten food.");
    if (portions < C.reserved(s, id))
      throw Error("Cancel reserved meals before reducing these portions.");
    const t = time(cookedAt);
    if (!t || Date.parse(t) > Date.parse(l.cookedAt))
      throw Error(
        "A correction may record an earlier cooking time, but cannot extend the food history.",
      );
    l.portions = portions;
    l.cookedAt = t;
  };
  C.discardPortions = (s, id, qty) => {
    const l = s.lots.find((x) => x.id === id);
    if (!l || !C.integer(qty) || qty > C.lotAvailable(s, l))
      throw Error(
        "Only unreserved portions can be discarded. Cancel their meals first.",
      );
    l.portions -= qty;
  };
  C.batchPortions = (s) => {
    const f = s.batchFilters,
      target = f.people * f.days,
      remaining = Math.max(
        0,
        target -
          s.batches
            .filter((b) => !b.cooked)
            .reduce((n, b) => n + b.servings, 0),
      );
    return Math.max(
      1,
      f.style === "variety"
        ? Math.min(remaining || f.people, Math.ceil(f.days / 2) * f.people)
        : remaining || target,
    );
  };
  C.linkPantryItem = (s, sourceId, targetId, qty, ingredients, expectedQty) => {
    const source = s.pantry.find((p) => p.id === sourceId),
      target = ingredients[targetId];
    if (
      !sourceId.startsWith("custom-") ||
      !source ||
      source.always ||
      source.qty <= 0 ||
      source.qty !== expectedQty
    )
      throw Error(
        "This product changed or has no measured stock. Reopen it before linking.",
      );
    if (!target || targetId.startsWith("custom-"))
      throw Error("Choose a recipe ingredient.");
    if (!Number.isFinite(qty) || qty <= 0 || qty > 1e7)
      throw Error("Enter the usable amount in the recipe ingredient's unit.");
    const existing = s.pantry.find((p) => p.id === targetId);
    if (existing?.always)
      throw Error(
        "Turn off Always stocked for that ingredient before linking measured stock.",
      );
    const total = Math.round(((existing?.qty || 0) + qty) * 1000) / 1000;
    if (total > 1e7) throw Error("The combined stock is too large.");
    const matches = Object.entries(s.barcodeMatches || {}).filter(
      ([, m]) => m.ingredientId === sourceId,
    );
    const converted = matches.map(([code, m]) => [
      code,
      {
        ...m,
        ingredientId: targetId,
        unit: target.unit,
        qty: Math.round(((m.qty * qty) / source.qty) * 1000) / 1000,
      },
    ]);
    if (
      converted.some(
        ([, m]) => !Number.isFinite(m.qty) || m.qty <= 0 || m.qty > 1e6,
      )
    )
      throw Error(
        "Check the amount: this would give an invalid full-pack size.",
      );
    s.pantry = s.pantry.filter((p) => p.id !== sourceId && p.id !== targetId);
    const useSoon = [
      source.useSoon,
      existing?.qty > 0 ? existing.useSoon : null,
    ]
      .filter(C.validDate)
      .sort()[0];
    s.pantry.push({
      id: targetId,
      qty: total,
      always: false,
      ...(useSoon ? { useSoon } : {}),
    });
    for (const [code, m] of converted) s.barcodeMatches[code] = m;
    // Keep custom definitions for historical references; only active stock moves.
    return total;
  };
  C.useSoonItems = (s, today = C.today()) =>
    s.pantry
      .filter(
        (p) =>
          !p.always &&
          p.qty > 0 &&
          C.validDate(p.useSoon) &&
          p.useSoon <= C.addDays(today, 3),
      )
      .sort(
        (a, b) =>
          a.useSoon.localeCompare(b.useSoon) || a.id.localeCompare(b.id),
      );
  C.choiceWeight = (r, s, batch, coverage = 0) => {
    let w = 1;
    if (s.prefs.favourites.includes(r.id)) w *= 2;
    if (s.prefs.cuisines.includes(r.cuisine)) w *= 1.5;
    w *=
      1 +
      r.ingredients.filter((i) => s.prefs.likedIngredients.includes(i.id))
        .length *
        0.5;
    if ((batch ? s.batchFilters.mode : s.filters.mode) === "pantry")
      w *= 1 + coverage * 10;
    if (batch && s.batchFilters.style === "variety") {
      const planned = s.batches.filter((b) => !b.cooked);
      if (planned.some((b) => b.recipeId === r.id)) w *= 0.15;
      const overlap = new Set(
        planned.flatMap(
          (b) =>
            root.PLATES_DATA?.recipes
              .find((x) => x.id === b.recipeId)
              ?.ingredients.map((i) => i.id) || [],
        ),
      );
      w *=
        1 +
        Math.min(3, r.ingredients.filter((i) => overlap.has(i.id)).length) *
          0.2;
    }
    return w;
  };
  if (typeof module !== "undefined") module.exports = C;
})(typeof globalThis !== "undefined" ? globalThis : this);
