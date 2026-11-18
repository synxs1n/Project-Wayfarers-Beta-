// v0.22.30 (fix30.js): Echoes in the realm list, a journey whose boss no longer exists, a larger minimap on computers.
//  1 a journey whose realm 2 boss key is not in the game: bossKeyFor gives a real boss the journey does not use, the same one every time,
//    the old key is kept, and the realm's story Echo is up and its prompt opens ("Echo of ...")
//  2 REALM_DONE lists the Echo (not done, then done once beaten); the Journey tab shows "Echo 0/1"
//  3 the minimap is 196 px wide on a 1280 px screen
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v214a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v214a ran over 200 s');process.exit(1);},200000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:1280,h:800,mobile:false,pre:META,tag:'v214a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(900);
  const a=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,GU=g('GUARDIANS'),o={};G.stage=2;G.cleared=[1,1,0,0,0];G.echoReady={0:1,1:1};const keep=G.run.bosses.slice();G.run.bosses[1]='boss_that_was_removed';
    o.k1=g('bossKeyFor')(1);o.k2=g('bossKeyFor')(1);o.real=!!GU[o.k1];o.dupe=keep.filter((k,i)=>i!==1&&k===o.k1).length;o.was=(G.run.bossWas||{})[1];o.others=g('bossKeyFor')(0)===keep[0]&&g('bossKeyFor')(2)===keep[2];
    o.up=g('storyEchoUp')(1);A.V.modal={type:'echoAsk',s:1};A.render();o.txt=((document.querySelector('#modal')||{}).innerText||'').slice(0,60);o.name=GU[o.k1]&&GU[o.k1].n;A.V.modal=null;A.render();
    const L=g('REALM_DONE')(1),e=L.find(x=>x.k==='echo');o.e=e&&{n:e.n,done:e.done};G.echoStory={1:1};const e2=g('REALM_DONE')(1).find(x=>x.k==='echo');o.e2=e2&&e2.done;G.echoStory={};
    o.j=g('vRealms')();return o;});
  chk(`1 the removed boss is replaced by ${a.k1} (kept: ${a.was}); its Echo is up: "${a.txt.replace(/\s+/g,' ').trim()}"`,(a.real&&a.k1===a.k2&&!a.dupe&&a.was==='boss_that_was_removed'&&a.others&&a.up&&a.txt.toLowerCase().indexOf('echo of '+String(a.name).toLowerCase())>=0)||JSON.stringify(a).slice(0,500));
  chk(`2 the realm list has "${a.e&&a.e.n}" (open, then done); the Journey tab counts it`,(a.e&&/^Echo of /.test(a.e.n)&&a.e.done===false&&a.e2===true&&/Echo 0\/1/.test(a.j))||JSON.stringify([a.e,a.e2,a.j.slice(0,300)]));
  const b=await ev(()=>{const m=document.getElementById('mmap');const r=m&&m.getBoundingClientRect();return r&&{w:Math.round(r.width),h:Math.round(r.height),in:r.right<=innerWidth&&r.top>=0};});
  chk(`3 the minimap is ${b&&b.w}x${b&&b.h} on a 1280 px screen`,(b&&b.w>=190&&b.h>=140&&b.in)||JSON.stringify(b));
  await done(H);})();
