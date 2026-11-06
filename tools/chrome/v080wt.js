// v0.8.0 title: six wayfarers on the road through the realms.
//  1. at every listed window size (Windows app desktop sizes and phones), all six heroes are drawn, each whole inside the visible scene
//     and the viewport, never under the menu, the wordmark or the Beta label; v0.8.9: drawn as the overworld walker on the world's own
//     sprite grid (HD2D.spr.sc, like the HD-2D world) at a whole number of device pixels per texel, about an eighth of the scene high
//  2. they walk: walk frames alternate and the bodies bob; the ground scrolls
//  3. the background travels to another realm over time (cross fade), and keeps cycling
//  4. Low graphics and reduced motion: one still frame
//  5. the emblem (the app icon's compass crest) stands beside the wordmark, whole, clear of the heroes, the menu and the wordmark
//  6. cost: the frame time on Medium stays low (headless Chromium, software canvas), no page errors
// Run from tools/chrome: PWHTML=../../out/aurelis3.html node v080wt.js
const {open,chk,done}=require('./pw');
const SZ=[[800,600,0],[1024,768,0],[1280,720,0],[1920,1080,0],[390,844,1],[844,390,1],[933,705,1]];
const inter=(a,b)=>a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1;
const state=H=>H.ev(()=>{const T=__A.T7,r=e=>{const b=e.getBoundingClientRect();return {left:b.left,top:b.top,right:b.right,bottom:b.bottom};};
  const menu=[...document.querySelectorAll('.t7side .btn,.t7side summary,.t7side details,.tmenu')].filter(e=>e.offsetParent).map(e=>({t:(e.textContent||'').trim().slice(0,16),...r(e)}));
  const lg=document.querySelector('.t7wm svg'),bt=document.querySelector('.t7beta'),em=document.querySelector('.t7crest svg');
  return {n:T.drawn.length,drawn:T.drawn,bodies:T.bodies||[],stage:T.stageR,menu,logo:lg?r(lg):null,crest:em?Object.assign(r(em),{polys:em.querySelectorAll('polygon').length}):null,beta:bt?r(bt):null,iw:innerWidth,ih:innerHeight,realm:T.realm,rN:T.rN,frames:T.frames,fms:T.fms,still:T.still,k:T.k};});
const hash=H=>H.ev(()=>{const c=document.getElementById('t7cv'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=101)h=(h*31+d[i])>>>0;return h;});
(async()=>{
  for(const [w,h,m] of SZ){const H=await open({w,h,mobile:!!m,dpr:m?2:1});const tag=`${w}x${h}`;await H.wait(1800);
    for(const save of [false,true]){if(save){await H.ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.saveGame();A.META.cfg.hints=false;A.V.screen='title';A.G=null;A.V.modal=null;A.render();});await H.wait(1200);}
      const s=await state(H),t2=tag+(save?' with a save':'');
      chk(`${t2}: six heroes drawn`,s.n===6||s.n);
      const S=s.stage,vis={left:Math.max(0,S.left),top:Math.max(0,S.top),right:Math.min(s.iw,S.right),bottom:Math.min(s.ih,S.bottom)};
      const out=s.bodies.filter(b=>b.left<vis.left-.5||b.top<vis.top-.5||b.right>vis.right+.5||b.bottom>vis.bottom+.5);
      chk(`${t2}: every hero whole inside the visible scene (scene ${Math.round(S.right-S.left)}x${Math.round(S.bottom-S.top)}, scale ${s.k})`,s.bodies.length===6&&out.length===0||JSON.stringify({out:out.slice(0,2),vis}));
      const hits=[];s.bodies.forEach(b=>{s.menu.forEach(mm=>{if(inter(b,mm))hits.push(mm.t+' over '+b.id);});[['logo',s.logo],['beta',s.beta]].forEach(([n,q])=>{if(q&&inter(b,q))hits.push(n+' over '+b.id);});});
      const E=s.crest;chk(`${t2}: the emblem (crest) is on the title beside the wordmark, fully visible (${E?Math.round(E.right-E.left)+' px':'missing'})`,!!E&&E.polys>8&&E.right-E.left>=40&&E.left>=vis.left-.5&&E.top>=vis.top-.5&&E.right<=vis.right+.5&&E.bottom<=vis.bottom+.5&&!s.bodies.some(b=>inter(b,E))&&!s.menu.some(m=>inter(m,E))&&!(s.logo&&inter(s.logo,E))||JSON.stringify({E,vis}));
      chk(`${t2}: no hero under the menu, the wordmark or the Beta label`,hits.length===0||hits.slice(0,3).join(' | '));
      const bad=s.drawn.filter(d=>!(d.wsc>0&&d.rw===Math.max(2,Math.round(d.lw*d.wsc/2)*2)&&Number.isInteger(d.k)&&d.k>=1&&d.w===d.rw*d.k&&d.h===d.rh*d.k));
      chk(`${t2}: heroes drawn as the overworld sprite (world grid, ${s.drawn[0]&&s.drawn[0].rw+'x'+s.drawn[0].rh} texels) at a whole number of pixels per texel (${s.k})`,bad.length===0||JSON.stringify(bad[0]));
      const sh=S.bottom-S.top,hf=s.bodies.map(b=>(b.bottom-b.top)/sh),hmax=Math.max(...hf);
      chk(`${t2}: heroes sized like the overworld, about an eighth of the scene high (tallest ${(hmax*100).toFixed(1)} % of ${Math.round(sh)} px)`,hmax>=.075&&hmax<=.19||hmax.toFixed(3));
      const ov=[];for(let i=0;i<s.bodies.length;i++)for(let j=i+1;j<s.bodies.length;j++){const a=s.bodies[i],b=s.bodies[j],ox=Math.min(a.right,b.right)-Math.max(a.left,b.left);if(ox>4&&inter(a,b))ov.push(a.id+'/'+b.id+' '+Math.round(ox));}
      chk(`${t2}: no hero hides another (body boxes overlap by at most a few px)`,ov.length===0||ov.join(', '));}
    if(w===1280){// walking, bobbing, travelling, realm changes
      const a=await state(H);await H.wait(330);const b=await state(H);
      const moved=a.drawn.filter((d,i)=>b.drawn[i]&&(b.drawn[i].y!==d.y||b.drawn[i].x!==d.x)).length;
      chk(`1280x720: the party walks (bob or step changed for ${moved} of 6 heroes in 330 ms)`,moved>=2||moved);
      const h0=await hash(H);await H.wait(400);const h1=await hash(H);chk('1280x720: the scene moves (scrolling ground, weather)',h0!==h1||'same');
      await H.ev(()=>{const T=__A.T7;T.cfg.every=[1500,1500];T.cfg.fade=600;T.rT=performance.now()-1400;T.rDur=1500;});const r0=await state(H);await H.wait(2600);const r1=await state(H);await H.wait(2200);const r2=await state(H);
      chk(`1280x720: the background travels to other realms (${r0.realm} > ${r1.realm} > ${r2.realm}, ${r2.rN} changes)`,r1.realm!==r0.realm&&r2.realm!==r1.realm&&r2.rN>=2||JSON.stringify([r0.realm,r1.realm,r2.realm,r2.rN]));
      chk(`1280x720: six heroes through the realm change`,r1.n===6&&r2.n===6||[r1.n,r2.n]);
      await H.ev(()=>{const T=__A.T7;T.cfg.every=[8000,12000];T.cfg.fade=1800;});await H.wait(1500);
      const f=await state(H);chk(`1280x720 medium: a frame costs ${f.fms.toFixed(2)} ms on average (budget 2 ms)`,f.fms<2||f.fms.toFixed(2));}
    if(w===390){// Low and reduced motion hold still
      await H.ev(()=>{const A=__A;A.META.cfg.gfx='low';A.gfxApply();});await H.wait(500);const l=await state(H),lh=await hash(H);await H.wait(900);const l2=await state(H),lh2=await hash(H);
      chk('low: one still frame, no redraws',l.still===true&&l2.frames===l.frames&&lh===lh2||JSON.stringify({still:l.still,f:[l.frames,l2.frames],same:lh===lh2}));
      chk('low: six heroes, still on screen',l.n===6||l.n);
      await H.ev(()=>{const A=__A;A.META.cfg.gfx='medium';A.META.cfg.rmotion=true;A.gfxApply();});await H.wait(500);const r0=await state(H);await H.wait(900);const r1=await state(H);
      chk('reduced motion: still',r1.frames===r0.frames&&r0.still||r1.frames-r0.frames);
      await H.ev(()=>{__A.META.cfg.rmotion=false;});}
    await H.browser.close();}
  await done({browser:{close:async()=>{}}});})();
