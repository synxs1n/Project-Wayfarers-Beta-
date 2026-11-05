// Beta v0.6.3 (1): no stage label sits on top of or behind another label or any unit's sprite. The owner's report: "the top person's
// element is blocking someone's face in battle screen". Labels: HP plates (bars, limit, shield pips, element badges), primed badges,
// status rows, target tags (names and hints), the turn arrow, effect texts, and the order and boss bars. Sprites: the alpha bounds of every
// unit's sprite canvas (HD bitmaps included), measured here independently of the layout pass; faces are the top 40% of them.
// Random battles (parties of 1 to 6 with the rearguard, 1 to 5 foes, bosses, flyers, statuses, primes, shields, effect texts, aiming) at
// 390x844, 844x390, 933x705 and 1280x800. On a build before v0.6.3 (no b3Lay) it measures the old fixed offsets and fails.
// N=<battles per size> (default 14). Usage: PWHTML=../../out/aurelis3.html node v063ba.js
const {open,chk,done}=require('./pw');const {META,battle,dress,aim,rects,overlaps}=require('./v063lib');
const N=+process.env.N||14;
(async()=>{let tot=0,badB=0,labels=0,hidden=0,hidPlate=0,plates=0;const ex=[];
for(const [w,h] of [[390,844],[844,390],[933,705],[1280,800]]){const H=await open({w,h,mobile:w<1000,pre:META('medium')});let bad=0,face=0;
  for(let i=0;i<N;i++){const seed=1000+i*37+w,R=(k=>()=>((k=Math.imul(k^k>>>15,2246822507)+0x6D2B79F5>>>0)%1e6)/1e6)(seed);
    const boss=R()<.22,opt={seed,heroes:1+Math.floor(R()*6),foes:boss?1+Math.floor(R()*3):1+Math.floor(R()*5),boss,stage:boss?1+Math.floor(R()*3):0,lv:R()<.5?22:0};opt.fly=boss?0:Math.floor(R()*Math.min(2,opt.foes+1));
    const r0=await battle(H,opt);if(r0.mode!=='cmd'){console.log('skip',JSON.stringify(opt),r0.mode);continue;}
    await dress(H,{seed:seed+1,maxSt:5,fx:1,ko:R()<.2});const tg=R();if(tg<.35)await aim(H,tg<.2?'det':null);await H.wait(160);
    const r=await rects(H),o=overlaps(r);tot++;labels+=r.labels.length;hidden+=r.hidden.length;plates+=r.labels.filter(l=>l.k==='plate').length;hidPlate+=r.hidden.filter(x=>/^plate/.test(x)).length;
    const fo=o.filter(x=>/on sprite/.test(x)).length;face+=fo;
    if(o.length){bad++;badB++;if(ex.length<12)ex.push(`${w}x${h} #${i} ${JSON.stringify(opt)}: ${o.slice(0,4).join('; ')}`);}}
  chk(`${w}x${h}: ${N} battles, no label overlaps another label or a sprite`,bad===0||`${bad} battles with overlaps (${face} on sprites)`);
  await H.browser.close();}
ex.forEach(e=>console.log('  ',e));
console.log(`labels ${labels}, hidden ${hidden} (plates hidden ${hidPlate} of ${plates+hidPlate})`);
chk('the stage still shows almost every HP plate (at most 3% fall back to the cards)',hidPlate<=Math.ceil((plates+hidPlate)*.03)||`${hidPlate} of ${plates+hidPlate} hidden`);
chk('the stage keeps at least 85% of all labels',labels>0&&hidden<=labels*.15||`${hidden} hidden of ${labels+hidden}`);
const H=await open({});await done(H);})();
