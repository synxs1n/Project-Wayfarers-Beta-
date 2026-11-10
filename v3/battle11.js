// ===== battle11.js (v0.16.7): battle UI pass: bigger foes, a plainer command head, double tap / hold on a foe opens its card =====
// Owner: "Battle bosses also look small in battle." Foe sprites were drawn at their canvas size (60x60 for BIG_ART: Scourges, Calamities,
// guardians, the Riftkeeper; 40x40 for the rest) while heroes stand about 36x50, so a boss barely topped the party. In battle a foe is now drawn
// FS11.big (81/60 = 1.35) or FS11.small (44/40 = 1.1) times its canvas. One place does it: monCanvas (the last wrapper) returns a nearest
// neighbour resample of the foe's canvas while FS11.on is set (spriteOf for foes and battleFrame set it, so idle frames, attack and hit frames
// and the boss exhale all come out the same size; the world, bestiary and foe rows keep the old canvas), and unitBox reports the larger
// w/h (so the click area, the HUD plate, intents, target tags, effects and b3Lay all follow) and keeps the foe inside the stage (its head at least
// FS11.top px from the top). Heroes, companions and tamed monsters fighting as heroes (side 'p') and heroArt foes are never touched.
// Owner: "Don't need HP and MP bars under the part where it says whose turn it is." The portrait command head loses the HP/MP mini bars
// (battle3.js b8hm); the numbers stay in the hero card, the head's aria-label keeps them for screen readers.
// Owner: "Double clicking a foe in battle opens its battle card, press and hold does this too." A tap on a foe (its sprite box, its plate or its
// target tag) twice within 350 ms, or a press held 450 ms, opens the same card as the i button (ACT.uInfo). Pointer events. The held press does not
// target on release. While a foe is a valid target the single tap now fires on release (it fired on pointer down in ui.js, which a hold could not
// cancel); moving more than 10 px or a cancelled pointer (scroll) does nothing. A timed hit ring owns every press (battle5.js capture listener,
// registered earlier, stops the event before this one).
const FS11={big:81/60,small:44/40,top:4,on:0,hold:450,dbl:350,slop:10,cache:new WeakMap()};
function fs11Scale(art){try{return MON_SIZE(art)>=60?FS11.big:FS11.small;}catch(e){return 1;}}
function fs11Cv(c,art){if(!c||!c.width)return c;let o=FS11.cache.get(c);if(o)return o;const s=fs11Scale(art),lw=Math.round(c.width*s),lh=Math.round(c.height*s),k=c.hd;
  if(k&&typeof hdCv==='function'){const RW=c._rw||Math.round(c.width*k),RH=c._rh||Math.round(c.height*k);o=hdCv(lw,lh,k);const x=o.getContext('2d');x.setTransform(1,0,0,1,0,0);x.imageSmoothingEnabled=false;(x._hdDI||x.drawImage).call(x,c,0,0,RW,RH,0,0,Math.round(lw*k),Math.round(lh*k));x.setTransform(k,0,0,k,0,0);}/* bitmap pixels, as b8Small */
  else{o=mkCv(lw,lh);const x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,0,0,c.width,c.height,0,0,lw,lh);}
  try{if(typeof BART!=='undefined'&&BART.has(c))BART.set(o,BART.get(c));}catch(e){}/* the boss exhale frame looks up its frame B by the source canvas */
  FS11.cache.set(c,o);return o;}
{const mc0=monCanvas;monCanvas=function(art,f){const c=mc0.apply(this,arguments);try{if(FS11.on)return fs11Cv(c,art);}catch(e){}return c;};}
{const so0=spriteOf;spriteOf=function(u,walk){const was=FS11.on;FS11.on=u&&u.side!=='p'&&!u.heroArt?1:0;try{return so0.apply(this,arguments);}finally{FS11.on=was;}};}
{const bf0=battleFrame;battleFrame=function(){const was=FS11.on;FS11.on=1;try{return bf0.apply(this,arguments);}finally{FS11.on=was;}};}
{const ub0=unitBox;unitBox=function(u){const b=ub0.apply(this,arguments);try{if(b&&u&&u.side!=='p'&&!u.heroArt&&u.art){const sz=MON_SIZE(u.art),n=Math.round(sz*fs11Scale(u.art));
  if(n!==sz){b.w=b.h=n;const lo=FS11.top+n,hi=BL.H-2;let y=b.y;if(y<lo)y=Math.min(lo,hi);if(y!==b.y){if(b.gy!=null)b.gy+=y-b.y;b.y=y;}}}}catch(e){}return b;};}

// ----- the command head without the HP/MP mini bars -----
{const st=document.createElement('style');st.textContent='.battle.b3 .who.cmdhead small .b8hm{display:none!important}.bstage .unit.foe{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}';document.head.appendChild(st);}
{const ch0=cmdHtml;cmdHtml=function(){let h=ch0.apply(this,arguments);try{const m=String(h).match(/<span class="b8hm" role="img" aria-label="([^"]*)">(?:<span class="hb (?:hp|mp)"><i style="[^"]*"><\/i><\/span><em class="nums">[^<]*<\/em>){2}<\/span>/);
  if(m)h=h.replace(m[0],'').replace('<div class="who cmdhead">','<div class="who cmdhead" role="group" aria-label="'+m[1]+'">');}catch(e){}return h;};}/* the numbers stay as the head's accessible label */

// ----- double tap / press and hold on a foe opens its card -----
let FG11=null,FL11=null;
function fg11Active(){try{if(!B||V.screen!=='battle'||V.modal||B.wipe)return false;const R=typeof B5R!=='undefined'&&B5R.ring;return !(R&&!R.done);}catch(e){return false;}}
function fg11Hit(e){// the foe index under the pointer: a sprite box (DOM), else a plate or target tag drawn on the stage
  const t=e.target;if(!t||!t.closest)return null;const u=t.closest('.unit');
  if(u){if(!u.classList.contains('foe'))return null;const i=+u.dataset.arg;const f=B.en[i];return f&&f.hp>0?{i,el:u,tg:u.classList.contains('tg')}:null;}
  if(t.closest('[data-act],button,a,input,select,textarea'))return null;
  const st=document.getElementById('bstage');if(!st||!t.closest('#bwrap'))return null;
  const r=st.getBoundingClientRect();if(!r.width||!BL||!BL.W)return null;const k=r.width/BL.W,x=(e.clientX-r.left)/k,y=(e.clientY-r.top)/k;
  let L=null;try{L=b3Lay();}catch(er){}if(!L)return null;
  const hit=(o,p)=>o&&x>=o.x-p&&x<=o.x+o.w+p&&y>=o.y-p&&y<=o.y+o.h+p;
  for(let i=0;i<B.en.length;i++){const f=B.en[i];if(!f||f.hp<=0)continue;if(hit(L.plates&&L.plates.get(f),1)||hit(L.tgt&&L.tgt.get(f),1))return {i,el:null,tg:false};}
  return null;}
function fg11Open(i){try{if(!B||V.screen!=='battle')return;const f=B.en[i];if(!f||f.hp<=0)return;const ref=unitRef(f);if(B.uDet&&B.uDet.ref===ref)return;/* uInfo toggles: an open card stays open */ACT.uInfo(ref);try{if(navigator.vibrate)navigator.vibrate(8);}catch(e){}}catch(e){}}
function fg11End(){if(FG11&&FG11.timer)clearTimeout(FG11.timer);FG11=null;}
document.addEventListener('pointerdown',e=>{
  if(FG11){fg11End();}/* a second finger or a missed up event: start over */
  if(e.button>0||e.isPrimary===false||!fg11Active())return;
  const h=fg11Hit(e);if(!h)return;
  if(h.tg){e.preventDefault();e.stopPropagation();}/* ui.js fires a target on pointer down; it now fires on release below, so a hold can open the card instead */
  const P=FG11={id:e.pointerId,i:h.i,el:h.el,tg:h.tg,x:e.clientX,y:e.clientY,held:false,moved:false};
  P.timer=setTimeout(()=>{if(FG11!==P||P.moved)return;P.held=true;FL11=null;fg11Open(P.i);},FS11.hold);
},true);
document.addEventListener('pointermove',e=>{const P=FG11;if(!P||e.pointerId!==P.id||P.moved)return;if(Math.hypot(e.clientX-P.x,e.clientY-P.y)>FS11.slop){P.moved=true;if(P.timer)clearTimeout(P.timer);}},true);
document.addEventListener('pointercancel',e=>{if(FG11&&e.pointerId===FG11.id)fg11End();},true);
document.addEventListener('pointerup',e=>{const P=FG11;if(!P||e.pointerId!==P.id)return;fg11End();
  if(P.held){e.preventDefault();return;}/* the card is already open; releasing a hold does not target */
  if(P.moved||!fg11Active())return;
  const now=performance.now();
  if(FL11&&FL11.i===P.i&&now-FL11.t<FS11.dbl){FL11=null;fg11Open(P.i);return;}
  FL11={i:P.i,t:now};
  if(P.tg){const f=B.en[P.i];if(f&&targetable(f)&&ACT.tgtE)ACT.tgtE(String(P.i),P.el);}/* the single tap: the same call ui.js made on pointer down */
},true);
document.addEventListener('contextmenu',e=>{try{if(FG11&&(FG11.held||FG11.timer)||(B&&V.screen==='battle'&&e.target&&e.target.closest&&e.target.closest('.bstage .unit.foe')))e.preventDefault();}catch(er){}},true);
window.__B11={FS:FS11,fg:()=>FG11,open:fg11Open,hit:fg11Hit};
