// v0.11.9 guidance9.js: Guild Hall marker state, quest goals in Next goals with a guide, hint pacing, the Hint log.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1280,h:800,dpr:1});const r=await H.ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=g('G');const o={};
 o.guild0=g('guildState')();G.cleared[0]=true;g('genQuests')(0);o.guild1=g('guildState')();G.cleared[0]=false;g('genQuests')(0);const q=G.quests.find(x=>x.stage===0&&x.state==='open'&&['hunt','gather','wanderer'].includes(x.type));A.ACT.qAccept(q.id);
 const L=g('glList')();o.goals=L.map(x=>x.id+(x.quest?'(q)':''));o.hasQ=L.some(x=>x.id==='q:'+q.id);
 const html=g('glHtml')(L,'full',false);o.rowsClickable=/data-act="goalGuide"/.test(html);
 const body=g('goalGuideBody')('q:'+q.id);o.guide=!!body&&/Hand in/.test(body)&&/Go/.test(body);o.story=!!g('goalGuideBody')(L.find(x=>x.story).id);
 o.gap=g('obGap')();o.early=g('obEarly')();g('OB').q=['tame','weak','guild'];o.pick=g('obPickNext')();
 A.META.tipLog=[{id:'weak',t:Date.now()-5000},{id:'tame',t:Date.now()}];A.V.modal={type:'hintlog',sort:'time'};A.render();o.log=document.querySelector('#modal')?.innerText.slice(0,120);
 A.V.modal={type:'settings'};A.render();o.setBtn=!!document.querySelector('#modal [data-act="hintLog"]');
 A.V.modal=null;g('placeAt')('t0',5,5,'d');return o;});console.log(JSON.stringify(r));
  chk('the Guild Hall has nothing new while the guilds are locked (quests16), and its notices once the first Scourge falls',r.guild0===null&&(r.guild1==='new'||r.guild1==='ready')||JSON.stringify([r.guild0,r.guild1]));
  chk('Next goals lists the story step first, then the active quest',r.goals[0]==='st0a'&&r.hasQ&&r.goals.indexOf('q:h0(q)')===1||JSON.stringify(r.goals));
  chk('goal rows open the guide; the quest guide has Go and Hand in; the story guide renders',r.rowsClickable&&r.guide&&r.story);
  chk('early on tips come every 25 s and core battle tips go first',r.gap===25000&&r.early&&r.pick==='weak');
  chk('the Hint log lists seen tips and Settings has a Hint log button',/Hint log/.test(r.log||'')&&r.setBtn);
  await done(H);})();
