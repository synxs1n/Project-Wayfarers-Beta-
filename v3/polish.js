// ===== polish.js (v0.3.1): inn rest fade, reduced motion, small polish =====
// Inn rest: fade to black, a short lullaby, fade back with everyone restored. Reduced-motion players skip the fade.
function fadeOverlay(){let o=document.getElementById('fadeov');if(!o){o=document.createElement('div');o.id='fadeov';o.setAttribute('aria-hidden','true');document.body.appendChild(o);}return o;}
function reducedMotion(){try{const c=META&&META.cfg&&META.cfg.rmotion;if(c===true||c===false)return c;return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}}
{const r0=ACT.rest;ACT.rest=function(){
  if(!G||G.gold<innCost(townS())||V._resting)return r0.apply(this,arguments);
  if(reducedMotion()){sfx('rest');return r0.apply(this,arguments);}
  const o=fadeOverlay();V._resting=1;o.classList.add('on');sfx('rest');
  setTimeout(()=>{r0.call(this);o.classList.add('zz');},500);
  setTimeout(()=>{o.classList.remove('on','zz');V._resting=0;},1500);};}
