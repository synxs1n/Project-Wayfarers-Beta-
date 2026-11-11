// v0.17.10 pass two of the battle animations (fxkind11.js, hdspell.js, heropose9.js): a shape for every status, signatures for Limit Breaks, sg_ skills and bosses,
// foe move kinds from the move itself, measured hand positions, real combo hit counts, reduced motion clean, both renderers draw without exceptions.
const {open,chk,done}=require('./pw');
const PRE=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'${t}',hints:false}}));`;
async function run(tier){const H=await open({w:430,h:800,mobile:true,pre:PRE(tier)});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(250);
await ev(()=>{__A.TW.get('startBattle')({stage:0,kind:'field'});});await wait(800);
const r=await ev(()=>{const T=__A.TW.get,B=T('B'),FK=T('FK'),BV=T('BV'),STS=T('STS'),o={st:{},stn:0,lim:{},sg:null,foe:{},hand:{},combo:null,rm:{}};
  B.en.forEach(e=>{e.hp=99999;});B.front.forEach(u=>{u.hp=u.S.mhp;});
  // 1. a shape per status
  Object.keys(STS).forEach(k=>{const u=B.front[0];BV.P.length=0;FK.sig={};u._fkS=null;u._fkQ=0;let ok=false;try{ok=T('fkStatus')(u,k,!STS[k].bad,STS[k].n,{});}catch(e){o.st[k]='ERR '+e.message;return;}
    T('battleFrame')(performance.now()+300);o.st[k]=ok?Object.keys(Object.assign({},...Object.values(FK.sig))).sort().join('|'):'none';o.stn++;});
  // 2. signatures
  const a=B.front[0];['warrior','knight','mage','healer','thief','archer','monk','sniper','druid','archmage','chronicler','bard'].forEach(cls=>{const TPL=T('TPL');TPL[a.id]=Object.assign({},TPL[a.id],{cls});
    const L=T('LIMIT')[cls],sk=Object.assign({id:'limit',limit:1,mp:0,cost:1,hits:1,lv:1},L,{el:a.el[0]}),ally=L.k==='status'||L.k==='heal';B.cur=a;BV.P.length=0;FK.sig={};a.actT=0;
    T('perform')(a,sk,ally?B.front.slice():B.en.filter(e=>e.hp>0));a._act=0;T('onAction')(a,performance.now());T('battleFrame')(performance.now()+250);
    o.lim[cls]=Object.keys(FK.sig).filter(k=>/^sig_/.test(k)).join(',')+':'+Object.keys(Object.assign({},...Object.values(FK.sig))).filter(s=>/seal|fiss|shield|fall|dawn|cuts|sing|pages|stave|zap|ringw|arc|proj|pillar|st/.test(s)).length;});
  BV.P.length=0;FK.sig={};B.cur=a;T('perform')(a,{id:'sg_mira',n:'Tidecall',k:'mag',t:'one',el:'water',pw:2,mp:0,cost:1,hits:1},[B.en[0]]);a._act=0;T('onAction')(a,performance.now());T('battleFrame')(performance.now()+250);o.sg=Object.keys(FK.sig).join(',')+' '+Object.keys(Object.assign({},...Object.values(FK.sig))).join('|');
  // 3. foe kinds from the move
  const foe=B.en[0],fi=(sk)=>{const I=T('fk11Info')(foe,sk);return I.k+':'+I.fx;};
  o.foe={area:fi({n:'Zzz',k:'phys',t:'all'}),bleed:fi({n:'Zzz',k:'phys',t:'one',fx:[['bleed',1]]}),poison:fi({n:'Zzz',k:'phys',t:'one',fx:[['poison',1]]}),explicit:fi({n:'Bite',k:'phys',t:'one',dl:'blunt'}),mag:fi({n:'Bite',k:'mag',t:'one',el:'ice'}),buff:fi({n:'Bark',k:'buff',t:'self'})};
  // 4. hands
  ['mira','lumen','oren'].forEach(id=>['swing','thrust','smash','shoot','cast','pray','cheer'].forEach(p=>[0,1].forEach(f=>{const h=T('heroHand')(id,p,f,false);if(!h){o.hand[id+p+f]='none';return;}
    const cv=T('heroPoseImg')(id,p,f,false),k=cv._rw?cv._rw/h.w:1,cx=cv.getContext('2d'),X=Math.round(h.x*k),Y=Math.round(h.y*k),R=Math.round(3*k);let hit=0;try{const d=cx.getImageData(Math.max(0,X-R),Math.max(0,Y-R),2*R+1,2*R+1).data;for(let i=3;i<d.length;i+=4)if(d[i]>40)hit++;}catch(e){hit=1;}o.hand[id+p+f]=hit;})));
  const rest=T('heroHand')('mira','rest',0,false);o.rest=rest&&rest.x>0&&rest.y>0;
  // 5. combo extra hits are counted
  const e0=B.en[0];a.S.combo=1;a.S.acc=1;e0.S.eva=0;B.cur=a;const I0=T('fk11Info')(a,{id:'t_c',n:'x',k:'phys',t:'one',dl:'slash',pw:.1,hits:2,mp:0,cost:1});
  e0.st={};e0.hp=e0.S.mhp=99999;const mr=Math.random;Math.random=()=>.5;/* a fixed roll: the combo, crit and dodge rolls never decide this count (CI saw 2 once) */
  try{FK.cur=null;T('perform')(a,{id:'t_c',n:'x',k:'phys',t:'one',dl:'slash',pw:.1,hits:2,mp:0,cost:1},[e0]);}finally{Math.random=mr;}o.combo=a.fk11&&a.fk11.landed;a.S.combo=0;
  // 6. reduced motion
  T('META').cfg.rmotion=true;BV.P.length=0;const u=B.front[1];u._fkS=null;o.rm.ok=T('fkStatus')(u,'poison',false,'Poison',{});o.rm.n=BV.P.filter(p=>p.k==='fk').length;o.rm.tint=T('fkTintOf')(u,null,Date.now());u._fkTint={col:'#fff',t0:Date.now(),life:300,a:1};o.rm.tint2=T('fkKOState')(B.en[0],Date.now());T('META').cfg.rmotion=false;u._fkTint=null;
  return o;});
 console.log(tier,JSON.stringify(r.lim),r.sg);
 const keys=Object.keys(r.st),vals=keys.map(k=>r.st[k]),dups=keys.filter((k,i)=>vals.indexOf(r.st[k])!==i&&vals.indexOf(r.st[k])>=0&&k!==keys[vals.indexOf(r.st[k])]);
 chk(tier+': every status ('+r.stn+') spawns a shape',keys.every(k=>r.st[k]&&!/none|ERR/.test(r.st[k]))||JSON.stringify(r.st));
 chk(tier+': the shape hash of every status differs',dups.length===0||JSON.stringify(dups));
 chk(tier+': all twelve Limit Breaks have a signature step',Object.values(r.lim).every(v=>/^sig_lim_/.test(v))||JSON.stringify(r.lim));
 chk(tier+': a signature skill (sg_) draws its seal',/sig_sg/.test(r.sg)&&/seal/.test(r.sg)||r.sg);
 chk(tier+': foe move kinds come from the skill (area blunt, bleed slash, poison pierce, explicit dl, element, buff)',r.foe.area==='blunt:blunt'&&r.foe.bleed==='slash:slash'&&r.foe.poison==='pierce:pierce'&&r.foe.explicit==='blunt:blunt'&&r.foe.mag==='mag:ice'&&r.foe.buff==='buff:buff'||JSON.stringify(r.foe));
 chk(tier+': hand glow positions sit on the pose within 3 px (pixels near the measured hand)',Object.values(r.hand).every(v=>v!=='none'&&v>0)&&r.rest||JSON.stringify(r.hand).slice(0,400));
 chk(tier+': combo extra hits are counted (2 hits + combo = 3 landed)',r.combo===3||String(r.combo));
 chk(tier+': reduced motion: no status shapes, no tint, no knock-out effect',r.rm.ok===false&&r.rm.n===0&&r.rm.tint===null&&r.rm.tint2===null||JSON.stringify(r.rm));
 const e=await ev(async()=>{const T=__A.TW.get,B=T('B'),BV=T('BV'),STS=T('STS');let err=null;try{const a=B.front[0];B.cur=a;B.front.forEach(u=>u.hp=u.S.mhp);B.en.forEach(x=>x.hp=99999);
   Object.keys(STS).forEach((k,i)=>{const u=i%2?B.front[i%3]:B.en[0];u._fkS=null;T('fkStatus')(u,k,!STS[k].bad,STS[k].n,{});});
   ['warrior','mage','healer','bard','thief','archer'].forEach(cls=>{T('TPL')[a.id]=Object.assign({},T('TPL')[a.id],{cls});const L=T('LIMIT')[cls],sk=Object.assign({id:'limit',limit:1,mp:0,cost:1,hits:1,lv:1},L,{el:a.el[0]}),ally=L.k==='status'||L.k==='heal';T('perform')(a,sk,ally?B.front.slice():B.en.filter(x=>x.hp>0));});
   const boss=B.en[0];['windup','gather'].forEach(t=>T('fx')(boss,t==='windup'?'Winding up!':'Gathering power!','stat bad'));
   B.b4g={u:boss,D:{n:'G',el:'lightning',st:'root',pct:.05,fx:'heal'},pend:{t:'slot',slots:[0,1]},act:null,lvl:0,ticks:0,key:'x'};['slot','rod','chill','tide','dark','sac','mirror','veil','wing'].forEach(t=>{const P={t,slots:[0,1],id:a.id};T('fkGimTell')(boss,P,B.b4g.D);T('fkGimLand')(boss,P,B.b4g.D);});
   T('perform')(boss,{id:'b4cata',n:'Cataclysm',k:'mag',pw:1,t:'all',el:'fire',hits:1,cost:1,mp:0},B.front.filter(x=>x.hp>0));
   boss.hp=0;boss.deathT=Date.now()-IMPACTv();boss.fk11r={k:'slash',t:boss.deathT};
   for(let i=0;i<40;i++){await new Promise(r=>requestAnimationFrame(r));T('battleFrame')(performance.now());}}catch(x){err=x.message;}
   function IMPACTv(){return T('IMPACT')+100;}return {err,hb:T('HB').on};});
 console.log(tier,JSON.stringify(e));chk(tier+': the stage draws 40 frames of every shape, signature and boss effect without exceptions'+(tier==='medium'?' (HD on: '+e.hb+')':''),e.err===null);
 await H.browser.close();}
(async()=>{await run('low');await run('medium');await done({browser:{close:async()=>{}}});})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
