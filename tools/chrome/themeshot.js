const {open}=require('./pw');
const keys=process.argv.slice(2);
(async()=>{const H=await open({w:760,h:420,mobile:false,out:'/tmp'});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();});
for(const k of keys){
  await H.ev((k)=>{const A=__A;A.G.run.bosses[0]=k;A.resetMaps();const m=A.getMap('t0');A.placeAt('t0',6,m.road,'r');A.rebuildBase&&A.rebuildBase();A.render();},k);
  await H.wait(700);await H.page.screenshot({path:`/tmp/th_${k}_t.png`});
  await H.ev((k)=>{const A=__A;const m=A.getMap('g0');A.placeAt('g0',12,m.sy,'r');A.rebuildBase&&A.rebuildBase();A.render();},k);
  await H.wait(700);await H.page.screenshot({path:`/tmp/th_${k}_g.png`});
}
await H.browser.close();})();
