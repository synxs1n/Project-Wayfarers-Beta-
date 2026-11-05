// =================== BATTLE TEXT (Beta v0.3.2) ===================
// Every effect text floats over the unit it affects, in its own layer, clamped inside the stage. Texts on one unit
// take stacked slots (oldest nearest the head) with a small stagger, so nothing overlaps. The top banner is only for
// global events (boss intro, phase change, weather, Limit Breaks, swaps, waves), and it is a thin strip.
numDur=function(){return clamp(2.2/(META.cfg.speed||1),1.3,2.6);};
fxDur=function(f){let d=numDur();if(/react|stat|effx|BREAK/.test(f.cls)||f.txt==='BREAK')d+=.6;const L=String(f.txt).length;if(L>8)d+=Math.min(.7,.05*(L-8));return +d.toFixed(2);};
banDur=function(bn){const sp=META.cfg.speed||1;let d=clamp(2.2/sp,1.4,2.4);const L=String(bn.txt).length;if(L>12)d+=Math.min(.8,.04*(L-12));return +d.toFixed(2);};
const FX_STAG=90,FX_KEEP=6000;
{const f0=fx;fx=function(u,txt,cls){f0.apply(this,arguments);try{const now=Date.now();u.fx=(u.fx||[]).filter(f=>now-f.t<FX_KEEP);}catch(e){}};}
fxHtml=function(){return '';};
function fxSize(){const k=BL.sc||2;return k>=2.75?5.5:k>=1.9?6.5:Math.min(10,Math.max(6.5,Math.round(14/k*2)/2));}// logical px: 16.5px on desktop, 13px on phones
function fxScale(f){return /crit/.test(f.cls)?1.25:/effx|stat/.test(f.cls)?.82:/react/.test(f.cls)?1:1;}
function fxLayer(now){if(!B)return '';let top=1;try{const bw=document.getElementById('bwrap'),bn=B.banner,on=!!bn&&now-bn.t<banDur(bn)*1000;if(on)top=Math.ceil(26/(BL.sc||2));if(bw)bw.classList.toggle('banon',on);}catch(e){}const W=BL.W,H=BL.H,base=fxSize(),out=[];
  B.en.concat(B.front).forEach(u=>{if(!u||!u.fx||!u.fx.length)return;const b=unitBox(u);if(!b)return;
    const live=u.fx.filter(f=>now-f.t<(fxDur(f)*1000+IMPACT+FX_STAG*6));if(!live.length)return;
    // give each text a slot when it first shows; slots free up as texts fade
    const used=new Set(live.filter(f=>f.slot!=null).map(f=>f.slot));live.forEach(f=>{if(f.slot==null){let s=0;while(used.has(s))s++;f.slot=s;used.add(s);f.stg=Math.min(s,5)*FX_STAG;}});
    const head=b.y-b.h-(u.side==='e'?6:3),LH=base*1.15;
    live.forEach(f=>{const fs=base*fxScale(f),w=String(f.txt).length*fs*.62+4;let y=head-f.slot*LH;
      if(y-fs<top)y=b.y+fs+2+f.slot*LH;// no room above: stack below the feet instead
      y=clamp(y,fs+top,H-2);const x=clamp(b.x,w/2+1,W-w/2-1),age=now-f.t,dl=fxDelay(f)+f.stg-age;
      out.push(`<span class="fx2 ${f.cls}" style="left:${x.toFixed(1)}px;top:${(y-fs).toFixed(1)}px;font-size:${fs.toFixed(2)}px;animation-delay:${dl}ms;animation-duration:${fxDur(f)}s">${esc(f.txt)}</span>`);});});
  return `<div class="fxlayer">${out.join('')}</div>`;}
{const st0=stageTags;stageTags=function(){return st0.apply(this,arguments)+fxLayer(Date.now());};}
