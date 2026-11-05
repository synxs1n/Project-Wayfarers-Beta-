const {open,chk,done}=require('./pw');
(async()=>{const h=await open({mobile:true});const {ev,wait}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
const info=await ev(()=>{const G=__A.G;G.gold=999999;for(const k of Object.keys(G.mats))G.mats[k]=99;G.stage=4;
 let n=0;Object.keys(__A.TPL).forEach(id=>{if(!G.roster[id]){try{G.roster[id]=__A.newChar(id,45,5);n++;}catch(e){}}});
 // a full pack: every gear piece twice
 try{Object.keys(__A.GEAR).forEach(id=>{G.gear.push(id,id);});}catch(e){}
 return {roster:Object.keys(G.roster).length,pack:G.gear.length,hasGEAR:!!__A.GEAR};});
console.log(JSON.stringify(info));
for(const tab of ['weapons','armor','craft','forge','mats','sell','echo']){
  const ms=await ev(t=>{const t0=performance.now();__A.V.modal={type:'smithy',tab:t};__A.render();return Math.round(performance.now()-t0);},tab);
  chk(`render ${tab} = ${ms}ms`,ms<600?true:'slow');}
await done(h);})();
