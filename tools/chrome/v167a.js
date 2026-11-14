// v0.18.7 records12.js: Records > Completion (Echo Rift block, every tracker per realm, the Den row follows the map), one account play
// time (the journeys' own play time, both shown), the one Notice Board list with a Claim all that matches what it hands in, the
// Settings > Tips row at 390x844 and 1000x600, the Den / Lair / Sanctum tag on every arrival, the Meridian Breach line and description.
// Screenshots go to $R12SHOT (default /tmp): completion_390.png, tips_390.png, tips_1000.png.
// Run from tools/chrome: PWHTML=../../out/aurelis3.html node v167a.js
const {open,chk,done}=require('./pw');
const OUT=process.env.R12SHOT||'/tmp';
const start=H=>H.det(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.META.cfg.gfx='low';A.META.cfg.hints=false;A.META.cfg.tips=false;A.V.modal=null;A.TW.get('applyCfg')();A.render();},[],7);
(async()=>{
  const H=await open({w:390,h:844,out:OUT,mobile:true});await start(H);await H.until(()=>__A.V.screen==='world',null,{timeout:15000});await H.frames(3);
  // ---------- 1. Completion ----------
  let r=await H.ev(()=>{const A=__A,G=A.G;G.stage=4;G.been={f0:1,d0:1};A.V.modal={type:'menu',tab:'realms'};A.render();
    const g=__M3.MENU_GROUPS.find(x=>x[0]==='records');return {first:g[2][0],label:A.TW.get('MENU_SUB').realms,tabs:[...document.querySelectorAll('#modal .chips .chip')].map(x=>x.textContent.trim()),txt:document.querySelector('#modal').innerText};});
  chk(`Records opens on Completion (first tab ${r.first}, label ${r.label})`,r.first==='realms'&&r.label==='Completion'&&r.tabs.includes('Completion')&&!r.tabs.includes('Realms'));
  chk('no Echo Rift block and no Riftkeeper before the Rift is open',!/Echo Rift|Riftkeeper|Secret boss/.test(r.txt)&&!/\bEcho\b/.test(r.txt.replace(/Echo Rift/g,'')));
  r=await H.ev(()=>{const A=__A,G=A.G;G.won=1;[0,1,2,3,4].forEach(s=>{G.echoStory=G.echoStory||{};G.echoStory[s]=1;});G.riftWon={};const K=A.TW.get('echoKeys')();K.slice(0,3).forEach(k=>G.riftWon[k]=1);A.render();
    const t=document.querySelector('#modal').innerText;return {t,n:K.length,rows:[...document.querySelectorAll('#modal .r12realm')].map(c=>({head:c.querySelector('.r12head b').textContent,labels:[...c.querySelectorAll('.r12t b')].map(b=>b.textContent)})),
      secret:/Secret boss[\s\S]*\?\?\?/i.test(t),keeper:/The Riftkeeper/.test(t),rift:/Echo Rift[\s\S]*Echoes defeated/i.test(t)};});
  chk(`Echo Rift block: Echoes defeated 3 / ${r.n} and the Riftkeeper as "Secret boss ???" (${r.secret}, keeper named ${r.keeper})`,r.rift&&r.t.includes(`3 / ${r.n}`)&&r.secret&&!r.keeper);
  chk('every realm lists Field chests, Den, Lair, Sanctum, beacon, Echo, Quests, Bounties and Taming',r.rows.length===5&&r.rows.every(c=>['Field chests','Den','Lair','Sanctum','Echo','Quests','Bounties','Taming'].every(l=>c.labels.includes(l))&&c.labels.some(l=>/beacon/.test(l)))||JSON.stringify(r.rows[0]));
  r=await H.ev(()=>{__A.META.riftkeeper=1;__A.render();return /The Riftkeeper[\s\S]*Beaten/.test(document.querySelector('#modal').innerText);});
  chk('beaten Riftkeeper is named',r);await H.ev(()=>{delete __A.META.riftkeeper;});
  // the Den row says None where the realm has none; the map is the truth (seed 21 of the sweep: stage 3 is planned a Den the map never gets)
  r=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get,MAPS=T('MAPS');const out={none:0,den:0,bad:[]};
    for(let seed=1;seed<=40;seed++){G.run.seed=seed*104729+3;G.stage=4;Object.keys(MAPS).forEach(k=>delete MAPS[k]);G.been={};
      for(let s=0;s<5;s++){const m=T('getMap')('f'+s),has=(m.caves||[]).some(c=>c.id==='k'+s);G.been['f'+s]=1;
        const L=T('REALM_DONE')(s),inList=L.some(x=>x.k==='den');if(has!==inList)out.bad.push(`seed ${seed} s${s} map ${has} list ${inList}`);}}
    // a Den the plan promises and the map lacks (seen once in 1500 maps): remove it from the cached map by hand
    const s3=[0,1,2,3,4].find(s=>T('caveStage')(s));G.been={['f'+s3]:1};const m3=T('getMap')('f'+s3);MAPS['f'+s3]=Object.assign({},m3,{caves:(m3.caves||[]).filter(c=>c.id!=='k'+s3)});
    out.s21={plan:T('caveStage')(s3),map:(MAPS['f'+s3].caves||[]).some(c=>c.id==='k'+s3),list:T('REALM_DONE')(s3).some(x=>x.k==='den')};out.s3=s3;
    A.V.modal={type:'menu',tab:'realms'};A.render();const c=[...document.querySelectorAll('#modal .r12realm')][s3];out.row=c&&[...c.querySelectorAll('.r12t')].find(x=>/^Den/.test(x.innerText)).innerText.replace(/\s+/g,' ');return out;});
  chk(`the Den tracker agrees with the map for 200 realms (${r.bad.length} differ)`,!r.bad.length||JSON.stringify(r.bad.slice(0,3)));
  chk(`a Den the plan promised but the map lacks is not listed (plan ${r.s21.plan}, map ${r.s21.map}, list ${r.s21.list}) and its row reads "${r.row}"`,r.s21.plan&&!r.s21.map&&!r.s21.list&&/None in this realm/.test(r.row));
  await H.ev(()=>{const A=__A,G=A.G;G.run.seed=5;G.been={f0:1,d0:1};A.V.modal={type:'menu',tab:'realms'};A.render();const p=document.querySelector('#modal .panel');p.scrollTop=document.querySelector('#modal .r12rift').offsetTop-150;});await H.shot('completion_390');
  await H.ev(()=>{const p=document.querySelector('#modal .panel');p.scrollTop=document.querySelector('#modal .r12realm').offsetTop-80;});await H.shot('completion_realm_390');

  // ---------- 2. account play time ----------
  r=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get,H1=3600000;G.daily=0;A.META.stats={play:17*H1,first:1,seeded:1};G.stats.play=25*H1;G.stats.start=111;G.run.seed=5;
    const tick=T('msTick');tick(15000);const a=A.META.stats.play;tick(15000);const b=A.META.stats.play;G.stats.play+=15000;tick(15000);const c=A.META.stats.play;
    // a saved journey played elsewhere: only the save has the time
    A.V.modal=null;A.saveGame();const sv=A.META.stats.play;A.META.stats.credit={};A.META.stats.play=3*H1;A.META.stats.pl12=0;G.stats.play=0;G.stats.start=222;tick(15000);const seeded=A.META.stats.play;
    G.stats.start=111;G.stats.play=25*H1+30000;A.TW.get('metaBlock')();const html=A.TW.get('metaBlock')();
    G.daily=1;const d0=A.META.stats.play;tick(15000);const d1=A.META.stats.play;G.daily=0;
    return {a:a/H1,bAdd:b-a,cAdd:c-b,seeded:seeded/H1,two:/Play time, this journey[\s\S]*Play time, account/.test(html),html:html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,200),dAdd:d1-d0};});
  chk(`account total follows the journey (17 h account, 25 h journey -> ${r.a.toFixed(2)} h)`,Math.abs(r.a-25)<.01);
  chk(`no double counting: an idle tick adds ${r.bAdd} ms, a journey tick adds ${r.cAdd} ms`,r.bAdd===0&&r.cAdd===15000);
  chk(`an old total is raised to what the saved journeys add up to (3 h -> ${r.seeded.toFixed(2)} h)`,r.seeded>=25-.01);
  chk('Account totals shows both play times',r.two||r.html);
  chk(`a Daily Trial tick still counts on its own (${r.dAdd} ms)`,r.dAdd===15000);

  // ---------- 3. one Notice Board list ----------
  r=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get,o={};G.daily=0;G.stage=1;G.cleared[0]=1;G.pcV=0;G.guildSeen=1;A.V.modal=null;
    T('genQuests')(0);T('genQuests')(1);T('genBounties')(0);T('genBounties')(1);
    // a ready quest of this town, a ready quest of the other realm, a ready guild notice, a beaten bounty of this town, a ready mission
    const mq=(id,st)=>({id,stage:st,type:'hunt',state:'active',n:1,have:1,title:'Test '+id,desc:'A test notice.',reward:{gold:50},hand:'board'});const q0=mq('tq0',0),q1=mq('tq1',1);G.quests.push(q0,q1);const gq=G.quests.find(q=>q.type==='guild');if(gq)gq.state='active';
    const b0=G.bounties.find(b=>b.stage===0);b0.state='ready';b0.hand='board';
    const f=T('facInit')(),m=T('facMisAll')()[0];f.acc[m.id]=T('facCount')(m.k);f.ctr[m.k]=(f.ctr[m.k]||0)+m.n+5;f.hand[m.id]='guild';
    o.inTown=T('inTown')();o.stage=T('g7TownStage')();
    A.V.modal={type:'board'};A.render();
    o.tabs=[...document.querySelectorAll('#modal .stabs .chip')].map(x=>x.textContent.trim());o.on=[...document.querySelectorAll('#modal .stabs .chip.on')].map(x=>x.textContent.trim()).join();
    const k=[...document.querySelectorAll('#modal .r12kind')].map(x=>x.textContent);o.kinds=[...new Set(k)].sort();
    const btn=document.querySelector('#modal [data-act="nbClaimAll"]');o.btn=btn&&btn.textContent;o.away=(document.querySelector('#modal .r12away')||{}).textContent||'';
    o.qBar=(document.querySelector('#modal [data-act="qClaimAll"]')||{}).textContent;
    const g0=G.gold;A.ACT.nbClaimAll();o.gold=G.gold>g0;o.states={q0:q0.state,q1:q1.state,gq:gq&&gq.state,b0:b0.state,m:T('facMisState')(m)};o.after=document.querySelector('#modal').innerText.length>0;return o;});
  chk(`the town board opens on Notices (tabs ${r.tabs.join('/')}, on ${r.on}) and lists quests, bounties and guild missions (${r.kinds.join(', ')})`,r.tabs.join()==='Notices,Quests,Guilds,Bounties'/* quests16: the board has its Guilds tab back */&&/Notices/.test(r.on)&&['Bounty','Guild mission','Quest'].every(x=>r.kinds.includes(x))||JSON.stringify(r));
  chk(`one Claim all: "${r.btn}" counts what this place hands in (the quest and the bounty of this town, and since quests16 the guild notice and the mission), not the other realm`,/Claim all \(4\)/.test(r.btn));
  chk(`it says what waits elsewhere: "${r.away.slice(0,110)}"`,/1 ready notice /.test(r.away)&&/Notice Board/.test(r.away)&&!/Guild Hall/.test(r.away));
  chk(`Claim all handed in the quest, the bounty, the guild notice and the mission and left the other realm's quest (${JSON.stringify(r.states)})`,r.gold&&r.states.q0==='claimed'&&r.states.b0==='done'&&r.states.q1==='active'&&r.states.m==='done'&&r.states.gq==='claimed');
  r=await H.ev(()=>{const A=__A,G=A.G,T=A.TW.get;A.V.modal=null;T('openService')('guild');A.render();const f=T('facInit')();{const m2=T('facMisAll')().find(x=>T('facMisState')(x)!=='done');f.acc[m2.id]=0;f.hand[m2.id]='guild';f.ctr[m2.k]=(f.ctr[m2.k]||0)+m2.n+500;T('facDirty')();}/* quests16: the board handed in the first one, so another mission is made ready for the hall */const m=T('facMisAll')().find(x=>T('facMisState')(x)==='ready');
    A.ACT.sTab('guilds');const o={bar:(document.querySelector('#modal [data-act="facClaimAll"]')||{}).textContent};A.ACT.facClaimAll();o.done=m?!!f.done[m.id]:null;
    // the quests tab's own Claim all: count matches what it hands in (the other realm's quest is not claimed here and not counted)
    G.quests.filter(q=>q.stage<=1&&q.type==='hunt').forEach(q=>{q.state='active';q.have=q.n;q.hand='board';});A.V.modal={type:'board',tab:'quests'};A.render();
    o.qb=(document.querySelector('#modal [data-act="qClaimAll"]')||{}).textContent;const n0=G.quests.filter(q=>q.state==='claimed').length;A.ACT.qClaimAll();o.claimed=G.quests.filter(q=>q.state==='claimed').length-n0;return o;});
  chk(`Guild Hall Claim all counts and hands in the mission (${r.bar}, done ${r.done})`,/\(1\)/.test(r.bar)&&r.done);
  chk(`Quests tab Claim all: button ${r.qb}, handed in ${r.claimed}`,(r.qb||'').includes(`(${r.claimed})`)&&r.claimed>=1);
  r=await H.ev(()=>{const A=__A;A.V.modal=null;A.ACT.menu();A.ACT.menuGrp('quests');const g=__M3.MENU_GROUPS.find(x=>x[0]==='quests')[2];return {g:g.join(),txt:document.querySelector('#modal').innerText.includes('Every notice in one list')};});
  chk(`Menu > Quests opens on the same list (tabs ${r.g})`,/^nball,quests,(qbounty,factions|factions,qbounty),qarena$/.test(r.g)&&r.txt);

  // ---------- 5. site tags and the Breach ----------
  r=await H.ev(async()=>{const A=__A,G=A.G,T=A.TW.get,o={};G.stage=4;G.daily=0;A.V.modal=null;
    const tag=id=>{const m=T('getMap')(id);A.WS.m=m;T('showLocation')();const a=A.WS.locN;T('showLocation')();return [a,A.WS.locN];};
    o.den=tag('k0');o.lair=tag('d0');o.sanct=tag('o1');o.field=tag('f0');
    A.WS.m=T('getMap')('x0');G.breachLook=0;A.WS.dlg=null;A.V.screen='world';T('showLocation')();o.breach=A.WS.locN;
    await new Promise(r=>setTimeout(r,1700));o.dlg=A.WS.dlg&&A.WS.dlg.text;o.look=G.breachLook;A.WS.dlg=null;T('showLocation')();await new Promise(r=>setTimeout(r,1700));o.again=!!A.WS.dlg;return o;});
  chk(`Den tag on every arrival (${r.den.join(' | ')})`,r.den.every(x=>/^Den: /.test(x)));
  chk(`Lair tag on every arrival (${r.lair.join(' | ')}) and Sanctum (${r.sanct.join(' | ')})`,r.lair.every(x=>/^Lair: /.test(x))&&r.sanct.every(x=>/^Sanctum: /.test(x)));
  chk(`a field has no tag (${r.field[1]})`,!/: /.test(r.field[1].split(' · ')[0]));
  chk(`Breach banner is the name alone (${JSON.stringify(r.breach)}); the description shows once (${(r.dlg||'').slice(0,40)}..., again ${r.again})`,r.breach==='The Meridian Breach'&&/strongest wayfarers/.test(r.dlg||'')&&!/echo/i.test(r.dlg||'')&&r.look===1&&!r.again);
  await H.browser.close();

  // ---------- 4. Settings > Tips ----------
  for(const [w,h] of [[390,844],[1000,600]]){
    const H2=await open({w,h,out:OUT,mobile:w<500});await start(H2);await H2.frames(3);
    const t=await H2.ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'settings'};A.V.m11Shut={play:false};A.render();
      const row=[...document.querySelectorAll('#modal .row')].find(x=>/A short card the first time/.test(x.textContent));if(!row)return null;const g=row.querySelector('.grow'),sm=g.querySelector('small');row.scrollIntoView({block:'center'});
      return {rowH:row.offsetHeight,growW:g.offsetWidth,smH:sm.offsetHeight,smW:sm.offsetWidth,words:sm.textContent.split(' ').length,chipsIn:row.getBoundingClientRect().right<=document.querySelector('#modal .panel,#modal .box').getBoundingClientRect().right+1};});
    chk(`${w}x${h} Tips row: text ${t&&t.growW}px wide, ${t&&t.smH}px tall, row ${t&&t.rowH}px (not one letter per line)`,!!t&&t.growW>=150&&t.smH<=100&&t.rowH<=160&&t.chipsIn);
    await H2.shot('tips_'+w);await H2.browser.close();
  }
  done(H);
})().catch(e=>{console.error(e);process.exit(1);});
