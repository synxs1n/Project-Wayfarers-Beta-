// v0.19.7 light13.js: light and shadow on the ground, night and interior light pools, world particles, screen transitions.
//  1. one sun: l13ShadowW gives the day shadow at midday, leans to the long dusk shadow at the end of the day and to a faint moon shadow at night;
//     the 2D masks (three per map) exist, the dusk mask is longer than the day one, a town by day is darker with the masks on than off and the ground at
//     the lower right of a building is darker than without; HD2D.suns carry the realm sun; the HD-2D look has a warmer sun and cooler ambient by day,
//     a darker ambient and heavier lamps at night (hdLook hook)
//  2. 2D night: the ground beside a lamp is brighter with the pools than without, the ground away from every light darker; interiors: a torch pool
//     flickers between two frames and holds still under reduced motion
//  3. particles: fireflies at night in a meadow field, pollen by day, ash and embers in Kilnscar, frost in the tundra, dust in the mesa, spores in
//     the Breach, void motes in the Rift; none with the module off; the clock stops under a menu
//  4. transitions: the battle start still whitens every quarter at p = .2 and .5 (v063bb) and the realm's shards cover the view at p = .9; the doorway
//     iris keeps the hero's surroundings visible at p = .5 while the corners are dark, in 2D and HD-2D; reduced motion is a plain fade; the return
//     from a won battle is bright, not dark; nothing is left behind after a flash
//  5. the idle limiter (perf12) still holds on a phone viewport with the module on; no errors anywhere
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v177a.js [ONLY=1,2,3,4,5]
const {open,chk,done}=require('./pw');
const META=(t,rm)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:${!!rm},hints:false,tips:false,minimap:false,hd2d:true}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const only=process.env.ONLY||'',want=n=>!only||only.split(',').includes(n);
setTimeout(()=>{console.log('FAIL watchdog: v177a ran over 600 s');process.exit(1);},600000).unref();
async function boot(t,o){o=o||{};const H=await open({w:o.w||1000,h:o.h||560,mobile:!!o.mobile,dpr:o.dpr||1,pre:META(t,o.rm),before:o.before});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));A.G.run.order=[zi.thistle,zi.deeps,zi.tundra,zi.mesa,zi.orchard];A.resetMaps();Object.keys(A.G.weather||{}).forEach(k=>A.G.weather[k]='clear');A.render();});
  await H.until(()=>__A.V.screen==='world',null,{timeout:15000});await H.wait(700);
  await H.ev(()=>{window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;});await H.wait(150);return H;}
// place the hero on an open tile of a map (the first '.' from the centre), set the hour (the time of day blend settled) and draw two frames
const SCENE=`(s)=>{const A=__A;if(s.map==='t0')A.placeAt('t0',A.WS.x,A.WS.y,'d');else{const m=A.getMap(s.map);let sx=0,sy=0;for(let y=Math.floor(m.h/2);y<m.h&&!sx;y++)for(let x=Math.floor(m.w/2);x<m.w;x++)if(m.t[y][x]==='.'){sx=x;sy=y;break;}A.placeAt(s.map,sx,sy,'d');}
  A.WS.cam=null;A.G.clock=s.clock;A.TR.k=1;A.TR.from=null;A.TR.ph=null;A.V.modal=null;A.WS.dlg=null;A.render();const t=performance.now();A.worldDraw2(t);A.worldDraw2(t+16);return {id:A.WS.m.id,hd:!!A.HD.live};}`;
// luma of the real pixels in a logical box of the world canvas (the composed frame in HD-2D)
const LUMA=`(b)=>{const A=__A,cv=A.WS.cv,RW=cv._rw||cv.width,RH=cv._rh||cv.height,sc=RW/A.WS.vw,c=cv.getContext('2d');const x0=Math.max(0,Math.round(b[0]*sc)),y0=Math.max(0,Math.round(b[1]*sc)),w=Math.min(RW-x0,Math.round(b[2]*sc)),h=Math.min(RH-y0,Math.round(b[3]*sc));if(w<=0||h<=0)return null;
  const d=c.getImageData(x0,y0,w,h).data;let s=0,n=0;for(let i=0;i<d.length;i+=4){s+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;n++;}return s/n;}`;
(async()=>{
  // ---------- 1. one sun ----------
  if(want('1')){const H=await boot('low');const {ev}=H;
    const w=await ev(()=>{const A=__A,T=A.TW.get,f=T('l13ShadowW'),m=A.WS.m,at=c=>{A.G.clock=c;A.TR.k=1;A.TR.from=null;A.TR.ph=null;A.worldDraw2(performance.now());return f(m).slice();};return {noon:at(247),late:at(485),early:at(20),night:at(700)};});
    chk(`shadow weights: midday day only (${w.noon.map(v=>v.toFixed(2))}), the end of the day leans to the dusk shadow (${w.late.map(v=>v.toFixed(2))}), its start to the dawn shadow (${w.early.map(v=>v.toFixed(2))}), night a faint moon shadow (${w.night.map(v=>v.toFixed(2))})`,
      w.noon[0]>.4&&w.noon[1]<.01&&w.noon[2]<.01&&w.late[1]>w.late[0]&&w.late[1]>.3&&w.early[2]>w.early[0]&&w.night[0]>.05&&w.night[0]<.35&&w.night[1]<.01);
    const s=await ev(()=>{const A=__A,T=A.TW.get,m=A.WS.m,L=window.__L13;A.G.clock=247;A.TR.k=1;A.TR.from=null;A.TR.ph=null;A.worldDraw2(performance.now());const cv=m.__l13sh&&m.__l13sh.cv;if(!cv)return {cv:0};
      const sum=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let s=0;for(let i=3;i<d.length;i+=4)s+=d[i];return s;};return {cv:cv.length,day:sum(cv[0]),dusk:sum(cv[1]),dawn:sum(cv[2]),w:cv[0].width,h:cv[0].height,mw:Math.ceil(m.w*16/4),bld:(m.bld||[]).length};});
    chk(`2D: three masks per map at 4 px cells (${s.w}x${s.h}, ${s.bld} buildings); the dusk shadow is longer than the day's (${s.dusk} > ${s.day}), dawn too (${s.dawn})`,s.cv===3&&s.w===s.mw&&s.day>0&&s.dusk>s.day*1.3&&s.dawn>s.day*1.3);
    const d=await ev(([SC,LU])=>{const A=__A,sc=(0,eval)(SC),lu=(0,eval)(LU),L=window.__L13,m=A.WS.m;sc({map:'t0',clock:247});const cx=Math.round(A.WS.cam.x),cy=Math.round(A.WS.cam.y),vw=A.WS.vw,vh=A.WS.vh;
      // the ground just east of the foot of every building in view (the day sun stands west-north-west, so the shadow falls east and a little south), on open ground: the one the shadow darkens most
      const pts=[];for(const b of (m.bld||[])){const x=(b.x+b.w)*16+4-cx,y=(b.y+b.h)*16-14-cy;const tx=b.x+b.w,ty=b.y+b.h-1;if(x>8&&y>8&&x<vw-14&&y<vh-14&&!A.solidAt(m,tx,ty))pts.push([x,y,12,12]);}
      const whole=[0,0,vw,vh],on={w:lu(whole),p:pts.map(b=>lu(b))};L.off=true;sc({map:'t0',clock:247});const off={w:lu(whole),p:pts.map(b=>lu(b))};L.off=false;sc({map:'t0',clock:247});
      let best=null;pts.forEach((b,i)=>{const d=off.p[i]-on.p[i];if(best==null||d>best)best=d;});return {on:on.w,off:off.w,best,pts:pts.length,n:L.n.shDraw};},[SCENE,LUMA]);
    chk(`2D: a town by day is darker with the masks on (${d.on.toFixed(1)} < ${d.off.toFixed(1)}), the ground east of a building's foot darker by ${d.best==null?'(no corner in view)':d.best.toFixed(1)} (${d.pts} corners); ${d.n} shadow draws`,d.on<d.off-1&&(d.best==null||d.best>3)&&d.n>0);
    const errs1=await ev(()=>window.__L13.err);chk('1: no light13 errors, no console errors',errs1.length===0&&H.errs.length===0||JSON.stringify(errs1.concat(H.errs)));await H.browser.close();
    // HD-2D: the suns and the look
    const H2=await boot('high');const k=await H2.ev(([SC])=>{const A=__A,sc=(0,eval)(SC),T=A.TW.get,L=window.__L13,m=A.WS.m,look=T('hdLook');sc({map:'t0',clock:247});const d=look(m,performance.now());const on={sun:d.sun.slice(),amb:d.amb.slice(),shW:d.shW.slice()};
      sc({map:'t0',clock:700});const n=look(m,performance.now());const non={amb:n.amb.slice(),lamp:n.lamp,shW:n.shW.slice()};L.off=true;const d2=look(m,performance.now());const noff={amb:d2.amb.slice(),lamp:d2.lamp};sc({map:'t0',clock:247});const d3=look(m,performance.now());const off={sun:d3.sun.slice(),amb:d3.amb.slice()};L.off=false;
      return {live:A.HD.live,suns:A.HD2D.suns,on,off,non,noff};},[SCENE]);
    const ratio=c=>c[0]/Math.max(.01,c[2]);
    chk(`HD-2D (live ${k.live}): the realm sun stands north-west by day (${k.suns.day}), low west at dusk, low east at dawn`,k.live&&k.suns.day[0]<0&&k.suns.day[2]<0&&k.suns.dusk[0]<-.8&&k.suns.dawn[0]>.8);
    chk(`HD-2D: by day the key is warmer (sun r/b ${ratio(k.on.sun).toFixed(2)} > ${ratio(k.off.sun).toFixed(2)}) and the fill cooler (amb r/b ${ratio(k.on.amb).toFixed(2)} < ${ratio(k.off.amb).toFixed(2)}), the day shadow weighted ${k.on.shW[0].toFixed(2)}`,ratio(k.on.sun)>ratio(k.off.sun)+.05&&ratio(k.on.amb)<ratio(k.off.amb)-.03&&k.on.shW[0]>.4);
    chk(`HD-2D: at night the ambient is darker (${k.non.amb.map(v=>v.toFixed(2))} < ${k.noff.amb.map(v=>v.toFixed(2))}) and the lamps weigh more (${k.non.lamp.toFixed(2)} > ${k.noff.lamp.toFixed(2)})`,k.non.amb[0]<k.noff.amb[0]&&k.non.amb[2]<k.noff.amb[2]&&k.non.lamp>k.noff.lamp);
    await H2.browser.close();}
  // ---------- 2. night and interior pools (2D) ----------
  if(want('2')){const H=await boot('low');const {ev}=H;
    const r=await ev(([SC,LU])=>{const A=__A,sc=(0,eval)(SC),lu=(0,eval)(LU),L=window.__L13;sc({map:'t0',clock:700});const m=A.WS.m,cx=Math.round(A.WS.cam.x),cy=Math.round(A.WS.cam.y),vw=A.WS.vw,vh=A.WS.vh;
      const lights=(m.lights||[]).concat(m.tl||[]).filter(q=>q[3]==='lamp'&&q[0]-cx>20&&q[0]-cx<vw-20&&q[1]-cy>20&&q[1]-cy<vh-30);if(!lights.length)return {none:true};const Lt=lights[0],near=[Lt[0]-cx-6,Lt[1]-cy+4,12,8];
      // a spot of open ground at least 70 px from every light
      let far=null;for(let y=24;y<vh-24&&!far;y+=8)for(let x=24;x<vw-24;x+=8){const wx=x+cx,wy=y+cy;if(A.solidAt(m,Math.floor(wx/16),Math.floor(wy/16)))continue;if(Math.abs(wx-(A.WS.px+8))<40&&Math.abs(wy-(A.WS.py+8))<40)continue;if((m.lights||[]).concat(m.tl||[]).every(q=>Math.hypot(q[0]-wx,q[1]-wy)>70)){far=[x-3,y-3,6,6];break;}}
      const on={near:lu(near),far:far&&lu(far)};L.off=true;sc({map:'t0',clock:700});const off={near:lu(near),far:far&&lu(far)};L.off=false;return {on,off,far:!!far,n:L.n.lt};},[SCENE,LUMA]);
    chk(`2D night in a town: the ground beside a lamp is brighter with the pools (${r.none?'no lamp in view':r.on.near.toFixed(1)+' > '+r.off.near.toFixed(1)}), the ground away from the lights darker (${r.far?r.on.far.toFixed(1)+' < '+r.off.far.toFixed(1):'no far spot'})`,!r.none&&r.on.near>r.off.near+4&&(!r.far||r.on.far<r.off.far-2));
    const f=await ev(([SC,LU])=>{const A=__A,sc=(0,eval)(SC),lu=(0,eval)(LU),L=window.__L13;sc({map:'f1',clock:700});sc({map:"d1",clock:700});/* the dungeon is built from its field */const m=A.WS.m,cx=Math.round(A.WS.cam.x),cy=Math.round(A.WS.cam.y),vw=A.WS.vw,vh=A.WS.vh;
      const all=(m.lights||[]).concat(m.tl||[]);let Lt=all.find(q=>(q[3]==='torch'||q[3]==='fire')&&q[0]-cx>20&&q[0]-cx<vw-20&&q[1]-cy>20&&q[1]-cy<vh-30);
      if(!Lt){// walk the camera to the first torch of the map
        Lt=all.find(q=>q[3]==='torch'||q[3]==='fire');if(!Lt)return {none:true};A.placeAt('d1',Math.max(1,Math.floor(Lt[0]/16)),Math.max(1,Math.floor(Lt[1]/16)+2),'u');A.WS.cam=null;A.worldDraw2(performance.now());}
      const cx2=Math.round(A.WS.cam.x),cy2=Math.round(A.WS.cam.y),box=[Lt[0]-cx2-10,Lt[1]-cy2+8,20,10];const t=performance.now()+1e4,TS=[0,47,113,251,509],at=(k,off,rm)=>{L.off=off;A.META.cfg.rmotion=rm;A.worldDraw2(t+k);const v=lu(box);L.off=false;A.META.cfg.rmotion=false;return v;};
      /* the pool's own share at each of five times (on minus off at the same instant), so the base flame's flicker cancels out; one 47 ms pair landed where the flicker barely moved one run in four */
      const on=TS.map(k=>at(k,false,false)),of=TS.map(k=>at(k,true,false)),rm=TS.map(k=>at(k,false,true)),of2=TS.map(k=>at(k,true,true));
      const dP=on.map((v,i)=>v-of[i]),dR=rm.map((v,i)=>v-of2[i]),R=x=>Math.max(...x)-Math.min(...x);return {a:on[0],b:on[0]+R(dP),o:of[0],o2:of[0],c:rm[0],d:rm[0]+R(dR),type:Lt[3]};},[SCENE,LUMA]);
    chk(`2D interior (d1): a ${f.type||'?'} pools light on the floor (${f.none?'no fire light':f.a.toFixed(1)+' > '+f.o.toFixed(1)}) and flickers (pool's own luma range over five frames ${f.none?'':(f.b-f.a).toFixed(2)} > .6); no flicker of its own under reduced motion (range ${f.none?'':(f.d-f.c).toFixed(2)}, under a third of the live flicker: the rest is additive clipping against the base flame, which flickers itself)`,!f.none&&f.a>f.o+2&&Math.abs(f.a-f.b)>.6&&Math.abs(f.c-f.d)<=Math.max(.3,Math.abs(f.a-f.b)/3));
    const errs2=await ev(()=>window.__L13.err);chk('2: no light13 errors, no console errors',errs2.length===0&&H.errs.length===0||JSON.stringify(errs2.concat(H.errs)));await H.browser.close();}
  // ---------- 3. particles ----------
  if(want('3')){const H=await boot('low');const {ev}=H;
    const p=await ev(([SC])=>{const A=__A,sc=(0,eval)(SC),L=window.__L13,W=A.W63;const out={};
      const count=(id,clock,cols)=>{const s=sc({map:id,clock});const m=A.WS.m,n={};let tot=0;const emit=(x,z,h,w,hh,c,a,g)=>{tot++;n[c]=(n[c]||0)+1;};const e0=L.n.em;W.wfxRun('amb',m,5000,A.WS.cam.x+A.WS.vw/2,A.WS.cam.y+A.WS.vh/2,512,384,emit);const mine=L.n.em-e0;
        const hit=cols.reduce((s,c)=>s+(n[c]||0),0);return {id:s.id,mine,hit,tot,kind:m.kind,rk:(A.TW.get('l13Realm'))(m)};};
      out.firefly=count('f4',700,['#f4ffc0','#d8ff8c']);out.pollen=count('f4',247,['#fff6c0','#ffffff']);out.ash=count('f1',247,['#8a8080','#b0a8a0']);out.ember=count('f1',247,['#ff9a3a','#ffd070']);out.frost=count('f2',247,['#eefcff','#d8f4ff']);out.dust=count('f3',247,['#f0d8a8','#e8c890']);
      try{out.spore=count('x0',247,['#7cf0c0','#b8ff9a']);}catch(e){out.spore={err:String(e.message)};}try{A.getMap('s0');out.rift=count('s0',247,['#c8a0ff','#62e8e0']);}catch(e){out.rift={err:String(e.message)};}
      // off: nothing of mine; under a menu: the same picture twice
      L.off=true;const o=count('f1',247,['#8a8080','#b0a8a0','#ff9a3a','#ffd070']);L.off=false;out.off=o.mine;
      sc({map:'f1',clock:247});const m=A.WS.m,snap=ts=>{const a=[];W.wfxRun('amb',m,ts,A.WS.cam.x+A.WS.vw/2,A.WS.cam.y+A.WS.vh/2,512,384,(x,z,h,w,hh,c)=>{if(c==='#8a8080'||c==='#b0a8a0')a.push(Math.round(x)+','+Math.round(z)+','+Math.round(h));});return a.join('|');};
      L.pauseT=0;L.pauseOff=0;const s1=snap(9000),s2=snap(9600);A.V.modal={type:'menu',tab:'settings'};const s3=snap(10000),s4=snap(10600);A.V.modal=null;const s5=snap(11000),s6=snap(11600);/* the clock resumes where it stopped: the first frame after the menu is the one under it */out.menu={moves:s1!==s2,held:s3===s4,same:s5===s4,resumes:s6!==s5};return out;},[SCENE]);
    const ok=(k,min)=>p[k]&&!p[k].err&&p[k].hit>=min;
    chk(`fireflies at night in a meadow field (${p.firefly.id} ${p.firefly.rk}: ${p.firefly.hit}), pollen by day (${p.pollen.hit})`,ok('firefly',3)&&ok('pollen',3));
    chk(`ash and embers in Kilnscar (${p.ash.id} ${p.ash.rk}: ${p.ash.hit} ash, ${p.ember.hit} embers)`,p.ash.rk==='deeps'&&ok('ash',3)&&ok('ember',2));
    chk(`frost in the tundra (${p.frost.rk}: ${p.frost.hit}), dust in the mesa (${p.dust.rk}: ${p.dust.hit})`,p.frost.rk==='tundra'&&ok('frost',2)&&p.dust.rk==='mesa'&&ok('dust',3));
    chk(`spores in the Breach (${JSON.stringify(p.spore)}), void motes in the Rift (${JSON.stringify(p.rift)})`,ok('spore',3)&&ok('rift',3));
    chk(`nothing with the module off (${p.off}); the particles move (${p.menu.moves}), hold still under a menu (${p.menu.held}), resume where they stopped (${p.menu.same}) and move on (${p.menu.resumes})`,p.off===0&&p.menu.moves&&p.menu.held&&p.menu.same&&p.menu.resumes);
    const errs3=await ev(()=>window.__L13.err);chk('3: no light13 errors, no console errors',errs3.length===0&&H.errs.length===0||JSON.stringify(errs3.concat(H.errs)));await H.browser.close();}
  // ---------- 4. transitions ----------
  if(want('4')){for(const [t,w,h] of [['low',1000,560],['high',390,844]]){const H=await boot(t,{w,h,mobile:w<600,dpr:2});const {ev}=H;
    const r=await ev(([SC,LU])=>{const A=__A,sc=(0,eval)(SC),lu=(0,eval)(LU),L=window.__L13,WS=A.WS,cv=WS.cv,RW=cv._rw||cv.width,RH=cv._rh||cv.height,ctx=cv.getContext('2d');const s=sc({map:'t0',clock:247});const vw=WS.vw,vh=WS.vh,RW2=RW,RH2=RH;
      const quarters=()=>{const d=ctx.getImageData(0,0,RW2,RH2).data,c=[0,0,0,0],n=[0,0,0,0];for(let y=2;y<RH2;y+=6)for(let x=2;x<RW2;x+=6){const k=(y<RH2/2?0:2)+(x<RW2/2?0:1),i=(y*RW2+x)*4;n[k]++;if(d[i]>200&&d[i+1]>200&&d[i+2]>200)c[k]++;}return c.map((v,i)=>+(v/n[i]).toFixed(2));};
      const dark=()=>{const d=ctx.getImageData(0,0,RW2,RH2).data;let k=0;for(let y=RH2>>1;y<RH2;y+=3)for(let x=RW2>>1;x<RW2;x+=3){const i=(y*RW2+x)*4;if(d[i+3]>200&&d[i]<16&&d[i+1]<12&&d[i+2]<24)k++;}return k;};
      const T=performance.now()+2e4;const plain=lu([0,0,vw,vh]),d0=dark(),pd=ctx.getImageData(0,0,RW2,RH2).data;const cover=()=>{const d=ctx.getImageData(0,0,RW2,RH2).data;let n=0,k=0;for(let i=0;i<d.length;i+=4*7){n++;if(Math.abs(d[i]-pd[i])+Math.abs(d[i+1]-pd[i+1])+Math.abs(d[i+2]-pd[i+2])>24)k++;}return k/n;};WS.flash=T;WS.lock=true;const q=[0,0,0,0];for(const p of [.2,.5]){A.worldDraw2(T+p*460);quarters().forEach((v,i)=>{q[i]=Math.max(q[i],v);});}
      A.worldDraw2(T+.9*460);const late=lu([0,0,vw,vh]),cov=cover();// the shards cover the view in the realm's colour, darkening toward the cut
      A.worldDraw2(T+700);WS.lock=false;const left=dark()-d0,after=lu([0,0,vw,vh]);WS.flash=0;L.tr.flash=0;A.worldDraw2(T+700);const ref=lu([0,0,vw,vh]);/* the same moment without the flash */
      // the doorway iris: the hero's surroundings stay visible at p = .5 while the corners are dark
      const hero=A.TW.get('l13Hero')([0,0],vw,vh),fc=[hero[0]<vw/2?vw-12:2,hero[1]<vh/2?vh-12:2,10,10];/* the corner farthest from the hero */const T2=T+5000;WS.fade=T2;A.worldDraw2(T2+115);const mid=lu([hero[0]-10,hero[1]-10,20,20]),corner=lu(fc),corner2=lu([hero[0]<vw/2?vw-12:2,hero[1]<vh/2?2:vh-12,10,10]);
      A.worldDraw2(T2+228);const closed=lu([0,0,vw,vh]);WS.fade=0;const T3=T2+600;WS.fadeIn=T3;A.worldDraw2(T3+140);const midIn=lu([hero[0]-10,hero[1]-10,20,20]),cornerIn=lu(fc);WS.fadeIn=0;A.worldDraw2(T3+2000);
      // the return from a won battle: a bloom (bright), not a fade (dark)
      const T4=T3+3000;L.bloom=T4-100;WS.fadeIn=T4;A.worldDraw2(T4+60);const bloom=lu([0,0,vw,vh]);WS.fadeIn=0;L.bloom=0;A.worldDraw2(T4+2000);
      // reduced motion: plain fades, the hero's spot as dark as the corners
      A.META.cfg.rmotion=true;const T5=T4+5000;WS.fade=T5;A.worldDraw2(T5+115);const rmMid=lu([hero[0]-10,hero[1]-10,20,20]),rmCorner=lu(fc);WS.fade=0;A.META.cfg.rmotion=false;A.worldDraw2(T5+2000);
      return {hd:s.hd,q,plain,late,cov,left,after,ref,mid,corner,corner2,closed,midIn,cornerIn,bloom,rmMid,rmCorner,hero,vw,vh,n:L.n.tr,err:L.err};},[SCENE,LUMA]);
    const tag=`${t} ${w}x${h} (${r.hd?'HD-2D':'2D'})`;
    chk(`${tag}: the battle start still whitens every quarter at p = .2 and .5 (${r.q.join(' / ')})`,r.q.every(v=>v>=.6));
    chk(`${tag}: at p = .9 the shards cover the view (${(r.cov*100).toFixed(0)}% of the pixels changed), darkening toward the cut (luma ${r.late.toFixed(1)} < ${r.plain.toFixed(1)}), nothing left behind after it (${r.left} dark pixels, luma ${r.after.toFixed(1)} against ${r.ref.toFixed(1)} without the flash)`,r.cov>=.9&&r.late<r.plain*.85&&r.left<=4&&Math.abs(r.after-r.ref)<1.5);
    chk(`${tag}: doorway iris halfway out: the hero's spot stays lit (${r.mid.toFixed(1)}) while the far corners are dark (${r.corner.toFixed(1)}, ${r.corner2.toFixed(1)}); closed at the end (${r.closed.toFixed(1)}); halfway in: hero ${r.midIn.toFixed(1)}, far corner ${r.cornerIn.toFixed(1)}`,r.mid>30&&r.corner<8&&r.corner2<12&&r.closed<6&&r.midIn>30&&r.cornerIn<8);
    chk(`${tag}: the return from a won battle is a bloom (luma ${r.bloom.toFixed(1)} > ${r.plain.toFixed(1)})`,r.bloom>r.plain+20);
    chk(`${tag}: reduced motion keeps the plain fade (hero ${r.rmMid.toFixed(1)} about the corner ${r.rmCorner.toFixed(1)})`,Math.abs(r.rmMid-r.rmCorner)<25&&r.rmCorner<r.plain);
    chk(`${tag}: ${r.n} transition frames, no light13 errors, no console errors`,r.n>0&&r.err.length===0&&H.errs.length===0||JSON.stringify(r.err.concat(H.errs)));
    await H.browser.close();}}
  // ---------- 5. the idle limiter still holds on a phone ----------
  if(want('5')){const H=await boot('high',{w:390,h:844,mobile:true,dpr:3,before:p=>p.addInitScript(()=>{window.__P12F=1;})});const {ev}=H;
    const SYN=`(a)=>{const T=__A.TW.get,P=T('P12'),wd=T('worldDraw'),n0=Object.assign({},P.n);let t=a.t0;P.inLoop=1;try{for(let i=0;i<a.n;i++){t+=a.dt;wd(t);}}finally{P.inLoop=0;}return {draw:P.n.wDraw-n0.wDraw,skip:P.n.wSkip-n0.wSkip,t};}`;
    await ev(([SC])=>{const A=__A,sc=(0,eval)(SC);sc({map:'t0',clock:700});A.WS.held=[];A.WS.target=null;A.WS.path=null;},[SCENE]);
    const run=(a)=>ev(`(${SYN})`+'('+JSON.stringify(a)+')');let t0=await ev(()=>performance.now()+2e5);let r=await run({t0,n:40,dt:16.7});r=await run({t0:r.t,n:60,dt:16.7});const still=r.draw;
    await ev(()=>{__A.WS.held=['r'];});r=await run({t0:r.t,n:60,dt:16.7});const walk=r.draw;await ev(()=>{__A.WS.held=[];});r=await run({t0:r.t,n:60,dt:16.7});r=await run({t0:r.t,n:60,dt:16.7});const rest=r.draw;
    // a transition keeps the frames coming, then the limiter settles again
    await ev(t=>{__A.WS.fadeIn=t;},r.t);r=await run({t0:r.t,n:12,dt:16.7});const trans=r.draw;r=await run({t0:r.t,n:60,dt:16.7});r=await run({t0:r.t,n:60,dt:16.7});const settled=r.draw;
    const info=await ev(()=>({live:__A.HD.live,phone:__A.TW.get('p12Phone')(),err:window.__L13.err,em:window.__L13.n.em}));
    chk(`phone 390x844 dpr 3 High (HD-2D ${info.live}, phone ${info.phone}), night town with the pools and particles: still ${still}/60 (30 a second), walking ${walk}/60, at rest again ${rest}/60, during a fade in ${trans}/12 (every frame), settled ${settled}/60`,info.phone&&still>=28&&still<=32&&walk===60&&rest>=28&&rest<=32&&trans===12&&settled>=28&&settled<=32);
    chk('5: no light13 errors, no console errors',info.err.length===0&&H.errs.length===0||JSON.stringify(info.err.concat(H.errs)));await H.browser.close();}
  const H=await open({});await done(H);})().catch(e=>{console.error(e);process.exit(1);});
