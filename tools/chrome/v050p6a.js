// Beta v0.5.0 Phase 6: the Graphics quality setting saves and applies, Auto picks a tier from the measured frame rate, reduced motion freezes
// the new motion, the parallax keeps the ground plane still, the camera push resets, menus soften the scene, and no console errors.
const {open,chk,done}=require('./pw');
const meta=cfg=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:Object.assign({speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false},${JSON.stringify(cfg)})}));`;
const start=()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();};
(async()=>{
const cons=[];
// ---- 1. default, the setting, saving and applying ----
let H=await open({w:390,h:844,mobile:true,pre:'localStorage.clear();'});H.page.on('console',m=>{if(m.type()==='error')cons.push(m.text());});
let r=await H.ev(()=>{const A=__A;return {cfg:A.gfxCfg(),tier:A.gfxTier(),cls:document.documentElement.className,stored:A.META.cfg.gfx};});
chk('old or new meta without a gfx key reads as Auto',r.cfg==='auto'&&r.stored===undefined||JSON.stringify(r));
chk('Auto starts on Medium with nothing remembered',r.tier==='medium'&&/gq-medium/.test(r.cls)||JSON.stringify(r));
await H.ev(start);
r=await H.ev(()=>{const A=__A;A.V.modal={type:'settings'};A.render();const row=[...document.querySelectorAll('#modal .gfxrows .chip')].map(b=>b.textContent+(b.classList.contains('on')?'*':''));
  document.querySelector('#modal .gfxrows .chip[data-arg*="high"]').click();
  const o={row,cfg:A.META.cfg.gfx,q:A.GFX.q===A.GFX_Q.high,cls:document.documentElement.className,saved:JSON.parse(localStorage.getItem('aurelis-meta-v1')).cfg.gfx,on:document.querySelector('#modal .gfxrows .chip.on').textContent};
  return o;});
chk(`Settings shows Graphics: ${r.row.join(' ')}`,r.row.length===4&&r.row[0]==='Auto*'||JSON.stringify(r.row));
chk('tapping High applies it',r.cfg==='high'&&r.q&&/gq-high/.test(r.cls)&&r.on==='HD-2D High'||JSON.stringify(r));
chk('the choice is saved in META.cfg',r.saved==='high'||r.saved);
// particle cap per tier
r=await H.ev(()=>{const A=__A,o={};for(const t of ['low','medium','high']){A.META.cfg.gfx=t;A.gfxApply();A.BV.P.length=0;for(let i=0;i<900;i++)A.part({k:'p',x:0,y:0,vx:0,vy:0,life:5000,col:'#fff'});o[t]=A.BV.P.length;}A.BV.P.length=0;return o;});
chk(`particle cap by tier ${JSON.stringify(r)}`,r.low===140&&r.medium===280&&r.high===500||JSON.stringify(r));
const saved=await H.ev(()=>{const A=__A;A.META.cfg.gfx='low';A.saveMeta();return localStorage.getItem('aurelis-meta-v1');});
await H.browser.close();
H=await open({w:390,h:844,mobile:true,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',${JSON.stringify(saved)});`});H.page.on('console',m=>{if(m.type()==='error')cons.push(m.text());});
r=await H.ev(()=>{const A=__A;return {t:A.gfxTier(),low:A.GFX.q===A.GFX_Q.low,cls:document.documentElement.className};});
chk('after a reload the saved tier (Low) is in force',r.t==='low'&&r.low&&/gq-low/.test(r.cls)||JSON.stringify(r));
await H.browser.close();
// ---- 2. Auto: decisions, and a real slow frame rate ----
H=await open({w:390,h:844,mobile:true,pre:meta({gfx:'auto',gfxAuto:'high'})});H.page.on('console',m=>{if(m.type()==='error')cons.push(m.text());});
r=await H.ev(()=>{const A=__A,d=A.gfxAutoDecide;return [d('medium',30),d('medium',50),d('medium',59),d('high',30),d('low',59,{}),d('low',59,{medium:1}),d('high',60),d('low',20)];});
chk(`gfxAutoDecide steps by fps ${r.join(',')}`,r.join(',')==='low,medium,high,medium,medium,low,high,low');
r=await H.ev(()=>{const A=__A;const t0=A.gfxTier();const a=A.gfxAutoFeed(30),b=A.gfxAutoFeed(30),c=A.gfxAutoFeed(60);return {t0,a,b,c,mem:A.META.cfg.gfxAuto};});
chk(`Auto feed: remembered High, 30 fps -> ${r.a}, 30 fps -> ${r.b}, 60 fps -> ${r.c} (no climb back to a failed tier)`,r.t0==='high'&&r.a==='medium'&&r.b==='low'&&r.c==='low'&&r.mem==='low'||JSON.stringify(r));
await H.browser.close();
H=await open({w:390,h:844,mobile:true,pre:meta({gfx:'auto',gfxAuto:'high'})});H.page.on('console',m=>{if(m.type()==='error')cons.push(m.text());});
await H.ev(start);
// v0.9.9: "fast" is what the page really measured. On a busy machine headless Chrome can fall under the 45 fps step-down line by itself;
// then stepping down is the right answer, and the check says which case it saw (the measured window's fps is printed either way)
const fr=await H.ev(()=>new Promise(res=>setTimeout(()=>res({t:__A.gfxTier(),fps:__A.GFX.fps,down:__A.TW.get('GFX_AUTO').down}),3800)));
// (GFX.fps is rounded: a window of 44.6 fps reads 45 and correctly steps down)
if(fr.fps===0||fr.fps>fr.down)chk(`Auto keeps High while frames are fast (measured ${fr.fps} fps)`,fr.t==='high'||JSON.stringify(fr));
else chk(`Auto keeps High while frames are fast: this machine measured ${fr.fps} fps (the line is ${fr.down}), so Auto ${fr.t==='high'?'kept High':'stepped down'}`,fr.t!=='high'||fr.fps===fr.down||JSON.stringify(fr));
// make the main thread slow (about 20 fps) and wait two windows
await H.ev(()=>{window.__busyOn=1;const f=()=>{const t=performance.now();while(performance.now()-t<40);if(window.__busyOn)requestAnimationFrame(f);};requestAnimationFrame(f);});
const slow=await H.ev(()=>new Promise(res=>setTimeout(()=>{window.__busyOn=0;res({t:__A.gfxTier(),fps:__A.GFX.fps,mem:__A.META.cfg.gfxAuto});},7500)));
chk(`Auto steps down when frames are slow (now ${slow.t}, measured ${slow.fps} fps)`,(slow.t==='medium'||slow.t==='low')&&slow.fps<45&&slow.mem===slow.t||JSON.stringify(slow));
await H.browser.close();
// ---- 3. reduced motion freezes the new motion; full motion moves ----
for(const rm of [true,false]){
  // v0.9.9: which decor the first town has (water, leaves, critters, or nothing that moves) comes with the journey's realm, drawn from
  // Date.now: H.det pins the journey, so the "the same layers move" check looks at the same town every run
  H=await open({w:390,h:844,mobile:true,pre:meta({gfx:'high',rmotion:rm}),freeze:true});H.page.on('console',m=>{if(m.type()==='error')cons.push(m.text());});
  await H.det(start);
  r=await H.ev(()=>{const A=__A,WS=A.WS,G=A.G;G.clock=100;G.weather[0]='gale';A.render();
    const snap=now=>{const c=document.createElement('canvas');c.width=WS.vw;c.height=WS.vh;const save=WS.ctx;WS.ctx=c.getContext('2d');const acts=[];
      A.townDecorActors(acts,now,Math.round(WS.cam.x),Math.round(WS.cam.y));acts.filter(a=>/^gfx6/.test(a.deco||'')).forEach(a=>a.draw());WS.ctx=save;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0,n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]){n++;h=(h*31+d[i]+d[i+1]*7+d[i+2]*13+i)|0;}}return h+':'+n;};
    const a=snap(1000),b=snap(5300),c=snap(9100);
    // battle: no camera push, no parallax drift, no shake, no extra element particles
    return {a,b,c};});
  const same=r.a===r.b&&r.b===r.c,drawn=+r.a.split(':')[1]>0;
  if(rm)chk(`reduced motion: world layers (leaves, water, grass, critters) are a still frame (${r.a})`,same&&drawn||JSON.stringify(r));
  else chk('full motion: the same layers move',!same&&drawn||JSON.stringify(r));
  await H.ev(()=>{__A.startBattle({stage:0,kind:'field',weather:'clear'});});
  await H.until(()=>__A.B&&__A.B.mode==='cmd',null,{timeout:25000});
  await H.wait(300);
  r=await H.ev(()=>new Promise(res=>{const A=__A,B=A.B,e=B.en[0];e.fxEl='fire';const n0=A.BV.P.filter(p=>p.g6).length;A.onFx(e,'99','dmg crit');const g6=A.BV.P.filter(p=>p.g6).length-n0;
    const cam=A.CAM.on;setTimeout(()=>{const cv=document.getElementById('bcv');res({g6,cam,mid:cv.style.transform,para:A.PARA.off,shake:!!A.BV.shake});},260);}));
  if(rm)chk(`reduced motion: no camera push, no parallax drift, no shake, no extra particles ${JSON.stringify(r)}`,!r.cam&&!r.mid&&r.para===0&&!r.shake&&r.g6===0);
  else chk(`full motion: a crit pushes the camera and adds element particles ${JSON.stringify({cam:r.cam,mid:r.mid.slice(0,40),g6:r.g6})}`,r.cam&&/scale\(1\.0/.test(r.mid)&&r.g6>0);
  if(!rm){const after=await H.ev(()=>new Promise(res=>setTimeout(()=>{const A=__A;res({cv:document.getElementById('bcv').style.transform,st:document.getElementById('bstage').style.transform,sc:A.BL.sc});},900)));
    chk(`the camera returns: canvas '${after.cv}', unit layer '${after.st}'`,after.cv===''&&after.st===`scale(${after.sc})`);}
  await H.browser.close();}
// ---- 4. parallax keeps the ground plane still; units do not move ----
H=await open({w:390,h:844,mobile:true,pre:meta({gfx:'medium'})});H.page.on('console',m=>{if(m.type()==='error')cons.push(m.text());});
await H.ev(start);
r=await H.ev(()=>{const A=__A,P=A.PARA,W=180,H=150,o={};
  for(const th of ['meadow','coast','cave','snow','heights','void','d_meadow','arena']){
    const grab=off=>{P.on=true;P.off=off;const c=A.bgStatic(th,W,H);P.on=false;return c.getContext('2d').getImageData(0,0,W,H).data.slice();};
    const a=grab(1),b=grab(-1),row=(d,y)=>{let h=0;for(let x=0;x<W*4;x++)h=(h*31+d[y*W*4+x])|0;return h;};
    let gy=H;for(let y=H-1;y>=0;y--){if(row(a,y)!==row(b,y)){gy=y+1;break;}}
    let skyMoved=false;for(let y=0;y<Math.floor(H*.5);y++)if(row(a,y)!==row(b,y)){skyMoved=true;break;}
    o[th]={still:gy,skyMoved};}
  return o;});
chk(`parallax: sky layers move, the ground band never does ${JSON.stringify(r)}`,Object.values(r).every(v=>v.skyMoved&&v.still<=Math.ceil(150*.73))||JSON.stringify(r));
await H.ev(()=>{__A.startBattle({stage:0,kind:'field',weather:'clear'});});
await H.page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
r=await H.ev(()=>{const A=__A,B=A.B,box=()=>B.en.concat(B.front).map(u=>{const b=A.unitBox(u);return b.x+','+b.y;}).join(' ');const a=box();A.PARA.off=1;A.battleFrame(performance.now());const b=box();return {a,b};});
chk('unit slots are the same with parallax running',r.a===r.b||JSON.stringify(r));
// ---- 5. menus soften the scene (High blurs, others dim) ----
r=await H.ev(()=>{const A=__A;A.finishBattle('fled');A.V.modal={type:'settings'};A.render();const o={mopen:document.documentElement.classList.contains('mopen')};
  A.META.cfg.gfx='high';A.gfxApply();o.hi=getComputedStyle(document.getElementById('screen')).filter;A.META.cfg.gfx='low';A.gfxApply();o.lo=getComputedStyle(document.getElementById('screen')).filter;
  A.V.modal=null;A.render();o.closed=!document.documentElement.classList.contains('mopen');return o;});
chk(`depth of field: ${JSON.stringify(r)}`,r.mopen&&/blur/.test(r.hi)&&!/blur/.test(r.lo)&&r.closed);
chk('no console errors',cons.length===0||cons.slice(0,3).join(' | '));
await done(H);})();
