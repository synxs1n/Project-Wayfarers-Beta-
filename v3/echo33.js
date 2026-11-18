// ===== echo33.js (v0.22.33): the Echoforge is a shop like the others: sections, order, a short page =====
// Asked: "echoforge counts as a shop, should be included when we do shop menu redesigns, it needs filters/better organization".
// The Echoforge is the Smithy's fifth tab (menus3.js), so it already has the phone shop frame (shops31.js). This gives it what the other tabs have:
//  1 sections with counts: All, For my party (a hero in the six can wear it), Can forge (everything it needs is in hand), Weapons, Armor
//  2 order inside a section: what can be forged now first, then what the party can wear, then the rest; Weapons and Armor headings in All only
//  3 the long explanation folds into "About the Echoforge" (open the first time, closed after: META.ef33seen)
//  4 an empty section says why
// The rows are the ones echo11.js builds (same text, same Forge button); this only picks and orders them.
function ef33All(){const L=[];try{Object.keys(ECHOFORGE).forEach(f=>L.push({f,k:'weapons'}));Object.keys(ECHOARM).forEach(f=>L.push({f,k:'armor'}));
  const P=partyChars();L.forEach(x=>{const id=efItemId(x.f),g0=efGold(x.f);let base=null,mats=false;try{base=efBaseIn(x.f);mats=hasMats(efCost(x.f));}catch(e){}
    x.id=id;x.ok=!!base&&mats&&G.gold>=g0;x.party=P.some(c=>{try{return canEquip(c,id);}catch(e){return false;}});});}catch(e){}return L;}
function ef33Pick(L,sec){return sec==='party'?L.filter(x=>x.party):sec==='ready'?L.filter(x=>x.ok):sec==='weapons'||sec==='armor'?L.filter(x=>x.k===sec):L;}
{const s0=m3Secs;m3Secs=function(t,tab){if(t==='smithy'&&tab==='echo'){try{const L=ef33All(),n=s=>ef33Pick(L,s).length;
    return [['all','All',L.length],['party','For my party',n('party')],['ready','Can forge',n('ready')],['weapons','Weapons',n('weapons')],['armor','Armor',n('armor')]];}catch(e){}}
  return s0.apply(this,arguments);};}
{const v0=vEchoforge;vEchoforge=function(){const h=v0.apply(this,arguments);try{const sec=(V.modal&&V.modal.sec)||'all',L=ef33All(),by={};
  const re=/<div class="row rec[\s\S]*?data-act="efForge" data-arg="([^"]+)"[^>]*>Forge<\/button><\/div>/g;let m,n=0;while((m=re.exec(h))){by[m[1]]=m[0];n++;}
  if(n!==L.length||!n)return h;// the page is not the shape this expects: leave it as it is
  const note=(h.match(/^<p class="note">[\s\S]*?<\/p>/)||[''])[0],rank=x=>(x.ok?0:2)+(x.party?0:1);
  const rows=X=>X.slice().sort((a,b)=>rank(a)-rank(b)).map(x=>by[x.f]).join('');
  const pick=ef33Pick(L,sec),seen=!!(META&&META.ef33seen);try{if(!seen){META.ef33seen=1;saveMeta();}}catch(e){}
  const about=note?`<details class="ef33about"${seen?'':' open'}><summary>About the Echoforge</summary>${note}</details>`:'';
  const empty=sec==='ready'?'Nothing can be forged yet. Each piece needs its Shards, Echo Essence, Dread Cores, gold and a tier 5 piece of the same kind.':sec==='party'?'Nobody in your six can wear an Echoforged piece.':'Nothing here.';
  const body=!pick.length?`<p class="note">${empty}</p>`:sec==='all'?['weapons','armor'].map(k=>{const X=pick.filter(x=>x.k===k);return X.length?`<h4 class="efsec">${k==='weapons'?'Weapons':'Armor'}</h4><div class="rows ef33">${rows(X)}</div>`:'';}).join(''):`<div class="rows ef33">${rows(pick)}</div>`;
  return about+body;}catch(e){return h;}};}
{const st=document.createElement('style');st.id='ef33css';st.textContent=`
.ef33about{margin:4px 0 10px;border:1px solid var(--ui-line-s,rgba(217,180,106,.3));border-radius:8px;padding:0 10px}
.ef33about>summary{cursor:pointer;min-height:40px;display:flex;align-items:center;font-weight:800}
.ef33about>.note{margin:0 0 10px}
.rows.ef33>.row.rec.ready{border-color:#e9c463}
.panel.s31 .rows.ef33>.row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:4px 8px;align-items:start;padding:8px}
.panel.s31 .rows.ef33>.row>.grow{grid-column:2/4;grid-row:1;min-width:0}
.panel.s31 .rows.ef33>.row>.grow>b{display:block;padding-right:78px}
.panel.s31 .rows.ef33>.row>.btn{grid-column:3;grid-row:1;align-self:start;position:relative;z-index:1}
.panel.s31 .rows.ef33>.row .mats{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.panel.s31 .rows.ef33>.row .mats .matc{font-size:.68rem;padding:2px 6px;min-height:0}
.panel.s31>.shopnav>.stabs .chip[data-arg="echo"]::before{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z'/%3E%3C/svg%3E")}
`;document.head.appendChild(st);}
try{window.__EF33={all:ef33All,pick:ef33Pick};}catch(e){}
