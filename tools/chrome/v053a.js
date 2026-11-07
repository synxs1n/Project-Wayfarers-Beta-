// Beta v0.5.3 HD-2D world: functional checks. WebGL view on Medium and High, the 2D view on Low and with Settings > HD-2D world off,
// the fallback without WebGL (getContext stubbed) and after a lost context, taps landing on the tapped tile through the camera, the view
// size at phone, sideways, Galaxy Z Fold open and desktop sizes (also after a battle), reduced motion, partial rebakes, no console errors.
// Usage: PWHTML=../../out/aurelis3.html node v053a.js
const {open,chk,done}=require('./pw');
const META=(t,x)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:Object.assign({speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false},${JSON.stringify(x||{})})}));`;
const start=ev=>ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
const state=ev=>ev(()=>{const A=__A,HD=A.HD,w=A.WS.cv,c=HD.cv;try{A.worldDraw2(performance.now());}catch(e){}// v0.6.3: a frame first, so the GL canvas has followed a layout change made just before (the first frames after a new journey are slow)
 
  return {live:HD.live,broken:HD.broken,why:HD.why,hd:!!document.querySelector('.wview.hd'),gl:!!(c&&c.isConnected&&getComputedStyle(c).display!=='none'),same:!!(c&&w&&c.parentElement===w.parentElement),
    cssGL:c&&c.isConnected?[c.style.width,c.style.height]:null,css2D:w?[w.style.width,w.style.height]:null,cssPx:w?[Math.round(w.getBoundingClientRect().width),Math.round(w.getBoundingClientRect().height)]:null,
    buf:c?[c.width,c.height]:null,v:[A.WS.vw,A.WS.vh,A.WS.scale],px:(()=>{try{A.worldDraw2(performance.now());A.worldDraw2(performance.now());return [...A.WS.ctx.getImageData(Math.floor(A.WS.vw/2),Math.floor(A.WS.vh/2),1,1).data];}catch(e){return null;}})()};});
// project a ground point to client coordinates through the HD camera
const PROJ=`(x,y,z)=>{const M=__A.HD.mats.vp,X=M[0]*x+M[4]*y+M[8]*z+M[12],Y=M[1]*x+M[5]*y+M[9]*z+M[13],W=M[3]*x+M[7]*y+M[11]*z+M[15],r=__A.WS.cv.getBoundingClientRect();return [r.left+(X/W*.5+.5)*r.width,r.top+(1-(Y/W*.5+.5))*r.height];}`;
(async()=>{
  const errs=[];
  // ---- tiers ----
  for(const t of ['low','medium','high']){const H=await open({w:390,h:844,mobile:true,dpr:2,pre:META(t)});H.page.on('console',m=>{if(m.type()==='error'&&!/file:\/\/|ERR_FILE|net::/.test(m.text()))errs.push(t+': '+m.text());});
    await start(H.ev);await H.wait(700);const s=await state(H.ev);
    if(t==='low')chk('Low: the 2D view',!s.live&&s.px&&s.px[3]===255||JSON.stringify(s));
    else chk(`${t}: the HD-2D view is live under the 2D canvas, same CSS size (${s.cssGL}), art pixel buffer (${s.buf})`,s.live&&s.hd&&s.gl&&s.same&&s.cssGL+''===s.css2D+''&&s.buf+''===[s.v[0],s.v[1]]+''&&s.px[3]===255||JSON.stringify(s));
    if(t==='medium'){
      chk('Medium renders on the art pixel grid (buffer = the view in art pixels)',s.buf[0]===s.v[0]&&s.buf[1]===s.v[1]||JSON.stringify(s));
      // Settings row, then turning it off and on
      const row=await H.ev(()=>{__A.ACT.settings&&__A.ACT.settings();__A.render();const r=[...document.querySelectorAll('.hdrows .chip')].map(b=>b.textContent+(b.classList.contains('on')?'*':''));__A.V.modal=null;__A.render();return r;});
      chk('Settings shows HD-2D world On/Off with On selected by default',row.join()==='On*,Off'||JSON.stringify(row));
      await H.ev(()=>{__A.ACT.cfg(JSON.stringify(['hd2d',false]));__A.V.modal=null;__A.render();});await H.wait(400);const off=await state(H.ev);
      chk('HD-2D world off: the 2D view',!off.live&&off.px[3]===255||JSON.stringify(off));
      await H.ev(()=>{__A.ACT.cfg(JSON.stringify(['hd2d',true]));__A.V.modal=null;__A.render();});await H.wait(400);const on=await state(H.ev);
      chk('HD-2D world on again: live',on.live||JSON.stringify(on));
      // taps through the camera, in a field (open ground): tiles around the hero land on themselves
      await H.ev(async()=>{const A=__A,m=A.getMap('f0');let best=null,bs=-1;for(let y=4;y<m.h-6;y++)for(let x=5;x<m.w-5;x++){if(A.solidAt(m,x,y))continue;let n=0;for(let b=-3;b<=6;b++)for(let a=-4;a<=4;a++)if(!A.solidAt(m,x+a,y+b)&&'#ZH'.indexOf(A.tileAt(m,x+a,y+b))<0)n++;if(n>bs){bs=n;best=[x,y];}}
        A.placeAt('f0',best[0],best[1],'d');A.render();await new Promise(r=>setTimeout(r,700));});
      const tap=await H.ev(`(()=>{const A=__A,m=A.WS.m,P=${PROJ},S=A.HD.S,out={ok:0,n:0,bad:[]};
        for(let dy=-3;dy<=3;dy++)for(let dx=-4;dx<=4;dx++){const x=A.WS.x+dx,y=A.WS.y+dy;if(x<0||y<0||x>=m.w||y>=m.h)continue;
          let low=true;for(let k=0;k<=9;k++){const yy=y+k;if(yy>=m.h)break;if(S.HT[yy*m.w+x]>0||(S.bh||[]).some(o=>x>=o.b.x&&x<o.b.x+o.b.w&&yy>=o.b.y&&yy<o.b.y+o.b.h))low=false;}
          if(!low||A.dynActors(m).some(n=>Math.abs(n.x-x)<=1&&Math.abs(n.y-y)<=2)||(m.nodes||[]).some(n=>n.x===x&&n.y===y))continue;
          const [cx,cy]=P(x*16+8,0,y*16+8),p=A.mapPoint({clientX:cx,clientY:cy});out.n++;if(p&&p.tx===x&&p.ty===y)out.ok++;else out.bad.push([x,y,p&&p.tx,p&&p.ty]);}
        return out;})()`);
      chk(`taps on ground tiles land on the tapped tile through the camera (${tap.ok}/${tap.n})`,tap.n>=8&&tap.ok===tap.n||JSON.stringify(tap));
      // a real tap (pointer events on the canvas) two tiles away sets the walk target to that tile
      const real=await H.ev(`(async()=>{const A=__A,m=A.WS.m,P=${PROJ};let t=null;for(const [dx,dy] of [[2,1],[-2,1],[2,2],[0,2],[3,0],[-3,0],[1,3]]){const x=A.WS.x+dx,y=A.WS.y+dy;if(x>=0&&y>=0&&x<m.w&&y<m.h&&!A.solidAt(m,x,y)&&A.HD.S.HT[y*m.w+x]<=0&&!(m.nodes||[]).some(n=>n.x===x&&n.y===y)&&A.tileAt(m,x,y)!=='E'){t=[x,y];break;}}
        if(!t)return 'no free tile';const [cx,cy]=P(t[0]*16+8,0,t[1]*16+8),cv=A.WS.cv,o={clientX:cx,clientY:cy,pointerId:7,bubbles:true,isPrimary:true,pointerType:'touch'};
        cv.dispatchEvent(new PointerEvent('pointerdown',o));await new Promise(r=>setTimeout(r,30));document.dispatchEvent(new PointerEvent('pointerup',o));
        return {t,target:A.WS.target,walked:null};})()`);
      chk('a real tap sets the walk target to the tapped tile',real&&real.target&&real.target[0]===real.t[0]&&real.target[1]===real.t[1]||JSON.stringify(real));
      await H.wait(1500);const arrived=await H.ev(()=>[__A.WS.x,__A.WS.y]);
      chk('the hero walks onto the tapped tile',arrived[0]===real.t[0]&&arrived[1]===real.t[1]||JSON.stringify({arrived,t:real.t}));
      // a tap on a townsperson's sprite picks their tile (back in town)
      await H.ev(async()=>{const A=__A,lt=A.G.lastTown||0,[x,y]=A.innSpot(lt);A.placeAt('t'+lt,x,y,'d');A.render();await new Promise(r=>setTimeout(r,600));});
      const npc=await H.ev(`(()=>{const A=__A,m=A.WS.m,P=${PROJ},n=m.npcs.find(n=>!n.mv&&Math.abs(n.x-A.WS.x)<=5&&Math.abs(n.y-A.WS.y)<=4);if(!n)return 'none';
        const [cx,cy]=P(n.x*16+8,14,n.y*16+12.5),p=A.mapPoint({clientX:cx,clientY:cy});return {n:[n.x,n.y],p:p&&[p.tx,p.ty]};})()`);
      chk('a tap on a townsperson picks their tile',npc==='none'||npc.p&&npc.p[0]===npc.n[0]&&npc.p[1]===npc.n[1]||JSON.stringify(npc));
      // every map kind renders live: field, dungeon, cave, Echo Sanctum, Archive
      const kinds=await H.ev(async()=>{const A=__A,o={},w=()=>new Promise(r=>setTimeout(r,350));
        const m=A.getMap('f0'),g=Object.values(m.gates)[0].arrive;A.placeAt('f0',g[0],g[1],'r');A.render();await w();o.field=A.HD.live;
        A.enterDungeon(0);A.render();await w();o.dungeon=A.HD.live;
        const cv=(m.caves||[]).find(c=>c.kind!=='fort');if(cv){A.placeAt('f0',cv.out[0],cv.out[1],'d');A.enterCave(cv,0);A.render();await w();o.cave=A.HD.live;}
        try{A.getMap('s0');A.placeAt('s0',13,16,'u');A.render();await w();o.sanctum=A.HD.live;}catch(e){o.sanctum='err '+e.message;}
        try{A.getMap('a0');A.placeAt('a0',9,10,'u');A.render();await w();o.archive=A.HD.live;}catch(e){o.archive='err '+e.message;}
        const lt=A.G.lastTown||0;A.placeAt('t'+lt,5,9,'d');A.render();await w();o.why=A.HD.why;return o;});
      chk('field, dungeon, cave, Echo Sanctum and Archive render in HD-2D',kinds.field&&kinds.dungeon&&kinds.cave!==false&&kinds.sanctum===true&&kinds.archive===true||JSON.stringify(kinds));
      // opening a chest only re-cuts the prop cards (no full rebake)
      const ch=await H.ev(async()=>{const A=__A;A.enterDungeon(0);A.render();await new Promise(r=>setTimeout(r,400));const m=A.WS.m,c=(m.chests||[])[0];if(!c)return 'no chest';
        const b=A.HD.bakes,p=A.HD.partial||0;A.G.chests[m.id+':'+c[0]+','+c[1]]=1;A.rebuildBase();await new Promise(r=>setTimeout(r,300));return {b:A.HD.bakes-b,p:(A.HD.partial||0)-p,live:A.HD.live,ms:Math.round(A.HD.bakeMs)};});
      chk(`a chest opening re-cuts only the prop cards (${JSON.stringify(ch)})`,ch.b===1&&ch.p===1&&ch.live||JSON.stringify(ch));
      // a lost WebGL context falls back to the 2D view, and comes back when restored
      const lost=await H.ev(async()=>{const A=__A,gl=A.HD.gl,x=gl.getExtension('WEBGL_lose_context');if(!x)return 'no ext';const w=()=>new Promise(r=>setTimeout(r,400));
        x.loseContext();await w();const d=A.WS.ctx.getImageData(5,5,1,1).data,a={live:A.HD.live,lost:A.HD.lost,op:d[3],gl:getComputedStyle(document.querySelector('canvas.wgl')).display};x.restoreContext();await w();await w();return {a,b:{live:A.HD.live,lost:A.HD.lost}};});
      chk('a lost context shows the 2D view, a restored one HD-2D again',lost.a&&!lost.a.live&&lost.a.lost&&lost.a.op===255&&lost.a.gl==='none'&&lost.b.live&&!lost.b.lost||JSON.stringify(lost));
    }
    await H.browser.close();}
  // ---- no WebGL at all ----
  {const H=await open({w:390,h:844,mobile:true,dpr:2,pre:`(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(/webgl/.test(t))return null;return g.call(this,t,o);};})();`+META('high')});
    H.page.on('console',m=>{if(m.type()==='error'&&!/file:\/\/|ERR_FILE|net::/.test(m.text()))errs.push('nogl: '+m.text());});await start(H.ev);await H.wait(700);const s=await state(H.ev);
    const px=await H.ev(()=>{const d=__A.WS.ctx.getImageData(Math.floor(__A.WS.vw/2),Math.floor(__A.WS.vh/2),1,1).data;return d[3];});
    chk('no WebGL: the 2D view draws (opaque) and HD-2D says why',!s.live&&s.broken&&px===255||JSON.stringify(Object.assign(s,{px})));
    const row=await H.ev(()=>{__A.ACT.settings&&__A.ACT.settings();__A.render();const t=(document.querySelector('.hdrows')||{}).textContent||'';__A.V.modal=null;__A.render();return t;});
    chk('Settings tells the player HD-2D is not available',/Not available on this device/.test(row)||row);
    await H.browser.close();}
  // ---- reduced motion: no camera sway (two frames far apart see the same camera), no overlay particles ----
  {const H=await open({w:390,h:844,mobile:true,dpr:2,pre:META('high',{rmotion:true})});H.page.on('console',m=>{if(m.type()==='error'&&!/file:\/\/|ERR_FILE|net::/.test(m.text()))errs.push('rm: '+m.text());});await start(H.ev);await H.wait(800);
    const r=await H.ev(async()=>{const A=__A,e=[],w=()=>new Promise(r=>setTimeout(r,30));A.G.weather[A.WS.m.s]='clear';A.TR.wx.key=null;await w();A.worldDraw2(1000);e.push(A.HD.eye.slice());await w();A.worldDraw2(6000);e.push(A.HD.eye.slice());
      await new Promise(r=>setTimeout(r,500));const d=A.WS.ctx.getImageData(0,0,A.WS.vw,A.WS.vh).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;
      return {same:e[0].every((v,i)=>Math.abs(v-e[1][i])<1e-6),ovPixels:n,w:A.G.weather[A.WS.m.s],th:A.WS.m.theme};});
    chk('reduced motion: the camera holds still',r.same||JSON.stringify(r));
    chk('reduced motion: nothing drifts on the overlay in clear weather (the 2D canvas over the GL view stays empty)',r.ovPixels===0||JSON.stringify(r));
    const r2=await H.ev(()=>{const A=__A;A.META.cfg.rmotion=false;const e=[];A.worldDraw2(1000);e.push(A.HD.eye.slice());A.worldDraw2(6000);e.push(A.HD.eye.slice());A.META.cfg.rmotion=true;return e[0][0]!==e[1][0]||e[0][1]!==e[1][1];});
    chk('v0.10.0: the camera no longer drifts at rest (HD2D.sway amp 0: the drift made the pixel scene jump a pixel whenever it crossed a pixel boundary)',r2===false);
    await H.browser.close();}
  // ---- view size at phone, sideways, Fold open and desktop sizes, also after a battle and after rotating ----
  for(const [w,h] of [[390,844],[844,390],[933,705],[1280,800]]){const H=await open({w,h,mobile:w<1000,dpr:2,pre:META('medium')});const {ev,wait}=H;H.page.on('console',m=>{if(m.type()==='error'&&!/file:\/\/|ERR_FILE|net::/.test(m.text()))errs.push(w+': '+m.text());});
    await start(ev);await wait(700);const a=await state(ev);
    chk(`${w}x${h}: HD-2D frame matches the view (${a.v} art px, ${a.cssPx} CSS px)`,a.live&&a.same&&a.cssGL+''===a.css2D+''&&a.buf+''===[a.v[0],a.v[1]]+''&&a.cssPx[0]===a.v[0]*a.v[2]&&a.cssPx[1]===a.v[1]*a.v[2]&&a.cssPx[0]>=300||JSON.stringify(a));
    await ev(()=>{__A.startBattle({stage:0,kind:'field'});});await wait(500);await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.win();});await wait(400);
    await ev(()=>{const b=document.querySelector('[data-act="resultOk"]');if(b)b.click();});await wait(800);const b=await state(ev);
    chk(`${w}x${h}: after a battle HD-2D draws into the new world canvas, same size (${b.cssPx})`,b.live&&b.same&&b.cssGL+''===a.cssGL+''&&b.cssPx+''===a.cssPx+''&&b.buf+''===a.buf+''&&b.px[3]===255||JSON.stringify({a,b}));
    if(w===390){await H.page.setViewportSize({width:844,height:390});await wait(1200);const c=await state(ev);
      chk(`rotated to 844x390: HD-2D follows the view (${c.v})`,c.live&&c.same&&c.cssGL+''===c.css2D+''&&c.buf+''===[c.v[0],c.v[1]]+''&&c.cssPx+''!==a.cssPx+''||JSON.stringify(c));}
    await H.browser.close();}
  chk(`no console errors (${errs.slice(0,4).join(' | ')})`,errs.length===0);
  console.log((process.exitCode?'':'')+'done');await require('./pw').done({browser:{close:async()=>{}}});
})();
