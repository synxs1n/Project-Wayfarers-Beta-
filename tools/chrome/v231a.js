// v0.22.62 (panel62.js): the battle card column: foes first, tags inside their card, groups that fold, a column that scrolls, Settings > Battle panel.
//  1 1000x720 (a tablet sideways), six heroes: the Foes group is above the Vanguard and the Rearguard; every foe's tag row is inside its
//    card wrapper (it was pushed under the next card); no group is squeezed (none scrolls inside itself)
//  2 the Rearguard starts folded (slim rows, no MP bar); a tap on its heading opens it, the choice is kept in META.cfg.bfold and a new render keeps it
//  3 on a short screen (1000x600) the column scrolls and shows the more-below fade; scrolled to the end the fade goes
//  4 Settings > Battle panel: Popup: no column at 1000x720, the Party & foes command is back; the Settings window has the row; a phone
//    keeps the popup
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v231a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v231a ran over 240 s');process.exit(1);},240000).unref();
const META=m=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:2,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false,goals:false${m?`,bpanel:'${m}'`:''}}}));`;
const boot=async(w,h,m)=>{const H=await open({w,h,mobile:true,pre:META(m),tag:'v231a'});
  await H.ev(()=>{const A=__A,T=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;
    Object.keys(T('TPL')).filter(id=>!A.G.roster[id]).slice(0,3).forEach(id=>{A.G.roster[id]=T('newChar')(id,3,0);A.G.party.push(id);});
    Object.values(A.G.roster).forEach(c=>{c.lv=30;c.S=T('calcStats')(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});A.G.stage=1;A.G.cleared=[1,0,0,0,0];T('startBattle')({stage:1,kind:'wild'});
    A.B.en.forEach(e=>{try{const b=T('bestEntry')(e);b.known=b.known||{};Object.keys(T('EL')).forEach(k=>b.known[k]=1);}catch(x){}});A.render();});
  for(let i=0;i<60;i++){await H.wait(300);if(await H.ev(()=>{const B=__A.B;return !!(B&&B.cur&&B.cur.side==='p'&&B.mode==='cmd'&&document.querySelector('#bcmd [data-arg="skills"]'));}))break;}
  await H.ev(()=>__A.TW.get('renderBattle')());await H.wait(400);return H;};
const snap=()=>{const bp=document.getElementById('bparty'),bat=document.querySelector('.battle.b3'),r=e=>{const b=e.getBoundingClientRect();return {t:Math.round(b.top),b:Math.round(b.bottom)};},g=s=>bp.querySelector(s);
  const fo=g('.pgroup.foes'),he=g('.pgroup.heroes'),rs=g('.pgroup.rsv');
  return {on:bat.classList.contains('b48'),pf:!!document.querySelector('#bcmd .b27pf'),foes:fo&&r(fo),heroes:he&&r(he),rsv:rs&&r(rs),
    tagsOut:[...bp.querySelectorAll('.fcw')].filter(w=>{const t=w.querySelector('.ptags');return t&&t.children.length&&t.getBoundingClientRect().bottom>w.getBoundingClientRect().bottom+1;}).length,tagged:[...bp.querySelectorAll('.fcw .ptags')].filter(t=>t.children.length).length,
    squeezed:[...bp.querySelectorAll('.pgroup')].filter(x=>x.scrollHeight-x.clientHeight>3).length,rsFold:!!rs&&rs.classList.contains('p62c'),rsMp:rs?[...rs.querySelectorAll('.ucr')].filter(u=>u.offsetHeight>0).length:0,rsN:rs?rs.querySelectorAll('.pc').length:0,
    sh:bp.scrollHeight,ch:bp.clientHeight,more:bp.classList.contains('p62more'),fold:__A.META.cfg.bfold||null,err:window.__P62.P62.err||null};};
(async()=>{let H=await boot(1000,720);let a=await H.ev(snap);
  chk(`1 1000x720: the column is on (${a.on}); Foes ${a.foes.t}..${a.foes.b} above the Vanguard ${a.heroes.t}..${a.heroes.b} above the Rearguard ${a.rsv.t}..${a.rsv.b}`,a.on&&a.foes.b<=a.heroes.t&&a.heroes.b<=a.rsv.t&&!a.err||JSON.stringify(a));
  chk(`1 ${a.tagged} foe tag rows, ${a.tagsOut} outside their card; ${a.squeezed} squeezed groups`,a.tagged>0&&a.tagsOut===0&&a.squeezed===0||JSON.stringify(a));
  chk(`2 the Rearguard starts folded: ${a.rsN} slim rows with ${a.rsMp} bars (HP only)`,a.rsFold&&a.rsN===3&&a.rsMp===3||JSON.stringify(a));
  await H.ev(()=>document.querySelector('#bparty .pgroup.rsv h3').click());await H.wait(300);let b=await H.ev(snap);
  await H.ev(()=>__A.TW.get('renderBattle')());await H.wait(200);let c=await H.ev(snap);
  chk(`2 a tap on the heading opens it (${b.rsMp} bars), kept (${JSON.stringify(b.fold)}) and still open after a render (${!c.rsFold})`,!b.rsFold&&b.rsMp>=6&&b.fold&&b.fold.rsv===0&&!c.rsFold||JSON.stringify([b,c]));
  await H.ev(()=>document.querySelector('#bparty .pgroup.foes h3').click());await H.wait(300);b=await H.ev(snap);
  chk(`2 the Foes fold too (${b.foes.b-b.foes.t} px, was ${a.foes.b-a.foes.t})`,b.foes.b-b.foes.t<a.foes.b-a.foes.t-20||JSON.stringify(b));
  await H.browser.close();
  H=await boot(1000,600);await H.ev(()=>{document.querySelector('#bparty .pgroup.rsv h3').click();});await H.wait(300);a=await H.ev(snap);
  await H.ev(()=>{const bp=document.getElementById('bparty');bp.scrollTop=bp.scrollHeight;});await H.wait(200);b=await H.ev(snap);
  chk(`3 1000x600: the column scrolls (${a.sh} in ${a.ch}), nothing squeezed (${a.squeezed}), the fade is on (${a.more}) and off at the end (${b.more})`,a.on&&a.sh>a.ch+20&&a.squeezed===0&&a.more&&!b.more||JSON.stringify([a,b]));
  await H.browser.close();
  H=await boot(1000,720,'popup');a=await H.ev(snap);
  chk(`4 Popup at 1000x720: no column (${a.on}), the Party & foes command is there (${a.pf})`,!a.on&&a.pf||JSON.stringify(a));
  const row=await H.ev(()=>{const A=__A;A.B.uDet=null;A.V.modal={type:'settings'};A.render();const r=document.querySelector('.p62rows');return r?[...r.querySelectorAll('.chip')].map(x=>x.textContent+(x.classList.contains('on')?'*':'')).join(' '):null;});
  chk(`4 Settings has the Battle panel row (${row})`,row==='Side bar Popup*'||String(row));
  await H.browser.close();
  H=await boot(390,844);a=await H.ev(snap);
  chk(`4 a phone (390x844) keeps the popup: no column (${a.on}), the Party & foes command (${a.pf})`,!a.on&&a.pf||JSON.stringify(a));
  done(H);})();
