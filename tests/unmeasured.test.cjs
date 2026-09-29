const {test}=require('node:test'),assert=require('node:assert/strict');
for(const f of ['recipes','batch-v3','recipes-rated','recipes-diverse','recipes-expanded','recipes-specialists','catalogue-review','core-v3','phase1','menus','cooking','prep'])require('../'+f+'.js');
const C=PlatesCore,R=PLATES_DATA.recipes,I=PLATES_DATA.ingredients,id='ex-fresh-nutmeg-8f09666c',soup=R.find(r=>r.id==='sp-gfmore-courgette-potato-cheddar-soup');
function state(){const s=C.defaults();s.plans=[{id:'soup',recipeId:soup.id,date:C.today(),meal:'Dinner',servings:2,kind:'cook',side:'none',cooked:false}];s.pantry=[{id,qty:1,always:false}];return s;}
test('unmeasured ingredients stay visible without inventing quantities or changing stock',()=>{
 const s=state(),raw=JSON.stringify(s);assert.equal(C.unmeasuredRequirements(s,R)[0].id,id);assert.equal(C.requirements(s,R)[id],undefined);
 const restored=C.migrate(s,R,I);assert.equal(JSON.stringify(s),raw);assert.deepEqual(restored.pantry,s.pantry);
 C.selectPrep(restored,['plan:soup'],R);assert.equal(C.prepView(restored,R).unmeasured[0].id,id);assert.equal(C.prepView(restored,R).items.some(i=>i.id===id),false);
 const view=C.cookingView(restored,'plan','soup',R);assert.equal(view.groups[0].unmeasured[0].id,id);
 C.finishPlan(restored,'soup',R);assert.equal(C.stock(restored,id),1);assert.deepEqual(C.unmeasuredRequirements(restored,R),[]);assert.equal(C.prepView(restored,R).unmeasured.length,0);
});
test('required unmeasured ingredients respect search, exclusions and no-shopping filters',()=>{
 const s=state(),f={...s.filters,meal:'Dinner',time:'any',query:'nutmeg courgette'};
 const baseline=C.choiceWeight(soup,s,false);s.prefs.likedIngredients=[id];assert.ok(C.choiceWeight(soup,s,false)>baseline);
 assert.equal(C.matching(soup,f,s,R,I),true);assert.equal(C.matching(soup,{...f,mode:'only'},s,R,I),false);
 for(const excluded of [id,'nutmeg','ex-whole-nutmeg-07230ac5'])assert.equal(C.foodAllowed(soup,{...s.prefs,exclusions:[excluded]}),false);
});
test('stored meals omit already cooked unmeasured ingredients but include a fresh side',()=>{
 const s=state(),side={...soup,id:'test-side',dishRole:'side'},recipes=[...R,side];s.plans[0].kind='stored';
 assert.equal(C.unmeasuredRequirements(s,recipes).length,0);assert.equal(C.cookingView(s,'plan','soup',recipes).groups.length,0);
 s.plans[0].side='recipe:test-side';assert.equal(C.unmeasuredRequirements(s,recipes)[0].recipeId,side.id);assert.equal(C.cookingView(s,'plan','soup',recipes).groups[0].unmeasured[0].id,id);
 s.batches=[{id:'batch',recipeId:soup.id,servings:8,cooked:false}];assert.equal(C.unmeasuredRequirements(s,recipes).length,2);
});
test('ordinary cooking signatures retain their existing shape and changed seasoning invalidates only affected checks',()=>{
 const s=state();s.plans[0].recipeId='pesto-pea-pasta';const v=C.cookingView(s,'plan','soup',R);assert.ok(v.groups.every(g=>!Object.hasOwn(g,'unmeasured')));
 s.plans[0].recipeId=soup.id;const oldRecipes=R.map(r=>r.id===soup.id?{...r,unmeasuredIngredients:undefined}:r),old=C.cookingView(s,'plan','soup',oldRecipes);C.restartCooking(s,old);assert.equal(C.cookingView(s,'plan','soup',R).stale,true);
});
