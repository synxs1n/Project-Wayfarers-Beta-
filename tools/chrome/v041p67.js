// v0.4.1 6.7: personal quest rewards are unique bound items in three slots, and they change the hero's look
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(()=>{const A=__A,G=A.G,o={};const ids=A.RAW.map(r=>r[0]).filter(id=>!A.TPL[id].mon);const cnt={w:0,a:0,c:0};
  ids.forEach(id=>cnt[A.sigKind(id)]++);o.cnt=cnt;o.n=ids.length;
  o.legW=A.LEGEND_IDS.every(id=>A.sigKind(id)==='w');
  o.gear=ids.every(id=>{const g=A.GEAR[A.sigGid(id)];return g&&g.only===id&&g.slot===A.sigKind(id);});
  // reward + look for one hero of each kind
  o.looks={};['w','a','c'].forEach(k=>{const id=ids.find(i=>A.sigKind(i)===k&&!A.LEGEND_IDS.includes(i)&&A.TPL[i].look);const c=A.newChar(id,25,2);G.roster[id]=c;const b={personal:id,state:'active'};const info={gold:0};
    const base=JSON.stringify(A.heroLook(id));A.personalDone(b,info);const gid=info.gear;const sl=A.GEAR[gid].slot;c.eq=c.eq||{};c.eq[sl]=gid;
    o.looks[k]={gid,slot:sl,changed:JSON.stringify(A.heroLook(id))!==base,canEq:A.canEquip(c,gid),sig:A.hasSignature(id),other:(()=>{const x=ids.find(q=>q!==id);return A.canEquip(A.newChar(x,25,2),gid);})()};});
  // an old save: hero already holds the old u_ weapon keeps it
  const old=ids.find(i=>A.sigKind(i)!=='w'&&A.TPL[i].look);const oc=A.newChar(old,25,2);G.roster[old]=oc;G.gear.push('u_'+old);const ob={personal:old,state:'active'},oi={gold:0};A.personalDone(ob,oi);o.oldKeeps=oi.gear==='u_'+old;
  return o;});
console.log(JSON.stringify(r));
chk('6.7 split is about 40/30/30 and legendaries stay on weapons',r.cnt.w>=r.n*.3&&r.cnt.a>=r.n*.2&&r.cnt.c>=r.n*.2&&r.legW);
chk('6.7 every hero has a registered, bound item in the right slot',r.gear===true);
chk('6.7 each kind changes the look, equips for its owner only',['w','a','c'].every(k=>r.looks[k].changed&&r.looks[k].canEq&&r.looks[k].sig&&!r.looks[k].other&&r.looks[k].slot===k));
chk('6.7 a hero who already holds the old weapon keeps it',r.oldKeeps===true);
await done(H);})();
