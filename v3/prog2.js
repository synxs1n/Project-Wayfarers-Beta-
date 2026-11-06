// ===== prog2.js (v0.3.2): auto rules: reduced rewards on auto wins, the boss auto lock =====
// B2: a win where auto ran more than half of your heroes' turns pays 66% XP and gold (drops unchanged; not the Daily Trial).
// B3: auto is off on a boss fight (Scourge, Calamity, echo, legend event) until that exact fight has been won manually
// this journey. New optional field G.bossWon {key:1}; old saves count every Scourge or Calamity they already cleared.
// AUTO_REW: in config.js
function bossFightKey(spec){if(!spec||!G||G.daily)return null;const k=spec.kind;
  if(k==='boss')return 'b:'+bossKeyFor(spec.stage);if(k==='storyEcho'||(k==='echoBoss'&&!spec.daily))return 'e:'+spec.key;if(k==='legend')return 'L:'+spec.hero+':'+(spec.step||0);return null;}
// v0.4.1 2.4: no auto at all in elite, miniboss and challenge fights (duels, ambushes, legend events). The reason shows on the Auto button.
function autoBan(spec){if(!spec||!G||G.daily)return null;const k=spec.kind;
  if(k==='elite')return 'No auto in elite fights';
  if(spec.mini||k==='mini')return 'No auto in miniboss fights';
  if(k==='duel'||spec.ce||k==='legend'||k==='challenge'||spec.challenge)return 'No auto in challenge fights';
  return null;}
function autoReason(){if(!B||!G||G.daily)return null;const ban=autoBan(B.spec);if(ban)return ban;const k=bossFightKey(B.spec);return k&&!(G.bossWon||{})[k]?'Win this fight manually once first':null;}
function autoLocked(){return !!autoReason();}
function autoRewardMul(){if(!B||!G||G.daily||B.spec.kind==='daily')return 1;const p=B.tP||0,a=B.tA||0;return p&&a>p/2?AUTO_REW:1;}
function autoBtnHtml(){const why=autoReason();if(why)return `<button class="btn sm autolock" data-act="auto" aria-disabled="true" title="${why}">Auto locked</button><small class="autowhy">${why}</small>`;
  return `<button class="btn sm ${B.auto?'gold':''}" data-act="auto" aria-pressed="${B.auto?'true':'false'}">${B.auto?'Stop auto':'Start auto'}</button>`;}
{const sb0=startBattle;startBattle=function(spec){const r=sb0.apply(this,arguments);try{if(r!==false&&B){B.tP=0;B.tA=0;if(autoLocked()){B.auto=false;B.autoLock=1;}}}catch(e){}return r;};}
{const pf0=perform;perform=function(a){try{if(B&&a&&a.side==='p'&&!a.isComp){B.tP=(B.tP||0)+1;if(B.auto)B.tA=(B.tA||0)+1;}}catch(e){}return pf0.apply(this,arguments);};}
{const at0=autoTurn;autoTurn=function(){if(autoLocked()){if(B)B.auto=false;return;}return at0.apply(this,arguments);};}
{const a0=ACT.auto;ACT.auto=function(){if(autoLocked()){toast('Auto is locked here: '+(autoReason()||'win this fight manually once first').replace(/^./,c=>c.toLowerCase())+'.');if(typeof sfx==='function')sfx('deny');return;}return a0.apply(this,arguments);};}
{const w0=win;win=function(){try{const k=B&&bossFightKey(B.spec);if(k&&!(B.tA>0)){G.bossWon=G.bossWon||{};G.bossWon[k]=1;}}catch(e){}return w0.apply(this,arguments);};}
{const up0=unpackG;unpackG=function(o){const g=up0.apply(this,arguments);try{if(!g.bossWon){g.bossWon={};(g.cleared||[]).forEach((c,s)=>{if(!c||!g.run)return;const k=s<4?(g.run.bosses||[])[s]:g.run.final;if(k)g.bossWon['b:'+k]=1;});}}catch(e){}return g;};}
