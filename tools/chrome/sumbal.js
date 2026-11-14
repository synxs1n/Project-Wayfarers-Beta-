// Summon balance (after 0.21.6, the owner: "Add summons to balance testing and offer changes if they are too strong/weak etc").
// The journey sim (v080cb.js, tools/fullsim.js) never summons. This tool plays boss fights and field fights on the real game (every v3 module in
// build order, the game's own battle code and its careful auto, the same queue loop as tools/fullsim.js) at four points of a journey with one party
// per caller, once without any summon and once with an AI that calls its summon the first turn it can:
// (two callers: one that calls the first turn it can, one that waits until the Vanguard is hurt)
//   pets (weak, middle and strong monsters by their base stats, and a Beastbond one), paired with the party's Warrior, who calls them in his place
//   Sanctum guardians: Invoke by a Priest, Invoke by Nikaris, Spirit Call by a Monk
//   Lesser Scourges (recruited bosses, boss sized, in the whole Vanguard's place): called by a Priest, by Nikaris, by a Monk (the Monk rules)
// Per source and point: win rate, the length of a won fight (the battle clock, against the same party without the summon), the share of the
// party's HP lost, and the summon's share of all damage and healing the party's side did. The pairing bonus of a pet is on in both runs, so the
// difference is the Summon command alone.
// Usage (from tools/chrome): node sumbal.js [N fights per cell, default 30]      SEED=<n> (default 7)   POINTS=boss1,field3   SOURCES=gMonk,sMonk   SIMROOT=<other checkout>
//   CFGSET='SUM.monkPray=1;SUM.lesser=.7' tries other numbers (objects in config: SUM, B16.boss, COMP_BONUS; a const number such as COMP_TURNS cannot be set this way)
// It prints one table and a summary per source; docs/sumbal17.md holds a run and the offers made from it. Not in the ci group (about 5 minutes).
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=process.env.SIMROOT||path.join(__dirname,'..','..'),V3=path.join(ROOT,'v3');
const BP=fs.readFileSync(path.join(ROOT,'v3build.py'),'utf8'),MODS=JSON.parse(BP.match(/MODS=(\[[^\]]+\])/)[1].replace(/'/g,'"'));
const MOCK=(()=>{const s=fs.readFileSync(path.join(__dirname,'beta.js'),'utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
const SRC=MODS.map(f=>fs.readFileSync(path.join(V3,f),'utf8')).join('\n');
const HARNESS=`
function render(){}
if(typeof autoBan==='function')autoBan=function(){return null;};
if(typeof autoTypeReason==='function'){autoTypeReason=function(){return null;};}
// who did what: every action's damage to the foes and healing of the party's side, by the actor (a summon, a pet, a hero)
const SB={dS:0,dH:0,hS:0,hH:0,n:0};window.__SB=SB;
HOOK.wrap('perform','sumbal','damage and healing by actor',function(next,...args){const a=args[0];if(!B||!a||a.side!=='p')return next(...args);
  const hp=L=>L.reduce((q,u)=>q+Math.max(0,u.hp||0),0),own=()=>allParty().concat(B.front.filter(u=>u.isSum||u.isComp));
  const e0=hp(B.en),p0=own().map(u=>[u,u.hp]);let r;try{r=next(...args);}finally{const d=Math.max(0,e0-hp(B.en));let h=0;p0.forEach(([u,v])=>{if(u.hp>v)h+=u.hp-v;});
    if(a.isSum||a.isComp){SB.dS+=d;SB.hS+=h;SB.n++;}else{SB.dH+=d;SB.hH+=h;}}return r;});
// the summon AI: the caller uses its summon the first turn it can (B.auto is lifted for the call: the game never lets auto pray)
window.__POL=null;window.__CALLS=0;
function sbTry(){const pol=window.__POL;if(!pol||!B||B.over||B.mode!=='cmd')return false;const a=B.cur;if(!a||a.side!=='p'||a.id!==pol.who)return false;
  if(pol.when==='hurt'){const F=B.front.filter(c=>c&&!c.isSum&&!c.isComp&&c.S),r=F.map(c=>Math.max(0,c.hp)/c.S.mhp);if(!F.length||!(r.reduce((x,y)=>x+y,0)/F.length<.55||r.some(x=>x<.3)))return false;}
  const au=B.auto;B.auto=false;let ok=false;
  try{if(pol.kind==='guard'){if(sumCan(a))ok=!!sumPray(a,pol.mon);}else if(canSummon(a)&&!B.sum&&!B.pray){summonComp();ok=true;}}catch(e){window.__ERR=(window.__ERR||0)+1;window.__ERRM='call '+pol.who+' '+pol.kind+': '+e.message+' '+String(e.stack).split('\\n').slice(1,4).join(' < ');}
  if(B)B.auto=au;if(ok)window.__CALLS++;return ok;}
{const at0=autoTurn;autoTurn=function(){if(sbTry())return;return at0.apply(this,arguments);};}
{const as1=autoTurnSmart;autoTurnSmart=function(){if(sbTry())return;return as1.apply(this,arguments);};}
return {get G(){return G},set G(v){G=v},get B(){return B},V,get META(){return META},newGame,newChar,startBattle,advance,autoTurn,autoTurnSmart,setPause:p=>{PAUSE=p},
  setSmart:v=>{if(typeof SIM_SMART!=='undefined')SIM_SMART=v},finishBattle,calcStats,TPL,MON,GUARDIANS,FINALS,GPOOL,FPOOL,MINIS,STAGE_BOSS_LV,STAGE_LV,GEAR,SUM,COMP_TURNS,
  syncPools:typeof syncPools==='function'?syncPools:()=>{},registerTamed,tameClass,tameTrait,guardianDef,canSummon:a=>canSummon(a),summonComp:()=>summonComp(),sumCan:a=>sumCan(a),sumPray:(a,m)=>sumPray(a,m),
  compOf:c=>compOf(c),cfgSet:(k,v)=>{const p=k.split('.');let o=eval(p[0]);for(let i=1;i<p.length-1;i++)o=o[p[i]];o[p[p.length-1]]=v;},B16:typeof B16!=='undefined'?B16:null,
  innHeal:()=>Object.values(G.roster).forEach(c=>{c.ail={};c.st={};c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;})};`;
const BODY=(N,POINTS)=>`
const Q=window.__Q,SB=window.__SB,N=${N},ONLY=${JSON.stringify(POINTS)},ONLYS=${JSON.stringify((process.env.SOURCES||'').split(',').filter(Boolean))};
${JSON.stringify(process.env.CFGSET||'')}.split(';').forEach(kv=>{if(!kv)return;const i=kv.indexOf('=');A.cfgSet(kv.slice(0,i),JSON.parse(kv.slice(i+1)));});
function run(spec,pol){Q.length=0;try{A.syncPools();}catch(e){}try{A.G.bossWon=new Proxy({},{get:()=>1});}catch(e){}A.setSmart(true);A.V.auto=true;try{A.META.cfg.autoOn=true;}catch(e){}A.META.best={};
  SB.dS=SB.dH=SB.hS=SB.hH=SB.n=0;window.__CALLS=0;window.__POL=pol||null;if(!A.startBattle(spec))return null;if(A.B)A.B.auto=true;
  let it=0;while(it++<400000){const m=A.V.modal;if(m&&(m.type==='result'||m.type==='lose'))break;
    if(!Q.length){if(A.B&&A.B.mode==='cmd')A.autoTurnSmart();else if(A.B&&!A.B.over)A.advance();if(!Q.length)break;}
    if(A.B)A.B.tA=0;Q.shift()();}
  const m=A.V.modal,res=m&&m.type==='result'?'win':m&&m.type==='lose'?'lose':'stuck',t=A.B?A.B.time:0;
  const P=A.G.party.map(id=>A.G.roster[id]).filter(Boolean),lost=1-P.reduce((q,c)=>q+Math.max(0,c.hp),0)/P.reduce((q,c)=>q+c.S.mhp,0);
  window.__POL=null;A.V.modal=null;if(A.B)A.finishBattle('x');return {res,t,lost,dS:SB.dS,dH:SB.dH,hS:SB.hS,hH:SB.hH,calls:window.__CALLS};}
function party(ids,lv,tier){A.newGame(ids.slice(0,3));const G=A.G;G.roster={};G.party=[];try{A.META.legends=Object.assign({},A.META.legends,{nikaris:1});}catch(e){}
  ids.forEach(id=>{const c=G.roster[id]=A.newChar(id,lv,tier);if(A.GEAR['k_cape_'+Math.min(5,tier)]){c.eq.k='k_cape_'+Math.min(5,tier);c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;}G.party.push(id);});G.tamed=[];G.summons={};}
// the points of a journey: [name, stage, kind, party level, gear tier, party size]. Bosses are met a little under their level (8, 24, 32, 40) with the
// party a first journey has by then, so the fight without a summon is no sure win; the Calamity is stage 5 of a journey
const PTS=(window.__PTS||[['boss1',0,'boss',6,0,4],['boss3',2,'boss',22,2,5],['boss4',3,'boss',30,3,6],['calamity',4,'boss',38,4,6],['field1',0,'field',4,0,4],['field3',2,'field',18,2,5],['field5',4,'field',34,4,6]]).filter(p=>!ONLY.length||ONLY.includes(p[0]));
// the parties: the caller stands in the Vanguard; the rest is the same six
const PARTY={pet:['brann','mira','lumen','sable','oren','tess'],priest:['lumen','brann','mira','sable','oren','tess'],monk:['taro','brann','mira','sable','oren','lumen'],nik:['nikaris','brann','mira','sable','oren','lumen']};
const CALLER={pet:'brann',priest:'lumen',monk:'taro',nik:'nikaris'};
// pets by tier: the monsters sorted by the sum of their base stats; four from the bottom, the middle and the top
const mons=Object.keys(A.MON).filter(k=>{const m=A.MON[k];return m&&m.sk&&m.sk.length&&!m.boss;}).map(k=>{const m=A.MON[k];return [k,(m.hp||1)+(m.atk||1)+(m.def||1)+(m.mag||1)+(m.res||1)+(m.spd||1)];}).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
const tier=i=>{const n=mons.length,at=[.05,.15,.25,.33,.45,.5,.55,.62,.8,.88,.94,.99].slice(i*4,i*4+4);return at.map(f=>mons[Math.min(n-1,Math.floor(f*n))]);};
const GK=A.GPOOL.slice(),MI=A.MINIS.map(d=>({mon:d[0],name:d[2],mod:d[5]})).filter(o=>A.MON[o.mon]);
const mkPet=(mon,who,sc,bb)=>{const d=A.MON[mon]||A.guardianDef(mon);const p={id:'tmsb',mon,name:(sc?'Lesser ':'')+d.n,cls:A.tameClass(d),trait:A.tameTrait(d),bb:bb?1:0,scourge:sc?1:0,with:who,bt:0};A.registerTamed(p);return p;};
// sources: [key, label, party, setup(i) -> policy]
const SRCS=[
 ['pet0','Pet, weak monster','pet',i=>{A.G.tamed=[mkPet(tier(0)[i%4],'brann',0,0)];return {kind:'pet',who:'brann'};}],
 ['pet1','Pet, middle monster','pet',i=>{A.G.tamed=[mkPet(tier(1)[i%4],'brann',0,0)];return {kind:'pet',who:'brann'};}],
 ['pet2','Pet, strong monster','pet',i=>{A.G.tamed=[mkPet(tier(2)[i%4],'brann',0,0)];return {kind:'pet',who:'brann'};}],
 ['petbb','Pet, strong, Beastbond','pet',i=>{A.G.tamed=[mkPet(tier(2)[i%4],'brann',0,1)];return {kind:'pet',who:'brann'};}],
 ['gPriest','Guardian, Priest (Invoke)','priest',i=>{const o=MI[i%MI.length];A.G.summons={[o.mon]:o};return {kind:'guard',who:'lumen',mon:o.mon};}],
 ['gNik','Guardian, Nikaris (Invoke)','nik',i=>{const o=MI[i%MI.length];A.G.summons={[o.mon]:o};return {kind:'guard',who:'nikaris',mon:o.mon};}],
 ['gMonk','Guardian, Monk (Spirit Call)','monk',i=>{const o=MI[i%MI.length];A.G.summons={[o.mon]:o};return {kind:'guard',who:'taro',mon:o.mon};}],
 ['sPriest','Lesser Scourge, Priest','priest',i=>{A.G.tamed=[mkPet(GK[i%GK.length],'lumen',1,1)];return {kind:'pet',who:'lumen'};}],
 ['sNik','Lesser Scourge, Nikaris','nik',i=>{A.G.tamed=[mkPet(GK[i%GK.length],'nikaris',1,1)];return {kind:'pet',who:'nikaris'};}],
 ['sMonk','Lesser Scourge, Monk','monk',i=>{A.G.tamed=[mkPet(GK[i%GK.length],'taro',1,1)];return {kind:'pet',who:'taro'};}]];
let seed0=${+process.env.SEED||7};
function cell(pt,src,use,when){const [pn,s,kind,lv,tr,sz]=pt,ids=PARTY[src[2]].slice(0,sz||6);const o={n:0,w:0,t:0,lost:0,dS:0,dH:0,hS:0,hH:0,calls:0,stuck:0};
  for(let i=0;i<N;i++){let sd=(seed0*7919+i*104729+s*31)>>>0;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296;};
    party(ids,lv,tr);const G=A.G;G.stage=s;G.cleared=[0,1,2,3,4].map(x=>x<s);G.run.seed=1000+i;
    if(kind==='boss'){if(s<4)G.run.bosses[s]=A.GPOOL[(i*5+s)%A.GPOOL.length];else G.run.final=A.FPOOL[i%A.FPOOL.length];}
    const pol=src[3](i);A.innHeal();let r=null;try{r=run({stage:s,kind,seed:sd},use?Object.assign({when:when||'first'},pol):null);}catch(e){window.__ERR=(window.__ERR||0)+1;window.__ERRM=pn+' '+src[0]+': '+e.message+' '+String(e.stack).split('\\n').slice(1,4).join(' < ');continue;}if(!r)continue;
    o.n++;if(r.res==='stuck')o.stuck++;if(r.res==='win'){o.w++;o.t+=r.t;}o.lost+=r.lost;o.dS+=r.dS;o.dH+=r.dH;o.hS+=r.hS;o.hH+=r.hH;o.calls+=r.calls?1:0;}
  return o;}
const out={pts:PTS.map(p=>p.slice(0,6)),rows:[],N,err:0};
PTS.forEach(pt=>{const base={};SRCS.filter(x=>!ONLYS.length||ONLYS.includes(x[0])).forEach(src=>{const bk=src[2]+(src[0].startsWith('pet')?src[0]:src[0].startsWith('s')?'s':'g');
  // the run without the summon: one per party and pairing kind (pets differ by pet, the others share the party's)
  if(!base[bk])base[bk]=cell(pt,src,false);const on=cell(pt,src,true,'first'),on2=cell(pt,src,true,'hurt');out.rows.push({pt:pt[0],key:src[0],label:src[1],off:base[bk],on,on2});});});
out.err=window.__ERR||0;out.errm=window.__ERRM||'';return out;`;
(async()=>{const N=+process.argv[2]||30,POINTS=(process.env.POINTS||'').split(',').filter(Boolean);
  const browser=await chromium.launch();const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  const P=path.join(require('os').tmpdir(),'sumbal_'+process.pid+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"></head><body><script>localStorage.clear();</script>'+MOCK+'<div id="app"><header id="hdr"></header><main id="screen"></main><div id="modal"></div></div></body></html>');
  await page.goto('file://'+P);const t0=Date.now();
  const r=await page.evaluate(([SRC,HARNESS,BODY])=>{window.__PWTEST=1;Date.now=()=>1700000000000;window.__Q=[];const st=f=>{window.__Q.push(f);return 1;};
    const A=(new Function('setTimeout',SRC+HARNESS))(st);A.setPause(0);return (new Function('A',BODY))(A);},[SRC,HARNESS,BODY(N,POINTS)]);
  await browser.close();try{fs.unlinkSync(P);}catch(e){}
  const pc=(a,b)=>b?Math.round(100*a/b):0,f1=x=>(Math.round(x*10)/10).toFixed(1),pad=(s,n)=>String(s).padEnd(n),lp=(s,n)=>String(s).padStart(n);
  console.log(`sumbal: ${N} fights a cell, ${MODS.length} modules, ${((Date.now()-t0)/1000).toFixed(0)} s. Points: ${r.pts.map(p=>`${p[0]} (stage ${p[1]+1} ${p[2]}, party of ${p[5]} at level ${p[3]}, gear tier ${p[4]})`).join('; ')}`);
  console.log('Two callers: "first" calls the first turn it can; "hurt" waits until the Vanguard is under 55% HP on average or one hero is under 30%.');
  console.log('win: without > first / hurt. length: battle clock of a won fight against the same party without the summon. HP lost: share of the party\'s HP gone at the end. dmg: the summon\'s share of the damage the party\'s side did. used: fights where the call happened.\n');
  console.log('| point | source | win % (none > first / hurt) | length (first / hurt) | HP lost % (none > first / hurt) | dmg share % (first / hurt) | used % (first / hurt) |\n|---|---|---|---|---|---|---|');
  const agg={},mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,xx=(t,t0)=>t&&t0?'x'+(t/t0).toFixed(2):'n/a';
  r.rows.forEach(x=>{const a=x.off,b=x.on,c=x.on2,T=o=>o.w?o.t/o.w:0,ds=o=>pc(o.dS,o.dS+o.dH);
    console.log(`| ${pad(x.pt,8)} | ${pad(x.label,28)} | ${lp(pc(a.w,a.n),3)} > ${lp(pc(b.w,b.n),3)} / ${lp(pc(c.w,c.n),3)} | ${xx(T(b),T(a))} / ${xx(T(c),T(a))} | ${lp(pc(a.lost,a.n),2)} > ${lp(pc(b.lost,b.n),2)} / ${lp(pc(c.lost,c.n),2)} | ${lp(ds(b),2)} / ${lp(ds(c),2)} | ${lp(pc(b.calls,b.n),3)} / ${lp(pc(c.calls,c.n),3)} |`);
    const boss=!/^field/.test(x.pt),g=agg[x.key]||(agg[x.key]={label:x.label,B:{a:[0,0],b:[0,0],c:[0,0],lb:[],lc:[],db:[],dc:[]},F:{la:0,lb:0,lc:0,n:0,tb:[],tc:[],db:[],dc:[]}});
    if(boss){const G=g.B;G.a[0]+=a.w;G.a[1]+=a.n;G.b[0]+=b.w;G.b[1]+=b.n;G.c[0]+=c.w;G.c[1]+=c.n;if(T(a)&&T(b))G.lb.push(T(b)/T(a));if(T(a)&&T(c))G.lc.push(T(c)/T(a));G.db.push(ds(b));G.dc.push(ds(c));}
    else{const G=g.F;G.la+=a.lost;G.lb+=b.lost;G.lc+=c.lost;G.n+=a.n;if(T(a)&&T(b))G.tb.push(T(b)/T(a));if(T(a)&&T(c))G.tc.push(T(c)/T(a));G.db.push(ds(b));G.dc.push(ds(c));}});
  console.log('\nBy source (every boss point together, every field point together):\n| source | boss win % (none > first / hurt) | boss length (first / hurt) | boss dmg share % (first / hurt) | field length (first) | field HP lost % (none > first) | field dmg share % (first) |\n|---|---|---|---|---|---|---|');
  Object.keys(agg).forEach(k=>{const g=agg[k],G=g.B,F=g.F;console.log(`| ${pad(g.label,28)} | ${lp(pc(G.a[0],G.a[1]),3)} > ${lp(pc(G.b[0],G.b[1]),3)} / ${lp(pc(G.c[0],G.c[1]),3)} | x${mean(G.lb).toFixed(2)} / x${mean(G.lc).toFixed(2)} | ${lp(Math.round(mean(G.db)),2)} / ${lp(Math.round(mean(G.dc)),2)} | ${F.tb.length?'x'+mean(F.tb).toFixed(2):'n/a'} | ${lp(pc(F.la,F.n),2)} > ${lp(pc(F.lb,F.n),2)} | ${lp(Math.round(mean(F.db)),2)} |`);});
  if(r.err)console.log('\nerrors in fights: '+r.err+' ('+r.errm+')');if(errs.length)console.log('page errors:',errs.slice(0,3).join(' | '));
  if(process.env.JSON_OUT)fs.writeFileSync(process.env.JSON_OUT,JSON.stringify(r));
  process.exit(0);})();
