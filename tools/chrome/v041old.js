// v0.4.1: a v0.4.0-shaped save (no ailments, battles together, dunRev, auto settings, 3 heroes, mid dungeon) loads and plays
const {open,chk,done}=require('./pw');
(async()=>{
const A1=await open({w:430,h:800,mobile:true});
const blob=await A1.ev(()=>{const A=__A,G=A.G;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
  A.G.roster.mira.lv=22;A.saveGame();
  const k=Object.keys(localStorage).find(x=>x.startsWith('aurelis-wayfarers-v3'));const o=JSON.parse(localStorage.getItem(k));
  Object.values(o.roster||{}).forEach(c=>{delete c.ail;delete c.bt;delete c.dead;});delete o.dunRev;delete o.auto;delete o.autoCfg;delete o.weather;delete o.wx;
  return {key:k,save:JSON.stringify(o)};});
await A1.browser.close();
const H=await open({w:430,h:800,mobile:true,pre:`localStorage.clear();localStorage.setItem(${JSON.stringify(blob.key)},${JSON.stringify(blob.save)});`});
// Continue may wait for the save sync first (v0.8.5): wait until the journey is loaded instead of reading it in the same tick
await H.ev(()=>{__A.ACT.cont();});await H.until(()=>!!__A.G,null,{timeout:15000});
const r=await H.ev(()=>{const A=__A;const G=A.G,o={ok:!!G};o.party=G.party.length;const c=G.roster[G.party[0]];
  o.bt=A.btOf(c);o.pe=typeof A.personalEligible(c);
  const ok=A.startBattle?1:0;o.menu=[];['party','roster','codex','equip'].forEach(t=>{A.V.modal={type:'menu',tab:t};try{A.render();o.menu.push(1)}catch(e){o.menu.push(String(e))}});
  A.V.modal={type:'char',char:c.id,list:[c.id]};try{A.render();o.sheet=document.body.innerText.includes('Battles together');}catch(e){o.sheet=String(e)}
  A.V.modal=null;A.render();o.wk=!!document.getElementById('wkw');return o;});
console.log(JSON.stringify(r));
chk('old save loads with 3 heroes',r.ok&&r.party===3||JSON.stringify(r));
chk('missing battles-together field is estimated, not NaN',Number.isFinite(r.bt)&&r.bt>0||JSON.stringify(r));
chk('menus and hero sheet render on the old save',r.menu.every(x=>x===1)&&r.sheet===true||JSON.stringify(r));
await done(H);})();
