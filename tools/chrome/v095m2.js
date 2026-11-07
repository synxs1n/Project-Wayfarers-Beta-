// Beta v0.9.5 menus, item 2: three ranks per guild. Standing still climbs the six old steps (facRank, REP_AT, the claim keys and
// G.fac keep their shape); steps 1 / 2-4 / 5-6 show as ranks 1 / 2 / 3, one line each. No perk is lost: at every standing the new
// perks hold every old one, a save with old claims loads with them claimed, and a missing charm of a rank can still be claimed once.
// Missions count earlier progress (v0.7.7). Off in the Daily Trial.
// Usage: PWHTML=../../out/aurelis3.html node v095m2.js
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off'}}));`});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=5000;A.G.stage=1;A.G.cleared[0]=1;A.render();});
// ---- structure: three ranks with one line each
const st=await ev(()=>{const A=__A,T=A.TW.get('FAC3'),o={};o.ids=A.FAC.map(F=>F.id);o.three=A.FAC.every(F=>T[F.id]&&T[F.id].n.length===3&&T[F.id].t.length===3&&T[F.id].t.every(t=>t.length>10&&t.length<150&&!/\n/.test(t)));
  A.V.modal={type:'menu',tab:'factions'};A.render();o.cards=document.querySelectorAll('#modal .facc').length;o.rows=[...document.querySelectorAll('#modal .facc .facr')].map(r=>r.querySelectorAll('.row').length);
  o.txt=document.querySelector('#modal').innerText;A.V.modal=null;return o;});
chk('six guilds with three ranks and one line each',st.three&&st.ids.length===6||JSON.stringify(st));
chk('the Guilds tab shows a card per guild with three rank rows',st.cards===6&&st.rows.every(n=>n===3)||JSON.stringify(st.rows));
chk('no "faction" in the guild pages',!/faction/i.test(st.txt));
// ---- no lost perk: at every standing the new perk set holds the old one (old: every perk of steps up to the rank)
const np=await ev(()=>{const A=__A,G=A.G,R=A.TW.get('REP_AT'),f=A.facInit(),bad=[],o={};const reps=[];R.forEach(r=>{reps.push(r,r+1);if(r>0)reps.push(r-1);});reps.push(1000);
  for(const F of A.FAC){for(const rep of reps){f.bonus[F.id]=0;const raw=A.facRep(F.id);f.bonus[F.id]=Math.max(0,rep-raw);A.TW.get('facDirty')();const step=A.facRank(F.id);
    const old=F.perks.filter((p,i)=>p&&i+1<=step),now=A.TW.get('facPerks')(F.id,step);
    old.forEach(p=>{if(!now.includes(p))bad.push(F.id+'@'+rep+':'+p.t);});
    // the numbers the game uses: the best of each kind is never lower
    ['xp','gold','inn','forge','rebate'].forEach(k=>{const b=a=>a.filter(p=>p.k===k).reduce((s,p)=>Math.max(s,p.v||0),0);if(b(now)<b(old))bad.push(F.id+'@'+rep+':'+k);});}
    f.bonus[F.id]=0;}
  A.TW.get('facDirty')();o.bad=bad;o.map=[1,2,3,4,5,6].map(s=>A.TW.get('facTierOf')(s)).join('');return o;});
chk('steps map to ranks 1,2,2,2,3,3',np.map==='122233'||np.map);
chk('no perk lost at any standing (and no number lower)',np.bad.length===0||np.bad.slice(0,6).join(' | '));
// ---- an old save: claims under the old keys, standing at old steps; G.fac keeps its shape
const os=await ev(()=>{const A=__A,G=A.G,o={};A.saveGame();const raw=JSON.parse(localStorage.getItem('aurelis-wayfarers-v3'));
  // as v0.9.4 left it: Smiths at old step 5 (400+) with the step 5 charm claimed, the guild at step 4 with the recruit claimed, Alchemists at step 2
  const fac={ctr:{forge:0,temper:0},bonus:{smiths:420,guild:240,alch:45},acc:{},done:{},claim:{'smiths:5':1,'guild:4':1},seen:{smiths:5,guild:4,alch:2,wardens:1,archive:1,hand:1}};
  raw.fac=fac;raw.gear=(raw.gear||[]).concat(['c_fa1']);localStorage.setItem('aurelis-wayfarers-v3',JSON.stringify(raw));
  A.TW.get('svLoad')(A.META.slot||0);const f=A.G.fac;o.keys=Object.keys(f).sort().join();o.steps=['smiths','guild','alch'].map(id=>A.facRank(id)).join();o.ranks=['smiths','guild','alch'].map(id=>A.TW.get('facTier')(id)).join();
  o.disc=A.TW.get('facSmithDisc')();o.reb=A.TW.get('facSmithRebate')();o.inn=A.TW.get('facSumAll')('inn');
  A.V.modal={type:'menu',tab:'factions'};A.render();
  const card=id=>[...document.querySelectorAll('#modal .facc')].find(c=>c.textContent.includes(A.FACB[id].n));
  o.sm=card('smiths').innerText.replace(/\n+/g,' | ');o.gu=card('guild').innerText.replace(/\n+/g,' | ');
  o.smClaim=[...card('smiths').querySelectorAll('[data-act="facPerk"]')].map(b=>b.dataset.arg);o.guClaim=card('guild').querySelectorAll('[data-act="facPerk"]').length;
  const n0=A.G.gear.filter(x=>x==='c_fa1').length;A.ACT.facPerk(o.smClaim[0]);o.fb1=A.G.gear.filter(x=>x==='c_fb1').length;o.fa1=A.G.gear.filter(x=>x==='c_fa1').length-n0;
  A.ACT.facPerk('smiths:5');A.ACT.facPerk('smiths:6');o.fb1b=A.G.gear.filter(x=>x==='c_fb1').length;o.claim=JSON.stringify(A.G.fac.claim);
  const r0=Object.keys(A.G.roster).length;A.ACT.facPerk('guild:4');o.recruitAgain=Object.keys(A.G.roster).length-r0;
  A.saveGame();o.savedKeys=Object.keys(JSON.parse(localStorage.getItem('aurelis-wayfarers-v3')).fac).sort().join();A.V.modal=null;return o;});
console.log(JSON.stringify(os));
chk('old save loads with the same G.fac fields',os.keys==='acc,bonus,claim,ctr,done,seen'&&os.savedKeys===os.keys||JSON.stringify(os));
chk('old steps 5, 4, 2 show as ranks 3, 2, 2',os.steps==='5,4,2'&&os.ranks==='3,2,2'||JSON.stringify(os));
chk('perks of the old steps stay active (tempering 10% less, 10% back, inn 10% less)',os.disc===.1&&os.reb===.1&&os.inn>=.1||JSON.stringify(os));
chk('the claimed recruit stays claimed and cannot be claimed again',os.guClaim===0&&/Claimed/.test(os.gu)&&os.recruitAgain===0||JSON.stringify(os));
chk('rank 3 offers only the charm not yet claimed, once',JSON.stringify(os.smClaim)==='["smiths:6"]'&&os.fb1===1&&os.fa1===0&&os.fb1b===1&&/"smiths:6":1/.test(os.claim)||JSON.stringify(os));
// ---- a fresh climb: thresholds, the rank up toast, one Claim gives both charms, counter stock at rank 2
// v0.9.9: a journey without the realm gates (G.pcV, v0.9.6: new journeys open guild missions in the third realm), as this test was written
// for; the gates themselves are checked in v095p3.js
const cl=await ev(()=>{const A=__A,o={};A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;delete G.pcV;G.gold=9000;G.cleared[0]=1;G.stage=1;
  const f=A.facInit();A.facSync(true);o.r0=A.TW.get('facTier')('smiths');
  f.bonus.smiths=39;A.TW.get('facDirty')();o.r39=A.TW.get('facTier')('smiths');f.bonus.smiths=40;A.TW.get('facDirty')();o.r40=A.TW.get('facTier')('smiths');
  let t='';const t0=A.TW.get('toast');A.facSync();o.toast=document.getElementById('toast').textContent;
  f.bonus.smiths=399;A.TW.get('facDirty')();o.r399=A.TW.get('facTier')('smiths');f.bonus.smiths=400;A.TW.get('facDirty')();o.r400=A.TW.get('facTier')('smiths');
  const c0=G.mats.core||0;A.ACT.facBuy('smiths:0');o.core=(G.mats.core||0)-c0;
  const n0=G.gear.length;A.ACT.facPerk('smiths:6');o.got=G.gear.slice(n0).sort().join();A.ACT.facPerk('smiths:5');o.again=G.gear.length-n0;
  o.dbl=(()=>{f.bonus.alch=400;A.TW.get('facDirty')();return A.TW.get('facTier')('alch');})();
  // missions count what was done before accepting (v0.7.7)
  const m=A.FAC.flatMap(F=>A.facMissionList(F.id))[0];f.ctr[m.k]=(f.ctr[m.k]||0)+m.n;o.pre=A.facProg(m)===m.n;A.ACT.facAccept(m.id);o.post=A.facProg(m)===m.n;
  const wasD=G.daily;G.daily=true;o.daily=JSON.stringify(A.facMul());G.daily=wasD;return o;});
console.log(JSON.stringify(cl));
chk('rank 2 at 40 standing, rank 3 at 400',cl.r0===1&&cl.r39===1&&cl.r40===2&&cl.r399===2&&cl.r400===3||JSON.stringify(cl));
chk('the rank up toast names the rank and its line',/rank 2, Journeyman! Tempering 10% less/.test(cl.toast)||cl.toast);
chk('one Claim at rank 3 gives both charms, once',cl.got==='c_fa1,c_fb1'&&cl.again===2||JSON.stringify(cl));
chk('counter stock sells from rank 2',cl.core===1||JSON.stringify(cl));
chk('missions count progress made before accepting',cl.pre&&cl.post||JSON.stringify(cl));
chk('Daily Trial: no guild bonuses',cl.daily===JSON.stringify({xp:1,gold:1})||cl.daily);
await done(H);})();
