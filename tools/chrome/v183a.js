// towns14.js (v0.20.6): every realm's town is its own place. The owner: "Realms need a bit of a rework, most towns layouts are too similar,
// buildings should look different in each realm."
//  1 assignment: every realm in REALMS / ZONES gets a layout (19 exist) and a building family (20 exist) by its key, an unknown realm key gets one by
//    theme, motif and mood (a fake realm is added and built), no two realms of a journey share a layout and a family
//  2 layout fingerprints: per town the building centroid distribution (8 x 5 cells, weighted by area), the street graph (road, plaza, bridge and stair
//    tiles on a 16 x 10 grid) and where the inn, tavern, smithy, alchemy and guild hall stand; the distance between two towns is the mean of the three
//    (each 0..1). Pairwise over every realm (stage 0 each), and inside 30 journeys drawn with newRun (10 pairs each), with the module off (the old
//    six theme layouts) beside it, so the numbers show what changed
//  3 silhouettes: the alpha masks of the inn, the smithy and a house (the same footprint, the same canvas) per building family; the distance is
//    1 - IoU of the masks, averaged over the three; pairwise over the families in use, the old six themes beside it
//  4 150 towns (30 journeys x 5): every one is on its layout (no fallback), mapIssues 0, nothing blocking (pathAssets), drawAudit clean (no hidden
//    blocker, no hole in a building, every door step and apron reachable), gates present and open, the landmark in the entry's 26 x 10 tile window
//  5 both renderers: HD-2D (High) and flat (Low) draw a town of every family with no error; the HD body kinds per family (gabled box, flat box,
//    cone) and the roof pitch hook are in use; the frame cost with the module on is within noise of the module off (the v170a way: the same frames
//    drawn alternately, medians)
//  6 old behaviour kept: with the module off the six theme layouts and the old buildings are back (T14.off), the base functions still exist
// SHOTDIR=dir saves screenshots of every realm's town (flat overview, and HD-2D close up). THR_FP / THR_SIL set the thresholds.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html [SHOTDIR=/tmp/x] node v183a.js
const {open,chk,done}=require('./pw');
const fs=require('fs');
const PRE=g=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'${g}',hints:false,tips:false,hd2d:${g==='high'}}}));`;
const START=()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;};
const THR_FP=+process.env.THR_FP||.2,THR_SIL=+process.env.THR_SIL||.1,SH=process.env.SHOTDIR,JOURNEYS=+process.env.JOURNEYS||30;
// ---- page side helpers (source strings, evaluated in the page) ----
const FP=`(m)=>{const W=m.w,H=m.h,hist=new Array(40).fill(0),st=new Array(160).fill(0),svc={};let ba=0,sn=0;
  m.bld.forEach(b=>{const cx=(b.x+b.w/2)/W,cy=(b.y+b.h/2)/H;hist[Math.min(4,Math.floor(cy*5))*8+Math.min(7,Math.floor(cx*8))]+=b.w*b.h;ba+=b.w*b.h;if(['inn','tavern','smithy','workshop','guild'].includes(b.k))svc[b.k]=[cx,cy];});
  m.t.forEach((r,y)=>r.forEach((c,x)=>{if('=:Bs'.includes(c)){st[Math.min(9,Math.floor(y/H*10))*16+Math.min(15,Math.floor(x/W*16))]++;sn++;}}));
  return {hist:hist.map(v=>v/ba),st:st.map(v=>v/sn),svc};}`;
const DIST=`(a,b)=>{const l1=(p,q)=>p.reduce((s,v,i)=>s+Math.abs(v-q[i]),0)/2,k=['inn','tavern','smithy','workshop','guild'];
  const dB=l1(a.hist,b.hist),dS=l1(a.st,b.st),dV=k.reduce((s,n)=>s+Math.hypot(a.svc[n][0]-b.svc[n][0],a.svc[n][1]-b.svc[n][1]),0)/k.length/Math.SQRT2*2;return {d:(dB+Math.min(1,dS)+Math.min(1,dV))/3,dB,dS,dV};}`;
const MASK=`(fam,kind,w,h,theme)=>{const T=__A.TW.get('T14'),TS=16,db=__A.TW.get('drawBuilding'),mk=__A.TW.get('mkCv');const m={s:0,sty:fam,theme:theme||'meadow',kind:'town',bld:[],lights:[],smoke:[]};
  const b={k:kind,x:2,y:5,w,h,door:[2+Math.floor((w-1)/2),5+h-1]},cv=mk(7*TS+20,7*TS+58),c=cv.getContext('2d');c.translate(10-b.x*TS,52-b.y*TS);db(c,m,b);
  const d=c.getImageData?cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data:null,a=new Uint8Array(cv.width*cv.height);for(let i=0;i<a.length;i++)a[i]=d[i*4+3]>40?1:0;return Array.from(a);}`;
(async()=>{
  const H=await open({w:1000,h:560,mobile:false,pre:PRE('medium')});const {ev,wait}=H;await ev(START);await wait(400);
  // ---------- 1. assignment ----------
  const A1=await ev(()=>{const A=__A,T=A.TW.get('T14');T.n=0;const rows=A.ZONES.map((z,i)=>{const a=T.assign(z);return {i,key:z.key||('base'+i),theme:z.theme,arch:a.arch,v:a.v,fam:a.fam,guessed:!!a.guessed,cal:!!z.cal};});
    return {rows,arch:Object.keys(T.arch),fam:Object.keys(T.fam)};});
  const realms=A1.rows.filter(r=>!r.key.startsWith('base')),archIn=new Set(A1.rows.map(r=>r.arch)),famIn=new Set(A1.rows.map(r=>r.fam));
  console.log('assignments (zone index, key, theme: layout, mirrored, family):');A1.rows.forEach(r=>console.log(`  ${String(r.i).padStart(2)} ${r.key.padEnd(10)} ${r.theme.padEnd(8)} ${r.arch.padEnd(10)} v${r.v} ${r.fam}${r.guessed?'  (guessed)':''}${r.cal?'  (Calamity)':''}`));
  chk(`${A1.arch.length} layouts exist (>= 10) and ${A1.fam.length} building families (>= 10)`,A1.arch.length>=10&&A1.fam.length>=10||JSON.stringify([A1.arch,A1.fam]));
  chk(`in use: ${archIn.size} layouts and ${famIn.size} families over ${A1.rows.length} realms and zones`,archIn.size>=10&&famIn.size>=10);
  const pairs=new Set(),dup=[];realms.forEach(r=>{const k=r.arch+':'+r.v;if(pairs.has(k))dup.push(r.key);pairs.add(k);});
  chk(`every realm has its own layout and mirroring (${realms.length} realms, ${pairs.size} different)`,!dup.length||'shared: '+dup.join());
  const famCount={};realms.forEach(r=>{famCount[r.fam]=(famCount[r.fam]||0)+1;});const famShared=Object.keys(famCount).filter(k=>famCount[k]>1);
  chk(`building families over the ${realms.length} realms: ${Object.keys(famCount).length} in use`+(famShared.length?` (shared: ${famShared.map(k=>k+' x'+famCount[k]).join(', ')}, each with another layout)`:''),Object.keys(famCount).length>=Math.min(10,realms.length));
  // a realm key nobody knows: its town is a distinct place by theme, motif and mood
  const fake=await ev(()=>{const A=__A,T=A.TW.get('T14'),n0=A.ZONES.length,out=[];
    const mk=(key,theme,motif)=>{const R0=A.REALMS[0],z=Object.assign({},R0,{key,theme,theme0:theme,lean:Object.assign({},R0.lean,{motif}),idx:A.ZONES.length,town:'Fakeford '+key});A.ZONES.push(z);return z;};
    mk('zzember','cave','ember');mk('zzfrost','snow','frost');mk('zzspore','coast','spore');mk('zzbolt','heights','bolt');mk('zzplain','meadow','none');mk('zzvoid','void','eclipse');
    T.n=0;const ord0=A.G.run.order.slice();
    try{for(let i=n0;i<A.ZONES.length;i++){const z=A.ZONES[i],a=T.assign(z);A.G.run.order[0]=i;A.resetMaps();const m=A.getMap('t0'),iss=A.TW.get('mapIssues')(m).length;out.push({key:z.key,arch:a.arch,fam:a.fam,guessed:!!a.guessed,built:m.arch,sty:m.sty,iss,doors:m.bld.length});}}
    finally{A.ZONES.length=n0;T.n=0;A.G.run.order=ord0;A.resetMaps();}return out;});
  fake.forEach(f=>console.log(`  fake realm ${f.key}: ${f.arch} / ${f.fam}${f.guessed?' (guessed)':''}`));
  chk(`six realm keys nobody knows: each built a town on a layout and a family of its own by theme, motif and mood, mapIssues 0`,fake.every(f=>f.guessed&&f.built===f.arch&&f.sty===f.fam&&f.iss===0&&f.doors>=5)||JSON.stringify(fake));
  chk('the guessed families follow the mood (ember -> obsidian, frost snow -> ice, spore coast -> mud, bolt -> cloud, eclipse -> crystal)',(m=>m.zzember==='obsidian'&&m.zzfrost==='ice'&&m.zzspore==='mud'&&m.zzbolt==='cloud'&&m.zzvoid==='crystal')(Object.fromEntries(fake.map(f=>[f.key,f.fam])))||JSON.stringify(fake));
  // ---------- 2. layout fingerprints ----------
  const fpall=await ev(([FP,DIST,JOURNEYS])=>{const A=__A,fp=(0,eval)(FP),dist=(0,eval)(DIST),T=A.TW.get('T14'),ord0=A.G.run.order.slice(),N=A.ZONES.length;const res={};
    const build=off=>{T.off=off;const F=[];for(let i=0;i<N;i++){A.G.run.order[0]=i;A.resetMaps();F.push(fp(A.getMap('t0')));}T.off=false;return F;};
    const M=off=>{const F=build(off),D=F.map(a=>F.map(b=>+dist(a,b).d.toFixed(3)));return D;};
    try{res.on=M(false);res.off=M(true);
      // journeys: 30 drawn with newRun, the towns as they stand at each stage
      const nr=A.TW.get('newRun'),dn=Date.now,J=[];const jour=off=>{const out=[];for(let k=0;k<JOURNEYS;k++){Date.now=()=>1.7e12+k*7919001;let r;try{r=nr(0);}finally{Date.now=dn;}A.G.run=r;A.G.cleared={};A.G.sub=null;T.off=off;A.resetMaps();
        const F=[];for(let s=0;s<5;s++)F.push(fp(A.getMap('t'+s)));T.off=false;const ds=[];for(let a=0;a<5;a++)for(let b=a+1;b<5;b++)ds.push([a,b,+dist(F[a],F[b]).d.toFixed(3),A.ZS?null:null]);out.push({order:r.order.slice(),ds});}return out;};
      const run0=A.G.run;res.jon=jour(false);res.joff=jour(true);A.G.run=run0;
    }finally{T.off=false;A.G.run.order=ord0;A.resetMaps();}return res;},[FP,DIST,JOURNEYS]);
  const names=A1.rows.map(r=>r.key),N=names.length;
  const stat=D=>{let min=9,mean=0,n=0,lo=[];for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const d=D[i][j];mean+=d;n++;if(d<min)min=d;if(d<THR_FP)lo.push(names[i]+'-'+names[j]+' '+d);}return {min,mean:mean/n,lo};};
  const sOn=stat(fpall.on),sOff=stat(fpall.off);
  console.log(`layout fingerprint distance, all ${N*(N-1)/2} realm pairs (stage 0): module on min ${sOn.min.toFixed(3)} mean ${sOn.mean.toFixed(3)}; the old layouts min ${sOff.min.toFixed(3)} mean ${sOff.mean.toFixed(3)}`);
  console.log(`  pairs under ${THR_FP}: on ${sOn.lo.length}${sOn.lo.length?' ('+sOn.lo.slice(0,8).join(', ')+')':''}; old ${sOff.lo.length} of ${N*(N-1)/2}`);
  const jstat=J=>{let min=9,mean=0,n=0,lo=0,worst=null;J.forEach(j=>j.ds.forEach(([a,b,d])=>{mean+=d;n++;if(d<min){min=d;worst=j.order[a]+'/'+j.order[b];}if(d<THR_FP)lo++;}));return {min,mean:mean/n,lo,n,worst};};
  const jOn=jstat(fpall.jon),jOff=jstat(fpall.joff);
  console.log(`inside ${JOURNEYS} journeys (${jOn.n} pairs): module on min ${jOn.min.toFixed(3)} (zones ${jOn.worst}) mean ${jOn.mean.toFixed(3)}, ${jOn.lo} pairs under ${THR_FP}; the old layouts min ${jOff.min.toFixed(3)} mean ${jOff.mean.toFixed(3)}, ${jOff.lo} pairs under`);
  chk(`layouts: every two realms of every journey differ by at least ${THR_FP} (min ${jOn.min.toFixed(3)}, mean ${jOn.mean.toFixed(3)}; the old layouts: ${jOff.lo} of ${jOff.n} pairs under, min ${jOff.min.toFixed(3)})`,jOn.min>=THR_FP&&jOn.lo===0&&jOff.lo>0||JSON.stringify([jOn.min,jOn.lo,jOff.lo]));
  // the realms (not the base zones: those are the old journeys' and the Daily Trial's, never in a journey with a realm)
  const isR=i=>!names[i].startsWith('base'),rp=[],bp=[];for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){if(isR(i)&&isR(j))rp.push([i,j]);else if(!isR(i)&&!isR(j))bp.push([i,j]);}
  const lowR=rp.filter(([i,j])=>fpall.on[i][j]<THR_FP),minR=Math.min(...rp.map(([i,j])=>fpall.on[i][j])),lowRo=rp.filter(([i,j])=>fpall.off[i][j]<THR_FP).length,lowB=bp.filter(([i,j])=>fpall.on[i][j]<THR_FP),minB=Math.min(...bp.map(([i,j])=>fpall.on[i][j]));
  chk(`layouts: all ${rp.length} realm pairs differ by at least ${THR_FP} (min ${minR.toFixed(3)}); the old layouts had ${lowRo} of them under`,lowR.length===0&&lowRo>0||lowR.map(([i,j])=>names[i]+'-'+names[j]+' '+fpall.on[i][j]).join('; '));
  chk(`layouts: the ${bp.length} pairs of the six base zones (old journeys, the Daily Trial) differ by at least ${THR_FP} (min ${minB.toFixed(3)})`,lowB.length===0||lowB.map(([i,j])=>names[i]+'-'+names[j]).join('; '));
  // the pairwise table of the realms (x100), the Scourge and Calamity realms only, then the base zones
  const pad=(s,n)=>String(s).padStart(n);const ri=names.map((k,i)=>i).filter(i=>!names[i].startsWith('base'));
  console.log('pairwise layout distance x100 (module on):');console.log('           '+ri.map(i=>pad(names[i].slice(0,5),5)).join(''));
  ri.forEach(i=>console.log(names[i].padEnd(11)+ri.map(j=>i===j?pad('.',5):pad(Math.round(fpall.on[i][j]*100),5)).join('')));
  const bi=names.map((k,i)=>i).filter(i=>names[i].startsWith('base'));
  console.log('base zones (old journeys and the Daily Trial), x100:');console.log('           '+bi.map(i=>pad(names[i],5)).join(''));bi.forEach(i=>console.log(names[i].padEnd(11)+bi.map(j=>i===j?pad('.',5):pad(Math.round(fpall.on[i][j]*100),5)).join('')));
  console.log('the same realms with the old layouts, x100:');console.log('           '+ri.map(i=>pad(names[i].slice(0,5),5)).join(''));ri.forEach(i=>console.log(names[i].padEnd(11)+ri.map(j=>i===j?pad('.',5):pad(Math.round(fpall.off[i][j]*100),5)).join('')));
  // ---------- 3. silhouettes ----------
  const sil=await ev(([MASK,fams,themes])=>{const mask=(0,eval)(MASK),T=__A.TW.get('T14'),out={on:{},off:{}},kinds=[['inn',6,5],['smithy',6,5],['house',4,4]];
    fams.forEach(f=>{out.on[f]=kinds.map(([k,w,h])=>mask(f,k,w,h));});T.off=true;try{themes.forEach(t=>{out.off[t]=kinds.map(([k,w,h])=>mask(null,k,w,h,t));});}finally{T.off=false;}
    const iou=(a,b)=>{let i=0,u=0;for(let k=0;k<a.length;k++){const x=a[k],y=b[k];if(x&&y)i++;if(x||y)u++;}return u?1-i/u:0;};
    const tab=g=>{const ks=Object.keys(g),D={};ks.forEach(a=>{D[a]={};ks.forEach(b=>{D[a][b]=+(g[a].reduce((s,m,i)=>s+iou(m,g[b][i]),0)/3).toFixed(3);});});return {ks,D};};
    return {on:tab(out.on),off:tab(out.off)};},[MASK,[...famIn],['meadow','coast','cave','snow','heights','void']]);
  const sst=t=>{let min=9,mean=0,n=0,lo=[];t.ks.forEach((a,i)=>t.ks.forEach((b,j)=>{if(j<=i)return;const d=t.D[a][b];mean+=d;n++;if(d<min)min=d;if(d<THR_SIL)lo.push(a+'-'+b+' '+d);}));return {min,mean:mean/n,lo,n};};
  const so=sst(sil.on),sf=sst(sil.off);
  console.log(`silhouette distance (1 - IoU of the inn, smithy and house masks), ${so.n} family pairs: min ${so.min.toFixed(3)} mean ${so.mean.toFixed(3)}; the old six themes: min ${sf.min.toFixed(3)} mean ${sf.mean.toFixed(3)}`);
  const ks=sil.on.ks;console.log('pairwise silhouette distance x100:');console.log('           '+ks.map(k=>pad(k.slice(0,5),6)).join(''));ks.forEach(a=>console.log(a.padEnd(11)+ks.map(b=>a===b?pad('.',6):pad(Math.round(sil.on.D[a][b]*100),6)).join('')));
  console.log('the old six themes:');console.log('           '+sil.off.ks.map(k=>pad(k.slice(0,5),6)).join(''));sil.off.ks.forEach(a=>console.log(a.padEnd(11)+sil.off.ks.map(b=>a===b?pad('.',6):pad(Math.round(sil.off.D[a][b]*100),6)).join('')));
  chk(`silhouettes: every two building families differ by at least ${THR_SIL} (min ${so.min.toFixed(3)}, mean ${so.mean.toFixed(3)}); the old six themes: min ${sf.min.toFixed(3)}, mean ${sf.mean.toFixed(3)}, ${sf.lo.length} of ${sf.n} pairs under`,so.lo.length===0||so.lo.join('; '));
  // ---------- 4. 150 towns ----------
  const towns=await ev(([JOURNEYS])=>{const A=__A,T=A.TW.get('T14'),nr=A.TW.get('newRun'),dn=Date.now,run0=A.G.run,mi=A.TW.get('mapIssues'),pa=A.TW.get('pathAssets'),re=A.TW.get('healReach'),me=A.TW.get('mapEntry'),LM=A.TW.get('LM_BY_TOWN'),out={n:0,off:[],fb:T.fallback,issues:[],assets:[],audit:[],gates:[],lm:{n:0,fit:0,none:[]},doors:0,arch:{},kinds:[],err:[]};
    try{for(let k=0;k<JOURNEYS;k++){Date.now=()=>1.7e12+k*7919001;let r;try{r=nr(0);}finally{Date.now=dn;}A.G.run=r;A.G.cleared={};A.G.sub=null;A.resetMaps();
      for(let s=0;s<5;s++){const id='t'+s;let m;try{m=A.getMap(id);}catch(e){out.err.push(id+':'+e.message);continue;}out.n++;const Z=A.ZS(s),asg=T.assign(Z),tag=`j${k}/${Z.key||Z.town}`;
        out.arch[m.arch]=(out.arch[m.arch]||0)+1;if(m.arch!==asg.arch||m.sty!==asg.fam)out.off.push(tag+' '+m.arch+'/'+m.sty);
        const iss=mi(m);if(iss.length)out.issues.push(tag+' '+JSON.stringify(iss.slice(0,2)));const as=pa(m);if(as.length)out.assets.push(tag+' '+as.length);
        let au;try{au=A.W71.drawAudit(m);}catch(e){out.err.push(tag+' audit '+e.message);au=null;}if(au){const bad=['hidden','holes','apron','door'].filter(q=>au[q]&&au[q].length);if(bad.length)out.audit.push(tag+' '+bad.map(q=>q+' '+au[q].length).join(','));}
        const e=me(m),R=e?re(m,e,true,true):null,steps=m.bld.filter(b=>b.door);out.doors+=steps.length;steps.forEach(b=>{const x=b.door[0],y=b.door[1]+1;if(!(R&&R[y]&&R[y][x]))out.gates.push(tag+' door '+b.k);});
        const kinds=new Set(m.bld.map(b=>b.k));['inn','tavern','smithy','workshop','guild'].forEach(q=>{if(!kinds.has(q))out.kinds.push(tag+' no '+q);});
        // gates: an exit on the west and east edge, the gate records' arrival tiles open and reached
        const W=m.t[0].length,ex=m.exits||[];if(!ex.some(q=>q.x===W-1||q.y===0||q.y===m.t.length-1||(q.x===0&&q.to&&q.to.m==='f'+s)))out.gates.push(tag+' no way on');/* v0.21.x: the way on can be the west gate (plan revision 3, world16.js) */
        Object.entries(m.gates||{}).forEach(([n,g])=>{if(!g||!g.arrive)return;const [x,y]=g.arrive;if(A.SOLID.includes(m.t[y][x])||!(R&&R[y]&&R[y][x]))out.gates.push(tag+' gate '+n+' '+x+','+y);});
        const L=LM[Z.town];if(L){out.lm.n++;if(m.lm){const en=A.TW.get('lmEntries')(m)[0],cx=m.lm.x+1,Wm=m.w,Hm=m.h,cl=Math.max(0,Math.min(Wm-26,en.x+.5-13)),ct=Math.max(0,Math.min(Hm-10,en.y+.5-5)),ov=Math.max(0,cl-(cx-1.75))+Math.max(0,(cx+1.75)-(cl+26))+Math.max(0,ct-(m.lm.y+2-5.6))+Math.max(0,(m.lm.y+2)-(ct+10));if(ov===0)out.lm.fit++;}else out.lm.none.push(tag);}
        if(m.bld.some(b=>b.x<1||b.y<1||b.x+b.w>W-1||b.y+b.h>m.t.length-1))out.kinds.push(tag+' building out of bounds');}}
    }finally{Date.now=dn;A.G.run=run0;A.resetMaps();}out.fb=T.fallback-out.fb;return out;},[JOURNEYS]);
  console.log(`towns checked: ${towns.n}; layouts met: ${Object.entries(towns.arch).map(([k,v])=>k+' x'+v).join(', ')}`);
  chk(`${towns.n} towns (${JOURNEYS} journeys x 5), every one on its own layout and family, none fell back to the old layout (${towns.fb} fallbacks)`,towns.n===JOURNEYS*5&&!towns.off.length&&towns.fb===0&&!towns.err.length||JSON.stringify([towns.n,towns.off.slice(0,3),towns.fb,towns.err.slice(0,2)]));
  chk(`mapIssues 0 in every town`,!towns.issues.length||towns.issues.slice(0,3).join('; '));
  chk(`nothing blocks a path (pathAssets) in any town`,!towns.assets.length||towns.assets.slice(0,3).join('; '));
  chk(`drawAudit clean in every town: no blocker that shows nothing, no hole in a building, no decor on a door apron`,!towns.audit.length||towns.audit.slice(0,4).join('; '));
  chk(`every door step reached (${towns.doors} doors), the gates present, open and reached`,!towns.gates.length||towns.gates.slice(0,4).join('; '));
  chk(`every town has an inn, a tavern, a smithy, an alchemy and a guild hall, all inside the walls`,!towns.kinds.length||towns.kinds.slice(0,4).join('; '));
  chk(`the landmark stands in the entry's 26 x 10 tile window: ${towns.lm.fit} of ${towns.lm.n} towns with one (>= 75%; none placed: ${towns.lm.none.length})`,towns.lm.fit===0/* 0.21.7: towns have no landmark */||JSON.stringify(towns.lm));
  // ---------- 5. both renderers ----------
  const hdk=await ev(()=>{const A=__A,T=A.TW.get('T14'),hk=A.TW.get('hdBldKind'),pr=A.TW.get('hdRoofProf'),out={};Object.keys(T.fam).forEach(f=>{const m={sty:f,theme:'meadow'},b={k:'inn'};out[f]=[hk(m,b),+pr(m,b).toFixed(2)];});
    const base=hk({theme:'meadow'},{k:'inn'}),p0=pr({theme:'meadow'},{k:'inn'});return {out,base,p0};});
  const kinds=new Set(Object.values(hdk.out).map(v=>v[0])),pitches=new Set(Object.values(hdk.out).map(v=>v[1]));
  console.log('HD-2D body and roof pitch per family: '+Object.entries(hdk.out).map(([f,v])=>f+' '+v[0]+(v[0]==='roof'?' x'+v[1]:'')).join(', '));
  // 0.20.10: cohere15 lowers every HD-2D roof to .78 of its pitch (hdk.ch15), so the base pitch is .78 with the Unified look on
  hdk.ch15=await ev(()=>window.__CH15&&window.__CH15.on()?.78:1);
  chk(`HD-2D bodies by family: ${[...kinds].join(', ')} (a gabled box, a flat topped box, a cone) and ${pitches.size} roof pitches; without a family the old body (${hdk.base}, pitch ${hdk.p0})`,kinds.size===3&&pitches.size>=6&&hdk.base==='roof'&&Math.abs(hdk.p0-(hdk.ch15||1))<1e-9||JSON.stringify(hdk));
  const rend=async(g,w,h)=>{const H2=await open({w,h,mobile:false,pre:PRE(g)});await H2.ev(START);await H2.wait(400);if(g==='high')await H2.until(()=>__A.HD&&__A.HD.live,null,{timeout:20000});
    const zs=await H2.ev(()=>{const A=__A,T=A.TW.get('T14'),seen={},list=[];A.ZONES.forEach((z,i)=>{const a=T.assign(z);if(!seen[a.fam]){seen[a.fam]=1;list.push([i,a.fam,z.key||('base'+i)]);}});return list;});
    const errs=[];for(const [i,fam,key] of zs){await H2.ev(([i])=>{const A=__A;A.G.run.order[0]=i;A.G.run.rv=2;A.G.cleared={};A.resetMaps();const m=A.getMap('t0');A.placeAt('t0',Math.floor(m.t[0].length/2),m.road+1,'r');A.rebuildBase&&A.rebuildBase();A.V.modal=null;A.render();},[i]);
      await H2.wait(g==='high'?1500:700);const r=await H2.ev(()=>{const A=__A;return {sty:A.WS.m.sty,hd:A.HD&&A.HD.live,err:A.HD&&A.HD.lmErr||null,bsp:(A.WS.m.bsp||[]).length};});
      if(r.sty!==fam||(g==='high'&&!r.hd)||r.err||!r.bsp)errs.push(key+' '+JSON.stringify(r));if(SH){fs.mkdirSync(SH,{recursive:true});await H2.page.screenshot({path:`${SH}/v183a_${g}_${key}.png`});}}
    const pe=await H2.ev(()=>({wd:(window.__A.WD&&window.__A.WD.log)||null}));await H2.browser.close();return {n:zs.length,errs,pe};};
  const hd=await rend('high',1000,560);chk(`HD-2D (High): a town of each of the ${hd.n} building families draws (a body per building, HD live) with no error`,!hd.errs.length||hd.errs.slice(0,3).join('; '));
  const fl=await rend('low',1000,560);chk(`flat (Low): a town of each of the ${fl.n} building families draws with no error`,!fl.errs.length||fl.errs.slice(0,3).join('; '));
  // frame cost: the same town drawn alternately with the module on and off (v170a style: the frames drawn with synthetic times, medians)
  const perf=async g=>{const H2=await open({w:1000,h:560,mobile:false,pre:PRE(g)});await H2.ev(START);await H2.wait(400);if(g==='high')await H2.until(()=>__A.HD&&__A.HD.live,null,{timeout:20000});
    const r=await H2.ev(async([g])=>{const A=__A,T=A.TW.get('T14'),wd=A.TW.get('worldDraw'),out={on:[],off:[]},ids=[1,10,13,16,22];const med=a=>{a=a.slice().sort((x,y)=>x-y);return a[a.length>>1];};
      const draw=async(off,i)=>{T.off=off;A.G.run.order[0]=i;A.G.run.rv=2;A.G.cleared={};A.resetMaps();const m=A.getMap('t0');A.placeAt('t0',Math.floor(m.t[0].length/2),m.road+1,'r');A.rebuildBase&&A.rebuildBase();A.render();
        await new Promise(r=>setTimeout(r,g==='high'?900:400));let t=performance.now()+9e4;const ts=[];for(let k=0;k<50;k++){const a=performance.now();wd(t+=16.7);ts.push(performance.now()-a);}return med(ts.slice(10));};
      try{for(let rep=0;rep<3;rep++)for(const i of ids){out.on.push(await draw(false,i));out.off.push(await draw(true,i));}}finally{T.off=false;}
      // the cost of building a town (map generation, the baked ground and the building sprites): the same realms, module on and off
      const bt=[[],[]];try{for(let rep=0;rep<3;rep++)for(const i of ids)[false,true].forEach((off,k)=>{T.off=off;A.G.run.order[0]=i;A.G.cleared={};A.resetMaps();const t0=performance.now();const m=A.getMap('t0');A.placeAt('t0',Math.floor(m.t[0].length/2),m.road+1,'r');A.rebuildBase&&A.rebuildBase();bt[k].push(performance.now()-t0);});}finally{T.off=false;}
      return {on:med(out.on),off:med(out.off),bon:med(bt[0]),boff:med(bt[1]),a:out.on.map(v=>+v.toFixed(2)),b:out.off.map(v=>+v.toFixed(2))};},[g]);await H2.browser.close();return r;};
  for(const g of ['low','high']){const p=await perf(g);console.log(`frame cost (${g}): median ${p.on.toFixed(2)} ms with the module, ${p.off.toFixed(2)} ms without`);
    chk(`${g==='high'?'HD-2D High':'flat Low'} frame cost within noise: ${p.on.toFixed(2)} ms against ${p.off.toFixed(2)} ms (limit: 1.25 x + 0.6 ms)`,p.on<=p.off*1.25+.6||JSON.stringify(p));
    console.log(`town build (${g}): median ${p.bon.toFixed(1)} ms with the module, ${p.boff.toFixed(1)} ms without`);chk(`${g==='high'?'HD-2D High':'flat Low'} town build cost: ${p.bon.toFixed(1)} ms against ${p.boff.toFixed(1)} ms (limit: 1.5 x + 25 ms)`,p.bon<=p.boff*1.5+25||JSON.stringify(p));}
  // ---------- 6. the old behaviour is still there ----------
  const old=await ev(()=>{const A=__A,T=A.TW.get('T14'),ord0=A.G.run.order.slice(),out={};T.off=true;try{for(const i of [0,1,2,3,4,5]){A.G.run.order[0]=i;A.resetMaps();const m=A.getMap('t0');out[i]=[m.arch||null,m.sty||null,m.bld.length];}}finally{T.off=false;A.G.run.order=ord0;A.resetMaps();}
    return {out,tg:Object.keys(A.TW.get('TOWNGEN')),hasGen:typeof A.TW.get('townGen')==='function'};});
  const keep=await ev(()=>{const A=__A,ord0=A.G.run.order.slice(),t=A.G.run.t14,out={};try{A.G.run.t14=0;A.G.run.order[0]=7;A.resetMaps();const m=A.getMap('t0');out.old=[m.arch||null,m.sty||null,m.bld.length];A.G.run.t14=1;A.resetMaps();const n=A.getMap('t0');out.neu=[n.arch,n.sty];}finally{A.G.run.t14=t;A.G.run.order=ord0;A.resetMaps();}return out;});
  chk(`a journey started before this pass (no t14 flag) keeps the old town of its realm (${JSON.stringify(keep.old)}); a new one gets ${keep.neu&&keep.neu.join('/')}`,keep.old[0]===null&&keep.old[1]===null&&keep.neu[0]==='street'&&keep.neu[1]==='cider'||JSON.stringify(keep));
  chk(`module off: the six theme layouts (${old.tg.join(', ')}) and the old building drawing are back (no layout or family tag)`,old.tg.length===6&&old.hasGen&&Object.values(old.out).every(v=>v[0]===null&&v[1]===null&&v[2]>=6)||JSON.stringify(old));
  await done(H);
})();
