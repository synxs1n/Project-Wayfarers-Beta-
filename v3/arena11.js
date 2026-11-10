// ===== arena11.js (v0.16.x, owner batch 8): arena score and medals, Weekly Trial =====
// 1) Arena score per tier (win only), like the trial's: waves x 1500 - hero turns x 18 - knockouts x 250 + party HP left x 2000 (never below 0).
//    The best per tier is kept in G.arenaBest[tier] = {score,turns,kos} (optional journey field; older saves load without it).
//    The Guild Hall arena page reads "Cleared 2x · Best score 4,310"; the rewards screen shows the run's score and whether it is a new best.
// 2) A small medal (inline SVG: bronze, silver, gold, platinum, eclipse) sits next to each cleared tier's title (G.arena[tier] > 0, so it
//    also shows on saves from before medals). Records > Journey lists "Arena medals collected: n of 5".
// 3) The Daily Trial is the Weekly Trial: dailyKey() is the Monday (ISO week start) of the current local week as YYYY-MM-DD, so the seeded
//    trial, its twist (twists.js reads the ISO week of the key) and the leaderboard entry (cloud scores/{uid}.days[key]) last seven days.
//    Old daily keys are still valid dates: they read as the week they fall in. The best trial score per week is kept in META.trialBest[key].
//    Internal names (daily, dailyKey, G.daily, ACT.daily...) are unchanged; only player-facing text says Weekly (vModal xform, title and
//    battle chip after render, tips, item text). The changelog block is left as written.
// ---------- score ----------
function arenaScore(won,spec){const P=(typeof allParty==='function'?allParty():[]).filter(c=>c&&c.S);const hp=P.length?P.reduce((a,c)=>a+Math.max(0,c.hp)/c.S.mhp,0)/P.length:0;
  return Math.max(0,Math.round((spec.waves||1)*1500-(B.pturns||0)*18-(B.kos||0)*250+(won?hp*2000:0)));}
function arenaRecord(info){try{const sp=B&&B.spec;if(!info||!sp||sp.kind!=='arena'||!G||G.daily||info.arenaScore!=null||!info.arena)return;
  const t=sp.tier|0,sc=arenaScore(true,sp);G.arenaBest=G.arenaBest||{};const prev=G.arenaBest[t];
  info.arenaScore=sc;info.arenaTurns=B.pturns||0;info.arenaKos=B.kos||0;info.arenaPrev=prev?prev.score:0;info.arenaNew=!prev||sc>prev.score;
  if(info.arenaNew)G.arenaBest[t]={score:sc,turns:B.pturns||0,kos:B.kos||0};}catch(e){}}
// the result screen is drawn inside win(), before the after hooks run, so the score is also taken the first time the grid is built
HOOK.after('win','arena11','arena score and best per tier',function(){arenaRecord((B&&B.result)||(V.modal&&V.modal.info));});
function arenaBestOf(t){try{const b=(G.arenaBest||{})[t];return b&&b.score>0?b.score:0;}catch(e){return 0;}}
{const g0=rsGrid;rsGrid=function(i){arenaRecord(i);let h=g0.apply(this,arguments);try{if(i&&i.arenaScore!=null){const cell=`<div class="rs-cell wide gift"><small>Arena score</small><b>${fmt(i.arenaScore)}</b><small>${i.arenaTurns} hero turns, ${i.arenaKos} knockouts. ${i.arenaNew?(i.arenaPrev?'New best! (was '+fmt(i.arenaPrev)+')':'First score on this tier: your best so far.'):'Best on this tier: '+fmt(i.arenaPrev)+'.'}</small></div>`;
  h=h.replace(/<\/div>$/,cell+'</div>');}}catch(e){}return h;};}
// ---------- medals ----------
const AM11=[{n:'Bronze Medal',rim:'#8a4f1f',face:'#c98443',hi:'#f0b97a',rib:'#a83a2a'},{n:'Silver Medal',rim:'#6f7885',face:'#c4ccd6',hi:'#f4f8fc',rib:'#3a6ab0'},
 {n:'Gold Medal',rim:'#9a6b00',face:'#f0c030',hi:'#fff0a0',rib:'#2f8a4a'},{n:"Champion's Medal (platinum)",rim:'#5b7f96',face:'#dcecf6',hi:'#ffffff',rib:'#7a4cc0'},
 {n:'Eclipse Medal',rim:'#2a1850',face:'#4a2a8a',hi:'#c8a8ff',rib:'#14102a'}];
function arenaMedal(t,px){const M=AM11[t];if(!M)return '';const w=px||18,h=Math.round(w*1.2);
  const star='<path d="M10 10.2l1.2 2.4 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z" fill="'+M.rim+'" opacity=".75"/>';
  const face=t===4?`<circle cx="10" cy="14.5" r="4.6" fill="#0c0820"/><circle cx="11.6" cy="13.9" r="4" fill="${M.face}"/><path d="M6.4 14.5a4.6 4.6 0 0 1 8-3.1 5 5 0 0 0-5.7 6.6 4.6 4.6 0 0 1-2.3-3.5z" fill="${M.hi}"/>`:`<circle cx="10" cy="14.5" r="5.2" fill="${M.face}" stroke="${M.rim}" stroke-width=".8"/><path d="M5.6 12.6a5 5 0 0 1 6.2-2.6 6 6 0 0 0-5.4 5.2z" fill="${M.hi}" opacity=".8"/>${star}`;
  return `<svg class="amedal" viewBox="0 0 20 24" width="${w}" height="${h}" role="img" aria-label="${esc(M.n)}"><title>${esc(M.n)}</title><path d="M4.5 0h4.2l3.4 9.2H8z" fill="${M.rib}"/><path d="M15.5 0h-4.2L7.9 9.2h4.1z" fill="${M.rib}" opacity=".72"/><circle cx="10" cy="14.5" r="7.4" fill="${M.rim}"/>${t===4?'<circle cx="10" cy="14.5" r="7.4" fill="none" stroke="#b890ff" stroke-width=".7" opacity=".8"/>':''}${face}</svg>`;}
function arenaMedalCount(){try{return ARENA.reduce((a,A,i)=>a+((G.arena||[])[i]>0?1:0),0);}catch(e){return 0;}}
{const st=document.createElement('style');st.textContent='.amedal{display:inline-block;vertical-align:-4px;margin-right:6px;flex:0 0 auto}.amedals .amedal{margin-right:3px}.arbest{display:block}.arbest b{font-weight:700}';document.head.appendChild(st);}
// ---------- the arena page ----------
{const na0=nbArena;nbArena=function(menu){let h=na0.apply(this,arguments);try{const out=[];let pos=0;
  ARENA.forEach((A,i)=>{const tag=`<b>${A.n}</b>`,k=h.indexOf(tag,pos);if(k<0)return;const e=h.indexOf('<button',k),seg=h.slice(k,e<0?h.length:e);let s2=seg;
    const n=(G.arena||[])[i]|0,sc=arenaBestOf(i);
    const line=n?`<span class="arbest">Cleared <b>${n}x</b> · ${sc?'Best score <b>'+fmt(sc)+'</b>':'No score yet: win again to set one'}</span>`:'Not cleared yet.';
    s2=s2.replace(/Best: (?:cleared x\d+|not yet cleared)\./,line);
    if(n)s2=s2.replace(tag,`<b>${arenaMedal(i)}${A.n}</b>`);
    out.push([k,k+seg.length,s2]);pos=k+seg.length;});
  let r='',p=0;out.forEach(([a,b,s])=>{r+=h.slice(p,a)+s;p=b;});h=r+h.slice(p);}catch(e){}return h;};}
// ---------- Records > Journey ----------
HOOK.xform('vJourney','arena11','Arena medals row',function(h){try{const n=arenaMedalCount(),strip=`<span class="amedals">${ARENA.map((A,i)=>(G.arena||[])[i]>0?arenaMedal(i,14):'').join('')}</span> `;
  const row=`<div class="row"><div class="grow"><b>Arena medals collected</b></div><span class="m nums">${strip}${n} of ${ARENA.length}</span></div>`;
  const m=h.match(/<div class="row"><div class="grow"><b>Scourges defeated<\/b><\/div><span class="m nums">[^<]*<\/span><\/div>/);if(m)h=h.replace(m[0],m[0]+row);}catch(e){}return h;});
// ---------- Weekly Trial ----------
dailyKey=function(d){d=d||new Date();const m=new Date(d.getFullYear(),d.getMonth(),d.getDate()-((d.getDay()+6)%7));
  return m.getFullYear()+'-'+String(m.getMonth()+1).padStart(2,'0')+'-'+String(m.getDate()).padStart(2,'0');};
function weekLabel(key){const m=String(key).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return String(key);const a=new Date(+m[1],+m[2]-1,+m[3]),b=new Date(+m[1],+m[2]-1,+m[3]+6),f=x=>x.toLocaleDateString(undefined,{month:'short',day:'numeric'});return 'Week of '+f(a)+' to '+f(b);}
function trialBest(key){try{return (META.trialBest||{})[key]||null;}catch(e){return null;}}
function trialRecord(m){try{if(!m||m.score==null||!m.key||m.tb)return;m.tb=1;META.trialBest=META.trialBest||{};const p=META.trialBest[m.key];m.tbPrev=p?p.score:0;m.tbNew=!p||m.score>p.score;
  if(m.tbNew){META.trialBest[m.key]={score:m.score,turns:m.turns||0,kos:m.kos||0};const ks=Object.keys(META.trialBest).sort();while(ks.length>60)delete META.trialBest[ks.shift()];saveMeta();}}catch(e){}}
{const w0=dailyWin,l0=dailyLose;dailyWin=function(){const r=w0.apply(this,arguments);trialRecord(V.modal);return r;};dailyLose=function(){const r=l0.apply(this,arguments);trialRecord(V.modal);return r;};}
{const dp0=dailyPlan;dailyPlan=function(){const P=dp0.apply(this,arguments);try{P.waves.forEach(w=>{if(w.bounty&&w.bounty.name)w.bounty.name=w.bounty.name.replace('Daily Terror','Weekly Terror');});}catch(e){}return P;};}
{const di0=mDailyIntro;mDailyIntro=function(){let h=di0.apply(this,arguments);try{const k=dailyKey(),b=trialBest(k);h=h.replace('<h4>'+esc(k)+'</h4>','<h4>'+esc(weekLabel(k))+'</h4>'+(b?`<p class="note">Your best this week: <b>${fmt(b.score)}</b>.</p>`:''));}catch(e){}return h;};}
{const de0=mDailyEnd;mDailyEnd=function(m){let h=de0.apply(this,arguments);try{trialRecord(m);const line=m.tbNew?(m.tbPrev?`New best this week! (was ${fmt(m.tbPrev)})`:'Your first score this week.'):`Your best this week: ${fmt(m.tbPrev)}.`;
  h=h.replace(/(<p class="note">\d+ hero turns[^<]*<\/p>)/,'$1<p class="note">'+line+'</p>');}catch(e){}return h;};}
{const lp0=lbPost;lbPost=async function(){const r=await lp0.apply(this,arguments);return typeof r==='string'?r.replace('Your best today','Your best this week'):r;};}
function wk11(h){return h.replace(/Daily Trial/g,'Weekly Trial').replace(/Daily Terror/g,'Weekly Terror').replace("Today's board","This week's board").replace('fights today.','fights this week.').replace('posted today yet','posted this week yet').replace(/Arena and Daily Trial/g,'Arena and Weekly Trial');}
HOOK.xform('vModal','arena11','Daily Trial reads Weekly Trial (changelog text untouched)',function(h){try{if(typeof h!=='string'||h.indexOf('aily')<0&&h.indexOf('Today')<0&&h.indexOf('today')<0)return h;const k=h.indexOf('<div class="clog">');return k<0?wk11(h):wk11(h.slice(0,k))+h.slice(k);}catch(e){return h;}});
HOOK.after('render','arena11','title button and battle chip say Weekly',function(){try{const b=document.querySelector('.tmenu .btn.daily');if(b&&b.textContent==='Daily Trial')b.textContent='Weekly Trial';
  document.querySelectorAll('.wchip.d').forEach(c=>{if(c.firstChild&&c.firstChild.nodeType===3&&/^Daily/.test(c.firstChild.nodeValue))c.firstChild.nodeValue=c.firstChild.nodeValue.replace(/^Daily/,'Weekly');});}catch(e){}});
try{TIPS.forEach(t=>{['n','g'].forEach(f=>{if(typeof t[f]==='string')t[f]=wk11(t[f]);});});}catch(e){}
try{if(ITEMS.porkchop&&ITEMS.porkchop.d)ITEMS.porkchop.d=wk11(ITEMS.porkchop.d);}catch(e){}
try{TWISTS.daily.forEach(t=>{['n','c','d'].forEach(f=>{if(typeof t[f]==='string')t[f]=wk11(t[f]);});});}catch(e){}
try{if(typeof MTRACK!=='undefined'&&MTRACK.arena){const a0=MTRACK.arena;MTRACK.arena=function(){const o=a0.apply(this,arguments);if(o&&o.name)o.name=wk11(o.name);return o;};}}catch(e){}
