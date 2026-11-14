// Legendary balance (legends17b.js): each reworked Legendary against its base class and (with SIMROOT) against its old self, in boss fights played
// by the game's own battle code and its careful auto (the same loop as sumbal.js / tools/fullsim.js).
// One party per hero under test: the hero, a Warrior, a Priest in the Vanguard, a Knight, a Thief and a Mage behind (the Mage is a Bard when the hero
// is a mage, so no second caster of the class stands in). Five boss points of a journey (stages 2 to 5 and a level 46 Calamity).
// Per hero and point: win rate, the battle clock of a won fight, and the hero's own damage per 1000 ticks of battle clock while the fight lasts
// (every blow the hero lands, Twin Weave and the hawk included; storm bolts and Parthian Shot are not counted for anyone).
// Usage (from tools/chrome): node legbal.js [N fights per cell, default 30]   SEED=<n>   HEROES=a,b   SIMROOT=<other checkout: the old kits>   JSON_OUT=file
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=process.env.SIMROOT||path.join(__dirname,'..','..'),V3=path.join(ROOT,'v3');
const BP=fs.readFileSync(path.join(ROOT,'v3build.py'),'utf8'),MODS=JSON.parse(BP.match(/MODS=(\[[^\]]+\])/)[1].replace(/'/g,'"'));
const MOCK=(()=>{const s=fs.readFileSync(path.join(__dirname,'beta.js'),'utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
const SRC=MODS.map(f=>fs.readFileSync(path.join(V3,f),'utf8')).join('\n');
const HARNESS=`
function render(){}
if(typeof autoBan==='function')autoBan=function(){return null;};
if(typeof autoTypeReason==='function'){autoTypeReason=function(){return null;};}
const LB={who:null,d:0,h:0,acts:0,used:{}};window.__LB=LB;
HOOK.wrap('perform','legbal','damage and healing by the hero under test',function(next,...args){const a=args[0],sk=args[1];if(!B||!a||a.side!=='p'||a.id!==LB.who)return next(...args);
  const hp=L=>L.reduce((q,u)=>q+Math.max(0,u.hp||0),0),e0=hp(B.en),p0=allParty().map(u=>[u,u.hp]);let r;
  try{r=next(...args);}finally{LB.d+=Math.max(0,e0-hp(B.en));p0.forEach(([u,v])=>{if(u.hp>v)LB.h+=u.hp-v;});if(sk&&sk.id&&sk.id!=='weave'&&sk.id!=='l17_dive'){LB.acts++;LB.used[sk.id]=(LB.used[sk.id]||0)+1;}}return r;});
return {get G(){return G},set G(v){G=v},get B(){return B},V,get META(){return META},newGame,newChar,startBattle,advance,autoTurn,autoTurnSmart,setPause:p=>{PAUSE=p},
  setSmart:v=>{if(typeof SIM_SMART!=='undefined')SIM_SMART=v},finishBattle,calcStats,TPL,GPOOL,FPOOL,GEAR,classSkills,
  syncPools:typeof syncPools==='function'?syncPools:()=>{},
  innHeal:()=>Object.values(G.roster).forEach(c=>{c.ail={};c.st={};c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;c.lb=0;})};`;
const BODY=(N,HEROES)=>`
const Q=window.__Q,LB=window.__LB,N=${N},HEROES=${JSON.stringify(HEROES)};
function run(spec){Q.length=0;try{A.syncPools();}catch(e){}try{A.G.bossWon=new Proxy({},{get:()=>1});}catch(e){}A.setSmart(true);A.V.auto=true;try{A.META.cfg.autoOn=true;}catch(e){}A.META.best={};
  LB.d=LB.h=LB.acts=0;if(!A.startBattle(spec))return null;if(A.B)A.B.auto=true;
  let it=0;while(it++<400000){const m=A.V.modal;if(m&&(m.type==='result'||m.type==='lose'))break;
    if(!Q.length){if(A.B&&A.B.mode==='cmd')A.autoTurnSmart();else if(A.B&&!A.B.over)A.advance();if(!Q.length)break;}
    if(A.B)A.B.tA=0;Q.shift()();}
  const m=A.V.modal,res=m&&m.type==='result'?'win':m&&m.type==='lose'?'lose':'stuck',t=A.B?A.B.time:0;
  A.V.modal=null;if(A.B)A.finishBattle('x');return {res,t,d:LB.d,h:LB.h};}
function party(ids,lv,tier){A.newGame(ids.slice(0,3));const G=A.G;G.roster={};G.party=[];try{A.META.legends={nikaris:1,kaevan:1,jaeson:1};}catch(e){}
  ids.forEach(id=>{const c=G.roster[id]=A.newChar(id,lv,tier);if(A.GEAR['k_cape_'+Math.min(5,tier)]){c.eq.k='k_cape_'+Math.min(5,tier);c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;}G.party.push(id);});G.tamed=[];G.summons={};}
const PTS=[['boss2',1,14,1],['boss3',2,22,2],['boss4',3,30,3],['calamity',4,38,4],['late',4,46,5]];
let seed0=${+process.env.SEED||7};
const out={rows:[],N,err:0,kits:{}};
HEROES.forEach(h=>{const mage=A.TPL[h].cls==='mage'||A.TPL[h].cls==='archmage',ids=[h,'brann','lumen','oren','sable',mage?'brook':'mira'];
  out.kits[h]=A.classSkills(A.TPL[h]).map(s=>s.lv+' '+s.n).join(', ');
  PTS.forEach(([pn,s,lv,tr])=>{const o={h,pt:pn,n:0,w:0,t:0,tAll:0,d:0,heal:0,stuck:0,used:{}};LB.who=h;LB.used=o.used;
    for(let i=0;i<N;i++){let sd=(seed0*7919+i*104729+s*31)>>>0;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296;};
      party(ids,lv,tr);const G=A.G;G.stage=s;G.cleared=[0,1,2,3,4].map(x=>x<s);G.run.seed=1000+i;
      if(s<4)G.run.bosses[s]=A.GPOOL[(i*5+s)%A.GPOOL.length];else G.run.final=A.FPOOL[i%A.FPOOL.length];
      A.innHeal();let r=null;try{r=run({stage:s,kind:'boss',seed:sd});}catch(e){window.__ERR=(window.__ERR||0)+1;window.__ERRM=pn+' '+h+': '+e.message+' '+String(e.stack).split('\\n').slice(1,4).join(' < ');continue;}if(!r)continue;
      o.n++;if(r.res==='stuck')o.stuck++;if(r.res==='win'){o.w++;o.t+=r.t;}o.tAll+=r.t;o.d+=r.d;o.heal+=r.h;}
    out.rows.push(o);});});
out.err=window.__ERR||0;out.errm=window.__ERRM||'';return out;`;
(async()=>{const N=+process.argv[2]||30,HEROES=(process.env.HEROES||'nikaris,kaevan,jaeson,tess,wren,ciro,fenn,zia,mira').split(',').filter(Boolean);
  const browser=await chromium.launch();const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  const P=path.join(require('os').tmpdir(),'legbal_'+process.pid+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"></head><body><script>localStorage.clear();</script>'+MOCK+'<div id="app"><header id="hdr"></header><main id="screen"></main><div id="modal"></div></div></body></html>');
  await page.goto('file://'+P);const t0=Date.now();
  const r=await page.evaluate(([SRC,HARNESS,BODY])=>{window.__PWTEST=1;Date.now=()=>1700000000000;window.__Q=[];const st=f=>{window.__Q.push(f);return 1;};
    const A=(new Function('setTimeout',SRC+HARNESS))(st);A.setPause(0);return (new Function('A',BODY))(A);},[SRC,HARNESS,BODY(N,HEROES)]);
  await browser.close();try{fs.unlinkSync(P);}catch(e){}
  const pad=(s,n)=>String(s).padEnd(n),lp=(s,n)=>String(s).padStart(n);
  console.log(`legbal: ${N} fights a cell, ${MODS.length} modules (${process.env.SIMROOT?'SIMROOT '+process.env.SIMROOT:'this checkout'}), ${((Date.now()-t0)/1000).toFixed(0)} s`);
  console.log('| hero | point | win % | length of a win | own damage per 1000 ticks | own healing per fight |\n|---|---|---|---|---|---|');
  const sum={};
  r.rows.forEach(o=>{const dps=o.tAll?o.d/o.tAll*1000:0;console.log(`| ${pad(o.h,8)} | ${pad(o.pt,8)} | ${lp(o.n?Math.round(100*o.w/o.n):0,3)} | ${lp(o.w?Math.round(o.t/o.w):0,5)} | ${lp(Math.round(dps),6)} | ${lp(o.n?Math.round(o.heal/o.n):0,5)} |`);
    const g=sum[o.h]||(sum[o.h]={w:0,n:0,dps:[],len:[],byPt:{}});g.w+=o.w;g.n+=o.n;g.dps.push(dps);if(o.w)g.len.push(o.t/o.w);g.byPt[o.pt]={dps,win:o.n?o.w/o.n:0,len:o.w?o.t/o.w:0,used:o.used};});
  console.log('\n| hero | win % over the five points | mean own damage per 1000 ticks | mean length of a win |\n|---|---|---|---|');
  const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  Object.keys(sum).forEach(h=>{const g=sum[h];console.log(`| ${pad(h,8)} | ${lp(Math.round(100*g.w/g.n),3)} | ${lp(Math.round(mean(g.dps)),6)} | ${lp(Math.round(mean(g.len)),5)} |`);});
  if(process.env.USED)Object.keys(sum).forEach(h=>console.log(h,JSON.stringify(sum[h].byPt.late.used)));
  if(r.err)console.log('\nerrors in fights: '+r.err+' ('+r.errm+')');if(errs.length)console.log('page errors:',errs.slice(0,3).join(' | '));
  if(process.env.JSON_OUT)fs.writeFileSync(process.env.JSON_OUT,JSON.stringify({sum,kits:r.kits}));
  process.exit(0);})();
