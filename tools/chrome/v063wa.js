// v0.6.3 Daily Trial weekly twist (twists.js). Checks: one twist per ISO week (the same Monday to Sunday, changes from week to week,
// never Math.random), every twist really changes the rule it names (measured against the same trial with the twist off), the
// entry screen and the battle chip show it, and the trial stays deterministic with a twist on: two full auto runs of the same date
// (fake clock, short pauses, Low graphics) end with the same score, turns, knockouts and battle log. Usage: PWHTML=../../out/aurelis3.html node v063wa.js
const {open,chk,done}=require('./pw');
const DAY=new Date('2026-11-04T12:00:00Z');
(async()=>{
const H=await open({w:390,h:844,mobile:true});const {ev,wait,page}=H;
// ----- 1. the week rule -----
const wk=await ev(()=>{const T=__A.TW,o={};const mr=Math.random;let used=0;Math.random=()=>{used++;return mr();};
  const id=k=>(T.forKey(k)||{}).id;
  o.weekA=['2026-11-02','2026-11-03','2026-11-04','2026-11-05','2026-11-06','2026-11-07','2026-11-08'].map(id);
  o.weekB=['2026-11-09','2026-11-15'].map(id);
  o.yearEnd=['2026-12-28','2027-01-01','2027-01-03'].map(id);o.yearNext=id('2027-01-04');
  o.iso=[T.isoWeek('2026-11-05'),T.isoWeek('2027-01-01'),T.isoWeek('2021-01-03'),T.isoWeek('2020-12-31')];
  const seq=[];for(let i=0;i<60;i++){const d=new Date(Date.UTC(2026,0,5+7*i));seq.push(id(d.toISOString().slice(0,10)));}
  o.seq=seq;o.random=used;Math.random=mr;o.pool=__A.TW.get('TWISTS').daily.length;return o;});
const same=a=>a.every(x=>x&&x===a[0]);
chk('the twist is the same every day of an ISO week (Mon to Sun)',same(wk.weekA)||JSON.stringify(wk.weekA));
chk('the next week has a different twist',same(wk.weekB)&&wk.weekB[0]!==wk.weekA[0]||JSON.stringify(wk.weekB));
chk('ISO weeks across New Year: Dec 28 to Jan 3 is one week (2026-W53), Jan 4 starts the next',same(wk.yearEnd)&&wk.yearNext!==wk.yearEnd[0]||JSON.stringify(wk));
chk('ISO week numbers are right',JSON.stringify(wk.iso)===JSON.stringify([{y:2026,w:45},{y:2026,w:53},{y:2020,w:53},{y:2020,w:53}])||JSON.stringify(wk.iso));
chk('two weeks in a row never share a twist, and every twist comes up',wk.seq.every((x,i)=>!i||x!==wk.seq[i-1])&&new Set(wk.seq).size===wk.pool||JSON.stringify(wk.seq));
chk('picking the twist never calls Math.random',wk.random===0||wk.random);
chk('the pool has about ten twists',wk.pool>=8&&wk.pool<=12||wk.pool);
// ----- 2. each twist changes its rule (twist on vs the same trial with it off) -----
const m=await ev(()=>{const A=__A,T=A.TW,o={};const get=k=>T.get(k);
  const start=f=>{if(A.B)A.TW.get('endDaily')();A.V.modal=null;T.force=f;T.off=!f;A.ACT.dailyGo();return A.B;};
  const reseed=()=>get('RNG=seeded(424242)');
  const hero=()=>A.B.front.find(c=>c.hp>0);
  // heal skills and potions
  const healGain=()=>{const B=A.B,a=hero(),t=B.front.filter(c=>c.hp>0)[1];t.hp=1;reseed();A.perform(a,{id:'t',n:'Test heal',k:'heal',pw:1,t:'ally'},[t]);const g1=t.hp-1;
    t.hp=1;A.G.inv.potion=3;B.cur=a;A.useItem('potion',t);return [g1,t.hp-1];};
  start(null);const h0=healGain();start('heal');const h1=healGain();o.heal=[h0,h1];
  // fire reactions
  const react=(p,d)=>{const B=A.B,e=B.en[0];e.primed={el:p,t:2,by:'x'};const R=get('doReaction')(hero(),e,d);return R?R.m:0;};
  start(null);const f0=[react('fire','lightning'),react('water','lightning')];start('fire2');const f1=[react('fire','lightning'),react('water','lightning')];o.fire=[f0,f1];
  // shields one pip higher on the elite wave
  const elitePips=()=>{const B=A.B;B.wave=2;get('nextWave')();return B.en.map(e=>e.maxShield||0);};
  start(null);const s0=elitePips();start('shield');const s1=elitePips();o.shield=[s0,s1];
  // super effective hits
  const weakDmg=()=>{const B=A.B,a=hero(),e=B.en[0];const el=Object.keys(A.EL||get('EL')).find(x=>get('effOf')(x,e)>1);const sk={id:'t',k:'mag',pw:1,el};
    reseed();const r=A.calcDamage(a,sk,e);const neu=Object.keys(get('EL')).find(x=>get('effOf')(x,e)===1);reseed();const r2=A.calcDamage(a,{id:'t',k:'mag',pw:1,el:neu},e);return [r.dmg,r2.dmg,el];};
  start(null);const w0=weakDmg();start('weak');const w1=weakDmg();o.weak=[w0,w1];
  // statuses last a turn longer
  const stT=()=>{const a=hero();delete a.st.might;get('addSt')(a,'might',a,true);const f=hero().st.might.t;const e=A.B.en[0];delete e.st.slow;get('addSt')(e,'slow',a,true);return [f,e.st.slow.t];};
  start(null);const l0=stT();start('linger');const l1=stT();o.linger=[l0,l1];
  // every foe primed
  start(null);const p0=A.B.en.filter(e=>e.primed).length;start('primed');o.primed=[p0,A.B.en.filter(e=>e.primed).length,A.B.en.length];
  // crits
  start(null);const c0=get('WX')().crit||0;start('crit');o.crit=[c0,get('WX')().crit||0];
  // ward on the front line
  start(null);const wd0=A.B.front.filter(c=>c.st.ward).length;start('ward');o.ward=[wd0,A.B.front.filter(c=>c.hp>0&&c.st.ward).length,A.B.front.filter(c=>c.hp>0).length];
  // limits
  start(null);const lb0=A.B.front.map(c=>c.lb||0);start('limit');o.limit=[lb0,A.B.front.map(c=>c.lb||0)];
  // glass foes
  start(null);const g0=A.B.en.map(e=>[e.S.mhp,e.S.atk]);start('glass');o.glass=[g0,A.B.en.map(e=>[e.S.mhp,e.S.atk])];
  // the twist never leaks out of the trial: a journey battle with the same force set behaves normally
  A.TW.get('endDaily')();A.V.modal=null;T.force='heal';o.outside=get('WX')().heal||1;T.force=null;T.off=false;
  return o;});
console.log(JSON.stringify(m));
const near=(a,b,t)=>Math.abs(a-b)<=t;
chk('Healing halved: heal skill restores half',near(m.heal[1][0],m.heal[0][0]*.5,1.01)||JSON.stringify(m.heal));
chk('Healing halved: a potion restores half',m.heal[1][1]===Math.round(m.heal[0][1]*.5)||JSON.stringify(m.heal));
chk('Fire reactions deal double (and only fire ones)',near(m.fire[1][0],m.fire[0][0]*2,1e-9)&&m.fire[1][1]===m.fire[0][1]&&m.fire[0][0]>0||JSON.stringify(m.fire));
chk('Shields start one pip higher',m.shield[0].some(x=>x>0)&&m.shield[1].every((x,i)=>x===(m.shield[0][i]?m.shield[0][i]+1:0))||JSON.stringify(m.shield));
chk('Weak spots: super effective hits deal 25% more, neutral hits unchanged',near(m.weak[1][0],m.weak[0][0]*1.25,1)&&m.weak[1][1]===m.weak[0][1]||JSON.stringify(m.weak));
chk('Statuses last one more turn (buff and debuff)',m.linger[1][0]===m.linger[0][0]+1&&m.linger[1][1]===m.linger[0][1]+1||JSON.stringify(m.linger));
chk('Every foe is primed at start',m.primed[0]===0&&m.primed[1]===m.primed[2]&&m.primed[2]>0||JSON.stringify(m.primed));
chk('Sharp eyes: crit chance +10%',near(m.crit[1]-m.crit[0],.1,1e-9)||JSON.stringify(m.crit));
chk('Warded entry: the front line starts with Ward',m.ward[0]===0&&m.ward[1]===m.ward[2]&&m.ward[2]>0||JSON.stringify(m.ward));
chk('Limits start half charged',m.limit[0].every(x=>x<50)&&m.limit[1].every(x=>x>=50)||JSON.stringify(m.limit));
chk('Glass foes: 20% less HP, 20% more attack',m.glass[1].every((g,i)=>near(g[0],m.glass[0][i][0]*.8,1)&&near(g[1],m.glass[0][i][1]*1.2,.01))||JSON.stringify(m.glass));
chk('twists only act inside the Daily Trial',m.outside===1||m.outside);
// ----- 3. entry screen and battle chip, at both sizes -----
for(const [w,h] of [[390,844],[933,705]]){
  await page.setViewportSize({width:w,height:h});
  const u=await ev(()=>{const A=__A,o={};if(A.B)A.TW.get('endDaily')();A.TW.force=null;A.TW.off=false;A.V.screen='title';A.V.modal=null;A.render();A.ACT.daily();
    const T=A.TW.forKey(A.TW.get('dailyKey')());const box=document.querySelector('#modal .twbox');o.intro=!!box&&box.textContent.includes(T.n)&&box.textContent.includes(T.d);
    const p=document.querySelector('#modal .panel');o.introFit=p?p.scrollWidth<=p.clientWidth+1&&box.getBoundingClientRect().right<=innerWidth:false;
    A.ACT.dailyGo();A.render();const c=document.querySelector('#border .wchip.tw');o.chip=!!c&&c.textContent.includes(T.c);
    if(c){const r=c.getBoundingClientRect();o.chipVis=r.left>=0&&r.right<=innerWidth&&r.height>0;}
    o.pageFit=document.scrollingElement.scrollWidth<=innerWidth;
    c&&c.click();o.info=A.V.modal&&A.V.modal.type==='wxinfo'&&document.querySelector('#modal').textContent.includes(T.d);o.paused=A.TW.get('battlePaused')();
    A.ACT.closeModal();return o;});
  await page.screenshot({path:__dirname+'/shots-v053/v063_daily_'+w+'.png'});
  chk(`${w}x${h}: entry screen shows this week's twist and what it means`,u.intro===true||JSON.stringify(u));
  chk(`${w}x${h}: entry screen fits`,u.introFit===true||JSON.stringify(u));
  chk(`${w}x${h}: battle chip shown and on screen`,u.chip===true&&u.chipVis===true||JSON.stringify(u));
  chk(`${w}x${h}: tapping the chip explains it and pauses the fight`,u.info===true&&u.paused===true||JSON.stringify(u));
  chk(`${w}x${h}: no sideways scroll`,u.pageFit===true);
}
await H.browser.close();
// ----- 4. determinism with a twist on: same date, same build, same outcome -----
const runOnce=async force=>{const H2=await open({w:933,h:705});const {page:pg,ev:e2}=H2;
  await pg.clock.install({time:DAY});
  await e2(f=>{const A=__A;A.TW.force=f;A.META.cfg.hints=false;A.META.cfg.gfx='low';A.TW.get('PAUSE=20');A.ACT.dailyGo();A.B.auto=true;A.V.auto=true;},force);
  let r=null;for(let i=0;i<60&&!r;i++){await pg.clock.runFor(1000);r=await e2(()=>{const m=__A.V.modal;if(m&&m.type==='dailyEnd')return {won:m.won,score:m.score,turns:m.turns,kos:m.kos,log:(__A.B.log||[]).map(l=>typeof l==='string'?l:JSON.stringify(l)).join('|'),tw:__A.B.twist};return null;});}
  await H2.browser.close();return r;};
for(const f of ['primed','glass']){
  const a=await runOnce(f),b=await runOnce(f);console.log(f,JSON.stringify(a&&Object.assign({},a,{log:a.log.length})));
  chk(`deterministic with "${f}" on: two runs of the same date end the same`,!!a&&a.tw===f&&JSON.stringify(a)===JSON.stringify(b)||JSON.stringify([a,b]));
}
await done({browser:{close:async()=>{}}});
})();
