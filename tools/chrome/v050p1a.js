// Beta v0.5.0 1.1: no per area recruit cap. Only 4 offers, no refill until a shuffle, the cooldown and gold limit hiring.
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(()=>{const A=__A,G=A.G,o={hired:[],blocked:[]};G.gold=999999;
  // hire every offer through two shuffles: more than the old cap of 3 in one area
  for(let round=0;round<2;round++){const sl=A.tvSlots().filter(Boolean);
    sl.forEach(id=>{A.V.modal={type:'tavern'};A.render();const b=document.querySelector(`[data-act="hire"][data-arg="${id}"]`);if(!b||b.disabled){o.blocked.push(id);return;}A.ACT.hire(id);if(G.roster[id])o.hired.push(id);else o.blocked.push(id);});
    A.V.modal={type:'tavern'};A.render();o['txt'+round]=document.body.innerText;
    const t=A.tvInit();t.ev=true;t.at=-99;}
  o.noRoom=/No room/i.test(o.txt0+o.txt1);o.leftLine=/Recruits left/i.test(o.txt0+o.txt1);
  // empty seats stay empty until the shuffle
  const t=A.tvInit();t.ev=false;t.at=999;const s1=A.tvSlots().slice();o.noRefill=s1.every(x=>x===null)||s1.filter(Boolean).length<=4;
  // gold is the only reason a button is disabled
  t.ev=true;t.at=-99;A.tvSlots();G.gold=0;A.V.modal={type:'tavern'};A.render();o.poorDisabled=[...document.querySelectorAll('[data-act="hire"]')].every(b=>b.disabled);
  G.gold=999999;A.render();o.richEnabled=[...document.querySelectorAll('[data-act="hire"]')].every(b=>!b.disabled);
  return o;});
chk('hired more than 3 tavern recruits in one area ('+r.hired.length+')',r.hired.length>3||JSON.stringify(r));
chk('no offer blocked for a reason other than gold',r.blocked.length===0||r.blocked.join(','));
chk('no "No room" text',!r.noRoom);
chk('no recruits left counter',!r.leftLine);
chk('no gold: hire buttons disabled',r.poorDisabled);
chk('gold: hire buttons enabled',r.richEnabled);
await done(H);})();
