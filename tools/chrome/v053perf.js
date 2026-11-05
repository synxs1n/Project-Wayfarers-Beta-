// Beta v0.5.3 HD-2D world: frame rate on a throttled CPU (CDP Emulation.setCPUThrottlingRate, default 4x = a mid range phone), phone
// size 390x844 at 2x, in the style of v050p6perf.js. Scenes: town at night, field in rain, dungeon. Rows: Low (the 2D view), Medium and
// High with HD-2D, and Medium with HD-2D off (the 2D view at Medium) as the "before". fps: the real requestAnimationFrame rate over a
// window, with the share of frames slower than 20 ms. js: the main thread cost of one worldDraw call (minimum over many runs; WebGL work
// itself runs in the GPU process, SwiftShader here, which CDP does not throttle). Usage: PWHTML=../../out/aurelis3.html node v053perf.js [rate] [fpsMs]
const {open,chk}=require('./pw');const fs=require('fs');
const RATE=+process.argv[2]||4,MS=+process.argv[3]||3000;
const patch=h=>h.replace(/boot\(\);\s*\}\)\(\);\s*<\/script>/,'window.__A.__wd=n=>worldDraw(n);boot();})();</script>');
const SCENES={
  town:()=>{const A=__A;A.G.clock=700;A.render();},
  field:()=>{const A=__A,G=A.G;G.clock=100;G.weather[0]='rain';const m=A.getMap('f0');let best=null;for(let y=2;y<m.h-2&&!best;y++)for(let x=Math.floor(m.w/2);x<m.w-2;x++){if(A.tileAt(m,x,y)===','&&!A.solidAt(m,x,y)){best=[x,y];break;}}
    if(!best)best=Object.values(m.gates)[0].arrive;A.placeAt('f0',best[0],best[1],'d');A.render();},
  dungeon:()=>{const A=__A;A.enterDungeon(0);A.render();}};
const ROWS=[['low',true],['medium',false],['medium',true],['high',true]];
(async()=>{
  const H=await open({w:390,h:844,mobile:true,dpr:2,html:patch(fs.readFileSync(process.env.PWHTML||__dirname+'/../../out/aurelis3.html','utf8')),pre:`(()=>{let s=2;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'medium',rmotion:false,hints:false}}));`});
  const {ev,wait,page,ctx}=H;const cdp=await ctx.newCDPSession(page);const out={};
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
  const set=(t,hd)=>ev(([t,hd])=>{const A=__A;A.META.cfg.gfx=t;A.META.cfg.hd2d=hd;A.gfxApply();},[t,hd]);
  for(const [name,fn] of Object.entries(SCENES)){await ev(fn);await wait(400);
    for(const [t,hd] of ROWS){const key=t+(hd?'':' (HD-2D off)');out[key]=out[key]||{};await set(t,hd);await wait(600);
      const live=await ev(()=>__A.HD.live);
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});await wait(300);
      const js=await ev(()=>{let best=1e9,now=performance.now();for(let c=0;c<8;c++){const a=performance.now();for(let i=0;i<5;i++){now+=16;__A.__wd(now);}best=Math.min(best,(performance.now()-a)/5);}return best;});
      const fps=await ev(ms=>new Promise(res=>{let n=0,slow=0,last=performance.now();const t0=last;const f=()=>{const t=performance.now();if(t-last>20)slow++;last=t;n++;if(t-t0<ms)requestAnimationFrame(f);else res([+(n*1000/(t-t0)).toFixed(1),+(slow/n*100).toFixed(0)]);};requestAnimationFrame(f);}),MS);
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
      const info=await ev(()=>({bake:Math.round(__A.HD.bakeMs),size:__A.HD.size}));
      out[key][name]={live,js:+js.toFixed(2),fps,info};console.log(name,key,JSON.stringify(out[key][name]));}}
  console.log(`\nCPU x${RATE}, 390x844 @2x. Each cell: fps (share of frames over 20 ms) | main thread ms per worldDraw`);
  console.log('row                     | town (night)              | field (rain)              | dungeon');
  Object.entries(out).forEach(([k,r])=>console.log(k.padEnd(23)+' | '+['town','field','dungeon'].map(s=>`${r[s].fps[0]} (${r[s].fps[1]}%) | ${r[s].js} ms${r[s].live?' GL':''}`.padEnd(25)).join(' | ')));
  fs.writeFileSync(__dirname+'/v053perf.out.json',JSON.stringify(out,null,1));
  chk('HD-2D live on medium and high, 2D on low',['town','field','dungeon'].every(s=>out.medium[s].live&&out.high[s].live&&!out.low[s].live));
  await H.browser.close();process.exit(0);})();
