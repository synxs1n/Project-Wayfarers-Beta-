// Beta v0.5.8: every unit's element badge and HP bar stay visible on the battle stage. They were drawn right after each unit's own
// sprite, so a unit standing lower on the stage (drawn later) could cover the badge of the unit behind it.
const {open,chk,done}=require('./pw');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'${t}',hints:false}}));`;
(async()=>{for(const [gfx,WXX] of [['low','clear'],['medium','clear'],['low','snow'],['medium','rain']])for(const [w,h] of [[390,844],[844,390]]){
  const H=await open({w,h,mobile:true,pre:META(gfx)});const {ev,wait}=H;
  await ev(WX=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(99999);A.startBattle({stage:0,kind:'field',weather:WX});},WXX);await wait(1200);
  const r=await ev(async()=>{const A=__A,B=A.B,bad=[];let n=0;await new Promise(q=>requestAnimationFrame(()=>requestAnimationFrame(q)));
    const cv=document.getElementById('bcv'),k=(cv._rw||cv.width)/cv.width,ctx=cv.getContext('2d'),W=cv._rw||cv.width,D=ctx.getImageData(0,0,W,cv._rh||cv.height).data;
    B.en.concat(B.front).forEach(u=>{if(u.hp<=0||!u.el||!u.el.length)return;const b=A.unitBox(u);if(!b)return;const hero=u.side==='p',bw=hero?24:Math.min(40,Math.round(b.w*.66));
      const x=u._hud?u._hud.x:b.x,y=u._hud?u._hud.y:b.y,bx=Math.round(x-bw/2),tw=u.el.length*10;let by=y+3,sx=bx-tw-1;if(sx<1)sx=Math.min(A.BL.W-tw-1,bx+bw+2);
      /* v0.6.3: the stage layout pass places each HP plate (u._plate: where the badges were drawn) */if(u._plate){sx=u._plate.ix;by=u._plate.iy+4;}
      u.el.forEach((el,i)=>{const ic=A.iconCv?A.iconCv(el):null;if(!ic)return;const id=ic.getContext('2d').getImageData(0,0,ic.width,ic.height).data;let miss=0,tot=0;
        for(let yy=0;yy<ic.height;yy++)for(let xx=0;xx<ic.width;xx++){const a=id[(yy*ic.width+xx)*4+3];if(a<250)continue;tot++;const px=Math.floor((sx+i*10+xx)*k+k/2),py=Math.floor((by-4+yy)*k+k/2),j=(py*W+px)*4;
          const dr=Math.abs(D[j]-id[(yy*ic.width+xx)*4]),dg=Math.abs(D[j+1]-id[(yy*ic.width+xx)*4+1]),db=Math.abs(D[j+2]-id[(yy*ic.width+xx)*4+2]);if(dr+dg+db>60){/* a uniform darkening (the stage vignette near the edges) is not a cover: same colour, lower brightness */const ir=id[(yy*ic.width+xx)*4],ig=id[(yy*ic.width+xx)*4+1],ib=id[(yy*ic.width+xx)*4+2],k2=(D[j]+D[j+1]+D[j+2]+1)/(ir+ig+ib+1);const same=k2<1.02&&k2>.25&&Math.abs(D[j]-ir*k2)+Math.abs(D[j+1]-ig*k2)+Math.abs(D[j+2]-ib*k2)<36;if(!same)miss++;}}
        n++;if(tot&&miss/tot>.15)bad.push(u.name+' '+el+' '+Math.round(100*miss/tot)+'% covered');});});
    return {n,bad};});
  chk(`${gfx} ${WXX} ${w}x${h}: ${r.n} element badges, none covered by another unit`,r.n>0&&r.bad.length===0||JSON.stringify(r));
  await H.browser.close();}
const H=await open({});await done(H);})();
