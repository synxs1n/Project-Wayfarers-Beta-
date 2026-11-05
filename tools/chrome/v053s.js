// v0.5.3 HD sprites: every hero (side stand and walk, front and back walk frames), every townsfolk look and every monster art renders without
// errors at SPR.k detail and the logical size its consumers expect; feet land on the same row for every hero and frame (world anchoring);
// drawImage of an HD sprite with 3, 5 and 9 arguments covers the logical box; portraits keep their aspect and show the face inside the crop;
// battle unit boxes use logical sizes and the battle and world canvases render at SPR.k; legend mounts and pets; no console errors.
// Usage: PWHTML=../../out/aurelis3.html node v053s.js
const {open,chk,done}=require('./pw');
(async()=>{
  const H=await open({w:390,h:844,mobile:true,dpr:2});const {page,ev,wait}=H;const cerr=[];
  page.on('console',m=>{if(m.type()==='error')cerr.push(m.text());});
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;
    ['brann','sable','tess'].forEach(id=>{A.G.roster[id]=A.newChar(id,5,0);A.G.party.push(id);});A.render();});await wait(400);
  const cfg=await ev(()=>({hd:__A.SPRITE_HD,k:__A.SPR.k,addH:__A.SPR.addH}));
  chk(`SPRITE_HD is on (k ${cfg.k}, heroes ${cfg.addH} rows taller)`,cfg.hd===true&&cfg.k===2);
  // opaque box of a canvas in logical rows, from its real pixels; 'solid' only counts fully opaque pixels
  const R=await ev((cfg)=>{const A=__A,out={bad:[],heroes:0,frames:0,mons:0,feet:{},tops:[]};
    const box=(c)=>{const k=c.hd||1,w=c._rw||c.width,h=c._rh||c.height,d=(c.getContext('2d')).getImageData(0,0,w,h).data;let x0=1e9,y0=1e9,x1=-1,y1=-1,sb=-1,top=0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=d[(y*w+x)*4+3];if(!a)continue;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(a===255&&y>sb)sb=y;if(y===0)top++;}
      return {k,w,h,x0,y0,x1,y1,solidBottom:Math.floor(sb/k),top};};
    const ids=Object.keys(A.TPL).filter(id=>!A.TPL[id].mon);
    ids.forEach(id=>{const t=A.TPL[id],L=A.heroLook(id),leg=L&&(L.mount||L.pets)||t.scourge;
      try{[false,true].forEach(w=>{const c=A.heroCanvas(id,w);out.frames++;const b=box(c);
          if(c.hd!==cfg.k)out.bad.push(id+' side not HD');
          if(!leg&&(c.width!==36||c.height!==40+cfg.addH))out.bad.push(`${id} side ${c.width}x${c.height}`);
          if(!leg)out.feet['side'+(w?1:0)+':'+b.solidBottom]=(out.feet['side'+(w?1:0)+':'+b.solidBottom]||0)+1;
          if(b.x1<0)out.bad.push(id+' empty');if(b.top>8)out.tops.push(id+' side top row '+b.top);});
        [['front',0],['front',1],['front',2],['back',0],['back',1],['back',2],['side',0],['side',1]].forEach(([v,f])=>{const c=A.walkerCanvas('t53'+id,L,t.el,id,v,f);out.frames++;const b=box(c);
          if(c.width!==36||c.height!==40+cfg.addH)out.bad.push(`${id} ${v}${f} ${c.width}x${c.height}`);
          out.feet[v+':'+b.solidBottom]=(out.feet[v+':'+b.solidBottom]||0)+1;if(b.top>8)out.tops.push(`${id} ${v}${f} top row ${b.top}`);});
        out.heroes++;}catch(e){out.bad.push(id+' threw '+e.message);}});
    // monsters: every art key, including realm variants, echoes and night forms
    Object.keys(A.MART).forEach(k=>{try{const c=A.monCanvas(k),b=box(c),s=A.MON_SIZE(k);out.mons++;
      if(c.width!==s||c.height!==s||c.hd!==cfg.k)out.bad.push(`${k} ${c.width}x${c.height} hd ${c.hd} want ${s}`);if(b.x1<0)out.bad.push(k+' empty');}catch(e){out.bad.push(k+' threw '+e.message);}});
    // townsfolk of every town reached so far plus generated looks
    const m=A.getMap('t0');let v=0;(m.npcs||[]).forEach((n,i)=>{if(!n.look||n.portal)return;['front','side','back'].forEach(view=>{const c=A.walkerCanvas('t53n'+i,n.look,['light'],null,view,0);v++;if(c.height!==40+cfg.addH)out.bad.push('npc '+n.name+' '+c.height);});});
    if(A.villagerLook)for(let i=0;i<20;i++){const L=A.villagerLook('Villager'+i);const c=A.walkerCanvas('t53v'+i,L,['light'],null,'front',1);v++;if(c.height!==40+cfg.addH)out.bad.push('villager '+i);}
    out.villagers=v;return out;},cfg);
  chk(`${R.heroes} heroes x ${Math.round(R.frames/R.heroes)} frames, ${R.mons} monster arts and ${R.villagers} townsfolk sprites render at the expected logical sizes`,R.bad.length===0||R.bad.slice(0,8).join(' | '));
  // the soles sit on row 40+addH-3 (43); a few heroes have a tail, cape hem or robe that reaches a row or two lower, as before
  const fr={};Object.keys(R.feet).forEach(k=>{const r=+k.split(':')[1];fr[r]=(fr[r]||0)+R.feet[k];});const tot=Object.values(fr).reduce((a,b)=>a+b,0),sole=40+cfg.addH-3;
  chk(`feet land on row ${sole} (${JSON.stringify(fr)}): ${Math.round((fr[sole]||0)/tot*100)}% exactly, none higher, none cut by the canvas`,(fr[sole]||0)/tot>.95&&Object.keys(fr).every(r=>+r>=sole&&+r<=sole+2)||JSON.stringify(R.feet));
  chk('nothing is clipped at the top edge (no hero frame has more than 8 opaque pixels on row 0)',R.tops.length===0||R.tops.slice(0,6).join(' | '));
  // drawImage of an HD canvas: 3, 5 and 9 argument forms
  const D=await ev(()=>{const A=__A,c=A.heroCanvas('mira',false),o=document.createElement('canvas');o.width=200;o.height=100;const x=o.getContext('2d');
    const bb=(x0,w)=>{const d=x.getImageData(x0,0,w,100).data;let y1=-1,x1=-1;for(let y=0;y<100;y++)for(let xx=0;xx<w;xx++)if(d[(y*w+xx)*4+3]){if(y>y1)y1=y;if(xx>x1)x1=xx;}return [x1,y1];};
    x.drawImage(c,0,0);x.drawImage(c,60,0,36,46);x.drawImage(c,0,0,36,23,120,0,36,23);
    return {a:bb(0,60),b:bb(60,60),c:bb(120,60),w:c.width,h:c.height,rw:c._rw,rh:c._rh};});
  chk(`drawImage keeps logical sizes (3 args ${D.a}, 5 args ${D.b}, 9 args top half ${D.c}; canvas ${D.w}x${D.h} real ${D.rw}x${D.rh})`,D.a[1]<46&&D.a[1]>38&&D.b[1]<46&&D.b[1]>38&&D.c[1]<=22&&D.c[1]>15&&D.rw===72&&D.rh===92||JSON.stringify(D));
  // world: the canvas renders at SPR.k with logical width and height
  const Wd=await ev(()=>{const A=__A,cv=A.WS.cv;A.worldDraw(performance.now());return {w:cv.width,h:cv.height,vw:A.WS.vw,vh:A.WS.vh,rw:cv._rw,ss:cv._ss,css:cv.style.width};});
  chk(`world canvas ${Wd.w}x${Wd.h} logical (view ${Wd.vw}x${Wd.vh}) renders at ${Wd.rw/Wd.w}x`,Wd.w===Wd.vw&&Wd.h===Wd.vh&&Wd.rw===Wd.w*cfg.k&&Wd.ss===cfg.k||JSON.stringify(Wd));
  // portraits: the party menu crops keep the picture's aspect and the face inside the window
  await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'party'};A.render();});await wait(500);
  const P=await ev(()=>{const out={n:0,bad:[]};document.querySelectorAll('.port:not(.mon) img').forEach(im=>{const r=im.getBoundingClientRect(),p=im.parentElement.getBoundingClientRect();if(!r.width||!im.naturalWidth)return;out.n++;
      const ar=r.height/r.width,nar=im.naturalHeight/im.naturalWidth;if(Math.abs(ar-nar)>.03)out.bad.push('aspect '+ar.toFixed(2)+' vs '+nar.toFixed(2));
      const s=r.width/36,fy0=r.top+8*s,fy1=r.top+16*s,fx0=r.left+13*s,fx1=r.left+23*s;
      if(fy0<p.top-1||fy1>p.bottom+1||fx0<p.left-1||fx1>p.right+1)out.bad.push(`face outside crop ${Math.round(fy0-p.top)},${Math.round(p.bottom-fy1)}`);});return out;});
  chk(`${P.n} hero portraits keep their aspect with the face inside the crop`,P.n>=6&&P.bad.length===0||JSON.stringify(P));
  const T=await ev(()=>{const A=__A;A.V.modal=null;A.V.screen='title';A.render();const out=[];document.querySelectorAll('.lineup img').forEach(im=>{const r=im.getBoundingClientRect();if(r.width&&im.naturalWidth)out.push(Math.abs(r.height/r.width-im.naturalHeight/im.naturalWidth)<.03);});return out;});
  chk(`title lineup (${T.length}) is not squashed`,T.length>0&&T.every(Boolean)||JSON.stringify(T));
  await ev(()=>{const A=__A;A.ACT.cont&&A.ACT.cont();A.V.screen='world';A.V.modal=null;A.render();});await wait(300);
  // battle: unit boxes in logical px, the stage canvas at SPR.k, a frame draws, hit flashes keep HD
  await ev(()=>{const A=__A;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;});const foes=['gull','mossling','cavebat','frostwolf','drake'].slice(0,4).map(k=>A.makeEnemy(A.MON[k],5));A.startBattle({stage:0,kind:'field',weather:'clear',foes});});
  await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});await wait(300);
  const Bt=await ev(()=>{const A=__A,B=A.B,out={bad:[]};const cv=document.getElementById('bcv');out.cv=[cv.width,cv.height,cv._rw,cv._rh];
    B.front.forEach(u=>{const b=A.unitBox(u);if(!b)return;if(b.w!==36||b.h!==40+A.SPR.addH)out.bad.push(u.id+' box '+b.w+'x'+b.h);if(b.y-b.h<0)out.bad.push(u.id+' head above the stage '+(b.y-b.h));});
    B.en.forEach(u=>{const b=A.unitBox(u);if(b&&b.w!==A.MON_SIZE(u.art))out.bad.push(u.art+' box '+b.w);});
    A.battleFrame(performance.now());const w=A.whiteOf(A.spriteOf(B.front[0]),'t53');out.white=[w.width,w.height,w.hd];return out;});
  chk(`battle: hero boxes 36x${40+cfg.addH}, foe boxes MON_SIZE, heads on the stage, stage canvas ${Bt.cv} at SPR.k, flashes HD ${Bt.white}`,Bt.bad.length===0&&Bt.cv[2]===Bt.cv[0]*cfg.k&&Bt.white[2]===cfg.k||JSON.stringify(Bt));
  await ev(()=>{__A.finishBattle('x');__A.V.modal=null;});
  // legend heroes on horseback and with pets
  const Lg=await ev(()=>{const A=__A,o=[];Object.keys(A.TPL).forEach(id=>{const L=A.TPL[id].look;if(L&&(L.mount||L.pets)){const c=A.heroCanvas(id,false);o.push(id+':'+c.width+'x'+c.height+':'+c.hd);}});return o;});
  chk(`legend mounts and pets are HD (${Lg.join(', ')||'none'})`,Lg.every(s=>/:2$/.test(s))||Lg.join(','));
  chk('no console errors',cerr.length===0||cerr.slice(0,4).join(' | '));
  await done(H);
})();
