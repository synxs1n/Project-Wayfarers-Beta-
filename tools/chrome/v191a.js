// battle pass 17 (v3/roster17.js), the owner's four playtest notes after 0.21.6:
// 1) Monks call again. After 0.22.3 (legends18, summon8.js SUM.call): a Monk Invokes as a Priest does, at any level (two turns of stillness, the full
//    guardian in the whole Vanguard's place for 4 turns; a Priest: one turn, 5), and a Lesser Scourge answers a Monk under the Priest's rules (full
//    strength, 4 turns; boss sized and in the whole Vanguard's place); Nikaris and Priests as in 0.21.4; the other classes read the note
// 2) the Pets tab is Summons: sections for pets, recruited bosses, Sanctum guardians and Nikaris's beast calls, each entry with who can call it or why
//    nobody can; pairing still works; ids and save keys kept
// 3) kits of 14: all 92 wayfarers have 14 class skills, at least 2 that no other wayfarer has, exactly 3 at level 10, single learns from 11 to 45 no
//    more than 4 levels apart; the signature at 18 and the second own skill at 38; a save marked 3 keeps every skill it knew and is marked 4
// 4) Wellspring Mantle (Mage, Archmage, Chronicler): 80% of the damage taken is paid in MP, hits and poison alike; overkill and an empty MP bar end it;
//    previews show the HP part and never spend MP; it shows as a status with its own icon
// Usage: PWHTML=<abs path to out/aurelis3.html> node v191a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false,tips:false,hd2d:false,timedHits:false}}));`;
const START=ids=>{const A=__A;A.ACT.new();ids.forEach(i=>A.ACT.pickS(i));A.ACT.begin();try{A.ACT.storyOk();}catch(e){}A.V.modal=null;A.render();};
const CMD=()=>{const B=__A.B;return B&&B.mode==='cmd'&&B.cur&&B.cur.side==='p'&&B.cur.id;};
const ROOTS=['hollow','ash','ember','thorn','gloam','bone','mist','spire','cinder','frost','crown','root','deep','mere'];
(async()=>{
// ---------- 3. kits of 14 ----------
{const H=await open({w:390,h:844,pre:PRE});const {ev,wait}=H;
 const r=await ev(()=>{try{window.__R25.R25.off=true;}catch(e){}/* 0.22.25: this test is about the class kits of 14; a worn personal relic adds a fifteenth skill (v209a) */const A=__A,g=A.TW.get,TPL=g('TPL'),R=__R17.R17,U=__R17.unique(),o={n:0,bad:[],sets:{},own:{},place:[],names:[],late:0,newN:0,rest:0};
  const all={};Object.keys(U).forEach(id=>g('classSkills')(TPL[id]).forEach(s=>{(all[s.n]=all[s.n]||[]).push(id);}));
  Object.keys(U).forEach(id=>{const u=U[id],p=[],K=g('classSkills')(TPL[id]).slice().sort((a,b)=>a.lv-b.lv),L=K.map(s=>s.lv);o.n++;
   if(u.n!==14)p.push('skills '+u.n);if(u.own.length<2)p.push('own '+u.own.length);if(L.filter(x=>x<=10).length!==3)p.push('at 10: '+L.filter(x=>x<=10).length);
   if(L.join()!==R.lv.join())p.push('levels '+L.join());if(new Set(K.map(s=>s.id)).size!==14)p.push('duplicate id');if(new Set(K.map(s=>s.n)).size!==14)p.push('duplicate name');
   for(let i=4;i<L.length;i++)if(L[i]-L[i-1]>4||L[i]===L[i-1])p.push('gap '+L[i-1]+'-'+L[i]);
   if(K.some(s=>!s.d||!s.n||!s.k))p.push('data');
   o.sets[L.join(',')]=(o.sets[L.join(',')]||0)+1;o.own[u.own.length]=(o.own[u.own.length]||0)+1;if(p.length)o.bad.push(id+': '+p.join('/'));
   const a=R.audit[id]||{},t=TPL[id],legend=t.src==='L'||t.src==='x';
   if(!legend){const sig=K.find(s=>s.id==='sg_'+id);if(!sig||sig.lv!==18||all[sig.n].length!==1)o.place.push(id+' signature at '+(sig&&sig.lv));
    if(a.late){o.late++;const s=K.find(x=>x.id===a.late);if(!s||s.lv!==38||all[s.n].length!==1||!/Only .* has this skill\.$/.test(s.d))o.place.push(id+' second own skill '+(s&&s.n)+' at '+(s&&s.lv));}}
   if(R.sk[id]){o.newN++;const s=K.find(x=>x.id==='s2_'+id);if(!s||all[s.n].length!==1)o.place.push(id+' new skill missing or shared');else o.names.push(s.n);}
   if(R.add[id].some(x=>x[0]==='*'))o.rest++;});
  // what heroes really know at a level
  o.kn={};[1,5,10,11,18,38,45].forEach(lv=>{o.kn[lv]=['brann','mira','lumen','taro','gilda','nikaris','jaeson'].map(id=>{const c=g('newChar')(id,lv);c.lv=lv;delete c.keep;return g('classSkills')(TPL[id]).filter(s=>g('skillKnown')(c,s)).length;});});
  // migration: on a save marked 3 nobody loses a skill at any level (lvR is the 0.21.4 level), and the save is marked 4
  o.mig={lost:[],kept:0};Object.keys(U).forEach(id=>{[5,8,12,16,22,30,37,44].forEach(lv=>{const c=g('newChar')(id,lv);c.lv=lv;delete c.keep;const G0={roster:{[id]:c},m14lv:3};
    const K=g('classSkills')(TPL[id]),was=K.filter(s=>s.lvR!=null&&s.lvR<=lv).map(s=>s.id);__R17.keep(G0);const now=new Set(K.filter(s=>g('skillKnown')(c,s)).map(s=>s.id));
    o.mig.kept+=(c.keep||[]).length;if(G0.m14lv!==4||was.some(x=>!now.has(x)))o.mig.lost.push(id+'@'+lv);});});
  const mk=flag=>{const c=g('newChar')('brann',8);c.lv=8;delete c.keep;const G0={roster:{brann:c}};if(flag!=null)G0.m14lv=flag;const n=__R17.keep(G0);return [G0.m14lv,n,g('classSkills')(TPL.brann).filter(s=>g('skillKnown')(c,s)).length];};
  o.flags={f4:mk(4),f3:mk(3),f2:mk(2),f1:mk(1),f0:mk(null)};o.q={lvQ:g('classSkills')(TPL.brann).filter(s=>s.lvQ!=null&&s.lvQ<=8).length,lvR:g('classSkills')(TPL.brann).filter(s=>s.lvR!=null&&s.lvR<=8).length};
  // a loaded save: new skills the hero has the level for are marked New on the sheet, no queue
  {const c=g('newChar')('mira',40);c.lv=40;delete c.keep;const old=g('classSkills')(TPL.mira).filter(s=>s.lvR!=null).map(s=>s.id);const G0={roster:{mira:c},m14lv:3,skSeen:{mira:old.slice()}};__R17.keep(G0);
   o.seen={nw:(G0.skNew&&G0.skNew.mira)||[],msg:!!G0.r17msg,seen:G0.skSeen.mira.length};}
  A.ACT.new();['brann','mira','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();o.newFlag=A.G.m14lv;o.start=A.G.party.map(id=>g('known')(A.G.roster[id]).length);
  // the save round trip keeps the mark and the kits
  try{const raw=JSON.parse(JSON.stringify(g('packG')()));const g2=g('unpackG')(raw);o.rt=g2.m14lv;}catch(e){o.rt='ERR '+e.message;}
  o.mantle=Object.keys(U).filter(id=>g('classSkills')(TPL[id]).some(s=>s.id==='mantle')).map(id=>TPL[id].cls).sort().join().replace(/mage(,mage)+/,'mage x'+Object.keys(U).filter(id=>TPL[id].cls==='mage').length);
  o.mantleLv=[...new Set(Object.keys(U).map(id=>(g('classSkills')(TPL[id]).find(s=>s.id==='mantle')||{}).lv).filter(Boolean))].sort((a,b)=>a-b);
  return o;});
 console.log('kits:',JSON.stringify(Object.assign({},r,{names:r.names.length})));
 chk(`all ${r.n} wayfarers: 14 class skills, at least 2 that no other wayfarer has, exactly 3 at level 10, no two skills alike in a kit (own skills per hero: ${JSON.stringify(r.own)})`,r.n===94&&r.bad.length===0||r.bad.slice(0,8).join(' | '));
 chk(`one schedule for every kit: ${Object.keys(r.sets).join(' ; ')} (single learns after the start, no gap over 4 levels from 11 on)`,Object.keys(r.sets).length===1&&Object.keys(r.sets)[0]==='1,1,6,11,14,18,21,25,28,31,35,38,42,45'||JSON.stringify(r.sets));
 chk(`the signature sits at level 18 for all 88 regular wayfarers and the second own skill at 38 for the ${r.late} that gained one (${r.newN} new skills, ${r.rest} wayfarers with a restored original)`,r.place.length===0&&r.late>=40&&r.newN===26||r.place.slice(0,8).join(' | ')+' '+r.late+' '+r.newN);
 const rooty=r.names.filter(n=>ROOTS.some(x=>n.toLowerCase().includes(x)));
 chk(`the ${r.names.length} new skills have their own names, none on an overused root`,r.names.length===26&&new Set(r.names).size===26&&rooty.length===0||rooty.join());
 chk(`known at levels 1, 5, 10, 11, 18, 38, 45: ${[1,5,10,11,18,38,45].map(l=>r.kn[l].join('/')).join(' ; ')}`,r.kn[1].every(x=>x===2)&&r.kn[5].every(x=>x===2)&&r.kn[10].every(x=>x===3)&&r.kn[11].every(x=>x===4)&&r.kn[18].every(x=>x===6)&&r.kn[38].every(x=>x===12)&&r.kn[45].every(x=>x===14)||JSON.stringify(r.kn));
 chk(`old saves marked 3: at eight levels for each of the 92 nobody loses a skill it knew, the save is marked 4 (${r.mig.kept} skills kept by name)`,r.mig.lost.length===0&&r.mig.kept>0||r.mig.lost.slice(0,10).join());
 chk(`marks: 4 is left alone (${r.flags.f4}), 3, 2, 1 and unmarked all end at 4 (${r.flags.f3} / ${r.flags.f2} / ${r.flags.f1} / ${r.flags.f0}); a level 8 Brann marked 2 keeps the ${r.q.lvQ} skills of the 0.20.9 levels`,
  r.flags.f4[0]===4&&r.flags.f4[1]===0&&[r.flags.f3,r.flags.f2,r.flags.f1,r.flags.f0].every(f=>f[0]===4)&&r.flags.f2[2]>=r.q.lvQ&&r.flags.f3[2]>=r.q.lvR||JSON.stringify([r.flags,r.q]));
 chk(`a loaded hero's new skills are marked New without a queue of notices (${r.seen.nw.join()}), with one toast`,r.seen.nw.length===2&&r.seen.nw.includes('mantle')&&r.seen.nw.includes('s2_mira')&&r.seen.msg||JSON.stringify(r.seen));
 chk(`a new journey is marked ${r.newFlag}, the three starters know ${r.start.join('/')} skills, and the mark survives a save and load (${r.rt})`,r.newFlag===4&&r.start.every(x=>x===2)&&r.rt===4||JSON.stringify([r.newFlag,r.start,r.rt]));
 chk(`Wellspring Mantle is a class skill of the robe casters only (${r.mantle}), learned at level ${r.mantleLv.join(' or ')}`,r.mantle==='archmage,chronicler,mage x11'&&r.mantleLv.every(l=>l>=11&&l<=25)||JSON.stringify([r.mantle,r.mantleLv]));

 // ---------- 2. the Summons menu ----------
 await ev(START,['brann','taro','lumen']);await wait(150);
 const m=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,MON=g('MON'),GU=g('GUARDIANS'),o={};
  A.META.legends=Object.assign({},A.META.legends,{nikaris:1});
  G.party.forEach(id=>{const c=G.roster[id];c.lv=20;A.refresh(c);});G.roster.taro.lv=6;A.refresh(G.roster.taro);
  const mk=Object.keys(MON)[0],gk=Object.keys(GU)[0],mini=g('MINIS')[0];
  const pet=(id,mon,sc,w)=>{const d=MON[mon]||g('guardianDef')(mon);const p={id,mon,name:(sc?'Lesser ':'')+d.n,cls:g('tameClass')(d),trait:g('tameTrait')(d),bb:sc?1:0,scourge:sc?1:0,with:w,bt:0};g('registerTamed')(p);return p;};
  o.empty=g('vCompanions')();
  G.tamed=[pet('tmA',mk,0,'brann'),pet('tmB',gk,1,'brann'),pet('tmC',Object.keys(MON)[1],0,null)];G.summons={[mini[0]]:{mon:mini[0],name:mini[2],mod:mini[5]}};
  o.h1=g('vCompanions')();
  // the Monk reaches level 10; the Scourge moves to him
  G.roster.taro.lv=10;A.refresh(G.roster.taro);G.tamed[1].with='taro';o.h2=g('vCompanions')();
  // no Priest, no Monk in the roster: nobody can call a boss or a guardian
  const keep=G.roster;G.roster={brann:keep.brann};const p0=G.party;G.party=['brann'];G.tamed[1].with='brann';o.h3=g('vCompanions')();G.roster=keep;G.party=p0;
  // Nikaris joins: beast calls
  A.recruit('nikaris',true);o.h4=g('vCompanions')();
  // the menu itself: the tab, pairing from the list
  A.V.modal={type:'menu',tab:'comp'};A.render();const tabs=[...document.querySelectorAll('.modal [data-act]')].map(b=>b.textContent.trim());
  o.tab=tabs.filter(t=>/^Summons$/.test(t)).length;o.petsTab=tabs.filter(t=>/^Pets$/.test(t)).length;o.sub=g('MENU_SUB').comp;o.rows=document.querySelectorAll('.modal .comprow').length;o.heads=[...document.querySelectorAll('.modal .r17h')].map(h=>h.textContent.trim());
  const pick=document.querySelector('.modal .comprow [data-act=compPick][data-arg=tmC]');o.pick=!!pick;if(pick){pick.click();const set=[...document.querySelectorAll('.modal [data-act=compSet]')].find(b=>b.dataset.arg==='lumen');if(set)set.click();}
  o.paired=G.tamed[2].with;o.saveKeys={tamed:Array.isArray(g('packG')().tamed),summons:!!g('packG')().summons};
  A.V.modal=null;A.render();return o;});
 const txt=h=>String(h||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
 console.log('summons:',JSON.stringify({tab:m.tab,petsTab:m.petsTab,sub:m.sub,rows:m.rows,heads:m.heads,paired:m.paired}));
 chk(`the tab reads Summons (${m.tab} button, ${m.petsTab} still saying Pets; MENU_SUB.comp "${m.sub}"), with the sections ${m.heads.join(' | ')}`,m.tab>=1&&m.petsTab===0&&m.sub==='Summons'&&['Pets','Recruited bosses','Sanctum guardians','Beast calls'].every((s,i)=>(m.heads[i]||'').startsWith(s))||JSON.stringify(m.heads));
 chk('an empty list names every source and how to get it',/No pets yet/.test(m.empty)&&/No Lesser Scourge/.test(m.empty)&&/No guardian is bound/.test(m.empty)&&/Nikaris, a Priest or a Monk can summon a recruited boss/.test(m.empty)||txt(m.empty).slice(0,300));
 const t1=txt(m.h1),t2=txt(m.h2),t3=txt(m.h3),t4=txt(m.h4);
 chk('a paired pet names its hero as the caller; an unpaired one says to pair it',/Who can call it: Brann : Summon, once per battle \(3 turns, in Brann's place\)/.test(t1)&&/Nobody can call it yet: pair it with any hero/.test(t1)||t1.slice(0,500));
 chk('a Lesser Scourge paired with a Warrior: he keeps the bonus, cannot call it, and the list says who could (the Priest and the Monk, at any level)',/Nobody can call it yet: Brann keeps its bonus but cannot call a recruited boss\. Pair it with Lumen , Taro \./.test(t1)||t1.slice(0,900));
 chk('a guardian: the Priest Invokes it (a turn of prayer, 5 turns), the Monk too at level 6 (two turns of stillness, 4 turns)',/Who can call it: Lumen : Invoke \(a turn of prayer, then 5 turns in the whole Vanguard's place\); Taro : Invoke \(2 turns of stillness, then 4 turns in the whole Vanguard's place\)\./.test(t1)&&!/Spirit Call/.test(t1)||t1.slice(-500));
 chk('the Monk calls the Scourge paired with him under the Priest\'s rules (4 turns) and Invokes the guardian',/Who can call it: Taro : Summon, once per battle \(4 turns\), in the whole Vanguard's place/.test(t2)&&/Taro : Invoke \(2 turns of stillness, then 4 turns in the whole Vanguard's place\)/.test(t2)&&!/lesser call/.test(t2)||t2.slice(0,900));
 chk('with no Priest, Monk or Nikaris in the roster the boss and the guardian say what is needed',/It needs Nikaris, a Priest or a Monk\./.test(t3)&&/Nobody can call it yet: it needs a Priest, Nikaris or a Monk to Invoke it\./.test(t3)||t3.slice(0,900));
 chk('with Nikaris in the roster his beast calls are listed, each with its level or that he knows it',/Beast calls 4/.test(t4)&&/Call Hawk/.test(t4)&&/Call Wolf/.test(t4)&&/Pack Hunt/.test(t4)&&/Call Boar/.test(t4)&&/Nikaris : a skill of his own/.test(t4)&&/Nikaris (learns it at level \d+|: a skill)/.test(t4)&&/Nikaris : Invoke/.test(t4)||t4.slice(-700));
 chk(`pairing still works from the list (the free pet is now with ${m.paired}) and the save keeps its keys (tamed, summons)`,m.pick&&m.paired==='lumen'&&m.rows>=4&&m.saveKeys.tamed&&m.saveKeys.summons||JSON.stringify(m));
 await H.browser.close();}

// ---------- 1. Monks call again ----------
{const H=await open({w:1000,h:700,pre:PRE});const {ev,wait,until}=H;
 await ev(START,['brann','taro','lumen']);await wait(200);
 await ev(()=>{const A=__A,G=A.G;G.party.forEach(id=>{const c=G.roster[id];c.lv=20;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});A.setPause(80);A.startBattle({stage:0,kind:'field'});});
 await until(CMD,0,{timeout:20000});
 const r=await ev(()=>{const A=__A,g=A.TW.get,B=A.B,G=A.G,MON=g('MON'),GU=g('GUARDIANS'),SUM=g('SUM'),o={};A.setPause(99999);B.en.forEach(e=>{e.S.mhp=e.hp=99999;});
  const all=B.front.concat(B.back),H=id=>all.find(c=>c.id===id),fr=B.front.slice(),bk=B.back.slice();
  const reset=()=>{B.front=fr.slice();B.back=bk.slice();all.forEach(c=>{c.hidden=0;c.hp=c.S.mhp;c.mp=c.S.mmp;});B.summoned={};B.summonedBy={};B.sum=null;B.pray=null;B.sumDead=0;B.mode='cmd';B.menu='root';B.pend=null;B.swapAsk=null;};
  const turn=w=>{reset();const a=H(w);B.cur=a;A.render();return a;};
  const gk=Object.keys(GU)[0],d=g('guardianDef')(gk),mini=g('MINIS')[0],mk=Object.keys(MON)[0];
  const pet=(sc,w,i)=>{const dd=sc?d:MON[mk];const p={id:'tmk'+i,mon:sc?gk:mk,name:(sc?'Lesser ':'')+dd.n,cls:g('tameClass')(dd),trait:g('tameTrait')(dd),bb:sc?1:0,scourge:sc?1:0,with:w,bt:0};g('registerTamed')(p);return p;};
  const btn=()=>{const b=document.querySelector('#bcmd .b9sum');return b?{dis:!!b.disabled,txt:b.textContent.trim().replace(/\s+/g,' '),tip:b.title}:null;};
  // --- guardians ---
  G.tamed=[];G.summons={[mini[0]]:{mon:mini[0],name:mini[2],mod:mini[5]}};o.inv={};
  ['brann','taro','lumen'].forEach(w=>{const a=turn(w);o.inv[w]={can:g('sumCan')(a),cls:g('sumClassOf')(a),btn:btn()};});
  // the Monk presses: two turns of stillness, then the Priest's guardian for 4 turns in the whole Vanguard's place
  {const a=turn('taro'),mp0=a.mp;document.querySelector('#bcmd [data-act=sumOne]').click();o.pray=B.pray?{by:B.pray.by.id,n:B.pray.n,turns:B.pray.turns,lesser:!!B.pray.lesser,mp:mp0-a.mp,cost:g('sumCost')(a)}:null;B.pray=null;
   const u=g('sumMake')(G.summons[mini[0]],false,null,4),f=g('sumMake')(G.summons[mini[0]],false,null);o.full={turns:u.turnsLeft,fullTurns:f.turnsLeft,atk:+(u.S.atk/f.S.atk).toFixed(3),hp:u.S.mhp===f.S.mhp};
   reset();B.cur=a;g('sumFire')(a,G.summons[mini[0]],4);o.fire={front:B.front.map(x=>x.isSum?'guardian':x.id),hidden:!!a.hidden,lesser:!!(B.sum&&B.sum.lesser),turns:B.sum&&B.sum.u.turnsLeft};g('sumEnd')('done');o.fire.back=B.front.map(x=>x.id).join()===fr.map(x=>x.id).join();}
  // no level gate: a Monk of level 1 calls too
  {const c=H('taro');c.lv=1;const a=turn('taro');o.young={can:g('sumCan')(a),cls:g('sumClassOf')(a),btn:btn()};c.lv=20;}
  // --- recruited bosses ---
  G.summons={};o.who={};
  ['brann','taro','lumen'].forEach((w,i)=>{G.tamed=[pet(1,w,i)];const a=turn(w);const b=btn();o.who[w]={btn:b,caller:g('b16Caller')(a)};});
  // the Monk's call: boss sized, the whole Vanguard steps out, the Priest's numbers
  {G.tamed=[pet(1,'taro',7)];const a=turn('taro'),pool=fr.reduce((q,c)=>q+c.S.mhp,0);document.querySelector('#bcmd .b9sum').click();if(B.menu==='summons'){const q=document.querySelector('#bcmd [data-act=summon]');q&&q.click();}
   const u=B.front[0],base=g('makeEnemy')(d,u.lv,{elite:true,noField:1,noBuff:1,hpM:1,powM:1});
   o.monkBoss={front:B.front.length,big:u.b16big,isSum:u.isSum,monk:u.r17monk,turns:u.turnsLeft,hp:u.S.mhp,pool,atkK:+(u.S.atk/base.S.atk).toFixed(4),sum:!!(B.sum&&B.sum.b16),powAfter:SUM.powM};
   g('sumEnd')('done');o.monkBoss.back=B.front.map(x=>x.id).join()===fr.map(x=>x.id).join();}
  // the Priest's call is as 0.21.4 built it
  {G.tamed=[pet(1,'lumen',8)];turn('lumen');document.querySelector('#bcmd .b9sum').click();if(B.menu==='summons'){const q=document.querySelector('#bcmd [data-act=summon]');q&&q.click();}
   const u=B.front[0],base=g('makeEnemy')(d,u.lv,{elite:true,noField:1,noBuff:1,hpM:1,powM:1});o.priestBoss={turns:u.turnsLeft,atkK:+(u.S.atk/base.S.atk).toFixed(4),hp:u.S.mhp,monk:!!u.r17monk};g('sumEnd')('done');}
  // a Monk of level 1 paired with a Lesser Scourge can call it
  {const c=H('taro');c.lv=1;G.tamed=[pet(1,'taro',9)];turn('taro');o.youngBoss=btn();c.lv=20;}
  // ordinary pets: anyone
  o.plain=['brann','taro','lumen'].map((w,i)=>{G.tamed=[pet(0,w,20+i)];const a=turn(w);return g('canSummon')(a);});
  o.note=g('B16').note;o.bonus=g('compBonusText')(pet(1,'brann',30)).replace(/<[^>]+>/g,' ');
  reset();G.tamed=[];B.cur=H('lumen');A.render();return o;});
 console.log('monks:',JSON.stringify(r));
 chk(`guardians: the Priest Invokes, the Monk Invokes (${JSON.stringify(r.inv.taro.btn)}), the Warrior has no command`,r.inv.lumen.can&&r.inv.lumen.cls==='priest'&&r.inv.taro.can&&r.inv.taro.cls==='monk'&&/Invoke/.test(r.inv.taro.btn.txt)&&/2 turns of stillness/.test(r.inv.taro.btn.tip)&&!r.inv.taro.btn.dis&&!r.inv.brann.can&&r.inv.brann.btn===null||JSON.stringify(r.inv));
 chk(`the Monk's Invoke (after 0.22.3, summon8.js SUM.call): ${r.pray&&r.pray.n} turns of stillness, the Priest's MP cost (${r.pray&&r.pray.mp}), the full guardian (power x${r.full.atk}, the same HP) for ${r.fire.turns} turns (a Priest's: ${r.full.fullTurns}) in the whole Vanguard's place (${r.fire.front.join()})`,
  r.pray&&r.pray.by==='taro'&&r.pray.n===2&&r.pray.turns===4&&!r.pray.lesser&&r.pray.mp===r.pray.cost&&r.full.turns===4&&r.full.fullTurns===5&&r.full.atk===1&&r.full.hp&&r.fire.front.join()==='guardian'&&r.fire.turns===4&&!r.fire.lesser&&r.fire.back||JSON.stringify([r.pray,r.full,r.fire]));
 chk(`no level gate: a Monk of level 1 Invokes ("${r.young.btn&&r.young.btn.tip}")`,r.young.can&&r.young.cls==='monk'&&r.young.btn&&!r.young.btn.dis||JSON.stringify(r.young));
 chk(`a Lesser Scourge answers the Priest and the Monk, not the Warrior ("${r.who.brann.btn&&r.who.brann.btn.tip}")`,r.who.lumen.caller&&!r.who.lumen.btn.dis&&r.who.taro.caller&&!r.who.taro.btn.dis&&!r.who.brann.caller&&r.who.brann.btn.dis&&/Only Nikaris, a Priest or a Monk can summon a recruited boss/.test(r.who.brann.btn.tip)&&/Nikaris, Priest or Monk/.test(r.who.brann.btn.txt)||JSON.stringify(r.who));
 const mb=r.monkBoss;
 chk(`the Monk's Scourge: boss sized, alone in the whole Vanguard's place, under the Priest's rules: ${mb.turns} turns, power x${mb.atkK} (.835 x .88), HP ${mb.hp} (the Vanguard's ${mb.pool} x 1.055 x .88); the heroes come back`,
  mb.front===1&&mb.big===1&&mb.isSum&&mb.sum&&!mb.monk&&mb.turns===4&&Math.abs(mb.atkK-.835*.88)<.003&&Math.abs(mb.hp-Math.round(mb.pool*1.055*.88))<=1&&mb.back&&Math.abs(mb.powAfter-.835)<1e-9||JSON.stringify(mb));
 chk(`the Priest's Scourge is as 0.21.4 built it, the same as the Monk's: ${r.priestBoss.turns} turns, power x${r.priestBoss.atkK}`,r.priestBoss.turns===4&&Math.abs(r.priestBoss.atkK-.835*.88)<.003&&!r.priestBoss.monk&&r.priestBoss.atkK===mb.atkK&&r.priestBoss.hp===mb.hp||JSON.stringify(r.priestBoss));
 chk(`a Monk of level 1 paired with a Lesser Scourge can call it (${JSON.stringify(r.youngBoss)})`,r.youngBoss&&!r.youngBoss.dis||JSON.stringify(r.youngBoss));
 chk('ordinary pets are still summoned by anyone, and the pairing note names the three callers',r.plain.every(x=>x===true)&&/Nikaris, a Priest or a Monk can summon/.test(r.note)&&/Nikaris, a Priest or a Monk can summon/.test(r.bonus)||JSON.stringify([r.plain,r.note,r.bonus]));
 await H.browser.close();}

// ---------- 4. the Mantle ----------
{const H=await open({w:1000,h:700,pre:PRE});const {ev,wait,until}=H;
 await ev(START,['brann','mira','lumen']);await wait(200);
 await ev(()=>{const A=__A,G=A.G;G.party.forEach(id=>{const c=G.roster[id];c.lv=30;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});A.setPause(80);A.startBattle({stage:0,kind:'field'});});
 await until(CMD,0,{timeout:20000});
 const r=await ev(async()=>{const A=__A,g=A.TW.get,B=A.B,G=A.G,M=__R17.R17.mantle,X4=g('B4X'),o={};A.setPause(99999);B.en.forEach(e=>{e.S.mhp=e.hp=99999;});
  const a=B.front.concat(B.back).find(c=>c.id==='mira'),foe=B.en[0],ATT={id:'x191',n:'Test Hit',k:'phys',pw:1.4,mp:0,t:'one',cost:1,hits:1,el:null};
  if(B.front.indexOf(a)<0){const j=B.back.indexOf(a);B.back[j]=B.front[0];B.front[0]=a;}
  const sk=g('known')(a).find(s=>s.id==='mantle');o.known=!!sk;o.skill=sk&&{n:sk.n,mp:sk.mp,k:sk.k,t:sk.t,d:sk.d};o.others=['brann','lumen'].map(id=>g('known')(B.front.concat(B.back).find(c=>c.id===id)).some(s=>s.id==='mantle'));
  const fix=()=>{X4.rng(()=>.5);};const hit=()=>{const h0=a.hp,m0=a.mp;foe.S.acc=9;a.S.eva=0;g('perform')(foe,ATT,[a]);return {hp:h0-a.hp,mp:m0-a.mp};};
  fix();a.st={};a.hp=a.S.mhp;a.mp=a.S.mmp;foe.st={};foe.S.atk*=4.5;
  // the same blow without and with the Mantle
  o.plain=hit();a.hp=a.S.mhp;a.mp=a.S.mmp;
  // cast it as the player does: the skill button in the Skills list
  B.cur=a;B.mode='cmd';B.menu='root';A.render();const mp0=a.mp;g('exec')(sk,[a]);o.cast={has:__R17.has(a),mp:mp0-a.mp,t:a.st.mantle&&a.st.mantle.t};
  A.render();await new Promise(q=>setTimeout(q,60));
  o.icon={stage:!!document.querySelector('svg[data-st=mantle]'),sym:/M5 \.5/.test(g('stSym')('mantle')),name:g('STS').mantle.n,desc:g('STS').mantle.d};
  o.card=[...document.querySelectorAll('#bparty [data-st=mantle], .battle [data-st=mantle]')].length;
  a.hp=a.S.mhp;a.mp=a.S.mmp;o.shield=hit();
  // previews never spend MP and show the HP part
  {a.hp=a.S.mhp;a.mp=a.S.mmp;const m1=a.mp,h1=a.hp;const full=X4.calc(foe,ATT,a).dmg;const est=g('c5Est')(foe,ATT,a);o.prev={full,est,mp:m1-a.mp,hp:h1-a.hp,share:__R17.share(a,full)};}
  // poison, burn and bleed go through it too
  {a.hp=a.S.mhp;a.mp=a.S.mmp;const h1=a.hp,m1=a.mp;g('hurt')(a,50);o.dot={hp:h1-a.hp,mp:m1-a.mp};}
  // MP too low for the whole share: the rest goes to HP and the Mantle falls
  {a.hp=a.S.mhp;a.mp=10;const h1=a.hp;g('hurt')(a,50);o.low={hp:h1-a.hp,mp:a.mp,has:__R17.has(a)};}
  // overkill: a blow far beyond HP and MP drops the caster, MP never below 0
  {a.st={};a.hp=a.S.mhp;a.mp=a.S.mmp;g('addSt')(a,'mantle',a);const h1=a.hp;g('hurt')(a,99999);o.over={hp:a.hp,mp:a.mp,has:__R17.has(a),down:a.hp<=0};a.hp=a.S.mhp;a.mp=a.S.mmp;a.st={};a.deathT=0;}
  // it runs out after its turns (the cast turn and four more of the caster's)
  {g('addSt')(a,'mantle',a);let n=0;while(a.st.mantle&&n<12){Object.keys(a.st).forEach(k=>{a.st[k].t--;if(a.st[k].t<=0)delete a.st[k];});n++;}o.turns=n;}
  // a foe without the status, and a hero of the other side of the rule: nothing is taken
  {const h1=foe.hp;g('hurt')(foe,10);o.foe=h1-foe.hp;}
  // auto battle: only when hurt with MP to spare
  {a.st={};a.hp=a.S.mhp;a.mp=a.S.mmp;const w1=__R17.autoWants(a);a.hp=Math.round(a.S.mhp*.5);const w2=__R17.autoWants(a);a.mp=Math.round(a.S.mmp*.2);const w3=__R17.autoWants(a);o.auto=[w1,w2,w3];a.hp=a.S.mhp;a.mp=a.S.mmp;}
  // foes still plan and act against a mantled hero
  {g('addSt')(a,'mantle',a);let err=null;try{B.cur=foe;B.mode='enemy';X4.foeTurn(foe);}catch(e){err=e.message;}o.ai=err;}
  X4.rng(null);return o;});
 console.log('mantle:',JSON.stringify(r));
 const S=.8;
 chk(`the Mage knows ${r.skill&&r.skill.n} at level 30 (a self skill, ${r.skill&&r.skill.mp} MP); the Warrior and the Priest do not`,r.known&&r.skill.n==='Wellspring Mantle'&&r.skill.t==='self'&&r.others.every(x=>!x)&&/80% of the damage taken is paid in MP instead of HP/.test(r.skill.d)||JSON.stringify([r.skill,r.others]));
 chk(`casting it costs ${r.cast.mp} MP and sets the status for the cast turn and 4 more (${r.cast.t})`,r.cast.has&&r.cast.mp>=6&&r.cast.mp<=12/* 0.22.17: costs rise with the learn level (stats22.js) */&&r.cast.t===4&&r.turns===5||JSON.stringify([r.cast,r.turns]));
 chk(`the status has its own icon and name (${r.icon.name}: ${r.icon.desc}) and shows on the battle screen (${r.card})`,r.icon.sym&&r.icon.name==='Mantle'&&/80% of damage taken is paid in MP/.test(r.icon.desc)&&r.icon.stage&&r.card>=1||JSON.stringify([r.icon,r.card]));
 chk(`the same blow: ${r.plain.hp} HP without it; with it ${r.shield.hp} HP and ${r.shield.mp} MP (80% in MP, 1 MP a point)`,r.plain.hp>40&&r.plain.mp===0&&r.shield.mp===Math.floor(r.plain.hp*S)&&r.shield.hp===r.plain.hp-r.shield.mp||JSON.stringify([r.plain,r.shield]));
 chk(`a preview spends nothing (${r.prev.mp} MP, ${r.prev.hp} HP) and the foe's planned hit shows the HP part (${r.prev.est} of ${r.prev.full})`,r.prev.mp===0&&r.prev.hp===0&&r.prev.est===r.prev.full-r.prev.share&&r.prev.share===Math.floor(r.prev.full*S)||JSON.stringify(r.prev));
 chk(`poison, burn and bleed (50 a tick) go through it: ${r.dot.hp} HP and ${r.dot.mp} MP`,r.dot.hp===10&&r.dot.mp===40||JSON.stringify(r.dot));
 chk(`with 10 MP left the Mantle takes 10, HP the other 40, and it falls (${JSON.stringify(r.low)})`,r.low.hp===40&&r.low.mp===0&&r.low.has===false||JSON.stringify(r.low));
 chk(`overkill drops the caster with MP at 0, never below (${JSON.stringify(r.over)}); a foe is not touched by the rule (${r.foe})`,r.over.down&&r.over.hp===0&&r.over.mp===0&&!r.over.has&&r.foe===10||JSON.stringify([r.over,r.foe]));
 chk(`auto battle raises it only when hurt with MP to spare (full HP ${r.auto[0]}, half HP ${r.auto[1]}, half HP and little MP ${r.auto[2]}); a foe's turn against a mantled hero runs (${r.ai})`,r.auto[0]===false&&r.auto[1]===true&&r.auto[2]===false&&r.ai===null||JSON.stringify([r.auto,r.ai]));
 await H.browser.close();}
done({browser:{close:async()=>{}}});
})().catch(e=>{console.error('ERROR',e);process.exit(1);});
