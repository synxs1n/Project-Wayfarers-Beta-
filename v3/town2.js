// ===== town2.js (v0.3.3): the Inn, bonds on the hero sheet, weather and time info, the popup key guard =====
// Inn: Rest first and focused, no bond list. Bonds live on the hero sheet (and the Codex entry), with every unlocked
// campfire scene watchable there, so nothing the Inn used to trigger is unreachable. Bond progress (G.bonds, G.talks) is untouched.
// Weather and day/night tags open a popup explaining their effect in this realm.
function mInn(){
  const cost=innCost(townS()),ok=G.gold>=cost;
  return box('The Lantern Inn',`<div class="btnrow innb"><button class="btn gold big" data-act="rest" ${ok?'':'disabled'}>Rest for ${cost} gold${G.cleared[townS()]?' (festival price)':''}</button><button class="btn" data-act="save">Save journey</button></div>
    <p class="note">A warm bed for your wayfarers. Rest restores HP and MP, clears ailments and brings the morning.${ok?'':' You cannot afford a room right now.'}</p>`,
    '<button class="btn" data-act="closeModal">Leave</button>');
}
HOOK.after('render','town2','focus Rest in the Inn',function(){try{if(V.modal&&V.modal.type==='inn'){const b=document.querySelector('#modal [data-act="rest"]');if(b&&!document.querySelector('#modal :focus')&&!b.disabled)b.focus({preventScroll:true});const p=document.querySelector('#modal .panel');if(p)p.scrollTop=0;}}catch(e){}});
// ----- bonds on the hero sheet -----
function bondScenes(b){const S=[{lv:1,lines:b.talk,n:'Campfire talk'}];if(b.talk2)S.push({lv:3,lines:b.talk2,n:'Second talk'});return S;}
const talkPending=(k,lv)=>(G.talks||[]).some(t=>t.k===k&&(t.lv===lv||(t.lv>=3&&lv===1&&!BONDMAP[k].talk2)));
function bondCodex(id){const L=BONDS.filter(b=>b.a===id||b.b===id);if(!L.length)return '';
  return `<h4>Bonds</h4><div class="rows compact">${L.map(b=>{const o=b.a===id?b.b:b.a,here=G&&G.roster&&G.roster[o]&&G.roster[id];return `<div class="row"><div><b>${esc(TPL[o].n)}: ${esc(b.tech.n)}</b><small>${esc(b.tech.d)}</small></div>${here?`<span class="m nums">Lv ${bondLv(b.a,b.b)}</span>`:''}</div>`;}).join('')}</div>`;}
ACT.bondTalk=function(a){const [k,l]=String(a).split(':'),lv=+l,b=BONDMAP[k];if(!b||!G.roster[b.a]||!G.roster[b.b])return;
  const sc=bondScenes(b).find(s=>s.lv===lv);if(!sc||bondLv(b.a,b.b)<Math.min(lv,3))return;
  G.talks=(G.talks||[]).filter(t=>!(t.k===k&&(t.lv===lv||(t.lv>=3&&lv===1&&!b.talk2))));saveGame();V.modal={type:'talk',lines:sc.lines,i:0,from:V.modal};render();};
ACT.campfire=function(){const t=(G.talks||[])[0];if(!t)return;ACT.bondTalk(t.k+':'+(t.lv>=3&&BONDMAP[t.k].talk2?3:1));};
ACT.talkNext=function(){const m=V.modal;if(m.i<m.lines.length-1){m.i++;render();}else{V.modal=m.from||null;render();}};
// ----- weather and time popups -----
const pc=v=>(v>1?'+':'-')+Math.round(Math.abs(v-1)*100)+'%';
function wxInfoBody(kind){
  if(kind==='indoors')return '<p><b>⌂ Indoors</b></p><p>Dungeons, caves, sanctums and the Archive have no sky. Weather, clouds and the time of day do not reach in here, and fights down here are never changed by them.</p><p class="note">Outside, the tag above shows the realm\'s weather (Clear included) and the time of day.</p>';
  if(kind==='time'){const ph=clockPhase(),t=((G.clock||0)%CLK_LEN+CLK_LEN)%CLK_LEN,cur=CLK_PH.find(p=>t>=p[1]&&t<p[2])||CLK_PH[0],left=Math.max(1,Math.ceil(cur[2]-t)),nx=CLK_PH[(CLK_PH.indexOf(cur)+1)%CLK_PH.length][0];
    const fx={day:'Normal. Nothing changes.',dusk:'Only the light changes: amber light shafts slant through the air, fireflies come out and the windows glow. Night is coming.',night:`Two of each field\'s four foes are replaced by night variants (Shadow added to their elements) and every field foe is ${Math.round((NIGHT_POW-1)*100)}% stronger.`,dawn:'Only the light changes: a cool mist drifts low, gold shafts break through and the dew sparkles. Morning is coming.'}[ph];
    return `<p><b>${PH_LOOK[ph].i} ${PH_LOOK[ph].n}</b></p><p>${fx}</p><p class="note">The clock moves with you: 1 step per tile and 6 per battle, never with real time. About ${left} more before ${PH_LOOK[nx].n.toLowerCase()}. Resting at an inn brings morning. Dungeons, the Archive and the Daily Trial ignore it.</p>`;}
  const inB=V.screen==='battle'&&B,s=inB?B.stage:WS.m&&WS.m.s,w=inB?(B.weather||'clear'):G.weather[s],W=WEATHER[w];if(!W)return '<p>Nothing special in the air.</p>';
  const up=Object.keys(W.el||{}).filter(k=>W.el[k]>1).map(k=>`${EL[k]} ${pc(W.el[k])}`),dn=Object.keys(W.el||{}).filter(k=>W.el[k]<1).map(k=>`${EL[k]} ${pc(W.el[k])}`);
  const steps=(G.wxSave||{})[s]!=null?null:(G.wx||{})[s];
  return `<p><b>${W.i} ${esc(W.n)}</b> in ${esc(ZS(s).n)}</p><p>${esc(W.d)}</p>
    <div class="rows compact">${up.length?`<div class="row"><b>Boosts</b><span class="up">${up.join(', ')}</span></div>`:''}${dn.length?`<div class="row"><b>Weakens</b><span class="dn">${dn.join(', ')}</span></div>`:''}${W.sup?`<div class="row"><b>Rare sky</b><span>${W.when?W.when[0].toUpperCase()+W.when.slice(1)+' only. ':''}Foes feel it too.</span></div>`:''}${W.gold||W.xp?`<div class="row"><b>Rewards</b><span class="up">${W.gold?'Gold '+pc(W.gold)+' ':''}${W.xp?'XP '+pc(W.xp):''}</span></div>`:''}${W.mat?`<div class="row"><b>Drops</b><span class="up">Extra realm material ${Math.round(W.mat*100)}%, Dread Core ${Math.round((W.core||0)*100)}% per foe</span></div>`:''}${W.crit?`<div class="row"><b>Critical</b><span class="up">+${Math.round(W.crit*100)}% chance</span></div>`:''}${W.enc?`<div class="row"><b>Encounters</b><span>${W.enc>1?'More':'Fewer'} random battles (${pc(W.enc)})</span></div>`:''}</div>
    <p class="note">${steps==null?'This weather is held in place and will not change on its own.':`Lasts roughly ${Math.max(1,Math.round(steps/10)*10)} more steps in this realm, then a new one rolls.`} It only applies to battles fought here, and the Daily Trial ignores it.</p>`;}
Object.assign(ACT,{wxInfo(k){V.modal={type:'wxinfo',kind:k,from:V.modal};render();}});
HOOK.before('vModal','town2','wxinfo popup (weather, time of day)',function(m){if(m&&m.type==='wxinfo')return HOOK.stop(box(m.kind==='time'?'Time of day':'Weather',wxInfoBody(m.kind),'<button class="btn gold" data-act="closeModal">OK</button>'));});
// v0.4.3: on PC, the Space or Enter press that opens the Inn (or any popup) must not also press the button that gets focus.
// Keyboard "clicks" (detail 0) are dropped while the key that opened the popup is still held.
let MODAL_LAST=null;
let MODAL_KEY=null;
HOOK.before('render','town2','note the key that opened a popup (key guard)',function(){const was=MODAL_LAST,now=V.modal&&V.modal.type||null;if(now&&now!==was){try{MODAL_KEY=[...KEYS_DOWN].find(k=>k===' '||k==='Enter')||null;}catch(e){MODAL_KEY=null;}}MODAL_LAST=now;});
window.addEventListener('keyup',e=>{if(MODAL_KEY&&e.key===MODAL_KEY)setTimeout(()=>{MODAL_KEY=null;},0);},true);
document.addEventListener('click',e=>{if(e.detail===0&&MODAL_KEY&&e.target&&e.target.closest&&e.target.closest('#modal')){e.stopPropagation();e.preventDefault();}},true);
// v0.11.4: the Inn asks first when nobody needs rest, and a night's rest can bring a ready bond talk (like the campfire)
function innNeedsRest(){try{return G.party.map(id=>G.roster[id]).some(c=>c&&(c.hp<c.S.mhp||c.mp<c.S.mmp||Object.keys(c.ail||{}).length));}catch(e){return true;}}
{const r0=ACT.rest;ACT.rest=function(force){if(force!=='y'&&!innNeedsRest()){V.modal={type:'innSure',from:V.modal};render();return;}
  if(V.modal&&V.modal.type==='innSure')V.modal=V.modal.from||null;const g0=G.gold;r0.apply(this,arguments);
  try{if(G.gold<g0&&typeof readyTalks==='function'){const T=readyTalks();if(T.length)V.modal={type:'innTalk',T};render();}}catch(e){}};}
HOOK.before('vModal','town2','Inn: rest anyway? and talks after a rest',function(m){
  if(m&&m.type==='innSure')return HOOK.stop(box('Rest anyway?','<p>Everyone in your six is already at full HP and MP. Rest anyway? It still costs a room and brings the morning.</p>','<button class="btn" data-act="xBack">Not now</button><button class="btn gold" data-act="rest" data-arg="y">Rest anyway</button>'));
  if(m&&m.type==='innTalk')return HOOK.stop(box('By the hearth',`<p class="note">Rested and warm, some of your wayfarers have something to say.</p><div class="rows">${m.T.map(o=>`<div class="row"><div class="grow"><b>${esc(TPL[o.b.a].n)} and ${esc(TPL[o.b.b].n)}</b><small>A talk is ready.</small></div><button class="btn sm gold" data-act="bondTalk" data-arg="${o.arg}">Listen</button></div>`).join('')}</div>`,'<button class="btn gold" data-act="closeModal">Good night</button>'));});
