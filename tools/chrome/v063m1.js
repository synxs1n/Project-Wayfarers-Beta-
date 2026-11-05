// Beta v0.6.3 shops and menus, item 5: no clipped or cut text. Walks every main menu tab and every shop tab and section
// (plus the Inn, the equipment picker and a hero sheet) at 360x740, 390x844, 844x390, 933x705 (Galaxy Z Fold open) and 1280x800,
// and fails when:
//  - the panel sticks out of the visible screen, or its own scroll cannot reach its last line (content taller than the panel with no scroll);
//  - text is cut: an element with hidden overflow or an ellipsis whose text is wider or taller than its box;
//  - a text element sits outside the panel's sides.
// Every size runs twice: once plain, once with the browser bar showing (the visible viewport 110 px shorter than 100vh, as on
// Android Chrome and in the app). The second run is the owner's Fold report: on v0.6.2 the panel was sized from 100vh and its
// last rows were cut off below the visible screen.
// Usage: PWHTML=../../out/aurelis3.html node v063m1.js
const {open,chk,done}=require('./pw');
const SIZES=[[360,740],[390,844],[844,390],[933,705],[1280,800]];
const CUT=110;
(async()=>{let H;for(const [w,h] of SIZES)for(const bar of [0,1]){
  const pre=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off'}}));`+
    (bar?`(()=>{const real=window.visualViewport;Object.defineProperty(window,'visualViewport',{configurable:true,get:()=>({height:innerHeight-${CUT},width:innerWidth,offsetTop:0,addEventListener(){},removeEventListener(){}})});
      document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#modal .modal{bottom:${CUT}px}';document.head.appendChild(s);});})();`:'');
  H=await open({w,h,mobile:w<1000,pre});const {ev,wait}=H;await H.page.emulateMedia({reducedMotion:'reduce'});const tag=w+'x'+h+(bar?' with the browser bar':'');
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=98765;A.G.stage=1;
    ['brann','sable','tess'].forEach(id=>{if(!A.G.roster[id]){A.G.roster[id]=A.newChar(id,3,0);A.G.party.push(id);}});
    ['w_blade_0','a_mail_0','k_cape_0','c_vital','w_staff_1','a_robe_1'].forEach(g=>A.G.gear.push(g));['healroot','oak','copper','fang','bluecap'].forEach(k=>A.G.mats[k]=6);A.render();});
  await wait(300);
  const screens=await ev(()=>{const M=window.__M3,L=[];if(!M){/* an older build (before v0.6.3): the v0.5.3 list */['party','roster','loadouts','comp','equip','items','next','lore','types','fmis','help','system','beasts','codex','factions','quests','map','settings'].forEach(t=>L.push({type:'menu',tab:t}));['weapons','armor','craft','forge','mats','sell'].forEach(t=>L.push({type:'smithy',tab:t}));['shop','relit','craft','herbs','sell','pouch'].forEach(t=>L.push({type:'workshop',tab:t}));['recruit','nature','personal','bounties','arena'].forEach(t=>L.push({type:'guild',tab:t}));L.push({type:'tavern'},{type:'board'},{type:'inn'});return L;}M.MENU_GROUPS.forEach(g=>g[2].forEach(t=>L.push({type:'menu',tab:t})));
    ['smithy','workshop','guild','tavern','board'].forEach(t=>{const T=M.m3Tabs(t);(T.length?T:[[null]]).forEach(([tab])=>{let S=[];try{S=M.m3Secs(t,tab);}catch(e){}(S.length?S:[['all']]).forEach(([sec])=>L.push({type:t,tab,sec}));});});
    L.push({type:'inn'},{type:'eqPick',char:'mira',slot:'w'},{type:'char',char:'mira'});return L;});
  const bad=[];
  for(const s of screens){
    const r=await ev(async s=>{try{__A.V.modal=JSON.parse(JSON.stringify(s));if(s.type==='menu')__A.V.lastMenuTab=s.tab;__A.render();}catch(e){return ['error '+e.message];}
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      const o=[],b=document.querySelector('#modal .box');if(!b)return ['no panel'];
      const vh=window.visualViewport?visualViewport.height:innerHeight,br=b.getBoundingClientRect();
      if(br.bottom>vh+1)o.push(`panel bottom ${Math.round(br.bottom)} below the visible screen ${Math.round(vh)}`);
      if(br.top<-1)o.push(`panel top ${Math.round(br.top)} above the screen`);
      const cs=getComputedStyle(b);if(b.scrollWidth>b.clientWidth+1)o.push(`panel scrolls sideways ${b.scrollWidth}>${b.clientWidth}`);if(b.scrollHeight>b.clientHeight+1&&!/auto|scroll/.test(cs.overflowY))o.push('panel content taller than the panel and no scroll');
      b.scrollTop=b.scrollHeight;await new Promise(r=>requestAnimationFrame(r));
      if(b.scrollTop+b.clientHeight<b.scrollHeight-2)o.push(`panel scroll stops ${Math.round(b.scrollHeight-b.scrollTop-b.clientHeight)} px short of the end`);
      const last=[...b.querySelectorAll(':scope > *')].filter(e=>e.getBoundingClientRect().height>0).pop();
      if(last){const lr=last.getBoundingClientRect();if(lr.bottom>Math.min(br.bottom,vh)+1)o.push(`last line ends at ${Math.round(lr.bottom)}, panel shows up to ${Math.round(Math.min(br.bottom,vh))}`);}
      const left=br.left,right=br.right;// the sticky title runs to the panel's edges by design
      const txt=[...b.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&!e.closest('.mnav,.sr,select,option,details:not([open])>:not(summary)'));
      for(const e of txt){const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const st=getComputedStyle(e);if(st.visibility==='hidden')continue;
        const label=(e.className&&typeof e.className==='string'?e.className.split(' ')[0]+' ':'')+'"'+e.textContent.trim().slice(0,24)+'"';
        if((st.overflowX!=='visible'||st.textOverflow==='ellipsis')&&e.scrollWidth>e.clientWidth+1)o.push('text cut sideways: '+label);
        if(st.overflowY==='hidden'&&e.scrollHeight>e.clientHeight+2&&e!==b)o.push('text cut at the bottom: '+label);
        if(r.right>right+1||r.left<left-1)o.push(`outside the panel (${Math.round(r.left)}..${Math.round(r.right)} vs ${Math.round(left)}..${Math.round(right)}): ${label}`);
        if(o.length>6)break;}
      // dropdowns: the chosen option must fit its box
      document.querySelectorAll('#modal select').forEach(sel=>{const c=document.createElement('canvas').getContext('2d'),st=getComputedStyle(sel);c.font=`${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
        const need=c.measureText(sel.options[sel.selectedIndex]?sel.options[sel.selectedIndex].text:'').width+parseFloat(st.paddingLeft)+parseFloat(st.paddingRight);
        if(need>sel.clientWidth+2)o.push(`dropdown text cut: "${sel.options[sel.selectedIndex].text}" needs ${Math.round(need)} px, has ${sel.clientWidth}`);});
      return o;},s);
    if(r.length)bad.push(JSON.stringify(s)+': '+r.slice(0,3).join('; '));}
  chk(`${tag}: ${screens.length} menu and shop screens, nothing clipped or cut`,bad.length===0||bad.length+' screens: '+bad.slice(0,5).join(' | '));
  await H.browser.close();}
  await done(H);})();
