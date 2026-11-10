// ===== field9.js (v0.10.9): travel field skills cast from the Field skills menu (party2.js) =====
// Six skills that act on the overworld, not in battle. Each belongs to a class, and heroes of a matching element learn it too (lv FLD9.elLv).
// The caster pays MP; the effect runs for a number of steps (G.fsx counters, ticked in arrive), or for the current map (Lantern).
//   Haste (Thief, wind): the party walks faster.         Shadowstep (Thief, shadow): patrolling roamers do not notice you.
//   Ward (Priest, light): no random battles (G.ward, the Holy Water counter; a chasing roamer still chases).
//   Lure (Archer, Druid, earth): random battles twice as often.  Lantern (Mage, fire, light): wider map reveal and every chest marked.
//   Marching Song (Bard): the party regains 2% HP every 10 steps.
// Saved with the journey (G.fsx is a plain field: packG copies G; older saves start without it). Never in the Daily Trial.
const FLD9={elLv:10,clsLv:5,
  sk:[{id:'fld_haste',key:'haste',n:'Haste',mp:8,steps:120,cls:['thief'],els:['wind'],d:'The party walks half again as fast for 120 steps.'},
      {id:'fld_shadow',key:'shadow',n:'Shadowstep',mp:8,steps:80,cls:['thief'],els:['shadow'],d:'Patrolling foes do not notice you for 80 steps. Walk into one for a sneak attack.'},
      {id:'fld_ward',key:'ward',n:'Ward',mp:10,steps:60,cls:['healer'],els:['light'],d:'No random battles for 60 steps. A foe that is already chasing you still does.'},
      {id:'fld_lure',key:'lure',n:'Lure',mp:4,steps:40,cls:['archer','druid'],els:['earth'],d:'Random battles come twice as often for 40 steps. Good for farming.'},
      {id:'fld_lantern',key:'lantern',n:'Lantern',mp:6,cls:['mage'],els:['fire','light'],d:'Lights this map: you see farther and every chest on it is marked on the map.'},
      {id:'fld_song',key:'song',n:'Marching Song',mp:10,steps:100,cls:['bard'],d:'The party regains 2% HP every 10 steps for 100 steps.'}],
  hasteMul:.67,lureMul:2,lanternR:3,songEvery:10,songPct:.02};
function fsx(){if(!G)return {};if(!G.fsx||typeof G.fsx!=='object')G.fsx={};return G.fsx;}
function fld9Of(c){if(!c||!TPL[c.id]||G.daily)return [];const t=TPL[c.id],els=c.el||t.el||[];
  return FLD9.sk.filter(f=>(f.cls.includes(t.cls)&&c.lv>=FLD9.clsLv)||((f.els||[]).some(e=>els.includes(e))&&c.lv>=FLD9.elLv))
    .map(f=>({id:f.id,n:f.n,k:'field',t:'self',mp:f.mp,fld:f.key,d:f.d}));}
// the Field skills menu lists them after the heals
{const fs0=fsSkills;fsSkills=function(c){const L=fs0.apply(this,arguments);try{return L.concat(fld9Of(c));}catch(e){return L;}};}
{const fc0=fsCast;fsCast=function(cid,sid,tid){const c=G&&G.roster[cid],s=c&&fld9Of(c).find(x=>x.id===sid);if(!s)return fc0.apply(this,arguments);
  const say=t=>{toast(t);if(V.modal&&V.modal.type==='field')V.modal.msg=t;};
  if(c.hp<=0)return say(`${c.name} is knocked out.`);if(c.mp<s.mp)return say(`${c.name} needs ${s.mp} MP.`);
  const F=FLD9.sk.find(f=>f.key===s.fld),X=fsx(),m=WS.m;
  if(s.fld==='lantern'){if(!m||m.kind==='town')return say('There is nothing to light in town.');X.lantern=m.id;fld9MarkChests(m);}
  else if(s.fld==='ward'){if(G.ward>=F.steps)return say('A ward is already up.');G.ward=F.steps;}
  else X[s.fld]=F.steps;
  c.mp-=s.mp;saveGame();sfx('blip');try{wkwUpdate();}catch(e){}
  say(`${c.name} casts ${s.n}. ${s.fld==='lantern'?'Every chest on this map is marked.':F.steps+' steps.'}`);};}
// Lantern: chests count as seen (they show on the area map and minimap), and the reveal radius grows while on that map
function fld9MarkChests(m){try{const s=seenOf(m);(m.chests||[]).forEach(([x,y])=>{const i=y*m.w+x;s[i>>3]|=1<<(i&7);});
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const r=m.t[y][x];if(r==='C'||r==='K'){const i=y*m.w+x;s[i>>3]|=1<<(i&7);}}
  let b='';for(let i=0;i<s.length;i++)b+=String.fromCharCode(s[i]);G.explored=G.explored||{};G.explored[m.id]=btoa(b);MAPCV.dirty=1;drawMini();}catch(e){}}
{const ra0=revealAround;revealAround=function(){const m=WS.m,X=G&&G.fsx;if(!m||!X||X.lantern!==m.id)return ra0.apply(this,arguments);
  const k=m.kind,R0=MAP_R[k];MAP_R[k]=(R0||6)+FLD9.lanternR;try{return ra0.apply(this,arguments);}finally{MAP_R[k]=R0;}};}
// Haste: shorter steps
{const sm0=stepMs;stepMs=function(){const v=sm0.apply(this,arguments);try{return G&&G.fsx&&G.fsx.haste>0&&!G.daily?Math.round(v*FLD9.hasteMul):v;}catch(e){return v;}};}
// Shadowstep: a patrolling roamer's sight cone sees nothing
{const rs0=roamSees;roamSees=function(){try{if(G&&G.fsx&&G.fsx.shadow>0&&!G.daily)return false;}catch(e){}return rs0.apply(this,arguments);};}
// Lure: the encounter roll in arrive reads ENC_RATE; raise it for the step (same number of random calls)
// step counters, the song's healing; Lantern ends when you leave its map
HOOK.wrap('arrive','field9','step counters, lure, the song',function(next,...a){const X=G&&G.fsx,m=WS.m,lure=X&&X.lure>0&&m&&m.kind!=='town'&&!G.daily,k=META.cfg.enc,old=ENC_RATE[k];
  if(lure)ENC_RATE[k]=(old??.11)*FLD9.lureMul;
  let r;try{r=next(...a);}finally{if(lure)ENC_RATE[k]=old;}
  try{if(X&&m&&m.kind!=='town'&&!G.daily){let ch=0;const ended=[],songOn=X.song>0;
    ['haste','shadow','lure','song'].forEach(q=>{if(X[q]>0){X[q]--;ch=1;if(!X[q])ended.push(q);}});
    if(songOn){X.songN=(X.songN|0)+1;if(X.songN%FLD9.songEvery===0)G.party.forEach(id=>{const c=G.roster[id];if(c&&c.hp>0)c.hp=Math.min(c.S.mhp,c.hp+Math.max(1,Math.round(c.S.mhp*FLD9.songPct)));});}
    if(!(X.song>0))delete X.songN;
    ended.forEach(q=>toast(`${FLD9.sk.find(f=>f.key===q).n} fades.`));if(ch)wkwUpdate();}}catch(e){}return r;});
HOOK.after('placeAt','field9','Lantern ends on another map',function(){try{const X=G&&G.fsx;if(X&&X.lantern&&WS.m&&X.lantern!==WS.m.id){delete X.lantern;wkwUpdate();}}catch(e){}});
// HUD chips beside the weather (like the Holy Water ward)
HOOK.after('wkwUpdate','field9','field skill chips',function(r){try{const wk=$('wkw'),X=G&&G.fsx;if(!wk||!X)return r;
  const ch=[['haste','»','Haste'],['shadow','◐','Shadowstep'],['lure','◎','Lure'],['song','♪','Marching Song']].filter(([k])=>X[k]>0)
    .map(([k,i,n])=>`<span class="wchip fschip" title="${n}">${i} ${n} <b class="nums">${X[k]}</b></span>`).join('')+(X.lantern&&WS.m&&X.lantern===WS.m.id?'<span class="wchip fschip" title="Lantern: this map is lit">✦ Lantern</span>':'');
  wk.querySelectorAll('.fschip').forEach(e=>e.remove());if(ch)wk.insertAdjacentHTML('beforeend',ch);}catch(e){}return r;});
