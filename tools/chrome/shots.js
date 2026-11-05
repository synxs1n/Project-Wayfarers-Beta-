// usage: node shots.js <prefix> ; screenshots Party, Roster, Codex, Equipment in portrait and wide landscape
const {open}=require('./pw');
const pre=process.argv[2]||'s';
(async()=>{
for(const [name,w,h] of [['p',390,844],['l',900,400]]){
  const H=await open({w,h,mobile:true,out:'/tmp'});
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
    Object.keys(A.TPL).slice(0,22).forEach(id=>{if(!A.G.roster[id])A.G.roster[id]=A.newChar(id,8,0);});A.G.gold=9999;A.render();});
  for(const tab of ['party','roster','codex','equip']){
    await H.ev(t=>{const A=__A;A.V.modal={type:'menu',tab:t};A.render();},tab);
    await H.wait(350);await H.page.screenshot({path:`/tmp/${pre}_${name}_${tab}.png`});
  }
  await H.browser.close();
}
console.log('done');})();
