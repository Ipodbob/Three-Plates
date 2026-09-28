const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../recipes.js');require('../batch-v3.js');
const original=JSON.stringify(PLATES_DATA);
require('../recipes-rated.js');require('../recipes-diverse.js');require('../core-v3.js');
const C=require('../phase1.js'),R=PLATES_DATA.recipes,I=PLATES_DATA.ingredients,rated=R.filter(r=>r.id.startsWith("gf-"));
const diverse=R.filter(r=>r.id.startsWith('curated-'));
test('diverse catalogue has checked provenance and coverage across publishers and baking styles',()=>{
 assert.equal(diverse.length,32);assert.equal(new Set(diverse.map(r=>r.source.publisher)).size,7);assert.equal(new Set(R.map(r=>r.id)).size,R.length);assert.equal(new Set(R.filter(r=>r.source).map(r=>r.source.url)).size,72);
 for(const r of diverse){assert.ok(r.source.selectionReason);assert.ok(r.source.rating>0&&r.source.rating<=5);assert.ok(r.source.ratingCount>0);assert.ok(['simple','moderate','project'].includes(r.effort));assert.ok(r.total>0&&Number.isFinite(r.total));assert.ok(r.prep===null||r.prep<=r.total);assert.ok(r.meals.every(m=>C.meals.includes(m)));assert.ok(r.base<=48);assert.equal(new Set(r.ingredients.map(i=>i.id)).size,r.ingredients.length);for(const i of r.ingredients){assert.ok(I[i.id],i.id);assert.ok(i.qty>0);}}
 for(const tag of ['traybake','soup','pastry','cake','bread','cookies','pie','meal-prep'])assert.ok(diverse.some(r=>r.tags.includes(tag)),tag);
 assert.equal(diverse.filter(r=>r.meals.includes('Dessert')).length,11);assert.equal(diverse.filter(r=>r.baking).length,15);
});
test('styles, effort and publisher searches respect normal dietary and time filters',()=>{
 const s=C.defaults(),r=diverse.find(r=>r.id==='curated-sallysbakingaddiction-homemade-croissants');const f={...s.filters,meal:'Baking',time:'any',method:'any'};
 for(const query of ['pastries','complex','French','Sally'])assert.ok(C.matching(r,{...f,query},s,R,I),query);
 assert.equal(C.matching(r,{...f,time:'30'},s,R,I),false);s.prefs.diet='vegan';assert.equal(C.matching(r,f,s,R,I),false);
});
test('dessert and baking slots roundtrip alongside dinner; large bake yield is preserved',()=>{
 const s=C.defaults(),date=C.today();s.filters.meal='Baking';s.batchFilters.meal='Dessert';s.plans=[{id:'dinner',recipeId:'pesto-pea-pasta',date,meal:'Dinner',servings:2,cooked:false},{id:'dessert',recipeId:'curated-bbcgoodfood-fruit-salad',date,meal:'Dessert',servings:2,cooked:false},{id:'bake',recipeId:'curated-kingarthurbaking-no-knead-crusty-white-bread-recipe',date,meal:'Baking',servings:36,cooked:false}];
 const restored=C.migrate(JSON.parse(JSON.stringify(s)),R,I);assert.equal(restored.plans.length,3);assert.equal(restored.plans.find(p=>p.id==='bake').servings,36);assert.equal(restored.filters.meal,'Baking');assert.equal(restored.batchFilters.meal,'Dessert');assert.equal(C.requirements(restored,R).flour,900);
});
test('pantry-only checks full baking yield, and rice meal prep uses the shorter limit',()=>{
 const s=C.defaults(),r=diverse.find(r=>r.id==='curated-kingarthurbaking-no-knead-crusty-white-bread-recipe');s.pantry=r.ingredients.map(i=>({id:i.id,qty:i.qty/2,always:false}));const f={...s.filters,meal:'Baking',mode:'only',time:'any',servings:2};assert.equal(C.matching(r,f,s,R,I),false);s.pantry=r.ingredients.map(i=>({id:i.id,qty:i.qty,always:false}));assert.equal(C.matching(r,f,s,R,I),true);
 for(const r of diverse.filter(r=>r.batch&&r.ingredients.some(i=>i.id==='rice')))assert.equal(r.batch.fridgeHours,24);
});
test('catalogue adds 40 unique rated sources without changing original data',()=>{
 const old=JSON.parse(original);assert.deepEqual(R.slice(0,45),old.recipes);
 for(const [id,value] of Object.entries(old.ingredients))assert.deepEqual(I[id],value);
 assert.equal(rated.length,40);assert.equal(new Set(rated.map(r=>r.source.url)).size,40);
 for(const r of rated){assert.ok(r.source.rating>=4.5&&r.source.rating<=5);assert.ok(r.source.ratingCount>=50);assert.equal(new URL(r.source.url).hostname,'www.bbcgoodfood.com');assert.ok(r.source.author);assert.equal(r.source.retrievedOn,'2026-09-28');assert.ok(r.planningNotes);assert.ok(Number.isInteger(r.base)&&r.base>0);assert.ok(r.total>0);assert.ok(r.prep===null||r.prep<=r.total);}
 assert.equal(rated.filter(r=>r.method==='air-fryer').length,4);assert.equal(rated.filter(r=>r.batch).length,13);
});
test('all new quantities resolve and scale consistently; no duplicate ingredients',()=>{
 for(const r of rated){assert.equal(new Set(r.ingredients.map(i=>i.id)).size,r.ingredients.length);for(const i of r.ingredients){assert.ok(I[i.id],i.id);assert.ok(Number.isFinite(i.qty)&&i.qty>0);}const twice=C.scaled(r,r.base*2);r.ingredients.forEach((i,n)=>assert.ok(Math.abs(twice[n].qty-i.qty*2)<0.001));}
});
test('air fryer meal shopping scales counted chicken without consuming weighed stock',()=>{
 const s=C.defaults(),r=rated.find(r=>r.id==='gf-air-fryer-chicken-breasts');s.pantry=[{id:'chicken',qty:1000,always:false}];s.plans=[{id:'rated-plan',recipeId:r.id,date:C.today(),meal:'Dinner',servings:2,cooked:false}];const req=C.requirements(s,R);assert.equal(req['chicken-breast-count'],2);assert.equal(req['veg-oil'],3.75);assert.equal(C.stock(s,'chicken-breast-count'),0);
 assert.equal(C.migrate(JSON.parse(JSON.stringify(s)),R,I).plans[0].recipeId,r.id);
});
test('ingredient aliases and animal-rennet cheese respect saved exclusions',()=>{
 const s=C.defaults(),chicken=R.find(r=>r.id==='gf-air-fryer-chicken-breasts'),risotto=R.find(r=>r.id==='gf-mushroom-risotto');s.prefs.exclusions=['chicken'];assert.equal(C.foodAllowed(chicken,s.prefs),false);s.prefs.exclusions=['garlic'];assert.equal(C.foodAllowed(chicken,s.prefs),false);s.prefs.exclusions=[];s.prefs.diet='vegetarian';assert.equal(C.foodAllowed(risotto,s.prefs),false);
});
test('rated batch recipes retain conservative freezing and valid portion accounting',()=>{
 const s=C.defaults(),r=R.find(r=>r.id==='gf-big-batch-bolognese');s.batches=[{id:'rated-batch',recipeId:r.id,date:C.today(),servings:6,cooked:false}];assert.equal(C.requirements(s,R)['beef-mince'],750);assert.equal(r.batch.type,'base');for(const r of rated.filter(r=>r.batch)){assert.equal(r.batch.freezer,null);assert.equal(r.batch.qualityMonths,null);assert.ok(r.batch.storageProvenance.url);}
 assert.equal(C.migrate(JSON.parse(JSON.stringify(s)),R,I).batches[0].recipeId,r.id);
});
