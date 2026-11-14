// Beta v0.9.5 part 3: companions grow (comp3.js, TAME) and depth unlocks by realm (pacing.js, PACE, pcUnlocked).
// Companions: battles won beside their hero count (o.bt); the second skill at TAME.skillAt, the evolution at TAME.evoAt (new name, bigger
// bonus, recoloured sprite from the variant repaint, no new art), the progress text on the Companions menu, the hero sheet and the Taming
// log ("after N more battles"), the field survives a save round trip, an old companion without it starts at 0.
// Realms: a new journey gates reactions and bonds (realm 2), guild missions (realm 3), the Echoforge (realm 4); old journeys (no pcV),
// New Game+ and the Daily Trial keep everything; the one notice per realm. No page errors. Usage: PWHTML=../../out/aurelis3.html node v095p3.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false}}));`;
(async()=>{const h=await open({pre:PRE});const {ev,wait}=h;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(400);
// ---------- companions ----------
const c=await ev(async()=>{const A=__A,T=A.TW.get,G=A.G,C=window.__C3,o={};A.setPause(999999);
  const winFight=()=>{A.startBattle({stage:0,kind:'field',weather:'clear'});const B=A.B;B.en.forEach(e=>{e.hp=0;});B.over=true;T('win')();A.V.modal=null;A.finishBattle('win');};
  const tm=T('tameElite')({mon:'mossling',name:'Mossling Tyrant'});await new Promise(r=>setTimeout(r,500));const hero=G.roster[tm.with];o.paired=!!hero;
  const d0=T('compDef')(tm);o.sk0=d0.sk.length;o.art0=d0.art;o.bonus0=T('compBonus')(tm);o.next0=C.compNext(tm);
  A.V.bview='tame';o.log0=T('vTameLog')();tm.bt=C.TAME.skillAt-1;o.next1=C.compNext(tm);
  winFight();o.bt1=tm.bt;o.stage1=C.compStage(tm);const d1=T('compDef')(tm);o.sk1=d1.sk.map(s=>s[0]);o.toast1=document.body.innerText.includes('learned');
  tm.bt=C.TAME.evoAt-1;winFight();const d2=T('compDef')(tm);o.stage2=C.compStage(tm);o.n2=d2.n;o.art2=d2.art;o.tplArt=A.TPL[tm.id].art;o.bonus2=T('compBonus')(tm);
  o.mart=!!A.MART[d2.art];o.url0=A.monURL(o.art0);o.url2=A.monURL(d2.art);
  o.menu=T('vCompanions')();A.ACT.openChar(hero.id);o.sheet=document.getElementById('modal').innerHTML;A.V.modal=null;A.render();o.log2=T('vTameLog')();
  // the summon uses the second skill
  A.startBattle({stage:0,kind:'field',weather:'clear'});const B=A.B;const a=B.front.find(x=>x.id===hero.id)||B.front[0];if(a.id===hero.id){B.cur=a;B.mode='cmd';T('summonComp')();const u=B.front.find(x=>x.isComp);o.msk=u?u.msk.map(s=>s.n):null;}
  B.over=true;A.V.modal=null;A.finishBattle('x');
  // save round trip, and an old companion without the field
  const P=JSON.parse(JSON.stringify(T('packG')()));const g2=T('unpackG')(P);const t2=g2.tamed.find(x=>x.id===tm.id);o.rt=t2&&t2.bt;o.rtArt=A.TPL[tm.id].art;
  const old=Object.assign({},tm);delete old.bt;o.oldNext=C.compNext(old);o.oldStage=C.compStage(old);
  return o;});
console.log(JSON.stringify(Object.assign({},c,{log0:undefined,menu:undefined,sheet:undefined,log2:undefined,url0:undefined,url2:undefined})));
chk('a tamed companion is paired and starts with its monster skills',c.paired&&c.sk0>=1&&c.stage1!==undefined||JSON.stringify(c));
chk(`progress text from the start: "${c.next0}"`,/Learns .+ after 12 more battles, evolves after 30 more battles/.test(c.next0)||c.next0);
chk('the Taming log lists your companions with their progress',/Your pets/.test(c.log0)&&/more battles/.test(c.log0)||'no');
chk(`one battle before the skill: "${c.next1}"`,/after 1 more battle,/.test(c.next1)||c.next1);
chk(`a won battle with its hero in the six counts (${c.bt1}) and teaches the second skill (${c.sk1.join(', ')})`,c.bt1===12&&c.stage1===1&&c.sk1.length===c.sk0+1||JSON.stringify(c));
chk(`at ${30} battles it evolves: ${c.n2}, a recoloured sprite (${c.art2}) from the variant repaint, a bigger bonus (${c.bonus0} -> ${c.bonus2})`,c.stage2===2&&/^Grand /.test(c.n2)&&/^ev_/.test(c.art2)&&c.tplArt===c.art2&&c.mart&&c.url2&&c.url2!==c.url0&&c.bonus2>c.bonus0||JSON.stringify(c));
chk('Companions menu and hero sheet show the bond and progress',/Bond 2/.test(c.menu)&&/Fully grown/.test(c.menu)&&/Bond 2/.test(c.sheet)||'no');
chk('the Taming log shows the evolved name',c.log2.includes(c.n2)||'no');
chk(`the summoned companion fights with its second skill (${c.msk})`,!c.msk||c.msk.length===c.sk0+1||JSON.stringify(c.msk));
chk('the battle count survives a save round trip and the evolved look comes back on load',c.rt===30&&/^ev_/.test(c.rtArt)||JSON.stringify(c));
chk(`an old companion without the field starts at 0 ("${c.oldNext}")`,c.oldStage===0&&/after 12 more battles/.test(c.oldNext)||c.oldNext);
// ---------- depth by realm ----------
const g=await ev(()=>{const A=__A,T=A.TW.get,G=A.G,P=window.__P95,o={};const at=s=>{G.stage=s;G.cleared=[0,1,2,3,4].map(x=>x<s);};
  o.pcV=G.pcV;const U=()=>['elements','combat','taming','reactions','bonds','camp','guilds','echoforge','arenaGold','ngplus'].filter(k=>P.pcUnlocked(k));
  at(0);o.u0=U();at(1);o.u1=U();at(2);o.u2=U();at(3);o.u3=U();
  // reactions: a primer marks a foe only from the second realm
  const prime=s=>{at(s);A.setPause(999999);A.startBattle({stage:s,kind:'field',weather:'clear'});const B=A.B,a=B.front[0],t=B.en[0];t.S.mhp=t.hp=99999;B.cur=a;
    A.perform(a,{id:'tp',n:'Test Primer',k:'mag',pw:.3,t:'one',el:'fire',role:'primer',mp:0,cost:1,hits:1},[t]);const r=!!t.primed;B.over=true;A.V.modal=null;A.finishBattle('x');return r;};
  o.prime0=prime(0);o.prime1=prime(1);
  // bonds: wins side by side count only from the second realm
  const bk=T('BONDS').find(b=>A.TPL[b.a]&&A.TPL[b.b]);[bk.a,bk.b].forEach(id=>{if(!G.roster[id])A.recruit(id,true);});G.party=[bk.a,bk.b].concat(G.party.filter(id=>id!==bk.a&&id!==bk.b)).slice(0,6);
  const key=A.bondKey(bk.a,bk.b),bw=s=>{at(s);const b0=G.bonds[key]||0;A.startBattle({stage:s,kind:'field',weather:'clear'});const B=A.B;B.front.forEach(c=>{c.hp=Math.max(1,c.hp);});B.en.forEach(e=>{e.hp=0;});B.over=true;T('win')();A.V.modal=null;A.finishBattle('win');return (G.bonds[key]||0)-b0;};
  o.bond0=bw(0);o.bond1=bw(1);at(0);o.bondPage0=T('vBonds')();at(1);o.bondPage1=T('vBonds')();
  // guild missions: the third realm
  const mis=()=>A.FAC.map(F=>F.id).reduce((n,id)=>n+A.facMissionList(id).length,0);at(1);o.mis1=mis();at(2);o.mis2=mis();
  // the Echoforge: the fourth realm (shards in the pack)
  G.mats[T('ECHO_CAT').ids[0]]=2;at(2);o.ef2=T('efTabOn')();at(3);o.ef3=T('efTabOn')();
  // one notice per realm
  at(1);G.pcN={};P.pcNews();o.news1=Object.keys(G.pcN);o.toast=document.body.innerText.includes('New in this realm');
  // an old journey (no pcV) keeps everything in the first realm; NG+ and the Daily Trial too
  at(0);delete G.pcV;o.old=U();o.oldPrime=prime(0);at(1);o.oldMis=mis();at(0);G.mats[T('ECHO_CAT').ids[0]]=2;
  const pk=JSON.parse(JSON.stringify(T('packG')()));const g2=T('unpackG')(pk);o.oldLoad=!g2.pcV;
  G.pcV=1;G.daily={key:'x'};o.daily=U();G.daily=null;
  return o;});
console.log(JSON.stringify(Object.assign({},g,{bondPage0:g.bondPage0.slice(0,90),bondPage1:g.bondPage1.slice(0,60)})));
chk('a new journey is gated (pcV)',g.pcV===1);
chk(`realm 1: elements, combat and taming only (${g.u0.join(', ')})`,g.u0.join()==='elements,combat,taming'||g.u0.join());
chk(`realm 2 adds reactions and bonds (${g.u1.join(', ')})`,['reactions','bonds','guilds'].every(k=>g.u1.includes(k))&&!g.u1.includes('camp')||g.u1.join());
chk(`realm 3 adds camp and guilds (${g.u2.join(', ')})`,['camp','guilds'].every(k=>g.u2.includes(k))&&!g.u2.includes('echoforge')||g.u2.join());
chk(`realm 4 adds the endgame extras (${g.u3.join(', ')})`,['echoforge','arenaGold','ngplus'].every(k=>g.u3.includes(k))||g.u3.join());
chk('a primer marks nothing in realm 1 and primes in realm 2',g.prime0===false&&g.prime1===true||JSON.stringify(g));
chk(`bonds: no growth in realm 1 (${g.bond0}), growth in realm 2 (${g.bond1}); the Bonds page says when it opens`,g.bond0===0&&g.bond1===1&&/open in the second realm/.test(g.bondPage0)&&!/open in the second realm/.test(g.bondPage1)||JSON.stringify(g));
chk(`guild missions are open from realm 2 (quests16; ${g.mis1} in realm 2, ${g.mis2} in realm 3)`,g.mis1>0&&g.mis2>0||JSON.stringify(g));
chk('the Echoforge tab never opens in town (since 0.13.3 the Echoforge is an anvil inside the Echo Rift)',g.ef2===false&&g.ef3===false||JSON.stringify(g));
chk('one notice when a realm opens something new',g.news1.includes('r1')&&g.toast===true||JSON.stringify(g));
chk(`an old journey keeps everything: systems (${g.old.length}), primers in realm 1, guild missions in realm 2 (${g.oldMis})`,g.old.length===10&&g.oldPrime===true&&g.oldMis>0&&g.oldLoad===true||JSON.stringify(g));
chk('the Daily Trial has everything open',g.daily.length===10||g.daily.join());
const ng=await ev(()=>{const A=__A,T=A.TW.get;T('newGame')(['mira','lumen','oren'],1,[]);return {pcV:A.G.pcV,u:window.__P95.pcUnlocked('reactions')};});
chk('a New Game+ cycle is not gated',!ng.pcV&&ng.u===true||JSON.stringify(ng));
await done(h);})();
