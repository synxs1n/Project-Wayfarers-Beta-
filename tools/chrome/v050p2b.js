// v0.5.0 2.2 surprise starts, 2.6 dual types come later, 2.7 early game hints.
const {open,chk,done}=require('./pw');
(async()=>{
  const H=await open({w:390,h:844,mobile:true});const {ev,wait,shot}=H;
  await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();__A.V.modal=null;});await wait(400);
  // ---------- 2.7 hints (first, while the journey is fresh) ----------
  await ev(()=>{__A.ACT.hintOk&&__A.ACT.hintOk();});
  let h=await ev(()=>{const d=document.getElementById('p2hint');return {vis:!!(d&&d.classList.contains('show')),txt:d?d.textContent:'',seen:Object.keys(__P2.META.hints||{})};});
  if(!h.vis){await wait(1800);h=await ev(()=>{const d=document.getElementById('p2hint');return {vis:!!(d&&d.classList.contains('show')),txt:d?d.textContent:'',seen:Object.keys(__P2.META.hints||{})};});}
  chk(`2.7 a party hint shows on arrival in the first realm: "${h.txt.slice(0,90)}"`,h.vis&&/Mira|Lumen|Oren/.test(h.txt)&&/prefers/.test(h.txt)||JSON.stringify(h));
  await shot('p2_hint_world');
  await ev(()=>{document.querySelector('#p2hint [data-act=hintOk]').click();});await wait(200);
  h=await ev(()=>{const d=document.getElementById('p2hint');__P2.hintFire('world');return {vis:d.classList.contains('show'),seen:Object.keys(__P2.META.hints||{})};});await wait(1800);
  const again=await ev(()=>document.getElementById('p2hint').classList.contains('show'));
  chk('2.7 Got it closes the hint and it never fires twice',!h.vis&&!again&&h.seen.includes('sheet')||JSON.stringify(h)+again);
  // a battle with a flyer: the types hint, then after it is dismissed the next battle gives the flyer hint (naming the archer)
  const startFly=async()=>{await ev(()=>{const A=__A;A.V.modal=null;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;});if(!A.G.roster.tess){A.G.roster.tess=A.newChar('tess',5,0);A.G.party.push('tess');}
    A.startBattle({stage:0,kind:'field',foes:[A.makeEnemy(__P2.MON.gull,3),A.makeEnemy(__P2.MON.mossling,3)],weather:'clear'});});await wait(1900);};
  const endB=async()=>{await ev(()=>{__A.finishBattle('x');__A.V.modal=null;__A.V.screen='world';__A.render();});await wait(100);};
  await startFly();
  const b1=await ev(()=>{const d=document.getElementById('p2hint');return {vis:d.classList.contains('show'),txt:d.textContent,bat:d.classList.contains('bat')};});
  chk(`2.7 first battle hint (types) shows without blocking: "${b1.txt.slice(0,70)}"`,b1.vis&&/element/.test(b1.txt)&&b1.bat||JSON.stringify(b1));
  const blocked=await ev(()=>{const B=__A.B;return !!B&&B.mode!=='over';});chk('2.7 battle keeps running under the hint',blocked===true||'battle stopped');
  await shot('p2_hint_battle');
  await ev(()=>{document.querySelector('#p2hint [data-act=hintOk]').click();});await endB();
  let b2;for(let k=0;k<4;k++){await startFly();b2=await ev(()=>{const d=document.getElementById('p2hint');return {vis:d.classList.contains('show'),txt:d.textContent};});
    if(/flying/.test(b2.txt))break;console.log('  (other hint first: '+b2.txt.slice(4,40)+')');await ev(()=>{const b=document.querySelector('#p2hint [data-act=hintOk]');if(b)b.click();});await endB();await wait(1800);await ev(()=>{const b=document.querySelector('#p2hint.show [data-act=hintOk]');if(b)b.click();});}
  chk(`2.7 next battle gives the flyer hint naming the ranged hero: "${b2.txt.slice(0,80)}"`,b2.vis&&/Tess/.test(b2.txt)&&/flying/.test(b2.txt)||JSON.stringify(b2));
  // turn off
  await ev(()=>{document.querySelector('#p2hint [data-act=hintOff]').click();});await endB();await startFly();
  const b3=await ev(()=>({vis:document.getElementById('p2hint').classList.contains('show'),cfg:__P2.META.cfg.hints}));
  chk('2.7 Turn off hints stops them (Settings toggle off)',!b3.vis&&b3.cfg===false||JSON.stringify(b3));await endB();
  const ui=await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'settings'};A.render();const s=document.getElementById('modal').innerHTML;A.V.modal={type:'menu',tab:'hints'};A.render();const g=document.getElementById('modal').innerHTML;A.V.modal=null;A.render();
    return {set:/<b>Hints<\/b>/.test(s),guides:/prefers/.test(g)&&/Every foe has an element/.test(g)&&/Tess/.test(g),tab:/data-arg="hints"/.test(g)};});
  chk('2.7 Settings has a Hints toggle, Guides > Hints lists every hint shown',ui.set&&ui.guides&&ui.tab||JSON.stringify(ui));
  const later=await ev(async()=>{const A=__A;A.META.cfg.hints=true;A.G.stage=1;__P2.hintFire('battle');await new Promise(r=>setTimeout(r,1700));const v=document.getElementById('p2hint').classList.contains('show');A.G.stage=0;return v;});
  chk('2.7 no hints after the first realm',later===false||'hint showed in realm 2');
  await ev(()=>{__A.META.cfg.hints=false;});
  // ---------- 2.2 surprise ----------
  const sur=async(mode,elite)=>ev(async([mode,elite])=>{const A=__A,P=__P2;A.V.modal=null;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;});
    const m=A.getMap('d0');A.placeAt('d0',m.start[0],m.start[1],'d');A.V.screen='world';const L=P.roamSpawn(m);const r=L.find(q=>!q.dead);r.mode=mode;r.elite=!!elite;if(elite){r.name='Test Elite';r.mod=null;}
    P.roamFight(m,r);await new Promise(res=>setTimeout(res,900));const B=P.B;if(!B)return {err:'no battle'};
    const P0=B.front.filter(c=>c.hp>0),E=B.en.filter(e=>e.hp>0),maxP=Math.max(...P0.map(c=>c.next)),minE=Math.min(...E.map(e=>e.next));
    const ord=P.turnOrder(P0.length+E.length).map(u=>u.side);
    const out={sur:!!B.surprise,banner:B.banner&&B.banner.txt,heroesFirst:ord.slice(0,P0.length).every(s=>s==='p')&&maxP<minE,ord:ord.join(''),ban:A.autoBan(B.spec),auto:B.auto,log:B.log.slice(-3).join(' / ')};
    A.finishBattle('x');A.V.modal=null;return out;},[mode,elite]);
  const s1=await sur('patrol');
  chk(`2.2 touching an unaware roamer gives a surprise start (${s1.banner}, order ${s1.ord})`,s1.sur&&s1.banner==='Surprise!'&&s1.heroesFirst||JSON.stringify(s1));
  const s2=await sur('chase');
  chk(`2.2 a roamer that saw you first fights normally (order ${s2.ord})`,!s2.sur&&s2.banner!=='Surprise!'||JSON.stringify(s2));
  const s3=await sur('patrol',true);
  chk(`2.2 an unaware elite still gives a surprise but keeps its no auto rule (${s3.ban})`,s3.sur&&/No auto/.test(s3.ban||'')||JSON.stringify(s3));
  // ---------- 2.6 dual types ----------
  const d=await ev(()=>{const A=__A,P=__P2,G=A.G,out={};const dual=id=>P.TPL[id]&&P.TPL[id].el.length>1;
    // a realm with many dual type monsters at stage 1
    const zi=P.ZONES.findIndex(z=>z.n==='Mirefen Marsh');G.run.order=[zi,1,2,3,4];G.run.rv=2;A.syncPools&&A.syncPools();
    let n=0,du=0;for(let i=0;i<300;i++){P.encounterFoes({stage:0,kind:'field'}).forEach(e=>{n++;if(e.el.length>1)du++;});P.encounterFoes({stage:0,kind:'dungeon'}).forEach(e=>{n++;if(e.el.length>1)du++;});}
    out.s0={n,du};
    G.run.order=[0,zi,2,3,4];n=0;du=0;for(let i=0;i<300;i++)P.encounterFoes({stage:1,kind:'field'}).forEach(e=>{n++;if(e.el.length>1)du++;});out.s1={n,du};
    G.run.order=[zi,1,2,3,4];
    // elites and bosses stay dual: a dual bounty elite at stage 1
    const el=P.encounterFoes({stage:0,kind:'elite',bounty:{mon:'v_bogtoad',lv:5,name:'Bog Lord',stage:0}});out.elite=el[0].el.length;
    out.mon=P.MON.v_bogtoad.el.length;
    // wayfarers
    G.stage=0;out.tv0=P.tvPool().filter(dual).length;out.tvN0=P.tvPool().length;out.ch0=P.challEligible().filter(c=>dual(c.hero)).length;out.ce0=P.cePool().filter(dual).length;out.rp0=P.rarePool().filter(dual).length;
    G.stage=2;out.tv2=P.tvPool().filter(dual).length;out.ch2=P.challEligible().filter(c=>dual(c.hero)).length;out.ce2=P.cePool().filter(dual).length;G.stage=0;
    // the subset always holds four early single type wayfarers
    let worst=99;for(let sd=0;sd<60;sd++){const sub=P.genSub(sd*7919+3,['mira','lumen','oren'],0);const e=sub.filter(id=>{const s=P.TPL[id].src;return (s==='s'||s==='t0')&&!['mira','lumen','oren'].includes(id)&&!dual(id);}).length;worst=Math.min(worst,e);}out.early=worst;
    // the Bestiary page says so
    A.V.modal={type:'beast',k:'gull'};A.render();out.beast=/first realm/.test(document.getElementById('modal').innerHTML);A.V.modal=null;A.render();
    // Daily Trial foes keep their types
    const plan=A.dailyPlan?A.dailyPlan():null;out.daily=null;
    return out;});
  console.log(JSON.stringify(d));
  chk(`2.6 no dual type regular monsters in the first realm (${d.s0.du} of ${d.s0.n})`,d.s0.du===0&&d.s0.n>0||JSON.stringify(d.s0));
  chk(`2.6 dual type monsters appear from the second realm (${d.s1.du} of ${d.s1.n})`,d.s1.du>0||JSON.stringify(d.s1));
  chk('2.6 elites keep both types in the first realm, the monster table is untouched',d.elite===2&&d.mon===2||JSON.stringify(d));
  chk(`2.6 tavern, challenges, chance meetings and rare visitors offer no dual type wayfarers in the first realm (tavern pool ${d.tvN0})`,d.tv0===0&&d.ch0===0&&d.ce0===0&&d.rp0===0||JSON.stringify(d));
  chk('2.6 dual type wayfarers are offered from the second realm on',d.tv2+d.ch2+d.ce2>0||JSON.stringify(d));
  chk(`2.6 every journey subset holds at least 4 early single type wayfarers (worst ${d.early})`,d.early>=4||d.early);
  chk('2.6 the Bestiary page of a dual type foe explains it',d.beast===true||'no note');
  await done(H);
})();
