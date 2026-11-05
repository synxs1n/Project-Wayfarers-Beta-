// Beta v0.5.0 6.6: frame cost and frame rate on a throttled CPU (CDP Emulation.setCPUThrottlingRate, default 4x = a mid range phone),
// phone size 390x844 at 2x. Scenes: town at night, field in rain, dungeon, battle on auto (rain).
// drawMs: the cost of one frame's world or battle draw, the minimum over many short runs of direct worldDraw/battleFrame calls, each followed by a one pixel read so the canvas really rasterizes (the minimum, over REPS whole passes, is
// the figure least disturbed by other work on the machine). Tiers are measured interleaved in the same page and scene, so they compare fairly.
// Every 2D canvas is made CPU backed (willReadFrequently) in both builds, so the timings are real raster work, as on a phone without GPU canvas.
// fps: real requestAnimationFrame rate over a window, with the share of frames slower than 20 ms. The baseline (PWBASE, the build before
// Phase 6) is measured in the same scenes from the same seed. Usage: PWHTML=../../out/aurelis3.html PWBASE=../../out/baseline.html node v050p6perf.js [rate] [fpsMs]
const {open,chk}=require('./pw');const fs=require('fs');
const RATE=+process.argv[2]||4,MS=+process.argv[3]||3000,ROUNDS=4;
const patch=h=>h.replace(/boot\(\);\s*\}\)\(\);\s*<\/script>/,'window.__A.__wd=n=>worldDraw(n);window.__A.__bf=n=>battleFrame(n);boot();})();</script>');
const SCENES={
  town:()=>{const A=__A;A.G.clock=700;A.render();return 'w';},
  field:()=>{const A=__A,G=A.G;G.clock=100;G.weather[0]='rain';const m=A.getMap('f0');let best=null;for(let y=2;y<m.h-2&&!best;y++)for(let x=Math.floor(m.w/2);x<m.w-2;x++){if(A.tileAt(m,x,y)===','&&!A.solidAt(m,x,y)){best=[x,y];break;}}
    if(!best)best=Object.values(m.gates)[0].arrive;A.placeAt('f0',best[0],best[1],'d');A.render();return 'w';},
  dungeon:()=>{const A=__A;A.enterDungeon(0);A.render();return 'w';},
  battle:()=>{const A=__A;A.startBattle({stage:0,kind:'field',weather:'rain'});return 'b';}};
async function run(html,tiers){
  const H=await open({w:390,h:844,mobile:true,dpr:2,html:patch(html),pre:`(()=>{const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){return gc.call(this,t,t==='2d'?Object.assign({willReadFrequently:true},o||{}):o);};})();(()=>{let s=2;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'medium',rmotion:false}}));`});
  const {ev,wait,page,ctx}=H;const cdp=await ctx.newCDPSession(page);const out={};tiers.forEach(t=>out[t]={});
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
  const setTier=t=>ev(t=>{const A=__A;if(t&&A.gfxApply){A.META.cfg.gfx=t;A.gfxApply();}},t);
  for(const [name,fn] of Object.entries(SCENES)){
    const k=await ev(fn);if(k==='b'){await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000}).catch(()=>{});
      await ev(()=>{const A=__A,B=A.B;B.en.forEach(e=>{e.S.mhp=e.hp=999999;});B.front.forEach(c=>{c.hp=c.S.mhp=999999;});A.ACT.auto();});}
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});
    for(let r=0;r<ROUNDS;r++)for(const t of tiers){await setTier(t);await wait(150);
      const ms=await ev(k=>{const draw=k==='b'?__A.__bf:__A.__wd,cv=document.getElementById(k==='b'?'bcv':'wcv'),cx=cv.getContext('2d');let best=1e9,now=performance.now();for(let c=0;c<12;c++){const a=performance.now();for(let i=0;i<10;i++){now+=16;draw(now);cx.getImageData(0,0,1,1);}best=Math.min(best,(performance.now()-a)/10);}return best;},k);
      out[t][name]=out[t][name]||{};out[t][name].drawMs=Math.min(out[t][name].drawMs||1e9,ms);
      // Phase 6 passes alone (world scenes, this build): ground layer, sky layer, bloom and vignette on the live view
      const p6=k==='w'?await ev(()=>{const A=__A;if(!A.g6Ground)return null;const WS=A.WS,m=WS.m,ctx=WS.ctx,cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y),q=A.GFX.q;let best=1e9,now=performance.now();
        for(let c=0;c<12;c++){const a=performance.now();for(let i=0;i<10;i++){now+=16;A.g6Ground(ctx,m,cx,cy,WS.vw,WS.vh,now);A.g6Sky(ctx,m,cx,cy,WS.vw,WS.vh,now,false);if(q.bloom)A.g6Bloom(ctx,m,cx,cy,WS.vw,WS.vh,now);ctx.getImageData(0,0,1,1);}best=Math.min(best,(performance.now()-a)/10);}return best;}):null;
      if(p6!=null)out[t][name].p6Ms=Math.min(out[t][name].p6Ms||1e9,p6);}
    for(const t of tiers){await setTier(t);await wait(500);
      out[t][name].fps=await ev(ms=>new Promise(res=>{let n=0,slow=0,last=performance.now();const t0=last;const f=()=>{const t=performance.now();if(t-last>20)slow++;last=t;n++;if(t-t0<ms)requestAnimationFrame(f);else res([+(n*1000/(t-t0)).toFixed(1),+(slow/n*100).toFixed(0)]);};requestAnimationFrame(f);}),MS);}
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});}
  await H.browser.close();return out;}
(async()=>{const rows=[],REPS=+process.env.REPS||2,merge=(a,b)=>{if(!a)return b;Object.keys(b).forEach(k=>{a[k].drawMs=Math.min(a[k].drawMs,b[k].drawMs);if(b[k].p6Ms!=null)a[k].p6Ms=Math.min(a[k].p6Ms,b[k].p6Ms);if(b[k].fps[0]>a[k].fps[0])a[k].fps=b[k].fps;});return a;};
  let base=null,aft={};const cur=fs.readFileSync(process.env.PWHTML||__dirname+'/../../out/aurelis3.html','utf8');
  for(let rep=0;rep<REPS;rep++){if(process.env.PWBASE){const b=await run(fs.readFileSync(process.env.PWBASE,'utf8'),['base']);base=merge(base,b.base);}
    const a=await run(cur,['low','medium','high']);['low','medium','high'].forEach(t=>aft[t]=merge(aft[t],a[t]));}
  if(base)rows.push(['before (v0.4.6 renderer)',base]);['low','medium','high'].forEach(t=>rows.push(['after: '+t,aft[t]]));
  console.log(`\nCPU x${RATE}, 390x844 @2x. Each cell: draw ms per frame | fps (share of frames over 20 ms)`);
  console.log('build                     | town (night)          | field (rain)          | dungeon               | battle (auto, rain)');
  rows.forEach(([l,r])=>console.log(l.padEnd(25)+' | '+['town','field','dungeon','battle'].map(k=>`${r[k].drawMs.toFixed(2)} ms${r[k].p6Ms!=null?' (P6 '+r[k].p6Ms.toFixed(2)+')':''} | ${r[k].fps[0]} (${r[k].fps[1]}%)`.padEnd(32)).join(' | ')));
  fs.writeFileSync(__dirname+'/v050p6perf.out.json',JSON.stringify(rows,null,1));
  chk('every tier measured',rows.length>=3);process.exit(0);})();
