// Beta v0.5.0 phase 4, old saves: a v0.4.6 save with a started and a finished personal quest (opened under the old level 20 rule,
// in the first realm), heroes without a saved battle count, and faction standing. It loads, nothing is reset, and factions read as Guilds.
const {open,chk,done}=require('./pw');
(async()=>{
const H0=await open({w:430,h:880,mobile:true});
const raw=await H0.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.saveGame();
  const o=JSON.parse(localStorage.getItem('aurelis-wayfarers-v3'));o.gv='Beta v0.4.6';o.stage=0;
  o.roster.mira.lv=22;delete o.roster.mira.bt;o.roster.lumen.lv=21;o.roster.lumen.bt=12;delete o.roster.oren.bt;o.roster.oren.lv=9;
  o.personal={mira:{id:'p_mira',personal:'mira',stage:0,mon:Object.keys(A.MON)[0],mod:'swift',name:'Old Rival',lv:23,state:'active',text:'An old rival.',reward:{}},
    lumen:{id:'p_lumen',personal:'lumen',stage:0,mon:Object.keys(A.MON)[0],mod:'swift',name:'Older Rival',lv:22,state:'done',text:'Done long ago.',reward:{}}};
  o.fac={ctr:{forge:9,potion:12,manual:30},bonus:{guild:50,hand:20},acc:{g1:0},done:{},claim:{},seen:{guild:2,hand:2}};
  return JSON.stringify(o);});
await H0.browser.close();
const H=await open({w:430,h:880,mobile:true,pre:`localStorage.clear();localStorage.setItem('aurelis-wayfarers-v3',${JSON.stringify(raw)});`});const {ev}=H;
// Continue may wait for the save sync first (v0.8.5): wait until the journey is loaded instead of reading it in the same tick
await ev(()=>{__A.ACT.cont();});await H.until(()=>!!__A.G,null,{timeout:15000});
const r=await ev(()=>{const A=__A,o={};const G=A.G;o.loaded=!!G&&A.V.screen==='world';
  o.pm=G.personal.mira&&G.personal.mira.state;o.pl=G.personal.lumen&&G.personal.lumen.state;o.name=G.personal.mira.name;
  o.btM=A.btOf(G.roster.mira);o.btL=A.btOf(G.roster.lumen);o.btO=A.btOf(G.roster.oren);
  A.V.modal={type:'guild',tab:'personal'};A.render();const t=document.querySelector('#modal').innerText;o.roam=/Rival roaming/.test(t);o.done=/Done/.test(t);o.oren=/Oren/.test(t);
  o.sheet=A.mChar('mira',false).match(/Battles together:[^<]*/)[0];
  o.guildRep=A.facRep('guild');o.handRep=A.facRep('hand');
  A.V.modal={type:'menu',tab:'factions'};A.render();const g=document.querySelector('#modal').innerText;o.noFac=!/faction/i.test(g);o.hand=/steady hand guild/i.test(g);
  A.saveGame();const s=JSON.parse(localStorage.getItem('aurelis-wayfarers-v3'));o.keep=s.personal.mira.state==='active'&&s.personal.lumen.state==='done'&&!!s.fac&&s.fac.bonus.guild===50&&s.roster.mira.bt==null;
  A.V.modal=null;return o;});
console.log(JSON.stringify(r));
chk('the old save loads into the world',r.loaded===true);
chk('started and finished personal quests are untouched',r.pm==='active'&&r.pl==='done'&&r.name==='Old Rival');
chk('battle counts: estimate kept where none was saved, saved ones kept',r.btM===95&&r.btL===12&&r.btO===30);
chk('the Guild Hall still lists them (in the first realm) but no new quest for others',r.roam&&r.done&&!r.oren);
chk('the hero sheet says the quest is under way',/under way/.test(r.sheet));
chk('faction standing loads and reads as Guilds',r.guildRep>=50&&r.handRep>=20&&r.noFac&&r.hand);
chk('saving again keeps every old field as it was',r.keep===true);
await done(H);})();
