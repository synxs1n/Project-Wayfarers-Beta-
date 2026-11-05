// Beta v0.6.0: title menu (Continue first with a save, grouped tools, no update popup), clean type (no pixel font in the UI),
// battle targeting without a box (targetable foes glow), screenshots for review.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true,dpr:2});const {ev,wait,page}=H;
await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.saveGame();});await wait(300);
await ev(()=>{__A.V.screen='title';__A.G=null;__A.V.modal=null;__A.render();});await wait(800);
const t=await ev(()=>({order:[...document.querySelectorAll('.tmenu .tmain .btn')].map(b=>b.dataset.act).join(','),tools:!!document.querySelector('.tmenu details.ttools'),modal:__A.V.modal&&__A.V.modal.type}));
chk('title: Continue, New journey, Daily Trial in that order',t.order==='slots,new,daily'||t.order);
chk('title: import, recover and codes are grouped',t.tools===true);
chk('title: no popup',!t.modal||t.modal);
await page.screenshot({path:__dirname+'/shots-v053/v060_title.png'});
// clean type: no element in the page renders with the pixel font
const px=await ev(()=>[...document.querySelectorAll('body *')].filter(e=>/Pixelify/.test(getComputedStyle(e).fontFamily.split(',')[0])).map(e=>e.tagName+'.'+e.className).slice(0,5));
chk('no UI text uses the pixel font',px.length===0||px.join(' '));
await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(600);
await ev(()=>{const A=__A;A.V.modal=null;A.META.cfg.hints=false;A.startBattle({stage:0,kind:'field',weather:'clear'});});await wait(1200);
await ev(async()=>{const A=__A;for(let i=0;i<200&&A.B.mode!=='cmd';i++)await new Promise(q=>setTimeout(q,150));A.setPause(99999);A.ACT.cmd('attack');});await wait(500);
const b=await ev(()=>{const u=document.querySelector('#bstage .unit.tg');if(!u)return 'no target';const s=getComputedStyle(u);return {outline:s.outlineStyle,ow:s.outlineWidth,n:document.querySelectorAll('#bstage .unit.tg').length};});
chk('targeting: no box outline on targetable foes',b.outline==='none'||b.ow==='0px'||JSON.stringify(b));
await page.screenshot({path:__dirname+'/shots-v053/v060_target.png'});
await ev(()=>{__A.V.modal={type:'menu',tab:'party'};__A.render();});await wait(400);await page.screenshot({path:__dirname+'/shots-v053/v060_menu.png'});
await done(H);})();
