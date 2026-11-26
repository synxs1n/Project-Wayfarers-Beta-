// Beta v0.5.1: balance sims on the real game. Loads EVERY v3 module in build order (the list in v3build.py) in headless Chrome,
// so every v0.5.0 system (XP catch up, surprise starts, first realm single types, Guild perks, shop and party changes) is live,
// and drives battles with the same queue loop as tools/v3sim.js (the game's own careful brain or its auto).
// Usage: node tools/fullsim.js <sim> [args]   sims: boss, stage1, xp, journey, early   (run from the repo root, no tools/v3 link needed)
//   SEED=<n> replaces Math.random with a seeded LCG and freezes Date.now (new journeys draw their realms from it; DRAW=<n> steps the frozen clock to draw another
//   journey, the same realms and bosses for every run of one sim), so two builds
//   can be compared exactly (before/after a cleanup)
//   boss [N]        Scourge 4, Calamity and their Echoes at party levels 30/35/40/45, parties of 6 and 3
//   stage1 [N]      stage 1 field fights at level 3: careful and auto, how many foes are dual type, surprise starts on roamers
//   xp [fights]     XP catch up: newcomers below the party's top level, levels gained per hero
//   xpcamp [fights] v0.6.3: a party of 6 that is G levels below a veteran resting at camp (the roster's top level), levels gained
//   b4 [N]          v0.7.0: auto against careful play on normal fights and bosses (win, turns, HP lost)
//   journey [runs]  full journey pacing: every stage's required route on the real maps at the real encounter rate, a recruit per
//                   realm up to six, and each boss fought until it falls (5 more fights after each loss, like a player who grinds
//                   until ready); ends with the top hero's level and the party's average level. Quests, chests and side caves are not
//                   counted, so real players end a little higher
//                   v0.9.5: the visible roamers the journey spawns (field and dungeon; ROAMSHARE=.8 of them fought, half caught unaware) are
//                   real roamer fights, and the side sites (the field's cave and fortress; SITESHARE=.7 visited, after the boss) add their
//                   walk, time and miniboss. SUMMARY splits the fights into roamers, random and minibosses.
//   out [N]         v0.22.54: like gim (same parties), with how fights go: hero turns in wins and losses, damage taken and healed, the first KO, the boss's
//                   HP left at a wipe. BOSSES=siren,drake limits the bosses, BG_STAGES and GIM_AUTO as for gim, DLV=-2 party levels under the boss level
//   cls [N]         v0.22.54: what a class is worth: a random party with no hero of the class against the same party with one seat given to one
//                   (paired, same rolls): win rate without -> with. CLS=warrior,mage limits the classes, NOTAUNT=1 switches Taunt off, NOSK=cry removes skills
//   diag [N]        v0.22.54: per class in random parties: damage per action, actions per fight, damage taken, KOs, stats. DCLS=warrior lists that class's skills used
//   gim [N]         v0.9.5: every Scourge and Calamity with its realm gimmick: win rate, telegraphs, landings, answers, gimmick damage
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=process.env.SIMROOT||path.join(__dirname,'..'),V3=path.join(ROOT,'v3');// SIMROOT=<another checkout> runs the same sims on that build (for before/after)
const BP=fs.readFileSync(path.join(ROOT,'v3build.py'),'utf8'),MODS=JSON.parse((BP.match(/MODS=(\[[^\]]+\])/)||BP.match(/for n in (\[[^\]]+\])/))[1].replace(/'/g,'"'));
const MOCK=(()=>{const s=fs.readFileSync(path.join(__dirname,'chrome','beta.js'),'utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
const SRC=MODS.map(f=>fs.readFileSync(path.join(V3,f),'utf8')).join('\n');
// the same exports and loop as tools/v3sim.js, built inside the page
const HARNESS=`
function render(){}
// v0.9.5: the sims play elite roamers and minibosses by hand too (the game bans auto there), like the boss auto lock below
if(typeof autoBan==='function')autoBan=function(){return null;};
// v0.9.5 auto per foe type (prog2.js): a fight whose foe types are not open yet is played by hand. The sims drive every fight with the
// careful brain through B.auto, so the lock is lifted while such a fight runs (window.__TYPEFREE) and the fight is paid and timed as manual.
if(typeof autoTypeReason==='function'){const atr0=autoTypeReason;autoTypeReason=function(){return window.__TYPEFREE?null:atr0.apply(this,arguments);};}
return {HOOK,known,wrapKnown:w=>{const k0=known;known=function(c){return w(k0.apply(this,arguments),c);};},get G(){return G},set G(v){G=v},get B(){return B},V,get META(){return META},newGame,newChar,startBattle,advance,autoTurn,
  autoTurnSmart:typeof autoTurnSmart==='function'?autoTurnSmart:autoTurn,setPause:p=>{PAUSE=p},setSmart:v=>{if(typeof SIM_SMART!=='undefined')SIM_SMART=v},
  finishBattle,calcStats,TPL,RAW,GPOOL,FPOOL,STAGE_BOSS_LV,STAGE_LV,GEAR,recruit,refresh,encounterFoes,getMap,resetMaps,mapEntry,findPath:typeof findPath==='function'?findPath:null,
  ENC_RATE,ENC_MIN_STEPS,SOLID,syncPools:typeof syncPools==='function'?syncPools:()=>{},roamSpawn:typeof roamSpawn==='function'?roamSpawn:null,miniFor:typeof miniFor==='function'?miniFor:null,siteHasMini:typeof siteHasMini==='function'?siteHasMini:null,ZS,newRun:typeof newRun==='function'?newRun:null,avgLv,gearTier,ROAM:typeof ROAM!=='undefined'?ROAM:null,SURPRISE:typeof SURPRISE!=='undefined'?SURPRISE:null,
  DUAL_FROM:typeof DUAL_FROM!=='undefined'?DUAL_FROM:null,B4:typeof B4!=='undefined'?B4:null,XPCU:typeof XPCU!=='undefined'?XPCU:null,need,
  cfgSet:(k,v)=>{const p=k.split('.');let o=eval(p[0]);for(let i=1;i<p.length-1;i++)o=o[p[i]];o[p[p.length-1]]=v;},
  E17:typeof E17!=='undefined'?E17:null,get WS(){return WS},get MAPS(){return MAPS},ZONES,ro14Pool:typeof ro14Pool==='function'?ro14Pool:null,xpFor,
  innHeal:()=>Object.values(G.roster).forEach(c=>{c.ail={};c.st={};c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;})};`;
const LOOP=`
const Q=window.__Q;
${JSON.stringify(process.env.CFGSET||'')}.split(';').forEach(kv=>{if(!kv)return;const i=kv.indexOf('=');A.cfgSet(kv.slice(0,i),JSON.parse(kv.slice(i+1)));});// CFGSET='BOSS_LV.frac=.3;ECON.xp=1' tries other config values (objects only)
function run(spec){Q.length=0;try{A.syncPools();}catch(e){}
  // the sims stand in for a player who plays every fight: the 'win it manually once first' auto lock on bosses does not apply
  try{A.G.bossWon=new Proxy({},{get:()=>1});}catch(e){}A.setSmart(!window.__AUTO);A.V.auto=true;try{A.META.cfg.autoOn=true;}catch(e){}A.META.best={};window.__TYPEFREE=0;if(!A.startBattle(spec))return null;const lk=!!(A.B&&A.B.autoLock);if(lk){window.__TYPEFREE=1;A.B.auto=true;}
  let it=0,hpEnd=null;/* early: the party's HP at the last step before the fight ended (the rewards may level a hero up and heal it) */while(it++<400000){const m=A.V.modal;if(m&&(m.type==='result'||m.type==='lose'))break;
    if(!Q.length){if(A.B&&A.B.mode==='cmd')(window.__AUTO?A.autoTurn:A.autoTurnSmart)();else if(A.B&&!A.B.over)A.advance();if(!Q.length)break;}
    if((window.__MANUAL||lk)&&A.B)A.B.tA=0;Q.shift()();if(window.__HPTRACK&&A.B&&!A.B.over)hpEnd=A.G.party.reduce((a,id)=>a+Math.max(0,A.G.roster[id].hp),0);}
  const m=A.V.modal,res=m&&m.type==='result'?'win':m&&m.type==='lose'?'lose':'stuck',info=m&&m.info;const t=A.B?A.B.time:0,en=A.B?A.B.en.map(e=>({el:e.el.slice(),boss:!!e.boss,elite:!!e.elite,role:e.role||null,lv:e.lv,mhp:e.S.mhp,pow:Math.max(e.S.atk,e.S.mag),xp:A.xpFor(e)})):[],sur=A.B?!!A.B.surprise:false;
  const pt=A.B?A.B.pturns||0:0,an=A.B?A.B.actN||0:0,b4=A.B?{det:A.B.nDet||0,mp:A.B.b4detMp||0,sw:(A.B.b4swN||0),aSw:A.B.autoSwaps||0,roles:A.B.b4roles||{},mo:A.B.b4mo?A.B.b4mo.hist.length:0,gt:A.B.b4gTells||0,gl:A.B.b4gLand||0,gs:A.B.b4gStop||0,gh:A.B.b4gHits||0,gk:A.B.b4g?A.B.b4g.key:null}:{};
  A.V.modal=null;if(A.B)A.finishBattle("x");window.__TYPEFREE=0;return {res,t,info,en,sur,pt,an,b4,lk,hpEnd};}
function party(ids,lv,tier){A.newGame(ids.slice(0,3));const G=A.G;G.roster={};G.party=[];ids.forEach(id=>{const c=G.roster[id]=A.newChar(id,lv,tier);if(A.GEAR['k_cape_'+Math.min(5,tier)]){c.eq.k='k_cape_'+Math.min(5,tier);c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;}G.party.push(id);});}
let seed=909;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]&&!A.TPL[r[0]].mon).map(r=>r[0]);
const pick=n=>{const p=[];while(p.length<n){const id=pool[Math.floor(R()*pool.length)];if(!p.includes(id))p.push(id);}return p;};
`;
// v0.8.2 play time model for the journey sim (seconds). A fight costs fightIn (the encounter flash and stage build) + fightOut (the rewards
// screen and back to the map) + every action on screen (o.an: hero and foe actions) x anim (animation, floating numbers and the pause before the
// next turn at normal speed; animAuto with auto on, which most players run at 1.5x) + the player's choice for each hero turn (decide: open a
// menu, pick a skill and a target; autoDecide with auto). Bosses add bossIntro (their lines and the boss card) and are always played by hand.
// A typical player auto battles autoShare of the ordinary fights. Walking: route steps x wander (detours, chests, gathering, dead ends a first
// run walks) at walk tiles per second. Per realm: town (shops, equipment, inn, tavern, quests, the Guild) and story (scenes, the realm
// intro, the boss's lines). retry: walking back to rest after a lost boss fight. start: the title, starter pick and the first tutorial.
// Calibration: battle pacing PAUSE 750 ms per step (engine.js: about 1.3 s per action with the animation), the v0.4.0 hours10 model
// (4.2 tiles/s, 45 s per fight), and the v0.4.0 note of about 31 minutes per realm on the required path.
// v0.9.5: roamWalk: steps walked to reach a roamer and back to the path (each one fought).
// siteSteps / siteTime: a visited side site's walk (in, around and out) and the time spent on its chests, levers and prize, besides fights.
// side (per realm) is the rest of the optional content (quests, bounties, gathering, chance meetings): 480 before v0.9.5, when the side sites were in it.
const TIME={roamWalk:30,siteSteps:110,siteTime:300,fightIn:4,fightOut:7,anim:1.35,animAuto:.9,decide:2.6,autoDecide:0,bossIntro:25,autoShare:.6,walk:4.2,wander:1.4,town:600,story:300,side:300,retry:60,start:300};
const SIMS={
dbg:()=>`party(pick(6),40,5);A.G.bossWon=new Proxy({},{get:()=>1});A.G.stage=3;A.G.cleared=[1,1,1,0,0];A.G.run.bosses[3]=A.GPOOL[0];const ok=A.startBattle({stage:3,kind:'boss'});let it=0;const log=[];while(it++<4000){const m=A.V.modal;if(m&&(m.type==='result'||m.type==='lose'))break;if(!Q.length){if(A.B&&A.B.mode==='cmd')A.autoTurnSmart();else if(A.B&&!A.B.over)A.advance();if(!Q.length){log.push('empty q mode='+(A.B&&A.B.mode)+' over='+(A.B&&A.B.over)+' modal='+(m&&m.type));break;}}Q.shift()();}
  return 'start '+ok+' it '+it+' modal '+(A.V.modal&&A.V.modal.type)+' B '+(A.B&&A.B.mode)+' '+log.join(';')+' en '+(A.B&&A.B.en.map(e=>e.name+':'+e.hp).join(','));`,
boss:N=>`N=${N||4};const out=[];
  for(const SZ of [6,3])for(const L of [30,35,40,45]){const tier=L>=40?5:L>=35?4:3,row=[];
    for(const [s,kind,label] of [[3,'boss','Scourge 4'],[4,'boss','Calamity'],[3,'storyEcho','Echo 4'],[4,'storyEcho','Echo Calamity']]){
      const keys=s<4?A.GPOOL:A.FPOOL;let w=0,n=0;
      keys.forEach(k=>{for(let i=0;i<(s<4?N:N*3);i++){party(pick(SZ),L,tier);A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<(kind==='boss'?s:s+1));
        if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;const spec=kind==='boss'?{stage:s,kind:'boss'}:{stage:s,kind:'storyEcho',key:k};
        let r=null;try{r=run(spec);}catch(e){continue;}if(!r)continue;n++;if(r.res==='win')w++;}});
      row.push(label+' '+w+'/'+n+'='+Math.round(100*w/Math.max(1,n))+'%');}
    out.push('party '+SZ+' lv '+L+' tier '+tier+': '+row.join(' | '));}
  return out.join('\\n');`,
stage1:N=>`N=${N||200};const out=[];
  for(const auto of [false,true]){window.__AUTO=auto;let w=0,n=0,hp=0,dual=0,foes=0;
    for(let i=0;i<N;i++){party(pick(3),3,0);A.G.stage=0;A.G.cleared=[0,0,0,0,0];A.G.run.seed=1000+i;A.innHeal();
      const mhp=A.G.party.reduce((a,id)=>a+A.G.roster[id].S.mhp,0);const r=run({stage:0,kind:'field'});if(!r)continue;n++;if(r.res==='win')w++;
      hp+=1-A.G.party.reduce((a,id)=>a+Math.max(0,A.G.roster[id].hp),0)/mhp;r.en.forEach(e=>{foes++;if(e.el.length>1)dual++;});}
    out.push((auto?'auto   ':'careful')+': party 3 at lv 3, stage 1 field: win '+Math.round(100*w/n)+'% | HP lost '+Math.round(100*hp/n)+'% | dual type foes '+dual+'/'+foes);}
  window.__AUTO=false;
  // surprise starts: an unaware roamer in the first dungeon, against one that saw you
  for(const aware of [false,true]){let w=0,n=0,hp=0,sur=0;
    for(let i=0;i<Math.round(N/2);i++){party(pick(3),7,1);A.G.stage=0;A.G.cleared=[0,0,0,0,0];A.innHeal();const mhp=A.G.party.reduce((a,id)=>a+A.G.roster[id].S.mhp,0);
      A.G.run.seed=2000+i;A.resetMaps();const dm=A.getMap('d0'),rs=(dm.roam&&dm.roam.length?dm.roam:A.roamSpawn(dm)).filter(q=>!q.elite);if(!rs.length)continue;const ro=rs[i%rs.length];
      const r=run({stage:0,kind:'dungeon',roam:{mid:dm.id,i:ro.i,mon:ro.mon,elite:false,mod:ro.mod,name:ro.name},surprise:!aware?1:0});if(!r)continue;n++;if(r.res==='win')w++;if(r.sur)sur++;
      hp+=1-A.G.party.reduce((a,id)=>a+Math.max(0,A.G.roster[id].hp),0)/mhp;}
    out.push('roamer, party 3 at lv 7, '+(aware?'it saw you  ':'unaware     ')+': win '+Math.round(100*w/n)+'% | HP lost '+Math.round(100*hp/n)+'% | surprise rounds '+sur+'/'+n);}
  return out.join('\\n');`,
xp:F=>`F=${F||30};const out=[];const ids=['brann','mira','sable','lumen','oren','gilda'];const lv=id=>{const c=A.G.roster[id];return c.lv+(A.need?c.xp/Math.max(1,A.need(c.lv)):0);};
  for(const [s,L,gap] of [[1,14,3],[1,14,8],[2,21,10],[3,29,5],[4,36,6]]){let top=0,fr=0,bk=0,cu=0;const RUNS=3;
    for(let r=0;r<RUNS;r++){party(ids,L,Math.min(5,s));A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);[ids[2],ids[5]].forEach(id=>{A.G.roster[id]=A.newChar(id,L-gap,Math.min(5,s));});
      A.G.party=ids.slice(0,3).concat([ids[5],ids[3],ids[4]]);A.innHeal();const t0=lv(ids[0]),f0=lv(ids[2]),b0=lv(ids[5]);
      for(let i=0;i<F;i++){const o=run({stage:s,kind:'field',weather:'clear'});if(o&&o.info&&(o.info.catchup||o.info.cu))cu++;A.innHeal();}
      top+=lv(ids[0])-t0;fr+=lv(ids[2])-f0;bk+=lv(ids[5])-b0;}
    out.push('stage '+(s+1)+', party lv '+L+', newcomers '+gap+' behind: levels gained in '+F+' fights: top hero '+(top/RUNS).toFixed(2)+', front newcomer '+(fr/RUNS).toFixed(2)+', reserve newcomer '+(bk/RUNS).toFixed(2)+' (fights with a catch up row: '+cu+')');}
  return out.join('\\n');`,
xpcamp:F=>`F=${F||30};const out=[];const ids=['brann','mira','sable','lumen','oren','gilda'],vet='tess';const lv=id=>{const c=A.G.roster[id];return c.lv+(A.need?c.xp/Math.max(1,A.need(c.lv)):0);};
  for(const [s,L,gap] of [[1,14,3],[2,21,5],[3,29,8],[4,36,4]]){let fr=0,bk=0,cu=0;const RUNS=3;
    for(let r=0;r<RUNS;r++){party(ids,L-gap,Math.min(5,s));A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);A.G.roster[vet]=A.newChar(vet,L,Math.min(5,s));A.innHeal();
      const f0=lv(ids[0]),b0=lv(ids[4]);
      for(let i=0;i<F;i++){const o=run({stage:s,kind:'field',weather:'clear'});if(o&&o.info&&o.info.catchup&&o.info.catchup.length)cu++;A.innHeal();}
      fr+=lv(ids[0])-f0;bk+=lv(ids[4])-b0;}
    out.push('stage '+(s+1)+', veteran at camp lv '+L+', party '+gap+' behind: levels gained in '+F+' fights: front '+(fr/RUNS).toFixed(2)+', reserve '+(bk/RUNS).toFixed(2)+' (fights with a catch up row: '+cu+')');}
  return out.join('\\n');`,
// v0.7.0 battle mechanics: auto (the game's auto battle) against careful play (the sims' careful brain; on v0.7.0 it also reads
// foe roles, guards telegraphs, uses the free swap and varies its moves) on normal fights and bosses, parties of 6 (3 front, 3 Rearguard).
// Per row: win rate, party actions per fight (turns), HP lost (the whole party's HP, fights started at full). Run it with SIMROOT on the
// previous build for the before numbers. B4OFF=swap,mo,det,roles switches those v0.7.0 systems off (to see what each one does); B4SET=roles.boss.pw=2.4,mo.dmg=.1 tries other tunables.
b4:N=>`N=${N||40};const out=[];${JSON.stringify(process.env.B4OFF||'')}.split(',').forEach(k=>{if(k&&A.B4&&A.B4[k])A.B4[k].on=false;});${JSON.stringify(process.env.B4SET||'')}.split(',').forEach(kv=>{const [k,v]=kv.split('=');if(!k||!A.B4)return;const p=k.split('.'),o=p.slice(0,-1).reduce((q,x)=>q[x],A.B4);o[p[p.length-1]]=+v;});const hpOf=()=>A.G.party.reduce((a,id)=>a+Math.max(0,A.G.roster[id].hp),0);
  const row=(label,mk)=>{const cols=[];for(const auto of [true,false]){window.__AUTO=auto;let w=0,n=0,pt=0,hp=0,det=0,sw=0,rf=0,ro=0;
      for(let i=0;i<N;i++){const spec=mk(i);A.innHeal();const mhp=A.G.party.reduce((a,id)=>a+A.G.roster[id].S.mhp,0);let r=null;try{r=run(spec);}catch(e){continue;}if(!r)continue;n++;if(r.res==='win')w++;
        pt+=r.pt;hp+=1-hpOf()/mhp;det+=r.b4.det||0;sw+=(r.b4.sw||0);rf+=(r.b4.mp||0);ro+=Object.values(r.b4.roles||{}).reduce((a,b)=>a+b,0);}
      cols.push((auto?'auto   ':'careful')+' win '+Math.round(100*w/Math.max(1,n))+'% turns '+(pt/Math.max(1,n)).toFixed(1)+' HP lost '+Math.round(100*hp/Math.max(1,n))+'% (reactions '+(det/Math.max(1,n)).toFixed(2)+', free swaps '+(sw/Math.max(1,n)).toFixed(2)+', role moves '+(ro/Math.max(1,n)).toFixed(2)+')');}
    window.__AUTO=false;out.push(label+'\\n    '+cols.join('\\n    '));};
  for(let s=0;s<5;s++){const L=Math.round((A.STAGE_LV[s][0]+A.STAGE_LV[s][1])/2)+1;
    row('stage '+(s+1)+' field, party of 6 at lv '+L,i=>{seed=5000+s*977+i*13;party(pick(6),L,s);A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);A.G.run.seed=7000+i;return {stage:s,kind:'field',weather:'clear'};});}
  for(let s=0;s<5;s++){const L=A.STAGE_BOSS_LV[s];
    row('stage '+(s+1)+' boss, party of 6 at lv '+L,i=>{seed=8000+s*911+i*17;party(pick(6),L,s);A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);if(s<4)A.G.run.bosses[s]=A.GPOOL[i%A.GPOOL.length];else A.G.run.final=A.FPOOL[i%A.FPOOL.length];return {stage:s,kind:'boss'};});}
  return out.join('\\n');`,
// v0.8.2 bossgrid [N]: every Scourge (and the Calamities) at each stage, journey party sizes (3,4,5,6,6), at boss level -2, 0 and +2: win rate
// and average party actions; shows which boss and stage is a wall. BG_STAGES=0,1 limits the stages.
bossgrid:N=>`N=${N||6};const out=[];const SZ=[3,4,5,6,6];const ST=${JSON.stringify(process.env.BG_STAGES||'0,1,2,3,4')}.split(',').map(Number);
  for(const s of ST){const keys=s<4?A.GPOOL:A.FPOOL;for(const dl of [-2,0,2]){const L=A.STAGE_BOSS_LV[s]+dl;const row=[];let W=0,Nn=0;
    for(const k of keys){let w=0,n=0,pt=0;for(let i=0;i<N;i++){seed=3100+s*997+i*31+keys.indexOf(k)*7;party(pick(SZ[s]),L,s);A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);
      if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;A.innHeal();let r=null;try{r=run({stage:s,kind:'boss'});}catch(e){continue;}if(!r)continue;n++;pt+=r.pt;if(r.res==='win')w++;}
      W+=w;Nn+=n;row.push(k+' '+Math.round(100*w/Math.max(1,n))+'%/'+(pt/Math.max(1,n)).toFixed(0));}
    out.push('stage '+(s+1)+' party '+SZ[s]+' lv '+L+': all '+Math.round(100*W/Math.max(1,Nn))+'% | '+row.join(' '));}}
  return out.join('\\n');`,
// v0.9.5 gim [N] (BG_STAGES=4 limits the stages, GIM_AUTO=0 careful only): each Scourge and Calamity at its stage (journey party size, boss level), careful and auto: win rate, telegraphs and landings
// per fight (a landing is the gimmick going off; stops are telegraphs the party answered), the damage the gimmick dealt as a share of the party's HP.
gim:N=>`N=${N||6};const out=[];const SZ=[3,4,5,6,6];
  const ST=${JSON.stringify(process.env.BG_STAGES||'0,1,2,3,4')}.split(',').map(Number),AU=${JSON.stringify(process.env.GIM_AUTO||'0,1')}.split(',').map(Number);
  for(const auto of AU.map(Boolean)){window.__AUTO=auto;for(const s of ST){const keys=s<4?A.GPOOL:A.FPOOL;const row=[];
    for(const k of keys){let w=0,n=0,gt=0,gl=0,gs=0,gh=0,mh=0;for(let i=0;i<N;i++){seed=3100+s*997+i*31+keys.indexOf(k)*7;party(pick(SZ[s]),A.STAGE_BOSS_LV[s],s);A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);
      if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;A.innHeal();mh+=A.G.party.reduce((a,id)=>a+A.G.roster[id].S.mhp,0);let r=null;try{r=run({stage:s,kind:'boss'});}catch(e){continue;}if(!r)continue;n++;if(r.res==='win')w++;gt+=r.b4.gt;gl+=r.b4.gl;gs+=r.b4.gs;gh+=r.b4.gh;}
      row.push(k+' '+Math.round(100*w/Math.max(1,n))+'% t'+(gt/Math.max(1,n)).toFixed(1)+' l'+(gl/Math.max(1,n)).toFixed(1)+' s'+(gs/Math.max(1,n)).toFixed(1)+' hp'+Math.round(100*gh/Math.max(1,mh))+'%');}
    out.push((auto?'auto    ':'careful ')+'stage '+(s+1)+' party '+SZ[s]+' lv '+A.STAGE_BOSS_LV[s]+': '+row.join(' | '));}}
  window.__AUTO=false;return out.join('\\n');`,
// early [N] (early17.js, docs/early17.md): the first field of the first realm for a fresh party of three from the starter pool. Geometry over
// MAPSEEDS (default 8) maps of each realm that can come first: the grass tiles and the roamers in each band of the field (near, middle, far third
// by walking distance from the entrance), elites among them, the nearest roamer. Then N fights per row at party levels 1 to 5 (a new journey
// starts at 3): "before" (the module off), and the near, middle and far band with it on (spec.e17), with the game's auto and the careful brain:
// win rate, share of the party's HP lost (mean, and how many fights cost over 35%), rounds (hero turns / 3), foes, their levels and HP, XP of the
// foes. Roamer fights the same way (a plain roamer and an elite before; a near and a middle roamer after). EARLY_LV=3,4 limits the levels.
// EARLY_ONLY=1: only the near and middle grass rows with auto (the test tools/chrome/v193a.js reads them).
early:N=>`N=${N||150};const out=[];const E=A.E17,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z&&z.key,i]));const FIRST=['thistle','orchard','strand','lakes','moors'];
  const sp=A.ro14Pool?A.ro14Pool():pool;const pick3=()=>{const p=[];while(p.length<3){const id=sp[Math.floor(R()*sp.length)];if(!p.includes(id))p.push(id);}return p;};
  const KS=${+process.env.MAPSEEDS||8},geo=[0,0,0],ro=[0,0,0],el=[0,0,0],nearest=[],firstB=[0,0,0];let maps=0,soft=0;
  for(const key of FIRST)for(let k=0;k<KS;k++){A.newGame(pick3());const G=A.G;G.run.order[0]=zi[key];G.run.seed=5000+k*977+zi[key]*31;A.resetMaps();try{A.syncPools();}catch(e){}
    const m=A.getMap('f0');maps++;const c=E.api.dist(m);
    for(let y=0;y<c.H;y++)for(let x=0;x<c.W;x++)if(m.t[y][x]===',')geo[E.api.bandAt(m,x,y)]++;
    E.off=1;m.roam=null;const L=(A.roamSpawn(m)||[]).filter(r=>!r.gone);E.off=0;let nd=1e9,nb=2;
    L.forEach(r=>{const b=E.api.bandAt(m,r.hx,r.hy);ro[b]++;if(r.elite)el[b]++;const d=c.D[r.hx+r.hy*c.W];if(d>=0&&d<nd){nd=d;nb=b;}});nearest.push(Math.round(100*nd/c.end));firstB[nb]++;
    m.roam=null;soft+=(A.roamSpawn(m)||[]).filter(r=>r.e17).length;m.roam=null;}
  const tg=geo[0]+geo[1]+geo[2];nearest.sort((a,b)=>a-b);
  out.push('maps '+maps+' ('+FIRST.join(', ')+' x '+KS+' seeds): grass tiles near/middle/far '+geo.map(g=>Math.round(100*g/tg)+'%').join('/')+' | roamers per field near/middle/far '+ro.map(g=>(g/maps).toFixed(2)).join('/')+', elite '+el.map(g=>(g/maps).toFixed(2)).join('/')+' (made plain by early17: '+(soft/maps).toFixed(2)+' per field) | nearest roamer at '+nearest[0]+'% to '+nearest[nearest.length-1]+'% of the way (median '+nearest[nearest.length>>1]+'%), in the near/middle/far band on '+firstB.join('/')+' maps');
  const LV=${JSON.stringify(process.env.EARLY_LV||'1,2,3,4,5')}.split(',').map(Number);
  window.__HPTRACK=1;
  const fight=(label,L,mk,auto,off)=>{window.__AUTO=auto;let w=0,n=0,hp=0,over=0,pt=0,foes=0,lv=0,lvMax=0,fh=0,xp=0,nb=[0,0,0,0];
    for(let i=0;i<N;i++){seed=7000+i*13+L*101;party(pick3(),L,0);const G=A.G;G.run.order[0]=zi[FIRST[i%FIRST.length]];G.stage=0;G.cleared=[0,0,0,0,0];G.run.seed=1000+i;A.resetMaps();A.innHeal();
      E.off=off?1:0;const spec=mk(i);if(!spec){E.off=0;continue;}const ph=G.party.reduce((a,id)=>a+G.roster[id].S.mhp,0);let r=null;try{r=run(spec);}catch(e){r=null;}E.off=0;if(!r)continue;n++;const win=r.res==='win';if(win)w++;
      const lost=win?Math.max(0,1-(r.hpEnd==null?ph:r.hpEnd)/ph):1;hp+=lost;if(lost>.35)over++;pt+=r.pt;
      foes+=r.en.length;nb[Math.min(3,r.en.length)]++;r.en.forEach(e=>{lv+=e.lv;lvMax=Math.max(lvMax,e.lv);fh+=e.mhp;xp+=e.xp;});}
    window.__AUTO=false;const d=Math.max(1,n);
    out.push('party lv '+L+' '+(auto?'auto   ':'careful')+' '+label+': win '+(100*w/d).toFixed(1)+'% | HP lost '+Math.round(100*hp/d)+'% (over 35% in '+Math.round(100*over/d)+'% of fights) | rounds '+(pt/d/3).toFixed(1)+' | foes '+(foes/d).toFixed(2)+' (1/2/3: '+nb.slice(1).map(x=>Math.round(100*x/d)+'%').join('/')+') lv '+(lv/Math.max(1,foes)).toFixed(1)+' (top '+lvMax+') | foe HP per fight '+Math.round(fh/d)+' | foe XP per fight '+Math.round(xp/d));};
  const fld=b=>()=>Object.assign({stage:0,kind:'field',weather:'clear'},b==null?{}:{e17:b});
  if(${process.env.EARLY_ONLY?1:0}){for(const L of LV){fight('grass near third    ',L,fld(0),true,0);fight('grass middle third  ',L,fld(1),true,0);}return out.join('\\n');}
  for(const L of LV){fight('grass before (any place)',L,fld(null),true,1);fight('grass near third    ',L,fld(0),true,0);fight('grass middle third  ',L,fld(1),true,0);fight('grass far third     ',L,fld(2),true,0);
    fight('grass before (any place)',L,fld(null),false,1);fight('grass near third    ',L,fld(0),false,0);}
  // roamers: a real roamer of this journey's first field; before = the module off (the level every roamer has), elite = the same one as an elite
  const rm=(b,elite)=>()=>{const m=A.getMap('f0');E.off=1;m.roam=null;const L=A.roamSpawn(m)||[];E.off=0;m.roam=null;const q=L.find(r=>!r.elite)||L[0];if(!q)return null;
    const e=L.find(r=>r.elite);return Object.assign({stage:0,kind:'field',weather:'clear',roam:{mid:m.id,i:q.i,mon:q.mon,elite:!!elite,mod:elite?(e?e.mod:'swift'):null,name:elite?(e?e.name:q.name+' the Swift'):q.name}},b==null?{}:{e17:b});};
  for(const L of LV.filter(x=>x>=3).concat([6,7])){fight('roamer before        ',L,rm(null,0),true,1);fight('elite roamer before  ',L,rm(null,1),true,1);fight('roamer near third    ',L,rm(0,0),true,0);fight('roamer middle third  ',L,rm(1,0),true,0);}
  return out.join('\\n');`,
journey:RUNS=>`RUNS=${RUNS||3};window.__DBG=${process.env.DBG?1:0};const out=[];const TM=${JSON.stringify(TIME)},EXPL=${+process.env.EXPLORE||1.5};const sums={lk:[],h:[],hm:[],ha:[],lv:[],f:[],tries:[],rf:[],rn:[],si:[],mi:[],mw:[]};const SITESHARE=${process.env.SITESHARE!=null?+process.env.SITESHARE:.7};const ROAMSHARE=${process.env.ROAMSHARE!=null?+process.env.ROAMSHARE:.8};
  const fT=(o,boss,auto)=>!o?0:TM.fightIn+TM.fightOut+(boss?TM.bossIntro:0)+o.pt*(auto?TM.autoDecide:TM.decide)+(o.an||o.pt*2)*(auto?TM.animAuto:TM.anim);
  // rewards: the game pays AUTO_REW of the XP for a win auto mostly played. A typical player plays (1-autoShare) of the ordinary fights by hand
  // (full XP) and every boss by hand; ALLAUTO=1 pays every ordinary fight at the auto rate (the pre v0.8.2 journey, where every fight counted as auto)
  const MAN=i=>${process.env.ALLAUTO?0:1}&&(i%10)<Math.round(10*(1-TM.autoShare));
  const fTt=(o,boss)=>boss?fT(o,1,0):TM.autoShare*fT(o,0,1)+(1-TM.autoShare)*fT(o,0,0);const ER=A.ENC_RATE.normal,GAP=A.ENC_MIN_STEPS,perFight=GAP+1/ER;
  // steps of the required route on the real maps of this journey: town to the field gate, across the field to the dungeon, and the
  // dungeon from its stairs to the boss door (4-way BFS, assets treated as walls). Fights = steps / (min gap + 1/rate) plus the roamers.
  const bfs=(m,a,b)=>{if(!a||!b)return 0;const g=m.t,H=g.length,W=g[0].length,D=g.map(r=>r.map(()=>-1)),q=[a];D[a[1]][a[0]]=0;
    const ok=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&(!SOLIDS.includes(g[y][x])||'XGD|E'.includes(g[y][x]));
    for(let i=0;i<q.length;i++){const [x,y]=q[i];if(Math.abs(x-b[0])+Math.abs(y-b[1])<=1)return D[y][x]+1;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(ok(nx,ny)&&D[ny][nx]<0){D[ny][nx]=D[y][x]+1;q.push([nx,ny]);}}}return 0;};
  const SOLIDS=A.SOLID;
  for(let r=0;r<RUNS;r++){seed=4242+r*77;const ids=pick(6);A.newGame(ids.slice(0,3));const G=A.G;G.run.seed=9000+r*131;A.resetMaps();
    let lockN=0,sitesN=0,siteAcc=0,miniN=0,miniW=0,rfN=0,rnN=0,fights=0,lost=0,bossTries=[],steps=[],grinds=[],sec=0,secM=0,secA=0,walk=0,losses=0;
    for(let s=0;s<5;s++){G.stage=s;G.cleared=[0,1,2,3,4].map(x=>x<s);
      // a recruit joins at each new realm until the party has six (the tavern, near the party's level)
      if(s>0&&G.party.length<6){const id=ids[G.party.length];G.gold=Math.max(G.gold,99999);A.recruit(id,true);}
      // v0.8.2: the party shops in each new realm's town: weapon and armor of the realm's tier and a cape of that tier (as players do; before
      // this the journey party kept its starting gear all game). NOGEAR=1 keeps the old behaviour.
      if(!${process.env.NOGEAR?1:0})G.party.forEach(id=>{const c=G.roster[id];['w','a'].forEach(sl=>{const g=c.eq[sl];if(g&&/^[wa]_[a-z]+_\\d/.test(g)){const n=g.replace(/_\\d(\\+\\d)?$/,'_'+Math.min(5,s));if(A.GEAR[n])c.eq[sl]=n;}});
        if(A.GEAR['k_cape_'+Math.min(5,s)])c.eq.k='k_cape_'+Math.min(5,s);c.S=A.calcStats(c);});
      const f=A.getMap('f'+s),d=A.getMap('d'+s),t=A.getMap('t'+s);
      const fEnt=A.mapEntry(f),dEnt=A.mapEntry(d),fDun=f.ent?[f.ent[0],f.ent[1]+1]:null,bossDoor=d.bossAt;
      const st=bfs(f,fEnt,fDun)+bfs(d,dEnt,bossDoor)*1.6;steps.push(Math.round(st));// the dungeon route doubles back for the key and lever
      // v0.9.5: the visible roamers this journey really spawns on the field and in the dungeon (ROAMSHARE of them fought: a first run
      // chases most of what it sees; half of them caught unaware for a surprise round), each a real roamer fight; then the random battles
      const RL=[f,d].flatMap(m=>{let L=[];try{m.roam=null;L=(A.roamSpawn&&A.roamSpawn(m))||[];}catch(e){}return L.map(r=>({m,r}));}),nR=Math.round(RL.length*ROAMSHARE);
      // early17.js: the first field's random fights are spread along the route (the field's share of it, from the entrance to the dungeon door),
      // each in the band of the field it falls in (spec.e17); the dungeon's share and the fights ground out before a boss are as before
      const e17K=(s===0&&A.E17&&!A.E17.off)?bfs(f,fEnt,fDun):0,e17F=e17K&&fDun?(A.E17.api.frac(f,fDun[0],fDun[1])||1):1;
      const nf=Math.round(st*EXPL/perFight);walk+=st*EXPL+nR*TM.roamWalk;rfN+=nR;rnN+=nf;
      for(let i=0;i<nR+nf;i++){const isR=i<nR,q=isR?RL[Math.floor(i*RL.length/Math.max(1,nR))]:null;window.__MANUAL=isR&&q.r.elite?1:MAN(i);
        const spec=isR?{stage:s,kind:q.m.kind==='dungeon'?'dungeon':'field',weather:'clear',roam:{mid:q.m.id,i:q.r.i,mon:q.r.mon,elite:q.r.elite,mod:q.r.mod,name:q.r.name},surprise:i%2?1:0}:{stage:s,kind:'field',weather:'clear'};
        if(!isR&&e17K>0){const pos=(i-nR+.5)/Math.max(1,nf)*st;if(pos<e17K){const fr=pos/e17K*e17F;spec.e17=fr<A.E17.cut[0]?0:fr<A.E17.cut[1]?1:2;}}
        const o=run(spec);window.__MANUAL=0;fights++;const man=isR&&q.r.elite||!!(o&&o.lk);lockN+=o&&o.lk?1:0;sec+=man?fT(o,0,0):fTt(o,0);secM+=fT(o,0,0);secA+=man?fT(o,0,0):fT(o,0,1);if(!o||o.res!=='win'){lost++;A.innHeal();}
        if(i%4===3)A.innHeal();}// a rest or a potion stop now and then

      // the boss: rest, fight; after a loss, grind 3 more fights and try again (up to 6 tries)
      A.innHeal();const k=G.run;if(s<4)k.bosses[s]=k.bosses[s]||A.GPOOL[s%A.GPOOL.length];else k.final=k.final||A.FPOOL[0];
      let tries=0,won=false,grind=0;while(!won&&tries<40){tries++;A.innHeal();window.__MANUAL=1;const o=run({stage:s,kind:'boss'});window.__MANUAL=0;won=o&&o.res==='win';{const x=fT(o,1,0);sec+=x;secM+=x;secA+=x;}if(!won)losses++;if(window.__DBG&&r===0)out.push('stage '+s+' try '+tries+' lv '+G.party.map(id=>G.roster[id].lv).join('/')+' -> '+(o?o.res+' t='+o.t+' foes '+(o.en||[]).length:'null'));
        if(!won)for(let g=0;g<5;g++){window.__MANUAL=MAN(g);const o2=run({stage:s,kind:'field',weather:'clear'});window.__MANUAL=0;const lk2=!!(o2&&o2.lk);lockN+=lk2?1:0;sec+=lk2?fT(o2,0,0):fTt(o2,0);secM+=fT(o2,0,0);secA+=fT(o2,0,lk2?0:1);fights++;grind++;A.innHeal();}}
      bossTries.push(tries);grinds.push(grind);G.cleared[s]=true;A.innHeal();
      // v0.9.5: side sites (the field's cave and side fortress), SITESHARE of them visited once the realm's boss has fallen (first runs
      // mostly come back for them): siteSteps walked (the random battles on them at
      // the dungeon rate, 0.6), siteTime spent on chests and the prize, and the miniboss (by hand) where the site has one
      for(const c of (f.caves||[])){if(((r*7+s*3+(f.caves.indexOf(c)))%10)>=Math.round(10*SITESHARE))continue;sitesN++;walk+=TM.siteSteps;sec+=TM.siteTime;secM+=TM.siteTime;secA+=TM.siteTime;
        siteAcc+=TM.siteSteps*.6/perFight;while(siteAcc>=1){siteAcc--;window.__MANUAL=MAN(fights);const o=run({stage:s,kind:'dungeon',weather:'clear'});window.__MANUAL=0;fights++;rnN++;const lk3=!!(o&&o.lk);lockN+=lk3?1:0;sec+=lk3?fT(o,0,0):fTt(o,0);secM+=fT(o,0,0);secA+=fT(o,0,lk3?0:1);if(!o||o.res!=='win'){lost++;A.innHeal();}}
        if(A.miniFor&&A.siteHasMini&&A.siteHasMini(c.id)){const mb=A.miniFor({id:c.id});window.__MANUAL=1;const o=run({stage:s,kind:'mini',weather:'clear',mini:{id:c.id,mon:mb.mon,name:mb.name,mod:mb.mod}});window.__MANUAL=0;fights++;miniN++;if(o&&o.res==='win')miniW++;const x=fT(o,0,0);sec+=x;secM+=x;secA+=x;}
        A.innHeal();}}
    const lv=G.party.map(id=>G.roster[id].lv);
    // walking (route steps at the walk speed, plus the field and dungeon detours a first run makes), towns and story, and a walk back to the inn after each lost boss
    const over=walk*TM.wander/TM.walk+5*(TM.town+TM.story+TM.side)+losses*TM.retry+TM.start;const H=x=>(x+over)/3600;
    sums.h.push(H(sec));sums.hm.push(H(secM));sums.ha.push(H(secA));sums.lv.push(Math.max(...lv));sums.f.push(fights);sums.tries.push(bossTries.reduce((a,b)=>a+b,0));sums.rf.push(rfN);sums.rn.push(rnN);sums.si.push(sitesN);sums.mi.push(miniN);sums.mw.push(miniW);sums.lk.push(lockN);
    out.push('run '+(r+1)+' ['+ids.map(id=>id+':'+A.TPL[id].cls).join(' ')+']: top hero lv '+Math.max(...lv)+', party average '+(lv.reduce((a,b)=>a+b,0)/lv.length).toFixed(1)+' ('+lv.join('/')+') | fights '+fights+' (roamers '+rfN+', random '+rnN+', minibosses '+miniW+'/'+miniN+' at '+sitesN+' sites, lost '+lost+', '+lockN+' by hand while auto was not open) | boss tries '+bossTries.join(',')+' ('+bossTries.map((t,i)=>i<4?G.run.bosses[i]:G.run.final).join(' ')+')'+' | extra fights before each boss fell '+grinds.join(',')+' | route steps '+steps.join(',')+' | hours: typical '+H(sec).toFixed(2)+', all manual '+H(secM).toFixed(2)+', auto fields '+H(secA).toFixed(2));}
  const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)*(x-m))));};
  out.push('SUMMARY runs '+RUNS+': top level mean '+mean(sums.lv).toFixed(1)+' sd '+sd(sums.lv).toFixed(1)+' range '+Math.min(...sums.lv)+'-'+Math.max(...sums.lv)+' | fights mean '+mean(sums.f).toFixed(0)+' ('+Math.min(...sums.f)+'-'+Math.max(...sums.f)+') (roamers '+mean(sums.rf).toFixed(0)+', random '+mean(sums.rn).toFixed(0)+', minibosses '+mean(sums.mi).toFixed(1)+' won '+mean(sums.mw).toFixed(1)+', sites '+mean(sums.si).toFixed(1)+') | by hand while auto was not open mean '+mean(sums.lk).toFixed(0)+' | boss tries mean '+mean(sums.tries).toFixed(1)+' (max '+Math.max(...sums.tries)+') | hours typical '+mean(sums.h).toFixed(2)+' ('+Math.min(...sums.h).toFixed(2)+'-'+Math.max(...sums.h).toFixed(2)+'), all manual '+mean(sums.hm).toFixed(2)+', auto fields '+mean(sums.ha).toFixed(2));
  return out.join('\\n');`,
// out [N]: outlier detail. BOSSES=key,key  BG_STAGES=..  GIM_AUTO=0,1 : same seeding as gim; wins, turns, and how losses happen
out:N=>`N=${N||20};const out=[];const SZ=[3,4,5,6,6];const WANT=${JSON.stringify(process.env.BOSSES||'')}.split(',').filter(Boolean);const DL=${+process.env.DLV||0};
  const ST=${JSON.stringify(process.env.BG_STAGES||'0,1,2,3,4')}.split(',').map(Number),AU=${JSON.stringify(process.env.GIM_AUTO||'0,1')}.split(',').map(Number);
  const hpSum=()=>A.G.party.reduce((a,id)=>a+Math.max(0,A.G.roster[id].hp),0),kos=()=>A.G.party.filter(id=>A.G.roster[id].hp<=0).length;
  function run2(spec){Q.length=0;try{A.syncPools();}catch(e){}try{A.G.bossWon=new Proxy({},{get:()=>1});}catch(e){}A.setSmart(!window.__AUTO);A.V.auto=true;try{A.META.cfg.autoOn=true;}catch(e){}A.META.best={};window.__TYPEFREE=0;if(!A.startBattle(spec))return null;const lk=!!(A.B&&A.B.autoLock);if(lk){window.__TYPEFREE=1;A.B.auto=true;}
    let it=0,last=hpSum(),lost=0,healed=0,firstKO=-1,maxKO=0,bossHp=1,adds=0,lastPt=0;const boss=A.B.en.find(e=>e.boss);
    while(it++<400000){const m=A.V.modal;if(m&&(m.type==='result'||m.type==='lose'))break;
      if(!Q.length){if(A.B&&A.B.mode==='cmd')(window.__AUTO?A.autoTurn:A.autoTurnSmart)();else if(A.B&&!A.B.over)A.advance();if(!Q.length)break;}
      if(lk&&A.B)A.B.tA=0;Q.shift()();if(A.B){const h=hpSum();if(h<last)lost+=last-h;else healed+=h-last;last=h;const k=kos();if(k>maxKO)maxKO=k;if(k>0&&firstKO<0)firstKO=A.B.pturns||0;lastPt=A.B.pturns||0;
        if(boss)bossHp=Math.max(0,boss.hp)/boss.S.mhp;adds=Math.max(adds,A.B.en.filter(e=>e.hp>0).length-1);}}
    const m=A.V.modal,res=m&&m.type==='result'?'win':m&&m.type==='lose'?'lose':'stuck';
    const o={res,pt:lastPt,bt:boss?boss.turns||0:0,lost,healed,firstKO,maxKO,bossHp,adds,gt:A.B.b4gTells||0,gl:A.B.b4gLand||0,gs:A.B.b4gStop||0,gh:A.B.b4gHits||0,bmhp:boss?boss.S.mhp:0};
    A.V.modal=null;if(A.B)A.finishBattle("x");window.__TYPEFREE=0;return o;}
  const av=(a,f)=>a.length?a.reduce((x,y)=>x+f(y),0)/a.length:0;
  for(const auto of AU.map(Boolean)){window.__AUTO=auto;for(const s of ST){const keys=s<4?A.GPOOL:A.FPOOL;
    for(const k of keys){if(WANT.length&&!WANT.includes(k))continue;const W=[],Ls=[];let n=0;
      for(let i=0;i<N;i++){seed=3100+s*997+i*31+keys.indexOf(k)*7;party(pick(SZ[s]),A.STAGE_BOSS_LV[s]+DL,s);A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);
        if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;A.innHeal();const ph=A.G.party.reduce((a,id)=>a+A.G.roster[id].S.mhp,0);let r=null;try{r=run2({stage:s,kind:'boss'});}catch(e){continue;}if(!r)continue;n++;r.ph=ph;(r.res==='win'?W:Ls).push(r);}
      const f=(a)=>'turns '+av(a,x=>x.pt).toFixed(0)+' bossTurns '+av(a,x=>x.bt).toFixed(0)+' | dmg taken '+Math.round(100*av(a,x=>x.lost/x.ph))+'% of party HP (gimmick '+Math.round(100*av(a,x=>x.gh/x.ph))+'%), healed '+Math.round(100*av(a,x=>x.healed/x.ph))+'% | first KO at turn '+av(a.filter(x=>x.firstKO>=0),x=>x.firstKO).toFixed(0)+' | tells '+av(a,x=>x.gt).toFixed(1)+' lands '+av(a,x=>x.gl).toFixed(1)+' stops '+av(a,x=>x.gs).toFixed(1)+' | adds max '+av(a,x=>x.adds).toFixed(1);
      const q=Ls.map(x=>x.bossHp).sort((a,b)=>a-b);
      out.push((auto?'auto    ':'careful ')+'stage '+(s+1)+' '+k+': win '+W.length+'/'+n+' = '+Math.round(100*W.length/Math.max(1,n))+'%\\n    WINS  : '+f(W)+'\\n    LOSSES: '+f(Ls)+' | boss HP left at the wipe: median '+Math.round(100*(q[q.length>>1]||0))+'%, under 15% in '+q.filter(x=>x<.15).length+', over 50% in '+q.filter(x=>x>.5).length+' of '+q.length);}}}
  window.__AUTO=false;return out.join('\\n');`,
// cls [N]: class value. For each class C (CLS=warrior,mage) and stage: a random party with no hero of C, against the same party with one seat given to a hero of C.
cls:N=>`N=${N||3};const out=[];const SZ=[3,4,5,6,6];const ST=${JSON.stringify(process.env.BG_STAGES||'1,2,3,4')}.split(',').map(Number);
  const CL=${JSON.stringify(process.env.CLS||'warrior,knight,archer,thief,monk,mage,healer,bard')}.split(',');const MAIN=['warrior','knight','archer','thief','monk','mage','healer','bard'];
  const P8=pool.filter(id=>MAIN.includes(A.TPL[id].cls));let ms=1;const mr=()=>{ms=(ms*1664525+1013904223)>>>0;return ms/4294967296;};Math.random=mr;
  if(${process.env.NOTAUNT?1:0})A.HOOK.wrap('addSt','x','x',function(next,t,k){if(k==='taunt')return false;return next.apply(null,[].slice.call(arguments,1));});
  {const NS=${JSON.stringify(process.env.NOSK||'')}.split(',').filter(Boolean);if(NS.length)A.wrapKnown((L,c)=>L.filter(x=>!NS.includes(x.id)));}
  const res={};
  for(const C of CL){const inC=P8.filter(id=>A.TPL[id].cls===C),notC=P8.filter(id=>A.TPL[id].cls!==C);
    for(const s of ST){const keys=s<4?A.GPOOL:A.FPOOL,n=SZ[s],reps=s<4?N:N*5;const R0={w:[0,0],n:0,t:[0,0],tw:[0,0]};
      keys.forEach((k,ki)=>{for(let i=0;i<reps;i++){seed=9100+s*997+i*31+ki*7+CL.indexOf(C)*0;const base=[];while(base.length<n){const id=notC[Math.floor(R()*notC.length)];if(!base.includes(id))base.push(id);}
        const j=(i+ki)%n,sub=inC[Math.floor(R()*inC.length)];const variants=[base,base.map((x,q)=>q===j?sub:x)];const ss=seed;
        variants.forEach((ids,v)=>{seed=ss;ms=(777+s*13+i*101+ki*17)>>>0;party(ids,A.STAGE_BOSS_LV[s],s);A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;A.innHeal();
          let r=null;try{r=run({stage:s,kind:'boss'});}catch(e){return;}if(!r)return;if(v===0)R0.n++;if(r.res==='win'){R0.w[v]++;R0.tw[v]+=r.pt;}R0.t[v]+=r.pt;});}});
      res[C+':'+s]=R0;out.push(C.padEnd(8)+' stage '+(s+1)+' party '+n+': without '+Math.round(100*R0.w[0]/R0.n)+'% -> with one '+Math.round(100*R0.w[1]/R0.n)+'% ('+(R0.w[1]>=R0.w[0]?'+':'')+Math.round(100*(R0.w[1]-R0.w[0])/R0.n)+') n='+R0.n+' | turns in wins '+(R0.tw[0]/Math.max(1,R0.w[0])).toFixed(0)+' -> '+(R0.tw[1]/Math.max(1,R0.w[1])).toFixed(0));}
    const T=ST.map(s=>res[C+':'+s]),n=T.reduce((a,x)=>a+x.n,0),w0=T.reduce((a,x)=>a+x.w[0],0),w1=T.reduce((a,x)=>a+x.w[1],0);
    out.push('CLASS '+C.padEnd(8)+' all stages: without '+(100*w0/n).toFixed(1)+'% -> with one '+(100*w1/n).toFixed(1)+'% (value '+(w1>=w0?'+':'')+(100*(w1-w0)/n).toFixed(1)+' points) n='+n);}
  return out.join('\\n');`,
// diag [N]: per class in random parties: damage dealt, damage taken, KOs, turns. BG_STAGES
diag:N=>`N=${N||3};const out=[];const SZ=[3,4,5,6,6];const ST=${JSON.stringify(process.env.BG_STAGES||'1,2,3')}.split(',').map(Number);
  const MAIN=['warrior','knight','archer','thief','monk','mage','healer','bard'];const P8=pool.filter(id=>MAIN.includes(A.TPL[id].cls));let ms=1;Math.random=()=>{ms=(ms*1664525+1013904223)>>>0;return ms/4294967296;};
  const T={};MAIN.forEach(c=>T[c]={n:0,dd:0,dt:0,ko:0,koEnd:0,turns:0,front:0,heal:0,mhp:0,def:0,res:0,spd:0,acts:{}});let cur=null;
  A.HOOK.before('perform','diag','acts',function(a,sk){try{if(cur&&a&&a.side==='p'&&cur[a.id]){cur[a.id].turns++;if(A.B.front.includes(a))cur[a.id].front++;const k=(A.TPL[a.id].cls===${JSON.stringify(process.env.DCLS||'')}?(sk&&sk.id||'?'):(sk&&sk.k||'?'));T[A.TPL[a.id].cls].acts[k]=(T[A.TPL[a.id].cls].acts[k]||0)+1;}}catch(e){}});
  A.HOOK.after('calcDamage','diag','dmg',function(r,a,sk,t){try{if(cur&&r&&a&&a.side==='p'&&t&&t.side==='e'&&cur[a.id]&&A.B&&A.B.cur===a)cur[a.id].dd+=r.dmg*(1);}catch(e){}});
  for(const s of ST){const keys=s<4?A.GPOOL:A.FPOOL,n=SZ[s];keys.forEach((k,ki)=>{for(let i=0;i<N;i++){seed=5100+s*997+i*31+ki*7;const ids=[];while(ids.length<n){const id=P8[Math.floor(R()*P8.length)];if(!ids.includes(id))ids.push(id);}
    ms=(99+s*13+i*101+ki*17)>>>0;party(ids,A.STAGE_BOSS_LV[s],s);A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;A.innHeal();
    cur={};ids.forEach(id=>{const c=A.G.roster[id];cur[id]={dd:0,dt:0,ko:0,turns:0,front:0,last:c.hp,heal:0};});
    Q.length=0;try{A.syncPools();}catch(e){}try{A.G.bossWon=new Proxy({},{get:()=>1});}catch(e){}A.setSmart(true);A.V.auto=true;try{A.META.cfg.autoOn=true;}catch(e){}A.META.best={};if(!A.startBattle({stage:s,kind:'boss'}))continue;if(A.B.autoLock){window.__TYPEFREE=1;A.B.auto=true;}
    let it=0;while(it++<400000){const m=A.V.modal;if(m&&(m.type==='result'||m.type==='lose'))break;
      if(!Q.length){if(A.B&&A.B.mode==='cmd'){const a=A.B.cur;A.autoTurnSmart();}else if(A.B&&!A.B.over)A.advance();if(!Q.length)break;}
      A.B.tA=0;Q.shift()();ids.forEach(id=>{const c=A.G.roster[id],o=cur[id];const h=Math.max(0,c.hp);if(h<o.last){o.dt+=o.last-h;if(h<=0)o.ko++;}else if(h>o.last)o.heal+=h-o.last;o.last=h;});}
    ids.forEach(id=>{const c=A.G.roster[id],o=cur[id],t=T[A.TPL[id].cls];t.n++;t.dd+=o.dd;t.dt+=o.dt/c.S.mhp;t.ko+=o.ko;t.koEnd+=c.hp<=0?1:0;t.turns+=o.turns;t.front+=o.front;t.heal+=o.heal/c.S.mhp;t.mhp+=c.S.mhp;t.def+=c.S.def;t.res+=c.S.res;t.spd+=c.S.spd;});
    cur=null;A.V.modal=null;if(A.B)A.finishBattle("x");window.__TYPEFREE=0;}});}
  const all=MAIN.reduce((a,c)=>({dd:a.dd+T[c].dd,turns:a.turns+T[c].turns}),{dd:0,turns:0}),avg=all.dd/all.turns;
  MAIN.forEach(c=>{const t=T[c];out.push(c.padEnd(8)+' n='+t.n+' | dmg per turn '+(t.dd/t.turns).toFixed(0)+' ('+Math.round(100*t.dd/t.turns/avg)+'% of avg) | turns per fight '+(t.turns/t.n).toFixed(1)+' ('+Math.round(100*t.front/Math.max(1,t.turns))+'% in the Vanguard) | dmg taken '+Math.round(100*t.dt/t.n)+'% of own HP, healed '+Math.round(100*t.heal/t.n)+'% | KOs per fight '+(t.ko/t.n).toFixed(2)+' | max HP '+Math.round(t.mhp/t.n)+' def '+Math.round(t.def/t.n)+' res '+Math.round(t.res/t.n)+' spd '+Math.round(t.spd/t.n)+' | acts '+Object.entries(t.acts).map(([k,v])=>k+' '+Math.round(100*v/t.turns)+'%').join(' '));});
  return out.join('\\n');`
};
(async()=>{const which=process.argv[2]||'boss',arg=+process.argv[3]||0;if(!SIMS[which]){console.log('sims: '+Object.keys(SIMS).join(', '));process.exit(1);}
  const browser=await chromium.launch();const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  const P=path.join(require('os').tmpdir(),'fullsim_'+process.pid+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"></head><body><script>localStorage.clear();</script>'+MOCK+'<div id="app"><header id="hdr"></header><main id="screen"></main><div id="modal"></div></div></body></html>');
  await page.goto('file://'+P);
  const t0=Date.now();
  const r=await page.evaluate(([SRC,HARNESS,LOOP,BODY,SEED,DRAW])=>{window.__PWTEST=1;/* v0.11.4: no timed-hit rings in sims */if(SEED){let s=SEED>>>0;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};Date.now=()=>1700000000000+DRAW*86400003;/* DRAW=n: another journey draw (realms and bosses), the frozen clock steps by a day; 0 is the old fixed draw */}window.__Q=[];const st=f=>{window.__Q.push(f);return 1;};
    const A=(new Function('setTimeout',SRC+HARNESS))(st);window.__A2=A;A.setPause(0);
    return (new Function('A',LOOP+BODY))(A);},[SRC,HARNESS,LOOP,SIMS[which](arg),+process.env.SEED||0,+process.env.DRAW||0]);
  console.log(`${which} on the full game (${MODS.length} modules), ${((Date.now()-t0)/1000).toFixed(0)} s`);console.log(r);
  if(errs.length)console.log('page errors:',errs.slice(0,3).join(' | '));
  await browser.close();try{fs.unlinkSync(P);}catch(e){}})();
