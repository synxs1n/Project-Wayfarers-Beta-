// ===== archetype.js (v0.4.0): foe archetypes, delivery tags, Undead and healing =====
// Rock paper scissors, FFX style. Every foe can carry archetype tags (ARCH). Every damaging skill has a delivery
// (Slash, Blunt, Piercing, Ranged, Magic) and healing skills deliver Heal. archMult() turns the pair into a damage multiplier.
// Everything tunable lives in the tables right below.

const DL_NAME={slash:'Slash',blunt:'Blunt',piercing:'Piercing',ranged:'Ranged',magic:'Magic',heal:'Heal'};
const DL_HINT={slash:'cutting blades and claws',blunt:'maces, fists and staves',piercing:'lances, daggers and armor piercing shots',ranged:'bows, bolts and thrown weapons',magic:'spells',heal:'healing magic'};

// Multipliers per archetype. dl: by delivery. el: by skill element. area: skills that hit every foe. single: skills that hit one foe.
const ARCH={
  flying:{n:'Flying',d:'Ranged shots and piercing lances catch it. Slashes and blows glance off, and earth magic barely reaches it.',dl:{ranged:1.4,piercing:1.1,slash:.85,blunt:.8},el:{earth:.85}},
  armored:{n:'Armored',d:'Piercing attacks and magic cut through. Slashing, blunt and ranged hits barely scratch it.',dl:{piercing:1.25,magic:1.1,slash:.55,blunt:.85,ranged:.6}},
  jelly:{n:'Jelly',d:'Weapons sink in and do little. Magic wrecks it, and so do fire, ice and lightning.',dl:{slash:.5,blunt:.55,piercing:.6,ranged:.6,magic:1.3},el:{fire:1.15,ice:1.15,lightning:1.15}},
  undead:{n:'Undead',d:'Blunt blows shatter it. Piercing and ranged hits slip through the bones, magic is dulled, and healing magic burns it. Weak to Light.',dl:{blunt:1.2,piercing:.8,ranged:.85,magic:.9},el:{shadow:.8}},
  swarm:{n:'Swarm',d:'A crowd of small things. Area attacks and wide slashes shred it; single target hits waste their effort.',dl:{slash:1.15,ranged:1.1},area:1.35,single:.8},
  beast:{n:'Beast',d:'Blunt blows batter it. Piercing and ranged attacks are turned aside by hide and speed.',dl:{blunt:1.25,piercing:.85,ranged:.85}},
  plant:{n:'Plant',d:'Slashing cuts it down, ranged shots pin it and fire burns it. Blunt blows and water do little.',dl:{slash:1.25,ranged:1.1,blunt:.85},el:{fire:1.25,water:.85}}
};
const ARCH_KEYS=Object.keys(ARCH);
// UNDEAD_LIGHT: in config.js
// HEAL_HURT: in config.js
// HEAL_HURT_AOE: in config.js
// HEAL_HURT_PW_CAP: in config.js
// ARCH_BOSS_CLAMP: in config.js
// ARCH_FOE_CLAMP: in config.js

// Which tags each foe carries.
const MON_TY={
  mossling:['plant'],gustimp:['flying'],dewtoad:['beast'],cinderpup:['beast'],gnatswarm:['swarm','flying'],barrowbones:['undead'],
  crawler:['armored'],gull:['flying'],tidewisp:[],shellguard:['armored'],brinejelly:['jelly'],drownedsailor:['undead'],
  magmaslime:['jelly'],cavebat:['flying','swarm'],ashwraith:['undead'],slaggolem:['armored'],
  frostwolf:['beast'],snowharpy:['flying'],yeti:['beast'],iceknight:['armored'],rimewight:['undead'],
  thunderhawk:['flying'],stormling:[],gargoyle:['armored'],cloudray:['flying'],galephantom:['undead','flying'],
  voidspawn:['jelly'],eclipsewraith:['undead'],stareater:['beast'],huskguard:['armored','undead'],mimic:['armored']
};
const BOSS_TY={
  thornwarden:['plant'],drake:['flying'],cinderking:['armored'],hoarwyrm:['flying'],ysolde:['flying'],bonecolossus:['undead','armored'],
  queenmantis:['flying'],gloomcap:['plant'],ironsentinel:['armored'],siren:['flying'],ashwyvern:['flying'],frostlich:['undead'],
  dimmer:['undead'],nidhra:['flying'],hollowking:['undead','armored'],seraph:['flying']
};
const tyOf=art=>(MON_TY[art]||BOSS_TY[art]||[]).slice();

// ---- delivery ----
// Basic attacks follow the weapon in hand; skills follow the class (with a few per skill exceptions).
const WT_DL={blade:'slash',axe:'slash',greatsword:'slash',lance:'piercing',mace:'blunt',staff:'blunt',tome:'blunt',dagger:'piercing',shortsword:'slash',
  bow:'ranged',longbow:'ranged',crossbow:'ranged',knuckles:'blunt',claws:'slash',qstaff:'blunt',lute:'blunt',harp:'blunt',flute:'blunt',
  thrown:'ranged',beads:'blunt',wand:'blunt',censer:'blunt',warhammer:'blunt',standard:'piercing',lyre:'blunt'};// v0.8.2 role weapons: thrown stars are Ranged
const DL_CLS={warrior:'slash',knight:'blunt',thief:'slash',archer:'ranged',sniper:'ranged',druid:'slash',monk:'blunt',mage:'blunt',healer:'blunt',bard:'blunt',archmage:'blunt',chronicler:'blunt'};
const DL_OVR={
  warrior:{rend:'piercing',titan:'blunt',quake:'blunt',laststand:'blunt'},
  knight:{lance1:'piercing',lance2:'piercing',sburst:'piercing',holylance:'piercing',judge:'blunt',consec:'blunt',consground:'blunt',bash:'blunt'},
  thief:{stab:'piercing',steal:'piercing',shiv1:'piercing',assn:'piercing',shadowstep:'piercing',lotus:'piercing',dart:'ranged',dart2:'ranged',fan:'ranged'},
  monk:{chi1:'ranged',fists:'piercing',ascend:'blunt'},
  druid:{hawk:'piercing',s1a:'ranged',s1b:'ranged',s3a:'ranged',wildmark:'ranged'},// v0.8.2: his arrows are Ranged
  archer:{}
};
function dlFor(cls,s){
  if(!s)return null;if(s.dl)return s.dl;
  if(s.k==='mag')return 'magic';if(s.k==='heal'||s.k==='revive')return 'heal';if(s.k!=='phys')return null;
  const o=(DL_OVR[cls]||{})[s.id];if(o)return o;
  if(s.pierce&&(cls==='archer'||cls==='sniper'))return 'ranged';
  return DL_CLS[cls]||'slash';
}
function deliveryOf(a,sk){
  if(!sk)return null;if(sk.dl)return sk.dl;
  if(sk.k==='mag')return 'magic';if(sk.k==='heal'||sk.k==='revive')return 'heal';if(sk.k!=='phys')return null;
  if(sk.id==='attack'||sk.id==='parthian'){const wp=a&&a.S&&a.S.wp;return (wp&&WT_DL[wp])||DL_CLS[(a&&a.id&&TPL[a.id]&&TPL[a.id].cls)||'warrior']||'slash';}
  const cls=a&&a.id&&TPL[a.id]?TPL[a.id].cls:null;return dlFor(cls,sk);
}

// skills are tagged once, when a hero's list is first built
{const cs0=classSkills;classSkills=function(t){const L=cs0.apply(this,arguments);if(L&&!L._dl){L._dl=1;L.forEach(s=>{const d=dlFor(t&&t.cls,s);if(d&&!s.dl)s.dl=d;});}return L;};}

// ---- the multiplier ----
function archParts(a,sk,t){
  const ty=(t&&t.ty)||[],out=[];if(!ty.length||!sk)return out;
  const dmg=sk.k==='phys'||sk.k==='mag';if(!dmg)return out;
  const dl=deliveryOf(a,sk),els=skEls(sk),area=sk.t==='all'||sk.t==='rand';
  ty.forEach(k=>{const A=ARCH[k];if(!A)return;let m=1;
    if(A.dl&&dl){let v=A.dl[dl];if(sk.pierce&&A.dl.piercing!=null)v=Math.max(v==null?1:v,A.dl.piercing);if(v!=null)m*=v;}
    if(A.el&&els.length){let v=1;els.forEach(e=>{if(A.el[e]!=null)v=A.el[e]>1?Math.max(v,A.el[e]):Math.min(v,A.el[e]);});m*=v;}
    if(A.area&&area)m*=A.area;if(A.single&&!area)m*=A.single;
    if(Math.abs(m-1)>.001)out.push({k,m,dl});});
  return out;
}
function archMult(a,sk,t){
  const P=archParts(a,sk,t);if(!P.length)return 1;let m=1;P.forEach(p=>{m*=p.m;});
  const C=t&&t.boss?ARCH_BOSS_CLAMP:ARCH_FOE_CLAMP;return clamp(m,C[0],C[1]);
}
const isUndead=t=>!!(t&&t.ty&&t.ty.includes('undead'));
// a healing skill that may be aimed at an Undead foe (single target heals and revives)
function healsUndead(sk,u){return !!(sk&&(sk.k==='heal'||sk.k==='revive')&&(sk.t==='ally'||sk.t==='dead')&&isUndead(u)&&u.hp>0);}

// tag foes as they are made
{const me0=makeEnemy;makeEnemy=function(m,lv,opt){const e=me0.apply(this,arguments);try{e.ty=tyOf(m.art);}catch(x){e.ty=[];}return e;};}
// Undead are weak to Light, whatever their own element is
{const eo0=effOf;effOf=function(el,t){let m=eo0.apply(this,arguments);if(el==='light'&&isUndead(t))m=Math.max(m,UNDEAD_LIGHT);return m;};}
// damage: archetype multiplier on top of the element multiplier
{const cd0=calcDamage;calcDamage=function(a,sk,t,bonus){const r=cd0.apply(this,arguments);
  if(a&&t&&a.side==='p'&&t.side==='e'&&t.ty&&t.ty.length){const m=archMult(a,sk,t);if(m!==1){r.dmg=Math.max(1,Math.round(r.dmg*m));r.am=m;
    try{if(B&&(m>=1.2||m<=.8)&&Date.now()-(t.amT||0)>350){t.amT=Date.now();const P=archParts(a,sk,t)[0];if(P)fx(t,(m>1?'▲ ':'▼ ')+DL_NAME[P.dl||'slash']+(m>1?'!':''),'stat effx '+(m>1?'up':'dn'));}}catch(x){}}}
  return r;};}

// ---- Undead take damage from healing ----
function holyHit(a,sk,t,mult){
  if(!t||t.hp<=0)return 0;
  const pw=Math.min(sk.k==='revive'?Math.max(1.6,(sk.pw||.4)*3):(sk.pw||1),HEAL_HURT_PW_CAP);
  let n=Math.round(pw*(a.S.healP||a.S.mag)*rnd(.95,1.05)*(1+(a.S.healUp||0))*mult);
  if(t.boss)n=Math.round(n*clamp(1,ARCH_BOSS_CLAMP[0],ARCH_BOSS_CLAMP[1]));
  if(t.broken)n=Math.round(n*1.5);if(t.guard)n=Math.round(n*.5);if(has(t,'bulwark'))n=Math.round(n*.7);
  t.fxEl='light';t.fxT=Date.now();t.hp=Math.max(0,t.hp-n);
  fx(t,String(n),'dmg weak');log(`${t.name} takes ${n} from the healing light!`);
  try{knowEl(t,'light');if(t.maxShield&&a.side==='p')chipShield(t,1,'weak');}catch(x){}
  if(t.hp<=0)fallen(t);else checkPhase(t);
  return n;
}
{const pf0=perform;perform=function(a,sk,tgts){
  if(a&&a.side==='p'&&sk&&(sk.k==='heal'||sk.k==='revive')&&B){
    const foes=tgts.filter(t=>t.side==='e'),allies=tgts.filter(t=>t.side!=='e');
    let hurt=[],mult=HEAL_HURT;
    if(foes.length)hurt=foes.filter(t=>isUndead(t)&&t.hp>0);
    else if(sk.t==='allyAll'||sk.t==='all'){hurt=B.en.filter(e=>e.hp>0&&isUndead(e));mult=HEAL_HURT_AOE;}
    if(foes.length||hurt.length){
      const r=pf0.call(this,a,sk,allies);
      hurt.forEach(t=>{if(B)holyHit(a,sk,t,mult);});
      return r;}
  }
  return pf0.apply(this,arguments);};}

// ---- previews ----
EFF_CLS['Damages undead']='up';
const DL_CHIP_TIP=(p)=>`${DL_NAME[p.dl||'slash']} vs ${ARCH[p.k].n}: ${p.m>1?'+':''}${Math.round((p.m-1)*100)}%`;
function archInfo(a,sk,e){
  if(!e||!e.ty||!e.ty.length||!sk||!(sk.k==='phys'||sk.k==='mag'))return null;
  const P=archParts(a,sk,e);if(!P.length)return null;
  if(e.boss&&!revealed(e))return {lab:'?',tip:'Boss traits stay hidden until you land a hit or scan it.'};
  const m=archMult(a,sk,e);if(Math.abs(m-1)<.06)return null;
  return {lab:m>1?'up':'dn',m,dl:P[0].dl||deliveryOf(a,sk),tip:P.map(DL_CHIP_TIP).join('. ')};
}
{const ei0=effInfo;effInfo=function(sk,e,a){
  if(sk&&e&&e.hp>0&&healsUndead(sk,e))return {lab:'Damages undead'};
  const I=ei0.apply(this,arguments);
  if(I&&sk&&e&&(sk.k==='phys'||sk.k==='mag')){const A=archInfo(a,sk,e);if(A)I.arch=A;}
  return I;};}
if(typeof effBadge==='function'){const eb0=effBadge;effBadge=function(sk,e,a,cls){
  const base=eb0.apply(this,arguments),I=(sk&&e)?effInfo(sk,e,a):null;
  if(!I||!I.arch)return base;const A=I.arch;
  const chip=A.lab==='?'?`<span class="eff q arch" title="${esc(A.tip)}">? type</span>`:`<span class="eff ${A.lab==='up'?'up':'dn'} arch" title="${esc(A.tip)}">${A.lab==='up'?'▲':'▼'} ${DL_NAME[A.dl||'slash']}</span>`;
  return base+chip;};}
// foe card chips: what kind of foe this is (hidden for unrevealed Scourges and Calamities)
function archChips(e){
  if(!e||!e.ty||!e.ty.length)return '';
  if(e.boss&&!revealed(e))return `<span class="aty q" title="Boss traits stay hidden until you land a hit or scan it.">? type</span>`;
  return e.ty.map(k=>ARCH[k]?`<span class="aty ${k}" title="${esc(ARCH[k].n+': '+ARCH[k].d)}">${ARCH[k].n}</span>`:'').join('');
}
// skill and weapon labels
function dlChip(s,cls){const d=dlFor(cls||null,s);return d?`<em class="dl ${d}" title="Delivery: ${DL_NAME[d]} (${DL_HINT[d]}). Some foes resist or fear this kind of attack.">${DL_NAME[d]}</em>`:'';}
if(typeof gearDesc==='function'){const gd0=gearDesc;gearDesc=function(id){const s=gd0.apply(this,arguments);const g=GEAR[id];return g&&g.slot==='w'&&g.fam&&WT_DL[g.fam]?s+` Delivery: ${DL_NAME[WT_DL[g.fam]]}.`:s;};}

// Bestiary: a Type section (bosses stay hidden until learned)
if(typeof mBeast==='function'){const mb0=mBeast;mBeast=function(m){let h=mb0.apply(this,arguments);if(!h||!m)return h;
  const o=bestAll().find(x=>x.k===m.k);if(!o)return h;const tags=tyOf(o.k);
  const b=META.best[o.d.n]||{},rev=!!(b.hit||b.scan);
  let sec;
  if(!tags.length)sec=`<h4>Type</h4><p class="note">No special type. Plain damage rules apply.</p>`;
  else if(o.g&&!rev)sec=`<h4>Type</h4><p class="note lockl">? Land a hit on it or scan it to learn what kind of foe it is.</p>`;
  else sec=`<h4>Type</h4><div class="rows compact">${tags.map(k=>`<div class="row"><div class="grow"><b class="aty ${k}">${ARCH[k].n}</b><small>${esc(ARCH[k].d)}</small></div></div>`).join('')}</div>`;
  return h.replace('<h4>Skills</h4>',sec+'<h4>Skills</h4>');};}

// Guides tab: Foe types (v0.4.0 3.1). Reads the tables above, so a changed number never leaves the guide stale.
function vTypes(){
  const pct=v=>(v>=1?'+':'')+Math.round((v-1)*100)+'%';
  const rows=ARCH_KEYS.map(k=>{const a=ARCH[k];return `<div class="row"><div class="grow"><b class="aty ${k}">${a.n}</b><small>${esc(a.d)}</small></div></div>`;}).join('');
  const dl=Object.keys(DL_NAME).map(k=>`<div class="row"><div class="grow"><b><em class="dl ${k}">${DL_NAME[k]}</em></b><small>${esc(DL_HINT[k][0].toUpperCase()+DL_HINT[k].slice(1))}.</small></div></div>`).join('');
  return `<p class="note">Every foe carries zero to two types, and every attack has a delivery. Matching them swings damage up or down. Scourges and Calamities swing less than ordinary foes, so no single hero is ever required. Open a foe's card in battle, or its Bestiary entry, to see its types.</p>
  <h4>Foe types</h4><div class="rows compact">${rows}</div>
  <h4>Attack delivery</h4><div class="rows compact">${dl}</div>
  <h4>Undead and healing</h4><p class="note">Single target healing hurts an Undead foe for about ${Math.round(HEAL_HURT*100)}% of what it would heal, and party wide heals for about ${Math.round(HEAL_HURT_AOE*100)}%. The strongest heals stay gentle on the foe so a Miracle never one shots anything. Undead take ${pct(UNDEAD_LIGHT)} from Light.</p>`;
}
