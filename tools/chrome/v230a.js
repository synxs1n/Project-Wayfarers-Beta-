// v0.22.54 (gear16.js rarCap, worldrt.js chestGear, config.js CHEST_UP_LAST): Mythic opens at the Smithy when the Calamity has fallen.
//  1 fifth realm, Calamity alive: the open rarity is Heroic (4); nothing the Smithy sells or forges is Mythic. Calamity beaten: Mythic (5)
//    is open and on the shelves. A New Game+ cycle keeps it open. Realms one to four are as they were.
//  2 chests: in the last realm before the Calamity about 12% hold a Mythic piece and the rest hold Heroic at most; in the third realm
//    about 4% hold the next rarity up; once Mythic is open no chest "rolls up"
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v230a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v230a ran over 200 s');process.exit(1);},200000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false,goals:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v230a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
  const r=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,cap=g('rarCap'),ok=g('rarOk'),gearOf=g('gearOf'),tierOf=g('gTierIdx'),o={};
    const at=(s,won,cyc)=>{G.stage=s;G.cleared=[0,1,2,3,4].map(x=>x<s);G.pcV=1;G.won=won?1:0;G.run.cycle=cyc||0;};
    const shelf=()=>{const L=g('shopStock')('weapons').concat(g('shopStock')('armor')).filter(ok),R=g('RECIPES').filter(x=>x.id&&g('recipeOpen')(x)).map(x=>x.id).filter(ok);return Math.max(...L.concat(R).map(id=>tierOf(gearOf(id))).filter(t=>t<=5));};
    o.caps=[0,1,2,3,4].map(s=>{at(s,0);return cap();});at(4,0);o.pre=[cap(),shelf()];at(4,1);o.post=[cap(),shelf()];at(4,0,1);o.ng=[cap(),shelf()];
    const roll=(s,won,n)=>{at(s,won);let up=0,hi=0,upT={};const tier=Math.min(5,s+1);for(let i=0;i<n;i++){const c=g('chestGear')(tier,false),t=tierOf(gearOf(c.gid));if(c.up){up++;upT[t]=1;}else hi=Math.max(hi,t);}return {rate:up/n,hi,upT:Object.keys(upT).join()};};
    o.last=roll(4,0,6000);o.mid=roll(2,0,6000);o.open=roll(4,1,3000);return o;});
  chk(`1 open rarity by realm ${r.caps.join(',')}; fifth realm before the Calamity: cap ${r.pre[0]}, best on the shelves ${r.pre[1]}; after: cap ${r.post[0]}, shelves ${r.post[1]}; New Game+: cap ${r.ng[0]}, shelves ${r.ng[1]}`,
    r.caps.join()==='1,2,3,4,4'&&r.pre[0]===4&&r.pre[1]<=4&&r.post[0]===5&&r.post[1]===5&&r.ng[0]===5&&r.ng[1]===5||JSON.stringify(r));
  chk(`2 chests: last realm ${(r.last.rate*100).toFixed(1)}% Mythic (tier ${r.last.upT}), the rest tier ${r.last.hi} at most; third realm ${(r.mid.rate*100).toFixed(1)}% one up (tier ${r.mid.upT}); Mythic open: ${(r.open.rate*100).toFixed(1)}% roll up, chests hold tier ${r.open.hi}`,
    r.last.rate>.095&&r.last.rate<.145&&r.last.upT==='5'&&r.last.hi<=4&&r.mid.rate>.028&&r.mid.rate<.054&&r.mid.upT==='4'&&r.open.rate===0&&r.open.hi===5||JSON.stringify(r));
  await done(H);})();
