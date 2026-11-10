// ===== fixes11.js: the hooks that must load last =====
// Everything else that lived here (and in fixes10.js) moved into the module that owns the feature. These two have to follow other modules:
// 1) the cap drop hooks below read B.result (built by results.js's win wrap) and add to info.gold after endgame10's Breach purse has read it;
// 2) hideLegendNames rewrites the finished HTML of every popup, so it must be registered after every vModal hook that builds one.
// ----- v0.17.1: at the level cap, XP becomes gold; drops past the pack's cap become gold -----
// CAPG and the addXp hook that turns XP at the level cap into gold live in p4xp.js; this pair sells overflow drops and pays B.capGold out.
HOOK.before('win','fixes11','pack snapshot for cap drops',function(){try{if(B&&G)B.invBefore=Object.assign({},G.inv||{});}catch(e){}});
HOOK.after('win','fixes11','cap XP and overflow drops to gold',function(){try{const info=B&&B.result;if(!info||!G)return;info.notes=info.notes||[];let g=0;const full=[];
  (info.drops||[]).forEach(d=>{const had=(B.invBefore||{})[d]||0;if(had>=invCap()){const it=ITEMS[d];const v=Math.max(1,Math.round(((it&&it.price)||10)*CAPG.dropRate));g+=v;full.push((it&&it.n)||d);}});
  if(g>0){G.gold+=g;info.gold=(info.gold||0)+g;info.notes.push(`${[...new Set(full)].join(', ')}: the pack holds ${invCap()} already, sold on the spot for ${fmt(g)} gold.`);}
  if(B.capGold){info.gold=(info.gold||0)+B.capGold;info.notes.push(`Experience beyond the level cap became ${fmt(B.capGold)} gold.`);B.capGold=0;}}catch(e){}});
// ----- v0.17.1: legendary classes stay unmentioned until one of their heroes is unlocked -----
// Class lists in the UI ("For: Mages, Archmages, Chroniclers", "tomes are for Mages, Archmages and Chroniclers") named the three legendary
// classes to every player. Until a legend of that class is unlocked (legends.js legendOn), its name is cut from such lists.
// (legendClsOn and hideLegendNames are in legends.js) must follow every vModal hook that builds a popup (it rewrites their finished HTML)
HOOK.xform('vModal','fixes11','hide legendary class names',function(h){return hideLegendNames(h);});
