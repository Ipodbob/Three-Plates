/* Three Plates v3: local-first UI. Quantities and transitions live in core-v3.js. */
(function () {
  "use strict";
  const C = globalThis.PlatesCore,
    R = globalThis.PLATES_DATA.recipes,
    I = globalThis.PLATES_DATA.ingredients;
  const KEY = "three-plates-v3",
    OLD = "three-plates-v1",
    main = document.getElementById("main"),
    sheet = document.getElementById("sheet");
  const e = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const paths = {
    choose: "M4 3v7m3-7v7M4 7h3M5.5 10v11M17 3c-4 3-4 8 0 9h2V3Zm1 9v9",
    batch:
      "M3 9h18v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9Zm-2 3h2m18 0h2M8 5V2m4 3V2m4 3V2",
    plan: "M4 4h16v17H4V4Zm4-2v5m8-5v5M4 10h16",
    shop: "M5 7h14l2 14H3L5 7Zm3 0V5a4 4 0 0 1 8 0v2",
    pantry: "M4 3h16v18H4V3Zm0 9h16M8 6v2m0 7v3",
    you: "M4 7h5m5 0h6M4 17h10m5 0h1M9 4h5v6H9V4Zm5 10h5v6h-5v-6",
    plus: "M12 5v14M5 12h14",
    close: "m6 6 12 12M6 18 18 6",
    check: "m5 12 4 4L19 6",
    heart:
      "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8",
    refresh:
      "M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 1l1 5M4 12l1 5a8 8 0 0 0 13 1",
    clock: "M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    pin: "m15 3 6 6-4 1-3 5-2 1-4-4 1-2 5-3 1-4ZM8 16l-5 5",
    search: "M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    arrow: "M5 12h14m-6-6 6 6-6 6",
  };
  const icon = (n) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n] || paths.choose}"/></svg>`;
  const btn = (label, act, id = "", cls = "secondary") =>
    `<button type="button" class="button ${cls}" data-act="${act}" data-id="${e(id)}">${label}</button>`;
  const number = (n, max = 3) =>
    Number(n).toLocaleString("en-GB", { maximumFractionDigits: max });
  const counts = {
    bread: ["slice", "slices"],
    eggs: ["egg", "eggs"],
    garlic: ["clove", "cloves"],
    pepper: ["pepper", "peppers"],
    onion: ["onion", "onions"],
    wraps: ["wrap", "wraps"],
    pitta: ["pitta", "pittas"],
    lemon: ["lemon", "lemons"],
    lime: ["lime", "limes"],
    avocado: ["avocado", "avocados"],
    banana: ["banana", "bananas"],
    apple: ["apple", "apples"],
    sausages: ["sausage", "sausages"],
  };
  let state = C.defaults(),
    originalBackup = "",
    storageError = "",
    migrated = false,
    blocked = false;
  try {
    const saved = localStorage.getItem(KEY),
      old = localStorage.getItem(OLD);
    if (saved || old) {
      originalBackup = saved || old;
      state = C.migrate(JSON.parse(saved || old), R, I);
      migrated = !saved && !!old;
    }
    if (migrated) localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    storageError =
      "Saved data could not be read. The original is untouched. Restore a backup in Settings; saving is paused.";
    blocked = true;
  }
  let route = location.hash.slice(1) || "choose",
    pantryTab = "ingredients",
    shown = { choose: [], batch: [] },
    seen = { choose: [], batch: [] },
    locked = { choose: [], batch: [] },
    toastTimer;
  const recipe = (id) => R.find((r) => r.id === id),
    ingredients = () => ({ ...I, ...state.custom }),
    ing = (id) => I[id] || state.custom[id];
  function amount(id, n) {
    if (n === Infinity) return "Always stocked";
    const u = ing(id)?.unit || "each";
    if (u === "each" && counts[id])
      return `${number(n)} ${counts[id][n === 1 ? 0 : 1]}`;
    if (u === "g" && n >= 1000) return `${number(n / 1000)} kg`;
    if (u === "ml" && n >= 1000) return `${number(n / 1000)} l`;
    return `${number(n)} ${u === "each" ? "items" : u}`;
  }
  function duration(n) {
    return n < 60
      ? `${n} min`
      : `${Math.floor(n / 60)}h${n % 60 ? " " + (n % 60) + "m" : ""}`;
  }
  function day(d) {
    return new Date(d + "T12:00:00").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }
  function stamp(t) {
    return new Date(t).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  function localTime(t = Date.now()) {
    const d = new Date(t);
    return (
      C.dateLocal(t) +
      "T" +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0") +
      ":" +
      String(d.getSeconds()).padStart(2, "0")
    );
  }
  const methods = [
    ["any", "Any method"],
    ["hob", "Hob"],
    ["oven", "Oven"],
    ["air-fryer", "Air fryer"],
    ["slow-cooker", "Slow cooker"],
    ["pressure-cooker", "Pressure cooker"],
    ["barbecue", "Barbecue"],
    ["microwave", "Microwave"],
    ["no-cook", "No cook"],
  ];
  const times = [
    ["any", "Any time"],
    ["15", "Up to 15 minutes"],
    ["30", "Up to 30 minutes"],
    ["long", "Over 30 minutes"],
    ["slow", "Slow-cooked / hands-off"],
  ];
  const method = (r) =>
    ({
      hob: "Hob",
      microwave: "Microwave",
      barbecue: "Barbecue",
      packet: "Follow packet cooking method",
      "pressure-cooker": "Pressure cooker",
      "sous-vide": "Sous vide",
      "waffle-iron": "Waffle iron",
      oven: "Oven",
      "oven-hob": "Oven + hob",
      "air-fryer": "Air fryer",
      "slow-cooker": "Slow cooker",
      "no-cook": "No cook",
    })[r.method] || "";
  const prepLabel = (r) =>
    r.prep === null ? "Prep time not listed" : `${r.prep} min prep`;
  const recipeTags = (r) =>
    (r.dishRole === "side"
      ? '<p class="helper">Side dish / starter · plan a main separately</p>'
      : r.dishRole === "component"
        ? '<p class="helper">Recipe component · use alongside another recipe</p>'
        : "") +
    (r.tags?.length
      ? `<p class="recipe-tags">${r.tags.map((tag) => `<span>${e(tag.replaceAll("-", " "))}</span>`).join("")}<span title="Three Plates effort estimate">${e(r.effort === "project" ? "More involved" : r.effort === "simple" ? "Simple" : "Some preparation")}</span></p>`
      : "");
  function recipeSource(r, full = false) {
    if (!r.source)
      return '<p class="recipe-rating helper">Original example · not rated</p>';
    const s = r.source;
    let url;
    try {
      url = new URL(s.url);
    } catch {
      return "";
    }
    if (url.protocol !== "https:") return "";
    const rating =
      Number.isFinite(s.rating) && Number.isFinite(s.ratingCount)
        ? `★ ${Number(s.rating.toFixed(2))}/5 · ${s.ratingCount.toLocaleString()} ${e(s.countLabel || "ratings")}`
        : "Editorial selection · no published rating";
    return `<div class="recipe-rating"><a href="${e(url.href)}" target="_blank" rel="noopener noreferrer">${rating} · ${e(s.publisher)}</a>${full ? `<p class="helper">By ${e(s.author)}. Source checked ${e(s.retrievedOn)}; ratings can change. Publisher yield: ${e(s.yield)}.</p>${s.selectionReason ? `<p class="helper">${e(s.selectionReason)} ${e(r.effortBasis || "")}</p>` : ""}<p>${e(r.planningNotes)}</p>${r.timingNote ? `<p class="helper">${e(r.timingNote)}</p>` : ""}<p class="helper">These are planning quantities; count-to-weight and spoon estimates are stated above. Compare with the publisher’s ingredients before shopping. ${r.ingredients.some((i) => ["chicken-breast-count", "chicken-thigh-count", "chicken-thigh-bone"].includes(i.id)) ? "Counted chicken pieces and weighed chicken are separate pantry entries." : ""}</p>` : ""}</div>`;
  }
  const opts = (values, value) =>
    values
      .map((v) => {
        const [id, label] = Array.isArray(v) ? v : [v, v];
        return `<option value="${e(id)}" ${value === id ? "selected" : ""}>${e(label)}</option>`;
      })
      .join("");
  const field = (label, id, control) =>
    `<div class="field"><label for="${id}">${label}</label>${control}</div>`;
  const select = (id, values, value, extra = "") =>
    `<select id="${id}" ${extra}>${opts(values, value)}</select>`;
  const numInput = (id, n, min = 1, max = 48) =>
    `<input id="${id}" type="number" inputmode="numeric" min="${min}" max="${max}" step="1" value="${n}" required>`;
  const quantityInput = (id, n, min, max, label) =>
    `<div class="quantity-stepper"><button type="button" id="${id}-minus" data-act="quantity-step" data-target="${id}" data-step="-1" aria-label="Decrease ${label}" aria-disabled="${n <= min}">−</button>${numInput(id, n, min, max)}<button type="button" id="${id}-plus" data-act="quantity-step" data-target="${id}" data-step="1" aria-label="Increase ${label}" aria-disabled="${n >= max}">+</button></div>`;
  function toast(t) {
    const el = document.getElementById("toast");
    el.textContent = t;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 5500);
  }
  function persist() {
    if (blocked) {
      toast(storageError);
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      storageError = "";
    } catch (err) {
      storageError =
        "This browser cannot save changes. Export a backup in Settings.";
      toast(storageError);
    }
  }
  // All state transitions are atomic: a failed validation leaves the previous state intact.
  function change(fn, notice = "", reset = false) {
    if (blocked) {
      toast(storageError);
      return false;
    }
    const before = C.clone(state);
    try {
      fn();
      persist();
      if (reset) clearChoices();
      render();
      if (notice) toast(notice);
      return true;
    } catch (err) {
      state = before;
      toast(err.message || "Could not save that change.");
      return false;
    }
  }
  function clearChoices() {
    shown = { choose: [], batch: [] };
    seen = { choose: [], batch: [] };
    locked = { choose: [], batch: [] };
  }
  function go(r) {
    if (location.hash === "#" + r) {
      route = r;
      render();
    } else location.hash = r;
  }
  function head(title, sub, eyebrow = "THREE PLATES") {
    return `<section class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p></div></section>`;
  }
  function empty(title, sub, action = "") {
    return `<div class="empty"><h2>${title}</h2><p>${sub}</p>${action}</div>`;
  }
  function nav() {
    const missing = C.shopping(state, R).filter((i) => i.remaining > 0).length;
    const activeRoute = route === "batch" ? "choose" : route;
    document.getElementById("nav").innerHTML = [
      ["choose", "Choose"],
      ["plan", "Plan"],
      ["shop", "Shopping"],
      ["pantry", "Pantry"],
    ]
      .map(
        ([id, label]) =>
          `<a href="#${id}" class="nav-item ${activeRoute === id ? "active" : ""}" ${activeRoute === id ? 'aria-current="page"' : ""}>${icon(id)}<span>${label}</span>${id === "shop" && missing ? `<span class="nav-count">${missing}</span>` : ""}</a>`,
      )
      .join("");
    document
      .getElementById("settings-link")
      .setAttribute("aria-current", route === "you" ? "page" : "false");
  }
  function render() {
    if (!["choose", "batch", "plan", "shop", "pantry", "you"].includes(route))
      route = "choose";
    const focusId = document.activeElement?.id;
    const pages = {
      choose: choosePage,
      batch: choosePage,
      plan: planPage,
      shop: shopPage,
      pantry: pantryPage,
      you: settingsPage,
    };
    main.innerHTML =
      (storageError
        ? `<div class="notice storage-warning">${e(storageError)} <a href="#you">Settings</a></div>`
        : "") + pages[route]();
    nav();
    if (focusId)
      document.getElementById(focusId)?.focus({ preventScroll: true });
  }
  function currentFilters(batch) {
    return batch
      ? {
          ...state.batchFilters,
          servings: state.batchFilters.people * state.batchFilters.days,
          mode: state.batchFilters.mode || "any",
        }
      : state.filters;
  }
  function pool(batch) {
    const f = currentFilters(batch);
    return R.filter(
      (r) =>
        (batch ? !!r.batch : !r.batch || !!r.source) &&
        (!r.dishRole || !!f.query?.trim()) &&
        C.matching(r, f, state, R, ingredients()),
    );
  }
  function coverage(r, n) {
    const reserved = C.requirements(state, R);
    let yes = 0,
      ratio = 0;
    const items = C.scaled(r, n);
    for (const i of items) {
      const have = Math.max(0, C.stock(state, i.id) - (reserved[i.id] || 0));
      if (have + 0.0005 >= i.qty) yes++;
      ratio += Math.min(1, have / i.qty);
    }
    return { yes, total: items.length, ratio: ratio / items.length };
  }
  function suggestions(batch, refresh = false) {
    const key = batch ? "batch" : "choose",
      p = pool(batch),
      valid = new Set(p.map((r) => r.id));
    shown[key] = shown[key].filter((id) => valid.has(id));
    locked[key] = locked[key].filter((id) => valid.has(id));
    if (!refresh && shown[key].length) return shown[key].map(recipe);
    const keep = shown[key].filter((id) => locked[key].includes(id)),
      out = [...keep];
    let candidates = p.filter((r) => !out.includes(r.id));
    let repeated = false;
    while (out.length < 3 && candidates.length) {
      let fresh = candidates.filter((r) => !seen[key].includes(r.id));
      if (!fresh.length) {
        fresh = candidates.filter((r) => !shown[key].includes(r.id));
        repeated = true;
      }
      if (!fresh.length) fresh = candidates;
      const weights = fresh.map((r) =>
        C.choiceWeight(
          r,
          state,
          batch,
          coverage(r, currentFilters(batch).servings).ratio,
        ),
      );
      let pick = Math.random() * weights.reduce((a, b) => a + b, 0),
        index = weights.length - 1;
      for (let k = 0; k < weights.length; k++) {
        pick -= weights[k];
        if (pick <= 0) {
          index = k;
          break;
        }
      }
      const r = fresh[index];
      out.push(r.id);
      candidates = candidates.filter((x) => x.id !== r.id);
    }
    shown[key] = out;
    seen[key] = [...new Set([...seen[key], ...out])];
    if (refresh)
      toast(
        keep.length === 3
          ? "Unkeep a card before refreshing."
          : p.length < 3
            ? `Only ${p.length} recipes match. Your preferences have not been relaxed.`
            : repeated
              ? "Some ideas repeat because the matching recipe pool is exhausted."
              : "Three fresh ideas.",
      );
    return out.map(recipe);
  }
  function filterExtras(batch) {
    const f = currentFilters(batch),
      prefix = batch ? "bf" : "f";
    const choices = (key, title, values) =>
      `<div class="tap-filter"><span class="label" id="${prefix}-${key}-label">${title}</span><div class="filter-chips" role="group" aria-labelledby="${prefix}-${key}-label">${values.map(([value, label]) => `<button type="button" id="${prefix}-${key}-${value}" class="filter-chip" data-act="recipe-filter" data-filter="${key}" data-id="${value}" aria-pressed="${f[key] === value}">${e(label)}</button>`).join("")}</div></div>`;
    return `<section class="tap-filters" aria-label="Recipe filters">${choices(
      "time",
      "Total time",
      times.map(([value, label]) => [
        value,
        label
          .replace("minutes", "min")
          .replace("Slow-cooked / hands-off", "Slow-cooked"),
      ]),
    )}${choices("method", "Cooking method", methods)}<p class="helper">Prep time is shown on each recipe. Larger batches can take longer.</p></section>`;
  }
  function searchBox(batch) {
    const f = currentFilters(batch);
    return `<form id="search-form" class="recipe-search" data-batch="${batch}"><label class="sr-only" for="recipe-search">Search recipes or ingredients</label><input id="recipe-search" type="search" maxlength="100" placeholder="Search dishes, ingredients or styles" aria-describedby="search-help" value="${e(f.query)}"><button class="icon-btn" aria-label="Search recipes" type="submit">${icon("search")}</button>${f.query ? btn("Clear", "clear-search", "", "ghost") : ""}</form><p id="search-help" class="helper">Try traybake, soup, pastry, savoury, simple or complex. Your meal, time and food filters still apply.</p>${["Baking", "Dessert"].includes(f.meal) ? '<p class="helper">Cakes, breads and other bakes start at the full recipe yield, regardless of headcount. You can adjust the quantity in the recipe.</p>' : ""}`;
  }
  function card(r, batch) {
    const key = batch ? "batch" : "choose",
      f = currentFilters(batch),
      cv = coverage(r, r.baking ? r.base : f.servings),
      liked = state.prefs.favourites.includes(r.id),
      kept = locked[key].includes(r.id);
    return `<article class="meal-card"><div class="card-art"><span class="food-emoji" aria-hidden="true">${r.emoji}</span><span class="pick-label">${batch ? "BATCH COOKING" : e(r.cuisine)}</span><button class="icon-btn heart-btn ${liked ? "active" : ""}" data-act="favourite" data-id="${r.id}" aria-label="${liked ? "Unsave" : "Save"} ${e(r.name)}" aria-pressed="${liked}">${icon("heart")}</button></div><div class="card-body"><div class="card-kicker">${batch ? (r.batch.type === "base" ? "Base dish · choose a side later" : r.batch.type === "uncooked" ? "Prepared ahead · still needs cooking" : "Complete meal") : e(r.vegetarianSuitable === false ? "Contains animal-rennet cheese" : r.kind === "meat" ? "Meat" : r.kind === "fish" ? "Fish" : r.kind === "vegan" ? "Plant-based" : "Vegetarian")}</div><h3>${e(r.name)}</h3><p class="description">${e(r.source ? `By ${r.source.author}` : r.description)}</p>${recipeSource(r)}${recipeTags(r)}${!batch && r.batch?.type === "base" ? '<p class="helper">Sauce / base only · plan a side separately</p>' : ""}<div class="meta-row"><span>${icon("clock")}${duration(r.total)} ${r.additionalTime ? "prep/cook + extra time" : "total"}</span><span>${prepLabel(r)}</span><span>${e(method(r))}</span></div>${batch ? `<p class="batch-tag">Freezer suitability not verified${r.source ? "" : " · example recipe"}</p>` : `<div class="pantry-match"><span><strong>${cv.yes} / ${cv.total}</strong> ingredients covered</span><span>${r.baking ? `Full bake · ${r.base} pieces/portions` : `For ${f.servings}`}</span></div>`}<div class="card-actions">${btn("View recipe", "recipe", r.id)}${btn(batch ? "Plan batch" : r.baking ? "Plan full bake" : "Add to plan", batch ? "batch-add" : "plan-add", r.id, "")}</div><div class="card-bottom"><button class="keep-btn ${kept ? "active" : ""}" data-act="keep" data-id="${r.id}" aria-pressed="${kept}">${icon("pin")}${kept ? "Kept" : "Keep this idea"}</button><button class="text-btn" data-act="hide" data-id="${r.id}">Not for me</button></div></div></article>`;
  }
  function results(batch) {
    const f = currentFilters(batch),
      all = pool(batch),
      cards = f.query ? all : suggestions(batch);
    return `<div class="choice-heading"><div><h2>${f.query ? "Search results" : "Three ideas for you"}</h2><p>${all.length} ${batch ? "batch recipes" : "recipes"} match your preferences</p></div>${!f.query ? btn(icon("refresh") + " Refresh", "refresh", "", "secondary") : ""}</div>${cards.length ? `<div class="choice-grid">${cards.map((r) => card(r, batch)).join("")}</div>` : empty("No matching recipes", "Try another time, method or search. Your food exclusions stay in place.", btn("Reset search & time", "reset-filters"))}`;
  }
  function choosePage() {
    const batch = route === "batch",
      f = currentFilters(batch),
      prefix = batch ? "bf" : "f";
    return (
      head(
        "What’s cooking?",
        "Three ideas for one meal — or a few days ahead.",
        "YOUR KITCHEN",
      ) +
      '<section class="panel shared-controls ' +
      (batch ? "batching" : "") +
      '">' +
      '<label class="batch-inline"><span><strong>Batch cook</strong><small>Make extra for the fridge or freezer</small></span><input id="batch-mode" type="checkbox" role="switch" ' +
      (batch ? "checked" : "") +
      ' aria-controls="batch-options"></label>' +
      '<div class="form-grid three">' +
      (batch
        ? field(
            "Days",
            "bf-days",
            quantityInput("bf-days", f.days, 1, 7, "days"),
          )
        : field(
            "Date",
            "f-date",
            '<input id="f-date" type="date" value="' + f.date + '" required>',
          )) +
      `<div class="field meal-choice"><span class="label" id="${prefix}-meal-label">Meal</span><div class="quantity-stepper meal-stepper" role="group" aria-labelledby="${prefix}-meal-label"><button type="button" id="${prefix}-meal-prev" data-act="meal-step" data-step="-1" aria-label="Previous meal">‹</button><span aria-live="polite" aria-atomic="true">${e(f.meal)}</span><button type="button" id="${prefix}-meal-next" data-act="meal-step" data-step="1" aria-label="Next meal">›</button></div></div>` +
      field(
        "People",
        batch ? "bf-people" : "f-servings",
        quantityInput(
          batch ? "bf-people" : "f-servings",
          batch ? f.people : f.servings,
          1,
          batch ? 6 : 12,
          "people",
        ),
      ) +
      "</div>" +
      '<div id="batch-options" ' +
      (batch ? "" : "hidden") +
      ">" +
      (batch
        ? '<div class="inline-batch-options">' +
          field(
            "Meal pattern",
            "bf-style",
            select(
              "bf-style",
              [
                ["repeat", "Repeat meals"],
                ["variety", "Add variety"],
              ],
              f.style,
            ),
          ) +
          '<p class="portion-summary"><strong>' +
          f.people * f.days +
          " portions</strong><span>" +
          f.people +
          (f.people === 1 ? " person × " : " people × ") +
          f.days +
          (f.days === 1 ? " day" : " days") +
          "</span></p></div>"
        : "") +
      "</div>" +
      '<div class="mode-bar">' +
      [
        ["any", "Anything"],
        ["pantry", "Pantry first"],
        ["only", "No shopping"],
      ]
        .map(
          ([v, label]) =>
            '<button class="chip-button ' +
            (f.mode === v ? "selected" : "") +
            '" data-act="mode" data-id="' +
            v +
            '" aria-pressed="' +
            (f.mode === v) +
            '">' +
            label +
            "</button>",
        )
        .join("") +
      "</div>" +
      filterExtras(batch) +
      "</section>" +
      searchBox(batch) +
      results(batch) +
      plannedBatches() +
      (batch
        ? batchHistory() +
          '<details class="panel storage-details"><summary>Storage & reheating guidance</summary>' +
          storageGuide() +
          "</details>"
        : "")
    );
  }
  function plannedBatches() {
    const planned = state.batches.filter((b) => !b.cooked);
    return planned.length
      ? '<section class="batch-planned"><div class="section-bar"><h2 class="section-title">Your planned batches</h2><span class="small-count">' +
          planned.reduce((n, b) => n + b.servings, 0) +
          " portions planned</span></div>" +
          planned.map(batchCard).join("") +
          '<a class="button secondary" href="#shop">Open combined shopping list</a></section>'
      : "";
  }
  function batchHistory() {
    const done = state.batches.filter((b) => b.cooked);
    return done.length
      ? `<details class="panel section-space"><summary>Cooked batch records (${done.length})</summary>${done.map((b) => `<p class="helper"><strong>${e(recipe(b.recipeId).name)}</strong> · ${b.servings} made<br>${b.cookedAt ? e(stamp(b.cookedAt)) : e(day(b.date))}<br>${b.allocation ? `${b.allocation.eat} served immediately · ${b.allocation.fridge} originally refrigerated · ${b.allocation.freezer} originally frozen` : "Original allocation was not recorded by the earlier app version."}</p>`).join("")}</details>`
      : "";
  }
  function batchCard(b) {
    const r = recipe(b.recipeId),
      suggest = C.suggestBatchSize(state, b, R, ingredients());
    return `<article class="plan-card"><span class="plan-emoji" aria-hidden="true">${r.emoji}</span><div class="plan-info"><div class="card-kicker">${e(day(b.date))} · ${b.servings} portions</div><h3>${e(r.name)}</h3><p class="helper">${r.batch.type === "base" ? "Base only; sides are added when you plan stored portions." : "Complete meal, including its topping."}</p><div class="action-wrap">${btn("Recipe", "recipe", r.id)}${btn("Edit batch", "batch-edit", b.id)}${btn("Cooked — store portions", "batch-finish", b.id, "")}</div>${suggest ? `<div class="notice"><span>${amount(suggest.id, suggest.extra)} extra from packs. ${btn("Make " + suggest.servings + " portions", "batch-round", b.id, "ghost")}<small>Optional. All ingredients will scale; other purchases may increase.</small></span></div>` : ""}<button class="text-btn" data-act="batch-remove" data-id="${b.id}">Remove planned batch</button></div></article>`;
  }
  function planCard(p) {
    const r = recipe(p.recipeId),
      stored = p.kind === "stored",
      l = stored ? state.lots.find((x) => x.id === p.lotId) : null,
      unsafe = l && C.expired(l, R),
      conflict =
        !C.foodAllowed(r, state.prefs) ||
        C.sideIngredients(p.side, p.servings).some((i) =>
          state.prefs.exclusions.includes(i.id),
        );
    return `<article class="plan-card ${p.cooked ? "done" : ""}"><span class="plan-emoji" aria-hidden="true">${r.emoji}</span><div class="plan-info"><div class="card-kicker">${e(p.meal)} · ${p.servings} portions${p.cooked ? " · Finished" : stored ? " · From " + e(l?.location || "stored batch") : " · Cook fresh"}</div><h3>${e(r.name)}</h3>${stored ? `<p class="helper">${p.side === "none" ? "No additional side" : e(p.side) + " added separately"} · ${e(p.serveTime || C.mealTimes[p.meal])}</p>` : ""}${conflict ? '<p class="storage-alert">Conflicts with current food preferences. Review before cooking.</p>' : ""}${unsafe ? '<p class="storage-alert">Past the recorded storage deadline. Do not eat.</p>' : ""}${stored && !p.cooked && l?.location === "freezer" ? '<p class="helper">Move just these portions to the fridge in time to defrost fully.</p>' : ""}<div class="action-wrap">${btn("Recipe", "recipe", r.id)}${!p.cooked ? (stored && l?.location === "freezer" ? btn("Start defrosting", "thaw-plan", p.id) : stored && l?.location === "thawing" ? btn("Fully defrosted", "defrosted", l.id) : btn(stored ? "Eaten" : "Cooked", "plan-finish", p.id, "")) + (!stored ? btn("Change portions", "plan-edit", p.id) : "") : ""}</div><button class="text-btn" data-act="plan-remove" data-id="${p.id}">${p.cooked ? "Remove record" : "Remove from plan"}</button></div></article>`;
  }
  function planPage() {
    const pending = state.plans
        .filter((p) => !p.cooked)
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            a.serveTime.localeCompare(b.serveTime),
        ),
      done = state.plans.filter((p) => p.cooked),
      batches = state.batches.filter((b) => !b.cooked);
    let last = "";
    return (
      head(
        "Your week, organised.",
        "Fresh meals, batch cooking and prepared portions in one place.",
        "YOUR PLAN",
      ) +
      `<div class="action-wrap page-actions"><a class="button" href="#choose">Add a meal</a><a class="button secondary" href="#batch">Plan a batch</a>${btn("Use stored portions", "show-prepared")}</div>${batches.length ? `<h2 class="section-title section-space">Batch cooking days</h2>${batches.map(batchCard).join("")}` : ""}${
        pending.length
          ? pending
              .map((p) => {
                const h =
                  last !== p.date
                    ? `<h2 class="plan-date">${e(day(p.date))}</h2>`
                    : "";
                last = p.date;
                return h + planCard(p);
              })
              .join("")
          : empty(
              "No meals scheduled yet",
              "Add a fresh meal, or cook a batch and schedule its stored portions.",
            )
      }${done.length ? `<details class="details-box"><summary>Finished meals (${done.length})</summary>${done.map(planCard).join("")}</details>` : ""}`
    );
  }
  function shopSelector() {
    return `<section class="panel shop-controls"><div class="form-grid two">${field(
      "Shopping at",
      "shop-select",
      select(
        "shop-select",
        C.shops.map((s) => [s, s === "none" ? "No preference" : s]),
        C.activeShop(state),
      ),
    )}${field(
      "Amounts to buy",
      "pack-mode",
      select(
        "pack-mode",
        [
          ["exact", "Exact recipe amounts"],
          ["packs", "Round up to packs"],
        ],
        state.packMode,
      ),
    )}</div><label class="check-label"><input id="shop-trip" type="checkbox" ${state.tripShop ? "checked" : ""}>Use a different shop for this trip</label><p class="helper">Usual shop: ${e(state.shop === "none" ? "No preference" : state.shop)}. ${state.tripShop ? "Untick to return to your usual shop." : "Changes to Shopping at save your usual choice."}</p><p class="helper">${C.activeShop(state) === "none" ? "Choose exact quantities or editable common-pack estimates." : "Pack sizes are saved separately for " + e(C.activeShop(state)) + "."} Exact recipe amounts includes loose / exact-weight purchasing. No live retailer catalogue, prices or stock. Unedited pack sizes are generic estimates, not verified shop sizes.</p></section>`;
  }
  function shoppingRow(i) {
    const p = C.purchase(state, i.id, i.remaining, ingredients());
    return `<div class="shopping-row ${i.checked ? "checked" : ""}"><button class="check-button ${i.checked ? "checked" : ""}" data-act="bought" data-id="${i.id}" aria-label="${i.checked ? "Unmark" : "Mark"} ${e(ing(i.id).name)} as bought" aria-pressed="${i.checked}">${i.checked ? icon("check") : ""}</button><div class="shopping-name"><span>${e(ing(i.id).name)}</span><small>Need ${amount(i.id, i.qty)}${i.have > 0 && i.have !== Infinity ? " · " + amount(i.id, i.have) + " in pantry" : ""}</small>${i.bought > 0 ? `<small>${amount(i.id, i.bought)} bought${i.bought > i.need ? " · " + amount(i.id, i.bought - i.need) + " extra" : ""}</small>` : ""}<small>Additional needed: ${amount(i.id, i.need)} · Still to buy: ${amount(i.id, i.remaining)}</small>${p.pack && i.remaining > 0 ? `<small>${e(p.pack.basis)} · ${p.count} × ${amount(i.id, p.pack.size)}${p.extra > 0 ? " · " + amount(i.id, p.extra) + " extra" : ""}</small>` : ""}<div class="row-links"><button class="text-btn" data-act="pack-edit" data-id="${i.id}">Pack size / exact weight</button>${i.bought > 0 ? `<button class="text-btn" data-act="purchase-edit" data-id="${i.id}">Edit bought amount</button>` : ""}</div></div><strong class="shopping-qty">${i.remaining > 0 ? amount(i.id, p.qty) : "Bought"}</strong></div>`;
  }
  function shopPage() {
    const rows = C.shopping(state, R),
      need = rows.filter((i) => !i.covered),
      have = rows.filter((i) => i.covered),
      purchased = Object.entries(state.bought).filter(([, q]) => q > 0),
      orphan = purchased.filter(([id]) => !rows.some((i) => i.id === id));
    const groups = [...new Set(need.map((i) => ing(i.id).group))].sort();
    return (
      head(
        "A shorter shopping list.",
        "Ingredients counted once, with pantry stock taken off first.",
        "SHOPPING",
      ) +
      shopSelector() +
      `<div class="action-wrap page-actions">${btn("Copy list", "copy-list")}${purchased.length ? btn("Put bought items in pantry", "stock-bought", "", "") : ""}</div>${
        rows.length
          ? `<div class="list-layout"><section class="panel"><div class="section-bar"><h2 class="section-title">To buy</h2><span class="small-count">${need.filter((i) => i.remaining > 0).length} left</span></div>${
              need.length
                ? groups
                    .map(
                      (g) =>
                        `<h3 class="group-title">${e(g)}</h3>${need
                          .filter((i) => ing(i.id).group === g)
                          .map(shoppingRow)
                          .join("")}`,
                    )
                    .join("")
                : '<p class="helper">Everything is covered by your recorded pantry.</p>'
            }</section><aside class="panel"><h2 class="section-title">Already have</h2>${have.map((i) => `<div class="shopping-row"><span class="check-button covered">${icon("check")}</span><div class="shopping-name">${e(ing(i.id).name)}<small>${amount(i.id, i.qty)} needed${i.have === Infinity ? " · assumed always stocked" : ""}</small></div></div>`).join("") || '<p class="helper">No fully covered ingredients yet.</p>'}<a class="button ghost wide" href="#pantry">Check pantry</a></aside></div>`
          : empty(
              "Your list starts with a plan.",
              "Choose a meal or batch recipe and its ingredients appear here.",
              '<a class="button" href="#batch">Find a batch recipe</a>',
            )
      }${orphan.length ? `<section class="panel section-space"><h2 class="section-title">Purchases from a changed plan</h2>${orphan.map(([id, q]) => `<div class="shopping-row"><span class="shopping-name">${e(ing(id).name)} · ${amount(id, q)}</span>${btn("Edit", "purchase-edit", id)}</div>`).join("")}</section>` : ""}${purchaseHistory()}${purchased.length ? '<p class="helper">Bought amounts are fixed when ticked. Changing shops or portions does not change previous purchases. Moving them to pantry includes the whole purchased amount.</p>' : ""}`
    );
  }
  function storageGuide() {
    return `<div class="storage-copy"><p>Divide cooked food into small portions. Cool and refrigerate or freeze within 1–2 hours. Keep the fridge at 0–5°C and freezer around −18°C.</p><p>Use refrigerated leftovers within 48 hours, or freeze promptly. Rice has a shorter limit: cool within one hour and use refrigerated rice within 24 hours.</p><p>Defrost in the fridge. Record when fully defrosted and use within 24 hours. Reheat only once, until steaming hot throughout. Follow packet and appliance instructions.</p><p>Recorded dates are reminders, not proof that food is safe. This app cannot check how food was cooled or stored. Freezer quality periods will be added with sourced recipes; no guaranteed shelf life is assigned here.</p><p><a href="${globalThis.PLATES_STORAGE_GUIDE}" target="_blank" rel="noopener noreferrer">UK storage guidance</a> · <a href="https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/storing-and-reheating-food/" target="_blank" rel="noopener noreferrer">Rice guidance</a></p></div>`;
  }
  function purchaseHistory() {
    const rows = (state.purchaseHistory || []).slice().reverse();
    return rows.length
      ? '<details class="panel section-space"><summary>Purchase history (' +
          rows.length +
          ")</summary>" +
          rows
            .map(
              (p) =>
                '<p class="helper">' +
                e(ing(p.ingredientId).name) +
                " · " +
                amount(p.ingredientId, p.qty) +
                " · " +
                e(p.retailer === "none" ? "No preference" : p.retailer) +
                " · " +
                e(p.status) +
                "<br>" +
                e(stamp(p.purchasedAt)) +
                (p.pack
                  ? " · Pack: " +
                    amount(p.ingredientId, p.pack.size) +
                    " · " +
                    e(p.pack.provenance)
                  : " · Exact / manually entered amount") +
                "</p>",
            )
            .join("") +
          "</details>"
      : "";
  }
  function lotCorrectionModal(id, discard) {
    const l = state.lots.find((x) => x.id === id);
    modal(
      discard ? "Discard portions" : "Correct portion record",
      '<form id="' +
        (discard ? "lot-discard-form" : "lot-correction-form") +
        '" data-id="' +
        id +
        '">' +
        field(
          discard ? "Portions to discard" : "Portions remaining",
          "lot-count",
          numInput(
            "lot-count",
            discard ? 1 : l.portions,
            discard ? 1 : 0,
            discard ? C.lotAvailable(state, l) : l.capacity - l.consumed,
          ),
        ) +
        (discard
          ? ""
          : field(
              "Actual cooking time (same or earlier)",
              "lot-cooked-at",
              '<input id="lot-cooked-at" type="datetime-local" step="1" value="' +
                localTime(l.cookedAt) +
                '" max="' +
                localTime(l.cookedAt) +
                '" required>',
            )) +
        '<p class="helper">Cancel reserved meals before reducing their portions. Corrections never deduct ingredients again, restore eaten portions, or extend a storage deadline. To undo a mistaken discard, restore only food you still physically have.</p><button class="button wide" type="submit">Save record</button></form>',
    );
  }
  function lotCard(l) {
    const r = recipe(l.recipeId),
      free = C.lotAvailable(state, l),
      reserved = C.reserved(state, l.id),
      deadline = C.expiry(l, R),
      expired = C.expired(l, R);
    return `<article class="panel prepared-card"><div class="prepared-heading"><span class="plan-emoji" aria-hidden="true">${r.emoji}</span><div><div class="card-kicker">${e(l.location === "thawed" ? "Defrosted · fridge" : l.location === "thawing" ? "Defrosting in fridge" : l.location)}</div><h3>${e(r.name)}</h3></div><strong class="portion-count">${l.portions}<small>portions</small></strong></div><p class="helper">${free} unallocated · ${reserved} planned<br>Cooked ${e(stamp(l.cookedAt))}${l.frozenAt ? "<br>Frozen " + e(stamp(l.frozenAt)) : ""}</p>${l.thawStartedAt ? '<p class="helper">Defrosting started ' + e(stamp(l.thawStartedAt)) + (l.thawedAt ? "<br>Fully defrosted " + e(stamp(l.thawedAt)) : "") + "</p>" : ""}${deadline ? `<p class="${expired ? "storage-alert" : "deadline"}">${expired ? "Past storage limit" : "Use by"}: ${e(stamp(deadline))}</p>` : l.location === "freezer" ? '<p class="helper">Freeze in separate portions. Schedule only what you need to thaw.</p>' : '<p class="deadline">Check thawing progress. Record the actual time fully defrosted; the 24-hour limit starts then, not when you press the button.</p>'}<div class="action-wrap">${free && !expired ? btn("Plan portions", "lot-plan", l.id, "") : ""}${l.location === "fridge" && !expired ? btn("Freeze these portions", "freeze-lot", l.id) : ""}${l.location === "thawing" ? btn("Fully defrosted", "defrosted", l.id) : ""}${btn("Recipe", "recipe", r.id)}${btn("Correct record", "lot-correct", l.id)}${free ? btn("Discard some", "lot-discard-some", l.id) : ""}</div><button class="text-btn" data-act="discard-lot" data-id="${l.id}">Discard remaining portions</button></article>`;
  }
  function pantryPage() {
    const prepared = state.lots.filter((l) => l.portions > 0),
      stock = [...state.pantry].sort((a, b) =>
        ing(a.id).name.localeCompare(ing(b.id).name),
      );
    return (
      head(
        "What you already have.",
        "Ingredients in the cupboard. Meals ready for another day.",
        "PANTRY",
      ) +
      `<div class="mode-bar pantry-tabs" role="group" aria-label="Pantry view">${[
        ["ingredients", "Ingredients"],
        ["prepared", "Prepared meals"],
      ]
        .map(
          ([id, t]) =>
            `<button class="chip-button ${pantryTab === id ? "selected" : ""}" data-act="pantry-tab" data-id="${id}" aria-pressed="${pantryTab === id}">${t}${id === "prepared" ? " (" + prepared.reduce((s, l) => s + l.portions, 0) + ")" : ""}</button>`,
        )
        .join("")}</div>${
        pantryTab === "prepared"
          ? `${
              prepared.length
                ? `<div class="prepared-grid">${prepared
                    .sort(
                      (a, b) =>
                        (C.expiry(a, R) || Infinity) -
                        (C.expiry(b, R) || Infinity),
                    )
                    .map(lotCard)
                    .join("")}</div>`
                : empty(
                    "Your ready-made meals live here.",
                    "Mark a batch cooked, then split its portions between eat now, fridge and freezer.",
                    '<a href="#batch" class="button">Plan a batch</a>',
                  )
            }<details class="panel storage-details"><summary>Empty portion records</summary>${
              state.lots
                .filter((l) => l.portions === 0)
                .map(lotCard)
                .join("") || "No empty records."
            }</details><details class="panel storage-details"><summary>Storage & reheating guide</summary>${storageGuide()}</details>`
          : `<div class="page-actions">${btn(icon("plus") + " Add an ingredient", "pantry-add", "", "")}</div><section class="panel">${stock.length ? stock.map((p) => `<div class="pantry-item"><div class="item-name">${e(ing(p.id).name)}<small>${p.id.startsWith("custom-") ? "Custom item · not matched to recipes" : p.always ? "Assumed sufficient for every meal" : ""}</small></div><span class="quantity-pill">${p.always ? "Always stocked" : amount(p.id, p.qty)}</span>${btn("Edit", "pantry-edit", p.id, "ghost")}<button class="icon-btn" data-act="pantry-remove" data-id="${p.id}" aria-label="Remove ${e(ing(p.id).name)}">${icon("close")}</button></div>`).join("") : '<p class="helper">Start with rice, pasta, tins and oil. We do not assume any ingredients are stocked.</p>'}</section>`
      }`
    );
  }
  const groups = {
    "group-chicken": {
      name: "Chicken — all cuts",
      ids: ["chicken", "chicken-thigh"],
    },
    "group-beef": { name: "Beef — all cuts", ids: ["beef", "beef-mince"] },
    "group-fish": { name: "Fish & seafood", ids: ["salmon", "tuna", "prawns"] },
    "group-pork": {
      name: "Pork — including sausages",
      ids: ["pork", "sausages"],
    },
  };
  function preferenceSection(key, title) {
    return `<section class="panel"><h2 class="section-title">${title}</h2><form class="pref-form" data-key="${key}"><label class="sr-only" for="pref-${key}">${title}</label>${select(
      "pref-" + key,
      [
        ["", "Choose an ingredient"],
        ...Object.entries(groups).map(([id, g]) => [id, g.name]),
        ...Object.values(I)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((i) => [i.id, i.name]),
      ],
      "",
    )}<button class="button" type="submit">Add</button></form><div class="chip-wrap">${state.prefs[key].map((id) => `<button class="chip ${key === "exclusions" ? "excluded" : ""}" data-act="pref-remove" data-key="${key}" data-id="${e(id)}">${e(ing(id)?.name)} ${icon("close")}<span class="sr-only">Remove</span></button>`).join("") || '<span class="small-count">None added.</span>'}</div></section>`;
  }
  function settingsPage() {
    return (
      head(
        "Make it your kind of food.",
        "Preferences are saved on this device, not in GitHub.",
        "SETTINGS",
      ) +
      `<div class="list-layout"><div class="stack"><section class="panel"><h2 class="section-title">Food preferences</h2><div class="section-space">${field(
        "Eating style",
        "diet",
        select(
          "diet",
          [
            ["any", "No particular diet"],
            ["vegetarian", "Vegetarian"],
            ["vegan", "Vegan"],
            ["pescatarian", "Pescatarian"],
          ],
          state.prefs.diet,
        ),
      )}</div><label class="check-label"><input id="slow-cooker" type="checkbox" ${state.prefs.slowCooker ? "checked" : ""}> I have a slow cooker</label><p class="helper">Only controls the appliance, not oven or hob slow cooking. Food filters are not a validated allergy checker; check ingredients and labels.</p></section>${preferenceSection("exclusions", "Foods you avoid")}${preferenceSection("likedIngredients", "Favourite ingredients")}<section class="panel"><h2 class="section-title">Preferred cuisines</h2><div class="chip-wrap">${[
        ...new Set(R.map((r) => r.cuisine)),
      ]
        .sort()
        .map(
          (c) =>
            `<button class="chip-button ${state.prefs.cuisines.includes(c) ? "selected" : ""}" data-act="cuisine" data-id="${e(c)}" aria-pressed="${state.prefs.cuisines.includes(c)}">${e(c)}</button>`,
        )
        .join(
          "",
        )}</div></section></div><div class="stack"><section class="panel"><h2 class="section-title">Saved & hidden recipes</h2><details class="details-box"><summary>Favourite recipes (${state.prefs.favourites.length})</summary>${state.prefs.favourites.map((id) => `<div class="favourite-row">${btn(e(recipe(id).name), "recipe", id, "ghost")}${btn("Unsave", "favourite", id, "ghost")}</div>`).join("") || '<p class="helper">Tap a recipe heart to save it.</p>'}</details><details class="details-box"><summary>Hidden recipes (${state.prefs.hidden.length})</summary>${state.prefs.hidden.map((id) => `<div class="favourite-row"><span>${e(recipe(id).name)}</span>${btn("Restore", "unhide", id, "ghost")}</div>`).join("") || '<p class="helper">Refreshing choices never hides a recipe permanently.</p>'}</details></section><section class="panel"><h2 class="section-title">Back up your data</h2><p class="helper">Pantry, batches, portions, shopping and preferences stay in this browser. Clearing browser data removes them. Export a backup regularly; there is no account or cloud sync.</p><div class="action-wrap">${btn("Export backup", "export")}${btn("Restore backup", "import")}</div><input type="file" id="backup-file" accept="application/json,.json" hidden><p class="helper">Version 1 backups are supported. The original v1 browser data is left untouched during upgrade.</p></section><section class="panel"><h2 class="section-title">About this version</h2><p class="helper">v3 · Batch planning, portion tracking, pack estimates and recipe search. 72 linked publisher recipes cover everyday meals, meal prep, desserts and baking. Selection considers technique, variety, clear quantities and publisher evidence alongside ratings, checked 28 September 2026. Original examples remain available and are marked unrated. Publisher methods open on their website; planning estimates are labelled. Timings are estimates. Scaling portions does not scale cooking time or guarantee appliance capacity.</p><details class="details-box"><summary>Storage guidance</summary>${storageGuide()}</details><button class="text-btn" data-act="reset">Delete all local app data</button></section></div></div>`
    );
  }
  function close() {
    sheet.close();
  }
  function modal(title, body) {
    sheet.innerHTML = `<div class="sheet-top"><button class="icon-btn sheet-close" data-act="close" aria-label="Close">${icon("close")}</button><h2 id="sheet-title">${title}</h2></div><div class="sheet-content">${body}</div>`;
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
  }
  function recipeModal(id) {
    const r = recipe(id);
    if (!r) return;
    const asBatch = !!r.batch && (!r.source || route === "batch");
    const portionLimit = asBatch || r.baking ? 48 : 12;
    const n = asBatch
      ? Math.min(48, state.batchFilters.people * state.batchFilters.days)
      : r.baking
        ? r.base
        : state.filters.servings;
    modal(
      e(r.name),
      `<p class="meta-row">${e(method(r))} · ${prepLabel(r)} · ${duration(r.total)} ${r.additionalTime ? "prep/cook + extra time" : "total"} (base recipe)</p>${asBatch && !r.source ? `<p>${e(r.batch.note)}</p>` : ""}${recipeTags(r)}${r.baking ? `<p class="helper">Full recipe makes ${r.base} pieces/portions. Baking starts at the full recipe yield; changing quantities may require different tins and baking times.</p>` : ""}<label class="label" for="recipe-portions">${r.baking ? "Pieces / portions to bake" : "Ingredient portions"}</label>${numInput("recipe-portions", n, 1, portionLimit)}<div id="recipe-amounts">${ingredientList(r, n)}</div>${r.source ? `${recipeSource(r, true)}<a class="button wide section-space" href="${e(r.source.url)}" target="_blank" rel="noopener noreferrer">Read cooking method at ${e(r.source.publisher)} ↗</a><p class="helper">The full method stays with the publisher. An internet connection is needed to read it.</p>` : `<h3 class="section-space">Method</h3><ol class="method-list">${r.steps.map((s) => `<li>${e(s)}</li>`).join("")}</ol>`}${r.batch ? `<details class="details-box"><summary>Storage & reheating</summary>${storageGuide()}</details>` : ""}<div class="notice">${r.source ? "Publisher recipe; planning quantities have not been kitchen-tested by Three Plates." : "Example recipe, not independently kitchen-tested."} Ingredients scale; cooking times and appliance capacity do not. Check doneness and food labels.</div>${btn(asBatch ? "Plan batch" : r.baking ? "Plan bake" : "Add to plan", asBatch ? "batch-add" : "plan-add", r.id, "")}`,
    );
    document
      .getElementById("recipe-portions")
      .addEventListener("change", (ev) => {
        const n = +ev.target.value;
        if (C.integer(n, 1, portionLimit))
          document.getElementById("recipe-amounts").innerHTML = ingredientList(
            r,
            n,
          );
      });
  }
  function ingredientList(r, n) {
    return C.scaled(r, n)
      .map(
        (i) =>
          `<div class="ingredient-line"><span>${e(ing(i.id).name)}</span><strong>${amount(i.id, i.qty)}</strong></div>`,
      )
      .join("");
  }
  function batchModal(id, edit = false) {
    const b = edit ? state.batches.find((b) => b.id === id) : null,
      r = recipe(b ? b.recipeId : id),
      f = state.batchFilters,
      remaining =
        f.people * f.days -
        state.batches
          .filter((b) => !b.cooked)
          .reduce((a, b) => a + b.servings, 0);
    const chosen = sheet.open && document.getElementById("recipe-portions");
    const n =
      b?.servings ||
      (chosen && C.integer(+chosen.value)
        ? +chosen.value
        : C.batchPortions(state));
    modal(
      edit ? "Edit batch" : "Plan a batch",
      `<h3>${e(r.name)}</h3><form id="batch-form" data-recipe="${r.id}" data-id="${b?.id || ""}"><div class="form-grid two">${field("Portions", "batch-portions", numInput("batch-portions", n))}${field("Cooking date", "batch-date", `<input id="batch-date" type="date" value="${b?.date || C.today()}" min="${C.today()}" required>`)}</div><p class="helper">${e(r.batch.note)} All ingredients scale together. Check your pan, oven or slow-cooker capacity; split large batches into separate cooking runs.</p><details class="details-box"><summary>Ingredients for this batch</summary><div id="batch-amounts">${ingredientList(r, n)}</div></details><button class="button wide section-space" type="submit">${edit ? "Save batch" : "Add batch & shopping ingredients"}</button></form>`,
    );
    document
      .getElementById("batch-portions")
      .addEventListener("change", (ev) => {
        if (C.integer(+ev.target.value))
          document.getElementById("batch-amounts").innerHTML = ingredientList(
            r,
            +ev.target.value,
          );
      });
  }
  function finishBatchModal(id) {
    const b = state.batches.find((b) => b.id === id && !b.cooked);
    if (!b) return;
    modal(
      "Store your batch",
      `<h3>${e(recipe(b.recipeId).name)}</h3><p>${b.servings} portions in total. Divide into small, separate containers.</p><form id="finish-batch-form" data-id="${id}"><div class="form-grid three">${field("Eat now", "eat-now", numInput("eat-now", 0, 0, b.servings))}${field("Refrigerate", "fridge-qty", numInput("fridge-qty", 0, 0, b.servings))}${field("Freeze", "freezer-qty", numInput("freezer-qty", b.servings, 0, b.servings))}</div><div class="section-space">${field("Finished cooking at", "cooked-at", `<input id="cooked-at" type="datetime-local" step="1" value="${localTime()}" max="${localTime()}" required>`)}</div><p class="helper">Store promptly: cool, then refrigerate or freeze within 1–2 hours. This first version only logs stored batches within two hours of cooking; it cannot assess old leftovers.</p><label class="check-label"><input id="freezer-confirm" type="checkbox">If freezing, I checked freezing instructions for the recipe I actually cooked. This example’s suitability is unknown.</label><label class="check-label"><input id="storage-confirm" type="checkbox" required>I confirm stored portions were cooled and promptly refrigerated or frozen.</label><p class="helper">Uses recorded purchases and deducts ingredients once. Already reheated food should not be stored for another reheat.</p><button class="button wide" type="submit">Record cooked batch</button></form>`,
    );
  }
  function planLotModal(id) {
    const l = state.lots.find((x) => x.id === id),
      f = state.batchFilters,
      free = C.lotAvailable(state, l),
      r = recipe(l.recipeId),
      per = Math.min(f.people, free);
    modal(
      "Plan stored portions",
      `<h3>${e(r.name)}</h3><p>${free} unallocated portions · ${e(l.location)}</p><form id="lot-plan-form" data-id="${id}"><div class="form-grid two">${field("First day", "lot-date", `<input id="lot-date" type="date" min="${C.today()}" value="${C.today()}" required>`)}${field("Meal", "lot-meal", select("lot-meal", C.meals, f.meal))}${field("Serving time", "lot-time", `<input id="lot-time" type="time" value="${C.mealTimes[f.meal]}" required>`)}${field("Portions per meal", "lot-servings", numInput("lot-servings", per, 1, Math.min(12, free)))}${field("Consecutive days", "lot-days", numInput("lot-days", 1, 1, Math.min(7, Math.floor(free / per))))}${field(
        "Additional side",
        "lot-side",
        select(
          "lot-side",
          [
            ["none", "No side"],
            ["rice", "Rice — 75g dry / person"],
            ["pasta", "Pasta — 90g dry / person"],
            ["bread", "Bread — 2 slices / person"],
            ["wraps", "Wraps — 2 / person"],
          ],
          "none",
        ),
      )}</div><p class="helper">These portions do not buy ingredients again. Only an optional side adds shopping. Fridge deadlines are checked against the selected serving time; frozen meals need time to defrost.</p><button class="button wide" type="submit">Add to meal plan</button></form>`,
    );
  }
  function defrostModal(id) {
    modal(
      "Fully defrosted",
      `<form id="defrost-form" data-id="${id}">${field("Actual time fully defrosted", "thawed-at", `<input id="thawed-at" type="datetime-local" step="1" value="${localTime()}" max="${localTime()}" required>`)}<p class="helper">Enter when the food actually finished defrosting in the fridge, not just when you opened the app. Use within 24 hours of that time. Do not use this form to extend an old deadline.</p><button class="button wide" type="submit">Record defrosting time</button></form>`,
    );
  }
  function packModal(id) {
    const p = C.packFor(state, id),
      override = state.packs[C.activeShop(state)]?.[id];
    modal(
      "Pack size or exact weight",
      `<h3>${e(ing(id).name)}</h3><p class="helper">Saved for ${e(state.shop === "none" ? "No preference" : state.shop)}. This is your entered size, not a verified retailer listing.</p><form id="pack-form" data-id="${id}">${field("Amount in one pack (" + e(ing(id).unit) + ")", "pack-size", `<input id="pack-size" type="number" inputmode="decimal" min="0.001" max="1000000" step="any" value="${p?.size || ""}">`)}<label class="check-label"><input type="checkbox" id="pack-exact" ${override?.size === 0 ? "checked" : ""}>Buy exact weight / loose / butcher</label><p class="helper">For drained tinned foods, enter the drained usable weight on the label. Count ingredients use individual slices, cloves, eggs or wraps, not loaves, bulbs or packs.</p>${field("Product / variant (optional)", "pack-product", `<input id="pack-product" maxlength="300" value="${e(override?.product || "")}">`)}${field("Product source URL (optional)", "pack-url", `<input id="pack-url" type="url" value="${e(override?.url || "")}">`)}${field("Label checked on (optional)", "pack-verified", `<input id="pack-verified" type="date" value="${e(override?.verifiedOn || "")}">`)}<p class="helper">Match the exact ingredient variant, fresh/frozen form and usable weight; mass and count are not interchangeable. User-entered sources are not independently verified.</p><div class="action-wrap"><button class="button" type="submit">Save</button>${btn("Reset to generic estimate", "pack-reset", id)}</div></form>`,
    );
  }
  function purchaseModal(id) {
    modal(
      "Amount actually bought",
      `<h3>${e(ing(id).name)}</h3><form id="purchase-form" data-id="${id}">${field("Purchased amount (" + e(ing(id).unit) + ")", "purchase-qty", `<input id="purchase-qty" type="number" inputmode="decimal" min="0" max="10000000" step="any" value="${state.bought[id] || 0}" required>`)}<p class="helper">Includes the whole pack. Set zero to remove the purchase record.</p><button class="button wide" type="submit">Save bought amount</button></form>`,
    );
  }
  function pantryModal(id) {
    const p = state.pantry.find((p) => p.id === id),
      i = ing(id);
    modal(
      p ? "Edit pantry ingredient" : "Add pantry ingredient",
      `<form id="pantry-form" data-id="${p?.id || ""}">${field(
        "Ingredient",
        "pantry-name",
        `<input id="pantry-name" type="text" maxlength="80" list="ingredient-options" placeholder="e.g. Rice (dry)" value="${e(i?.name || "")}" required><datalist id="ingredient-options">${Object.values(
          ingredients(),
        )
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((i) => `<option value="${e(i.name)}"></option>`)
          .join("")}</datalist>`,
      )}<div class="form-grid two section-space">${field("Amount available", "pantry-qty", `<input id="pantry-qty" type="number" inputmode="decimal" min="0" max="1000000" step="any" value="${p?.qty || 0}" required>`)}${field("Unit", "pantry-unit", select("pantry-unit", Object.keys(C.units), i?.unit || "g"))}</div><label class="check-label"><input type="checkbox" id="pantry-always" ${p?.always ? "checked" : ""}>Always stocked — assume enough</label><p class="helper">Pick a suggested ingredient to match recipes. Custom items can be recorded but will not match automatically. Saving replaces that item's current amount.</p><button type="submit" class="button wide">Save ingredient</button></form>`,
    );
    document.getElementById("pantry-name").addEventListener("change", (ev) => {
      const found = Object.values(ingredients()).find(
        (i) => C.text(i.name) === C.text(ev.target.value),
      );
      if (found) {
        const unit = document.getElementById("pantry-unit");
        if (C.units[unit.value][0] !== C.units[found.unit][0])
          unit.value = found.unit;
      }
    });
  }
  function addPlan(id) {
    const r = recipe(id),
      f = { ...state.filters };
    const modalPortions =
      sheet.open && document.getElementById("recipe-portions");
    if (r.baking) f.servings = r.base;
    if (modalPortions) {
      if (!C.integer(+modalPortions.value, 1, r.baking ? 48 : 12)) {
        toast(`Choose 1–${r.baking ? 48 : 12} whole portions.`);
        return;
      }
      f.servings = +modalPortions.value;
    }
    if (!C.permitted(r, state.prefs) || !r.meals.includes(f.meal)) {
      toast("This recipe conflicts with your meal slot or preferences.");
      return;
    }
    const existing = state.plans.find(
      (p) => p.date === f.date && p.meal === f.meal,
    );
    if (
      existing &&
      !confirm(
        "Replace the existing meal? This releases reserved portions but does not undo any previous cooking.",
      )
    )
      return;
    if (
      change(
        () => {
          if (existing)
            state.plans = state.plans.filter((p) => p.id !== existing.id);
          state.plans.push({
            id: C.uid(),
            kind: "cook",
            recipeId: id,
            date: f.date,
            meal: f.meal,
            serveTime: C.mealTimes[f.meal],
            servings: f.servings,
            side: "none",
            cooked: false,
          });
        },
        "Meal added to your plan.",
        true,
      )
    )
      close();
  }
  function toggle(key, value) {
    const a = state.prefs[key];
    state.prefs[key] = a.includes(value)
      ? a.filter((x) => x !== value)
      : [...a, value];
  }
  async function copyList() {
    const lines = C.shopping(state, R)
      .filter((i) => i.remaining > 0)
      .map((i) => {
        const p = C.purchase(state, i.id, i.remaining, ingredients());
        return `☐ ${ing(i.id).name}: ${amount(i.id, p.qty)}${p.pack ? " (" + p.count + " × " + amount(i.id, p.pack.size) + "; " + p.pack.basis + ")" : ""}`;
      });
    const text =
      "THREE PLATES — " +
      (state.shop === "none" ? "SHOPPING" : state.shop) +
      "\n" +
      (lines.join("\n") || "Nothing left to buy.");
    try {
      await navigator.clipboard.writeText(text);
      toast("Shopping list copied.");
    } catch (err) {
      modal(
        "Copy your shopping list",
        `<label for="copy-text" class="label">Select and copy</label><textarea id="copy-text" class="text-input" rows="12" readonly>${e(text)}</textarea>`,
      );
      document.getElementById("copy-text").select();
    }
  }
  function exportData() {
    const data = blocked
        ? originalBackup || JSON.stringify(state, null, 2)
        : JSON.stringify(state, null, 2),
      url = URL.createObjectURL(new Blob([data], { type: "application/json" })),
      a = document.createElement("a");
    a.href = url;
    a.download = "three-plates-backup-" + C.today() + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importData(file) {
    if (!file) return;
    try {
      if (file.size > 2e6)
        throw Error("Backup is too large. Use a file below 2 MB.");
      const next = C.migrate(JSON.parse(await file.text()), R, I);
      if (
        !confirm(
          "Replace this device’s data with the backup? Export the current data first to keep a copy.",
        )
      )
        return;
      const old = state;
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch (err) {
        state = old;
        throw Error(
          "The browser could not save the restored data. Nothing was replaced.",
        );
      }
      state = next;
      blocked = false;
      storageError = "";
      clearChoices();
      render();
      toast("Backup restored.");
    } catch (err) {
      toast(err.message || "Invalid backup. Existing data was not changed.");
    }
  }
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act,
      id = b.dataset.id,
      batch = route === "batch",
      key = batch ? "batch" : "choose";
    if (act === "quantity-step") {
      if (b.getAttribute("aria-disabled") === "true") return;
      const input = document.getElementById(b.dataset.target);
      const value = Number(input.value) + Number(b.dataset.step);
      if (!C.integer(value, Number(input.min), Number(input.max))) return;
      input.value = value;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    if (act === "meal-step") {
      const meals = C.meals;
      change(
        () => {
          const filters = batch ? state.batchFilters : state.filters;
          filters.meal =
            meals[
              (meals.indexOf(filters.meal) +
                Number(b.dataset.step) +
                meals.length) %
                meals.length
            ];
        },
        "",
        true,
      );
      return;
    }
    if (act === "recipe-filter") {
      const filter = b.dataset.filter,
        allowed =
          filter === "time" ? times : filter === "method" ? methods : [];
      if (!allowed.some(([value]) => value === id)) return;
      change(
        () => {
          (batch ? state.batchFilters : state.filters)[filter] = id;
        },
        "",
        true,
      );
      return;
    }
    if (act === "lot-correct" || act === "lot-discard-some") {
      lotCorrectionModal(id, act === "lot-discard-some");
      return;
    }
    if (act === "close") {
      close();
      return;
    }
    if (act === "recipe") {
      recipeModal(id);
      return;
    }
    if (act === "refresh") {
      suggestions(batch, true);
      render();
      return;
    }
    if (act === "keep") {
      locked[key] = locked[key].includes(id)
        ? locked[key].filter((x) => x !== id)
        : [...locked[key], id];
      render();
      return;
    }
    if (act === "batch-add" || act === "batch-edit") {
      batchModal(id, act === "batch-edit");
      return;
    }
    if (act === "batch-finish") {
      finishBatchModal(id);
      return;
    }
    if (act === "lot-plan") {
      planLotModal(id);
      return;
    }
    if (act === "defrosted") {
      defrostModal(id);
      return;
    }
    if (act === "pack-edit") {
      packModal(id);
      return;
    }
    if (act === "purchase-edit") {
      purchaseModal(id);
      return;
    }
    if (act === "pantry-add" || act === "pantry-edit") {
      pantryModal(id);
      return;
    }
    if (act === "plan-add") {
      addPlan(id);
      return;
    }
    if (act === "copy-list") {
      copyList();
      return;
    }
    if (act === "export") {
      exportData();
      return;
    }
    if (act === "import") {
      document.getElementById("backup-file").click();
      return;
    }
    if (act === "pantry-tab") {
      pantryTab = id;
      render();
      return;
    }
    if (act === "show-prepared") {
      pantryTab = "prepared";
      go("pantry");
      return;
    }
    if (act === "reset") {
      if (
        confirm(
          "Delete all Three Plates data in this browser, including the old version backup? This cannot be undone.",
        )
      ) {
        try {
          localStorage.removeItem(KEY);
          localStorage.removeItem(OLD);
          blocked = false;
          storageError = "";
          state = C.defaults();
          clearChoices();
          render();
          toast("Local data deleted.");
        } catch (err) {
          toast("The browser did not allow deletion.");
        }
      }
      return;
    }
    if (act === "plan-edit") {
      const p = state.plans.find((p) => p.id === id),
        max = recipe(p.recipeId)?.baking ? 48 : 12,
        n = prompt(`Portions to make (1–${max})`, String(p.servings));
      if (n !== null)
        change(
          () => {
            if (!C.integer(+n, 1, max))
              throw Error(`Choose 1–${max} portions.`);
            p.servings = +n;
          },
          "Portions updated.",
          true,
        );
      return;
    }
    if (
      [
        "hide",
        "batch-remove",
        "plan-remove",
        "pantry-remove",
        "discard-lot",
        "freeze-lot",
        "plan-finish",
        "thaw-plan",
      ].includes(act) &&
      !confirm(
        {
          hide: "Hide this recipe? Restore it later in Settings.",
          "batch-remove":
            "Remove this uncooked batch and its shopping requirements?",
          "plan-remove":
            "Remove this meal from the plan? Finished cooking is not reversed.",
          "pantry-remove": "Remove this pantry ingredient?",
          "discard-lot":
            "Discard all remaining portions in this container and remove their future meals from the plan?",
          "freeze-lot":
            "Freezer suitability for this example is unknown. Have you checked freezing instructions for the recipe you cooked and safely chilled these portions? Existing cooling time is not erased.",
          "plan-finish":
            "Record this meal as finished? Ingredients or stored portions are deducted once. Reheat stored food only once, until steaming hot throughout.",
          "thaw-plan":
            "Move only the portions for this meal from the freezer into the fridge to defrost? Leave other portions frozen.",
        }[act],
      )
    )
      return;
    change(
      () => {
        switch (act) {
          case "mode":
            (batch ? state.batchFilters : state.filters).mode = id;
            break;
          case "favourite":
            toggle("favourites", id);
            break;
          case "cuisine":
            toggle("cuisines", id);
            break;
          case "hide":
            if (!state.prefs.hidden.includes(id)) state.prefs.hidden.push(id);
            break;
          case "unhide":
            state.prefs.hidden = state.prefs.hidden.filter((x) => x !== id);
            break;
          case "pref-remove":
            state.prefs[b.dataset.key] = state.prefs[b.dataset.key].filter(
              (x) => x !== id,
            );
            break;
          case "clear-search":
            (batch ? state.batchFilters : state.filters).query = "";
            break;
          case "reset-filters":
            Object.assign(batch ? state.batchFilters : state.filters, {
              query: "",
              time: "any",
              method: "any",
            });
            break;
          case "batch-remove":
            state.batches = state.batches.filter(
              (x) => x.id !== id || x.cooked,
            );
            break;
          case "batch-round": {
            const batch = state.batches.find((x) => x.id === id),
              s = C.suggestBatchSize(state, batch, R, ingredients());
            if (!s) throw Error("No pack adjustment is currently available.");
            if (
              !confirm(
                `Make ${s.servings} portions? Other ingredient quantities and purchases may increase.`,
              )
            )
              return;
            batch.servings = s.servings;
            break;
          }
          case "plan-remove":
            state.plans = state.plans.filter((p) => p.id !== id);
            break;
          case "pantry-remove":
            state.pantry = state.pantry.filter((p) => p.id !== id);
            break;
          case "plan-finish":
            C.finishPlan(state, id, R);
            break;
          case "thaw-plan":
            C.thawPlan(state, id, R);
            break;
          case "freeze-lot":
            C.changeStorage(state, id, "freeze", R, Date.now(), null, true);
            break;
          case "discard-lot":
            C.discardLot(state, id);
            break;
          case "bought": {
            const row = C.shopping(state, R).find((i) => i.id === id);
            if (row.checked)
              C.recordPurchase(state, id, 0, ingredients(), { replace: true });
            else {
              const p = C.purchase(state, id, row.remaining, ingredients());
              C.recordPurchase(state, id, p.qty, ingredients(), {
                pack: p.pack,
              });
            }
            break;
          }
          case "stock-bought":
            C.transferBought(state);
            break;
          case "pack-reset":
            if (state.packs[C.activeShop(state)])
              delete state.packs[C.activeShop(state)][id];
            close();
            break;
          default:
            throw Error("That action is not available.");
        }
      },
      act === "stock-bought" ? "Purchased amounts added to pantry." : "",
      [
        "mode",
        "hide",
        "unhide",
        "pref-remove",
        "cuisine",
        "clear-search",
        "reset-filters",
      ].includes(act),
    );
  });
  document.addEventListener("change", (ev) => {
    const t = ev.target,
      id = t.id;
    if (id === "batch-mode") {
      route = t.checked ? "batch" : "choose";
      history.replaceState(null, "", "#" + route);
      render();
      return;
    }
    if (id === "backup-file") {
      importData(t.files[0]);
      return;
    }
    if (id === "shop-trip") {
      change(() => {
        state.tripShop = t.checked ? state.shop : null;
      }, "Trip preference updated.");
      return;
    }
    if (id === "shop-select" || id === "pack-mode") {
      change(() => {
        if (id === "shop-select") {
          if (state.tripShop !== null) state.tripShop = t.value;
          else state.shop = t.value;
        } else state.packMode = t.value;
      }, "Shopping preference saved. Existing bought amounts are unchanged.");
      return;
    }
    if (id === "diet" || id === "slow-cooker") {
      change(
        () => {
          if (id === "diet") state.prefs.diet = t.value;
          else state.prefs.slowCooker = t.checked;
        },
        "Preferences saved.",
        true,
      );
      return;
    }
    if (id.startsWith("f-") || id.startsWith("bf-")) {
      const batch = id.startsWith("bf-"),
        field = id.slice(batch ? 3 : 2),
        value = ["people", "days", "servings"].includes(field)
          ? +t.value
          : t.value;
      change(
        () => {
          const max = field === "people" ? 6 : field === "days" ? 7 : 12;
          if (
            ["people", "days", "servings"].includes(field) &&
            !C.integer(value, 1, max)
          )
            throw Error("Check the number entered.");
          if (field === "date" && !C.validDate(value))
            throw Error("Choose a valid date.");
          (batch ? state.batchFilters : state.filters)[field] = value;
        },
        "",
        true,
      );
    }
  });
  document.addEventListener("submit", (ev) => {
    const form = ev.target;
    if (!form.matches("form")) return;
    ev.preventDefault();
    if (form.id === "search-form") {
      change(
        () => {
          (form.dataset.batch === "true"
            ? state.batchFilters
            : state.filters
          ).query = document
            .getElementById("recipe-search")
            .value.trim()
            .slice(0, 100);
        },
        "",
        true,
      );
      return;
    }
    if (form.matches(".pref-form")) {
      const key = form.dataset.key,
        id = document.getElementById("pref-" + key).value,
        ids = groups[id]?.ids || (I[id] ? [id] : []);
      change(
        () => {
          if (!ids.length) throw Error("Choose an ingredient.");
          if (
            key === "likedIngredients" &&
            ids.some((x) => state.prefs.exclusions.includes(x))
          )
            throw Error(
              "Remove that ingredient from foods you avoid before favouriting it.",
            );
          state.prefs[key] = [...new Set([...state.prefs[key], ...ids])];
          if (key === "exclusions")
            state.prefs.likedIngredients = state.prefs.likedIngredients.filter(
              (x) => !ids.includes(x),
            );
        },
        "Preferences saved.",
        true,
      );
      return;
    }
    const value = (id) => document.getElementById(id).value,
      n = (id) => +value(id),
      id = form.dataset.id;
    const ok = change(
      () => {
        switch (form.id) {
          case "lot-correction-form":
            C.correctLot(state, id, n("lot-count"), value("lot-cooked-at"));
            break;
          case "lot-discard-form":
            C.discardPortions(state, id, n("lot-count"));
            break;
          case "batch-form": {
            const portions = n("batch-portions"),
              date = value("batch-date"),
              r = recipe(form.dataset.recipe);
            if (!C.integer(portions) || !C.validDate(date) || date < C.today())
              throw Error("Choose 1–48 portions and a valid cooking date.");
            if (!C.permitted(r, state.prefs))
              throw Error("This recipe conflicts with your preferences.");
            if (id) {
              const b = state.batches.find((b) => b.id === id && !b.cooked);
              if (!b) throw Error("Batch not found.");
              b.servings = portions;
              b.date = date;
            } else
              state.batches.push({
                id: C.uid(),
                recipeId: r.id,
                servings: portions,
                date,
                cooked: false,
              });
            break;
          }
          case "finish-batch-form":
            C.finishBatch(
              state,
              id,
              {
                eat: n("eat-now"),
                fridge: n("fridge-qty"),
                freezer: n("freezer-qty"),
                cookedAt: value("cooked-at"),
                freezerConfirmed:
                  document.getElementById("freezer-confirm").checked,
              },
              R,
            );
            pantryTab = "prepared";
            break;
          case "lot-plan-form":
            C.scheduleLot(
              state,
              id,
              value("lot-date"),
              value("lot-meal"),
              n("lot-servings"),
              n("lot-days"),
              value("lot-side"),
              R,
              Date.now(),
              value("lot-time"),
            );
            break;
          case "defrost-form":
            C.changeStorage(
              state,
              id,
              "defrosted",
              R,
              Date.now(),
              value("thawed-at"),
            );
            break;
          case "pack-form": {
            const exact = document.getElementById("pack-exact").checked,
              size = n("pack-size");
            if (!exact && (!Number.isFinite(size) || size <= 0 || size > 1e6))
              throw Error("Enter a positive pack size.");
            state.packs[C.activeShop(state)] ??= {};
            state.packs[C.activeShop(state)][id] = C.packRecord(
              id,
              C.activeShop(state),
              exact ? 0 : size,
              ingredients(),
              {
                product: value("pack-product"),
                url: value("pack-url"),
                verifiedOn: value("pack-verified"),
              },
            );
            state.packMode = "packs";
            break;
          }
          case "purchase-form": {
            const q = n("purchase-qty");
            if (!Number.isFinite(q) || q < 0 || q > 1e7)
              throw Error("Enter a valid bought amount.");
            C.recordPurchase(state, id, q, ingredients(), { replace: true });
            break;
          }
          case "pantry-form": {
            const name = value("pantry-name").trim(),
              unit = value("pantry-unit"),
              always = document.getElementById("pantry-always").checked;
            let i = Object.values(ingredients()).find(
              (i) =>
                C.text(i.name) === C.text(name) ||
                C.text(i.id) === C.text(name),
            );
            if (!name || name.length > 80)
              throw Error("Enter an ingredient name.");
            if (!i) {
              const customId =
                "custom-" +
                (C.text(name)
                  .replace(/[^a-z0-9]+/g, "-")
                  .slice(0, 55) || C.uid());
              i = {
                id: customId,
                name,
                unit:
                  unit === "kg"
                    ? "g"
                    : unit === "l"
                      ? "ml"
                      : unit === "tbsp"
                        ? "tsp"
                        : unit,
                group: "Other",
              };
              state.custom[customId] = i;
            }
            const qty = always ? 0 : C.convert(n("pantry-qty"), unit, i.unit);
            if (qty < 0 || qty > 1e7) throw Error("Check the quantity.");
            if (id && id !== i.id)
              state.pantry = state.pantry.filter((p) => p.id !== id);
            state.pantry = state.pantry.filter((p) => p.id !== i.id);
            state.pantry.push({ id: i.id, qty, always });
            break;
          }
          default:
            throw Error("Form not recognised.");
        }
      },
      "Saved.",
      true,
    );
    if (ok) {
      close();
      if (form.id === "finish-batch-form") go("pantry");
      if (form.id === "lot-plan-form") go("plan");
    }
  });
  window.addEventListener("hashchange", () => {
    route = location.hash.slice(1) || "choose";
    close();
    render();
    window.scrollTo(0, 0);
  });
  window.addEventListener("storage", (ev) => {
    if (ev.key === KEY) {
      originalBackup = ev.newValue || "";
      storageError =
        "This app changed in another tab. Reload to use the latest saved data; saving is paused to avoid overwriting it.";
      blocked = true;
      render();
    }
  });
  render();
  if (migrated)
    toast("Your existing pantry, preferences and plan have been upgraded.");
})();
