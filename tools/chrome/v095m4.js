// Beta v0.9.5 menus: the new screens fit with no clipped text at 344x882, 390x844, 412x812, 705x455, 844x390, 933x705 and 1280x720.
// Walks every Notice Board tab and section (town board, Guild Hall, Menu > Quests), the guild ranks, the Upgrade popup for each slot,
// the hero sheet with its Upgrade buttons, the Smithy's best per slot list, Alchemy's charms, the Party and Equipment tabs, and the
// whole party plan. Same checks as v063m1: panel inside the visible screen, scroll reaches the end, nothing sideways, no text cut by
// hidden overflow or an ellipsis, no text outside the panel, dropdown choices fit. Also no page errors.
// Usage: PWHTML=../../out/aurelis3.html node v095m4.js
const {open,chk,done}=require('./pw');
const SIZES=[[344,882],[390,844],[412,812],[705,455],[844,390],[933,705],[1280,720]];
(async()=>{let H;for(const [w,h] of SIZES){
  const pre=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off'}}));`;
  H=await open({w,h,mobile:w<1000,pre});const {ev}=H;await H.page.emulateMedia({reducedMotion:'reduce'});const tag=w+'x'+h;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;G.gold=98765;G.stage=1;G.cleared[0]=1;
    ['brann','sable','tess'].forEach(id=>{if(!G.roster[id]){G.roster[id]=A.newChar(id,3,0);G.party.push(id);}});G.roster.vaelith||0;
    ['w_blade_0','a_mail_0','k_cape_0','c_vital','w_staff_1','a_robe_1'].forEach(g=>G.gear.push(g));['healroot','oak','copper','fang','bluecap','ichor','hide','scale','grit','iron','ash'].forEach(k=>G.mats[k]=6);
    // some quests ready, active and done; missions in every state; a bounty hunted
    for(let s=0;s<=G.stage;s++){A.genQuests(s);A.TW.get('genBounties')(s);}const Q=G.quests.filter(q=>q.stage<=G.stage);Q.forEach((q,i)=>{if(i%3===0){q.state='active';if(q.type==='hunt')q.have=q.n;}});
    const f=A.facInit();A.FAC.forEach(F=>A.facMissionList(F.id).forEach((m,i)=>{if(i===0){f.acc[m.id]=0;f.ctr[m.k]=(f.ctr[m.k]||0)+m.n;}}));f.bonus.smiths=420;f.bonus.guild=60;
    if(G.bounties[0])G.bounties[0].state='active';A.render();});
  const screens=await ev(()=>{const A=__A,M=window.__M3,L=[];
    ['board','guild'].forEach(t=>M.m3Tabs(t).forEach(([tab])=>{let S=[];try{S=M.m3Secs(t,tab);}catch(e){}(S.length?S:[['all']]).forEach(([sec])=>L.push({type:t,tab,sec}));}));
    Object.keys(M.NB_MENU).forEach(tab=>{const S=M.nbSecs(M.NB_MENU[tab]);(S.length?S:[['all']]).forEach(([sec])=>L.push({type:'menu',tab,sec}));});
    L.push({type:'menu',tab:'party'},{type:'menu',tab:'equip'},{type:'smithy'},{type:'smithy',tab:'shop',sec:'weapons'},{type:'smithy',tab:'craft'},{type:'workshop',tab:'shop',sec:'charm'});
    A.G.party.forEach(id=>L.push({type:'char',char:id}));A.G.party.slice(0,3).forEach(id=>['w','a','c','k'].forEach(sl=>L.push({type:'upg',cid:id,sl})));
    L.push({type:'p3plan',plan:window.__P3.p3SmithPlan(),from:{type:'smithy'}});return L;});
  const bad=[];
  for(const s of screens){
    const r=await ev(async s=>{try{__A.V.modal=JSON.parse(JSON.stringify(s));if(s.type==='menu')__A.V.lastMenuTab=s.tab;__A.render();}catch(e){return ['error '+e.message];}
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      const o=[],b=document.querySelector('#modal .box');if(!b)return ['no panel'];
      const vh=window.visualViewport?visualViewport.height:innerHeight,br=b.getBoundingClientRect();
      if(br.bottom>vh+1)o.push(`panel bottom ${Math.round(br.bottom)} below the visible screen ${Math.round(vh)}`);
      if(br.top<-1)o.push(`panel top ${Math.round(br.top)} above the screen`);
      if(br.right>innerWidth+1||br.left<-1)o.push('panel wider than the screen');
      const cs=getComputedStyle(b);if(b.scrollWidth>b.clientWidth+1)o.push(`panel scrolls sideways ${b.scrollWidth}>${b.clientWidth}`);if(b.scrollHeight>b.clientHeight+1&&!/auto|scroll/.test(cs.overflowY))o.push('panel content taller than the panel and no scroll');
      b.scrollTop=b.scrollHeight;await new Promise(r=>requestAnimationFrame(r));
      if(b.scrollTop+b.clientHeight<b.scrollHeight-2)o.push(`panel scroll stops ${Math.round(b.scrollHeight-b.scrollTop-b.clientHeight)} px short of the end`);
      const last=[...b.querySelectorAll(':scope > *')].filter(e=>e.getBoundingClientRect().height>0).pop();
      if(last){const lr=last.getBoundingClientRect();if(lr.bottom>Math.min(br.bottom,vh)+1)o.push(`last line ends at ${Math.round(lr.bottom)}, panel shows up to ${Math.round(Math.min(br.bottom,vh))}`);}
      const left=br.left,right=br.right;
      const txt=[...b.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&!e.closest('.mnav,.sr,select,option,details:not([open])>:not(summary)'));
      for(const e of txt){const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const st=getComputedStyle(e);if(st.visibility==='hidden')continue;
        const label=(e.className&&typeof e.className==='string'?e.className.split(' ')[0]+' ':'')+'"'+e.textContent.trim().slice(0,24)+'"';
        if((st.overflowX!=='visible'||st.textOverflow==='ellipsis')&&e.scrollWidth>e.clientWidth+1)o.push('text cut sideways: '+label);
        if(st.overflowY==='hidden'&&e.scrollHeight>e.clientHeight+2&&e!==b)o.push('text cut at the bottom: '+label);
        if(r.right>right+1||r.left<left-1)o.push(`outside the panel (${Math.round(r.left)}..${Math.round(r.right)} vs ${Math.round(left)}..${Math.round(right)}): ${label}`);
        if(o.length>6)break;}
      // buttons keep their words on the button
      b.querySelectorAll('.btn').forEach(x=>{if(x.scrollWidth>x.clientWidth+1&&o.length<8)o.push('button text wider than the button: "'+x.textContent.trim().slice(0,24)+'"');});
      document.querySelectorAll('#modal select').forEach(sel=>{const c=document.createElement('canvas').getContext('2d'),st=getComputedStyle(sel);c.font=`${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
        const need=c.measureText(sel.options[sel.selectedIndex]?sel.options[sel.selectedIndex].text:'').width+parseFloat(st.paddingLeft)+parseFloat(st.paddingRight);
        if(need>sel.clientWidth+2)o.push(`dropdown text cut: "${sel.options[sel.selectedIndex].text}" needs ${Math.round(need)} px, has ${sel.clientWidth}`);});
      return o;},s);
    if(r.length)bad.push(JSON.stringify(s).slice(0,80)+': '+r.slice(0,3).join('; '));}
  chk(`${tag}: ${screens.length} board, guild, upgrade and party screens, nothing clipped or cut`,bad.length===0||bad.length+' screens: '+bad.slice(0,5).join(' | '));
  await H.browser.close();}
  await done(H);})();
