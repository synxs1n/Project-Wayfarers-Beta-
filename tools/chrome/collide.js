// 1.1: try to enter every blocked tile (buildings, doors from the side, diagonals, tap-to-walk paths) in every town and field
const {open,chk,done}=require('./pw');
(async()=>{const h=await open();const {ev,wait}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
const res=await ev(()=>{
  const out={maps:0,tries:0,leaks:[],pathLeaks:[],holes:0};
  const DIRS=['u','d','l','r','ul','ur','dl','dr'];
  for(const seed of [3,11,29,57]){
    __A.G.run.seed=seed*7919+13;__A.resetMaps();
    for(const id of ['t0','t1','t2','t3','t4','f0','f2','f4']){
      const m=__A.getMap(id);out.maps++;
      const inFoot=(x,y)=>m.bld.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
      const isDoor=(x,y)=>m.bld.some(b=>b.door[0]===x&&b.door[1]===y);
      for(const b of m.bld)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(!__A.solidAt(m,x,y)&&!isDoor(x,y))out.holes++;
      // every walkable tile that touches a footprint: step in every direction through the real movement code
      __A.WS.m=m;__A.WS.mv=null;
      for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){
        if(__A.solidAt(m,x,y))continue;
        const near=[-1,0,1].some(dy=>[-1,0,1].some(dx=>inFoot(x+dx,y+dy)));if(!near)continue;
        for(const d of DIRS){
          __A.WS.m=m;__A.WS.x=x;__A.WS.y=y;__A.WS.px=x*16;__A.WS.py=y*16;__A.WS.mv=null;__A.WS.lock=false;__A.WS.dlg=null;__A.V.modal=null;__A.WS.held=[d];__A.WS.target=null;__A.WS.path=null;
          out.tries++;
          try{__A.worldTick(16,performance.now());}catch(e){}
          const mv=__A.WS.mv;__A.WS.held=[];
          if(mv&&inFoot(mv.tx,mv.ty)&&!isDoor(mv.tx,mv.ty))out.leaks.push(id+' '+x+','+y+' '+d+' -> '+mv.tx+','+mv.ty);
          if(mv&&isDoor(mv.tx,mv.ty)&&d!=='u')out.leaks.push(id+' door entered by '+d+' from '+x+','+y);
          __A.WS.mv=null;__A.V.modal=null;
        }
      }
      // tap-to-walk: path to every footprint tile must never route through one
      for(const b of m.bld){const sx=b.door[0],sy=Math.min(m.h-2,b.door[1]+2);if(__A.solidAt(m,sx,sy))continue;
        for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){const p=__A.findPath(m,sx,sy,x,y);if(!p)continue;let cx=sx,cy=sy;
          for(const st of p){if(st.startsWith('face:'))break;const v={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0],ul:[-1,-1],ur:[1,-1],dl:[-1,1],dr:[1,1]}[st];cx+=v[0];cy+=v[1];if(inFoot(cx,cy)&&!isDoor(cx,cy))out.pathLeaks.push(id+' path into '+cx+','+cy);}}}
    }
  }
  return out;});
console.log(`maps ${res.maps}, step attempts ${res.tries}`);
chk('no walkable tile inside a building footprint (other than doors) : '+res.holes,res.holes===0||'holes');
chk('no step enters a blocked footprint tile or a door from the side',res.leaks.length===0?true:res.leaks.slice(0,5).join(' | '));
chk('tap-to-walk never routes through a building',res.pathLeaks.length===0?true:res.pathLeaks.slice(0,5).join(' | '));
await done(h);})();
