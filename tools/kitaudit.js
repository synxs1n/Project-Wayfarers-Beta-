// Kit audit (v0.19 skills12): how many class skills each wayfarer can learn, per class and for single versus dual types, how many dual types lack a Primer
// or Detonator for one of their elements, how many dual types still hold an elemental ultimate, and which skills are in the kit.
// Loads the whole game like tools/dmgaudit.js does (SIMROOT=<other checkout> audits that build: run it on a copy of an older revision for the "before").
// Usage: node tools/kitaudit.js [--detail] [--json]
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=process.env.SIMROOT||path.join(__dirname,'..'),V3=path.join(ROOT,'v3');
const BP=fs.readFileSync(path.join(ROOT,'v3build.py'),'utf8'),MODS=JSON.parse((BP.match(/MODS=(\[[^\]]+\])/))[1].replace(/'/g,'"'));
const MOCK=(()=>{const s=fs.readFileSync(path.join(__dirname,'chrome','beta.js'),'utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
const SRC=MODS.map(f=>fs.readFileSync(path.join(V3,f),'utf8')).join('\n');
const HARNESS=`return {TPL,RAW,CLS,classSkills,skHitsFoe,skEls,EL,SK12:typeof SK12!=='undefined'?SK12:null,full:typeof sk12Full==='function'?sk12Full:null};`;
const BODY=`
const ids=A.RAW.filter(r=>r[6]!=='x'&&A.TPL[r[0]]&&!A.TPL[r[0]].mon).map(r=>r[0]);
const ULT={warrior:['titan','ragnarok'],knight:['judge'],mage:['s3a','cataclysm'],healer:['verdict'],thief:['assn','lotus'],archer:['heavenp'],monk:['dragon','ascend'],bard:['finale','symphony'],sniper:['s3a','tenk'],druid:['s3a','oldwood'],archmage:['s3a','zeropoint'],chronicler:['s3a','finaled']};
const out=[];
ids.forEach(id=>{const t=A.TPL[id];if(!A.CLS[t.cls])return;const L=A.classSkills(t),full=A.full?A.full(t):L;
  const dual=t.el.length>1,lg=t.src==='L'||t.src==='x';
  const pd=t.el.map(e=>({e,P:L.some(s=>s.role==='primer'&&!s.combo&&A.skHitsFoe(s)&&A.skEls(s)[0]===e),D:L.some(s=>s.role==='det'&&!s.combo&&A.skHitsFoe(s)&&A.skEls(s).includes(e))}));
  out.push({id,cls:t.cls,dual,lg,n:L.length,full:full.length,pd,ult:L.filter(s=>s.el&&(ULT[t.cls]||[]).includes(s.id)).map(s=>s.id),combo:L.filter(s=>s.combo).map(s=>s.k),last:Math.max(...L.map(s=>s.lv)),
    ids:L.map(s=>s.id+'@'+s.lv+(s.role?'/'+s.role:'')).join(' ')});});
return out;`;
(async()=>{const detail=process.argv.includes('--detail'),json=process.argv.includes('--json');
  const browser=await chromium.launch();const page=await browser.newPage();
  const P=path.join(require('os').tmpdir(),'kitaudit_'+process.pid+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"></head><body><script>localStorage.clear();</script>'+MOCK+'<div id="app"><header id="hdr"></header><main id="screen"></main><div id="modal"></div></div></body></html>');
  await page.goto('file://'+P);
  const r=await page.evaluate(([SRC,HARNESS,BODY])=>{window.__PWTEST=1;window.__Q=[];const st=f=>{window.__Q.push(f);return 1;};
    const A=(new Function('setTimeout',SRC+HARNESS))(st);return (new Function('A',BODY))(A);},[SRC,HARNESS,BODY]);
  await browser.close();try{fs.unlinkSync(P);}catch(e){}
  if(json){console.log(JSON.stringify(r,null,1));return;}
  const avg=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):'-',pad=(s,n)=>String(s).padEnd(n);
  console.log(pad('class',12)+pad('single n/avg/max (all uncapped)',34)+pad('dual n/avg/max (uncapped)',30));
  [...new Set(r.map(x=>x.cls))].sort().forEach(c=>{const S=r.filter(x=>x.cls===c&&!x.dual),D=r.filter(x=>x.cls===c&&x.dual);
    const f=a=>a.length?`${a.length}/${avg(a.map(x=>x.n))}/${Math.max(...a.map(x=>x.n))} (${avg(a.map(x=>x.full))})`:'-';console.log(pad(c,12)+pad(f(S),34)+pad(f(D),30));});
  const D=r.filter(x=>x.dual);
  const miss=D.filter(x=>x.pd.some(p=>!p.P||!p.D)),ult=D.filter(x=>x.ult.length&&!x.lg);
  console.log(`\ntotal heroes ${r.length}, single ${r.filter(x=>!x.dual).length}, dual ${D.length}; largest kit ${Math.max(...r.map(x=>x.n))}; kits over 12: ${r.filter(x=>x.n>12).length}`);
  console.log(`dual types missing a Primer or Detonator for an element (single skills only): ${miss.length}${miss.length?' ('+miss.map(x=>x.id).join(', ')+')':''}`);
  console.log(`dual types (not legends) holding an elemental ultimate: ${ult.length}${ult.length?' ('+ult.map(x=>x.id).join(', ')+')':''}; legends/special with one: ${D.filter(x=>x.lg&&x.ult.length).map(x=>x.id).join(', ')||'none'}`);
  console.log('dual art kinds: '+[...new Set(r.filter(x=>x.combo.length).map(x=>x.cls+':'+[...new Set(x.combo)].join('/')))].sort().join('  '));
  if(detail)r.forEach(x=>console.log(`${x.id} ${x.cls}${x.dual?' DUAL':''} n=${x.n} (full ${x.full}) last lv ${x.last} :: ${x.ids}`));
})().catch(e=>{console.error(e);process.exit(1);});
