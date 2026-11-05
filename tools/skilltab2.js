const fs=require('fs');
const load=dir=>(new Function(fs.readFileSync(__dirname+'/'+dir+'/data.js','utf8')+';return {TPL,classSkills,CLS};'))();
const O=load('v3_pre_030'),N=load('v3');
const bands=[[1,1],[2,10],[11,20],[21,30],[31,40],[41,50]];
const row=(A)=>{const by={};Object.values(A.TPL).forEach(t=>{if(t.mon||!A.CLS[t.cls])return;const k=t.cls;const S=A.classSkills(t);const r=by[k]=by[k]||{n:0,b:bands.map(()=>0),late:{p:0,d:0}};r.n++;
  S.forEach(x=>bands.forEach((b,i)=>{if(x.lv>=b[0]&&x.lv<=b[1])r.b[i]++;}));if(S.some(x=>x.role==='primer'&&x.lv>=31))r.late.p++;if(S.some(x=>x.role==='det'&&x.lv>=31))r.late.d++;});return by;};
const a=row(O),b=row(N);
console.log('class | '+bands.map(x=>x[0]===x[1]?'Lv 1':x[0]+'-'+x[1]).join(' | ')+' | P/D at 31+');
Object.keys(b).sort().forEach(k=>{const f=r=>r.b.map(x=>+(x/r.n).toFixed(1)).join(' | ');console.log(`${k} before | ${f(a[k])} | ${a[k].late.p}/${a[k].late.d} of ${a[k].n}`);console.log(`${k} after | ${f(b[k])} | ${b[k].late.p}/${b[k].late.d} of ${b[k].n}`);});
