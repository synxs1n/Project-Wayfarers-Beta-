// Beta v0.7.0 (1, 2): the order bar and the stage intent labels fit the battle screen at 390x844, 844x390, 933x705 (Galaxy Fold open)
// and 1280x720. Random battles (as v063ba: parties of 1 to 6, 1 to 5 foes, bosses, flyers, statuses, primes, shields, effect texts,
// aiming), half of them with the foes studied (real intent icons), half unknown ("?"):
// - no stage label (intent labels included) overlaps another label or any sprite (v063lib rects/overlaps, measured from the sprite canvases);
// - every foe shows its intent on the stage in almost every battle (at most 5% fall back to the order bar alone);
// - the order bar is outside the stage, every entry in it is fully visible (none scrolled away or clipped), and an intent badge never
//   covers a portrait in the bar.
// N=<battles per size> (default 10). Usage: PWHTML=../../out/aurelis3.html node v070ib.js
const {open,chk,done}=require('./pw');const {META,battle,dress,aim,rects,overlaps}=require('./v063lib');
const N=+process.env.N||10;
(async()=>{let itN=0,itHid=0;const ex=[];
for(const [w,h] of [[390,844],[844,390],[933,705],[1280,720]]){const H=await open({w,h,mobile:w<1000,pre:META('medium')});let bad=0,barBad=0,n=0;
  for(let i=0;i<N;i++){const seed=2000+i*41+w,R=(k=>()=>((k=Math.imul(k^k>>>15,2246822507)+0x6D2B79F5>>>0)%1e6)/1e6)(seed);
    const boss=R()<.2,opt={seed,heroes:1+Math.floor(R()*6),foes:boss?1+Math.floor(R()*3):1+Math.floor(R()*5),boss,stage:boss?1+Math.floor(R()*3):0,lv:R()<.5?22:0};opt.fly=boss?0:Math.floor(R()*Math.min(2,opt.foes+1));
    const r0=await battle(H,opt);if(r0.mode!=='cmd')continue;n++;
    await H.ev(k=>{const A=__A,B=A.B;B.en.forEach((e,j)=>{const b=A.META.best[e.base]=A.META.best[e.base]||{seen:1,kills:0,scan:0,known:{}};b.scan=k?1:0;b.kills=0;e.next=B.time+15+j*23;});A.render();},i%2===0);
    await dress(H,{seed:seed+1,maxSt:5,fx:1,ko:R()<.2});const tg=R();if(tg<.3)await aim(H,tg<.15?'det':null);await H.wait(160);
    const r=await rects(H),o=overlaps(r);
    const it=await H.ev(()=>{const A=__A,B=A.B,L=A.b3Lay(true);const live=B.en.filter(e=>e.hp>0).length,shown=document.querySelectorAll('#bstage .b5it').length;
      const bar=document.getElementById('border').getBoundingClientRect(),ocs=document.querySelector('#border .ocs').getBoundingClientRect(),stage=document.getElementById('bwrap').getBoundingClientRect(),issues=[];
      const hit=(a,b)=>a.left<b.right-.5&&a.right-.5>b.left&&a.top<b.bottom-.5&&a.bottom-.5>b.top;
      if(hit(bar,stage))issues.push('bar over stage');
      document.querySelectorAll('#border .oc,#border .b5oi').forEach(e=>{const q=e.getBoundingClientRect();if(q.left<ocs.left-.5||q.right>ocs.right+.5||q.top<bar.top-.5||q.bottom>bar.bottom+.5)issues.push('clipped '+e.className);});
      document.querySelectorAll('#border .b5oe').forEach(g=>{const a=g.querySelector('.oc').getBoundingClientRect(),b=g.querySelector('.b5oi').getBoundingClientRect();if(hit(a,b))issues.push('badge on portrait');});
      return {live,shown,issues,chips:document.querySelectorAll('#border .oc').length};});
    itN+=it.live;itHid+=Math.max(0,it.live-it.shown);
    if(it.issues.length){barBad++;if(ex.length<14)ex.push(`${w}x${h} #${i} bar: ${it.issues.slice(0,3).join('; ')}`);}
    if(o.length){bad++;if(ex.length<14)ex.push(`${w}x${h} #${i} ${JSON.stringify(opt)}: ${o.slice(0,4).join('; ')}`);}}
  chk(`${w}x${h}: ${n} battles, no label (intent labels included) overlaps another label or a sprite`,n>=N*.8&&bad===0||`${bad} of ${n} battles with overlaps`);
  chk(`${w}x${h}: the order bar is off the stage and every entry fits, no badge on a portrait`,barBad===0||`${barBad} battles`);
  await H.browser.close();}
ex.forEach(e=>console.log('  ',e));
console.log(`intent labels: ${itN-itHid} of ${itN} live foes on the stage`);
chk('almost every live foe shows its intent on the stage (at most 5% only in the bar)',itN>0&&itHid<=itN*.05||`${itHid} of ${itN} missing`);
const H=await open({});await done(H);})();
