const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../recipes.js');require('../batch-v3.js');require('../core-v3.js');
const C=require('../phase1.js'),R=PLATES_DATA.recipes,I=PLATES_DATA.ingredients;
const now=Date.parse('2026-09-28T10:00:00Z'),at=new Date(now-60000).toISOString();
function batch(s,id,n,recipeId='prep-chilli'){s.batches.push({id,recipeId,servings:n,date:'2026-09-28',cooked:false});}
function finish(s,id,fridge,freezer,eat=0){C.finishBatch(s,id,{eat,fridge,freezer,cookedAt:at,freezerConfirmed:true},R,now);}
test('ten portions across complementary batches, with immediate/fridge/freezer allocation',()=>{
 const s=C.defaults();s.batchFilters={...s.batchFilters,people:2,days:5,style:'variety'};
 assert.equal(C.batchPortions(s),6);batch(s,'a',6);assert.equal(C.batchPortions(s),4);batch(s,'b',4,'prep-dal');
 finish(s,'a',2,2,2);finish(s,'b',0,4);
 assert.equal(s.lots.reduce((n,l)=>n+l.portions,0),8);assert.deepEqual(s.batches[0].allocation,{eat:2,fridge:2,freezer:2});
 assert.deepEqual(C.requirements(s,R),{});assert.deepEqual(C.migrate(C.clone(s),R,I),s);
});
test('trip override, provenance and actual pack snapshots survive shop changes and transfers',()=>{
 const s=C.defaults();s.shop='Tesco';s.tripShop='Aldi';s.packMode='packs';
 s.packs.Aldi={'beef-mince':C.packRecord('beef-mince','Aldi',500,I,{product:'User checked mince',url:'https://example.org/product',verifiedOn:'2026-09-28'})};
 const p=C.purchase(s,'beef-mince',750,I);assert.deepEqual([p.count,p.qty,p.extra],[2,1000,250]);
 C.recordPurchase(s,'beef-mince',p.qty,I,{pack:p.pack});s.tripShop='Waitrose';
 assert.equal(s.purchaseHistory[0].retailer,'Aldi');assert.equal(s.purchaseHistory[0].pack.size,500);assert.equal(s.bought['beef-mince'],1000);
 s.tripShop=null;assert.equal(C.activeShop(s),'Tesco');C.transferBought(s);assert.equal(C.stock(s,'beef-mince'),1000);assert.equal(s.purchaseHistory[0].status,'stocked');
 assert.deepEqual(C.migrate(C.clone(s),R,I),s);
});
test('unknown shop pack data is labelled generic; exact mode and unsafe URL handling',()=>{
 const s=C.defaults();s.shop='Waitrose';s.packMode='packs';assert.equal(C.packFor(s,'beef-mince').provenance,'estimated');assert.equal(C.packFor(s,'beef-mince').retailer,null);
 assert.equal(C.packFor(s,'garlic'),null);s.packMode='exact';assert.equal(C.purchase(s,'beef-mince',750,I).qty,750);
 assert.equal(C.packRecord('chickpeas','Tesco',240,I,{url:'javascript:alert(1)'}).url,'');
 assert.equal(C.packRecord('chickpeas','Tesco',240,I).weightBasis,'drained');
});
test('purchase corrections retain historical values without duplicate pantry stock',()=>{
 const s=C.defaults();C.recordPurchase(s,'rice',1000,I);C.recordPurchase(s,'rice',500,I,{replace:true});
 assert.equal(s.purchaseHistory[0].qty,1000);assert.equal(s.purchaseHistory[0].status,'corrected');C.transferBought(s);C.transferBought(s);assert.equal(C.stock(s,'rice'),500);
});
test('cancelled reservations release stock; corrections and partial discard cannot overbook',()=>{
 const s=C.defaults();batch(s,'a',6);finish(s,'a',0,6);const l=s.lots[0];
 C.scheduleLot(s,l.id,'2026-09-28','Dinner',2,2,'rice',R,now);assert.throws(()=>C.correctLot(s,l.id,3,at));
 C.discardPortions(s,l.id,2);assert.equal(l.portions,4);assert.throws(()=>C.discardPortions(s,l.id,1));
 s.plans=[];assert.equal(C.lotAvailable(s,l),4);C.correctLot(s,l.id,6,at);assert.equal(l.portions,6);
 assert.throws(()=>C.correctLot(s,l.id,7,at));assert.throws(()=>C.correctLot(s,l.id,6,new Date(now).toISOString()));
});
test('eaten food stays consumed after removing plan history and after partial defrost',()=>{
 const s=C.defaults();batch(s,'a',6);finish(s,'a',0,6);C.scheduleLot(s,s.lots[0].id,'2026-09-28','Dinner',2,1,'none',R,now);
 const p=s.plans[0],lid=C.thawPlan(s,p.id,R,now);C.changeStorage(s,lid,'defrosted',R,now+1000,new Date(now+1000).toISOString());C.finishPlan(s,p.id,R,now+1000);
 s.plans=[];assert.throws(()=>C.correctLot(s,lid,2,at));assert.equal(s.lots.reduce((n,l)=>n+l.capacity,0),6);assert.doesNotThrow(()=>C.migrate(s,R,I));
});
test('unknown freezer suitability needs explicit confirmation and preserves state on failure',()=>{
 const s=C.defaults();batch(s,'a',4);const before=C.clone(s);
 assert.throws(()=>C.finishBatch(s,'a',{eat:0,fridge:0,freezer:4,cookedAt:at},R,now),/unknown/);assert.deepEqual(s,before);
 finish(s,'a',4,0);assert.throws(()=>C.changeStorage(s,s.lots[0].id,'freeze',R,now),/unknown/);
});
test('migration rejects damaged links, overcapacity, incompatible packs and unordered dates',()=>{
 const s=C.defaults();batch(s,'a',4);finish(s,'a',0,4);
 for(const mutate of [x=>x.lots[0].batchId='missing',x=>x.lots[0].capacity=49,x=>x.lots[0].portions=5,x=>x.lots[0].frozenAt='2020-01-01T00:00:00Z',x=>x.lots.push({...x.lots[0]})]){
  const bad=C.clone(s);mutate(bad);assert.throws(()=>C.migrate(bad,R,I));
 }
 const bad=C.clone(s);bad.packs.Tesco={rice:{size:500,unit:'each'}};assert.throws(()=>C.migrate(bad,R,I));
});
test('v3 backups without new metadata retain all purchases and portions',()=>{
 const s=C.defaults();batch(s,'a',4);finish(s,'a',0,4);delete s.purchaseHistory;delete s.tripShop;delete s.lots[0].capacity;delete s.lots[0].consumed;s.bought.rice=700;
 const restored=C.migrate(s,R,I);assert.equal(restored.bought.rice,700);assert.equal(restored.lots[0].capacity,4);assert.equal(restored.tripShop,null);
});
test('batch pantry-only respects combined stock and dislikes independently of ranking',()=>{
 const s=C.defaults(),r=R.find(r=>r.id==='prep-dal');s.batchFilters.mode='only';
 const f={meal:'Lunch',servings:4,time:'any',mode:'only'};assert.equal(C.matching(r,f,s,R,I),false);
 s.pantry=C.scaled(r,4);assert.equal(C.matching(r,f,s,R,I),true);batch(s,'a',4,'prep-dal');assert.equal(C.matching(r,f,s,R,I),false);
 s.prefs.exclusions=['lentils'];s.prefs.favourites=[r.id];assert.equal(C.matching(r,{...f,mode:'any'},s,R,I),false);
});
test('rice exception wins over generic batch metadata',()=>{
 const recipes=[{id:'rice-test',ingredients:[{id:'rice',qty:100}],batch:{fridgeHours:48}}];
 assert.equal(C.expiry({recipeId:'rice-test',location:'fridge',cookedAt:at},recipes),Date.parse(at)+24*3600000);
});
