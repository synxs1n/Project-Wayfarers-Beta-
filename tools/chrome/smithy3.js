const {open,chk,done,perfChk}=require('./pw');
(async()=>{const h=await open({mobile:true});const {ev,wait}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}});await wait(300);
const info=await ev(()=>{const G=__A.G;G.gold=999999;for(const k of Object.keys(G.mats))G.mats[k]=99;G.stage=4;
 let n=0;Object.keys(__A.TPL).forEach(id=>{if(!G.roster[id]){try{G.roster[id]=__A.newChar(id,45,5);n++;}catch(e){}}});
 // a full pack: every gear piece twice
 try{Object.keys(__A.GEAR).forEach(id=>{G.gear.push(id,id);});}catch(e){}
 return {roster:Object.keys(G.roster).length,pack:G.gear.length,hasGEAR:!!__A.GEAR};});
console.log(JSON.stringify(info));
for(const tab of ['weapons','armor','craft','forge','mats','sell','echo']){
  const ms=await ev(t=>{const t0=performance.now();__A.V.modal={type:'smithy',tab:t};__A.render();return Math.round(performance.now()-t0);},tab);
  // v0.9.9: the 600 ms limit is scaled by the machine's load measured at that moment (pw.js perfChk), the raw time is still printed
  await perfChk(h,`render ${tab}`,ms,600);}
await done(h);})();
