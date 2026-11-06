// ===== sanctum.js (v0.3.3): the Echo Sanctum =====
// Replaces the menu style Echo Rift. Unlocks once all five of this journey's story Echoes (four Scourges and the Calamity)
// are beaten (G.echoStory, unchanged). A safe, explorable hall reached from any waystone: sixteen gates, one for each
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
  const keys=echoKeys();
  keys.forEach((k,i)=>{const north=i<8,j=north?i:i-8,x=3+3*j,y=north?1:H-2,d=guardianDef(k);
    m.npcs.push({x,y,hx:x,hy:y,name:'Gate of Echo '+d.n,line:'',view:'front',face:'r',act:'portal',portal:1,key:k,look:null});});
  m.npcs.push({x:13,y:9,hx:13,hy:9,name:'Echo Warden',line:'Every Scourge and Calamity you broke is still ringing in here. Stand before a gate and press Space to challenge its Echo. This hall is safe: nothing roams, and the way out is the south door.',look:villagerLook('Echo Warden'),view:'front',face:'r'});
  return m;
}
// ----- drawing: a small rune gate, dim until its Echo has answered, a gold pip once beaten -----
function drawPortal(ctx,px,py,n,now){const d=guardianDef(n.key),open=riftKeys().includes(n.key),col=(typeof ELC!=='undefined'&&ELC[d.el[0]])||'#b48aff',won=(((META.best||{})['Echo '+d.n])||{}).kills>0,ph=now/320+n.x;
  const f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);};
  f('#0e0a16',0,-3,16,19);f('#4a4068',1,-2,14,17);f('#1c1430',3,-1,10,13);f('#5a4a80',0,13,16,3);f('#0e0a16',0,15,16,1);
  for(let i=0;i<5;i++){const a=ph+i*1.26,rx=Math.round(Math.cos(a)*3)+7,ry=Math.round(Math.sin(a)*4)+4;f(open?col:'#585868',rx,ry,2,2);}
  f(open?'#efe4ff':'#80808c',7,4,2,3);
  if(won){f('#ffd04a',12,-2,2,2);f('#ffd04a',11,-1,4,1);}}
function sanctumActor(actors,n,ctx,cx,cy,now){const px=n.x*TS-cx,py=n.y*TS-cy;if(px<-20||py<-24||px>ctx.canvas.width+4||py>ctx.canvas.height+4)return;actors.push({y:n.y*TS,draw:()=>drawPortal(ctx,px,py,n,now)});}
// ----- the gate card -----
function mPortal(m){const k=m.key,d=guardianDef(k);if(!d)return '';const b=(META.best||{})['Echo '+d.n]||{},open=riftKeys().includes(k);
  return box(`Echo of ${esc(d.n)}`,`<div class="row"><img class="mimg" src="${monURL('echo_'+d.art)}" alt=""><div class="grow"><b>Echo ${esc(d.n)}</b><small>${bossClass(k)} · Level ${echoLv(k)}${b.kills?` · beaten ${b.kills}x`:''}${(G.bossWon||{})['e:'+k]?' · auto allowed':' · auto locked until a manual win'}</small><small>Shard: ${G.mats['es_'+k]||0} held</small></div></div>
    <p class="note">Echoes at full strength: Scourges at level 50 or your average +5, Calamities at 56 or your average +8. Every Echo drops Echo Essence; its Shard on the first win this journey, often after that. Shards feed the Smithy's Echoforge.</p>`,
    `<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="riftFight" data-arg="${k}" ${open?'':'disabled'}>Challenge</button>`);}
{const vm0=vModal;vModal=function(m){if(m&&m.type==='portal')return mPortal(m);return vm0.apply(this,arguments);};}
// ----- the waystone row -----
function riftRow(){if(!G)return '';const open=sanctumOpen(),n=sanctumProgress();if(!open&&!G.won&&!n)return '';
  return `<div class="row archrow riftrow"><div><b>◈ The Echo Sanctum</b><small>${open?'A hall of gates, one for every Scourge and Calamity Echo.':`Beat all five story Echoes to open it (${n}/5). Each waits in its dungeon once you have cleared it.`}</small></div><button class="btn sm gold" data-act="toSanctum" ${open&&!(WS.m&&WS.m.sanctum)?'':'disabled'}>Go</button></div>`;}
Object.assign(ACT,{
  toSanctum(){if(!sanctumOpen())return;V.modal=null;fadeTo(()=>{getMap(SANCT_ID);placeAt(SANCT_ID,13,16,'u');showLocation();saveGame();});render();},
  riftFight(k){if(!riftKeys().includes(k))return;V.modal=null;if(!startBattle(riftSpec(k))){toast('Your party needs rest first.');render();}}});
// the account flag follows the journey: once the five fall it is set, as before
{const w0=win;win=function(){const r=w0.apply(this,arguments);try{if(sanctumOpen()&&!META.echoRift){META.echoRift=1;saveMeta();}}catch(e){}return r;};}
// ----- map markers: every gate shows as an Echo marker once seen -----
{const mm0=mapMarks;mapMarks=function(m){const o=mm0.apply(this,arguments);try{if(m&&m.sanctum)m.npcs.forEach(n=>{if(n.portal&&isSeen(m,n.x,n.y+(n.y<9?1:-1)))o.push({x:n.x,y:n.y,k:'echo'});});}catch(e){}return o;};}
