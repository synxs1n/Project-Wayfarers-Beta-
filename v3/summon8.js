// ===== summon8.js (v0.10.7): Sanctums and Summons =====
// Sanctums (the side fortresses, renamed) always end in one unique guardian (MINIS in sites.js, one per journey per site). Beating
// it adds the guardian to G.summons {mon:{mon,name,mod,lv}} (optional save field; old saves rebuild it from G.miniDone and
// G.miniPick). Priests (the Healer class) can Invoke a summon in battle: the Priest spends a turn praying (B.pray), and on their
// next turn the guardian takes the field in place of the WHOLE Vanguard (B.front becomes [the summon]) for SUM.turns of its own
// turns, hitting with the guardian's skills. When it ends, or if it falls, the Vanguard returns as it was (HP untouched); a fallen
// summon blocks summoning for the rest of the battle. Costs SUM.mp of the Priest's max MP, once per Priest per battle. Monks from
// level SUM.monkLv get a lesser call: two turns of praying, a weaker (SUM.lesser) summon that takes only the Monk's own place for
// SUM.lesserTurns turns. Never in the Daily Trial; auto battle never prays (the summon still acts if it is already out).
const SUM={turns:3,mp:.3,mpMin:10,hpK:1.2,lvUp:2,powM:.95,lesser:.6,lesserTurns:2,monkLv:10,monkPray:2};
function sumList(){try{return Object.values(G.summons||{});}catch(e){return [];}}
function sumUnlock(mon,name,mod){if(!G||G.daily||!MON[mon])return false;G.summons=G.summons||{};if(G.summons[mon])return false;G.summons[mon]={mon,name:name||MON[mon].n,mod:mod||null,at:Date.now()};return true;}
// old saves: guardians already beaten become summons
{const up0=unpackG;unpackG=function(){const r=up0.apply(this,arguments);try{if(G&&!G.summons&&G.miniDone&&G.miniPick&&typeof MINIS!=='undefined'){G.summons={};Object.keys(G.miniDone).forEach(id=>{const i=G.miniPick[id];const D=i!=null&&MINIS[i];if(D)sumUnlock(D[0],D[2],D[5]);});}}catch(e){}return r;};}
// every Sanctum has its guardian (caves keep their chance)
{const sh0=siteHasMini;siteHasMini=function(id){if(typeof id==='string'&&id[0]==='o')return true;return sh0.apply(this,arguments);};}
HOOK.after('win','summon8','a beaten guardian becomes a summon',function(){try{const sp=B&&B.spec,mi=sp&&sp.mini;if(!mi||typeof mi!=='object'||!G||G.daily)return;if(sumUnlock(mi.mon,mi.name,mi.mod)){const info=(B&&B.result)||(V.modal&&V.modal.info);if(info){info.notes=info.notes||[];info.notes.push(`${mi.name} is bound to your cause: a Priest can now Invoke it in battle (a Monk from level ${SUM.monkLv} can call a lesser form).`);}}}catch(e){}});
// ----- who can summon -----
function sumClassOf(a){try{const t=TPL[a.id];if(!t||!B||a.side!=='p'||a.isComp||a.isSum)return null;if(t.cls==='healer')return 'priest';if(t.cls==='monk'&&a.lv>=SUM.monkLv)return 'monk';}catch(e){}return null;}
function sumCan(a){if(!B||!G||G.daily||B.auto||!a||a.hp<=0)return false;if(B.sum||B.sumDead||B.pray)return false;const k=sumClassOf(a);if(!k||!sumList().length)return false;if((B.summonedBy||{})[a.id])return false;return a.mp>=sumCost(a);}
function sumCost(a){return Math.max(SUM.mpMin,Math.round(a.S.mmp*SUM.mp));}
// ----- the unit -----
function sumMake(o,lesser,owner){const m=MON[o.mon];const heroes=B.front.filter(c=>c.hp>0),lv=Math.round(heroes.reduce((q,c)=>q+c.lv,0)/Math.max(1,heroes.length))+SUM.lvUp;
  const u=makeEnemy(m,lv,{elite:true,name:o.name,mod:o.mod,noField:1,noBuff:1,hpM:1,powM:SUM.powM*(lesser?SUM.lesser:1)});
  u.side='p';u.isSum=1;u.id='sum_'+o.mon;u.base=o.name;u.lb=0;u.owner=owner||null;u.lesser=!!lesser;u.turnsLeft=lesser?SUM.lesserTurns:SUM.turns;
  const pool=lesser?(owner?owner.S.mhp:0):B.front.reduce((q,c)=>q+(c.S?c.S.mhp:0),0);u.S.mhp=Math.max(u.S.mhp,Math.round(pool*SUM.hpK*(lesser?.8:1)));u.hp=u.S.mhp;u.S.mmp=999;u.mp=999;
  if(!TPL[u.id])TPL[u.id]={id:u.id,n:o.name,cls:'warrior',el:m.el.slice(),trait:'brave',bio:`${o.name}, guardian of a Sanctum, bound to your cause.`,src:'sum',look:null,mon:o.mon,art:m.art,summon:1};
  u.msk=(m.sk||[]).map(s=>({id:'s'+s[0],n:s[0],el:s[1],pw:+(s[2]*1.05).toFixed(2),t:s[3]==='all'?'all':s[3]==='self'?'self':'one',k:s[4]==='buff'?'buff':s[4],fx:s[5]||null,mp:0,cost:1,hits:1}));
  return u;}
function sumFire(a,o,lesser){const u=sumMake(o,lesser,lesser?a:null);
  if(lesser){const i=B.front.indexOf(a);if(i<0)return false;B.sum={u,lesser:1,slot:i,owner:a,by:a};B.front[i]=u;a.hidden=1;}
  else{B.sum={u,front:B.front,by:a};B.front=[u];}
  B.summonedBy=B.summonedBy||{};B.summonedBy[a.id]=1;u.next=B.time;u.enterT=Date.now();
  banner(`${o.name}!`,ELC[(MON[o.mon].el||[])[0]]||'#ffd04a');log(lesser?`${a.name}'s call is answered: a lesser ${o.name} takes ${a.name}'s place for ${u.turnsLeft} turns.`:`${a.name}'s prayer is answered: ${o.name} takes the field for ${u.turnsLeft} turns while the Vanguard steps back.`);
  if(typeof sfx==='function')sfx('level');return true;}
function sumEnd(why){const S=B&&B.sum;if(!S)return;const u=S.u;
  if(S.lesser){const i=B.front.indexOf(u);if(i>=0)B.front[i]=S.owner;S.owner.hidden=0;S.owner.next=B.time+delayOf(S.owner,.4);S.owner.enterT=Date.now();}
  else{B.front=S.front;B.front.forEach((c,i)=>{c.hidden=0;c.next=B.time+delayOf(c,.3+.15*i);c.enterT=Date.now();});}
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
  B.pray={by:a,mon,n:k==='monk'?SUM.monkPray:1,lesser:k==='monk'};autoNote(a,'Invoke '+o.name);
  log(k==='monk'?`${a.name} sits in stillness, calling to ${o.name}.`:`${a.name} prays to ${o.name}. The answer comes next turn.`);fx(a,'Praying','stat good');B.menu='root';endTurn(a,1);return true;}
{const ad0=advance;advance=function(){if(B&&!B.over){let u=null;liveUnits().forEach(x=>{if(!u||x.next<u.next||(x.next===u.next&&x.side==='p'))u=x;});
    if(u&&u.isSum){if(checkEnd())return;B.cur=u;B.time=u.next;B.mode='enemy';render();later(()=>sumTurn(u),PAUSE*.8);return;}
    if(u&&B.pray&&B.pray.by===u){const P=B.pray;if(u.hp<=0){B.pray=null;}else{B.cur=u;B.time=u.next;u.guard=false;P.n--;
        if(P.n>0){log(`${u.name} keeps praying.`);fx(u,'Praying','stat good');B.mode='wait';render();later(()=>{if(B&&!B.over)endTurn(u,1);},PAUSE*.6);return;}
        B.pray=null;const o=G.summons&&G.summons[P.mon];B.mode='wait';if(o&&sumFire(u,o,P.lesser)){u.next=B.time+delayOf(u,1);render();later(advance,PAUSE*.8);return;}}}}
  return ad0.apply(this,arguments);};}
{const fl0=fallen;fallen=function(u){if(u&&u.isSum){u.deathT=Date.now();fx(u,'Driven off','stat bad');sumEnd('ko');render();return;}if(u&&B&&B.pray&&B.pray.by===u)B.pray=null;return fl0.apply(this,arguments);};}
{const lb0=lbAdd;lbAdd=function(c,n){if(c&&c.isSum)return;return lb0.apply(this,arguments);};}
{const cs0=canSwap;canSwap=function(){if(B&&(B.sum||B.pray))return false;return cs0.apply(this,arguments);};}
// the Vanguard always comes back before the fight ends
HOOK.before('finishBattle','summon8','the summon leaves',function(){try{if(B&&B.sum)sumEnd('done');}catch(e){}});
HOOK.before('win','summon8','the summon leaves',function(){try{if(B&&B.sum)sumEnd('done');}catch(e){}});
HOOK.after('startBattle','summon8','fresh battle',function(r){try{if(r!==false&&B){B.sum=null;B.pray=null;B.sumDead=0;B.summonedBy={};}}catch(e){}});
// ----- the command -----
function sumMenuHtml(a){const L=sumList();return `<p class="hint">${sumClassOf(a)==='monk'?`A lesser form answers after two turns of stillness and takes ${esc(a.name)}'s place for ${SUM.lesserTurns} turns.`:`The guardian answers next turn and takes the whole Vanguard's place for ${SUM.turns} turns. Costs ${sumCost(a)} MP.`}</p><div class="menu list">${L.map(o=>`<button class="mi tk-ally" data-act="sumPick" data-arg="${o.mon}"><span class="n">${esc(o.name)}</span><span class="m">${(MON[o.mon].el||[]).map(ico).join('')}</span><small>${esc((MON[o.mon].sk||[]).map(s=>s[0]).join(', '))}</small></button>`).join('')}</div>`;}
{const ch0=cmdHtml;cmdHtml=function(){if(B&&B.menu==='summons'&&B.cur){const h=ch0.apply(this,arguments);const i=h.indexOf('<div class="menu');return (i>=0?h.slice(0,i):h)+sumMenuHtml(B.cur)+'<button class="btn sm cmdback" data-act="back">‹ Back</button>';}
  let h=ch0.apply(this,arguments);try{const a=B&&B.cur;if(a&&B.menu==='root'&&sumCan(a)){const k=sumClassOf(a),btn=`<button class="mi summon s8" data-act="sumAsk" title="${k==='monk'?'Call a lesser guardian to take your place after two turns of stillness':'Pray for a Sanctum guardian: next turn it takes the field in place of the Vanguard'}">${k==='monk'?'Spirit Call':'Invoke'}</button>`;h=h.replace('<div class="menu sec">','<div class="menu sec">'+btn);}}catch(e){}return h;};}
Object.assign(ACT,{sumAsk(){if(!B||B.mode!=='cmd'||!sumCan(B.cur))return;const L=sumList();if(L.length===1){sumPray(B.cur,L[0].mon);render();return;}B.menu='summons';render();},
  sumPick(mon){if(!B||B.mode!=='cmd'||!sumCan(B.cur))return;if(sumPray(B.cur,mon))render();}});
// the praying hero's card says so
HOOK.after('renderBattle','summon8','praying badge',function(){try{if(!B||!B.pray||V.screen!=='battle')return;const i=allParty().indexOf(B.pray.by);if(i<0)return;const card=document.querySelector(`#bparty [data-act="tgtA"][data-arg="${i}"], #bparty .pc[data-arg="${i}"]`);if(!card||card.querySelector('.s8pray'))return;
  const o=G.summons[B.pray.mon];const s=document.createElement('span');s.className='s8pray';s.textContent='✦ '+(o?o.name:'Praying');s.title=`Praying: ${o?o.name:''} answers ${B.pray.n>1?'in '+B.pray.n+' turns':'next turn'}.`;card.appendChild(s);}catch(e){}});
