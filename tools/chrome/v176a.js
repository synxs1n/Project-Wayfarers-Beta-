// v0.19.7 terrain13.js: the ground reads as ground, in both renderers.
//  1. a field's base canvas with the module on against off (buildMapCanvas, no frame drawn): ',' tiles differ from each other (clump counts vary),
//     open ground carries more tones (patches), a road beside grass gets grass bites past the base's one px line, the land beside water a wet rim,
//     the water beside land a second foam line, the ground over a cliff a lip; a water tile south of a tree carries its reflection
//  2. materials (terrain14 rules): a desert field's ',' tiles carry dune grass and pebbles, a snow field's frost tipped blades, an ash field's charred
//     stalks, the Breach's spore grass with glowing heads; every ',' tile is a dense patch (12 clumps or more), and the Breach's ',' tiles keep their own
//     ground colours between the blades (no tile shaped teal cast)
//  3. the 2D frame: the water layer changes a frame with the module on against off at the same time, and between two times; the fountain entries
//     draw; the wet level darkens cobbles (wet 1 against 0), the snow level whitens the top of a tree; the levels climb while it rains or snows and
//     fall after (synthetic frame times)
//  4. HD-2D (Medium): water quads are emitted each frame, wet quads in a wet town, the snow mesh is built once per level step (not per frame) and
//     changes the composed frame; no module errors, no page errors anywhere
//  5. (v0.20.5: the owner asked for the original grass back; sections 1, 2 and 5 now check the revert: ',' tiles and their contrast are the original paint's)
//     was: terrain14 encounter grass reads at a glance in every realm: the contrast of ',' against '.' tiles (mean colour distance from plain ground's median,
//     ',' minus '.', and the share of (',' , '.') pairs where the ',' tile stands out more) is at or above the pre-0.19.8 base (the module off draws it)
//  6. terrain14 water: deep water (3+ tiles from land) is darker than the shallows, open water tiles differ from each other (no fixed rows of dashes; the
//     base, module off, paints them all alike), and about half the tiles carry a moving highlight at any time (not one per tile in step)
//  7. terrain14 sky: the Breach's aurora and the void's stars over the sky band span the whole view on the HD-2D overlay (its 2x bitmap) and in 2D
//  8. terrain14 exits: over 150+ fields and towns of many journeys (and the Breach), drawAudit().exitLand is empty: no void in an exit's apron or within 2
//     tiles of the walkway from an exit to open land; the v0.19.2 apron alone (WA12.cause false) and the raw generator (WA12.off) leave such void (bug
//     reproduced); the Breach keeps its void round the islands; no exit tile on void, mapIssues no worse
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v176a.js [ONLY=1,2,3,4,5,6,7,8]
const {open,chk,done}=require('./pw');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false,tips:false,minimap:false,hd2d:true,goalsMin:true}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const CALL=(H,src,a)=>H.ev('('+src+')('+JSON.stringify(a)+')');
const only=process.env.ONLY||'',want=n=>!only||only.split(',').includes(n);
const bound=(p,ms,what)=>{let t;return Promise.race([p,new Promise((_,rej)=>{t=setTimeout(()=>rej(new Error('timeout after '+ms+' ms: '+what)),ms);})]).finally(()=>clearTimeout(t));};
setTimeout(()=>{console.log('FAIL watchdog: v176a ran over 600 s');process.exit(1);},600000).unref();
async function boot(t,w,h){const H=await open({w:w||430,h:h||760,mobile:true,dpr:1,pre:META(t)});const ev0=H.ev;H.ev=(f,a)=>bound(ev0(f,a),120000,'page call');const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=424242;A.resetMaps();A.render();});await H.wait(400);return H;}
// the field (or town) of a realm at stage 1, built and entered; returns its id and a spot
const GO=`([key,kind,wx])=>{const A=__A,G=A.G,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));let m;
  if(key==='breach'){G.won=1;G.stage=4;G.visited=[0,1,2,3,4];A.resetMaps();G.clock=150;m=A.getMap('x0');}
  else{G.run.order[1]=zi[key];A.resetMaps();G.clock=150;G.weather[1]=wx||'clear';m=A.getMap(kind==='town'?'t1':'f1');}
  const p=(m.start||(m.free&&m.free[Math.floor(m.free.length/2)])||[Math.floor(m.w/2),Math.floor(m.h/2)]);A.V.modal=null;A.WS.dlg=null;A.placeAt(m.id,p[0],p[1],'u');A.WS.cam=null;A.render();return {id:m.id,p,theme:m.theme,thv:m.thv,w:m.w,h:m.h};}`;
// the base canvas of the current map with the module on or off, read as pixel data of the asked tiles: fn(get(x,y)) where get returns the tile's RGBA
const TILES=`([off,what])=>{const A=__A,T=window.__T13,m=A.WS.m,was=T.off,n0=Object.assign({},T.n);T.off=off;let cv;try{cv=A.TW.get('buildMapCanvas')(m,0);}finally{T.off=was;}
  const c=cv.getContext('2d'),hx=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];},tn=T.api?null:null;
  const TH=A.TW.get('THM')(m),g=TH.g,tg=TH.tg,w=TH.w,sh=(h,f)=>hx(h).map(v=>Math.round(v*f)),same=(d,i,rgb)=>Math.abs(d[i]-rgb[0])<=2&&Math.abs(d[i+1]-rgb[1])<=2&&Math.abs(d[i+2]-rgb[2])<=2;
  const px=(x,y)=>c.getImageData(x*16,y*16,16,16).data,cnt=(d,cols,rows)=>{let n=0;for(let i=0;i<d.length;i+=4){const r=Math.floor(i/64);if(rows&&(r<rows[0]||r>rows[1]))continue;if(cols.some(k=>same(d,i,k)))n++;}return n;};
  const t=(x,y)=>A.tileAt(m,x,y),out={};
  if(what==='tufts'){const tufts=[tg[0],tg[1],tg[2],sh(tg[0],.86),sh(tg[1],.86),sh(tg[2],.9)].map(h=>typeof h==='string'?hx(h):h);const list=[];
    for(let y=2;y<m.h-2&&list.length<40;y++)for(let x=2;x<m.w-2&&list.length<40;x++)if(t(x,y)===',')list.push(cnt(px(x,y),tufts));out.counts=list;}
  if(what==='tones'){const set=new Set();let n=0;for(let y=2;y<m.h-2&&n<36;y++)for(let x=2;x<m.w-2&&n<36;x++){if(t(x,y)!=='.')continue;n++;const d=px(x,y);for(let i=0;i<d.length;i+=4)set.add(d[i]+','+d[i+1]+','+d[i+2]);}out.tones=set.size;out.n=n;}
  if(what==='edges'){const g0=hx(g[0]),g3=hx(g[3]),wet=sh(g[0],.7),w2=hx(w[2]),lip=sh(g[0],.78);let road=null,land=null,water=null,cliff=null;
    // only tiles with no prop within three tiles each side and two rows up (props are painted over the ground after the tiles)
    const clean=(x,y)=>{for(let j=-2;j<=0;j++)for(let i=-3;i<=3;i++){const c=t(x+i,y+j);if(!'.,f=~#'.includes(c))return false;}return true;};
    for(let y=3;y<m.h-2;y++)for(let x=3;x<m.w-3;x++){const c0=t(x,y);if(!clean(x,y))continue;
      if(!road&&c0==='='&&t(x,y-1)==='.')road=cnt(px(x,y),[g0,g3],[1,2]);
      if(!land&&c0==='.'&&t(x,y+1)==='~')land=cnt(px(x,y),[wet],[13,15]);
      if(!water&&c0==='~'&&t(x,y-1)==='.')water=cnt(px(x,y),[w2],[3,3]);
      if(!cliff&&c0==='.'&&t(x,y+1)==='#')cliff=cnt(px(x,y),[lip],[15,15]);}
    out.road=road;out.land=land;out.water=water;out.cliff=cliff;}
  if(what==='refl'){for(let y=2;y<m.h-2&&!out.d;y++)for(let x=2;x<m.w-2;x++){if(t(x,y)==='~'&&t(x,y-1)==='T'){out.at=[x,y];out.d=Array.from(px(x,y));break;}}}
  if(what==='mat'){const list=[];const gr=T.api.growPal(T.api.mat(m),TH,{tg,g,w:TH.w}),bl=gr?[].concat(...gr.bl).map(hx):[];
    // the ground's own colours (what the base paints under the growth): the theme's tones, and for the Breach the obsidian and its veins
    const ground=g.map(hx).concat(m.breach?['#17111f','#0f0a17','#221a30','#09060f','#030207','#3fe0c8','#9a6aff'].map(hx):[]);
    for(let y=2;y<m.h-2&&list.length<30;y++)for(let x=2;x<m.w-2&&list.length<30;x++)if(t(x,y)===','){const d=px(x,y);list.push({green:cnt(d,[tg[0],tg[1],tg[2]].map(hx)),white:cnt(d,[[255,255,255]]),cinder:cnt(d,[[20,16,18]]),
      char:cnt(d,[[30,24,22],[20,16,16],[42,34,32],[58,46,40],[44,36,32],[74,60,52]]),spore:cnt(d,[[200,255,244],[208,184,255]]),peb:cnt(d,[sh(g[1],.82)]),blade:cnt(d,bl),ground:cnt(d,ground)});}
    out.list=list;out.mat=T.api.mat(m);out.grow=T.n.grow-n0.grow;out.tuft=T.n.tuft-n0.tuft;}
  if(what==='contrast'){const clean=(x,y,J0,J1,I)=>{for(let j=J0;j<=J1;j++)for(let i=-I;i<=I;i++){const q=t(x+i,y+j);if(!'.,'.includes(q))return false;}return true;};let tiles;
    for(const [J0,J1,I] of [[-1,2,2],[0,1,1]]){tiles={',':[],'.':[]};for(let y=2;y<m.h-2;y++)for(let x=2;x<m.w-2;x++){const q=t(x,y);if(!(q in tiles)||tiles[q].length>=60||!clean(x,y,J0,J1,I))continue;tiles[q].push(px(x,y));}if(tiles[','].length>=8&&tiles['.'].length>=8)break;}
    if(tiles[','].length<4||tiles['.'].length<4){out.n=[tiles[','].length,tiles['.'].length];return out;}
    const ch=[[],[],[]];tiles['.'].forEach(d=>{for(let i=0;i<d.length;i+=4){ch[0].push(d[i]);ch[1].push(d[i+1]);ch[2].push(d[i+2]);}});const med=ch.map(a=>{a.sort((p,q)=>p-q);return a[a.length>>1];});
    const dev=d=>{let s=0;for(let i=0;i<d.length;i+=4)s+=Math.hypot(d[i]-med[0],d[i+1]-med[1],d[i+2]-med[2]);return s/(d.length/4);},avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
    const cg=tiles[','].map(dev),cp=tiles['.'].map(dev);let win=0,tot=0;cg.forEach(a=>cp.forEach(b=>{tot++;if(a>b)win++;else if(a===b)win+=.5;}));
    out.n=[cg.length,cp.length];out.C=+(avg(cg)-avg(cp)).toFixed(1);out.auc=+(win/tot).toFixed(3);}
  if(what==='water'){const D=T.api.wdepth(m),pat=new Set();let L1=0,n1=0,L3=0,n3=0;
    const lum=d=>{let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;return s/(d.length/4);};
    for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++){if(t(x,y)!=='~')continue;const dp=D[y*m.w+x];if(dp>=3&&n3<60){const q=px(x,y);L3+=lum(q);n3++;pat.add(Array.from(q).join(','));}else if(dp===1&&n1<60){L1+=lum(px(x,y));n1++;}}
    out.deep=n3?L3/n3:null;out.shallow=n1?L1/n1:null;out.n=[n1,n3];out.distinct=pat.size;
    let band=0,spark=0,nt=0;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){if(t(x,y)!=='~')continue;nt++;const q=T.api.wanim(x,y,123456);if(q.ba>.02)band++;if(q.sa>0)spark++;}out.band=band/Math.max(1,nt);out.spark=spark/Math.max(1,nt);}
  return out;}`;
(async()=>{
  // ---------- 1. the field's base canvas ----------
  if(want('1')){const H=await boot('low');const f=await CALL(H,GO,['lakes','field']);
    const on=await CALL(H,TILES,[false,'tufts']),off=await CALL(H,TILES,[true,'tufts']);
    const spread=a=>{const s=new Set(a);return {d:s.size,min:Math.min(...a),max:Math.max(...a)};},so=spread(on.counts),sf=spread(off.counts);
    chk(`1. v0.20.5 grass revert: ',' tiles keep the original paint: clump pixel counts on equal off on all ${on.counts.length} tiles (${on.counts.filter((v,i)=>v!==off.counts[i]).length} differ)`,on.counts.length>=12&&on.counts.every((v,i)=>v===off.counts[i]));
    const tn=await CALL(H,TILES,[false,'tones']),tf=await CALL(H,TILES,[true,'tones']);
    console.log(`1. open ground tones: ${tn.tones} colours over ${tn.n} '.' tiles on, ${tf.tones} off (the patchwork is off since v0.20.5; transitions by roads and water still add a few)`);
    const en=await CALL(H,TILES,[false,'edges']),ef=await CALL(H,TILES,[true,'edges']);
    chk(`1. a road beside grass: ${en.road} grass px in rows 1 to 2 on (the base paints row 0 and one side column), ${ef.road} off`,en.road==null||en.road>=(ef.road||0)+4);
    chk(`1. the land beside water: ${en.land} wet rim px on, ${ef.land} off`,en.land==null||(en.land>=8&&(ef.land||0)===0));
    chk(`1. the water beside land: ${en.water} pale foam px on row 3 on, ${ef.water} off`,en.water==null||en.water>(ef.water||0)+2);
    chk(`1. the ground over a cliff: ${en.cliff} lip px on row 15 on, ${ef.cliff} off (the base has no lip; a stray px of the same colour is allowed)`,en.cliff==null||(en.cliff>=12&&(ef.cliff||0)<=2));
    chk(`1. the field has the four edges to check (road ${en.road}, land ${en.land}, water ${en.water}, cliff ${en.cliff})`,[en.road,en.land,en.water,en.cliff].filter(v=>v!=null).length>=3);
    const rn=await CALL(H,TILES,[false,'refl']),rf=await CALL(H,TILES,[true,'refl']);
    if(rn.d&&rf.d){let diff=0;for(let i=0;i<rn.d.length;i+=4)if(Math.abs(rn.d[i]-rf.d[i])+Math.abs(rn.d[i+1]-rf.d[i+1])+Math.abs(rn.d[i+2]-rf.d[i+2])>24)diff++;
      chk(`1. the water south of a tree at ${rn.at} carries its reflection: ${diff} of 256 px differ`,diff>=20);}
    else chk('1. a water tile south of a tree exists in this field (skipped: none)',true);
    const e=await H.ev(()=>({err:window.__T13.err,n:window.__T13.n}));chk(`1. no module errors (${e.err.length}) ${e.err.join(' | ')}`,e.err.length===0);chk(`1. no page errors (${H.errs.length})`,H.errs.length===0);await H.browser.close();}
  // ---------- 2. materials (terrain14) ----------
  if(want('2')){const H=await boot('low');const sum=(l,k)=>l.reduce((a,o)=>a+o[k],0);
    for(const [key,mat,mark,min] of [['mesa','sand','peb',1],['tundra','snow','white',40],['deeps','ash','char',100],['ashen','ash','char',100]]){
      await CALL(H,GO,[key,'field']);const on=await CALL(H,TILES,[false,'mat']),off=await CALL(H,TILES,[true,'mat']);
      chk(`2. ${key} (v0.20.5 grass revert): ${on.list.length} ',' tiles draw the original paint: ${mark} px ${sum(on.list,mark)} on, ${sum(off.list,mark)} off; ${on.tuft} clumps and ${on.grow} patches added`,on.list.length>0&&sum(on.list,mark)===sum(off.list,mark)&&on.tuft===0&&on.grow===0);}
    const b=await CALL(H,GO,['breach','field']);const on=await CALL(H,TILES,[false,'mat']);const gs=on.list.map(o=>o.ground/256);
    const offB=await CALL(H,TILES,[true,'mat']);
    chk(`2. the Breach (${b.id}, v0.20.5 grass revert): ${on.list.length} ',' tiles draw breachlook11's own paint: spore heads ${sum(on.list,'spore')} on, ${sum(offB.list,'spore')} off; ${on.tuft} clumps added; ground share between ${Math.min(...gs).toFixed(2)} and 1`,on.list.length>0&&sum(on.list,'spore')===sum(offB.list,'spore')&&on.tuft===0);
    const e=await H.ev(()=>({err:window.__T13.err}));chk(`2. no module errors (${e.err.length}) ${e.err.join(' | ')}`,e.err.length===0);chk(`2. no page errors (${H.errs.length})`,H.errs.length===0);await H.browser.close();}
  // ---------- 3. the 2D frame ----------
  if(want('3')){const H=await boot('low');const f=await CALL(H,GO,['lakes','field']);
    // stand two tiles south of water
    const spot=await H.ev(()=>{const A=__A,m=A.WS.m;for(let y=4;y<m.h-4;y++)for(let x=4;x<m.w-4;x++){if(m.t[y][x]==='~'&&m.t[y+1][x]==='~'&&m.t[y+3][x]==='.'&&!A.solidAt(m,x,y+3)){A.placeAt(m.id,x,y+3,'u');A.WS.cam=null;A.render();return [x,y+3];}}return null;});
    chk(`3. a spot by the water (${spot})`,!!spot);
    const FRAME=`([t,off])=>{const A=__A,T=window.__T13,was=T.off;T.off=off;try{A.WS.cam=null;A.worldDraw(t);A.worldDraw(t);}finally{T.off=was;}const cv=A.WS.cv,c=cv.getContext('2d');const sc=(cv._rw||cv.width)/A.WS.vw;
      const hx=Math.round(A.WS.px)+8-Math.round(A.WS.cam.x),hy=Math.round(A.WS.py)-Math.round(A.WS.cam.y);return {d:Array.from(c.getImageData(Math.round((hx-24)*sc),Math.round((hy-48)*sc),Math.round(48*sc),Math.round(40*sc)).data),n:Object.assign({},T.n)};}`;
    const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>24)n++;return n;};
    const t0=1e5+40;const a=await CALL(H,FRAME,[t0,false]),b=await CALL(H,FRAME,[t0,true]),c2=await CALL(H,FRAME,[t0+1040,false]);
    chk(`3. the water layer changes the frame: ${diff(a.d,b.d)} px differ on against off at one time, ${diff(a.d,c2.d)} between two times (same base frame); water tiles drawn ${c2.n.wq-a.n.wq}`,diff(a.d,b.d)>8&&diff(a.d,c2.d)>8&&c2.n.wq>a.n.wq);
    // the fountain entries and the wet cobbles in a town
    await CALL(H,GO,['lakes','town','rain']);
    const fo=await H.ev(()=>{const A=__A,m=A.WS.m;for(let y=2;y<m.h-2;y++)for(let x=2;x<m.w-2;x++){if(m.t[y][x]==='O'&&!A.solidAt(m,x,y+3)){A.placeAt(m.id,x,y+3,'u');A.WS.cam=null;A.render();return [x,y];}}return null;});
    const fe=fo?await H.ev((t)=>{const A=__A,acts=[];A.worldDraw(t);A.townDecorActors(acts,t,Math.round(A.WS.cam.x),Math.round(A.WS.cam.y));return acts.filter(a=>a.deco==='terrain13:fountain').length;},t0):0;
    chk(`3. a fountain at ${fo}: ${fe} sparkle entries in the depth sort`,!fo||fe>=1);
    const COB=`([t,wet])=>{const A=__A,T=window.__T13,m=A.WS.m;T.force=[0,0];T.wet=wet;T.snow=0;A.WS.cam=null;A.worldDraw(t);A.worldDraw(t);const cv=A.WS.cv,c=cv.getContext('2d'),sc=(cv._rw||cv.width)/A.WS.vw,cx=Math.round(A.WS.cam.x),cy=Math.round(A.WS.cam.y);
      let L=0,n=0;for(let y=Math.floor(cy/16)+1;y<Math.floor((cy+A.WS.vh)/16)-1;y++)for(let x=Math.floor(cx/16)+1;x<Math.floor((cx+A.WS.vw)/16)-1;x++){if(A.tileAt(m,x,y)!=='=')continue;if(Math.abs(x*16-A.WS.px)<24&&Math.abs(y*16-A.WS.py)<32)continue;
        const d=c.getImageData(Math.round((x*16-cx+6)*sc),Math.round((y*16-cy+6)*sc),2,2).data;for(let i=0;i<d.length;i+=4){L+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;n++;}}return n?L/n:null;}`;
    const dry=await CALL(H,COB,[t0+2e4,0]),wetL=await CALL(H,COB,[t0+2e4,1]);
    chk(`3. wet cobbles: mean luminance ${wetL&&wetL.toFixed(1)} at wet 1 against ${dry&&dry.toFixed(1)} dry`,dry!=null&&wetL!=null&&dry-wetL>=8);
    // snow caps over a tree
    await CALL(H,GO,['lakes','field','snow']);
    const tr=await H.ev(()=>{const A=__A,m=A.WS.m;for(let y=4;y<m.h-4;y++)for(let x=4;x<m.w-4;x++){if(m.t[y][x]==='T'&&m.t[y+2][x]==='.'&&!A.solidAt(m,x,y+2)){A.placeAt(m.id,x,y+2,'u');A.WS.cam=null;A.render();return [x,y];}}return null;});
    const CAP=`([t,snow,tx,ty])=>{const A=__A,T=window.__T13;T.force=[0,0];T.wet=0;T.snow=snow;A.WS.cam=null;A.worldDraw(t);A.worldDraw(t);const cv=A.WS.cv,c=cv.getContext('2d'),sc=(cv._rw||cv.width)/A.WS.vw,cx=Math.round(A.WS.cam.x),cy=Math.round(A.WS.cam.y);
      const d=c.getImageData(Math.round((tx*16-3-cx)*sc),Math.round((ty*16+18-28-cy)*sc),Math.round(22*sc),Math.round(6*sc)).data;let L=0;for(let i=0;i<d.length;i+=4)L+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;return {L:L/(d.length/4),cap:T.n.cap};}`;
    const c0=tr&&await CALL(H,CAP,[t0+3e4,0,tr[0],tr[1]]),c1=tr&&await CALL(H,CAP,[t0+3e4,1,tr[0],tr[1]]);
    chk(`3. snow caps the tree at ${tr}: the canopy top's luminance ${c1&&c1.L.toFixed(1)} at snow 1 against ${c0&&c0.L.toFixed(1)}; cap canvases built ${c1&&c1.cap}`,!!tr&&c1.L-c0.L>=10&&c1.cap>=1);
    // the levels follow the weather
    const lv=await H.ev(()=>{const T=window.__T13,tr=T.api.track;T.wet=0;T.snow=0;T.force=[1,0];T.t=0;let t=5e5;tr(t);for(let i=0;i<60*40;i++){t+=16.7;tr(t);}const wet40=T.wet;T.force=[0,1];for(let i=0;i<60*60;i++){t+=16.7;tr(t);}const snow60=T.snow,wetAfter=T.wet;
      T.force=[0,0];for(let i=0;i<60*120;i++){t+=16.7;tr(t);}const o={wet40,snow60,wetAfter,wet2m:T.wet,snow2m:T.snow};T.force=null;T.wet=0;T.snow=0;return o;});
    chk(`3. the wet level climbs to ${lv.wet40.toFixed(2)} in 40 s of rain, the snow level to ${lv.snow60.toFixed(2)} in 60 s of snow (the wet one down to ${lv.wetAfter.toFixed(2)} meanwhile), both fall over 2 dry minutes (${lv.wet2m.toFixed(2)}, ${lv.snow2m.toFixed(2)})`,lv.wet40>=.95&&lv.snow60>=.9&&lv.wetAfter<lv.wet40&&lv.wet2m<.1&&lv.snow2m<lv.snow60-.5);
    const e=await H.ev(()=>({err:window.__T13.err}));chk(`3. no module errors (${e.err.length}) ${e.err.join(' | ')}`,e.err.length===0);chk(`3. no page errors (${H.errs.length})`,H.errs.length===0);await H.browser.close();}
  // ---------- 4. HD-2D ----------
  if(want('4')){const H=await boot('medium');await CALL(H,GO,['lakes','field']);
    const spot=await H.ev(()=>{const A=__A,m=A.WS.m;for(let y=4;y<m.h-4;y++)for(let x=4;x<m.w-4;x++){if(m.t[y][x]==='~'&&m.t[y+1][x]==='~'&&m.t[y+3][x]==='.'&&!A.solidAt(m,x,y+3)){A.placeAt(m.id,x,y+3,'u');A.WS.cam=null;A.render();return [x,y+3];}}return null;});
    const live=await H.until(()=>__A.HD.live,null,{timeout:15000});chk(`4. HD-2D live (${live===true})`,live===true);
    const HF=`([t,wet,snow])=>{const A=__A,T=window.__T13,HD=A.HD;T.force=[0,0];T.wet=wet;T.snow=snow;const n0=Object.assign({},T.n);A.WS.cam=null;t=performance.now();A.worldDraw(t);A.worldDraw(t+17);A.worldDraw(t+34);// the real clock: hd2d's camera glide cannot take a frame time that jumps backwards (the game loop runs between the calls)
      const cv=A.WS.cv,c=cv.getContext('2d'),RW=cv._rw||cv.width,RH=cv._rh||cv.height,sc=RW/A.WS.vw,hx=(HD.heroNdc[0]+1)/2*RW/sc,hy=(1-HD.heroNdc[1])/2*RH/sc;
      if(!isFinite(hx)||!isFinite(hy)||!isFinite(sc))return {bad:[hx,hy,sc,RW,RH,A.WS.vw,Array.from(HD.heroNdc)],err:T.err.slice(),why:HD.why,hd:!!HD.live};const d=Array.from(c.getImageData(Math.round((hx-80)*sc),Math.round((hy-110)*sc),Math.round(160*sc),Math.round(130*sc)).data);const h=T.hd;
      return {d,wq:T.n.wq-n0.wq,wetq:T.n.wetq-n0.wetq,hdfr:T.n.hdfr-n0.hdfr,snowq:T.n.snowq,hdcap:T.n.hdcap,mesh:!!h.mesh,tex:!!h.tex,lv:h.lv,err:T.err.slice(),hd:!!HD.live,why:HD.why};}`;
    const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>24)n++;return n;};
    const t0=2e5;const a=await CALL(H,HF,[t0,0,0]);
    chk(`4. water quads each frame: ${a.wq} water tiles over ${a.hdfr} frames, HD live ${a.hd}`,a.hd&&a.hdfr===3&&a.wq>=3);
    const s1=await CALL(H,HF,[t0+100,0,1]);const s2=await CALL(H,HF,[t0+200,0,1]);
    chk(`4. snow 1: the mesh is built (${s1.mesh}, cap texture ${s1.tex}, level ${s1.lv}, ${s1.snowq} quads), built ${s1.hdcap} time(s) over the first frames and ${s2.hdcap} after three more (no rebuild per frame)`,s1.mesh&&s1.tex&&s1.lv===1&&s1.snowq>50&&s1.hdcap>=1&&s2.hdcap===s1.hdcap);
    chk(`4. snow changes the composed frame: ${diff(a.d,s1.d)} px differ round the hero`,diff(a.d,s1.d)>60);
    const s0=await CALL(H,HF,[t0+300,0,0]);chk(`4. snow 0 again: the mesh is dropped (${s0.mesh}), level ${s0.lv}`,s0.mesh===false&&s0.lv===0);
    await CALL(H,GO,['lakes','town','rain']);await H.until(()=>__A.HD.live&&__A.HD.S&&__A.HD.S.m===__A.WS.m,null,{timeout:15000});
    const w1=await CALL(H,HF,[t0+1e4,1,0]),w0=await CALL(H,HF,[t0+1e4,0,0]);
    chk(`4. a wet town: ${w1.wetq} wet quads over 3 frames at wet 1, ${w0.wetq} at 0; ${diff(w1.d,w0.d)} px differ round the hero`,w1.wetq>=6&&w0.wetq===0&&diff(w1.d,w0.d)>40);
    const e=await H.ev(()=>({err:window.__T13.err,why:__A.HD.why,wfx:__A.HD.wfxErr}));chk(`4. no module errors (${e.err.length}) ${e.err.join(' | ')}; HD ${e.why||'fine'}`,e.err.length===0&&!e.why);chk(`4. no page errors (${H.errs.length}) ${H.errs.slice(0,2).join(' | ')}`,H.errs.length===0);await H.browser.close();}
  // ---------- 5. encounter grass reads at a glance (terrain14) ----------
  if(want('5')){const H=await boot('low');const rows=[];
    for(const key of ['lakes','orchard','strand','mire','mesa','tundra','deeps','grotto','ashen','starless','ashglass','breach']){await CALL(H,GO,[key,'field']);
      const on=await CALL(H,TILES,[false,'contrast']),off=await CALL(H,TILES,[true,'contrast']);rows.push([key,on,off]);}
    console.log('contrast (C = colour distance of \',\' tiles from plain ground minus that of \'.\' tiles; auc = share of pairs where \',\' stands out more):');
    rows.forEach(([k,on,off])=>console.log(`  ${k.padEnd(9)} on C ${on.C} auc ${on.auc} (${on.n})   pre-0.19.8 base C ${off.C} auc ${off.auc}`));
    const bad=rows.filter(([k,on,off])=>on.C==null||off.C==null||Math.abs(on.C-off.C)>Math.max(1.5,Math.abs(off.C)*.1)||Math.abs(on.auc-off.auc)>.08);// v0.20.5: the original paint's contrast, not a new one
    chk(`5. v0.20.5 grass revert: ',' against '.' contrast equals the original paint's in every realm (C within 10%, auc within .08): ${rows.length-bad.length} of ${rows.length}${bad.length?' (short: '+bad.map(r=>r[0]).join(', ')+')':''}`,bad.length===0);
    const e=await H.ev(()=>({err:window.__T13.err}));chk(`5. no module errors (${e.err.length}) ${e.err.join(' | ')}`,e.err.length===0);chk(`5. no page errors (${H.errs.length})`,H.errs.length===0);await H.browser.close();}
  // ---------- 6. water with depth and variety (terrain14) ----------
  if(want('6')){const H=await boot('low');
    for(const key of ['strand','drowned','lakes']){await CALL(H,GO,[key,'field']);const on=await CALL(H,TILES,[false,'water']),off=await CALL(H,TILES,[true,'water']);
      if(on.deep==null||on.shallow==null){chk(`6. ${key}: the field has deep and shallow water (shallow ${on.n[0]}, deep ${on.n[1]}; skipped)`,true);continue;}
      chk(`6. ${key}: deep water (3+ tiles from land, ${on.n[1]} tiles) is darker than the shallows (${on.n[0]}): mean luminance ${on.deep.toFixed(1)} against ${on.shallow.toFixed(1)} (base ${off.deep.toFixed(1)} against ${off.shallow.toFixed(1)})`,on.shallow-on.deep>=10);
      chk(`6. ${key}: open water tiles differ: ${on.distinct} distinct of ${on.n[1]} deep tiles (base: ${off.distinct})`,on.distinct>=Math.min(on.n[1],60)*.7&&on.distinct>off.distinct);
      chk(`6. ${key}: the moving highlight is on ${(on.band*100).toFixed(0)}% of the water tiles at one time, a sparkle on ${(on.spark*100).toFixed(1)}% (v0.19.8: a dash on every tile)`,on.band>.15&&on.band<.7&&on.spark<.3);}
    const e=await H.ev(()=>({err:window.__T13.err}));chk(`6. no module errors (${e.err.length}) ${e.err.join(' | ')}`,e.err.length===0);chk(`6. no page errors (${H.errs.length})`,H.errs.length===0);await H.browser.close();}
  // ---------- 7. the sky band spans the view (terrain14) ----------
  if(want('7'))for(const tier of ['medium','low']){const H=await boot(tier,390,844);await CALL(H,GO,['breach','field']);
    await H.ev(()=>{const A=__A,m=A.WS.m;for(let y=1;y<m.h;y++)for(let x=Math.floor(m.w/2)-6;x<Math.floor(m.w/2)+6;x++){if(!A.solidAt(m,x,y)&&A.tileAt(m,x,y)!=='~'){A.placeAt(m.id,x,y,'u');A.WS.cam=null;A.render();return;}}});
    if(tier!=='low')await H.until(()=>__A.HD.live&&__A.HD.S&&__A.HD.S.m===__A.WS.m,null,{timeout:20000});await H.wait(800);
    const r=await H.ev(()=>{const A=__A,P=CanvasRenderingContext2D.prototype,f0=P.fillRect,cv=A.WS.cv,o={aur:0,star:0,maxA:0,maxS:0,k:0};
      P.fillRect=function(a,b,w,h){try{if(this.canvas===cv){const fs=String(this.fillStyle),t=this.getTransform(),x1=(a+w)*t.a+t.e;
        const mm=/^rgba\((\d+), ?(\d+), ?(\d+), ?([\d.]+)\)/.exec(fs);if(mm&&+mm[1]>=47&&+mm[1]<=154&&+mm[3]>=192&&+mm[4]<=.17&&w===3){o.aur++;o.maxA=Math.max(o.maxA,x1);o.k=t.a;}
        if((fs==='#f6f0ff'||fs==='#b48aff')&&w<=2&&h<=2){o.star++;o.maxS=Math.max(o.maxS,x1);}}}catch(e){}return f0.apply(this,arguments);};
      try{A.WS.cam=null;const t=performance.now();A.worldDraw(t);A.worldDraw(t+17);}finally{P.fillRect=f0;}o.W=cv._rw||cv.width;o.vw=A.WS.vw;o.top=Math.round(-(A.WS.cam?A.WS.cam.y:0));return o;});
    if(r.aur===0&&r.top<8){chk(`7. ${tier}: the camera shows no sky band here (top ${r.top}; skipped)`,true);}
    else{chk(`7. ${tier}: the Breach's aurora reaches across the view: its strips end at ${Math.round(r.maxA)} of ${r.W} backing px (scale ${r.k}; ${r.aur} strips)`,r.aur>0&&r.maxA>=r.W*.95);
      chk(`7. ${tier}: the void's stars over the sky band spread across the view: rightmost at ${Math.round(r.maxS)} of ${r.W} (${r.star} stars)`,r.star>0&&r.maxS>=r.W*.75);}
    chk(`7. ${tier}: no page errors (${H.errs.length})`,H.errs.length===0);await H.browser.close();}
  // ---------- 8. every exit on land (terrain14) ----------
  if(want('8')){const H=await boot('low');
    const scan=(mode)=>H.ev(([mode,N])=>{const A=__A,G=A.G,W=window.__WA12,iss=A.TW.get('mapIssues'),out={maps:0,groups:0,bad:0,badMaps:0,byKind:{},byTheme:{},ex:[],mi:0,err:0,landed:0,cause:0,brVoid:0,brTiles:0};
      W.off=mode==='off';W.cause=mode==='now';const seed0=G.run.seed,ord0=G.run.order.slice(),won0=G.won,st0=G.stage,vis0=G.visited;
      try{for(let k=0;k<N;k++){G.run.seed=k*7919+101;const NZ=A.ZONES.length;G.run.order=ord0.map((z,i)=>(k*5+i*7)%NZ);G.sub=null;G.won=1;G.stage=4;G.visited=[0,1,2,3,4];A.resetMaps();
        const ids=[];for(let s=0;s<5;s++)ids.push('t'+s,'f'+s);if(k%2===0)ids.push('x0');
        for(const id of ids){let m;try{m=A.getMap(id);}catch(e){out.err++;continue;}if(!m||!(m.kind==='field'||m.kind==='town'))continue;out.maps++;const e=A.W71.drawAudit(m).exitLand||[];out.groups+=W.api.exitGroups(m).length;
          const kk=m.breach?'breach':m.kind;out.byKind[kk]=(out.byKind[kk]||0)+1;
          if(e.length){out.bad+=e.length;out.badMaps++;const th=(m.breach?'breach':m.theme)+' '+m.kind;out.byTheme[th]=(out.byTheme[th]||0)+1;if(out.ex.length<3)out.ex.push(m.id+':'+m.thv+' '+JSON.stringify(e[0]));}
          if(m.breach){m.t.forEach(r=>{for(const c of r){out.brTiles++;if(c==='~')out.brVoid++;}});}
          out.landed+=m.exitLand||0;out.cause+=m.exitCause||0;try{out.mi+=iss(m).length;}catch(x){}
          m.exits.forEach(x=>{const c=m.t[x.y][x.x];if(c==='~'||c==='#'||c==='Z')out.err++;});}}}
      finally{G.run.seed=seed0;G.run.order=ord0;G.won=won0;G.stage=st0;G.visited=vis0;A.resetMaps();W.off=false;W.cause=true;}return out;},[mode,16]);
    const off=await scan('off'),apr=await scan('apron'),now=await scan('now');
    [['raw generator',off],['v0.19.2 apron only',apr],['now',now]].forEach(([n,r])=>console.log(`  ${n.padEnd(18)} maps ${r.maps} ${JSON.stringify(r.byKind)}, exits ${r.groups}: ${r.badMaps} maps with void by an exit (${r.bad} tiles) ${JSON.stringify(r.byTheme)}; turned to ground ${r.landed}, causeway ${r.cause}`));
    chk(`8. the v0.19.2 apron alone leaves void beside exit walkways: ${apr.badMaps} of ${apr.maps} maps (${apr.bad} tiles; ${JSON.stringify(apr.byTheme)}): bug reproduced`,apr.badMaps>=10&&off.badMaps>=apr.badMaps||JSON.stringify(apr));
    chk(`8. now no exit of a field, a town or the Breach has void in its apron or beside its walkway: ${now.badMaps} of ${now.maps} maps (${now.groups} exits; ${now.landed} void tiles turned to ground, ${now.cause} of them and bridges on causeways)`,now.maps>=150&&now.bad===0&&(now.byKind.breach||0)>=4||JSON.stringify(now));
    chk(`8. the Breach keeps its void round the islands: ${(now.brVoid/Math.max(1,now.brTiles)*100).toFixed(0)}% of its tiles are void now against ${(off.brVoid/Math.max(1,off.brTiles)*100).toFixed(0)}% raw`,now.brTiles>0&&now.brVoid>=off.brVoid*.85);
    chk(`8. every exit tile is open ground or road, the path checks (mapIssues) are no worse (${now.mi} against ${off.mi}); no generation error (${now.err})`,now.err===0&&now.mi<=off.mi);
    await H.browser.close();}
  done({browser:{close:async()=>{}}});
})().catch(e=>{console.error(e);process.exit(1);});
