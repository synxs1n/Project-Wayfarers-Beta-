// ===== ailments.js (v0.4.1): dead stay dead, persistent ailments (poison, curse, wound) =====
// ===== Beta v0.4.1 2.1 and 2.2: dead stay dead, persistent ailments =====
// Outside battle the truth lives in c.ail {poison,curse,wound} (saved per hero, optional). In battle the same ailments are ordinary statuses
// (c.st); startBattle copies c.ail into c.st and finishBattle copies the survivors' statuses back.
// Cures: Remedy = Poison. Sacred Ash = Curse. Bandage Roll = Wound. Purify-style skills = Poison and Curse (not Wound). Tents = Poison.
// The Inn, and big full-party heals that also revive (Benediction, Seraph's Grace, Miracle), = everything.
const AIL_KEYS=['poison','curse','wound'];
STS.poison.persist=1;
STS.curse={n:'Curse',a:'CRS',bad:1,t:99,c:'#8a5ac8',d:'Healing on this hero is 40% weaker. Lasts after the fight until cured.',persist:1};
STS.wound={n:'Wound',a:'WND',bad:1,t:99,c:'#c03a3a',d:'Max HP down 20%. Lasts after the fight until cured.',persist:1,hard:1};
ITEMS.salts={n:'Smelling Salts',d:'Revives a KO\'d hero at 25% HP. Cheap, and sold in every town',price:35,revive:.25};
ITEMS.ash={n:'Sacred Ash',d:'Lifts a Curse from one hero',price:45,curse:1};
ITEMS.bandage={n:'Bandage Roll',d:'Closes a Wound and restores the hero\'s full max HP',price:65,wound:1};
ITEMS.remedy.d='Cures Poison and other passing ailments (not Curse or Wound)';
if(typeof ITEM_TIER_OF!=='undefined'){ITEM_TIER_OF.salts=0;ITEM_TIER_OF.ash=1;ITEM_TIER_OF.bandage=1;}
{const is0=itemStock;itemStock=function(){const o=is0.apply(this,arguments).slice();['salts','ash','bandage'].forEach(k=>{if(!o.includes(k))o.push(k);});return o;};}
const hasAil=c=>!!(c&&c.ail&&AIL_KEYS.some(k=>c.ail[k]));
const ailOf=c=>AIL_KEYS.filter(k=>c&&c.ail&&c.ail[k]);
// wound shrinks max HP everywhere stats are computed
HOOK.after('calcStats','ailments','wound shrinks max HP',function(S,c){if(c&&c.ail&&c.ail.wound){S.mhp=Math.max(10,Math.round(S.mhp*AIL.woundMhp));}});
// cleansing: passing ailments always go; curse goes to Purify style skills; wound only to the big revive-and-cleanse heals (opt.hard) and the Bandage
function cleanse(t,opt){// with no opt, the battle's own calls choose: a revive-and-cleanse skill is hard:1, an item cure is item:1 (see perform/useItem below)
  if(!opt&&typeof B!=='undefined'&&B&&B.hardCleanse)opt={hard:1};else if(!opt&&typeof B!=='undefined'&&B&&B.itemCure)opt={item:1};opt=opt||{};let n=0;
  Object.keys(t.st||{}).forEach(k=>{const d=STS[k];if(!d||!d.bad)return;if(d.hard&&!opt.hard)return;if(k==='curse'&&opt.item)return;delete t.st[k];n++;});
  if(t.ail){AIL_KEYS.forEach(k=>{if(!t.ail[k])return;if(k==='wound'&&!opt.hard)return;if(k==='curse'&&opt.item)return;if(k==='poison'&&opt.only&&opt.only!=='poison')return;delete t.ail[k];n++;});}
  if(n&&opt.hard){try{refresh(t);}catch(e){}}return n;}
// the battle's cleanse calls: items are cure:1 (passing ailments only); skills with revive and cleanse also lift Wounds
HOOK.wrap('perform','ailments','hard cleanse flag for revive and cleanse skills',function(next,...args){let a=args[0],sk=args[1],tgts=args[2];if(sk&&sk.cleanse&&sk.revive)B.hardCleanse=1;try{return next(...args);}finally{B&&(B.hardCleanse=0);}});
{const ui0=useItem;useItem=function(id,t){const it=ITEMS[id];if(typeof B!=='undefined'&&B)B.itemCure=!!(it&&it.cure);try{
    if(it&&(it.curse||it.wound)&&G.inv[id]&&t&&t.hp>0&&B){const key=it.curse?'curse':'wound';if(!t.st[key]){toast&&toast(t.name+' has no '+STS[key].n+'.');return;}
      delete t.st[key];if(t.ail)delete t.ail[key];if(key==='wound')refresh(t);fx(t,'Cured','heal');log(`${B.cur.name} uses ${it.n}. ${t.name} is cured.`);t.healT=Date.now();G.inv[id]--;B.cur.actT=Date.now();B.cur.actKind='item';endTurn(B.cur,.8);return;}
    return ui0.apply(this,arguments);}finally{if(B)B.itemCure=false;}};}
// field items: Remedy, Sacred Ash and Bandage Rolls work from the menu
{const uf0=useItemField;useItemField=function(id,c){const it=ITEMS[id];
  if(it&&(it.cure||it.curse||it.wound)&&G.inv[id]){const k=it.cure?'poison':it.curse?'curse':'wound';if(!c||c.hp<=0||!c.ail||!c.ail[k])return false;delete c.ail[k];if(it.cure&&c.ail.poison===undefined){}refresh(c);G.inv[id]--;saveGame();return true;}
  return uf0.apply(this,arguments);};}
// the heal skills cast from the field menu
{const fe0=fsEffect;fsEffect=function(s,t){return fe0.apply(this,arguments)||(!!s.cleanse&&t.hp>0&&hasAil(t));};}
{const fc0=fsCast;fsCast=function(cid,sid,tid){const c=G.roster[cid],s=c&&fsSkills(c).find(x=>x.id===sid);if(s&&s.cleanse&&c.mp>=(s.mp||0)){const hard=!!(s.revive&&s.cleanse),T=(s.t==='allyAll'?G.party.map(id=>G.roster[id]).filter(Boolean):[G.roster[tid]]).filter(Boolean);
    T.forEach(t=>{if(t.hp>0&&hasAil(t)){cleanse(t,hard?{hard:1}:{});refresh(t);}});}
  return fc0.apply(this,arguments);};}
// the inn heals everything; a tent washes Poison out
HOOK.after('restAll','ailments','the inn clears ailments',function(ok,s){if(ok){Object.values(G.roster).forEach(c=>{c.ail={};c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});saveGame();}});
if(typeof campRest==='function'){const cr0=campRest;campRest=function(){const r=cr0.apply(this,arguments);try{Object.values(G.roster).forEach(c=>{if(c.ail&&c.ail.poison)delete c.ail.poison;});}catch(e){}return r;};}
// battles: carry ailments in and out
HOOK.after('startBattle','ailments','carry hero ailments in',function(r){try{if(r!==false&&B&&!(G&&G.daily)){allParty().forEach(c=>{ailOf(c).forEach(k=>{c.st[k]={t:STS[k].t,src:null};});});}}catch(e){}});
HOOK.before('finishBattle','ailments','ailments carried out',function(how){try{if(B&&G&&!G.daily){allParty().forEach(c=>{const a={};if(c.hp>0)AIL_KEYS.forEach(k=>{if(c.st&&c.st[k])a[k]=1;});c.ail=a;c.S=calcStats(c);c.hp=Math.min(c.hp,c.S.mhp);});}}catch(e){}});
// a Wound landed in battle takes hold at once: max HP drops now
HOOK.wrap('addSt','ailments','wound becomes an ailment',function(next,...args){const [t,k,src,silent]=args;const was=t&&t.st&&t.st[k];const r=next(...args);try{if(r&&k==='wound'&&t.side==='p'&&!was){t.ail=t.ail||{};t.ail.wound=1;t.S=calcStats(t);t.hp=Math.min(t.hp,t.S.mhp);}
  if(k==='wound'&&t&&t.side==='e'&&t.st&&t.st.wound)delete t.st.wound;}catch(e){}return r;});
// out of battle poison: a little HP every few steps, never lethal
HOOK.after('arrive','ailments','out of battle poison',function(){try{if(G&&!G.daily){G.ailSteps=(G.ailSteps||0)+1;if(G.ailSteps>=AIL.poisonSteps){G.ailSteps=0;let hit=false;G.party.forEach(id=>{const c=G.roster[id];if(c&&c.hp>1&&c.ail&&c.ail.poison){c.hp=Math.max(1,c.hp-Math.max(1,Math.round(c.S.mhp*AIL.poisonPct)));hit=true;}});if(hit&&typeof renderWorldUI==='function'&&!V.modal)renderWorldUI();}}}catch(e){}});
// foes that carry them
(function(){const bossEdit=d=>{if(!d||d.__wound)return;d.__wound=1;const sk=(d.sk||[]).find(s=>s[3]==='one'&&s[4]==='phys')||(d.sk||[]).find(s=>s[3]==='one');if(sk){sk[5]=(sk[5]||[]).concat([['wound',AIL.bossWound]]);}};
  Object.keys(GUARDIANS).forEach(k=>bossEdit(GUARDIANS[k]));Object.keys(FINALS).forEach(k=>bossEdit(FINALS[k]));
  window.__ailFoes=()=>{if(window.__ailFoesDone)return;window.__ailFoesDone=1;
  const dark=k=>{const t=(typeof MON_TY!=='undefined'&&MON_TY[k])||[];return t.includes('undead')||(MON[k].el||[]).includes('shadow');};
  Object.keys(MON).forEach(k=>{const m=MON[k];if(!m||!m.sk||!dark(k)||m.__curse)return;m.__curse=1;const s=m.sk.find(q=>q[3]!=='self'&&q[4]!=='buff');if(s)s[5]=(s[5]||[]).concat([['curse',AIL.foeCurse]]);});};})();
HOOK.before('startBattle','ailments','foe ailments (window.__ailFoes) first',function(){try{window.__ailFoes();}catch(e){}});
// small chips for the Party, Roster, Equipment and hero sheet
function ailChips(c){const L=ailOf(c);return L.length?`<span class="ailrow" aria-label="Ailments">${L.map(k=>`<span class="ail ail-${k}" title="${STS[k].n}: ${STS[k].d}" style="--c:${STS[k].c}">${stSym(k)}</span>`).join('')}</span>`:'';}
// the portrait badge: KO tag and ailment chips (v0.4.1 2.1 / 2.2); shown on Party, Roster, Equipment, Loadouts and the hero sheet
function ailBadge(id){const c=typeof G!=='undefined'&&G&&G.roster&&G.roster[id];if(!c||(typeof B!=='undefined'&&B&&V.screen==='battle'))return '';
  const ko=c.hp<=0?'<span class="kotag" title="Knocked out: needs Smelling Salts, a Phoenix Feather, a revive skill, a tent or the inn">KO</span>':'';
  return ko+(c.hp>0?ailChips(c).replace('class="ailrow"','class="ailrow dots"'):'');}

// ===== v0.4.1 2.7 and 2.8: battle sky tags and the Lore entry =====
// Fights below ground (dungeons, caves, sanctums, bosses and echoes) are Indoors; everything else shows the weather (Clear too) and, outside the Daily Trial, the time of day.
function battleIndoors(){if(!B)return false;try{const m=WS.m;if(m&&m.cave&&m.fort&&m.open&&(B.spec.kind==='mini'||B.spec.kind==='dungeon'))return false;/* v0.12.5: an open Sanctum */}catch(e){}return ['dungeon','boss','echoBoss','storyEcho','mini'].includes(B.spec.kind);}
function battleSkyTags(){if(!B)return '';
  if(battleIndoors())return `<button class="wchip" data-act="wxInfo" data-arg="indoors" title="Weather and time of day do not reach in here">⌂ Indoors</button>`;
  const W=WEATHER[B.weather||'clear']||WEATHER.clear;let h=`<button class="wchip" data-act="wxInfo" data-arg="weather" title="${esc(W.d)}">${W.i} ${esc(W.n)}</button>`;
  if(B.spec.kind!=='daily'&&typeof clockPhase==='function'&&typeof PH_LOOK!=='undefined'){const ph=clockPhase(),P=PH_LOOK[ph];if(P)h+=`<button class="wchip ph ${ph}" data-act="wxInfo" data-arg="time" title="Time of day">${P.i} ${P.n}</button>`;}
  return h;}
// the battle Guide: a short summary of the battle system, with links to the full Guides pages and to foe lore
HOOK.before('vModal','ailments','battle guide popup',function(m){if(m&&m.type==='battleguide')return HOOK.stop(box('Guide',`<p class="note">Read only. The fight is paused while this is open.</p>
  <div class="rows compact">
  <div class="row"><div class="grow"><b>Turn order</b><small>The order bar at the top shows who acts next. Faster fighters act more often.</small></div></div>
  <div class="row"><div class="grow"><b>Attack, Skills, Items, Guard</b><small>Attack is free. Skills cost MP. Items use up your pack. Guard cuts the damage you take and helps you recover.</small></div></div>
  <div class="row"><div class="grow"><b>Weaknesses and resistances</b><small>Hit a weakness for double damage. A resisted element does half. Scan a foe to learn what it is weak to.</small></div></div>
  <div class="row"><div class="grow"><b>Primers, Detonators and reactions</b><small>A Primer marks a foe with its element for two turns. A Detonator of a different element sets off a reaction for big bonus damage.</small></div></div>
  <div class="row"><div class="grow"><b>Momentum</b><small>Good plays build Momentum. A full bar unlocks a Limit Break.</small></div></div>
  <div class="row"><div class="grow"><b>Timed hits</b><small>Tap at the right moment when a hit lands to deal more damage, or when a foe strikes to take less.</small></div></div>
  <div class="row"><div class="grow"><b>Break shields</b><small>Some foes wear a shield. Hit its weak elements to wear it down. A broken shield leaves the foe stunned and takes extra damage.</small></div></div>
  </div>`,`<button class="btn gold" data-act="guideFull">Open the full Guides</button><button class="btn" data-act="guideLore">Foe lore</button><button class="btn" data-act="closeModal">Back to the fight</button>`,true));});
ACT.guideFull=function(){V.lastMenuTab='charts';V.modal={type:'menu',tab:'charts'};render();};
ACT.guideLore=function(){V.modal={type:'battlelore'};render();};
HOOK.before('vModal','ailments','battlelore popup',function(m){if(m&&m.type==='battlelore')return HOOK.stop(box('Lore',`<p class="note">Read only. The fight is paused while this is open.</p>${vLore()}`,`<button class="btn gold" data-act="closeModal">Back to the fight</button>`,true));});
