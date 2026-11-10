// v0.17.9 nav11.js: click to walk with a real mouse (owner: "on computer it walks to a random spot rather than where I clicked").
// Real mouse events (page.mouse down / move / up). The cause found: ui2.js turned a press into a DRAG when a pointermove arrived after 220 ms
// (a mouse always jitters, and an HD-2D frame is slow), the tap target was dropped and the hero walked 8-way toward the cursor. Checks, at
// 1920x1080 (page zoom 1.33) on Medium (HD-2D) and Low (Flat): a slow click with 1 px jitter (and one with a 4 px wobble) sets the tapped tile
// as the target and the hero ends on it; a real drag (40 px) still steers; a click while the hero is mid-step ends on the tile; in Chromium
// before 128 (CSS zoom reports getBoundingClientRect in unzoomed px; emulated here) mapPoint still returns the tile under the cursor.
const {open,chk,done}=require('./pw');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false,minimap:true}}));`;
const LEG=async page=>{await page.addInitScript(()=>{const o=Element.prototype.getBoundingClientRect;window.__legacy=false;Element.prototype.getBoundingClientRect=function(){const r=o.call(this),z=parseFloat(document.documentElement.style.zoom)||1;return window.__legacy&&z!==1?new DOMRect(r.x/z,r.y/z,r.width/z,r.height/z):r;};});};
const start=ev=>ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
// where on the screen is tile (x,y)? searched around a hint with the game's own mapPoint
const where=(ev,t)=>ev(([x,y])=>{const A=__A,c=A.WS.cv.getBoundingClientRect();let sx=0,sy=0,n=0;for(let yy=c.top+6;yy<c.bottom-6;yy+=3)for(let xx=c.left+6;xx<c.right-6;xx+=3){const p=A.mapPoint({clientX:xx,clientY:yy});if(p&&p.tx===x&&p.ty===y){sx+=xx;sy+=yy;n++;}}return n>8?[sx/n,sy/n]:null;},[t[0],t[1]]);
const camRest=H=>H.settle(()=>{const A=__A,c=A.HD&&A.HD.live?A.HD.cam:A.WS.cam;return c&&[Math.round(c.x*10),Math.round((c.z!==undefined?c.z:c.y)*10),A.WS.x,A.WS.y];},null,{frames:6,timeout:8000});
const settleWalk=(ev)=>ev(()=>new Promise(r=>{let n=0;const f=()=>{const W=__A.WS;if((!W.target&&!W.mv&&!W.touchDir)||++n>900)r(n);else requestAnimationFrame(f);};setTimeout(f,120);}));
async function run(gfx,w,h){const tag=`${gfx==='low'?'Flat':'HD-2D'} ${w}x${h}: `;const H=await open({w,h,pre:META(gfx),before:LEG});const {ev,wait,page}=H;
  await start(ev);await wait(500);
  await ev(()=>{const A=__A;A.placeAt('t0',...(A.getMap('t0').start||[10,10]),'d');A.render();});await wait(900);
  const info=await ev(()=>({z:parseFloat(document.documentElement.style.zoom)||1,hd:!!(__A.HD&&__A.HD.live),x:__A.WS.x,y:__A.WS.y}));
  chk(tag+'page zoom '+info.z.toFixed(2)+(gfx==='medium'?', HD-2D live':''),gfx==='low'?true:info.hd);
  const cands=await ev(()=>{const A=__A,m=A.WS.m,o=[];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const d=Math.abs(x-A.WS.x)+Math.abs(y-A.WS.y);if(d<4||d>8||A.SOLID.includes(A.tileAt(m,x,y)))continue;if(m.npcs.some(n=>Math.abs(n.x-x)+Math.abs(n.y-y)<3))continue;if(m.bld.some(b=>Math.abs(b.door[0]-x)+Math.abs(b.door[1]-y)<3))continue;
    if(A.findPath(m,A.WS.x,A.WS.y,x,y)==null)continue;o.push([x,y]);}return o;});
  const modes=[['slow click, 1 px jitter',1,420,300],['wobbly click, 4 px',4,260,230],['quick click, 2 px',2,100,50]];
  for(const [name,jit,hold,at] of modes){let ok=0,tgt=0,n=0;const bad=[];
    for(let i=0;i<3&&i<cands.length;i++){const t=cands[(i*7+3)%cands.length];
      await ev(a=>{const A=__A;A.WS.target=null;A.WS.path=null;A.WS.auto=null;A.placeAt('t0',a[0],a[1],'d');A.render();},[info.x,info.y]);await wait(500);await camRest(H);
      const pos=await where(ev,t);if(!pos)continue;n++;
      await page.mouse.move(pos[0]-25,pos[1]-15);await page.mouse.move(pos[0],pos[1],{steps:3});await page.mouse.down();await wait(at);await page.mouse.move(pos[0]+jit,pos[1]+(jit>2?1:0));await wait(Math.max(0,hold-at));
      await page.mouse.up();await wait(20);const got=await ev(()=>__A.WS.target&&__A.WS.target.slice());
      if(got&&got[0]===t[0]&&got[1]===t[1])tgt++;await settleWalk(ev);const e=await ev(()=>({x:__A.WS.x,y:__A.WS.y}));
      if(Math.abs(e.x-t[0])+Math.abs(e.y-t[1])<=1)ok++;else bad.push([t,got,[e.x,e.y]]);}
    chk(tag+name+': target is the clicked tile and the hero ends on it ('+tgt+'/'+n+' target, '+ok+'/'+n+' arrived)',n>=2&&tgt===n&&ok===n||JSON.stringify(bad));}
  // a click while the hero is mid-step (arrow key just released): the camera is still gliding, so the tile is the one under the cursor at
  // release (read by a second listener in the same event) and the walk starts from the tile the hero reaches
  {await ev(()=>{if(window.__upOn)return;window.__upOn=1;window.addEventListener('pointerup',e=>{const p=__A.mapPoint(e);window.__up=p&&[p.tx,p.ty];window.__tg=__A.WS.target&&__A.WS.target.slice();},false);});
    let ok=0,n=0;const bad=[];for(let i=0;i<3&&i<cands.length;i++){const t=cands[(i*11+5)%cands.length];
    await ev(a=>{const A=__A;A.WS.target=null;A.WS.path=null;A.WS.auto=null;A.placeAt('t0',a[0],a[1],'d');A.render();window.__up=null;},[info.x,info.y]);await wait(500);
    await page.keyboard.down('ArrowRight');await wait(140);await page.keyboard.up('ArrowRight');const pos=await where(ev,t);if(!pos)continue;n++;
    await page.mouse.move(pos[0],pos[1]);await page.mouse.down();await wait(60);await page.mouse.move(pos[0]+1,pos[1]);await wait(60);await page.mouse.up();await settleWalk(ev);
    const e=await ev(()=>({x:__A.WS.x,y:__A.WS.y,up:window.__up}));const u=e.up||t;if(Math.abs(e.x-u[0])+Math.abs(e.y-u[1])<=1)ok++;else bad.push([t,u,[e.x,e.y]]);}
    chk(tag+'a click right after a step ends on the tile under the cursor ('+ok+'/'+n+')',n>=2&&ok===n||JSON.stringify(bad));}
  // a real drag (40 px) still steers the hero
  {await ev(a=>{const A=__A;A.WS.target=null;A.placeAt('t0',a[0],a[1],'d');A.render();},[info.x,info.y]);await wait(600);
    const c=await ev(()=>{const r=__A.WS.cv.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];});
    await page.mouse.move(c[0]+60,c[1]+60);await page.mouse.down();await page.mouse.move(c[0]+100,c[1]+60,{steps:6});await wait(150);
    const td=await ev(()=>__A.WS.touchDir);await page.mouse.up();chk(tag+'a 40 px drag still steers (direction '+td+')',!!td);await settleWalk(ev);}
  // Chromium before 128: getBoundingClientRect in unzoomed px while clientX is viewport px (emulated)
  if(info.z>1.01){await ev(()=>{window.__legacy=false;});const pts=[[.3,.3],[.5,.5],[.7,.6],[.85,.8]];
    const exp=await ev(pts=>{const r=__A.WS.cv.getBoundingClientRect();return pts.map(([a,b])=>{const p=__A.mapPoint({clientX:r.left+r.width*a,clientY:r.top+r.height*b});return p&&[p.tx,p.ty];});},pts);
    const pos=await ev(pts=>{const r=__A.WS.cv.getBoundingClientRect();return pts.map(([a,b])=>[r.left+r.width*a,r.top+r.height*b]);},pts);
    await ev(()=>{window.__legacy=true;});
    const got=await ev(pos=>pos.map(([x,y])=>{const p=__A.mapPoint({clientX:x,clientY:y});return p&&[p.tx,p.ty];}),pos);await ev(()=>{window.__legacy=false;});
    chk(tag+'legacy CSS-zoom coordinates: mapPoint returns the same tiles ('+JSON.stringify(got)+' vs '+JSON.stringify(exp)+')',JSON.stringify(got)===JSON.stringify(exp));}
  await H.browser.close();}
(async()=>{const O=process.env.ONLY;if(!O||O==='hd')await run('medium',1920,1080);if(!O||O==='flat')await run('low',1920,1080);if(!O||O==='hd2')await run('medium',1366,768);await done({browser:{close:async()=>{}}});})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
