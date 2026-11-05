const {open}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();Object.keys(A.TPL).slice(0,12).forEach(id=>{if(!A.G.roster[id])A.G.roster[id]=A.newChar(id,8,0);});A.V.modal={type:'menu',tab:'party'};A.render();});
await H.wait(300);
await H.ev(()=>{document.querySelector('.box').scrollTop=520;});await H.wait(200);
await H.page.screenshot({path:'/tmp/c_scrolled.png'});await H.browser.close();})();
