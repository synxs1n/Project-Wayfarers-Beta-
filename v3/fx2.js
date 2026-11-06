// =================== BATTLE TEXT (Beta v0.3.2) ===================
// Every effect text floats over the unit it affects, in its own layer, clamped inside the stage. Texts on one unit
// take stacked slots (oldest nearest the head) with a small stagger, so nothing overlaps. The top banner is only for
// global events (boss intro, phase change, weather, Limit Breaks, swaps, waves), and it is a thin strip.
function numDur(){return clamp(2.2/(META.cfg.speed||1),1.3,2.6);}
function fxDur(f){let d=numDur();if(/react|stat|effx|BREAK/.test(f.cls)||f.txt==='BREAK')d+=.6;const L=String(f.txt).length;if(L>8)d+=Math.min(.7,.05*(L-8));return +d.toFixed(2);}
function banDur(bn){const sp=META.cfg.speed||1;let d=clamp(2.2/sp,1.4,2.4);const L=String(bn.txt).length;if(L>12)d+=Math.min(.8,.04*(L-12));return +d.toFixed(2);}
const FX_STAG=90,FX_KEEP=6000;
{const f0=fx;fx=function(u,txt,cls){f0.apply(this,arguments);try{const now=Date.now();u.fx=(u.fx||[]).filter(f=>now-f.t<FX_KEEP);}catch(e){}};}
function fxSize(){const k=BL.sc||2;return k>=2.75?5.5:k>=1.9?6.5:Math.min(10,Math.max(6.5,Math.round(14/k*2)/2));}// logical px: 16.5px on desktop, 13px on phones
function fxScale(f){return /crit/.test(f.cls)?1.25:/effx|stat/.test(f.cls)?.82:/react/.test(f.cls)?1:1;}
// v0.6.3: texts are placed by b3FxRects (battle3.js) around the unit, clear of every sprite and stage label; a reaction carries both element icons
function fxLayer(now){if(!B)return '';try{const bw=document.getElementById('bwrap'),bn=B.banner,on=!!bn&&now-bn.t<banDur(bn)*1000;if(bw)bw.classList.toggle('banon',on);}catch(e){}
  const out=b3FxRects(now).map(({f,r,fs})=>{const age=now-f.t,dl=fxDelay(f)+f.stg-age,rx=f.cls==='react';
    return `<span class="fx2 b3fx ${f.cls}" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;font-size:${fs.toFixed(2)}px;animation-delay:${dl}ms;animation-duration:${fxDur(f)}s">${rx?`<b>${f.rp&&EL[f.rp]?ico(f.rp):''}${f.rd&&EL[f.rd]?ico(f.rd):''}✸ ${esc(f.txt)}</b>`:esc(f.txt)}</span>`;});
  return `<div class="fxlayer">${out.join('')}</div>`;}
{const st0=stageTags;stageTags=function(){return st0.apply(this,arguments)+fxLayer(Date.now());};}
