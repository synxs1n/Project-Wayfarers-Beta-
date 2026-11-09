// v0.13.x lore9.js: Records > Lore is the world book (world chapters + one chapter per visited realm); charts moved to Guides.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1280,h:800});const r=await H.ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=g('G');const o={};
 const view=()=>{A.V.modal={type:'menu',tab:'lore'};A.render();const m=document.querySelector('#modal');const t=m?m.innerHTML:'';return {t,world:m?m.querySelectorAll('details.lorebook').length:0,locked:(t.match(/not yet reached/g)||[]).length};};
 G.stage=0;G.loreHeard=[{s:0,t:'The barrow builders liked the wind.'}];let v=view();
 o.n=G.run.order.length;o.pref=/world book of Aurelis/.test(v.t);o.chap0=g('LORE_WORLD').length;o.details0=v.world;o.locked0=v.locked;o.heard=v.t.indexOf('The barrow builders liked the wind.')>=0;o.noChart=!/Element chart/.test(v.t);
 o.firstOpen=/<details[^>]*open[^>]*><summary>The Meridian and the dark/.test(v.t);
 G.stage=3;v=view();o.details3=v.world;o.locked3=v.locked;
 const RS=g('REALMS'),LR=g('LORE_REALM');o.missing=RS.filter(R=>!LR[R.key]||!LR[R.key].hist||!LR[R.key].custom||!LR[R.key].folk).map(R=>R.key);
 o.legacy=g('ZONES').filter(Z=>!Z.key).every(Z=>g('loreRealmEntry')(Z));
 // the in-battle lore popup keeps the old vLore (not the book)
 o.vLoreOld=typeof g('vLore')==='function'&&!/world book/.test(g('vLore')());
 A.V.modal={type:'menu',tab:'charts'};A.render();const t=document.querySelector('#modal').innerHTML;o.guides=/Element chart/.test(t)&&/Rare skies/.test(t)&&/<h4>Weather<\/h4>/.test(t);
 return o;});console.log(JSON.stringify(r));
  chk('Lore shows the preface, 7 world chapters (first open) and heard lines at stage 0',r.pref&&r.chap0===7&&r.firstOpen&&r.heard&&r.noChart||JSON.stringify(r));
  chk('stage 0: 7 chapters + 1 realm block, the other realms locked',r.details0===8&&r.locked0===r.n-1||JSON.stringify([r.details0,r.locked0,r.n]));
  chk('stage 3: 7 chapters + 4 realm blocks, rest locked',r.details3===11&&r.locked3===r.n-4||JSON.stringify([r.details3,r.locked3]));
  chk('every REALMS key has a full LORE_REALM entry; legacy zones covered',r.missing.length===0&&r.legacy===true||JSON.stringify([r.missing,r.legacy]));
  chk('vLore (battle lore) is untouched; Guides charts now hold the chart, weather and rare skies',r.vLoreOld&&r.guides||JSON.stringify([r.vLoreOld,r.guides]));
  await done(H);})();
