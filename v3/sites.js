// ===== Beta v0.4.1 4.7 and 4.8: side caves look like caves, side fortresses, minibosses =====
// Side caves get their own look (mossy rock palette, damp green light, drips) and their own music, so they never read as a main dungeon.
// Side fortresses are a second optional site type in new journeys (stages 1 to 4): bigger than a cave, smaller than a main dungeon,
// built as a walled keep (stone walls, a courtyard, barracks rooms, banners and braziers, a keep holding the prize), with a gatehouse
// entrance drawn on the field that looks unlike both a cave mouth and a dungeon facade. Both are marked on the map once found and are
// never needed to progress. Legendaries never come from them.
// Minibosses: about 90% of caves and fortresses (seeded per site) have a capstone fight guarding the prize. Opening the prize chest
// wakes it; win and the prize is yours plus a bonus. Minibosses can never be auto battled.
const SITES={fortW:62,fortH:40,mini:.9,miniHp:6,miniPow:1.55,miniLv:4};
const FORT_NAMES=['Briarwatch Keep','Saltmarch Bastion','Emberwall Hold','Frostcrag Redoubt','Duskspire Citadel'];
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

// ---------- fortress map ----------
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
  return {rows:D.g,start:[sc[0],sc[1]+1],chests,prize:pc};}
function genFort(s){for(let a=0;a<40;a++){const R=mulberry(G.run.seed+7313+s*71+a*131),c=buildFort(R,s);if(caveOk(c))return c;}throw new Error('fortress generation failed');}
function buildFortMap(id){const s=+id.slice(1),c=genFort(s),Z=ZS(s);const m={id,z:s,s,kind:'dungeon',theme:Z.theme,exits:[],npcs:[],bld:[],signs:{},t:c.rows,start:c.start,bossAt:null,chests:c.chests,
  wander:[c.start[0],c.start[1]+1],cave:true,fort:true,name:FORT_NAMES[s],fixed:{},prize:c.prize};m.w=m.t[0].length;m.h=m.t.length;return m;}
// fortress gatehouse on the field: a clearing far from the dungeon, the cave and the gates, reachable before the sealed gate
function fortWanted(s){return isRv2()&&s>=1;}
function placeFort(f,s){if(!f||f.kind!=='field'||f.fortDone||!fortWanted(s))return;f.fortDone=1;if((f.caves||[]).some(c=>c.kind==='fort'))return;
  const g=f.t,H=g.length,W=g[0].length,st=f.gates&&f.gates.start&&f.gates.start.arrive||[2,f.sy||2];
  const D=g.map(r=>r.map(()=>-1)),Q=[st];D[st[1]][st[0]]=0;for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(nx<0||ny<0||nx>=W||ny>=H||D[ny][nx]>=0)continue;const c=g[ny][nx];if(SOLID.includes(c)||c==='G')continue;D[ny][nx]=D[y][x]+1;Q.push([nx,ny]);}}
  const far=(x,y,p,d)=>!p||Math.abs(x-p[0])+Math.abs(y-p[1])>=d,cands=[];
  for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){let ok=true;for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=1&&ok;i++){if(!'.,f'.includes(g[y+j][x+i]))ok=false;}
    if(!ok||D[y+1]==null||D[y+2]==null||D[y+2][x]<0)continue;if(!'.,f'.includes(g[y+2][x]))continue;
    if(!far(x,y,f.ent,18)||(f.caves||[]).some(c=>!far(x,y,[c.x,c.y],14))||(f.exits||[]).some(e=>!far(x,y,[e.x,e.y],10))||(f.chests||[]).some(c=>!far(x,y,c,3)))continue;cands.push([x,y,D[y+2][x]]);}
  if(!cands.length)return;cands.sort((a,b)=>b[2]-a[2]);const R=mulberry(G.run.seed+919+s*13),pick2=cands[Math.floor(R()*Math.min(12,cands.length))],[x,y]=pick2;
  g[y-1][x-1]='U';g[y-1][x]='U';g[y-1][x+1]='U';g[y][x-1]='U';g[y][x+1]='U';g[y][x]='E';
  f.caves=f.caves||[];f.caves.push({x,y,id:'o'+s,kind:'fort',face:[0,1],out:[x,y+1]});f.fortAt=[x,y];
  if(typeof mapIssues==='function'&&mapIssues(f).length){// undo if it blocks anything
    g[y-1][x-1]=g[y-1][x]=g[y-1][x+1]=g[y][x-1]=g[y][x+1]=g[y][x]=',';f.caves=f.caves.filter(c=>c.id!=='o'+s);f.fortAt=null;}}
{const gm1=getMap;getMap=function(id){if(id&&id[0]==='o'&&!MAPS[id]&&G&&G.run){const fm=MAPS[id]=buildFortMap(id);try{applyBossTheme(fm);if(typeof healMap==='function')healMap(fm);}catch(e){}try{if(typeof guardPaths==='function'&&!window.__PGOFF){fm.__guarded=true;guardPaths(fm);}}catch(e){}}const m=gm1.apply(this,arguments);
  try{if(m&&m.kind==='field'&&m.part!==1&&!m.fortDone)placeFort(m,m.s);}catch(e){}return m;};}
// the gatehouse is painted into the field's base layer (so heroes and townsfolk always draw in front of it):
// grey towers with red banners (a cave mouth is a rock arch, a dungeon a carved facade)
function drawGatehouse(ctx,x,y){
  ctx.fillStyle='#4a4a54';ctx.fillRect(x,y-8,TS*3,TS*2+8);ctx.fillStyle='#7a7a86';ctx.fillRect(x+1,y-7,TS*3-2,TS*2+6);
  ctx.fillStyle='#9a9aa6';for(let i=0;i<6;i++)ctx.fillRect(x+2+i*8,y-12,5,5);
  ctx.fillStyle='#5a5a66';ctx.fillRect(x,y-14,9,TS*2+14);ctx.fillRect(x+TS*3-9,y-14,9,TS*2+14);
  ctx.fillStyle='#c0392b';ctx.fillRect(x+2,y-4,5,12);ctx.fillRect(x+TS*3-7,y-4,5,12);ctx.fillStyle='#ffd04a';ctx.fillRect(x+3,y-2,3,2);ctx.fillRect(x+TS*3-6,y-2,3,2);
  ctx.fillStyle='#120c10';ctx.fillRect(x+TS+2,y+TS-2,TS-4,TS+2);ctx.fillStyle='#3a2a1a';for(let i=0;i<3;i++)ctx.fillRect(x+TS+3+i*4,y+TS-2,1,TS+2);}
{const bm0=buildMapCanvas;buildMapCanvas=function(m,fr){const c=bm0.apply(this,arguments);try{if(m&&m.kind==='field'&&m.fortAt&&c&&c.getContext){const [fx,fy]=m.fortAt;drawGatehouse(c.getContext('2d'),(fx-1)*TS,(fy-1)*TS);}}catch(e){}return c;};}
// ---------- prizes ----------
function fortReward(s){const kinds=['gear','item','recruit','charm'],k0=kinds[hashS(G.run.seed+'ft'+s)%4];let kind=k0;G.fortWon=G.fortWon||{};
  if(kind==='recruit'){const pool=caveRecruitPool(s).filter(h=>!(LEGEND_IDS||[]).includes(h));if(!pool.length)kind='charm';else{const h=pool[hashS(G.run.seed+'fr'+s)%pool.length];recruit(h,true);G.fortWon[s]='recruit';return `${TPL[h].n} was held in the keep's cells, and asks to join you.`;}}
  G.fortWon[s]=kind;
  if(kind==='gear'){const gid=(hashS('fa'+G.run.seed+s)%2?'a_'+ARM_FAM[CLS_ARM[TPL[G.party[0]].cls]||'medium']:lootBase())+'_'+Math.min(5,s+1)+'+2',g=gearOf(gid)||gearOf(lootBase()+'_'+Math.min(5,s+1)+'+2');G.gear.push(g.id||gid);return `Inside: ${g.n} (${ITEM_TIERS[gTierIdx(g)].n})! It is already forged to +2.`;}
  if(kind==='item'){G.inv.elixir=Math.min(9,(G.inv.elixir||0)+1);G.inv.holywater=Math.min(9,(G.inv.holywater||0)+1);G.inv.plume=Math.min(9,(G.inv.plume||0)+2);return `Inside: ${ITEMS.elixir.n}, ${ITEMS.holywater.n} and 2 x ${ITEMS.plume.n}.`;}
  const cid=FORT_CHARMS[s];G.gear.push(cid);const g=gearOf(cid);return `Inside: the ${g.n} (${ITEM_TIERS[gTierIdx(g)].n}). There is only one of it in the world.`;}
// ---------- minibosses ----------
function siteHasMini(id){return (hashS('mini'+id+((G.run&&G.run.seed)||0))%100)<SITES.mini*100;}
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
function miniFor(m){G.miniPick=G.miniPick||{};let i=G.miniPick[m.id];
  if(i==null){const used=new Set(Object.values(G.miniPick)),R=seeded(((G.run&&G.run.seed)||1)^0x31415),order=MINIS.map((_,k)=>k).sort(()=>R()-.5);
    i=order.find(k=>!used.has(k));if(i==null)i=order[Object.keys(G.miniPick).length%order.length];G.miniPick[m.id]=i;}
  const D=MINIS[i];return {mon:D[0],name:D[2],mod:D[5]};}
{const oc0=openChest;openChest=function(x,y){const m=WS.m;try{if(m&&m.cave&&G&&!G.daily&&(m.chests||[]).some(c=>c[0]===x&&c[1]===y&&c[2]==='reward')&&!G.chests[m.id+':'+x+','+y]){
    G.miniDone=G.miniDone||{};if(siteHasMini(m.id)&&!G.miniDone[m.id]){const mb=miniFor(m);say(null,`Something heavy shifts in the dark. ${mb.name} rises to guard the prize!`,()=>{haltInput();startBattle({stage:m.s,kind:'mini',mini:{id:m.id,mon:mb.mon,name:mb.name,mod:mb.mod}});});return;}
    if(m.fort){G.chests[m.id+':'+x+','+y]=1;if(typeof sfx==='function')sfx('chest');rebuildBase();const t=fortReward(m.s);saveGame();say(null,'You open the chest. '+t);return;}}}catch(e){}
  return oc0.apply(this,arguments);};}
{const ef1=encounterFoes;encounterFoes=function(spec){if(!spec||!spec.mini||typeof spec.mini!=='object')return ef1.apply(this,arguments);
  const s=spec.stage,mi=spec.mini,lv=STAGE_LV[s][1]+SITES.miniLv+ngLvOff(),Z=ZS(s),out=[makeEnemy(MON[mi.mon],lv,{elite:true,name:mi.name,mod:mi.mod,hpM:SITES.miniHp,powM:SITES.miniPow})];
  out.push(makeEnemy(MON[pick(Z.pool)],lv-2));out.push(makeEnemy(MON[pick(Z.pool)],lv-3));return out;};}
{const fb2=finishBattle;finishBattle=function(how){const sp=B&&B.spec,mi=sp&&sp.mini&&typeof sp.mini==='object'?sp.mini:null;const r=fb2.apply(this,arguments);
  try{if(mi&&how==='win'&&G){G.miniDone=G.miniDone||{};G.miniDone[mi.id]=1;const s=sp.stage,g=econG(300+s*250);G.gold+=g;G.mats.core=(G.mats.core||0)+1;G.mats[ZS(s).mat]=(G.mats[ZS(s).mat]||0)+3;saveGame();
    toast(`${mi.name} falls. Bonus: ${g} gold, a Dread Core and 3 ${MATS[ZS(s).mat]}. The prize chest is yours.`);}}catch(e){}return r;};}
// map: fortresses get their own marker and name
if(typeof MAPICO_X!=='undefined'){MAPICO_X.fort=[[0,3,10,7,'#7a7a86'],[0,1,3,9,'#5a5a66'],[7,1,3,9,'#5a5a66'],[1,4,1,3,'#c0392b'],[8,4,1,3,'#c0392b'],[4,6,2,4,'#120c10']];MAPICO_NAME.fort='Side fortress';}
