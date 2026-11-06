// v0.7.1 title pass: screenshots of the title (with and without a save) and the world header at the review sizes.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v071tshots.js <tag> [tier]
const fs=require('fs');const {open}=require('./pw');
const tag=process.argv[2]||'after',tier=process.argv[3]||'medium',D=__dirname+'/shots-v071t';
const SZ=[[390,844,1],[844,390,1],[933,705,1],[1280,720,0]];
(async()=>{fs.mkdirSync(D,{recursive:true});for(const [w,h,m] of SZ){const H=await open({w,h,mobile:!!m,dpr:m?2:1});const {ev,wait,page}=H;
  await ev(t=>{__A.META.cfg.gfx=t;__A.gfxApply();__A.render();},tier);await wait(1500);
  await page.screenshot({path:`${D}/${tag}_${tier}_title_${w}x${h}.png`});
  await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.saveGame();A.render();});await wait(1200);
  await page.screenshot({path:`${D}/${tag}_${tier}_world_${w}x${h}.png`});
  await ev(()=>{__A.V.screen='title';__A.G=null;__A.V.modal=null;__A.render();});await wait(1500);
  await page.screenshot({path:`${D}/${tag}_${tier}_titlesave_${w}x${h}.png`});
  await H.browser.close();}
  console.log('shots done');process.exit(0);})();
