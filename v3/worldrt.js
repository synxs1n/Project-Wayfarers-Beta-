// =================== OVERWORLD RUNTIME ===================
// v0.4.0 1.4: one place that stops every kind of overworld movement input (keys, pad, joystick, tap paths)
const KEYS_DOWN=new Set();
function haltInput(){WS.held=[];WS.padDir=null;WS.joyDir=null;WS.target=null;WS.path=null;WS.pathFor=null;WS.pathAt=null;WS.touchDir=null;WS.run=false;WS.swallow=new Set(KEYS_DOWN);WS.padHold=true;
  try{TOUCH.joy=null;TOUCH.map=null;}catch(_){}const k=document.getElementById('knob');if(k)k.style.transform='';const j=document.getElementById('joy');if(j)j.classList.remove('on');}
const WS={m:null,base:[null,null],x:0,y:0,px:0,py:0,cam:null,dir:'r',face:'r',mv:null,held:[],steps:0,dlg:null,flash:0,lock:false,scale:3,vw:320,vh:200,cv:null,ctx:null,run:false,dark:null};
function locName(m){if(m.archive)return m.hub||'The Archive';if(m.cave)return m.name;const Z=ZS(m.s);return m.kind==='town'?Z.town:m.kind==='field'?Z.n:Z.dungeon;}
function placeAt(mid,x,y,face){
  const m=getMap(mid);WS.m=m;WS.x=x;WS.y=y;WS.px=x*TS;WS.py=y*TS;WS.mv=null;WS.face=face==='l'?'l':'r';WS.dir=face==='l'?'l':face==='u'?'u':face==='d'?'d':'r';
  rebuildBase();WS.cam=null;
  G.pos={m:mid,x,y,f:WS.face};
  if(m.kind==='town'){G.lastTown=m.s;if(!G.visited.includes(m.s))G.visited.push(m.s);if(m.s<=G.stage){genQuests(m.s);genBounties(m.s);}if(G.cleared[m.s])festive(m);}
  if((m.kind==='field'||m.kind==='town')&&!G.weather[m.s])rollWeather(m.s);WS.wT=performance.now();
  WS.steps=0;
}
function scanLights(m){
  m.tl=[];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=tileAt(m,x,y);
    if(c==='L')m.tl.push([x*TS+8,y*TS-6,24,'lamp']);else if(c==='v')m.tl.push([x*TS+8,y*TS+2,30,'fire']);else if(c==='W')m.tl.push([x*TS+8,y*TS,20,'cyan']);
    else if(c==='G')m.tl.push([x*TS+8,y*TS-2,26,'gold']);else if(c==='K')m.tl.push([x*TS+8,y*TS+8,18,'cyan']);
    else if(c==='P'&&(m.theme==='cave'||m.theme==='void'))m.tl.push([x*TS+8,y*TS,16,'violet']);
    else if(c==='~'&&m.theme==='cave'&&(x+y)%3===0)m.tl.push([x*TS+8,y*TS+8,22,'lava']);
    else if(c==='N'&&m.kind==='field'&&G.cleared[m.s])m.tl.push([x*TS+8,y*TS-4,18,'cyan']);}
}
function rebuildBase(){if(!WS.m)return;WS.base=[buildMapCanvas(WS.m,0),buildMapCanvas(WS.m,1)];scanLights(WS.m);}
function enterVia(to){
  const m=getMap(to.m);
  if(to.g&&m.gates&&m.gates[to.g]){ // v0.4.0 5.2: connected world, arrive at the matching gate
    const a=m.gates[to.g].arrive;if(m.kind==='field'&&G.weather[m.s]==null)rollWeather(m.s);
    placeAt(to.m,a[0],a[1],a[2]);
    if(m.kind==='town'&&!G.seenIntro[m.s]&&m.s>0){G.seenIntro[m.s]=1;V.modal={type:'story',title:ZS(m.s).town,text:ZS(m.s).intro,btn:'Continue'};render();}
    saveGame();showLocation();return;}
  if(m.kind==='field'){if(G.weather[m.s]==null)rollWeather(m.s);if(to.side==='w')placeAt(to.m,2,m.sy,'r');else placeAt(to.m,m.w-3,m.ey,'l');}
  else{if(to.side==='w')placeAt(to.m,1,m.road,'r');else placeAt(to.m,m.w-2,m.road,'l');}
  if(m.kind==='town'&&!G.seenIntro[m.s]&&m.s>0){G.seenIntro[m.s]=1;V.modal={type:'story',title:ZS(m.s).town,text:ZS(m.s).intro,btn:'Continue'};render();}
  saveGame();showLocation();
}
function enterDungeon(s){const d=getMap('d'+s);placeAt('d'+s,d.start[0],d.start[1]-1,'d');// you arrive standing on the stairs and can step off any open way
  showLocation();saveGame();if(typeof sfx==='function')sfx('door');}
function leaveDungeon(s){const f=getMap('f'+s);if(G.weather[s]==null)rollWeather(s);const o=f.entOut||[f.ent[0],f.ent[1]+1],v=f.entFace||[0,1];placeAt('f'+s,o[0],o[1],v[1]>0?'d':v[1]<0?'u':v[0]<0?'l':'r');showLocation();saveGame();}
// v0.4.0 5.3: side caves. Ids are 'k'+stage; the cave's one way out is its stairs.
function enterCave(c,s){const k=getMap(c.id);G.been=G.been||{};G.cavesSeen=G.cavesSeen||{};G.cavesSeen[c.id]=1;
  placeAt(c.id,k.start[0],k.start[1]-1,'d');showLocation();saveGame();if(typeof sfx==='function')sfx('door');}
function leaveCave(id){const s=+id.slice(1),f=getMap('f'+s),c=f.caves.find(q=>q.id===id);placeAt('f'+s,c.out[0],c.out[1],c.face[1]>0?'d':c.face[1]<0?'u':c.face[0]<0?'l':'r');showLocation();saveGame();}
function innSpot(s){const m=getMap('t'+s),b=m.bld.find(b=>b.k==='inn');return [b.door[0],b.door[1]+1];}
function showLocation(){const m=WS.m;if(!m)return;setTimeout(()=>{if(typeof renderWorldUI==='function')renderWorldUI();},0);WS.locT=Date.now();WS.locN=locName(m)+(m.kind==='field'&&G.cleared[m.s]?' (relit)':'')+(m.kind==='field'&&G.weather[m.s]&&G.weather[m.s]!=='clear'?' · '+WEATHER[G.weather[m.s]].n:'');if(typeof vHeader==='function'&&document.getElementById('hdr'))document.getElementById('hdr').innerHTML=vHeader();if(typeof playMusic==='function')playMusic(musicFor());}
function musicFor(){const m=WS.m;if(!m)return 'title';if(m.archive)return 'archive';return m.kind==='dungeon'?'dungeon':m.kind==='town'?'town':'field';}
const DIRV={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0],ul:[-1,-1],ur:[1,-1],dl:[-1,1],dr:[1,1]};
// v0.4.1 1.10: every input source keeps its own state and a timestamp of when it last changed; the most recent active source wins.
// Sources: kb (keys held), pad (gamepad stick or d-pad), joy (on-screen joystick), drag (touch drag), tap (tap to walk).
function inputSources(){const c=[];
  if(WS.held.length)c.push(['kb',WS.kbT||0]);if(WS.padDir)c.push(['pad',WS.padT||0]);if(WS.joyDir)c.push(['joy',WS.joyT||0]);
  if(WS.touchDir)c.push(['drag',WS.dragT||0]);if(WS.target)c.push(['tap',WS.tapT||0]);
  return c.sort((a,b)=>b[1]-a[1]);}
function inputActive(){return !!(WS.held.length||WS.padDir||WS.joyDir||WS.touchDir||WS.target);}
function inputTouch(src){WS[{kb:'kbT',pad:'padT',joy:'joyT',drag:'dragT',tap:'tapT'}[src]]=performance.now();}
function worldInputDir(){
  const top=(inputSources()[0]||[])[0];
  if(top==='kb'){const last=WS.held[WS.held.length-1];if(last.length===2)return last;
    const rv=WS.held.slice().reverse(),h=rv.find(k=>k==='l'||k==='r'),v=rv.find(k=>k==='u'||k==='d');return h&&v?v+h:last;}
  if(top==='pad')return WS.padDir;
  if(top==='joy')return WS.joyDir;
  if(top==='drag')return WS.touchDir;
  const T=WS.target,m=WS.m;if(!T||!m)return null;
  if(T[0]===WS.x&&T[1]===WS.y){WS.target=null;return null;}
  // real pathfinding so taps route around lamps, trees and walls
  if(!WS.path||WS.pathFor!==T+''||WS.pathAt!==WS.x+','+WS.y){WS.path=findPath(m,WS.x,WS.y,T[0],T[1]);WS.pathFor=T+'';}
  if(!WS.path||!WS.path.length){WS.target=null;WS.path=null;return null;}
  if(WS.path[0].startsWith('face:')){const f=WS.path[0].slice(5);WS.target=null;WS.path=null;WS.dir=f;if(f==='l'||f==='r')WS.face=f;setTimeout(()=>{if(!WS.mv&&!WS.dlg&&!V.modal)interact();},0);return null;}
  const d=WS.path.shift(),[a,b]=DIRV[d];WS.pathAt=(WS.x+a)+','+(WS.y+b);
  if(!WS.path.length){WS.target=null;WS.path=null;}
  return d;
}
function walkable(m,x,y,d){const c=tileAt(m,x,y),door=m.bld.some(q=>q.door[0]===x&&q.door[1]===y);
  return !solidAt(m,x,y)||m.exits.some(e=>e.x===x&&e.y===y)||(door&&d==='u')||c==='X'||c==='G';}
function findPath(m,sx,sy,tx,ty){
  const W=m.t[0].length,H=m.t.length;if(tx<0||ty<0||tx>=W||ty>=H)return null;
  const prev=new Map(),key=(x,y)=>y*W+x,q=[[sx,sy]];prev.set(key(sx,sy),null);
  const goalSolid=!walkable(m,tx,ty,'u');let best=null;
  while(q.length){const [x,y]=q.shift();
    if((x===tx&&y===ty)||(goalSolid&&Math.abs(x-tx)+Math.abs(y-ty)===1)){best=[x,y];break;}
    if(prev.size>4000)break;
    for(const d of ['u','d','l','r','ul','ur','dl','dr']){const [a,b]=DIRV[d],nx=x+a,ny=y+b,k=key(nx,ny);
      if(nx<0||ny<0||nx>=W||ny>=H||prev.has(k))continue;
      const goal=nx===tx&&ny===ty;
      if(d.length===2&&!diagOk(m,x,y,d))continue;
      // only path *through* plain floor; doors, exits and stairs count only as the final step
      if(goal?!walkable(m,nx,ny,d):solidAt(m,nx,ny)||m.exits.some(e=>e.x===nx&&e.y===ny)||'EXG'.includes(tileAt(m,nx,ny)))continue;
      prev.set(k,[x,y,d]);q.push([nx,ny]);}}
  if(!best)return null;const out=[];let k=key(best[0],best[1]);
  while(prev.get(k)){const [px,py,d]=prev.get(k);out.unshift(d);k=key(px,py);}
  if(goalSolid&&best){const d=tx>best[0]?'r':tx<best[0]?'l':ty>best[1]?'d':'u';out.push('face:'+d);}
  return out;
}
function stepMs(){return WS.run?100:155;}
function worldTick(dt,now){
  if(V.screen!=='world'||!WS.m)return;
  const m=WS.m;
  npcTick(m,now);
  // Beta v0.3.1: weather now changes by steps walked (world3.js wxStep), not by the real-time clock
  if(WS.lock&&!V.modal&&WS.fade&&now-WS.fade>2500)WS.lock=false;// watchdog: no fade lasts this long
  if(V.modal||WS.dlg||WS.lock)return;
  if(WS.mv){
    const p=Math.min(1,(now-WS.mv.t0)/WS.mv.dur);
    WS.px=(WS.mv.fx+(WS.mv.tx-WS.mv.fx)*p)*TS;WS.py=(WS.mv.fy+(WS.mv.ty-WS.mv.fy)*p)*TS;
    if(p>=1){WS.x=WS.mv.tx;WS.y=WS.mv.ty;const carry=now-WS.mv.t0-WS.mv.dur;WS.mv=null;WS.steps++;arrive();
      // chain straight into the next step so held movement never hitches
      if(!WS.mv&&!WS.lock&&!V.modal&&!WS.dlg&&inputActive())tryStep(now-Math.min(carry,40));}
    return;
  }
  tryStep(now);
}
// v5.0: 8-direction movement. Diagonals move one tile on each axis but take sqrt(2) as long, never cut a corner past
// a wall or object, and never step diagonally onto doors, exits, stairs or other special tiles (those fall back to straight moves).
const DIAG_MS=1.414;
function diagOk(m,x,y,d){const [dx,dy]=DIRV[d],tx=x+dx,ty=y+dy;
  if(solidAt(m,x+dx,y)||solidAt(m,x,y+dy)||solidAt(m,tx,ty))return false;
  const c=tileAt(m,tx,ty);if('EXGD|'.includes(c))return false;
  if(m.exits.some(e=>e.x===tx&&e.y===ty)||m.bld.some(b=>b.door[0]===tx&&b.door[1]===ty))return false;
  if(dynActors(m).some(a=>(a.x===tx&&a.y===ty)||(a.x===x+dx&&a.y===y)||(a.x===x&&a.y===y+dy)))return false;
  return true;}
function tryStep(now){
  const m=WS.m,d=worldInputDir();if(!d)return;
  if(d.length===2){const v=d[0],h=d[1];
    if(diagOk(m,WS.x,WS.y,d)){WS.dir=h;WS.face=h;const [dx,dy]=DIRV[d];WS.mv={fx:WS.x,fy:WS.y,tx:WS.x+dx,ty:WS.y+dy,t0:now,dur:stepMs()*DIAG_MS};return;}
    // blocked diagonally: slide along whichever straight direction is open
    for(const k of [h,v]){const [a,b]=DIRV[k];if(!solidAt(m,WS.x+a,WS.y+b))return tryStepDir(now,k);}
    return tryStepDir(now,h);}
  return tryStepDir(now,d);
}
function tryStepDir(now,d){
  const m=WS.m;
  WS.dir=d;if(d==='l'||d==='r')WS.face=d;
  const [dx,dy]=DIRV[d],nx=WS.x+dx,ny=WS.y+dy;
  const ex=m.exits.find(e=>e.x===nx&&e.y===ny);
  if(ex&&!ex.to){bumpSay(ex.msg);return;}
  const c=tileAt(m,nx,ny);
  const b=m.bld.find(b=>b.door[0]===nx&&b.door[1]===ny);
  if(b&&d==='u'){WS.held=[];enterBuilding(b);return;}
  if(c==='X'&&!G.cleared[m.s]){haltInput();askBoss();return;}
  if(c==='X'&&G.cleared[m.s]&&typeof askEcho==='function'){WS.held=[];askEcho(m.s);return;}
  if(c==='G'){bumpSay(`The gate is sealed with a ${bossClass(bossKeyFor(m.s))}'s sigil. Defeat whatever lurks in the ${ZS(m.s).dungeon} to break it.`);return;}
  if(c==='D'){bumpSay('A heavy door with a beacon-shaped keyhole. The key must be somewhere in these halls.');return;}
  if(c==='|'){bumpSay(barsText(m,nx,ny));return;}
  const act=dynActors(m).find(a=>a.x===nx&&a.y===ny);if(act){WS.held=[];actorTalk(act);return;}
  if(solidAt(m,nx,ny))return;
  WS.mv={fx:WS.x,fy:WS.y,tx:nx,ty:ny,t0:now,dur:stepMs()};
}
// v0.4.0 6.3: the bars on the key room say what is behind them; one lever somewhere in the dungeon raises every set
function barsText(m,x,y){
  if(m.keyBar&&m.keyBar[0]===x&&m.keyBar[1]===y)return 'Iron bars. Behind them, on a pedestal, a beacon-shaped key glints. A lever somewhere in these halls raises the bars. Look down the side passages, far from the entrance.';
  if(m.vaultBar&&m.vaultBar[0]===x&&m.vaultBar[1]===y)return 'Iron bars over an old vault. The same lever that frees the key room raises these too.';
  return 'Iron bars block the way. There must be a lever somewhere.';
}
function bumpSay(msg){if(!WS.bumpT||performance.now()-WS.bumpT>1400){WS.bumpT=performance.now();say(null,msg);}}
function npcTick(m,now){
  m.npcs.forEach(n=>{
    if(n.mv){const p=(now-n.mv.t0)/420;if(p>=1)n.mv=null;return;}
    if(!n.wander||WS.dlg)return;
    if(!n.nextT){n.nextT=now+1000+Math.random()*3000;return;}
    if(now<n.nextT)return;n.nextT=now+1600+Math.random()*3400;
    const ds=['u','d','l','r'],d=ds[Math.floor(Math.random()*4)],[dx,dy]=DIRV[d],tx=n.x+dx,ty=n.y+dy;
    if(Math.abs(tx-n.hx)>2||Math.abs(ty-n.hy)>2)return;
    const c=tileAt(m,tx,ty);if(!'.:=,f'.includes(c))return;
    if(solidAt(m,tx,ty)||(tx===WS.x&&ty===WS.y)||(WS.mv&&tx===WS.mv.tx&&ty===WS.mv.ty))return;
    if(m.bld.some(b=>b.door[0]===tx&&b.door[1]+1===ty))return;
    if(m.exits.some(e=>Math.abs(e.x-tx)<=1&&e.y===ty))return;
    n.mv={fx:n.x,fy:n.y,t0:now};n.x=tx;n.y=ty;n.view=d==='u'?'back':d==='d'?'front':'side';if(d==='l'||d==='r')n.face=d;
  });
}
const DOORTALK={house:['Nobody answers. Someone inside is singing badly.','A voice calls out: "We are not buying anything!"','The door is barred. You hear a dog thinking about barking.','Through the window: a family arguing about whose turn it is to light the lamp.'],
  chapel:['Candles burn low in the chapel. A sister whispers that the beacons were lit by the first wayfarers, long ago.'],
  keep:['The keep is shut. A sentry calls down that the lord will see you once the road is safe.'],
  bigtent:['Inside, a lantern-keeper is mending wicks by the hundred. "Every light counts up here," she says.'],
  tower:['The watchtower is empty. Old arrows, a cold brazier, and a carved name: "Wren was here".'],
  windmill:['The miller waves from the window, covered in flour. "Mind the sails!"'],
  lighthouse:['The lighthouse keeper polishes a lens bigger than she is. "When the beacon comes back, so will the ships."']};
function enterBuilding(b){if(SERVICE[b.k]){if(typeof sfx==='function')sfx('door');openService(b.k);}else say(null,pick(DOORTALK[b.k]||DOORTALK.house));}
// The one rule for "can this tile roll a random encounter". Holy Water and tent ambushes both read it.
function encTile(m,x,y){const c=tileAt(m,x,y);return !m.safe&&((m.kind==='field'&&c===',')||(m.kind==='dungeon'&&c==='.'));}
function arrive(){
  const m=WS.m;G.pos={m:m.id,x:WS.x,y:WS.y,f:WS.face};
  if(typeof sfx==='function'&&WS.steps%2===0)sfx('step');
  const ex=m.exits.find(e=>e.x===WS.x&&e.y===WS.y);
  if(ex&&ex.to){WS.held=[];WS.target=null;WS.touchDir=null;fadeTo(()=>enterVia(ex.to));return;}
  gatherAt(m,WS.x,WS.y);
  const c=tileAt(m,WS.x,WS.y);
  if(c==='E'&&m.archive){WS.held=[];WS.target=null;WS.touchDir=null;fadeTo(()=>{const lt=G.lastTown||0,[x,y]=innSpot(lt);placeAt('t'+lt,x,y,'d');showLocation();saveGame();});return;}
  if(c==='E'){WS.held=[];WS.target=null;WS.touchDir=null;
    const cv=m.kind==='field'&&(m.caves||[]).find(q=>q.x===WS.x&&q.y===WS.y);
    if(cv)fadeTo(()=>enterCave(cv,m.s));else if(m.cave)fadeTo(()=>leaveCave(m.id));
    else if(m.kind==='field')fadeTo(()=>enterDungeon(m.s));else fadeTo(()=>leaveDungeon(m.s));return;}
  const rate=(ENC_RATE[META.cfg.enc]??.11)*(m.kind==='field'?(WEATHER[G.weather[m.s]]||{}).enc||1:1);
  const enc=encTile(m,WS.x,WS.y);
  if(G.ward>0&&m.kind!=='town'){G.ward--;if(!G.ward)toast('The Holy Water\'s ward fades.');if(typeof wkwUpdate==='function')wkwUpdate();}
  if(enc&&!(G.ward>0)&&WS.steps>=ENC_MIN_STEPS&&Math.random()<rate*(m.kind==='dungeon'?.6:1)*(WS.run?1.15:1)){
    WS.steps=0;haltInput();WS.lock=true;WS.flash=performance.now();if(typeof sfx==='function')sfx('encounter');
    later(()=>{WS.lock=false;startBattle({stage:m.s,kind:m.kind==='dungeon'?'dungeon':'field'});},460);
  }
}
// v0.3.3: a thrown error inside fn used to leave WS.lock set forever, which freezes the whole world. Always release it.
function fadeTo(fn){WS.lock=true;WS.fade=performance.now();later(()=>{try{fn();}catch(e){try{console.error(e);}catch(_){}}finally{WS.lock=false;WS.fadeIn=performance.now();}},230);}
function facing(){const [dx,dy]=DIRV[WS.dir];return [WS.x+dx,WS.y+dy];}
function interact(){
  if(V.screen!=='world'||V.modal||WS.lock)return;
  if(WS.dlg){nextDlg();return;}
  if(WS.mv)return;
  const m=WS.m,[fx,fy]=facing(),c=tileAt(m,fx,fy);
  const n=m.npcs.find(n=>n.x===fx&&n.y===fy);
  if(n&&n.portal){V.modal={type:'portal',key:n.key};render();return;}
  if(n&&n.act==='archivist'){n.view=WS.dir==='u'?'front':WS.dir==='d'?'back':'side';openArchivist();return;}
  if(n){n.mv=null;n.nextT=performance.now()+4000;n.view=WS.dir==='u'?'front':WS.dir==='d'?'back':'side';n.face=WS.dir==='l'?'r':'l';say(n.name,npcWords(n,m));return;}
  const act=dynActors(m).find(a=>a.x===fx&&a.y===fy);if(act){actorTalk(act);return;}
  const b=m.bld.find(b=>b.door[0]===fx&&b.door[1]===fy);if(b){enterBuilding(b);return;}
  if(c==='S'){say(null,m.signs[fx+','+fy]||'The sign is too weathered to read.');return;}
  if(c==='W'){openTravel();return;}
  if(c==='q'){V.modal={type:'board'};render();return;}
  if(c==='C'||c==='K'){openChest(fx,fy);return;}
  if(c==='X'&&!G.cleared[m.s]){askBoss();return;}
  if(c==='X'&&G.cleared[m.s]&&typeof askEcho==='function'){askEcho(m.s);return;}
  if(c==='l'){if(G.levers[m.id]){say(null,'The lever is already pulled.');return;}G.levers[m.id]=1;rebuildBase();saveGame();if(typeof sfx==='function')sfx('lever');say(null,m.keyBarred?'You haul the lever down. Far off, iron bars grind up into the ceiling. The key room is open.':'You haul the lever down. Somewhere nearby, iron bars grind up into the ceiling.');return;}
  if(c==='D')return say(null,'Locked. A beacon-shaped keyhole glints in the torchlight.');
  if(c==='|')return say(null,barsText(m,fx,fy));
  if(c==='G')return say(null,`A ${bossClass(bossKeyFor(m.s))}'s seal. It will break when the ${ZS(m.s).dungeon} is cleared.`);
  if(c==='O')return say(null,'Coins glint at the bottom of the fountain. Someone wished for the light to come back.');
  if(c==='m')return say(null,pick(['"Apples from Verdane! Three for a copper!"','"Finest wool this side of the Stormcrown."','"Lamp oil, wicks, flint. Everything for the dark times."','"Fish so fresh it still argues."','"Charms! Real ones! Mostly real!"']));
  if(c==='N')return say(null,G.cleared[m.s]?'The runes blaze with the beacon\'s light. The land feels awake.':'Old runes are carved into the stone. They glow faintly under your hand.');
  if(c==='g')return say(null,'Here lies a wayfarer. The name has worn away, but someone left fresh flowers.');
  if(c==='Q'||c==='P')return say(null,'Ruins of an older Aurelis, from before the beacons.');
  if(c==='o')return say(null,'A fishing boat, tied up and waiting for the tide to behave.');
  if(c==='a')return say(null,'The anvil is still warm.');
}
function actorTalk(a){
  if(a.type==='elite'){if(a.b.personal&&!G.party.includes(a.b.personal)){say(null,`${a.b.name} ignores you. This fight belongs to ${TPL[a.b.personal].n}: bring them in your party of six.`);return;}V.modal={type:'elite',b:a.b};render();return;}
  if(a.type==='wanderer'){const q=a.q,t=TPL[q.hero];
    say(t.n,`You came for me? I got turned around in the dark and something big started breathing behind that door. Let's get out of here.`,()=>{q.found=true;if(!G.roster[q.hero])recruit(q.hero,true);toast(t.n+' joins your roster. Report back to the quest board.');saveGame();render();});}
}
function say(name,text,after){WS.dlg={name,text,after};WS.held=[];WS.target=null;WS.touchDir=null;if(typeof sfx==='function')sfx('blip');render();}
function nextDlg(){const d=WS.dlg;WS.dlg=null;render();if(d&&d.after)d.after();}
function openChest(x,y){
  const m=WS.m,key=m.id+':'+x+','+y;if(G.chests[key])return;
  const raw=m.t[y][x];G.chests[key]=1;if(typeof sfx==='function')sfx('chest');
  if(raw==='K'){G.keys[m.id]=1;rebuildBase();saveGame();say(null,'Inside, on velvet: the Beacon Key. Its teeth are shaped like a beacon flame.');return;}
  const s=m.s,tier=Math.min(5,s+1),dun=m.kind==='dungeon',vault=(m.chests||[]).some(c=>c[0]===x&&c[1]===y&&c[2]==='vault');
  let msg;const r=Math.random(),Z=ZS(s);
  if(m.cave&&(m.chests||[]).some(c=>c[0]===x&&c[1]===y&&c[2]==='reward')){rebuildBase();const t=caveReward(m.s);saveGame();say(null,'You open the chest. '+t);return;}
  if(vault){G.vaults=G.vaults||{};G.vaults[s]=1;const ch=pick(['c_str','c_int','c_vit','c_spi','c_agi','c_dex','c_luk']),g=econG(200+s*150);G.gear.push(ch);G.gold+=g;msg=`Inside: ${gearOf(ch).n} and ${g} gold!`;}
  else if(r<.28){const g=econG(60+s*110+ri(0,40));G.gold+=g;msg=`Inside: ${g} gold.`;}
  else if(r<.52){const it=pick(['potion','potion','ether','remedy','plume',s>=1?'hipotion':'potion']);const n=it==='plume'?1:2;G.inv[it]=Math.min(invCap(),(G.inv[it]||0)+n);msg=`Inside: ${n>1?n+' x ':''}${ITEMS[it].n}.`;}
  else if(r<.7){const n=dun?3:2;G.mats[Z.mat]=(G.mats[Z.mat]||0)+n;msg=`Inside: ${n} x ${MATS[Z.mat]}.`;}
  else if(r<.9){const gid=lootBase()+'_'+tier+(dun?'+1':'');G.gear.push(gid);msg=`Inside: ${gearOf(gid).n} (${ITEM_TIERS[gTierIdx(gearOf(gid))].n})! Equip it from the menu, anywhere.`;}
  else{const cid=pick(['c_vital','c_mana','c_swift','c_clarity','c_'+pick(ELK)]);G.gear.push(cid);msg=`Inside: ${gearOf(cid).n} (${ITEM_TIERS[gTierIdx(gearOf(cid))].n})!`;}
  rebuildBase();saveGame();say(null,'You open the chest. '+msg);
}
function askBoss(){V.modal={type:'boss',s:WS.m.s};render();}
function openService(k){V.modal={type:k,tab:null};render();}
function openTravel(){V.modal={type:'travel'};render();}
function travelTo(s){V.modal=null;fadeTo(()=>{const [x,y]=innSpot(s);placeAt('t'+s,x,y,'d');showLocation();saveGame();});render();}

// ----- drawing -----
function worldSizeCanvas(){
  const cv=WS.cv;if(!cv)return;
  const box=cv.parentElement.getBoundingClientRect();
  let sc=box.width>=720?3:2;
  // size the view so the whole world screen (header, view, bar, touch controls) fits the visible screen without scrolling
  const vhPx=(window.visualViewport?window.visualViewport.height:window.innerHeight);
  const hdr=document.getElementById('hdr'),wbar=document.querySelector('.wbar'),pad=document.getElementById('pad');
  // v0.4.3: wide phones held sideways (and unfolded foldables) put the stick and A/B over the view instead of under it
  const padOn=pad&&getComputedStyle(pad).display!=='none',vwPx=window.visualViewport?window.visualViewport.width:window.innerWidth,land=!!padOn&&vwPx>vhPx*1.15&&vhPx<=760;
  const wr=cv.closest('.world');if(wr)wr.classList.toggle('land',land);
  const padH=padOn&&!land?pad.offsetHeight:0;
  const avail=vhPx-(hdr?hdr.offsetHeight:0)-(wbar?wbar.offsetHeight:0)-padH-(land?20:box.width<720?36:76);
  const cssH=land?clamp(avail,160,900):clamp(avail,170,box.width<720?620:560);
  if(land)sc=cssH>=380?3:2;
  const vw=Math.floor(box.width/sc),vh=Math.floor(cssH/sc);
  if(vw!==WS.vw||vh!==WS.vh||sc!==WS.scale||cv.width!==vw){WS.vw=vw;WS.vh=vh;WS.scale=sc;cv.width=vw;cv.height=vh;cv.style.width=vw*sc+'px';cv.style.height=vh*sc+'px';WS.dark=null;}
}
function leaderId(){const p=G.party.map(id=>G.roster[id]).filter(Boolean);const a=p.find(c=>c.hp>0)||p[0];return a.id;}
const IMG={};
function imgOf(key,fn){if(IMG[key])return IMG[key];return IMG[key]=fn();}
function walkFrame(view,moving,now){if(!moving)return 0;const s=Math.floor(now/(WS.run?90:130))%4;return view==='side'?(s%2?1:0):[1,0,2,0][s];}
const LIGHTC={lamp:'rgba(255,200,110,.36)',fire:'rgba(255,120,40,.42)',cyan:'rgba(120,240,255,.28)',gold:'rgba(255,215,90,.4)',violet:'rgba(170,120,255,.26)',lava:'rgba(255,100,30,.2)',torch:'rgba(255,160,70,.42)',day:'rgba(255,240,200,.3)'};
function drawNode(ctx,n,px,py,now){
  const f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);};
  const tw=Math.floor(now/260+n.x*3+n.y)%9;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(px+3,py+12,10,2);
  if(n.k==='herb'){f('#1f4a22',4,7,8,6);f('#2f7a34',3,8,3,4);f('#2f7a34',10,8,3,4);f('#4aa84a',5,5,2,5);f('#4aa84a',9,5,2,5);f('#6ad06a',7,3,2,7);f('#e04a5a',5,4,2,2);f('#f2d24a',10,4,2,2);f('#5a9af0',7,2,2,2);}
  else if(n.k==='ore'){f('#3a3a48',2,8,12,5);f('#5a5a6a',3,6,7,6);f('#7a7a8a',4,6,4,2);f('#4a4a58',9,8,5,4);f('#6a6a7a',10,8,3,1);f('#e0a050',5,9,2,2);f('#c8e0ff',11,10,1,1);}
  else{f('#3a2412',2,8,12,5);f('#7a4a24',2,8,11,4);f('#9a6234',2,8,11,1);f('#5a3418',2,11,11,1);f('#c89a5a',11,8,3,4);f('#8a5a2a',12,9,1,2);f('#4a8a3a',5,6,2,2);f('#4a8a3a',6,5,1,1);}
  if(tw===0){f('#ffffff',12,2,1,3);f('#ffffff',11,3,3,1);}else if(tw===1){f('#fff6c0',12,3,1,1);}
}
function drawShelf(ctx,sx,sy,px,py){
  const f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);};const R=mulberry(sx*131+sy*17);
  f('#0e0804',0,-9,16,25);f('#3a2418',1,-8,14,23);f('#5a3a22',1,-8,14,1);
  for(let r=0;r<3;r++){const y0=-7+r*7;f('#22140c',2,y0,12,6);let x=2;while(x<14){const w=1+Math.floor(R()*2),h=4+Math.floor(R()*2),c=['#6a2a8a','#e0b040','#3a5a9a','#8a2a3a','#2a6a5a','#c89aff','#4a2a78'][Math.floor(R()*7)];f(c,x,y0+6-h,w,h);if(R()<.3)f('#f6e7a8',x,y0+7-h,w,1);x+=w+(R()<.2?1:0);}f('#5a3a22',1,y0+6,14,1);}
  f('#2a1810',1,14,14,1);
}
function gatherAt(m,x,y){
  const n=(m.nodes||[]).find(q=>q.x===x&&q.y===y);if(!n)return;const key=m.id+':'+x+','+y;if(G.gath[key])return;G.gath[key]=1;
  const t=matTier(m.s),r=Math.random();let id;
  if(n.k==='herb')id=r<.4?'healroot':r<.7?'bluecap':TIERED.herb[t];else id=TIERED[n.k][t];
  const q=(m.kind==='dungeon'?2:1)+(Math.random()<.5?1:0);G.mats[id]=(G.mats[id]||0)+q;
  let msg=`Gathered ${q} ${MATS[id]}`;
  if(Math.random()<.15){const rel=ZS(m.s).mat;G.mats[rel]=(G.mats[rel]||0)+1;msg+=` and 1 ${MATS[rel]}`;}
  if(typeof sfx==='function')sfx('chest');toast(msg+'.');
}
function worldDraw(now){
  const cv=WS.cv,ctx=WS.ctx,m=WS.m;if(!cv||!m)return;
  ctx.imageSmoothingEnabled=false;
  const vw=WS.vw,vh=WS.vh,mw=m.w*TS,mh=m.h*TS;
  let tx=WS.px+8-vw/2,ty=WS.py+8-vh/2;
  tx=mw<=vw?(mw-vw)/2:clamp(tx,0,mw-vw);ty=mh<=vh?(mh-vh)/2:clamp(ty,0,mh-vh);
  if(!WS.cam)WS.cam={x:tx,y:ty};else{const k=Math.min(1,(now-(WS.camT||now))/70);WS.cam.x+=(tx-WS.cam.x)*k;WS.cam.y+=(ty-WS.cam.y)*k;if(Math.abs(tx-WS.cam.x)<.5)WS.cam.x=tx;if(Math.abs(ty-WS.cam.y)<.5)WS.cam.y=ty;}
  WS.camT=now;
  const cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y);
  const T=THM(m),dun=m.kind==='dungeon';
  ctx.fillStyle=dun?DTH(m).top:T.cl[3];ctx.fillRect(0,0,vw,vh);
  const fr=Math.floor(now/520)%2;
  ctx.drawImage(WS.base[fr],-cx,-cy);
  const actors=[];
  // buildings sort by their front edge: anyone standing north of it is hidden behind roof and chimney, anyone south of it is in front
  (m.bsp||[]).forEach(q=>{const b=q.b,bx=b.x*TS-BSP_X-cx,by=b.y*TS-BSP_TOP-cy;if(bx>vw||by>vh||bx+q.cv.width<0||by+q.cv.height<0)return;actors.push({y:(b.y+b.h-1)*TS,draw:()=>ctx.drawImage(q.cv,bx,by)});});
  // gathering spots
  G.gath=G.gath||{};(m.nodes||[]).forEach(n=>{if(G.gath[m.id+':'+n.x+','+n.y])return;const px=n.x*TS-cx,py=n.y*TS-cy;if(px<-16||py<-16||px>vw||py>vh)return;drawNode(ctx,n,px,py,now);});
  (m.shelves||[]).forEach(([sx,sy])=>{const px=sx*TS-cx,py=sy*TS-cy;if(px<-16||py<-24||px>vw||py>vh)return;actors.push({y:(sy+1)*TS-1,draw:()=>drawShelf(ctx,sx,sy,px,py)});});
  // animated tiles: fountains, braziers, torches
  const x0=Math.max(0,Math.floor(cx/TS)-2),x1=Math.min(m.w-1,Math.ceil((cx+vw)/TS)+2),y0=Math.max(0,Math.floor(cy/TS)-2),y1=Math.min(m.h-1,Math.ceil((cy+vh)/TS)+3);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=tileAt(m,x,y);
    if(c==='O'&&tileAt(m,x-1,y)!=='O'&&tileAt(m,x,y-1)!=='O'){const c2=objCanvas(m.theme,'fountain',fr);actors.push({y:(y+1)*TS,draw:()=>ctx.drawImage(c2,x*TS-1-cx,(y+2)*TS-c2.height+1-cy)});}
    if(c==='v'){const c2=objCanvas(m.theme,'brazier',Math.floor(now/160+x)%2);actors.push({y:y*TS,draw:()=>ctx.drawImage(c2,x*TS+1-cx,(y+1)*TS-c2.height+1-cy)});}}
  (m.lights||[]).forEach(L=>{if(L[3]!=='torch')return;const f=Math.floor(now/110+L[0])%3;ctx.fillStyle='#ff7a2a';ctx.fillRect(L[0]-2-cx,L[1]-3-cy-(f===1?1:0),4,4);ctx.fillStyle='#ffd870';ctx.fillRect(L[0]-1-cx,L[1]-2-cy-(f===2?1:0),2,3);ctx.fillStyle='#fff6c8';ctx.fillRect(L[0]-cx,L[1]-1-cy,1,1);});
  (m.mills||[]).forEach(([mx,my])=>{actors.push({y:my+40,draw:()=>{const a=now/900;ctx.fillStyle='#6a4a2a';for(let k=0;k<4;k++){const ang=a+k*Math.PI/2;for(let r=0;r<22;r++){const px=Math.round(mx+Math.cos(ang)*r)-cx,py=Math.round(my+8+Math.sin(ang)*r)-cy;ctx.fillRect(px,py,2,2);if(r>6){ctx.fillStyle='#e8dcc0';ctx.fillRect(px+Math.round(Math.cos(ang+1.57)*2),py+Math.round(Math.sin(ang+1.57)*2),2,2);ctx.fillStyle='#6a4a2a';}}}ctx.fillStyle='#3a2a1a';ctx.fillRect(mx-2-cx,my+6-cy,4,4);}});});
  // townsfolk
  m.npcs.forEach(n=>{if(n.portal){sanctumActor(actors,n,ctx,cx,cy,now);return;}let nx=n.x*TS,ny=n.y*TS,moving=false;if(n.mv){const p=Math.min(1,(now-n.mv.t0)/420);nx=(n.mv.fx+(n.x-n.mv.fx)*p)*TS;ny=(n.mv.fy+(n.y-n.mv.fy)*p)*TS;moving=p<1;}
    actors.push({y:ny,draw:()=>{const v=n.view||'front',fm=moving?walkFrame(v,true,now):0;const c=walkerCanvas('npc:'+n.name+m.id,n.look,['light'],null,v,fm);const bob=moving?0:Math.floor(now/700+n.hx)%2;drawSprite(ctx,c,Math.round(nx)+8-cx,Math.round(ny)+18-cy-bob,v==='side'&&n.face==='l');}});});
  // bounty elites and lost wayfarers
  dynActors(m).forEach(a=>{actors.push({y:a.y*TS,draw:()=>{
    if(a.type==='legend'){drawLegendActor(ctx,a,cx,cy,now);}
    else if(a.type==='elite'){const mo=MON[a.b.mon],c=imgOf('mapmon:'+mo.art,()=>monCanvas(mo.art));const bob=Math.floor(now/400)%2,p=.5+.5*Math.sin(now/200);
      ctx.fillStyle=`rgba(255,60,60,${.18+.18*p})`;ctx.beginPath();ctx.ellipse(a.x*TS+8-cx,a.y*TS+14-cy,14,5,0,0,7);ctx.fill();
      drawSprite(ctx,c,a.x*TS+8-cx,a.y*TS+17-cy-bob,true);ctx.fillStyle='#ff4a4a';ctx.fillRect(a.x*TS+7-cx,a.y*TS-26-cy-bob,3,6);ctx.fillRect(a.x*TS+7-cx,a.y*TS-18-cy-bob,3,2);}
    else{const t=TPL[a.q.hero],c=walkerCanvas('wand:'+t.id,t.look,t.el,t.id,'front',0);drawSprite(ctx,c,a.x*TS+8-cx,a.y*TS+18-cy-(Math.floor(now/500)%2),false);ctx.fillStyle='#ffe08a';ctx.fillRect(a.x*TS+7-cx,a.y*TS-22-cy,3,3);}}});});
  // the Scourge or Calamity waits on its rune circle
  const echoUp=dun&&m.bossAt&&!m.safe&&G.cleared[m.s]&&typeof storyEchoUp==='function'&&storyEchoUp(m.s);
  if(dun&&m.bossAt&&!m.safe&&(!G.cleared[m.s]||echoUp)){const def=guardianDef(bossKeyFor(m.s)),[bx,by]=m.bossAt;actors.push({y:by*TS,draw:()=>{const c=echoUp?imgOf('mapecho:'+def.art,()=>monCanvas(MART['echo_'+def.art]?'echo_'+def.art:def.art)):imgOf('mapboss:'+def.art,()=>monCanvas(def.art));const bob=Math.round(Math.sin(now/420)*1.5);if(echoUp){ctx.save();ctx.globalAlpha=.72+.18*Math.sin(now/300);}drawSprite(ctx,c,bx*TS+8-cx,by*TS+16-cy+bob,true);if(echoUp)ctx.restore();}});}
  // the hero
  const lid=leaderId(),t=TPL[lid],view=WS.dir==='u'?'back':WS.dir==='d'?'front':'side',lk=heroLook(lid);
  const frame=walkFrame(view,!!WS.mv,now),idleBob=!WS.mv&&Math.floor(now/650)%2?1:0;
  actors.push({y:WS.py+.5,draw:()=>{const c=walkerCanvas(lid+lookKey(lid),lk,t.el,lid,view,frame);shadowAt(ctx,Math.round(WS.px)+8-cx,Math.round(WS.py)+15-cy,6,2);drawSprite(ctx,c,Math.round(WS.px)+8-cx,Math.round(WS.py)+18-cy-(frame&&view==='side'?1:0)+idleBob*0,view==='side'&&WS.face==='l',idleBob);}});
  if(typeof townDecorActors==='function'){try{townDecorActors(actors,now,cx,cy);}catch(e){}}
  WS.drawLog=null;
  actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
  if(tileAt(m,WS.x,WS.y)===','&&!WS.mv){ctx.fillStyle=T.tg[1];const bx=WS.x*TS-cx,by=WS.y*TS-cy;for(let i=0;i<7;i++){ctx.fillRect(bx+1+i*2+(i%2),by+11+(i%3),1,5-(i%3));}ctx.fillStyle=T.tg[2];for(let i=0;i<7;i+=2)ctx.fillRect(bx+1+i*2+(i%2),by+11+(i%3),1,1);}
  // chimney smoke
  ctx.fillStyle='rgba(220,220,230,.55)';(m.smoke||[]).forEach(([sx,sy],i)=>{for(let k=0;k<4;k++){const p=((now/1600+k/4+i*.37)%1),r=1+Math.floor(p*3);const px=Math.round(sx+Math.sin(p*6+i)*3+p*6)-cx,py=Math.round(sy-p*26)-cy;ctx.globalAlpha=.6*(1-p);ctx.fillRect(px-r,py-r,r*2,r*2);}});ctx.globalAlpha=1;
  // lighting
  const flick=1+Math.sin(now/120)*.06;
  const allL=(m.lights||[]).concat(m.tl||[]);
  if(dun||T.dark){
    if(!WS.dark||WS.dark.width!==vw||WS.dark.height!==vh)WS.dark=mkCv(vw,vh);
    const dc=WS.dark.getContext('2d');dc.globalCompositeOperation='source-over';dc.clearRect(0,0,vw,vh);
    dc.fillStyle=dun?'rgba(4,2,10,.8)':m.theme==='cave'?'rgba(14,4,2,.32)':'rgba(10,4,26,.36)';dc.fillRect(0,0,vw,vh);
    dc.globalCompositeOperation='destination-out';
    const hole=(x,y,r)=>{const g=dc.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.6,'rgba(0,0,0,.75)');g.addColorStop(1,'rgba(0,0,0,0)');dc.fillStyle=g;dc.fillRect(x-r,y-r,r*2,r*2);};
    hole(Math.round(WS.px)+8-cx,Math.round(WS.py)+4-cy,dun?74:84);
    allL.forEach(L=>hole(L[0]-cx,L[1]-cy,L[2]*1.7*flick));
    if(dun&&m.bossAt&&(!G.cleared[m.s]||(typeof storyEchoUp==='function'&&storyEchoUp(m.s))))hole(m.bossAt[0]*TS+8-cx,m.bossAt[1]*TS-cy,60);
    ctx.drawImage(WS.dark,0,0);
  }
  const glow=(x,y,r,col)=>{const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
  ctx.globalCompositeOperation='lighter';
  allL.forEach(L=>{const x=L[0]-cx,y=L[1]-cy;if(x<-60||y<-60||x>vw+60||y>vh+60)return;glow(x,y,L[2]*flick,LIGHTC[L[3]]||LIGHTC.lamp);});
  if(m.theme==='cave'||m.theme==='void'||dun)glow(Math.round(WS.px)+8-cx,Math.round(WS.py)-cy,56,dun?'rgba(255,190,120,.16)':m.theme==='cave'?'rgba(255,170,90,.2)':'rgba(170,140,255,.18)');
  ctx.globalCompositeOperation='source-over';
  // relit fields glow warm and drift with motes of light
  if(m.kind==='field'&&G.cleared[m.s]){ctx.fillStyle='rgba(255,210,120,.07)';ctx.fillRect(0,0,vw,vh);for(let i=0;i<14;i++){const sx=Math.floor((i*89+now/45)%vw),sy=Math.floor((i*67+Math.sin(now/700+i)*10-now/90)%vh+vh)%vh;ctx.fillStyle=i%3?'#fff2a0':'#ffd04a';ctx.fillRect(sx,sy,1,1);if(Math.floor(now/200+i)%3===0)ctx.fillRect(sx-1,sy,3,1);}}
  if(!dun){
    if(m.theme==='snow'){ctx.fillStyle='#ffffff';for(let i=0;i<46;i++){const sx=(i*53+now/40*(1+i%3))%vw,sy=(i*97+now/25*(1+(i%2)))%vh;ctx.fillRect(Math.floor(sx),Math.floor(sy),1+(i%5===0),1);}}
    if(m.theme==='heights'){ctx.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<8;i++){const sx=(i*97+now/12)%(vw+40)-20,sy=(i*61)%vh;ctx.fillRect(Math.floor(sx),sy,10,1);}}
    if(m.theme==='meadow'){for(let i=0;i<3;i++){const sx=Math.floor((i*131+now/30)%(vw+20))-10,sy=Math.floor((i*71)%vh+Math.sin(now/300+i)*4);ctx.fillStyle=['#f6e06a','#ffffff','#f08ab0'][i];ctx.fillRect(sx,sy,2,1);if(Math.floor(now/120+i)%2){ctx.fillRect(sx-1,sy-1,1,1);ctx.fillRect(sx+2,sy-1,1,1);}}}
    if(m.theme==='coast'){ctx.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<5;i++){const sx=Math.floor((i*151+now/22)%(vw+30))-15,sy=(i*43)%vh;ctx.fillRect(sx,sy,6,1);}}
    if(m.theme==='void'){for(let i=0;i<12;i++){const sx=Math.floor((i*79+now/50)%vw),sy=Math.floor((i*53-now/40)%vh+vh)%vh;ctx.fillStyle=i%2?'#c8a0ff':'#5fc9a0';ctx.fillRect(sx,sy,1,1);}}
  }else{for(let i=0;i<10;i++){const sx=Math.floor((i*79+now/80)%vw),sy=Math.floor((i*53-now/60)%vh+vh)%vh;ctx.fillStyle=DTHEME[m.theme].acc;ctx.globalAlpha=.5;ctx.fillRect(sx,sy,1,1);}ctx.globalAlpha=1;}
  if(m.kind==='field'||m.kind==='town')weatherFX(ctx,G.weather[m.s]||'clear',vw,vh,now,false);
  if(m.amb)themeFX(ctx,m,vw,vh,now);
  if(m.kind==='town'&&G.cleared[m.s])festivalFX(ctx,m,cx,cy,vw,vh,now);
  if(dun){const e=m.start;const ex=e[0]*TS+8-cx,ey=(e[1]-1)*TS-cy-6+Math.round(Math.sin(now/200)*2);ctx.fillStyle='#150b17';ctx.fillRect(ex-4,ey-1,9,6);ctx.fillStyle='#ffe08a';ctx.fillRect(ex-3,ey+3,7,1);ctx.fillRect(ex-2,ey+2,5,1);ctx.fillRect(ex-1,ey+1,3,1);ctx.fillRect(ex,ey,1,1);}
  if(WS.flash&&now-WS.flash<460){const p=(now-WS.flash)/460;ctx.fillStyle=`rgba(255,255,255,${Math.floor(p*7)%2?0.85:0})`;ctx.fillRect(0,0,vw,vh);
    // battle swirl
    ctx.fillStyle='#0a0612';const n=Math.floor(p*vh/2);for(let i=0;i<8;i++){const a=i/8*Math.PI*2+p*4;ctx.save();ctx.translate(vw/2,vh/2);ctx.rotate(a);ctx.fillRect(0,-3,Math.max(vw,vh)*p,6);ctx.restore();}}
  if(WS.fade&&now-WS.fade<230){ctx.fillStyle=`rgba(8,4,2,${(now-WS.fade)/230})`;ctx.fillRect(0,0,vw,vh);}
  else if(WS.fadeIn&&now-WS.fadeIn<280){ctx.fillStyle=`rgba(8,4,2,${1-(now-WS.fadeIn)/280})`;ctx.fillRect(0,0,vw,vh);}
}
function drawSprite(ctx,c,footX,footY,flip,squash){
  const x=Math.round(footX-c.width/2),y=Math.round(footY-c.height+1);
  if(squash){ // one-pixel breathing: shift the upper body down a pixel
    const cut=Math.floor(c.height*.55);
    if(flip){ctx.save();ctx.translate(x+c.width,y);ctx.scale(-1,1);ctx.drawImage(c,0,cut,c.width,c.height-cut,0,cut,c.width,c.height-cut);ctx.drawImage(c,0,0,c.width,cut,0,1,c.width,cut);ctx.restore();}
    else{ctx.drawImage(c,0,cut,c.width,c.height-cut,x,y+cut,c.width,c.height-cut);ctx.drawImage(c,0,0,c.width,cut,x,y+1,c.width,cut);}
    return;
  }
  if(flip){ctx.save();ctx.translate(x+c.width,y);ctx.scale(-1,1);ctx.drawImage(c,0,0);ctx.restore();}
  else ctx.drawImage(c,x,y);
}
// ----- after a battle -----
function onBattleStart(){BUILT=null;}
function onBattleEnd(how,spec){
  BUILT=null;
  if(how==='lose'){const s=G.lastTown||0,[x,y]=innSpot(s);placeAt('t'+s,x,y,'r');}
  else if(spec&&spec.kind==='boss'&&G.cleared[spec.stage]){
    const s=spec.stage;
    if(typeof echoHold==='function')echoHold(s);
    if(s<4){rebuildBase();WS.fadeIn=performance.now();toast('The beacon is lit. The sealed gate in the field stands open. Walk out when you are ready.');}// v0.4.3: you stay where you won
    else{rebuildBase();V.modal={type:'legacy'};}
  }else if(WS.m){rebuildBase();WS.fadeIn=performance.now();}
  showLocation();saveGame();
}
// ----- relit towns -----
const RELIT_LINES=['Did you see the beacon? I cried. My husband cried. The goat cried.','Ships are coming back. Trade is coming back. I am raising prices back. Sorry!','The children made lanterns for you. Not all of them are on fire on purpose.','Rooms at the inn are half price for heroes tonight. Tell them I sent you.','The smith has been forging like a madwoman since the light came back. New stock, she says.','I slept a whole night without dreaming of the dark. Thank you.','There is a festival tonight! And tomorrow night. Possibly every night.','Rare folk drift into the tavern more often now. Something about good light and good ale.'];
function festive(m){
  if(m.festive)return;m.festive=1;const R=mulberry(91+m.s),W=m.w;
  const spots=[];m.t.forEach((r,y)=>r.forEach((c,x)=>{if((c===':'||c==='=')&&x>3&&x<W-4&&!m.npcs.some(n=>n.x===x&&n.y===y)&&y!==m.road)spots.push([x,y]);}));
  [['Festival bard','A song for the wayfarers! ♪ They walked into the dark and the dark said "oh no" ♪','light'],['Lantern dancer','Spin with me! No? Fine. Take a lantern, at least. They are free tonight.','robe']].forEach(([name,line],i)=>{
    const p=spots[Math.floor(R()*spots.length)];if(!p)return;m.npcs.push({x:p[0],y:p[1],hx:p[0],hy:p[1],name,line,festive:1,look:Object.assign(villagerLook(name),{hat:i?'circlet':'feathercap'}),view:'front',face:'r',wander:true});});
}
function festivalFX(ctx,m,cx,cy,vw,vh,now){
  // bunting along the main road and sky lanterns drifting up
  const y=m.road*TS-12-cy,cols=['#e84a4a','#f2c93a','#3fa0e0','#5ad06a','#c86ae0'];
  ctx.fillStyle='rgba(60,40,20,.8)';ctx.fillRect(0,y,vw,1);
  for(let x=(-cx%12+12)%12-12,i=Math.floor(cx/12);x<vw;x+=12,i++){ctx.fillStyle=cols[((i%5)+5)%5];ctx.fillRect(x+2,y+1,5,2);ctx.fillRect(x+3,y+3,3,1);ctx.fillRect(x+4,y+4,1,1);}
  for(let i=0;i<7;i++){const p=((now/9000+i*.37)%1),lx=Math.floor((i*137+Math.sin(now/1500+i)*8)%vw),ly=Math.floor(vh-(p*(vh+30)));ctx.globalAlpha=Math.min(1,(1-p)*2);ctx.fillStyle='#ffb04a';ctx.fillRect(lx,ly,3,4);ctx.fillStyle='#fff0a0';ctx.fillRect(lx+1,ly+1,1,2);ctx.globalAlpha=1;}
  ctx.fillStyle='rgba(255,200,120,.06)';ctx.fillRect(0,0,vw,vh);
}
// one soft fog puff, drawn once and stamped each frame (was six radial gradients per frame; same picture)
let FOGSPR=null;
function fogSprite(){if(!FOGSPR){FOGSPR=document.createElement('canvas');FOGSPR.width=FOGSPR.height=140;const c=FOGSPR.getContext('2d'),g=c.createRadialGradient(70,70,4,70,70,70);g.addColorStop(0,'rgba(220,225,235,.32)');g.addColorStop(1,'rgba(220,225,235,0)');c.fillStyle=g;c.fillRect(0,0,140,140);}return FOGSPR;}
// ----- weather overlays (shared with battle) -----
function weatherFX(ctx,w,W,H,now,battle){
  const t=now/1000;
  if(w==='rain'||w==='storm'){ctx.fillStyle=w==='storm'?'rgba(20,20,50,.26)':'rgba(30,40,70,.16)';ctx.fillRect(0,0,W,H);ctx.fillStyle=w==='storm'?'rgba(200,215,255,.8)':'rgba(200,225,255,.7)';const n=w==='storm'?110:75;for(let i=0;i<n;i++){const x=Math.floor((i*53+t*120*(1+i%3*.2))%(W+20))-10,y=Math.floor((i*97+t*300*(1+i%2*.3))%(H+10))-5;ctx.fillRect(x,y,1,6);ctx.fillRect(x-1,y+6,1,2);}
    ctx.fillStyle='rgba(220,235,255,.5)';for(let i=0;i<12;i++){const p=((t*2+i*.37)%1),x=(i*71)%W,y=(i*43)%H;if(p<.3){ctx.fillRect(x-1,y,3,1);}}
    if(w==='storm'){const cyc=t%6.5;if(cyc<.08||(cyc>.16&&cyc<.22)){ctx.fillStyle='rgba(255,255,240,.45)';ctx.fillRect(0,0,W,H);}}}
  else if(w==='snow'||w==='blizzard'){const n=w==='blizzard'?120:70,sp=w==='blizzard'?3:1;if(w==='snow'){ctx.fillStyle='rgba(205,228,255,.10)';ctx.fillRect(0,0,W,H);}// v0.4.0: frosted tint, and every 4th flake is 2x2 so it reads on a phone
    ctx.fillStyle='#ffffff';for(let i=0;i<n;i++){const x=Math.floor((i*37+t*(20+i%5*6)*sp+Math.sin(t+i)*4)%W),y=Math.floor((i*53+t*(14+i%7*3)*(w==='blizzard'?1.6:1))%H);const big=i%4===0;ctx.fillRect(x,y,big?2:1+(i%6===0),big?2:1);}
    if(w==='blizzard'){ctx.fillStyle='rgba(230,240,255,.22)';ctx.fillRect(0,0,W,H);}}
  else if(w==='fog'){for(let i=0;i<6;i++){const x=Math.floor(((t*6+i*90)%(W+160))-80),y=Math.floor(H*(.15+i*.14));ctx.drawImage(fogSprite(),x-70,y-70);}ctx.fillStyle='rgba(200,205,215,.18)';ctx.fillRect(0,0,W,H);}
  else if(w==='gale'){ctx.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<22;i++){const x=Math.floor((i*71+t*260)%(W+40))-20,y=Math.floor((i*43)%H+Math.sin(t*3+i)*3);ctx.fillRect(x,y,10+i%8,1);}ctx.fillStyle='#7aa040';for(let i=0;i<6;i++){const x=Math.floor((i*113+t*180)%(W+20))-10,y=Math.floor((i*61+Math.sin(t*4+i)*12+t*20)%H);ctx.fillRect(x,y,2,1);}}
  else if(w==='sand'){ctx.fillStyle='rgba(220,180,110,.22)';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(240,210,150,.7)';for(let i=0;i<60;i++){const x=Math.floor((i*41+t*200*(1+i%3*.3))%W),y=Math.floor((i*29+Math.sin(t*2+i)*6)%H);ctx.fillRect(x,y,2,1);}}
  else if(w==='heat'){ctx.fillStyle='rgba(255,140,60,.1)';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,220,180,.25)';for(let i=0;i<14;i++){const x=Math.floor((i*67)%W),y=Math.floor(H-((t*12+i*29)%H));ctx.fillRect(x+Math.round(Math.sin(t*3+i)*2),y,1,3);}}
  else if(w==='ashfall'){ctx.fillStyle='rgba(60,50,50,.14)';ctx.fillRect(0,0,W,H);for(let i=0;i<40;i++){const x=Math.floor((i*37+Math.sin(t+i)*10+t*6)%W),y=Math.floor((i*53+t*(10+i%5*3))%H);ctx.fillStyle=i%6?'#9a9090':'#ff7a3a';ctx.fillRect(x,y,i%6?2:1,1);}}
  else if(w==='aurora'){for(let k=0;k<3;k++){ctx.fillStyle=['rgba(90,255,170,.26)','rgba(140,120,255,.22)','rgba(90,220,255,.2)'][k];for(let x=0;x<W;x+=2){const y=4+k*9+Math.floor(Math.sin(x/22+t*.7+k)*7);ctx.fillRect(x,y,2,14+k*3);}}}
  else if(w==='starfall'){for(let i=0;i<5;i++){const p=((t*.5+i*.23)%1),x=Math.floor((i*97+p*60)%W),y=Math.floor(p*H*.7);ctx.globalAlpha=1-p;ctx.fillStyle='#fff6c8';ctx.fillRect(x,y,1,1);ctx.fillStyle='#c8a0ff';ctx.fillRect(x-1,y-1,1,1);ctx.fillRect(x-2,y-2,1,1);ctx.globalAlpha=1;}}
}
