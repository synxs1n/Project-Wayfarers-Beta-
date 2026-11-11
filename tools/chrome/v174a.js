// v0.19.2 worldart12.js: field exits on land, entrances with volume, Sanctum side carpets, weather anchored in world space, gather nodes as props, the Mimic as a chest.
//  1. every field exit (to the next area and back to town) has ground, not void, beside and under it: drawAudit().exitLand is empty on every field of every realm over
//     many journeys, and the old generator (window.__WA12.off) does leave void there (bug reproduced)
//  2. weather: when the hero walks, every weather particle on screen moves by the camera's delta (the same shift for all of them): 2D at Medium and Low (each layer: far, mid,
//     near, banks), the HD-2D overlay, and the HD-2D scene's quads keep their world positions. The old parallax (.82, 1, 1.35) shows three different shifts
//  3. Sanctum: the garden and the hall side carpets are panels (flagstone seam, dark edge, gold border, weave) and fill the nave to the pillars
//  4. gather nodes: ten sprites in the world's palette (outline, three tones, a contact shadow), different from the icon piles, the 2D draw and the HD-2D card both use them
//  5. Mimic: a chest with teeth top and bottom in the open mouth (idle, breathing, lunge), a tongue, the realm chest's wood and gold
//  6. entrances: den mouths and lair fronts have a lit frame, props each side, a threshold, a lit upper left rim and a shaded right side, in every realm's sprite
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v174a.js
const {open,chk,done}=require('./pw');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:true,hints:false,tips:false,hd2d:true}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const only=process.env.ONLY||'',want=n=>!only||only.split(',').includes(n);
// every page call is bounded: a call that never comes back (a starved frame, a page that stopped) fails the test with a name instead of hanging it
const bound=(p,ms,what)=>{let t;return Promise.race([p,new Promise((_,rej)=>{t=setTimeout(()=>rej(new Error('timeout after '+ms+' ms: '+what)),ms);})]).finally(()=>clearTimeout(t));};
setTimeout(()=>{console.log('FAIL watchdog: v174a ran over 900 s');process.exit(1);},900000).unref();
// poll (from node, not from the page's frames) until fn gives the same JSON twice in a row, at most ms; returns the last value
async function rest(H,fn,ms){const t0=Date.now();let prev=null,v=null;while(Date.now()-t0<(ms||5000)){try{v=JSON.stringify(await bound(H.page.evaluate(fn),4000,'rest'));}catch(e){v='error: '+e.message;}if(v===prev&&!/^error/.test(v))return JSON.parse(v);prev=v;await H.wait(150);}return null;}
async function boot(t,w,h){const H=await open({w:w||430,h:h||760,mobile:true,dpr:1,pre:META(t)});const ev0=H.ev;H.ev=(f,a)=>bound(ev0(f,a),120000,'page call');const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.wait(500);return H;}
(async()=>{
  // ---------- 1. exits on land ----------
  if(want('1')){const H=await boot('low');const {ev}=H;
    const scan=off=>ev(([off,N])=>{const A=__A,G=A.G,W=window.__WA12,iss=A.TW.get('mapIssues'),out={fields:0,bad:0,badMaps:0,byTheme:{},ex:[],mi:0,err:0,landed:0,groups:0};W.off=off;const seed0=G.run.seed,ord0=G.run.order.slice();
      try{for(let k=0;k<N;k++){G.run.seed=k*7919+101;const NZ=A.ZONES.length;G.run.order=ord0.map((z,i)=>(k*5+i*7)%NZ);G.sub=null;A.resetMaps();
        for(let s=0;s<5;s++){let m;try{m=A.getMap('f'+s);}catch(e){out.err++;continue;}out.fields++;const au=A.W71.drawAudit(m),e=au.exitLand||[];out.groups+=W.api.exitGroups(m).length;
          if(e.length){out.bad+=e.length;out.badMaps++;out.byTheme[m.theme]=(out.byTheme[m.theme]||0)+1;if(out.ex.length<3)out.ex.push(m.id+':'+m.theme+' '+JSON.stringify(e[0]));}
          out.landed+=m.exitLand||0;try{out.mi+=iss(m).length;}catch(x){}
          // every exit tile still sits on walkable ground or road
          m.exits.forEach(x=>{const c=m.t[x.y][x.x];if(c==='~'||c==='#'||c==='Z')out.err++;});}}}
      finally{G.run.seed=seed0;G.run.order=ord0;A.resetMaps();W.off=false;}return out;},[off,30]);
    const old=await scan(true),now=await scan(false);
    console.log('old:',JSON.stringify(old));console.log('now:',JSON.stringify(now));
    chk(`the old generator left void in the exit apron (${old.badMaps} of ${old.fields} fields, ${old.bad} tiles; ${JSON.stringify(old.byTheme)}): bug reproduced`,old.badMaps>=15||JSON.stringify(old));
    chk(`now no field exit has void beside or under it (${now.fields} fields, ${now.groups} exits, ${now.landed} void tiles turned to ground)`,now.fields>=140&&now.bad===0&&now.landed>0||JSON.stringify(now));
    chk(`every exit tile is open ground or road, and the path checks (mapIssues) are no worse (${now.mi} against ${old.mi}); no generation error (${now.err})`,now.err===0&&now.mi<=old.mi);
    await H.browser.close();}
  // ---------- 2. weather in world space ----------
  // Deterministic: no hero walking, no camera easing, no clock. The 2D weather is a pure function of (map, weather, time, camera offset), so it is drawn twice at the same
  // time with the camera offset 80 px apart (the hero stays at the same world spot), and each particle of frame A is looked up in frame B at exactly the place the camera delta
  // puts it. A particle whose new place is off the view (it wrapped round the lattice) or within 90 px of the hero's face (the face clearing moves with the hero) is skipped.
  const WX=['rain','storm','snow','blizzard','fog','gale','sand','ashfall'];
  const GRAB=`([w,ox,mode])=>{const A=__A,W=A.W7,G=A.G,m=A.WS.m,vw=420,vh=320,cv=document.createElement('canvas');cv.width=vw;cv.height=vh;const x=cv.getContext('2d'),out=[];
    G.weather[m.s]=w;A.TR.wx.key=null;A.trUpdate(1);const f0=x.fillRect,d0=x.drawImage;
    const R=Math.round;x.fillRect=function(a,b,c,d){if(c*d<2500)out.push([R(a),R(b),R(c),R(d)]);return f0.apply(this,arguments);};
    x.drawImage=function(im,a,b,c,d){if(arguments.length===3)out.push([R(a),R(b),im.width,im.height]);else if(arguments.length===5)out.push([R(a),R(b),R(c),R(d)]);return d0.apply(this,arguments);};
    try{W.w7World(x,mode||'w2d',m,ox,100,vw,vh,9000);}finally{delete x.fillRect;delete x.drawImage;}
    return {r:out,hero:[Math.round(A.WS.px)+8-ox,Math.round(A.WS.py)+16-100],vw,vh,n:W.W7.stats.n};}`;
  const SHIFT=async(H,w,dx)=>{const a=await H.ev(`(${GRAB})(${JSON.stringify([w,100])})`),b=await H.ev(`(${GRAB})(${JSON.stringify([w,100+dx])})`);
    return H.ev(([a,b,dx])=>{const key=q=>q[0]+':'+q[1]+':'+q[2]+':'+q[3],bs=new Set(b.r.map(key));let seen=0,moved=0,skippedWrap=0,skippedHero=0;
      a.r.forEach(q=>{const nx=q[0]-dx;if(nx<-q[2]||nx>a.vw){skippedWrap++;return;}
        if((Math.abs(q[0]-a.hero[0])<90&&Math.abs(q[1]-a.hero[1])<90)||(Math.abs(nx-b.hero[0])<90&&Math.abs(q[1]-b.hero[1])<90)){skippedHero++;return;}
        seen++;if([...[-1,0,1]].some(e=>bs.has((nx+e)+':'+q[1]+':'+q[2]+':'+q[3])))moved++;});
      return {seen,moved,share:seen?moved/seen:0,skippedWrap,skippedHero,na:a.r.length,nb:b.r.length,n:a.n};},[a,b,dx]);};
  const PLACE2=`(()=>{const A=__A,G=A.G,m=A.getMap('f1');G.clock=150;let best=null;for(let y=8;y<m.h-8&&!best;y++)for(let x=8;x<m.w-8;x++){if(!A.solidAt(m,x,y)){best=[x,y];break;}}A.V.modal=null;A.WS.dlg=null;A.placeAt('f1',best[0],best[1],'d');A.render();return best;})()`;
  if(want('2'))for(const tier of ['medium','low']){const H=await boot(tier);const {ev}=H;await ev(()=>{__A.META.cfg.hd2d=false;__A.META.cfg.rmotion=true;__A.gfxApply();});
    await ev(PLACE2);const rows=[];for(const w of WX){rows.push([w,await SHIFT(H,w,80)]);}
    const seen=rows.reduce((a,[w,r])=>a+r.seen,0),moved=rows.reduce((a,[w,r])=>a+r.moved,0);
    chk(`2D ${tier}: every weather draws particles (${rows.map(([w,r])=>w+' '+r.na).join(', ')})`,rows.every(([w,r])=>r.na>=4)||JSON.stringify(rows));
    chk(`2D ${tier}: with the camera 80 px on, each particle is exactly 80 px along on screen, in every weather: ${moved} of ${seen} (${rows.map(([w,r])=>`${w} ${r.moved}/${r.seen}`).join(', ')}; wrapped and face-cleared ones skipped)`,
      seen>=40&&moved>=seen*.97&&rows.every(([w,r])=>r.moved>=r.seen*.9)||JSON.stringify(rows));
    if(tier==='medium'){// the old parallax: far layer 18% behind the camera, near layer 35% ahead: bug reproduced
      await ev(()=>{const P=__A.W7.WX7.par;P[0]=.82;P[2]=1.35;});const r=await SHIFT(H,'rain',80);await ev(()=>{const P=__A.W7.WX7.par;P[0]=1;P[2]=1;});const rn=await SHIFT(H,'rain',80);
      chk(`rain with the old parallax (.82, 1, 1.35): only ${r.moved} of ${r.seen} particles moved exactly with the camera (the far and near layers did not); now ${rn.moved} of ${rn.seen}`,r.seen>=8&&r.moved<r.seen*.8&&rn.seen>=8&&rn.moved>=rn.seen*.97||JSON.stringify({r,rn}));}
    chk(`2D ${tier}: WX7.par and WX7.fogPar are 1 for every layer`,await ev(()=>{const W=__A.W7.WX7;return W.par.every(v=>v===1)&&W.fogPar.every(v=>v===1);}));
    await H.browser.close();}
  if(want('2')){// HD-2D: the overlay's particles follow the ground exactly, the scene's quads keep their world positions
    const H=await boot('medium');const {ev}=H;await ev(()=>{__A.META.cfg.hd2d=true;__A.META.cfg.rmotion=true;__A.gfxApply();});
    const live=await ev(()=>!!(__A.HD.live||(__A.hdActive&&__A.hdActive())));
    await ev(PLACE2);
    const rec=()=>ev(`(()=>{const A=__A,HD=A.HD,out=[];const q0=HD.dynB.quad;HD.dynB.quad=function(P){out.push([P[0],P[2],P[7]]);return q0.apply(this,arguments);};try{A.worldDraw2(40000);}finally{HD.dynB.quad=q0;}return {r:out,cam:[HD.cam.x,HD.cam.z]};})()`);
    const rows=[];for(const w of ['rain','snow','fog']){await ev(w=>{__A.G.weather[1]=w;__A.TR.wx.key=null;__A.trUpdate(1);},w);
      await rest(H,()=>[Math.round(__A.HD.cam.x),Math.round(__A.HD.cam.z)],6000);const a=await rec();
      const p=await ev(()=>[__A.WS.x,__A.WS.y]);await ev(([p])=>{__A.placeAt('f1',p[0]+5,p[1],'d');__A.render();},[p]);
      await rest(H,()=>[Math.round(__A.HD.cam.x),Math.round(__A.HD.cam.z)],8000);const b=await rec();
      const key=q=>Math.round(q[0]*10)+','+Math.round(q[1]*10)+','+Math.round(q[2]);const sa=new Set(a.r.map(key));let same=0;b.r.forEach(q=>{if(sa.has(key(q)))same++;});
      rows.push([w,{na:a.r.length,nb:b.r.length,same,moved:Math.round(b.cam[0]-a.cam[0])}]);
      await ev(([p])=>{__A.placeAt('f1',p[0],p[1],'d');},[p]);}
    chk(`HD-2D: the scene's weather quads keep their world positions when the camera moves (${rows.map(([w,r])=>`${w}: ${r.same} of ${r.nb} quads unchanged, camera ${r.moved}`).join('; ')})`,live&&rows.every(([w,r])=>r.nb>=40&&r.same>=r.nb*.5&&Math.abs(r.moved)>=20)||JSON.stringify({live,rows}));
    const ov=await ev(()=>{const A=__A,W=A.W7,m=A.WS.m,cv=document.createElement('canvas');cv.width=420;cv.height=320;const x=cv.getContext('2d');A.G.weather[m.s]='rain';A.TR.wx.key=null;A.trUpdate(1);
      const grab=(ox)=>{const o=[];const d0=x.drawImage;x.drawImage=function(im,a,b){if(arguments.length===3)o.push([a,b,im.width,im.height]);return d0.apply(this,arguments);};try{W.w7World(x,'ov',m,ox,60,420,320,9000);}finally{delete x.drawImage;}return o;};
      const a=grab(100),b=grab(120),has=(l,px,py,w,h)=>l.some(q=>Math.abs(q[0]-px)<=1&&q[1]===py&&q[2]===w&&q[3]===h);let seen=0,same=0;a.forEach(r=>{const nx=r[0]-20;if(nx<-10||nx>400)return;seen++;if(has(b,nx,r[1],r[2],r[3]))same++;});return {n:a.length,seen,same};});
    chk(`HD-2D overlay: its particles follow the ground exactly (camera 20 px: ${ov.same} of ${ov.seen} moved 20 px)`,ov.seen>=2&&ov.same>=ov.seen*.85||JSON.stringify(ov));
    await H.browser.close();}
  // ---------- 3. Sanctum side carpets ----------
  if(want('3')){const H=await boot('low');const {ev}=H;
    const R=await ev(()=>{const A=__A,G=A.G,T=A.TW.get,W=window.__WA12,out={};
      for(const [zi,key] of [[6,'thistle'],[8,'strand'],[10,'deeps'],[12,'tundra'],[14,'peaks'],[20,'starless']]){G.run.seed=424242;G.run.order[1]=zi;A.resetMaps();const f=A.getMap('f1'),c=(f.caves||[]).find(c=>c.kind==='fort');if(!c){out[key]={no:1};continue;}
        A.placeAt('f1',c.out[0],c.out[1],'d');A.enterCave(c,1);A.V.modal=null;const m=A.WS.m,o=T('sncGeo')(m),yk=T('sncYK');
        const tile=(x,y,off)=>{W.off=off;const cv=document.createElement('canvas');cv.width=16;cv.height=16;const x2=cv.getContext('2d');x2.translate(-x*16,-y*16);T('sncTile')(x2,m,x,y,0);W.off=false;const d=x2.getImageData(0,0,16,16).data;return (px,py)=>{const i=(py*16+px)*4;return [d[i],d[i+1],d[i+2]];};};
        // a garden tile beside the runner: the panel's right edge faces the runner (cx-2 in the canonical frame; the hall turns with the map, so find the tile by kind)
        let seam=null,yardN=0,panelN=0,pill=0;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const k=m.t[y][x]!=='#'?yk(o,x,y):'out';if(k==='grass'||k==='gravel'){yardN++;}if(m.t[y][x]==='P'&&(k==='grass'||k==='gravel'))pill++;}
        // the tile next to the runner on its west side (the runner is the 3 tile carpet set)
        const cs=[...o.carpet].map(s=>s.split(',').map(Number));let probe=null;for(const [x,y] of cs){const k=yk(o,x-2,y);if(yk(o,x-1,y)==='path'&&(k==='grass'||k==='gravel')&&yk(o,x-3,y)===k){probe=[x-2,y];break;}}
        const dir=m.fo&&m.fo.dir;const r={yardN,pill,probe,dir};
        if(probe){const [x,y]=probe,on=tile(x,y,false),off=tile(x,y,true);
          const col=(p)=>p.join(',');const seq=[...Array(16).keys()].map(px=>col(on(px,8)));
          r.row=seq;r.gold=seq.some(c=>c==='240,220,152');r.off=[...Array(16).keys()].map(px=>col(off(px,8))).some(c=>c==='240,220,152');}
        out[key]=r;}
      return out;});
    for(const [k,r] of Object.entries(R)){if(r.no)continue;
      chk(`Sanctum ${k}: the garden is panels (a gold border at the seam, which the old lawn and gravel did not have) and there are ${r.yardN} garden tiles, ${r.pill} under pillars`,r.probe&&r.gold&&!r.off&&r.yardN>=40||JSON.stringify(r));}
    const cnt=await ev(()=>({n:window.__WA12.n.carpet,err:window.__WA12.err}));
    chk(`Sanctum: panel tiles drawn (${cnt.n}) with no error ${JSON.stringify(cnt.err)}`,cnt.n>200&&!cnt.err.length);
    // the hall: panels either side of the aisle, three to six tiles out, and none on the runner or the dais
    const hall=await ev(()=>{const A=__A,T=A.TW.get,G=A.G;G.run.seed=424242;G.run.order[1]=6;A.resetMaps();const f=A.getMap('f1'),c=f.caves.find(c=>c.kind==='fort');A.placeAt('f1',c.out[0],c.out[1],'d');A.enterCave(c,1);const m=A.WS.m,o=T('sncGeo')(m),hp=T('wa12HallPan');
      let n=0,onRun=0,sym=0,tot=0;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){if(hp(o,m,x,y)){n++;if(o.carpet.has(x+','+y))onRun++;const q=o.inv(x,y),mx=o.xf(2*o.cx-q[0],q[1]);tot++;if(hp(o,m,mx[0],mx[1]))sym++;}}return {n,onRun,sym,tot,w:o.hall.u1-o.hall.u0+1};});
    chk(`Sanctum hall: ${hall.n} panel tiles, none on the runner (${hall.onRun}), mirrored across the aisle (${hall.sym} of ${hall.tot})`,hall.n>=40&&hall.onRun===0&&hall.sym===hall.tot||JSON.stringify(hall));
    await H.browser.close();}
  // ---------- 4. gather nodes ----------
  if(want('4')){const H=await boot('low');const {ev}=H;
    const R=await ev(()=>{const A=__A,T=A.TW.get,W=window.__WA12,F=T('m11NodeDraw'),ids=['copper','iron','mythril','oak','ash','elder','healroot','bluecap','sunpetal','starbloom'],out={ids:{},themes:{}};
      const draw=(id,th,off,tw)=>{W.off=off;W.thm=th;const c=document.createElement('canvas');c.width=18;c.height=18;const x=c.getContext('2d');F(x,id,1,1,tw==null?2:tw);W.off=false;W.thm=null;return x.getImageData(0,0,18,18).data;};
      for(const id of ids){const a=draw(id,'meadow',false),b=draw(id,'meadow',true);let diff=0,opaque=0,dark=0,shadow=0;for(let i=0;i<a.length;i+=4){if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])diff++;if(a[i+3]>200){opaque++;if(a[i]+a[i+1]+a[i+2]<130)dark++;}}
        // the contact shadow: translucent dark pixels under the foot
        for(let x=3;x<15;x++){const j=((15)*18+x)*4;if(a[j+3]>20&&a[j+3]<120)shadow++;}
        const s0=draw(id,'meadow',false,0),s1=draw(id,'meadow',false,1),s2=draw(id,'meadow',false,2);let tw=0;for(let i=0;i<s0.length;i++){if(s0[i]!==s2[i]||s1[i]!==s2[i])tw++;}
        out.ids[id]={diff,opaque,dark,shadow,tw};}
      const a=draw('copper','meadow',false),b=draw('copper','snow',false);let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;out.themeDiff=d;
      const h=draw('healroot','meadow',false),h2=draw('healroot','cave',false);let d2=0;for(let i=0;i<h.length;i++)if(h[i]!==h2[i])d2++;out.leafDiff=d2;
      return out;});
    const ids=Object.keys(R.ids);
    chk(`gather nodes: all ten are redrawn (differ from the icon piles), outlined, with a contact shadow and a twinkle (${ids.map(i=>`${i} ${R.ids[i].opaque}px`).join(', ')})`,ids.every(i=>R.ids[i].diff>40&&R.ids[i].opaque>=60&&R.ids[i].dark>=8&&R.ids[i].shadow>=2&&R.ids[i].tw>=2)||JSON.stringify(R.ids));
    chk(`gather nodes take the realm's stone and leaf green (copper meadow vs snow ${R.themeDiff} values, healroot meadow vs cave ${R.leafDiff})`,R.themeDiff>20&&R.leafDiff>20);
    // in the world: 2D draws and the HD-2D card use them, and the card cache follows the map
    for(const [tier,hd] of [['low',false],['medium',true]]){const H2=await boot(tier);await H2.ev(hd=>{__A.META.cfg.hd2d=hd;__A.gfxApply();},hd);
      const n=await H2.ev(async()=>{const A=__A,G=A.G,W=window.__WA12;G.run.order[1]=6;A.resetMaps();G.clock=150;G.weather[1]='clear';const m=A.getMap('f1');const nd=(m.nodes||[])[0];A.V.modal=null;A.placeAt('f1',nd.x,nd.y+2,'u');A.TR.ph=null;A.render();
        await new Promise(r=>setTimeout(r,1500));return {nodes:(m.nodes||[]).length,drawn:W.n.node,err:W.err.slice()};});
      chk(`${tier}: gather nodes in the world are drawn by the new sprites (${n.drawn} draws, ${n.nodes} nodes) with no error`,n.drawn>0&&!n.err.length||JSON.stringify(n));await H2.browser.close();}
    await H.browser.close();}
  // ---------- 5. the Mimic ----------
  if(want('5')){const H=await boot('low');const {ev}=H;
    const R=await ev(()=>{const A=__A,out={};for(const [k,f] of [['idleA',{t:'idle',i:0}],['idleB',{t:'idle',i:1}],['atk',{t:'atk',i:0}],['hit',{t:'hit',i:0}]]){const c0=A.monCanvas('mimic',f),c=document.createElement('canvas');c.width=c0.width;c.height=c0.height;const x=c.getContext('2d');x.drawImage(c0,0,0);/* drawn, not read: the game swaps in the HD paint when a sprite is drawn */const d=x.getImageData(0,0,c.width,c.height).data;
        const px=(i)=>[d[i],d[i+1],d[i+2],d[i+3]];let mouth=[],tooth=[],gold=0,wood=0,red=0;
        for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){const i=(y*c.width+xx)*4,[r,g,b,a]=px(i);if(a<200)continue;
          if(y<33&&r>170&&g>160&&b>135&&r-b<75)tooth.push([xx,y]);/* teeth, however the HD paint shades them: pale and not yellow */if(y<33&&r+g+b<75&&xx>8&&xx<32)mouth.push([xx,y]);if(r>215&&g>165&&b<120&&r-b>100)gold++;if(r>100&&r<200&&g>60&&g<140&&b<90&&r-b>50)wood++;if(r>200&&g<90&&b>60&&b<140)red++;}
        const ys=mouth.map(p=>p[1]),my=ys.length?(Math.min(...ys)+Math.max(...ys))/2:0;const up=tooth.filter(p=>p[1]<my).length,dn=tooth.filter(p=>p[1]>=my).length;
        // teeth in the mouth's columns only (the feet's claws are cream too): rows between the mouth's top and bottom +3
        const mt=ys.length?Math.min(...ys):0,mb=ys.length?Math.max(...ys):0;const mid2=(mt+mb)/2,up2=tooth.filter(p=>p[1]>=mt&&p[1]<mid2).length,dn2=tooth.filter(p=>p[1]>=mid2&&p[1]<=mb).length;
        out[k]={mouth:mouth.length,my,up:up2,dn:dn2,gold,wood,red,w:c.width,h:c.height};}return out;});
    for(const k of ['idleA','idleB','atk'])chk(`Mimic ${k}: teeth in the upper half (${R[k].up}) and the lower half (${R[k].dn}) of the open mouth, a tongue (${R[k].red} px), the chest's gold (${R[k].gold}) and wood (${R[k].wood})`,R[k].mouth>=40&&R[k].up>=6&&R[k].dn>=6&&R[k].red>=6&&R[k].gold>=50&&R[k].wood>=80||JSON.stringify(R[k]));
    chk(`Mimic hit: shut like a chest (gold ${R.hit.gold}, wood ${R.hit.wood}), mouth only a gap (${R.hit.mouth} dark px), size unchanged (${R.hit.w}x${R.hit.h})`,R.hit.gold>=50&&R.hit.wood>=80&&R.hit.mouth<=R.idleA.mouth&&R.hit.w===40&&R.hit.h===40||JSON.stringify(R.hit));
    await H.browser.close();}
  // ---------- 6. entrances ----------
  if(want('6')){const H=await boot('low');const {ev}=H;
    const R=await ev(()=>{const A=__A,T=A.TW.get,W=window.__WA12,den=T('slDenByKey'),lair=T('slLairByKit'),DEN=T('SL_DEN'),LK=T('SL_LKIT'),out={den:{},lair:{}};
      const meas=(cv0,off)=>{const W2=cv0.width,H2=cv0.height,cv=document.createElement('canvas');cv.width=W2;cv.height=H2;cv.getContext('2d').drawImage(cv0,0,0);const d=cv.getContext('2d').getImageData(0,0,W2,H2).data;let lumL=0,nL=0,lumR=0,nR=0,thr=0,glowL=0,glowR=0,opq=0;
        for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){const i=(y*W2+x)*4;if(d[i+3]<200)continue;opq++;const l=d[i]*.3+d[i+1]*.59+d[i+2]*.11;
          // the rim: the outer 3 px of the upper left edge and of the right edge
          let a=0;while(a<4&&x-a>0&&d[(y*W2+x-a-1)*4+3]>100)a++;let b=0;while(b<4&&x+b<W2-1&&d[(y*W2+x+b+1)*4+3]>100)b++;
          if(l>30&&y<H2*.7){if(a<=1&&x<W2/2){lumL+=l;nL++;}if(b<=1&&x>=W2/2){lumR+=l;nR++;}}}
        // props: warm or cool bright pixels at the foot, left and right of the middle third
        for(let y=H2-16;y<H2;y++)for(let x=0;x<W2;x++){const i=(y*W2+x)*4;if(d[i+3]<200)continue;const mx=Math.max(d[i],d[i+1],d[i+2]),mn=Math.min(d[i],d[i+1],d[i+2]);if(mx>200&&mx-mn>60){if(x<W2*.34)glowL++;if(x>W2*.66)glowR++;}}
        for(let x=W2*.36;x<W2*.64;x++){const i=((H2-3)*W2+(x|0))*4;if(d[i]>120&&d[i+1]>115&&d[i+2]>100)thr++;}
        return {rimL:nL?Math.round(lumL/nL):0,rimR:nR?Math.round(lumR/nR):0,glowL,glowR,thr,opq};};
      // what was added: pixels that differ from the old sprite, in the left and right third of the foot (the props) and across the middle of the last rows (the threshold)
      const added=(nw,od)=>{const W2=nw.width,H2=nw.height,cp=cv=>{const c=document.createElement('canvas');c.width=W2;c.height=H2;c.getContext('2d').drawImage(cv,0,0);return c.getContext('2d').getImageData(0,0,W2,H2).data;},A2=cp(nw),B2=cp(od);let pl=0,pr=0,th=0;
        for(let y=H2-16;y<H2;y++)for(let x=0;x<W2;x++){const i=(y*W2+x)*4;if(Math.abs(A2[i]-B2[i])+Math.abs(A2[i+1]-B2[i+1])+Math.abs(A2[i+2]-B2[i+2])+Math.abs(A2[i+3]-B2[i+3])>40){if(x<W2*.34)pl++;else if(x>W2*.66)pr++;else if(y>=H2-3)th++;}}return {pl,pr,th};};
      for(const k of Object.keys(DEN)){W.off=false;const c=den(k),a=meas(c);W.off=true;const old=den(k);W.off=false;Object.assign(a,added(c,old));out.den[k]={a,sameAsOld:c===old};}
      for(const k of Object.keys(LK)){const K=Object.assign({id:k},LK[k]);W.off=false;const c=lair(K,false),a=meas(c);W.off=true;const old=lair(K,false);W.off=false;Object.assign(a,added(c,old));out.lair[k]={a,sameAsOld:c===old};}
      return out;});
    const dk=Object.keys(R.den),lk=Object.keys(R.lair);
    const okE=(e)=>e.a.pl>=12&&e.a.pr>=12&&e.a.th>=5&&e.a.rimL>e.a.rimR*1.1;
    chk(`den mouths (${dk.length} realms): props lit at each side of the foot, a threshold stone, the upper left rim lit above the right edge, not the old sprite (${dk.filter(k=>!okE(R.den[k])||R.den[k].sameAsOld).join(',')||'all'})`,dk.length>=17&&dk.every(k=>okE(R.den[k])&&!R.den[k].sameAsOld)||JSON.stringify(dk.filter(k=>!okE(R.den[k])).map(k=>[k,R.den[k].a])));
    chk(`lair fronts (${lk.length} kits): props at each side of the foot, a threshold stone, the lit rim (${lk.filter(k=>!okE(R.lair[k])).join(',')||'all'})`,lk.length>=17&&lk.every(k=>okE(R.lair[k])&&!R.lair[k].sameAsOld)||JSON.stringify(lk.filter(k=>!okE(R.lair[k])).map(k=>[k,R.lair[k].a])));
    // in the world, 2D and HD-2D: den, lair and cave entrances draw with no error
    for(const [tier,hd] of [['low',false],['medium',true]]){const H2=await boot(tier);await H2.ev(hd=>{__A.META.cfg.hd2d=hd;__A.gfxApply();},hd);
      const n=await H2.ev(async()=>{const A=__A,G=A.G,W=window.__WA12;let seen=0;for(const zi of [6,10,18]){let f=null,c=null,st=1;for(st=1;st<5&&!c;st++){G.run.order[st]=zi;A.resetMaps();G.clock=150;G.weather[st]='clear';f=A.getMap('f'+st);c=(f.caves||[]).find(c=>c.kind!=='fort');}st--;const at=c?c.out:f.entOut||f.ent;if(!at)continue;
          A.V.modal=null;A.placeAt('f'+st,at[0],at[1],'d');A.render();await new Promise(r=>setTimeout(r,900));seen++;}return {seen,den:W.n.den,lair:W.n.lair,err:W.err.slice()};});
      chk(`${tier}: den, lair and cave entrances draw in the world (${n.seen} realms; ${n.den} den and ${n.lair} lair sprites built) with no error`,n.seen>=2&&n.den>=1&&!n.err.length||JSON.stringify(n));await H2.browser.close();}
    await H.browser.close();}
  if(want('7')){const H=await boot('medium');const e=await H.ev(()=>window.__WA12.err.slice());chk('no worldart12 error recorded',!e.length||JSON.stringify(e));await H.browser.close();}
  await done({browser:{close:async()=>{}}});
})();
