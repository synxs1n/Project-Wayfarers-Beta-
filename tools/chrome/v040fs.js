// v0.4.0 1.2: every field castable skill works through the real UI (target picker, MP cost, effect).
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:820,mobile:true});const {page,ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['lumen','mira','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const ids=['mend','purify','mendall','raise','fullmend','radward','miracle','song','req','secondwind','combo','wildmend','footnote'];
for(const sid of ids){
  const info=await ev((sid)=>{const A=__A;const G=A.G;
    const host=Object.keys(A.TPL).find(id=>!A.TPL[id].mon&&A.classSkills(A.TPL[id]).some(s=>s.id===sid&&(s.k==='heal'||s.k==='revive')));
    if(!host)return {skip:1};
    // make the host the first party member with a level that knows the skill and plenty of MP
    G.roster[host]=G.roster[host]||A.newChar(host,50,0);const c=G.roster[host];c.lv=50;A.refresh(c);
    G.party=[host].concat(G.party.filter(i=>i!==host)).slice(0,6);
    G.party.forEach(i=>{const t=G.roster[i];A.refresh(t);t.hp=t.S.mhp;t.mp=t.S.mmp;t.st={};});
    const sk=A.classSkills(A.TPL[host]).find(s=>s.id===sid&&(s.k==='heal'||s.k==='revive'));
    c.learned=c.learned||{};
    const known=A.skillKnown(c,sk);
    return {host,known,t:sk.t,k:sk.k,party:G.party.slice()};},sid);
  if(info.skip){console.log('SKIP no host',sid);continue;}
  if(!info.known){chk(sid+': host knows it at level 50',false);continue;}
  const tgt=await ev((sid)=>{const A=__A,G=A.G;const sk=A.classSkills(A.TPL[G.party[0]]).find(s=>s.id===sid&&(s.k==='heal'||s.k==='revive'));
    const vic=G.roster[G.party[sk.t==='ally'||sk.t==='allyAll'||sk.t==='dead'?1:0]];
    if(sk.t==='dead'||sk.k==='revive'){vic.hp=0;}else{vic.hp=Math.max(1,Math.floor(vic.S.mhp*.3));}
    if(sk.cleanse){vic.st={poison:{t:3}};}
    A.V.modal=null;A.ACT.fsOpen(G.party[0]);return {vic:vic.id,hp0:vic.hp,mp0:G.roster[G.party[0]].mp,mp:sk.mp};},sid);
  await wait(150);
  // click through the real buttons
  {const b=await page.$(`[data-act="fsPick"][data-arg="${sid}"]`);await b.scrollIntoViewIfNeeded();const r=await b.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);}await wait(150);
  const needs=await ev(()=>!!document.querySelector('[data-act="fsTgt"]'));
  if(needs){
    const btn=await page.$(`[data-act="fsTgt"][data-arg="${tgt.vic}"]`);
    const dis=btn?await btn.evaluate(b=>b.disabled):true;
    chk(sid+': target button for the hurt hero is enabled',(btn&&!dis)||'missing or disabled');
    if(btn&&!dis){await btn.scrollIntoViewIfNeeded();const r=await btn.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);}
  }
  await wait(200);
  const after=await ev((a)=>{const A=__A,G=A.G;const v=G.roster[a.vic];return {hp:v.hp,mp:G.roster[G.party[0]].mp};},tgt);
  chk(sid+': healed or revived the target',after.hp>tgt.hp0||JSON.stringify([tgt,after]));
  chk(sid+': MP cost paid ('+tgt.mp+')',after.mp===tgt.mp0-tgt.mp||JSON.stringify([tgt,after]));
}
await done(H);
})();
