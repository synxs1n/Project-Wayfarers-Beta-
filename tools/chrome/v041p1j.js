// v0.4.1 1.10: the most recent input wins (keys, gamepad, joystick, drag, tap); an idle pad or released joystick never cancels held keys
const {open,chk,done}=require('./pw');
async function fresh(){const H=await open({w:430,h:800,mobile:false});
 await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
 await H.page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});return H;}
(async()=>{
// A: keyboard walking while a gamepad is connected but idle (the old poll wrote held=[] every frame)
{const H=await fresh();
 await H.ev(()=>{window.__pad={axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false}))};navigator.getGamepads=()=>[window.__pad];});
 await H.ev(()=>{const A=__A;A.WS.held=[];A.WS.x=Math.max(A.WS.x,3);});
 const x0=await H.ev(()=>__A.WS.px);
 await H.page.keyboard.down('ArrowRight');await H.wait(700);
 const r=await H.ev(()=>({px:__A.WS.px,held:__A.WS.held.slice()}));await H.page.keyboard.up('ArrowRight');
 console.log('A',x0,JSON.stringify(r));
 chk('1.10 keyboard keeps walking while an idle gamepad is connected',r.px!==x0||JSON.stringify(r));
 await H.browser.close();}
// B: priority between sources, by timestamp
{const H=await fresh();
 const r=await H.ev(()=>{const A=__A,WS=A.WS;const out={};const reset=()=>{WS.held=[];WS.padDir=null;WS.joyDir=null;WS.touchDir=null;WS.target=null;WS.kbT=WS.padT=WS.joyT=WS.dragT=WS.tapT=0;};
  reset();WS.held=['r'];WS.kbT=100;WS.joyDir='u';WS.joyT=200;out.joyOverKey=A.worldInputDir();
  WS.joyDir=null;out.keyAfterJoyEnds=A.worldInputDir();
  reset();WS.joyDir='u';WS.joyT=100;WS.held=['l'];WS.kbT=300;out.keyOverJoy=A.worldInputDir();
  reset();WS.held=['r'];WS.kbT=100;WS.padDir='d';WS.padT=250;out.padOverKey=A.worldInputDir();
  reset();WS.padDir='d';WS.padT=100;WS.joyDir='l';WS.joyT=400;out.joyOverPad=A.worldInputDir();
  reset();WS.held=['r'];WS.kbT=100;WS.target=[WS.x,WS.y+3];WS.tapT=500;out.tapOverKey=A.worldInputDir();
  reset();WS.target=[WS.x,WS.y+3];WS.tapT=100;WS.held=['l'];WS.kbT=600;out.keyOverTap=A.worldInputDir();
  reset();WS.touchDir='u';WS.dragT=100;WS.padDir='r';WS.padT=900;out.padOverDrag=A.worldInputDir();
  reset();return out;});
 console.log('B',JSON.stringify(r));
 chk('1.10 newest source wins',r.joyOverKey==='u'&&r.keyAfterJoyEnds==='r'&&r.keyOverJoy==='l'&&r.padOverKey==='d'&&r.joyOverPad==='l'&&r.keyOverTap==='l'&&r.padOverDrag==='r'||JSON.stringify(r));
 chk('1.10 a later tap beats a held key',r.tapOverKey&&r.tapOverKey!=='r'||JSON.stringify(r));
 await H.browser.close();}
// C: a new key press cancels a tap route; a pad press cancels a tap route
{const H=await fresh();
 await H.ev(()=>{const A=__A;A.WS.target=[A.WS.x-4,A.WS.y];A.WS.tapT=performance.now();});
 await H.page.keyboard.down('ArrowRight');await H.wait(30);
 const r=await H.ev(()=>({target:__A.WS.target,held:__A.WS.held.slice()}));await H.page.keyboard.up('ArrowRight');
 chk('1.10 a new key press cancels the tap route',!r.target&&r.held.includes('r')||JSON.stringify(r));
 await H.browser.close();}
process.exit(0);})();
