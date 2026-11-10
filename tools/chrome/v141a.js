// v0.14.1 fixes10.js (actors on open ground, minibosses wait at the end, rarer eye patches), endgame10.js (the Meridian Breach), anim10.js (spin, big spells).
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1280,h:800});const r=await H.ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=g('G'),o={};
 const acc=g('accOf');const ids=Object.keys(A.TPL).filter(k=>A.TPL[k].cls&&!A.TPL[k].mon&&A.TPL[k].look);const cnt={};ids.forEach(id=>{((acc(id)||{}).acc||[]).forEach(a=>cnt[a]=(cnt[a]||0)+1);});o.eye=cnt.eyepatch||0;o.heroes=ids.length;
 // field actors never on solid tiles or in a site mouth
 G.stage=2;let bad=0,n=0;for(let s=0;s<=2;s++){const f=g('getMap')('f'+s);G.bounties.filter(b=>b.stage===s).forEach(b=>b.state='active');g('dynActors')(f).forEach(a=>{n++;if(g('f10Bad')(f,a.x,a.y))bad++;});}o.actors=n;o.actorsBad=bad;
 // den: the miniboss waits at the end; the chest refuses; askBoss in a den asks the miniboss, never the Scourge
 const k=g('getMap')('k1');o.pending=g('miniPending')(k);const acts=g('dynActors')(k).filter(a=>a.mini);o.miniActor=acts.length;o.spotOpen=!!g('miniSpot')(k)&&!A.TW.get('SOLID').includes(k.t[g('miniSpot')(k)[1]][g('miniSpot')(k)[0]]);
 g('placeAt')('k1',k.prize[0],k.prize[1]+1,'u');A.WS.x=k.prize[0];A.WS.y=k.prize[1]+1;g('openChest')(k.prize[0],k.prize[1]);o.chestKept=!G.chests['k1:'+k.prize[0]+','+k.prize[1]];o.refusal=!!(A.WS.dlg&&/stands between you/.test(A.WS.dlg.text));A.WS.dlg=null;
 g('askBoss')();o.askModal=A.V.modal&&A.V.modal.type;A.V.modal=null;
 G.miniDone={k1:1};o.gone=g('dynActors')(k).filter(a=>a.mini).length;o.mimic=!!g('isMimic')(k,k.prize[0],k.prize[1]);g('openChest')(k.prize[0],k.prize[1]);o.chestOpen=!!G.chests['k1:'+k.prize[0]+','+k.prize[1]]||o.mimic;/* about 13% of Den prize chests are Mimics (mimic.js MIMIC_RATE): the ambush fires instead of the open */A.WS.dlg=null;
 const f=g('getMap')('o1');o.fortActor=g('dynActors')(f).filter(a=>a.mini).length;o.fortGuardAt=!!f.guardAt;o.sg=g('sanctGuard')(f);
 // the Breach
 o.rowBefore=(A.V.modal={type:'travel'},A.render(),!!document.querySelector('#modal [data-act=toBreach]'));G.won=true;G.visited=[0,1,2,3,4];G.lastTown=4;A.render();o.rowAfter=!!document.querySelector('#modal [data-act=toBreach]');
 const x=g('getMap')('x0');o.breach=x.breach===1&&x.kind==='field'&&g('locName')(x)==='The Meridian Breach'&&(x.caves||[]).length===0;o.exits=[...new Set((x.exits||[]).map(e=>e.to&&e.to.m))].join(',');
 A.ACT.toBreach();return o;});
 await H.wait(900);const r2=await H.ev(()=>{const A=__A,g=A.TW.get,G=g('G'),o={};o.at=A.WS.m&&A.WS.m.id;G.roster.mira.lv=44;g('refresh')(G.roster.mira);const pool=g('breachPool')();o.pool=pool.length;
  let lo=99,hi=0,elite=0,T=0;for(let i=0;i<20;i++){const foes=g('encounterFoes')({stage:4,kind:'field'});foes.forEach(e=>{T++;lo=Math.min(lo,e.lv);hi=Math.max(hi,e.lv);if(e.elite)elite++;if(!pool.includes(e.base||e.mon||'')&&!pool.some(k=>A.MON[k].n===e.name.replace(/^Breach /,'').replace(/ [A-D]$/,'')))o.strange=(o.strange||0)+1;});}o.lo=lo;o.hi=hi;o.elite=elite;o.T=T;
  G.roster.mira.lv=50;g('refresh')(G.roster.mira);o.capHi=Math.max(...g('encounterFoes')({stage:4,kind:'field'}).map(e=>e.lv));
  // spin: an all-foe physical skill rotates the hero sprite mid action
  g('startBattle')({stage:4,kind:'field'});const B=g('B');const h=B.front[0];const sk={id:'spintest',n:'Whirl',k:'phys',t:'all',pw:1,mp:0};h.actT=Date.now()-200;h.actKind='phys';h.actSk=sk;h.actSkT=h.actT;const c0=g('spriteOf')(h);h.actT=Date.now()-5000;const c1=g('spriteOf')(h);
  const px=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let s=0;for(let i=0;i<d.length;i+=97)s+=d[i]+d[i+1];return s;};o.spinDiff=px(c0)!==px(c1);o.sameSize=c0.width===c1.width&&c0.height===c1.height;
  // big spell: extra particles and a shake
  const BV=g('BV');const n0=BV.P.length;const m=B.front.find(c=>c.id==='mira')||B.front[0];m.actT=Date.now();m.actKind='mag';m.actEl='fire';m.actSk={id:'bigtest',n:'Inferno',k:'mag',t:'all',pw:2,el:'fire'};m.actSkT=m.actT;g('onAction')(m,performance.now());o.parts=BV.P.length-n0;o.shake=!!BV.shake;
  return o;});console.log(JSON.stringify(r),JSON.stringify(r2));
  chk('eye patches are rare now (at most 8 of the heroes)',r.eye<=8&&r.eye>=2||r.eye);
  chk('field actors stand on open ground, never in a wall or a site mouth',r.actors>0&&r.actorsBad===0||JSON.stringify([r.actors,r.actorsBad]));
  chk('a Den\'s miniboss waits at the end as an actor on an open tile; the Sanctum\'s stands on its rune circle (no double guard)',r.pending&&r.miniActor===1&&r.spotOpen&&r.fortActor===1&&r.fortGuardAt&&r.sg===null||JSON.stringify(r));
  chk('the prize chest refuses while the miniboss stands; A on it asks the miniboss, not the Scourge',r.chestKept&&r.refusal&&r.askModal==='miniask');
  chk('once the miniboss is down the actor is gone and the chest opens',r.gone===0&&r.chestOpen);
  chk('the Waystone offers the Meridian Breach only after the Calamity; the map is a Breach field with no dens, gates back through the Calamity field\'s broken seal (v0.15.4)',r.rowBefore===false&&r.rowAfter===true&&r.breach&&r.exits==='f4'||JSON.stringify([r.rowBefore,r.rowAfter,r.breach,r.exits]));
  chk('travelling there lands on the Breach',r2.at==='x0');
  chk('Breach fights draw from every visited realm at the party\'s level + 2 (3 to 4 foes, some elites), capped at 50',r2.pool>=15&&r2.lo>=41&&r2.hi<=46&&r2.elite>0&&r2.T>=60&&r2.capHi<=50&&!r2.strange||JSON.stringify(r2));
  chk('an all-foe physical skill spins the hero sprite (same canvas size)',r2.spinDiff&&r2.sameSize);
  chk('a big spell adds a wide show and a shake',r2.parts>=5&&r2.shake||JSON.stringify([r2.parts,r2.shake]));
  await done(H);})();
