// ===== echo11.js (v0.16.x): the Echoforge pass (owner feedback) =====
//  1) Best in slot. Echoforged gear is now the strongest thing a shop and a smith can make: every main stat is ECHO11.K (2.0) times the tier 5 piece of its family,
//     against 1.75 for that piece fully tempered (+3): at least 14% clear of the best shop piece at max temper. The ordering is
//        personal relic (econ11.js, tier 5: 1.75 x relicEdge) > Echoforged (2.0) > shop tier 5 at +3 (1.75).
//     econ11.js builds relics from ECON11.relicEdge at call time, so this module raises it from 1.08 to 1.25 (relic 2.19x, about 9% over Echoforged).
//     Echoforged gear cannot be tempered (forgeCost is null for it): its +0 already beats +3, and a tempered Echoforged piece would pass the relic.
//     Old saves that hold 'w_blade_ef+2' keep the item id; gearOf reads it as plain Echoforged, so the stats come from data, never from the save.
//  2) Every weapon family a class uses (CLS_WPN) and all three armour weights have a recipe (ECHOFORGE for weapons, ECHOARM for armour). Perks use
//     the fields calcStats already knows (echocore.js) plus a few added in the calcStats wrap below. Shards: three Echoes per piece, rotated over echoKeys().
//  3) Gold: ECHO11.goldK (1.6) x the tier 5 shop price of the family (config.js EF_GOLD, 3000, is no longer used for forging); shown in every row,
//     in the Upgrade popups (p3shop.js upgOpts / upgApply wrapped) and charged by ACT.efForge.
//     (relicBuild is wrapped too: at tier 5 each stat is at least 5% over the Echoforged piece, which only matters for small stats such as SPD.)
//  4) The anvil in the Sanctum hall: a plinth, anvil, echo crystal brazier, banner, rune ring, drifting shards and motes (forgeDraw), in 2D and HD-2D; lights in m.lights.
const ECHO11={K:2.0,goldK:1.6,relicEdge:1.25,attrAdd:9,top3:1.75/* gear16: the old +3 factor, so Echoforged numbers stay as they were */};
try{ECON11.relicEdge=ECHO11.relicEdge;}catch(e){}

// ----- the recipes -----
const ECHOARM={
  mail:{n:'Knellplate',perk:'+12% maximum HP and +4% evasion',hpP:.12,eva:.04},
  robe:{n:'Lumenveil',perk:'+12% maximum MP and +10% healing',mpP:.12,healUp:.10},
  vest:{n:'Veilrunner',perk:'+7% evasion and +8% speed',eva:.07,spdP:.08}};
{const X={// the weapon families that had no recipe (every other class weapon in CLS_WPN): name, perk text and the numbers calcStats reads
  axe:{n:'Hollowcleave',perk:'+20% damage with attacks that hit every foe',cleave:.2},
  greatsword:{n:'Dirgeblade',perk:'+15% physical damage',heavy:.15},
  lance:{n:'Wailpike',perk:'+25% damage to foes that have already acted',charge:.25},
  mace:{n:'Knellmaul',perk:'Stuns land 25% more often and +5% critical chance',stun:.25,crit:.05},
  shortsword:{n:'Mirrorsting',perk:'+8% evasion and +6% critical chance',eva:.08,crit:.06},
  longbow:{n:'Farcry',perk:'Ignores 12% more defense and +6% critical damage',pierce:.12,critDmg:.06},
  knuckles:{n:'Pulsefist',perk:'+20% chance of an extra hit',combo:.2},
  claws:{n:'Wraithrake',perk:'+35% bleed chance and +15% ailment chance',bleed:.35,status:.15},
  qstaff:{n:'Stillwater Bo',perk:'+8% accuracy and +8% evasion',acc:.08,eva:.08},
  lute:{n:'Dissonance',perk:'Debuffs land 20% more often and last 1 turn longer',status:.2,debT:1},
  harp:{n:'Lullaverse',perk:'+15% healing, buffs last 1 turn longer',healUp:.15,buffT:1},
  flute:{n:'Whisperpipe',perk:'+8% speed, buffs last 1 turn longer',spdP:.08,buffT:1},
  thrown:{n:'Ghostfan',perk:'+8% critical chance and +10% speed',crit:.08,spdP:.1},
  beads:{n:'Choirbeads',perk:'+20% healing, buffs last 1 turn longer',healUp:.2,buffT:1},
  wand:{n:'Veilspark',perk:'Debuffs land 25% more often and +10% spell damage',status:.25,spellPow:.1},
  censer:{n:'Vigil Censer',perk:'Buffs last 1 turn longer and +10% healing',buffT:1,healUp:.1},
  warhammer:{n:'Doomtoll',perk:'Debuffs land 20% more often and +15% damage to Scourges, Calamities and Echoes',status:.2,bossDmg:.15},
  standard:{n:'Last Light Banner',perk:'Buffs last 1 turn longer, +6% accuracy and +8% speed',buffT:1,acc:.06,spdP:.08},
  lyre:{n:'Resonant Lyre',perk:'+15% spell damage',spellPow:.15}};
  const ks=echoKeys(),n=ks.length;let i=0;
  Object.keys(X).forEach(f=>{const a=(i*3)%n,sh=[ks[a],ks[(a+7)%n],ks[(a+13)%n]];i++;ECHOFORGE[f]=Object.assign({sh},X[f]);});
  Object.keys(ECHOARM).forEach((f,j)=>{const a=(j*5+4)%n;ECHOARM[f].sh=[ks[a],ks[(a+8)%n],ks[(a+15)%n]];});}

// ----- gold -----
const efSlot=f=>ECHOARM[f]?'a':'w';
const efBaseId=f=>efSlot(f)+'_'+f+'_5';
const efItemId=f=>efSlot(f)+'_'+f+'_ef';
function efGold(f){const b=GEAR[efBaseId(f)];return b?Math.round(b.price*ECHO11.goldK/10)*10:EF_GOLD;}
function efEntry(f){return ECHOFORGE[f]||ECHOARM[f];}

// ----- the gear (data, rebuilt here for the six old ones too) -----
(function(){const mk=f=>{const E=efEntry(f),sl=efSlot(f),b=GEAR[efBaseId(f)];if(!b)return;
  const o={n:'Echoforged '+E.n,slot:sl,tier:5,ef:f,fam:f,efPerk:E.perk,price:efGold(f)};
  if(sl==='a')o.weight=b.weight;else o.wt=f;
  /* K times the tier 5 piece, and never less than 14% over what that piece has at +3 (small stats such as SPD 1.5 would otherwise round level with it) */
  ST.forEach(s=>{if(b[s]>0)o[s]=Math.max(Math.round(b[s]*ECHO11.K),Math.ceil(Math.round(b[s]*ECHO11.top3)*1.14));else if(b[s])o[s]=b[s];});/* penalties (armour SPD, MP) stay as the shop piece has them */
  ['mpEff','elDmg','tome'].forEach(q=>{if(b[q])o[q]=b[q];});
  if(b.attr){o.attr={};Object.keys(b.attr).forEach(a=>{o.attr[a]=b.attr[a]+ECHO11.attrAdd;});}/* a shop +3 adds 6 */
  addGear(efItemId(f),o);};
  Object.keys(ECHOFORGE).forEach(mk);Object.keys(ECHOARM).forEach(mk);})();
function efAll(){return Object.keys(ECHOFORGE).concat(Object.keys(ECHOARM));}
function efCostOf(f){const E=efEntry(f),m={};E.sh.forEach(k=>{m['es_'+k]=EF_SHARDS;});m.essence=EF_ESS;m.core=EF_CORE;return m;}
{const ec0=efCost;efCost=function(f){return ECHOARM[f]?efCostOf(f):ec0.apply(this,arguments);};}
{const eb0=efBaseIn;efBaseIn=function(f){if(!ECHOARM[f])return eb0.apply(this,arguments);const re=new RegExp('^'+efBaseId(f)+'(\\+(\\d))?$');let best=-1,id=null;
  G.gear.forEach((g,i)=>{const m=String(g).match(re);if(m){const p=+(m[2]||0);if(p>best){best=p;id=i;}}});return id==null?null:{i:id,plus:best};};}

// ----- no tempering for Echoforged gear; an old 'w_x_ef+2' reads as plain Echoforged -----
{const go0=gearOf;gearOf=function(id){if(typeof id==='string'&&id.charCodeAt(id.length-2)===43&&/_ef\+\d$/.test(id))return go0.call(this,id.slice(0,-2));return go0.apply(this,arguments);};}
{const fc0=forgeCost;forgeCost=function(id){if(typeof id==='string'&&/_ef(\+\d)?$/.test(id))return null;return fc0.apply(this,arguments);};}

// ----- perks (calcStats): echocore.js reads crit, critDmg, eva, spdP, elAll, bossDmg and primeDmg off ECHOFORGE; the rest is read here -----
HOOK.after('calcStats','echo11','Echoforged weapon and armour perks',function(S,c){try{if(!c||c.side!=='p'||(G&&G.daily))return;
  const w=gearOf(c.eq&&c.eq.w),a=gearOf(c.eq&&c.eq.a),add=(P)=>{if(!P)return;
    if(P.acc)S.acc=(S.acc||.97)+P.acc;
    ['cleave','heavy','charge','pierce','combo','healUp','spellPow','bleed','status','debT','buffT'].forEach(k=>{if(P[k])S[k]=(S[k]||0)+P[k];});
    if(P.stun)S.stun=(S.stun||1)+P.stun;};
  if(w&&w.ef&&ECHOFORGE[w.ef])add(ECHOFORGE[w.ef]);
  if(a&&a.ef&&ECHOARM[a.ef]){const P=ECHOARM[a.ef];add(P);
    if(P.hpP)S.mhp=Math.round(S.mhp*(1+P.hpP));if(P.mpP)S.mmp=Math.round(S.mmp*(1+P.mpP));
    if(P.eva)S.eva=Math.min(.3,(S.eva||0)+P.eva);if(P.spdP)S.spd*=1+P.spdP;S.efArmPerk=P.n;}}catch(e){}});

// ----- the Echoforge page -----
const EF_USERS=(()=>{const o={};Object.keys(CLS_WPN).forEach(c=>CLS_WPN[c].forEach(f=>{(o[f]=o[f]||[]).push(CLS[c].n);}));
  Object.keys(CLS_ARM).forEach(c=>{const f=ARM_FAM[CLS_ARM[c]];(o[f]=o[f]||[]).push(CLS[c].n);});return o;})();
function efVsLine(f){const g=GEAR[efItemId(f)],s=gearOf(efBaseId(f)+'+3');if(!g||!s)return '';const p=[];
  ST.forEach(q=>{if(g[q]>0&&s[q]>0&&p.length<3)p.push(`${STN[q]} <b class="nums">${g[q]}</b> vs ${s[q]} <em class="up">+${Math.round((g[q]/s[q]-1)*100)}%</em>`);});
  return p.length?`<small class="mxt">Best shop piece at max temper (+3): ${p.join(' · ')}</small>`:'';}
vEchoforge=function(){
  const row=f=>{const E=efEntry(f),id=efItemId(f),g=GEAR[id],b=GEAR[efBaseId(f)],m=efCost(f),base=efBaseIn(f),G0=efGold(f),ok=!!base&&hasMats(m)&&G.gold>=G0,u=EF_USERS[f];
    return {ok,html:`<div class="row rec ${ok?'ready':''}">${gearIcon(id)}<div class="grow"><b>${esc(g.n)}</b><small>${gearDesc(g)}.</small>${efVsLine(f)}${u?`<small>For: ${esc(u.join(', '))}</small>`:''}${bestTag(id)}
      <div class="mats">${matChips(m)}<span class="matc gold ${G.gold>=G0?'':'short'}"><i></i><b class="nums">${fmt(G0)}</b> gold</span><span class="matc ${base?'':'short'}"><i></i>${esc(b.n)}${base&&base.plus?' +'+base.plus:''} <b class="nums">${base?1:0}/1</b></span></div></div>
      <button class="btn sm ${ok?'gold':''}" data-act="efForge" data-arg="${f}" ${ok?'':'disabled'}>Forge</button></div>`};};
  const sec=(t,L)=>`<h4 class="efsec">${t}</h4>`+L.map(row).sort((a,b)=>(b.ok-a.ok)).map(r=>r.html).join('');
  return `<p class="note">Echoforged gear is the best you can wear short of a hero's own relic: every main stat is ${Math.round((ECHO11.K/(1+FORGE_STEP*3)-1)*100)}% above the best shop piece of its kind at full temper (+3), and each piece has its own perk. It cannot be tempered, it does not need to be. Each piece needs ${EF_SHARDS} Shards from three different Echoes, ${EF_ESS} Echo Essence, ${EF_CORE} Dread Cores, the gold shown (${ECHO11.goldK}x the shop's tier 5 price) and a tier 5 piece of the same kind from your pack (any tempering on it is used up). Shards only come from Echoes.</p>`
    +sec('Weapons',Object.keys(ECHOFORGE))+sec('Armor',Object.keys(ECHOARM));};
ACT.efForge=function(f){if(!efEntry(f))return;const m=efCost(f),base=efBaseIn(f),gold=efGold(f);if(!base||!hasMats(m)||G.gold<gold){sfx('deny');return;}
  G.gold-=gold;payMats(m);G.gear.splice(base.i,1);const id=efItemId(f);G.gear.push(id);saveGame();sfx('chest');toast('Forged: '+gearOf(id).n);render();if(typeof queueNewGear==='function')queueNewGear([id],true);};

// ----- Upgrade popups (p3shop.js): the gold of the Echoforge step, one id (no +N), and armour -----
{const uo0=upgOpts;upgOpts=function(c,sl){const out=uo0.apply(this,arguments);try{if(!G||G.daily||!c)return out;const town=upgTown();
  for(let i=out.length-1;i>=0;i--){const o=out[i];if(o.k!=='ef')continue;o.id=efItemId(o.f);o.gold=efGold(o.f);o.ok=town&&hasMats(o.m)&&G.gold>=o.gold;
    const g=gainFor(c,o.id);if(!g||g.d<=.01){out.splice(i,1);continue;}o.d=g.d;o.pct=g.pct;o.mx=upgMax(c,o.id);}
  if(sl==='a'){const cur=c.eq.a||null;Object.keys(ECHOARM).forEach(f=>{const id=efItemId(f);if(!canEquip(c,id))return;const base=efBaseIn(f),worn=cur&&baseIdOf(cur)===efBaseId(f),src=base?'pack':worn?'eq':null;if(!src)return;
    const g=gainFor(c,id);if(!g||g.d<=.01)return;const m=efCost(f),gold=efGold(f);
    out.push({k:'ef',f,src,id,gold,m,ok:town&&hasMats(m)&&G.gold>=gold,town:1,d:g.d,pct:g.pct,cid:c.id,sl,mx:upgMax(c,id),key:'ef:'+f});});}
  }catch(e){}return out;};}
{const ua0=upgApply;upgApply=function(o){if(!o||o.k!=='ef')return ua0.apply(this,arguments);const c=G.roster[o.cid];if(!c)return false;const m=efCost(o.f),gold=efGold(o.f),sl=efSlot(o.f),id=efItemId(o.f);
  if(!hasMats(m)||G.gold<gold||!canEquip(c,id))return false;
  if(o.src==='eq'){if(baseIdOf(c.eq[sl]||'')!==efBaseId(o.f))return false;G.gold-=gold;payMats(m);c.eq[sl]=id;refresh(c);saveGame();return id;}
  const base=efBaseIn(o.f);if(!base)return false;G.gold-=gold;payMats(m);G.gear.splice(base.i,1);G.gear.push(id);equipGear(c,id);saveGame();return id;};}

// ===== the Echoforge landmark =====
// Tile (13,6) is unchanged (npc.forge in rift9.js, same trigger). The art spreads over the tiles around it: sprite space is the tile's top left (0,0);
// the plinth is x -13..29, y 9..17; nothing above y -30, so the Riftkeeper's gate at (13,4) stays clear. t is the phase 0..1 of a 2.88 s loop.
const FG={cw:46,ch:48,ox:15,oy:30,loop:2880,steps:24};
const FGC={out:'#0e0a16',s0:'#9a92b8',s1:'#6c6490',s2:'#4a4468',s3:'#2e2848',i0:'#a8a8bc',i1:'#6a6a7c',i2:'#4a4a5a',i3:'#2a2a34',c0:'#f2e8ff',c1:'#c8a4ff',c2:'#8a58e0',c3:'#52309a',gold:'#ffd04a',gold2:'#a8802a'};
function fgBlock(f,x,y,w,h){// a lit stone block: outline, mid fill, light top and left edge (the light is upper left), dark right and bottom, seams
  f(FGC.out,x-1,y-1,w+2,h+2);f(FGC.s1,x,y,w,h);f(FGC.s0,x,y,w,1);f(FGC.s0,x,y,1,h);f(FGC.s2,x+w-2,y+1,2,h-1);f(FGC.s3,x+1,y+h-2,w-1,2);
  for(let k=10;k<w-4;k+=11)f(FGC.s2,x+k,y+1,1,h-3);}
function forgeDraw(ctx,px,py,t,o){o=o||{};const TAU=Math.PI*2,p=.5+.5*Math.sin(TAU*t*2),p2=.5+.5*Math.sin(TAU*t*2+1.7),f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(px+x),Math.round(py+y),w,h);};
  if(o.floor){// the rune ring on the floor and the contact shadow (2D: drawn under every actor)
    ctx.save();ctx.fillStyle='rgba(8,5,20,.38)';ctx.beginPath();ctx.ellipse(px+8,py+16,25,6,0,0,7);ctx.fill();
    const g=ctx.createRadialGradient(px+8,py+12,2,px+8,py+12,34);g.addColorStop(0,`rgba(180,140,255,${(.16+.1*p).toFixed(3)})`);g.addColorStop(1,'rgba(180,140,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(px+8,py+12,34,15,0,0,7);ctx.fill();
    ctx.strokeStyle=`rgba(190,150,255,${(.5+.3*p).toFixed(3)})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(px+8.5,py+12.5,31,13,0,0,7);ctx.stroke();
    ctx.strokeStyle='rgba(150,110,230,.4)';ctx.beginPath();ctx.ellipse(px+8.5,py+12.5,23,9.5,0,0,7);ctx.stroke();
    for(let i=0;i<12;i++){const a=i/12*TAU,hot=Math.max(0,1-(((i/12-t)%1)+1)%1*3),x=Math.round(px+8+Math.cos(a)*27),y=Math.round(py+12.5+Math.sin(a)*11);
      ctx.fillStyle=`rgba(${hot>0?'240,225,255':'170,130,240'},${(.55+.45*hot).toFixed(3)})`;ctx.fillRect(x-1,y-1,3,2);if(i%3===0)ctx.fillRect(x,y-2,1,4);}
    ctx.restore();return;}
  // the banner pole and cloth (behind the anvil)
  f(FGC.out,-12,-18,3,29);f(FGC.i1,-11,-17,1,27);f(FGC.gold,-12,-20,3,2);f(FGC.gold2,-11,-18,1,1);
  for(let i=0;i<9;i++){const w=Math.round(Math.sin(TAU*t*2+i*.7)*1.2),h=11-(i>6?(i-6)*2:0);f(FGC.out,-9+i,-16+w,1,h+2);f(i<2?FGC.c1:i>6?FGC.c3:FGC.c2,-9+i,-15+w,1,h);}
  f(FGC.c0,-7,-12+Math.round(Math.sin(TAU*t*2+2)*1.2),1,1);f(FGC.c0,-6,-11+Math.round(Math.sin(TAU*t*2+2.7)*1.2),1,3);f(FGC.c0,-5,-10+Math.round(Math.sin(TAU*t*2+3.4)*1.2),1,1);// a rune
  // the plinth: a wide slab and a narrower tier, the sign plate on the front
  fgBlock(f,-13,9,42,8);fgBlock(f,-9,3,36,6);
  f(FGC.out,3,10,12,6);f(FGC.gold2,4,11,10,4);f(FGC.gold,4,11,10,1);f('#1c1230',5,12,8,2);f(p>.5?FGC.c0:FGC.c1,7,12,1,2);f(FGC.c1,9,12,2,1);f(FGC.c1,10,13,1,1);f(FGC.c1,8,13,1,1);
  // the anvil: horn, face, waist, foot (outline first, then fill, then light from the upper left)
  const A=[[-5,-7,20,4],[-10,-6,5,2],[-8,-4,3,1],[2,-3,8,3],[0,0,12,3]];
  A.forEach(([x,y,w,h])=>f(FGC.out,x-1,y-1,w+2,h+2));
  A.forEach(([x,y,w,h])=>f(FGC.i1,x,y,w,h));
  f(FGC.i0,-5,-7,20,1);f(FGC.i0,-10,-6,5,1);f(FGC.i0,-5,-7,1,4);f(FGC.i2,12,-6,3,3);f(FGC.i3,-5,-4,20,1);f(FGC.i3,2,-1,8,1);f(FGC.i3,0,2,12,1);f(FGC.i2,9,-3,1,3);f(FGC.i0,0,0,12,1);
  f(`rgba(190,150,255,${(.35+.5*p).toFixed(3)})`,1,-8,9,1);f(FGC.c0,3,-8,3,1);
  // the brazier on the right: a stone bowl with the echo crystal floating over it
  f(FGC.out,16,-5,12,4);f(FGC.s1,17,-4,10,2);f(FGC.s0,17,-4,10,1);f(FGC.s2,25,-4,2,2);// rim
  f(FGC.out,17,-2,10,5);f(FGC.s1,18,-2,8,4);f(FGC.s0,18,-2,8,1);f(FGC.s2,24,-1,2,3);f(FGC.s3,18,2,8,1);f(FGC.out,19,3,6,1);// bowl
  f(p>.5?FGC.c1:FGC.c2,19,-5,6,1);f(FGC.c0,21,-5,2,1);// echo fire in the rim
  const cy=Math.round(Math.sin(TAU*t*2)*1.2)-1,rows=[0,1,2,3,3,3,3,3,2,2,1,1,0];
  rows.forEach((hw,i)=>{const y=-19+cy+i,x0=22-hw;f(FGC.out,x0-1,y,hw*2+3,1);});
  rows.forEach((hw,i)=>{const y=-19+cy+i,x0=22-hw;if(hw===0){f(FGC.c1,22,y,1,1);return;}f(FGC.c1,x0,y,hw+1,1);f(FGC.c3,23,y,hw,1);if(hw>=2)f(FGC.c2,23,y,hw-1,1);});
  f(FGC.c0,20,-17+cy,1,3);f(FGC.c0,21,-18+cy,1,1);f(FGC.c0,19,-14+cy,1,1);
  // floating shards around the anvil, bobbing in a loop
  for(let i=0;i<3;i++){const a=TAU*t+i*TAU/3,sx=Math.round(8+Math.cos(a)*14),sy=Math.round(-12+Math.sin(a)*4+Math.sin(TAU*t*3+i)*1.2),near=Math.sin(a)>=0;
    f(FGC.out,sx-1,sy-3,3,6);f(near?FGC.c1:FGC.c2,sx,sy-2,1,4);f(near?FGC.c0:FGC.c1,sx,sy-2,1,2);f(FGC.c3,sx+1,sy-1,1,2);}
  // sparks on the anvil face and motes lifting off the crystal
  for(let i=0;i<3;i++){const ph=((t*3+i/3)%1),x=Math.round(2+i*4+ph*2),y=Math.round(-8-ph*7);if(ph<.8){ctx.globalAlpha=1-ph;f('#ffe8b0',x,y,1,1);ctx.globalAlpha=1;}}
  for(let i=0;i<8;i++){const ph=((t*2+i/8)%1),x=Math.round(22+Math.sin(TAU*(ph*2+i/8))*6),y=Math.round(-17-ph*13);ctx.globalAlpha=Math.max(0,1-ph*ph*1.1)*.9;f(i%2?FGC.c0:FGC.c1,x,y,1,i%3===0?2:1);ctx.globalAlpha=1;}
  if(o.glow){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(px+22,py-9,1,px+22,py-9,26);g.addColorStop(0,`rgba(190,150,255,${(.3+.22*p2).toFixed(3)})`);g.addColorStop(1,'rgba(190,150,255,0)');ctx.fillStyle=g;ctx.fillRect(px-6,py-36,56,52);ctx.restore();}}
// the HD-2D card: the body only (the ring, glow and shadow are floor decals there), 24 cached steps of the loop
function forgeCard(st){const key='forge11:'+st;let c=H2F[key];if(!c){c=H2F[key]=mkCv(FG.cw,FG.ch);forgeDraw(c.getContext('2d'),FG.ox,FG.oy,st/FG.steps,{});}return c;}
const forgeStill=()=>{try{return typeof gfxStill==='function'&&gfxStill();}catch(e){return false;}};
// 2D: two actors, the floor layer under everything and the body sorted at its tile
{const sa0=sanctumActor;sanctumActor=function(actors,n,ctx,cx,cy,now){if(n.key!==RIFT_FORGE_KEY)return sa0.apply(this,arguments);
  const px=n.x*TS-cx,py=n.y*TS-cy;if(px<-60||py<-60||px>ctx.canvas.width+60||py>ctx.canvas.height+60)return;const t=forgeStill()?.2:(now%FG.loop)/FG.loop;
  actors.push({y:-1e6,draw:()=>forgeDraw(ctx,px,py,t,{floor:1})});actors.push({y:n.y*TS,draw:()=>forgeDraw(ctx,px,py,t,{glow:1})});};}
// the old portal draw call: HD hands over a 16 x 20 card, which stays empty here (hdActors below draws the real one)
HOOK.wrap('drawPortal','echo11','the Echoforge landmark',function(next,ctx,px,py,n,now){if(n&&n.key===RIFT_FORGE_KEY){if(ctx.canvas.width>FG.cw/2)forgeDraw(ctx,px,py,(now%FG.loop)/FG.loop,{glow:1});return;}return next(ctx,px,py,n,now);});
// HD-2D: a standing card for the body, a floor decal for the rune ring, shadow and glow
function hdForgeRing(){return hdSpr('forge11ring',64,32,c=>{c.strokeStyle='#fff';c.lineWidth=1.4;c.beginPath();c.ellipse(32,16,30,14,0,0,7);c.stroke();c.lineWidth=1;c.globalAlpha=.6;c.beginPath();c.ellipse(32,16,22,10,0,0,7);c.stroke();c.globalAlpha=1;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;c.fillStyle='#fff';c.fillRect(Math.round(32+Math.cos(a)*26)-1,Math.round(16+Math.sin(a)*12)-1,3,2);}});}
HOOK.after('hdActors','echo11','the Echoforge in HD-2D',function(r,m,now,ts){try{if(!m||!m.sanctum)return r;const n=m.npcs.find(q=>q.forge);if(!n)return r;
  const V=HD.S.V,B=HD.dyn,BB=HD.dynB,BA=HD.dynA,ph=gfxStill()?.2:(ts%FG.loop)/FG.loop,st=Math.floor(ph*FG.steps)%FG.steps,nx=n.x*TS+8,nz=n.y*TS+14,p=.5+.5*Math.sin(Math.PI*4*ph);
  hdDecal(BB,'blob2',hdBlob2(),nx,nz+1,50,15,8,5,20,200);
  hdDecal(BA,'glow',hdGlowS(),nx,nz-1,84,40,150,100,235,(.18+.14*p)*255);
  hdDecal(BB,'forge11ring',hdForgeRing(),nx,nz-2,66,28,190,150,255,(.45+.3*p)*255);
  hdBill(B,'forge11:'+st,forgeCard(st),nx,-1*V,nz,false,1,255,255,255,255,2);}catch(e){HD.forgeErr=String(e&&e.message||e);}return r;});
// the light: two soft violet lights (crystal and anvil), baked into the 2D night glow and into the HD-2D lights
// (m.tl is rebuilt by scanLights, m.lights is reset by every map bake, so the tile lights are the stable place; 2D night glow and HD-2D both read m.tl)
{const sl0=scanLights;scanLights=function(m){const r=sl0.apply(this,arguments);try{const n=m&&m.sanctum&&m.npcs.find(q=>q.forge);if(n){m.tl=m.tl||[];
  m.tl.push([n.x*TS+30,n.y*TS-6,34,'violet'],[n.x*TS+8,n.y*TS+6,26,'violet']);}}catch(e){}return r;};}
// the relic stays on top: at tier 5 (where Echoforged gear exists) a relic is at least 5% over the Echoforged piece of its kind in every stat
{const rb0=relicBuild;relicBuild=function(id,t){const o=rb0.apply(this,arguments);try{const b=GEAR[id],tp=b&&b.only&&TPL[b.only];if(t>=5&&tp&&(b.slot==='w'||b.slot==='a')){
  const fam=b.slot==='w'?CF[tp.cls][0]:ARM_FAM[CLS_ARM[tp.cls]||'medium'],ef=GEAR[b.slot+'_'+fam+'_ef'];
  if(ef)ST.forEach(s=>{if(ef[s]>0)o[s]=Math.max(o[s]||0,Math.ceil(ef[s]*1.05));});}}catch(e){}return o;};}
window.__ECHO11={ECHO11,ECHOARM,efGold,efItemId,efBaseId,efAll,forgeDraw,FG};
