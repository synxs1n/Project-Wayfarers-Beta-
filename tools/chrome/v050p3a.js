// Beta v0.5.0 Phase 3, part A: 3.8 item limit, 3.1 best for party ordering and tradeoff lines, 3.2 duplicates, 3.3 Smithy plan.
const {open,chk,done}=require('./pw');
(async()=>{const h=await open();const {ev,wait}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);

// ---- 3.8: one constant, 50, everywhere (buy, craft, drops); Daily Trial keeps 9 ----
const lim=await ev(()=>{const G=__A.G,A=__A.ACT;const P=__P3;G.gold=1e6;G.inv.potion=9;A.buyItem('potion');const afterBuy=G.inv.potion;
  G.inv.potion=49;A.buyItem('potion');A.buyItem('potion');const capBuy=G.inv.potion;
  // crafting a potion past 9 (old bug: refused at 9)
  G.inv.potion=9;G.mats.healroot=10;const r=__A.RECIPES?__A.RECIPES.find(x=>x.item==='potion'):null;
  return {max:P.ITEM_MAX,cap:P.invCap(),afterBuy,capBuy,hasRec:!!r};});
chk('3.8 ITEM_MAX is 50 and invCap() reads it',lim.max===50&&lim.cap===50||JSON.stringify(lim));
chk('3.8 buying a 10th potion works (was capped at 9)',lim.afterBuy===10||JSON.stringify(lim));
chk('3.8 buying stops at 50',lim.capBuy===50||JSON.stringify(lim));
const shopBtn=await ev(()=>{const G=__A.G;G.inv.potion=9;__A.V.modal={type:'workshop',tab:'shop'};__A.render();const b=document.querySelector('#modal [data-act="buyItem"][data-arg="potion"]');const on=b&&!b.disabled;
  G.inv.potion=50;__A.render();const b2=document.querySelector('#modal [data-act="buyItem"][data-arg="potion"]');__A.V.modal=null;__A.render();return {on,off:!!(b2&&b2.disabled)};});
chk('3.8 Alchemy buy button enabled at 9, disabled at 50',shopBtn.on&&shopBtn.off||JSON.stringify(shopBtn));
const daily=await ev(()=>{const G=__A.G;const o=G.daily;G.daily={key:'x'};const c=__P3.invCap();G.daily=o;return c;});
chk('3.8 Daily Trial keeps the old cap of 9',daily===9||daily);
const src=await ev(()=>{const s=[...document.scripts].map(x=>x.textContent).join('\n');return (s.match(/inv\[[^\]]*\]\|\|0\)\s*(<|>=)\s*9\b|Math\.min\(9,\(G\.inv/g)||[]).length;});
chk('3.8 no hard coded 9 left for item counts',src===0||src);

// ---- 3.1: best for party first, best to worst ----
await ev(()=>{const G=__A.G;G.stage=1;G.gold=1e6;['oren','mira','lumen'].forEach(id=>{const c=G.roster[id];c.lv=12;c.eq.w=null;c.eq.a=null;__A.refresh?__A.refresh(c):0;});try{Object.values(G.roster).forEach(c=>{c.S=__A.calcStats(c);});}catch(e){}
  __A.META.cfg.shopF={};});
const ord=await ev(()=>{__A.V.modal={type:'smithy',tab:'weapons'};__A.render();
  const ids=[...document.querySelectorAll('#modal [data-act="buyGear"]')].map(b=>b.dataset.arg);
  const g=ids.map(id=>__P3.partyGainOf(id).top);const chip=document.querySelector('#modal [data-act="shopF"][data-arg="sort:best"]');
  return {ids,g,chipOn:!!(chip&&chip.classList.contains('on')),why:document.querySelectorAll('#modal .p3why').length,borders:document.querySelectorAll('#modal .shoprow.tr').length,filters:document.querySelectorAll('#modal [data-act="shopF"][data-arg^="show:"]').length};});
const up=ord.g.filter(x=>x>=.005).length,sorted=ord.g.slice(0,up).every((v,i,a)=>i===0||a[i-1]>=v),upFirst=ord.g.slice(up).every(v=>v<.005);
chk('3.1 "Best for party" is the default sort',ord.chipOn||JSON.stringify(ord));
chk('3.1 shop: upgrades for the party first, best to worst',up>0&&sorted&&upFirst||JSON.stringify(ord.g));
chk('3.1 rarity borders and filters kept',ord.borders===ord.ids.length&&ord.filters===3||JSON.stringify(ord));
chk('3.1 a tradeoff line shows for close options',ord.why>0||ord.why);
const why1=await ev(()=>document.querySelector('#modal .p3why')&&document.querySelector('#modal .p3why').innerText);console.log('why:',why1);
chk('3.1 tradeoff line names both options',/:.*\..*:/.test(why1||'')||why1);
const rar=await ev(()=>{__A.ACT.shopF('sort:rarity');const ids=[...document.querySelectorAll('#modal [data-act="buyGear"]')].map(b=>b.dataset.arg);const t=ids.map(id=>__A.GEAR[id].tier);__A.ACT.shopF('sort:best');return t;});
chk('3.1 Rarest first still works',rar.every((v,i,a)=>i===0||a[i-1]>=v)||JSON.stringify(rar));
// Forge: craftable first, then best upgrade
const fo=await ev(()=>{const G=__A.G;['copper','iron','oak','ash','fang','hide','ichor','scale','grit','bluecap'].forEach(k=>G.mats[k]=2);__A.V.modal={type:'smithy',tab:'craft',cat:'weapon'};__A.render();
  const rows=[...document.querySelectorAll('#modal .row.rec')].map(r=>({ok:r.classList.contains('ready'),id:__A.RECIPES[+r.querySelector('[data-act="craftR"]').dataset.arg].id}));
  return rows.map(r=>({ok:r.ok,g:__P3.partyGainOf(r.id).top}));});
const nOk=fo.filter(r=>r.ok).length,okFirst=fo.slice(0,nOk).every(r=>r.ok);
const grp=a=>{const u=a.filter(r=>r.g>=.005).length;return a.slice(0,u).every((r,i,b)=>i===0||b[i-1].g>=r.g)&&a.slice(u).every(r=>r.g<.005);};
chk('3.1 Forge: craftable first (kept rule)',okFirst||JSON.stringify(fo.slice(0,8)));
chk('3.1 Forge: then best upgrade first within each group',grp(fo.slice(0,nOk))&&grp(fo.slice(nOk))||JSON.stringify(fo));
// Tempering: ready first, ordered by gain; the helper exists for Phase 1's 1.9
const te=await ev(()=>{const G=__A.G;G.gold=1e6;G.gear.push('w_staff_0','w_blade_0','a_robe_0');Object.keys(G.mats).forEach(k=>G.mats[k]=0);G.mats.oak=9;G.mats.fang=9;G.mats.ichor=9;
  __A.V.modal={type:'smithy',tab:'forge'};__A.render();const rows=[...document.querySelectorAll('#modal [data-act="forge"]')].map(b=>({ok:!b.disabled,a:JSON.parse(b.dataset.arg)}));
  return rows.map(r=>{const o=r.a.w==='spare'?{where:'spare',ref:r.a.r,id:G.gear[r.a.r]}:{where:'eq',ref:r.a.r,id:G.roster[r.a.r.cid].eq[r.a.r.slot]};return {ok:r.ok,g:__P3.temperGain(o)};});});
const tOk=te.filter(r=>r.ok).length;
chk('3.1 Tempering: ready first, best gain first',te.length>0&&te.slice(0,tOk).every(r=>r.ok)&&te.slice(0,tOk).every((r,i,a)=>i===0||a[i-1].g>=r.g)||JSON.stringify(te));

// ---- 3.2: an item one hero wears is still suggested for another ----
const dup=await ev(()=>{const G=__A.G;const L=__A.ACT;const id='w_staff_1';const lum=G.roster.lumen,mira=G.roster.mira;
  // both casters; put a staff on one of them
  const a=[lum,mira].filter(c=>__A.canEquip?__A.canEquip(c,id):true);if(a.length<2)return {skip:a.map(c=>c.id)};
  a[0].eq.w=id;a.forEach(c=>{c.S=__A.calcStats(c);});a[1].eq.w=null;a[1].S=__A.calcStats(a[1]);
  __A.V.modal={type:'smithy',tab:'weapons'};__A.render();const row=[...document.querySelectorAll('#modal .shoprow')].find(r=>r.querySelector(`[data-arg="${id}"]`));
  const ids=[...document.querySelectorAll('#modal [data-act="buyGear"]')].map(b=>b.dataset.arg);
  return {line:row&&row.querySelector('.p3dup')?row.querySelector('.p3dup').innerText:null,pos:ids.indexOf(id),n:ids.length,second:a[1].name};});
console.log('dup',JSON.stringify(dup));
chk('3.2 equipped by one hero, still suggested for another with their gain',!!(dup.line&&dup.line.includes(dup.second)&&/\+\d+%/.test(dup.line))||JSON.stringify(dup));
chk('3.2 that item still sorts among the upgrades',dup.pos>=0&&dup.pos<dup.n/2||JSON.stringify(dup));

// ---- 3.3: the Smithy plan ----
const pl=await ev(()=>{const G=__A.G;G.stage=1;G.gold=5000;['oren','mira','lumen'].forEach(id=>{const c=G.roster[id];c.eq.w=null;c.eq.a=null;c.eq.k=null;c.S=__A.calcStats(c);});
  __A.V.modal={type:'smithy',tab:'weapons'};__A.render();const btn=document.querySelector('#modal [data-act="p3Smith"]');if(!btn)return {btn:false};
  const gold0=G.gold;btn.click();const m=__A.V.modal;const txt=document.querySelector('#modal').innerText;
  return {btn:true,type:m.type,picks:m.plan.picks.length,total:m.plan.total,gold0,goldNow:G.gold,txt,confirm:!!document.querySelector('#modal [data-act="p3SmithGo"]'),heroes:[...new Set(m.plan.picks.map(p=>p.cid))].length};});
console.log('plan',JSON.stringify(Object.assign({},pl,{txt:pl.txt&&pl.txt.slice(0,300)})));
chk('3.3 the button is in the Smithy',pl.btn===true||JSON.stringify(pl));
chk('3.3 it shows a plan first and spends nothing yet',pl.type==='p3plan'&&pl.goldNow===pl.gold0&&pl.confirm||JSON.stringify(pl));
chk('3.3 the plan covers every party hero with a total',pl.heroes===3&&/Total: [\d,]+ gold/.test(pl.txt)||JSON.stringify(pl));
const run=await ev(()=>{const G=__A.G;const m=__A.V.modal,P=m.plan;const before={};['oren','mira','lumen'].forEach(id=>before[id]=Object.assign({},G.roster[id].eq));const g0=G.gold;
  document.querySelector('#modal [data-act="p3SmithGo"]').click();const r=__A.V.modal;
  const eqOk=P.picks.every(p=>G.roster[p.cid].eq[p.sl]===p.id);const spent=g0-G.gold;const gearAfter=G.gear.slice();
  document.querySelector('#modal [data-act="autoEqUndo"]').click();
  const back=['oren','mira','lumen'].every(id=>['w','a','k'].every(sl=>(G.roster[id].eq[sl]||null)===(before[id][sl]||null)));
  const kept=P.picks.filter(p=>p.src!=='pack').every(p=>G.gear.includes(p.id));
  return {type:r.type,mode:r.mode,eqOk,spent,total:P.total,back,kept,modal:__A.V.modal&&__A.V.modal.type};});
chk('3.3 confirm buys or forges and equips the plan',run.type==='autoEq'&&run.mode==='smith'&&run.eqOk&&run.spent===run.total||JSON.stringify(run));
chk('3.3 Undo restores the equips, purchases stay in the pack',run.back&&run.kept||JSON.stringify(run));
// cheaper of buying or forging
const ch=await ev(()=>{const G=__A.G;const rec=__A.RECIPES.filter(r=>r.id&&['weapon','armor'].includes(r.cat));G.gold=1e6;Object.keys(G.mats).forEach(k=>G.mats[k]=50);['copper','iron','oak','ash','fang','hide','ichor','scale','grit','bluecap','relic0','relic1'].forEach(k=>G.mats[k]=50);
  ['oren','mira','lumen'].forEach(id=>{const c=G.roster[id];c.eq.w=null;c.eq.a=null;c.eq.k=null;c.S=__A.calcStats(c);});
  const P=__P3.p3SmithPlan();const bad=P.picks.filter(p=>p.alt.some(a=>a.gold<p.gold));return {n:P.picks.length,bad:bad.length,crafts:P.picks.filter(p=>p.src==='craft').length};});
chk('3.3 each pick takes the cheaper of buying or forging',ch.n>0&&ch.bad===0||JSON.stringify(ch));
// clean stop when the gold runs out between the plan and the confirm
const stop=await ev(()=>{const G=__A.G;G.gold=5000;G.gear=[];Object.keys(G.mats).forEach(k=>G.mats[k]=0);['oren','mira','lumen'].forEach(id=>{const c=G.roster[id];c.eq.w=null;c.eq.a=null;c.eq.k=null;c.S=__A.calcStats(c);});
  __A.V.modal={type:'smithy',tab:'weapons'};__A.render();__A.ACT.p3Smith();const P=__A.V.modal.plan;if(P.picks.filter(p=>p.src==='buy').length<2)return {few:P.picks.length};
  const first=P.picks.find(p=>p.src==='buy');G.gold=__A.GEAR[first.id].price+1;
  __A.ACT.p3SmithGo();const m=__A.V.modal;const txt=document.querySelector('#modal').innerText;return {stop:m.p3.stop,done:m.p3.done,of:m.p3.of,gold:G.gold,txt:/Stopped: the gold ran out/.test(txt),eq:G.roster[first.cid].eq[first.sl]===first.id};});
chk('3.3 stops cleanly when the gold runs out, equips what it bought',stop.stop==='gold'&&stop.txt&&stop.done>=1&&stop.done<stop.of&&stop.gold>=0&&stop.eq||JSON.stringify(stop));
const poor=await ev(()=>{const G=__A.G;G.gold=0;G.gear=[];Object.keys(G.mats).forEach(k=>G.mats[k]=0);const P=__P3.p3SmithPlan();__A.V.modal={type:'p3plan',plan:P,from:{type:'smithy'}};__A.render();return {picks:P.picks.length,cant:P.cant.length,txt:/out of reach/i.test(document.querySelector('#modal').innerText)};});
chk('3.3 what cannot be afforded is listed',poor.cant>0&&poor.txt||JSON.stringify(poor));
await ev(()=>{__A.V.modal=null;__A.render();});
await done(h);})();
