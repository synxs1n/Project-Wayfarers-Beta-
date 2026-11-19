// ===== nav40.js (v0.22.40): a click to walk shows where it landed =====
// The owner, on the Windows app: "When I click a spot on the map or in the overworld it doesn't walk to the right place." Not reproduced: in
// the app's engine (Chromium 126) at nine window sizes and three display scales a click on the ground resolved to the tile drawn under the
// cursor, and the hero walked to it (docs/handoff-v0111.md, 0.22.40). So the game now shows what it understood, which is useful anyway and
// will show the difference if there is one on the owner's machine:
//   a white ring where the pointer was released, and a gold diamond on the tile the party is walking to (through the camera, HD-2D tiers).
// When the two sit on each other the click was read correctly; apart, the gap is the error.
// Mouse and pen only (a finger covers the spot). N40.off=true turns it off.
const N40={off:false,ms:900};
function n40Project(tx,ty){try{if(typeof HD==='undefined'||!HD.live||!HD.eye||!WS.cv)return null;const E=HD.eye,F=HD.fwd,U=HD.up,t=HD.tanH,asp=HD.asp,v=[tx*TS+TS/2-E[0],0-E[1],ty*TS+TS/2-E[2]];
  const det=F[1]*U[2]-F[2]*U[1];if(Math.abs(det)<1e-9)return null;const lam=(v[1]*U[2]-v[2]*U[1])/det,c=(F[1]*v[2]-F[2]*v[1])/det;if(!(lam>0))return null;
  const nx=(v[0]/lam-F[0])/(t*asp),ny=(c/lam)/t,r=WS.cv.getBoundingClientRect();return [r.left+(nx+1)/2*r.width,r.top+(1-ny)/2*r.height];}catch(e){return null;}}
function n40Mark(x,y,cls){const d=document.createElement('i');d.className='n40 '+cls;d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>{try{d.remove();}catch(e){}},N40.ms);}
document.addEventListener('pointerup',e=>{try{if(N40.off||(e.pointerType!=='mouse'&&e.pointerType!=='pen')||typeof V==='undefined'||V.screen!=='world'||V.modal||!WS.target)return;
  const t=e.target;if(!t||!t.closest||!t.closest('.wview,#wcv,#wgl'))return;const k=typeof nv11Zoom==='function'?nv11Zoom():1;
  n40Mark(e.clientX/k,e.clientY/k,'at');const p=n40Project(WS.target[0],WS.target[1]);if(p)n40Mark(p[0],p[1],'to');N40.last={at:[e.clientX/k,e.clientY/k],to:p,tile:WS.target.slice()};}catch(_){}});
{const st=document.createElement('style');st.id='n40css';st.textContent=`
.n40{position:fixed;z-index:60;pointer-events:none;width:0;height:0}
.n40.at::before{content:"";position:absolute;left:-9px;top:-9px;width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(0,0,0,.6);animation:n40f .9s ease-out both}
.n40.to::before{content:"";position:absolute;left:-6px;top:-6px;width:10px;height:10px;transform:rotate(45deg);background:#ffd23d;border:1px solid #1a1020;animation:n40f .9s ease-out both}
@keyframes n40f{0%{opacity:1}70%{opacity:1}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.n40::before{animation-duration:.9s}}
`;document.head.appendChild(st);}
try{window.__N40={N40,project:n40Project};}catch(e){}
