// ===== world4.js (v0.4.0): the connected world: world graph, gates per side, v3 fields, caves and dungeons =====
// =================== v0.4.0 PHASE 5: THE CONNECTED WORLD ===================
// Journeys started on v0.4.0 (G.wv===3) get a world graph: t0 -> f0 -> t1 -> f1 ... Each link has a gate SIDE (n/s/e/w) on both of its maps,
// and the two sides always match (leave north, arrive on the south edge). Fields are built facing west->east and then turned or mirrored
// (xfPt/xfRows) so the road can enter and leave from any side. Towns get extra gates carved into their borders.
// Older saves (wv 1 or 2) keep the maps they had; nothing here runs for them.
const SIDE_OPP={n:'s',s:'n',e:'w',w:'e'};
const SIDE_V={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]};
const SIDE_FACE={w:'r',e:'l',n:'d',s:'u'}; // which way you face when you step in from that edge
const SIDE_NAME={n:'north',s:'south',e:'east',w:'west'};
// ----- the plan: deterministic from the journey seed, never stored in the save -----
let WPLAN={seed:null,v:null};
function opSide(op,sd){if(op.f&&(sd==='e'||sd==='w'))sd=SIDE_OPP[sd];for(let i=0;i<op.r;i++)sd={w:'n',n:'e',e:'s',s:'w'}[sd];return sd;}
function xfPt(op,W,H,x,y){if(op.f)x=W-1-x;for(let i=0;i<op.r;i++){const nx=H-1-y,ny=x;x=nx;y=ny;const t=W;W=H;H=t;}return [x,y];}
function xfRows(op,rows){let g=rows.map(r=>r.slice());if(op.f)g=g.map(r=>r.reverse());
  for(let i=0;i<op.r;i++){const H=g.length,W=g[0].length,n=[];for(let x=0;x<W;x++){const row=[];for(let y=H-1;y>=0;y--)row.push(g[y][x]);n.push(row);}g=n;}return g;}
function worldPlan(){
  const seed=G.run.seed,rev=G.dunRev>=2?2:1,key=seed+':'+rev;if(WPLAN.seed===key&&WPLAN.v)return WPLAN.v;
  // v0.4.1 1.8: from layout revision 2 the exits are balanced between east, north and south, and a journey whose forward exits
  // face east more than GATE_EAST_MAX of the time is redrawn (the same seed always redraws the same way). Older saves keep revision 1.
  let st=null,R=null;
  for(let att=0;att<(rev>=2?60:1);att++){
    R=mulberry(seed*7+31337+(att?att*977:0));const pk=a=>a[Math.floor(R()*a.length)];st=[];let prev='w';
    for(let s=0;s<5;s++){
      const tn=pk((rev>=2?['e','n','s']:['e','e','e','n','s']).filter(d=>d!==prev)),fs=SIDE_OPP[tn];
      let fe;const straight=SIDE_OPP[fs];
      if(s>=4)fe=straight;else fe=R()<.45&&straight!=='w'?straight:pk(['e','n','s'].filter(d=>d!==fs));
      // find a turn/mirror that sends the canonical road (west in, c out) to (fs in, fe out)
      const ops=[];for(let f=0;f<2;f++)for(let r=0;r<4;r++)['e','n','s'].forEach(c=>{const op={f,r};if(opSide(op,'w')===fs&&opSide(op,c)===fe)ops.push({op,c});});
      const o=pk(ops);
      st.push({tn,tp:prev,fs,fe,op:o.op,c:o.c});
      prev=SIDE_OPP[fe];
    }
    if(rev<2||st.filter(q=>q.tn==='e').length+st.filter(q=>q.fe==='e').length<=GATE_EAST_MAX*10)break;
  }
  // caves: three to five stretches have one, each with its own kind of prize
  const idx=[0,1,2,3,4].sort(()=>R()-.5),n=3+(R()<.5?1:0)+(R()<.25?1:0),kinds=['gear','item','recruit','charm'].sort(()=>R()-.5);
  idx.slice(0,n).forEach((s,i)=>{st[s].cave=kinds[i%4];});
  WPLAN={seed:key,v:st};return st;
}
const fieldEndSide=s=>worldPlan()[s].c;
const caveStage=s=>!!worldPlan()[s].cave;
// a cave mouth in the field: a clearing off a branch trail, far from the dungeon entrance and from the start
function placeCaveMouth(F,R,path,ent,bx,sy,H,nearPath){
  const reach=flood(F.g,2,sy,bx,c=>!SOLID.includes(c)),D=walkDist(F.g,2,sy,bx),L=path.filter(([x])=>x<bx).length,ends=path.ends||[];
  // v0.11.1 (new journeys): the cave sits in the first third of the route (walking distance from the entry, over the road's far end)
  const L3=typeof lay3On==='function'&&lay3On(),dEnd=L3?Math.max(1,...path.filter(([x])=>x<bx).map(([x,y])=>D[y]&&D[y][x]>=0?D[y][x]:0)):0;
  let cands=[];
  if(L3)[[16,2,2],[12,1,1]].forEach(([dist,rx,ry])=>{if(cands.length)return;
    for(let y=5;y<=H-6;y++)for(let x=8;x<=bx-5;x++){
      if(!reach[y+1]||!reach[y+1][x]||!D[y+1]||D[y+1][x]<6||D[y+1][x]>dEnd/3)continue;
      if(ent&&Math.abs(x-ent[0])+Math.abs(y-ent[1])<dist)continue;
      let ok=true;for(let j=-ry;j<=1&&ok;j++)for(let i=-rx;i<=rx&&ok;i++){const c=F.get(x+i,y+j);if(!'.,f'.includes(c)||nearPath(x+i,y+j,1))ok=false;}
      if(ok)cands.push([x,y]);}});
  // wide clearing and far away first; then looser rules so every planned cave finds a home
  [[24,.2,2,2],[16,.12,2,2],[12,.08,1,1]].forEach(([dist,dl,rx,ry])=>{if(cands.length)return;
    for(let y=5;y<=H-6;y++)for(let x=8;x<=bx-5;x++){
      if(!reach[y+1]||!reach[y+1][x]||!D[y+1]||D[y+1][x]<L*dl)continue;
      if(ent&&Math.abs(x-ent[0])+Math.abs(y-ent[1])<dist)continue;
      let ok=true;for(let j=-ry;j<=1&&ok;j++)for(let i=-rx;i<=rx&&ok;i++){const c=F.get(x+i,y+j);if(!'.,f'.includes(c)||nearPath(x+i,y+j,1))ok=false;}
      if(ok)cands.push([x,y]);}});
  if(!cands.length)return null;
  const near=cands.filter(([x,y])=>ends.some(([ex,ey])=>Math.abs(ex-x)+Math.abs(ey-y)<=12)),pool=near.length?near:cands,[x,y]=pool[Math.floor(R()*pool.length)];
  F.rect(x-1,y-1,3,1,'U');F.put(x-1,y,'U');F.put(x+1,y,'U');F.put(x,y,'E');
  return [x,y];
}
// ----- direction labels: a gate near a corner of its edge reads as a diagonal road -----
function gateLabel(side,x,y,W,H){
  const along=(side==='n'||side==='s')?x/(W-1):y/(H-1);
  const a=along<.3?0:along>.7?1:.5;if(a===.5)return side;
  if(side==='n'||side==='s')return side+(a?'e':'w');
  return (a?'s':'n')+side;
}
const DIR_NAME={n:'north',s:'south',e:'east',w:'west',ne:'northeast',nw:'northwest',se:'southeast',sw:'southwest'};
// ----- the long field -----
function buildField3(m,s,Z){
  const raw=genFieldRaw(s,3),P=worldPlan()[s],op=P.op,W=raw.W,H=raw.H;
  m.t=raw.rows;m.bld=[];m.kind='field';
  // exits are cut in the canonical frame first (so widenGate's 3-wide opening works), then everything is turned
  const startEx={x:0,y:raw.sy,to:{m:'t'+s,g:'next'}};m.exits=[startEx];widenGate(m,0,raw.sy,1,startEx);
  let endCells=[];
  if(s<4){
    if(P.c==='e'){const ee={x:W-1,y:raw.ey,to:{m:'t'+(s+1),g:'prev'}};m.exits.push(ee);widenGate(m,W-1,raw.ey,-1,ee);}
    else{const [ex,ey2]=raw.endAt;for(let dx=-1;dx<=1;dx++)m.exits.push({x:ex+dx,y:ey2,to:{m:'t'+(s+1),g:'prev'}});}
  }
  const startCells=m.exits.filter(e=>e.to.g==='next').map(e=>[e.x,e.y]);
  endCells=m.exits.filter(e=>e.to.g==='prev').map(e=>[e.x,e.y]);
  const T=([x,y])=>xfPt(op,W,H,x,y);
  m.t=xfRows(op,m.t);m.exits.forEach(e=>{const p=T([e.x,e.y]);e.x=p[0];e.y=p[1];});
  const DV=(x,y)=>{const a=xfPt(op,W,H,x,y),b=xfPt(op,W,H,x,y+1);return [b[0]-a[0],b[1]-a[1]];}; // where "south" of a canonical tile points after the turn
  m.chests=raw.chests.map(c=>T(c));m.ent=T(raw.ent);m.entFace=DV(raw.ent[0],raw.ent[1]);m.entOut=[m.ent[0]+m.entFace[0],m.ent[1]+m.entFace[1]];m.free=(raw.free||[]).map(T);m.caves=[];
  if(raw.cave){const c=T(raw.cave),fv=DV(raw.cave[0],raw.cave[1]);m.caves.push({x:c[0],y:c[1],id:'k'+s,kind:P.cave,face:fv,out:[c[0]+fv[0],c[1]+fv[1]]});}
  m.gateAt=T([raw.bx,raw.ey]);m.gateIn=T([raw.bx-1,raw.ey]);m.gateOut=T([raw.bx+1,raw.ey]);
  m.sy=null;m.ey=null;m.bx=null;
  m.bld=stampBuildings(m.t);
  // gate records: where you stand after walking in, which side, and the cells of the opening
  const rec=(cells,side,arrCanon)=>{const c=cells[Math.floor(cells.length/2)],a=T(arrCanon);return {side,x:c[0],y:c[1],arrive:[a[0],a[1],SIDE_FACE[side]],label:gateLabel(side,c[0],c[1],m.t[0].length,m.t.length)};};
  m.gates={start:rec(startCells,P.fs,[2,raw.sy])};
  if(s<4){const e0=endCells[Math.floor(endCells.length/2)];
    const arr=P.c==='e'?[W-3,raw.ey]:[e0[0],raw.endAt[1]===0?2:H-3];
    m.gates.end=rec(endCells,P.fe,arr);}
  m.part=3;
  return m;
}
// ----- town gates on any side -----
// A gate is carved straight in from a border, three tiles wide, until it meets ground the road already reaches. Buildings, the waystone,
// the quest board and the fountain are never cut. Returns the gate record or null.
function townCarve(m,side,R){
  const g=m.t,H=g.length,W=g[0].length,reach=flood(g,1,m.road,0,c=>!SOLID.includes(c)||c==='='),vert=side==='n'||side==='s';
  const NO='HWqOSG',span=vert?W:H,tries=[];
  for(let a=5;a<span-5;a++)tries.push(a);
  tries.sort(()=>R()-.5);
  for(const a of tries){
    const cells=[];let ok=true,hit=-1;
    const lim=vert?H:W;
    for(let d=0;d<Math.min(lim-3,14)&&ok;d++){
      const row=[];
      for(let k=-1;k<=1;k++){const x=vert?a+k:(side==='w'?d:W-1-d),y=vert?(side==='n'?d:H-1-d):a+k;
        const c=g[y][x];if(NO.includes(c)||m.bld.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)){ok=false;break;}row.push([x,y]);}
      if(!ok)break;cells.push(row);
      if(d>=1&&row.every(([x,y])=>reach[y][x]&&!SOLID.includes(g[y][x]))){hit=d;break;}
    }
    if(!ok||hit<0)continue;
    cells.forEach((row,d)=>row.forEach(([x,y],k)=>{const c=g[y][x];if(d<hit||SOLID.includes(c)){g[y][x]=c==='~'?'B':(k===1?'=':'.');}}));
    // frame the opening with towers on the border so it reads as a gate
    const e0=cells[0].map(([x,y])=>[x,y]),mid=e0[1];
    const fx=vert?[[mid[0]-2,mid[1]],[mid[0]+2,mid[1]]]:[[mid[0],mid[1]-2],[mid[0],mid[1]+2]];
    fx.forEach(([x,y])=>{if(g[y]&&g[y][x]&&(g[y][x]==='Z'||g[y][x]==='#'))g[y][x]='Y';});
    const inn=cells[Math.min(2,cells.length-1)][1];
    // v0.10.0: a visible path: the road tiles run from the gate to the first road or the town's main road, so the way out is never a
    // bare gap behind the houses
    try{if(vert){const dy=side==='n'?1:-1;for(let y=mid[1]+dy,n=0;y>=0&&y<H&&n<H;y+=dy,n++){const c=g[y][mid[0]];if(c==='=')break;if(c!=='.'||m.bld.some(b=>mid[0]>=b.x&&mid[0]<b.x+b.w&&y>=b.y&&y<b.y+b.h))break;g[y][mid[0]]='=';if(y===m.road)break;}}
      else{const dx=side==='w'?1:-1;for(let x=mid[0]+dx,n=0;x>=0&&x<W&&n<W;x+=dx,n++){const c=g[mid[1]][x];if(c==='=')break;if(c!=='.'||m.bld.some(b=>x>=b.x&&x<b.x+b.w&&mid[1]>=b.y&&mid[1]<b.y+b.h))break;g[mid[1]][x]='=';}}}catch(e){}
    return {side,x:mid[0],y:mid[1],cells:e0,arrive:[inn[0],inn[1],SIDE_FACE[side]],label:gateLabel(side,mid[0],mid[1],W,H)};
  }
  return null;
}
// Turn the standard west/east gates of a town into the planned ones. Plan sides w and e keep the originals.
function townGates3(m,s){
  const P=worldPlan(),W=m.t[0].length,road=m.road,R=mulberry(G.run.seed+991+s*37),gates={};
  const want={prev:s>0?P[s-1].fe&&SIDE_OPP[P[s-1].fe]:null,next:P[s].tn};
  const closeGate=(x,inward)=>{for(let dy=-1;dy<=1;dy++){const yy=road+dy;m.t[yy][x]=dy===0?'Z':'Z';}
    m.exits=m.exits.filter(e=>e.x!==x);m.npcs=m.npcs.filter(n=>!(Math.abs(n.x-x)<=2&&Math.abs(n.y-road)<=2));
    if(m.t[road-2]&&!SOLID.includes(m.t[road-2][x]))m.t[road-2][x]='Y';if(m.t[road+2]&&!SOLID.includes(m.t[road+2][x]))m.t[road+2][x]='Y';};
  const mk=(name,side,to)=>{
    if(side==='w'||side==='e'){const x=side==='w'?0:W-1,es=m.exits.filter(e=>e.x===x);
      es.forEach(e=>{if(to)e.to=to;});gates[name]={side,x,y:road,arrive:[side==='w'?1:W-2,road,SIDE_FACE[side]],label:side,cells:es.map(e=>[e.x,e.y])};return;}
    const rec=townCarve(m,side,R);
    if(!rec)return null;
    rec.cells.forEach(([x,y])=>m.exits.push({x,y,to}));gates[name]=rec;};
  // the default gates exist already: west (to the previous field, or closed in town 0) and east (to the field)
  if(s>0&&want.prev&&want.prev!=='w'){closeGate(0,1);}
  if(want.next!=='e'){closeGate(W-1,-1);}
  if(s>0)mk('prev',want.prev,{m:'f'+(s-1),g:'end'});
  mk('next',want.next,{m:'f'+s,g:'start'});
  if(s===0){gates.prev0={side:'w',x:0,y:road};}
  // sign by the road gate
  m.gates=gates;
  return gates;
}

// =================== SIDE CAVES (5.3) ===================
// A cave is smaller than a main dungeon (48x34 against 60x40 or more) with no boss, no key and no lever. A chain of rooms leads to a prize room
// at the far end; side rooms hold a few chests. The prize depends on the plan: +2 gear, a rare item, a challenge-only recruit or a unique charm.
// v0.11.1: side caves are Dens (each ends in a miniboss); Sanctum stays the forts' name
const CAVE_NAMES=['Mossback Den','Saltwhisper Den','Cinderseam Den','Rimefang Den','Starfall Den'];
const CAVE_W=48,CAVE_H=34;
function buildCave(R,th){
  const D=new Gr(CAVE_W,CAVE_H,'#'),rooms=[],ov=(r,o,p)=>r.x<o.x+o.w+p&&r.x+r.w+p>o.x&&r.y<o.y+o.h+p&&r.y+r.h+p>o.y;
  const start={x:2,y:ri2(R,6,CAVE_H-12),w:7,h:6},prize={x:CAVE_W-11,y:ri2(R,6,CAVE_H-12),w:8,h:6};rooms.push(start,prize);
  for(let t=0;t<500&&rooms.length<9;t++){const r={x:ri2(R,2,CAVE_W-12),y:ri2(R,2,CAVE_H-8),w:ri2(R,5,8),h:ri2(R,4,6)};if(!rooms.some(o=>ov(r,o,2)))rooms.push(r);}
  if(rooms.length<7)return null;
  rooms.forEach(r=>D.rect(r.x,r.y,r.w,r.h,'.'));
  const cen=r=>[r.x+Math.floor(r.w/2),r.y+Math.floor(r.h/2)];
  const link=(a,b)=>{const [x0,y0]=cen(a),[x1,y1]=cen(b),hf=R()<.5;let x=x0,y=y0;const P=[[x,y]];
    if(hf){while(x!==x1){x+=Math.sign(x1-x);P.push([x,y]);}while(y!==y1){y+=Math.sign(y1-y);P.push([x,y]);}}else{while(y!==y1){y+=Math.sign(y1-y);P.push([x,y]);}while(x!==x1){x+=Math.sign(x1-x);P.push([x,y]);}}
    P.forEach(([px,py])=>{if(D.get(px,py)==='#')D.put(px,py,'.');});};
  const mid=rooms.filter(r=>r!==start&&r!==prize).sort((a,b)=>a.x-b.x),chain=[start].concat(mid.slice(0,Math.ceil(mid.length*.6)),[prize]),side=mid.slice(Math.ceil(mid.length*.6));
  for(let i=0;i+1<chain.length;i++)link(chain[i],chain[i+1]);
  side.forEach(r=>link(r,chain[1+Math.floor(R()*(chain.length-2))]));
  if(chain.length>4)link(chain[1],chain[chain.length-2]); // a loop, so there is a shortcut back
  const sc=cen(start);D.put(sc[0],start.y,'E');
  const chests=[];const pc=cen(prize);D.put(pc[0],pc[1],'C');chests.push([pc[0],pc[1],'reward']);
  side.concat(chain.slice(2,-1).filter((r,i)=>i%2===0)).forEach(r=>{const x=r.x+r.w-1,y=r.y+r.h-1;if(D.get(x,y)==='.'){D.put(x,y,'C');chests.push([x,y]);}});
  const dec=th==='cave'?'v':'P';rooms.forEach(r=>{if(r===start||r===prize)return;if(r.w>=6&&r.h>=5&&D.get(r.x,r.y)==='.')D.put(r.x,r.y,dec);for(let i=0;i<2;i++){const x=ri2(R,r.x,r.x+r.w-1),y=ri2(R,r.y,r.y+r.h-1);if(D.get(x,y)==='.'&&R()<.6)D.put(x,y,'r');}});
  [[prize.x,prize.y],[prize.x+prize.w-1,prize.y],[prize.x,prize.y+prize.h-1],[prize.x+prize.w-1,prize.y+prize.h-1]].forEach(([x,y])=>{if(D.get(x,y)==='.')D.put(x,y,dec==='v'?'v':'P');});
  return {rows:D.g,start:[sc[0],start.y+1],chests,prize:pc,rooms:rooms.length};
}
function caveOk(c){
  const g=c.rows,H=g.length,W=g[0].length,seen=g.map(r=>r.map(()=>false)),st=[c.start.slice()];
  while(st.length){const [x,y]=st.pop();if(x<0||y<0||x>=W||y>=H||seen[y][x]||SOLID.includes(g[y][x]))continue;seen[y][x]=true;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
  const adj=(x,y)=>[[0,1],[1,0],[0,-1],[-1,0]].some(([a,b])=>seen[y+b]&&seen[y+b][x+a]);
  if(!c.chests.length||c.chests.some(([x,y])=>!adj(x,y)))return false;
  if(!c.chests.some(q=>q[2]==='reward'))return false;
  // the stairs out must not be walled in by the first step
  const E=[c.start[0],c.start[1]-1];if(g[E[1]][E[0]]!=='E')return false;
  // nothing may stand on a route beside the stairs other than the start tile
  return seen[c.start[1]][c.start[0]];
}
function genCave(s){const th=ZS(s).theme;for(let a=0;a<80;a++){const R=mulberry(G.run.seed+4141+s*67+a*109),c=buildCave(R,th);if(c&&caveOk(c))return c;}throw new Error('cave generation failed');}
function buildCaveMap(m,s){const c=genCave(s);m.t=c.rows;m.start=c.start;m.bossAt=null;m.chests=c.chests;m.wander=[c.start[0],c.start[1]+1];m.cave=true;m.name=CAVE_NAMES[s];m.fixed={};m.prize=c.prize;m.kind='dungeon';return m;}
// the prize, opened from the chest in the last room
function caveKind(s){return worldPlan()[s].cave;}
const CAVE_CHARMS={0:'c_cv0',1:'c_cv1',2:'c_cv2',3:'c_cv3',4:'c_cv4'};
function caveRecruitPool(s){return CHALL.filter(c=>TPL[c.hero]&&!G.roster[c.hero]&&(!G.sub||G.sub.includes(c.hero))&&c.stage<=s+1).map(c=>c.hero);}
function caveReward(s){
  let kind=caveKind(s)||'gear',msg;
  if(kind==='recruit'){const pool=caveRecruitPool(s);if(!pool.length)kind='charm';else{const h=pool[hashS(G.run.seed+'cv'+s)%pool.length];recruit(h,true);msg=`${TPL[h].n} was waiting at the back of the cave, and asks to join you.`;G.caveWon=G.caveWon||{};G.caveWon[s]='recruit';return msg;}}
  G.caveWon=G.caveWon||{};G.caveWon[s]=kind;
  if(kind==='gear'){const gid=lootBase()+'_'+Math.min(5,s+1)+'+2',g=gearOf(gid);G.gear.push(gid);return `Inside: ${g.n} (${ITEM_TIERS[gTierIdx(g)].n})! It is already forged to +2.`;}
  if(kind==='item'){G.inv.elixir=Math.min(invCap(),(G.inv.elixir||0)+1);G.inv.plume=Math.min(invCap(),(G.inv.plume||0)+2);return `Inside: 1 x ${ITEMS.elixir.n} and 2 x ${ITEMS.plume.n}.`;}
  const cid=CAVE_CHARMS[s];G.gear.push(cid);const g=gearOf(cid);return `Inside: the ${g.n} (${ITEM_TIERS[gTierIdx(g)].n}). There is only one of it in the world.`;
}

// =================== BIGGER DUNGEONS AND THE LEVER ORDER (Phase 6) ===================
// wv 3 dungeons are 84x56 (a v0.3.5 dungeon was 60x40), with up to 26 rooms. The puzzle order is fixed:
//   lever (far from the entrance, down a side branch)  ->  barred key room  ->  the key  ->  boss door.
// The key room and the vault are dead-end rooms with exactly one way in, each closed by bars. One lever raises every set of bars.
const DUN3_W=80,DUN3_H=50; // stage 0; each later stage adds 3 columns, 2 rows and a room (stage 4: 92x58, 26 rooms)
function dunDist(g,start,pass){const H=g.length,W=g[0].length,D=g.map(r=>r.map(()=>-1)),Q=[start];D[start[1]][start[0]]=0;
  for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H||D[ny][nx]>=0)continue;
    if(SOLID.includes(g[ny][nx])&&!pass.includes(g[ny][nx]))continue;D[ny][nx]=D[y][x]+1;Q.push([nx,ny]);}}return D;}
// walking distance (4-way) from the stairs to the tile beside a target, or -1
function dunStepsTo(g,start,pass,p){const D=dunDist(g,start,pass);let b=-1;[[0,1],[1,0],[0,-1],[-1,0]].forEach(([a,c])=>{const v=D[p[1]+c]&&D[p[1]+c][p[0]+a];if(v>=0&&(b<0||v<b))b=v;});return b;}
function buildDungeon3(R,th,s){
  s=s||0;const W=DUN3_W+s*3,H=DUN3_H+s*2,MAXR=22+s,D=new Gr(W,H,'#'),rooms=[];
  const ov=(r,o,p)=>r.x<o.x+o.w+p&&r.x+r.w+p>o.x&&r.y<o.y+o.h+p&&r.y+r.h+p>o.y;
  const boss={x:W-13,y:ri2(R,10,H-19),w:10,h:9},start={x:2,y:ri2(R,10,H-17),w:7,h:6};rooms.push(boss,start);
  for(let t=0;t<4000&&rooms.length<MAXR;t++){const r={x:ri2(R,2,W-24),y:ri2(R,2,H-10),w:ri2(R,5,9),h:ri2(R,4,7)};if(!rooms.some(o=>ov(r,o,2)))rooms.push(r);}
  if(rooms.length<MAXR-3)return null;
  rooms.forEach(r=>D.rect(r.x,r.y,r.w,r.h,'.'));
  const cen=r=>[r.x+Math.floor(r.w/2),r.y+Math.floor(r.h/2)];
  const inR=(x,y,r,p)=>x>=r.x-p&&x<r.x+r.w+p&&y>=r.y-p&&y<r.y+r.h+p;
  const lpath=(x0,y0,x1,y1,hfirst)=>{const P=[[x0,y0]];let x=x0,y=y0;
    if(hfirst){while(x!==x1){x+=Math.sign(x1-x);P.push([x,y]);}while(y!==y1){y+=Math.sign(y1-y);P.push([x,y]);}}
    else{while(y!==y1){y+=Math.sign(y1-y);P.push([x,y]);}while(x!==x1){x+=Math.sign(x1-x);P.push([x,y]);}}return P;};
  const forbid=[boss];
  const carve=(a,b)=>{const [x0,y0]=cen(a),[x1,y1]=cen(b),fb=forbid.filter(r=>r!==a&&r!==b);
    for(const h of (R()<.5?[true,false]:[false,true])){const P=lpath(x0,y0,x1,y1,h);if(P.some(([x,y])=>fb.some(r=>inR(x,y,r,1))))continue;P.forEach(([x,y])=>{if(D.get(x,y)==='#')D.put(x,y,'.');});return P;}return null;};
  const others=rooms.filter(r=>r!==boss&&r!==start).sort((a,b)=>a.x-b.x);
  if(others.length<MAXR-8)return null;
  const nChain=Math.ceil(others.length*.55),chain=[start].concat(others.slice(0,nChain)),side0=others.slice(nChain);
  if(side0.length<5)return null;
  // two dead-end rooms behind bars, picked from the side rooms
  const pickOut=()=>side0.splice(Math.floor(R()*side0.length),1)[0];
  const keyRoom=pickOut(),vault=pickOut();forbid.push(keyRoom,vault);
  for(let i=0;i+1<chain.length;i++)if(!carve(chain[i],chain[i+1]))return null;
  // open side rooms hang off the chain, or off each other, so branches run more than one room deep
  const linked=chain.slice(),openSide=[];
  side0.sort((a,b)=>a.x-b.x).forEach(r=>{let ok=false;for(let k=0;k<6&&!ok;k++){const to=linked[Math.floor(R()*linked.length)];ok=!!carve(r,to);}if(ok){linked.push(r);openSide.push(r);}});
  if(openSide.length<3)return null;
  const pool=rooms.filter(r=>r!==boss&&r!==start&&r!==keyRoom&&r!==vault);
  for(let k=0;k<6;k++){const a=pool[Math.floor(R()*pool.length)],b=pool[Math.floor(R()*pool.length)];if(a!==b&&Math.abs(cen(a)[0]-cen(b)[0])+Math.abs(cen(a)[1]-cen(b)[1])<40)carve(a,b);}
  // boss corridor
  const ante=chain.reduce((a,b)=>cen(b)[0]>cen(a)[0]?b:a),bc=cen(boss),ey=bc[1],ex=boss.x-1,ac=cen(ante);
  const BP=lpath(ac[0],ac[1],ex-1,ey,true);if(BP.some(([x,y])=>inR(x,y,boss,1)||inR(x,y,vault,1)||inR(x,y,keyRoom,1)))return null;
  BP.forEach(([x,y])=>{if(D.get(x,y)==='#')D.put(x,y,'.');});D.put(ex,ey,'D');
  // how far is "far"? The route to the boss door, in steps from the stairs
  const sc=cen(start),st=[sc[0],start.y+1],Dd=dunDist(D.g,st,'D'),route=Dd[ey][ex-1];
  if(route<0)return null;
  const cand=openSide.filter(r=>{const [cx,cy]=cen(r);return Dd[cy][cx]>=Math.ceil(route/3)+4;}).sort((a,b)=>Dd[cen(b)[1]][cen(b)[0]]-Dd[cen(a)[1]][cen(a)[0]]);
  if(!cand.length)return null;
  const leverRoom=cand[Math.floor(R()*Math.min(3,cand.length))],lc=cen(leverRoom);
  // locked rooms: one corridor each from a host room, bars on the last tile outside the room
  const hostFor=(lock,other)=>{const c2=cen(lock),hosts=chain.concat(openSide).filter(r=>r!==leverRoom||R()<.3).sort((a,b)=>(Math.abs(cen(a)[0]-c2[0])+Math.abs(cen(a)[1]-c2[1]))-(Math.abs(cen(b)[0]-c2[0])+Math.abs(cen(b)[1]-c2[1])));
    for(const h of hosts.slice(0,6)){const hc=cen(h);for(const hf of (R()<.5?[true,false]:[false,true])){const Q=lpath(hc[0],hc[1],c2[0],c2[1],hf);
      if(Q.some(([x,y])=>inR(x,y,boss,1)||inR(x,y,other,1)))continue;
      let bar=null;for(let i=Q.length-1;i>=0;i--){const [x,y]=Q[i];if(!inR(x,y,lock,0)){bar=[x,y];break;}}
      if(!bar)continue;Q.forEach(([x,y])=>{if(D.get(x,y)==='#')D.put(x,y,'.');});return bar;}}
    return null;};
  const keyBar=hostFor(keyRoom,vault),vaultBar=hostFor(vault,keyRoom);if(!keyBar||!vaultBar)return null;
  D.put(keyBar[0],keyBar[1],'|');D.put(vaultBar[0],vaultBar[1],'|');
  const kc=cen(keyRoom),vc=cen(vault);D.put(kc[0],kc[1],'K');D.put(vc[0],vc[1],'C');
  const chests=[[vc[0],vc[1],'vault']];
  D.put(lc[0],leverRoom.y,'l');
  // chests: every other chain room, and the end of most dead-end branches
  chain.slice(1).forEach((r,i)=>{if(i%2===0&&D.get(r.x+r.w-1,r.y+r.h-1)==='.'){D.put(r.x+r.w-1,r.y+r.h-1,'C');chests.push([r.x+r.w-1,r.y+r.h-1]);}});
  openSide.forEach((r,i)=>{if(r!==leverRoom&&i%3!==2&&D.get(r.x+r.w-1,r.y+r.h-1)==='.'){D.put(r.x+r.w-1,r.y+r.h-1,'C');chests.push([r.x+r.w-1,r.y+r.h-1]);}});
  D.put(sc[0],start.y,'E');D.put(bc[0],bc[1]-1,'X');
  rooms.forEach(r=>{if(r===start||r===keyRoom||r===vault)return;const dec=th==='cave'?'v':th==='meadow'&&R()<.2?'g':'P';if(r.w>=6&&r.h>=5){if(D.get(r.x,r.y+r.h-1)==='.')D.put(r.x,r.y+r.h-1,dec);}
    for(let i=0;i<3;i++){const x=ri2(R,r.x,r.x+r.w-1),y=ri2(R,r.y,r.y+r.h-1);if(D.get(x,y)==='.'&&R()<.6)D.put(x,y,'r');}});
  [[boss.x,boss.y+boss.h-1],[boss.x+boss.w-1,boss.y+boss.h-1],[boss.x,boss.y],[boss.x+boss.w-1,boss.y]].forEach(([x,y])=>D.put(x,y,'v'));
  const wroom=openSide.find(r=>r!==leverRoom)||openSide[0];
  // v0.4.1 1.7: judge the lever on the FINISHED map (the key and vault corridors are carved after the first pick and can open shortcuts):
  // far from the stairs by walking distance (not in the first third of the route to the boss door), in a side room that is not
  // on the main chain, and never in the first two rooms of the walk.
  let leverInfo=null;
  if(G&&G.dunRev>=2){const D2=dunDist(D.g,st,'D'),lv=[lc[0],leverRoom.y],near=[[0,1],[1,0],[0,-1],[-1,0]].map(([a,c])=>(D2[lv[1]+c]||[])[lv[0]+a]).filter(v=>v>=0);
    const lever_d=near.length?Math.min(...near):-1,route2=D2[ey][ex-1];
    if(lever_d<0||route2<0||lever_d<Math.ceil(route2/DUN_LEVER.minFrac)+DUN_LEVER.minExtra)return null;
    if(chain.includes(leverRoom))return null;
    // walk the shortest path from the lever back to the stairs and list the rooms it passes through, in order
    let cx=lv[0],cy=lv[1]+1;{let bd=1e9;[[0,1],[1,0],[0,-1],[-1,0]].forEach(([a,c])=>{const v=(D2[lv[1]+c]||[])[lv[0]+a];if(v>=0&&v<bd){bd=v;cx=lv[0]+a;cy=lv[1]+c;}});}
    const seq=[];let guard=0;while(guard++<5000){const r=rooms.find(q=>inR(cx,cy,q,0));if(r&&seq[seq.length-1]!==r)seq.push(r);const d0=D2[cy][cx];if(d0<=0)break;let moved=false;
      for(const [a,c] of [[0,-1],[-1,0],[0,1],[1,0]]){const v=(D2[cy+c]||[])[cx+a];if(v>=0&&v===d0-1){cx+=a;cy+=c;moved=true;break;}}if(!moved)break;}
    seq.reverse();const hops=seq.filter(r=>r!==start).length-1;   // rooms entered before the lever room (the start room is not counted)
    if(hops<DUN_LEVER.minHops)return null;
    leverInfo={dist:lever_d,route:route2,hops};}
  return {rows:D.g,start:st,boss:[bc[0],bc[1]-1],chests,wander:[wroom.x,wroom.y+wroom.h-1],v3:true,keyBarred:true,keyBar,vaultBar,lever:[lc[0],leverRoom.y],roomCount:rooms.length,route,leverInfo,rects:rooms.map(r=>({x:r.x,y:r.y,w:r.w,h:r.h})),startRect:{x:start.x,y:start.y,w:start.w,h:start.h}};
}
// lever order checks: the lever opens first and is far from the stairs, the key sits only behind bars, the boss door needs the key
function leverOrderBad(d){
  const g=d.rows,bad=[],find=c=>{for(let y=0;y<g.length;y++)for(let x=0;x<g[0].length;x++)if(g[y][x]===c)return [x,y];return null;};
  const lev=find('l'),key=find('K'),door=find('D');if(!lev||!key||!door)return ['order-missing'];
  const st=d.start,toLever=dunStepsTo(g,st,'',lev),toKeyOpen=dunStepsTo(g,st,'',key),toKeyBars=dunStepsTo(g,st,'|',key),toDoor=dunStepsTo(g,st,'D',door);
  if(toLever<0)bad.push('lever-unreachable');
  if(toKeyOpen>=0)bad.push('key-without-lever');   // the key must not be reachable until the bars are up
  if(toKeyBars<0)bad.push('key-unreachable');
  // the boss door itself is reachable with the bars still down (the key is what opens it)
  const toDoorShut=dunStepsTo(g,st,'',door);if(toDoorShut<0)bad.push('door-unreachable');
  if(toLever>=0&&toDoorShut>=0&&toLever<Math.floor(toDoorShut/3))bad.push('lever-near');
  return bad;
}
