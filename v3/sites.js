// ===== sites.js (v0.4.1): side caves, side sanctums, minibosses =====
// Side caves get their own look (mossy rock palette, damp green light, drips) and their own music, so they never read as a main dungeon.
// Side sanctums are a second optional site type in new journeys (stages 1 to 4): bigger than a cave, smaller than a main dungeon,
// built as a walled keep (stone walls, a courtyard, barracks rooms, banners and braziers, a keep holding the prize), with a gatehouse
// entrance drawn on the field that looks unlike both a cave mouth and a dungeon facade. Both are marked on the map once found and are
// never needed to progress. Legendaries never come from them.
// Minibosses: about 90% of caves and sanctums (seeded per site) have a capstone fight guarding the prize. Opening the prize chest
// wakes it; win and the prize is yours plus a bonus. Minibosses can never be auto battled.
// SITES: in config.js
const FORT_NAMES=['Briarkeep Sanctum','Seamarch Sanctum','Forgewall Sanctum','Hoarcrag Sanctum','Duskhaven Sanctum'];
const FORT_CHARMS={0:'c_ft0',1:'c_ft1',2:'c_ft2',3:'c_ft3',4:'c_ft4'};
[['c_ft0','Briarkeep Sigil',{hp:150,atk:12,def:8}],['c_ft1','Seamarch Seal',{mp:70,res:14,def:8}],['c_ft2','Forgewall Badge',{atk:18,spd:6}],['c_ft3','Hoarcrag Token',{def:16,hp:110}],['c_ft4','Duskhaven Crest',{mag:16,spd:8,mp:50}]]
  .forEach(([id,n,st],i)=>addGear(id,Object.assign({n,slot:'c',tier:3,price:900+i*80,unique:1},st)));
// ---------- looks ----------
function siteVariant(theme,kind){const id=theme+'#'+kind;if(DTHEME[id])return id;const D=DTHEME[theme];if(!D)return theme;
  const DV=Object.assign({},D);
  if(kind==='cave'){DV.f=lerpArr(D.f,'#4a5a3a',.45);DV.w=lerpArr(D.w,'#33402c',.55);DV.top='#070c06';DV.acc='#7af0a0';DV.acc2='#c0e870';DV.name='cave';}
  else{DV.f=lerpArr(D.f,'#8a8a90',.6);DV.w=lerpArr(D.w,'#6a6a74',.65);DV.top='#121216';DV.acc='#c0392b';DV.acc2='#ffd04a';DV.name='fort';}
  DTHEME[id]=DV;if(!THEME[id])THEME[id]=THEME[theme];return id;}
HOOK.after('applyBossTheme','sites','cave and fort variants',function(r,m){try{if(m&&m.cave){m.thv=siteVariant(m.theme,m.fort?'fort':'cave');
  m.amb=m.fort?'flecks':'drips';m.btint=m.fort?'rgba(140,60,40,.04)':'rgba(40,90,60,.07)';m.motif=null;}}catch(e){}});
// cave drips: a light, falling-water particle layer
{const tf0=themeFX;themeFX=function(ctx,m,vw,vh,now){if(m&&m.amb==='drips'){if(m.btint){ctx.fillStyle=m.btint;ctx.fillRect(0,0,vw,vh);}const still=typeof reducedMotion==='function'&&reducedMotion(),t=still?0:now/1000;
  for(let i=0;i<14;i++){const x=(i*97+13)%vw,y=((i*61+7)+t*60*(1+i%3*.3))%vh;ctx.fillStyle='rgba(170,230,200,.55)';ctx.fillRect(Math.floor(x),Math.floor(y),1,3);}return;}return tf0.apply(this,arguments);};}
{const mf0=musicFor;musicFor=function(){const m=WS.m;if(m&&m.cave)return m.fort?'fort':'cave';return mf0.apply(this,arguments);};}
if(typeof MOODS!=='undefined'){MOODS.cave={bpm:72,sc:'minor',prog:[0,5,0,3],lead:'triangle',dr:0,feel:.3,low:1};MOODS.fort={bpm:108,sc:'harm',prog:[0,4,5,4],lead:'square',dr:2,feel:.6};}

// ---------- sanctum map ----------
// v0.14.5: the Sanctum is a SYMMETRIC TEMPLE on one central axis. It is laid out once in a canonical frame and then turned to the way the
// player walks in. Canonical frame: u runs across (0..B-1, the axis is u = cx), v runs along (0..L-1) and the player walks toward +v, i.e.
// down the grid (this is also the layout caveOk checks: the 'E' stair is the tile above the start tile). In the frame:
//   v 1..7    gate hall   u cx-4..cx+4   the stair 'E' at (cx,1), the start tile (cx,2)
//   v 8..10   passage     3 wide (u cx-1..cx+1)
//   v 11..36  nave        u cx-8..cx+8   cloister garden, a colonnade of pillars at cx-6 and cx+6, braziers where the passages open
//   v 12..35  chapels     three barracks each side (u 2..8 and B-9..B-3, 7 wide, 6 deep), each joined to the nave by a corridor
//   v 37..41  passage     3 wide, into the guardian hall
//   v 42..L-3 hall        u cx-7..cx+7   pillars at cx-4 and cx+4, the guardian's rune circle 'X' at (cx,L-4), the prize chest 'C' at (cx,L-3)
// Everything but the optional barracks chests mirrors across u = cx. Then fortTurn rotates it for the facing: the field gate is entered
// walking NORTH (face [0,1]), so by default the start room is at the south edge and the hall at the north edge; a gate that faced
// elsewhere would turn the interior with it (n: hall north, s: hall south, e: hall east, w: hall west).
const FORT_FWD={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]},FORT_FACE={n:'u',s:'d',e:'r',w:'l'};
function fortXf(dir,B,L){return dir==='n'?(u,v)=>[u,L-1-v]:dir==='e'?(u,v)=>[v,u]:dir==='w'?(u,v)=>[L-1-v,u]:(u,v)=>[u,v];}// canonical (u,v) to map (x,y)
function fortInv(dir,B,L){return dir==='n'?(x,y)=>[x,L-1-y]:dir==='e'?(x,y)=>[y,x]:dir==='w'?(x,y)=>[y,L-1-x]:(x,y)=>[x,y];}// map (x,y) to canonical (u,v)
function fortDims(dir,B,L){return dir==='e'||dir==='w'?[L,B]:[B,L];}
function fortDirOf(face){const f=face||[0,1];return f[1]>0?'n':f[1]<0?'s':f[0]>0?'w':'e';}// the gate faces away from the Sanctum; the player walks the other way
function fortDirFor(s){try{const f=getMap('f'+s),c=(f.caves||[]).find(q=>q.id==='o'+s&&q.kind==='fort');if(c&&c.face)return fortDirOf(c.face);}catch(e){}return 'n';}
function buildFort(R,s,dir){const B=SITES.fortH|1,L=SITES.fortW,cx=(B-1)>>1,D=new Gr(B,L,'#');
  const mr=(u,v,w,h)=>{D.rect(u,v,w,h,'.');D.rect(B-u-w,v,w,h,'.');},mp=(u,v,c)=>{D.put(u,v,c);D.put(B-1-u,v,c);};
  const geo={B,L,cx,dir:'s',gate:{u0:cx-4,u1:cx+4,v0:1,v1:7},nave:{u0:cx-8,u1:cx+8,v0:11,v1:36},hall:{u0:cx-7,u1:cx+7,v0:42,v1:L-3},gv:L-4,pv:L-3,rows:[14,23,32]};
  [geo.gate,geo.nave,geo.hall].forEach(r=>D.rect(r.u0,r.v0,r.u1-r.u0+1,r.v1-r.v0+1,'.'));
  D.rect(cx-1,geo.gate.v1+1,3,geo.nave.v0-geo.gate.v1-1,'.');D.rect(cx-1,geo.nave.v1+1,3,geo.hall.v0-geo.nave.v1-1,'.');// the two passages
  for(let k=0;k<3;k++){const v0=12+k*9;mr(2,v0,7,6);D.hline(9,geo.nave.u0-1,v0+2,'.');D.hline(geo.nave.u1+1,B-10,v0+2,'.');}// chapels and their corridors
  [17,24,31].forEach(v=>mp(cx-6,v,'P'));// the colonnade
  mp(cx-2,geo.nave.v0,'v');mp(cx-2,geo.nave.v1,'v');mp(cx-2,geo.hall.v0,'v');// braziers where the passages open
  [45,49,53].forEach(v=>mp(cx-4,v,'P'));// the hall's pillars
  D.put(cx,geo.gate.v0,'E');
  const chests=[],pc=[cx,geo.pv];D.put(pc[0],pc[1],'C');chests.push([pc[0],pc[1],'reward']);
  for(let k=0;k<3;k++)for(let sd=0;sd<2;sd++){if(R()<.6){const x=sd?B-3:2,y=12+k*9+((k+sd)%2?5:0);if(D.get(x,y)==='.'){D.put(x,y,'C');chests.push([x,y]);}}}
  // the guardian's spot is an 'X' tile (solid, drawn as a rune circle) on the axis in front of the prize chest; pillars and braziers ring it
  let guard=null;const gx=cx,gy=geo.gv;if(typeof lay3On==='function'&&lay3On()){guard=[gx,gy];D.put(gx,gy,'X');}
  mp(gx-3,gy,'P');mp(gx-3,gy-3,'v');mp(gx-3,gy+1,'v');
  const c={rows:D.g,start:[cx,geo.gate.v0+1],chests,prize:pc,guard,wander:[cx,geo.gate.v0+2],exit:[cx,geo.gate.v0],geo,dir:'s'};
  return dir&&dir!=='s'?fortTurn(c,dir):c;}
// turn a canonical (walking south) Sanctum so the player walks in the direction dir: the grid and every coordinate
function fortTurn(c,dir){const g=c.geo,B=g.B,L=g.L,xf=fortXf(dir,B,L),[W,H]=fortDims(dir,B,L),rows=[];for(let y=0;y<H;y++)rows.push(Array(W).fill('#'));
  for(let v=0;v<L;v++)for(let u=0;u<B;u++){const [x,y]=xf(u,v);rows[y][x]=c.rows[v][u];}
  const P=p=>p&&xf(p[0],p[1]);
  return {rows,start:P(c.start),chests:c.chests.map(q=>{const p=xf(q[0],q[1]);return q.length>2?[p[0],p[1],q[2]]:p;}),prize:P(c.prize),guard:P(c.guard),wander:P(c.wander),exit:P(c.exit),geo:Object.assign({},g,{dir}),dir};}
function genFort(s,dir){for(let a=0;a<40;a++){const R=mulberry(G.run.seed+7313+s*71+a*131),c=buildFort(R,s);if(caveOk(c))return dir&&dir!=='s'?fortTurn(c,dir):c;}throw new Error('sanctum generation failed');}
function buildFortMap(id){const s=+id.slice(1),dir=fortDirFor(s),c=genFort(s,dir),Z=ZS(s);const m={id,z:s,s,kind:'dungeon',theme:Z.theme,exits:[],npcs:[],bld:[],signs:{},t:c.rows,start:c.start,bossAt:null,chests:c.chests,
  wander:c.wander,cave:true,fort:true,name:FORT_NAMES[s],fixed:{},prize:c.prize,guardAt:c.guard||null,hall:c.guard?1:0,open:(hashS(id+':'+G.run.seed)&1)?1:0,
  fo:c.geo,enterDir:dir,exitAt:c.exit};/* v0.12: about half of the Sanctums are open to the sky (weather and day/night show); the rest read Indoors */m.w=m.t[0].length;m.h=m.t.length;
  /* v0.14.5: the prize chest moved with the new layout; a Sanctum whose prize is already won must not offer it again */try{if(G.fortWon&&G.fortWon[s]){G.chests=G.chests||{};G.chests[id+':'+c.prize[0]+','+c.prize[1]]=1;}}catch(e){}return m;}
// a Sanctum is entered on its stair, facing the way in (the old enterCave stood the hero on the tile above start, facing down)
{const ec0=enterCave;enterCave=function(c,s){const r=ec0.apply(this,arguments);try{const m=c&&c.kind==='fort'&&getMap(c.id);if(m&&m.exitAt&&m.enterDir&&m.enterDir!=='s')placeAt(c.id,m.exitAt[0],m.exitAt[1],FORT_FACE[m.enterDir]||'d');}catch(e){}return r;};}
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
// drawGatehouse, drawShrineRing and drawShrineFront (the v0.12 shrine paint) are owned by sanctlook10.js now (drawShrineFront again by sitelook10.js); the old bodies were dead.
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
 ['mb_pyreclaw','cinderpup','Pyreclaw, Kennelmaster',['fire'],'#e07a2a','frenzy'],['mb_shellking','shellguard','Old Shellgrim',['water','earth'],'#5a8aa0','warded'],
 ['mb_gallowcrow','gull','The Gallow Crow',['shadow','wind'],'#3a3a4a','thorns'],['mb_lanternmaw','stareater','Glowmaw',['light','fire'],'#f0c060','regen'],
 ['mb_rustknight','iceknight','The Rusted Knight',['earth','lightning'],'#9a5a3a','warded'],['mb_stormcrown','thunderhawk','Old Thunderwing',['lightning','wind'],'#c0c0f0','frenzy'],
 ['mb_rootmother','mossling','Tanglemother',['earth','water'],'#3a7a3a','regen'],['mb_glasswidow','tidewisp','The Mirror Widow',['water','light'],'#a0e0f0','thorns'],
 ['mb_hollowabbot','huskguard','The Silent Abbot',['shadow'],'#5a4a3a','warded'],['mb_cinderbat','cavebat','Sootwing Elder',['fire','shadow'],'#a03a2a','frenzy'],
 ['mb_frostmother','frostwolf','Snowmother',['ice'],'#c0d8f0','regen'],['mb_skullbell','gargoyle','Tollskull Sentinel',['earth','shadow'],'#7a7a6a','thorns'],
 ['mb_gloomray','cloudray','The Gloom Ray',['wind','shadow'],'#4a4a7a','frenzy'],['mb_brinehag','crawler','The Kelp Hag',['water','shadow'],'#3a6a5a','regen'],
 ['mb_sunscorch','magmaslime','Scorchsand Ooze',['fire','light'],'#ffb040','warded'],['mb_voidcantor','voidspawn','The Void Cantor',['shadow','lightning'],'#5a3a8a','thorns']];
MINIS.forEach(([id,b,n,e,c])=>makeMonVariant(id,b,n,e,c,{mini:1,hp:+((MON[b]||{hp:1}).hp*1.1).toFixed(2)}));
// v0.12: guardians are Scourge sized. Every guardian art joins BIG_ART (battle.js unitBox and monCanvas read MON_SIZE: 60 like a Scourge);
// their code drawn art is the 40 px base monster with a new colour, so monCanvas draws it at its own size and enlarges it 1.5x (nearest
// neighbour) into the 60 px box. v0.19.2: the summoned guardian (summon8.js) uses the same art and the boss size (battle11.js).
MINIS.forEach(D=>{if(!BIG_ART.includes(D[0]))BIG_ART.push(D[0]);});
const MINI_BIG=new Set(MINIS.map(D=>D[0]));
{const mc0=monCanvas;monCanvas=function(art,f){if(!MINI_BIG.has(art))return mc0.apply(this,arguments);
  const i=BIG_ART.indexOf(art);if(i>=0)BIG_ART.splice(i,1);let c;try{c=mc0.call(this,art,f);}finally{if(i>=0)BIG_ART.splice(i,0,art);}
  const w=Math.round(c.width*1.5),h=Math.round(c.height*1.5),o=mkCv(w,h),x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,0,0,w,h);return o;};}
function miniFor(m){G.miniPick=G.miniPick||{};let i=G.miniPick[m.id];
  if(i==null){const used=new Set(Object.values(G.miniPick)),R=seeded(((G.run&&G.run.seed)||1)^0x31415),order=MINIS.map((_,k)=>k).sort(()=>R()-.5);
    i=order.find(k=>!used.has(k));if(i==null)i=order[Object.keys(G.miniPick).length%order.length];G.miniPick[m.id]=i;}
  const D=MINIS[i];return {mon:D[0],name:D[2],mod:D[5]};}
// the Sanctum's guardian waits on its rune circle until it is beaten: who it is, and how close the hero stands (0..1) for the name tag
// the old standing guard on the rune circle is gone: the miniboss is a real actor now (dynActors hook below). worldrt.js and hd2d.js still ask for it, so it stays as a stub.
function sanctGuard(m){return null;}
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
// ----- v0.14.1 (was fixes10.js): field actors on open ground; Den and Sanctum minibosses wait at the end -----
// 1) Bounty beasts, legend challengers and quest wanderers placed on a field could land on a tile the Sanctum gatehouse or a den mouth
//    later covered, so they stood inside a wall where nobody could talk to them. dynActors now moves any actor on a solid tile, or
//    within one tile of a site mouth, exit or dungeon door, to the nearest open spot. Talking to a legend challenger always answers.
// 2) The owner: "Get rid of chest to activate boss fight in dens, the miniboss or duel opponent should be waiting at the end of the den
//    like scourges in dungeons do." The miniboss stands at the end (the Sanctum's rune circle, or the tile before a Den's prize chest),
//    drawn like a bounty beast with a red marker; walk into it or face it and press A to be asked to fight. The prize chest will not
//    open while it stands. Saves: G.miniDone as before.
function f10Bad(m,x,y){try{const c=m.t[y]&&m.t[y][x];if(c==null||SOLID.includes(c))return true;if((m.caves||[]).some(s=>Math.abs(s.x-x)<=1&&Math.abs(s.y-y)<=1))return true;
  if(m.ent&&Math.abs(m.ent[0]-x)<=1&&Math.abs(m.ent[1]-y)<=2)return true;if((m.exits||[]).some(e=>Math.abs(e.x-x)<=1&&Math.abs(e.y-y)<=1))return true;}catch(e){}return false;}
function miniPending(m){try{return !!(m&&m.cave&&G&&!G.daily&&siteHasMini(m.id)&&!(G.miniDone&&G.miniDone[m.id]));}catch(e){return false;}}
function miniSpot(m){if(m._ms!==undefined)return m._ms;let p=null;try{if(m.fort&&m.guardAt)p=m.guardAt.slice();else if(m.prize){const [px,py]=m.prize;
  const c=[[px,py+1],[px,py-1],[px-1,py],[px+1,py],[px,py+2],[px-1,py+1],[px+1,py+1],[px,py-2]].find(([x,y])=>m.t[y]&&m.t[y][x]&&!SOLID.includes(m.t[y][x]));p=c||null;}}catch(e){}return m._ms=p;}
HOOK.xform('dynActors','sites','field actors off walls, the miniboss waits at the end',function(out,m){try{if(!m||!m.t)return out;
  out.forEach(a=>{if(a.mini||!f10Bad(m,a.x,a.y))return;const free=(m.free||[]).filter(p=>!f10Bad(m,p[0],p[1])&&!out.some(o=>o!==a&&o.x===p[0]&&o.y===p[1]));if(!free.length)return;
    let best=null,bd=1e9;free.forEach(p=>{const d=Math.abs(p[0]-a.x)+Math.abs(p[1]-a.y);if(d<bd){bd=d;best=p;}});if(best){a.x=best[0];a.y=best[1];}});
  if(miniPending(m)){const p=miniSpot(m);if(p){const mb=m._gd||(m._gd=miniFor(m));out.push({type:'elite',mini:1,x:p[0],y:p[1],b:{mon:mb.mon,name:mb.name,mod:mb.mod,mini:m.id,lv:STAGE_LV[m.s][1]+SITES.miniLv+ngLvOff()}});}}}catch(e){}return out;});
HOOK.before('actorTalk','sites','talk to the miniboss',function(a){if(a&&a.mini){V.modal={type:'miniask',id:a.b.mini,b:a.b};render();return HOOK.stop();}});
HOOK.before('vModal','sites','miniboss ask',function(m){if(!m||m.type!=='miniask')return;const b=m.b||{},mo=MON[b.mon]||{},md=(typeof ELITE_MODS!=='undefined'?ELITE_MODS:[]).find(x=>x.k===b.mod),here=WS.m;
  return HOOK.stop(box(esc(b.name||mo.n||'Guardian'),`<div class="bossv"><img src="${monURL(mo.art)}" alt=""></div><div class="els">${elChips(mo.el||[])}</div><p>${here&&here.fort?'It stands on the rune circle of the keep\'s hall, between you and the prize.':'It waits at the back of the den, between you and the prize.'}</p><p class="note">Level ${b.lv||'?'}, with a pack. ${md?`<b>${md.n}:</b> ${md.d}`:''} No auto battle. Win and the chest is yours, plus a Dread Core, gold and materials.</p>`,
    `<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="miniGo">Fight</button>`));});
ACT.miniGo=function(){const m=WS.m;if(!m||!miniPending(m))return;const mb=m._gd||(m._gd=miniFor(m));V.modal=null;haltInput();startBattle({stage:m.s,kind:'mini',mini:{id:m.id,mon:mb.mon,name:mb.name,mod:mb.mod}});};
// the miniboss's spot is the end of the den; a den or keep asks about it, not the boss door (askBoss is def'd in worldrt.js)
HOOK.before('askBoss','sites','a den asks the miniboss',function(){const m=WS.m;if(m&&m.cave){if(miniPending(m)){const a=dynActors(m).find(x=>x.mini);if(a)return HOOK.stop(actorTalk(a));}return HOOK.stop();}});
/* after 'cave reward chests' above: the prize chest stays shut while the miniboss stands (worldfx's sparkle wrap sits outside and only fires for a chest that opened) */
HOOK.before('openChest','sites','prize chest waits for the miniboss',function(x,y){try{const m=WS.m;if(m&&miniPending(m)&&m.prize&&m.prize[0]===x&&m.prize[1]===y){const mb=m._gd||(m._gd=miniFor(m));say(null,`${mb.name} stands between you and the prize. Beat it first.`);return HOOK.stop();}}catch(e){}});
// map: sanctums get their own marker and name
if(typeof MAPICO_X!=='undefined'){MAPICO_X.fort=[[0,3,10,7,'#7a7a86'],[0,1,3,9,'#5a5a66'],[7,1,3,9,'#5a5a66'],[1,4,1,3,'#c0392b'],[8,4,1,3,'#c0392b'],[4,6,2,4,'#120c10']];MAPICO_NAME.fort='Sanctum';}// v0.6.3: player facing text says sanctum, not side sanctum (ids and save keys unchanged)
fortReward=HOOK.def('fortReward',fortReward);// v0.18.7: world12.js spaces wild recruits (the keep's cells)
