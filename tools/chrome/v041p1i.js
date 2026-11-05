// v0.4.1 1.9: the map screen has a back arrow next to the X, and back returns to where the map was opened from
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
await H.page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
// opened straight from the world
await H.ev(()=>__A.ACT.map());await H.wait(200);
let r=await H.ev(()=>({back:!!document.querySelector('#modal .mnav .mback'),x:!!document.querySelector('#modal .mnav .mclose'),type:__A.V.modal&&__A.V.modal.type}));
console.log(JSON.stringify(r));
chk('1.9 map shows back and X side by side',r.type==='map'&&r.back&&r.x);
if(r.back){await H.page.click('#modal .mnav .mback');await H.wait(200);}
r=await H.ev(()=>({modal:__A.V.modal&&__A.V.modal.type}));chk('1.9 back from a map opened in the world closes it',!r.modal);
// opened from the menu: back returns to the menu
await H.ev(()=>{__A.V.modal={type:'menu',tab:'party'};__A.render();});await H.wait(150);
await H.ev(()=>__A.ACT.map());await H.wait(200);
r=await H.ev(()=>({back:!!document.querySelector('#modal .mnav .mback'),from:__A.V.modal&&__A.V.modal.from&&__A.V.modal.from.type}));
chk('1.9 map opened from the menu remembers it',r.from==='menu'&&r.back);
if(r.back){await H.page.click('#modal .mnav .mback');await H.wait(200);}
r=await H.ev(()=>({modal:__A.V.modal&&__A.V.modal.type}));chk('1.9 back returns to the menu',r.modal==='menu');
await done(H);})();
