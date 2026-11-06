// Beta v0.7.5: the taming tip on the rewards window stayed for a moment, vanished and came back over and over (the card was judged by
// the battle screen under the window, so it counted as gone and was put back). It must stay up, steady, until Got it.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.stage=2;A.G.cleared=[1,1,0,0,0];A.startBattle({stage:2,kind:'field',weather:'clear'});});await wait(900);
await ev(()=>{const A=__A;A.B.en.forEach(e=>e.hp=0);A.win();const i=A.V.modal.info;i.tame={mon:Object.keys(A.MON)[0],name:'Test Beast'};A.render();});
const log=[];for(let k=0;k<32;k++){await wait(250);log.push(await ev(()=>{const d=document.getElementById('p2hint');return !!(d&&d.isConnected&&d.classList.contains('show')&&d.dataset.tip==='tame'&&d.closest('#modal'));}));}
const first=log.indexOf(true);
chk('the tame tip shows inside the rewards window',first>=0&&first<8||JSON.stringify(log));
chk('and stays up without flashing for 6 s',first>=0&&log.slice(first).every(Boolean)||log.map(x=>x?1:0).join(''));
await ev(()=>__A.ACT.tipOk());await wait(1200);
chk('Got it closes it for good',await ev(()=>{const d=document.getElementById('p2hint');return !(d&&d.classList.contains('show')&&d.dataset.tip==='tame');}));
await done(H);})();
