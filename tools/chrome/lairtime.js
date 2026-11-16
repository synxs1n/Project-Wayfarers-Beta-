// lairtime.js: time leaving a lair (the realm's dungeon) and a den (side cave), painted ms from the fade start (230 ms included) to the
// second frame after the map change, the fix18 method. Not a test (no group): a measuring tool.
// Usage (from tools/chrome): PWHTML=<abs path> [GFX=medium] [REALM=0] [RUNS=3] node lairtime.js
const {open}=require('./pw');
const GFX=process.env.GFX||'medium',RUNS=+process.env.RUNS||3,REALM=+(process.env.REALM||0);
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${GFX}',rmotion:false,hints:false,tips:false}}));`;
const STEP=fn=>`new Promise(res=>{const A=__A;const t0=performance.now();const prof=window.__LT={};const LT=[];const po=new PerformanceObserver(l=>l.getEntries().forEach(e=>LT.push(Math.round(e.startTime-t0)+'+'+Math.round(e.duration))));po.observe({entryTypes:['longtask']});const fr=[];let lf=t0;const rf=n=>{fr.push(Math.round(n-lf));lf=n;if(n-t0<2500)requestAnimationFrame(rf);};requestAnimationFrame(rf);
  A.TW.get('fadeTo')(()=>{const a=performance.now();(${fn})(A);prof.task=Math.round(performance.now()-a);});
  const ok=()=>A.WS.m&&A.WS.m.kind==='field'&&A.V.screen==='world'&&!A.WS.lock;let n=0;
  const f=()=>{if(!ok()&&++n<900)return requestAnimationFrame(f);requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{po.disconnect();res({ms:Math.round(performance.now()-t0),task:prof.task,mid:A.WS.m.id,lt:LT.join(' '),fr:fr.filter(x=>x>40).join(',')});},1500)));};setTimeout(()=>requestAnimationFrame(f),240);})`;
(async()=>{const H=await open({w:1000,h:560,pre:META,tag:'lt'});const {ev,wait}=H;
  await ev(R=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;
    const G=A.G;G.run.seed=4242;try{A.resetMaps();A.syncPools();}catch(e){}G.stage=Math.max(G.stage,R);for(let i=0;i<R;i++)G.cleared[i]=true;A.render();},REALM);
  const s=REALM;
  for(const cleared of [false,true]){
    await ev(([s,c])=>{const A=__A;A.G.cleared[s]=c;},[s,cleared]);
    const out=[],cav=[];
    for(let r=0;r<RUNS;r++){
      await ev(s=>{const A=__A;A.TW.get('enterDungeon')(s);A.render();},s);await wait(1500);
      out.push(await ev(STEP(`A=>A.TW.get('leaveDungeon')(${s})`)));await wait(1500);
      const has=await ev(s=>{const f=__A.getMap('f'+s);return !!(f.caves&&f.caves[0]);},s);
      if(has){await ev(s=>{const A=__A,f=A.getMap('f'+s);A.TW.get('enterCave')(f.caves[0],s);A.render();},s);await wait(1500);
        cav.push(await ev(STEP(`A=>A.TW.get('leaveCave')(A.getMap('f${s}').caves[0].id)`)));await wait(1500);}
    }
    console.log(`${GFX} realm ${s} cleared=${cleared}: lair->field ${out.map(o=>o.ms+'('+o.task+')'+' ['+o.lt+'] {'+o.fr+'}').join(' ')}  den->field ${cav.map(o=>o.ms+'('+o.task+')').join(' ')}`);
  }
  // the boss case: the walk out right after beating the lair's boss (the field is relit and the stage moves on)
  const boss=[];for(let r=0;r<Math.max(1,RUNS-1);r++){
    await ev(s=>{const A=__A;A.G.cleared[s]=false;A.G.stage=s;A.TW.get('enterDungeon')(s);A.render();},s);await wait(1500);
    await ev(s=>{const A=__A;A.startBattle({stage:s,kind:'boss'});},s);await wait(1500);
    await ev(()=>{const A=__A;A.B.en.forEach(e=>e.hp=0);try{if(!A.B.over)A.TW.get('checkEnd')();}catch(e){}});
    for(let k=0;k<30;k++){const ok=await ev(()=>{const A=__A;try{if(A.V.modal&&A.V.modal.type==='result')A.ACT.resultOk();else if(A.V.modal&&A.V.modal.type==='story')A.ACT.storyOk();else if(A.V.modal){A.V.modal=null;A.render();}}catch(e){}return A.V.screen==='world'&&!A.B&&!A.V.modal;});if(ok)break;await wait(700);}
    await wait(1200);
    const o=await ev(STEP(`A=>A.TW.get('leaveDungeon')(${s})`));o.cl=await ev(s=>!!__A.G.cleared[s],s);o.ahead=await ev(()=>window.__S20?window.__S20.S20.n.ahead:'-');boss.push(o);await wait(1500);}
  console.log(`${GFX} realm ${s} after the boss: lair->field ${boss.map(o=>o.ms+'('+o.task+')'+' ['+o.lt+'] {'+o.fr+'} cleared '+o.cl+' ahead '+o.ahead).join(' ')}`);
  await H.browser.close();})();
