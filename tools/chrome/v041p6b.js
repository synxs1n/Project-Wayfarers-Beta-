// v0.4.1 6.6: personal quests need level 20, the second town and 40 battles together (per hero, per journey)
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(()=>{const A=__A,G=A.G,o={};const c=G.roster[G.party[0]];o.fresh=c.bt;
  c.lv=25;G.stage=1;G.cleared[0]=true;c.bt=10;o.few=A.personalEligible(c);c.bt=40;o.enough=A.personalEligible(c);
  // an old save: no bt field, estimated from level
  delete c.bt;o.estimate=A.btOf(c);o.oldOk=A.personalEligible(c);
  // saved and reloaded
  c.bt=7;const raw=A.packG();o.saved=raw.roster[c.id].bt;c.bt=0;o.zeroSaved=A.packG().roster[c.id].bt;
  const nc=A.newChar('brann',20,2);o.recruitBt=nc.bt;
  return o;});
console.log(JSON.stringify(r));
chk('6.6 a new hero starts at 0 battles together',r.fresh===0&&r.recruitBt===0);
chk('6.6 level 25 and the second town are not enough with 10 battles',r.few===false);
chk('6.6 40 battles together unlocks it',r.enough===true);
chk('6.6 an old save without the field estimates from level (level 25 -> enough)',r.estimate>=40&&r.oldOk===true);
chk('6.6 the count is saved, including zero',r.saved===7&&r.zeroSaved===0);
const t=await ev(()=>{const A=__A,G=A.G;const c=G.roster[G.party[0]];c.bt=12;A.V.modal={type:'char',id:c.id,list:G.party};A.render();return document.body.innerText.includes('Battles together: 12 of 40');});
chk('6.6 the hero sheet shows "Battles together: X of N"',t===true);
await done(H);})();
