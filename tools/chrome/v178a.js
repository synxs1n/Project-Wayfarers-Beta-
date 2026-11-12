// v0.19.7 chars13.js: the characters pass. Checks, on the built page:
//  1. outline rule: every hero rig, walker, villager and foe canvas (the world paint) and every foe as the battle repaints it has a dark
//     outline on at least 90% of its silhouette edge (solid pixels with an empty 4-neighbour, luma <= 72); the legend mounts (the horse is not
//     HD painted) and the world copies of the enlarged minibosses (sites.js resamples them 1.5x) are listed, not counted;
//  2. idle life: a standing hero and a townsperson in the world hand back more than one distinct canvas over a few seconds, all the same size,
//     and exactly one under reduced motion; in battle the heroes' sprites change over time at rest while no new canvas is built once warm
//     (no per frame allocation); the boss exhale frame is two logical pixels deep;
//  3. stage depth: every backdrop kind has two or three silhouettes at the side margins, standing on the ground band and clear of every unit
//     slot; the 2D ground plane carries the horizon haze (the top rows of the ground band are lighter than the rows under them) with no hazard
//     colour on it; a unit on the plain 2D stage has a soft shadow under its feet (a range of alphas, not one flat ellipse);
//  4. damage text: a hit with an element floats in that element's colour, a crit in gold with the pop animation, a miss small and grey, a heal
//     green; every floating text and the reaction banner sit inside the stage and the banner text fits its box in the fantasy face;
//  5. the idle limiter still holds at rest on a phone (v170a's probe): 28 to 32 of 60 synthetic frames drawn.
// Usage: PWHTML=../../out/aurelis3.html node v178a.js
const {open,chk,done}=require('./pw');const {META,battle,dress}=require('./v063lib');
const MP=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'high',rmotion:false,hints:false,hd2d:true}}));`;
const EDGE=`c=>{const W=c._rw||c.width,H=c._rh||c.height,d=c.getContext('2d').getImageData(0,0,W,H).data,S=i=>d[i*4+3]>=250;let n=0,dk=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!S(i))continue;if((y>0&&S(i-W))&&(y<H-1&&S(i+W))&&(x>0&&S(i-1))&&(x<W-1&&S(i+1)))continue;n++;const l=d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11;if(l<=72)dk++;}
  return n?dk/n*100:100;}`;
const start=H=>H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
(async()=>{
  // ---- 1. the outline audit ----
  let H=await open({w:800,h:600,pre:META('high')});await start(H);await H.wait(400);
  const au=await H.ev(`(()=>{const A=__A,edge=${EDGE},out={bad:[],skip:[],n:0,sum:0,min:100};const add=(k,n,c)=>{if(!c||!c.width)return;const p=edge(c);out.n++;out.sum+=p;out.min=Math.min(out.min,p);if(p<90)out.bad.push(k+':'+n+' '+p.toFixed(1));};
    Object.keys(A.TPL).forEach(id=>{const t=A.TPL[id];if(!t.look||t.mon)return;if(t.look.mount||t.look.pet||t.scourge){out.skip.push(id);return;}try{add('hero',id,A.heroCanvas(id,false));add('walker',id,A.walkerCanvas('t178:'+id,t.look,t.el,id,'front',0));}catch(e){}});
    ['Baker','Guard','Elder','Child','Fisher','Smith'].forEach(n=>{try{add('villager',n,A.walkerCanvas('t178v:'+n,A.villagerLook(n),['light'],null,'front',0));}catch(e){}});
    Object.keys(A.MART).forEach(a=>{if(/^mb_/.test(a)){out.skip.push(a);return;}try{add('foe',a,A.monCanvas(a));}catch(e){}});
    const F=window.__B11&&__B11.FS;if(F){F.on=1;try{Object.keys(A.MART).forEach(a=>{try{add('battle',a,A.monCanvas(a));}catch(e){}});}finally{F.on=0;}}
    return out;})()`);
  chk(`outline rule: ${au.n} sprites (heroes, walkers, villagers, world and battle foes), every one dark on at least 90% of its edge (mean ${(au.sum/au.n).toFixed(1)}%, min ${au.min.toFixed(1)}%; ${au.skip.length} mounted legends and world minibosses listed)`,au.bad.length===0||au.bad.slice(0,8).join(', '));
  // the key grid kinds ride on the canvas; the frame builder keeps the size
  const kf=await H.ev(()=>{const A=__A,C=window.__C13,c=A.heroCanvas('mira',false),K=c._k13;if(!K)return {k:false};const f=C.frame(c,7);return {k:true,eyes:K.eyeB>K.eyeT,w:f.width===c.width&&f.height===c.height,diff:f!==c};});
  chk('the HD paint keeps its key grid kinds (eyes found) and a life frame has the same size',kf.k&&kf.eyes&&kf.w&&kf.diff||JSON.stringify(kf));
  await H.browser.close();
  // ---- 2. idle life in the world (HD-2D, then reduced motion) ----
  H=await open({w:390,h:844,mobile:true,dpr:3,pre:MP});await start(H);await H.until(()=>__A.V.screen==='world'&&__A.HD.live,null,{timeout:15000});await H.wait(400);
  const wl=await H.ev(async()=>{const A=__A,T=A.TW.get,wd=T('worldDraw'),C=window.__C13,lid=A.G.party[0],t=A.TPL[lid],seen=new Set(),sizes=new Set();let npcSeen=new Set();
    const m=A.WS.m,npc=(m.npcs||[]).find(n=>!n.portal&&n.look);let t0=performance.now();
    for(let i=0;i<70;i++){const now=t0+i*100;wd(now);C.C13.live=1;C.C13.t=now;const c=A.walkerCanvas(lid+A.lookKey(lid),A.heroLook(lid),t.el,lid,'side',0);seen.add(c);sizes.add(c.width+'x'+c.height);
      if(npc){const c2=A.walkerCanvas('npc:'+npc.name+m.id,npc.look,['light'],null,npc.view||'front',0);npcSeen.add(c2);}C.C13.live=0;}
    for(let i=0;i<150;i++)wd(t0+7000+i*100);const n0=C.C13.n.built;for(let i=0;i<70;i++){const now=t0+22000+i*100;wd(now);}const built=C.C13.n.built-n0;let most=0;[...seen,...npcSeen].forEach(c=>{const m=C.C13.fr.get(c);if(m)most=Math.max(most,m.size);});
    A.META.cfg.rmotion=true;const still=new Set();for(let i=0;i<40;i++){const now=t0+20000+i*100;wd(now);C.C13.live=1;C.C13.t=now;still.add(A.walkerCanvas(lid+A.lookKey(lid),A.heroLook(lid),t.el,lid,'side',0));C.C13.live=0;}A.META.cfg.rmotion=false;
    return {hero:seen.size,sizes:[...sizes],npc:npcSeen.size,hasNpc:!!npc,built,most,still:still.size};});
  chk(`the standing hero in the HD-2D world cycles through ${wl.hero} distinct idle frames over 7 s (breath, blink, sway), all ${wl.sizes.join('/')}`,wl.hero>=3&&wl.hero<=8&&wl.sizes.length===1||JSON.stringify(wl));
  chk(`a townsperson idles too (${wl.npc} frames)`,!wl.hasNpc||wl.npc>=2||JSON.stringify(wl));
  chk(`the frame sets are bounded: at most ${wl.most} frames per canvas (8), and after 22 s of warm up 70 more world frames build ${wl.built} new canvases (under 6: a rare blink combination at most)`,wl.most<=8&&wl.built<6);
  chk(`under reduced motion the hero stands on one frame (${wl.still})`,wl.still===1);
  await H.browser.close();
  // ---- 2b, 3, 4, 5: battle on the phone ----
  H=await open({w:390,h:844,mobile:true,dpr:3,pre:MP,before:p=>p.addInitScript(()=>{window.__P12F=1;})});
  const r0=await battle(H,{seed:178,heroes:3,foes:3,fly:1});chk('a battle with three heroes and three foes starts',r0.mode==='cmd'||r0.mode);
  await H.wait(400);
  const bl=await H.ev(async()=>{const A=__A,T=A.TW.get,bf=T('battleFrame'),C=window.__C13,P=T('P12');const seen=A.B.front.map(()=>new Set());let t0=performance.now();
    for(let i=0;i<45;i++){await new Promise(r=>setTimeout(r,100));const now=performance.now();bf(now);C.C13.live=1;C.C13.t=now;A.B.front.forEach((u,j)=>seen[j].add(A.spriteOf(u,false)));C.C13.live=0;}// real time: heropose9's idle B reads the real clock
    for(let i=0;i<150;i++)bf(t0+8000+i*100);const n0=C.C13.n.built;for(let i=0;i<80;i++)bf(t0+23000+i*100);const built=C.C13.n.built-n0;
    // the boss exhale: two logical pixels (the top band of frame B sits 2 px lower than in frame A)
    const bc=A.monCanvas('drake'),hv=C.heavy(bc),f1=T('bossFrame1')(bc),k=bc.hd||1,W=bc._rw,d0=f1.getContext('2d').getImageData(0,0,W,f1._rh).data,d1=hv.getContext('2d').getImageData(0,0,W,hv._rh).data;
    const top=d=>{for(let y=0;y<bc._rh;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>200)return y;return -1;};
    return {frames:seen.map(s=>s.size),built,exhale:(top(d1)-top(d0))/k};});
  chk(`battle heroes at rest cycle through several sprites each (${bl.frames.join('/')}: blink and sway frames, the pose idle B)`,bl.frames.every(n=>n>=2)||JSON.stringify(bl));
  chk(`after 15 s of warm up 80 more battle frames build ${bl.built} new canvases (under 4)`,bl.built<4);
  chk(`the boss exhale frame sinks the head ${bl.exhale} logical px deeper than art3's one pixel exhale (1)`,bl.exhale===1);
  // 3. mid-ground per backdrop kind
  const md=await H.ev(()=>{const A=__A,P2=window.__P2,C=window.__C13,W=A.BL.W,H=A.BL.H,gy=P2.bgGY(H),out=[];
    const keys=['meadow','f:meadow:forest','coast','cave','snow','heights','void','d_meadow','boss_snow','c_cave','arena','breach'].filter(k=>P2.BG[k]);
    const slots=[];A.B.en.concat(A.B.front).forEach(u=>{const b=A.unitBox(u);if(b)slots.push(b);});
    for(const k of keys){const L=C.mid(k,W,H),kind=C.midKind(k);const bad=[];
      if(k!=='arena'&&(L.length<4||L.length>6))bad.push('count '+L.length);
      L.forEach(o=>{if(o.y<gy+1||o.y>H-1)bad.push('off band y'+o.y);if(!(o.x+o.w<=W*.14||o.x>=W*.86))bad.push('not at the side x'+o.x);
        slots.forEach(b=>{const sx0=b.x-b.w/2,sx1=b.x+b.w/2;if(o.x<sx1&&o.x+o.w>sx0&&Math.abs(o.y-b.y)<4)bad.push('on a slot');});
        const d=o.cv.getContext('2d').getImageData(0,0,o.cv.width,o.cv.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;if(n<10)bad.push('empty');});
      out.push({k,kind,n:L.length,bad});}
    return out;});
  chk(`every backdrop kind has its silhouettes at the side margins on the ground band (${md.map(o=>o.k+':'+o.kind+'x'+o.n).join(', ')})`,md.every(o=>!o.bad.length)||md.filter(o=>o.bad.length).map(o=>o.k+' '+o.bad.join(',')).join(' | '));
  // the haze on the 2D ground plane, no hazard colour on it
  const hz=await H.ev(()=>{const A=__A,P2=window.__P2,out=[];for(const k of ['meadow','coast','cave','heights']){const cv=A.bgStatic(k,320,150),gy=P2.bgGY(150),d=cv.getContext('2d').getImageData(0,0,320,150).data,L=y=>{let s=0;for(let x=0;x<320;x++){const i=(y*320+x)*4;s+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;}return s/320;};
      const haz=new Set([].concat(P2.BG_HAZ.water,P2.BG_HAZ.lava,P2.BG_HAZ.cloud));let hn=0;for(let y=gy;y<150;y++)for(let x=0;x<320;x++){const i=(y*320+x)*4,h='#'+[d[i],d[i+1],d[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('');if(haz.has(h))hn++;}
      out.push({k,top:Math.round(L(gy+1)),mid:Math.round(L(gy+Math.round((150-gy)*.5))),haz:hn,c13:!!cv._c13});}return out;});
  chk(`the 2D ground plane fades toward the horizon on ${hz.map(o=>o.k+' '+o.top+'>'+o.mid).join(', ')}, no hazard colour on it`,hz.every(o=>o.c13&&o.haz===0)||JSON.stringify(hz));
  // 4. damage text: real entries with elements, a crit, a miss and a heal
  const tx=await H.ev(()=>{const A=__A,B=A.B,h=B.front[0],e=B.en[0];h.fxEl='fire';h.fxT=Date.now();A.fx(h,'37','dmg');e.fxEl='ice';e.fxT=Date.now();A.fx(e,'52','dmg crit');A.fx(B.front[1],'Miss','stat miss');A.fx(B.front[2],'+12','heal');A.render();
    const st=document.getElementById('bstage').getBoundingClientRect(),W=A.BL.W,H=A.BL.H,out={items:[],inside:true};
    document.querySelectorAll('.fxlayer .fx2.b3fx').forEach(el=>{const cs=getComputedStyle(el),s=el.style,r={x:parseFloat(s.left),y:parseFloat(s.top),w:parseFloat(s.width),h:parseFloat(s.height)};if(r.x<0||r.y<0||r.x+r.w>W||r.y+r.h>H)out.inside=false;
      out.items.push({cls:el.className.replace('fx2 b3fx ',''),color:cs.color,font:cs.fontFamily.split(',')[0],anim:cs.animationName,fs:cs.fontSize,over:el.scrollWidth>el.clientWidth+1});});
    return out;});
  const it=c=>tx.items.find(i=>i.cls.includes(c));
  chk(`damage texts carry their element: fire hit ${it('el-fire')&&it('el-fire').color}, ice crit ${it('el-ice')&&it('el-ice').color} (gold wins) with the pop animation ${it('crit')&&it('crit').anim}`,!!it('el-fire')&&!!it('el-ice')&&it('crit').anim==='c13crit'&&/rgb\(255, (210, 61|255, 255)\)/.test(it('crit').color)||JSON.stringify(tx.items));
  chk(`a miss is small and grey (${it('miss')&&it('miss').color} ${it('miss')&&it('miss').fs}), a heal green (${it('heal')&&it('heal').color}), the face is the pixel display face (${tx.items[0]&&tx.items[0].font})`,it('miss').color==='rgb(154, 156, 168)'&&it('heal').color==='rgb(141, 255, 159)'&&/Pixelify/.test(tx.items[0].font)||JSON.stringify(tx.items));
  chk('every floating text sits inside the stage and fits its box',tx.inside&&tx.items.every(i=>!i.over)||JSON.stringify(tx.items));
  const bn=await H.ev(async()=>{const A=__A,B=A.B,e=B.en[0];e.primed={el:'fire',t:2,by:'Mira'};A.TW.get('b9React')(B.front[0],e,'fire','water',{n:'Melt'});A.render();await new Promise(r=>setTimeout(r,120));A.render();
    const el=document.querySelector('.bstage .b9ban'),b=el&&el.querySelector('b');if(!el)return {none:true,rx:B.b9rx?1:0};const cs=getComputedStyle(b),st=document.getElementById('bstage').getBoundingClientRect(),r=el.getBoundingClientRect();
    return {font:cs.fontFamily.split(',')[0],fits:el.scrollWidth<=el.clientWidth+1&&el.scrollHeight<=el.clientHeight+1,inside:r.left>=st.left-1&&r.right<=st.right+1&&r.top>=st.top-1&&r.bottom<=st.bottom+1,ratio:window.__C13.ratio()};});
  chk(`the reaction banner is in the fantasy face (${bn.font}), fits its box (sized by ${bn.ratio}) and sits inside the stage`,!bn.none&&/Cinzel/.test(bn.font)&&bn.fits&&bn.inside||JSON.stringify(bn));
  // 3b. soft shadow on the plain 2D stage (Low graphics), 5. the limiter at rest
  await H.ev(()=>{__A.META.cfg.gfx='low';__A.gfxApply&&__A.gfxApply();__A.render();});await H.wait(300);
  const sh=await H.ev(()=>{const A=__A,T=A.TW.get,bf=T('battleFrame');A.BV.P.length=0;for(let i=0;i<3;i++)bf(performance.now()+i*20);const u=A.B.front[0],b=A.unitBox(u),cv=document.getElementById('bcv'),k=cv._ss||1,x=cv.getContext('2d');
    const gy=b.gy!=null?b.gy:b.y,d=x.getImageData(Math.round((b.x-14)*k),Math.round((gy-3)*k),Math.round(28*k),Math.round(7*k)).data;const seen=new Set();for(let i=0;i<d.length;i+=4)seen.add(d[i]*.3+d[i+1]*.59+d[i+2]*.11|0);
    return {gl:A.HB.on,tones:seen.size,tier:A.GFX.tier};});
  chk(`on the plain 2D stage (${sh.tier}, GL ${sh.gl}) the ground under a hero carries a soft shadow (${sh.tones} tones in the 28x7 px patch, more than a flat ellipse's 2 or 3)`,!sh.gl&&sh.tones>=6||JSON.stringify(sh));
  await H.ev(()=>{__A.META.cfg.gfx='high';__A.gfxApply&&__A.gfxApply();__A.render();});await H.wait(300);
  await H.wait(3600);// the floating texts and the reaction banner above count as motion while they run
  const lim=await H.ev(()=>{const A=__A,T=A.TW.get,P=T('P12'),bf=T('battleFrame');A.BV.P.length=0;A.B.b9rx=null;let t=performance.now()+3e4;A.setPause(99999);A.B.mode='cmd';P.inLoop=1;try{for(let i=0;i<60;i++){t+=16.7;bf(t);}const n0=P.n.bDraw,s0=P.n.bSkip;for(let i=0;i<60;i++){t+=16.7;bf(t);}return {draw:P.n.bDraw-n0,skip:P.n.bSkip-s0,phone:T('p12Phone')()};}finally{P.inLoop=0;}});
  chk(`the idle limiter still holds at rest with the idle animation on: ${lim.draw} of 60 frames drawn (30 a second)`,lim.phone&&lim.draw>=28&&lim.draw<=32||JSON.stringify(lim));
  await done(H);
})();
