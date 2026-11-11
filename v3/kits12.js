// ===== kits12.js (v0.19.2): kits that read right, dual arts in a class's voice, identity skills back in the 12, guardians as summonable bosses =====
// The owner's four requests after 0.19.1, all new behaviour here; the numbers and names are data in config.js (SK12: gen, voice, slotNames, roleSwap, keep,
// drop, arts), skills.js (SPELL names, Tempest Whirl) and summon8.js (SUM turns), battle11.js (FS11.mini).
// 1) Primers and Detonators follow what a skill does and reads like. skills12.js guaranteed one Primer and one Detonator per element of a dual type by
//    retagging a spare skill or adding a filler, and a retag could give a skill a role its name contradicts ("Shadow Ray" priming, "Wind Ray" detonating:
//    the first spells of a class carry a fixed role by slot, whatever the family name says). Now: k12Guarantee never retags a skill unless its name reads
//    as that role (k12Reads: a mark, a brand, a seal, a halo, a rune, a lingering tune primes; a burst, a smite, a lance, an edge, a crescendo detonates),
//    otherwise it adds a filler named in the class's voice (SK12.gen, SK12.voice); the slot skills that name the opposite role take the class's voice for the
//    role they have (SK12.slotNames: Earth Edge that primes is Earth Brand, Wind Ray that detonates is Wind Smite); legends whose first two spells read the
//    other way round swap roles (SK12.roleSwap: Thunder Quarrel bursts, Shadow Quarrel lingers).
// 2) Dual arts of a physical class (SK12.physCls) are martial moves that still name both elements ("Loam and Tide Volley"), with a martial description
//    and the effects the spell version had; casters keep their spell names (COMBO in skills.js). The spell name stays in s.spell.
// 3) The cap (skills12.js s12Pick) left out skills that define a class (Hunter's Mark, Cleave, Flurry of Fists, Smoke Bomb, Purify, Dissonance...).
//    SK12.keep names each class's identity skills; one the cap dropped comes back and takes the place of the first skill in SK12.drop that is in the kit
//    (a generic or repeated damage skill), never one a dual type needs for its Primers and Detonators.
// 4) Guardians are bosses you can summon: guardian sprites are drawn at boss size (battle11.js), a guardian fight stands on the boss slots, a summoned
//    guardian (summon8.js: 5 turns for a Priest, 3 for a Monk) takes the party's boss slot or stands beside its allies without covering them, and its
//    entrance gets the boss treatment: the "GUARDIAN: name" banner, a short glow and rings, and a name plate over its head for as long as it stays.
const K12={glow:1200,plateGap:2,gap:3,retag:[],swap:[],id:[]};

// ---- 1. primers and detonators that read like what they are ----
const K12_P=/\b(mark|brand|branding|seal|rune|halo|needle|touch|thorn|gloss|chord|refrain|tune|dart|palm|whirl|fan|rondo|glyph|tracer|veil|sigil|consecrate|consecrated|ground|hex|curse)\b/i;
const K12_D=/\b(burst|smite|breaker|crescendo|lance|bolt|strike|charge|fang|cut|verse|blow|fist|kick|finale|verdict|judgement|cataclysm|ragnarok|titan|assassinate|lotus|heavenpiercer|piercing|barrage|symphony|edge|shiv|arrow|shot|quarrel|eclipse)\b/i;
// what a skill's name says: 'primer', 'det', 'mixed' (both, "Branding Strike") or null
function k12Reads(s){const n=String(s&&s.n||''),p=K12_P.test(n),d=K12_D.test(n);return p&&d?'mixed':p?'primer':d?'det':null;}
// a role the name does not contradict
function k12Fits(s,role){const r=k12Reads(s);return !r||r==='mixed'||r===role;}
const k12El=s=>EL[Array.isArray(s.el)?s.el[0]:s.el]||'';
function k12Gen(t,e,role){const cls=t.cls,nm=SK12.gen[cls]||['{n} Mark','{n} Lance'],vo=SK12.voice[cls]||['',''],n=EL[e],phys=SK12.physCls.includes(cls),P=role==='primer';
  const o={id:'g12_'+(P?'p':'d')+'_'+e,n:nm[P?0:1].replace('{n}',n),k:phys?'phys':'mag',pw:P?1.15:1.6,mp:P?4:6,cost:1,hits:1,t:'one',el:e,role,lv:SK12.genLv[P?'P':'D'],fixed:1,gen:1,
    d:vo[P?0:1].replace('{n}',n)};
  o.lv0=o.lv;try{const d=dlFor(cls,o);if(d)o.dl=d;}catch(x){}return o;}
// legends whose first two spells read the other way round swap their fixed roles (once: the skill objects are shared with the full list)
function k12Swap(t,S){const ids=SK12.roleSwap[t.cls];if(!ids)return;const a=S.find(s=>s.id===ids[0]),b=S.find(s=>s.id===ids[1]);if(!a||!b||a._k12sw||!a.role||!b.role||a.role===b.role)return;
  const r=a.role;a.role=b.role;b.role=r;a._k12sw=b._k12sw=1;K12.swap.push(t.id+': '+a.n+' '+a.role+', '+b.n+' '+b.role);}
function k12Guarantee(t,S){const out=S.slice();k12Swap(t,out);
  t.el.forEach(e=>['primer','det'].forEach(role=>{if(out.some(s=>s12Is(s,role,e)))return;
    const c=out.filter(s=>!s.role&&!s.combo&&!s.sig&&skHitsFoe(s)&&(s.k==='phys'||s.k==='mag')&&s.el===e&&k12Reads(s)===role).sort(s12Lv)[0];
    if(c){c.role=role;K12.retag.push(t.id+': '+c.n+' '+role);return;}
    out.push(k12Gen(t,e,role));}));return out;}
HOOK.wrap('s12Guarantee','kits12','roles by what the skill reads like; a filler in the class voice instead of a contradicting retag',function(next,t,S){return k12Guarantee(t,S);});
// the slot skills whose family name says the opposite of the role they have take the class's voice for it
function k12Slots(t,L){const tb=SK12.slotNames[t.cls],vo=SK12.voice[t.cls];if(!tb||!vo)return;
  L.forEach(s=>{const p=tb[s.id];if(!p||s._k12n||!s.role||!k12Fits({n:p},s.role))return;s._k12n=1;const n=k12El(s);if(!n)return;
    s.spell0=s.n;s.n=p.replace('{n}',n);s.d=vo[s.role==='primer'?0:1].replace('{n}',n);});}

// ---- 2. dual arts in the class's voice ----
const K12_ST={burn:'Burn',blind:'Blind',slow:'Slow',weaken:'Weaken',stun:'Stun',break:'Break',root:'Root',bleed:'Bleed',poison:'Poison'};
const K12_BUFF={might:'Might',regen:'Regen',haste:'Haste',ward:'Ward',bulwark:'Bulwark',focus:'Focus',taunt:'Taunt'};
const k12List=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
const k12Or=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' or '+a[a.length-1];
// the effects of the art, from its data (the spell text of COMBO says the same things in spell words)
function k12Fx(s){const fx=s.fx||[],ally=s.t==='allyAll'||s.t==='ally'||s.t==='self';
  if(ally){const g=fx.map(f=>K12_BUFF[f[0]]||K12_ST[f[0]]||f[0]);if(s.k==='heal')return `Heals${s.cleanse?' and cleanses':''} the vanguard${g.length?' and grants '+k12List(g):''}.`;return g.length?`Grants ${k12List(g)} to the vanguard.`:'';}
  const hi=fx.filter(f=>f[1]>=.6).map(f=>(K12_ST[f[0]]||f[0])+'s'),lo=fx.filter(f=>f[1]<.6).map(f=>K12_ST[f[0]]||f[0]),out=[];
  if(hi.length)out.push('Likely '+k12List(hi));if(lo.length)out.push((out.length?'may ':'May ')+k12Or(lo));
  let t=out.length?out.join('; ')+'.':'';if(s.afflicted)t+=' Hits 50% harder on afflicted foes.';if(s.pierce)t+=' Ignores half of resistance.';
  if(s.self&&s.self.length)t+=' Grants you '+k12List(s.self.map(f=>K12_BUFF[f[0]]||f[0]))+'.';return t.trim();}
const k12Hash=k=>[...k].reduce((a,c)=>a+c.charCodeAt(0),0);
function k12Art(t,s){const A=SK12.arts,cls=t.cls;if(!s||!s.combo||s._k12c||!SK12.physCls.includes(cls)||!A.n[cls])return;s._k12c=1;
  const kind=s.t==='all'?'all':(s.t==='allyAll'||s.t==='ally'||s.t==='self')?'ally':'one',els=t.el,N=A.n[cls][kind];if(!N||els.length<2)return;
  const noun=N[k12Hash(comboKey(els))%N.length];s.spell=s.n;
  s.n=`${A.w[els[0]]} and ${A.w[els[1]]} ${noun}`;s.d=(A.d[cls][kind].replace('{a}',EL[els[0]]).replace('{b}',EL[els[1]])+' '+k12Fx(s)).trim();}

// ---- 3. identity skills back in the 12 ----
// a dual type needs a Primer and a Detonator of each element in the kit
function k12Covers(t,L){return t.el.length<2||t.el.every(e=>['primer','det'].every(role=>L.some(s=>s12Is(s,role,e))));}
function k12Identity(t,S,kit){const keep=SK12.keep[t.cls];if(!keep||!kit)return kit;const drop=SK12.drop[t.cls]||[];let out=kit.slice();
  keep.forEach(id=>{if(out.some(s=>s.id===id))return;const add=S.find(s=>s.id===id);if(!add)return;
    for(const d of drop){const v=out.find(s=>s.id===d);if(!v||keep.includes(v.id)||v.sig||v.combo)continue;const nx=out.filter(s=>s!==v).concat([add]);if(!k12Covers(t,nx))continue;
      out=nx;K12.id.push(t.id+': +'+add.n+' -'+v.n);return;}});
  return out.length===kit.length?out.sort(s12Lv):kit;}
HOOK.wrap('s12Pick','kits12','each class keeps the skills that define it (SK12.keep) when the cap drops them',function(next,t,S){return k12Identity(t,S,next(t,S));});

// names and arts are written once on the finished list (the skill objects are the ones classSkills caches, shared with the full list)
HOOK.xform('classSkills','kits12','slot skills in the class voice, martial dual arts',function(L,t){
  if(!L||!t||t.mon||!CLS[t.cls]||L._k12)return L;L._k12=1;
  try{const full=typeof sk12Full==='function'?sk12Full(t):L;[L,full].forEach(l=>{k12Slots(t,l);l.forEach(s=>k12Art(t,s));});}catch(e){}return L;});

// ---- 4. guardians as bosses ----
const K12B=new WeakMap();
// where the visible figure of a unit's canvas lies, in logical px from the canvas's left and top (the alpha bounds, once per canvas)
function k12Fig(u){try{const c=spriteOf(u);if(!c||!c.getContext)return null;let e=K12B.get(c);if(e)return e;
  const k=c.hd||1,w=c._rw||Math.round(c.width*k),h=c._rh||Math.round(c.height*k),d=c.getContext('2d').getImageData(0,0,w,h).data;let l=1e9,r=-1,t=1e9,b=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>24){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}
  if(r<0)return null;e={l:l/k,r:(r+1)/k,t:t/k,b:(b+1)/k,w:c.width,h:c.height};K12B.set(c,e);return e;}catch(x){return null;}}
// the figure's rectangle on the stage for a unit at its box b (a party unit is drawn mirrored)
function k12Rect(u,b){const f=k12Fig(u);if(!f||!b)return null;const m=u.side==='p',x0=b.x-f.w/2,l=m?x0+f.w-f.r:x0+f.l,r=m?x0+f.w-f.l:x0+f.r;return {l,r,t:b.y-f.h+f.t+1,b:b.y-f.h+f.b+1,w:r-l};}
HOOK.xform('unitBox','kits12','a guardian fight stands on the boss slots; a summoned guardian takes the party boss slot or stands clear of its allies',function(b,u){
  try{if(!b||!u||!B||!BL)return b;const W=BL.W,H=BL.H;
    if(u.isSum&&B.sum&&B.sum.u===u){const sl=slotsFor('e',1,true)[0],f=k12Fig(u);b.y=Math.round(sl[1]*H);let x=Math.round((1-sl[0])*W);const lo=f?(f.w/2-f.r):-44,hi=f?(f.w/2-f.l):44;
      const o=B.front.filter(c=>c!==u&&c.hp>0&&!c.hidden);
      if(o.length){let e=1e9;o.forEach(c=>{const q=unitBox(c);if(q)e=Math.min(e,q.x-q.w/2);});if(e<1e9)x=Math.min(x,Math.round(e-K12.gap-hi));}
      x=Math.min(x,W-1-hi);x=Math.max(x,1-lo);b.x=x;return b;}
    if(!u.isSum&&u.side!=='p'&&b.i!=null&&B.spec&&B.spec.mini&&typeof B.spec.mini==='object'){const sl=slotsFor('e',B.en.length,true)[b.i];if(sl){b.x=Math.round(sl[0]*W);b.y=Math.round(sl[1]*H);}}
  }catch(e){}return b;});
// the entrance: rings, sparks and a glow in the guardian's element (the banner is GUARDIAN: name, summon8.js)
HOOK.after('sumFire','kits12','boss entrance: rings and a glow',function(r,a,o,lesser){try{if(!r||!B||!B.sum)return;const u=B.sum.u,b=unitBox(u),now=performance.now(),col=ELC[(MON[o.mon].el||[])[0]]||'#ffd04a';if(!b)return;
  u.k12In=Date.now();u.k12Col=col;const gy=b.gy!=null?b.gy:b.y,rw=Math.round(b.w*.42);
  part({k:'ring',x:b.x,y:gy,t0:now,life:760,col,r:rw,flat:1});part({k:'ring',x:b.x,y:gy,t0:now+140,life:700,col:'#ffffff',r:Math.round(rw*.66),flat:1});
  sparkleUp(b.x,b.y-b.h*.3,col,now,16);sparkleUp(b.x,b.y-b.h*.3,'#ffffff',now,6);BV.shake={t:now,life:260,amp:2};}catch(e){}});
HOOK.after('battleFrame','kits12','guardian glow on entering',function(r,now){try{const S=B&&B.sum,u=S&&S.u;if(!u||!u.k12In||V.screen!=='battle')return;const age=Date.now()-u.k12In;if(age<0||age>K12.glow)return;
  const cv=document.getElementById('bcv'),b=cv&&unitBox(u);if(!b)return;const ctx=cv.getContext('2d'),col=u.k12Col||'#ffd04a',p=age/K12.glow,cy=b.y-b.h*.45;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,.85*(1-p*p));const g=ctx.createRadialGradient(b.x,cy,4,b.x,cy,b.h*.75);g.addColorStop(0,col+'aa');g.addColorStop(1,col+'00');ctx.fillStyle=g;ctx.fillRect(b.x-b.h,cy-b.h,b.h*2,b.h*2);ctx.restore();}catch(e){}});
// the name plate (the boss bar's name, level and what is left of its stay) over the summoned guardian's head
try{const st=document.createElement('style');st.textContent='.k12plate{position:absolute;transform:translateX(-50%);white-space:nowrap;pointer-events:none;z-index:7;font:700 5.5px/1 sans-serif;letter-spacing:.2px;color:#ffe9a8;background:rgba(21,11,23,.88);border:1px solid #ffd04a;border-radius:2px;padding:2px 4px}.k12plate b{color:#ffd04a;margin-right:3px}.k12plate i{font-style:normal;color:#c8b8d8;margin-left:3px}.k12plate em{font-style:normal;color:#9affc8;margin-left:3px}';document.head.appendChild(st);}catch(e){}
HOOK.after('renderBattle','kits12','name plate over a summoned guardian',function(){try{const S=B&&B.sum,u=S&&S.u,el=document.getElementById('bstage');if(!el)return;el.querySelectorAll('.k12plate').forEach(n=>n.remove());if(!u||u.hp<=0||V.screen!=='battle')return;
  const b=unitBox(u),R=b&&k12Rect(u,b);if(!b)return;const W=BL.W,n=u.turnsLeft,pw=Math.round((`GUARDIAN ${u.name} Lv ${u.lv} ${n} turns`.length)*3.1+16),x=Math.max(pw/2+2,Math.min(W-pw/2-2,R?(R.l+R.r)/2:b.x)),y=Math.max(2,(R?R.t:b.y-b.h)-K12.plateGap-12);
  el.insertAdjacentHTML('beforeend',`<div class="k12plate" style="left:${Math.round(x)}px;top:${Math.round(y)}px"><b>GUARDIAN</b>${esc(u.name)}<i>Lv ${u.lv}</i><em>${n} turn${n===1?'':'s'}</em></div>`);}catch(e){}});

// tests and the audit
try{window.__K12={K12,reads:k12Reads,fits:k12Fits,fig:k12Fig,rect:k12Rect,covers:k12Covers,get SK12(){return SK12;}};}catch(e){}
