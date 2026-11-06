// ===== roam.js (v0.4.1): roaming dungeon foes (v0.9.5: and field foes; the realm's roles among them; ordinary fights pay more) =====
// Visible foes patrol the rooms of main dungeons. Touching one (or being caught) starts a battle; they can be avoided: they patrol
// back and forth inside rooms, see only a short cone ahead (ROAM.sight tiles), and move slower than you even when they chase.
// They spawn only on open room tiles (never corridors, never near the entrance, never on stairs, chests, levers or doors), so a
// required path is never blocked: a chaser gives up and walks home. They are tougher than random battles, and a few are elites
// (no auto). Random battles still happen in dungeons. Beaten roamers stay beaten for this journey (G.roamDead, optional).
// ROAM: in config.js
function roamOpen(m,x,y){const c=tileAt(m,x,y);return m.kind==='field'?(c===','||c==='.'):c==='.';}
function roamInterior(m,x,y){if(!roamOpen(m,x,y))return false;let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&roamOpen(m,x+dx,y+dy))n++;return n>=7;}
// v0.9.5: places a roamer keeps away from on a field: exits, caves, the dungeon door, side sites and people
function roamKeepOut(m){const L=[];(m.exits||[]).forEach(e=>L.push([e.x,e.y]));(m.caves||[]).forEach(c=>L.push([c.x,c.y]));if(m.ent)L.push([m.ent[0],m.ent[1]]);
  (m.npcs||[]).forEach(n=>L.push([n.x,n.y]));if(m.start)L.push(m.start);return L;}
function roamCanSpawn(m){return !!m&&!m.safe&&!m.archive&&!m.sanctum&&!!G&&!G.daily&&(m.kind==='dungeon'?!(m.cave||m.fort):m.kind==='field'&&!!(ROAM.field&&ROAM.field.base>0));}
// v0.9.5: the realm's foe roles first (one roamer each), then the rest of the pool at random
function roamPick(R,pool,n){const out=[];if(ROAM.roles&&typeof b4RoleOfMon==='function'){const seen={};pool.forEach(k=>{const r=MON[k]&&b4RoleOfMon(MON[k]);if(r&&!seen[r]){seen[r]=1;out.push(k);}});}
  while(out.length<n)out.push(pool[Math.floor(R()*pool.length)]);return out.slice(0,n);}
function roamSpawn(m){
  if(!roamCanSpawn(m))return [];if(m.roam)return m.roam;
  const R=seeded((hashS(m.id)+((G.run&&G.run.seed)||0))>>>0),s=m.s|0,st=m.start||[0,0],spots=[],fld=m.kind==='field',keep=fld?roamKeepOut(m):[],kd=fld?ROAM.field.minFromExit:0;
  for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++){if(!fld&&Math.abs(x-st[0])+Math.abs(y-st[1])<ROAM.minFromStart)continue;if(WS.m===m&&Math.abs(x-WS.x)+Math.abs(y-WS.y)<6)continue;
    if(fld&&keep.some(([kx,ky])=>Math.abs(x-kx)+Math.abs(y-ky)<kd))continue;if(roamInterior(m,x,y))spots.push([x,y]);}
  const n=fld?ROAM.field.base+ROAM.field.perStage*s:ROAM.base+ROAM.perStage*s,dead=(G.roamDead||{})[m.id]||[],pool=ZS(s).pool,out=[];
  // the realm's roles go first (the monster picks have their own seeded stream)
  const mons=roamPick(seeded((hashS(m.id+'role')+((G.run&&G.run.seed)||0))>>>0),pool,n);
  for(let i=0;i<n&&spots.length;i++){const k=Math.floor(R()*spots.length),[x,y]=spots.splice(k,1)[0];
    // keep them apart
    for(let j=spots.length-1;j>=0;j--)if(Math.abs(spots[j][0]-x)+Math.abs(spots[j][1]-y)<6)spots.splice(j,1);
    const elite=R()<ROAM.elite,mon=mons[i],mod=elite?ELITE_MODS[Math.floor(R()*ELITE_MODS.length)].k:null;
    out.push({i,x,y,hx:x,hy:y,dir:['u','d','l','r'][Math.floor(R()*4)],mon,elite,mod,name:elite?`${MON[mon].n} ${ELITE_TITLES[Math.floor(R()*ELITE_TITLES.length)]}`:MON[mon].n,dead:dead.includes(i),t:0,mode:'patrol',lost:0,rest:0,role:(typeof b4RoleOfMon==='function'&&b4RoleOfMon(MON[mon]))||null});}
  m.roam=out;return out;}
function roamSees(m,r,px,py){const [dx,dy]=DIRV[r.dir],vx=px-r.x,vy=py-r.y,fw=vx*dx+vy*dy,side=Math.abs(vx*dy-vy*dx);
  if(fw<1||fw>ROAM.sight||side>Math.ceil(fw/2))return false;
  // line of sight: every tile on the way must be open floor
  const steps=Math.max(Math.abs(vx),Math.abs(vy));for(let k=1;k<steps;k++){const x=Math.round(r.x+vx*k/steps),y=Math.round(r.y+vy*k/steps);if(SOLID.includes(tileAt(m,x,y)))return false;}return true;}
function roamTick(m,now){
  const L=m.roam;if(!L||V.modal||WS.dlg||WS.lock)return;const px=WS.x,py=WS.y;
  for(const r of L){if(r.dead||now<r.rest)continue;
    // contact: on the same tile, or where you are stepping
    if((r.x===px&&r.y===py)||(WS.mv&&r.x===WS.mv.tx&&r.y===WS.mv.ty)){roamFight(m,r);return;}
    if(r.mode==='patrol'&&roamSees(m,r,px,py)){r.mode='chase';r.lost=0;if(typeof sfx==='function')sfx('encounter');}
    const ms=r.mode==='chase'?ROAM.chaseMs:ROAM.patrolMs;if(now-r.t<ms)continue;r.t=now;r.fx=r.x;r.fy=r.y;r.t0=now;
    if(r.mode==='chase'){const d=Math.abs(px-r.x)+Math.abs(py-r.y);if(d>ROAM.giveUp||++r.lost>40){r.mode='home';continue;}
      const opts=[['r',1,0],['l',-1,0],['d',0,1],['u',0,-1]].filter(([,a,b])=>{const c=tileAt(m,r.x+a,r.y+b);return !SOLID.includes(c)&&c!=='E'&&!(m.exits||[]).some(e=>e.x===r.x+a&&e.y===r.y+b);});
      opts.sort((A,B)=>(Math.abs(px-(r.x+A[1]))+Math.abs(py-(r.y+A[2])))-(Math.abs(px-(r.x+B[1]))+Math.abs(py-(r.y+B[2]))));
      if(opts.length){const [d2,a,b]=opts[0];r.dir=d2;r.x+=a;r.y+=b;}}
    else if(r.mode==='home'){if(r.x===r.hx&&r.y===r.hy){r.mode='patrol';continue;}const a=Math.sign(r.hx-r.x),b=a?0:Math.sign(r.hy-r.y);
      const nx=r.x+a,ny=r.y+b;if(!SOLID.includes(tileAt(m,nx,ny))){r.x=nx;r.y=ny;r.dir=a>0?'r':a<0?'l':b>0?'d':'u';}else{r.x=r.hx;r.y=r.hy;r.mode='patrol';}}
    else{// patrol: keep walking inside the room, turn at walls and room edges, never wander more than 4 tiles from home
      const [a,b]=DIRV[r.dir],nx=r.x+a,ny=r.y+b;
      if(roamInterior(m,nx,ny)&&Math.abs(nx-r.hx)+Math.abs(ny-r.hy)<=4){r.x=nx;r.y=ny;}
      else r.dir=Math.random()<.6?{u:'d',d:'u',l:'r',r:'l'}[r.dir]:['u','d','l','r'][Math.floor(Math.random()*4)];}
    if(r.x===px&&r.y===py){roamFight(m,r);return;}}}
function roamFight(m,r){haltInput();WS.lock=true;WS.flash=performance.now();if(typeof sfx==='function')sfx('encounter');
  later(()=>{WS.lock=false;startBattle({stage:m.s,kind:'dungeon',roam:{mid:m.id,i:r.i,mon:r.mon,elite:r.elite,mod:r.mod,name:r.name}});},420);}
// battles: a tougher lead (an elite for some) with company from the realm
{const ef0=encounterFoes;encounterFoes=function(spec){if(!spec||!spec.roam)return ef0.apply(this,arguments);
  const s=spec.stage,ro=spec.roam,band=STAGE_LV[s],lv=band[1]+ROAM.lvUp+ngLvOff(),Z=ZS(s),out=[];
  out.push(ro.elite?makeEnemy(MON[ro.mon],lv,{elite:true,name:ro.name,mod:ro.mod,hpM:3,powM:1.35}):makeEnemy(MON[ro.mon],lv,{hpM:ROAM.hpM,powM:ROAM.powM}));
  const n=ro.elite?1:1+(RNG()<.5?1:0);for(let i=0;i<n;i++)out.push(makeEnemy(MON[pick(Z.pool)],lv-1));
  const cnt={};out.forEach(e=>{cnt[e.name]=(cnt[e.name]||0)+1;});const seen={};out.forEach(e=>{if(cnt[e.name]>1){seen[e.name]=(seen[e.name]||0)+1;e.name+=' '+String.fromCharCode(64+seen[e.name]);}});
  return out;};}
{const ab0=autoBan;autoBan=function(spec){const r=ab0.apply(this,arguments);if(r)return r;if(spec&&spec.roam&&spec.roam.elite&&G&&!G.daily)return 'No auto in elite fights';return null;};}
{const fb0=finishBattle;finishBattle=function(how){const sp=B&&B.spec,ro=sp&&sp.roam;const r=fb0.apply(this,arguments);
  try{if(ro&&G){const m=MAPS[ro.mid],R=m&&m.roam&&m.roam.find(q=>q.i===ro.i);
    if(how==='win'){G.roamDead=G.roamDead||{};const L=G.roamDead[ro.mid]=G.roamDead[ro.mid]||[];if(!L.includes(ro.i))L.push(ro.i);if(R)R.dead=true;}
    else if(R){R.x=R.hx;R.y=R.hy;R.mode='patrol';R.rest=performance.now()+4000;}}}catch(e){}return r;};}
{const wt0=worldTick;worldTick=function(dt,now){wt0.apply(this,arguments);try{const m=WS.m;if(V.screen==='world'&&m&&(m.kind==='dungeon'||m.kind==='field')){if(!m.roam)roamSpawn(m);if(m.roam)roamTick(m,now);}}catch(e){}};}
// drawing: the foe's own sprite at small size, a gold ring for elites, a faint sight cone, a "!" while chasing
{const wd0=worldDraw;worldDraw=function(now){wd0(now);try{const m=WS.m;if(!m||!m.roam||(m.kind!=='dungeon'&&m.kind!=='field'))return;const ctx=WS.ctx,cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y),still=typeof reducedMotion==='function'&&reducedMotion();
  m.roam.forEach(r=>{if(r.dead)return;let x=r.x*TS,y=r.y*TS;if(r.t0&&r.fx!=null){const p=Math.min(1,(now-r.t0)/(r.mode==='chase'?ROAM.chaseMs:ROAM.patrolMs));x=(r.fx+(r.x-r.fx)*p)*TS;y=(r.fy+(r.y-r.fy)*p)*TS;}
    x-=cx;y-=cy;if(x<-40||y<-40||x>WS.vw+40||y>WS.vh+40)return;
    const [a,b]=DIRV[r.dir],S=ROAM.sight*TS;ctx.save();ctx.fillStyle=r.mode==='chase'?'rgba(255,90,60,.16)':'rgba(255,230,150,.09)';ctx.beginPath();ctx.moveTo(x+8,y+8);
    ctx.lineTo(x+8+a*S-b*S/2,y+8+b*S-a*S/2);ctx.lineTo(x+8+a*S+b*S/2,y+8+b*S+a*S/2);ctx.closePath();ctx.fill();ctx.restore();
    const img=imgOf('rm:'+MON[r.mon].art,()=>monCanvas(MON[r.mon].art)),sz=22,bob=still?0:Math.floor(now/300+r.i)%2;
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x+2,y+13,12,3);
    if(r.elite){ctx.strokeStyle='#ffc83d';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+8,y+14,9,3,0,0,6.283);ctx.stroke();}
    ctx.drawImage(img,x+8-sz/2,y+14-sz-bob,sz,sz);
    if(r.mode==='chase'){ctx.fillStyle='#ff5a3a';ctx.fillRect(x+7,y-16,2,5);ctx.fillRect(x+7,y-10,2,2);}});}catch(e){}};}
// v0.9.5: fewer random battles, so an ordinary fight pays more (ENC in config.js): random field and dungeon battles and roamers.
// Read once per win through facMul, the same hook as the NG+ modifiers. Bosses, elites, minibosses, the arena and the Trial are untouched.
function encRewMul(){try{if(!B||!G||G.daily||!B.spec)return null;const sp=B.spec;if((sp.kind!=='field'&&sp.kind!=='dungeon')||sp.mini||B.en.some(e=>e.boss))return null;
  const r=ENC.rew,q=sp.roam?ENC.roam:{xp:1,gold:1},st=Math.min(4,(B.stage|0)),at=v=>Array.isArray(v)?v[st]:v;return {xp:at(r.xp)*q.xp,gold:at(r.gold)*q.gold};}catch(e){return null;}}
if(typeof facMul==='function'){const fm1=facMul;facMul=function(){const r=Object.assign({},fm1.apply(this,arguments));const k=encRewMul();if(k){r.xp*=k.xp;r.gold*=k.gold;}return r;};}
