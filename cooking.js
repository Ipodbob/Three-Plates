/* Saved cooking checklists and wall-clock timers. No pantry mutations. */
(function (root) {
  "use strict";
  const C = root.PlatesCore,
    original = { defaults: C.defaults, migrate: C.migrate };
  const keyFor = (kind, id) => kind + ":" + id;
  const validKey = (key) =>
    typeof key === "string" && /^(plan|batch):[a-zA-Z0-9_-]{1,80}$/.test(key);
  const fail = () => {
    throw Error(
      "Invalid saved cooking progress. Original data has not been replaced.",
    );
  };
  const millis = (n) => Number.isSafeInteger(n) && n >= 0 && n <= 43200000;
  C.defaults = () => ({ ...original.defaults(), cooking: {} });
  C.migrate = (raw, recipes, ingredients) => {
    const s = original.migrate(raw, recipes, ingredients);
    if (
      raw.cooking !== undefined &&
      (!raw.cooking ||
        typeof raw.cooking !== "object" ||
        Array.isArray(raw.cooking))
    )
      fail();
    s.cooking = {};
    for (const [key, value] of Object.entries(raw.cooking || {})) {
      if (
        !validKey(key) ||
        !value ||
        typeof value.signature !== "string" ||
        value.signature.length > 100000 ||
        !Array.isArray(value.checked) ||
        !Array.isArray(value.timers) ||
        value.timers.length > 8
      )
        fail();
      if (
        value.checked.some(
          (x) =>
            typeof x !== "string" ||
            !/^(main|side):(ingredient:\d+|step:\d+|method)$/.test(x),
        ) ||
        new Set(value.checked).size !== value.checked.length
      )
        fail();
      const timers = value.timers.map((t) => {
        if (
          !t ||
          typeof t.id !== "string" ||
          !/^[a-zA-Z0-9_-]{1,80}$/.test(t.id) ||
          typeof t.label !== "string" ||
          !t.label.trim() ||
          t.label.length > 60 ||
          !millis(t.remaining) ||
          (t.endAt !== null &&
            (!Number.isSafeInteger(t.endAt) ||
              t.endAt < 0 ||
              t.endAt > 8640000000000000))
        )
          fail();
        return {
          id: t.id,
          label: t.label,
          remaining: t.remaining,
          endAt: t.endAt,
        };
      });
      if (new Set(timers.map((t) => t.id)).size !== timers.length) fail();
      s.cooking[key] = {
        signature: value.signature,
        checked: [...value.checked],
        timers,
      };
    }
    return s;
  };
  C.cookingView = (s, kind, id, recipes) => {
    if (!["plan", "batch"].includes(kind))
      throw Error("Choose a planned meal or batch.");
    const record = (kind === "plan" ? s.plans : s.batches).find(
      (p) => p.id === id,
    );
    if (!record || record.cooked)
      throw Error("This meal has finished or is no longer planned.");
    const recipe = recipes.find((r) => r.id === record.recipeId);
    if (!recipe) throw Error("This recipe is unavailable.");
    const stored = kind === "plan" && record.kind === "stored",
      groups = [];
    function group(r, prefix, items, name) {
      groups.push({
        name,
        ...(r?.unmeasuredIngredients?.length
          ? { unmeasured: r.unmeasuredIngredients }
          : {}),
        source: r?.source || null,
        ingredients: items.map((i, n) => ({
          ...i,
          key: prefix + ":ingredient:" + n,
        })),
        steps:
          r && !r.source
            ? (r.steps || []).map((text, n) => ({
                key: prefix + ":step:" + n,
                text,
              }))
            : [],
        methodKey: r?.source ? prefix + ":method" : null,
      });
    }
    if (!stored)
      group(recipe, "main", C.scaled(recipe, record.servings), recipe.name);
    if (kind === "plan" && record.side && record.side !== "none") {
      group(
        C.sideRecipe(record.side, recipes),
        "side",
        C.sideIngredients(record.side, record.servings, recipes),
        C.sideName(record.side, recipes),
      );
    }
    const signature = JSON.stringify({
      recipe: recipe.id,
      portions: record.servings,
      stored,
      groups,
    });
    const key = keyFor(kind, id),
      saved = s.cooking?.[key];
    return {
      key,
      kind,
      id,
      recipe,
      record,
      stored,
      groups,
      signature,
      saved,
      stale: !!saved && saved.signature !== signature,
    };
  };
  function session(s, view) {
    const saved = s.cooking?.[view.key];
    if (saved && saved.signature !== view.signature)
      throw Error(
        "The meal changed. Start an updated checklist before continuing.",
      );
    s.cooking ||= {};
    return (s.cooking[view.key] ||= {
      signature: view.signature,
      checked: [],
      timers: [],
    });
  }
  C.restartCooking = (s, view) => {
    s.cooking ||= {};
    s.cooking[view.key] = {
      signature: view.signature,
      checked: [],
      timers: [],
    };
  };
  C.checkCooking = (s, view, key, checked) => {
    const keys = view.groups.flatMap((g) =>
      [...g.ingredients, ...g.steps]
        .map((i) => i.key)
        .concat(g.methodKey || []),
    );
    if (!keys.includes(key) || typeof checked !== "boolean")
      throw Error("This checklist item is no longer available.");
    const p = session(s, view);
    p.checked = p.checked.filter((x) => x !== key);
    if (checked) p.checked.push(key);
  };
  C.timerRemaining = (timer, now = Date.now()) =>
    timer.endAt === null
      ? timer.remaining
      : Math.min(timer.remaining, Math.max(0, timer.endAt - now));
  C.addCookingTimer = (s, view, label, minutes, now = Date.now()) => {
    if (
      !C.integer(minutes, 1, 720) ||
      typeof label !== "string" ||
      label.trim().length > 60 ||
      !Number.isSafeInteger(now)
    )
      throw Error("Use a timer from 1 to 720 minutes and a short name.");
    if ((s.cooking?.[view.key]?.timers.length || 0) >= 8)
      throw Error(
        "Remove a timer before adding another (up to eight per meal).",
      );
    const p = session(s, view),
      duration = minutes * 60000;
    p.timers.push({
      id: C.uid(),
      label: label.trim() || "Cooking timer",
      remaining: duration,
      endAt: now + duration,
    });
  };
  C.changeCookingTimer = (s, view, id, action, now = Date.now()) => {
    if (!["pause", "resume", "remove"].includes(action))
      throw Error("Choose a timer action.");
    const p = session(s, view),
      t = p.timers.find((t) => t.id === id);
    if (!t) throw Error("This timer is no longer available.");
    if (action === "remove") p.timers = p.timers.filter((t) => t.id !== id);
    else if (action === "pause" && t.endAt !== null) {
      t.remaining = C.timerRemaining(t, now);
      t.endAt = null;
    } else if (action === "resume" && t.endAt === null && t.remaining > 0)
      t.endAt = now + t.remaining;
  };
  if (typeof module !== "undefined") module.exports = C;
})(typeof globalThis !== "undefined" ? globalThis : this);
