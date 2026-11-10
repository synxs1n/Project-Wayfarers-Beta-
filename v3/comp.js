// ===== comp.js (v0.3.1): companions: tamed monsters paired with heroes, Summon =====
// Tamed monsters are no longer party members. Each is a Companion in G.tamed (same list as before), and o.with is the hero
// it is paired with (one per hero). The hero gets a small stat bonus and +10% damage with the companion's first element.
// In battle that hero can Summon it once: it takes the hero's place for 3 of its own turns (4 with Beastbond), using its
// own monster skills at the hero's level, then the hero comes back. While it is out the hero cannot be targeted.
// MIGRATION (G.compV=1): tamed monsters in the roster are removed from roster and party, their gear goes back to the pack.
// COMP_TURNS, COMP_BONUS: in config.js
function compOf(c){return c&&G&&(G.tamed||[]).find(o=>o.with===c.id)||null;}
function compBonus(o){return o.scourge?COMP_BONUS.scourge:o.bb?COMP_BONUS.bb:COMP_BONUS.base;}
function compDef(o){return MON[o.mon]||guardianDef(o.mon);}
function migrateCompanions(g){if(g.compV)return;const back=[],ids={};
  // very old saves could hold two tames with the same id (tamed in the same millisecond): give the later one a fresh id
  (g.tamed||[]).forEach((o,i)=>{if(ids[o.id]){const c=g.roster[o.id];o.id=o.id+'x'+i;registerTamed(o);if(c&&!g.roster[o.id]){g.roster[o.id]=c;}}ids[o.id]=1;});(g.tamed||[]).forEach(o=>{const c=g.roster[o.id];if(c){['w','a','c'].forEach(sl=>{if(c.eq&&c.eq[sl])back.push(c.eq[sl]);});delete g.roster[o.id];}});
  g.gear=(g.gear||[]).concat(back);g.party=(g.party||[]).filter(id=>g.roster[id]);
  if(!g.party.length){g.party=Object.keys(g.roster).sort((a,b)=>g.roster[b].lv-g.roster[a].lv).slice(0,3);}
  // pair each companion with the hero it fought beside the most: the party leaders, in order, one each
  const free=g.party.slice();(g.tamed||[]).forEach(o=>{if(o.with&&g.roster[o.with])return;const h=free.find(id=>!(g.tamed||[]).some(x=>x.with===id));o.with=h||null;});g.compV=1;}
HOOK.after('unpackG','comp','migrate companions',function(g,o){try{migrateCompanions(g);}catch(e){}});
// taming no longer adds a party member
// unique pet names per journey: keep the chosen name when it is free; otherwise draw another epithet (seeded by monster, run seed and pet count),
// and when every epithet is taken append a numeral. Existing pets keep their names. No Math.random here.
const TAME_EPI=['the Old','the Scarred','Ironhide','the Hungry','Bloodmoon','the Unbroken','Grimtooth','the Roamer','Stormborn','the Patient','the Wary','Emberhide','the Quiet','Frostmane','the Bold','Thornback','the Swift','Duskwing','the Gaunt','Ashfang','the Restless','Moonscar','the Loyal','Gildedclaw','the Lone','Stonehoof','the Cunning','Wildheart','the Faded','Nightbloom','the Humble','Rustmane','the Keen','Sunscorch','the Weary','Hollowbone','the Gentle','Mistveil','the Brave','Cinderpaw'];
function tameUniqueName(o,m){try{const used=new Set(Object.keys(G.tameLog||{}));(G.tamed||[]).forEach(x=>{if(x&&x.name)used.add(x.name);});
  if(!used.has(o.name))return o.name;
  const n=(G.tamed||[]).length,seed=String((G.run&&G.run.seed)||0),base=hashS(o.mon+':'+seed+':'+n),L=TAME_EPI.length;
  for(let i=0;i<L;i++){const c=m.n+' '+TAME_EPI[(base+i)%L];if(!used.has(c))return c;}
  const b0=m.n+' '+TAME_EPI[base%L],R=['II','III','IV','V','VI','VII','VIII','IX','X'];
  for(let k=0;k<400;k++){const c=b0+' '+(k<R.length?R[k]:(k+2));if(!used.has(c))return c;}
  return o.name;}catch(e){return o.name;}}
function tameElite(t){const m=MON[t.mon]||guardianDef(t.mon);if(!m)return null;
  const o={id:'tm'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36),mon:t.mon,name:t.bb?t.name:t.name.replace(m.n+' ',''),cls:tameClass(m),trait:tameTrait(m),bb:t.bb?1:0,scourge:t.scourge?1:0,with:null};
  if(o.name.startsWith('the '))o.name=m.n+' '+o.name;o.name=tameUniqueName(o,m);registerTamed(o);G.tamed.push(o);G.compV=1;
  const free=partyChars().find(c=>!compOf(c));if(free){o.with=free.id;}saveGame();
  setTimeout(()=>toast(`${o.name} is now a Pet${o.with?' of '+G.roster[o.with].name:''}. Manage it in Menu > Pets.`),400);return o;}
// stat bonus for the paired hero (not in the Daily Trial, which has no companions)
HOOK.after('calcStats','comp','paired pet stat bonus',function(S,c){try{if(c&&c.side==='p'&&G&&!G.daily&&!c.isComp){const o=compOf(c);if(o){const k=compBonus(o),d=compDef(o);
  S.mhp=Math.round(S.mhp*(1+k));S.atk*=1+k;S.mag*=1+k;S.def*=1+k;S.res*=1+k;const el=d&&d.el&&d.el[0];if(el)S.elBoost[el]=(S.elBoost[el]||0)+.1;S.comp=o.id;applyCompPerk(S,o);}}}catch(e){}});
// ----- summoning -----
function canSummon(a){return !!(B&&a&&a.side==='p'&&!a.isComp&&compOf(a)&&!(B.summoned||{})[a.id]&&!G.daily&&a.hp>0);}
function summonComp(){const a=B.cur;if(!canSummon(a))return;const o=compOf(a),d=compDef(o);B.summoned=B.summoned||{};B.summoned[a.id]=1;
  const u=newChar(o.id,a.lv,gearTier());u.isComp=1;u.owner=a;u.compTurns=o.bb||o.scourge?COMP_TURNS+1:COMP_TURNS;u.name=o.name;u.lb=0;
  u.msk=(d.sk||[]).map(s=>({id:'c'+s[0],n:s[0],el:s[1],pw:+(s[2]*1.05).toFixed(2),t:s[3]==='all'?'all':s[3]==='self'?'self':'one',k:s[4]==='buff'?'buff':s[4],fx:s[5]||null,mp:0,cost:1,hits:1}));
  const i=B.front.indexOf(a);B.front[i]=u;a.hidden=1;u.next=B.time;u.enterT=Date.now();a.actT=Date.now();
  banner(`${o.name}!`,ELC[(d.el||[])[0]]||'#ffd04a');log(`${a.name} summons ${o.name}! It fights for ${u.compTurns} turns while ${a.name} steps back.`);autoNote(a,'Summon '+o.name);
  B.menu='root';render();later(advance,PAUSE*.5);}
function compReturn(u,why){const a=u.owner,i=B.front.indexOf(u);if(i<0)return;B.front[i]=a;a.hidden=0;a.next=B.time+delayOf(a,.4);a.enterT=Date.now();
  log(why==='ko'?`${u.name} is driven off. ${a.name} steps back in.`:`${u.name} returns to ${a.name}'s side.`);}
function compTurn(u){if(!B||B.over)return;const foes=B.en.filter(e=>e.hp>0);if(!foes.length){advance();return;}
  u.turns=(u.turns||0)+1;let sk=null;const buffs=u.msk.filter(s=>s.k==='buff'&&!(s.fx||[]).every(([k])=>has(u,k))),dmg=u.msk.filter(s=>s.k!=='buff');
  if(buffs.length&&RNG()<.2)sk=buffs[0];else if(dmg.length)sk=dmg.find(s=>s.t==='all'&&foes.length>1&&RNG()<.6)||pick(dmg);else sk=ATTACK;
  // aim for a weakness when it can see one
  let tg=sk.t==='self'?[u]:sk.t==='all'?foes:[foes.slice().sort((x,y)=>effOf(sk.el,y)-effOf(sk.el,x)||x.hp-y.hp)[0]];
  B.cur=u;perform(u,sk,tg);u.compTurns--;
  if(u.compTurns<=0&&u.hp>0){compReturn(u,'done');render();later(advance,PAUSE*.8);return;}
  endTurn(u,1);}
{const ad0=advance;advance=function(){if(B&&!B.over){let u=null;liveUnits().forEach(x=>{if(!u||x.next<u.next||(x.next===u.next&&x.side==='p'))u=x;});
  if(u&&u.isComp){if(checkEnd())return;B.cur=u;B.time=u.next;B.mode='enemy';render();later(()=>compTurn(u),PAUSE*.8);return;}}return ad0.apply(this,arguments);};}
HOOK.before('fallen','comp','a pet leaves instead of falling',function(u){if(u&&u.isComp){u.deathT=Date.now();compReturn(u,'ko');return HOOK.stop();}});
{const lb0=lbAdd;lbAdd=function(c,n){if(c&&c.isComp)return;return lb0.apply(this,arguments);};}
// the hero always comes back before the fight ends, so results and saves only ever see real heroes
HOOK.before('finishBattle','comp','companions step back',function(){try{if(B)B.front.forEach((u,i)=>{if(u&&u.isComp){B.front[i]=u.owner;u.owner.hidden=0;}});}catch(e){}});
HOOK.before('win','comp','companions step back',function(){try{if(B)B.front.forEach((u,i)=>{if(u&&u.isComp){B.front[i]=u.owner;u.owner.hidden=0;}});}catch(e){}});
ACT.summon=function(){summonComp();};
// ----- Companions menu -----
function vCompanions(){const L=G.tamed||[];
  return `<p class="note">Tamed monsters travel as Pets. Pair each with one hero for a small bonus (+${Math.round(COMP_BONUS.base*100)}% HP, ATK, MAG, DEF and RES; Beastbond ${Math.round(COMP_BONUS.bb*100)}%, Lesser Scourges ${Math.round(COMP_BONUS.scourge*100)}%) and +10% damage with its element. Once per battle that hero can <b>Summon</b> it to fight in their place for ${COMP_TURNS} turns (${COMP_TURNS+1} with Beastbond). Taming: ${L.length} of 8.</p>
  ${L.length?`<div class="rows">${L.map(o=>{const d=compDef(o),h=o.with&&G.roster[o.with];return `<div class="row comprow"><img class="mimg" src="${monURL(d.art)}" alt=""><div class="grow"><b>${esc(o.name)}</b>${o.bb?' <em class="cyc">Beastbond</em>':''}${o.scourge?' <em class="cyc legb">Lesser Scourge</em>':''}<small>${d.el.map(ico).join('')} ${esc(d.n)} · ${(d.sk||[]).map(s=>esc(s[0])).join(', ')}</small><small class="up">${compBonusText(o)}</small><small>${h?`With <b>${esc(h.name)}</b>`:'Not paired'}</small></div><button class="btn sm" data-act="compPick" data-arg="${o.id}">${h?'Change':'Pair'}</button></div>`;}).join('')}</div>`:'<p class="note">No pets yet. Beat an elite bounty and spare it, or travel with Nikaris.</p>'}`;}
function mCompPick(m){const o=(G.tamed||[]).find(x=>x.id===m.id);if(!o)return '';const H=G.party.concat(Object.keys(G.roster).filter(id=>!G.party.includes(id)));
  return box(`Pair ${esc(o.name)}`,`<div class="rows">${H.map(id=>{const c=G.roster[id],cur=compOf(c);return `<div class="row">${port(id,'sm')}<div class="grow"><b>${esc(c.name)}</b><small>Lv ${c.lv} ${CLS[TPL[id].cls].n}${cur&&cur!==o?` · has ${esc(cur.name)}`:''}</small></div><button class="btn sm ${o.with===id?'gold':''}" data-act="compSet" data-arg="${id}">${o.with===id?'Paired':'Pair'}</button></div>`;}).join('')}</div>`,
    `${o.with?'<button class="btn" data-act="compSet" data-arg="">Unpair</button>':''}<button class="btn gold" data-act="xBack">Done</button>`);}
HOOK.before('vModal','comp','compPick popup',function(m){if(m&&m.type==='compPick')return HOOK.stop(mCompPick(m));});
Object.assign(ACT,{
  compPick(id){V.modal={type:'compPick',id,from:V.modal};render();},
  compSet(hid){const o=(G.tamed||[]).find(x=>x.id===V.modal.id);if(!o)return;if(hid){(G.tamed||[]).forEach(x=>{if(x.with===hid)x.with=null;});o.with=hid;}else o.with=null;
    Object.values(G.roster).forEach(refresh);saveGame();sfx('blip');render();}
});

// the exact numbers, shown in the Companions menu and on the hero sheet
function compBonusText(o){const k=Math.round(compBonus(o)*100),d=compDef(o),el=d&&d.el&&d.el[0],P=compPerk(o);
  return `+${k}% HP, ATK, MAG, DEF, RES${el?` · +10% ${EL[el]} damage`:''}${P?` · ${P.n}: ${P.d}`:''} · Summon once per battle (${o.bb||o.scourge?COMP_TURNS+1:COMP_TURNS} turns)`;}
// ----- the Pet slot: shown under the gear slots on the Equipment screen and the hero sheet -----
// Change opens the pet chooser for that hero (petPick); Remove unpairs. compPick (the pet-to-hero popup) stays in Menu > Pets.
function petSlotHtml(c,mini){if(!c||G.daily)return '';const o=compOf(c),free=(G.tamed||[]).filter(x=>!x.with),any=(G.tamed||[]).length>0;
  const btns=o?`<button class="btn sm" data-act="petPick" data-arg="${c.id}">Change</button><button class="btn sm" data-act="petSet" data-arg="${c.id},">Remove</button>`:(any?`<button class="btn sm ${free.length?'gold':''}" data-act="petPick" data-arg="${c.id}">Choose</button>`:'');
  return `<div class="petslot"><span class="eqs petcur">${o?`<img class="gico" alt="" src="${monURL(compDef(o).art)}">`:'<span class="gico empty"></span>'}<span><small>Pet</small>${o?esc(o.name):'No pet'}</span></span>${btns}</div>`;}
function mPetPick(m){const c=G.roster[m.char];if(!c)return '';const cur=compOf(c),L=(G.tamed||[]).slice().sort((a,b)=>(!!a.with)-(!!b.with));
  return box(`Pet: ${esc(c.name)}`,`<div class="rows">${L.map(o=>{const d=compDef(o),h=o.with&&G.roster[o.with],mine=o.with===c.id;return `<div class="row comprow"><img class="mimg" src="${monURL(d.art)}" alt=""><div class="grow"><b>${esc(o.name)}</b><small class="up">${compBonusText(o)}</small><small>${mine?'Paired with this hero':h?`With ${esc(h.name)} (moves here)`:'Free'}</small></div><button class="btn sm ${mine?'gold':''}" data-act="petSet" data-arg="${c.id},${o.id}">${mine?'Paired':'Pair'}</button></div>`;}).join('')||'<p class="note">No pets yet.</p>'}</div>`,
    `${cur?`<button class="btn" data-act="petSet" data-arg="${c.id},">Remove pet</button>`:''}<button class="btn gold" data-act="xBack">Done</button>`);}
HOOK.before('vModal','comp','petPick popup',function(m){if(m&&m.type==='petPick')return HOOK.stop(mPetPick(m));});
Object.assign(ACT,{
  petPick(hid){V.modal={type:'petPick',char:hid,from:V.modal};render();},
  petSet(a){const [hid,pid]=String(a).split(',');if(!G.roster[hid])return;(G.tamed||[]).forEach(x=>{if(x.with===hid)x.with=null;});
    if(pid){const o=(G.tamed||[]).find(x=>x.id===pid);if(o)o.with=hid;}
    Object.values(G.roster).forEach(refresh);saveGame();sfx('blip');render();}
});
// Done/back from a pet popup returns to wherever it was opened (Equipment, hero sheet), not always the Pets tab
HOOK.wrap('modalBack','comp','pet popups go back to where they were opened',function(next,m){if(m&&(m.type==='petPick'||m.type==='compPick')&&m.from&&m.from.type&&m.from.type!=='petPick'&&m.from.type!=='compPick')return ()=>{V.modal=m.from;};return next(m);});
HOOK.xform('mChar','comp','Pet row on the hero sheet',function(h,id,edit){try{const c=G.roster[id],o=c&&compOf(c);const i=h.indexOf('<h4>Limit Break</h4>');if(i<0||!c)return h;
  const row=`<h4>Pet</h4>${edit&&!G.daily?petSlotHtml(c):''}${o?`<div class="row comprow"><img class="mimg" src="${monURL(compDef(o).art)}" alt=""><div class="grow"><b>${esc(o.name)}</b><small class="up">${compBonusText(o)}</small></div></div>`:`<p class="note">No pet paired.${edit?'':' Pair one in Menu &gt; Pets.'}</p>`}`;
  return h.slice(0,i)+row+h.slice(i);}catch(e){return h;}});
