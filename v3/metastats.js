// ===== metastats.js (v0.10.1): account totals across all journeys =====
// New account field META.stats {play,battles,won,fled,lost,steps,journeys,clears,bosses,dailies,gold,levelUps,recruits,chests,first,seeded},
// every counter defaulted on read (old accounts migrate on first use). Hooks only; see docs/v0101-stats.md.
const MS_KEYS=['play','battles','won','fled','lost','steps','journeys','clears','bosses','dailies','gold','levelUps','recruits','chests'];
let MS_SAVED=0,MS_DAILY=0;
function ms(){
  const S=META.stats=(META.stats&&typeof META.stats==='object')?META.stats:{};
  MS_KEYS.forEach(k=>{if(typeof S[k]!=='number'||!isFinite(S[k]))S[k]=0;});
  if(typeof S.first!=='number')S.first=0;
  if(!S.seeded){
    S.seeded=1;
    S.clears=Math.max(S.clears,META.clears||0);
    let any=false;try{for(let s=0;s<3;s++)if(localStorage.getItem(slotKey(s)))any=true;}catch(e){}
    S.journeys=Math.max(S.journeys,(META.cycles||0)+(any?1:0));
    msSave();
  }
  return S;
}
function msSave(){MS_SAVED=Date.now();try{saveMeta();}catch(e){}}
function msAdd(k,n,now){try{const S=ms();if(!S.first)S.first=Date.now();S[k]+=n;if(now)msSave();}catch(e){}}
function msTick(ms15){try{const S=ms();if(!S.first)S.first=Date.now();S.play+=ms15;if(Date.now()-MS_SAVED>=60000)msSave();}catch(e){}}
setInterval(()=>{try{if(G&&document.visibilityState==='visible'&&(V.screen==='world'||V.screen==='battle'))msTick(15000);}catch(e){}},15000);
HOOK.after('newGame','metastats','new journey counted (not the Daily Trial start)',function(r){if(!MS_DAILY)msAdd('journeys',1,true);});
{const sd0=startDaily;startDaily=function(){MS_DAILY++;try{return sd0.apply(this,arguments);}finally{MS_DAILY--;}};}
HOOK.after('startBattle','metastats','battles started',function(r){if(r!==false&&B)msAdd('battles',1,true);});
HOOK.after('finishBattle','metastats','won, fled and lost (journey fights)',function(r,how){try{if(G&&G.daily)return;const k=how==='win'?'won':how==='fled'?'fled':how==='lose'?'lost':null;if(k)msAdd(k,1,true);}catch(e){}});
HOOK.wrap('win','metastats','gold earned, boss wins, journey clears',function(next,...a){
  const was=B,prev=B&&B.result,c0=META.clears||0,r=next(...a);
  try{if(was&&B===was&&B.result&&B.result!==prev&&!(G&&G.daily)){const S=ms();S.gold+=Math.max(0,+B.result.gold||0);if(B.spec&&B.spec.kind==='boss')S.bosses++;
    S.clears=Math.max(S.clears+((META.clears||0)>c0?1:0),0);msSave();}}catch(e){}
  return r;});
{const dw=dailyWin,dl=dailyLose;
  dailyWin=function(){const r=dw.apply(this,arguments);try{const S=ms();S.won++;S.dailies++;msSave();}catch(e){}return r;};
  dailyLose=function(){const r=dl.apply(this,arguments);try{const S=ms();S.lost++;S.dailies++;msSave();}catch(e){}return r;};}
{const ar0=arrive;arrive=function(){try{if(G&&!G.daily)ms().steps++;}catch(e){}return ar0.apply(this,arguments);};}
{const ax0=addXp;addXp=function(){const u=ax0.apply(this,arguments);try{if(G&&!G.daily&&u&&u.length)msAdd('levelUps',u.length);}catch(e){}return u;};}
{const rc0=recruit;recruit=function(){const n0=G?Object.keys(G.roster).length:0,r=rc0.apply(this,arguments);try{if(r&&G&&Object.keys(G.roster).length>n0)msAdd('recruits',1,true);}catch(e){}return r;};}
HOOK.wrap('openChest','metastats','chests opened',function(next,x,y){let fresh=false;try{fresh=!G.chests[WS.m.id+':'+x+','+y];}catch(e){}const r=next(x,y);if(fresh)msAdd('chests',1,true);return r;});
function metaBlock(){
  const S=ms(),row=(b,s)=>`<div class="row"><div class="grow"><b>${b}</b></div><span class="m nums">${s}</span></div>`;
  return `<h4>Account totals</h4><div class="rows compact metarows">
    ${row('Play time',S.play?durText(S.play):'Counting from now')}
    ${row('Journeys · cleared',`${fmt(S.journeys)} · ${fmt(S.clears)}`)}
    ${row('Battles won · fled · lost',`${fmt(S.won)} · ${fmt(S.fled)} · ${fmt(S.lost)}`)}
    ${row('Bosses defeated',fmt(S.bosses))}${row('Daily Trials finished',fmt(S.dailies))}
    ${row('Steps walked',fmt(S.steps))}${row('Gold earned in battle',fmt(S.gold))}
    ${row('Level ups',fmt(S.levelUps))}${row('Wayfarers recruited',fmt(S.recruits))}${row('Chests opened',fmt(S.chests))}
    ${S.first?row('First played',new Date(S.first).toLocaleDateString()):''}</div>`;
}
window.__MS={get stats(){return ms();},tick:msTick,save:msSave};
