// v0.4.1 2.6: parties of 1 to 6 load, fight, save loadouts and load them back
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(async()=>{const A=__A,G=A.G,o={sizes:[]};const extra=['brann','sable','kael','sylva'].filter(id=>A.TPL[id]);
  extra.forEach(id=>{if(!G.roster[id])G.roster[id]=A.newChar(id,8,1);});const all=Object.keys(G.roster).filter(id=>!A.TPL[id].mon);
  for(let n=1;n<=6;n++){G.party=all.slice(0,n);A.G.loadouts=[];A.ACT.ldSave(0);const saved=(G.loadouts[0]||{}).party||(G.loadouts[0]||{}).ids||null;
    G.party=all.slice(0,Math.max(1,7-n));A.ldApply(0);const back=G.party.length;
    const raw=A.packG();const ok=A.startBattle({stage:0,kind:'field',weather:'clear'});const fr=A.B?A.B.front.length:0;if(A.B)A.finishBattle('x');
    o.sizes.push({n,back,ok:ok!==false,fr,savedParty:Array.isArray(raw.party)&&raw.party.length===back});}
  return o;});
console.log(JSON.stringify(r));
chk('2.6 loadouts save and load at every party size from 1 to 6',r.sizes.every(x=>x.back===x.n));
chk('2.6 battles start with every party size and the save keeps the party',r.sizes.every(x=>x.ok&&x.fr===Math.min(x.n,3)&&x.savedParty));
await done(H);})();
