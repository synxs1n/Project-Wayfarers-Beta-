// scratch probe (not a test): node _probe.js '<js body returning a value>' [w] [h]
const {open}=require('./pw');
(async()=>{const H=await open({w:+process.argv[3]||430,h:+process.argv[4]||800});
  await H.ev(()=>{try{window.__R25.R25.off=true;}catch(e){}const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await H.wait(300);
  const r=await H.page.evaluate('(()=>{const T=__A.TW.get;'+process.argv[2]+'})()');console.log(typeof r==='string'?r:JSON.stringify(r,null,1));await H.browser.close();process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});
