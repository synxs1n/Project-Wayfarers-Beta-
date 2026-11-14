// Beta v0.6.3 party systems, part B: XP catch up measured against the highest level on the whole roster (heroes at camp count),
// and "Equip best: reserves" (heroes outside the party get spare gear only; the party's gear and companions are never touched; Undo).
const {open,chk,done}=require('./pw');
(async()=>{const h=await open();const {ev,wait}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();__A.V.modal=null;__A.render();});await wait(400);

// ---- catch up against the roster's top level ----
const fight=`(lvs,party)=>{const A=__A,G=A.G,o={};G.stage=0;G.roster={};Object.keys(lvs).forEach(id=>{const c=A.newChar(id,lvs[id],0);c.xp=0;G.roster[id]=c;c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  G.party=party.slice();A.V.modal=null;A.startBattle({stage:0,kind:'field',weather:'clear'});const B=A.B,xp0={};B.front.concat(B.back).forEach(c=>xp0[c.id]=c.xp);
  A.win();const info=A.V.modal.info;o.rows=(info.catchup||[]).map(r=>({id:r.id,pct:r.pct,top:r.top,gap:r.gap}));o.gain={};B.front.concat(B.back).forEach(c=>o.gain[c.id]=c.xp-xp0[c.id]);
  o.html=A.mResult(info);A.V.modal=null;A.finishBattle('win');A.V.modal=null;return o;}`;
// party mira 12, lumen 9, oren 12 (front) + brann 12 (reserve); at camp: tess 14 (the roster's top level)
const a=await ev(([fn])=>eval(fn)({mira:12,lumen:9,oren:12,brann:12,tess:14},['mira','lumen','oren','brann']),[fight]);
console.log(JSON.stringify({rows:a.rows,gain:a.gain}));
const pc=id=>(a.rows.find(r=>r.id===id)||{}).pct||0;
chk('catch up measures the gap to the roster top (Lv 14 at camp): the party\'s Lv 12 heroes get +38% (was 0)',pc('mira')===38&&pc('oren')===38||JSON.stringify(a.rows));
chk('5 behind in the front line: +125% (v0.7.1 curve)',pc('lumen')===125||JSON.stringify(a.rows));
chk('rearguard gets the same (v0.7.2): Brann (rearguard, 2 behind) +38%',pc('brann')===38||JSON.stringify(a.rows));
chk('the hero at camp gets nothing from a fight they sat out',!a.rows.some(r=>r.id==='tess')&&a.gain.tess===undefined);
chk('XP really moves: Lumen gets 2.25/1.38 of Mira',a.gain.mira>0&&Math.abs(a.gain.lumen/a.gain.mira-2.25/1.38)<Math.max(.03,1.5/a.gain.mira)||JSON.stringify(a.gain));
chk('the rewards screen shows it per hero and names the roster top level',/Mira<\/b>(?:<em[^>]*>[^<]*<\/em>)?<span class="rs-cu"[^>]*>\+38% catch up/.test(a.html)&&/top wayfarer \(Lv 14, counting your reserves\)/.test(a.html)||a.html.slice(0,600));
const b=await ev(([fn])=>eval(fn)({mira:14,lumen:9,oren:12},['mira','lumen','oren']),[fight]);
chk('the top hero gets no bonus when they are in the party (Lv 14 Mira)',!b.rows.some(r=>r.id==='mira')&&(b.rows.find(r=>r.id==='lumen')||{}).pct===125||JSON.stringify(b.rows));
const f=await ev(([fn])=>{const A=__A,G=A.G;const o=eval(fn)({mira:12,lumen:12,oren:12},['mira','lumen','oren']);return o.rows;},[fight]);
chk('no gap anywhere: no catch up rows',f.length===0||JSON.stringify(f));
const m=await ev(()=>{const x=__A.xpCatchMul;return [x(10,10,true),x(9,10,true),x(5,10,true),x(1,10,true),x(8,10,false)].map(v=>+v.toFixed(3));});
chk('XPCU curve, rearguard the same',JSON.stringify(m)==='[1,1.17,2.25,3.97,1.38]'||JSON.stringify(m));

// ---- Equip best: reserves ----
const ce=await ev(()=>{const A=__A,G=A.G,GEAR=A.GEAR,o={};G.roster={};['mira','lumen','oren','brann','tess','sable'].forEach(id=>{const c=A.newChar(id,15,0);G.roster[id]=c;c.eq={w:null,a:null,c:null};});
  G.party=['mira','lumen','oren'];const ks=Object.keys(GEAR).filter(k=>!GEAR[k].stick&&!GEAR[k].only);
  // the party wears weak gear; the pack holds better pieces too (the party must NOT get them from this button)
  const by=sl=>ks.filter(k=>GEAR[k].slot===sl);G.gear=by('w').slice(0,30).concat(by('a').slice(0,20),by('c').slice(0,10));
  ['mira','lumen','oren'].forEach(id=>{const c=G.roster[id];['w','a'].forEach(sl=>{const it=G.gear.find(k=>GEAR[k].slot===sl&&A.canEquip&&A.canEquip(c,k)||GEAR[k].slot===sl&&!A.canEquip);if(it){G.gear.splice(G.gear.indexOf(it),1);c.eq[sl]=it;}});});
  // a companion with a party hero, and one free
  const mons=Object.keys(A.MON||{}).slice(0,2);G.tamed=[];mons.forEach((mn,i)=>{const t={id:'tmz'+i,mon:mn,name:'Pet'+i,cls:'warrior',trait:'keen',bb:0,scourge:0,with:i?null:'mira'};A.registerTamed(t);G.tamed.push(t);});
  Object.values(G.roster).forEach(c=>{c.S=A.calcStats(c);c.hp=c.S.mhp;});
  const S=()=>JSON.stringify({gear:G.gear.slice().sort(),eq:Object.fromEntries(Object.keys(G.roster).sort().map(id=>[id,G.roster[id].eq])),w:G.tamed.map(t=>t.with)});
  const pe=()=>JSON.stringify(G.party.map(id=>G.roster[id].eq));
  o.s0=S();o.p0=pe();o.pack0=G.gear.length;o.comp0=G.tamed.map(t=>t.with);
  A.V.modal={type:'menu',tab:'equip'};A.render();const btn=document.querySelector('#modal [data-act="autoEqParty"]');o.btn=btn?btn.textContent.trim():null;o.campH=!!document.querySelector('#modal [data-act="autoEqCamp"],#modal [data-act="autoEqAll"]');
  if(btn)btn.click();else __P6.autoCamp();
  o.modal=A.V.modal&&A.V.modal.type;o.mode=A.V.modal&&A.V.modal.mode;A.render();const md=document.querySelector('#modal');o.txt=md?md.textContent:'';
  o.p1=pe();o.comp1=G.tamed.map(t=>t.with);o.camp=['brann','tess','sable'].map(id=>G.roster[id].eq);o.pack1=G.gear.length;
  // gear16: Equip Best pressed in the Menu closes it with a toast (no result page); who changed is read from the gear, Undo is ACT.g16Undo (Backpack > Equipment)
  if(!A.V.modal){o.mode=window.__G16&&window.__G16.G16.undo?'party':o.mode;const e0=JSON.parse(o.s0).eq;o.rows=Object.keys(G.roster).filter(id=>JSON.stringify(G.roster[id].eq)!==JSON.stringify(e0[id])).map(id=>({id,inParty:G.party.includes(id)}));A.ACT.g16Undo();o.s2=S();}
  else{o.rows=(A.V.modal.rows||[]).map(r=>({id:r.id,inParty:r.inParty}));
  const u=document.querySelector('#modal [data-act="autoEqUndo"]');if(u)u.click();else A.ACT.autoEqUndo();o.s2=S();}A.V.modal=null;A.render();
  // daily: the button does nothing
  G.daily=1;const before=S();__P6.autoCamp();o.daily=S()===before&&!(A.V.modal&&A.V.modal.type==='autoEq');G.daily=0;A.V.modal=null;
  return o;});
console.log(JSON.stringify({btn:ce.btn,mode:ce.mode,camp:ce.camp,rows:ce.rows,pack:[ce.pack0,ce.pack1],comp:[ce.comp0,ce.comp1]}));
chk('Equipment tab has one Equip Best button and no reserves or everyone button (v0.10.2)',ce.btn==='Equip Best'&&!ce.campH||JSON.stringify({btn:ce.btn,h:ce.campH}));
// v0.18.7 (party12.js): reserves keep no gear, so Equip Best gears the party only and the reserves stay bare
chk('reserves keep no gear: Equip Best leaves them bare',ce.camp.every(e=>!e.w&&!e.a&&!e.c)||JSON.stringify(ce.camp));
chk('Equip Best gears the party from the pack (the pack shrinks)',ce.mode==='party'&&ce.pack1<=ce.pack0||JSON.stringify({mode:ce.mode,pack:[ce.pack0,ce.pack1]}));
chk('the summary only lists heroes in the party',ce.rows.length>0&&ce.rows.every(r=>r.inParty)||JSON.stringify(ce.rows));
chk('Undo restores gear, pack and companions exactly',ce.s2===ce.s0);
chk('the Daily Trial is unaffected (auto equip stays off there)',ce.daily);
await done(h);})();
