// v0.16.2 arena11.js: arena score per tier + medals + Records "Arena medals collected" + the Weekly Trial (ISO week key, Weekly text, best per week).
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v149a.js [shots]   (shots: SHOTDIR=/dir for 390x844 screenshots)
const {open,chk,done}=require('./pw');
const SHOTS=process.env.SHOTDIR;
(async()=>{const H=await open({w:390,h:844,mobile:true,out:SHOTS});const {ev}=H;
const r=await ev(()=>{const A=__A,g=A.TW.get,o={};A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=g('G');
 G.cleared=[1,1,1,1,1];G.stage=4;G.arena=[0,0,0,0,0];delete G.arenaBest;A.V.modal=null;
 const page=()=>{A.V.modal={type:'guild',tab:'arena'};A.render();return document.querySelector('#modal');};
 let m=page();o.fresh=m.innerText;o.medals0=m.querySelectorAll('svg.amedal').length;
 const win=(tier,turns,kos)=>{A.V.modal=null;A.V.screen='world';A.ACT.arena(tier);let B=g('B');if(!B)return null;B.wave=B.spec.waves;B.pturns=turns;B.kos=kos;g('win')();return A.V.modal&&A.V.modal.info;};
 const i1=win(0,20,0);o.i1=i1&&{sc:i1.arenaScore,nw:i1.arenaNew,n:G.arena[0],best:G.arenaBest&&G.arenaBest[0]&&G.arenaBest[0].score};
 o.res=document.querySelector('#modal').innerText;
 A.ACT.resultOk();m=page();o.after1=m.innerText;o.medals1=m.querySelectorAll('svg.amedal').length;
 const i2=win(0,80,3);o.i2=i2&&{sc:i2.arenaScore,nw:i2.arenaNew,prev:i2.arenaPrev,n:G.arena[0],best:G.arenaBest[0].score};o.res2=document.querySelector('#modal').innerText;
 A.ACT.resultOk();
 const i3=win(1,15,0);o.n3=G.arena.slice();
 A.ACT.resultOk();m=page();o.medals2=m.querySelectorAll('svg.amedal').length;
 // an old save: wins but no scores
 G.arena=[2,0,0,0,0];delete G.arenaBest;m=page();o.old=m.innerText;
 // Records > Journey
 G.arena=[2,1,0,3,0];A.V.modal={type:'menu',tab:'system'};A.render();o.journey=document.querySelector('#modal').innerText;
 return o;});
console.log(JSON.stringify(r,null,1).slice(0,2500));
chk('fresh page: no medals, "Not cleared yet.", no "best: cleared"',r.medals0===0&&/Not cleared yet/.test(r.fresh)&&!/Best: cleared|cleared x/.test(r.fresh)||r.fresh);
chk('first win scores 3x1500 - 20x18 + hp, a new best, count 1',r.i1&&r.i1.sc>3500&&r.i1.sc<=6140&&r.i1.nw&&r.i1.n===1&&r.i1.best===r.i1.sc||JSON.stringify(r.i1));
chk('the rewards screen shows the Arena score and a first/new best line',/Arena score/i.test(r.res)&&/First score on this tier/i.test(r.res));
chk('page after a win: "Cleared 1x · Best score N" and one medal',/Cleared 1x\s*·\s*Best score [\d,]+/.test(r.after1)&&r.medals1===1||r.after1);
chk('a worse run keeps the best, count 2, result says "Best on this tier"',r.i2&&!r.i2.nw&&r.i2.n===2&&r.i2.best===r.i2.prev&&/Best on this tier/i.test(r.res2)||JSON.stringify(r.i2));
chk('a second tier gets its own medal and best',r.n3[1]===1&&r.medals2===2||JSON.stringify([r.n3,r.medals2]));
chk('a save with clears but no scores loads: "Cleared 2x" and a no-score hint',/Cleared 2x\s*·\s*No score yet/.test(r.old)||r.old);
chk('Records > Journey: "Arena medals collected" 3 of 5',/Arena medals collected[\s\S]*3 of 5/.test(r.journey)||r.journey.slice(0,600));
// weekly trial
const w=await ev(()=>{const A=__A,g=A.TW.get,k=g('dailyKey'),o={};const K=(y,m,d)=>k(new Date(y,m-1,d,12));
 o.week=[9,10,11,12,13,14,15].map(d=>K(2026,11,d));o.next=K(2026,11,16);o.year=K(2027,1,1);o.leap=K(2024,3,3);
 o.plan=g('dailyPlan')(K(2026,11,11)).seed===g('dailyPlan')(K(2026,11,15)).seed;
 o.tw=g('TW').forKey(K(2026,11,9)).id===g('TW').forKey(K(2026,11,15)).id;
 A.ACT.daily();o.intro=document.querySelector('#modal').innerText;
 o.title=(A.V.modal=null,A.V.screen='title',A.render(),document.querySelector('.tmenu .btn.daily')&&document.querySelector('.tmenu .btn.daily').textContent);
 // an end screen and the best per week
 A.V.modal={type:'dailyEnd',won:true,score:4000,turns:30,kos:1,key:K(2026,11,9)};A.render();o.end1=document.querySelector('#modal').innerText;
 A.V.modal={type:'dailyEnd',won:true,score:3000,turns:30,kos:1,key:K(2026,11,9)};A.render();o.end2=document.querySelector('#modal').innerText;
 o.best=A.META.trialBest;
 A.V.modal={type:'menu',tab:'system'};try{A.G;}catch(e){} 
 return o;});
console.log(JSON.stringify(w,null,1).slice(0,1500));
chk('the key is the Monday of the ISO week: Mon-Sun share it, the next Monday differs',w.week.every(x=>x==='2026-11-09')&&w.next==='2026-11-16'||JSON.stringify(w.week));
chk('Jan 1 2027 (Fri) belongs to the week of Mon 2026-12-28; leap week 2024-02-26',w.year==='2026-12-28'&&w.leap==='2024-02-26'||JSON.stringify([w.year,w.leap]));
chk('same seed and twist all week',w.plan&&w.tw);
chk('trial intro says Weekly Trial, this week, no Daily/today',/Weekly Trial/.test(w.intro)&&/this week/.test(w.intro)&&!/Daily|today|Today/.test(w.intro)||w.intro);
chk('title button reads Weekly Trial',w.title==='Weekly Trial'||w.title);
chk('end screen: first score, then a lower score keeps the best',/first score this week/i.test(w.end1)&&/Your best this week: 4,000/.test(w.end2)&&w.best['2026-11-09'].score===4000||w.end2);
if(SHOTS){await ev(()=>{const A=__A,G=A.TW.get('G');A.TW.get('startBattle');G.arena=[3,2,1,0,0];G.arenaBest={0:{score:4310},1:{score:5120},2:{score:6400}};A.V.screen='world';A.V.modal={type:'guild',tab:'arena'};A.render();});
 await H.shot('arena');await H.ev(()=>{__A.V.modal={type:'menu',tab:'system'};__A.render();const p=document.querySelector('#modal .panel');if(p){const b=[...p.querySelectorAll('b')].find(x=>/Arena medals/.test(x.textContent));if(b)b.scrollIntoView({block:'center'});}});await H.shot('records');}
await done(H);})();
