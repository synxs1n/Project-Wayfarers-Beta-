// Beta v0.6.1: the battle rewards screen. The tame card comes first and Continue asks before leaving a tameable foe; every hero shows
// the XP they gained; "Legendary" only labels the legendary heroes (a wayfarer met on the road, or a duel, says so instead).
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true,dpr:2});const {ev,wait,page}=H;
await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.hints=false;
  A.G.roster.brann=A.newChar('brann',1,0);A.G.party.push('brann');A.startBattle({stage:0,kind:'field',weather:'clear'});});await wait(900);
const r=await ev(()=>{const A=__A,G=A.G,o={};const tot=c=>{let t=c.xp||0;for(let l=1;l<c.lv;l++)t+=A.need?A.need(l):0;return t;};
  A.B.en.forEach(e=>e.hp=0);A.win();A.render();const i=A.V.modal&&A.V.modal.info;if(!i)return {nomodal:1};
  o.xpBy=(i.xpBy||[]).map(x=>x.name+':'+x.gain);o.heroes=document.querySelectorAll('#modal .rs-hero').length;o.gains=[...document.querySelectorAll('#modal .rs-gain')].map(e=>e.textContent);
  // tame first, and Continue asks
  i.tame={mon:Object.keys(A.MON)[0],name:'Test Beast'};A.render();const h2=document.querySelector('#modal .panel h2'),first=h2&&h2.nextElementSibling;o.tameFirst=!!(first&&first.classList.contains('rs-tame'));
  A.ACT.resultOk();o.stillOpen=A.V.modal&&A.V.modal.type==='result';o.asks=!!document.querySelector('#modal [data-act="resultLeave"]');o.warn=!!document.querySelector('#modal .rs-tame.warn');
  // labels
  i.tame=null;i.legend='Tess joins you.';i.legendKind='wayfarer';A.render();o.wayLab=document.querySelector('#modal .rs-join b').textContent;
  i.legendKind=null;A.render();o.legLab=document.querySelector('#modal .rs-join b').textContent;i.legend=null;A.render();
  return o;});
console.log(JSON.stringify(r));
chk('every hero who fought gets a row with their XP',r.heroes===4&&r.gains.length>=3||JSON.stringify(r));
chk('XP per hero is measured',r.xpBy&&r.xpBy.length===4&&r.xpBy.every(s=>/:\d+$/.test(s))||JSON.stringify(r.xpBy));
chk('the tame card is the first thing on the screen',r.tameFirst===true);
chk('Continue with a tame pending asks first',r.stillOpen===true&&r.asks===true&&r.warn===true||JSON.stringify(r));
chk('a wayfarer met on the road is not labelled Legendary',r.wayLab!=='Legendary'||r.wayLab);
chk('a legendary hero is labelled Legendary',r.legLab==='Legendary'||r.legLab);
await page.screenshot({path:__dirname+'/shots-v053/v061_result.png',fullPage:false});
await ev(()=>{const A=__A,i=A.V.modal.info;i.tame={mon:Object.keys(A.MON)[0],name:'Moss Pup'};i.ups=[{name:'Brann',lv:4,pts:2}];A.render();});await wait(300);
await page.screenshot({path:__dirname+'/shots-v053/v061_result_tame.png'});
await done(H);})();
