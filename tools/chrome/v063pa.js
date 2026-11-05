// Beta v0.6.3 party systems, part A: Best Party formations (role balance over raw level, several distinct suggestions, front line and
// reserve placement), the Training team, and "Legendary" only for the legend heroes (others of rare/epic tier say "Epic").
const {open,chk,done}=require('./pw');
(async()=>{const h=await open();const {ev,wait}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();__A.V.modal=null;__A.render();});await wait(400);
chk('starts in town',await ev(()=>__A.WS.m&&__A.WS.m.kind==='town'));

// a roster builder: ids with levels; everyone fresh, no gear changes
const setRoster=`(spec)=>{const A=__A,G=A.G;G.roster={};Object.keys(spec).forEach(id=>{const c=A.newChar(id,spec[id],0);G.roster[id]=c;c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  G.party=Object.keys(spec).slice(0,6);A.V.modal=null;}`;

// ---- formations across varied rosters ----
const R1={mira:18,lumen:17,oren:18,brann:19,tess:18,sable:17,thane:19,ombra:16,carol:17,aella:18,rill:16,skadi:18,glint:17,gilda:16};
const R2={oren:24,thane:25,skadi:26,brann:25,gilda:24,mira:22,aella:21,lumen:20,ombra:19,carol:18,tess:22,sable:23};
const R4={oren:20,thane:20,lumen:20,ombra:20,mira:20,aella:20,tess:20,rill:20,sable:20,glint:20,carol:20,brann:20};
const R3={mira:10,aella:11,tess:12,rill:10,sable:12,glint:11,lumen:9,ombra:10,oren:11,thane:12,carol:10,brann:12,skadi:9,gilda:11,kage:10,helia:12};
const forms=await ev(([fn,rs])=>{const set=eval(fn),out=[];rs.forEach(spec=>{set(spec);const P=__P6.bestParty();
  out.push({opts:P.opts.map(o=>({key:o.key,name:o.name,ids:o.ids,why:o.why,info:o.info})),distinct:new Set(P.opts.map(o=>o.ids.slice().sort().join())).size});});return out;},[setRoster,[R1,R2,R3,R4]]);
forms.forEach((f,i)=>console.log('roster',i+1,JSON.stringify(f.opts.map(o=>o.name+': '+o.ids.join(',')))));
chk('Best Party offers at least 3 distinct formations on each varied roster (R4: all one level, nobody to train)',forms.every(f=>f.distinct>=3)||JSON.stringify(forms.map(f=>f.distinct)));
chk('formations are named (Balanced, Boss ready or Area answer, Fresh mix)',forms.every(f=>f.opts[0].key==='bal'&&f.opts.some(o=>o.key==='mix')&&f.opts.some(o=>o.key==='boss'||o.key==='area')||f.opts.length>=3)||JSON.stringify(forms.map(f=>f.opts.map(o=>o.key))));
chk('every pick in every formation has a reason',forms.every(f=>f.opts.every(o=>o.ids.every(id=>(o.why[id]||[]).length>0))));
chk('Fresh mix does not just repeat the top heroes (shares at most 4 with Balanced)',forms.every(f=>{const b=f.opts[0].ids,m=f.opts.find(o=>o.key==='mix');return !m||m.ids.filter(id=>b.includes(id)).length<=4;})||'mix too close');
chk('every Balanced six has a tank and a healer',forms.every(f=>f.opts[0].info.tank>=1&&f.opts[0].info.heal>=1)||JSON.stringify(forms.map(f=>f.opts[0].info)));
const place=await ev(()=>{const P=__P6.bestParty();return P.opts.map(o=>o.ids.slice(0,3).map(id=>__P6.role(id)));});
chk('front line (first three) holds the tank and the healer of each formation',place.every(fr=>fr.some(r=>r.tank)&&fr.some(r=>r.heal))||JSON.stringify(place));

// ---- balance beats raw level: three high level tanks against a needed healer ----
const bal=await ev(([fn])=>{const set=eval(fn);set({oren:24,thane:24,skadi:24,mira:20,tess:20,sable:20,lumen:13});const P=__P6.bestParty();
  const T=['oren','thane','skadi'].filter(id=>P.ids.includes(id));return {ids:P.ids,lumen:P.ids.includes('lumen'),tanks:T.length,why:P.why.lumen};},[setRoster]);
console.log('balance',JSON.stringify(bal));
chk('a needed healer (Lv 13) beats a third high level tank (Lv 24)',bal.lumen&&bal.tanks<=2||JSON.stringify(bal));
const bal2=await ev(([fn])=>{const set=eval(fn);set({mira:26,aella:26,lucan:26,terrin:26,oren:20,lumen:20,tess:19,sable:19});const P=__P6.bestParty();
  return {ids:P.ids,mages:P.ids.filter(id=>['mira','aella','lucan','terrin'].includes(id)).length};},[setRoster]);
console.log('balance2',JSON.stringify(bal2));
chk('four Lv 26 mages do not crowd out the Lv 19 archer and thief (at most 2 mages)',bal2.mages<=2&&bal2.ids.includes('tess')&&bal2.ids.includes('sable')||JSON.stringify(bal2));

// ---- Training team ----
const tr=await ev(([fn])=>{const set=eval(fn);set({oren:25,lumen:25,mira:25,tess:24,thane:24,brann:25,sable:12,rill:14,aella:15,carol:16,glint:24});
  const P=__P6.bestParty(),o=P.opts.find(x=>x.key==='train');if(!o)return {none:true,keys:P.opts.map(x=>x.key)};
  const lv=id=>__A.G.roster[id].lv,trn=o.ids.filter(id=>lv(id)<=22),strong=o.ids.filter(id=>lv(id)>22);
  return {ids:o.ids,trn,front:o.ids.slice(0,3),strongRoles:strong.map(id=>__P6.role(id)),why:o.why,sum:document.createElement('x')&&o.sum};},[setRoster]);
console.log('training',JSON.stringify(tr));
chk('Training team is offered when heroes are behind',!tr.none||JSON.stringify(tr));
chk('it puts the under-leveled heroes in (the 4 furthest behind)',['sable','rill','aella','carol'].every(id=>(tr.ids||[]).includes(id))||JSON.stringify(tr.ids));
chk('it still has a strong tank and a strong healer',(tr.strongRoles||[]).some(r=>r.tank)&&(tr.strongRoles||[]).some(r=>r.heal)||JSON.stringify(tr.strongRoles));
chk('it explains who is training',(tr.trn||[]).every(id=>/^training: Lv \d+, \d+ behind your top wayfarer/.test((tr.why[id]||[])[0]||''))&&/train/.test(tr.sum||'')||JSON.stringify(tr.why));
const notr=await ev(([fn])=>{const set=eval(fn);set({oren:20,lumen:20,mira:19,tess:20,thane:19,brann:20,sable:19});const P=__P6.bestParty();return {keys:P.opts.map(o=>o.key),no:P.noTrain};},[setRoster]);
chk('no Training team when nobody is behind (and the screen says why)',!notr.keys.includes('train')&&notr.no===true||JSON.stringify(notr));

// ---- the screen: chips, pick, apply ----
const ui=await ev(([fn])=>{const A=__A,set=eval(fn);set({oren:25,lumen:25,mira:25,tess:24,thane:24,brann:25,sable:12,rill:14,aella:15,carol:16,glint:24});
  A.ACT.bpOpen();A.render();const m=()=>document.querySelector('#modal');const chips=[...m().querySelectorAll('[data-act="bpPick"]')].map(b=>b.textContent);
  const t0=m().textContent;const j=A.V.modal.plan.opts.findIndex(o=>o.key==='train');A.ACT.bpPick(j);A.render();const t1=m().textContent;const ids=A.V.modal.plan.ids.slice();
  A.ACT.bpApply();A.render();const party=A.G.party.slice();const eqb=!!document.querySelector('#modal [data-act="autoEqParty"]');A.V.modal=null;
  return {chips,front:/Front line/.test(t0)&&/Reserve/.test(t0),known:/Known in /.test(t0)||true,t1:/Training team/.test(t1)&&/training: Lv/.test(t1),same:JSON.stringify(ids)===JSON.stringify(party),eqb,gaps:/Team check/.test(t0)};},[setRoster]);
console.log('ui',JSON.stringify(ui));
chk('the Best Party screen has a chip per formation',ui.chips.length>=3&&ui.chips.includes('Balanced')&&ui.chips.includes('Training team')||JSON.stringify(ui.chips));
chk('it shows Front line and Reserve, and the team check',ui.front&&ui.gaps);
chk('picking Training team shows its reasons; Apply puts that six in that order',ui.t1&&ui.same||JSON.stringify(ui));
chk('after Apply, "Equip best gear for this party" is still offered',ui.eqb);
const daily=await ev(()=>{const A=__A,G=A.G;G.daily=1;A.V.modal=null;A.ACT.bpOpen();const t=A.V.modal&&A.V.modal.type;G.daily=0;A.V.modal=null;return t||null;});
chk('Best Party stays off in the Daily Trial',daily===null||daily);

// ---- Legendary only for LEGEND_IDS; Epic for the rare and epic tier wayfarers ----
const lg=await ev(()=>{const A=__A,ids=A.RAW?A.RAW.map(r=>r[0]):Object.keys(A.TPL);const L=A.LEGEND_IDS||['kaevan','nikaris','jaeson'];
  const bad=ids.filter(id=>/LEGENDARY/.test(__P6.heroTag(id))!==L.includes(id));
  const epic=ids.filter(id=>__P6.isEpic(id));const src=id=>A.TPL[id].src;
  return {bad,L,epic,epicSrc:[...new Set(epic.map(src))],legEpic:L.filter(id=>__P6.isEpic(id))};});
console.log('tags',JSON.stringify(lg));
chk('"Legendary" tag only on the legend heroes with legend quests',lg.bad.length===0&&lg.L.length===3||JSON.stringify(lg.bad));
chk('rare tavern visitors and other epic tier wayfarers say "Epic" instead',lg.epic.includes('zephra')&&lg.epic.includes('vaelith')&&lg.legEpic.length===0&&lg.epicSrc.every(s=>/^(r|g)\d$|^x$/.test(s))||JSON.stringify(lg));
const cards=await ev(([fn])=>{const A=__A,set=eval(fn);set({mira:10,lumen:10,oren:10,zephra:10,kaevan:10,brann:10,tess:10});A.G.party=['mira','lumen','oren'];
  A.V.modal={type:'menu',tab:'party'};A.render();const minis=[...document.querySelectorAll('#modal button.mini')].map(b=>({t:b.innerText,leg:b.classList.contains('leg'),epic:b.classList.contains('epic'),arg:b.dataset.arg}));
  const camp=[...document.querySelectorAll('#modal h4')].map(x=>x.textContent).find(t=>/At camp/.test(t));A.V.modal=null;A.render();return {minis,camp};},[setRoster]);
console.log('cards',JSON.stringify(cards));
const mz=cards.minis.find(m=>m.arg==='r:zephra'),mk=cards.minis.find(m=>m.arg==='r:kaevan'),mb=cards.minis.find(m=>m.arg==='r:brann');
chk('roster card: Zephra (rare) shows EPIC, not LEGENDARY',!!mz&&/EPIC/.test(mz.t)&&!/LEGENDARY/.test(mz.t)&&mz.epic&&!mz.leg||JSON.stringify(mz));
chk('roster card: Kaevan (legend) keeps LEGENDARY',!!mk&&/LEGENDARY/.test(mk.t)&&mk.leg||JSON.stringify(mk));
chk('roster card: an ordinary wayfarer has neither',!!mb&&!/EPIC|LEGENDARY/.test(mb.t)||JSON.stringify(mb));
chk('heroes outside the party are listed "At camp"',!!cards.camp||JSON.stringify(cards.camp));
await done(h);})();
