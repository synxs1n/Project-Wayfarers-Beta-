// v0.22.28: a Legendary who joins while the six is full asks where to stand (G.pendRecruit, recruit3.js), like a wayfarer met in the wild.
// Reported: "When completing quest for dist, it didn't give option to switch him into my party."
//  1 Dist joining a full six: he is in the roster, not in the six, and the swap prompt opens on the field with one Swap per party member
//  2 Swap puts him in the six in that hero's place; with a free seat (Kaevan, legendJoin) there is no prompt and he takes the seat
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v212a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v212a ran over 200 s');process.exit(1);},200000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v212a'});const {ev,wait}=H;
  await ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;
    ['brann','tess','sable'].forEach(id=>{G.roster[id]=g('newChar')(id,3,0);G.party.push(id);});g('j17Join')('dist');A.V.modal=null;A.render();});await wait(900);
  const a=await ev(()=>{const A=__A,G=A.G;return {six:G.party.length,in:G.party.includes('dist'),ros:!!G.roster.dist,pend:G.pendRecruit,modal:A.V.modal&&A.V.modal.type,swaps:document.querySelectorAll('[data-act="recruitSwap"]').length,txt:(document.querySelector('#modal')||{}).innerText||''};});
  chk(`1 Dist joins a full six: in the roster, the prompt is open with ${a.swaps} Swap buttons`,(a.six===6&&!a.in&&a.ros&&a.modal==='recruitAsk'&&a.swaps===6&&/Dist/.test(a.txt))||JSON.stringify(a).slice(0,500));
  await ev(()=>{document.querySelectorAll('[data-act="recruitSwap"]')[5].click();});await wait(500);
  const b=await ev(()=>{const A=__A,g=A.TW.get,G=A.G;const o={in:G.party.includes('dist'),six:G.party.length,pend:G.pendRecruit||null,out:!G.party.includes('sable')&&!!G.roster.sable};
    G.party.pop();g('legendJoin')('kaevan');o.k=G.party.includes('kaevan');o.kp=G.pendRecruit||null;return o;});
  chk(`2 Swap seats him (the hero he replaced waits in the reserves); with a free seat a Legendary takes it and nothing is asked`,(b.in&&b.six===6&&!b.pend&&b.out&&b.k&&!b.kp)||JSON.stringify(b));
  await done(H);})();
