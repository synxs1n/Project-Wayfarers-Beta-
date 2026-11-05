// =================== INSIGHT: matchups, quirks, bestiary tiers (Beta v0.2.0) ===================
// Basic type matchups are always shown. Hidden quirks (an off-type resistance or a status immunity) and anything on a
// Scourge or Calamity show "?" until you land a hit on that kind of foe or scan it. That knowledge is account-bound:
// META.best[name].hit joins seen/kills/scan/known in profile/<uid>, merged by union like the rest.
const QUIRK={mossling:{imm:['poison']},dewtoad:{res:'earth'},cinderpup:{imm:['burn']},shellguard:{res:'lightning'},cavebat:{imm:['blind']},
  slaggolem:{res:'earth'},frostwolf:{imm:['slow']},iceknight:{res:'water'},stormling:{imm:['stun']},gargoyle:{res:'ice'},voidspawn:{imm:['poison']},
  eclipsewraith:{res:'wind'},huskguard:{res:'earth',imm:['bleed']},cloudray:{res:'water'}};
const QUIRK_RES=.4;
function quirkDef(art){const q=QUIRK[art],m=MON[art];if(!q||!m)return null;const o={};if(q.res&&matchup(q.res,m.el)===1)o.res=q.res;if(q.imm)o.imm=q.imm.slice();return (o.res||o.imm)?o:null;}
function quirkText(q){if(!q)return '';const p=[];if(q.res)p.push(`shrugs off ${EL[q.res]} (takes ${Math.round((1-QUIRK_RES)*100)}%)`);if(q.imm)p.push('immune to '+q.imm.map(k=>STS[k].n).join(' and '));return p.join('; ');}
{const me0=makeEnemy;makeEnemy=function(m,lv,opt){const e=me0.apply(this,arguments);if(!e.boss){const q=quirkDef(m.art);if(q){e.q=q;if(q.res)e.S.elRes[q.res]=QUIRK_RES;if(q.imm)e.imm=q.imm;}}return e;};}
{const as0=addSt;addSt=function(t,k,src,silent){if(t&&t.imm&&t.imm.includes(k)&&STS[k]&&STS[k].bad){fx(t,'Immune','stat good effx imm');if(!silent)log(`${t.name} is immune to ${STS[k].n}!`);learnQuirk(t);return false;}return as0.apply(this,arguments);};}

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
const PERK_KILLS=[10,25,50],PERK_KILLS_BOSS=[2,4,6],PERK_DMG=[.03,.05,.08],PERK_DROP=[0,.05,.1];
function tierOf(b,boss){if(!b||!b.seen)return 0;const k=b.kills||0,sc=!!b.scan;
  if(boss){if(k>=3&&(sc||k>=5))return 3;if(k>=1||sc)return 2;return 1;}
  if(k>=25&&(sc||k>=50))return 3;if(k>=10||sc)return 2;return 1;}
function perkOf(name,boss){const b=(META.best||{})[name]||{},k=b.kills||0,M=boss?PERK_KILLS_BOSS:PERK_KILLS;let i=-1;M.forEach((n,j)=>{if(k>=n)i=j;});return i<0?{dmg:0,drop:0,lv:0}:{dmg:PERK_DMG[i],drop:PERK_DROP[i],lv:i+1};}
function nextMilestone(b,boss){const k=(b||{}).kills||0,M=boss?PERK_KILLS_BOSS:PERK_KILLS;const n=M.find(x=>x>k);
  const t=tierOf(b,boss);const tierNext=t===1?(boss?'1 win or a scan for Studied':`${10-k>0?10-k+' more kills':''}${10-k>0?' or a scan':''} for Studied`):t===2?(boss?`${Math.max(0,3-k)} more wins${b.scan?'':' and a scan'} for Mastered`:`${Math.max(0,25-k)} more kills${b.scan?'':' and a scan'} for Mastered`):'';
  return {perk:n?`${k}/${n} for ${n===M[0]?'a':'the next'} mastery perk`:'All mastery perks earned',tier:tierNext};}
{const cd0=calcDamage;calcDamage=function(a,sk,t,bonus){const r=cd0.apply(this,arguments);
  if(a&&t&&a.side==='p'&&t.side==='e'&&!(G&&G.daily)){const p=perkOf(t.base,t.boss);if(p.dmg)r.dmg=Math.max(1,Math.round(r.dmg*(1+p.dmg)));}return r;};}
function perkDropMul(e){if(G&&G.daily)return 1;return 1+perkOf(e.base,e.boss).drop;}
