// ===== deskscale.js (v0.10.1): the page zoom on computers =====
// On a computer screen the page sat at its phone size (the app box is 1000 px wide) in a sea of dark blue. This zooms the whole
// page with CSS zoom on <html> to one of 1, 4/3, 5/3 or 2 (the world's pixel art at scale 3 stays on whole device pixels: 3, 4, 5
// or 6), the largest that fits the window (DS.baseW by DS.baseH layout px). Setting META.cfg.uiScale: 'auto' (default), or the
// factor as a string ('1','1.333','1.667','2'). Phones and tablets (coarse pointer) and windows under DS.minW are never zoomed, so
// the phone and Fold layouts are untouched. Measurements that mix viewport pixels with layout pixels divide by dsZoom() (worldrt.js).
const DS={steps:[1,4/3,5/3,2],baseW:1000,baseH:720,minW:1100};
function dsWant(){try{if(!matchMedia('(pointer:fine)').matches||matchMedia('(pointer:coarse)').matches)return 1;const w=window.innerWidth,h=window.innerHeight;if(w<DS.minW)return 1;
  const c=META&&META.cfg&&META.cfg.uiScale;if(c&&c!=='auto'){const f=parseFloat(c);if(f>0)return Math.min(f,Math.max(1,w/DS.baseW*.98));}
  let best=1;DS.steps.forEach(z=>{if(DS.baseW*z<=w&&DS.baseH*z<=h)best=z;});return best;}catch(e){return 1;}}
function dsApply(){try{const z=dsWant(),cur=dsZoom();if(Math.abs(z-cur)<.001)return false;document.documentElement.style.zoom=z===1?'':String(z);
  if(V.screen==='world')worldSizeCanvas();if(V.screen==='battle'&&B){BL.fitH=0;layoutBattle();}return true;}catch(e){return false;}}
window.addEventListener('resize',()=>{dsApply();});
try{dsApply();}catch(e){}
{const r0=render;render=function(){dsApply();return r0.apply(this,arguments);};}
function dsRow(){try{if(!matchMedia('(pointer:fine)').matches)return '';const c=(META.cfg.uiScale||'auto'),lab={auto:'Auto','1':'100%','1.333':'133%','1.667':'167%','2':'200%'};
  const chips=Object.keys(lab).map(k=>`<button class="chip ${c===k?'on':''}" data-act="cfg" data-arg='["uiScale","${k}"]'>${lab[k]}</button>`).join('');
  const now=c==='auto'?`Auto is using ${Math.round(dsZoom()*100)}%.`:(window.innerWidth<DS.minW?'Windows narrower than '+DS.minW+' px stay at 100%.':'');
  return `<div class="rows dsrows"><div class="row"><div><b>Screen size</b><small>On computers the page is zoomed to fill the window. ${now}</small></div><div class="chips">${chips}</div></div></div>`;}catch(e){return '';}}
HOOK.wrap('settingsBody','deskscale','Screen size row',function(next,...a){return next(...a)+dsRow();});
{const c0=ACT.cfg;ACT.cfg=function(arg){const r=c0.apply(this,arguments);try{const a=typeof arg==='string'?JSON.parse(arg):arg;if(a&&a[0]==='uiScale')dsApply();}catch(e){}return r;};}
