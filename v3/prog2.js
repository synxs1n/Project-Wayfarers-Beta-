// ===== prog2.js (v0.3.2): auto rules: the auto/manual reward gap, the boss auto lock, auto per foe type (v0.9.5), battle system counters =====
// B2: a win where auto ran more than half of your heroes' turns pays AUTO_REW of a hand played win's XP and gold (drops unchanged;
// not the Daily Trial). v0.9.5: same numbers, shown the other way round: the rewards screen counts from the auto level and a win you
// play yourself shows "+52% for playing it yourself" (results.js). autoRewardMul is unchanged, so the economy is too.
// B3: auto is off on a boss fight (Scourge, Calamity, echo, legend event) until that exact fight has been won manually
// this journey. New optional field G.bossWon {key:1}; old saves count every Scourge or Calamity they already cleared.
// v0.9.5 auto per foe type: an ordinary fight allows auto once every foe type in it is open: beaten by hand NUDGE.autoKills times this
// journey, or scanned. New optional field G.autoOk {foe name: hand kills, NUDGE.autoKills when scanned}. A save without it (made before
// v0.9.5) starts from the account Bestiary (kills >= NUDGE.autoKills or scanned), so nobody loses auto they had. New journeys start empty.
// v0.9.5 counters per battle (B.nz) for the system bonuses on the rewards screen (results.js): reactions set off by heroes, shields
// broken, telegraphed hits taken while guarding, a Momentum Surge reached.
// AUTO_REW, NUDGE: in config.js
function bossFightKey(spec){if(!spec||!G||G.daily)return null;const k=spec.kind;
  if(k==='boss')return 'b:'+bossKeyFor(spec.stage);if(k==='storyEcho'||(k==='echoBoss'&&!spec.daily))return 'e:'+spec.key;if(k==='legend')return 'L:'+spec.hero+':'+(spec.step||0);return null;}
// v0.4.1 2.4: no auto at all in elite, miniboss and challenge fights (duels, ambushes, legend events). The reason shows on the Auto button.
function autoBan(spec){if(!spec||!G||G.daily)return null;const k=spec.kind;
  if(k==='elite')return 'No auto in elite fights';
  if(spec.mini||k==='mini')return 'No auto in miniboss fights';
  if(k==='duel'||spec.ce||k==='legend'||k==='challenge'||spec.challenge)return 'No auto in challenge fights';
  return null;}
// ----- v0.9.5: auto per foe type -----
const nzLive=()=>!!(typeof NUDGE!=='undefined'&&NUDGE.on&&G&&!G.daily);
function autoOkMap(){if(!G)return {};if(!G.autoOk||typeof G.autoOk!=='object'){// a save from before v0.9.5: start from the account Bestiary
    const o={},N=NUDGE.autoKills;try{Object.keys(META.best||{}).forEach(k=>{const b=META.best[k]||{};if((b.kills||0)>=N||b.scan)o[k]=N;});}catch(e){}G.autoOk=o;}
  return G.autoOk;}
function autoTypeLeft(name){return Math.max(0,NUDGE.autoKills-((autoOkMap()[name])|0));}
const autoTypeFoe=e=>!!(e&&e.side!=='p'&&!e.boss&&!e.elite&&!e.isComp&&e.base);
const anA=n=>(/^[aeiou]/i.test(n)?'an ':'a ')+n;
function autoTypeReason(){if(!B||!nzLive()||!NUDGE.autoKills)return null;if(bossFightKey(B.spec))return null;
  const left=[];(B.en||[]).forEach(e=>{if(!autoTypeFoe(e)||e.hp<=0&&!B.over)return;const n=autoTypeLeft(e.base);if(n>0&&!left.some(x=>x[0]===e.base))left.push([e.base,n]);});
  if(!left.length)return null;left.sort((a,b)=>a[1]-b[1]);const [nm,n]=left[0];
  return `Beat ${anA(nm)} by hand ${n} more time${n>1?'s':''} to auto it`+(left.length>1?` (and ${left.length-1} more foe type${left.length>2?'s':''})`:'');}
function autoTypeOpen(name,why){const M=autoOkMap(),N=NUDGE.autoKills,was=(M[name]|0)>=N;if(why==='scan')M[name]=Math.max(M[name]|0,N);else M[name]=(M[name]|0)+1;
  return !was&&(M[name]|0)>=N;}
function autoReason(){if(!B||!G||G.daily)return null;const ban=autoBan(B.spec);if(ban)return ban;const k=bossFightKey(B.spec);if(k&&!(G.bossWon||{})[k])return 'Win this fight manually once first';
  return autoTypeReason();}
function autoLocked(){return !!autoReason();}
function autoRewardMul(){if(!B||!G||G.daily||B.spec.kind==='daily')return 1;const p=B.tP||0,a=B.tA||0;return p&&a>p/2?AUTO_REW:1;}
// the bonus a hand played win shows over the auto level (the same totals as before: manual = auto x 1/AUTO_REW)
function manualBonusPct(){return Math.round((1/AUTO_REW-1)*100);}
// v0.9.8: the per foe type reason is long: it lives in the button's title and the toast on press, not as a line beside the commands
function autoBtnHtml(){const why=B&&B.auto?null:autoReason();if(why)return `<button class="btn sm autolock" data-act="auto" aria-disabled="true" title="${why}">Auto locked</button>${/^Beat /.test(why)?'':`<small class="autowhy">${why}</small>`}`;
  return `<button class="btn sm ${B.auto?'gold':''}" data-act="auto" aria-pressed="${B.auto?'true':'false'}">${B.auto?'Stop auto':'Start auto'}</button>`;}
HOOK.after('startBattle','prog2','auto counters, boss auto lock',function(r){try{if(r!==false&&B){B.tP=0;B.tA=0;B.nz={react:0,brk:0,guard:0,surge:0,tele:0};if(autoLocked()){B.auto=false;B.autoLock=1;}}}catch(e){}});
HOOK.wrap('perform','prog2','hand and auto turn counters, goal counters',function(next,...args){let a=args[0],sk=args[1],tg=args[2];try{if(B&&a&&a.side==='p'&&!a.isComp){B.tP=(B.tP||0)+1;if(B.auto)B.tA=(B.tA||0)+1;}
    if(B&&B.nz){if(B.b4mo&&B.b4mo.full)B.nz.surge=1;
      // a telegraphed hit (battle4.js: Crushing Charge, Cataclysm) landing on a guarded hero
      if(a&&a.side!=='p'&&sk&&(sk.id==='b4charge'||sk.id==='b4cata')){B.nz.tele++;if((tg||[]).some(c=>c&&c.side==='p'&&c.hp>0&&c.guard))B.nz.guard++;}}}catch(e){}
  const r=next(...args);try{if(B&&B.nz&&B.b4mo&&B.b4mo.full)B.nz.surge=1;}catch(e){}return r;});
HOOK.after('doReaction','prog2','count reactions',function(r,a,t,el){try{if(r&&B&&B.nz&&a&&a.side==='p')B.nz.react++;}catch(e){}});
{const cs0=chipShield;chipShield=function(t){const was=t&&t.broken;const r=cs0.apply(this,arguments);try{if(B&&B.nz&&t&&t.side!=='p'&&!was&&t.broken===2)B.nz.brk++;}catch(e){}return r;};}
{const at0=autoTurn;autoTurn=function(){if(autoLocked()){if(B)B.auto=false;return;}return at0.apply(this,arguments);};}
{const a0=ACT.auto;ACT.auto=function(){if(B&&B.auto)return a0.apply(this,arguments);/* v0.10.0: stopping auto is always allowed */if(autoLocked()){toast('Auto is locked here: '+(autoReason()||'win this fight manually once first').replace(/^./,c=>c.toLowerCase())+'.');if(typeof sfx==='function')sfx('deny');return;}return a0.apply(this,arguments);};}
HOOK.wrap('win','prog2','boss won by hand, auto per foe type opens',function(next,...a){let man=false,kills=null;try{const k=B&&bossFightKey(B.spec);if(k&&!(B.tA>0)){G.bossWon=G.bossWon||{};G.bossWon[k]=1;}
    if(B&&nzLive()&&B.spec&&B.spec.kind!=='daily'){man=autoRewardMul()===1;kills=(B.kills&&B.kills.length?B.kills:B.en).filter(e=>autoTypeFoe(e)&&e.hp<=0);}}catch(e){}
  const was=B,r=next(...a);
  // hand kills open auto per foe type (counted once the whole fight is won, not per wave)
  try{if(man&&kills&&B===was&&B&&B.result){const fresh=[];kills.forEach(e=>{if(autoTypeOpen(e.base)&&!fresh.includes(e.base))fresh.push(e.base);});
    if(fresh.length){B.result.autoNew=fresh;toast(`Auto unlocked against ${fresh.slice(0,2).join(' and ')}${fresh.length>2?' and more':''}.`);}}}catch(e){}
  return r;});
HOOK.after('scan','prog2','scan unlocks auto',function(r,t){try{if(t&&nzLive()&&autoTypeFoe(t)&&B&&B.spec&&B.spec.kind!=='daily'&&autoTypeOpen(t.base,'scan'))toast(`Scanned: auto unlocked against ${t.base}.`);}catch(e){}});
HOOK.after('newGame','prog2','auto per foe type starts closed',function(){try{if(G&&!G.daily)G.autoOk={};}catch(e){}});
HOOK.after('unpackG','prog2','old saves: bosses won',function(g,o){try{if(!g.bossWon){g.bossWon={};(g.cleared||[]).forEach((c,s)=>{if(!c||!g.run)return;const k=s<4?(g.run.bosses||[])[s]:g.run.final;if(k)g.bossWon['b:'+k]=1;});}}catch(e){}});

// v0.10.0: a later arena or trial wave can bring foe types auto is still locked for: auto stops itself instead of leaving a Stop button that refuses
{const nw0=nextWave;nextWave=function(){const r=nw0.apply(this,arguments);try{if(B&&B.auto&&autoLocked()){B.auto=false;V.auto=false;B.autoLock=1;toast('Auto stopped: '+(autoReason()||'').replace(/^./,c=>c.toLowerCase())+'.');render();}}catch(e){}return r;};}
