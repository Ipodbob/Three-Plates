const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
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
 const a=app();a.click('#f-time-any');a.q('#recipe-search').value='air fryer salmon';a.submit('#search-form');assert.equal(a.w.document.querySelectorAll('.meal-card').length,1);assert.match(a.q('.recipe-rating').textContent,/4.6\/5.*62 ratings/);a.click('[data-act="recipe"][data-id="gf-air-fryer-salmon"]');const link=a.q('.sheet a.button');assert.equal(link.href,'https://www.bbcgoodfood.com/recipes/air-fryer-salmon');assert.match(link.textContent,/Read cooking method/);assert.match(a.q('.sheet').textContent,/Source checked 2026-09-28/);a.click('.sheet [data-act="plan-add"]');assert.equal(a.state().plans[0].recipeId,'gf-air-fryer-salmon');a.dom.window.close();
});
test('air fryer filter persists across reload in both cooking modes',()=>{
 const a=app();a.click('#f-method-air-fryer');a.route('batch');a.click('#bf-method-air-fryer');
 const b=app({'three-plates-v3':JSON.stringify(a.state())});assert.equal(b.state().filters.method,'air-fryer');assert.equal(b.q('#f-method-air-fryer').getAttribute('aria-pressed'),'true');b.route('batch');assert.equal(b.state().batchFilters.method,'air-fryer');assert.equal(b.q('#bf-method-air-fryer').getAttribute('aria-pressed'),'true');assert.equal(b.w.document.querySelectorAll('.meal-card').length,1);a.dom.window.close();b.dom.window.close();
});
test('quantity steppers respect limits, keep focus and update batch portions',()=>{
 const a=app();a.set('#f-servings','12');a.click('#f-servings-plus');assert.equal(a.state().filters.servings,12);a.click('#f-servings-minus');assert.equal(a.state().filters.servings,11);
 a.route('batch');a.set('#bf-days','1');a.set('#bf-people','2');a.click('#bf-days-minus');assert.equal(a.state().batchFilters.days,1);
 a.q('#bf-days-plus').focus();a.click('#bf-days-plus');assert.equal(a.w.document.activeElement.id,'bf-days-plus');assert.equal(a.state().batchFilters.days,2);assert.match(a.q('.portion-summary').textContent,/4 portions/);
 a.set('#bf-days','7');a.click('#bf-days-plus');assert.equal(a.state().batchFilters.days,7);a.set('#bf-people','6');a.click('#bf-people-plus');assert.equal(a.state().batchFilters.people,6);a.set('#bf-people','1');a.click('#bf-people-minus');assert.equal(a.state().batchFilters.people,1);a.dom.window.close();
});
function app(seed={},failStorage=false){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost/Three-Plates/',runScripts:'outside-only'}),w=dom.window;
 w.confirm=()=>true;w.scrollTo=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 for(const [key,value] of Object.entries(seed))w.localStorage.setItem(key,value);
 if(failStorage)w.Storage.prototype.setItem=()=>{throw Error('quota');};
 for(const file of ['recipes.js','batch-v3.js','recipes-rated.js','recipes-diverse.js','recipes-expanded.js','core-v3.js','phase1.js','app-v3.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 const q=selector=>w.document.querySelector(selector),click=selector=>{assert.ok(q(selector),selector);q(selector).click();},set=(selector,value)=>{assert.ok(q(selector),selector);q(selector).value=value;q(selector).dispatchEvent(new w.Event('change',{bubbles:true}));};
 const route=name=>{w.location.hash=name;w.dispatchEvent(new w.HashChangeEvent('hashchange'));};
 const submit=id=>q(id).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 return {w,q,click,set,route,submit,dom,state:()=>JSON.parse(w.localStorage.getItem('three-plates-v3'))};
}
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
 const b=app();b.route('you');Object.defineProperty(b.q('#backup-file'),'files',{value:[{size:text.length,text:async()=>text}]});b.q('#backup-file').dispatchEvent(new b.w.Event('change',{bubbles:true}));await new Promise(r=>setImmediate(r));assert.equal(b.state().shop,'Aldi');assert.deepEqual(b.state(),JSON.parse(text));a.dom.window.close();b.dom.window.close();
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
