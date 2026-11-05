const {open,chk,done}=require('./pw');
(async()=>{const h=await open();const {ev,wait,page}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
// full inventory: lots of gold, every material, one of every gear piece in the pack
await ev(()=>{const G=__A.G;G.gold=999999;Object.keys(G.mats||{}).forEach(k=>G.mats[k]=99);['ore','ore1','ore2','wood','wood1','wood2','herb','herb1','herb2','herb3','hide','fang','scale','ichor','grit','core','relic0','relic1','relic2'].forEach(k=>G.mats[k]=99);
 G.stage=4;if(__A.GEAR){Object.keys(__A.GEAR).forEach(id=>G.gear.push(id));}});
const timed=async(n,f)=>{const t0=Date.now();let r;try{r=await Promise.race([f(),new Promise((_,j)=>setTimeout(()=>j(new Error('FREEZE >8s')),8000))]);}catch(e){return chk(n,e.message);}chk(n+' ('+(Date.now()-t0)+'ms)',true);return r;};
await timed('open smithy',()=>ev(()=>{__A.V.modal={type:'smithy'};__A.render();return 1;}));
const tabs=await ev(()=>[...document.querySelectorAll('#modal .chip,#modal [data-tab]')].map(e=>e.innerText).slice(0,12));console.log('chips',JSON.stringify(tabs));
for(const tab of ['weapons','armor','craft','forge','mats','sell','echo']){
  await timed('tab '+tab,()=>ev(t=>{__A.V.modal={type:'smithy',tab:t};__A.render();return 1;},tab));
}
await done(h);})();
