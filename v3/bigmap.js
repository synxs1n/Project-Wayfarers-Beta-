// ===== bigmap.js (v0.10.3): the connected world map: every visited town and field stitched at their gates =====
// Opened from the area map's World map button (and ACT.worldMap) on connected-world journeys (worldV3). The maps the party has
// been to are laid out by their real gates: a field's start gate sits one tile past the town's forward gate, the next town one tile
// past the field's end gate (a map that would overlap another is pushed along the gate's axis and joined by a dashed line).
// Only seen tiles are drawn (the same bits as the area map). Dungeon doors, caves and sanctums are marked at their field entrance.
// Tap any seen tile on any visited map and the party walks there, map to map: a route of legs (walk to the gate or door, step
// through, walk on) run on top of the tap to walk (WS.route, not saved). The old parchment chart stays behind the Chart button.
const BM={sc:2,base:{},key:{},lay:null,pt:null};
const BM_V={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]},BM_DIR={n:'u',s:'d',e:'r',w:'l'};
function bmBase(m){const k=(G.explored&&G.explored[m.id])||'';if(BM.base[m.id]&&BM.key[m.id]===k)return BM.base[m.id];
  const cv=mkCv(m.w,m.h),x=cv.getContext('2d');for(let y=0;y<m.h;y++)for(let i=0;i<m.w;i++){if(!isSeen(m,i,y))continue;const raw=m.t[y][i],c='CKEWXDlGq|SU'.includes(raw)?(m.kind==='dungeon'?'.':'='):raw;x.fillStyle=mapCol(m,c);x.fillRect(i,y,1,1);}
  BM.base[m.id]=cv;BM.key[m.id]=k;return cv;}
// a gate's real cells: towns keep them in m.gates; a field's gate record holds unscaled numbers, so its cells come from m.exits by target
function bmGate(m,g){if(!m)return null;if(m.kind==='field'){const want=g==='start'?'next':'prev',cells=(m.exits||[]).filter(e=>e.to&&e.to.g===want).map(e=>[e.x,e.y]);if(!cells.length)return null;
    cells.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const c=cells[cells.length>>1],side=c[1]===0?'n':c[1]===m.h-1?'s':c[0]===0?'w':'e';return {side,x:c[0],y:c[1],cells};}
  const q=m.gates&&m.gates[g];return q&&q.x!=null&&q.side?q:null;}
// the layout: [{id,m,ox,oy}] in world tile coordinates, plus the links between gates
function bmLayout(){const out=[],links=[],at={};if(!G||!worldV3())return {maps:out,links};
  const been=id=>!!((G.been||{})[id])||(WS.m&&WS.m.id===id);
  const rect=(o)=>({x0:o.ox,y0:o.oy,x1:o.ox+o.m.w,y1:o.oy+o.m.h});
  const overlaps=(r)=>out.some(o=>{const q=rect(o);return r.x0<q.x1-1&&r.x1>q.x0+1&&r.y0<q.y1-1&&r.y1>q.y0+1;});
  const place=(id,m,ox,oy,side,from,fg,tg)=>{let push=0;const v=BM_V[side];while(overlaps({x0:ox,y0:oy,x1:ox+m.w,y1:oy+m.h})&&push<400){ox+=v[0];oy+=v[1];push++;}
    const o={id,m,ox,oy};out.push(o);at[id]=o;if(from)links.push({a:from,b:o,fg,tg,gap:push});return o;};
  const t0=getMap('t0');if(!t0)return {maps:out,links};place('t0',t0,0,0,'e');
  for(let s=0;s<5;s++){const T=at['t'+s];if(!T)break;const fid='f'+s;if(!been(fid))break;const f=getMap(fid),gn=bmGate(T.m,'next'),gs=bmGate(f,'start');if(!gn||!gs)break;
    const v=BM_V[gn.side];const F=place(fid,f,T.ox+gn.x-gs.x+v[0],T.oy+gn.y-gs.y+v[1],gn.side,T,gn,gs);
    if(s<4){const tid='t'+(s+1);if(!been(tid))break;const t=getMap(tid),ge=bmGate(f,'end'),gp=bmGate(t,'prev');if(!ge||!gp)break;const v2=BM_V[ge.side];place(tid,t,F.ox+ge.x-gp.x+v2[0],F.oy+ge.y-gp.y+v2[1],ge.side,F,ge,gp);}}
  return {maps:out,links};}
// doors on the fields: the dungeon, caves and sanctums (once their tile has been seen)
function bmDoors(L){const d=[];L.maps.forEach(o=>{const m=o.m;if(m.kind!=='field')return;
  if(m.ent&&(isSeen(m,m.ent[0],m.ent[1])||(G.been||{})['d'+m.s]))d.push({o,x:m.ent[0],y:m.ent[1],k:G.cleared[m.s]?'dunlit':'dungeon',id:'d'+m.s,n:ZS(m.s).dungeon});
  (m.caves||[]).forEach(c=>{if(!(isSeen(m,c.x,c.y)||(G.cavesSeen||{})[c.id]))return;d.push({o,x:c.x,y:c.y,k:c.kind==='fort'?'fort':'cave',id:c.id,n:c.kind==='fort'?(typeof FORT_NAMES!=='undefined'?FORT_NAMES[m.s]:'Sanctum'):CAVE_NAMES[m.s]});});});return d;}
function bmBounds(L){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;L.maps.forEach(o=>{x0=Math.min(x0,o.ox);y0=Math.min(y0,o.oy);x1=Math.max(x1,o.ox+o.m.w);y1=Math.max(y1,o.oy+o.m.h);});return {x0:x0-2,y0:y0-2,x1:x1+2,y1:y1+2};}
function drawBigMap(){const cv=document.getElementById('bmap');if(!cv||!G)return;const L=BM.lay=bmLayout();if(!L.maps.length)return;const B0=BM.bounds=bmBounds(L),W=B0.x1-B0.x0,H=B0.y1-B0.y0;
  const box=cv.parentElement,maxW=Math.min(1200,(box.clientWidth||340)-8);let sc=Math.max(3,Math.min(5,Math.floor(maxW/W)));BM.sc=sc;// at least 3 px a tile: the box scrolls
  cv.width=W*sc;cv.height=H*sc;cv.style.width=cv.width+'px';cv.style.height=cv.height+'px';
  const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#0a0710';x.fillRect(0,0,cv.width,cv.height);
  const P=(wx,wy)=>[(wx-B0.x0)*sc,(wy-B0.y0)*sc];
  // joins pushed apart
  x.save();x.setLineDash([sc*2,sc*2]);x.strokeStyle='#c8a860';x.lineWidth=Math.max(1,sc*.6);L.links.forEach(l=>{if(!l.gap)return;const a=P(l.a.ox+l.fg.x+.5,l.a.oy+l.fg.y+.5),b=P(l.b.ox+l.tg.x+.5,l.b.oy+l.tg.y+.5);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();});x.restore();
  L.maps.forEach(o=>{const [px,py]=P(o.ox,o.oy);x.drawImage(bmBase(o.m),px,py,o.m.w*sc,o.m.h*sc);x.strokeStyle='rgba(255,230,170,.25)';x.lineWidth=1;x.strokeRect(px+.5,py+.5,o.m.w*sc-1,o.m.h*sc-1);});
  // doors
  BM.doors=bmDoors(L);x.font=`800 ${Math.max(8,sc*4)}px Nunito,sans-serif`;x.textAlign='center';x.textBaseline='middle';
  BM.doors.forEach(d=>{const [px,py]=P(d.o.ox+d.x+.5,d.o.oy+d.y+.5);const col=d.k==='dunlit'?'#ffd04a':d.k==='dungeon'?'#ff6a5a':d.k==='fort'?'#c8c8e8':'#c89a6a',g=d.k==='fort'?'♜':d.k==='cave'?'◠':'▲';x.fillStyle='rgba(0,0,0,.6)';x.beginPath();x.arc(px,py,sc*2.6,0,Math.PI*2);x.fill();x.fillStyle=col;x.fillText(g,px,py+sc*.3);try{if(typeof siteDone==='function'&&siteDone(d.k==='dunlit'?'lair':d.k==='dungeon'?'lair':d.k,d.o.m.s))drawCheck(x,px+sc*2,py-sc*2,sc*1.3);}catch(e){}});
  // names
  x.font=`700 ${Math.max(9,sc*5)}px Nunito,sans-serif`;x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.8)';x.fillStyle='#f4ebd6';
  L.maps.forEach(o=>{const nm=o.m.kind==='town'?ZS(o.m.s).town:ZS(o.m.s).n;const [px,py]=P(o.ox+o.m.w/2,o.oy+1.5);x.strokeText(nm,px,py+sc*2);x.fillText(nm,px,py+sc*2);});
  // the party
  const cur=L.maps.find(o=>WS.m&&o.id===WS.m.id);if(cur){const [px,py]=P(cur.ox+WS.x+.5,cur.oy+WS.y+.5);drawPlayer(x,Math.max(3,sc*1.5),px,py);}
  // scroll to the party once
  try{if(cur&&!BM.scrolled){BM.scrolled=1;const [px,py]=P(cur.ox+WS.x,cur.oy+WS.y);const sb=cv.closest('.bmscroll');if(sb){sb.scrollLeft=px-sb.clientWidth/2;sb.scrollTop=py-sb.clientHeight/2;}}}catch(e){}}
function mBigMap(){BM.scrolled=0;setTimeout(drawBigMap,0);
  return `<div class="modal mapmodal" data-act="xClose"><div class="panel box mapbox wmbox"><div class="mh"><h2>World map</h2></div>
    <div class="bmscroll"><canvas id="bmap" class="fmap bmap" data-act="bmTap" aria-label="World map"></canvas></div><p class="note fmnote" id="bmnote" aria-live="polite"></p>
    <div class="maplegend"><span><b style="color:#fff">➤</b> You</span><span><b style="color:#ff6a5a">▲</b> Dungeon</span><span><b style="color:#ffd04a">▲</b> Relit dungeon</span><span><b style="color:#c89a6a">◠</b> Den</span><span><b style="color:#c8c8e8">♜</b> Sanctum</span></div>
    <div class="btnrow"><button class="btn sm" data-act="wmChart">Chart</button></div>
    <p class="note">Every town and field you have visited, joined at their gates. Tap anywhere you have been and the party walks there, through the gates on the way (a dungeon or cave door takes you inside). Drag to scroll a big map. Tap outside the map to close.</p></div></div>`;}
HOOK.before('vModal','bigmap','the connected world map',function(md){if(md&&md.type==='bigmap')return HOOK.stop(mBigMap(md));});
document.addEventListener('pointerdown',e=>{if(e.target&&e.target.id==='bmap')BM.pt={x:e.clientX,y:e.clientY};},true);
function bmTileAt(cv,cx,cy){const r=cv.getBoundingClientRect();if(!r.width||!BM.bounds)return null;const wx=Math.floor((cx-r.left)*cv.width/r.width/BM.sc)+BM.bounds.x0,wy=Math.floor((cy-r.top)*cv.height/r.height/BM.sc)+BM.bounds.y0;
  const L=BM.lay;if(!L)return null;for(let i=L.maps.length-1;i>=0;i--){const o=L.maps[i];if(wx>=o.ox&&wy>=o.oy&&wx<o.ox+o.m.w&&wy<o.oy+o.m.h)return {o,x:wx-o.ox,y:wy-o.oy};}return null;}
ACT.bmTap=function(arg,el){const cv=el||document.getElementById('bmap'),p=BM.pt;BM.pt=null;if(!cv||!p||!G)return;const note=document.getElementById('bmnote');
  const t=bmTileAt(cv,p.x,p.y);if(!t){if(note)note.textContent='';return;}
  // a door marker nearby takes you inside
  const door=(BM.doors||[]).find(d=>d.o===t.o&&Math.abs(d.x-t.x)<=1&&Math.abs(d.y-t.y)<=1);
  const r=bmRoute(t.o.id,door?door.x:t.x,door?door.y:t.y,door?door.id:null,true);
  if(r.res!=='ok'){if(note)note.textContent=r.res==='unseen'?'Your party has not seen that spot yet.':r.res==='here'?'You are standing there.':r.res==='sealed'?'That way is still sealed.':'No known way there.';if(typeof sfx==='function')sfx('deny');return;}
  V.modal=null;render();toast(door?`Walking to ${door.n}.`:`Walking to ${t.o.m.kind==='town'?ZS(t.o.m.s).town:ZS(t.o.m.s).n}.`);};
ACT.wmChart=function(){V.modal={type:'worldmap',from:{type:'bigmap'}};render();};
{const wm0=ACT.worldMap;ACT.worldMap=function(){if(!G||V.screen!=='world')return;if(!worldV3())return wm0.apply(this,arguments);const prev=V.modal;V.modal={type:'bigmap',from:prev&&prev.type==='map'?prev:{type:'map'}};render();};}
{const mb0=modalBack;modalBack=function(m){if(m&&m.type==='bigmap')return ()=>{V.modal=m.from||{type:'map'};};if(m&&m.type==='worldmap'&&m.from&&m.from.type==='bigmap')return ()=>{V.modal={type:'bigmap',from:{type:'map'}};};return mb0.apply(this,arguments);};}
// ----- routes across maps -----
// edges: how to leave a map for a neighbour: {to, ex, ey, dir} (the exit tile and the step that goes through it)
function bmEdges(id){const m=getMap(id);if(!m)return [];const E=[],s=m.s|0,been=k=>!!((G.been||{})[k]);
  if(m.kind==='town'){const gn=bmGate(m,'next'),gp=bmGate(m,'prev');if(gn&&been('f'+s))E.push({to:'f'+s,ex:gn.x,ey:gn.y,dir:BM_DIR[gn.side]});if(gp&&s>0&&been('f'+(s-1)))E.push({to:'f'+(s-1),ex:gp.x,ey:gp.y,dir:BM_DIR[gp.side]});}
  else if(m.kind==='field'){const gs=bmGate(m,'start'),ge=bmGate(m,'end');if(gs)E.push({to:'t'+s,ex:gs.x,ey:gs.y,dir:BM_DIR[gs.side]});if(ge&&s<4&&G.cleared[s]&&been('t'+(s+1)))E.push({to:'t'+(s+1),ex:ge.x,ey:ge.y,dir:BM_DIR[ge.side]});
    if(m.ent&&m.entOut)E.push({to:'d'+s,ex:m.ent[0],ey:m.ent[1],dir:bmDirOf(m.entOut,m.ent)});(m.caves||[]).forEach(c=>{if(c.out)E.push({to:c.id,ex:c.x,ey:c.y,dir:bmDirOf(c.out,[c.x,c.y])});});}
  else{// a dungeon or a cave: the stairs out
    let ex=null;for(let y=0;y<m.h&&!ex;y++)for(let x=0;x<m.w;x++)if(m.t[y][x]==='E'){ex=[x,y];break;}
    if(ex){const to=m.cave?'f'+s:m.archive?'t'+(G.lastTown||0):'f'+s;const f=[[0,1],[0,-1],[1,0],[-1,0]].find(([a,b])=>!solidAt(m,ex[0]+a,ex[1]+b)&&m.t[ex[1]+b]&&m.t[ex[1]+b][ex[0]+a]!=='E');E.push({to,ex:ex[0],ey:ex[1],dir:f?bmDirOf([ex[0]+f[0],ex[1]+f[1]],ex):'u'});}}
  return E;}
function bmDirOf(from,to){const dx=to[0]-from[0],dy=to[1]-from[1];return Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u');}
function bmRoute(mid,tx,ty,doorId,closeFirst){const m=WS.m;if(!m)return {res:'noway'};const tm=getMap(mid);if(!tm)return {res:'noway'};
  if(!doorId&&!isSeen(tm,tx,ty))return {res:'unseen'};
  // BFS over maps
  const prev={[m.id]:null},q=[m.id];let found=false;while(q.length){const id=q.shift();if(id===mid){found=true;break;}bmEdges(id).forEach(e=>{if(prev[e.to]===undefined){prev[e.to]={from:id,e};q.push(e.to);}});}
  if(!found)return {res:'noway'};
  const chain=[];for(let id=mid;prev[id];id=prev[id].from)chain.unshift(prev[id]);
  const legs=chain.map(c=>({m:c.from,ex:c.e.ex,ey:c.e.ey,dir:c.e.dir,to:c.e.to}));
  if(doorId){const d=bmEdges(mid).find(e=>e.to===doorId);if(!d)return {res:'noway'};legs.push({m:mid,ex:d.ex,ey:d.ey,dir:d.dir,to:doorId});}
  else legs.push({m:mid,tx,ty});
  if(legs.length===1&&!legs[0].ex&&legs[0].m===m.id&&tx===WS.x&&ty===WS.y)return {res:'here'};
  if(closeFirst){V.modal=null;}// the walk only runs with no popup open
  WS.route={legs,k:0};const ok=bmRunLeg();if(!ok){WS.route=null;return {res:'noway'};}return {res:'ok'};}
// run the current leg on the current map
function bmRunLeg(){const R=WS.route,m=WS.m;if(!R||!m)return false;const L=R.legs[R.k];if(!L||L.m!==m.id){WS.route=null;return false;}
  if(L.ex!=null){const p=awPlan(m,L.ex,L.ey);if(p.res==='here'){bmEnter(L);return true;}if(p.res!=='ok')return false;p.plan.route=R.k;p.plan.phase='walk';awGo(p.plan,'route');return true;}
  const p=awPlan(m,L.tx,L.ty);if(p.res==='here'){WS.route=null;return true;}if(p.res!=='ok')return false;p.plan.route=R.k;p.plan.phase='last';awGo(p.plan,'route');return true;}
// the one step through the gate or door
function bmEnter(L){const [a,b]=DIRV[L.dir]||[0,0];if(WS.x+a!==L.ex||WS.y+b!==L.ey){// not in front of it after all: walk again
    const p=awPlan(WS.m,L.ex,L.ey);if(p.res==='ok'){p.plan.route=WS.route.k;p.plan.phase='walk';awGo(p.plan,'route');}else WS.route=null;return;}
  awGo({m:WS.m.id,tx:L.ex,ty:L.ey,goals:[[L.ex,L.ey,null]],what:'enter',dirs:[L.dir],end:[L.ex,L.ey,null],at:WS.x+','+WS.y,fails:0,route:WS.route.k,phase:'enter'},'route');}
{const wt0=worldTick;worldTick=function(){try{const R=WS.route;if(R&&V.screen==='world'&&!V.modal&&!WS.dlg&&!WS.lock&&!B&&WS.m&&!WS.mv&&!WS.auto&&!WS.awPend&&!WS.awResume){const A=WS.autoLast;
    if(R.pend){R.pend=0;if(!bmRunLeg())WS.route=null;}
    else if(A&&A.src==='route'&&A.route===R.k&&A.why==='arrived'&&A.phase==='walk'){A.phase='done';bmEnter(R.legs[R.k]);}
    else if(A&&A.src==='route'&&A.why==='arrived'&&A.phase==='last'){WS.route=null;}
    else if(A&&A.src==='route'&&A.why&&A.why!=='map'&&A.why!=='halt'&&A.why!=='battle'&&A.why!=='arrived'){WS.route=null;}}}catch(e){WS.route=null;}return wt0.apply(this,arguments);};}
HOOK.after('placeAt','bigmap','next leg of a route',function(){try{const R=WS.route;if(!R)return;const L=R.legs[R.k];if(L&&L.to&&WS.m&&WS.m.id===L.to){R.k++;R.pend=1;}else if(L&&L.to&&WS.m&&WS.m.id!==L.m)WS.route=null;}catch(e){WS.route=null;}});
{const s0=awStop;awStop=function(why){const r=s0.apply(this,arguments);try{if(WS.route&&(why==='input'||why==='blocked'||why==='dialog'||why==='menu'))WS.route=null;}catch(e){}return r;};}
// a battle on a leg: the resume keeps the leg's source and phase
HOOK.before('startBattle','bigmap','keep the route through the fight',function(){try{const A=WS.auto||WS.autoLast;if(WS.awResume&&A&&A.src==='route'){WS.awResume.src='route';WS.awResume.route=A.route;WS.awResume.phase=A.phase;}}catch(e){}});
