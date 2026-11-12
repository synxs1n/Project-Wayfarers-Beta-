// v0.19.6 worldart13.js: every entrance stands as a solid mass (the tent recipe) in both renderers. v0.20.1: front facing ("just make all den, sanctum
// and dungeon entrances front facing for now"): the mass rises straight up, a top face along its upper edge, no side face.
//  1. sheet: every den mouth and lair front is at least 2.2 tiles tall, its top face is lighter than the front just under it, its silhouette is symmetric
//     (left and right margins within 2 px), every added pixel stands straight over the front (no diagonal side face), it is no wider than the front,
//     the mouth's darkest column lies inside the mass, the old sprite (window.__WA13.off) is shorter and has no faces
//  2. a field: the den, lair and Sanctum shrine stand in the depth sort (m.bsp), the shrine front is at least 2.2 tiles tall, a cast shadow darkens the
//     ground to the right of each mass and not the left (drawTile on against off), the hero one tile behind a den is partly covered in 2D
//  3. 150 fields (30 journeys x 5 stages): no entrance blocks its own door tile, every approach stays open, mapIssues are unchanged (the pass touches no tile)
//  4. HD-2D: the entrance cards are built as building geometry with a footprint in the sun shadow heightfield (one entry per tile column, following the
//     front's outline, symmetric about the door), no strip card is left on the E tiles, the hero one tile behind the den is partly covered
//  5. the Sanctum's inner door (2D actor and HD-2D billboard) and the Echo Rift gates get a top face and no side face; no errors anywhere
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v175a.js [ONLY=1,2,3,4,5]
const {open,chk,done}=require('./pw');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:true,hints:false,tips:false,minimap:false,hd2d:true}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const only=process.env.ONLY||'',want=n=>!only||only.split(',').includes(n);
const bound=(p,ms,what)=>{let t;return Promise.race([p,new Promise((_,rej)=>{t=setTimeout(()=>rej(new Error('timeout after '+ms+' ms: '+what)),ms);})]).finally(()=>clearTimeout(t));};
setTimeout(()=>{console.log('FAIL watchdog: v175a ran over 800 s');process.exit(1);},800000).unref();
async function boot(t,w,h){const H=await open({w:w||430,h:h||760,mobile:true,dpr:1,pre:META(t)});const ev0=H.ev;H.ev=(f,a)=>bound(ev0(f,a),120000,'page call');const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=424242;A.resetMaps();A.render();});await H.wait(500);return H;}
// a field of the realm `key` (its zone index) at the first stage 1..4 that holds a den; the hero is placed on the lane in front of it
const FIELD=`([key,stage])=>{const A=__A,G=A.G,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));let f=null;for(const s of (stage?[stage]:[1,2,3,4])){G.run.order[s]=zi[key];G.cleared[s]=0;A.resetMaps();G.clock=150;G.weather[s]='clear';const m=A.getMap('f'+s);if((m.caves||[]).some(q=>q.kind!=='fort')||stage){f=m;break;}}
  if(!f)return null;const c=(f.caves||[]).find(q=>q.kind!=='fort')||null,fo=(f.caves||[]).find(q=>q.kind==='fort')||null;A.V.modal=null;A.WS.dlg=null;const o=c?[c.x+c.face[0]*3,c.y+c.face[1]*3]:[f.ent[0]+f.entFace[0]*3,f.ent[1]+f.entFace[1]*3];A.placeAt(f.id,o[0],o[1],'u');A.WS.cam=null;A.render();
  return {id:f.id,den:c&&{x:c.x,y:c.y,face:c.face},ent:f.ent,entFace:f.entFace,fort:fo&&{x:fo.x,y:fo.y},bsp:(f.bsp||[]).map(q=>q.b.k)};}`;
// pixels of the hero's box on the 2D canvas (the composed frame in HD-2D) for a frame drawn at a fixed time, with and without the entrance sprites
const HERO_BOX=`([tx,ty,id])=>{const A=__A,m=A.WS.m,HD=A.HD;A.placeAt(id,tx,ty,'d');A.WS.cam=null;A.render();const t=performance.now();A.worldDraw(t);A.worldDraw(t);
  // above Low the world canvas holds a 2x bitmap (sprhd2 ssCanvas: _rw x _rh real pixels behind a logical width): read the real pixels
  const cv=A.WS.cv,RW=cv._rw||cv.width,RH=cv._rh||cv.height,sc=RW/A.WS.vw;let hx,hy;if(HD.live){hx=(HD.heroNdc[0]+1)/2*RW/sc;hy=(1-HD.heroNdc[1])/2*RH/sc;}else{hx=Math.round(A.WS.px)+8-Math.round(A.WS.cam.x);hy=Math.round(A.WS.py)+4-Math.round(A.WS.cam.y);}
  const box=()=>cv.getContext('2d').getImageData(Math.round((hx-8)*sc),Math.round((hy-14)*sc),Math.round(16*sc),Math.round(28*sc)).data;
  const keep=m.bsp;const draw=()=>{A.WS.cam=null;if(HD.live){HD.dirty=true;}A.worldDraw(t);A.worldDraw(t);return Array.from(box());};
  const withIt=draw();m.bsp=keep.filter(q=>!/^wa13/.test(q.b.k));let without;try{without=draw();}finally{m.bsp=keep;}draw();
  let diff=0,n=0;for(let i=0;i<withIt.length;i+=4){n++;if(Math.abs(withIt[i]-without[i])+Math.abs(withIt[i+1]-without[i+1])+Math.abs(withIt[i+2]-without[i+2])>24)diff++;}
  return {diff,n,share:n?diff/n:0,hd:!!HD.live,hx:Math.round(hx),hy:Math.round(hy),sc};}`;
(async()=>{
  // ---------- 1. the sheet ----------
  if(want('1')){const H=await boot('low');const {ev}=H;
    const R=await ev(()=>{const A=__A,T=A.TW.get,W=window.__WA13,DEN=T('SL_DEN'),LK=T('SL_LKIT'),den=T('slDenByKey'),lair=T('slLairByKit'),out={};
      const meas=cv=>{const w=cv.width,h=cv.height,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(cv,0,0);const d=x.getImageData(0,0,w,h).data;
        let y0=h,y1=-1,x0=w,x1=-1;const col=new Float64Array(w),cn=new Int32Array(w);const yl=Math.floor(h*.4);
        for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const i=(y*w+xx)*4;if(d[i+3]<=180)continue;if(y<y0)y0=y;if(y>y1)y1=y;if(y>=yl){if(xx<x0)x0=xx;if(xx>x1)x1=xx;col[xx]+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;cn[xx]++;}}
        // the front's extent over the opening's rows (its lowest 38%) and the darkest block, which must lie inside the front's extent, 8 px off either edge
        const st=cv.__wa13||null;let dk=-1,dv=1e9,fx0=0,fx1=0;if(st&&st.front){const F=st.front,fw=F.width,fh=F.height,fd=F.getContext('2d').getImageData(0,0,fw,fh).data,fc=new Float64Array(fw),fn=new Int32Array(fw);fx0=fw;fx1=-1;
          for(let y=Math.floor(fh*.62);y<fh;y++)for(let xx=0;xx<fw;xx++){const i=(y*fw+xx)*4;if(fd[i+3]<=180)continue;if(xx<fx0)fx0=xx;if(xx>fx1)fx1=xx;fc[xx]+=fd[i]*.3+fd[i+1]*.59+fd[i+2]*.11;fn[xx]++;}
          // the darkest 5 x 5 block of opaque pixels (the inside of the opening, under its lintel) must sit inside the front, 8 px off either edge
          const L=new Float32Array(fw*fh);for(let i=0;i<fw*fh;i++)L[i]=fd[i*4+3]>180?fd[i*4]*.3+fd[i*4+1]*.59+fd[i*4+2]*.11:-1;
          for(let y=0;y+5<=fh;y++)for(let xx=0;xx+5<=fw;xx++){let s=0,ok=true;for(let j=0;j<5&&ok;j++)for(let k=0;k<5;k++){const v=L[(y+j)*fw+xx+k];if(v<0){ok=false;break;}s+=v;}if(!ok)continue;if(s/25<dv){dv=s/25;dk=xx+2;}}}
        // front facing: the top face (per column, the n rows over the front's top) against the front just under it (the n rows under its outline);
        // the mass's left and right margins (whole box, and the mean over the lower 60% of its rows); added pixels that do not stand straight over a
        // front pixel within n rows (a side face would; the 1 px outline round the mass is left out)
        let topL=null,frontL=null,nTop=0,side=0,added=0,mL=0,mR=0,asym=0,rowAsym=0,wide=0;
        {let ax0=w,ax1=-1;for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++)if(d[(y*w+xx)*4+3]>180){if(xx<ax0)ax0=xx;if(xx>ax1)ax1=xx;}mL=ax0;mR=w-1-ax1;asym=Math.abs(mL-mR);
          let ra=0,rn=0;for(let y=Math.floor(y0+(y1-y0)*.4);y<=y1;y++){let a=-1,b=-1;for(let xx=0;xx<w;xx++)if(d[(y*w+xx)*4+3]>180){if(a<0)a=xx;b=xx;}if(a<0)continue;ra+=a-(w-1-b);rn++;}rowAsym=rn?Math.abs(ra/rn):0;}
        if(st&&st.front){const F=st.front,fw=F.width,fh=F.height,n=st.n,fx=st.fx||0,fd=F.getContext('2d').getImageData(0,0,fw,fh).data,fs=(x,y)=>x>=0&&y>=0&&x<fw&&y<fh&&fd[(y*fw+x)*4+3]>180,L=i=>d[i]*.3+d[i+1]*.59+d[i+2]*.11;
          wide=w-fw;let ts=0,fsum=0,fn=0;
          for(let xx=0;xx<fw;xx++){let yf=0;while(yf<fh&&!fs(xx,yf))yf++;if(yf>=fh)continue;for(let k=0;k<n;k++){const i=((yf+k)*w+xx+fx)*4;if(d[i+3]>180){ts+=L(i);nTop++;}}
            for(let k=1;k<=n;k++)if(fs(xx,yf+k)){fsum+=L(((yf+n+k)*w+xx+fx)*4);fn++;}}
          topL=nTop?Math.round(ts/nTop):null;frontL=fn?Math.round(fsum/fn):null;
          for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const i=(y*w+xx)*4;if(d[i+3]<=180||fs(xx-fx,y-n))continue;if(d[i]===0x12&&d[i+1]===0x0c&&d[i+2]===0x14)continue;added++;let ok=false;for(let k=1;k<=n&&!ok;k++)if(fs(xx-fx,y-n+k))ok=true;if(!ok)side++;}}
        return {w,h,tall:y1-y0+1,x0,x1,fx0,fx1,dark:dk,darkL:Math.round(dv),topL,frontL,nTop,added,side,mL,mR,asym,rowAsym:+rowAsym.toFixed(1),wide,h0:st&&st.h0};};
      for(const k of Object.keys(DEN))out['den:'+k]=meas(den(k));
      for(const k of Object.keys(LK))out['lair:'+k]=meas(lair(Object.assign({id:k},LK[k]),false));
      W.off=true;const old={den:meas(den('thistle')),lair:meas(lair(Object.assign({id:'smelter'},LK.smelter),false))};W.off=false;
      return {out,old,err:W.err};});
    const keys=Object.keys(R.out),bad=[];
    for(const k of keys){const r=R.out[k];const ok=r.tall>=36&&r.topL!=null&&r.topL>=r.frontL*1.08&&r.nTop>=40&&r.dark>=r.fx0+8&&r.dark<=r.fx1-8;if(!ok)bad.push(k+' '+JSON.stringify(r));}
    const mn=f=>Math.min(...keys.map(k=>f(R.out[k]))),mx=f=>Math.max(...keys.map(k=>f(R.out[k])));
    console.log('sheet table (key tall topL frontL ratio asym rowAsym side/added):\n'+keys.map(k=>{const r=R.out[k];return `  ${k.padEnd(18)} ${r.w}x${r.h} tall ${r.tall} top ${r.topL} front ${r.frontL} x${(r.topL/Math.max(1,r.frontL)).toFixed(2)} asym ${r.asym} row ${r.rowAsym} side ${r.side}/${r.added}`;}).join('\n'));
    chk(`sheet: ${keys.length} den mouths and lair fronts are at least 2.2 tiles tall (${mn(r=>r.tall)} to ${mx(r=>r.tall)} px), their top face is at least 1.08x as light as the front under it (${mn(r=>r.topL/Math.max(1,r.frontL)).toFixed(2)}x to ${mx(r=>r.topL/Math.max(1,r.frontL)).toFixed(2)}x), the mouth's darkest column lies inside the mass`,!bad.length||bad.join(' | '));
    // (the mean over the body rows is reported, not required: the orchard press house has its apple tree on the left, the observatory its telescope on
    // the right; the mass is centred by its whole box)
    const sym=keys.filter(k=>{const r=R.out[k];return r.asym>2||r.wide!==0;});
    chk(`sheet: front facing, symmetric: the mass is as wide as its front (${mx(r=>r.wide)} px added at the sides), its left and right margins differ by ${mx(r=>r.asym)} px at most (2 allowed; mean over the body rows ${mx(r=>r.rowAsym)} px at most, ${keys.filter(k=>R.out[k].rowAsym>2).join(', ')||'none'} over 2 for a prop on one side)`,!sym.length||sym.map(k=>k+' '+JSON.stringify(R.out[k])).join(' | '));
    const sd=keys.filter(k=>R.out[k].side>0||R.out[k].added<40);
    chk(`sheet: no diagonal side face: every one of the ${keys.reduce((a,k)=>a+R.out[k].added,0)} added pixels stands straight over the front within the top face's depth (${keys.reduce((a,k)=>a+R.out[k].side,0)} do not)`,!sd.length||sd.map(k=>k+' '+JSON.stringify(R.out[k])).join(' | '));
    chk(`sheet: the old sprites were flatter (den thistle ${R.old.den.tall} px, no faces: ${R.old.den.topL}; lair smelter ${R.old.lair.tall} px) against ${R.out['den:thistle'].tall} and ${R.out['lair:smelter'].tall} now`,R.old.den.tall<R.out['den:thistle'].tall&&R.old.den.topL==null&&R.old.lair.tall<R.out['lair:smelter'].tall);
    chk(`sheet: no worldart13 error ${JSON.stringify(R.err)}`,!R.err.length);
    await H.browser.close();}
  // ---------- 2. a field in 2D ----------
  if(want('2')){const H=await boot('low');const {ev}=H;
    const F=await ev(`(${FIELD})(['thistle',0])`);
    chk(`2D: a field with a den (${F&&F.id}), its den, lair and shrine stand in the depth sort: ${F&&F.bsp.join(', ')}`,!!F&&F.bsp.includes('wa13den')&&F.bsp.includes('wa13lair')&&F.bsp.includes('wa13gate')||JSON.stringify(F));
    if(F){
      // the shrine front's building sprite is at least 2.2 tiles tall; the den's and lair's too
      const bs=await ev(()=>{const A=__A,m=A.WS.m,out={};m.bsp.filter(q=>/^wa13/.test(q.b.k)).forEach(q=>{const cv=q.cv,d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let y0=cv.height,y1=-1;for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(d[(y*cv.width+x)*4+3]>120){if(y<y0)y0=y;if(y>y1)y1=y;}out[q.b.k]={tall:y1-y0+1,foot:cv.height-6-y1,sort:q.b.y+q.b.h-1,door:q.b.door};});return out;});
      chk(`2D: the building sprites stand on the door tile's south edge and rise ${JSON.stringify(Object.fromEntries(Object.entries(bs).map(([k,v])=>[k,v.tall])))} px (2.2 tiles = 36)`,['wa13den','wa13lair','wa13gate'].every(k=>bs[k]&&bs[k].tall>=36&&bs[k].sort===bs[k].door[1])||JSON.stringify(bs));
      // the cast shadow: the ground tile right of each mass is darker with the pass than without, the tile left of it is not
      const cs=await ev(()=>{const A=__A,m=A.WS.m,W=window.__WA13,T=A.TW.get,dt=T('drawTile'),S=W.api.sites(m),out=[];
        const lum=(x,y,off)=>{W.off=off;const c=document.createElement('canvas');c.width=16;c.height=16;const g=c.getContext('2d');g.translate(-x*16,-y*16);dt(g,m,x,y,0);W.off=false;const d=g.getImageData(0,0,16,16).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;return s/(d.length/4);};
        S.forEach(s=>{const y=s.ey,xr=s.ex+(s.kind==='gate'?2:3);if(A.solidAt(m,xr,y))return;let xl=null;for(const dx of [3,4,2])if(!A.solidAt(m,s.ex-dx,y)){xl=s.ex-dx;break;}
          out.push({k:s.kind,x:xr,y,r:[lum(xr,y,false),lum(xr,y,true)],l:xl==null?null:[lum(xl,y,false),lum(xl,y,true)]});});return out;});
      chk(`2D: a cast shadow on the ground to the lower right of each mass (${cs.map(o=>`${o.k} right ${o.r[0].toFixed(0)} vs ${o.r[1].toFixed(0)} without, left ${o.l?o.l[0].toFixed(0)+' vs '+o.l[1].toFixed(0):'solid'}`).join('; ')})`,cs.length>=2&&cs.every(o=>o.r[0]<=o.r[1]-2&&(!o.l||Math.abs(o.l[0]-o.l[1])<1.5))||JSON.stringify(cs));
      // the hero one tile behind the den's footprint (row ey-2) is partly covered by the mass
      const spot=await ev(([d,id])=>{const A=__A,m=A.WS.m;for(const dx of [0,-1,1])if(!A.solidAt(m,d.x+dx,d.y-2))return [d.x+dx,d.y-2];return null;},[F.den,F.id]);
      if(spot){const b=await ev(`(${HERO_BOX})(${JSON.stringify([spot[0],spot[1],F.id])})`);const front=await ev(`(${HERO_BOX})(${JSON.stringify([F.den.x+F.den.face[0]*3,F.den.y+F.den.face[1]*3,F.id])})`);
        chk(`2D: the hero one tile behind the den (${spot}) is partly covered by the mass: ${Math.round(b.share*100)}% of his box changes when the entrance sprite is taken out of the depth sort (in front of it: ${Math.round(front.share*100)}%)`,b.share>=.1&&b.share<.98&&front.share<.05||JSON.stringify({b,front}));}
      else chk('2D: a free tile behind the den to stand on',false);}
    const E=await ev(()=>({n:window.__WA13.n,err:window.__WA13.err,sle:__A.TW.get('SLE')}));
    chk(`2D: volumes ${E.n.vol}, sprites in the sort ${E.n.bsp}, shrine fronts ${E.n.gate}, cast shadow tiles ${E.n.cast}; no error ${JSON.stringify(E.err)} ${JSON.stringify(E.sle)}`,E.n.vol>0&&E.n.bsp>0&&E.n.cast>0&&!E.err.length&&!E.sle.length);
    chk('2D: no page errors '+JSON.stringify(H.errs),!H.errs.length);await H.browser.close();}
  // ---------- 3. 150 fields: nothing blocks its own door ----------
  if(want('3')){const H=await boot('low');const {ev}=H;
    const R=await ev(()=>{const A=__A,G=A.G,W=window.__WA13,iss=A.TW.get('mapIssues'),out={fields:0,zero:0,mi:0,miOff:0,blocked:0,ents:0,err:0,ex:[]};const seed0=G.run.seed,ord0=G.run.order.slice();
      try{for(let k=0;k<30;k++){G.run.seed=k*7919+101;const NZ=A.ZONES.length;G.run.order=ord0.map((z,i)=>(k*5+i*7)%NZ);
        for(const off of [false,true]){W.off=off;G.sub=null;A.resetMaps();for(let s=0;s<5;s++){let m;try{m=A.getMap('f'+s);}catch(e){out.err++;continue;}const n=iss(m).length;if(off){out.miOff+=n;continue;}out.fields++;out.mi+=n;if(!n)out.zero++;
          const ents=[];if(m.ent)ents.push({x:m.ent[0],y:m.ent[1],o:m.entOut});(m.caves||[]).forEach(c=>ents.push({x:c.x,y:c.y,o:c.out}));
          ents.forEach(e=>{out.ents++;const t=m.t[e.y][e.x],open=e.o&&!A.solidAt(m,e.o[0],e.o[1]);if(t!=='E'||!open){out.blocked++;if(out.ex.length<3)out.ex.push(m.id+' '+JSON.stringify(e)+' '+t);}});}}}}
      finally{G.run.seed=seed0;G.run.order=ord0;W.off=false;A.resetMaps();}return out;});
    chk(`150 fields: ${R.fields} built, ${R.ents} entrances, none blocks its own door tile or its way out (${R.blocked}), mapIssues ${R.mi} with the pass against ${R.miOff} without (${R.zero} fields at 0), no generation error (${R.err})`,R.fields>=150&&R.blocked===0&&R.mi===R.miOff&&R.err===0||JSON.stringify(R));
    await H.browser.close();}
  // ---------- 4. HD-2D ----------
  if(want('4')){const H=await boot('medium',933,705);const {ev}=H;await ev(()=>{__A.META.cfg.hd2d=true;__A.gfxApply();});
    const F=await ev(`(${FIELD})(['thistle',0])`);await H.wait(1500);
    const S=await ev(([F])=>{const A=__A,HD=A.HD,W=window.__WA13,m=A.WS.m;if(!HD.live||!HD.S)return {live:false};const bh=HD.S.bh||[],V=HD.S.V;
      // the footprint: one 1 x 2 entry per tile column round the door, its height the front's wall over that column (its visible height less the top
      // face); it spans as far left of the door's column as right of it
      const at=(x,y)=>{const c=bh.filter(o=>o.wa13&&o.b.y===y-1&&o.b.w===1&&o.b.h===2&&Math.abs(o.b.x-x)<=3);if(!c.length)return null;const xs=c.map(o=>o.b.x-x);
        return {h:+Math.max(...c.map(o=>o.h/V)).toFixed(1),cols:c.length,span:[Math.min(...xs),Math.max(...xs)],hs:c.map(o=>Math.round(o.h/V))};};
      const d=at(F.den.x,F.den.y),l=F.ent&&at(F.ent[0],F.ent[1]);
      // the card strip holds nothing on the den's E tile: the quads of the cards mesh near it
      let strip=0;try{const bt=HD.S.mcd;strip=bt?-1:0;}catch(e){}
      return {live:true,geo:W.n.geo,V:HD.S.V,den:d,lair:l,bakes:HD.bakes,err:W.err};},[F]);
    const sym=o=>o&&o.span[0]===-o.span[1];
    chk(`HD-2D: live, the den and lair cards are building geometry (${S.geo} built) with a footprint in the sun shadow heightfield that follows the front, as wide left of the door as right (den columns ${S.den&&S.den.span} at ${S.den&&S.den.hs} px; lair ${S.lair&&S.lair.span} at ${S.lair&&S.lair.hs} px; the walls at least 1.6 tiles, 26 px)`,S.live&&S.geo>=2&&S.den&&S.den.h>=26&&S.den.cols>=3&&sym(S.den)&&S.lair&&S.lair.h>=26&&sym(S.lair)||JSON.stringify(S));
    // no strip card on the E tiles: baking the strip with the pass on leaves the den's E row to the other props
    const st=await ev(()=>{const A=__A,T=A.TW.get,m=A.WS.m,W=window.__WA13,dummy=document.createElement('canvas');dummy.width=dummy.height=1;const cnt=off=>{W.off=off;let n=0;const r=T('hdBakeCards')(m,A.HD.S,dummy,dummy);W.off=false;if(!r)return 0;r.bt.b.forEach(b=>{if(b)n+=b.n;});return n;};return {on:cnt(false),off:cnt(true)};});
    chk(`HD-2D: the card strip holds fewer quads with the pass (${st.on}) than without (${st.off}): the den and lair fronts left it`,st.on<st.off||JSON.stringify(st));
    const spot=await ev(([d])=>{const A=__A,m=A.WS.m;for(const dx of [0,-1,1])if(!A.solidAt(m,d.x+dx,d.y-2))return [d.x+dx,d.y-2];return null;},[F.den]);
    if(spot){const b=await ev(`(${HERO_BOX})(${JSON.stringify([spot[0],spot[1],F.id])})`);const front=await ev(`(${HERO_BOX})(${JSON.stringify([F.den.x+F.den.face[0]*3,F.den.y+F.den.face[1]*3,F.id])})`);
      chk(`HD-2D: the hero one tile behind the den (${spot}) is partly covered by the card: ${Math.round(b.share*100)}% of his box changes when the entrance card is taken out (in front of it: ${Math.round(front.share*100)}%)`,b.hd&&b.share>=.08&&b.share<.98&&front.share<.06||JSON.stringify({b,front}));}
    chk('HD-2D: no page errors '+JSON.stringify(H.errs),!H.errs.length);await H.browser.close();}
  // ---------- 5. the Sanctum's inner door and the Rift gates ----------
  if(want('5'))for(const tier of ['low','medium']){const H=await boot(tier,933,705);const {ev}=H;
    const D=await ev(async()=>{const A=__A,G=A.G,W=window.__WA13,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));G.run.order[1]=zi.strand;A.resetMaps();const f=A.getMap('f1'),c=(f.caves||[]).find(q=>q.kind==='fort');if(!c)return {no:1};
      A.placeAt('f1',c.out[0],c.out[1],'d');A.enterCave(c,1);A.V.modal=null;A.WS.dlg=null;const m=A.WS.m,d=W.api.doorAt(m),cv=W.api.door(m);A.placeAt(m.id,m.start[0],m.start[1],'u');A.WS.cam=null;A.render();
      // the doorway is front facing: its opaque box has equal left and right margins (within 2 px) and nothing stands right of the 24 px front
      const dd=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let x0=cv.width,x1=-1;for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(dd[(y*cv.width+x)*4+3]>180){if(x<x0)x0=x;if(x>x1)x1=x;}
      await new Promise(r=>setTimeout(r,1200));const n0=W.n.door;A.worldDraw(performance.now());return {d,h:cv.height,w:cv.width,mL:x0,mR:cv.width-1-x1,hd:!!A.HD.live,drew:W.n.door-n0};});
    chk(`${tier}: the Sanctum's inner door stands on its E tile (${D.d&&D.d.x},${D.d&&D.d.y}) as a ${D.w} x ${D.h} doorway with a top face, front facing (margins ${D.mL} and ${D.mR} px), drawn ${D.drew} times in a frame (HD-2D ${D.hd})`,D.d&&D.h>=22&&D.w<=26&&Math.abs(D.mL-D.mR)<=2&&D.drew>=1&&(tier==='low'?!D.hd:D.hd)||JSON.stringify(D));
    const R=await ev(async()=>{const A=__A,G=A.G,W=window.__WA13;G.won=true;G.echoStory={0:1,1:1,2:1,3:1,4:1};A.V.modal=null;A.getMap('s0');A.placeAt('s0',16,30,'u');A.WS.lock=false;A.WS.cam=null;A.render();await new Promise(r=>setTimeout(r,1200));
      const n0=W.n.rift;A.worldDraw(performance.now());const m=A.WS.m,g=(m.npcs||[]).find(n=>n.portal&&!n.forge),E=g&&W.api.rift(g);return {gates:(m.npcs||[]).filter(n=>n.portal).length,drew:W.n.rift-n0,ext:E&&[E.ext.width,E.ext.height,E.fw,E.fh,E.n,E.ox,E.oy,E.below],err:W.err};});
    // [card w, card h, front w, front h, depth, ...]: as wide as the panel (no side face), taller by the top face's depth
    chk(`${tier}: the Echo Rift gates (${R.gates}) carry a top face and no side face (${R.drew} drawn in a frame, faces ${JSON.stringify(R.ext)}), no error ${JSON.stringify(R.err)}`,R.gates>=10&&R.drew>=4&&R.ext&&R.ext[0]===R.ext[2]&&R.ext[1]===R.ext[3]+R.ext[4]&&R.ext[4]>=3&&!R.err.length||JSON.stringify(R));
    chk(`${tier}: no page errors `+JSON.stringify(H.errs),!H.errs.length);await H.browser.close();}
  console.log('done');process.exit(require('./pw').fails?1:0);
})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1);});
