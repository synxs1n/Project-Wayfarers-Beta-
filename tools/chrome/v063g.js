// Beta v0.6.3 progression goals (v063prog.js): the Taming log in the Bestiary, bond goals on the real counter, Make camp
// (heals less than the inn, one boon for CAMP.dur battles, blocked in town and the Daily Trial), and layouts at 390x844 and 933x705.
const {open,chk,done}=require('./pw');
const SIZES=[[390,844,true],[933,705,false]];
async function setup(ev){await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.hints=false;A.render();});}
// no clipped text in the open modal: every text element fits its box horizontally, and nothing runs off the panel
const clipCheck=()=>{const p=document.querySelector('#modal .panel');if(!p)return 'no panel';const pr=p.getBoundingClientRect(),bad=[];
  if(pr.right>innerWidth+1||pr.left<-1)bad.push('panel '+Math.round(pr.left)+'..'+Math.round(pr.right));
  if(p.scrollWidth>p.clientWidth+2)bad.push('panel scrolls sideways '+p.scrollWidth+'>'+p.clientWidth);
  p.querySelectorAll('b,small,button,p,em,h4').forEach(e=>{if(!e.offsetParent)return;const s=getComputedStyle(e);if(e.scrollWidth>e.clientWidth+2&&s.overflow!=='visible'&&s.textOverflow!=='clip')bad.push((e.textContent||'').slice(0,30)+' '+e.scrollWidth+'>'+e.clientWidth);
    const r=e.getBoundingClientRect();if(r.width&&(r.right>pr.right+1||r.left<pr.left-1))bad.push('outside: '+(e.textContent||'').slice(0,30));});
  return bad.length?bad.slice(0,4).join(' | '):true;};

(async()=>{
const H=await open({w:390,h:844,mobile:true,dpr:2});const {ev,wait,page}=H;
await setup(ev);await wait(400);

// ---------- 1. taming log ----------
const t=await ev(()=>{const A=__A,X=__V063,G=A.G,o={};A.META.best={};
  const L=X.tameList();o.all=L.length;o.c0=X.tameCounts();
  // see two, tame one of them
  A.META.best[L[0].n]={seen:1,kills:0,known:{}};A.META.best[L[1].n]={seen:1,kills:0,known:{}};
  A.tameElite({mon:L[0].o.k,name:L[0].n+' the Test'});o.c1=X.tameCounts();o.log=Object.keys(G.tameLog||{});
  A.ACT.menuTab('beasts');A.ACT.bview('tame');const m=document.querySelector('#modal');
  o.head=(m.querySelector('.tlhead b')||{}).textContent;o.tamedTiles=m.querySelectorAll('.btile.tlt').length;o.seenTiles=m.querySelectorAll('.btile.tls').length;
  o.sil=m.querySelectorAll('.btile.unk img.tlsil').length;const s=m.querySelector('.btile.unk img.tlsil');o.silF=s?getComputedStyle(s).filter:'';
  o.unkName=[...m.querySelectorAll('.btile.unk b')].every(b=>b.textContent==='???');
  const st=m.querySelector('.btile.tls .tlw');o.where=st?st.textContent:'';
  o.unkWhere=[...m.querySelectorAll('.btile.unk')].some(e=>/Roams/.test(e.textContent));
  A.ACT.bview('all');o.backAll=!!document.querySelector('#modal .btiles')&&!document.querySelector('#modal .tlhead');
  return o;});
console.log(JSON.stringify(t));
chk('taming log lists the tameable foes',t.all>20||t.all);
chk('counts start at zero tamed',t.c0.tamed===0||JSON.stringify(t.c0));
chk('taming one raises Tamed to 1 of Y',t.c1.tamed===1&&t.c1.all===t.all&&t.head===`Tamed 1 of ${t.all}`||JSON.stringify([t.c1,t.head]));
chk('a tame is remembered in G.tameLog',t.log.length===1||t.log);
chk('one tamed tile and one seen tile',t.tamedTiles===1&&t.seenTiles===1||[t.tamedTiles,t.seenTiles]);
chk('unseen foes are silhouettes named ???',t.sil===t.all-2&&/brightness\(0\)/.test(t.silF)&&t.unkName||[t.sil,t.silF]);
chk('a seen foe says where it roams',/^Roams /.test(t.where)||t.where);
chk('an unseen foe does not say where',t.unkWhere===false);
chk('the Bestiary view comes back',t.backAll===true);

// ---------- 2. bond goals ----------
const b=await ev(()=>{const A=__A,X=__V063,G=A.G,o={};const bd=A.BONDS[0];[bd.a,bd.b].forEach(id=>{if(!G.roster[id])G.roster[id]=A.newChar(id,5,0);});
  const k=A.bondKey(bd.a,bd.b);G.bonds[k]=1;o.g1=X.bondGoal(k);G.bonds[k]=6;o.g6=X.bondGoal(k);G.bonds[k]=25;o.g25=X.bondGoal(k);G.bonds[k]=2;
  o.lv=A.BONDS.length;A.V.modal={type:'char',char:bd.a};A.render();o.sheet=[...document.querySelectorAll('#modal .bgoal')].map(e=>e.textContent);
  A.ACT.bondsOpen();o.bondsRows=document.querySelectorAll('#modal .bdall').length;o.bondsText=(document.querySelector('#modal .bdall .bgoal')||{}).textContent;
  // a talk becomes ready: a toast says so once back in the world
  A.V.modal=null;G.talkN=G.talks.length;A.render();G.talks.push({k,lv:1});A.render();o.toast=document.getElementById('toast').textContent;o.talkN=G.talkN;
  o.btn=!!document.querySelector('[data-act="bondsOpen"]')||null;A.ACT.menuTab('party');o.partyBtn=!!document.querySelector('#modal [data-act="bondsOpen"]');return o;});
console.log(JSON.stringify(b));
chk('goal at 1 win: 3 more until the campfire talk',/^3 more wins side by side until the campfire talk/.test(b.g1.text)&&b.g1.n===3||b.g1.text);
chk('goal at 6 wins: joint tech in 4, next talk count matches',b.g6.next==='joint tech'&&b.g6.n===4&&(b.g6.talkIn===null||b.g6.talkIn===14)||JSON.stringify(b.g6));
chk('a maxed bond says so',b.g25.done===1);
chk('the hero sheet shows the goal from the real counter',b.sheet.some(s=>/^2 more wins side by side until the campfire talk/.test(s))||b.sheet);
chk('the Bonds page lists the pair with its goal',b.bondsRows>=1&&/more wins side by side/.test(b.bondsText||'')||[b.bondsRows,b.bondsText]);
chk('a toast says a campfire talk is ready',/Campfire talk ready/.test(b.toast)&&b.talkN>=1||b.toast);
chk('the Party tab has a Bonds button',b.partyBtn===true);

// ---------- 3. camp ----------
const c=await ev(()=>{const A=__A,X=__V063,G=A.G,o={};A.V.modal=null;G.stage=2;
  // in town: blocked
  G.inv.campkit=3;A.placeAt('t0',...(A.innSpot?A.innSpot(0):[10,10]),'d');A.render();o.town=A.travelWhyNot('campkit');
  // shop sells it from the third realm
  o.shop=A.alchStock().includes('campkit');G.stage=0;o.shop0=A.alchStock().includes('campkit');G.stage=2;
  // field
  const f=A.getMap('f0');A.placeAt('f0',f.ent[0],f.ent[1]+1,'d');A.V.screen='world';A.render();o.field=A.travelWhyNot('campkit');
  const P=A.G.party.map(id=>G.roster[id]);P.forEach(c=>{c.hp=Math.round(c.S.mhp*.3);c.mp=0;});const hp0=P.map(c=>c.hp);
  A.useTravel('campkit');o.modal=A.V.modal&&A.V.modal.type;o.buffBtns=document.querySelectorAll('#modal .campbuff').length;
  A.ACT.campPick('atk');o.done=A.V.modal&&A.V.modal.done;o.kits=G.inv.campkit;
  o.healPct=P.map((c,i)=>(c.hp-hp0[i])/c.S.mhp);o.camp=Object.assign({},G.camp);
  o.cool=A.travelWhyNot('campkit');
  // inn for comparison
  P.forEach(c=>c.hp=Math.round(c.S.mhp*.3));const h1=P.map(c=>c.hp);G.gold=99999;A.restAll(0);
  o.innPct=P.map((c,i)=>(c.hp-h1[i])/c.S.mhp);
  return o;});
console.log(JSON.stringify(c));
chk('camp is blocked in town',/town/i.test(c.town)||c.town);
chk('Alchemy sells Camp Supplies from the third realm, not before',c.shop===true&&c.shop0===false||[c.shop,c.shop0]);
chk('camp is allowed in the field',c.field===''||c.field);
chk('the camp screen offers four boons',c.modal==='camp'&&c.buffBtns===4||[c.modal,c.buffBtns]);
chk('picking a boon makes camp and uses one kit',c.done===1&&c.kits===2&&c.camp.b==='atk'&&c.camp.left===3||JSON.stringify(c));
chk('camp heals 25% of max HP',c.healPct.every(p=>Math.abs(p-.25)<.02)||c.healPct);
chk('camp heals less than the inn',c.innPct.every((p,i)=>p>c.healPct[i]+.2)||[c.innPct,c.healPct]);
chk('a second camp right away waits for battles',/battle/.test(c.cool)||c.cool);

// boon: applies for 3 battles, then expires
const bf=await ev(async()=>{const A=__A,G=A.G,o={runs:[]};A.setPause(0);
  for(let i=0;i<4;i++){A.G.party.forEach(id=>{const c=G.roster[id];c.hp=c.S.mhp;c.mp=c.S.mmp;});A.V.modal=null;A.V.screen='world';
    A.startBattle({stage:0,kind:'field',weather:'clear'});const u=A.B.front[0],base=A.calcStats(u);o.runs.push({ratio:+(u.S.atk/base.atk).toFixed(3),left:G.camp.left,camp:A.B._camp||null});
    A.finishBattle('fled');}
  {const f=A.getMap('f0');A.placeAt('f0',f.ent[0],f.ent[1]+1,'d');A.V.screen='world';}o.after=+(G.roster[G.party[0]].S.atk/A.calcStats(G.roster[G.party[0]]).atk).toFixed(3);o.cool=A.travelWhyNot('campkit');return o;});
console.log(JSON.stringify(bf));
chk('boon raises attack 10% in each of the next 3 battles',bf.runs.slice(0,3).every(r=>r.ratio===1.1&&r.camp==='atk')||JSON.stringify(bf.runs));
chk('boon counts down 2, 1, 0',bf.runs.slice(0,3).map(r=>r.left).join()==='2,1,0'||bf.runs.map(r=>r.left).join());
chk('boon is gone in the 4th battle',bf.runs[3].ratio===1&&bf.runs[3].camp===null||JSON.stringify(bf.runs[3]));
chk('stats return to normal after a boosted battle',bf.after===1||bf.after);
chk('after battles, camp is allowed again',bf.cool===''||bf.cool);

// daily trial blocks camping
const d=await ev(()=>{const A=__A,G=A.G;const was=G.daily;G.daily=1;const w=A.travelWhyNot('campkit');let x=null;try{x=A.alchStock().includes('campkit');}catch(e){}G.daily=was;return {w,x};});
chk('camp is blocked in the Daily Trial',/Daily/.test(d.w)&&d.x===false||JSON.stringify(d));

// ---------- layouts ----------
for(const [w,h] of SIZES){await page.setViewportSize({width:w,height:h});
  const R=await ev(([cc])=>{const A=__A,G=A.G,out={};const fit=eval(cc);
    const f=A.getMap('f0');A.placeAt('f0',f.ent[0],f.ent[1]+1,'d');A.V.screen='world';G.camp=null;G.inv.campkit=2;
    A.V.modal={type:'camp'};A.render();out.camp=fit();
    A.ACT.campPick('def');out.campDone=fit();
    A.ACT.bondsOpen();out.bonds=fit();
    A.ACT.menuTab('beasts');A.ACT.bview('tame');out.tame=fit();
    A.ACT.menuTab('party');out.party=fit();
    const bd=A.BONDS[0];A.V.modal={type:'char',char:bd.a};A.render();out.sheet=fit();
    A.V.modal=null;A.render();return out;},[clipCheck.toString().replace(/^\(\)=>/,'()=>')].map(s=>'('+s+')'));
  Object.keys(R).forEach(k=>chk(`${w}x${h} ${k} fits with no clipped text`,R[k]));
  await ev(()=>{__A.V.modal={type:'camp'};__A.render();});await wait(200);await page.screenshot({path:__dirname+`/shots-v053/v063_camp_${w}.png`});
  await ev(()=>{__A.ACT.menuTab('beasts');__A.ACT.bview('tame');});await wait(200);await page.screenshot({path:__dirname+`/shots-v053/v063_tamelog_${w}.png`});
}
await done(H);})();
