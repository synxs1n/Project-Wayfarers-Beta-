// =================== COMPANIONS (Beta v0.3.1) ===================
// Tamed monsters are no longer party members. Each is a Companion in G.tamed (same list as before), and o.with is the hero
// it is paired with (one per hero). The hero gets a small stat bonus and +10% damage with the companion's first element.
// In battle that hero can Summon it once: it takes the hero's place for 3 of its own turns (4 with Beastbond), using its
// own monster skills at the hero's level, then the hero comes back. While it is out the hero cannot be targeted.
// MIGRATION (G.compV=1): tamed monsters in the roster are removed from roster and party, their gear goes back to the pack.
const COMP_TURNS=3,COMP_BONUS={base:.04,bb:.06,scourge:.08};
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
{const up0=unpackG;unpackG=function(o){const g=up0.apply(this,arguments);try{migrateCompanions(g);}catch(e){}return g;};}
// taming no longer adds a party member
tameElite=function(t){const m=MON[t.mon]||guardianDef(t.mon);if(!m)return null;
  const o={id:'tm'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36),mon:t.mon,name:t.bb?t.name:t.name.replace(m.n+' ',''),cls:tameClass(m),trait:tameTrait(m),bb:t.bb?1:0,scourge:t.scourge?1:0,with:null};
  if(o.name.startsWith('the '))o.name=m.n+' '+o.name;registerTamed(o);G.tamed.push(o);G.compV=1;
  const free=partyChars().find(c=>!compOf(c));if(free){o.with=free.id;}saveGame();
  setTimeout(()=>toast(`${o.name} is now a Companion${o.with?' of '+G.roster[o.with].name:''}. Manage it in Menu > Companions.`),400);return o;};
// stat bonus for the paired hero (not in the Daily Trial, which has no companions)
{const cs0=calcStats;calcStats=function(c){const S=cs0.apply(this,arguments);try{if(c&&c.side==='p'&&G&&!G.daily&&!c.isComp){const o=compOf(c);if(o){const k=compBonus(o),d=compDef(o);
  S.mhp=Math.round(S.mhp*(1+k));S.atk*=1+k;S.mag*=1+k;S.def*=1+k;S.res*=1+k;const el=d&&d.el&&d.el[0];if(el)S.elBoost[el]=(S.elBoost[el]||0)+.1;S.comp=o.id;applyCompPerk(S,o);}}}catch(e){}return S;};}
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
{const fl0=fallen;fallen=function(u){if(u&&u.isComp){u.deathT=Date.now();compReturn(u,'ko');return;}return fl0.apply(this,arguments);};}
{const lb0=lbAdd;lbAdd=function(c,n){if(c&&c.isComp)return;return lb0.apply(this,arguments);};}
// the hero always comes back before the fight ends, so results and saves only ever see real heroes
{const fb0=finishBattle;finishBattle=function(){try{if(B)B.front.forEach((u,i)=>{if(u&&u.isComp){B.front[i]=u.owner;u.owner.hidden=0;}});}catch(e){}return fb0.apply(this,arguments);};}
{const w0=win;win=function(){try{if(B)B.front.forEach((u,i)=>{if(u&&u.isComp){B.front[i]=u.owner;u.owner.hidden=0;}});}catch(e){}return w0.apply(this,arguments);};}
ACT.summon=function(){summonComp();};
// ----- Companions menu -----
function vCompanions(){const L=G.tamed||[];
  return `<p class="note">Tamed monsters travel as Companions. Pair each with one hero for a small bonus (+${Math.round(COMP_BONUS.base*100)}% HP, ATK, MAG, DEF and RES; Beastbond ${Math.round(COMP_BONUS.bb*100)}%, Lesser Scourges ${Math.round(COMP_BONUS.scourge*100)}%) and +10% damage with its element. Once per battle that hero can <b>Summon</b> it to fight in their place for ${COMP_TURNS} turns (${COMP_TURNS+1} with Beastbond). Taming: ${L.length} of 8.</p>
  ${L.length?`<div class="rows">${L.map(o=>{const d=compDef(o),h=o.with&&G.roster[o.with];return `<div class="row comprow"><img class="mimg" src="${monURL(d.art)}" alt=""><div class="grow"><b>${esc(o.name)}</b>${o.bb?' <em class="cyc">Beastbond</em>':''}${o.scourge?' <em class="cyc legb">Lesser Scourge</em>':''}<small>${d.el.map(ico).join('')} ${esc(d.n)} · ${(d.sk||[]).map(s=>esc(s[0])).join(', ')}</small><small class="up">${compBonusText(o)}</small><small>${h?`With <b>${esc(h.name)}</b>`:'Not paired'}</small></div><button class="btn sm" data-act="compPick" data-arg="${o.id}">${h?'Change':'Pair'}</button></div>`;}).join('')}</div>`:'<p class="note">No companions yet. Beat an elite bounty and spare it, or travel with Nikaris.</p>'}`;}
function mCompPick(m){const o=(G.tamed||[]).find(x=>x.id===m.id);if(!o)return '';const H=G.party.concat(Object.keys(G.roster).filter(id=>!G.party.includes(id)));
  return box(`Pair ${esc(o.name)}`,`<div class="rows">${H.map(id=>{const c=G.roster[id],cur=compOf(c);return `<div class="row">${port(id,'sm')}<div class="grow"><b>${esc(c.name)}</b><small>Lv ${c.lv} ${CLS[TPL[id].cls].n}${cur&&cur!==o?` · has ${esc(cur.name)}`:''}</small></div><button class="btn sm ${o.with===id?'gold':''}" data-act="compSet" data-arg="${id}">${o.with===id?'Paired':'Pair'}</button></div>`;}).join('')}</div>`,
    `${o.with?'<button class="btn" data-act="compSet" data-arg="">Unpair</button>':''}<button class="btn gold" data-act="xBack">Done</button>`);}
{const vm0=vModal;vModal=function(m){if(m&&m.type==='compPick')return mCompPick(m);return vm0.apply(this,arguments);};}
Object.assign(ACT,{
  compPick(id){V.modal={type:'compPick',id,from:V.modal};render();},
  compSet(hid){const o=(G.tamed||[]).find(x=>x.id===V.modal.id);if(!o)return;if(hid){(G.tamed||[]).forEach(x=>{if(x.with===hid)x.with=null;});o.with=hid;}else o.with=null;
    Object.values(G.roster).forEach(refresh);saveGame();sfx('blip');render();}
});

// the exact numbers, shown in the Companions menu and on the hero sheet
function compBonusText(o){const k=Math.round(compBonus(o)*100),d=compDef(o),el=d&&d.el&&d.el[0],P=compPerk(o);
  return `+${k}% HP, ATK, MAG, DEF, RES${el?` · +10% ${EL[el]} damage`:''}${P?` · ${P.n}: ${P.d}`:''} · Summon once per battle (${o.bb||o.scourge?COMP_TURNS+1:COMP_TURNS} turns)`;}
{const mc0=mChar;mChar=function(id,edit){let h=mc0.apply(this,arguments);try{const c=G.roster[id],o=c&&compOf(c);const i=h.indexOf('<h4>Limit Break</h4>');if(i<0||!c)return h;
  const row=o?`<h4>Companion</h4><div class="row comprow"><img class="mimg" src="${monURL(compDef(o).art)}" alt=""><div class="grow"><b>${esc(o.name)}</b><small class="up">${compBonusText(o)}</small></div></div>`:`<h4>Companion</h4><p class="note">None paired. Pair one in Menu &gt; Companions.</p>`;
  return h.slice(0,i)+row+h.slice(i);}catch(e){return h;}};}
