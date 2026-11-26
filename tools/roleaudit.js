// Role audit (v0.22.54): are sub role and off role skills weaker than the same kind of skill on a hero whose main role it is?
// Loads the whole game the way tools/fullsim.js does. Every hero at levels 12, 20, 30 and 40 hits a neutral target (no element matchup, no random
// spread, no crit) with every damage skill they know; skills are grouped by role (sk12Role) and by single target or area.
// Prints, per level and role: the best skill of each main role hero (min / median / max) against the best of each sub role hero, the sub role heroes
// that beat the main role median, and heroes whose own sub role skill beats their own best main role skill.
// Usage: node tools/roleaudit.js [out.json]   (SIMROOT=<other checkout> audits that build; the JSON holds every row, also skill ids and learn levels,
// so two builds can be compared to prove a change moved no kit and no learn level)
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=process.env.SIMROOT||path.join(__dirname,'..'),V3=path.join(ROOT,'v3');
const BP=fs.readFileSync(path.join(ROOT,'v3build.py'),'utf8'),MODS=JSON.parse((BP.match(/MODS=(\[[^\]]+\])/)||BP.match(/for n in (\[[^\]]+\])/))[1].replace(/'/g,'"'));
const MOCK=(()=>{const s=fs.readFileSync(path.join(ROOT,'tools','chrome','beta.js'),'utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
const SRC=MODS.map(f=>fs.readFileSync(path.join(V3,f),'utf8')).join('\n');
const HARNESS=`
function render(){}
return {get G(){return G},get B(){return B},newGame,newChar,TPL,RAW,known,calcStats,calcDamage,makeEnemy,heroRoles,heroMain,sk12Mult,sk12Role,autoAlloc,ptsAt,ROLEPW,startBattle,
  skHealAmt:typeof skHealAmt==='function'?skHealAmt:null,setRNG:f=>{RNG=f;},neutral:()=>{effOf=()=>1;},MON:typeof MON!=='undefined'?MON:null,STAGE_BOSS_LV};`;
const BODY=`
const out=[];const ids=A.RAW.filter(r=>r[6]!=='x'&&A.TPL[r[0]]&&!A.TPL[r[0]].mon).map(r=>r[0]);
A.newGame(ids.slice(0,3));const G=A.G;
const rows=[];
for(const L of [12,20,30,40]){const tier=L>=40?5:L>=30?4:L>=20?2:1;
  for(const id of ids){const t=A.TPL[id];let c;try{c=A.newChar(id,L,tier);}catch(e){continue;}G.roster[id]=c;
    const main=A.heroMain(c),R=A.heroRoles(c);let ks=[];try{ks=A.known(c);}catch(e){continue;}
    // a neutral target: defence and resistance equal to the average of every hero's atk/mag at this level would vary; use fixed share of the attacker pool
    const tgt={id:'dummy',name:'Dummy',side:'e',el:[],st:{},ail:{},hp:1e9,S:{mhp:1e9,def:L*6+20,res:L*6+20,elRes:{},elBoost:{},spd:10},base:'dummy'};
    A.setRNG(()=>.5);A.neutral();
    ks.forEach(s=>{if(s.k!=='phys'&&s.k!=='mag')return;if(!s.pw)return;const o=A.sk12Mult(c,s);const role=o?o.r:A.sk12Role(t.cls,s);if(!role)return;
      let d=0;try{c.st={};d=A.calcDamage(c,s,tgt).dmg*(s.hits||1);}catch(e){d=-1;}
      rows.push({L,id,cls:t.cls,leg:A.RAW.find(r=>r[0]===id)[6],main,role,tier:o?o.tier:(s.limit?'limit':s.bond?'bond':'none'),m:o?o.m:1,nat:o&&o.nat?1:0,sk:s.n,sid:s.id,t:s.t,pw:s.pw,hits:s.hits||1,mp:s.mp||0,cost:s.cost||1,lv:s.lv||0,d,flag:(s.role?'R':'')+(s.combo?'C':'')+(s.ult?'U':'')+(s.sig?'S':'')+(s.relic?'X':'')});});
    delete G.roster[id];}}
return rows;`;
function report(r){const med=a=>{a=a.slice().sort((x,y)=>x-y);return a.length?a[Math.floor((a.length-1)/2)]:0;};
const shape=t=>t==='one'?'single':'area';
for(const L of [12,20,30,40]){console.log('\n=== level '+L+' ===');
  for(const role of ['phys','ranged','magic'])for(const sh of ['single','area']){
    const rows=r.filter(x=>x.L===L&&x.role===role&&shape(x.t)===sh);
    const best=(tierF)=>{const m={};rows.filter(tierF).forEach(x=>{if(!m[x.id]||x.d>m[x.id].d)m[x.id]=x;});return Object.values(m);};
    const P=best(x=>x.tier==='primary'),Sx=best(x=>x.tier==='secondary'||x.tier==='off');
    if(!P.length||!Sx.length){console.log(role+' '+sh+': main heroes '+P.length+', sub heroes '+Sx.length);continue;}
    const pd=P.map(x=>x.d),pm=med(pd),pmin=Math.min(...pd),pmax=Math.max(...pd),sd=Sx.map(x=>x.d);
    const overMed=Sx.filter(x=>x.d>pm),overMax=Sx.filter(x=>x.d>pmax);
    console.log(role+' '+sh+': MAIN n='+P.length+' best-skill dmg min/med/max '+pmin+'/'+pm+'/'+pmax+' | SUB n='+Sx.length+' min/med/max '+Math.min(...sd)+'/'+med(sd)+'/'+Math.max(...sd)+' (sub med = '+Math.round(100*med(sd)/pm)+'% of main med) | sub heroes over main median: '+overMed.length+', over main max: '+overMax.length);
    overMed.sort((a,b)=>b.d-a.d).slice(0,6).forEach(x=>console.log('     '+x.id+' ('+x.cls+', main '+x.main+(x.leg==='L'?', Legend':'')+') '+x.sk+' pw '+x.pw+' x'+x.m+(x.nat?' nat':'')+' hits '+x.hits+' ['+x.flag+'] = '+x.d+' ('+Math.round(100*x.d/pm)+'% of main median)'));}
  // within a hero whose main is a damage role: best sub/off damage skill vs best main-role damage skill, same shape
  let n=0,over=[];const ids=[...new Set(r.filter(x=>x.L===L).map(x=>x.id))];
  ids.forEach(id=>{for(const sh of ['single','area']){const rs=r.filter(x=>x.L===L&&x.id===id&&shape(x.t)===sh);const p=rs.filter(x=>x.tier==='primary'),s=rs.filter(x=>x.tier==='secondary'||x.tier==='off');if(!p.length||!s.length)continue;n++;
    const bp=p.reduce((a,b)=>b.d>a.d?b:a),bs=s.reduce((a,b)=>b.d>a.d?b:a);if(bs.d>bp.d)over.push([id,sh,bs,bp]);}});
  console.log('within one hero (own best sub role damage skill beats own best main role one): '+over.length+' of '+n+' hero/shape pairs');
  over.sort((a,b)=>b[2].d/b[3].d-a[2].d/a[3].d).slice(0,8).forEach(([id,sh,bs,bp])=>console.log('     '+id+' '+sh+': sub '+bs.role+' "'+bs.sk+'" pw '+bs.pw+' x'+bs.m+' ['+bs.flag+'] '+bs.d+' vs main '+bp.role+' "'+bp.sk+'" pw '+bp.pw+' ['+bp.flag+'] '+bp.d+' (+'+Math.round(100*(bs.d/bp.d-1))+'%)'));}}
(async()=>{const browser=await chromium.launch();const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  const P=path.join(require('os').tmpdir(),'roleaudit_'+process.pid+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"></head><body><script>localStorage.clear();</script>'+MOCK+'<div id="app"><header id="hdr"></header><main id="screen"></main><div id="modal"></div></div></body></html>');
  await page.goto('file://'+P);
  const r=await page.evaluate(([SRC,HARNESS,BODY])=>{window.__PWTEST=1;let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};window.__Q=[];const st=f=>{window.__Q.push(f);return 1;};
    const A=(new Function('setTimeout',SRC+HARNESS))(st);return (new Function('A',BODY))(A);},[SRC,HARNESS,BODY]);
  if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(r));console.log('rows',r.length,errs.length?'page errors: '+errs.slice(0,3).join(' | '):'');
  report(r);
  await browser.close();try{fs.unlinkSync(P);}catch(e){}})();
