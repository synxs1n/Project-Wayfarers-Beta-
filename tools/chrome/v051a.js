// Beta v0.5.1: a hint shown during a battle never covers the battle cards, shield pips or the command panel (it covered the foe card's pips in 0.5.0)
const {open,chk,done}=require('./pw');
(async()=>{for(const [w,h] of [[430,820],[390,844],[844,390],[1280,800]]){
const H=await open({w,h,mobile:w<1000});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(300);A.startBattle({stage:0,kind:'boss'});});
await H.page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000}).catch(()=>{});
await ev(()=>{__P2.hintShow('test','Brann prefers axes and swords. Check his sheet from the Party menu.');});await wait(500);
const r=await ev(()=>{const d=document.getElementById('p2hint').getBoundingClientRect(),hit=q=>[...document.querySelectorAll(q)].filter(e=>{const b=e.getBoundingClientRect();return b.width&&b.height&&b.left<d.right&&b.right>d.left&&b.top<d.bottom&&b.bottom>d.top;}).length;
  const wr=document.getElementById('bwrap').getBoundingClientRect();
  return {shown:d.width>0,pips:hit('#bparty .fc .spips'),cards:hit('#bparty .fc,#bparty .pc'),cmd:hit('#bcmd .mi,#bcmd .cmdback'),inStage:d.top>=wr.top-1&&d.bottom<=wr.bottom+1&&d.left>=wr.left-1&&d.right<=wr.right+1};});
const tag=w+'x'+h;
chk(`${tag}: the hint shows`,r.shown);
chk(`${tag}: it covers no shield pips, cards or commands`,r.pips+r.cards+r.cmd===0||JSON.stringify(r));
chk(`${tag}: it sits on the battle stage`,r.inStage||JSON.stringify(r));
await H.browser.close();}
const H=await open({});await done(H);})();
