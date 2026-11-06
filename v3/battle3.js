// ===== battle3.js (v0.6.3): battle screen pass: stage labels, plates, the canvas HUD (unitHud), effect text placement =====
// 1) One layout pass for every label on the battle stage (b3Lay): HP plates (HP, limit, shield pips and element badges, drawn on the
//    canvas by unitHud), primed badges, the turn arrow, status rows, target tags (name, effectiveness, reaction) and the floating effect
//    texts. Each label is placed on a free spot near its unit: never over any unit's visible sprite (real alpha bounds of the sprite
//    canvas, HD bitmaps included) and never over another label; when a spot cannot be found it falls back to a compact shape, then to
//    the card (hidden on the stage, listed in L.hidden).
// 2) The encounter flash and fades of the HD-2D world overlay are drawn at the canvas's backing scale (they used to cover a quarter).
// 3) Detonator targeting: foes a detonator will set off glow in the reaction colour with a "✸ Melt" tag and both element icons; the
//    skill list names them; the reaction floats over the detonated foe as a styled effect text.
// 4) The battle screen layout (markup in ui.js / battleui.js, styles in battle3.css).

// ----- 2) the encounter flash: the HD-2D overlay reset the transform to identity on a 2x canvas -----
// While hdOverlay or hdBlit runs, setTransform(a..f) on the world canvas is scaled by the canvas's backing scale k (hdOverlay calls hdBlit,
// so only the outermost call installs and removes the scaled version).
{const wrapK=f=>function(){const cv=WS.cv,ctx=WS.ctx,k=cv&&cv._ss||1;if(k===1||!ctx||ctx._b3k)return f.apply(this,arguments);
  const P=CanvasRenderingContext2D.prototype.setTransform;ctx._b3k=k;ctx.setTransform=function(a,b,c,d,e,g){if(arguments.length===6)return P.call(this,a*k,b*k,c*k,d*k,e*k,g*k);return P.apply(this,arguments);};
  try{return f.apply(this,arguments);}finally{delete ctx.setTransform;ctx._b3k=0;}};
  if(typeof hdOverlay==='function')hdOverlay=wrapK(hdOverlay);if(typeof hdBlit==='function')hdBlit=wrapK(hdBlit);}

// ----- 1) sprite bounds -----
// the visible (alpha) bounds of a sprite canvas in its logical pixels; HD canvases hold a k times larger bitmap
function sprVB(c){if(!c)return null;if(c._vb)return c._vb;const k=c.hd||1,RW=c._rw||c.width,RH=c._rh||c.height;let l=RW,t=RH,r=-1,b=-1;
  try{const d=c.getContext('2d').getImageData(0,0,RW,RH).data;
    for(let y=0;y<RH;y++){const o=y*RW*4;for(let x=0;x<RW;x++)if(d[o+x*4+3]>40){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;b=y;}}}
  catch(e){return {l:0,t:0,r:c.width,b:c.height};}
  const v=r<0?{l:0,t:0,r:0,b:0,empty:1}:{l:l/k,t:t/k,r:(r+1)/k,b:(b+1)/k};try{c._vb=v;}catch(e){}return v;}
// where a unit's sprite is on the stage (static pose: no lunge, hit or entrance offsets), logical px
function b3Body(u,b){b=b||unitBox(u);if(!b)return null;const c=spriteOf(u,false);if(!c)return null;const v=sprVB(c),w=c.width,h=c.height,m=B3.body;
  if(u.side==='p'&&u.hp<=0){// knocked out heroes lie on their side (drawUnit rotates the sprite a quarter turn)
    const cx=b.x-4,cy=b.y-2;return {x:cx-h+6+v.t-m,y:cy-w/2-m,w:(v.b-v.t)+2*m,h:w+2*m};}
  const dx=Math.round(b.x-w/2),dy=Math.round(b.y-h+1),hero=u.side==='p',l=hero?w-v.r:v.l,r=hero?w-v.l:v.r,bob=b.hov?2:0;
  return {x:dx+l-m,y:dy+v.t-m-bob,w:r-l+2*m,h:v.b-v.t+2*m+2*bob};}
// face: the top 40% of the visible body (used by the tests and to weigh fallbacks)
function b3Face(bd){return bd?{x:bd.x,y:bd.y,w:bd.w,h:Math.max(6,bd.h*.4)}:null;}
const b3Hit=(a,q,p)=>a.x<q.x+q.w+p&&a.x+a.w+p>q.x&&a.y<q.y+q.h+p&&a.y+a.h+p>q.y;
// candidate offsets around an anchor, nearest first (cost: distance, sideways moves a little cheaper than vertical ones)
const B3OFF=(()=>{const L=[],R=B3.R,s=B3.step;for(let dy=-R;dy<=R;dy+=s)for(let dx=-R;dx<=R;dx+=s){const d=Math.abs(dx)+Math.abs(dy)*1.25;if(d<=R*1.3)L.push([dx,dy,d]);}L.sort((a,b)=>a[2]-b[2]);return L;})();
// try anchors [{x,y,c}] (c = extra cost) in order of total cost; first free rect of size w x h wins
function b3Find(w,h,anchors,obs,W,H,R){R=R||B3.R;const K=anchors.length,ix=new Array(K).fill(0),pad=B3.pad;
  for(let guard=0;guard<B3OFF.length*K;guard++){let bk=-1,bc=1e9;for(let k=0;k<K;k++){const o=B3OFF[ix[k]];if(!o)continue;const c=anchors[k].c+o[2];if(c<bc){bc=c;bk=k;}}
    if(bk<0)return null;const o=B3OFF[ix[bk]++],a=anchors[bk];if(o[2]>R*1.3)continue;
    const r={x:Math.round(a.x+o[0]),y:Math.round(a.y+o[1]),w,h};if(r.x<1||r.y<1||r.x+w>W-1||r.y+h>H-1)continue;
    let ok=true;for(let i=0;i<obs.length;i++){const q=obs[i];if(b3Hit(r,q,q.body?0:pad)){ok=false;break;}}if(ok)return r;}
  return null;}
// ----- label sizes (logical px; battle3.css gives the DOM labels exactly these boxes) -----
function b3PlateGeo(u,b){const hero=u.side==='p',n=(u.el||[]).length,bw=hero?B3.barW.hero:Math.min(B3.barW.foe,Math.max(18,Math.round(b.w*.66))),lim=hero&&limitOpen(u),ms=u.maxShield||0;
  const bkW=Math.max(bw+2,ms?ms*5+1:0),bkH=4+(lim?3:0)+(ms?6:0),tw=n?n*10+1:0;
  return {bw,lim,ms,n,bkW,bkH,tw,row:{w:tw+(n?1:0)+bkW,h:Math.max(n?11:0,bkH)},col:{w:Math.max(tw,bkW),h:(n?12:0)+bkH}};}
let B3MC=null;const B3TW={};
function b3TextW(t,px,wt){const k=wt+'|'+px+'|'+t;if(B3TW[k])return B3TW[k];if(!B3MC)B3MC=document.createElement('canvas').getContext('2d');
  B3MC.font=`${wt} ${px*10}px Nunito, system-ui, sans-serif`;const w=B3MC.measureText(String(t)).width/10;return B3TW[k]=w;}
// the target tag shown on a unit while a skill or item is aimed: name, effectiveness and the reaction a detonator sets off
function b3TagInfo(u){const pend=B&&B.mode==='cmd'&&B.menu==='target'&&B.pend;if(!pend||!targetable(u))return null;const sk=pend.sk,out={name:b3Short(u.name)+(u.elite?' ★':''),eff:'',rx:null,px:false,html:''};
  if(u.side==='e'&&sk){out.eff=effBadge(sk,u,B.cur);const els=skEls(sk);
    if(sk.role==='det'&&u.primed&&els.length){const el=els.find(x=>reactFor(u.primed.el,x));const R=el&&reactFor(u.primed.el,el);if(R)out.rx={n:R.n,p:R.p,d:el};}
    else if(sk.role==='primer'&&!u.primed&&els.length)out.px=els[0];}
  return out;}
function b3TagSize(T){const f=B3.tagF,w1=b3TextW(T.name,f,800)+4;let w2=0;const lab=(T.eff.match(/>([A-Za-z?]+)/)||[])[1]||'';if(lab)w2+=b3TextW(lab,f*.92,800)+5;if(T.rx)w2+=b3TextW('✸ '+T.rx.n,f*.92,900)+5+2*(f+1);if(T.px)w2+=b3TextW('⟐',f*.92,800)+f+6;
  const lines=w2?2:1;return {w:Math.ceil(Math.max(w1,w2)*1.08+3),h:Math.ceil(lines*(f*1.25)+2)};}
// ----- the pass -----
const B3L={key:'',L:null};
function b3Units(){if(!B)return [];return B.en.map(u=>({u,b:unitBox(u)})).concat(B.front.map(u=>({u,b:unitBox(u)}))).filter(o=>o.b&&(o.u.hp>0||o.u.side==='p'));}
function b3Key(units){let k=BL.W+'x'+BL.H+'|'+(B.id||0)+'|'+(B.wave||0)+'|'+B.mode+B.menu+(B.pend?(B.pend.sk?B.pend.sk.id:B.pend.item||'s'):'')+'|'+(B.cur&&B.cur.hp>0?unitRef(B.cur):'')+'|'+(B.weather||'');
  for(const {u,b} of units)k+='|'+u.side+(u.hp>0?1:0)+b.x+','+b.y+(b.hov?'h':'')+(u.el||[]).join('')+(u.maxShield||0)+(u.side==='p'&&limitOpen(u)?'L':'')+(u.primed&&u.hp>0?u.primed.el+u.primed.t:'')+':'+(u.hp>0?b3StN(u):0)+(u.broken?'b':'')+(u.art||u.id||'');
  return k;}
// the canvas asks every frame (once per unit): within B3.memo ms the last layout is reused without rebuilding the key; the DOM render
// (b3StageHtml) always checks the key, so a new turn, target mode or status is laid out at once
function b3Lay(fresh){if(!B)return null;const now=performance.now();if(!fresh&&B3L.L&&B3L.bid===B.id&&now-B3L.t<B3.memo)return B3L.L;
  const units=b3Units(),key=b3Key(units);B3L.t=now;B3L.bid=B.id;if(B3L.key===key&&B3L.L)return B3L.L;
  const W=BL.W,H=BL.H,obs=[],L={W,H,bodies:[],plates:new Map(),prim:new Map(),tags:new Map(),tgt:new Map(),arrow:null,hidden:[],all:[]};
  units.forEach(({u,b})=>{const bd=b3Body(u,b);if(bd){bd.body=1;bd.u=u;obs.push(bd);L.bodies.push({u,r:bd,face:b3Face(bd),b});}});
  const live=units.filter(o=>o.u.hp>0).sort((a,b)=>b.b.y-a.b.y);
  const add=(kind,u,r,extra)=>{const o=Object.assign({kind,u,x:r.x,y:r.y,w:r.w,h:r.h},extra||{});obs.push(o);L.all.push(o);return o;};
  const bodyOf=(u,b)=>{const o=L.bodies.find(q=>q.u===u);return o?o.r:{x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h};};
  // depth on the ground band: units at the back carry their labels over the head (open sky), units in front under the feet
  const G0=BATTLE_GROUND,depth=b=>clamp(((b.gy!=null?b.gy:b.y)/H-G0.top)/Math.max(.01,G0.bot-G0.top),0,1);
  // anchors around a unit: under the feet, over the head, beside the body (toward the middle of the stage first)
  const anch=(u,b,w,h,pref)=>{const bd=bodyOf(u,b),cx=Math.round(b.x-w/2),foot=Math.max(b.y,bd.y+bd.h)+1,top=bd.y-h-1,mid=Math.round(bd.y+Math.max(0,bd.h*.3-h/2)),inL=u.side==='p';
    const A={below:{x:cx,y:foot},above:{x:cx,y:top},inner:{x:inL?bd.x-w-1:bd.x+bd.w+1,y:mid},outer:{x:inL?bd.x+bd.w+1:bd.x-w-1,y:mid}};return pref.map(([k,c])=>Object.assign({},A[k],{c:c||0}));};
  const prefOf=b=>depth(b)<.45?[['above',0],['below',4],['inner',8],['outer',10]]:[['below',0],['above',4],['inner',8],['outer',10]];
  // next to a placed box, on the side away from the unit's body (stacking outward), then the other sides
  const nextTo=(p,bd,w,h,c0)=>{const up=p.y+p.h<=bd.y+2,cx=Math.round(p.x+p.w/2-w/2);return [{x:cx,y:up?p.y-h-1:p.y+p.h+1,c:c0},{x:p.x+p.w+1,y:Math.round(p.y+p.h/2-h/2),c:c0+1},{x:p.x-w-1,y:Math.round(p.y+p.h/2-h/2),c:c0+1},{x:cx,y:up?p.y+p.h+1:p.y-h-1,c:c0+6}];};
  // HP plates first (they matter most and stay put while statuses come and go): a row (badges left of the bars), else a column
  for(const {u,b} of live){const g=b3PlateGeo(u,b);let r=null,shape='row';
    for(const sh of ['row','col']){const s=g[sh];r=b3Find(s.w,s.h,anch(u,b,s.w,s.h,prefOf(b)),obs,W,H);if(r){shape=sh;break;}}
    if(r)L.plates.set(u,add('plate',u,r,{g,shape}));else L.hidden.push({kind:'plate',u});}
  // primed badges (B3.prim square with the turns left), beside the plate
  for(const {u,b} of live){if(!(u.primed&&EL[u.primed.el]))continue;const s=B3.prim,p=L.plates.get(u),bd=bodyOf(u,b);
    const A=(p?[{x:p.x-s-1,y:Math.round(p.y+p.h/2-s/2),c:0},{x:p.x+p.w+1,y:Math.round(p.y+p.h/2-s/2),c:.5}]:[]).concat(anch(u,b,s,s,prefOf(b)).map(a=>Object.assign(a,{c:a.c+3})));
    const r=b3Find(s,s,A,obs,W,H);if(r)L.prim.set(u,add('prim',u,r));else L.hidden.push({kind:'prim',u});}
  // the turn arrow over whoever acts now (over the head, or over the plate when the plate is up there)
  if(B.cur&&B.cur.hp>0&&(B.mode==='cmd'||B.mode==='enemy')){const o=live.find(q=>q.u===B.cur);if(o){const p=L.plates.get(o.u),bd=bodyOf(o.u,o.b);
    const A=anch(o.u,o.b,9,6,[['above',0],['inner',6],['outer',8],['below',10]]);if(p&&p.y<bd.y)A.unshift({x:Math.round(o.b.x-4.5),y:p.y-7,c:0});
    const r=b3Find(9,6,A,obs,W,H);if(r)L.arrow=add('arrow',o.u,r);else L.hidden.push({kind:'arrow',u:o.u});}}
  // status rows: up to 4 icons, then 2 + "+N", then a lone "+N"; stacked on the outer side of the plate
  for(const {u,b} of live){const n=stItems(u,{noPrime:true,noWx:true}).length;if(!n)continue;let r=null,m=0;const p=L.plates.get(u),bd=bodyOf(u,b);
    for(const mx of n>4?[4,2,1]:n>2?[n,2,1]:[n,1]){const w=mx*(B3.sti+1)-1,h=B3.stiH,A=(p?nextTo(p,bd,w,h,0):[]).concat(anch(u,b,w,h,prefOf(b)).map(a=>Object.assign(a,{c:a.c+4})));
      r=b3Find(w,h,A,obs,W,H);if(r){m=mx;break;}}
    if(r)L.tags.set(u,add('tags',u,r,{max:m})),L.tags.get(u).n=n;else L.hidden.push({kind:'tags',u});}
  // target tags while aiming (name, effectiveness, reaction): over the head first, they are what the player reads right now
  for(const {u,b} of live){const T=b3TagInfo(u);if(!T)continue;const s=b3TagSize(T),bd=bodyOf(u,b);const A=anch(u,b,s.w,s.h,[['above',0],['inner',4],['outer',5],['below',6]]);
    let r=b3Find(s.w,s.h,A,obs,W,H,B3.tagR);
    if(!r&&(T.eff||T.rx||T.px)){const s2=b3TagSize(Object.assign({},T,{name:''}));r=b3Find(s2.w,s2.h,anch(u,b,s2.w,s2.h,[['above',0],['inner',4],['outer',5],['below',6]]),obs,W,H,B3.tagR);if(r)T.short=1;}
    if(!r)r=b3Find(s.w,s.h,A,obs,W,H);
    if(r)L.tgt.set(u,add('tgt',u,r,{T}));else L.hidden.push({kind:'tgt',u});}
  L.obs=obs;B3L.key=key;B3L.L=L;return L;}

// ----- the canvas HUD at the laid out spot: bars, limit, shield pips, element badges -----
function unitHud(ctx,u,b,now){if(!u||u.hp<=0)return;const L=b3Lay(),p=L&&L.plates.get(u);if(!p)return;const g=p.g,hero=u.side==='p';
  u._dh=u._dh==null?u.hp:u._dh+(u.hp-u._dh)*Math.min(1,.18);if(Math.abs(u._dh-u.hp)<.5)u._dh=u.hp;
  u._lag=u._lag==null?u.hp:(u._lag>u._dh?Math.max(u._dh,u._lag-u.S.mhp*.006):u._dh);
  let ix,iy,bx,by;if(p.shape==='row'){ix=p.x;iy=p.y+Math.round((p.h-(g.n?11:0))/2);bx=p.x+g.tw+(g.n?1:0)+1;by=p.y+Math.round((p.h-g.bkH)/2)+1;}
  else{ix=p.x+Math.round((p.w-g.tw)/2);iy=p.y;bx=p.x+Math.round((p.w-g.bkW)/2)+1;by=p.y+(g.n?12:0)+1;}
  const bw=g.bw;ctx.fillStyle='#150b17';ctx.fillRect(bx-1,by-1,bw+2,4);ctx.fillStyle='#3a2a3a';ctx.fillRect(bx,by,bw,2);
  ctx.fillStyle='#ffffff';ctx.fillRect(bx,by,Math.round(bw*u._lag/u.S.mhp),2);
  const pct=u._dh/u.S.mhp;ctx.fillStyle=hero?(pct<.25?'#e8504a':pct<.5?'#f2c93a':'#5ad06a'):'#e8504a';ctx.fillRect(bx,by,Math.round(bw*pct),2);
  if(g.lim){const lp=(u.lb||0)/100;ctx.fillStyle='#150b17';ctx.fillRect(bx-1,by+3,bw+2,3);ctx.fillStyle=lp>=1?(Math.floor(now/150)%2?'#c79bff':'#f1e4ff'):'#8a4be0';ctx.fillRect(bx,by+4,Math.round(bw*lp),1);}
  if(g.ms){const py=by+4+(g.lim?3:0);for(let i=0;i<g.ms;i++){const px=bx-1+i*5;ctx.fillStyle='#150b17';ctx.fillRect(px,py,4,4);ctx.fillStyle=u.broken?'#5a3a3a':i<u.shield?'#ffd04a':'#4a4a5a';ctx.fillRect(px+1,py+1,2,2);}}
  // v0.5.3: alpha 254 marks HUD pixels, so the GL stage (High) leaves them unlit and out of the bloom
  if(BV.glFull){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=1/255;ctx.fillRect(bx-1,by-1,g.bkW,g.bkH);ctx.restore();}
  (u.el||[]).forEach((el,i)=>ctx.drawImage(elShapeCv(el),ix+i*10,iy));
  u._plate={ix,iy,bx,by};}
// the turn arrow (battleFrame calls this instead of drawing over the head)
function b3Arrow(ctx,now){const L=b3Lay(),a=L&&L.arrow;if(!a)return;const x=a.x+4,y=a.y+Math.round(Math.sin(now/140)*.5);
  ctx.fillStyle='#150b17';ctx.fillRect(x-4,y,9,5);ctx.fillStyle=a.u.side==='p'?'#ffd04a':'#ff6a6a';ctx.fillRect(x-3,y+1,7,1);ctx.fillRect(x-2,y+2,5,1);ctx.fillRect(x-1,y+3,3,1);}

// ----- DOM labels on the stage (status rows, primed badges, target tags) -----
function b3StageHtml(){const L=b3Lay(true);if(!L)return '';const out=[],px=v=>v+'px';
  L.tags.forEach((o,u)=>{out.push(`<div class="utags b3l ${u.side}" style="left:${px(o.x)};top:${px(o.y)};width:${px(o.w)};height:${px(o.h)}">${stButtons(u,{max:o.max,noPrime:true,noWx:true})}</div>`);});
  L.prim.forEach((o,u)=>{out.push(`<span class="primed pmin b3l" style="--c:${ELC[u.primed.el]};left:${px(o.x)};top:${px(o.y)};width:${px(o.w)};height:${px(o.h)}" aria-label="Primed with ${EL[u.primed.el]}, ${u.primed.t} turn${u.primed.t===1?'':'s'} left">${ico(u.primed.el)}<i>${u.primed.t}</i></span>`);});
  L.tgt.forEach((o,u)=>{const T=o.T,lab=(T.eff.match(/>([A-Za-z?]+)/)||[])[1]||'',cls=(T.eff.match(/class="eff ([a-z]+)/)||[])[1]||'';
    const l2=(lab?`<span class="eff ${cls}">${lab}</span>`:'')+(T.rx?`<span class="eff rx">${ico(T.rx.p)}${ico(T.rx.d)}✸ ${esc(T.rx.n)}</span>`:'')+(T.px?`<span class="eff px" title="Primes it with ${esc(EL[T.px]||'')}">⟐${ico(T.px)}</span>`:''),tk=b3TagKey(T),kf=B3TK[tk];
    out.push(`<div class="b3tg b3l ${u.side} ${T.rx?'det':''}" data-tk="${esc(tk)}" style="left:${px(o.x)};top:${px(o.y)};width:${px(o.w)};height:${px(o.h)};--f:${(B3.tagF*(kf||1)).toFixed(2)}px">${T.short?'':`<b class="ename">${esc(T.name)}</b>`}${l2?`<span class="l2">${l2}</span>`:''}</div>`);});
  return out.join('');}

// ----- floating effect texts, placed through the same pass -----
function b3FxRects(now){if(!B)return [];const L=b3Lay();if(!L)return [];let top=1;try{const bn=B.banner;if(bn&&now-bn.t<banDur(bn)*1000)top=Math.ceil(26/(BL.sc||2));}catch(e){}
  const W=BL.W,H=BL.H,base=fxSize(),obs=L.obs.slice(),out=[];if(top>1)obs.push({x:0,y:0,w:W,h:top,body:1});
  B.en.concat(B.front).forEach(u=>{if(!u||!u.fx||!u.fx.length)return;const b=unitBox(u);if(!b)return;
    const live=u.fx.filter(f=>now-f.t<(fxDur(f)*1000+IMPACT+FX_STAG*6));if(!live.length)return;
    const used=new Set(live.filter(f=>f.slot!=null).map(f=>f.slot));live.forEach(f=>{if(f.slot==null){let s=0;while(used.has(s))s++;f.slot=s;used.add(s);f.stg=Math.min(s,5)*FX_STAG;}});
    live.sort((a,b)=>a.slot-b.slot);const bd=(L.bodies.find(q=>q.u===u)||{}).r||{x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h};
    live.forEach(f=>{const rx=f.cls==='react',fs=base*fxScale(f),tw=(rx?b3TextW('✸ '+f.txt,fs,900)+2*(fs+1)+6:b3TextW(f.txt,fs,900)+3+(/crit/.test(f.cls)?fs*.45:0))*1.1+2,w=Math.ceil(tw),h=Math.ceil(fs*1.45+(rx?2:0))+B3.fxRise;
      // over the head, over (or under) the unit's own plate when that sits there, beside the body, under the feet; near first, then wider
      const A=[{x:b.x-w/2,y:bd.y-h-1,c:0},{x:bd.x+bd.w+1,y:bd.y,c:5},{x:bd.x-w-1,y:bd.y,c:5},{x:b.x-w/2,y:Math.max(b.y,bd.y+bd.h)+1,c:8}],p=L.plates.get(u);
      if(p)A.push({x:p.x+p.w/2-w/2,y:p.y<bd.y?p.y-h-1:p.y+p.h+1,c:1});
      const r=b3Find(w,h,A,obs,W,H,B3.R*.7)||b3Find(w,h,A,obs,W,H,B3.R*1.6);if(!r){f._hid=1;return;}f._hid=0;obs.push({x:r.x,y:r.y,w:r.w,h:r.h,f});out.push({u,f,r,fs});});});
  return out;}

// ----- 3) detonators -----
// which live foes a detonator sets off, and the reaction on each
function detTargets(sk){if(!B||!sk||sk.role!=='det')return [];const els=skEls(sk);return B.en.filter(e=>e.hp>0&&e.primed).map(e=>{const el=els.find(x=>reactFor(e.primed.el,x));const R=el&&reactFor(e.primed.el,el);return R?{e,R,p:e.primed.el,d:el}:null;}).filter(Boolean);}
// the reaction text floats with both element icons: note them on the effect entry when the reaction fires
{const dr0=doReaction;doReaction=function(a,t,el){const p=t&&t.primed&&t.primed.el,R=dr0.apply(this,arguments);try{if(R&&t&&t.fx){for(let i=t.fx.length-1;i>=0;i--){const f=t.fx[i];if(f.cls==='react'&&f.txt===R.n){f.rp=p;f.rd=el;break;}}}}catch(e){}return R;};}
// in the skill list: every foe this detonator sets off right now, with the reaction and both element icons (else what it reacts with)
function detList(s){if(!s||s.role!=='det'||!B)return '';const L=detTargets(s);if(!L.length)return detNote(s);
  // v0.7.7: symbols only: the primed element on each foe it sets off now (the reaction and foe names stay in the tooltip)
  return `<span class="detl sym" aria-label="Detonates">${L.map(o=>`<span class="detf" style="--c:${ELC[o.d]||'#ffd04a'}" title="${esc(o.R.n)} on ${esc(o.e.name)}">✸ ${ico(o.p)}</span>`).join('')}</span>`;}
// on the stage, while a detonator is aimed: the colour a foe it sets off glows in (the detonating element), else null
function detGlow(u){try{if(!B||u.side!=='e'||!(B.mode==='cmd'&&B.menu==='target'&&B.pend&&B.pend.sk))return null;const o=detTargets(B.pend.sk).find(q=>q.e===u);return o?(ELC[o.d]||'#ffd04a'):null;}catch(e){return null;}}
// the save message keeps clear of the stage labels too (it already avoids the units and bars)
if(typeof p5Avoid==='function'){const pa0=p5Avoid;p5Avoid=function(){const r=pa0.apply(this,arguments);try{if(V.screen==='battle'&&B&&B3L.L){const st=document.getElementById('bstage');if(st){const R=st.getBoundingClientRect(),k=BL.sc||2;
  B3L.L.all.forEach(o=>r.push({left:R.left+o.x*k,top:R.top+o.y*k,right:R.left+(o.x+o.w)*k,bottom:R.top+(o.y+o.h)*k,width:o.w*k,height:o.h*k}));}}}catch(e){}return r;};}

// ----- 4) the screen layout -----
// height the stage must leave for the boss bar and the log ticker (plus the grid gaps), for layoutBattle and fitBattle
function b3Extra(mode){let h=0;try{const bb=document.getElementById('bbossbar'),bl=document.getElementById('bline');if(bb&&bb.offsetHeight)h+=bb.offsetHeight+6;if(bl)h+=bl.offsetHeight+6;h+=6;}catch(e){}return h;}
// sky chips in the order bar: icon and name in their own spans (the name hides on narrow screens; the chip keeps its title)
{const bs0=battleSkyTags;battleSkyTags=function(){const h=bs0.apply(this,arguments);try{return String(h).replace(/(<button class="wchip[^>]*>)([^ <]+) ([^<]+)<\/button>/g,'$1<span class="wxi">$2</span><span class="wxn">$3</span></button>');}catch(e){return h;}};}
// does the stage show this unit's statuses (kind 'tags', every icon, none folded into "+N") or its primed badge ('prim')?
function b3OnStage(u,kind){try{const L=B3L.L;if(!L||!B||L.W!==BL.W||L.H!==BL.H)return false;if(kind==='prim')return L.prim.has(u);
  const n=stItems(u,{noPrime:true,noWx:true}).length;if(!n)return true;const o=L.tags.get(u);return !!o&&o.max>=n;}catch(e){return false;}}
// names on target tags: at most B3.tagN letters (whole words where they fit, else cut with an ellipsis)
function b3Short(n){n=String(n);const M=B3.tagN;if(n.length<=M)return n;const w=n.split(' ');let o='';for(const p of w){if((o?o+' ':'').length+p.length>M)break;o=(o?o+' ':'')+p;}o=o.replace(/ (the|of|a|an|and)$/i,'');return o&&o.length>=5?o:n.slice(0,M-1)+'…';}
// portrait: what must fit under the stage without scrolling (the party cards and the commands; foes and the rearguard may scroll)
function b3Below(){try{const h=document.querySelector('.battle .pgroup.heroes'),c=document.getElementById('bcmd');return (h?h.offsetHeight+6:0)+(c?c.offsetHeight:0);}catch(e){return 0;}}
// how many stage status icons a unit has (same count as stItems with noPrime and noWx, without building the markup)
function b3StN(u){let n=u.broken&&u.maxShield?1:0;for(const k in u.st||{})if(STS[k])n++;return n;}

// ----- 5) Beta v0.7.6: the wide layout fits the viewport -----
// what the two columns under the stage need (commands + foes on the left, Vanguard + Rearguard on the right), in CSS px. The commands count
// at their tallest top-level height seen in this battle (a sub menu scrolls inside its panel instead, so the stage does not jump), and the
// whole need only grows within a battle (the stage only shrinks, a few times at most).
function b3WideNeed(bat){try{const cmd=document.getElementById('bcmd'),foes=bat.querySelector('.bbottom .pgroup.foes'),pty=bat.querySelector('.bbottom .b3pty'),bb=bat.querySelector('.bbottom');
  if(!cmd||!bb)return 0;const gap=parseFloat(getComputedStyle(bb).rowGap)||5,full=e=>e?Math.max(e.offsetHeight,e.scrollHeight+(e.offsetHeight-e.clientHeight)):0;
  let ch=full(cmd);const root=B&&!B.over&&(B.menu==='root'||B.mode!=='cmd')&&!B.swapAsk;
  if(B){if(root)B._b3cmd=Math.max(B._b3cmd||0,ch);else ch=B._b3cmd||Math.min(ch,230);}
  const fc=foes&&foes.querySelector('.fcs'),fh=foes?foes.offsetHeight+(fc?fc.scrollHeight-fc.clientHeight:0):0,n=Math.max(ch+(foes?gap+fh:0),full(pty));
  if(B){B._b3need=Math.max(B._b3need||0,n);return B._b3need;}return n;}catch(e){return 0;}}
function b3DocTop(e){return e.getBoundingClientRect().top+(window.scrollY||0);}
// the stage scale: as large as the width allows, small enough that the columns fit under it (never below B3.wideMin)
function b3WideSc(w,vh,wrap,bat){try{const cs=getComputedStyle(bat),gap=parseFloat(cs.rowGap)||5,bl=document.getElementById('bline'),padB=parseFloat(getComputedStyle(document.body).paddingBottom)||0;
  const below=gap+(bl?bl.offsetHeight:40)+gap,Hs=vh-b3DocTop(wrap)-below-b3WideNeed(bat)-padB-2,st=B3.wideStep||.05;
  let sc=Math.min((w-8)/WIDE_W,(Hs-8)/WIDE_H,3);sc=Math.floor(sc/st+1e-6)*st;return Math.max(B3.wideMin||1.35,Math.round(sc*100)/100);}catch(e){return B3.minSc;}}
// the height left for the columns (their panels scroll inside themselves past it, the page never does)
function b3WideBot(wrap,bat){try{const bb=bat.querySelector('.bbottom');if(!bb)return;const vh=window.visualViewport?window.visualViewport.height:window.innerHeight,padB=parseFloat(getComputedStyle(document.body).paddingBottom)||0;
  bat.style.setProperty('--b3bot',Math.max(140,Math.floor(vh-b3DocTop(bb)-padB-1))+'px');}catch(e){}}
// a card status row that does not fit its line wraps to a second one (wide layout)
function b3TagFit(){try{document.querySelectorAll('.battle.b3 .bparty .pcw.hastags>.ptags').forEach(t=>{if(t.scrollWidth>t.clientWidth+1)t.parentNode.classList.add('tagwrap');});}catch(e){}}
// v0.7.6: a target tag's text always fits its laid out box. The box comes from the layout pass (measured with the canvas font); where the
// device draws the text wider (its own font or text scaling), the tag's font shrinks once to fit (remembered per text, so it does not flicker).
const B3TK={};
function b3TagKey(T){return [T.short?'':T.name,T.eff,T.rx?T.rx.n:'',T.px||''].join('|');}
function b3FitTags(){try{const st=document.getElementById('bstage');if(!st)return;st.querySelectorAll('.b3tg[data-tk]').forEach(t=>{const tk=t.dataset.tk;
  for(let it=0;it<3;it++){const R=t.getBoundingClientRect();if(!R.width)return;let w=0,h=0;[...t.children].forEach(c=>{const q=c.getBoundingClientRect();w=Math.max(w,q.width);h+=q.height;});
    const k=Math.min((R.width-1.2*(R.width/t.offsetWidth))/w,(R.height-.6*(R.height/t.offsetHeight))/h);if(!(k<1))break;
    const f=(B3TK[tk]||1)*k*.97;B3TK[tk]=Math.max(.45,f);t.style.setProperty('--f',(B3.tagF*B3TK[tk]).toFixed(2)+'px');}});}catch(e){}}
{const rb=renderBattle;renderBattle=function(){const r=rb.apply(this,arguments);if(B&&B.menu==='target')b3FitTags();return r;};}
