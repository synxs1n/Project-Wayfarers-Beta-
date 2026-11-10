// ===== insight.js (v0.2.0): matchups, foe quirks, bestiary tiers and mastery perks =====
// Basic type matchups are always shown. Hidden quirks (an off-type resistance or a status immunity) and anything on a
// Scourge or Calamity show "?" until you land a hit on that kind of foe or scan it. That knowledge is account-bound:
// META.best[name].hit joins seen/kills/scan/known in profile/<uid>, merged by union like the rest.
const QUIRK={mossling:{imm:['poison']},dewtoad:{res:'earth'},cinderpup:{imm:['burn']},shellguard:{res:'lightning'},cavebat:{imm:['blind']},
  slaggolem:{res:'earth'},frostwolf:{imm:['slow']},iceknight:{res:'water'},stormling:{imm:['stun']},gargoyle:{res:'ice'},voidspawn:{imm:['poison']},
  eclipsewraith:{res:'wind'},huskguard:{res:'earth',imm:['bleed']},cloudray:{res:'water'}};
// QUIRK_RES: in config.js
function quirkDef(art){const q=QUIRK[art],m=MON[art];if(!q||!m)return null;const o={};if(q.res&&matchup(q.res,m.el)===1)o.res=q.res;if(q.imm)o.imm=q.imm.slice();return (o.res||o.imm)?o:null;}
function quirkText(q){if(!q)return '';const p=[];if(q.res)p.push(`shrugs off ${EL[q.res]} (takes ${Math.round((1-QUIRK_RES)*100)}%)`);if(q.imm)p.push('immune to '+q.imm.map(k=>STS[k].n).join(' and '));return p.join('; ');}
HOOK.after('makeEnemy','insight','foe quirks',function(e,m,lv,opt){if(!e.boss){const q=quirkDef(m.art);if(q){e.q=q;if(q.res)e.S.elRes[q.res]=QUIRK_RES;if(q.imm)e.imm=q.imm;}}});
HOOK.before('addSt','insight','immune foes shrug off a status',function(t,k,src,silent){if(t&&t.imm&&t.imm.includes(k)&&STS[k]&&STS[k].bad){fx(t,'Immune','stat good effx imm');if(!silent)log(`${t.name} is immune to ${STS[k].n}!`);learnQuirk(t);return HOOK.stop(false);}});

// ----- what the player knows -----
function bestEntry(e){return META.best[e.base]||{};}
function revealed(e){const b=bestEntry(e);return !!(b.hit||b.scan);}
function learnQuirk(e){if(!e||e.side!=='e')return;const b=bestOf(e.base);if(b.hit)return;b.hit=1;
  if(e.q)log(`Quirk discovered: ${e.base} ${quirkText(e.q)}. Logged in the Bestiary.`);if(typeof profileDirty==='function')try{profileDirty();}catch(x){}}

// ----- effectiveness preview -----
const EFF_CLS={Weak:'up',Resists:'dn',Neutral:'nt',Immune:'im','?':'q'};
function effInfo(sk,e,a){
  if(!sk||!e||e.hp<=0)return null;
  const rev=revealed(e),dmg=sk.k==='phys'||sk.k==='mag',els=skEls(sk);
  if(!dmg){
    if(sk.k!=='status'||!(sk.t==='one'||sk.t==='all'))return null;
    const bad=(sk.fx||[]).map(x=>x[0]).filter(k=>STS[k]&&STS[k].bad);if(!bad.length)return null;
    if(e.boss&&!rev)return {lab:'?'};const im=e.imm||[];
    if(bad.some(k=>im.includes(k))){if(!rev)return {lab:'?'};if(bad.every(k=>im.includes(k)))return {lab:'Immune'};}
    return null;
  }
  if(!els.length)return {lab:'Neutral'};
  if(e.boss&&!rev&&!els.some(el=>(bestEntry(e).known||{})[el]))return {lab:'?'};
  if(e.q&&e.q.res&&els.includes(e.q.res)&&!rev)return {lab:'?'};
  let m=Math.max(...els.map(el=>effOf(el,e)*(1-((e.S.elRes||{})[el]||0))));if(a&&a.id==='astra')m=Math.max(m,1);
  const W=(typeof WX==='function'&&B)?WX():{},w=W.el?Math.max(...els.map(el=>W.el[el]||1)):1;
  const cat=x=>x>=1.4?'Weak':x<=.8?'Resists':'Neutral';
  return {lab:cat(m*w),wx:w>1.001?'+':w<.999?'-':'',base:cat(m)};
}
function effBadge(sk,e,a,cls){const I=effInfo(sk,e,a);if(!I)return '';const W=B&&B.weather&&B.weather!=='clear'?WEATHER[B.weather]:null;
  return `<span class="eff ${EFF_CLS[I.lab]} ${cls||''}">${I.lab}${I.wx&&W?` <i title="${esc(W.n)} ${I.wx==='+'?'boosts':'weakens'} this">${W.i}${I.wx==='+'?'↑':'↓'}</i>`:''}</span>`;}
// compact per-foe chips for the skill list
function effChips(sk,a){if(!B)return '';const foes=B.en.filter(e=>e.hp>0);if(!foes.length)return '';const L=foes.map(e=>{const I=effInfo(sk,e,a);return I?`<em class="ef ${EFF_CLS[I.lab]}" title="${esc(e.name)}">${esc(shortName(e.name))} ${I.lab==='Neutral'?'·':I.lab==='?'?'?':I.lab==='Weak'?'▲':I.lab==='Resists'?'▼':'✕'}</em>`:'';}).filter(Boolean);
  return L.length?`<span class="effs">${L.join('')}</span>`:'';}
function shortName(n){const p=String(n).split(' ');const last=p[p.length-1];const tag=/^[A-Z]$/.test(last)?' '+last:'';return (p[0].length>7?p[0].slice(0,6)+'…':p[0])+tag;}

// ----- floating result text when a hit lands -----
{const fx0=fx;fx=function(u,txt,cls){const r=fx0.apply(this,arguments);
  try{if(B&&u&&u.side==='e'&&/\bdmg\b/.test(cls)&&!/poison|burn|bleed/.test(cls)&&B.cur&&B.cur.side==='p'){
    learnQuirk(u);
    const qres=u.q&&u.q.res&&u.fxEl===u.q.res;
    if(/\bweak\b/.test(cls))fx0(u,'Super effective!','stat effx up');else if(/\bres\b/.test(cls)||qres)fx0(u,'Resisted','stat effx dn');}}catch(e){}
  return r;};}

// ----- bestiary tiers and mastery perks -----
const TIER_N=['Unseen','Seen','Studied','Mastered'];
// PERK_KILLS, PERK_KILLS_BOSS, PERK_DMG, PERK_DROP: in config.js
function tierOf(b,boss){if(!b||!b.seen)return 0;const k=b.kills||0,sc=!!b.scan;
  if(boss){if(k>=3&&(sc||k>=5))return 3;if(k>=1||sc)return 2;return 1;}
  if(k>=25&&(sc||k>=50))return 3;if(k>=10||sc)return 2;return 1;}
function perkOf(name,boss){const b=(META.best||{})[name]||{},k=b.kills||0,M=boss?PERK_KILLS_BOSS:PERK_KILLS;let i=-1;M.forEach((n,j)=>{if(k>=n)i=j;});return i<0?{dmg:0,drop:0,lv:0}:{dmg:PERK_DMG[i],drop:PERK_DROP[i],lv:i+1};}
function nextMilestone(b,boss){const k=(b||{}).kills||0,M=boss?PERK_KILLS_BOSS:PERK_KILLS;const n=M.find(x=>x>k);
  const t=tierOf(b,boss);const tierNext=t===1?(boss?'1 win or a scan for Studied':`${10-k>0?10-k+' more kills':''}${10-k>0?' or a scan':''} for Studied`):t===2?(boss?`${Math.max(0,3-k)} more wins${b.scan?'':' and a scan'} for Mastered`:`${Math.max(0,25-k)} more kills${b.scan?'':' and a scan'} for Mastered`):'';
  return {perk:n?`${k}/${n} for ${n===M[0]?'a':'the next'} mastery perk`:'All mastery perks earned',tier:tierNext};}
HOOK.after('calcDamage','insight','bestiary perk damage',function(r,a,sk,t,bonus){
  if(a&&t&&a.side==='p'&&t.side==='e'&&!(G&&G.daily)){const p=perkOf(t.base,t.boss);if(p.dmg)r.dmg=Math.max(1,Math.round(r.dmg*(1+p.dmg)));}});
function perkDropMul(e){if(G&&G.daily)return 1;return 1+perkOf(e.base,e.boss).drop;}

// ----- battle menu row helpers (target kind, damage/heal estimate, status symbols in text) -----
// skTgt(s): {cls,lab} for a skill's target type. cls is tk-foe, tk-ally or tk-both (a heal that can also burn an undead foe on the field), '' if unknown.
const TK_FOE={one:'Single',all:'All foes',rand:'Random',chain:'Chain'},TK_ALLY={ally:'Ally',allyAll:'All allies',self:'Self',dead:'Fallen ally'};
function skTgt(s){
  if(!s)return {cls:'',lab:''};
  if(TK_FOE[s.t])return {cls:'tk-foe',lab:TK_FOE[s.t]};
  if(TK_ALLY[s.t]){
    if(B&&B.en&&B.en.some(e=>healsUndead(s,e)))return {cls:'tk-both',lab:TK_ALLY[s.t]+' / undead'};
    return {cls:'tk-ally',lab:TK_ALLY[s.t]};}
  return {cls:'',lab:''};
}
function skTgtLabel(s){const k=skTgt(s);return k.lab?` <em class="tk">${k.lab}</em>`:'';}
// skHealAmt(a,s,t): HP the heal skill restores on target t (a hero), the engine's formula with the random spread at its middle (1.0).
function skHealAmt(a,s,t){
  if(!s||!a||!a.S)return 0;
  if(s.k==='revive')return Math.max(1,Math.round(((t&&t.S)||a.S).mhp*s.pw));
  if(s.k!=='heal')return s.k==='status'&&s.heal?Math.round(((t&&t.S)||a.S).mhp*s.heal):0;
  const cm=typeof curseMul==='function'&&t?curseMul(t):1;
  return Math.round(s.pw*(a.S.healP||a.S.mag)*(WX().heal||1)*(1+(a.S.healUp||0))*cm);
}
// skNum(a,s): short estimate for a skill row ("~120", "~120 each", "" when there is nothing to show).
// calcDamage rolls rnd(.92,1.08) and a crit; both read RNG, so it is called with RNG fixed at .5 (spread = 1.0, no crit roll) and any Focus
// buff is put back afterwards (calcDamage consumes it). The result is the average over the live foes, times hits.
function skNum(a,s){
  if(!a||!s||!B)return '';
  const each=s.t==='all'||s.t==='allyAll'||s.t==='rand'?' each':'';
  if(s.k==='phys'||s.k==='mag'){
    const foes=(B.en||[]).filter(e=>e.hp>0);if(!foes.length)return '';
    const r0=RNG,foc=a.st&&a.st.focus;let tot=0,n=0;
    try{RNG=()=>.5;foes.forEach(e=>{try{tot+=calcDamage(a,s,e).dmg;n++;}catch(x){}});}
    finally{RNG=r0;if(foc&&a.st&&!a.st.focus)a.st.focus=foc;}
    if(!n)return '';return '~'+Math.round(tot/n*(s.hits||1))+each;
  }
  if(s.k==='heal'||s.k==='revive'||(s.k==='status'&&s.heal)){
    const live=(B.front||[]).filter(c=>c.hp>0),t=s.t==='self'?a:live.find(c=>c===a)||live[0]||a;
    const v=skHealAmt(a,s,t);return v>0?(s.k==='revive'||s.t==='dead'?'':'~')+v+each:'';
  }
  return '';
}
// stDesc(txt): escaped description with each status name (Burn, Stun ...) given its symbol. Capitalised exact names only, so verbs stay words.
function stDesc(txt){
  const h=esc(txt||'');if(typeof stSym!=='function'||typeof STS==='undefined')return h;
  return h.replace(/\b(Poison|Bleed|Burn|Slow|Stun|Blind|Root|Weaken|Break|Might|Bulwark|Haste|Regen|Ward|Taunt|Focus)\b/g,(m)=>{const k=m.toLowerCase();return STS[k]?`<span class="stw">${stSym(k)}${m}</span>`:m;});
}
// effArrow(sk,e): the matchup mark shown on a foe card while a damaging skill is being aimed (green up Weak, red down Resists, cross Immune, nothing for Neutral/unknown)
function effArrow(sk,e){
  if(!sk||(sk.k!=='phys'&&sk.k!=='mag')||!B)return '';
  let I=null;try{I=effInfo(sk,e,B.cur);}catch(x){}
  if(!I)return '';
  const m={Weak:['up','▲','Weak'],Resists:['dn','▼','Resists'],Immune:['im','✕','Immune']}[I.lab];
  return m?`<span class="effa ${m[0]}" role="img" aria-label="${m[2]}" title="${m[2]}">${m[1]}</span>`:'';
}
