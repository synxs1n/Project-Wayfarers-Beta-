// v0.7.7 weather pass: functional checks (weather7.js, visuals7.js).
//  1. every weather draws its new layers in the world 2D view (Medium, HD-2D off: far, mid and near layers, ground layer for rain, snow
//     and ash, banks for fog, blizzard and sand), in the HD-2D scene (GL quads and ground decals) with the overlay's near and sky layers,
//     and on the battle stage (ground under the units, air over them), at Medium and Low
//  2. Low stays cheap: no soft near layer, no ground layer, no GL weather, particles under WX7.tier.low.cap
//  3. reduced motion: two moments draw the same picture (2D and battle), no strikes, no gusts
//  4. lightning follows the safe flash rules: over 10 minutes of storm never more than 3 flashes in any second (2 by design), each flash
//     brief (under 100 ms over 0.02), peak under 0.5; a strike lights the HD-2D scene and draws a bolt
//  5. nothing over the hero's face (v0.8.0: a feathered ellipse, not his whole box): 2D particles (150 moments per weather) and HD-2D GL
//     quads (40 frames per weather) never inside the ellipse's core
//  6. blends draw both weathers at their weights; the rare skies keep drawing; the victory crest is not blackletter; the minimap is the
//     styled one and keeps its scale; the arena backdrop is the new colosseum; no game RNG is consumed by the weather
//  7. no page errors, no console errors
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v077wa.js
const {open,chk,done}=require('./pw');
const META=(t,rm)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:${!!rm},hints:false,hd2d:true}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const ALL=['rain','storm','snow','blizzard','fog','gale','sand','heat','ashfall','aurora','starfall','meteor'];
const RARE=['bloodmoon','eclipse','surge_fire'];
// v0.9.9: the first field (its realm, so the spot PLACE picks) comes with the journey drawn from Date.now: H.det pins it; and the 2D
// sweeps wait for the camera to come to rest after PLACE (the weather scrolls with the camera, so where it stood moved the particles)
async function boot(t,w,h,rm){const H=await open({w:w||933,h:h||705,mobile:true,dpr:2,pre:META(t,rm),freeze:true});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.det(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.wait(500);return H;}
const CAMREST=H=>H.settle(()=>[Math.round(__A.WS.cam.x),Math.round(__A.WS.cam.y),__A.WS.x,__A.WS.y],null,{frames:5,timeout:5000});
// an open meadowy spot in field 0, a weather, the blend reset
const PLACE=`(w,clock)=>{const A=__A,m=A.getMap('f0');A.G.clock=clock==null?150:clock;A.G.weather[m.s]=w;let best=null;for(let y=8;y<m.h-8&&!best;y++)for(let x=8;x<m.w-8;x++){let ok=true;for(let j=-2;j<=2&&ok;j++)for(let i=-3;i<=3&&ok;i++)if(A.solidAt(m,x+i,y+j))ok=false;if(ok){best=[x,y];break;}}
  if(!best)best=Object.values(m.gates)[0].arrive;A.V.modal=null;A.placeAt('f0',best[0],best[1],'d');A.TR.ph=null;A.TR.wx.key=null;A.render();return best;}`;
// draw one 2D world frame at time T and record the small rects drawn by the weather (fillRect and drawImage), in logical px
const REC2D=`(T)=>{const A=__A,ctx=A.WS.ctx,P=CanvasRenderingContext2D.prototype,f0=P.fillRect,d0=P.drawImage,out=[];let on=false;const W7=A.W7;
  const ww=W7.w7World;let k=1;const rec=(x,y,w,h)=>{if(on&&w*h<2500)out.push([x,y,w,h]);};
  ctx.fillRect=function(x,y,w,h){rec(x,y,w,h);return f0.apply(this,arguments);};ctx.drawImage=function(im,a,b,c,d,e,f,g,h){if(arguments.length===3)rec(a,b,im.width,im.height);else if(arguments.length===5)rec(a,b,c,d);else rec(f,g,h,arguments[8]);return d0.apply(this,arguments);};
  W7.W7.rec=v=>{on=v;};
  try{A.worldDraw2(T);}finally{delete ctx.fillRect;delete ctx.drawImage;W7.W7.rec=null;}
  return {r:out,cam:[Math.round(A.WS.cam.x),Math.round(A.WS.cam.y)],hero:[Math.round(A.WS.px)+8,Math.round(A.WS.py)+16],st:JSON.parse(JSON.stringify(W7.stats))};}`;
(async()=>{
  // ---------- strike schedule: the safe flash rules ----------
  {const H=await boot('medium');const {ev}=H;
    const S=await ev(()=>{const W=__A.W7;let on=false,onsets=[],dur=0,maxDur=0,peak=0,lastOn=-1e9,minGap=1e9;
      for(let t=0;t<600000;t+=4){const f=W.w7Strike(t).f;peak=Math.max(peak,f);if(f>.02){if(!on){onsets.push(t);on=true;dur=0;}dur+=4;maxDur=Math.max(maxDur,dur);}else on=false;}
      let worst=0;for(let i=0,j=0;i<onsets.length;i++){while(onsets[i]-onsets[j]>=1000)j++;worst=Math.max(worst,i-j+1);}
      const starts=[];for(let i=1;i<onsets.length;i++){if(onsets[i]-onsets[i-1]>1000)starts.push(onsets[i]);}for(let i=1;i<starts.length;i++)minGap=Math.min(minGap,starts[i]-starts[i-1]);
      return {flashes:onsets.length,worst,maxDur,peak:+peak.toFixed(3),minGap,strikes:starts.length+1};});
    chk(`lightning: at most 3 flashes in any second over 10 minutes (worst ${S.worst}, ${S.flashes} flashes in ${S.strikes} strikes)`,S.worst<=3&&S.worst>=1&&S.strikes>=50||JSON.stringify(S));
    chk(`lightning: each flash is brief (longest ${S.maxDur} ms over 0.02) and never above 0.5 white (peak ${S.peak})`,S.maxDur<=100&&S.peak<=.5||JSON.stringify(S));
    chk(`lightning: strikes at least 4 s apart (shortest gap ${S.minGap} ms)`,S.minGap>=4000||JSON.stringify(S));
    // the weather draws no game RNG: Math.random and RNG are not called by any weather draw
    const rng=await ev(()=>{const A=__A,M=Math.random;let n=0;Math.random=function(){n++;return M.apply(this,arguments);};const cv=document.createElement('canvas');cv.width=420;cv.height=320;const x=cv.getContext('2d');
      try{const m=A.WS.m;for(const w of ['rain','storm','snow','blizzard','fog','gale','sand','heat','ashfall','aurora','starfall','meteor']){A.G.weather[m.s]=w;A.TR.wx.key=null;A.trUpdate(1);for(let i=0;i<3;i++)A.W7.w7World(x,'w2d',m,100,100,420,320,5000+i*333);}}finally{Math.random=M;}return n;});
    chk(`no Math.random call from the weather (${rng})`,rng===0);
    await H.browser.close();}
  // ---------- 2D world (Medium, HD-2D off) and Low ----------
  for(const [tier,hd] of [['medium',false],['low',false]]){const H=await boot(tier);const {ev,wait}=H;await ev(hd=>{__A.META.cfg.hd2d=hd;__A.gfxApply();},hd);await ev(`(${PLACE})('clear')`);await wait(300);
    const rows=[];let hits=0,tot=0;
    for(const w of ALL){await ev(`(${PLACE})(${JSON.stringify(w)})`);await wait(120);await CAMREST(H);
      const r=await ev(`(()=>{const rec=(${REC2D});let n=0,tot=0,st=null,mx=0;for(let i=0;i<150;i++){const q=rec(20000+i*397),hx=q.hero[0]-q.cam[0],hy=q.hero[1]-q.cam[1];st=st||q.st;mx=Math.max(mx,q.st.n);
        const F=q.st.face;q.r.forEach(r=>{tot++;if(F){const dx=(r[0]+r[2]/2-F[0])/F[2],dy=(r[1]+r[3]/2-F[1])/F[3];if(dx*dx+dy*dy<F[4]*.95)n++;}else n++;});}return {n,tot,st,mx,live:__A.HD.live};})()`);
      rows.push([w,r]);hits+=r.n;tot+=r.tot;}
    const S=Object.fromEntries(rows.map(([w,r])=>[w,r.st]));
    if(tier==='medium'){
      const lay=w=>S[w]&&S[w].layers;
      chk(`2D medium: rain, storm, snow, blizzard, sand, ashfall draw far, mid and near layers (${['rain','storm','snow','blizzard','sand','ashfall'].map(w=>w+' '+lay(w)).join('; ')})`,['rain','storm','snow','blizzard','sand','ashfall'].every(w=>lay(w)[0]>5&&lay(w)[1]>5&&lay(w)[2]>0)||JSON.stringify(S));
      chk(`2D medium: rain puddles, ripples and splashes, snow and ash settle on the ground (${['rain','storm','snow','ashfall'].map(w=>w+' '+S[w].ground).join(', ')})`,['rain','storm','snow','ashfall'].every(w=>S[w].ground>4)||JSON.stringify(S));
      chk(`2D medium: fog, blizzard and sand draw drifting banks (${['fog','blizzard','sand'].map(w=>w+' '+S[w].banks).join(', ')})`,['fog','blizzard','sand'].every(w=>S[w].banks>=2)||JSON.stringify(S));
      chk(`2D medium: gale, heat, aurora, starfall, meteor draw (${['gale','heat','aurora','starfall','meteor'].map(w=>w+' '+S[w].n).join(', ')})`,['gale','heat','aurora','starfall','meteor'].every(w=>S[w].n>0)||JSON.stringify(S));
      chk(`2D medium: the 2D renderer is in use (not HD-2D)`,rows.every(([w,r])=>!r.live)||'live');
      // heat shimmer rows
      const sh=await ev(`(()=>{(${PLACE})('heat');const A=__A;A.worldDraw2(31000);return A.W7.stats.shimmer;})()`);chk(`2D medium: heat shimmers (${sh} rows shifted)`,sh>10||sh);
      // parallax: the near layer leads the camera, the ground layer moves with it
      const par=await ev(()=>{const A=__A,W=A.W7,cv=document.createElement('canvas');cv.width=420;cv.height=320;const x=cv.getContext('2d'),m=A.WS.m;A.G.weather[m.s]='rain';A.TR.wx.key=null;A.trUpdate(1);
        const P=CanvasRenderingContext2D.prototype;const grab=(ox)=>{const o=[];const d0=x.drawImage;x.drawImage=function(im,a,b){if(arguments.length===3)o.push([a,b,im.width,im.height]);return d0.apply(this,arguments);};W.w7World(x,'w2d',m,ox,100,420,320,9000);delete x.drawImage;return o;};
        const a=grab(100).filter(r=>r[3]>=18),b=grab(120).filter(r=>r[3]>=18),m27=a.filter(r=>b.some(q=>Math.abs(q[0]-(r[0]-27))<=1&&q[1]===r[1])).length,m20=a.filter(r=>b.some(q=>Math.abs(q[0]-(r[0]-20))<=1&&q[1]===r[1])).length;return {n:a.length,m27,m20};});
      chk(`2D medium: the near rain layer leads the camera (camera 20 px: ${par.m27} of ${par.n} near streaks moved 27 px, ${par.m20} moved 20)`,par.n>=4&&par.m27>=par.n*.6&&par.m20<=par.n*.2||JSON.stringify(par));}
    else{const mx=Math.max(...rows.map(([w,r])=>r.mx));
      chk(`2D low: cheap (most particles in a frame ${mx}, cap ${await ev(()=>__A.W7.WX7.tier.low.cap)}; no near layer, no ground layer)`,mx<=await ev(()=>__A.W7.WX7.tier.low.cap)&&rows.every(([w,r])=>r.st.layers[2]===0||['starfall','meteor'].includes(w))&&rows.every(([w,r])=>r.st.ground===0)||JSON.stringify(rows.map(([w,r])=>[w,r.mx,r.st.layers,r.st.ground])));
      chk(`2D low: every weather still draws (${rows.map(([w,r])=>w+' '+r.st.n).join(', ')})`,rows.every(([w,r])=>r.st.n>0)||'empty');}
    chk(`2D ${tier}: no weather particle on the hero's face in 150 moments of each weather (${hits} of ${tot})`,tot>2000&&hits===0||JSON.stringify({hits,tot,by:rows.filter(([w,r])=>r.n).map(([w,r])=>w+':'+r.n)}));
    // reduced motion: two moments look the same
    const rm=await ev(`(()=>{const A=__A;A.META.cfg.rmotion=true;const o={};const cv=document.createElement('canvas');cv.width=420;cv.height=320;const x=cv.getContext('2d');const hash=()=>{const d=x.getImageData(0,0,cv.width,cv.height).data;let h=0;for(let i=0;i<d.length;i+=12)h=(h*31+d[i]+d[i+1]*7+d[i+2]*13+d[i+3])>>>0;return h;};
      for(const w of ${JSON.stringify(ALL)}){(${PLACE})(w);A.TR.wx.key=null;A.trUpdate(1);x.clearRect(0,0,420,320);A.W7.w7World(x,'w2d',A.WS.m,200,150,420,320,10000);const a=hash();x.clearRect(0,0,420,320);A.W7.w7World(x,'w2d',A.WS.m,200,150,420,320,23456);const b=hash();o[w]=a===b;}A.META.cfg.rmotion=false;return o;})()`);
    chk(`2D ${tier}: reduced motion holds still in every weather (${Object.entries(rm).filter(e=>!e[1]).map(e=>e[0]).join(',')||'all still'})`,Object.values(rm).every(v=>v)||JSON.stringify(rm));
    // rare skies and blends
    const rare=await ev(`(()=>{const A=__A,o={};for(const w of ${JSON.stringify(RARE)}){(${PLACE})(w);A.worldDraw2(5000);o[w]=A.W7.stats.w;}return o;})()`);
    chk(`2D ${tier}: the rare skies still draw (${JSON.stringify(rare)})`,RARE.every(w=>rare[w]===w)||JSON.stringify(rare));
    const bl=await ev(`(()=>{const A=__A;(${PLACE})('rain');A.worldDraw2(1000);A.G.weather[A.WS.m.s]='snow';A.TR.last=1000;A.trUpdate(1016);A.TR.wx.k=.5;A.TR.last=2000;A.worldDraw2(2000);return {w:A.W7.stats.w,k:A.TR.wx.k};})()`);
    chk(`2D ${tier}: a weather change blends both weathers (${JSON.stringify(bl)})`,bl.w==='rain+snow'||JSON.stringify(bl));
    chk(`2D ${tier}: no console errors (${H.errs.slice(0,2).join(' | ')})`,H.errs.length===0);
    chk(`2D ${tier}: no weather error (${await ev(()=>__A.W7.err)})`,(await ev(()=>__A.W7.err))===null);
    await H.browser.close();}
  // ---------- HD-2D (Medium, High) ----------
  for(const tier of ['medium','high']){const H=await boot(tier);const {ev,wait}=H;await ev(`(${PLACE})('clear')`);await wait(600);
    const res={};
    for(const w of ALL){await ev(`(${PLACE})(${JSON.stringify(w)})`);
      res[w]=await ev(()=>new Promise(r=>{const A=__A,W=A.W7.W7;W.dbg={hits:0};let k=0,gl=0,glG=0,ov=0,n=0;const st=()=>{const S=A.W7.stats;gl=Math.max(gl,S.gl||0);glG=Math.max(glG,S.glG||0);ov=Math.max(ov,S.n||0);
        if(++k<40)requestAnimationFrame(st);else{const h=W.dbg.hits;W.dbg=null;r({live:A.HD.live,gl,glG,ov,hits:h,mode:S.mode,heat:A.W7.w7HeatGL(),err:A.W7.err,wfx:A.HD.wfxErr||null});}};requestAnimationFrame(st);}));}
    const glw=['rain','storm','snow','blizzard','fog','gale','sand','heat','ashfall'];
    chk(`HD-2D ${tier}: weather is in the GL scene (${glw.map(w=>w+' '+res[w].gl).join(', ')})`,glw.every(w=>res[w].live&&res[w].gl>(w==='fog'||w==='heat'?5:40))||JSON.stringify(res));
    chk(`HD-2D ${tier}: puddles, ripples and splashes lie on the ground in rain (rain ${res.rain.glG}, storm ${res.storm.glG} decals)`,res.rain.glG>10&&res.storm.glG>10||JSON.stringify([res.rain,res.storm]));
    chk(`HD-2D ${tier}: the overlay keeps the near and sky layers (${ALL.map(w=>w+' '+res[w].ov).join(', ')})`,['rain','storm','snow','blizzard','sand','aurora','starfall','meteor'].every(w=>res[w].ov>0&&res[w].mode==='ov')||JSON.stringify(res));
    chk(`HD-2D ${tier}: heat shimmers in the composite (strength ${res.heat.heat})`,res.heat.heat>0);
    chk(`HD-2D ${tier}: no GL weather quad on the hero's face in 40 frames of each weather (${ALL.map(w=>res[w].hits).reduce((a,b)=>a+b,0)})`,ALL.every(w=>res[w].hits===0)||JSON.stringify(Object.fromEntries(ALL.map(w=>[w,res[w].hits]))));
    chk(`HD-2D ${tier}: no renderer or weather errors`,ALL.every(w=>!res[w].err&&!res[w].wfx)||JSON.stringify(ALL.map(w=>[res[w].err,res[w].wfx])));
    if(tier==='medium'){
      // a strike lights the scene and draws a bolt
      const lt=await ev(`(()=>new Promise(r=>{(${PLACE})('storm');const A=__A,W=A.W7.W7;let k=0,amb0=null,amb1=null,bolt=0;const st=()=>{k++;if(k===10){amb0=A.HD2D&&__A.W7.stats.hdFlash;W.force=performance.now();W.hold=1;}
        if(k===16){amb1=__A.W7.stats.hdFlash;bolt=__A.W7.stats.bolt;W.hold=0;W.force=0;r({amb0,amb1,bolt,flash:__A.W7.stats.flash});}else requestAnimationFrame(st);};requestAnimationFrame(st);}))()`);
      chk(`HD-2D: a lightning strike lights the scene and draws a bolt (${JSON.stringify(lt)})`,lt.amb1>.1&&lt.bolt>0||JSON.stringify(lt));
      // the overlay's near layer stays off the hero (its box from the GL view)
      const ovh=await ev(`(()=>new Promise(r=>{(${PLACE})('rain');const A=__A,ctx=A.WS.ctx,f0=ctx.drawImage;let n=0,tot=0;ctx.drawImage=function(im,x,y){if(arguments.length===3&&im.height>=18&&im.width<=12){tot++;const F=A.W7.stats.face;if(F){const dx=(x+im.width/2-F[0])/F[2],dy=(y+im.height/2-F[1])/F[3];if(dx*dx+dy*dy<F[4]*.95)n++;}}return f0.apply(this,arguments);};
        let k=0;const st=()=>{if(++k<60)requestAnimationFrame(st);else{delete ctx.drawImage;r({n,tot});}};requestAnimationFrame(st);}))()`);
      chk(`HD-2D: no near rain streak of the overlay on the hero's face in 60 frames (${ovh.n} of ${ovh.tot})`,ovh.tot>20&&ovh.n===0||JSON.stringify(ovh));}
    chk(`HD-2D ${tier}: no console errors (${H.errs.slice(0,2).join(' | ')})`,H.errs.length===0);await H.browser.close();}
  // reduced motion in HD-2D: the overlay holds still
  {const H=await boot('medium',933,705,true);const {ev,wait}=H;await ev(`(${PLACE})('rain')`);await wait(600);
    const r=await ev(()=>{const A=__A,cv=A.WS.cv,x=A.WS.ctx;const hash=()=>{const d=x.getImageData(0,0,cv.width,cv.height).data;let h=0;for(let i=0;i<d.length;i+=28)h=(h*31+d[i]+d[i+1]*7+d[i+2]*13)>>>0;return h;};const o={};
      for(const w of ['rain','storm','snow','blizzard','fog','sand','ashfall','starfall']){A.G.weather[A.WS.m.s]=w;A.TR.wx.key=null;A.worldDraw2(8000);const a=hash();A.worldDraw2(15500);o[w]=a===hash();}return {o,strike:A.W7.w7Strike(12345).f,gust:A.W7.w7Gust(0)};});
    chk(`HD-2D reduced motion: still frames (${Object.entries(r.o).filter(e=>!e[1]).map(e=>e[0]).join(',')||'all'}), no strike, no gust`,Object.values(r.o).every(v=>v)&&r.strike===0&&r.gust===0||JSON.stringify(r));
    await H.browser.close();}
  // ---------- battle (Medium and Low) ----------
  for(const tier of ['medium','low']){const H=await boot(tier,933,705);const {ev,wait,page}=H;const out={};
    for(const w of ALL.concat(['bloodmoon'])){await ev(w=>{const A=__A;try{A.finishBattle('x');}catch(e){}A.V.modal=null;A.G.clock=w==='starfall'||w==='aurora'||w==='meteor'||w==='bloodmoon'?700:150;A.startBattle({stage:0,kind:'field',weather:w,foes:[A.makeEnemy(A.MON.gull,3)]});},w);
      await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
      out[w]=await ev(()=>{const A=__A,B=A.B;B.en.concat(B.front).forEach(u=>{u.S.mhp=u.hp=99999;});const S=A.W7.stats;const P=CanvasRenderingContext2D.prototype,f0=P.fillText;
        A.battleFrame(30000);const a={mode:S.mode,n:S.n,layers:S.layers.slice(),ground:S.btGround||0,banks:S.banks,w:S.w};return a;});}
    // order: the ground layer is drawn before the first unit, the air after the last unit and before the unit HUD
    await ev(()=>{const A=__A;try{A.finishBattle('x');}catch(e){}A.V.modal=null;A.startBattle({stage:0,kind:'field',weather:'rain',foes:[A.makeEnemy(A.MON.gull,3)]});return 1;});
    await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});await ev(()=>{const B=__A.B;B.en.concat(B.front).forEach(u=>{u.S.mhp=u.hp=99999;});});
    if(tier==='medium'){
      chk(`battle ${tier}: rain, snow, ash draw a ground layer under the units (${['rain','storm','snow','ashfall'].map(w=>w+' '+out[w].ground).join(', ')})`,['rain','storm','snow','ashfall'].every(w=>out[w].ground>3)||JSON.stringify(out));
      chk(`battle ${tier}: falling weather draws far, mid and near layers (${['rain','snow','sand','ashfall'].map(w=>w+' '+out[w].layers).join('; ')})`,['rain','snow','sand','ashfall'].every(w=>out[w].layers[0]>3&&out[w].layers[1]>3&&out[w].layers[2]>0)||JSON.stringify(out));
      chk(`battle ${tier}: fog, blizzard and sand draw banks (${['fog','blizzard','sand'].map(w=>w+' '+out[w].banks).join(', ')})`,['fog','blizzard','sand'].every(w=>out[w].banks>0)||JSON.stringify(out));}
    else chk(`battle low: cheap (most particles ${Math.max(...ALL.map(w=>out[w].n))}, no near or ground layer)`,ALL.every(w=>out[w].n<=90&&(out[w].layers[2]===0||['starfall','meteor'].includes(w))&&out[w].ground===0)||JSON.stringify(out));
    chk(`battle ${tier}: every weather draws (${ALL.map(w=>w+' '+out[w].n).join(', ')})`,ALL.every(w=>out[w].mode==='bt'&&out[w].n>0)||JSON.stringify(out));
    chk(`battle ${tier}: the rare skies keep drawing (bloodmoon: ${out.bloodmoon.w})`,out.bloodmoon.w==='bloodmoon');
    // battle labels: the unit HUD is still drawn after the weather (v0.5.8 rule): the last fillRects of a frame are HUD bars, not weather
    const hud=await ev(()=>{const A=__A,ctx=document.getElementById('bcv').getContext('2d'),f0=ctx.fillRect,seq=[];ctx.fillRect=function(x,y,w,h){seq.push([String(ctx.fillStyle),w,h,ctx.globalAlpha]);return f0.apply(this,arguments);};
      try{A.battleFrame(32000);}finally{delete ctx.fillRect;}const last=seq.slice(-6);return {n:seq.length,last};});
    chk(`battle ${tier}: unit HUD bars still come after the weather`,hud.n>0&&hud.last.every(s=>s[3]>=.99)||JSON.stringify(hud));
    // reduced motion holds still in battle
    const rmb=await ev(()=>{const A=__A;A.META.cfg.rmotion=true;const cv=document.createElement('canvas');cv.width=420;cv.height=300;const x=cv.getContext('2d');const hash=()=>{const d=x.getImageData(0,0,420,300).data;let h=0;for(let i=0;i<d.length;i+=12)h=(h*31+d[i]+d[i+1]*7+d[i+2]*13+d[i+3])>>>0;return h;};const o={};
      for(const w of ['rain','storm','snow','blizzard','fog','sand','ashfall','heat']){A.B.weather=w;x.clearRect(0,0,420,300);A.W7.w7BattleGround(x,420,300,4000);A.W7.weatherFX(x,w,420,300,4000,true);const a=hash();x.clearRect(0,0,420,300);A.W7.w7BattleGround(x,420,300,9876);A.W7.weatherFX(x,w,420,300,9876,true);o[w]=a===hash();}
      A.META.cfg.rmotion=false;return o;});
    chk(`battle ${tier}: reduced motion holds still (${Object.entries(rmb).filter(e=>!e[1]).map(e=>e[0]).join(',')||'all'})`,Object.values(rmb).every(v=>v)||JSON.stringify(rmb));
    // results: the victory crest is not blackletter
    if(tier==='medium'){await ev(()=>{const A=__A;A.B.en.forEach(e=>{e.hp=0;});A.win();});await wait(900);
      const v=await ev(()=>{const h=document.querySelector('.panel.result h2');return h?{f:getComputedStyle(h).fontFamily,t:h.textContent}:null;});
      chk(`results: the victory crest is set in the fantasy display face (Cinzel Decorative, v0.19), not blackletter (${v&&v.f})`,!!v&&/Victory/i.test(v.t)&&!/Jacquard/.test(v.f)&&/Cinzel Decorative/.test(v.f)||JSON.stringify(v));
      const bl=await ev(()=>[...document.querySelectorAll('body *')].filter(e=>/Jacquard/.test(getComputedStyle(e).fontFamily.split(',')[0])&&e.textContent.trim()).map(e=>e.tagName+'.'+e.className).slice(0,5));
      chk(`no text on screen in the blackletter (${bl.join(' ')})`,bl.length===0);
      await ev(()=>{__A.V.modal=null;try{__A.finishBattle('x');}catch(e){}__A.render();});}
    chk(`battle ${tier}: no console errors (${H.errs.slice(0,2).join(' | ')})`,H.errs.length===0);chk(`battle ${tier}: no weather error (${await ev(()=>__A.W7.err)})`,(await ev(()=>__A.W7.err))===null);
    await H.browser.close();}
  // ---------- old visuals: minimap and arena ----------
  {const H=await boot('medium',933,705);const {ev,wait}=H;await ev(`(${PLACE})('clear')`);await wait(500);
    const mm=await ev(()=>{const A=__A,cv=document.getElementById('mmap');if(!cv||cv.style.display==='none')return null;A.W63.drawMini();const x=cv.getContext('2d'),d=x.getImageData(0,0,cv.width,cv.height).data;const cols=new Set();for(let i=0;i<d.length;i+=4)cols.add(d[i]<<16|d[i+1]<<8|d[i+2]);
      return {w:cv.width,h:cv.height,cols:cols.size};});
    chk(`minimap: styled tiles (${mm&&mm.cols} colours) on the same 112 x 84 canvas (scale unchanged)`,!!mm&&mm.w===112&&mm.h===84&&mm.cols>60||JSON.stringify(mm));
    const ar=await ev(()=>{const A=__A,c=A.bgStatic('arena',420,300),x=c.getContext('2d'),d=x.getImageData(0,0,420,150).data;const cols=new Set();for(let i=0;i<d.length;i+=4)cols.add(d[i]>>3<<10|d[i+1]>>3<<5|d[i+2]>>3);return cols.size;});
    chk(`arena: the colosseum backdrop (${ar} colour buckets in the stands, the old flat bands had under 60)`,ar>150||ar);
    chk(`old visuals: no console errors`,H.errs.length===0);await H.browser.close();}
  await done({browser:{close:async()=>{}}});
})().catch(e=>{console.log('ERR',e);process.exit(1);});
