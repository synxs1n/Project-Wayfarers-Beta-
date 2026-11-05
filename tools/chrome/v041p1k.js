// v0.4.1 1.11 auto settings saved in the save; 1.12 Records opens on Journey
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
await H.page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
const r=await H.ev(()=>{const A=__A;const out={};
  A.ACT.autoCfg(JSON.stringify(['healAt',65]));A.ACT.autoCfg(JSON.stringify(['mp','save']));
  out.inSave=JSON.stringify(A.G.auto);A.saveGame();
  const raw=A.loadRaw();out.raw=raw&&raw.auto;
  A.META.cfg.auto={healAt:20};out.deviceChanged=A.autoCfg().healAt;      // another device / profile changed its own setting
  const G2=A.unpackG(raw);out.unpacked=G2.auto&&G2.auto.healAt;
  // an old save (no auto field) takes this device's settings once
  delete A.G.auto;A.META.cfg.auto={healAt:42};out.oldSave=A.autoCfg().healAt;out.seeded=!!A.G.auto;
  A.ACT.autoReset();out.afterReset=JSON.stringify(A.G.auto);
  return out;});
console.log(JSON.stringify(r));
chk('1.11 the setting is written into the save',r.raw&&r.raw.healAt===65&&r.raw.mp==='save');
chk('1.11 the save wins over the device value',r.deviceChanged===65);
chk('1.11 it survives unpack',r.unpacked===65);
chk('1.11 an old save without the field takes the device value once',r.oldSave===42&&r.seeded);
chk('1.11 reset clears the save copy',r.afterReset==='{}');
// 1.12
await H.ev(()=>{const A=__A;A.V.menuSub={records:'codex'};A.V.modal={type:'menu',tab:'party'};A.render();});
await H.page.click('#modal [data-act="menuGrp"][data-arg="records"]');await H.wait(150);
const t=await H.ev(()=>({tab:__A.V.modal.tab,on:[...document.querySelectorAll('#modal .msub .chip.on')].map(e=>e.textContent)}));
console.log(JSON.stringify(t));
chk('1.12 Records opens on Journey even after another Records tab was used',t.tab==='system'&&/journey/i.test(t.on.join()));
await done(H);})();
