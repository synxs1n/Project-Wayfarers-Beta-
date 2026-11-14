// ===== complete9.js (v0.11.1): completion checkmarks on the maps and per realm progress in the Journey tab =====
// ONE place says what "done" means:
//   Den (side cave 'k'+s): looted (G.caveWon[s]; its miniboss falls before the prize)   Sanctum ('o'+s): guardian beaten or prize taken
//   Lair: the realm's boss is down (G.cleared[s])
// REALM_DONE(s) lists everything unique to realm s: its quests (not legend, guild or global ones), its bounties, its Den, its Sanctum and
// its boss. A realm is 100% when every entry is done.
function denDone(s){try{return !!(G.caveWon||{})[s];}catch(e){return false;}}
function fortDoneS(s){try{return !!((G.fortWon||{})[s]||(G.miniDone||{})['o'+s]);}catch(e){return false;}}
function lairDone(s){try{return !!G.cleared[s];}catch(e){return false;}}
function siteDone(k,s){return k==='cave'?denDone(s):k==='fort'?fortDoneS(s):(k==='dungeon'||k==='lair'||k==='lairlit'||k==='dunlit')?lairDone(s):false;}
function REALM_DONE(s){const L=[];if(!G||G.daily)return L;
  try{if(s<=G.stage)genQuests(s);}catch(e){}try{if(s<=G.stage)genBounties(s);}catch(e){}
  (G.quests||[]).filter(q=>q.stage===s&&!q.global&&q.type!=='legend'&&q.type!=='guild'&&q.type!=='tamer').forEach(q=>L.push({k:'quest',n:q.title,done:q.state==='claimed'}));
  (G.bounties||[]).filter(b=>b.stage===s).forEach(b=>L.push({k:'bounty',n:b.name,done:b.state==='done'}));
  try{if(typeof caveStage==='function'&&caveStage(s))L.push({k:'den',n:CAVE_NAMES[s],done:denDone(s)});}catch(e){}
  try{if(typeof fortWanted==='function'&&fortWanted(s))L.push({k:'sanctum',n:(typeof FORT_NAMES!=='undefined'&&FORT_NAMES[s])||'Sanctum',done:fortDoneS(s)});}catch(e){}
  L.push({k:'boss',n:s<4?'Scourge':'Calamity',done:lairDone(s)});return L;}
REALM_DONE=HOOK.def('REALM_DONE',REALM_DONE);// records12.js reads the maps for the Den and Sanctum rows
function realmProgress(s){const L=REALM_DONE(s),d=L.filter(x=>x.done).length;return {L,d,n:L.length,pct:L.length?Math.round(d*100/L.length):0};}
// ----- map markers: a done flag, then a checkmark over the icon (area map and minimap share drawMarks) -----
HOOK.after('mapMarks','complete9','done flag on site markers',function(o,m){try{if(m&&m.kind==='field'&&!G.daily)o.forEach(q=>{if(['cave','fort','dungeon','lair','lairlit'].includes(q.k)){
  const k=q.k==='cave'||q.k==='fort'?q.k:'lair';if(siteDone(k,m.s))q.done=1;}});}catch(e){}});
function drawCheck(x,px,py,r){x.save();x.lineCap='round';x.lineJoin='round';x.strokeStyle='rgba(0,0,0,.75)';x.lineWidth=Math.max(2.5,r*.5);
  const p=[[px-r*.55,py],[px-r*.1,py+r*.45],[px+r*.65,py-r*.5]];x.beginPath();x.moveTo(...p[0]);x.lineTo(...p[1]);x.lineTo(...p[2]);x.stroke();
  x.strokeStyle='#7aff8a';x.lineWidth=Math.max(1.4,r*.28);x.beginPath();x.moveTo(...p[0]);x.lineTo(...p[1]);x.lineTo(...p[2]);x.stroke();x.restore();}
{const dm0=drawMarks;drawMarks=function(x,m,list,sc,ox,oy){const r=dm0.apply(this,arguments);try{(list||[]).forEach(o=>{if(!o.done)return;const s=Math.max(10,Math.round(sc*2.4));
  drawCheck(x,ox+(o.x+.5)*sc+s*.32,oy+(o.y+.5)*sc-s*.32,s*.32);});}catch(e){}return r;};}
// ----- the Journey tab: per realm, which of its Den, Sanctum, boss, quests and bounties are done -----
function vRealms(){try{if(!G||G.daily)return '';const rows=[];
  for(let s=0;s<=Math.min(4,G.stage);s++){const P=realmProgress(s),Z=ZS(s),mk=k=>{const x=P.L.filter(o=>o.k===k);return x.length?`${x.filter(o=>o.done).length}/${x.length}`:'';},
    bits=[['quest','Quests'],['bounty','Bounties'],['den','Den'],['sanctum','Sanctum'],['boss','Boss']].map(([k,n])=>{const v=mk(k);return v?`${n} ${v}`:'';}).filter(Boolean).join(' · ');
    rows.push(`<div class="row ${P.d===P.n?'up':''}"><div class="grow"><b>Realm ${s+1}: ${esc(Z.n)}</b><small>${bits}</small></div><span class="m nums">${P.d===P.n?'100% ✓':`${P.d} of ${P.n}`}</span></div>`);}
  return `<h4>Realms</h4><div class="rows compact">${rows.join('')}</div>`;}catch(e){return '';}}
HOOK.xform('vJourney','complete9','Realms section',function(h){try{const sec=vRealms(),k=h.indexOf('<h4>Progress</h4>');if(sec)h=k>=0?h.slice(0,k)+sec+h.slice(k):h+sec;}catch(e){}return h;});
// v0.11.4: the first visit to a special place tags its name with what it is: "Den: Mossback Burrow", "Sanctum: ...", "Lair: ...".
// Later visits show the plain name. G.siteTag remembers which have been tagged (optional field, journey bound).
function siteKind(m){if(!m)return '';if(m.cave&&m.fort)return 'Sanctum';if(m.cave)return 'Den';if(m.kind==='dungeon'&&!m.archive&&!m.sanctum)return 'Lair';return '';}
HOOK.after('showLocation','complete9','site kind in the location name',function(){try{const m=WS.m,k=siteKind(m);if(k&&G&&!G.daily){G.siteTag=G.siteTag||{};
  if(!G.siteTag[m.id]){G.siteTag[m.id]=1;WS.locN=k+': '+WS.locN;}}}catch(e){}});
