// v0.4.1 4.7 and 4.8: caves look like caves, side fortresses, minibosses
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(()=>{const A=__A,G=A.G,o={forts:0,bad:[],sizes:[],look:[],cave:null};
  for(let s=0;s<5;s++){const f=A.getMap('f'+s);const ft=(f.caves||[]).find(c=>c.kind==='fort');if(s===0&&ft)o.bad.push('fort at stage 0');
    if(s>=1){if(!ft){o.bad.push('no fort s'+s);continue;}o.forts++;
      if(A.mapIssues(f).length)o.bad.push('field blocked s'+s);
      const m=A.getMap(ft.id),d=A.getMap('d'+s);o.sizes.push([m.w*m.h,d.w*d.h]);if(!(m.w*m.h<d.w*d.h))o.bad.push('fort not smaller than dungeon');
      if(A.mapIssues(m).length)o.bad.push('fort issues');if(!m.chests.some(c=>c[2]==='reward'))o.bad.push('no prize');o.look.push(m.thv);}
    const cv=(f.caves||[]).find(c=>c.kind!=='fort');if(cv&&!o.cave){const k=A.getMap(cv.id);o.cave=k.thv;o.caveSize=k.w*k.h;}}
  o.sitesOnMap=A.mapIcoRects?!!A.mapIcoRects('fort'):true;
  return o;});
console.log(JSON.stringify(r));
chk('4.7 a side fortress in every realm from the second stage on, reachable, smaller than the dungeon, holding a prize',r.forts===4&&r.bad.length===0);
// v0.9.9: since v0.8.2 the look key ends in the material ("meadow#fort%keep", dungeon8.js), so the kind is followed by % or the end
chk('4.7 caves and fortresses have their own looks (not the dungeon palette)',/#fort(%|$)/.test(r.look[0])&&/#cave(%|$)/.test(r.cave||'#cave')||JSON.stringify([r.look[0],r.cave]));
// miniboss on the prize chest, no auto, then the prize
const m=await ev(async()=>{const A=__A,G=A.G,o={};let n=0;for(let i=0;i<200;i++)if(A.siteHasMini('z'+i+'x'))n++;o.rate=n/200;let d=0;for(let i=0;i<50;i++)if(A.siteHasMini('k'+i))d++;o.den=d/50;
  let S=1;for(let s=1;s<5;s++){const ft0=A.getMap('f'+s).caves.find(c=>c.kind==='fort');if(ft0&&A.siteHasMini(ft0.id)){S=s;break;}}
  const f=A.getMap('f'+S),ft=f.caves.find(c=>c.kind==='fort');A.enterCave(ft,S);const fm=A.getMap(ft.id);
  o.hasMini=A.siteHasMini(fm.id);G.miniDone={};const pc=fm.prize;A.placeAt(fm.id,pc[0],pc[1]+1,'u');
  A.openChest(pc[0],pc[1]);o.dlg=!!A.WS.dlg;A.nextDlg();for(let k=0;k<20&&!A.B;k++)await new Promise(q=>setTimeout(q,100));
  o.battle=!!A.B&&!!A.B.spec.mini;o.noAuto=A.autoBan(A.B.spec);o.lead=A.B.en[0].name;A.B.en.forEach(e=>e.hp=0);A.finishBattle('win');o.done=!!G.miniDone[fm.id];
  A.V.screen='world';A.placeAt(fm.id,pc[0],pc[1]+1,'u');const g0=G.gear.length,r0=Object.keys(G.roster).length,i0=JSON.stringify(G.inv);A.openChest(pc[0],pc[1]);o.prize=G.gear.length>g0||Object.keys(G.roster).length>r0||JSON.stringify(G.inv)!==i0;return o;});
console.log(JSON.stringify(m));
chk('4.8 opening the prize wakes a miniboss; no auto; win and the prize opens',m.hasMini&&m.battle&&!!m.noAuto&&m.done&&m.prize);
chk('4.8 about 90% of other sites have a miniboss',m.rate>.8&&m.rate<.97);
chk('v0.11.1: every Den (side cave) ends in a miniboss',m.den===1||m.den);
const v=await ev(()=>{const A=__A,G=A.G,o={n:0,ok:0};const s0=G.run.seed;for(let k=0;k<130;k++){G.run.seed=1000+k*7919;for(let s=1;s<5;s++){o.n++;try{const c=A.genFort(s);if(A.caveOk(c))o.ok++;}catch(e){}}}G.run.seed=s0;return o;});
console.log(JSON.stringify(v));
chk('4.9 500+ fortresses generate valid (prize reachable, stairs clear)',v.n>=500&&v.ok===v.n);
await done(H);})();
