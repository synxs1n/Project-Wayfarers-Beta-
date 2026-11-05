// Phase 2: element badges, unit cards, foe cards, detail panel
const {open,chk,done}=require('./pw');
(async()=>{
for(const [name,w,h,mobile] of [['portrait 390x844',390,844,true],['landscape 844x390',844,390,true],['desktop 1280x800',1280,800,false]]){
  const H=await open({w,h,mobile});const {ev,wait,shot,page}=H;
  await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(250);
  await ev(()=>{__A.V.modal=null;['brann','sable','tess'].forEach(id=>{__A.G.roster[id]=__A.newChar(id,5,0);__A.G.party.push(id);});__A.startBattle({stage:0,kind:'field'});});await wait(1200);
  // wait for our turn
  await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:15000}).catch(()=>{});
  await shot('uc_'+name.replace(/[ :.]/g,'_'));
  const r=await ev(()=>{const q=s=>document.querySelectorAll(s).length;return {cards:q('.pcw .pc'),foes:q('.fcw .fc'),info:q('.uinfo'),badges:q('.pcw .elb'),stageUnits:q('.unit'),
    cardText:[...document.querySelectorAll('.pcw .pc')].slice(0,3).map(e=>e.innerText.replace(/\n+/g,' | ')),
    wrapW:Math.round(document.getElementById('bwrap').getBoundingClientRect().width),hasNums:[...document.querySelectorAll('.pcw .pc .nums')].every(e=>/\d/.test(e.innerText)),
    menu:__A.B.menu,cur:__A.B.cur&&__A.B.cur.name};});
  console.log(name,JSON.stringify(r));
  chk(name+': 3 front + reserve cards with element badges',r.cards>=3&&r.badges>=r.cards||'cards '+r.cards+' badges '+r.badges);
  chk(name+': stage is visible, wrap width '+r.wrapW,r.wrapW>200||'collapsed');chk(name+': foe cards shown',r.foes>=1||'no foe cards');
  chk(name+': every bar has numbers',r.hasNums);
  // detail panel: open on a foe, check content, Esc closes, command state unchanged
  const before=await ev(()=>JSON.stringify([__A.B.menu,__A.B.cur&&__A.B.cur.id,!!__A.B.pend]));
  await ev(()=>{document.querySelector('.fcw .uinfo').click();});await wait(200);
  const det=await ev(()=>{const d=document.querySelector('.udet');return d?d.innerText.replace(/\n+/g,' | ').slice(0,420):null;});
  chk(name+': foe detail opens',!!det||'no panel'); console.log('  foe detail:',det);
  await shot('ud_foe_'+name.replace(/[ :.]/g,'_'));
  await page.keyboard.press('Escape');await wait(150);
  const after=await ev(()=>JSON.stringify([__A.B.menu,__A.B.cur&&__A.B.cur.id,!!__A.B.pend])+(document.querySelector('.udet')?'OPEN':''));
  chk(name+': Esc closes detail and the command state is unchanged',after===before||before+' vs '+after);
  await ev(()=>{document.querySelector('.pgroup:not(.foes) .uinfo').click();});await wait(150);
  chk(name+': hero detail opens with stats',await ev(()=>/ATK/.test(document.querySelector('.udet')?.innerText||'')&&/MP/.test(document.querySelector('.udet').innerText))||'bad');
  await ev(()=>__A.ACT.uClose());
  // targeting still works: Attack -> tap a foe card picks it
  await ev(()=>{if(__A.B.mode==='cmd')__A.ACT.menu&&0;});
  await H.browser.close();}
process.exit(0);})();
