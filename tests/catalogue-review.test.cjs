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
const corrections = require("../docs/catalogue/fish-ingredient-corrections.json").corrections;
const additions = new Set(corrections.map(c => c.ingredient.id));
const herbReview = require("../docs/catalogue/herb-ingredient-corrections.json");
const bakingCorrections = require("../docs/catalogue/baking-ingredient-corrections.json").corrections;
const finishingCorrections = require("../docs/catalogue/finishing-ingredient-corrections.json").corrections;
const mixedReview = require("../docs/catalogue/mixed-quantity-corrections.json");
const requiredCorrections = [...require("../docs/catalogue/required-ingredient-corrections.json").corrections,...herbReview.corrections,...bakingCorrections,...finishingCorrections,...mixedReview.corrections];
const definitionAdditions = new Set([...additions,...herbReview.ingredients.map(i=>i.id),...mixedReview.ingredients.map(i=>i.id)]);
function correctedReference(old) {
  const r = JSON.parse(JSON.stringify(old));
  const correction = requiredCorrections.find(c => c.recipeId === old.id);
  for (const item of correction?.items || []) {
    const existing = r.ingredients.find(i => i.id === (item.oldId || item.id));
    assert.equal(existing?.qty || 0, item.oldQty, old.id + ':' + item.id);
    if (existing) { existing.id=item.id; existing.qty=item.qty; if(item.avoidIds) existing.avoidIds=item.avoidIds; }
    else r.ingredients.push({id:item.id,qty:item.qty,...(item.avoidIds ? {avoidIds:item.avoidIds} : {})});
  }
  return r;
}
const correctedRecipes = before.recipes.map(correctedReference);

test('mixed source quantities scale, preserve incompatible stock, and deduct once after reload', () => {
  const expected = {
    'gf2-easy-caramel-cake': {'caramel-sauce-ml':45},
    'gf2-lebanese-poussin-spiced-aubergine-pilaf': {'olive-oil':30,'ex-allspice-0aad6291':0.5},
    'gf2-lemon-sponge': {salt:0.5},
    'gf2-peach-raspberry-almond-crumble-cake': {sugar:212,salt:0.125},
    'gf2-roast-cod-paella-saffron-olive-oil': {'ex-mussels-34ebd4b6':18},
    'sp-gfmore-microwave-garam-masala-vegetable-curry': {'ex-coriander-fabde51f':6,'tomato-tin':400,salt:0.125},
    'sp-gfmore-raspberry-ripple-blondies': {'brown-sugar':204,salt:0.125},
    'sp-gfmore-spicy-tuna-wrap': {'jalapeno-brine':30},
  };
  for (const [recipeId, amounts] of Object.entries(expected)) {
    const r=find(recipeId),s=C.defaults();
    s.plans=[{id:'mixed',recipeId,date:C.today(),meal:r.meals[0],servings:r.base/2,side:'none',cooked:false}];
    s.pantry=[{id:'tomato',qty:900,always:false},{id:'ex-mussels-38f8b4fd',qty:500,always:false}];
    const restored=C.migrate(C.clone(s),R,I);
    assert.deepEqual(restored.pantry,s.pantry);
    for(const [id,qty] of Object.entries(amounts)) {
      assert.equal(r.ingredients.find(i=>i.id===id).qty,qty,recipeId+':'+id);
      const scaled=C.round(qty/2);
      assert.equal(C.requirements(restored,R)[id],scaled);
      assert.equal(C.shopping(restored,R).find(i=>i.id===id).remaining,scaled);
      restored.pantry.push({id,qty:scaled*2,always:false});
    }
    C.finishPlan(restored,'mixed',R);
    for(const [id,qty] of Object.entries(amounts)) assert.equal(C.stock(restored,id),C.round(qty/2));
    assert.equal(C.stock(restored,'ex-mussels-38f8b4fd'),500);
    if(recipeId==='sp-gfmore-microwave-garam-masala-vegetable-curry') assert.equal(C.stock(restored,'tomato'),900);
    const done=C.migrate(C.clone(restored),R,I);
    assert.deepEqual(done.pantry,restored.pantry);
    assert.throws(()=>C.finishPlan(done,'mixed',R));
    assert.match(r.ingredientGuidance,/full|servings|wraps/i);
  }
  const curry=find('sp-gfmore-microwave-garam-masala-vegetable-curry');
  assert.equal(curry.ingredients.some(i=>i.id==='tomato'),false);
  assert.equal(C.foodAllowed(curry,{...C.defaults().prefs,exclusions:['tomato']}),false);
  assert.equal(find('gf2-easy-caramel-cake').ingredients.find(i=>i.id==='ex-caramel-sauce-dulce-de-leche-9b1951e5').qty,70);
  assert.equal(find('sp-gfmore-spicy-tuna-wrap').ingredients.find(i=>i.id==='ex-jalapenos-67689d2d').qty,30);
  assert.match(find('gf2-peach-raspberry-almond-crumble-cake').planningNotes,/estimated as 12g/);
  assert.match(find('sp-gfmore-raspberry-ripple-blondies').planningNotes,/estimated as 4g/);
  assert.equal(Math.round(190/16),12);assert.equal(Math.round(213/48),4);
  const queue=require('../docs/catalogue/quantity-review-queue.json');
  assert.equal(queue.entries.filter(row=>row.status==='pending').length,0);
});

test('required baking ingredients reach shopping, exclusions and once-only deductions for every corrected recipe',()=>{
 assert.equal(bakingCorrections.length,21);
 for(const correction of bakingCorrections){
  const r=find(correction.recipeId),s=C.defaults();
  s.plans=[{id:'existing-bake',recipeId:r.id,date:C.today(),meal:r.meals[0],servings:r.base,side:'none',cooked:false}];
  const saved=C.migrate(C.clone(s),R,I);
  for(const item of correction.items){
   assert.equal(r.ingredients.filter(i=>i.id===item.id).length,1);
   assert.equal(C.requirements(saved,R)[item.id],item.qty);
   assert.equal(C.shopping(saved,R).find(i=>i.id===item.id).remaining,item.qty);
   assert.equal(C.foodAllowed(r,{...saved.prefs,exclusions:[item.id]}),false);
   for(const alias of item.avoidIds||[])assert.equal(C.foodAllowed(r,{...saved.prefs,exclusions:[alias]}),false);
   saved.pantry.push({id:item.id,qty:item.qty*2,always:false});
  }
  const beforeCook=C.migrate(C.clone(saved),R,I);assert.deepEqual(beforeCook.pantry,saved.pantry);
  C.finishPlan(beforeCook,'existing-bake',R);
  for(const item of correction.items)assert.equal(C.stock(beforeCook,item.id),item.qty);
  const done=C.migrate(C.clone(beforeCook),R,I);assert.deepEqual(done.pantry,beforeCook.pantry);
  assert.throws(()=>C.finishPlan(done,'existing-bake',R));
 }
 assert.equal(find('sp-sally-ciabatta-bread-recipe').ingredients.find(i=>i.id==='ex-bread-flour-7cab183f').qty,455);
 assert.equal(find('sp-sally-lemon-blueberry-babka').ingredients.find(i=>i.id==='ex-bread-flour-7cab183f').qty,382);
 assert.equal(find('sp-sally-whole-wheat-bread').ingredients.find(i=>i.id==='ex-whole-wheat-flour-21c11971').qty,433);
 for(const r of R.filter(r=>r.id.startsWith('sp-sally'))){
  const omitted=(r.planningNotes||'').split('Not included in shopping (serving extras, optional items or equipment): ')[1]||'';
  assert.doesNotMatch(omitted,/\(\d+g\) (?:all-purpose|bread|whole wheat) flour[^;]*plus more as needed/,r.id);
 }
});

test("batch guidance includes reviewed planning notes instead of stale omission claims", () => {
  const affected = R.filter(r => r.batch && r.planningNotes !== before.recipes.find(x => x.id === r.id).planningNotes);
  assert.deepEqual(affected.map(r => r.id).sort(), [
    'gf2-slow-cooker-pork-casserole', 'gf2-slow-cooker-ratatouille',
    'sp-gfmore-courgette-potato-cheddar-soup', 'sp-gfmore-pasta-e-fagioli',
  ].sort());
  for (const r of affected) assert.ok(r.batch.note.includes(r.planningNotes), r.id);
});
test("review preserves identities and ratings with only documented ingredient corrections", () => {
  assert.equal(R.length, before.recipes.length);
  assert.deepEqual(Object.fromEntries(Object.entries(I).filter(([id]) => !definitionAdditions.has(id))), before.ingredients);
  for (const c of corrections) assert.deepEqual(I[c.ingredient.id],c.ingredient);
  for(const i of [...herbReview.ingredients,...mixedReview.ingredients]) assert.deepEqual(I[i.id],i);
  for (const old of before.recipes) {
    const r = find(old.id);
    assert.ok(r);
    assert.deepEqual(r.ingredients.filter(i => !additions.has(i.id)), correctedReference(old).ingredients, old.id);
    assert.deepEqual(r.ingredients.filter(i => additions.has(i.id)), corrections.filter(c => c.recipeId === old.id).map(c => ({id:c.ingredient.id,qty:c.qty,avoidIds:c.avoidIds})),old.id);
    assert.deepEqual(r.source, old.source, old.id);
    const expectedBatch = old.batch && r.planningNotes !== old.planningNotes
      ? { ...old.batch, note: old.batch.note.replace(old.planningNotes, r.planningNotes) }
      : old.batch;
    assert.deepEqual(r.batch, expectedBatch, old.id);
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
      Object.fromEntries(Object.entries(C.requirements(migrated, R)).filter(([id]) => !additions.has(id))),
      C.requirements(s, correctedRecipes),
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

test('all reviewed seafood ingredients stay out of vegetarian and vegan discovery',()=>{
 const seafood=new Set(PLATES_DATA.preferenceFamilies.find(f=>f.anchors.includes('tuna')).members);
 const recipes=R.filter(r=>r.ingredients.some(i=>seafood.has(i.id)));assert.ok(recipes.length>50);
 for(const r of recipes){assert.ok(['fish','meat'].includes(r.kind),r.id);for(const diet of ['vegetarian','vegan'])assert.equal(C.foodAllowed(r,{...C.defaults().prefs,diet}),false,r.id);}
 for(const id of ['gf2-greek-style-roast-fish','sp-gfmore-peppered-mackerel-pink-pickled-onion-salad'])assert.equal(C.foodAllowed(find(id),{...C.defaults().prefs,diet:'pescatarian'}),true,id);
});

test('vegetable pepper preferences do not exclude reviewed peppercorns or peppermint',()=>{
 const aliases=PLATES_DATA.ingredientPreferenceAliases;
 const prefs={...C.defaults().prefs,exclusions:['pepper']};
 for(const [id,mapped] of Object.entries(aliases)){
  assert.ok(I[id],id);
  const ingredient={id,qty:1,avoidIds:['pepper']};
  const r={kind:'vegan',ingredients:[ingredient]};
  assert.equal(C.foodAllowed(r,prefs),true,id);
  assert.equal(C.foodAllowed(r,{...prefs,exclusions:[id]}),false,id+' exact exclusion');
  for(const alias of mapped)assert.equal(C.foodAllowed(r,{...prefs,exclusions:[alias]}),false,id+' reviewed alias');
  assert.deepEqual(ingredient.avoidIds,['pepper']);
 }
 for(const id of ['pepper','ex-roasted-red-peppers-3b0088dc'])assert.equal(C.foodAllowed({kind:'vegan',ingredients:[{id,qty:1,avoidIds:['pepper']}]},prefs),false,id);
 const affected=R.filter(r=>r.ingredients.some(i=>aliases[i.id] && (i.avoidIds||[]).includes('pepper')));
 assert.ok(affected.length>20);
 let restored=0;
 for(const r of affected){
  const containsVegetable=r.ingredients.some(i=>i.id==='pepper'||(!Object.hasOwn(aliases,i.id)&&(i.avoidIds||[]).includes('pepper')));
  assert.equal(C.foodAllowed(r,prefs),!containsVegetable,r.id);
  if(!containsVegetable)restored++;
 }
 assert.ok(restored>20);
 const s=C.defaults();s.pantry=[{id:'pepper',qty:2,always:false}];assert.equal(C.stock(s,'black-pepper'),0);
});

test('assembly meals distinguish hot stock from cooking rice and preserve cooked meat identities',()=>{
 const s=C.defaults();
 for(const [id,expected,wrong] of [['sp-gfmore-no-cook-chicken-couscous','no-cook','hob'],['gf2-quick-sushi-bowl','hob','no-cook']]){
  const r=find(id);const f={...s.filters,meal:'Lunch',time:'any',method:expected};
  assert.equal(C.matching(r,f,s,R,I),true,id);
  assert.equal(C.matching(r,{...f,method:wrong},s,R,I),false,id);
  assert.ok(r.methodNote);
 }
 const couscous=find('sp-gfmore-no-cook-chicken-couscous');
 assert.match(couscous.methodNote,/ready-cooked chicken/);assert.match(couscous.methodNote,/hot stock/);
 assert.ok(couscous.ingredients.some(i=>i.id==='ex-cooked-chicken-fillets-9a1490a2'));
 s.pantry=[{id:'chicken',qty:200,always:false}];assert.equal(C.stock(s,'ex-cooked-chicken-fillets-9a1490a2'),0);
 assert.match(find('gf2-quick-sushi-bowl').methodNote,/Cook the rice/);
 assert.equal(find('sp-gfmore-slow-cooked-pork-cider-sage-hotpot').method,'oven-hob');
});

test('vegetarian quesadillas are not classified by fish-slice equipment',()=>{
 const r=find('gf2-cheesy-black-bean-quesadillas');
 assert.equal(r.kind,'vegetarian');assert.equal(r.emoji,'🫓');
 assert.equal(C.foodAllowed(r,{...C.defaults().prefs,diet:'vegetarian'}),true);
 assert.equal(C.foodAllowed(r,{...C.defaults().prefs,diet:'vegan'}),false);
});

test('missing fish corrections scale package counts without altering existing stock or completed meals',()=>{
 const expected=[['sp-gfmore-lentil-tuna-salad','tuna-water-160g-can',2],['sp-skinnytaste-sardine-salad','sardines-water-4-4oz-tin',1],['sp-skinnytaste-tuna-and-white-bean-salad','tuna-water-3oz-packet',2]];
 for(const [recipeId,id,qty] of expected){
  const r=find(recipeId);assert.equal(I[id].unit,'each');assert.equal(r.ingredients.find(i=>i.id===id).qty,qty);
  const s=C.defaults();s.pantry=[{id:'tuna',qty:200,always:false},{id,qty:qty*2,always:false}];
  s.plans=[{id:'old-plan',recipeId,date:C.today(),meal:'Lunch',servings:r.base,side:'none',cooked:false}];
  const migrated=C.migrate(JSON.parse(JSON.stringify(s)),R,I);
  assert.deepEqual(migrated.pantry,s.pantry);assert.equal(migrated.plans[0].servings,r.base);
  assert.equal(C.requirements(migrated,R)[id],qty);assert.equal(C.scaled(r,r.base*2).find(i=>i.id===id).qty,qty*2);
  C.finishPlan(migrated,'old-plan',R);assert.equal(C.stock(migrated,id),qty);assert.equal(C.stock(migrated,'tuna'),200);
  const completed=C.migrate(JSON.parse(JSON.stringify(migrated)),R,I);
  assert.deepEqual(C.requirements(completed,R),{});assert.deepEqual(completed.pantry,migrated.pantry);
  assert.throws(()=>C.finishPlan(completed,'old-plan',R));assert.equal(C.stock(completed,id),qty);
  const noStock=C.defaults();noStock.plans=s.plans;const row=C.shopping(noStock,R).find(i=>i.id===id);assert.equal(row.remaining,qty);
  assert.equal(C.purchase(noStock,id,qty,I).qty,qty);
  assert.equal(C.foodAllowed(r,{...s.prefs,exclusions:['salmon','tuna','prawns']}),false);
  if(id.startsWith('tuna'))assert.equal(C.foodAllowed(r,{...s.prefs,exclusions:['tuna']}),false);
  assert.ok(!r.planningNotes.includes(corrections.find(c=>c.recipeId===recipeId).omittedText));
 }
});

test('fish cakes and uncertain dashi respect broad fish exclusions without inventing stock matches',()=>{
 const p={...C.defaults().prefs,exclusions:['salmon','tuna','prawns']};
 for(const id of ['gf2-miso-soup','gf2-tteokbokki-spicy-rice-cakes']){
  assert.equal(C.foodAllowed(find(id),p),false,id);assert.equal(C.foodAllowed(find(id),C.defaults().prefs),true,id);
 }
 assert.equal(C.preferenceIds(p.exclusions).has('ex-dashi-a03a1e85'),false);
 assert.match(find('gf2-miso-soup').methodNote,/can contain fish/);
 const s=C.defaults();s.pantry=[{id:'tuna',qty:300,always:false}];assert.equal(C.stock(s,'ex-eomuk-a86f582c'),0);
});

test('readable ingredient labels uniquely resolve the catalogue and reject ambiguous bare names',()=>{
 const values=Object.values(I);const labels=values.map(C.ingredientLabel);assert.equal(new Set(labels).size,values.length);
 for(const i of values){assert.equal(C.resolveIngredient(C.ingredientLabel(i),values)?.id,i.id);assert.ok(!C.ingredientLabel(i).includes('['+i.id+']'));}
 assert.equal(C.resolveIngredient('Milk',values),undefined);assert.equal(C.resolveIngredient('milk',values),undefined);
 assert.equal(C.resolveIngredient('Milk (ml)',values).id,'milk');assert.equal(C.resolveIngredient('Milk (g)',values).id,'ex-milk-1c47d6ee');
 assert.equal(C.resolveIngredient('Milk [milk]',values).id,'milk');
 const customs=[{id:'custom-barcode-12345678',name:'Milk',unit:'ml'},{id:'custom-barcode-23456789',name:'Milk',unit:'ml'},{id:'custom-milk',name:'Milk',unit:'ml'}];
 for(const i of customs)assert.equal(C.resolveIngredient(C.ingredientLabel(i),values.concat(customs)).id,i.id);
});

test('required flour, citrus, honey and cooking oil remain in shopping and deduct only once',()=>{
 const expected=[['gf2-next-level-carrot-cake','ex-rye-flour-d9f0eba1',50],['gf2-chicken-gyros','lemon',1.5],['sp-gfmore-chicken-mango-noodle-salad','lime',2],['sp-gfmore-chicken-mango-noodle-salad','honey',20],['sp-gfmore-spinach-falafel-hummus-bowl','lemon',1],['sp-gfmore-pasta-e-fagioli','olive-oil',30],['gf2-hot-spicy-sweet-potatoes','sweet-potato',1000],['gf2-hot-spicy-sweet-potatoes','thyme',2],['sp-sally-double-chocolate-banana-bread','ex-semi-sweet-chocolate-chips-43880849',157]];
 for(const [recipeId,id,qty] of expected){
  const r=find(recipeId);assert.equal(r.ingredients.find(i=>i.id===id).qty,qty);assert.equal(r.ingredients.filter(i=>i.id===id).length,1);
  const s=C.defaults();s.pantry=[{id,qty:qty*2,always:false}];s.plans=[{id:'existing',recipeId,date:C.today(),meal:r.meals[0],servings:r.base,side:'none',cooked:false}];
  const restored=C.migrate(JSON.parse(JSON.stringify(s)),R,I);assert.deepEqual(restored.pantry,s.pantry);assert.equal(C.requirements(restored,R)[id],qty);
  const empty=C.clone(restored);empty.pantry=[];assert.equal(C.shopping(empty,R).find(i=>i.id===id).need,qty);
  C.finishPlan(restored,'existing',R);assert.equal(C.stock(restored,id),qty);
  const cooked=C.migrate(JSON.parse(JSON.stringify(restored)),R,I);assert.deepEqual(cooked.pantry,restored.pantry);assert.deepEqual(C.requirements(cooked,R),{});assert.throws(()=>C.finishPlan(cooked,'existing',R));assert.equal(C.stock(cooked,id),qty);
  assert.match(r.planningNotes,/Existing uncooked plans include these corrected amounts/);
 }
 assert.equal(find('gf2-next-level-carrot-cake').ingredients.find(i=>i.id==='self-raising-flour').qty,150);
 assert.equal(C.foodAllowed(find('gf2-next-level-carrot-cake'),{...C.defaults().prefs,exclusions:['ex-rye-flour-d9f0eba1']}),false);
});

test('chicken noodle salad uses kettle-soaked noodles and ready-cooked chicken',()=>{
 const r=find('sp-gfmore-chicken-mango-noodle-salad'),s=C.defaults(),f={...s.filters,meal:'Dinner',time:'any',method:'no-cook'};
 assert.equal(C.matching(r,f,s,R,I),true);assert.equal(C.matching(r,{...f,method:'hob'},s,R,I),false);
 assert.match(r.methodNote,/boiling water/);assert.match(r.methodNote,/ready-cooked roast chicken/);
 assert.ok(r.ingredients.some(i=>i.id==='ex-leftover-roast-chicken-shredded-81a82462'));
});

test('required herb counts scale, round for buying and preserve weighed pantry stock',()=>{
 for(const correction of herbReview.corrections){
  const r=find(correction.recipeId),s=C.defaults();s.plans=[{id:'herb-plan',recipeId:r.id,date:C.today(),meal:r.meals[0],servings:r.base/2,side:'none',cooked:false}];
  s.pantry=[{id:'parsley',qty:25,always:false},{id:'basil',qty:25,always:false},{id:'fresh-coriander',qty:25,always:false}];
  const restored=C.migrate(JSON.parse(JSON.stringify(s)),R,I);assert.deepEqual(restored.pantry,s.pantry);
  for(const item of correction.items){
   const expected=item.qty/2;assert.equal(C.requirements(restored,R)[item.id],expected);
   const row=C.shopping(restored,R).find(i=>i.id===item.id);assert.equal(row.remaining,expected);assert.equal(C.purchase(restored,item.id,row.remaining,I).qty,Math.ceil(expected));
   assert.equal(C.foodAllowed(r,{...s.prefs,exclusions:[item.id]}),false);
   for(const alias of item.avoidIds||[])assert.equal(C.foodAllowed(r,{...s.prefs,exclusions:[alias]}),false);
   restored.pantry.push({id:item.id,qty:item.qty,always:false});
  }
  C.finishPlan(restored,'herb-plan',R);
  for(const item of correction.items)assert.equal(C.stock(restored,item.id),item.qty/2);
  for(const id of ['parsley','basil','fresh-coriander'])assert.equal(C.stock(restored,id),25);
  const finished=C.migrate(JSON.parse(JSON.stringify(restored)),R,I);assert.deepEqual(finished.pantry,restored.pantry);assert.throws(()=>C.finishPlan(finished,'herb-plan',R));
 }
 assert.match(find('sp-gfmore-courgette-potato-cheddar-soup').planningNotes,/nutmeg is also required/);
});

test('measured finishing ingredients scale into shopping and deduct once without changing saved stock on reload',()=>{
 for(const correction of finishingCorrections){
  const r=find(correction.recipeId),n=Math.min(r.base,C.maxServings(r));const s=C.defaults();
  s.plans=[{id:'finish-check',recipeId:r.id,date:C.today(),meal:r.meals[0],servings:n,side:'none',cooked:false}];
  const item=correction.items[0],qty=C.round(item.qty*n/r.base);s.pantry=[{id:item.id,qty:qty*2,always:false}];
  const restored=C.migrate(C.clone(s),R,I);assert.deepEqual(restored.pantry,s.pantry);assert.equal(C.requirements(restored,R)[item.id],qty);
  const empty=C.clone(restored);empty.pantry=[];assert.equal(C.shopping(empty,R).find(i=>i.id===item.id).need,qty);
  assert.equal(r.ingredients.filter(i=>i.id===item.id).length,1);assert.equal(r.ingredients.find(i=>i.id===item.id).qty,item.qty);
  assert.ok(!r.planningNotes.includes(correction.replace[0][0]));
  C.finishPlan(restored,'finish-check',R);assert.equal(C.stock(restored,item.id),qty);const done=C.migrate(C.clone(restored),R,I);assert.deepEqual(done.pantry,restored.pantry);assert.throws(()=>C.finishPlan(done,'finish-check',R));
 }
 assert.equal(find('gf2-hot-cross-buns-2').ingredients.find(i=>i.id==='milk').qty,300);
});

test('cheesecake gelatine keeps gram and spoon stock separate and chocolate topping uses its stated estimate',()=>{
 const r=find('gf2-baileys-cheesecake'),g='ex-powdered-gelatine-cd260258',tsp='ex-powdered-gelatine-a81e7eb5';
 const s=C.defaults();s.plans=[{id:'gelatine',recipeId:r.id,date:C.today(),meal:'Dessert',servings:5,side:'none',cooked:false}];
 s.pantry=[{id:g,qty:22,always:false}];
 assert.equal(C.requirements(s,R)[g],5.5);assert.equal(C.requirements(s,R)[tsp],1);
 assert.equal(C.shopping(s,R).find(i=>i.id===tsp).remaining,1);
 s.pantry.push({id:tsp,qty:4,always:false});const restored=C.migrate(C.clone(s),R,I);assert.deepEqual(restored.pantry,s.pantry);
 C.finishPlan(restored,'gelatine',R);assert.equal(C.stock(restored,g),16.5);assert.equal(C.stock(restored,tsp),3);
 const done=C.migrate(C.clone(restored),R,I);assert.deepEqual(done.pantry,restored.pantry);assert.throws(()=>C.finishPlan(done,'gelatine',R));
 assert.match(r.planningNotes,/heaped spoon is counted nominally/);
 const b=find('sp-sally-white-chocolate-snickerdoodle-blondies');assert.equal(b.ingredients.find(i=>i.id==='ex-white-chocolate-morsels-9c7d30dc').qty,180+Math.round(180/16));
 assert.match(b.planningNotes,/191g total/);assert.doesNotMatch(b.planningNotes,/amounts are not included: 180g white chocolate/);
});

test('measured topping estimates include every component and preserve gram stock identities',()=>{
 const expected=[['gf2-cherry-pie',{ 'ground-almonds':61,salt:0.25}],['gf2-citrus-almond-yogurt-cake',{sugar:224,yoghurt:103}]];
 for(const [recipeId,totals] of expected){const r=find(recipeId),s=C.defaults();s.plans=[{id:'topping',recipeId,date:C.today(),meal:r.meals[0],servings:r.base,side:'none',cooked:false}];
  for(const [id,qty] of Object.entries(totals)){assert.equal(C.requirements(s,R)[id],qty);assert.equal(C.shopping(s,R).find(i=>i.id===id).need,qty);s.pantry.push({id,qty:qty*2,always:false});}
  const restored=C.migrate(C.clone(s),R,I);assert.deepEqual(restored.pantry,s.pantry);C.finishPlan(restored,'topping',R);for(const [id,qty] of Object.entries(totals))assert.equal(C.stock(restored,id),qty);
  assert.match(r.planningNotes,/estimated as/);assert.match(r.planningNotes,/King Arthur/);assert.throws(()=>C.finishPlan(restored,'topping',R));
 }
 const review=require('../docs/catalogue/finishing-ingredient-corrections.json');assert.deepEqual(review.pending,[]);for(const row of review.conversionEvidence.entries)assert.equal(Math.round(row.gramsPerCup/16*2),row.twoTablespoonsGrams);
});
