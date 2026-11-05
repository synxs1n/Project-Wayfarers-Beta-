// =================== MAP AND MINIMAP (Beta v0.3.2) ===================
// New optional field G.explored {mapId: base64 bitset, one bit per tile}. Dungeon tiles rebuild from the seed, so only
// the seen bits are saved. Only seen tiles are drawn; markers show only once their tile has been seen. A mimic is a chest.
const MAP_R={field:7,town:8,dungeon:5};
const SEEN={};// mapId -> Uint8Array
function seenOf(m){if(!m)return null;let s=SEEN[m.id];if(s&&s.n===m.w*m.h)return s;const n=m.w*m.h,a=new Uint8Array(Math.ceil(n/8));a.n=n;
  const src=G&&G.explored&&G.explored[m.id];if(src){try{const b=atob(src);for(let i=0;i<Math.min(a.length,b.length);i++)a[i]=b.charCodeAt(i);}catch(e){}}return SEEN[m.id]=a;}
function isSeen(m,x,y){const s=seenOf(m);if(!s||x<0||y<0||x>=m.w||y>=m.h)return false;const i=y*m.w+x;return !!(s[i>>3]&(1<<(i&7)));}
function revealAround(){const m=WS.m;if(!G||!m||G.daily)return;const s=seenOf(m),R=MAP_R[m.kind]||6,x0=WS.x,y0=WS.y;let ch=0;
  for(let y=y0-R;y<=y0+R;y++)for(let x=x0-R;x<=x0+R;x++){if(x<0||y<0||x>=m.w||y>=m.h)continue;if((x-x0)*(x-x0)+(y-y0)*(y-y0)>R*R+1)continue;const i=y*m.w+x;if(!(s[i>>3]&(1<<(i&7)))){s[i>>3]|=1<<(i&7);ch++;}}
  if(ch){let b='';for(let i=0;i<s.length;i++)b+=String.fromCharCode(s[i]);G.explored=G.explored||{};G.explored[m.id]=btoa(b);MAPCV.dirty=1;}}
{const ar0=arrive;arrive=function(){const r=ar0.apply(this,arguments);try{revealAround();drawMini();}catch(e){}return r;};}
{const pa0=placeAt;placeAt=function(){const r=pa0.apply(this,arguments);try{MAPCV.dirty=1;revealAround();setTimeout(drawMini,0);}catch(e){}return r;};}
// when a new journey starts the seen cache must not leak from the old one
{const ng0=newGame;newGame=function(){Object.keys(SEEN).forEach(k=>delete SEEN[k]);MAPCV.id=null;return ng0.apply(this,arguments);};}
{const up0=unpackG;unpackG=function(){Object.keys(SEEN).forEach(k=>delete SEEN[k]);MAPCV.id=null;return up0.apply(this,arguments);};}
// ----- terrain colours -----
function mapCol(m,c){const th=m.theme,dun=m.kind==='dungeon';
  if(c==='~')return th==='cave'?'#b0482a':th==='void'?'#2a1a4a':th==='heights'?'#b8c8dc':th==='snow'?'#6a9ac8':'#3a6ab0';
  if(c==='='||c==='B')return dun?'#7a7088':'#b89a6a';if(c===':')return '#c8b898';if(c==='T'||c==='t')return th==='snow'?'#4a6a5a':'#2e5a2e';
  if(c==='#'||c==='Z'||c==='R'||c==='Y')return dun?'#2a2430':'#4a4248';if(c==='H')return '#8a5a3a';if(c==='Q'||c==='P'||c==='v'||c==='g'||c==='N')return '#5a5260';
  if(c===','||c==='f'||c==='y')return th==='snow'?'#c8d8e0':th==='cave'?'#6a4a3a':th==='void'?'#4a3a5a':'#4e7a3e';
  if(c==='.'||c==='r'||c==='s')return dun?'#8a8090':th==='snow'?'#dde6ee':th==='cave'?'#8a6a50':th==='void'?'#5a4a6a':th==='coast'?'#d8c890':'#6a9a4e';
  if(SOLID.includes(c))return dun?'#3a3440':'#5a5048';return dun?'#8a8090':'#6a9a4e';}
const MAPCV={id:null,cv:null,dirty:1};
function mapBase(m){if(MAPCV.id!==m.id||!MAPCV.cv||MAPCV.cv.width!==m.w*2){MAPCV.cv=mkCv(m.w*2,m.h*2);MAPCV.id=m.id;MAPCV.dirty=1;}
  if(MAPCV.dirty){const x=MAPCV.cv.getContext('2d');x.clearRect(0,0,m.w*2,m.h*2);for(let y=0;y<m.h;y++)for(let i=0;i<m.w;i++){if(!isSeen(m,i,y))continue;const raw=m.t[y][i];
    const c='CKEWXDlGq|SU'.includes(raw)?(m.kind==='dungeon'?'.':'='):raw;x.fillStyle=mapCol(m,c);x.fillRect(i*2,y*2,2,2);}MAPCV.dirty=0;}return MAPCV.cv;}
// ----- markers (only on seen tiles; state from tileAt so opened chests and pulled levers show as such) -----
function mapMarks(m){const out=[],T=m.t;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const raw=T[y][x];if(!'CKEWXDlG|qU'.includes(raw)||!isSeen(m,x,y))continue;const live=tileAt(m,x,y);
    if(raw==='C'||raw==='K'){const ch=(m.chests||[]).find(c=>c[0]===x&&c[1]===y),vault=ch&&(ch[2]==='vault'||ch[2]==='reward');out.push({x,y,k:raw==='K'?(live==='c'?'keyopen':'key'):live==='c'?(vault?'vaultopen':'chestopen'):(vault?'vault':'chest')});}
    else if(raw==='E'){const cv=(m.caves||[]).find(c=>c.x===x&&c.y===y);out.push({x,y,k:m.kind==='dungeon'?'stairs':cv?(cv.kind==='fort'?'fort':'cave'):'dungeon'});}else if(raw==='W')out.push({x,y,k:'waystone'});
    else if(raw==='X')out.push({x,y,k:G.cleared[m.s]?(typeof storyEchoUp==='function'&&storyEchoUp(m.s)?'echo':'bossdone'):'boss'});
    else if(raw==='D')out.push({x,y,k:live==='D'?'door':'dooropen'});else if(raw==='|')out.push({x,y,k:live==='|'?(m.keyBar&&m.keyBar[0]===x&&m.keyBar[1]===y?'keybars':'bars'):'barsopen'});
    else if(raw==='l')out.push({x,y,k:(G.levers||{})[m.id]?'leverdone':'lever'});else if(raw==='G')out.push({x,y,k:live==='G'?'gate':'gateopen'});else if(raw==='q')out.push({x,y,k:'board'});}
  (m.exits||[]).forEach(e=>{if(!e.to||!isSeen(m,e.x,e.y))return;
    // v0.4.0 5.4: a three-tile gate is one marker, with the side it faces
    const gs=m.gates?Object.values(m.gates).filter(g=>g.side&&g.x!==undefined&&g.cells!==undefined?true:g.side&&g.x!==undefined):[];
    const gg=gs.find(g=>((g.side==='n'||g.side==='s')?e.y===g.y&&Math.abs(e.x-g.x)<=1:e.x===g.x&&Math.abs(e.y-g.y)<=1));
    if(gg){if(gg.x===e.x&&gg.y===e.y)out.push({x:e.x,y:e.y,k:String(e.to.m)[0]==='t'?'town':'exit',dir:gg.side});return;}
    out.push({x:e.x,y:e.y,k:String(e.to.m)[0]==='t'?'town':'exit'});});
  (m.bld||[]).forEach(b=>{if(isSeen(m,b.door[0],b.door[1])&&SERVICE[b.k])out.push({x:b.door[0],y:b.door[1],k:'svc',svc:b.k});});
  try{dynActors(m).forEach(a=>{if(isSeen(m,a.x,a.y))out.push({x:a.x,y:a.y,k:'quest'});});}catch(e){}
  return out;}
const MK={chest:['#e8b04a','▪'],chestopen:['#6a5a3a','▫'],vault:['#c89aff','▪'],vaultopen:['#5a4a6a','▫'],key:['#ffd04a','⚿'],keyopen:['#6a5a3a','▫'],stairs:['#ffe08a','▲'],dungeon:['#ffe08a','▼'],waystone:['#5ad0ff','◆'],
  boss:['#ff4a4a','●'],bossdone:['#7a5a5a','○'],echo:['#c89aff','◎'],door:['#ff9a4a','■'],dooropen:['#8a6a4a','□'],bars:['#a8a8b8','#'],keybars:['#ffd04a','#'],barsopen:['#5a5a6a','·'],lever:['#ffd04a','┤'],leverdone:['#6a6a5a','┤'],
  cave:['#5ad0ff','◒'],gate:['#ff6a6a','║'],gateopen:['#6a8a6a','║'],board:['#e8c860','!'],town:['#ffe8a0','⌂'],exit:['#d8d8d8','➜'],svc:['#ffffff','•'],quest:['#5aff9a','★']};
const MKN={cave:'Side cave',chest:'Chest',chestopen:'Opened chest',vault:'Vault chest',key:'Beacon Key',stairs:'Stairs out',dungeon:'Dungeon entrance',waystone:'Waystone',boss:'Scourge or Calamity',echo:'Echo',door:'Boss door',bars:'Bars',keybars:'Bars over the key room',lever:'Lever',gate:'Sealed gate',town:'Town',exit:'Road on',board:'Quest board',svc:'Shop or service',quest:'Quest or bounty target'};
// ----- v0.3.5 1.4: one pixel-icon set shared by the map, minimap, legend and building signs (SVC_ICON in towngfx.js has the shop icons) -----
const MAPICO_X={
  waystone:[[4,0,2,1,'#d8f6ff'],[3,1,4,2,'#5ad0ff'],[2,3,6,3,'#3aa8e8'],[3,6,4,2,'#3aa8e8'],[4,8,2,2,'#2a78b8'],[4,2,1,3,'#d8f6ff']],
  board:[[1,1,8,6,'#8a5a2a'],[2,2,3,3,'#f4e8c0'],[5,3,3,3,'#f4e8c0'],[2,7,1,3,'#5a3a1a'],[7,7,1,3,'#5a3a1a']],
  town:[[1,2,2,8,'#e8d8a0'],[7,2,2,8,'#e8d8a0'],[1,1,8,2,'#e8d8a0'],[3,4,4,6,'#ffb040']],
  exit:[[1,2,2,8,'#d8d8e0'],[7,2,2,8,'#d8d8e0'],[1,1,8,2,'#d8d8e0'],[3,5,3,1,'#ffffff'],[5,4,1,3,'#ffffff'],[6,5,1,1,'#ffffff']],
  cave:[[1,4,8,6,'#8a8a98'],[2,3,6,1,'#8a8a98'],[3,5,4,5,'#07040a'],[4,4,2,1,'#07040a'],[3,9,4,1,'#5ad0ff']],
  dungeon:[[1,3,8,7,'#6a6278'],[2,2,6,1,'#6a6278'],[3,5,4,5,'#0a0710'],[4,3,2,2,'#0a0710'],[3,9,4,1,'#ffe08a']]};
const MAPICO_NAME={inn:'Inn',tavern:'Tavern',smithy:'Smithy',workshop:'Alchemy',guild:'Guild Hall',board:'Quest board',waystone:'Waystone',town:'Town gate',exit:'Road gate',cave:'Side cave',dungeon:'Dungeon entrance'};
function mapIcoKey(o){return o.k==='svc'?o.svc:o.k;}
function mapIcoRects(k){try{return (typeof SVC_ICON!=='undefined'&&SVC_ICON[k])||MAPICO_X[k]||null;}catch(e){return MAPICO_X[k]||null;}}
// draws icon k centred at (cx,cy), size px square, with a dark outline so it reads on any terrain
function mapIcoDraw(x,k,cx,cy,size){const R=mapIcoRects(k);if(!R)return false;const u=size/10,x0=cx-size/2,y0=cy-size/2;
  x.fillStyle='#0a0710';[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]].forEach(([a,b])=>R.forEach(([rx,ry,rw,rh])=>x.fillRect(Math.round(x0+rx*u)+a,Math.round(y0+ry*u)+b,Math.max(1,Math.ceil(rw*u)),Math.max(1,Math.ceil(rh*u)))));
  R.forEach(([rx,ry,rw,rh,c])=>{x.fillStyle=c;x.fillRect(Math.round(x0+rx*u),Math.round(y0+ry*u),Math.max(1,Math.ceil(rw*u)),Math.max(1,Math.ceil(rh*u)));});return true;}
function drawMarks(x,m,list,sc,ox,oy){x.textAlign='center';x.textBaseline='middle';x.font=`800 ${Math.max(7,Math.round(sc*1.15))}px sans-serif`;
  list.forEach(o=>{const M=MK[o.k]||['#fff','•'],px=ox+(o.x+.5)*sc,py=oy+(o.y+.5)*sc;
    if(o.dir){const v=SIDE_V[o.dir],ar={n:'▲',s:'▼',e:'▶',w:'◀'}[o.dir],d=Math.max(8,sc*1.8);x.fillStyle='rgba(0,0,0,.7)';x.fillText(ar,px-v[0]*d+1,py-v[1]*d+1);x.fillStyle='#ffe08a';x.fillText(ar,px-v[0]*d,py-v[1]*d);}
    if(mapIcoDraw(x,mapIcoKey(o),px,py,Math.max(10,Math.round(sc*2.4))))return;x.fillStyle='rgba(0,0,0,.6)';x.fillText(M[1],px+1,py+1);x.fillStyle=M[0];x.fillText(M[1],px,py);});}
function drawPlayer(x,sc,px,py){const d=WS.dir||'d';x.save();x.translate(px,py);x.rotate({u:-Math.PI/2,r:0,d:Math.PI/2,l:Math.PI}[d]||0);const s=Math.max(4,sc*.9);
  x.fillStyle='#000';x.beginPath();x.moveTo(s+1,0);x.lineTo(-s*.7,-s*.8);x.lineTo(-s*.7,s*.8);x.closePath();x.fill();x.fillStyle='#ffffff';x.beginPath();x.moveTo(s,0);x.lineTo(-s*.6,-s*.65);x.lineTo(-s*.6,s*.65);x.closePath();x.fill();x.restore();}
// ----- minimap (HUD) -----
let MINI_VW=0;window.addEventListener('resize',()=>{MINI_VW=0;});
function miniOn(){const c=META.cfg.minimap;if(c===true||c===false)return c;if(!MINI_VW)MINI_VW=window.innerWidth||800;return MINI_VW>=560;}
function drawMini(){const cv=document.getElementById('mmap');if(!cv)return;const m=WS.m;if(!m||!G||!miniOn()||m.archive&&false){cv.style.display='none';return;}cv.style.display='block';
  const W=cv.width,H=cv.height,x=cv.getContext('2d'),sc=4,base=mapBase(m);x.imageSmoothingEnabled=false;x.fillStyle='#0a0710';x.fillRect(0,0,W,H);
  const ox=Math.round(W/2-(WS.x+.5)*sc),oy=Math.round(H/2-(WS.y+.5)*sc);x.drawImage(base,ox,oy,m.w*sc,m.h*sc);
  const vis=mapMarks(m).filter(o=>Math.abs(o.x-WS.x)<W/sc&&Math.abs(o.y-WS.y)<H/sc);drawMarks(x,m,vis,sc,ox,oy);drawPlayer(x,sc,W/2,H/2);}
// v0.5.0 1.6: the minimap no longer depends on the weather chip drawing cleanly (an unknown sky used to stop it), and every world render makes sure it is there
function ensureMini(){try{if(V.screen==='world'&&!document.getElementById('mmap')){const wv=document.querySelector('.wview');if(wv){wv.insertAdjacentHTML('beforeend','<canvas id="mmap" class="mmap" width="112" height="84" aria-hidden="true"></canvas>');}}drawMini();}catch(e){}}
{const wu0=wkwUpdate;wkwUpdate=function(){try{wu0.apply(this,arguments);}catch(e){try{wdLog('wkwUpdate: '+e.message);}catch(_){}}ensureMini();};}
// deferred to the next frame (and coalesced) so a render never pays for a forced layout here
let miniRaf=0;{const r0=render;render=function(){const r=r0.apply(this,arguments);if(V.screen==='world'&&!miniRaf)miniRaf=requestAnimationFrame(()=>{miniRaf=0;ensureMini();});return r;};}
// ----- full map -----
function legendKeys(L){const ks=[];L.forEach(o=>{const k=mapIcoKey(o);if((MAPICO_NAME[k]||MKN[k])&&!ks.includes(k))ks.push(k);});return ks;}
function mMap(){const m=WS.m;if(!m)return '';const lbl=m.cave?m.name:m.archive?(m.hub||'The Archive'):m.kind==='town'?ZS(m.s).town:m.kind==='field'?ZS(m.s).n:ZS(m.s).dungeon;
  const L=mapMarks(m),kinds=[...new Set(L.map(o=>o.k))].filter(k=>MKN[k]);
  setTimeout(()=>{drawFullMap();document.querySelectorAll('canvas.lgi').forEach(c=>{const x=c.getContext('2d');x.imageSmoothingEnabled=false;mapIcoDraw(x,c.dataset.ico,10,10,16);});},0);
  return `<div class="modal mapmodal" data-act="xClose"><div class="panel box mapbox"><div class="mh"><h2>${esc(lbl)}</h2></div>
    <canvas id="fmap" class="fmap" aria-label="Map of ${esc(lbl)}"></canvas>
    <div class="maplegend"><span><b style="color:#fff">➤</b> You</span>${legendKeys(L).map(k=>MAPICO_NAME[k]?`<span><canvas class="lgi" data-ico="${k}" width="20" height="20"></canvas> ${MAPICO_NAME[k]}</span>`:`<span><b style="color:${MK[k][0]}">${MK[k][1]}</b> ${MKN[k]}</span>`).join('')}</div>
    <div class="btnrow"><button class="btn sm" data-act="worldMap">World map</button></div>
    <p class="note">Only places your party has seen are drawn. Tap anywhere, press N or Esc, or B on a pad to close.</p></div></div>`;}
function drawFullMap(){const cv=document.getElementById('fmap'),m=WS.m;if(!cv||!m)return;const box=cv.parentElement,maxW=Math.min(900,(box.clientWidth||340)-8),maxH=Math.max(160,(window.innerHeight||600)*.62);
  const sc=Math.max(2,Math.floor(Math.min(maxW/m.w,maxH/m.h)));cv.width=m.w*sc;cv.height=m.h*sc;cv.style.width=cv.width+'px';cv.style.height=cv.height+'px';
  const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#0a0710';x.fillRect(0,0,cv.width,cv.height);x.drawImage(mapBase(m),0,0,m.w*sc,m.h*sc);
  drawMarks(x,m,mapMarks(m),sc,0,0);drawPlayer(x,sc,(WS.x+.5)*sc,(WS.y+.5)*sc);}
{const vm0=vModal;vModal=function(md){if(md&&md.type==='map')return mMap(md);return vm0.apply(this,arguments);};}
ACT.map=function(){if(!G||V.screen!=='world'||!WS.m)return;if(V.modal&&V.modal.type==='map'){V.modal=null;render();return;}const prev=V.modal;V.modal={type:'map',from:prev&&prev.type!=='map'?prev:null};render();};
ACT.miniT=function(){META.cfg.minimap=!miniOn();saveMeta();drawMini();render();};
window.addEventListener('keydown',e=>{if((e.key==='n'||e.key==='N')&&V.screen==='world'&&!(e.target&&e.target.matches&&e.target.matches('input,textarea'))&&(!V.modal||V.modal.type==='map')){e.preventDefault();ACT.map();}});
window.addEventListener('resize',()=>{if(V.modal&&V.modal.type==='map')drawFullMap();});

try{if(META.cfg.minimap===undefined)META.cfg.minimap=null;if(META.cfg.rmotion===undefined)META.cfg.rmotion=null;}catch(e){}
{const ac0=applyCfg;applyCfg=function(){const r=ac0.apply(this,arguments);try{drawMini();document.documentElement.classList.toggle('rm',reducedMotion());}catch(e){}return r;};}

// =================== v0.4.0 5.2/5.4: THE WORLD MAP (area graph) ===================
// One box per area, laid out by the direction of each gate. Only places the party has been to are named; the next area past a sealed gate
// shows as a locked "?". Dungeons and caves appear once their entrance has been seen. Old (v0.3.5 and earlier) journeys show the same
// chain laid out west to east, with their two fields per town.
const GRID_V={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]};
function seenKey(id){return !!((G.been||{})[id]);}
function worldGraph(){
  const v3=worldV3(),nodes=[],edges=[],at={};
  const free=(x,y)=>!at[x+','+y];
  const put=(id,kind,label,x,y,extra)=>{
    let px=x,py=y;if(!free(px,py)){const dirs=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1],[2,0],[0,2],[-2,0],[0,-2]];for(const [a,b] of dirs){if(free(x+a,y+b)){px=x+a;py=y+b;break;}}}
    const n=Object.assign({id,kind,label,x:px,y:py},extra||{});at[px+','+py]=n;nodes.push(n);return n;};
  const link=(a,b,sa,sb,locked)=>edges.push({a:a.id,b:b.id,sa,sb,locked:!!locked});
  let cur=[0,0];const side=[];
  const P=v3?worldPlan():null;
  for(let s=0;s<5;s++){
    const Z=ZS(s),tn=v3?P[s].tn:'e',T=s===0?put('t0','town',Z.town,0,0,{seen:true}):nodes.find(n=>n.id==='t'+s);
    // field(s)
    let last=T,lastSide=tn,pos=[cur[0]+GRID_V[tn][0],cur[1]+GRID_V[tn][1]];
    const chain=v3?['f'+s]:['g'+s,'f'+s];
    let F=null;
    chain.forEach((fid,i)=>{
      const seen=seenKey(fid);
      const nm=v3?Z.n:(i===0?Z.n+' (first)':Z.n);
      F=put(fid,'field',nm,pos[0],pos[1],{seen,stage:s});
      link(last,F,lastSide,v3?P[s].fs:'w',false);
      last=F;
      if(i<chain.length-1){lastSide='e';pos=[pos[0]+1,pos[1]];}
    });
    side.push(()=>{
    const fm=seenKey('f'+s)?getMap('f'+s):null;
    const around=(m,ex,ey)=>{const cx=m.w/2,cy=m.h/2,dx=ex-cx,dy=ey-cy;return Math.abs(dx)/m.w>Math.abs(dy)/m.h?(dx>0?'e':'w'):(dy>0?'s':'n');};
    const dSeen=!!fm&&fm.ent&&(isSeen(fm,fm.ent[0],fm.ent[1])||seenKey('d'+s));
    if(dSeen){const pref=around(fm,fm.ent[0],fm.ent[1]);const q=[pref,...['s','n','e','w'].filter(d=>d!==pref)].find(d=>free(F.x+GRID_V[d][0],F.y+GRID_V[d][1]))||pref;
      const dn=put('d'+s,'dungeon',Z.dungeon,F.x+GRID_V[q][0],F.y+GRID_V[q][1],{seen:true,stage:s,cleared:!!G.cleared[s]});link(F,dn,q,'n',false);}
    if(v3&&fm&&fm.caves&&fm.caves.length){fm.caves.forEach(c=>{if(!(isSeen(fm,c.x,c.y)||(G.cavesSeen||{})[c.id]))return;const pref=around(fm,c.x,c.y);
      const q=[pref,...['n','s','e','w'].filter(d=>d!==pref)].find(d=>free(F.x+GRID_V[d][0],F.y+GRID_V[d][1]));if(!q)return;
      const kn=put(c.id,c.kind==='fort'?'fort':'cave',c.kind==='fort'?(typeof FORT_NAMES!=='undefined'?FORT_NAMES[s]:'Fortress'):CAVE_NAMES[s],F.x+GRID_V[q][0],F.y+GRID_V[q][1],{seen:true,stage:s,done:c.kind==='fort'?!!(G.fortWon||{})[s]:!!(G.caveWon||{})[s]});link(F,kn,q,'n',false);});}
    });
    // on to the next town
    if(s<4){const fe=v3?P[s].fe:'e',np=[F.x+GRID_V[fe][0],F.y+GRID_V[fe][1]];
      const cleared=!!G.cleared[s];cur=np;
      const nt=put('t'+(s+1),'town',ZS(s+1).town,np[0],np[1],{seen:seenKey('t'+(s+1)),locked:!cleared,stage:s+1});
      link(F,nt,fe,v3?SIDE_OPP[fe]:'w',!cleared);cur=[nt.x,nt.y];
    }
  }
  side.forEach(f=>f());
  return {nodes,edges};
}
const WG_COL={town:'#ffe8a0',field:'#8ec06a',dungeon:'#c89aff',cave:'#5ad0ff',fort:'#e07a5a'};
function drawWorldMap(){
  const cv=document.getElementById('wmap');if(!cv||!G)return;
  const gr=worldGraph(),here=WS.m?(WS.m.id[0]==='g'?'f'+WS.m.s:WS.m.id):null;
  // which nodes show: visited ones, plus the neighbour of a visited node (as "?")
  const byId={};gr.nodes.forEach(n=>byId[n.id]=n);
  const show={};gr.nodes.forEach(n=>{if(n.seen)show[n.id]=2;});
  gr.edges.forEach(e=>{if(show[e.a]===2&&!show[e.b]&&byId[e.b].kind!=='dungeon'&&byId[e.b].kind!=='cave'&&byId[e.b].kind!=='fort')show[e.b]=1;});
  const nodes=gr.nodes.filter(n=>show[n.id]);if(!nodes.length)return;
  const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const box=cv.parentElement,maxW=Math.min(900,(box.clientWidth||340)-8),maxH=Math.max(220,(window.innerHeight||600)*.6);
  const gw=x1-x0+1,gh=y1-y0+1,cell=Math.floor(Math.max(48,Math.min(maxW/gw,maxH/gh,150)));
  cv.width=Math.round(gw*cell);cv.height=Math.round(gh*cell);cv.style.width=cv.width+'px';cv.style.height=cv.height+'px';
  const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#0a0710';x.fillRect(0,0,cv.width,cv.height);
  const bw=Math.round(cell*.84),bh=Math.round(cell*.52),ctr=n=>[(n.x-x0+.5)*cell,(n.y-y0+.5)*cell];
  x.textAlign='center';x.textBaseline='middle';
  // links first, with an arrowhead and a direction letter at each gate
  gr.edges.forEach(e=>{if(!show[e.a]||!show[e.b])return;const a=byId[e.a],b=byId[e.b],[ax,ay]=ctr(a),[bx,by]=ctr(b);
    x.strokeStyle=e.locked?'#7a4a4a':'#b89a6a';x.lineWidth=Math.max(2,cell/22);x.setLineDash(e.locked?[5,4]:[]);x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke();x.setLineDash([]);
    [[a,e.sa,ax,ay],[b,e.sb,bx,by]].forEach(([n,sd,px,py])=>{const v=GRID_V[sd]||[0,0],gx=px+v[0]*(bw/2+4),gy=py+v[1]*(bh/2+4);
      x.fillStyle='#ffe08a';x.font=`800 ${Math.max(9,Math.round(cell/9))}px sans-serif`;x.fillText({n:'▲',s:'▼',e:'▶',w:'◀'}[sd]||'',gx+v[0]*5,gy+v[1]*5);});
    if(e.locked){const mx=(ax+bx)/2,my=(ay+by)/2;x.fillStyle='#ff9a9a';x.font=`800 ${Math.max(10,Math.round(cell/8))}px sans-serif`;x.fillText('sealed',mx,my);}});
  nodes.forEach(n=>{const [cx,cy]=ctr(n),full=show[n.id]===2,col=WG_COL[n.kind]||'#fff',isHere=n.id===here;
    x.fillStyle=full?'#1d1426':'#14101a';x.strokeStyle=full?col:'#4a4252';x.lineWidth=isHere?3:1.5;
    const rx=cx-bw/2,ry=cy-bh/2,r=7;x.beginPath();x.moveTo(rx+r,ry);x.arcTo(rx+bw,ry,rx+bw,ry+bh,r);x.arcTo(rx+bw,ry+bh,rx,ry+bh,r);x.arcTo(rx,ry+bh,rx,ry,r);x.arcTo(rx,ry,rx+bw,ry,r);x.closePath();x.fill();x.stroke();
    if(isHere){x.strokeStyle='#fff';x.lineWidth=1;x.stroke();}
    const fs=Math.max(9,Math.round(cell/8));x.font=`700 ${fs}px sans-serif`;
    const lbl=full?n.label:(n.locked?'? (locked)':'?'),icon={town:'⌂',field:'≈',dungeon:'▼',cave:'◒',fort:'♜'}[n.kind]||'';
    const txt=(full?icon+' ':'')+lbl;let f2=fs;x.font=`700 ${f2}px sans-serif`;while(x.measureText(txt).width>bw-8&&f2>7){f2--;x.font=`700 ${f2}px sans-serif`;}
    x.fillStyle=full?col:'#7a7284';x.fillText(txt,cx,cy-(isHere||n.cleared||n.done?fs*.45:0));
    if(isHere){x.fillStyle='#fff';x.font=`800 ${Math.max(8,fs-1)}px sans-serif`;x.fillText('YOU ARE HERE',cx,cy+fs*.75);}
    else if(full&&(n.cleared||n.done)){x.fillStyle='#8fd08f';x.font=`700 ${Math.max(8,fs-2)}px sans-serif`;x.fillText(n.kind==='cave'||n.kind==='fort'?'looted':'relit',cx,cy+fs*.75);}
  });
}
function mWorldMap(){
  setTimeout(drawWorldMap,0);
  return `<div class="modal mapmodal" data-act="xClose"><div class="panel box mapbox"><div class="mh"><h2>World map</h2></div>
    <canvas id="wmap" class="fmap" aria-label="World map"></canvas>
    <div class="maplegend"><span><b style="color:#ffe8a0">⌂</b> Town</span><span><b style="color:#8ec06a">≈</b> Field</span><span><b style="color:#c89aff">▼</b> Dungeon</span><span><b style="color:#5ad0ff">◒</b> Side cave</span><span><b style="color:#ffe08a">▲▼◀▶</b> Gate side</span><span><b style="color:#ff9a9a">- -</b> Sealed gate</span></div>
    <p class="note">Boxes sit where the road leads, so a gate on the north edge points up the map. Places appear as you find them. Side caves are optional.</p></div></div>`;
}
{const vm1=vModal;vModal=function(md){if(md&&md.type==='worldmap')return mWorldMap(md);return vm1.apply(this,arguments);};}
function openWorldMap(){const prev=V.modal;V.modal={type:'worldmap',from:prev&&prev.type==='map'?prev:{type:'map'}};render();}
ACT.worldMap=function(){if(!G||V.screen!=='world')return;openWorldMap();};
window.addEventListener('resize',()=>{if(V.modal&&V.modal.type==='worldmap')drawWorldMap();});
