// ===== tiers.js (v0.4.0): item strength borders, tier chips, Craft only tags =====
// ===== v0.4.0 3.10: item strength borders =====
// Colours, names and pips come from ITEM_TIERS in data.js. Everything here only reads them.
function gTierIdx(g){if(!g)return 0;if(g.stick)return Math.min(5,g.tier||0);if(g.id&&/_ef(\+\d)?$/.test(String(g.id))||g.base&&/_ef$/.test(String(g.base)))return 6;return Math.max(0,Math.min(5,g.tier||0));}
function iTierIdx(id){if(ITEM_TIER_OF[id]!=null)return ITEM_TIER_OF[id];const o=ITEMS[id];if(!o)return 0;const p=o.price0||o.price||0;return p<80?0:p<200?1:p<500?2:3;}
function tierVars(t,g){const T=ITEM_TIERS[t];return `--tc:${g&&g.stick&&g.glow?g.glow:T.c};--tc2:${T.c2||T.c}`;}
// small label: pip, name and (for tempered gear) the +N marker
function tierChip(x,plus){const g=typeof x==='object'&&x;const t=g?gTierIdx(g):x,p=g?(g.plus||0):(plus||0),T=ITEM_TIERS[t];
  const r=`<em class="tchip t${t}${t===6?' ef':''}" style="${tierVars(t,g)}" title="${T.n} tier${p?', tempered +'+p:''}"><i aria-hidden="true">${g&&g.stick?'✦':T.pip}</i>${T.n}${p?`<b class="tplus">+${p}</b>`:''}</em>`;
  try{return g&&g.id?r+craftTag(g.id):r;}catch(e){return r;}}// gear objects also get the Craft only tag
function itemChip(id){const t=iTierIdx(id),T=ITEM_TIERS[t];return `<em class="tchip t${t}" style="${tierVars(t)}" title="${T.n} tier"><i aria-hidden="true">${T.pip}</i>${T.n}</em>`+craftTag(id);}
// framed gear icon (same canvas icon as before, now inside the tier border)
{const gi0=gearIcon;gearIcon=function(id){const s=gi0.apply(this,arguments);if(!s)return s;const g=gearOf(id),t=gTierIdx(g),T=ITEM_TIERS[t];
  return `<span class="gframe t${t}${t===6?' ef':''}${g.stick?' stk':''}" style="${tierVars(t,g)}" title="${T.n}${g.plus?', tempered +'+g.plus:''}" role="img" aria-label="${T.n} ${esc(g.n)}">${s}<b class="tpip" aria-hidden="true">${g.stick?'✦':T.pip}</b></span>`;};}
// better, same or worse than what a hero wears now (a hero's own slot)
function vsMark(c,id){const gg=gainFor(c,id);if(!gg)return '<span class="vs na">Cannot use</span>';
  if(gg.d>.01&&gg.pct>=.005)return `<span class="vs better">▲ Better${gg.pct>=.005?' +'+Math.max(1,Math.round(gg.pct*100))+'%':''}</span>`;
  if(gg.d<-.01&&gg.pct<=-.005)return `<span class="vs worse">▼ Worse ${Math.round(gg.pct*100)}%</span>`;return '<span class="vs same">● Same</span>';}
// shops and Forge have no single hero: judge against the active party (best gain wins; if nobody gains, say so)
function vsParty(id){const L=G.party.map(h=>G.roster[h]).filter(c=>c&&canEquip(c,id));if(!L.length)return '<span class="vs na">Not for your party</span>';
  const gs=L.map(c=>({c,g:gainFor(c,id)})).filter(o=>o.g).sort((a,b)=>b.g.pct-a.g.pct),top=gs[0];
  if(top&&top.g.d>.01&&top.g.pct>=.005)return `<span class="vs better">▲ Better for ${esc(top.c.name)} +${Math.max(1,Math.round(top.g.pct*100))}%</span>`;
  if(gs.every(o=>o.g.d<-.01&&o.g.pct<=-.005))return '<span class="vs worse">▼ Worse than your party wears</span>';return '<span class="vs same">● Same as your party wears</span>';}

// ===== Beta v0.4.1 6.3: "Craft only" tag. Anything no shop ever sells (Alchemy, the Smithy or the charm stall, at any stage) and that you can
// only get by crafting (or tempering, which shops never sell) carries the tag, in recipes, Equipment and Items.
let _shopAll=null;
function shopAllIds(){if(_shopAll)return _shopAll;const S=new Set(),fam=new Set();
  Object.values(CLS_WPN).forEach(a=>a.forEach(f=>fam.add(f)));['blade','staff','bow','dagger'].forEach(f=>fam.add(f));
  for(let t=0;t<=5;t++){fam.forEach(f=>S.add('w_'+f+'_'+t));['mail','robe','vest'].forEach(f=>S.add('a_'+f+'_'+t));}
  ['c_vital','c_mana','c_swift','c_clarity'].concat(ELK.map(k=>'c_'+k)).forEach(i=>S.add(i));
  const g0=G&&G.stage;try{[0,1].forEach(st=>{if(G)G.stage=st;itemStock().forEach(i=>S.add(i));if(typeof alchStock==='function')alchStock().forEach(i=>S.add(i));});}catch(e){}finally{if(G)G.stage=g0;}
  ['potion','hipotion','ether','remedy','plume','tent','holywater','porkchop','salts','ash','bandage'].forEach(i=>S.add(i));
  return _shopAll=S;}
// v0.10.8: the tag needs a recipe. Before, anything no shop sold was tagged, so personal quest rewards, Echoforged and other unique
// gear (none of which has a recipe) said "Craft only".
let _recOut=null;
function recipeOuts(){if(_recOut)return _recOut;const S=new Set();try{RECIPES.forEach(r=>{const o=r.item||r.id;if(o)S.add(o);});}catch(e){}return _recOut=S;}
function craftOnly(id){if(!id)return false;const m=String(id).match(/^(.*)\+(\d)$/);if(m&&!recipeOuts().has(String(id)))return craftOnly(m[1]);// a tempered piece can be bought and tempered, so it only counts when its base is craft only too
  if(String(id).startsWith('c_'))return false;// stat charms also turn up in vaults and chests
  if(m&&shopAllIds().has(m[1]))return false;// a forged +N of a shop piece: buy the base and temper it
  return recipeOuts().has(String(id))&&(!!GEAR[id]||!!ITEMS[id])&&!shopAllIds().has(id)&&!(GEAR[id]&&(GEAR[id].stick||GEAR[id].legend||GEAR[id].sig));}
function craftTag(id){return craftOnly(id)?'<em class="tchip craftonly" title="No shop sells this. You can only craft it.">Craft only</em>':'';}
