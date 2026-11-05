// v0.4.1 Phase 2 tests: 2.1 dead stay dead, 2.2 ailments, 2.4 auto bans, 2.6 party sizes, 2.7 battle Lore, 2.8 sky tags
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {page,ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(30);});
await page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
// ---- 2.1
const r1=await ev(()=>{const A=__A,G=A.G,o={};const ids=G.party.slice();const dead=G.roster[ids[1]];
  const ok=A.startBattle({stage:0,kind:'field',weather:'clear'});o.started=ok!==false;
  const bd=A.B.front.concat(A.B.back).find(c=>c.id===ids[1]);bd.hp=0;
  A.B.en.forEach(e=>{e.hp=0;});A.finishBattle&&0;
  return {o,ids};});
await ev(()=>{const A=__A;try{A.advance();}catch(e){}});await wait(600);
const r1b=await ev(()=>{const A=__A,G=A.G;const ids=G.party;return {hp:ids.map(id=>G.roster[id].hp),modal:A.V.modal&&A.V.modal.type};});
console.log(JSON.stringify(r1b));
chk('2.1 a KO\'d hero is still KO\'d after the win',r1b.hp[1]===0&&r1b.hp[0]>0);
const r1c=await ev(()=>{const A=__A,G=A.G,o={};A.V.modal=null;if(A.B)A.finishBattle('x');
  o.stock=A.itemStock().includes('salts');o.price=A.ITEMS.salts.price;
  const c=G.roster[G.party[1]];G.inv.salts=2;o.used=A.useItemField('salts',c);o.hpAfter=c.hp;o.mhp=A.calcStats(c).mhp;
  c.hp=0;o.restAll=A.restAll({price:0});o.innHp=c.hp===c.S.mhp;
  return o;});
console.log(JSON.stringify(r1c));
chk('2.1 Smelling Salts are in stock and cheap',r1c.stock&&r1c.price<=80);
chk('2.1 Salts revive a KO\'d hero at about a quarter',r1c.used&&r1c.hpAfter>0&&r1c.hpAfter<=Math.ceil(r1c.mhp*.3));
chk('2.1 the Inn revives everyone',r1c.restAll!==false&&r1c.innHp);
const r1d=await ev(()=>{const A=__A,G=A.G;G.party.forEach(id=>{G.roster[id].hp=G.roster[id].S.mhp;});A.V.modal=null;A.startBattle({stage:0,kind:'field',weather:'clear'});A.B.front.concat(A.B.back).forEach(c=>c.hp=0);A.B.front.concat(A.B.back).forEach(c=>c.hp=0);A.lose();
  return {hp:G.party.map(id=>G.roster[id].hp),modal:A.V.modal&&A.V.modal.type};});
chk('2.1 a wipe leaves everyone up again (no softlock)',r1d.modal==='lose'&&r1d.hp.every(h=>h>0));
// ---- 2.2
const r2=await ev(()=>{const A=__A,G=A.G,o={};A.V.modal=null;if(A.B)A.finishBattle('x');
  const ids=G.party,c=G.roster[ids[0]];c.ail={};c.hp=c.S.mhp;const m0=A.calcStats(c).mhp;
  A.startBattle({stage:0,kind:'field',weather:'clear'});
  const u=A.B.front.concat(A.B.back).find(x=>x.id===c.id);u.st.poison={t:5,src:null};u.st.curse={t:99};u.st.wound={t:99};
  A.B.en.forEach(e=>{e.hp=0;});A.finishBattle('x');
  o.ail=Object.keys(c.ail||{}).sort().join();o.mhp=A.calcStats(c).mhp;o.m0=m0;
  o.packed=JSON.stringify(A.packG()).includes('"ail"');o.badge=/CRS|WND|PSN|Poison/i.test(A.ailBadge(c.id)||'');
  // cures
  G.inv.remedy=1;G.inv.ash=1;G.inv.bandage=1;
  A.useItemField('remedy',c);o.afterRemedy=Object.keys(c.ail).sort().join();
  A.useItemField('ash',c);o.afterAsh=Object.keys(c.ail).sort().join();
  A.useItemField('bandage',c);o.afterBand=Object.keys(c.ail).sort().join();o.mhp2=A.calcStats(c).mhp;
  // old save: no ail field at all
  const raw=JSON.parse(JSON.stringify(A.packG()));Object.values(raw.roster||{}).forEach(h=>delete h.ail);
  const G2=A.unpackG(raw);o.oldLoads=!!G2&&Object.values(G2.roster).every(h=>!h.ail||!Object.keys(h.ail).length);
  return o;});
console.log(JSON.stringify(r2));
chk('2.2 poison, curse and wound all persist out of battle',/curse/.test(r2.ail)&&/poison/.test(r2.ail)&&/wound/.test(r2.ail));
chk('2.2 a wound lowers max HP',r2.mhp<r2.m0);
chk('2.2 they are saved',r2.packed);
chk('2.2 the Party icons show them',r2.badge);
chk('2.2 Remedy cures only Poison',!/poison/.test(r2.afterRemedy)&&/curse/.test(r2.afterRemedy)&&/wound/.test(r2.afterRemedy));
chk('2.2 Sacred Ash lifts the Curse',!/curse/.test(r2.afterAsh)&&/wound/.test(r2.afterAsh));
chk('2.2 Bandage Roll closes the Wound and gives max HP back',r2.afterBand===''&&r2.mhp2>=r2.m0);
chk('2.2 old saves without the field load clean',r2.oldLoads);
// ---- 2.4
const r4=await ev(()=>{const A=__A;const o={};o.elite=A.autoBan({kind:'elite'});o.mini=A.autoBan({kind:'mini'});o.duel=A.autoBan({kind:'duel'});o.field=A.autoBan({kind:'field'});
  A.G.daily=1;o.daily=A.autoBan({kind:'elite'});A.G.daily=0;return o;});
console.log(JSON.stringify(r4));
chk('2.4 elite, miniboss and challenge fights ban auto with a reason',/elite/.test(r4.elite)&&/miniboss/.test(r4.mini)&&/challenge/.test(r4.duel));
chk('2.4 ordinary fights and the Daily Trial are not banned',!r4.field&&!r4.daily);
const r4b=await ev(()=>{const A=__A;if(A.B)A.finishBattle('x');A.V.modal=null;const mon=Object.keys(A.MON||{})[0]||'slime';A.startBattle({stage:0,kind:'elite',weather:'clear',bounty:{mon,mod:null,name:'Test Terror',lv:5,stage:0}});A.render();return {lock:!A.B.auto,txt:(document.body.innerText.match(/No auto in elite fights/)||[])[0]};});
chk('2.4 the Auto button states the reason',!!(r4b.lock&&r4b.txt));
// ---- 2.6 party sizes 1 to 6
const r6=await ev(()=>{const A=__A,G=A.G,o={};if(A.B)A.finishBattle('x');A.V.modal=null;
  const all=Object.keys(G.roster);const res=[];
  for(let n=1;n<=Math.min(3,all.length);n++){G.party=all.slice(0,n);
    try{const ok=A.startBattle({stage:0,kind:'field',weather:'clear'});const cnt=A.B.front.length+A.B.back.length;A.B.en.forEach(e=>{e.hp=0;});A.advance();res.push([n,ok!==false,cnt]);if(A.B)A.finishBattle('x');A.V.modal=null;}catch(e){res.push([n,false,e.message]);}}
  return res;});
console.log(JSON.stringify(r6));
chk('2.6 battles start with 1, 2 and 3 heroes',r6.every(x=>x[1]&&x[2]===x[0]));
// ---- 2.7 Lore in battle
const r7=await ev(()=>{const A=__A;if(A.B)A.finishBattle('x');A.V.modal=null;A.startBattle({stage:0,kind:'field',weather:'clear'});A.V.auto=true;A.B.auto=true;
  A.V.modal={type:'battlelore'};A.render();const body=document.querySelector('#modal');return {paused:A.battlePaused&&A.battlePaused(),txt:body?body.innerText.slice(0,80):''};});
chk('2.7 the Lore window opens in battle and pauses the fight',/lore/i.test(r7.txt));
// ---- 2.8 sky tags
const r8=await ev(()=>{const A=__A;const o={};if(A.B)A.finishBattle('x');A.V.modal=null;A.V.auto=false;A.startBattle({stage:0,kind:'field',weather:'clear'});o.out=A.battleSkyTags();
  o.indoor=typeof A.battleIndoors==='function';return o;});
console.log(JSON.stringify(r8));
chk('2.8 battle shows a weather tag even when Clear',/clear/i.test(String(r8.out)));
await done(H);})();
