const {open,chk,done}=require('./pw');
(async()=>{for(const [n,w,h] of [['p',390,844],['l',900,400]]){
const H=await open({w,h,mobile:true,out:'/tmp'});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.startBattle({stage:0,kind:'field'});});
await H.page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
await H.ev(()=>{const B=__A.B;B.en.forEach((e,i)=>{if(i<2)e.primed={el:i?'ice':'fire',t:2,by:'Mira'};});__A.render();});await H.wait(500);
await H.page.screenshot({path:`/tmp/pr_${n}1.png`});
const r=await H.ev(()=>({chips:document.querySelectorAll('.pchip').length,unit:document.querySelectorAll('.unit.isprimed').length}));
chk(n+': primed chips on foe cards',r.chips>=1||JSON.stringify(r));chk(n+': primed aura on foe overlay',r.unit>=1||JSON.stringify(r));
await H.browser.close();}
process.exit(0);})();
