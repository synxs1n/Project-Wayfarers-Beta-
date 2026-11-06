// Beta v0.8.2: no sound when leaving the rewards screen (level ups used to play the level jingle; a quest ready chime could follow).
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.hints=false;A.startBattle({stage:0,kind:'field',weather:'clear'});});await wait(900);
await ev(()=>{const A=__A;A.B.front.forEach(c=>{c.lv=1;c.xp=0;});A.B.en.forEach(e=>e.hp=0);A.win();A.render();});await wait(400);
const r=await ev(async()=>{const A=__A,i=A.V.modal&&A.V.modal.info;const ups=i&&i.ups&&i.ups.length;window.__SFX=[];A.ACT.resultOk();await new Promise(q=>setTimeout(q,1500));return {ups,sfx:window.__SFX.slice(),modal:A.V.modal&&A.V.modal.type};});
chk('a win with level ups',r.ups>0||JSON.stringify(r));
chk('leaving the rewards screen plays no sound',r.sfx.filter(n=>n!=='step').length===0||JSON.stringify(r.sfx));
await done(H);})();
