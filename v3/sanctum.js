// ===== sanctum.js (v0.3.3): the Echo Rift (was the Echo Sanctum) =====
// Replaces the menu style Echo Rift. Unlocks once all five of this journey's story Echoes (four Scourges and the Calamity)
// are beaten (G.echoStory, unchanged). A safe, explorable hall reached from any waystone: a gate for each
// Scourge and Calamity Echo. Fights use riftSpec(): same scaling, drops, shards and Echoforge rules as v0.3.2.
// No new save fields. The map is built in code (id 's0'), safe (no random battles), and its exit leads back to the last town.
const SANCT_ID='s0';
function sanctumOpen(){return !!G&&!G.daily&&[0,1,2,3,4].every(s=>(G.echoStory||{})[s]);}
function sanctumProgress(){const n=G?[0,1,2,3,4].filter(s=>(G.echoStory||{})[s]).length:0;return n;}
// v0.17.2: The Echo Rift, concentric. A 33 x 34 hall on one north-south axis (x 16): the south door and the start tile at the bottom, the
// Echoforge at the centre (16,16), the five Calamity gates on an inner ring (radius 5, a vertex due north, the south left open) and the
// twenty Scourge gates on an outer ring (radius 10.5) around them, 21 evenly spaced slots with the one on the south axis left out, so the
// lane from the door runs straight up into the middle. Slots run clockwise from the south; every four sit together as one element family
// (the arcs follow the elements, not the realms; each realm brings its own Scourge since v0.18.7, realmdata.js boss): Storm and Frost, Gloam, Wild, Ember, Tide.
// Each family has a sign (a solid 'S' tile, drawn in 2D and HD-2D since v0.18.7: dungeons never drew one, so it was an empty square that blocked the walkway) on the walkway side of its arc (radius 8) and braziers where the arcs meet (radius 12.2, the last pair flanking the
// lane). The Riftkeeper (with his rest popup) and his gate stand on the axis north of the outer ring. Walkways between the rings are 4 tiles
// wide; every gate has open floor on the side that faces the centre and on the side that faces the wall. interact() reads the tile in WS.dir,
// so standing in the walkway and facing out hits a Scourge gate, facing in hits a Calamity gate.
const RIFT_HALL=(()=>{const W=33,H=34,cx=16,cy=16,pol=(r,deg)=>{const a=deg*Math.PI/180;return [Math.round(cx+r*Math.sin(a)),Math.round(cy-r*Math.cos(a))];},
  step=360/21,sl=j=>180+j*step,
  fam=[{n:'Storm and Frost Bay',d:'lightning and ice',keys:['ysolde','hoarwyrm','frostlich','paleweaver']},
   {n:'Gloam Bay',d:'shadow and iron',keys:['bonecolossus','gloomcap','crowregent','ironsentinel']},
   {n:'Wild Bay',d:'earth and wind',keys:['thornwarden','hollowshepherd','queenmantis','locustchoir']},
   {n:'Ember Bay',d:'fire',keys:['cinderking','ashwyvern','candlemoth','geysermatron']},
   {n:'Tide Bay',d:'water',keys:['drake','siren','brinehag','ironmaw']}];
  const bays=fam.map((f,g)=>Object.assign({},f,{at:[1,2,3,4].map(i=>pol(10.5,sl(4*g+i))),sign:pol(8,sl(4*g+2.5)),bz:[pol(12.2,sl(4*g+.5))].concat(g===4?[pol(12.2,sl(20.5))]:[])}));
  return {W,H,start:[16,31],exit:[16,33],forge:[cx,cy],rk:[16,2],keeper:[16,4],ring:[0,72,144,216,288].map(d=>pol(5,d)),bays,
  pillars:[[4,6],[28,6],[4,27],[28,27]],corners:[[1,32],[31,32],[14,2],[18,2]]};})();
function buildSanctum(){
  const R=RIFT_HALL,W=R.W,H=R.H,t=[];for(let y=0;y<H;y++){const r=[];for(let x=0;x<W;x++)r.push(y===0||y===H-1||x===0||x===W-1?'#':'.');t.push(r);}
  t[R.exit[1]][R.exit[0]]='E';
  R.bays.forEach(b=>{b.bz.forEach(([x,y])=>{t[y][x]='v';});});R.corners.forEach(([x,y])=>{t[y][x]='v';});R.pillars.forEach(([x,y])=>{t[y][x]='P';});
  const m={id:SANCT_ID,z:4,s:4,kind:'dungeon',theme:'void',safe:1,archive:1,sanctum:1,hub:'The Echo Rift',exits:[],npcs:[],bld:[],signs:{},t,start:R.start.slice(),bossAt:null,chests:[],wander:[0,0],nodes:[]};
  m.w=W;m.h=H;m.tone=valueNoise(mulberry(7171),W,H,6);m.shelves=[];
  // the signs: tile 'S' on the walkway side of each family's arc
  R.bays.forEach(b=>{[b.sign,b.sign2].filter(Boolean).forEach(([x,y])=>{t[y][x]='S';m.signs[x+','+y]=`${b.n}: the Scourges of ${b.d}. Four gates, one for each Echo.`;});});
  // Scourges: by family arc; a Scourge no arc names yet takes the first free outer-ring slot, so a new boss still gets a gate
  const gp=GPOOL.slice(),fp=FPOOL.slice(),put=(k,x,y,cal)=>{const d=guardianDef(k);if(!d)return;
    m.npcs.push(cal?{x,y,hx:x,hy:y,name:'Calamity Gate: '+echoName(d),line:'',view:'front',face:'r',act:'portal',portal:1,cal:1,key:k,look:null}
      :{x,y,hx:x,hy:y,name:'Gate of '+echoName(d),line:'',view:'front',face:'r',act:'portal',portal:1,key:k,look:null});};
  const used=new Set(),free=[];R.bays.forEach(b=>b.at.forEach((p,i)=>{const k=b.keys[i];if(k&&gp.includes(k)&&!used.has(k)){used.add(k);put(k,p[0],p[1]);}else free.push(p);}));
  gp.filter(k=>!used.has(k)).forEach((k,i)=>{const p=free[i];if(p)put(k,p[0],p[1]);});
  // the Calamities: the inner ring around the Echoforge, clockwise from due north
  fp.forEach((k,j)=>{const p=R.ring[j];if(p)put(k,p[0],p[1],1);});
  m.npcs.push({x:R.keeper[0],y:R.keeper[1],hx:R.keeper[0],hy:R.keeper[1],name:'Echo Warden',line:'Every Scourge and Calamity you broke is still ringing in here. Stand before a gate and press Space to challenge its Echo. The Calamities ring the forge, the Scourges stand in a wider ring around them, four to an element, and the way out is the south door. This hall is safe: nothing roams.',look:villagerLook('Echo Warden'),view:'front',face:'r'});
  return m;
}
// ----- drawing: a small rune gate, dim until its Echo has answered, a gold pip once beaten -----
// v0.18.7: the lit colour of a gate comes from the boss behind it (RIFT_COL in realmdata.js), else its first element
function riftGateCol(k){const d=guardianDef(k);return (typeof RIFT_COL!=='undefined'&&RIFT_COL[k])||(d&&typeof ELC!=='undefined'&&ELC[d.el[0]])||'#b48aff';}
function drawPortal(ctx,px,py,n,now){const d=guardianDef(n.key),open=riftKeys().includes(n.key),col=riftGateCol(n.key),won=(((META.best||{})[echoName(d)])||{}).kills>0,ph=now/320+n.x;
  const f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);};
  const cal=!!n.cal;if(cal){f('#2a0608',-1,-5,18,22);f(open?'#ffd04a':'#7a6a3a',-1,-5,18,1);f(open?'#ffd04a':'#7a6a3a',-1,-5,1,22);f(open?'#ffd04a':'#7a6a3a',16,-5,1,22);}
  f('#0e0a16',0,-3,16,19);f(cal?'#7a1a22':'#4a4068',1,-2,14,17);f(cal?'#2a0810':'#1c1430',3,-1,10,13);f(cal?'#a0303a':'#5a4a80',0,13,16,3);f('#0e0a16',0,15,16,1);
  if(!open){f('#0e0a16',5,6,6,5);f('#9a9aa8',6,7,4,3);f('#9a9aa8',6,4,1,3);f('#9a9aa8',9,4,1,3);f('#9a9aa8',7,3,2,1);ctx.globalAlpha=.55;}
  for(let i=0;i<5;i++){const a=ph+i*1.26,rx=Math.round(Math.cos(a)*3)+7,ry=Math.round(Math.sin(a)*4)+4;f(won?col:'#585868',rx,ry,2,2);}/* v0.16.5: the runes take the element colour only once the Echo is beaten (open but unbeaten: grey), so colour always means beaten */
  f(open?'#efe4ff':'#80808c',7,4,2,3);
  ctx.globalAlpha=1;if(won){f('#ffd04a',12,-2,2,2);f('#ffd04a',11,-1,4,1);}}
drawPortal=HOOK.def('drawPortal',drawPortal);
function sanctumActor(actors,n,ctx,cx,cy,now){const px=n.x*TS-cx,py=n.y*TS-cy;if(px<-20||py<-24||px>ctx.canvas.width+4||py>ctx.canvas.height+4)return;actors.push({y:n.y*TS,draw:()=>drawPortal(ctx,px,py,n,now)});}
// ----- the gate card -----
// v0.11.0: what opens a closed gate
function portalLockWhy(k){try{const st=[0,1,2,3,4].find(s=>bossKeyFor(s)===k);const n=sanctumProgress();
  if(st!=null)return `Beat its Echo in ${ZS(st).dungeon||'its dungeon'} this journey. Or beat all five story Echoes of one journey (${n} of 5 so far) and every gate opens for good.`;
  return `This Echo is not in this journey. Beat all five story Echoes of one journey (${n} of 5 so far) and every gate opens for good, in every journey.`;}catch(e){return 'Beat the story Echoes to open it.';}}
function mPortal(m){const k=m.key,d=guardianDef(k);if(!d)return '';const b=(META.best||{})[echoName(d)]||{},open=riftKeys().includes(k);
  return box(`Echo of ${esc(d.n)}`,`<div class="row"><img class="mimg" src="${monURL('echo_'+d.art)}" alt=""><div class="grow"><b>${esc(echoName(d))}</b><small>${bossClass(k)} · Level ${echoLv(k)}${b.kills?` · beaten ${b.kills}x`:''}${(G.bossWon||{})['e:'+k]?' · auto allowed':' · auto locked until a manual win'}</small><small>Shard: ${G.mats['es_'+k]||0} held</small></div></div>
    ${open?'':`<p class="note warn">Locked. ${esc(portalLockWhy(k))}</p>`}${FPOOL.includes(k)?'<p class="note"><b>Calamity Echo.</b> One of the five world-enders, harder than any Scourge.</p>':''}
    <p class="note">Echoes at full strength: Scourges at level 50 or your average +5, Calamities at 56 or your average +8. Every Echo drops Echo Essence; its Shard on the first win this journey, often after that. Shards feed the Smithy's Echoforge.</p>`,
    `<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="riftFight" data-arg="${k}" ${open?'':'disabled'}>Challenge</button>`);}
mPortal=HOOK.def('mPortal',mPortal);
HOOK.before('vModal','sanctum','portal popup',function(m){if(m&&m.type==='portal')return HOOK.stop(mPortal(m));});
// ----- the waystone row -----
function riftRow(){if(!G)return '';const open=sanctumOpen(),n=sanctumProgress();if(!open&&!G.won&&!n)return '';
  return `<div class="row archrow riftrow"><div><b>◈ The Echo Rift</b><small>${open?'A hall of gates, one for every Scourge and Calamity Echo.':`Beat all five story Echoes to open it (${n}/5). Each waits in its dungeon once you have cleared it.`}</small></div><button class="btn sm gold" data-act="toSanctum" ${open&&!(WS.m&&WS.m.sanctum)?'':'disabled'}>Go</button></div>`;}
Object.assign(ACT,{
  toSanctum(){if(!sanctumOpen())return;V.modal=null;fadeTo(()=>{getMap(SANCT_ID);placeAt(SANCT_ID,RIFT_HALL.start[0],RIFT_HALL.start[1],'u');showLocation();saveGame();});render();},
  riftFight(k){if(!riftKeys().includes(k))return;V.modal=null;if(!startBattle(riftSpec(k))){toast('Your party needs rest first.');render();}}});
// the account flag follows the journey: once the five fall it is set, as before
HOOK.after('win','sanctum','opens the Rift',function(){try{if(sanctumOpen()&&!META.echoRift){META.echoRift=1;saveMeta();}}catch(e){}});
// ----- map markers: every gate shows as an Echo marker once seen -----
HOOK.after('mapMarks','sanctum','Echo gate markers',function(o,m){try{if(m&&m.sanctum)m.npcs.forEach(n=>{if(n.portal&&[[0,0],[0,1],[0,-1],[1,0],[-1,0]].some(([a,b])=>isSeen(m,n.x+a,n.y+b)))o.push({x:n.x,y:n.y,k:'echo'});});}catch(e){}});
