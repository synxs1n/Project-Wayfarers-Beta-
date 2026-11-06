// v0.6.3 world pass: functional checks for the owner's six reports. Each check fails on v0.6.2 and passes now.
//  1. the fortress gatehouse stands up in HD-2D (towers and a curtain wall in the bake, no flat paint on the ground, no cave mouth card)
//  2. drifting ambience is anchored in the world: 2D (Low) particles shift with the camera, HD-2D draws them in the GL scene (none on
//     the 2D canvas over it); weather on the HD-2D overlay covers the whole view (it covered the top left quarter only)
//  3. nothing is drawn over the hero (2D sweep over many frames), and the HD-2D overlay leaves no stale pixels from an earlier 2D frame
//  4. an opened chest vanishes (not drawn, walkable), the save keeps it opened, the minimap leaves it out, the full map dims it
//  5. the world map is an illustrated parchment with vignettes, fits a phone, a tap shows a place's name and keeps the map open
//  6. fortresses are called "Fortress" in the map legend
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v063wo.js
const {open,chk,done}=require('./pw');
const META=(t,rm)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:${!!rm},hints:false}}));(()=>{let s=5;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
async function boot(t,w,h){const H=await open({w:w||390,h:h||844,mobile:true,dpr:2,pre:META(t)});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.wait(500);return H;}
// a relit field with room around the hero, clear weather, no realm ambience layer (so the overlay is idle)
const FIELD=`(()=>{const A=__A,G=A.G;let id='f0';for(let s=0;s<5;s++){const m=A.getMap('f'+s);if(m.theme==='meadow'){id='f'+s;break;}}const m=A.getMap(id);G.cleared[m.s]=1;G.weather[m.s]='clear';G.clock=150;
  let best=null;for(let y=8;y<m.h-8&&!best;y++)for(let x=8;x<m.w-12;x++){let ok=true;for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=5&&ok;i++)if(A.solidAt(m,x+i,y+j))ok=false;if(ok){best=[x,y];break;}}
  A.placeAt(id,best[0],best[1],'d');A.TR.ph=null;A.TR.wx.key=null;A.render();return {id,best,th:m.theme};})()`;
// fillRect calls on the world canvas in the ambience colours (sparkles, butterflies), in logical px with the camera at that frame
const REC=`(T)=>{const A=__A,ctx=A.WS.ctx,f0=ctx.fillRect,C=['#fff2a0','#ffd04a','#f6e06a','#f08ab0'],out=[];ctx.fillRect=function(x,y,w,h){const s=String(ctx.fillStyle).toLowerCase();if(C.includes(s))out.push([x,y,w,h]);return f0.apply(this,arguments);};
  try{A.worldDraw2(T);}finally{delete ctx.fillRect;}return {r:out,cam:[Math.round(A.WS.cam.x),Math.round(A.WS.cam.y)],hero:[Math.round(A.WS.px)+8,Math.round(A.WS.py)+16]};}`;
(async()=>{
  // ---------- 2D (Low) ----------
  {const H=await boot('low');const {ev,wait}=H;const f=await ev(FIELD);await wait(400);
    // 2. the same moment drawn with the camera in two places: world anchored particles move by the camera shift, screen locked ones stay
    const a=await ev(`(${REC})(50000)`);await ev(f=>{__A.placeAt(f.id,f.best[0]+4,f.best[1],'d');__A.render();},f);await wait(500);const b=await ev(`(${REC})(50000)`);
    const dx=b.cam[0]-a.cam[0],dy=b.cam[1]-a.cam[1],key=r=>r.join(','),B=new Set(b.r.map(key)),V=await ev(()=>[__A.WS.vw,__A.WS.vh]);
    // only rects that stay well inside the view in both frames, whichever way they behave
    a.r=a.r.filter(r=>r[0]>dx+4&&r[0]<V[0]-4&&r[1]>Math.max(dy,0)+4&&r[1]<V[1]-4+Math.min(dy,0));
    const same=a.r.filter(r=>B.has(key(r))).length,moved=a.r.filter(r=>B.has(key([r[0]-dx,r[1]-dy,r[2],r[3]]))).length;
    chk(`2D: ambience stays in the world when the camera moves (${a.r.length} particle rects, camera moved ${dx},${dy}: ${moved} moved with the world, ${same} stayed on the glass)`,
      a.r.length>=5&&Math.abs(dx)+Math.abs(dy)>=24&&moved>=a.r.length*.7&&same<=a.r.length*.2||JSON.stringify({n:a.r.length,dx,dy,moved,same}));
    // 3. none over the hero, over 150 moments
    const hits=await ev(`(()=>{const rec=(${REC});let n=0,tot=0;for(let i=0;i<150;i++){const q=rec(1000+i*777),hx=q.hero[0]-q.cam[0],hy=q.hero[1]-q.cam[1];
      q.r.forEach(r=>{tot++;if(r[0]+r[2]>hx-9&&r[0]<hx+9&&r[1]+r[3]>hy-28&&r[1]<hy+2)n++;});}return {n,tot};})()`);
    chk(`2D: no ambience particle over the hero in 150 frames (${hits.n} of ${hits.tot})`,hits.tot>100&&hits.n===0||JSON.stringify(hits));
    // 4. a chest: opened, it is no longer drawn, can be walked over, stays opened in the save; minimap leaves it out, full map dims it
    const c=await ev(()=>{const A=__A;for(let s=0;s<5;s++){const m=A.getMap('f'+s);for(const [x,y] of m.chests||[]){if(A.G.chests[m.id+':'+x+','+y]||A.tileAt(m,x,y)!=='C')continue;if(!A.solidAt(m,x,y+1)&&!A.solidAt(m,x,y+2)){A.placeAt(m.id,x,y+2,'u');A.render();return {id:m.id,x,y};}}}return null;});
    const px=()=>ev(c=>{const A=__A,cv=A.WS.base&&A.WS.base[0];if(!cv)return null;const d=cv.getContext('2d').getImageData(c.x*16,c.y*16-8,16,24).data;let h=0;for(let i=0;i<d.length;i+=4)h=(h*31+d[i]*3+d[i+1]*5+d[i+2]*7)>>>0;return h;},c);
    const ref=await ev(c=>{const A=__A,m=A.getMap(c.id),r=m.t[c.y][c.x];m.t[c.y][c.x]=m.t[c.y+1][c.x];A.rebuildBase();return r;},c);const bare=await px();
    await ev(c=>{const A=__A,m=A.getMap(c.id);m.t[c.y][c.x]='C';A.rebuildBase();},c);const shut=await px();
    await ev(c=>{const A=__A;A.openChest(c.x,c.y);A.V.modal=null;try{A.nextDlg();}catch(e){}A.V.modal=null;A.render();},c);await wait(1400);const opened=await px();// v0.8.3: the open animation plays and fades first
    const st=await ev(c=>{const A=__A,m=A.WS.m,k=m.id+':'+c.x+','+c.y;return {saved:!!A.G.chests[k],solid:A.solidAt(m,c.x,c.y),tile:A.tileAt(m,c.x,c.y),left:A.chestsLeft?A.chestsLeft(m.id):null,marks:A.mapMarks(m).filter(o=>o.x===c.x&&o.y===c.y).map(o=>o.k)};},c);
    chk(`chest: the ground where an opened chest stood looks like bare ground (closed ${shut!==bare}, opened = bare ${opened===bare})`,shut!==bare&&opened===bare||JSON.stringify({bare,shut,opened}));
    chk(`chest: opened stays opened in the save and can be walked over (${JSON.stringify(st)})`,st.saved&&st.solid===false&&st.tile==='c'&&st.marks.join()==='chestopen'||JSON.stringify(st));
    const mm=await ev(c=>{const A=__A;let cv=document.getElementById('mmap');if(!cv)return null;if(cv.style.display==='none'){A.ACT.miniT();cv=document.getElementById('mmap');}if(cv.style.display==='none')return null;const x=cv.getContext('2d'),f0=x.fillText,t=[];x.fillText=function(s){t.push(s);return f0.apply(this,arguments);};try{A.drawMini();}finally{delete x.fillText;}return t;},c);
    chk(`minimap: no marker for the opened chest (glyphs drawn: ${mm&&mm.join('')})`,!!mm&&!mm.includes('▫')||JSON.stringify(mm));
    const fm=await ev(()=>new Promise(res=>{const A=__A;A.ACT.map();setTimeout(()=>{const cv=document.getElementById('fmap');if(!cv)return res(null);const x=cv.getContext('2d'),f0=x.fillText,t=[];x.fillText=function(s){if(s==='▫')t.push(+x.globalAlpha.toFixed(2));return f0.apply(this,arguments);};
      try{A.W63?A.W63.drawFullMap&&A.W63.drawFullMap():0;window.dispatchEvent(new Event('resize'));}finally{setTimeout(()=>{delete x.fillText;A.V.modal=null;A.render();res(t);},50);}},80);}));
    chk(`full map: the opened chest is still shown, dimmed (alphas ${JSON.stringify(fm)})`,!!fm&&fm.length>0&&fm.every(a=>a<.9)||JSON.stringify(fm));
    chk(`low: no console errors (${H.errs.slice(0,2).join(' | ')})`,H.errs.length===0);await H.browser.close();}
  // ---------- HD-2D (Medium) ----------
  {const H=await boot('medium',933,705);const {ev,wait}=H;const f=await ev(FIELD);await wait(600);
    // 2, 3. the overlay canvas draws no ambience particles; the GL scene does
    const ov=await ev(()=>new Promise(res=>{const A=__A,ctx=A.WS.ctx,f0=ctx.fillRect,C=['#fff2a0','#ffd04a','#f6e06a','#f08ab0','#ffffff'];let n=0;
      ctx.fillRect=function(){const s=String(ctx.fillStyle).toLowerCase();if(C.includes(s))n++;return f0.apply(this,arguments);};let k=0;const st=()=>{if(++k<40)requestAnimationFrame(st);else{delete ctx.fillRect;res({n,live:A.HD.live,gl:A.W63?A.W63.HW.n:-1});}};requestAnimationFrame(st);}));
    chk(`HD-2D: ambience particles are in the GL scene, none on the 2D canvas over it (overlay rects ${ov.n}, scene particles ${ov.gl})`,ov.live&&ov.n===0&&ov.gl>0||JSON.stringify(ov));
    // GL particles keep their world spot whatever the camera (the same moment, two camera centres)
    const an=await ev(()=>{const A=__A,W=A.W63;if(!W)return null;const m=A.WS.m,a=[],b=[];W.wfxRun('amb',m,40000,500,400,1024,768,(x,z,h)=>a.push([x,z,h]));W.wfxRun('amb',m,40000,560,420,1024,768,(x,z,h)=>b.push([x,z,h]));
      const near=(p,c)=>Math.abs(p[0]-c[0])<300&&Math.abs(p[1]-c[1])<200;let same=0,n=0;a.forEach((p,i)=>{if(!near(p,[530,410]))return;n++;const q=b[i];if(q&&Math.abs(q[0]-p[0])<.01&&Math.abs(q[1]-p[1])<.01)same++;});return {n,same};});
    chk(`HD-2D: a particle near the view keeps its world position when the camera moves (${an&&an.same} of ${an&&an.n})`,!!an&&an.n>4&&an.same===an.n||JSON.stringify(an));
    // 3. stale pixels: something an earlier 2D frame left on the world canvas is cleared by the overlay (the whole 2x bitmap, not a quarter)
    const stale=await ev(()=>new Promise(res=>{const A=__A,cv=A.WS.cv,x=cv.getContext('2d');A.WS.m.amb=null;x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle='#ff00ff';x.fillRect(0,0,cv._rw||cv.width,cv._rh||cv.height);x.restore();A.HD.ovClear=null;
      let k=0;const st=()=>{if(++k<12)requestAnimationFrame(st);else{const W=cv._rw||cv.width,H=cv._rh||cv.height,d=x.getImageData(0,0,W,H).data;let q=[0,0,0,0];for(let y=0;y<H;y+=3)for(let i=0;i<W;i+=3){if(d[(y*W+i)*4+3]>0)q[(y<H/2?0:2)+(i<W/2?0:1)]++;}res(q);}};requestAnimationFrame(st);}));
    chk(`HD-2D: no stale 2D pixels left over the GL view (opaque samples per quarter ${stale})`,stale.every(v=>v===0)||JSON.stringify(stale));
    const rain=await ev(()=>new Promise(res=>{const A=__A,cv=A.WS.cv,x=cv.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv._rw||cv.width,cv._rh||cv.height);x.restore();A.HD.ovClear=null;A.G.weather[A.WS.m.s]='rain';A.TR.wx.key=null;A.render();
      let k=0;const st=()=>{if(++k<30)requestAnimationFrame(st);else{const W=cv._rw||cv.width,H=cv._rh||cv.height,d=x.getImageData(0,0,W,H).data;let q=[0,0,0,0];for(let y=0;y<H;y+=2)for(let i=0;i<W;i+=2){if(d[(y*W+i)*4+3]>0)q[(y<H/2?0:2)+(i<W/2?0:1)]++;}A.G.weather[A.WS.m.s]='clear';res(q);}};requestAnimationFrame(st);}));
    chk(`HD-2D: rain covers the whole view (overlay samples per quarter ${rain})`,rain.every(v=>v>rain[0]*.5)||JSON.stringify(rain));
    // 1. the fortress gatehouse: geometry in the bake, no flat painting into the ground (its banner rects) during the HD-2D bake
    const fort=await ev(()=>{const A=__A;let s=1,m=null;for(;s<5;s++){m=A.getMap('f'+s);if(m.fortAt)break;}if(!m||!m.fortAt)return {none:1};A.placeAt(m.id,m.fortAt[0],m.fortAt[1]+3,'u');A.render();
      const P=CanvasRenderingContext2D.prototype,f0=P.fillRect;let paint=0;P.fillRect=function(x,y,w,h){if(String(this.fillStyle).toLowerCase()==='#c0392b'&&w===5&&h===12)paint++;return f0.apply(this,arguments);};
      try{A.HD.dirty=true;A.HD.S=null;A.HD.map=null;A.worldDraw2(performance.now());}finally{P.fillRect=f0;}const S=A.HD.S,g=(S&&S.bh||[]).find(o=>o.b&&o.b.k==='gatehouse');
      return {paint,gate:!!g,h:g?Math.round(g.h):0,live:A.HD.live,at:m.fortAt};});
    chk(`HD-2D: the fortress gatehouse stands up as geometry (${JSON.stringify(fort)}) and is not painted flat on the ground`,fort.live&&fort.gate&&fort.h>=30&&fort.paint===0||JSON.stringify(fort));
    chk(`medium: no console errors (${H.errs.slice(0,2).join(' | ')})`,H.errs.length===0);await H.browser.close();}
  // ---------- 5, 6. the world map, portrait and landscape ----------
  for(const [w,h,tag] of [[390,844,'portrait'],[844,390,'landscape']]){const H=await boot('low',w,h);const {ev,wait,page}=H;
    await ev(()=>{const A=__A,G=A.G;['t0','f0','d0','t1','f1'].forEach(id=>{G.been[id]=1;});G.cleared[0]=1;const m=A.getMap('f1');(m.caves||[]).forEach(c=>{G.cavesSeen=G.cavesSeen||{};G.cavesSeen[c.id]=1;});
      const a=Object.values(m.gates)[0].arrive;A.placeAt('f1',a[0],a[1],'d');A.V.modal=null;A.render();A.ACT.map();A.ACT.worldMap();});await wait(500);
    const s=await ev(()=>{const cv=document.getElementById('wmap');if(!cv)return null;const r=cv.getBoundingClientRect(),x=cv.getContext('2d'),c=x.getImageData(4,Math.floor(cv.height/2),1,1).data,mid=x.getImageData(Math.floor(cv.width*.3),Math.floor(cv.height*.15),1,1).data;
      return {w:Math.round(r.width),h:Math.round(r.height),vw:innerWidth,vh:innerHeight,edge:[...c].slice(0,3),mid:[...mid].slice(0,3),leg:[...document.querySelectorAll('.maplegend span')].map(e=>e.textContent.trim()),hit:__A.W63&&__A.W63.WM?__A.W63.WM.hit.length:0};});
    const parch=p=>p&&p[0]>140&&p[0]>p[2]+20;// warm paper, not the old near black #0a0710
    chk(`world map ${tag}: a parchment chart (${JSON.stringify(s&&s.edge)}), fits the screen width (${s&&s.w} of ${s&&s.vw} px)`,!!s&&parch(s.edge)&&s.w<=s.vw&&s.hit>=4||JSON.stringify(s));
    chk(`world map ${tag}: legend lists towns, fields, dungeons, fortresses, you and unvisited places (${s&&s.leg.join(', ')})`,!!s&&['Town','Field','Dungeon','Fortress','You','Not visited yet'].every(k=>s.leg.includes(k))||JSON.stringify(s&&s.leg));
    if(tag==='landscape')chk(`world map landscape: the whole chart is in view (${s&&s.h} of ${s&&s.vh} px tall)`,!!s&&s.h<=s.vh*.8||JSON.stringify(s));
    const t=await ev(()=>{const W=__A.W63&&__A.W63.WM,cv=document.getElementById('wmap');if(!W||!cv)return null;const n=W.hit.find(o=>o.id==='t1')||W.hit[0],r=cv.getBoundingClientRect();return {id:n.id,label:n.label,x:r.left+n.x*r.width/cv.width,y:r.top+n.y*r.height/cv.height};});
    if(t){await page.mouse.click(t.x,t.y);await wait(300);}
    const after=await ev(()=>({open:!!(__A.V.modal&&__A.V.modal.type==='worldmap'),sel:__A.W63&&__A.W63.WM?__A.W63.WM.sel:null}));
    chk(`world map ${tag}: a tap on a place shows its name and keeps the map open (${t&&t.label}: ${JSON.stringify(after)})`,!!t&&after.open&&after.sel===t.id||JSON.stringify({t,after}));
    if(tag==='portrait'){const nm=await ev(()=>({fort:(__A.W63&&__A.W63.MAPICO_NAME||{}).fort,txt:document.body.innerText.match(/side fortress/i)}));
      chk(`naming: fortresses are "Fortress" (${nm.fort}), no "side fortress" on screen`,nm.fort==='Fortress'&&!nm.txt||JSON.stringify(nm));}
    chk(`${tag}: no console errors (${H.errs.slice(0,2).join(' | ')})`,H.errs.length===0);
    if(tag==='landscape')await done(H);else await H.browser.close();}
})();
