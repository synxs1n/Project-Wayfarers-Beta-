// battle pass 16 (v3/battle16.js, v3/menus14.js item 5, v3/keymap.js), the owner's six playtest notes after 0.21.0:
// 1) no battle menu memory: every hero turn opens on the main actions, whatever the hero did last turn (a skill, an item), at the top of the list
// 2) the action key (Space by default) continues the rewards screen, "The party falls", a story card and any one button popup: one press one step,
//    a held key does not repeat, the page does not scroll, the world under the popup does not get the press; Settings > Keys binds several keys to
//    one action (Add key, a chip removes one, four at most); the defaults of the action button hold Space
// 3) Summon works for every pet: every monster, every Scourge and Calamity as a Lesser Scourge, the five Scourges removed in 0.20.9 (moved to the
//    boss that replaced them on load), and a pet with unknown data offers no dead button
// 4) recruited bosses: only Nikaris or a Priest may Summon a Lesser Scourge or Invoke a guardian (the others get a greyed button with the note);
//    guardians are about 12% weaker; a summoned Lesser Scourge stays boss sized and takes the whole Vanguard's place for 4 turns (a further 12% under a
//    guardian), the three heroes step out and come back as they were; ordinary pets are unchanged; Nikaris has 6% less ATK and MAG
// 5) learn levels: all 92 kits know exactly three class skills at level 10 (1,1,6 then 11 to 45), never three at once, order kept; a save marked 2
//    keeps what the 0.20.9 levels gave and is marked 3
// 6) dual type wayfarers: none in the starter pool, none in any recruit pool in realms 1 and 2, some from realm 3; realm 1 foes single, realm 2 some dual
// Usage: PWHTML=<abs path to out/aurelis3.html> node v189a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false,tips:false,hd2d:false,timedHits:false}}));`;
const START=ids=>{const A=__A;A.ACT.new();ids.forEach(i=>A.ACT.pickS(i));A.ACT.begin();try{A.ACT.storyOk();}catch(e){}A.V.modal=null;A.render();};
const CMD=()=>{const B=__A.B;return B&&B.mode==='cmd'&&B.cur&&B.cur.side==='p'&&B.cur.id;};
// play turns (other heroes guard) until hero id's command turn; returns the menu it opens on
const UNTIL=async id=>{const A=__A,B=A.B;A.setPause(60);
  for(let i=0;i<600;i++){await new Promise(q=>setTimeout(q,40));if(B.over)return 'over';
    if(B.mode==='cmd'&&B.cur&&B.cur.side==='p'){if(B.cur.id===id){A.setPause(99999);A.render();return B.menu;}A.ACT.cmd('guard');}}
  A.setPause(99999);return 'timeout';};
(async()=>{
// ---------- 5. learn levels ----------
{const H=await open({w:390,h:844,pre:PRE});const {ev}=H;
 const r=await ev(()=>{const A=__A,g=A.TW.get,TPL=g('TPL'),CLS=g('CLS'),M=__M14,bad=[],sets={};let n=0;
  Object.keys(TPL).forEach(id=>{const t=TPL[id];if(t.mon||!CLS[t.cls])return;n++;const k=g('classSkills')(t).slice().sort((a,b)=>a.lv-b.lv||a.lv12-b.lv12),L=k.map(s=>s.lv),p=M.check(L).slice();
   if(L.filter(x=>x<=10).length!==3)p.push('at 10: '+L.filter(x=>x<=10).length);
   const cnt={};L.forEach(x=>cnt[x]=(cnt[x]||0)+1);if(Object.keys(cnt).some(x=>cnt[x]>2||(cnt[x]>1&&+x!==1)))p.push('several at once');
   if(!k.every((s,i)=>!i||s.lv12>=k[i-1].lv12))p.push('order');if(L[L.length-1]!==45)p.push('end');
   sets[L.join(',')]=(sets[L.join(',')]||0)+1;if(p.length)bad.push(id+': '+p.join('/')+' '+L.join(','));});
  // what the heroes really know: a fresh hero at levels 1, 5, 10, 11
  const kn=lv=>{const o={};['brann','mira','lumen','taro','gilda','nikaris'].forEach(id=>{const c=g('newChar')(id,lv);c.lv=lv;delete c.keep;o[id]=g('classSkills')(TPL[id]).filter(s=>g('skillKnown')(c,s)).length;});return o;};
  // the migration: a hero at level 8 on a save marked 2 knew 5 skills (1,1,4,6,8) and keeps them; marked 3 is left alone; unmarked keeps the original table's
  const mk=(lv,flag)=>{const c=g('newChar')('brann',lv);c.lv=lv;delete c.keep;const G0={roster:{brann:c}};if(flag!=null)G0.m14lv=flag;return G0;};
  const cnt=G0=>g('classSkills')(TPL.brann).filter(s=>g('skillKnown')(G0.roster.brann,s)).length;
  const g2=mk(8,2),b2=cnt(g2),n2=M.keep(g2),a2=cnt(g2),g3=mk(8,3),n3=M.keep(g3),a3=cnt(g3),g1=mk(8,1),n1=M.keep(g1),g0=mk(8,null),n0=M.keep(g0);
  const q2=g('classSkills')(TPL.brann).filter(s=>s.lvQ<=8).length,q1=g('classSkills')(TPL.brann).filter(s=>s.lvP<=8).length,q0=g('classSkills')(TPL.brann).filter(s=>s.lv12<=8).length;
  A.ACT.new();['brann','mira','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();
  return {n,bad,sets,k1:kn(1),k5:kn(5),k10:kn(10),k11:kn(11),b2,n2,a2,q2,n3,a3,a1:cnt(g1),q1,a0:cnt(g0),q0,f:[g2.m14lv,g3.m14lv,g1.m14lv,g0.m14lv],keep2:g2.roster.brann.keep,flag:A.G.m14lv,spread:M.M14.spread};});
 console.log('learn:',JSON.stringify(r));
 chk(`learn levels: ${r.n} kits, every one knows exactly 3 class skills at level 10, single learns after the two at level 1, last at 45, no gap over 6, order kept (${Object.keys(r.sets).join(' | ')})`,r.n===92&&r.bad.length===0||r.bad.slice(0,5).join(' | '));
 chk(`the schedule of a 12 skill kit is 1,1,6,11,15,20,24,28,32,37,41,45`,Object.keys(r.sets).join()==='1,1,6,11,15,20,24,28,32,37,41,45'||Object.keys(r.sets).join(' | '));
 const all=(o,v)=>Object.values(o).every(x=>x===v);
 chk(`heroes know 2 class skills at level 1, 2 at level 5, 3 at level 10 and 4 at level 11`,all(r.k1,2)&&all(r.k5,2)&&all(r.k10,3)&&all(r.k11,4)||JSON.stringify([r.k1,r.k5,r.k10,r.k11]));
 chk(`old save marked 2: a level 8 hero keeps the ${r.q2} skills the 0.20.9 levels gave (new levels alone: ${r.b2}; after: ${r.a2}; kept ${JSON.stringify(r.keep2)}), nothing is taken away`,r.q2===5&&r.b2===3&&r.a2===5&&r.n2===2||JSON.stringify(r));
 chk(`a save marked 1 keeps the 0.20.3 levels' skills (${r.a1} of ${r.q1}), an unmarked one the original table's (${r.a0} of ${r.q0}); every one is marked 3; a save marked 3 is left alone (${r.a3})`,r.a1===Math.max(r.q1,3)&&r.a0===Math.max(r.q0,3)&&r.f.every(x=>x===3)&&r.n3===0&&r.a3===3||JSON.stringify(r));
 chk('a new journey is marked 3',r.flag===3||r.flag);
 await H.browser.close();}

// ---------- 6. dual types ----------
{const H=await open({w:390,h:844,pre:PRE});const {ev,wait}=H;
 await ev(START,['brann','mira','lumen']);await wait(200);
 const r=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,TPL=g('TPL'),dual=id=>TPL[id]&&TPL[id].el.length>1,o={st:{},foes:{}};
  const R=__RO14;let sd=0;const pool=R.pool();for(let k=0;k<300;k++)sd+=R.draw(7919*k+3).filter(dual).length;o.starter={dualInDraws:sd,pool:pool.length,dualInPool:pool.filter(dual).length};
  const stage0=G.stage;
  for(let s=0;s<=4;s++){G.stage=s;const P={};
   try{P.tavern=g('tvPool')();}catch(e){P.tavern='ERR '+e.message;}
   try{const t=g('tvInit')();t.sl=['sylva','dagna','brook'].filter(id=>!G.roster[id]);t.ev=false;t.at=g('battlesSoFar')();P.seats=g('tavernOffers')().slice();t.sl=null;}catch(e){P.seats='ERR '+e.message;}
   try{P.chall=g('challEligible')().map(c=>c.hero);}catch(e){P.chall='ERR '+e.message;}
   try{P.board=g('challVisible')().map(c=>c.hero);}catch(e){P.board='ERR '+e.message;}
   try{P.rare=g('rarePool')();}catch(e){P.rare='ERR '+e.message;}
   try{P.chance=g('cePool')();}catch(e){P.chance='ERR '+e.message;}
   try{P.cave=g('caveRecruitPool')(s).concat(g('caveRecruitPool')(Math.min(4,s+1)));}catch(e){P.cave='ERR '+e.message;}
   const LQ=g('LEG_Q');P.legend=Object.keys(LQ).filter(id=>{try{return LQ[id].ok(s)||['snow','heights'].some(th=>0);}catch(e){return false;}});
   P.legendAny=Object.keys(LQ).filter(id=>dual(id)&&s<2&&(()=>{try{return LQ[id].ok(s);}catch(e){return false;}})());
   o.st[s]={};Object.keys(P).forEach(k=>{const L=P[k];o.st[s][k]=typeof L==='string'?L:{n:L.length,dual:L.filter(dual).length};});}
  G.stage=stage0;
  // foes: realm 1 all single, realm 2 some dual
  for(const s of [0,1]){G.stage=s;let n=0,d=0,sp=0;for(let k=0;k<160;k++){for(const kind of ['field','dungeon']){let F;try{F=g('encounterFoes')({stage:s,kind});}catch(e){o.foes['err'+s]=e.message;F=[];}
     F.forEach(e=>{if(!e||e.boss||e.elite||e.art==='mimic')return;n++;if(e.el.length>1)d++;});}}o.foes[s]={n,dual:d};}
  G.stage=stage0;
  const GU=g('GUARDIANS');o.dualBoss=Object.keys(GU).filter(k=>GU[k].el.length>1).map(k=>GU[k].n);o.nBoss=Object.keys(GU).length;
  o.from=[g('DUAL_FROM'),g('DUAL_HERO_FROM')];return o;});
 console.log('dual:',JSON.stringify(r));
 const errs=[];[0,1,2,3,4].forEach(s=>Object.keys(r.st[s]).forEach(k=>{if(typeof r.st[s][k]==='string')errs.push(s+' '+k+' '+r.st[s][k]);}));
 chk('every recruit pool answers at every stage',errs.length===0||errs.join(' | '));
 const dualAt=s=>Object.keys(r.st[s]).reduce((q,k)=>q+(r.st[s][k].dual||0),0),sizeAt=s=>Object.keys(r.st[s]).reduce((q,k)=>q+(r.st[s][k].n||0),0);
 chk(`starter pool: ${r.starter.pool} single type wayfarers, no dual type in the pool or in 300 draws`,r.starter.pool===64&&r.starter.dualInPool===0&&r.starter.dualInDraws===0||JSON.stringify(r.starter));
 chk(`realm 1: no dual type wayfarer in the tavern, the board, rare visitors, chance meetings, caves and keeps or among the legends (${sizeAt(0)} offers)`,dualAt(0)===0&&sizeAt(0)>0||JSON.stringify(r.st[0]));
 chk(`realm 2: still none (${sizeAt(1)} offers)`,dualAt(1)===0&&sizeAt(1)>0||JSON.stringify(r.st[1]));
 chk(`realm 3 on: dual type wayfarers are offered (${dualAt(2)} at realm 3, ${dualAt(3)} at realm 4)`,dualAt(2)>0&&dualAt(3)>0||JSON.stringify(r.st[2]));
 chk(`foes: realm 1 all single type (${r.foes[0].dual} dual of ${r.foes[0].n}), realm 2 some dual type (${r.foes[1].dual} of ${r.foes[1].n})`,r.foes[0].n>100&&r.foes[0].dual===0&&r.foes[1].dual>0&&r.foes[1].dual<r.foes[1].n||JSON.stringify(r.foes));
 console.log(`(bosses keep their elements: ${r.dualBoss.length} of ${r.nBoss} Scourges are dual type and any of them can stand in realm 1: ${r.dualBoss.join(', ')})`);
 await H.browser.close();}

// ---------- 3 and 4. pets, recruited bosses ----------
{const H=await open({w:1000,h:700,pre:PRE});const {ev,wait,until}=H;
 await ev(START,['brann','taro','lumen']);await wait(200);
 await ev(()=>{const A=__A,G=A.G;A.META.legends=Object.assign({},A.META.legends,{nikaris:1});A.recruit('nikaris',true);G.party=['brann','taro','lumen','nikaris'];G.party.forEach(id=>{const c=G.roster[id];c.lv=20;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  A.setPause(80);A.startBattle({stage:0,kind:'field'});});
 const cur=await until(CMD,0,{timeout:20000});
 const r=await ev(()=>{const A=__A,g=A.TW.get,B=A.B,G=A.G,MON=g('MON'),GU=g('GUARDIANS'),FI=g('FINALS'),TAME=g('TAME'),o={n:0,bad:[],gone:{},who:{}};A.setPause(99999);
  B.en.forEach(e=>{e.S.mhp=e.hp=99999;});
  const all=B.front.concat(B.back),H=id=>all.find(c=>c.id===id),fr=B.front.slice(),bk=B.back.slice();
  const reset=()=>{B.front=fr.slice();B.back=bk.slice();all.forEach(c=>{c.hidden=0;});B.summoned={};B.summonedBy={};B.sum=null;B.pray=null;B.sumDead=0;B.mode='cmd';B.menu='root';B.pend=null;B.swapAsk=null;};
  const pet=(t,i,w)=>{const m=MON[t.mon]||g('guardianDef')(t.mon)||{n:'Gone',el:['earth'],hp:1,atk:1,def:1,mag:1,res:1,spd:1};
   return {id:'tmx'+i,bt:t.bt||0,mon:t.mon,name:t.name||((t.scourge?'Lesser ':'')+m.n),cls:g('tameClass')(m),trait:g('tameTrait')(m),bb:t.bb?1:0,scourge:t.scourge?1:0,with:w};};
  // press the Summon button the player sees for hero w with pet t; returns null when the pet took the field, else why not
  const press=(t,i,w)=>{try{const p=pet(t,i,w);g('registerTamed')(p);G.tamed=[p];reset();const a=H(w);if(B.front.indexOf(a)<0){const j=B.back.indexOf(a);B.back[j]=B.front[0];B.front[0]=a;}B.cur=a;A.render();
    const b=document.querySelector('#bcmd .b9sum');if(!b)return 'no button';if(b.disabled||!b.dataset.act)return 'disabled';b.click();
    if(B.menu==='summons'){const q=document.querySelector('#bcmd [data-act=summon]');if(!q)return 'no pet row in the chooser';q.click();}
    const u=B.front.find(x=>x.isComp||x.isSum);if(!u)return 'no unit after the press';if(!(u.S&&u.S.mhp>0&&u.hp>0))return 'bad stats';if(!u.msk||!u.msk.length)return 'no skills';if(u.isComp?!a.hidden:(B.front.length!==1||!B.sum||!!p.scourge!==true))return 'the hero did not step out';if(!!u.isSum!==!!p.scourge)return 'wrong flow';
    A.render();return null;}catch(e){return 'throw: '+e.message;}};
  // every monster as a pet of the Priest (who may summon anything), fresh; every boss as a Lesser Scourge fresh, grown and evolved
  const list=Object.keys(MON).map(k=>({mon:k})).concat(...[0,TAME.skillAt,TAME.evoAt].map(bt=>Object.keys(GU).concat(Object.keys(FI)).map(k=>({mon:k,scourge:1,bb:1,bt}))),
   Object.keys(MON).filter((k,i)=>i%9===0).map(k=>({mon:k,bt:TAME.evoAt})));
  list.forEach((t,i)=>{o.n++;const why=press(t,i,'lumen');if(why)o.bad.push(t.mon+(t.scourge?' (Lesser Scourge)':'')+(t.bt?' bt'+t.bt:'')+': '+why);});
  o.counts={mon:Object.keys(MON).length,scourge:Object.keys(GU).length,calamity:Object.keys(FI).length};
  // the five Scourges removed in 0.20.9: on load the pet follows the boss that replaced it, and then Summon works
  Object.keys(__R14.R14_GONE).forEach((k,i)=>{const p={id:'tmg'+i,mon:k,name:'Lesser Removed Boss',cls:'warrior',trait:'keen',bb:1,scourge:1,with:'lumen'};
   const sv={tamed:[p],run:JSON.parse(JSON.stringify(G.run)),roster:{}};const n=__B16.petFix(sv);const d=__B16.def(p.mon);
   let why='not moved';if(n===1&&d){G.tamed=[p];reset();B.cur=H('lumen');A.render();const b=document.querySelector('#bcmd [data-act=sumOne]');if(!b)why='no button';else{b.click();if(B.menu==='summons'){const q=document.querySelector('#bcmd [data-act=summon]');q&&q.click();}why=B.front.find(x=>x.isSum&&x.b16big)?null:'no unit';}}
   o.gone[k]={to:p.mon,name:p.name,why};});
  // the real load path: a save with such a pet through packG and unpackG
  try{G.tamed=[{id:'tmz1',mon:'ironmaw',name:'Lesser Ironmaw Tortoise',cls:'knight',trait:'bulwark',bb:1,scourge:1,with:'lumen'}];const raw=JSON.parse(JSON.stringify(g('packG')()));const g2=g('unpackG')(raw);
   o.load={mon:g2.tamed[0].mon,name:g2.tamed[0].name,tpl:!!g('TPL').tmz1,def:!!__B16.def(g2.tamed[0].mon)};}catch(e){o.load={err:e.message};}
  // a pet nobody knows: no button (not a dead one), and the Pets list still draws
  {const p={id:'tmq1',mon:'nosuchmon_xyz',name:'Old Friend',cls:'warrior',trait:'keen',bb:0,scourge:0,with:'lumen'};G.tamed=[p];reset();B.cur=H('lumen');let err=null;try{A.render();}catch(e){err=e.message;}
   let menu='';try{menu=g('vCompanions')();}catch(e){err='pets list: '+e.message;}o.unknown={button:!!document.querySelector('#bcmd [data-act=sumOne]:not([disabled])'),err,listed:/Old Friend/.test(menu)};}
  // ---- 4: who may call a recruited boss ----
  const gk=Object.keys(GU)[0],mk=Object.keys(MON)[0];
  ['brann','taro','lumen','nikaris'].forEach((w,i)=>{const q={};q.boss=press({mon:gk,scourge:1,bb:1},900+i,w);
   q.note=(()=>{const b=document.querySelector('#bcmd .b16no');return b?b.textContent.trim()+' | '+b.title:null;})();
   q.plain=press({mon:mk},910+i,w);o.who[w]=q;});
  // guardians: Invoke for the Priest and Nikaris, not the Monk (level 20, over the old Spirit Call level), not the Warrior
  const mini=g('MINIS')[0];G.summons={[mini[0]]:{mon:mini[0],name:mini[2],mod:mini[5]}};G.tamed=[];o.inv={};
  ['brann','taro','lumen','nikaris'].forEach(w=>{reset();const a=H(w);if(B.front.indexOf(a)<0){const j=B.back.indexOf(a);B.back[j]=B.front[0];B.front[0]=a;}a.mp=a.S.mmp;B.cur=a;A.render();
   const b=document.querySelector('#bcmd .b9sum');o.inv[w]={can:__B16.sumCan(a),cls:__B16.sumClassOf(a),btn:b?(b.disabled?'disabled':b.textContent.trim()):null,note:b&&b.disabled?b.title:null};});
  // Nikaris prays and the guardian comes
  {reset();const a=H('nikaris');if(B.front.indexOf(a)<0){const j=B.back.indexOf(a);B.back[j]=B.front[0];B.front[0]=a;}a.mp=a.S.mmp;B.cur=a;A.render();document.querySelector('#bcmd [data-act=sumOne]').click();o.pray=!!(B.pray&&B.pray.by===a&&!B.pray.lesser);
   const u=g('sumMake')(G.summons[mini[0]],false,null);o.gu={turns:u.turnsLeft};B.pray=null;}
  // ---- 4: the tune ----
  const SUM=g('SUM');o.sum={powM:SUM.powM,hpK:SUM.hpK,turns:SUM.turns};
  // a summoned Lesser Scourge: boss sized, alone on the field in place of the three, a little under a guardian, and the heroes come back as they were
  {const t={mon:gk,scourge:1,bb:1},L=H('lumen'),van0=fr.map(c=>c.id);reset();fr.forEach((c,i)=>{c.hp=Math.max(1,c.S.mhp-7*(i+1));c.mp=Math.max(0,c.S.mmp-3*(i+1));c.st={};});fr[1].st={poison:{t:3}};
   const snap=()=>JSON.stringify(fr.map(c=>[c.id,c.hp,c.mp,c.st]));const before=snap(),pool=fr.reduce((q,c)=>q+c.S.mhp,0);
   o.pw=press(t,950,'lumen');const u=B.front[0],d=g('guardianDef')(gk),BL=g('BL'),bx=g('unitBox')(u),rc=g('k12Rect')(u,bx);
   // the same Scourge as a foe boss, for its box
   const foe=g('makeEnemy')(d,u.lv,{boss:true,stage:0});const en0=B.en.slice();B.en=[foe];const fb=g('unitBox')(foe),fr2=g('k12Rect')(foe,fb);B.en=en0;
   const aHero=g('unitBox')(B.back[0]||fr[0]);
   o.boss={front:B.front.map(x=>x.id),sum:!!(B.sum&&B.sum.u===u&&B.sum.b16),big:u.b16big,isSum:u.isSum,side:u.side,hp:u.S.mhp,pool,turns:u.turnsLeft,pw:u.msk.map(s=>s.pw),pw0:d.sk.map(s=>+(s[2]*1.05).toFixed(2)),
    box:[bx.w,bx.h],foeBox:[fb.w,fb.h],fig:rc&&[Math.round(rc.r-rc.l),Math.round(rc.b-rc.t)],foeFig:fr2&&[Math.round(fr2.r-fr2.l),Math.round(fr2.b-fr2.t)],in:rc&&rc.l>=0&&rc.r<=BL.W+1&&rc.t>=0&&rc.b<=BL.H+1,rc:rc&&[Math.round(rc.l),Math.round(rc.r),BL.W],
    sc:g('ch15Sc')(u),scHero:g('ch15Sc')(fr[0]),tgt:g('liveUnits')().filter(x=>x.side==='p').map(x=>x.id),canSwap:g('canSwap')(),wipe:g('checkEnd')()};
   // a guardian of the same party for the comparison
   const gd=g('sumMake')(G.summons[mini[0]]||{mon:mini[0],name:mini[2],mod:mini[5]},false,null);o.boss.guardHp=gd.S.mhp;o.boss.atkK=+(u.S.atk/(g('makeEnemy')(d,u.lv,{elite:true,noField:1,noBuff:1,hpM:1,powM:1}).S.atk)).toFixed(3);
   // its turns run out: the three are back, untouched
   o.boss.mid=snap()===before;g('sumEnd')('done');o.boss.back=B.front.map(c=>c.id).join()===van0.join()&&!B.sum&&!B.front.some(c=>c.hidden);o.boss.same=snap()===before;
   // driven off: back as well, and the fight is not lost
   press(t,952,'lumen');const u2=B.front[0];u2.hp=0;g('fallen')(u2);o.boss.ko={back:B.front.map(c=>c.id).join()===van0.join(),sum:!!B.sum,same:snap()===before,over:!!B.over,sumDead:!!B.sumDead};
   fr.forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;c.st={};});
   o.pw2=press({mon:mk},951,'lumen');const v=B.front.find(x=>x.isComp);o.plainPet={isSum:!!B.sum,front:B.front.length,hp:v.S.mhp,hp0:g('calcStats')(v).mhp,pw:v.msk.map(s=>s.pw),pw0:MON[mk].sk.map(s=>+(s[2]*1.05).toFixed(2))};}
  {const K=__B16.B16.nik,c=H('nikaris'),S1=g('calcStats')(c),sv=[K.atk,K.mag];K.atk=1;K.mag=1;const S0=g('calcStats')(c);K.atk=sv[0];K.mag=sv[1];o.nik={atk:+(S1.atk/S0.atk).toFixed(3),mag:+(S1.mag/S0.mag).toFixed(3),hp:S1.mhp===S0.mhp};}
  reset();G.tamed=[];G.summons={};B.cur=H('lumen');A.render();return o;});
 console.log('pets:',JSON.stringify(Object.assign({},r,{bad:r.bad.slice(0,8)})));
 chk(`Summon pressed for every pet: ${r.n} cases (${r.counts.mon} monsters, ${r.counts.scourge} Scourges and ${r.counts.calamity} Calamities as Lesser Scourges fresh, grown and evolved, a sample of evolved monsters): the pet takes the field every time`,r.n>=260&&r.bad.length===0||r.bad.slice(0,6).join(' | '));
 const gone=Object.keys(r.gone);
 chk(`the pets of the ${gone.length} Scourges removed in 0.20.9 follow the boss that replaced them (${gone.map(k=>k+' -> '+r.gone[k].to).join(', ')}) and Summon works`,gone.length===5&&gone.every(k=>!r.gone[k].why&&r.gone[k].to!==k&&/^Lesser /.test(r.gone[k].name)&&r.gone[k].name!=='Lesser Removed Boss')||JSON.stringify(r.gone));
 chk(`a save with such a pet loads with it moved (${JSON.stringify(r.load)})`,r.load&&r.load.mon!=='ironmaw'&&r.load.tpl&&r.load.def||JSON.stringify(r.load));
 chk('a pet with unknown monster data offers no Summon button, nothing throws and the Pets list still shows it',r.unknown&&!r.unknown.button&&!r.unknown.err&&r.unknown.listed||JSON.stringify(r.unknown));
 chk(`a Lesser Scourge is summoned by the Priest and by Nikaris only (Warrior: ${r.who.brann.boss}, Monk: ${r.who.taro.boss})`,r.who.lumen.boss===null&&r.who.nikaris.boss===null&&r.who.brann.boss==='disabled'&&r.who.taro.boss==='disabled'||JSON.stringify(r.who));
 chk(`the others see the note where the command was ("${r.who.brann.note}")`,/Nikaris or a Priest/.test(r.who.brann.note||'')&&/Only Nikaris or a Priest can summon a recruited boss/.test(r.who.brann.note||'')&&!r.who.lumen.note||JSON.stringify(r.who));
 chk('an ordinary pet is still summoned by anyone',['brann','taro','lumen','nikaris'].every(w=>r.who[w].plain===null)||JSON.stringify(r.who));
 chk(`guardians: the Priest and Nikaris can Invoke, the Monk and the Warrior cannot (Monk: ${JSON.stringify(r.inv.taro)})`,r.inv.lumen.can&&r.inv.nikaris.can&&!r.inv.taro.can&&!r.inv.brann.can&&r.inv.taro.btn==='disabled'&&/Nikaris or a Priest/.test(r.inv.taro.note||'')&&r.inv.brann.btn===null||JSON.stringify(r.inv));
 chk('Nikaris prays like a Priest (the full guardian, not a lesser form)',r.pray===true&&r.gu.turns===5||JSON.stringify([r.pray,r.gu]));
 chk(`guardians tuned down about 12%: power x${r.sum.powM} (was .95), HP pool x${r.sum.hpK} (was 1.2), still ${r.sum.turns} turns`,Math.abs(r.sum.powM/.95-.88)<.01&&Math.abs(r.sum.hpK/1.2-.88)<.01&&r.sum.turns===5||JSON.stringify(r.sum));
 const b=r.boss;
 chk(`a summoned Lesser Scourge takes the whole Vanguard's place: alone in the front (${b.front.join()}), on the party's side, the three heroes cannot be targeted or swapped in (${b.tgt.join()}), no wipe while it stands`,!r.pw&&b.front.length===1&&b.sum&&b.isSum&&b.side==='p'&&b.tgt.length===1&&b.canSwap===false&&b.wipe===false||JSON.stringify(b));
 chk(`it stays boss sized: box ${b.box.join('x')} against ${b.foeBox.join('x')} for the same Scourge as a foe boss (figure ${b.fig&&b.fig.join('x')} against ${b.foeFig&&b.foeFig.join('x')}), inside the stage (${b.rc}), flagged b16big for the Unified look (scale ${b.sc}, a hero ${b.scHero})`,b.box[0]>=b.foeBox[0]&&b.box[1]>=b.foeBox[1]&&b.fig&&b.foeFig&&b.fig[0]>=b.foeFig[0]-1&&b.fig[1]>=b.foeFig[1]-1&&b.in===true&&b.big===1&&b.sc>=b.scHero||JSON.stringify(b));
 chk(`its numbers sit a little under a guardian's: HP ${b.hp} = the Vanguard's ${b.pool} x 1.055 x .88 (a guardian here: ${b.guardHp}), power x${b.atkK} (.835 x .88), ${b.turns} turns (a guardian: 5), the Scourge's own skills (${b.pw.join('/')})`,Math.abs(b.hp-Math.round(b.pool*1.055*.88))<=1&&b.hp<b.guardHp&&Math.abs(b.atkK-.835*.88)<.002&&b.turns===4&&b.pw.join()===b.pw0.join()||JSON.stringify(b));
 chk('when it leaves the three heroes are back with their HP, MP and statuses as they were',b.mid&&b.back&&b.same||JSON.stringify(b));
 chk(`when it is driven off they are back the same way and the fight goes on (${JSON.stringify(b.ko)})`,b.ko.back&&!b.ko.sum&&b.ko.same&&!b.ko.over&&!b.ko.sumDead||JSON.stringify(b.ko));
 chk('an ordinary pet is unchanged: it takes only its hero\'s place, hero sized stats, its own skills',!r.pw2&&!r.plainPet.isSum&&r.plainPet.front===3&&r.plainPet.hp===r.plainPet.hp0&&r.plainPet.pw.join()===r.plainPet.pw0.join()||JSON.stringify(r.plainPet));
 chk(`Nikaris: ATK x${r.nik.atk} and MAG x${r.nik.mag} (6% lower), HP as it was`,r.nik.atk===.94&&r.nik.mag===.94&&r.nik.hp||JSON.stringify(r.nik));
 await H.browser.close();}

// ---------- 4b. the summoned Scourge on a phone ----------
{const H=await open({w:390,h:844,mobile:true,pre:PRE});const {ev,wait,until}=H;
 await ev(START,['brann','taro','lumen']);await wait(200);
 await ev(()=>{const A=__A,g=A.TW.get,G=A.G;G.party.forEach(id=>{const c=G.roster[id];c.lv=20;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  const gk='hollowking',d=g('guardianDef')(gk)||g('guardianDef')(Object.keys(g('GUARDIANS'))[0]),p={id:'tmph',mon:g('guardianDef')(gk)?gk:Object.keys(g('GUARDIANS'))[0],name:'Lesser '+d.n,cls:'knight',trait:'keen',bb:1,scourge:1,with:'lumen'};g('registerTamed')(p);G.tamed=[p];
  A.setPause(80);A.startBattle({stage:0,kind:'field'});});
 await until(CMD,0,{timeout:20000});
 const ph=await ev(async()=>{const A=__A,g=A.TW.get,B=A.B;A.setPause(99999);B.en.forEach(e=>{e.S.mhp=e.hp=99999;});B.cur=B.front.find(c=>c.id==='lumen');B.mode='cmd';B.menu='root';A.render();
  const b=document.querySelector('#bcmd .b9sum');if(!b)return {err:'no button'};b.click();if(B.menu==='summons'){const q=document.querySelector('#bcmd [data-act=summon]');q&&q.click();}await new Promise(r=>setTimeout(r,300));
  const u=B.front[0],BL=g('BL'),bx=g('unitBox')(u),rc=g('k12Rect')(u,bx),d=g('guardianDef')(u.b16pet&&A.G.tamed[0].mon);const foe=g('makeEnemy')(d,u.lv,{boss:true,stage:0}),en0=B.en.slice();B.en=[foe];const fb=g('unitBox')(foe);B.en=en0;
  const foes=B.en.filter(e=>e.hp>0).map(e=>g('unitBox')(e)).filter(Boolean),minFoe=Math.min(...foes.map(f=>f.x));
  return {front:B.front.length,big:u&&u.b16big,box:bx&&[bx.w,bx.h],foeBox:[fb.w,fb.h],rc:rc&&[Math.round(rc.l),Math.round(rc.r),Math.round(rc.t),Math.round(rc.b)],W:BL.W,H:BL.H,x:bx.x,minFoe,ban:B.banner&&B.banner.txt};});
 console.log('phone:',JSON.stringify(ph));
 chk(`phone 390x844: the summoned Scourge stands alone, boss sized (${ph.box} against ${ph.foeBox}), inside the stage (${ph.rc} in ${ph.W}x${ph.H}), on the party's side of the foes, with its banner (${ph.ban})`,!ph.err&&ph.front===1&&ph.big===1&&ph.box[0]>=ph.foeBox[0]&&ph.box[1]>=ph.foeBox[1]&&ph.rc[0]>=0&&ph.rc[1]<=ph.W+1&&ph.rc[2]>=0&&ph.rc[3]<=ph.H+1&&ph.x>ph.minFoe&&/^SCOURGE/.test(ph.ban||'')||JSON.stringify(ph));
 await H.browser.close();}

// ---------- 1. no battle menu memory ----------
{const H=await open({w:390,h:520,mobile:true,pre:PRE});const {ev,wait,until}=H;
 await ev(START,['mira','lumen','oren']);await wait(200);
 await ev(()=>{const A=__A,G=A.G;G.party.forEach(i=>{const c=G.roster[i];c.lv=30;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});G.inv.potion=9;A.setPause(60);A.startBattle({stage:0,kind:'field'});});
 await until(CMD,0,{timeout:20000});
 const q=await ev(async UNTILs=>{const UNTIL=(0,eval)('('+UNTILs+')'),A=__A,B=A.B,G=A.G,o={};B.en.forEach(e=>{e.S.mhp=e.hp=999999;e.S.atk=1;e.S.mag=1;});
  const scroller=()=>{const c=document.getElementById('bcmd');for(let e=c;e&&e!==document.body;e=e.parentElement){if(e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(getComputedStyle(e).overflowY))return e;}return null;};
  const a=B.cur,id=a.id;o.hero=a.name;o.first=B.menu;
  // a skill, from a scrolled Skills list
  const s=A.known(a).find(x=>x.t==='one'&&x.k!=='heal'&&!x.limit);a.mp=999;A.setPause(60);A.ACT.cmd('skills');A.render();const sc=scroller();if(sc){sc.scrollTop=80;o.scrolled=sc.scrollTop;}await new Promise(r=>setTimeout(r,120));
  A.ACT.sk(s.id);if(B.menu==='target')A.ACT.tgtE(0);o.afterSkill=await UNTIL(id);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  o.rootBtn=!!document.querySelector('#bcmd [data-act=cmd][data-arg=skills]');o.skillRows=document.querySelectorAll('#bcmd [data-act=sk]').length;const sc2=scroller();o.top=sc2?sc2.scrollTop:0;
  // inside the turn nothing changed: Skills opens, Back returns
  A.ACT.cmd('skills');A.render();o.open=B.menu;A.ACT.back();o.back=B.menu;
  // an item
  A.setPause(60);A.ACT.cmd('items');A.render();A.ACT.item('potion');if(B.menu==='target'){A.ACT.tgtA(A.TW.get('allParty')().indexOf(B.cur));}o.afterItem=await UNTIL(id);
  // looking at Skills and then guarding: still the main actions next turn
  A.setPause(60);A.ACT.cmd('skills');A.render();A.ACT.back();A.ACT.cmd('items');A.render();A.ACT.back();A.ACT.cmd('guard');o.afterGuard=await UNTIL(id);
  // the other heroes too
  const other=B.front.find(c=>c.id!==id&&c.hp>0);B.cur=other;B.pturns=(B.pturns||0)+1;B.mode='cmd';B.menu='root';B.pend=null;A.render();A.ACT.cmd('skills');A.render();B.cur=a;B.pturns++;B.menu='root';A.render();B.cur=other;B.pturns++;B.menu='root';A.render();o.other=B.menu;
  return o;},UNTIL.toString());
 console.log('menu:',JSON.stringify(q));
 chk(`after a skill, ${q.hero}'s next turn opens on the main actions (${q.afterSkill}), not on Skills, with the list at its top (${q.top})`,q.first==='root'&&q.afterSkill==='root'&&q.rootBtn&&q.skillRows===0&&q.top<3||JSON.stringify(q));
 chk(`after an item (${q.afterItem}), after only looking at the lists (${q.afterGuard}) and for another hero (${q.other}): the main actions`,q.afterItem==='root'&&q.afterGuard==='root'&&q.other==='root'||JSON.stringify(q));
 chk('inside a turn the lists still open and Back returns to the main actions',q.open==='skills'&&q.back==='root'||JSON.stringify(q));
 await H.browser.close();}

// ---------- 2. the action key ----------
{const H=await open({w:1000,h:700,pre:PRE});const {ev,wait,until,page}=H;
 await ev(START,['brann','mira','lumen']);await wait(200);
 // counters on the continue actions and on the world's interact
 await ev(()=>{const A=__A,g=A.TW.get;window.__n={};['resultOk','loseOk','storyOk','closeModal','xBack'].forEach(k=>{const f=A.ACT[k];A.ACT[k]=function(){window.__n[k]=(window.__n[k]||0)+1;return f.apply(this,arguments);};});
  g('{const i0=interact;interact=function(){window.__n.interact=(window.__n.interact||0)+1;return i0.apply(this,arguments);};}');
  document.body.style.minHeight='4000px';window.scrollTo(0,0);});
 const st=()=>ev(()=>({modal:__A.V.modal&&__A.V.modal.type,screen:__A.V.screen,n:Object.assign({},window.__n),y:Math.round(window.scrollY||document.scrollingElement.scrollTop||0)}));
 const fight=async()=>{await ev(()=>{const A=__A;A.V.modal=null;A.setPause(60);A.startBattle({stage:0,kind:'field'});});await until(CMD,0,{timeout:20000});};
 // victory: Space continues, once
 await fight();await ev(()=>{const A=__A;A.B.en.forEach(e=>e.hp=0);A.setPause(0);A.TW.get('win')();A.render();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();});await wait(500);
 const v0=await st();await page.keyboard.press('Space');await wait(400);const v1=await st();
 chk(`victory: the rewards screen is up (${v0.modal}); one press of Space continues (Continue ran ${v1.n.resultOk||0} time, now ${v1.modal||'no popup'} on ${v1.screen})`,v0.modal==='result'&&v1.n.resultOk===1&&v1.modal!=='result'||JSON.stringify([v0,v1]));
 chk(`the page did not scroll (${v1.y}) and the world did not get the press (${v1.n.interact||0})`,v1.y===0&&!v1.n.interact||JSON.stringify(v1));
 // whatever follows (a story card, a tip) is also continued one press at a time, until the world is back
 for(let i=0;i<4;i++){const s=await st();if(!s.modal)break;await page.keyboard.press('Space');await wait(300);}
 // a held key: one step only
 await fight();await ev(()=>{const A=__A;A.B.en.forEach(e=>e.hp=0);A.setPause(0);A.TW.get('win')();A.V.modal.info.story={title:'A card',text:'Held keys do not skip this.'};A.render();document.activeElement&&document.activeElement.blur&&document.activeElement.blur();window.__n={};});await wait(400);
 await page.keyboard.down('Space');await wait(60);await page.keyboard.down('Space');await page.keyboard.down('Space');await wait(250);const h1=await st();await page.keyboard.up('Space');await wait(250);const h2=await st();
 chk(`a held Space takes one step only (rewards to the story card: ${h1.modal}; Continue ${h1.n.resultOk||0}, story ${h1.n.storyOk||0}), and its release presses nothing (${h2.modal})`,h1.modal==='story'&&h1.n.resultOk===1&&!h1.n.storyOk&&h2.modal==='story'&&!h2.n.storyOk||JSON.stringify([h1,h2]));
 await page.keyboard.press('Space');await wait(400);const h3=await st();
 chk(`the next press continues the story card (${h3.n.storyOk||0}), back in the world (${h3.screen}, ${h3.modal||'no popup'})`,h3.n.storyOk===1&&h3.screen==='world'||JSON.stringify(h3));
 for(let i=0;i<4;i++){const s=await st();if(!s.modal)break;await page.keyboard.press('Space');await wait(300);}
 // defeat
 await fight();await ev(()=>{const A=__A;A.setPause(0);A.V.modal={type:'lose'};A.render();document.activeElement&&document.activeElement.blur&&document.activeElement.blur();window.__n={};window.scrollTo(0,0);});await wait(300);
 await page.keyboard.press('Space');await wait(500);const d1=await st();
 chk(`defeat: Space carries on ("The party falls" answered ${d1.n.loseOk||0} time; ${d1.screen}, ${d1.modal||'no popup'}; scroll ${d1.y})`,d1.n.loseOk===1&&d1.modal!=='lose'&&d1.screen==='world'&&d1.y===0||JSON.stringify(d1));
 for(let i=0;i<4;i++){const s=await st();if(!s.modal)break;await page.keyboard.press('Space');await wait(300);}
 // a one button popup in the world: Space answers it and does not also talk to what the hero faces
 await ev(()=>{const A=__A;A.V.modal={type:'wxinfo',kind:'time',from:null};A.render();document.activeElement&&document.activeElement.blur&&document.activeElement.blur();window.__n={};});await wait(200);
 const w0=await st();await page.keyboard.press('Space');await wait(300);const w1=await st();
 chk(`a one button popup in the world (${w0.modal}): Space answers it (${w1.modal||'closed'}) and the world does not get the same press (interact ${w1.n.interact||0})`,w0.modal==='wxinfo'&&!w1.modal&&!w1.n.interact||JSON.stringify([w0,w1]));
 await page.keyboard.press('Space');await wait(200);const w2=await st();
 chk(`with no popup the action key is the world's again (interact ${w2.n.interact||0})`,w2.n.interact===1||JSON.stringify(w2));
 await ev(()=>{const A=__A;try{A.TW.get('WS').dlg=null;}catch(e){}A.V.modal=null;A.render();});
 // a popup with a choice is not answered by Space
 await ev(()=>{const A=__A;A.V.modal={type:'innSure',from:null};A.render();document.activeElement&&document.activeElement.blur&&document.activeElement.blur();window.__n={};});await wait(200);
 await page.keyboard.press('Space');await wait(250);const c1=await st();
 chk(`a popup with a choice stays up (${c1.modal})`,c1.modal==='innSure'||JSON.stringify(c1));
 await ev(()=>{__A.V.modal=null;__A.render();});
 // ---- several keys for one action ----
 const k0=await ev(()=>{const g=__A.TW.get;return {def:g('kmDefault')('interact'),row:/data-act="kmOpen"/.test(g('settingsBody')())};});
 chk(`the action button's defaults hold Space (${k0.def.map(k=>k===' '?'Space':k).join(', ')}); Settings has the Keys row`,k0.def.includes(' ')&&k0.def.includes('z')&&k0.def.includes('Enter')&&k0.row||JSON.stringify(k0));
 await ev(()=>{__A.ACT.kmOpen();});await wait(200);
 await page.click('#modal [data-act=kmAddKey][data-arg=interact]');await wait(150);
 const k1=await ev(()=>({wait:(document.querySelector('#modal .kmwait')||{}).textContent||null}));
 await page.keyboard.press('x');await wait(250);
 const k2=await ev(()=>{const g=__A.TW.get;return {keys:g('kmKeys')('interact'),modal:__A.V.modal&&__A.V.modal.type,saved:JSON.parse(localStorage.getItem('aurelis-meta-v1')||'{}').keys||null,chips:[...document.querySelectorAll('#modal .kmrow')].map(r=>r.querySelectorAll('.kmk').length),addOff:!!document.querySelector('#modal [data-act=kmAddKey][data-arg=interact][disabled]')};});
 chk(`Add key waits for a key ("${k1.wait}") and adds it: the action button is ${k2.keys.map(k=>k===' '?'Space':k).join(', ')} (saved; the popup stays open; four is the most)`,/add/.test(k1.wait||'')&&k2.keys.join('|')==='z|Enter| |x'&&k2.modal==='keys'&&k2.saved&&k2.saved.interact.length===4&&k2.addOff||JSON.stringify(k2));
 // the new key works: it continues a prompt
 await ev(()=>{const A=__A;A.V.modal={type:'wxinfo',kind:'time',from:null};A.render();document.activeElement&&document.activeElement.blur&&document.activeElement.blur();window.__n={};});await wait(200);
 await page.keyboard.press('x');await wait(250);const k3=await st();
 chk(`the added key continues a prompt (${k3.modal||'closed'})`,!k3.modal||JSON.stringify(k3));
 // a key taken from another action moves; a chip removes a key; the last key of an action cannot be removed
 await ev(()=>{__A.ACT.kmOpen();});await wait(150);
 await page.click('#modal .kmx[data-arg="interact|x"]');await wait(150);
 await page.click('#modal [data-act=kmAddKey][data-arg=interact]');await wait(100);await page.keyboard.press('m');await wait(200);
 const k4=await ev(()=>{const g=__A.TW.get;return {act:g('kmKeys')('interact'),menu:g('kmKeys')('menu'),menuChip:!!document.querySelector('#modal .kmx[data-arg^="menu|"]')};});
 chk(`a chip removes a key (x gone) and a key bound elsewhere moves (M: action ${k4.act.map(k=>k===' '?'Space':k).join(', ')}; menu ${k4.menu.join(', ')||'unset'})`,k4.act.join('|')==='z|Enter| |m'&&k4.menu.length===0||JSON.stringify(k4));
 await ev(()=>{__A.ACT.kmReset();});await wait(150);
 const k5=await ev(()=>{const g=__A.TW.get;return {act:g('kmKeys')('interact'),run:g('kmKeys')('run'),runChip:!!document.querySelector('#modal .kmx[data-arg^="run|"]')};});
 chk('Reset to defaults puts everything back; an action with one key has no remove chip',k5.act.join('|')==='z|Enter| '&&k5.run.join()==='Shift'&&!k5.runChip||JSON.stringify(k5));
 await H.browser.close();}
done({browser:{close:async()=>{}}});
})();
