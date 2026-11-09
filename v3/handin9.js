// ===== handin9.js (v0.11.9): hand in where you took it, and quest markers =====
// Quests and bounties accepted from now on carry hand:'board' and are claimed only at the Notice Board of their realm's town (the
// board that posted them). A beaten bounty beast leaves its reward with the board (state 'ready') until you claim it there. Legend,
// Tamer and global quests (no board) claim anywhere; guild notices and missions claim at any Guild Hall (factions.js, guild7.js).
// Quests and bounties accepted before this update (no hand flag) still claim anywhere, so nobody is stranded.
// Markers: an active bounty beast, rival or legend shows on the area map and minimap even before that tile has been seen.
function handFree(q){return !q||!q.hand||q.type==='legend'||q.type==='tamer'||!!q.global;}
function atBoardOf(s){try{return !!(V.modal&&V.modal.type==='board')&&inTown()&&g7TownStage()===s;}catch(e){return false;}}
function canHandIn(q){if(q&&(q.type==='guild'||q.type==='arena'))return !!(V.modal&&V.modal.type==='guild');/* v0.16.1: guild and arena quests are handed in at a Guild Hall, never from the Menu (even old quests without a hand field) */if(handFree(q))return true;return atBoardOf(q.stage);}
function handWhere(q){if(q.type==='guild'||q.type==='arena')return 'Hand in at any Guild Hall.';try{return `Hand in at the ${ZS(q.stage).town} Notice Board.`;}catch(e){return 'Hand in at its Notice Board.';}}
{const a0=ACT.qAccept;ACT.qAccept=function(id){const q=G&&G.quests.find(x=>x.id===id),was=q&&q.state;const r=a0.apply(this,arguments);try{if(q&&was==='open'&&q.state==='active'&&!handFree(Object.assign({},q,{hand:1})))q.hand='board';saveGame();}catch(e){}return r;};}
{const b0=ACT.bounty;ACT.bounty=function(id){const b=G&&G.bounties.find(x=>x.id===id),was=b&&b.state;const r=b0.apply(this,arguments);try{if(b&&was==='open'&&b.state==='active'){b.hand='board';saveGame();}}catch(e){}return r;};}
{const c0=ACT.qClaim;ACT.qClaim=function(id){const q=G&&G.quests.find(x=>x.id===id);if(q&&!canHandIn(q)){toast(handWhere(q));try{sfx('deny');}catch(e){}return;}return c0.apply(this,arguments);};}
// the Claim button in the quest rows: greyed with the place to go when this is not that place
{const r0=nbQuestRow;nbQuestRow=function(q){let h=r0.apply(this,arguments);try{if(q&&q.state==='active'&&questReady(q)&&!canHandIn(q)){
  h=h.replace(`<button class="btn sm gold" data-act="qClaim" data-arg="${q.id}">Claim</button>`,`<span class="m"><button class="btn sm" disabled title="${esc(handWhere(q))}">Claim</button><small class="handwhere">${esc(handWhere(q))}</small></span>`);}}catch(e){}return h;};}
// ----- bounties: the reward waits at the board -----
function bountyReady(b){return !!(b&&b.state==='ready');}
{const s0=nbBState;nbBState=function(b){if(bountyReady(b))return 'ready';return s0.apply(this,arguments);};}
{const n0=nbSecs;nbSecs=function(tab){const L=n0.apply(this,arguments);try{if(tab==='bounties'){const n=nbBountyList().filter(bountyReady).length;if(n)L.splice(1,0,['ready','Ready',n]);}}catch(e){}return L;};}
function bountyReward(b){const s=b.stage,parts=[];G.gold+=econG(b.reward.gold);parts.push(fmt(econG(b.reward.gold))+' gold');
  if(b.reward.charm){G.gear.push(b.reward.charm);parts.push(gearOf(b.reward.charm).n);}
  if(b.reward.mat){const mt=ZS(s).mat;G.mats[mt]=(G.mats[mt]||0)+b.reward.mat;parts.push(b.reward.mat+' x '+MATS[mt]);}return parts;}
ACT.bountyClaim=function(id){const b=G&&G.bounties.find(x=>x.id===id);if(!b||!bountyReady(b))return;if(!atBoardOf(b.stage)){toast(`Claim it at the ${ZS(b.stage).town} Notice Board.`);try{sfx('deny');}catch(e){}return;}
  const parts=bountyReward(b);b.state='done';saveGame();try{sfx('buy');}catch(e){}toast(`Bounty paid: ${parts.join(', ')}.`);render();};
{const nb0=nbBounties;nbBounties=function(sec){const all=G.bounties||[],R=nbBountyList().filter(bountyReady);let h='';
  if(R.length&&(sec==='all'||sec==='ready')){h+=`${sec==='all'?m3H('Ready to hand in'):''}<div class="rows">${R.map(b=>{const here=atBoardOf(b.stage),mo=MON[b.mon];
    return `<div class="row"><img class="mimg" src="${monURL(mo.art)}" alt=""><div class="grow"><b>${esc(b.name)}</b> <em class="qtag">Beaten</em><small>${fmt(econG(b.reward.gold))} gold, ${gearOf(b.reward.charm).n}, ${b.reward.mat} x ${MATS[ZS(b.stage).mat]}.</small>${here?'':`<small class="handwhere">Claim it at the ${esc(ZS(b.stage).town)} Notice Board.</small>`}</div><button class="btn sm gold" data-act="bountyClaim" data-arg="${b.id}" ${here?'':'disabled'}>Claim</button></div>`;}).join('')}</div>`;}
  if(sec==='ready')return `<p class="note">Bounty rewards wait at the board that posted them.</p>${h||m3Rows('','Nothing to hand in yet.')}`;
  G.bounties=all.filter(b=>!bountyReady(b));try{return h+nb0.apply(this,arguments);}finally{G.bounties=all;}};}
// the beast falls: with a hand flag the reward is taken back out of the win and waits at the board
HOOK.wrap('win','handin9','bounty reward waits at the board',function(next,...a){const sp=B&&B.spec,b=sp&&sp.kind==='elite'&&sp.bounty;const r=next(...a);
  try{if(!b||b.personal||!b.hand||G.daily)return r;const info=V.modal&&V.modal.info;const g=econG(b.reward.gold);
    G.gold-=g;if(b.reward.charm){const i=G.gear.lastIndexOf(b.reward.charm);if(i>=0)G.gear.splice(i,1);}if(b.reward.mat){const mt=ZS(sp.stage).mat;G.mats[mt]=Math.max(0,(G.mats[mt]||0)-b.reward.mat);}
    b.state='ready';if(info){info.gold=Math.max(0,(info.gold||0)-g);if(info.gear===b.reward.charm)info.gear=null;info.bountyHeld=1;info.bounty=`${b.name}: the reward waits at the ${ZS(b.stage).town} Notice Board`;}saveGame();}catch(e){}return r;});
{const nz0=nzBattleGold;nzBattleGold=function(info,spec){const g=nz0.apply(this,arguments);try{if(info&&info.bountyHeld&&spec&&spec.bounty)return g+econG(spec.bounty.reward.gold);}catch(e){}return g;};}
// the board marker: "ready" only for what THIS board pays out
boardState=function(){if(!G)return null;try{const here=g7TownStage(),Q=G.quests.filter(q=>q.stage<=G.stage);
  if(Q.some(q=>q.state==='active'&&questReady(q)&&(handFree(q)||(q.type!=='guild'&&q.type!=='arena'&&q.stage===here)))||(G.bounties||[]).some(b=>bountyReady(b)&&b.stage===here))return 'ready';
  if(Q.some(q=>q.state==='open'&&q.type!=='legend'&&g7OnBoard(q,here)))return 'new';}catch(e){}return null;};
// ----- markers: active quest targets show before their tile is seen -----
{const mm0=mapMarks;mapMarks=function(m){const o=mm0.apply(this,arguments);try{if(m&&m.kind==='field'&&!G.daily){const have=new Set(o.filter(q=>q.k==='quest'||q.k==='questghost').map(q=>q.x+','+q.y));
  dynActors(m).forEach(a=>{if(!(a.type==='elite'||a.type==='rival'||a.type==='legend')||have.has(a.x+','+a.y))return;o.push({x:a.x,y:a.y,k:ghostActor(a)?'questghost':'quest',far:1});});}}catch(e){}return o;};}
{const wn0=wmName;wmName=function(n,full){let s=wn0.apply(this,arguments);try{if(full&&n.kind==='town'){const st=typeof n.stage==='number'?n.stage:+(String(n.id).slice(1));if(!(st>=0))return s;
  const ready=G.quests.some(q=>q.state==='active'&&questReady(q)&&!handFree(q)&&q.type!=='guild'&&q.type!=='arena'&&q.stage===st)||(G.bounties||[]).some(b=>bountyReady(b)&&b.stage===st);if(ready)s+=' · hand in!';}}catch(e){}return s;};}
{const st=document.createElement('style');st.textContent='.handwhere{display:block;color:#ffd98a;font-size:.72em;max-width:9em;text-align:right}';document.head.appendChild(st);}
