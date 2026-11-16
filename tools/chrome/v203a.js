// guard21.js (v0.22.13): guardians with their own designs, big on the map.
//  1 each of the twenty guardians (MINIS) has its own 60 x 60 drawing: not the base foe's shape (silhouette overlap with the old 1.5x
//    enlargement under 70%), all twenty silhouettes different from each other, idle B differs from idle A, drawn at 60 px (no enlargement)
//  2 a guardian fight and a summon use the new art (the foe's art is the mb_ id and its canvas draws)
//  3 on the map (Medium HD-2D and Low 2D): the Den guardian is drawn by guard21 a fifth wider than before, the core pass skips it, it is
//    still an actor (blocks its tile, talking asks to fight)
//  4 an elite roamer is drawn big (wider than a plain roamer) with its ring; after the frames it is alive again (the hide is undone)
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v203a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v203a ran over 240 s');process.exit(1);},240000).unref();
const META=g=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${g}',rmotion:false,hints:false,tips:false}}));`;
const START=()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=4242;try{A.resetMaps();A.syncPools();}catch(e){}};
(async()=>{let H=await open({w:1000,h:560,pre:META('medium'),tag:'v203a'});let {ev,wait}=H;
  await ev(START);await wait(400);
  // ---- 1 ----
  const a=await ev(()=>{const g=__A.TW.get,MINIS=g('MINIS'),MON=g('MON'),MART=g('MART'),mc=g('monCanvas'),PG=g('PG'),G21=window.__G21;
    const mask=(art,f,base)=>{const s=base?40:60,p=new PG(s,s,0,0);MART[art](p,f);const out=new Uint8Array(3600);for(let y=0;y<60;y++)for(let x=0;x<60;x++){const sx=base?Math.floor(x/1.5):x,sy=base?Math.floor(y/1.5):y;out[y*60+x]=p.g(sx,sy)?1:0;}return out;};
    const iou=(A,B)=>{let i=0,u=0;for(let k=0;k<A.length;k++){if(A[k]&&B[k])i++;if(A[k]||B[k])u++;}return u?i/u:0;};
    const own=Object.keys(G21.art).length,rows=[],M={};
    MINIS.forEach(D=>{const id=D[0],base=MON[id].base,c=mc(id),m0=mask(id,null),mb=mask(MON[base].art,null,true),m1=mask(id,{t:'idle',i:1});M[id]=m0;
      let diff=0;for(let k=0;k<3600;k++)if(m0[k]!==m1[k])diff++;
      rows.push({id,own:MART[id]===G21.art[id],w:c.width,h:c.height,base:+iou(m0,mb).toFixed(2),idle:diff});});
    let maxPair=0,pair='';const ids=Object.keys(M);for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const v=iou(M[ids[i]],M[ids[j]]);if(v>maxPair){maxPair=v;pair=ids[i]+'/'+ids[j];}}
    return {own,rows,maxPair:+maxPair.toFixed(2),pair};});
  const bad1=a.rows.filter(r=>!r.own||r.w!==60||r.h!==60||r.base>=.7||r.idle<4);
  chk(`1 twenty own designs (${a.own}), each 60 px, not the base foe's shape (max overlap ${Math.max(...a.rows.map(r=>r.base))}), idle B moves (min ${Math.min(...a.rows.map(r=>r.idle))} px), most alike pair ${a.pair} ${a.maxPair}`,
    (a.own===20&&a.rows.length===20&&!bad1.length&&a.maxPair<.8)||JSON.stringify(bad1.length?bad1:a));
  // ---- 2 ----
  const b=await ev(()=>{const A=__A,g=A.TW.get;A.startBattle({stage:0,kind:'mini',mini:{id:'k0',mon:'mb_gorehorn',name:'Gorehorn, Warden of the Drifts',mod:'thorns'}});
    const e=A.B.en[0],c=g('monCanvas')(e.art,{t:'atk',i:0}),s=g('sumMake')?1:0;return {art:e.art,w:c.width,boss:g('BIG_ART').includes(e.art),s};});
  chk(`2 a guardian fight uses the new art (${b.art}, canvas ${b.w}, boss size ${b.boss})`,(b.art==='mb_gorehorn'&&b.w===60&&b.boss)||JSON.stringify(b));
  await H.browser.close();
  // ---- 3, 4 at Medium and Low ----
  for(const gfx of ['medium','low']){H=await open({w:1000,h:560,pre:META(gfx),tag:'v203a'+gfx});({ev,wait}=H);await ev(START);await wait(300);
    const pre=await ev(()=>{const A=__A,m=A.getMap('k0'),a=A.dynActors(m).find(x=>x.mini);if(!a)return null;let p=null;for(const d of [3,2,4,1])if(!A.solidAt(m,a.x,a.y+d)){p=[a.x,a.y+d];break;}
      A.placeAt('k0',p[0],p[1],'u');A.V.modal=null;A.render();window.__G21.G21.n.mini=0;return {a:[a.x,a.y],p};});
    await wait(1500);
    const c=await ev((pre)=>{const A=__A,G21=window.__G21.G21,m=A.WS.m,[x,y]=pre.a;const solid=A.solidAt(m,x,y);
      // the core pass is told to skip it while drawing: the hidden list has no guardian
      G21.hide++;const hid=A.dynActors(m).some(q=>q.mini);G21.hide--;
      A.placeAt('k0',x,y+1,'u');A.WS.lock=false;A.WS.dir='u';A.interact();const modal=A.V.modal&&A.V.modal.type;A.V.modal=null;A.render();
      return {n:G21.n.mini,last:G21.last.mini,solid,hid,modal,err:G21.err||null};},pre);
    const want=gfx==='low'?['2d',44]:['hd',44];
    chk(`3 ${gfx}: the Den guardian is drawn by guard21 (${c.n} frames, ${JSON.stringify(c.last)}; was 40 wide in HD-2D), skipped by the core pass (${!c.hid}), still solid (${c.solid}), talking asks to fight (${c.modal})`,
      (c.n>5&&c.last&&c.last[0]===want[0]&&c.last[1]>=want[1]&&!c.hid&&c.solid&&c.modal==='miniask'&&!c.err)||JSON.stringify(c));
    await ev(()=>{const A=__A,m=A.getMap('f0');A.placeAt('f0',...A.mapEntry(m),'d');});await wait(700);
    const r0=await ev(()=>{const A=__A,m=A.WS.m;if(!m.roam)return null;const e=m.roam.find(q=>!q.dead);e.elite=true;e.mode='patrol';e.rest=performance.now()+60000;
      const near=[[2,0],[-2,0],[0,2],[0,-2],[3,0],[-3,0]].map(([dx,dy])=>[A.WS.x+dx,A.WS.y+dy]).find(([x,y])=>!A.solidAt(m,x,y));e.x=e.hx=e.fx=near[0];e.y=e.hy=e.fy=near[1];e.t0=0;
      window.__G21.G21.n.elite=0;return m.roam.indexOf(e);});
    await wait(1200);
    const d=await ev((i)=>{const A=__A,G21=window.__G21.G21,e=A.WS.m.roam[i];return {n:G21.n.elite,last:G21.last.elite,dead:e.dead,h:!!e._g21h,err:G21.err||null};},r0);
    const wmin=gfx==='low'?25:30;
    chk(`4 ${gfx}: the elite roamer is drawn big (${d.n} frames, ${JSON.stringify(d.last)}; a roamer is ${gfx==='low'?22:27}), alive after the frames (${!d.dead&&!d.h})`,
      (d.n>5&&d.last&&d.last[1]>=wmin&&!d.dead&&!d.h&&!d.err)||JSON.stringify(d));
    if(gfx==='low')break;await H.browser.close();}
  await done(H);})();
