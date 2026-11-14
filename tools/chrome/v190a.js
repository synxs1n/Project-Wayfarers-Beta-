// v0.21.x world16.js (docs/world16.md): the owner's five playtest notes for the overworld.
//  1 chests open at once: opening a field chest and a dungeon chest puts the find text up in the same call, within a few ms, on the flat look and
//    in HD-2D; only the chest's own tiles are repainted (W16.n.patch) and the patched ground is the ground a full repaint gives; with the module off
//    the full repaint is back (the delay reproduced); in HD-2D the cards are re-cut a moment later (the chest card goes)
//  2 the explored map follows the account: two devices on one account and one journey; what A explored reaches B through the profile although B's
//    save never held it (a tile A saw: "unseen" before, walkable after); a union both ways; packed (run lengths) well under the raw bits; another
//    journey's map is never mixed in; pack and unpack round trip
//  3 the Breach Waystone stands in the centre of the hub (within one tile of the middle of the ring of stones), free and reachable, for every way
//    the Breach is turned; with the module off it stands where it did (off centre); a save standing on the new stone is stepped aside
//  4 exits: over 600 seeds the four sides are drawn evenly (each 20 to 30%, also for the first town); old journeys (G.dunRev 2) keep their plan and
//    never go west; over many seeds, every realm and every layout: every town gate leads to its field and back, has a post beside its lane (or,
//    where water, wall or houses leave no ground there, the nearest ground along the way in, with the reason for each tile beside the lane),
//    never on the lane, in a building, in the water, hidden by a wall or out of reach; mapIssues 0 in towns and fields, pathAssets no more than without the posts; the world map has no
//    two places on one square
//  5 names: no root in more than 2 names across realms, towns, dungeons and bosses, or more than 4 across the named things of the world (the
//    guild rank words warden, master, hand excepted); the owner's nine roots at most 6 across everything; no old name left; the Bestiary
//    carries old records to the new names
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v190a.js [ONLY=1,2,3,4,5]
const {open,chk,done,perfChk}=require('./pw');
const {chromium}=require('playwright');
const {store,device,NEWGAME,idle}=require('./syncmock');
const {audit}=require('./names16');
const only=process.env.ONLY||'',want=n=>!only||only.split(',').includes(n);
const META=t=>`window.__W16REV3=1;localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false,tips:false,minimap:true,hd2d:true,goalsMin:true}}));`;
setTimeout(()=>{console.log('FAIL watchdog: v190a ran over 800 s');process.exit(1);},800000).unref();
async function boot(t,w,h){const H=await open({w:w||1100,h:h||700,mobile:false,dpr:1,pre:META(t)});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=424242;A.resetMaps();A.render();});await H.wait(400);return H;}
// stand in front of an unopened ordinary chest of map `mid` and open it; times and what was repainted
const CHEST=async([mid,off])=>{const A=__A,T=A.TW.get,m=A.getMap(mid),W=__W16;W.off=!!off;let c=null;
  for(const q of m.chests||[]){const [x,y]=q;if(q[2]||A.G.chests[m.id+':'+x+','+y]||m.t[y][x]!=='C'||T('isMimic')(m,x,y))continue;
    for(const [d,dx,dy] of [['u',0,1],['d',0,-1],['l',1,0],['r',-1,0]])if(!T('solidAt')(m,x+dx,y+dy)){c=[x,y,x+dx,y+dy,d];break;}if(c)break;}
  if(!c)return {none:1};T('placeAt')(m.id,c[2],c[3],c[4]);await new Promise(r=>setTimeout(r,700));
  const n0=Object.assign({},W.n),hd=T('hdActive')(),HD=T('HD'),b0=HD.bakes|0,base0=A.WS.base[0];
  const t0=performance.now();T('interact')();const ms=performance.now()-t0,dlg=A.WS.dlg&&A.WS.dlg.text;
  const out={c,ms:+ms.toFixed(1),dlg:!!dlg&&/open the chest/.test(dlg),hd,patchNow:W.n.patch-n0.patch,fullNow:W.n.full-n0.full,tile:T('tileAt')(m,c[0],c[1])};
  await new Promise(r=>setTimeout(r,900));out.patch=W.n.patch-n0.patch;out.full=W.n.full-n0.full;out.bakes=(HD.bakes|0)-b0;out.sameBase=A.WS.base[0]===base0;out.patchMs=+(W.last.patchMs||0).toFixed(1);
  if(!off){// the patched ground against a full repaint
    const px=cv=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,a=px(A.WS.base[0]),a1=px(A.WS.base[1]);W.off=true;T('rebuildBase')();W.off=false;const b=px(A.WS.base[0]),b1=px(A.WS.base[1]);let d=0,near=0;
    const cx=c[0]*16+8,cy=c[1]*16+8,w=A.WS.base[0].width;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a1[i]!==b1[i]||a1[i+1]!==b1[i+1]||a1[i+2]!==b1[i+2]){d++;const p=i/4,x=p%w,y=(p-x)/w;if(Math.abs(x-cx)<=40&&Math.abs(y-cy)<=48)near++;}
    out.diff=d;out.diffNear=near;out.pixels=a.length/4;}
  if(A.WS.dlg)T('nextDlg')();if(A.V.modal){A.V.modal=null;A.render();}W.off=false;out.err=W.err.slice();return out;};
(async()=>{let H=null;
// ---------- 1. chests ----------
if(want('1'))for(const t of ['low','high']){H=await boot(t);
  for(const mid of ['f0','d0']){const r=await H.ev(CHEST,[mid,false]);console.log(`  ${t} ${mid}: ${JSON.stringify(r)}`);
    chk(`1 ${t} ${mid}: an unopened chest was found and faced`,!r.none||JSON.stringify(r));if(r.none)continue;
    chk(`1 ${t} ${mid}: the find text is up when interact() returns, the chest tile reads opened`,r.dlg&&r.tile==='c'||JSON.stringify(r));
    await perfChk(H,`1 ${t} ${mid}: opening takes`,Math.round(r.ms),t==='low'?90:60);
    chk(`1 ${t} ${mid}: one patch, no full repaint, the base canvas is kept`,r.patch===1&&r.full===0&&r.sameBase||JSON.stringify(r));
    chk(`1 ${t} ${mid}: the patched ground is the ground of a full repaint (${r.diff} of ${r.pixels} px differ, ${r.diffNear} near the chest)`,r.diffNear===0&&r.diff<=r.pixels*.0005||JSON.stringify({d:r.diff,n:r.diffNear}));
    if(t==='high'){chk(`1 high ${mid}: HD-2D is live, nothing is repainted or re-cut inside the call, the cards are re-cut right after (${r.bakes} bake)`,r.hd&&r.patchNow===0&&r.fullNow===0&&r.bakes>=1||JSON.stringify(r));}
    else chk(`1 low ${mid}: the patch is done inside the call`,r.patchNow===1||JSON.stringify(r));
    chk(`1 ${t} ${mid}: no module error`,r.err.length===0||r.err.join('; '));}
  const o=await H.ev(CHEST,['f0',true]);console.log(`  ${t} f0 (module off): ${JSON.stringify(o)}`);
  chk(`1 ${t}: with the module off the whole map is repainted for one chest (the delay: ${o.ms} ms)`,!o.none&&o.dlg&&o.patch===0&&o.full>=1||JSON.stringify(o));
  chk(`1 ${t}: no console error`,H.errs.length===0||H.errs.slice(0,3).join(' | '));await H.browser.close();}
// ---------- 2. the explored map follows the account ----------
if(want('2')){const st=store(),browser=await chromium.launch(),wait=ms=>new Promise(r=>setTimeout(r,ms));
  const A=await device(st,browser,'A',{prejs:'window.__W16REV3=1;'});await idle(A);await A.ev(NEWGAME);await A.ev(()=>{__A.saveGame();});await idle(A);
  const B=await device(st,browser,'B',{prejs:'window.__W16REV3=1;',open:{w:1280,h:800,mobile:false}});await idle(B);
  await B.ev(()=>__A.ACT.slotLoad(0));for(let i=0;i<60;i++){if(await B.ev(()=>__A.V.screen==='world'))break;await wait(100);}
  const same=await B.ev(()=>__W16.api.key(__A.G))===await A.ev(()=>__W16.api.key(__A.G));chk('2 both devices hold the same journey, a new one (plan revision 3)',same&&await A.ev(()=>__A.G.dunRev)===3&&await B.ev(()=>__A.G.dunRev)===3);
  // A explores the field; B's save never gets it (B keeps its own copy: the case where this device's save wins)
  const seenN=()=>{const A=__A,m=A.getMap('f0'),S=A.TW.get('seenOf')(m);let n=0;for(let i=0;i<m.w*m.h;i++)if(S[i>>3]&(1<<(i&7)))n++;return n;};
  const tgt=await A.ev(()=>{const A=__A,T=A.TW.get,m=A.getMap('f0');let last=null;for(let x=3;x<m.w-3;x+=5)for(let y=3;y<m.h-3;y+=5)if(!T('solidAt')(m,x,y)){T('placeAt')('f0',x,y,'r');last=[x,y];}
    const a=m.gates.start.arrive;T('placeAt')('f0',a[0],a[1],'r');return last;});
  const aN=await A.ev(seenN),b0=await B.ev(seenN);
  const before=await B.ev(([x,y])=>{const A=__A,T=A.TW.get,m=A.getMap('f0'),a=m.gates.start.arrive;T('placeAt')('f0',a[0],a[1],'r');return T('awPlan')(m,x,y).res;},tgt);
  chk(`2 before: A has seen ${aN} tiles of the field, B ${b0}; a far tile A saw is "unseen" on B`,aN>b0+500&&before==='unseen'||JSON.stringify({aN,b0,before}));
  await A.ev(async()=>{__W16.api.fold(false);await __A.TW.get('profileSync')();});
  const doc=st.get('profile/u_dev'),seen=doc&&doc.flags&&doc.flags.seen,key=await A.ev(()=>__W16.api.key(__A.G));
  const packed=seen&&seen[key]?JSON.stringify(seen[key]).length:0,raw=await A.ev(()=>JSON.stringify(__A.G.explored).length);
  chk(`2 the profile holds the journey's explored maps, packed: ${packed} bytes against ${raw} raw`,packed>0&&packed<raw*.6||JSON.stringify({packed,raw,keys:seen&&Object.keys(seen)}));
  await B.ev(async()=>{await __A.TW.get('profileSync')();});await wait(200);
  const b1=await B.ev(seenN),after=await B.ev(([x,y])=>{const A=__A,T=A.TW.get,m=A.getMap('f0');return T('awPlan')(m,x,y).res;},tgt);
  chk(`2 after B's profile sync: B has seen ${b1} tiles (A's ${aN} and its own), the far tile is no longer "unseen" (${after})`,b1>=aN&&after!=='unseen'||JSON.stringify({b1,aN,after}));
  const bSaved=await B.ev(()=>{const A=__A;A.saveGame();const o=JSON.parse(localStorage.getItem('aurelis-wayfarers-v3'));return !!(o.explored&&o.explored.f0);});
  chk('2 B\'s save now carries it (it is in G.explored)',bSaved);
  // the other way: B walks its town, A gets that too; a reload of A keeps everything
  await B.ev(async()=>{const A=__A,T=A.TW.get,m=A.getMap('t0');for(let x=2;x<m.w-2;x+=4)for(let y=2;y<m.h-2;y+=4)if(!T('solidAt')(m,x,y))T('placeAt')('t0',x,y,'r');__W16.api.fold(false);await T('profileSync')();});
  const tN=()=>{const A=__A,m=A.getMap('t0'),S=A.TW.get('seenOf')(m);let n=0;for(let i=0;i<m.w*m.h;i++)if(S[i>>3]&(1<<(i&7)))n++;return n;};
  const bt=await B.ev(tN),at0=await A.ev(tN);await A.ev(async()=>{await __A.TW.get('profileSync')();});const at1=await A.ev(tN);
  chk(`2 a union both ways: B's town tiles (${bt}) reach A (${at0} before, ${at1} after), A keeps its field (${await A.ev(seenN)})`,at1>=bt&&at1>at0&&await A.ev(seenN)===aN||JSON.stringify({bt,at0,at1}));
  const rt=await A.ev(()=>{const P=__W16.api.pack,U=__W16.api.unpack;let ok=true,worst=0;for(let k=0;k<40;k++){const n=40+k*97,a=new Uint8Array(n);let s=k*7+3;const R=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
      if(k%4===0){for(let i=0;i<n;i++)a[i]=R()<.5?255:0;}else if(k%4===1){for(let i=0;i<n;i++)a[i]=Math.floor(R()*256);}else if(k%4===2){a.fill(255);}
      const p=P(a),b=U(p);if(!b||b.length!==a.length)ok=false;else for(let i=0;i<n;i++)if(a[i]!==b[i])ok=false;worst=Math.max(worst,p.length/n);}
    return {ok,worst:+worst.toFixed(2),bad:U('nonsense')===null&&U('12:###')===null};});
  chk(`2 pack and unpack round trip (blobs, noise, full, empty); bad input is refused`,rt.ok&&rt.bad||JSON.stringify(rt));
  const other=await A.ev(()=>{const A=__A,G=A.G,k=__W16.api.key(G),S=A.TW.get('META').seen16;const fake={run:{seed:G.run.seed+1,cycle:0},explored:{}};const r=__W16.api.merge(fake);
    const n=Object.keys(S).length;for(let i=0;i<6;i++)__W16.api.merge({run:{seed:9000+i,cycle:0},explored:{t0:btoa('\\u00ff\\u00ff')}});__W16.api.fold(false);
    return {mixed:Object.keys(fake.explored).length,kept:Object.keys(A.TW.get('META').seen16).length,cur:!!A.TW.get('META').seen16[k],n};});
  chk(`2 another journey gets nothing of this one; only the latest ${other.kept} journeys are kept, the open one among them`,other.mixed===0&&other.kept<=3&&other.cur||JSON.stringify(other));
  const errs=A.errs.concat(B.errs),merr=(await A.ev(()=>__W16.err)).concat(await B.ev(()=>__W16.err));
  chk('2 no page error, no module error',errs.length===0&&merr.length===0||errs.concat(merr).slice(0,3).join(' | '));await browser.close();}
// ---------- 3, 4, 5 ----------
if(want('3')||want('4')||want('5')){H=await boot('low',1000,600);
if(want('3')){
  const r=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get,out=[];const N4=[[1,0],[-1,0],[0,1],[0,-1]];
    const look=(m)=>{const W=[];m.t.forEach((r,y)=>r.forEach((c,x)=>{if(c==='W')W.push([x,y]);}));let sx=0,sy=0,n=0;const cx=(m.w-1)/2,cy=(m.h-1)/2;m.t.forEach((r,y)=>r.forEach((c,x)=>{if(c==='N'&&Math.abs(x-cx)<=7.5&&Math.abs(y-cy)<=7.5){sx+=x;sy+=y;n++;}}));
      const a=m.gates.start.arrive,R=T('w16Flood')(m,a[0],a[1]),w=W[0];return {W:W.length,at:w,ring:n,d:w?+Math.hypot(w[0]-sx/n,w[1]-sy/n).toFixed(2):99,dm:w?+Math.hypot(w[0]-cx,w[1]-cy).toFixed(2):99,reach:!!w&&N4.some(([i,j])=>R[w[1]+j]&&R[w[1]+j][w[0]+i]),iss:A.mapIssues(m).length,size:m.w+'x'+m.h,side:m.gates.start.side};};
    G.won=true;
    for(let k=0;k<24;k++){G.run.seed=7000+k*613;A.resetMaps();__W16.off=false;const m=A.getMap('x0'),on=look(m);A.resetMaps();__W16.off=true;const off=look(A.getMap('x0'));__W16.off=false;out.push({k,on,off});}
    A.resetMaps();const m=A.getMap('x0'),w=m.waystone;T('placeAt')('x0',w[0],w[1],'d');const pos=[A.WS.x,A.WS.y],solid=T('solidAt')(m,A.WS.x,A.WS.y);
    T('placeAt')('x0',m.gates.start.arrive[0],m.gates.start.arrive[1],'r');
    return {out,pos,w,solid,travel:typeof A.ACT.toBreach==='function',err:__W16.err.slice()};});
  const sides=new Set(r.out.map(o=>o.on.side));
  console.log('  Breach, 24 journeys: sides '+[...sides].join(',')+'; the stone to the centre of the ring: '+r.out.map(o=>o.on.d).join(' ')+' (module off: '+r.out.map(o=>o.off.d).join(' ')+')');
  chk('3 one Waystone in every Breach, a ring of stones to measure from',r.out.every(o=>o.on.W===1&&o.on.ring>=6)||JSON.stringify(r.out.find(o=>o.on.W!==1||o.on.ring<6)));
  chk('3 the Waystone stands within one tile of the centre of the ring (and of the map) in every journey',r.out.every(o=>o.on.d<=1&&o.on.dm<=1.6)||JSON.stringify(r.out.filter(o=>o.on.d>1||o.on.dm>1.6).slice(0,3)));
  chk('3 it can be walked up to from the landing, and the Breach has no map issue',r.out.every(o=>o.on.reach&&o.on.iss===0)||JSON.stringify(r.out.find(o=>!o.on.reach||o.on.iss)));
  chk('3 with the module off the stone is off centre (the note reproduced)',r.out.every(o=>o.off.d>=2.5)||JSON.stringify(r.out.find(o=>o.off.d<2.5)));
  chk(`3 the Breach is entered from more than one side over the journeys (${[...sides].join(', ')}), so the turned maps are covered`,sides.size>=2);
  chk(`3 a save standing on the stone's tile is stepped aside, not into it (${r.pos} for ${r.w})`,!r.solid&&(r.pos[0]!==r.w[0]||r.pos[1]!==r.w[1]));
  chk('3 no module error',r.err.length===0||r.err.join('; '));}
if(want('4')){
  const d=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get,c={tn:{},fe:{},t0:{},prev:{}},opp={n:'s',s:'n',e:'w',w:'e'};let cross=0;
    for(let k=0;k<600;k++){const P=__W16.api.plan(31+k*7919+((k*k*31)%1000));let pos=[0,0];const used=new Set(['0,0']);const V={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]};
      P.forEach((p,s)=>{c.tn[p.tn]=(c.tn[p.tn]||0)+1;if(s===0)c.t0[p.tn]=(c.t0[p.tn]||0)+1;if(s<4){c.fe[p.fe]=(c.fe[p.fe]||0)+1;c.prev[opp[p.fe]]=(c.prev[opp[p.fe]]||0)+1;}
        const f=[pos[0]+V[p.tn][0],pos[1]+V[p.tn][1]];if(used.has(f.join()))cross++;used.add(f.join());if(s<4){const t=[f[0]+V[p.fe][0],f[1]+V[p.fe][1]];if(used.has(t.join()))cross++;used.add(t.join());pos=t;}
        if(p.fs!==opp[p.tn]||p.fe===p.fs||(s>0&&p.tn===opp[P[s-1].fe]))cross+=100;});}
    // old journeys: revision 2 as it was
    const old={w:0,n:0};G.dunRev=2;for(let k=0;k<150;k++){G.run.seed=500+k*977;T('worldPlan')().forEach(p=>{old.n++;if(p.tn==='w'||p.fe==='w')old.w++;});}
    __W16.off=true;G.run.seed=424242;const a=JSON.stringify(T('worldPlan')());__W16.off=false;G.run.seed=424243;T('worldPlan')();G.run.seed=424242;const b=JSON.stringify(T('worldPlan')());
    G.dunRev=3;const n3=JSON.stringify(T('worldPlan')());
    return {c,cross,old,sameOld:a===b,differs:n3!==a};});
  const pct=o=>['w','e','n','s'].map(k=>k+' '+Math.round(100*(o[k]||0)/Object.values(o).reduce((a,b)=>a+b,0))+'%').join(', ');
  console.log('  600 journeys: town exits '+pct(d.c.tn)+' | first town '+pct(d.c.t0)+' | field far gates '+pct(d.c.fe)+' | town entrances '+pct(d.c.prev));
  const even=(o,lo,hi)=>{const t=Object.values(o).reduce((a,b)=>a+b,0);return ['w','e','n','s'].every(k=>(o[k]||0)/t>=lo&&(o[k]||0)/t<=hi);};
  chk('4 town exits: west, east, north and south are each 20 to 30% of 3000 exits',even(d.c.tn,.2,.3)||JSON.stringify(d.c.tn));
  chk('4 the first town too (each side 18 to 32% of 600)',even(d.c.t0,.18,.32)||JSON.stringify(d.c.t0));
  chk('4 field far gates and town entrances are even as well',even(d.c.fe,.2,.3)&&even(d.c.prev,.2,.3)||JSON.stringify([d.c.fe,d.c.prev]));
  chk('4 no plan crosses itself on the world map, enters where it left, or leaves a field by its entry',d.cross===0||d.cross);
  chk(`4 old journeys (G.dunRev 2) keep their plan: the same with the module off, never west (${d.old.w} of ${d.old.n}); a new journey is revision 3`,d.sameOld&&d.old.w===0&&d.differs||JSON.stringify(d));
  // every gate of many towns: realms and layouts in turn, new journeys (revision 3) and old ones (revision 2)
  const S=await H.ev(async()=>{const A=__A,G=A.G,T=A.TW.get,zones=A.ZONES.map((z,i)=>i).filter(i=>A.ZONES[i].key),opp={n:'s',s:'n',e:'w',w:'e'};
    // realms where the game puts them: the 16 standard realms (and the old base zones) on the first four stages, a Calamity realm on the last
    const std=A.ZONES.map((z,i)=>i).filter(i=>A.ZONES[i].std||(!A.ZONES[i].key&&i<5)),cal=A.ZONES.map((z,i)=>i).filter(i=>A.ZONES[i].cal||(!A.ZONES[i].key&&i===5)),pick=(k,s)=>s<4?std[(k*4+s*5+k%3)%std.length]:cal[k%cal.length];
    const o={towns:0,gates:0,ok:0,far:0,bad:[],farNoWhy:[],trip:[],iss:0,fiss:0,pa:0,pa0:0,err:[],arch:{},realm:{},side:{},placed:0,graph:0,guard:0,rev:{2:0,3:0},post:{}};
    // what stands on a path with the posts against the same town without them (a realm on a stage the game never gives it can have one of its own)
    const paOf=(m,s)=>{const n=T('pathAssets')(m).length;if(!n)return;__W16.signs=false;__W16.gates=false;A.resetMaps();const n0=T('pathAssets')(A.getMap('t'+s)).length;__W16.signs=true;__W16.gates=true;A.resetMaps();o.pa+=Math.max(0,n-n0);o.pa0+=n0;};
    for(let k=0;k<84;k++){const rev=k<64?3:2;G.dunRev=rev;G.run.seed=1000+k*7919+(k*k*13)%997;for(let s=0;s<5;s++)G.run.order[s]=pick(k,s);A.resetMaps();if(k%8===0)await new Promise(r=>setTimeout(r,0));
      for(let s=0;s<5;s++){let m,f;try{m=A.getMap('t'+s);f=A.getMap('f'+s);}catch(e){o.err.push(k+':'+s+' '+e.message);continue;}o.towns++;o.rev[rev]++;o.iss+=A.mapIssues(m).length;o.fiss+=A.mapIssues(f).length;paOf(m,s);
        o.arch[m.arch]=(o.arch[m.arch]||0)+1;if(A.ZONES[G.run.order[s]].key)o.realm[A.ZONES[G.run.order[s]].key]=1;
        ['prev','next'].forEach(g=>{if(g==='prev'&&s===0)return;const R=m.gates[g],to=g==='prev'?'f'+(s-1):'f'+s,cells=m.exits.filter(e=>e.to&&e.to.m===to);
          if(!R||!cells.length){o.trip.push([k,s,g,'no gate']);return;}const fm=A.getMap(to),fg=fm.gates[cells[0].to.g],back=fm.exits.filter(e=>e.to&&e.to.m===m.id);
          if(!fg||!fg.arrive||fg.side!==opp[R.side]||!back.length||back[0].to.g!==g||T('solidAt')(fm,fg.arrive[0],fg.arrive[1])||T('solidAt')(m,R.arrive[0],R.arrive[1]))o.trip.push([k,s,g,R.side,fg&&fg.side]);});
        __W16.api.signAudit(m).forEach(a=>{o.gates++;o.side[a.name+':'+a.side]=(o.side[a.name+':'+a.side]||0)+1;if(!a.ok){o.bad.push({k,s,arch:m.arch,a});return;}
          if(a.far){o.far++;o.post[m.arch]=(o.post[m.arch]||0)+1;const L=(m.w16signs||[]).find(q=>q.name===a.name),w=L&&L.why;if(!w||Object.keys(w).length<2||Object.values(w).some(v=>!v))o.farNoWhy.push({k,s,arch:m.arch,L});}else o.ok++;});
        o.placed+=(m.w16signs||[]).filter(q=>!q.kept&&!q.miss).length;
        const nx=m.gates.next;if(nx&&nx.side!=='e'&&m.npcs.some(n=>n.name==='Gate guard'&&/ lies east\./.test(n.line)))o.guard++;}
      // the world map: every place on its own square
      try{const g=T('worldGraph')(),P=new Set(g.nodes.map(n=>n.x+','+n.y));if(P.size!==g.nodes.length)o.graph++;}catch(e){o.err.push('graph '+e.message);}}
    // the towns alone over 300 more journeys (a realm's town is the same at a stage in every journey: its gates are what changes)
    o.more={towns:0,nogate:[],bad:0,iss:0};for(let k=84;k<384;k++){G.dunRev=k%4?3:2;G.run.seed=1000+k*7919+(k*k*13)%997;for(let s=0;s<5;s++)G.run.order[s]=pick(k,s);A.resetMaps();if(k%20===0)await new Promise(r=>setTimeout(r,0));
      for(let s=0;s<5;s++){const m=A.getMap('t'+s);o.more.towns++;o.more.iss+=A.mapIssues(m).length;paOf(m,s);(s?['prev','next']:['next']).forEach(g=>{const to=g==='prev'?'f'+(s-1):'f'+s;if(!m.gates[g]||m.exits.filter(e=>e.to&&e.to.m===to).length<3)o.more.nogate.push([k,s,g,m.arch]);});
        o.more.bad+=__W16.api.signAudit(m).filter(a=>!a.ok).length;}}
    G.dunRev=3;return Object.assign(o,{merr:__W16.err.slice(),n:Object.assign({},__W16.n),layouts:Object.keys(T('T14').arch).length,realms:zones.length});});
  console.log(`  ${S.towns} towns (${S.rev[3]} of new journeys, ${S.rev[2]} of old ones), ${S.gates} gates: ${S.ok} posts beside the lane, ${S.far} farther along the way in (${Object.keys(S.post).map(k=>k+' '+S.post[k]).join(', ')}); ${S.placed} posts set by this pass`);
  console.log('  gates by side: '+Object.keys(S.side).sort().map(k=>k+' '+S.side[k]).join(', '));
  chk(`4 every layout (${Object.keys(S.arch).length} of ${S.layouts}) and every realm (${Object.keys(S.realm).length} of ${S.realms}) was built`,Object.keys(S.arch).length===S.layouts&&Object.keys(S.realm).length===S.realms||JSON.stringify(S.arch));
  chk('4 every gate side occurs for exits and for entrances',['prev:w','prev:e','prev:n','prev:s','next:w','next:e','next:n','next:s'].every(k=>S.side[k]>0)||JSON.stringify(S.side));
  chk(`4 every town gate has its post: none missing, on the lane, in a building, in the water, hidden by a wall or out of reach (${S.gates} gates)`,S.bad.length===0||JSON.stringify(S.bad.slice(0,3)));
  chk(`4 at least 85% of the posts touch the gate's lane (${S.ok} of ${S.gates}); each of the ${S.far} others has a reason for every tile beside its lane`,S.ok>=S.gates*.85&&S.farNoWhy.length===0||JSON.stringify({ok:S.ok,far:S.far,x:S.farNoWhy.slice(0,2)}));
  chk('4 every town gate leads to its field and back on the matching side, onto open ground',S.trip.length===0||JSON.stringify(S.trip.slice(0,4)));
  chk(`4 mapIssues: 0 in the towns and 0 in the fields (${S.iss}, ${S.fiss}); no build error`,S.iss===0&&S.fiss===0&&S.err.length===0||JSON.stringify([S.iss,S.fiss,S.err.slice(0,2)]));
  chk(`4 ${S.more.towns} more towns: every gate is there with three exit tiles and its post, no map issue (${S.n.gate} gates had to be carved once the town was finished, ${S.n.gateMiss} could not be)`,S.more.nogate.length===0&&S.more.bad===0&&S.more.iss===0&&S.n.gateMiss===0&&S.n.signMiss===0||JSON.stringify(S.more).slice(0,300));
  chk(`4 no post narrows the ground so that a crate, banner or townsperson beside it ends up on a path (pathAssets: 0 more than without the posts; ${S.pa0} there without them)`,S.pa===0||S.pa);
  chk('4 the world map puts every town and field on its own square',S.graph===0||S.graph);
  chk('4 no gate guard says the road lies east when it does not',S.guard===0||S.guard);
  chk('4 no module error',S.merr.length===0||S.merr.join('; '));
  // walking out by a west gate and back in, as the game does it
  const W=await H.ev(async()=>{const A=__A,G=A.G,T=A.TW.get;G.dunRev=3;let found=null;for(let k=0;k<400&&!found;k++){const P=__W16.api.plan(100+k);if(P[0].tn==='w')found=100+k;}
    G.run.seed=found;G.run.order[0]=A.ZONES.findIndex(z=>z.key==='thistle');A.resetMaps();const m=A.getMap('t0'),g=m.gates.next,ex=m.exits.find(e=>e.to&&e.to.m==='f0'&&e.y===g.y)||m.exits.find(e=>e.to&&e.to.m==='f0');
    T('placeAt')('t0',g.arrive[0],g.arrive[1],'l');const p=T('awPlan')(m,ex.x+1,ex.y);T('enterVia')(ex.to);const inF={m:A.WS.m.id,x:A.WS.x,y:A.WS.y,solid:T('solidAt')(A.WS.m,A.WS.x,A.WS.y),side:A.WS.m.gates.start.side};
    // the connected world map: the field lies west of the town, joined at the gate, and a tap on a seen town tile from the field finds its way back
    G.been=Object.assign(G.been||{},{t0:1,f0:1});const L=T('bmLayout')(),mt=L.maps.find(o=>o.id==='t0'),mf=L.maps.find(o=>o.id==='f0'),lk=L.links[0];const big={n:L.maps.length,west:!!mf&&!!mt&&mf.ox+mf.m.w<=mt.ox+1,gap:lk?lk.gap:-1,route:T('bmRoute')('t0',g.arrive[0],g.arrive[1]).res};A.WS.route=null;T('haltInput')();
    const fx=A.WS.m.exits.find(e=>e.to&&e.to.m==='t0');T('enterVia')(fx.to);const back={m:A.WS.m.id,x:A.WS.x,y:A.WS.y,at:g.arrive.slice(0,2)};
    return {seed:found,side:g.side,cells:m.exits.filter(e=>e.to&&e.to.m==='f0').length,closedEast:!m.exits.some(e=>e.x===m.w-1),inF,back,big,sign:__W16.api.signAudit(m)};});
  chk(`4 the connected world map lays that field out west of the town, joined at the gate (gap ${W.big.gap}), and a tap on the town from the field starts a route (${W.big.route})`,W.big.n===2&&W.big.west&&W.big.gap===0&&W.big.route==='ok'||JSON.stringify(W.big));
  chk(`4 a first town whose way out is west: three exit tiles on the west edge, the east gate closed, the field entered on its east side, and back at the west gate`,W.side==='w'&&W.cells===3&&W.closedEast&&W.inF.m==='f0'&&!W.inF.solid&&W.inF.side==='e'&&W.back.m==='t0'&&W.back.x===W.back.at[0]&&W.back.y===W.back.at[1]&&W.sign.every(a=>a.ok)||JSON.stringify(W));}
if(want('5')){
  const N=await H.ev(()=>({names:__W16.api.names(),not:__W16.api.NOT,ren:__W16.api.RENAMED,nine:__W16.api.roots(null,['hollow','ash','ember','thorn','gloam','bone','mist','spire','cinder']),
    best:(()=>{const B=__A.TW.get('BEST_RENAME'),rb=__A.TW.get('renameBest');const o=rb({'The Glass Widow':{seen:3,kills:2,scan:1,known:{fire:1}},'Echo Candleking Moth':{seen:1,kills:1},'Hollowfang the Grudge':{seen:2,kills:0}});return {o,n:Object.keys(B).length};})(),
    lore:(()=>{const A=__A,T=A.TW.get;let miss=[];A.ZONES.forEach(z=>{try{if(!T('LM_BY_TOWN')[z.town])miss.push('landmark '+z.town);}catch(e){}});return miss;})()}));
  const R=audit(N.names,N.not),rank=['warden','master','hand'],over=R.filter(o=>!rank.includes(o.r)&&(o.p>2||o.w>4)),ro=R.filter(o=>rank.includes(o.r)&&(o.p>2||o.w>6));
  console.log('  names: '+Object.keys(N.names).map(k=>k+' '+N.names[k].length).join(', ')+'; roots shared by two or more names: '+R.filter(o=>o.w>1).length);
  console.log('  the fullest roots now: '+R.slice(0,12).map(o=>`${o.r} ${o.p}/${o.w}`).join(', '));
  chk('5 no root is in more than 2 names across realms, towns, dungeons and bosses',over.filter(o=>o.p>2).length===0||over.filter(o=>o.p>2).map(o=>o.r+' '+o.p+': '+JSON.stringify(o.hit)).slice(0,4).join(' ; '));
  chk('5 no root is in more than 4 names across places, bosses, foes, wayfarers, guilds and quests (guild rank words warden, master, hand: at most 6)',over.filter(o=>o.w>4).length===0&&ro.length===0||over.filter(o=>o.w>4).concat(ro).map(o=>o.r+' '+o.w+': '+JSON.stringify(o.hit)).slice(0,4).join(' ; '));
  console.log('  the owner\'s roots across everything: '+Object.keys(N.nine).map(k=>`${k} ${N.nine[k].all} (${N.nine[k].place} places)`).join(', '));
  chk('5 hollow, ash, ember, thorn, gloam, bone, mist, spire, cinder: at most 2 places and 6 names each across everything (skills and items too)',Object.values(N.nine).every(o=>o.place<=2&&o.all<=6)||JSON.stringify(Object.keys(N.nine).filter(k=>N.nine[k].place>2||N.nine[k].all>6).map(k=>[k,N.nine[k].hit])));
  const all=[].concat(...Object.values(N.names)),left=N.ren.filter(([k,a])=>!/ X /.test(a)&&all.includes(a)).map(q=>q[1]),gone=N.ren.filter(([k,a,b])=>k!=='rival'&&!/ X/.test(b)&&!all.some(n=>n===b||n.indexOf(b)>=0));
  chk(`5 none of the ${N.ren.length} old names is still a name, and every new one is`,left.length===0&&gone.length===0||JSON.stringify({left,gone:gone.map(q=>q[2])}));
  chk('5 Bestiary records move to the new names (a guardian, an Echo, a rival)',!!N.best.o['The Mirror Widow']&&N.best.o['The Mirror Widow'].kills===2&&!N.best.o['The Glass Widow']&&!!N.best.o['Echo Emperor Candlemoth']&&!!N.best.o['Grimhowl the Grudge']||JSON.stringify(N.best.o));
  chk('5 every town still has its landmark under its (new) name',N.lore.length===0||N.lore.join(', '));
  // an old save (revision 2, old names in its quest text) loads and plays
  const O=await H.ev(async()=>{const A=__A,G=A.G,T=A.TW.get;G.dunRev=2;G.run.seed=424242;G.quests.forEach(q=>{q.desc=(q.desc||'').replace('Larkspur','Hollowmere');});G.explored={};A.resetMaps();T('placeAt')('t0',5,13,'r');A.saveGame();
    const raw=localStorage.getItem('aurelis-wayfarers-v3');A.ACT.quitTitle&&A.ACT.quitTitle();await new Promise(r=>setTimeout(r,300));localStorage.setItem('aurelis-wayfarers-v3',raw);T('svLoad')(0);await new Promise(r=>setTimeout(r,400));
    const m=A.WS.m;return {screen:A.V.screen,rev:A.G.dunRev,map:m&&m.id,town:T('ZS')(0).town,west:T('worldPlan')().some(p=>p.tn==='w'||p.fe==='w'),signs:__W16.api.signAudit(m).every(a=>a.ok),err:__W16.err.slice()};});
  chk(`5 an old save loads: in ${O.town}, its plan kept (revision ${O.rev}, no west), its gates with posts`,O.screen==='world'&&O.rev===2&&O.map==='t0'&&!O.west&&O.signs&&O.err.length===0||JSON.stringify(O));}
chk('no console error',H.errs.length===0||H.errs.slice(0,3).join(' | '));
await done(H);}else{const {chk:c2}=require('./pw');const b=await chromium.launch();await done({browser:b});}
})();
