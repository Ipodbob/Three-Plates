/* Reusable meal weeks. Templates never contain stock or reservation IDs. */
(function (root) {
  "use strict";
  const C = root.PlatesCore,
    original = { defaults: C.defaults, migrate: C.migrate };
  C.defaults = () => ({ ...original.defaults(), menus: [] });
  function validate(menu, recipes) {
    if (
      !menu ||
      typeof menu.id !== "string" ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(menu.id) ||
      ["__proto__", "constructor", "prototype"].includes(menu.id) ||
      typeof menu.name !== "string" ||
      !menu.name.trim() ||
      menu.name.length > 60 ||
      !Array.isArray(menu.entries) ||
      !menu.entries.length ||
      menu.entries.length > 35
    )
      throw Error("Invalid saved menu.");
    const slots = new Set();
    const entries = menu.entries.map((e) => {
      const r = recipes.find((r) => r.id === e.recipeId),
        slot = e.day + "|" + e.meal;
      if (
        !r ||
        !C.integer(e.day, 0, 6) ||
        !C.meals.includes(e.meal) ||
        !C.integer(e.servings, 1, C.maxServings(r)) ||
        !C.validSide(e.side, recipes) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.serveTime) ||
        slots.has(slot)
      )
        throw Error("Invalid saved menu meal.");
      slots.add(slot);
      return {
        day: e.day,
        meal: e.meal,
        recipeId: e.recipeId,
        servings: e.servings,
        side: e.side,
        serveTime: e.serveTime,
      };
    });
    return { id: menu.id, name: menu.name.trim(), entries };
  }
  C.migrate = (raw, recipes, ingredients) => {
    const s = original.migrate(raw, recipes, ingredients);
    if (
      raw.menus !== undefined &&
      (!Array.isArray(raw.menus) || raw.menus.length > 50)
    )
      throw Error("Invalid saved menus.");
    s.menus = (raw.menus || []).map((m) => validate(m, recipes));
    if (new Set(s.menus.map((m) => m.id)).size !== s.menus.length)
      throw Error("Duplicate saved menu records.");
    return s;
  };
  C.menuEntries = (s, start, meal = "all") => {
    if (
      !C.validDate(start) ||
      !C.validDate(C.addDays(start, 6)) ||
      !["all", ...C.meals].includes(meal)
    )
      throw Error("Choose a valid week and meal type.");
    const dates = Array.from({ length: 7 }, (_, n) => C.addDays(start, n));
    return s.plans
      .filter(
        (p) => dates.includes(p.date) && (meal === "all" || p.meal === meal),
      )
      .map((p) => ({
        day: dates.indexOf(p.date),
        meal: p.meal,
        recipeId: p.recipeId,
        servings: p.servings,
        side: p.side || "none",
        serveTime: p.serveTime || C.mealTimes[p.meal],
      }))
      .sort((a, b) => a.day - b.day || a.serveTime.localeCompare(b.serveTime));
  };
  C.saveMenu = (s, name, start, meal, recipes) => {
    if ((s.menus || []).length >= 50)
      throw Error("You can save up to 50 menus. Remove one first.");
    const entries = C.menuEntries(s, start, meal);
    if (!entries.length)
      throw Error("No planned meals in this week and meal type.");
    const menu = validate({ id: C.uid(), name, entries }, recipes);
    s.menus ??= [];
    s.menus.push(menu);
    return menu;
  };
  C.previewMenu = (s, id, start, people, recipes) => {
    const menu = validate(
      s.menus?.find((m) => m.id === id),
      recipes,
    );
    if (!C.validDate(start) || !C.validDate(C.addDays(start, 6)))
      throw Error("Choose a valid new week.");
    if (people !== null && !C.integer(people, 1, 12))
      throw Error("Choose 1–12 people, or keep saved portions.");
    if (s.plans.length + menu.entries.length > 1000)
      throw Error("Remove old meal records before copying more meals.");
    const plans = menu.entries.map((e) => {
      const r = recipes.find((r) => r.id === e.recipeId),
        date = C.addDays(start, e.day);
      if (s.plans.some((p) => p.date === date && p.meal === e.meal))
        throw Error(
          `${date} ${e.meal} already has a meal. Choose another week or remove that meal first.`,
        );
      if (!C.permitted(r, s.prefs) || !C.sideAllowed(e.side, s.prefs, recipes))
        throw Error(
          `${r.name} or its side conflicts with your current food preferences, hidden recipes or equipment.`,
        );
      return {
        kind: "cook",
        lotId: null,
        recipeId: e.recipeId,
        date,
        meal: e.meal,
        servings: people !== null && !r.baking ? people : e.servings,
        serveTime: e.serveTime,
        side: e.side,
        cooked: false,
      };
    });
    return plans;
  };
  C.applyMenu = (s, id, start, people, recipes) => {
    const plans = C.previewMenu(s, id, start, people, recipes).map((p) => ({
      ...p,
      id: C.uid(),
    }));
    s.plans.push(...plans);
    return plans;
  };
  if (typeof module !== "undefined") module.exports = C;
})(typeof globalThis !== "undefined" ? globalThis : this);
