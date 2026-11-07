// ===== twists.js (v0.6.3): the Daily Trial weekly twist and New Game+ modifiers =====
// =================== v0.6.3 TWISTS: weekly Daily Trial twist and New Game+ modifiers ===================
// Tunables and texts live in config.js (TWISTS). Everything here wraps existing functions; nothing calls RNG(), so the
// Daily Trial stays deterministic (same date + same build = same fights and same outcomes for the same inputs).
// New optional save fields: G.ngMods (array of modifier ids, old saves: none) and G.ngDown (Ironman: ids of fallen heroes).
const TW={force:null,off:false};
// ----- weekly twist -----
// ISO 8601 week of a calendar date given as 'YYYY-MM-DD' (the trial's own date key), computed in UTC
TW.isoWeek=function(key){
  const m=String(key).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return {y:0,w:0};
  const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3])),dow=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-dow);
  const y=d.getUTCFullYear(),w=Math.ceil(((d-Date.UTC(y,0,1))/864e5+1)/7);return {y,w};
};
TW.forKey=function(key){
  const P=TWISTS.daily;if(!TWISTS.on||TW.off||!P.length)return null;
  if(TW.force)return P.find(t=>t.id===TW.force)||null;
  const k=TW.isoWeek(key);return P[((k.y*53+k.w)%P.length+P.length)%P.length];
};
// the twist of the trial being played (by the trial's own date, so a trial started before midnight keeps its twist)
TW.cur=function(){return (typeof G!=='undefined'&&G&&G.daily)?TW.forKey(G.daily.key):null;};
TW.inTrial=function(){return !!(typeof B!=='undefined'&&B&&B.spec&&B.spec.kind==='daily');};
TW.on=function(id){if(!TW.inTrial())return null;const t=TW.cur();return t&&t.id===id?t:null;};
// ----- New Game+ modifiers -----
TW.mod=id=>TWISTS.ng.mods.find(m=>m.id===id)||null;
TW.mods=g=>{g=g||(typeof G!=='undefined'?G:null);return g&&Array.isArray(g.ngMods)?g.ngMods.map(TW.mod).filter(Boolean):[];};
TW.ng=function(id){if(typeof G==='undefined'||!G||G.daily||!Array.isArray(G.ngMods)||!G.ngMods.includes(id))return null;return TW.mod(id);};
TW.modNames=g=>TW.mods(g).map(m=>m.n).join(', ');

// ===== Daily twist effects =====
// weather multipliers carry Healing halved and Sharp eyes (WX() feeds heal skills and crit chance)
{const wx0=WX;WX=function(){const W=wx0.apply(this,arguments);try{const h=TW.on('heal'),c=TW.on('crit');
  if(h||c){const o=Object.assign({},W);if(h)o.heal=(W.heal||1)*h.m;if(c)o.crit=(W.crit||0)+c.add;return o;}}catch(e){}return W;};}
// potions: the same halving (the item table entry is swapped for this one use)
{const ui0=useItem;useItem=function(id,t){
  if(ironDowned(t)&&ITEMS[id]&&ITEMS[id].revive){toast(`${t.name} stays down until you rest at an inn.`);return;}
  const h=TW.on('heal'),it=ITEMS[id];if(!h||!it||!it.heal)return ui0.apply(this,arguments);
  ITEMS[id]=Object.assign({},it,{heal:Math.round(it.heal*h.m)});try{return ui0.apply(this,arguments);}finally{ITEMS[id]=it;}};}
// reactions: Fire x2 in the trial; Reactions only (NG+) makes every reaction stronger
{const dr0=doReaction;doReaction=function(a,t,el){const R=dr0.apply(this,arguments);try{if(R){
  const f=TW.on('fire2');if(f&&(R.p==='fire'||R.d==='fire'||el==='fire'))R.m*=f.m;
  const q=TW.ng('react');if(q)R.m*=q.m;}}catch(e){}return R;};}
// super effective hits
HOOK.after('calcDamage','twists','twist: weakness damage',function(r){try{const w=TW.on('weak');if(w&&r&&r.em>1)r.dmg=Math.max(1,Math.round(r.dmg*w.m));}catch(e){}});
// statuses last one more turn (only a status this call actually set, not one it cancelled)
{const as0=addSt;addSt=function(t,k){const L=TW.on('linger');if(!L||!t||!t.st)return as0.apply(this,arguments);
  const prev=t.st[k],ok=as0.apply(this,arguments);if(ok&&t.st[k]&&t.st[k]!==prev&&typeof t.st[k].t==='number')t.st[k].t+=L.add;return ok;};}
// wave start: shields, primes, glass foes, Ward; the trial's first fight also charges Limits
function twWave(first){
  if(!TW.inTrial())return;const T=TW.cur();if(!T)return;
  const els=[...new Set(Object.values(REACT).map(r=>r.p))];
  B.en.forEach((e,i)=>{
    if(T.id==='shield'&&e.maxShield){e.maxShield+=T.add;e.shield=e.maxShield;}
    if(T.id==='glass'){e.S.mhp=Math.max(1,Math.round(e.S.mhp*T.hp));e.hp=e.S.mhp;e.S.atk*=T.pow;e.S.mag*=T.pow;}
    if(T.id==='primed'&&e.hp>0){const el=els[(B.wave*3+i)%els.length];e.primed={el,t:T.t,by:'the twist'};e.primeT=Date.now();}
  });
  if(T.id==='ward')B.front.forEach(c=>{if(c.hp>0)addSt(c,'ward',c,true);});
  if(T.id==='limit'&&first)B.front.concat(B.back).forEach(c=>{if(limitOpen(c))c.lb=Math.max(c.lb||0,T.v);});
  B.twist=T.id;
}

// ===== New Game+ modifier effects =====
// Foes hit harder (never in the Daily Trial: TW.ng is off there)
{const me0=makeEnemy;makeEnemy=function(){const e=me0.apply(this,arguments);try{const b=TW.ng('brutal');if(b&&e&&e.S){e.S.atk*=b.pow;e.S.mag*=b.pow;}}catch(x){}return e;};}
// Elites everywhere: one foe in each wild fight gets a shield and more HP
const TW_WILD=['field','dungeon','cavern'];
function twElite(){
  const m=TW.ng('elites');if(!m||!B||!TW_WILD.includes(B.spec.kind)||B.en.some(e=>e.boss||e.elite||e.maxShield))return;
  const e=B.en.reduce((a,x)=>x.lv>a.lv?x:a,B.en[0]);if(!e)return;
  e.maxShield=m.pips;e.shield=m.pips;e.broken=0;e.S.mhp=Math.round(e.S.mhp*m.hp);e.hp=e.S.mhp;e.ngElite=1;e.name='Elite '+e.name;
}
// Reactions only: weak hits and skills stop chipping foe shields
{const cs0=chipShield;chipShield=function(t,n,why){if(TW.ng('react')&&t&&t.side==='e'&&why!=='reaction')return;return cs0.apply(this,arguments);};}
// rewards: every chosen modifier multiplies battle XP and gold (win() reads facMul once per fight)
{const fm0=facMul;facMul=function(){const r=Object.assign({},fm0.apply(this,arguments));try{if(G&&!G.daily)TW.mods().forEach(m=>{r.xp*=m.xp||1;r.gold*=m.gold||1;});}catch(e){}return r;};}
// Cold inns: the rest restores only part of what is missing (a fallen hero wakes at that share of HP)
{const ra0=restAll;restAll=function(){
  const m=TW.ng('coldinn'),pre={};if(m&&G)Object.keys(G.roster).forEach(id=>{const c=G.roster[id];pre[id]=[c.hp,c.mp];});
  const ok=ra0.apply(this,arguments);
  if(ok&&G){if(m)Object.keys(G.roster).forEach(id=>{const c=G.roster[id],p=pre[id];if(!p||!c.S)return;
      c.hp=p[0]<=0?Math.max(1,Math.round(c.S.mhp*m.heal)):Math.min(c.S.mhp,Math.round(p[0]+(c.S.mhp-p[0])*m.heal));
      c.mp=Math.min(c.S.mmp,Math.round(Math.max(0,p[1])+(c.S.mmp-Math.max(0,p[1]))*m.heal));});
    if(Array.isArray(G.ngDown)&&G.ngDown.length)G.ngDown=[];
    if(m||TW.ng('iron'))saveGame();}
  return ok;};}
// Ironman: a hero who falls stays down (at 0 HP) until an inn
function ironDowned(c){return !!(c&&TW.ng('iron')&&Array.isArray(G.ngDown)&&G.ngDown.includes(c.id));}
function ironClamp(){if(!TW.ng('iron')||!Array.isArray(G.ngDown))return;
  G.ngDown.forEach(id=>{const c=G.roster[id];if(c&&c.hp>0){c.hp=0;c.st={};if(B){c.fx=(c.fx||[]).filter(f=>f.txt!=='Revived');fx(c,'Stays down','stat bad');}}});}
{const fl0=fallen;fallen=function(u){const r=fl0.apply(this,arguments);try{if(u&&u.side==='p'&&TW.ng('iron')&&G.roster[u.id]){G.ngDown=Array.isArray(G.ngDown)?G.ngDown:[];if(!G.ngDown.includes(u.id))G.ngDown.push(u.id);}}catch(e){}return r;};}
{const pf0=perform;perform=function(){try{return pf0.apply(this,arguments);}finally{try{ironClamp();}catch(e){}}};}
{const uf0=useItemField;useItemField=function(id,c){if(ironDowned(c)&&ITEMS[id]&&ITEMS[id].revive)return false;return uf0.apply(this,arguments);};}
{const fe0=fsEffect;fsEffect=function(s,t){if(ironDowned(t))return false;return fe0.apply(this,arguments);};}
{const fc0=fsCast;fsCast=function(){try{return fc0.apply(this,arguments);}finally{try{ironClamp();}catch(e){}}};}
{const cr0=campRest;campRest=function(){try{return cr0.apply(this,arguments);}finally{try{ironClamp();}catch(e){}}};}
{const at0=allyTargetable;allyTargetable=function(c){if(ironDowned(c))return false;return at0.apply(this,arguments);};}
// a lost fight sends everyone back on their feet as before, so Ironman cannot lock a journey
{const lo0=lose;lose=function(){try{if(G&&!(B&&B.spec&&B.spec.kind==='daily')&&Array.isArray(G.ngDown))G.ngDown=[];}catch(e){}return lo0.apply(this,arguments);};}

// ===== battle start and new waves =====
HOOK.after('startBattle','twists','twist waves, elites, Iron clamp',function(r){try{if(r!==false&&B){twWave(true);twElite();ironClamp();}}catch(e){}});
{const nw0=nextWave;nextWave=function(){const r=nw0.apply(this,arguments);try{twWave(false);}catch(e){}return r;};}

// ===== UI =====
(function(){try{const s=document.createElement('style');s.textContent=
`.twbox{border:1px solid var(--gold);border-radius:6px;padding:8px 10px;margin:8px 0;background:linear-gradient(180deg,#2c2312,#1a150b)}
.twbox b{display:block;color:var(--gold)}.twbox small{display:block;opacity:.9}.twbox .twk{font-size:.75rem;opacity:.75;text-transform:uppercase;letter-spacing:.06em}
.wchip.tw{background:#3a2a10;border-color:var(--gold);color:#ffe3a0}
.ngmods{display:grid;gap:6px}.ngmod{display:block;width:100%;text-align:left;padding:8px 10px;min-height:44px}.ngmod b{display:block}.ngmod small{display:block;white-space:normal;opacity:.9}
.ngmod.in{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}.ngmod .ngr{color:#ffb0a0}.ngmod .ngg{color:#b8f0a8}
.ngm{display:block;color:var(--gold)}.cyc .ngc{margin-left:3px}`;document.head.appendChild(s);}catch(e){}})();
function twBox(T,label){return T?`<div class="twbox"><span class="twk">${esc(label)}</span><b>${esc(T.n)}</b><small>${esc(T.d)}</small></div>`:'';}
// Daily Trial entry and end screens
{const di0=mDailyIntro;mDailyIntro=function(){let h=di0.apply(this,arguments);try{const T=TW.forKey(dailyKey());if(T){const i=h.indexOf('<h4>');if(i>=0)h=h.slice(0,i)+twBox(T,"This week's twist")+h.slice(i);}}catch(e){}return h;};}
{const de0=mDailyEnd;mDailyEnd=function(m){let h=de0.apply(this,arguments);try{const T=TW.forKey(m.key);if(T){const i=h.indexOf('<h4>');if(i>=0)h=h.slice(0,i)+`<p class="note">This week's twist: ${esc(T.n)}.</p>`+h.slice(i);}}catch(e){}return h;};}
// the chip in the trial's battles; tapping it explains the twist (the wxinfo window pauses the fight)
{const bs0=battleSkyTags;battleSkyTags=function(){let h=bs0.apply(this,arguments);try{if(TW.inTrial()){const T=TW.cur();if(T)h+=`<button class="wchip tw" data-act="wxInfo" data-arg="twist" title="${esc(T.n+': '+T.d)}">✦ ${esc(T.c)}</button>`;}}catch(e){}return h;};}
HOOK.before('vModal','twists','twist info popup',function(m){if(m&&m.type==='wxinfo'&&m.kind==='twist'){const T=TW.cur();return HOOK.stop(box("This week's twist",T?`<p><b>${esc(T.n)}</b></p><p class="note">${esc(T.d)}</p><p class="note">The twist changes every Monday. Everyone playing the trial this week has it.</p>`:'<p class="note">No twist right now.</p>','<button class="btn gold" data-act="closeModal">OK</button>'));}});
// New Game+ modifier picker on the starter screen (only when starting a New Game+ cycle)
function ngPicker(){
  const sel=V.ngMods||[],mx=TWISTS.ng.max;
  return `<div class="panel ngpick"><h3>Modifiers <small>(optional, up to ${mx})</small></h3><p class="note">Extra risk for extra reward, for this whole cycle. You can start without any.</p><div class="ngmods">${TWISTS.ng.mods.map(m=>
    `<button class="btn ngmod ${sel.includes(m.id)?'in':''}" data-act="ngMod" data-arg="${m.id}" aria-pressed="${sel.includes(m.id)}"><b>${sel.includes(m.id)?'✓ ':''}${esc(m.n)}</b><small class="ngr">${esc(m.risk)}</small><small class="ngg">${esc(m.gain)}</small></button>`).join('')}</div></div>`;
}
{const vs0=vStarter;vStarter=function(){let h=vs0.apply(this,arguments);try{if((V.ngCycle||0)>0&&TWISTS.on){const i=h.indexOf('<div class="grid cards">');if(i>=0)h=h.slice(0,i)+ngPicker()+h.slice(i);}}catch(e){}return h;};}
{const n0=ACT.new,s0=ACT.startNG,b0=ACT.begin;
  ACT.new=function(){V.ngMods=[];return n0.apply(this,arguments);};
  ACT.startNG=function(){V.ngMods=[];return s0.apply(this,arguments);};
  ACT.begin=function(){const pick=(V.ngMods||[]).filter(id=>TW.mod(id)).slice(0,TWISTS.ng.max),cyc=V.ngCycle||0;const g0=G;const r=b0.apply(this,arguments);
    try{if(G&&G!==g0&&G.run&&cyc>0&&pick.length){G.ngMods=pick;saveGame();}}catch(e){}return r;};}
ACT.ngMod=function(id){if(!TW.mod(id))return;const L=V.ngMods=V.ngMods||[];const i=L.indexOf(id);
  if(i>=0)L.splice(i,1);else if(L.length>=TWISTS.ng.max){toast(`Up to ${TWISTS.ng.max}. Drop one first.`);return;}else L.push(id);render();};
// shown on the save cards, in the header next to NG+ and in Menu > Journey
{const ms0=mSlots;mSlots=function(m){let h=ms0.apply(this,arguments);try{[0,1,2].forEach(s=>{const o=loadRaw(s);const n=o&&TW.modNames(o);if(!n)return;
  const a=h.indexOf(`<b>Slot ${s+1}`);if(a<0)return;const b=h.indexOf('</small>',a);if(b<0)return;h=h.slice(0,b+8)+`<small class="ngm">Modifiers: ${esc(n)}</small>`+h.slice(b+8);});}catch(e){}return h;};}
{const vh0=vHeader;vHeader=function(){let h=vh0.apply(this,arguments);try{const L=TW.mods();if(L.length&&G&&G.run&&G.run.cycle)h=h.replace(`<span class="cyc">NG+${G.run.cycle}</span>`,`<span class="cyc" title="Modifiers: ${esc(TW.modNames())}">NG+${G.run.cycle}<span class="ngc">✦${L.length}</span></span>`);}catch(e){}return h;};}
{const vj0=vJourney;vJourney=function(){let h=vj0.apply(this,arguments);try{const L=TW.mods();if(L.length){
  const rows=L.map(m=>`<div class="row"><div class="grow"><b>${esc(m.n)}</b><small>${esc(m.risk)} ${esc(m.gain)}</small></div></div>`).join('');
  h=h.replace(/(<b>New Game\+<\/b><\/div><span class="m nums">Cycle \d+<\/span><\/div>)/,'$1'+rows);}}catch(e){}return h;};}
// tests: read any game binding by name (window.__A.TW.get('restAll'))
TW.get=k=>eval(k);
