// ===== skills12.js (v0.19): Focus, the 12 skill kit, dual types, dual arts, role power, tavern primer and detonator needs =====
// The owner's brief (five items), all of it new behaviour in this module, with its numbers in config.js (FOCUS, SK12, ROLEPW) and the tables it reads in
// skills.js (COMBO, ROLE_FILL), roles9.js (ROLE9.cls) and natures6.js (NAT6 .rl).
// 1) Focus: +FOCUS.crit critical chance for FOCUS.turns of the holder's turns, on every damage skill. It is no longer spent by the first attack.
// 2) Dual arts (COMBO, the `combo` skill of a two element hero) are physical for a physical class (SK12.physCls) and magic for the rest. The kind of a
//    physical art then follows dmg11.js (the weapon in hand).
// (v0.19.2: kits12.js reworks the Primer / Detonator guarantee and the identity skills; see its header)
// 3) Kits: classSkills ends with this module's hook, so everything that lists or learns a class's skills sees the same list. A hero learns at most SK12.cap
//    class skills (Limit Breaks, bond techs, Archive skills and the basic Attack are outside it). Dual types lose the elemental ultimates (SK12.ult) and are
//    guaranteed one Primer and one Detonator per element (a spare skill is retagged, else a filler is added). Which skills survive the cap: guarantees,
//    the dual art, the signature skill, one skill for each of the class's roles, the single types' ultimates, the first heals, then the rest by level.
//    A dual art primes a foe with both of its elements and sets off the reaction of each of its elements on a prime.
// 4) Role power: sk12Role names the role of a skill, sk12Mult the multiplier (ROLEPW) from where that role sits in the hero's class role list, plus the
//    lift of a nature that leans into that role. roles9.js applies it in known(). The sheet and battle rows show it.
// 5) heroPrimeDet(id,lv): {P,D} for the tavern and the recruit fit (heroRoles in roles9.js is the role list, not this).
const S12={cur:null,msg:null};
// ---- 1. Focus ----
try{STS.focus.t=FOCUS.turns;STS.focus.d=`+${Math.round(FOCUS.crit*100)}% critical chance for ${FOCUS.turns} turns. It is not used up by attacking.`;}catch(e){}
HOOK.wrap('calcDamage','skills12','Focus adds crit chance for its turns (it no longer forces the next crit)',function(next,...args){const a=args[0],f=a&&a.st&&a.st.focus;if(!f||!a.S)return next(...args);
  delete a.st.focus;const c0=a.S.crit,had=Object.prototype.hasOwnProperty.call(a.S,'crit');a.S.crit=(c0||.05)+FOCUS.crit;
  try{return next(...args);}finally{if(had)a.S.crit=c0;else delete a.S.crit;a.st.focus=f;}});

// ---- skill roles (3, 4) ----
const S12_RANGED=['archer','sniper','druid'];
// the role a skill belongs to (null: the hero's own, never scaled)
function sk12Role(cls,s){if(!s)return null;if(s.rl)return s.rl;const k=s.k,fx=s.fx||[];
  if(k==='heal'||k==='revive')return 'healer';
  if(k==='mag')return 'magic';
  if(k==='phys')return s.dl==='ranged'||(!s.dl&&S12_RANGED.includes(cls))?'ranged':'phys';
  if(k==='status'){const ally=s.t==='self'||s.t==='ally'||s.t==='allyAll';if(!ally)return 'debuffer';const g=fx.map(f=>f[0]);
    if(g.includes('taunt')||g.includes('bulwark')||g.includes('ward'))return 'tank';if(g.length&&g.every(x=>x==='regen'))return 'healer';return 'buffer';}
  return null;}
function sk12Nat(c){try{const n=natInfo(natOf(c));return n&&n.rl||null;}catch(e){return null;}}
// {m, tier:'primary'|'secondary'|'off', r, nat} or null for skills that are never scaled
function sk12Mult(c,s){try{const t=c&&TPL[c.id];if(!t||!s||s.bond||s.limit||s.id==='attack'||(G&&G.daily))return null;const r=sk12Role(t.cls,s);if(!r)return null;
  const R=heroRoles(c),main=heroMain(c);let m,tier;
  if(r===main){m=ROLEPW.primary;tier='primary';}else if(R.includes(r)){m=ROLEPW.secondary;tier='secondary';}else{m=ROLEPW.off;tier='off';}
  if(tier==='off'&&(s.role||s.combo)&&(s.k==='phys'||s.k==='mag')){m=ROLEPW.secondary;tier='secondary';}
  let nat=false;if(tier!=='primary'&&sk12Nat(c)===r){m=Math.min(ROLEPW.natCap,m+ROLEPW.natLift);nat=true;}
  return {m:+m.toFixed(3),tier,r,nat};}catch(e){return null;}}
const sk12Pc=m=>Math.round(m*100)+'%';
function sk12Tag(o){return o&&o.tier!=='primary'?`<i class="sk12r ${o.tier}" title="${o.tier==='off'?'Off role':'Secondary role'} for this class: power x${sk12Pc(o.m)}${o.nat?' (includes the nature\'s lift)':''}">${o.tier==='off'?'Off':'Sub'} x${sk12Pc(o.m)}</i>`:'';}
// off-role buffs last a turn shorter
HOOK.wrap('perform','skills12','off role buffs last shorter',function(next,...args){const a=args[0],sk=args[1],cut=sk&&sk.buffCut;if(!cut||!a||!a.S)return next(...args);
  const b0=a.S.buffT;a.S.buffT=(b0||0)-cut;try{return next(...args);}finally{a.S.buffT=b0;}});

// ---- 3. kits ----
const s12Ult=(cls,s)=>!!(s&&s.el&&((SK12.ult[cls]||[]).includes(s.id)));
const s12Is=(s,role,e)=>s.role===role&&!s.combo&&skHitsFoe(s)&&(role==='primer'?skEls(s)[0]===e:skEls(s).includes(e));
const s12Lv=(a,b)=>a.lv-b.lv||(a.lv0||a.lv)-(b.lv0||b.lv);
// a dual type has a Primer and a Detonator of each of its elements. v0.19.2: kits12.js owns this (k12Guarantee: a skill is only ever given a role its name
// does not contradict, otherwise a filler in the class's voice is added); the hook below is the one definition
function s12Guarantee(t,S){return S.slice();}
s12Guarantee=HOOK.def('s12Guarantee',s12Guarantee);
function s12Roles(t){return ROLE9.cls[t.cls]||(ROLES.cls[t.cls]?[ROLES.cls[t.cls].p].concat(ROLES.cls[t.cls].s):[]);}
// how much a skill is worth to a role (the same weights roleOut uses, roles.js)
function s12Val(s,r){const W=ROLES.w,A=(s.t==='all'||s.t==='allyAll'||s.t==='rand')?W.area:s.t==='self'?W.self:1,c=s.cost||1;
  if(r==='phys'||r==='magic'||r==='ranged')return (s.pw||0)*(s.hits||1)*A/c;
  if(r==='healer')return (s.k==='heal'||s.k==='revive')?(s.pw||0)*A/c:((s.fx||[]).some(f=>f[0]==='regen')?.2:0);
  if(r==='buffer'||r==='tank'){let v=0;const fx=(s.k==='status'&&s.t!=='one'&&s.t!=='all')||s.k==='heal'?(s.fx||[]):[];fx.concat(s.allyFx||[]).forEach(([k])=>{if(STS[k]&&!STS[k].bad)v+=(W.buff[k]||.5);});return v*A/c+(s.heal||0)*3;}
  if(r==='debuffer'){let v=0;(s.fx||[]).forEach(([k,ch])=>{if(STS[k]&&STS[k].bad)v+=Math.min(1,ch||1)*(W.debuff[k]||.5);});return (s.k==='status'||s.k==='phys'||s.k==='mag')?v*A/c:0;}
  return 0;}
function s12Pick(t,S){const cap=SK12.cap,keep=new Set(),add=s=>{if(s&&!keep.has(s)&&keep.size<cap)keep.add(s);},by=f=>S.filter(f).sort(s12Lv);
  t.el.forEach(e=>['primer','det'].forEach(role=>add(by(s=>s12Is(s,role,e))[0])));
  by(s=>s.combo).forEach(add);by(s=>s.sig||/^sg_/.test(s.id)).forEach(add);
  S.slice().sort(s12Lv).slice(0,2).forEach(add);                       // a hero always has its first two moves
  by(s=>s12Ult(t.cls,s)).forEach(add);                                  // single types keep their ultimates
  // each of the class's roles keeps its two best skills (best by what the skill does for that role: roleOut credits any buff or debuff, whoever casts it)
  s12Roles(t).forEach(r=>{const dmg=r==='phys'||r==='magic'||r==='ranged';
    S.filter(s=>dmg?sk12Role(t.cls,s)===r:s12Val(s,r)>0).sort((a,b)=>s12Val(b,r)-s12Val(a,r)||s12Lv(a,b)).slice(0,2).forEach(add);});
  add(by(s=>s.k==='heal'&&s.t==='ally')[0]);add(by(s=>s.k==='heal'&&s.t==='allyAll')[0]);add(by(s=>s.k==='revive'||s.revive)[0]);
  S.slice().sort(s12Lv).forEach(add);
  return S.filter(s=>keep.has(s)).sort(s12Lv);}
s12Pick=HOOK.def('s12Pick',s12Pick);// v0.19.2: kits12.js brings back each class's identity skills after the cap
function s12Build(t,L){const cls=t.cls,dual=t.el.length>1,legend=t.src==='L'||t.src==='x';
  L.forEach(s=>{if(s.combo&&!s._k12){s._k12=1;const phys=SK12.physCls.includes(cls);if((s.k==='mag'&&phys)||(s.k==='phys'&&!phys)){s.k=phys?'phys':'mag';delete s.dl;try{const d=dlFor(cls,s);if(d)s.dl=d;}catch(x){}}}});
  let S=L;
  if(dual&&!SK12.dualUlt&&!(legend&&SK12.legendsKeepUlt))S=S.filter(s=>!s12Ult(cls,s));
  if(dual)S=s12Guarantee(t,S);
  if(S.length>SK12.cap)S=s12Pick(t,S);else if(S!==L)S=S.slice().sort(s12Lv);
  return S;}
const S12C={},S12FULL={};
HOOK.xform('classSkills','skills12','the 12 skill kit, dual type primers and detonators, dual art kind (last hook: sees the finished list)',function(L,t){
  if(!L||!t||t.mon||!CLS[t.cls])return L;const c=S12C[t.id];if(c&&c.L===L&&c.n===L.length)return c.out;
  let out=L;try{out=s12Build(t,L);}catch(e){out=L;}S12C[t.id]={L,n:L.length,out};S12FULL[t.id]=L;return out;});
// every skill the class could have had before the cap (for saves and the audit)
function sk12Full(t){classSkills(t);return S12FULL[t.id]||classSkills(t);}

// ---- dual arts: prime both elements, set off the reaction of both ----
function s12Score(e){let n=0;try{(B.front||[]).forEach(u=>{if(u.hp<=0)return;const c=G.roster[u.id];if(!c)return;known(c).forEach(s=>{if(s.role==='det'&&skEls(s).some(x=>reactFor(e,x)))n++;});});}catch(x){}return n;}
HOOK.wrap('perform','skills12','dual arts prime both elements and set off both reactions; a second prime element can be set off',function(next,...args){
  const a=args[0],sk=args[1],tg=args[2];if(!B||!a||a.side!=='p'||!sk||!tg||!(sk.k==='phys'||sk.k==='mag'))return next(...args);
  const els=skEls(sk),det=sk.role==='det',dual=!!sk.combo&&els.length>1&&skHitsFoe(sk);
  if(!det&&!dual)return next(...args);
  const was=new Map();tg.forEach(t=>{if(!t||t.side!=='e')return;was.set(t,!!t.primed);const P=t.primed;
    if(det&&P&&P.el2&&!els.some(x=>reactFor(P.el,x))&&els.some(x=>reactFor(P.el2,x))){const o=P.el;P.el=P.el2;P.el2=o;}});
  const prev=S12.cur;S12.cur=dual?sk:null;let r;
  try{r=next(...args);}finally{S12.cur=prev;}
  if(dual){const live=(B.en||[]);tg.forEach(t=>{if(!t||t.side!=='e'||t.hp<=0||t.primed||was.get(t)||!live.includes(t))return;
    const [e1,e2]=els,el=s12Score(e2)>s12Score(e1)?e2:e1,o=el===e1?e2:e1;t.primed={el,el2:o,t:2,by:a.name};t.primeT=Date.now();B.nPrime=(B.nPrime||0)+1;
    fx(t,'Primed: '+EL[el]+' + '+EL[o],'stat prime');try{if(typeof sfx==='function')sfx('prime');}catch(x){}log(`${t.name} is Primed with ${EL[el]} and ${EL[o]}.`);});}
  return r;});
HOOK.wrap('doReaction','skills12','a dual art sets off the reaction of each of its elements',function(next,...args){const a=args[0],t=args[1],sk=S12.cur,P=t&&t.primed;
  if(!sk||!P||!sk.combo)return next(...args);const els=skEls(sk),primes=[P.el].concat(P.el2?[P.el2]:[]);
  const pairs=[];els.forEach(de=>{const pe=primes.find(p=>reactFor(p,de));if(pe)pairs.push([pe,de]);});
  if(pairs.length<2){if(pairs.length===1)P.el=pairs[0][0];return next(a,t,pairs.length?pairs[0][1]:args[2]);}
  P.el=pairs[0][0];const R=next(a,t,pairs[0][1]);if(!R)return R;
  const R0=reactFor(pairs[1][0],pairs[1][1]);if(!R0)return R;
  const R2=Object.assign({},R0,{m:R0.m*DET_BONUS*((WX().react||{})[reactKey(pairs[1][0],pairs[1][1])]||1)});
  log(`${R2.n}! ${a.name}'s ${EL[pairs[1][1]]} detonates the ${EL[pairs[1][0]]} prime on ${t.name} as well.`);fx(t,R2.n,'react');B.nDet=(B.nDet||0)+1;
  const M=Object.assign({},R,{n:R.n+' + '+R2.n,m:1+(R.m-1)+(R2.m-1)*SK12.dualReact,fx:(R.fx||[]).concat(R2.fx||[]),strip:R.strip||R2.strip,selfFx:(R.selfFx||[]).concat(R2.selfFx||[]),
    allyFx:(R.allyFx||R2.allyFx)?(R.allyFx||[]).concat(R2.allyFx||[]):undefined,splash:Math.max(R.splash||0,R2.splash||0)||undefined});
  t.reactN=M.n;return M;});

// ---- old saves: nobody keeps a skill the new kit lacks, nobody loses a function ----
function s12Fn(s){if(s.role)return s.role+':'+(skEls(s)[0]||'');if(s.combo)return 'combo';return String(sk12Role('x',s))+':'+(s.t==='all'||s.t==='allyAll'?'all':'one');}
function s12Migrate(g){const lost={};let n=0;Object.keys(g.roster||{}).forEach(id=>{const c=g.roster[id],t=TPL[id];if(!c||!t||t.mon||!CLS[t.cls])return;
  const kit=classSkills(t),full=sk12Full(t),ids=new Set(kit.map(s=>s.id));
  if(c.keep){const k=c.keep.filter(x=>ids.has(x));if(k.length!==c.keep.length){if(k.length)c.keep=k;else delete c.keep;}}
  const gone=full.filter(s=>!ids.has(s.id)&&skillKnown(c,s)&&!s.gen);
  gone.forEach(d=>{const f=s12Fn(d);if(kit.some(s=>skillKnown(c,s)&&s12Fn(s)===f))return;const rep=kit.filter(s=>s12Fn(s)===f).sort(s12Lv)[0];if(rep&&!skillKnown(c,rep))c.keep=(c.keep||[]).concat(rep.id);});
  if(gone.length){lost[id]=gone.map(s=>s.n);n++;}});
  if(n&&!g.s12){g.s12=1;g.s12msg=`Class skills are capped at ${SK12.cap} per wayfarer now: ${n} of yours set aside some moves. Dual types no longer learn elemental ultimates.`;}
  return lost;}
HOOK.after('unpackG','skills12','trim old saves to the capped kit',function(g){try{s12Migrate(g);}catch(e){}});
HOOK.after('render','skills12','one notice after an old save is trimmed',function(){try{if(G&&G.s12msg&&V.screen!=='title'){const m=G.s12msg;delete G.s12msg;toast(m);}}catch(e){}});

// ---- skill rows show the role tier ----
HOOK.xform('cmdHtml','skills12','role tier on the battle skill rows',function(h){try{const a=B&&B.cur;if(!a||B.mode!=='cmd'||B.menu!=='skills')return h;
  known(a).forEach(s=>{if(!s.rlt)return;const tag=sk12Tag({m:s.rlm,tier:s.rlt,nat:s.rln});const re=new RegExp(`(<button class="mi [^"]*" data-act="sk" data-arg="${s.id}"[^>]*>[\\s\\S]*?<span class="sk11s">)`);h=h.replace(re,(m,p)=>p+tag);});}catch(e){}return h;});
HOOK.xform('mChar','skills12','role power on the hero sheet skill rows',function(h,id){try{const c=G.roster[id],t=TPL[id];if(!c||!t||G.daily)return h;const by={};classSkills(t).forEach(s=>{by[s.n]=s;});
  const tp=document.createElement('template');tp.innerHTML=h;let n=0;
  tp.content.querySelectorAll('.row').forEach(r=>{const b=r.querySelector(':scope>div>b'),e=r.querySelector('.sk11e'),sub=r.querySelector('.sk11s');if(!b||!e||!sub)return;const s=by[b.textContent.trim()];if(!s)return;
    const o=sk12Mult(c,s);if(!o)return;if(s.pw&&(s.k==='phys'||s.k==='mag'||s.k==='heal')&&/^Pow \d+$/.test(e.textContent.trim()))e.textContent='Pow '+Math.round(s.pw*o.m*100);
    if(o.tier!=='primary'){const w=document.createElement('template');w.innerHTML=sk12Tag(o);sub.insertBefore(w.content.firstChild,sub.firstChild);n++;}});
  return n?tp.innerHTML:h;}catch(e){return h;}});
try{const st=document.createElement('style');st.textContent='.sk12r{font-style:normal;color:#e8c9a0}.sk12r.off{color:#e0a0a0}';document.head.appendChild(st);}catch(e){}

// ---- 5. primer and detonator of a hero's kit at a level ({P,D}); the tavern and the recruit fit read it ----
function heroPrimeDet(id,lv){const r={P:false,D:false},t=TPL[id];if(!t||t.mon)return r;classSkills(t).forEach(s=>{if(s.lv<=lv&&s.role&&skHitsFoe(s)){if(s.role==='primer')r.P=true;if(s.role==='det')r.D=true;}});return r;}
try{window.__S12={get S12(){return S12;},kit:t=>classSkills(t),full:t=>sk12Full(t),role:(cls,s)=>sk12Role(cls,s),mult:(c,s)=>sk12Mult(c,s),pd:(id,lv)=>heroPrimeDet(id,lv),migrate:g=>s12Migrate(g),get TPL(){return TPL;},get CLS(){return CLS;}};}catch(e){}
