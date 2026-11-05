// Beta v0.5.3 UI: screenshots of the restyled menus and HUD. Saved under tools/chrome/shots-v053u/ (not committed).
// Usage: PWHTML=../../out/aurelis3.html node v053ushots.js [port|land|small|fold|desk ...]
const {open,chk}=require('./pw');const fs=require('fs');const OUT=__dirname+'/shots-v053u';fs.mkdirSync(OUT,{recursive:true});
const SIZES={port:[390,844],land:[844,390],small:[360,740],fold:[933,705],desk:[1280,800]};
const want=process.argv.slice(2).length?process.argv.slice(2):['port','land'];
(async()=>{let n=0;for(const k of want){const [w,h]=SIZES[k];
  const H=await open({w,h,mobile:k!=='desk',dpr:k==='desk'?1:2,pre:`(()=>{let s=2;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'medium',rmotion:false,hints:false}}));`});
  const {ev,wait,page}=H;const shot=async s=>{await wait(450);await page.screenshot({path:`${OUT}/${k}_${s}.png`});n++;};
  await wait(500);await shot('title');
  await ev(()=>{const A=__A;A.ACT.new();A.render();});await shot('starter');
  await ev(()=>{const A=__A;['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.render();});await shot('story');
  await ev(()=>{const A=__A;A.ACT.storyOk();A.V.modal=null;A.G.clock=100;A.G.gold=2400;A.render();});await shot('world');
  for(const t of ['party','equip','items','quests','settings','roster']){await ev(t=>{const A=__A;A.V.modal={type:'menu',tab:t};A.render();},t);await shot('menu_'+t);}
  for(const s of [{type:'smithy',tab:'weapons'},{type:'inn'},{type:'workshop',tab:'shop'},{type:'guild',tab:'recruit'},{type:'tavern'},{type:'board'}]){await ev(s=>{const A=__A;A.V.modal=s;A.render();},s);await shot('shop_'+s.type);}
  await ev(()=>{const A=__A;A.V.modal=null;A.render();A.startBattle({stage:0,kind:'field',weather:'clear'});});
  await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});await wait(600);await shot('battle');
  await ev(()=>{const b=[...document.querySelectorAll('[data-act]')].find(b=>/^\s*Skills/i.test(b.textContent));if(b)b.click();});await shot('battle_skills');
  await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.win();});await wait(900);await shot('result');
  await ev(()=>{const b=document.querySelector('[data-act="resultOk"]');if(b)b.click();});await wait(400);
  await ev(()=>{const A=__A;A.V.modal=null;A.render();A.startBattle({stage:0,kind:'boss'});});
  await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});await wait(600);await shot('boss');
  await H.browser.close();}
  chk('screenshots written',n>0);process.exit(0);})();
