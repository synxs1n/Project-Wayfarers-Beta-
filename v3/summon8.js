// ===== summon8.js (v0.10.7): Sanctums and Summons =====
// Sanctums (the side fortresses, renamed) always end in one unique guardian (MINIS in sites.js, one per journey per site). Beating
// it adds the guardian to G.summons {mon:{mon,name,mod,lv}} (optional save field; old saves rebuild it from G.miniDone and
// G.miniPick). Priests (the Healer class) can Invoke a summon in battle: the Priest spends a turn praying (B.pray), and on their
// next turn the guardian takes the field in place of the WHOLE Vanguard (B.front becomes [the summon]) for SUM.turns of its own
// turns, hitting with the guardian's skills. When it ends, or if it falls, the Vanguard returns as it was (HP untouched); a fallen
// summon blocks summoning for the rest of the battle. Costs SUM.mp of the Priest's max MP, once per Priest per battle. Monks
// Invoke too (SUM.call below). Never in the Daily Trial; auto battle never prays (the summon still acts if it is already out).
// v0.19.2: a guardian is a boss you can summon: it stays 5 turns when a Priest invokes it (was 3), and is drawn at boss size
// after 0.21.0 ("boss summons are bit too strong, tune down slight bit"): 12% less damage (powM .95 to .835) and 12% less HP (hpK 1.2 to 1.055); see battle16.js
// legends18 (after 0.22.3, the owner: "just give monks the same summon (invoke) capabilities of priest, it just takes 2 turns the summon only last 4 turns
// instead of priest 5"): the lesser call is gone. A Monk Invokes exactly as a Priest does (the same guardian at full strength, in the whole Vanguard's
// place, the same MP, no level gate) with two parameters of his own (SUM.call): SUM.call.monk.pray turns of stillness before it answers (the Priest:
// one turn of prayer) and SUM.call.monk.turns turns on the field (the Priest: SUM.turns). The wind-up is shown like the Priest's prayer: a "Stillness" mark
// over him and the card badge (with the turns left), a log line each turn; only a KO breaks it (fallen clears B.pray), a Stun does not.
const SUM={turns:5,mp:.3,mpMin:10,hpK:1.055,lvUp:2,powM:.835,call:{priest:{pray:1,turns:5},monk:{pray:2,turns:4}}};
const sumCallOf=k=>(SUM.call&&SUM.call[k])||{pray:1,turns:SUM.turns};// the two parameters of a caller kind ('priest': Priests, Nikaris, Joseth; 'monk')
function sumList(){try{return Object.values(G.summons||{});}catch(e){return [];}}
function sumUnlock(mon,name,mod){if(!G||G.daily||!MON[mon])return false;G.summons=G.summons||{};if(G.summons[mon])return false;G.summons[mon]={mon,name:name||MON[mon].n,mod:mod||null,at:Date.now()};return true;}
// old saves: guardians already beaten become summons
HOOK.after('unpackG','summon8','old saves: beaten guardians become summons',function(r){try{if(G&&!G.summons&&G.miniDone&&G.miniPick&&typeof MINIS!=='undefined'){G.summons={};Object.keys(G.miniDone).forEach(id=>{const i=G.miniPick[id];const D=i!=null&&MINIS[i];if(D)sumUnlock(D[0],D[2],D[5]);});}}catch(e){}});
// v0.12: one guardian per site, drawn WITHOUT replacement per journey. A seeded Fisher-Yates shuffle of all guardians (seed: G.run.seed)
// is dealt out by site slot (Sanctum of stage s: slot s, Den of stage s: slot 5+s), so the pick does not depend on the order the sites are
// visited, and no two sites ever share one. A slot whose guardian is already held by another site (old saves, which picked by visit order)
// takes the next free one along the shuffle. Picks are stored in G.miniPick as before.
function miniOrder(){const seed=((G&&G.run&&G.run.seed)||1),R=seeded((seed^0x31415)>>>0),o=MINIS.map((_,k)=>k);for(let i=o.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[o[i],o[j]]=[o[j],o[i]];}return o;}
function miniSlot(id){const t=String(id),s=parseInt(t.slice(1),10)||0;return t[0]==='o'?s:t[0]==='k'?5+s:10+(hashS(t)%10);}
miniFor=function(m){G.miniPick=G.miniPick||{};let i=G.miniPick[m.id];
  if(i==null){const used=new Set(Object.values(G.miniPick)),order=miniOrder(),n=order.length,s0=miniSlot(m.id);
    for(let k=0;k<n&&i==null;k++){const c=order[(s0+k)%n];if(!used.has(c))i=c;}
    if(i==null)i=order[s0%n];G.miniPick[m.id]=i;}
  const D=MINIS[i];return {mon:D[0],name:D[2],mod:D[5]};};
// every Sanctum has its guardian (caves keep their chance)
{const sh0=siteHasMini;siteHasMini=function(id){if(typeof id==='string'&&id[0]==='o')return true;return sh0.apply(this,arguments);};}
HOOK.after('win','summon8','a beaten guardian becomes a summon',function(){try{const sp=B&&B.spec,mi=sp&&sp.mini;if(!mi||typeof mi!=='object'||!G||G.daily)return;if(sumUnlock(mi.mon,mi.name,mi.mod)){const info=(B&&B.result)||(V.modal&&V.modal.info);if(info){info.notes=info.notes||[];info.notes.push(`${mi.name} is bound to your cause: a Priest can now Invoke it in battle.`);}}}catch(e){}});
// ----- who can summon -----
function sumClassOf(a){try{const t=TPL[a.id];if(!t||!B||a.side!=='p'||a.isComp||a.isSum)return null;if(t.cls==='healer')return 'priest';if(t.cls==='monk')return 'monk';}catch(e){}return null;}
function sumCan(a){if(!B||!G||G.daily||B.auto||!a||a.hp<=0)return false;if(B.sum||B.sumDead||B.pray)return false;const k=sumClassOf(a);if(!k||!sumList().length)return false;if((B.summonedBy||{})[a.id])return false;return a.mp>=sumCost(a);}
function sumCost(a){return Math.max(SUM.mpMin,Math.round(a.S.mmp*SUM.mp));}
// ----- the unit -----
// (the second and third arguments, once the lesser form and its owner, are unused: every guardian is the full one; roles9.js reads the caller from sumFire)
function sumMake(o,_,owner,turns){const m=MON[o.mon];const heroes=B.front.filter(c=>c.hp>0),lv=Math.round(heroes.reduce((q,c)=>q+c.lv,0)/Math.max(1,heroes.length))+SUM.lvUp;
  const u=makeEnemy(m,lv,{elite:true,name:o.name,mod:o.mod,noField:1,noBuff:1,hpM:1,powM:SUM.powM});
  u.side='p';u.isSum=1;u.id='sum_'+o.mon;u.base=o.name;u.lb=0;u.owner=null;u.lesser=false;u.turnsLeft=turns||SUM.turns;
  const pool=B.front.reduce((q,c)=>q+(c.S?c.S.mhp:0),0);u.S.mhp=Math.max(u.S.mhp,Math.round(pool*SUM.hpK));u.hp=u.S.mhp;u.S.mmp=999;u.mp=999;
  if(!TPL[u.id])TPL[u.id]={id:u.id,n:o.name,cls:'warrior',el:m.el.slice(),trait:'brave',bio:`${o.name}, guardian of a Sanctum, bound to your cause.`,src:'sum',look:null,mon:o.mon,art:m.art,summon:1};
  u.msk=(m.sk||[]).map(s=>({id:'s'+s[0],n:s[0],el:s[1],pw:+(s[2]*1.05).toFixed(2),t:s[3]==='all'?'all':s[3]==='self'?'self':'one',k:s[4]==='buff'?'buff':s[4],fx:s[5]||null,mp:0,cost:1,hits:1}));
  return u;}
// turns: how long it stays (the caller's SUM.call; a number, or nothing for the Priest's SUM.turns)
function sumFire(a,o,turns){const u=sumMake(o,false,null,typeof turns==='number'?turns:null);
  B.sum={u,front:B.front,by:a};B.front=[u];
  B.summonedBy=B.summonedBy||{};B.summonedBy[a.id]=1;u.next=B.time;u.enterT=Date.now();
  banner(`GUARDIAN: ${o.name}`,ELC[(MON[o.mon].el||[])[0]]||'#ffd04a');log(`${a.name}'s ${sumClassOf(a)==='monk'?'call':'prayer'} is answered: ${o.name} takes the field for ${u.turnsLeft} turns while the Vanguard steps back.`);
  if(typeof sfx==='function')sfx('level');return true;}
sumFire=HOOK.def('sumFire',sumFire);// v0.19.2: kits12 adds the boss entrance (glow, name plate)
function sumEnd(why){const S=B&&B.sum;if(!S)return;const u=S.u;
  B.front=S.front;B.front.forEach((c,i)=>{c.hidden=0;c.next=B.time+delayOf(c,.3+.15*i);c.enterT=Date.now();});
  B.sum=null;if(why==='ko')B.sumDead=1;
  log(why==='ko'?`${u.name} is driven off. The Vanguard steps back in.`:`${u.name} returns to the Sanctum. The Vanguard steps back in.`);}
function sumTurn(u){if(!B||B.over)return;const foes=B.en.filter(e=>e.hp>0);if(!foes.length){advance();return;}
  u.turns=(u.turns||0)+1;let sk=null;const buffs=u.msk.filter(s=>s.k==='buff'&&!(s.fx||[]).every(([k])=>has(u,k))),dmg=u.msk.filter(s=>s.k!=='buff');
  if(buffs.length&&RNG()<.15)sk=buffs[0];else if(dmg.length)sk=dmg.find(s=>s.t==='all'&&foes.length>1&&RNG()<.65)||pick(dmg);else sk=ATTACK;
  let tg=sk.t==='self'?[u]:sk.t==='all'?foes:[foes.slice().sort((x,y)=>effOf(sk.el,y)-effOf(sk.el,x)||x.hp-y.hp)[0]];
  B.cur=u;perform(u,sk,tg);u.turnsLeft--;
  if(u.turnsLeft<=0&&u.hp>0){sumEnd('done');render();later(advance,PAUSE*.8);return;}
  endTurn(u,1);}
// ----- praying: the next turn of the one who prays fires the summon -----
function sumPray(a,mon){const o=G.summons&&G.summons[mon];if(!o||!sumCan(a))return false;const k=sumClassOf(a);a.mp-=sumCost(a);
  const C=sumCallOf(k);B.pray={by:a,mon,n:C.pray,turns:C.turns,monk:k==='monk'?1:0};autoNote(a,'Invoke '+o.name);
  log(C.pray>1?`${a.name} sits in stillness, calling to ${o.name}. The answer comes in ${C.pray} turns.`:`${a.name} prays to ${o.name}. The answer comes next turn.`);fx(a,C.pray>1?'Stillness':'Praying','stat good');B.menu='root';endTurn(a,1);return true;}
{const ad0=advance;advance=function(){if(B&&!B.over){let u=null;liveUnits().forEach(x=>{if(!u||x.next<u.next||(x.next===u.next&&x.side==='p'))u=x;});
    if(u&&u.isSum){if(checkEnd())return;B.cur=u;B.time=u.next;B.mode='enemy';render();later(()=>sumTurn(u),PAUSE*.8);return;}
    if(u&&B.pray&&B.pray.by===u){const P=B.pray;if(u.hp<=0){B.pray=null;}else{B.cur=u;B.time=u.next;u.guard=false;P.n--;
        if(P.n>0){log(P.monk?`${u.name} keeps still, calling.`:`${u.name} keeps praying.`);fx(u,P.monk?'Stillness':'Praying','stat good');B.mode='wait';render();later(()=>{if(B&&!B.over)endTurn(u,1);},PAUSE*.6);return;}
        B.pray=null;const o=G.summons&&G.summons[P.mon];B.mode='wait';if(o&&sumFire(u,o,P.turns||SUM.turns)){u.next=B.time+delayOf(u,1);render();later(advance,PAUSE*.8);return;}}}}
  return ad0.apply(this,arguments);};}
HOOK.before('fallen','summon8','a summon is driven off instead of falling',function(u){if(u&&u.isSum){u.deathT=Date.now();fx(u,'Driven off','stat bad');sumEnd('ko');render();return HOOK.stop();}if(u&&B&&B.pray&&B.pray.by===u)B.pray=null;});
{const lb0=lbAdd;lbAdd=function(c,n){if(c&&c.isSum)return;return lb0.apply(this,arguments);};}
{const cs0=canSwap;canSwap=function(){if(B&&(B.sum||B.pray))return false;return cs0.apply(this,arguments);};}
// the Vanguard always comes back before the fight ends
HOOK.before('finishBattle','summon8','the summon leaves',function(){try{if(B&&B.sum)sumEnd('done');}catch(e){}});
HOOK.before('win','summon8','the summon leaves',function(){try{if(B&&B.sum)sumEnd('done');}catch(e){}});
HOOK.after('startBattle','summon8','fresh battle',function(r){try{if(r!==false&&B){B.sum=null;B.pray=null;B.sumDead=0;B.summonedBy={};}}catch(e){}});
// ----- the command -----
function sumHint(a){const C=sumCallOf(sumClassOf(a));return C.pray>1?`The guardian answers after ${C.pray} turns of stillness and takes the whole Vanguard's place for ${C.turns} turns. Costs ${sumCost(a)} MP.`:`The guardian answers next turn and takes the whole Vanguard's place for ${C.turns} turns. Costs ${sumCost(a)} MP.`;}
function sumTip(a){const C=sumCallOf(sumClassOf(a));return C.pray>1?`Call a Sanctum guardian: after ${C.pray} turns of stillness it takes the field in place of the Vanguard for ${C.turns} turns`:'Pray for a Sanctum guardian: next turn it takes the field in place of the Vanguard';}
function sumMenuHtml(a){const L=sumList();return `<p class="hint">${sumHint(a)}</p><div class="menu list">${L.map(o=>`<button class="mi tk-ally" data-act="sumPick" data-arg="${o.mon}"><span class="n">${esc(o.name)}</span><span class="m">${(MON[o.mon].el||[]).map(ico).join('')}</span><small>${esc((MON[o.mon].sk||[]).map(s=>s[0]).join(', '))}</small></button>`).join('')}</div>`;}
HOOK.wrap('cmdHtml','summon8','summons menu and Invoke button',function(next,...args){if(B&&B.menu==='summons'&&B.cur){const h=next(...args);const i=h.indexOf('<div class="menu');return (i>=0?h.slice(0,i):h)+sumMenuHtml(B.cur)+'<button class="btn sm cmdback" data-act="back">‹ Back</button>';}
  let h=next(...args);try{const a=B&&B.cur;if(a&&B.menu==='root'&&sumCan(a)){const btn=`<button class="mi summon s8" data-act="sumAsk" title="${sumTip(a)}">Invoke</button>`;h=h.replace('<div class="menu sec">','<div class="menu sec">'+btn);}}catch(e){}return h;});
Object.assign(ACT,{sumAsk(){if(!B||B.mode!=='cmd'||!sumCan(B.cur))return;const L=sumList();if(L.length===1){sumPray(B.cur,L[0].mon);render();return;}B.menu='summons';render();},
  sumPick(mon){if(!B||B.mode!=='cmd'||!sumCan(B.cur))return;if(sumPray(B.cur,mon))render();}});
// the praying hero's card says so
HOOK.after('renderBattle','summon8','praying badge',function(){try{if(!B||!B.pray||V.screen!=='battle')return;const i=allParty().indexOf(B.pray.by);if(i<0)return;const card=document.querySelector(`#bparty [data-act="tgtA"][data-arg="${i}"], #bparty .pc[data-arg="${i}"]`);if(!card||card.querySelector('.s8pray'))return;
  const o=G.summons[B.pray.mon];const s=document.createElement('span');s.className='s8pray';s.textContent='✦ '+(o?o.name:'Praying');s.title=`${B.pray.monk?'Stillness':'Praying'}: ${o?o.name:''} answers ${B.pray.n>1?'in '+B.pray.n+' turns':'next turn'}.`;if(B.pray.n>1)s.textContent+=' · '+B.pray.n;card.appendChild(s);}catch(e){}});
