// Beta v0.9.5 battle clarity: screenshots of the shared scene (v095lib) at the phone and Fold sizes, simple and expert, into
// tools/chrome/shots-v095b/ (not committed). Usage: PWHTML=../../out/aurelis3.html SHOTPFX=after_ node v095bshots.js [sizes]
const {open,done}=require('./pw');const {META}=require('./v063lib');const {scene}=require('./v095lib');const fs=require('fs');
const DIR=__dirname+'/shots-v095b',PFX=process.env.SHOTPFX||'';fs.mkdirSync(DIR,{recursive:true});
const SIZES=(process.argv[2]||'344x882,390x844,412x812,705x455,844x390,933x615,933x705,1280x720').split(',').map(s=>s.split('x').map(Number));
(async()=>{for(const [w,h] of SIZES)for(const ex of [false,true]){const H=await open({w,h,mobile:w<1000,pre:META('medium')});
  await scene(H,{expert:ex,heroes:4,foes:3});await H.wait(300);
  await H.page.screenshot({path:`${DIR}/${PFX}${w}x${h}_${ex?'expert':'simple'}.png`});
  if(!ex){// the reaction moment: detonate the primed foe with the acting hero's detonator (if it has one) and catch the banner
    const ok=await H.ev(async()=>{const A=__A,B=A.B;let a=B.cur;const P=B.en[0]&&B.en[0].primed;if(!P)return 'no prime';
      const ks=A.known(a),s=ks.find(x=>x.role==='det'&&A.skEls(x).some(d=>A.TW.get('reactFor')(P.el,d)));if(!s)return 'no det';
      a.mp=Math.max(a.mp,s.mp);A.setPause(0);A.B.en.forEach(e=>{e.next=9999;});A.ACT.cmd('skills');A.ACT.sk(s.id);if(B.menu==='target')A.ACT.tgtE(0);return 'ok';});
    if(ok==='ok'){await H.wait(420);await H.page.screenshot({path:`${DIR}/${PFX}${w}x${h}_react.png`});}else console.log(w+'x'+h,'react shot:',ok);}
  await H.browser.close();}
  const H=await open({});await done(H);})();
