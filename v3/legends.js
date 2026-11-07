// ===== legends.js (pre-beta): legendary heroes, redeem codes, mounts and pets =====
// Real people, hand-built. Each has a unique class, a legendary trait, a redeem code and a recruit event.
// Unlocks live in META.legends (local cache) and profile/<uid>.flags.legends (account), merged as a union.
// Redeem codes are never stored in plain text: only SHA-256('aurelis-legend:' + CODE) is here.
// To swap a code: node -e "console.log(require('crypto').createHash('sha256').update('aurelis-legend:'+'NEWCODE').digest('hex'))"
// (codes are trimmed, upper-cased and stripped of spaces before hashing) and replace the matching hash below.
const LEGEND_CODES={
 '0f29cf9fcc08d8236e87eea078bc528304aa9296b127ff22b8831ef462ad7f78':'kaevan',
 '7fb78e341af6a08ca85651461c78dc560fb66b71bab4246d4d67411be9636de2':'nikaris',
 '85d180472fb206773045e39e6675632fe4635b744222d4718790795922bc3e95':'jaeson'
};
const REDEEM={until:0,busy:false,msg:null,ok:false};
async function sha256hex(str){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');}
const normCode=s=>String(s||'').trim().toUpperCase().replace(/\s+/g,'');
async function redeemCode(raw){
  const wait=Math.ceil((REDEEM.until-Date.now())/1000);if(wait>0)return {ok:false,msg:`Please wait ${wait}s before trying another code.`};
  const code=normCode(raw);if(!code)return {ok:false,msg:'Type a code first.'};
  let h;try{h=await sha256hex('aurelis-legend:'+code.slice(0,64));}catch(e){return {ok:false,msg:'Codes cannot be checked in this browser.'};}
  const id=LEGEND_CODES[h];
  if(!id){REDEEM.until=Date.now()+10000;return {ok:false,msg:"That code didn't work."};}
  META.legends=META.legends||{};const already=!!META.legends[id];META.legends[id]=1;saveMeta();codexSee(id);profileDirty();
  return {ok:true,id,already};
}
const legendOn=id=>!!(META.legends&&META.legends[id]);
// ----- recruit events, tied to a quest on the board -----
const LEG_Q={
 kaevan:{title:'The Dusk Rider',ok:s=>s>=1,ch:.3,desc:s=>`Herders say a lone rider crosses ${ZS(s).n} at dusk, riding in front of the storms. He only stops for someone who can keep up.`},
 nikaris:{title:"The Wildcaller's Trial",ok:s=>s>=1,ch:.3,desc:s=>`At night something calls the beasts of ${ZS(s).n} by name. A starving wolf pup and a young hawk have been seen near the road. Win them over and the caller may show himself.`},
 jaeson:{title:'Convergence',ok:s=>['snow','heights'].includes(ZS(s).theme),ch:.6,desc:s=>`A lake in ${ZS(s).n} froze solid in a single night, and lightning has struck it every hour since. Someone is standing in the middle of it.`}
};
function legendRoll(s){
  if(!G||G.daily)return;G.legRoll=G.legRoll||{};
  LEGEND_IDS.forEach(id=>{
    if(!legendOn(id)||G.roster[id]||G.quests.some(q=>q.type==='legend'&&q.hero===id))return;
    const k=id+':'+s;if(G.legRoll[k])return;G.legRoll[k]=1;
    const L=LEG_Q[id];if(!L.ok(s)||Math.random()>=L.ch)return;
    G.quests.push({id:'L'+id,stage:s,type:'legend',hero:id,state:'open',step:0,title:L.title,desc:L.desc(s),reward:{gold:0}});
  });
}
function legendProg(q){const n=ZS(q.stage).n;
  if(q.state==='claimed')return `${TPL[q.hero].n} joined you`;
  if(q.hero==='nikaris')return ['Find the wolf pup','Find the young hawk','Find the Wildcaller'][q.step||0]+' in '+n;
  if(q.hero==='jaeson')return 'Reach the frozen lake in '+n;
  return 'Find the rider in '+n;}
const legendQ=(m)=>(G.quests||[]).filter(q=>q.type==='legend'&&q.state==='active'&&q.stage===m.s&&!G.roster[q.hero]);
// ----- foes for the events -----
const DUSK_RIDER={n:'Dusk Rider',art:'thunderhawk',el:['shadow','lightning'],hp:1.1,atk:1.3,def:1,mag:.9,res:1,spd:1.35,
  sk:[['Storm Quarrel','lightning',1.4,'one','phys',[['stun',.15]]],['Shadow Volley','shadow',.85,'all','phys'],['Wheel Away','shadow',0,'self','buff',[['haste',1]]]]};
function legendFoes(spec){
  const s=spec.stage,lv=STAGE_LV[s][1]+1,out=[];
  if(spec.hero==='kaevan'){
    const e=makeEnemy(DUSK_RIDER,lv,{elite:true,name:'Kaevan Temur',hpM:4.5+.3*s,powM:1.3+.05*s});e.heroArt='kaevan';e.multi=2;
    e.phase={at:.5,say:'Kaevan laughs and spurs his horse into the storm!',self:[['haste',1],['might',1]]};out.push(e);
    [0,1].forEach(()=>{const h=makeEnemy(MON.thunderhawk,lv-3);h.name='Steppe Hawk';out.push(h);});
  }else if(spec.hero==='nikaris'){
    const m=spec.step?MON.thunderhawk:MON.frostwolf,e=makeEnemy(m,Math.max(2,lv-3),{hpM:1.3});e.name=spec.step?'Young Hawk':'Starving Wolf Pup';out.push(e);
  }
  return out;
}
HOOK.before('encounterFoes','legends','legend fights',function(spec){if(spec.kind==='legend')return HOOK.stop(legendFoes(spec));});
function legendJoin(id,info){
  if(!G||G.roster[id])return;
  const c=newChar(id,Math.max(3,avgLv()),gearTier());G.roster[id]=c;if(G.party.length<6)G.party.push(id);
  G.quests.forEach(q=>{if(q.type==='legend'&&q.hero===id)q.state='claimed';});
  codexSee(id,{rec:1,lv:c.lv});saveGame();
  const line={kaevan:'"You kept up. Fine. I ride with you until the storm runs out."',nikaris:'"The pup trusts you. The hawk trusts you. I suppose I will too."',jaeson:'"You read the storm right. Let us see what else it says."'}[id];
  if(info)info.legend=`${TPL[id].title} joins you. ${line}`;
  else{V.modal={type:'story',title:TPL[id].title,text:`${line}\n\n${TPL[id].n} joins your roster${G.party.includes(id)?' and your six':''}.`,btn:'Welcome aboard'};}
  if(typeof sfx==='function')sfx('level');
}
function legendWin(spec,info){
  const q=G.quests.find(x=>x.type==='legend'&&x.hero===spec.hero);
  if(spec.hero==='kaevan')legendJoin('kaevan',info);
  else if(spec.hero==='nikaris'&&q){q.step=(spec.step||0)+1;info.legend=spec.step?'The young hawk lands on your shoulder and stays there. Somewhere in the dark, someone whistles.':'The wolf pup stops growling and pads after you.';}
}
function legendTalk(a){
  const q=a.q,id=q.hero;
  if(id==='kaevan')V.modal={type:'legendEvt',hero:id,text:'Dusk turns the grass to copper. A rider on a black horse circles you once, crossbow resting on his knee, mustache magnificent against the storm. "You want to ride with me? Then keep up." His hawks scream overhead.',fight:'Ride against him'};
  else if(id==='nikaris'){
    const st=q.step||0;
    if(st===0)V.modal={type:'legendEvt',hero:id,step:0,text:'In the dark grass a wolf pup crouches over a bone, ribs showing, growling at anything that moves. It will not come quietly.',fight:'Win it over'};
    else if(st===1)V.modal={type:'legendEvt',hero:id,step:1,text:'A young hawk tangled in thornvine shrieks and slashes at you. The pup at your heels whines.',fight:'Calm the hawk'};
    else V.modal={type:'legendEvt',hero:id,step:2,text:'A hooded figure in a wolf pelt steps out of the night. The pup runs to him; the hawk does not leave your shoulder. "Huh. They chose you." He looks at you a long moment. "Then I guess I do too."',join:1};
  }
  else if(id==='jaeson'){convInit();V.modal={type:'convergence'};}
  render();
}
{const at0=actorTalk;actorTalk=function(a){if(a.type==='legend')return legendTalk(a);return at0.apply(this,arguments);};}
{const da0=dynActors;dynActors=function(m){const out=da0(m);
  if(m.kind==='field'&&m.part!==1&&m.free&&m.free.length)legendQ(m).forEach(q=>{let k=(hashS(q.hero+(q.step||0))*7)%m.free.length,p=m.free[k];
    for(let j=0;j<m.free.length&&(out.some(o=>o.x===p[0]&&o.y===p[1])||(m.nodes||[]).some(n=>n.x===p[0]&&n.y===p[1]));j++)p=m.free[(k+j*11)%m.free.length];
    const mon=q.hero==='nikaris'&&(q.step||0)<2?((q.step||0)===0?'frostwolf':'thunderhawk'):null;
    out.push({type:'legend',q,x:p[0],y:p[1],mon});});
  return out;};}
{const gq0=genQuests;genQuests=function(s){const r=gq0.apply(this,arguments);try{legendRoll(s);}catch(e){}return r;};}
{const pa0=placeAt;placeAt=function(mid,x,y,f){const r=pa0.apply(this,arguments);const m=WS.m;if(m&&m.kind==='field'&&legendQ(m).some(q=>q.hero==='jaeson'))G.weather[m.s]='storm';return r;};}
function drawLegendActor(ctx,a,cx,cy,now){
  const bob=Math.floor(now/450)%2,X=a.x*TS+8-cx,Y=a.y*TS;
  const g=.5+.5*Math.sin(now/240);ctx.fillStyle=`rgba(255,215,90,${.15+.2*g})`;ctx.beginPath();ctx.ellipse(X,Y+14-cy,13,5,0,0,7);ctx.fill();
  if(a.mon){const mo=MON[a.mon],c=imgOf('mapmon:'+mo.art,()=>monCanvas(mo.art));drawSprite(ctx,c,X,Y+17-cy-bob,true);}
  else{const t=TPL[a.q.hero],c=walkerCanvas('leg:'+t.id,t.look,t.el,t.id,'front',0);drawSprite(ctx,c,X,Y+18-cy-bob,false);}
  ctx.fillStyle='#ffd24a';ctx.fillRect(X-1,Y-24-cy-bob,3,3);ctx.fillRect(X-3,Y-22-cy-bob,7,1);
}
// dusk for the rider, night for the wildcaller
HOOK.after('worldDraw','legends','legend markers',function(_,now){const m=WS.m,ctx=WS.ctx;if(!m||!ctx||m.kind!=='field')return;const L=legendQ(m);if(!L.length)return;
  if(L.some(q=>q.hero==='nikaris')){ctx.fillStyle='rgba(8,6,30,.42)';ctx.fillRect(0,0,WS.vw,WS.vh);}
  else if(L.some(q=>q.hero==='kaevan')){ctx.fillStyle='rgba(255,110,40,.13)';ctx.fillRect(0,0,WS.vw,WS.vh);ctx.fillStyle='rgba(60,20,80,.15)';ctx.fillRect(0,0,WS.vw,WS.vh);}});
// ----- Convergence: a 3x3 ice and lightning puzzle (lights-out rules) -----
function convInit(){const c=Array(9).fill(true);const R=Math.random;let n=0;while(n<4){const i=Math.floor(R()*9);convPress(c,i);n++;}if(c.every(Boolean))convPress(c,4);V.conv={c,moves:0,start:c.slice()};}
function convPress(c,i){const x=i%3,y=Math.floor(i/3);[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<3&&ny<3)c[ny*3+nx]=!c[ny*3+nx];});}
function mConvergence(){
  const C=V.conv;if(!C)return '';const done=C.c.every(Boolean);
  return box('Convergence',`<p class="story">The lake is a sheet of black ice. Nine runes are cut into it, some rimed with frost, some humming with lightning. In the middle, a figure in pale blue holds the storm up with one hand.</p>
    <p class="note">Touching a rune flips it and the runes next to it (not diagonals) between ❄ frost and ⚡ charge. Charge all nine to finish the circuit.</p>
    <div class="conv">${C.c.map((on,i)=>`<button class="crune ${on?'on':''}" data-act="convPress" data-arg="${i}" ${done?'disabled':''} aria-label="Rune ${i+1}: ${on?'charged':'frozen'}">${on?'⚡':'❄'}</button>`).join('')}</div>
    <p class="note nums">Moves: ${C.moves}${done?' · The circuit closes.':''}</p>`,
    done?'<button class="btn gold" data-act="convDone">Approach him</button>':'<button class="btn" data-act="convReset">Reset</button><button class="btn" data-act="closeModal">Leave</button>');
}
function mLegendEvt(m){const t=TPL[m.hero];
  return box(m.join?esc(t.title):'Something stirs',`<div class="mh"><div class="pbig leg"><img src="${m.join||m.hero==='kaevan'?heroURL(m.hero):monURL(MON[m.step?'thunderhawk':'frostwolf'].art)}" alt=""></div><div class="grow"><p class="story">${esc(m.text)}</p>${m.fight?'<p class="note">This is a tough fight. Rest first.</p>':''}</div></div>`,
    m.join?'<button class="btn gold" data-act="legendJoinBtn">Travel together</button>':`<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="legendFight">${esc(m.fight)}</button>`,true);}
function vRedeem(){
  const un=LEGEND_IDS.filter(legendOn);
  return `<p class="note">Got a code from the developer? Redeem it here to permanently unlock a Legendary hero on your account. You'll then meet them through their own quest event on a town quest board.</p>
    <label class="fbl"><span>Redeem code</span></label><input class="fbin" id="redeemIn" maxlength="64" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX">
    ${REDEEM.msg?`<p class="note ${REDEEM.ok?'okmsg':'warn'}">${esc(REDEEM.msg)}</p>`:''}
    <div class="btnrow"><button class="btn gold" data-act="redeem" ${REDEEM.busy?'disabled':''}>${REDEEM.busy?'Checking…':'Redeem'}</button></div>
    <h4>Legendary heroes</h4><div class="rows compact">${LEGEND_IDS.map(id=>{const t=TPL[id];const on=legendOn(id);return `<div class="row ${on?'':'lock'}">${on?port(id):''}<div class="grow"><b>${on?esc(t.title):'Locked legend'}</b><small>${on?`${CLS[t.cls].n} · ${TRAITS[t.trait][0]}. Look for "${esc(LEG_Q[id].title)}" on a quest board.`:'Needs a redeem code.'}</small></div></div>`;}).join('')}</div>
    ${syncNote()}`;
}
// ----- sprites: Kaevan rides a horse, Nikaris brings a wolf pup and a hawk, lesser Scourges are drawn at half size -----
function drawHorse(x,ox,oy){
  const f=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(ox+a,oy+b,w,h);};const O='#0e0804',B='#4a2a18',D='#2e1a0e',M='#141018',H='#1a1410',L='#f2d24a';
  // tail
  f(O,2,3,5,13);f(M,3,4,3,11);f(M,1,12,3,5);
  // legs
  [[9,0],[14,1],[30,0],[35,1]].forEach(([lx,sh])=>{f(O,lx-1,12,5,13);f(sh?D:B,lx,12,3,11);f(H,lx,22,3,2);});
  // body
  f(O,5,1,36,14);f(B,6,2,34,12);f(D,6,10,34,4);f('#6a3a20',8,3,28,2);
  // neck and head
  f(O,34,-10,8,14);f(B,35,-9,6,13);f(O,38,-14,12,8);f(B,39,-13,10,6);f(D,45,-10,4,3);f('#e8d8c0',47,-11,1,1);f(O,40,-16,3,3);f(B,41,-15,1,2);
  f(M,33,-11,3,12);f(M,36,-14,3,4);
  // saddle blanket with lightning trim
  f(O,13,-1,16,8);f('#2a2638',14,0,14,6);f(L,14,5,14,1);f(L,18,1,1,2);f(L,19,2,1,2);f(L,20,3,1,2);f('#3a2a5c',16,1,10,3);
}
function mountCanvas(c){const o=mkCv(54,48),x=o.getContext('2d');x.imageSmoothingEnabled=false;drawHorse(x,2,22);x.drawImage(c,0,0,36,30,9,0,36,30);
  x.fillStyle='#0e0804';x.fillRect(19,27,14,3);x.fillStyle='#2a2638';x.fillRect(20,27,12,2);x.fillStyle='#f2d24a';x.fillRect(20,29,12,1);return o;}
function petCanvas(c){const o=mkCv(46,40),x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,8,0);
  const f=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  // wolf pup sitting at his feet
  f('#0e0804',0,29,12,11);f('#6a6a7a',1,31,9,8);f('#4a4a58',1,36,9,3);f('#6a6a7a',7,27,5,5);f('#0e0804',7,26,2,2);f('#0e0804',10,26,2,2);f('#b48ae0',9,29,1,1);f('#1a1420',11,30,1,1);f('#6a6a7a',0,33,2,4);
  // hawk perched above his shoulder
  f('#0e0804',9,8,8,8);f('#5a4030',10,9,6,6);f('#3a2a20',10,12,6,3);f('#e8d8c0',12,10,3,2);f('#f2d24a',16,10,2,1);f('#0e0804',14,9,1,1);f('#2a1f18',9,10,2,5);
  return o;}
function halfCanvas(c){if(c.width<=44)return c;const o=mkCv(Math.ceil(c.width/2),Math.ceil(c.height/2)),x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,0,0,o.width,o.height);return o;}
{const hc1=heroCanvas;heroCanvas=function(id,walk){const c=hc1(id,walk),t=TPL[id];if(!t)return c;if(t.scourge)return halfCanvas(c);if(t.look&&t.look.mount)return mountCanvas(c);if(t.look&&t.look.pets)return petCanvas(c);return c;};}
{const wfb=weaponFB;weaponFB=function(g,L,view){if(L&&L.wpn==='longbow')return wfb(g,Object.assign({},L,{wpn:'bow'}),view);return wfb(g,L,view);};}
Object.assign(ACT,{
  redeemOpen(){fbOpen('redeem');},
  async redeem(){if(REDEEM.busy)return;const inp=document.getElementById('redeemIn');REDEEM.busy=true;REDEEM.msg=null;render();
    const r=await redeemCode(inp?inp.value:'');REDEEM.busy=false;REDEEM.ok=r.ok;
    REDEEM.msg=r.ok?(r.already?`${TPL[r.id].title} was already unlocked on this account.`:`Unlocked: ${TPL[r.id].title}! Look for "${LEG_Q[r.id].title}" on a town quest board.`):r.msg;
    if(r.ok&&!r.already&&typeof sfx==='function')sfx('archivist');render();},
  legendFight(){const m=V.modal,q=G.quests.find(x=>x.type==='legend'&&x.hero===m.hero);if(!q)return;V.modal=null;
    if(!startBattle({stage:q.stage,kind:'legend',hero:m.hero,step:m.step||0})){toast('Your party needs rest first.');render();}},
  legendJoinBtn(){const id=V.modal.hero;V.modal=null;legendJoin(id);render();},
  convPress(i){const C=V.conv;if(!C)return;convPress(C.c,+i);C.moves++;if(typeof sfx==='function')sfx(C.c.every(Boolean)?'react':'blip');render();},
  convReset(){const C=V.conv;if(!C)return;C.c=C.start.slice();C.moves=0;render();},
  convDone(){V.modal={type:'legendEvt',hero:'jaeson',text:'The last rune catches. Lightning runs the circuit, the ice sings, and the storm settles over the lake like a cat. The mage in pale blue lowers his hand, pushes his glasses up, and grins. "Twin weave. You saw it too. Took me a year."',join:1};render();}
});
