// ===== sanctum.js (v0.3.3): the Echo Sanctum =====
// Replaces the menu style Echo Rift. Unlocks once all five of this journey's story Echoes (four Scourges and the Calamity)
// are beaten (G.echoStory, unchanged). A safe, explorable hall reached from any waystone: a gate for each
// Scourge and Calamity Echo. Fights use riftSpec(): same scaling, drops, shards and Echoforge rules as v0.3.2.
// No new save fields. The map is built in code (id 's0'), safe (no random battles), and its exit leads back to the last town.
const SANCT_ID='s0';
function sanctumOpen(){return !!G&&!G.daily&&[0,1,2,3,4].every(s=>(G.echoStory||{})[s]);}
function sanctumProgress(){const n=G?[0,1,2,3,4].filter(s=>(G.echoStory||{})[s]).length:0;return n;}
function buildSanctum(){
  const W=28,H=19,t=[];for(let y=0;y<H;y++){const r=[];for(let x=0;x<W;x++)r.push(y===0||y===H-1||x===0||x===W-1?'#':'.');t.push(r);}
  t[H-1][13]='E';
  [[1,1],[W-2,1],[1,H-2],[W-2,H-2],[8,9],[19,9]].forEach(([x,y])=>{t[y][x]='v';});
  [[5,6],[22,6],[5,12],[22,12]].forEach(([x,y])=>{t[y][x]='P';});
  const m={id:SANCT_ID,z:4,s:4,kind:'dungeon',theme:'void',safe:1,archive:1,sanctum:1,hub:'The Echo Sanctum',exits:[],npcs:[],bld:[],signs:{},t,start:[13,16],bossAt:null,chests:[],wander:[0,0],nodes:[]};
  m.w=W;m.h=H;m.tone=valueNoise(mulberry(7171),W,H,6);m.shelves=[];
  // v0.11.0: every gate stands, open or not. Scourges along the north wall; the Calamities get their own row on the south wall,
  // either side of the door, in crimson and gold frames (drawPortal)
  // v0.13.7: sixteen Scourge gates do not fit one row of a 28 wide hall, so they take two (y 1 and y 3, keeping clear of the Riftkeeper's gate at
  // x 13); the five Calamity gates now stand in a centred row at y 14. v0.14.x: twenty Scourges, two rows of ten on the same ten columns
  // (x 2 to 10 and 16 to 24, the middle five columns stay open for the Riftkeeper's gate at 13,4 and the Echoforge at 13,6; y 2 is a walkway)
  const gp=GPOOL.slice(),fp=FPOOL.slice(),rowA=Math.ceil(gp.length/2),xB=[2,4,6,8,10,16,18,20,22,24];
  const gx=j=>{const i=j%rowA;return {x:xB[i]!=null?xB[i]:Math.min(W-2,2+i*2),y:j<rowA?1:3};};
  gp.forEach((k,j)=>{const {x,y}=gx(j),d=guardianDef(k);if(!d)return;m.npcs.push({x,y,hx:x,hy:y,name:'Gate of Echo '+d.n,line:'',view:'front',face:'r',act:'portal',portal:1,key:k,look:null});});
  // v0.14.x: the Calamity arches stand free on open floor in a centred row at y 14 (never against the south wall, where the HD-2D wall front hides them):
  // clear floor south of each, the start tile (13,16) and the door below it kept open
  const fx=[7,10,13,16,19],CY=14;fp.forEach((k,j)=>{const x=fx[j]!=null?fx[j]:7+j*3,d=guardianDef(k);if(!d)return;m.npcs.push({x,y:CY,hx:x,hy:CY,name:'Calamity Gate: Echo '+d.n,line:'',view:'front',face:'r',act:'portal',portal:1,cal:1,key:k,look:null});});
  m.npcs.push({x:13,y:9,hx:13,hy:9,name:'Echo Warden',line:'Every Scourge and Calamity you broke is still ringing in here. Stand before a gate and press Space to challenge its Echo. This hall is safe: nothing roams, and the way out is the south door.',look:villagerLook('Echo Warden'),view:'front',face:'r'});
  return m;
}
// ----- drawing: a small rune gate, dim until its Echo has answered, a gold pip once beaten -----
function drawPortal(ctx,px,py,n,now){const d=guardianDef(n.key),open=riftKeys().includes(n.key),col=(typeof ELC!=='undefined'&&ELC[d.el[0]])||'#b48aff',won=(((META.best||{})['Echo '+d.n])||{}).kills>0,ph=now/320+n.x;
  const f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);};
  const cal=!!n.cal;if(cal){f('#2a0608',-1,-5,18,22);f(open?'#ffd04a':'#7a6a3a',-1,-5,18,1);f(open?'#ffd04a':'#7a6a3a',-1,-5,1,22);f(open?'#ffd04a':'#7a6a3a',16,-5,1,22);}
  f('#0e0a16',0,-3,16,19);f(cal?'#7a1a22':'#4a4068',1,-2,14,17);f(cal?'#2a0810':'#1c1430',3,-1,10,13);f(cal?'#a0303a':'#5a4a80',0,13,16,3);f('#0e0a16',0,15,16,1);
  if(!open){f('#0e0a16',5,6,6,5);f('#9a9aa8',6,7,4,3);f('#9a9aa8',6,4,1,3);f('#9a9aa8',9,4,1,3);f('#9a9aa8',7,3,2,1);ctx.globalAlpha=.55;}
  for(let i=0;i<5;i++){const a=ph+i*1.26,rx=Math.round(Math.cos(a)*3)+7,ry=Math.round(Math.sin(a)*4)+4;f(open?col:'#585868',rx,ry,2,2);}
  f(open?'#efe4ff':'#80808c',7,4,2,3);
  ctx.globalAlpha=1;if(won){f('#ffd04a',12,-2,2,2);f('#ffd04a',11,-1,4,1);}}
function sanctumActor(actors,n,ctx,cx,cy,now){const px=n.x*TS-cx,py=n.y*TS-cy;if(px<-20||py<-24||px>ctx.canvas.width+4||py>ctx.canvas.height+4)return;actors.push({y:n.y*TS,draw:()=>drawPortal(ctx,px,py,n,now)});}
// ----- the gate card -----
// v0.11.0: what opens a closed gate
function portalLockWhy(k){try{const st=[0,1,2,3,4].find(s=>bossKeyFor(s)===k);const n=sanctumProgress();
  if(st!=null)return `Beat its Echo in ${ZS(st).dungeon||'its dungeon'} this journey. Or beat all five story Echoes of one journey (${n} of 5 so far) and every gate opens for good.`;
  return `This Echo is not in this journey. Beat all five story Echoes of one journey (${n} of 5 so far) and every gate opens for good, in every journey.`;}catch(e){return 'Beat the story Echoes to open it.';}}
function mPortal(m){const k=m.key,d=guardianDef(k);if(!d)return '';const b=(META.best||{})['Echo '+d.n]||{},open=riftKeys().includes(k);
  return box(`Echo of ${esc(d.n)}`,`<div class="row"><img class="mimg" src="${monURL('echo_'+d.art)}" alt=""><div class="grow"><b>Echo ${esc(d.n)}</b><small>${bossClass(k)} · Level ${echoLv(k)}${b.kills?` · beaten ${b.kills}x`:''}${(G.bossWon||{})['e:'+k]?' · auto allowed':' · auto locked until a manual win'}</small><small>Shard: ${G.mats['es_'+k]||0} held</small></div></div>
    ${open?'':`<p class="note warn">Locked. ${esc(portalLockWhy(k))}</p>`}${FPOOL.includes(k)?'<p class="note"><b>Calamity Echo.</b> One of the five world-enders, harder than any Scourge.</p>':''}
    <p class="note">Echoes at full strength: Scourges at level 50 or your average +5, Calamities at 56 or your average +8. Every Echo drops Echo Essence; its Shard on the first win this journey, often after that. Shards feed the Smithy's Echoforge.</p>`,
    `<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="riftFight" data-arg="${k}" ${open?'':'disabled'}>Challenge</button>`);}
HOOK.before('vModal','sanctum','portal popup',function(m){if(m&&m.type==='portal')return HOOK.stop(mPortal(m));});
// ----- the waystone row -----
function riftRow(){if(!G)return '';const open=sanctumOpen(),n=sanctumProgress();if(!open&&!G.won&&!n)return '';
  return `<div class="row archrow riftrow"><div><b>◈ The Echo Sanctum</b><small>${open?'A hall of gates, one for every Scourge and Calamity Echo.':`Beat all five story Echoes to open it (${n}/5). Each waits in its dungeon once you have cleared it.`}</small></div><button class="btn sm gold" data-act="toSanctum" ${open&&!(WS.m&&WS.m.sanctum)?'':'disabled'}>Go</button></div>`;}
Object.assign(ACT,{
  toSanctum(){if(!sanctumOpen())return;V.modal=null;fadeTo(()=>{getMap(SANCT_ID);placeAt(SANCT_ID,13,16,'u');showLocation();saveGame();});render();},
  riftFight(k){if(!riftKeys().includes(k))return;V.modal=null;if(!startBattle(riftSpec(k))){toast('Your party needs rest first.');render();}}});
// the account flag follows the journey: once the five fall it is set, as before
HOOK.after('win','sanctum','opens the Rift',function(){try{if(sanctumOpen()&&!META.echoRift){META.echoRift=1;saveMeta();}}catch(e){}});
// ----- map markers: every gate shows as an Echo marker once seen -----
{const mm0=mapMarks;mapMarks=function(m){const o=mm0.apply(this,arguments);try{if(m&&m.sanctum)m.npcs.forEach(n=>{if(n.portal&&isSeen(m,n.x,n.y+(n.y<9?1:-1)))o.push({x:n.x,y:n.y,k:'echo'});});}catch(e){}return o;};}
