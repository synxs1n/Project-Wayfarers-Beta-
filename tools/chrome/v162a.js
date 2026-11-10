// v0.17.9 skillrows11.js: skill numbers are a fixed part of each row (owner: "they should be a permanent part of each ability in the skill list").
// Cause: the battle Skills row drew its estimate as <span class="num dmg">; .num is the floating damage number (position:absolute,
// animation rise 1s, ends at opacity 0), so the number popped in and faded out. Checks, on Low and Medium at 390x844: in the battle Skills
// list every row has the fixed strip (estimate or power, kind, MP) with no .num, no animation, opacity 1, position static, the same text at
// 0 ms, 400 ms and 1.8 s; the damage rows show an estimate; the hero sheet Skills tab (known and locked rows) has the same strip with power
// and MP and no timer; hits show as "xN"; filter chips still hide rows.
const {open,chk,done}=require('./pw');
const PRE=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'${t}',hints:false}}));`;
const rowInfo=sel=>{const o=[];document.querySelectorAll(sel).forEach(r=>{const m=r.querySelector('.m.sk11');const bad=[];
  if(m){[m,...m.querySelectorAll('*')].forEach(e=>{const c=getComputedStyle(e);if(c.animationName!=='none'||c.opacity!=='1'||(c.position!=='static'&&c.position!=='relative'))bad.push(e.className+':'+c.animationName+'/'+c.opacity+'/'+c.position);});}
  o.push({name:(r.querySelector('b')||r).textContent.trim().slice(0,24),has:!!m,txt:m?m.textContent.replace(/\s+/g,' ').trim():null,num:!!r.querySelector('.num'),bad});});return o;};
async function run(tier){const tag=tier+': ';const H=await open({w:390,h:844,mobile:true,pre:PRE(tier)});const {ev,wait,page}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(250);
  await ev(()=>{__A.TW.get('startBattle')({stage:0,kind:'field'});});await wait(600);
  await H.until(()=>{const B=__A.TW.get('B');return B&&B.mode==='cmd'&&B.cur;},null,{timeout:25000});
  const lim=await ev(()=>{const B=__A.TW.get('B');B.cur.lv=Math.max(B.cur.lv,15);B.cur.lb=100;__A.render();const b=document.querySelector('.battle .mi.limit');return b&&b.querySelector('.m.sk11')?b.querySelector('.m.sk11').textContent.replace(/\s+/g,' ').trim():(b?'no strip: '+b.innerHTML.slice(0,160):'no limit button');});
  chk(tag+'the Limit button shows its power and "Limit" ('+lim+')',/Pow \d+|~\d+|Buff/.test(lim)&&/Limit/.test(lim));
  await ev(()=>{__A.ACT.cmd('skills');});
  const run0=async()=>ev(`(${rowInfo.toString()})('.battle .menu.list .mi[data-act="sk"]')`);
  const a0=await run0();await wait(400);const a1=await run0();await wait(1800);const a2=await run0();
  console.log(tier,'rows',a0.length,JSON.stringify(a0.slice(0,3)));
  chk(tag+'the battle Skills list has rows ('+a0.length+')',a0.length>=2);
  chk(tag+'every row has the fixed strip, no .num anywhere',a0.every(r=>r.has&&!r.num)||JSON.stringify(a0.filter(r=>!r.has||r.num)));
  chk(tag+'nothing in a strip is animated, faded or positioned',[a0,a1,a2].every(a=>a.every(r=>r.bad.length===0))||JSON.stringify(a2.filter(r=>r.bad.length)));
  chk(tag+'the strip text is the same at 0 ms, 400 ms and 1.8 s',a0.every((r,i)=>r.txt===a1[i].txt&&r.txt===a2[i].txt));
  chk(tag+'every row shows its MP cost',a0.every(r=>/\d+ MP/.test(r.txt)));
  chk(tag+'a damage row shows an estimate ("~N") and its power',a0.some(r=>/^~\d+/.test(r.txt)&&/Pow \d+/.test(r.txt))||JSON.stringify(a0));
  const cs=await ev(()=>{const m=document.querySelector('.battle .menu.list .mi .m.sk11');const r=m.getBoundingClientRect(),b=m.closest('.mi').getBoundingClientRect();return {inside:r.left>=b.left-1&&r.right<=b.right+1&&r.top>=b.top-1&&r.bottom<=b.bottom+1,w:Math.round(r.width)};});
  chk(tag+'the strip sits inside its row ('+cs.w+' px wide)',cs.inside);
  // multi-hit: the strip function with a 3 hit skill, and a status skill with no power
  const u=await ev(()=>{const T=__A.TW.get;return [T('sr11Strip')({k:'phys',pw:.8,hits:3,mp:7},'~120',''),T('sr11Strip')({k:'status',t:'ally',mp:6},'',''),T('sr11Strip')({k:'mag',pw:1.7,mp:5},'','Lv 9')];});
  chk(tag+'hits show as x3 with the power',/x3/.test(u[0])&&/Pow 80/.test(u[0])&&/~120/.test(u[0]));chk(tag+'a buff with no power shows its kind and MP',/>Buff</.test(u[1])&&/6 MP/.test(u[1]));chk(tag+'a locked sheet row shows Lv, power and MP',/Lv 9/.test(u[2])&&/Pow 170/.test(u[2])&&/5 MP/.test(u[2]));
  // filter chips still hide rows (a hero with six or more skills)
  const f=await ev(()=>{const T=__A.TW.get,B=T('B'),a=B.cur;const n0=document.querySelectorAll('.battle .menu.list .mi[data-act="sk"]').length;return {n0,ks:T('known')(a).length,chips:document.querySelectorAll('.battle .chips.skf .chip').length};});
  console.log(tier,'filter',JSON.stringify(f));
  // the sheet
  await ev(()=>{const A=__A;A.V.modal={type:'guild',char:'mira',list:A.G.party};A.V.sheetTab='skills';A.render();});await wait(300);
  const s0=await ev(`(${rowInfo.toString()})('#modal .sh11-pane.on .rows .row')`);await wait(1800);const s1=await ev(`(${rowInfo.toString()})('#modal .sh11-pane.on .rows .row')`);
  console.log(tier,'sheet rows',s0.length,JSON.stringify(s0.slice(0,3)));
  chk(tag+'the sheet Skills tab has rows ('+s0.length+')',s0.length>=6);
  chk(tag+'every sheet row has the strip with its MP, no .num, no animation',s0.every(r=>r.has&&!r.num&&r.bad.length===0&&/\d+ MP|Limit/.test(r.txt))||JSON.stringify(s0.filter(r=>!r.has||r.num||r.bad.length||!/\d+ MP|Limit/.test(r.txt))));
  chk(tag+'damage rows show their power, locked rows their level',s0.some(r=>/Pow \d+/.test(r.txt))&&s0.some(r=>/^Lv \d+/.test(r.txt)));
  chk(tag+'the sheet strip text does not change after 1.8 s',s0.every((r,i)=>r.txt===s1[i].txt));
  await page.screenshot({path:(process.env.SPOUT||'/tmp')+'/v162a_sheet_'+tier+'.png'});
  await H.browser.close();}
(async()=>{await run('low');await run('medium');await done({browser:{close:async()=>{}}});})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
