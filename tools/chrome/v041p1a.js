// v0.4.1 1.1: every wayfarer as a duel enemy must finish (no freeze)
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(40);});
const ids=await H.ev(()=>Object.keys(__A.TPL).filter(id=>!__A.TPL[id].mon));
const bad=[];
for(const id of ids){
  const r=await H.ev(async(id)=>{const A=__A;const G=A.G;G.stage=3;Object.values(G.roster).forEach(c=>{c.hp=c.S?c.S.mhp:999;});
    A.V.modal=null;const ok=A.startBattle({stage:3,kind:'duel',hero:id,ce:{hero:id,mode:'duel'},weather:'clear'});if(!ok)return {id,err:'nostart'};
    A.B.auto=true;A.V.auto=true;let last=-1,stall=0,ticks=0;
    for(let i=0;i<1500;i++){await new Promise(r=>setTimeout(r,10));ticks++;if(!A.B||A.B.over||(A.V.modal&&A.V.modal.type==='result')||A.V.screen!=='battle')break;
      if(A.B.mode==='cmd'){A.B.auto=true;A.autoTurnSmart();}
      const sig=A.B.time+':'+A.B.mode+':'+(A.B.cur&&A.B.cur.name)+':'+A.B.log.length;if(sig===last)stall++;else{stall=0;last=sig;}if(stall>500)return {id,err:'stall '+sig};}
    const fin=!A.B||A.B.over||(A.V.modal&&A.V.modal.type==='result');
    if(A.B&&!A.B.over){}
    return {id,fin,ticks};},id).catch(e=>({id,err:String(e.message).slice(0,80)}));
  if(r.err||!r.fin)bad.push(r);
  await H.ev(()=>{const A=__A;try{A.V.modal=null;A.B=null;A.V.screen='world';A.render();}catch(e){}});
}
console.log(JSON.stringify(bad.slice(0,12)),bad.length,'of',ids.length);
chk('1.1 every wayfarer duel runs to the end',bad.length===0);
await done(H);})();
