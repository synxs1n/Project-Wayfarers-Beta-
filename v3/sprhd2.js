// ===== Beta v0.5.3: HD sprites, the consumers (loads last) =====
// - The world and battle canvases render at SPR.k: their width/height still read and take logical sizes (ssCanvas), the context starts
//   every resize with a SPR.k transform, so all drawing code keeps its logical numbers and HD sprites land pixel for pixel.
// - Hit flashes (whiteOf), the mounted, pet and half size legend heroes are built as HD canvases too.
// - Portrait crops: hero sprites are SPR.addH rows taller with the head where it was, so crop windows keep their width and let the
//   height follow the picture (no squashing); a few unsized pictures get object-fit.
function ssCanvas(cv,k){if(!cv||cv._ss)return cv;const P=HTMLCanvasElement.prototype,dw=Object.getOwnPropertyDescriptor(P,'width'),dh=Object.getOwnPropertyDescriptor(P,'height');
  const w=dw.get.call(cv),h=dh.get.call(cv);cv._ss=k;cv.hd=k;
  const fix=c=>{try{const x=c.getContext('2d');if(x){x.setTransform(k,0,0,k,0,0);x.imageSmoothingEnabled=false;}}catch(e){}};
  Object.defineProperty(cv,'_rw',{get(){return dw.get.call(this);},configurable:true});Object.defineProperty(cv,'_rh',{get(){return dh.get.call(this);},configurable:true});
  Object.defineProperty(cv,'width',{get(){return dw.get.call(this)/k;},set(v){dw.set.call(this,Math.round(v*k));fix(this);},configurable:true});
  Object.defineProperty(cv,'height',{get(){return dh.get.call(this)/k;},set(v){dh.set.call(this,Math.round(v*k));fix(this);},configurable:true});
  dw.set.call(cv,w*k);dh.set.call(cv,h*k);fix(cv);return cv;}
if(SPRITE_HD){
  // hit flashes and target pulses keep the sprite's detail
  whiteOf=function(c,key,col){const k=key+(col||'');if(WHITE[k])return WHITE[k];const o=c.hd?hdCv(c.width,c.height,c.hd):mkCv(c.width,c.height),x=o.getContext('2d');
    x.drawImage(c,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col||'#ffffff';x.fillRect(0,0,c.width,c.height);return WHITE[k]=o;};
  // legend heroes: on horseback, with pets, and the Scourge shrunk to a hero's size
  mountCanvas=function(c){const o=hdCv(54,48),x=o.getContext('2d');drawHorse(x,2,22);x.drawImage(c,0,0,36,31,9,0,36,31);
    x.fillStyle='#0e0804';x.fillRect(19,27,14,3);x.fillStyle='#2a2638';x.fillRect(20,27,12,2);x.fillStyle='#f2d24a';x.fillRect(20,29,12,1);return o;};
  petCanvas=function(c){const dy=c.height-40,o=hdCv(46,c.height),x=o.getContext('2d');x.drawImage(c,8,0);
    const f=(col,a,b,w,h,t)=>{x.fillStyle=col;x.fillRect(a,b+(t?0:dy),w,h);};
    f('#0e0804',0,29,12,11);f('#6a6a7a',1,31,9,8);f('#4a4a58',1,36,9,3);f('#6a6a7a',7,27,5,5);f('#0e0804',7,26,2,2);f('#0e0804',10,26,2,2);f('#b48ae0',9,29,1,1);f('#1a1420',11,30,1,1);f('#6a6a7a',0,33,2,4);
    f('#0e0804',9,8,8,8,1);f('#5a4030',10,9,6,6,1);f('#3a2a20',10,12,6,3,1);f('#e8d8c0',12,10,3,2,1);f('#f2d24a',16,10,2,1,1);f('#0e0804',14,9,1,1,1);f('#2a1f18',9,10,2,5,1);
    return o;};
  halfCanvas=function(c){if(c.width<=44)return c;const o=hdCv(Math.ceil(c.width/2),Math.ceil(c.height/2)),x=o.getContext('2d');x.drawImage(c,0,0,o.width,o.height);return o;};
  // the world and battle canvases render at SPR.k
  {const ws0=worldSizeCanvas;worldSizeCanvas=function(){try{if(WS.cv&&!WS.cv._ss&&WS.ctx)ssCanvas(WS.cv,SPR.k);}catch(e){}return ws0.apply(this,arguments);};}
  {const lb0=layoutBattle;layoutBattle=function(){const r=lb0.apply(this,arguments);try{const cv=$('bcv');if(cv&&!cv._ss)ssCanvas(cv,SPR.k);}catch(e){}return r;};}
  {const bf0=battleFrame;battleFrame=function(now){try{const cv=$('bcv');if(cv&&!cv._ss)ssCanvas(cv,SPR.k);}catch(e){}return bf0.apply(this,arguments);};}
  // warm the sprite caches in idle time: the leader's walk frames, then every party hero's battle sprites (one sprite per idle slice)
  const WARM={q:[],busy:0,done:{}};
  const idle=f=>(window.requestIdleCallback?requestIdleCallback(f,{timeout:400}):setTimeout(f,40));
  const warmStep=()=>{WARM.busy=0;const t0=performance.now();while(WARM.q.length&&performance.now()-t0<6){try{WARM.q.shift()();}catch(e){}}if(WARM.q.length){WARM.busy=1;idle(warmStep);}};
  function sprWarm(){try{if(!G||!G.party||!G.party.length)return;const lid=leaderId(),t=TPL[lid],lk=heroLook(lid),key=lid+lookKey(lid);
    if(!WARM.done['w:'+key]){WARM.done['w:'+key]=1;[['side',0],['side',1],['front',0],['front',1],['front',2],['back',0],['back',1],['back',2]].forEach(([v,f])=>WARM.q.push(()=>walkerCanvas(key,lk,t.el,lid,v,f)));}
    G.party.forEach(id=>{const k='b:'+id+lookKey(id);if(WARM.done[k]||!TPL[id])return;WARM.done[k]=1;WARM.q.push(()=>spriteOf({side:'p',id},false));WARM.q.push(()=>spriteOf({side:'p',id},true));});
    if(WARM.q.length&&!WARM.busy){WARM.busy=1;idle(warmStep);}}catch(e){}}
  {const ws1=worldSizeCanvas;worldSizeCanvas=function(){const r=ws1.apply(this,arguments);sprWarm();return r;};}
  try{document.documentElement.classList.add('sprhd');const st=document.createElement('style');st.id='sprhd-css';
    st.textContent='html.sprhd .port:not(.mon) img,html.sprhd .lineup img,html.sprhd .oc img{height:auto!important}'+
      'html.sprhd img.himg,html.sprhd .bossv img,html.sprhd .tame img,html.sprhd .mimg,html.sprhd .lineup img{object-fit:contain}';
    document.head.appendChild(st);}catch(e){}
}
