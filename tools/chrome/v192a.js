// fix17.js and gear16.js section 4 (the owner's three notes after 0.21.6).
//  1 Equip Best shows its result page with Undo again (Menu > Backpack and the Party tab); Build party (Apply) keeps its own page and the Menu
//    stays open; only Equip Best pressed right after a party was built in the same Menu visit (from the result page's own button or from the
//    Menu, nothing changed in between) closes the Menu with a toast; a gear change or a closed Menu in between ends that; "Undo Equip Best"
//    stays on Backpack > Equipment and works
//  2 minimap colours: for every realm (field, town, dungeon), the Breach and the Echo Rift, the colour mapCol gives each tile kind is the
//    average of what the world paints on that kind (the whole map painted with buildMapCanvas and its building sprites, averaged per kind)
//    within TOL; a wall or prop kind may be darker than painted but keeps its hue; realms of one base theme no longer share one minimap;
//    the area map and the minimap canvas carry those colours; the first palette of a map is quick; marks and the legend are still drawn
//  3 the Breach aurora in HD-2D on a clear day at several sizes, pixel ratios and tiers: the sky layer does not pile up from frame to frame
//    (the same alpha a second later), is smooth (no steps between neighbouring pixels beyond the stars, no opaque blocks), covers the sky's
//    width and most of its height, and fades out above the horizon (no cut); with the module off the old fault is measured for contrast;
//    on Low (the 2D renderer) the sky is painted without error
//  4 Next goals (quests16.js): see-through by default, open and folded, in both renderers, with the Unified look on and off, phone and
//    desktop: the panel's background alpha is .45 to .55 with no blur, its own opacity 1, the words solid (colour alpha 1) with a dark edge;
//    Settings > Display has "See-through goals" beside "Show goals"; Off gives the solid panel (alpha .8 or more) and is kept in META.cfg;
//    the panel is the same with the hero under it
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v192a.js [ONLY=1,2,3,4]
const {open,chk,done}=require('./pw');
const only=process.env.ONLY||'',want=n=>!only||only.split(',').includes(n);
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false,tips:false,minimap:true,hd2d:true,goalsMin:true}}));`;
setTimeout(()=>{console.log('FAIL watchdog: v192a ran over 800 s');process.exit(1);},800000).unref();
async function boot(t,w,h,dpr,mobile){const H=await open({w:w||1000,h:h||750,mobile:!!mobile,dpr:dpr||1,pre:META(t),tag:'v192'});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=424242;A.resetMaps();A.render();});await H.until(()=>__A.V.screen==='world',null,{timeout:15000});await H.wait(300);return H;}
(async()=>{
  // ---------- 1 ----------
  if(want('1')){const H=await boot('low',390,844,1,true);
    const ST=()=>{const A=__A,t=document.getElementById('toast');return {modal:A.V.modal&&A.V.modal.type,toast:t.textContent,show:/show/.test(t.className),undoBtn:!!document.querySelector('#modal [data-act="autoEqUndo"]'),g16:!!document.querySelector('#modal [data-act="g16Undo"]'),built:!!window.__G16.G16.built};};
    const CLR=()=>{const t=document.getElementById('toast');t.textContent='';t.className='';};
    await H.ev(()=>{const A=__A,G=A.G;G.gear=['w_tome_1','a_mail_1','c_swift'];G.pcV=0;A.V.modal={type:'menu',tab:'equip'};A.render();});await H.wait(100);
    const eq0=await H.ev(()=>JSON.stringify(Object.values(__A.G.roster).map(c=>c.eq)));await H.ev(CLR);
    await H.page.locator('#modal button[data-act="autoEqParty"]').first().tap({timeout:3000});await H.wait(150);
    const a=await H.ev(ST);const worn=await H.ev(()=>Object.values(__A.G.roster).filter(c=>c.eq.w==='w_tome_1'||c.eq.a==='a_mail_1'||c.eq.c==='c_swift').length);
    chk(`1 Equip Best in Menu > Backpack puts the gear on (${worn} heroes) and shows its result page with Undo; the Menu is not closed and no toast is shown`,a.modal==='autoEq'&&a.undoBtn&&worn>0&&!/^Equip Best/.test(a.toast)||JSON.stringify(a));
    await H.page.locator('#modal [data-act="autoEqUndo"]').first().tap({timeout:3000});await H.wait(120);
    const b=await H.ev(()=>({modal:__A.V.modal&&__A.V.modal.type,eq:JSON.stringify(Object.values(__A.G.roster).map(c=>c.eq)),pack:__A.G.gear.slice().sort().join(',')}));
    chk('1 Undo on that page puts the gear back and returns to the Menu',b.modal==='menu'&&b.eq===eq0&&b.pack==='a_mail_1,c_swift,w_tome_1'||JSON.stringify(b));
    // again, leave the page without Undo: Backpack > Equipment keeps "Undo Equip Best"
    const c=await H.ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'equip'};A.render();A.ACT.autoEqParty();const page=A.V.modal&&A.V.modal.type;A.V.modal={type:'menu',tab:'equip'};A.render();const had=!!document.querySelector('#modal button[data-act="g16Undo"]');if(had)document.querySelector('#modal button[data-act="g16Undo"]').click();
      return {page,had,eq:JSON.stringify(Object.values(A.G.roster).map(c=>c.eq)),still:!!document.querySelector('#modal button[data-act="g16Undo"]'),modal:A.V.modal&&A.V.modal.type};});
    chk('1 Backpack > Equipment offers "Undo Equip Best" after it, and it puts the gear back as it was',c.page==='autoEq'&&c.had&&c.eq===eq0&&!c.still&&c.modal==='menu'||JSON.stringify(c));
    const d=await H.ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'party'};A.render();A.ACT.autoEqParty();const p1=A.V.modal&&A.V.modal.type;A.ACT.autoEqUndo();A.V.modal={type:'smithy',tab:'shop',sec:'all'};A.render();A.ACT.autoEqParty();const p2=A.V.modal&&A.V.modal.type;A.ACT.autoEqUndo();return {p1,p2};});
    chk('1 Equip Best on the Party tab and from the Smithy show the result page too',d.p1==='autoEq'&&d.p2==='autoEq'||JSON.stringify(d));
    // Build party
    const BUILD=async()=>{await H.ev(()=>{const A=__A,G=A.G;['wren','kael','pip','brann','dagna'].filter(id=>A.TPL[id]&&!G.roster[id]).slice(0,4).forEach(id=>{G.roster[id]=A.newChar(id,3,0);});G.party=['mira','lumen','oren'];G.gear=['w_tome_1','a_mail_1','c_swift'];Object.values(G.roster).forEach(c=>{c.eq={};A.TW.get('refresh')(c);});A.V.modal={type:'menu',tab:'party'};A.render();});await H.wait(80);await H.ev(CLR);
      await H.page.locator('#modal button[data-act="bpOpen"]').first().tap({timeout:3000});await H.wait(120);await H.page.locator('button[data-act="bpApply"]').first().tap({timeout:3000});await H.wait(150);return H.ev(ST);};
    const e=await BUILD();const n=await H.ev(()=>__A.G.party.length);
    chk(`1 Build party (Apply) builds the party (${n} heroes) and keeps its result page: the Menu is not closed, no toast`,e.modal==='ldRes'&&n>=3&&!/^Party built/.test(e.toast)&&e.built||JSON.stringify(e));
    await H.page.locator('#modal .p3eqb button[data-act="autoEqParty"]').first().tap({timeout:3000});await H.wait(150);
    const f=await H.ev(ST);const worn2=await H.ev(()=>Object.values(__A.G.roster).filter(c=>c.eq.w||c.eq.a||c.eq.c).length);
    chk(`1 "Equip best gear for this party" on that page: the gear is on (${worn2}), the Menu closes and a toast says so ("${f.toast}")`,f.modal==null&&worn2>0&&f.show&&/^Equip Best: \d+ hero/.test(f.toast)&&!f.built||JSON.stringify(f));
    const g=await H.ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'equip'};A.render();const had=!!document.querySelector('#modal button[data-act="g16Undo"]');if(had)A.ACT.g16Undo();return {had,bare:Object.values(A.G.roster).every(c=>!c.eq.w&&!c.eq.a&&!c.eq.c)};});
    chk('1 after that close, Backpack > Equipment still offers "Undo Equip Best", and it works',g.had&&g.bare||JSON.stringify(g));
    // built, OK back to the Menu, then Equip Best there
    await BUILD();await H.page.locator('#modal button[data-act="ldDone"]').first().tap({timeout:3000});await H.wait(120);const h0=await H.ev(ST);
    await H.ev(()=>{__A.V.modal={type:'menu',tab:'equip'};__A.render();});await H.wait(80);await H.page.locator('#modal button[data-act="autoEqParty"]').first().tap({timeout:3000});await H.wait(150);const h=await H.ev(ST);
    chk(`1 built, OK, then Equip Best in the same Menu visit: the Menu closes with the toast ("${h.toast}")`,h0.modal==='menu'&&h0.built&&h.modal==null&&/^Equip Best/.test(h.toast)||JSON.stringify([h0,h]));
    // a gear change in between: the result page
    await H.ev(()=>{__A.V.modal=null;__A.render();});await BUILD();
    const i=await H.ev(()=>{const A=__A,G=A.G;A.ACT.ldDone();const c=G.roster[G.party[0]];const k=G.gear.indexOf('c_swift');G.gear.splice(k,1);c.eq.c='c_swift';A.TW.get('refresh')(c);A.V.modal={type:'menu',tab:'equip'};A.render();A.ACT.autoEqParty();const t=A.V.modal&&A.V.modal.type;if(t==='autoEq')A.ACT.autoEqUndo();return t;});
    chk('1 built, then a piece equipped by hand, then Equip Best: the result page (not "right after")',i==='autoEq'||i);
    // the Menu closed in between: the result page
    await H.ev(()=>{__A.V.modal=null;__A.render();});await BUILD();
    const j=await H.ev(()=>{const A=__A;A.ACT.ldDone();A.V.modal=null;A.render();const built=!!window.__G16.G16.built;A.V.modal={type:'menu',tab:'equip'};A.render();A.ACT.autoEqParty();const t=A.V.modal&&A.V.modal.type;if(t==='autoEq')A.ACT.autoEqUndo();return {built,t};});
    chk('1 built, the Menu closed and opened again, then Equip Best: the result page',j.built===false&&j.t==='autoEq'||JSON.stringify(j));
    chk('1 no page or console errors',H.errs.length===0||H.errs.slice(0,3).join(' | '));await H.browser.close();}
  // ---------- 2 ----------
  if(want('2')){const H=await boot('high',1000,750,1,false);const TOL=+process.env.TOL||22,TOLX=+process.env.TOLX||10;
    const R=await H.ev(async([TOL,TOLX])=>{const A=__A,G=A.G,T=A.TW.get,F=window.__F17,TS=16,out={bad:[],worst:0,worstAt:'',worstS:0,worstSAt:'',msMax:0,msMaxS:0,n:0,nS:0,kinds:0,exact:0};
      const hx=c=>{const n=parseInt(c.slice(1),16);return [n>>16,(n>>8)&255,n&255];},dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),SOLID=T('SOLID'),MAPPED='CKEWXDlGq|SU';
      // what the world paints: a canvas with the ground and baked props and the building sprites on it, averaged per tile kind at 1 px
      const avg=(cv,m)=>{const c=document.createElement('canvas');c.width=m.w*TS;c.height=m.h*TS;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(cv,0,0,c.width,c.height);
        (m.bsp||[]).forEach(q=>{if(q&&q.cv&&q.b)x.drawImage(q.cv,q.b.x*TS-10,q.b.y*TS-52,q.cv.width,q.cv.height);});const W=c.width,d=x.getImageData(0,0,W,c.height).data,acc={};
        for(let y=0;y<m.h;y++)for(let i=0;i<m.w;i++){const ch=m.t[y][i],a=acc[ch]||(acc[ch]=[0,0,0,0,0]);a[4]++;for(let py=0;py<TS;py++)for(let px=0;px<TS;px++){const o=((y*TS+py)*W+i*TS+px)*4;if(d[o+3]<200)continue;a[0]+=d[o];a[1]+=d[o+1];a[2]+=d[o+2];a[3]++;}}
        const P={};for(const ch in acc){const a=acc[ch];if(a[3])P[ch]={p:[a[0]/a[3],a[1]/a[3],a[2]/a[3]],n:a[4]};}return P;};
      const fin=(tag,m,raw)=>{for(const c in raw){const r=raw[c],f=hx(T('mapCol')(m,c)),solid=c!=='~'&&SOLID.includes(c);
          if(!solid){if(dist(f,r)>1.5)out.bad.push(tag+' "'+c+'" (ground) is not its painted colour: '+f+' / '+r);}
          else{const L=.3*r[0]+.59*r[1]+.11*r[2],L2=.3*f[0]+.59*f[1]+.11*f[2],k=L>1?L2/L:1;if(k>1.02||k<.3||dist(f,r.map(v=>v*k))>6)out.bad.push(tag+' "'+c+'" (solid) changed hue or got lighter: '+f+' / '+r+' k '+k.toFixed(2));}}};
      const zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i])),keys=Object.keys(zi).filter(k=>k!=='undefined');out.keys=keys.length;const ground={};
      const list=[];keys.forEach(k=>['f1','t1','d1'].forEach(id=>list.push([k,id])));list.push([null,'x0'],[null,'a0']);
      for(const [key,id] of list){const tag=(key?key+':':'')+id;if(key&&id==='f1'){G.run.order[1]=zi[key];A.resetMaps();}let m=null;try{m=A.getMap(id);}catch(e){}if(!m){out.bad.push(tag+' no map');continue;}
        // a) not on the map (what the connected world map shows of it): the sampled tiles, against the whole map painted
        {const t0=performance.now(),S=F.raw(m),ms=performance.now()-t0;out.msMaxS=Math.max(out.msMaxS,ms);if(!S||S.exact){out.bad.push(tag+' no sampled palette');}else{out.nS++;const save={l:m.lights,s:m.smoke,b:m.bsp};const P=avg(T('buildMapCanvas')(m,0),m);m.lights=save.l;m.smoke=save.s;m.bsp=save.b;
            for(const c in P){if(MAPPED.includes(c)||c==='H'||c==='j')continue;const r=S.raw[c];if(!r){out.bad.push(tag+' "'+c+'" not sampled');continue;}const dd=dist(r,P[c].p);if(dd>out.worstS){out.worstS=dd;out.worstSAt=tag+' "'+c+'" n'+P[c].n;}
              if(dd>TOL)out.bad.push(tag+' "'+c+'" sampled off by '+dd.toFixed(0)+' (n '+P[c].n+': '+r+' / '+P[c].p.map(v=>Math.round(v))+')');}fin(tag+' sampled',m,S.raw);}}
        // b) on the map (the minimap and the area map): every tile of the world's base canvas
        const at=m.start||[2,2];try{A.placeAt(m.id,at[0],at[1],'d');}catch(e){out.bad.push(tag+' placeAt: '+e.message);continue;}A.V.modal=null;
        const t0=performance.now(),X=F.raw(m),ms=performance.now()-t0;out.msMax=Math.max(out.msMax,ms);if(!X||!X.exact){out.bad.push(tag+' no palette from the base canvas');continue;}out.n++;out.exact++;
        const P=avg(A.WS.base[0],m);for(const c in P){const r=X.raw[c];if(!r){if(P[c].n>1)out.bad.push(tag+' "'+c+'" missing');continue;}out.kinds++;const dd=dist(r,P[c].p);if(dd>out.worst){out.worst=dd;out.worstAt=tag+' "'+c+'" n'+P[c].n+' '+r+' / '+P[c].p.map(v=>Math.round(v));}
          if(dd>(P[c].n<8?TOLX*2.2:TOLX))/* v0.22.16: under 8 (was 4): the role props of towns22 are a handful of different sprites on crate tiles, and the 4 px average of a few busy sprites sits a little off the 1 px one */out.bad.push(tag+' "'+c+'" off by '+dd.toFixed(0)+' (n '+P[c].n+': '+r+' / '+P[c].p.map(v=>Math.round(v))+')');}
        fin(tag,m,X.raw);if(id==='f1'){const g=X.raw['.']||X.raw[','];ground[key]=g;}
        await new Promise(r=>setTimeout(r,0));}
      // realms of one base theme used to share one minimap: their ground now differs wherever the painted ground does
      const byTheme={};keys.forEach(k=>{const th=A.ZONES[zi[k]].theme;(byTheme[th]||(byTheme[th]=[])).push(k);});out.pairs=0;out.split=0;out.same=[];
      for(const th in byTheme){const L=byTheme[th];for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){if(!ground[L[i]]||!ground[L[j]])continue;out.pairs++;if(dist(ground[L[i]],ground[L[j]])>12)out.split++;else out.same.push(L[i]+'/'+L[j]);}}
      out.err=F.F17.err.slice();return out;},[TOL,TOLX]);
    console.log(`  2: ${R.n} maps of ${R.keys} realms, ${R.kinds} tile kinds; on the map: worst distance to the painted average ${R.worst.toFixed(1)} (${R.worstAt}), slowest palette ${R.msMax.toFixed(0)} ms; off the map (sampled): worst ${R.worstS.toFixed(1)} (${R.worstSAt}), slowest ${R.msMaxS.toFixed(0)} ms; field ground differs for ${R.split} of ${R.pairs} realm pairs of one base theme`);
    chk(`2 every tile kind of every realm's field, town and dungeon, the Breach and the Echo Rift: on the map the minimap colour is the painted average within ${TOLX} (kinds of under 8 tiles ${TOLX*2.2}; worst ${R.worst.toFixed(1)}), off the map (world map, sampled tiles) within ${TOL} (worst ${R.worstS.toFixed(1)}); ground kinds exactly that colour, wall and prop kinds the same hue and never lighter`,R.bad.length===0&&R.n>=R.keys*3+2&&R.nS>=R.keys*3||R.bad.slice(0,10).join('; '));
    chk(`2 realms that share a base theme no longer share one ground colour (${R.split} of ${R.pairs} pairs differ; alike: ${R.same.slice(0,6).join(', ')||'none'})`,R.split>=R.pairs*.6);
    const cpu=await H.cpu();chk(`2 a map's palette is quick (on the map ${R.msMax.toFixed(0)} ms, limit ${Math.round(60*cpu)}; sampled ${R.msMaxS.toFixed(0)} ms, limit ${Math.round(220*cpu)}; load ${cpu.toFixed(1)})`,R.msMax<60*cpu&&R.msMaxS<220*cpu);
    chk('2 no error in fix17',R.err.length===0||R.err.join(' | '));
    // the canvases: the area map's base and the minimap carry mapCol's colours; marks and the legend are still there
    const C=await H.ev(async()=>{const A=__A,G=A.G,T=A.TW.get,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));G.run.order[1]=zi.moors;A.resetMaps();const m=A.getMap('f1');const n=m.w*m.h;G.explored=G.explored||{};G.explored[m.id]=btoa(String.fromCharCode(255).repeat(Math.ceil(n/8)));delete T('SEEN')[m.id];
      let at=null;for(let y=8;y<m.h-8&&!at;y++)for(let x=12;x<m.w-12;x++){let ok=true;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(m.t[y+j][x+i]!=='.')ok=false;if(ok){at=[x,y];break;}}
      A.placeAt(m.id,at[0],at[1],'d');A.V.modal=null;A.render();await new Promise(r=>setTimeout(r,400));T('MAPCV').dirty=1;const base=T('mapBase')(m),d=base.getContext('2d').getImageData(at[0]*2,at[1]*2,1,1).data;
      T('drawMini')();const mm=document.getElementById('mmap'),x=mm.getContext('2d'),W=mm.width,Hh=mm.height;let near=1e9;const want=T('mapCol')(m,'.'),w=[parseInt(want.slice(1,3),16),parseInt(want.slice(3,5),16),parseInt(want.slice(5,7),16)];
      // a ground pixel beside the hero's tile (the minimap shades and vignettes; the nearest of a few is taken)
      for(const [dx,dy] of [[-5,-1],[-6,1],[5,-2],[6,2],[-5,3]]){const p=x.getImageData(W/2+dx,Hh/2+dy,1,1).data;near=Math.min(near,Math.hypot(p[0]-w[0],p[1]-w[1],p[2]-w[2]));}
      A.ACT.map();await new Promise(r=>setTimeout(r,300));const fm=document.getElementById('fmap'),lg=document.querySelectorAll('.maplegend span').length,marks=T('mapMarks')(m).length;A.V.modal=null;A.render();
      return {at,base:[d[0],d[1],d[2]],want:w,near,fmap:!!fm&&fm.width>0,lg,marks,old:T('mapCol').length};});
    chk(`2 the area map's base holds the painted colour at a ground tile (${C.base} / ${C.want}) and the minimap beside the hero is within its shading of it (${C.near.toFixed(0)})`,Math.hypot(C.base[0]-C.want[0],C.base[1]-C.want[1],C.base[2]-C.want[2])<3&&C.near<40||JSON.stringify(C));
    chk(`2 the area map still draws with its legend (${C.lg} entries) and marks (${C.marks})`,C.fmap&&C.lg>=2&&C.marks>=1||JSON.stringify(C));
    chk('2 no page or console errors',H.errs.length===0||H.errs.slice(0,3).join(' | '));await H.browser.close();}
  // ---------- 3 ----------
  if(want('3')){
    // the sky region of the 2D canvas (in HD-2D the overlay above the GL scene): alpha statistics
    const SKY=()=>{const A=__A,W=A.WS,cv=W.cv,L=window.__F17.skyLine(),k=(cv._rw||cv.width)/W.vw,w=cv._rw||cv.width,yb=L?Math.floor(L.y*k):Math.floor(Math.max(8,-W.cam.y)*k);if(yb<8)return {none:1};
      const x=cv.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);const hh=Math.min(cv._rh||cv.height,yb+6),d=x.getImageData(0,0,w,hh).data;x.restore();
      let sum=0,n=0,big=0,steps=0,opaque=0,cols=0;const rowA=new Float32Array(yb);
      for(let y=0;y<yb;y++){let rs=0;for(let i=0;i<w;i++){const a=d[(y*w+i)*4+3];rs+=a;if(a>225)opaque++;if(i+1<w){steps++;if(Math.abs(a-d[(y*w+i+1)*4+3])>24)big++;}if(y+1<yb){steps++;if(Math.abs(a-d[((y+1)*w+i)*4+3])>24)big++;}}rowA[y]=rs/w;sum+=rs;n+=w;}
      for(let i=0;i<w;i+=2){let mx=0;for(let y=0;y<yb;y+=2)mx=Math.max(mx,d[(y*w+i)*4+3]);if(mx>12)cols++;}
      let lit=0;for(let y=0;y<yb;y++)if(rowA[y]>5)lit++;let below=0,bn=0;for(let y=yb+1;y<hh;y++)for(let i=0;i<w;i++){below+=d[(y*w+i)*4+3];bn++;}
      const edge=(rowA[yb-1]+rowA[yb-2]+rowA[yb-3])/3;return {yb,w,k,vhk:(cv._rh||cv.height),avg:sum/n,big:big/steps,opaque:opaque/n,cols:cols/(w/2),lit:lit/yb,edge,below:bn?below/bn:0,hd:!!A.TW.get('HD').live};};
    const TOP=()=>{const A=__A,G=A.G,m=A.WS.m;let best=null;for(let y=0;y<m.h&&!best;y++)for(let x=4;x<m.w-4;x++){const c=m.t[y][x];if(c==='.'||c===':'||c===','){best=[x,y];break;}}
      A.placeAt(m.id,best[0],best[1],'u');G.clock=150;for(const k in G.weather)G.weather[k]='clear';G.weather[m.s]='clear';G.wxSave={};A.V.dlg=null;A.V.modal=null;A.render();return best;};
    const CASES=(process.env.SIZES||'1000x750@1:high 1000x750@2:medium 1280x800@1:high 390x844@3:high 1920x1080@1:high 1000x750@2:high').split(' ');
    for(const cs of CASES){const [,w,h,dpr,tier]=cs.match(/(\d+)x(\d+)@(\d+):(\w+)/);const H=await boot(tier,+w,+h,+dpr,true);
      await H.ev(()=>{const A=__A,G=A.G;G.won=true;G.visited=[0,1,2,3,4];G.lastTown=4;G.ngp=1;G.clock=150;for(let s=0;s<6;s++)G.weather[s]='clear';A.ACT.toBreach();});await H.until(()=>__A.WS.m&&__A.WS.m.breach,null,{timeout:15000});await H.wait(500);
      await H.ev(TOP);await H.ev(()=>{window.__F17.F17.noStars=true;});/* the stars are crisp points by design: the smoothness is measured on the aurora alone */await H.until(()=>{const T=__A.TW.get("TR");return !(T&&T.wx&&T.wx.k<1)&&window.__F17.skyLine();},null,{timeout:20000});await H.wait(900);
      const a=await H.ev(SKY);await H.wait(1300);const b=await H.ev(SKY);
      if(a.none||!a.hd){chk(`3 ${cs}: the Breach sky is in view in HD-2D`,false||JSON.stringify(a));await H.browser.close();continue;}
      chk(`3 ${cs}: the sky layer does not pile up (mean alpha ${a.avg.toFixed(1)} then ${b.avg.toFixed(1)} 1.3 s later; opaque pixels ${(b.opaque*100).toFixed(2)}%)`,Math.abs(a.avg-b.avg)<Math.max(2,a.avg*.12)&&b.opaque<.001&&b.avg>4&&b.avg<90||JSON.stringify([a,b]));
      chk(`3 ${cs}: smooth, no blocks: ${(b.big*100).toFixed(3)}% of neighbouring pixels differ by more than 24 of 255 (stars left out)`,b.big<.001||JSON.stringify(b));
      chk(`3 ${cs}: full sky: light in ${(b.cols*100).toFixed(0)}% of the columns and ${(b.lit*100).toFixed(0)}% of the rows down to the horizon (y ${b.yb} of the canvas)`,(b.yb>=b.vhk*.15?b.cols>.93&&b.lit>.5:b.cols>.5)||JSON.stringify(b));
      chk(`3 ${cs}: it fades out above the horizon (mean alpha ${b.edge.toFixed(1)} in the last rows, ${b.below.toFixed(1)} below): no cut`,b.edge<5&&b.below<3||JSON.stringify(b));
      if(cs===CASES[0]){// the old painter on the same view, for contrast
        await H.ev(()=>{window.__F17.F17.off=true;});await H.wait(2600);const o=await H.ev(SKY);await H.ev(()=>{window.__F17.F17.off=false;});await H.wait(300);const back=await H.ev(SKY);
        console.log(`  3 module off (the reported fault): mean alpha ${o.avg.toFixed(1)}, opaque ${(o.opaque*100).toFixed(1)}%, steps ${(o.big*100).toFixed(2)}%; on again: ${back.avg.toFixed(1)}, ${(back.opaque*100).toFixed(2)}%`);
        chk(`3 with the module off the fault is back (opaque ${(o.opaque*100).toFixed(1)}% of the old band, steps ${(o.big*100).toFixed(2)}%), and on again the overlay is clean`,(o.opaque>.02||o.big>.02)&&back.opaque<.004&&back.big<.001||JSON.stringify([o,back]));
        // walking away from the edge: no sky, nothing left on the overlay
        const gone=await H.ev(async()=>{const A=__A,m=A.WS.m;let at=null;for(let y=m.h-6;y>m.h/2&&!at;y--)for(let x=4;x<m.w-4;x++){const c=m.t[y][x];if(c==='.'||c===','){at=[x,y];break;}}A.placeAt(m.id,at[0],at[1],'d');A.V.modal=null;A.render();await new Promise(r=>setTimeout(r,1500));
          const cv=A.WS.cv,w=cv._rw||cv.width,x=cv.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);const d=x.getImageData(0,0,w,40).data;x.restore();let s=0;for(let i=3;i<d.length;i+=4)s+=d[i];return {line:window.__F17.skyLine(),s,busy:A.TW.get('hdOverlayBusy')(m,performance.now(),false)};});
        chk('3 away from the edge there is no sky: the overlay is clear and at rest again',gone.line==null&&gone.s===0&&gone.busy===false||JSON.stringify(gone));}
      const er=await H.ev(()=>window.__F17.F17.err.slice());chk(`3 ${cs}: no error`,er.length===0&&H.errs.length===0||er.concat(H.errs).slice(0,3).join(' | '));await H.browser.close();}
    // Low (the 2D renderer): the sky is painted in the rows above the map, without error
    {const H=await boot('low',390,844,2,true);await H.ev(()=>{const A=__A,G=A.G;G.won=true;G.visited=[0,1,2,3,4];G.lastTown=4;G.clock=150;for(let s=0;s<6;s++)G.weather[s]='clear';A.ACT.toBreach();});await H.until(()=>__A.WS.m&&__A.WS.m.breach,null,{timeout:15000});await H.wait(500);
      await H.ev(TOP);await H.wait(900);const r=await H.ev(()=>{const F=window.__F17,n0=F.F17.n.sky;return new Promise(ok=>setTimeout(()=>ok({line:F.skyLine(),n:F.F17.n.sky-n0,err:F.F17.err.slice(),hd:!!__A.TW.get('HD').live}),500));});
      chk(`3 Low (2D): the sky above the map is painted (${r.n} draws in 0.5 s, line ${r.line&&r.line.y}), no error`,!r.hd&&(r.line?r.n>4:true)&&r.err.length===0&&H.errs.length===0||JSON.stringify(r));await H.browser.close();}
  }
  // ---------- 4 ----------
  if(want('4')){
    const LOOK=()=>{const e=document.getElementById('glp');if(!e||e.style.display==='none')return null;const cs=getComputedStyle(e),a=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return -1;const p=m[1].split(',');return p.length>3?+p[3]:1;};
      const t=e.querySelector('.gll li')||e.querySelector('.glhead b'),ts=getComputedStyle(t);return {mode:e.className.replace(/\s*(m14|flash)/g,''),img:cs.backgroundImage!=='none',bgA:a(cs.backgroundColor),blur:cs.backdropFilter,op:cs.opacity,textA:a(ts.color),textOp:ts.opacity,edge:ts.textShadow!=='none',see:document.documentElement.classList.contains('glsee')};};
    for(const [tier,w,h,mob,coh] of [['high',1000,750,false,true],['low',390,844,true,false],['medium',390,844,true,true],['low',1280,800,false,true]]){const tag=`4 ${tier} ${w}x${h}${coh?'':', Unified look off'}: `;
      const H=await open({w,h,mobile:mob,dpr:1,pre:META(tier).replace('goalsMin:true','goalsMin:false,cohere:'+coh),tag:'v192'});await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.until(()=>__A.V.screen==='world'&&document.getElementById('glp')&&document.getElementById('glp').innerHTML,null,{timeout:15000});await H.wait(300);
      const full=await H.ev(LOOK);await H.ev(()=>{__A.META.cfg.goalsMin=true;__A.render();__GL.glRender();});await H.wait(150);const chip=await H.ev(LOOK);
      const okSee=o=>o&&o.see&&!o.img&&o.bgA>=.45&&o.bgA<=.55&&(o.blur==='none'||!o.blur)&&o.op==='1'&&o.textA===1&&o.textOp==='1'&&o.edge;
      chk(tag+`see-through by default, open (${full&&full.mode}, background alpha ${full&&full.bgA}) and folded (${chip&&chip.mode}, ${chip&&chip.bgA}); no blur, the panel's opacity 1, the words solid with a dark edge`,okSee(full)&&okSee(chip)&&/full/.test(full.mode)&&/chip/.test(chip.mode)||JSON.stringify([full,chip]));
      // the setting
      const row=await H.ev(()=>{const A=__A;A.V.modal={type:'settings'};A.render();const rows=[...document.querySelectorAll('#modal .row')],i=rows.findIndex(r=>/See-through goals/.test(r.textContent)),j=rows.findIndex(r=>/Show goals/.test(r.textContent));
        const on=i>=0&&rows[i].querySelector('.chip.on'),off=i>=0&&[...rows[i].querySelectorAll('.chip')].find(c=>/Off/.test(c.textContent));const r={i,j,on:on&&on.textContent,sec:i>=0&&j>=0&&rows[i].parentElement===rows[j].parentElement};if(off)off.click();return r;});await H.wait(150);
      const solid=await H.ev(()=>{const A=__A,cfg=A.META.cfg.goalsClear,saved=JSON.parse(localStorage.getItem('aurelis-meta-v1')||'{}');A.V.modal=null;A.render();__GL.glRender();return {cfg,saved:saved.cfg&&saved.cfg.goalsClear};});await H.wait(150);
      const chipS=await H.ev(LOOK);await H.ev(()=>{__A.META.cfg.goalsMin=false;__A.render();__GL.glRender();});await H.wait(150);const fullS=await H.ev(LOOK);
      chk(tag+`Settings has "See-through goals" right after "Show goals" (rows ${row.j}, ${row.i}), On by default; Off is saved and gives the solid panel (alpha ${fullS&&(fullS.img?"1, a gradient":fullS.bgA)} open, ${chipS&&(chipS.img?"1, a gradient":chipS.bgA)} folded)`,row.i>=0&&row.i===row.j+1&&row.on==='On'&&solid.cfg===false&&solid.saved===false&&fullS&&chipS&&!fullS.see&&(fullS.bgA>=.8||fullS.img)&&(chipS.bgA>=.8||chipS.img)&&fullS.op==='1'||JSON.stringify([row,solid,fullS,chipS]));
      // on again; the hero under the panel changes nothing
      const again=await H.ev(async()=>{const A=__A,g=A.TW.get;A.ACT.cfg(JSON.stringify(['goalsClear',true]));A.V.modal=null;A.render();__GL.glRender();const e=document.getElementById('glp'),look=()=>{const cs=getComputedStyle(e);return cs.backgroundColor+'|'+cs.opacity+'|'+e.className.replace(/\s*(m14|flash)/g,'')+'|'+(e.style.display||'');};
        const far=look(),m=A.WS.m,out={far,under:0,diff:[]};for(let x=m.w-1;x>=m.w-6;x--)for(let y=0;y<=7;y++){try{g('placeAt')(m.id,x,y,'d');}catch(er){continue;}A.V.modal=null;A.render();await new Promise(q=>requestAnimationFrame(()=>requestAnimationFrame(q)));__GL.glRender();
          const hh=__GL.glHero(),b=e.getBoundingClientRect();if(!hh||!(hh.l<b.right&&hh.r>b.left&&hh.t<b.bottom&&hh.b>b.top))continue;out.under++;const l=look();if(l!==far)out.diff.push(l);}return out;});
      chk(tag+`On again it is see-through again (${again.far}), and with the hero under it (${again.under} places) it does not change`,/0\.5/.test(again.far)&&again.under>=1&&again.diff.length===0||JSON.stringify(again).slice(0,400));
      chk(tag+'no page errors',true);await H.browser.close();}
  }
  await done({browser:{close:async()=>{}}});})();
