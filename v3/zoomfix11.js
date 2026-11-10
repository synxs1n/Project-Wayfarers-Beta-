// ===== zoomfix11.js (v0.18.5): the page zoom on computers under both Chromium zoom semantics =====
// Owner (Windows app, Electron 31 = Chromium 126): menus taller than the window that only scroll with the page behind them, the
// world view a quarter narrower than its frame with dark bars at the sides, battle columns that overflow. Chromium before 128 keeps
// vh/vw units and getBoundingClientRect in unzoomed pixels while the page is CSS-zoomed; 128+ scales them. So:
//  - dzRectK(): what a rect value is divided by to get layout px (1 on old Chromium, the zoom on new), measured against <html>.
//  - --lvh / --lvw: 1% of the window in layout px (innerHeight / zoom works under both), set on <html data-dz> while zoomed;
//    style.css overrides every vh/vw rule with them under html[data-dz], and locks the page scroll on the world and battle screens.
//  - The world frame (#app) grows to the window width on the world screen, so a wide window shows more world instead of bars.
const DZ={k:null,z:0};
function dzRectK(){try{const z=typeof dsZoom==='function'?dsZoom():1;if(z<=1.001)return 1;if(DZ.k&&DZ.z===z)return DZ.k;const w=document.documentElement.getBoundingClientRect().width;if(!(w>0))return z;
  const r=window.innerWidth/w;DZ.z=z;DZ.k=r>1+(z-1)/2?1:z;return DZ.k;}catch(e){return 1;}}
function dzVars(){try{const h=document.documentElement,z=typeof dsZoom==='function'?dsZoom():1;
  if(z<=1.001){if(h.hasAttribute('data-dz')){h.removeAttribute('data-dz');h.style.removeProperty('--lvh');h.style.removeProperty('--lvw');}return;}
  const vv=window.visualViewport,H=(vv?vv.height:window.innerHeight)/z,W=(vv?vv.width:window.innerWidth)/z;
  h.setAttribute('data-dz','1');h.style.setProperty('--lvh',(H/100).toFixed(3)+'px');h.style.setProperty('--lvw',(W/100).toFixed(3)+'px');}catch(e){}}
function dzLock(){try{const on=!!(typeof V!=='undefined'&&(V.screen==='world'||V.screen==='battle'));document.documentElement.classList.toggle('dzlock',on);}catch(e){}}
{const da0=dsApply;dsApply=function(){const r=da0.apply(this,arguments);dzVars();return r;};}
window.addEventListener('resize',()=>{dzVars();});
if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{dzVars();});
HOOK.after('render','zoomfix11','zoom vars and page lock',function(){try{dzVars();dzLock();}catch(e){}});
try{dzVars();dzLock();}catch(e){}
