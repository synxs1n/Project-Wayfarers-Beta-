// gear16.js: the owner's playtest notes on equipment, shops and the party buttons. Checks:
//  1. the Menu's group tabs take taps while a first realm hint is up (the hint lay over Backpack and Quests on a phone): 390x844 touch and
//     1000x560 mouse, in town and in a field, Unified look on and off; the hint is put away while a window is open, nothing outside the
//     window covers a button of it, and the hint is back when the window closes
//  2. "Upgrade whole party": one press takes every step it can pay for (a hand-me-down a first round frees is given in the same press), and
//     a plan made right after it finds nothing, at several realms and purses; Undo puts everyone's gear back
//  3. every stat a piece changes is listed with a sign, gains and losses, secondary stats and element resistances too, on the equip
//     picker, the shop, the forge, Tempering and "Equip this now?"; nothing runs off the window on a phone
//  4. Equip Best and Build party (Apply) pressed in the Menu close it with a toast; from another window they keep their result page;
//     Backpack > Equipment offers Undo for the last Equip Best
//  5. rarity by progress: Common and Uncommon in realm 1, one more per realm, all six from realm 5, for the shelves, the recipes, mimic
//     loot, vault and bounty charms and the one-per-realm charms; New Game+ the same, the Daily Trial open; owned gear stays through a save
//  6. a piece at +0 beats the rarity below at +3 in its main stats, for every weapon and armour family and the capes, every tier
// Usage (from tools/chrome): PWHTML=<abs path>/out/aurelis3.html node v188a.js [ONLY=1,...,6]
const {open,chk,done}=require('./pw');
const only=process.env.ONLY||'',want=n=>!only||only.split(',').includes(n);
setTimeout(()=>{console.log('FAIL watchdog: v188a ran over 420 s');process.exit(1);},420000).unref();
const QUIET="localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,hints:false,tips:false,rmotion:true}}));(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();";// sections 2 to 6 run on a seeded Math.random (natures, draws)
async function boot(o){const H=await open(o);
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
  await H.until(()=>__A.V.screen==='world',null,{timeout:15000});await H.wait(400);return H;}
// buttons of the open window that something outside the window covers
const COVERED=()=>{const out=[],M=document.querySelector('#modal')||document.body;[...M.querySelectorAll('.mgrp button,.msub button')].forEach(b=>{const r=b.getBoundingClientRect();if(!r.width)return;
  const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(e&&e!==b&&!b.contains(e)&&!M.contains(e))out.push(b.textContent.trim()+' under '+(e.id||e.className||e.tagName));});return out;};
// a party of six at a realm, with a purse; everything else empty
const SETUP=`([stage,gold,mats])=>{const A=__A,G=A.G;G.stage=stage;G.cleared=[0,1,2,3,4].map(x=>x<stage);G.pcV=1;G.bossWon={0:1};
  const ids=['mira','lumen','oren'].concat(Object.keys(A.TPL).filter(id=>!['mira','lumen','oren'].includes(id)&&!A.TPL[id].mon&&!(A.LEGEND_IDS||[]).includes(id)).slice(3,6));
  G.roster={};G.party=[];ids.forEach(id=>{G.roster[id]=A.newChar(id,5+stage*8,Math.max(0,stage-1));G.party.push(id);});
  G.gold=gold;G.gear=[];Object.keys(A.MATS).forEach(k=>{G.mats[k]=mats;});Object.values(G.roster).forEach(A.refresh);A.V.modal={type:'smithy',tab:'shop',sec:'all'};A.render();return ids;}`;
(async()=>{
  // ---------- 1 ----------
  if(want('1'))for(const [w,h,mob] of [[390,844,true],[1000,560,false]]){
    const H=await boot({w,h,mobile:mob});// default settings: hints and tips on, the Unified look on
    for(const where of ['town','field'])for(const off of [false,true]){const tag=`${w}x${h} ${where} unified ${off?'off':'on'}`;
      await H.ev(([where,off])=>{const A=__A;if(window.__CH15)window.__CH15.off=off;A.V.modal=null;A.WS.dlg=null;
        if(where==='field'&&A.WS.m.kind!=='field'){const m=A.getMap('f0');A.placeAt('f0',m.start?m.start[0]:5,m.start?m.start[1]:5,'u');}A.render();},[where,off]);
      // a hint: the game's own if one comes, else one put up by hand
      let hint=await H.until(()=>{const d=document.getElementById('p2hint');return !!(d&&d.classList.contains('show')&&!d.classList.contains('ob'));},null,{timeout:2500});
      if(hint!==true)await H.ev(()=>{if(window.__OB&&__A.ACT.tipOk)try{__A.ACT.tipOk();}catch(e){}window.__P2.hintShow('v188','Test hint: a first realm hint long enough to take two or three lines on a phone, with its two buttons under it.');});
      await H.ev(()=>{__A.V.modal={type:'menu',tab:'party'};__A.render();});await H.wait(150);
      const st=await H.ev(()=>{const d=document.getElementById('p2hint');return {kind:__A.WS.m.kind,ch:document.body.classList.contains('ch15'),show:!!(d&&d.classList.contains('show')),disp:d?getComputedStyle(d).display:'',w:d?d.getBoundingClientRect().width:-1};});
      chk(`1 ${tag}: a hint is up and it is put away while the Menu is open (${st.kind}, ch15 ${st.ch}, display ${st.disp})`,st.kind===where&&st.ch===!off&&st.show&&st.disp==='none'&&st.w===0||JSON.stringify(st));
      const cov=await H.ev(COVERED);chk(`1 ${tag}: nothing outside the window covers a Menu tab`,cov.length===0||cov.join('; '));
      const got=[];for(const [name,grp] of [['Backpack','equip|items|pouch'],['Quests','.'],['Map','map'],['Records','.'],['Guides','.'],['Settings','settings'],['Party','party']]){
        const b=H.page.locator('#modal .mgrp .chip',{hasText:name}).first();let err='';try{if(mob)await b.tap({timeout:2500});else await b.click({timeout:2500});}catch(e){err=e.message.split('\n')[0];}
        await H.wait(80);const r=await H.ev(()=>({tab:__A.V.modal&&__A.V.modal.tab,on:(document.querySelector('#modal .mgrp .chip.on')||{}).textContent}));
        if(err||r.on!==name||!new RegExp('^('+grp+')').test(r.tab||''))got.push(name+': '+(err||JSON.stringify(r)));}
      chk(`1 ${tag}: Backpack, Quests, Map, Records, Guides, Settings and Party each open on a real ${mob?'tap':'click'}`,got.length===0||got.join('; '));
      const sub=await (async()=>{const b=H.page.locator('#modal .mgrp .chip',{hasText:'Backpack'}).first();if(mob)await b.tap({timeout:2500});else await b.click({timeout:2500});await H.wait(80);
        const out=[];for(const n of ['Items','Materials','Equipment']){const s=H.page.locator('#modal .msub .chip',{hasText:n}).first();try{if(mob)await s.tap({timeout:2500});else await s.click({timeout:2500});}catch(e){out.push(n+' no tap');continue;}await H.wait(60);
          const t=await H.ev(()=>__A.V.modal&&__A.V.modal.tab);if(t!=={Items:'items',Materials:'pouch',Equipment:'equip'}[n])out.push(n+' -> '+t);}return out;})();
      chk(`1 ${tag}: the Backpack's own tabs (Equipment, Items, Materials) open`,sub.length===0||sub.join('; '));
      // closing the Menu brings the hint back; Got it closes it
      await H.ev(()=>{__A.V.modal=null;__A.render();});
      const back=await H.ev(()=>{const d=document.getElementById('p2hint'),r=d.getBoundingClientRect();return d.classList.contains('show')&&getComputedStyle(d).display!=='none'&&r.width>80&&r.height>20;});
      await H.ev(()=>{__A.ACT.hintOk();__A.render();});
      const after=await H.ev(()=>{const d=document.getElementById('p2hint');return !d||!d.classList.contains('show');});chk(`1 ${tag}: the hint is back when the Menu closes, and Got it closes it`,back===true&&after===true||JSON.stringify({back,after}));
    }
    // a hint that comes up while the Menu is already open waits too, in a shop as well
    await H.ev(()=>{__A.V.modal={type:'menu',tab:'party'};__A.render();window.__A.ACT.hintOk();});
    await H.ev(()=>{window.__P2.hintShow('v188b','Late hint.');__A.render();});
    const lt=await H.ev(()=>{const d=document.getElementById('p2hint'),a=getComputedStyle(d).display;__A.V.modal={type:'smithy',tab:'shop',sec:'all'};__A.render();const b=getComputedStyle(d).display;__A.V.modal=null;__A.render();const c=getComputedStyle(d).display;__A.ACT.hintOk();return [a,b,c,d.classList.contains('show')].join(',');});
    chk(`1 ${w}x${h}: a hint shown under an open Menu waits, stays away in the Smithy and shows once the windows are closed (${lt})`,/^none,none,(?!none)\w+,false$/.test(lt)||lt);
    await H.browser.close();}

  const H=await boot({w:390,h:844,mobile:true,pre:QUIET});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource|net::/.test(m.text()))errs.push(m.text());});
  // ---------- 2 ----------
  if(want('2')){
    // the hand-me-down: a low level warrior in a Rare blade and a high level warrior in a Common one, gold for one Epic weapon
    const hd=await H.ev(()=>{const A=__A,G=A.G;G.stage=3;G.cleared=[true,true,true];G.pcV=1;G.bossWon={0:1};const W=Object.keys(A.TPL).filter(id=>A.TPL[id].cls==='warrior'&&!A.TPL[id].mon&&!(A.LEGEND_IDS||[]).includes(id)).slice(0,2);
      G.roster={};G.party=[];W.forEach((id,i)=>{const c=G.roster[id]=A.newChar(id,i?34:3,0);c.eq={w:i?'w_blade_0':'w_blade_2',a:'a_mail_3+3',c:null,k:'k_cape_3+3'};G.party.push(id);});
      Object.keys(A.MATS).forEach(k=>{G.mats[k]=0;});G.gear=[];G.gold=A.GEAR.w_blade_3.price;Object.values(G.roster).forEach(A.refresh);A.V.modal={type:'smithy',tab:'shop',sec:'all'};A.render();
      const one=window.__G16.plan().picks.map(p=>p.cid+':'+p.id+':'+p.src);A.ACT.p3Smith();const P=A.V.modal.plan,all=P.picks.map(p=>p.cid+':'+p.id+':'+p.src+'@'+p.round);
      const eq0=W.map(id=>G.roster[id].eq.w),gear0=G.gear.slice(),gold0=G.gold;A.ACT.p3SmithGo();const m=A.V.modal,eq1=W.map(id=>G.roster[id].eq.w),again=window.__G16.plan().picks.length;
      const res={one,all,rounds:P.rounds,type:m&&m.type,p3:m&&m.p3,eq0,eq1,again,W,rows:(m.rows||[]).length};
      A.ACT.autoEqUndo();res.undo=W.map(id=>G.roster[id].eq.w);res.pack=G.gear.slice().sort();res.count=G.gear.length+W.reduce((s,id)=>s+Object.values(G.roster[id].eq).filter(Boolean).length,0);return res;});
    chk(`2 hand-me-down: a single round plans ${hd.one.length} step (${hd.one.join(', ')}), the whole plan ${hd.all.length} in ${hd.rounds} rounds (${hd.all.join(', ')})`,hd.one.length===1&&hd.all.length===2&&hd.rounds===2&&/:pack@2$/.test(hd.all[1])||JSON.stringify(hd));
    chk(`2 hand-me-down: one press and both wear the better blade (${hd.eq0.join(', ')} -> ${hd.eq1.join(', ')}), a plan right after finds nothing (${hd.again})`,hd.type==='autoEq'&&hd.eq1[1]==='w_blade_2'&&hd.eq1[0]!=='w_blade_2'&&hd.again===0&&hd.rows===2||JSON.stringify(hd));
    chk(`2 hand-me-down: Undo puts both back in what they wore and keeps what was bought in the pack (${hd.undo.join(', ')}; pack ${hd.pack.join(', ')})`,hd.undo[0]==='w_blade_2'&&hd.undo[1]==='w_blade_0'&&hd.pack.length===1&&hd.count===7||JSON.stringify(hd));
    // the general rule over realms and purses: the press spends, the next plan is empty, nothing is lost or doubled
    const out=[];for(const [stage,gold,mats] of [[0,400,60],[1,3000,60],[1,900,4],[2,9000,60],[2,60000,60],[3,20000,8],[4,200000,60]]){await H.ev(`(${SETUP})(${JSON.stringify([stage,gold,mats])})`);
      const r=await H.ev(()=>{const A=__A,G=A.G,cnt=()=>G.gear.length+Object.values(G.roster).reduce((s,c)=>s+Object.values(c.eq).filter(Boolean).length,0);
        A.ACT.p3Smith();const n1=A.V.modal.plan.picks.length,g0=G.gold,c0=cnt();A.ACT.p3SmithGo();const p3=A.V.modal.p3||{},c1=cnt();
        A.V.modal={type:'smithy',tab:'shop',sec:'all'};A.ACT.p3Smith();const n2=A.V.modal.plan.picks.length;A.V.modal=null;
        return {n1,n2,spent:g0-G.gold,gold:G.gold,done:p3.done,rounds:p3.rounds,stop:p3.stop,grew:c1-c0,bought:(p3.bought||0)+(p3.forged||0)};});
      out.push(`realm ${stage+1} with ${gold} gold: ${r.n1} planned, ${r.done} done in ${r.rounds} round${r.rounds===1?'':'s'}, ${r.spent} spent, then ${r.n2}`);
      chk(`2 realm ${stage+1}, ${gold} gold, ${mats} of each material: the press does ${r.done} step${r.done===1?'':'s'} (${r.rounds} round${r.rounds===1?'':'s'}, ${r.spent} gold), a second press finds nothing`,r.n2===0&&r.gold>=0&&!r.stop&&(r.n1===0||r.done>0)&&r.grew===r.bought||JSON.stringify(r));}
    // the charm plan at Alchemy runs the same loop
    await H.ev(`(${SETUP})([2,6000,60])`);
    const al=await H.ev(()=>{const A=__A;A.V.modal={type:'workshop',tab:'shop',sec:'charm'};A.ACT.p3Alch();const n1=A.V.modal.plan.picks.length;A.ACT.p3SmithGo();A.V.modal={type:'workshop',tab:'shop',sec:'charm'};A.ACT.p3Alch();const n2=A.V.modal.plan.picks.length;A.V.modal=null;return {n1,n2,c:Object.values(A.G.roster).filter(c=>c.eq.c).length};});
    chk(`2 Alchemy's Upgrade whole party: ${al.n1} charms planned, ${al.c} heroes wear one, a second press finds nothing`,al.n1>0&&al.c>0&&al.n2===0||JSON.stringify(al));
  }
  // ---------- 3 ----------
  if(want('3')){
    await H.ev(()=>{const A=__A,G=A.G;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await H.until(()=>__A.V.screen==='world',null,{timeout:15000});
    const d=await H.ev(()=>{const A=__A,G=A.G;G.stage=1;G.cleared=[true];G.gold=5000;G.gear=['w_staff_1','a_mail_1','c_swift','c_fire','w_mace_1+2','a_robe_0','c_clarity','a_robe_1'];Object.keys(A.MATS).forEach(k=>{G.mats[k]=30;});
      G.roster.oren.eq.w='w_lance_1';G.roster.oren.eq.a='a_mail_0';G.roster.mira.eq.w='w_tome_1';G.roster.mira.eq.c=null;Object.values(G.roster).forEach(A.refresh);A.render();
      const T=(c,id)=>window.__G16.deltas(G.roster[c],id).map(o=>o.t);const S0=G.roster.oren.S,g=A.gearOf('a_mail_1'),S1=A.calcStats(Object.assign({},G.roster.oren,{eq:Object.assign({},G.roster.oren.eq,{a:'a_mail_1'})}));
      return {mace:T('oren','w_mace_1+2'),staff:T('mira','w_staff_1'),fire:T('mira','c_fire'),clar:T('mira','c_clarity'),mail:T('oren','a_mail_1'),same:T('oren','w_lance_1'),
        real:{hp:Math.round(S1.mhp-S0.mhp),def:Math.round(S1.def-S0.def),res:Math.round(S1.res-S0.res),mp:Math.round(S1.mmp-S0.mmp),spd:S1.spd-S0.spd}};});
    const has=(L,re)=>L.some(t=>re.test(t));
    chk(`3 lance to mace for a knight lists gains and losses with signs: ${d.mace.join(', ')}`,has(d.mace,/^\+\d+ MAG$/)&&has(d.mace,/^−\d+ DEF$/)&&has(d.mace,/^−\d+% Charge dmg$/)&&has(d.mace,/^\+\d+% Stun chance$/)||d.mace.join(','));
    chk(`3 tome to staff for a mage: the lost MAG and spell damage and the gained MP and MP saving (${d.staff.join(', ')})`,has(d.staff,/^−\d+ MAG$/)&&has(d.staff,/^\+\d+ MP$/)&&has(d.staff,/^−\d+% Spell dmg$/)&&has(d.staff,/^\+\d+% MP saved$/)/* the amounts move with the hero's nature */||d.staff.join(','));
    chk(`3 an element charm shows its damage and its resistance (${d.fire.join(', ')}); the Clarity Charm its ailment guard (${d.clar.join(', ')})`,has(d.fire,/^\+\d+% Fire dmg$/)&&has(d.fire,/^\+\d+% Fire resist$/)&&has(d.clar,/^\+Ailment guard$/)||JSON.stringify([d.fire,d.clar]));
    const want2=[['HP',d.real.hp],['DEF',d.real.def],['RES',d.real.res],['MP',d.real.mp]].filter(x=>x[1]).map(([n,v])=>(v>0?'+':'−')+Math.abs(v)+' '+n);
    chk(`3 the amounts are the real stat changes (armour for the knight: ${d.mail.join(', ')} against calcStats ${want2.join(', ')}); the worn piece shows no change`,want2.every(t=>d.mail.includes(t))&&d.same.length===0||JSON.stringify([d.mail,want2,d.same]));
    const VIEW=()=>{const P=document.querySelector('#modal .panel')||document.querySelector('.modal .panel'),pr=P.getBoundingClientRect(),L=[...P.querySelectorAll('.g16d')];let off=0,small=0;L.forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&(r.right>pr.right+1||r.left<pr.left-1))off++;if(r.width&&parseFloat(getComputedStyle(e).fontSize)<9.5)small++;});
      return {n:L.length,up:P.querySelectorAll('.g16d.up').length,dn:P.querySelectorAll('.g16d.dn').length,off,small,sx:P.scrollWidth-P.clientWidth,vs:P.querySelectorAll('.g16vs').length,rar:(P.querySelector('.g16rar')||{}).textContent||''};};
    for(const [name,modal,need] of [['the equip picker (weapon)',{type:'eqPick',char:'oren',slot:'w',list:['oren']},'updn'],['the equip picker (charm)',{type:'eqPick',char:'mira',slot:'c',list:['mira']},'up'],
      ['the Smithy shop',{type:'smithy',tab:'shop',sec:'weapons'},'updn'],['the Smithy forge',{type:'smithy',tab:'craft',sec:'all'},'updn'],['Tempering',{type:'smithy',tab:'forge',sec:'all'},'up'],
      ['the Alchemy charm shelf',{type:'workshop',tab:'shop',sec:'charm'},'up'],['Equip this now? (loot)',{type:'equipNow',id:'w_mace_1+2',rest:[]},'updn']]){
      await H.ev(m=>{__A.V.cmp=null;__A.V.modal=m;__A.render();},modal);await H.wait(60);const v=await H.ev(VIEW);
      chk(`3 ${name} on a phone: ${v.n} signed stat changes (${v.up} gains, ${v.dn} losses), none off the window, none under 9.5 px, no sideways scroll`,v.n>0&&v.up>0&&(need==='up'||v.dn>0)&&v.off===0&&v.small===0&&v.sx<=1||JSON.stringify(v));}
    // a shelf piece nobody gains from still shows what it changes
    const ng=await H.ev(()=>{const A=__A,G=A.G;G.roster.oren.eq.w='w_lance_1+3';G.roster.mira.eq.w='w_tome_1+3';G.roster.lumen.eq.w='w_tome_1+3';Object.values(G.roster).forEach(A.refresh);A.V.modal={type:'smithy',tab:'shop',sec:'weapons'};A.render();
      const P=document.querySelector('#modal .panel');return {vs:P.querySelectorAll('.g16vs').length,dn:P.querySelectorAll('.g16vs .g16d.dn').length,txt:(P.querySelector('.g16vs')||{}).textContent||''};});
    chk(`3 shop rows nobody gains from show the change for who could wear them (${ng.vs} rows, ${ng.dn} losses listed)`,ng.vs>0&&ng.dn>0&&/Against what they wear/.test(ng.txt)||JSON.stringify(ng));
  }
  // ---------- 4 ----------
  if(want('4')){
    await H.ev(()=>{const A=__A,G=A.G;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await H.until(()=>__A.V.screen==='world',null,{timeout:15000});
    await H.ev(()=>{const A=__A,G=A.G;G.gear=['w_tome_1','a_mail_1','c_swift'];G.pcV=0;A.V.modal={type:'menu',tab:'equip'};A.render();});await H.wait(100);
    const eq0=await H.ev(()=>JSON.stringify(Object.values(__A.G.roster).map(c=>c.eq)));
    await H.page.locator('#modal button[data-act="autoEqParty"]').first().tap({timeout:3000});await H.wait(120);
    const e1=await H.ev(()=>({modal:__A.V.modal&&__A.V.modal.type,toast:document.getElementById('toast').textContent,show:document.getElementById('toast').className,worn:Object.values(__A.G.roster).filter(c=>c.eq.w==='w_tome_1'||c.eq.a==='a_mail_1'||c.eq.c==='c_swift').length}));
    chk(`4 Equip Best in Menu > Backpack: the gear is on (${e1.worn} heroes), the Menu is closed and a toast says so ("${e1.toast}")`,e1.modal==null&&e1.worn>0&&e1.show==='show'&&/^Equip Best: \d+ hero/.test(e1.toast)||JSON.stringify(e1));
    const u=await H.ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'equip'};A.render();const b=document.querySelector('#modal button[data-act="g16Undo"]');const had=!!b;if(b)A.ACT.g16Undo();return {had,eq:JSON.stringify(Object.values(A.G.roster).map(c=>c.eq)),pack:A.G.gear.slice().sort().join(','),still:!!document.querySelector('#modal button[data-act="g16Undo"]')};});
    chk('4 Backpack > Equipment offers Undo Equip Best, and it puts the gear back as it was',u.had&&u.eq===eq0&&u.pack==='a_mail_1,c_swift,w_tome_1'&&!u.still||JSON.stringify(u));
    await H.ev(()=>{__A.V.modal={type:'menu',tab:'party'};__A.render();});await H.wait(80);
    await H.page.locator('#modal button[data-act="autoEqParty"]').first().tap({timeout:3000});await H.wait(100);
    const e2=await H.ev(()=>({modal:__A.V.modal&&__A.V.modal.type,toast:document.getElementById('toast').textContent}));
    chk(`4 Equip Best on the Party tab closes the Menu too ("${e2.toast}")`,e2.modal==null&&/^Equip Best/.test(e2.toast)||JSON.stringify(e2));
    const e3=await H.ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'party'};A.render();A.ACT.autoEqParty();return {modal:A.V.modal&&A.V.modal.type,toast:document.getElementById('toast').textContent};});
    chk(`4 Equip Best with nothing to change still closes the Menu and says so ("${e3.toast}")`,e3.modal==null&&/already wears the best/.test(e3.toast)||JSON.stringify(e3));
    const e4=await H.ev(()=>{const A=__A;A.G.gear.push('w_tome_1');const eq=A.G.roster.mira.eq.w;A.V.modal={type:'smithy',tab:'shop',sec:'all'};A.render();A.ACT.autoEqParty();const t=A.V.modal&&A.V.modal.type;A.V.modal=null;A.render();return t;});
    chk('4 Equip Best from another window (not the Menu) keeps its result page with Undo',e4==='autoEq'||e4);
    // Build party: the Menu's button opens the formations; Apply closes everything with a toast
    await H.ev(()=>{const A=__A,G=A.G;['wren','kael','pip','brann','dagna'].filter(id=>A.TPL[id]&&!G.roster[id]).slice(0,4).forEach(id=>{G.roster[id]=A.newChar(id,3,0);});G.party=['mira','lumen','oren'];A.V.modal={type:'menu',tab:'party'};A.render();});await H.wait(80);
    await H.page.locator('#modal button[data-act="bpOpen"]').first().tap({timeout:3000});await H.wait(120);
    const b1=await H.ev(()=>({modal:__A.V.modal&&__A.V.modal.type,from:__A.V.modal&&__A.V.modal.from&&__A.V.modal.from.type,town:__A.WS.m.kind}));
    chk(`4 Build party in the Menu opens the formations (${b1.modal}, in a ${b1.town})`,b1.modal==='bp'&&b1.from==='menu'||JSON.stringify(b1));
    await H.page.locator('button[data-act="bpApply"]').first().tap({timeout:3000});await H.wait(150);
    const b2=await H.ev(()=>({modal:__A.V.modal&&__A.V.modal.type,toast:document.getElementById('toast').textContent,show:document.getElementById('toast').className,n:__A.G.party.length}));
    chk(`4 Apply builds the party (${b2.n} heroes), closes the Menu and a toast says so ("${b2.toast}")`,b2.modal==null&&b2.n>=3&&b2.show==='show'&&/^Party built: /.test(b2.toast)||JSON.stringify(b2));
  }
  // ---------- 5 ----------
  if(want('5')){
    await H.ev(()=>{const A=__A,G=A.G;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await H.until(()=>__A.V.screen==='world',null,{timeout:15000});
    const R=await H.ev(()=>{const A=__A,G=A.G,X=window.__G16,TI=g=>{const t=g.tier||0;return /_ef(\+\d)?$/.test(g.id)?6:t;},out=[];
      for(let s=0;s<5;s++)for(const beat of [0,1]){G.stage=s;G.cleared=[0,1,2,3,4].map(x=>x<s+beat);const cap=X.rarCap(),o={s,beat,cap,bad:[]};
        ['weapons','armor','charms'].forEach(tab=>A.shopStock(tab).forEach(id=>{const g=A.gearOf(id);if(g&&TI(g)>cap)o.bad.push('shop '+id);}));
        o.shopTop=Math.max(...['weapons','armor'].flatMap(t=>A.shopStock(t)).map(id=>A.gearOf(id).tier));
        A.RECIPES.forEach(r=>{if(r.id&&X.recipeOpen(r)){const g=A.gearOf(r.id);if(g&&TI(g)>cap)o.bad.push('recipe '+r.id);}});
        o.recTop=Math.max(...A.RECIPES.filter(r=>r.id&&/^[wa]_/.test(r.id)&&X.recipeOpen(r)).map(r=>A.gearOf(r.id).tier));
        const mim=X.rarLoot('w_blade',s+2,1);o.mim=mim;if(A.gearOf(mim).tier>cap)o.bad.push('mimic '+mim);
        X.rarPool(['c_str','c_int','c_vit','c_spi','c_agi','c_dex','c_luk']).forEach(id=>{if(A.gearOf(id).tier>cap)o.bad.push('vault '+id);});
        G.bounties=[];for(let i=0;i<6;i++)A.genBounties(s);(G.bounties||[]).forEach(b=>{const c=b.reward&&b.reward.charm;if(c&&A.gearOf(c)&&A.gearOf(c).tier>cap)o.bad.push('bounty '+c);});o.bn=(G.bounties||[]).length;
        ['c_cv'+s,'c_ft'+s].forEach(id=>{if(A.GEAR[id]&&A.GEAR[id].tier>Math.min(5,s+1))o.bad.push('realm charm '+id+' tier '+A.GEAR[id].tier);});
        o.fit=X.rarFit('w_blade_5+2');out.push(o);}
      return out;});
    R.filter(o=>!o.beat).forEach(o=>chk(`5 realm ${o.s+1}: rarity open up to index ${o.cap}; the shelves (top ${o.shopTop}), open recipes (top ${o.recTop}), mimic loot (${o.mim}), vault charms, ${o.bn} bounties and the realm's own charms stay under it`,o.cap===Math.min(5,o.s+1)&&o.bad.length===0&&o.bn>0||JSON.stringify(o)));
    const b=R.filter(o=>o.beat);chk(`5 beating a realm's boss opens the next rarity at once (caps ${b.map(o=>o.cap).join(', ')}) and nothing passes it`,b.every(o=>o.cap===Math.min(5,o.s+2)&&o.bad.length===0)||JSON.stringify(b.filter(o=>o.bad.length)));
    chk(`5 the first realm has Common and Uncommon only: a Mythic blade +2 is brought down to ${R[0].fit}, the mimic gives ${R[0].mim}`,R[0].cap===1&&R[0].fit==='w_blade_1+2'&&R[0].mim==='w_blade_1+2'||JSON.stringify(R[0]));
    const misc=await H.ev(()=>{const A=__A,G=A.G,X=window.__G16;G.stage=0;G.cleared=[];G.run.cycle=2;const ng=X.rarCap();G.run.cycle=0;G.daily=true;const dl=X.rarCap();G.daily=false;
      A.V.modal={type:'smithy',tab:'shop',sec:'weapons'};A.render();const note=(document.querySelector('#modal .g16rar')||{}).textContent||'';
      // owned gear above the cap stays, worn and in the pack, through a save
      G.gear=['w_tome_5+3','c_cv4'];G.roster.oren.eq.a='a_mail_4+2';const o=A.packG?JSON.parse(JSON.stringify(A.packG())):null;let g2=null;try{g2=o&&A.unpackG(o);}catch(e){g2={err:e.message};}
      const kept=g2&&g2.gear?g2.gear.slice().sort().join(',')+'|'+g2.roster.oren.eq.a:String(g2&&g2.err);const st=A.gearOf('w_tome_5+3'),ok=X.rarOk('w_tome_5+3');A.V.modal=null;A.render();
      return {ng,dl,note,kept,mag:st&&st.mag,ok,tiers:['c_cv0','c_cv1','c_cv2','c_cv4','c_ft0','c_ft1','c_ft3'].map(id=>A.GEAR[id].tier).join(',')};});
    chk(`5 New Game+ follows the same rule (cap ${misc.ng} in its first realm), the Daily Trial is open (${misc.dl}); the shop says what is open ("${misc.note}")`,misc.ng===1&&misc.dl===5&&/up to .*Uncommon.*Rare gear opens/.test(misc.note)||JSON.stringify(misc));
    chk(`5 gear owned above the cap stays through a save, worn and in the pack (${misc.kept}); the one-per-realm charms carry their realm's rarity (${misc.tiers})`,misc.kept==='c_cv4,w_tome_5+3|a_mail_4+2'&&misc.mag>0&&misc.tiers==='1,2,3,3,1,2,3'||JSON.stringify(misc));
  }
  // ---------- 6 ----------
  if(want('6')){
    const T=await H.ev(()=>{const A=__A,fams={};Object.keys(A.GEAR).forEach(id=>{const m=id.match(/^([wak]_[a-z]+)_(\d)$/);if(m)(fams[m[1]]=fams[m[1]]||[])[+m[2]]=id;});
      const main=g=>{if(g.slot==='k')return ['hp','res'].filter(s=>g[s]>0);const big=Math.max(...['atk','mag','def','res'].map(s=>g[s]||0));return ['atk','mag','def','res'].filter(s=>g[s]>0&&g[s]>=big*.5);};
      const bad=[],slots={},per={};let n=0,worst=9,wk='';
      Object.keys(fams).forEach(f=>{for(let t=1;t<6;t++){const lo=A.gearOf(fams[f][t-1]+'+3'),hi=A.gearOf(fams[f][t]);if(!lo||!hi){bad.push(f+' tier '+t+' missing');continue;}
        slots[hi.slot]=(slots[hi.slot]||0)+1;per[t]=(per[t]||0)+1;main(A.GEAR[fams[f][t-1]]).forEach(s=>{n++;const r=hi[s]/lo[s];if(r<worst){worst=r;wk=f+'_'+t+'.'+s+' '+hi[s]+' vs '+lo[s];}if(!(hi[s]>lo[s]))bad.push(f+'_'+t+'.'+s+' '+hi[s]+' <= '+lo[s]+' (+3 of the tier below)');});}});
      const ef=A.gearOf('w_blade_ef'),top=A.gearOf('w_blade_5+3');
      return {bad,n,fam:Object.keys(fams).length,slots,per,worst,wk,step:window.__G16.FORGE_STEP,p3:A.gearOf('w_blade_2+3').atk,p0:A.GEAR.w_blade_2.atk,ef:ef&&ef.atk,top:top.atk};});
    chk(`6 every family (${T.fam}: ${JSON.stringify(T.slots)} family tiers by slot) and tier 1 to 5: +0 beats the rarity below at +3 in its main stats (${T.n} comparisons, closest ${T.wk})`,T.bad.length===0&&T.fam>=29&&[1,2,3,4,5].every(t=>T.per[t]===T.fam)&&T.slots.w>=120&&T.slots.a===15&&T.slots.k===5||T.bad.slice(0,12).join('; ')||JSON.stringify(T));
    chk(`6 tempering still adds (${T.p0} ATK -> ${T.p3} at +3, ${Math.round(T.step*100)}% a level) and Echoforged stays above the top shop piece at +3 (${T.ef} vs ${T.top})`,T.p3>T.p0&&T.step>0&&T.ef>T.top||JSON.stringify(T));
  }
  chk('no page console errors',errs.length===0||errs.slice(0,3).join(' | '));
  await done(H);
})().catch(e=>{console.log('FAIL crashed: '+(e&&e.stack||e));process.exit(1);});
