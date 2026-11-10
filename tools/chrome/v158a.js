// v0.17.7 fxkind11.js (one effect vocabulary per kind of skill), hdspell.js hbsKind, heropose9.js multi-hit frames, anim10.js (spin for slash only):
// every player skill maps to a kind effect, distinct effects per kind (hash of the particle spec), a hero pose per kind, a foe recoil per kind,
// reduced motion draws nothing, both stage renderers (Low 2D, Medium HD) draw without exceptions.
const {open,chk,done}=require('./pw');
const PRE=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'${t}',hints:false}}));`;
async function run(tier){const H=await open({w:430,h:800,mobile:true,pre:PRE(tier)});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(250);
if(tier==='low'){
 const r=await ev(()=>{const T=__A.TW.get,TPL=T('TPL'),o={n:0,bad:[],kinds:{}};const FX='slash blunt pierce ranged fire water earth wind lightning ice light shadow arcane heal buff debuff song'.split(' ');
  Object.keys(TPL).filter(k=>TPL[k].cls&&!TPL[k].mon).forEach(id=>{const a={id,side:'p',S:{}};T('classSkills')(TPL[id]).forEach(sk=>{o.n++;try{const I=T('fk11Info')(a,sk);if(!I||!FX.includes(I.fx))o.bad.push(sk.id+':'+(I&&I.fx));else o.kinds[I.fx]=(o.kinds[I.fx]||0)+1;}catch(e){o.bad.push(sk.id+' '+e.message);}});});
  T('LIMIT');Object.values(T('LIMIT')).concat(Object.values(T('LIMIT2'))).forEach(s=>{const I=T('fk11Info')({id:'mira',side:'p',S:{}},Object.assign({id:'lim',limit:1},s));if(!I||!I.lim)o.bad.push('limit '+s.n);});return o;});
 console.log(JSON.stringify(r));
 chk('every player skill ('+r.n+') maps to a kind effect',r.n>250&&r.bad.length===0||JSON.stringify(r.bad.slice(0,6)));
 chk('every kind is used by some skill',['slash','blunt','pierce','ranged','heal','buff','debuff','fire','shadow'].every(k=>r.kinds[k])||JSON.stringify(r.kinds));
}
await ev(()=>{__A.TW.get('startBattle')({stage:0,kind:'field'});});await wait(800);
const r=await ev(()=>{const T=__A.TW.get,B=T('B'),FK=T('FK'),BV=T('BV'),o={sig:{},poses:{},rec:{},parts:{}};
  const SPECS={slash:{k:'phys',t:'one',dl:'slash'},blunt:{k:'phys',t:'one',dl:'blunt'},pierce:{k:'phys',t:'one',dl:'piercing'},ranged:{k:'phys',t:'one',dl:'ranged'},
   fire:{k:'mag',t:'one',el:'fire'},water:{k:'mag',t:'one',el:'water'},earth:{k:'mag',t:'one',el:'earth'},wind:{k:'mag',t:'one',el:'wind'},lightning:{k:'mag',t:'one',el:'lightning'},ice:{k:'mag',t:'one',el:'ice'},light:{k:'mag',t:'one',el:'light'},shadow:{k:'mag',t:'one',el:'shadow'},
   heal:{k:'heal',t:'ally'},buff:{k:'status',t:'ally',fx:[['might',1]]},debuff:{k:'status',t:'one',fx:[['weaken',1]]}};
  B.front.forEach(u=>u.hp=Math.floor(u.S.mhp*.5));B.en.forEach(e=>{e.hp=99999;});
  Object.keys(SPECS).forEach(n=>{const sk=Object.assign({id:'t_'+n,n:'T '+n,pw:1,mp:0,cost:1,hits:1},SPECS[n]),a=B.front[0];B.cur=a;
    const tg=sk.t==='ally'?[B.front[1]]:[B.en[0]];BV.P.length=0;FK.sig={};a.actT=0;T('perform')(a,sk,tg);const now=performance.now();a._act=0;T('onAction')(a,now);
    T('battleFrame')(now+50);T('battleFrame')(now+250);o.sig[n]=Object.assign({},...Object.values(FK.sig));o.parts[n]=BV.P.length;
    const I=a.fk11,po=T('heroPoseFor')(sk,I.dl,'swing');o.poses[n]=po;
    const f=B.en[0];f.hitT=Date.now()-T('IMPACT')-60;f.fk11r={k:I.k,el:I.el,fx:I.fx,t:f.hitT};const rc=T('fk11Recoil')(f,T('unitBox')(f),Date.now());o.rec[n]=rc?[+rc.dx.toFixed(1),+rc.dy.toFixed(1),+rc.sx.toFixed(2),+rc.sy.toFixed(2),rc.tint?1:0].join(','):null;});
  o.hash=Object.fromEntries(Object.keys(o.sig).map(k=>[k,Object.keys(o.sig[k]).sort().join('|')]));
  // reduced motion
  T('META').cfg.rmotion=true;BV.P.length=0;const a=B.front[0],f=B.en[0];B.cur=a;T('perform')(a,{id:'t_rm',n:'RM',k:'phys',t:'one',dl:'blunt',pw:1,mp:0,cost:1,hits:1},[f]);a._act=0;T('onAction')(a,performance.now());T('battleFrame')(performance.now()+20);
  o.rmParts=BV.P.filter(p=>p.k==='fk').length;o.rmRec=T('fk11Recoil')(f,T('unitBox')(f),Date.now());T('META').cfg.rmotion=false;
  // multi hit count + all foes
  BV.P.length=0;B.cur=a;T('perform')(a,{id:'t_m',n:'Multi',k:'phys',t:'one',dl:'slash',pw:.5,mp:0,cost:1,hits:3},[B.en[0]]);a._act=0;T('onAction')(a,performance.now());o.cnt=BV.P.filter(p=>p.k==='fk'&&p.s==='cnt').length;o.arcs=BV.P.filter(p=>p.k==='fk'&&p.s==='arc').length;
  return o;});
 console.log(tier,JSON.stringify(r.rec));
 const ks=Object.keys(r.hash);const dup=ks.filter((k,i)=>ks.some((j,m)=>m<i&&r.hash[j]===r.hash[k]));
 chk(tier+': each kind and element spawns effects',ks.every(k=>r.parts[k]>=3)||JSON.stringify(r.parts));
 chk(tier+': the particle spec of every kind differs (hash of shapes and colours)',dup.length===0||JSON.stringify(dup));
 chk(tier+': slash/blunt/pierce/ranged have their own signature shape (arc, shock, thr, proj)',/arc/.test(r.hash.slash)&&/shock/.test(r.hash.blunt)&&/thr/.test(r.hash.pierce)&&/proj/.test(r.hash.ranged)||JSON.stringify(r.hash));
 chk(tier+': hero pose per kind (swing smash thrust shoot cast pray cheer)',r.poses.slash==='swing'&&r.poses.blunt==='smash'&&r.poses.pierce==='thrust'&&r.poses.ranged==='shoot'&&r.poses.fire==='cast'&&r.poses.heal==='pray'&&r.poses.buff==='cheer'||JSON.stringify(r.poses));
 chk(tier+': foe recoil differs per kind taken (jolt, squash, jab, hop, flash tint)',new Set(['slash','blunt','pierce','ranged','fire'].map(k=>r.rec[k])).size===5&&r.rec.fire.endsWith(',1')||JSON.stringify(r.rec));
 chk(tier+': reduced motion: no kind particles and no recoil',r.rmParts===0&&r.rmRec===null||JSON.stringify([r.rmParts,r.rmRec]));
 chk(tier+': a multi-hit skill repeats its arc and shows a count',r.cnt>=1&&r.arcs>=3||JSON.stringify([r.cnt,r.arcs]));
 // both renderers draw frames with every effect alive
 const e=await ev(async()=>{const T=__A.TW.get,B=T('B'),BV=T('BV');let err=null;try{const a=B.front[0];B.cur=a;
   [['slash','one'],['blunt','all'],['pierce','all'],['ranged','all']].forEach(([d,t])=>{T('perform')(a,{id:'t_'+d,n:'x',k:'phys',t,dl:d,pw:1,mp:0,cost:1,hits:2},t==='all'?B.en.filter(x=>x.hp>0):[B.en[0]]);});
   ['fire','water','earth','wind','lightning','ice','light','shadow'].forEach(el=>T('perform')(a,{id:'t_'+el,n:'x',k:'mag',t:'all',el,pw:2,mp:0,cost:1,hits:1},B.en.filter(x=>x.hp>0)));
   T('perform')(a,{id:'t_l',n:'Limit',k:'phys',t:'all',dl:'slash',pw:2,limit:1,mp:0,cost:1},B.en.filter(x=>x.hp>0));
   for(let i=0;i<30;i++){await new Promise(r=>requestAnimationFrame(r));T('battleFrame')(performance.now());}}catch(x){err=x.message;}return {err,hb:T('HB').on,left:BV.P.length};});
 console.log(tier,JSON.stringify(e));chk(tier+': the stage draws 30 frames of every effect without exceptions'+(tier==='medium'?' (HD on: '+e.hb+')':''),e.err===null);
 await H.browser.close();}
(async()=>{await run('low');await run('medium');await done({browser:{close:async()=>{}}});})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
