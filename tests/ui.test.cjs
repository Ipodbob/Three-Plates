const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');

test('corrected blondies plan a full bake with flour while unbaked pastry stays a searchable component', (t) => {
 const a=app();t.after(()=>a.dom.window.close());a.click('#f-time-any');
 a.q('#recipe-search').value='snickerdoodle blondies';a.submit('#search-form');assert.equal(a.q('.meal-card'),null);
 while(a.q('.meal-stepper span').textContent!=='Baking')a.click('#f-meal-next');
 assert.match(a.q('.meal-card').textContent,/Full bake/);
 a.click('[data-act="plan-add"][data-id="sp-sally-white-chocolate-snickerdoodle-blondies"]');
 assert.equal(a.state().plans[0].servings,16);a.route('shop');
 const row=a.q('[data-act="bought"][data-id="flour"]').closest('.shopping-row');assert.match(row.textContent,/291 g/);
 const b=app({'three-plates-v3':JSON.stringify(a.state())});t.after(()=>b.dom.window.close());
 assert.equal(b.state().plans[0].servings,16);b.route('shop');assert.match(b.q('[data-id="flour"]').closest('.shopping-row').textContent,/291 g/);
 a.route('choose');a.q('#recipe-search').value='rough puff pastry';a.submit('#search-form');
 const pastry=a.q('[data-act="recipe"][data-id="sp-sally-rough-puff-pastry"]').closest('.meal-card');
 assert.match(pastry.textContent,/Recipe component/);assert.match(pastry.textContent,/Unbaked pastry dough/);
 a.click('[data-act="recipe"][data-id="sp-sally-rough-puff-pastry"]');assert.match(a.q('#sheet').textContent,/Plain flour/);
});

test('batch creation and editing show the same reviewed ingredient guidance as the recipe', (t) => {
 const a=app(); t.after(()=>a.dom.window.close()); a.route('batch');
 a.q('#recipe-search').value='courgette potato cheddar soup'; a.submit('#search-form');
 a.click('[data-act="batch-add"][data-id="sp-gfmore-courgette-potato-cheddar-soup"]');
 for (const stage of ['create','edit']) {
   assert.equal(a.q('#batch-recipe-notes').open,false);
   assert.match(a.q('#sheet').textContent,/Includes one bunch of spring onions/);
   assert.match(a.q('#sheet').textContent,/nutmeg is also required/);
   assert.doesNotMatch(a.q('#sheet').textContent,/bunch spring onion sliced - save 1 for serving/);
   if(stage==='create'){a.submit('#batch-form');a.click('[data-act="batch-edit"]');}
 }
 assert.equal(a.state().batches.length,1);
 assert.equal(a.state().pantry.length,0);
});

test('bought amounts remain editable when pantry additions cover the recipe', (t) => {
 const a=app(); t.after(()=>a.dom.window.close());
 a.q('#recipe-search').value='pesto pea pasta'; a.submit('#search-form');
 a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]'); a.route('shop');
 a.set('#pack-mode','packs'); a.click('[data-act="bought"][data-id="pasta"]');
 assert.equal(a.state().bought.pasta,500);
 a.route('pantry'); a.click('[data-act="pantry-add"]');
 a.set('#pantry-name','Pasta'); a.set('#pantry-qty','200'); a.submit('#pantry-form');
 a.route('shop');
 assert.equal(a.w.document.querySelectorAll('[data-act="purchase-edit"][data-id="pasta"]').length,1);
 assert.match(a.q('#extra-purchases').textContent,/500 g/);
 a.click('[data-act="purchase-edit"][data-id="pasta"]'); a.set('#purchase-qty','450'); a.submit('#purchase-form');
 assert.equal(a.state().bought.pasta,450);
 const b=app({'three-plates-v3':JSON.stringify(a.state())}); t.after(()=>b.dom.window.close()); b.route('shop');
 assert.match(b.q('#extra-purchases').textContent,/450 g/);
 b.click('[data-act="stock-bought"]'); assert.equal(b.state().pantry.find(x=>x.id==='pasta').qty,650);
 assert.equal(b.q('#extra-purchases'),null);
 b.route('plan'); b.click('[data-act="plan-finish"]');
 assert.equal(b.state().pantry.find(x=>x.id==='pasta').qty,470);
 assert.equal(b.state().purchaseHistory.filter(x=>x.status==='stocked').length,1);
});

test('purchases from removed plans remain correctable without duplicating active rows', (t) => {
 const a=app(); t.after(()=>a.dom.window.close());
 a.q('#recipe-search').value='pesto pea pasta'; a.submit('#search-form');
 a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]'); a.route('shop');
 a.click('[data-act="bought"][data-id="pasta"]');
 assert.equal(a.q('#extra-purchases'),null);
 assert.equal(a.w.document.querySelectorAll('[data-act="purchase-edit"][data-id="pasta"]').length,1);
 a.route('plan'); a.click('[data-act="plan-remove"]'); a.route('shop');
 assert.match(a.q('#extra-purchases').textContent,/Pasta/);
 a.click('[data-act="purchase-edit"][data-id="pasta"]'); a.set('#purchase-qty','0'); a.submit('#purchase-form');
 assert.equal(a.q('#extra-purchases'),null); assert.equal(a.state().bought.pasta,0);
 assert.equal(a.state().pantry.length,0);
});
test('new equipment buttons persist across reload and return actual specialist recipes',()=>{
 for(const method of ['pressure-cooker','barbecue','microwave']){const a=app();a.click('#f-time-any');a.click('#f-method-'+method);assert.ok(a.q('.meal-card'),method);a.route('batch');a.click('#bf-method-'+method);const b=app({'three-plates-v3':JSON.stringify(a.state())});assert.equal(b.state().filters.method,method);assert.equal(b.q('#f-method-'+method).getAttribute('aria-pressed'),'true');b.route('batch');assert.equal(b.q('#bf-method-'+method).getAttribute('aria-pressed'),'true');a.dom.window.close();b.dom.window.close();}
});
test('specialist search can plan a complete bake and keeps components out of automatic ideas',()=>{
 const a=app();a.click('#f-time-any');for(let i=0;i<5&&a.q('.meal-stepper span').textContent!=='Baking';i++)a.click('#f-meal-next');a.q('#recipe-search').value='almond flour pancakes';a.submit('#search-form');assert.match(a.q('.meal-card').textContent,/King Arthur Baking/);a.click('[data-act="plan-add"]');assert.equal(a.state().plans[0].recipeId,'sp-kingarthur-almond-flour-pancakes-recipe');assert.equal(a.state().plans[0].servings,12);
 a.q('#recipe-search').value='classic puff pastry';a.submit('#search-form');assert.match(a.q('.meal-card').textContent,/Recipe component/);a.q('#recipe-search').value='';a.submit('#search-form');assert.equal(a.w.document.querySelectorAll('.meal-card').length,3);assert.doesNotMatch(a.q('main').textContent,/Recipe component/);a.dom.window.close();
});
test('expanded catalogue can find and plan a full bake with extra time visible',()=>{
 const a=app();a.click('#f-time-any');while(a.q('.meal-stepper span').textContent!=='Baking')a.click('#f-meal-next');a.q('#recipe-search').value='steamed bao';a.submit('#search-form');assert.match(a.q('.meal-card').textContent,/extra time/);assert.match(a.q('.meal-card').textContent,/Hob/);a.click('[data-act="plan-add"]');assert.equal(a.state().plans[0].recipeId,'gf2-steamed-bao-buns');assert.equal(a.state().plans[0].servings,18);a.route('shop');assert.match(a.q('main').textContent,/flour/i);const b=app({'three-plates-v3':JSON.stringify(a.state())});assert.equal(b.state().plans[0].servings,18);a.dom.window.close();b.dom.window.close();
});
test('standalone sides remain searchable but are not offered as a main meal',()=>{
 const a=app();a.click('#f-time-any');a.q('#recipe-search').value='padron peppers';a.submit('#search-form');assert.match(a.q('.meal-card').textContent,/Side dish \/ starter/);a.q('#recipe-search').value='';a.submit('#search-form');assert.equal(a.w.document.querySelectorAll('[data-act="recipe"][data-id="gf2-padron-peppers"]').length,0);assert.equal(a.w.document.querySelectorAll('.meal-card').length,3);a.dom.window.close();
});
test('Dessert and Baking use the shared selector and whole bakes survive reload',()=>{
 const a=app();a.click('#f-time-any');while(a.q('.meal-stepper span').textContent!=='Baking')a.click('#f-meal-next');a.q('#recipe-search').value='no-knead';a.submit('#search-form');assert.match(a.q('.meal-card').textContent,/Full bake · 36/);a.click('[data-act="plan-add"]');assert.equal(a.state().plans[0].servings,36);assert.equal(a.state().plans[0].meal,'Baking');
 const b=app({'three-plates-v3':JSON.stringify(a.state())});assert.equal(b.state().plans[0].servings,36);assert.equal(b.q('.meal-stepper span').textContent,'Baking');b.click('#f-meal-prev');assert.equal(b.q('.meal-stepper span').textContent,'Dessert');b.q('#recipe-search').value='fruit salad';b.submit('#search-form');b.click('[data-act="plan-add"]');assert.equal(b.state().plans.length,2);assert.equal(b.state().plans[1].meal,'Dessert');a.dom.window.close();b.dom.window.close();
});
test('source batch recipes can be planned fresh without entering the batch workflow',()=>{
 const a=app();a.click('#f-time-any');a.q('#recipe-search').value='big-batch';a.submit('#search-form');a.click('[data-act="recipe"][data-id="gf-big-batch-bolognese"]');assert.ok(a.q('.sheet [data-act="plan-add"]'));assert.equal(a.q('.sheet [data-act="batch-add"]'),null);a.click('.sheet [data-act="plan-add"]');assert.equal(a.state().plans[0].recipeId,'gf-big-batch-bolognese');assert.equal(a.state().batches.length,0);a.dom.window.close();
});
test('rated recipe search exposes attribution and plans scalable ingredients',()=>{
 const a=app();a.click('#f-time-any');a.q('#recipe-search').value='air fryer salmon';a.submit('#search-form');assert.ok(a.w.document.querySelectorAll('.meal-card').length>=1);a.click('[data-act="recipe"][data-id="gf-air-fryer-salmon"]');const link=a.q('.sheet a.button');assert.equal(link.href,'https://www.bbcgoodfood.com/recipes/air-fryer-salmon');assert.match(link.textContent,/Read cooking method/);assert.match(a.q('.sheet').textContent,/Source checked 2026-09-28/);a.click('.sheet [data-act="plan-add"]');assert.equal(a.state().plans[0].recipeId,'gf-air-fryer-salmon');a.dom.window.close();
});
test('air fryer filter persists across reload in both cooking modes',()=>{
 const a=app();a.click('#f-method-air-fryer');a.route('batch');a.click('#bf-method-air-fryer');
 const b=app({'three-plates-v3':JSON.stringify(a.state())});assert.equal(b.state().filters.method,'air-fryer');assert.equal(b.q('#f-method-air-fryer').getAttribute('aria-pressed'),'true');b.route('batch');assert.equal(b.state().batchFilters.method,'air-fryer');assert.equal(b.q('#bf-method-air-fryer').getAttribute('aria-pressed'),'true');assert.ok(b.w.document.querySelectorAll('.meal-card').length>=1);a.dom.window.close();b.dom.window.close();
});
test('quantity steppers respect limits, keep focus and update batch portions',()=>{
 const a=app();a.set('#f-servings','12');a.click('#f-servings-plus');assert.equal(a.state().filters.servings,12);a.click('#f-servings-minus');assert.equal(a.state().filters.servings,11);
 a.route('batch');a.set('#bf-days','1');a.set('#bf-people','2');a.click('#bf-days-minus');assert.equal(a.state().batchFilters.days,1);
 a.q('#bf-days-plus').focus();a.click('#bf-days-plus');assert.equal(a.w.document.activeElement.id,'bf-days-plus');assert.equal(a.state().batchFilters.days,2);assert.match(a.q('.portion-summary').textContent,/4 portions/);
 a.set('#bf-days','7');a.click('#bf-days-plus');assert.equal(a.state().batchFilters.days,7);a.set('#bf-people','6');a.click('#bf-people-plus');assert.equal(a.state().batchFilters.people,6);a.set('#bf-people','1');a.click('#bf-people-minus');assert.equal(a.state().batchFilters.people,1);a.dom.window.close();
});
test('stored meal time follows meal selection until explicitly edited and survives booking', (t) => {
 const a=app();t.after(()=>a.dom.window.close());
 a.route('batch');a.click('#bf-time-any');a.click('[data-act="batch-add"]');
 a.set('#batch-portions','4');a.submit('#batch-form');a.route('plan');a.click('[data-act="batch-finish"]');
 a.q('#freezer-confirm').checked=true;a.q('#storage-confirm').checked=true;a.submit('#finish-batch-form');
 a.route('pantry');a.click('[data-act="lot-plan"]');
 const before=JSON.stringify(a.state());
 a.set('#lot-meal','Breakfast');assert.equal(a.q('#lot-time').value,'08:00');
 a.set('#lot-meal','Dinner');assert.equal(a.q('#lot-time').value,'18:00');
 assert.equal(JSON.stringify(a.state()),before);
 a.set('#lot-time','19:15');a.set('#lot-meal','Lunch');assert.equal(a.q('#lot-time').value,'19:15');
 a.set('#lot-time','');a.set('#lot-meal','Dinner');assert.equal(a.q('#lot-time').value,'');
 assert.equal(a.q('#lot-plan-form').checkValidity(),false);
 a.set('#lot-time','19:15');a.set('#lot-date',a.w.PlatesCore.addDays(a.w.PlatesCore.today(),1));
 a.submit('#lot-plan-form');assert.equal(a.state().plans.length,1);
 assert.equal(a.state().plans[0].serveTime,'19:15');assert.equal(a.state().plans[0].meal,'Dinner');
 assert.equal(JSON.stringify(a.state().pantry),JSON.stringify(JSON.parse(before).pantry));
 const b=app({'three-plates-v3':JSON.stringify(a.state())});t.after(()=>b.dom.window.close());
 assert.equal(b.state().plans[0].serveTime,'19:15');
});

test('always-stocked pantry form ignores inactive amounts and reminders but restores measured validation', (t) => {
 const a=app();t.after(()=>a.dom.window.close());a.route('pantry');a.q('[data-act="pantry-add"]').focus();a.click('[data-act="pantry-add"]');
 a.set('#pantry-name','Pasta');a.set('#pantry-qty','-1');a.set('#pantry-use-soon','1900-01-01');
 assert.equal(a.q('#pantry-form').checkValidity(),false);
 a.q('#pantry-always').click();assert.equal(a.q('#pantry-qty').disabled,true);assert.equal(a.q('#pantry-use-soon').disabled,true);
 assert.equal(a.q('#pantry-form').checkValidity(),true);
 a.q('#pantry-always').click();assert.equal(a.q('#pantry-qty').value,'-1');assert.equal(a.q('#pantry-use-soon').value,'1900-01-01');
 assert.equal(a.q('#pantry-form').checkValidity(),false);
 a.q('#pantry-always').click();a.q('#pantry-form button[type="submit"]').click();
 assert.equal(a.state().pantry.length,1);assert.equal(a.state().pantry[0].always,true);assert.equal(a.state().pantry[0].qty,0);assert.equal(a.state().pantry[0].useSoon,undefined);
 const b=app({'three-plates-v3':JSON.stringify(a.state())});t.after(()=>b.dom.window.close());b.route('pantry');
 b.q('[data-act="pantry-edit"]').focus();b.click('[data-act="pantry-edit"]');assert.equal(b.q('#pantry-qty').disabled,true);
 const saved=JSON.stringify(b.state());b.q('#pantry-always').click();b.set('#pantry-qty','250');b.click('[data-act="close"]');
 assert.equal(JSON.stringify(b.state()),saved);assert.equal(b.w.document.activeElement,b.q('[data-act="pantry-edit"]'));
 b.click('[data-act="pantry-edit"]');b.q('#pantry-always').click();b.set('#pantry-qty','250');b.q('#pantry-form button[type="submit"]').click();
 assert.equal(b.state().pantry[0].always,false);assert.equal(b.state().pantry[0].qty,250);
});

function app(seed={},failStorage=false){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost/Three-Plates/',runScripts:'outside-only'}),w=dom.window;
 w.confirm=()=>true;w.scrollTo=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 for(const [key,value] of Object.entries(seed))w.localStorage.setItem(key,value);
 if(failStorage)w.Storage.prototype.setItem=()=>{throw Error('quota');};
 for(const file of ['recipes.js','batch-v3.js','recipes-rated.js','recipes-diverse.js','recipes-expanded.js','recipes-specialists.js','catalogue-review.js','core-v3.js','phase1.js','menus.js','cooking.js','prep.js','cooking-ui.js','barcode-config.js','pantry-scan.js','app-v3.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 const q=selector=>w.document.querySelector(selector),click=selector=>{assert.ok(q(selector),selector);q(selector).click();if(q("#confirm-action"))q("#confirm-action").click();},set=(selector,value)=>{assert.ok(q(selector),selector);q(selector).value=value;q(selector).dispatchEvent(new w.Event('change',{bubbles:true}));};
 const route=name=>{w.location.hash=name;w.dispatchEvent(new w.HashChangeEvent('hashchange'));};
 const submit=id=>q(id).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 return {w,q,click,set,route,submit,dom,state:()=>JSON.parse(w.localStorage.getItem('three-plates-v3'))};
}
test('a saved meal week previews conflicts, copies new portions and survives reload',()=>{
 const a=app();a.q('#recipe-search').value='Pesto & pea pasta';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');a.route('plan');a.click('[data-act="menus"]');a.click('[data-act="menu-save"]');a.set('#menu-name','Work lunches');a.submit('#menu-save-form');assert.equal(a.state().menus.length,1);a.click('[data-act="menu-use"]');
 a.set('#menu-new-start',a.state().filters.date);assert.equal(a.q('#menu-apply').disabled,true);const start=a.w.PlatesCore.addDays(a.state().filters.date,7);a.set('#menu-new-start',start);a.q('#menu-adjust').checked=true;a.set('#menu-people','3');assert.match(a.q('#menu-preview').textContent,/3 portions/);a.submit('#menu-use-form');assert.equal(a.state().plans.length,2);assert.equal(a.state().plans[1].servings,3);
 const b=app({'three-plates-v3':JSON.stringify(a.state())});b.route('plan');b.click('[data-act="menus"]');assert.match(b.q('.sheet').textContent,/Work lunches/);b.click('[data-act="menu-delete"]');assert.equal(b.state().menus.length,0);assert.equal(b.state().plans.length,2);a.dom.window.close();b.dom.window.close();
});
test('pantry reminders can be saved, used to find recipes, reloaded and cleared',()=>{
 const a=app();a.route('pantry');a.click('[data-act="pantry-add"]');a.set('#pantry-name','Pasta');a.set('#pantry-qty','500');
 const today=a.w.PlatesCore.today();a.set('#pantry-use-soon',today);a.submit('#pantry-form');
 assert.equal(a.state().pantry[0].useSoon,today);assert.match(a.q('.use-soon-panel').textContent,/Today/);
 const b=app({'three-plates-v3':JSON.stringify(a.state())});b.route('pantry');assert.ok(b.q('.use-soon-panel'));b.click('[data-act="pantry-recipes"]');b.route('choose');assert.equal(b.state().filters.query,'Pasta');assert.ok(b.q('.meal-card'));assert.equal(b.state().pantry[0].qty,500);
 b.route('pantry');b.click('[data-act="pantry-edit"]');b.set('#pantry-use-soon','');b.submit('#pantry-form');assert.equal(b.state().pantry[0].useSoon,undefined);assert.equal(b.q('.use-soon-panel'),null);a.dom.window.close();b.dom.window.close();
});
test('always-stocked pantry entries do not carry dated reminders',()=>{
 const a=app();a.route('pantry');a.click('[data-act="pantry-add"]');a.set('#pantry-name','Pasta');a.set('#pantry-qty','500');a.set('#pantry-use-soon',a.w.PlatesCore.today());a.q('#pantry-always').checked=true;a.submit('#pantry-form');
 assert.equal(a.state().pantry[0].always,true);assert.equal(a.state().pantry[0].useSoon,undefined);assert.equal(a.q('.use-soon-panel'),null);a.dom.window.close();
});
test('refresh keeps locked card and exhausts unseen eligible recipes first',()=>{
 const a=app();const ids=()=>Array.from(a.w.document.querySelectorAll('[data-act="keep"]'),b=>b.dataset.id);
 const first=ids();assert.equal(first.length,3);a.click('[data-act="keep"]');a.click('[data-act="refresh"]');const next=ids();assert.ok(next.includes(first[0]));assert.equal(next.filter(x=>first.slice(1).includes(x)).length,0);a.dom.window.close();
});
test('trip selector preserves usual shop, survives reload, and exact search plans a batch',()=>{
 const a=app();a.route('shop');a.set('#shop-select','Tesco');a.click('#shop-trip');a.set('#shop-select','Aldi');assert.equal(a.state().shop,'Tesco');assert.equal(a.state().tripShop,'Aldi');
 a.route('batch');a.set('#bf-people','2');a.set('#bf-style','variety');a.q('#recipe-search').value='beef bolognese sauce';a.submit('#search-form');assert.equal(a.w.document.querySelectorAll('.meal-card').length,1);a.click('[data-act="batch-add"]');assert.equal(a.q('#batch-portions').value,'6');a.submit('#batch-form');assert.equal(a.state().batches[0].servings,6);
 const restored=app({'three-plates-v3':JSON.stringify(a.state())});restored.route('shop');assert.equal(restored.q('#shop-select').value,'Aldi');restored.click('#shop-trip');assert.equal(restored.q('#shop-select').value,'Tesco');a.dom.window.close();restored.dom.window.close();
});
test('v1 migration preserves original; corrupted current data blocks mutations',()=>{
 const old=JSON.stringify({version:1,pantry:[{id:'rice',qty:750}],bought:{rice:300},prefs:{favourites:['pesto-pea-pasta']}});
 const a=app({'three-plates-v1':old});assert.equal(a.w.localStorage.getItem('three-plates-v1'),old);assert.equal(a.state().pantry[0].qty,750);assert.equal(a.state().bought.rice,300);a.dom.window.close();
 const b=app({'three-plates-v3':'{broken'});b.click('[data-act="plan-add"]');assert.equal(b.w.localStorage.getItem('three-plates-v3'),'{broken');assert.match(b.q('#main').textContent,/saving is paused/);b.dom.window.close();
});
test('storage write failures are visible and keyboard focus survives filter updates',()=>{
 const a=app({},true);a.q('#f-servings').focus();a.set('#f-servings','3');assert.match(a.q('#main').textContent,/cannot save changes/);assert.equal(a.w.document.activeElement.id,'f-servings');a.dom.window.close();
});
test('untrusted custom ingredient names render as text',()=>{
 const a=app({'three-plates-v3':JSON.stringify({version:3,custom:{'custom-x':{name:'<img src=x onerror=alert(1)>',unit:'g'}},pantry:[{id:'custom-x',qty:20}]})});a.route('pantry');assert.equal(a.q('#main img'),null);assert.match(a.q('#main').textContent,/<img/);a.dom.window.close();
});
test('whole batch UI records allocation and prevents a second ingredient deduction',()=>{
 const a=app();a.route('batch');a.q('#recipe-search').value='beef bolognese sauce';a.submit('#search-form');a.click('[data-act="batch-add"]');a.set('#batch-portions','4');a.submit('#batch-form');a.click('[data-act="batch-finish"]');a.set('#freezer-qty','2');a.set('#fridge-qty','2');a.q('#freezer-confirm').checked=true;a.q('#storage-confirm').checked=true;a.submit('#finish-batch-form');assert.equal(a.state().lots.length,2);assert.deepEqual(a.state().batches[0].allocation,{eat:0,fridge:2,freezer:2});a.route('batch');assert.equal(a.q('[data-act="batch-finish"]'),null);a.dom.window.close();
});
test('export and restore use the same validated state including purchase history',async()=>{
 const a=app();a.route('shop');a.set('#shop-select','Aldi');a.route('you');let blob;
 a.w.URL.createObjectURL=b=>{blob=b;return 'blob:test';};a.w.URL.revokeObjectURL=()=>{};a.w.HTMLAnchorElement.prototype.click=()=>{};
 a.click('[data-act="export"]');const text=await new Promise(resolve=>{const r=new a.w.FileReader();r.onload=()=>resolve(r.result);r.readAsText(blob);});
 const b=app();b.route('you');await new Promise(r=>setImmediate(r));Object.defineProperty(b.q('#backup-file'),'files',{value:[{size:text.length,text:async()=>text}]});b.q('#backup-file').dispatchEvent(new b.w.Event('change',{bubbles:true}));await new Promise(r=>setImmediate(r));b.click('#confirm-action');assert.equal(b.state().shop,'Aldi');assert.deepEqual(b.state(),JSON.parse(text));a.dom.window.close();b.dom.window.close();
});
test('invalid restore and cross-tab update cannot overwrite existing browser data',async()=>{
 const a=app();a.route('shop');a.set('#shop-select','Tesco');const prior=a.w.localStorage.getItem('three-plates-v3');a.route('you');
 Object.defineProperty(a.q('#backup-file'),'files',{value:[{size:12,text:async()=>'{not json'}]});a.q('#backup-file').dispatchEvent(new a.w.Event('change',{bubbles:true}));await new Promise(r=>setImmediate(r));assert.equal(a.w.localStorage.getItem('three-plates-v3'),prior);
 a.w.dispatchEvent(new a.w.StorageEvent('storage',{key:'three-plates-v3',newValue:prior}));a.route('shop');a.set('#shop-select','Aldi');assert.equal(a.w.localStorage.getItem('three-plates-v3'),prior);assert.match(a.q('#main').textContent,/another tab/);a.dom.window.close();
});
test('shopping UI records actual whole packs and keeps them through a trip change',()=>{
 const a=app();a.route('batch');a.q('#recipe-search').value='chilli';a.submit('#search-form');a.click('[data-act="batch-add"]');a.set('#batch-portions','6');a.submit('#batch-form');a.route('shop');a.set('#pack-mode','packs');a.click('[data-act="bought"][data-id="beef-mince"]');assert.equal(a.state().bought['beef-mince'],1000);assert.equal(a.state().purchaseHistory[0].pack.size,500);a.click('#shop-trip');a.set('#shop-select','Tesco');assert.equal(a.state().purchaseHistory[0].retailer,'none');a.click('[data-act="stock-bought"]');assert.equal(a.state().pantry.find(p=>p.id==='beef-mince').qty,1000);a.dom.window.close();
});
test('shared Choose screen exposes inline batch settings and keeps each workflow intact',()=>{
 const a=app();assert.equal(a.w.document.querySelectorAll('#nav a').length,4);assert.equal(a.q('#batch-mode').checked,false);assert.equal(a.q('#batch-options').hidden,true);
 a.set('#f-servings','3');a.click('#batch-mode');assert.equal(a.q('#batch-mode').checked,true);assert.equal(a.q('#batch-options').hidden,false);assert.ok(a.q('#bf-days'));assert.equal(a.q('h1').textContent,'What’s cooking?');assert.equal(a.q('#nav [aria-current="page"]').getAttribute('href'),'#choose');
 a.set('#bf-people','2');a.click('[data-act="mode"][data-id="pantry"]');assert.equal(a.state().batchFilters.mode,'pantry');assert.equal(a.state().filters.mode,'any');
 a.click('#batch-mode');assert.equal(a.q('#f-servings').value,'3');a.click('#batch-mode');assert.equal(a.q('#bf-people').value,'2');assert.equal(a.w.document.querySelectorAll('.meal-card').length,3);a.dom.window.close();
});
test('visible time and method buttons filter both workflows and retain keyboard focus',()=>{
 const a=app();assert.equal(a.q('.tap-filters select'),null);assert.equal(a.q('.tap-filters details'),null);
 a.q('#f-time-any').focus();a.click('#f-time-any');assert.equal(a.state().filters.time,'any');assert.equal(a.w.document.activeElement.id,'f-time-any');
 a.click('#f-method-hob');assert.equal(a.state().filters.method,'hob');assert.equal(a.q('#f-method-hob').getAttribute('aria-pressed'),'true');
 a.click('#batch-mode');a.click('#bf-time-30');a.click('#bf-method-hob');assert.equal(a.state().batchFilters.time,'30');assert.equal(a.state().batchFilters.method,'hob');assert.equal(a.state().filters.time,'any');a.dom.window.close();
});
test('pantry search filters names without modifying stock and clears cleanly',()=>{const a=app({'three-plates-v3':JSON.stringify({version:3,pantry:[{id:'rice',qty:400},{id:'pasta',qty:200}]})});a.route('pantry');a.q('#pantry-search').value='rice';a.submit('#pantry-search-form');assert.equal(a.w.document.querySelectorAll('.pantry-item').length,1);assert.match(a.q('.pantry-item').textContent,/rice/i);a.q('#pantry-search').value='no such product';a.submit('#pantry-search-form');assert.match(a.q('main').textContent,/No pantry items match/);a.click('[data-act="pantry-search-clear"]');assert.equal(a.w.document.querySelectorAll('.pantry-item').length,2);a.dom.window.close();});
test('searchable food preferences accept an ingredient name and reject unknown text',()=>{const a=app();a.route('you');a.q('#pref-exclusions').value='pasta';a.submit('.pref-form[data-key="exclusions"]');assert.ok(a.state().prefs.exclusions.includes('pasta'));a.q('#pref-exclusions').value='not a real ingredient';a.submit('.pref-form[data-key="exclusions"]');assert.equal(a.state().prefs.exclusions.length,1);a.dom.window.close();});
test('failed plan writes roll back and do not report a saved meal',()=>{const a=app({},true);a.click('[data-act="plan-add"]');assert.match(a.q('#main').textContent,/cannot save changes/);assert.doesNotMatch(a.q('#toast').textContent,/added to/i);a.route('plan');assert.equal(a.w.document.querySelectorAll('.plan-card').length,0);a.dom.window.close();});
test('cuisines are searchable and only selected choices occupy the settings page',()=>{const a=app();a.route('you');assert.equal(a.w.document.querySelectorAll('[data-act="cuisine"]').length,0);a.q('#pref-cuisine').value='Italian';a.submit('#cuisine-form');assert.ok(a.state().prefs.cuisines.includes('Italian'));assert.equal(a.w.document.querySelectorAll('[data-act="cuisine"]').length,1);a.click('[data-act="cuisine"]');assert.equal(a.state().prefs.cuisines.length,0);a.dom.window.close();});
test('linking custom pantry stock into a recipe ingredient combines rather than replaces',()=>{const a=app({'three-plates-v3':JSON.stringify({version:3,custom:{'custom-penne':{id:'custom-penne',name:'Brand penne',unit:'g',group:'Other'}},pantry:[{id:'custom-penne',qty:250},{id:'pasta',qty:100}]})});a.route('pantry');a.click('[data-act="pantry-link"]');a.q('#link-target').value='pasta';a.q('#link-target').dispatchEvent(new a.w.Event('change'));assert.equal(a.q('#link-qty').value,'250');a.q('#link-confirm').checked=true;a.submit('#pantry-link-form');assert.equal(a.state().pantry.length,1);assert.equal(a.state().pantry[0].qty,350);assert.equal(a.state().pantry[0].id,'pasta');a.dom.window.close();});
test('ordinary pantry editing cannot silently overwrite a different ingredient',()=>{const a=app({'three-plates-v3':JSON.stringify({version:3,custom:{'custom-penne':{id:'custom-penne',name:'Brand penne',unit:'g',group:'Other'}},pantry:[{id:'custom-penne',qty:250},{id:'pasta',qty:100}]})});a.route('pantry');a.click('[data-act="pantry-edit"][data-id="custom-penne"]');a.q('#pantry-name').value='pasta';a.submit('#pantry-form');assert.equal(a.state().pantry.length,2);assert.equal(a.state().pantry.find(p=>p.id==='pasta').qty,100);assert.match(a.q('#toast').textContent,/Link to recipes/);a.dom.window.close();});
test('fresh meal flows through partial pantry, pack shopping, transfer and one cooking deduction',()=>{const a=app({'three-plates-v3':JSON.stringify({version:3,pantry:[{id:'pasta',qty:100}],packMode:'packs',packs:{none:{pasta:{size:500}}}})});a.q('#recipe-search').value='Pesto & pea pasta';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');a.route('shop');a.click('[data-act="bought"][data-id="pasta"]');assert.equal(a.state().bought.pasta,500);for(const b of [...a.w.document.querySelectorAll('[data-act="bought"]')]){if(b.dataset.id!=='pasta')a.click('[data-act="bought"][data-id="'+b.dataset.id+'"]');}a.click('[data-act="stock-bought"]');assert.equal(a.state().pantry.find(p=>p.id==='pasta').qty,600);assert.equal(Object.keys(a.state().bought).length,0);a.route('plan');a.click('[data-act="plan-finish"]');assert.equal(a.state().pantry.find(p=>p.id==='pasta').qty,420);assert.equal(a.state().plans[0].cooked,true);assert.equal(a.q('[data-act="plan-finish"]'),null);a.route('shop');assert.equal(a.w.document.querySelectorAll('[data-act="bought"]').length,0);const b=app({'three-plates-v3':JSON.stringify(a.state())});assert.equal(b.state().pantry.find(p=>p.id==='pasta').qty,420);assert.equal(b.state().plans[0].cooked,true);a.dom.window.close();b.dom.window.close();});
test('destructive actions use cancellable in-app confirmation and submit only once',()=>{const a=app({'three-plates-v3':JSON.stringify({version:3,pantry:[{id:'pasta',qty:200}]})});a.route('pantry');a.q('[data-act="pantry-remove"]').click();assert.ok(a.q('#confirm-action'));assert.equal(a.state().pantry.length,1);a.q('[data-act="close"]').click();assert.equal(a.state().pantry.length,1);a.q('[data-act="pantry-remove"]').click();const confirm=a.q('#confirm-action');confirm.click();confirm.click();assert.equal(a.state().pantry.length,0);a.dom.window.close();});
test('plan portion editing uses the shared stepper and updates shopping requirements',()=>{const a=app();a.q('#recipe-search').value='Pesto & pea pasta';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');a.route('plan');a.click('[data-act="plan-edit"]');assert.equal(a.q('#plan-portions').value,'2');a.click('#plan-portions-plus');a.submit('#plan-portions-form');assert.equal(a.state().plans[0].servings,3);a.route('shop');assert.match(a.q('[data-act="bought"][data-id="pasta"]').closest('.shopping-row').textContent,/270/);a.dom.window.close();});
test('replacement confirmation preserves the meal until explicitly confirmed',()=>{const a=app();a.q('#recipe-search').value='Pesto & pea pasta';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');const before=JSON.stringify(a.state().plans);a.q('[data-act="plan-add"][data-id="pesto-pea-pasta"]').click();assert.ok(a.q('#confirm-action'));a.q('[data-act="close"]').click();assert.equal(JSON.stringify(a.state().plans),before);a.q('[data-act="plan-add"][data-id="pesto-pea-pasta"]').click();a.q('#confirm-action').click();assert.equal(a.state().plans.length,1);a.dom.window.close();});
test('restore confirmation refuses to overwrite data changed while reviewing the backup',async()=>{const a=app();a.route('shop');a.set('#shop-select','Tesco');a.route('you');await new Promise(r=>setImmediate(r));const backup=JSON.stringify({...a.state(),shop:'Aldi'});Object.defineProperty(a.q('#backup-file'),'files',{value:[{size:backup.length,text:async()=>backup}]});a.q('#backup-file').dispatchEvent(new a.w.Event('change',{bubbles:true}));await new Promise(r=>setImmediate(r));assert.ok(a.q('#confirm-action'));const updated=JSON.stringify({...a.state(),shop:'Waitrose'});a.w.localStorage.setItem('three-plates-v3',updated);a.q('#confirm-action').click();assert.equal(a.w.localStorage.getItem('three-plates-v3'),updated);assert.match(a.q('#toast').textContent,/Data changed/);a.dom.window.close();});
test('failed reset restores already-removed current data and leaves old backup intact',()=>{const a=app();a.route('shop');a.set('#shop-select','Tesco');a.w.localStorage.setItem('three-plates-v1','legacy-backup');const prior=a.w.localStorage.getItem('three-plates-v3'),remove=a.w.Storage.prototype.removeItem;a.w.Storage.prototype.removeItem=function(key){if(key==='three-plates-v1')throw Error('blocked');return remove.call(this,key)};a.route('you');a.click('[data-act="reset"]');assert.equal(a.w.localStorage.getItem('three-plates-v3'),prior);assert.equal(a.w.localStorage.getItem('three-plates-v1'),'legacy-backup');assert.match(a.q('#toast').textContent,/Existing data was retained/);a.dom.window.close();});
test('copied shopping list names the active trip shop rather than usual shop',async()=>{const a=app();a.route('shop');await new Promise(r=>setImmediate(r));a.set('#shop-select','Aldi');a.click('#shop-trip');a.set('#shop-select','Tesco');a.click('[data-act="copy-list"]');await new Promise(r=>setImmediate(r));assert.match(a.q('#copy-text').value,/THREE PLATES — Tesco/);assert.equal(a.state().shop,'Aldi');a.dom.window.close();});

test('planned recipe views use their own servings and cannot accidentally add another meal',()=>{
 const a=app();a.set('#f-servings','4');a.q('#recipe-search').value='Pesto & pea pasta';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');a.set('#f-servings','1');a.route('plan');
 a.click('[data-act="recipe"][data-context="plan"]');assert.match(a.q('#recipe-amounts').textContent,/360 g/);assert.match(a.q('.sheet .notice').textContent,/4 portions/);assert.equal(a.q('.sheet [data-act="plan-add"]'),null);assert.equal(a.q('#recipe-portions'),null);a.click('[data-act="close"]');
 a.route('batch');a.q('#recipe-search').value='beef bolognese sauce';a.submit('#search-form');a.click('[data-act="batch-add"]');a.set('#batch-portions','6');a.submit('#batch-form');a.route('plan');a.click('[data-act="recipe"][data-context="batch"]');assert.match(a.q('.sheet .notice').textContent,/6 portions/);assert.match(a.q('#recipe-amounts').textContent,/750 g/);assert.equal(a.q('.sheet [data-act="batch-add"]'),null);a.dom.window.close();
});
test('stored meal recipe separates its fresh side from already-cooked ingredients',()=>{
 const setup=app(),C=setup.w.PlatesCore,R=setup.w.PLATES_DATA.recipes,s=C.defaults(),now=Date.now();
 s.batches.push({id:'batch-test',recipeId:'prep-chilli',servings:6,date:C.today(),cooked:false});C.finishBatch(s,'batch-test',{eat:0,fridge:0,freezer:6,cookedAt:new Date(now-60000).toISOString(),freezerConfirmed:true},R,now);
 C.scheduleLot(s,s.lots[0].id,C.today(),'Dinner',2,1,'rice',R,now,'18:00');
 const a=app({'three-plates-v3':JSON.stringify(s)});a.route('plan');a.click('[data-act="recipe"][data-context="plan"]');assert.match(a.q('.sheet').textContent,/Fresh side for this meal/);assert.match(a.q('.sheet').textContent,/150 g/);assert.match(a.q('.sheet').textContent,/Already prepared ingredients/);assert.match(a.q('#recipe-amounts').textContent,/250 g/);a.click('[data-act="close"]');
 a.route('pantry');a.click('[data-act="pantry-tab"][data-id="prepared"]');a.click('[data-act="recipe"][data-context="lot"]');assert.match(a.q('.sheet .notice').textContent,/Original cooked batch.*6 portions/);assert.match(a.q('#recipe-amounts').textContent,/750 g/);assert.equal(a.state().lots[0].portions,6);setup.dom.window.close();a.dom.window.close();
});

test('broad recipe searches progressively reveal unique results and reset on filter changes',()=>{
 const a=app();a.click('#f-time-any');a.q('#recipe-search').value='chicken';a.submit('#search-form');const cards=()=>Array.from(a.w.document.querySelectorAll('.meal-card'));const ids=()=>cards().map(c=>c.querySelector('[data-act="recipe"]').dataset.id);assert.equal(cards().length,12);const first=ids();a.click('#search-more');assert.equal(cards().length,24);assert.deepEqual(ids().slice(0,12),first);assert.equal(new Set(ids()).size,24);assert.equal(a.w.document.activeElement.id,'recipe-title-'+ids()[12]);
 let clicks=0;while(a.q('#search-more')&&clicks++<100)a.click('#search-more');assert.equal(a.q('#search-more'),null);assert.match(a.q('.search-progress').textContent,new RegExp('Showing '+cards().length+' of '+cards().length));assert.equal(new Set(ids()).size,cards().length);
 a.q('#recipe-search').value='pasta';a.submit('#search-form');assert.equal(cards().length,12);a.click('#search-more');a.click('#f-method-hob');assert.ok(cards().length<=12);a.click('[data-act="clear-search"]');assert.equal(cards().length,3);assert.equal(a.q('#search-more'),null);a.dom.window.close();
});

test('reviewed sides stay searchable without occupying automatic dinner choices',()=>{
 const a=app();a.click('#f-time-any');a.click('#f-method-air-fryer');a.q('#recipe-search').value='radishes';a.submit('#search-form');assert.match(a.q('.meal-card').textContent,/Side dish/);assert.equal(a.q('[data-act="recipe"]').dataset.id,'sp-skinnytaste-air-fryer-radishes');a.click('[data-act="clear-search"]');for(let i=0;i<12;i++){assert.doesNotMatch(a.q('main').textContent,/Air Fryer Radishes/);a.click('[data-act="refresh"]');}
 a.click('#f-method-microwave');a.q('#recipe-search').value='macaroni';a.submit('#search-form');assert.match(a.q('.meal-card').textContent,/Microwave macaroni cheese/);a.dom.window.close();
});

test('recipe side picker previews amounts, saves to the meal and shopping, and survives reload',()=>{
 const a=app();a.q('#recipe-search').value='Pesto & pea pasta';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');a.route('plan');a.click('[data-act="plan-side"]');assert.equal(a.w.document.querySelectorAll('.side-option').length,8);a.click('#side-more');assert.equal(a.w.document.querySelectorAll('.side-option').length,16);
 a.q('#side-search').value='radishes air fryer';a.q('#side-search').dispatchEvent(new a.w.Event('input',{bubbles:true}));assert.equal(a.w.document.querySelectorAll('.side-option').length,1);assert.match(a.q('#side-results').textContent,/Ingredients for 2 portions/);assert.match(a.q('#side-results').textContent,/Skinnytaste/);const stock=JSON.stringify(a.state().pantry);a.click('[data-act="side-choice"][data-id="recipe:sp-skinnytaste-air-fryer-radishes"]');assert.equal(a.state().plans[0].side,'recipe:sp-skinnytaste-air-fryer-radishes');assert.equal(JSON.stringify(a.state().pantry),stock);
 const b=app({'three-plates-v3':JSON.stringify(a.state())});b.route('plan');assert.match(b.q('main').textContent,/Air Fryer Radishes added separately/);b.click('[data-context="plan"]');assert.match(b.q('.sheet').textContent,/Fresh side.*Air Fryer Radishes/);assert.ok(b.q('.sheet a[href="https://www.skinnytaste.com/air-fryer-radishes/"]'));b.click('.sheet [data-act="close"]');b.route('shop');assert.match(b.q('main').textContent,/radishes/i);b.route('plan');b.click('[data-act="plan-side"]');b.click('[data-act="side-choice"][data-id="none"]');assert.equal(b.state().plans[0].side,'none');a.dom.window.close();b.dom.window.close();
});

test('side save failure keeps the original plan and the picker open',()=>{
 const a=app();a.q('#recipe-search').value='Pesto & pea pasta';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');const saved=JSON.stringify(a.state());a.dom.window.close();const b=app({'three-plates-v3':saved},true);b.route('plan');b.click('[data-act="plan-side"]');b.click('[data-act="side-choice"][data-id="rice"]');assert.equal(b.state().plans[0].side,'none');assert.ok(b.q('#sheet').open);assert.match(b.q('#toast').textContent,/cannot save/);b.dom.window.close();
});

test('recipe and allocation touch steppers update quantities and re-enable correctly at limits',()=>{
 const a=app();a.q('#recipe-search').value='Pesto & pea pasta';a.submit('#search-form');a.click('[data-act="recipe"][data-id="pesto-pea-pasta"]');a.click('#recipe-portions-minus');assert.equal(a.q('#recipe-portions').value,'1');assert.equal(a.q('#recipe-portions-minus').getAttribute('aria-disabled'),'true');a.click('#recipe-portions-plus');assert.equal(a.q('#recipe-portions-minus').getAttribute('aria-disabled'),'false');a.click('#recipe-portions-plus');assert.match(a.q('#recipe-amounts').textContent,/270 g/);a.click('.sheet [data-act="plan-add"]');assert.equal(a.state().plans[0].servings,3);
 a.route('batch');a.click('#bf-time-any');a.click('[data-act="batch-add"]');a.set('#batch-portions','4');a.submit('#batch-form');a.route('plan');a.click('[data-act="batch-finish"]');a.click('#freezer-qty-minus');a.click('#eat-now-plus');assert.equal(a.q('#freezer-qty').value,'3');assert.equal(a.q('#eat-now').value,'1');assert.equal(a.q('#eat-now-minus').getAttribute('aria-disabled'),'false');a.q('#freezer-confirm').checked=true;a.q('#storage-confirm').checked=true;a.submit('#finish-batch-form');a.route('pantry');a.click('[data-act="lot-plan"]');a.set('#lot-days','3');a.set('#lot-servings','2');assert.equal(a.q('#lot-days').value,'1');assert.equal(a.q('#lot-days-plus').getAttribute('aria-disabled'),'true');a.dom.window.close();
});

test('recipe drafts survive filters, headcount and mode navigation without applying or saving each keystroke',()=>{
 const a=app();
 const type=(text)=>{a.q('#recipe-search').value=text;a.q('#recipe-search').dispatchEvent(new a.w.Event('input',{bubbles:true}));};
 const saved=a.w.localStorage.getItem('three-plates-v3');
 type('pesto');assert.equal(a.w.localStorage.getItem('three-plates-v3'),saved);
 a.click('#f-method-hob');assert.equal(a.q('#recipe-search').value,'pesto');assert.equal(a.state().filters.query,'');
 a.set('#f-servings','3');assert.equal(a.q('#recipe-search').value,'pesto');
 a.route('batch');assert.equal(a.q('#recipe-search').value,'');type('bolognese');a.click('#bf-time-any');assert.equal(a.q('#recipe-search').value,'bolognese');
 a.route('choose');assert.equal(a.q('#recipe-search').value,'pesto');a.submit('#search-form');assert.equal(a.state().filters.query,'pesto');assert.match(a.q('.meal-card').textContent,/Pesto/);
 a.route('batch');assert.equal(a.q('#recipe-search').value,'bolognese');a.submit('#search-form');assert.equal(a.state().batchFilters.query,'bolognese');
 const b=app({'three-plates-v3':JSON.stringify(a.state())});assert.equal(b.q('#recipe-search').value,'pesto');b.route('batch');assert.equal(b.q('#recipe-search').value,'bolognese');a.dom.window.close();b.dom.window.close();
});

test('clear and reset remove drafts while a rejected save keeps text for retry',()=>{
 const a=app();const type=text=>{a.q('#recipe-search').value=text;a.q('#recipe-search').dispatchEvent(new a.w.Event('input',{bubbles:true}));};
 type('unfinished');a.click('[data-act="clear-search"]');assert.equal(a.q('#recipe-search').value,'');
 type('no such recipe abcdef');a.submit('#search-form');type('another draft');a.click('[data-act="reset-filters"]');assert.equal(a.q('#recipe-search').value,'');assert.equal(a.state().filters.query,'');
 type('pesto');const original=a.w.Storage.prototype.setItem;a.w.Storage.prototype.setItem=()=>{throw Error('quota');};a.submit('#search-form');assert.equal(a.q('#recipe-search').value,'pesto');assert.equal(a.state().filters.query,'');
 a.w.Storage.prototype.setItem=original;a.submit('#search-form');assert.equal(a.state().filters.query,'pesto');a.dom.window.close();
});

test('pantry recipe shortcut replaces a stale choose draft with the selected ingredient',()=>{
 const a=app();a.q('#recipe-search').value='old draft';a.q('#recipe-search').dispatchEvent(new a.w.Event('input',{bubbles:true}));
 a.route('pantry');a.click('[data-act="pantry-add"]');a.set('#pantry-name','Pasta');a.set('#pantry-qty','500');a.set('#pantry-use-soon',a.w.PlatesCore.today());a.submit('#pantry-form');a.click('[data-act="pantry-recipes"]');a.route('choose');assert.equal(a.q('#recipe-search').value,'Pasta');assert.equal(a.state().filters.query,'Pasta');a.dom.window.close();
});

test('low-count publisher recipes leave discovery while saved plans remain readable and keep shopping',()=>{
 const a=app();a.click('#f-time-any');a.q('#recipe-search').value='Creamy White Bean Soup';a.submit('#search-form');assert.equal(a.q('[data-act="recipe"][data-id="curated-workweeklunch-white-bean-soup"]'),null);
 const state=a.state();state.plans=[{id:'legacy-rating',recipeId:'curated-workweeklunch-white-bean-soup',date:a.w.PlatesCore.today(),meal:'Dinner',servings:3,cooked:false}];const b=app({'three-plates-v3':JSON.stringify(state)});b.route('plan');b.click('[data-act="recipe"]');assert.match(b.q('#sheet').textContent,/Kept for saved recipes/);assert.match(b.q('#sheet').textContent,/2 ratings/);assert.equal(b.state().plans[0].recipeId,'curated-workweeklunch-white-bean-soup');b.click('[data-act="close"]');b.route('shop');assert.ok(b.q('.shopping-row'));a.dom.window.close();b.dom.window.close();
});

test('skip to content focuses the current page without changing route or saved data',()=>{
 const a=app();for(const name of ['choose','batch','plan','shop','pantry','you']){a.route(name);const heading=a.q('h1').textContent,saved=a.w.localStorage.getItem('three-plates-v3');const event=new a.w.MouseEvent('click',{bubbles:true,cancelable:true});a.q('.skip-link').dispatchEvent(event);assert.equal(event.defaultPrevented,true);assert.equal(a.w.location.hash,'#'+name);assert.equal(a.q('h1').textContent,heading);assert.equal(a.w.document.activeElement,a.q('main'));assert.equal(a.w.localStorage.getItem('three-plates-v3'),saved);}a.dom.window.close();
});

test('fish and seafood group stays compact across reload and can be removed without other exclusions',()=>{
 const a=app();a.route('you');a.set('#pref-exclusions','Fish & seafood');a.submit('.pref-form[data-key="exclusions"]');assert.equal(a.w.document.querySelectorAll('[data-act="pref-remove"][data-key="exclusions"]').length,1);assert.match(a.q('[data-act="pref-remove"][data-key="exclusions"]').textContent,/Fish & seafood/);
 a.set('#pref-exclusions','Garlic cloves');a.submit('.pref-form[data-key="exclusions"]');const b=app({'three-plates-v3':JSON.stringify(a.state())});b.route('you');assert.equal(b.w.document.querySelectorAll('[data-act="pref-remove"][data-key="exclusions"]').length,2);b.click('[data-act="pref-remove"][data-id="group-fish"]');assert.deepEqual(b.state().prefs.exclusions,['garlic']);a.dom.window.close();b.dom.window.close();
});

test('broad meat exclusions remain single removable chips after reload',()=>{
 const a=app();a.route('you');
 for(const label of ['Chicken — all cuts','Beef — all cuts','Pork — including sausages']){a.set('#pref-exclusions',label);a.submit('.pref-form[data-key="exclusions"]');}
 a.set('#pref-exclusions','Garlic cloves');a.submit('.pref-form[data-key="exclusions"]');
 const b=app({'three-plates-v3':JSON.stringify(a.state())});b.route('you');
 assert.equal(b.w.document.querySelectorAll('[data-act="pref-remove"][data-key="exclusions"]').length,4);
 for(const id of ['group-chicken','group-beef','group-pork'])b.click('[data-act="pref-remove"][data-id="'+id+'"]');
 assert.deepEqual(b.state().prefs.exclusions,['garlic']);a.dom.window.close();b.dom.window.close();
});

test('exact-weight pack editor ignores unused size and restores pack validation when toggled',()=>{
 const a=app();a.q('#recipe-search').value='Pesto & pea pasta';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');a.route('shop');a.click('[data-act="pack-edit"][data-id="pasta"]');
 a.set('#pack-size','0');assert.equal(a.q('#pack-form').checkValidity(),false);
 a.click('#pack-exact');assert.equal(a.q('#pack-size').disabled,true);assert.equal(a.q('#pack-form').checkValidity(),true);a.submit('#pack-form');
 assert.equal(a.state().packs.none.pasta.size,0);
 const b=app({'three-plates-v3':JSON.stringify(a.state())});b.route('shop');b.click('[data-act="pack-edit"][data-id="pasta"]');assert.equal(b.q('#pack-size').disabled,true);
 b.click('#pack-exact');assert.equal(b.q('#pack-size').disabled,false);assert.equal(b.q('#pack-size').required,true);b.set('#pack-size','750');b.set('#pack-product','Test pasta');b.set('#pack-url','https://example.com/pasta');b.submit('#pack-form');
 assert.equal(b.state().packs.none.pasta.size,750);b.click('[data-act="pack-edit"][data-id="pasta"]');assert.equal(b.q('#pack-product').value,'Test pasta');assert.equal(b.q('#pack-url').value,'https://example.com/pasta');a.dom.window.close();b.dom.window.close();
});

test('save guard preserves newer data before the storage event is delivered',()=>{
 const a=app();a.click("#f-time-any");const newer=a.state();newer.pantry=[{id:'pasta',qty:432,always:false}];const serialized=JSON.stringify(newer);a.w.localStorage.setItem('three-plates-v3',serialized);
 a.click('[data-act="plan-add"]');assert.equal(a.w.localStorage.getItem('three-plates-v3'),serialized);assert.match(a.q('.storage-warning').textContent,/another tab/);assert.ok(a.q('[data-act="reload"]'));a.dom.window.close();
});

test('cleared storage cannot be resurrected by a stale tab, with or without its event',()=>{
 for(const event of [true,false]){const a=app();a.click("#f-time-any");a.w.localStorage.clear();if(event)a.w.dispatchEvent(new a.w.StorageEvent('storage',{key:null,newValue:null}));a.click('[data-act="plan-add"]');assert.equal(a.w.localStorage.getItem('three-plates-v3'),null);assert.match(a.q('.storage-warning').textContent,/another tab/);a.dom.window.close();}
});

test('favourite ingredient groups stay compact and remove independently of exclusions',()=>{
 const a=app();a.route('you');a.set('#pref-likedIngredients','Chicken — all cuts');a.submit('.pref-form[data-key="likedIngredients"]');a.set('#pref-exclusions','Garlic cloves');a.submit('.pref-form[data-key="exclusions"]');
 const b=app({'three-plates-v3':JSON.stringify(a.state())});b.route('you');assert.equal(b.w.document.querySelectorAll('[data-act="pref-remove"][data-key="likedIngredients"]').length,1);b.click('[data-act="pref-remove"][data-key="likedIngredients"][data-id="group-chicken"]');assert.deepEqual(b.state().prefs.likedIngredients,[]);assert.deepEqual(b.state().prefs.exclusions,['garlic']);a.dom.window.close();b.dom.window.close();
});

test('pantry and preference pickers distinguish repeated names by readable units',()=>{
 const a=app();a.route('pantry');a.click('[data-act="pantry-add"]');
 const options=[...a.w.document.querySelectorAll('#ingredient-options option')].map(o=>o.value);
 assert.ok(options.includes('Milk (g)'));assert.ok(options.includes('Milk (ml)'));assert.ok(options.every(o=>!o.includes('[ex-')));
 a.set('#pantry-name','Milk');a.set('#pantry-qty','100');a.submit('#pantry-form');assert.equal(a.state()?.pantry.length||0,0);assert.match(a.q('#toast').textContent,/right unit/);
 a.set('#pantry-name','Milk (g)');a.set('#pantry-qty','100');a.submit('#pantry-form');assert.equal(a.state().pantry[0].id,'ex-milk-1c47d6ee');
 a.click('[data-act="pantry-edit"]');assert.equal(a.q('#pantry-name').value,'Milk (g)');a.set('#pantry-qty','75');a.submit('#pantry-form');assert.equal(a.state().pantry[0].qty,75);
 a.route('you');a.set('#pref-exclusions','Milk (ml)');a.submit('.pref-form[data-key="exclusions"]');assert.deepEqual(a.state().prefs.exclusions,['milk']);
 const b=app({'three-plates-v3':JSON.stringify(a.state())});assert.equal(b.state().pantry[0].id,'ex-milk-1c47d6ee');assert.equal(b.state().pantry[0].qty,75);a.dom.window.close();b.dom.window.close();
});

 test('Multiword recipe search works across fresh and batch modes and survives reload',()=>{
  const a=app();a.q('#recipe-search').value='pasta pea pesto';a.submit('#search-form');
  assert.ok(a.q('[data-act="plan-add"][data-id="pesto-pea-pasta"]'));
  a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');assert.equal(a.state().plans[0].recipeId,'pesto-pea-pasta');
  a.route('batch');a.click('#bf-time-any');a.q('#recipe-search').value='sauce beef bolognese';a.submit('#search-form');
  assert.ok(a.q('[data-act="batch-add"][data-id="prep-bolognese"]'));
  const b=app({'three-plates-v3':JSON.stringify(a.state())});b.route('batch');assert.equal(b.q('#recipe-search').value,'sauce beef bolognese');assert.ok(b.q('[data-act="batch-add"][data-id="prep-bolognese"]'));
  a.dom.window.close();b.dom.window.close();
 });

test('counted herb shopping shows bunches and retains the unused half after cooking',()=>{
 const a=app();a.click('#f-time-any');a.q('#recipe-search').value='thai fried rice prawns peas';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="gf2-thai-fried-rice-prawns-peas"]');a.route('shop');
 const id='coriander-small-bunch',row=a.q('[data-act="bought"][data-id="'+id+'"]').closest('.shopping-row');
 assert.match(row.textContent,/Need 0.5 bunches/);assert.equal(row.querySelector('.shopping-qty').textContent,'1 bunch');
 a.click('[data-act="bought"][data-id="'+id+'"]');a.click('[data-act="stock-bought"]');a.route('pantry');assert.match(a.q('main').textContent,/1 bunch/);
 a.route('plan');a.click('[data-act="plan-finish"]');a.click('#confirm-action');assert.equal(a.state().pantry.find(i=>i.id===id).qty,0.5);
 const b=app({'three-plates-v3':JSON.stringify(a.state())});b.route('pantry');assert.match(b.q('main').textContent,/0.5 bunches/);a.dom.window.close();b.dom.window.close();
});

test('required unmeasured seasoning appears in recipe, shopping, copy, cooking and prep',async()=>{
 const a=app();a.click('#f-time-any');a.q('#recipe-search').value='courgette soup';a.submit('#search-form');a.click('[data-act="recipe"][data-id="sp-gfmore-courgette-potato-cheddar-soup"]');assert.match(a.q('.sheet .unmeasured-ingredients').textContent,/nutmeg.*Check amount/i);a.click('.sheet [data-act="close"]');a.click('[data-act="plan-add"][data-id="sp-gfmore-courgette-potato-cheddar-soup"]');
 a.route('shop');assert.match(a.q('.unmeasured-ingredients').textContent,/nutmeg.*Check amount/i);
 let copied='';Object.defineProperty(a.w.navigator,'clipboard',{value:{writeText:async t=>{copied=t;}}});a.click('[data-act="copy-list"]');await new Promise(r=>setImmediate(r));assert.match(copied,/CHECK AMOUNT: Fresh nutmeg/);
 a.route('plan');a.click('[data-act="cooking"]');assert.match(a.q('#cooking-panel .unmeasured-ingredients').textContent,/nutmeg/i);a.click('.sheet [data-act="close"]');
 a.click('[data-act="prep"]');a.q('[name="prep-ref"]').checked=true;a.submit('#prep-select-form');assert.match(a.q('#prep-panel .unmeasured-ingredients').textContent,/nutmeg/i);
 a.dom.window.close();
});

test('always-stocked unknown amounts agree across coverage, no-shopping and copied reminders',async()=>{
 const a=app();const C=a.w.PlatesCore,R=a.w.PLATES_DATA.recipes,r=R.find(r=>r.id==='sp-gfmore-courgette-potato-cheddar-soup');
 const seed=C.defaults();seed.filters={...seed.filters,query:'courgette soup',time:'any',mode:'only'};seed.pantry=C.scaled(r,2).map(i=>({...i,always:false}));seed.pantry.push({id:'ex-fresh-nutmeg-8f09666c',qty:0,always:true});
 const b=app({'three-plates-v3':JSON.stringify(seed)});assert.ok(b.q('[data-act="plan-add"][data-id="'+r.id+'"]'));assert.match(b.q('.meal-card').textContent,/6 \/ 6/);b.click('[data-act="plan-add"][data-id="'+r.id+'"]');b.route('shop');assert.match(b.q('.unmeasured-ingredients').textContent,/Always stocked — assumed enough/);
 let text='';Object.defineProperty(b.w.navigator,'clipboard',{value:{writeText:async t=>{text=t;}}});b.click('[data-act="copy-list"]');await new Promise(r=>setImmediate(r));assert.match(text,/ASSUMED STOCKED — CHECK RECIPE AMOUNT: Fresh nutmeg/);
 assert.equal(b.state().pantry.find(i=>i.id==='ex-fresh-nutmeg-8f09666c').always,true);a.dom.window.close();b.dom.window.close();
});

test('pantry search accepts reordered product words and preserves stock after clearing',()=>{
 const a=app({'three-plates-v3':JSON.stringify({version:3,pantry:[{id:'peas',qty:400},{id:'pasta',qty:200}]})});
 a.route('pantry');const before=JSON.stringify(a.state().pantry);a.q('#pantry-search').value='peas frozen';a.submit('#pantry-search-form');
 assert.equal(a.w.document.querySelectorAll('.pantry-item').length,1);assert.match(a.q('.pantry-item').textContent,/Frozen peas/);
 a.click('[data-act="pantry-search-clear"]');assert.equal(a.w.document.querySelectorAll('.pantry-item').length,2);assert.equal(JSON.stringify(a.state().pantry),before);a.dom.window.close();
});

test('turning off menu portion adjustment excludes its hidden invalid input from validation',()=>{
 const a=app();a.q('#recipe-search').value='pesto pea pasta';a.submit('#search-form');a.click('[data-act="plan-add"][data-id="pesto-pea-pasta"]');a.route('plan');a.click('[data-act="menus"]');a.click('[data-act="menu-save"]');a.q('#menu-name').value='Keep my portions';a.submit('#menu-save-form');a.click('[data-act="menu-use"]');
 const adjust=a.q('#menu-adjust'),people=a.q('#menu-people'),form=a.q('#menu-use-form');
 assert.equal(people.disabled,true);assert.equal(form.checkValidity(),true);
 for(const invalid of ['', '13', '1.5']){
  adjust.checked=true;adjust.dispatchEvent(new a.w.Event('change',{bubbles:true}));assert.equal(people.disabled,false);
  people.value=invalid;people.dispatchEvent(new a.w.Event('change',{bubbles:true}));assert.equal(form.checkValidity(),false);
  adjust.checked=false;adjust.dispatchEvent(new a.w.Event('change',{bubbles:true}));assert.equal(people.disabled,true);assert.equal(form.checkValidity(),true);assert.equal(a.q('#menu-apply').disabled,false);
 }
 const before=a.state();a.q('#menu-apply').click();const saved=a.state();assert.equal(saved.plans.length,2);assert.equal(saved.plans[1].servings,before.plans[0].servings);assert.deepEqual(saved.pantry,before.pantry);a.dom.window.close();
 const b=app({'three-plates-v3':JSON.stringify(saved)});assert.equal(b.state().plans.length,2);assert.equal(b.state().plans[1].servings,2);b.dom.window.close();
});

test('publisher recipe actions precede ingredients while detailed provenance stays expandable',()=>{
 const a=app();a.click('#f-time-any');while(a.q('.meal-stepper span').textContent!=='Baking')a.click('#f-meal-next');a.q('#recipe-search').value='ham cheese scones';a.submit('#search-form');a.click('[data-act="recipe"][data-id="sp-sally-ham-cheese-scones"]');
 const actions=a.q('#recipe-actions'),ingredients=a.q('#recipe-amounts'),notes=a.q('#recipe-source-notes');
 assert.ok(actions.compareDocumentPosition(ingredients)&a.w.Node.DOCUMENT_POSITION_FOLLOWING);assert.equal(notes.open,false);
 assert.equal(a.w.document.querySelectorAll('#sheet [data-act="plan-add"]').length,1);assert.match(notes.textContent,/175ml total/);assert.match(notes.textContent,/Source checked/);
 assert.match(actions.querySelector('a').href,/sallysbakingaddiction.com\/ham-cheese-scones/);
 notes.open=true;assert.match(notes.textContent,/Measured brushing buttermilk is included/);
 a.click('#recipe-portions-minus');assert.match(ingredients.textContent,/153.125 ml/);a.click('#recipe-actions [data-act="plan-add"]');assert.equal(a.state().plans[0].servings,7);
 a.route('plan');a.click('[data-act="recipe"][data-context="plan"]');assert.equal(a.q('#recipe-actions [data-act="plan-add"]'),null);assert.ok(a.q('#recipe-actions a'));assert.match(a.q('#recipe-amounts').textContent,/153.125 ml/);a.dom.window.close();
});
