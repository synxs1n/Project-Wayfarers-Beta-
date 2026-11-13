// ===== world14.js (v0.20.6): the cloud sea looks like cloud again, foes spawn only where you can walk, entrances are entered from the front only =====
// Owner after v0.20.5 (docs/world14.md), three notes:
//  1 "Clouds are filling the space and don't look as good as they used to": the cloud sea ('~' in the heights realms) was painted per tile by
//    worldgfx drawTile: two white blobs at random places in every tile and a dark band across the tile's middle whenever the tile above and below
//    were cloud too, so open sea was a regular grid of blobs on horizontal stripes 16 px apart (the same in the HD-2D ground bake, which reads the
//    same base canvas). Section 1 repaints the body of every cloud sea tile from one noise field laid across the whole map (billows with a lit
//    upper left and a shaded underside, thin haze between them, four to six tones with an ordered dither, no row or column repeats), keeps the
//    shore (the cliff front under land, the foam at the sides, the shade below), and leaves the void's stars alone (T.stars).
//  2 "Enemies spawns in an area I can't get to": roamers, side site actors, nodes and chests only stand on tiles the strict walk reach gets to
//    (section 2: w14Reach, w14Fit and hooks on roamSpawn and the actor/node builders; drawAudit/mapIssues report what is left).
//  3 "Make all dens, sanctums and lairs enterable through the front only for now": section 3.
// window.__W14 (counters, `off`, api) is the test hook; tools/chrome/v182a.js.
const W14={n:{cloud:0,roam:0,act:0,chest:0,front:0,clear:0,tap:0,door:0},off:false,cloud:true,err:[],api:{}};
function w14Err(w,e){if(W14.err.length<20)W14.err.push(w+': '+(e&&e.message||e));}
// ---------- 1. the cloud sea ----------
function w14H(x,y,k){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(k|0,1274126177))|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
function w14VN(x,y,k){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),a=w14H(xi,yi,k),b=w14H(xi+1,yi,k),c=w14H(xi,yi+1,k),d=w14H(xi+1,yi+1,k);
  return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;}
// the sea's height field at a point in tiles: wide billows (the view looks down at a slant, so they run longer across than down), two finer octaves
function w14Field(u,v,k){return w14VN(u*.2,v*.34,k)*.52+w14VN(u*.46+9.3,v*.8+4.1,k+1)*.3+w14VN(u*1.05+3.7,v*1.9+8.2,k+2)*.18;}
const W14_BAYER=[0,2,3,1];
const W14_PAL=new WeakMap();
function w14Pal(T){let o=W14_PAL.get(T);if(o)return o;const w=T.w;
  o=[mix(w[1],w[3],.62),mix(w[1],w[3],.3),w[1],mix(w[1],w[0],.55),w[0],mix(w[0],w[2],.55),w[2]];W14_PAL.set(T,o);return o;}
function w14CloudBody(ctx,m,x,y,frame,T,skipRows){
  const P=w14Pal(T),k=(m.s|0)*17+(String(m.id||'').length*5),sh=frame?.07:0,px=x*TS,py=y*TS;
  for(let j=0;j<16;j++){if(j<skipRows)continue;let i0=0,c0=-1;
    for(let i=0;i<=16;i++){let lv=-1;
      if(i<16){const u=x+(i+.5)/16+sh,v=y+(j+.5)/16,s=w14Field(u,v,k),s2=w14Field(u+.075,v+.095,k);
        // the billows: a body level from the field, a lit upper left face and a shaded lower right underside from the slope, a few specks
        let q=(s-.4)*11+(s2-s)*-46;
        const d=(W14_BAYER[((x*16+i)&1)+(((y*16+j)&1)<<1)]/4-.375);
        q+=d*.55;const hh=w14H(x*16+i,y*16+j,k+9);
        if(hh<.006&&q>3.5)q+=1.5;
        lv=Math.max(0,Math.min(6,Math.round(q)));}
      if(i<16&&lv===c0)continue;
      if(c0>=0)ctx.fillStyle=P[c0],ctx.fillRect(px+i0,py+j,i-i0,1);
      i0=i;c0=lv;}}
  W14.n.cloud++;}
HOOK.wrap('drawTile','world14','cloud sea body: billows from one noise field over the whole map (both renderers)',function(next,ctx,m,x,y,frame){
  const r=next(ctx,m,x,y,frame);
  try{if(W14.off||!W14.cloud||!m||m.kind==='dungeon'||!m.t||!m.t[y])return r;const c0=m.t[y][x];if(c0!=='~'&&c0!=='o')return r;
    const T=THM(m);if(!T||!T.cloud||T.stars)return r;
    const up=tileAt(m,x,y-1),cliff=up!=='~'&&up!=='B'&&up!=='o',w=T.w,f=(col,a,b,ww,hh)=>{ctx.fillStyle=col;ctx.fillRect(x*TS+a,y*TS+b,ww,hh);};
    // under land the base drew the cliff front over the first rows (9 plus the tile's own depth); the body goes under the rest
    const keep=cliff?9+(x*3)%5:0;
    w14CloudBody(ctx,m,x,y,frame,T,keep);
    if(cliff){const R=mulberry(x*7349+y*1931+m.s*11+3);if(R()<.6)f('#5a8a3a',3+Math.floor(R()*8),9+(x*3)%5,1,3+Math.floor(R()*2));}
    const edge=(dx,dy)=>{const n=tileAt(m,x+dx,y+dy);return n!=='~'&&n!=='B'&&n!=='o';};
    if(edge(-1,0))f('#ffffff',0,keep,1,16-keep);if(edge(1,0))f('#ffffff',15,keep,1,16-keep);if(edge(0,1))f(shade(w[0],.8),0,15,16,1);
  }catch(e){w14Err('cloud',e);}
  return r;});
// ---------- 2. foes, actors, nodes and chests only where the player can walk ----------
// The owner (Galecrest Peaks): a wraith on a grass terrace and a bat and a bird-like foe on an island across the cloud, none of them reachable by
// walking. Every spawn path picked tiles from the open ground of the map without asking whether the entry reaches them: roamSpawn (any interior
// room tile), dynActors (bounty beasts, legend challengers and rival wayfarers on a spot of the field's `free` list, which holds every open tile
// the generator carved including cut off terraces), placeNodes (already checked by world12 nodeFix) and chests (placed by the generator, never
// checked: mapIssues only looks at required targets). The reach is mapheal's strict one (props and standing NPCs solid, 4 steps, no flying: a
// diagonal never reaches a tile its two sides do not) with the progress doors passable (locked door, bars, the sealed gate and the boss rune:
// they open in the course of the game; a foe behind one is still on the walkable side of the dungeon).
W14.fix=true;W14.front=true;
function w14Free(m,c,x,y,ex){return !SOLID.includes(c)||'XGD|'.includes(c)||ex.has(x+','+y);}
function w14Reach(m){
  if(!m||!m.t||!m.t[0]||m.archive||m.sanctum)return null;
  const sig=(m.chests||[]).length+':'+(m.healed||[]).length+':'+(m.guarded||[]).length+':'+(m.nodes||[]).length,c=m.__w14r;
  if(c&&c.t===m.t&&c.sig===sig&&m.__w14fin)return c.R;
  let s=null;try{s=mapEntry(m);}catch(e){}if(!s)return null;
  const g=m.t,H=g.length,W=g[0].length,R=g.map(r=>r.map(()=>false)),ex=new Set((m.exits||[]).map(e=>e.x+','+e.y)),
    npc=new Set((m.npcs||[]).map(n=>(n.hx!=null?n.hx:n.x)+','+(n.hy!=null?n.hy:n.y))),st=[s];
  while(st.length){const [x,y]=st.pop();if(x<0||y<0||x>=W||y>=H||R[y][x])continue;if(!w14Free(m,g[y][x],x,y,ex))continue;if(npc.has(x+','+y)&&!(x===s[0]&&y===s[1]))continue;
    R[y][x]=true;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
  if(m.__w14fin)m.__w14r={t:m.t,sig,R};return R;}
const w14On=(R,x,y)=>!!(R[y]&&R[y][x]);
const w14Beside=(R,x,y)=>w14On(R,x,y)||[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>w14On(R,x+a,y+b));
// what stands where nobody can walk: roamers, actors, nodes, chests (counts and the first few)
function w14Audit(m){const out={roam:[],actors:[],mini:[],nodes:[],chests:[],free:0,freeBad:0};if(!m||!m.t||m.archive||m.sanctum)return out;const R=w14Reach(m);if(!R)return out;
  try{(m.roam||[]).forEach(r=>{if(!r.gone&&!w14On(R,r.hx!=null?r.hx:r.x,r.hy!=null?r.hy:r.y))out.roam.push({x:r.x,y:r.y,mon:r.mon});});}catch(e){}
  try{dynActors(m).forEach(a=>{if(w14On(R,a.x,a.y))return;(a.mini?out.mini:out.actors).push({x:a.x,y:a.y,type:a.type});});}catch(e){}
  (m.nodes||[]).forEach(n=>{if(!w14On(R,n.x,n.y))out.nodes.push({x:n.x,y:n.y,k:n.k});});
  (m.chests||[]).forEach(c=>{if(!w14Beside(R,c[0],c[1]))out.chests.push({x:c[0],y:c[1]});});
  (m.free||[]).forEach(p=>{out.free++;if(!w14On(R,p[0],p[1]))out.freeBad++;});
  return out;}
// 2a. roamers: a roamer on a tile the walk does not reach is picked again among the interior tiles it does reach (same rules as roamSpawn:
// 6 apart, away from the exits, caves, the dungeon door and people on a field, a few tiles from the start); with none left it is gone for this visit
HOOK.xform('roamSpawn','world14','roamers stand only on tiles the walk reaches',function(out,m){
  try{if(W14.off||!W14.fix||!out||!out.length||!m||m.__w14ro||!m.__w14fin)return out;const R=w14Reach(m);if(!R)return out;m.__w14ro=1;
    const bad=out.filter(r=>!w14On(R,r.hx,r.hy));if(!bad.length)return out;
    const rnd=seeded((hashS(m.id+'w14ro')+((G.run&&G.run.seed)||0))>>>0),fld=m.kind==='field',keep=fld?roamKeepOut(m):[],kd=fld?ROAM.field.minFromExit:0,st=m.start||[0,0],spots=[];
    for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++){if(!R[y][x]||!roamInterior(m,x,y))continue;if(!fld&&Math.abs(x-st[0])+Math.abs(y-st[1])<ROAM.minFromStart)continue;
      if(WS.m===m&&Math.abs(x-WS.x)+Math.abs(y-WS.y)<6)continue;if(fld&&keep.some(([kx,ky])=>Math.abs(x-kx)+Math.abs(y-ky)<kd))continue;spots.push([x,y]);}
    bad.forEach(r=>{const near=(x,y)=>out.some(o=>o!==r&&!o.gone&&Math.abs(o.hx-x)+Math.abs(o.hy-y)<6),ok=spots.filter(([x,y])=>!near(x,y));
      if(!ok.length){r.gone=true;r.dead=true;W14.n.roam++;return;}
      const [x,y]=ok[Math.floor(rnd()*ok.length)];r.w0=[r.hx,r.hy];r.x=r.hx=x;r.y=r.hy=y;r.fx=null;W14.n.roam++;});
    m.w14roam=bad.length;}catch(e){w14Err('roam',e);}return out;});
// 2b. bounty beasts, legend challengers, rival wayfarers and the lost wayfarer: the nearest open reachable spot of the map (the first pick stays
// where it is when it is reachable; a moved one stays moved, memoised by its first spot so the frame loop does not search again)
HOOK.xform('dynActors','world14','actors stand only on tiles the walk reaches',function(out,m){
  try{if(!out.length||W14.off||!W14.fix||!m||!m.t||!m.__w14fin)return out;const R=w14Reach(m);if(!R)return out;
    const memo=m.__w14mv||(m.__w14mv={});
    out.forEach(a=>{if(a.mini||w14On(R,a.x,a.y))return;const key=a.type+':'+a.x+','+a.y,hit=memo[key];if(hit&&w14On(R,hit[0],hit[1])&&!out.some(o=>o!==a&&o.x===hit[0]&&o.y===hit[1])){a.x=hit[0];a.y=hit[1];return;}
      const okc=m.kind==='dungeon'?'.':'.,',cand=[];const taken=p=>out.some(o=>o!==a&&o.x===p[0]&&o.y===p[1])||(m.nodes||[]).some(n=>n.x===p[0]&&n.y===p[1]);
      const pool=(m.free&&m.free.length&&m.kind==='field')?m.free:null;
      if(pool)pool.forEach(p=>{if(w14On(R,p[0],p[1])&&!f10Bad(m,p[0],p[1])&&!taken(p))cand.push(p);});
      if(!cand.length)for(let y=2;y<m.h-2;y++)for(let x=2;x<m.w-2;x++)if(R[y][x]&&okc.includes(m.t[y][x])&&!f10Bad(m,x,y)&&!taken([x,y])&&(m.kind!=='dungeon'||!m.start||Math.abs(x-m.start[0])+Math.abs(y-m.start[1])>2))cand.push([x,y]);
      let best=null,bd=1e9;cand.forEach(p=>{const d=Math.abs(p[0]-a.x)+Math.abs(p[1]-a.y);if(d<bd){bd=d;best=p;}});
      if(best){memo[key]=best;a.x=best[0];a.y=best[1];W14.n.act++;}});}catch(e){w14Err('actors',e);}return out;});
// 2c. chests, key chests and levers that no step reaches move to the nearest reachable room tile that pathguard would allow (contents, opened state
// and the mimic roll follow the spot the chest was built on, the way guardPaths moves them); nodes go through world12's nodeFix, run again here
function w14FixChests(m){
  if(!m||!m.t||m.archive||m.sanctum)return [];const log=[];
  for(let it=0;it<12;it++){const R=w14Reach(m);if(!R)break;let moved=false;
    for(let y=0;y<m.h&&!moved;y++)for(let x=0;x<m.w&&!moved;x++){const c=m.t[y][x];if(c!=='C'&&c!=='K'&&c!=='l')continue;if(w14Beside(R,x,y))continue;
      const P=pgGrid(m),fl=m.kind==='dungeon'?(q=>q==='.'):(q=>q==='.'||q===','),cand=[];
      for(let yy=2;yy<m.h-2;yy++)for(let xx=2;xx<m.w-2;xx++){if(!R[yy][xx]||!fl(m.t[yy][xx])||!P.room[yy][xx]||P.prot[yy][xx]||pgCuts(P,xx,yy)||pgHides(m,xx,yy,c)||pgRoadLine(m,xx,yy))continue;
        let crowd=false;for(let j=-1;j<=1&&!crowd;j++)for(let k=-1;k<=1&&!crowd;k++){const q=(m.t[yy+j]||[])[xx+k];if((j||k)&&q&&pgIsAsset(m,q))crowd=true;}
        if(crowd||pgNpcAt(m).some(n=>n.x===xx&&n.y===yy))continue;cand.push([xx,yy,(xx-x)*(xx-x)+(yy-y)*(yy-y)]);}
      cand.sort((a,b)=>a[2]-b[2]);const floor=pgFloorOf(m,x,y),base=mapIssues(m).length,h0=m.d8lair&&typeof d8LairHidden==='function'?d8LairHidden(m).length:0;let done=false;
      for(const [sx,sy] of cand.slice(0,25)){m.t[y][x]=floor;m.t[sy][sx]=c;
        if(mapIssues(m).length>base||(h0>=0&&m.d8lair&&typeof d8LairHidden==='function'&&d8LairHidden(m).length>h0)){m.t[sy][sx]=m.kind==='dungeon'?'.':',';m.t[y][x]=c;continue;}// (a chest north of dungeon8's mound would be hidden by it)
        if(c==='C'||c==='K'){const e=(m.chests||[]).find(q=>q[0]===x&&q[1]===y);if(e){const from=e.from||[x,y];e[0]=sx;e[1]=sy;e.from=from;}
          try{if(G&&G.chests){const ok=m.id+':'+x+','+y,nk=m.id+':'+sx+','+sy;if(G.chests[ok]&&!G.chests[nk])G.chests[nk]=G.chests[ok];}}catch(e2){}}
        if(c==='l'&&m.lever&&m.lever[0]===x&&m.lever[1]===y)m.lever=[sx,sy];if(c==='K'&&m.key&&m.key[0]===x&&m.key[1]===y)m.key=[sx,sy];
        if(m.tl)m.tl=null;log.push({x,y,what:c,to:[sx,sy]});W14.n.chest++;done=true;break;}
      if(!done){m.t[y][x]=c;log.push({x,y,what:c,to:null});}
      moved=done;}
    if(!moved)break;}
  return log;}
// registered after every module has loaded (worldart12 puts its getMap wrap on in a microtask: exit aprons and causeways turn void into ground, which
// reaches terraces the generator left cut off, so the reach is only final once that has run); m.__w14fin says the tiles are final
queueMicrotask(()=>{HOOK.wrap('getMap','world14','unreachable chests move, nodes checked (after healing, the path guard and the exit aprons)',function(next,...a){const had=!!MAPS[a[0]];const m=next(...a);
  try{if(!had&&m&&m.t&&!m.__w14){m.__w14=true;m.__w14fin=true;if(!W14.off&&W14.front&&!(typeof HEAL_OFF!=='undefined'&&HEAL_OFF)){try{const fl=w14Restamp(m);if(fl.length){m.w14front=fl;m.__w14r=null;/* the new fronts are path tiles: what stood beside them is moved off by the same guards that ran before */if(typeof healMap==='function'&&mapIssues(m).length)healMap(m);if(typeof guardPaths==='function'&&!window.__PGOFF){const g0=m.guarded;guardPaths(m);if(Array.isArray(g0)&&g0.length)m.guarded=g0.concat(m.guarded||[]);}}m.__w14r=null;}catch(e){w14Err('front',e);}}
    if(!W14.off&&W14.fix&&!(typeof HEAL_OFF!=='undefined'&&HEAL_OFF)){const l=w14FixChests(m);if(l.length)m.w14chests=l;
    if(m.fort){const dl=w14SanctDoor(m);if(dl.length){m.w14door=dl;W14.n.clear++;}}
    if(m.nodes&&m.nodes.length){const n=nodeFix(m);if(n.length)m.nodeFixed=(m.nodeFixed||[]).concat(n);}}}}catch(e){w14Err('getMap',e);}return m;});});
// drawAudit reports what is left; mapIssues(m,{actors:true}) lists the same as targets ({x,y,why})
HOOK.xform('drawAudit','world14','unreachable roamers, actors, nodes and chests',function(out,m){try{if(!out||!m)return out;const a=w14Audit(m);out.unreach=a;}catch(e){}return out;});
HOOK.xform('mapIssues','world14','opt in: foes, actors, nodes and chests off the walkable ground',function(out,m,o){try{if(!(o&&o.actors)||!m||!m.t)return out;const a=w14Audit(m);
  return out.concat(a.roam.map(q=>({x:q.x,y:q.y,why:'roamer unreachable'})),a.actors.map(q=>({x:q.x,y:q.y,why:'actor unreachable'})),a.nodes.map(q=>({x:q.x,y:q.y,why:'node unreachable'})),a.chests.map(q=>({x:q.x,y:q.y,why:'chest unreachable'})));}catch(e){}return out;});
W14.api={reach:w14Reach,audit:w14Audit,fixChests:w14FixChests};
window.__W14=W14;
// ---------- 3. entrances are entered from the front only ----------
// The owner: "Make all dens, sanctums and lairs enterable through the front only for now, to match what they look like." worldart13 draws every den
// mouth, lair front and Sanctum shrine facing the camera: the mass rises north of the E tile and the way in is the tile south of it. The tiles did
// not agree: world4 builds the field in a canonical frame and then turns it (xfRows: a mirror and up to three quarter turns), and the entrance's
// 'U' block (three north, one west, one east of E) turned with it, so on about three fields in four the solid mass stood beside or south of its door
// and the way in was from the side or the back of what is drawn. Fix, on every field once its tiles are final: the mass is stood up again in the
// drawn orientation at the same E tile (or the nearest spot where it fits, 10 tiles at most), the front tile and the two beside it are cleared of
// trees, rock, cliff and bush if they stood in the way (the generator's own clearing is turned too: it lay behind the old front), the records
// (c.face, c.out, m.entFace, m.entOut) say south, and mapheal's check (mapIssues) must be no worse; the lair's mound (dungeon8) is built again over
// the new mass. A door is entered by stepping north from its front tile: the sides and the back are solid (and diagonal steps onto E were never
// allowed, diagOk), a tap on the mass walks to the front tile and in (findPath, below), A on the door from the front opens it.
const W14_MASS=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0]];
function w14Sites(m){const L=[];if(!m||m.kind!=='field'||!m.t)return L;if(m.ent)L.push({kind:'lair',x:m.ent[0],y:m.ent[1],rec:m});
  (m.caves||[]).forEach(c=>L.push({kind:c.kind==='fort'?'fort':'den',x:c.x,y:c.y,rec:c}));return L;}
function w14SolidT(m,x,y){const c=(m.t[y]||[])[x];return c==null||SOLID.includes(c);}
// the state of one entrance: its mass, the front, the leaks (open neighbours other than the front), reach of the front from the entry
function w14Ent(m,s,R){const g=m.t,fx=s.x,fy=s.y+1,rec=s.rec,out=s.kind==='lair'?m.entOut:rec.out,face=s.kind==='lair'?m.entFace:rec.face;
  const mass=W14_MASS.every(([a,b])=>w14SolidT(m,s.x+a,s.y+b)),front=!w14SolidT(m,fx,fy),leaks=[[0,-1],[1,0],[-1,0]].filter(([a,b])=>!w14SolidT(m,s.x+a,s.y+b)).length;
  return {kind:s.kind,x:s.x,y:s.y,e:g[s.y][s.x]==='E',mass,front,leaks,face:!!(face&&face[0]===0&&face[1]===1),out:!!(out&&out[0]===fx&&out[1]===fy),reach:!!(R&&R[fy]&&R[fy][fx])};}
function w14EntOk(e){return e.e&&e.mass&&e.front&&!e.leaks&&e.face&&e.out&&e.reach;}
function w14Entrances(m){const R=w14Reach(m)||(()=>{try{const st=mapEntry(m);return st?healReach(m,st,true,true):null;}catch(e){return null;}})();return w14Sites(m).map(s=>w14Ent(m,s,R));}
// what a restamp must not cut off: every required target of mapheal and every entrance's front tile that the strict walk reached before
function w14TReach(R,x,y,solid){return solid?[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>R[y+b]&&R[y+b][x+a]):!!(R[y]&&R[y][x]);}
function w14Targets(m,R){const L=[];if(!R)return L;try{mapTargets(m).forEach(t=>{if(w14TReach(R,t.x,t.y,t.solid))L.push([t.x,t.y,t.solid]);});}catch(e){}
  w14Sites(m).forEach(s=>{if(R[s.y+1]&&R[s.y+1][s.x])L.push([s.x,s.y+1,false]);});return L;}
const W14_GROUND='.,f',W14_CLEARABLE='#TtRFH';
function w14Restamp(m){
  const log=[];if(!m||m.kind!=='field'||!m.t||m.archive||m.sanctum)return log;
  const g=m.t,H=g.length,W=g[0].length;
  for(const s of w14Sites(m)){
    let R0=null;try{const st=mapEntry(m);R0=st?healReach(m,st,true,true):null;}catch(e){}
    if(w14EntOk(w14Ent(m,s,R0)))continue;
    const oldOut=s.kind==='lair'?m.entOut:s.rec.out,keepT=w14Targets(m,R0).filter(([x,y])=>!(x===s.x&&y===s.y)&&!(oldOut&&x===oldOut[0]&&y===oldOut[1])&&!(x===s.x&&y===s.y+1)),base=mapIssues(m).length,snapT=g.map(r=>r.slice()),snapR=JSON.stringify([m.ent,m.entFace,m.entOut,(m.caves||[]).map(c=>[c.x,c.y,c.face,c.out]),m.d8lair?1:0]),keep={ent:m.ent&&m.ent.slice(),entFace:m.entFace,entOut:m.entOut,caves:(m.caves||[]).map(c=>({c,x:c.x,y:c.y,face:c.face,out:c.out}))};
    // the lair's mound is taken down first (dungeon8 builds it again over the new mass)
    let had8=false;if(s.kind==='lair'&&m.d8lair){had8=true;try{m.d8lair.tiles.forEach(([x,y])=>{const k=x+','+y;g[y][x]=(m.d8lair.under&&m.d8lair.under[k])||'.';});}catch(e){}m.d8lair=undefined;}
    const revert=()=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++)g[y][x]=snapT[y][x];m.ent=keep.ent;m.entFace=keep.entFace;m.entOut=keep.entOut;keep.caves.forEach(k=>{k.c.x=k.x;k.c.y=k.y;k.c.face=k.face;k.c.out=k.out;});if(had8){m.d8lair=undefined;try{d8LairShape(m);}catch(e){}}m.tl=null;};
    // the old mass (the 'U' tiles round E) turns back into ground
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=s.x+dx,y=s.y+dy;if(g[y]&&g[y][x]==='U')g[y][x]='.';}
    const spot=(cx,cy,clear)=>{if(cx<3||cy<3||cx>=W-3||cy>=H-4)return null;const set=[];
      for(const [a,b,kind] of [[0,0,'e'],...W14_MASS.map(([a,b])=>[a,b,'m']),[-1,1,'f'],[0,1,'f'],[1,1,'f']]){const x=cx+a,y=cy+b,c=g[y][x];
        if(x===s.x&&y===s.y){set.push([x,y,kind==='e'?'E':kind==='m'?'U':'.']);continue;}
        if(!(W14_GROUND.includes(c)||(clear&&W14_CLEARABLE.includes(c))))return null;
        if((m.chests||[]).some(q=>q[0]===x&&q[1]===y)||(m.nodes||[]).some(n=>n.x===x&&n.y===y)||(m.npcs||[]).some(n=>n.x===x&&n.y===y))return null;
        set.push([x,y,kind==='e'?'E':kind==='m'?'U':'.']);}
      return set;};
    const cand=[];for(let r=0;r<=10;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;cand.push([s.x+dx,s.y+dy,dx*dx+dy*dy]);}
    cand.sort((a,b)=>a[2]-b[2]);
    // first the same E tile (clearing what stands in the way), then the nearest spot with the ground already open, then the nearest where clearing is needed
    const tries=[[cand[0],true],...cand.slice(1).map(c=>[c,false]),...cand.slice(1).map(c=>[c,true])];let done=null;
    for(const [c,clear] of tries){const set=spot(c[0],c[1],clear);if(!set)continue;
      const moved=c[0]!==s.x||c[1]!==s.y,prev=g.map(r=>r.slice());
      if(moved)g[s.y][s.x]='.';set.forEach(([x,y,t])=>{g[y][x]=t;});
      let st=null,R=null;try{st=mapEntry(m);R=st?healReach(m,st,true,true):null;}catch(e){}
      const ok=R&&R[c[1]+1]&&R[c[1]+1][c[0]]&&mapIssues(m).length<=base&&keepT.every(([x,y,solid])=>w14TReach(R,x,y,solid));
      if(ok){done={x:c[0],y:c[1],moved};break;}
      for(let y=0;y<H;y++)for(let x=0;x<W;x++)g[y][x]=prev[y][x];}
    if(!done){revert();log.push({kind:s.kind,x:s.x,y:s.y,why:'no spot'});continue;}
    const out=[done.x,done.y+1],fv=[0,1];
    if(s.kind==='lair'){m.ent=[done.x,done.y];m.entFace=fv;m.entOut=out;}else{s.rec.x=done.x;s.rec.y=done.y;s.rec.face=fv;s.rec.out=out;if(s.kind==='fort')m.fortAt=[done.x,done.y];}
    if(s.kind==='lair'&&had8){try{d8LairShape(m);}catch(e){w14Err('d8',e);}
      // dungeon8's mound is five wide behind the door and its check (mapIssues) does not see a pocket cut off from everything: if it closed the front, it goes
      try{const st=mapEntry(m),R=healReach(m,st,true,true);if(m.d8lair&&!(R[done.y+1]&&R[done.y+1][done.x])){m.d8lair.tiles.forEach(([x,y])=>{g[y][x]=(m.d8lair.under&&m.d8lair.under[x+','+y])||'.';});m.d8lair=null;W14_MASS.forEach(([a,b])=>{g[done.y+b][done.x+a]='U';});W14.n.clear++;}}catch(e){w14Err('d8b',e);}}
    m.tl=null;W14.n.front++;let rr=null;try{const st=mapEntry(m),R=healReach(m,st,true,true);rr=!!R[done.y+1][done.x];}catch(e){}log.push({kind:s.kind,from:[s.x,s.y],to:[done.x,done.y],moved:done.moved,reach:rr});
  }
  return log;}
W14.api.restamp=w14Restamp;W14.api.entrances=w14Entrances;W14.api.ent=w14Ent;W14.api.entOk=w14EntOk;
// a tap on the mass of a den, lair or shrine walks to the front tile and in (the mass is solid, so the path used to end on its nearest side or
// back and the hero faced a wall); a tap on the door itself already did
function w14DoorOf(m,x,y){if(!m||m.kind!=='field'||!m.t)return null;for(const s of w14Sites(m)){const dx=x-s.x,dy=y-s.y;if(dx===0&&dy===0)return null;if(Math.abs(dx)<=2&&dy>=-2&&dy<=0&&w14SolidT(m,x,y))return s;}return null;}
HOOK.wrap('findPath','world14','a tap on an entrance mass walks to its front door',function(next,m,sx,sy,tx,ty){
  try{if(!W14.off&&W14.front){const s=w14DoorOf(m,tx,ty);if(s){W14.n.tap++;return next(m,sx,sy,s.x,s.y);}}}catch(e){w14Err('tap',e);}return next(m,sx,sy,tx,ty);});
// A on the door, from the front tile facing north, walks in (the door is walkable, so nothing answered before); on the mass or from anywhere else it is a wall
HOOK.before('interact','world14','A on an entrance door from its front tile opens it',function(){try{if(W14.off||!W14.front||V.screen!=='world'||V.modal||WS.lock||WS.dlg||WS.mv)return;const m=WS.m;if(!m||m.kind!=='field')return;
  const [fx,fy]=facing(),s=w14Sites(m).find(q=>q.x===fx&&q.y===fy);if(s&&WS.dir==='u'&&WS.x===s.x&&WS.y===s.y+1&&tileAt(m,fx,fy)==='E'){W14.n.door++;tryStepDir(performance.now(),'u');return HOOK.stop(undefined);}}catch(e){w14Err('A',e);}});
// every way into an entrance, as the game plays it: the hero put on a tile beside the door and told to step toward it
// (test hook: returns true when the step starts a move onto the door tile or enters at once)
function w14Try(m,x,y,d){const a=DIRV[d];return !solidAt(m,x+a[0],y+a[1])&&tileAt(m,x+a[0],y+a[1])==='E'&&(d.length===1||diagOk(m,x,y,d));}
W14.api.door=w14DoorOf;W14.api.can=w14Try;
// the Sanctum's hall keeps its turn (the field's shrine always faces south, so the hall is always walked north and its door is on the south wall; turning
// it the other way was tried: the prize chest then stands against the south wall, where pgHides moves it off m.prize). Its door stands in a niche:
// the two floor tiles beside it are wall, so it is entered from the one tile in front of it only
function w14SanctDoor(m){const log=[];if(!m||!m.fort||!m.cave||!m.t)return log;let E=null;for(let y=0;y<m.h&&!E;y++)for(let x=0;x<m.w;x++)if(m.t[y][x]==='E'){E=[x,y];break;}if(!E)return log;
  const side=m.enterDir==='e'||m.enterDir==='w'?[[0,-1],[0,1]]:[[-1,0],[1,0]];
  side.forEach(([a,b])=>{const x=E[0]+a,y=E[1]+b,c=(m.t[y]||[])[x];if(c!=null&&!SOLID.includes(c)&&c!=='E'){const base=mapIssues(m).length;m.t[y][x]='#';if(mapIssues(m).length>base)m.t[y][x]=c;else log.push({x,y,was:c});}});
  if(log.length)m.tl=null;return log;}
