// Beta v0.5.1: balance sims on the real game. Loads EVERY v3 module in build order (the list in v3build.py) in headless Chrome,
// so every v0.5.0 system (XP catch up, surprise starts, first realm single types, Guild perks, shop and party changes) is live,
// and drives battles with the same queue loop as tools/v3sim.js (the game's own careful brain or its auto).
// Usage: node tools/fullsim.js <sim> [args]   sims: boss, stage1, xp, journey   (run from the repo root, no tools/v3 link needed)
//   SEED=<n> replaces Math.random with a seeded LCG and freezes Date.now (new journeys draw their realms from it), so two builds
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
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=process.env.SIMROOT||path.join(__dirname,'..'),V3=path.join(ROOT,'v3');// SIMROOT=<another checkout> runs the same sims on that build (for before/after)
const BP=fs.readFileSync(path.join(ROOT,'v3build.py'),'utf8'),MODS=JSON.parse((BP.match(/MODS=(\[[^\]]+\])/)||BP.match(/for n in (\[[^\]]+\])/))[1].replace(/'/g,'"'));
const MOCK=(()=>{const s=fs.readFileSync(path.join(__dirname,'chrome','beta.js'),'utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
const SRC=MODS.map(f=>fs.readFileSync(path.join(V3,f),'utf8')).join('\n');
// the same exports and loop as tools/v3sim.js, built inside the page
const HARNESS=`
function render(){}
// v0.9.5 auto per foe type (prog2.js): a fight whose foe types are not open yet is played by hand. The sims drive every fight with the
// careful brain through B.auto, so the lock is lifted while such a fight runs (window.__TYPEFREE) and the fight is paid and timed as manual.
if(typeof autoTypeReason==='function'){const atr0=autoTypeReason;autoTypeReason=function(){return window.__TYPEFREE?null:atr0.apply(this,arguments);};}
return {get G(){return G},set G(v){G=v},get B(){return B},V,get META(){return META},newGame,newChar,startBattle,advance,autoTurn,
  autoTurnSmart:typeof autoTurnSmart==='function'?autoTurnSmart:autoTurn,setPause:p=>{PAUSE=p},setSmart:v=>{if(typeof SIM_SMART!=='undefined')SIM_SMART=v},
  finishBattle,calcStats,TPL,RAW,GPOOL,FPOOL,STAGE_BOSS_LV,STAGE_LV,GEAR,recruit,refresh,encounterFoes,getMap,resetMaps,mapEntry,findPath:typeof findPath==='function'?findPath:null,
  ENC_RATE,ENC_MIN_STEPS,SOLID,syncPools:typeof syncPools==='function'?syncPools:()=>{},roamSpawn:typeof roamSpawn==='function'?roamSpawn:null,ZS,newRun:typeof newRun==='function'?newRun:null,avgLv,gearTier,ROAM:typeof ROAM!=='undefined'?ROAM:null,SURPRISE:typeof SURPRISE!=='undefined'?SURPRISE:null,
  DUAL_FROM:typeof DUAL_FROM!=='undefined'?DUAL_FROM:null,B4:typeof B4!=='undefined'?B4:null,XPCU:typeof XPCU!=='undefined'?XPCU:null,need,
  cfgSet:(k,v)=>{const p=k.split('.');let o=eval(p[0]);for(let i=1;i<p.length-1;i++)o=o[p[i]];o[p[p.length-1]]=v;},
  innHeal:()=>Object.values(G.roster).forEach(c=>{c.ail={};c.st={};c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;})};`;
const LOOP=`
const Q=window.__Q;
${JSON.stringify(process.env.CFGSET||'')}.split(';').forEach(kv=>{if(!kv)return;const i=kv.indexOf('=');A.cfgSet(kv.slice(0,i),JSON.parse(kv.slice(i+1)));});// CFGSET='BOSS_LV.frac=.3;ECON.xp=1' tries other config values (objects only)
function run(spec){Q.length=0;try{A.syncPools();}catch(e){}
  // the sims stand in for a player who plays every fight: the 'win it manually once first' auto lock on bosses does not apply
  try{A.G.bossWon=new Proxy({},{get:()=>1});}catch(e){}A.setSmart(!window.__AUTO);A.V.auto=true;try{A.META.cfg.autoOn=true;}catch(e){}A.META.best={};window.__TYPEFREE=0;if(!A.startBattle(spec))return null;const lk=!!(A.B&&A.B.autoLock);if(lk){window.__TYPEFREE=1;A.B.auto=true;}
  let it=0;while(it++<400000){const m=A.V.modal;if(m&&(m.type==='result'||m.type==='lose'))break;
    if(!Q.length){if(A.B&&A.B.mode==='cmd')(window.__AUTO?A.autoTurn:A.autoTurnSmart)();else if(A.B&&!A.B.over)A.advance();if(!Q.length)break;}
    if((window.__MANUAL||lk)&&A.B)A.B.tA=0;Q.shift()();}
  const m=A.V.modal,res=m&&m.type==='result'?'win':m&&m.type==='lose'?'lose':'stuck',info=m&&m.info;const t=A.B?A.B.time:0,en=A.B?A.B.en.map(e=>({el:e.el.slice(),boss:!!e.boss,elite:!!e.elite,role:e.role||null})):[],sur=A.B?!!A.B.surprise:false;
  const pt=A.B?A.B.pturns||0:0,an=A.B?A.B.actN||0:0,b4=A.B?{det:A.B.nDet||0,mp:A.B.b4detMp||0,sw:(A.B.b4swN||0),aSw:A.B.autoSwaps||0,roles:A.B.b4roles||{},mo:A.B.b4mo?A.B.b4mo.hist.length:0}:{};
  A.V.modal=null;if(A.B)A.finishBattle("x");window.__TYPEFREE=0;return {res,t,info,en,sur,pt,an,b4,lk};}
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
const TIME={fightIn:4,fightOut:7,anim:1.35,animAuto:.9,decide:2.6,autoDecide:0,bossIntro:25,autoShare:.6,walk:4.2,wander:1.4,town:600,story:300,side:480,retry:60,start:300};
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
journey:RUNS=>`RUNS=${RUNS||3};window.__DBG=${process.env.DBG?1:0};const out=[];const TM=${JSON.stringify(TIME)},EXPL=${+process.env.EXPLORE||1.5};const sums={h:[],hm:[],ha:[],lv:[],f:[],tries:[],lk:[]};
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
    let lockN=0,fights=0,lost=0,bossTries=[],steps=[],grinds=[],sec=0,secM=0,secA=0,walk=0,losses=0;
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
      const roam=3+s,nf=Math.round(st*EXPL/perFight)+roam;walk+=st*EXPL;
      for(let i=0;i<nf;i++){window.__MANUAL=MAN(i);const o=run({stage:s,kind:i<roam?'dungeon':'field',weather:'clear'});window.__MANUAL=0;fights++;sec+=o&&o.lk?fT(o,0,0):fTt(o,0);secM+=fT(o,0,0);secA+=fT(o,0,o&&o.lk?0:1);lockN+=o&&o.lk?1:0;if(!o||o.res!=='win'){lost++;A.innHeal();}
        if(i%4===3)A.innHeal();}// a rest or a potion stop now and then
      // the boss: rest, fight; after a loss, grind 3 more fights and try again (up to 6 tries)
      A.innHeal();const k=G.run;if(s<4)k.bosses[s]=k.bosses[s]||A.GPOOL[s%A.GPOOL.length];else k.final=k.final||A.FPOOL[0];
      let tries=0,won=false,grind=0;while(!won&&tries<40){tries++;A.innHeal();window.__MANUAL=1;const o=run({stage:s,kind:'boss'});window.__MANUAL=0;won=o&&o.res==='win';{const x=fT(o,1,0);sec+=x;secM+=x;secA+=x;}if(!won)losses++;if(window.__DBG&&r===0)out.push('stage '+s+' try '+tries+' lv '+G.party.map(id=>G.roster[id].lv).join('/')+' -> '+(o?o.res+' t='+o.t+' foes '+(o.en||[]).length:'null'));
        if(!won)for(let g=0;g<5;g++){window.__MANUAL=MAN(g);const o2=run({stage:s,kind:'field',weather:'clear'});window.__MANUAL=0;sec+=o2&&o2.lk?fT(o2,0,0):fTt(o2,0);secM+=fT(o2,0,0);secA+=fT(o2,0,o2&&o2.lk?0:1);lockN+=o2&&o2.lk?1:0;fights++;grind++;A.innHeal();}}
      bossTries.push(tries);grinds.push(grind);G.cleared[s]=true;A.innHeal();}
    const lv=G.party.map(id=>G.roster[id].lv);
    // walking (route steps at the walk speed, plus the field and dungeon detours a first run makes), towns and story, and a walk back to the inn after each lost boss
    const over=walk*TM.wander/TM.walk+5*(TM.town+TM.story+TM.side)+losses*TM.retry+TM.start;const H=x=>(x+over)/3600;
    sums.h.push(H(sec));sums.hm.push(H(secM));sums.ha.push(H(secA));sums.lv.push(Math.max(...lv));sums.f.push(fights);sums.tries.push(bossTries.reduce((a,b)=>a+b,0));sums.lk.push(lockN);
    out.push('run '+(r+1)+' ['+ids.map(id=>id+':'+A.TPL[id].cls).join(' ')+']: top hero lv '+Math.max(...lv)+', party average '+(lv.reduce((a,b)=>a+b,0)/lv.length).toFixed(1)+' ('+lv.join('/')+') | fights '+fights+' (lost '+lost+', '+lockN+' by hand while auto was not open) | boss tries '+bossTries.join(',')+' | extra fights before each boss fell '+grinds.join(',')+' | route steps '+steps.join(',')+' | hours: typical '+H(sec).toFixed(2)+', all manual '+H(secM).toFixed(2)+', auto fields '+H(secA).toFixed(2));}
  const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)*(x-m))));};
  out.push('SUMMARY runs '+RUNS+': top level mean '+mean(sums.lv).toFixed(1)+' sd '+sd(sums.lv).toFixed(1)+' range '+Math.min(...sums.lv)+'-'+Math.max(...sums.lv)+' | fights mean '+mean(sums.f).toFixed(0)+' ('+Math.min(...sums.f)+'-'+Math.max(...sums.f)+') | by hand while auto was not open mean '+mean(sums.lk).toFixed(0)+' | boss tries mean '+mean(sums.tries).toFixed(1)+' (max '+Math.max(...sums.tries)+') | hours typical '+mean(sums.h).toFixed(2)+' ('+Math.min(...sums.h).toFixed(2)+'-'+Math.max(...sums.h).toFixed(2)+'), all manual '+mean(sums.hm).toFixed(2)+', auto fields '+mean(sums.ha).toFixed(2));
  return out.join('\\n');`
};
(async()=>{const which=process.argv[2]||'boss',arg=+process.argv[3]||0;if(!SIMS[which]){console.log('sims: '+Object.keys(SIMS).join(', '));process.exit(1);}
  const browser=await chromium.launch();const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  const P=path.join(require('os').tmpdir(),'fullsim_'+process.pid+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"></head><body><script>localStorage.clear();</script>'+MOCK+'<div id="app"><header id="hdr"></header><main id="screen"></main><div id="modal"></div></div></body></html>');
  await page.goto('file://'+P);
  const t0=Date.now();
  const r=await page.evaluate(([SRC,HARNESS,LOOP,BODY,SEED])=>{if(SEED){let s=SEED>>>0;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};Date.now=()=>1700000000000;}window.__Q=[];const st=f=>{window.__Q.push(f);return 1;};
    const A=(new Function('setTimeout',SRC+HARNESS))(st);window.__A2=A;A.setPause(0);
    return (new Function('A',LOOP+BODY))(A);},[SRC,HARNESS,LOOP,SIMS[which](arg),+process.env.SEED||0]);
  console.log(`${which} on the full game (${MODS.length} modules), ${((Date.now()-t0)/1000).toFixed(0)} s`);console.log(r);
  if(errs.length)console.log('page errors:',errs.slice(0,3).join(' | '));
  await browser.close();try{fs.unlinkSync(P);}catch(e){}})();
