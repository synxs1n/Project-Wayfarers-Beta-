// Beta v0.5.3 HD-2D: debug views (draw masks) of one scene. Not a test. Usage: node v053dbg.js <scene> <masks e.g. 2,1,31> [tier]
const {open}=require('./pw');const path=require('path');const fs=require('fs');const OUT=path.join(__dirname,'shots-v053');fs.mkdirSync(OUT,{recursive:true});
const SC={dungeon:'A.enterDungeon(0)',town:'0',field:"(()=>{A.G.clock=150;A.G.weather[0]='clear';const m=A.getMap('f0'),a=Object.values(m.gates)[0].arrive;A.placeAt('f0',a[0],a[1],'r');})()"};
(async()=>{const H=await open({w:+process.env.W||390,h:+process.env.H||844,mobile:true,dpr:2,pre:`(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'${process.argv[4]||'high'}',hints:false,rmotion:false}}));`});const {ev,wait,page}=H;
await ev(s=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;eval(s);A.render();},SC[process.argv[2]||'dungeon']);await wait(800);
if(process.env.X)await ev(x=>eval(x),process.env.X);await wait(300);
for(const d of (process.argv[3]||'31').split(',')){await ev(d=>{__A.HD.dbg=+d;},d);await wait(300);await (await page.$('.wview')).screenshot({path:path.join(OUT,'dbg_'+(process.argv[2]||'dungeon')+'_'+d+'.png')});}
console.log(JSON.stringify(await ev(()=>({live:__A.HD.live,why:__A.HD.why}))));await H.browser.close();})();
