// ===== terrain13.js (v0.19.7): the ground reads as ground: patchwork tones and tuft variety, material transitions, living water, weather on the ground =====
// The owner, after v0.19.6: fields were one flat green with identical tufts, grass met stone, water and cliffs on a hard seam, the sea and
// the fountains read as a static dark block, and rain and snow only fell in front of the world. Four passes, all in this module, through
// hooks on the owners (drawTile and buildMapCanvas in worldgfx.js, townDecorActors in towngfx.js, hdActors / hdMergeProps / hdScene in hd2d.js,
// worldDraw for the clock). Look only: no tile, collision, save field, game number or random draw changes (the art uses mulberry seeds of the
// tile and map, never the game RNG). window.__T13 (counters `n`, `err`, the switch `off`, the levels) is the test hook; tools/chrome/v176a.js.
//   1. PATCHWORK (drawTile wrap, so the 2D base canvas and the HD-2D ground texture both get it): value noise per map (seeded from the map
//      id) lays two or three ground tones in soft patches (sub tile feathered edges), worn paths that fade at their edges (fields), and 4 to 6
//      tuft clump variants (size, lean, tone) placed by the same noise so they cluster and spill out of the ',' tiles. Per material from the
//      realm's THEME tones: grass (tufts), sand and coast (pebbles, shells, dune ripples), snow (drifts and crust sparkle), ash and volcanic
//      (cinders, soot, a rare ember), the void (spores) and the Breach (its tuft carpet thinned to one or two clumps with spores).
//   2. TRANSITIONS (the same hook, after the tile): decided by neighbour tiles at draw time, painted inside the tile: grass (or sand) creeping
//      onto road, cobble and plaza edges in ragged bites; a wet dark rim on the land beside water and foam specks on the water beside land
//      (sand fades into water through a wet band and a pale shallow); a lip of rock crumbs and a shadow line where the ground meets a cliff top.
//   3. WATER: baked into the ground (buildMapCanvas hook, both renderers): a flipped, darkened, offset reflection of the prop north of each
//      water tile (trees, lamps, waystones, signs, rocks...) cut by water lines, and a sky band under the far shore. Animated in one layer:
//      a slow sine highlight band and sparkle specks per water tile, foam that breathes on the shore, and sparkle over the fountains
//      (2D: one depth sort entry; HD-2D: quads in the blended dynamic batch the scene already draws, nothing rebaked).
//   4. WEATHER ON THE GROUND: a wet level climbs while it rains (storm too) and dries after, a snow level grows while it snows and melts
//      after (worldDraw hook, in memory only). Wet: stone, cobble, plaza and paths darken with a faint sky sheen (2D runs per row in the
//      ground entry; HD-2D flat quads in the dynamic batch). Snow: a white cap layer (prop tops, roof slopes and ridges, cliff and wall
//      ledges, a dusting on open ground) drawn at the level's alpha (2D: a cap canvas per map, one drawImage; HD-2D: a cap texture over the
//      card and building geometry plus roof, ledge and dusting quads, rebuilt only when the level crosses one of 8 steps, 2 s apart at most).
// Cheap: nothing is rebaked per frame, the per frame work is one layer in each renderer and stops at a cap of tiles; perf12's limiter is untouched.
const T13={off:false,n:{tile:0,tuft:0,edge:0,refl:0,wq:0,wetq:0,snowq:0,cap:0,fr:0,hdfr:0,hdcap:0},err:[],wet:0,snow:0,t:0,
  cfg:{ramp:{wet:22000,dry:70000,snow:45000,melt:110000},steps:8,gap:2000,wetA:.4,sheenA:.14,dustA:.16,capA:.9,roofA:.55,water2d:400,waterHd:260},
  hd:{S:null,mesh:null,tex:null,pend:null,gen:0,used:-1,lv:-1,lvT:0,W:0,H:0},force:null};
function t13Err(w,e){if(T13.err.length<24)T13.err.push(w+': '+(e&&e.message||e));}
function t13HashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function t13H(x,y,k){let h=(x*374761393+y*668265263+k*1274126177)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296;}
// ---------- the map's own noise and material ----------
function t13Noise(m){let N=m.__t13n;if(N&&N.w===m.w&&N.h===m.h)return N;const h=(t13HashS(String(m.id||''))+(m.s|0)*7919)>>>0;
  N={w:m.w,h:m.h,a:valueNoise(mulberry((h+101)>>>0),m.w+2,m.h+2,5),b:valueNoise(mulberry((h+202)>>>0),m.w+2,m.h+2,3)};return m.__t13n=N;}
function t13Key(m){const s=String(m.thv||'');const i=s.indexOf('@');if(i<0)return '';return s.slice(i+1).split(/[%~#]/)[0];}
function t13Mat(m){const c=m.__t13m;if(c&&c.thv===(m.thv||'')&&c.th===m.theme)return c.M;const T=THM(m)||THEME.meadow,k=t13Key(m);
  const M=T.breach?'breach':(k==='mesa'||m.theme==='coast')?'sand':m.theme==='snow'?'snow':(k==='ashen'||k==='deeps'||k==='ashglass')?'ash':m.theme==='cave'?'cinder':m.theme==='void'?'void':'grass';
  m.__t13m={thv:m.thv||'',th:m.theme,M};return M;}
// tone sets per theme, made once (shade and tint per tile would be slow at bake)
const T13_TONES=new WeakMap();
function t13Tones(T){let o=T13_TONES.get(T);if(o)return o;const g=T.g||THEME.meadow.g,tg=T.tg||THEME.meadow.tg,p=T.p||THEME.meadow.p,cl=T.cl||THEME.meadow.cl,w=T.w||THEME.meadow.w;
  o={g,tg,p,cl,w,dark:shade(g[0],.86),light:tint(g[0],.1),wet:shade(g[0],.7),wet2:shade(g[0],.84),path:p[0],path2:p[1],
    tuft:[tg,[shade(tg[0],.86),shade(tg[1],.86),shade(tg[2],.9)],[tint(tg[0],.1),tint(tg[1],.1),tint(tg[2],.08)]],
    pebble:[shade(g[1],.82),tint(g[2],.14),g[3]],shallow:mix(w[1],g[2],.45),foam:'#e8f8ff',rockLip:[cl[2],cl[0],cl[3]]};T13_TONES.set(T,o);return o;}
// what a tile is, for the edges
const T13_WATER='~o',T13_ROAD='=X',T13_PLAZA=':',T13_HARD='#ZYsyBHj';
function t13Class(c){if(T13_WATER.includes(c))return 'w';if(T13_ROAD.includes(c))return 'r';if(c===':')return 'p';if(T13_HARD.includes(c))return 'h';return 'g';}
// ---------- 1 and 2: the tile ----------
// 4 to 6 clump variants per material, at (X, Y) with lean -1..1 and a tone set; each stays inside its tile (callers keep X in 0..11, Y in 2..13)
function t13Clump(f,M,v,X,Y,ln,tn,R){
  if(M==='grass'||M==='breach'||M==='void'){const t=tn,a=t[0],b=t[1],c=t[2];
    if(v===0){f(a,X,Y+1,1,2);f(b,X+1+ln,Y,1,3);f(a,X+2,Y+1,1,2);}
    else if(v===1){f(b,X+ln,Y-1,1,4);f(c,X+ln,Y-1,1,1);f(a,X+1,Y+1,1,2);}
    else if(v===2){f(a,X,Y+1,3,1);f(b,X+1,Y,1,2);f(b,X+3+ln,Y,1,2);}
    else if(v===3){f(b,X,Y+1,1,2);f(c,X+ln,Y,1,1);}
    else if(v===4){f(a,X,Y,1,3);f(b,X+1+ln,Y-1,1,4);f(a,X+2,Y,1,3);f(c,X+1+ln,Y-1,1,1);f(b,X+3,Y+1,1,2);}
    else{f(b,X,Y,1,3);f(c,X+ln,Y-1,1,1);f(b,X+2,Y+1,1,2);f(c,X+2+ln,Y,1,1);}return;}
  if(M==='sand'){const [dk,lt,sh]=tn;
    if(v===0){f(sh,X,Y+1,2,1);f(lt,X,Y,2,1);}else if(v===1){f(dk,X,Y,3,1);f(lt,X+1,Y-1,1,1);}else if(v===2){f(sh,X+1,Y+1,1,1);f(lt,X,Y,1,1);f(lt,X+2,Y,1,1);}
    else if(v===3){f(dk,X,Y,5,1);f(lt,X+1,Y-1,3,1);}else if(v===4){f('#fff6e0',X,Y,1,1);f(sh,X+1,Y+1,1,1);f(dk,X,Y+1,1,1);}else{f(sh,X,Y+1,3,1);f(lt,X+1,Y,1,1);f(dk,X+3+ln,Y,1,1);}return;}
  if(M==='snow'){const sh=tn[2];
    if(v===0){f('#ffffff',X,Y,4,1);f(sh,X+1,Y+1,4,1);}else if(v===1){f('#ffffff',X,Y,2,1);f(sh,X+1,Y+1,2,1);}else if(v===2){f('#ffffff',X+ln,Y-1,1,1);f('#ffffff',X,Y,5,1);f(sh,X+2,Y+1,4,1);}
    else if(v===3){f('#ffffff',X,Y,1,1);f('#ffffff',X+2,Y+1,1,1);}else if(v===4){f(sh,X,Y+1,5,1);f('#ffffff',X+1,Y,3,1);f('#ffffff',X+1+ln,Y-1,1,1);}else{f(sh,X,Y,2,1);f('#ffffff',X+1,Y-1,2,1);}return;}
  if(M==='ash'||M==='cinder'){const dk='#141012',so=tn[0];
    if(v===0){f(dk,X,Y,2,1);}else if(v===1){f(so,X,Y,3,1);f(dk,X+1,Y+1,1,1);}else if(v===2){f(dk,X,Y,1,1);f(dk,X+2,Y+1,1,1);}
    else if(v===3){f(so,X,Y,4,1);f(so,X+1,Y+1,2,1);}else if(v===4){f(dk,X+1,Y,2,1);f('#ff7a2a',X,Y+1,1,1);}else{f(dk,X,Y+1,3,1);f(dk,X+1,Y,1,1);}return;}
}
const T13_REFL={T:['tree',-3,2,'t'],t:['bush',-1,1],R:['rock',-1,1],C:['chest',-1,0],c:['chestOpen',-1,0],S:['sign',-1,1],W:['waystone',-1,1],L:['lamp',2,1],b:['barrel',1,0],x:['crate',0,0],
  h:['hay',-1,0],k:['cart',-2,0],a:['anvil',-1,0],g:['grave',1,0],N:['standing',1,1],Q:['ruinwall',-1,1],P:['pillar',1,1],e:['tent',-3,1,'v'],Y:['tower',-4,1]};
function t13ObjAt(m,c,x,y){const o=T13_REFL[c];if(!o)return null;const v=(x*31+y*17)%5;let cv=null;
  try{cv=objCanvas(m.theme,o[0],o[3]==='t'?v%2:o[3]==='v'?v:0);}catch(e){return null;}if(!cv||!cv.width)return null;return {cv,ox:o[1],oy:o[2]};}
function t13Tile(ctx,m,x,y,frame,c){const T=THM(m);if(!T)return;const tn=t13Tones(T),M=t13Mat(m),N=t13Noise(m),px=x*TS,py=y*TS,town=m.kind==='town';
  const f=(col,a,b,w,h)=>{ctx.fillStyle=col;ctx.fillRect(px+a,py+b,w,h);},k=t13Class(c),R=mulberry((t13H(x,y,m.s|0)*1e9|0)+13),nb=(dx,dy)=>t13Class(tileAt(m,x+dx,y+dy));
  T13.n.tile++;
  if(k==='g'){// --- patchwork: two or three tones in soft patches, 4 x 4 px feathered blocks of the map's noise
    const isBr=M==='breach';if(!isBr){
      for(let j=0;j<4;j++)for(let i=0;i<4;i++){const a=N.a(x+(i+.5)/4,y+(j+.5)/4);let al=0,col=null;
        if(a<.4){al=Math.min(1,(.4-a)/.12)*.5;col=tn.dark;}else if(a>.6){al=Math.min(1,(a-.6)/.12)*.42;col=tn.light;}
        if(al>.04){ctx.globalAlpha=al;f(col,i*4,j*4,4,4);}
        if(!town&&(M==='grass'||M==='sand'||M==='snow'||M==='ash')){const b=N.b(x+(i+.5)/4,y+(j+.5)/4),d=Math.abs(b-.5);if(d<.07){ctx.globalAlpha=(1-d/.07)*.5;f(tn.path,i*4,j*4,4,4);}}}
      ctx.globalAlpha=1;}
    // --- tufts, pebbles, drifts, cinders or spores: clustered by the noise, more on ',' tiles, a few on open ground
    const b=N.b(x+.5,y+.5),tuftTile=c===',',dense=b>.6;let n=0;
    if(M==='grass'){n=tuftTile?2+Math.floor(b*3.2):(dense&&R()<.55?1:0);}
    else if(M==='breach'){n=tuftTile?2+(b>.5?1:0):(dense&&R()<.2?1:0);if(tuftTile)f('rgba(63,224,200,.16)',0,0,16,16);}// the encounter tile keeps a teal cast so it still reads as grass
    else if(M==='void'){n=tuftTile?1+Math.floor(b*2.5):(dense&&R()<.35?1:0);}
    else{n=tuftTile?2+Math.floor(b*2.5):(dense?1+(R()<.4?1:0):(R()<.25?1:0));}
    if(c==='f')n=Math.min(n,1);
    for(let i=0;i<n;i++){const v=Math.floor(R()*6),ln=Math.floor(R()*3)-1,ts=Math.floor(R()*3),X=Math.floor(R()*11),Y=2+Math.floor(R()*11);
      const tone=M==='sand'?tn.pebble:M==='snow'?[null,null,tn.g[3]]:(M==='ash'||M==='cinder')?[tn.dark]:tn.tuft[ts];
      t13Clump(f,M,v,X,Y,ln,tone,R);T13.n.tuft++;}
    if(M==='breach'&&tuftTile){for(let i=0;i<3;i++){const sx=1+Math.floor(R()*14),sy=1+Math.floor(R()*13);f('rgba(63,224,200,.22)',sx-1,sy-1,3,3);f(R()<.65?'#c8fff4':'#d0b8ff',sx,sy,1,1);}}
    if(M==='void'&&tuftTile&&R()<.6){const sx=Math.floor(R()*15),sy=Math.floor(R()*15);f(R()<.5?'#8a6ad0':'#5fc9a0',sx,sy,1,1);}
  }
  // --- transitions, inside this tile, read off the neighbours
  const wetOk=!(T.cloud||T.stars||m.theme==='cave');// cloud seas, the void and lava get no waterline
  if((k==='r'||k==='p')&&M!=='breach'){// grass (sand, snow) creeps onto the stone in ragged bites
    const g0=tn.g[0],g3=tn.g[3],blade=tn.tg[1];
    const side=(dx,dy)=>{if(nb(dx,dy)!=='g')return;T13.n.edge++;
      for(let i=0;i<16;i++){const r=R(),d=r<.3?0:r<.7?1:r<.92?2:3;if(!d)continue;
        if(dy<0)f(i%3?g0:g3,i,0,1,d);else if(dy>0)f(i%3?g0:g3,i,16-d,1,d);else if(dx<0)f(i%3?g0:g3,0,i,d,1);else f(i%3?g0:g3,16-d,i,d,1);
        if(M==='grass'&&d>1&&R()<.35){if(dy<0)f(blade,i,d,1,1);else if(dy>0)f(blade,i,15-d,1,1);}}};
    side(0,-1);side(0,1);side(-1,0);side(1,0);}
  if(k==='g'&&wetOk){// a wet dark rim on the land beside water; sand fades into the water through a darker wet band
    const rim=(dx,dy)=>{if(nb(dx,dy)!=='w')return;T13.n.edge++;const sand=M==='sand';
      for(let i=0;i<16;i++){const d=1+(R()<.6?1:0)+(sand&&R()<.5?1:0),col=i%2||!sand?tn.wet:tn.wet2;
        if(dy>0)f(col,i,16-d,1,d);else if(dy<0)f(col,i,0,1,d);else if(dx>0)f(col,16-d,i,d,1);else f(col,0,i,d,1);
        if(sand&&R()<.3){if(dy>0)f(tn.wet2,i,15-d,1,1);else if(dy<0)f(tn.wet2,i,d,1,1);}}};
    rim(0,1);rim(0,-1);rim(1,0);rim(-1,0);}
  if(k==='w'&&wetOk){// foam specks on the water beside land (the two bake frames differ, so it breathes even on Low); a pale shallow on sand
    const foam=tn.foam,sand=M==='sand',o=frame?1:0;
    const edge=(dx,dy)=>{const q=nb(dx,dy);if(q==='w')return;T13.n.edge++;
      if(sand){ctx.globalAlpha=.55;if(dy<0)f(tn.shallow,0,0,16,3);else if(dy>0)f(tn.shallow,0,13,16,3);else if(dx<0)f(tn.shallow,0,0,3,16);else f(tn.shallow,13,0,3,16);ctx.globalAlpha=1;}
      // a ragged foam line: segments with gaps one or two px off the edge, a paler broken line behind it (the two frames shift it a px)
      const seg=(col,d)=>{let i=Math.floor(R()*3);while(i<16){const len=2+Math.floor(R()*4),gap=1+Math.floor(R()*3),w=Math.min(len,16-i);
        if(dy<0)f(col,i,d,w,1);else if(dy>0)f(col,i,15-d,w,1);else if(dx<0)f(col,d,i,1,w);else f(col,15-d,i,1,w);i+=len+gap;}};
      seg(foam,1+o);seg(tn.w[2],2+(o?0:1));};
    edge(0,-1);edge(0,1);edge(-1,0);edge(1,0);}
  if(k==='g'&&tileAt(m,x,y+1)==='#'){// the ground meets a cliff top: a lip of rock crumbs and a shadow line along the edge
    T13.n.edge++;const L=tn.rockLip;f(shade(tn.g[0],.78),0,15,16,1);
    for(let i=0;i<16;i++){const r=R();if(r<.5)f(L[0],i,14-(r<.15?1:0),1,1+(r<.15?1:0));else if(r<.7)f(L[1],i,14,1,1);}
    for(let i=0;i<2;i++){const a=1+Math.floor(R()*13);f(L[1],a,12,2,2);f(L[0],a,12,1,1);f(L[2],a+1,13,1,1);}}
  if(k==='g'&&(tileAt(m,x-1,y)==='#'||tileAt(m,x+1,y)==='#')){const L=tn.rockLip;for(let j=0;j<16;j++)if(R()<.45){if(tileAt(m,x-1,y)==='#')f(j%3?L[1]:L[0],0,j,1,1);if(tileAt(m,x+1,y)==='#')f(j%3?L[1]:L[0],15,j,1,1);}}
}
HOOK.wrap('drawTile','terrain13','ground patchwork, tuft variety and material transitions (2D base and the HD-2D ground bake)',function(next,ctx,m,x,y,frame){
  if(T13.off||!m||m.kind==='dungeon'||!m.t||!m.t[y])return next(ctx,m,x,y,frame);
  const c=tileAt(m,x,y),sw=c===','&&m.t[y][x]===',';if(sw)m.t[y][x]='.';// the base and the Breach draw bare ground; the clumps are this module's
  try{const r=next(ctx,m,x,y,frame);try{t13Tile(ctx,m,x,y,frame,c);}catch(e){t13Err('tile',e);}return r;}finally{if(sw)m.t[y][x]=',';}});
// ---------- 3: water, the baked part: reflections and the sky band ----------
function t13Water(ctx,m,frame){const T=THM(m);if(!T||T.cloud||T.stars||m.theme==='cave')return;const tn=t13Tones(T),w=tn.w,R=mulberry((m.s|0)*131+7);
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=tileAt(m,x,y);if(!T13_WATER.includes(c))continue;const px=x*TS,py=y*TS,up=tileAt(m,x,y-1);
    if(!T13_WATER.includes(up)&&up!=='B'){ctx.globalAlpha=.2;ctx.fillStyle=w[2];ctx.fillRect(px,py+3,16,1);ctx.globalAlpha=.1;ctx.fillRect(px,py+4,16,2);ctx.globalAlpha=1;}
    for(let k=1;k<=2;k++){const cu=tileAt(m,x,y-k);if(k===2&&!T13_WATER.includes(tileAt(m,x,y-1)))break;if(T13_WATER.includes(cu))continue;
      const o=t13ObjAt(m,cu,x,y-k);if(!o)break;const shore=(y-k+1)*TS;
      ctx.save();ctx.beginPath();ctx.rect(px,py,16,16);ctx.clip();ctx.globalAlpha=.3;ctx.translate(1,2*shore);ctx.scale(1,-1);ctx.drawImage(o.cv,px+o.ox,(y-k)*TS+16-o.cv.height+o.oy);ctx.restore();
      ctx.globalAlpha=.55;ctx.fillStyle=w[0];const r1=2+Math.floor(R()*5),r2=9+Math.floor(R()*5)+(frame?1:0);ctx.fillRect(px,py+r1,16,1);ctx.fillRect(px+3,py+r2,10,1);ctx.globalAlpha=1;T13.n.refl++;break;}}}
HOOK.after('buildMapCanvas','terrain13','water reflections and a sky band on the water (ground art of both renderers)',function(cv,m,frame){
  try{if(T13.off||!m||m.kind==='dungeon'||!cv||!cv.getContext)return;t13Water(cv.getContext('2d'),m,frame);}catch(e){t13Err('water',e);}});
// ---------- 4: the levels follow the weather ----------
function t13Weights(m){let rain=0,snow=0;try{const L=w7List(m);for(const [w,k] of L){if(w==='rain'||w==='storm')rain+=k;else if(w==='snow'||w==='blizzard')snow+=k;}}catch(e){}return [Math.min(1,rain),Math.min(1,snow)];}
function t13Track(t){const dt=T13.t?Math.max(0,Math.min(120,t-T13.t)):0;T13.t=t;if(!dt)return;const m=WS.m,C=T13.cfg.ramp;let rain=0,snow=0;
  if(m&&!mapIndoor(m)&&(m.kind==='field'||m.kind==='town')){const w=t13Weights(m);rain=w[0];snow=w[1];}
  if(T13.force){rain=T13.force[0];snow=T13.force[1];}
  T13.wet=Math.max(0,Math.min(1,T13.wet+(rain>0?dt*rain/C.wet:-dt/C.dry)));T13.snow=Math.max(0,Math.min(1,T13.snow+(snow>0?dt*snow/C.snow:-dt/C.melt)));}
HOOK.before('worldDraw','terrain13','the wet and snow levels follow the weather (in memory only)',function(now){try{t13Track(+now||performance.now());}catch(e){t13Err('track',e);}});
// ---------- 2D: the living water and the wet ground (one depth sort entry under the actors), the snow caps (one over them) ----------
const T13A={g:{y:-1e9+.5,deco:'terrain13:ground',draw:null},c:{y:1e9-.5,deco:'terrain13:caps',draw:null},a:{ctx:null,m:null,cx:0,cy:0,vw:0,vh:0,ts:0}};
function t13Ground2D(ctx,m,cx,cy,vw,vh,ts){const T=THM(m);if(!T)return;const tn=t13Tones(T),w=tn.w,water=!(T.cloud||T.stars||m.theme==='cave'),wet=T13.wet,C=T13.cfg;
  const x0=Math.max(0,Math.floor(cx/TS)),x1=Math.min(m.w-1,Math.ceil((cx+vw)/TS)),y0=Math.max(0,Math.floor(cy/TS)),y1=Math.min(m.h-1,Math.ceil((cy+vh)/TS));
  let nw=0;const town=m.kind==='town';
  for(let y=y0;y<=y1;y++){let run=-1,runK='';const flush=(xe)=>{if(run<0)return;const px=run*TS-cx,py=y*TS-cy,W=(xe-run)*TS;
      ctx.globalAlpha=wet*C.wetA;ctx.fillStyle=runK==='r'&&!town?'#2a1c10':'#121626';ctx.fillRect(px,py,W,16);
      ctx.globalAlpha=wet*C.sheenA;ctx.fillStyle='#c8dcf4';ctx.fillRect(px,py+4,W,1);ctx.fillRect(px+2,py+11,W-4,1);run=-1;};
    for(let x=x0;x<=x1;x++){const c=tileAt(m,x,y),k=t13Class(c);
      if(wet>.01&&(k==='r'||k==='p'||c==='s'||c==='B')){const kk=k==='p'||c==='s'||c==='B'||town?'p':'r';if(run>=0&&kk!==runK)flush(x);if(run<0){run=x;runK=kk;}}else if(run>=0)flush(x);
      if(water&&k==='w'&&nw<C.water2d&&ts){nw++;const px=x*TS-cx,py=y*TS-cy,h=t13H(x,y,17),h2=t13H(x,y,23);
        const ph=(ts/2200+h)%1,yb=2+Math.floor(ph*12),a=.22+.22*Math.sin(ts/1300+h*6.28);ctx.globalAlpha=Math.max(0,a);ctx.fillStyle=w[2];ctx.fillRect(px+1+Math.floor(h2*7),py+yb,4+Math.floor(h*5),1);
        const sp=(ts/900+h2*3)%1;if(sp<.18){ctx.globalAlpha=Math.sin(sp/.18*Math.PI)*.9;ctx.fillStyle='#ffffff';ctx.fillRect(px+2+Math.floor(h*12),py+2+Math.floor(h2*11),1,1);}
        const land=!T13_WATER.includes(tileAt(m,x,y-1))||!T13_WATER.includes(tileAt(m,x,y+1))||!T13_WATER.includes(tileAt(m,x-1,y))||!T13_WATER.includes(tileAt(m,x+1,y));
        if(land){ctx.globalAlpha=.3+.3*Math.sin(ts/1600+(x+y)*.9);ctx.fillStyle=tn.foam;const wob=Math.floor(ts/700)%2;
          if(!T13_WATER.includes(tileAt(m,x,y-1)))ctx.fillRect(px+1+Math.floor(h*12),py+1+wob,2,1);if(!T13_WATER.includes(tileAt(m,x,y+1)))ctx.fillRect(px+2+Math.floor(h2*11),py+14-wob,2,1);
          if(!T13_WATER.includes(tileAt(m,x-1,y)))ctx.fillRect(px+wob,py+2+Math.floor(h*11),1,2);if(!T13_WATER.includes(tileAt(m,x+1,y)))ctx.fillRect(px+15-wob,py+1+Math.floor(h2*12),1,2);}}}
    flush(x1+1);}
  ctx.globalAlpha=1;T13.n.wq+=nw;T13.n.fr++;}
// the cap canvas of a map: prop tops, roofs, ledges and a dusting on open ground, white; drawn at the snow level's alpha
const T13_CAPS=new WeakMap();
function t13CapOf(cv){let c=T13_CAPS.get(cv);if(c)return c;const w=cv.width,h=cv.height;c=mkCv(w,h);try{const d=cv.getContext('2d').getImageData(0,0,w,h).data,o=c.getContext('2d'),img=o.createImageData(w,h),q=img.data;
    for(let x=0;x<w;x++){let prev=0;for(let y=0;y<h;y++){const a=d[(y*w+x)*4+3];if(a>60&&prev<=60){for(let k=0;k<2&&y+k<h;k++){if(d[((y+k)*w+x)*4+3]<=60)break;const i=((y+k)*w+x)*4;q[i]=q[i+1]=q[i+2]=255;q[i+3]=k?200:255;}}prev=a;}}
    o.putImageData(img,0,0);}catch(e){t13Err('cap',e);}T13_CAPS.set(cv,c);return c;}
function t13RoofOf(q){const cv=q.cv,b=q.b,key='__t13roof';if(cv[key])return cv[key];const h=b.h*TS,roofH=Math.floor(h*.5),rt=-6,c=mkCv(cv.width,cv.height),o=c.getContext('2d');
  o.drawImage(cv,0,0);o.globalCompositeOperation='source-in';o.fillStyle='#ffffff';o.fillRect(0,BSP_TOP+rt-1,cv.width,roofH-rt-1);return cv[key]=c;}
function t13CapCanvas(m){const base=WS.base&&WS.base[0];if(m.__t13cap&&m.__t13capB===base)return m.__t13cap;const cv=mkCv(m.w*TS,m.h*TS),c=cv.getContext('2d'),A=T13.cfg;
  c.fillStyle=`rgba(255,255,255,${A.dustA})`;
  for(let y=0;y<m.h;y++){let run=-1;for(let x=0;x<=m.w;x++){const t=x<m.w?tileAt(m,x,y):'#',k=t13Class(t),open=k!=='w'&&k!=='h';if(open&&run<0)run=x;if(!open&&run>=0){c.fillRect(run*TS,y*TS,(x-run)*TS,16);run=-1;}}}
  c.fillStyle=`rgba(255,255,255,${A.capA})`;const R=mulberry((m.s|0)*17+3);
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const t=tileAt(m,x,y);
    if(t==='#'){if(tileAt(m,x,y-1)!=='#'){for(let i=0;i<16;i++)c.fillRect(x*TS+i,y*TS,1,2+(R()<.5?1:0));}}
    else if(t==='Z'||t==='Y'){if(!'ZY'.includes(tileAt(m,x,y-1)))c.fillRect(x*TS,y*TS,16,2);}
    else{const o=t13ObjAt(m,t,x,y);if(o)c.drawImage(t13CapOf(o.cv),x*TS+o.ox,y*TS+16-o.cv.height+o.oy);}}
  (m.bsp||[]).forEach(q=>{try{const b=q.b,X=b.x*TS-BSP_X,Y=b.y*TS-BSP_TOP;const T=THM(m),k=b.k,house=!/^wa13/.test(k||'')&&k!=='keep'&&k!=='tower'&&k!=='bigtent'&&k!=='gatehouse'&&!(T&&T.mat==='tent'&&!(k==='guild'||k==='keep'||k==='chapel'||k==='tower'||k==='windmill'));
    if(house){c.globalAlpha=A.roofA;c.drawImage(t13RoofOf(q),X,Y);c.globalAlpha=1;}c.drawImage(t13CapOf(q.cv),X,Y);}catch(e){t13Err('bspcap',e);}});
  m.__t13cap=cv;m.__t13capB=base;T13.n.cap++;return cv;}
T13A.g.draw=()=>{const a=T13A.a;if(!a.m)return;try{t13Ground2D(a.ctx,a.m,a.cx,a.cy,a.vw,a.vh,a.ts);}catch(e){t13Err('g2d',e);}};
T13A.c.draw=()=>{const a=T13A.a;if(!a.m||T13.snow<=.005)return;try{const cv=t13CapCanvas(a.m),ctx=a.ctx;ctx.globalAlpha=T13.snow;ctx.drawImage(cv,-a.cx,-a.cy);ctx.globalAlpha=1;}catch(e){t13Err('c2d',e);}};
const T13_FN=[];// fountain sparkle entries, reused
function t13Fountain2D(ctx,fx,fy,ts){const h=t13H(fx,fy,31);for(let i=0;i<4;i++){const ph=(ts/700+h+i*.27)%1;if(ph>.5)continue;const a=Math.sin(ph*2*Math.PI);ctx.globalAlpha=a*.85;ctx.fillStyle=i%2?'#ffffff':'#d8f4ff';
    ctx.fillRect(fx+6+Math.floor(t13H(fx+i,fy,37)*20),fy-4-Math.floor(ph*10),1,1);}ctx.globalAlpha=.3+.2*Math.sin(ts/500+h);ctx.fillStyle='#e8f8ff';ctx.fillRect(fx+4,fy+12,24,1);ctx.globalAlpha=1;}
HOOK.after('townDecorActors','terrain13','living water, wet ground and snow caps in the 2D depth sort',function(r,actors,now,cx,cy){try{const m=WS.m;if(T13.off||!m||m.archive||m.kind==='dungeon'||(typeof GFX!=='undefined'&&GFX.off)||!WS.ctx||(typeof HD!=='undefined'&&HD.live))return;
  const still=gfxStill(),a=T13A.a;a.ctx=WS.ctx;a.m=m;a.cx=cx;a.cy=cy;a.vw=WS.vw;a.vh=WS.vh;a.ts=still?0:now;actors.push(T13A.g);if(T13.snow>.005)actors.push(T13A.c);
  if(!still){let n=0;for(let y=Math.max(0,Math.floor(cy/TS)-1);y<=Math.min(m.h-1,Math.ceil((cy+WS.vh)/TS));y++)for(let x=Math.max(0,Math.floor(cx/TS)-2);x<=Math.min(m.w-1,Math.ceil((cx+WS.vw)/TS));x++){
      if(tileAt(m,x,y)!=='O'||tileAt(m,x-1,y)==='O'||tileAt(m,x,y-1)==='O')continue;let e=T13_FN[n];if(!e){e=T13_FN[n]={y:0,deco:'terrain13:fountain',fx:0,fy:0,ts:0,draw:null};e.draw=()=>t13Fountain2D(WS.ctx,e.fx,e.fy,e.ts);}
      e.y=(y+1)*TS+.25;e.fx=x*TS-cx;e.fy=y*TS-cy;e.ts=now;actors.push(e);n++;if(n>=6)return;}}}catch(e){t13Err('actors',e);}});
// ---------- HD-2D: the living water and the wet ground as quads in the dynamic blended batch; the snow caps as a static mesh per level step ----------
function t13HdFrame(m,now,ts){const S=HD.S;if(!S||!S.HT)return;const V=S.V,B=HD.dynB,R=HD.lmR,W=m.w,H=m.h,T=THM(m);if(!T||!R)return;const tn=t13Tones(T),wet=T13.wet,C=T13.cfg;
  const x0=Math.max(0,Math.floor(R[0]/TS)),x1=Math.min(W-1,Math.ceil((R[0]+R[2])/TS)),y0=Math.max(0,Math.floor(R[1]/TS)),y1=Math.min(H-1,Math.ceil((R[1]+R[3])/TS));
  const P=H2P,water=!(T.cloud||T.stars||m.theme==='cave'),yw=HD2D.water*V+.45,town=m.kind==='town',wc=hdRgb(tn.w[2]).map(v=>Math.round(v*255)),fc=[232,248,255];
  const flat=(xa,xb,za,zb,y,r,g,b,a,fl)=>{P[0]=xa;P[1]=y;P[2]=za;P[3]=xb;P[4]=y;P[5]=za;P[6]=xb;P[7]=y;P[8]=zb;P[9]=xa;P[10]=y;P[11]=zb;B.quad(P,-1,0,-1,0,r,g,b,a,0,1,0,fl);};
  let nw=0,nq=0;
  for(let y=y0;y<=y1;y++){let run=-1,runK='';const flush=(xe)=>{if(run<0)return;const dark=runK==='r'&&!town;
      flat(run*TS,xe*TS,y*TS,(y+1)*TS,.5,dark?42:18,dark?28:22,dark?16:38,Math.round(wet*C.wetA*255),4);
      flat(run*TS+1,xe*TS-1,y*TS+4,y*TS+5.5,.52,200,220,244,Math.round(wet*C.sheenA*255),4);nq+=2;run=-1;};
    for(let x=x0;x<=x1;x++){const c=tileAt(m,x,y),k=t13Class(c);
      if(wet>.01&&(k==='r'||k==='p'||c==='s'||c==='B')){const kk=k==='p'||c==='s'||c==='B'||town?'p':'r';if(run>=0&&kk!==runK)flush(x);if(run<0){run=x;runK=kk;}}else if(run>=0)flush(x);
      if(water&&k==='w'&&ts&&nw<C.waterHd&&S.KD[y*W+x]===4){nw++;const px=x*TS,pz=y*TS,h=t13H(x,y,17),h2=t13H(x,y,23);
        const ph=(ts/2200+h)%1,zb=pz+2+ph*11,a=.22+.22*Math.sin(ts/1300+h*6.28);if(a>.02){const xa=px+1+Math.floor(h2*7),len=4+Math.floor(h*5);flat(xa,xa+len,zb,zb+1,yw,wc[0],wc[1],wc[2],Math.round(a*255),0);}
        const sp=(ts/900+h2*3)%1;if(sp<.18){const xa=px+2+Math.floor(h*12),za=pz+2+Math.floor(h2*11);flat(xa,xa+1,za,za+1,yw+.1,255,255,255,Math.round(Math.sin(sp/.18*Math.PI)*230),4);}
        const un=!T13_WATER.includes(tileAt(m,x,y-1)),dn=!T13_WATER.includes(tileAt(m,x,y+1)),lf=!T13_WATER.includes(tileAt(m,x-1,y)),rt=!T13_WATER.includes(tileAt(m,x+1,y));
        if(un||dn||lf||rt){const fa=Math.round((.3+.3*Math.sin(ts/1600+(x+y)*.9))*255),wob=Math.floor(ts/700)%2;
          if(un){const xa=px+1+Math.floor(h*12);flat(xa,xa+2,pz+1+wob,pz+2+wob,yw+.05,fc[0],fc[1],fc[2],fa,0);}if(dn){const xa=px+2+Math.floor(h2*11);flat(xa,xa+2,pz+14-wob,pz+15-wob,yw+.05,fc[0],fc[1],fc[2],fa,0);}
          if(lf){const za=pz+2+Math.floor(h*11);flat(px+wob,px+1+wob,za,za+2,yw+.05,fc[0],fc[1],fc[2],fa,0);}if(rt){const za=pz+1+Math.floor(h2*12);flat(px+15-wob,px+16-wob,za,za+2,yw+.05,fc[0],fc[1],fc[2],fa,0);}}}
      if(c==='O'&&ts&&tileAt(m,x-1,y)!=='O'&&tileAt(m,x,y-1)!=='O'){const fx=x*TS,fz=y*TS,h=t13H(x,y,31);// sparkle over the fountain
        for(let i=0;i<4;i++){const ph=(ts/700+h+i*.27)%1;if(ph>.5)continue;const a=Math.sin(ph*2*Math.PI),xa=fx+6+Math.floor(t13H(x+i,y,37)*20),yy=(10+ph*12)*V;
          P[0]=xa;P[1]=yy+1.2;P[2]=fz+16;P[3]=xa+1;P[4]=yy+1.2;P[5]=fz+16;P[6]=xa+1;P[7]=yy;P[8]=fz+16;P[9]=xa;P[10]=yy;P[11]=fz+16;B.quad(P,-1,0,-1,0,255,255,255,Math.round(a*220),0,.45,.89,4);}}}
    flush(x1+1);}
  T13.n.wq+=nw;T13.n.wetq+=nq;T13.n.hdfr++;}
// the cap texture (white at the top edges of every card and building piece of the props texture) and a copy of their geometry, taken when the
// props texture is merged (hdMergeProps, inside the bake); adopted by the first frame that sees it
HOOK.xform('hdMergeProps','terrain13','the snow cap texture and geometry of the props (HD-2D)',function(cv,cards,blds){try{if(T13.off||!cv){T13.hd.pend=null;return cv;}
  const cap=t13CapOf(cv),src=[];[cards,blds].forEach((o,which)=>{if(!o||!o.bt||!o.bt.b)return;o.bt.b.forEach((bt,i)=>{if(!bt||!bt.n)return;src.push({i,n:bt.n,buf:bt.buf.slice(0,bt.n*4*H2V_STRIDE),nc:o.bt.nc,nr:o.bt.nr});});});
  T13.hd.pend={cap,src};T13.hd.gen++;}catch(e){t13Err('merge',e);T13.hd.pend=null;}return cv;});
function t13HdFree(){const gl=HD.gl,h=T13.hd;try{if(h.mesh&&gl)h2ChunksFree(gl,h.mesh);if(h.tex&&gl)gl.deleteTexture(h.tex);}catch(e){}h.mesh=null;h.tex=null;h.lv=-1;h.trim=null;h.capA=null;}
function t13HdAdopt(m){const h=T13.hd,S=HD.S;if(h.S===S&&h.used===h.gen)return;t13HdFree();h.S=S;h.used=h.gen;h.src=h.pend;h.lv=-1;h.capA=null;
  if(h.src&&h.src.cap&&HD.gl){try{h.tex=h2TexFrom(HD.gl,h.src.cap,HD.gl.LINEAR);const c=h.src.cap;h.capA={w:c.width,h:c.height,d:c.getContext('2d').getImageData(0,0,c.width,c.height).data};}catch(e){t13Err('captex',e);h.tex=null;}}}
// a card or building quad of the snow mesh keeps only the band from its top down to its lowest cap pixel (a tree's canopy top, a wall's top edge):
// the rest of the card is transparent in the cap texture and would only cost fill. Returns false when the quad holds no cap at all.
function t13TrimQuad(f,B,q,cap){const o=q*28,W=cap.w,H=cap.h,d=cap.d;let u0=1,u1=0,v0=1,v1=0;for(let k=0;k<4;k++){const u=f[o+k*7+3],v=f[o+k*7+4];if(u<0)return false;if(u<u0)u0=u;if(u>u1)u1=u;if(v<v0)v0=v;if(v>v1)v1=v;}
  const x0=Math.max(0,Math.floor(u0*W)),x1=Math.min(W,Math.ceil(u1*W)),y0=Math.max(0,Math.floor(v0*H)),y1=Math.min(H,Math.ceil(v1*H));if(x1<=x0||y1<=y0)return false;let last=-1;
  for(let y=y1-1;y>=y0&&last<0;y--){const r=y*W;for(let x=x0;x<x1;x++)if(d[(r+x)*4+3]>0){last=y;break;}}if(last<0)return false;
  const fr=Math.min(1,(last+1.5-y0)/(y1-y0));if(fr>=.98)return true;
  // the two vertices at v1 (the bottom edge) move up toward the top edge by the kept share
  for(let k=0;k<4;k++){const i=o+k*7;if(Math.abs(f[i+4]-v1)>1e-6)continue;let top=-1;for(let j=0;j<4;j++){const jj=o+j*7;if(Math.abs(f[jj+4]-v0)<1e-6&&Math.abs(f[jj+3]-f[i+3])<1e-6){top=jj;break;}}if(top<0)continue;
    f[i]=f[top]+(f[i]-f[top])*fr;f[i+1]=f[top+1]+(f[i+1]-f[top+1])*fr;f[i+2]=f[top+2]+(f[i+2]-f[top+2])*fr;f[i+4]=v0+(v1-v0)*fr;}return true;}
// the card and building quads trimmed to their cap bands, once per bake (the levels only change their alpha)
function t13HdTrim(){const h=T13.hd,cap=h.capA,out=[];for(const s of h.src.src){const src=new H2Batch(Math.max(32,s.n));new Uint8Array(src.buf).set(new Uint8Array(s.buf));src.n=s.n;const bt=new H2Batch(Math.max(32,s.n));
    for(let q=0;q<s.n;q++){if(cap&&!t13TrimQuad(src.f,src.b,q,cap))continue;bt.b.set(src.b.subarray(q*4*H2V_STRIDE,(q+1)*4*H2V_STRIDE),bt.n*4*H2V_STRIDE);bt.n++;}
    if(bt.n)out.push({i:s.i,n:bt.n,buf:bt.buf.slice(0,bt.n*4*H2V_STRIDE),nc:s.nc,nr:s.nr});}h.trim=out;h.capA=null;}
// the snow mesh at a level step: the card and building geometry again (textured by the cap texture, alpha = level), roof slopes and keep tops,
// ledges along the north edge of every cliff and wall top, and a dusting over open ground, as plain white quads
function t13HdSnowMesh(m,lv){const gl=HD.gl,S=HD.S,h=T13.hd,V=S.V,W=m.w,H=m.h,CS=HD2D.chunk*TS,C=new H2Chunks(W*TS,H*TS,CS),a=Math.round(lv*255),P=H2P;let nq=0;
  if(h.src&&h.tex){if(!h.trim)t13HdTrim();for(const s of h.trim){const bt=new H2Batch(Math.max(32,s.n));new Uint8Array(bt.buf).set(new Uint8Array(s.buf));bt.n=s.n;const B=bt.b;for(let q=0;q<s.n*4;q++)B[q*H2V_STRIDE+23]=a;
      const i=s.i;if(s.nc===C.nc&&s.nr===C.nr&&i<C.b.length){C.b[i]=bt;C.n+=s.n;nq+=s.n;}}}
  const flat=(xa,xb,za,zb,y,al,fl,bt)=>{P[0]=xa;P[1]=y;P[2]=za;P[3]=xb;P[4]=y;P[5]=za;P[6]=xb;P[7]=y;P[8]=zb;P[9]=xa;P[10]=y;P[11]=zb;(bt||C.at(xa+1,za+1)).quad(P,-1,0,-1,0,255,255,255,al,0,1,0,fl);nq++;};
  // roofs and keep tops
  const sin=Math.sin(HD2D.pitch*Math.PI/180),ra=Math.round(lv*T13.cfg.roofA*255);
  (m.bld||[]).forEach(b=>{let k='';try{k=hdBldKind(m,b);}catch(e){return;}const hh=b.h*TS,x0=b.x*TS,x1=x0+b.w*TS,zf=(b.y+b.h)*TS,zb=b.y*TS,zm=(zf+zb)/2,bt=C.at(x0+b.w*TS/2,zm);
    if(k==='card'||k==='gate'||k==='tower')return;
    if(k==='keep'){const Hk=Math.max(22,Math.round(hh+10-hh*sin)),yk=Hk*V+.3;flat(x0,x1,zb,zf,yk,ra,8,bt);return;}
    const roofH=Math.floor(hh*.5),wy=roofH-1,rt=-6,WH=hh-wy,rows=roofH-(rt-1),dh=hh/2+3,RH=Math.max(6,rows-dh*sin),yr=(WH+RH)*V+.4,ys=(WH-1)*V+.4,ze=zf+3,zbe=zb-3,rx0=x0-5,rx1=x1+5;
    const nf=Math.hypot(ze-zm,yr-ys),nb=Math.hypot(zm-zbe,yr-ys);
    P.set([rx0,yr,zm,rx1,yr,zm,rx1,ys,zbe,rx0,ys,zbe]);bt.quad(P,-1,0,-1,0,255,255,255,ra,0,(zm-zbe)/nb,-(yr-ys)/nb,8);
    P.set([rx0,yr,zm,rx1,yr,zm,rx1,ys,ze,rx0,ys,ze]);bt.quad(P,-1,0,-1,0,255,255,255,ra,0,(ze-zm)/nf,(yr-ys)/nf,8);nq+=2;});
  // ledges and the dusting
  const KD=S.KD,HT=S.HT,la=Math.round(lv*T13.cfg.capA*255),da=Math.round(lv*T13.cfg.dustA*255);
  for(let y=0;y<H;y++){let run=-1;for(let x=0;x<=W;x++){const k=x<W?KD[y*W+x]:9,c=x<W?tileAt(m,x,y):'#';
      if(x<W&&(k===2||k===3)){const up=y>0?KD[(y-1)*W+x]:0,hu=y>0?HT[(y-1)*W+x]:0;if(up!==k||hu<HT[y*W+x])flat(x*TS,(x+1)*TS,y*TS,y*TS+2.5,HT[y*W+x]+.3,la,8);}
      const open=x<W&&k===0&&!T13_WATER.includes(c)&&!T13_HARD.includes(c);if(open&&run<0)run=x;if(!open&&run>=0){flat(run*TS,x*TS,y*TS,(y+1)*TS,.5,da,0);run=-1;}}}
  h.mesh=C.build(gl);h.lv=lv;h.lvT=performance.now();T13.n.snowq=nq;T13.n.hdcap++;}
function t13HdSnow(m){const h=T13.hd,st=T13.cfg.steps,lv=Math.round(T13.snow*st)/st;if(lv===h.lv)return;
  if(lv<=0){if(h.mesh){try{h2ChunksFree(HD.gl,h.mesh);}catch(e){}h.mesh=null;}h.lv=0;return;}
  if(h.lv>0&&performance.now()-h.lvT<T13.cfg.gap)return;// a level step at most every 2 s: never a rebuild per frame
  try{if(h.mesh)h2ChunksFree(HD.gl,h.mesh);h.mesh=null;t13HdSnowMesh(m,lv);}catch(e){t13Err('snowmesh',e);h.mesh=null;h.lv=lv;}}
HOOK.after('hdActors','terrain13','living water, wet ground and the snow level (HD-2D)',function(r,m,now,ts){try{if(T13.off||!m||m.kind==='dungeon'||m.archive||!HD.S)return;t13HdAdopt(m);t13HdFrame(m,now,ts);t13HdSnow(m);}catch(e){t13Err('hd',e);}});
// the snow mesh drawn after the scene: blended, depth tested against what is there (the caps share their cards' depth), lit like the scene
HOOK.after('hdScene','terrain13','the snow caps over the cards, roofs, ledges and ground (HD-2D)',function(r,gl,S,o,now,still,full){try{const h=T13.hd;if(T13.off||!h.mesh||h.S!==S||T13.snow<=.005||!full)return;
  const P=HD.P,u=P.scene.u;gl.useProgram(P.scene.p);gl.uniform1i(u.uMode,2);gl.uniform4fv(u.uXr,HD.xr);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  gl.bindTexture(gl.TEXTURE_2D,h.tex||HD.atl.t);hdDrawChunks(gl,h.mesh);
  gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.DEPTH_TEST);gl.uniform4f(u.uXr,0,0,1,0);}catch(e){t13Err('hdscene',e);}});
// test hooks
try{window.__T13=T13;T13.api={tile:t13Tile,mat:t13Mat,noise:t13Noise,capOf:t13CapOf,capCanvas:t13CapCanvas,track:t13Track,hdSnow:t13HdSnowMesh,weights:t13Weights};}catch(e){}
