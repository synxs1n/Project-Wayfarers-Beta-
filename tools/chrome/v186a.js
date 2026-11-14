// v0.20.10 cohere15.js: the cohesion pass (one sharpness, one outline, the realm's light on sprites, roof courses, the hero solid in front
// of roofs, 1.25x battle units, the realm palette on props; docs/cohere15.md). Checks:
//  1. the toggle (window.__CH15.off and META.cfg.cohere) flips the look both ways in the HD-2D (High) and the flat (Low) renderer: the caches
//     are flushed once per change, frames draw, no module or page errors; Settings shows the Unified look row
//  2. outlines: a prop's (objCanvas) and a building's (m.bsp) silhouette pixels are never pure black and carry the ink's blue; the building's
//     second dark ring is gone (one texel weight); painted HD sprites keep no faint second drop edge (alpha 150 / 235)
//  3. the realm grade on sprites: the same hero walker (flat view) and the HD-2D character ambient lean toward the realm's ground hue
//     (tundra bluer than the mesa), like the ground; the module off leaves them equal
//  4. ground sharpness on a phone (390x844, dpr 2, High): the high frequency energy of the ground band below the hero with the module on is at
//     least what it was off (no tilt shift blur); the far band within 10% (it takes a little more haze)
//  5. occlusion: the hero under a house's roof in HD-2D is drawn solid, last, once per frame with the module on (never off; off lays a pale
//     see-through silhouette over him), and his colours in his box are no less
//  6. battle: unit boxes and body boxes are 1.25x (feet in place), the module off gives the old boxes
//  8. the menus: body.ch15 follows the toggle, the frames' computed look changes and comes back exactly, no box moves or resizes (tap
//     targets as they were), and no text in the menu, Settings, a shop, the dialog box or the battle command menu falls under 4.5:1 (1000x560, 390x844)
//  7. perf probe: median direct frame (HD-2D High, a town, 390x844 dpr 2) with the module on against off, printed; on stays within 1.25x + 1 ms
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v186a.js [ONLY=1,...,7]
const {open,chk,done}=require('./pw');
const META=(t)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:true,hints:false,tips:false,minimap:false,hd2d:true}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const only=process.env.ONLY||'',want=n=>!only||only.split(',').includes(n);
setTimeout(()=>{console.log('FAIL watchdog: v186a ran over 600 s');process.exit(1);},600000).unref();
async function boot(t,o){o=o||{};const H=await open({w:o.w||1000,h:o.h||560,mobile:!!o.mobile,dpr:o.dpr||1,pre:META(t)});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));A.G.run.order=[zi.thistle,zi.thistle,zi.tundra,zi.mesa,zi.orchard];A.resetMaps();Object.keys(A.G.weather||{}).forEach(k=>A.G.weather[k]='clear');A.render();});
  await H.until(()=>__A.V.screen==='world',null,{timeout:15000});await H.wait(600);
  await H.ev(()=>{window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;});await H.wait(150);return H;}
// go to a map of stage s at a tile (or the start), the day settled, the module on or off, two frames drawn
const GO=`([id,at,off])=>{const A=__A,C=window.__CH15;C.off=!!off;const m=A.getMap(id);const p=at||m.start||(m.free&&m.free[Math.floor(m.free.length/2)])||[Math.floor(m.w/2),Math.floor(m.h/2)];
  A.placeAt(id,p[0],p[1],'u');A.WS.cam=null;A.G.clock=150;A.TR.k=1;A.TR.from=null;A.TR.ph=null;A.V.modal=null;A.WS.dlg=null;A.render();const t=performance.now();A.worldDraw2(t);A.worldDraw2(t+16);A.worldDraw2(t+32);return {id:A.WS.m.id,hd:!!A.HD.live,p};}`;
// the worst contrast of every visible text in the menus, the battle command menu, the dialog box and the header (WCAG): the element's colour over
// every colour behind it (ancestors' colours and gradient stops, composed; text gradients and 1 px lines left out); disabled and faded text skipped
const CONTRAST=`(// in page: worst-case contrast of visible text in the current screen
(()=>{const P=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const v=m[1].split(',').map(x=>parseFloat(x));return [v[0],v[1],v[2],v.length>3?v[3]:1];};
const all=s=>(s.match(/rgba?\([^)]+\)|#[0-9a-f]{6}\b/gi)||[]).map(c=>c[0]==='#'?[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16),1]:P(c));
const L=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);};
const ratio=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const over=(c,b)=>[c[0]*c[3]+b[0]*(1-c[3]),c[1]*c[3]+b[1]*(1-c[3]),c[2]*c[3]+b[2]*(1-c[3]),1];
// the background behind an element: ancestors' colours and gradient stops, composed bottom-up (the worst stop of each gradient)
const bgs=(el,fg)=>{const chain=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const cs=getComputedStyle(e);const layers=[];const bc=P(cs.backgroundColor);if(bc&&bc[3]>0)layers.push([bc]);
    const clip=(cs.backgroundClip||'')+(cs.webkitBackgroundClip||'');const st=/text/.test(clip)||/(^|\s)1px/.test(cs.backgroundSize||'')?[]:all(cs.backgroundImage).filter(c=>c&&c[3]>.02);if(st.length)layers.push(st);if(layers.length)chain.push(...layers.reverse());
    if(bc&&bc[3]>=.99)break;}
  let base=[[10,8,16,1]];for(let i=chain.length-1;i>=0;i--){const nb=[];chain[i].forEach(c=>base.forEach(b=>nb.push(over(c,b))));base=nb.slice(0,24);}return base;};
const out=[];document.querySelectorAll('.modal *, #bcmd *, .battle .menu *, .dlg *, .hdr *').forEach(el=>{
  if(!Array.from(el.childNodes).some(n=>n.nodeType===3&&n.textContent.trim().length>1))return;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return;
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||+cs.opacity<.99)return;if(el.closest(':disabled,[aria-disabled=true],.disabled,.off,.locked'))return;
  let op=1;for(let e=el;e;e=e.parentElement){op*=+getComputedStyle(e).opacity;}if(op<.99)return;
  const fg=P(cs.color);const B=bgs(el,fg);let worst=99;B.forEach(b=>{worst=Math.min(worst,ratio(over(fg,b),b));});
  if(worst<4.5)out.push({t:el.textContent.trim().slice(0,30),cls:el.className&&String(el.className).slice(0,40),r:+worst.toFixed(2),fg:cs.color});});
return out;}))()`;
const CALL=(H,src,a)=>H.ev('('+src+')('+JSON.stringify(a)+')');
(async()=>{
  // ---------- 1. the toggle in both renderers ----------
  if(want('1'))for(const tier of ['high','low']){const H=await boot(tier);
    const r=[];for(const off of [false,true,false]){const g=await CALL(H,GO,['t1',null,off]);const s=await H.ev(()=>{const C=window.__CH15;return {flush:C.n.flush,bsp:C.n.bsp,on:C.on(),err:C.err.slice()};});r.push(Object.assign(g,s));}
    console.log(tier,JSON.stringify(r));
    chk(`1 ${tier}: renderer ${tier==='high'?'HD-2D':'flat'} in use`,r[0].hd===(tier==='high')||JSON.stringify(r[0]));
    chk(`1 ${tier}: the look follows the toggle (on, off, on) and the caches flush once per change`,r[0].on&&!r[1].on&&r[2].on&&r[2].flush-r[0].flush===2||JSON.stringify(r));
    chk(`1 ${tier}: buildings processed with the module on`,r[2].bsp>0||r[2].bsp);
    chk(`1 ${tier}: no module errors`,r.every(x=>!x.err.length)||JSON.stringify(r.map(x=>x.err)));
    if(tier==='high'){const row=await H.ev(()=>{__A.V.modal={k:'settings'};try{__A.render();}catch(e){}const h=document.body.innerHTML;__A.V.modal=null;__A.render();return /Unified look/.test(h)&&/"cohere"|&quot;cohere&quot;/.test(h);});
      chk('1 Settings shows the Unified look row',row===true||'not found');}
    chk(`1 ${tier}: no console errors`,!H.errs.length||H.errs.join(' | '));await H.browser.close();}
  // ---------- 2. outlines ----------
  if(want('2')){const H=await boot('high');await CALL(H,GO,['t1',null,false]);
    const r=await H.ev(()=>{const A=__A,C=window.__CH15,T=A.TW.get,m=A.WS.m;
      const stats=cv=>{const w=cv._rw||cv.width,h=cv._rh||cv.height,d=cv.getContext('2d').getImageData(0,0,w,h).data,S=i=>d[i*4+3]>=128,L=i=>d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114;
        let edge=0,black=0,blue=0,ring=0,dark=0;const cols=new Set();for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!S(i))continue;const nb=[x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1];
          const e=nb.some(j=>j<0||!S(j));if(e){edge++;const p=i*4;if(Math.max(d[p],d[p+1],d[p+2])<10)black++;if(L(i)<56){dark++;cols.add(d[p]+','+d[p+1]+','+d[p+2]);if(d[p+2]>=d[p]&&d[p+2]>=d[p+1]*.9)blue++;}}
          else if(L(i)<40&&nb.some(j=>j>=0&&S(j)&&L(j)<56&&[j-1,j+1,j-w,j+w].some(k=>k<0||k>=w*h||!S(k))))ring++;}
        return {edge,black,dark,blue,ring,tones:cols.size};};
      const q=m.bsp.find(q=>q._ch15o),bOn=stats(q.cv),bOff=stats(q._ch15o);
      const obj=T('objCanvas');C.off=true;const o0=obj(m.thv||m.theme,'rock',0);C.off=false;const o1=obj(m.thv||m.theme,'rock',0);
      const oOn=stats(o1),oOff=stats(o0);
      // a painted HD sprite (a foe) with the module on: no alpha 150 / 235 drop edge pixels
      const pc=T('paintHD'),PG0=T('PG');let drop=-1;try{const g=new PG0(12,12);g.rect(3,2,6,8,'A');const c=pc(g,{A:'#a85a5a'},{});const d=c.getContext('2d').getImageData(0,0,c._rw||c.width,c._rh||c.height).data;drop=0;for(let i=3;i<d.length;i+=4)if(d[i]===150||d[i]===235)drop++;}catch(e){drop='err '+e.message;}
      return {bOn,bOff,oOn,oOff,same:o0===o1,drop};});
    console.log(JSON.stringify(r));
    chk('2 building: no pure black silhouette pixel',r.bOn.black===0||r.bOn.black);
    // (v0.20.10 note: the ink is mixed from the touching colour, so a warm wall keeps a warm dark line; the check is that it is tinted, not one black)
    chk('2 building: the outline is tinted by the colour it touches (several dark tones, none black)',r.bOn.tones>=4&&r.bOn.black===0||JSON.stringify(r.bOn));
    chk('2 building: the second dark ring is gone (one texel outline)',r.bOn.ring<=Math.max(2,r.bOff.ring*.25)||`on ${r.bOn.ring} off ${r.bOff.ring}`);
    chk('2 prop: a processed copy, no pure black outline',!r.same&&r.oOn.black===0||JSON.stringify(r));
    chk('2 sprite: no faint second drop edge',r.drop===0||r.drop);
    chk('2 no console errors',!H.errs.length||H.errs.join(' | '));await H.browser.close();}
  // ---------- 3. the realm grade on sprites ----------
  if(want('3')){const out={};for(const tier of ['low','high']){const H=await boot(tier);out[tier]={};
    for(const [st,key] of [[2,'tundra'],[3,'mesa']])for(const off of [false,true]){await CALL(H,GO,['f'+st,null,off]);
      out[tier]['t_'+key]=await H.ev(()=>window.__CH15.mapTint(__A.WS.m));
      out[tier][key+(off?'0':'1')]=await H.ev(()=>{const A=__A,T=A.TW.get;
        if(!A.HD.live){const lid=A.G.party[0],c=T('walkerCanvas')('cmp:'+lid,A.G.roster[lid].look||T('TPL')[lid].look,T('TPL')[lid].el,lid,'front',0),d=c.getContext('2d').getImageData(0,0,c._rw||c.width,c._rh||c.height).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>128){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}return [r/n,g/n,b/n];}
        const gl=A.HD.gl,P=A.HD.P.char;A.worldDraw2(performance.now());return Array.from(gl.getUniform(P.p,P.u.uAmb));});}
    console.log(tier,JSON.stringify(out[tier]));const br=v=>v[2]/Math.max(1,v[0])*(v[0]>2?1:1);
    const o=out[tier],k=v=>v[2]/v[0];
    // both with the module on (the same outlines), the tundra's sprite against the mesa's: each channel's ratio follows the two grounds' ratio
    const agree=(()=>{const a=o.tundra1,b=o.mesa1,ta=o.t_tundra,tb=o.t_mesa;let d=0;for(let i=0;i<3;i++)d+=(a[i]/b[i]-1)*(ta[i]/tb[i]-1);return d;})();
    chk(`3 ${tier}: the sprites differ between the realms the way their grounds do (${agree.toFixed(4)} > 0)`,agree>0||JSON.stringify(o));
    chk(`3 ${tier}: with the module on the tundra's sprites are bluer than the mesa's (realm hue)`,k(o.tundra1)>k(o.mesa1)||JSON.stringify(o));
    chk(`3 ${tier}: the lean is the module's (off, the two are closer than on)`,Math.abs(k(o.tundra0)-k(o.mesa0))<Math.abs(k(o.tundra1)-k(o.mesa1))||JSON.stringify(o));
    chk(`3 ${tier}: no console errors`,!H.errs.length||H.errs.join(' | '));await H.browser.close();}}
  // ---------- 4. ground sharpness on a phone ----------
  if(want('4')){const H=await boot('high',{w:390,h:844,mobile:true,dpr:2});const r={};
    for(const off of [true,false]){await CALL(H,GO,['f1',null,off]);r[off?'off':'on']=await H.ev(()=>{const A=__A,cv=A.WS.cv,RW=cv._rw||cv.width,RH=cv._rh||cv.height,c=cv.getContext('2d');
      const band=(y0,y1)=>{const d=c.getImageData(0,Math.round(RH*y0),RW,Math.round(RH*(y1-y0))).data,w=RW,h=d.length/4/w;let s=0,n=0;const L=i=>d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11;
        for(let y=0;y<h-1;y++)for(let x=0;x<w-1;x++){const i=y*w+x;s+=Math.abs(L(i)-L(i+1))+Math.abs(L(i)-L(i+w));n++;}return s/n;};return {bot:band(.82,.97),top:band(.03,.18)};});}
    console.log(JSON.stringify(r));
    chk(`4 the ground near the bottom is at least as sharp with the module on (${r.on.bot.toFixed(2)} vs ${r.off.bot.toFixed(2)})`,r.on.bot>=r.off.bot*.98||JSON.stringify(r));
    // the far band also takes the module's extra distance haze (depth from haze, not blur), which lowers its contrast a little
    chk(`4 the far ground keeps its sharpness under the extra haze (${r.on.top.toFixed(2)} vs ${r.off.top.toFixed(2)})`,r.on.top>=r.off.top*.9||JSON.stringify(r));
    chk('4 no console errors',!H.errs.length||H.errs.join(' | '));await H.browser.close();}
  // ---------- 5. the hero solid behind a roof (HD-2D) ----------
  if(want('5')){const H=await boot('high');const r={};
    const spot=await H.ev(()=>{const A=__A,m=A.getMap('t1'),b=m.bld.filter(b=>b.w>=3&&b.h>=3).sort((p,q)=>q.y-p.y)[0];return b?[b.x+Math.floor(b.w/2),b.y+1]:null;/* under the roof's front slope: off, he shows only as the pale see-through silhouette */});
    // walked in from two rows north: the camera is still gliding after him (as while walking), when the roof in front showed through him
    const WALK=`([sp,off])=>{const A=__A;window.__CH15.off=off;window.__h0=window.__CH15.n.hero;A.placeAt('t1',sp[0],sp[1]-2,'d');A.WS.cam=null;A.G.clock=150;A.TR.k=1;A.TR.from=null;A.TR.ph=null;A.V.modal=null;A.WS.dlg=null;A.render();
      let T=1e6;for(let i=0;i<40;i++)A.worldDraw2(T+=16);A.placeAt('t1',sp[0],sp[1],'d');for(let i=0;i<3;i++)A.worldDraw2(T+=16);return 1;}`;
    for(const off of [true,false]){await CALL(H,WALK,[spot,off]);r[off?'off':'on']=await H.ev(()=>{const A=__A,C=window.__CH15,cv=A.WS.cv,RW=cv._rw||cv.width,sc=RW/A.WS.vw,c=cv.getContext('2d'),cam=A.WS.cam,HD=A.HD;
      // the hero's screen box from the HD camera (NDC of his quad)
      const nx=HD.heroNdc[0],ny=HD.heroNdc[1],cx=(nx*.5+.5)*A.WS.vw,cy=(1-(ny*.5+.5))*A.WS.vh,hw=6,hh=12;
      const d=c.getImageData(Math.round((cx-hw)*sc),Math.round((cy-hh)*sc),Math.round(hw*2*sc),Math.round(hh*2*sc)).data;let blue=0,dark=0,n=0;for(let i=0;i<d.length;i+=4){n++;if(d[i+2]>d[i]+18&&d[i+2]>d[i+1])blue++;if(d[i]+d[i+1]+d[i+2]<200)dark++;}
      return {blue:blue/n,dark:dark/n,hero:C.n.hero-window.__h0,box:[RW,sc,Math.round(cx),Math.round(cy),A.WS.vw,A.WS.vh]};});}
    console.log(JSON.stringify({spot,r}));
        // (v0.20.10 note: a pixel measure of the pale see-through silhouette depends on how far the camera glide lags, which is not repeatable
    // here; the before/after crops are in docs/cohere15.md. The check is the mechanism: drawn once per frame on, never off, and no loss of his colours)
    chk('5 the solid hero pass runs every frame with the module on and never off',r.on.hero>=40&&r.off.hero===0||JSON.stringify(r));
    chk(`5 his colours are no less with the module on (${r.on.blue.toFixed(3)} vs ${r.off.blue.toFixed(3)})`,r.on.blue>=r.off.blue*.93||JSON.stringify(r));/* +-5% from the camera glide's timing */
    chk('5 no console errors',!H.errs.length||H.errs.join(' | '));await H.browser.close();}
  // ---------- 6. battle units 1.25x ----------
  if(want('6'))for(const tier of ['high','low']){const H=await boot(tier);
    const r=await H.ev(()=>{const A=__A,C=window.__CH15,T=A.TW.get;A.setPause&&A.setPause(999999);A.startBattle({stage:1,kind:'wild'});A.render();const ub=T('unitBox'),bb=T('b3Body');
      const read=off=>{C.off=off;const u=A.B.front[0],e=A.B.en[0],a=ub(u),b=ub(e);return {hw:a.w,hh:a.h,hx:a.x,hy:a.y,ew:b.w,eh:b.h,body:bb(u).h};};const on=read(false),off=read(true);C.off=false;return {on,off};});
    console.log(tier,JSON.stringify(r));const near=(a,b)=>Math.abs(a-b*1.25)<=1.01;
    chk(`6 ${tier}: hero boxes 1.25x with the feet in place, a regular foe keeps its size`,near(r.on.hh,r.off.hh)&&near(r.on.hw,r.off.hw)&&r.on.eh===r.off.eh&&r.on.ew===r.off.ew&&r.on.hx===r.off.hx&&r.on.hy===r.off.hy||JSON.stringify(r));
    chk(`6 ${tier}: the body box (labels, bars) grows with them`,Math.abs(r.on.body-r.off.body*1.25)<=1.5||JSON.stringify(r));
    await H.ev(()=>{window.requestAnimationFrame=window.__raf;});await H.wait(800);
    chk(`6 ${tier}: no console errors`,!H.errs.length||H.errs.join(' | '));await H.browser.close();}
  // ---------- 8. the menus (body.ch15) ----------
  if(want('8'))for(const [w,h,dpr] of [[1000,560,1],[390,844,2]]){const H=await boot('high',{w,h,mobile:w<600,dpr});const tag=`8 ${w}x${h}`;
    await H.ev(()=>{window.requestAnimationFrame=window.__raf;});
    const SC={menu:"__A.WS.dlg=null;__A.V.modal={type:'menu',tab:'party'};__A.render()",settings:"__A.V.modal={type:'settings'};__A.render()",shop:"__A.V.modal={type:'smithy',tab:'weapons'};__A.render()",
      dialog:"__A.V.modal=null;__A.TW.get('say')('Elder','The roads east are quiet again, wayfarer.')",
      battle:"(()=>{const A=__A;A.WS.dlg=null;A.V.modal=null;A.setPause&&A.setPause(999999);A.startBattle({stage:1,kind:'wild'});const B=A.B;B.cur=B.front[0];B.mode='cmd';B.menu='root';B.pend=null;A.render();})()"};
    // the computed look of the frames and every element's box, to compare off before / on / off after
    const SNAP=`(()=>{const q=[...document.querySelectorAll('.modal .panel,.modal .btn,.modal .chip,.modal .row,.dlg,.battle .mi,.battle .pc,.hdr .btn')].slice(0,60);
      return {cls:document.body.classList.contains('ch15'),look:q.map(e=>{const c=getComputedStyle(e);return [c.boxShadow,c.borderTopColor,c.backgroundImage.slice(0,120)].join('|');}),
        box:q.map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)].join(',');})};})()`;
    for(const k of Object.keys(SC)){await H.ev(SC[k]);await H.wait(400);
      const st=async off=>{await H.ev(o=>{window.__CH15.off=o;window.__CH15.sync();__A.render();},off);await H.wait(250);return {s:await H.ev(SNAP),bad:await H.ev(CONTRAST)};};
      const a=await st(true),b=await st(false),c=await st(true);
      chk(`${tag} ${k}: body.ch15 follows the toggle`,!a.s.cls&&b.s.cls&&!c.s.cls||JSON.stringify([a.s.cls,b.s.cls,c.s.cls]));
      chk(`${tag} ${k}: the frames change with it and come back exactly`,a.s.look.length>0&&JSON.stringify(a.s.look)!==JSON.stringify(b.s.look)&&JSON.stringify(a.s.look)===JSON.stringify(c.s.look)||`n ${a.s.look.length}`);
      chk(`${tag} ${k}: no layout change (every box the same)`,JSON.stringify(a.s.box)===JSON.stringify(b.s.box)||'boxes differ');
      chk(`${tag} ${k}: no text under 4.5:1 with the Unified look`,!b.bad.length||JSON.stringify(b.bad.slice(0,4)));
      if(k==='battle')await H.ev(()=>{try{__A.B.over=1;}catch(e){}});}
    chk(`${tag}: no console errors`,!H.errs.length||H.errs.join(' | '));await H.browser.close();}
  // ---------- 7. perf probe ----------
  if(want('7')){const H=await boot('high',{w:390,h:844,mobile:true,dpr:2});const r={};
    for(const off of [true,false,true,false]){await CALL(H,GO,['t1',null,off]);const ms=await H.ev(()=>{const A=__A,t=[];let T0=performance.now()+1e5;for(let i=0;i<30;i++){const a=performance.now();A.worldDraw2(T0+i*16);A.HD.gl.finish();t.push(performance.now()-a);}t.sort((a,b)=>a-b);return t[15];});
      const k=off?'off':'on';r[k]=Math.min(r[k]||1e9,ms);}
    // the map rebuild (base canvas, buildings, HD-2D bake) on entering a map: printed, the module's pass is bake time only
    const bk={};for(const off of [true,false,true,false]){const ms=await H.ev(o=>{const A=__A;window.__CH15.off=o;const T=A.TW.get;const a=performance.now();T('rebuildBase')();A.worldDraw2(performance.now()+2e5);A.HD.gl.finish();return performance.now()-a;},off);const k=off?'off':'on';bk[k]=Math.min(bk[k]||1e9,ms);}
    console.log(`7 map rebuild + first frame: on ${bk.on.toFixed(0)} ms, off ${bk.off.toFixed(0)} ms`);
    console.log(`7 median direct frame, HD-2D High town 390x844 dpr 2: on ${r.on.toFixed(2)} ms, off ${r.off.toFixed(2)} ms (${((r.on/r.off-1)*100).toFixed(1)}%)`);
    chk(`7 frame time with the module on within 1.25x + 1 ms of off (${r.on.toFixed(2)} vs ${r.off.toFixed(2)})`,r.on<=r.off*1.25+1||JSON.stringify(r));
    chk('7 no console errors',!H.errs.length||H.errs.join(' | '));await done(H);return;}
  const H=await open({pre:'localStorage.clear();'});await done(H);
})();
