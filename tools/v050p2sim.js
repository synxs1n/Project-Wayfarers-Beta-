// v0.5.0 2.6: stage 1 balance with and without dual type regular monsters, across every standard realm that can open a journey.
// Usage (from the repo root, with tools/v3 linked): node tools/v050p2sim.js N level [off]
//   off: run without the v0.5.0 single type rule (the "before" numbers)
// A fresh party of 3 starters at the given level fights N field battles in each realm placed at stage 1 (careful brain and auto).
const fs=require('fs'),path=require('path');
const TMP=path.join(require('os').tmpdir(),'v050p2sim_'+process.pid);fs.mkdirSync(TMP,{recursive:true});
const V3=path.join(__dirname,'v3');
const realms=fs.readFileSync(path.join(V3,'realms.js'),'utf8').split('\n');
const a=realms.findIndex(l=>l.startsWith('const MONV=[')),b=realms.findIndex(l=>l.startsWith('MONV.forEach'));
fs.writeFileSync(path.join(TMP,'monv.js'),'const lerpHex=(a)=>a;\n'+realms.slice(a,b+1).join('\n'));
const p2=fs.readFileSync(path.join(V3,'p2world.js'),'utf8'),s0=p2.indexOf('// @sim-begin'),s1=p2.indexOf('// @sim-end');
fs.writeFileSync(path.join(TMP,'p2sim.js'),process.argv[4]==='off'?'':p2.slice(s0,s1));
process.env.SIMEXTRA=[path.join(V3,'realmdata.js'),path.join(TMP,'monv.js'),path.join(TMP,'p2sim.js')].join(',');
const {A,run,party}=require('./v3sim.js');
const N=+process.argv[2]||40,L=+process.argv[3]||3;
const st=A.RAW.filter(r=>r[6]==='s').map(r=>r[0]);
const std=A.ZONES.map((Z,i)=>[Z,i]).filter(([Z,i])=>Z.std||i===0);
let seed=7;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const tot={careful:{w:0,n:0,loss:0,dual:0,foes:0},auto:{w:0,n:0,loss:0,dual:0,foes:0}};
const rows=[];
for(const [Z,zi] of std){const row=[Z.n];
  for(const mode of ['careful','auto']){let w=0,n=0,loss=0,dual=0,foes=0;
    for(let i=0;i<N;i++){const ids=[];while(ids.length<3){const id=st[Math.floor(R()*st.length)];if(!ids.includes(id))ids.push(id);}party(ids,L,0);
      A.G.run.order=[zi,1,2,3,4];A.G.run.rv=2;A.G.stage=0;A.setSmart(mode==='careful');
      const all=A.G.party.map(id=>A.G.roster[id]),mhp=all.map(c=>c.S.mhp);
      const foesB=A.encounterFoes({stage:0,kind:'field'});foes+=foesB.length;dual+=foesB.filter(e=>e.el.length>1).length;
      const r=run({stage:0,kind:'field',weather:'clear',foes:foesB});if(!r)continue;n++;if(r.res==='win')w++;loss+=all.reduce((q,c,k)=>q+(mhp[k]-Math.max(0,c.hp))/mhp[k],0)/all.length;}
    const T=tot[mode];T.w+=w;T.n+=n;T.loss+=loss;T.dual+=dual;T.foes+=foes;row.push(`${mode} win ${(100*w/n).toFixed(0)}% HP lost ${(100*loss/n).toFixed(0)}% dual foes ${(100*dual/Math.max(1,foes)).toFixed(0)}%`);}
  rows.push(row.join(' | '));}
rows.forEach(r=>console.log(r));
for(const mode of ['careful','auto']){const T=tot[mode];console.log(`ALL ${mode}: party 3 at lv ${L}: win ${(100*T.w/T.n).toFixed(1)}% | HP lost ${(100*T.loss/T.n).toFixed(1)}% | dual type foes ${(100*T.dual/T.foes).toFixed(1)}% (${T.n} fights)`);}
fs.rmSync(TMP,{recursive:true,force:true});
