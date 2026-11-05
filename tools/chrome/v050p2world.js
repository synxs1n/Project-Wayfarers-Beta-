// v0.5.0 2.3, 2.4, 2.5: world layout checks over every realm at every stage.
//  2.3 every gathering spot (wood, ore, herb) sits on or beside a matching feature, never on a road, in fields, dungeons and caves
//  2.4 every town gate sits on the edge it is named for, keeps its 3 tile width, and has a clear 2 wide lane to the main roads
//      (no building, prop or townsfolk in it); the same check without the fix shows the old layouts failed it
//  2.5 dungeon entrances vary by realm, are upright and visible (dark opening on the entrance tile), and differ from cave mouths
// Usage: PWHTML=../../out/aurelis3.html node v050p2world.js [seeds]
const {open,chk,done}=require('./pw');
const SEEDS=+process.argv[2]||3;
(async()=>{
  const H=await open({w:900,h:700});const {ev,wait,shot}=H;
  await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();__A.V.modal=null;});await wait(300);
  const r=await ev(SEEDS=>{const P=__P2,A=__A,G=A.G,out={detour:[],moved:0,reach:[],towns:0,gates:0,laneBad:[],sideBad:[],widthBad:[],oldBad:0,oldGates:0,nodes:{wood:0,ore:0,herb:0},nodeBad:[],oldNodeBad:0,oldNodes:0,maps:0,themes:{},err:[]};
    const Z=P.ZONES.length;
    for(let seed=0;seed<SEEDS;seed++)for(let s=0;s<5;s++)for(let zi=0;zi<Z;zi++){
      try{
      G.wv=3;G.run.seed=1000+seed*7919+zi*31+s;G.run.rv=2;const ord=[0,1,2,3,4].map(i=>(zi+i*3)%Z);ord[s]=zi;G.run.order=ord;
      A.resetMaps();
      // 2.4 towns, without and with the lane fix
      P.P2.noLane=true;const t0=P.getMap('t'+s);P.P2.noLane=false;const main0=P.laneMain(t0);
      P.laneGates(t0).forEach(g=>{out.oldGates++;if(!P.laneFind(t0,g,main0,'check'))out.oldBad++;});
      A.resetMaps();const t=P.getMap('t'+s),main=P.laneMain(t),W=t.w,Hh=t.h;out.towns++;out.themes[P.ZS(s).theme]=(out.themes[P.ZS(s).theme]||0)+1;
      P.laneGates(t).forEach(g=>{out.gates++;const tag=`seed${seed} s${s} z${zi} ${P.ZS(s).theme} gate ${g.side}`;
        const onEdge=g.cells.every(([x,y])=>g.side==='w'?x===0:g.side==='e'?x===W-1:g.side==='n'?y===0:y===Hh-1);if(!onEdge)out.sideBad.push(tag);
        if(t.gates){const gg=Object.values(t.gates).find(q=>q&&q.cells&&q.cells.some(c=>g.cells.some(d=>d[0]===c[0]&&d[1]===c[1])));if(gg&&gg.side!==g.side)out.sideBad.push(tag+' named '+gg.side);}
        if(g.cells.length<3)out.widthBad.push(tag+' width '+g.cells.length);
        const L=P.laneFind(t,g,main,'check');if(!L)out.laneBad.push(tag);else{const st=P.laneStraight(g,main);if(L.length>st*1.5+8)out.detour.push(tag+` lane ${L.length} vs ${st}`);}});
      if(t.gates)Object.values(t.gates).forEach(q=>{if(q&&q.moved)out.moved++;});
      // everything still connects: every exit, gate arrival and service door is reachable from the inn
      {const S=P.flood(t.t,t.road!=null?1:1,t.road);const inn=t.bld.find(b=>b.k==='inn');const S2=inn?P.flood(t.t,inn.door[0],inn.door[1]+1):S;
        t.exits.forEach(e=>{if(!S2[e.y]||!S2[e.y][e.x])out.reach.push(`seed${seed} s${s} z${zi} exit ${e.x},${e.y}`);});
        if(t.gates)Object.values(t.gates).forEach(q=>{if(q&&q.arrive&&!(S2[q.arrive[1]]&&S2[q.arrive[1]][q.arrive[0]]))out.reach.push(`seed${seed} s${s} z${zi} arrive ${q.arrive}`);});
        t.bld.forEach(b=>{if(['inn','tavern','smithy','guild','workshop'].includes(b.k)&&!(S2[b.door[1]+1]&&S2[b.door[1]+1][b.door[0]]))out.reach.push(`seed${seed} s${s} z${zi} door ${b.k}`);});}
      // 2.3 gathering spots in the field, the dungeon and the side cave of this stage
      ['f'+s,'d'+s].concat((P.getMap('f'+s).caves||[]).filter(c=>c.id&&c.id[0]==='k').map(c=>c.id)).forEach(id=>{let m;try{m=P.getMap(id);}catch(e){return;}if(!m||!m.nodes)return;out.maps++;
        m.nodes.forEach(n=>{out.nodes[n.k]=(out.nodes[n.k]||0)+1;if(!P.nodeFits(m,n.k,n.x,n.y))out.nodeBad.push(`${id} z${zi} ${n.k} at ${n.x},${n.y} on '${P.tileAt(m,n.x,n.y)}'`);});
        if(seed===0){const keep=m.nodes;P.P2.placeNodes0(m);m.nodes.forEach(n=>{out.oldNodes++;if(!P.nodeFits(m,n.k,n.x,n.y))out.oldNodeBad++;});m.nodes=keep;}});
      }catch(e){out.err.push(`seed${seed} s${s} z${zi}: ${e.message}`);}
    }
    return out;},SEEDS);
  console.log(JSON.stringify({moved:r.moved,towns:r.towns,gates:r.gates,themes:r.themes,nodes:r.nodes,maps:r.maps,oldBad:r.oldBad,oldGates:r.oldGates,oldNodeBad:r.oldNodeBad,oldNodes:r.oldNodes}));
  chk(`no errors building ${r.towns} towns`,r.err.length===0||r.err.slice(0,3).join(' | '));
  chk(`every town type checked (${Object.keys(r.themes).join(', ')})`,Object.keys(r.themes).length===6||Object.keys(r.themes).join());
  chk(`2.4 old layouts fail the lane check (${r.oldBad} of ${r.oldGates} gates), so the test catches the bug`,r.oldBad>0||'old layouts all pass');
  chk(`2.4 all ${r.gates} gates have a clear 2 wide lane to the main roads`,r.laneBad.length===0||r.laneBad.length+' bad: '+r.laneBad.slice(0,5).join(' | '));
  chk(`2.4 no lane is a long detour around buildings (${r.moved} gates moved along their edge)`,r.detour.length===0||r.detour.slice(0,5).join(' | '));
  chk(`2.4 every exit, gate arrival and service door is reachable`,r.reach.length===0||r.reach.slice(0,5).join(' | '));
  chk(`2.4 every gate sits on its own edge`,r.sideBad.length===0||r.sideBad.slice(0,5).join(' | '));
  chk(`2.4 every gate keeps its 3 tile width`,r.widthBad.length===0||r.widthBad.slice(0,5).join(' | '));
  chk(`2.3 old rule put spots on unmatched ground (${r.oldNodeBad} of ${r.oldNodes}), so the test catches the bug`,r.oldNodeBad>0||'old all fit');
  for(const [k,rule] of [['wood','beside a tree'],['ore','beside rock, cliff or wall'],['herb','on grass or by flowers']]){const bad=r.nodeBad.filter(x=>x.includes(' '+k+' at '));
    chk(`2.3 every ${k} spot sits ${rule}, never on a road (${r.nodes[k]} spots in ${r.maps} maps)`,bad.length===0||bad.length+' bad: '+bad.slice(0,5).join(' | '));}
  chk(`2.3 every node type is placed`,r.nodes.wood>0&&r.nodes.ore>0&&r.nodes.herb>0||JSON.stringify(r.nodes));
  // 2.5 entrances
  const e=await ev(()=>{const P=__P2,A=__A,G=A.G,styles={},bad=[];
    const Z=P.ZONES.length;for(let zi=0;zi<Z;zi++){G.run.order=[zi,1,2,3,4];const st=P.entStyleFor(0),th=P.ZS(0).theme;styles[st]=(styles[st]||0)+1;
      const cv=st==='facade'?P.obj2(th,'facade'):P.entCanvas(th,st),c=cv.getContext('2d'),d=c.getImageData(0,0,cv.width,cv.height).data;
      // the entrance tile is the bottom-centre 16x16 of the sprite: it must hold a dark opening; the top half must not be darker than the bottom (upright)
      let dark=0,top=0,bot=0;const W=cv.width,Hh=cv.height,cx=Math.floor(W/2);
      for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3]<200)continue;const l=d[i]+d[i+1]+d[i+2];if(l<70){if(y>=Hh-17&&Math.abs(x-cx)<=8)dark++;if(y<Hh/2)top++;else bot++;}}
      if(dark<20)bad.push(`z${zi} ${st}: no clear opening (${dark})`);if(top>bot)bad.push(`z${zi} ${st}: upside down`);
      if(st!=='facade'){const cm=P.obj2(th,'cavemouth').getContext('2d').getImageData(0,0,1,1);const a=cv.toDataURL(),b=P.obj2(th,'cavemouth').toDataURL();if(a===b)bad.push(`z${zi} ${st}: same as the cave mouth`);}}
    return {styles,bad};});
  chk(`2.5 at least five entrance looks across the realms (${JSON.stringify(e.styles)})`,Object.keys(e.styles).length>=5||JSON.stringify(e.styles));
  chk('2.5 every entrance is upright with a clear opening and differs from a cave mouth',e.bad.length===0||e.bad.slice(0,5).join(' | '));
  // a look at the entrance art and a town
  await ev(()=>{const P=__P2,box=document.createElement('div');box.id='entshow';box.style.cssText='position:fixed;left:0;top:0;z-index:999;background:#2a3a2a;padding:8px;display:flex;flex-wrap:wrap;gap:8px;width:880px';
    ['meadow','coast','cave','snow','heights','void'].forEach(th=>{['roots','barrow','well','trapdoor','rockface','hole','ruin'].forEach(st=>{const c=P.entCanvas(th,st),im=document.createElement('canvas');im.width=c.width*2;im.height=c.height*2;const x=im.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,0,0,im.width,im.height);box.appendChild(im);});});document.body.appendChild(box);});
  await shot('p2_entrances');
  await done(H);
})();
