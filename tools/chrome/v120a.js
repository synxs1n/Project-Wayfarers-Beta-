// v0.12.0 bonds9.js: 34 bond pairs, camp/inn/after-battle scenes, the Bonds screen.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1280,h:800});const r=await H.ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=g('G');const o={};
 o.pairs=g('BONDS').length;const bk=g('bondKey');o.dupes=g('BONDS').length-new Set(g('BONDS').map(b=>bk(b.a,b.b))).size;
 o.allHaveTech=g('BONDS').every(b=>b.tech&&b.tech.n&&b.talk&&b.talk.length);o.bossScenes=g('BONDS').filter(b=>b.talkBoss).length;
 // recruit a new pair and level their bond
 g('recruit')('zia',true);g('recruit')('thane',true);G.party=['mira','lumen','oren','zia','thane'];const k=bk('zia','thane');G.bonds[k]=12;o.lv=g('bondLv')('zia','thane');
 o.scenes=g('bondScenes')(g('BONDMAP')[k]).map(s=>s.n+(s.ctx?'('+s.ctx+')':'')+s.lv).join(',');
 const n=g('ctxOffer')('camp',g('pairsIn')(G.party));o.offered=n;o.talk=(G.talks||[]).find(t=>t.ctx==='camp');o.ready=g('readyTalks')().map(t=>t.arg);
 const n2=g('ctxOffer')('camp',g('pairsIn')(G.party));o.offeredAgain=n2;
 const html=g('vBonds')();o.screen=/Zia and Thane/.test(html)&&/Camp talk/.test(html)&&/Level 2 at/.test(html)===false&&/Level 3 at/.test(html);
 A.ACT.bondTalk(o.ready[0]);o.modal=A.V.modal&&A.V.modal.type;o.lines=A.V.modal&&A.V.modal.lines&&A.V.modal.lines.length;o.talksLeft=(G.talks||[]).length;
 return o;});console.log(JSON.stringify(r));
  chk('34 bond pairs, no duplicates, every pair has a tech and a campfire talk',r.pairs===34&&r.dupes===0&&r.allHaveTech||JSON.stringify([r.pairs,r.dupes,r.allHaveTech]));
  chk('every pair has an after-the-battle talk',r.bossScenes===34||r.bossScenes);
  chk('a level 2 pair has camp and inn talks; the after-the-battle talk waits for level 3',r.lv===2&&/Camp talk\(camp\)2/.test(r.scenes)&&/After the battle\(boss\)3/.test(r.scenes));
  chk('making camp offers the camp talk once; it shows in readyTalks with its context',r.offered===1&&r.offeredAgain===0&&r.ready[0]&&/:2:camp$/.test(r.ready[0]));
  chk('the Bonds screen lists the pair, its scenes and the next unlock',r.screen===true);
  chk('watching the camp talk opens the talk and clears it',r.modal==='talk'&&r.lines>=2&&r.talksLeft===0);
  await done(H);})();
