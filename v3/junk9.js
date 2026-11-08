// ===== junk9.js (v0.11.0): "Sell junk" in the Smithy and Alchemy Sell tabs, and the keep toggle on gear =====
// Junk is gear in the pack (equipped gear never is: it is not in G.gear) that is strictly useless:
//  1) no hero in the roster can equip it, or
//  2) another piece you own beats it on every stat (at least one higher), every hero who could wear this one can wear that one too,
//     and you own as many copies of that piece (pack and worn) as there are heroes who could use this one.
// Never junk: anything kept (G.keepG, the lock on the Sell rows), Medals, signature, unique, bound, Echoforged and legend gear, the
// Tamer's Stick, and pieces with something beyond plain stats (an element, a tome, a role perk, immunities) unless nobody can wear them.
const J9={stat:['atk','mag','def','res','hp','mp','spd','luk','mpEff','elDmg'],special:['tome','immune','el','only','rl','rlD','efPerk']};
function j9Kept(id){try{return !!(G.keepG&&G.keepG[id]);}catch(e){return false;}}
function j9Never(id){const g=gearOf(id);if(!g)return true;const s=String(id);
  return j9Kept(id)||!!(g.medal||g.unique||g.bound||g.stick||g.ef||g.legend||g.sig)||/^(u_|ua_|uk_|sg_)/.test(s)||/_ef(\+\d)?$/.test(s);}
function j9Stats(g){const o={};J9.stat.forEach(k=>{if(typeof g[k]==='number')o[k]=g[k];});if(g.attr)Object.keys(g.attr).forEach(k=>{o['a_'+k]=g.attr[k];});return o;}
function j9Beats(y,x){const Y=j9Stats(y),X=j9Stats(x),K=new Set(Object.keys(Y).concat(Object.keys(X)));let up=false;
  for(const k of K){const a=Y[k]||0,b=X[k]||0;if(a<b)return false;if(a>b)up=true;}return up;}
function j9Owned(){const o={};(G.gear||[]).forEach(id=>{o[id]=(o[id]||0)+1;});Object.values(G.roster).forEach(c=>Object.values(c.eq||{}).forEach(id=>{if(id)o[id]=(o[id]||0)+1;}));return o;}
// {id: {n: copies to sell, why}} for the given slots
function junkList(slots){const out={};if(!G||G.daily)return out;const own=j9Owned(),R=Object.values(G.roster),pack={};
  (G.gear||[]).forEach(id=>{const g=gearOf(id);if(g&&slots.includes(g.slot))pack[id]=(pack[id]||0)+1;});
  Object.keys(pack).forEach(id=>{if(j9Never(id))return;const x=gearOf(id),H=R.filter(c=>{try{return canEquip(c,id);}catch(e){return false;}});
    if(!H.length){out[id]={n:pack[id],why:'Nobody in your roster can use it'};return;}
    if(J9.special.some(k=>x[k]!=null&&x[k]!==0&&x[k]!==''))return;
    const y=Object.keys(own).find(yid=>{if(yid===id)return false;const yg=gearOf(yid);return yg&&yg.slot===x.slot&&own[yid]>=H.length&&j9Beats(yg,x)&&H.every(c=>{try{return canEquip(c,yid);}catch(e){return false;}});});
    if(y)out[id]={n:pack[id],why:`${gearOf(y).n} beats it on every stat and you have enough`};});
  return out;}
function junkGold(L){return Object.keys(L).reduce((a,id)=>a+sellVal(gearOf(id))*L[id].n,0);}
function junkBar(slots){const L=junkList(slots),n=Object.values(L).reduce((a,o)=>a+o.n,0);
  return `<div class="btnrow j9bar"><button class="btn sm ${n?'gold':''}" data-act="junkAsk" data-arg="${slots.join('')}" ${n?'':'disabled'} title="Sells gear nobody can use or that you have something strictly better for. Kept gear (🔒) is never sold.">Sell junk${n?` <span class="nums">(${n})</span>`:''}</button></div>`;}
// the lock on every Sell row
{const sr0=m3SellRows;m3SellRows=function(slots){let h=sr0.apply(this,arguments);try{
  h=h.replace(/<button class="btn sm" data-act="sell" data-arg="([^"]+)">/g,(m,id)=>{const k=j9Kept(id);return `<button class="btn sm j9keep ${k?'on':''}" data-act="keepT" data-arg="${id}" aria-pressed="${k}" title="${k?'Kept: Sell junk leaves it alone. Tap to unlock.':'Keep: Sell junk will never sell this.'}">${k?'🔒':'🔓'}</button>${m}`;});}catch(e){}return h;};}
ACT.keepT=function(id){if(!G)return;G.keepG=G.keepG||{};if(G.keepG[id])delete G.keepG[id];else G.keepG[id]=1;saveGame();render();};
ACT.junkAsk=function(a){const slots=String(a||'').split('').filter(Boolean);if(!slots.length)return;V.modal={type:'junk',slots,from:V.modal};render();};
ACT.junkGo=function(){const m=V.modal;if(!m||m.type!=='junk')return;const L=junkList(m.slots);let gold=0,n=0;
  Object.keys(L).forEach(id=>{for(let k=0;k<L[id].n;k++){const i=G.gear.indexOf(id);if(i<0)break;G.gear.splice(i,1);gold+=sellVal(gearOf(id));n++;}});
  G.gold+=gold;saveGame();sfx('buy');V.modal=m.from||null;toast(`Sold ${n} piece${n===1?'':'s'} of junk for ${fmt(gold)} gold.`);render();};
HOOK.before('vModal','junk9','Sell junk confirm',function(m){if(!m||m.type!=='junk')return;const L=junkList(m.slots),ids=Object.keys(L),gold=junkGold(L);
  const rows=ids.map(id=>{const g=gearOf(id);return `<div class="row tr" style="${tierVars(gTierIdx(g),g)}">${gearIcon(id)}<div class="grow"><b>${esc(g.n)}</b> x${L[id].n}<small>${esc(L[id].why)}.</small></div><span class="m nums">${fmt(sellVal(g)*L[id].n)}</span></div>`;}).join('');
  return HOOK.stop(box('Sell junk',ids.length?`<p class="note">These go for <b class="nums">${fmt(gold)}</b> gold. Worn gear and anything you kept (🔒) stay.</p><div class="rows">${rows}</div>`:'<p class="note">Nothing to sell: everything in your pack is useful to someone.</p>',
    `${ids.length?`<button class="btn gold" data-act="junkGo">Sell all for ${fmt(gold)}</button>`:''}<button class="btn" data-act="xBack">Cancel</button>`));});
