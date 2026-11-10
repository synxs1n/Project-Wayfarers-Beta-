// ===== npcmark9.js: a pulsing "!" over NPCs and field actors who have a quest for you =====
// npcQuestState(actor) -> 'new' | 'ready' | null.
//   'new'   (gold):  the actor gives a quest or advances one (the lost wayfarer in a dungeon, a roaming legend, a townsperson named as the
//                    giver of a realm quest that is still open on the board).
//   'ready' (green): a quest this townsperson gave is complete and waits to be handed in (at the Notice Board, as before).
// Townsfolk have no quest dialogue of their own: the realm quests in realmdata.js name their giver in the description ("Ash-farmer Lin wants ..."),
// so a townsperson counts as the giver when their name appears in the description of a realm quest (id rq*) of this town's stage.
// Drawn by wrapping townDecorActors (2D) and hdActors (HD-2D), the same way as the Guild Hall marker in guidance9.js. No randomness.
function npcQuestState(a,m){try{if(!G||G.daily||!a)return null;m=m||WS.m;
  if(a.type==='wanderer'){const q=a.q;return q&&q.state==='active'&&!q.found?'new':null;}
  if(a.type==='legend'){const q=a.q;return q&&q.state!=='claimed'&&q.state!=='done'?'new':null;}
  if(a.type)return null;
  if(!m||m.kind!=='town'||a.portal||!a.name)return null;const s=m.s|0;let st=null;
  (G.quests||[]).forEach(q=>{if(!/^rq/.test(q.id||'')||q.stage!==s||q.stage>(G.stage|0)||!q.desc||q.desc.indexOf(a.name)<0)return;
    if(q.state==='active'&&questReady(q))st='ready';else if(q.state==='open'&&st!=='ready')st='new';});
  return st;}catch(e){return null;}}
function nqActors(m){const L=[];try{(m.npcs||[]).forEach(n=>L.push({a:n,n}));dynActors(m).forEach(a=>L.push({a,n:null}));}catch(e){}return L;}
function nqPos(o,now){const a=o.a;let x=a.x*TS,y=a.y*TS;if(o.n&&o.n.mv){const p=Math.min(1,(now-o.n.mv.t0)/420);x=(o.n.mv.fx+(a.x-o.n.mv.fx)*p)*TS;y=(o.n.mv.fy+(a.y-o.n.mv.fy)*p)*TS;}return [x,y];}
{const td0=townDecorActors;townDecorActors=function(actors,now,cx,cy){const r=td0.apply(this,arguments);try{const m=WS.m,ctx=WS.ctx;if(!m||!ctx||G&&G.daily)return r;
  const still=typeof gfxStill==='function'&&gfxStill();
  nqActors(m).forEach(o=>{const st=npcQuestState(o.a,m);if(!st)return;const [nx,ny]=nqPos(o,now),px=nx-cx,py=ny-cy;if(px<-30||py<-60||px>WS.vw+30||py>WS.vh+40)return;
    const hi=o.n?0:10;
    actors.push({y:ny+TS+.4,deco:'npcmark',draw:()=>{const p=still?.8:.55+.45*Math.sin(now/180+nx),bob=still?0:Math.round(Math.sin(now/220+nx)*1.5),col=st==='ready'?'#7aff8a':'#ffd04a',X=Math.round(px)+8,Y=Math.round(py)-26-hi+bob;
      ctx.fillStyle=(st==='ready'?'rgba(150,255,170,':'rgba(255,240,160,')+(.22*p)+')';ctx.beginPath();ctx.arc(X,Y+4,7,0,7);ctx.fill();
      ctx.fillStyle='#150b17';ctx.fillRect(X-3,Y-5,6,12);ctx.fillStyle=col;ctx.fillRect(X-2,Y-4,4,6);ctx.fillRect(X-2,Y+4,4,2);}});});}catch(e){}return r;};}
HOOK.after('hdActors','npcmark9','quest markers over NPCs in HD-2D',function(r,m,now,ts){try{if(G&&G.daily)return r;const V=HD.S.V,still=typeof gfxStill==='function'&&gfxStill();
  nqActors(m).forEach(o=>{const st=npcQuestState(o.a,m);if(!st)return;const [nx,ny]=nqPos(o,now);if(Math.abs(nx-HD.cam.x)>420||Math.abs(ny-HD.cam.z)>520)return;
    const col=st==='ready'?'#7aff8a':'#ffd04a',p=still?.8:.55+.45*Math.sin(ts/180+nx),bob=still?0:Math.round(Math.sin(ts/220+nx)*1.5),fx=nx+8,fz=ny+12.5,h=(HD.heroH||22*V)+((o.n?-3:5)+bob)*V;
    hdBill(HD.dynA,'glow',hdGlowS(),fx,h-4*V,fz,false,.5,st==='ready'?150:255,st==='ready'?255:240,st==='ready'?170:160,Math.round(110*p),4);
    hdBill(HD.dyn,'mk'+col,hdMark(col),fx,h,fz,false,1,255,255,255,255,4);});}catch(e){}return r;});
