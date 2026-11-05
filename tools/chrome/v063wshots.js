// v0.6.3 world pass: screenshots to tools/chrome/shots-v063w/ (not committed).
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v063wshots.js [tier] [only]
// Scenes: a field with a fortress gatehouse; a meadow field while walking (two frames, the camera moved: the leaves and butterflies stay
// where they were in the world); a chest before and after opening; the world map at phone portrait and landscape (plus a tap on a place).
const {open}=require('./pw');const fs=require('fs');const path=require('path');
const OUT=path.join(__dirname,'shots-v063w');fs.mkdirSync(OUT,{recursive:true});
const TIER=process.argv[2]||'medium',ONLY=process.argv[3]||'';
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false}}));(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const want=n=>!ONLY||n.includes(ONLY);
async function boot(w,h){const H=await open({w,h,mobile:true,dpr:2,pre:META(TIER)});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.wait(600);return H;}
const view=async(H,name)=>{const el=await H.page.$('.wview');await el.screenshot({path:path.join(OUT,name+'.png')});console.log('shot',name);};
(async()=>{
  {const H=await boot(933,705);const {ev,wait}=H;
    if(want('fort')){for(const tag of ['day','night']){const r=await ev(t=>{const A=__A;for(let s=1;s<5;s++){const m=A.getMap('f'+s);if(m.fortAt){A.G.clock=t==='night'?700:150;A.G.weather[s]='clear';A.placeAt('f'+s,m.fortAt[0],m.fortAt[1]+3,'u');A.TR.ph=null;A.TR.wx.key=null;A.render();return {s,at:m.fortAt,th:m.theme};}}return null;},tag);
      await wait(1200);await view(H,`fort_${tag}_fold_${TIER}`);console.log(JSON.stringify(r));}}
    if(want('walk')){const r=await ev(()=>{const A=__A;let id=null;for(let s=0;s<5;s++){const m=A.getMap('f'+s);if(m.theme==='meadow'){id='f'+s;break;}}if(!id)id='f0';const m=A.getMap(id);
        A.G.clock=150;A.G.weather[m.s]='clear';let best=null;for(let y=4;y<m.h-4&&!best;y++)for(let x=4;x<m.w-12;x++){let ok=true;for(let i=0;i<9&&ok;i++)if(A.solidAt(m,x+i,y))ok=false;if(ok){best=[x,y];break;}}
        A.placeAt(id,best[0],best[1],'r');A.TR.ph=null;A.TR.wx.key=null;A.render();return {id,best,th:m.theme};});
      await wait(1200);await view(H,`walk_a_${TIER}`);await H.page.keyboard.down('ArrowRight');await wait(900);await view(H,`walk_b_${TIER}`);await H.page.keyboard.up('ArrowRight');await wait(300);
      console.log(JSON.stringify(r),JSON.stringify(await ev(()=>({x:__A.WS.x,n:__A.W63.HW.n,live:__A.HD.live}))));}
    if(want('chest')){const r=await ev(()=>{const A=__A;for(let s=0;s<5;s++){const m=A.getMap('f'+s);for(const [x,y] of m.chests||[]){if(A.G.chests[m.id+':'+x+','+y])continue;if(!A.solidAt(m,x,y+1)&&!A.solidAt(m,x,y+2)&&!A.solidAt(m,x+1,y+2)){A.G.clock=150;A.placeAt(m.id,x+1,y+2,'u');A.render();return {id:m.id,x,y};}}}return null;});
      await wait(1200);await view(H,`chest_before_${TIER}`);
      await ev(c=>{const A=__A;A.openChest(c.x,c.y);A.V.modal=null;try{A.nextDlg();}catch(e){}A.render();},r);await wait(900);await view(H,`chest_after_${TIER}`);
      console.log(JSON.stringify(r),await ev(c=>({solid:__A.solidAt(__A.WS.m,c.x,c.y),tile:__A.tileAt(__A.WS.m,c.x,c.y)}),r).then(JSON.stringify));}
    // every entrance on the fields (dungeon facades in each realm's style, cave mouths, gatehouses), and the other map kinds
    if(want('ents'))for(let s=0;s<5;s++){const L=await ev(s=>{const A=__A,m=A.getMap('f'+s),o=[];if(m.ent)o.push(['dun',m.ent]);(m.caves||[]).forEach(c=>o.push([c.kind==='fort'?'fort':'cave',[c.x,c.y]]));return o;},s);
      for(const [k,p] of L){await ev(([s,p])=>{const A=__A,m=A.getMap('f'+s);A.G.clock=150;A.G.weather[s]='clear';for(const d of [3,2,4]){if(!A.solidAt(m,p[0],p[1]+d)){A.placeAt('f'+s,p[0],p[1]+d,'u');break;}}A.render();},[s,p]);await wait(1100);await view(H,`ent_f${s}_${k}_${TIER}`);}}
    if(want('kinds')){for(const [n,fn] of [['town',A=>{A.placeAt('t0',A.innSpot?A.innSpot(0)[0]:10,A.innSpot?A.innSpot(0)[1]:10,'d');}],['dungeon',A=>A.enterDungeon(0)],
        ['cave',A=>{for(let s=0;s<5;s++){const f=A.getMap('f'+s),c=(f.caves||[]).find(c=>c.kind!=='fort');if(c){A.placeAt('f'+s,c.out[0],c.out[1],'d');A.enterCave(c,s);return;}}}],
        ['fortin',A=>{for(let s=1;s<5;s++){const f=A.getMap('f'+s),c=(f.caves||[]).find(c=>c.kind==='fort');if(c){A.placeAt('f'+s,c.out[0],c.out[1],'d');A.enterCave(c,s);return;}}}]]){
      await ev(`__A.V.modal=null;__A.WS.dlg=null;(${fn.toString()})(__A);__A.G.clock=150;__A.V.modal=null;__A.render();`);await wait(1300);await view(H,`kind_${n}_${TIER}`);}}
    console.log('errors',H.errs.slice(0,3));await H.browser.close();}
  if(want('wmap'))for(const [w,h,tag] of [[390,844,'port'],[933,705,'fold'],[844,390,'land']]){const H=await boot(w,h);const {ev,wait,page}=H;
    // a journey a little way in: two realms relit, the third town reached, a cave and a fortress found
    await ev(()=>{const A=__A,G=A.G;['t0','f0','d0','t1','f1','d1','t2','f2'].forEach(id=>{G.been=G.been||{};G.been[id]=1;});G.cleared[0]=1;G.cleared[1]=1;
      for(const s of [0,1,2]){const m=A.getMap('f'+s);(m.caves||[]).forEach(c=>{G.cavesSeen=G.cavesSeen||{};G.cavesSeen[c.id]=1;});}G.caveWon=G.caveWon||{};G.caveWon[0]=1;
      const m=A.getMap('f2');A.placeAt('f2',Object.values(m.gates)[0].arrive[0],Object.values(m.gates)[0].arrive[1],'d');A.V.modal=null;A.render();A.ACT.map();A.ACT.worldMap();});
    await wait(900);await page.screenshot({path:path.join(OUT,`wmap_${tag}.png`)});console.log('shot wmap',tag);
    const c=await ev(()=>{const cv=document.getElementById('wmap');if(!cv)return null;const r=cv.getBoundingClientRect(),W=__A.W63.WM;const n=W&&W.hit&&W.hit.find(o=>o.id==='t1');return n?{x:r.left+n.x*r.width/cv.width,y:r.top+n.y*r.height/cv.height}:null;});
    if(c){await page.mouse.click(c.x,c.y);await wait(500);await page.screenshot({path:path.join(OUT,`wmap_${tag}_tap.png`)});console.log('shot wmap tap',tag);}
    console.log('errors',H.errs.slice(0,3));await H.browser.close();}
  console.log('shots in',OUT);process.exit(0);
})();
