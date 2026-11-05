// Beta v0.5.0 5.5: the save message and the cloud chip never sit on the minimap, the weather and time chips, the location banner,
// the movement pad, the A/B buttons, the bottom bar buttons, the boss bar or the battle command buttons, at phone sizes and wide.
const {open,chk,done}=require('./pw');
const SIZES=[[390,844],[360,740],[844,390],[740,360],[1280,720]];
const KEEP='#mmap,.wchip,#wkw,#wloc.on,.joy,.abtns,.abtn,.wbar .btn,#hdr .btn,#bbossbar,.cmd .btn,.order,.blog,.blogbtn,.unit';
(async()=>{let H;
for(const [w,h] of SIZES){
  H=await open({w,h,mobile:w<1000});const {ev}=H;
  await ev(()=>{const A=__A;A.META.cfg.minimap=true;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
  const res=await ev(async(KEEP)=>{const A=__A,out=[];const sl=ms=>new Promise(r=>setTimeout(r,ms));
    const vis=e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0;};
    const hit=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    const check=async(name)=>{A.P5S.shownAt=0;A.saveGame();await sl(450);const p=document.getElementById('p5save'),ic=document.getElementById('svicon');
      const mine=[p,ic].filter(e=>e&&vis(e)).map(e=>[e.id,e.getBoundingClientRect()]);const bad=[];
      document.querySelectorAll(KEEP).forEach(k=>{if(!vis(k))return;const r=k.getBoundingClientRect();if(r.width<1)return;mine.forEach(([id,m])=>{if(hit(m,r))bad.push(id+' on '+(k.id?'#'+k.id:'.'+String(k.className).split(' ')[0]));});});
      const inView=mine.every(([id,m])=>m.left>=0&&m.top>=0&&m.right<=innerWidth&&m.bottom<=innerHeight);
      out.push({name,bad,inView,shown:mine.map(([id,m])=>id+'@'+Math.round(m.left)+','+Math.round(m.top)+' '+Math.round(m.width)+'x'+Math.round(m.height)).join(' ')});};
    // town with the location banner up, then a field with the minimap and chips
    A.showLocation&&A.showLocation();await check('town');
    const f=A.getMap('f0');A.placeAt('f0',f.gates.start.arrive[0],f.gates.start.arrive[1],'r');A.showLocation&&A.showLocation();A.render();await sl(60);await check('field');
    await sl(2600);await check('field, banner gone');out.mm=!!document.querySelector('#mmap')&&document.querySelector('#mmap').getBoundingClientRect().width>0;
    A.startBattle({stage:0,kind:'field',weather:'rain'});A.render();await sl(80);await check('battle');A.finishBattle('x');A.V.modal=null;
    A.startBattle({stage:0,kind:'boss'});A.render();await sl(80);await check('boss battle');A.finishBattle('x');A.V.modal=null;A.render();
    A.V.modal={type:'menu',tab:'party'};A.render();await sl(50);await check('menu');A.V.modal=null;A.render();
    return {out,mm:out.mm};},KEEP);
  chk(`${w}x${h} the minimap is up for the check`,res.mm===true);res.out.forEach(r=>{console.log(w+'x'+h,r.name,r.shown,r.bad.join('; '));chk(`${w}x${h} ${r.name}: save message and cloud chip clear of the minimap, chips, banner, pads and bars`,r.bad.length===0&&r.inView);});
    if(w!==SIZES[SIZES.length-1][0])await H.browser.close();}
await done(H);})().catch(e=>{console.log('ERR',e);process.exit(1);});
