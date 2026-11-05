const {open,chk,done}=require('./pw');
(async()=>{const h=await open({mobile:true});const {ev,wait,page}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
await ev(()=>{const G=__A.G;G.gold=999999;for(const k of Object.keys(G.mats))G.mats[k]=99;G.stage=4;Object.keys(__A.TPL).forEach(id=>{if(!G.roster[id]){try{G.roster[id]=__A.newChar(id,45,5);}catch(e){}}});Object.keys(__A.GEAR).forEach(id=>G.gear.push(id,id));});
for(const tab of ['weapons','armor','craft','forge','mats','sell','echo']){
  await ev(t=>{__A.V.modal={type:'smithy',tab:t};__A.render();window.__mut=0;const mo=new MutationObserver(r=>{window.__mut+=r.length});mo.observe(document.querySelector('#modal'),{subtree:true,childList:true,attributes:true,characterData:true});window.__mo=mo;},tab);
  await wait(1500);
  const mut=await ev(()=>{window.__mo.disconnect();return window.__mut;});
  // click every button once, with a freeze watchdog
  const n=await ev(()=>document.querySelectorAll('#modal button').length);
  let frozen=null;
  for(let i=0;i<Math.min(n,150)&&!frozen;i++){
    const r=await Promise.race([ev(([i,t])=>{const bs=[...document.querySelectorAll('#modal button')];const b=bs[i];if(!b||b.classList.contains('mclose')||b.classList.contains('mback'))return 'skip';b.click();return b.innerText.slice(0,24);},[i,tab]),new Promise(r=>setTimeout(()=>r('FREEZE'),6000))]);
    if(r==='FREEZE'){frozen='button #'+i;break;}
    if(!(await ev(()=>!!document.querySelector('#modal .panel')&&__A.V.modal&&__A.V.modal.type==='smithy'))){await ev(t=>{__A.V.modal={type:'smithy',tab:t};__A.render();},tab);}
  }
  chk(`tab ${tab}: mutations idle=${mut}, click sweep of ${Math.min(n,150)} buttons`,frozen?'froze at '+frozen:(mut>20?'render churn '+mut:true));
}
await done(h);})();
