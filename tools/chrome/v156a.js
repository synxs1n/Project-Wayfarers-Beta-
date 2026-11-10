// v0.17.x res11.js (render resolution follows the display): the HD-2D world renders at floor(d / 2 + .25) internal pixels per art pixel
// (d = device pixels per art pixel = view scale x page zoom x devicePixelRatio; Medium at most 2, High at most 3), forced by Settings >
// Render scale; ground, props and buildings are EPX doubled from 2 on; the flat view keeps a whole number of device pixels per art pixel;
// the battle unit layer's backing density (and the boss resample) follow the display; no page errors on low, medium and high; the cost grows with the
// pixel count and no more; the Settings row. Run from tools/chrome: PWHTML=../../out/aurelis3.html node v156a.js
const {open,chk,done,perfChk}=require('./pw');
const start=(H,tier,render)=>H.det(([tier,render])=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.META.cfg.gfx=tier;A.META.cfg.hints=false;
  if(render)A.META.cfg.render=render;A.V.modal=null;A.TW.get('applyCfg')();A.render();},[tier,render],5);
const world=H=>H.ev(()=>{const g=__A.TW.get,WS=g('WS'),HD=g('HD');return {sc:WS.scale,vw:WS.vw,vh:WS.vh,live:!!HD.live,px:HD.pxI||0,td:HD.td||0,gl:HD.cv?[HD.cv.width,HD.cv.height]:null,dev:g('resDev')(),tier:g('gfxTier')(),broken:HD.broken?HD.why:null,err:HD.wfxErr||null};});
const settle=async(H,tier)=>{await H.until(()=>{const g=__A.TW.get;const HD=g('HD');return tier==='low'?g('WS').vw>0&&g('V').screen==='world':HD.live&&HD.pxI>0&&HD.cv&&HD.cv.width>0;},null,{timeout:15000});await H.frames(4);};
const cases=[ // [w,h,dpr,tier,expected internal px, label]
  [1000,560,1,'medium',1,'a 1000 px window (d 3): the old 1x'],
  [1920,1080,1,'medium',2,'1920x1080 dpr 1 (page zoom 4/3, d 4): 2x'],
  [1920,1080,1,'high',2,'1920x1080 dpr 1 High: 2x'],
  [2560,1440,1,'medium',2,'2560x1440 dpr 1 Medium (d 6): capped at 2x'],
  [2560,1440,1,'high',3,'2560x1440 dpr 1 High (d 6): 3x'],
  [390,844,3,'medium',2,'390x844 dpr 3 phone Medium (d 6): capped at 2x'],
  [390,844,3,'high',3,'390x844 dpr 3 phone High: 3x'],
];
(async()=>{
  const times={};
  for(const [w,h,dpr,tier,want,label] of cases){
    const H=await open({w,h,dpr,mobile:dpr>1,freeze:true});await start(H,tier);await settle(H,tier);const r=await world(H);
    chk(`${label}: internal px ${r.px}, ground upscale ${r.td}x, GL canvas ${r.gl&&r.gl.join('x')} (view ${r.vw}x${r.vh} art px, scale ${r.sc}, d ${(r.sc*r.dev).toFixed(2)})`,r.live&&r.px===want&&r.gl[0]===r.vw*want&&r.gl[1]===r.vh*want&&r.td===(want>=2?2:1)||JSON.stringify(r));
    if(w===1920&&tier==='medium'){// frame cost at 1920x1080: auto (2x) against the forced 1x, GPU work forced out with a one pixel read (software GL, so only the ratio means anything)
      const bench=()=>H.ev(()=>{const g=__A.TW.get,HD=g('HD'),gl=HD.gl,f=g('worldDraw'),PX=new Uint8Array(4);HD.inLoop=1;for(let i=0;i<4;i++){f(performance.now());gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,PX);}
        const t=[];for(let i=0;i<40;i++){const a=performance.now();f(performance.now()+i*16);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,PX);t.push(performance.now()-a);}t.sort((a,b)=>a-b);return {px:HD.pxI,ms:t[20]};});
      await H.ev(()=>{__A.META.cfg.render='1';});await H.frames(6);const b1=await bench();
      await H.ev(()=>{delete __A.META.cfg.render;});await H.frames(6);const b2=await bench();
      times.m1=b1.ms;times.m2=b2.ms;
      chk(`Medium 1920x1080 frame cost: 1x ${b1.ms.toFixed(1)} ms, auto (${b2.px}x) ${b2.ms.toFixed(1)} ms: the cost follows the pixel count (ratio ${(b2.ms/b1.ms).toFixed(2)}, 4 pixels per art pixel at most)`,b1.px===1&&b2.px===2&&b2.ms/b1.ms<5.5||JSON.stringify([b1,b2]));
      await perfChk(H,'Medium 1920x1080 at 2x draws a frame',Math.round(b2.ms),90);
      // forced values and the GPU limit
      await H.ev(()=>{__A.META.cfg.render='3';});await H.frames(6);const r3=await world(H);
      chk(`Render scale 3x on Medium forces 3 internal pixels (${r3.px}x, canvas ${r3.gl&&r3.gl.join('x')})`,r3.px===3&&r3.gl[0]===r3.vw*3||JSON.stringify(r3));
      // the governor: a slow Auto window steps the render scale down before the tier (not under tests, so the test lifts the flag for one call)
      await H.ev(()=>{delete __A.META.cfg.render;});await H.frames(4);
      const gv=await H.ev(()=>{const g=__A.TW.get,RES=g('RES'),HD=g('HD'),f=g('gfxAutoFeed'),t=window.__PWTEST,o={};const cfg=__A.META.cfg.gfx;
        __A.META.cfg.gfx='auto';g('GFX').auto='medium';delete window.__PWTEST;o.before=HD.pxI;try{f(20);}finally{window.__PWTEST=t;__A.META.cfg.gfx=cfg;}
        o.cap=RES.cap;o.tier=g('GFX').auto;RES.cap=0;RES.drops=0;try{localStorage.removeItem('wf_rescap');}catch(e){}return o;});
      chk('Auto steps down: a slow frame window lowers the render scale cap to 1 and keeps the tier',gv.before===2&&gv.cap===1&&gv.tier==='medium'||JSON.stringify(gv));
    }
    if(tier==='medium'&&w===1920){// battle: unit layer density, foe resample
      const b=await H.ev(()=>{const g=__A.TW.get;g('startBattle')({stage:0,kind:'field'});return null;});await H.frames(8);
      const bt=await H.ev(()=>{const g=__A.TW.get,c=document.getElementById('bcv'),B=g('B'),f=B.en[0],s=g('spriteOf')(f),BL=g('BL'),hb=g('HB');return {ss:c._ss,raw:[c._rw,c._rh],logical:[c.width,c.height],hd:s.hd,sw:s.width,sh:s.height,sc:BL.sc,hb:hb.cv&&[hb.cv.width,hb.cv.height],cssw:parseFloat(c.style.width),err:!!g('HD').broken};});
      chk(`battle at 1920x1080: the unit layer backs ${bt.ss} pixels per logical pixel (${bt.raw.join('x')} for ${bt.logical.join('x')}), the foe is resampled at the same density (hd ${bt.hd}), the GL stage is ${bt.hb&&bt.hb.join('x')} for ${Math.round(bt.cssw)} css px`,bt.ss===4&&bt.hd===4&&bt.raw[0]===bt.logical[0]*4&&bt.hb&&bt.hb[0]>bt.cssw*1.2||JSON.stringify(bt));
    }
    await H.browser.close();
  }
  // a 1000 px window keeps the old battle density
  { const H=await open({w:1000,h:560,freeze:true});await start(H,'medium');await H.frames(4);
    await H.ev(()=>{__A.TW.get('startBattle')({stage:0,kind:'field'});});await H.frames(8);
    const bt=await H.ev(()=>{const g=__A.TW.get,c=document.getElementById('bcv'),s=g('spriteOf')(g('B').en[0]);return {ss:c._ss,hd:s.hd,sc:g('BL').sc};});
    chk(`battle in a 1000 px window keeps the 2x unit layer and 2x foes (${JSON.stringify(bt)})`,bt.ss===2&&bt.hd===2||JSON.stringify(bt));
    await H.browser.close(); }
  // low: the flat view, no HD-2D; and a whole number of device pixels per art pixel at dpr 1.25 and 1.5
  for(const [w,h,dpr,label] of [[1000,560,1,'dpr 1'],[1280,720,1.5,'dpr 1.5'],[1280,800,1.25,'dpr 1.25'],[390,844,3,'dpr 3 phone']]){
    const H=await open({w,h,dpr,mobile:dpr>2,freeze:true});await start(H,'low');await settle(H,'low');await H.frames(6);const r=await world(H),d=r.sc*r.dev;
    chk(`flat view at ${w}x${h} ${label}: scale ${r.sc}, ${d.toFixed(2)} device pixels per art pixel (a whole number), HD-2D is off`,!r.live&&Math.abs(d-Math.round(d))<.02&&r.sc>=2&&r.sc<=5||JSON.stringify(r));
    await H.ev(()=>{__A.TW.get('startBattle')({stage:0,kind:'field'});});await H.frames(6);
    await H.browser.close();}
  // EPX: square edges stay square, a staircase corner is cut, a lone pixel stays a block
  { const H=await open({w:390,h:844});
    const e=await H.ev(()=>{const g=__A.TW.get,mk=(rows,cols)=>{const c=document.createElement('canvas');c.width=3;c.height=3;const x=c.getContext('2d');rows.forEach((r,j)=>[...r].forEach((ch,i)=>{x.fillStyle=cols[ch];x.fillRect(i,j,1,1);}));return c;};
      const cols={a:'#ff0000',b:'#0000ff'},px=(c,x,y)=>[...c.getContext('2d').getImageData(x,y,1,1).data].join(',');
      const st=g('resEpx')(mk(['aab','abb','bbb'],cols)),lone=g('resEpx')(mk(['bbb','bab','bbb'],cols)),edge=g('resEpx')(mk(['aab','aab','aab'],cols));
      return {size:[st.width,st.height],corner:px(st,2,2),cornerB:px(st,3,3),loneC:[px(lone,2,2),px(lone,3,3),px(lone,2,3)],edge:[px(edge,3,1),px(edge,4,1),px(edge,3,3)]};});
    chk(`EPX (resEpx): 3x3 -> 6x6; the staircase corner pixel is cut; a lone pixel stays 2x2; a straight edge stays straight (${JSON.stringify(e)})`,
      e.size[0]===6&&e.size[1]===6&&e.corner==='255,0,0,255'&&e.cornerB==='0,0,255,255'&&e.loneC.every(v=>v==='255,0,0,255')&&e.edge[0]==='255,0,0,255'&&e.edge[1]==='0,0,255,255'&&e.edge[2]==='255,0,0,255'||JSON.stringify(e));
    await H.browser.close(); }
  // the Settings row
  { const H=await open({w:1000,h:700,freeze:true});await start(H,'medium');await H.frames(4);
    const s=await H.ev(()=>{const A=__A,o={};A.V.modal={type:'settings'};A.render();const m=document.querySelector('#modal');const row=[...m.querySelectorAll('.row')].find(r=>/Render scale/.test(r.textContent));
      o.row=!!row;o.chips=row?[...row.querySelectorAll('.chip')].map(b=>b.textContent.trim()+(b.classList.contains('on')?'*':'')):[];
      const gfx=[...m.querySelectorAll('.row')].findIndex(r=>/Graphics/.test(r.querySelector('b')&&r.querySelector('b').textContent)),rs=[...m.querySelectorAll('.row')].findIndex(r=>/Render scale/.test(r.querySelector('b')&&r.querySelector('b').textContent));o.after=rs===gfx+1||[gfx,rs];
      const b=row&&[...row.querySelectorAll('.chip')].find(b=>b.textContent.trim()==='2x');if(b)b.click();o.cfg=A.META.cfg.render;
      A.V.modal={type:'settings'};A.render();const row2=[...document.querySelector('#modal').querySelectorAll('.row')].find(r=>/Render scale/.test(r.textContent));o.on=row2?[...row2.querySelectorAll('.chip.on')].map(b=>b.textContent.trim()):null;
      const b2=row2&&[...row2.querySelectorAll('.chip')].find(b=>b.textContent.trim()==='Auto');if(b2)b2.click();o.auto=A.META.cfg.render;o.stored=JSON.stringify(A.META.cfg).indexOf('render')>=0||'ok';return o;});
    chk(`Settings > Render scale row sits after Graphics with Auto / 1x / 2x / 3x, Auto on; 2x is remembered in META.cfg.render and shown on, Auto sets it back (${JSON.stringify(s)})`,
      s.row&&s.chips.join()==='Auto*,1x,2x,3x'&&s.after===true&&s.cfg==='2'&&s.on&&s.on.join()==='2x'&&s.auto==='auto'||JSON.stringify(s));
    await H.browser.close(); }
  console.log('times',JSON.stringify(times));
  const H=await open({w:390,h:844});await done(H);
})();
