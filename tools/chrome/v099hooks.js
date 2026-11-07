// Beta v0.9.9 hook registry (v3/hooks.js, docs/v099-hooks.md). Checks: the core functions are each defined once (HOOK.def) with
// their hooks registered, none of them is still reassigned in v3/, and the game behaves exactly as the build before the pass
// (OLDHTML): one synchronous script, with Math.random seeded and the clocks frozen, starts a journey, opens every core popup,
// renders, builds maps, draws foes, fights (perform, calcDamage), wins, flees, loses and starts a new game, and every result
// (HTML, state, numbers) must match the old build's. Keys that differ between two runs of the same build are left out and listed.
// Usage: OLDHTML=<build before the pass> PWHTML=<this build> node v099hooks.js   (run from tools/chrome)
const fs=require('fs'),path=require('path');const {open,chk,done}=require('./pw');
const CORE=['render','startBattle','finishBattle','win','renderBattle','vModal','worldDraw','calcDamage','encounterFoes','settingsBody','getMap','perform','newGame','placeAt','genQuests','openChest'];
const SEQ=()=>{const A=__A,o={},T=k=>A.TW.get(k);let s=12345;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const T0=1700000000000;Date.now=()=>T0;try{performance.now=()=>5000;}catch(e){}try{A.B4.rng(Math.random);}catch(e){}// the engine's RNG starts as the native Math.random
  const J=x=>{try{return JSON.stringify(x);}catch(e){return 'ERR '+e.message;}};
  const t=(k,f)=>{try{const v=f();o[k]=typeof v==='string'?v:J(v);}catch(e){o[k]='THROW '+String(e&&e.message).slice(0,200);}};
  const modal=()=>{const m=document.getElementById('modal');return m?m.innerHTML:'';};
  const state=()=>{const G=A.G;return G?J({party:G.party,gold:G.gold,stats:G.stats,quests:G.quests,inv:G.inv,gear:G.gear,mats:G.mats,cleared:G.cleared,been:G.been,
    weather:G.weather,clock:G.clock,roster:Object.keys(G.roster).map(id=>{const c=G.roster[id];return [id,c.lv,c.xp,c.hp,c.mp,c.eq,c.ail,c.S&&[c.S.mhp,c.S.atk,c.S.mag,c.S.def,c.S.res,c.S.spd]];}),
    goals:G.goals,autoOk:G.autoOk,pcV:G.pcV,bonds:G.bonds,tv:G.tv,sub:G.sub}):null;};
  t('boot',()=>{A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();return A.V.screen+' '+A.G.party.join(',');});
  t('G.start',state);
  // popups: vModal straight and through render (withClose, the post-processing hooks)
  ['menu','settings','inn','tavern','smithy','workshop','beast','archivist','board','travel','guild','pause','slots','export','import','stuck','wxinfo','map','worldmap','autoset',
   'camp','bonds','bp','p3plan','upg','compPick','statInfo','field','ldMgr','ldRes','eqPick','autoEq','starterSheet','codexEntry','battlelore','portal','echoAsk','gmig','ngplus','dailyIntro','feedback','useitem']
    .forEach(ty=>{t('vm:'+ty,()=>T('vModal')({type:ty}));t('dom:'+ty,()=>{A.V.modal={type:ty};A.render();return modal()+'|'+A.V.screen;});A.V.modal=null;});
  t('vm:menu:party',()=>T('vModal')({type:'menu',tab:'party'}));t('vm:menu:quests',()=>T('vModal')({type:'menu',tab:'quests'}));
  t('vm:wxinfo:time',()=>T('vModal')({type:'wxinfo',kind:'time'}));t('vm:wxinfo:twist',()=>T('vModal')({type:'wxinfo',kind:'twist'}));
  t('settingsBody',()=>T('settingsBody')());
  A.V.modal=null;t('render.world',()=>{A.render();return document.getElementById('hdr').innerHTML.length+'|'+modal();});
  // maps, places, quests, chests
  t('getMap',()=>['t0','f0','d0','f1'].map(id=>{const m=T('getMap')(id);return m?[id,m.kind,m.w,m.h,m.t.join('').length,m.t.join('').split('').reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7),(m.chests||[]).length,m.d8||'',m.fort?1:0]:null;}));
  t('placeAt',()=>{const m=T('getMap')('f0');const e=m.start||[2,2];T('placeAt')('f0',e[0],e[1],'d');return [A.WS.m&&A.WS.m.id,A.WS.x,A.WS.y,A.G.been,A.G.weather];});
  t('genQuests',()=>{T('genQuests')(0);return A.G.quests;});
  t('openChest',()=>{const m=A.WS.m,c=(m.chests||[])[0];if(!c)return 'no chest';T('openChest')(c[0],c[1]);return [A.G.chests,A.G.gear,A.G.gold,A.V.gearQueue,A.WS.dlg?1:0];});
  A.WS.dlg=null;A.V.modal=null;
  // foes and battle
  t('encounterFoes',()=>[{stage:0,kind:'field'},{stage:1,kind:'field'},{stage:0,kind:'boss'},{stage:2,kind:'dungeon'},{stage:0,kind:'field',ambush:1}].map(sp=>T('encounterFoes')(sp).map(e=>[e.name,e.lv,e.el,Math.round(e.S.mhp),Math.round(e.S.atk)])));
  t('startBattle',()=>{const r=A.startBattle({stage:0,kind:'field',weather:'clear'});const B=A.B;return [r,B&&B.seed,B&&B.weather,B&&B.en.map(e=>[e.name,e.hp,+e.next.toFixed(4),e.plan&&e.plan.sk&&e.plan.sk.id]),B&&B.front.map(c=>[c.id,c.hp,+c.next.toFixed(4)]),A.V.auto];});
  t('renderBattle',()=>{A.render();const b=document.querySelector('.battle');return b?b.className+'|'+b.innerHTML.length:'none';});
  t('calcDamage',()=>{const B=A.B,sks=[T('ATTACK')].concat(T('classSkills')(T('TPL')[B.front[0].id]).filter(k=>k.k==='phys'||k.k==='mag'));
    return B.front.map(a=>B.en.map(e=>sks.map(k=>{const r=T('calcDamage')(a,k,e);return r&&[r.dmg,r.crit?1:0,r.em,r.am];})));});
  t('perform',()=>{const B=A.B,a=B.front[0],e=B.en[0];T('perform')(a,T('ATTACK'),[e]);const k=T('classSkills')(T('TPL')[a.id]).find(x=>x.k==='heal');if(k)T('perform')(a,k,[a]);return [e.hp,a.hp,a.mp,B.log.slice(-4),B.tP,B.tA,B.actN];});
  t('win',()=>{const B=A.B;B.en.forEach(e=>{e.hp=0;});A.win();const m=A.V.modal;return [m&&m.type,m&&m.info&&J(m.info),A.G.gold,modal().length];});
  t('finishBattle.win',()=>{A.finishBattle('win');return [A.V.screen,A.B?1:0];});
  t('G.afterWin',state);
  t('flee',()=>{A.startBattle({stage:0,kind:'field',weather:'clear'});A.finishBattle('fled');return [A.V.screen,A.G.stats,document.getElementById('toast')&&document.getElementById('toast').textContent];});
  t('boss',()=>{const r=A.startBattle({stage:0,kind:'boss'});const B=A.B;return [r,B&&B.en.map(e=>[e.name,e.hp,e.boss?1:0]),B&&B.autoLock,B&&B.b4mo];});
  t('lose',()=>{A.B.front.concat(A.B.back).forEach(c=>{c.hp=0;});T('lose')();const m=A.V.modal;return [m&&m.type,modal().length];});
  t('finishBattle.lose',()=>{A.finishBattle('lose');return A.V.screen;});
  t('G.afterLose',state);
  t('worldDraw',()=>{A.V.modal=null;A.V.screen='world';A.render();T('worldDraw')(1000);const c=A.WS.ctx&&A.WS.ctx.canvas;return c?[c.width,c.height]:'no canvas';});
  t('newGame',()=>{T('newGame')(['mira','lumen','oren']);return state();});
  o.__keys=Object.keys(o).length;return o;};
(async()=>{
  const NEW=fs.readFileSync(process.env.PWHTML||path.join(__dirname,'..','..','out','aurelis3.html'),'utf8');
  const run=async html=>{const H=await open({w:932,h:430,html});const r=await H.ev(SEQ);
    const hk=await H.ev(CORE=>{const H=__A.HOOK;if(!H)return null;return CORE.map(n=>{let f=null;try{f=__A.TW.get(n);}catch(e){}return [n,!!f&&f.hookName===n,H.list(n).length];});},CORE).catch(()=>null);
    await H.wait(300);await H.browser.close();return {r,hk};};
  // 1. the registry
  const n1=await run(NEW),n2=await run(NEW);
  chk('every core function is one HOOK.def dispatcher with its hooks',!!n1.hk&&n1.hk.every(([n,d,k])=>d&&k>0)||JSON.stringify(n1.hk));
  const src=fs.readdirSync(path.join(__dirname,'..','..','v3')).filter(f=>f.endsWith('.js')).map(f=>[f,fs.readFileSync(path.join(__dirname,'..','..','v3',f),'utf8')]);
  const left=[];CORE.forEach(n=>src.forEach(([f,s])=>{const re=new RegExp('(^|[^A-Za-z0-9_$.])'+n+'=(function|watchGear)','g');if(re.test(s))left.push(f+':'+n);}));
  chk('no core function is reassigned as a wrapper any more',!left.length||left.join(' '));
  // 2. old and new build give the same results
  const unstable=Object.keys(n1.r).filter(k=>n1.r[k]!==n2.r[k]);if(process.env.V99DBG)unstable.forEach(k=>{const a=String(n1.r[k]),b=String(n2.r[k]);let i=0;while(a[i]===b[i])i++;console.log('UNSTABLE',k,'at',i,'\n  1',a.slice(Math.max(0,i-200),i+300),'\n  2',b.slice(Math.max(0,i-200),i+300));});
  console.log('keys',n1.r.__keys,'unstable (differ between two runs of this build, left out):',unstable.join(', ')||'none');
  const thr=Object.keys(n1.r).filter(k=>String(n1.r[k]).startsWith('THROW'));console.log('throw in both builds (compared as text):',thr.join(', ')||'none');
  if(!process.env.OLDHTML){chk('OLDHTML is set (the build before the pass)','missing');await done({browser:{close:async()=>{}}});return;}
  const o=await run(fs.readFileSync(process.env.OLDHTML,'utf8'));
  const diff=Object.keys(n1.r).filter(k=>!unstable.includes(k)&&n1.r[k]!==o.r[k]);
  diff.forEach(k=>console.log('DIFF',k,'\n  old',String(o.r[k]).slice(0,400),'\n  new',String(n1.r[k]).slice(0,400)));
  chk('the same keys in both builds',n1.r.__keys===o.r.__keys||o.r.__keys+' vs '+n1.r.__keys);
  chk('popups, maps, quests, chests, foes, battle, win, flee, lose and new game: identical to the old build ('+(n1.r.__keys-unstable.length)+' results)',!diff.length||diff.join(', '));
  chk('at most a few results are unstable between runs',unstable.length<=3||unstable.join(', '));
  await done({browser:{close:async()=>{}}});
})();
