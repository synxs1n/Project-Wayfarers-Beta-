// ===== p2world.js (v0.5.0): battle and world logic: backdrops from the terrain, ground plane, surprise starts, single and dual types, hints =====
// 2.1 battle backdrops from the terrain under the party, units always on a solid ground plane, flyers hover over a shadow
// 2.2 surprise starts against roaming dungeon foes that have not seen the party
// 2.3 gathering spots sit on or beside a matching terrain feature
// 2.4 every town gate has a clear approach lane, at least TOWN_LANE tiles wide, to the main roads
// 2.5 dungeon entrances vary by realm (roots, barrows, wells, trapdoors, rock faces, holes, ruins and the old facades)
// 2.6 dual type wayfarers and dual type regular monsters wait until the second realm (DUAL_FROM)
// 2.7 short, skippable early game hints that fire once each and stay readable in Guides > Hints
// Tunables live in config.js (BATTLE_GROUND, SURPRISE, DUAL_FROM, TOWN_LANE, HINTS_UNTIL, HINT_DELAY).
// New optional fields: META.hints {id: text} (hints already shown, account wide), META.cfg.hints (false turns hints off). Both default safely.
const P2={};
const p2BaseTheme=s=>{try{return ZS(s).theme;}catch(e){return 'meadow';}};

// ---------------------------------------------------------------- 2.1 battle backdrops and ground ----------------------------------------------------------------
// Ground kinds a backdrop can stand on. Each theme has a natural ground (what '.' looks like there).
const BG_GROUNDS=['grass','tall','flowers','road','forest','sand','snow','rock','cave','void','high'];
const BG_NATURAL={meadow:'grass',coast:'sand',cave:'cave',snow:'snow',heights:'high',void:'void'};
const BG_GPAL={grass:[['#6ab858','#5aa048','#4c8f3e','#3f7f32'],'#3a7a30'],tall:[['#5aa048','#4c8f3e','#3f7f32','#356e2a'],'#2f6a28'],flowers:[['#6ab858','#5aa048','#4c8f3e','#3f7f32'],'#3a7a30'],
  forest:[['#4c8f3e','#3f7f32','#356e2a','#2c5e24'],'#2a5622'],sand:[['#f0dcaa','#e2cf98','#cfb880','#b8a070'],'#c0a878'],snow:[['#f4faff','#e4eef6','#ccdcea','#b8cce0'],'#c8d8e8'],
  rock:[['#8a8478','#7a7468','#6a6458','#58524a'],'#4a443c'],cave:[['#3a2c2c','#4a3a38','#3a2e2e','#2a2020'],'#2a1c1c'],void:[['#2c2440','#221c34','#1a1428','#120e1e'],'#3a2a5a'],
  high:[['#7a9a5a','#68884c','#56743e','#4a6436'],'#4a6a3a']};
// which ground the party stood on: roads, bridges and plazas are road; flowers, tall grass and rubble keep their look; three or more trees close by make a forest
function bgGroundAt(m,x,y){
  const th=p2BaseTheme(m.s),nat=BG_NATURAL[th]||'grass',c=tileAt(m,x,y);
  if('=:B'.includes(c))return 'road';
  if(c==='r')return 'rock';
  const leafy=th==='meadow'||th==='coast'||th==='heights'||th==='snow';
  if(leafy){let t=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(tileAt(m,x+dx,y+dy)==='T')t++;if(t>=3)return 'forest';}
  if(c==='f'&&(th==='meadow'||th==='coast'||th==='heights'))return 'flowers';
  if(c===','&&(th==='meadow'||th==='coast'||th==='heights'))return th==='coast'?'grass':'tall';
  return nat;
}
// paint the ground plane (from bgGY down) for one ground kind on top of a theme's sky and horizon
function bgPaintGround(ctx,W,H,R,th,g){
  const gy=bgGY(H),P=BG_GPAL[g]||BG_GPAL.grass,pk=a=>a[Math.floor(R()*a.length)];
  if(g==='forest'){// a line of trees standing on the horizon
    for(let x=-4;x<W+8;x+=7+Math.floor(R()*5)){const h=18+Math.floor(R()*14),tw=th==='snow'?'#2a4a4a':'#2f5a2a';ctx.fillStyle='#4a3420';ctx.fillRect(x,gy-8,2,8);
      ctx.fillStyle=tw;for(let k=0;k<h;k++){const w=th==='snow'||th==='heights'?Math.floor(k/2.4):Math.floor(Math.min(k,h-k)/1.6)+1;ctx.fillRect(x+1-w,gy-8-h+k,w*2+1,1);}
      if(th==='snow'){ctx.fillStyle='#f4faff';ctx.fillRect(x,gy-8-h,2,2);}}}
  groundPlane(ctx,W,H,gy,th==='snow'&&g!=='road'&&g!=='rock'?BG_GPAL.snow[0]:P[0],R,th==='snow'&&g!=='road'&&g!=='rock'?BG_GPAL.snow[1]:P[1]);
  const span=H-gy;
  if(g==='tall'||g==='forest')for(let i=0;i<W/2;i++){const x=Math.floor(R()*W),y=Math.floor(gy+3+R()*(span-4));ctx.fillStyle=pk(['#86c860','#2f6a2e','#4a8a3a']);ctx.fillRect(x,y-2,1,3);ctx.fillRect(x+1,y-1,1,2);}
  if(g==='forest')for(let i=0;i<W/6;i++){const x=Math.floor(R()*W),y=Math.floor(gy+3+R()*(span-4));ctx.fillStyle=pk(['#a8742a','#c8902a','#7a4a1a']);ctx.fillRect(x,y,2,1);}
  if(g==='flowers'||g==='grass'||g==='high')for(let i=0;i<W/(g==='flowers'?4:12);i++){const x=Math.floor(R()*W),y=Math.floor(gy+4+R()*(span-6));ctx.fillStyle=pk(['#f06a8a','#f6e06a','#ffffff','#b07aff']);ctx.fillRect(x,y,2,2);}
  if(g==='rock'||g==='cave')for(let i=0;i<W/7;i++){const x=Math.floor(R()*W),y=Math.floor(gy+3+R()*(span-4)),w=2+Math.floor(R()*4);ctx.fillStyle=pk([P[0][3],shade(P[0][0],1.15),P[1]]);ctx.fillRect(x,y,w,2);ctx.fillStyle=shade(P[0][0],1.3);ctx.fillRect(x,y,w,1);}
  if(g==='sand')for(let i=0;i<W/12;i++){const x=Math.floor(R()*W),y=Math.floor(gy+4+R()*(span-5));ctx.fillStyle=pk(['#f6e8d8','#f0a8a0','#c8b080']);ctx.fillRect(x,y,2,1);}
  if(g==='snow')for(let i=0;i<W/10;i++){const x=Math.floor(R()*W),y=Math.floor(gy+3+R()*(span-4));ctx.fillStyle='#ffffff';ctx.fillRect(x,y,3,1);}
  if(g==='void')for(let i=0;i<10;i++){let x=Math.floor(R()*W),y=Math.floor(gy+4+R()*(span-6));ctx.fillStyle='#8b5fd0';for(let k=0;k<5;k++){ctx.fillRect(x,y,2,1);x+=2;y+=R()<.5?1:0;}}
  if(g==='road'){// a worn road across the middle of the ground, wide enough for both lines to stand on
    const top=gy+Math.floor(span*.12),bot=H-Math.floor(span*.06),rc=th==='snow'?['#d4dde8','#c4cede','#b4c0d0','#a4b0c4']:th==='cave'||th==='void'?['#6a6270','#5a5262','#4a4454','#3c3646']:['#c8a874','#b8986a','#a8885a','#94784c'];
    gradBands(ctx,0,top,W,bot-top,rc);ctx.fillStyle=shade(rc[3],.85);ctx.fillRect(0,top,W,1);ctx.fillRect(0,bot-1,W,1);
    for(let i=0;i<W/5;i++){const x=Math.floor(R()*W),y=Math.floor(top+2+R()*(bot-top-4));ctx.fillStyle=pk([rc[3],shade(rc[0],1.08)]);ctx.fillRect(x,y,2,1);}
    for(const f of [.35,.7]){const y=Math.floor(top+(bot-top)*f);ctx.fillStyle=shade(rc[2],.9);for(let x=0;x<W;x+=3)if(R()<.7)ctx.fillRect(x,y,2,1);}}
}
['meadow','coast','cave','snow','heights','void'].forEach(th=>{
  BG_GROUNDS.forEach(g=>{BG['f:'+th+':'+g]=function(ctx,W,H,R){BG[th](ctx,W,H,R);if(g!==BG_NATURAL[th])bgPaintGround(ctx,W,H,R,th,g);};});
  // a natural cave: rough rock walls, hanging stalactites and glowing crystals, a rocky floor
  BG['c_'+th]=function(ctx,W,H,R){const D=DTHEME[th],gy=bgGY(H);
    gradBands(ctx,0,0,W,gy,[D.top,shade(D.w[3],1.3),shade(D.w[1],.8),D.w[1]]);
    fillRidge(ctx,ridgeLine(R,W,Math.floor(H*.16),6,9),shade(D.w[1],.7),gy,shade(D.w[2],.8));
    fillRidge(ctx,ridgeLine(R,W,gy-Math.floor(H*.08),5,7),D.w[0],gy,D.w[2]);
    for(let i=0;i<W/7;i++){const x=Math.floor(R()*W),l=5+Math.floor(R()*Math.floor(H*.18));ctx.fillStyle=D.top;for(let k=0;k<l;k++){const w=Math.max(1,Math.floor((l-k)/3));ctx.fillRect(x-Math.floor(w/2),k,w,1);}}
    for(let i=0;i<5;i++){const x=Math.floor(R()*W),y=gy-Math.floor(H*.08)+Math.floor(R()*4);ctx.fillStyle=D.acc;ctx.fillRect(x,y-5,2,5);ctx.fillRect(x+2,y-3,1,3);ctx.fillStyle=D.acc2;ctx.fillRect(x,y-5,1,1);}
    groundPlane(ctx,W,H,gy,[D.f[2],D.f[0],D.f[1],D.f[3]],R,D.f[3]);
    for(let i=0;i<W/6;i++){const x=Math.floor(R()*W),y=Math.floor(gy+3+R()*(H-gy-4)),w=2+Math.floor(R()*3);ctx.fillStyle=shade(D.f[1],.8);ctx.fillRect(x,y,w,2);ctx.fillStyle=shade(D.f[2],1.15);ctx.fillRect(x,y,w,1);}};
  // a purpose built boss stage: a great gate in the back wall, braziers, banners and a raised stone dais with a rune circle
  BG['boss_'+th]=function(ctx,W,H,R){const D=DTHEME[th],gy=bgGY(H);
    gradBands(ctx,0,0,W,gy,[D.top,shade(D.w[3],1.4),D.w[1],D.w[0]]);
    for(let y=Math.floor(H*.08);y<gy-2;y+=6){const off=(y/6)%2?0:7;for(let x=-off;x<W;x+=14){ctx.fillStyle=R()<.3?D.w[2]:shade(D.w[0],R()<.5?1:.88);ctx.fillRect(x,y,13,5);}}
    const gx=Math.floor(W*.5),gw=Math.floor(W*.16),gt=Math.floor(H*.12);ctx.fillStyle=D.w[3];ctx.fillRect(gx-gw/2-3,gt-3,gw+6,gy-gt+3);ctx.fillStyle='#0a0608';ctx.fillRect(gx-gw/2,gt,gw,gy-gt);
    ctx.fillStyle=D.acc;for(let i=0;i<3;i++)ctx.fillRect(gx-gw/2+3+i*Math.floor(gw/3),gt+4,2,gy-gt-6);
    [Math.floor(W*.18),Math.floor(W*.82)].forEach(x=>{ctx.fillStyle='#7a1a2a';ctx.fillRect(x-5,Math.floor(H*.1),10,Math.floor(H*.22));ctx.fillStyle=D.acc;ctx.fillRect(x-2,Math.floor(H*.16),4,4);ctx.fillStyle='#3a2a1a';ctx.fillRect(x-1,gy-14,3,14);ctx.fillStyle='#ffb04a';ctx.fillRect(x-3,gy-19,7,5);ctx.fillStyle='#fff0a0';ctx.fillRect(x-1,gy-18,3,3);});
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(0,0,W,Math.floor(H*.08));
    groundPlane(ctx,W,H,gy,[shade(D.f[2],1.05),D.f[0],D.f[1],D.f[3]],R,D.f[3]);
    for(let y=gy+4;y<H;y+=7)for(let x=((y/7)%2?0:9);x<W;x+=18){ctx.fillStyle=shade(D.f[3],.9);ctx.fillRect(x,y,17,1);ctx.fillRect(x,y,1,6);}
    ctx.fillStyle=D.w[2];ctx.fillRect(0,gy,W,2);ctx.fillStyle=D.w[3];ctx.fillRect(0,gy+2,W,1);
    const cx=Math.floor(W*.28),cy=gy+Math.floor((H-gy)*.55),rx=Math.floor(W*.18),ry=Math.floor((H-gy)*.28);ctx.strokeStyle=D.acc;ctx.globalAlpha=.55;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,7);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,rx-4,ry-2,0,0,7);ctx.stroke();ctx.globalAlpha=1;};
});
// 2.1: the backdrop comes from where the battle started. The terrain is noted when a battle starts in the world (never in the Daily Trial).
HOOK.before('startBattle','p2world','backdrop from the terrain (spec.bg)',function(spec){
  try{if(spec&&typeof spec==='object'&&!spec.bg&&spec.kind!=='daily'&&!(G&&G.daily)&&V.screen==='world'&&WS&&WS.m){const m=WS.m;
    spec.bg={th:p2BaseTheme(m.s),k:m.kind==='field'?'field':m.kind==='town'?'field':m.cave?'cave':'dungeon',g:bgGroundAt(m,WS.x,WS.y)};}}catch(e){}});
const BOSS_STAGE_KINDS={boss:1,echoBoss:1,storyEcho:1,mini:1};
{const bt0=battleTheme;battleTheme=function(){const base=bt0.apply(this,arguments);try{if(!B||!B.spec)return base;const sp=B.spec,k=sp.kind,th=p2BaseTheme(B.stage);
  if(k==='arena'||k==='daily')return base;
  if(BOSS_STAGE_KINDS[k])return 'boss_'+th;
  const bg=sp.bg;if(bg){if(bg.k==='cave')return 'c_'+bg.th;if(bg.k==='dungeon')return 'd_'+bg.th;return 'f:'+bg.th+':'+(BG_GROUNDS.includes(bg.g)?bg.g:BG_NATURAL[bg.th]);}
  return BG[base]?base:th;}catch(e){return base;}};}
// every unit stands on the ground plane: slot heights are mapped into [top, bot] of the stage; flying foes hover above their shadow
function p2GroundY(fy){const G0=BATTLE_GROUND,lo=G0.top,hi=G0.bot;return Math.max(lo,Math.min(hi,lo+(fy-.48)*(hi-lo)/(.97-.48)));}
function p2Flying(u){return !!(u&&u.side==='e'&&u.ty&&u.ty.includes('flying'));}
{const ub0=unitBox;unitBox=function(u){const b=ub0.apply(this,arguments);if(!b)return b;try{const H=BL.H;b.y=Math.round(p2GroundY(b.y/H)*H);b.gy=b.y;
  if(p2Flying(u)){b.hov=BATTLE_GROUND.hover;b.y-=b.hov;}}catch(e){}return b;};}

// ---------------------------------------------------------------- 2.2 surprise starts ----------------------------------------------------------------
// A roamer still on patrol has not seen the party. Touching it (or it bumping into you) without being spotted first gives a free round:
// every hero in the vanguard acts once before any foe moves. A roamer that chased you (or is walking home after losing you) saw you first.
{const rf0=roamFight;roamFight=function(m,r){try{P2.sur=r&&r.mode==='patrol'?{mid:m.id,i:r.i,t:Date.now()}:null;}catch(e){}return rf0.apply(this,arguments);};}
function p2Surprise(){if(!B)return;const P=B.front.filter(c=>c.hp>0),E=B.en.filter(e=>e.hp>0);if(!P.length||!E.length)return;
  const free=Math.max(1,(SURPRISE&&SURPRISE.free)||1);P.forEach((c,k)=>{c.next=B.time+k*.001;});
  // foes wait until just before the earliest second action of any hero
  const t0=Math.min(...P.map(c=>c.next+free*delayOf(c,1)));E.forEach((e,k)=>{e.next=Math.max(e.next,t0-.01+k*.0001);});
  B.surprise=1;banner('Surprise!','#7affc8');log('Surprise! The foes have not seen you. Your party strikes first.');}
HOOK.before('startBattle','p2world','surprise start: was the roamer still on patrol',function(spec){
  try{if(spec&&spec.roam&&P2.sur&&P2.sur.mid===spec.roam.mid&&P2.sur.i===spec.roam.i&&Date.now()-P2.sur.t<5000)spec.surprise=1;}catch(e){}P2.sur=null;});
HOOK.after('startBattle','p2world','surprise start: the free round',function(r,spec){try{if(r!==false&&B&&spec&&spec.surprise&&!G.daily)p2Surprise();}catch(e){}});

// ---------------------------------------------------------------- 2.3 gathering spots ----------------------------------------------------------------
// Wood only beside trees, ore beside rocks, cliffs and walls, herbs on grass or beside flowers. Never on roads, bridges, stairs or doors.
const NODE_NEED={wood:'T',ore:'#RZr',herb:'f'};
function nodeFits(m,k,x,y){const c=tileAt(m,x,y);if(SOLID.includes(c)||'=:BEsG|D'.includes(c))return false;
  const near=s=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;if(s.includes(tileAt(m,x+dx,y+dy)))return true;}return false;};
  if(k==='wood')return near(NODE_NEED.wood);
  if(k==='ore')return near(NODE_NEED.ore);
  if(k==='herb')return c===','||c==='f'||near('f')||(c==='.'&&(p2BaseTheme(m.s)==='meadow')&&near(','));
  return false;}
P2.placeNodes0=placeNodes;// kept for tests (the v0.4 rule)
placeNodes=function(m){
  const R=mulberry(G.run.seed+4242+m.s*97+(m.kind==='dungeon'?7:0)),mix=NODE_MIX[p2BaseTheme(m.s)]||NODE_MIX[m.theme]||NODE_MIX.meadow;
  let spots=[];
  if(m.kind==='field'){spots=(m.free||[]).slice();m.free=(m.free||[]).filter((p,i)=>i%3!==1);
    // fields: the walkable tiles reachable from the entry, away from the road
    const sx=m.gates&&m.gates.start?m.gates.start.arrive[0]:1,sy=m.gates&&m.gates.start?m.gates.start.arrive[1]:(m.sy||0);
    try{const seen=flood(m.t,sx,sy);const ex=new Set(spots.map(p=>p[0]+','+p[1]));m.t.forEach((r,y)=>r.forEach((c,x)=>{if(seen[y]&&seen[y][x]&&!ex.has(x+','+y)&&'.,f'.includes(c))spots.push([x,y]);}));}catch(e){}
    const fr=new Set(m.free.map(p=>p[0]+','+p[1]));spots=spots.filter(p=>!fr.has(p[0]+','+p[1]));}
  else{const seen=flood(m.t,m.start[0],m.start[1]);m.t.forEach((r,y)=>r.forEach((c,x)=>{if('.,f'.includes(c)&&seen[y][x]&&Math.abs(x-m.start[0])+Math.abs(y-m.start[1])>4&&!(m.bossAt&&Math.abs(x-m.bossAt[0])<5&&Math.abs(y-m.bossAt[1])<5))spots.push([x,y]);}));}
  const n=m.kind==='field'?(worldV3()?18:worldV2()?10:8):worldV3()?9:4,out=[],used={};
  const byK={};['wood','ore','herb'].forEach(k=>{byK[k]=spots.filter(p=>nodeFits(m,k,p[0],p[1]));});
  for(let i=0;i<n*10&&out.length<n;i++){
    let k=m.kind==='dungeon'&&R()<.6?'ore':mix[Math.floor(R()*mix.length)];
    if(!byK[k].length){const alt=['ore','herb','wood'].filter(q=>byK[q].length);if(!alt.length)break;k=alt[Math.floor(R()*alt.length)];}
    const L=byK[k],p=L[Math.floor(R()*L.length)],key=p[0]+','+p[1];
    if(used[key]||out.some(o=>Math.abs(o.x-p[0])+Math.abs(o.y-p[1])<5))continue;used[key]=1;
    if((m.chests||[]).some(c=>c[0]===p[0]&&c[1]===p[1]))continue;
    out.push({x:p[0],y:p[1],k});}
  m.nodes=out;};
// a matching prop under each spot: a stump beside the log, a vein streak beside the ore, a patch of turf under the herbs
{const dn0=drawNode;drawNode=function(ctx,n,px,py,now){const f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);};
  try{if(n.k==='wood'){f('#4a2c14',1,5,4,4);f('#7a4a24',1,5,4,1);f('#c89a5a',2,6,2,2);}
    else if(n.k==='ore'){f('#2a2a36',1,3,3,7);f('#e0a050',2,5,1,1);f('#c8e0ff',2,8,1,1);}
    else if(n.k==='herb'){f('#2f6a28',2,12,12,2);f('#4a9a3a',3,11,3,1);f('#4a9a3a',10,11,3,1);}}catch(e){}
  return dn0.apply(this,arguments);};}

// ---------------------------------------------------------------- 2.4 town exits ----------------------------------------------------------------
// Each gate gets an approach lane at least TOWN_LANE tiles wide from the gate mouth to the town's main roads (the roads and plazas of the
// town plan). Decoration in the way (trees, bushes, crates, barrels, lamps, banners...) is cleared and the lane is paved; buildings, walls,
// water, signs, boards, fountains and waystones are never moved, so the lane goes around them. Townsfolk never stand or wander in a lane.
const LANE_CLEAR='tTfxbhkmyLuavgNePr';
function laneMain(m){// the main roads: '=' and ':' tiles of the town plan before any gate was cut
  try{const Z=ZS(m.s),t=TOWNGEN[Z.theme](mulberry(500+m.s*41+realmOf(m.s))),S=new Set();t.g.forEach((r,y)=>r.forEach((c,x)=>{if((c==='='||c===':')&&x>0&&y>0&&x<r.length-1&&y<t.g.length-1)S.add(x+','+y);}));return S;}catch(e){return new Set();}}
function laneGates(m){const W=m.w||m.t[0].length,H=m.h||m.t.length,out=[];const ex=m.exits||[];
  const side=e=>e.x===0?'w':e.x===W-1?'e':e.y===0?'n':e.y===H-1?'s':null;
  ['w','e','n','s'].forEach(sd=>{const c=ex.filter(e=>side(e)===sd);if(c.length)out.push({side:sd,cells:c.map(e=>[e.x,e.y])});});return out;}
// a small binary heap for the lane search
function p2Heap(){const a=[];return {get n(){return a.length;},push(v){a.push(v);let i=a.length-1;while(i>0){const p=(i-1)>>1;if(a[p][0]<=a[i][0])break;[a[p],a[i]]=[a[i],a[p]];i=p;}},
  pop(){const top=a[0],last=a.pop();if(a.length){a[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<a.length&&a[l][0]<a[m][0])m=l;if(r<a.length&&a[r][0]<a[m][0])m=r;if(m===i)break;[a[m],a[i]]=[a[i],a[m]];i=m;}}return top;}};}
const LANE_NO='HWqOSGXCKE';
// cheapest path of TOWN_LANE x TOWN_LANE blocks from the gate cells to a main road tile.
// mode 'check': only open ground counts (the layout test). mode 'carve': decoration may be cleared, water bridged, and border rock or wall
// within 8 tiles of the gate's edge dug through (used when a gate is moved). Returns {path,cost} or null.
function laneFind(m,gate,main,mode){
  const g=m.t,H=g.length,W=g[0].length,N=TOWN_LANE,isGate=new Set(gate.cells.map(p=>p[0]+','+p[1])),dig=mode==='dig';
  const npc=new Set((m.npcs||[]).map(n=>n.x+','+n.y)),inB=(x,y)=>m.bld.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
  const depth=(x,y)=>gate.side==='w'?x:gate.side==='e'?W-1-x:gate.side==='n'?y:H-1-y;
  const tileCost=(x,y)=>{if(x<0||y<0||x>=W||y>=H)return -1;const k=x+','+y;if(isGate.has(k))return 0;if(x===0||y===0||x===W-1||y===H-1)return -1;
    const c=g[y][x];if(LANE_NO.includes(c)||inB(x,y))return -1;
    if(mode==='check')return SOLID.includes(c)||npc.has(k)?-1:0;
    if(!SOLID.includes(c))return npc.has(k)?1:0;if(LANE_CLEAR.includes(c))return 4;if(c==='~')return 10;
    if(dig&&'#ZYFR'.includes(c)&&depth(x,y)<=8)return 3;return -1;};
  const cache=new Map(),blk=(x,y)=>{const k=x+','+y;if(cache.has(k))return cache.get(k);let s=0;for(let j=0;j<N&&s>=0;j++)for(let i=0;i<N;i++){const c=tileCost(x+i,y+j);if(c<0){s=-1;break;}s+=c;}cache.set(k,s);return s;};
  const hitsMain=(x,y)=>{for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(main.has((x+i)+','+(y+j)))return true;return false;};
  const dist=new Map(),prev=new Map(),open=p2Heap(),key=(x,y)=>x+','+y;
  gate.cells.forEach(([cx,cy])=>{for(let j=1-N;j<=0;j++)for(let i=1-N;i<=0;i++){const x=cx+i,y=cy+j,c=blk(x,y);if(c<0)continue;const k=key(x,y);if(!dist.has(k)||dist.get(k)>c){dist.set(k,c);prev.set(k,null);open.push([c,x,y]);}}});
  while(open.n){const [d,x,y]=open.pop(),k=key(x,y);if(d>dist.get(k))continue;
    if(hitsMain(x,y)){const path=[];let q=k;while(q){path.push(q.split(',').map(Number));q=prev.get(q);}return mode==='check'?path:{path,cost:d};}
    for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b,c=blk(nx,ny);if(c<0)continue;const nd=d+1+c,nk=key(nx,ny);if(!dist.has(nk)||nd<dist.get(nk)){dist.set(nk,nd);prev.set(nk,k);open.push([nd,nx,ny]);}}}
  return null;}
// how far the gate is from the main roads as the crow flies, in blocks
function laneStraight(gate,main){let best=1e9;main.forEach(k=>{const [x,y]=k.split(',').map(Number);gate.cells.forEach(([gx,gy])=>{const d=Math.abs(x-gx)+Math.abs(y-gy);if(d<best)best=d;});});return best;}
// a gate whose only lane is a long detour (around a building, along a river) moves along its own edge (the side, and so the world plan,
// never changes); nearer spots are preferred
function laneMove(m,gate,main){const W=m.t[0].length,H=m.t.length,vert=gate.side==='n'||gate.side==='s',span=vert?W:H;
  const mid=gate.cells[Math.floor(gate.cells.length/2)],along=vert?mid[0]:mid[1];
  const edgeAt=a=>vert?[a,gate.side==='n'?0:H-1]:[gate.side==='w'?0:W-1,a];let best=null;
  for(let a=3;a<span-3;a++){if(Math.abs(a-along)<1)continue;const cells=[a-1,a,a+1].map(edgeAt);
    const r=laneFind(m,{side:gate.side,cells},main,'dig');if(r){r.cost+=Math.abs(a-along)*.5;if(!best||r.cost<best.r.cost)best={a,cells,r};}}
  return best;}
function laneApply(m,gate,path){const g=m.t,N=TOWN_LANE;path.forEach(([x,y])=>{for(let j=0;j<N;j++)for(let i=0;i<N;i++){const tx=x+i,ty=y+j,c=g[ty][tx];m.lane.add(tx+','+ty);
  if(c==='~')g[ty][tx]='B';else if(c!=='B'&&c!==':'&&(!SOLID.includes(c)||LANE_CLEAR.includes(c)||'#ZYFR'.includes(c)))g[ty][tx]='=';}});}
function laneFix(m){if(!m||m.kind!=='town'||m.laneDone)return;m.laneDone=1;m.lane=new Set();const main=laneMain(m),W=m.t[0].length,H=m.t.length;
  laneGates(m).forEach(gate=>{let r=laneFind(m,gate,main,'carve');const straight=laneStraight(gate,main);
    const poor=!r||r.cost>straight*1.5+8;
    // only the gates cut through the town wall in connected journeys move (the road gates west and east sit on the main road already)
    const rec=m.gates&&Object.entries(m.gates).find(([k,q])=>q&&q.cells&&q.side===gate.side&&q.cells.some(c=>gate.cells.some(d=>d[0]===c[0]&&d[1]===c[1])));
    if(poor&&rec){const mv=laneMove(m,gate,main);
      if(mv&&(!r||mv.r.cost+4<r.cost)){const [name,q]=rec,old=gate.cells,ex=(m.exits||[]).filter(e=>old.some(c=>c[0]===e.x&&c[1]===e.y)),to=ex.length?ex[0].to:null,msg=ex.length?ex[0].msg:null;
        // close the old opening with the edge's own wall, open the new one, and move the exits and the arrival tile
        const edge=old.map(([x,y])=>[x,y]),wallCh=(()=>{const cnt={};for(let a=0;a<(gate.side==='n'||gate.side==='s'?W:H);a++){const [x,y]=gate.side==='n'?[a,0]:gate.side==='s'?[a,H-1]:gate.side==='w'?[0,a]:[W-1,a];const c=m.t[y][x];if(SOLID.includes(c))cnt[c]=(cnt[c]||0)+1;}return Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0]||'Z';})();
        edge.forEach(([x,y])=>{m.t[y][x]=wallCh;});m.exits=m.exits.filter(e=>!old.some(c=>c[0]===e.x&&c[1]===e.y));
        mv.cells.forEach(([x,y])=>{m.t[y][x]=m.t[y][x]==='~'?'B':'=';const e={x,y};if(to)e.to=to;if(msg)e.msg=msg;m.exits.push(e);});
        const md=mv.cells[1],inw=gate.side==='n'?[0,1]:gate.side==='s'?[0,-1]:gate.side==='w'?[1,0]:[-1,0];
        q.cells=mv.cells.map(c=>c.slice());q.x=md[0];q.y=md[1];q.arrive=[md[0]+inw[0]*2,md[1]+inw[1]*2,SIDE_FACE[gate.side]];q.moved=1;
        gate.cells=mv.cells;r=mv.r;}}
    if(r)laneApply(m,gate,r.path);});
  // the arrival tile of a gate must be open ground
  // v0.7.1: a moved gate's arrival tile (two tiles in) could land inside a building and was paved there, a walkable hole in a wall that is
  // drawn whole; it steps back toward the gate instead
  const inB=(x,y)=>m.bld.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
  if(m.gates)Object.values(m.gates).forEach(q=>{if(q&&q.arrive){let [x,y]=q.arrive;
    if(inB(x,y)&&q.cells&&q.cells.length&&!window.__W71OFF){const md=q.cells[Math.floor(q.cells.length/2)];while(inB(x,y)&&Math.abs(md[0]-x)+Math.abs(md[1]-y)>1){x+=Math.sign(md[0]-x);y+=Math.sign(md[1]-y);}q.arrive=[x,y].concat(q.arrive.slice(2));}
    if(m.t[y]&&SOLID.includes(m.t[y][x])&&(!inB(x,y)||window.__W71OFF))m.t[y][x]='=';}});
  laneEvict(m);}
function laneEvict(m){if(!m.lane||!m.lane.size)return;const W=m.t[0].length,H=m.t.length;
  m.npcs.forEach(n=>{if(!m.lane.has(n.x+','+n.y))return;let best=null,bd=1e9;
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const c=m.t[y][x];if(!'.:,'.includes(c)||m.lane.has(x+','+y)||m.npcs.some(o=>o!==n&&o.x===x&&o.y===y))continue;
      if(m.bld.some(b=>b.door[0]===x&&Math.abs(b.door[1]+1-y)<=1))continue;if((m.exits||[]).some(e=>Math.abs(e.x-x)+Math.abs(e.y-y)<=3))continue;
      const d=Math.abs(x-n.x)+Math.abs(y-n.y);if(d<bd){bd=d;best=[x,y];}}
    if(best){n.x=best[0];n.y=best[1];n.hx=best[0];n.hy=best[1];n.mv=null;}});}
HOOK.wrap('getMap','p2world','town lanes, gathering spots on open tiles (new maps)',function(next,...a){let id=a[0];const had=!!MAPS[id];const m=next(...a);try{if(!had&&m&&m.kind==='town'&&!P2.noLane)laneFix(m);
  // a gathering spot never survives on a tile a later step (fortress gatehouse, cave mouth) turned solid
  if(!had&&m&&m.nodes&&m.kind!=='town')m.nodes=m.nodes.filter(n=>nodeFits(m,n.k,n.x,n.y));}catch(e){}return m;});
// townsfolk never wander into a lane (a step into one is taken back), and festival visitors are moved out of them
{const nt0=npcTick;npcTick=function(m,now){nt0.apply(this,arguments);try{if(m&&m.lane)m.npcs.forEach(n=>{if(n.mv&&m.lane.has(n.x+','+n.y)){n.x=n.mv.fx;n.y=n.mv.fy;n.mv=null;}});}catch(e){}};}
{const fe0=festive;festive=function(m){const r=fe0.apply(this,arguments);try{if(m&&m.lane)laneEvict(m);}catch(e){}return r;};}

// ---------------------------------------------------------------- 2.5 dungeon entrance variety ----------------------------------------------------------------
// Each realm has its own entrance look, picked from its tileset's list by the realm index. All are drawn upright with a dark opening on the
// entrance tile and two warm lights, so they read clearly. Side caves stay rock arches with a blue glow; fortresses stay grey gatehouses.
const ENT_STYLES={meadow:['roots','barrow','facade','well','trapdoor'],coast:['rockface','well','facade','trapdoor'],cave:['rockface','hole','facade','ruin'],
  snow:['hole','ruin','facade','barrow'],heights:['rockface','ruin','facade','hole'],void:['ruin','hole','facade','well']};
function entStyleFor(s){const th=p2BaseTheme(s),L=ENT_STYLES[th]||ENT_STYLES.meadow;let zi=0;try{zi=realmOf(s)|0;}catch(e){zi=s|0;}return L[zi%L.length];}
const ENT_CV={};
function entCanvas(th,st){const k=th+':'+st;if(ENT_CV[k])return ENT_CV[k];const W=52,H=46,cv=mkCv(W,H),ctx=cv.getContext('2d'),R=mulberry(hashS(k));
  const f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};const ell=(c,cx,cy,rx,ry)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,7);ctx.fill();};
  const T=THEME[th]||THEME.meadow,stone=T.stone||['#a8a090','#888070','#c8c0b0','#5e5a50'],grass=T.g||['#5ea64c','#4f9441','#72bc5c','#3f8034'];
  const DK='#0a0608',ox=26,base=H-1;// the entrance tile spans x 18..33, y 29..44
  const lamp=(x,y)=>{f('#3a2a1a',x,y,2,9);f('#ffb04a',x-1,y-4,4,4);f('#fff0a0',x,y-3,2,2);};
  if(st==='roots'){ell('#2f6a28',ox,8,22,9);ell('#4a9a3a',ox-8,6,10,6);ell('#4a9a3a',ox+9,7,9,5);f('#5a3a1e',ox-14,12,28,22);f('#7a4e28',ox-12,12,6,22);
    for(let i=0;i<4;i++){const x=ox-20+i*12;ctx.strokeStyle=i%2?'#5a3a1e':'#7a4e28';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox+(x-ox)*.3,24);ctx.quadraticCurveTo(x,26,x+(i<2?-2:2),base);ctx.stroke();}
    ell(DK,ox,base-6,8,9);f(DK,ox-8,base-6,16,6);f('#9ad06a',ox-16,base-3,3,3);f('#9ad06a',ox+14,base-4,3,3);f('#e8f0a0',ox-15,base-2,1,1);}
  else if(st==='barrow'){ell(grass[1],ox,base-4,25,20);ell(grass[0],ox,base-8,20,15);f(stone[1],ox-11,base-21,4,21);f(stone[1],ox+7,base-21,4,21);f(stone[2],ox-13,base-24,26,4);f(stone[3],ox-13,base-21,26,1);
    f(DK,ox-7,base-20,14,20);f(stone[3],ox-7,base-1,14,1);lamp(ox-19,base-9);lamp(ox+17,base-9);}
  else if(st==='well'){ell(stone[3],ox,base-6,19,8);ell(DK,ox,base-7,14,5);for(let a=0;a<20;a++){const an=Math.PI+a/19*Math.PI,x=ox+Math.cos(an)*16,y=base-6+Math.sin(an)*7;if(a%7===3)continue;f(a%2?stone[1]:stone[2],Math.round(x)-2,Math.round(y)-3,4,4);}
    f(stone[2],ox-18,base-5,36,3);f(stone[1],ox-18,base-2,36,2);f('#6a4424',ox-14,base-26,3,20);ctx.strokeStyle='#6a4424';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox-13,base-25);ctx.lineTo(ox+8,base-16);ctx.stroke();
    f('#c8a870',ox-2,base-18,1,11);f(stone[2],ox+15,base-11,5,4);f(stone[1],ox-22,base-4,4,3);lamp(ox+20,base-12);}
  else if(st==='trapdoor'){f('#4a2c14',ox-11,base-14,22,14);f(DK,ox-8,base-12,16,11);for(let y=base-10;y<base;y+=3)f('#7a4e28',ox-5,y,10,1);f('#7a4e28',ox-6,base-12,1,11);f('#7a4e28',ox+5,base-12,1,11);
    f('#8a5a2a',ox-11,base-30,22,15);for(let x=ox-10;x<ox+11;x+=4)f('#6a4424',x,base-30,1,15);f('#3a3a48',ox-11,base-26,22,2);f('#3a3a48',ox-11,base-20,22,2);f('#c8c8d0',ox-1,base-23,2,2);lamp(ox-17,base-9);lamp(ox+16,base-9);}
  else if(st==='rockface'){ctx.fillStyle=stone[1];ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(3,10);ctx.lineTo(14,2);ctx.lineTo(38,0);ctx.lineTo(50,9);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    for(let i=0;i<14;i++)f(R()<.5?stone[2]:stone[3],Math.floor(4+R()*42),Math.floor(4+R()*30),3+Math.floor(R()*5),1);
    f(stone[3],ox-11,base-27,22,27);f(stone[2],ox-12,base-30,24,4);f(DK,ox-8,base-24,16,24);f('#ffd04a',ox-1,base-29,2,2);f('#ffd04a',ox-6,base-28,1,1);f('#ffd04a',ox+5,base-28,1,1);
    f(stone[2],ox-10,base-2,20,2);lamp(ox-15,base-9);lamp(ox+14,base-9);}
  else if(st==='hole'){ell('#5a4028',ox,base-6,20,8);ell('#3a2818',ox,base-7,16,6);ell(DK,ox,base-7,13,5);
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2,x=ox+Math.cos(a)*19,y=base-6+Math.sin(a)*7;f(stone[i%2?1:2],Math.round(x)-2,Math.round(y)-2,4,3);}
    f('#6a4424',ox+8,base-24,2,18);f('#d8403a',ox+10,base-24,7,5);f('#c8a870',ox+1,base-12,1,6);f('#c8a870',ox+4,base-12,1,6);for(let y=base-12;y<base-6;y+=2)f('#c8a870',ox+1,y,4,1);lamp(ox-18,base-9);}
  else{// ruin: broken columns, a fallen arch and stairs going down
    f(stone[1],ox-16,base-30,6,30);f(stone[2],ox-16,base-30,6,2);f(stone[1],ox+10,base-22,6,22);f(stone[2],ox+10,base-22,6,2);f(stone[2],ox-17,base-34,20,5);f(stone[3],ox-17,base-30,20,1);
    f(DK,ox-9,base-20,18,20);for(let y=base-16;y<base;y+=4)f(shade(stone[3],.7),ox-9,y,18,1);f(stone[2],ox+12,base-5,6,4);f(stone[1],ox+18,base-3,4,3);
    f('#4a9a3a',ox-17,base-28,2,10);f('#4a9a3a',ox+11,base-20,2,6);lamp(ox-21,base-9);lamp(ox+20,base-9);}
  return ENT_CV[k]=cv;}
{const o20=obj2;obj2=function(theme,kind,v){if(kind==='facade'&&P2.dm&&P2.dm.kind==='field'){const st=entStyleFor(P2.dm.s);if(st!=='facade')return entCanvas(p2BaseTheme(P2.dm.s),st);}return o20.apply(this,arguments);};}
{const do0=drawObjects;drawObjects=function(ctx,m,y){P2.dm=m;try{return do0.apply(this,arguments);}finally{P2.dm=null;}};}

// ---------------------------------------------------------------- 2.6 dual types come later ----------------------------------------------------------------
const p2Dual=id=>!!(TPL[id]&&TPL[id].el&&TPL[id].el.length>1);
const p2DualOK=()=>!G||!!G.daily||(G.stage|0)>=DUAL_FROM;
// wayfarers: the tavern, the challenge board, rare visitors and chance meetings offer single type wayfarers only in the first realm
{const tp0=tvPool;tvPool=function(){const L=tp0.apply(this,arguments);return p2DualOK()?L:L.filter(id=>!p2Dual(id));};}
{const ce0=challEligible;challEligible=function(){const L=ce0.apply(this,arguments);return p2DualOK()?L:L.filter(c=>!p2Dual(c.hero));};}
{const rp0=rarePool;rarePool=function(){const L=rp0.apply(this,arguments);return p2DualOK()?L:L.filter(id=>!p2Dual(id));};}
{const cp0=cePool;cePool=function(){const L=cp0.apply(this,arguments);return p2DualOK()?L:L.filter(id=>!p2Dual(id));};}
// the journey subset always holds at least four early single type wayfarers, so the first tavern is never empty
{const sr0=subReq;subReq=function(set,must){const need=sr0.apply(this,arguments);try{must=must||[];const early=id=>{const s=TPL[id].src;return (s==='s'||s==='t0')&&!must.includes(id)&&!p2Dual(id);};
  if([...set].filter(early).length<4)need.push(early);}catch(e){}return need;};}
// @sim-begin (tools/v050p2sim.js runs this part in node)
// regular monsters in the first realm show only their first type. Bosses, minibosses, elites, mimics and duels keep both.
function p2SingleFoes(spec,out){if(!spec||!Array.isArray(out)||(G&&G.daily))return out;const k=spec.kind;
  if(!(k==='field'||k==='dungeon')||(spec.stage|0)>=DUAL_FROM)return out;
  out.forEach(e=>{if(e&&!e.boss&&!e.elite&&e.art!=='mimic'&&Array.isArray(e.el)&&e.el.length>1){e.el=[e.el[0]];e.single=1;}});return out;}
HOOK.wrap('encounterFoes','p2world','single types in the first realm (p2SingleFoes)',function(next,...a){let spec=a[0];return p2SingleFoes(spec,next(...a));});
// @sim-end
// the Bestiary says so on a dual type foe's page
{const mb0=typeof mBeast==='function'?mBeast:null;if(mb0)mBeast=function(m){const h=mb0.apply(this,arguments);try{const o=bestAll().find(x=>x.k===m.k);if(!o||o.g||!o.d||!o.d.el||o.d.el.length<2)return h;
  const k=h.indexOf('Roams ');if(k<0)return h;const j=h.indexOf('</',k);if(j<0)return h;
  return h.slice(0,j)+` In the first realm it shows only its ${o.d.el[0][0].toUpperCase()+o.d.el[0].slice(1)} type; both types appear from the second realm on.`+h.slice(j);}catch(e){return h;}};}

// ---------------------------------------------------------------- 2.7 early game hints ----------------------------------------------------------------
// Each hint fires once per account (META.hints keeps the text that was shown), only in the first realm, never in the Daily Trial, and never
// when Settings > Hints is off. It shows as a small card at the top of the screen that never blocks play: Got it closes it, Turn off hints
// stops them. Every hint shown is listed later in Guides > Hints.
const p2Nm=c=>c?(c.name||(TPL[c.id]&&TPL[c.id].n)||c.id):'';
const p2Party=()=>(G&&G.party||[]).map(id=>G.roster[id]).filter(Boolean);
const p2List=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
function p2Role(c,role){try{return classSkills(TPL[c.id]).find(s=>s.role===role&&s.lv<=c.lv)||null;}catch(e){return null;}}
const HINTS=[
 {id:'sheet',on:'world',t:()=>{const c=p2Party()[0];if(!c)return null;const w=(CLS_WPN[TPL[c.id].cls]||[]).map(x=>(WT_NAME[x]||x).toLowerCase()+'s');if(!w.length)return null;
   return `${p2Nm(c)} prefers ${p2List(w)}. Check ${p2Nm(c)}'s sheet in Menu > Party: tap a hero to see stats, skills and gear.`;}},
 {id:'types',on:'battle',t:()=>'Every foe has an element and often a type such as Flying or Armored. Tap a foe to see what hurts it; hitting a weakness deals extra damage.'},
 {id:'flyer',on:'battle',t:()=>{if(!B||!B.en.some(p2Flying))return null;const r=p2Party().filter(c=>{return (DL_CLS[TPL[c.id].cls]||'')==='ranged';});
   return r.length?`${p2List(r.map(p2Nm))} ${r.length>1?'are':'is'} strong against flying foes: ranged shots catch them, while slashes and blows glance off.`:'Flying foes dodge slashes and blows. Ranged shots (bows, crossbows, thrown weapons) and piercing lances catch them.';}},
 {id:'primer',on:'battle',t:()=>{const P=p2Party(),pr=P.map(c=>[c,p2Role(c,'primer')]).find(x=>x[1]),dt=P.map(c=>[c,p2Role(c,'det')]).find(x=>x[1]);
   if(pr&&dt)return `Primers and detonators: ${p2Nm(pr[0])}'s ${pr[1].n} primes a foe with an element, then ${p2Nm(dt[0])}'s ${dt[1].n} sets it off for big damage.`;
   return 'Primers and detonators: a primer skill marks a foe with its element (look for the PRIMED tag), and a detonator skill sets it off for big damage. Some wayfarers learn them with levels.';}},
 {id:'weapons',on:'win',t:()=>{const P=p2Party();if(!P.length)return null;const c=P[P.length>1?1:0],w=(CLS_WPN[TPL[c.id].cls]||[]).map(x=>WT_NAME[x]||x);
   return `Weapon types: each class uses its own weapons, and each weapon family has a perk. ${p2Nm(c)} can use ${p2List(w)}. Compare perks in the Smithy before you buy.`;}},
 {id:'armor',on:'town',t:()=>{const P=p2Party();if(!P.length)return null;const by={};P.forEach(c=>{const a=CLS_ARM[TPL[c.id].cls]||'medium';(by[a]=by[a]||[]).push(p2Nm(c));});
   return 'Armor weights: Heavy for Warriors and Knights, Medium for Archers, Thieves and Monks, Light for Mages, Healers and Bards. '+Object.keys(by).map(a=>`${p2List(by[a])}: ${a[0].toUpperCase()+a.slice(1)}`).join('. ')+'.';}},
 {id:'rest',on:'win',t:()=>{const low=p2Party().filter(c=>c.hp>0&&c.hp<c.S.mhp*.4);if(!low.length)return null;return `${p2List(low.map(p2Nm))} ${low.length>1?'are':'is'} hurt. Rest at the inn in town to restore HP and MP, or use a Potion from Menu > Backpack.`;}}
];
function hintsOn(){return !(META.cfg&&META.cfg.hints===false);}
function hintSeen(id){return !!(META.hints&&META.hints[id]);}
function hintEligible(){return !!(G&&!G.daily&&G.run&&(G.stage|0)<HINTS_UNTIL&&hintsOn());}
function hintFire(ev){try{if(!hintEligible()||P2.hint||P2.hintT)return;for(const h of HINTS){if(h.on!==ev||hintSeen(h.id))continue;const txt=h.t();if(!txt)continue;
    P2.hintT=setTimeout(()=>{P2.hintT=null;if(!hintEligible()||hintSeen(h.id))return;hintShow(h.id,txt);},HINT_DELAY);return;}}catch(e){}}
function hintShow(id,txt){META.hints=META.hints||{};META.hints[id]=txt;saveMeta();P2.hint=id;
  let d=document.getElementById('p2hint');if(!d){d=document.createElement('div');d.id='p2hint';d.setAttribute('role','status');document.body.appendChild(d);}
  d.innerHTML=`<b>Hint</b><span>${esc(txt)}</span><div class="btnrow"><button class="btn sm gold" data-act="hintOk">Got it</button><button class="btn sm" data-act="hintOff">Turn off hints</button></div>`;d.className='show'+(V.screen==='battle'?' bat':'');hintPlace(d);
  clearTimeout(P2.hintHide);P2.hintHide=setTimeout(()=>{if(P2.hint===id)ACT.hintOk();},16000);}
// v0.5.1: in battle the hint sits in the sky at the top of the stage, never over the cards, shield pips or commands
function hintPlace(d){d=d||document.getElementById('p2hint');if(!d)return;const w=V.screen==='battle'&&document.getElementById('bwrap');
  if(!w){d.style.top='';d.style.bottom='';d.style.left='';d.style.maxWidth='';return;}const r=w.getBoundingClientRect();
  d.style.top=Math.round(r.top+30)+'px';d.style.bottom='auto';d.style.left=Math.round(r.left+r.width/2)+'px';d.style.maxWidth=Math.round(Math.min(420,r.width-16))+'px';}
window.addEventListener('resize',()=>{try{hintPlace();}catch(e){}});
ACT.hintOk=function(){P2.hint=null;const d=document.getElementById('p2hint');if(d)d.className='';};
ACT.hintOff=function(){META.cfg.hints=false;saveMeta();ACT.hintOk();toast('Hints are off. Turn them back on in Settings; past hints stay in Guides > Hints.');if(V.modal)render();};
ACT.hintsReset=function(){META.hints={};META.cfg.hints=true;saveMeta();toast('Hints will show again in the first realm.');render();};
// triggers
{const sl0=showLocation;showLocation=function(){const r=sl0.apply(this,arguments);try{const m=WS.m;hintFire(m&&m.kind==='town'&&(G.stats&&G.stats.battles)?'town':'world');}catch(e){}return r;};}
HOOK.after('startBattle','p2world','battle hint',function(r){try{if(r!==false&&B&&!G.daily)hintFire('battle');}catch(e){}});
HOOK.after('finishBattle','p2world','win hint',function(r,how){try{if(how==='win')setTimeout(()=>hintFire('win'),600);}catch(e){}});
// Settings row and the Guides > Hints page
{const st0=settingsBody;settingsBody=function(){const h=st0.apply(this,arguments),on=hintsOn();
  const row=`<div class="rows"><div class="row"><div><b>Hints</b><small>Short tips in the first realm. Each shows once; read them again in Guides > Hints.</small></div><div class="chips"><button class="chip ${on?'on':''}" data-act="cfg" data-arg='["hints",true]'>On</button><button class="chip ${on?'':'on'}" data-act="cfg" data-arg='["hints",false]'>Off</button></div></div></div>`;
  return h+row;};}
try{const gd=MENU_GROUPS.find(g=>g[0]==='guides');if(gd&&!gd[2].includes('hints'))gd[2].splice(Math.max(0,gd[2].indexOf('help')),0,'hints');MENU_SUB.hints='Hints';}catch(e){}
function vHints(){const H=META.hints||{},seen=HINTS.filter(h=>H[h.id]);
  return `<p class="note">Tips from your first steps, kept here once they have shown. ${seen.length} of ${HINTS.length} seen. Hints are ${hintsOn()?'on':'off'} (Settings).</p>`+
    (seen.length?`<div class="rows">${seen.map(h=>`<div class="row"><div><small>${esc(H[h.id])}</small></div></div>`).join('')}</div>`:'<p class="note">No hints yet. They show during the first realm.</p>')+
    `<div class="btnrow"><button class="btn sm" data-act="cfg" data-arg='["hints",${hintsOn()?'false':'true'}]'>${hintsOn()?'Turn hints off':'Turn hints on'}</button><button class="btn sm" data-act="hintsReset">Show them again</button></div>`;}
{const mm1=mMenu;mMenu=function(m){if(!m||m.tab!=='hints')return mm1.apply(this,arguments);
  const html=mm1.apply(this,arguments),tabs=menuTabsHtml(menuGroupOf('hints'),'hints'),k=html.indexOf(tabs);return k<0?html:html.slice(0,k+tabs.length)+vHints()+html.slice(k+tabs.length);};}
try{const css=document.createElement('style');css.textContent=`#p2hint{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 54px);transform:translate(-50%,-8px);z-index:60;max-width:min(92vw,420px);box-sizing:border-box;
  background:rgba(20,14,30,.94);color:#f4ecd8;border:1px solid #ffd04a;border-radius:10px;padding:6px 9px;font-size:12px;line-height:1.3;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;box-shadow:0 4px 18px rgba(0,0,0,.5)}
  #p2hint.show{opacity:1;pointer-events:auto;transform:translate(-50%,0)}#p2hint.bat{top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 10px)}#p2hint .btn{padding:3px 8px;font-size:12px}#p2hint b{color:#ffd04a;margin-right:6px}#p2hint .btnrow{margin-top:4px;display:flex;gap:6px;justify-content:flex-end}
  @media (prefers-reduced-motion:reduce){#p2hint{transition:none}}`;document.head.appendChild(css);}catch(e){}

// ---------------------------------------------------------------- test hook ----------------------------------------------------------------
try{window.__P2={P2,hintShow,hintPlace,bgGroundAt,bgPaintGround,BG_GROUNDS,BG_NATURAL,p2GroundY,p2Flying,nodeFits,laneFix,laneFind,laneMain,laneGates,laneStraight,laneMove,entStyleFor,entCanvas,ENT_STYLES,
  p2SingleFoes,p2Dual,p2DualOK,HINTS,hintFire,hintShow,vHints,
  get BG(){return BG},get BG_HAZ(){return BG_HAZ},bgGY,bgStatic,get BL(){return BL},get B(){return B},get G(){return G},get MAPS(){return MAPS},get WS(){return WS},get META(){return META},
  getMap:HOOK.snap('getMap'),tileAt,flood,SOLID,ZS,realmOf,unitBox,battleTheme,battleFrame,startBattle:HOOK.snap('startBattle'),encounterFoes:HOOK.snap('encounterFoes'),roamFight,roamSpawn,turnOrder,tvPool,challEligible,cePool,rarePool,ensureSub,genSub,subReq,TPL,MON,ZONES,TOWNGEN,
  obj2,placeNodes,drawObjects,layoutBattle};}catch(e){}
