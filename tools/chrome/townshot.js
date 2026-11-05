const {open}=require('./pw');
(async()=>{const H=await open({w:900,h:520,mobile:false,out:'/tmp'});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();});
await H.wait(600);await H.page.screenshot({path:'/tmp/town_0.png'});await H.browser.close();})();
