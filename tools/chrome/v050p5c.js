// Beta v0.5.0 5.4: time of day and weather blend instead of jumping. Every phase change (day>dusk>night>dawn>day) under every weather,
// and every weather fading in and out in every phase. Frames are drawn by hand with a frozen clock so particles stay put and only the blend moves.
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:844,h:390,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;
  const f=A.getMap('f0');A.placeAt('f0',f.gates.start.arrive[0],f.gates.start.arrive[1],'r');A.render();});
await new Promise(r=>setTimeout(r,500));
const R=await ev(()=>{const A=__A,G=A.G,TR=A.TR,WS=A.WS,o={tod:[],wx:[],fails:[]};
  const cv=WS.ctx.canvas,W=cv.width,Hh=cv.height,NOW=123456;
  // v0.9.9: the clocks the draw reads besides its own time (the location banner's Date.now fade, the arrival fade-in and chest animations on
  // performance.now) are held at the frame's moment too, so two frames differ only by the blend however long the machine takes between them
  const held=f=>{const pn=performance.now,dn=Date.now;performance.now=()=>NOW;Date.now=()=>1.7e12+NOW;try{return f();}finally{performance.now=pn;Date.now=dn;}};
  const frame=()=>held(()=>{TR.last=NOW;A.worldDraw(NOW);return WS.ctx.getImageData(0,0,W,Hh).data;});
  const lum=d=>{let s=0;for(let i=0;i<d.length;i+=16)s+=d[i]*.3+d[i+1]*.5+d[i+2]*.2;return s/(d.length/16);};
  const diff=(a,b)=>{let s=0;for(let i=0;i<a.length;i+=8)s+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);return s/(a.length/8);};
  const PH=A.CLK_PH,WX=Object.keys(A.WEATHER);o.nWx=WX.length;o.dur=[A.TRANS.tod,A.TRANS.wx];
  // ---- time of day: each boundary under each weather ----
  for(const w of ['clear'].concat(WX.filter(x=>x!=='clear')))for(let i=0;i<PH.length;i++){const a=PH[i],b=PH[(i+1)%PH.length];
    G.weather[0]=w;TR.wx.key=null;TR.ph=null;TR.from=null;G.clock=a[2]-1;const La=frame();
    G.clock=b[1]%A.CLK_LEN;const F0=frame();const k0=TR.k,from=TR.from;TR.k=.5;const Fm=frame();TR.k=1;const Fb=frame();
    const dAB=diff(La,Fb),d0=diff(La,F0),dm=diff(La,Fm),dmb=diff(Fm,Fb);
    const r={w,pair:a[0]+'>'+b[0],k0,from,dAB:+dAB.toFixed(2),d0:+d0.toFixed(2),dm:+dm.toFixed(2),lum:[lum(La),lum(Fm),lum(Fb)].map(x=>+x.toFixed(1))};
    r.ok=k0===0&&from===a[0]&&d0<=Math.max(.6,.2*dAB)&&(dAB<1.5||(dm>.15*dAB&&dmb>.15*dAB));
    o.tod.push(r);if(!r.ok)o.fails.push(r);}
  // ---- weather: fade in from clear and back out, in every phase ----
  for(const p of PH)for(const w of WX.filter(x=>x!=='clear')){
    G.clock=Math.floor((p[1]+p[2])/2);G.weather[0]='clear';TR.ph=null;TR.wx.key=null;const La=frame();
    G.weather[0]=w;const F0=frame();const k0=TR.wx.k,from=TR.wx.from;TR.wx.k=.5;const Fm=frame();TR.wx.k=1;const Fb=frame();
    G.weather[0]='clear';const B0=frame();const kOut=TR.wx.k,fromOut=TR.wx.from;TR.wx.k=1;const Bc=frame();
    const dAB=diff(La,Fb),d0=diff(La,F0),dm=diff(La,Fm),dmb=diff(Fm,Fb),dOut=diff(B0,Fb),dBack=diff(Bc,La);
    const r={ph:p[0],w,k0,from,dAB:+dAB.toFixed(2),d0:+d0.toFixed(2),dm:+dm.toFixed(2),dmb:+dmb.toFixed(2),dOut:+dOut.toFixed(2)};
    r.ok=k0===0&&from==='clear'&&d0<=Math.max(.6,.15*dAB)&&(dAB<1.5||(dm>.15*dAB&&dmb>.15*dAB))&&kOut===0&&fromOut===w&&dOut<=Math.max(.6,.15*dAB)&&dBack<.6;
    o.wx.push(r);if(!r.ok)o.fails.push(r);}
  // ---- timing: frames of 16 ms until done ----
  const run=(set,get)=>{set();let t=1000,n=0;TR.last=t;while(get()<1&&n<5000){t+=16;A.trUpdate(t);n++;}return n*16;};
  G.clock=10;G.weather[0]='clear';TR.ph=null;TR.wx.key=null;A.trUpdate(500);
  o.todMs=run(()=>{G.clock=PH[1][1];A.trUpdate(1000);},()=>TR.k);
  o.wxMs=run(()=>{G.weather[0]='rain';A.trUpdate(1000);},()=>TR.wx.k);
  // ---- reduced motion: instant ----
  A.META.cfg.rmotion=true;G.weather[0]='snow';TR.last=2000;A.trUpdate(2000);o.rmWx=TR.wx.k;G.clock=PH[2][1];A.trUpdate(2001);o.rmTod=TR.k;A.META.cfg.rmotion=null;
  // ---- ambience ramps ----
  A.trUpdate(3000);TR.k=1;TR.wx.k=1;o.ambIdle=A.trAmbDur();G.weather[0]='storm';o.ambWx=A.trAmbDur();A.trUpdate(3001);TR.wx.k=1;G.clock=PH[3][1];o.ambTod=A.trAmbDur();
  // ---- cost: plain frames against blending frames ----
  // v0.9.9: plain and blending batches alternate and each keeps its best batch, so a busy moment of the machine hits both alike
  const plain=()=>{G.weather[0]='blizzard';TR.wx.key=null;TR.wx.cur=null;frame();const t0=performance.now();for(let i=0;i<10;i++){TR.k=1;TR.wx.k=1;TR.last=NOW;A.worldDraw(NOW+i*16);}return (performance.now()-t0)/10;};
  const blend=()=>{G.weather[0]='rain';TR.wx.key=null;frame();G.weather[0]='blizzard';frame();const t2=performance.now();for(let i=0;i<10;i++){TR.wx.k=.5;TR.last=NOW;A.worldDraw(NOW+i*16);}return (performance.now()-t2)/10;};
  let bp=1e9,bb=1e9;for(let r=0;r<4;r++){bp=Math.min(bp,plain());bb=Math.min(bb,blend());}
  o.msPlain=+bp.toFixed(2);o.msBlend=+bb.toFixed(2);
  return o;});
console.log('weathers',R.nWx,'durations',R.dur,'tod ms',R.todMs,'wx ms',R.wxMs,'frame ms plain/blend',R.msPlain,R.msBlend);
R.tod.filter((r,i)=>i<8).forEach(r=>console.log('tod',JSON.stringify(r)));
R.fails.slice(0,12).forEach(r=>console.log('FAILROW',JSON.stringify(r)));
chk(`time of day: all ${R.tod.length} phase changes (4 phases x ${R.nWx} weathers) start from the old look and blend`,R.tod.length===4*R.nWx&&R.tod.every(r=>r.ok));
chk(`weather: all ${R.wx.length} fades (4 phases x ${R.nWx-1} weathers, in and out) start from the old look and blend`,R.wx.length===4*(R.nWx-1)&&R.wx.every(r=>r.ok));
chk('durations: time of day 8 to 15 s, weather 5 to 8 s',R.todMs>=8000&&R.todMs<=15000&&R.wxMs>=5000&&R.wxMs<=8000);
chk('reduced motion: both blends are instant',R.rmWx===1&&R.rmTod===1);
chk('ambience beds ramp slower for weather and time changes',R.ambIdle===2.5&&R.ambWx===6&&R.ambTod===10);
chk('a blending frame stays cheap (under 3x a plain frame, or under 8 ms)',R.msBlend<Math.max(8,R.msPlain*3));
await done(H);})().catch(e=>{console.log('ERR',e);process.exit(1);});
