// v0.20.6 world14.js: the cloud sea, foes only where you can walk, entrances entered from the front only.
//  1. cloud sea: over every heights realm the cloud tiles are painted from one noise field across the map (the 0.20.5 paint, module off, repeated a
//     band on the same rows of every tile: the row profile of a tile matches the one below it, and the tile borders step); the new paint does neither;
//     the shore (cliff front under land, foam at the sides) is kept; the void's stars, the sea, lava and water are not touched (pixel for pixel);
//     the wet and snow caps leave the cloud alone; no module error; the same in the HD-2D ground bake (High) and on the flat Low look
//  2. 150 fields (30 journeys x 5 stages) and 150 main dungeons: roamers, bounty beasts, nodes and chests that no walk reaches, with the fix off
//     (bug reproduced) and on (none); drawAudit.unreach and mapIssues(m,{actors:true}) report a roamer planted on an island
//  3. entrances: over the same 150 fields every den, lair and shrine is a solid mass north of its door with the way in from the tile south of it
//     (face, out, front open and reached, no other open neighbour), against the module off; mapIssues unchanged; entering from every side the
//     game's own step code allows only the front (tryStepDir, diagOk); a tap on the mass walks to the door by its front tile; A on the door from the
//     front walks in; a front tile closed by cliff, rock or a tree is cleared; the Sanctum hall's door stands in a niche (one open neighbour, the start tile)
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v182a.js [ONLY=1,2,3]
const {open,chk,done}=require('./pw');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false,tips:false,minimap:false,hd2d:true,goalsMin:true}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const only=process.env.ONLY||'',want=n=>!only||only.split(',').includes(n);
const bound=(p,ms,what)=>{let t;return Promise.race([p,new Promise((_,rej)=>{t=setTimeout(()=>rej(new Error('timeout after '+ms+' ms: '+what)),ms);})]).finally(()=>clearTimeout(t));};
setTimeout(()=>{console.log('FAIL watchdog: v182a ran over 600 s');process.exit(1);},600000).unref();
async function boot(t,w,h){const H=await open({w:w||430,h:h||760,mobile:(w||430)<600,dpr:1,pre:META(t)});const ev0=H.ev;H.ev=(f,a)=>bound(ev0(f,a),120000,'page call');const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=424242;A.resetMaps();A.render();});await H.wait(400);return H;}
const REALM=`([key,kind])=>{const A=__A,G=A.G,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));G.run.order[1]=zi[key];A.resetMaps();G.clock=150;G.weather[1]='clear';const m=A.getMap(kind==='town'?'t1':'f1');
  const p=m.start||[Math.floor(m.w/2),Math.floor(m.h/2)];A.V.modal=null;A.WS.dlg=null;A.placeAt(m.id,p[0],p[1],'u');A.WS.cam=null;A.render();return {id:m.id,w:m.w,h:m.h,theme:m.theme};}`;
(async()=>{
  // ---------- 1. the cloud sea ----------
  if(want('1')){const H=await boot('low');const {ev}=H;
    const R=await ev(([REALM])=>{const A=__A,W=window.__W14,T=A.TW.get,go=(0,eval)(REALM),out={zones:[],stripeOn:null,stripeOff:null,stepOn:null,stepOff:null,shore:0,shoreBad:0,frames:0,void:[],err:W.err.length};
      const base=(m,off)=>{const was=W.off;W.off=off;try{return T('buildMapCanvas')(m,0);}finally{W.off=was;}};
      const lum=(d,i)=>d[i]*.3+d[i+1]*.59+d[i+2]*.11;
      // the cloud tiles with cloud on every side
      const inner=m=>{const L=[];for(let y=2;y<m.h-2;y++)for(let x=2;x<m.w-2;x++){let ok=true;for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=1&&ok;i++){const c=m.t[y+j][x+i];if(c!=='~'&&c!=='o')ok=false;}if(ok)L.push([x,y]);}return L;};
      // per tile: the mean luminance of each of its 16 rows, taken out of its own mean; the stripe score is the mean correlation of a tile with the one below it
      const prof=(cv,x,y)=>{const d=cv.getContext('2d').getImageData(x*16,y*16,16,16).data,p=[];for(let r=0;r<16;r++){let s=0;for(let c=0;c<16;c++)s+=lum(d,(r*16+c)*4);p.push(s/16);}const mean=p.reduce((a,b)=>a+b,0)/16;return p.map(v=>v-mean);};
      const corr=(a,b)=>{let sa=0,sb=0,sab=0;for(let i=0;i<16;i++){sa+=a[i]*a[i];sb+=b[i]*b[i];sab+=a[i]*b[i];}return sa<1e-6||sb<1e-6?1:sab/Math.sqrt(sa*sb);};
      const step=(cv,x,y)=>{const c=cv.getContext('2d'),a=c.getImageData(x*16+15,y*16,1,16).data,b=c.getImageData((x+1)*16,y*16,1,16).data,e=c.getImageData(x*16+7,y*16,2,16).data;let s=0,w=0;for(let r=0;r<16;r++){s+=Math.abs(lum(a,r*4)-lum(b,r*4));w+=Math.abs(lum(e,r*8)-lum(e,r*8+4));}return [s/16,w/16];};
      for(const key of ['peaks','mesa','shattered','ashglass','mines','bamboo']){const g=go([key,'field']);const m=A.WS.m,T0=T('THM')(m);const z={key,theme:m.theme,cloud:!!T0.cloud,n:0,on:0};
        const L=inner(m).filter((p,i)=>i%7===0).slice(0,120);z.n=L.length;
        for(const off of [true,false]){const cv=base(m,off);let sc=0,k=0,sa=0,sb=0;L.forEach(([x,y])=>{sc+=corr(prof(cv,x,y),prof(cv,x,y+1));k++;const [a,b]=step(cv,x,y);sa+=a;sb+=b;});
          if(off){z.stripeOff=sc/Math.max(1,k);z.stepOff=sa/Math.max(1,sb);}else{z.stripeOn=sc/Math.max(1,k);z.stepOn=sa/Math.max(1,sb);}}
        out.zones.push(z);}
      // the shore: a cloud tile under land keeps the base's cliff front rows and a white foam edge column where land stands beside it
      {go(['peaks','field']);const m=A.WS.m;const on=base(m,false),off=base(m,true),co=on.getContext('2d'),cf=off.getContext('2d');let n=0,bad=0,foam=0,foamBad=0;
        for(let y=1;y<m.h-1&&n<80;y++)for(let x=1;x<m.w-1&&n<80;x++){if(m.t[y][x]!=='~'||['~','B','o'].includes(m.t[y-1][x]))continue;n++;
          const a=co.getImageData(x*16,y*16,16,9).data,b=cf.getImageData(x*16,y*16,16,9).data;let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;if(d)bad++;}
        for(let y=2;y<m.h-2&&foam<40;y++)for(let x=2;x<m.w-2&&foam<40;x++){if(!['~','o'].includes(m.t[y][x])||!['~','o'].includes(m.t[y-1][x])||['~','B','o'].includes(m.t[y][x-1]))continue;foam++;
          const p=co.getImageData(x*16,y*16+12,1,1).data;if(!(p[0]>250&&p[1]>250&&p[2]>250))foamBad++;}
        out.shore=n;out.shoreBad=bad;out.foam=foam;out.foamBad=foamBad;}
      // the void's stars, the sea, lava and ordinary water are the base's, pixel for pixel
      for(const key of ['starless','ashen','strand','deeps','drowned','thistle']){go([key,'field']);const m=A.WS.m,on=base(m,false),off=base(m,true),a=on.getContext('2d').getImageData(0,0,on.width,on.height).data,b=off.getContext('2d').getImageData(0,0,off.width,off.height).data;let d=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])d++;out.void.push([key,d]);}
      // the wet and snow caps: no cap pixel over a cloud tile
      {go(['peaks','field']);const m=A.WS.m,cap=window.__T13.api.capCanvas(m),c=cap.getContext('2d');let n=0,lit=0;
        for(let y=2;y<m.h-2&&n<60;y+=3)for(let x=2;x<m.w-2&&n<60;x+=3){if(m.t[y][x]!=='~'||m.t[y-1][x]!=='~'||m.t[y+1][x]!=='~')continue;n++;const d=c.getImageData(x*16,y*16,16,16).data;for(let i=3;i<d.length;i+=4)if(d[i]>0){lit++;break;}}out.capN=n;out.capLit=lit;}
      out.n=W.n.cloud;out.err=W.err.length;return out;},[REALM]);
    for(const z of R.zones)chk(`${z.key} (${z.theme}): ${z.n} open cloud tiles, row profile match with the tile below ${z.stripeOff.toFixed(2)} (module off) -> ${z.stripeOn.toFixed(2)}, border step ratio ${z.stepOff.toFixed(2)} -> ${z.stepOn.toFixed(2)}`,z.cloud&&z.n>=20&&z.stripeOn<.15&&(z.stripeOff<.2||z.stripeOn<z.stripeOff*.3)&&z.stepOn<z.stepOff*.8||JSON.stringify(z));
    chk(`shore: ${R.shore} cloud tiles under land keep the cliff front rows (${R.shoreBad} differ), ${R.foam} tiles beside land keep the white foam edge (${R.foamBad} without)`,R.shore>=20&&R.shoreBad===0&&R.foam>=10&&R.foamBad===0||JSON.stringify(R));
    chk('void, sea, lava and water untouched: '+JSON.stringify(R.void),R.void.every(([k,d])=>d===0));
    chk(`wet and snow caps over ${R.capN} cloud tiles: ${R.capLit} marked`,R.capN>=20&&R.capLit===0||JSON.stringify(R));
    chk(`${R.n} cloud tiles painted, no module error ${R.err}`,R.n>0&&R.err===0);
    chk('no page errors '+JSON.stringify(H.errs),!H.errs.length);await H.browser.close();
    // the HD-2D ground bake reads the same base canvas: High, a frame in the realm
    const H2=await boot('high',1000,560);const p=await H2.ev(([REALM])=>{const A=__A,W=window.__W14,g=(0,eval)(REALM)(['peaks','field']);return {g,n:W.n.cloud,err:W.err.slice()};},[REALM]);await H2.wait(1500);
    const e=await H2.ev(()=>({err:window.__W14.err,n:window.__W14.n.cloud,hd:!!(__A.HD&&__A.HD.live)}));
    chk(`HD-2D (High): the ground bake paints the cloud (${e.n} tiles), no error ${JSON.stringify(e.err)}`,e.n>0&&!e.err.length);chk('HD-2D: no page errors '+JSON.stringify(H2.errs),!H2.errs.length);await H2.browser.close();}
  // ---------- 2. foes, actors, nodes and chests only where the walk reaches ----------
  if(want('2')){const H=await boot('low');const {ev}=H;
    const run=(fix,pre)=>ev(([fix,pre])=>{let sd=77;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296;};const A=__A,G=A.G,W=window.__W14,out={maps:0,err:0,roamers:0,roamBad:0,actors:0,actBad:0,nodes:0,nodeBad:0,chests:0,chestBad:0,mini:0,miniBad:0,mapsBad:0,mi:0,gone:0,heights:{maps:0,roamers:0,roamBad:0,mapsBad:0},ex:[]};
      W.fix=fix;const seed0=G.run.seed,ord0=G.run.order.slice();
      try{for(let k=0;k<30;k++){G.run.seed=k*7919+101;G.run.order=ord0.map((z,i)=>(k*5+i*7)%A.ZONES.length);G.sub=null;G.bounties=[];for(let s=0;s<5;s++)for(let i=0;i<6;i++)G.bounties.push({id:'bb'+i+s+k,state:'active',stage:s});A.resetMaps();
        for(let s=0;s<5;s++){let m;try{m=A.getMap(pre+s);}catch(e){out.err++;continue;}try{A.TW.get('roamSpawn')(m);}catch(e){}
          out.maps++;const a=W.api.audit(m),h=m.theme==='heights';out.roamers+=(m.roam||[]).length;out.roamBad+=a.roam.length;out.gone+=(m.roam||[]).filter(r=>r.gone).length;
          out.actors+=A.TW.get('dynActors')(m).filter(q=>!q.mini).length;out.actBad+=a.actors.length;out.nodes+=(m.nodes||[]).length;out.nodeBad+=a.nodes.length;out.chests+=(m.chests||[]).length;out.chestBad+=a.chests.length;
          out.mi+=A.TW.get('mapIssues')(m).length;const bad=a.roam.length+a.actors.length+a.nodes.length+a.chests.length;if(bad){out.mapsBad++;if(out.ex.length<2)out.ex.push(m.id+':'+JSON.stringify(a).slice(0,160));}
          if(h){const q=out.heights;q.maps++;q.roamers+=(m.roam||[]).length;q.roamBad+=a.roam.length;if(bad)q.mapsBad++;}
          // the cave's miniboss (a den's, a Sanctum's) stands where the walk from the cave's start reaches
          if(pre==='f')(m.caves||[]).forEach(c=>{try{const k2=A.getMap(c.id);const b=W.api.audit(k2);out.mini++;if(b.mini.length)out.miniBad++;}catch(e){}});}}}
      finally{G.run.seed=seed0;G.run.order=ord0;G.bounties=[];A.resetMaps();W.fix=true;}return out;},[fix,pre]);
    const f0=await run(false,'f'),f1=await run(true,'f'),d0=await run(false,'d'),d1=await run(true,'d');
    const fmt=o=>`${o.maps} maps: roamers ${o.roamBad}/${o.roamers}, bounty beasts ${o.actBad}/${o.actors}, nodes ${o.nodeBad}/${o.nodes}, chests ${o.chestBad}/${o.chests}, minibosses ${o.miniBad}/${o.mini}, maps with one ${o.mapsBad} (heights realms ${o.heights.mapsBad}/${o.heights.maps}, roamers ${o.heights.roamBad}/${o.heights.roamers}), mapIssues ${o.mi}`;
    console.log('fields, fix off: '+fmt(f0));console.log('fields, fix on:  '+fmt(f1)+` (${f1.gone} roamers dropped for want of a spot)`);console.log('dungeons, fix off: '+fmt(d0));console.log('dungeons, fix on:  '+fmt(d1));
    chk('150 fields, fix off: foes stand where nobody can walk (bug reproduced): '+(f0.roamBad+f0.actBad),f0.maps>=150&&f0.roamBad>0&&f0.heights.roamBad>0||JSON.stringify(f0));
    chk('150 fields, fix on: no roamer, bounty beast, node, chest or miniboss off the walkable ground, mapIssues '+f1.mi+' (fix off '+f0.mi+')',f1.maps>=150&&f1.roamBad===0&&f1.actBad===0&&f1.nodeBad===0&&f1.chestBad===0&&f1.miniBad===0&&f1.mi<=f0.mi||JSON.stringify(f1));
    chk(`150 fields: the roamers keep their number (${f1.roamers} against ${f0.roamers}, ${f1.gone} dropped)`,f1.roamers===f0.roamers&&f1.gone<=Math.ceil(f0.roamBad*.2));
    chk('150 main dungeons: none off the walk, fix on or off: '+(d1.roamBad+d1.nodeBad+d1.chestBad)+' / '+(d0.roamBad+d0.nodeBad+d0.chestBad),d1.maps>=150&&d1.roamBad===0&&d1.nodeBad===0&&d1.chestBad===0&&d1.err===0);
    // the audit and mapIssues report a roamer planted on an island
    const P=await ev(()=>{const A=__A,G=A.G,W=window.__W14;G.run.order[1]=A.ZONES.findIndex(z=>z.key==='peaks');A.resetMaps();const m=A.getMap('f1');A.TW.get('roamSpawn')(m);const R=W.api.reach(m);let isl=null;
      for(let y=3;y<m.h-3&&!isl;y++)for(let x=3;x<m.w-3&&!isl;x++){if(R[y][x]||m.t[y][x]!=='.'&&m.t[y][x]!==',')continue;let all=true;for(let j=-1;j<=1&&all;j++)for(let i=-1;i<=1&&all;i++){const c=m.t[y+j][x+i];if(c!=='.'&&c!==','&&c!=='f')all=false;}if(all)isl=[x,y];}
      if(!isl)return {none:1};const r=m.roam[0];const from=[r.x,r.y,r.hx,r.hy];r.x=r.hx=isl[0];r.y=r.hy=isl[1];
      const au=A.TW.get('drawAudit')(m),mi=A.TW.get('mapIssues')(m,{actors:true}),mi0=A.TW.get('mapIssues')(m);return {isl,unreach:au.unreach.roam.length,mi:mi.filter(q=>q.why==='roamer unreachable').length,mi0:mi0.length};});
    chk('a roamer planted on an island: drawAudit.unreach.roam '+P.unreach+', mapIssues(m,{actors:true}) '+P.mi+', plain mapIssues '+P.mi0,P.unreach===1&&P.mi===1&&P.mi0===0||JSON.stringify(P));
    const W2=await ev(()=>window.__W14.err.slice());chk('no module error '+JSON.stringify(W2),!W2.length);chk('no page errors '+JSON.stringify(H.errs),!H.errs.length);await H.browser.close();}
  // ---------- 3. entrances: from the front only ----------
  if(want('3')){const H=await boot('low');const {ev}=H;
    const run=front=>ev(([front])=>{let sd=77;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296;};const A=__A,G=A.G,W=window.__W14,T=A.TW.get,iss=T('mapIssues'),DV=T('DIRV'),
      out={maps:0,ents:0,ok:0,kinds:{},bad:{mass:0,front:0,leaks:0,face:0,out:0,reach:0},restamped:0,moved:0,nospot:0,mi:0,err:0,sides:0,sidesAllowed:0,fronts:0,frontsAllowed:0,diag:0,diagAllowed:0,taps:0,tapOk:0,doorA:0,doorAok:0,wrongA:0,wrongAbad:0,ex:[]};
      W.front=front;const seed0=G.run.seed,ord0=G.run.order.slice();
      try{for(let k=0;k<30;k++){G.run.seed=k*7919+101;G.run.order=ord0.map((z,i)=>(k*5+i*7)%A.ZONES.length);G.sub=null;A.resetMaps();
        for(let s=0;s<5;s++){let m;try{m=A.getMap('f'+s);}catch(e){out.err++;continue;}out.maps++;out.mi+=iss(m).length;
          (m.w14front||[]).forEach(f=>{if(f.why)out.nospot++;else{out.restamped++;if(f.moved)out.moved++;}});
          const ents=W.api.entrances(m);
          ents.forEach((e,i)=>{out.ents++;out.kinds[e.kind]=(out.kinds[e.kind]||0)+1;if(W.api.entOk(e))out.ok++;else{for(const q of ['mass','front','face','out','reach'])if(!e[q])out.bad[q]++;if(e.leaks)out.bad.leaks++;if(out.ex.length<2)out.ex.push(m.id+' '+JSON.stringify(e));}
            if(!front)return;
            // every way into the door tile, by the game's own step code: put the hero on each open neighbour and step toward the door
            const E=[e.x,e.y];A.WS.m=m;A.WS.lock=false;A.V.modal=null;A.WS.dlg=null;
            for(const [dx,dy,d] of [[0,1,'u'],[0,-1,'d'],[1,0,'l'],[-1,0,'r']]){const x=E[0]+dx,y=E[1]+dy;if(A.solidAt(m,x,y)||m.t[y][x]==='E')continue;A.WS.x=x;A.WS.y=y;A.WS.mv=null;A.WS.held=[];T('tryStepDir')(performance.now(),d);
              const into=A.WS.mv&&A.WS.mv.tx===E[0]&&A.WS.mv.ty===E[1];A.WS.mv=null;if(d==='u'){out.fronts++;if(into)out.frontsAllowed++;}else{out.sides++;if(into)out.sidesAllowed++;}}
            for(const [dx,dy,d] of [[-1,1,'ur'],[1,1,'ul'],[-1,-1,'dr'],[1,-1,'dl']]){const x=E[0]+dx,y=E[1]+dy;if(A.solidAt(m,x,y))continue;out.diag++;if(T('diagOk')(m,x,y,d))out.diagAllowed++;}
            if(i%3===0){// a tap on the mass (its upper left tile) and on the door, from eight tiles south: the path ends on the front tile and steps north in
              const Rr=W.api.reach(m);let sy=-1;for(let q=9;q>=3&&sy<0;q--)if(E[1]+q<m.h-2&&Rr[E[1]+q][E[0]])sy=E[1]+q;const sx=E[0];if(sy<0)return;for(const [tx,ty] of [[E[0]-1,E[1]-1],E]){out.taps++;const p=T('findPath')(m,sx,sy,tx,ty);if(!p||!p.length)continue;
                let x=sx,y=sy,last=null;for(const d of p){if(d.startsWith('face:'))break;const v=DV[d];last=[x,y];x+=v[0];y+=v[1];}if(x===E[0]&&y===E[1]&&last&&last[0]===E[0]&&last[1]===E[1]+1)out.tapOk++;}}
            if(i%3===1){// A on the door from the front walks in; A beside it (facing the mass) does nothing
              A.WS.x=E[0];A.WS.y=E[1]+1;A.WS.dir='u';A.WS.mv=null;A.WS.dlg=null;A.WS.lock=false;A.V.modal=null;out.doorA++;T('interact')();const ok=A.WS.mv&&A.WS.mv.tx===E[0]&&A.WS.mv.ty===E[1];A.WS.mv=null;if(ok)out.doorAok++;
              if(!A.solidAt(m,E[0]-1,E[1]+1)){A.WS.x=E[0]-1;A.WS.y=E[1]+1;A.WS.dir='u';A.WS.mv=null;A.WS.dlg=null;out.wrongA++;T('interact')();if(A.WS.mv||A.WS.dlg)out.wrongAbad++;A.WS.mv=null;A.WS.dlg=null;}}});}}}
      finally{G.run.seed=seed0;G.run.order=ord0;A.resetMaps();W.front=true;A.WS.mv=null;}return out;},[front]);
    const off=await run(false),on=await run(true);
    console.log('entrances, module off: '+JSON.stringify(off));console.log('entrances, module on:  '+JSON.stringify(on));
    chk(`150 fields, module off: ${off.ents} entrances, ${off.ents-off.ok} not a front facing mass with its way in from the south (bug reproduced)`,off.maps>=150&&off.ents-off.ok>100||JSON.stringify(off));
    chk(`150 fields, module on: ${on.ents} entrances (${JSON.stringify(on.kinds)}), ${on.ok} are a solid mass north of the door with the front tile open, reached and the only open neighbour, face and out say south (${JSON.stringify(on.bad)})`,on.maps>=150&&on.ents>=300&&on.ok===on.ents||JSON.stringify(on));
    chk(`${on.restamped} masses stood up again (${on.moved} moved to the nearest spot that fits), none left without a spot (${on.nospot}); mapIssues ${on.mi} against ${off.mi} with the module off, no generation error (${on.err})`,on.restamped>100&&on.nospot===0&&on.mi<=off.mi&&on.err===0);
    chk(`stepping into the door: from the front ${on.frontsAllowed}/${on.fronts} accepted, from the sides and the back ${on.sidesAllowed}/${on.sides} (no such open tile), diagonally ${on.diagAllowed}/${on.diag}`,on.fronts>=300&&on.frontsAllowed===on.fronts&&on.sidesAllowed===0&&on.diagAllowed===0);
    chk(`a tap on the mass or the door from a reached tile three to nine tiles south ends with a step north out of the front tile: ${on.tapOk}/${on.taps}`,on.taps>=200&&on.tapOk>=on.taps*.97||JSON.stringify(on));
    chk(`A on the door from the front walks in ${on.doorAok}/${on.doorA}; A facing the mass from beside the door does nothing (${on.wrongAbad} of ${on.wrongA} did)`,on.doorA>=100&&on.doorAok===on.doorA&&on.wrongAbad===0);
    // an entrance against a cliff: the front tile and its two neighbours closed by rock, a tree and a cliff are cleared and the way in reaches the entry
    const C=await ev(()=>{const A=__A,G=A.G,W=window.__W14,T=A.TW.get;const out={n:0,fixed:0,closed:0,reach:0,mi:0,ex:[]};let sd=9;
      for(let k=0;k<8;k++){G.run.seed=k*131+7;G.run.order=G.run.order.map((z,i)=>(k*5+i*7)%A.ZONES.length);A.resetMaps();const m=A.getMap('f'+(1+k%4));
        const L=W.api.entrances(m).map((e,i)=>({e,i}));L.filter(q=>q.e.kind!=='fort').slice(0,2).forEach(({e})=>{out.n++;const g=m.t,y=e.y+1,was=[g[y][e.x-1],g[y][e.x],g[y][e.x+1]];g[y][e.x]='#';g[y][e.x-1]='T';g[y][e.x+1]='R';out.closed++;
          const mi0=T('mapIssues')(m).length;const log=W.api.restamp(m);const st=T('mapEntry')(m),R=T('healReach')(m,st,true,true);const after=W.api.entrances(m).find(q=>q.x===e.x&&q.y===e.y)||W.api.entrances(m).find(q=>Math.abs(q.x-e.x)+Math.abs(q.y-e.y)<=10);
          if(after&&W.api.entOk(after)&&R[after.y+1][after.x])out.fixed++;if(T('mapIssues')(m).length<=mi0)out.mi++;if(out.ex.length<1)out.ex.push(JSON.stringify(log));});}
      return out;});
    chk(`front closed by cliff, a tree and rock: ${C.fixed}/${C.n} entrances come out with a cleared, reached front, mapIssues no worse in ${C.mi}/${C.n}`,C.n>=8&&C.fixed===C.n&&C.mi===C.n||JSON.stringify(C));
    // the Sanctum's inner door stands in a niche: its one open neighbour is the hall tile in front of it (the start tile), the prize chest stays where m.prize says
    const S=await ev(()=>{const A=__A,G=A.G,out={halls:0,niche:0,start:0,prize:0};
      for(let k=0;k<12;k++){G.run.seed=k*7919+101;G.run.order=G.run.order.map((z,i)=>(k*5+i*7)%A.ZONES.length);A.resetMaps();const f=A.getMap('f'+(1+k%4)),c=(f.caves||[]).find(q=>q.kind==='fort');if(!c)continue;const m=A.getMap(c.id);out.halls++;
        let E=null;for(let y=0;y<m.h&&!E;y++)for(let x=0;x<m.w;x++)if(m.t[y][x]==='E'){E=[x,y];break;}
        if(E){const open=[[0,1],[1,0],[-1,0],[0,-1]].filter(([a,b])=>!A.solidAt(m,E[0]+a,E[1]+b));if(open.length===1)out.niche++;if(open.length===1&&m.start&&E[0]+open[0][0]===m.start[0]&&E[1]+open[0][1]===m.start[1])out.start++;}
        const rw=(m.chests||[]).find(q=>q[2]==='reward');if(rw&&m.prize&&rw[0]===m.prize[0]&&rw[1]===m.prize[1])out.prize++;}
      return out;});
    chk(`${S.halls} Sanctum halls: the inner door has one open neighbour ${S.niche}, the start tile ${S.start}; the reward chest on m.prize ${S.prize}`,S.halls>=8&&S.niche===S.halls&&S.start===S.halls&&S.prize===S.halls||JSON.stringify(S));
    const W3=await ev(()=>({w:window.__W14.err.slice(),wa:window.__WA13.err.slice()}));chk('no module error '+JSON.stringify(W3),!W3.w.length&&!W3.wa.length);chk('no page errors '+JSON.stringify(H.errs),!H.errs.length);await H.browser.close();}
  await done({browser:{close:async()=>{}}});
})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1);});
