const {open}=require('./pw');
(async()=>{for(const [w,h,n] of [[390,700,'p'],[900,380,'l']]){const H=await open({w,h,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
 A.V.screen='battle';A.V.modal={type:'result',info:{xp:1234,gold:567,mats:{fang:2,hide:3,ore:1},drops:['potion','ether','remedy','hipotion'],quests:['Slay five foes','Bring an herb'],bonds:[{a:'Mira',b:'Lumen',lv:2}],ups:[{name:'Mira',lv:4,pts:3},{name:'Lumen',lv:4,pts:3},{name:'Oren',lv:4,pts:3}],notes:[],learn:[]}};A.render();});
await H.wait(300);await H.page.screenshot({path:`/tmp/d_res_${n}.png`});await H.browser.close();}})();
