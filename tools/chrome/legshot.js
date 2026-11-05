const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true,out:'/tmp'});
const ids=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
 const L=Object.keys(A.TPL).filter(id=>A.TPL[id].src==='L');L.forEach(id=>{A.G.roster[id]=A.newChar(id,10,0);});A.G.party[3]=L[0];A.render();return L;});
console.log(ids);
await H.ev(()=>{__A.V.modal={type:'menu',tab:'roster'};__A.render();});await H.wait(350);await H.page.screenshot({path:'/tmp/lg2_roster.png'});
await H.ev(id=>{__A.V.modal={type:'char',id};__A.render();},ids[0]);await H.wait(350);await H.page.screenshot({path:'/tmp/lg2_sheet.png'});
await H.ev(id=>{__A.codexSee&&__A.codexSee(id);__A.V.modal={type:'codexe',id};__A.render();},ids[0]);
await H.browser.close();})();
