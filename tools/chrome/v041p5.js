// v0.4.1 5.5: start with one, two or three wayfarers, with a confirmation for fewer than three
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait,page}=H;
const start=async n=>{await ev(()=>{const A=__A;A.G=null;A.ACT.new();});await wait(100);
  const ids=await ev(()=>__A.V.starterOpts.slice(0,3));for(let i=0;i<n;i++)await ev(id=>__A.ACT.pickS(id),ids[i]);await wait(80);return ids;};
// one wayfarer
await start(1);
const dis=await ev(()=>document.querySelector('[data-act="begin"]').disabled);
chk('5.5 Begin is enabled with a single wayfarer',dis===false);
await ev(()=>__A.ACT.begin());await wait(120);
const m=await ev(()=>({t:__A.V.modal&&__A.V.modal.type,txt:(document.querySelector('#modal')||{}).innerText||'',scr:__A.V.screen}));
console.log(JSON.stringify(m).slice(0,200));
chk('5.5 it asks "Start with only 1 wayfarer? You can recruit more in taverns."',m.t==='startfew'&&/Start with only 1 wayfarer\?/.test(m.txt)&&/recruit more in taverns/.test(m.txt));
chk('5.5 the game has not started yet',m.scr==='starter');
await ev(()=>__A.ACT.closeModal());await wait(80);
const back=await ev(()=>({scr:__A.V.screen,pick:__A.V.pick.length}));
chk('5.5 Go back returns to the picker with the pick kept',back.scr==='starter'&&back.pick===1);
await ev(()=>__A.ACT.begin());await wait(80);await ev(()=>__A.ACT.beginGo());await wait(400);
const g1=await ev(()=>({scr:__A.V.screen,party:__A.G&&__A.G.party.length}));
chk('5.5 Start begins the journey with one hero',g1.scr==='world'&&g1.party===1);
// two
await start(2);await ev(()=>__A.ACT.begin());await wait(80);
const m2=await ev(()=>({t:__A.V.modal&&__A.V.modal.type,txt:(document.querySelector('#modal')||{}).innerText||''}));
chk('5.5 two wayfarers asks with the plural wording',m2.t==='startfew'&&/Start with only 2 wayfarers\?/.test(m2.txt));
await ev(()=>__A.ACT.beginGo());await wait(400);
chk('5.5 two heroes start',(await ev(()=>__A.G.party.length))===2);
// three: no question
await start(3);await ev(()=>__A.ACT.begin());await wait(300);
const g3=await ev(()=>({scr:__A.V.screen,n:__A.G&&__A.G.party.length,mod:__A.V.modal&&__A.V.modal.type}));
chk('5.5 three wayfarers begin straight away',g3.scr==='world'&&g3.n===3&&g3.mod!=='startfew');
// early game works with one hero: first fight, town, inn
const e=await ev(()=>{const A=__A;A.ACT.new();A.ACT.pickS(A.V.starterOpts[0]);A.V.confirmFew=1;A.ACT.begin();A.V.confirmFew=0;A.ACT.storyOk();A.V.modal=null;
  const ok=A.startBattle({stage:0,kind:'field',weather:'clear'});const r={fight:ok!==false,party:A.G.party.length};if(A.B){A.B.en.forEach(x=>x.hp=0);A.advance();}return r;});
chk('5.5 a lone hero can start a fight',e.fight&&e.party===1);
// 5.1 chance wording: a beaten challenger only becomes eligible, never guaranteed
const d=await ev(()=>{const A=__A;A.ACT.new();A.V.starterOpts.slice(0,3).forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;
  const hero=Object.keys(A.TPL).find(id=>!A.TPL[id].mon&&!A.G.roster[id]&&A.TPL[id].src!=='L'&&A.POOL_IDS().includes(id));
  const ok=A.startBattle({stage:0,kind:'duel',hero,ce:{hero,mode:'duel'},weather:'clear'});if(ok===false)return {err:'nostart'};
  A.setPause(30);A.B.en.forEach(x=>x.hp=0);A.advance();
  return {hero};});
await wait(1800);
const d2=await ev(hero=>{const A=__A;return {hero,joined:!!A.G.roster[hero],boost:A.G.ce&&A.G.ce.boost&&A.G.ce.boost[hero],txt:(A.V.modal&&A.V.modal.info&&A.V.modal.info.legend)||'',modal:A.V.modal&&A.V.modal.type};},d.hero);
Object.assign(d,d2);
console.log(JSON.stringify(d).slice(0,300));
chk('5.1 beating a challenger does not recruit them on the spot',d.joined===false);
chk('5.1 it marks them eligible with a boost',d.boost===1);
chk('5.1 (v0.4.3) a won duel promises a tavern seat',/tavern/.test(d.txt));
// 5.2 distinct voices
const v=await ev(()=>{const A=__A;const res=[];const hs=Object.keys(A.TPL).filter(id=>!A.TPL[id].mon&&A.TPL[id].src!=='L'&&!A.G.roster[id]&&A.POOL_IDS().includes(id)).slice(0,6);
  ['duel','help','merchant'].forEach((ty,i)=>{const h=hs[i];A.ceStart({s:0,id:'f0',cave:false},h,ty);const ev=A.V.modal&&A.V.modal.ev;res.push({ty,name:A.TPL[h].n,text:ev?ev.text:null});});return res;});
console.log(JSON.stringify(v).slice(0,500));
chk('5.2 each meeting names the wayfarer and reads differently',v.every(x=>x.text&&x.text.includes(x.name))&&new Set(v.map(x=>x.text)).size===3);
chk('5.2 (v0.4.3) the duel intro says the winner finds them at the tavern',/tavern/.test(v[0].text));
await done(H);})();
