// ===== dmg11.js (v0.17): weapon-driven damage kinds and the per-class kind limit =====
// The owner's brief: no character should answer every damage type, and the weapon in hand should change what a physical skill does.
//  1) A physical skill (and the basic Attack, bond techs and Limit Breaks) with no FIXED kind deals the kind of the equipped weapon family
//     (WT_KIND in items.js: blade/axe/greatsword/shortsword/dagger/claws slash; mace/hammer/staff/quarterstaff/knuckles/beads/wand/censer/tome
//     blunt; lance/standard piercing; bow/longbow/crossbow/thrown and the bard's instruments ranged).
//  2) A skill keeps a fixed kind when it has a `dl`, or is listed in DL_FORCE (skills.js): a dedicated "Piercing Shot" pierces with any bow.
//  3) CLS_KINDS (items.js) is the most a class may reach: two physical kinds (casters one, plus magic). A weapon outside the class's list is
//     re-kinded by CLS_KIND_ALT (a knight's couched lance hits Blunt, a thief's thrown stars Pierce), so the limit holds for any gear.
//  4) Display: the skill list says "Blunt with your mace" under the skill, the sheet's chip tooltip says it, and a foe's Weak tooltip adds
//     which of your heroes answer each kind. tools/dmgaudit.js prints the class x kind matrix; tools/chrome/v155a.js checks the limit.
Object.assign(WT_DL,WT_KIND);
Object.assign(DL_HINT,{blunt:'maces, hammers, fists and staves',piercing:'lances, thrown knives and armor piercing shots',ranged:'bows, bolts and music on the wind'});
// chart: piercing had one use (flyers x1.1), so only Archer, Thief and Sniper reached something nobody needed. Lances and bolts now bring flyers down.
try{ARCH.flying.dl.piercing=1.25;ARCH.flying.d='Ranged shots and piercing lances catch it. Slashes and blows glance off, and earth magic barely reaches it.';ARCH_LINE.armored='Armored: blunt blows and magic crack it, other hits glance off';ARCH_LINE.flying='Flying: ranged and piercing hits catch it';}catch(e){}
const D11={note:true};
const d11Cls=a=>{const t=a&&a.id&&TPL[a.id];return t&&!t.mon&&CLS_KINDS[t.cls]?t.cls:null;};
// the kind a weapon family deals in a class's hands (no weapon: the first kind of the class)
function d11Kind(cls,fam){const L=CLS_KINDS[cls];if(!L)return null;const n=fam&&WT_KIND[fam];if(!n)return L[0];if(L.includes(n))return n;return (CLS_KIND_ALT[cls]||{})[fam]||L[0];}
function d11Forced(cls,s){if(!s)return null;if(s.dl)return s.dl;const f=DL_FORCE[cls];return (f&&f[s.id])||null;}
{const d0=dlFor;dlFor=function(cls,s){if(!s||!CLS_KINDS[cls])return d0.apply(this,arguments);if(s.dl)return s.dl;if(s.k==='mag')return 'magic';if(s.k==='heal'||s.k==='revive')return 'heal';if(s.k!=='phys')return null;return d11Forced(cls,s);};}
{const d0=deliveryOf;deliveryOf=function(a,sk){const cls=d11Cls(a);if(!sk||!cls||a.side==='e')return d0.apply(this,arguments);
  if(sk.dl)return sk.dl;if(sk.k==='mag')return 'magic';if(sk.k==='heal'||sk.k==='revive')return 'heal';if(sk.k!=='phys')return null;
  return d11Forced(cls,sk)||d11Kind(cls,a.S&&a.S.wp);};}
const d11Cap=k=>DL_NAME[k]||k;
// what a skill says about its kind for this hero: {k, fixed, fam}
function d11Info(a,s){const cls=d11Cls(a);if(!cls||!s||s.k!=='phys')return null;const f=d11Forced(cls,s),fam=a.S&&a.S.wp||null;return {k:f||d11Kind(cls,fam),fixed:!!f,fam};}
const d11Wname=f=>(WT_NAME[f]||f||'').toLowerCase();
function d11Tip(i){if(!i)return '';if(i.fixed)return `${d11Cap(i.k)}: this skill always deals ${d11Cap(i.k).toLowerCase()} damage.`;return i.fam?`${d11Cap(i.k)} with your ${d11Wname(i.fam)}`:`${d11Cap(i.k)} (no weapon)`;}
// the skill list: one small line under the description
{const pn0=perkNote;perkNote=function(u,s){let h=pn0.apply(this,arguments);try{const i=d11Info(u,s);if(i&&D11.note)h+=`<small class="dk11 ${i.k}" title="${esc(d11Tip(i))}">${i.fixed?`Always ${esc(d11Cap(i.k))}`:esc(d11Tip(i))}</small>`;}catch(e){}return h;};}
// the chip on skill rows: in battle the kind of the acting hero, in town the kinds the class can reach with that skill
{const dc0=dlChip;dlChip=function(s,cls){try{if(s&&s.k==='phys'&&cls&&CLS_KINDS[cls]){const u=B&&B.mode==='cmd'&&B.cur&&B.cur.id&&TPL[B.cur.id]&&TPL[B.cur.id].cls===cls?B.cur:null,f=d11Forced(cls,s);
  const ks=f?[f]:u?[d11Info(u,s).k]:CLS_KINDS[cls].slice(),tip=f?`${d11Cap(f)}: this skill always deals ${d11Cap(f).toLowerCase()} damage.`:u?d11Tip(d11Info(u,s)):`Follows your weapon: ${ks.map(d11Cap).join(' or ')}.`;
  return `<em class="dl ${ks[0]} sym" title="${esc(tip)}" aria-label="${esc(ks.map(d11Cap).join(' or '))}">${ks.map(k=>dlIco(k)).join('')}</em>`;}}catch(e){}return dc0.apply(this,arguments);};}
// kinds a roster hero can deal right now (known skills and the basic Attack with the weapon in hand), for Best Party and the foe tooltips
function d11Kinds(c){const K=new Set();try{const t=TPL[c.id],g=c.eq&&c.eq.w&&canEquip(c,c.eq.w)?gearOf(c.eq.w):null,u={id:c.id,side:'p',S:{wp:g&&g.fam||null}};
  let L;try{L=known(c);}catch(e){L=classSkills(t).filter(s=>skillKnown(c,s));}
  L.forEach(s=>{if(s.k==='phys'||s.k==='mag'){const d=deliveryOf(u,s);if(d)K.add(d);}if(s.k==='heal'||s.k==='revive')K.add('heal');});
  const at=deliveryOf(u,atkFor(u));if(at)K.add(at);}catch(e){}return K;}
{const pk0=p3Kit;p3Kit=function(c){const k=pk0.apply(this,arguments);try{if(k&&!k._d11&&c&&TPL[c.id]&&d11Cls(c)){k._d11=1;const K=d11Kinds(c);K.forEach(d=>k.dl.add(d));
  [...k.dl].forEach(d=>{if(d!=='heal'&&!K.has(d))k.dl.delete(d);});}}catch(e){}return k;};}
// foe Weak tooltips: which of your living heroes answer each kind
let D11A={key:'',m:null};
function d11Answers(){if(!B||!B.front)return {};const key=(B.id||0)+'|'+B.front.map(c=>c.id+(c.hp>0?1:0)+(c.S&&c.S.wp||'')+':'+c.lv).join();if(D11A.key===key&&D11A.m)return D11A.m;
  const m={};B.front.forEach(u=>{if(u.hp<=0)return;const c=G&&G.roster[u.id];if(!c)return;d11Kinds(c).forEach(d=>{if(d!=='heal')(m[d]=m[d]||[]).push(u.name);});});D11A={key,m};return m;}
{const fw0=foeWeak;foeWeak=function(e){const h=fw0.apply(this,arguments);try{if(!h||!B)return h;const M=d11Answers();
  return String(h).replace(/title="Weak to ([^".]*)(\.[^"]*)?"/g,(m0,list,rest)=>{const ans=list.split(', ').map(n=>{const k=Object.keys(DL_NAME).find(x=>DL_NAME[x]===n);return k&&k!=='heal'?`${n}: ${(M[k]||['nobody']).join(', ')}`:null;}).filter(Boolean);
    return `title="Weak to ${list}${rest||'.'}${ans.length?' Your answers: '+ans.join('; ')+'.':''}"`;});}catch(x){return h;}};}
try{const st=document.createElement('style');st.textContent='.dk11{display:block;opacity:.8;font-size:.82em;margin-top:1px}.dk11.slash{color:#e8b6a0}.dk11.blunt{color:#e6cf8f}.dk11.piercing{color:#b9d6ee}.dk11.ranged{color:#b9e0b0}';document.head.appendChild(st);}catch(e){}
// tests (our own object; window.__A is left alone)
try{window.__D11={get CLS_KINDS(){return CLS_KINDS;},get WT_KIND(){return WT_KIND;},get CLS_KIND_ALT(){return CLS_KIND_ALT;},get DL_FORCE(){return DL_FORCE;},get CLS_WPN(){return CLS_WPN;},get TPL(){return TPL;},get ATTACK(){return ATTACK;},
  deliveryOf:(a,s)=>deliveryOf(a,s),classSkills:t=>classSkills(t),known:c=>known(c),limitSkill:c=>limitSkill(c),atkFor:a=>atkFor(a),heroRoles:c=>heroRoles(c),newChar:(i,l,t)=>newChar(i,l,t),kinds:c=>d11Kinds(c),answers:()=>d11Answers(),foeWeak:e=>foeWeak(e),get G(){return G;}};}catch(e){}
