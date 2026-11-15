// legends18 (after 0.22.3), the owner's two notes:
// 1) "Nikaris should appear, talk to you and join your roster right after beating his pets": the trail's fight (the Pack Mother and two pups) and the
//    code quest's last pet fight (the young hawk) end with him joining inside the win (roster, a free seat in the six or the reserve, the account
//    unlock, the quest claimed); the rewards screen says so; back on the field he stands beside the party and his lines play in the field's dialogue
//    box (phone 390x844 with the HD-2D renderer asked for, desktop 1000x560 with the flat one); a save made in the middle of the scene loads in a
//    fresh page with him joined and the scene going on from its line; old saves at the old meeting step finish on load; a full six puts him in the reserve
// 2) "just give monks the same summon (invoke) capabilities of priest, it just takes 2 turns the summon only last 4 turns instead of priest 5": the
//    Monk presses Invoke, sits in stillness for two of his turns (the badge counts down), the full guardian arrives in the whole Vanguard's place and
//    acts 4 turns; a Priest's arrives the next turn and acts 5; a KO breaks the wind-up, a Stun does not; a Lesser Scourge answers a Monk under
//    the Priest's rules
// Usage: PWHTML=<abs path to out/aurelis3.html> node v197a.js
const {open,chk,done}=require('./pw');
const META=hd=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'${hd?'high':'low'}',hints:false,tips:false,hd2d:${hd},timedHits:false}}));`;
const START=()=>{const A=__A;A.ACT.new();['brann','mira','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();try{A.ACT.storyOk();}catch(e){}A.V.modal=null;A.render();};
// the party on a field of realm 2, a quest for Nikaris on the board (kind: 'trail' at its fight, 'code' at the hawk, 'oldTrail' / 'oldCode' at the old meeting)
const SETUP=kind=>{const A=__A,g=A.TW.get,G=A.G,s=1;G.stage=s;G.cleared[0]=true;delete G.roster.nikaris;G.party=G.party.filter(x=>x!=='nikaris');G.quests=G.quests.filter(q=>q.type!=='legend');delete G.l18meet;delete G.l18seat;
  const M=g('META');M.legends=Object.assign({},M.legends);delete M.legends.nikaris;
  const trail=kind==='trail'||kind==='oldTrail';if(!trail)M.legends.nikaris=1;
  const q=trail?{id:'Tnikaris',stage:s,type:'legend',hero:'nikaris',trail:1,tstep:kind==='oldTrail'?2:1,have:4,n:4,state:'active',step:0,title:'Tracks at the Treeline',desc:'x',reward:{gold:0}}
    :{id:'Lnikaris',stage:s,type:'legend',hero:'nikaris',state:'active',step:kind==='oldCode'?2:1,title:"The Wildcaller's Trial",desc:'x',reward:{gold:0}};
  G.quests.push(q);Object.values(G.roster).forEach(c=>{c.lv=12;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  const m=g('getMap')('f'+s);let p=null;for(const f of m.free){if([[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>!g('solidAt')(m,f[0]+dx,f[1]+dy)).length>=3&&!g('solidAt')(m,f[0],f[1])){p=f;break;}}
  if(kind==='oldTrail'||kind==='oldCode'){g('saveGame')();return {q:q.id,at:p};}
  A.V.screen='world';g('placeAt')('f'+s,p[0],p[1]);A.V.modal=null;A.render();return {q:q.id,at:p};};
// the fight of his beasts, won (the win the battle code calls when the last foe falls)
const FIGHT=()=>{const A=__A,g=A.TW.get,G=A.G,q=G.quests.find(x=>x.type==='legend'&&x.hero==='nikaris'),m=g('WS').m,a=g('dynActors')(m).find(x=>x.type==='legend'&&x.q===q);const o={actor:!!a};
  if(!a)return o;g('actorTalk')(a);o.modal=A.V.modal&&A.V.modal.type;A.ACT.legendFight();const B=A.B;o.foes=B?B.en.map(e=>e.name):null;if(!B)return o;
  o.inRoster0=!!G.roster.nikaris;B.en.forEach(e=>{e.hp=0;});g('win')();
  o.inRoster=!!G.roster.nikaris;o.qState=q.state;o.unlock=!!(g('META').legends||{}).nikaris;o.party=G.party.slice();o.result=A.V.modal&&A.V.modal.type;o.legend=A.V.modal&&A.V.modal.info&&A.V.modal.info.legend;
  o.meet=G.l18meet&&G.l18meet.kind;const k=Object.keys(localStorage).find(x=>x.startsWith('aurelis-wayfarers-v3'));const sv=k&&JSON.parse(localStorage.getItem(k));o.saved=!!(sv&&sv.roster&&sv.roster.nikaris)&&(sv.quests||[]).some(x=>x.hero==='nikaris'&&x.state==='claimed');
  A.render();o.resultHtml=/steps out of the trees, calls off his beasts and joins you/.test((document.getElementById('modal')||{}).innerHTML||'');return o;};
// the scene: the dialogue box and the actor beside the player
const SCENE=()=>{const A=__A,g=A.TW.get,G=A.G,WS=g('WS'),d=document.querySelector('#wdlg .dlg');if(!d||!WS.dlg)return null;const a=g('dynActors')(WS.m).find(x=>x.l18);
  return {text:WS.dlg.text,name:WS.dlg.name||null,por:!!d.querySelector('.dlgpor img'),i:G.l18meet&&G.l18meet.i,actor:a?{x:a.x,y:a.y,dist:Math.abs(a.x-WS.x)+Math.abs(a.y-WS.y)}:null,
    drawn:window.__NIK||0,modal:!!A.V.modal,screen:A.V.screen};};
const COUNT=()=>{window.__NIK=0;__A.TW.get('HOOK').after('walkerCanvas','v197a','count the drawings of Nikaris',function(r,key){if(key==='leg:nikaris')window.__NIK++;});};
async function playScene(H,tag,stopAt){const {ev,until,wait}=H;const lines=[];
  for(let k=0;k<12;k++){const s=await until(SCENE,null,{timeout:8000});if(!s||s.timeout){lines.push({timeout:true,last:s&&s.last});break;}
    lines.push(s);if(stopAt!=null&&s.i===stopAt)return lines;await ev(()=>{window.__NIK=0;});await wait(120);lines[lines.length-1].drawn=await ev(()=>window.__NIK||0);
    await ev(()=>{document.querySelector('#wdlg .dlg').click();});await wait(60);
    const end=await ev(()=>!__A.G.l18meet);if(end)break;}
  return lines;}

(async()=>{
// ---------- 1. the trail and the code quest, phone (HD-2D asked for) and desktop (flat) ----------
for(const [tag,w,h,hd] of [['phone',390,844,true],['desktop',1000,560,false]]){
 const H=await open({w,h,mobile:tag==='phone',pre:META(hd),tag:'v197a'+tag});const {ev,wait,until}=H;
 await ev(START);await wait(200);await ev(COUNT);
 for(const kind of ['trail','code']){
  await ev(SETUP,kind);await wait(150);
  const f=await ev(FIGHT);console.log(tag,kind,'fight:',JSON.stringify(Object.assign({},f,{resultHtml:f.resultHtml})));
  chk(`${tag} ${kind}: the fight is his beasts (${(f.foes||[]).join(', ')}); the moment it is won Nikaris is in the roster and the six (${(f.party||[]).join()}), unlocked on the account, the quest claimed, the save already holds him`,
   f.actor&&!f.inRoster0&&f.inRoster&&f.qState==='claimed'&&f.unlock&&(f.party||[]).includes('nikaris')&&f.saved&&f.meet===kind&&(kind==='trail'?(f.foes||[]).includes('The Pack Mother'):(f.foes||[]).join()==='Young Hawk')||JSON.stringify(f));
  chk(`${tag} ${kind}: the rewards screen says he steps out, calls off his beasts and joins (${f.legend})`,f.result==='result'&&f.resultHtml||JSON.stringify([f.result,f.legend]));
  // Continue on the rewards screen: back on the field he stands beside the party and talks
  await ev(()=>{const b=document.querySelector('#modal [data-act=resultOk]');if(b)b.click();else __A.ACT.resultOk();});
  const hd2=await ev(()=>{try{return !!__A.TW.get('hdActive')();}catch(e){return null;}});
  const L=await playScene(H,tag);console.log(tag,kind,'scene (hd2d live: '+hd2+'):',JSON.stringify(L.map(x=>[x.name,(x.text||'').slice(0,50),x.por,x.i,x.actor,x.drawn])));
  const after=await ev(()=>{const G=__A.G;return {meet:G.l18meet||null,party:G.party.slice(),dlg:!!__A.TW.get('WS').dlg,actor:__A.TW.get('dynActors')(__A.TW.get('WS').m).some(x=>x.l18),screen:__A.V.screen,quest:G.quests.filter(q=>q.hero==='nikaris').map(q=>q.state).join()};});
  const nik=L.filter(x=>x.name==='Nikaris');
  chk(`${tag} ${kind}: on the field he stands next to the player (${JSON.stringify(L[0]&&L[0].actor)}) and is drawn (${L.map(x=>x.drawn).join('/')}) while ${L.length} lines play (${nik.length} his, with his portrait)`,
   L.length===6&&!L.some(x=>x.timeout)&&L.every(x=>x.actor&&x.actor.dist<=2&&x.screen==='world'&&!x.modal)&&L.every(x=>x.drawn>0)&&nik.length===3&&nik.every(x=>x.por)&&L.map(x=>x.i).join()==='0,1,2,3,4,5'||JSON.stringify(L));
  chk(`${tag} ${kind}: the lines: his beasts stop, he steps out, is impressed, calls them off, offers to join; the last says he joined the six`,
   (kind==='trail'?/Pack Mother/.test(L[0].text):/young hawk/.test(L[0].text))&&/steps out of the trees/.test(L[1].text)&&/Most people/.test(L[2].text)&&/Back to the den/.test(L[3].text)&&/I'm Nikaris/.test(L[4].text)&&/coming with you/.test(L[4].text)&&/joins your roster and your six/.test(L[5].text)||JSON.stringify(L.map(x=>x.text)));
  chk(`${tag} ${kind}: after the last line the scene is over: no actor, no box, he stays in the six, the quest stays claimed`,!after.meet&&!after.dlg&&!after.actor&&after.party.includes('nikaris')&&after.quest==='claimed'||JSON.stringify(after));
 }
 // a full six: he joins into the reserve, the last line says so
 {await ev(()=>{const A=__A,G=A.G;['lumen','sable','tess'].forEach(id=>{if(!G.roster[id])G.roster[id]=A.TW.get('newChar')(id,12,1);if(!G.party.includes(id))G.party.push(id);});});
  await ev(SETUP,'trail');await ev(()=>{const A=__A,G=A.G;['lumen','sable','tess'].forEach(id=>{if(!G.party.includes(id))G.party.push(id);});});await wait(100);
  const f=await ev(FIGHT);await ev(()=>{__A.ACT.resultOk();});const L=await playScene(H,tag);
  const p=await ev(()=>({party:__A.G.party.slice(),roster:!!__A.G.roster.nikaris}));
  chk(`${tag}: with a full six he joins into the reserve (${p.party.join()}) and the last line says so`,p.roster&&!p.party.includes('nikaris')&&p.party.length===6&&/waits in the reserve/.test((L[L.length-1]||{}).text||'')||JSON.stringify([p,L.map(x=>x.text)]));
  await ev(()=>{const G=__A.G;G.party=G.party.slice(0,3);});}
 const errs=await ev(()=>(window.__WD||[]).map(x=>x.msg));chk(`${tag}: no game errors (${errs.length})`,errs.length===0||JSON.stringify(errs.slice(0,3)));
 await H.browser.close();}

// ---------- 2. a save in the middle of the scene, loaded in a fresh page; old saves at the old meeting ----------
{const H=await open({w:390,h:844,mobile:true,pre:META(false),tag:'v197a_mid'});const {ev,wait,until}=H;
 await ev(START);await wait(200);await ev(SETUP,'trail');const f=await ev(FIGHT);await ev(()=>{__A.ACT.resultOk();});
 const L=await playScene(H,'mid',2);// stop with the third line on screen (two lines read, each saved)
 const blob=await ev(()=>{__A.TW.get('saveGame')();const o={};Object.keys(localStorage).forEach(k=>{o[k]=localStorage.getItem(k);});return o;});
 await H.browser.close();
 const pre=`localStorage.clear();${Object.keys(blob).map(k=>`localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(blob[k])});`).join('')}`;
 const H2=await open({w:390,h:844,mobile:true,pre,tag:'v197a_mid2'});
 await H2.ev(()=>{__A.ACT.cont();});await H2.until(()=>!!__A.G&&__A.V.screen==='world',null,{timeout:15000});await H2.ev(COUNT);
 const s0=await H2.ev(()=>({roster:!!__A.G.roster.nikaris,party:__A.G.party.includes('nikaris'),meet:__A.G.l18meet&&__A.G.l18meet.i,quest:__A.G.quests.filter(q=>q.hero==='nikaris').map(q=>q.state).join()}));
 const L2=await playScene(H2,'mid2');
 chk(`a save made with the third line on screen (scene at line ${L[L.length-1]&&L[L.length-1].i}) loads with him joined (${JSON.stringify(s0)}), the scene goes on from that line (${L2.map(x=>x.i).join()}) and ends`,
  s0.roster&&s0.party&&s0.quest==='claimed'&&s0.meet===2&&L2.map(x=>x.i).join()==='2,3,4,5'&&L2.every(x=>x.actor)||JSON.stringify([s0,L2]));
 // old saves: a trail at its meeting step and a code quest at "Find the Wildcaller" finish on load
 for(const kind of ['oldTrail','oldCode']){
  const o=await H2.ev(SETUP,kind);const blob2=await H2.ev(()=>{const o={};Object.keys(localStorage).forEach(k=>{o[k]=localStorage.getItem(k);});return o;});
  const pre2=`localStorage.clear();${Object.keys(blob2).map(k=>`localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(blob2[k])});`).join('')}`;
  const H3=await open({w:1000,h:560,pre:pre2,tag:'v197a_'+kind});
  await H3.ev(()=>{__A.ACT.cont();});await H3.until(()=>!!__A.G&&__A.V.screen==='world',null,{timeout:15000});await H3.ev(COUNT);
  const L3=await playScene(H3,kind);const s3=await H3.ev(()=>({roster:!!__A.G.roster.nikaris,party:__A.G.party.includes('nikaris'),quest:__A.G.quests.filter(q=>q.hero==='nikaris').map(q=>q.state).join(),meet:!!__A.G.l18meet,unlock:!!(__A.TW.get('META').legends||{}).nikaris}));
  chk(`an old save at the ${kind==='oldTrail'?'trail\'s meeting (tstep 2)':'code quest\'s "Find the Wildcaller" (step 2)'}: he joins on load (${JSON.stringify(s3)}) and the scene plays (${L3.length} lines)`,
   s3.roster&&s3.party&&s3.quest==='claimed'&&!s3.meet&&s3.unlock&&L3.length===6&&(kind==='oldTrail'?/Pack Mother/:/young hawk/).test(L3[0].text)||JSON.stringify([s3,L3]));
  await H3.browser.close();}
 // the pup fight of the code quest still moves the quest on (he joins after the hawk)
 {const r=await H2.ev(()=>{const A=__A,g=A.TW.get,G=A.G;delete G.roster.nikaris;G.party=G.party.filter(x=>x!=='nikaris');G.quests=G.quests.filter(q=>q.type!=='legend');
   const q={id:'Lnikaris',stage:1,type:'legend',hero:'nikaris',state:'active',step:0,title:"The Wildcaller's Trial",desc:'x',reward:{gold:0}};G.quests.push(q);
   A.startBattle({stage:1,kind:'legend',hero:'nikaris',step:0});const foes=A.B.en.map(e=>e.name);A.B.en.forEach(e=>{e.hp=0;});g('win')();const o={foes,step:q.step,joined:!!G.roster.nikaris,meet:!!G.l18meet};A.V.modal=null;A.finishBattle('win');return o;});
  chk(`the code quest's pup fight (${r.foes.join()}) moves it on to the hawk as before; he does not join yet`,r.step===1&&!r.joined&&!r.meet&&r.foes.join()==='Starving Wolf Pup'||JSON.stringify(r));}
 await H2.browser.close();}

// ---------- 3. the Monk's Invoke: two turns of stillness, the Priest's guardian, 4 turns; the Priest's: one turn, 5 ----------
{const H=await open({w:1000,h:700,pre:META(false),tag:'v197a_monk'});const {ev,wait,until}=H;
 await ev(()=>{const A=__A;A.ACT.new();['brann','taro','lumen'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();try{A.ACT.storyOk();}catch(e){}A.V.modal=null;A.render();});await wait(200);
 const CMD=()=>{const B=__A.B;return B&&B.mode==='cmd'&&B.cur&&B.cur.side==='p'&&B.cur.id;};
 const RUN=async who=>{
  await ev(()=>{const A=__A,G=A.G,g=A.TW.get;G.party.forEach(id=>{const c=G.roster[id];c.lv=20;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});const mini=g('MINIS')[0];G.summons={[mini[0]]:{mon:mini[0],name:mini[2],mod:mini[5]}};G.tamed=[];
   A.setPause(60);A.V.auto=false;A.startBattle({stage:0,kind:'field'});});
  await until(CMD,0,{timeout:20000});
  return await ev(who=>new Promise(res=>{const A=__A,g=A.TW.get,B=A.B,o={log:[],arrive:null,gTurns:0,still:[],badge:[]};B.auto=false;
   B.en.forEach(e=>{e.S.mhp=e.hp=999999;e.next=1e12;});const a=B.front.concat(B.back).find(c=>c.id===who);if(B.front.indexOf(a)<0){const j=B.back.indexOf(a);B.back[j]=B.front[0];B.front[0]=a;}
   B.front.concat(B.back).forEach(c=>{if(c!==a)c.next=1e12;});a.mp=a.S.mmp;B.cur=a;B.mode='cmd';B.menu='root';A.render();
   const ownTurns=()=>o.still.length;let myTurns=0;
   g('HOOK').after('sumFire','v197a','arrival',function(r){if(r&&B.sum)o.arrive={myTurns,turns:B.sum.u.turnsLeft,front:B.front.map(x=>x.isSum?'guardian':x.id).join(),atk:B.sum.u.S.atk};});
   g('HOOK').before('perform','v197a','guardian turns',function(u){if(u&&u.isSum)o.gTurns++;});
   g('HOOK').after('renderBattle','v197a','badge',function(){const b=document.querySelector('.s8pray');if(b&&B.pray&&o.badge[o.badge.length-1]!==b.textContent)o.badge.push(b.textContent);});
   const lg0=B.log.length;document.querySelector('#bcmd [data-act=sumOne]').click();o.pray={n:B.pray&&B.pray.n,turns:B.pray&&B.pray.turns};
   const t0=Date.now();const tick=()=>{if(B.pray&&B.pray.by===a){const k=B.log.slice(lg0).filter(l=>/keeps still|keeps praying/.test(l)).length;if(k>myTurns){myTurns=k;o.still.push(k);}}
     if(o.arrive&&!B.sum&&B.mode==='cmd'){o.log=B.log.slice(lg0);o.back=B.front.map(x=>x.id).join();res(o);return;}if(Date.now()-t0>30000){o.log=B.log.slice(lg0);o.timeout=1;res(o);return;}setTimeout(tick,30);};tick();}),who);};
 const m=await RUN('taro');console.log('monk:',JSON.stringify(Object.assign({},m,{log:m.log.slice(0,6)})));
 await ev(()=>{const A=__A;A.B.over=true;A.finishBattle('fled');A.V.modal=null;});await wait(300);
 const p=await RUN('lumen');console.log('priest:',JSON.stringify(Object.assign({},p,{log:p.log.slice(0,6)})));
 chk(`the Monk: Invoke, ${m.pray.n} turns of stillness (one more turn of his kept still: ${m.still.length}; the badge ${JSON.stringify(m.badge)}), then the guardian takes the whole Vanguard's place (${m.arrive&&m.arrive.front}) and acts ${m.gTurns} turns (${m.arrive&&m.arrive.turns}); the Vanguard comes back`,
  !m.timeout&&m.pray.n===2&&m.pray.turns===4&&m.still.length===1&&m.arrive&&m.arrive.front==='guardian'&&m.arrive.turns===4&&m.gTurns===4&&/sits in stillness.*in 2 turns/.test(m.log.join(' | '))&&/keeps still/.test(m.log.join(' | '))&&m.badge.some(b=>/· 2/.test(b))&&m.back.split(',').includes('taro')||JSON.stringify(m));
 chk(`the Priest: the guardian answers the next turn (no turn kept praying: ${p.still.length}) and acts ${p.gTurns} turns (${p.arrive&&p.arrive.turns})`,!p.timeout&&p.pray.n===1&&p.still.length===0&&p.arrive&&p.arrive.front==='guardian'&&p.arrive.turns===5&&p.gTurns===5||JSON.stringify(p));
 // a KO breaks the wind-up, a Stun does not
 await ev(()=>{const A=__A;A.B.over=true;A.finishBattle('fled');A.V.modal=null;});await wait(300);
 await ev(()=>{const A=__A;A.setPause(60);A.startBattle({stage:0,kind:'field'});});await until(CMD,0,{timeout:20000});
 const k=await ev(()=>{const A=__A,g=A.TW.get,B=A.B,o={};A.setPause(99999);const a=B.front.concat(B.back).find(c=>c.id==='taro');if(B.front.indexOf(a)<0){const j=B.back.indexOf(a);B.back[j]=B.front[0];B.front[0]=a;}
  a.mp=a.S.mmp;B.cur=a;B.mode='cmd';B.menu='root';A.render();g('sumPray')(a,Object.keys(A.G.summons)[0]);o.stun0=!!B.pray;g('addSt')(a,'stun',null,true);o.stun=!!B.pray;
  a.hp=0;g('fallen')(a);o.ko=!B.pray;return o;});
 chk(`a KO breaks the Monk's wind-up (${JSON.stringify(k)})`,k.stun0&&k.ko||JSON.stringify(k));
 // a Lesser Scourge paired with the Monk: the Priest's rules (4 turns, the same power and HP)
 const sc=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,o={};A.B.over=true;A.finishBattle('fled');A.V.modal=null;const GU=g('GUARDIANS'),gk=Object.keys(GU)[0],d=g('guardianDef')(gk);
  const pet=(w,i)=>{const p={id:'tm97'+i,mon:gk,name:'Lesser '+d.n,cls:g('tameClass')(d),trait:g('tameTrait')(d),bb:1,scourge:1,with:w,bt:0};g('registerTamed')(p);return p;};
  G.party.forEach(id=>{const c=G.roster[id];c.hp=c.S.mhp;c.mp=c.S.mmp;});
  ['taro','lumen'].forEach((w,i)=>{G.tamed=[pet(w,i)];A.setPause(99999);A.startBattle({stage:0,kind:'field'});const B=A.B;const a=B.front.concat(B.back).find(c=>c.id===w);if(B.front.indexOf(a)<0){const j=B.back.indexOf(a);B.back[j]=B.front[0];B.front[0]=a;}
   B.cur=a;B.mode='cmd';B.menu='root';A.render();const btn=document.querySelector('#bcmd .b9sum');o[w]={dis:btn?btn.disabled:null};A.ACT.summon();const u=B.front[0];o[w].turns=u.turnsLeft;o[w].big=u.b16big;o[w].ratio=+(u.S.atk/a.lv).toFixed(3);o[w].hp=u.S.mhp;o[w].front=B.front.length;
   B.over=true;A.finishBattle('fled');A.V.modal=null;});G.tamed=[];return o;});
 chk(`a Lesser Scourge answers the Monk under the Priest's rules: ${sc.taro.turns} turns (Priest ${sc.lumen.turns}), boss sized, alone in front`,sc.taro.dis===false&&sc.taro.turns===4&&sc.lumen.turns===4&&sc.taro.big===1&&sc.taro.front===1&&sc.lumen.front===1||JSON.stringify(sc));
 const errs=await ev(()=>(window.__WD||[]).map(x=>x.msg));chk(`monk: no game errors (${errs.length})`,errs.length===0||JSON.stringify(errs.slice(0,3)));
 await H.browser.close();}
done({browser:{close:async()=>{}}});
})();
