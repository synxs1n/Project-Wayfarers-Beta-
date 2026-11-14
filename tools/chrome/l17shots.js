// Screenshots of the reworked Legendaries' signatures (legends17b.js) at 1000x560 and 390x844.
// Usage: PWHTML=<abs path to out/aurelis3.html> node l17shots.js <out dir> [only: hawk,bolt,strike,rod,blizzard,limit,weather]
const fs=require('fs');const {open}=require('./pw');const out=process.argv[2]||'/tmp',only=(process.argv[3]||'').split(',').filter(Boolean);
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,hints:false,tips:false,timedHits:false},legends:{nikaris:1,kaevan:1,jaeson:1}}));`;
const SETUP=kind=>{const A=__A,g=A.TW.get;A.ACT.new();['brann','mira','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();try{A.ACT.storyOk();}catch(e){}A.V.modal=null;
  const G=A.G;['nikaris','kaevan','jaeson'].forEach(id=>{G.roster[id]=g('newChar')(id,46,3);});G.party=['nikaris','jaeson','kaevan'];
  Object.values(G.roster).forEach(c=>{c.S=g('calcStats')(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  A.V.auto=false;A.startBattle({stage:2,kind:kind||'boss',seed:11});const B=A.B;B.auto=false;A.render();return B.en.map(e=>e.name);};
const SK=(id,sid)=>{const B=__A.B,u=B.front.find(x=>x.id===id);return [u,__L17.known(u).find(s=>s.id===sid)];};
const SHOTS={
 hawk:{at:[430],go:()=>{const B=__A.B,N=B.front.find(u=>u.id==='nikaris'),K=B.front.find(u=>u.id==='kaevan'),w=__L17.known(N).find(s=>s.id==='l17_watch');__L17.perform(N,w,[N]);
   const s=__L17.known(K).find(x=>x.id==='s1b');__L17.perform(K,s,[B.en[0]]);__A.render();}},
 bolt:{at:[330],pre:()=>{const B=__A.B,K=B.front.find(u=>u.id==='kaevan');__L17.perform(K,__L17.known(K).find(s=>s.id==='l17_steady'),[K]);__A.render();},
   go:()=>{const B=__A.B,K=B.front.find(u=>u.id==='kaevan');__L17.perform(K,__L17.known(K).find(s=>s.id==='tenk'),[B.en[0]]);__A.render();}},
 strike:{at:[200],pre:()=>{const B=__A.B,J=B.front.find(u=>u.id==='jaeson');__L17.perform(J,__L17.known(J).find(s=>s.id==='l17_storm'),[J]);J.hp=Math.round(J.S.mhp*.5);__A.render();},wait:900,
   go:()=>{const B=__A.B,J=B.front.find(u=>u.id==='jaeson');__L17.absorb(J,'Lightning strikes '+J.name+'.');B.banner={t:Date.now(),txt:'Lightning strike!',col:'#f2c93a'};__A.render();}},
 rod:{at:[160],pre:()=>{const B=__A.B,J=B.front.find(u=>u.id==='jaeson');__L17.perform(J,__L17.known(J).find(s=>s.id==='l17_storm'),[J]);__L17.perform(J,__L17.known(J).find(s=>s.id==='l17_rod'),[J]);J.hp=Math.round(J.S.mhp*.6);__A.render();},wait:900,
   go:()=>{const B=__A.B;__L17.perform(B.en[0],{id:'eZap',n:'Chain Lightning',el:'lightning',pw:1.5,t:'all',k:'mag',mp:0,cost:1,hits:1},B.front.slice());__A.render();}},
 blizzard:{at:[1300],go:()=>{const B=__A.B,J=B.front.find(u=>u.id==='jaeson');__L17.perform(J,__L17.known(J).find(s=>s.id==='l17_bliz'),[J]);__A.render();},
   then:()=>{const B=__A.B,J=B.front.find(u=>u.id==='jaeson');__L17.perform(J,__L17.known(J).find(s=>s.id==='l17_white'),B.en.filter(e=>e.hp>0));__A.render();},thenAt:300},
 limit:{at:[520],pre:()=>{const B=__A.B,J=B.front.find(u=>u.id==='jaeson');__L17.perform(J,__L17.known(J).find(s=>s.id==='l17_storm'),[J]);__A.render();},wait:900,
   go:()=>{const B=__A.B,J=B.front.find(u=>u.id==='jaeson'),L=__L17.limit(J);B.banner={t:Date.now(),txt:L.n,col:'#fff2a0'};__L17.perform(J,L,B.en.filter(e=>e.hp>0));__A.render();}}};
(async()=>{fs.mkdirSync(out,{recursive:true});
for(const [w,h] of [[1000,560],[390,844]]){
 for(const name of Object.keys(SHOTS)){if(only.length&&!only.includes(name))continue;const S=SHOTS[name];
  const H=await open({w,h,pre:PRE,tag:'l17s'});await H.wait(400);const foes=await H.ev(SETUP,name==='hawk'?'field':'boss');await H.wait(1700);
  await H.ev(()=>{const B=__A.B;if(B){B.mode='cmd';B.cur=B.front[0];B.auto=false;}__A.setPause&&0;});
  if(S.pre){await H.ev(S.pre);await H.wait(S.wait||500);}
  await H.ev(S.go);
  {let i=0;for(const t of (S.burst||[120,160,160,200])){await H.wait(t);await H.page.screenshot({path:`${out}/${name}_${w}x${h}_${i++}.png`});}}
  if(S.then){await H.ev(S.then);await H.wait(S.thenAt||300);await H.page.screenshot({path:`${out}/${name}2_${w}x${h}.png`});}
  console.log('shot',name,w+'x'+h,foes.join(', '));await H.browser.close();}}
process.exit(0);})();
