// Beta v0.9.5 menus, item 1: one Notice Board. The Quest Board, guild missions, bounties and the arena are tabs (Quests, Guilds,
// Bounties, Arena) of one set, drawn in Menu > Quests. Since v0.10.6 the town Notice Board building holds Quests and Bounties and the
// Guild Hall holds Guilds, Arena, Recruits and Natures (it opens on Guilds). Each tab has All and Ready / Active / Open (Done where it applies), claimable first. Old ids still land, Accept all and
// Claim all still work, back steps one level.
// Usage: PWHTML=../../out/aurelis3.html node v095m1.js
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off'}}));`});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=5000;A.G.stage=1;A.G.cleared[0]=1;A.G.pcV=0;/* a journey from before the v0.9.6 realm unlocks: guild missions open after the first Scourge */A.render();});
const nav=()=>ev(()=>({tabs:[...document.querySelectorAll('#modal .stabs .chip')].map(x=>x.textContent.trim()),secs:[...document.querySelectorAll('#modal .ssec .chip,#modal .nbsec .chip')].map(x=>x.textContent.replace(/\s*\d+$/,'').trim()),
  on:[...document.querySelectorAll('#modal .stabs .chip.on,#modal .ssec .chip.on,#modal .nbsec .chip.on')].map(x=>x.textContent.replace(/\s*\d+$/,'').trim()),
  sub:[...document.querySelectorAll('#modal .msub .chip')].map(x=>x.textContent.replace(/\s*\d+$/,'').trim()),title:(document.querySelector('#modal h2')||{}).textContent||''}));
const show=m=>ev(m=>{__A.V.modal=m;__A.render();},m);
// v0.10.6 split: the town board has quests and bounties, the Guild Hall has guilds and the arena
const SEC={quests:['All','Ready','Active','Open','Done','Personal'],guilds:['All','Ready','Active','Open'],bounties:['All','Active','Open','Done'],arena:[]};
// ---- the board building in town
await show({type:'board'});let n=await nav();
chk('town board: Notice Board with tabs Quests, Bounties',/Notice Board/.test(n.title)&&JSON.stringify(n.tabs)===JSON.stringify(['Quests','Bounties'])||JSON.stringify(n));
chk('town board opens on Quests > All',n.on.join()==='Quests,All'||JSON.stringify(n.on));
for(const t of ['quests','bounties']){await ev(t=>__A.ACT.sTab(t),t);n=await nav();chk(`board ${t}: sections ${SEC[t].join(', ')||'none'}`,JSON.stringify(n.secs)===JSON.stringify(SEC[t])||JSON.stringify(n.secs));}
// ---- the Guild Hall
await ev(()=>{__A.V.modal=null;__A.TW.get('openService')('guild');});n=await nav();
chk('Guild Hall opens on its Guilds tab (Guilds, Arena, Recruits, Natures)',n.on[0]==='Guilds'&&JSON.stringify(n.tabs)===JSON.stringify(['Guilds','Arena','Recruits','Natures'])||JSON.stringify(n));
for(const t of ['guilds','arena']){await ev(t=>__A.ACT.sTab(t),t);n=await nav();chk(`Guild Hall ${t}: sections ${SEC[t].join(', ')||'none'}`,JSON.stringify(n.secs)===JSON.stringify(SEC[t])||JSON.stringify(n.secs));}
await ev(()=>__A.ACT.sTab('guilds'));
chk('Guild Hall Guilds tab: missions and ranks',await ev(()=>/Ranks and perks/.test(document.querySelector('#modal').innerText)&&!!document.querySelector('#modal .facc')&&!!document.querySelector('#modal [data-act="facAccept"],#modal [data-act="facClaim"]')));
// ---- Menu > Quests
await ev(()=>{__A.V.modal=null;__A.ACT.menu();__A.ACT.menuGrp('quests');});n=await nav();
chk('Menu > Quests (v0.12.6, board then hall): Quests, Bounties, Guilds, Arena',JSON.stringify(n.sub)===JSON.stringify(['Quests','Bounties','Guilds','Arena'])||JSON.stringify(n.sub));
chk('Menu > Quests shows the board (sections and Accept all)',JSON.stringify(n.secs)===JSON.stringify(SEC.quests)&&await ev(()=>!!document.querySelector('#modal [data-act="qAcceptAll"]'))||JSON.stringify(n));
chk('Records no longer holds Guilds (it is on the board)',await ev(()=>!__M3.MENU_GROUPS.find(g=>g[0]==='records')[2].includes('factions')));
// ---- old ids
const leg=await ev(()=>{const A=__A,o={};const t=m=>{A.V.modal=m;A.render();const M=A.V.modal;return M.type+':'+M.tab+'/'+(M.sec||'all');};
  o.p=t({type:'board',tab:'personal'});o.b=t({type:'board',tab:'bounties'});o.a=t({type:'guild',tab:'arena'});o.g=t({type:'guild',tab:'guilds'});o.q=t({type:'board',tab:'quests'});o.party=t({type:'guild',tab:'party'});o.rec=t({type:'guild',tab:'recruit'});
  o.br=t({type:'board',sec:'ready'});o.bo=t({type:'board'});
  o.fm=t({type:'menu',tab:'fmis'});o.fmBtn=!!document.querySelector('#modal [data-act="facAcceptAll"],#modal [data-act="facClaimAll"]');
  A.ACT.menuTab('fmis');o.fmAct=A.V.modal.tab;A.ACT.gtab('guilds');o.gtab=A.V.modal.type+':'+A.V.modal.tab+':'+(document.querySelector('#modal .stabs .chip.on')||{}).textContent;
  A.V.modal={type:'smithy'};A.render();const s=document.querySelector('#modal .facrank [data-act="menuTab"]');o.strip=s&&s.dataset.arg;if(s)s.click();o.stripTo=A.V.modal.type+':'+A.V.modal.tab;
  A.V.modal={type:'board',tab:'personal'};A.render();o.pNote=/third realm|personal quest/i.test(document.querySelector('#modal').innerText);return o;});
console.log(JSON.stringify(leg));
chk('board personal lands on Quests > Personal',leg.p==='board:quests/personal'&&leg.pNote||JSON.stringify(leg));
chk('board bounties and quests, guild arena and guilds land on those tabs',leg.b==='board:bounties/all'&&leg.a==='guild:arena/all'&&leg.g==='guild:guilds/all'&&leg.q==='board:quests/all'||JSON.stringify(leg));
chk('guild party and recruit land on Recruits',leg.party==='guild:recruit/all'&&leg.rec==='guild:recruit/all'||JSON.stringify(leg));
chk('board with a section keeps it (old Quest Board ids)',leg.br==='board:quests/ready'&&leg.bo==='board:quests/all'||JSON.stringify(leg));
chk('menu fmis lands on Quests > Guilds with the missions bar',leg.fm==='menu:factions/all'&&leg.fmBtn&&leg.fmAct==='factions'||JSON.stringify(leg));
chk('gtab guilds and the shop rank strip still work',leg.gtab==='guild:guilds:Guilds'&&leg.strip==='factions'&&leg.stripTo==='menu:factions'||JSON.stringify(leg));
// ---- Accept all and Claim all, claimable first
const all=await ev(()=>{const A=__A,G=A.G,o={};
  A.V.modal={type:'board'};A.render();o.acc=!!document.querySelector('#modal [data-act="qAcceptAll"]');A.ACT.qAcceptAll();o.allAct=G.quests.filter(q=>q.stage<=G.stage).every(q=>q.state!=='open');
  const hq=G.quests.find(q=>q.type==='hunt'&&q.state==='active');if(hq)hq.have=hq.n;A.render();
  const rows=[...document.querySelectorAll('#modal .rows .row')].map(r=>r.querySelector('[data-act="qClaim"]')?'ready':/Active/.test(r.innerText)?'active':'other');o.order=rows.join(',');
  o.firstReady=rows[0]==='ready';o.claimBtn=!!document.querySelector('#modal [data-act="qClaimAll"]');const g0=G.gold;A.ACT.qClaimAll();o.claimed=G.gold>g0;
  A.ACT.sTab('bounties');o.bAcc=!!document.querySelector('#modal [data-act="bountyAll"]');A.ACT.bountyAll();o.bAll=G.bounties.filter(b=>b.stage<=G.stage).every(b=>b.state!=='open');
  A.V.modal={type:'guild',tab:'guilds'};A.render();o.fAcc=!!document.querySelector('#modal [data-act="facAcceptAll"]');const L0=A.FAC.flatMap(F=>A.facMissionList(F.id));A.ACT.facAcceptAll();const f=A.facInit();
  const L=L0.filter(m=>f.acc[m.id]!=null);o.misAcc=L0.length>0&&L.length===L0.length;// every posted mission is taken (new ones may be posted after)
  const m=L[L.length-1];f.ctr[m.k]=(f.ctr[m.k]||0)+m.n+5;A.render();
  const mr=[...document.querySelectorAll('#modal .row.facm')];o.misFirst=!!(mr[0]&&mr[0].querySelector('[data-act="facClaim"]'));
  o.fClaimBtn=!!document.querySelector('#modal [data-act="facClaimAll"]');const b0=A.facRep(m.f);A.ACT.facClaimAll();o.fClaimed=!!f.done[m.id]&&A.facRep(m.f)>b0;
  A.ACT.sSec('ready');o.readyEmpty=document.querySelectorAll('#modal .row.facm').length===0;A.ACT.sSec('active');o.activeRows=document.querySelectorAll('#modal .row.facm').length;
  return o;});
console.log(JSON.stringify(all));
chk('Quests: Accept all and Claim all',all.acc&&all.allAct&&all.claimBtn&&all.claimed||JSON.stringify(all));
chk('Quests: ready to claim first',all.firstReady||all.order);
chk('Bounties: Accept all',all.bAcc&&all.bAll||JSON.stringify(all));
chk('Guilds: Accept all, Claim all, claimable mission first',all.fAcc&&all.misAcc&&all.fClaimBtn&&all.fClaimed&&all.misFirst||JSON.stringify(all));
chk('Guilds: Ready and Active sections filter',all.readyEmpty&&all.activeRows>0||JSON.stringify(all));
// ---- back one level at a time
const bk=await ev(()=>{const A=__A,o=[],st=()=>A.V.modal?A.V.modal.type+':'+A.V.modal.tab+'/'+A.V.modal.sec:'closed';
  A.V.modal={type:'board'};A.render();A.ACT.sTab('bounties');A.ACT.sSec('active');o.push(st());for(let i=0;i<3;i++){A.ACT.xBack();o.push(st());}
  A.V.modal=null;A.TW.get('openService')('guild');A.ACT.gtab('recruit');o.push(st());A.ACT.xBack();o.push(st());A.ACT.xBack();o.push(st());return o;});
chk('back: section, tab, then leave (board and Guild Hall)',JSON.stringify(bk)===JSON.stringify(['board:bounties/active','board:bounties/all','board:quests/all','closed','guild:recruit/all','guild:guilds/all','closed'])||JSON.stringify(bk));
// ---- arena: Enter only in town from the menu
const ar=await ev(()=>{const A=__A,o={};A.V.modal={type:'menu',tab:'qarena'};A.render();o.townOn=document.querySelectorAll('#modal [data-act="arena"]').length===0&&/Enter from the Guild Hall/.test(document.querySelector('#modal').innerText);/* v0.13.4: the Menu's Arena tab never enters; the Guild Hall does */A.V.modal={type:'guild',tab:'arena'};A.render();o.hallOn=[...document.querySelectorAll('#modal [data-act="arena"]')].some(b=>!b.disabled);A.V.modal={type:'menu',tab:'qarena'};A.render();
  const m=A.WS.m,k=m.kind;m.kind='field';A.render();o.fieldOff=document.querySelectorAll('#modal [data-act="arena"]').length===0;m.kind=k;
  A.V.modal={type:'guild',tab:'arena'};A.render();o.board=document.querySelectorAll('#modal [data-act="arena"]').length>0;A.V.modal=null;A.render();return o;});
chk('Arena: the Menu tab only reads (town or field), the Guild Hall enters (v0.13.4)',ar.townOn&&ar.hallOn&&ar.fieldOff&&ar.board||JSON.stringify(ar));
// ---- quests ready count on the menu and its tabs
const qc=await ev(()=>{const A=__A,G=A.G;const q=G.quests.find(q=>q.stage<=G.stage&&q.type==='hunt'&&q.state!=='claimed')||G.quests.find(q=>q.type==='hunt');q.state='active';q.have=q.n;q.stage=Math.min(q.stage,G.stage);
  A.V.modal=null;A.ACT.menu();A.ACT.menuGrp('quests');const sub=[...document.querySelectorAll('#modal .msub .chip')].map(x=>x.textContent.trim());return {sub,grp:(document.querySelector('#modal .mgrp .chip.on')||{}).textContent};});
chk('the Quests tab carries its ready count',/Quests\s*1/.test(qc.sub[0])&&/ready/.test(qc.grp)||JSON.stringify(qc));
await done(H);})();
