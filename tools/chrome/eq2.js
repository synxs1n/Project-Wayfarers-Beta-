const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:420,h:860,mobile:true});const {ev,wait,shot}=H;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(250);
await ev(()=>{__A.V.modal=null;const G=__A.G;G.gold=99999;Object.values(G.roster).forEach(c=>{c.eq={w:null,a:null,c:null};__A.refresh(c);});G.gear=[];});
const r=await ev(()=>{const ids=Object.keys(__A.GEAR).filter(k=>__A.GEAR[k].slot==='a'&&!__A.GEAR[k].tome).slice(0,3);
  __A.V.modal={type:'smithy',tab:'armor'};__A.render();return {ids,sh:document.querySelectorAll('.shoprow').length,best:document.querySelectorAll('.bestl').length,none:document.querySelectorAll('.best.none').length,errs:0};});
console.log(JSON.stringify(r));chk('shop renders Best for rows',r.sh>0&&(r.best+r.none)>0||'none');
await shot('eq_shop');
// equip now prompt
await ev(()=>{const id=Object.keys(__A.GEAR).find(k=>__A.GEAR[k].slot==='w'&&!__A.GEAR[k].tome&&!__A.GEAR[k].stick);__A.G.gear.push(id);__A.V.modal={type:'equipNow',id};__A.render();});await wait(100);
chk('equip-now lists heroes with gains',await ev(()=>document.querySelectorAll('.modal .row .btn').length)>0||'none');await shot('eq_now');
await done(H);})();
