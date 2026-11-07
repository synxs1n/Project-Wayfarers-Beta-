// Beta v0.7.1 world pass, part 2: tap the map to walk there (map.js, WS.auto).
// At 390x844, 844x390, 933x705 (touch) and 1280x720 (mouse), in the 2D view (Low) and HD-2D (Medium):
// - full map: a tap on the Alchemy door walks the hero to the step in front of it over the real path (every tile on the way open, steps
//   one tile apart, no corner cut), facing the door, without going in; the map closes
// - full map: a tap on a tile not seen yet keeps the map open and says "You have not been there yet", nothing walks
// - minimap: a tap on a seen tile walks there
// Once per renderer (933x705): any key stops the walk; a random encounter stops it; a dialog stops it; a tap on an exit stops in front
// of the gate (still in town); the world map offers the waystone's travel only next to a waystone. No page errors.
// Usage: PWHTML=../../out/aurelis3.html node v071wt.js
const {open,chk,done}=require('./pw');
const META=(t)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false,minimap:true}}));`;
const start=ev=>ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
// every tile of the current map seen, except the given ones
const seeAll=(ev,but)=>ev(but=>{const A=__A,m=A.WS.m,s=A.seenOf(m);for(let i=0;i<s.length;i++)s[i]=255;(but||[]).forEach(([x,y])=>{const i=y*m.w+x;s[i>>3]&=~(1<<(i&7));});A.MAPCV.dirty=1;},but||[]);
// follow the walk: positions until it ends (or ms), each checked against the collision grid
// the page records every tile the hero stands on (each frame), from the moment the walk starts
const follow=async(H,ms)=>{const t0=Date.now();
  while(Date.now()-t0<(ms||15000)){const s=await H.ev(()=>({auto:!!__A.W71.auto,mv:!!__A.WS.mv}));if(!s.auto&&!s.mv)break;await H.wait(60);}
  return H.ev(()=>{const t=window.__trail||[];window.__trail=[];return t;});};
const trail=ev=>ev(()=>{window.__trail=[[__A.WS.x,__A.WS.y]];if(window.__trailOn)return;window.__trailOn=1;
  // v0.9.9 (second pass): a walk stopped for "input" records what stopped it, at the moment awStop runs (sources, held keys, the caller)
  try{__A.TW.get(`awStop=(f=>function(why){try{if(WS.auto&&why==='input')window.__stopAt={src:inputSources().map(q=>q[0]+'@'+Math.round(q[1])),held:WS.held.slice(),drag:WS.touchDir||null,tap:WS.target||null,now:Math.round(performance.now()),by:new Error().stack.split('\\n').slice(2,5).map(s=>s.trim().slice(0,50)).join(' < ')};}catch(e){}return f.apply(this,arguments);})(awStop)`);}catch(e){}
  ['keydown','keyup'].forEach(t=>window.addEventListener(t,e=>{window.__keyAt={t,key:e.key,code:e.code,trusted:e.isTrusted,repeat:e.repeat,now:Math.round(performance.now())};(window.__keys=window.__keys||[]).push(t[3]+e.key.slice(5)+'@'+Math.round(performance.now())+'/'+Math.round(e.timeStamp));},true));
  const f=()=>{const W=__A.WS,t=window.__trail,l=t[t.length-1];if(!l||l[0]!==W.x||l[1]!==W.y)t.push([W.x,W.y]);try{if(W.auto)window.__src=__A.TW.get('inputSources')().map(q=>q[0]+'@'+Math.round(q[1]));}catch(e){}requestAnimationFrame(f);};requestAnimationFrame(f);});
// tiles are checked against the map itself (a townsfolk may have wandered onto a tile after the hero left it)
const pathOk=(ev,pos)=>ev(pos=>{const A=__A,m=A.WS.m,solid=(x,y)=>A.SOLID.includes(A.tileAt(m,x,y)),special=(x,y)=>m.exits.some(e=>e.x===x&&e.y===y)||m.bld.some(b=>b.door[0]===x&&b.door[1]===y)||'EXG'.includes(A.tileAt(m,x,y));
  for(let i=0;i<pos.length;i++){const [x,y]=pos[i];if(i>0&&(solid(x,y)||special(x,y)))return 'not open at '+x+','+y;
  if(i>0){const [px,py]=pos[i-1],dx=x-px,dy=y-py;if(Math.abs(dx)>1||Math.abs(dy)>1)return 'jump '+px+','+py+' -> '+x+','+y;if(dx&&dy&&(solid(px+dx,py)||solid(px,py+dy)))return 'corner cut at '+x+','+y;}}return true;},pos);
const tapAt=async(H,touch,x,y)=>{if(touch)await H.page.touchscreen.tap(x,y);else await H.page.mouse.click(x,y);};
(async()=>{
for(const gfx of ['low','medium'])for(const [w,h,touch] of [[390,844,1],[844,390,1],[933,705,1],[1280,720,0]]){
  const tag=`${gfx==='low'?'2D':'HD-2D'} ${w}x${h}`;const H=await open({w,h,mobile:!!touch,pre:META(gfx)});const {ev,wait}=H;
  await start(ev);await wait(600);
  const hd=await ev(()=>!!(__A.HD&&__A.HD.live));if(gfx==='medium')chk(`${tag}: HD-2D view live`,hd||'2D');
  // the Alchemy door in the first town, the hero a few tiles off
  const S=await ev(()=>{const A=__A,m=A.getMap('t0'),b=m.bld.find(b=>b.k==='workshop');let best=null;
    for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++){const d=Math.abs(x-b.door[0])+Math.abs(y-b.door[1]-1);if(d>=8&&d<=14&&A.W71.awPass(m,x,y)&&(!best||d<best.d))best={x,y,d};}
    A.placeAt('t0',best.x,best.y,'d');A.render();return {door:b.door,from:[best.x,best.y],w:m.w,h:m.h};});
  await seeAll(ev);await wait(200);
  // ---- full map: tap the shop door ----
  await ev(()=>{__A.ACT.map();});await wait(350);
  let r=await ev(([dx,dy])=>{const c=document.getElementById('fmap'),q=c.getBoundingClientRect(),m=__A.WS.m;return {x:q.left+(dx+.5)/m.w*q.width,y:q.top+(dy+.5)/m.h*q.height,vis:q.width>0&&q.bottom<=innerHeight+1&&q.right<=innerWidth+1};},S.door);
  chk(`${tag}: full map fits the screen`,r.vis||JSON.stringify(r));
  await trail(ev);await tapAt(H,touch,r.x,r.y);await wait(100);
  let st=await ev(()=>({modal:__A.V.modal&&__A.V.modal.type,auto:!!__A.W71.auto}));
  chk(`${tag}: a tap on the Alchemy door closes the map and starts the walk`,!st.modal&&st.auto||JSON.stringify(st));
  let pos=await follow(H);
  st=await ev(()=>{const A=__A,W=A.WS;return {x:W.x,y:W.y,dir:W.dir,modal:A.V.modal&&A.V.modal.type,why:A.W71.last&&A.W71.last.why,n:A.W71.last&&A.W71.last.dirs};});
  chk(`${tag}: walked to the step in front of the door (${S.door[0]},${S.door[1]+1}), facing it, not inside (${pos.length-1} steps)`,st.x===S.door[0]&&st.y===S.door[1]+1&&st.dir==='u'&&!st.modal&&st.why==='arrived'||JSON.stringify(st));
  chk(`${tag}: over the real path`,await pathOk(ev,pos));
  // ---- full map: an unseen tile ----
  const U=await ev(()=>{const A=__A,m=A.WS.m;for(let y=m.h-3;y>1;y--)for(let x=1;x<m.w-1;x++)if(A.W71.awPass(m,x,y)&&Math.abs(x-A.WS.x)+Math.abs(y-A.WS.y)>6)return [x,y];});
  await seeAll(ev,[U]);await ev(()=>{__A.ACT.map();});await wait(350);
  r=await ev(([dx,dy])=>{const c=document.getElementById('fmap'),q=c.getBoundingClientRect(),m=__A.WS.m;return {x:q.left+(dx+.5)/m.w*q.width,y:q.top+(dy+.5)/m.h*q.height};},U);
  await tapAt(H,touch,r.x,r.y);await wait(250);
  st=await ev(()=>({modal:__A.V.modal&&__A.V.modal.type,auto:!!__A.W71.auto,note:(document.getElementById('fmnote')||{}).textContent,x:__A.WS.x,y:__A.WS.y}));
  chk(`${tag}: a tap on a tile not seen yet: map stays open, "You have not been there yet", no walk`,st.modal==='map'&&!st.auto&&st.note==='You have not been there yet.'||JSON.stringify(st));
  await ev(()=>{__A.V.modal=null;__A.render();});await seeAll(ev);await wait(300);
  // ---- minimap ----
  const M=await ev(()=>{const A=__A,m=A.WS.m,cv=document.getElementById('mmap');if(!cv||cv.style.display==='none')return null;const q=cv.getBoundingClientRect();
    for(let dy=-4;dy<=4;dy++)for(let dx=-6;dx<=6;dx++){const x=A.WS.x+dx,y=A.WS.y+dy;if(Math.abs(dx)+Math.abs(dy)<4||!A.W71.awPass(m,x,y))continue;const p=A.W71.awPlan(m,x,y);if(p.res!=='ok')continue;
      const ox=Math.round(cv.width/2-(A.WS.x+.5)*4),oy=Math.round(cv.height/2-(A.WS.y+.5)*4);const cx=q.left+(ox+(x+.5)*4)*q.width/cv.width,cy=q.top+(oy+(y+.5)*4)*q.height/cv.height;
      const top=document.elementFromPoint(cx,cy);return {x,y,cx,cy,top:top&&top.id};}return null;});
  chk(`${tag}: minimap shown and on top where tapped`,!!M&&M.top==='mmap'||JSON.stringify(M));
  if(M){await trail(ev);await tapAt(H,touch,M.cx,M.cy);await wait(60);pos=await follow(H);st=await ev(()=>({x:__A.WS.x,y:__A.WS.y,why:__A.W71.last&&__A.W71.last.why,src:__A.W71.last&&__A.W71.last.src}));
    // v0.9.9 (second pass): townsfolk wander and block like walls (solidAt); one who steps onto the target stops the walk as "blocked",
    // which is the game's rule, not a fault: then the walk is asked again once the tile is free (from where the hero stands, same source)
    if(st.why==='blocked'){const occ=await ev(M=>{const A=__A,m=A.WS.m;return A.TW.get('solidAt')(m,M.x,M.y)&&!A.SOLID.includes(A.tileAt(m,M.x,M.y));},M);
      if(occ){await H.until(M=>{const A=__A,m=A.WS.m;return !A.TW.get('solidAt')(m,M.x,M.y);},M,{timeout:8000});await trail(ev);await ev(M=>{__A.W71.awTap(__A.WS.m,M.x,M.y,'mini');},M);pos=await follow(H);
        st=await ev(()=>({x:__A.WS.x,y:__A.WS.y,why:__A.W71.last&&__A.W71.last.why,src:__A.W71.last&&__A.W71.last.src}));st.retried='a townsperson stood on the target';st.occNow=await ev(M=>{const A=__A,m=A.WS.m;return {solid:A.TW.get('solidAt')(m,M.x,M.y),npc:(m.npcs||[]).filter(n=>Math.abs(n.x-M.x)+Math.abs(n.y-M.y)<=1).map(n=>n.x+','+n.y),dyn:A.TW.get('dynActors')(m).filter(a=>Math.abs(a.x-M.x)+Math.abs(a.y-M.y)<=1).map(a=>a.x+','+a.y)};},M);}}
    chk(`${tag}: minimap tap walks there (${M.x},${M.y})`,st.x===M.x&&st.y===M.y&&st.why==='arrived'&&st.src==='mini'||JSON.stringify(st));chk(`${tag}: minimap walk over the real path`,await pathOk(ev,pos));}
  if(w===933){
    // ---- any key stops the walk ----
    const F=await ev(()=>{const A=__A,m=A.WS.m;let best=null;for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++){if(!A.W71.awPass(m,x,y))continue;const p=A.W71.awPlan(m,x,y);if(p.res==='ok'&&(!best||p.plan.dirs.length>best.n))best={x,y,n:p.plan.dirs.length};}
      A.W71.awTap(m,best.x,best.y,'map');return best;});
    await wait(700);await ev(()=>{(window.__marks=window.__marks||[]).push('press@'+Math.round(performance.now()));});await H.page.keyboard.down('ArrowRight');await wait(30);await H.page.keyboard.up('ArrowRight');await wait(400);
    st=await ev(()=>({auto:!!__A.W71.auto,why:__A.W71.last&&__A.W71.last.why,x:__A.WS.x,y:__A.WS.y}));
    chk(`${tag}: a key press stops the walk short of its goal`,!st.auto&&st.why==='input'&&!(st.x===F.x&&st.y===F.y)||JSON.stringify(st));
    await wait(500);const st2=await ev(()=>({x:__A.WS.x,y:__A.WS.y,auto:!!__A.W71.auto}));
    chk(`${tag}: and it does not start again by itself`,!st2.auto&&Math.abs(st2.x-st.x)+Math.abs(st2.y-st.y)<=1||JSON.stringify([st,st2]));
    // ---- an exit: stop in front of the gate, still in town ----
    // v0.9.9 (second pass): the road's own tile of the gate (a town gate is three exit tiles wide; the corner ones can have wall in front
    // of them, and a tap there plans no walk at all, see docs/v099-tests.md): before, the first exit tile in the list was tapped, which was
    // a corner tile in some realms' first town
    const E=await ev(()=>{const A=__A,m=A.WS.m,L=m.exits.filter(e=>e.to),e=L.find(e=>'=B'.includes(m.t[e.y][e.x]))||L[1]||L[0];return [e.x,e.y];});
    // v0.9.9: the walk starts from rest: the step the key press began is over and no key, drag or tap is still held (on a busy machine the
    // key's step could still be under way 0.5 s later and the new walk met it as fresh input)
    const idle=await H.until(()=>{const W=__A.WS;return !W.mv&&!W.held.length&&!W.touchDir&&!W.target&&!W.padDir&&!W.joyDir&&!__A.W71.auto;},null,{timeout:8000});
    await trail(ev);const tapR=await ev(E=>{const A=__A,r=A.W71.awTap(A.WS.m,E[0],E[1],'map');const T=k=>A.TW.get(k),m=A.WS.m,g=T('awGoal')(m,E[0],E[1]),near=(x,y)=>[[0,1],[0,-1],[1,0],[-1,0]].map(([a,b])=>[x+a,y+b]);
      const dbg=r&&r.res!=='ok'?{goal:g.c,what:g.what,front:near(E[0],E[1]).map(([x,y])=>x+','+y+':'+A.tileAt(m,x,y)+(T('awPass')(m,x,y)?'P':'-')+(T('isSeen')(m,x,y)?'S':'-')+(T('solidAt')(m,x,y)?'X':'')),
        dyn:T('dynActors')(m).filter(a=>Math.abs(a.x-E[0])+Math.abs(a.y-E[1])<=3).map(a=>(a.k||a.id||a.kind||'?')+'@'+a.x+','+a.y),exits:(m.exits||[]).map(e=>e.x+','+e.y+(e.to?'>'+e.to:''))}:null;
      return {dbg,res:r&&r.res,from:[A.WS.x,A.WS.y],E,npcs:(A.WS.m.npcs||[]).filter(n=>Math.abs(n.x-E[0])+Math.abs(n.y-E[1])<=2).map(n=>n.x+','+n.y)};},E);pos=await follow(H,20000);
    st=await ev(()=>({m:__A.WS.m.id,x:__A.WS.x,y:__A.WS.y,why:__A.W71.last&&__A.W71.last.why,scr:__A.V.screen}));if(idle&&idle.timeout)st.idle=idle;if(st.why!=='arrived'){st.tap=tapR;st.src=await ev(()=>window.__src);st.stopAt=await ev(()=>window.__stopAt||null);st.keyAt=await ev(()=>window.__keyAt||null);st.keys=await ev(()=>(window.__keys||[]).slice(-6));st.marks=await ev(()=>window.__marks||null);}
    chk(`${tag}: a tap on the road gate walks to the tile in front of it and stays in town`,st.m==='t0'&&st.why==='arrived'&&Math.abs(st.x-E[0])+Math.abs(st.y-E[1])===1||JSON.stringify(st));
    // ---- a dialog stops it ----
    await ev(()=>{const A=__A,m=A.WS.m;let best=null;for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++){if(!A.W71.awPass(m,x,y))continue;const p=A.W71.awPlan(m,x,y);if(p.res==='ok'&&(!best||p.plan.dirs.length>best.n))best={x,y,n:p.plan.dirs.length};}A.W71.awTap(m,best.x,best.y,'map');});
    await wait(500);await ev(()=>{const A=__A;A.WS.dlg={who:'Test',lines:['Hello there.'],i:0};});await wait(300);
    st=await ev(()=>({auto:!!__A.W71.auto,why:__A.W71.last&&__A.W71.last.why}));await ev(()=>{__A.WS.dlg=null;});
    chk(`${tag}: a dialog opening stops the walk`,!st.auto&&st.why==='dialog'||JSON.stringify(st));
    // ---- the world map: waystone travel offered only beside a waystone ----
    const wm=await ev(async()=>{const A=__A,G=A.G,m=A.WS.m;if(!G.visited.includes(1))G.visited.push(1);G.been=G.been||{};G.been.t1=1;G.been.f0=1;
      let wx=null;for(let y=0;y<m.h&&!wx;y++)for(let x=0;x<m.w;x++)if(m.t[y][x]==='W'){wx=[x,y];break;}
      if(!wx)return {err:'no waystone',id:m.id,rows:m.t.map(r=>r.join('')),g:JSON.stringify(m.guarded)};
      const near=[[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].map(([a,b])=>[wx[0]+a,wx[1]+b]).find(([x,y])=>A.W71.awPass(m,x,y));if(!near)return {err:'no open tile by the waystone',wx,id:m.id,rows:m.t.map(r=>r.join('')),npcs:m.npcs.map(n=>n.x+','+n.y),ex:m.exits.map(e=>e.x+','+e.y)};
      const look=async()=>{A.ACT.worldMap();await new Promise(r=>setTimeout(r,250));A.W63.WM.sel='t1';A.W71.wmGo();const el=document.getElementById('wmgo');const r={html:el?el.innerHTML:null,btn:!!(el&&el.querySelector('[data-act="travel"]'))};A.V.modal=null;A.render();return r;};
      const far=await look();A.placeAt('t0',near[0],near[1],'d');A.render();const at=await look();return {far,at};});
    if(wm.err){console.log(JSON.stringify(wm,null,1));wm.far=wm.at={html:wm.err};}
    chk(`${tag}: world map: away from a waystone a visited town only says a waystone can carry you there`,!wm.far.btn&&/waystone/i.test(wm.far.html||'')||JSON.stringify(wm.far));
    chk(`${tag}: world map: beside a waystone a visited town offers the waystone's own travel`,wm.at.btn||JSON.stringify(wm.at));
    // ---- a random encounter stops it (field, grass) ----
    const R=await ev(()=>{const A=__A,m=A.getMap('f0');let s=null;for(let y=3;y<m.h-3&&!s;y++)for(let x=3;x<m.w-3;x++){if(A.tileAt(m,x,y)!==','||!A.W71.awPass(m,x,y))continue;let ok=0;for(let k=1;k<=3;k++)if(A.tileAt(m,x+k,y)===','&&A.W71.awPass(m,x+k,y))ok++;if(ok===3){s=[x,y];break;}}
      A.placeAt('f0',s[0],s[1],'r');A.render();return s;});
    await seeAll(ev);await ev(R=>{const A=__A;A.META.cfg.enc='high';A.WS.steps=50;window.__r0=Math.random;Math.random=()=>0;A.W71.awTap(A.WS.m,R[0]+3,R[1],'mini');},R);
    await wait(1400);st=await ev(()=>{Math.random=window.__r0;return {scr:__A.V.screen,auto:!!__A.W71.auto,why:__A.W71.last&&__A.W71.last.why,x:__A.WS.x};});
    chk(`${tag}: a random encounter on the way stops the walk (battle starts as normal)`,st.scr==='battle'&&!st.auto&&st.why==='halt'||JSON.stringify(st));
  }
  await H.browser.close();
}
const H=await open({w:390,h:844});await done(H);})();
