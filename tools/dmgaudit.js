// Damage kind audit (Beta 0.17.x balance pass). Loads the whole game the way tools/fullsim.js does and prints, per class,
// which damage kinds its skills can deal (physical kinds per skill, with the weapon-derived kind for every weapon family the class may
// wield), a class x kind matrix, and per foe family the kinds it resists or is weak to.
// Usage: node tools/dmgaudit.js [--detail] [--json]   (SIMROOT=<other checkout> audits that build, for before/after)
//   exit code 1 when a class reaches more than two physical kinds (or a caster more than one) = the limit of the 0.17 pass.
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=process.env.SIMROOT||path.join(__dirname,'..'),V3=path.join(ROOT,'v3');
const BP=fs.readFileSync(path.join(ROOT,'v3build.py'),'utf8'),MODS=JSON.parse((BP.match(/MODS=(\[[^\]]+\])/)||BP.match(/for n in (\[[^\]]+\])/))[1].replace(/'/g,'"'));
const MOCK=(()=>{const s=fs.readFileSync(path.join(__dirname,'chrome','beta.js'),'utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
const SRC=MODS.map(f=>fs.readFileSync(path.join(V3,f),'utf8')).join('\n');
const HARNESS=`
return {get G(){return G},newGame,newChar,TPL,RAW,CLS_WPN,ARCH,DL_NAME,LIMIT,LIMIT2,BONDS,known,classSkills,deliveryOf,limitSkill,heroRoles:typeof heroRoles==='function'?heroRoles:null,
  kindsCap:typeof CLS_KINDS!=='undefined'?CLS_KINDS:null};`;
const BODY=`
const ids=A.RAW.filter(r=>r[6]!=='x'&&A.TPL[r[0]]&&!A.TPL[r[0]].mon).map(r=>r[0]);
A.newGame(ids.slice(0,3));const G=A.G;G.roster={};G.party=[];
const cls={};// cls -> {heroes:[], wpn:[], kinds:{kind:Set(skill)}, wk:{fam:{kind:Set}}, magic:bool}
const rec=(cl,kind,label)=>{const C=cls[cl];(C.kinds[kind]=C.kinds[kind]||new Set()).add(label);};
ids.forEach(id=>{const t=A.TPL[id],cl=t.cls;const C=cls[cl]=cls[cl]||{heroes:[],wpn:(A.CLS_WPN[cl]||[]).slice(),kinds:{},fam:{}};C.heroes.push(id);});
Object.keys(cls).forEach(cl=>{const C=cls[cl];
  C.heroes.forEach(id=>{const roles=A.heroRoles?A.heroRoles({id}):[null];roles.forEach(role=>{const c=G.roster[id]=A.newChar(id,99,5);if(role)c.role=role;
    let L=[];try{L=A.known(c);}catch(e){L=A.classSkills(A.TPL[id]);}
    try{L=L.concat([A.limitSkill(Object.assign(c,{lv:99}))]);}catch(e){}
    const fams=C.wpn.length?C.wpn:[null];
    L.forEach(s=>{if(s.k!=='phys'&&s.k!=='mag')return;fams.forEach(f=>{const a={id,side:'p',S:{wp:f}};let d;try{d=A.deliveryOf(a,s);}catch(e){d='?';}
      const lab=s.n+(s.id==='attack'?'':'');if(d){rec(cl,d,lab);((C.fam[f]=C.fam[f]||{})[d]=C.fam[f][d]||new Set()).add(lab);}});});
    const atk={id:'attack',k:(cl==='mage'||cl==='healer'||cl==='bard'||cl==='archmage'||cl==='chronicler')?'mag':'phys'};
    fams.forEach(f=>{const d=A.deliveryOf({id,side:'p',S:{wp:f}},atk);if(d){rec(cl,d,'Attack');((C.fam[f]=C.fam[f]||{})[d]=C.fam[f][d]||new Set()).add('Attack');}});
    delete G.roster[id];});});
  A.BONDS.forEach(b=>{if(!b.tech||(b.tech.k!=='phys'&&b.tech.k!=='mag'))return;[b.a,b.b].forEach(id=>{if(A.TPL[id]&&A.TPL[id].cls===cl)(C.wpn.length?C.wpn:[null]).forEach(f=>{const d=A.deliveryOf({id,side:'p',S:{wp:f}},Object.assign({},b.tech,{id:'bond:x'}));if(d)rec(cl,d,'Bond: '+b.tech.n);});});});
});
const out={};Object.keys(cls).forEach(cl=>{const C=cls[cl];out[cl]={heroes:C.heroes.length,wpn:C.wpn,kinds:Object.fromEntries(Object.entries(C.kinds).map(([k,v])=>[k,[...v]])),
  fam:Object.fromEntries(Object.entries(C.fam).map(([f,o])=>[f,Object.fromEntries(Object.entries(o).map(([k,v])=>[k,v.size]))]))};});
const foes={};Object.keys(A.ARCH).forEach(k=>{const dl=A.ARCH[k].dl||{};foes[k]={n:A.ARCH[k].n,dl,area:A.ARCH[k].area||null,single:A.ARCH[k].single||null};});
return {cls:out,foes};`;
(async()=>{const detail=process.argv.includes('--detail'),json=process.argv.includes('--json');
  const browser=await chromium.launch();const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  const P=path.join(require('os').tmpdir(),'dmgaudit_'+process.pid+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"></head><body><script>localStorage.clear();</script>'+MOCK+'<div id="app"><header id="hdr"></header><main id="screen"></main><div id="modal"></div></div></body></html>');
  await page.goto('file://'+P);
  const r=await page.evaluate(([SRC,HARNESS,BODY])=>{window.__PWTEST=1;window.__Q=[];const st=f=>{window.__Q.push(f);return 1;};
    const A=(new Function('setTimeout',SRC+HARNESS))(st);return (new Function('A',BODY))(A);},[SRC,HARNESS,BODY]);
  await browser.close();try{fs.unlinkSync(P);}catch(e){}
  if(json){console.log(JSON.stringify(r,null,1));return;}
  const KINDS=['slash','blunt','piercing','ranged','magic'],CAST=new Set(['mage','healer','bard','archmage','chronicler']);let bad=0;
  const pad=(s,n)=>String(s).padEnd(n);
  console.log('Class x damage kind (skills + basic attack + limit + bond techs, over every weapon family the class may wield). Number = distinct skills reaching that kind.');
  console.log(pad('class',12)+KINDS.map(k=>pad(k,9)).join('')+'phys kinds');
  Object.keys(r.cls).forEach(cl=>{const C=r.cls[cl],n=k=>(C.kinds[k]||[]).length;const pk=KINDS.slice(0,4).filter(k=>n(k)>0);
    const lim=CAST.has(cl)?1:2;const flag=pk.length>lim?'  <-- over the limit ('+lim+')':'';if(flag)bad++;
    console.log(pad(cl,12)+KINDS.map(k=>pad(n(k)||'.',9)).join('')+pk.length+' ('+pk.join('+')+')'+flag);});
  console.log('\nKind by weapon family (distinct skills per kind):');
  Object.keys(r.cls).forEach(cl=>{const C=r.cls[cl];console.log(pad(cl,11)+C.wpn.map(f=>f+': '+Object.entries(C.fam[f]||{}).filter(([k])=>k!=='magic').map(([k,v])=>k+' '+v).join('/')).join(' | '));});
  if(detail){console.log('\nSkills per kind:');Object.keys(r.cls).forEach(cl=>{console.log(cl);Object.entries(r.cls[cl].kinds).forEach(([k,v])=>console.log('  '+pad(k,9)+v.join(', ')));});}
  console.log('\nFoe families (x multiplier by kind; blank = 1.0; weak >= 1.1, resists <= 0.9):');
  console.log(pad('family',10)+KINDS.map(k=>pad(k,9)).join('')+'weak / resists');
  Object.keys(r.foes).forEach(k=>{const F=r.foes[k];const w=KINDS.filter(d=>F.dl[d]>=1.1),rs=KINDS.filter(d=>F.dl[d]!=null&&F.dl[d]<=.9);
    console.log(pad(F.n,10)+KINDS.map(d=>pad(F.dl[d]!=null?F.dl[d]:'.',9)).join('')+'weak '+(w.join(',')||'-')+' / resists '+(rs.join(',')||'-')+(F.area?' / area x'+F.area:'')+(F.single?' / single x'+F.single:''));});
  if(errs.length)console.log('page errors:',errs.slice(0,3).join(' | '));
  process.exit(bad?1:0);})();
