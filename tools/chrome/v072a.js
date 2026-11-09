// Beta v0.7.2 pacing spread (v0.9.5: checked on a journey started before v0.9.5; new journeys open guild missions in the third realm, v095p3.js): guild missions and Tempering open after the first Scourge falls (Tempering stays open on a journey that
// already has tempered gear), the Tamer's Stick quest is on the second realm's board, personal quests open in the third realm (v050p4).
const {open,chk,done}=require('./pw');
(async()=>{const h=await open();const {ev,wait}=h;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.hints=false;});await wait(300);
const r=await ev(()=>{const A=__A,G=A.G,o={},WSm=A.TW.get('WS').m;/* v0.10.6+: a town's Notice Board shows its own realm's notices (g7OnBoard), so the second realm's board is read standing in its town (WSm.s=1) */delete G.pcV;// v0.9.5: a journey from before v0.9.5 (no pcV) keeps these v0.7.2 gates; new journeys use the realm gates (v095p3.js)
  G.stage=0;G.cleared=[false,false,false,false,false];
  const ids=A.FAC.map(F=>F.id);o.mis0=ids.reduce((n,id)=>n+A.facMissionList(id).length,0);
  A.V.modal={type:'smithy',tab:'forge'};A.render();o.temp0=/once the first Scourge falls/.test(document.querySelector('#modal').innerText);
  for(let s=0;s<=1;s++)A.genQuests(s);const q=G.quests.find(q=>q.id==='tamer');o.tamerStage=q&&q.stage;
  A.V.modal={type:'board'};A.render();o.tamerBoard0=/Tamer's Stick/.test(document.querySelector('#modal').innerText);WSm.s=1;
  G.cleared[0]=true;G.stage=1;o.mis1=ids.reduce((n,id)=>n+A.facMissionList(id).length,0);
  A.V.modal={type:'smithy',tab:'forge'};A.render();o.temp1=!/once the first Scourge falls/.test(document.querySelector('#modal').innerText);
  WSm.s=1;A.V.modal={type:'board'};A.render();o.tamerBoard1=/Tamer's Stick/.test(document.querySelector('#modal').innerText);WSm.s=0;
  G.stage=0;G.cleared[0]=false;const c=Object.values(G.roster)[0];const w=c.eq.w;c.eq.w=w?String(w).replace(/\+\d$/,'')+'+1':w;A.V.modal={type:'smithy',tab:'forge'};A.render();o.tempOld=!w||!/once the first Scourge falls/.test(document.querySelector('#modal').innerText);c.eq.w=w;
  A.V.modal=null;return o;});
console.log(JSON.stringify(r));
chk('realm 1: no guild missions offered',r.mis0===0);
chk('after the first Scourge: missions offered',r.mis1>0);
chk('realm 1: Tempering says it opens after the first Scourge',r.temp0===true);
chk('after the first Scourge: Tempering works',r.temp1===true);
chk('a journey that already has tempered gear keeps Tempering',r.tempOld===true);
chk("the Tamer's Stick quest sits on the second realm's board",r.tamerStage===1&&!r.tamerBoard0&&r.tamerBoard1);
await done(h);})();
