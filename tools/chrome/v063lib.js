// Beta v0.6.3 battle screen: shared helpers for v063b*.js tests and v063bshots.js.
// battle(H,opt): a fresh journey, opt.heroes (1..6, incl. reserves), opt.foes (1..5), opt.boss, opt.fly (flyers among the foes), then
// waits for a hero's command turn and pauses the fight. dress(H,opt): random statuses, primes, shields, limit and effect texts.
const META=(t,x)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:Object.assign({speed:1,enc:'off',music:0,sfx:0,gfx:'${t||'medium'}',hints:false},${JSON.stringify(x||{})})}));`;
async function battle(H,opt){opt=opt||{};return H.ev(async o=>{const A=__A,R=(()=>{let s=o.seed||7;return ()=>((s=Math.imul(s^s>>>15,2246822507)+0x6D2B79F5>>>0)%1e6)/1e6;})();
  A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;
  const G=A.G,extra=Object.keys(A.TPL).filter(id=>!G.party.includes(id)&&!A.TPL[id].mon&&!A.TPL[id].legend&&A.TPL[id].src);
  for(let i=0;G.party.length<(o.heroes||3)&&i<extra.length;i++){const id=extra[Math.floor(R()*extra.length)];if(!G.party.includes(id))A.recruit(id,true);}
  while(G.party.length>(o.heroes||3))G.party.pop();
  if(o.lv)G.party.forEach(id=>{const c=G.roster[id];c.lv=o.lv;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  const MK=Object.keys(A.MON).filter(k=>!A.MON[k].mimic),fl=MK.filter(k=>(A.MON[k].ty||[]).includes('flying')),gr=MK.filter(k=>!(A.MON[k].ty||[]).includes('flying'));
  let spec={stage:o.stage||0,kind:'field',weather:o.weather||'clear'};
  if(o.boss){spec={stage:o.stage||1,kind:'boss',weather:o.weather||'clear'};}
  if(o.foes&&!o.boss){const foes=[];for(let i=0;i<o.foes;i++){const pool=i<(o.fly||0)?fl:(o.big!=null?(R()<o.big?MK.filter(k=>A.BIG_ART.includes(A.MON[k].art)):gr):gr);const k=pool[Math.floor(R()*pool.length)]||gr[0];foes.push(A.makeEnemy(A.MON[k],3+Math.floor(R()*4)));}
    const cnt={};foes.forEach(e=>{cnt[e.name]=(cnt[e.name]||0)+1;});const seen={};foes.forEach(e=>{if(cnt[e.name]>1){seen[e.name]=(seen[e.name]||0)+1;e.name+=' '+String.fromCharCode(64+seen[e.name]);}});spec.foes=foes;}
  A.setPause(80);A.startBattle(spec);const B=A.B;
  if(o.boss&&o.foes){while(B.en.length<o.foes){const k=gr[Math.floor(R()*gr.length)];B.en.push(A.makeEnemy(A.MON[k],5));}while(B.en.length>o.foes&&B.en.length>1)B.en.pop();}
  B.front.concat(B.back,B.en).forEach(u=>{u.next=u.side==='p'?(u===B.front[0]?0:500):900;});
  for(let i=0;i<120&&!(B.mode==='cmd');i++)await new Promise(q=>setTimeout(q,60));
  A.setPause(99999);B.front.concat(B.back,B.en).forEach(u=>{u.enterT=0;});A.render();
  return {mode:B.mode,heroes:B.front.length+B.back.length,foes:B.en.length};},opt);}
async function dress(H,opt){return H.ev(o=>{const A=__A,B=A.B;let s=o.seed||1;const R=()=>((s=Math.imul(s^s>>>15,2246822507)+0x6D2B79F5>>>0)%1e6)/1e6;
  const ks=Object.keys(A.STS),els=['fire','ice','water','lightning','earth','wind','light','shadow'];
  B.front.concat(B.en).forEach(u=>{if(u.hp<=0)return;u.st=u.st||{};const n=Math.floor(R()*(o.maxSt??5));for(let i=0;i<n;i++)u.st[ks[Math.floor(R()*ks.length)]]={t:1+Math.floor(R()*4)};
    if(u.side==='e'&&R()<(o.prime??.5))u.primed={el:els[Math.floor(R()*els.length)],t:1+Math.floor(R()*3),by:'Mira'};
    if(u.side==='e'&&!u.maxShield&&R()<(o.shield??.3)){u.maxShield=2+Math.floor(R()*4);u.shield=Math.floor(R()*u.maxShield);}
    if(u.side==='p')u.lb=Math.floor(R()*100);
    if(o.fx){const m=Math.floor(R()*3);for(let i=0;i<m;i++)A.fx(u,['123','CRIT 88','Weak!','Burn','Melt','+45','Resist','Poison'][Math.floor(R()*8)],['dmg','dmg crit','effx up','stat bad','react','heal','effx dn','stat bad'][Math.floor(R()*8)]);}});
  if(o.ko&&B.front.length>1){const c=B.front[B.front.length-1];c.hp=0;}
  A.render();return true;},opt);}
// aim a skill: the first detonator (or any skill of a role) the current hero knows, else any one-target skill
async function aim(H,role){return H.ev(r=>{const A=__A,B=A.B,a=B.cur;if(!a||B.mode!=='cmd')return null;const ks=A.known(a);let s=ks.find(x=>r&&x.role===r)||ks.find(x=>x.t==='one');if(!s)return null;
  a.mp=Math.max(a.mp,s.mp);A.ACT.cmd('skills');A.ACT.sk(s.id);return {id:s.id,n:s.n,role:s.role,menu:B.menu};},role);}
// every stage label and sprite box, in page px (DOM labels measured, canvas labels from the layout pass scaled by the stage)
async function rects(H){return H.ev(()=>{const A=__A,L=A.b3Lay?A.b3Lay():null,st=document.getElementById('bstage').getBoundingClientRect(),sc=A.BL.sc,S=r=>({x:st.left+r.x*sc,y:st.top+r.y*sc,w:r.w*sc,h:r.h*sc});
  const out={labels:[],bodies:[],faces:[],hidden:L?L.hidden.map(h=>h.kind+':'+h.u.name):[],sc,W:A.BL.W,H:A.BL.H,legacy:!L};
  // independent sprite boxes: alpha bounds of each unit's sprite canvas (not the layout's own numbers)
  const vb=c=>{const k=c.hd||1,RW=c._rw||c.width,RH=c._rh||c.height,d=c.getContext('2d').getImageData(0,0,RW,RH).data;let l=RW,t=RH,r=-1,b=-1;for(let y=0;y<RH;y++)for(let x=0;x<RW;x++)if(d[(y*RW+x)*4+3]>40){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=y;}return {l:l/k,t:t/k,r:(r+1)/k,b:(b+1)/k};};
  A.B.en.concat(A.B.front).forEach(u=>{if(u.side==='e'&&u.hp<=0)return;const b=A.unitBox(u);if(!b)return;const c=A.spriteOf(u,false),v=vb(c),w=c.width,h=c.height;let r;
    if(u.side==='p'&&u.hp<=0){const cx=b.x-4,cy=b.y-2;r={x:cx-h+6+v.t,y:cy-w/2,w:v.b-v.t,h:w};}
    else{const dx=Math.round(b.x-w/2),dy=Math.round(b.y-h+1),hero=u.side==='p',l=hero?w-v.r:v.l,rr=hero?w-v.l:v.r;r={x:dx+l,y:dy+v.t,w:rr-l,h:v.b-v.t};}
    out.bodies.push(Object.assign(S(r),{n:u.name}));out.faces.push(Object.assign(S({x:r.x,y:r.y,w:r.w,h:r.h*.4}),{n:u.name}));});
  if(L){L.plates.forEach((o,u)=>out.labels.push(Object.assign(S(o),{k:'plate',n:u.name})));if(L.arrow)out.labels.push(Object.assign(S(L.arrow),{k:'arrow',n:L.arrow.u.name}));}
  else{// a build before v0.6.3: the canvas HUD sat at fixed offsets from each unit (battle.js unitHud, battleui.js badges), the arrow over the head
    A.B.en.concat(A.B.front).forEach(u=>{if(u.hp<=0)return;const b=A.unitBox(u);if(!b)return;const hero=u.side==='p',x=u._hud?u._hud.x:b.x,y=u._hud?u._hud.y:b.y,bw=hero?24:Math.min(40,Math.round(b.w*.66)),bx=Math.round(x-bw/2),by=y+3;
      const hh=u.maxShield?10:hero&&A.limitOpen(u)?7:4;out.labels.push(Object.assign(S({x:bx-1,y:by-1,w:Math.max(bw+2,(u.maxShield||0)*5+1),h:hh}),{k:'bar',n:u.name}));
      const n=(u.el||[]).length;if(n){const tw=n*10;let sx=bx-tw-1;if(sx<1)sx=Math.min(A.BL.W-tw-1,bx+bw+2);out.labels.push(Object.assign(S({x:sx,y:by-4,w:tw+1,h:11}),{k:'element',n:u.name}));}
      if(A.B.cur===u&&(A.B.mode==='cmd'||A.B.mode==='enemy'))out.labels.push(Object.assign(S({x:b.x-4,y:b.y-b.h-7,w:9,h:5}),{k:'arrow',n:u.name}));});
    document.querySelectorAll('#bstage .utags,#bstage .primed,#bstage .unit .ename,#bstage .unit .eff').forEach(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(!r.width||+cs.opacity===0)return;out.labels.push({x:r.left,y:r.top,w:r.width,h:r.height,k:e.className.split(' ')[0],n:e.textContent.slice(0,12)});});}
  // DOM labels: their own box (left, top, width, height as laid out; transforms of the drift and bob animations left out) plus a check that the content fits it
  document.querySelectorAll('#bstage .b3l, #bstage .fx2').forEach(e=>{const s=e.style;let r={x:parseFloat(s.left),y:parseFloat(s.top),w:parseFloat(s.width),h:parseFloat(s.height)};
    if(!(r.w>0)){if(L)return;const q=e.getBoundingClientRect();if(!q.width)return;out.labels.push({x:q.left,y:q.top,w:q.width,h:q.height,k:'fx2',n:e.textContent.slice(0,12)});return;}
    out.labels.push(Object.assign(S(r),{k:e.className.split(' ').slice(0,2).join('.'),n:e.textContent.slice(0,12),over:e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+2}));});
  ['bbossbar','border'].forEach(id=>{const e=document.getElementById(id);if(!e)return;const r=e.getBoundingClientRect();if(r.width&&r.height)out.labels.push({x:r.left,y:r.top,w:r.width,h:r.height,k:id,n:''});});
  return out;});}
function overlaps(R,tol){tol=tol==null?.5:tol;const hit=(a,b)=>a.x<b.x+b.w-tol&&a.x+a.w-tol>b.x&&a.y<b.y+b.h-tol&&a.y+a.h-tol>b.y,bad=[];
  for(let i=0;i<R.labels.length;i++){const a=R.labels[i];if(a.over)bad.push('overflow '+a.k);
    for(let j=i+1;j<R.labels.length;j++){const b=R.labels[j];if(hit(a,b))bad.push(`${a.k}(${a.n}) x ${b.k}(${b.n})`);}
    if(a.k==='bbossbar'||a.k==='border')continue;
    R.bodies.forEach(b=>{if(hit(a,b))bad.push(`${a.k}(${a.n}) on sprite ${b.n}`);});}
  return bad;}
module.exports={META,battle,dress,aim,rects,overlaps};
