// ===== sites.js (v0.4.1): side caves, side sanctums, minibosses =====
// Side caves get their own look (mossy rock palette, damp green light, drips) and their own music, so they never read as a main dungeon.
// Side sanctums are a second optional site type in new journeys (stages 1 to 4): bigger than a cave, smaller than a main dungeon,
// built as a walled keep (stone walls, a courtyard, barracks rooms, banners and braziers, a keep holding the prize), with a gatehouse
// entrance drawn on the field that looks unlike both a cave mouth and a dungeon facade. Both are marked on the map once found and are
// never needed to progress. Legendaries never come from them.
// Minibosses: about 90% of caves and sanctums (seeded per site) have a capstone fight guarding the prize. Opening the prize chest
// wakes it; win and the prize is yours plus a bonus. Minibosses can never be auto battled.
// SITES: in config.js
const FORT_NAMES=['Briarwatch Sanctum','Saltmarch Sanctum','Emberwall Sanctum','Frostcrag Sanctum','Duskspire Sanctum'];
const FORT_CHARMS={0:'c_ft0',1:'c_ft1',2:'c_ft2',3:'c_ft3',4:'c_ft4'};
[['c_ft0','Briarwatch Sigil',{hp:150,atk:12,def:8}],['c_ft1','Saltmarch Seal',{mp:70,res:14,def:8}],['c_ft2','Emberwall Badge',{atk:18,spd:6}],['c_ft3','Frostcrag Token',{def:16,hp:110}],['c_ft4','Duskspire Crest',{mag:16,spd:8,mp:50}]]
  .forEach(([id,n,st],i)=>addGear(id,Object.assign({n,slot:'c',tier:3,price:900+i*80,unique:1},st)));
// ---------- looks ----------
function siteVariant(theme,kind){const id=theme+'#'+kind;if(DTHEME[id])return id;const D=DTHEME[theme];if(!D)return theme;
  const DV=Object.assign({},D);
  if(kind==='cave'){DV.f=lerpArr(D.f,'#4a5a3a',.45);DV.w=lerpArr(D.w,'#33402c',.55);DV.top='#070c06';DV.acc='#7af0a0';DV.acc2='#c0e870';DV.name='cave';}
  else{DV.f=lerpArr(D.f,'#8a8a90',.6);DV.w=lerpArr(D.w,'#6a6a74',.65);DV.top='#121216';DV.acc='#c0392b';DV.acc2='#ffd04a';DV.name='fort';}
  DTHEME[id]=DV;if(!THEME[id])THEME[id]=THEME[theme];return id;}
{const ab1=applyBossTheme;applyBossTheme=function(m){ab1.apply(this,arguments);try{if(m&&m.cave){m.thv=siteVariant(m.theme,m.fort?'fort':'cave');
  m.amb=m.fort?'flecks':'drips';m.btint=m.fort?'rgba(140,60,40,.04)':'rgba(40,90,60,.07)';m.motif=null;}}catch(e){}};}
// cave drips: a light, falling-water particle layer
{const tf0=themeFX;themeFX=function(ctx,m,vw,vh,now){if(m&&m.amb==='drips'){if(m.btint){ctx.fillStyle=m.btint;ctx.fillRect(0,0,vw,vh);}const still=typeof reducedMotion==='function'&&reducedMotion(),t=still?0:now/1000;
  for(let i=0;i<14;i++){const x=(i*97+13)%vw,y=((i*61+7)+t*60*(1+i%3*.3))%vh;ctx.fillStyle='rgba(170,230,200,.55)';ctx.fillRect(Math.floor(x),Math.floor(y),1,3);}return;}return tf0.apply(this,arguments);};}
{const mf0=musicFor;musicFor=function(){const m=WS.m;if(m&&m.cave)return m.fort?'fort':'cave';return mf0.apply(this,arguments);};}
if(typeof MOODS!=='undefined'){MOODS.cave={bpm:72,sc:'minor',prog:[0,5,0,3],lead:'triangle',dr:0,feel:.3,low:1};MOODS.fort={bpm:108,sc:'harm',prog:[0,4,5,4],lead:'square',dr:2,feel:.6};}

// ---------- sanctum map ----------
function buildFort(R,s){const W=SITES.fortW,H=SITES.fortH,D=new Gr(W,H,'#');
  const start={x:2,y:ri2(R,15,H-21),w:8,h:6},yard={x:16,y:12,w:26,h:16},keep={x:W-14,y:13,w:11,h:14};
  [start,yard,keep].forEach(r=>D.rect(r.x,r.y,r.w,r.h,'.'));
  const bar=[];for(let i=0;i<3;i++){bar.push({x:17+i*9,y:2,w:7,h:6});bar.push({x:17+i*9,y:H-8,w:7,h:6});}bar.forEach(r=>D.rect(r.x,r.y,r.w,r.h,'.'));
  const cy=start.y+3;D.hline(start.x+start.w,yard.x,cy,'.');D.hline(start.x+start.w,yard.x,cy+1,'.');// gate road, two wide
  const ky=keep.y+7;D.hline(yard.x+yard.w,keep.x,ky,'.');// a single door into the keep
  bar.forEach(r=>{const x=r.x+3;if(r.y<yard.y)D.vline(x,r.y+r.h,yard.y,'.');else D.vline(x,yard.y+yard.h,r.y,'.');});
  // courtyard pillars and banners, braziers at the keep door
  for(let i=0;i<3;i++){D.put(yard.x+4+i*8,yard.y+3,'P');D.put(yard.x+4+i*8,yard.y+yard.h-4,'P');}
  D.put(keep.x-1,ky-1,'v');D.put(keep.x-1,ky+1,'v');D.put(keep.x+1,keep.y+1,'v');D.put(keep.x+keep.w-2,keep.y+1,'v');
  const sc=[start.x+3,start.y];D.put(sc[0],sc[1],'E');
  const chests=[],pc=[keep.x+Math.floor(keep.w/2),keep.y+Math.floor(keep.h/2)];D.put(pc[0],pc[1],'C');chests.push([pc[0],pc[1],'reward']);
  bar.forEach((r,i)=>{if(R()<.6){const x=r.x+(i%2?r.w-1:0),y=r.y+(r.y<yard.y?0:r.h-1);if(D.get(x,y)==='.'){D.put(x,y,'C');chests.push([x,y]);}}});
  // v0.12 (new journeys): the keep is a sacred hall. The guardian's spot is an 'X' tile (solid, drawn as a rune circle) just north of the
  // prize chest; pillars ring it, braziers and more pillars line the aisle. Fixed positions (no random draws), the aisle row stays open.
  let guard=null;if(typeof lay3On==='function'&&lay3On()){const gx=pc[0],gy=pc[1]-1;guard=[gx,gy];D.put(gx,gy,'X');
    [[-3,0],[3,0]].forEach(([i,j])=>D.put(gx+i,gy+j,'P'));
    [[-3,-3],[3,-3],[-3,4],[3,4]].forEach(([i,j])=>D.put(gx+i,gy+j,'v'));
    [[-2,-5],[2,-5],[-2,6],[2,6],[-4,-1],[4,-1],[-4,3],[4,3]].forEach(([i,j])=>{if(D.get(gx+i,gy+j)==='.')D.put(gx+i,gy+j,'P');});}
  return {rows:D.g,start:[sc[0],sc[1]+1],chests,prize:pc,guard};}
function genFort(s){for(let a=0;a<40;a++){const R=mulberry(G.run.seed+7313+s*71+a*131),c=buildFort(R,s);if(caveOk(c))return c;}throw new Error('sanctum generation failed');}
function buildFortMap(id){const s=+id.slice(1),c=genFort(s),Z=ZS(s);const m={id,z:s,s,kind:'dungeon',theme:Z.theme,exits:[],npcs:[],bld:[],signs:{},t:c.rows,start:c.start,bossAt:null,chests:c.chests,
  wander:[c.start[0],c.start[1]+1],cave:true,fort:true,name:FORT_NAMES[s],fixed:{},prize:c.prize,guardAt:c.guard||null,hall:c.guard?1:0,open:(hashS(id+':'+G.run.seed)&1)?1:0};/* v0.12: about half of the Sanctums are open to the sky (weather and day/night show); the rest read Indoors */m.w=m.t[0].length;m.h=m.t.length;return m;}
// sanctum gatehouse on the field: a clearing far from the dungeon, the cave and the gates, reachable before the sealed gate
function fortWanted(s){return isRv2()&&s>=1;}
function placeFort(f,s){if(!f||f.kind!=='field'||f.fortDone||!fortWanted(s))return;f.fortDone=1;if((f.caves||[]).some(c=>c.kind==='fort'))return;
  const g=f.t,H=g.length,W=g[0].length,st=f.gates&&f.gates.start&&f.gates.start.arrive||[2,f.sy||2];
  const D=g.map(r=>r.map(()=>-1)),Q=[st];D[st[1]][st[0]]=0;for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(nx<0||ny<0||nx>=W||ny>=H||D[ny][nx]>=0)continue;const c=g[ny][nx];if(SOLID.includes(c)||c==='G')continue;D[ny][nx]=D[y][x]+1;Q.push([nx,ny]);}}
  const far=(x,y,p,d)=>!p||Math.abs(x-p[0])+Math.abs(y-p[1])>=d,cands=[];
  for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){let ok=true;for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=1&&ok;i++){if(!'.,f'.includes(g[y+j][x+i]))ok=false;}
    if(!ok||D[y+1]==null||D[y+2]==null||D[y+2][x]<0)continue;if(!'.,f'.includes(g[y+2][x]))continue;
    if(!far(x,y,f.ent,18)||(f.caves||[]).some(c=>!far(x,y,[c.x,c.y],14))||(f.exits||[]).some(e=>!far(x,y,[e.x,e.y],10))||(f.chests||[]).some(c=>!far(x,y,c,3)))continue;cands.push([x,y,D[y+2][x]]);}
  if(!cands.length)return;cands.sort((a,b)=>b[2]-a[2]);
  // v0.11.1 (new journeys): the Sanctum sits in the middle third of the route (walking distance to the far gate)
  if(typeof lay3On==='function'&&lay3On()){let dEnd=1;D.forEach(r=>r.forEach(v=>{if(v>dEnd)dEnd=v;}));/* the farthest walkable tile before the sealed gate: the route's end */
    const mid=cands.filter(c=>c[2]>=dEnd/3&&c[2]<=dEnd*2/3).sort((a,b)=>Math.abs(a[2]-dEnd/2)-Math.abs(b[2]-dEnd/2));if(mid.length){cands.length=0;mid.forEach(c=>cands.push(c));}}const R=mulberry(G.run.seed+919+s*13),pick2=cands[Math.floor(R()*Math.min(12,cands.length))],[x,y]=pick2;
  g[y-1][x-1]='U';g[y-1][x]='U';g[y-1][x+1]='U';g[y][x-1]='U';g[y][x+1]='U';g[y][x]='E';
  f.caves=f.caves||[];f.caves.push({x,y,id:'o'+s,kind:'fort',face:[0,1],out:[x,y+1]});f.fortAt=[x,y];
  if(typeof mapIssues==='function'&&mapIssues(f).length){// undo if it blocks anything
    g[y-1][x-1]=g[y-1][x]=g[y-1][x+1]=g[y][x-1]=g[y][x+1]=g[y][x]=',';f.caves=f.caves.filter(c=>c.id!=='o'+s);f.fortAt=null;}}
HOOK.wrap('getMap','sites','sanctum maps; place the sanctum on its field',function(next,...a){let id=a[0];if(id&&id[0]==='o'&&!MAPS[id]&&G&&G.run){const fm=MAPS[id]=buildFortMap(id);try{applyBossTheme(fm);if(typeof healMap==='function')healMap(fm);}catch(e){}try{if(typeof guardPaths==='function'&&!window.__PGOFF){fm.__guarded=true;guardPaths(fm);}}catch(e){}}const m=next(...a);
  try{if(m&&m.kind==='field'&&m.part!==1&&!m.fortDone)placeFort(m,m.s);}catch(e){}return m;});
// v0.12: the Sanctum entrance on the field is a SHRINE, not a keep: a stone stair climbing to a pillared gate with a glowing rune arch,
// hanging lanterns, a pediment with a sun rune, and a ring of low standing stones and candles on the ground in front. Same 3 x 2 tile
// footprint as before (the 'U' tiles and the 'E' door), so nothing about reachability changes. It is painted into the field's base layer
// (so heroes and townsfolk always draw in front of it). A Den mouth is a mossy rock arch and a lair a clawed hill: neither has pillars,
// stairs or this cold white-blue rune light.
function drawGatehouse(ctx,x,y){drawShrineRing(ctx,x,y);drawShrineFront(ctx,x,y);}
function drawShrineRing(ctx,x,y){
  const f=(c,a,b,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+a,y+b,w,h);};
  // the ring of standing stones and candles on the ground in front (flat, walkable): drawn first, under everything
  ctx.fillStyle='rgba(20,24,40,.22)';ctx.beginPath();ctx.ellipse(x+24,y+36,31,9,0,0,7);ctx.fill();
  for(let i=0;i<12;i++){const t=Math.PI*(.12+i/11*.76),sx=Math.round(24+Math.cos(t)*30),sy=Math.round(36+Math.sin(t)*8);
    if(i%3===1){f('#2a2230',sx-1,sy-1,3,1);f('#ffd070',sx,sy-2,1,2);f('#fff6c8',sx,sy-3,1,1);ctx.fillStyle='rgba(255,208,112,.22)';ctx.beginPath();ctx.arc(x+sx+.5,y+sy-2,3.5,0,7);ctx.fill();}
    else{f('#4a4658',sx-1,sy-3,3,4);f('#8c889a',sx-1,sy-3,3,1);f('#6a667a',sx-1,sy-2,1,3);}}
}
function drawShrineFront(ctx,x,y){
  const f=(c,a,b,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+a,y+b,w,h);};
  // the stone stair: four steps widening toward the front, rune notches on the risers
  for(let i=0;i<4;i++){const w=14+i*3,yy=TS+14+i*4;f('#6a6678',24-w/2-1,yy,w+2,5);f('#aaa6b4',24-w/2,yy,w,2);f('#7a7688',24-w/2,yy+2,w,2);f('#3a3648',24-w/2,yy+4,w,1);
    if(i>0){f('#8ae8ff',22,yy+3,1,1);f('#8ae8ff',25,yy+3,1,1);}}
  // the back wall (dark, cool) and the doorway with the glowing arch
  f('#3a3a4e',9,-2,30,TS*2-2);f('#4a4a60',10,-1,28,2);f('#26263a',11,2,26,TS*2-8);
  ctx.fillStyle='#0a0c1a';ctx.beginPath();ctx.moveTo(x+16,y+TS+14);ctx.lineTo(x+16,y+11);ctx.quadraticCurveTo(x+24,y-2,x+32,y+11);ctx.lineTo(x+32,y+TS+14);ctx.fill();
  const gl=ctx.createRadialGradient(x+24,y+TS+4,1,x+24,y+TS+4,16);gl.addColorStop(0,'rgba(150,230,255,.5)');gl.addColorStop(1,'rgba(150,230,255,0)');ctx.fillStyle=gl;ctx.fillRect(x+14,y+8,20,TS+8);
  ctx.strokeStyle='#8ae8ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+16,y+TS+14);ctx.lineTo(x+16,y+11);ctx.quadraticCurveTo(x+24,y-2,x+32,y+11);ctx.lineTo(x+32,y+TS+14);ctx.stroke();
  ctx.strokeStyle='#e8fbff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+17.5,y+TS+10);ctx.lineTo(x+17.5,y+11);ctx.quadraticCurveTo(x+24,y+.5,x+30.5,y+11);ctx.lineTo(x+30.5,y+TS+10);ctx.stroke();
  [[13,16],[11,22],[10,28],[34,16],[36,22],[37,28],[24,0]].forEach(([a,b])=>{f('#8ae8ff',a,b,2,1);f('#8ae8ff',a+(a<24?0:1),b+1,1,2);});// runes on the wall and the keystone sigil
  // the pediment over the gate with its sun rune
  ctx.fillStyle='#5a566a';ctx.beginPath();ctx.moveTo(x+1,y-6);ctx.lineTo(x+24,y-17);ctx.lineTo(x+47,y-6);ctx.fill();
  ctx.fillStyle='#b8b4c4';ctx.beginPath();ctx.moveTo(x+4,y-7);ctx.lineTo(x+24,y-15);ctx.lineTo(x+44,y-7);ctx.lineTo(x+44,y-6);ctx.lineTo(x+4,y-6);ctx.fill();
  f('#d8d4e0',1,-6,46,3);f('#8a869a',1,-3,46,1);f('#fff6c8',23,-12,2,2);f('#ffe08a',22,-11,4,1);f('#ffe08a',23,-13,2,4);
  // two marble pillars with capitals, bases and a rune band, a lantern hung from each side of the arch
  [[2],[38]].forEach(([a])=>{f('#7a768a',a,-8,8,TS*2+6);f('#d8d4e0',a+1,-8,3,TS*2+6);f('#a8a4b6',a+4,-8,2,TS*2+6);f('#5a566a',a+6,-8,2,TS*2+6);
    f('#e8e4f0',a-1,-10,10,3);f('#8a869a',a-1,-7,10,1);f('#5a566a',a-1,TS*2-2,10,4);f('#8a869a',a-1,TS*2-3,10,1);
    f('#8ae8ff',a+2,6,1,3);f('#8ae8ff',a+4,6,1,3);f('#8ae8ff',a+3,10,1,2);f('#8ae8ff',a+2,14,3,1);
    f('#fff6c8',a+3,-12,2,2);ctx.fillStyle='rgba(255,246,200,.28)';ctx.beginPath();ctx.arc(x+a+4,y-11,4,0,7);ctx.fill();});
  [[13],[33]].forEach(([a])=>{f('#2a2230',a+1,3,1,5);f('#2a2230',a-1,8,5,1);f('#ffd070',a,9,3,4);f('#fff6c8',a+1,10,1,2);f('#2a2230',a-1,13,5,1);
    ctx.fillStyle='rgba(255,208,112,.26)';ctx.beginPath();ctx.arc(x+a+1.5,y+11,6,0,7);ctx.fill();});
}
{const bm0=buildMapCanvas;buildMapCanvas=function(m,fr){const c=bm0.apply(this,arguments);try{if(m&&m.kind==='field'&&m.fortAt&&c&&c.getContext){const [fx,fy]=m.fortAt;drawGatehouse(c.getContext('2d'),(fx-1)*TS,(fy-1)*TS);
    m.lights=m.lights||[];/* soft light at night: the two lanterns and the rune arch (also baked as lights in HD-2D) */m.lights.push([fx*TS-2,fy*TS-3,12,'lamp'],[fx*TS+18,fy*TS-3,12,'lamp'],[fx*TS+8,fy*TS+4,16,'cyan']);}
    if(m&&m.fort&&m.hall&&c&&c.getContext)drawHallRunes(c.getContext('2d'),m);}catch(e){}return c;};}
// the sacred hall inside (new journeys): a rune circle on the floor around the guardian's spot
function drawHallRunes(ctx,m){const g=m.guardAt;if(!g)return;const cx=g[0]*TS+8,cy=g[1]*TS+9,D=DTH(m),col='#8ae8ff';
  ctx.save();const gl=ctx.createRadialGradient(cx,cy,2,cx,cy,52);gl.addColorStop(0,'rgba(138,232,255,.4)');gl.addColorStop(1,'rgba(138,232,255,0)');ctx.fillStyle=gl;ctx.fillRect(cx-56,cy-48,112,96);
  for(let ring=0;ring<2;ring++){const rx=ring?44:30,ry=ring?32:21,n=ring?60:40;ctx.globalAlpha=ring?.8:1;
    for(let a=0;a<n;a++){const t=a/n*Math.PI*2;ctx.fillStyle=(a%5===0)?'#e8fbff':col;ctx.fillRect(Math.round(cx+Math.cos(t)*rx),Math.round(cy+Math.sin(t)*ry),1,1);}}
  ctx.globalAlpha=.8;ctx.fillStyle=col;for(let a=0;a<8;a++){const t=a/8*Math.PI*2+.2,rx=37,ry=26.5,px=Math.round(cx+Math.cos(t)*rx),py=Math.round(cy+Math.sin(t)*ry);ctx.fillRect(px-1,py,3,1);ctx.fillRect(px,py-1,1,3);}// rune glyphs between the rings
  ctx.globalAlpha=.5;for(let a=0;a<4;a++){const t=a*Math.PI/2+Math.PI/4;for(let k=0;k<18;k++){const q=k/18;ctx.fillRect(Math.round(cx+Math.cos(t)*30*q*1.1),Math.round(cy+Math.sin(t)*21*q*1.1),1,1);}}// star lines
  ctx.restore();}
// ---------- prizes ----------
function fortReward(s){const kinds=['gear','item','recruit','charm'],k0=kinds[hashS(G.run.seed+'ft'+s)%4];let kind=k0;G.fortWon=G.fortWon||{};
  if(kind==='recruit'){const pool=caveRecruitPool(s).filter(h=>!(LEGEND_IDS||[]).includes(h));if(!pool.length)kind='charm';else{const h=pool[hashS(G.run.seed+'fr'+s)%pool.length];recruit(h,true);G.fortWon[s]='recruit';return `${TPL[h].n} was held in the keep's cells, and asks to join you.`;}}
  G.fortWon[s]=kind;
  if(kind==='gear'){const gid=(hashS('fa'+G.run.seed+s)%2?'a_'+ARM_FAM[CLS_ARM[TPL[G.party[0]].cls]||'medium']:lootBase())+'_'+Math.min(5,s+1)+'+2',g=gearOf(gid)||gearOf(lootBase()+'_'+Math.min(5,s+1)+'+2');G.gear.push(g.id||gid);return `Inside: ${g.n} (${ITEM_TIERS[gTierIdx(g)].n})! It is already forged to +2.`;}
  if(kind==='item'){G.inv.elixir=Math.min(invCap(),(G.inv.elixir||0)+1);G.inv.holywater=Math.min(invCap(),(G.inv.holywater||0)+1);G.inv.plume=Math.min(invCap(),(G.inv.plume||0)+2);return `Inside: ${ITEMS.elixir.n}, ${ITEMS.holywater.n} and 2 x ${ITEMS.plume.n}.`;}
  const cid=FORT_CHARMS[s];G.gear.push(cid);const g=gearOf(cid);return `Inside: the ${g.n} (${ITEM_TIERS[gTierIdx(g)].n}). There is only one of it in the world.`;}
// ---------- minibosses ----------
// v0.11.1: every Den (side cave, id 'k'+stage) ends in a miniboss; Sanctums always did (summon8.js)
function siteHasMini(id){if(String(id)[0]==='k')return true;return (hashS('mini'+id+((G.run&&G.run.seed)||0))%100)<SITES.mini*100;}
// v0.4.3: twenty handmade miniboss designs (own name, look, elements and trait); a journey deals them out without repeats
const MINIS=[
 ['mb_gorehorn','yeti','Gorehorn, Warden of the Drifts',['ice','earth'],'#9a6a5a','thorns'],['mb_mirequeen','dewtoad','The Mire Queen',['water','shadow'],'#4a6a3a','regen'],
 ['mb_slagjaw','slaggolem','Slagjaw the Unquenched',['fire','earth'],'#c04a1a','warded'],['mb_bellwraith','ashwraith','The Bell Wraith',['shadow','light'],'#8a8ab0','frenzy'],
 ['mb_pyreclaw','cinderpup','Pyreclaw, Kennelmaster',['fire'],'#e07a2a','frenzy'],['mb_shellking','shellguard','Old Shellking',['water','earth'],'#5a8aa0','warded'],
 ['mb_gallowcrow','gull','The Gallow Crow',['shadow','wind'],'#3a3a4a','thorns'],['mb_lanternmaw','stareater','Lanternmaw',['light','fire'],'#f0c060','regen'],
 ['mb_rustknight','iceknight','The Rusted Knight',['earth','lightning'],'#9a5a3a','warded'],['mb_stormcrown','thunderhawk','Stormcrown Matriarch',['lightning','wind'],'#c0c0f0','frenzy'],
 ['mb_rootmother','mossling','Rootmother',['earth','water'],'#3a7a3a','regen'],['mb_glasswidow','tidewisp','The Glass Widow',['water','light'],'#a0e0f0','thorns'],
 ['mb_hollowabbot','huskguard','The Hollow Abbot',['shadow'],'#5a4a3a','warded'],['mb_cinderbat','cavebat','Cinderwing Elder',['fire','shadow'],'#a03a2a','frenzy'],
 ['mb_frostmother','frostwolf','Frostmother',['ice'],'#c0d8f0','regen'],['mb_skullbell','gargoyle','Skullbell Sentinel',['earth','shadow'],'#7a7a6a','thorns'],
 ['mb_gloomray','cloudray','The Gloom Ray',['wind','shadow'],'#4a4a7a','frenzy'],['mb_brinehag','crawler','The Brine Hag',['water','shadow'],'#3a6a5a','regen'],
 ['mb_sunscorch','magmaslime','Sunscorch Ooze',['fire','light'],'#ffb040','warded'],['mb_voidcantor','voidspawn','The Void Cantor',['shadow','lightning'],'#5a3a8a','thorns']];
MINIS.forEach(([id,b,n,e,c])=>makeMonVariant(id,b,n,e,c,{mini:1,hp:+((MON[b]||{hp:1}).hp*1.1).toFixed(2)}));
// v0.12: guardians are Scourge sized. Every guardian art joins BIG_ART (battle.js unitBox and monCanvas read MON_SIZE: 60 like a Scourge);
// their code drawn art is the 40 px base monster with a new colour, so monCanvas draws it at its own size and enlarges it 1.5x (nearest
// neighbour) into the 60 px box. The Priest's Invoke summon uses a small alias art (summon8.js sumArt), so it stays the old size.
MINIS.forEach(D=>{if(!BIG_ART.includes(D[0]))BIG_ART.push(D[0]);});
const MINI_BIG=new Set(MINIS.map(D=>D[0]));
{const mc0=monCanvas;monCanvas=function(art){if(!MINI_BIG.has(art))return mc0.apply(this,arguments);
  const i=BIG_ART.indexOf(art);if(i>=0)BIG_ART.splice(i,1);let c;try{c=mc0.call(this,art);}finally{if(i>=0)BIG_ART.splice(i,0,art);}
  const w=Math.round(c.width*1.5),h=Math.round(c.height*1.5),o=mkCv(w,h),x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,0,0,w,h);return o;};}
function miniFor(m){G.miniPick=G.miniPick||{};let i=G.miniPick[m.id];
  if(i==null){const used=new Set(Object.values(G.miniPick)),R=seeded(((G.run&&G.run.seed)||1)^0x31415),order=MINIS.map((_,k)=>k).sort(()=>R()-.5);
    i=order.find(k=>!used.has(k));if(i==null)i=order[Object.keys(G.miniPick).length%order.length];G.miniPick[m.id]=i;}
  const D=MINIS[i];return {mon:D[0],name:D[2],mod:D[5]};}
// the Sanctum's guardian waits on its rune circle until it is beaten: who it is, and how close the hero stands (0..1) for the name tag
function sanctGuard(m){try{if(!m||!m.fort||!m.guardAt||!G||!G.run||G.daily||(G.miniDone&&G.miniDone[m.id])||!siteHasMini(m.id))return null;
  const mb=m._gd||(m._gd=miniFor(m));return {mon:mb.mon,name:mb.name,art:MON[mb.mon].art,x:m.guardAt[0],y:m.guardAt[1]};}catch(e){return null;}}
function sanctNear(g){const d=Math.max(Math.abs(WS.x-g.x),Math.abs(WS.y-g.y));return Math.max(0,Math.min(1,(8-d)/3));}
HOOK.before('openChest','sites','cave reward chests',function(x,y){const m=WS.m;try{if(m&&m.cave&&G&&!G.daily&&(m.chests||[]).some(c=>c[0]===x&&c[1]===y&&c[2]==='reward')&&!G.chests[m.id+':'+x+','+y]){
    G.miniDone=G.miniDone||{};if(siteHasMini(m.id)&&!G.miniDone[m.id]){const mb=miniFor(m);say(null,`Something heavy shifts in the dark. ${mb.name} rises to guard the prize!`,()=>{haltInput();startBattle({stage:m.s,kind:'mini',mini:{id:m.id,mon:mb.mon,name:mb.name,mod:mb.mod}});});return HOOK.stop(undefined);}
    if(m.fort){G.chests[m.id+':'+x+','+y]=1;if(typeof sfx==='function')sfx('chest');rebuildBase();const t=fortReward(m.s);saveGame();say(null,'You open the chest. '+t);return HOOK.stop(undefined);}}}catch(e){}
  });
HOOK.wrap('encounterFoes','sites','miniboss fights',function(next,...a){let spec=a[0];if(!spec||!spec.mini||typeof spec.mini!=='object')return next(...a);
  const s=spec.stage,mi=spec.mini,lv=STAGE_LV[s][1]+SITES.miniLv+ngLvOff(),Z=ZS(s),out=[makeEnemy(MON[mi.mon],lv,{elite:true,name:mi.name,mod:mi.mod,hpM:SITES.miniHp,powM:SITES.miniPow})];
  out.push(makeEnemy(MON[pick(Z.pool)],lv-2));out.push(makeEnemy(MON[pick(Z.pool)],lv-3));return out;});
HOOK.wrap('finishBattle','sites','miniboss prizes',function(next,...a){const how=a[0];const sp=B&&B.spec,mi=sp&&sp.mini&&typeof sp.mini==='object'?sp.mini:null;const r=next(...a);
  try{if(mi&&how==='win'&&G){G.miniDone=G.miniDone||{};G.miniDone[mi.id]=1;const s=sp.stage,g=econG(300+s*250);G.gold+=g;G.mats.core=(G.mats.core||0)+1;G.mats[ZS(s).mat]=(G.mats[ZS(s).mat]||0)+3;saveGame();
    toast(`${mi.name} falls. Bonus: ${g} gold, a Dread Core and 3 ${MATS[ZS(s).mat]}. The prize chest is yours.`);}}catch(e){}return r;});
// map: sanctums get their own marker and name
if(typeof MAPICO_X!=='undefined'){MAPICO_X.fort=[[0,3,10,7,'#7a7a86'],[0,1,3,9,'#5a5a66'],[7,1,3,9,'#5a5a66'],[1,4,1,3,'#c0392b'],[8,4,1,3,'#c0392b'],[4,6,2,4,'#120c10']];MAPICO_NAME.fort='Sanctum';}// v0.6.3: player facing text says sanctum, not side sanctum (ids and save keys unchanged)
