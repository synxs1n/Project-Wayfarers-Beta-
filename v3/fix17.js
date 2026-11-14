// ===== fix17.js (owner playtest notes after 0.21.6: the minimap's colours and the Breach aurora) =====
// Last in MODS. No save fields; test tools/chrome/v192a.js. (The third note of this pass, Equip Best after Build party, is in gear16.js.)
//  1) "Minimap tiles not matching the in-game look": mapCol (map.js) held six fixed colour sets by the five old base themes, so every realm of
//     a theme shared one minimap (a moor, a bamboo grove, the bone fields and a plain meadow were the same green; a cloud sea was drawn as blue
//     water, the Breach as the old violet). Now each tile kind of a map takes the average colour of what the world paints on that kind: the
//     map's own ground painters (drawTile with every hook: terrain13, world14's cloud sea, breachlook11, dungeon8, cohere15's tint on props)
//     and its props and building sprites (roofs). For the map the party is on that is the world's own base canvas (WS.base) with the building
//     sprites, every tile; for another map (the connected world map) up to F17.K tiles per kind are painted for it. A wall or prop kind that
//     comes out as light as the ground is darkened in its own hue so the map still reads. The minimap, the area map and the connected world
//     map all go through mapCol, so the three follow. Marks, icons and the legend are as they were.
//  2) "Aurora glitched": the Breach aurora (breachlook11.js) and the sky stars (voidsky10.js) are painted after worldDraw on the 2D canvas. In
//     HD-2D that canvas is the overlay above the GL scene, and hdOverlay (hd2d.js) leaves it alone, uncleared, while it has nothing of its own
//     to show (clear skies, daytime, no ambience). So every frame laid the translucent ribbon on the last ones: within seconds the strips
//     summed to flat, opaque teal and violet blocks (3 px strips in 4 alpha steps, cut at the old 2D "sky band" line), and the twinkling stars
//     to white streaks as the band's height changed with the camera. In rain or at dusk the overlay was cleared each frame, which is why it
//     looked right in 0.20.4's screenshots. Now: the overlay counts as busy while a sky is in view (so it is cleared), and the sky is painted
//     here: a smooth aurora from two tiling textures (soft lower border, long fade upward, faint curtain rays) drifting against each other,
//     over the whole sky down to the scene's real horizon (the map's far edge through the HD camera, not the 2D band), fading out above it.
const F17={off:false,K:10,q:4,sep:40,gen:0,baseOf:null,sc:null,pal:new WeakMap(),art:{},n:{pal:0,exact:0,sky:0},ms:0,err:[],tex:null,sky:null};
function f17Err(w,e){try{if(F17.err.length<20)F17.err.push(w+': '+(e&&e.message||e));}catch(_){}}

// ---------- 1) minimap colours from the painted world ----------
function f17Key(m){let s=(m.kind||'')+'|'+(m.thv||m.theme||'')+'|';try{s+=(typeof ch15On==='function'&&ch15On()?1:0)+'|'+(G&&G.cleared&&G.cleared[m.s]?1:0)+'|'+(document.documentElement.classList.contains('flat')?1:0);}catch(e){}return s;}
// up to K tiles of every kind on the map, spread over it
function f17Pick(m,cnt){const by={};for(let y=0;y<m.h;y++){const r=m.t[y];for(let x=0;x<m.w;x++){const c=r[x];(by[c]||(by[c]=[])).push(x,y);}}
  const out=[];Object.keys(by).forEach(c=>{const L=by[c],n=L.length/2,k=Math.min(F17.K,n);if(cnt)cnt[c]=n;for(let i=0;i<k;i++){const j=Math.floor((i+.5)*n/k);out.push({c,x:L[j*2],y:L[j*2+1]});}});
  return out.sort((a,b)=>a.y-b.y||a.x-b.x);}
// a map the party is not on (the connected world map): paint only those tiles (ground, then the prop rows and the building sprites, clipped
// to them) and average each kind. What buildMapCanvas's own hooks add (gatehouses, entrance fronts, the baked contact shade) is not in it.
function f17Paint(m){const cnt={},S=f17Pick(m,cnt),save={lights:m.lights,smoke:m.smoke,bsp:m.bsp,torches:m.torches&&m.torches.slice(),mills:m.mills&&m.mills.slice()};
  const cv=mkCv(m.w*TS,m.h*TS),ctx=cv.getContext('2d');let ok=false;
  try{m.lights=[];m.smoke=[];m.bsp=[];ctx.save();ctx.beginPath();S.forEach(s=>ctx.rect(s.x*TS,s.y*TS,TS,TS));ctx.clip();
    S.forEach(s=>drawTile(ctx,m,s.x,s.y,0));for(let y=0;y<m.h;y++)drawObjects(ctx,m,y);
    (m.bsp||[]).forEach(q=>{if(q&&q.cv&&q.b)ctx.drawImage(q.cv,q.b.x*TS-BSP_X,q.b.y*TS-BSP_TOP);});ctx.restore();ok=true;}
  catch(e){f17Err('paint',e);}
  finally{m.lights=save.lights;m.smoke=save.smoke;m.bsp=save.bsp;if(save.torches)m.torches=save.torches;if(save.mills)m.mills=save.mills;}
  if(!ok)return null;
  const W=cv._rw||cv.width,H=cv._rh||cv.height,k=W/cv.width,ts=Math.round(TS*k),acc={};let d;
  try{const x=cv.getContext('2d');x.setTransform(1,0,0,1,0,0);d=x.getImageData(0,0,W,H).data;}catch(e){f17Err('read',e);return null;}
  S.forEach(s=>{const a=acc[s.c]||(acc[s.c]=[0,0,0,0]),x0=s.x*ts,y0=s.y*ts;for(let py=0;py<ts;py+=k)for(let px=0;px<ts;px+=k){const o=((y0+py)*W+x0+px)*4;if(d[o+3]<200)continue;a[0]+=d[o];a[1]+=d[o+1];a[2]+=d[o+2];a[3]++;}});
  return f17Avg(acc,cnt,8);}
// the map the party is on: the world's own base canvas (WS.base, everything buildMapCanvas and its hooks painted) with the building sprites
// on it, brought down to F17.q px a tile; every tile of a kind counts
function f17Exact(m){const B=WS.base&&WS.base[0];if(!B||m!==WS.m||F17.baseOf!==m||B.width!==m.w*TS||B.height!==m.h*TS)return null;
  const q=F17.q,c=F17.sc||(F17.sc=document.createElement('canvas')),W=m.w*q,H=m.h*q;if(c.width!==W||c.height!==H){c.width=W;c.height=H;}
  const x=c.getContext('2d'),DI=x._hdDI||x.drawImage,f=q/TS;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
  DI.call(x,B,0,0,B._rw||B.width,B._rh||B.height,0,0,W,H);
  (m.bsp||[]).forEach(s=>{const v=s&&s.cv,b=s&&s.b;if(!v||!b||!v.width)return;DI.call(x,v,0,0,v._rw||v.width,v._rh||v.height,(b.x*TS-BSP_X)*f,(b.y*TS-BSP_TOP)*f,v.width*f,v.height*f);});
  const d=x.getImageData(0,0,W,H).data,acc={},cnt={};
  for(let y=0;y<m.h;y++){const r=m.t[y];for(let i=0;i<m.w;i++){const ch=r[i],a=acc[ch]||(acc[ch]=[0,0,0,0]);cnt[ch]=(cnt[ch]||0)+1;
    for(let py=0;py<q;py++)for(let px=0;px<q;px++){const o=((y*q+py)*W+i*q+px)*4;if(d[o+3]<200)continue;a[0]+=d[o];a[1]+=d[o+1];a[2]+=d[o+2];a[3]++;}}}
  return f17Avg(acc,cnt,4);}
function f17Avg(acc,cnt,min){const P={};Object.keys(acc).forEach(c=>{const a=acc[c];if(a[3]>=min)P[c]=[Math.round(a[0]/a[3]),Math.round(a[1]/a[3]),Math.round(a[2]/a[3])];});
  // a map has to read: where a wall, a cliff or a prop is painted within F17.sep of the walkable ground's lightness (ice cliffs beside snow, the
  // Rift's shelves on its floor), that kind is drawn darker, in its own hue (raw keeps the painted averages for the test)
  const raw={};Object.keys(P).forEach(c=>{raw[c]=P[c].slice();});const lum=p=>.3*p[0]+.59*p[1]+.11*p[2];let Ls=0,Ln=0;
  Object.keys(P).forEach(c=>{if(c!=='~'&&SOLID.indexOf(c)<0){const n=cnt[c]||1;Ls+=lum(P[c])*n;Ln+=n;}});
  if(Ln){const Lr=Ls/Ln,tg=Math.max(Lr-F17.sep,Lr*.6);Object.keys(P).forEach(c=>{if(c==='~'||SOLID.indexOf(c)<0)return;const L=lum(P[c]);if(L<=tg||L>=Lr+F17.sep||L<1)return;const k=tg/L;P[c]=P[c].map(v=>Math.round(v*k));});}
  return {P,raw};}
const F17_ALT={'=':':B.',':':'=.','B':'=:','.':'rs,',',':'f.y','r':'.','s':'.','f':',.','y':',.','T':'t','t':'T'};
const f17Hex=p=>'#'+((1<<24)|(p[0]<<16)|(p[1]<<8)|p[2]).toString(16).slice(1);
function f17Pal(m){if(!m||!m.t||!m.w)return null;const key=f17Key(m),here=m===WS.m&&F17.baseOf===m&&!!(WS.base&&WS.base[0]);let e=F17.pal.get(m);
  if(e&&e.key===key&&(here?e.exact&&e.gen===F17.gen:true))return e.P;
  const t0=performance.now();let R=null,exact=false;try{if(here){R=f17Exact(m);exact=!!R;}if(!R)R=f17Paint(m);}catch(er){f17Err('pal',er);}
  if(!R){F17.pal.set(m,{key,P:null,exact:here,gen:F17.gen});return null;}
  // maps of one realm and kind share their art: a kind this map lacks (a gate drawn as path on a map with no path) comes from the last such map
  const A=F17.art[key]||(F17.art[key]={});Object.keys(R.P).forEach(c=>{A[c]=R.P[c];});const P={};Object.keys(A).forEach(c=>{P[c]=f17Hex(R.P[c]||A[c]);});
  F17.n.pal++;if(exact)F17.n.exact++;F17.ms=performance.now()-t0;F17.pal.set(m,{key,P,raw:R.raw,exact,gen:F17.gen});return P;}
{const mc0=mapCol;mapCol=function(m,c){if(!F17.off){try{const P=f17Pal(m);if(P){if(P[c])return P[c];const alt=F17_ALT[c];if(alt)for(let i=0;i<alt.length;i++)if(P[alt[i]])return P[alt[i]];}}catch(e){f17Err('col',e);}}
  return mc0.apply(this,arguments);};}
// the base canvas of the map the party is on was painted (arrival, a lever, a healed realm, a look setting): its colours are read again
HOOK.after('rebuildBase','fix17','the minimap takes its colours from the fresh base canvas',function(){try{F17.baseOf=WS.m||null;F17.gen++;MAPCV.dirty=1;}catch(e){}});
// a changed look (Unified look, the Flat look, a healed realm) repaints the maps on their next draw
function f17Dirty(){try{MAPCV.dirty=1;if(typeof BM!=='undefined'){BM.base={};BM.key={};}}catch(e){}}
{const ac0=applyCfg;applyCfg=function(){const r=ac0.apply(this,arguments);f17Dirty();return r;};}

// ---------- 2) the sky above a void realm and the Breach: stars and a smooth aurora ----------
const F17_TW=512,F17_TH=160;
// one curtain texture: tiles sideways; a soft lower border, a long fade upward, teal low and violet high; rays and patches a few percent deep;
// its top and bottom rows are clear, so the layer has no edge wherever it is laid
function f17Tex(seed,yBase,bias){const c=document.createElement('canvas');c.width=F17_TW;c.height=F17_TH;const x=c.getContext('2d'),img=x.createImageData(F17_TW,F17_TH),d=img.data;
  const Tl=[47,224,192],Vi=[166,104,255],ss=(a,b,v)=>{v=Math.max(0,Math.min(1,(v-a)/(b-a)));return v*v*(3-2*v);},p=seed*1.93;
  for(let i=0;i<F17_TW;i++){const u=i/F17_TW*Math.PI*2;
    const yc=F17_TH*(yBase+.11*Math.sin(u+p)+.06*Math.sin(2*u+1.7+p*2)+.028*Math.sin(5*u+p*3)),th=F17_TH*(.24+.07*Math.sin(3*u+p));
    const ray=1+.07*Math.sin(23*u+p)+.05*Math.sin(41*u+2.1*p)+.03*Math.sin(67*u+p*.7),env=.62+.38*Math.sin(2*u+p*1.3+Math.sin(u+p)),cm=.5+.5*Math.sin(u+p*2.1);
    for(let y=0;y<F17_TH;y++){const dd=(yc-y)/th,a=dd<0?Math.exp(-dd*dd*4.5):Math.exp(-dd*1.25),v=y/F17_TH,fy=ss(0,.1,v)*(1-ss(.7,.97,v));
      const mix=Math.max(0,Math.min(1,dd*1.15+bias+(cm-.5)*.6)),o=(y*F17_TW+i)*4;
      d[o]=Tl[0]+(Vi[0]-Tl[0])*mix;d[o+1]=Tl[1]+(Vi[1]-Tl[1])*mix;d[o+2]=Tl[2]+(Vi[2]-Tl[2])*mix;d[o+3]=Math.max(0,Math.min(255,a*ray*env*fy*200));}}
  x.putImageData(img,0,0);return c;}
// where the sky ends on screen (logical px from the top of the view), or null when no sky shows. HD-2D: the map's far edge through the
// camera. 2D: the rows above the map.
function f17SkyLine(){try{if(F17.off)return null;const m=WS.m;if(!m||!WS.cam||!WS.cv||m.kind==='dungeon'||(typeof mapIndoor==='function'&&mapIndoor(m)))return null;
  const br=typeof brIs==='function'&&brIs(m),T=THM(m),st=!!(T&&T.stars);if(!br&&!st)return null;const vh=WS.vh;let y;
  if(typeof hdActive==='function'&&hdActive()&&typeof HD!=='undefined'&&HD.mats&&HD.mats.vp&&HD.cam){const p=h2Proj(HD.pt||[0,0,0,0],HD.mats.vp,HD.cam.x,0,0);if(!(p[3]>0))return null;y=(1-p[1])/2*vh;}
  else y=-WS.cam.y;
  if(!(y>=4))return null;return {y:Math.min(vh,y),br,st};}catch(e){f17Err('line',e);return null;}}
function f17SkyOn(){return !F17.off;}
function f17Sky(part){const s=f17SkyLine();F17.sky=s;if(!s)return;const ctx=WS.ctx;if(!ctx)return;const vw=WS.vw,vh=WS.vh,k=Math.max(1,((WS.cv&&WS.cv._rw)||vw)/vw);
  const still=typeof gfxStill==='function'&&gfxStill(),t=still?0:performance.now()/1000,yb=s.y;
  ctx.save();ctx.setTransform(k,0,0,k,0,0);ctx.globalCompositeOperation='source-over';
  if(s.br&&part==='br'){const T=F17.tex||(F17.tex=[f17Tex(1,.6,0),f17Tex(2.7,.44,.3)]),H=Math.max(yb,vh*.34),y0=yb-H,Wt=Math.max(vw*1.3,H*1.6),vis=Math.max(0,Math.min(1,yb/(vh*.1)));
    const sm=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=true;
    [[0,2.6,.95,0],[1,-1.7,.8,.37]].forEach(L=>{let ox=-(((t*L[1]+L[3]*Wt)%Wt)+Wt)%Wt;ctx.globalAlpha=vis*L[2]*(.88+.12*Math.sin(t*.23+L[0]*2));
      for(;ox<vw;ox+=Wt)ctx.drawImage(T[L[0]],0,0,F17_TW,F17_TH,ox,y0,Wt+.5,H);});
    ctx.imageSmoothingEnabled=sm;}
  if(s.st&&part==='st'&&!F17.noStars){const Hs=Math.max(yb,vh*.42);for(let i=0;i<70;i++){const h1=hashS('vs'+i),x=(h1%997)/997*vw,up=((h1>>>10)%883)/883*Hs,y=yb-up;if(y<0)continue;
      const tw=.45+.55*Math.abs(Math.sin(t*(.6+(i%5)*.2)+i)),a=tw*.9*Math.min(1,up/(Hs*.14));if(a<.03)continue;
      ctx.globalAlpha=a;ctx.fillStyle=i%7===0?'#b48aff':'#f6f0ff';ctx.fillRect(Math.round(x),Math.round(y),i%9===0?2:1,i%9===0?2:1);}}
  ctx.restore();F17.n.sky++;}
// (called from the two modules' own worldDraw hooks, voidsky10.js for 'st' and breachlook11.js for 'br', so the draw order is as it was)
// the HD-2D overlay is cleared every frame while a sky is painted on it (it was left as it stood on a clear day, and the sky piled up)
{const ob0=hdOverlayBusy;hdOverlayBusy=function(m){return ob0.apply(this,arguments)||!!f17SkyLine();};}
window.__F17={F17,pal:m=>f17Pal(m),raw:m=>{f17Pal(m);const e=F17.pal.get(m);return e&&e.raw?{raw:e.raw,exact:e.exact}:null;},key:m=>f17Key(m),skyLine:()=>f17SkyLine(),dirty:f17Dirty};
