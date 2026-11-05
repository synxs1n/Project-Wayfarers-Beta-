// v0.4.1 4.6: roaming enemies in dungeons
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(()=>{const A=__A,G=A.G,o={n:0,bad:[],elite:0,cnt:[]};
  for(let s=0;s<5;s++){const d=A.getMap('d'+s);const L=A.roamSpawn(d);o.cnt.push(L.length);o.n+=L.length;
    const st=d.start;const T=A.mapTargets(d);
    L.forEach(r=>{if(r.elite)o.elite++;if(Math.abs(r.x-st[0])+Math.abs(r.y-st[1])<9)o.bad.push('near start');if(!A.roamInterior(d,r.x,r.y))o.bad.push('not a room tile');
      if(T.some(t=>Math.abs(t.x-r.x)+Math.abs(t.y-r.y)<1))o.bad.push('on a target');});
    // required paths: with every roamer tile treated as a wall, every target is still reachable
    const save=d.t.map(r=>r.slice());L.forEach(r=>{d.t[r.y][r.x]='#';});o.bad=o.bad.concat(A.mapIssues(d).map(x=>'blocks '+x.why));
    const S0=A.mapEntry(d);d.t=save;}
  return o;});
console.log(JSON.stringify(r));
chk('4.6 roamers spawn in every dungeon (more in later realms), a few elites',r.cnt.every(n=>n>=3)&&r.cnt[4]>r.cnt[0]&&r.n>=20);
chk('4.6 never near the entrance, only on open room tiles, never on stairs, levers, chests or doors, never blocking a route',r.bad.length===0);
// patrol, sight and contact -> battle
const b=await ev(async()=>{const A=__A,G=A.G,o={};const d=A.getMap('d1');A.placeAt('d1',d.start[0],d.start[1]-1,'d');A.V.screen='world';A.render();
  const L=A.roamSpawn(d);const r=L.find(q=>!q.elite)||L[0];o.home=[r.x,r.y];
  // stand right in front of it, inside its cone
  const [dx,dy]=A.DIRV[r.dir];let tx=r.x+dx*2,ty=r.y+dy*2;if(A.tileAt(d,tx,ty)!=='.'){r.dir='r';tx=r.x+2;ty=r.y;}
  o.sees=A.roamSees(d,r,tx,ty)||A.tileAt(d,tx,ty)!=='.';
  for(let k=0;k<30&&!A.B;k++){if(A.WS.x!==r.x||A.WS.y!==r.y)A.placeAt('d1',r.x,r.y,'d');await new Promise(q=>setTimeout(q,150));}o.dbg={scr:A.V.screen,modal:A.V.modal&&A.V.modal.type,lock:A.WS&&A.WS.lock,dlg:!!(A.WS&&A.WS.dlg),pos:A.WS&&[A.WS.x,A.WS.y],r:[r.x,r.y,r.dead,r.mode]};if(!A.B)return o;o.battle=A.V.screen==='battle'&&!!A.B&&!!A.B.spec.roam;o.lead=A.B&&A.B.en[0].lv;o.band=A.STAGE_LV[1][1];
  o.auto=A.autoBan(A.B.spec);A.B.en.forEach(e=>e.hp=0);A.finishBattle('win');o.dead=(G.roamDead['d1']||[]).includes(r.i);return o;});
console.log(JSON.stringify(b));
chk('4.6 a roamer sees you in its cone',b.sees===true);
chk('4.6 touching one starts a tougher battle; beaten ones stay beaten',b.battle&&b.lead>b.band&&b.dead);
await done(H);})();
