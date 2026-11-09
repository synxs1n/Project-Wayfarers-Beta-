// v0.11.9: hand in where you took it (handin9.js): board quests and bounties claim at their realm's Notice Board, bounty rewards wait at
// the board, old (unflagged) quests claim anywhere, active quest targets are marked on the field before their tile is seen.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1280,h:800});const r=await H.ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=g('G');const o={};
 g('genQuests')(0);const q=G.quests.find(x=>x.stage===0&&x.type==='hunt'&&x.state==='open')||G.quests.find(x=>x.stage===0&&x.state==='open'&&!['legend','guild','arena','tamer'].includes(x.type));o.q=q&&q.type;
 A.ACT.qAccept(q.id);o.hand=q.hand;if(q.type==='hunt')q.have=q.n;else if(q.type==='gather')G.mats[q.mat]=(G.mats[q.mat]||0)+q.n;else if(q.type==='wanderer')q.found=1;o.ready=g('questReady')(q);
 // from the menu (anywhere): blocked
 A.V.modal={type:'menu',tab:'quests'};const gold0=G.gold;A.ACT.qClaim(q.id);o.menuBlocked=q.state==='active';
 // in town board of stage 0
 A.V.modal={type:'board',tab:'quests'};const f=g('getMap')('t0');const bs=g('boardState')();o.boardState=bs;A.ACT.qClaim(q.id);o.boardClaimed=q.state==='claimed';o.goldUp=G.gold>gold0;
 // bounty: accept, mark ready, claim at wrong town then right town
 g('genBounties')(0);const b=G.bounties.find(x=>x.stage===0);A.ACT.bounty(b.id);o.bhand=b.hand;b.state='ready';
 A.V.modal={type:'menu',tab:'qbounty'};A.ACT.bountyClaim(b.id);o.bMenuBlocked=b.state==='ready';
 const secs=g('nbSecs')('bounties').map(x=>x[0]);o.secs=secs;const html=g('nbBounties')('all');o.rowReady=/Ready to hand in/.test(html)&&/bountyClaim/.test(html);
 A.V.modal={type:'board',tab:'bounties'};const g1=G.gold;A.ACT.bountyClaim(b.id);o.bClaimed=b.state==='done'&&G.gold>g1;
 // far markers on the field for an active bounty
 g('genBounties')(0);const b2=G.bounties.find(x=>x.stage===0&&x.state==='open');if(b2){A.ACT.bounty(b2.id);}const fm=g('getMap')('f0');const mk=g('mapMarks')(fm).filter(x=>x.k==='quest'||x.k==='questghost');o.farMarks=mk.length;o.far=mk.some(x=>x.far);
 // old save style quest without hand claims anywhere
 const q2={id:'zz',stage:0,type:'hunt',state:'active',n:1,have:1,title:'old',desc:'',reward:{gold:10}};G.quests.push(q2);A.V.modal={type:'menu'};A.ACT.qClaim('zz');o.oldAnywhere=q2.state==='claimed';
 return o;});console.log(JSON.stringify(r));
  chk('an accepted board quest carries hand:board',r.hand==='board');
  chk('a ready board quest cannot be claimed from the Menu away from its board',r.menuBlocked===true);
  chk('its town board shows ready and claims it',r.boardState==='ready'&&r.boardClaimed&&r.goldUp);
  chk('an accepted bounty carries hand:board; a beaten one waits (ready) and cannot be claimed from the Menu',r.bhand==='board'&&r.bMenuBlocked===true);
  chk('the Bounties tab gets a Ready section with Claim rows',r.secs.includes('ready')&&r.rowReady);
  chk('the right board pays the bounty',r.bClaimed===true);
  chk('an active bounty beast is marked on the field before its tile is seen',r.farMarks>=1&&r.far===true);
  chk('a quest from an older save (no hand flag) still claims anywhere',r.oldAnywhere===true);
  await done(H);})();
