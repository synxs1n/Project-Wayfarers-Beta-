// v0.8.0 weather pass: no boxes of clarity, soft shaped readability, smooth fog.
//  1. battle (Medium 'under' and High 'full' stage), every weather: the weather layer has no straight hard edge anywhere (the v0.7.7 bank
//     sprites were clipped by their own rectangle, so every fog, blizzard and sand bank showed a box, often right around a unit), and
//     sampled rows across each unit box edge show no step in weather coverage (2D weather layer); on High, the GL composite shows no step
//     in how the weather changes the picture across each unit's lighting column (the shader used to light weather pixels as unit pixels
//     inside a hard edged column above every unit)
//  2. world 2D (Medium), every weather: no straight hard edge in the weather layer; nothing on the hero's face, but the weather is not cut
//     out around him in a box either (particles do reach his body box)
//  3. HD-2D (Medium): fog density is there at the hero and rises smoothly with distance (the scene's distance fog along the ground)
//  4. every weather renders without page errors or weather errors in the world (2D and HD-2D) and in battle at Low, Medium and High
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v080wa.js
const {open,chk,done}=require('./pw');
const META=(t,hd)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false,tips:false,hd2d:${hd!==false}}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const ALL=['rain','storm','snow','blizzard','fog','gale','sand','heat','ashfall','aurora','starfall','meteor'];
const SECT=process.env.SECT||'1234',SQ=n=>SECT.includes(n);
const RARE=['bloodmoon','eclipse','meteor','surge_earth','surge_water','surge_fire','surge_ice','surge_wind','surge_shadow'];
async function boot(t,hd,w,h){const H=await open({w:w||933,h:h||705,mobile:true,dpr:2,pre:META(t,hd)});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.wait(500);return H;}
const PLACE=`(w,clock)=>{const A=__A,m=A.getMap('f0');A.G.clock=clock==null?150:clock;A.G.weather[m.s]=w;let best=null;for(let y=8;y<m.h-8&&!best;y++)for(let x=8;x<m.w-8;x++){let ok=true;for(let j=-2;j<=2&&ok;j++)for(let i=-3;i<=3&&ok;i++)if(A.solidAt(m,x+i,y+j))ok=false;if(ok){best=[x,y];break;}}
  if(!best)best=Object.values(m.gates)[0].arrive;A.V.modal=null;A.placeAt('f0',best[0],best[1],'d');A.TR.ph=null;A.TR.wx.key=null;A.render();return best;}`;
// in page: the longest straight hard edge in an alpha map (a run of rows where the same column steps by more than thr, same sign), and
// the same along rows. Callers compare vertical runs (len) and horizontal runs (lenH) with their own minimum (shorter ones are particles);
// a horizontal run across (nearly) the whole width is a full width feature (the floor line, a sky band), not the side of a box
const EDGE=`(d,w,h,thr,minRun)=>{let best={len:0};const A=(x,y)=>d[(y*w+x)*4+3];
  for(let x=0;x<w-1;x++){let run=0,sg=0;for(let y=0;y<h;y++){const s=A(x+1,y)-A(x,y),g=Math.abs(s)>thr?Math.sign(s):0;if(g&&g===sg)run++;else{run=g?1:0;sg=g;}if(run>best.len)best={len:run,x,y,dir:'v'};}}
  let bh={len:0};for(let y=0;y<h-1;y++){let run=0,sg=0;const fin=(x)=>{if(run<w*.9&&run>bh.len)bh={len:run,x,y,dir:'h'};};for(let x=0;x<w;x++){const s=A(x,y+1)-A(x,y),g=Math.abs(s)>thr?Math.sign(s):0;if(g&&g===sg)run++;else{fin(x);run=g?1:0;sg=g;}}fin(w);}
  best.lenH=bh.len;best.h=bh;return best;}`;
(async()=>{
  // ---------- 1. battle ----------
  if(SQ('1'))for(const tier of (process.env.TIERS||'medium,high').split(',')){const H=await boot(tier);const {ev,wait,page}=H;const rows=[],steps=[],gls=[];
    for(const wx of (process.env.WXS?process.env.WXS.split(','):ALL.concat(['bloodmoon','surge_fire']))){
      await ev(([wx])=>{const A=__A;A.V.modal=null;A.G.clock=300;try{A.finishBattle('x');}catch(e){}A.V.modal=null;A.startBattle({stage:0,kind:'field',weather:wx,bg:{th:'meadow',k:'field',g:'grass'},foes:['gull','mossling','frostwolf'].map(id=>A.makeEnemy(A.MON[id],5))});},[wx]);
      await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});await wait(500);
      const r=await ev(`(()=>{const A=__A,g=k=>A.TW.get(k),bc=document.getElementById('bcv'),BL=g('BL'),W=BL.W,H=BL.H,B=A.B,edge=(${EDGE});
        const c=document.createElement('canvas'),k=(bc._rw||bc.width)/W;c.width=Math.round(W*k);c.height=Math.round(H*k);const x=c.getContext('2d');let worst={len:0},stepMax=0,stepAt='';const acc=new Map();
        for(const T of [4000,17000,33000]){x.setTransform(k,0,0,k,0,0);x.clearRect(0,0,W,H);g('w7BattleGround')(x,W,H,T);g('weatherFX')(x,B.weather,W,H,T,true);x.setTransform(1,0,0,1,0,0);
          const d=x.getImageData(0,0,c.width,c.height).data,e=edge(d,c.width,c.height,10,Math.round(14*k));worst={len:Math.max(worst.len,e.len),lenH:Math.max(worst.lenH||0,e.lenH),at:e.len>worst.len?Object.assign(e,{T}):worst.at};
          // rows across each unit box edge: the step at the edge against the steps beside it
          // (the mean signed step at the edge over the rows of the box, against the same beside it: a box edge steps the same way on every row)
          const ub=g('unitBox');B.en.concat(B.front).forEach(u=>{const b=ub(u);if(!b)return;for(const ex of [b.x-b.w/2,b.x+b.w/2]){const X=Math.round(ex*k);if(X<12||X>c.width-13)continue;
            const key=u.name+':'+ex,q=acc.get(key)||{se:0,s1:0,s2:0,n:0,u:u.name};for(let yy=b.y-b.h;yy<b.y-b.h*.3;yy+=.5){const Y=Math.round(yy*k);if(Y<0||Y>=c.height)continue;const a=i=>d[(Y*c.width+i)*4+3];q.se+=a(X+2)-a(X-2);q.s1+=a(X-6)-a(X-10);q.s2+=a(X+10)-a(X+6);q.n++;}acc.set(key,q);}});}
        acc.forEach(q=>{if(!q.n)return;const s=Math.abs(q.se/q.n)-Math.max(Math.abs(q.s1/q.n),Math.abs(q.s2/q.n));if(s>stepMax){stepMax=Math.round(s*10)/10;stepAt=q.u;}});
        return {w:B.weather,edge:worst,stepMax,stepAt,err:A.W7.err,gl:g('HB').on};})()`);
      rows.push(r);
      if(tier==='high'&&wx==='fog'){// the GL composite: a uniform translucent veil on the unit layer (what fog, rain and snow are made of) minus the
        // same frame without it, across each unit's lighting column edge at the height of its feet, beside the sprite: the veil must come out
        // the same inside and outside the column (v0.7.7 shaded it as unit pixels: darker toward the feet inside a hard edged column)
        const q=await ev(`(()=>{const A=__A,g=k=>A.TW.get(k),B=A.B,HB=g('HB'),BL=g('BL'),bf=g('battleFrame'),hf=g('hbFrame');if(!HB.on)return {off:1};const bc=document.getElementById('bcv');
          const grab=veil=>{B.weather='clear';bf(26000);if(veil){const x=bc.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle='rgba(230,235,245,.3)';x.fillRect(0,0,bc._rw||bc.width,bc._rh||bc.height);x.restore();const V=g('BV');V.glStage=true;V.glFull=true;try{hf(26000);}finally{V.glStage=false;V.glFull=false;}}
            const c=document.createElement('canvas');c.width=HB.cv.width;c.height=HB.cv.height;const x=c.getContext('2d');x.drawImage(HB.cv,0,0);return x.getImageData(0,0,c.width,c.height).data;};
          const a=grab(true),b=grab(false);B.weather='fog';const W=HB.cv.width,sc=W/BL.W,ub=g('unitBox');let worst=0,at='';
          const L=(d,i)=>d[i]*.3+d[i+1]*.59+d[i+2]*.11;
          B.en.concat(B.front).forEach(u=>{const bx=ub(u);if(!bx)return;const r0=Math.max(5,Math.min(bx.w,40)*.5)*(bx.hov?.7:1),kx=HB.bake&&HB.bake.look.kx||0,cx=Math.round((u._gx||bx.x)-kx*r0*.28),rx=r0*1.08,fy=(bx.gy!=null?bx.gy:bx.y);
            for(const ex of [cx-rx*1.35,cx+rx*1.35]){const X=Math.round(ex*sc);if(X<14||X>W-15)continue;let se=0,s1=0,s2=0,n=0;for(let yy=fy-14;yy<fy-1;yy+=.5){const Y=Math.round(yy*sc);if(Y<0)continue;
              const D=i=>{const o=(Y*W+i)*4;return L(a,o)-L(b,o);};se+=D(X+2)-D(X-2);s1+=D(X-8)-D(X-12);s2+=D(X+12)-D(X+8);n++;}
              if(!n)continue;const s=Math.abs(se/n)-Math.max(Math.abs(s1/n),Math.abs(s2/n));if(s>worst){worst=s;at=u.name;}}});
          return {worst:Math.round(worst*10)/10,at};})()`);gls.push([wx,q]);}}
    // the bloodmoon's square moon is v0.4.0 pixel art (kept), 10 px a side
    const bad=rows.filter(r=>r.edge.len>=28&&!(r.w==='bloodmoon'&&r.edge.len<=24)||r.edge.lenH>=80);
    chk(`battle ${tier}: no straight hard edge in the weather layer in any weather (longest vertical / horizontal run: ${rows.map(r=>r.w+' '+r.edge.len+'/'+r.edge.lenH).join(', ')})`,bad.length===0||JSON.stringify(bad.map(r=>[r.w,r.edge])));
    chk(`battle ${tier}: no step in weather coverage across any unit box edge (worst excess mean step ${Math.max(...rows.map(r=>r.stepMax))}/255)`,rows.every(r=>r.stepMax<=8)||JSON.stringify(rows.filter(r=>r.stepMax>8).map(r=>[r.w,r.stepMax,r.stepAt])));
    if(tier==='high')chk(`battle high: a translucent veil on the unit layer comes out the same inside and outside each unit's lighting column (${gls.map(([w,q])=>w+' '+(q.off?'off':q.worst)).join(', ')})`,gls.every(([w,q])=>!q.off&&q.worst<=3)||JSON.stringify(gls));
    chk(`battle ${tier}: the HD stage is on`,rows.every(r=>r.gl)||'off');
    chk(`battle ${tier}: no weather error, no console error`,rows.every(r=>!r.err)&&H.errs.length===0||JSON.stringify([rows.map(r=>r.err).filter(Boolean)[0],H.errs[0]]));
    await H.browser.close();}
  // ---------- 2. world 2D (Medium): no box edges, nothing on the face, no box cut out around him ----------
  if(SQ('2')){const H=await boot('medium',false);const {ev,wait}=H;const out=[];
    for(const w of ALL){await ev(`(${PLACE})(${JSON.stringify(w)})`);await wait(80);
      out.push(await ev(`(()=>{const A=__A,edge=(${EDGE}),m=A.WS.m,vw=A.WS.vw,vh=A.WS.vh,c=document.createElement('canvas');c.width=vw*2;c.height=vh*2;const x=c.getContext('2d');let worst={len:0},face=0,body=0;
        const P=CanvasRenderingContext2D.prototype,d0=P.drawImage,f0=P.fillRect;
        for(let ti=0;ti<36;ti++){const T=5000+ti*1733,scan=ti%9===0;x.setTransform(2,0,0,2,0,0);x.clearRect(0,0,vw,vh);const cx=Math.round(A.WS.cam.x),cy=Math.round(A.WS.cam.y);
          const rec=[];x.drawImage=function(im,a,b,cc,dd){const n=arguments.length;if(x.globalAlpha>.02){if(n===3)rec.push([a,b,im.width,im.height]);else if(n===5)rec.push([a,b,cc,dd]);}return d0.apply(this,arguments);};x.fillRect=function(a,b,cc,dd){if(cc*dd<400&&x.globalAlpha>.02)rec.push([a,b,cc,dd]);return f0.apply(this,arguments);};
          A.W7.w7World(x,'w2d',m,cx,cy,vw,vh,T);delete x.drawImage;delete x.fillRect;const F=A.W7.stats.face;
          if(F)rec.forEach(r=>{if(r[2]*r[3]>2500)return;const ux=(r[0]+r[2]/2-F[0])/F[2],uy=(r[1]+r[3]/2-F[1])/F[3],dd=ux*ux+uy*uy;if(dd<F[4]*.95)face++;});
          // the body box (the old cut out): particles reach it now
          const hx=Math.round(A.WS.px)+8-cx,hy=Math.round(A.WS.py)+16-cy;rec.forEach(r=>{if(r[2]*r[3]>2500)return;const X=r[0]+r[2]/2,Y=r[1]+r[3]/2;if(X>hx-10&&X<hx+10&&Y>hy-16&&Y<hy+2)body++;});
          if(!scan)continue;
          x.setTransform(1,0,0,1,0,0);const d=x.getImageData(0,0,c.width,c.height).data,e=edge(d,c.width,c.height,10,28);worst={len:Math.max(worst.len,e.len),lenH:Math.max(worst.lenH||0,e.lenH),at:e.len>worst.len?Object.assign(e,{T}):worst.at};}
        return {w:${JSON.stringify(w)},edge:worst,face,body,err:A.W7.err};})()`));}
    const soft=['fog','blizzard','sand'];
    chk(`world 2D: no straight hard edge in the weather layer (vertical / horizontal runs: ${out.map(r=>r.w+' '+r.edge.len+'/'+r.edge.lenH).join(', ')})`,out.every(r=>r.edge.len<28&&r.edge.lenH<80)||JSON.stringify(out.filter(r=>r.edge.len>=28||r.edge.lenH>=80).map(r=>[r.w,r.edge])));
    chk(`world 2D: nothing drawn on the hero's face in any weather (${out.reduce((a,r)=>a+r.face,0)})`,out.every(r=>r.face===0)||JSON.stringify(out.map(r=>[r.w,r.face])));
    const fall=['rain','storm','snow','blizzard','sand','ashfall'];
    chk(`world 2D: the weather is not cut out of his body box (particles there: ${fall.map(w=>w+' '+out.find(r=>r.w===w).body).join(', ')})`,fall.every(w=>out.find(r=>r.w===w).body>0)||'cut out');
    chk('world 2D: no weather error, no console error',out.every(r=>!r.err)&&H.errs.length===0||JSON.stringify([out.map(r=>r.err).filter(Boolean)[0],H.errs[0]]));
    await H.browser.close();}
  // ---------- 3. HD-2D fog: smooth with distance ----------
  if(SQ('3')){const H=await boot('medium',true);const {ev,wait}=H;await ev(`(${PLACE})('fog')`);await wait(1500);
    // the scene's distance fog (the shader's per vertex factor: clamp((d - start) / (end - start)) * strength) along the ground from in
    // front of the hero to the far edge of the view, with the uniforms of this frame; then the same in clear weather
    const fogAt=()=>ev(()=>{const A=__A,HD=A.HD,f=HD.fogU,E=HD.eye,x=A.WS.px+8,z0=A.WS.py+12.5,out=[];if(!f)return null;
      for(let z=z0+40;z>=z0-320;z-=10){const d=Math.hypot(x-E[0],E[1],z-E[2]);out.push(Math.max(0,Math.min(1,(d-f[0])/(f[1]-f[0])))*f[2]);}return {f:out,hero:out[4],live:HD.live};});
    const r=await fogAt();await ev(`(${PLACE})('clear')`);await wait(900);const c=await fogAt();
    let mono=true,step=0;for(let i=1;i<r.f.length;i++){if(r.f[i]<r.f[i-1]-1e-6)mono=false;step=Math.max(step,r.f[i]-r.f[i-1]);}
    chk(`HD-2D fog: the fog is already there at the hero (${r.hero.toFixed(2)}; clear weather ${c.hero.toFixed(2)}) and thickens with distance (to ${r.f[r.f.length-1].toFixed(2)})`,r.live&&r.hero>=.05&&r.f[r.f.length-1]>=r.hero+.1||JSON.stringify(r));
    chk(`HD-2D fog: density rises smoothly with distance (monotonic: ${mono}, largest step per 10 px ${step.toFixed(3)})`,mono&&step<=.03||JSON.stringify({mono,step,f:r.f.map(v=>+v.toFixed(3))}));
    await H.browser.close();}
  // ---------- 4. every weather in every tier without errors ----------
  if(SQ('4'))for(const [tier,hd] of [['low',false],['medium',true],['medium',false],['high',true],['high',false]]){const H=await boot(tier,hd);const {ev,wait,page}=H;let werr=null;
    for(const w of ALL.concat(RARE))for(const clock of [150,700]){await ev(`(${PLACE})(${JSON.stringify(w)},${clock})`);await wait(60);const e=await ev(()=>{__A.worldDraw2(performance.now());return __A.W7.err||__A.HD.wfxErr||null;});if(e&&!werr)werr=w+': '+e;}
    let berr=null;if(hd!==false||tier==='low'){for(const w of ALL.concat(RARE)){await ev(([w])=>{const A=__A;A.V.modal=null;try{A.finishBattle('x');}catch(e){}A.V.modal=null;A.startBattle({stage:0,kind:'field',weather:w,foes:[A.makeEnemy(A.MON.gull,5)]});},[w]);
      await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});await wait(150);const e=await ev(()=>{__A.TW.get('battleFrame')(performance.now());return __A.W7.err;});if(e&&!berr)berr=w+': '+e;}}
    chk(`${tier}${hd===false?' (2D world)':''}: every weather draws in the world${hd!==false||tier==='low'?' and in battle':''} without errors (${werr||berr||H.errs[0]||'none'})`,!werr&&!berr&&H.errs.length===0);
    await H.browser.close();}
  await done({browser:{close:async()=>{}}});})();
