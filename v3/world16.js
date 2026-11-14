// ===== world16.js (v0.21.x): chests open at once, the explored map follows the account, the Breach Waystone in the centre, west exits and a post at every town gate, the names audit =====
// Owner's playtest notes after v0.21.0 (docs/world16.md), five of them:
//  1 "chest take a second to open, used to open immediately": openChest ends in rebuildBase(), which repaints the whole map twice (two water frames,
//    millions of fillRect since the terrain, light and cohesion passes: about 300 ms on a desktop, a second on a phone) before the find text shows,
//    and on Medium / High the HD-2D scene then re-cuts its cards as well. Section 1 repaints only the tiles around the chest when the chest is
//    the only tile that changed (the same painters, the same hooks, clipped), so the text is up in a few ms in both renderers.
//  2 "cant click to walk somewhere I've been before on PC if I went there on phone app": the seen map (G.explored) lives inside the journey save,
//    and journey saves sync whole: one device's copy replaces the other's, never merged. Whenever this device's copy wins without having been built
//    on the other's latest (Keep this one, a conflict decided by progress, an app killed before its leave save landed) what the other device had
//    explored is gone, and tap to walk refuses unseen tiles. Section 2 keeps a packed copy of the seen bits per journey in the account profile
//    (profile/<uid>.flags.seen, run lengths in base64, the three latest journeys), merged as a union on every profile sync and folded into the
//    journey on load, so explored ground follows the account whichever save wins.
//  3 "waystone in breach should be in the center": section 3 moves the Breach Waystone to the middle of the hub (the nearest free tile to the centre
//    of its ring of stones) when the map is built, so new and old journeys get it (the Breach is rebuilt from the seed).
//  4 "town exits rarely seem to be west ... some town exits and entrances didn't have the post next to them": the world plan never drew west for a
//    town's way out (0 of 200), and a town had one sign, at the east gate, standing inside the gate's lane. Section 4: journeys begun from now on
//    (G.dunRev 3) draw all four sides evenly on a plan that never crosses itself on the world map; every town gate gets a signpost on a free
//    tile beside its lane (never on it), in every journey. A town the builder left without a gate on a side (a dead end, found by the test) gets it.
//  5 "too many things with similar words in the name": W16.api.names() lists every display name by kind and W16.api.roots() counts word roots
//    (the renames themselves are in the data files; ids and save keys did not change).
// window.__W16 (counters `n`, `off`, `err`, `api`) is the test hook; tools/chrome/v190a.js.
const W16={off:false,n:{patch:0,full:0,fold:0,pull:0,stone:0,sign:0,signMove:0,signMiss:0,plan:0,gate:0,gateMiss:0},err:[],api:{},clip:null,pend:null,plan:null,last:{}};window.__W16=W16;
function w16Err(w,e){if(W16.err.length<20)W16.err.push(w+': '+(e&&e.message||e));}

// ---------- 1. a chest opens at once ----------
// While W16.clip is set only the tiles (and prop rows) inside it are painted; everything else in buildMapCanvas runs as always.
HOOK.before('drawTile','world16','only the tiles of a patch are painted',function(ctx,m,x,y){const c=W16.clip;if(c&&(x<c.x0||x>c.x1||y<c.y0||y>c.y1))return HOOK.stop(undefined);});
HOOK.before('drawObjects','world16','only the prop rows of a patch are painted',function(ctx,m,y){const c=W16.clip;if(c&&(y<c.y0||y>c.y1))return HOOK.stop(undefined);});
function w16Sig(m){let s='';for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)s+=tileAt(m,x,y);return s;}
// repaint the 3 x 4 tiles around (x,y) on both frames of the base canvas, painted with a margin so props that lean in from outside are whole
function w16Patch(p){const m=p.m,B=WS.base;if(!m||!B||!B[0]||!B[1]||B[0].width!==m.w*TS||B[0].height!==m.h*TS)return false;
  const sig=w16Sig(m);if(sig.length!==p.sig.length)return false;let n=0;
  for(let i=0;i<sig.length;i++)if(sig.charCodeAt(i)!==p.sig.charCodeAt(i)){if(i!==p.y*m.w+p.x)return false;n++;}
  if(!n)return false;
  const save={lights:m.lights,smoke:m.smoke,bsp:m.bsp,torches:m.torches&&m.torches.slice(),mills:m.mills&&m.mills.slice()},R=4;
  W16.clip={x0:p.x-R,x1:p.x+R,y0:p.y-R,y1:p.y+R+1};
  try{for(let fr=0;fr<2;fr++){const cv=buildMapCanvas(m,fr),bx=Math.max(0,(p.x-1)*TS),by=Math.max(0,(p.y-1)*TS),bw=3*TS,bh=4*TS,c=B[fr].getContext('2d');
      c.clearRect(bx,by,bw,bh);c.drawImage(cv,bx,by,bw,bh,bx,by,bw,bh);}}
  finally{W16.clip=null;m.lights=save.lights;m.smoke=save.smoke;m.bsp=save.bsp;if(save.torches)m.torches=save.torches;if(save.mills)m.mills=save.mills;}
  m.__t13capB=null;/* terrain13's snow caps are cut from the props of the map: cut again without the chest */scanLights(m);return true;}
// Medium / High: the HD-2D scene re-cuts its prop cards after a chest (about 100 ms). The find text is put up first; the repaint and the re-cut
// follow W16.hdWait ms later, while the opening chest (worldfx.js) still shows its closed frame over the baked one.
W16.hdWait=110;
HOOK.wrap('openChest','world16','a chest opens at once: only its own tiles are repainted',function(next,x,y){
  if(W16.off)return next(x,y);const m=WS.m;let sig=null,hd=false,d0=false;try{if(m&&m.t&&WS.base&&WS.base[0])sig=w16Sig(m);hd=typeof hdActive==='function'&&hdActive();d0=hd&&!!HD.dirty;}catch(e){w16Err('sig',e);}
  W16.pend=sig?{m,x,y,sig,hd}:null;W16.defer=null;let r;try{r=next(x,y);}finally{W16.pend=null;}
  const p=W16.defer;if(p){W16.defer=null;try{if(!d0)HD.dirty=false;}catch(e){}
    setTimeout(()=>{try{if(WS.m!==p.m)return;const t0=performance.now();if(w16Patch(p)){W16.n.patch++;W16.last.patchMs=performance.now()-t0;HD.dirty=true;}else rebuildBase();}catch(e){W16.clip=null;w16Err('late',e);try{rebuildBase();}catch(_){}}},W16.hdWait);}
  return r;});
HOOK.wrap('rebuildBase','world16','the repaint after a chest is a patch',function(next){const p=W16.pend;
  if(p&&!W16.off&&WS.m===p.m){W16.pend=null;if(p.hd){W16.defer=p;return;}
    const t0=performance.now();try{if(w16Patch(p)){W16.n.patch++;W16.last.patchMs=performance.now()-t0;return;}}catch(e){W16.clip=null;w16Err('patch',e);}}
  W16.n.full++;return next();});

// ---------- 2. the explored map follows the account ----------
// META.seen16 = {<journey key>:{t:<ms of the last local change>,m:{<map id>:'<bytes>:<packed>'}}}, mirrored in profile.flags.seen.
// packed: the bitset as run lengths (zeros first, alternating), each a varint, in base64. An explored map is a few blobs, so a field is
// about 0.2 to 0.4 kB against 0.8 kB raw; the three latest journeys are kept.
const W16_KEEP=3;
function w16Key(g){const r=g&&g.run;return r&&r.seed!=null&&!g.daily?'j'+r.seed+'c'+(r.cycle||0):null;}
function w16Pack(u8){const out=[],n=u8.length*8;let cur=0,run=0;const put=v=>{while(v>127){out.push(v&127|128);v=Math.floor(v/128);}out.push(v);};
  for(let i=0;i<n;i++){const b=(u8[i>>3]>>(i&7))&1;if(b===cur)run++;else{put(run);cur=b;run=1;}}
  if(cur===1)put(run);let s='';for(let i=0;i<out.length;i++)s+=String.fromCharCode(out[i]);return u8.length+':'+btoa(s);}
function w16Unpack(str){const k=String(str).indexOf(':'),len=+String(str).slice(0,k);if(!(k>0)||!(len>0)||len>65536)return null;
  let s;try{s=atob(String(str).slice(k+1));}catch(e){return null;}const a=new Uint8Array(len),n=len*8;let i=0,cur=0,p=0;
  while(p<s.length&&i<n){let v=0,mul=1,c;do{c=s.charCodeAt(p++);v+=(c&127)*mul;mul*=128;}while((c&128)&&p<s.length);
    if(cur){const e=Math.min(n,i+v);for(;i<e;i++)a[i>>3]|=1<<(i&7);}else i+=v;cur^=1;}
  return a;}
function w16Raw(b64){try{const b=atob(b64),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a;}catch(e){return null;}}
function w16B64(a){let b='';for(let i=0;i<a.length;i++)b+=String.fromCharCode(a[i]);return btoa(b);}
// union of two packed maps of the same size; null when the sizes differ (another layout: never mixed)
function w16Or(a,b){if(!a||!b||a.length!==b.length)return null;let ch=0;const o=new Uint8Array(a.length);for(let i=0;i<a.length;i++){o[i]=a[i]|b[i];if(o[i]!==a[i])ch=1;}return {o,ch};}
// two way union between a journey and the account copy. Returns {up: the account copy grew, down: the journey grew (ids)}
function w16Merge(g){const out={up:false,down:[]};const k=w16Key(g);if(!k||W16.off)return out;
  const S=META.seen16=META.seen16||{},have=S[k],E=g.explored=g.explored||{};
  const ids=new Set(Object.keys(E).concat(have?Object.keys(have.m||{}):[]));if(!ids.size)return out;
  const e=have||{t:0,m:{}};e.m=e.m||{};
  ids.forEach(id=>{try{const loc=E[id]?w16Raw(E[id]):null,acc=e.m[id]?w16Unpack(e.m[id]):null;
      if(loc&&!acc){e.m[id]=w16Pack(loc);out.up=true;return;}
      if(!loc&&acc){E[id]=w16B64(acc);out.down.push(id);return;}
      if(!loc||!acc)return;const A=w16Or(acc,loc);if(!A)return;                    // sizes differ: each side keeps its own
      if(A.ch){e.m[id]=w16Pack(A.o);out.up=true;}
      const L=w16Or(loc,acc);if(L&&L.ch){E[id]=w16B64(L.o);out.down.push(id);}}catch(x){w16Err('merge',x);}});
  if(out.up||!have){e.t=out.up?Date.now():e.t||0;S[k]=e;}
  if(out.up){W16.n.fold++;w16Prune(k);}if(out.down.length)W16.n.pull++;return out;}
function w16Prune(k0){const S=META.seen16;if(!S)return;const cur=w16Key(typeof G!=='undefined'?G:null),rank=k=>k===cur?0:k===k0?1:2,ks=Object.keys(S).sort((a,b)=>rank(a)-rank(b)||(S[b].t||0)-(S[a].t||0));ks.slice(W16_KEEP).forEach(k=>{delete S[k];});}
// the journey that is open: fold it, and show what came down (the seen cache, the area map, the minimap)
function w16Live(){try{if(typeof G==='undefined'||!G||G.daily)return {up:false,down:[]};const r=w16Merge(G);
    if(r.down.length){r.down.forEach(id=>{delete SEEN[id];});MAPCV.dirty=1;try{if(V.screen==='world')drawMini();}catch(e){}}
    if(r.up||r.down.length){w16Prune();saveMeta();}return r;}catch(e){w16Err('live',e);return {up:false,down:[]};}}
function w16Push(now){try{const r=w16Live();if(r.up&&typeof profileDirty==='function'){if(now&&typeof profileSync==='function')profileSync();else profileDirty();}return r;}catch(e){w16Err('push',e);return null;}}
HOOK.after('unpackG','world16','what the account has seen of this journey joins the loaded save',function(g){try{if(g&&!g.daily){const r=w16Merge(g);if(r.up||r.down.length){w16Prune();saveMeta();}}}catch(e){w16Err('load',e);}});
HOOK.xform('profileOf','world16','the explored maps of the latest journeys go to the profile (packed)',function(p,meta){try{if(!W16.off&&p&&p.flags&&meta&&meta.seen16&&Object.keys(meta.seen16).length)p.flags.seen=JSON.parse(JSON.stringify(meta.seen16));}catch(e){w16Err('profileOf',e);}return p;});
HOOK.before('applyRemote','world16','explored maps from the profile: a union per journey and map',function(rm){try{if(W16.off)return;const R=rm&&rm.flags&&rm.flags.seen;if(!R||typeof R!=='object')return;
  const S=META.seen16=META.seen16||{};
  Object.keys(R).forEach(k=>{const r=R[k];if(!r||typeof r!=='object'||!r.m)return;const e=S[k]=S[k]||{t:0,m:{}};e.t=Math.max(e.t||0,+r.t||0);
    Object.keys(r.m).forEach(id=>{const a=e.m[id]?w16Unpack(e.m[id]):null,b=w16Unpack(r.m[id]);if(!b)return;if(!a){e.m[id]=r.m[id];return;}const U=w16Or(a,b);if(U&&U.ch)e.m[id]=w16Pack(U.o);});});
  w16Prune();w16Live();}catch(e){w16Err('applyRemote',e);}});
// when the account copy is refreshed: on arriving on another map, every 45 s of play, and on leaving the page (with the save's own leave push)
HOOK.after('placeAt','world16','the explored map goes to the account when the map changes',function(r,mid){try{if(W16.last.map!==mid){W16.last.map=mid;setTimeout(()=>w16Push(false),0);}}catch(e){}});
setInterval(()=>{try{if(typeof G!=='undefined'&&G&&!G.daily&&V.screen==='world'&&document.visibilityState==='visible')w16Push(false);}catch(e){}},45000);
document.addEventListener('visibilitychange',()=>{try{if(document.visibilityState==='hidden'&&typeof G!=='undefined'&&G&&V.screen!=='title')w16Push(true);}catch(e){}});
W16.api.pack=w16Pack;W16.api.unpack=w16Unpack;W16.api.key=w16Key;W16.api.fold=w16Push;W16.api.merge=w16Merge;

// ---------- 3. the Breach Waystone stands in the centre ----------
function w16Flood(m,sx,sy){const g=m.t,H=g.length,W=g[0].length,R=g.map(r=>r.map(()=>false)),ex=new Set((m.exits||[]).map(e=>e.x+','+e.y)),st=[[sx,sy]];
  while(st.length){const [x,y]=st.pop();if(x<0||y<0||x>=W||y>=H||R[y][x])continue;const c=g[y][x];if(SOLID.includes(c)&&!ex.has(x+','+y))continue;R[y][x]=true;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}return R;}
const w16Count=R=>{let n=0;R.forEach(r=>r.forEach(v=>{if(v)n++;}));return n;};
function w16BreachStone(m){if(!m||!m.breach||!m.t||m.__w16ws)return null;m.__w16ws=1;const g=m.t,H=g.length,W=g[0].length;let ws=null;
  for(let y=0;y<H&&!ws;y++)for(let x=0;x<W;x++)if(g[y][x]==='W'){ws=[x,y];break;}if(!ws)return null;
  // the centre: the middle of the ring of standing stones round the hub when it can be told, else the middle of the map
  let cx=(W-1)/2,cy=(H-1)/2;{let sx=0,sy=0,n=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]==='N'&&Math.abs(x-cx)<=7.5&&Math.abs(y-cy)<=7.5){sx+=x;sy+=y;n++;}if(n>=6){cx=sx/n;cy=sy/n;}}
  const a=m.gates&&m.gates.start&&m.gates.start.arrive;if(!a)return null;
  const busy=new Set();(m.nodes||[]).concat(m.npcs||[]).forEach(q=>busy.add(q.x+','+q.y));(m.exits||[]).forEach(e=>busy.add(e.x+','+e.y));Object.keys(m.signs||{}).forEach(k=>busy.add(k));
  const cand=[];for(let y=Math.max(1,Math.floor(cy-6));y<=Math.min(H-2,Math.ceil(cy+6));y++)for(let x=Math.max(1,Math.floor(cx-6));x<=Math.min(W-2,Math.ceil(cx+6));x++){
    const c=g[y][x];if(!(c==='.'||c===','||(x===ws[0]&&y===ws[1])))continue;if(busy.has(x+','+y))continue;cand.push([x,y,(x-cx)*(x-cx)+(y-cy)*(y-cy)]);}
  cand.sort((p,q)=>p[2]-q[2]||p[1]-q[1]||p[0]-q[0]);
  const fl=typeof pgFloorOf==='function'?pgFloorOf(m,ws[0],ws[1]):'.';g[ws[1]][ws[0]]=fl;const base=w16Count(w16Flood(m,a[0],a[1]));let at=null;
  for(const [x,y] of cand){const was=g[y][x];g[y][x]='W';const R=w16Flood(m,a[0],a[1]);
    // free and reachable: every tile that could be walked still can (but the stone's own), and a walked tile touches the stone
    if(w16Count(R)===base-1&&[[1,0],[-1,0],[0,1],[0,-1]].some(([i,j])=>R[y+j]&&R[y+j][x+i])){at=[x,y];break;}g[y][x]=was;}
  if(!at){g[ws[1]][ws[0]]='W';return null;}
  if(at[0]!==ws[0]||at[1]!==ws[1]){W16.n.stone++;m.tl=null;delete m.__w14r;if(m.free)m.free=m.free.filter(p=>!(p[0]===at[0]&&p[1]===at[1]));}
  m.waystone=at;return at;}

// ---------- 4a. west is in the mix (journeys begun from now on) ----------
// Revision 3 of the world plan (G.dunRev 3, set by newGame): a town's way out and a field's far gate are drawn from all four sides (never back
// through the gate just used), a field keeps going straight 40% of the time, and a plan whose towns and fields would land on the same square
// of the world map is drawn again. The first town may leave by the west gate (the road that was closed). Older journeys keep their plan.
const W16_SIDES=['e','n','s','w'];
function w16Plan(seed){let st=null,R=null;
  for(let att=0;att<400;att++){R=mulberry((seed*7+90001+att*977)>>>0);const pk=a=>a[Math.floor(R()*a.length)];st=[];let prev=null,pos=[0,0],ok=true;const used=new Set(['0,0']);
    for(let s=0;s<5;s++){const tn=pk(W16_SIDES.filter(d=>d!==prev)),fs=SIDE_OPP[tn],fe=s>=4||R()<.4?tn:pk(W16_SIDES.filter(d=>d!==fs));
      const ops=[];for(let f=0;f<2;f++)for(let r=0;r<4;r++)['e','n','s'].forEach(c=>{const op={f,r};if(opSide(op,'w')===fs&&opSide(op,c)===fe)ops.push({op,c});});
      const o=pk(ops);st.push({tn,tp:prev||'w',fs,fe,op:o.op,c:o.c});
      const f=[pos[0]+SIDE_V[tn][0],pos[1]+SIDE_V[tn][1]];if(used.has(f.join()))ok=false;used.add(f.join());
      if(s<4){const t=[f[0]+SIDE_V[fe][0],f[1]+SIDE_V[fe][1]];if(used.has(t.join()))ok=false;used.add(t.join());pos=t;}
      prev=SIDE_OPP[fe];}
    if(ok)break;}
  const idx=[0,1,2,3,4].sort(()=>R()-.5),n=3+(R()<.5?1:0)+(R()<.25?1:0),kinds=['gear','item','recruit','charm'].sort(()=>R()-.5);
  idx.slice(0,n).forEach((s,i)=>{st[s].cave=kinds[i%4];});return st;}
HOOK.wrap('worldPlan','world16','revision 3: all four sides, a plan that never crosses itself',function(next){
  if(!G||!G.run||!(G.dunRev>=3)||W16.off)return next();const key=G.run.seed+':3';if(W16.plan&&W16.plan.key===key)return W16.plan.v;
  W16.n.plan++;W16.plan={key,v:w16Plan(G.run.seed)};return W16.plan.v;});
// Under the test harness (window.__PWTEST, tools/chrome/pw.js) a new journey stays on revision 2 unless the test asks for 3 (window.__W16REV3): the
// older tests stand on tiles of journeys they know by seed, and those journeys are laid out by revision 2. v190a.js runs revision 3.
HOOK.after('newGame','world16','new journeys draw their gates from all four sides',function(){try{if(G&&!G.daily&&!W16.off&&!W16.rev2&&!(window.__PWTEST&&!window.__W16REV3))G.dunRev=3;}catch(e){}});
W16.api.plan=w16Plan;

// ---------- 4b. no town without its gate ----------
// townGates3 (world4.js) carves a north or south gate while the town is still being built; where houses stand along that whole edge and the ground
// behind them is not joined up yet it finds no place, and the town was left with no way on (Reedwade as the second town with a north gate: 15 of
// 1500 towns on the untouched build, old journeys too). Once the town is finished the gate is carved here: three tiles wide straight in from the
// edge, water bridged, never through a house, the Waystone, the board, a sign or the landmark, until it meets ground the roads reach.
function w16Carve(m,side){const g=m.t,H=g.length,W=g[0].length,vert=side==='n'||side==='s',NO='HWqOSGj',ent=mapEntry(m);if(!ent)return null;
  const reach=w16Flood(m,ent[0],ent[1]),span=vert?W:H,lim=vert?H:W,cols=[];for(let a=5;a<span-5;a++)cols.push(a);cols.sort((p,q)=>Math.abs(p-span/2)-Math.abs(q-span/2));
  let best=null;
  for(const strict of [true,false]){for(const a of cols){const cells=[];let ok=true,hit=-1;
      for(let d=0;d<lim-4&&ok;d++){const row=[];for(let k=-1;k<=1;k++){const x=vert?a+k:(side==='w'?d:W-1-d),y=vert?(side==='n'?d:H-1-d):a+k,c=g[y][x];
          if(NO.includes(c)||(m.bld||[]).some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h+1)){ok=false;break;}row.push([x,y]);}
        if(!ok)break;cells.push(row);const open=([x,y])=>reach[y][x]&&!SOLID.includes(g[y][x]);
        if(d>=1&&(strict?row.every(open):open(row[1]))){hit=d;break;}}
      if(ok&&hit>=0&&(!best||hit<best.hit))best={cells,hit};}
    if(best)break;}
  if(!best)return null;const cells=best.cells;
  cells.forEach((row,d)=>row.forEach(([x,y],k)=>{const c=g[y][x];if(d<best.hit||SOLID.includes(c))g[y][x]=c==='~'?'B':(k===1?'=':'.');}));
  const e0=cells[0].map(([x,y])=>[x,y]),mid=e0[1],fx=vert?[[mid[0]-2,mid[1]],[mid[0]+2,mid[1]]]:[[mid[0],mid[1]-2],[mid[0],mid[1]+2]];
  fx.forEach(([x,y])=>{if(g[y]&&g[y][x]&&(g[y][x]==='Z'||g[y][x]==='#'))g[y][x]='Y';});
  const inn=cells[Math.min(2,cells.length-1)][1];
  return {side,x:mid[0],y:mid[1],cells:e0,arrive:[inn[0],inn[1],SIDE_FACE[side]],label:gateLabel(side,mid[0],mid[1],W,H)};}
function w16FixGates(m){const log=[];if(!m||m.kind!=='town'||!m.t||!m.gates||m.__w16fg)return log;m.__w16fg=1;const s=m.s,P=worldPlan(),want={prev:s>0?SIDE_OPP[P[s-1].fe]:null,next:P[s].tn};
  ['prev','next'].forEach(name=>{const side=want[name];if(!side)return;const to={m:name==='prev'?'f'+(s-1):'f'+s,g:name==='prev'?'end':'start'};
    if(m.gates[name]&&(m.exits||[]).some(e=>e.to&&e.to.m===to.m))return;
    const snap=m.t.map(r=>r.slice());let rec=null;try{rec=w16Carve(m,side);}catch(e){w16Err('carve',e);}
    if(!rec){m.t=snap;W16.n.gateMiss++;log.push({name,side,miss:1});return;}
    rec.cells.forEach(([x,y])=>m.exits.push({x,y,to}));m.gates[name]=rec;m.npcs=(m.npcs||[]).filter(n=>Math.abs(n.x-rec.arrive[0])+Math.abs(n.y-rec.arrive[1])>3);
    try{if(typeof wa12ExitLand==='function')wa12ExitLand(m);}catch(e){}
    try{if(mapIssues(m).length&&typeof healMap==='function')healMap(m);}catch(e){w16Err('heal',e);}
    W16.n.gate++;log.push({name,side,x:rec.x,y:rec.y});m.tl=null;delete m.__w14r;});
  if(log.length)m.w16gates=log;return log;}
W16.api.carve=w16Carve;W16.api.fixGates=w16FixGates;
// ---------- 4b. a signpost beside every town gate ----------
// A gate's lane is its three exit tiles and the three tiles behind each. The post stands on open ground touching the lane from the side,
// never on it; where a wall, water or a house leaves no ground there, on the nearest open ground along the way in. It never closes a
// passage (the walkable ground stays one piece), never hides behind a wall in HD-2D, never stands on a doorstep or where a townsperson stands.
const W16_GROUND='.:,';
function w16Gate(m,name){const s=m.s,g=m.gates&&m.gates[name];if(!g||!g.side)return null;const to=name==='prev'?'f'+(s-1):'f'+s;
  const cells=(m.exits||[]).filter(e=>e.to&&e.to.m===to).map(e=>[e.x,e.y]);if(!cells.length)return null;const v=SIDE_V[g.side],inx=-v[0],iny=-v[1];
  // the lane ends where the way in meets a wall or a house (a short carved gate)
  const lane=new Set(),rows=[];for(let d=0;d<4;d++){const row=cells.map(([x,y])=>[x+inx*d,y+iny*d]);if(d&&row.every(([x,y])=>{const c=(m.t[y]||[])[x];return c==null||(SOLID.includes(c)&&c!=='S');}))break;rows.push(row);row.forEach(p=>lane.add(p.join()));}
  return {name,g,side:g.side,to,cells,lane,rows,inx,iny};}
function w16GateSign(m,L){const out=[];for(const k of Object.keys(m.signs||{})){const [x,y]=k.split(',').map(Number);if((m.t[y]||[])[x]!=='S')continue;
    let near=false;for(const p of L.lane){const [a,b]=p.split(',').map(Number);if(Math.max(Math.abs(a-x),Math.abs(b-y))<=1){near=true;break;}}
    if(near)out.push({x,y,on:L.lane.has(x+','+y)});}return out;}
function w16SignWhy(m,P,x,y,L,loose){const g=m.t,H=g.length,W=g[0].length;if(x<1||y<1||x>W-2||y>H-2)return 'edge';const c=g[y][x];
  if(L.lane.has(x+','+y)||(m.exits||[]).some(e=>e.x===x&&e.y===y))return 'lane';
  if(!(W16_GROUND.includes(c)||(loose===1&&W16_LOOSE.includes(c))||(loose===2&&c==='='&&!pgRoadLine(m,x,y))))return 'tile '+c;
  if((m.bld||[]).some(b=>(x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)||(b.door&&Math.abs(x-b.door[0])<=1&&y>=b.door[1]&&y<=b.door[1]+2)))return 'building';
  if((m.npcs||[]).some(n=>(n.x===x&&n.y===y)||(n.hx===x&&n.hy===y)))return 'npc';
  if(Object.values(m.gates||{}).some(q=>q&&q.arrive&&q.arrive[0]===x&&q.arrive[1]===y))return 'arrive';
  if(typeof pgHides==='function'&&pgHides(m,x,y,'S'))return 'hidden';
  if(!SOLID.includes(c)&&P&&pgCuts(P,x,y))return 'cuts';
  // it must be readable: open ground on a side that the way in reaches, and land under it (not a post alone in the water)
  const n4=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>(g[y+b]||[])[x+a]);if(!n4.some(q=>q&&!SOLID.includes(q)))return 'closed in';if(n4.every(q=>q==='~'||q==='B'||q==null))return 'water';
  return '';}
const W16_LOOSE='tTbxhR';// a bush, tree, barrel, crate, hay bale or rock beside the lane gives its tile to the post (solid for solid: nothing closes); after those, paving at the edge of a wide road
function w16TownSigns(m){const log=[];if(!m||m.kind!=='town'||!m.t||!m.gates||m.__w16sg)return log;m.__w16sg=1;
  const s=m.s,Z=ZS(s),cap=x=>x[0].toUpperCase()+x.slice(1),ent=mapEntry(m);if(!ent)return log;
  const text=L=>`${Z.town}. ${cap(SIDE_NAME[L.side])}: ${L.name==='prev'?ZS(s-1).n:Z.n}.`;
  ['next','prev'].forEach(name=>{try{const L=w16Gate(m,name);if(!L)return;const have=w16GateSign(m,L),good=have.find(q=>!q.on);
      if(good&&!have.some(q=>q.on)){log.push({name,x:good.x,y:good.y,kept:1});return;}
      // posts standing on the lane step aside (they keep their words); one beside it already is the gate's post
      let words=null;const moved=[];have.filter(q=>q.on).forEach(q=>{const k=q.x+','+q.y;words=words||m.signs[k];moved.push([q.x,q.y,m.signs[k]]);delete m.signs[k];
        const row=L.rows.find(r=>r.some(p=>p[0]===q.x&&p[1]===q.y))||[],fl=row.map(p=>(m.t[p[1]]||[])[p[0]]).find(c=>c&&'=B:.'.includes(c))||'=';m.t[q.y][q.x]=fl;});
      if(good){if(moved.length)W16.n.signMove++;log.push({name,x:good.x,y:good.y,kept:1});return;}
      const P=typeof pgGrid==='function'?pgGrid(m):null,base=mapIssues(m).length,reach0=w16Count(w16Flood(m,ent[0],ent[1])),pa0=typeof pathAssets==='function'?pathAssets(m,P).length:0;
      // candidates: the tiles touching the lane from the side, nearest the gate first (near); then outward along the way in (far)
      const near=[],far=[],seen=new Set(),add=(A,x,y)=>{const q=x+','+y;if(seen.has(q))return;seen.add(q);A.push([x,y]);};
      const px=L.inx?0:1,py=L.inx?1:0,key=q=>q[0]*px+q[1]*py;
      for(let d=1;d<L.rows.length;d++){const row=L.rows[d],lo=row.reduce((p,q)=>(key(q)<key(p)?q:p)),hi=row.reduce((p,q)=>(key(q)>key(p)?q:p));add(near,hi[0]+px,hi[1]+py);add(near,lo[0]-px,lo[1]-py);}
      {const q=[],vis=new Set();[L.g.arrive&&[L.g.arrive[0],L.g.arrive[1]]].concat(...L.rows.slice(1)).forEach(p=>{if(!p)return;const c=(m.t[p[1]]||[])[p[0]];if(c==null||SOLID.includes(c)||vis.has(p.join()))return;vis.add(p.join());q.push([p[0],p[1],0]);});
        for(let i=0;i<q.length&&i<1500;i++){const [x,y,d]=q[i];if(d>40)break;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b,k=nx+','+ny;if(vis.has(k))continue;vis.add(k);const c=(m.t[ny]||[])[nx];if(c==null)continue;
            add(far,nx,ny);if(!SOLID.includes(c))q.push([nx,ny,d+1]);}}}
      let at=null,why={};
      for(const [list,loose,isFar] of [[near,0,0],[near,1,0],[near,2,0],[far,0,1],[far,1,1],[far,2,1]]){for(const [x,y] of list){const w=w16SignWhy(m,P,x,y,L,loose);if(w){if(!isFar)why[x+','+y]=w;continue;}const was=m.t[y][x];m.t[y][x]='S';
          const okR=SOLID.includes(was)||w16Count(w16Flood(m,ent[0],ent[1]))===reach0-1;
          // a post narrows the ground beside it: nothing that stands there (a crate, a banner, a townsperson's spot) may end up on a path because of it
          if(okR&&mapIssues(m).length<=base&&(typeof pathAssets!=='function'||pathAssets(m).length<=pa0)){at=[x,y,isFar];break;}m.t[y][x]=was;if(!isFar)why[x+','+y]=okR?'narrows a path':'reach';}if(at)break;}
      if(!at){moved.forEach(([x,y,w])=>{m.t[y][x]='S';if(w)m.signs[x+','+y]=w;});W16.n.signMiss++;log.push({name,miss:1,why});return;}
      if(moved.length)W16.n.signMove++;
      m.signs[at[0]+','+at[1]]=words||text(L);W16.n.sign++;const o={name,x:at[0],y:at[1]};if(at[2]){o.far=1;o.why=why;}log.push(o);}catch(e){w16Err('sign',e);}});
  // the guards say where the road really goes
  try{const nx=m.gates.next;if(nx&&nx.side!=='e')(m.npcs||[]).forEach(n=>{if(n.name==='Gate guard'&&typeof n.line==='string')n.line=n.line.replace(' lies east.',` lies ${SIDE_NAME[nx.side]}.`);});}catch(e){}
  if(log.some(q=>!q.kept)){m.tl=null;delete m.__w14r;}m.w16signs=log;return log;}
// the checks the test repeats on every town: one entry per gate {name,side,x,y,ok,why}
function w16SignAudit(m){const out=[];if(!m||m.kind!=='town'||!m.gates)return out;const ent=mapEntry(m),R=ent?w16Flood(m,ent[0],ent[1]):null;
  ['prev','next'].forEach(name=>{const L=w16Gate(m,name);if(!L)return;const have=w16GateSign(m,L),o={name,side:L.side,ok:true,why:''};
    const bad=w=>{o.ok=false;o.why+=(o.why?', ':'')+w;};
    let S=have.filter(q=>!q.on);
    if(!S.length){// a post put farther along the way in (no ground beside the lane)
      const far=(m.w16signs||[]).find(q=>q.name===name&&q.x!=null);if(far&&(m.t[far.y]||[])[far.x]==='S'&&m.signs[far.x+','+far.y]){S=[{x:far.x,y:far.y,far:1}];}}
    if(have.some(q=>q.on))bad('a post stands on the lane');
    if(!S.length){bad('no post');out.push(o);return;}
    const q=S[0];o.x=q.x;o.y=q.y;o.far=!!q.far;
    if(!m.signs[q.x+','+q.y])bad('no words');
    if(!R||![[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>R[q.y+b]&&R[q.y+b][q.x+a]))bad('cannot be reached');
    const n4=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>(m.t[q.y+b]||[])[q.x+a]);if(n4.every(c=>c==='~'||c==='B'||c==null))bad('floating');
    if((m.bld||[]).some(b=>q.x>=b.x&&q.x<b.x+b.w&&q.y>=b.y&&q.y<b.y+b.h))bad('inside a building');
    if(typeof pgHides==='function'&&pgHides(m,q.x,q.y,'S'))bad('hidden by a wall');
    if((m.exits||[]).some(e=>e.x===q.x&&e.y===q.y))bad('on an exit');
    out.push(o);});return out;}
W16.api.signs=w16TownSigns;W16.api.signAudit=w16SignAudit;W16.api.gate=w16Gate;
// registered in a microtask: worldgen (townexit), world12, worldart12 and world14 add their getMap passes that way, and this one must see the finished town
queueMicrotask(()=>{try{HOOK.wrap('getMap','world16','the Breach Waystone in the centre; a post beside every town gate',function(next,...a){const m=next(...a);
  try{if(m&&!W16.off){if(m.breach&&!m.__w16ws&&a[0]==='x0')w16BreachStone(m);else if(m.kind==='town'&&!m.__w16sg&&typeof worldV3==='function'&&worldV3()){if(W16.gates!==false)w16FixGates(m);if(W16.signs!==false)w16TownSigns(m);}}}catch(e){w16Err('getMap',e);}return m;});}catch(e){w16Err('hook',e);}});
// a save made standing where the stone or a post now is: step to the nearest open tile instead of being sent to the inn
HOOK.wrap('placeAt','world16','never placed inside the moved Waystone or a new post',function(next,mid,x,y,f){try{if(!W16.off&&(mid==='x0'||/^t\d$/.test(String(mid)))){const m=getMap(mid),c=(m.t[y]||[])[x];
    if((c==='W'&&m.breach)||(c==='S'&&m.w16signs&&m.w16signs.some(q=>q.x===x&&q.y===y&&!q.kept))){for(const [i,j] of [[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const q=(m.t[y+j]||[])[x+i];if(q&&!SOLID.includes(q)){x+=i;y+=j;break;}}}}}catch(e){w16Err('placeAt',e);}
  return next(mid,x,y,f);});

// ---------- 5. names ----------
// The renames of this pass (display names only: ids, save keys and realm keys did not change). kind, old, new. Bestiary records are kept under
// the monster's name (META.best), so the old names of foes, guardians and rivals move to the new ones (BEST_RENAME, account.js).
const W16_RENAMED=[["place","Cinderhollow Deeps","Kilnscar Depths"],["place","Hollowmere","Larkspur"],["place","Reedhollow","Reedwade"],["place","Hollow Star Sanctum","Eventide Sanctum"],["place","The Hollow Observatory","The Blind Observatory"],["place","Mossback Hollow","Mossback Burrow"],["place","Starfall Hollow","Cometfall Crater"],["place","Frostmere Ice Halls","Kestrel Ice Halls"],["place","Frostgate","Whitehearth"],["place","Frostcrag","Hoarcrag"],["place","Cinderseam Cave","Coalseam Pit"],["place","Storm Spire","Thunderhead Keep"],["place","The Bellfry Spire","The High Bellfry"],["place","Duskspire","Duskhaven"],["place","Dunecrown","Dunemark"],["place","The Sunken Crown","The Sunken Court"],["place","The Glowroot Heart","The Fungal Heart"],["place","The Ironroot Foundry","The Great Foundry"],["place","The Deep Smelter","The Black Smelter"],["place","Emberdeep Forge","Underforge"],["place","Emberwall","Forgewall"],["place","Cidermere","Ciderbrook"],["place","Rimefang Grotto","Icefang Cleft"],["place","The Drowned Mill","The Flooded Mill"],["place","Briarwatch","Briarkeep"],["place","Brinewick","Kelpwharf"],["place","Saltwick","Glarepan"],["place","Saltwhisper Cave","Saltwhisper Cove"],["place","Saltmarch","Seamarch"],["place","The Glass Cathedral","The Mirror Cathedral"],["place","The Rookery Barrow","The Corvid Cairn"],["place","Ashgate","Kilngate"],["mon","The Hollow Abbot","The Silent Abbot"],["mon","Frostmother","Snowmother"],["mon","Cinderwing Elder","Sootwing Elder"],["mon","Sunscorch Ooze","Scorchsand Ooze"],["mon","Stormcrown Matriarch","Old Thunderwing"],["mon","Rootmother","Tanglemother"],["mon","The Brine Hag","The Kelp Hag"],["mon","The Glass Widow","The Mirror Widow"],["mon","Candleking Moth","Emperor Candlemoth"],["mon","Old Shellking","Old Shellgrim"],["mon","Skullbell Sentinel","Tollskull Sentinel"],["mon","Lanternmaw","Glowmaw"],["mon","Hollow Herald","Void Herald"],["mon","Nightfrost Harpy","Nightsnow Harpy"],["mon","Cinderwing Gull","Sootwing Skua"],["mon","Cinder Shade","Soot Shade"],["mon","Eclipse Cinder","Eclipse Mote"],["mon","Nightstorm Hawk","Nightbolt Hawk"],["mon","Stormtide Crawler","Surge Crawler"],["mon","Ember Bat","Kiln Bat"],["mon","Brine Jelly","Tide Jelly"],["mon","Brine Spitter","Salt Spitter"],["mon","Glass Wisp","Mirror Wisp"],["mon","Starless Wraith","Lightless Wraith"],["mon","Moor Gull","Moor Tern"],["mon","Ash Spawn","Soot Spawn"],["mon","Ashen Husk","Charred Husk"],["mon","Duskwing Imp","Gloamwing Imp"],["mon","Siren's Wisp","Siren's Lure"],["rival","Ashtongue","Sourtongue"],["rival","Hollowfang","Grimhowl"],["rival","Brinescar","Reefscar"],["rival","Ironjaw","Anviljaw"],["rival","Wraithwing","Palltalon"],["rival","Emberback","Scorchback"],["rival","Stormtusk","Squalltusk"],["rival","Glassfang","Shardfang"],["rival","Rotroot","Rotbark"],["rival","Sunscald","Noonscald"],["rival","Saltgrave","Marlgrave"],["rival","Bonechime","Knellchime"],["rival","Frostgnaw","Chillgnaw"],["rival","Cinderhook","Charhook"],["rival","Gloomspur","Murkspur"],["rival","Rimeback","Sleetback"],["skill","Hollow Drum","Earthen Drum"],["skill","Hollow Slam","Husk Slam"],["skill","Hollow Hand","Snuffing Hand"],["skill","Ember Hymn","Kindling Hymn"],["skill","Ember Bite","Scorch Bite"],["skill","Ash Gale","Soot Gale"],["skill","Cinder Wail","Smoulder Wail"],["skill","Cinder Dive","Scorch Dive"],["skill","Cinder Bloom","Flare Bloom"],["skill","Cinderstorm","Sparkstorm"],["skill","Cinder and X (two element arts)","Blaze and X"],["item","Hollow Star Rod","Lodestar Rod"],["item","Hollow Star Codex","Lodestar Codex"],["item","Hollow Star Lute","Lodestar Lute"],["item","Hollow Star Harp","Lodestar Harp"],["item","Hollow Star Flute","Lodestar Flute"],["item","Hollow Star Lyre","Lodestar Lyre"],["item","Hollowcleave","Voidcleave"],["item","Bone Flute","Antler Flute"],["item","Bone Wand","Horn Wand"],["item","Ash Longbow","Elm Longbow"],["item","Ash Wand","Hazel Wand"],["item","Ash Quarterstaff","Elm Quarterstaff"],["item","Ashwood Log","Elmwood Log"],["item","Ember Ore","Kiln Ore"],["item","Starfall Charm","Cometfall Charm"],["item","Cinderseam Charm","Coalseam Charm"],["item","Rimefang Charm","Icefang Charm"]];
try{W16_RENAMED.forEach(([k,a,b])=>{if(k!=='mon')return;BEST_RENAME[a]=b;BEST_RENAME['Echo '+a]=echoName(b);BEST_RENAME[echoName(a)]=echoName(b);});
  // rivals: the same hero keeps the same epithet, so the old full name is the new one with the old first word
  const rv={};W16_RENAMED.forEach(([k,a,b])=>{if(k==='rival')rv[b]=a;});Object.keys(MON).forEach(k=>{if(k.slice(0,3)!=='rv_')return;const n=MON[k].n,i=n.indexOf(' '),o=rv[n.slice(0,i)];if(i>0&&o)BEST_RENAME[o+n.slice(i)]=n;});}catch(e){w16Err('rename',e);}
W16.api.RENAMED=W16_RENAMED;
// every display name by kind, and the word roots they share
function w16Names(){const o={realm:[],town:[],dungeon:[],boss:[],foe:[],wayfarer:[],skill:[],item:[],guild:[],quest:[]},add=(k,n)=>{if(typeof n==='string'&&n&&!o[k].includes(n))o[k].push(n);};
  try{ZONES.forEach(z=>{add('realm',z.n);add('town',z.town);add('dungeon',z.dungeon);});}catch(e){}
  try{CAVE_NAMES.forEach(n=>add('dungeon',n));FORT_NAMES.forEach(n=>add('dungeon',n));add('dungeon',BREACH.n);}catch(e){}
  try{Object.values(GUARDIANS).concat(Object.values(FINALS)).forEach(b=>add('boss',b.n));add('boss',RIFTKEEPER.n);MINIS.forEach(D=>add('boss',D[2]));add('boss',DUSK_RIDER.n);}catch(e){}
  // foes: a Den or Sanctum guardian is a boss (listed once); a rival is its name without the epithet (Gravemaw the Unforgotten)
  try{Object.values(MON).forEach(q=>{if(typeof q.n!=='string'||o.boss.includes(q.n))return;add('foe',q.n.replace(/ (the|of the) .*$/,''));});}catch(e){}
  try{Object.values(TPL).forEach(t=>{if(!t.mon&&t.src!=='tame')add('wayfarer',t.n);});}catch(e){}
  try{Object.values(TPL).forEach(t=>{if(t.mon||t.src==='tame')return;try{classSkills(t).forEach(s=>add('skill',s.n));}catch(e){}});
    Object.values(COMBO).forEach(s=>add('skill',s.n));Object.values(LIMIT).concat(Object.values(LIMIT2)).forEach(s=>add('skill',s.n));BONDS.forEach(b=>add('skill',b.tech&&b.tech.n));
    Object.values(SIG_NAMES).forEach(s=>add('skill',s[0]));Object.values(SPELL).forEach(a=>a.forEach(n=>add('skill',n)));
    Object.values(MON).concat(Object.values(GUARDIANS),Object.values(FINALS),[RIFTKEEPER]).forEach(q=>(q.sk||[]).forEach(s=>add('skill',s[0])));}catch(e){}
  try{Object.values(ITEMS).forEach(i=>add('item',i.n));Object.values(MATS).forEach(n=>add('item',n));
    // gear: not the pieces named after a boss or a wayfarer (Shard: X, Rook's Token), which repeat that name by design
    const own=new RegExp('^('+Object.values(TPL).map(t=>t.n).filter(n=>/^[A-Za-z]+$/.test(n)).join('|')+")'s ");Object.values(GEAR).forEach(g=>{if(typeof g.n==='string'&&!/^Shard: /.test(g.n)&&!own.test(g.n))add('item',g.n.replace(/ \+\d+$/,''));});}catch(e){}
  try{FAC.forEach(f=>{add('guild',f.n);(f.ranks||[]).forEach(r=>add('guild',r));});}catch(e){}
  try{FMIS.forEach(q=>add('quest',q[2]));Object.values(LEG_Q).forEach(q=>add('quest',q.title));}catch(e){}
  return o;}
// roots: a root counts once per name when a word of the name starts or ends with it, or is it (Hollowmere, Reedhollow, Hollow King)
const W16_ROOTS=['hollow','ash','ember','thorn','gloam','bone','mist','spire','cinder','frost','storm','dusk','dawn','star','moon','sun','salt','iron','stone','shadow','void','bramble','briar','moss','mire','rime','gloom','glass','thistle','barrow','wold','mere','ford','haven','deep','fall','brine','tide','grave','dread','wraith','fang','claw','wind','gale','thunder','flame','fire','ice','snow','sky','cloud','night','blood','rot','marsh','reed','amber','jade','willow','wyrm','drake','king','queen','warden','crag','peak','reach','watch','hold','gate','light','dark','black','white','red','gold','silver'];
// words that only look like a root (bellows is not a bell, sunken not a sun, shocking not a king, Thistlewold not old)
const W16_NOT={bell:['bellows'],sun:['sunken','sunder'],king:['shocking','kingsfire'],old:['thistlewold','wold'],arch:['matriarch','saltmarch','seamarch'],ash:['ashwin','splash','lash','slash','bash','flash','crash','smash'],hand:['handler'],star:['starless'],crow:['crown','crownshell'],mist:['alchemist','alchemists'],ember:['remember'],rook:['brook','ciderbrook']};
function w16RootIn(name,root){const ws=String(name).toLowerCase().split(/[^a-z]+/).filter(Boolean),no=W16_NOT[root]||[];
  return ws.some(w=>!no.includes(w)&&(w===root||w===root+'s'||w===root+'en'||(w.length>=root.length+3&&(w.startsWith(root)||w.endsWith(root)))));}
function w16Roots(names,roots){const N=names||w16Names(),place=['realm','town','dungeon','boss'],out={};
  (roots||W16_ROOTS).forEach(r=>{const hit={};let all=0,pl=0;Object.keys(N).forEach(k=>{const L=N[k].filter(n=>w16RootIn(n,r));if(L.length){hit[k]=L;all+=L.length;if(place.includes(k))pl+=L.length;}});if(all)out[r]={all,place:pl,hit};});return out;}
W16.api.names=w16Names;W16.api.roots=w16Roots;W16.api.rootIn=w16RootIn;W16.api.ROOTS=W16_ROOTS;W16.api.NOT=W16_NOT;
