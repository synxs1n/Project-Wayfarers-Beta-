// ===== gear16.js (owner playtest pass on equipment, shops and the party buttons) =====
// Last in MODS. No new save fields; test tools/chrome/v188a.js.
//  1) A first realm hint (p2world.js #p2hint, fixed at the top, z 60) lay over the Menu's group tabs on a phone: Backpack and Quests took no taps
//     for the 30 s it stays. While a window is open the hint is now put away (its clock stops) and comes back when the window closes.
//  2) "Upgrade whole party" (Smithy and Alchemy, p3shop.js) planned one step per hero and slot from the pack as it stood, so the pieces the
//     first press freed (hand-me-downs) and the steps that only opened after it showed up on a second press. The plan now runs round after
//     round on a copy of the purse, the materials, the pack and what the six wear until a round finds nothing, and Confirm buys round after
//     round the same way. Undo still puts the gear back (a piece tempered on the way stays tempered).
//  3) deltaHtml lists every stat a piece changes for a hero against what they wear, gains and losses, with signed amounts: the eight sheet
//     stats, then crit, accuracy, evasion, element damage and resistances, healing, perks. A shop or forge row nobody gains from shows the
//     change for the heroes who could wear it.
//  4) Equip Best pressed right after Build party (Apply) in the same Menu visit closes the Menu with a toast (0.21.3 closed it after every
//     Equip Best and every Build party; the owner meant only this case). Equip Best keeps an Undo on Backpack > Equipment until the gear
//     changes again.
//  5) Rarity by progress: rarCap() is the highest rarity (ITEM_TIERS index) a journey has open: Common and Uncommon in the first realm, one
//     more per realm reached or Scourge beaten (pcRealm()), Heroic in the fifth, Mythic once the Calamity has fallen (0.22.55). Shops, recipes, chests, the mimic, vaults and bounty
//     charms stay under it; the one-per-realm cave and Sanctum charms carry their realm's rarity. New Game+ follows the same rule (the code
//     gives it no gear rules of its own); the Daily Trial is open. Not capped: gear already owned, personal relics, guild rank charms, the
//     Tamer's Stick, Echoforged gear.
//  6) A piece of one rarity at +0 beats the rarity below at +3 in its main stats: FORGE_STEP (items.js) is .11 (was .25), the top cape's RES
//     36 (was 34, config.js). Relics and Echoforged gear keep their numbers (econ11.js relicTemper, echo11.js ECHO11.top3).
const G16={undo:null,built:null,hint:null,hintBack:15000};

// ---------- 1) the hint card steps aside for an open window ----------
// A plain hint (p2world.js hintShow) is put away while any window is open and its 30 s clock stops; when the window closes it is back for
// G16.hintBack ms. A tip card (onboard.js, OB.cur) already sits inside the window and is left alone.
function g16HintDock(){try{
  const d=document.getElementById('p2hint');if(!d)return;
  const tip=typeof OB!=='undefined'&&OB.cur,hide=!tip&&!!V.modal&&d.classList.contains('show')&&!d.classList.contains('inl');
  if(hide&&!d.classList.contains('g16hide')){d.classList.add('g16hide');clearTimeout(P2.hintHide);G16.hint=P2.hint;}
  else if(!hide&&d.classList.contains('g16hide')){d.classList.remove('g16hide');const id=G16.hint;G16.hint=null;
    if(!tip&&id&&P2.hint===id&&d.classList.contains('show')){clearTimeout(P2.hintHide);P2.hintHide=setTimeout(()=>{if(P2.hint===id)ACT.hintOk();},G16.hintBack);hintPlace(d);}}}catch(e){}}
HOOK.after('render','gear16','a first realm hint steps aside while a window is open (it covered the Menu tabs on phones)',g16HintDock);
{const hs0=hintShow;hintShow=function(){const d=document.getElementById('p2hint');if(d)d.classList.remove('g16hide');const r=hs0.apply(this,arguments);g16HintDock();return r;};}

// ---------- 5) rarity by progress ----------
// 0.22.55 (the owner): Mythic, the top shop rarity, opens when the Calamity has fallen (G.won, and every New Game+ cycle after it). Until
// then the fifth realm sells and forges up to Heroic, and its chests have a better chance of a Mythic piece (CHEST_UP_LAST, config.js).
function rarMythic(){try{return !!(G&&(G.daily||G.won||(G.run&&G.run.cycle>0)));}catch(e){return true;}}
function rarCap(){try{if(!G||G.daily)return 5;const c=Math.max(1,Math.min(5,pcRealm()+1));return c>=5&&!rarMythic()?4:c;}catch(e){return 5;}}
// may this piece be handed out or sold now? (relics, bound gear, the Stick and Echoforged gear follow their own rules)
function rarOk(id){const g=gearOf(id);if(!g)return true;if(g.stick||g.relic||g.only||g.bound||g.medal)return true;const t=gTierIdx(g);return t>5||t<=rarCap();}
// a shop line piece (w_blade_3+1) brought down to the open rarity; anything else is returned as it is
function rarFit(id){const m=String(id).match(/^([wak]_[a-z]+_)(\d)(\+\d)?$/);if(!m)return id;const cap=rarCap();return +m[2]>cap?m[1]+cap+(m[3]||''):id;}
// loot of a family: the tier asked for, or the open rarity one temper level higher
function rarLoot(base,tier,plus){let t=Math.min(5,tier),p=plus||0;const cap=rarCap();if(t>cap){p=Math.min(3,p+(t-cap));t=cap;}return base+'_'+t+(p?'+'+p:'');}
const RAR_ALT=['c_swift','c_clarity'].concat(ELK.map(k=>'c_'+k));
function rarPool(list){const L=list.filter(rarOk);if(L.length)return L;const A=RAR_ALT.filter(id=>GEAR[id]&&rarOk(id));return A.length?A:['c_vital','c_mana'];}
function rarNote(){try{if(!G||G.daily)return '';const cap=rarCap();if(cap>=5)return '';
  return `<p class="note g16rar">Rarities open now: up to <b style="color:${ITEM_TIERS[cap].c}">${ITEM_TIERS[cap].pip} ${ITEM_TIERS[cap].n}</b>. ${ITEM_TIERS[cap+1].n} gear opens when the next Scourge falls.</p>`;}catch(e){return '';}}
{const ss0=shopStock;shopStock=function(tab){const r=ss0.apply(this,arguments);try{if(Array.isArray(r)&&G&&!G.daily)return r.filter(rarOk);}catch(e){}return r;};}
{const ro0=recipeOpen;recipeOpen=function(r){return ro0.apply(this,arguments)&&(!r||!r.id||rarOk(r.id));};}
{const fb0=shopFBar;shopFBar=function(ctx){const h=fb0.apply(this,arguments);return ctx==='items'?h:h+rarNote();};}
// the one-per-realm charms (side cave, Sanctum) carry the rarity their realm opens: Uncommon, Rare, then Epic
try{[typeof CAVE_CHARMS!=='undefined'?CAVE_CHARMS:{},typeof FORT_CHARMS!=='undefined'?FORT_CHARMS:{}].forEach(T=>Object.keys(T).forEach(s=>{const g=GEAR[T[s]];if(g)g.tier=Math.min(g.tier,(+s)+1);}));}catch(e){}

// ---------- 3) every stat a piece changes ----------
const G16_INT=[['mhp','HP'],['mmp','MP'],['atk','ATK'],['def','DEF'],['mag','MAG'],['res','RES'],['spd','SPD'],['healP','HEAL'],['luk','LUK']];
// additive shares (0.04 = 4 points); a third entry -1 marks one where less is better
const G16_PCT=[['crit','Crit'],['critDmg','Crit dmg'],['acc','Accuracy'],['eva','Evasion'],['healUp','Healing'],['spellPow','Spell dmg'],['rngPow','Ranged dmg'],['elDmg','Elemental dmg'],
  ['mpEff','MP saved'],['pierce','DEF ignored'],['cleave','Cleave dmg'],['heavy','Physical dmg'],['charge','Charge dmg'],['combo','Extra hit'],['basicStun','Stun on attack'],
  ['bossDmg','Boss dmg'],['primeDmg','Primed dmg'],['tauntDef','Taunt guard'],['fthRes','Ailment ward']];
// multipliers around 1
const G16_MUL=[['status','Ailment chance'],['stun','Stun chance'],['bleed','Bleed chance'],['tempo','Action time',-1]];
const G16_TURN=[['buffT','buff turn'],['debT','debuff turn']];
function g16Deltas(c,id){const g=gearOf(id),out=[];if(!g||!c||!c.S)return out;const A=c.S,B=statsWith(c,g.slot,id),num=v=>typeof v==='number'&&isFinite(v)?v:0;
  const sg=d=>d>0?'+':'−',add=(k,d,t,inv)=>out.push({k,d,t,up:inv?d<0:d>0});
  G16_INT.forEach(([k,n])=>{const d=num(B[k])-num(A[k]),r=Math.round(d);if(r)add(k,r,sg(r)+Math.abs(r)+' '+n);else if(Math.abs(d)>=.25)add(k,d,sg(d)+Math.abs(d).toFixed(1)+' '+n);});
  const pct=(k,d,n,inv)=>{if(Math.abs(d)<.0005)return;const p=Math.abs(d*100),s=p>=9.95||Math.abs(p-Math.round(p))<.05?String(Math.round(p)):p.toFixed(1);add(k,d,sg(d)+s+'% '+n,inv);};
  G16_PCT.forEach(([k,n,inv])=>pct(k,num(B[k])-num(A[k]),n,inv<0));
  G16_MUL.forEach(([k,n,inv])=>pct(k,(B[k]==null?1:num(B[k]))-(A[k]==null?1:num(A[k])),n,inv<0));
  [['elBoost','dmg'],['elRes','resist']].forEach(([m,w])=>{const a=A[m]||{},b=B[m]||{};ELK.forEach(el=>pct(m+'.'+el,num(b[el])-num(a[el]),EL[el]+' '+w));});
  G16_TURN.forEach(([k,n])=>{const d=Math.round(num(B[k])-num(A[k]));if(d)add(k,d,sg(d)+Math.abs(d)+' '+n+(Math.abs(d)>1?'s':''));});
  {const d=(B.immune?1:0)-(A.immune?1:0);if(d)add('immune',d,sg(d)+'Ailment guard');}
  return out;}
deltaHtml=function(c,id){const L=g16Deltas(c,id);return L.length?L.map(o=>`<b class="${o.up?'up':'dn'} g16d">${o.t}</b>`).join(' '):'<small>No change</small>';};
// a shop, forge or temper row nobody gains from: what it would change for the heroes who could wear it
{const bt0=bestTag;bestTag=function(id){let h=bt0.apply(this,arguments);try{if(!G||G.daily||gainersFor(id).length)return h;
  const L=fitsFor(id).slice(0,2).map(o=>({c:o.c,h:g16Deltas(o.c,id)})).filter(o=>o.h.length);if(!L.length)return h;/* fitsFor: the party heroes who can wear it, least bad first (cached per draw) */
  h+=`<div class="bestl g16vs"><b>Against what they wear:</b>${L.map(o=>`<div class="bestr">${port(o.c.id,'sm')}<b>${esc(o.c.name)}</b> <span>${o.h.map(x=>`<b class="${x.up?'up':'dn'} g16d">${x.t}</b>`).join(' ')}</span></div>`).join('')}</div>`;}catch(e){}return h;};}

// ---------- 2) Upgrade whole party: every round in one press ----------
// 0.22.46: the plan and the confirm are gear46.js (gp46Plan, gp46Run, ACT.p3Smith / p3SmithGo): one walk, re-asked before every step.
// Undo after several rounds: everyone back in what they wore; a piece that was tempered on the way comes back tempered; the rest is the pack
function g16UndoSnap(eq0){const pool={},put=id=>{if(id)pool[id]=(pool[id]||0)+1;};G.gear.forEach(put);Object.values(G.roster).forEach(c=>EQSL.forEach(sl=>put(c.eq[sl])));
  const take=id=>{if(pool[id]>0){pool[id]--;return id;}const b=baseIdOf(id);for(let k=plusOf(id)+1;k<=3;k++){const t=b+'+'+k;if(pool[t]>0){pool[t]--;return t;}}return null;};
  const eq={};Object.keys(eq0).forEach(cid=>{eq[cid]={};Object.keys(eq0[cid]).forEach(sl=>{eq[cid][sl]=eq0[cid][sl]?take(eq0[cid][sl]):null;});});
  const gear=[];Object.keys(pool).forEach(id=>{for(let i=0;i<pool[id];i++)gear.push(id);});const s=snapAuto();s.gear=gear;s.eq=eq;return s;}

// ---------- 4) Equip Best right after Build party closes the Menu ----------
// 0.21.7 (owner): Equip Best shows its result page (with Undo) again and Build party (Apply) keeps its own page. Only Equip Best pressed right
// after a party was built in this same Menu visit (no window closed, no gear or party change in between: G16.built is the g16Sig() of that
// moment) closes the Menu with a toast. Every Equip Best pressed from the Menu keeps "Undo Equip Best" on Backpack > Equipment.
function g16Sig(){try{return G.party.join(',')+'|'+G.gear.slice().sort().join(',')+'|'+Object.values(G.roster).map(c=>c.id+':'+EQSL.map(sl=>c.eq[sl]||'').join('/')).join(',');}catch(e){return '';}}
function g16MenuUp(m){for(let i=0;m&&i<8;i++,m=m.from)if(m.type==='menu')return true;return false;}
{const ae0=ACT.autoEqParty;ACT.autoEqParty=function(){const m0=V.modal,inMenu=g16MenuUp(m0),fresh=inMenu&&!!G16.built&&G16.built===g16Sig();G16.built=null;const r=ae0.apply(this,arguments);
  try{const m=V.modal;if(inMenu&&m&&m.type==='autoEq'){const rows=m.rows||[],n=rows.length;G16.undo=n?{snap:m.snap,sig:g16Sig()}:null;
    if(fresh){const a=rows.reduce((s,x)=>s+x.pw0,0),b=rows.reduce((s,x)=>s+x.pw1,0),pct=a>0?Math.round((b-a)/a*100):0;V.modal=null;render();
      toast(n?`Equip Best: ${n} hero${n>1?'es':''} changed gear${pct>0?' (+'+pct+'% power)':''}. Undo is in Backpack > Equipment.`:'Equip Best: your new party already wears the best gear you own.');}}}catch(e){}
  return r;};}
{const ba0=ACT.bpApply;ACT.bpApply=function(){const m0=V.modal,inMenu=!!(m0&&m0.type==='bp'&&g16MenuUp(m0.from));const r=ba0.apply(this,arguments);
  try{const m=V.modal;G16.built=inMenu&&m&&m.type==='ldRes'?g16Sig():null;}catch(e){}
  return r;};}
HOOK.after('render','gear16','a party built in the Menu is "just built" only until every window is closed',function(){if(G16.built&&!V.modal)G16.built=null;});
ACT.g16Undo=function(){const u=G16.undo;G16.undo=null;if(!u||!G||u.sig!==g16Sig()){toast('The gear has changed since: nothing to undo.');render();return;}undoAuto(u.snap);sfx('equip');toast('Equip Best undone.');render();};
{const ve0=vEquipTab;vEquipTab=function(){let h=ve0.apply(this,arguments);try{if(G16.undo&&typeof h==='string'){if(G16.undo.sig!==g16Sig())G16.undo=null;
  else h=h.replace(/(<button class="btn gold" data-act="autoEqParty"[^>]*>Equip Best<\/button>)/,'$1<button class="btn" data-act="g16Undo" title="Puts back the gear everyone wore before the last Equip Best">Undo Equip Best</button>');}}catch(e){}return h;};}

try{const st=document.createElement('style');st.textContent=`.g16d{display:inline-block;max-width:100%;white-space:normal;font-weight:600}.g16vs{opacity:.92}.g16vs>b{color:inherit}.g16rar{margin:4px 0 6px}#p2hint.g16hide{display:none!important}.bestr>span,.cmpr>span{min-width:0;overflow-wrap:anywhere}`;document.head.appendChild(st);}catch(e){}
window.__G16={G16,rarCap,rarOk,rarFit,rarLoot,rarPool,deltas:(c,id)=>g16Deltas(c,id),recipeOpen:r=>recipeOpen(r),hintDock:g16HintDock,FORGE_STEP};
