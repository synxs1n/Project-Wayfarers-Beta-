// Beta v0.7.0 (1, 2): the turn order bar and foe intents (battle5.js).
// - Order: in auto battles every turn start is recorded with the bar's forecast (__A.B5.order, the same list the bar draws). The first
//   entry is always the unit acting now; the forecast's next entries are compared with the units that actually act after it.
// - Intents: each foe action is logged with the icon the screen showed for that foe just before it acted (read from the stage label or
//   the order bar) and the category of the action it did. With the foe types studied in the Bestiary the icon must equal the action
//   (>= 95%); unknown foes show "?".
// - The bar shows 6 (portrait) or 8 entries, the current unit is highlighted, the intent is in the bar too, no page errors.
// N=<battles> (default 10). Usage: PWHTML=../../out/aurelis3.html node v070ia.js
const {open,chk,done}=require('./pw');const {META,battle,AUTO_OK}=require('./v063lib');
const N=+process.env.N||10;
async function run(H,opt,know){await battle(H,opt);
  return H.ev(async o=>{const A=__A,B=A.B,X=A.B5;X.R.trace.length=0;
    // long fights: tougher foes and heroes, so every battle runs 40 turns
    B.en.forEach(e=>{e.S.mhp*=30;e.hp=e.S.mhp;});B.front.concat(B.back).forEach(c=>{c.S.mhp*=5;c.hp=c.S.mhp;});
    // the shared helper parks the foes at t=900; start them like a normal fight instead
    B.en.forEach((e,i)=>{e.next=B.time+15+i*23;});B.front.forEach((c,i)=>{if(c!==B.cur)c.next=B.time+20+i*31;});
    if(o.know)B.en.forEach(e=>{const b=A.META.best[e.base]=A.META.best[e.base]||{seen:1,kills:0,scan:0,known:{}};b.seen=Math.max(1,b.seen);b.scan=1;});
    else B.en.forEach(e=>{const b=A.META.best[e.base];if(b){b.scan=0;b.kills=0;}});
    A.render();const rec=[];const shownN=[];let last=null,firstOk=0,firstN=0,barOk=0,barN=0,curHi=0,curHiN=0;
    const snap=()=>{if(!A.B||A.B!==B||B.over)return;if(!(B.mode==='cmd'||B.mode==='enemy')||!B.cur)return;const key=B.cur.name+'@'+B.time;if(key===last)return;last=key;
      const f=X.order(8).map(q=>q.u.name);rec.push({cur:B.cur.name,f});firstN++;if(f[0]===B.cur.name)firstOk++;
      const chips=[...document.querySelectorAll('#border .oc')];barN++;const want=A.BL.mode==='tall'?X.cfg.order.tall:X.cfg.order.wide;shownN.push(chips.length);if(chips.length>=Math.min(4,f.length)&&chips.length<=want&&chips.map(c=>c.title.replace(/ \(acting now\)$/,'')).join('|')===f.slice(0,chips.length).join('|'))barOk++;
      curHiN++;const now=document.querySelector('#border .oc.now');if(now&&now.title.startsWith(B.cur.name))curHi++;};
    (0,eval)('('+o.ok+')')();// v0.9.9: Auto per foe type (v0.9.8) would stop the heroes' turns: these foes count as beaten by hand
    A.setPause(30);B.auto=true;A.V.auto=true;A.render();if(B.mode==='cmd')A.autoTurn();
    const t0=Date.now();while(!B.over&&rec.length<o.turns&&Date.now()-t0<60000){snap();await new Promise(q=>setTimeout(q,4));}
    A.V.auto=false;B.auto=false;A.setPause(99999);
    // forecast vs what happened: entry k of the forecast made at turn i against the actor of turn i+k
    let m1=0,n1=0,mw=0,nw=0;for(let i=0;i<rec.length;i++){for(let k=1;k<8&&i+k<rec.length;k++){const ok=rec[i].f[k]===rec[i+k].cur;if(k===1){n1++;if(ok)m1++;}nw++;if(ok)mw++;}}
    return {turns:rec.length,firstOk,firstN,barOk,barN,curHi,curHiN,m1,n1,mw,nw,trace:X.R.trace.slice(),shownN};},{know,turns:40,ok:AUTO_OK.toString()});}
(async()=>{const res={};let T1=0,M1=0,TW=0,MW=0,F=0,FN=0,BO=0,BN=0,CH=0,CHN=0,turns=0;const kn={ok:0,n:0,bad:[]},un={ok:0,n:0};
for(const [w,h] of [[390,844],[933,705]]){const H=await open({w,h,mobile:w<1000,pre:META('low')});
  for(let i=0;i<N;i++){const seed=300+i*17+w,know=i%3!==2,opt={seed,heroes:3+(i%4),foes:1+(i%5),boss:i%5===4,stage:i%5===4?1+(i%3):0,lv:20};
    const r=await run(H,opt,know);(res[w]=res[w]||[]).push(...r.shownN);turns+=r.turns;F+=r.firstOk;FN+=r.firstN;BO+=r.barOk;BN+=r.barN;CH+=r.curHi;CHN+=r.curHiN;M1+=r.m1;T1+=r.n1;MW+=r.mw;TW+=r.nw;
    r.trace.forEach(t=>{if(t.shown==null)return;if(t.known){kn.n++;if(t.shown===t.did)kn.ok++;else if(kn.bad.length<8)kn.bad.push(`${t.foe} showed ${t.shown} did ${t.did} (${t.sk})`);}else{un.n++;if(t.shown==='unknown')un.ok++;}});}
  await H.browser.close();}
Object.keys(res).forEach(w=>{const a=res[w];console.log(`${w} wide: bar entries min ${Math.min(...a)} max ${Math.max(...a)}`);});
console.log(`turns ${turns}; next actor ${M1}/${T1}; whole forecast window ${MW}/${TW}; intents known ${kn.ok}/${kn.n}, unknown "?" ${un.ok}/${un.n}`);kn.bad.forEach(b=>console.log('   ',b));
chk('the bar starts with the unit acting now, every turn',F===FN&&FN>0||`${F}/${FN}`);
chk('the bar shows the forecast in order (up to 6 entries on portrait, 8 wide; at least 4 when the row is short)',BO>=BN*.97&&BN>0||`${BO}/${BN}`);
chk('the acting unit is highlighted in the bar',CH>=CHN*.97&&CHN>0||`${CH}/${CHN}`);
chk('at least 300 turns played (30+ per battle)',turns>=300||turns);
chk('the next actor matches the forecast (>= 93%; auto Guards more since v0.7.5)',M1>=T1*.93||`${M1}/${T1}`);
// v0.7.5: battle4 makes auto Guard against telegraphed hits (Guard costs 0.6, the forecast assumes 1), so the window matches a bit less
chk('the whole forecast window matches what happened (>= 70%; Guard and free swaps reorder later turns)',MW>=TW*.70||`${MW}/${TW}`);
chk('a studied foe shows the action it then does (>= 95%)',kn.n>=40&&kn.ok>=kn.n*.95||`${kn.ok}/${kn.n}`);
chk('an unknown foe shows "?"',un.n>=10&&un.ok===un.n||`${un.ok}/${un.n}`);
// a scan reveals the intent at once
{const H=await open({w:390,h:844,mobile:true,pre:META('low')});await battle(H,{seed:9,heroes:3,foes:2});
  const r=await H.ev(()=>{const A=__A,B=A.B,e=B.en[0];B.en.forEach((x,i)=>{x.next=B.time+15+i*23;});const b=A.META.best[e.base];if(b){b.scan=0;b.kills=0;}A.render();const q=()=>{const el=document.querySelector(`#bstage .b5it[data-u="e:0"]`)||document.querySelector('#border .b5oi[data-u="e:0"]');return el&&el.dataset.cat;};
    const before=q();A.META.best[e.base].scan=1;A.render();const after=q();return {before,after,plan:A.B5.plan(e).cat,bar:document.querySelectorAll('#border .b5oi').length};});
  chk('before a scan the foe shows "?", after it the planned action',r.before==='unknown'&&r.after===r.plan||JSON.stringify(r));
  chk('foe entries in the bar carry the intent',r.bar>0||r.bar);
  // the forecast follows speed changes at once: slow the next foe and it moves back
  const s=await H.ev(()=>{const A=__A,B=A.B,X=A.B5,f0=X.order(8).map(q=>q.u.name),e=B.en.find(x=>x.hp>0);const cnt=(f,n)=>f.filter(x=>x===n).length,pos=(f,n)=>f.reduce((s,x,i)=>x===n?s+i:s,0),p0=[cnt(f0,e.name),pos(f0,e.name)];e.st.slow={t:9};const f1=X.order(8).map(q=>q.u.name),p1=[cnt(f1,e.name),pos(f1,e.name)];delete e.st.slow;
    const c=B.cur;c.st.haste={t:9};const n0=f0.filter(n=>n===c.name).length,n1=X.order(8).filter(q=>q.u===c).length;delete c.st.haste;A.render();return {p0,p1,n0,n1};});
  chk('slow moves a foe later in the forecast (fewer or later turns), haste gives a hero more turns',(s.p1[0]<s.p0[0]||(s.p1[0]===s.p0[0]&&s.p1[1]>s.p0[1]))&&s.n1>s.n0||JSON.stringify(s));
  await H.browser.close();}
const H=await open({});await done(H);})();
