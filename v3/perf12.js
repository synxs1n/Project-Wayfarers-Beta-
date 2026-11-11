// ===== perf12.js (v0.18.7): phones stay cool on High graphics =====
// Owner: "tester said game on max graphics made his phone hot, game isn't too graphically demanding so I find this weird".
// Measured: on a phone (390x844, dpr 3, High) every screen asked for a frame at the display's full rate whether or not anything moved,
// the HD-2D scene rendered 3 internal pixels per art pixel (525x804, nine times the pixels of the 2D view), and with a menu open High's
// depth of field (style.css html.mopen.gq-dof2 #screen{filter:blur}) re-blurred the whole screen on every one of those frames.
// What this module does, all of it only on a phone (coarse pointer, shorter screen side up to 600 css px: tablets, folds and computers keep
// every pixel and frame they had), none of it under tests unless window.__P12F is set:
//   1. Internal resolution: Auto render scale caps at 2 internal pixels per art pixel (the HD-2D scene, the battle stage's GL canvas and the
//      battle unit layer's backing). Settings > Render scale 1x / 2x / 3x is the player's own word and is kept.
//   2. Idle frame limiter: the world and the battle draw at most 30 frames a second while nothing moves (no walker, no path, no camera glide,
//      no fade; battle: waiting for a command, no effect running); a frame that moved something draws at up to 60 (a 120 Hz phone drew 120)
//      and for 350 ms after.
//   3. A world or battle under an open menu draws 8 frames a second (it is dimmed and, on High, blurred behind the menu).
//   4. A hidden tab draws nothing (on every device: the browser already throttles, this stops the work at once).
// The game state keeps its own pace: worldTick and the battle clock still run every frame, only the pictures are skipped, and the
// canvases keep their last picture. Nothing here touches the save, the Daily Trial or the random numbers.
const P12={fpsBusy:60,fpsIdle:30,fpsMenu:8,grace:350,pxMax:2,inLoop:0,pT:0,ph:false,w:{last:0,sig:'',busy:0},b:{last:0,busy:0},n:{wDraw:0,wSkip:0,bDraw:0,bSkip:0,hid:0}};
function p12On(){try{return !window.__PWTEST||!!window.__P12F;}catch(e){return true;}}
function p12Phone(){try{if(typeof window.__P12P==='boolean')return window.__P12P;const t=performance.now();if(P12.pT&&t-P12.pT<3000)return P12.ph;P12.pT=t;
  const co=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches),sm=Math.min(screen.width||9999,screen.height||9999);return P12.ph=co&&sm<=600;}catch(e){return false;}}
function p12Cap(){return p12On()&&p12Phone()&&resCfg()===0;}
// ----- 1. internal resolution -----
HOOK.xform('resPx','perf12','phones: Auto never goes above 2 internal pixels per art pixel',function(r){return p12Cap()?Math.min(r,P12.pxMax):r;});
HOOK.xform('resStageR','perf12','phones: the battle stage GL canvas at 2 backing pixels per CSS pixel at most',function(r){return p12Cap()?Math.min(r,P12.pxMax):r;});
HOOK.xform('resBk','perf12','phones: the battle unit layer keeps the 2x HD paint (no 4x backing)',function(r){return p12Cap()?Math.min(r,SPR.k):r;});
// ----- 2. the frames the loop draws -----
HOOK.wrap('loop','perf12','marks the frames the game loop draws (the limiter skips only those, never a direct call)',function(next){P12.inLoop=1;try{return next.apply(this,arguments);}finally{P12.inLoop=0;}});
function p12WorldBusy(t){const W=P12.w,c=WS.cam,cv=WS.cv;
  const sig=(WS.m?WS.m.id:'')+'|'+WS.px+'|'+WS.py+'|'+(c?c.x+','+c.y:'')+'|'+(cv?cv.width+'x'+cv.height:'')+'|'+(WS.flash||0)+'|'+(WS.fade||0)+'|'+(WS.fadeIn||0);
  if(sig!==W.sig){W.sig=sig;W.busy=t+P12.grace;}
  if(WS.mv||(WS.held&&WS.held.length)||WS.target||WS.path||WS.padDir||WS.joyDir)W.busy=t+P12.grace;
  return t<W.busy;}
function p12BattleBusy(t){const b=P12.b;let hot=false;
  try{hot=B.mode!=='cmd'||animating()||!!BV.shake||!!BV.flash||BV.P.length>0||!!B.lim2T||!!B.banner;}catch(e){hot=true;}
  if(hot)b.busy=t+P12.grace;return t<b.busy;}
// true: draw this frame
function p12Due(st,t,busy){const gap=t-st.last;
  if(V.modal)return gap>=1000/P12.fpsMenu-4;
  if(busy)return gap>=1000/P12.fpsBusy-3;// a 120 Hz phone draws every second frame
  return gap>=1000/P12.fpsIdle-5;}// 5 ms of slack: a 60 Hz frame is 16.7 ms, two of them 33.3
HOOK.before('worldDraw','perf12','idle frame limiter: a still world draws 30 fps on phones, 8 under a menu, nothing in a hidden tab',function(now){
  if(!P12.inLoop||!p12On())return;
  if(document.hidden){P12.n.hid++;return HOOK.stop();}
  if(!p12Phone())return;
  const t=+now||performance.now();
  if(!p12Due(P12.w,t,p12WorldBusy(t))){P12.n.wSkip++;return HOOK.stop();}
  P12.w.last=t;P12.n.wDraw++;});
HOOK.before('battleFrame','perf12','idle frame limiter: a waiting battle draws 30 fps on phones, 8 under a menu, nothing in a hidden tab',function(now){
  if(!P12.inLoop||!p12On())return;
  if(document.hidden){P12.n.hid++;return HOOK.stop();}
  if(!p12Phone())return;
  const t=+now||performance.now();
  if(!p12Due(P12.b,t,p12BattleBusy(t))){P12.n.bSkip++;return HOOK.stop();}
  P12.b.last=t;P12.n.bDraw++;});
