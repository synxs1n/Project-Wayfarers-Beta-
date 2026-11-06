// ===== rivals.js (v0.4.3): every wayfarer's rival =====
// Each hero's personal quest now names a rival made for that hero alone: its own name, a base creature, a colour, and elements
// picked to press that hero (one element the hero is weak to where possible). Built at load for every hero, so the same hero always
// meets the same rival. Quests already accepted in an older save keep the rival they had.
const RIVAL_PFX=['Gravemaw','Ashtongue','Hollowfang','Brinescar','Coldheart','Thornhide','Duskclaw','Ironjaw','Wraithwing','Emberback','Stormtusk','Mirecoil','Glassfang','Rotroot','Sunscald','Nightvein','Ruinhorn','Saltgrave','Bonechime','Frostgnaw','Blightmane','Cinderhook','Gloomspur','Rimeback'];
const RIVAL_SFX=['the Unforgotten','of the Old Wound','the Debt','the Grudge','the First Loss','the Long Shadow','the Broken Oath','the Last Lesson','the Missing Page','the Unpaid','the Stolen Verse','the Scarmaker','the Patient Hunger','the Second Chance','the Unfinished'];
const RIVAL_BASES=['mossling','gustimp','dewtoad','cinderpup','crawler','gull','tidewisp','shellguard','magmaslime','cavebat','ashwraith','slaggolem','frostwolf','snowharpy','yeti','iceknight','thunderhawk','stormling','gargoyle','cloudray','voidspawn','eclipsewraith','stareater','huskguard'];
const RIVAL_COL=['#8a2a3a','#2a6a8a','#6a8a2a','#8a6a2a','#5a2a8a','#2a8a6a','#a04a2a','#3a3a6a','#7a7a2a','#2a5a3a','#8a3a6a','#4a6a8a'];
function rivalEls(t){const pool=ELK.filter(e=>(t.el||[]).some(h=>(CHART[e]||{})[h]>1));const a=pool.length?pool:ELK;return [a[hashS('re'+t.id)%a.length]];}
function buildRivals(){RAW.forEach((r,i)=>{const id=r[0],t=TPL[id];if(!t||t.mon)return;const k='rv_'+id;if(MON[k])return;
  const P=RIVAL_PFX.length,S=RIVAL_SFX.length,name=`${RIVAL_PFX[i%P]} ${RIVAL_SFX[(i*7+Math.floor(i/P))%S]}`;
  const base=RIVAL_BASES.filter(b=>MON[b])[(i*5+hashS(id))%RIVAL_BASES.length]||'mossling';
  makeMonVariant(k,base,name,rivalEls(t),RIVAL_COL[(i*7)%RIVAL_COL.length],{rival:id,hp:+(MON[base].hp*1.1).toFixed(2)});});}
buildRivals();
{const sp0=startPersonal;startPersonal=function(id){const q=sp0.apply(this,arguments);try{const k='rv_'+id;if(q&&MON[k]){const t=TPL[id];q.mon=k;q.name=MON[k].n;
  q.text=PQ_TEXT[t.cls].replace(/\{n\}/g,t.n).replace(/\{r\}/g,q.name).replace(/\{e\}/g,EL[t.el[0]].toLowerCase());saveGame();}}catch(e){}return q;};}
