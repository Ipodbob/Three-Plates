

/* Three Plates: pure meal, quantity and shopping-list logic. No network dependencies. */
(function (root) {
  'use strict';
  const n = x => Math.max(0, Number(x) || 0);
  const tidy = x => Math.round((Number(x) + Number.EPSILON) * 1000) / 1000;
  const normalise = s => String(s || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const units = {g:{family:'mass',factor:1},kg:{family:'mass',factor:1000},ml:{family:'volume',factor:1},l:{family:'volume',factor:1000},each:{family:'count',factor:1},tsp:{family:'spoon',factor:1},tbsp:{family:'spoon',factor:3}};
  function convert(qty, from, to) {
    if (!units[from] || !units[to] || units[from].family !== units[to].family) throw new Error('These units cannot be converted.');
    if (!Number.isFinite(Number(qty)) || Number(qty) < 0) throw new Error('Enter a valid positive quantity.');
    return tidy(Number(qty) * units[from].factor / units[to].factor);
  }
  function scaled(recipe, servings) {
    return recipe.ingredients.map(i => ({id:i.id,qty:tidy(i.qty * Math.min(12,Math.max(1,n(servings))) / recipe.base)}));
  }
  function requirements(plans, recipes) {
    const map = new Map(recipes.map(r=>[r.id,r]));
    const needs = {};
    for (const plan of plans || []) {
      if (plan.cooked || !map.has(plan.recipeId)) continue;
      for (const i of scaled(map.get(plan.recipeId),plan.servings)) needs[i.id] = tidy((needs[i.id] || 0)+i.qty);
    }
    return needs;
  }
  function available(pantry, reserved = {}) {
    const out = {};
    for (const p of pantry || []) out[p.id] = p.always ? Infinity : tidy(Math.max(0,n(p.qty)-n(reserved[p.id])));
    return out;
  }
  function coverage(recipe, servings, stock) {
    const items = scaled(recipe,servings).map(i=>({...i,have:stock[i.id]||0,covered:(stock[i.id]||0)+0.0005>=i.qty}));
    const covered = items.filter(i=>i.covered).length;
    const fractional = items.reduce((a,i)=>a+Math.min(1,i.have/i.qty),0)/items.length;
    return {items,covered,total:items.length,ratio:fractional,complete:covered===items.length};
  }
  function shopping(plans, recipes, pantry, bought = {}) {
    const req = requirements(plans,recipes);
    const stock = available(pantry);
    return Object.entries(req).map(([id,qty])=>{
      const have=stock[id]||0;
      const need=tidy(Math.max(0,qty-have));
      const purchased=tidy(Math.min(need,n(bought[id])));
      return {id,qty,have,need,bought:purchased,remaining:tidy(Math.max(0,need-purchased)),covered:need===0,checked:need>0&&purchased>=need};
    });
  }
  function eligible(recipe, filters, prefs, stock) {
    if ((prefs.hidden||[]).includes(recipe.id)) return false;
    if (!recipe.meals.includes(filters.meal)) return false;
    if (recipe.ingredients.some(i=>(prefs.exclusions||[]).includes(i.id))) return false;
    if (prefs.diet==='vegetarian' && !['vegetarian','vegan'].includes(recipe.kind)) return false;
    if (prefs.diet==='vegan' && recipe.kind!=='vegan') return false;
    if (prefs.diet==='pescatarian' && recipe.kind==='meat') return false;
    if ((recipe.method==='slow-cooker'||(!recipe.method&&recipe.slow)) && prefs.slowCooker===false) return false;
    if (filters.time==='15' && (recipe.total>15||recipe.slow)) return false;
    if (filters.time==='30' && (recipe.total>30||recipe.slow)) return false;
    if (filters.time==='long' && (recipe.total<=30||recipe.slow)) return false;
    if (filters.time==='slow' && !recipe.slow) return false;
    if (filters.mode==='only' && !coverage(recipe,filters.servings,stock).complete) return false;
    return true;
  }
  function choose(recipes, filters, prefs, stock, current, seen, locked, plans, random=Math.random) {
    const pool=recipes.filter(r=>eligible(r,filters,prefs,stock));
    const keep=current.filter(id=>locked.includes(id)&&pool.some(r=>r.id===id));
    const needed=Math.max(0,Math.min(3,pool.length)-keep.length);
    let candidates=pool.filter(r=>!keep.includes(r.id)&&!seen.includes(r.id));
    let repeated=false;
    if (candidates.length<needed) {
      repeated=seen.length>0;
      // Prefer unseen dishes, then previously seen dishes not currently displayed.
      const next=pool.filter(r=>!keep.includes(r.id)&&!current.includes(r.id)&&!candidates.some(c=>c.id===r.id));
      candidates.push(...next);
    }
    if(candidates.length<needed) candidates.push(...pool.filter(r=>!keep.includes(r.id)&&!candidates.some(c=>c.id===r.id)));
    const result=[...keep];
    const fresh=new Set(pool.filter(r=>!seen.includes(r.id)).map(r=>r.id));
    for(let k=0;k<needed;k++) {
      let choices=candidates.filter(r=>!result.includes(r.id));
      if(choices.some(r=>fresh.has(r.id))) choices=choices.filter(r=>fresh.has(r.id));
      const selectedCuisines=new Set(result.map(id=>recipes.find(r=>r.id===id)?.cuisine));
      const weights=choices.map(r=>{
        let w=1;
        if((prefs.favourites||[]).includes(r.id))w*=1.8;
        if((prefs.cuisines||[]).includes(r.cuisine))w*=1.7;
        w*=1+Math.min(3,r.ingredients.filter(i=>(prefs.likedIngredients||[]).includes(i.id)).length)*0.65;
        const cv=coverage(r,filters.servings,stock);
        if(filters.mode==='pantry')w*=Math.exp(cv.ratio*4);
        if(selectedCuisines.has(r.cuisine))w*=0.6;
        if((plans||[]).some(p=>p.recipeId===r.id))w*=0.5;
        return w;
      });
      const sum=weights.reduce((a,b)=>a+b,0);
      let x=random()*sum,index=weights.length-1;
      for(let j=0;j<weights.length;j++){x-=weights[j];if(x<=0){index=j;break;}}
      if(choices[index])result.push(choices[index].id);
    }
    return {ids:result,pool:pool.length,repeated,allLocked:keep.length===3};
  }
  const api={units,normalise,tidy,convert,scaled,requirements,available,coverage,shopping,eligible,choose};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.MealCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);

(function () {
'use strict';
const Core=globalThis.MealCore, DATA=globalThis.PLATES_DATA;
const RECIPES=DATA.recipes, BASE_ING=DATA.ingredients;
const KEY='three-plates-v1';
const paths={
 utensils:'M4 3v6m3-6v6M4 6h3M5.5 9v12M16 3c-3 3-3 8 0 9h3V3h-3Zm2 9v9',
 clock:'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
 people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8-7.87a4 4 0 0 1 0 7.75',
 refresh:'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 1l1 5M4 12l1 5a8 8 0 0 0 13 1',
 heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
 calendar:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2',
 bag:'M6 6h12l2 15H4L6 6Zm3 1V5a3 3 0 0 1 6 0v2',
 pantry:'M4 3h16v18H4V3Zm0 9h16M8 7v2m0 7v2',
 sliders:'M4 7h5m5 0h6M4 17h10m5 0h1M9 4h5v6H9V4Zm5 10h5v6h-5v-6',
 pin:'m15 3 6 6-4 1-3 5-2 1-4-4 1-2 5-3 1-4ZM8 16l-5 5',
 plus:'M12 5v14M5 12h14',minus:'M5 12h14',check:'m5 12 4 4L19 6',close:'m6 6 12 12M6 18 18 6',
 arrow:'M5 12h14m-6-6 6 6-6 6',leaf:'M20 3C7 1 1 8 7 15s16 1 13-12ZM4 21 16 8',
 bin:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
 edit:'m15 5 4 4M4 20l4-1L20 7l-4-4L4 15v5Z',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
 info:'M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',copy:'M8 8h13v13H8V8ZM4 16H2V2h14v2'
};
const svg=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.utensils}"></path></svg>`;
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const defaults=()=>({version:1,filters:{date:today(),meal:'Dinner',servings:2,time:'30',mode:'any'},prefs:{diet:'any',exclusions:[],likedIngredients:[],cuisines:[],favourites:[],hidden:[],slowCooker:true},pantry:[],plans:[],bought:{},custom:{}});
function validDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v)))return false;const d=new Date(v+'T12:00:00');return !Number.isNaN(+d)&&d.getFullYear()>=2020&&d.getFullYear()<=2100&&`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`===v;}
function sanitise(raw){
 if(!raw||typeof raw!=='object'||raw.version!==1)throw new Error('This is not a compatible Three Plates backup.');
 const s=defaults(),rids=new Set(RECIPES.map(r=>r.id));
 if(raw.custom&&typeof raw.custom==='object')for(const [id,item] of Object.entries(raw.custom).slice(0,500)){
   if(/^custom-[a-z0-9-]{1,80}$/.test(id)&&item&&typeof item.name==='string'&&Object.keys(Core.units).includes(item.unit))s.custom[id]={id,name:item.name.slice(0,80),unit:item.unit,group:'Other'};
 }
 const ingredientIds=new Set([...Object.keys(BASE_ING),...Object.keys(s.custom)]);
 const f=raw.filters||{};
 if(validDate(f.date))s.filters.date=f.date;
 if(['Breakfast','Lunch','Dinner'].includes(f.meal))s.filters.meal=f.meal;
 if(['15','30','long','slow'].includes(f.time))s.filters.time=f.time;
 if(['any','pantry','only'].includes(f.mode))s.filters.mode=f.mode;
 if(Number.isInteger(f.servings)&&f.servings>=1&&f.servings<=12)s.filters.servings=f.servings;
 const p=raw.prefs||{};
 if(['any','vegetarian','vegan','pescatarian'].includes(p.diet))s.prefs.diet=p.diet;
 for(const key of ['exclusions','likedIngredients'])s.prefs[key]=[...new Set((Array.isArray(p[key])?p[key]:[]).filter(id=>ingredientIds.has(id)))];
 for(const key of ['favourites','hidden'])s.prefs[key]=[...new Set((Array.isArray(p[key])?p[key]:[]).filter(id=>rids.has(id)))];
 s.prefs.cuisines=[...new Set((Array.isArray(p.cuisines)?p.cuisines:[]).filter(c=>RECIPES.some(r=>r.cuisine===c)))];
 s.prefs.slowCooker=p.slowCooker!==false;
 const used=new Set();
 for(const item of (Array.isArray(raw.pantry)?raw.pantry:[]).slice(0,1000))if(item&&ingredientIds.has(item.id)&&!used.has(item.id)&&Number.isFinite(item.qty)&&item.qty>=0&&item.qty<=1e7){s.pantry.push({id:item.id,qty:item.qty,always:item.always===true});used.add(item.id);}
 const slots=new Set(),planIds=new Set();
 for(const plan of (Array.isArray(raw.plans)?raw.plans:[]).slice(0,1000)){
   if(!plan||!rids.has(plan.recipeId)||!validDate(plan.date)||!['Breakfast','Lunch','Dinner'].includes(plan.meal)||!Number.isInteger(plan.servings)||plan.servings<1||plan.servings>12)continue;
   const slot=plan.date+'|'+plan.meal;
   if(slots.has(slot))continue;
   const id=typeof plan.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(plan.id)&&!planIds.has(plan.id)?plan.id:uid();
   s.plans.push({id,recipeId:plan.recipeId,date:plan.date,meal:plan.meal,servings:plan.servings,cooked:plan.cooked===true});slots.add(slot);planIds.add(id);
 }
 for(const [id,qty] of Object.entries(raw.bought||{}))if(ingredientIds.has(id)&&Number.isFinite(qty)&&qty>=0&&qty<=1e7)s.bought[id]=qty;
 return s;
}
function uid(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
let state=defaults(),storageOK=true,loadError=false;
try{const text=localStorage.getItem(KEY);if(text)state=sanitise(JSON.parse(text));}catch(e){storageOK=false;loadError=true;}
let route=['choose','plan','shop','pantry','you'].includes(location.hash.slice(1))?location.hash.slice(1):'choose';
let session={ids:[],seen:[],locked:[],pool:0,repeated:false};
let toastTimer,pantryEdit=null,currentModal=null;
const main=document.getElementById('main'),sheet=document.getElementById('sheet');
const ingredient=id=>BASE_ING[id]||state.custom[id];
const recipe=id=>RECIPES.find(r=>r.id===id);
const savedPlan=id=>state.plans.find(p=>p.id===id);
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch(e){storageOK=false;toast('Changes work for now, but this browser cannot save them. Export a backup in You.');}}
function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4300);}
function num(x){return Number(Core.tidy(x)).toLocaleString('en-GB',{maximumFractionDigits:2});}
function amount(qty,unit){if(qty===Infinity)return 'Always stocked';if(unit==='g'&&qty>=1000)return `${num(qty/1000)} kg`;if(unit==='ml'&&qty>=1000)return `${num(qty/1000)} l`;if(unit==='each')return `${num(qty)} ${qty===1?'item':'items'}`;return `${num(qty)} ${unit}`;}
function purchaseQty(id,qty){return ingredient(id)?.unit==='each'?Math.ceil(qty-0.0005):qty;}
function itemAmount(id,qty){
 const counts={bread:['slice','slices'],eggs:['egg','eggs'],garlic:['clove','cloves'],pepper:['pepper','peppers'],onion:['onion','onions'],pitta:['pitta','pittas'],wraps:['wrap','wraps'],lemon:['lemon','lemons'],lime:['lime','limes'],avocado:['avocado','avocados'],banana:['banana','bananas'],apple:['apple','apples'],sausages:['sausage','sausages']};
 if(qty!==Infinity&&counts[id])return `${num(qty)} ${counts[id][qty===1?0:1]}`;
 return amount(qty,ingredient(id)?.unit||'each');
}
function methodLabel(r){return {'slow-cooker':'Slow cooker','oven':'Oven','oven-hob':'Oven + hob','hob':'Hob','no-cook':'No cook'}[r.method]||(r.slow?'Slow cooker':'');}
function duration(minutes){if(minutes<60)return `${minutes} min`;const hours=Math.floor(minutes/60),mins=minutes%60;return `${hours}h${mins?' '+mins+'m':''}`;}
function dayLabel(date,short=false){const dt=new Date(date+'T12:00:00');if(!Number.isFinite(+dt))return date;return dt.toLocaleDateString('en-GB',short?{weekday:'short',day:'numeric',month:'short'}:{weekday:'long',day:'numeric',month:'long'});}
function daySlot(){return `${state.filters.meal.toLowerCase()} · ${dayLabel(state.filters.date,true)}`;}
function stockForChoices(){return Core.available(state.pantry,Core.requirements(state.plans,RECIPES));}
function listData(){return Core.shopping(state.plans,RECIPES,state.pantry,state.bought);}
function resetChoices(){session={ids:[],seen:[],locked:[],pool:0,repeated:false};}
function makeChoices(showToast=false){
 const res=Core.choose(RECIPES,state.filters,state.prefs,stockForChoices(),session.ids,session.seen,session.locked,state.plans);
 session.ids=res.ids;session.pool=res.pool;session.repeated=res.repeated;session.seen=[...new Set([...session.seen,...res.ids])];session.locked=session.locked.filter(id=>res.ids.includes(id));
 if(showToast){if(res.allLocked)toast('All three are kept. Unkeep one to change it.');else if(res.pool<3)toast(`${res.pool} ${res.pool===1?'meal matches':'meals match'}. Your preferences have not been relaxed.`);else if(res.repeated)toast(`There are ${res.pool} matches in this sample library. Some ideas will now repeat.`);else toast('A fresh set of meal ideas.');}
}
function stepper(value,action,id='',label='people'){return `<div class="stepper"><button type="button" data-act="${action}" data-id="${esc(id)}" data-delta="-1" aria-label="One fewer ${label}" ${value<=1?'disabled':''}>−</button><strong aria-live="polite">${value}</strong><button type="button" data-act="${action}" data-id="${esc(id)}" data-delta="1" aria-label="One more ${label}" ${value>=12?'disabled':''}>+</button></div>`;}
function pageHead(eyebrow,title,subtitle,extra=''){return `<section class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div>${extra}</section>`;}
function empty(title,text,button='',emoji='🍽️'){return `<div class="empty"><span class="empty-icon" aria-hidden="true">${emoji}</span><h2>${title}</h2><p>${text}</p>${button}</div>`;}
function nav(){const count=state.plans.filter(p=>!p.cooked).length;const missing=listData().filter(i=>i.remaining>0).length;document.getElementById('nav').innerHTML=[['choose','utensils','Choose'],['plan','calendar','My plan'],['shop','bag','Shopping'],['pantry','pantry','Pantry'],['you','sliders','You']].map(([id,icon,label])=>`<a href="#${id}" class="nav-item ${route===id?'active':''}" ${route===id?'aria-current="page"':''}>${svg(icon)}<span>${label}</span>${(id==='plan'&&count)||(id==='shop'&&missing)?`<span class="nav-count">${id==='plan'?count:missing}</span>`:''}</a>`).join('');}
function render(){
 const focusId=document.activeElement?.id;
 const pages={choose:renderChoose,plan:renderPlan,shop:renderShop,pantry:renderPantry,you:renderYou};
 main.innerHTML=(!storageOK?'<div class="notice storage-warning">This browser cannot reliably save your changes. Use You → Export backup to keep a copy.</div>':'')+pages[route]();
 nav();
 if(focusId)document.getElementById(focusId)?.focus({preventScroll:true});
 if(route==='pantry')syncPantryUnit();
}
function renderChoose(){
 if(!session.ids.length)makeChoices();
 const f=state.filters,stock=stockForChoices();
 const filterActive=state.prefs.exclusions.length+state.prefs.hidden.length+(state.prefs.diet!=='any'?1:0);
 return pageHead('Your daily inspiration','What’s cooking?','Three ideas, sized for your day.','<span class="intro-decor" aria-hidden="true">✳</span>')+
 `<section class="panel controls" aria-label="Meal choices settings"><div class="control-left"><div class="field date-field"><label for="meal-date">Day</label><input id="meal-date" type="date" value="${esc(f.date)}" min="2020-01-01" max="2100-12-31"></div><div class="field meal-field"><label for="meal-slot">Meal</label><select id="meal-slot">${['Breakfast','Lunch','Dinner'].map(m=>`<option ${m===f.meal?'selected':''}>${m}</option>`).join('')}</select></div><div class="field-wide people-row"><span class="label">People eating<small>For this meal</small></span>${stepper(f.servings,'servings')}</div></div><div class="control-right"><div><span class="label">How much time?</span><div class="segmented time-segments" role="group" aria-label="Cooking time">${[['15','15 min','Quick & easy'],['30','30 min','Up to half an hour'],['long','Longer','30–60 minutes'],['slow','Slow-cooked','60+ minutes']].map(([v,t,hint])=>`<button id="time-${v}" data-act="time" data-value="${v}" class="${f.time===v?'selected':''}" aria-pressed="${f.time===v}"><strong>${t}</strong><small>${hint}</small></button>`).join('')}</div></div><div class="pantry-controls"><span class="label">Use your pantry</span><div class="segmented mode-segments" role="group" aria-label="Pantry matching"><button id="mode-any" data-act="mode" data-value="any" class="${f.mode==='any'?'selected':''}" aria-pressed="${f.mode==='any'}">Anything tasty</button><button id="mode-pantry" data-act="mode" data-value="pantry" class="${f.mode==='pantry'?'selected':''}" aria-pressed="${f.mode==='pantry'}">Pantry first</button><button id="mode-only" data-act="mode" data-value="only" class="${f.mode==='only'?'selected':''}" aria-pressed="${f.mode==='only'}">No shopping</button></div><p class="helper time-explainer">${f.time==='slow'?'Oven, hob, slow cooker and other longer methods. Prep and total time are shown separately.':f.time==='long'?'Ready in over 30 and under 60 minutes. For an hour or more, choose Slow-cooked.':'Time includes preparation and cooking. All times are estimates.'}</p></div></div></section>`+
 (f.mode==='only'?'<div class="notice">No shopping shows only recipes covered by your recorded pantry, after stock reserved for planned meals. “Always stocked” items are assumed sufficient.</div>':'')+
 (f.time==='slow'&&!state.prefs.slowCooker?'<div class="notice">Slow-cooker recipes are hidden. Other slow-cooked methods are still included. Change equipment in <a href="#you">You</a>.</div>':'')+
 `<div class="choice-heading"><div><h2>Your ${session.ids.length===3?'three ':''}ideas</h2><p>${session.pool} matching ${session.pool===1?'meal':'meals'} · ${f.servings} ${f.servings===1?'person':'people'}${filterActive?' · preferences applied':''}</p></div><button id="shuffle" class="button" data-act="shuffle">${svg('refresh')} Refresh</button></div><section class="choice-grid" aria-label="Meal suggestions">`+
 (session.ids.length?session.ids.map((id,i)=>card(recipe(id),i,stock)).join(''):empty('No matches this time','There isn’t a meal in this sample library that fits every setting. Change the time or meal, add pantry stock, or review your preferences. Your food preferences have not been relaxed.','<button class="button secondary" data-act="route" data-value="you">Review preferences</button>','🥣'))+
 `</section><div class="tip-row"><span class="icon">${svg(state.pantry.length?'pin':'pantry')}</span><span>${state.pantry.length?'Tap Keep to hold onto a choice while the others change. Refreshing does not create a permanent dislike.':'Start with a few things in your cupboard. <a href="#pantry">Add pantry items</a> to get smarter matches and a shorter shopping list.'}</span></div>`+
 (session.pool>0&&session.pool<3?'<div class="notice">Fewer than three recipes fit these settings. Your dislikes and dietary preferences are still respected.</div>':'');
}
function card(r,index,stock){
 const cov=Core.coverage(r,state.filters.servings,stock),fav=state.prefs.favourites.includes(r.id),locked=session.locked.includes(r.id);
 const reason=state.prefs.likedIngredients.some(id=>r.ingredients.some(i=>i.id===id))?'With a favourite ingredient':state.prefs.cuisines.includes(r.cuisine)?'A cuisine you like':cov.complete?'Covered by your pantry':r.slow?'Prep now, enjoy later':'A little inspiration';
 return `<article class="meal-card"><div class="card-art"><span class="pick-label">0${index+1} / ${reason}</span><span class="food-emoji" aria-hidden="true">${r.emoji}</span><button class="icon-btn heart-btn ${fav?'active':''}" data-act="favourite" data-id="${r.id}" aria-label="${fav?'Remove from':'Add to'} favourites: ${esc(r.name)}" aria-pressed="${fav}">${svg('heart')}</button></div><div class="card-body"><div class="card-kicker">${esc(r.cuisine)} · ${r.kind==='vegan'?'Plant-based':r.kind==='vegetarian'?'Vegetarian':r.kind==='fish'?'Fish':'Meat'}</div><h3>${esc(r.name)}</h3><p class="description">${esc(r.description)}</p><div class="meta-row"><span>${svg('clock')} ${duration(r.total)} total</span><span>${svg('utensils')} ${r.prep} min prep</span>${methodLabel(r)?`<span class="method-badge">${esc(methodLabel(r))}</span>`:''}</div><div class="pantry-match"><span>${cov.complete?'<strong>Everything recorded in your pantry</strong>':`<strong>${cov.covered} of ${cov.total}</strong> ingredients covered`}</span><span class="match-track" aria-hidden="true"><i style="width:${Math.round(cov.ratio*100)}%"></i></span></div><div class="card-actions"><button class="button secondary" data-act="recipe" data-id="${r.id}">View recipe ${svg('arrow')}</button><button class="icon-btn" data-act="plan-add" data-id="${r.id}" aria-label="Plan ${esc(r.name)}">${svg('plus')}</button></div><div class="card-bottom"><button class="keep-btn ${locked?'active':''}" data-act="keep" data-id="${r.id}" aria-pressed="${locked}">${svg('pin')} ${locked?'Kept for now':'Keep this one'}</button><button class="text-btn" data-act="hide" data-id="${r.id}">Not for me</button></div></div></article>`;
}
function planConflict(r){return r.ingredients.some(i=>state.prefs.exclusions.includes(i.id))||!Core.eligible(r,{...state.filters,meal:r.meals[0],time:'any',mode:'any'}, {...state.prefs,hidden:[]},{});}
function renderPlan(){
 const pending=state.plans.filter(p=>!p.cooked),done=state.plans.filter(p=>p.cooked),shopping=listData();
 const ordered=[...pending].sort((a,b)=>a.date.localeCompare(b.date)||['Breakfast','Lunch','Dinner'].indexOf(a.meal)-['Breakfast','Lunch','Dinner'].indexOf(b.meal));
 let last='';
 const planHtml=ordered.map(p=>{let label=p.date!==last?`<h2 class="plan-date">${esc(dayLabel(p.date))}</h2>`:'';last=p.date;return label+planCard(p);}).join('');
 return pageHead('Your table, organised','A little plan.','Each meal has its own date and number of people. The shopping list follows along.','<button class="button secondary" data-act="route" data-value="choose">'+svg('plus')+' Add meal</button>')+
 `<div class="list-layout"><section>${pending.length?planHtml:empty('Nothing on the plan yet','Choose a meal you like, set the number of people and add it here.','<button class="button" data-act="route" data-value="choose">Find a meal</button>','🗓️')}${done.length?`<details class="details-box"><summary>Cooked meals (${done.length})</summary>${[...done].sort((a,b)=>b.date.localeCompare(a.date)).map(p=>planCard(p,true)).join('')}</details>`:''}</section><aside class="panel"><h2 class="section-title">The shopping picture</h2><div class="summary-grid"><div class="summary-tile"><strong>${pending.length}</strong><span>planned ${pending.length===1?'meal':'meals'}</span></div><div class="summary-tile"><strong>${shopping.filter(i=>i.remaining>0).length}</strong><span>ingredients left to buy</span></div></div><button class="button wide" data-act="route" data-value="shop">${svg('bag')} Open shopping list</button><p class="helper">Stock is shared across your whole plan. The same 200 g of rice won’t be counted twice.</p><p class="helper">Planning reserves stock. Marking a meal cooked deducts recorded quantities from your pantry.</p></aside></div>`;
}
function planCard(p,done=false){const r=recipe(p.recipeId);return `<article class="plan-card ${done?'done':''}"><span class="plan-emoji" aria-hidden="true">${r.emoji}</span><div class="plan-info"><div class="card-kicker">${esc(p.meal)}${done?' · '+esc(dayLabel(p.date,true))+' · Cooked':''}</div><h3><button data-act="recipe" data-id="${r.id}" data-plan="${p.id}">${esc(r.name)}</button></h3><div class="meta-row"><span>${svg('clock')}${duration(r.total)} total</span><span>${svg('people')}${p.servings} ${p.servings===1?'person':'people'}</span></div>${!done&&planConflict(r)?'<p class="helper">Review this meal: it conflicts with your current food preferences.</p>':''}<div class="plan-controls">${!done?stepper(p.servings,'plan-servings',p.id)+`<button class="button secondary" data-act="cooked" data-id="${p.id}">${svg('check')} Cooked</button>`:''}<button class="text-btn" data-act="plan-remove" data-id="${p.id}">${done?'Remove record':'Remove'}</button></div></div></article>`;}
function renderShop(){
 const items=listData(),need=items.filter(i=>!i.covered),have=items.filter(i=>i.covered),outstanding=need.filter(i=>i.remaining>0).length,purchased=Object.values(state.bought).some(q=>q>0);
 let shoppingHtml='';
 const groups=[...new Set(need.map(i=>ingredient(i.id).group))].sort();
 for(const g of groups){shoppingHtml+=`<h3 class="group-title">${esc(g)}</h3>`+need.filter(i=>ingredient(i.id).group===g).sort((a,b)=>ingredient(a.id).name.localeCompare(ingredient(b.id).name)).map(i=>`<div class="shopping-row ${i.checked?'checked':''}"><button class="check-button ${i.checked?'checked':''}" data-act="bought" data-id="${i.id}" aria-label="${i.checked?'Unmark':'Mark'} ${esc(ingredient(i.id).name)} as bought" aria-pressed="${i.checked}">${i.checked?svg('check'):''}</button><div class="shopping-name"><span>${esc(ingredient(i.id).name)}</span><small>${itemAmount(i.id,i.qty)} for meals${i.have>0&&i.have!==Infinity?' · '+itemAmount(i.id,i.have)+' in pantry':''}${i.bought>0&&!i.checked?' · '+itemAmount(i.id,i.bought)+' already bought':''}</small></div><div class="shopping-qty">${i.checked?'Bought':itemAmount(i.id,purchaseQty(i.id,i.remaining))}</div></div>`).join('');}
 return pageHead('Only what you need','A shorter shopping list.','Combined across your planned meals, with your pantry amounts taken off.','<button class="button secondary" data-act="copy-list">'+svg('copy')+' Copy</button>')+
 (items.length?`<div class="list-layout"><section class="panel"><div class="section-bar"><h2 class="section-title">To buy</h2><span class="small-count">${outstanding} ${outstanding===1?'ingredient':'ingredients'} left</span></div>${need.length?shoppingHtml:'<p class="empty-inline">Everything on your plan is covered by your recorded pantry.</p>'}${purchased?'<div class="details-box"><button class="button wide" data-act="stock-bought">'+svg('pantry')+' Put bought items in pantry</button><p class="helper">Adds the amounts you ticked, not whole packet sizes. Edit the pantry afterwards for any extra.</p></div>':''}</section><aside class="panel"><div class="section-bar"><h2 class="section-title">Already have</h2><span class="small-count">${have.length} covered</span></div>${have.length?have.map(i=>`<div class="shopping-row"><span class="check-button covered" aria-label="Covered by pantry">${svg('check')}</span><div class="shopping-name"><span>${esc(ingredient(i.id).name)}</span><small>${itemAmount(i.id,i.qty)} needed${i.have===Infinity?' · assumed always stocked':''}</small></div><span class="stock-tag">Pantry</span></div>`).join(''):'<p class="empty-inline">As you add pantry items, fully covered ingredients will appear here.</p>'}<p class="helper">“Already have” is separate from “bought”. Change quantities in your pantry rather than unticking these rows.</p><button class="button ghost wide" data-act="route" data-value="pantry">Check my pantry ${svg('arrow')}</button></aside></div>`:empty('A list without the guesswork','Plan a meal first. Its ingredients will appear here, scaled for everyone eating.','<button class="button" data-act="route" data-value="choose">Choose a meal</button>','🛍️')+(purchased?'<div class="notice">You have recorded purchases from an earlier plan. <button class="text-btn" data-act="stock-bought">Put them in the pantry</button></div>':''));
}
function renderPantry(){
 const reserved=Core.requirements(state.plans,RECIPES),all=[...state.pantry].sort((a,b)=>ingredient(a.id).name.localeCompare(ingredient(b.id).name)),groups=[...new Set(all.map(p=>ingredient(p.id).group))].sort();
 const list=groups.map(g=>`<h3 class="group-title">${esc(g)}</h3>`+all.filter(p=>ingredient(p.id).group===g).map(p=>`<div class="pantry-item"><div class="item-name">${esc(ingredient(p.id).name)}<small>${p.id.startsWith('custom-')?'Custom item · not matched to sample recipes':p.always?'Assumed sufficient for every meal':reserved[p.id]?itemAmount(p.id,reserved[p.id])+' needed by your plan':ingredient(p.id).unit==='each'?'Amounts count individual items':''}</small></div><span class="quantity-pill">${p.always?'Always stocked':itemAmount(p.id,p.qty)}</span><button class="icon-btn" data-act="pantry-edit" data-id="${esc(p.id)}" aria-label="Edit ${esc(ingredient(p.id).name)}">${svg('edit')}</button><button class="icon-btn" data-act="pantry-delete" data-id="${esc(p.id)}" aria-label="Remove ${esc(ingredient(p.id).name)}">${svg('close')}</button></div>`).join('')).join('');
 return pageHead('The good stuff you already have','Look in the cupboard.','Start small: rice, pasta, oil, tins, eggs. Add the rest as you go.')+
 `<div class="list-layout"><section class="panel"><div class="section-bar"><h2 class="section-title">Your pantry</h2><span class="small-count">${all.length} items</span></div>${all.length?list:'<p class="empty-inline">No items yet. Add something you have at home using the form below or alongside.</p><div class="notice">Your pantry starts empty. We never assume you have oil, salt or other basics.</div>'}</section><aside class="panel"><h2 id="pantry-form-title" class="section-title">Add an item</h2><p class="helper">Choose a suggested ingredient so recipes can match it. Adding an existing item replaces its recorded amount.</p><form id="pantry-form" class="inline-form" style="margin-top:17px"><div class="field field-wide"><label for="pantry-name">Ingredient</label><input id="pantry-name" list="ingredient-options" type="text" required maxlength="80" autocomplete="off" placeholder="e.g. rice, eggs, olive oil"><datalist id="ingredient-options">${Object.values({...BASE_ING,...state.custom}).sort((a,b)=>a.name.localeCompare(b.name)).map(i=>`<option value="${esc(i.name)}"></option>`).join('')}</datalist></div><div class="field"><label for="pantry-qty">Amount available</label><input id="pantry-qty" type="number" min="0.001" max="1000000" step="any" inputmode="decimal" placeholder="500" required></div><div class="field"><label for="pantry-unit">Unit</label><select id="pantry-unit"><option>g</option><option>kg</option><option>ml</option><option>l</option><option>each</option><option>tsp</option><option>tbsp</option></select></div><div class="field-wide"><label class="check-label"><input type="checkbox" id="pantry-always">Always stocked — assume enough</label><p class="helper" style="margin-top:0">Useful for salt or oil you always keep topped up. Leave unticked to track a real quantity.</p><p id="pantry-hint" class="helper"></p></div><button class="button wide field-wide" type="submit">${svg('plus')} Save item</button><button id="cancel-edit" class="button ghost field-wide" type="button" data-act="pantry-cancel" hidden>Cancel edit</button></form><details class="details-box"><summary>Just exploring?</summary><p class="helper">Add a clearly labelled example cupboard to try the matching. These are demo amounts, not your real stock.</p><button class="button secondary wide" data-act="demo-pantry">Add example pantry</button></details></aside></div>`;
}
function prefChips(key){return state.prefs[key].map(id=>`<button class="chip ${key==='exclusions'?'excluded':''}" data-act="pref-remove" data-key="${key}" data-id="${esc(id)}" aria-label="Remove ${esc(ingredient(id)?.name)} from ${key==='exclusions'?'dislikes':'favourite ingredients'}">${esc(ingredient(id)?.name)}${svg('close')}</button>`).join('');}
function renderYou(){const cuisines=[...new Set(RECIPES.map(r=>r.cuisine))].sort();return pageHead('Make it your kind of food','A few things about you.','Dislikes are firm exclusions. Favourites gently influence the suggestions; they don’t take over.')+
 `<div class="list-layout"><div class="stack"><section class="panel preference-section"><h2>Food preferences</h2><div class="field" style="margin-top:14px"><label for="diet">Eating style</label><select id="diet">${[['any','No particular diet'],['vegetarian','Vegetarian'],['vegan','Vegan'],['pescatarian','Pescatarian']].map(([v,t])=>`<option value="${v}" ${state.prefs.diet===v?'selected':''}>${t}</option>`).join('')}</select></div><label class="check-label" style="margin-top:10px"><input id="slow-cooker" type="checkbox" ${state.prefs.slowCooker?'checked':''}>I have a slow cooker</label><p class="helper">This only controls recipes needing that appliance, not oven or hob slow cooking.</p><p class="helper">These are food preference filters, not a validated allergy checker. Check ingredients, packet labels and cross-contamination risks yourself.</p></section><section class="panel preference-section"><h2>Things you don’t eat</h2><p class="helper">Recipes containing these listed ingredients won’t be suggested. Tap a saved item to undo it.</p><label class="sr-only" for="avoid-search">Search ingredients to avoid</label><input class="text-input" id="avoid-search" placeholder="Search, e.g. mushrooms or chicken" autocomplete="off" style="margin-top:12px"><div id="avoid-results"></div><div class="chip-wrap" id="avoid-chips">${prefChips('exclusions')||'<span class="small-count">No disliked ingredients added.</span>'}</div></section><section class="panel preference-section"><h2>Favourite ingredients</h2><p class="helper">A nudge towards foods you enjoy, without making every meal the same.</p><label class="sr-only" for="like-search">Search favourite ingredients</label><input class="text-input" id="like-search" placeholder="Search, e.g. pasta or salmon" autocomplete="off" style="margin-top:12px"><div id="like-results"></div><div class="chip-wrap" id="like-chips">${prefChips('likedIngredients')||'<span class="small-count">No favourite ingredients added.</span>'}</div></section></div><div class="stack"><section class="panel preference-section"><h2>Cuisines you gravitate towards</h2><div class="chip-wrap">${cuisines.map(c=>`<button class="chip-button ${state.prefs.cuisines.includes(c)?'selected':''}" data-act="cuisine" data-value="${esc(c)}" aria-pressed="${state.prefs.cuisines.includes(c)}">${esc(c)}</button>`).join('')}</div></section><section class="panel"><h2 class="section-title">Saved & hidden meals</h2><details class="details-box"><summary>Favourite meals (${state.prefs.favourites.length})</summary>${state.prefs.favourites.length?state.prefs.favourites.map(id=>`<div class="favourite-row"><button class="text-btn" data-act="recipe" data-id="${id}">${esc(recipe(id).name)}</button><button class="text-btn" data-act="favourite" data-id="${id}">Unsave</button></div>`).join(''):'<p class="helper">Tap a heart on a meal to save it here.</p>'}</details><details class="details-box"><summary>Hidden meals (${state.prefs.hidden.length})</summary>${state.prefs.hidden.length?state.prefs.hidden.map(id=>`<div class="favourite-row"><span>${esc(recipe(id).name)}</span><button class="text-btn" data-act="unhide" data-id="${id}">Restore</button></div>`).join(''):'<p class="helper">“Not for me” hides a meal until you restore it here.</p>'}</details></section><section class="panel"><h2 class="section-title">Your data stays here</h2><p class="helper">This prototype stores preferences, pantry and plans in this browser. It has no account, cloud sync, analytics or recipe API. Clearing browser data can remove your saved information.</p><div class="chip-wrap"><button class="button secondary" data-act="export">${svg('download')} Export backup</button><button class="button secondary" data-act="import">Restore backup</button></div><input type="file" id="backup-file" accept="application/json,.json" hidden><details class="details-box"><summary>About this prototype</summary><p class="helper">40 original example recipes. They have not been independently kitchen-tested. Times are estimates; preparation, equipment and portion size change actual timings. Scaling ingredients does not mean cooking time scales linearly.</p><p class="helper">Check cooked food is safe to eat. Slow-cooker timings and fill limits depend on your appliance. This app cannot verify food safety or allergen suitability.</p><p class="help-links">Cooking guidance: <a href="https://www.food.gov.uk/safety-hygiene/cooking-your-food" target="_blank" rel="noopener noreferrer">UK Food Standards Agency</a>.<br>Once hosted, use Safari’s Share → Add to Home Screen for a phone app shortcut. Offline caching needs a supported secure connection.</p><button class="text-btn" data-act="reset">Delete all saved data</button></details></section></div></div>`;}
function canPlan(r){return Core.eligible(r,{...state.filters,time:'any',mode:'any'},state.prefs,{});}
function openRecipe(id,planId){
 const r=recipe(id);if(!r)return;
 const plan=planId?savedPlan(planId):null,servings=plan?plan.servings:state.filters.servings;
 const reserved=Core.requirements(state.plans.filter(p=>p.id!==planId),RECIPES),stock=Core.available(state.pantry,reserved),cv=Core.coverage(r,servings,stock);
 currentModal={id,planId};
 sheet.innerHTML=`<div class="sheet-top"><button class="icon-btn sheet-close" data-act="close-sheet" aria-label="Close recipe">${svg('close')}</button><span class="sheet-emoji" aria-hidden="true">${r.emoji}</span><div class="eyebrow">${esc(r.cuisine)} · ${r.kind==='meat'?'Meat':r.kind==='fish'?'Fish':r.kind==='vegan'?'Plant-based':'Vegetarian'}</div><h2 id="sheet-title">${esc(r.name)}</h2><div class="meta-row"><span>${svg('clock')}${duration(r.total)} total</span><span>${svg('utensils')}${r.prep} min prep</span><span>${svg('people')}${servings} ${servings===1?'person':'people'}</span>${methodLabel(r)?`<span class="method-badge">${esc(methodLabel(r))}</span>`:''}</div></div><div class="sheet-content"><p class="description">${esc(r.description)}</p>${r.method==='slow-cooker'?'<div class="notice">Total time includes prep and the estimated slow-cooker cycle. Check your cooker’s minimum/maximum fill and instructions; do not assume the same time or safe load for every serving count.</div>':''}<h3>Ingredients for ${servings}</h3>${cv.items.map(i=>`<div class="ingredient-line"><span>${esc(ingredient(i.id).name)}<small>${i.covered?'✓ Covered by recorded pantry':i.have>0?'Partly covered · '+itemAmount(i.id,i.have)+' available':'Not covered by recorded pantry'}</small></span><strong>${itemAmount(i.id,i.qty)}</strong></div>`).join('')}<p class="helper">Weights for tinned beans, tuna and sweetcorn are drained where named. Count units are individual items: bread = slices; garlic = cloves. Fractions are recipe amounts. Shopping rounds individual items up; packaged weights are not rounded to supermarket pack sizes.</p><h3 style="margin-top:25px">Let’s cook</h3><ol class="method-list">${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><div class="notice">Example recipe, not independently kitchen-tested. Times are estimates and do not increase automatically with portions. Check cooking, ingredient labels and any allergy requirements.</div></div><div class="sheet-sticky"><span><strong>${plan?'Already on your plan':esc(daySlot())}</strong>${servings} ${servings===1?'person':'people'} · ingredients scaled</span>${plan?'<button class="button secondary" data-act="close-sheet">Close recipe</button>':`<button class="button" data-act="plan-add" data-id="${r.id}" ${!canPlan(r)?'disabled':''}>${svg('plus')} Add to plan</button>`}</div>${!plan&&!canPlan(r)?'<p class="helper" style="padding:0 25px 20px">This meal conflicts with your current preferences or meal slot. Review those settings before planning it.</p>':''}`;
 if(!sheet.open)sheet.showModal();else sheet.scrollTop=0;
}
function closeSheet(){if(sheet.open)sheet.close();currentModal=null;}
function go(page){if(route===page){render();return;}location.hash=page;}
function addPlan(id){
 const r=recipe(id);if(!r||!canPlan(r)){toast('That meal doesn’t match your current food preferences or meal slot.');return;}
 const f=state.filters,existing=state.plans.find(p=>p.date===f.date&&p.meal===f.meal);
 if(existing&&!confirm(`Replace ${recipe(existing.recipeId).name} for ${f.meal.toLowerCase()} on ${dayLabel(f.date,true)}?${existing.cooked?' The previous cooked meal’s pantry deduction will not be reversed.':''}`))return;
 const plan={id:existing?.id||uid(),recipeId:id,date:f.date,meal:f.meal,servings:f.servings,cooked:false};
 if(existing)state.plans=state.plans.filter(p=>p.id!==existing.id);
 state.plans.push(plan);save();closeSheet();resetChoices();render();toast(`Added to ${f.meal.toLowerCase()} on ${dayLabel(f.date,true)} for ${f.servings}.`);
}
function toggleIn(key,value){const arr=state.prefs[key];state.prefs[key]=arr.includes(value)?arr.filter(v=>v!==value):[...arr,value];}
function ingredientLookup(text){const norm=Core.normalise(text);return Object.values({...BASE_ING,...state.custom}).find(i=>Core.normalise(i.name)===norm||Core.normalise(i.id)===norm);}
function syncPantryUnit(){
 const name=document.getElementById('pantry-name'),unit=document.getElementById('pantry-unit'),hint=document.getElementById('pantry-hint');if(!name||!unit)return;
 const found=ingredientLookup(name.value),prior=unit.value;
 const allowed=found?Object.keys(Core.units).filter(u=>Core.units[u].family===Core.units[found.unit].family):Object.keys(Core.units);
 unit.innerHTML=allowed.map(u=>`<option ${u===(allowed.includes(prior)?prior:found?.unit||'g')?'selected':''}>${u}</option>`).join('');
 hint.textContent=found?(found.unit==='each'?'Count individual items: slices of bread, cloves of garlic, eggs, wraps and so on.':found.name.includes('drained')?'Enter the drained amount, not the full weight including liquid.':found.id==='stock'?'Enter prepared stock volume, not the number of stock cubes.':''):name.value?'Custom items can be tracked, but won’t automatically match the sample recipes.':'';
}
function savePantry(event){
 event.preventDefault();
 const text=document.getElementById('pantry-name').value.trim(),always=document.getElementById('pantry-always').checked,unit=document.getElementById('pantry-unit').value,rawQty=Number(document.getElementById('pantry-qty').value);
 if(!text||text.length>80){toast('Enter an ingredient name of up to 80 characters.');return;}
 let found=ingredientLookup(text);
 if(!found){const id='custom-'+(Core.normalise(text).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||uid());found={id,name:text,unit:['kg'].includes(unit)?'g':unit==='l'?'ml':unit==='tbsp'?'tsp':unit,group:'Other'};state.custom[id]=found;}
 let qty=0;
 try{qty=always?0:Core.convert(rawQty,unit,found.unit);if(!always&&(!Number.isFinite(qty)||qty<=0||qty>1e7))throw new Error('Enter an amount greater than zero.');}catch(e){toast(e.message);return;}
 if(pantryEdit&&pantryEdit!==found.id)state.pantry=state.pantry.filter(p=>p.id!==pantryEdit);
 state.pantry=state.pantry.filter(p=>p.id!==found.id);state.pantry.push({id:found.id,qty,always});pantryEdit=null;save();resetChoices();render();toast(`${found.name} saved${always?' as always stocked':''}.`);
}
function editPantry(id){const p=state.pantry.find(p=>p.id===id);if(!p)return;pantryEdit=id;const i=ingredient(id);document.getElementById('pantry-name').value=i.name;syncPantryUnit();document.getElementById('pantry-unit').value=i.unit;document.getElementById('pantry-qty').value=p.qty||'';document.getElementById('pantry-always').checked=p.always;document.getElementById('pantry-qty').disabled=p.always;document.getElementById('pantry-qty').required=!p.always;document.getElementById('pantry-form-title').textContent='Edit pantry item';document.getElementById('cancel-edit').hidden=false;document.getElementById('pantry-form-title').scrollIntoView({block:'center',behavior:'smooth'});document.getElementById('pantry-name').focus({preventScroll:true});}
const foodGroups=[{id:'group-chicken',name:'Chicken — all cuts',items:['chicken','chicken-thigh']},{id:'group-beef',name:'Beef — all cuts and mince',items:['beef','beef-mince']},{id:'group-pork',name:'Pork — including sausages',items:['pork','sausages']},{id:'group-fish',name:'Fish & seafood — all listed types',items:['salmon','tuna','prawns']}];
function searchPreferences(inputId,key){const input=document.getElementById(inputId),target=document.getElementById(inputId==='avoid-search'?'avoid-results':'like-results');const q=Core.normalise(input.value);if(!q){target.innerHTML='';return;}const items=Object.values(BASE_ING).filter(i=>Core.normalise(i.name).includes(q)&&!state.prefs[key].includes(i.id)).slice(0,8);const groups=foodGroups.filter(g=>Core.normalise(g.name).includes(q)&&g.items.some(id=>!state.prefs[key].includes(id)));target.innerHTML=items.length||groups.length?`<div class="search-results">${groups.map(g=>`<button class="search-result" data-act="pref-add-group" data-key="${key}" data-id="${g.id}"><span>${esc(g.name)}</span><small>Add all</small></button>`).join('')}${items.map(i=>`<button class="search-result" data-act="pref-add" data-key="${key}" data-id="${i.id}"><span>${esc(i.name)}</span><small>Add</small></button>`).join('')}</div>`:'<p class="helper">No matching ingredient in this sample recipe library.</p>';}
function addPref(key,ids){if(key==='likedIngredients'&&ids.some(id=>state.prefs.exclusions.includes(id))){toast('That includes an ingredient you avoid. Remove the dislike first to favourite it.');return;}for(const id of ids){if(!state.prefs[key].includes(id))state.prefs[key].push(id);if(key==='exclusions')state.prefs.likedIngredients=state.prefs.likedIngredients.filter(x=>x!==id);}save();resetChoices();render();toast(key==='exclusions'?'Excluded from future suggestions.':'Added to your favourite ingredients.');}
async function copyList(){const items=listData();if(!items.length){toast('Plan a meal to create a shopping list first.');return;}let text='THREE PLATES — SHOPPING LIST\n\n';for(const i of items.filter(i=>i.remaining>0))text+=`☐ ${ingredient(i.id).name}: ${itemAmount(i.id,purchaseQty(i.id,i.remaining))}\n`;if(!items.some(i=>i.remaining>0))text+='Nothing left to buy.\n';text+='\nALREADY COVERED BY PANTRY\n';for(const i of items.filter(i=>i.covered))text+=`✓ ${ingredient(i.id).name} (${itemAmount(i.id,i.qty)} needed)\n`;text+='\nCHECKED AS BOUGHT\n';for(const i of items.filter(i=>i.bought>0))text+=`✓ ${ingredient(i.id).name}: ${itemAmount(i.id,i.bought)}\n`;try{await navigator.clipboard.writeText(text);toast('Shopping list copied.');}catch(e){downloadFile('three-plates-shopping.txt',text,'text/plain');toast('Saved a text copy of your shopping list.');}}
function downloadFile(name,text,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function stockBought(){const bought=Object.entries(state.bought).filter(([id,q])=>q>0&&ingredient(id));if(!bought.length)return;if(!confirm('Add your ticked purchase amounts to the pantry? These are recipe amounts, not necessarily whole packet sizes.'))return;for(const [id,qty] of bought){const p=state.pantry.find(p=>p.id===id);if(p&&!p.always)p.qty=Core.tidy(p.qty+qty);else if(!p)state.pantry.push({id,qty,always:false});}state.bought={};save();resetChoices();render();toast('Bought amounts added to the pantry.');}
function cookPlan(id){const plan=savedPlan(id);if(!plan||plan.cooked)return;const r=recipe(plan.recipeId);const needed=Core.scaled(r,plan.servings),available=Core.available(state.pantry);const missing=needed.filter(i=>(available[i.id]||0)<i.qty);const message=missing.length?`Mark this meal cooked? Your recorded pantry is short of ${missing.map(i=>ingredient(i.id).name).join(', ')}. Only recorded stock will be deducted. Put any bought items in your pantry first for accurate tracking.`:'Mark this meal cooked and deduct its ingredient amounts from your pantry?';if(!confirm(message))return;for(const i of needed){const p=state.pantry.find(p=>p.id===i.id);if(p&&!p.always)p.qty=Core.tidy(Math.max(0,p.qty-i.qty));}plan.cooked=true;save();resetChoices();render();toast('Meal marked cooked. Recorded pantry stock updated.');}
async function importBackup(file){if(!file)return;if(file.size>1024*1024){toast('That file is too large. Choose a Three Plates JSON backup under 1 MB.');return;}try{const restored=sanitise(JSON.parse(await file.text()));if(!confirm('Replace the pantry, plan and preferences on this device with this backup?'))return;state=restored;save();resetChoices();render();toast('Backup restored.');}catch(e){toast('Could not restore that file. Choose a valid Three Plates JSON backup.');}}
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-act]');if(!b||b.disabled)return;const a=b.dataset.act,id=b.dataset.id,v=b.dataset.value,d=Number(b.dataset.delta)||0;
 if(a==='route'){go(v);return;}
 if(a==='shuffle'){makeChoices(true);render();return;}
 if(a==='servings'){state.filters.servings=Math.min(12,Math.max(1,state.filters.servings+d));save();resetChoices();render();return;}
 if(a==='time'||a==='mode'){state.filters[a]=v;save();resetChoices();render();return;}
 if(a==='favourite'){toggleIn('favourites',id);save();render();toast(state.prefs.favourites.includes(id)?'Saved to favourite meals.':'Removed from favourite meals.');return;}
 if(a==='keep'){session.locked=session.locked.includes(id)?session.locked.filter(x=>x!==id):[...session.locked,id];render();return;}
 if(a==='hide'){state.prefs.hidden=[...new Set([...state.prefs.hidden,id])];session.locked=session.locked.filter(x=>x!==id);session.ids=session.ids.filter(x=>x!==id);save();makeChoices();render();toast('Meal hidden. Restore it any time in You → Hidden meals.');return;}
 if(a==='unhide'){state.prefs.hidden=state.prefs.hidden.filter(x=>x!==id);save();resetChoices();render();return;}
 if(a==='recipe'){openRecipe(id,b.dataset.plan);return;}
 if(a==='close-sheet'){closeSheet();return;}
 if(a==='plan-add'){addPlan(id);return;}
 if(a==='plan-servings'){const p=savedPlan(id);if(p&&!p.cooked){p.servings=Math.min(12,Math.max(1,p.servings+d));save();resetChoices();render();}return;}
 if(a==='plan-remove'){const p=savedPlan(id);if(!p)return;if(!confirm(p.cooked?'Remove this cooked-meal record? This does not put ingredients back into your pantry.':'Remove this meal from your plan and release its reserved ingredients?'))return;state.plans=state.plans.filter(p=>p.id!==id);save();resetChoices();render();return;}
 if(a==='cooked'){cookPlan(id);return;}
 if(a==='bought'){const row=listData().find(i=>i.id===id);if(row){if(row.checked)delete state.bought[id];else state.bought[id]=purchaseQty(id,row.need);save();render();}return;}
 if(a==='stock-bought'){stockBought();return;}
 if(a==='copy-list'){copyList();return;}
 if(a==='pantry-edit'){editPantry(id);return;}
 if(a==='pantry-delete'){state.pantry=state.pantry.filter(p=>p.id!==id);save();resetChoices();render();toast('Pantry item removed.');return;}
 if(a==='pantry-cancel'){pantryEdit=null;render();return;}
 if(a==='demo-pantry'){if(!confirm('Add example quantities for pasta, peas, pesto, lemons, chickpeas, tomatoes, rice, oats, milk and eggs, plus always-stocked oil? Existing items are kept. These are demonstration amounts only.'))return;for(const [id,qty] of [['pasta',500],['peas',500],['pesto',190],['lemon',3],['chickpeas',480],['tomato-tin',800],['rice',1000],['oats',500],['milk',1000],['eggs',6],['olive-oil',0]])if(!state.pantry.some(p=>p.id===id))state.pantry.push({id,qty,always:id==='olive-oil'});save();resetChoices();render();toast('Example pantry added. Edit it to match your actual cupboard.');return;}
 if(a==='pref-add'){addPref(b.dataset.key,[id]);return;}
 if(a==='pref-add-group'){addPref(b.dataset.key,foodGroups.find(g=>g.id===id).items);return;}
 if(a==='pref-remove'){state.prefs[b.dataset.key]=state.prefs[b.dataset.key].filter(x=>x!==id);save();resetChoices();render();return;}
 if(a==='cuisine'){toggleIn('cuisines',v);save();resetChoices();render();return;}
 if(a==='export'){downloadFile(`three-plates-backup-${today()}.json`,JSON.stringify(state,null,2),'application/json');toast('Backup exported. It includes your pantry, plan and preferences.');return;}
 if(a==='import'){document.getElementById('backup-file').click();return;}
 if(a==='reset'){if(!confirm('Permanently delete this device’s pantry, preferences, purchases and meal plan? Export a backup first to keep a copy.'))return;state=defaults();save();resetChoices();render();toast('All saved data cleared.');return;}
});
document.addEventListener('submit',event=>{if(event.target.id==='pantry-form')savePantry(event);});
document.addEventListener('input',event=>{const id=event.target.id;if(id==='avoid-search')searchPreferences(id,'exclusions');if(id==='like-search')searchPreferences(id,'likedIngredients');});
document.addEventListener('change',event=>{
 const id=event.target.id,value=event.target.value;
 if(id==='meal-date'){if(!validDate(value)){toast('Choose a valid date.');render();return;}state.filters.date=value;save();render();return;}
 if(id==='meal-slot'){state.filters.meal=value;save();resetChoices();render();return;}
 if(id==='diet'){state.prefs.diet=value;save();resetChoices();render();toast('Food preference saved.');return;}
 if(id==='slow-cooker'){state.prefs.slowCooker=event.target.checked;save();resetChoices();render();return;}
 if(id==='pantry-name'){syncPantryUnit();return;}
 if(id==='pantry-always'){const qty=document.getElementById('pantry-qty');qty.disabled=event.target.checked;qty.required=!event.target.checked;return;}
 if(id==='backup-file'){importBackup(event.target.files[0]);return;}
});
window.addEventListener('hashchange',()=>{const page=location.hash.slice(1);route=['choose','plan','shop','pantry','you'].includes(page)?page:'choose';pantryEdit=null;closeSheet();render();window.scrollTo({top:0});main.focus({preventScroll:true});});
sheet.addEventListener('click',e=>{if(e.target===sheet){const rect=sheet.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeSheet();}});
sheet.addEventListener('close',()=>{currentModal=null;});
window.addEventListener('storage',event=>{if(event.key===KEY){try{state=event.newValue?sanitise(JSON.parse(event.newValue)):defaults();resetChoices();if(sheet.open)closeSheet();render();toast('Updated from another tab.');}catch(e){toast('A saved-data update could not be read. Your current view is unchanged.');}}});
render();
if(loadError)toast('Saved data could not be loaded. You can restore a backup in You.');
if(!globalThis.PLATES_STANDALONE&&'serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
// Exposed read-only helpers make deterministic automated checks possible without app dependencies.
globalThis.ThreePlatesTest={snapshot:()=>JSON.parse(JSON.stringify(state)),session:()=>JSON.parse(JSON.stringify(session))};
})();

