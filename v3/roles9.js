// ===== roles9.js (v0.13.6): eight roles, a main role you can swap, FAITH that matters, the RPS table by the book, one free reset =====
// The owner's approved design (docs/handoff-v0111.md, batch 4 P4):
// 1) Roles are Striker, Marksman, Caster, Guardian, Healer, Support, Saboteur and Summoner. Every class has one main role and two sub
//    roles (Warrior Str/Gua/Sab, Knight Gua/Str/Sup, Archer Mar/Sab/Str, Thief Sab/Str/Mar, Monk Str/Hea/Sup, Mage Cas/Sab/Sup, Priest
//    Hea/Sum/Sup, Bard Sup/Cas/Hea; legends follow). The existing role keys stay (phys, ranged, magic, tank, healer, buffer, debuffer) and
//    'summoner' joins them, so saves, role skills and party scoring keep working; only the names shown change.
// 2) A hero's main role can be swapped to one of its sub roles from the hero sheet in town (c.role, optional save field). Skills of the
//    main role are at full power; skills of a sub role run at 85% (damage and healing; ailment chances x.9). Untagged skills belong to the
//    class's own role. The main role also drives auto-spent stat points (its stat first) and names the weapon family that suits it.
// 3) FAITH: a summoned guardian's attack and magic scale with the caller's Faith (+0.8% per point), Light and Shadow damage gain +0.3%
//    per point (cap +25%), and a hero shrugs off an ailment with a chance of 0.6% per point (cap 35%).
// 4) Armored foes are weak to Blunt (and Magic), resist Slash, Piercing and Ranged. Swarms and flyers were already right.
// 5) Old saves get one free stat reset (G.rs9, set when used).
const ROLE9={sub:.85,subFx:.9,fthSum:.008,fthEl:.003,fthElCap:.25,fthRes:.006,fthResCap:.35,
  names:{phys:'Striker',ranged:'Marksman',magic:'Caster',tank:'Guardian',healer:'Healer',buffer:'Support',debuffer:'Saboteur',summoner:'Summoner'},
  cls:{warrior:['phys','tank','debuffer'],knight:['tank','phys','buffer'],archer:['ranged','debuffer','phys'],thief:['debuffer','phys','ranged'],monk:['phys','healer','buffer'],mage:['magic','debuffer','buffer'],healer:['healer','summoner','buffer'],bard:['buffer','magic','healer'],
    sniper:['ranged','debuffer','phys'],druid:['ranged','healer','summoner'],archmage:['magic','buffer','debuffer'],chronicler:['magic','debuffer','healer']},
  stat:{phys:'str',ranged:'dex',magic:'int',tank:'vit',healer:'fth',buffer:'spi',debuffer:'agi',summoner:'fth'},
  wpn:{warrior:{phys:'greatsword',tank:'blade',debuffer:'axe'},knight:{tank:'blade',phys:'lance',buffer:'standard'},archer:{ranged:'bow',debuffer:'longbow',phys:'crossbow'},thief:{debuffer:'dagger',phys:'shortsword',ranged:'thrown'},
    monk:{phys:'knuckles',healer:'qstaff',buffer:'claws'},mage:{magic:'staff',debuffer:'wand',buffer:'tome'},healer:{healer:'staff',summoner:'censer',buffer:'mace'},bard:{buffer:'lyre',magic:'tome',healer:'staff'}},
  desc:{phys:'Melee damage with slashes, blows and thrusts. Strength.',ranged:'Shots from the back line that flyers cannot dodge. Dexterity.',magic:'Elemental spells, primers and detonators. Intellect.',tank:'Holds the line: taunts, bulwarks, the most HP. Vitality.',
    healer:'Mends, cleanses and revives. Faith.',buffer:'Haste, Might, Regen and Ward for the line. Spirit.',debuffer:'Breaks, Weakens, Slows and poisons foes. Agility.',summoner:'Invokes Sanctum guardians and pets, stronger with Faith.'}};
// ---- the role tables ----
try{Object.assign(ROLES.names,ROLE9.names);Object.keys(ROLE9.cls).forEach(k=>{const r=ROLE9.cls[k];if(ROLES.cls[k]){ROLES.cls[k].p=r[0];ROLES.cls[k].s=r.slice(1);}});ROLES.ded.summoner='healer';
  Object.assign(ARCH.armored,{d:'Blunt blows crack the plates and magic seeps through. Slashing, piercing and ranged hits glance off.',dl:{blunt:1.25,magic:1.1,slash:.6,piercing:.7,ranged:.6}});}catch(e){}
function heroRoles(c){const t=c&&TPL[c.id];return (t&&ROLE9.cls[t.cls])||(t&&ROLES.cls[t.cls]?[ROLES.cls[t.cls].p].concat(ROLES.cls[t.cls].s):['phys']);}
function heroMain(c){const R=heroRoles(c);return c&&c.role&&R.includes(c.role)?c.role:R[0];}
function roleWpn(c){try{const t=TPL[c.id];return ((ROLE9.wpn[t.cls]||{})[heroMain(c)])||null;}catch(e){return null;}}
// the Summoner role's output: Invoke or Spirit Call known, or a pet at hand
{const ro0=roleOut;roleOut=function(c,role){if(role==='summoner'){try{const ks=known(c);let v=ks.some(s=>/invoke|spirit/i.test(s.id)||s.summon)?1:0;if(typeof canSummon==='function'&&G&&compOf&&compOf(c))v=Math.max(v,.7);return v*(1+((c.S&&c.S.attr&&c.S.attr.fth)||0)*ROLE9.fthSum);}catch(e){return 0;}}return ro0.apply(this,arguments);};}
// ---- skills of a sub role run at 85% ----
const RL9C={};
function rl9Factor(c,s){if(!s||s.bond||s.limit||s.id==='attack')return 1;const t=TPL[c.id];if(!t||G&&G.daily)return 1;const main=heroMain(c),own=s.rl||(ROLES.cls[t.cls]?ROLES.cls[t.cls].p:main);return own===main?1:ROLE9.sub;}
{const kn0=known;known=function(c){const L=kn0.apply(this,arguments);try{if(!c||!TPL[c.id]||G&&G.daily)return L;return L.map(s=>{const f=rl9Factor(c,s);if(f===1)return s;const key=c.id+':'+heroMain(c)+':'+s.id+':'+(s.pw||0);let x=RL9C[key];
  if(!x){x=Object.assign({},s,{sub:1});if(s.pw)x.pw=+(s.pw*f).toFixed(3);if(s.fx)x.fx=s.fx.map(q=>Array.isArray(q)?[q[0],+((q[1]==null?1:q[1])*ROLE9.subFx).toFixed(3)].concat(q.slice(2)):q);x.d=(s.d||'');/* v0.17.1: no role note in the description (owner) */RL9C[key]=x;}return x;});}catch(e){return L;}};}
// ---- auto-spent points follow the main role ----
{const aa0=autoAlloc;autoAlloc=function(c){try{const t=TPL[c.id],C=CLS[t.cls],st=ROLE9.stat[heroMain(c)];if(C&&st&&C.pref&&C.pref[0]!==st&&heroMain(c)!==heroRoles(c)[0]){const p0=C.pref;C.pref=[st].concat(p0.filter(k=>k!==st)).slice(0,3);try{return aa0.apply(this,arguments);}finally{C.pref=p0;}}}catch(e){}return aa0.apply(this,arguments);};}
// ---- FAITH ----
HOOK.after('calcStats','roles9','faith perks',function(S,c){try{if(G&&G.daily)return;const f=(S.attr&&S.attr.fth)||0;if(f>0){const b=Math.min(ROLE9.fthElCap,f*ROLE9.fthEl);S.elBoost.light=(S.elBoost.light||0)+b;S.elBoost.shadow=(S.elBoost.shadow||0)+b;S.fthRes=Math.min(ROLE9.fthResCap,f*ROLE9.fthRes);}}catch(e){}});
let SUM9_CASTER=null;
{const sf0=sumFire;sumFire=function(a){SUM9_CASTER=a||null;try{return sf0.apply(this,arguments);}finally{SUM9_CASTER=null;}};}
{const sm0=sumMake;sumMake=function(o,lesser,owner){const u=sm0.apply(this,arguments);try{const a=owner||SUM9_CASTER;const f=a&&a.S&&a.S.attr&&a.S.attr.fth||0;if(f>0&&u&&u.S){const k=1+f*ROLE9.fthSum;u.S.atk*=k;u.S.mag*=k;u.fthK=k;}}catch(e){}return u;};}
HOOK.before('addSt','roles9','faith shrugs off a status',function(t,k,src,silent){try{const def=STS[k];if(t&&t.side==='p'&&def&&def.bad&&t.S&&t.S.fthRes&&!(G&&G.daily)&&Math.random()<t.S.fthRes){if(!silent){fx(t,'Faith','st good');log(`${t.name}'s faith shrugs off ${def.n}.`);}return HOOK.stop(false);}}catch(e){}});
// ---- one free stat reset ----
{const rc0=respecCost;respecCost=function(c){try{if(G&&!G.daily&&!G.rs9)return 0;}catch(e){}return rc0.apply(this,arguments);};}
{const rs0=ACT.respec;ACT.respec=function(){const c=G&&G.roster[V.modal&&V.modal.char];const free=!!(c&&G&&!G.daily&&!G.rs9&&Object.keys(c.alloc||{}).length);const r=rs0.apply(this,arguments);try{if(free&&c&&!Object.keys(c.alloc||{}).length){G.rs9=1;toast('Your one free stat reset is spent. The next costs gold.');saveGame();}}catch(e){}return r;};}
// ---- the hero sheet: the role row and the picker ----
HOOK.xform('mChar','roles9','role row on the hero sheet',function(h,id,edit){try{const c=G.roster[id];if(!c||G.daily)return h;const R=heroRoles(c),main=heroMain(c),w=roleWpn(c);
  const row=`<h4>Role</h4><div class="rows compact rl9"><div class="row"><div class="grow"><b>${esc(ROLES.names[main]||main)}</b><small>${esc(ROLE9.desc[main]||'')}${w?` Weapon: ${esc(WT_NAME[w]||w)}.`:''} Sub roles: ${R.slice(0).filter(r=>r!==main).map(r=>esc(ROLES.names[r]||r)).join(', ')} (85% power).</small></div>${edit&&inTown()?`<button class="btn sm" data-act="rolePick" data-arg="${id}">Change</button>`:edit?'<small>Change it in town.</small>':''}</div></div>`;
  h=h.replace('<h4>Attributes',row+'<h4>Attributes');if(!G.rs9)h=h.replace('>Respec for 0 gold<','>Respec: free this once<');}catch(e){}return h;});
ACT.rolePick=function(id){if(!G||!G.roster[id]||!inTown())return;V.modal={type:'rolepick',char:id,from:V.modal};render();};
ACT.roleSet=function(a){const [id,r]=String(a).split(':');const c=G&&G.roster[id];if(!c||!heroRoles(c).includes(r))return;c.role=r===heroRoles(c)[0]?undefined:r;if(c.role===undefined)delete c.role;refresh(c);saveGame();toast(`${c.name} now leads as ${ROLES.names[r]||r}.`);V.modal=V.modal&&V.modal.from||{type:'char',char:id};render();};
HOOK.before('vModal','roles9','role picker',function(m){if(!m||m.type!=='rolepick')return;const c=G.roster[m.char];if(!c)return HOOK.stop('');const t=TPL[c.id],main=heroMain(c);
  const rows=heroRoles(c).map((r,i)=>{const w=(ROLE9.wpn[t.cls]||{})[r],st=ROLE9.stat[r];return `<div class="row ${r===main?'up':''}"><div class="grow"><b>${esc(ROLES.names[r]||r)}${i===0?' <small>(class role)</small>':''}</b><small>${esc(ROLE9.desc[r]||'')}${w?` Weapon: ${esc(WT_NAME[w]||w)}.`:''}${st?` Auto-spend favours ${esc(ATTRN[st][0])}.`:''}</small></div>${r===main?'<span class="m">Main</span>':`<button class="btn sm gold" data-act="roleSet" data-arg="${c.id}:${r}">Lead</button>`}</div>`;}).join('');
  return HOOK.stop(box(`${esc(c.name)}: main role`,`<p class="note">The main role's skills are at full power; the other two run at 85%. Auto-spent stat points follow the main role. Swap any time in town.</p><div class="rows">${rows}</div>`,`<button class="btn" data-act="roleBack">Back</button>`));});
ACT.roleBack=function(){V.modal=V.modal&&V.modal.from||null;render();};
// ---- foe cards and aim tags show Slash, Blunt and Piercing apart again (no "Physical" group) ----
try{Object.assign(DG_NAME,{slash:'Slash',blunt:'Blunt',piercing:'Piercing'});Object.assign(DG_ART,{slash:'slash',blunt:'blunt',piercing:'piercing'});Object.assign(DG_OF,{slash:'slash',blunt:'blunt',piercing:'piercing'});}catch(e){}
{const fd0=foeDg;foeDg=function(e){const out=fd0.apply(this,arguments);try{if(out&&out.phys!=null){delete out.phys;const ty=(e.ty||[]).filter(k=>ARCH[k]&&ARCH[k].dl),C=e.boss?ARCH_BOSS_CLAMP:ARCH_FOE_CLAMP;
  ['slash','blunt','piercing'].forEach(d=>{let m=1;ty.forEach(k=>{const v=ARCH[k].dl[d];if(v!=null)m*=v;});out[d]=clamp(m,C[0],C[1]);});}}catch(x){}return out;};}
