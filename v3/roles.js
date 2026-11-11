// ===== roles.js (v0.8.2): class roles: a primary and secondary roles per class, the skills and charms behind them, and roleOut =====
// Tunables and the skill table: ROLES in config.js (section 5). Weapon families that lean into a secondary role live in items.js
// (thrown, beads, wand, censer, warhammer, standard, lyre), their icons in icons.js, their delivery in archetype.js (thrown is Ranged).
// The new skills join each class list at fixed levels after the respacer has run, so no older skill moves and an old save learns
// them on load from its level (skillKnown reads the level). The Daily Trial sees them too (its heroes are level 26): see the doc.
// Party scoring: heroRoleSet(c) returns {cls, primary, secondary:[...], has:{role:true}, out:{role:share}} for party3.js.

// ---- skills ----
function rlSkills(t){const L=(ROLES.sk[t.cls]||[]),e1=t.el[0],n1=EL[e1]||'';
  return L.map(o=>{const x=Object.assign({cost:1,hits:1,t:'one',mp:0,el:null,fixed:1},JSON.parse(JSON.stringify(o)));
    if(x.el==='e1')x.el=e1;x.n=x.n.replace(/\{n1\}/g,n1);x.d=x.d.replace(/\{n1\}/g,n1);x.lv0=x.lv;x.rl=x.r;delete x.r;
    if(!x.dl){const d=dlFor(t.cls,x);if(d)x.dl=d;}if(x.rl&&ROLES.names[x.rl])x.d+=' '+ROLES.names[x.rl]+' role.';return x;});}
HOOK.xform('classSkills','roles','secondary role skills and adjustments',function(L,t){
  if(!L||L._rl||!t||t.mon||!ROLES.sk[t.cls])return L;L._rl=1;
  try{const A=(ROLES.adj||{})[t.cls]||{};L.forEach(s=>{if(A[s.id])Object.assign(s,JSON.parse(JSON.stringify(A[s.id])));});
    const have=new Set(L.map(s=>s.id));rlSkills(t).forEach(s=>{if(!have.has(s.id))L.push(s);});L.sort((a,b)=>a.lv-b.lv||(a.lv0||a.lv)-(b.lv0||b.lv));}catch(e){}
  return L;});

// Monk chi heals (chi:1) draw on the better of healing power and ROLES.w.chiK x attack
const rlHealP=(a,sk)=>{const h=a.S.healP||a.S.mag;return sk&&sk.chi?Math.max(h,ROLES.w.chiK*a.S.atk):h;};
HOOK.wrap('perform','roles','chi heals use the role heal power',function(next,...args){let a=args[0],sk=args[1];if(!(sk&&sk.chi&&a&&a.S))return next(...args);const h0=a.S.healP;a.S.healP=rlHealP(a,sk);
  try{return next(...args);}finally{a.S.healP=h0;}});

// ---- role charms ----
ROLES.charms.forEach(c=>addGear(c.id,Object.assign({n:c.n,slot:'c',tier:2,price:c.price,rl:c.perk,rlD:c.d},c.st,c.attr?{attr:c.attr}:{})));
{const ss0=shopStock;shopStock=function(tab){const o=ss0.apply(this,arguments);try{if(tab==='charms'&&G&&!G.daily&&G.stage>=ROLES.shopFrom)ROLES.charms.forEach(c=>{if(!o.includes(c.id))o.push(c.id);});}catch(e){}return o;};}
HOOK.xform('gearDesc','roles','charm role text',function(s,id){const g=typeof id==='string'?gearOf(id):id;return g&&g.rlD?s+(s?', ':'')+g.rlD:s;});
// charm perks join the weapon perks (never in the Daily Trial, which ignores perks)
HOOK.after('calcStats','roles','charm perks',function(S,c){try{if(G&&G.daily)return;
  EQSL.forEach(sl=>{const g=gearOf(c.eq&&c.eq[sl]);const P=g&&g.rl;if(!P)return;
    ['healUp','spellPow','buffT','debT','rngPow','tauntDef'].forEach(k=>{if(P[k])S[k]=(S[k]||0)+P[k];});if(P.status)S.status=(S.status||1)*P.status;});}catch(e){}});
// spellPow is read by calcDamage only when a weapon is held (S.wp), which every hero has; Kunai Pouch and Warden's Badge need their own hook
HOOK.after('calcDamage','roles','ranged power, taunt defence (roles)',function(r,a,sk,t){try{if(!r||!r.dmg||!a||!t||(G&&G.daily))return;let m=1;
  if(a.side==='p'&&a.S&&a.S.rngPow&&deliveryOf(a,sk)==='ranged')m*=1+a.S.rngPow;
  if(t.side==='p'&&t.S&&t.S.tauntDef&&has(t,'taunt'))m*=1-t.S.tauntDef;
  if(m!==1)r.dmg=Math.max(1,Math.round(r.dmg*m));}catch(e){}});

// ---- measuring a role (deterministic: no RNG draws, no battle state) ----
// roleOut(c,role): what hero c delivers in that role, per action, from its known skills (see ROLES in config.js for the weights).
function rlDummy(lv,ty){const S={mhp:9999,def:6+1.8*lv,res:6+1.8*lv,atk:(9+2.7*lv)*FOE_POW,mag:(9+2.7*lv)*FOE_POW,spd:8,eva:0,elBoost:{},elRes:{},crit:0,critDmg:1.5,tempo:1};
  return {side:'e',name:'Dummy',base:'__rl_dummy',el:['__none'],lv,S,hp:9999,st:{},ty:ty||[]};}
function rlDmg(c,sk,t){const s=Object.assign({},sk,{el:null,fx:null,execute:0,afflicted:0});const r0=RNG,b0=B;let d=0;
  try{RNG=()=>.5;B=null;d=calcDamage(c,s,t).dmg;}finally{RNG=r0;B=b0;}return d*(sk.hits||1);}
const rlTg=sk=>sk.t==='all'||sk.t==='allyAll'||sk.t==='rand'?ROLES.w.area:sk.t==='self'?ROLES.w.self:1;
function rlKit(c){return known(c).filter(s=>!s.bond&&!s.limit&&!s.cap&&!/^sg_/.test(s.id)).concat([ATTACK]);}
function roleOut(c,role){const K=rlKit(c),W=ROLES.w,S=c.S,V=[];const top=v=>{if(v>0)V.push(v);};
  if(role==='phys'||role==='magic'||role==='ranged'){const t=rlDummy(c.lv,role==='ranged'?['flying']:[]);
    K.forEach(s=>{if(!(s.k==='phys'||s.k==='mag'))return;if(role==='phys'&&(s.k!=='phys'||(s.id!=='attack'&&deliveryOf(c,s)==='ranged')))return;if(role==='magic'&&s.k!=='mag')return;
      if(role==='ranged'&&deliveryOf(c,s)!=='ranged')return;top(rlDmg(c,s,t)*(s.t==='rand'?1:rlTg(s))/(s.cost||1));});}
  else if(role==='healer'){K.forEach(s=>{if(s.k!=='heal')return;top(s.pw*rlHealP(c,s)*(1+(S.healUp||0))*rlTg(s)/(s.cost||1));});}
  else if(role==='buffer'){K.forEach(s=>{const fx=s.k==='status'&&s.t!=='one'&&s.t!=='all'?(s.fx||[]):s.k==='heal'?(s.fx||[]):[];const al=(s.allyFx||[]);let v=0;
      fx.concat(al).forEach(([k])=>{if(STS[k]&&!STS[k].bad&&W.buff[k])v+=W.buff[k]*(STS[k].t+(S.buffT||0))*(al.some(q=>q[0]===k)?W.area:rlTg(s));});
      if(s.k==='status'&&s.heal)v+=s.heal*10*rlTg(s);top(v/(s.cost||1));});}
  else if(role==='debuffer'){K.forEach(s=>{let v=0;(s.fx||[]).forEach(([k,ch])=>{if(!STS[k]||!STS[k].bad||!W.debuff[k])return;
      const m=k==='stun'&&S.stun?S.stun:k==='bleed'&&S.bleed?S.bleed:(S.status||1);v+=Math.min(1,ch*m)*W.debuff[k]*(STS[k].t+(S.debT||0));});
      if(s.k==='status'||s.k==='phys'||s.k==='mag')top(v*(s.t==='all'?W.area:1)/(s.cost||1));});}
  else if(role==='tank'){const A=(9+2.7*c.lv)*FOE_POW*W.tankRef,frac=A/(A+S.def);let v=S.mhp/frac;
    const taunt=K.some(s=>(s.fx||[]).some(q=>q[0]==='taunt')),bw=K.some(s=>s.k==='status'&&(s.t==='self'||s.t==='allyAll')&&(s.fx||[]).some(q=>q[0]==='bulwark'));
    if(!taunt)v*=W.tauntless;if(bw)v/=.7;return v;}
  return V.sort((a,b)=>b-a).slice(0,W.top||1).reduce((a,b)=>a+b,0);}
// a measuring hero: class reference id, level, the class's standard weapon and armor at a tier, points spent by preference, a neutral nature
// the measuring heroes are plain class templates (no signature skill, no hero quirk) that only exist while rlWith runs
function rlWith(fn){const add=[];Object.keys(ROLES.cls).forEach(cls=>{const id='_rl_'+cls,r=TPL[ROLES.ref[cls]];if(!r||!CLS[cls]||TPL[id])return;
    TPL[id]={id,n:CLS[cls].n,cls,el:[r.el[0]],trait:'keen',src:'s',bio:'',look:r.look};add.push(id);});
  try{return fn();}finally{add.forEach(id=>{delete TPL[id];});}}
function rlRef(cls,lv,tier,wfam){const id='_rl_'+cls;if(!TPL[id])return null;const f=CF[cls],pr=CLS[cls].pref,pat=[0,1,0,2,0,1],al={},n=Math.floor(lv/2);
  for(let i=0;i<n;i++){const k=pr[pat[i%6]];al[k]=(al[k]||0)+1;}
  const c={id,name:TPL[id].n,el:TPL[id].el,side:'p',lv,xp:0,eq:{w:'w_'+(wfam||f[0])+'_'+tier,a:'a_'+f[1]+'_'+tier,c:null},alloc:al,pts:0,st:{},nat:'keen',hp:1,mp:1};
  c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;return c;}
// share of the dedicated class's primary output, for every role of every class (same level and tier)
function roleTable(lv,tier){return rlWith(()=>roleTable0(lv,tier));}
function roleTable0(lv,tier){lv=lv||ROLES.lv;tier=tier==null?ROLES.tier:tier;const out={},ded={};
  Object.keys(ROLES.ded).forEach(r=>{const c=rlRef(ROLES.ded[r],lv,tier);ded[r]=c?roleOut(c,r):0;});
  Object.keys(ROLES.cls).forEach(cls=>{const c=rlRef(cls,lv,tier);if(!c)return;const R=ROLES.cls[cls],o={};
    [R.p].concat(R.s).forEach(r=>{o[r]=ded[r]?+(roleOut(c,r)/ded[r]).toFixed(3):0;});out[cls]={primary:R.p,secondary:R.s.slice(),share:o};});
  return out;}
// for party scoring: the hero's roles, whether its kit already delivers them at its level, and its output share against a
// dedicated class hero of the same level and tier (cached per hero, level and weapon)
const RLC={};
function heroRoleSet(c){return rlWith(()=>heroRoleSet0(c));}
function heroRoleSet0(c){const t=c&&TPL[c.id];if(!t)return null;const R=ROLES.cls[t.cls];if(!R)return {cls:t.cls,primary:null,secondary:[],has:{},out:{}};
  const key=c.id+':'+c.lv+':'+(c.eq&&c.eq.w)+':'+(c.eq&&c.eq.c);if(RLC[key])return RLC[key];
  const tier=Math.max(0,Math.min(5,(gearOf(c.eq&&c.eq.w)||{}).tier||0)),out={},has={};
  [R.p].concat(R.s).forEach(r=>{const d=rlRef(ROLES.ded[r],c.lv,tier),dv=d?roleOut(d,r):0,v=roleOut(c,r);out[r]=dv?+(v/dv).toFixed(3):0;
    has[r]=r===R.p?true:known(c).some(s=>s.rl===r)||out[r]>=ROLES.band[0];});
  return RLC[key]={cls:t.cls,primary:R.p,secondary:R.s.slice(),has,out};}
const roleName=r=>ROLES.names[r]||r;
// the class card names the roles
if(typeof classCard==='function'){const cc0=classCard;classCard=function(cls){const h=cc0.apply(this,arguments),R=ROLES.cls[cls];if(!R)return h;
  const line=`<small class="rlline"><b>Role</b> ${esc(roleName(R.p))} · <b>Also</b> ${R.s.map(r=>esc(roleName(r))).join(', ')}</small>`;
  return h.replace(/<\/div>\s*$/,line+'</div>');};}
