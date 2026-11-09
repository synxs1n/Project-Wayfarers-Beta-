// ===== engine2.js (base): weather, personal quests and signature weapons, taming, the Daily Trial, save slots and export =====
// =================== WEATHER ===================
// Each field rolls weather when you enter it (and it shifts every few minutes). Battles fought there inherit it.
const WEATHER={
 clear:{n:'Clear skies',i:'☀',d:'No effect.'},
 rain:{n:'Rain',i:'☂',el:{water:1.2,fire:.8,lightning:1.1},react:{'fire+water':1.2,'lightning+water':1.2},d:'Water +20%, Fire -20%, Lightning +10%. Steam and Conduct reactions hit 20% harder.'},
 storm:{n:'Thunderstorm',i:'⚡',el:{lightning:1.2,wind:1.1},strike:.07,strikeDmg:.04,d:'Lightning +20%, Wind +10%. Now and then a stray bolt grazes a fighter for a little damage (never a knockout) and Primes a foe with Lightning.'},
 heat:{n:'Heatwave',i:'♨',el:{fire:1.2,ice:.8},burnPlus:1,d:'Fire +20%, Ice -20%. Burns last an extra turn.'},
 snow:{n:'Snowfall',i:'❄',el:{ice:1.2,fire:.85},spd:.94,d:'Ice +20%, Fire -15%. Everyone moves a little slower.'},
 blizzard:{n:'Blizzard',i:'❄',el:{ice:1.25,fire:.8},spd:.9,acc:.05,enc:1.15,d:'Ice +25%, Fire -20%. Everyone moves 10% slower and physical hits land 5% less often.'},
 fog:{n:'Fog',i:'≋',el:{shadow:1.15,light:.9},acc:.07,enc:1.25,d:'Physical hits land 7% less often. Shadow +15%, Light -10%. Foes find you more often.'},
 gale:{n:'Gale',i:'↯',el:{wind:1.2,earth:.85},gale:1,d:'Wind +20%, Earth -15%. The fastest fighter on each side starts with Haste.'},
 sand:{n:'Sandstorm',i:'∴',el:{earth:1.2,water:.85},blind:.06,d:'Earth +20%, Water -15%. Now and then a gust of sand Blinds someone, never the same fighter twice in a row.'},
 aurora:{n:'Aurora',i:'✦',el:{light:1.2},heal:1.25,regenStart:1,enc:.75,d:'Light +20%, healing +25%. Your vanguard starts every fight with Regen. Fewer encounters.'},
 starfall:{n:'Starfall',i:'✧',el:{light:1.15,shadow:1.15},crit:.05,d:'Light and Shadow +15%. Critical chance +5% for everyone.'},
 ashfall:{n:'Ashfall',i:'☁',el:{fire:1.15,shadow:1.1},dot:1.25,d:'Fire +15%, Shadow +10%. Poison and Burn deal 25% more.'}
};
const WX_BASE=Object.keys(WEATHER); // v0.4.0: the Daily Trial only ever picks from these (rare skies are added later and must not shift its seeded pick)
function battleWeather(spec){if((spec.kind==='field'||spec.kind==='elite')&&!(typeof mapIndoor==='function'&&V.screen==='world'&&mapIndoor(WS.m)))return (G.weather||{})[spec.stage]||'clear';return 'clear';}
function weatherStart(front,en){
  const W=WX();
  if(W.regenStart)front.forEach(c=>{if(c.hp>0)c.st.regen={t:STS.regen.t};});
  if(W.gale){const fast=a=>a.filter(u=>u.hp>0).sort((x,y)=>y.S.spd-x.S.spd)[0];[fast(front),fast(en)].forEach(u=>{if(u)u.st.haste={t:STS.haste.t};});}
  if(B.weather!=='clear')log(`${W.n}: ${W.d}`);
}
function weatherEvent(){
  const W=WX();
  // v4.7: bolts are rarer, softer, never strike the same fighter twice in a row, and can never knock anyone out
  if(W.strike&&B.pturns>=1&&RNG()<W.strike){const pool=liveUnits().filter(u=>u!==B.lastStrike);if(pool.length){const t=pick(pool);B.lastStrike=t;const d=Math.min(t.hp-1,Math.max(1,Math.round(t.S.mhp*W.strikeDmg)));t.fxEl='lightning';t.fxT=Date.now();if(t.side==='e'&&!t.primed){t.primed={el:'lightning',t:2};t.primeT=Date.now();}
    banner('Lightning strike!','#f2c93a');if(d>0){log(`Lightning strikes ${t.name} for ${d}!`);fx(t,String(d),'dmg');hurt(t,d);}else{log(`Lightning crackles around ${t.name} but misses.`);}
    if(B.cur.hp<=0||checkEnd()){render();if(!B.over)later(advance,PAUSE*.6);return true;}}}
  if(W.blind&&RNG()<W.blind){const t=pick(liveUnits().filter(u=>u!==B.lastBlind));B.lastBlind=t;if(t&&!has(t,'blind')){log(`Sand whips into ${t.name}'s eyes.`);addSt(t,'blind',null,true);}}
  return false;
}

// =================== PERSONAL QUESTS & SIGNATURE WEAPONS ===================
const PQ_TEXT={
 warrior:'{n} has a score to settle with {r}, the beast that shattered {n}\'s first blade.',
 knight:'{n} swore an oath to stop {r} before it reaches another village.',
 mage:'{n} has been tracking a strange resonance. {r} has swallowed a lost {e} focus.',
 healer:'{n} heard that {r} is hoarding a relic of the first lamp-keepers.',
 thief:'{n} owes a debt, and {r} is sitting on the payment.',
 archer:'{n} missed {r} once, years ago, and has not missed anything since.',
 monk:'{n}\'s old master fell to {r}. Time to finish the lesson.',
 bard:'{n} needs one more verse for the ballad, and {r} is it.',
 chronicler:'{n} is missing one page from the archive, and {r} ate it.'};
const SIGW={chronicler:'Lost Folio',warrior:'Heirloom Edge',knight:'Vow Blade',mage:'Lost Focus',healer:'Lamp Relic',thief:'Debt Collector',archer:'Second Shot',monk:"Master's Wraps",bard:'Final Verse',sniper:'Horizon Arbalest',druid:'Packcall Bow',archmage:'Stormglass Rod'};
const ALTW={sword:'greatsword',greatsword:'katana',axe:'hammer',hammer:'axe',spear:'trident',trident:'spear',dagger:'twindagger',twindagger:'katana',bow:'crossbow',crossbow:'bow',
 staff_orb:'staff_crystal',staff_crystal:'staff_sun',staff_sun:'staff_orb',staff_crook:'staff_sun',rod:'staff_crystal',tome:'staff_orb',lute:'harp',harp:'fan',fan:'harp',fists:'claws',claws:'katana',scythe:'katana',katana:'greatsword',mace:'hammer'};
function registerSignatures(){RAW.forEach(r=>{const id=r[0],t=TPL[id],fam=CF[t.cls][0],base=GEAR['w_'+fam+'_4']||GEAR['w_'+fam+'_3'],o={n:`${t.n}'s ${SIGW[t.cls]}`,slot:'w',tier:4,only:id,fam:fam,el:t.el[0],price:2400,attr:{[CLS[t.cls].pref[0]]:5}};
  ST.forEach(k=>{if(base[k])o[k]=Math.round(base[k]*(base[k]>0?1.08:1));});addGear('u_'+id,o);});}
// Beta v0.4.1 6.7: a personal quest now rewards a unique bound item. About 40% of heroes get a weapon ('u_'), 30% armor ('ua_') and 30% an accessory
// ('uc_'), picked by hero id so it is stable. Legendaries keep their weapon kits. A hero who already holds the old 'u_' weapon keeps it.
// Each one changes the hero's look: weapon swap, a cape and gold trim for armor, a circlet or bright gems for the accessory.
let SIGK=null;
function sigKind(id){if(!SIGK){SIGK={};const L=typeof LEGEND_IDS!=='undefined'?LEGEND_IDS:[],ids=RAW.map(r=>r[0]).filter(i=>!L.includes(i)).sort((a,b)=>hashS('pq'+a)-hashS('pq'+b));
  const nW=Math.round(RAW.length*.4)-L.length,nA=Math.round(RAW.length*.3);ids.forEach((i,k)=>{SIGK[i]=k<nW?'w':k<nW+nA?'a':'c';});L.forEach(i=>{SIGK[i]='w';});}
  return SIGK[id]||'w';}
function sigGid(id){const k=sigKind(id);return k==='w'?'u_'+id:(k==='a'?'ua_':'uc_')+id;}
function registerSignatures2(){RAW.forEach(r=>{const id=r[0],t=TPL[id],k=sigKind(id);if(k==='w')return;
  const phys=!(CLS_ARM[t.cls]==='light'),main=phys?'atk':'mag';
  // v0.4.3 tuning: tier 4 armor +8% (between the tier 4 and tier 5 shop pieces) and a Token on par with a rank 6 faction charm
  if(k==='a'){const base=GEAR['a_'+ARM_FAM[CLS_ARM[t.cls]||'medium']+'_4'];if(!base)return;const o={n:`${t.n}'s Oathmantle`,slot:'a',tier:4,only:id,fam:base.fam,weight:base.weight,price:3200,bound:1,attr:{[CLS[t.cls].pref[0]]:4}};
    ST.forEach(q=>{if(base[q])o[q]=Math.round(base[q]*(base[q]>0?1.08:1));});addGear('ua_'+id,o);}
  else addGear('uc_'+id,{n:`${t.n}'s Token`,slot:'c',tier:4,only:id,price:3200,bound:1,hp:130,[main]:15,spd:6,attr:{[CLS[t.cls].pref[0]]:4}});});}
registerSignatures();registerSignatures2();
function hasSignature(id){const c=G&&G.roster[id];return !!(c&&c.eq&&['w','a','c'].some(sl=>/^u[ac]?_/.test(String(c.eq[sl]||''))&&String(c.eq[sl]).endsWith('_'+id)));}
function sigSlots(id){const c=G&&G.roster[id],o={};if(c&&c.eq)['w','a','c'].forEach(sl=>{if(/^u[ac]?_/.test(String(c.eq[sl]||''))&&String(c.eq[sl]).endsWith('_'+id))o[sl]=1;});return o;}
function heroLook(id){const t=TPL[id];if(!t.look)return null;const S=sigSlots(id);if(!S.w&&!S.a&&!S.c)return t.look;const L=Object.assign({},t.look);
  if(S.w)L.wpn=ALTW[t.look.wpn]||t.look.wpn;
  if(S.a){L.back=(t.look.back||[]).includes('cape')?t.look.back:(t.look.back||[]).concat('cape');L.pal=Object.assign({},t.look.pal||{},{Q:'#f6d98a',G:'#ffe27a'});}
  if(S.c){if(!t.look.hat||t.look.hat==='none')L.hat='circlet';L.pal=Object.assign({},L.pal||t.look.pal||{},{G:'#7af0ff',Y:(t.look.pal||{}).Y});}
  return L;}
function startPersonal(id){
  const c=G.roster[id];if(!personalEligible(c)||(G.personal[id]&&G.personal[id].state!=='open'))return null;
  const s=G.stage,Z=ZS(s),R=seeded((hashS(id)+G.run.seed)>>>0),mon=Z.pool[Math.floor(R()*Z.pool.length)],mod=ELITE_MODS[Math.floor(R()*ELITE_MODS.length)];
  const name=`${MON[mon].n} ${ELITE_TITLES[Math.floor(R()*ELITE_TITLES.length)]}`,t=TPL[id];
  const q={id:'p_'+id,personal:id,stage:s,mon,mod:mod.k,name,lv:Math.max(STAGE_LV[s][0]+4,c.lv+1),state:'active',
    text:PQ_TEXT[t.cls].replace(/\{n\}/g,t.n).replace(/\{r\}/g,name).replace(/\{e\}/g,EL[t.el[0]].toLowerCase()),reward:{}};
  G.personal[id]=q;saveGame();return q;
}
function personalDone(b,info){
  b.state='done';const gid=(G.gear.includes('u_'+b.personal)||Object.values((G.roster[b.personal]||{}).eq||{}).includes('u_'+b.personal))?'u_'+b.personal:sigGid(b.personal);G.gear.push(gid);info.gear=gid;info.personal=TPL[b.personal].n;
  const g=Math.round(300+G.stage*200);G.gold+=g;info.gold+=g;
}

// =================== TAMING ===================
function tameClass(m){if(m.mag>m.atk+.15)return m.res>=1.15?'healer':'mage';if(m.def>=1.35)return 'knight';if(m.spd>=1.35)return 'thief';if(m.spd>=1.15)return 'archer';return m.hp>=1.3?'warrior':'monk';}
function tameTrait(m){return m.spd>=1.3?'swift':m.def>=1.4?'bulwark':m.hp>=1.4?'sturdy':m.mag>=1.2?'arcane':m.atk>=1.2?'berserk':'keen';}
function registerTamed(o){const m=MON[o.mon]||guardianDef(o.mon);if(!m)return;TPL[o.id]={id:o.id,n:o.name,cls:o.cls,el:m.el.slice(),trait:o.trait,bio:o.scourge?`A lesser whelp of ${m.n}, a Scourge, coaxed into following you by Nikaris. A shadow of the real thing, but loyal.`:o.bb?`Tamed with Nikaris's help. A ${m.n} that trusts you now, and fights harder for it.`:`Tamed after a bounty hunt. A ${m.n}, still a little feral, fiercely loyal now.`,src:'tame',look:null,mon:o.mon,art:m.art,bb:o.bb?1:0,scourge:o.scourge?1:0};}

// =================== DAILY TRIAL ===================
// A short, seeded gauntlet: the same party, weather and foes for everyone on a given day. It never touches your journey save.
function dailyKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dailyPlan(key){
  const seed=hashS('aurelis-daily-'+key),R=seeded(seed);
  const ids=RAW.filter(r=>r[6]!=='x'&&r[6]!=='L').map(r=>r[0]).sort((a,b)=>hashS(a+key)-hashS(b+key)).slice(0,6);
  const wk=WX_BASE,weather=wk[Math.floor(R()*wk.length)];
  const MK=Object.keys(MON).filter(k=>!MON[k].night&&!MON[k].mimic),mon=MK[Math.floor(R()*MK.length)],gk=GPOOL[Math.floor(R()*GPOOL.length)];
  const mod=ELITE_MODS[Math.floor(R()*ELITE_MODS.length)].k;
  return {key,seed,ids,weather,waves:[{kind:'arena',lvs:[23,25]},{kind:'arena',lvs:[24,26]},{kind:'elite',bounty:{mon,mod,name:`${MON[mon].n} the Daily Terror`,lv:27,stage:2}},{kind:'echoBoss',key:gk,lv:27,hpM:1.25,powM:1}]};
}
// the Trial keeps the stat-point plan it had before Faith existed
const DAILY_PREF={healer:['spi','int','vit'],chronicler:['int','spi','vit']};
function startDaily(){
  const P=dailyPlan(dailyKey()),stash=G;
  newGame(P.ids.slice(0,3),0,[]);G.run={order:[0,1+(P.seed%4),2,3,5],bosses:GPOOL.slice(0,4),final:FPOOL[0],cycle:0,seed:P.seed};
  G.roster={};G.party=[];P.ids.forEach(id=>{const c=newChar(id,26,3);const pr=(DAILY_PREF[TPL[id].cls]||CLS[TPL[id].cls].pref),pat=[0,1,0,2,0,1];c.alloc={};c.pts=Math.floor(26/2);for(let i=0;i<c.pts;i++){const k=pr[pat[i%6]];c.alloc[k]=(c.alloc[k]||0)+1;}c.pts=0;c.auto=false;c.eq={w:c.eq.w+'+1',a:c.eq.a+'+1',c:null};c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;G.roster[id]=c;G.party.push(id);});
  G.inv={potion:3,hipotion:2,ether:2,remedy:2,plume:1,elixir:0};G.stage=2;G.cleared=[true,true,false,false,false];
  G.daily={key:P.key,stash,start:Date.now()};
  return startBattle({stage:2,kind:'daily',waves:P.waves.length,waveSpecs:P.waves,seed:P.seed,weather:P.weather});
}
function dailyScore(won){
  const hp=allParty().reduce((a,c)=>a+Math.max(0,c.hp)/c.S.mhp,0)/allParty().length;
  const waves=won?B.spec.waves:B.wave-1;
  return Math.max(0,Math.round(waves*1500-(B.pturns||0)*18-(B.kos||0)*250+(won?hp*2000:0)));
}
function dailyWin(){const sc=dailyScore(true);B.over=true;V.modal={type:'dailyEnd',won:true,score:sc,turns:B.pturns||0,kos:B.kos||0,key:G.daily.key};saveMeta();render();}
function dailyLose(){const sc=dailyScore(false);B.over=true;V.modal={type:'dailyEnd',won:false,score:sc,turns:B.pturns||0,kos:B.kos||0,key:G.daily.key};render();}
function endDaily(){const stash=G&&G.daily?G.daily.stash:null;B=null;G=stash;return !!stash;}

// =================== SAVE SLOTS & EXPORT ===================
function slotSummary(s){const o=loadRaw(s);if(!o)return null;const party=(o.party||[]).filter(id=>TPL[id]||(o.tamed||[]).some(t=>t.id===id));
  return {stage:o.stage,cleared:(o.cleared||[]).filter(Boolean).length,cycle:o.run?o.run.cycle:0,party,lv:party.length?Math.round(party.reduce((a,id)=>a+((o.roster[id]||{}).lv||0),0)/party.length):0,gold:o.gold,savedAt:o.savedAt||0,battles:(o.stats||{}).battles||0};}
function exportSave(){return 'AWSAVE1.'+btoa(unescape(encodeURIComponent(JSON.stringify(packG()))));}
// v0.4.3: sprite cache key for whatever changes a hero's look. v0.6.3: only the hero's own personal reward (signature weapon, Oathmantle,
// Token) changes the look; capes and shop armor no longer show on the body, so they are not part of the key.
function lookKey(id){try{const c=G&&G.roster[id];if(!c||!c.eq)return '';const k=['w','a','c'].map(sl=>{const v=String(c.eq[sl]||'');return /^u[ac]?_/.test(v)&&v.endsWith('_'+id)?v:'';}).join('|');return k.replace(/\|/g,'')?':'+k:'';}catch(e){return '';}}
