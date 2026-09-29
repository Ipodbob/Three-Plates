const { test } = require("node:test"),
  assert = require("node:assert/strict");
for (const f of [
  "recipes",
  "batch-v3",
  "recipes-rated",
  "recipes-diverse",
  "recipes-expanded",
  "recipes-specialists",
])
  require("../" + f + ".js");
const before = JSON.parse(JSON.stringify(PLATES_DATA));
require("../catalogue-review.js");
require("../core-v3.js");
require("../phase1.js");
const C = require("../menus.js"),
  R = PLATES_DATA.recipes,
  I = PLATES_DATA.ingredients;
const find = (id) => R.find((r) => r.id === id);
test("review preserves all saved recipe identities, ratings, ingredients and existing plan quantities", () => {
  assert.equal(R.length, before.recipes.length);
  assert.deepEqual(I, before.ingredients);
  for (const old of before.recipes) {
    const r = find(old.id);
    assert.ok(r);
    assert.deepEqual(r.ingredients, old.ingredients, old.id);
    assert.deepEqual(r.source, old.source, old.id);
    assert.deepEqual(r.batch, old.batch, old.id);
    const s = C.defaults();
    s.plans = [
      {
        id: "old-plan",
        recipeId: old.id,
        date: "2026-09-28",
        meal: old.meals[0],
        servings: old.baking ? 48 : 12,
        side: "none",
        cooked: false,
      },
    ];
    const migrated = C.migrate(s, R, I);
    assert.equal(migrated.plans.length, 1, old.id);
    assert.equal(migrated.plans[0].servings, s.plans[0].servings, old.id);
    assert.deepEqual(
      C.requirements(migrated, R),
      C.requirements(s, before.recipes),
      old.id,
    );
  }
});
test("complete cakes and breakfast granola are available while accompaniments are marked separately", () => {
  assert.equal(find("sp-skinnytaste-air-fryer-radishes").dishRole, "side");
  assert.equal(find("sp-lovelemons-roasted-cauliflower").dishRole, "side");
  assert.equal(find("sp-recipetineats-asian-slaw").dishRole, "side");
  const cake = find("sp-sally-peach-bundt-cake-with-brown-butter-icing");
  assert.equal(cake.dishRole, undefined);
  assert.ok(cake.meals.includes("Dessert"));
  assert.equal(find("sp-sally-vanilla-almond-granola").dishRole, undefined);
  assert.deepEqual(find("sp-sally-vanilla-almond-granola").meals, [
    "Breakfast",
  ]);
  assert.equal(
    find("sp-kingarthur-classic-puff-pastry-pate-feuilletee-recipe").dishRole,
    "component",
  );
  assert.deepEqual(find("gf2-focaccia").meals, ["Baking"]);
  assert.ok(
    find("sp-sally-mushroom-puff-pastry-tarts").meals.includes("Baking"),
  );
  assert.ok(
    !find("sp-sally-mushroom-puff-pastry-tarts").meals.includes("Dessert"),
  );
});
test("microwave recipes and savoury Korean meals use the right filter and preserve old saved menu yields", () => {
  const s = C.defaults();
  for (const id of [
    "sp-gfmore-microwave-chilli",
    "sp-gfmore-microwave-macaroni-cheese",
  ]) {
    const r = find(id);
    assert.ok(
      C.matching(
        r,
        { ...s.filters, meal: "Dinner", time: "any", method: "microwave" },
        s,
        R,
        I,
      ),
    );
    assert.equal(
      C.matching(
        r,
        { ...s.filters, meal: "Dinner", time: "any", method: "hob" },
        s,
        R,
        I,
      ),
      false,
    );
  }
  for (const id of [
    "gf2-tteokbokki-spicy-rice-cakes",
    "gf2-spicy-kimchi-pancake-kimchi-jeon",
  ]) {
    const r = find(id);
    assert.equal(r.baking, false);
    assert.ok(!r.tags.includes("baking"));
    assert.equal(r.method, "hob");
    assert.ok(r.meals.includes("Lunch"));
    assert.ok(!r.meals.includes("Dessert"));
    const state = C.defaults();
    state.plans = [
      {
        id: "old",
        recipeId: id,
        date: "2026-09-28",
        meal: "Baking",
        servings: 48,
        side: "none",
        cooked: false,
      },
    ];
    const m = C.saveMenu(state, "Old bake", "2026-09-28", "all", R);
    const restored = C.migrate(state, R, I);
    const copies = C.applyMenu(restored, m.id, "2026-10-05", null, R);
    assert.equal(copies[0].servings, 48);
    assert.equal(C.migrate(restored, R, I).plans.length, 2);
  }
  // Slow cooking in an oven must not acquire a slow-cooker appliance requirement.
  assert.equal(
    find("sp-gfmore-slow-cooked-pork-cider-sage-hotpot").method,
    "oven-hob",
  );
});

test("reviewed no-bake recipes match their actual preparation and retain heat requirements", () => {
  const s = C.defaults();
  const checks = {
    "sp-lovelemons-no-bake-protein-balls": "no-cook",
    "sp-sally-chocolate-peanut-butter-no-bake-cookies": "hob",
    "sp-sally-mini-no-bake-cheesecakes": "no-cook",
    "sp-sally-no-bake-cheesecake": "no-cook",
    "sp-sally-no-bake-pumpkin-cheesecake": "no-cook",
    "gf2-no-bake-pbj-cheesecake-squares": "no-cook",
    "gf2-lemon-cheesecake": "hob",
    "sp-sally-pumpkin-pie-in-a-jar": "hob",
  };
  for (const [id, method] of Object.entries(checks)) {
    const r = find(id);
    const f = { ...s.filters, meal: r.meals[0], time: "any", method };
    assert.equal(C.matching(r, f, s, R, I), true, id);
    assert.equal(C.matching(r, { ...f, method: "oven" }, s, R, I), false, id);
  }
  assert.match(
    find("sp-sally-mini-no-bake-cheesecakes").methodNote,
    /optional/,
  );
  assert.match(find("sp-sally-no-bake-cheesecake").methodNote, /Melted butter/);
  assert.match(find("gf2-no-bake-pbj-cheesecake-squares").methodNote, /kettle/);
});

test("longer-time filter includes additional chilling or proving without admitting quick meals", () => {
  const s = C.defaults();
  for (const id of [
    "gf2-lemon-cheesecake",
    "gf2-no-bake-pbj-cheesecake-squares",
    "gf2-focaccia",
  ]) {
    const r = find(id),
      f = { ...s.filters, meal: r.meals[0], method: "any" };
    assert.equal(C.matching(r, { ...f, time: "long" }, s, R, I), true, id);
    assert.equal(C.matching(r, { ...f, time: "30" }, s, R, I), false, id);
  }
  const quick = find("pesto-pea-pasta");
  assert.equal(
    C.matching(quick, { ...s.filters, meal: "Dinner", time: "long" }, s, R, I),
    false,
  );
});

test("reviewed animal ingredients exclude eleven recipes from vegetarian and vegan discovery", () => {
  const meat = [
    "gf2-air-fryer-crispy-chilli-beef",
    "gf2-korean-style-fried-rice",
    "sp-gfmore-deli-pasta-salad",
    "sp-gfmore-healthy-ragu",
    "sp-sally-my-favorite-pepperoni-pizza-dip",
    "sp-kingarthur-flaky-pastry-recipe",
    "sp-kingarthur-strawberry-filled-angel-food-cake-recipe",
  ];
  const fish = [
    "sp-sally-easy-coconut-shrimp",
    "sp-skinnytaste-scallops-grapefruit-arugula-and-spinach",
    "sp-skinnytaste-shrimp-piccata-foil-packets",
    "sp-skinnytaste-shrimp-tacos",
  ];
  for (const id of [...meat, ...fish]) {
    const r = find(id),
      s = C.defaults();
    assert.equal(r.kind, meat.includes(id) ? "meat" : "fish", id);
    for (const diet of ["vegan", "vegetarian"])
      assert.equal(C.foodAllowed(r, { ...s.prefs, diet }), false, id);
    assert.equal(
      C.foodAllowed(r, { ...s.prefs, diet: "pescatarian" }),
      fish.includes(id),
      id,
    );
    assert.equal(C.foodAllowed(r, s.prefs), true, id);
  }
});

test("fish and seafood exclusions cover every reviewed variant without stock substitution", () => {
  const s = C.defaults();
  s.prefs.exclusions = ["salmon", "tuna", "prawns"];
  const audit = require("../docs/catalogue/seafood-preferences.json");
  assert.equal(audit.members.length, 74);
  for (const item of audit.members) {
    assert.ok(I[item.id]);
    for (const r of R.filter((r) =>
      r.ingredients.some((i) => i.id === item.id),
    ))
      assert.equal(C.foodAllowed(r, s.prefs), false, r.id + " " + item.id);
  }
  const excluded = C.preferenceIds(s.prefs.exclusions);
  assert.equal(excluded.has("ex-oyster-mushrooms-f1251a90"), false);
  assert.equal(excluded.has("chicken"), false);
  const raw = "ex-raw-shrimp-a2bb72e4";
  s.pantry = [{ id: "prawns", qty: 500, always: false }];
  assert.equal(C.stock(s, raw), 0);
  const before = JSON.stringify(s);
  C.foodAllowed(find("sp-skinnytaste-shrimp-piccata-foil-packets"), s.prefs);
  assert.equal(JSON.stringify(s), before);
  assert.deepEqual(C.migrate(s, R, I).prefs.exclusions, s.prefs.exclusions);
});

test("specific seafood preferences cover their own forms without excluding unrelated seafood", () => {
  const s = C.defaults();
  assert.equal(
    C.foodAllowed(find("sp-skinnytaste-shrimp-piccata-foil-packets"), {
      ...s.prefs,
      exclusions: ["prawns"],
    }),
    false,
  );
  const salmon = C.preferenceIds(["salmon"]);
  assert.equal(salmon.has("ex-smoked-salmon-3bdb2bdf"), true);
  assert.equal(salmon.has("ex-sea-scallops-36ef9847"), false);
  assert.equal(
    C.foodAllowed(
      find("sp-skinnytaste-scallops-grapefruit-arugula-and-spinach"),
      { ...s.prefs, exclusions: ["salmon"] },
    ),
    true,
  );
});

test('broad meat exclusions cover reviewed imported cuts and stocks without changing stock',()=>{
 const audit=require('../docs/catalogue/meat-preferences.json');
 for(const family of audit.families){
  const s=C.defaults();s.prefs.exclusions=family.anchors;
  for(const ingredient of family.members){
   assert.deepEqual(I[ingredient.id],ingredient);
   for(const r of R.filter(r=>r.ingredients.some(i=>i.id===ingredient.id))) assert.equal(C.foodAllowed(r,s.prefs),false,r.id);
  }
  assert.deepEqual(C.migrate(s,R,I).prefs.exclusions,family.anchors);
 }
 const chicken=C.preferenceIds(['chicken','chicken-thigh']);
 assert.ok(chicken.has('ex-ground-chicken-06bee616'));
 assert.equal(chicken.has('ex-vegan-chicken-pieces-d9355e4b'),false);
 const beef=C.preferenceIds(['beef','beef-mince']);
 assert.ok(beef.has('ex-thin-cut-minute-steak-afec6c06'));
 for(const id of ['lamb','steak-seasoning','ex-pork-shoulder-steaks-5400764f'])assert.equal(beef.has(id),false);
 const pork=C.preferenceIds(['pork','sausages']);
 assert.ok(pork.has('ex-ham-cc3ff06f'));
 assert.equal(pork.has('ex-graham-cracker-crumbs-e70a0fa5'),false);
 const s=C.defaults();s.pantry=[{id:'chicken',qty:500,always:false}];assert.equal(C.stock(s,'ex-ground-chicken-06bee616'),0);
});

test('favourite ingredient families rank imported cuts but never override food exclusions',()=>{
 const s=C.defaults();const ids=['chicken','chicken-thigh'];s.prefs.likedIngredients=ids;
 const ground=R.find(r=>r.ingredients.some(i=>i.id==='ex-ground-chicken-06bee616'));
 assert.ok(ground);const base={...s,prefs:{...s.prefs,likedIngredients:[]}};
 assert.ok(C.choiceWeight(ground,s,false)>C.choiceWeight(ground,base,false));
 assert.ok(C.choiceWeight(ground,s,true)>C.choiceWeight(ground,base,true));
 const vegan={id:'vegan-test',cuisine:'any',kind:'vegan',ingredients:[{id:'ex-vegan-chicken-pieces-d9355e4b',qty:100}]};
 assert.equal(C.choiceWeight(vegan,s,false),C.choiceWeight(vegan,base,false));
 s.prefs.exclusions=ids;assert.equal(C.foodAllowed(ground,s.prefs),false);
 assert.deepEqual(s.prefs.likedIngredients,ids);assert.deepEqual(C.migrate(s,R,I).prefs.likedIngredients,ids);
});

test('reviewed sausages exclude uncertain meat without inventing favourite matches or stock equivalence',()=>{
 const audit=require('../docs/catalogue/sausage-review.json');assert.equal(audit.knownPork.length,10);assert.equal(audit.unspecifiedMeat.length,8);
 for(const anchors of [['pork','sausages'],['beef','beef-mince'],['chicken','chicken-thigh']]){
  const s=C.defaults();s.prefs.exclusions=anchors;
  for(const i of audit.unspecifiedMeat){assert.deepEqual(I[i.id],i);for(const r of R.filter(r=>r.ingredients.some(x=>x.id===i.id)))assert.equal(C.foodAllowed(r,s.prefs),false,r.id);}
 }
 const s=C.defaults();s.prefs.exclusions=['pork','sausages'];for(const i of audit.knownPork)for(const r of R.filter(r=>r.ingredients.some(x=>x.id===i.id)))assert.equal(C.foodAllowed(r,s.prefs),false,r.id);
 const plain={id:'uncertain-test',kind:'meat',ingredients:[{id:audit.unspecifiedMeat[0].id,qty:1}]};s.prefs.exclusions=[];assert.equal(C.foodAllowed(plain,s.prefs),true);const base=C.choiceWeight(plain,s,false);s.prefs.likedIngredients=['pork','sausages'];assert.equal(C.choiceWeight(plain,s,false),base);
 assert.ok(C.preferenceIds(s.prefs.likedIngredients).has('chorizo'));s.pantry=[{id:'pork',qty:500,always:false}];assert.equal(C.stock(s,'chorizo'),0);
});

test('every recipe containing reviewed meat is excluded by vegetarian and pescatarian diets',()=>{
 const meat=new Set(PLATES_DATA.preferenceFamilies.filter(f=>f.meat).flatMap(f=>f.members).concat(PLATES_DATA.unspecifiedMeatIngredients));
 const recipes=R.filter(r=>r.ingredients.some(i=>meat.has(i.id)));assert.ok(recipes.length>100);
 for(const r of recipes){assert.equal(r.kind,'meat',r.id);for(const diet of ['vegetarian','vegan','pescatarian'])assert.equal(C.foodAllowed(r,{...C.defaults().prefs,diet}),false,r.id+' '+diet);}
});
