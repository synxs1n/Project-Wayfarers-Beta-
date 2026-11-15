// ===== fix18.js: the owner's notes after 0.22.3 (test tools/chrome/v196a.js) =====
// 1) "Have to click auto twice to start it": fixed at the root in ui.js ACT.auto. The press flipped V.auto, the remembered choice, while the
//    button shows B.auto. A fight that opens with auto locked (a boss not yet won by hand, a foe type not yet beaten enough: prog2.js) turns
//    B.auto off and leaves V.auto on, so once the lock lifted (the locked foe falls) the button said Start auto and the first press only
//    switched the remembered choice off. The press now flips what the button shows.
// 2) Transitions (battle start, every map change): see section 2 below and docs/handoff-v0111.md (fix18) for the timing table.
// 3) "quest accepting is all over the place": one row language on the board, the Guild Hall and the Menu (section 3); lists keep their order
//    while the popup is open (menus3.js nbKeep, used by every notice list); guild notices only on the Guilds tab and in Notices.
// 4) "Can't click to walk on PC map at all": the full map (and the connected world map) read the pointer in viewport px against
//    getBoundingClientRect in unzoomed px on Chromium before 128 (the Windows app is Electron 31 = Chromium 126) when the page is zoomed
//    (deskscale.js: 1.33 in a maximised 1920x1080 window). The tile was off by the zoom ratio times the distance from the corner: "There is no way
//    there", "not seen yet" or the wrong spot. nav11.js fixed this for the world view only (mapPoint); the map tiles now use the same correction.
const F18={off:0,n:{bake1:0,lazy1:0},err:[]};
function f18Err(w,e){try{if(F18.err.length<20)F18.err.push(w+': '+(e&&e.message||e));}catch(_){}}

// ---------- 2. transitions ----------
// The second animation frame of the 2D base (WS.base[1]: water and lava in their other pose) was painted with the first on every map change, in
// the same task as the map change. In HD-2D (Medium, High) the world never draws it (the scene bakes its own ground), and in 2D the first
// frame shows frame 0. It is now made when it is first read, or in the first idle moment after the new map's first frame, whichever comes
// first (in 2D; HD-2D makes it only if something reads it): the same canvas, so nothing drawn changes. (A chest patch, world16.js, reads it and so makes it.)
function f18LazyBase(arr,m){let c=null;const mk=()=>{if(!c){c=buildMapCanvas(m,1);F18.n.lazy1++;}return c;};
  try{Object.defineProperty(arr,1,{get:mk,set(v){c=v;},enumerable:true,configurable:true});Object.defineProperty(arr,'f18Built',{value:()=>!!c});}catch(e){arr[1]=mk();}
  // in HD-2D the world never draws it (only a chest patch or a fall back to 2D reads it, and the getter serves those); in 2D it is made in the
  // first idle moment on the world screen, not during a battle that started right away
  const idle=()=>{try{if(WS.base!==arr||c)return;if(V.screen!=='world'||(typeof hdActive==='function'&&hdActive()))return;mk();}catch(e){f18Err('lazy',e);}};
  try{requestAnimationFrame(()=>{if(typeof requestIdleCallback==='function')requestIdleCallback(idle,{timeout:1500});else setTimeout(idle,200);});}catch(e){setTimeout(idle,200);}
  return arr;}
HOOK.wrap('rebuildBase','fix18','the second water frame of the 2D base is made when first needed',function(next,...a){if(F18.off||!WS.m)return next(...a);
  // a chest's repaint (world16.js) patches the base in place: left as it is
  try{if(typeof W16!=='undefined'&&W16.pend&&!W16.off)return next(...a);}catch(e){}
  const m=WS.m,b0=buildMapCanvas,before=WS.base;let calls=0;
  // the base body builds frame 0 then frame 1; frame 1 is left out here (scanLights and the other hooks run as before)
  buildMapCanvas=function(mm,fr){if(mm===m&&fr===1&&calls++===0)return null;return b0.apply(this,arguments);};
  let r;try{r=next(...a);}finally{buildMapCanvas=b0;}
  // (only a base this call made: a chest patch, world16.js, keeps the old one; the descriptor is read so a lazy frame is never made here)
  try{const Bs=WS.base,d=Bs&&Bs!==before&&Array.isArray(Bs)?Object.getOwnPropertyDescriptor(Bs,1):null;
    if(WS.m===m&&d&&('value' in d)&&d.value==null&&Bs[0]){F18.n.bake1++;WS.base=f18LazyBase([Bs[0]],m);}}catch(e){f18Err('rebuild',e);}
  return r;});

// The battle screen sizes its stage from hidden copies of the command panel, the foes and the party column at each width it tries
// (battle3.js b8HAt, b8CmdEst). Every copy was appended and read on its own, a full page layout each, and b8HAt measured again on every call:
// about 25 layouts for one battle start, 0.4 to 0.8 s with six heroes. Same copies, same parent, same numbers, now read together: b8CmdEst lays
// out one copy per Vanguard hero side by side and reads them in one layout, and b8HAt answers a repeat question (same panel, same markup, same
// width and classes) within the same task from what it just measured.
const F18H={v:null,n:{lay:0,ask:0,hit:0}};
// the task's memo (cleared at the end of the task: the battle DOM may change before the next one)
function f18Memo(){if(!F18H.v){F18H.v=new Map();const done=()=>{F18H.v=null;};try{queueMicrotask(done);}catch(e){Promise.resolve().then(done);}}return F18H.v;}
{const h0=b8HAt;b8HAt=function(kind,w){if(F18.off||!B)return h0.apply(this,arguments);let k=null;F18H.n.ask++;
  try{const bat=document.querySelector('.battle.b3');if(bat){const src=kind==='cmd'?document.getElementById('bcmd'):bat.querySelector(kind==='foes'?'#bparty .pgroup.foes':'#bparty .b3pty');
      k=kind+'@'+Math.round(w)+'|'+(B.id||0)+'|'+bat.className+'|'+B.mode+'|'+B.menu+'|'+(B.swapAsk?1:0)+'|'+(B.auto?1:0)+'|'+(B.over?1:0)+'|'+(src?src.className+'#'+src.innerHTML:'-');
      const M=f18Memo();if(M.has(k)){F18H.n.hit++;return M.get(k);}}}catch(e){k=null;}
  const r=h0.apply(this,arguments);try{if(k)f18Memo().set(k,r);}catch(e){}return r;};}
// (same body as battle3.js b8CmdEst; only the copies are read together)
const F18_CE0=b8CmdEst;
b8CmdEst=function(w){if(F18.off)return F18_CE0.apply(this,arguments);try{if(!B||B.over||B.auto)return 0;const cmd=document.getElementById('bcmd');if(!cmd||!cmd.offsetWidth||!cmd.parentNode)return 0;
  const hs=B.front.filter(c=>c&&c.hp>0&&!c.isComp);if(!hs.length)return 0;const W=Math.round(w||cmd.offsetWidth);
  const k=(B.id||0)+'|'+BL.mode+'|'+W+'|'+hs.map(c=>c.id+(lbReady(c)?'L':'')+(canSummon(c)?'S':'')+(has(c,'root')?'R':'')).join()+'|'+document.querySelector('.battle').className.replace(/ b3list/,'');
  B._b8ce=B._b8ce||{};if(B._b8ce[k]!=null)return B._b8ce[k];
  const sv={mode:B.mode,cur:B.cur,menu:B.menu,pend:B.pend,swapAsk:B.swapAsk,b4out:B.b4out},H=[];
  try{for(const a of hs){B.mode='cmd';B.cur=a;B.menu='root';B.pend=null;B.swapAsk=null;H.push(cmdHtml());}}finally{Object.assign(B,sv);}
  const C=H.map(html=>{const c=cmd.cloneNode(false);c.removeAttribute('id');
    c.style.cssText='position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;width:'+W+'px;height:auto;max-height:none;min-height:0;overflow:visible;grid-row:auto;grid-column:auto;--b8gp:0px;--b8gs:0px;--b8ga:0px';
    c.innerHTML=html;return c;});
  let h=0;C.forEach(c=>cmd.parentNode.appendChild(c));F18H.n.lay++;try{C.forEach(c=>{h=Math.max(h,c.offsetHeight);});}finally{C.forEach(c=>c.remove());}
  return B._b8ce[k]=h;}catch(e){return 0;}};

// The cloud sea (world14.js, the heights realms) paints every water tile pixel by pixel from a noise field, and every map change paints it four
// times (the 2D base in two frames, the HD-2D ground in two frames): about a second on a heights field. Each tile's body is now painted once per
// map and frame into a layer and copied from there (the same pixels: opaque colours at whole pixels, copied 1:1). The layers of the last two
// maps are kept (four canvases at most).
const F18C={L:new Map(),max:4,n:{paint:0,copy:0}};
{const c0=w14CloudBody;w14CloudBody=function(ctx,m,x,y,frame,T,skipRows){
  if(F18.off||!ctx||!m||!m.w||!m.h||typeof ctx.getTransform!=='function')return c0.apply(this,arguments);
  try{const tr=ctx.getTransform();if(!(tr.a===1&&tr.b===0&&tr.c===0&&tr.d===1&&tr.e===0&&tr.f===0)||ctx.globalAlpha!==1||ctx.globalCompositeOperation!=='source-over'||(ctx.filter&&ctx.filter!=='none'))return c0.apply(this,arguments);
    const key=m.id+'|'+(m.s|0)+'|'+(frame?1:0)+'|'+m.w+'x'+m.h;let e=F18C.L.get(key);
    if(!e||e.T!==T||e.m!==m){e={T,m,cv:mkCv(m.w*TS,m.h*TS),done:new Int8Array(m.w*m.h).fill(-1)};F18C.L.delete(key);F18C.L.set(key,e);while(F18C.L.size>F18C.max)F18C.L.delete(F18C.L.keys().next().value);}
    else{F18C.L.delete(key);F18C.L.set(key,e);}
    const i=y*m.w+x,k=skipRows|0;
    if(e.done[i]!==k){const c=e.cv.getContext('2d');c.clearRect(x*TS,y*TS,TS,TS);c0.call(this,c,m,x,y,frame,T,skipRows);e.done[i]=k;F18C.n.paint++;}
    else{F18C.n.copy++;try{W14.n.cloud++;}catch(_){}}
    ctx.drawImage(e.cv,x*TS,y*TS,TS,TS,x*TS,y*TS,TS,TS);return;}catch(er){f18Err('cloud',er);}
  return c0.apply(this,arguments);};}

// a chest patch (world16.js w16Patch) on a map whose second frame is not made yet patches the first frame only: the second is made later
// from the map as it is then (the chest already open), so the patch stays as quick as before
{const p0=w16Patch;w16Patch=function(p){const B=WS.base;if(F18.off||!B||typeof B.f18Built!=='function'||B.f18Built())return p0.apply(this,arguments);
  const b0=buildMapCanvas,one=mkCv(1,1);WS.base=[B[0],mkCv(1,1)];buildMapCanvas=function(m,fr){return fr===1?one:b0.apply(this,arguments);};
  try{return p0.apply(this,arguments);}finally{buildMapCanvas=b0;if(WS.base&&WS.base[0]===B[0])WS.base=B;}};}

// ---------- 3. one way to accept and to claim ----------
// Every notice row ends in one control: Accept (plain), Claim (gold), a greyed Claim with the place to go under the text, or Active / Done.
// Before: bounties and personal quests had a gold Accept and quests and missions a plain one; bounties said Hunting, rivals Rival roaming, the
// offer popup Accepted and missions a bare 2/5 where quests said Active; a beaten bounty was "Beaten" where a quest was "Ready"; the greyed Claim
// was gold on missions, plain on quests and bounties, with the hand-in place beside the button on quests and under the text elsewhere.
const F18_WHERE=()=>typeof Q16_WHERE==='string'?Q16_WHERE:'Hand in at any Guild Hall or Notice Board.';
function f18Rows(h){if(typeof h!=='string'||F18.off)return h;try{
  h=h.replace(/class="btn sm gold" data-act="(bounty|personal|pq16Accept|facAccept)"/g,'class="btn sm" data-act="$1"').replace(/class="btn sm gold" data-act="facAccept"/g,'class="btn sm" data-act="facAccept"')
   .replace(/class="btn sm " data-act="facAccept"/g,'class="btn sm" data-act="facAccept"')
   .replace(/<span class="m">(Hunting|Rival roaming)<\/span>/g,'<span class="m">Active</span>').replace(/<span class="m up">Accepted<\/span>/g,'<span class="m">Active</span>')
   .replace(/<em class="qtag">Beaten<\/em>/g,'<em class="qtag">Ready</em>')
   // a greyed Claim is never gold and names the place under the row's text
   .replace(/(<button class="btn sm) gold(" data-act="bountyClaim" data-arg="[^"]*" disabled>)/g,'$1$2')
   .replace(/<span class="m"><button class="btn sm" disabled title="([^"]*)">Claim<\/button><small class="handwhere">[^<]*<\/small><\/span>/g,(s,w)=>`<button class="btn sm" disabled title="${w}">Claim</button>\u0001${w}\u0001`)
   .replace(/<button class="btn sm gold" disabled title="Hand in at any Guild Hall[^"]*">Claim<\/button>/g,()=>{const w=esc(F18_WHERE());return `<button class="btn sm" disabled title="${w}">Claim</button>\u0001${w}\u0001`;})
   .replace(/ Hand in at any Guild Hall(?: or Notice Board)?\.(<\/small><\/div><button class="btn sm" disabled)/g,'$1');
  // the place moves into the row's text column (the row is <div class="row ..."><...><div class="grow">...</div>BUTTON)
  if(h.indexOf('\u0001')>=0)h=h.replace(/<\/div>(<button class="btn sm" disabled title="[^"]*">Claim<\/button>)\u0001([^\u0001]*)\u0001/g,'<small class="handwhere">$2</small></div>$1');
  // a mission under way: Active, its progress stays in the text
  h=h.replace(/(<div class="row facm">[\s\S]*?<\/div>)<span class="m nums">\d+\/\d+<\/span>/g,'$1<span class="m">Active</span>');
  }catch(e){f18Err('rows',e);}return h;}
HOOK.xform('nbBody','fix18','one row language for every notice: Accept, Claim, Active, Done',function(h){return f18Rows(h);});
HOOK.xform('vModal','fix18','the personal quest offer rows in the same language',function(h,m){try{if(m&&m.type==='pqoffer')return f18Rows(h);}catch(e){}return h;});
// guild notices are listed on the Guilds tab (and in Notices), no longer a second time on the Quests tab; Accept all and Claim all on the
// Quests tab take what that tab shows
F18.ng=0;
{const mq0=m3Quests;m3Quests=function(){const L=mq0.apply(this,arguments);try{if(F18.ng&&!F18.off)return L.filter(q=>!(q&&(q.type==='guild'||q.type==='arena')));}catch(e){}return L;};}
const f18NoGuild=(f,on)=>{if(!on)return f();F18.ng++;try{return f();}finally{F18.ng--;}};
const f18QTab=()=>{try{const m=V.modal;return !!m&&m.tab==='quests';}catch(e){return false;}};
HOOK.wrap('nbBody','fix18','the Quests tab lists quests, not guild notices',function(next,tab,...a){return f18NoGuild(()=>next(tab,...a),tab==='quests');});
HOOK.wrap('nbSecs','fix18','the Quests tab counts what it lists',function(next,tab,...a){return f18NoGuild(()=>next(tab,...a),tab==='quests');});
['qAcceptAll','qClaimAll'].forEach(k=>{const a0=ACT[k];if(typeof a0!=='function')return;ACT[k]=function(){const self=this,args=arguments;return f18NoGuild(()=>a0.apply(self,args),f18QTab());};});
// a goal finished by the same press (the first quest taken pays the "Take a quest" goal) used to replace the press's own toast at once, so the
// player read "Goal done" and never saw what was accepted; the goal line now follows the press's line in the same toast
{const t0=toast;let last={m:'',t:0};toast=function(m){try{const now=Date.now();
    if(typeof m==='string'&&/^Goal done:/.test(m)&&last.m&&!/^Goal done:/.test(last.m)&&now-last.t<1200){const s=last.m;last={m:s+' '+m,t:now};return t0.call(this,s+' '+m);}
    last={m:String(m),t:now};}catch(e){}return t0.apply(this,arguments);};}

// ---------- 4. map taps on a zoomed page in older Chromium (the Windows app) ----------
// nv11Zoom() is 1 everywhere except where getBoundingClientRect and clientX disagree (Chromium < 128 with CSS zoom on <html>).
{const f0=fmTile;fmTile=function(cv,cx,cy){const k=typeof nv11Zoom==='function'?nv11Zoom():1;return f0.call(this,cv,cx/k,cy/k);};}
{const m0=mmTile;mmTile=function(cv,cx,cy){const k=typeof nv11Zoom==='function'?nv11Zoom():1;return m0.call(this,cv,cx/k,cy/k);};}
{const b0=bmTileAt;bmTileAt=function(cv,cx,cy){const k=typeof nv11Zoom==='function'?nv11Zoom():1;return b0.call(this,cv,cx/k,cy/k);};}

try{const st=document.createElement('style');st.textContent='.row .grow>.handwhere{max-width:none;text-align:left}';document.head.appendChild(st);}catch(e){}
try{window.__F18={F18,rows:f18Rows,get G(){return G;},get V(){return V;},get B(){return B;},get WS(){return WS;},fmTile:(c,x,y)=>fmTile(c,x,y),bmTileAt:(c,x,y)=>bmTileAt(c,x,y),nbKeep:(k,L,i,r)=>nbKeep(k,L,i,r)};}catch(e){}
