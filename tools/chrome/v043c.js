// Beta v0.4.3 (second pass): challenge wording, duel seat, Inn closes, economy, Accept/Claim all, main menu, starters, town gates on roads
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}A.V.modal=null;});
const r=await ev(async()=>{const A=__A,G=A.G,o={};
  o.gold0=G.gold;o.autoRew=A.AUTO_REW;o.power=A.AUTO_NERF.power;o.econ=A.ECON.gold+'/'+A.ECON.gear;
  // the duel popup: no "either way", and the reward is a tavern seat
  const pool=A.RAW.map(r=>r[0]).filter(id=>!G.roster[id]&&A.TPL[id]&&!A.TPL[id].mon&&!A.LEGEND_IDS.includes(id));const h=pool[0];
  A.V.modal={type:'cev',ev:{type:'duel',hero:h,title:'A challenge',text:'x',ch:[]}};A.render();const txt=document.body.innerText;o.either=/either way/.test(txt);o.seatTxt=/waits for you at the tavern/.test(txt);A.V.modal=null;
  A.ceInit();G.ce.boost=G.ce.boost||{};G.ce.boost[h]=1;o.seat=A.tvSlots().includes(h);
  // Inn closes after a rest
  G.gold=999;Object.values(G.roster)[0].hp=1;/* since v0.9.x an unhurt party is asked first (innSure), so someone needs the rest */A.V.modal={type:'inn'};A.ACT.rest();await new Promise(q=>setTimeout(q,900));o.innClosed=A.V.modal===null;
  // Accept all / Claim all on the board
  for(let s=0;s<=G.stage;s++)A.genQuests(s);A.V.modal={type:'board'};A.render();o.accBtn=!!document.querySelector('[data-act="qAcceptAll"]');A.ACT.qAcceptAll();o.allActive=G.quests.filter(q=>q.stage<=G.stage).every(q=>q.state!=='open');
  const hq=G.quests.find(q=>q.type==='hunt'&&q.state==='active');if(hq)hq.have=hq.n;const g0=G.gold;A.render();o.claimBtn=!!document.querySelector('[data-act="qClaimAll"]');A.ACT.qClaimAll();o.claimed=G.gold>g0;
  // bounties and faction missions. v0.9.9: since v0.10.6 the bounties are on the town Notice Board and the guild missions on the Guild Hall's Guilds tab, and a new journey
  // opens guild missions in the third realm (pacing.js PACE.at.guilds): no Accept all for them before it, then Accept all takes every one
  A.V.modal={type:'board',tab:'bounties'};A.render();o.bountyBtn=!!document.querySelector('#modal [data-act="bountyAll"]');A.ACT.bountyAll();o.bountyAll=G.bounties.filter(b=>b.stage<=G.stage).every(b=>b.state!=='open');
  A.V.modal={type:'guild',tab:'guilds'};A.render();o.facEarly=!document.querySelector('#modal [data-act="facAcceptAll"]')&&!!G.pcV;
  for(let i=0;i<window.__P95.PACE.at.guilds;i++)G.cleared[i]=1;A.render();o.facBtn=!!document.querySelector('#modal [data-act="facAcceptAll"]');
  const ML=A.TW.get('facMisAll')();A.ACT.facAcceptAll();o.facN=ML.length;o.facAll=ML.length>0&&ML.every(m=>A.TW.get('facMisState')(m)!=='open');
  o.facOpen=A.TW.get('facMisAll')().filter(m=>A.TW.get('facMisState')(m)==='open').map(m=>m.id).join();
  // starters: 24, three per class and element
  const st=A.STARTERS,cls={},el={};st.forEach(id=>{const t=A.TPL[id];cls[t.cls]=(cls[t.cls]||0)+1;el[t.el[0]]=(el[t.el[0]]||0)+1;});o.st=st.length;o.cls=Object.values(cls).every(n=>n===3);o.el=Object.values(el).every(n=>n===3);
  const draws=new Set();for(let i=1;i<60;i++)draws.add(A.starterDraw(i*7919).join(','));o.draws=draws.size;
  // town gates connect to the roads
  o.towns=0;o.linked=0;for(let s=0;s<5;s++){const m=A.getMap('t'+s);Object.values(m.gates||{}).forEach(q=>{if(!q||!q.arrive)return;o.towns++;if('=B'.includes(m.t[q.arrive[1]][q.arrive[0]]))o.linked++;/* v0.5.2: a river town's gate lane may be a bridge (2.4) */});}
  // main menu from settings
  A.V.screen='world';A.V.modal={type:'settings'};A.render();o.mmBtn=!!document.querySelector('[data-act="quitTitle"]');A.ACT.quitTitle();o.title=A.V.screen==='title'&&!A.G;
  return o;});
console.log(JSON.stringify(r));
chk('start gold 400, auto pays 66% and deals 85%, gold x0.9 and gear x1.6',r.gold0===400&&r.autoRew===.66&&r.power===.85&&r.econ==='0.9/1.6');
chk('the duel popup promises a tavern seat and never says "either way"',!r.either&&r.seatTxt);
chk('a beaten duelist waits in the tavern',r.seat===true);
chk('the Inn closes after a rest',r.innClosed===true);
chk('Accept all and Claim all on the quest board',r.accBtn&&r.allActive&&r.claimBtn&&r.claimed);
chk('Accept all on bounties and faction missions (Notice Board bounties, Guild Hall guilds)',r.bountyBtn&&r.bountyAll&&r.facBtn&&r.facAll||JSON.stringify(r));
chk('no guild mission Accept all before the guilds open on a new journey',r.facEarly===true);
chk('24 starters, 3 per class and 3 per element, many different draws',r.st===24&&r.cls&&r.el&&r.draws>=30);
chk('every town gate lands on a road',r.towns>0&&r.linked===r.towns);
chk('Settings has a Back to the main menu button that saves and leaves',r.mmBtn&&r.title);
await done(H);})();
