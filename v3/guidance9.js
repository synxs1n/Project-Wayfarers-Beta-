// ===== guidance9.js (v0.11.9): the Guild Hall marker, quest goals with a step by step guide, hint pacing and the Hint log =====
// 1) Guild Hall marker: like the Notice Board's "!", over the Guild Hall door: green when a mission or guild notice can be handed in
//    there, gold when there is something new (an open mission, a recruit who just unlocked, an arena tier that just opened).
// 2) Next goals lists the main quest first (as before) and then the quests closest to you (this realm first, ready ones first); a tap
//    on any goal opens a guide: what to do, in what order, and where to hand in.
// 3) Hints: early on only the core battle tips show (one every 25 s at most, never two in one battle); later tips wait until the
//    journey is under way. Every tip that was shown lands in the Hint log (Settings > Tips > Hint log; sort by time or by type).
// New account field META.tipLog [{id,t}] (cap 80). Nothing here runs in the Daily Trial.
// ----- 1) the Guild Hall marker -----
function guildState(){if(!G||G.daily)return null;try{
  const Q=G.quests||[];if(Q.some(q=>q.state==='active'&&(q.type==='guild'||q.type==='arena')&&questReady(q)))return 'ready';
  if(typeof facMisAll==='function'&&facMisAll().some(m=>facMisState(m)==='ready'))return 'ready';
  if(typeof facMisAll==='function'&&facMisAll().some(m=>facMisState(m)==='open'))return 'new';
  if(Q.some(q=>q.state==='open'&&(q.type==='guild'||q.type==='arena')))return 'new';
  if(typeof challVisible==='function'){const L=challVisible()||[];if(L.some(c=>c&&c.id&&!G.roster[c.id]&&!c.locked))return 'new';}
  if(typeof ARENA!=='undefined'){const cl=(G.cleared||[]).filter(Boolean).length;if(ARENA.some((A,i)=>A.min<=cl&&!(G.arena&&G.arena[i])&&!((G.arenaSeen||{})[i])))return 'new';}}catch(e){}return null;}
// the Guild Hall visited: a freshly opened arena tier stops counting as new
{const mg0=m3Guild;m3Guild=function(m){try{if(G&&m&&m.tab==='arena'){const cl=(G.cleared||[]).filter(Boolean).length;G.arenaSeen=G.arenaSeen||{};ARENA.forEach((A,i)=>{if(A.min<=cl)G.arenaSeen[i]=1;});}}catch(e){}return mg0.apply(this,arguments);};}
function guildDoor(m){try{const b=(m.bld||[]).find(b=>b.k==='guild');return b?[b.door?b.door[0]:b.x+1,b.y+b.h-1]:null;}catch(e){return null;}}
{const td0=townDecorActors;townDecorActors=function(actors,now,cx,cy){const r=td0.apply(this,arguments);try{const m=WS.m,ctx=WS.ctx;if(!m||!ctx||m.kind!=='town'||typeof boardState!=='function'||boardState===null)return r;
  const st=guildState(),d=st&&guildDoor(m);if(!d)return r;const px=d[0]*TS-cx,py=(d[1]-1)*TS-cy;if(px<-40||py<-40||px>WS.vw+40||py>WS.vh+40)return r;
  actors.push({y:(d[1]-1)*TS+.3,deco:'guildmark',draw:()=>{const bob=Math.round(Math.sin(now/220)*2),p=.55+.45*Math.sin(now/180),col=st==='ready'?'#7aff8a':'#ffd04a';
    ctx.fillStyle=`rgba(255,240,160,${.25*p})`;ctx.beginPath();ctx.arc(px+8,py-14+bob,10,0,7);ctx.fill();
    ctx.fillStyle='#150b17';ctx.fillRect(px+5,py-24+bob,7,14);ctx.fillStyle=col;ctx.fillRect(px+6,py-23+bob,5,8);ctx.fillRect(px+6,py-13+bob,5,2);}});}catch(e){}return r;};}
{const ha0=hdActors;hdActors=function(m,now,ts){const r=ha0.apply(this,arguments);try{if(m.kind!=='town')return r;const st=guildState(),d=st&&guildDoor(m);if(!d)return r;
  const V=HD.S.V,still=typeof gfxStill==='function'&&gfxStill(),bob=still?0:Math.round(Math.sin(ts/220)*2),col=st==='ready'?'#7aff8a':'#ffd04a',qx=d[0],qy=d[1]-1;
  hdBill(HD.dynA,'glow',hdGlowS(),qx*TS+8,(30+bob)*V-10,(qy+1)*TS+2,false,.8,255,240,160,110,4);hdBill(HD.dyn,'mk'+col,hdMark(col),qx*TS+8,(30+bob)*V,(qy+1)*TS+2,false,1,255,255,255,255,4);}catch(e){}return r;};}
// ----- 2) quest goals and the guide -----
function qgWhere(q){try{const Z=ZS(q.stage);if(q.type==='hunt')return `Fight on the field of ${Z.n} (${Z.town}'s realm) until ${q.n} ${MON[q.mon]?MON[q.mon].n:'of the marked foe'} are down.`;
  if(q.type==='gather')return `Gather ${q.n} ${MATS[q.mat]||q.mat} in ${Z.n}: pick the glowing spots on the field, or buy at the Smithy.`;
  if(q.type==='wanderer')return `Walk the field of ${Z.n} until you meet the wayfarer who put up the notice.`;
  if(q.type==='vault')return `Find the vault chest in ${Z.dungeon} and open it.`;if(q.type==='legend')return q.desc;if(q.type==='guild')return q.desc;if(q.type==='arena')return q.desc;return q.desc||'';}catch(e){return q.desc||'';}}
function qgProg(q){try{if(q.type==='hunt')return `${Math.min(q.have||0,q.n)}/${q.n} hunted`;if(q.type==='gather')return `${Math.min(G.mats[q.mat]||0,q.n)}/${q.n} gathered`;if(q.type==='wanderer')return q.found?'Found':'Not found yet';if(q.type==='vault')return (G.vaults||{})[q.stage]?'Opened':'Still sealed';}catch(e){}return '';}
function qgHand(q){if(typeof handFree==='function'&&handFree(q))return 'Claim the reward at any Notice Board (or from the Menu).';if(q.type==='guild'||q.type==='arena')return 'Hand in at any Guild Hall.';try{return `Hand in at the ${ZS(q.stage).town} Notice Board.`;}catch(e){return 'Hand in at its Notice Board.';}}
function qgList(){if(!G||G.daily)return [];const s=G.stage|0;return (G.quests||[]).filter(q=>q.state==='active'&&q.stage<=s).map(q=>({q,rd:questReady(q)?0:1,dist:Math.abs((q.stage|0)-s)})).sort((a,b)=>a.rd-b.rd||a.dist-b.dist||(a.q.stage|0)-(b.q.stage|0)).map(o=>o.q);}
{const gl0=glList;glList=function(){const L=gl0.apply(this,arguments);try{if(!glOn())return L;const Q=qgList().slice(0,2).map(q=>({id:'q:'+q.id,t:(questReady(q)?'Hand in: ':'')+q.title,sub:questReady(q)?qgHand(q):qgWhere(q),p:qgProg(q),R:null,quest:1,ready:questReady(q)}));
  if(!Q.length)return L;const i=L.findIndex(g=>!g.story);return i<0?L.concat(Q):L.slice(0,i).concat(Q,L.slice(i));}catch(e){return L;}};}
// rows are buttons: a tap opens the guide for that goal
{const gh0=glHtml;glHtml=function(L,mode,auto){let h=gh0.apply(this,arguments);try{if(mode!=='chip')h=h.replace(/<li class="([^"]*)" data-goal="([^"]+)" title="([^"]*)">/g,(m0,cls,id,ti)=>{const g=L.find(x=>x.id===id);return `<li class="${cls}${g&&g.quest?' qg':''}${g&&g.ready?' rdy':''}" data-goal="${id}" title="${ti}" role="button" tabindex="0" data-act="goalGuide" data-arg="${id}">`;});}catch(e){}return h;};}
function goalGuideBody(id){const steps=[];let title='',note='';
  if(/^q:/.test(id)){const q=(G.quests||[]).find(x=>x.id===id.slice(2));if(!q)return null;title=q.title;note=q.desc;steps.push(['Go',qgWhere(q)]);const p=qgProg(q);if(p)steps.push(['Progress',p]);steps.push(['Hand in',qgHand(q)]);
    const rw=q.reward||{};steps.push(['Reward',[rw.gold?fmt(rw.gold)+' gold':'',rw.item&&ITEMS[rw.item]?'2 x '+ITEMS[rw.item].n:'',rw.gear?'forged gear':'',q.type==='legend'?'a Legendary wayfarer may join':''].filter(Boolean).join(', ')||'See the board']);}
  else if(/^st(\d)/.test(id)){const s=+RegExp.$1,Z=ZS(s),foe=s<4?'Scourge':'Calamity';title=`The ${foe} of ${Z.n}`;note=`The story step for realm ${s+1}.`;
    steps.push(['1',`Leave ${Z.town} by its gate and head into ${Z.n}.`],['2',`Find the ${Z.dungeon}: its entrance hides off the road, look for glowing stairs. Dens and the Sanctum on the way are optional.`],['3',`Beat the ${foe} inside. Check Guides > What next? for readiness, and rest at the Inn first.`],['Then',s<4?'The far gate opens to the next realm.':'The journey is won.']);}
  else{const g=typeof GLMAP!=='undefined'&&GLMAP[id];if(!g)return null;title=g.t;note=typeof g.sub==='function'?g.sub():g.sub;steps.push(['Do',note]);if(g.k&&g.n>1)steps.push(['Progress',`${glList().find(x=>x.id===id)?.p||''}`]);
    try{const R=glReward(id);steps.push(['Reward',glRewardText(R)]);}catch(e){}}
  return box(esc(title),`<p class="note">${esc(note||'')}</p><div class="rows">${steps.map(([k,v])=>`<div class="row"><b class="m" style="min-width:5em">${esc(k)}</b><div class="grow"><small>${esc(v)}</small></div></div>`).join('')}</div>`,
    `<button class="btn" data-act="goalsMore">All goals</button><button class="btn gold" data-act="closeModal">Close</button>`);}
ACT.goalGuide=function(id){if(!G)return;V.modal={type:'goalguide',id,from:V.modal};render();};
HOOK.before('vModal','guidance9','goal guide popup',function(m){if(m&&m.type==='goalguide'){const h=goalGuideBody(m.id);if(h)return HOOK.stop(h);}});
{const st=document.createElement('style');st.textContent='.gl .gll li[data-act]{cursor:pointer}.gl .gll li.qg span::before{content:"✎ ";opacity:.8}.gl .gll li.rdy span{color:#7aff8a}';document.head.appendChild(st);}
// ----- 3) hint pacing and the Hint log -----
const OB_CORE=['weak','types','deliver','primed','react','shield','status','limit','switch','scan'];
function obEarly(){try{return ((G.stats&&G.stats.battles)|0)<12&&(G.stage|0)===0;}catch(e){return false;}}
// the gap between two tips: 25 s early on, 12 s later; never a second tip in the same battle early on
function obGap(){try{if(!G||G.daily)return OB_GAP;const early=obEarly();if(early&&B&&OB.lastBid===B.id)return 1e9;return early?25000:12000;}catch(e){return OB_GAP;}}
// which queued tip shows next: early on a core battle tip first (the rest wait), later the oldest
function obPickNext(){try{if(obEarly()){const i=OB.q.findIndex(id=>OB_CORE.includes(id));if(i>=0)return OB.q.splice(i,1)[0];return OB.q.shift();}}catch(e){}return OB.q.shift();}
{const os0=obShow;obShow=function(id,txt){const r=os0.apply(this,arguments);try{OB.lastBid=B&&B.id;const L=META.tipLog=Array.isArray(META.tipLog)?META.tipLog:[];if(!L.some(x=>x.id===id)){L.push({id,t:Date.now()});if(L.length>80)L.splice(0,L.length-80);saveMeta();}}catch(e){}return r;};}
// the tip card gets a Log button; Settings > Tips gets one too
HOOK.after('render','guidance9','Log button on the tip card',function(){try{const d=OB.el;if(!d||!OB.cur||V.screen==='battle')return;/* not on the battle card: it must stay small */const row=d.querySelector('.btnrow');if(row&&!row.querySelector('[data-act="hintLog"]'))row.insertAdjacentHTML('beforeend','<button class="btn sm" data-act="hintLog" title="Every tip you have seen">Log</button>');}catch(e){}});
HOOK.xform('settingsBody','guidance9','Hint log button',function(h){try{const k=h.indexOf('data-act="cfg" data-arg=\'["tips"');if(k<0)return h;const end=h.indexOf('</div></div>',k);if(end<0)return h;return h.slice(0,end)+'<button class="chip" data-act="hintLog">Hint log</button>'+h.slice(end);}catch(e){return h;}});
ACT.hintLog=function(a){const m=V.modal&&V.modal.type==='hintlog'?V.modal:{type:'hintlog',sort:'time',from:V.modal};if(a==='time'||a==='type')m.sort=a;V.modal=m;render();};
HOOK.before('vModal','guidance9','Hint log',function(m){if(!m||m.type!=='hintlog')return;const L=(META.tipLog||[]).slice(),byT=m.sort==='type';
  const items=L.map(x=>({x,t:TIPMAP[x.id]})).filter(o=>o.t);if(byT)items.sort((a,b)=>OB_SECS.indexOf(a.t.sec)-OB_SECS.indexOf(b.t.sec)||a.x.t-b.x.t);else items.sort((a,b)=>b.x.t-a.x.t);
  const rows=items.map(o=>`<div class="row"><div class="grow"><b>${esc(o.t.n)}</b> <small class="mute">${esc(o.t.sec)} · ${esc(agoText(o.x.t))}</small><small>${esc(o.t.g||'')}</small></div>${o.t.more?`<button class="btn sm" data-act="tipMore" data-arg="${o.t.id}">More</button>`:''}</div>`).join('');
  return HOOK.stop(box('Hint log',`<p class="note">Every tip you have seen, newest first. ${items.length} of ${TIPS.length}.</p><div class="chips"><button class="chip ${byT?'':'on'}" data-act="hintLog" data-arg="time">By time</button><button class="chip ${byT?'on':''}" data-act="hintLog" data-arg="type">By type</button></div>${rows?`<div class="rows">${rows}</div>`:'<p class="note">No tips yet. They appear as you play.</p>'}`,
    `<button class="btn gold" data-act="xBack">Back</button>`));});
