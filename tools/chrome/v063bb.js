// Beta v0.6.3 (2): the battle start flash covers the whole world view. The owner's report: "when entering a battle the animation that
// plays is misplaced, only appears in top right of screen right before battle starts". The HD-2D world overlay (hd2d.js hdOverlay) reset
// the 2D canvas to the identity transform, but on Medium and High that canvas holds a 2x bitmap (sprhd2.js), so the flash, the swirl and the
// fades covered one quarter of the view and the old swirl was never cleared from the rest. Samples the 2D world canvas every frame of the
// flash and checks that each quarter of the view turned white at some point, and that no swirl is left after it. Low, Medium and High,
// 390x844, 844x390, 933x705 and 1280x800. Fails on v0.6.2 (Medium and High), passes now.
const {open,chk,done}=require('./pw');const {META}=require('./v063lib');
(async()=>{for(const gfx of ['low','medium','high'])for(const [w,h] of [[390,844],[844,390],[933,705],[1280,800]]){
  const H=await open({w,h,mobile:w<1000,dpr:2,pre:META(gfx)});
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.weather=A.G.weather||{};Object.keys(A.G.weather).forEach(k=>A.G.weather[k]='clear');A.render();});
  await H.wait(1800);
  const r=await H.ev(async()=>{const A=__A,WS=A.WS,cv=WS.cv,RW=cv._rw||cv.width,RH=cv._rh||cv.height,ctx=cv.getContext('2d');
    const q=[0,0,0,0],dark=()=>{const d=ctx.getImageData(0,0,RW,RH).data;let n=0;for(let y=RH>>1;y<RH;y+=3)for(let x=RW>>1;x<RW;x+=3){const i=(y*RW+x)*4;if(d[i+3]>200&&d[i]<16&&d[i+1]<12&&d[i+2]<24)n++;}return n;};
    const before=dark();const T=performance.now();WS.flash=T;WS.lock=true;
    // draw the white phases of the flash directly (frame timing in a busy headless browser would skip them): p = .2 and .5 of its 460 ms
    const draw=A.worldDraw2||A.worldDraw;for(const p of [.2,.5]){draw(T+p*460);const d=ctx.getImageData(0,0,RW,RH).data,c=[0,0,0,0],t=[0,0,0,0];
      for(let y=2;y<RH;y+=6)for(let x=2;x<RW;x+=6){const k=(y<RH/2?0:2)+(x<RW/2?0:1),i=(y*RW+x)*4;t[k]++;if(d[i]>200&&d[i+1]>200&&d[i+2]>200)c[k]++;}
      for(let k=0;k<4;k++)q[k]=Math.max(q[k],c[k]/t[k]);}
    // then let the game loop run the rest of the flash and a few frames after it
    await new Promise(f=>setTimeout(f,520));WS.lock=false;await new Promise(f=>setTimeout(f,350));await new Promise(f=>requestAnimationFrame(()=>requestAnimationFrame(f)));
    return {q:q.map(v=>+v.toFixed(2)),left:dark()-before,hd:!!(A.HD&&A.HD.live),k:cv._ss||1,RW,RH};});
  const tag=`${gfx} ${w}x${h} (2D canvas ${r.RW}x${r.RH}, ${r.hd?'HD-2D':'2D'} world)`;
  chk(`${tag}: the flash whitens every quarter of the view (${r.q.join(' / ')})`,r.q.every(v=>v>=.6)||JSON.stringify(r));
  chk(`${tag}: no swirl is left behind after it`,r.left<=4||JSON.stringify(r));
  await H.browser.close();}
const H=await open({});await done(H);})();
