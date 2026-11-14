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
const FS11={big:1.5,small:1.25,mini:2.5,top:4,on:0,hold:450,dbl:350,slop:10,cache:new WeakMap(),spec:{}};
// ===== v0.19.2 guardians at boss size =====
// Owner: "Guardians are too small, should be as big as bosses, both when facing them and summoning them." Measured on the stage (the alpha bounds of
// the finished canvases): a Scourge or Calamity (60 px art at 1.5x) shows a figure about 91 px tall and 95 wide, a guardian (a 40 px art at 2.0x) about
// 71 and 75. The guardian target is now 2.5 (5 backing pixels per art pixel at density 2, 10 at density 4: whole pixels either way), a figure of about
// 89 by 94, the size of a boss. The Priest's and the Monk's summoned guardian is drawn the same way (spriteOf and unitBox treat u.isSum like a foe, and
// summon8.js no longer swaps in the small '~s' art). kits12.js places them: a guardian fight uses the boss slots, a summoned guardian takes the party's
// boss slot, or stands beside the allies it does not overlap.
// ===== v0.17.9 foe fidelity pass (the sweep of every foe sprite as the stage draws it; tools/chrome/v160a.js) =====
// What the sweep found (265 arts): 162 arts had painted pixels on the canvas edge (the boss grids are drawn to the full 60x60, so arms, hammers,
// crowns and the key-staff were cut flat and the outline and glow lost there), 44 non-flyers stood 3 to 13 px above the stage line (the art
// leaves empty rows under the feet and the old 1.35x grew the gap), the 1.35x / 1.1x resample made an art pixel 2.7 / 2.2 backing pixels wide
// (uneven columns on every sprite), and the 20 guardian variants (sites.js MINI_BIG: the 40 px art enlarged 1.5x into a plain 60 px canvas)
// had lost the HD paint altogether. So in battle a foe is no longer the shared canvas resampled: it is painted again from its key grid onto a
// padded grid (PGP: PG with an origin shift, so shapes that overflow the 60x60 or 40x40 grid, drake's tail, the geyser matron's steam, land
// on the canvas), cropped under the feet (flyers keep their bottom rows: they hover), then taken to the stage by a whole number of backing
// pixels per ART pixel:
//   apx = floor(target * K) backing px per art px, K = the unit layer's backing density (2 on plain screens, 4 where the display has the
//   pixels; res11.js resBk). target: BIG_ART 1.5, ordinary foes 1.25, guardian variants (40 px art) 2.0 (v0.19.2: 2.5, see below).
//   K 2: bosses 3 px per art px (art 90 logical), ordinary foes 2 (1.0x), guardians 4. K 4: bosses 6, ordinary foes 5 (1.25x), guardians 8.
//   The HD paint is two bitmap pixels per art pixel, so K 4 bosses are exactly 3 backing px per bitmap pixel (clean nearest), K 2 bosses 1.5 (each
//   art pixel an even 3 px, the half pixel smoothing alternating 1 and 2). A non-integer ratio of two or more takes one EPX pass first.
// The canvas dimensions are multiples of 4 art px so every apx gives a whole logical size. unitBox follows the canvas (width and height).
const PGP=class extends PG{g(x,y){return super.g(x+this.ox,y+this.oy);}};/* PG reads ignore the origin shift; art code that reads its own grid (bsh) must see its own coordinates */
function fs11Mini(art){try{return typeof MINI_BIG!=='undefined'&&MINI_BIG.has(art);}catch(e){return false;}}
function fs11Grid(art){return fs11Mini(art)?40:MON_SIZE(art);}
function fs11Scale(art){try{return fs11Mini(art)?FS11.mini:MON_SIZE(art)>=60?FS11.big:FS11.small;}catch(e){return 1;}}
function fs11Fly(art){try{return monFam(art).includes('flying');}catch(e){return false;}}
function fs11Draw(g,art,f){const o=MART[art](g,f),pal=Object.assign({},o.pal);if(MEXTRA[art])MEXTRA[art](g,pal);return {o,pal};}
// per art: where the key grid really is (drawn on a grid with 10 px of room on every side), so the stage canvas can fit it
function fs11Spec(art){let sp=FS11.spec[art];if(sp!==undefined)return sp;sp=null;
  try{if(typeof PG==='undefined'||!MART[art]||typeof SPRITE_HD==='undefined'||!SPRITE_HD||typeof paintHD!=='function')throw 0;
    const sz=fs11Grid(art),O=10,g=new PGP(sz+2*O,sz+2*O,O,O);fs11Draw(g,art,null);
    let l=1e9,r=-1,t=1e9,b=-1;for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(g.a[y*g.w+x]){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}
    if(r<0)throw 0;l-=O;r-=O;t-=O;b-=O;
    let P=Math.max(2,2-l,r-(sz-1)+2);P+=P%2;/* even: width a multiple of 4 */
    const fly=fs11Fly(art);let T=Math.max(2,2-t);
    const body=fly?Math.max(sz,b+2):b+2;/* feet: one art px of outline room under the lowest painted row; flyers keep their bottom rows (they hover) */
    while((T+body)%4)T++;
    sp={sz,P,T,W:sz+2*P,H:T+body,fly};}catch(e){sp=null;}
  FS11.spec[art]=sp;return sp;}
function fs11Src(art,f){const sp=fs11Spec(art);if(!sp)return null;
  return monFramed(art+'|s11',f,()=>{const g=new PGP(sp.W,sp.H,sp.P,sp.T),d=fs11Draw(g,art,f),p=new PG(sp.W,sp.H,0,0);p.a=g.a;
    const c=paintHD(p,d.pal,{flat:d.o.flat||'',rim:d.o.rim,glow:d.o.glow,tex:monTex(art)});
    try{if(!(f&&(f.t==='atk'||f.t==='hit'||f.i))&&bigArtOn(art))BART.set(c,art);}catch(e){}c._s11=sp;return c;});}
// v0.17.3: the resample follows the battle layer's backing density (res11.js resBk: 2 on small or plain screens, 4 where the display has the
// pixels). A foe painted by fs11Src goes to a whole number of backing pixels per art pixel (above); anything else (no spec: the old canvas)
// keeps the old 1.35x / 1.1x EPX then nearest path.
function fs11Cv(c,art){if(!c||!c.width)return c;const cvb=document.getElementById('bcv'),k=c.hd,K=k&&cvb&&cvb._ss>k?cvb._ss:k;let e=FS11.cache.get(c);if(e&&e.k===K)return e.o;let o;
  const sp=c._s11,T=fs11Scale(art),apx=sp?Math.max(1,Math.floor(T*(K||1)+1e-6)):0;
  const s=sp?apx/(K||1):(MON_SIZE(art)>=60?81/60:44/40),lw=Math.round(c.width*s),lh=Math.round(c.height*s);
  if(k&&typeof hdCv==='function'){const RW=c._rw||Math.round(c.width*k),RH=c._rh||Math.round(c.height*k);o=hdCv(lw,lh,K);const x=o.getContext('2d'),tw=sp?c.width*apx:Math.round(lw*K),th=sp?c.height*apx:Math.round(lh*K);x.setTransform(1,0,0,1,0,0);x.imageSmoothingEnabled=false;
    let src=c,sw=RW,sh=RH;const r=tw/RW,whole=Math.abs(r-Math.round(r))<.01;
    if(K>k&&typeof resEpx==='function'&&(sp?(!whole&&r>=2):true)){try{let n=0;while(sw<tw&&n<(sp?1:2)){src=resEpx(src);sw=src.width;sh=src.height;n++;}}catch(er){src=c;sw=RW;sh=RH;}}
    (x._hdDI||x.drawImage).call(x,src,0,0,sw,sh,0,0,tw,th);x.setTransform(K,0,0,K,0,0);}/* bitmap pixels, as b8Small */
  else{o=mkCv(lw,lh);const x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,0,0,c.width,c.height,0,0,lw,lh);}
  try{if(typeof BART!=='undefined'&&BART.has(c))BART.set(o,BART.get(c));}catch(er){}/* the boss exhale frame looks up its frame B by the source canvas */
  if(sp){o._s11=sp;o._s11s=s;}
  FS11.cache.set(c,{k:K,o});return o;}
{const mc0=monCanvas;monCanvas=function(art,f){if(FS11.on){try{const s=fs11Src(art,f);if(s)return fs11Cv(s,art);}catch(e){}}
  const c=mc0.apply(this,arguments);try{if(FS11.on)return fs11Cv(c,art);}catch(e){}return c;};}
HOOK.wrap('spriteOf','battle11','foe size scaling on (a summoned guardian is drawn like a foe guardian)',function(next,u,walk){const was=FS11.on;FS11.on=u&&(u.side!=='p'||u.isSum)&&!u.heroArt?1:0;try{return next(u,walk);}finally{FS11.on=was;}});
HOOK.wrap('battleFrame','battle11','foe size scaling on',function(next,now){const was=FS11.on;FS11.on=1;try{return next(now);}finally{FS11.on=was;}});
{const ub0=unitBox;unitBox=function(u){const b=ub0.apply(this,arguments);try{if(b&&u&&(u.side!=='p'||u.isSum)&&!u.heroArt&&u.art){const c=spriteOf(u),sp=c&&c._s11;let w,h,vis;
  if(sp){w=c.width;h=c.height;vis=h-sp.T*c._s11s;}else{const sz=MON_SIZE(u.art),n=Math.round(sz*fs11Scale(u.art));w=h=vis=n;if(n===sz)return b;}
  b.w=w;b.h=h;const lo=FS11.top+vis,hi=BL.H-2;let y=b.y;if(y<lo)y=Math.min(lo,hi);if(y!==b.y){if(b.gy!=null)b.gy+=y-b.y;b.y=y;}}}catch(e){}return b;};}

// ----- the command head without the HP/MP mini bars -----
{const st=document.createElement('style');st.textContent='.battle.b3 .who.cmdhead small .b8hm{display:none!important}.bstage .unit.foe{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}';document.head.appendChild(st);}
HOOK.xform('cmdHtml','battle11','command head without the HP/MP mini bars',function(h){try{const m=String(h).match(/<span class="b8hm" role="img" aria-label="([^"]*)">(?:<span class="hb (?:hp|mp)"><i style="[^"]*"><\/i><\/span><em class="nums">[^<]*<\/em>){2}<\/span>/);
  if(m)h=h.replace(m[0],'').replace('<div class="who cmdhead">','<div class="who cmdhead" role="group" aria-label="'+m[1]+'">');}catch(e){}return h;});/* the numbers stay as the head's accessible label */

// ----- double tap / press and hold on a foe opens its card -----
let FG11=null,FL11=null;
function fg11Active(){try{if(!B||V.screen!=='battle'||V.modal||B.wipe)return false;const R=typeof B5R!=='undefined'&&B5R.ring;return !(R&&!R.done);}catch(e){return false;}}
function fg11Hit(e){// the foe index under the pointer: a sprite box (DOM), else a plate or target tag drawn on the stage
  const t=e.target;if(!t||!t.closest)return null;const u=t.closest('.unit');
  /* 0.21.6: a foe's plate is drawn over the units, so a tap on it means that foe even where another foe's tap area lies under it */
  if(u&&u.classList.contains('foe'))try{const st=document.getElementById('bstage'),r=st&&st.getBoundingClientRect(),L=r&&r.width&&BL&&BL.W?b3Lay():null;if(L&&L.plates){const k=r.width/BL.W,x=(e.clientX-r.left)/k,y=(e.clientY-r.top)/k;
    for(let i=0;i<B.en.length;i++){const f=B.en[i],o=f&&f.hp>0&&L.plates.get(f);if(o&&x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h)return {i,el:+u.dataset.arg===i?u:null,tg:+u.dataset.arg===i&&u.classList.contains('tg')};}}}catch(er){}
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
