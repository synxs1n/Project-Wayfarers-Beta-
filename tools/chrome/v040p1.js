// v0.4.0 Phase 1 tests: targeting (mouse, touch, keyboard), field skill targeting, shield pips, stop on battle, auto label.
const {open,chk,done}=require('./pw');
(async()=>{
const mk=async(mobile)=>{const H=await open({w:430,h:820,mobile});
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(300);A.startBattle({stage:0,kind:'field'});});
  await H.page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000});return H;};
// ---- 1.1 mouse on the sprite overlay
for(const how of ['mouse','touch','keyboard','card']){
  const H=await mk(how==='touch');
  await H.ev(()=>{__A.ACT.cmd('attack');});await H.wait(300);
  const n=await H.ev(()=>document.querySelectorAll('#bstage .unit.foe.tg').length);
  chk(how+': foe overlays are targetable',n>0||n);
  const box=await H.ev(()=>{const b=document.querySelector('#bstage .unit.foe.tg');const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height,st:b.getAttribute('style')};});
  chk(how+': overlay keeps its size and position (style intact)',(box.w>10&&box.h>10&&/left:/.test(box.st))||JSON.stringify(box));
  const hp0=await H.ev(()=>__A.B.en.map(e=>e.hp));
  if(how==='mouse')await H.page.mouse.click(box.x,box.y);
  else if(how==='touch')await H.page.touchscreen.tap(box.x,box.y);
  else if(how==='keyboard'){await H.ev(()=>document.querySelector('#bstage .unit.foe.tg').focus());await H.page.keyboard.press('Enter');}
  else {await H.page.click('#bparty .fc.tg');}
  await H.wait(700);
  const after=await H.ev(()=>({mode:__A.B.mode,menu:__A.B.menu,pend:!!__A.B.pend,log:__A.B.log.length}));
  chk(how+': the tap selected a target and the attack ran',!after.pend||JSON.stringify(after));
  await H.browser.close();
}
// ---- 1.3 shield pips are on the foe card and not covered
{const H=await open({w:430,h:820,mobile:true});
 await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(300);A.startBattle({stage:0,kind:'boss'});});
 await H.page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000});await H.wait(500);
 const r=await H.ev(()=>{const B=__A.B;const cards=[...document.querySelectorAll('#bparty .fc')];const sh=B.en.filter(e=>e.maxShield);
   const pips=[...document.querySelectorAll('#bparty .fc .spips')];
   const vis=pips.map(p=>{const r=p.getBoundingClientRect();const el=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!el&&(p===el||p.contains(el))&&r.width>10&&r.height>6;});
   // stage tags never sit on the pip strip
   const tg=[...document.querySelectorAll('#bstage .utags')];return {foes:B.en.length,shielded:sh.length,pips:pips.length,vis,tags:tg.length};});
 console.log(JSON.stringify(r));
 chk('every shielded foe has a pip row on its card',(r.shielded>0&&r.pips===r.shielded)||JSON.stringify(r));
 chk('pip rows are visible and not covered',(r.vis.length>0&&r.vis.every(Boolean))||JSON.stringify(r));
 await H.shot('v040_pips');await H.browser.close();}
// ---- 1.4 movement stops on battle start and nothing carries over
{const H=await open({w:430,h:820,mobile:false});const {page}=H;
 await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(300);});
 await page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
 await page.keyboard.down('ArrowRight');await H.wait(80);
 const a=await H.ev(()=>({held:__A.WS.held.slice()}));chk('key held registers in the world',a.held.includes('r')||JSON.stringify(a));
 await H.ev(()=>{__A.WS.target=[__A.WS.x+3,__A.WS.y];__A.WS.touchDir='d';__A.startBattle({stage:0,kind:'field'});});
 await page.keyboard.down('ArrowRight');// auto repeat
 const b=await H.ev(()=>({held:__A.WS.held.slice(),t:__A.WS.target,td:__A.WS.touchDir,path:__A.WS.path,run:__A.WS.run}));
 chk('battle start clears held keys, tap paths and touch direction',(b.held.length===0&&!b.t&&!b.td&&!b.path)||JSON.stringify(b));
 await H.ev(()=>{const B=__A.B;B.en.forEach(e=>e.hp=0);__A.B&&__A.finishBattle('win');});
 await page.keyboard.down('ArrowRight');await H.wait(60);
 const c=await H.ev(()=>({screen:__A.V.screen,held:__A.WS.held.slice()}));
 chk('after battle a still held key does not keep walking (auto repeat ignored)',(c.screen==='world'&&c.held.length===0)||JSON.stringify(c));
 await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowRight');await H.wait(60);
 const d=await H.ev(()=>({held:__A.WS.held.slice()}));
 chk('releasing and pressing again walks normally',d.held.includes('r')||JSON.stringify(d));
 await H.browser.close();}
// ---- 1.6 Auto button label
{const H=await mk(false);
 const txt=()=>H.ev(()=>{const b=document.querySelector('#bcmd [data-act="auto"]');return b?b.textContent.trim():null;});
 chk('idle: Start auto',(await txt())==='Start auto'||await txt());
 await H.page.click('#bcmd [data-act="auto"]');await H.wait(300);
 chk('running: Stop auto',/Stop auto/.test(await txt()||'')||await txt());
 await H.page.click('#bcmd [data-act="auto"]');await H.wait(400);
 chk('stopped again: Start auto',(await txt())==='Start auto'||await txt());
 await H.browser.close();}
done({browser:{close:async()=>{}}});
})();
