// ===== menus29.js (v0.22.29): the main menu on phones: content first, the sections under the thumb =====
// Asked after a mock-up (scratchpad only): "Menus look good let's apply the update". On a 360x640 phone the frame, the Menu title, the Save
// row, two rows of sections, two rows of sub tabs and the tool buttons took the first 500 px. Only on screens up to M29.maxW px wide:
//  1 the menu fills the screen; one 46 px bar names the section and shows the save state, gold and Close
//  2 the sections are a bar at the bottom (drawn icons, not emoji: crossed swords, an adventurer's pack with a bedroll, flap and buckle, a scroll, a compass): Party, Backpack, Quests (with a count of rewards ready), Map, More (Records, Guides, Settings, Save)
//  3 sub tabs and quest filters are one row that scrolls sideways, never two rows; the sub tabs stay in view while the page scrolls
//  4 Party: the tools are one row, a hero card has Sheet and Equip side by side and no XP bar (it is on the sheet), so the six fit on screen;
//    the reserve filters share a row
//  5 Backpack and Quests: Show and Sort share a row; long descriptions are cut to two lines until the row is tapped (class m29x)
// The markup is the game's own (ui.js / menus3.js): a pass over #modal after each render adds the class, the title, gold, the More button and
// its sheet. M29.off=true (or localStorage aurelis-m29off=1, for the tests of the classic menu) turns it off.
const M29={maxW:560,more:false,off:(()=>{try{return localStorage.getItem('aurelis-m29off')==='1';}catch(e){return false;}})()};
// the width is read once and again on resize: window.innerWidth makes the browser lay the page out, and this is asked on every render (0.22.35)
function m29On(){try{if(M29.off)return false;if(M29.vw==null)M29.vw=window.innerWidth;return M29.vw<=M29.maxW;}catch(e){return false;}}
function m29Ready(){let n=0;try{n+=m3Quests().filter(q=>nbQState(q)==='ready').length;}catch(e){}try{if(typeof facMisAll==='function')n+=facMisAll().filter(m=>facMisState(m)==='ready').length;}catch(e){}return n;}
function m29MoreSync(pn,mg){const inMore=!!mg.querySelector('.chip.on[data-arg="records"],.chip.on[data-arg="guides"],.chip.on[data-arg="settings"]'),mb=mg.querySelector('.m29mb');
  if(mb){mb.classList.toggle('on',inMore||M29.more);mb.setAttribute('aria-expanded',M29.more?'true':'false');}
  pn.querySelectorAll(':scope>.m29more').forEach(x=>x.remove());if(!M29.more)return;
  const s=document.createElement('div');s.className='m29more';s.innerHTML=['records','guides','settings'].map(k=>{const c=mg.querySelector(`[data-arg="${k}"]`);return c?`<button class="btn sm${c.classList.contains('on')?' gold':''}" data-act="menuGrp" data-arg="${k}">${esc((c.textContent||'').trim())}</button>`:'';}).join('')+'<button class="btn sm" data-act="p5Save">💾 Save now</button>';pn.appendChild(s);}
function m29Pass(){try{const md=document.getElementById('modal');if(!md)return;const pn=md.querySelector('.panel'),mg=pn&&pn.querySelector(':scope>.mgrp');const ov=pn&&pn.parentNode;
  if(!pn||!mg||!V.modal||V.modal.type!=='menu'){M29.more=false;return;}
  const on=m29On();pn.classList.toggle('m29',on);if(ov&&ov.classList)ov.classList.toggle('m29m',on);if(!on)return;
  if(pn.dataset.m29){m29MoreSync(pn,mg);return;}/* the same panel again (a render that kept the modal): only the More sheet can have changed */pn.dataset.m29='1';
  // 1 the bar
  const h=pn.querySelector(':scope>.menuh'),act=mg.querySelector('.chip.on'),lab=act?(act.textContent||'').trim():'Menu';
  if(h){for(const n of [...h.childNodes])if(n.nodeType===3)n.remove();const t=document.createElement('b');t.className='m29t';t.textContent=lab;h.insertBefore(t,h.firstChild);
    const g=document.createElement('span');g.className='m29g nums';g.innerHTML='<i>◉</i> '+((G&&G.gold)||0).toLocaleString();h.appendChild(g);}
  // 2 the bottom bar: a count on Quests, and More
  const rd=m29Ready(),qc=mg.querySelector('[data-arg="quests"]');if(rd>0&&qc){const b=document.createElement('span');b.className='m29bd nums';b.textContent=rd;b.setAttribute('aria-label',rd+' rewards ready');qc.appendChild(b);}
  const mb=document.createElement('button');mb.className='chip m29mb';mb.dataset.act='m29More';mb.textContent='More';mg.appendChild(mb);m29MoreSync(pn,mg);
  // 3 the open sub tab is in view
  const ms=pn.querySelector(':scope>.msub'),so=ms&&ms.querySelector('.chip.on');if(so)requestAnimationFrame(()=>{try{ms.scrollLeft=Math.max(0,so.offsetLeft-(ms.clientWidth-so.offsetWidth)/2);}catch(e){}});/* next frame: measuring here would lay the whole page out inside the render */
  // 4 the loadout button joins the party tools
  const pt=pn.querySelector('.ptools'),ld=pn.querySelector('.ldstrip');if(pt&&ld){ld.querySelectorAll('button').forEach(b=>pt.appendChild(b));ld.remove();}
  // 5 a long description opens when its row is tapped
}catch(e){M29.err=String(e&&e.message||e);}}
// a shortened row opens when the row itself is tapped. Not on focus: a press on a button inside the row would open it first, the row would
// grow under the finger and the tap would miss the button (v187a).
document.addEventListener('click',e=>{try{const t=e.target;if(!t||!t.closest||t.closest('button,select,a,input,label,summary'))return;const r=t.closest('.panel.m29 .rows>.row');if(r)r.classList.toggle('m29x');}catch(_){}});
ACT.m29More=function(){M29.more=!M29.more;render();m29Pass();};
['menuGrp','menuTab','p5Save','xClose','menu'].forEach(k=>{const f=ACT[k];if(typeof f==='function')ACT[k]=function(){M29.more=false;return f.apply(this,arguments);};});
try{const md=document.getElementById('modal');if(md)new MutationObserver(m29Pass).observe(md,{childList:true});}catch(e){}
HOOK.after('render','menus29','the phone menu pass',function(){m29Pass();});
window.addEventListener('resize',()=>{try{M29.vw=window.innerWidth;if(V&&V.modal&&V.modal.type==='menu')render();}catch(e){}});
{const st=document.createElement('style');st.id='m29css';st.textContent=`
#modal .modal.m29m{display:block;padding:0;overflow:hidden}
#modal .modal.m29m>.panel.m29{animation:none!important;transform:none!important}/* a full screen sheet that slides in pokes past the screen edge while it moves */
.panel.m29{scroll-padding:100px 0 calc(72px + env(safe-area-inset-bottom,0px));display:block;width:100%;max-width:none;height:100%;max-height:100%;min-height:0;margin:0;border-radius:0;box-sizing:border-box;padding:0 10px calc(72px + env(safe-area-inset-bottom,0px));overflow-y:auto;overflow-x:hidden}
.panel.m29::before,.panel.m29::after{display:none}
.panel.m29>.mnav{position:fixed!important;top:3px!important;right:6px!important;left:auto!important;bottom:auto;z-index:30!important;margin:0;padding:0;width:40px;height:40px;display:block}
.panel.m29>.mnav .mclose{position:static;display:grid;place-items:center;width:40px;height:40px;margin:0}
.panel.m29>.menuh{position:sticky;top:0;z-index:8;display:flex;align-items:center;gap:8px;height:46px;min-height:46px;margin:0 -10px!important;transform:none;padding:0 54px 0 40px;box-sizing:border-box;background:#0f1830;border:0;border-bottom:1px solid #2a3a60;font-size:1.05rem}
.panel.m29>.menuh .m29t{font:inherit;color:#ffe9a6;white-space:nowrap}
.panel.m29>.menuh .savepin{display:flex;align-items:center;min-width:0;flex:0 1 auto;margin:0;padding:0}
.panel.m29>.menuh .savepin .btn{display:none}
.panel.m29>.menuh .savepin small{font:800 .62rem/1.2 var(--fb);color:#8fe0a0;border:1px solid #2f6a45;border-radius:10px;padding:2px 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;letter-spacing:0;text-transform:none}
.panel.m29>.menuh .m29g{margin-left:auto;font:800 .78rem/1 var(--fb);color:#ffd76a;white-space:nowrap;letter-spacing:0}
.panel.m29>.menuh .m29g i{font-style:normal}
.panel.m29>.mgrp{position:fixed;left:0;right:0;bottom:0;z-index:25;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0;margin:0;padding:0 0 env(safe-area-inset-bottom,0px);box-sizing:content-box;height:58px;border:0;border-top:1px solid #33466f;border-radius:0;background:#0f1830}
.panel.m29>.mgrp .chip{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:0;width:auto;height:58px;min-height:58px;margin:0;padding:0;border:0;border-radius:0;background:none;box-shadow:none;color:#8fa0c4;font:800 .64rem/1.1 var(--fb)}
.panel.m29>.mgrp .chip::before{content:"";display:block;width:24px;height:24px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 7h14M5 12h14M5 17h14'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 7h14M5 12h14M5 17h14'/%3E%3C/svg%3E") center/contain no-repeat}
.panel.m29>.mgrp .chip[data-arg="party"]::before{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4.5 3.5l11.5 11.5M19.5 3.5L8 15M13.3 17.7l4.4-4.4M6.3 13.3l4.4 4.4M16.5 16.5l3 3M7.5 16.5l-3 3M4.5 3.5v2.6M4.5 3.5h2.6M19.5 3.5v2.6M19.5 3.5h-2.6'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4.5 3.5l11.5 11.5M19.5 3.5L8 15M13.3 17.7l4.4-4.4M6.3 13.3l4.4 4.4M16.5 16.5l3 3M7.5 16.5l-3 3M4.5 3.5v2.6M4.5 3.5h2.6M19.5 3.5v2.6M19.5 3.5h-2.6'/%3E%3C/svg%3E")}
.panel.m29>.mgrp .chip[data-arg="gear"]::before{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7.5 3.2h9a1.9 1.9 0 0 1 0 3.8h-9a1.9 1.9 0 0 1 0-3.8zM9.5 3.2v3.8M14.5 3.2v3.8M7 7h10a2.2 2.2 0 0 1 2.2 2.2v8.6a3 3 0 0 1-3 3H7.8a3 3 0 0 1-3-3V9.2A2.2 2.2 0 0 1 7 7zM4.8 11.6c2.2 2.6 12.2 2.6 14.4 0M12 7v6.4M10.4 13.4h3.2v3.2h-3.2z'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7.5 3.2h9a1.9 1.9 0 0 1 0 3.8h-9a1.9 1.9 0 0 1 0-3.8zM9.5 3.2v3.8M14.5 3.2v3.8M7 7h10a2.2 2.2 0 0 1 2.2 2.2v8.6a3 3 0 0 1-3 3H7.8a3 3 0 0 1-3-3V9.2A2.2 2.2 0 0 1 7 7zM4.8 11.6c2.2 2.6 12.2 2.6 14.4 0M12 7v6.4M10.4 13.4h3.2v3.2h-3.2z'/%3E%3C/svg%3E")}
.panel.m29>.mgrp .chip[data-arg="quests"]::before{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 4.5h9.5a2 2 0 0 1 2 2V8h-3.2M8 4.5a2 2 0 0 0-2 2v9.8M8 4.5a2 2 0 0 1 2 2v11a2 2 0 0 0 2 2h4.3a2 2 0 0 0 2-2V8M10 19.5H6.5a2 2 0 0 1-2-2v-1.2H10M12.5 9.5h3.3M12.5 12.5h3.3'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 4.5h9.5a2 2 0 0 1 2 2V8h-3.2M8 4.5a2 2 0 0 0-2 2v9.8M8 4.5a2 2 0 0 1 2 2v11a2 2 0 0 0 2 2h4.3a2 2 0 0 0 2-2V8M10 19.5H6.5a2 2 0 0 1-2-2v-1.2H10M12.5 9.5h3.3M12.5 12.5h3.3'/%3E%3C/svg%3E")}
.panel.m29>.mgrp .chip[data-arg="map"]::before{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM15.2 8.8l-1.8 4.6-4.6 1.8 1.8-4.6zM12 3.5v1.8M12 18.7v1.8M3.5 12h1.8M18.7 12h1.8'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM15.2 8.8l-1.8 4.6-4.6 1.8 1.8-4.6zM12 3.5v1.8M12 18.7v1.8M3.5 12h1.8M18.7 12h1.8'/%3E%3C/svg%3E")}
.panel.m29>.mgrp .chip.on{color:#ffe9a6;background:none;box-shadow:none;border:0}
.panel.m29>.mgrp .chip.on::after{content:"";position:absolute;top:0;left:22%;right:22%;height:3px;border-radius:0 0 3px 3px;background:#e9c463}
.panel.m29>.mgrp .chip[data-arg="records"],.panel.m29>.mgrp .chip[data-arg="guides"],.panel.m29>.mgrp .chip[data-arg="settings"]{display:none}
.panel.m29>.mgrp .m29bd{position:absolute;top:5px;left:54%;min-width:16px;height:16px;box-sizing:border-box;border-radius:8px;background:#e0524f;color:#fff;font:800 .6rem/16px var(--fb);padding:0 4px}
.panel.m29>.m29more{position:fixed;right:6px;bottom:calc(64px + env(safe-area-inset-bottom,0px));z-index:31;display:grid;gap:6px;min-width:170px;padding:8px;border-radius:12px;background:#121c36;border:1px solid #a48bff;box-shadow:0 10px 30px rgba(0,0,0,.6)}
.panel.m29>.m29more .btn{min-height:44px;justify-content:flex-start}
.panel.m29>.msub{position:sticky;top:46px;z-index:7;display:flex;flex-wrap:nowrap;gap:6px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;margin:0 -10px 6px;padding:6px 10px;border:0;background:#0b1122}
.panel.m29>.msub::-webkit-scrollbar,.panel.m29 .nbsec::-webkit-scrollbar,.panel.m29 .ptools::-webkit-scrollbar{display:none}
.panel.m29>.msub .chip{flex:none;border-radius:20px;white-space:nowrap}
.panel.m29 .nbsec{display:flex;flex-wrap:nowrap;gap:6px;overflow-x:auto;scrollbar-width:none;margin-left:-10px;margin-right:-10px;padding-left:10px;padding-right:10px}
.panel.m29 .nbsec .chip{flex:none;white-space:nowrap}
.panel.m29 .ptools{display:flex;flex-wrap:nowrap;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 -10px 6px;padding:0 10px}
.panel.m29 .ptools .btn{flex:none;white-space:nowrap}
.panel.m29 .swgridwrap>h4{margin:6px 0 4px}
.panel.m29 .swlist .swb.xpb{display:none}
.panel.m29 .swlist .swbtns{display:grid;grid-template-columns:1fr 1fr;gap:3px;padding:2px 3px 3px}
.panel.m29 .swlist.g3{grid-template-columns:repeat(3,minmax(0,1fr))}
.panel.m29 .swlist .swc{min-width:0}
.panel.m29 .swlist .swc .swbtns .btn.sm{min-width:0;width:auto;min-height:40px;padding:0;font-size:.7rem}
.panel.m29 .ddbar{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:6px}
.panel.m29 .ddbar .dd{min-width:0;margin:0}
.panel.m29 .rows>.row{outline:0}
.panel.m29 .rows>.row small{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.panel.m29 .rows>.row.m29x small{-webkit-line-clamp:unset;overflow:visible}
`;document.head.appendChild(st);}
try{window.__M29={M29,on:m29On,pass:m29Pass};}catch(e){}
