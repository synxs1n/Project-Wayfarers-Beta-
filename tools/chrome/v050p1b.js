// Beta v0.5.0 1.2: the world view keeps its size through battle end, results, level ups and return to the map, at every phone shape and after rotating.
const {open,chk,done}=require('./pw');
const SIZES=[['16:9',800,450],['19.5:9',844,390],['21:9',960,411],['portrait',390,844]];
const meas=()=>{const cv=__A.WS.cv;if(!cv)return null;const r=cv.getBoundingClientRect(),ww=document.querySelector('.world');
  return {w:Math.round(r.width),h:Math.round(r.height),vw:__A.WS.vw,vh:__A.WS.vh,sc:__A.WS.scale,land:!!(ww&&ww.classList.contains('land')),docW:document.documentElement.scrollWidth,iw:innerWidth,ih:innerHeight,bot:Math.round(r.bottom)};};
const battle=async(H,lvUp)=>{const {ev,wait}=H;
  await ev(lv=>{const A=__A;A.V.modal=null;A.startBattle({stage:0,kind:'field'});},lvUp);await wait(700);
  await ev(lv=>{const A=__A;if(lv)A.B.front.forEach(c=>c.xp=(c.xp||0)+99999);A.B.en.forEach(e=>e.hp=0);A.win();},lvUp);await wait(700);
  const res=await ev(()=>({modal:__A.V.modal&&__A.V.modal.type,screen:__A.V.screen}));
  await ev(()=>{const b=document.querySelector('[data-act="resultOk"]');if(b)b.click();});await wait(400);
  await ev(()=>{for(let i=0;i<6&&__A.V.modal;i++){const b=document.querySelector('[data-act="closeModal"],[data-act="resultOk"],[data-act="lvOk"]');if(b)b.click();else __A.V.modal=null;}__A.render();});await wait(600);
  return res;};
(async()=>{for(const [name,w,h] of SIZES){
  const H=await open({w,h,mobile:true});const {ev,wait,page}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(600);
  const m0=await ev(meas);
  await battle(H,false);const m1=await ev(meas);
  chk(`${name}: world view same size after a won battle (${m0.w}x${m0.h} -> ${m1.w}x${m1.h})`,m0.w===m1.w&&m0.h===m1.h&&m0.sc===m1.sc||JSON.stringify([m0,m1]));
  await battle(H,true);const m2=await ev(meas);
  chk(`${name}: same size after a battle with level ups`,m0.w===m2.w&&m0.h===m2.h||JSON.stringify([m0,m2]));
  chk(`${name}: view fits the screen`,m2.docW<=m2.iw+1&&m2.bot<=m2.ih+1||JSON.stringify(m2));
  // rotate mid session: in battle, then back after it ends
  await ev(()=>{__A.V.modal=null;__A.startBattle({stage:0,kind:'field'});});await wait(500);
  await ev(()=>window.scrollTo(0,9999));
  await page.setViewportSize({width:h,height:w});await wait(500);
  await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.win();});await wait(500);
  await ev(()=>{for(let i=0;i<6&&__A.V.modal;i++){const b=document.querySelector('[data-act="resultOk"],[data-act="closeModal"]');if(b)b.click();else __A.V.modal=null;}__A.render();});await wait(500);
  await page.setViewportSize({width:w,height:h});await wait(600);
  const m3=await ev(meas);const sy=await ev(()=>scrollY);
  chk(`${name}: page scroll reset on return to the map`,sy===0||sy);
  chk(`${name}: same size after rotating during a battle and back`,m0.w===m3.w&&m0.h===m3.h&&m0.land===m3.land||JSON.stringify([m0,m3]));
  await H.browser.close();}
const H=await open({});await done(H);})();
