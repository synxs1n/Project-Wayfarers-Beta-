// Beta v0.7.1 small fixes: "Vanguard" for the party's front three; much bigger catch up for heroes far behind; the Best Party
// "Equip best gear for this party" button turns into a done note once used; quest lists put claimable first, then active;
// Auto and Run are remembered across launches (META.cfg.autoOn / runOn).
const {open,chk,done}=require('./pw');
(async()=>{const h=await open({pre:"if(!sessionStorage.k){localStorage.clear();sessionStorage.k=1;}"});const {ev,wait,page}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();__A.V.modal=null;__A.META.cfg.hints=false;__A.render();});await wait(400);
const setRoster=`(spec)=>{const A=__A,G=A.G;G.roster={};Object.keys(spec).forEach(id=>{const c=A.newChar(id,spec[id],0);G.roster[id]=c;c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  G.party=Object.keys(spec).slice(0,6);A.V.modal=null;}`;
// Best Party equip button
const eq=await ev(([fn])=>{const A=__A,set=eval(fn);A.B=null;A.V.modal=null;set({oren:25,lumen:25,mira:25,tess:24,thane:24,brann:25,sable:12,rill:14});A.render();
  A.ACT.bpOpen();A.render();A.ACT.bpApply();A.render();const before=!!document.querySelector('#modal [data-act="autoEqParty"]');const ld=A.V.modal;
  A.ACT.autoEqParty();A.render();A.V.modal=ld;A.render();const after=!!document.querySelector('#modal [data-act="autoEqParty"]'),note=!!document.querySelector('#modal .p3eqb.done');return {before,after,note};},[setRoster]);
chk('Best Party offers Equip best gear, then shows it as done instead of the button',eq.before&&!eq.after&&eq.note||JSON.stringify(eq));
// catch up curve
const cu=await ev(()=>{const x=__A.xpCatchMul;return [1,2,5,8,10,15].map(g=>+x(20-g,20,true).toFixed(2)).concat([+x(15,20,false).toFixed(3)]);});
chk('catch up grows fast with the gap: 1:+17%, 2:+38%, 5:+125%, 8:+248%, 10+: +300% cap, rearguard the same',JSON.stringify(cu)==='[1.17,1.38,2.25,3.48,4,4,2.25]'||JSON.stringify(cu));
// Vanguard wording
const vg=await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'party'};A.render();const t=document.querySelector('#modal').textContent;A.V.modal=null;
  A.startBattle({stage:0,kind:'field',weather:'clear'});A.render();const b=(document.getElementById('bparty')||{}).textContent||'';return {menu:/Vanguard/.test(t)&&/Rearguard/.test(t)&&!/Front line/.test(t),battle:/Vanguard/.test(b)};});
chk('Party menu and battle say Vanguard and Rearguard',vg.menu&&vg.battle||JSON.stringify(vg));
// v0.7.2: the Rearguard earns the same battle XP as the Vanguard
const rx=await ev(()=>{const A=__A,G=A.G;A.V.modal=null;G.roster={};['mira','lumen','oren','brann'].forEach(id=>{const c=A.newChar(id,8,0);c.S=A.calcStats(c);c.hp=c.S.mhp;G.roster[id]=c;});
  G.party=['mira','lumen','oren','brann'];A.startBattle({stage:0,kind:'field',weather:'clear'});const tot=c=>c.lv*1e6+(c.xp||0);
  const x0={};Object.values(G.roster).forEach(c=>x0[c.id]=tot(c));A.B.en.forEach(e=>e.hp=0);A.win();const g={};Object.values(G.roster).forEach(c=>g[c.id]=tot(c)-x0[c.id]);A.V.modal=null;A.B=null;return g;});
chk('Rearguard hero (same level) gains the same XP as the Vanguard',rx.mira>0&&rx.brann===rx.mira||JSON.stringify(rx));
// quest ordering on the board: ready, active, open, done
const qo=await ev(()=>{const A=__A,G=A.G;A.V.modal={type:'board',sec:'all'};A.render();const Q=G.quests.filter(q=>q.stage<=G.stage);
  if(Q.length<3)return {few:Q.length};Q[Q.length-1].state='active';Q[Q.length-2].state='active';const rq=Q[Q.length-2];rq.type='hunt';rq.n=1;rq.have=1;
  A.render();const rows=[...document.querySelectorAll('#modal .row')].map(r=>r.querySelector('[data-act="qClaim"]')?'R':/Active/.test(r.textContent)&&!r.querySelector('[data-act="qAccept"]')?'A':r.querySelector('[data-act="qAccept"]')?'O':'D');
  A.V.modal=null;return {rows:rows.join('')};});
chk('quest board: claimable first, then active, then open',/^R+A+O*D*$/.test(qo.rows||'')||JSON.stringify(qo));
// Auto and Run remembered across a reload
await ev(()=>{const A=__A;A.B=null;A.V.modal=null;if(!A.V.auto)A.ACT.auto();if(!A.WS.run)A.ACT.runT();A.saveGame();});
await page.reload({waitUntil:'load'});await wait(800);
const rem=await ev(()=>({auto:!!__A.V.auto,run:!!__A.WS.run,cfg:[__A.META.cfg.autoOn,__A.META.cfg.runOn]}));
chk('Auto and Run are remembered after a reload',rem.auto&&rem.run||JSON.stringify(rem));
await done(h);})();
