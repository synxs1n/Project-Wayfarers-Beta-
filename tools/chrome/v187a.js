// quests, guilds and the goals panel (v3/quests16.js), the owner's five notes after 0.21.0:
// 1) the guilds are locked until the first realm's Scourge falls: a locked note on the Guild Hall, the board and the Menu, no guild
//    notices, no standing from anything done before; the lock lifts with the Scourge and counts from zero; an older save already past
//    the first realm keeps its standing
// 2) personal quests need 50 battles together; reaching it offers the quest in a popup after the victory screen (never during the
//    fight) with Accept and Later; Later leaves it under Quests > Personal on the board
// 3) every kind of notice is accepted and handed in at the town Notice Board: realm quests, bounties, guild notices, guild missions,
//    the personal quests
// 4) "Sign the guild ledger" and "First blood in the pit" are handed in at the Guild Hall (and the board); every guild mission walks
//    through accept, complete and hand in at both places
// 5) Next goals at 360, 390, 430 px and on a desktop: no word of a goal is split, the progress tag does not cost the text a line more
//    than its own, and it sits right aligned inside the row; the panel is on every world screen (towns, fields, a dungeon, map
//    corners, under the area banner, in a dialogue; 2D and HD-2D), folds to its header bar and opens again only by its arrow (44 px tap
//    target on phones, saved), and Settings > Show goals turns it off
// Usage: PWHTML=<abs path>/out/aurelis3.html [SHOTDIR=dir] node v187a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false,tips:false}}));`;
const START=()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();};
const SH=process.env.SHOTDIR;
(async()=>{let H=await open({w:390,h:844,mobile:true,pre:PRE});let {ev,wait}=H;await ev(START);
// ---------- 1. the guild lock ----------
let r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),o={};const txt=()=>document.querySelector('#modal').innerText,has=s=>!!document.querySelector('#modal '+s);
  o.open0=__Q16.g16Open();g('m3Quests')();o.notices0=G.quests.filter(q=>q.type==='guild'||q.type==='arena').length;
  // things that used to count: wins, hand wins, forging, taming
  G.stats.won=40;const f=g('facInit')();f.ctr.manual=30;f.ctr.forge=6;f.ctr.potion=9;f.ctr.elite=2;
  o.rep0=g('FAC').map(F=>g('facRep')(F.id));o.rank0=g('FAC').map(F=>g('facRank')(F.id));
  A.V.modal={type:'guild'};A.render();o.hall=has('.g16lock')&&!has('[data-act=facAccept]')&&!has('.facc');o.hallTabs=[...document.querySelectorAll('#modal .stabs button')].map(b=>b.innerText.trim());o.seen=G.guildSeen||0;
  A.V.modal={type:'board',tab:'guilds'};A.render();o.board=has('.g16lock')&&!has('.facc');
  A.V.modal={type:'board',tab:'all'};A.render();o.all=![...document.querySelectorAll('#modal .r12kind')].some(e=>/guild/i.test(e.innerText));
  A.V.modal={type:'menu',tab:'factions'};A.render();o.menu=has('.g16lock')&&!has('.facc');
  A.V.modal={type:'smithy'};A.render();o.strip=!has('.facrank');
  A.ACT.facAccept('g1');o.acc=Object.keys(f.acc).length;o.goal=__GL.GOALS.find(x=>x.id==='guildm').ok();
  o.g16=G.g16;A.V.modal=null;A.render();return o;});
chk('first realm: the guilds are locked (no notices posted, standing 0 and rank 1 whatever was done)',r.open0===false&&r.notices0===0&&r.rep0.every(x=>x===0)&&r.rank0.every(x=>x===1)&&r.g16===1||JSON.stringify(r));
chk('a locked note where the guilds would be: Guild Hall, the board\'s Guilds tab, Menu > Guilds; no rank strip in the Smithy',r.hall&&r.board&&r.menu&&r.strip&&r.all||JSON.stringify(r));
chk('locked: no mission can be taken, the ledger is not signed by looking, no guild goal',r.acc===0&&!r.seen&&!r.goal||JSON.stringify(r));
r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),o={};const f=g('facInit')();
  G.cleared[0]=true;o.open=__Q16.g16Open();o.rep1=g('FAC').map(F=>g('facRep')(F.id));o.g16=G.g16;o.base=!!(f.base&&f.base.c&&f.base.c.wins===40&&f.base.c.manual===30);
  g('m3Quests')();o.notices=G.quests.filter(q=>q.type==='guild'||q.type==='arena').map(q=>q.id+':'+q.state+':'+(q.global?1:0)).join();
  G.stats.won+=8;f.ctr.manual+=5;g('facDirty')();o.guild=g('facRaw')('guild');o.hand=g('facRaw')('hand');o.wins=g('facCount')('wins');
  A.V.modal={type:'guild'};A.render();const m=document.querySelector('#modal');o.hall=!m.querySelector('.g16lock')&&!!m.querySelector('.facc')&&!!m.querySelector('[data-act=facAccept]');
  o.goal=__GL.GOALS.find(x=>x.id==='guildm').ok();
  // the save keeps the zero point
  const back=g('unpackG')(JSON.parse(JSON.stringify(g('packG')())));o.saved=back.g16===2&&back.fac.base.c.wins===40;A.V.modal=null;A.render();return o;});
chk('the first Scourge falls: the guilds open, standing starts from zero and counts from there (8 wins = 2, 5 hand wins = 10)',r.open&&r.g16===2&&r.base&&r.rep1.every(x=>x===0)&&r.guild===2&&r.hand===10&&r.wins===8||JSON.stringify(r));
chk('the guild notices go up for every town, missions can be taken, the zero point is saved',r.notices==='gh0:open:1,ga0:open:1'&&r.hall&&r.goal&&r.saved||JSON.stringify(r));
r=await ev(()=>{const A=__A,g=A.TW.get,o={};
  // an older save: already past the first realm, never saw the lock
  A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;let G=g('G');
  const s=JSON.parse(JSON.stringify(g('packG')()));delete s.g16;s.cleared[0]=true;s.stage=1;s.stats.won=40;s.fac={ctr:{manual:30},bonus:{guild:25},acc:{g1:0},done:{},claim:{},seen:{},hand:{}};
  localStorage.setItem('pw-old',JSON.stringify(s));const G2=g('unpackG')(JSON.parse(localStorage.getItem('pw-old')));Object.keys(G).forEach(k=>delete G[k]);Object.assign(G,G2);g('facDirty')();
  o.guild=g('facRep')('guild');o.hand=g('facRep')('hand');o.g16=G.g16;o.base=!!(G.fac&&G.fac.base);o.acc=G.fac.acc.g1===0;A.render();return o;});
chk('an older save past the first realm keeps its standing (40 wins, a Scourge and a mission bonus = 50) and missions, no zero point',r.guild===50&&r.hand===60&&r.g16===2&&!r.base&&r.acc||JSON.stringify(r));
await done2(H);
// ---------- 2. personal quests: 50 battles, the offer after the victory screen ----------
H=await open({w:390,h:844,mobile:true,pre:PRE,out:SH||'/tmp'});({ev,wait}=H);await ev(START);
const FIGHT=()=>{const A=__A,g=A.TW.get;A.setPause(99999);const k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[0];A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],3)]});
  const B=A.B;B.en.forEach(e=>{e.hp=0;B.kills.push(e);});A.win();const o={during:A.V.modal&&A.V.modal.type,inB:!!A.B};A.ACT.resultOk();if(A.V.modal&&A.V.modal.type==='result')A.ACT.resultLeave&&A.ACT.resultLeave();
  o.after=A.V.modal&&A.V.modal.type;o.ids=A.V.modal&&A.V.modal.ids;o.B=!!A.B;o.screen=A.V.screen;o.html=document.querySelector('#modal')?document.querySelector('#modal').innerText:'';
  o.btns=[...document.querySelectorAll('#modal [data-act]')].map(b=>b.dataset.act+':'+(b.dataset.arg||'')+':'+b.innerText.trim());return o;};
r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),o={};o.bt=g('PERSONAL_BT');G.stage=2;G.cleared=[true,true,false,false,false];const c=G.roster.mira;
  c.bt=49;o.e49=g('personalEligible')(c);c.bt=50;o.e50=g('personalEligible')(c);c.bt=49;Object.values(G.roster).forEach(x=>{if(x.id!=='mira')x.bt=3;});
  o.front=G.party.slice(0,3).includes('mira');o.line=g('pqSheetLine')(c);return o;});
chk('personal quests need 50 battles together (49 no, 50 yes)',r.bt===50&&r.e49===false&&r.e50===true&&/49 of 50/.test(r.line)||JSON.stringify(r));
r=await ev(FIGHT);
chk('the 50th battle: nothing over the fight or the victory screen, then the offer popup with Accept and Later',r.during==='result'&&r.after==='pqoffer'&&r.ids.join()==='mira'&&r.screen==='world'&&!r.B&&r.btns.some(b=>/^pq16Accept:mira:Accept/.test(b))&&r.btns.some(b=>/^closeModal::Later/.test(b))||JSON.stringify(r));
if(SH)await H.shot('v187a_offer');
await H.page.click('#modal [data-act=pq16Accept]');await wait(150);
r=await ev(()=>{const A=__A,G=A.TW.get('G');return {st:G.personal.mira&&G.personal.mira.state,modal:A.V.modal&&A.V.modal.type,off:G.pqOff&&G.pqOff.mira};});
chk('Accept starts the quest (a rival roams) and closes the popup',r.st==='active'&&!r.modal&&r.off===1||JSON.stringify(r));
await ev(()=>{const G=__A.TW.get('G');G.roster.lumen.bt=49;});r=await ev(FIGHT);
chk('the next wayfarer to reach 50 gets the offer',r.after==='pqoffer'&&r.ids.join()==='lumen'||JSON.stringify(r));
await H.page.click('#modal [data-act=closeModal]');await wait(150);
r=await ev(()=>{const A=__A,G=A.TW.get('G');return {st:G.personal.lumen&&G.personal.lumen.state,modal:A.V.modal&&A.V.modal.type,off:G.pqOff.lumen};});
const later=r;r=await ev(FIGHT);
chk('Later closes it without starting, and it is not offered again',!later.st&&!later.modal&&later.off===1&&r.after!=='pqoffer'||JSON.stringify([later,r]));
r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G');A.V.modal=null;A.V.screen='world';g('enterVia')?0:0;const o={};const t=g('getMap')('t0');o.town=g('WS').m&&g('WS').m.kind;
  A.V.modal={type:'board',tab:'quests',sec:'personal'};A.render();o.btn=!!document.querySelector('#modal [data-act=personal][data-arg=lumen]');
  A.V.modal={type:'board',tab:'all'};A.render();o.all=!!document.querySelector('#modal [data-act=personal][data-arg=lumen]');return o;});
await H.page.click('#modal [data-act=personal][data-arg=lumen]');await wait(150);
const r2=await ev(()=>{const G=__A.TW.get('G');return G.personal.lumen&&G.personal.lumen.state;});
chk('it stays on the Notice Board (Quests > Personal and the Notices list) and is accepted there',r.btn&&r.all&&r2==='active'||JSON.stringify([r,r2]));
await done2(H);
// ---------- 3 and 4. every kind at the Notice Board; every guild quest through accept, complete, hand in ----------
H=await open({w:390,h:844,mobile:true,pre:PRE});({ev,wait}=H);await ev(START);
r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),o={};o.town=g('inTown')();G.cleared[0]=true;g('facCount')('wins');// the guilds open
  A.V.modal={type:'board'};A.render();o.tabs=[...document.querySelectorAll('#modal .stabs button')].map(b=>b.innerText.trim()).join();
  const Q=g('m3Quests')();o.kinds=[...new Set(Q.map(q=>q.type))].sort().join();return o;});
chk('the town board has its Guilds tab back (Notices, Quests, Guilds, Bounties)',r.town&&r.tabs==='Notices,Quests,Guilds,Bounties'||JSON.stringify(r));
const click=async sel=>{const n=await H.page.locator(sel).count();if(!n)return false;await H.page.locator(sel).first().click();await wait(60);return true;};
// realm quests, the Tamer quest and the guild notices: accept on the board, complete, claim on the board
const ids=await ev(()=>{const A=__A,g=A.TW.get,G=g('G');const t=G.quests.find(q=>q.id==='tamer');if(t)t.stage=0;return g('m3Quests')().filter(q=>q.state==='open'&&q.type!=='legend').map(q=>q.id+':'+q.type);});
const res={};
for(const s of ids){const [id,type]=s.split(':');await ev(()=>{const A=__A;A.V.modal={type:'board',tab:'all'};A.render();});
  const a=await click(`#modal [data-act=qAccept][data-arg="${id}"]`);
  const st=await ev(([id])=>{const A=__A,g=A.TW.get,G=g('G'),q=G.quests.find(x=>x.id===id);const was=q.state;
    if(q.type==='hunt')q.have=q.n;else if(q.type==='gather')G.mats[q.mat]=(G.mats[q.mat]||0)+q.n;else if(q.type==='vault'){G.vaults=G.vaults||{};G.vaults[q.stage]=1;}else if(q.type==='wanderer')q.found=1;
    else if(q.type==='guild'){A.V.modal={type:'guild'};A.render();}else if(q.type==='arena'){G.arena[0]=1;}
    else if(q.type==='tamer'){const need=q.n-g('stickCount')().n;G.tameLog=G.tameLog||{};}
    A.V.modal={type:'board',tab:'all'};A.render();return {was,ready:g('questReady')(q)};},[id]);
  let c=false;if(st.ready)c=await click(`#modal [data-act=qClaim][data-arg="${id}"]`);
  const end=await ev(([id])=>__A.TW.get('G').quests.find(x=>x.id===id).state,[id]);res[s]={a,was:st.was,ready:st.ready,c,end};}
const kinds=Object.keys(res).map(s=>s.split(':')[1]);
const bad=Object.keys(res).filter(s=>!(res[s].a&&res[s].was==='active'))
  .concat(Object.keys(res).filter(s=>res[s].ready&&!(res[s].c&&res[s].end==='claimed')).map(s=>s+' (claim)'));
chk(`on the board every notice is accepted, and every completed one is claimed (${Object.keys(res).map(s=>s+(res[s].ready?'':' not completed here')).join(', ')})`,
  ['hunt','gather','vault','guild','arena'].every(k=>kinds.includes(k)&&Object.keys(res).some(s=>s.endsWith(':'+k)&&res[s].end==='claimed'))&&!bad.length||JSON.stringify({bad,res}));
// a bounty: accepted on the board, beaten, paid by the board
r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G');A.V.modal={type:'board',tab:'all'};A.render();const b=g('nbBountyList')().find(x=>x.stage===0&&x.state==='open');return b&&b.id;});
const bid=r;const ba=await click(`#modal [data-act=bounty][data-arg="${bid}"]`);
await ev(([id])=>{const A=__A,G=A.TW.get('G');G.bounties.find(x=>x.id===id).state='ready';A.V.modal={type:'board',tab:'all'};A.render();},[bid]);
const bc=await click(`#modal [data-act=bountyClaim][data-arg="${bid}"]`);
r=await ev(([id])=>__A.TW.get('G').bounties.find(x=>x.id===id).state,[bid]);
chk('a bounty is accepted and paid at the board',ba&&bc&&r==='done'||JSON.stringify({ba,bc,r}));
// the two guild notices again, this time at the Guild Hall (the owner's report), on a fresh journey
await done2(H);H=await open({w:390,h:844,mobile:true,pre:PRE});({ev,wait}=H);await ev(START);
const click2=async sel=>{const n=await H.page.locator(sel).count();if(!n)return false;await H.page.locator(sel).first().click();await wait(60);return true;};
await ev(()=>{const A=__A,g=A.TW.get,G=g('G');G.cleared[0]=true;g('facCount')('wins');A.V.modal={type:'guild'};A.render();});
r=await ev(()=>{const m=document.querySelector('#modal');return {rows:[...m.querySelectorAll('.q16gn .row b')].map(b=>b.innerText).join('|'),seen:__A.TW.get('G').guildSeen};});
chk('the Guild Hall\'s Guilds tab lists the guild notices',r.rows==='Sign the guild ledger|First blood in the pit'&&r.seen===1||JSON.stringify(r));
const h1=await click2('#modal [data-act=qAccept][data-arg=gh0]'),h2=await click2('#modal [data-act=qAccept][data-arg=ga0]');
r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G');const q=G.quests.find(x=>x.id==='ga0');const o={ready0:g('questReady')(q)};G.arena[0]=1;A.render();
  A.V.modal={type:'menu',tab:'nball'};A.render();o.menu=!document.querySelector('#modal [data-act=qClaim][data-arg=gh0]')&&/Hand in at any Guild Hall or Notice Board/.test(document.querySelector('#modal').innerText);
  A.V.modal={type:'guild'};A.render();return o;});
const gold0=await ev(()=>__A.TW.get('G').gold);
const h3=await click2('#modal [data-act=qClaim][data-arg=gh0]'),h4=await click2('#modal [data-act=qClaim][data-arg=ga0]');
const gq=await ev(()=>{const G=__A.TW.get('G');return {gh0:G.quests.find(x=>x.id==='gh0').state,ga0:G.quests.find(x=>x.id==='ga0').state,gold:G.gold};});
chk('"Sign the guild ledger" and "First blood in the pit": accepted, completed and handed in at the Guild Hall (not from the Menu, which says where)',h1&&h2&&h3&&h4&&r.ready0===false&&r.menu&&gq.gh0==='claimed'&&gq.ga0==='claimed'&&gq.gold>gold0||JSON.stringify({h1,h2,h3,h4,r,gq}));
// every guild mission: accept, complete, hand in; half at the Guild Hall, half at the board; none from the Menu
r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),FM=g('FMIS'),f=g('facInit')(),out=[];
  FM.forEach((m,i)=>{const o={id:m.id};A.V.modal={type:'guild'};A.ACT.facAccept(m.id);o.acc=f.acc[m.id]!=null;o.st0=g('facMisState')(m);
    f.ctr[m.k]=((f.base&&f.base.c&&f.base.c[m.k])||0)+Math.max(f.ctr[m.k]||0,0)+m.n+500;g('facDirty')();o.ready=g('facMisState')(m)==='ready';
    A.V.modal={type:'menu',tab:'factions'};A.ACT.facClaim(m.id);o.menu=!f.done[m.id];
    A.V.modal={type:i%2?'board':'guild',tab:'guilds'};A.render();o.row=!!document.querySelector(`#modal [data-act=facClaim][data-arg="${m.id}"]`)||'not listed';const g0=G.gold;A.ACT.facClaim(m.id);o.done=!!f.done[m.id]&&G.gold>g0;o.at=i%2?'board':'hall';out.push(o);});
  return {n:FM.length,bad:out.filter(o=>!(o.acc&&o.ready&&o.menu&&o.done)),listed:out.filter(o=>o.row===true).length};});
chk(`all ${r.n} guild missions walk through accept, complete and hand in (Guild Hall and board in turn; ${r.listed} had their Claim row on screen)`,r.n>=20&&!r.bad.length&&r.listed>=5||JSON.stringify(r));
await done2(H);
// ---------- 5. Next goals rows ----------
for(const [w,h,mob,gfx] of [[360,740,true],[390,844,true],[390,844,true,'medium'],[430,932,true],[1366,768,false]]){
  H=await open({w,h,mobile:mob,pre:gfx?PRE.replace("gfx:'low'","gfx:'"+gfx+"'"):PRE,out:SH||'/tmp'});({ev,wait}=H);await ev(START);const tag=`${w}x${h}${gfx?' '+gfx:''}: `;
  await ev(()=>{const A=__A,g=A.TW.get,G=g('G');g('m3Quests')();const a=G.quests.find(q=>q.id==='h0'),b=G.quests.find(q=>q.id==='g0');
    a.state='active';a.title='Cull the Slag Golems';a.have=1;b.state='active';b.title='Emberwood for the smith';G.mats[b.mat]=2;A.V.modal=null;A.render();__GL.GL.sig='';__GL.glRender();});
  const ban=await ev(async()=>{const A=__A;A.TW.get('placeAt')('t0',5,5,'d');A.TW.get('showLocation')();A.V.modal=null;A.render();await new Promise(q=>setTimeout(q,250));__GL.glRender();const e=document.getElementById('glp');return {banner:!!document.querySelector('#wloc.on'),shown:!!e&&e.style.display!=='none'&&e.offsetWidth>0,mode:e?e.className:''};});
  await H.until(()=>!document.querySelector('#wloc.on'),null,{timeout:9000});await ev(()=>{__GL.GL.sig='';__GL.glRender();});await wait(450);
  const M=()=>{const e=document.getElementById('glp');if(!e||e.style.display==='none')return {off:1};const P=e.getBoundingClientRect();
    const rows=[...e.querySelectorAll('.gll li')].map(li=>{const sp=li.querySelector('span'),em=li.querySelector('em'),L=li.getBoundingClientRect();
      // every word in one piece: a word that wraps inside itself has more than one client rect
      const split=[];const tn=[...sp.childNodes].filter(n=>n.nodeType===3);tn.forEach(n=>{const re=/\S+/g;let m;while((m=re.exec(n.data))){const R=document.createRange();R.setStart(n,m.index);R.setEnd(n,m.index+m[0].length);if(R.getClientRects().length>1)split.push(m[0]);}});
      const lines=el=>{const ys=new Set();const R=document.createRange();R.selectNodeContents(el);[...R.getClientRects()].forEach(q=>{if(q.width>0)ys.add(Math.round(q.top));});return ys.size;};
      const n1=lines(sp);let n0=n1;if(em){em.style.display='none';n0=lines(sp);em.style.display='';}
      const E=em&&em.getBoundingClientRect(),S=sp.getBoundingClientRect();
      // the tag never sits beside text it squeezed: it is on the text's last line or under it
      return {t:sp.textContent,tag:em?em.textContent:'',split,n1,n0,in:!E||(E.left>=L.left-1&&E.right<=L.right+1&&E.bottom<=L.bottom+1),right:!E||Math.abs(E.right-L.right)<=2,low:!E||E.bottom>=S.bottom-3,w:Math.round(L.width)};});
    return {mode:e.className,w:Math.round(P.width),rows,over:e.scrollWidth>e.clientWidth+1};};
  r=await ev(M);if(process.env.V187DBG){console.log(tag,JSON.stringify(r).slice(0,300));await H.shot('v187a_raw_'+w);}
  if(r.off||/chip/.test(r.mode)){// a narrow view may fold the panel while the hero stands under it: measure the hidden copy the panel is sized from instead
    r=await ev(()=>{const A=__A;const wv=document.querySelector('.wview');let e=document.getElementById('glp');if(!e){e=document.createElement('div');e.id='glp';wv.appendChild(e);}
      e.style.display='';e.className='gl full';e.innerHTML=__A.TW.get('glHtml')(__A.TW.get('glList')(),'full');__GL.GL.sig='x';return 1;});r=await ev(M);r.forced=1;}
  if(SH)await H.shot('v187a_goals_'+w+(gfx||''));
  const Q=(r.rows||[]).filter(x=>x.tag),bad=(r.rows||[]).filter(x=>x.split.length||x.n1>x.n0||!x.in||!x.right||!x.low);
  chk(tag+`Next goals (${r.w} px${r.forced?', unfolded for the test':''}): ${Q.map(x=>'"'+x.t+'" '+x.n1+' line'+(x.n1>1?'s':'')+' + "'+x.tag+'"').join(', ')}: no word split, the tag costs the text no line, right aligned inside the row`,
    Q.length>=2&&Q.some(x=>/hunted/.test(x.tag))&&Q.some(x=>/gathered/.test(x.tag))&&!bad.length&&!r.over||JSON.stringify(r));
  // ---- always on screen, the player's fold, the Show goals setting ----
  const S=()=>{const e=document.getElementById('glp');if(!e)return {none:1};const b=e.getBoundingClientRect(),v=document.querySelector('.wview').getBoundingClientRect(),hd=e.querySelector('.glhead'),hb=hd&&hd.getBoundingClientRect();
    return {shown:e.style.display!=='none'&&b.width>0&&b.height>0,in:b.left>=v.left-1&&b.right<=v.right+1&&b.top>=v.top-1&&b.bottom<=v.bottom+1,chip:e.classList.contains('chip'),full:e.classList.contains('full'),over:e.classList.contains('q16over'),
      rows:e.querySelectorAll('.gll li').length,head:hd?hd.innerText.replace(/\s+/g,' ').trim():'',hw:hb?Math.round(hb.width):0,hh:hb?Math.round(hb.height):0,exp:hd&&hd.getAttribute('aria-expanded')};};
  const spots=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),out=[];G.cleared[0]=true;G.stage=1;G.been=G.been||{};
    const see=(tag)=>{A.V.modal=null;A.render();__GL.glRender();const e=document.getElementById('glp');out.push({tag,shown:!!e&&e.style.display!=='none'&&e.offsetWidth>0,mode:e?e.className:'',banner:!!document.querySelector('#wloc.on'),hd:document.querySelector('.wview').classList.contains('hd')});};
    for(const id of ['t0','f0','d0','t1','f1']){let m;try{m=g('getMap')(id);}catch(e){continue;}if(!m)continue;const W=m.w||(m.t&&m.t[0].length)||20,Hh=m.h||(m.t&&m.t.length)||20;
      for(const [x,y,n] of [[Math.floor(W/2),Math.floor(Hh/2),'middle'],[W-2,1,'top right'],[1,Hh-2,'bottom left'],[W-2,Hh-2,'bottom right']]){try{g('placeAt')(id,x,y,'d');}catch(e){out.push({tag:id+' '+n,err:e.message});continue;}see(id+' '+n);}}
    // while someone talks
    g('WS').dlg={name:'Test',text:'A line of talk.'};A.render();__GL.glRender();{const e=document.getElementById('glp');out.push({tag:'dialogue',shown:!!e&&e.style.display!=='none'&&e.offsetWidth>0,mode:e.className});}g('WS').dlg=null;A.render();
    return out;});
  const hid=spots.filter(x=>!x.shown);
  chk(tag+`the panel is on screen at ${spots.length} places (towns, fields, a dungeon, map corners, while the area banner shows (${ban.banner&&ban.shown}), in a dialogue; HD-2D ${spots.filter(x=>x.hd).length}x), never folded by itself`,
    spots.length>=13&&!hid.length&&ban.banner&&ban.shown&&/\bfull\b/.test(ban.mode)&&spots.every(x=>/\bfull\b/.test(x.mode))&&(!gfx||spots.some(x=>x.hd))||JSON.stringify(hid.length?hid:spots.filter(x=>!/\bfull\b/.test(x.mode)).concat([{hd:spots.filter(x=>x.hd).length,ban}])));
  // the hero walks under the panel: it stays open and fully opaque (the owner: "we want it to stay open even when walking close")
  const under=await ev(async()=>{const A=__A,g=A.TW.get,out={n:0,bad:[],near:0};const fr=()=>new Promise(q=>requestAnimationFrame(()=>requestAnimationFrame(q)));
    for(const id of ['f0','t0']){const m=g('getMap')(id),W=m.w||m.t[0].length;
      for(let x=W-1;x>=W-6;x--)for(let y=0;y<=7;y+=(y<3?1:2)){try{g('placeAt')(id,x,y,'d');}catch(e){continue;}A.V.modal=null;A.render();await fr();__GL.glRender();
        const e=document.getElementById('glp'),h=__GL.glHero();if(!e||!h)continue;const b=e.getBoundingClientRect(),hit=h.l<b.right&&h.r>b.left&&h.t<b.bottom&&h.b>b.top;
        const near=h.l<b.right+40&&h.r>b.left-40&&h.t<b.bottom+40&&h.b>b.top-40;if(!near)continue;out.near++;if(hit)out.n++;
        const cs=getComputedStyle(e),ok=e.style.display!=='none'&&b.width>0&&e.classList.contains('full')&&e.querySelectorAll('.gll li').length>=2&&cs.opacity==='1'&&cs.visibility==='visible';
        if(!ok)out.bad.push({id,x,y,hit,cls:e.className,disp:e.style.display,op:cs.opacity});}}
    return out;});
  chk(tag+`the hero walks close to and under the panel (${under.near} places near it, ${under.n} with the hero under it): it stays open, with its goals, fully opaque`,under.n>=1&&under.near>under.n&&!under.bad.length||JSON.stringify(under).slice(0,600));
  await ev(()=>{const A=__A;A.TW.get('placeAt')('t0',5,5,'d');A.V.modal=null;A.render();__GL.glRender();});await wait(200);
  const a0=await ev(S);if(mob)await H.page.tap('#glp .glhead');else await H.page.click('#glp .glhead');await wait(450);
  const a1=await ev(S);const meta1=await ev(()=>JSON.parse(localStorage.getItem('aurelis-meta-v1')).cfg.goalsMin);
  await ev(()=>{const A=__A;A.TW.get('placeAt')('f0',6,6,'d');A.V.modal=null;A.render();__GL.glRender();});await wait(450);const a2=await ev(S);
  if(mob)await H.page.tap('#glp .glhead');else await H.page.click('#glp .glhead');await wait(450);const a3=await ev(S);const meta3=await ev(()=>JSON.parse(localStorage.getItem('aurelis-meta-v1')).cfg.goalsMin);
  chk(tag+`the arrow folds it to the "Next goals" bar (${a1.hw}x${a1.hh} px tap target${mob?', at least 44':''}) and opens it again; the choice is saved and holds on the next map`,
    a0.shown&&a0.full&&a0.rows>=2&&a0.exp==='true'&&a1.shown&&a1.in&&a1.chip&&a1.rows===0&&/^Next goals/.test(a1.head)&&a1.exp==='false'&&meta1===true&&a2.shown&&a2.chip&&a3.shown&&a3.full&&a3.rows>=2&&meta3===false
    &&(!mob||(a0.hh>=44&&a0.hw>=44&&a1.hh>=44&&a1.hw>=44))||JSON.stringify({a0,a1,a2,a3,meta1,meta3}));
  // the setting
  await ev(()=>{const A=__A;A.V.modal={type:'settings'};A.render();});
  const row=await ev(()=>{const b=document.querySelector(`#modal [data-act="cfg"][data-arg='["goals",false]']`);if(!b)return null;return {txt:b.closest('.row').innerText.replace(/\s+/g,' ').slice(0,40),on:document.querySelector(`#modal [data-act="cfg"][data-arg='["goals",true]']`).classList.contains('on')};});
  if(row)await ev(()=>{document.querySelector(`#modal [data-act="cfg"][data-arg='["goals",false]']`).click();});await wait(150);
  const off=await ev(()=>{const A=__A;const o={cfg:A.META.cfg.goals,saved:JSON.parse(localStorage.getItem('aurelis-meta-v1')).cfg.goals,btn:!!document.querySelector(`#modal [data-act="cfg"][data-arg='["goals",false]'].on`)};A.V.modal=null;A.render();__GL.glRender();return o;});
  await wait(450);const s0=await ev(S);
  await ev(()=>{const A=__A;A.TW.get('placeAt')('t0',5,5,'d');A.render();__GL.glRender();A.ACT.cfg('["goals",true]');A.V.modal=null;A.render();__GL.glRender();});await wait(450);const s1=await ev(S);
  chk(tag+`Settings has "Show goals" (default on): Off hides the panel completely and is saved, On brings it back`,row&&/^Show goals/.test(row.txt)&&row.on&&off.cfg===false&&off.saved===false&&off.btn&&!s0.shown&&s1.shown&&s1.full||JSON.stringify({row,off,s0,s1}));
  if(w===1366){// nothing left to do: the panel says so instead of going away
    r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G');G.won=true;G.quests.forEach(q=>{if(q.state==='active')q.state='claimed';});const st=G.goals;__GL.GOALS.forEach(x=>{st.d[x.id]=1;});st.a=[];A.V.modal=null;A.render();__GL.glRender();
      const e=document.getElementById('glp');return {shown:e.style.display!=='none'&&e.offsetWidth>0,txt:e.innerText.replace(/\s+/g,' '),act:!!e.querySelector('li[data-act]')};});
    chk(tag+`with no goal left the panel stays and says so ("${r.txt}")`,r.shown&&/No goals just now/.test(r.txt)&&!r.act||JSON.stringify(r));}
  if(w===1366){await done(H);}else await H.browser.close();}
})();
async function done2(H){await H.browser.close();}
