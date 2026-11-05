// v0.4.0 Phase 5: connected world in the real game
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
const r=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();const o={bad:[]};
  o.wv=A.G.wv;
  // step through every gate with the real enterVia and check where we land
  const solidHere=()=>A.solidAt(A.WS.m,A.WS.x,A.WS.y);
  for(let s=0;s<5;s++){
    const t=A.getMap('t'+s),f=A.getMap('f'+s);
    A.V.modal=null;
    A.enterVia({m:'f'+s,g:'start'});if(A.WS.m.id!=='f'+s||solidHere())o.bad.push('into f'+s);
    const st=f.gates.start;
    // walking back out through the start gate lands at the matching town gate
    const ex=f.exits.find(e=>e.to&&e.to.m==='t'+s);A.enterVia(ex.to);A.V.modal=null;
    const tg=t.gates.next;if(A.WS.m.id!=='t'+s||A.WS.x!==tg.arrive[0]||A.WS.y!==tg.arrive[1]||solidHere())o.bad.push('back to t'+s);
    if(s<4){const e2=f.exits.find(e=>e.to&&e.to.m==='t'+(s+1));A.enterVia(e2.to);A.V.modal=null;const t2=A.getMap('t'+(s+1));
      if(A.WS.m.id!=='t'+(s+1)||A.WS.x!==t2.gates.prev.arrive[0]||solidHere())o.bad.push('into t'+(s+1));
      const e3=t2.exits.find(e=>e.to&&e.to.g==='end');A.enterVia(e3.to);A.V.modal=null;if(A.WS.m.id!=='f'+s||solidHere())o.bad.push('back to f'+s);}
  }
  o.plan=A.worldPlan().map(p=>p.cave||'-').join(',');
  return o;});
console.log(JSON.stringify(r));
chk('new journeys use world version 3',r.wv===3);
chk('every gate leads to the matching gate and lands on open ground',r.bad.length===0||r.bad.join());
// caves: enter, run the reward for each kind, leave
const c=await H.ev(()=>{const A=__A,o={};
  for(let s=0;s<5;s++){const f=A.getMap('f'+s);const cv=f.caves.find(c=>c.kind!=='fort');if(!cv)continue;
    A.placeAt('f'+s,cv.out[0],cv.out[1],'d');A.enterCave(cv,s);if(A.WS.m.id!=='k'+s||A.solidAt(A.WS.m,A.WS.x,A.WS.y))o.bad='enter k'+s;
    const k=A.WS.m;o['size'+s]=k.w+'x'+k.h;
    const d=A.getMap('d'+s);o['smaller'+s]=k.w*k.h<d.w*d.h;
    A.leaveCave('k'+s);if(A.WS.m.id!=='f'+s||A.WS.x!==cv.out[0]||A.WS.y!==cv.out[1])o.bad='leave k'+s;}
  // reward kinds
  const kinds={};const g0=A.G.gear.length;
  [['gear',1],['item',1],['charm',2],['recruit',2]].forEach(([kind,s])=>{A.worldPlan()[s].cave=kind;const before=A.G.gear.slice(),inv=JSON.stringify(A.G.inv),ro=Object.keys(A.G.roster).length;const msg=A.caveReward(s);
    kinds[kind]={msg,gear:A.G.gear.filter((x,i)=>i>=before.length),inv:JSON.stringify(A.G.inv)!==inv,roster:Object.keys(A.G.roster).length-ro};});
  o.kinds=kinds;return o;});
console.log(JSON.stringify(c));
chk('caves enter and leave correctly',!c.bad||c.bad);
chk('caves are smaller than the dungeons',[0,1,2,3,4].every(s=>c['smaller'+s]!==false));
chk('gear prize is a +2 piece',/\+2$/.test(c.kinds.gear.gear[0]||''));
chk('item prize adds items',c.kinds.item.inv===true);
chk('charm prize is the stage charm',c.kinds.charm.gear[0]==='c_cv2');
chk('recruit prize adds a challenge-only wayfarer',c.kinds.recruit.roster===1||c.kinds.recruit.msg.slice(0,60));
await done(H);
})();
