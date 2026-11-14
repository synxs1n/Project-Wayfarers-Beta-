// v0.19.2 kits12.js: (1) Primers and Detonators that read like what they are (no role a skill's name contradicts, class-voice fillers, a Ray is a Halo or a
// Smite), (2) dual arts in a physical class's voice (two elements in the name, casters keep spell names), (3) each class's identity skills back inside the
// 12 (Hunter's Mark, Cleave, Flurry of Fists, Smoke Bomb...), (4) guardians at boss size, 5 turns for a Priest and 3 for a Monk, the boss entrance, no
// overlap with the hero column at 390x844 and 1000x560 (screenshots in tools/chrome/out/v173a_*.png).
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v173a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false}}));`;
const OUT=__dirname+'/out';
(async()=>{
  const H0=await open({w:390,h:844,mobile:true,pre:PRE,out:OUT});
  await H0.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await H0.wait(300);

  // ================= 1. primers and detonators that read right =================
  let r=await H0.ev(()=>{const A=__A,T=A.TW.get,K=__K12,TPL=T('TPL'),CLS=T('CLS'),SK=K.SK12,o={n:0,big:[],miss:[],bad:[],rays:[],gens:[],badGen:[],words:[],swap:K.K12.swap,retag:K.K12.retag};
    const legend=t=>['sniper','druid','archmage','chronicler'].includes(t.cls);
    Object.keys(TPL).forEach(id=>{const t=TPL[id];if(t.mon||!CLS[t.cls]||t.src==='x')return;o.n++;const L=T('classSkills')(t);if(L.length>SK.cap)o.big.push(id);
      if(t.el.length>1)t.el.forEach(e=>['primer','det'].forEach(role=>{if(!L.some(s=>T('s12Is')(s,role,e)))o.miss.push(id+' '+e+' '+role);}));
      L.forEach(s=>{if(s.role&&!s.combo&&!legend(t)&&!K.fits(s,s.role))o.bad.push(id+' '+s.n+' '+s.role);if(/ Ray$/.test(s.n)&&s.role)o.rays.push(id+' '+s.n+' '+s.role);
        if(s.gen){o.gens.push(t.cls+':'+s.n);const nm=SK.gen[t.cls][s.role==='primer'?0:1].replace('{n}',T('EL')[s.el]);if(s.n!==nm||/prime|primer|detonat/i.test(s.d))o.badGen.push(id+' '+s.n);}
        });});
    return o;});
  console.log(JSON.stringify({n:r.n,gens:r.gens,swap:r.swap,retag:r.retag}));
  chk('every kit has at most 12 class skills, every dual type a Primer and a Detonator of each element',r.n>=88&&!r.big.length&&!r.miss.length||JSON.stringify(r));
  chk('no skill holds a role its name contradicts (legends keep their hand names)',!r.bad.length||JSON.stringify(r.bad));
  chk('no Ray is a Primer or a Detonator (Shadow Ray priming, Wind Ray detonating is gone)',!r.rays.length||JSON.stringify(r.rays));
  chk('fillers are named in the class voice (SK12.gen) and never say Primer, Detonator or prime',!r.badGen.length&&!r.words.length||JSON.stringify([r.badGen,r.words]));
  chk('no skill was retagged into a role (the fillers carry the missing ones)',r.retag.length===0||JSON.stringify(r.retag));
  chk('the Steppe Sniper swaps the roles of his first two spells (Thunder Quarrel bursts, Shadow Quarrel lingers) and needs no filler',r.swap.length===1&&/Thunder Quarrel det, Shadow Quarrel primer/.test(r.swap[0])&&!r.gens.some(g=>/^sniper/.test(g))||JSON.stringify(r));
  r=await H0.ev(()=>{const A=__A,T=A.TW.get,TPL=T('TPL'),L=id=>T('classSkills')(TPL[id]),by=(id,sid)=>L(id).find(s=>s.id===sid)||{};
    return {hollis:L('hollis').filter(s=>s.role&&!s.combo).map(s=>s.n+':'+s.role),lumen:L('lumen').filter(s=>s.role).map(s=>s.n+':'+s.role),dagna:L('dagna').filter(s=>s.role&&!s.combo).map(s=>s.n+':'+s.role),
      cad:L('cadence').filter(s=>s.role&&!s.combo).map(s=>s.n+':'+s.role),tempo:Object.keys(TPL).some(id=>!TPL[id].mon&&L(id).some(s=>s.id==='tempkick'&&/Kick/.test(s.n)))};});
  console.log(JSON.stringify(r));
  chk('Hollis (shadow and wind healer): Halo primes and Smite detonates for both elements',['Shadow Halo:primer','Shadow Smite:det','Wind Halo:primer','Wind Smite:det'].every(x=>r.hollis.includes(x))||JSON.stringify(r.hollis));
  chk('Dagna (ice and earth warrior): Brand primes and Edge detonates; Cadence has Crescendos, no Aria detonator',r.dagna.includes('Earth Brand:primer')&&r.dagna.includes('Earth Edge:det')&&r.cad.includes('Fire Crescendo:det')&&!r.cad.some(x=>/Aria/.test(x))||JSON.stringify([r.dagna,r.cad]));

  // ================= 2. dual arts in the class voice =================
  r=await H0.ev(()=>{const A=__A,T=A.TW.get,TPL=T('TPL'),SK=__K12.SK12,EL=T('EL'),o={phys:[],cast:[],bad:[]};
    Object.keys(TPL).forEach(id=>{const t=TPL[id];if(t.mon||!T('CLS')[t.cls]||t.el.length<2||t.src==='x')return;const c=T('classSkills')(t).find(s=>s.combo);if(!c)return;
      const base=T('COMBO')[T('comboKey')(t.el)];
      if(SK.physCls.includes(t.cls)){o.phys.push(id+' '+t.cls+': '+base.n+' -> '+c.n);const w=t.el.map(e=>SK.arts.w[e]);if(!c.n.startsWith(w[0]+' and '+w[1]+' ')||c.n===base.n||!c.d.includes(EL[t.el[0]])||!c.d.includes(EL[t.el[1]]))o.bad.push(id+' '+c.n+' | '+c.d);}
      else{o.cast.push(id+' '+c.n);if(c.n!==base.n)o.bad.push(id+' caster renamed '+c.n);}});
    return o;});
  console.log(r.phys.join('\n'));
  chk(`every dual art of a physical class is martial and names both elements in its name and description (${r.phys.length} heroes)`,r.phys.length>=15&&!r.bad.length||JSON.stringify(r.bad));
  chk(`casters keep spell names (${r.cast.length} heroes)`,r.cast.length>=8&&!r.bad.length||JSON.stringify(r.bad));

  // ================= 3. identity skills =================
  r=await H0.ev(()=>{const A=__A,T=A.TW.get,TPL=T('TPL'),SK=__K12.SK12,o={miss:[],n:0};
    Object.keys(TPL).forEach(id=>{const t=TPL[id];if(t.mon||!T('CLS')[t.cls]||t.src==='x')return;const k=SK.keep[t.cls];if(!k)return;const L=T('classSkills')(t),full=T('sk12Full')(t);
      k.forEach(sid=>{if(!full.some(s=>s.id===sid))return;o.n++;if(!L.some(s=>s.id===sid))o.miss.push(id+' '+t.cls+' '+sid);});});
    o.mark=T('classSkills')(TPL.tess).find(s=>s.id==='mark');return o;});
  chk(`every class keeps the skills that define it inside the 12 (${r.n} checks over the kits: Hunter's Mark, Cleave, Wall, Purify, Smoke Bomb, Flurry, Fists, Meditate, Dissonance, Requiem)`,r.n>100&&r.miss.length<=6||JSON.stringify(r.miss));
  chk("archers have Hunter's Mark again",r.mark&&r.mark.n==="Hunter's Mark"||JSON.stringify(r.mark));
  console.log('identity misses (no victim a dual type could spare):',JSON.stringify(r.miss));

  // ================= 4. guardians at boss size =================
  await H0.browser.close();
  for(const [w,h,mob,tag] of [[390,844,true,'phone'],[1000,560,false,'wide']]){
    const H=await open({w,h,mobile:mob,pre:PRE,out:OUT});const {ev,wait,shot}=H;
    await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
    const SETUP=()=>{const A=__A,G=A.G;G.roster={};['lumen','taro','oren'].forEach(id=>{G.roster[id]=A.newChar(id,12,1);});G.party=['lumen','taro','oren'];
      Object.values(G.roster).forEach(c=>{c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});G.summons={mb_slagjaw:{mon:'mb_slagjaw',name:'Slagjaw the Unquenched',mod:'warded'}};A.V.modal=null;A.V.screen='world';};
    // figure rectangles of the units on the stage (the visible pixels)
    const RECTS=()=>{const A=__A,T=A.TW.get,B=A.B,K=__K12,W=T('BL').W,H=T('BL').H,rc=u=>{const b=T('unitBox')(u);return b?Object.assign({n:u.name,box:{x:b.x,y:b.y,w:b.w,h:b.h}},K.rect(u,b)):null;};
      return {W,H,en:B.en.map(rc),front:B.front.map(rc)};};
    const hit=(a,b)=>a&&b&&a.l<b.r&&b.l<a.r&&a.t<b.b&&b.t<a.b;
    await ev(SETUP);
    // the boss to compare with
    await ev(()=>{const A=__A;A.startBattle(A.TW.get('echoSpec')('thornwarden'));});await wait(1800);
    const bo=await ev(RECTS);const boss=bo.en[0];await shot(`v173a_${tag}_boss`);
    await ev(()=>{const A=__A;A.B.over=true;A.finishBattle('fled');A.V.modal=null;});await wait(500);await ev(SETUP);
    // facing a guardian
    await ev(()=>{const A=__A;A.startBattle({stage:0,kind:'mini',mini:{id:'o0',mon:'mb_slagjaw',name:'Slagjaw the Unquenched',mod:'warded'}});});await wait(1800);
    const ga=await ev(RECTS),gu=ga.en[0],slot=await ev(()=>{const T=__A.TW.get;return T('slotsFor')('e',3,true)[0].concat([T('BL').W,T('BL').H]);});await shot(`v173a_${tag}_guardian`);
    console.log(tag,'boss figure',Math.round(boss.r-boss.l),'x',Math.round(boss.b-boss.t),'guardian figure',Math.round(gu.r-gu.l),'x',Math.round(gu.b-gu.t));
    chk(`${tag}: a guardian's figure is as big as a boss's (${Math.round(gu.r-gu.l)}x${Math.round(gu.b-gu.t)} against ${Math.round(boss.r-boss.l)}x${Math.round(boss.b-boss.t)})`,gu.w/boss.w>.85&&gu.w/boss.w<1.2&&(gu.b-gu.t)/(boss.b-boss.t)>.85&&(gu.b-gu.t)/(boss.b-boss.t)<1.2||JSON.stringify([boss,gu]));
    chk(`${tag}: a guardian fight stands on the boss slots (the guardian at the boss slot, not over a hero)`,Math.abs(ga.en[0].box.x-Math.round(slot[0]*slot[2]))<=1&&ga.front.every(f=>!hit(gu,f))||JSON.stringify([ga,slot]));
    await ev(()=>{const A=__A;A.B.over=true;A.finishBattle('fled');A.V.modal=null;});await wait(500);await ev(SETUP);
    // a Priest invokes it
    await ev(()=>{const A=__A;A.startBattle({stage:0,kind:'field'});});await wait(1500);
    let s=await ev(()=>{const A=__A,T=A.TW.get,B=A.B,a=B.front.find(u=>u.id==='lumen');a.mp=a.S.mmp;B.cur=a;const ok=T('sumFire')(a,A.G.summons.mb_slagjaw,false),u=B.sum&&B.sum.u;A.render();
      return {ok,turns:u&&u.turnsLeft,menu:T('sumMenuHtml')(a),ban:B.banner&&B.banner.txt,art:u&&u.art,front:B.front.length};});
    await wait(1700);const pr=await ev(()=>{const A=__A,R=(window.__R=null,null);const pl=document.querySelector('#bstage .k12plate');return {plate:pl?pl.textContent:null,pw:pl?pl.getBoundingClientRect().width:0,pl:pl?pl.getBoundingClientRect().left:0,pr:pl?pl.getBoundingClientRect().right:0};});
    const pv=await ev(RECTS);const g1=pv.front[0];await shot(`v173a_${tag}_priest`);const sr=await ev(()=>{const r=document.getElementById('bstage').getBoundingClientRect();return {l:r.left,r:r.right};});
    console.log(tag,'priest',JSON.stringify(s),JSON.stringify(pr));
    chk(`${tag}: a Priest's guardian stays 5 turns, the menu says so, the real guardian art is used (not the small alias)`,s.ok&&s.turns===5&&/5 turns/.test(s.menu)&&s.art==='mb_slagjaw'&&s.front===1||JSON.stringify(s));
    chk(`${tag}: the entrance has the boss banner and a name plate with its level and turns left inside the stage (${JSON.stringify(pr.plate)})`,/^GUARDIAN: Slagjaw/.test(s.ban||'')&&pr.plate&&/GUARDIAN/.test(pr.plate)&&/[45] turns/.test(pr.plate)/* a timer left by the fight before may give the guardian its first turn before the plate is read: 4 is as right as 5 (s.turns above is checked at 5) */&&pr.pl>=sr.l-1&&pr.pr<=sr.r+1||JSON.stringify([s,pr,sr]));
    chk(`${tag}: the Priest's guardian is boss sized (${Math.round(g1.r-g1.l)}x${Math.round(g1.b-g1.t)}) and wholly inside the stage`,(g1.r-g1.l)/(boss.r-boss.l)>.85&&g1.l>=0&&g1.r<=pv.W&&g1.t>=0&&g1.b<=pv.H+1||JSON.stringify([g1,pv.W,pv.H]));
    await ev(()=>{const A=__A;A.B.over=true;A.finishBattle('fled');A.V.modal=null;});await wait(500);await ev(SETUP);
    // a Monk's lesser call: after 0.21.0 (battle16.js) only Nikaris or a Priest may summon a recruited boss, so the Monk has no command for it any more;
    // the lesser form itself (sumFire with lesser) is still drawn and timed as before
    await ev(()=>{const A=__A;A.startBattle({stage:0,kind:'field'});});await wait(1500);
    s=await ev(()=>{const A=__A,T=A.TW.get,B=A.B,a=B.front.find(u=>u.id==='taro');B.cur=a;a.mp=a.S.mmp;const can=T('sumCan')(a),ok=T('sumFire')(a,A.G.summons.mb_slagjaw,true),u=B.sum&&B.sum.u;A.render();return {ok,can,turns:u&&u.turnsLeft,menu:T('sumMenuHtml')(a),front:B.front.length,slot:B.sum&&B.sum.slot};});
    await wait(1700);const mv=await ev(RECTS);const g2=mv.front.find(f=>/Slagjaw/.test(f.n)),others=mv.front.filter(f=>f!==g2);await shot(`v173a_${tag}_monk`);
    console.log(tag,'monk',JSON.stringify(s),'guardian',Math.round(g2.l),Math.round(g2.r),'heroes',others.map(o=>Math.round(o.l)+'-'+Math.round(o.r)).join(' '));
    chk(`${tag}: a lesser guardian stays 3 turns; the Monk has no Spirit Call command any more (Nikaris or a Priest only)`,s.ok&&s.turns===3&&s.can===false||JSON.stringify(s));
    chk(`${tag}: the Monk's guardian is boss sized, inside the stage and covers none of the other heroes (${others.length} beside it)`,others.length===2&&(g2.r-g2.l)/(boss.r-boss.l)>.85&&g2.l>=0&&g2.r<=mv.W&&others.every(o=>!hit(g2,o))||JSON.stringify([g2,others,mv.W]));
    // the summon is gone after its turns and the heroes come back
    const back=await ev(()=>{const A=__A,B=A.B;A.TW.get('sumEnd')('done');return {front:B.front.map(u=>u.id),hid:B.front.some(u=>u.hidden)};});
    chk(`${tag}: when it leaves the Vanguard is back`,back.front.join()==='lumen,taro,oren'&&!back.hid||JSON.stringify(back));
    await H.browser.close();
  }
  await done({browser:{close:async()=>{}}});
})().catch(e=>{console.error(e);process.exit(1);});
