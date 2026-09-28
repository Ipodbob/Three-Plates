const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../recipes.js');require('../batch-v3.js');
const original=JSON.stringify(PLATES_DATA);
require('../recipes-rated.js');require('../recipes-diverse.js');require('../recipes-expanded.js');require('../core-v3.js');
const C=require('../phase1.js'),R=PLATES_DATA.recipes,I=PLATES_DATA.ingredients,rated=R.filter(r=>r.id.startsWith("gf-"));
const diverse=R.filter(r=>r.id.startsWith('curated-'));
const expanded=R.filter(r=>r.id.startsWith('gf2-'));
test('large expansion has source coverage, valid quantities and no identifier collisions',()=>{
 assert.equal(expanded.length,266);assert.equal(R.length,383);assert.equal(new Set(R.filter(r=>r.source).map(r=>r.source.url.replace(/\/$/,''))).size,338);
 assert.equal(expanded.filter(r=>r.baking).length,101);assert.equal(expanded.filter(r=>r.meals.includes('Dessert')).length,86);assert.equal(expanded.filter(r=>r.batch).length,39);assert.ok(new Set(expanded.map(r=>r.cuisine)).size>=20);
 for(const r of expanded){assert.match(r.id,/^[a-zA-Z0-9_-]{1,80}$/);assert.ok(r.total>=r.prep);assert.ok(r.source.author);assert.ok(r.source.rating>=4.3&&r.source.rating<=5);assert.ok(r.source.ratingCount>=5);assert.ok(r.source.selectionReason);assert.ok(r.meals.every(m=>C.meals.includes(m)));assert.ok(r.base>0&&r.base<=48);assert.equal(new Set(r.ingredients.map(i=>i.id)).size,r.ingredients.length);for(const i of r.ingredients){assert.ok(I[i.id]);assert.match(i.id,/^[a-zA-Z0-9_-]{1,80}$/);assert.ok(Number.isFinite(i.qty)&&i.qty>0);assert.ok(['g','ml','tsp','each'].includes(I[i.id].unit));assert.ok(!/^(Water|Warm water|Long metal skewers)$/i.test(I[i.id].name));}assert.deepEqual(r.steps,[]);}
});
test('every added recipe can scale, plan and survive backup migration',()=>{
 for(const r of expanded){const s=C.defaults(),n=r.baking?r.base:Math.min(12,r.base);s.plans=[{id:'new-plan',recipeId:r.id,date:C.today(),meal:r.meals[0],servings:n,cooked:false}];const restored=C.migrate(JSON.parse(JSON.stringify(s)),R,I);assert.equal(restored.plans[0].recipeId,r.id);assert.equal(restored.plans[0].servings,n);const req=C.requirements(restored,R);for(const i of r.ingredients)assert.ok(Math.abs(req[i.id]-i.qty*n/r.base)<0.002,r.id+' '+i.id);}
});
test('new cooked and canned ingredients cannot silently consume dry pantry stock',()=>{
 const lentils=R.find(r=>r.id==='gf2-coconut-squash-dhansak');assert.equal(lentils.ingredients.find(i=>i.id==='cooked-lentils').qty,240);assert.ok(!lentils.ingredients.some(i=>i.id==='lentils'));
 const rice=R.find(r=>r.id==='gf2-korean-style-fried-rice');assert.ok(!rice.ingredients.some(i=>i.id==='rice'));const cooked=rice.ingredients.find(i=>I[i.id].name==='Cooked rice');assert.equal(cooked.qty,500);assert.ok(cooked.avoidIds.includes('rice'));
 const s=C.defaults();s.pantry=[{id:'rice',qty:500,always:false}];assert.equal(C.stock(s,cooked.id),0);s.prefs.exclusions=['rice'];assert.equal(C.foodAllowed(rice,s.prefs),false);
});
test('resting recipes, cooked pancakes and dashi retain honest filters',()=>{
 const s=C.defaults(),bread=R.find(r=>r.id==='gf2-focaccia');assert.equal(bread.additionalTime,true);assert.equal(C.matching(bread,{...s.filters,meal:'Baking',time:'30',method:'any'},s,R,I),false);
 for(const id of ['baby-pancakes','classic-crepes','steamed-bao-buns'])assert.equal(R.find(r=>r.id==='gf2-'+id).method,'hob');
 const miso=R.find(r=>r.id==='gf2-miso-soup');assert.equal(miso.kind,'fish');s.prefs.diet='vegan';assert.equal(C.foodAllowed(miso,s.prefs),false);
 const pretzels=R.find(r=>r.id==='gf2-learn-to-make-pretzels');assert.equal(pretzels.total,60);
});
test('quantity audit covers every added source and batch rice retains conservative storage',()=>{
 const audit=require('../docs/catalogue/expansion-quantities.json');assert.equal(audit.length,expanded.length);for(const r of expanded){const a=audit.find(a=>a.id===r.id);assert.equal(a.url,r.source.url);assert.ok(a.ingredients.length);if(r.batch){assert.equal(r.batch.freezer,null);assert.equal(r.batch.qualityMonths,null);if(a.ingredients.some(s=>/\brice\b/i.test(s)))assert.equal(r.batch.fridgeHours,24);}}
});
test('diverse catalogue has checked provenance and coverage across publishers and baking styles',()=>{
 assert.equal(diverse.length,32);assert.equal(new Set(diverse.map(r=>r.source.publisher)).size,7);assert.equal(new Set(R.map(r=>r.id)).size,R.length);assert.equal(new Set(R.filter(r=>r.source).map(r=>r.source.url)).size,338);
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
