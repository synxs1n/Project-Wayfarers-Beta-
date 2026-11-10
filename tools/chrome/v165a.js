// v0.18.5 zoomfix11.js: on a zoomed computer page (1920x1080 -> zoom 4/3) <html data-dz> carries --lvh/--lvw in layout px, the world
// frame fills the window with no dark bars (clientWidth, not rect/zoom), the world and battle screens never scroll the page, a tall
// menu box stays inside the window, dzRectK is 1 when rects are unzoomed (Chromium before 128, emulated) and the zoom otherwise; vault
// quests leave Next goals once the game is won. Run from tools/chrome: PWHTML=../../out/aurelis3.html node v165a.js
const {open,chk,done}=require('./pw');
const LEG=async page=>{await page.addInitScript(()=>{const o=Element.prototype.getBoundingClientRect;window.__legacy=false;Element.prototype.getBoundingClientRect=function(){const r=o.call(this),z=parseFloat(document.documentElement.style.zoom)||1;return window.__legacy&&z!==1?new DOMRect(r.x/z,r.y/z,r.width/z,r.height/z):r;};});};
const start=H=>H.det(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.META.cfg.gfx='low';A.META.cfg.hints=false;A.V.modal=null;A.TW.get('applyCfg')();A.render();},[],5);
const page=H=>H.ev(()=>{const d=document.documentElement,st=getComputedStyle(d),cv=__A.WS.cv,app=document.getElementById('app');
  return {z:d.style.zoom,dz:d.getAttribute('data-dz'),lvh:parseFloat(st.getPropertyValue('--lvh')),lvw:parseFloat(st.getPropertyValue('--lvw')),lock:d.classList.contains('dzlock'),
    cvW:cv?parseFloat(cv.style.width):0,frame:cv?cv.parentElement.clientWidth:0,appW:app.clientWidth,bodyS:document.documentElement.scrollHeight,bodyC:document.documentElement.clientHeight,iw:innerWidth,ih:innerHeight,rk:__A.TW.get('dzRectK')()};});
(async()=>{
  const H=await open({w:1920,h:1080,before:LEG});await start(H);await H.until(()=>__A.WS.vw>0&&__A.V.screen==='world',null,{timeout:15000});await H.frames(4);
  let r=await page(H);const z=parseFloat(r.z)||1;
  chk(`1920x1080 zooms the page (zoom ${r.z}) and marks <html data-dz> with --lvh ${r.lvh} (${(r.ih/z/100).toFixed(2)}) --lvw ${r.lvw}`,z>1.3&&r.dz==='1'&&Math.abs(r.lvh-r.ih/z/100)<.05&&Math.abs(r.lvw-r.iw/z/100)<.05);
  chk(`world frame fills the window: #app ${r.appW} of ${Math.round(r.iw/z)} layout px, canvas ${r.cvW} in a ${r.frame} frame`,r.appW>=r.iw/z-40&&r.cvW>=r.frame-12);
  chk(`world screen does not scroll the page (${r.bodyS} <= ${r.bodyC}, lock ${r.lock})`,r.lock&&r.bodyS<=r.bodyC+1);
  chk(`dzRectK is the zoom on this Chromium (${r.rk})`,Math.abs(r.rk-z)<.01);
  // legacy rects (Chromium before 128): the canvas still fills, dzRectK is 1
  await H.ev(()=>{window.__legacy=true;__A.TW.get('DZ').k=null;__A.TW.get('worldSizeCanvas')();});await H.frames(2);r=await page(H);
  chk(`legacy rects: canvas ${r.cvW} still fills the ${r.frame} frame, dzRectK ${r.rk}`,r.cvW>=r.frame-12&&r.rk===1);
  await H.ev(()=>{window.__legacy=false;__A.TW.get('DZ').k=null;});
  // a tall menu stays inside the window and scrolls itself
  await H.ev(()=>{__A.V.modal={type:'menu',tab:'settings'};__A.render();});await H.frames(3);
  let m=await H.ev(()=>{const b=document.querySelector('.modal .box');if(!b)return null;const z=parseFloat(document.documentElement.style.zoom)||1,mh=getComputedStyle(b).maxHeight;return {h:b.offsetHeight,mh,vh:innerHeight/z,sc:b.scrollHeight,bodyS:document.documentElement.scrollHeight,bodyC:document.documentElement.clientHeight};});
  chk(`settings box ${m&&m.h}px (max ${m&&m.mh}) fits the ${m&&Math.round(m.vh)}px layout window and scrolls inside (content ${m&&m.sc}); page ${m&&m.bodyS}<=${m&&m.bodyC}`,!!m&&m.h<=m.vh&&m.sc>=m.h&&m.bodyS<=m.bodyC+1);
  await H.ev(()=>{__A.V.modal=null;__A.render();});
  // battle: no page scroll, side column inside the window
  await H.ev(()=>{__A.TW.get('startBattle')({stage:0,kind:'field'});});await H.frames(8);
  const b=await H.ev(()=>{const z=parseFloat(document.documentElement.style.zoom)||1,bb=document.querySelector('.battle .bbottom'),d=document.documentElement;return {screen:__A.V.screen,lock:d.classList.contains('dzlock'),bodyS:d.scrollHeight,bodyC:d.clientHeight,bb:bb?bb.offsetHeight:0,vh:innerHeight/z,appH:document.getElementById('app').offsetHeight};});
  chk(`battle (${b.screen}) does not scroll the page (${b.bodyS} <= ${b.bodyC}, app ${b.appH} in ${Math.round(b.vh)}, column ${b.bb})`,b.screen==='battle'&&b.lock&&b.bodyS<=b.bodyC+1&&b.appH<=b.vh+1&&b.bb<=b.vh);
  // goals: a sealed vault quest leaves Next goals after the win
  const g=await H.ev(()=>{const A=__A,G=A.G,q=A.TW.get('qgList');G.quests=(G.quests||[]).filter(x=>x.type!=='vault');G.quests.push({id:'vt',stage:0,type:'vault',state:'active',title:'The barred hoard',desc:'',reward:{gold:1}});
    G.won=0;const before=q().some(x=>x.id==='vt');G.won=1;const after=q().some(x=>x.id==='vt');G.vaults={0:1};const ready=q().some(x=>x.id==='vt');G.won=0;delete G.vaults;return {before,after,ready};});
  chk(`sealed vault quest in Next goals before the win (${g.before}), gone after it (${g.after}), back when opened and ready to hand in (${g.ready})`,g.before&&!g.after&&g.ready);
  // 1000x600 (no zoom): nothing set
  const H2=await open({w:1000,h:600});await start(H2);await H2.frames(3);const n=await H2.ev(()=>{const d=document.documentElement;return {dz:d.getAttribute('data-dz'),lvh:d.style.getPropertyValue('--lvh'),rk:__A.TW.get('dzRectK')()};});
  chk(`unzoomed 1000x600 window: no data-dz (${n.dz}), no --lvh ('${n.lvh}'), dzRectK ${n.rk}`,!n.dz&&!n.lvh&&n.rk===1);
  await H2.browser.close();done(H);
})().catch(e=>{console.error(e);process.exit(1);});
