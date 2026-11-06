// (v0.6.2: added as v058a.js on the sprite branch, renamed when merged next to the battle badge test v058a.js)
// v0.5.8 sprites in the HD-2D scenes: characters are lit by the scene in the world (day vs night, a torch close by), stand at scene scale
// (about 1.5 tiles), keep their contact shadow soft (no hard dark bar or pale line under the feet), the x-ray silhouette still works;
// battle units on Medium ('under') are lit from a cache (no rebuild per frame), on High ('full') the HUD (bars, pips, element badges)
// stays unlit; Low keeps the old paths; no console errors.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v058a.js
const {open,chk,done}=require('./pw');
const cfg=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:true,hints:false}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
async function boot(t){const H=await open({w:390,h:844,mobile:true,dpr:2,pre:cfg(t)});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.wait(400);return H;}
// draws one world frame outside the loop (the GL frame is copied into #wcv over its whole bitmap: v0.6.3 fixed the copy, which covered only the top left quarter of the 2x bitmap) and measures the hero: the mean luminance of his body box,
// the rows just under his feet against the ground beside them, his quad size
const measure=H=>H.ev(()=>{const A=__A,WS=A.WS,HD=A.HD;A.worldDraw2(performance.now());const M=HD.mats.vp,P=(x,y,z)=>{const X=M[0]*x+M[4]*y+M[8]*z+M[12],Y=M[1]*x+M[5]*y+M[9]*z+M[13],W=M[3]*x+M[7]*y+M[11]*z+M[15];return [(X/W+1)/2*WS.vw,(1-Y/W)/2*WS.vh];};
  const fx=Math.round(WS.px)+8,fz=WS.py+12.5,foot=P(fx,0,fz),mid=P(fx,HD.heroH*.45,fz),cv=WS.cv,RW=cv._rw||cv.width,RH=cv._rh||cv.height,k=cv._ss||1,d=cv.getContext('2d').getImageData(0,0,RW,RH).data;
  const L=(x,y)=>{const i=(Math.floor(y*k)*RW+Math.floor(x*k))*4;return (d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255;};
  let body=0,n=0;for(let y=-3;y<=3;y++)for(let x=-2;x<=2;x++){body+=L(mid[0]+x,mid[1]+y);n++;}body/=n;
  // a dark bar: a row under the feet where a run of 8+ pixels is far darker than the ground 14 px to each side
  let bar=0,worst=1;for(let dy=1;dy<=4;dy++){const y=foot[1]+dy,ref=(L(foot[0]-14,y)+L(foot[0]+14,y))/2;let run=0;
    for(let x=-10;x<=10;x++){const v=L(foot[0]+x,y);worst=Math.min(worst,v/Math.max(.02,ref));if(v<ref*.3)run++;else run=0;if(run>=8)bar=1;}}
  return {body:+body.toFixed(3),bar,worst:+worst.toFixed(2),quadH:+(HD.heroH/HD.S.V).toFixed(1),quadW:HD.chW,heroQ:HD.heroQ,live:HD.live,why:HD.why};});
(async()=>{
  for(const t of ['medium','high']){const H=await boot(t);const {ev,wait}=H;
    // town: day, then night, same spot (in the open, away from lamps)
    const spot=await ev(()=>{const A=__A,m=A.getMap('t0');A.placeAt('t0',A.WS.x,A.WS.y,'d');A.render();A.worldDraw2(performance.now());
      const L=(m.lights||[]).map(l=>[l[0],l[1]]);for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if('LWv'.includes(A.tileAt(m,x,y)))L.push([x*16+8,y*16+8]);
      let best=null,bd=-1;for(let y=3;y<m.h-3;y++)for(let x=3;x<m.w-3;x++){let ok=true;for(let j=-1;j<=2&&ok;j++)for(let i=-1;i<=1&&ok;i++)if(A.solidAt(m,x+i,y+j))ok=false;if(!ok)continue;
        const d=Math.min(1e4,...L.map(p=>Math.hypot(p[0]-x*16-8,p[1]-y*16-8)));if(d>bd){bd=d;best=[x,y];}}
      if(best)A.placeAt('t0',best[0],best[1],'d');A.G.clock=120;A.G.weather[0]='clear';A.TR.ph=null;A.TR.wx.key=null;A.render();return [best,Math.round(bd)];});
    await wait(300);const day=await measure(H);
    await ev(()=>{const A=__A;A.G.clock=700;A.TR.ph=null;A.render();});await wait(300);const night=await measure(H);
    chk(`${t}: HD-2D live (${day.why||'ok'})`,day.live===true);
    chk(`${t}: the hero is lit like the scene: day ${day.body} vs night ${night.body} (body luminance, ${spot[1]} px from the nearest lamp or window)`,day.body>night.body*1.15||JSON.stringify({day,night}));
    chk(`${t}: hero billboard at scene scale (quad ${day.quadW}x${day.quadH} art px, about 1.5 tiles of visible figure)`,day.quadH>=24&&day.quadH<=34||JSON.stringify(day));
    chk(`${t}: no hard dark bar under the feet in town (worst row ratio ${day.worst})`,day.bar===0||JSON.stringify(day));
    // dungeon: next to a wall torch, then far from any light (the hero's own lantern stays)
    const dun=await ev(()=>{const A=__A;A.G.clock=120;A.enterDungeon(0);A.render();const m=A.WS.m,T=(m.lights||[]).filter(L=>L[3]==='torch');const tor=(m.lights||[]).map(L=>[L[0],L[1]]);let near=null,far=null,fd=0;
      // v0.8.2 themed dungeons light their caves with crystals, fungi and lava too: take the torch with no other light close by
      const other=(m.lights||[]).filter(L=>L[3]!=='torch'&&L[3]!=='day').concat(m.tl||[]);let nb=-1;
      for(const L of T){const tx=Math.floor(L[0]/16),ty=Math.floor(L[1]/16)+1;if(ty<2||A.solidAt(m,tx,ty)||A.tileAt(m,tx,ty)==='E')continue;const d=other.length?Math.min(...other.map(o=>Math.hypot(o[0]-L[0],o[1]-L[1]))):999;if(d>nb){nb=d;near=[tx,ty];}}
      for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++){if(A.solidAt(m,x,y)||A.tileAt(m,x,y)!=='.')continue;const d=Math.min(...tor.map(p=>Math.hypot(p[0]-x*16-8,p[1]-y*16-8)));if(d>fd){fd=d;far=[x,y];}}
      return {id:m.id,near,far,fd:Math.round(fd),d8:m.d8,nt:T.length};});
    await ev(d=>{__A.placeAt(d.id,d.far[0],d.far[1],'d');__A.render();},dun);await wait(300);const far=await measure(H);
    await ev(d=>{__A.placeAt(d.id,d.near[0],d.near[1],'d');__A.render();},dun);await wait(300);const near=await measure(H);
    // the same spot with the torches put out (the baked light list without them; the ground darkens too)
    const dark=await ev(()=>{const S=__A.HD.S,L0=S.L,o=[];for(let i=0;i<L0.length;i+=8)if(L0[i+7]!==6)for(let k=0;k<8;k++)o.push(L0[i+k]);S.L=new Float32Array(o);return 1;}).then(()=>measure(H));
    await ev(()=>{__A.HD.dirty=true;});
    chk(`${t}: the torch close by lights the hero: lit ${near.body} vs torches out ${dark.body}`,near.body>dark.body*1.15||JSON.stringify({near,dark,dun}));
    chk(`${t}: no hard dark bar or pale line under the feet in the dungeon, by a torch and far from any light (worst ${near.worst}, ${far.worst})`,near.bar===0&&far.bar===0||JSON.stringify({near,far}));
    chk(`${t}: the hero quad is still the silhouette quad (x-ray)`,near.heroQ>=0);
    // battle
    const bt=await ev(()=>new Promise(res=>{const A=__A;A.V.modal=null;A.G.clock=300;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;});A.startBattle({stage:0,kind:'field',weather:'clear',bg:{th:'cave',k:'cave'},foes:['gull','mossling','frostwolf'].map(id=>A.makeEnemy(A.MON[id],5))});
      const w=()=>{if(A.B&&A.B.mode==='cmd')res(1);else setTimeout(w,100);};w();}));
    await ev(()=>{const B=__A.B;B.en.concat(B.front).forEach(u=>{u.S.mhp=u.hp=99999;});});await wait(500);
    if(t==='medium'){const r=await ev(()=>new Promise(res=>{const A=__A,HB=A.HB,n0=HB.litN||0;let f=0;const st=()=>{if(++f<60)requestAnimationFrame(st);else res({n0,n1:HB.litN||0,on:HB.on,tint:!!A.BV});};
        requestAnimationFrame(st);}));
      chk(`medium: units are lit from the cache (${r.n0} lit sprites built to warm up, ${r.n1-r.n0} more in 60 frames)`,r.on&&r.n0>0&&r.n1-r.n0===0||JSON.stringify(r));
      const lum=await ev(()=>{const A=__A,u=A.B.en[1],K=A.HB.bake,P=A.SC58.hbUnitLight(u,K,performance.now()+1e4);return {lc:P.lc.map(v=>+v.toFixed(2)),side:+P.side.toFixed(2),rs:+P.rs.toFixed(2)};});
      chk(`medium: a cave unit takes the lava's light (light ${lum.lc}, side ${lum.side}, rim ${lum.rs})`,lum.lc[0]>.05&&lum.lc[0]>lum.lc[2]||JSON.stringify(lum));}
    else{const px=await ev(()=>{const A=__A,HB=A.HB,gl=HB.gl;HB.redraw=true;A.battleFrame(performance.now());const w=HB.cv.width,h=HB.cv.height,buf=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,buf);
        const bc=document.getElementById('bcv'),RW=bc._rw||bc.width,RH=bc._rh||bc.height,d=bc.getContext('2d').getImageData(0,0,RW,RH).data;let hud=0,bad=0,worst=0,unit=0,ud=0;
        for(let y=0;y<RH;y++)for(let x=0;x<RW;x++){const i=(y*RW+x)*4,a=d[i+3];if(!a)continue;const gx=Math.floor((x+.5)/RW*w),gy=h-1-Math.floor((y+.5)/RH*h),j=(gy*w+gx)*4,df=Math.max(Math.abs(buf[j]-d[i]),Math.abs(buf[j+1]-d[i+1]),Math.abs(buf[j+2]-d[i+2]));
          if(a===254){hud++;worst=Math.max(worst,df);if(df>40)bad++;}else if(a===255){unit++;ud+=df;}}
        return {hud,bad,worst,unit,meanUnitDiff:+(ud/Math.max(1,unit)).toFixed(1)};});
      chk(`high: HUD pixels (bars, pips, element badges) unlit (${px.hud} px, ${px.bad} off, worst ${px.worst})`,px.hud>80&&px.bad<=px.hud*.08||JSON.stringify(px));
      chk(`high: unit pixels are lit and graded (mean change ${px.meanUnitDiff} of 255 over ${px.unit} px)`,px.meanUnitDiff>6||JSON.stringify(px));}
    await ev(()=>{try{__A.finishBattle('x');}catch(e){}__A.V.modal=null;});
    chk(`${t}: no console errors (${H.errs.slice(0,3).join(' | ')})`,H.errs.length===0);await H.browser.close();}
  // Low: the old paths (2D world, 2D battle stage, no lit sprite cache)
  {const H=await boot('low');const {ev,wait}=H;await ev(()=>{__A.G.clock=700;__A.render();});await wait(300);
    const w=await ev(()=>{__A.worldDraw2(performance.now());return {live:__A.HD.live};});
    const b=await ev(()=>new Promise(res=>{const A=__A;A.startBattle({stage:0,kind:'field',weather:'clear'});const f=()=>{if(A.B&&A.B.mode==='cmd'){A.battleFrame(performance.now());res({on:A.HB.on,lit:A.HB.litN||0,stage:A.BV.glStage});}else setTimeout(f,100);};f();}));
    chk(`low: 2D world and 2D battle stage, no lit sprites (${JSON.stringify(w)} ${JSON.stringify(b)})`,w.live===false&&b.on===false&&b.lit===0&&!b.stage);
    chk(`low: no console errors (${H.errs.slice(0,3).join(' | ')})`,H.errs.length===0);await done(H);}
})();
