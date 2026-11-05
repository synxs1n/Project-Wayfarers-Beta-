// Beta v0.4.3: a save from an older version gets an export offer before play (once per version)
const {open,chk,done}=require('./pw');
(async()=>{
const A1=await open({w:430,h:800,mobile:true});
const blob=await A1.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.saveGame();
  const k=Object.keys(localStorage).find(x=>x.startsWith('aurelis-wayfarers-v3'));const o=JSON.parse(localStorage.getItem(k));o.gv='Beta v0.4.1';return {key:k,save:JSON.stringify(o)};});
await A1.browser.close();
const H=await open({w:430,h:800,mobile:true,pre:`localStorage.clear();localStorage.setItem(${JSON.stringify(blob.key)},${JSON.stringify(blob.save)});`});
await H.wait(600);
const r=await H.ev(()=>{const A=__A,o={};o.modal=A.V.modal&&A.V.modal.type;o.text=document.body.innerText.includes('Export');
  const b=document.querySelector('#modal [data-act="svExport"]');if(b)b.click();o.exp=A.V.modal&&A.V.modal.type;A.V.modal=null;A.render();o.again=A.V.modal&&A.V.modal.type;
  A.ACT.svUpdOk();A.render();o.after=A.V.modal?A.V.modal.type:null;return o;});
console.log(JSON.stringify(r));
chk('an older save gets the export offer at the title',r.modal==='svupdate'&&r.text);
chk('Export opens the export code',r.exp==='svexport');
chk('the offer stays until Continue, then is gone for this version',r.again==='svupdate'&&r.after===null);
await done(H);})();
