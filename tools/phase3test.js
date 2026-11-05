// v0.4.1 Phase 3 unit tests: 3.2 boss level and pips and break window, 3.5 economy, 3.7 creep, Daily Trial untouched
const {A,party}=require('./v3sim.js');let f=0;const ck=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)f++;};
party(['mira','lumen','oren'],3,0);const G=A.G;
const setHi=hi=>{G.party.forEach((id,i)=>{G.roster[id].lv=i?3:hi;});};
// 3.2 boss level
const base=s=>A.STAGE_BOSS_LV[s];
setHi(3);ck('boss level stays at base for a weak party',A.bossLvFor(0)===base(0));
setHi(20);ck('boss level base+0.5*(highest-base): 8 and highest 20 -> 14',A.bossLvFor(0)===14);
setHi(60);ck('boss level capped at base+12',A.bossLvFor(0)===base(0)+12);
setHi(45);ck('Calamity: base 40, highest 45 -> 43 (not the old +80% of average)',A.bossLvFor(4)===43);
// pips and shield
setHi(10);G.stage=0;const k0=A.GPOOL[0];G.run.bosses[0]=k0;
const e=A.encounterFoes({stage:0,kind:'boss'})[0];ck('Scourge shield pips are 8 (was 5)',e.maxShield===8);
G.run.final=A.FPOOL[0];const fe=A.encounterFoes({stage:4,kind:'boss'})[0];ck('Calamity shield pips are 11 (was 7)',fe.maxShield===11);
// creep
G.cleared=[false,false,false,false,false];const f0=A.makeEnemy(A.MON[Object.keys(A.MON)[0]],10);
G.cleared=[true,true,false,false,false];const f2=A.makeEnemy(A.MON[Object.keys(A.MON)[0]],10);
ck('world creep: two bosses down -> +5% field foe hp (half creep in the field since v0.4.3)',Math.abs(f2.S.mhp/f0.S.mhp-1.05)<.02);
ck('world creep: two bosses down -> foes hit harder',f2.S.atk>f0.S.atk*1.04);
G.daily=1;const fd=A.makeEnemy(A.MON[Object.keys(A.MON)[0]],10);G.daily=0;G.cleared=[false,false,false,false,false];const f00=A.makeEnemy(A.MON[Object.keys(A.MON)[0]],10);
G.cleared=[true,true,true,false,false];G.daily=1;const fd3=A.makeEnemy(A.MON[Object.keys(A.MON)[0]],10);G.daily=1;G.cleared=[false,false,false,false,false];const fd0=A.makeEnemy(A.MON[Object.keys(A.MON)[0]],10);G.daily=0;
ck('Daily Trial foes identical whatever has been defeated',fd3.S.mhp===fd0.S.mhp&&fd3.S.atk===fd0.S.atk);
// economy
ck('gear prices follow ECON.gear (a basic sword)',(()=>{const g=A.GEAR[Object.keys(A.GEAR).find(k=>k.startsWith('w_'))];return g.price>g.price0*1.3&&g.price<g.price0*2;})());
console.log('fails='+f);process.exit(f?1:0);
