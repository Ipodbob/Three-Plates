/* Combined ingredient preparation. Checks never change stock or cooking status. */
(function (root) {
  "use strict";
  const C = root.PlatesCore,
    original = { defaults: C.defaults, migrate: C.migrate };
  const refOK = (x) =>
    typeof x === "string" && /^(plan|batch):[a-zA-Z0-9_-]{1,80}$/.test(x);
  const blank = () => ({ selected: [], checked: [] });
  C.defaults = () => ({ ...original.defaults(), prep: blank() });
  C.migrate = (raw, recipes, ingredients) => {
    const s = original.migrate(raw, recipes, ingredients),
      p = raw.prep;
    s.prep = blank();
    if (p === undefined) return s;
    if (
      !p ||
      !Array.isArray(p.selected) ||
      p.selected.length > 20 ||
      p.selected.some((x) => !refOK(x)) ||
      new Set(p.selected).size !== p.selected.length ||
      !Array.isArray(p.checked) ||
      p.checked.some(
        (x) =>
          !x ||
          typeof x.id !== "string" ||
          !Object.hasOwn(ingredients, x.id) ||
          typeof x.signature !== "string" ||
          x.signature.length > 100000,
      ) ||
      new Set(p.checked.map((x) => x.id)).size !== p.checked.length
    )
      throw Error(
        "Invalid saved prep checklist. Original data has not been replaced.",
      );
    s.prep = {
      selected: [...p.selected],
      checked: p.checked.map((x) => ({ id: x.id, signature: x.signature })),
    };
    return s;
  };
  C.prepOptions = (s, recipes) =>
    [
      ...s.plans
        .filter((p) => !p.cooked)
        .map((p) => ({ kind: "plan", record: p })),
      ...s.batches
        .filter((p) => !p.cooked)
        .map((p) => ({ kind: "batch", record: p })),
    ]
      .map(({ kind, record }) => ({
        ref: kind + ":" + record.id,
        kind,
        record,
        recipe: recipes.find((r) => r.id === record.recipeId),
      }))
      .filter((x) => x.recipe)
      .sort(
        (a, b) =>
          a.record.date.localeCompare(b.record.date) ||
          a.recipe.name.localeCompare(b.recipe.name),
      );
  C.prepView = (s, recipes) => {
    const p = s.prep || blank(),
      options = C.prepOptions(s, recipes),
      chosen = [],
      missing = [],
      rows = new Map();
    for (const ref of [...p.selected].sort()) {
      const option = options.find((x) => x.ref === ref);
      if (!option) {
        missing.push(ref);
        continue;
      }
      const view = C.cookingView(s, option.kind, option.record.id, recipes);
      chosen.push({ ...option, view });
      for (const [groupIndex, g] of view.groups.entries())
        for (const i of g.ingredients) {
          let row = rows.get(i.id);
          if (!row) {
            row = { id: i.id, qty: 0, parts: [] };
            rows.set(i.id, row);
          }
          row.qty = C.round(row.qty + i.qty);
          row.parts.push({
            ref,
            recipeId: option.recipe.id,
            groupIndex,
            key: i.key,
            name: g.name,
            date: option.record.date,
            meal: option.kind === "batch" ? "Batch" : option.record.meal,
            qty: i.qty,
          });
        }
    }
    const items = [...rows.values()].map((r) => {
      const signature = JSON.stringify(
        r.parts.map((p) => [p.ref, p.recipeId, p.groupIndex, p.key, p.qty]),
      );
      return {
        ...r,
        signature,
        checked: p.checked.some(
          (x) => x.id === r.id && x.signature === signature,
        ),
      };
    });
    const outdated = p.checked.filter(
      (x) => !items.some((i) => i.id === x.id && i.signature === x.signature),
    ).length;
    chosen.sort(
      (a, b) =>
        a.record.date.localeCompare(b.record.date) ||
        a.recipe.name.localeCompare(b.recipe.name),
    );
    const unmeasured = chosen.flatMap((x) =>
      x.view.groups.flatMap((g) =>
        (g.unmeasured || []).map((i) => ({
          ...i,
          recipeId: x.recipe.id,
          recipeName: g.name,
          source: g.source,
        })),
      ),
    );
    return { chosen, missing, items, outdated, unmeasured };
  };
  C.selectPrep = (s, selected, recipes) => {
    const options = C.prepOptions(s, recipes);
    if (
      !Array.isArray(selected) ||
      !selected.length ||
      selected.length > 20 ||
      new Set(selected).size !== selected.length ||
      selected.some((ref) => !options.some((x) => x.ref === ref))
    )
      throw Error("Choose between one and twenty unfinished meals or batches.");
    const next = {
        ...s,
        prep: { selected: [...selected], checked: s.prep?.checked || [] },
      },
      view = C.prepView(next, recipes);
    next.prep.checked = view.items
      .filter((i) => i.checked)
      .map((i) => ({ id: i.id, signature: i.signature }));
    s.prep = next.prep;
  };
  C.checkPrep = (s, id, checked, expectedSignature, recipes) => {
    const view = C.prepView(s, recipes),
      row = view.items.find((i) => i.id === id);
    if (
      !row ||
      row.signature !== expectedSignature ||
      typeof checked !== "boolean"
    )
      throw Error(
        "The prep quantities changed. Reopen the checklist to review them.",
      );
    const valid = view.items
      .filter((i) => i.id !== id && i.checked)
      .map((i) => ({ id: i.id, signature: i.signature }));
    if (checked) valid.push({ id, signature: row.signature });
    s.prep.checked = valid;
  };
  if (typeof module !== "undefined") module.exports = C;
})(typeof globalThis !== "undefined" ? globalThis : this);
