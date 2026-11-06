// Beta v0.8.0: the battle screen on phones and the Galaxy Z Fold (open and closed), and the battle transition.
// The owner's report (Galaxy Z Fold 8): open (933 px wide, 620 to 705 px of visible viewport), a miniboss fight with "Summon Bloodmoon" and
// "Auto locked / No auto in miniboss fights": the party column scrolled, the foes panel squeezed to an empty strip, the stage small. Closed
// (cover screen 344x882) and other tall phones: "Can't even see my attack options without scrolling". The transition into battle looked
// zoomed in on its top left quarter.
// Checks, at 344x882, 360x780, 390x844, 412x915, 933x620, 933x660, 933x705, 1280x720, in a miniboss fight (boss bar, summon button, the
// auto lock note, 6 heroes, 5 foes), a field fight with 6 heroes and 5 foes, and a small one (3 heroes, 2 foes), at the start of four hero
// turns each: the page does not scroll (document height <= viewport), Attack / Skills / Items / Guard fully on screen and not clipped by a
// scrolling panel, the turn order bar, the stage and the acting hero's card on screen, the stage at least its minimum (wide 150*B3.wideMin
// px tall, i.e. 1.1x of 150 = 165 px; portrait 240 px), every live foe's card fully visible in the wide layout (or the compact foe list on
// portrait phones), no text cut. Then the transition: the encounter swirl, sampled from the world canvas mid-animation in the real game
// loop, on Low, Medium and High and with the 2D world renderer on Medium, is centred and reaches all four quarters.
// Then the damage type symbols (a later owner request in the same pass): six distinct code-drawn symbols; a foe card shows the foe's
// delivery weaknesses and resistances from its archetypes (an armored foe: weak to Piercing and Magic, resists Slash, Blunt and Ranged;
// an undead one: weak to Blunt and Heal) only once the foe type is hit or scanned, the names in the tooltip; the skill list's delivery chip
// is the symbol; the aim tag shows the archetype arrow with the symbol; nothing cut, at 344x882, 933x620, 1280x720.
// Then the battle start (owner: "the enemies kept shifting their position before the battle actually started"): at every size, a miniboss
// and a field fight started for real, sampled every frame for 2 s and until just after the first hero turn: the stage's box and every
// foe's place on the screen never change.
// Fails on the build before this pass, passes now.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v080b.js [shots] [layout|trans|dl|settle]   (shots: shots-v080b/, SHOTPFX=prefix)
const {open,chk,done}=require('./pw');const {META,battle,dress}=require('./v063lib');
const SHOTS=process.argv.includes('shots'),ONLY=process.argv.find(a=>a==='layout'||a==='trans'||a==='dl'||a==='settle'),fs=require('fs'),DIR=__dirname+'/shots-v080b',PFX=process.env.SHOTPFX||'';
if(SHOTS)fs.mkdirSync(DIR,{recursive:true});
const SIZES=process.env.SIZES?process.env.SIZES.split(',').map(s=>s.split('x').map(Number)):[[344,882],[360,780],[390,844],[412,915],[933,620],[933,660],[933,705],[1280,720]];
const CASES=[['mini',6,5],['field',6,5],['field',3,2]];
const MEASURE=()=>{const out={bad:[]},vis=e=>{const q=e.getBoundingClientRect();return q.width>0&&q.height>0;};
  const NAME='.uct b,.cmdhead b,.bbn b,.b4o .n,.blog p,.detf,.fl .n';
  document.querySelectorAll('.battle *').forEach(e=>{if(e.closest('#bstage')||e.closest('#bover')||!vis(e)||/^(IMG|CANVAS|svg)$/i.test(e.tagName))return;
    const txt=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()),btn=e.tagName==='BUTTON';if(!txt&&!btn&&!e.classList.contains('ptags'))return;
    if(e.classList.contains('port')||e.classList.contains('oc'))return;
    const cs=getComputedStyle(e),overX=e.scrollWidth>e.clientWidth+1,overY=btn&&e.scrollHeight>e.clientHeight+2&&cs.overflowY!=='visible';
    if(!overX&&!overY)return;if(overX&&!overY&&e.matches(NAME)&&cs.textOverflow==='ellipsis')return;
    out.bad.push((e.className||e.tagName)+' "'+e.textContent.trim().replace(/\s+/g,' ').slice(0,24)+'" '+e.scrollWidth+'/'+e.clientWidth+(overY?' h'+e.scrollHeight+'/'+e.clientHeight:''));});
  const R=e=>{if(typeof e==='string')e=document.querySelector(e);if(!e||!vis(e))return null;const q=e.getBoundingClientRect();return {l:q.left,t:q.top,r:q.right,b:q.bottom,w:q.width,h:q.height};};
  // an element is "shown" when it is inside the viewport and inside every clipping (scrolling) ancestor's visible box
  const shown=e=>{if(!e||!vis(e))return false;const q=e.getBoundingClientRect();if(q.top<-1||q.left<-1||q.bottom>innerHeight+1||q.right>innerWidth+1)return false;
    for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){const cs=getComputedStyle(p);if(cs.display==='contents')continue;if(/(auto|scroll|hidden)/.test(cs.overflowY+cs.overflowX)){const c=p.getBoundingClientRect();
      if(q.top<c.top-1||q.bottom>c.bottom+1||q.left<c.left-1||q.right>c.right+1)return false;}}return true;};
  const A=__A,B=A.B;out.mode=A.BL.mode;out.cls=[...document.querySelector('.battle').classList].filter(c=>/^(m-|b8)/.test(c)).join(' ');out.docH=document.documentElement.scrollHeight;out.docW=document.documentElement.scrollWidth;out.vw=innerWidth;out.vh=innerHeight;out.scrollY=scrollY;
  out.prim=[...document.querySelectorAll('#bcmd .menu.prim .mi')].map(e=>({t:e.textContent.trim(),ok:shown(e)}));
  out.order=R('#border');out.orderOk=shown(document.getElementById('border'));out.stage=R('#bwrap');out.stageOk=shown(document.getElementById('bwrap'));
  const cur=B.cur,cards=[...document.querySelectorAll('#bparty .pgroup.heroes .pcw')];out.curName=cur&&cur.name;
  const cc=cards.find(c=>c.querySelector('.pc.turn'))||cards[B.front.indexOf(cur)];out.curOk=!!cc&&shown(cc);
  const live=B.en.filter(e=>e.hp>0).length;out.live=live;const fcw=[...document.querySelectorAll('#bparty .pgroup.foes .fcw')];out.foeCards=fcw.length;out.foeShown=fcw.filter(shown).length;
  const fl=document.querySelector('#bparty .b8fl');out.foeList=fl?[...fl.querySelectorAll('.fl')].filter(shown).length:0;
  out.foes=R('#bparty .pgroup.foes');out.summon=!!document.querySelector('#bcmd .mi.summon');out.autowhy=R('#bcmd .autowhy');out.boss=!!document.querySelector('.battle.hasboss');
  out.vrows=[...document.querySelectorAll('#bparty .pgroup.heroes .pcw')].map(shown);
  out.inner=['#bparty .b3pty','#bparty .pgroup.foes>.fcs'].map(q=>document.querySelector(q)).filter(e=>e&&vis(e)&&e.scrollHeight>e.clientHeight+2).map(e=>(e.id||e.className)+' '+e.scrollHeight+'/'+e.clientHeight);
  // a card's status / weakness row stays in the card's bottom padding, never over its name or bars
  document.querySelectorAll('#bparty .pcw.hastags').forEach(c=>{const t=c.querySelector('.ptags'),m=c.querySelector('.pm');if(!t||!m||!vis(t)||!vis(m)||!t.children.length)return;const a=t.getBoundingClientRect(),b=m.getBoundingClientRect();
    if(a.top<b.bottom-1&&a.bottom>b.top+1&&a.left<b.right-1&&a.right>b.left+1)out.bad.push('card row over the card: "'+c.textContent.trim().replace(/\s+/g,' ').slice(0,20)+'"');});
  out.taps=[...document.querySelectorAll('#bcmd .menu.prim .mi')].filter(vis).map(e=>Math.round(e.getBoundingClientRect().height)).filter(h=>h<40).length;
  return out;};
async function heroTurn(H){// Guard, then let the fight run until the next hero command turn
  await H.ev(async()=>{const A=__A,B=A.B,t0=B.cur;A.setPause(60);A.ACT.cmd('guard');
    const T0=B.time,L0=B.log.length;for(let i=0;i<250;i++){await new Promise(q=>setTimeout(q,40));if(B.over)break;if((B.time!==T0||B.log.length!==L0)&&B.mode==='cmd'&&B.cur&&B.cur.side==='p'&&!B.cur.isComp)break;}
    A.setPause(99999);A.render();});await H.wait(380);}
async function setup(H,kind,he,fo,seed){
  const b=await battle(H,kind==='mini'?{heroes:he,boss:1,foes:fo,stage:1,seed,lv:22}:{heroes:he,foes:fo,seed,lv:22});
  await dress(H,{seed:seed+2,maxSt:2,prime:.5,shield:.5});
  await H.ev(k=>{const A=__A,B=A.B,G=A.G;if(k==='mini'){B.spec.mini={id:'x',mon:B.en[0].art,name:'Bloodmoon Warden'};B.auto=false;}
    // a companion paired with every Vanguard hero: the "Summon ..." command
    const mk=Object.keys(A.MON).find(x=>!A.MON[x].mimic);G.tamed=B.front.concat(B.back).map((c,i)=>({id:'tm'+i,mon:mk,name:'Bloodmoon',with:c.id,cls:'warrior'}));
    // every foe type known (hit and its element weaknesses learned): the foe cards carry their longest Weak / Res rows (elements and damage types)
    if(A.EL&&A.effOf)B.en.forEach(e=>{const M=A.META.best=A.META.best||{},b=M[e.base]=M[e.base]||{};b.seen=1;b.hit=1;b.known=b.known||{};Object.keys(A.EL).forEach(el=>{try{if(A.effOf(el,e)!==1)b.known[el]=1;}catch(x){}});});
    A.render();},kind);await H.wait(400);return b;}
(async()=>{
  if(!ONLY||ONLY==='layout')for(const [w,h] of SIZES){const wide=w>=560;
    for(const [kind,he,fo] of CASES){const H=await open({w,h,mobile:w<1000,pre:META('medium')}),tag=`${w}x${h} ${kind} ${he}h/${fo}f`;
      const b=await setup(H,kind,he,fo,11*he+fo);if(b.mode!=='cmd'){chk(`${tag}: battle ready`,'mode '+b.mode);await H.browser.close();continue;}
      for(let turn=0;turn<4;turn++){if(turn)await heroTurn(H);const st=await H.ev(()=>({mode:__A.B.mode,over:__A.B.over,side:__A.B.cur&&__A.B.cur.side}));if(st.over||st.mode!=='cmd'||st.side!=='p')break;
        const m=await H.ev(MEASURE),t=`${tag} turn ${turn+1} (${m.curName})`;
        if(turn===0)console.log(`LAYOUT ${w}x${h} ${kind} ${he}h/${fo}f: stage ${Math.round(m.stage.w)}x${Math.round(m.stage.h)}, document ${m.docH}/${m.vh}, ${m.cls}`);
        if(SHOTS&&turn===0)await H.page.screenshot({path:`${DIR}/${PFX}${w}x${h}_${kind}_${he}h${fo}f.png`});
        if(turn===0&&kind==='mini')chk(`${t}: the scene has the boss bar, the summon button and the auto lock note`,m.boss&&m.summon&&!!m.autowhy||JSON.stringify({boss:m.boss,summon:m.summon,why:m.autowhy}));
        chk(`${t}: the page does not scroll (document ${m.docH} <= ${m.vh}, ${m.docW} <= ${m.vw})`,m.docH<=m.vh+.5&&m.docW<=m.vw+1&&m.scrollY===0);
        chk(`${t}: Attack, Skills, Items and Guard fully on screen`,m.prim.length===4&&m.prim.every(p=>p.ok)||JSON.stringify(m.prim));
        chk(`${t}: the turn order bar, the stage and the acting hero's card on screen`,m.orderOk&&m.stageOk&&m.curOk||JSON.stringify({o:m.orderOk,s:m.stageOk,c:m.curOk}));
        const minH=wide?165:240;chk(`${t}: the stage is at least ${minH} px tall (${Math.round(m.stage.h)}x${Math.round(m.stage.w)})`,m.stage.h>=minH-.5);
        if(wide){chk(`${t}: every live foe's card fully shown (${m.foeShown} of ${m.live})`,m.foeShown>=m.live&&m.live>0||JSON.stringify({shown:m.foeShown,cards:m.foeCards,live:m.live,foes:m.foes}));
          chk(`${t}: every Vanguard row shown (nothing scrolls inside its panel)`,m.vrows.every(Boolean)&&m.inner.length===0||JSON.stringify({rows:m.vrows,inner:m.inner}));}
        else chk(`${t}: every live foe in view (cards or the compact foe list: ${m.foeShown}/${m.foeList} of ${m.live})`,Math.max(m.foeShown,m.foeList)>=m.live);
        chk(`${t}: command buttons 40 px or taller`,m.taps===0||m.taps);
        chk(`${t}: no text cut`,m.bad.length===0||m.bad.slice(0,5).join(' | '));}
      await H.browser.close();}}
  // the transition into battle: the encounter flash and swirl, drawn by the real game loop
  if(!ONLY||ONLY==='trans')for(const [gfx,hd] of [['low',true],['medium',true],['medium',false],['high',true]])for(const [w,h] of [[390,844],[344,882],[933,640],[1280,720]]){
    const H=await open({w,h,mobile:w<1000,dpr:2,pre:META(gfx,{hd2d:hd})});
    await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;Object.keys(A.G.weather||{}).forEach(k=>A.G.weather[k]='clear');A.render();});
    await H.wait(1800);
    const r=await H.ev(async()=>{const A=__A,WS=A.WS,cv=WS.cv,RW=cv._rw||cv.width,RH=cv._rh||cv.height,ctx=cv.getContext('2d');
      // the swirl's arms are near black: count the pixels that turned near black since the frame before the flash (the scene's own dark ones are left out)
      const dk=(d,i)=>d[i+3]>200&&d[i]<14&&d[i+1]<10&&d[i+2]<22;WS.lock=true;await new Promise(q=>requestAnimationFrame(()=>requestAnimationFrame(q)));const d0=ctx.getImageData(0,0,RW,RH).data;
      WS.flash=performance.now();const out=[];
      for(let f=0;f<60&&out.length<3;f++){await new Promise(q=>requestAnimationFrame(q));const p=(performance.now()-WS.flash)/460;if(p<.28||p>.85)continue;
        const d=ctx.getImageData(0,0,RW,RH).data;let q=[0,0,0,0],sx=0,sy=0,n=0;
        for(let y=1;y<RH;y+=4)for(let x=1;x<RW;x+=4){const i=(y*RW+x)*4;if(dk(d,i)&&!dk(d0,i)){n++;sx+=x;sy+=y;q[(y<RH/2?0:2)+(x<RW/2?0:1)]++;}}
        out.push({p:+p.toFixed(2),cx:n?+(sx/n/RW).toFixed(2):-1,cy:n?+(sy/n/RH).toFixed(2):-1,q});}
      WS.lock=false;const css=cv.getBoundingClientRect();return {hd:!!(A.HD&&A.HD.live),k:cv._ss||1,out,cover:[css.left,css.top,css.width,css.height].map(Math.round)};});
    const tag=`transition ${gfx}${hd?'':' (2D world)'} ${w}x${h} (${r.hd?'HD-2D':'2D'} renderer, backing x${r.k})`;
    chk(`${tag}: frames sampled mid-transition`,r.out.length>0||'none');
    for(const f of r.out){chk(`${tag} p=${f.p}: the swirl is centred (${f.cx}, ${f.cy}) and reaches every quarter (${f.q.join('/')})`,
      Math.abs(f.cx-.5)<.08&&Math.abs(f.cy-.5)<.08&&Math.min(...f.q)>=Math.max(...f.q)*.4&&Math.min(...f.q)>0||JSON.stringify(f));}
    if(SHOTS){await H.ev(async()=>{const WS=__A.WS;WS.flash=performance.now()-180;WS.lock=true;await new Promise(q=>requestAnimationFrame(()=>requestAnimationFrame(q)));});
      await H.page.screenshot({path:`${DIR}/${PFX}trans_${gfx}${hd?'':'2d'}_${w}x${h}.png`});await H.ev(()=>{__A.WS.lock=false;});}
    await H.browser.close();}
  // damage type symbols: one per delivery, on foe cards (once the foe type is known), in the skill list and on aim tags
  if(!ONLY||ONLY==='dl')for(const [w,h] of [[344,882],[933,620],[1280,720]]){const H=await open({w,h,mobile:w<1000,pre:META('medium')}),tag=`${w}x${h} damage types`;
    await battle(H,{heroes:4,foes:3,seed:5,lv:22});
    const r=await H.ev(()=>{const A=__A,B=A.B,out={};
      const ds=Object.keys(A.DL_NAME),urls=ds.map(d=>{const t=document.createElement('div');t.innerHTML=A.dlIco(d);const i=t.querySelector('img');return i?i.src:'';});
      out.ico=urls.every(u=>u.startsWith('data:image')||u.startsWith('blob:'))&&new Set(urls).size===ds.length;
      // the symbol canvases are drawn (opaque pixels), each different
      // an armored foe (weak to piercing and magic, resists slash, blunt and ranged) and an undead one (weak to blunt and healing)
      const arm=B.en[0],und=B.en[1];arm.ty=['armored'];und.ty=['undead'];const M=A.META.best;[arm,und].forEach(e=>{const b=M[e.base]=M[e.base]||{};delete b.hit;delete b.scan;});A.render();
      const dls=i=>{const c=document.querySelectorAll('#bparty .pgroup.foes .fcw')[i];return c?{up:[...c.querySelectorAll('.fwk.up img.dli')].map(x=>x.alt),dn:[...c.querySelectorAll('.fwk.dn img.dli')].map(x=>x.alt)}:null;};
      out.hidden=dls(0);[arm,und].forEach(e=>{M[e.base].hit=1;});A.render();out.arm=dls(0);out.und=dls(1);
      out.title=(document.querySelector('#bparty .pgroup.foes .fcw .fwk.dn')||{}).title||'';
      // the skill list: the delivery chip is the symbol, the name in its tooltip
      A.ACT.cmd('skills');const chip=document.querySelector('#bcmd .menu.list em.dl');out.chip=chip?{img:!!chip.querySelector('img.dli'),title:chip.title,txt:chip.textContent.trim()}:null;
      // the aim tag on the armored foe for a Slash attack: a down arrow and the Slash symbol
      B.menu='root';B.pend=null;A.render();A.ACT.cmd('attack');A.render();const tg=[...document.querySelectorAll('#bstage .b3tg')].map(t=>({arch:!!t.querySelector('.eff.arch img.dli'),alt:(t.querySelector('.eff.arch img.dli')||{}).alt,txt:t.textContent}));
      out.tags=tg;return out;});
    chk(`${tag}: six distinct code-drawn symbols`,r.ico===true);
    chk(`${tag}: hidden on the card until the foe type is hit or scanned`,r.hidden&&r.hidden.up.length===0&&r.hidden.dn.length===0||JSON.stringify(r.hidden));
    chk(`${tag}: an armored foe's card: weak to Piercing and Magic, resists Slash, Blunt and Ranged (${JSON.stringify(r.arm)})`,!!r.arm&&r.arm.up.join()==='Piercing,Magic'&&r.arm.dn.join()==='Slash,Blunt,Ranged');
    chk(`${tag}: an undead foe's card: weak to Blunt and Heal (${JSON.stringify(r.und)})`,!!r.und&&r.und.up.includes('Blunt')&&r.und.up.includes('Heal'));
    chk(`${tag}: the names stay in the tooltip ("${r.title}")`,/Slash/.test(r.title)&&/Ranged/.test(r.title));
    chk(`${tag}: the skill list's delivery chip is the symbol, named in its tooltip`,!!r.chip&&r.chip.img&&/Delivery: /.test(r.chip.title)&&r.chip.txt===''||JSON.stringify(r.chip));
    chk(`${tag}: the aim tag on the armored foe shows the archetype arrow with the delivery symbol`,r.tags.some(t=>t.arch)||JSON.stringify(r.tags));
    const m=await H.ev(()=>{const A=__A;A.B.menu='root';A.B.pend=null;A.render();return null;});await H.wait(300);const mm=await H.ev(MEASURE);
    chk(`${tag}: no text cut with the symbols on the cards`,mm.bad.length===0||mm.bad.slice(0,5).join(' | '));
    if(SHOTS)await H.page.screenshot({path:`${DIR}/${PFX}${w}x${h}_dltypes.png`});
    await H.browser.close();}
  // the battle start settles in one go: from the first frame for 2 s (and until 0.6 s after the first hero turn opens the commands), every
  // foe's place on the screen (the stage's box plus its slot, without the scripted entry and attack offsets) and the stage's size never change
  if(!ONLY||ONLY==='settle')for(const [w,h] of SIZES)for(const kind of ['mini','field']){const H=await open({w,h,mobile:w<1000,pre:META('medium')}),tag=`${w}x${h} ${kind} battle start`;
    const r=await H.ev(async k=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;
      const extra=Object.keys(A.TPL).filter(id=>!G.party.includes(id)&&!A.TPL[id].mon&&!A.TPL[id].legend&&A.TPL[id].src);for(let i=0;G.party.length<6&&i<extra.length;i++)A.recruit(extra[i*3%extra.length],true);
      const mk=Object.keys(A.MON).find(x=>!A.MON[x].mimic);G.tamed=G.party.map((id,i)=>({id:'tm'+i,mon:mk,name:'Bloodmoon',with:id,cls:'warrior'}));
      const MK=Object.keys(A.MON).filter(x=>!A.MON[x].mimic);
      A.startBattle(k==='mini'?{stage:1,kind:'boss',weather:'clear',mini:{id:'x',mon:mk,name:'Warden'}}:{stage:0,kind:'field',weather:'clear',foes:[0,1,2,3,4].map(i=>A.makeEnemy(A.MON[MK[i*7%MK.length]],4))});
      const B=A.B,F=[],t0=performance.now();let cmdT=-1;
      for(let f=0;f<900;f++){await new Promise(q=>requestAnimationFrame(q));const t=performance.now()-t0,st=document.getElementById('bwrap');if(!st||A.B!==B)break;const sc=A.BL.sc;
        // layout boxes (offsets), not transformed ones: a hit's camera shake and zoom are scripted animation
        let L=0,T=0;for(let e=st;e;e=e.offsetParent){L+=e.offsetLeft;T+=e.offsetTop;}const R={left:L+st.clientLeft,top:T+st.clientTop,width:st.clientWidth,height:st.clientHeight};
        F.push({t:Math.round(t),st:[R.left,R.top,R.width,R.height].map(v=>Math.round(v*10)/10),u:B.en.filter(e=>e.hp>0).map(e=>{const b=A.unitBox(e);return b?[Math.round((R.left+b.x*sc)*10)/10,Math.round((R.top+b.y*sc)*10)/10]:null;})});
        if(cmdT<0&&B.mode==='cmd'&&B.cur&&B.cur.side==='p')cmdT=t;if(t>2000&&(cmdT>=0&&t>cmdT+600||t>9000))break;}
      return {F,cmdT:Math.round(cmdT)};},kind);
    const F=r.F,f0=F[0];let moved=[],stg=[];
    F.forEach(f=>{if(f.st.join()!==f0.st.join()&&stg.length<3)stg.push(f.t+'ms '+f.st.join(','));f.u.forEach((p,i)=>{const q=f0.u[i];if(p&&q&&(Math.abs(p[0]-q[0])>.6||Math.abs(p[1]-q[1])>.6)&&moved.length<3)moved.push(`${f.t}ms foe ${i} ${q.join(',')} -> ${p.join(',')}`);});});
    chk(`${tag}: ${F.length} frames over ${F.length?F[F.length-1].t:0} ms (first hero turn at ${r.cmdT} ms): the stage keeps its size and place`,F.length>20&&stg.length===0||(stg.join(' | ')||'frames '+F.length+', turn '+r.cmdT));
    chk(`${tag}: no foe moves on the screen`,moved.length===0||moved.join(' | '));
    if(SHOTS)await H.page.screenshot({path:`${DIR}/${PFX}${w}x${h}_${kind}_start.png`});
    await H.browser.close();}
  const H=await open({});await done(H);})();
