// v0.19 skills12.js: Focus is crit chance for turns; dual arts take the class's kind; every hero's class kit is at most 12 (dual types: a Primer and a
// Detonator per element, no elemental ultimates; Limit Breaks outside the cap); a dual art primes and detonates both elements; skill power by role
// (class role list, nature lift capped); natures never cut output; old saves are trimmed without losing a function; the tavern's primer and detonator
// needs work (heroPrimeDet). Run from tools/chrome: PWHTML=../../out/aurelis3.html node v166a.js
const {open,chk,done}=require('./pw');
(async()=>{
  const H=await open({w:430,h:800});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
  // ---- 1. Focus ----
  const f=await ev(()=>{const T=__A.TW.get,STS=T('STS'),FOCUS=T('FOCUS'),B0=T('B');
    T('startBattle')({stage:0,kind:'field'});const B=T('B'),a=B.front[0],e=B.en[0];e.S.eva=0;
    const out={turns:STS.focus.t,desc:STS.focus.d,cfg:[FOCUS.crit,FOCUS.turns]};
    const sk=T('classSkills')(T('TPL').tess).find(s=>s.id==='hawk'),sk2=T('classSkills')(T('TPL').kaevan).find(s=>s.id==='khan');out.hawk=sk&&sk.d;out.khan=sk2&&sk2.d;
    const rate=(st,kind)=>{let n=0;for(let i=0;i<800;i++){a.st=st?{focus:{t:3}}:{};if(T('calcDamage')(a,{id:'t',k:kind,pw:1,el:null},e).crit)n++;}return n/800;};
    let kept;out.base=rate(false,'phys');out.focusP=rate(true,'phys');out.focusM=rate(true,'mag');a.st={focus:{t:3}};T('calcDamage')(a,{id:'t',k:'phys',pw:1,el:null},e);kept=!!a.st.focus;
    out.kept=kept;a.st={};T('addSt')(a,'focus',a,true);out.t=a.st.focus&&a.st.focus.t;return out;});
  chk(`Focus lasts ${f.cfg[1]} turns and adds ${f.cfg[0]*100}% crit (status text: ${f.desc})`,f.turns===f.cfg[1]&&/40%/.test(f.desc)&&/3 turns/.test(f.desc)||JSON.stringify(f));
  chk(`Focus crit over 800 rolls: ${(f.base*100).toFixed(0)}% without it, ${(f.focusP*100).toFixed(0)}% on a physical and ${(f.focusM*100).toFixed(0)}% on a magic skill with it (about +40 points), and an attack does not spend it (${f.kept})`,f.base<.2&&f.focusP>f.base+.3&&f.focusP<f.base+.5&&f.focusM>f.base+.3&&f.kept===true);
  chk(`a fresh Focus has ${f.cfg[1]} turns; Hawkeye and Khan's Focus say so (${f.hawk} | ${f.khan})`,f.t===f.cfg[1]&&/40% crit chance for 3 turns/.test(f.hawk)&&/40% crit chance for 3 turns/.test(f.khan));
  // ---- 2 and 3. kits, dual arts ----
  const k=await ev(()=>{const T=__A.TW.get,TPL=T('TPL'),CLS=T('CLS'),RAW=T('RAW'),SK12=T('SK12'),classSkills=T('classSkills'),S=__S12,skHitsFoe=T('skHitsFoe'),skEls=T('skEls'),deliveryOf=T('deliveryOf');
    const ids=RAW.filter(r=>r[6]!=='x'&&TPL[r[0]]&&!TPL[r[0]].mon&&CLS[TPL[r[0]].cls]).map(r=>r[0]);const o={n:ids.length,over:[],noPD:[],ult:[],singleUlt:0,single:0,kinds:{},bad:[],lb:[],dualN:0,small:[],early:[]};
    ids.forEach(id=>{const t=TPL[id],L=classSkills(t),lg=t.src==='L'||t.src==='x';if(L.filter(s=>!s.bond).length>SK12.cap)o.over.push(id);
      if(L.filter(s=>s.lv<=1).length<2)o.early.push(id);
      if(t.el.length>1){o.dualN++;t.el.forEach(e=>{if(!L.some(s=>s.role==='primer'&&!s.combo&&skHitsFoe(s)&&skEls(s)[0]===e)||!L.some(s=>s.role==='det'&&!s.combo&&skHitsFoe(s)&&skEls(s).includes(e)))o.noPD.push(id+':'+e);});
        if(!lg&&L.some(s=>s.el&&(SK12.ult[t.cls]||[]).includes(s.id)))o.ult.push(id);}
      else if(!lg&&(SK12.ult[t.cls]||[]).length){o.single++;if(L.some(s=>s.el&&(SK12.ult[t.cls]||[]).includes(s.id)))o.singleUlt++;}
      const cb=L.find(s=>s.combo);if(cb&&(cb.k==='phys'||cb.k==='mag')){const phys=SK12.physCls.includes(t.cls);o.kinds[t.cls]=cb.k;if((cb.k==='phys')!==phys)o.bad.push(id);
        if(phys){const d=deliveryOf({id,side:'p',S:{wp:null}},cb);if(!['slash','blunt','piercing','ranged'].includes(d))o.bad.push(id+':'+d);}else if(deliveryOf({id,side:'p',S:{}},cb)!=='magic')o.bad.push(id+':notmagic');}
      if(L.length<8)o.small.push(id+':'+L.length);});
    const Ls=T('LIMIT'),L2=T('LIMIT2');Object.keys(CLS).forEach(c=>{if(Ls[c]&&L2[c])o.lb.push(c);});
    o.limit=T('limitSkill')(T('newChar')('mira',30)).n;return o;});
  chk(`all ${k.n} wayfarers hold at most 12 class skills (over: ${k.over.join(',')||'none'}) and two skills at level 1 (${k.early.join(',')||'ok'}); none under 8 (${k.small.join(',')||'ok'})`,k.over.length===0&&k.early.length===0&&k.small.length===0);
  chk(`all ${k.dualN} dual types have a Primer and a Detonator for each element (missing: ${k.noPD.join(',')||'none'})`,k.noPD.length===0&&k.dualN>=20);
  chk(`no dual type (legends and specials aside) holds an elemental ultimate (${k.ult.join(',')||'none'}), single types do keep theirs (${k.singleUlt} of ${k.single})`,k.ult.length===0&&k.singleUlt===k.single);
  chk(`dual arts follow the class: physical classes physical (weapon kind), the rest magic (${JSON.stringify(k.kinds)}; bad: ${k.bad.join(',')||'none'})`,k.bad.length===0&&Object.keys(k.kinds).length>=8);
  chk(`Limit Breaks are untouched by the cap (${k.lb.length} classes, Limit skill ${k.limit})`,k.lb.length>=12&&!!k.limit);
  // ---- 4. dual art reactions ----
  const r=await ev(()=>{const T=__A.TW.get;T('startBattle')({stage:0,kind:'field'});const B=T('B'),a=B.front[0],perform=T('perform'),o={};
    const art={id:'combo',n:'Test Art',combo:1,k:'mag',pw:1.2,mp:0,cost:1,hits:1,t:'one',el:['fire','water'],role:'det'};
    const foe=i=>{const e=B.en[i];e.hp=e.S.mhp=99999;e.S.eva=0;e.st={};e.primed=null;e.shield=0;return e;};
    let e=foe(0);e.primed={el:'earth',t:2,by:'x'};B.nDet=0;perform(a,art,[e]);o.det=B.nDet;o.left=e.primed;o.name=e.reactN;o.log=B.log.slice(-8).join(' | ');
    const single=Object.assign({},art,{el:'fire'});e=foe(0);e.primed={el:'earth',t:2,by:'x'};B.nDet=0;perform(a,single,[e]);o.det1=B.nDet;
    e=foe(0);B.nPrime=0;perform(a,art,[e]);o.pr=e.primed&&[e.primed.el,e.primed.el2].sort().join('+');o.np=B.nPrime;
    // a detonator that only fits the second prime element
    e=foe(0);e.primed={el:'fire',el2:'light',t:2,by:'x'};B.nDet=0;perform(a,{id:'t2',n:'Det',k:'mag',pw:1,mp:0,cost:1,hits:1,t:'one',el:'shadow',role:'det'},[e]);o.swap=B.nDet+':'+(e.primed?'still':'gone');
    // both reactions on a dual prime
    e=foe(0);e.primed={el:'earth',el2:'ice',t:2,by:'x'};B.nDet=0;perform(a,art,[e]);o.dualPrime=B.nDet;
    // an area art primes every foe, and a foe that was primed has it set off instead
    while(B.en.length<2)B.en.push(Object.assign({},B.en[0],{st:{},primed:null,name:'Twin'}));B.en.forEach((x,i)=>{if(i<2)foe(i);});B.en[1].primed={el:'ice',t:2,by:'x'};const all=Object.assign({},art,{t:'all',el:['wind','shadow']});B.en[0].primed=null;perform(a,all,B.en.filter(x=>x.hp>0));
    o.area=[B.en[0].primed&&B.en[0].primed.el,B.en[1].primed?'kept':'set off'];return o;});
  chk(`a dual art on a prime sets off both elements' reactions (${r.det} detonations, prime ${r.left}, name ${r.name}), a single element one (${r.det1})`,r.det===2&&r.left===null&&/ \+ /.test(r.name||'')&&r.det1===1||JSON.stringify(r));
  chk(`a dual art on an unprimed foe primes both elements (${r.pr}, ${r.np} prime)`,r.pr==='fire+water'&&r.np===1||JSON.stringify(r));
  chk(`a second prime element can be set off by a detonator that fits only it (${r.swap}); a dual prime met by a dual art gives ${r.dualPrime} reactions; an area art primes foes that were not primed (${r.area})`,r.swap==='1:gone'&&r.dualPrime===2&&r.area[0]&&r.area[1]==='set off'||JSON.stringify(r));
  // ---- 5. roles ----
  const p=await ev(()=>{const T=__A.TW.get,nc=T('newChar'),known=T('known'),ROLEPW=T('ROLEPW'),G=T('G');G.daily=false;
    const get=(id,lv,nat,sid)=>{const c=nc(id,lv);if(nat)c.nat=nat;c.S=T('calcStats')(c);const s=known(c).find(x=>x.id===sid);return s&&{pw:s.pw,m:s.rlm||1,tier:s.rlt||'primary',heal:s.pw*(c.S.healP||c.S.mag)*(1+(c.S.healUp||0)),fx:s.fx,buffCut:s.buffCut};};
    const o={};o.priestMend=get('lumen',30,null,'mend');o.priestAll=get('lumen',30,null,'mendall');o.priestFull=get('lumen',30,null,'fullmend');
    o.bard=get('brook',30,'minstrel6','r_ballad');o.bardNat=get('brook',30,'herald6','r_ballad');o.bardAll=get('brook',30,'minstrel6','r_chorus');o.bardAllNat=get('brook',30,'herald6','r_chorus');
    o.monkIron=get('dorn',30,null,'iron');o.thiefDart=get('sable',30,null,'r_hamstr');o.mageHex=get('mira',30,'keen','hex');o.thiefToxin=get('sable',30,null,'r_toxin');o.mageSnare=get('mira',30,null,'r_snare');
    o.cfg=[ROLEPW.primary,ROLEPW.secondary,ROLEPW.off,ROLEPW.natLift,ROLEPW.natCap];
    const NAT6=T('NAT6');o.natNeg=Object.keys(NAT6).filter(k=>['atk','mag','heal'].some(s=>NAT6[k].fx[s]!=null&&NAT6[k].fx[s]<1));o.natNoRl=Object.keys(NAT6).filter(k=>!NAT6[k].rl);
    // every non-primary multiplier stays below natCap, every primary is 1
    let maxNon=0;const TPL=T('TPL'),RAW=T('RAW');['lumen','brook','sable','mira','oren','brann','tess','dorn'].forEach(id=>{['mender6','herald6','minstrel6','trickster6','sentinel6','keen',null].forEach(n=>{const c=nc(id,30);if(n)c.nat=n;T('classSkills')(TPL[id]).forEach(s=>{const x=__S12.mult(c,s);if(x&&x.tier!=='primary')maxNon=Math.max(maxNon,x.m);});});});o.maxNon=maxNon;
    // the sheet shows the numbers
    const c=nc('brook',30);G.roster.brook=c;o.rows=null;return o;});
  const E=(x)=>x?x.heal.toFixed(0):'-';
  console.log(`priest Mend pw ${p.priestMend.pw} (heal ${E(p.priestMend)}), Mend All pw ${p.priestAll.pw} (${E(p.priestAll)}), Full Mend pw ${p.priestFull.pw} (${E(p.priestFull)}); bard Ballad pw ${p.bard.pw} (${E(p.bard)}) with a healing nature pw ${p.bardNat.pw} (${E(p.bardNat)}); bard Chorus pw ${p.bardAll.pw} (${E(p.bardAll)}) / ${p.bardAllNat.pw} (${E(p.bardAllNat)})`);
  chk(`a priest's heal beats a bard's: Mend ${p.priestMend.pw} pw vs Ballad ${p.bard.pw}, and with a healing nature ${p.bardNat.pw} (never reaches the priest's Mend); Mend All ${p.priestAll.pw} vs Chorus ${p.bardAll.pw} / ${p.bardAllNat.pw}`,p.bard.tier==='secondary'&&p.bard.pw<p.priestMend.pw&&p.bardNat.pw>p.bard.pw&&p.bardNat.pw<p.priestMend.pw&&p.bardAll.pw<p.priestAll.pw&&p.bardAllNat.pw>p.bardAll.pw&&p.bardAllNat.pw<p.priestAll.pw||JSON.stringify(p));
  chk(`multipliers ${p.cfg.join('/')}: heal-per-cast of the bard (${E(p.bard)}, ${E(p.bardNat)} with the nature) is under the priest's like for like (${E(p.priestMend)})`,p.bard.heal<p.priestMend.heal&&p.bardNat.heal<p.priestMend.heal&&p.cfg[1]<p.cfg[0]&&p.cfg[2]<p.cfg[1]&&p.cfg[4]<1);
  chk(`an off-role skill is weaker than a sub role one: a monk's Iron Body (tank, off) tier ${p.monkIron.tier} x${p.monkIron.m} and a buff one turn shorter (${p.monkIron.buffCut}); mage Hex (sub) x${p.mageHex.m} (${p.mageHex.fx[0][1]} break chance of .9 base); a thief's Hamstring is full power (x${p.thiefDart.m}, ${p.thiefDart.fx[0][1]} chance)`,p.monkIron.tier==='off'&&p.monkIron.m<p.mageHex.m&&p.mageHex.tier==='secondary'&&p.mageHex.fx[0][1]<.9&&p.thiefDart.tier==='primary'&&p.thiefDart.m===1&&p.monkIron.buffCut===1);
  chk(`a mage's debuff chance (Snare ${p.mageSnare.fx[0][1]}) is under a thief's (Toxic Cloud ${p.thiefToxin.fx[0][1]}), same slot`,p.mageSnare.fx[0][1]<=.6*1.0&&p.thiefToxin.fx[0][1]>=.85*.999);
  chk(`natures cut no attack, magic or healing (${p.natNeg.join(',')||'none'}) and every one names its role (${p.natNoRl.join(',')||'all do'}); no non-primary skill ever reaches ${p.cfg[4]} (max ${p.maxNon})`,p.natNeg.length===0&&p.natNoRl.length===0&&p.maxNon<=p.cfg[4]+1e-9);
  // the battle row and the sheet row show the tier
  const rw=await ev(()=>{const T=__A.TW.get;T('G').roster.brook&&0;const A=__A;A.ACT.new();['brook','lumen','mira'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=T('G');G.roster.brook.lv=30;G.roster.brook.S=T('calcStats')(G.roster.brook);
    G.roster.brook.nat='minstrel6';G.roster.brook.S=T('calcStats')(G.roster.brook);A.V.modal={type:'char',char:'brook',tab:'skills'};A.render();const rows=[...document.querySelectorAll('#modal .row')].map(r=>r.textContent.replace(/\s+/g,' ')).filter(t=>/Ballad|Dissonance|Battle Hymn/.test(t));return rows;});
  console.log(JSON.stringify(rw));
  chk('the hero sheet skill rows show the scaled power and Sub with the multiplier (Healing Ballad Pow 140 Sub x80%; the bard\'s own Battle Hymn no tag)',rw.some(t=>/Healing Ballad.*Pow 140.*Sub x80%/.test(t))&&rw.some(t=>/Battle Hymn/.test(t)&&!/(Sub|Off) x/.test(t))||JSON.stringify(rw));
  const br=await ev(()=>{const T=__A.TW.get,G=T('G');G.roster.brook.nat='minstrel6';G.roster.brook.S=T('calcStats')(G.roster.brook);G.party=['brook','lumen','mira'];T('startBattle')({stage:0,kind:'field'});const B=T('B');
    B.cur=B.front.find(u=>u.id==='brook');B.mode='cmd';B.menu='skills';B.pend=null;__A.render();
    return [...document.querySelectorAll('#bcmd .mi, .bcmd .mi, .mi')].map(r=>r.textContent.replace(/\s+/g,' ')).filter(t=>/Healing Ballad|Battle Hymn/.test(t));});
  chk('the battle skill row shows the scaled power and the tier (Healing Ballad ~101 Sub x80% Pow 140, Battle Hymn plain)',br.some(t=>/Healing Ballad.*~\d+.*Sub x80%.*Pow 140/.test(t))&&br.some(t=>/Battle Hymn/.test(t)&&!/(Sub|Off) x/.test(t))||JSON.stringify(br));
  // ---- old saves ----
  const m=await ev(()=>{const T=__A.TW.get,TPL=T('TPL'),classSkills=T('classSkills'),S=__S12,sk=T('skillKnown');const full=S.full(TPL.brann),kit=classSkills(TPL.brann),ids=new Set(kit.map(s=>s.id));
    const drop=full.find(s=>!ids.has(s.id)&&s.lv<=40);const c={id:'brann',lv:40,keep:[drop.id,'pstrike']};const g={roster:{brann:c}};const lost=S.migrate(g);
    return {drop:drop.id,keep:c.keep,msg:g.s12msg,lost:lost.brann,known:kit.filter(s=>sk(c,s)).length,fns:new Set(kit.filter(s=>sk(c,s)).map(s=>s.role||s.k)).size};});
  chk(`an old save is trimmed: a dropped skill (${m.drop}) leaves the hero's keep list (${JSON.stringify(m.keep)}), the hero lists what was set aside (${m.lost}), one notice (${m.msg&&m.msg.slice(0,40)}...)`,m.keep.indexOf(m.drop)<0&&m.keep.includes('pstrike')&&m.lost&&m.lost.length>0&&/capped at 12/.test(m.msg||'')||JSON.stringify(m));
  const m2=await ev(()=>{const T=__A.TW.get,TPL=T('TPL'),S=__S12,sk=T('skillKnown'),ids=Object.keys(TPL).filter(i=>!TPL[i].mon&&T('CLS')[TPL[i].cls]),bad=[];
    ids.forEach(id=>{const full=S.full(TPL[id]),kit=T('classSkills')(TPL[id]),c={id,lv:50},fn=s=>s.role?s.role+':'+(T('skEls')(s)[0]||''):'';const have=new Set(kit.map(fn));
      full.forEach(s=>{if(sk(c,s)&&s.role&&!kit.includes(s)&&!(T('SK12').ult[TPL[id].cls]||[]).includes(s.id)&&!have.has(fn(s)))bad.push(id+':'+s.id);});});return bad;});
  chk(`at level 50 no hero loses the only Primer or Detonator of an element to the cap (${m2.length}: ${m2.slice(0,6).join(',')})`,m2.length===0);
  // ---- 6. tavern ----
  const tv=await ev(()=>{const T=__A.TW.get,A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=T('G'),TPL=T('TPL');
    const pd=T('heroPrimeDet'),o={mage1:pd('mira',1),mage4:pd('mira',4),warr:pd('brann',1),legend:pd('kaevan',40),rd:typeof T('heroRoles')};
    const N=T('partyNeeds')();o.needs={pr:N.pr,dt:N.dt,lv:N.lv};
    const tags=id=>T('recruitFit')(id,N).why.join(' | ');o.fit={dorn:tags('dorn'),brann:tags('brann'),tess:tags('tess')};
    const ids=T('POOL_IDS')();o.subOk=T('subOK')(T('genSub')(5,[],0),[]);o.subLen=T('genSub')(5,[],0).length;
    // the needs are live: a set of heroes with no Detonator or Primer asks for one
    const noD=ids.filter(i=>!pd(i,40).D).length,noP=ids.filter(i=>!pd(i,40).P).length;o.noD=noD;o.noP=noP;
    o.req=T('subReq')(new Set(['mira','lumen','oren']),[]).length;return o;});
  console.log(JSON.stringify(tv));
  chk(`heroPrimeDet(id,lv) returns {P,D} by level (mage lv1 ${JSON.stringify(tv.mage1)}, lv4 ${JSON.stringify(tv.mage4)}) and the role list function is a different thing`,tv.mage1.P===true&&tv.mage1.D===false&&tv.mage4.D===true&&tv.warr.D===true&&tv.legend.P&&tv.legend.D);
  chk(`the recruit fit now tags a hero that brings what the party lacks (party has Detonator ${tv.needs.dt}: Dorn "${tv.fit.dorn}")`,tv.needs.dt===false&&/Detonator/.test(tv.fit.dorn)||JSON.stringify(tv));
  chk(`the journey roster draw still satisfies its guarantees (${tv.subLen} heroes, ok ${tv.subOk})`,tv.subOk===true&&tv.subLen>=28);
  done(H);
})().catch(e=>{console.error(e);process.exit(1);});
