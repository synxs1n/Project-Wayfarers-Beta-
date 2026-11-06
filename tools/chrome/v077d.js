// Beta v0.7.7: every wayfarer who challenges the party has their own lines (v3/duellines.js). Checks: every hero id has lines (or a
// distinct fallback), no two heroes share an opening line, each context (road duel open, decline, half health shout, win, loss, flee,
// bond reply, personal rival before and after, Kaevan's ride, Guild Hall board and join) shows that hero's own line in the real
// dialogue, nothing is clipped at 390x844 and 933x705, and no page errors.
const {open,chk,done}=require('./pw');
const SIZES=[[390,844,true],[933,705,false]];
(async()=>{let H;
for(const [w,h,mob] of SIZES){
H=await open({w,h,mobile:mob});const {ev,wait,page}=H;const tag=` (${w}x${h})`;
await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.hints=false;});
await wait(400);
// a helper in the page: is anything in the open modal clipped?
await ev(()=>{window.__clip=()=>{const bad=[];const W=innerWidth,Hh=innerHeight;const pan=document.querySelector('#modal .panel');if(!pan)return ['no panel'];
  const pr=pan.getBoundingClientRect();if(pr.left<-1||pr.right>W+1)bad.push('panel x '+Math.round(pr.left)+'..'+Math.round(pr.right));
  const scrolls=/(auto|scroll)/.test(getComputedStyle(pan).overflowY)||[...pan.querySelectorAll('*')].some(e=>/(auto|scroll)/.test(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight);
  if(!scrolls&&(pr.top<-1||pr.bottom>Hh+1))bad.push('panel y '+Math.round(pr.top)+'..'+Math.round(pr.bottom));
  pan.querySelectorAll('p,.dl-say,.dl-rep,.rs-join span,small').forEach(e=>{if(e.scrollWidth>e.clientWidth+1)bad.push('wide: '+e.textContent.slice(0,40));const r=e.getBoundingClientRect();if(r.width&&(r.left<pr.left-1||r.right>pr.right+1))bad.push('outside: '+e.textContent.slice(0,40));});
  return bad;};
  window.__toastOk=()=>{const t=document.getElementById('toast');if(!t)return 'no toast';const r=t.getBoundingClientRect();if(r.left<-1||r.right>innerWidth+1)return 'toast x';if(t.scrollWidth>t.clientWidth+1||t.scrollHeight>t.clientHeight+1)return 'toast clipped';return true;};});
if(w===390){
  // ----- data -----
  const d=await ev(()=>{const A=__A,DL=window.__DL,ids=A.RAW.map(r=>r[0]),K=['o','m','w','l','f','d','r','rw'];
    const missing=[];ids.forEach(id=>K.forEach(k=>{const v=DL.LINES[id]&&DL.LINES[id][k];if(!v)missing.push(id+'.'+k);}));
    const opens=ids.map(id=>DL.line(id,'o'));const dupOpen=opens.filter((o,i)=>opens.indexOf(o)!==i);
    const fb=ids.map(id=>DL.fallback(id,'o'));const dupFb=fb.filter((o,i)=>fb.indexOf(o)!==i),fbClash=fb.filter(o=>opens.includes(o));
    const allK=K.map(k=>ids.map(id=>DL.line(id,k))),dupAny=allK.map((L,j)=>K[j]+':'+L.filter((o,i)=>L.indexOf(o)!==i).length).filter(s=>!/:0$/.test(s));
    const hy=ids.flatMap(id=>K.map(k=>DL.line(id,k))).filter(s=>/[-—–]/.test(s));
    const longM=ids.filter(id=>DL.line(id,'m').length>24);
    // determinism: variants pick from the journey seed, never the game RNG
    DL.LINES.__t={o:['First variant.','Second variant.','Third variant.']};const s0=A.G.run.seed;const p1=DL.line('__t','o'),p2=DL.line('__t','o');A.G.run.seed=s0+1;const p3=[0,1,2,3,4,5].map(i=>{A.G.run.seed=s0+i;return DL.line('__t','o');});A.G.run.seed=s0;delete DL.LINES.__t;
    return {n:ids.length,missing,dupOpen,dupFb,fbClash,dupAny,hy,longM,stable:p1===p2,varies:new Set(p3).size>1};});
  console.log(JSON.stringify({n:d.n,dupAny:d.dupAny}));
  chk('all 92 wayfarers have every line',d.n===92&&d.missing.length===0||d.n+' '+d.missing.slice(0,8).join(','));
  chk('no two heroes share an opening line',d.dupOpen.length===0||d.dupOpen.join(' | '));
  chk('no two heroes share any line of the same kind',d.dupAny.length===0||d.dupAny.join(','));
  chk('the fallback is distinct for every hero',d.dupFb.length===0&&d.fbClash.length===0||JSON.stringify([d.dupFb,d.fbClash]));
  chk('no hyphens or dashes in the lines',d.hy.length===0||d.hy.slice(0,4).join(' | '));
  chk('half health shouts fit the banner (24 letters at most)',d.longM.length===0||d.longM.join(','));
  chk('variants pick by journey seed, stable within a journey',d.stable&&d.varies||JSON.stringify(d));
}
// ----- road duel: every eligible hero, opening and decline -----
const rd=await ev(()=>{const A=__A,DL=window.__DL,out={bad:[],clip:[],toast:[],n:0};const ids=A.RAW.map(r=>r[0]).filter(id=>{const s=A.TPL[id].src;return s!=='L'&&s!=='x';});
  ids.forEach(id=>{A.V.modal=null;A.ceStart(A.WS.m,id,'duel');const m=A.V.modal;const txt=(document.querySelector('#modal .who p')||{}).textContent||'';
    if(!m||m.type!=='cev'||!txt.includes(DL.line(id,'o')))out.bad.push(id+':open');
    const c=window.__clip();if(c.length)out.clip.push(id+':'+c.join(';'));
    A.ACT.cevPick('no');const t=document.getElementById('toast').textContent;if(!t.includes(DL.line(id,'d')))out.bad.push(id+':decline '+t.slice(0,30));
    const tk=window.__toastOk();if(tk!==true)out.toast.push(id+':'+tk);out.n++;});
  return out;});
chk('every road duel opens with that hero\'s own challenge'+tag,rd.n>=88&&rd.bad.filter(s=>/open/.test(s)).length===0||rd.n+' '+rd.bad.slice(0,5).join(','));
chk('declining shows that hero\'s own line'+tag,rd.bad.filter(s=>/decline/.test(s)).length===0||rd.bad.slice(0,5).join(','));
chk('no clipped text in any duel dialogue'+tag,rd.clip.length===0||rd.clip.slice(0,4).join(' | '));
chk('decline toast is not clipped'+tag,rd.toast.length===0||rd.toast.slice(0,4).join(' | '));
// ----- bond reply -----
const br=await ev(()=>{const A=__A,DL=window.__DL;A.G.roster.gilda=A.newChar('gilda',1,0);if(!A.G.party.includes('gilda'))A.G.party.push('gilda');
  A.V.modal=null;A.ceStart(A.WS.m,'brann','duel');const r=document.querySelector('#modal .dl-rep');const o={rep:r&&r.textContent,want:DL.REPLY['brann>gilda'],clip:window.__clip()};A.ACT.cevPick('no');
  A.G.party=A.G.party.filter(x=>x!=='gilda');delete A.G.roster.gilda;return o;});
chk('a bond partner in the party answers the challenger'+tag,!!br.rep&&br.rep.includes('Gilda')&&br.rep.includes(br.want)||JSON.stringify(br));
chk('the reply is not clipped'+tag,br.clip.length===0||br.clip.join(';'));
// ----- the fight itself: shout, win, loss, flee (a few heroes, one of each class) -----
const FIGHT=w===390?['brann','sable','taro','gilda','tess','kael','halden','pomona']:['kessa','prisma','vex','glint'];
for(const id of FIGHT){
  await ev(id=>{const A=__A;A.G.party.forEach(i=>{const c=A.G.roster[i];if(c&&c.S){c.hp=c.S.mhp;c.mp=c.S.mmp;}});A.V.modal=null;A.ceStart(A.WS.m,id,'duel');A.ACT.cevPick('fight');},id);await wait(500);
  const f=await ev(id=>{const A=__A,DL=window.__DL,o={};o.inBattle=!!A.B&&A.B.spec.kind==='duel';o.say=A.B&&A.B.en[0].phase&&A.B.en[0].phase.say;o.wantM=DL.line(id,'m');
    A.B.en.forEach(e=>e.hp=0);A.win();A.render();const j=document.querySelector('#modal .rs-join span');o.win=j&&j.textContent;o.wantW=DL.line(id,'w');o.lab=(document.querySelector('#modal .rs-join b')||{}).textContent;o.clip=window.__clip();
    A.ACT.resultOk&&A.ACT.resultOk();if(A.V.modal&&A.V.modal.type==='result'&&A.ACT.resultLeave)A.ACT.resultLeave();return o;},id);await wait(300);
  chk(`${id}: shouts their own line at half health`+tag,f.inBattle&&!!f.say&&f.say.includes(f.wantM)||JSON.stringify(f));
  chk(`${id}: concedes with their own line on the rewards screen`+tag,!!f.win&&f.win.includes(f.wantW)&&f.lab==='Duel won'||JSON.stringify(f));
  chk(`${id}: rewards screen not clipped`+tag,f.clip.length===0||f.clip.join(';'));
  // loss
  await ev(id=>{const A=__A;A.V.modal=null;if(A.G.roster[id]){delete A.G.roster[id];A.G.party=A.G.party.filter(x=>x!==id);}A.G.party.forEach(i=>{const c=A.G.roster[i];if(c&&c.S){c.hp=c.S.mhp;c.mp=c.S.mmp;}});A.ceStart(A.WS.m,id,'duel');A.ACT.cevPick('fight');},id);await wait(400);
  const l=await ev(id=>{const A=__A,DL=window.__DL;A.lose();A.render();const s=document.querySelector('#modal .dl-say');const o={say:s&&s.textContent,want:DL.line(id,'l'),clip:window.__clip()};A.ACT.loseOk();return o;},id);await wait(300);
  chk(`${id}: has their own line when the party loses`+tag,!!l.say&&l.say.includes(l.want)||JSON.stringify(l));
  chk(`${id}: loss window not clipped`+tag,l.clip.length===0||l.clip.join(';'));
  // flee
  await ev(id=>{const A=__A;A.V.modal=null;A.G.party.forEach(i=>{const c=A.G.roster[i];if(c&&c.S){c.hp=c.S.mhp;c.mp=c.S.mmp;}});A.ceStart(A.WS.m,id,'duel');A.ACT.cevPick('fight');},id);await wait(400);
  const fl=await ev(id=>{const A=__A,DL=window.__DL;A.TW.get('finishBattle')('fled');const t=document.getElementById('toast').textContent;return {t,want:DL.line(id,'f'),ok:window.__toastOk()};},id);
  chk(`${id}: has their own line when the party runs`+tag,fl.t.includes(fl.want)&&fl.ok===true||JSON.stringify(fl));
}
// the half health banner fits on screen
await ev(()=>{const A=__A;A.V.modal=null;A.G.party.forEach(i=>{const c=A.G.roster[i];if(c&&c.S){c.hp=c.S.mhp;c.mp=c.S.mmp;}});A.ceStart(A.WS.m,'skerry','duel');A.ACT.cevPick('fight');});await wait(500);
const bn=await ev(()=>{const A=__A,e=A.B.en[0];A.TW.get('banner')(e.phase.say,'#ff9a6a');A.render();const s=document.querySelector('#bban span');if(!s)return {none:1};const r=s.getBoundingClientRect();return {txt:s.textContent,l:r.left,r:r.right,W:innerWidth,sw:s.scrollWidth,cw:s.clientWidth};});
chk('the half health shout fits the battle banner'+tag,bn.none||(bn.l>=-1&&bn.r<=bn.W+1&&bn.sw<=bn.cw+1)||JSON.stringify(bn));
await ev(()=>{const A=__A;A.TW.get('finishBattle')('fled');A.V.modal=null;});
// ----- personal quest rival: before and after -----
const PR=w===390?['brann','mira','oren']:['lumen'];
for(const id of PR){
  const pr=await ev(id=>{const A=__A,DL=window.__DL,G=A.G,o={};if(!G.roster[id])G.roster[id]=A.newChar(id,8,0);if(!G.party.includes(id)){if(G.party.length>=6)G.party.pop();G.party.push(id);}
    const Z=A.ZS(0),mon=Z.pool[0];const q={id:'p_'+id,personal:id,stage:0,mon,mod:A.TW.get('ELITE_MODS')[0].k,name:A.MON[mon].n+' the Test',lv:5,state:'active',text:'A personal test quest.',reward:{}};G.personal[id]=q;
    A.V.modal={type:'elite',b:q};A.render();const s=document.querySelector('#modal .dl-say');o.before=s&&s.textContent;o.wantR=DL.line(id,'r');o.clip1=window.__clip();
    A.V.modal=null;A.G.party.forEach(i=>{const c=A.G.roster[i];if(c&&c.S){c.hp=c.S.mhp;c.mp=c.S.mmp;}});A.startBattle({stage:0,kind:'elite',bounty:q,weather:'clear'});return o;},id);
  await wait(500);
  const pw2=await ev(id=>{const A=__A,DL=window.__DL;A.B.en.forEach(e=>e.hp=0);A.win();A.render();const rows=[...document.querySelectorAll('#modal .rs-join')].map(e=>e.textContent).join(' / ');
    const o={rows,want:DL.line(id,'rw'),clip:window.__clip()};A.ACT.resultOk&&A.ACT.resultOk();if(A.V.modal&&A.V.modal.type==='result'&&A.ACT.resultLeave)A.ACT.resultLeave();A.V.modal=null;return o;},id);
  chk(`${id}: speaks to their own rival before the fight`+tag,!!pr.before&&pr.before.includes(pr.wantR)||JSON.stringify(pr));
  chk(`${id}: rival window not clipped`+tag,pr.clip1.length===0||pr.clip1.join(';'));
  chk(`${id}: has their own line after the rival falls`+tag,pw2.rows.includes(pw2.want)||JSON.stringify(pw2));
  chk(`${id}: rival rewards not clipped`+tag,pw2.clip.length===0||pw2.clip.join(';'));
}
// ----- Kaevan's ride (legend): open, loss, flee, join -----
const kv=await ev(()=>{const A=__A,DL=window.__DL,G=A.G,o={};const q={id:'Lkaevan',stage:0,type:'legend',hero:'kaevan',state:'active',step:0,title:'The Dusk Rider',desc:'x',reward:{gold:0}};G.quests.push(q);
  A.TW.get('legendTalk')({type:'legend',q});const p=document.querySelector('#modal .story');o.open=p&&p.textContent;o.wantO=DL.line('kaevan','o');o.clip=window.__clip();
  A.G.party.forEach(i=>{const c=A.G.roster[i];if(c&&c.S){c.hp=c.S.mhp;c.mp=c.S.mmp;}});A.ACT.legendFight();return o;});
await wait(500);
const kv2=await ev(()=>{const A=__A,DL=window.__DL,o={};A.lose();A.render();const s=document.querySelector('#modal .dl-say');o.lose=s&&s.textContent;o.wantL=DL.line('kaevan','l');o.clip=window.__clip();A.ACT.loseOk();
  const q=A.G.quests.find(x=>x.hero==='kaevan');A.TW.get('legendTalk')({type:'legend',q});A.G.party.forEach(i=>{const c=A.G.roster[i];if(c&&c.S){c.hp=c.S.mhp;c.mp=c.S.mmp;}});A.ACT.legendFight();return o;});
await wait(400);
const kv3=await ev(()=>{const A=__A,DL=window.__DL,o={};A.TW.get('finishBattle')('fled');o.flee=document.getElementById('toast').textContent;o.wantF=DL.line('kaevan','f');
  const info={quests:[]};A.TW.get('legendJoin')('kaevan',info);o.join=info.legend;o.wantW=DL.line('kaevan','w');return o;});
chk('Kaevan opens his ride with his own line'+tag,!!kv.open&&kv.open.includes(kv.wantO)&&kv.clip.length===0||JSON.stringify(kv));
chk('Kaevan has his own line when the party loses'+tag,!!kv2.lose&&kv2.lose.includes(kv2.wantL)&&kv2.clip.length===0||JSON.stringify(kv2));
chk('Kaevan has his own line when the party runs, and joins with his own'+tag,kv3.flee.includes(kv3.wantF)&&String(kv3.join).includes(kv3.wantW)||JSON.stringify(kv3));
// ----- Guild Hall board and join -----
const gd=await ev(()=>{const A=__A,DL=window.__DL,G=A.G,o={};G.stage=3;G.chall={};const ct=A.TW.get('challText'),of=A.TW.get('challOf');
  o.board=['cass','alder','hollis'].map(h=>ct(of(h),{state:'open'}).split('|')[1].includes(DL.GUILD[h].g));
  A.V.modal={type:'guild',tab:'recruit'};try{A.ACT.openGuild&&A.ACT.openGuild();}catch(e){}A.render();
  const L=A.TW.get('vChallenges')();o.inHtml=Object.keys(DL.GUILD).filter(h=>L.includes(DL.GUILD[h].g.replace(/'/g,'&#39;'))||L.includes(DL.GUILD[h].g)).length;
  G.chall.cass={state:'active',have:99};if(G.roster.cass){delete G.roster.cass;G.party=G.party.filter(x=>x!=='cass');}A.ACT.chClaim('cass');o.join=document.getElementById('toast').textContent;o.wantJ=DL.GUILD.cass.j;o.tk=window.__toastOk();A.V.modal=null;return o;});
chk('Guild Hall board shows the hero\'s own words'+tag,gd.board.every(Boolean)&&gd.inHtml>=1||JSON.stringify(gd));
chk('a Guild recruit joins with their own line'+tag,gd.join.includes(gd.wantJ)&&gd.tk===true||JSON.stringify(gd));
await H.page.screenshot({path:'/tmp/claude-0/-home-user/7f3a8aaf-4137-5bfc-9142-571046fbd29c/scratchpad/v077d-'+w+'.png'}).catch(()=>{});
if(w===390)await H.browser.close();
}
await done(H);})();
