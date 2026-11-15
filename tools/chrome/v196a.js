// fix18.js: the owner's four notes after 0.22.3 (real mouse and touch events for 1 and 4).
//  1 "Have to click auto twice to start it": a fight that opens with auto locked (a foe type not yet beaten enough) while auto is remembered
//    on; once the lock lifts the button says Start auto and ONE press starts it, one press stops it (also while an action plays), with the
//    mouse at 1000x560 (Medium) and by touch at 390x844 (Low); a second battle the same
//  2 transitions: a battle start and a town to field change are painted within a bound taken from 0.20.9 / 0.21.0 / 0.21.7 (their worst
//    measured case, docs/handoff-v0111.md fix18, x the machine's load); the map change paints the 2D base's second water frame later (not in
//    the change) and that frame is the same picture as one built at once; the cloud sea copied from its layer is the same picture as painted
//    directly; the battle panels measure the same heights as before (b8HAt, b8CmdEst with fix18 off)
//  3 notices: on the Notice Board (Notices, Quests, Guilds, Bounties), the Guild Hall and the Menu every row ends in one control (Accept plain,
//    Claim gold, a greyed Claim with the place under the text, Active, Done); no Hunting / Rival roaming / Accepted / Beaten, no gold Accept;
//    no guild notice on the Quests tab and no row twice in a list; Accept by mouse: the list keeps its order, the row says Active at once and
//    leaves the Open section; the toast names what was accepted (a goal paid by the same press follows it)
//  4 click to walk with the mouse: the world view at 1000x560 in Medium and Low (seen and unseen ground), the full map (seen tiles walk, unseen
//    tiles say so), and the full map on a page zoomed by deskscale under Chromium < 128 (getBoundingClientRect in unzoomed px; emulated);
//    tap to walk at 390x844 by touch
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v196a.js
const {open,chk,done,perfChk}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v196a ran over 400 s');process.exit(1);},400000).unref();
// the bounds: the worst painted time of the three older builds on this container (Medium, 1000x560, realm 1 and a realm 4 heights field), plus 25%
const BOUND={battle:1700,map:1300};
const META=(gfx,extra)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:Object.assign({speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${gfx}',rmotion:false,hints:false,tips:false},${JSON.stringify(extra||{})})}));`;
const start=ev=>ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;
  const G=A.G;G.run.seed=4242;G.run.order=G.run.order.map((v,i)=>i);try{A.resetMaps();A.syncPools();}catch(e){}A.render();});
const toField=ev=>ev(()=>{const A=__A;const m=A.getMap('f0');A.placeAt('f0',...A.mapEntry(m),'d');A.V.modal=null;A.render();});

// leave a won fight for the world (the rewards screen and whatever popups follow it)
async function endFight(H){for(let k=0;k<25;k++){const ok=await H.ev(()=>{const A=__A;try{if(A.V.modal&&A.V.modal.type==='result')A.ACT.resultOk();else if(A.V.modal){A.V.modal=null;A.render();}else if(A.V.screen==='battle'&&A.ACT.resultOk)A.ACT.resultOk();}catch(e){}return A.V.screen==='world'&&!A.B&&!A.V.modal;});if(ok)return true;await H.wait(300);}
  return false;}
// ---------- 1 ----------
async function autoCase(H,tag,mob){const {ev,wait,page}=H;
  const press=async()=>{const p=await ev(()=>{const b=document.querySelector('#bcmd [data-act="auto"]');if(!b)return null;const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,b.textContent];});
    if(!p)return null;if(mob)await page.touchscreen.tap(p[0],p[1]);else await page.mouse.click(p[0],p[1]);await wait(120);return p[2];};
  for(let round=1;round<=2;round++){
    // auto is remembered on; the fight opens locked (its foe types not beaten by hand yet), then the lock lifts
    await ev(()=>{const A=__A;A.V.auto=true;try{A.TW.get('META').cfg.autoOn=true;}catch(e){}A.G.autoOk={};A.WS.dlg=null;A.V.modal=null;A.startBattle({stage:0,kind:'field'});
      A.B.en.forEach(e=>{e.hp=e.mhp=e.S.mhp=99999;});A.render();});
    await H.until(()=>__A.B&&__A.B.mode==='cmd'?1:0,null,{timeout:15000});
    const s0=await ev(()=>({B:!!__A.B.auto,V:!!__A.V.auto,lock:!!document.querySelector('#bcmd [data-act="auto"][aria-disabled="true"]')}));
    await ev(()=>{const A=__A,o=A.TW.get('autoTypeOpen');A.B.en.forEach(e=>o(e.base,'scan'));A.render();});await wait(150);
    const lbl=await ev(()=>(document.querySelector('#bcmd [data-act="auto"]')||{}).textContent||'');
    const t1=await press();const a1=await ev(()=>!!__A.B.auto);await wait(500);const a1b=await ev(()=>!!(__A.B&&__A.B.auto));
    chk(`1 ${tag} battle ${round}: a fight that opened locked (B.auto ${s0.B}, remembered ${s0.V}, locked button ${s0.lock}) shows "${lbl.trim()}" and ONE press starts auto (${a1}, still on ${a1b})`,(!s0.B&&s0.V&&/Start auto/.test(lbl)&&a1&&a1b)||JSON.stringify({s0,lbl,t1,a1,a1b}));
    // one press stops it while an action plays (not waiting for a command)
    await H.until(()=>__A.B&&__A.B.mode!=='cmd'&&!__A.B.over?1:0,null,{timeout:8000});const mode=await ev(()=>__A.B.mode);
    await press();const a2=await ev(()=>!!__A.B.auto);await wait(500);const a2b=await ev(()=>!!(__A.B&&__A.B.auto));
    chk(`1 ${tag} battle ${round}: one press stops auto while an action plays (mode ${mode}): ${!a2&&!a2b}`,(!a2&&!a2b)||JSON.stringify({a2,a2b}));
    // and one press starts it again
    await H.until(()=>__A.B&&__A.B.mode==='cmd'?1:0,null,{timeout:15000});await press();const a3=await ev(()=>!!__A.B.auto);
    chk(`1 ${tag} battle ${round}: one press starts it again on a hero's turn`,a3||'still off');
    // end the fight
    await ev(()=>{const A=__A;A.B.auto=false;A.V.auto=false;A.B.en.forEach(e=>e.hp=0);try{if(!A.B.over)A.TW.get('checkEnd')();}catch(e){}});await H.until(()=>!__A.B||__A.B.over?1:0,null,{timeout:15000});await wait(400);
    await endFight(H);
  }}

// ---------- 2 ----------
const STEP=(kind,arg)=>`new Promise(res=>{const A=__A;const t0=performance.now();const delay=${kind==='battle'?460:230};${kind==='battle'?'A.WS.flash=t0;':'A.WS.fade=t0;'}
  setTimeout(()=>{${kind==='battle'?"A.startBattle({stage:0,kind:'field'});":`const m=A.getMap('${arg}');A.placeAt('${arg}',...A.mapEntry(m),'d');A.render();`}
    const ok=()=>${kind==='battle'?"A.V.screen==='battle'&&!!document.getElementById('bstage')":`A.WS.m&&A.WS.m.id==='${arg}'&&A.V.screen==='world'`};let n=0;
    const f=()=>{if(!ok()&&++n<900)return requestAnimationFrame(f);requestAnimationFrame(()=>requestAnimationFrame(()=>res({ms:Math.round(performance.now()-t0),ok:!!ok(),scr:A.V.screen,mid:A.WS.m&&A.WS.m.id,modal:A.V.modal&&A.V.modal.type})));};requestAnimationFrame(f);},delay);})`;
async function timing(H,tag){const {ev,wait}=H;
  await toField(ev);await wait(1200);
  await ev(()=>{const A=__A;A.placeAt('t0',...A.mapEntry(A.getMap('t0')),'d');A.render();});await wait(1200);
  const T1=await ev(STEP('map','f0')),tm=T1.ms;await wait(800);if(!T1.ok)console.log('  (state at the end: '+JSON.stringify(T1)+')');
  await perfChk(H,`2 ${tag}: town to field painted`,tm,BOUND.map);
  const n=await ev(()=>({b1:window.__F18.F18.n.bake1}));
  // the second water frame: made later, the same picture as one built at once
  const fr=await ev(()=>new Promise(res=>{const A=__A,W=A.WS,lazy=Object.getOwnPropertyDescriptor(W.base,1);const isLazy=!!(lazy&&lazy.get);
    const h=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let a=0,b=0;for(let i=0;i<d.length;i+=4){a=(a+d[i]*3+d[i+1]*5+d[i+2]*7+d[i+3])%2147483647;b=(b*31+d[i]+d[i+1])%1000000007;}return a+':'+b;};
    setTimeout(()=>{try{const got=h(W.base[1]);const F=window.__F18.F18;F.off=1;let ref;try{ref=h(A.TW.get('buildMapCanvas')(W.m,1));}finally{F.off=0;}res({isLazy,same:got===ref});}catch(e){res({err:e.message});}},600);}));
  chk(`2 ${tag}: the map change left the second water frame for later (${n.b1} deferred, lazy ${fr.isLazy}) and it is the same picture`,(n.b1>0&&fr.same)||JSON.stringify({n,fr}));
  const T2=await ev(STEP('battle')),tb=T2.ms;await wait(600);if(!T2.ok)console.log('  (state at the end: '+JSON.stringify(T2)+')');
  await perfChk(H,`2 ${tag}: battle start painted`,tb,BOUND.battle);
  // the battle panels measure the same with and without fix18
  const bh=await ev(()=>{const A=__A,F=window.__F18.F18,g=A.TW.get,ws=[300,360,420,520];const B=A.B;const run=()=>{const o=[];delete B._b8h;delete B._b8ce;ws.forEach(w=>{o.push(g('b8HAt')('cmd',w),g('b8HAt')('foes',w),g('b8HAt')('pty',w),g('b8CmdEst')(w));});return o.join(',');};
    F.off=1;let a;try{a=run();}finally{F.off=0;}const b=run();return {a,b};});
  chk(`2 ${tag}: battle panel heights the same with the batched measuring (${bh.b.split(',').slice(0,4).join(',')}...)`,bh.a===bh.b||JSON.stringify(bh));
  await ev(()=>{const A=__A;A.B.en.forEach(e=>e.hp=0);try{if(!A.B.over)A.TW.get('checkEnd')();}catch(e){}});await H.until(()=>!__A.B||__A.B.over?1:0,null,{timeout:15000});await wait(400);
  await endFight(H);
  return {tm,tb};}
async function cloud(H){const r=await H.ev(()=>{const A=__A,G=A.G,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z&&z.key,i]));const k=G.run.order.indexOf(zi.peaks);
    const sv=G.run.order.slice();G.run.order[1]=zi.peaks;if(k>=0&&k!==1)G.run.order[k]=sv[1];try{A.resetMaps();}catch(e){}const m=A.getMap('f1'),F=window.__F18.F18;
    const h=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let a=0,b=0;for(let i=0;i<d.length;i+=4){a=(a+d[i]*3+d[i+1]*5+d[i+2]*7+d[i+3])%2147483647;b=(b*31+d[i]+d[i+1])%1000000007;}return a+':'+b;};
    const bm=A.TW.get('buildMapCanvas');F.off=1;let ref0,ref1,t0=performance.now();try{ref0=h(bm(m,0));ref1=h(bm(m,1));}finally{F.off=0;}const tOff=performance.now()-t0;
    const a0=h(bm(m,0)),a1=h(bm(m,1));t0=performance.now();const b0=h(bm(m,0)),b1=h(bm(m,1));const tAgain=performance.now()-t0;
    let tiles=0;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(m.t[y][x]==='~')tiles++;
    G.run.order=sv;try{A.resetMaps();}catch(e){}return {same:ref0===a0&&ref1===a1&&a0===b0&&a1===b1,tiles,tOff:Math.round(tOff),tAgain:Math.round(tAgain)};});
  chk(`2 the cloud sea copied from its layer is the same picture as painted directly (${r.tiles} sea tiles; two frames ${r.tOff} ms painted, ${r.tAgain} ms copied)`,(r.same&&r.tiles>50)||JSON.stringify(r));}

// ---------- 3 ----------
async function quests(H){const {ev,wait,page}=H;
  await ev(()=>{const A=__A,G=A.G;G.cleared[0]=true;G.stage=1;G.visited=[0,1];A.placeAt('t1',...A.mapEntry(A.getMap('t1')),'d');A.V.modal=null;A.render();
    // a quest that is ready but belongs to another board, a bounty beaten and waiting at its board, a mission taken
    const q=A.TW.get('m3Quests')().find(x=>x.stage===0&&x.type!=='tamer'&&x.type!=='legend'&&x.type!=='guild'&&x.type!=='arena');if(q){q.state='active';q.hand='board';if(q.type==='hunt')q.have=q.n;if(q.type==='gather')G.mats[q.mat]=q.n;q.found=1;}
    const L=A.TW.get('nbBountyList')();if(L[0]){L[0].state='ready';L[0].hand='board';}
    try{const M=A.TW.get('facMisAll')();if(M[0])A.ACT.facAccept(M[0].id);}catch(e){}A.V.modal=null;A.render();});
  const rows=()=>ev(()=>{const P=[...document.querySelectorAll('#modal .panel')],p=P[P.length-1];if(!p)return [];
    return [...p.querySelectorAll('.rows .row')].filter(r=>r.offsetParent&&!r.closest('.facrk,.fac3')&&(r.querySelector('button[data-act="qAccept"],button[data-act="bounty"],button[data-act="facAccept"],button[data-act="personal"],button[data-act="qClaim"],button[data-act="bountyClaim"],button[data-act="facClaim"],button[disabled]')||/^(Active|Done|Hunting|Rival roaming|Accepted)$/.test(((r.querySelector(':scope>.m')||{}).textContent||'').trim())||/^\d+\/\d+$/.test(((r.querySelector(':scope>.m')||{}).textContent||'').trim())))
      .map(r=>{const b=r.querySelector(':scope>button,:scope>span>button'),m=r.querySelector(':scope>.m'),g=r.querySelector('.grow');return {t:((g&&g.querySelector('b'))||{}).textContent||'',kind:((g&&g.querySelector('.r12kind'))||{}).textContent||'',
        btn:b?{l:b.textContent.trim(),act:b.dataset.act||'',gold:b.classList.contains('gold'),dis:b.disabled}:null,m:m?m.textContent.trim():'',tag:((g&&g.querySelector('.qtag'))||{}).textContent||'',where:!!(g&&g.querySelector('.handwhere')),whereOut:!!r.querySelector(':scope>.handwhere,:scope>span>.handwhere'),html:r.innerHTML.length};});});
  const surf=[['board Notices',{type:'board',tab:'all',sec:'all'}],['board Quests',{type:'board',tab:'quests',sec:'all'}],['board Guilds',{type:'board',tab:'guilds',sec:'all'}],['board Bounties',{type:'board',tab:'bounties',sec:'all'}],
    ['Guild Hall Guilds',{type:'guild',tab:'guilds',sec:'all'}],['menu Notices','nball'],['menu Quests','quests'],['menu Guilds','factions'],['menu Bounties','qbounty']];
  const open_=async m=>{if(typeof m==='string')await ev(t=>{const A=__A;A.V.modal=null;A.ACT.menu();const M=A.V.modal;M.tab=t;M.sec='all';A.render();},m);else await ev(m=>{const A=__A;A.V.modal=JSON.parse(m);A.render();},JSON.stringify(m));await wait(120);};
  const bad=[];let n=0,kinds=new Set();
  for(const [name,m] of surf){await open_(m);const R=await rows();n+=R.length;const seen=new Set();
    R.forEach(r=>{kinds.add(r.btn?r.btn.l+(r.btn.dis?'(greyed)':r.btn.gold?'(gold)':''):r.m);
      if(seen.has(r.kind+r.t))bad.push(name+': twice '+r.t);seen.add(r.kind+r.t);
      if(r.btn&&r.btn.l==='Accept'&&r.btn.gold)bad.push(name+': gold Accept on '+r.t);
      if(r.btn&&r.btn.l==='Claim'&&!r.btn.dis&&!r.btn.gold)bad.push(name+': plain Claim on '+r.t);
      if(r.btn&&r.btn.l==='Claim'&&r.btn.dis&&(r.btn.gold||!r.where))bad.push(name+': greyed Claim without its place under the text on '+r.t);
      if(r.whereOut)bad.push(name+': the place beside the button on '+r.t);
      if(/^(Hunting|Rival roaming|Accepted)$/.test(r.m)||/^\d+\/\d+$/.test(r.m))bad.push(name+': status "'+r.m+'" on '+r.t);
      if(r.tag==='Beaten')bad.push(name+': Beaten on '+r.t);
      if(/Quests$/.test(name)&&/ledger|pit/i.test(r.t))bad.push(name+': guild notice on the Quests tab: '+r.t);});}
  chk(`3 one row language on ${surf.length} lists (${n} rows; controls seen: ${[...kinds].join(', ')})`,(!bad.length&&n>20)||bad.slice(0,8).join(' | '));
  // accept by mouse on the Notices list and on the Bounties tab: nothing moves, the row says Active, it leaves Open at once
  for(const [name,m] of [['board Notices',{type:'board',tab:'all',sec:'all'}],['board Bounties',{type:'board',tab:'bounties',sec:'all'}],['board Guilds',{type:'board',tab:'guilds',sec:'all'}]]){
    await open_(m);const R0=await rows();const i=R0.findIndex((r,j)=>j>0&&r.btn&&r.btn.l==='Accept');if(i<0){chk(`3 ${name}: an open notice to accept`,false);continue;}
    const p=await ev(i=>{const P=[...document.querySelectorAll('#modal .panel')],p=P[P.length-1];const row=[...p.querySelectorAll('.rows .row')].filter(r=>r.offsetParent&&r.querySelector('.grow b')&&r.querySelector('.grow b').textContent===i);
      const b=row[0].querySelector('button');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];},R0[i].t);
    await page.mouse.click(p[0],p[1]);await wait(200);const R1=await rows();const toast=await ev(()=>document.getElementById('toast').textContent);
    const order0=R0.map(r=>r.t).join('|'),order1=R1.map(r=>r.t).join('|'),row=R1[i]||{};
    await ev(()=>{const m=__A.V.modal;m.sec='open';__A.render();});await wait(80);const R2=await rows();const still=R2.some(r=>r.t===R0[i].t);
    chk(`3 ${name}: Accept "${R0[i].t}" by mouse: the list keeps its order (${R1.length} rows), the row now shows ${row.btn?row.btn.l:row.m}, it is gone from Open at once, toast "${toast.slice(0,60)}"`,
      (order0===order1&&row.t===R0[i].t&&!(row.btn&&row.btn.l==='Accept')&&!still&&/accepted|roams|prowls|taken/i.test(toast))||JSON.stringify({order0:order0.slice(0,200),order1:order1.slice(0,200),row,still,toast}));}
  await ev(()=>{__A.V.modal=null;__A.render();});}

// ---------- 4 ----------
async function walk(H,tag,mob){const {ev,wait,page}=H;
  const settle=()=>ev(()=>new Promise(r=>{let n=0;const f=()=>{const W=__A.WS;if((!W.target&&!W.mv&&!W.auto)||++n>600)r(n);else requestAnimationFrame(f);};setTimeout(f,120);}));
  const where=t=>ev(([x,y])=>{const A=__A,c=A.WS.cv.getBoundingClientRect();let sx=0,sy=0,n=0;for(let yy=c.top+6;yy<c.bottom-6;yy+=3)for(let xx=c.left+6;xx<c.right-6;xx+=3){const p=A.mapPoint({clientX:xx,clientY:yy});if(p&&p.tx===x&&p.ty===y){sx+=xx;sy+=yy;n++;}}return n>4?[sx/n,sy/n]:null;},t);
  await toField(ev);await wait(1500);
  // seen and unseen ground in view (the start of a field: the far part is unseen)
  const C=await ev(()=>{const A=__A,m=A.WS.m,o={seen:[],unseen:[]};for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const d=Math.abs(x-A.WS.x)+Math.abs(y-A.WS.y),sn=A.TW.get('isSeen')(m,x,y);if(d<3||d>(sn?7:12)||A.SOLID.includes(A.tileAt(m,x,y)))continue;
    if(A.findPath(m,A.WS.x,A.WS.y,x,y)==null)continue;(A.TW.get('isSeen')(m,x,y)?o.seen:o.unseen).push([x,y]);}return o;});
  let ok=0,tried=0;const bad=[];
  for(const [k,L] of [['seen',C.seen],['unseen',C.unseen]])for(let i=0;i<2&&i<L.length;i++){const t=L[Math.floor((i+.5)*L.length/2)];const p=await where(t);if(!p)continue;tried++;
    const p0=await ev(()=>[__A.WS.x,__A.WS.y]);if(mob)await page.touchscreen.tap(p[0],p[1]);else await page.mouse.click(p[0],p[1]);await wait(60);await settle();const p1=await ev(()=>[__A.WS.x,__A.WS.y]);
    if(Math.abs(p1[0]-t[0])+Math.abs(p1[1]-t[1])<=1)ok++;else bad.push(k+' '+t+' from '+p0+' ended '+p1);}
  chk(`4 ${tag}: ${mob?'tap':'click'} to walk on the world view reaches the tile (${ok}/${tried}; seen ${C.seen.length}, unseen ${C.unseen.length} candidates)`,(tried>=2&&ok===tried)||bad.join(' | '));}
async function fullMap(H,tag){const {ev,wait,page}=H;
  // the full map: a seen tile walks there, an unseen one says so; the positions come from the map canvas's real (zoomed) rect
  await ev(()=>{const A=__A;A.V.modal=null;A.render();});await wait(200);
  const T=await ev(()=>{const A=__A,m=A.WS.m,o={seen:null,unseen:null};for(let r=4;r<16&&!(o.seen&&o.unseen);r++)for(let y=A.WS.y-r;y<=A.WS.y+r;y++)for(let x=A.WS.x-r;x<=A.WS.x+r;x++){if(x<0||y<0||x>=m.w||y>=m.h)continue;
    const s=A.TW.get('isSeen')(m,x,y);if(s&&!o.seen&&!A.SOLID.includes(A.tileAt(m,x,y))&&A.findPath(m,A.WS.x,A.WS.y,x,y)){const P=A.TW.get('awPlan')(m,x,y);if(P.res==='ok')o.seen=[x,y];}if(!s&&!o.unseen&&r>=9){let all=1;for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++)if(A.TW.get('isSeen')(m,x+a,y+b))all=0;if(all)o.unseen=[x,y];}}return o;});
  const res=[];
  for(const k of ['unseen','seen']){const t=T[k];if(!t){res.push(k+': none');continue;}await ev(()=>{const A=__A;A.WS.auto=null;A.ACT.map();});await wait(300);
    const p=await ev(t=>{window.__legacyOff=1;try{const c=document.getElementById('fmap'),m=__A.WS.m,r=c.getBoundingClientRect();return [r.left+(t[0]+.5)/m.w*r.width,r.top+(t[1]+.5)/m.h*r.height];}finally{window.__legacyOff=0;}},t);
    await page.mouse.click(p[0],p[1]);await wait(150);const s=await ev(()=>({modal:__A.V.modal&&__A.V.modal.type,auto:__A.WS.auto&&[__A.WS.auto.tx,__A.WS.auto.ty],note:(document.getElementById('fmnote')||{}).textContent||''}));
    res.push(k+':'+JSON.stringify(s));
    if(k==='seen')chk(`4 ${tag}: the full map, a click on a seen tile closes it and walks to that tile`,(!s.modal&&s.auto&&s.auto[0]===t[0]&&s.auto[1]===t[1])||JSON.stringify({t,s}));
    else chk(`4 ${tag}: the full map, a click on an unseen tile keeps it open and says so ("${s.note}")`,(s.modal==='map'&&/not (seen|been)/i.test(s.note))||JSON.stringify({t,s}));
    await ev(()=>{const A=__A;A.WS.auto=null;A.V.modal=null;A.render();});await settle0(ev);}}
const settle0=ev=>ev(()=>new Promise(r=>setTimeout(r,200)));
const LEG=async page=>{await page.addInitScript(()=>{const o=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(){const r=o.call(this),z=parseFloat(document.documentElement.style.zoom)||1;return !window.__legacyOff&&z!==1?new DOMRect(r.x/z,r.y/z,r.width/z,r.height/z):r;};});};

(async()=>{
  // desktop, Medium, mouse: auto, timing, notices, click to walk, full map
  {const H=await open({w:1000,h:560,pre:META('medium')});await start(H.ev);await H.wait(800);await toField(H.ev);await H.wait(800);
    await autoCase(H,'Medium 1000x560 mouse',false);
    await timing(H,'Medium 1000x560');await cloud(H);
    await walk(H,'Medium 1000x560',false);await fullMap(H,'Medium 1000x560');
    await quests(H);
    await H.browser.close();}
  // phone, Low, touch: auto and tap to walk
  {const H=await open({w:390,h:844,mobile:true,pre:META('low')});await start(H.ev);await H.wait(800);await toField(H.ev);await H.wait(800);
    await autoCase(H,'Low 390x844 touch',true);
    await timing(H,'Low 390x844');
    await walk(H,'Low 390x844',true);
    await H.browser.close();}
  // the Windows app's Chromium (< 128) on a maximised 1920x1080 window: the page is zoomed 1.33 and rects are in unzoomed px (emulated)
  {const H=await open({w:1920,h:1009,pre:META('low'),before:LEG});await start(H.ev);await H.wait(800);
    const z=await H.ev(()=>parseFloat(document.documentElement.style.zoom)||1);chk(`4 1920x1009: the page is zoomed (${z})`,z>1.2||z);
    await walk(H,'Low 1920x1009 zoomed, older Chromium',false);await fullMap(H,'Low 1920x1009 zoomed, older Chromium');
    await H.browser.close();}
  await done({browser:{close:async()=>{}}});
})().catch(e=>{console.log('FAIL exception '+(e&&e.stack||e));process.exit(1);});
