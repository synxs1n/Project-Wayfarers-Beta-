// ===== nav11.js (v0.17.9): click / tap to walk with a computer mouse =====
// Owner: "on computer, when I click a space to walk to on the screen, it walks to a random spot rather than where I clicked".
// Found with a Playwright probe that drives real mouse events (docs/handoff-v0111.md, 0.17.9):
// 1. ui2.js treats a press as a DRAG (steer toward the pointer, tap target dropped) once a pointermove arrives after 220 ms or after 14 px. A
//    real mouse always sends pointermove for 1 px of jitter, and on Medium/High (HD-2D) a frame takes long enough that the move is handled
//    after 220 ms, so an ordinary click became "drag": the hero took a few steps in one of 8 directions (a random spot) and the tap
//    target was thrown away. Here a mouse or pen press only becomes a drag after 6 px of travel, whatever the hold time.
// 2. The tap tile came from the camera at pointerdown. It is now recomputed at pointerup (the camera glides while the hero walks), so the tile
//    is the one under the cursor at release.
// 3. Computers zoom the page with CSS zoom on <html> (deskscale.js, 1.33 at 1920x1080). Before Chromium 128 (the Windows app is Electron 31 =
//    Chromium 126) getBoundingClientRect() of an element inside a zoomed page is in unzoomed px while clientX stays in viewport px, so
//    mapPoint (and hdPick) mixed two spaces and the tile was off by the zoom ratio times the distance from the top left. The pointer position
//    given to mapPoint is divided by the zoom when the two spaces disagree (checked against <html> itself, so it is a no-op on Chromium 128+).
function nv11Zoom(){try{const z=typeof dsZoom==='function'?dsZoom():1;if(z<=1.001)return 1;const w=document.documentElement.getBoundingClientRect().width;if(!(w>0))return 1;
  const k=window.innerWidth/w;return k>1+(z-1)/2?z:1;}catch(e){return 1;}}
{const mp0=mapPoint;mapPoint=function(e){const k=nv11Zoom();if(k===1||!e)return mp0.apply(this,arguments);return mp0.call(this,{clientX:e.clientX/k,clientY:e.clientY/k,target:e.target});};}
const NV11={slop:6,dbg:null};
const nv11Mouse=e=>e.pointerType==='mouse'||e.pointerType==='pen';
// capture phase on window runs before ui2.js's document listeners. A small mouse move is swallowed so it can never turn the press into a drag.
window.addEventListener('pointermove',e=>{try{const M=TOUCH&&TOUCH.map;if(!M||M.id!==e.pointerId||M.drag||!nv11Mouse(e))return;
  if(Math.hypot(e.clientX-M.x0,e.clientY-M.y0)<NV11.slop)e.stopImmediatePropagation();}catch(_){}},true);
// at release: a press that stayed within the slop is a tap on the tile under the cursor NOW (camera as it is at pointerup)
window.addEventListener('pointerup',e=>{try{const M=TOUCH&&TOUCH.map;if(!M||M.id!==e.pointerId||M.drag||!nv11Mouse(e)||e.type!=='pointerup')return;
  if(Math.hypot(e.clientX-M.x0,e.clientY-M.y0)>=NV11.slop*2)return;const p=mapPoint(e);if(!p)return;NV11.dbg={down:M.p0,up:p};M.p0=p;
  if(WS.mv)WS.pathAt=null;}catch(_){}},true);
