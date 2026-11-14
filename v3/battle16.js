// ===== battle16.js (battle pass 16): the owner's playtest notes after 0.21.0 on battle, the action key, summons and recruitment =====
// 1) "remove battle menu memory, just start at main action menu when turn starts": every hero turn opens on the main actions (Attack, Skills, Items,
//    Guard...). menus12.js kept a remembered submenu, skill, item and scroll per hero; that memory is cleared at the start of every turn here (the
//    hook is registered after menus12's, so it runs first), and the command list starts at its top. Inside one turn nothing changes: Back still
//    returns to the list you came from.
// 2) "should be able to press space on PC to continue after a battle, also add option to make multiple keys the action button (spacebar)": the action
//    key (keymap.js 'interact': Z, Enter and Space by default) continues every prompt that has one way on: the rewards screen, "The party falls", story
//    cards, campfire talks, and any popup whose only control (beside the corner close button) is one button (b16Next). One press, one step: a held key does not repeat, the press never reaches the
//    world under the popup, never presses a button that only happens to hold the focus behind the popup, and Space does not scroll the page
//    (b16Key, b16Eat). Several keys per action: Settings > Controls > Keys has Add key and a key chip removes a key (keymap.js kmAdd, kmDrop).
// 3) "summon button not working for some pets": the pets that failed are the Lesser Scourges of the five bosses removed in 0.20.9 (The Locust Choir,
//    Ironmaw Tortoise, The Hollow Shepherd, The Pale Weaver, the Hollow Sun: realms14.js R14_GONE). The save migration there moved the journey's
//    bosses but not G.tamed, so such a pet had no monster data: the Summon button showed, the press threw inside summonComp (no template for the
//    pet) AFTER marking the once per battle summon as used, and nothing came. Fix: b16PetFix (on load) moves such a pet to the boss that replaced
//    its Scourge in that journey (r14Plan: same elements first), with its name, class and nature following; a pet whose monster is unknown for any
//    other reason gets a stand-in record so no menu breaks, and offers no Summon button (canSummon needs the monster's data and the pet's template).
// 4) "nerf Nick, boss summons are bit too strong, tune down slight bit, also Nick or Priest should be the only ones that can summon recruited bosses":
//    Nick is Nikaris (the Beastwarden, the only Druid; no wayfarer is called Nick). Recruited bosses are the Sanctum guardians (summon8.js) and the
//    Lesser Scourges tamed with Nikaris (comp.js, o.scourge).
//    - who: only Nikaris or a Priest (the healer class) may Invoke a guardian or Summon a Lesser Scourge (b16Caller). Nikaris gains Invoke; the Monk's
//      Spirit Call is gone; any other hero paired with a Lesser Scourge keeps the pairing bonus but not the Summon command. Where the command used
//      to be, a greyed Summon button says "Nikaris or a Priest only" (and the Pets list says it on a Lesser Scourge).
//    - tune: guardians hit 12% softer and have 12% less HP (summon8.js SUM.powM .95 to .835, SUM.hpK 1.2 to 1.055; still 5 turns).
//    - "Scourges should remain big and replace all 3 party members when used as summons": a summoned Lesser Scourge takes the whole Vanguard's place at
//      boss size, like a guardian, a further 12% under the guardian's numbers (B16.boss) for 4 turns; see b16BossFire. Ordinary pets are untouched.
//    - Nikaris: 6% less ATK and MAG (B16.nik; his arrows, beasts and Wild Mend all scale from them).
// 6) "no dual type wayfarers appear for recruitment until reaching the 3rd realm, 2nd realm is ok for some dual type enemies to start appearing":
//    config.js DUAL_HERO_FROM=2 is the first stage for dual type wayfarers (p2world.js p2DualOK: tavern, challenge board, rare visitors, chance
//    meetings); here the cave and keep cells and the guild's sent recruit follow it too, and the dual type legends (Kaevan, Jaeson) wait for it.
//    The starter pool draws single types only (roster14.js ro14Pool). Foes are as they were: realm 1 single (DUAL_FROM=1), dual from realm 2.
//    The gift of the second realm's Scourge (Sylva, a dual type) still joins when that Scourge falls, which is the moment the third realm opens.
// (5, the learn levels, is in menus14.js.) Numbers: B16. Test: tools/chrome/v189a.js.
const B16={boss:{pw:.88,hp:.88},nik:{atk:.94,mag:.94},note:'Only Nikaris or a Priest can summon a recruited boss.',short:'Nikaris or a Priest only',
  cont:{result:'resultOk',lose:'loseOk',story:'storyOk',talk:'talkNext'},eat:null,turn:null};

// ---------- 1. no battle menu memory ----------
HOOK.before('renderBattle','battle16','no battle menu memory: a turn opens on the main actions (runs before menus12, which would put a submenu back)',function(stageOnly){try{if(stageOnly)return;
  const a=B&&B.cur;if(!B||B.mode!=='cmd'||!a||a.side==='e'||B.over)return;const key=(B.id||0)+':'+a.id+'#'+(B.pturns||0);if(B.b16key===key)return;B.b16key=key;B16.turn=key;
  // (the engine itself opens every turn on B.menu 'root'; only the memory that would move it has to go)
  if(typeof m12Mem==='function'){const mm=m12Mem(a);mm.menu='root';mm.sk=null;mm.item=null;mm.sc={};}}catch(e){}});
HOOK.after('renderBattle','battle16','a new turn starts at the top of the command list',function(r,stageOnly){try{if(stageOnly||!B16.turn)return;B16.turn=null;
  if(B&&B.menu==='root'){const el=typeof m12Scroller==='function'?m12Scroller():null;if(el&&el.scrollTop>0)el.scrollTop=0;}}catch(e){}});

// ---------- 2. the action key continues ----------
// the one button that moves a prompt on, or null: the known "continue" prompts by their action, else a popup with a single control
function b16Next(){try{const m=V.modal;if(!m)return null;const root=document.getElementById('modal');if(!root)return null;
  const act=B16.cont[m.type];if(act){const b=root.querySelector(`button[data-act="${act}"]:not([disabled])`);if(b)return b;}
  // (the corner close button every popup has, .mnav, is not a choice)
  const all=[...root.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(e=>!e.disabled&&e.offsetParent!==null&&!e.closest('.mnav'));
  return all.length===1&&all[0].tagName==='BUTTON'&&all[0].closest('.btnrow')&&all[0].dataset.act&&ACT[all[0].dataset.act]?all[0]:null;}catch(e){return null;}}
// the key that was handled: its keyup (where a browser may still "click" a focused button) is swallowed, once
function b16Eat(k){B16.eat={k:kmNorm(k),t:Date.now()};}
function b16Ctl(e){return !!(e&&e.tagName&&/^(BUTTON|A|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(e.tagName));}
function b16Key(e){try{
  if(e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||KM.wait||!kmIs(e,'interact'))return;
  const k=kmNorm(e.key),t=e.target,root=document.getElementById('modal'),ae=document.activeElement;
  if(t&&t.tagName&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
  if(V.modal&&root){
    // a control inside the popup holds the focus: Space and Enter press it, as always
    const inside=ae&&ae!==document.body&&root.contains(ae)&&b16Ctl(ae);
    if(inside&&(k===' '||k==='Enter'))return;
    const b=e.repeat?null:b16Next();
    // a press with the popup open never reaches the world under it, never presses a button behind it and never scrolls the page
    e.preventDefault();e.stopImmediatePropagation();b16Eat(k);
    if(b&&!(B16.last&&Date.now()-B16.last<120)){B16.last=Date.now();const f=ACT[b.dataset.act];if(f)f(b.dataset.arg,b);}
    return;}
  // no popup, in battle: Space must not scroll the page (a focused command button still takes it)
  if(V.screen==='battle'&&k===' '&&!(ae&&ae!==document.body&&b16Ctl(ae)))e.preventDefault();
}catch(x){}}
window.addEventListener('keydown',b16Key);
window.addEventListener('keyup',e=>{try{const E=B16.eat;if(E&&kmNorm(e.key)===E.k){B16.eat=null;e.preventDefault();}}catch(x){}},true);
// a keyboard "click" (detail 0) that still arrives while the handled key is down is dropped
document.addEventListener('click',e=>{try{const E=B16.eat;if(E&&e.detail===0&&e.isTrusted&&Date.now()-E.t<1500){e.stopPropagation();e.preventDefault();}}catch(x){}},true);
window.addEventListener('blur',()=>{B16.eat=null;});

// ---------- 3. pets whose monster is gone ----------
const b16Def=mon=>MON[mon]||guardianDef(mon);
// on load: a pet of a removed Scourge follows the boss that replaced it in this journey; returns how many moved
function b16PetFix(g){let n=0;try{if(!g||!Array.isArray(g.tamed))return 0;let plan=null;
  g.tamed.forEach(o=>{if(!o||b16Def(o.mon))return;if(typeof R14_GONE==='undefined'||!R14_GONE[o.mon])return;
    plan=plan||r14Plan(g);const nk=plan[o.mon],d=nk&&b16Def(nk);if(!d)return;
    o.mon0=o.mon;o.mon=nk;o.cls=tameClass(d);o.trait=tameTrait(d);
    if(/^Lesser /.test(o.name||'')||!o.name){let nm='Lesser '+d.n;const used=new Set(g.tamed.filter(x=>x&&x!==o).map(x=>x.name));for(let k=2;used.has(nm)&&k<20;k++)nm='Lesser '+d.n+' '+['','','II','III','IV','V','VI','VII','VIII','IX'][k<10?k:9]+(k>=10?k:'');o.name=nm;}
    registerTamed(o);n++;});
  if(n)Object.keys(g.roster||{}).forEach(id=>{const c=g.roster[id];try{if(c&&g.tamed.some(o=>o.with===id&&o.mon0)){c.S=calcStats(c);c.hp=Math.min(c.hp,c.S.mhp);c.mp=Math.min(c.mp,c.S.mmp);}}catch(e){}});
  }catch(e){console.error('battle16 pets',e);}return n;}
HOOK.after('unpackG','battle16','old saves: the pet of a removed Scourge follows the boss that replaced it',function(r){b16PetFix(r);});
// a pet with no monster data at all: a stand-in record, so the Pets list, the hero sheet and the bonus line still draw
{const cd0=compDef;compDef=function(o){const d=cd0.apply(this,arguments);if(d||!o)return d;const any=MON[Object.keys(MON)[0]];
  return {n:'Lost companion',el:['earth'],art:any&&any.art,sk:[],hp:1,atk:1,def:1,mag:1,res:1,spd:1,lost:1};};}
// the Summon button is only offered when the press can work: the monster's data and the pet's template are there
{const cs0=canSummon;canSummon=function(a){if(!cs0.apply(this,arguments))return false;
  try{const o=compOf(a);if(!b16Def(o.mon))return false;if(!TPL[o.id])registerTamed(o);if(!TPL[o.id])return false;
    if(o.scourge&&!b16Caller(a))return false;}catch(e){return false;}return true;};}

// ---------- 4. recruited bosses: who may call them, and how hard they hit ----------
function b16Caller(a){try{const t=a&&TPL[a.id];return !!t&&!t.mon&&(a.id==='nikaris'||t.cls==='healer');}catch(e){return false;}}
// Invoke: the Priest as before, Nikaris like a Priest, nobody else (the Monk's lesser Spirit Call is gone)
{const sc0=sumClassOf;sumClassOf=function(a){try{if(a&&a.id==='nikaris'&&B&&a.side==='p'&&!a.isComp&&!a.isSum)return 'priest';}catch(e){}
  const k=sc0.apply(this,arguments);return k==='monk'?null:k;};}
// the hero who used to have the command: why it is gone (null when nothing is withheld)
function b16Blocked(a){try{if(!a||!B||!G||G.daily||a.side!=='p'||a.isComp||a.isSum||b16Caller(a))return null;const t=TPL[a.id];if(!t||t.mon)return null;
  const o=compOf(a);if(o&&o.scourge&&b16Def(o.mon)&&!(B.summoned||{})[a.id])return `${o.name} is a recruited boss. ${B16.note}`;
  if(t.cls==='monk'&&a.lv>=SUM.monkLv&&sumList().length&&!B.sum&&!B.sumDead)return `The Sanctum guardians are recruited bosses. ${B16.note}`;}catch(e){}return null;}
HOOK.xform('cmdHtml','battle16','recruited bosses: a note where the Summon command was for anyone but Nikaris or a Priest',function(h){try{const a=B&&B.cur;
  if(!a||B.mode!=='cmd'||B.menu!=='root'||B.swapAsk||typeof h!=='string')return h;const why=b16Blocked(a);if(!why)return h;
  if(h.includes('class="mi summon b9sum"'))return h.replace(/(<button class="mi summon b9sum"[^>]*title=")/,'$1'+esc(why)+' ');
  return h.replace('<div class="menu sec">',`<div class="menu sec"><button class="mi summon b9sum b16no" disabled aria-disabled="true" title="${esc(why)}">Summon <small>${B16.short}</small></button>`);}catch(e){return h;}});
{const bt0=compBonusText;compBonusText=function(o){const h=bt0.apply(this,arguments);try{if(o&&o.scourge)return h+`</small><small class="b16note">A recruited boss: ${B16.note} Anyone it is paired with still gets its bonus.`;}catch(e){}return h;};}
HOOK.after('calcStats','battle16','Nikaris: a little less ATK and MAG',function(S,c){try{if(S&&c&&c.id==='nikaris'&&!(G&&G.daily)){S.atk*=B16.nik.atk;S.mag*=B16.nik.mag;}}catch(e){}});
// A summoned Lesser Scourge is a boss on your side (the owner: "Scourges should remain big and replace all 3 party members when used as summons"). It
// takes the field the way an Invoked guardian does (summon8.js B.sum): B.front becomes [the Scourge], the Vanguard steps out with HP, MP and statuses
// untouched (out of B.front they are not targeted, do not act and nothing ticks on them), and comes back when its turns are over, when it is driven
// off, or when the fight ends (sumEnd, summon8's win and finishBattle hooks). It is drawn like a foe boss (battle11.js sizes u.isSum by its art,
// kits12.js stands it on the mirrored boss slot, clamped inside the stage); u.b16big marks it as boss sized for the Unified look (ch15Sc below).
// Turn order: it acts at once in the summoner's place (as a pet did) and then on its own speed; the returning heroes re-enter just after the current
// time, staggered. Wipe check: while it stands the party is not wiped (checkEnd counts B.front and B.back); when it falls it is driven off and the
// Vanguard is back in B.front before any check, so the fight goes on with the heroes as they were.
// Numbers: the guardian formula a little lower: the party's level (no +2), power SUM.powM x B16.boss.pw, HP = the Vanguard's max HP x SUM.hpK x
// B16.boss.hp, COMP_TURNS+1 = 4 turns (a guardian: 5). Its skills are the Scourge's own (with the second skill a grown pet has).
function b16BossMake(o){const d=compDef(o),heroes=B.front.filter(c=>c.hp>0&&!c.isComp&&!c.isSum),lv=Math.max(1,Math.round(heroes.reduce((q,c)=>q+c.lv,0)/Math.max(1,heroes.length)));
  const u=makeEnemy(d,lv,{elite:true,name:o.name,noField:1,noBuff:1,hpM:1,powM:SUM.powM*B16.boss.pw});
  u.side='p';u.isSum=1;u.b16big=1;u.b16pet=o.id;u.id='sum_'+o.id;u.base=o.name;u.name=o.name;u.lb=0;u.owner=null;u.lesser=false;u.phase=null;u.multi=1;u.turnsLeft=COMP_TURNS+1;
  const pool=B.front.reduce((q,c)=>q+(c.S&&!c.isComp&&!c.isSum?c.S.mhp:0),0);u.S.mhp=Math.max(1,Math.round(pool*SUM.hpK*B16.boss.hp));u.hp=u.S.mhp;u.S.mmp=999;u.mp=999;
  TPL[u.id]={id:u.id,n:o.name,cls:'warrior',el:d.el.slice(),trait:'brave',bio:`${o.name}, a lesser Scourge that follows you.`,src:'sum',look:null,mon:o.mon,art:d.art,summon:1};
  u.msk=(d.sk||[]).map(s=>({id:'s'+s[0],n:s[0],el:s[1],pw:+(s[2]*1.05).toFixed(2),t:s[3]==='all'?'all':s[3]==='self'?'self':'one',k:s[4]==='buff'?'buff':s[4],fx:s[5]||null,mp:0,cost:1,hits:1}));
  return u;}
function b16BossFire(a,o){const u=b16BossMake(o),col=ELC[(u.el||[])[0]]||'#ffd04a';
  B.summoned=B.summoned||{};B.summoned[a.id]=1;B.sum={u,front:B.front,by:a,b16:1};B.front=[u];u.next=B.time;u.enterT=Date.now();u.k12In=Date.now();u.k12Col=col;a.actT=Date.now();
  banner(`SCOURGE: ${o.name}`,col);log(`${a.name} calls ${o.name}! It takes the field for ${u.turnsLeft} turns while the Vanguard steps back.`);autoNote(a,'Summon '+o.name);
  try{if(typeof sfx==='function')sfx('level');}catch(e){}
  B.menu='root';B.pend=null;render();later(advance,PAUSE*.5);return u;}
{const sc0=summonComp;summonComp=function(){try{const a=B&&B.cur,o=a&&compOf(a);
    if(o&&o.scourge&&b16Def(o.mon)){if(!canSummon(a)||B.sum||B.pray)return;b16BossFire(a,o);return;}}catch(e){console.error('battle16 summon',e);}
  return sc0.apply(this,arguments);};}
// the name plate over its head (kits12.js) says SCOURGE
HOOK.after('renderBattle','battle16','the name plate of a summoned Scourge says SCOURGE',function(){try{if(!B||!B.sum||!B.sum.b16||V.screen!=='battle')return;
  document.querySelectorAll('.k12plate>b').forEach(b=>{if(b.textContent==='GUARDIAN')b.textContent='SCOURGE';});}catch(e){}});
// leaving: the guardian's own exit with the pet's words (and a driven off pet does not close the Sanctum summons for the fight)
{const se0=sumEnd;sumEnd=function(why){const S=B&&B.sum;if(!S||!S.b16)return se0.apply(this,arguments);const u=S.u;
  B.front=S.front;B.front.forEach((c,i)=>{c.hidden=0;c.next=B.time+delayOf(c,.3+.15*i);c.enterT=Date.now();});B.sum=null;
  log(why==='ko'?`${u.name} is driven off. The Vanguard steps back in.`:`${u.name} returns to your side. The Vanguard steps back in.`);};}
// while a Scourge or a guardian stands, or a prayer is pending, no second pet is called into a Vanguard that is about to be swapped out
{const cs1=canSummon;canSummon=function(a){if(B&&(B.sum||B.pray))return false;return cs1.apply(this,arguments);};}
// the Unified look (cohere15.js ch15Sc) scales heroes and bosses: a summoned Scourge counts as a boss
try{if(typeof ch15Sc==='function'){const cs0=ch15Sc;ch15Sc=function(u){try{if(u&&u.b16big)return ch15On()&&B?CH15.unit:1;}catch(e){}return cs0.apply(this,arguments);};}}catch(e){}

// ---------- 6. dual type wayfarers from the third realm ----------
HOOK.xform('caveRecruitPool','battle16','no dual type wayfarer in a cave, a keep cell or sent by a guild before the third realm',function(pool){try{
  if(!Array.isArray(pool)||!G||G.daily||p2DualOK())return pool;return pool.filter(h=>!p2Dual(h));}catch(e){return pool;}});
// a table seated before this rule (an older save in realm 1 or 2) or won in a duel: a dual type leaves the seat empty until the third realm
{const ts0=tvSlots;tvSlots=function(){const sl=ts0.apply(this,arguments);try{if(Array.isArray(sl)&&G&&!G.daily&&!p2DualOK()){for(let i=0;i<sl.length;i++)if(sl[i]&&p2Dual(sl[i]))sl[i]=null;}}catch(e){}return sl;};}
// the dual type legends keep their own conditions and also wait for the third realm
try{Object.keys(LEG_Q).forEach(id=>{if(!p2Dual(id))return;const ok0=LEG_Q[id].ok;LEG_Q[id].ok=s=>s>=DUAL_HERO_FROM&&ok0(s);});}catch(e){}

try{const st=document.createElement('style');st.textContent=`.battle .mi.b16no{opacity:.55;cursor:not-allowed}.b16note{display:block;opacity:.85}
.kmk.kmx{cursor:pointer;background:none;color:inherit}.kmk.kmx:hover,.kmk.kmx:focus-visible{background:rgba(255,208,74,.18)}.kmk.kmx span{opacity:.7;margin-left:2px}`;document.head.appendChild(st);}catch(e){}
try{window.__B16={B16,next:b16Next,petFix:b16PetFix,caller:b16Caller,blocked:b16Blocked,def:b16Def,bossMake:b16BossMake,get canSummon(){return canSummon;},get sumClassOf(){return sumClassOf;},get sumCan(){return sumCan;},get compDef(){return compDef;}};}catch(e){}
