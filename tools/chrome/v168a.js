// v0.18.7 world12.js: the ten requests after v0.18.6.
//  1 every town has a landmark of its own (silhouette and colour), placed on open ground where the entry sees it, drawn in 2D and HD-2D, named in the intro
//    and on the Waystone row, read when faced, with no new blocked door or pocket          2 the phone pad is under every text box (dialog, modal)
//  3 the Echo Rift hall has no solid tile that shows nothing                               4 gathering nodes never share a chest tile and are always reachable
//  5 a Rift gate lights in the colour of the boss behind it, the HD-2D cache key carries it 6 no "(relit)" on the Breach
//  7 the north and south walk frames of every rig have a real stride                      8 wild recruit events: spacing, a budget per realm, dual types later (sim)
//  9 each realm's own Scourge, its element one of the realm's                              10 "Echo Dimmer", never "Echo The Dimmer"
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v168a.js   (SHOTS=<dir> also saves a 1000x560 shot of every town, HD-2D and flat)
const {open,chk,done}=require('./pw');
const fs=require('fs');
const start=H=>H.det(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.META.cfg.hints=false;A.V.modal=null;A.render();},[],5);
const gfx=(H,g)=>H.ev(g=>{const A=__A;A.META.cfg.gfx=g;A.TW.get('applyCfg')();A.render();},g);
(async()=>{
const H=await open({w:1000,h:560});await start(H);
const cmp=(x,y)=>H.ev(([x,y])=>new Promise(res=>{const L=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s;});Promise.all([L(x),L(y)]).then(([p,q])=>{const c=document.createElement('canvas');c.width=p.width;c.height=p.height;const g=c.getContext('2d');g.drawImage(p,0,0);const A=g.getImageData(0,0,c.width,c.height).data;g.clearRect(0,0,c.width,c.height);g.drawImage(q,0,0);const B=g.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<A.length;i+=4)if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>40)n++;res(n);});}),[x.toString('base64'),y.toString('base64')]);
// two shots of the same view built two ways (the second with the thing taken out before the map is drawn): the number of pixels that differ
const shotDiff=async(setA,setB,arg)=>{await H.ev(setA,arg);await H.frames(30);await H.wait(500);const a=await H.page.screenshot();await H.ev(setB,arg);await H.frames(30);await H.wait(500);const b=await H.page.screenshot();return cmp(a,b);};
// ---------------- 10. echo names ----------------
const en=await H.ev(()=>{const T=__A.TW.get,o={bad:[],n:0,fn:T('echoName')('The Dimmer'),fn2:T('echoName')({n:'Siren of the Deep'}),fn3:T('echoName')('Hoarwyrm')};
  T('echoKeys')().forEach(k=>{const d=T('guardianDef')(k),e=T('makeEcho')(k,50);o.n++;if(/^Echo\s+the\s/i.test(e.name)||e.name!==T('echoName')(d))o.bad.push(e.name);});
  const ren=T('renameBest')({'Echo The Dimmer':{seen:1,kills:3,scan:0,known:{}},'Echo Hoarwyrm':{seen:1,kills:1,scan:0,known:{}}});
  const m=__A.getMap('s0');o.gates=m.npcs.filter(n=>n.portal&&!n.forge).map(n=>n.name);o.rec=ren;return o;});
chk(`echoName drops the leading "the": '${en.fn}', '${en.fn2}', '${en.fn3}'`,en.fn==='Echo Dimmer'&&en.fn2==='Echo Siren of the Deep'&&en.fn3==='Echo Hoarwyrm');
chk(`all ${en.n} Echoes are named by echoName (no "Echo The ..."): ${en.bad.join('|')||'ok'}`,en.n===25&&!en.bad.length);
chk('Rift gate names have no "Echo The"/"Echo the" ('+en.gates.filter(n=>/Dimmer|Crow|Locust/.test(n)).join(', ')+')',en.gates.length>=25&&!en.gates.some(n=>/Echo the /i.test(n)));
chk('records kept under "Echo The Dimmer" move to "Echo Dimmer" (kills 3), the others stay',!!en.rec['Echo Dimmer']&&en.rec['Echo Dimmer'].kills===3&&!en.rec['Echo The Dimmer']&&en.rec['Echo Hoarwyrm'].kills===1);
// ---------------- 9. realm bosses ----------------
const rb=await H.ev(()=>{const T=__A.TW.get,R=T('REALMS'),o={miss:[],el:[],cal:[],uniq:0,off:0,var:{},rb:0,n:0};const G=T('GPOOL'),F=T('FPOOL');
  R.forEach(r=>{if(!r.boss){o.miss.push(r.key);return;}[r.boss].concat(r.alt||[]).forEach(k=>{const d=T('guardianDef')(k);if(!d){o.miss.push(r.key+':'+k);return;}if(!r.els.includes(d.el[0]))o.el.push(r.key+':'+k+' '+d.el[0]);if(r.cal?!F.includes(k):!G.includes(k))o.cal.push(r.key+':'+k);});});
  for(let i=0;i<150;i++){const run=T('newRun')(0);o.n++;const ok=run.rv===2&&run.order.slice(0,4).every((z,j)=>run.bosses[j]===R[z-T('REALM_BASE')].boss)&&run.final===R[run.order[4]-T('REALM_BASE')].boss;if(!ok)o.off++;if(run.rb)o.rb++;if(new Set(run.bosses.concat([run.final])).size!==5)o.uniq++;}
  const seen={};for(let i=0;i<300;i++){const run=T('newRun')(1);run.order.forEach((z,j)=>{const r=R[z-T('REALM_BASE')],k=j<4?run.bosses[j]:run.final;if(![r.boss].concat(r.alt||[]).includes(k))o.off++;(seen[r.key]=seen[r.key]||new Set()).add(k);});}
  o.varied=Object.keys(seen).filter(k=>seen[k].size>1).length;return o;});
chk(`every realm has a Scourge (a Calamity in the five Calamity realms) and alternates: ${rb.miss.join(',')||'all 17'}`,!rb.miss.length&&!rb.cal.length||JSON.stringify([rb.miss,rb.cal]));
chk(`the first element of every boss and alternate is one of its realm's elements (${rb.el.length?rb.el.join('; '):'all'})`,!rb.el.length);
chk(`150 new journeys: each stage's boss is its realm's own (${rb.off} off), journey marked (${rb.rb}/150), none twice (${rb.uniq} repeats)`,rb.off===0&&rb.rb===150&&rb.uniq===0);
chk(`New Game+ keeps the variety: ${rb.varied} realms drew an alternate in 300 journeys and stayed inside boss/alt`,rb.varied>=8&&rb.off===0);
// ---------------- 5. rift gate colours ----------------
const gc=await H.ev(()=>{const A=__A,T=A.TW.get,G=A.G,keys=T('echoKeys')(),cols=keys.map(k=>T('riftGateCol')(k)),h=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),o={n:keys.length,min:1e9,pair:'',el:0};
  for(let i=0;i<cols.length;i++)for(let j=i+1;j<cols.length;j++){const a=h(cols[i]),b=h(cols[j]),d=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);if(d<o.min){o.min=Math.round(d);o.pair=keys[i]+'/'+keys[j];}}
  keys.forEach(k=>{if(cols[keys.indexOf(k)]===T('ELC')[T('guardianDef')(k).el[0]])o.el++;});o.rk=T('RIFT_COL');return o;});
chk(`25 gates, 25 colours from the boss (RIFT_COL), the closest pair ${gc.pair} is ${gc.min} apart (>= 40); only ${gc.el} equal a plain element colour`,gc.n===25&&Object.keys(gc.rk).length===25&&gc.min>=40&&gc.el<=6);
// HD-2D cache key
await gfx(H,'medium');
const hk=await H.ev(()=>{const A=__A,T=A.TW.get,G=A.G;G.won=true;G.echoStory={0:1,1:1,2:1,3:1,4:1};A.META.echoRift=true;G.riftWon={};T('echoKeys')().forEach(k=>{G.riftWon[k]=1;});A.getMap('s0');A.placeAt('s0',16,20,'u');A.V.modal=null;A.render();return 1;});
await H.frames(30);await H.wait(600);
const ks=await H.ev(()=>{const F=__A.TW.get('H2F'),E=__A.TW.get('echoKeys')();return Object.keys(F).filter(k=>E.includes(k.split(':')[1]));});
const colored=ks.filter(k=>/portal:[a-z]+:#[0-9a-f]{6}:/.test(k));
chk(`HD-2D portal cache keys of the Echo gates carry the gate colour (${colored.length} of ${ks.length}: ${ks[0]})`,ks.length>=20&&colored.length===ks.length);
// ---------------- 3. rift hall ----------------
const hall=await H.ev(()=>{const A=__A,T=A.TW.get,m=A.getMap('s0'),o={solidEmpty:[],chars:'',hid:null,w:m.w,h:m.h};const seen={};
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=m.t[y][x];seen[c]=1;const npc=m.npcs.some(n=>n.x===x&&n.y===y);if(A.solidAt(m,x,y)&&!npc&&!'#vPSE'.includes(c))o.solidEmpty.push(c+x+','+y);}
  o.chars=Object.keys(seen).sort().join('');const au=A.W71.drawAudit(m);o.hid=au.hidden.map(h=>h.c+h.x+','+h.y+' '+h.why);o.signs=Object.keys(m.signs).length;
  // every solid tile char the hall uses has art in the dungeon draw pass: drawn by drawObjects (2D) and listed in H2_OBJ (HD-2D) or an actor (v braziers, gates)
  o.h2=T('H2_OBJ');return o;});
chk(`Rift hall: no solid tile that shows nothing in 2D (${hall.hid.length?hall.hid.join('; '):'0 hidden'}) and no solid floor tile left (${hall.solidEmpty.length})`,!hall.hid.length&&!hall.solidEmpty.length);
chk(`Rift hall tiles are only "${hall.chars}" and the bay signs (S, ${hall.signs}) are in the HD-2D prop set`,/^[#.EPSv]+$/.test(hall.chars)&&hall.h2.includes('S')&&hall.signs===5);
// both renderers get their props from drawObjects (2D bakes the base with it, HD-2D cuts its prop cards from the same rows): the sign tile must paint pixels there
const sg=await H.ev(()=>{const A=__A,T=A.TW.get,m=A.getMap('s0'),cv=document.createElement('canvas');cv.width=m.w*16;cv.height=64;const x=cv.getContext('2d');x.setTransform(1,0,0,1,0,-(9*16-58));T('drawObjects')(x,m,8);x.setTransform(1,0,0,1,0,0);
  const d=x.getImageData(16*16,0,16,64).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>40)n++;return {n,h2:T('H2_OBJ').includes('S')};});
chk(`the Rift sign at (16,8) paints ${sg.n} pixels in the shared prop pass (2D base and the HD-2D prop cards both use it)`,sg.n>60&&sg.h2);
// ---------------- 4. nodes ----------------
const nd=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get,o={maps:0,bad:0,ex:[],auditNodes:0,withNodes:0};const seed0=G.run.seed,ord0=G.run.order.slice(),NZ=A.ZONES.length;
  for(let k=0;k<45;k++){G.run.seed=k*7919+101;G.run.order=ord0.map((z,i)=>(k*5+i*7)%NZ);G.sub=null;A.resetMaps();
   for(let s=0;s<5;s++){const f=A.getMap('f'+s),ids=['f'+s,'d'+s];(f.caves||[]).forEach(c=>ids.push(c.id));for(const id of ids){const m=A.getMap(id);o.maps++;if(m.nodes&&m.nodes.length)o.withNodes++;const iss=T('nodeIssues')(m),au=A.W71.drawAudit(m);o.auditNodes+=(au.nodes||[]).length;if(iss.length){o.bad+=iss.length;if(o.ex.length<4)o.ex.push(id+' '+JSON.stringify(iss[0]));}}}}
  G.run.seed=seed0;G.run.order=ord0;A.resetMaps();
  // the sweep catches it and the fix moves it: a herb on a chest tile, a herb in a sealed pocket
  const m=A.getMap('f0'),ch=(m.chests||[])[0];const out={};
  if(ch){const n0=m.nodes.length;m.nodes.push({x:ch[0],y:ch[1],k:'herb'});const a=A.W71.drawAudit(m).nodes.filter(q=>q.why==='chest').length;const fx=T('nodeFix')(m);out.chest=[a,fx.length,T('nodeIssues')(m).length,m.nodes.length-n0];}
  const s=m.start||T('mapEntry')(m);let pocket=null;const W=m.t[0].length,H2=m.t.length;
  for(let y=3;y<H2-3&&!pocket;y++)for(let x=3;x<W-3;x++){if(m.t[y][x]==='.'&&[[0,1],[0,-1],[1,0],[-1,0]].every(([a,b])=>m.t[y+b][x+a]==='.')&&Math.abs(x-s[0])+Math.abs(y-s[1])>8){pocket=[x,y];break;}}
  if(pocket){const sv=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]].map(([a,b])=>[pocket[0]+a,pocket[1]+b,m.t[pocket[1]+b][pocket[0]+a]]);sv.forEach(([x,y])=>{m.t[y][x]='T';});m.nodes.push({x:pocket[0],y:pocket[1],k:'herb'});
   const a=T('nodeIssues')(m).filter(q=>q.why==='unreachable').length,fx=T('nodeFix')(m);out.pocket=[a,fx.length,T('nodeIssues')(m).length];sv.forEach(([x,y,c])=>{m.t[y][x]=c;});}
  o.out=out;return o;});
chk(`${nd.maps} field, cave and dungeon maps (${nd.withNodes} with nodes): no node on a chest, a prop or an unreachable tile (${nd.bad}; ${nd.ex.join(' | ')})`,nd.bad===0&&nd.withNodes>=nd.maps*.6);
chk(`drawAudit reports no node problem on any of them (${nd.auditNodes}) and does report the two made ones`,nd.auditNodes===0&&nd.out.chest&&nd.out.chest[0]===1&&nd.out.pocket&&nd.out.pocket[0]===1);
chk(`the fix moves a herb off a chest (found ${nd.out.chest&&nd.out.chest[0]}, moved ${nd.out.chest&&nd.out.chest[1]}, left ${nd.out.chest&&nd.out.chest[2]}) and out of a sealed pocket (found ${nd.out.pocket&&nd.out.pocket[0]}, moved ${nd.out.pocket&&nd.out.pocket[1]}, left ${nd.out.pocket&&nd.out.pocket[2]})`,nd.out.chest&&nd.out.chest[1]===1&&nd.out.chest[2]===0&&nd.out.pocket&&nd.out.pocket[1]>=1&&nd.out.pocket[2]===0);
// ---------------- 6. the Breach ----------------
const br=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get;G.won=true;G.cleared=[true,true,true,true,true];A.resetMaps();const o={};
  A.placeAt('x0',2,22,'r');T('showLocation')();o.breach=A.WS.locN;
  const f=A.getMap('f0');A.placeAt('f0',3,f.sy!=null?f.sy:5,'r');T('showLocation')();o.field=A.WS.locN;
  A.V.modal={type:'travel'};A.render();const br=document.querySelector('#modal .breachrow');o.row=br?br.textContent.replace(/\s+/g,' ').trim():'';A.V.modal=null;
  const m=A.getMap('x0');o.marks=T('mapMarks')(m).map(q=>q.n||q.k).join(',');o.mini=T('locName')(m);return o;});
chk(`the Breach's banner has no "(relit)" ('${br.breach}') while a cleared field still does ('${br.field}')`,!/relit/i.test(br.breach)&&/relit/.test(br.field));
chk(`the Waystone list's Breach row (${br.row}), its name and its markers carry no "(relit)"`,/Meridian Breach/.test(br.row)&&!/relit/i.test(br.row)&&!/relit/i.test(br.mini)&&!/relit/i.test(br.marks));
// ---------------- 7. walk frames ----------------
const lg=await H.ev(()=>{const A=__A,T=A.TW.get,TPL=T('TPL'),o={rows:0,bad:[],townLow:[],minR:9,minLift:99,vill:0,stride:T('HSTRIDE')};
  const px=cv=>{const w=cv._rw||cv.width,h=cv._rh||cv.height;return {w,h,d:cv.getContext('2d').getImageData(0,0,w,h).data};};
  // (a) change: between any two frames of the 3 frame cycle, the share of the lower 30% of the figure that changes; the robe rigs (v0.17.1) score .36 to .6
  const zone=(a,b)=>{let n=0,tot=0;const y0=Math.round(a.h*.7);for(let y=y0;y<a.h;y++)for(let x=0;x<a.w;x++){const i=(y*a.w+x)*4;if(a.d[i+3]||b.d[i+3])tot++;if(a.d[i]!==b.d[i]||a.d[i+1]!==b.d[i+1]||a.d[i+2]!==b.d[i+2]||a.d[i+3]!==b.d[i+3])n++;}return n/Math.max(1,tot);};
  // (b) lift: how far the swing foot's lowest pixel rises above the rest pose, in rows of the 2x sprite
  const bottoms=a=>{const o=[0,0],half=a.w/2;for(let y=a.h-1;y>=0&&(!o[0]||!o[1]);y--)for(let x=Math.round(a.w*.3);x<Math.round(a.w*.7);x++){if(a.d[(y*a.w+x)*4+3]>200){const k=x<half?0:1;if(!o[k])o[k]=y;}}return o;};// the two legs only (the middle 40%): a hanging bucket or a rod tip is not a foot
  const audit=(name,L,els,id,key)=>{let ratio=9,lf=99;['front','back'].forEach(v=>{const c=[0,1,2].map(f=>px(T('walkerCanvas')(key,L,els,id,v,f)));ratio=Math.min(ratio,zone(c[0],c[1]),zone(c[0],c[2]),zone(c[1],c[2]));const b=c.map(bottoms);
      lf=Math.min(lf,Math.max(b[0][0]-b[1][0],b[0][1]-b[1][1]),Math.max(b[0][0]-b[2][0],b[0][1]-b[2][1]));});
    o.rows++;if(ratio<o.minR)o.minR=ratio;const need=L.b!=='robe';if(need&&lf<o.minLift)o.minLift=lf;
    if(ratio<.27||(need&&lf<6))o.bad.push(name+' ('+L.b+((L.back||[]).includes('cape')?' cape':'')+') change '+ratio.toFixed(2)+' lift '+lf);};
  Object.keys(TPL).forEach(id=>{const t=TPL[id];if(t.mon)return;audit(id,T('heroLook')(id),t.el,id,id+'_a');});
  const seen={};for(let s=0;s<23;s++){A.G.run.order[0]=s;A.G.run.seed=900+s;A.resetMaps();const m=A.getMap('t0');(m.npcs||[]).forEach(n=>{if(!n.look||seen[n.name])return;seen[n.name]=1;o.vill++;audit(n.name,Object.assign({},n.look,{prop:null}),['light'],null,'npc:'+n.name+s)});}
  A.resetMaps();return o;});
chk(`${lg.rows} hero and townsfolk rigs (${lg.vill} townsfolk): the swing foot rises at least 6 rows of the 2x sprite (3 of the figure) on the north and south frames (least ${lg.minLift}, stride ${lg.stride} rows) and every frame pair changes at least 27% of the legs (least ${lg.minR.toFixed(2)}); failing: ${(()=>{const c={};lg.bad.forEach(b=>{const k=b.replace(/^.*\(/,'(').replace(/\).*$/,')');c[k]=(c[k]||0)+1;});return lg.bad.length?JSON.stringify(c)+' eg '+lg.bad.slice(0,3).join('; '):'none';})()}`,lg.bad.length===0&&lg.rows>=150&&lg.stride>=4);
// ---------------- 8. wild recruits ----------------
const wr=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get,WREC=T('WREC'),WR=T('WR');let seed=777;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const mr=Math.random;Math.random=rnd;const o={};
  try{
  // the rules
  G.wrec={st:0,bt:0,n:{},tot:0,last:-1};o.first=T('wrAllow')(1);G.wrec.st=WREC.firstSteps;o.firstOk=T('wrAllow')(1);T('wrNote')(1,'ce');o.after=T('wrAllow')(1);
  G.wrec.st=WREC.minSteps;o.stepsOnly=T('wrAllow')(1);G.wrec.bt=WREC.minBattles;o.both=T('wrAllow')(1);T('wrNote')(1,'ce');G.wrec.st=999;G.wrec.bt=99;o.budget1=T('wrAllow')(1);o.budget2=T('wrAllow')(2);
  G.wrec={st:999,bt:99,n:{},tot:WREC.total,last:-1};o.cap=T('wrAllow')(3);
  const runJourney=(mode,steps)=>{G.roster=Object.assign({},G.roster);G.wrec={st:0,bt:0,n:{},tot:0,last:-1};G.ce={st:0,last:'',cnt:{},met:{},fr:{},helped:0,boost:{},duels:0,deals:0};const ev=[],taken=[];let gstep=0;
   for(let s=0;s<5;s++){G.stage=s;const m={id:'f'+s,s,kind:'field',cave:false,exits:[]},cnt={};
    for(let k=0;k<steps;k++){gstep++;G.wrec.st++;G.ce.st++;if(rnd()<1/41)G.wrec.bt++;const mp='m'+Math.floor(k/(steps/3));
     if(G.ce.st>=T('CE_GAP')&&(cnt[mp]||0)<T('CE_AREA_CAP')&&(mode==='old'||T('wrAllow')(s))&&rnd()<T('CE_ODDS')){const h=T('cePick')(m);if(h){G.ce.st=0;cnt[mp]=(cnt[mp]||0)+1;if(mode!=='old')T('wrNote')(s,'ce');else{G.wrec.st=0;G.wrec.bt=0;}ev.push({s,step:gstep,dual:T('wrDual')(h)});if(rnd()<.75){G.roster[h]={id:h};taken.push(h);}}}
     [[.45,'cave'],[.7,'fort']].forEach(([f,kind])=>{if(k===Math.floor(steps*f)&&rnd()<.5){WR.gate=mode==='old'?0:1;let pool;try{pool=T('caveRecruitPool')(s);}finally{WR.gate=0;}pool=pool.filter(h=>!G.roster[h]);if(pool.length){const h=pool[Math.floor(rnd()*pool.length)];if(mode!=='old')T('wrNote')(s,kind);else{G.wrec.st=0;G.wrec.bt=0;}ev.push({s,step:gstep,dual:T('wrDual')(h)});G.roster[h]={id:h};taken.push(h);}}});}}
   taken.forEach(h=>{delete G.roster[h];});return ev;};
  const stats=(mode,N,steps)=>{const per=[0,0,0,0,0],dual=[0,0,0,0,0],all=[0,0,0,0,0];let tot=0,b2b=0,gap=1e9,max=0,over=0;
   for(let j=0;j<N;j++){const ev=runJourney(mode,steps);tot+=ev.length;max=Math.max(max,ev.length);ev.forEach((e,i)=>{per[e.s]++;all[e.s]++;if(e.dual)dual[e.s]++;if(i)gap=Math.min(gap,e.step-ev[i-1].step);});for(let i=2;i<ev.length;i++)if(ev[i].step-ev[i-2].step<200){b2b++;break;}
    for(let s=0;s<5;s++)if(ev.filter(e=>e.s===s).length>(WREC.perRealm[s]!=null?WREC.perRealm[s]:2))over++;}
   return {mode,events:+(tot/N).toFixed(2),max,perRealm:per.map(v=>+(v/N).toFixed(2)),dualPct:dual.map((d,i)=>all[i]?Math.round(100*d/all[i]):0),minGap:gap,threeIn200:Math.round(100*b2b/N),over};};
  const d0=WREC.dual.slice();WREC.dual=[1,1,1,1,1];o.old=stats('old',200,1100);WREC.dual=d0;o.neu=stats('new',200,1100);o.short=stats('new',200,700);
  }finally{Math.random=mr;}return o;});
chk('spacing: nothing before the first steps; one event resets the clock; steps alone are not enough, steps and battles are; the realm budget and the journey cap hold',!wr.first&&wr.firstOk&&!wr.after&&!wr.stepsOnly&&wr.both&&!wr.budget1&&wr.budget2&&!wr.cap);
console.log('SIM old (no spacing, 1100 steps a realm, 200 journeys):',JSON.stringify(wr.old));console.log('SIM new:',JSON.stringify(wr.neu));console.log('SIM new, 700 steps a realm:',JSON.stringify(wr.short));
chk(`sim: wild recruit events per journey ${wr.old.events} before, ${wr.neu.events} now (at most ${wr.neu.max}); three within 200 steps: ${wr.old.threeIn200}% of journeys before, ${wr.neu.threeIn200}% now; closest two ${wr.old.minGap} then ${wr.neu.minGap} steps apart`,wr.neu.events<=8&&wr.old.events>=3*wr.neu.events&&wr.neu.threeIn200===0&&wr.neu.minGap>=240&&wr.old.threeIn200>=50);
chk(`sim: spread over the realms (${wr.neu.perRealm.join(', ')} per realm, none over its budget: ${wr.neu.over}), all five realms get some, the last two realms never starve`,wr.neu.over===0&&wr.neu.perRealm.every(v=>v>=.8)&&wr.short.perRealm.every(v=>v>=.7));
chk(`sim: dual type wayfarers come later (share of the events: ${wr.neu.dualPct.join('%, ')}% by realm; before ${wr.old.dualPct.join('%, ')}%)`,wr.neu.dualPct[0]<=12&&(wr.neu.dualPct[0]+wr.neu.dualPct[1])+20<(wr.neu.dualPct[3]+wr.neu.dualPct[4])&&(wr.old.dualPct[0]+wr.old.dualPct[1])+10>(wr.neu.dualPct[0]+wr.neu.dualPct[1]));
// ---------------- 1. landmarks ----------------
const lm=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get,L=T('LM12'),o={n:L.length,towns:0,none:[],fit:0,bad:[],aud:[],dist:[],intro:0,ids:new Set(L.map(l=>l.id)).size};const seed0=G.run.seed,ord0=G.run.order.slice(),NZ=A.ZONES.length;
  const zt=new Set(A.ZONES.map(z=>z.town));o.zones=zt.size;o.cover=L.filter(l=>zt.has(l.town)).length;o.intro=A.ZONES.filter(z=>(z.intro||'').includes(T('LM_BY_TOWN')[z.town].n)).length;
  for(let k=0;k<40;k++){G.run.seed=k*7919+101;G.run.order=ord0.map((z,i)=>(k*5+i*7)%NZ);G.sub=null;A.resetMaps();
   for(let s=0;s<5;s++){const m=A.getMap('t'+s),town=A.ZONES[G.run.order[s]].town;o.towns++;if(!m.lm){o.none.push(town);continue;}
    const e=T('lmEntries')(m)[0],cx=m.lm.x+1,W=m.w,H=m.h,cl=Math.max(0,Math.min(W-26,e.x+.5-13)),ct=Math.max(0,Math.min(H-10,e.y+.5-5)),ov=Math.max(0,cl-(cx-1.75))+Math.max(0,(cx+1.75)-(cl+26))+Math.max(0,ct-(m.lm.y+2-5.6))+Math.max(0,(m.lm.y+2)-(ct+10));if(ov===0)o.fit++;o.dist.push(Math.round(Math.hypot(cx-e.x,m.lm.y+1-e.y)));
    for(let j=0;j<2;j++)for(let i=0;i<2;i++)if(m.t[m.lm.y+j][m.lm.x+i]!=='j')o.bad.push(town+' tile');
    const au=A.W71.drawAudit(m);if(au.hidden.length||au.holes.length||au.door.length||au.apron.length)o.aud.push(town+' '+JSON.stringify([au.hidden.slice(0,1),au.door.slice(0,1)]));
    if(T('mapIssues')(m).length)o.bad.push(town+' blocked');}}
  G.run.seed=seed0;G.run.order=ord0;A.resetMaps();o.dmin=Math.min(...o.dist);o.dmax=Math.max(...o.dist);o.dist=null;return o;});
chk(`${lm.n} landmarks, one for each of the ${lm.zones} town names (${lm.cover} match), ${lm.ids} different ids, each named in its town's intro (${lm.intro} of ${lm.zones})`,lm.n===23&&lm.zones===23&&lm.cover===23&&lm.ids===23&&lm.intro===23);
chk(`${lm.towns} towns built from 40 journeys: every one has its landmark on four 'j' tiles (${lm.none.length} without), no blocked door or gate, no hidden prop, door apron or hole (${lm.bad.concat(lm.aud).slice(0,3).join(' | ')||'clean'})`,!lm.none.length&&!lm.bad.length&&!lm.aud.length);
chk(`placed where the entry sees it: ${lm.fit} of ${lm.towns} inside the 26 x 10 tile window of the entry at 1000x560 (>= 75%), ${lm.dmin} to ${lm.dmax} tiles away`,lm.fit>=lm.towns*.75);
// the art: 23 cards, distinct silhouettes and signature colours that the cards are painted with
const art=await H.ev(()=>{const T=__A.TW.get,L=T('LM12'),o={empty:[],nocol:[],masks:[],frames:[]};const h=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
  L.forEach(l=>{const c=T('lmCard')(l.id,0),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0,hit=0;const mask=new Uint8Array(14*24),k=h(l.col);
   for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(d[i+3]>200){n++;if(Math.abs(d[i]-k[0])<=5&&Math.abs(d[i+1]-k[1])<=5&&Math.abs(d[i+2]-k[2])<=5)hit++;mask[Math.floor(y/4)*14+Math.floor(x/4)]=1;}}
   if(n<500)o.empty.push(l.id+':'+n);if(hit<15)o.nocol.push(l.id+':'+hit);o.masks.push(mask);
   if(l.fr>1){const c1=T('lmCard')(l.id,1),d1=c1.getContext('2d').getImageData(0,0,c.width,c.height).data;let df=0;for(let i=0;i<d.length;i+=4)if(d[i]!==d1[i]||d[i+1]!==d1[i+1]||d[i+2]!==d1[i+2]||d[i+3]!==d1[i+3])df++;if(!df)o.empty.push(l.id+' frames');}});
  let minC=1e9,pc='',maxI=0,pi='';for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=h(L[i].col),b=h(L[j].col),d=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);if(d<minC){minC=d;pc=L[i].id+'/'+L[j].id;}
    let inter=0,uni=0;for(let k=0;k<o.masks[i].length;k++){const p=o.masks[i][k],q=o.masks[j][k];if(p&&q)inter++;if(p||q)uni++;}const iou=inter/uni;if(iou>maxI){maxI=iou;pi=L[i].id+'/'+L[j].id;}}
  o.minC=Math.round(minC);o.pc=pc;o.maxI=+maxI.toFixed(2);o.pi=pi;o.masks=null;return o;});
chk(`23 cards painted (none empty, animated ones change per frame: ${art.empty.join(' ')||'ok'}), each in its signature colour (${art.nocol.join(' ')||'all 23'}); closest two signature colours ${art.pc} are ${art.minC} apart (>= 30); most alike silhouettes ${art.pi} overlap ${art.maxI} (<= .85)`,!art.empty.length&&!art.nocol.length&&art.minC>=30&&art.maxI<=.85);
// the town in view: both renderers draw it, facing it reads it, the Waystone row names it
const SH=process.env.SHOTS;if(SH)fs.mkdirSync(SH,{recursive:true});
const setupTown=(i,face)=>H.ev(([i,face])=>{const A=__A,G=A.G,T=A.TW.get;G.run.order[0]=i;G.run.seed=424242+i;G.sub=null;A.resetMaps();G.stage=0;G.cleared=[false,false,false,false,false];A.WS.dlg=null;A.V.modal=null;const m=A.getMap('t0'),e=T('lmEntries')(m)[0],L=m.lm,
  dx=L.x+1-e.x,dy=L.y+1-e.y,dir=Math.abs(dx)>=Math.abs(dy)?(dx>=0?'r':'l'):(dy>=0?'d':'u');A.placeAt('t0',e.x,e.y,dir);G.weather[0]='clear';A.render();return {id:L.id,town:L.town,x:L.x,y:L.y};},[i,face]);
const towns=await H.ev(()=>__A.ZONES.map(z=>z.town));
for(const g of ['low','medium']){await gfx(H,g);const mode=g==='low'?'flat':'HD-2D';
  for(const i of [0,6,14,21]){const L=await setupTown(i);await H.frames(25);await H.wait(500);
   const n=await shotDiff(([i])=>{},([i])=>{const A=__A;A.WS.m.lm=null;A.render();},[i]);
   chk(`${mode}: ${L.town}'s ${L.id} is drawn at the entry view (${n} pixels change without it)`,n>3000);}
  if(SH){for(let i=0;i<towns.length;i++){const L=await setupTown(i);await H.frames(25);await H.wait(600);await H.page.screenshot({path:`${SH}/town_${String(i).padStart(2,'0')}_${towns[i].replace(/[^A-Za-z]/g,'')}_${g==='low'?'flat':'hd'}.png`});}}}
const rd=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get;G.run.order[0]=6;A.resetMaps();G.visited=[0,1];const m=A.getMap('t0');A.placeAt('t0',m.lm.x+1,m.lm.y+2,'u');A.V.screen==='world';
  A.placeAt('t0',m.lm.x,m.lm.y+2,'u');A.WS.dlg=null;A.interact();const dlg=A.WS.dlg;A.WS.dlg=null;A.V.modal={type:'travel'};A.render();const tr=document.querySelector('#modal').textContent;A.V.modal=null;return {dlg:dlg&&(dlg.name+': '+dlg.text),tr,name:T('LM12').find(l=>l.id===m.lm.id).n};});
chk(`facing the landmark reads its line ("${(rd.dlg||'').slice(0,60)}...") and the Waystone list names it (${rd.name})`,!!rd.dlg&&/Brackenford|mill/i.test(rd.dlg)&&new RegExp(rd.name.replace(/^the /,''),'i').test(rd.tr));
await H.browser.close();
// ---------------- 2. the pad under every text box ----------------
for(const [w,h,label] of [[390,844,'390x844 portrait'],[844,390,'844x390 landscape']]){for(const g of ['low','medium']){
  const P=await open({w,h,mobile:true});await start(P);await gfx(P,g);await P.frames(8);
  const probe=()=>P.ev(()=>{const R=e=>e.getBoundingClientRect(),pads=[...document.querySelectorAll('#joy,.pad .abtn')].filter(e=>R(e).width>5);const out={pads:pads.length,over:[]};
    const boxes=[...document.querySelectorAll('#wdlg .dlg,#modal .modal,#modal .box,#toast')].filter(e=>R(e).width>5);
    boxes.forEach(o=>{const a=R(o);pads.forEach(p=>{const b=R(p),x0=Math.max(a.left,b.left),x1=Math.min(a.right,b.right),y0=Math.max(a.top,b.top),y1=Math.min(a.bottom,b.bottom);if(x1-x0<4||y1-y0<4)return;
      for(const [fx,fy] of [[.5,.5],[.25,.25],[.75,.75]]){const el=document.elementFromPoint(x0+(x1-x0)*fx,y0+(y1-y0)*fy);out.over.push({o:o.id||o.className.split(' ')[0],p:p.id||p.className,padOnTop:!!(el&&el.closest('#joy,.pad'))});}});});return out;});
  await P.ev(()=>{__A.TW.get('say')('Elder','Welcome, traveller. The road north is long, so take what you need and keep your lantern lit. '.repeat(2));});await P.frames(6);
  const d=await probe();
  await P.ev(()=>{__A.WS.dlg=null;__A.V.modal={type:'menu',tab:'settings'};__A.render();});await P.frames(6);const mo=await probe();
  await P.ev(()=>{__A.V.modal={type:'story',title:'A tale',text:'Long ago, a light hung over Aurelis. '.repeat(6),btn:'Onward'};__A.render();});await P.frames(6);const st=await probe();
  const landDlg=w>h;
  chk(`${label} ${g==='low'?'flat':'HD-2D'}: the pad (${d.pads} parts) is under the dialog (${d.over.length} overlaps checked${landDlg?'':', none expected on a portrait phone'}), under a menu modal (${mo.over.length}) and a story modal (${st.over.length}), on top nowhere`,
    d.pads>=3&&!d.over.some(q=>q.padOnTop)&&!mo.over.some(q=>q.padOnTop)&&!st.over.some(q=>q.padOnTop)&&(!landDlg||d.over.length>0)&&mo.over.length>0);
  if(process.env.SHOTS&&g==='medium'){await P.ev(()=>{__A.V.modal=null;__A.TW.get('say')('Elder','Welcome, traveller. The road north is long. Keep your lantern lit.');});await P.frames(6);await P.page.screenshot({path:`${process.env.SHOTS}/pad_dialog_${w}x${h}.png`});await P.ev(()=>{__A.WS.dlg=null;__A.V.modal={type:'menu',tab:'settings'};__A.render();});await P.frames(6);await P.page.screenshot({path:`${process.env.SHOTS}/pad_modal_${w}x${h}.png`});}
  await P.browser.close();}}
await done({browser:{close:async()=>{}}});
})().catch(e=>{console.error(e);process.exit(1);});
