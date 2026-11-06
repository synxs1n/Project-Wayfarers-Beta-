// =================== Beta v0.6.3: SHOPS AND MENUS (file: menus3.js) ===================
// Every shop has the same two levels: main tabs (the gilt strip the Menu uses) and section chips under them (the Menu's
// underlined sub tabs), and the first section is always "All". Filters and sorts are dropdowns (ddSel), remembered where they
// were before: shops in META.cfg.shopF, lists in META.cfg.lists. New optional fields: shopF.who, shopF.rar, shopF.tsh, lists.*.sh, lists.*.rg.
// Modal state: V.modal.tab (main tab) and V.modal.sec (section, 'all' when missing). Old tab ids still land (M3_LEG):
// smithy weapons/armor/mats go to Shop with that section, workshop relit/herbs to Shop, guild personal/bounties to Quests.
// Back (nav.js modalBack): a section goes back to All, a tab goes back to the shop's first tab, the first tab leaves.

// ----- dropdowns -----
function ddSel(lbl,act,pre,opts,cur,cls){const c=String(cur==null?'':cur);
  return `<label class="dd ${cls||''}"><span class="ddl">${lbl}</span><span class="ddw"><select class="ddsel" data-chg="${act}" data-pre="${pre}" aria-label="${esc(String(lbl).replace(/<[^>]*>/g,''))}">${opts.map(([v,t])=>`<option value="${v}"${String(v)===c?' selected':''}>${t}</option>`).join('')}</select></span></label>`;}
function ddBar(parts,cls){parts=parts.filter(Boolean);return parts.length?`<div class="ddbar ${cls||''}">${parts.join('')}</div>`:'';}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('select[data-chg]'))return;const f=ACT[t.dataset.chg];if(!f)return;
  V._ddFocus=[t.dataset.chg,t.dataset.pre];try{if(typeof sfx==='function')sfx('blip');}catch(x){}f(t.dataset.pre+':'+t.value,t);});
// keep focus on the dropdown after the re-render it causes (keyboard and pad users)
{const r0=render;render=function(){const r=r0.apply(this,arguments);try{const k=V._ddFocus;if(k){V._ddFocus=null;const s=[...document.querySelectorAll('#modal select[data-chg]')].find(x=>x.dataset.chg===k[0]&&x.dataset.pre===k[1]);if(s)s.focus({preventScroll:true});}}catch(e){}return r;};}

// ----- the shop filter state (META.cfg.shopF) -----
const M3_SORT={best:'Best for party',rarity:'Rarest first',ready:'Ready first',price:'Cheapest first',name:'Name'};
function m3Who(){const f=SHOPF();return f.who&&f.who!=='all'&&G&&G.party.includes(f.who)&&G.roster[f.who]?G.roster[f.who]:null;}
function m3Rar(){const f=SHOPF();return f.rar==null||f.rar==='all'?null:+f.rar;}
function m3Upg(id){const c=m3Who(),min=(typeof SHOP_BEST!=='undefined'?SHOP_BEST.minPct:.005);
  if(c){const g=gainFor(c,id);return !!g&&g.pct>=min;}return typeof partyGainOf==='function'?partyGainOf(id).top>=min:gainersFor(id).length>0;}
// ctx: 'buy' (gear for sale), 'craft' (recipes), 'items' (potions and tonics), 'mixed' (an All page with both)
function shopFBar(ctx){if(typeof p3ShopDefault==='function')p3ShopDefault();const f=SHOPF();ctx=ctx||'buy';
  const sorts=['best','rarity'].concat(ctx==='craft'?['ready']:[]).concat(['price','name']).filter(k=>!(ctx==='items'&&k==='best'));
  const shows=[['all','Everything'],['afford',ctx==='craft'?'Can craft now':'Can afford']].concat(ctx==='items'?[]:[['usable','Fits my party'],['upg','Upgrades only']]);
  const P=G?G.party.map(id=>G.roster[id]).filter(Boolean):[],T=typeof ITEM_TIERS!=='undefined'?ITEM_TIERS:[];
  return ddBar([ddSel('Sort','shopF','sort',sorts.map(k=>[k,M3_SORT[k]]),sorts.includes(f.sort)?f.sort:sorts[0]),
    ddSel('Show','shopF','show',shows,shows.some(s=>s[0]===f.show)?f.show:'all'),
    ctx==='items'?'':ddSel('For','shopF','who',[['all','Whole party']].concat(P.map(c=>[c.id,esc(c.name)+' ('+esc(CLS[TPL[c.id].cls].n)+')'])),m3Who()?f.who:'all'),
    ddSel('Rarity','shopF','rar',[['all','Any rarity']].concat(T.map((t,i)=>[String(i),esc(t.n)])),m3Rar()==null?'all':String(m3Rar()))],'shopf');}
// extra filters on top of the v0.4.1 and v0.5.0 ones (shopSortIds and recipeList keep their names and callers)
{const ss=shopSortIds;shopSortIds=function(ids){let r=ss.apply(this,arguments);try{const f=SHOPF(),c=m3Who(),rr=m3Rar();
  if(c)r=r.filter(id=>canEquip(c,id));if(rr!=null)r=r.filter(id=>gTierIdx(GEAR[id])===rr);if(f.show==='upg')r=r.filter(m3Upg);
  if(f.sort==='price')r=r.slice().sort((a,b)=>GEAR[a].price-GEAR[b].price||GEAR[a].n.localeCompare(GEAR[b].n));
  if(f.sort==='name')r=r.slice().sort((a,b)=>GEAR[a].n.localeCompare(GEAR[b].n));}catch(e){}return r;};}
{const rl=recipeList;recipeList=function(list){let r=rl.apply(this,arguments);try{const f=SHOPF(),c=m3Who(),rr=m3Rar();
  if(c)r=r.filter(x=>!x.id||canEquip(c,x.id));if(rr!=null)r=r.filter(x=>rarityOf(x)===rr);if(f.show==='upg')r=r.filter(x=>!x.id||m3Upg(x.id));
  if(f.sort==='price')r=r.slice().sort((a,b)=>(a.g||0)-(b.g||0)||String(recipeName(a)).localeCompare(String(recipeName(b))));
  if(f.sort==='name')r=r.slice().sort((a,b)=>String(recipeName(a)).localeCompare(String(recipeName(b))));}catch(e){}return r;};}
// potions, tonics and travel gear for sale: rarity, price and name sorts, afford and rarity filters
function m3ItemSort(ids,priceOf){const f=SHOPF(),rr=m3Rar(),pr=priceOf||(id=>ITEMS[id].price);let a=ids.slice();
  if(f.show==='afford')a=a.filter(id=>G.gold>=pr(id));if(rr!=null)a=a.filter(id=>iTierIdx(id)===rr);
  const nm=id=>ITEMS[id]?ITEMS[id].n:gearOf(id).n;
  if(f.sort==='price')return a.sort((x,y)=>pr(x)-pr(y)||nm(x).localeCompare(nm(y)));
  if(f.sort==='name')return a.sort((x,y)=>nm(x).localeCompare(nm(y)));
  return a.sort((x,y)=>iTierIdx(y)-iTierIdx(x)||pr(y)-pr(x));}

// ----- structure -----
const M3_LEG={smithy:{weapons:['shop','weapons'],armor:['shop','armor'],capes:['shop','capes'],mats:['shop','mats']},
  workshop:{relit:['shop','relit'],herbs:['shop','herb']},guild:{personal:['quests','personal'],bounties:['quests','bounties'],party:['recruit','all']},tavern:{},board:{}};
const M3_HOME={smithy:'shop',workshop:'shop',guild:'recruit',tavern:'hire',board:null};
const M3_TITLE={smithy:'The Smithy',workshop:'Alchemy',guild:'Wayfarers Guild Hall',tavern:'The Rusty Flagon',board:'Quest Board'};
function m3Tabs(t){
  if(t==='smithy')return [['shop','Shop'],['craft','Forge'],['forge','Tempering'],['sell','Sell']].concat(typeof efTabOn==='function'&&efTabOn()?[['echo','Echoforge']]:[]);
  if(t==='workshop')return [['shop','Shop'],['craft','Brew &amp; craft'],['sell','Sell'],['pouch','Pouch']];
  if(t==='guild')return [['recruit','Recruits'],['quests','Quests'],['nature','Natures'],['arena','Arena'],['guilds','Guilds']];
  if(t==='tavern')return [['hire','Hire'],['kitchen','Kitchen']];
  return [];}
// item kinds at Alchemy
const m3Kind=id=>{const o=ITEMS[id];return o.travel?'travel':(o.cure||o.revive)?'cure':'potion';};
const M3_SLOTSEC={weapons:'w',armor:'a',capes:'k',charms:'c'};
function m3SellCnt(slots){const o={};(G.gear||[]).forEach(id=>{const g=gearOf(id);if(g&&!g.stick&&slots.includes(g.slot))o[id]=(o[id]||0)+1;});return o;}
function m3Secs(t,tab){const n=(a)=>a.length;
  if(t==='smithy'){
    if(tab==='shop'){const ar=shopStock('armor');return [['all','All'],['weapons','Weapons',n(shopStock('weapons'))],['armor','Armor',ar.filter(id=>gearOf(id).slot==='a').length],['capes','Capes',ar.filter(id=>gearOf(id).slot==='k').length],['mats','Materials']];}
    if(tab==='craft')return [['all','All']].concat(RCAT.filter(([k])=>SMITH_CATS.includes(k)).map(([k,l])=>[k,l,RECIPES.filter(r=>r.cat===k&&recipeOpen(r)).length]));
    if(tab==='forge'){const L=temperList();const c=s=>L.filter(o=>gearOf(o.id).slot===s).length;return [['all','All',L.length],['weapons','Weapons',c('w')],['armor','Armor',c('a')],['capes','Capes',c('k')],['charms','Charms',c('c')]];}
    if(tab==='sell'){const C=m3SellCnt(['w','a','k']),c=s=>Object.keys(C).filter(id=>gearOf(id).slot===s).reduce((a,id)=>a+C[id],0);
      return [['all','All'],['weapons','Weapons',c('w')],['armor','Armor',c('a')],['capes','Capes',c('k')],['mats','Materials']];}}
  if(t==='workshop'){
    if(tab==='shop'){const S=alchStock(),k=x=>S.filter(id=>m3Kind(id)===x).length;
      return [['all','All'],['potion','Potions',k('potion')],['cure','Cures',k('cure')],['travel','Travel',k('travel')],['charm','Charms',shopStock('charms').length],['herb','Herbs',herbStock().length]].concat(G.cleared[townS()]?[['relit','Festival',RELIT_STOCK.length]]:[]);}
    if(tab==='craft')return [['all','All']].concat(RCAT.filter(([k])=>ALCH_CATS.includes(k)).map(([k,l])=>[k,l,RECIPES.filter(r=>r.cat===k&&recipeOpen(r)).length]));
    if(tab==='sell'){const C=m3SellCnt(['c']);return [['all','All'],['charm','Charms',Object.values(C).reduce((a,b)=>a+b,0)],['herb','Herbs',Object.keys(MATS).filter(id=>(G.mats[id]||0)>0&&MAT_OF[id].k==='herb').length]];}}
  if(t==='guild'&&tab==='quests'){for(let s=0;s<=G.stage;s++)genBounties(s);return [['all','All'],['personal','Personal quests'],['bounties','Bounties',G.bounties.filter(b=>b.stage<=G.stage&&b.state!=='done').length]];}
  if(t==='board'){const Q=m3Quests(),c=f=>Q.filter(f).length;
    return [['all','All',Q.length],['ready','Ready',c(q=>q.state==='active'&&questReady(q))],['active','Active',c(q=>q.state==='active'&&!questReady(q))],['open','Open',c(q=>q.state==='open')],['done','Done',c(q=>q.state!=='open'&&q.state!=='active')]];}
  return [];}
// normalise V.modal for a shop: main tab plus section, old ids mapped
function m3Norm(m){if(!m)return m;const t=m.type,L=M3_LEG[t];if(!L||(t==='guild'&&m.char))return m;
  let tab=m.tab;if(!tab)tab=M3_HOME[t];
  if(L[tab]){const [a,b]=L[tab];tab=a;m.sec=b;m._t=a;}
  const T=m3Tabs(t);if(T.length&&!T.some(x=>x[0]===tab))tab=M3_HOME[t];
  if(m.cat&&tab==='craft'){m.sec=m.cat;m._t=tab;}m.cat=null;
  if(m._t!=null&&m._t!==tab)m.sec='all';// a tab changed since the section was picked (a fresh modal object keeps the section it names)
  m.tab=tab;m._t=tab;
  try{const S=m3Secs(t,tab);if(!S.some(x=>x[0]===m.sec))m.sec='all';}catch(e){m.sec='all';}
  return m;}
// header: title and the purse (the world header is covered by the panel on small screens)
function m3Head(t){return `${M3_TITLE[t]} <span class="hgold nums" title="Your gold">${typeof coin==='function'?coin():''}<b>${fmt(G.gold)}</b></span>`;}
function m3Nav(t,m,extra){const T=m3Tabs(t);let S=[];try{S=m3Secs(t,m.tab);}catch(e){}
  const top=T.length>1?`<div class="chips mgrp stabs" role="tablist" aria-label="${esc(String(M3_TITLE[t]))} tabs">${T.map(([k,l])=>`<button role="tab" aria-selected="${k===m.tab}" class="chip ${k===m.tab?'on':''}" data-act="${t==='guild'?'gtab':'sTab'}" data-arg="${k}">${l}</button>`).join('')}</div>`:'';
  const sub=S.length>1?`<div class="chips msub ssec" role="tablist" aria-label="Sections">${S.map(([k,l,c])=>`<button role="tab" aria-selected="${k===m.sec}" class="chip sm ${k===m.sec?'on':''}" data-act="sSec" data-arg="${k}">${l}${c!=null?` <span class="cnt nums">${c}</span>`:''}</button>`).join('')}</div>`:'';
  return `<div class="shopnav">${top}${sub}${extra||''}</div>`;}
const m3Empty=t=>`<p class="note empty">${t}</p>`;
const m3H=(t,n)=>`<h4>${t}${n!=null?` <span class="cnt nums">${n}</span>`:''}</h4>`;
const m3Rows=(h,empty)=>h?`<div class="rows">${h}</div>`:m3Empty(empty);
function m3Box(t,m,body,btn){return box(m3Head(t),body,btn||'<button class="btn" data-act="closeModal">Leave</button>',true);}

// ----- rows -----
function m3GearRow(id){const g=GEAR[id];return `<div class="row shoprow tr" style="${tierVars(gTierIdx(g),g)}">${gearIcon(id)}<div class="grow"><b>${g.n}</b> ${tierChip(g)}<small>${vsParty(id)}</small><small>${gearDesc(g)}. Spares owned: ${G.gear.filter(x=>x===id).length}.</small>${bestTag(id)}${cmpPanel(id)}</div><button class="btn sm" data-act="buyGear" data-arg="${id}" ${G.gold>=g.price?'':'disabled'}>${g.price}</button></div>`;}
function m3ItemRow(id){const o=ITEMS[id];return `<div class="row tr" style="${tierVars(iTierIdx(id))}"><div class="grow"><b>${itemIcon(id)} ${o.n}</b> ${itemChip(id)}<small>${o.d}. Carrying ${G.inv[id]||0}.</small></div><button class="btn sm" data-act="buyItem" data-arg="${id}" ${G.gold>=o.price&&(G.inv[id]||0)<invCap()?'':'disabled'}>${o.price}</button></div>`;}
function m3SellRows(slots){const C=m3SellCnt(slots);return Object.keys(C).sort((a,b)=>gTierIdx(gearOf(b))-gTierIdx(gearOf(a))||gearOf(a).n.localeCompare(gearOf(b).n)).map(id=>{const g=gearOf(id);
  return `<div class="row tr" style="${tierVars(gTierIdx(g),g)}">${gearIcon(id)}<div class="grow"><b>${g.n}</b> ${tierChip(g)} x${C[id]}<small>${SLOTN[g.slot]}. ${gearDesc(g)}</small></div><button class="btn sm" data-act="sell" data-arg="${id}">Sell ${sellVal(g)}</button></div>`;}).join('');}
function m3RecRow(r){const mm=recipeMats(r),ok=recipeReady(r),have=r.item?`Carrying ${G.inv[r.item]||0}.`:`Owned spare: ${G.gear.filter(x=>x===r.id).length}.`;
  const rg=r.id?gearOf(r.id):null,rt=rg?gTierIdx(rg):iTierIdx(r.item);
  return `<div class="row rec tr ${ok?'ready':''}" style="${tierVars(rt,rg)}">${rg?gearIcon(r.id):''}<div class="grow"><b>${recipeName(r)}</b> ${rg?tierChip(rg):itemChip(r.item)}${rg?`<small>${vsParty(r.id)}</small>`:''}<small>${recipeDesc(r)} ${have}</small>${r.id?bestTag(r.id)+cmpPanel(r.id):''}<div class="mats">${matChips(mm)}${r.g?`<span class="matc gold ${G.gold>=r.g?'':'short'}"><i></i><b class="nums">${fmt(r.g)}</b> gold</span>`:''}</div></div><button class="btn sm ${ok?'gold':''}" data-act="craftR" data-arg="${RECIPES.indexOf(r)}" ${ok?'':'disabled'}>${r.item?'Craft':'Forge'}</button></div>`;}
// a recipe page: one category, or every category of the station under its own heading (All)
function m3Recipes(cats,sec,blurb){const one=sec!=='all'&&cats.includes(sec),list=one?[sec]:cats;let locked=0;
  const parts=list.map(k=>{const all=RECIPES.filter(r=>r.cat===k),open=all.filter(recipeOpen);locked+=all.length-open.length;const L=recipeList(open);
    const lab=(RCAT.find(x=>x[0]===k)||[k,k])[1];return (one?'':m3H(lab,L.length))+m3Rows(L.map(m3RecRow).join(''),open.length?'Nothing here matches the filters.':'No recipes of this kind yet.');}).join('');
  return `<p class="note">${blurb}</p>${shopFBar('craft')}${parts}${locked?`<p class="note">${locked} more recipe${locked>1?'s unlock':' unlocks'} here as you push into later realms.</p>`:''}`;}
function m3PlanBtn(){return G&&!G.daily?`<div class="btnrow p3smith"><button class="btn gold" data-act="p3Smith" title="Plans the best upgrade for each hero in your party, shows it, and only buys after you confirm">Buy, craft and equip best gear</button></div>`:'';}
function m3SmithMatsBuy(){return `${m3H('Ore and wood')}<p class="note">Stock grows as you reach later realms.</p><div class="rows">${smithMatStock().map(id=>matBuyRow(id,MAT_PRICE[id])).join('')}</div>
  ${m3H('Monster parts')}<p class="note">A few parts behind the counter, at a steep price and only ${PART_STOCK} of each per inn rest. Hunting is still the way to get them in bulk.</p><div class="rows">${Object.keys(PART_PRICE).map(id=>matBuyRow(id,partPrice(id),partLeft(id))).join('')}</div>`;}

// ----- the Smithy -----
function m3Smithy(m){const sec=m.sec,tab=m.tab;let body='';
  if(tab==='shop'){
    const W=shopSortIds(shopStock('weapons')),AR=shopSortIds(shopStock('armor')),A=AR.filter(id=>gearOf(id).slot==='a'),K=AR.filter(id=>gearOf(id).slot==='k');
    const grp={weapons:['Weapons',W],armor:['Armor',A],capes:['Capes',K]},emp='Nothing on the shelves matches the filters.';
    const gear=k=>(sec==='all'?m3H(grp[k][0],grp[k][1].length):'')+m3Rows(grp[k][1].map(m3GearRow).join(''),emp);
    body=(sec==='mats'?'':shopFBar('buy')+m3PlanBtn())+(sec==='all'?['weapons','armor','capes'].map(gear).join('')+m3SmithMatsBuy():sec==='mats'?m3SmithMatsBuy():gear(sec));
  }else if(tab==='craft')body=m3PlanBtn()+m3Recipes(SMITH_CATS,sec,'Smithy gear comes out already tempered, so it beats buying the same piece. Metal wants ore, wooden gear wants logs, and every piece wants monster parts.');
  else if(tab==='forge')body=vTemper({slot:M3_SLOTSEC[sec]||null,show:SHOPF().tsh||'all',bar:true});
  else if(tab==='sell'){const g=(sl,lab)=>(sec==='all'?m3H(lab):'')+m3Rows(m3SellRows(sl),'No spare '+lab.toLowerCase()+' in your pack.');
    const mats=(sec==='all'?m3H('Materials'):'')+`<div class="rows">${matSellRows(['ore','wood','part','relic'])}</div>`;
    body=(sec==='all'?g(['w'],'Weapons')+g(['a'],'Armor')+g(['k'],'Capes')+mats:sec==='mats'?mats:g([M3_SLOTSEC[sec]],{weapons:'Weapons',armor:'Armor',capes:'Capes'}[sec]))+'<p class="note">Charms and herbs sell at Alchemy.</p>';}
  else if(tab==='echo')body=vEchoforge();
  return m3Box('smithy',m,m3Nav('smithy',m)+body+'<p class="note">Equip gear from the menu anywhere. Potions, charms and travel gear are at Alchemy, the green-flask house in town.</p>');}
// ----- Alchemy -----
function m3Alchemy(m){const sec=m.sec,tab=m.tab;let body='';
  if(tab==='shop'){const S=alchStock(),one=sec!=='all';
    const items=k=>{const L=m3ItemSort(S.filter(id=>m3Kind(id)===k));return (one?'':m3H({potion:'Potions',cure:'Cures',travel:'Travel gear'}[k],L.length))+m3Rows(L.map(m3ItemRow).join(''),'Nothing here matches the filters.');};
    const charms=()=>{const L=shopSortIds(shopStock('charms'));return (one?'':m3H('Charms',L.length))+m3Rows(L.map(m3GearRow).join(''),'No charms match the filters.');};
    const herbs=()=>(one?'':m3H('Herbs'))+`<p class="note">Fresh herbs for brewing. Stock grows as you reach later realms.</p><div class="rows">${herbStock().map(id=>matBuyRow(id,MAT_PRICE[id])).join('')}</div>`;
    const relit=()=>{if(!G.cleared[townS()])return '';const P={};RELIT_STOCK.forEach(([id,p])=>P[id]=p);const ids=RELIT_STOCK.map(x=>x[0]);
      return (one?'':m3H('Festival wares',ids.length))+`<p class="note">The beacon is lit and the alchemist is in a generous mood: rare stock, only in relit towns.</p><div class="rows">${ids.map(id=>{const isItem=!!ITEMS[id],n=isItem?ITEMS[id].n:gearOf(id).n,d=isItem?ITEMS[id].d:gearDesc(id),price=P[id];return `<div class="row"><div class="grow"><b>${n}</b><small>${d}${isItem?'. Carrying '+(G.inv[id]||0):''}</small></div><button class="btn sm" data-act="buyRelit" data-arg="${id}" ${G.gold>=price?'':'disabled'}>${fmt(price)}</button></div>`;}).join('')}</div>`;};
    const P={potion:()=>items('potion'),cure:()=>items('cure'),travel:()=>items('travel'),charm:charms,herb:herbs,relit};
    body=(sec==='herb'||sec==='relit'?'':shopFBar(sec==='charm'?'buy':sec==='all'?'mixed':'items'))+(one?P[sec]():Object.keys(P).map(k=>P[k]()).join(''));
  }else if(tab==='craft')body=m3Recipes(ALCH_CATS,sec,sec==='potion'?'Brew draughts from herbs you pick in the fields. Cheaper than buying, and some brews are Alchemy-only.':sec==='charm'?'Charms need monster parts and your realm\'s relic.':sec==='item'?'Stitch your own tent from logs and hide.':'Brew draughts from herbs, make charms from monster parts and your realm\'s relic, and stitch your own tent.');
  else if(tab==='sell'){const ch=(sec==='all'?m3H('Charms'):'')+m3Rows(m3SellRows(['c']),'No spare charms. Weapons and armor sell at the Smithy.'),hb=(sec==='all'?m3H('Herbs'):'')+`<div class="rows">${matSellRows(['herb'])}</div>`;
    body=sec==='charm'?ch:sec==='herb'?hb:ch+hb;}
  else body=`<p class="note">Everything you have gathered. Herbs brew here; ore, logs and parts go to the Smithy.</p>${vPouch()}`;
  return m3Box('workshop',m,m3Nav('workshop',m)+body);}
// ----- the tavern -----
function m3Tavern(m){const tab=m.tab;let body='';
  if(tab==='kitchen')body=`<p class="note">Hot food for the road.</p><div class="rows">${tavernFood().map(id=>m3ItemRow(id)).join('')}</div><p class="note">A Pork Chop Sandwich walks you back to a dungeon's entrance; in battle it is a sure escape from ordinary fights.</p>`;
  else{const SL=tvSlots(),L=SL.filter(Boolean),rare=G.rare&&!G.roster[G.rare]?G.rare:null,later=tavernLater(),nu=nextTavernUnlock(),pool=tavernPool().length;
    body=`<p class="note">Sellswords, singers and strays, all for hire. Recruits arrive near your party's level with fitting gear.</p>
    ${rare?`<div class="rare"><h3>A rare wayfarer is drinking alone</h3>${heroCard(rare,false,null,`<button class="btn gold" data-act="hire" data-arg="${rare}" ${G.gold>=recruitCost(rare)?'':'disabled'}>Hire for ${fmt(recruitCost(rare))}</button>`)}</div>`:G.stage>=2?'<p class="note">No rare wayfarers tonight. They drift in after Scourge fights, bounties and nights at the inn.</p>':''}
    <div class="tvbar"><small>${esc(tvNextText())}</small>${pool>L.length?`<small>${pool} wayfarer${pool>1?'s':''} are in this town's pool; four tables, picked to suit your party.</small>`:''}</div>
    <div class="grid cards">${SL.map(id=>id?heroCard(id,false,null,`<div class="fits">${fitTags(id)}</div><button class="btn gold" data-act="hire" data-arg="${id}" ${G.gold>=recruitCost(id)?'':'disabled'}>Hire for ${fmt(recruitCost(id))}</button>`):`<div class="card hero emptyseat"><b>Empty seat</b><small>Fills at the next shuffle.</small></div>`).join('')||m3Empty('Nobody new at the tables.')}</div>
    ${later?`<p class="note">${later} more wayfarer${later>1?'s are':' is'} on the road${nu?`; the next arrive in about ${nu.need} battle${nu.need>1?'s':''}, or when you reach the next realm`:''}.</p>`:''}<p class="note">Some wayfarers won't sit in a tavern at all. Check the Guild Hall's recruitment challenges.</p>`;}
  return m3Box('tavern',m,m3Nav('tavern',m)+body);}
// ----- the Guild Hall -----
function m3Bounties(){for(let s=0;s<=G.stage;s++)genBounties(s);const bo=b=>b.state==='active'?0:b.state==='open'?1:2,L=G.bounties.filter(b=>b.stage<=G.stage).sort((a,b)=>bo(a)-bo(b));
  return `<p class="note">Marked monsters roam the fields. Accept a bounty and its quarry appears in that realm's field, glowing red. Beat it for gold, a stat charm and materials.</p>${typeof allBar==='function'?allBar('bountyAll','',L.filter(b=>b.state==='open').length,0):''}${m3Rows(L.map(b=>{const mo=MON[b.mon],md=ELITE_MODS.find(x=>x.k===b.mod);
    return `<div class="row"><img class="mimg" src="${monURL(mo.art)}" alt=""><div class="grow"><b>${esc(b.name)}</b><small>${md.n}: ${md.d} Level ${b.lv}. Roams ${esc(ZS(b.stage).n)}.</small><small>${fmt(b.reward.gold)} gold, ${gearOf(b.reward.charm).n}</small></div>${b.state==='open'?`<button class="btn sm gold" data-act="bounty" data-arg="${b.id}">Accept</button>`:b.state==='active'?'<span class="m">Hunting</span>':'<span class="m up">Done</span>'}</div>`;}).join(''),'No bounties posted yet.')}`;}
function m3Arena(){const cl=G.cleared.filter(Boolean).length;
  return `<p class="note">The guild's fighting pit. Back-to-back waves of foes from every realm, no fleeing, no rest between waves.</p><div class="rows">${ARENA.map((A,i)=>`<div class="row"><div class="grow"><b>${A.n}</b><small>${A.waves} waves, foes level ${A.lvs[0]}-${A.lvs[1]}. Suggested party level ${A.rec}. ${A.min>cl?`Opens after ${A.min} Scourge${A.min>1?'s':''} fall${A.min>1?'':'s'}.`:`Best: ${G.arena[i]?'cleared x'+G.arena[i]:'not yet cleared'}.`}</small><small>${fmt(A.reward.gold)} gold, ${A.reward.mat} materials${A.reward.charm?', a stat charm':''}${A.reward.core?', '+A.reward.core+' Dread Cores':''}</small></div><button class="btn sm gold" data-act="arena" data-arg="${i}" ${A.min>cl?'disabled':''}>Enter</button></div>`).join('')}</div>
    ${m3H('Echoes')}<p class="note">Beat a Scourge or the Calamity and an optional Echo of it lingers in its dungeon, on the rune circle where it fell. After the Calamity, the Echo Rift at any waystone lets you fight every Echo you have unlocked again.</p>`;}
function m3Guild(m){const tab=m.tab,sec=m.sec;let body='';
  if(tab==='recruit')body=vChallenges();
  else if(tab==='nature')body=vNature(m);
  else if(tab==='quests')body=sec==='personal'?vPersonal():sec==='bounties'?m3Bounties():m3H('Personal quests')+vPersonal()+m3H('Bounties')+m3Bounties();
  else if(tab==='arena')body=m3Arena();
  else body=`<p class="note">The guilds post their missions here and keep your ranks. The same pages are under Menu: Quests, Guild missions and Records, Guilds.</p>`+(typeof vFactions==='function'?vFactions():'');
  return box(m3Head('guild'),m3Nav('guild',m)+body,'<button class="btn gold" data-act="closeModal">Done</button>',true);}
// ----- the Quest Board -----
function m3Quests(){for(let s=0;s<=G.stage;s++)genQuests(s);return G.quests.filter(q=>q.stage<=G.stage);}
function m3Board(m){const sec=m.sec||'all',st=q=>q.state==='active'?(questReady(q)?0:1):q.state==='open'?2:3;
  const qs=m3Quests().filter(q=>sec==='all'||(sec==='ready'?q.state==='active'&&questReady(q):sec==='active'?q.state==='active'&&!questReady(q):sec==='open'?q.state==='open':q.state!=='open'&&q.state!=='active')).sort((a,b)=>st(a)-st(b));
  const Q=m3Quests(),bar=typeof allBar==='function'?allBar('qAcceptAll','qClaimAll',Q.filter(q=>q.state==='open').length,Q.filter(q=>q.state==='active'&&questReady(q)).length):'';
  const rows=qs.map(q=>{
    const prog=q.type==='tamer'?`${Math.min(stickCount().n,q.n)}/${q.n} creatures logged`:q.type==='legend'?legendProg(q):q.type==='hunt'?`${q.have||0}/${q.n} hunted`:q.type==='gather'?`${Math.min(G.mats[q.mat]||0,q.n)}/${q.n} gathered`:q.type==='vault'?((G.vaults||{})[q.stage]?'Hoard recovered':'Vault still sealed'):q.found?'Found':'Somewhere in the '+ZS(q.stage).dungeon;
    const rew=q.type==='tamer'?"The Tamer's Stick, a weapon that grows with your Bestiary":q.type==='legend'?`${esc(TPL[q.hero].title)} may join you`:q.type==='wanderer'?`${TPL[q.hero].n} joins you`:`${fmt(q.reward.gold)} gold${q.reward.item?', '+ITEMS[q.reward.item].n+' x2':''}${q.reward.gear?', forged gear':''}`;
    const btn=q.state==='open'?`<button class="btn sm" data-act="qAccept" data-arg="${q.id}">Accept</button>`:q.state==='active'?(questReady(q)?`<button class="btn sm gold" data-act="qClaim" data-arg="${q.id}">Claim</button>`:'<span class="m">Active</span>'):'<span class="m up">Done</span>';
    return `<div class="row"><div class="grow"><b>${esc(q.title)}</b><small>${esc(q.desc)}</small><small>${q.state==='active'?prog+'. ':''}Reward: ${rew}</small></div>${btn}</div>`;}).join('');
  return box(m3Head('board'),`<p class="note">Notices pinned three deep. Accept one, do the deed, then come back to any quest board to claim the reward.</p>${m3Nav('board',m)}${bar}${m3Rows(rows,{ready:'Nothing is ready to hand in yet.',active:'No quests under way.',open:'No new notices. More go up as your journey goes on.',done:'Nothing finished yet.'}[sec]||'No notices yet.')}`);}
// ----- hooks: the shops go through the normaliser first -----
function mShop(m){m3Norm(m);return m3Smithy(m);}
function mWorkshop(m){m3Norm(m);return m3Alchemy(m);}
function mTavern(){const m=V.modal&&V.modal.type==='tavern'?m3Norm(V.modal):{type:'tavern',tab:'hire',sec:'all'};return m3Tavern(m);}
function mGuild(m){m3Norm(m);return m3Guild(m);}
function mBoard(){const m=V.modal&&V.modal.type==='board'?m3Norm(V.modal):{type:'board',sec:'all'};return m3Board(m);}
Object.assign(ACT,{
  sTab(k){const m=V.modal;if(!m)return;m.tab=k;m.sec='all';m._t=k;m.nat=null;V.cmp=null;V.swapSel=null;render();m3Top();},
  sSec(k){const m=V.modal;if(!m)return;m.sec=k;V.cmp=null;render();m3Top();},
  wcat(k){const m=V.modal;if(!m)return;m.sec=k;m._t=m.tab;render();},
  tab(k){const m=V.modal;if(!m)return;m.tab=k;render();m3Top();},
  // Tempering show filter (stored with the shop filters)
  tShow(a){const v=String(a).split(':').pop();shopFSet('tsh',v);render();}
});
function m3Top(){const p=document.querySelector('#modal .panel');if(!p)return;const n=p.querySelector('.shopnav');p.scrollTop=n&&p.scrollTop>n.offsetTop?Math.max(0,n.offsetTop-60):p.scrollTop>0&&!n?0:p.scrollTop;}
// the Guild Hall's tab action keeps the new state
ACT.gtab=function(k){V.swapSel=null;V.modal={type:'guild',tab:k};render();};

// ----- main menu: labels for the regrouped tabs (MENU_GROUPS in ui.js) -----
try{MENU_SUB.fmis='Guild missions';MENU_SUB.pouch='Materials';MENU_SUB.system='Journey';}catch(e){}

// ----- the visible viewport: panels fit the screen the phone really shows (the URL bar and the Android app's bars included) -----
function m3Vh(){try{const v=window.visualViewport,h=Math.round(v?v.height:innerHeight);document.documentElement.style.setProperty('--vvh',h+'px');}catch(e){}}
m3Vh();addEventListener('resize',m3Vh);try{if(window.visualViewport)visualViewport.addEventListener('resize',m3Vh);}catch(e){}
try{if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',()=>setTimeout(m3Vh,200));}catch(e){}

// ----- test hook -----
window.__M3={get MENU_GROUPS(){return MENU_GROUPS;},m3Norm,m3Tabs,m3Secs,shopFBar:c=>shopFBar(c),ddSel,M3_LEG,M3_HOME,m3Upg};
