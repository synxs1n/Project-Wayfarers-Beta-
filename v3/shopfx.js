// ===== v0.4.0 3.4: purchase feedback =====
// Every real purchase (gold leaves the purse) plays a coin sound and a small coin pop over the button that was pressed.
// Reduced motion: the pop does not move, it just shows the price for a moment. Sound still plays unless muted.
const BUY_ACTS=['buyItem','buyGear','buyRelit','buyMat','buyPart','temperBuy'];
let _lastBtn=null;
document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-act]'):null;_lastBtn=b?b.getBoundingClientRect():null;},true);
function buyFx(rect,spent){
  try{
    let L=document.getElementById('buyfxl');if(!L){L=document.createElement('div');L.id='buyfxl';L.setAttribute('aria-hidden','true');document.body.appendChild(L);}
    const still=typeof reducedMotion==='function'&&reducedMotion();
    const r=rect||(document.querySelector('.modal .panel')||document.body).getBoundingClientRect();
    const x=Math.round(r.left+r.width/2),y=Math.round(r.top+r.height/2);
    const w=document.createElement('div');w.className='buyfx'+(still?' still':'');w.style.left=x+'px';w.style.top=y+'px';
    w.innerHTML=`<b class="buyamt">−${fmt(spent)}</b>`+(still?'':[0,1,2,3,4].map(i=>`<i class="coin c${i}"></i>`).join(''));
    L.appendChild(w);setTimeout(()=>{try{w.remove();}catch(_){}},still?900:1000);
  }catch(_){}
}
BUY_ACTS.forEach(k=>{const f=ACT[k];if(typeof f!=='function')return;ACT[k]=function(){const g0=G?G.gold:0,rc=_lastBtn;const out=f.apply(this,arguments);if(G&&G.gold<g0)buyFx(rc,g0-G.gold);return out;};});
