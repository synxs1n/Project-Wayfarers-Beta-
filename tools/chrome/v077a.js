// Beta v0.7.7: guild missions count what was done before they were accepted; detonator hints are symbols; no blue tap flash.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.cleared=[1,1,0,0,0];A.G.stage=2;});
// v0.9.9: a new journey opens guild missions in the third realm since v0.9.5 (pacing.js PACE.at.guilds): the journey stands in realm 3;
// since 0.10.6 the missions are on the Guild Hall's Guilds tab, and (hand-in rule) a mission accepted now is handed in at a Guild Hall
const r=await ev(()=>{const A=__A,G=A.G,f=A.facInit(),o={};const m=A.FMIS.find(x=>A.facMissionList(x.f).includes(x));if(!m)return {none:1};
  f.ctr[m.k]=(f.ctr[m.k]||0)+m.n+2;o.before=A.facProg(m);o.n=m.n;A.ACT.facAccept(m.id);o.after=A.facProg(m);
  o.at=window.__P95.PACE.at.guilds;A.V.modal={type:'guild',tab:'guilds'};A.render();o.claim=!!document.querySelector(`#modal [data-act="facClaim"][data-arg="${m.id}"]`);A.V.modal=null;return o;});
chk('the journey stands where guild missions are open',r.at===2||JSON.stringify(r));
chk('progress done before accepting counts (shown before and after accepting)',r.before===r.n&&r.after===r.n||JSON.stringify(r));
chk('a mission already done can be claimed right after accepting',r.claim===true||JSON.stringify(r));
// guild ranks: five per guild over the six standing steps (nothing lost: rank is recomputed from standing), one perk line each
const rk=await ev(()=>{const A=__A,G=A.G,T=A.TW,o={};const F3=T.get('FAC3'),tOf=T.get('facTierOf');
  o.five=A.FAC.every(F=>F3[F.id].n.length===5&&F3[F.id].t.length===5);o.map=[1,2,3,4,5,6].map(tOf).join();
  const f=A.facInit();A.FAC.forEach(F=>{f.bonus[F.id]=0;});const out=[];
  [0,40,110,230,400,640].forEach(v=>{A.FAC.forEach(F=>{f.bonus[F.id]=v-T.get('facRaw')(F.id);});A.TW.get('facDirty')();out.push(A.FAC.map(F=>T.get('facTier')(F.id)).join(''));});
  o.tiers=out.join('|');A.V.modal={type:'guild',tab:'guilds'};A.render();o.rows=document.querySelectorAll('#modal .facc')[0].querySelectorAll('.facr .row').length;
  A.FAC.forEach(F=>{f.bonus[F.id]=0;});A.TW.get('facDirty')();A.V.modal=null;return o;});
chk('every guild has five ranks with a perk line each',rk.five===true||JSON.stringify(rk));
chk('the six standing steps fold into five ranks (steps 5 and 6 are the top rank)',rk.map==='1,2,3,4,5,5'||JSON.stringify(rk));
chk('rank follows standing 0, 40, 110, 230, 400, 640 as 1,2,3,4,5,5',rk.tiers==='111111|222222|333333|444444|555555|555555'||JSON.stringify(rk));
chk('the Guild Hall lists five rank rows per guild',rk.rows===5||JSON.stringify(rk));
// hand-in: a mission accepted now is handed in at a Guild Hall; one from an older save (no hand flag) still claims anywhere
const hi=await ev(()=>{const A=__A,G=A.G,f=A.facInit(),o={};const m=A.FMIS.find(x=>A.facMissionList(x.f).includes(x)&&f.acc[x.id]==null);if(!m)return {none:1};
  f.ctr[m.k]=(f.ctr[m.k]||0)+m.n+2;A.ACT.facAccept(m.id);o.flag=f.hand[m.id];
  A.V.modal={type:'menu',tab:'factions'};A.render();const away=document.querySelector(`#modal [data-act="facClaim"][data-arg="${m.id}"]`);o.awayBtn=!!away;o.awayNote=/Hand in at any Guild Hall/.test(document.querySelector('#modal').innerText);
  A.ACT.facClaim(m.id);o.awayDone=!!f.done[m.id];
  A.V.modal={type:'guild',tab:'guilds'};A.render();o.hallBtn=!!document.querySelector(`#modal [data-act="facClaim"][data-arg="${m.id}"]`);A.ACT.facClaim(m.id);o.hallDone=!!f.done[m.id];
  const m2=A.FMIS.find(x=>A.facMissionList(x.f).includes(x)&&f.acc[x.id]==null&&x.id!==m.id);if(m2){f.ctr[m2.k]=(f.ctr[m2.k]||0)+m2.n+2;A.ACT.facAccept(m2.id);delete f.hand[m2.id];A.V.modal=null;A.ACT.facClaim(m2.id);o.oldDone=!!f.done[m2.id];}
  A.V.modal=null;return o;});
chk('a mission accepted now is marked for hand-in at a Guild Hall',hi.flag==='guild'||JSON.stringify(hi));
chk('away from a Guild Hall the Claim button is off with a note, and claiming does nothing',hi.awayBtn===false&&hi.awayNote===true&&hi.awayDone===false||JSON.stringify(hi));
chk('at the Guild Hall the mission can be claimed',hi.hallBtn===true&&hi.hallDone===true||JSON.stringify(hi));
chk('a mission from an older save (no hand flag) still claims anywhere',hi.oldDone===true||JSON.stringify(hi));
const t=await ev(()=>{const c=document.querySelector('canvas')||document.body;return getComputedStyle(document.body).webkitTapHighlightColor||getComputedStyle(c).webkitTapHighlightColor;});
chk('no tap highlight colour (Android blue flash)',/rgba\(0, 0, 0, 0\)|transparent/.test(t)||t);
await done(H);})();
