// ===== title7.js (v0.7.1, v0.8.0): the title screen in the HD-2D look =====
// v0.8.0: six wayfarers on the road. The party (the HD hero sprites at their real 2x bitmap, integer scaled, nearest neighbour) walks
// to the right in a staggered file, a lead hero in front, each with a two frame walk cycle and a small bob, while the world scrolls by
// in parallax layers (sky, far ridges, mid layer, the road with its props, front grass). Every 8 to 12 s the scene travels on to another
// realm (fields by day, a misty forest at dawn, snow, the desert, volcanic lands by night, the coast at sunset, a town at dusk, the
// heights under the stars) with a cross fade; each realm has its own time of day, light (the heroes are lit with the realm's ambient,
// a key light rim on the side the light comes from and a sky rim on top) and sometimes weather (rain, snow, fog, sand, ash and embers).
// All six are always drawn whole, inside the scene, under the wordmark and never under the menu, at every window size: the scale is
// the largest whole scale at which the six fit the stage width and the space between the wordmark and the ground.
// Low graphics and reduced motion: one still frame (the party standing in the fields, Low at 1x without blur filters).
// No game RNG: the realm order comes from the clock, particles from a hash of their index and the time (the lineup still uses
// Math.random on the title screen as it always has). The canvas is #t7cv; tests read T7 (window.__A.T7).
const T7={key:'',fg:null,spr:{},lit:{},heroes:[],faces:[],drawn:[],frames:0,still:false,dpr:1,k:1,W:0,H:0,last:0,ids:null,prev:null,fadeT:0,next:0,logo:'',hlogo:'',
  realm:'',rN:0,ri:0,rp:-1,rT:0,rFade:0,order:null,bk:{},visit:0,wx:null,wxP:null,tt:0,lastT:0,
  cfg:{every:[8000,12000],fade:1800,speed:26,step:210,lineup:36000}};
const T7C={fps:30};
function t7Low(){try{return typeof GFX!=='undefined'&&GFX.tier==='low';}catch(e){return false;}}
function t7Still(){return t7Low()||(typeof reducedMotion==='function'&&reducedMotion());}
function t7Pool(){let o=[];try{o=titlePool();}catch(e){o=STARTERS.slice();}return o.filter(id=>TPL[id]&&!TPL[id].mon);}
function t7Pick(avoid){const pool=t7Pool().filter(id=>!(avoid||[]).includes(id)),src=pool.length>=6?pool:t7Pool(),ids=[];const p=src.slice();
  while(ids.length<6&&p.length)ids.push(p.splice(Math.floor(Math.random()*p.length),1)[0]);return ids;}
function t7Ids(){if(!T7.ids){let ids=[];try{ids=titleScene().ids.filter(id=>TPL[id]&&!TPL[id].mon);}catch(e){}if(ids.length<6)ids=ids.concat(t7Pick(ids)).slice(0,6);T7.ids=ids;}return T7.ids;}
function t7Rng(s){return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function t7H(i,k){let h=(i*374761393+k*668265263)>>>0;h=Math.imul(h^(h>>>13),1274126177)>>>0;return ((h^(h>>>16))>>>0)/4294967296;}
function t7Cv(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
const t7Rgb=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a==null?1:a})`;
// ----- sprites: the HD bitmap (72x92 for a 36x46 hero), standing and walking -----
function t7Sprite(id){const k=id+(typeof lookKey==='function'?lookKey(id):'');if(T7.spr[k])return T7.spr[k];
  const DI=CanvasRenderingContext2D.prototype._hdDI||CanvasRenderingContext2D.prototype.drawImage;
  const grab=walk=>{const c=heroCanvas(id,walk),rw=c._rw||c.width,rh=c._rh||c.height,b=t7Cv(rw,rh);DI.call(b.getContext('2d'),c,0,0,rw,rh,0,0,rw,rh);return {b,c,rw,rh};};// the real bitmap, unscaled
  const s0=grab(false);let s1=null;try{s1=grab(true);if(s1.rw!==s0.rw||s1.rh!==s0.rh)s1=null;}catch(e){s1=null;}
  const rw=s0.rw,rh=s0.rh,d=s0.b.getContext('2d').getImageData(0,0,rw,rh).data;let x0=rw,x1=0,y0=rh,y1=0;for(let y=0;y<rh;y++)for(let i=0;i<rw;i++)if(d[(y*rw+i)*4+3]>40){if(i<x0)x0=i;if(i>x1)x1=i;if(y<y0)y0=y;if(y>y1)y1=y;}
  return T7.spr[k]={id,c:s0.b,cw:s1?s1.b:s0.b,rw,rh,lw:s0.c.width,lh:s0.c.height,box:{x0,x1,y0,y1}};}
// lit copy for a realm's light: amb (multiplier), key (rim colour) from side kd (+1: light from the right), sky (top rim colour)
function t7Lit(s,R){const key=s.id+':'+s.rw+':'+R.n;if(T7.lit[key])return T7.lit[key];const L=R.lit,out=[];
  for(const src of s.cw===s.c?[s.c]:[s.c,s.cw]){const {rw,rh}=s,o=t7Cv(rw,rh),x=o.getContext('2d');x.drawImage(src,0,0);const im=x.getImageData(0,0,rw,rh),d=im.data,al=new Uint8Array(rw*rh);
    for(let i=0;i<rw*rh;i++)al[i]=d[i*4+3];const a=(i,y)=>i<0||y<0||i>=rw||y>=rh?0:al[y*rw+i];const {y0,y1}=s.box,hh=Math.max(1,y1-y0),kd=L.kd;
    for(let y=0;y<rh;y++)for(let i=0;i<rw;i++){const p=(y*rw+i)*4;if(al[y*rw+i]<40)continue;const vf=.6+.4*Math.max(0,Math.min(1,(y-y0)/hh)),lf=Math.max(0,Math.min(1,((i/rw-.5)*kd)*1.4+.5))*L.side;
      let r=d[p],g=d[p+1],b=d[p+2];const l=r*.3+g*.59+b*.11;r=r*.9+l*.1;g=g*.9+l*.1;b=b*.9+l*.1;
      r=r*(L.amb[0]*(1-.12*(1-vf))+lf*L.key[0]/255*.5);g=g*(L.amb[1]*(1-.12*(1-vf))+lf*L.key[1]/255*.5);b=b*(L.amb[2]*(1-.12*(1-vf))+lf*L.key[2]/255*.5);
      const e1=a(i+kd,y)<40,e2=!e1&&a(i+kd*2,y)<40,up=a(i,y-1)<40;
      if(e1||e2){const k=(e1?1:.45)*L.rim;r+=(L.key[0]-r)*k;g+=(L.key[1]-g)*k;b+=(L.key[2]-b)*k;}else if(up){r+=(L.sky[0]-r)*.35;g+=(L.sky[1]-g)*.35;b+=(L.sky[2]-b)*.35;}
      d[p]=Math.min(255,r);d[p+1]=Math.min(255,g);d[p+2]=Math.min(255,b);}
    x.putImageData(im,0,0);out.push(o);}
  if(out.length<2)out.push(out[0]);return T7.lit[key]=out;}
// ----- the realms: sky, sun or moon, far ridges, a mid layer, the ground and its props, front grass, light and weather -----
// sky: gradient stops; sun: [x, y (shares), radius (share of H), colour, glow]; far/mid: colours; g: ground [near the horizon, near the
// viewer], road: colour; lit: the heroes' light; wx: weather choices for a visit (null = clear); haze: horizon haze colour
const T7R=[
  {n:'fields',sky:[[0,'#3f7fd0'],[.55,'#8cc4ee'],[1,'#e8f2e6']],sun:[.84,.62,.045,'#fff6d8',.6],cloud:'#ffffff',far:['#7fa6c0','#9cc0cc'],mid:'#4f8a3e',midK:'hills',g:['#6aa64a','#3d6e2c'],road:'#b49a6a',prop:'meadow',haze:[230,240,235],
    lit:{amb:[1.02,1,.96],key:[255,240,200],kd:1,side:.5,rim:.55,sky:[200,225,255]},wx:[null,null,'rain'],night:0},
  {n:'forest',sky:[[0,'#5a5f8e'],[.5,'#c69aa8'],[1,'#f3d6b0']],sun:[.18,.5,.04,'#fff0c8',.6],cloud:'#f6d8d0',far:['#6d7a92','#8a92a8'],mid:'#2d4a3a',midK:'pines',g:['#4f6e44','#25382a'],road:'#8a7458',prop:'forest',haze:[236,214,206],
    lit:{amb:[.9,.88,.9],key:[255,214,170],kd:-1,side:.45,rim:.5,sky:[220,200,230]},wx:['fog','fog',null],night:0},
  {n:'snow',sky:[[0,'#6d7c98'],[.6,'#b9c6d8'],[1,'#e6ecf4']],sun:null,cloud:'#eef2f8',far:['#c8d2e2','#e8eef6'],mid:'#3c4e5e',midK:'snowpines',g:['#e4ecf4','#b4c2d4'],road:'#a8b4c4',prop:'snow',haze:[236,240,248],
    lit:{amb:[.95,.98,1.06],key:[230,240,255],kd:1,side:.3,rim:.4,sky:[240,248,255]},wx:['snow','snow',null],night:0},
  {n:'desert',sky:[[0,'#3a78c0'],[.5,'#9cc6e0'],[1,'#f6dcae']],sun:[.72,.58,.05,'#fffbe8',.75],cloud:null,far:['#c88e62','#e0ae7e'],mid:'#d49a5a',midK:'dunes',g:['#e8c08a','#c8955a'],road:'#d8ad78',prop:'desert',haze:[250,226,190],
    lit:{amb:[1.06,1,.9],key:[255,236,190],kd:1,side:.6,rim:.6,sky:[230,236,255]},wx:['sand',null],night:0},
  {n:'volcanic',sky:[[0,'#120814'],[.5,'#3a1220'],[1,'#a03a1e']],sun:null,stars:30,cloud:'#40202a',far:['#2a1418','#40181a'],mid:'#1a1014',midK:'crags',g:['#3a2a2c','#161012'],road:'#4a3430',prop:'lava',haze:[200,80,40],
    lit:{amb:[.72,.6,.62],key:[255,140,70],kd:1,side:.7,rim:.8,sky:[170,90,110]},wx:['ash'],night:1},
  {n:'coast',sky:[[0,'#3b3f86'],[.45,'#c86a7a'],[.8,'#f4a45c'],[1,'#ffd890']],sun:[.3,.86,.07,'#fff0b0',.9],cloud:'#f2a090',far:['#6a4a78','#8a5a80'],mid:'#3a3048',midK:'sea',g:['#d8b080','#8a6a54'],road:'#e8c898',prop:'coast',haze:[255,190,140],
    lit:{amb:[.96,.86,.84],key:[255,180,110],kd:-1,side:.65,rim:.75,sky:[200,170,230]},wx:[null,null,'rain'],night:0},
  {n:'town',sky:[[0,'#1a1840'],[.45,'#4e3062'],[.8,'#c0605a'],[1,'#f09a5a']],sun:null,moon:[.84,.18],stars:40,cloud:'#5a3a5a',far:['#3a2a4c','#2c2040'],mid:'#22182e',midK:'town',g:['#4a3a46','#1e1824'],road:'#6a5658',prop:'town',haze:[240,150,100],
    lit:{amb:[.8,.72,.82],key:[255,190,120],kd:1,side:.55,rim:.7,sky:[150,160,240]},wx:[null,null,'rain'],night:.6},
  {n:'heights',sky:[[0,'#060a1e'],[.55,'#14204a'],[1,'#34507a']],sun:null,moon:[.2,.16],stars:110,aurora:1,cloud:null,far:['#1c2a48','#2a3c5e'],mid:'#121a2c',midK:'peaks',g:['#3a4a52','#161c24'],road:'#4a5458',prop:'heights',haze:[90,130,170],
    lit:{amb:[.62,.7,.9],key:[170,230,220],kd:-1,side:.4,rim:.6,sky:[140,170,255]},wx:[null],night:1}];
// periodic shapes over one strip width P, so every layer tiles seamlessly as it scrolls
function t7Ridge(x,P,y0,amp,seed,top,cyc){x.beginPath();x.moveTo(0,top);const n=Math.max(24,Math.round(P/6));const f=cyc||[2,5,11];
  for(let i=0;i<=n;i++){const u=i/n,X=u*P;let v=0;for(let j=0;j<f.length;j++)v+=Math.sin(u*Math.PI*2*f[j]+seed*(j+1.7))/(j+1);x.lineTo(X,y0-amp*(.5+.38*v));}x.lineTo(P,top);x.closePath();}
function t7Pine(x,px,py,h,col,snow){x.fillStyle=col;for(let j=0;j<4;j++){const w=h*(.34-j*.06),yy=py-h*j*.22;x.beginPath();x.moveTo(px-w,yy);x.lineTo(px,yy-h*.42);x.lineTo(px+w,yy);x.fill();
    if(snow){x.fillStyle='rgba(240,246,255,.85)';x.beginPath();x.moveTo(px-w*.5,yy-h*.21);x.lineTo(px,yy-h*.42);x.lineTo(px+w*.5,yy-h*.21);x.fill();x.fillStyle=col;}}x.fillRect(px-h*.03,py,h*.06,h*.08);}
function t7Wrap(P,x,fn){fn(x);if(x<P*.25)fn(x+P);if(x>P*.75)fn(x-P);}
// bake one realm at this stage size: the sky (fixed), far, mid, ground and front strips (one stage width each, tiling)
function t7Bake(R,W,H,dpr){const low=t7Low(),hy=T7.hy,gy=T7.gy,P=W,u=Math.max(1,H/200),seed=R.n.length*7.3;// blur a tiling strip without soft ends: blur three copies side by side and keep the middle one (a blurred lone tile fades out at
  // its ends, which showed as a light seam where two tiles met)
  const blur=(c,px)=>{if(low||!('filter' in CanvasRenderingContext2D.prototype))return c;const w=c.width,t=t7Cv(w*3,c.height),tx=t.getContext('2d');for(let i=0;i<3;i++)tx.drawImage(c,w*i,0);
    const o=t7Cv(w,c.height),q=o.getContext('2d');q.filter=`blur(${px.toFixed(1)}px)`;q.drawImage(t,-w,0);return o;};
  const out={n:R.n};
  // sky: gradient, stars, sun or moon with a glow, the aurora
  {const c=t7Cv(W,hy+H*.06),x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,hy+H*.06);R.sky.forEach(s=>g.addColorStop(s[0],s[1]));x.fillStyle=g;x.fillRect(0,0,W,c.height);
    if(R.stars){const r=t7Rng(31+seed|0);for(let i=0;i<R.stars;i++){const sx=r()*W,sy=r()*hy*.7,a=(1-sy/(hy*.7))*.75*r()+.15,z=(r()<.12?2:1)*dpr;x.fillStyle=`rgba(255,246,226,${a.toFixed(2)})`;x.fillRect(Math.round(sx),Math.round(sy),z,z);}}
    if(R.aurora){x.globalCompositeOperation='lighter';for(let L=0;L<3;L++){const col=[[90,255,170],[130,120,255],[90,220,255]][L];for(let X=0;X<W;X+=2*dpr){const y=hy*(.12+L*.07)+Math.sin(X/W*7+L*2)*hy*.06,h=hy*(.22+.08*Math.sin(X/W*13+L));
      const gg=x.createLinearGradient(0,y,0,y+h);gg.addColorStop(0,t7Rgb(col,0));gg.addColorStop(.3,t7Rgb(col,.16*(.6+.4*Math.sin(X/W*9+L))));gg.addColorStop(1,t7Rgb(col,0));x.fillStyle=gg;x.fillRect(X,y,2*dpr,h);}}x.globalCompositeOperation='source-over';}
    const S=R.sun;if(S){const sx=S[0]*W,sy=Math.min(S[1]*hy,hy),r=Math.max(6,S[2]*H),gl=x.createRadialGradient(sx,sy,r*.5,sx,sy,r*6);gl.addColorStop(0,t7Rgb([255,244,214],S[4]*.55));gl.addColorStop(1,t7Rgb([255,244,214],0));x.fillStyle=gl;x.fillRect(sx-r*6,sy-r*6,r*12,r*12);
      x.fillStyle=S[3];x.beginPath();x.arc(sx,sy,r,0,7);x.fill();}
    if(R.moon){const mr=Math.max(6,H*.03),mx=R.moon[0]*W,my=Math.max(R.moon[1]*hy,(T7.logoB||0)+mr*2);if(my<hy-mr*2){const gl=x.createRadialGradient(mx,my,mr*.5,mx,my,mr*4);gl.addColorStop(0,'rgba(255,240,210,.22)');gl.addColorStop(1,'rgba(255,240,210,0)');x.fillStyle=gl;x.fillRect(mx-mr*4,my-mr*4,mr*8,mr*8);
      const mc=t7Cv(mr*2+4,mr*2+4),mx2=mc.getContext('2d');mx2.fillStyle='#f6ecd2';mx2.beginPath();mx2.arc(mr+2,mr+2,mr,0,7);mx2.fill();mx2.globalCompositeOperation='destination-out';mx2.beginPath();mx2.arc(mr+2+mr*.42,mr+2-mr*.2,mr*.9,0,7);mx2.fill();
      x.drawImage(mc,mx-mr-2,my-mr-2);}}// a crescent (the bite cut from its own small canvas, so the sky shows through it)
    // horizon haze
    const hz=x.createLinearGradient(0,hy-H*.2,0,c.height);hz.addColorStop(0,t7Rgb(R.haze,0));hz.addColorStop(1,t7Rgb(R.haze,.42));x.fillStyle=hz;x.fillRect(0,hy-H*.2,W,c.height);
    out.sky=c;}
  // far strip: soft clouds (their own slow layer), two ridges (blurred: depth of field)
  {const top=Math.round(hy-H*.34),h=Math.round(hy+H*.05-top),c=t7Cv(P,h),x=c.getContext('2d');x.translate(0,-top);
    if(R.cloud){const r=t7Rng(77+seed|0);for(let i=0;i<7;i++){const cx=r()*P,cy=top+h*(.08+r()*.32),cw=W*(.08+r()*.1),ch=cw*.22;for(let j=0;j<5;j++){const ox=(j-2)*cw*.32,oy=Math.sin(j*1.3)*ch*.3;t7Wrap(P,cx+ox,X=>{const g=x.createRadialGradient(X,cy+oy,0,X,cy+oy,cw*.4);g.addColorStop(0,t7Rgb(t7Hex(R.cloud),.28));g.addColorStop(1,t7Rgb(t7Hex(R.cloud),0));x.fillStyle=g;x.fillRect(X-cw*.4,cy+oy-cw*.4,cw*.8,cw*.8);});}}}
    if(R.midK==='peaks'||R.midK==='snowpines'||R.n==='volcanic'){x.fillStyle=R.far[0];t7Ridge(x,P,hy-H*.06,H*.26,seed,hy+H*.06,[1,3,7]);x.fill();
      if(R.midK==='snowpines'){x.save();x.clip();x.fillStyle='rgba(240,246,255,.55)';x.fillRect(0,top,P,hy-H*.22-top);x.restore();}}
    else{x.fillStyle=R.far[0];t7Ridge(x,P,hy-H*.03,H*.12,seed,hy+H*.06,[1,3,8]);x.fill();}
    if(R.n==='volcanic'){// the volcano with a glowing crater and its smoke column
      const vx=P*.62,vy=hy-H*.3;x.fillStyle='#2c1418';x.beginPath();x.moveTo(vx-W*.28,hy+H*.04);x.lineTo(vx-W*.035,vy);x.lineTo(vx+W*.035,vy);x.lineTo(vx+W*.3,hy+H*.04);x.fill();
      const g=x.createRadialGradient(vx,vy,0,vx,vy,W*.08);g.addColorStop(0,'rgba(255,140,50,.85)');g.addColorStop(1,'rgba(255,80,30,0)');x.fillStyle=g;x.fillRect(vx-W*.08,vy-W*.08,W*.16,W*.16);
      x.fillStyle='rgba(255,120,40,.8)';for(let i=0;i<5;i++){x.beginPath();x.moveTo(vx-W*.01+i*W*.005,vy+2);x.lineTo(vx-W*.05-i*W*.03,hy-H*.04+i*H*.01);x.lineTo(vx-W*.045-i*W*.03,hy-H*.04+i*H*.01);x.fill();}}
    x.fillStyle=R.far[1];t7Ridge(x,P,hy+H*.005,H*.07,seed+2,hy+H*.06,[2,5,9]);x.fill();
    const hz=x.createLinearGradient(0,hy-H*.12,0,hy+H*.05);hz.addColorStop(0,t7Rgb(R.haze,0));hz.addColorStop(1,t7Rgb(R.haze,.3));x.fillStyle=hz;x.globalCompositeOperation='source-atop';x.fillRect(0,hy-H*.12,P,H*.17);x.globalCompositeOperation='source-over';
    out.far={c:blur(c,1.4*dpr),y:top};}
  // mid strip: the realm's own layer
  {const top=Math.round(hy-H*.26),h=Math.round(hy+H*.06-top),c=t7Cv(P,h),x=c.getContext('2d'),r=t7Rng(131+seed|0),base=hy+H*.03;x.translate(0,-top);const M=R.midK;
    if(M==='hills'){x.fillStyle=R.mid;t7Ridge(x,P,hy+H*.02,H*.06,seed+4,hy+H*.06,[3,7]);x.fill();for(let i=0;i<10;i++){const px=(i+r()*.6)/10*P,py=hy+H*(.0+r()*.02),s=H*(.03+r()*.02);t7Wrap(P,px,X=>{x.fillStyle='#3a6a2e';x.beginPath();x.arc(X,py-s,s,0,7);x.fill();x.fillStyle='#4e3a2a';x.fillRect(X-s*.12,py-s*.2,s*.24,s*.5);});}}
    else if(M==='pines'||M==='snowpines'){for(let i=0;i<22;i++){const px=(i+r()*.8)/22*P,ph=H*(.12+r()*.1),py=base+r()*H*.02;t7Wrap(P,px,X=>t7Pine(x,X,py,ph,R.mid,M==='snowpines'));}
      if(M==='snowpines'){x.fillStyle='#dfe8f2';t7Ridge(x,P,base+H*.01,H*.015,seed+5,hy+H*.06,[4,9]);x.fill();}}
    else if(M==='dunes'){x.fillStyle=R.mid;t7Ridge(x,P,hy+H*.02,H*.08,seed+4,hy+H*.06,[2,5]);x.fill();x.fillStyle='rgba(255,236,200,.35)';t7Ridge(x,P,hy+H*.015,H*.06,seed+4.3,hy+H*.06,[2,5]);x.fill();
      for(let i=0;i<3;i++){const px=(i+.3+r()*.4)/3*P,w=W*(.04+r()*.03),h2=H*(.06+r()*.04),sl=w*.45;t7Wrap(P,px,X=>{x.fillStyle='#b8834e';x.beginPath();x.moveTo(X-w-sl,hy+H*.02);x.lineTo(X-w,hy-h2+H*.01);x.lineTo(X-w*.6,hy-h2);x.lineTo(X+w*.7,hy-h2);x.lineTo(X+w,hy-h2+H*.012);x.lineTo(X+w+sl*1.3,hy+H*.02);x.fill();
        x.fillStyle='rgba(120,70,40,.35)';x.beginPath();x.moveTo(X+w*.1,hy-h2);x.lineTo(X+w*.7,hy-h2);x.lineTo(X+w,hy-h2+H*.012);x.lineTo(X+w+sl*1.3,hy+H*.02);x.lineTo(X+w*.3,hy+H*.02);x.fill();});}}// mesas, sunlit on the left
    else if(M==='crags'){x.fillStyle=R.mid;for(let i=0;i<14;i++){const px=(i+r()*.7)/14*P,w=W*(.02+r()*.03),h2=H*(.04+r()*.1);t7Wrap(P,px,X=>{x.beginPath();x.moveTo(X-w,base+H*.02);x.lineTo(X-w*.2,base-h2);x.lineTo(X+w*.3,base-h2*.7);x.lineTo(X+w,base+H*.02);x.fill();});}
      x.strokeStyle='rgba(255,110,40,.75)';x.lineWidth=Math.max(1,u*.8);for(let i=0;i<6;i++){const px=r()*P;t7Wrap(P,px,X=>{x.beginPath();x.moveTo(X,base+H*.02);x.lineTo(X+W*.01,base-H*.03);x.lineTo(X-W*.005,base-H*.05);x.stroke();});}}
    else if(M==='sea'){const g=x.createLinearGradient(0,hy-H*.01,0,hy+H*.06);g.addColorStop(0,'#c87a8a');g.addColorStop(1,'#4a3a6a');x.fillStyle=g;x.fillRect(0,hy-H*.01,P,H*.07);
      x.fillStyle='rgba(255,220,150,.7)';for(let i=0;i<40;i++){const px=r()*P,py=hy+r()*H*.05,w=W*(.006+r()*.02);x.fillRect(px,py,w,Math.max(1,dpr));}
      x.fillStyle=R.mid;for(let i=0;i<2;i++){const px=(i+.25)/2*P;t7Wrap(P,px,X=>{x.beginPath();x.moveTo(X-W*.12,hy+H*.06);x.lineTo(X-W*.08,hy-H*.08);x.lineTo(X+W*.02,hy-H*.1);x.lineTo(X+W*.07,hy+H*.06);x.fill();});}}
    else if(M==='town'){const tr=t7Rng(41),win=[];x.fillStyle=R.mid;const ty=hy+H*.02;
      for(let s=0;s<2;s++){const tx0=(s*.5+.04)*P,tx1=tx0+P*.38;x.fillRect(tx0,ty-u*7,tx1-tx0,u*9);for(let i=tx0;i<tx1;i+=u*4)x.fillRect(i,ty-u*9,u*2,u*2);
        for(let i=0;i<7;i++){const hx=tx0+u*2+(tx1-tx0-u*10)*(i/6)+tr()*u*2,hw=u*(5+tr()*3),hh=u*(6+tr()*6),by=ty-u*7;x.fillRect(hx,by-hh,hw,hh);x.beginPath();x.moveTo(hx-u*.6,by-hh);x.lineTo(hx+hw/2,by-hh-u*(3+tr()*2));x.lineTo(hx+hw+u*.6,by-hh);x.fill();
          if(tr()<.85)win.push([hx+hw*.3,by-hh*.6]);if(tr()<.5)win.push([hx+hw*.65,by-hh*.35]);}
        const kx=tx0+(tx1-tx0)*.6,kw=u*7,kh=u*20,by=ty-u*7;x.fillRect(kx,by-kh,kw,kh);x.beginPath();x.moveTo(kx-u,by-kh);x.lineTo(kx+kw/2,by-kh-u*9);x.lineTo(kx+kw+u,by-kh);x.fill();win.push([kx+kw*.45,by-kh*.7]);}
      x.fillStyle='#ffcf78';win.forEach(([a,b])=>x.fillRect(a,b,u*1.1,u*1.3));x.globalCompositeOperation='lighter';win.forEach(([a,b])=>{const g=x.createRadialGradient(a,b,0,a,b,u*4);g.addColorStop(0,'rgba(255,190,90,.4)');g.addColorStop(1,'rgba(255,190,90,0)');x.fillStyle=g;x.fillRect(a-u*4,b-u*4,u*8,u*8);});x.globalCompositeOperation='source-over';}
    else if(M==='peaks'){x.fillStyle=R.mid;t7Ridge(x,P,hy+H*.02,H*.1,seed+6,hy+H*.06,[3,6,13]);x.fill();}
    out.mid={c:blur(c,.7*dpr),y:top};}
  // ground strip: the ground, the road the party walks, props by the road
  {const top=Math.round(hy+H*.02),h=H-top,c=t7Cv(P,h),x=c.getContext('2d'),r=t7Rng(211+seed|0);x.translate(0,-top);
    const g=x.createLinearGradient(0,top,0,H);g.addColorStop(0,R.g[0]);g.addColorStop(1,R.g[1]);x.fillStyle=g;x.fillRect(0,top,P,h);
    const ry0=gy-H*.035,ry1=gy+H*.03;{const rg=x.createLinearGradient(0,ry0,0,ry1);rg.addColorStop(0,t7Rgb(t7Hex(R.road),0));rg.addColorStop(.2,t7Rgb(t7Hex(R.road),.85));rg.addColorStop(.8,t7Rgb(t7Hex(R.road),.85));rg.addColorStop(1,t7Rgb(t7Hex(R.road),0));x.fillStyle=rg;x.fillRect(0,ry0,P,ry1-ry0);}
    x.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<60;i++){const px=r()*P,py=ry0+(ry1-ry0)*r(),w=u*(.6+r()*1.6);x.fillRect(px,py,w,w*.5);}
    for(let i=0;i<Math.round(P/(3*dpr));i++){const px=r()*P,py=top+r()*(h),d=(py-top)/h;if(py>ry0-u&&py<ry1)continue;x.fillStyle=`rgba(0,0,0,${(.08+.1*d).toFixed(2)})`;x.fillRect(px,py,Math.max(1,u*(.5+d)),Math.max(1,u*(1+2*d)));}
    const PR=R.prop,n=PR==='town'?6:9;for(let i=0;i<n;i++){const px=(i+r()*.7)/n*P,far=r()<.55,py=far?ry0-H*(.01+r()*.06):ry1+H*(.045+r()*.05),s=H*(far?.045:.07)*(.8+r()*.4);
      t7Wrap(P,px,X=>t7Prop(x,PR,X,py,s,r,u));}
    out.gr={c,y:top};}
  // front grass: dark soft tufts at the bottom edge (near depth of field), its own faster layer
  {const top=Math.round(H*.88),h=H-top,c=t7Cv(P,h),x=c.getContext('2d'),r=t7Rng(97+seed|0);x.translate(0,-top);x.fillStyle=R.night?'#06070c':t7Rgb(t7Hex(R.g[1]).map(v=>v*.45|0));
    if(R.prop!=='desert'&&R.prop!=='lava'&&R.prop!=='coast'){for(let i=0;i<P/(5*dpr);i++){const px=r()*P,ph=H*(.02+r()*.05),py=H+2;t7Wrap(P,px,X=>{x.beginPath();x.moveTo(X-ph*.12,py);x.quadraticCurveTo(X+ph*.1,py-ph*.6,X+ph*(r()-.5)*.8,py-ph);x.quadraticCurveTo(X+ph*.05,py-ph*.5,X+ph*.14,py);x.fill();});}}
    else{for(let i=0;i<12;i++){const px=r()*P,s=H*(.02+r()*.03);t7Wrap(P,px,X=>{x.beginPath();x.ellipse(X,H,s*1.6,s,0,0,7);x.fill();});}}
    out.fr={c:blur(c,1.6*dpr),y:top};}
  return out;}
function t7Hex(h){if(h[0]!=='#')return [128,128,128];const v=parseInt(h.slice(1),16);return [v>>16&255,v>>8&255,v&255];}
function t7Prop(x,K,X,py,s,r,u){
  if(K==='meadow'){if(r()<.5){x.fillStyle='#2e5a26';x.beginPath();x.ellipse(X,py-s*.35,s*.6,s*.4,0,0,7);x.fill();x.fillStyle='#e8d070';x.fillRect(X-s*.2,py-s*.5,u,u);x.fillStyle='#f0a0c0';x.fillRect(X+s*.15,py-s*.4,u,u);}
    else{x.fillStyle='#6a4a30';x.fillRect(X-s*.6,py-s*.5,s*1.2,s*.12);x.fillRect(X-s*.6,py-s*.25,s*1.2,s*.12);x.fillRect(X-s*.55,py-s*.65,s*.12,s*.65);x.fillRect(X+s*.45,py-s*.65,s*.12,s*.65);}}
  else if(K==='forest'){if(r()<.6)t7Pine(x,X,py,s*2.2,'#1e3428');else{x.fillStyle='#4a5048';x.beginPath();x.ellipse(X,py-s*.2,s*.5,s*.3,0,0,7);x.fill();x.fillStyle='#c84a3a';x.beginPath();x.arc(X+s*.6,py-s*.25,s*.15,Math.PI,0);x.fill();}}
  else if(K==='snow'){if(r()<.6)t7Pine(x,X,py,s*2,'#2a3c4a',true);else{x.fillStyle='#f4f8ff';x.beginPath();x.ellipse(X,py-s*.15,s*.7,s*.3,0,0,7);x.fill();}}
  else if(K==='desert'){if(r()<.5){x.fillStyle='#4a7a3a';x.fillRect(X-s*.1,py-s*1.1,s*.2,s*1.1);x.fillRect(X-s*.4,py-s*.8,s*.12,s*.4);x.fillRect(X-s*.4,py-s*.5,s*.3,s*.1);x.fillRect(X+s*.28,py-s*.9,s*.12,s*.45);x.fillRect(X+s*.1,py-s*.55,s*.3,s*.1);}
    else{x.fillStyle='#a87a50';x.beginPath();x.ellipse(X,py-s*.2,s*.55,s*.28,0,0,7);x.fill();x.fillStyle='#d8b080';x.beginPath();x.ellipse(X-s*.1,py-s*.3,s*.3,s*.12,0,0,7);x.fill();}}
  else if(K==='lava'){x.fillStyle='#120c0e';x.beginPath();x.moveTo(X-s*.6,py);x.lineTo(X-s*.2,py-s*.8);x.lineTo(X+s*.3,py-s*.6);x.lineTo(X+s*.6,py);x.fill();x.fillStyle='rgba(255,110,40,.8)';x.fillRect(X-s*.7,py+u,s*1.4,Math.max(1,u*.8));
    const g=x.createRadialGradient(X,py+u,0,X,py+u,s);g.addColorStop(0,'rgba(255,120,40,.35)');g.addColorStop(1,'rgba(255,120,40,0)');x.fillStyle=g;x.fillRect(X-s,py-s,s*2,s*2);}
  else if(K==='coast'){if(r()<.5){x.strokeStyle='#5a3a2a';x.lineWidth=s*.12;x.beginPath();x.moveTo(X,py);x.quadraticCurveTo(X+s*.2,py-s,X+s*.1,py-s*1.6);x.stroke();x.fillStyle='#2e5a3a';for(let j=0;j<5;j++){const a=-Math.PI/2+(j-2)*.7;x.beginPath();x.ellipse(X+s*.1+Math.cos(a)*s*.4,py-s*1.6+Math.sin(a)*s*.25+s*.15,s*.45,s*.1,a,0,7);x.fill();}}
    else{x.fillStyle='#8a7a6a';x.beginPath();x.ellipse(X,py-s*.15,s*.5,s*.25,0,0,7);x.fill();x.fillStyle='#f4e8d0';x.fillRect(X+s*.5,py-s*.1,u*1.5,u);}}
  else if(K==='town'){x.fillStyle='#2a2028';x.fillRect(X-s*.05,py-s*1.5,s*.1,s*1.5);x.fillRect(X-s*.18,py-s*1.6,s*.36,s*.2);x.fillStyle='#ffd27a';x.fillRect(X-s*.12,py-s*1.45,s*.24,s*.22);
    x.globalCompositeOperation='lighter';const g=x.createRadialGradient(X,py-s*1.34,0,X,py-s*1.34,s*1.1);g.addColorStop(0,'rgba(255,190,100,.45)');g.addColorStop(1,'rgba(255,190,100,0)');x.fillStyle=g;x.fillRect(X-s*1.1,py-s*2.44,s*2.2,s*2.2);x.globalCompositeOperation='source-over';
    x.fillStyle='rgba(255,190,100,.18)';x.beginPath();x.ellipse(X,py,s*.8,s*.18,0,0,7);x.fill();}
  else if(K==='heights'){x.fillStyle='#2a343c';x.beginPath();x.moveTo(X-s*.7,py);x.lineTo(X-s*.3,py-s*.7);x.lineTo(X+s*.2,py-s*.55);x.lineTo(X+s*.7,py);x.fill();x.fillStyle='rgba(180,220,255,.25)';x.fillRect(X-s*.3,py-s*.7,s*.4,u);}}
// ----- layout: one whole scale at which all six heroes fit the width and the height between the wordmark and the ground -----
function t7Layout(W,H,dpr){const ids=t7Ids(),S=ids.map(id=>t7Sprite(id));T7.hy=Math.round(H*.6);T7.gy=Math.round(H*.875);
  const bws=S.map(s=>s.box.x1-s.box.x0+1),bh=Math.max(...S.map(s=>s.box.y1-s.box.y0+1)),gapU=7,span=bws.reduce((a,b)=>a+b,0)+gapU*5;
  const top=Math.max((T7.logoB||0)+4*dpr,H*.06),kW=(W*.94)/span,kH=(T7.gy-top)/(bh+3),kA=Math.max(1,Math.round(H*.3/bh));
  let k=Math.floor(Math.min(kW,kH,kA));if(k<1)k=Math.min(kW,kH);// a stage too small for 1x: the one case drawn below a whole scale
  T7.k=k;const tot=span*k,x0=Math.round(Math.max(W*.03,(W-tot)/2+W*.03*(W>tot*1.25?1:0)));let x=x0;const hs=[];
  // walking right: the lead hero is the rightmost; back and front rows alternate (a staggered file), the back row a little higher and smaller in light
  S.forEach((s,i)=>{const bw=bws[i],h={id:ids[i],s,i,row:i%2,ph:i*1.7,bph:t7H(i,7)*6};h.cx=x+((bw/2))*k;h.y=T7.gy-(h.row?Math.round(4*k):0);h.x0=x;x+=(bw+gapU)*k;hs.push(h);});
  hs.reverse();hs.forEach((h,j)=>h.lead=j===0);hs.sort((a,b)=>a.y-b.y||a.i-b.i);T7.heroes=hs;}
// ----- the realm cycle (clock seeded order, no game RNG) -----
function t7Order(){if(!T7.order){const s=(Date.now()/1000|0)%997,o=T7R.map((r,i)=>i);for(let i=o.length-1;i>0;i--){const j=Math.floor(t7H(s,i)*(i+1));[o[i],o[j]]=[o[j],o[i]];}
  const f=o.indexOf(0);if(f>0)[o[0],o[f]]=[o[f],o[0]];T7.order=o;}return T7.order;}// the journey starts in the fields
function t7Realm(i){return T7R[t7Order()[((i%T7R.length)+T7R.length)%T7R.length]];}
function t7Baked(R){const key=R.n+':'+T7.W+'x'+T7.H+':'+t7Low();let b=T7.bk[key];if(!b){const t0=performance.now();b=T7.bk[key]=t7Bake(R,T7.W,T7.H,T7.dpr);T7.bakeMs=Math.round(performance.now()-t0);T7.bkF=(T7.bkF||0)+performance.now()-t0;T7.bakes=(T7.bakes||0)+1;
  const ks=Object.keys(T7.bk);if(ks.length>3)delete T7.bk[ks[0]];}return b;}
function t7WxFor(R,visit){const w=R.wx||[null];return w[Math.floor(t7H(visit,13)*w.length)]||null;}
// ----- weather on the title: own hash of the particle index and the time, drifting with the travel -----
function t7Wx(x,w,a,t,W,H,trav,R){if(!w||a<.01)return;const dpr=T7.dpr,s=Math.max(1,T7.k);x.save();
  if(w==='snow'){x.fillStyle='#f4f8ff';for(let i=0;i<70;i++){const z=.5+t7H(i,1),X=((t7H(i,2)*W-trav*.6*z-t*8*z+Math.sin(t*.9+i)*6*dpr)%W+W)%W,Y=((t7H(i,3)*H+t*(18+22*z)*dpr)%H);x.globalAlpha=a*(.5+.4*z);const r=Math.max(1,Math.round(z*1.6*dpr));x.fillRect(X,Y,r,r);}}
  else if(w==='rain'){x.strokeStyle=R.night?'rgba(170,185,220,.5)':'rgba(210,225,250,.55)';x.lineWidth=Math.max(1,dpr*.8);x.beginPath();for(let i=0;i<60;i++){const z=.5+t7H(i,4),X=((t7H(i,5)*W-trav*.4-t*60*z*dpr)%W+W)%W,Y=((t7H(i,6)*H+t*420*z*dpr)%H),L=10*z*dpr;x.moveTo(X,Y);x.lineTo(X-L*.25,Y-L);}x.globalAlpha=a;x.stroke();
    x.globalAlpha=a*.08;x.fillStyle='#202840';x.fillRect(0,0,W,H);}
  else if(w==='fog'&&typeof w7BankT==='function'){const sp=w7BankT(0,'rgb(240,232,236)');for(let L=0;L<2;L++)for(let i=0;i<3;i++){const sc=W*(L?.7:.5)/sp.width,bw=sp.width*sc,bh=sp.height*sc,X=((t7H(i+L*5,7)*(W+bw)-trav*(L?1.1:.5)-t*6*dpr)%(W+bw)+W+bw)%(W+bw)-bw,Y=T7.hy+H*(L?.12:-.02)+t7H(i,8)*H*.1-bh/2;x.globalAlpha=a*(L?.32:.4);x.drawImage(sp,X,Y,bw,bh);}}
  else if(w==='sand'){x.fillStyle='rgba(246,222,170,.8)';for(let i=0;i<60;i++){const z=.5+t7H(i,9),X=((t7H(i,10)*W-trav*1.2*z-t*140*z*dpr)%W+W)%W,Y=T7.hy-H*.1+t7H(i,11)*H*.5+Math.sin(t*2+i)*3*dpr;x.globalAlpha=a*(.4+.4*z);x.fillRect(X,Y,Math.round(3*z*dpr),Math.max(1,dpr|0));}
    x.globalAlpha=a*.1;x.fillStyle='#e8b878';x.fillRect(0,0,W,H);}
  else if(w==='ash'){for(let i=0;i<46;i++){const z=.5+t7H(i,12),X=((t7H(i,13)*W-trav*.5*z+Math.sin(t*.8+i)*8*dpr)%W+W)%W,Y=((t7H(i,14)*H+t*16*z*dpr)%H);x.globalAlpha=a*.7;x.fillStyle=i%4?'#7a7070':'#4a4444';x.fillRect(X,Y,Math.round(2*z*dpr),Math.max(1,dpr|0));}
    x.globalCompositeOperation='lighter';for(let i=0;i<16;i++){const lf=(t*.25+t7H(i,15))%1,X=((t7H(i,16)*W-trav*.7+Math.sin(t*1.7+i)*10*dpr)%W+W)%W,Y=T7.gy-lf*H*.55;x.globalAlpha=a*(1-lf)*(.6+.4*Math.sin(t*7+i));x.fillStyle=i%3?'#ff8a3a':'#ffd070';const z=Math.max(1,Math.round(1.5*dpr));x.fillRect(X,Y,z,z);}}
  x.restore();}
// ----- one frame -----
function t7Frame(now,force){const cv=document.getElementById('t7cv');if(!cv)return;const st=cv.parentElement;if(!st)return;
  const still=t7Still(),low=t7Low(),dpr=low?1:Math.min(3,Math.max(1,window.devicePixelRatio||1)),cw=st.clientWidth,ch=st.clientHeight;if(!cw||!ch)return;
  t7Ids();const W=Math.round(cw*dpr),H=Math.round(ch*dpr),key=W+'x'+H+':'+low+':'+(T7.ids||[]).join(',');
  let dirty=!!force;if(key!==T7.key||cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;T7.key=key;T7.W=W;T7.H=H;T7.dpr=dpr;try{const lg=st.querySelector('.t7logo');T7.logoB=lg?(lg.getBoundingClientRect().bottom-st.getBoundingClientRect().top+14)*dpr:0;}catch(e){T7.logoB=0;}
    if(T7.bkWH!==W+'x'+H+low){T7.bk={};T7.bkWH=W+'x'+H+low;}t7Layout(W,H,dpr);t7FgBake(W,H);dirty=true;}
  if(T7.still!==still){T7.still=still;dirty=true;if(still){T7.ri=0;T7.rp=-1;T7.prev=null;}}
  if(still&&!dirty)return;if(!still&&!dirty&&now-T7.last<1000/T7C.fps)return;
  const t0=performance.now(),C=T7.cfg;T7.bkF=0;
  // travel time (s) and the realm cycle; hidden tabs do not advance it
  const dt=still?0:Math.min(.1,Math.max(0,(now-(T7.lastT||now))/1000));T7.lastT=now;if(!still)T7.tt+=dt;const t=still?0:T7.tt;
  if(!still){if(!T7.rT){T7.rT=now;T7.rDur=C.every[0]+t7H(T7.rN,3)*(C.every[1]-C.every[0]);T7.wx=t7WxFor(t7Realm(T7.ri),T7.visit);}
    if(now-T7.rT>=T7.rDur&&!document.hidden){T7.rp=T7.ri;T7.ri++;T7.rN++;T7.visit++;T7.rT=now;T7.rFade=now;T7.rDur=C.every[0]+t7H(T7.rN,3)*(C.every[1]-C.every[0]);T7.wxP=T7.wx;T7.wx=t7WxFor(t7Realm(T7.ri),T7.visit);}
    // a new party now and then, cross faded, never during a realm change
    if(!T7.next)T7.next=now+C.lineup;if(now>=T7.next&&!document.hidden&&T7.rp<0){T7.prev={heroes:T7.heroes,k:T7.k};T7.ids=t7Pick(T7.ids);T7.fadeT=now;T7.next=now+C.lineup;T7.key='';T7.lit={};return t7Frame(now,true);}}
  T7.last=now;const x=cv.getContext('2d'),R=t7Realm(still?0:T7.ri),B=t7Baked(R),rk=T7.rp>=0&&!still?Math.min(1,(now-T7.rFade)/C.fade):1,e=rk*rk*(3-2*rk);if(rk>=1)T7.rp=-1;
  const RP=T7.rp>=0?t7Realm(T7.rp):null,BP=RP?t7Baked(RP):null;T7.realm=R.n;
  if(!still&&!RP&&now-T7.rT>1500){const Rn=t7Realm(T7.ri+1);if(!T7.bk[Rn.n+':'+W+'x'+H+':'+low])t7Baked(Rn);}// bake the next realm ahead, between transitions
  // the world scrolls by: travel in device px; far layers slower (parallax)
  const v=C.speed*Math.max(1,T7.k)*dpr*.5,trav=t*v;
  const layer=(L,f)=>{if(!L)return;const P=L.c.width,o=((trav*f)%P+P)%P;x.drawImage(L.c,-o,L.y);x.drawImage(L.c,P-o,L.y);};
  const scene=(Bk,a)=>{x.globalAlpha=a;x.drawImage(Bk.sky,0,0);layer(Bk.far,.06);layer(Bk.mid,.25);layer(Bk.gr,1);};
  x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.imageSmoothingEnabled=true;
  if(BP){scene(BP,1);scene(B,e);}else scene(B,1);x.globalAlpha=1;
  if(!still&&R.stars){const r=t7Rng(3);x.fillStyle='#fff6dc';for(let i=0;i<12;i++){const sx=r()*W,sy=r()*T7.hy*.5,a=Math.max(0,Math.sin(t*1.7+i*2.1));if(a>.6){x.globalAlpha=(a-.6)*2*e;x.fillRect(Math.round(sx),Math.round(sy),dpr*1.5,dpr*1.5);}}x.globalAlpha=1;}
  // the party: contact shadows, then the heroes (back row first), lit for the realm (and the one being left while it fades)
  const k=T7.k,ws=still?0:t*1000/C.step,rec=[];
  const shadow=(h,a)=>{const cx=h.cx,fy=h.y,r=k*14;const g=x.createRadialGradient(cx,fy,0,cx,fy,r);g.addColorStop(0,`rgba(4,2,8,${(.5*a).toFixed(3)})`);g.addColorStop(1,'rgba(4,2,8,0)');x.fillStyle=g;x.save();x.translate(cx,fy);x.scale(1,.28);x.beginPath();x.arc(0,0,r,0,7);x.fill();x.restore();};
  T7.heroes.forEach(h=>shadow(h,1));
  const drawSet=(hs,Rl,alpha,kk,out)=>{x.imageSmoothingEnabled=!Number.isInteger(kk);hs.forEach(h=>{const {rw,rh,box}=h.s,L=t7Lit(h.s,Rl),ph=ws+h.ph,fr=still?0:Math.floor(ph)%2,bob=still?0:(fr?0:-1)*Math.max(1,Math.round(kk)),sway=still?0:Math.round(Math.sin(t*.55+h.bph)*kk*1.5),
      dw=rw*kk,dh=rh*kk,dx=Math.round(h.cx-((box.x0+box.x1+1)/2)*kk)+sway,dy=Math.round(h.y-(box.y1+1)*kk)+bob;x.globalAlpha=alpha;x.drawImage(L[fr],dx,dy,dw,dh);
      if(out)out.push({id:h.id,rw,rh,lw:h.s.lw,lh:h.s.lh,k:kk,x:dx,y:dy,w:dw,h:dh,lead:!!h.lead,box:{x:dx+box.x0*kk,y:dy+box.y0*kk,w:(box.x1-box.x0+1)*kk,h:(box.y1-box.y0+1)*kk},face:{x:dx+box.x0*kk,y:dy+box.y0*kk,w:(box.x1-box.x0+1)*kk,h:Math.round((box.y1-box.y0)*.42*kk)}});});x.globalAlpha=1;};
  const fadeK=T7.prev&&!still?Math.min(1,(now-T7.fadeT)/900):1;if(fadeK>=1)T7.prev=null;
  if(T7.prev)drawSet(T7.prev.heroes,R,1-fadeK,T7.prev.k,null);
  if(RP){drawSet(T7.heroes,RP,T7.prev?fadeK:1,k,null);drawSet(T7.heroes,R,(T7.prev?fadeK:1)*e,k,rec);}else drawSet(T7.heroes,R,T7.prev?fadeK:1,k,rec);T7.drawn=rec;
  // weather (the realm's for this visit), the front grass, then the grade
  if(!still){if(RP)t7Wx(x,T7.wxP,1-e,t,W,H,trav,RP);t7Wx(x,T7.wx,RP?e:1,t,W,H,trav,R);}
  x.globalAlpha=1;if(BP){x.globalAlpha=1;layer(BP.fr,1.5);x.globalAlpha=e;layer(B.fr,1.5);x.globalAlpha=1;}else layer(B.fr,1.5);
  x.globalCompositeOperation='source-over';x.drawImage(T7.fg,0,0);T7.frames++;T7.frameMs=Math.round((performance.now()-t0-(T7.bkF||0))*10)/10;// a realm bake (once per realm and size) is reported in bakeMs, not here
  T7.fms=(T7.fms||T7.frameMs)*.9+T7.frameMs*.1;
  // face and body boxes in page pixels (tests and the layout check)
  try{const b=cv.getBoundingClientRect(),sc=b.width/W,pg=r=>({left:b.left+r.x*sc,top:b.top+r.y*sc,right:b.left+(r.x+r.w)*sc,bottom:b.top+(r.y+r.h)*sc});T7.faces=rec.map(r=>Object.assign({id:r.id},pg(r.face)));T7.bodies=rec.map(r=>Object.assign({id:r.id},pg(r.box)));T7.stageR={left:b.left,top:b.top,right:b.right,bottom:b.bottom};}catch(e){}}
// the grade over everything: vignette, a darker band for the wordmark, a fade into the page at the bottom
function t7FgBake(W,H){const o=t7Cv(W,H),q=o.getContext('2d');const v=q.createRadialGradient(W/2,H*.62,Math.min(W,H)*.3,W/2,H*.55,Math.max(W,H)*.8);v.addColorStop(0,'rgba(8,6,18,0)');v.addColorStop(1,'rgba(8,6,18,.5)');q.fillStyle=v;q.fillRect(0,0,W,H);
  const tb=q.createLinearGradient(0,0,0,H*.4);tb.addColorStop(0,'rgba(6,6,20,.5)');tb.addColorStop(1,'rgba(6,6,20,0)');q.fillStyle=tb;q.fillRect(0,0,W,H*.4);
  const bt=q.createLinearGradient(0,H*.92,0,H);bt.addColorStop(0,'rgba(11,12,24,0)');bt.addColorStop(1,'rgba(11,12,24,.5)');q.fillStyle=bt;q.fillRect(0,H*.92,W,H*.08);T7.fg=o;}
// ----- the screen: restructure the title section built by ui.js (and renamed by p5settings.js) -----
function t7Size(){const st=document.querySelector('.t7stage');if(!st)return;const sec=st.closest('.t7');const vw=window.innerWidth,vh=window.visualViewport?window.visualViewport.height:window.innerHeight;
  const wide=vw>=700&&vw/vh>1.12;sec.classList.toggle('t7wide',wide);
  const top=st.getBoundingClientRect().top+(window.scrollY||0),w=st.clientWidth;let h;
  if(wide)h=Math.max(260,Math.min(vh-top-14,w*.95));else h=Math.max(250,Math.min(vh*.44,w*1.05,520));
  h=Math.round(h);if(Math.abs(st.offsetHeight-h)>1)st.style.height=h+'px';}
{const b0=buildScreen;buildScreen=function(){const r=b0.apply(this,arguments);try{if(V.screen==='title')t7Build();}catch(e){console.warn('title7',e);}return r;};}
function t7Build(){const sec=document.querySelector('#screen section.title');if(!sec||sec.classList.contains('t7'))return;sec.classList.add('t7');
  ['.tstage','.pre','.logo','.sub'].forEach(s=>{const e=sec.querySelector(':scope > '+s);if(e)e.remove();});
  if(!T7.logo)T7.logo=WF_LOGO.wordmark({glow:1,rule:1});if(!T7.crest)T7.crest=WF_LOGO.emblem({cls:'t7em'});// v0.8.0: the crest (the app icon's compass badge) beside the wordmark
  const top=document.createElement('div');top.className='t7top';
  top.innerHTML=`<div class="t7stage"><canvas id="t7cv" aria-hidden="true"></canvas><h1 class="logo t7logo"><span class="sr">Wayfarers</span><span class="t7crest" aria-hidden="true">${T7.crest}</span><span class="t7wm">${T7.logo}<span class="t7beta">Beta</span></span></h1></div><div class="t7side"></div>`;
  const side=top.querySelector('.t7side'),menu=sec.querySelector(':scope > .tmenu');
  sec.insertBefore(top,sec.firstChild);
  if(menu){let n=menu;const mv=[];while(n&&!(n.classList&&(n.classList.contains('legacy')||n.classList.contains('pitch')))){mv.push(n);n=n.nextElementSibling;}mv.forEach(e=>side.appendChild(e));}
  const ver=sec.querySelector(':scope > .ver');if(ver)side.appendChild(ver);
  T7.key='';t7Size();requestAnimationFrame(()=>{t7Size();t7Frame(performance.now(),true);});}
{const lp0=loop;loop=function(){try{if(V.screen==='title')t7Frame(performance.now());}catch(e){if(!T7.err){T7.err=1;console.warn('title7 frame',e);}}return lp0.apply(this,arguments);};}
window.addEventListener('resize',()=>{try{if(V.screen==='title'){t7Size();t7Frame(performance.now(),true);}}catch(e){}});
// the header wordmark (small)
{const h0=vHeader;vHeader=function(){let h=String(h0.apply(this,arguments));if(!T7.hlogo)T7.hlogo=WF_LOGO.wordmark({shadow:false,outline:8,idp:'h'});
  return h.replace(/<div class="brand"><b>(?:Wayfarers|Aurelis)<\/b>/,`<div class="brand"><b class="wfm" role="img" aria-label="Wayfarers">${T7.hlogo}</b>`);};}
try{const st=document.createElement('style');st.id='t7-css';st.textContent=`
.title.t7{gap:12px}.t7top{display:grid;gap:12px;align-items:center}
.t7stage{position:relative;width:100%;height:340px;overflow:hidden;border:1px solid #6f5730;border-radius:6px;background:#140f24;
  box-shadow:inset 0 0 0 1px #000,0 0 0 1px #000,0 0 0 4px rgba(217,180,106,.16),0 16px 40px rgba(0,0,0,.6);line-height:0}
.t7stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.t7logo{position:absolute;left:50%;top:5%;transform:translateX(-50%);width:min(92%,620px);margin:0;line-height:0;pointer-events:none;text-shadow:none;letter-spacing:0;font-size:0;display:flex;align-items:center;gap:2.5%}
.t7crest{flex:0 0 20%;min-width:0;line-height:0}.t7crest svg{display:block;width:100%;height:auto;filter:drop-shadow(0 2px 6px rgba(0,0,0,.55)) drop-shadow(0 0 14px rgba(255,190,90,.25))}
.t7wm{position:relative;flex:1 1 auto;min-width:0;line-height:0}
.t7wm svg{display:block;width:100%;height:auto;filter:drop-shadow(0 0 16px rgba(255,190,90,.22))}
.t7beta{position:absolute;left:50%;bottom:-2px;transform:translate(-50%,100%);font:700 11px/1 var(--fb);letter-spacing:.42em;padding-left:.42em;color:#e9d29a;text-transform:uppercase;text-shadow:0 1px 2px #000;white-space:nowrap}
.t7 .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.t7side{display:grid;gap:8px;justify-items:center;min-width:0}.t7side .tmenu{margin-top:0}.t7side .ver{margin:2px 0 0}
.t7.t7wide .t7top{grid-template-columns:minmax(0,1fr) minmax(260px,340px)}
.t7.t7wide .t7logo{width:min(88%,580px)}
.brand b.wfm{display:block;height:24px;line-height:0;font-size:0;font-family:var(--fb);text-shadow:none}.brand b.wfm svg{height:100%;width:auto;display:block}
@media (max-width:480px){.brand b.wfm{height:17px}}`;document.head.appendChild(st);}catch(e){}
