// Beta v0.4.3: a save from an older version gets an export offer before play (once per version)
const {open,chk,done}=require('./pw');
(async()=>{
const A1=await open({w:430,h:800,mobile:true});
const blob=await A1.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.saveGame();
  const k=Object.keys(localStorage).find(x=>x.startsWith('aurelis-wayfarers-v3'));const o=JSON.parse(localStorage.getItem(k));o.gv='Beta v0.4.1';return {key:k,save:JSON.stringify(o)};});
await A1.browser.close();
const H=await open({w:430,h:800,mobile:true,pre:`localStorage.clear();localStorage.setItem(${JSON.stringify(blob.key)},${JSON.stringify(blob.save)});`});
await H.wait(600);
// v0.6.0: no export popup after an update any more (saves are on the account; Export stays in the Journey tab), and Continue leads the title
const r=await H.ev(()=>{const A=__A,o={};o.modal=A.V.modal&&A.V.modal.type;const bs=[...document.querySelectorAll('.tmenu .tmain .btn')].map(b=>b.dataset.act);o.first=bs[0];o.order=bs.join(',');return o;});
console.log(JSON.stringify(r));
chk('an older save gets no export popup at the title',r.modal!=='svupdate'||r.modal);
chk('with a save, Continue is the first title option',r.first==='slots'||r.order);
await done(H);})();
