// ===== map.js (v0.3.2): the area map, the minimap and the illustrated world map =====
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
    if(mapIcoDraw(x,mapIcoKey(o),px,py,Math.max(10,Math.round(sc*2.4))))return;const dim=MK_DONE[o.k];if(dim)x.globalAlpha=.45;x.fillStyle='rgba(0,0,0,.6)';x.fillText(M[1],px+1,py+1);x.fillStyle=M[0];x.fillText(M[1],px,py);if(dim)x.globalAlpha=1;});}
// opened chests (the chest itself has vanished from the world): left off the minimap, dimmed on the full map
const MK_DONE={chestopen:1,vaultopen:1,keyopen:1};
function drawPlayer(x,sc,px,py){const d=WS.dir||'d';x.save();x.translate(px,py);x.rotate({u:-Math.PI/2,r:0,d:Math.PI/2,l:Math.PI}[d]||0);const s=Math.max(4,sc*.9);
  x.fillStyle='#000';x.beginPath();x.moveTo(s+1,0);x.lineTo(-s*.7,-s*.8);x.lineTo(-s*.7,s*.8);x.closePath();x.fill();x.fillStyle='#ffffff';x.beginPath();x.moveTo(s,0);x.lineTo(-s*.6,-s*.65);x.lineTo(-s*.6,s*.65);x.closePath();x.fill();x.restore();}
// ----- minimap (HUD) -----
let MINI_VW=0;window.addEventListener('resize',()=>{MINI_VW=0;});
function miniOn(){const c=META.cfg.minimap;if(c===true||c===false)return c;if(!MINI_VW)MINI_VW=window.innerWidth||800;return MINI_VW>=560;}
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
    <canvas id="fmap" class="fmap" data-act="fmTap" aria-label="Map of ${esc(lbl)}"></canvas><p class="note fmnote" id="fmnote" aria-live="polite"></p>
    <div class="maplegend"><span><b style="color:#fff">➤</b> You</span>${legendKeys(L).map(k=>MAPICO_NAME[k]?`<span><canvas class="lgi" data-ico="${k}" width="20" height="20"></canvas> ${MAPICO_NAME[k]}</span>`:`<span><b style="color:${MK[k][0]}">${MK[k][1]}</b> ${MKN[k]}</span>`).join('')}</div>
    <div class="btnrow"><button class="btn sm" data-act="worldMap">World map</button></div>
    <p class="note">Only places your party has seen are drawn. Tap a place you have been to and the party walks there. Tap outside the map, press N or Esc, or B on a pad to close.</p></div></div>`;}
function drawFullMap(){const cv=document.getElementById('fmap'),m=WS.m;if(!cv||!m)return;const box=cv.parentElement,maxW=Math.min(900,(box.clientWidth||340)-8),maxH=Math.max(160,(window.innerHeight||600)*.62);
  const sc=Math.max(2,Math.floor(Math.min(maxW/m.w,maxH/m.h)));cv.width=m.w*sc;cv.height=m.h*sc;cv.style.width=cv.width+'px';cv.style.height=cv.height+'px';
  const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#0a0710';x.fillRect(0,0,cv.width,cv.height);x.drawImage(mapBase(m),0,0,m.w*sc,m.h*sc);
  drawMarks(x,m,mapMarks(m),sc,0,0);drawPlayer(x,sc,(WS.x+.5)*sc,(WS.y+.5)*sc);}
{const vm0=vModal;vModal=function(md){if(md&&md.type==='map')return mMap(md);if(md&&md.type==='worldmap')return mWorldMap(md);return vm0.apply(this,arguments);};}// the minimap's full map and (v0.6.3) the world map
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
// ----- v0.6.3: the world map as an illustrated, code drawn chart -----
// A parchment sheet (grain, stains, burnt edge, compass rose); each area drawn as a little vignette in its realm's colours: towns as
// clusters of roofs, fields as countryside with a road through it, dungeons as dark towers (a gold beacon once relit), caves as rock arches,
// fortresses as gatehouses. Roads join the gates (dashed and red past a sealed gate), places not yet visited sit under clouds with a "?",
// a red pin marks the party, a tick marks a looted cave or fortress. Names are written under the places when there is room; tapping a
// place shows its name (on a phone they are often too small to write out). Everything is drawn in code from cached sprites, once per open,
// resize or tap (no animation). State: WMS (not saved).
const WMS={sel:null,hit:[],t:0,pt:null};
const WM_LAND={meadow:['#b5c98a','#8fae62','#6f9248'],coast:['#e6d6a0','#9cc4c8','#5f9aa8'],snow:['#eef0ee','#c8d6de','#9fb4c0'],heights:['#cdbb8e','#a8956a','#7f6e4c'],cave:['#c49a78','#9a6448','#e0703a'],void:['#b8a8cc','#8d78ac','#5fc9a0']};
function wmTheme(s){try{return p2BaseTheme(s);}catch(e){return 'meadow';}}
function wmRng(k){let h=hashS(String(k))>>>0;return ()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296;};}
const WMC={};// sprite cache: key -> canvas
function wmSpr(key,w,h,fn){let c=WMC[key];if(c)return c;c=WMC[key]=mkCv(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));const x=c.getContext('2d');fn(x,c.width,c.height);return c;}
// the parchment, once per size
function wmPaper(W,H){return wmSpr('paper:'+W+'x'+H,W,H,(x,w,h)=>{const R=wmRng('paper'+w+'x'+h);
  const g=x.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.hypot(w,h)*.58);g.addColorStop(0,'#f1e2bc');g.addColorStop(.7,'#e2cb98');g.addColorStop(1,'#b8925a');x.fillStyle=g;x.fillRect(0,0,w,h);
  for(let i=0;i<w*h/90;i++){x.fillStyle=R()<.5?'rgba(120,84,40,.07)':'rgba(255,250,230,.12)';x.fillRect(Math.floor(R()*w),Math.floor(R()*h),1+Math.floor(R()*2),1);}
  for(let i=0;i<5;i++){const cx=R()*w,cy=R()*h,r=20+R()*Math.min(w,h)*.12,sg=x.createRadialGradient(cx,cy,r*.2,cx,cy,r);sg.addColorStop(0,'rgba(150,108,56,.10)');sg.addColorStop(1,'rgba(150,108,56,0)');x.fillStyle=sg;x.fillRect(cx-r,cy-r,r*2,r*2);}
  x.strokeStyle='rgba(90,58,26,.55)';x.lineWidth=2;x.strokeRect(6,6,w-12,h-12);x.strokeStyle='rgba(90,58,26,.3)';x.lineWidth=1;x.strokeRect(10,10,w-20,h-20);
  const e=x.createLinearGradient(0,0,0,h);e.addColorStop(0,'rgba(70,40,14,.35)');e.addColorStop(.04,'rgba(70,40,14,0)');e.addColorStop(.96,'rgba(70,40,14,0)');e.addColorStop(1,'rgba(70,40,14,.35)');x.fillStyle=e;x.fillRect(0,0,w,h);
  const e2=x.createLinearGradient(0,0,w,0);e2.addColorStop(0,'rgba(70,40,14,.35)');e2.addColorStop(.04,'rgba(70,40,14,0)');e2.addColorStop(.96,'rgba(70,40,14,0)');e2.addColorStop(1,'rgba(70,40,14,.35)');x.fillStyle=e2;x.fillRect(0,0,w,h);});}
function wmCompass(x,cx,cy,r){x.save();x.translate(cx,cy);x.globalAlpha=.75;x.strokeStyle='#6a4a24';x.lineWidth=1;x.beginPath();x.arc(0,0,r*.72,0,7);x.stroke();
  for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.fillStyle=i%2?'#8a6236':'#5a3a1a';x.beginPath();x.moveTo(0,-r);x.lineTo(r*.18,0);x.lineTo(-r*.18,0);x.closePath();x.fill();}
  x.rotate(Math.PI/4);for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.fillStyle='#a8865a';x.beginPath();x.moveTo(0,-r*.55);x.lineTo(r*.1,0);x.lineTo(-r*.1,0);x.closePath();x.fill();}
  x.restore();x.save();x.globalAlpha=.8;x.fillStyle='#5a3a1a';x.font=`800 ${Math.max(9,Math.round(r*.42))}px Nunito,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText('N',cx,cy-r-Math.max(6,r*.28));x.restore();}
// one place, drawn in a box of s x s px centred on the sprite
function wmVignette(kind,th,s,st){const k=`v:${kind}:${th}:${s}:${st||''}`;return wmSpr(k,s,s,(x,w,h)=>{const L=WM_LAND[th]||WM_LAND.meadow,u=w/40,R=wmRng(k),f=(c,a,b,ww,hh)=>{x.fillStyle=c;x.fillRect(Math.round(a*u),Math.round(b*u),Math.max(1,Math.round(ww*u)),Math.max(1,Math.round(hh*u)));};
  const ell=(c,a,b,rx,ry)=>{x.fillStyle=c;x.beginPath();x.ellipse(a*u,b*u,rx*u,ry*u,0,0,7);x.fill();};
  const tri=(c,a,b,c2,d,e,g)=>{x.fillStyle=c;x.beginPath();x.moveTo(a*u,b*u);x.lineTo(c2*u,d*u);x.lineTo(e*u,g*u);x.closePath();x.fill();};
  const ink='#3a2614';
  // the ground patch under every place (soft edged)
  {const g=x.createRadialGradient(w/2,h*.58,w*.1,w/2,h*.58,w*.5);g.addColorStop(0,L[0]);g.addColorStop(.55,L[0]+'f0');g.addColorStop(.8,L[0]+'80');g.addColorStop(1,L[0]+'00');x.fillStyle=g;x.fillRect(0,0,w,h);}
  const tree=(a,b,sz)=>{if(th==='snow'){tri('#5a7a6a',a,b-sz*2.2,a-sz,b,a+sz,b);tri('#ffffff',a,b-sz*2.2,a-sz*.45,b-sz*1.2,a+sz*.45,b-sz*1.2);}
    else if(th==='coast'){f('#7a5a32',a-.3,b-sz*2,.7,sz*2);ell('#4f8a3a',a-sz*.6,b-sz*2,sz*.8,sz*.3);ell('#4f8a3a',a+sz*.6,b-sz*2,sz*.8,sz*.3);}
    else if(th==='void'){tri('#8a5ad0',a,b-sz*2,a-sz*.5,b,a+sz*.5,b);tri('#d8c0ff',a,b-sz*2,a-sz*.15,b-sz,a+sz*.2,b-sz);}
    else if(th==='cave'){tri('#5a4038',a,b-sz*1.6,a-sz,b,a+sz,b);f('#ff8a3a',a-.3,b-sz*.6,.7,.7);}
    else{f('#6a4424',a-.3,b-sz,.7,sz);ell(L[2],a,b-sz*1.4,sz*.9,sz*.85);ell(L[1],a-sz*.25,b-sz*1.6,sz*.45,sz*.4);}};
  if(kind==='field'){
    if(th==='heights'||th==='snow'){tri(L[2],8,20,15,9,22,20);tri(L[1],18,22,26,8,34,22);tri('#ffffff',26,8,24,11.5,28.5,11.5);tri('#ffffff',15,9,13.5,11.5,16.5,11.5);}
    else if(th==='coast'){ell(L[1],30,30,10,5);ell(L[2],32,31,6,2.5);}
    else if(th==='cave'){tri('#6a4434',22,22,28,10,34,22);ell('#e0703a',28,11,2,1);}
    else if(th==='void'){ell('#5fc9a0',30,28,4,2);}
    x.strokeStyle='#8a6236';x.lineWidth=Math.max(1.5,u*1.6);x.setLineDash([u*2.2,u*1.4]);x.beginPath();x.moveTo(2*u,30*u);x.quadraticCurveTo(18*u,20*u,38*u,27*u);x.stroke();x.setLineDash([]);
    for(let i=0;i<7;i++){const a=4+R()*32,b=14+R()*22;if(Math.abs(b-(30-(a/38)*4-Math.sin(a/38*Math.PI)*6))<3)continue;tree(a,b,2.2+R()*1.4);}
    for(let i=0;i<10;i++)f(L[2],3+R()*34,16+R()*20,.8,.8);}
  else if(kind==='town'){const T=THEME[th]||THEME.meadow,roofs=(T.roof||['#a84a3a','#4a6aa8','#8a5a2a','#4a4a6a']);
    ell(shade(L[0],.88),20,27,17,9);x.strokeStyle='rgba(90,64,34,.6)';x.lineWidth=Math.max(1,u*.8);x.beginPath();x.ellipse(20*u,27*u,16*u,8.5*u,0,0,7);x.stroke();
    const H=[[8,22,7],[20,18,9],[30,23,7],[14,30,7],[26,31,8]];
    H.forEach(([a,b,ww],i)=>{const hh=ww*.62,r=roofs[i%roofs.length];f(ink,a-ww/2-.4,b-hh-.4,ww+.8,hh+.8);f(th==='snow'?'#e8e4dc':'#efe0bc',a-ww/2,b-hh,ww,hh);
      tri(ink,a-ww/2-1.2,b-hh+.4,a,b-hh-ww*.55-.6,a+ww/2+1.2,b-hh+.4);tri(r,a-ww/2-.6,b-hh,a,b-hh-ww*.5,a+ww/2+.6,b-hh);if(th==='snow')tri('#ffffff',a-ww*.22,b-hh-ww*.26,a,b-hh-ww*.5,a+ww*.22,b-hh-ww*.26);
      f('#5a3a20',a-.7,b-2.2,1.4,2.2);f('#ffd98a',a-ww/2+1,b-hh+1.2,1.3,1.3);});
    f('#3a2a1a',20,6,.5,8);f('#c0392b',20.5,6,4,2.4);}
  else if(kind==='dungeon'){const D=(typeof DTHEME!=='undefined'&&DTHEME[th])||{acc:'#c89aff'},lit=st==='lit';
    ell('rgba(40,26,14,.25)',20,33,13,3);f(ink,11,13,18,21);f('#5e5868',12,14,16,19);f('#4a4452',12,14,3,19);for(let i=0;i<4;i++)f('#5e5868',12+i*4.4,11,2.6,3.4);
    f('#0c0810',17,23,6,10);ell('#0c0810',20,23,3,2.6);f('#7a7486',12,20,16,.8);
    if(lit){const g=x.createRadialGradient(20*u,6*u,1,20*u,6*u,9*u);g.addColorStop(0,'rgba(255,230,120,.95)');g.addColorStop(1,'rgba(255,200,80,0)');x.fillStyle=g;x.fillRect(11*u,-3*u,18*u,18*u);tri('#ffb03a',20,1,17.5,9,22.5,9);tri('#fff0a0',20,4,18.8,9,21.2,9);}
    else{ell(D.acc,20,27,1.4,1.4);f(D.acc,14,17,1,2);f(D.acc,25,17,1,2);}}
  else if(kind==='cave'){ell('rgba(40,26,14,.25)',20,33,14,3);ell('#6a6470',20,26,14,10);ell('#8a8494',20,24,11,8);ell('#0a070c',20,29,5.5,6);f('#0a070c',14.5,29,11,4);
    f('#9ad0ff',17,32,6,.8);tree(6,33,2.4);tree(34,32,2.2);}
  else if(kind==='fort'){ell('rgba(40,26,14,.25)',20,34,15,3);f(ink,7,13,26,21);f('#7a7a86',8,18,24,15);f('#5a5a66',8,12,7,21);f('#5a5a66',25,12,7,21);
    for(let i=0;i<3;i++){f('#5a5a66',8+i*2.4,10,1.6,2.4);f('#5a5a66',25+i*2.4,10,1.6,2.4);}f('#c0392b',10,17,3,7);f('#c0392b',27,17,3,7);f('#ffd04a',10.8,18.5,1.4,1.4);f('#ffd04a',27.8,18.5,1.4,1.4);
    f('#120c10',17,24,6,9);ell('#120c10',20,24,3,2.4);for(let i=0;i<3;i++)f('#3a2a1a',17.8+i*1.8,23,.5,10);}
  if(st==='done'){ell('#2f7a3a',33,8,4.4,4.4);x.strokeStyle='#ffffff';x.lineWidth=Math.max(1.4,u*1.1);x.beginPath();x.moveTo(30.6*u,8*u);x.lineTo(32.4*u,10*u);x.lineTo(35.6*u,6*u);x.stroke();}});}
// clouds over a place the party has not been to yet
function wmFog(s){return wmSpr('fog:'+s,s,s,(x,w,h)=>{const R=wmRng('fog'+s);for(let i=0;i<9;i++){const cx=w*(.2+R()*.6),cy=h*(.3+R()*.45),r=w*(.16+R()*.12);
  const g=x.createRadialGradient(cx,cy,r*.2,cx,cy,r);g.addColorStop(0,'rgba(250,246,236,.96)');g.addColorStop(.7,'rgba(236,228,210,.85)');g.addColorStop(1,'rgba(236,228,210,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();}
  x.strokeStyle='rgba(120,100,80,.35)';x.lineWidth=1;for(let i=0;i<3;i++){const cx=w*(.3+R()*.4),cy=h*(.35+R()*.3);x.beginPath();x.arc(cx,cy,w*.12,Math.PI*1.1,Math.PI*1.9);x.stroke();}});}
function wmPin(x,cx,cy,r){x.save();x.fillStyle='rgba(40,20,10,.3)';x.beginPath();x.ellipse(cx,cy+1,r*.7,r*.25,0,0,7);x.fill();
  x.fillStyle='#8a1a1a';x.beginPath();x.moveTo(cx,cy);x.lineTo(cx-r*.55,cy-r*1.3);x.arc(cx,cy-r*1.6,r*.62,Math.PI*.82,Math.PI*.18,false);x.closePath();x.fill();
  x.fillStyle='#e04a3a';x.beginPath();x.arc(cx,cy-r*1.62,r*.5,0,7);x.fill();x.fillStyle='#fff4d8';x.beginPath();x.arc(cx-r*.15,cy-r*1.75,r*.18,0,7);x.fill();x.restore();}
function wmLabel(x,txt,cx,cy,fs,col,bold){x.font=`${bold?800:700} ${fs}px Nunito,sans-serif`;x.textAlign='center';x.textBaseline='middle';const w=x.measureText(txt).width+fs*.9,h=fs*1.45;
  x.fillStyle='rgba(248,238,212,.92)';x.strokeStyle='rgba(90,58,26,.75)';x.lineWidth=1;const rx=cx-w/2,ry=cy-h/2,r=h/2;x.beginPath();x.moveTo(rx+r,ry);x.arcTo(rx+w,ry,rx+w,ry+h,r);x.arcTo(rx+w,ry+h,rx,ry+h,r);x.arcTo(rx,ry+h,rx,ry,r);x.arcTo(rx,ry,rx+w,ry,r);x.closePath();x.fill();x.stroke();
  x.fillStyle=col||'#3a2614';x.fillText(txt,cx,cy+.5);return w;}
function wmShown(gr){const byId={};gr.nodes.forEach(n=>byId[n.id]=n);const show={};gr.nodes.forEach(n=>{if(n.seen)show[n.id]=2;});
  gr.edges.forEach(e=>{if(show[e.a]===2&&!show[e.b]&&byId[e.b].kind!=='dungeon'&&byId[e.b].kind!=='cave'&&byId[e.b].kind!=='fort')show[e.b]=1;});return {byId,show};}
function wmName(n,full){if(!full)return n.locked?'Sealed: unexplored':'Unexplored';return n.label+(n.kind==='fort'?' (fortress)':n.kind==='cave'?' (cave)':n.kind==='dungeon'?(n.cleared?' (relit)':' (dungeon)'):'');}
function drawWorldMap(){
  const cv=document.getElementById('wmap');if(!cv||!G)return;
  const gr=worldGraph(),here=WS.m?(WS.m.id[0]==='g'?'f'+WS.m.s:WS.m.id):null;
  const {byId,show}=wmShown(gr),nodes=gr.nodes.filter(n=>show[n.id]);if(!nodes.length)return;
  const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const box=cv.parentElement,maxW=Math.min(980,(box.clientWidth||340)-8),vh=window.innerHeight||600,maxH=Math.max(200,vh*(vh<500?.72:.62));
  const pad=.55,gw=x1-x0+1+pad*2,gh=y1-y0+1+pad*2,C=WMAP.cell,lo=vh<500?C[2]:C[0],cell=Math.floor(Math.max(lo,Math.min(maxW/gw,maxH/gh,C[1])));// short (landscape) screens: smaller places, the whole map in view
  const cw=Math.round(gw*cell),ch=Math.round(gh*cell),dpr=Math.min(2,window.devicePixelRatio||1),W=Math.round(cw*dpr),H=Math.round(ch*dpr);
  cv.width=W;cv.height=H;cv.style.width=cw+'px';cv.style.height=ch+'px';cv.style.maxWidth='100%';cv.style.height='auto';cv.style.aspectRatio=cw+'/'+ch;cv.style.imageRendering='auto';
  const x=cv.getContext('2d'),c=cell*dpr,ctr=n=>[(n.x-x0+.5+pad)*c,(n.y-y0+.5+pad)*c];x.imageSmoothingEnabled=true;
  x.drawImage(wmPaper(W,H),0,0);
  // soft realm colour washes under each realm's places, then the roads
  nodes.forEach(n=>{const [cx,cy]=ctr(n),L=WM_LAND[wmTheme(n.stage||0)]||WM_LAND.meadow,g=x.createRadialGradient(cx,cy,c*.1,cx,cy,c*.78);g.addColorStop(0,L[0]+'90');g.addColorStop(1,L[0]+'00');x.fillStyle=g;x.fillRect(cx-c,cy-c,c*2,c*2);});
  gr.edges.forEach(e=>{if(!show[e.a]||!show[e.b])return;const a=byId[e.a],b=byId[e.b],[ax,ay]=ctr(a),[bx,by]=ctr(b),dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1,R=wmRng(e.a+e.b),bend=(R()-.5)*.35*l;
    const mx=(ax+bx)/2-dy/l*bend,my=(ay+by)/2+dx/l*bend,unk=show[e.a]===1||show[e.b]===1;
    x.lineCap='round';x.strokeStyle='rgba(248,236,206,.85)';x.lineWidth=Math.max(3,c/11);x.setLineDash([]);x.beginPath();x.moveTo(ax,ay);x.quadraticCurveTo(mx,my,bx,by);x.stroke();
    x.strokeStyle=e.locked?'#9a3a2a':unk?'rgba(110,80,46,.55)':'#7a5228';x.lineWidth=Math.max(1.6,c/26);x.setLineDash(e.locked||unk?[c/14,c/18]:[c/9,c/22]);x.beginPath();x.moveTo(ax,ay);x.quadraticCurveTo(mx,my,bx,by);x.stroke();x.setLineDash([]);
    if(e.locked){const qx=(ax+2*mx+bx)/4,qy=(ay+2*my+by)/4,r=Math.max(5,c*.09);x.fillStyle='#f4e6c4';x.strokeStyle='#9a3a2a';x.lineWidth=Math.max(1.5,c/40);x.beginPath();x.arc(qx,qy,r,0,7);x.fill();x.stroke();
      x.beginPath();x.moveTo(qx-r*.5,qy-r*.5);x.lineTo(qx+r*.5,qy+r*.5);x.moveTo(qx+r*.5,qy-r*.5);x.lineTo(qx-r*.5,qy+r*.5);x.stroke();}});
  // the places
  const vs=Math.round(c*WMAP.vig),showNames=cell>=WMAP.names,fs=Math.max(9,Math.min(15,Math.round(cell/8.5)))*dpr;WMS.hit=[];
  nodes.forEach(n=>{const [cx,cy]=ctr(n),full=show[n.id]===2,th=wmTheme(n.stage||0),st=n.kind==='dungeon'&&n.cleared?'lit':(n.kind==='cave'||n.kind==='fort')&&n.done?'done':'';
    x.drawImage(wmVignette(n.kind,th,vs,st),Math.round(cx-vs/2),Math.round(cy-vs/2));
    if(!full){const fg=wmFog(vs);x.drawImage(fg,Math.round(cx-vs/2),Math.round(cy-vs/2));x.fillStyle='#6a4a2a';x.font=`800 ${Math.round(vs*.34)}px Nunito,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText('?',cx,cy+vs*.02);}
    WMS.hit.push({id:n.id,x:cx,y:cy,r:vs*.5,label:wmName(n,full)});
    if(showNames&&full&&n.id!==WMS.sel)wmLabel(x,n.label,cx,cy+vs*.5+fs*.2,Math.round(fs*.9),'#3a2614',false);});
  // the party, then the tapped place's name on top
  const H0=nodes.find(n=>n.id===here);if(H0){const [cx,cy]=ctr(H0);wmPin(x,cx+vs*.22,cy-vs*.08,Math.max(6,vs*.16));{const f2=Math.round(fs*.85);x.font=`800 ${f2}px Nunito,sans-serif`;const tw=x.measureText('You').width+f2*.9;wmLabel(x,'You',cx+vs*.22+Math.max(6,vs*.16)*.7+tw/2,cy-vs*.08-Math.max(6,vs*.16)*1.6,f2,'#8a1a1a',true);}}
  if(WMS.sel){const h=WMS.hit.find(o=>o.id===WMS.sel);if(h)wmLabel(x,h.label,h.x,h.y+h.r+fs*.3,Math.round(fs*1.05),'#3a2614',true);}
  wmCompass(x,W-c*.42,H-c*.42,Math.max(10,c*.22));
  WMS.cell=cell;WMS.dpr=dpr;WMS.n=nodes.length;}
// legend icons: the same sprites, small
function wmLegendDraw(){document.querySelectorAll('canvas.wml').forEach(c=>{const x=c.getContext('2d'),k=c.dataset.k,s=c.width;x.clearRect(0,0,s,s);
  if(k==='you'){wmPin(x,s/2,s*.86,s*.3);return;}if(k==='fog'){x.drawImage(wmVignette('field','meadow',s,''),0,0);x.drawImage(wmFog(s),0,0);x.fillStyle='#6a4a2a';x.font=`800 ${Math.round(s*.4)}px Nunito,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText('?',s/2,s/2);return;}
  if(k==='sealed'){x.strokeStyle='#9a3a2a';x.lineWidth=2;x.setLineDash([4,3]);x.beginPath();x.moveTo(2,s/2);x.lineTo(s-2,s/2);x.stroke();x.setLineDash([]);x.fillStyle='#f4e6c4';x.beginPath();x.arc(s/2,s/2,s*.2,0,7);x.fill();x.stroke();return;}
  const [kind,st]=k.split(':');x.drawImage(wmVignette(kind,'meadow',s,st||''),0,0);});}
function mWorldMap(){
  setTimeout(()=>{drawWorldMap();wmLegendDraw();},0);
  const L=[['town','Town'],['field','Field'],['dungeon','Dungeon'],['dungeon:lit','Relit dungeon'],['cave','Side cave'],['fort','Fortress'],['cave:done','Looted'],['you','You'],['fog','Not visited yet'],['sealed','Sealed gate']];
  return `<div class="modal mapmodal" data-act="xClose"><div class="panel box mapbox wmbox"><div class="mh"><h2>World map</h2></div>
    <canvas id="wmap" class="fmap wmap" data-act="wmTap" aria-label="World map"></canvas>
    <div class="maplegend wmlegend">${L.map(([k,n])=>`<span><canvas class="wml" data-k="${k}" width="28" height="28"></canvas> ${n}</span>`).join('')}</div>
    <div class="btnrow" id="wmgo"></div>
    <p class="note">Tap a place to see its name. Roads follow the gates, so a gate on the north edge leads up the map. Places appear as you find them; side caves and fortresses are optional. Tap outside the map to close.</p></div></div>`;
}
// a tap on the map shows that place's name (and does not close the map); a tap on empty parchment hides it again
document.addEventListener('pointerdown',e=>{if(e.target&&e.target.id==='wmap')WMS.pt={x:e.clientX,y:e.clientY,t:Date.now()};},true);
ACT.wmTap=function(arg,el){const cv=el||document.getElementById('wmap');if(!cv)return;const p=WMS.pt;if(!p)return;const r=cv.getBoundingClientRect();if(!r.width)return;
  const px=(p.x-r.left)*cv.width/r.width,py=(p.y-r.top)*cv.height/r.height;let best=null,bd=1e9;WMS.hit.forEach(o=>{const d=Math.hypot(o.x-px,o.y-py);if(d<o.r*1.1&&d<bd){bd=d;best=o;}});
  WMS.sel=best?(WMS.sel===best.id?null:best.id):null;drawWorldMap();if(typeof sfx==='function'&&best)sfx('blip');try{wmGo();}catch(e){}};
{const st=document.createElement('style');st.textContent='.wmbox .wmap{border:2px solid #6a4a24;border-radius:4px;background:#e2cb98;box-shadow:0 2px 10px rgba(0,0,0,.45);cursor:pointer;touch-action:manipulation}.wmlegend .wml{width:28px;height:28px;vertical-align:middle}.wmlegend span{display:inline-flex;align-items:center;gap:4px}';document.head.appendChild(st);}
function openWorldMap(){const prev=V.modal;V.modal={type:'worldmap',from:prev&&prev.type==='map'?prev:{type:'map'}};render();}
ACT.worldMap=function(){if(!G||V.screen!=='world')return;openWorldMap();};
window.addEventListener('resize',()=>{if(V.modal&&V.modal.type==='worldmap')drawWorldMap();});

// =================== Beta v0.7.1: tap the map to walk there ===================
// On the full map (Map button) and on the minimap, a tap on a tile the party has already seen on this map walks the hero there along the
// shortest known route: A* over the real collision grid (8 ways, never cutting a corner, the same rules as a step: diagOk; doors, exits,
// stairs, gates and boss circles are never walked through) and through seen tiles only. A door or building, a shop, an exit, stairs or
// anything solid: the walk stops on the tile in front of it, facing it, and does not go in. The walk is one more movement source (WS.auto,
// source 'auto', after keys, pad, joystick, drag and tap): any other input stops it, so do a random encounter (haltInput), a dialog or
// menu opening, a new map and a way that stays blocked. A tile not seen yet says so. The walk animates like any other. State: WS.auto
// (not saved). Both renderers share it (the maps are 2D overlays; the walk is gameplay).
const AW={unseen:'You have not been there yet.',noway:'There is no way there that you know of.',blocked:'Something blocks the way.'};
const AW_D8=['u','d','l','r','ul','ur','dl','dr'];
// a tile the walk may stand on along the way
function awPass(m,x,y){if(!m||x<0||y<0||x>=m.w||y>=m.h)return false;if(solidAt(m,x,y))return false;if((m.exits||[]).some(e=>e.x===x&&e.y===y))return false;
  if('EXG'.includes(tileAt(m,x,y)))return false;return !(m.bld||[]).some(b=>b.door[0]===x&&b.door[1]===y);}
const awFaceTo=(fx,fy,tx,ty)=>tx>fx?'r':tx<fx?'l':ty>fy?'d':'u';
// where a tap on (tx,ty) ends: the tile itself, or the tiles in front of what is there; [x,y,face]
function awGoal(m,tx,ty){const W=m.w,H=m.h,b=(m.bld||[]).find(b=>tx>=b.x&&tx<b.x+b.w&&ty>=b.y&&ty<b.y+b.h);
  if(b&&b.door)return {what:'door',b,c:[[b.door[0],b.door[1]+1,'u']]};
  const ex=(m.exits||[]).find(e=>e.x===tx&&e.y===ty);
  const around=(x,y)=>[[0,1],[0,-1],[1,0],[-1,0]].map(([a,c])=>[x+a,y+c,awFaceTo(x+a,y+c,x,y)]).filter(([x2,y2])=>awPass(m,x2,y2)||(x2===WS.x&&y2===WS.y));
  if(ex){const v=ex.x===0?[1,0]:ex.x===W-1?[-1,0]:ex.y===0?[0,1]:ex.y===H-1?[0,-1]:[0,0],f=awFaceTo(tx+v[0],ty+v[1],tx,ty),c=[[tx+v[0],ty+v[1],f]].filter(([x,y])=>awPass(m,x,y)||(x===WS.x&&y===WS.y));
    return {what:'exit',c:c.length?c:around(tx,ty)};}
  if(awPass(m,tx,ty)||(tx===WS.x&&ty===WS.y))return {what:'tile',c:[[tx,ty,null]]};
  return {what:'thing',c:around(tx,ty)};}
// A* from the hero to the nearest goal tile; returns {dirs,end:[x,y,face]} or null
function awPath(m,sx,sy,goals){if(!goals.length)return null;const W=m.w,H=m.h,N=W*H,g=new Float64Array(N).fill(Infinity),pv=new Int32Array(N).fill(-1),pd=new Int8Array(N),done=new Uint8Array(N),gk=new Map();
  goals.forEach(q=>gk.set(q[1]*W+q[0],q));const hh=(x,y)=>{let b=1e9;for(const [gx,gy] of goals){const dx=Math.abs(gx-x),dy=Math.abs(gy-y),v=Math.max(dx,dy)+.4142*Math.min(dx,dy);if(v<b)b=v;}return b;};
  const s0=sy*W+sx,hp=p2Heap();g[s0]=0;hp.push([hh(sx,sy),s0]);let end=-1;
  while(hp.n){const [,k]=hp.pop();if(done[k])continue;done[k]=1;if(gk.has(k)){end=k;break;}const x=k%W,y=(k-x)/W;
    for(let i=0;i<8;i++){const d=AW_D8[i],[a,b]=DIRV[d],nx=x+a,ny=y+b;if(nx<0||ny<0||nx>=W||ny>=H)continue;const nk=ny*W+nx;if(done[nk])continue;
      if(!gk.has(nk)&&!(awPass(m,nx,ny)&&isSeen(m,nx,ny)))continue;if(gk.has(nk)&&!awPass(m,nx,ny)&&nk!==s0)continue;
      if(i>=4&&!diagOk(m,x,y,d))continue;const ng=g[k]+(i>=4?1.4142:1);if(ng<g[nk]){g[nk]=ng;pv[nk]=k;pd[nk]=i;hp.push([ng+hh(nx,ny),nk]);}}}
  if(end<0)return null;const dirs=[];for(let k=end;k!==s0;k=pv[k])dirs.unshift(AW_D8[pd[k]]);return {dirs,end:gk.get(end)};}
// plan a walk to a tapped tile: {res:'ok'|'unseen'|'noway'|'here', plan}
function awPlan(m,tx,ty){if(!m||!G||tx<0||ty<0||tx>=m.w||ty>=m.h)return {res:'noway'};if(!isSeen(m,tx,ty))return {res:'unseen'};
  const goal=awGoal(m,tx,ty),here=goal.c.find(([x,y])=>x===WS.x&&y===WS.y);if(here)return {res:'here',face:here[2]};
  const P=awPath(m,WS.x,WS.y,goal.c);if(!P)return {res:'noway'};return {res:'ok',plan:{m:m.id,tx,ty,goals:goal.c,what:goal.what,dirs:P.dirs,end:P.end,at:WS.x+','+WS.y,fails:0}};}
function awGo(p,src){WS.target=null;WS.path=null;WS.touchDir=null;WS.auto=Object.assign(p,{src});WS.autoT=performance.now();}
function awFace(f){if(!f)return;WS.dir=f;if(f==='l'||f==='r')WS.face=f;}
function awStop(why){const A=WS.auto;if(!A)return;WS.auto=null;A.why=why;WS.autoLast=A;if(why==='blocked')toast(AW.blocked);}
// the next step of the walk (called from worldInputDir while the walk is the newest source)
function awNext(){const A=WS.auto,m=WS.m;if(!A||!m||A.m!==m.id){awStop('map');return null;}
  const at=A.goals.find(([x,y])=>x===WS.x&&y===WS.y);if(at){WS.auto=null;A.why='arrived';WS.autoLast=A;awFace(at[2]);return null;}
  let replan=A.at!==WS.x+','+WS.y||!A.dirs.length;
  if(!replan){const d=A.dirs[0],[a,b]=DIRV[d];if(!awPass(m,WS.x+a,WS.y+b)&&!A.goals.some(([x,y])=>x===WS.x+a&&y===WS.y+b)||(d.length===2&&!diagOk(m,WS.x,WS.y,d)))replan=true;}
  if(replan){if(A.at!==WS.x+','+WS.y&&A.lastAt===WS.x+','+WS.y&&++A.fails>3){awStop('blocked');return null;}A.lastAt=WS.x+','+WS.y;
    const P=awPath(m,WS.x,WS.y,A.goals);if(!P){awStop('blocked');return null;}A.dirs=P.dirs;A.end=P.end;}
  const d=A.dirs.shift(),[a,b]=DIRV[d];A.at=(WS.x+a)+','+(WS.y+b);return d;}
{const is0=inputSources;inputSources=function(){const c=is0.apply(this,arguments);if(WS.auto){c.push(['auto',WS.autoT||0]);c.sort((a,b)=>b[1]-a[1]);}return c;};}
{const ia0=inputActive;inputActive=function(){return !!WS.auto||ia0.apply(this,arguments);};}
{const wi0=worldInputDir;worldInputDir=function(){if(!WS.auto)return wi0.apply(this,arguments);const top=(inputSources()[0]||[])[0];
  if(top!=='auto'){awStop('input');return wi0.apply(this,arguments);}return awNext();};}
{const h0=haltInput;haltInput=function(){awStop('halt');return h0.apply(this,arguments);};}
{const wt0=worldTick;worldTick=function(){if(WS.auto&&(V.modal||WS.dlg))awStop(WS.dlg?'dialog':'menu');return wt0.apply(this,arguments);};}
{const pa1=placeAt;placeAt=function(){awStop('map');return pa1.apply(this,arguments);};}
// any key, and any press in the world view that is not a map, stops the walk
window.addEventListener('keydown',e=>{if(WS.auto&&V.screen==='world'&&!e.repeat)awStop('input');},true);
document.addEventListener('pointerdown',e=>{if(!WS.auto||V.screen!=='world')return;const t=e.target;if(t&&t.closest&&t.closest('#mmap,#fmap'))return;awStop('input');},true);
// start a walk from a map tap; returns the result so the caller can say why not
function awTap(m,tx,ty,src,before){const r=awPlan(m,tx,ty);
  if(r.res==='unseen'||r.res==='noway'){if(typeof sfx==='function')sfx('deny');return r;}
  if(before)before();if(r.res==='here'){awFace(r.face);return r;}awGo(r.plan,src);if(typeof sfx==='function')sfx('blip');return r;}
// the full map: a tap on a seen tile closes the map and walks; on an unseen one it says so and the map stays open
const FMT={pt:null};
document.addEventListener('pointerdown',e=>{if(e.target&&e.target.id==='fmap')FMT.pt={x:e.clientX,y:e.clientY};},true);
function fmTile(cv,cx,cy){const m=WS.m,r=cv.getBoundingClientRect();if(!m||!r.width||!r.height)return null;return [Math.floor((cx-r.left)/r.width*m.w),Math.floor((cy-r.top)/r.height*m.h)];}
ACT.fmTap=function(arg,el){const cv=el||document.getElementById('fmap'),p=FMT.pt,m=WS.m;FMT.pt=null;if(!cv||!p||!m||V.screen!=='world')return;const t=fmTile(cv,p.x,p.y);if(!t)return;
  const r=awTap(m,t[0],t[1],'map',()=>{V.modal=null;render();});const n=document.getElementById('fmnote');
  if(n&&(r.res==='unseen'||r.res==='noway')){n.textContent=AW[r.res];n.classList.remove('on');void n.offsetWidth;n.classList.add('on');}};
// the minimap: it takes taps (it used to let them through to the world view)
function mmTile(cv,cx,cy){const m=WS.m,r=cv.getBoundingClientRect();if(!m||!r.width)return null;const sc=4,px=(cx-r.left)*cv.width/r.width,py=(cy-r.top)*cv.height/r.height,
  ox=Math.round(cv.width/2-(WS.x+.5)*sc),oy=Math.round(cv.height/2-(WS.y+.5)*sc);return [Math.floor((px-ox)/sc),Math.floor((py-oy)/sc)];}
document.addEventListener('pointerdown',e=>{const cv=e.target;if(!cv||cv.id!=='mmap'||V.screen!=='world')return;e.preventDefault();e.stopPropagation();
  if(V.modal||WS.dlg||WS.lock||!WS.m)return;const t=mmTile(cv,e.clientX,e.clientY);if(!t)return;const r=awTap(WS.m,t[0],t[1],'mini');
  if(r.res==='unseen'||r.res==='noway')toast(AW[r.res]);},{capture:true,passive:false});
{const st=document.createElement('style');st.textContent='#mmap.mmap{pointer-events:auto;cursor:pointer;touch-action:none}.fmap[data-act]{cursor:pointer;touch-action:manipulation}.fmnote{min-height:1.2em;margin:2px 0 0;text-align:center;color:#ffd98a}.fmnote.on{animation:fmn .9s ease}@keyframes fmn{0%{opacity:0}20%{opacity:1}}';document.head.appendChild(st);}
// the world map: a visited town offers the waystone's own travel when the party stands at a waystone (no new fast travel)
function wmAtStone(){const m=WS.m;if(!m)return false;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)if(tileAt(m,WS.x+a,WS.y+b)==='W')return true;return false;}
function wmGo(){const el=document.getElementById('wmgo');if(!el)return;const id=WMS.sel,s=id&&/^t\d$/.test(id)?+id.slice(1):null;
  if(s==null||!(G.visited||[]).includes(s)||G.daily||(WS.m&&WS.m.id==='t'+s)){el.innerHTML='';return;}
  el.innerHTML=wmAtStone()?`<button class="btn sm gold" data-act="travel" data-arg="${s}">Travel to ${esc(ZS(s).town)}</button>`:`<small class="note">A waystone can carry you to ${esc(ZS(s).town)}.</small>`;}
