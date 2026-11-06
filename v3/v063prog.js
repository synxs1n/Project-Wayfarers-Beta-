// ===== v063prog.js (v0.6.3): progression goals: Taming log, bond goals, Make camp =====
// 1. Taming log: a second view inside Records > Bestiary. Every foe that can join you (bounty beasts and Nikaris's wild friends,
//    plus the lesser whelps of Scourges) is shown as Tamed, Seen (with where it roams) or unseen (a silhouette and "???"),
//    with "Tamed X of Y" for this journey. Seen comes from the account Bestiary, tamed from this journey.
// 2. Bond goals: hero sheets and the new Bonds page say how many more wins side by side (both in the vanguard and standing
//    when the fight is won, the counter G.bonds already keeps) until the next talk or tech. A toast says when a talk is ready.
//    Bond pacing (BOND_LV) is unchanged.
// 3. Make camp: Camp Supplies (sold at Alchemy from realm CAMP.fromStage + 1) let the party rest in a field or dungeon: standing
//    heroes in your six get back CAMP.heal of their HP and MP (the inn restores everything) and you pick one boon for the next
//    CAMP.dur battles. Ready campfire talks wait by the fire. Not in town, the Archive, next to a guardian, in battle or in the
//    Daily Trial; once per CAMP.cool battles.
// New optional save fields (all default to nothing on old saves): G.camp {b, left, at}, G.tameLog {monster name: 1},
// G.talkN (talks already announced), G.campNote (the unlock notice was shown). Nothing here runs in the Daily Trial.

const CAMP_BUFFS={
  atk:{n:'Whetstone',d:()=>`+${Math.round(CAMP.atk*100)}% attack and magic`},
  def:{n:'Watch fire',d:()=>`+${Math.round(CAMP.def*100)}% defense and resistance`},
  fast:{n:'Early rise',d:()=>'Every hero gets their first turn much sooner'},
  luck:{n:"Forager's luck",d:()=>`+${Math.round(CAMP.drop*100)}% drop chance`}};

// ----- Camp Supplies -----
ITEMS.campkit={n:'Camp Supplies',d:`Make camp in a field or dungeon: standing heroes get back ${Math.round(CAMP.heal*100)}% HP and MP, and you pick one boon for the next ${CAMP.dur} battles. Use it from Backpack or the Party tab`,price:CAMP.price,price0:CAMP.price,__ec:1,camp:1,tent:1,travel:1};
try{if(typeof ITEM_SPR!=='undefined')ITEM_SPR.campkit=['pouch','#c8843a'];}catch(e){}
const campOpen=()=>!!(G&&!G.daily&&((G.stage|0)>=CAMP.fromStage||(G.inv&&G.inv.campkit>0)));
{const as0=alchStock;alchStock=function(){const r=as0.apply(this,arguments);try{if(G&&!G.daily&&(G.stage|0)>=CAMP.fromStage&&!r.includes('campkit'))return r.concat(['campkit']);}catch(e){}return r;};}
{const co0=craftOnly;craftOnly=function(id){if(id==='campkit')return false;return co0.apply(this,arguments);};}
function campLeftCool(){const c=G&&G.camp;if(!c||c.at==null)return 0;return Math.max(0,CAMP.cool-((G.stats&&G.stats.battles||0)-c.at));}
{const tw0=travelWhyNot;travelWhyNot=function(id){const o=ITEMS[id];if(!o||!o.camp)return tw0.apply(this,arguments);
  if(G&&G.daily)return 'Not during the Daily Trial.';
  let w=tw0.apply(this,arguments);if(w==='You have none.')w='You need Camp Supplies. The alchemist sells them.';
  if(!w&&WS.m&&WS.m.archive)w='The Archive is no place to make camp.';
  if(w)return w;const n=campLeftCool();if(n)return `You made camp a moment ago. Fight ${n} more battle${n>1?'s':''} first.`;return '';};}
{const ut0=useTravel;useTravel=function(id){const o=ITEMS[id];if(!o||!o.camp)return ut0.apply(this,arguments);ACT.campOpen();return true;};}

function campHeal(){let hp=0,mp=0;partyChars().forEach(c=>{if(c.hp<=0)return;const h=Math.min(c.S.mhp-c.hp,Math.round(c.S.mhp*CAMP.heal)),m=Math.min(c.S.mmp-c.mp,Math.round(c.S.mmp*CAMP.heal));c.hp+=h;c.mp+=m;hp+=h;mp+=m;});return {hp,mp};}
function campMake(b){const why=travelWhyNot('campkit');if(why||!CAMP_BUFFS[b])return why||'Pick a boon.';
  G.inv.campkit--;const got=campHeal();G.camp={b,left:CAMP.dur,at:G.stats&&G.stats.battles||0};saveGame();return got;}
const campBuffNow=()=>{const c=G&&G.camp;return c&&c.b&&c.left>0&&CAMP_BUFFS[c.b]?c:null;};
const campBuffText=()=>{const c=campBuffNow();return c?`${CAMP_BUFFS[c.b].n}: ${CAMP_BUFFS[c.b].d()}, ${c.left} battle${c.left>1?'s':''} left`:'';};

// ----- the boon in battle: applied as the battle starts, counted down per battle, gone when it runs out -----
{const sb0=startBattle;startBattle=function(spec){const r=sb0.apply(this,arguments);
  try{const c=campBuffNow();if(r!==false&&B&&!G.daily&&c){B._camp=c.b;c.left--;const U=B.front.concat(B.back);
    if(c.b==='atk')U.forEach(u=>{u.S.atk*=1+CAMP.atk;u.S.mag*=1+CAMP.atk;});
    if(c.b==='def')U.forEach(u=>{u.S.def*=1+CAMP.def;u.S.res*=1+CAMP.def;});
    if(c.b==='fast')U.forEach(u=>{u.next=(u.next||0)*CAMP.first;});
    try{log(`Camp boon: ${CAMP_BUFFS[c.b].n}. ${c.left?`${c.left} more battle${c.left>1?'s':''} after this one.`:'This is its last battle.'}`);}catch(e){}
    saveGame();}}catch(e){}return r;};}
{const fb0=finishBattle;finishBattle=function(){const k=B&&B._camp,U=B?B.front.concat(B.back):[];const r=fb0.apply(this,arguments);
  try{if(k==='atk'||k==='def')U.forEach(u=>{if(G.roster[u.id])refresh(u);});}catch(e){}return r;};}
{const pd0=perkDropMul;perkDropMul=function(e){const m=pd0.apply(this,arguments);try{if(B&&B._camp==='luck'&&!G.daily)return m*(1+CAMP.drop);}catch(x){}return m;};}

// ----- bonds: goals measured on the real counter -----
function bondGoal(k){const b=BONDMAP[k];if(!b)return null;const p=(G.bonds||{})[k]||0;
  const S=[{at:BOND_LV[0],what:'campfire talk',talk:1},{at:BOND_LV[1],what:'joint tech'},{at:BOND_LV[2],what:b.talk2?'second talk':'stronger joint tech',talk:!!b.talk2}];
  const nx=S.find(s=>p<s.at),nt=S.find(s=>s.talk&&p<s.at);if(!nx)return {p,done:1,text:'Bond maxed.'};
  const n=nx.at-p,w=x=>`${x} more win${x>1?'s':''} side by side`;
  let text=`${w(n)} until the ${nx.what}`;if(nt&&nt!==nx)text+=`, ${nt.at-p} until the next talk`;
  return {p,n,next:nx.what,talkIn:nt?nt.at-p:null,at:nx.at,text:text+'.'};}
const BOND_HOW='A win counts when both stand in the vanguard at the end of the fight.';
const talkArg=t=>t.k+':'+(t.lv>=3&&BONDMAP[t.k]&&BONDMAP[t.k].talk2?3:1);
function readyTalks(){const seen={},out=[];(G.talks||[]).forEach(t=>{const b=BONDMAP[t.k];if(!b||!G.roster[b.a]||!G.roster[b.b])return;const a=talkArg(t);if(seen[a])return;seen[a]=1;out.push({arg:a,b});});return out;}
function bondSheet(id){const L=BONDS.filter(b=>b.a===id||b.b===id);if(!L.length)return '';
  return `<h4>Bonds</h4><p class="note">${BOND_HOW}</p><div class="rows">${L.map(b=>{const o=b.a===id?b.b:b.a,k=bondKey(b.a,b.b),here=!!G.roster[o];
    if(!here)return `<div class="row lock"><div class="grow"><b>${esc(TPL[o].n)}: ${esc(b.tech.n)}</b><small>${esc(b.tech.d)} Not recruited yet.</small></div></div>`;
    const lv=bondLv(b.a,b.b),g=bondGoal(k);
    return `<div class="row bondrow">${port(o,'sm')}<div class="grow"><b>${esc(TPL[o].n)}: ${esc(b.tech.n)}</b><small>${esc(b.tech.d)}</small>
      <small class="nums">Bond level ${lv}${lv<2?', joint tech unlocks at 2':lv<3?', tech powers up at 3':', maxed'}</small>${g.done?'':`<small class="bgoal nums">${esc(g.text)}</small>${bar(g.p,g.at,'var(--gold)')}`}
      <div class="btnrow">${bondScenes(b).map(s=>{const un=lv>=Math.min(s.lv,3);return un?`<button class="btn sm ${talkPending(k,s.lv)?'gold':''}" data-act="bondTalk" data-arg="${k}:${s.lv}">${s.n}${talkPending(k,s.lv)?' (new)':''}</button>`:`<button class="btn sm" disabled>${s.n}: level ${s.lv}</button>`;}).join('')}</div></div></div>`;}).join('')}</div>`;}
function vBonds(){const L=BONDS.filter(b=>G.roster[b.a]&&G.roster[b.b]).map(b=>{const k=bondKey(b.a,b.b);return {b,k,g:bondGoal(k),lv:bondLv(b.a,b.b),pend:talkPending(k,1)||talkPending(k,3)};})
    .sort((x,y)=>(y.pend-x.pend)||((x.g.done?999:x.g.n)-(y.g.done?999:y.g.n)));
  const later=BONDS.length-L.length;
  return `<p class="note">${BOND_HOW} Talks you have unlocked can be watched again from each hero's sheet.</p>`+(L.length?`<div class="rows">${L.map(o=>{const b=o.b;
    return `<div class="row bondrow bdall"><span class="bdports">${port(b.a,'sm noail')}${port(b.b,'sm noail')}</span><div class="grow"><b>${esc(TPL[b.a].n)} and ${esc(TPL[b.b].n)}</b><small class="nums">Level ${o.lv} · ${esc(b.tech.n)}</small>
      ${o.g.done?'<small>Bond maxed.</small>':`<small class="bgoal nums">${esc(o.g.text)}</small>${bar(o.g.p,o.g.at,'var(--gold)')}`}
      ${o.pend?`<div class="btnrow"><button class="btn sm gold" data-act="bondTalk" data-arg="${talkArg({k:o.k,lv:talkPending(o.k,3)&&b.talk2?3:1})}">Watch the talk</button></div>`:''}</div></div>`;}).join('')}</div>`
    :'<p class="note">No bonded pair has met yet. Some wayfarers share a history; recruit both and fight side by side.</p>')+(later?`<p class="note">${later} more bond${later>1?'s':''} wait${later>1?'':'s'} with heroes you have not recruited.</p>`:'');}

// ----- the camp screen -----
function mCamp(m){const why=travelWhyNot('campkit'),have=G.inv.campkit||0;
  if(m.done){const T=readyTalks();
    return box('Camp',`<p>The fire crackles. Your six got back ${fmt(m.got.hp)} HP and ${fmt(m.got.mp)} MP.</p><p class="note up">${esc(campBuffText())}.</p>
      <h4>By the fire</h4>${T.length?`<div class="rows">${T.map(o=>`<div class="row"><div class="grow"><b>${esc(TPL[o.b.a].n)} and ${esc(TPL[o.b.b].n)}</b><small>A talk is ready.</small></div><button class="btn sm gold" data-act="bondTalk" data-arg="${o.arg}">Listen</button></div>`).join('')}</div>`:'<p class="note">No talks are ready. Bonds grow with wins side by side.</p>'}`,
      '<button class="btn" data-act="bondsOpen">Bonds</button><button class="btn gold" data-act="closeModal">Break camp</button>');}
  const cur=campBuffNow();
  return box('Make camp',`<p class="note">Rest a while. Standing heroes in your six get back ${Math.round(CAMP.heal*100)}% HP and MP (an inn restores everything). Fallen heroes stay down. Then pick one boon for the next ${CAMP.dur} battles. Uses 1 Camp Supplies (you have ${have}).</p>
    ${why?`<p class="warn campwhy">${esc(why)}</p>`:''}${cur?`<p class="note">Now: ${esc(campBuffText())}. A new boon replaces it.</p>`:''}
    <div class="campbuffs">${Object.keys(CAMP_BUFFS).map(k=>`<button class="btn campbuff" data-act="campPick" data-arg="${k}" ${why?'disabled':''}><b>${esc(CAMP_BUFFS[k].n)}</b><small>${esc(CAMP_BUFFS[k].d())}</small></button>`).join('')}</div>`,
    '<button class="btn" data-act="bondsOpen">Bonds</button><button class="btn gold" data-act="closeModal">Not now</button>');}
Object.assign(ACT,{
  campOpen(){V.modal={type:'camp'};render();},
  campPick(k){const r=campMake(k);if(typeof r==='string'){toast(r);try{sfx('deny');}catch(e){}render();return;}V.modal={type:'camp',done:1,got:r};try{sfx('heal');}catch(e){}render();},
  bondsOpen(){V.modal={type:'bonds',from:V.modal};render();},
  bondsBack(){const f=V.modal&&V.modal.from;V.modal=f||null;render();},
  bview(v){V.bview=v==='tame'?'tame':'all';render();}});
{const vm0=vModal;vModal=function(m){if(m&&m.type==='camp')return mCamp(m);
  if(m&&m.type==='bonds')return box('Bonds',vBonds(),m.from?'<button class="btn gold" data-act="bondsBack">Back</button>':'<button class="btn gold" data-act="closeModal">Close</button>',true);
  return vm0.apply(this,arguments);};}
// the Party tab gets Bonds and Make camp next to Best party
{const vs0=vSwap;vSwap=function(){let h=vs0.apply(this,arguments);try{if(G&&!G.daily){const c=campBuffNow();
    const add=`<button class="btn sm" data-act="bondsOpen">Bonds</button>${campOpen()?`<button class="btn sm" data-act="campOpen">Make camp</button>`:''}`;
    const k=h.indexOf('data-act="fsOpen"');const e=k<0?-1:h.indexOf('</button>',k);
    h=e<0?`<div class="btnrow ptools">${add}</div>`+h:h.slice(0,e+9)+add+h.slice(e+9);
    if(c)h=h.replace(/(<div class="btnrow ptools">[\s\S]*?<\/div>)/,`$1<p class="note campnow">Camp boon: ${esc(campBuffText())}.</p>`);}}catch(x){}return h;};}

// ----- notices: a talk is ready, camping opens up -----
function v063Notes(){if(!G||G.daily||B||V.screen!=='world'||V.modal)return;
  const n=(G.talks||[]).length;if(G.talkN==null||n<G.talkN)G.talkN=n;
  else if(n>G.talkN){G.talkN=n;const T=readyTalks(),o=T[T.length-1];if(o){toast(`Campfire talk ready: ${TPL[o.b.a].n} and ${TPL[o.b.b].n}. Make camp or open a sheet to listen.`);return;}}
  if(!G.campNote&&(G.stage|0)>=CAMP.fromStage&&WS.m&&WS.m.kind==='town'){G.campNote=1;toast('New at Alchemy: Camp Supplies. Make camp in the field to rest a little and pick a boon.');}}
{const r0=render;render=function(){const r=r0.apply(this,arguments);try{v063Notes();}catch(e){}return r;};}

// ----- taming log -----
function tameName(o){const m=MON[o.mon]||guardianDef(o.mon);return m&&m.n;}
function tamedSet(){const S=new Set(Object.keys(G&&G.tameLog||{}));(G&&G.tamed||[]).forEach(o=>{const n=tameName(o);if(n)S.add(n);});return S;}
{const te0=tameElite;tameElite=function(t){const r=te0.apply(this,arguments);try{if(G&&!G.daily&&t){const m=MON[t.mon]||guardianDef(t.mon);if(m){G.tameLog=G.tameLog||{};G.tameLog[m.n]=1;}}}catch(e){}return r;};}
function tameList(){const all=bestAll(),seen=new Set(),out=[];const add=(o,grp,where)=>{const n=o.d&&o.d.n;if(!n||seen.has(n))return;seen.add(n);out.push({o,n,grp,where});};
  all.forEach(o=>{if(!o.g&&!o.odd&&o.zone>=0&&MON[o.k])add(o,ZONES[o.zone].n,`Roams ${ZONES[o.zone].n}${o.night?' at night':''}.`);});
  all.forEach(o=>{if(o.odd&&o.k!=='mimic'&&MON[o.k]){const bk=Object.keys(BOV).find(k=>BOV[k].mon[0]===o.k),gd=bk&&guardianDef(bk);add(o,'Uneasy realms',gd?`Roams a realm while ${gd.n} still rules it.`:'Roams an uneasy realm.');}});
  all.forEach(o=>{if(o.g&&!o.echo&&!FINALS[o.k])add(o,'Lesser Scourges',`A lesser whelp may follow you after ${o.d.n} falls, with Nikaris in the party.`);});
  return out;}
function tameCounts(){const L=tameList(),T=tamedSet();return {all:L.length,tamed:L.filter(x=>T.has(x.n)).length,seen:L.filter(x=>(META.best[x.n]||{}).seen).length};}
function vTameLog(){const L=tameList(),T=tamedSet(),C=tameCounts(),grp=[];L.forEach(x=>{let g=grp.find(q=>q.n===x.grp);if(!g)grp.push(g={n:x.grp,l:[]});g.l.push(x);});
  const tile=x=>{const t=T.has(x.n),s=(META.best[x.n]||{}).seen;
    if(!s&&!t)return `<div class="btile unk tl"><img class="tlsil" src="${monURL(x.o.d.art)}" alt=""><b>???</b><small class="tlw">Not seen yet</small></div>`;
    return `<div class="btile tl ${t?'tlt':'tls'}"><img src="${monURL(x.o.d.art)}" alt=""><b>${esc(x.n)}</b><span class="els">${(x.o.d.el||[]).map(ico).join('')}</span><em class="tlst">${t?'Tamed':'Seen'}</em>${t?'':`<small class="tlw">${esc(x.where)}</small>`}</div>`;};
  return `<p class="note tlhead"><b class="nums">Tamed ${C.tamed} of ${C.all}</b> this journey, ${C.seen} seen. Beaten bounty beasts can be tamed. With Nikaris in the party, any beaten monster may ask to join, and a fallen Scourge may leave a lesser whelp. Up to 8 companions travel with you.</p>
    ${grp.map(g=>`<h4>${esc(g.n)} <span class="cnt nums">${g.l.filter(x=>T.has(x.n)).length}/${g.l.length}</span></h4><div class="btiles">${g.l.map(tile).join('')}</div>`).join('')}`;}
{const vb0=vBestiary;vBestiary=function(){const tame=V.bview==='tame';
  const chips=`<div class="chips bview" role="tablist"><button role="tab" aria-selected="${!tame}" class="chip sm ${tame?'':'on'}" data-act="bview" data-arg="all">All creatures</button><button role="tab" aria-selected="${tame}" class="chip sm ${tame?'on':''}" data-act="bview" data-arg="tame">Taming log</button></div>`;
  return chips+(tame?vTameLog():vb0.apply(this,arguments));};}

try{const css=document.createElement('style');css.textContent=`.campbuffs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
  .campbuffs .campbuff{display:flex;flex-direction:column;align-items:flex-start;text-align:left;white-space:normal;min-height:58px;gap:2px;padding:8px 10px;height:auto}
  .campbuff small{font-size:.74rem;line-height:1.25;opacity:.9;font-weight:400}
  .campwhy{color:#ffb08a}.campnow{margin:4px 0 0}
  .bgoal{color:var(--gold,#ffd04a)}
  .bdports{display:flex;gap:2px;flex:none}
  .bview{margin:0 0 8px}.tlhead b{font-size:1rem;color:var(--gold,#ffd04a)}
  .btile.tl .tlst{font:700 .62rem/1.2 var(--fb,system-ui);font-style:normal;padding:1px 6px;border-radius:8px;background:rgba(255,255,255,.12)}
  .btile.tlt{border-color:#3fae7f;box-shadow:inset 0 0 0 1px #7affc8}.btile.tlt .tlst{background:#7affc8;color:#150b17}
  .btile.tl .tlw{font-size:.62rem;line-height:1.2;color:var(--mute);overflow-wrap:anywhere}
  .btile.unk>img.tlsil{filter:brightness(0) opacity(.5)}
  @media (max-width:360px){.campbuffs{grid-template-columns:1fr}}`;document.head.appendChild(css);}catch(e){}

// test hook (kept apart from window.__A, whose getters must not be overwritten)
try{window.__V063={get CAMP(){return CAMP;},CAMP_BUFFS,campMake,campHeal,campBuffNow,campLeftCool,bondGoal,readyTalks,tameList,tameCounts,tamedSet,vTameLog,vBonds,v063Notes};}catch(e){}
