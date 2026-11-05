// Beta v0.6.3 battle screen: screenshots for review into tools/chrome/shots-v063b/ (not committed).
// node v063bshots.js [prefix] [scene ...]   scenes: cmd det react six boss port land fold skills (default: all)
const fs=require('fs');const {open}=require('./pw');const {META,battle,dress,aim}=require('./v063lib');
const OUT=__dirname+'/shots-v063b';fs.mkdirSync(OUT,{recursive:true});
const pre=process.argv[2]&&!/^(cmd|det|react|six|boss|port|land|fold|skills|wide)$/.test(process.argv[2])?process.argv[2]:'after';
const want=process.argv.slice(pre===process.argv[2]?3:2);const on=n=>!want.length||want.includes(n);
const SIZES={port:[390,844],land:[844,390],fold:[933,705],wide:[1280,800]};
(async()=>{
const run=async(name,[w,h],opt,fn)=>{const H=await open({w,h,mobile:w<1000,dpr:2,pre:META(opt.gfx||'medium')});try{const r=await battle(H,opt);await H.wait(400);if(fn)await fn(H);await H.wait(350);
  await H.page.screenshot({path:`${OUT}/${pre}_${name}.png`});console.log('shot',name,JSON.stringify(r));}catch(e){console.log('ERR',name,e.message);}await H.browser.close();};
const primeAll=H=>H.ev(()=>{const A=__A,B=A.B,a=B.cur,ks=A.known(a),d=ks.find(s=>s.role==='det');const els=d?A.skEls(d):['fire'];const pr={fire:'ice',ice:'water',lightning:'water',water:'fire',earth:'lightning',wind:'fire',light:'shadow',shadow:'light'};
  B.en.forEach((e,i)=>{const R=Object.keys(A.REACT).map(k=>A.REACT[k]).find(R=>els.includes(R.d));if(i%2===0&&R)e.primed={el:R.p,t:2,by:'Mira'};else if(i%2)e.primed={el:'earth',t:1,by:'Mira'};});A.render();return d&&d.n;});
if(on('cmd'))await run('cmd_port',SIZES.port,{heroes:3,foes:3,seed:3},H=>dress(H,{seed:4,maxSt:3}));
if(on('det')){for(const [n,s] of Object.entries({port:SIZES.port,land:SIZES.land,fold:SIZES.fold}))await run('det_'+n,s,{heroes:3,foes:3,seed:5,lv:20},async H=>{await H.ev(()=>{const A=__A,B=A.B;const m=B.front.find(c=>A.known(c).some(s=>s.role==='det'));if(m){B.cur=m;}A.render();});const d=await primeAll(H);console.log('det skill',d);await aim(H,'det');});}
if(on('skills'))await run('skills_port',SIZES.port,{heroes:3,foes:3,seed:5,lv:20},async H=>{await H.ev(()=>{const A=__A,B=A.B;const m=B.front.find(c=>A.known(c).some(s=>s.role==='det'));if(m)B.cur=m;A.render();});await primeAll(H);await H.ev(()=>{__A.ACT.cmd('skills');});});
if(on('react'))await run('react_port',SIZES.port,{heroes:3,foes:3,seed:5,lv:20},async H=>{await H.ev(()=>{const A=__A,B=A.B,e=B.en[0];e.primed={el:'ice',t:2,by:'Mira'};A.fx(e,'124','dmg weak');A.fx(e,'Melt','react');const f=e.fx[e.fx.length-1];f.rp='ice';f.rd='fire';e.reactEl='fire';e.reactP='ice';e.primed=null;A.render();});await H.wait(500);});
if(on('six')){await run('six_port',SIZES.port,{heroes:6,foes:5,seed:11,fly:1},H=>dress(H,{seed:12,maxSt:4,fx:1}));await run('six_land',SIZES.land,{heroes:6,foes:5,seed:11,fly:1},H=>dress(H,{seed:12,maxSt:4,fx:1}));await run('six_fold',SIZES.fold,{heroes:6,foes:5,seed:11,fly:1},H=>dress(H,{seed:12,maxSt:4,fx:1}));await run('six_wide',SIZES.wide,{heroes:6,foes:5,seed:11,fly:1},H=>dress(H,{seed:12,maxSt:4,fx:1}));}
if(on('boss')){await run('boss_port',SIZES.port,{heroes:4,boss:1,stage:2,seed:21},H=>dress(H,{seed:22,maxSt:2}));await run('boss_fold',SIZES.fold,{heroes:4,boss:1,stage:2,seed:21},H=>dress(H,{seed:22,maxSt:2}));}
if(on('port'))await run('plain_port',SIZES.port,{heroes:3,foes:2,seed:31});
if(on('land'))await run('plain_land',SIZES.land,{heroes:3,foes:2,seed:31});
if(on('fold'))await run('plain_fold',SIZES.fold,{heroes:3,foes:2,seed:31});
process.exit(0);})();
