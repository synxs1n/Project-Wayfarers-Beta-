// v0.5.3 sprites: first-draw cost of every sprite a town and a battle need, with a 4x CPU throttle (phone-like).
// Town: the six party heroes in side, front and back views and their walk frames, plus every townsfolk of t0 (front and side).
// Battle: the six heroes (stand and walk), five foes, a guardian and the six portraits (data URLs). Builders are called uncached.
// Prints the median of 5 runs in ms. Usage: PWHTML=../../out/aurelis3.html node v053sperf.js
const {open,chk,done}=require('./pw');
(async()=>{
  const H=await open({w:390,h:844,mobile:true});const {page,ev,wait}=H;
  await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
  await ev(()=>{__A.V.modal=null;['brann','sable','tess'].forEach(id=>{__A.G.roster[id]=__A.newChar(id,5,0);__A.G.party.push(id);});});
  const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const runs=[];
  for(let r=0;r<5;r++){
    runs.push(await ev(r=>{const A=__A,G=A.G,P=G.party.slice(0,6),tag='perf'+r+':'+Math.random();
      const t0=performance.now();
      P.forEach(id=>{const t=A.TPL[id],L=A.heroLook(id);
        [['side',0],['side',1],['front',0],['front',1],['front',2],['back',0],['back',1],['back',2]].forEach(([v,f])=>A.walkerCanvas(tag+id,L,t.el,id,v,f));});
      const m=A.getMap('t0');(m.npcs||[]).forEach((n,i)=>{if(n.portal||!n.look)return;A.walkerCanvas(tag+'npc'+i,n.look,['light'],null,'front',0);A.walkerCanvas(tag+'npc'+i,n.look,['light'],null,'side',0);});
      const t1=performance.now();
      P.forEach(id=>{A.heroCanvas(id,false);A.heroCanvas(id,true);});
      ['gull','mossling','cavebat','frostwolf','yeti'].forEach(k=>A.monCanvas(A.MON[k].art));A.monCanvas('drake');
      P.forEach(id=>A.heroCanvas(id,false).toDataURL());
      const t2=performance.now();
      return {town:t1-t0,battle:t2-t1,npcs:(m.npcs||[]).length};},r));
  }
  const med=k=>{const a=runs.map(o=>o[k]).sort((a,b)=>a-b);return Math.round(a[2]*10)/10;};
  console.log(`PERF (4x CPU throttle, median of 5): town ${med('town')} ms (6 heroes x 8 frames + ${runs[0].npcs} townsfolk x 2), battle ${med('battle')} ms (12 hero sprites, 6 foes, 6 portraits)`);
  chk('town sprites build under 400 ms at 4x throttle',med('town')<400||med('town'));
  chk('battle sprites build under 300 ms at 4x throttle',med('battle')<300||med('battle'));
  await done(H);
})();
