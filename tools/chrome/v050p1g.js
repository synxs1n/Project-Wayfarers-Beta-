// Beta v0.5.0 1.8: every status shows a symbol (no letter tags) that stays inside its box, on the battle stage, battle cards and roster rows
const {open,chk,done}=require('./pw');
(async()=>{for(const [w,h] of [[390,844],[844,390],[1280,800]]){
const H=await open({w,h,mobile:w<1000});const {ev,wait,page}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.startBattle({stage:0,kind:'field'});});await wait(900);
const r=await ev(async()=>{const A=__A,B=A.B,o={};const ks=Object.keys(A.STS);
  // spread every status over the units, several each
  const us=B.en.concat(B.front);ks.forEach((k,i)=>{const u=us[i%us.length];u.st=u.st||{};u.st[k]={t:3,src:'self'};});
  A.render();await new Promise(q=>setTimeout(q,300));
  const els=[...document.querySelectorAll('.sti,.ail')];o.n=els.length;o.letters=els.filter(e=>/[A-Za-z]{2,}/.test(e.textContent.replace(/\d/g,''))).map(e=>e.outerHTML.slice(0,80));
  o.nosym=els.filter(e=>!e.classList.contains('more')&&!e.classList.contains('wx')&&!e.querySelector('svg.stsym')).map(e=>e.outerHTML.slice(0,80));
  o.spill=els.filter(e=>{const b=e.getBoundingClientRect();if(!b.width)return false;return [...e.querySelectorAll('svg')].some(s=>{const q=s.getBoundingClientRect();return q.left<b.left-.5||q.right>b.right+.5||q.top<b.top-.5||q.bottom>b.bottom+.5;})||e.scrollWidth>e.clientWidth+1;}).map(e=>e.getAttribute('aria-label')||e.title);
  // distinct shape per status
  o.shapes=A.stSym?new Set(ks.map(k=>A.stSym(k).replace(/data-st="[^"]*"/,''))).size:0;o.nks=ks.length;
  // tap still explains
  const b=document.querySelector('.sti[data-act="stInfo"]');if(b){b.click();await new Promise(q=>setTimeout(q,100));o.pop=!!document.querySelector('.stpop')&&document.querySelector('.stpop').innerText.length>10;}
  // roster rows: ailment chips on portraits
  A.V.modal=null;A.B.over=true;return o;});
const tag=w+'x'+h;
chk(`${tag}: ${r.n} status tags drawn, none with letters`,r.n>0&&r.letters.length===0||r.letters.slice(0,3).join(' '));
chk(`${tag}: every tag carries a symbol`,r.nosym.length===0||r.nosym.slice(0,3).join(' '));
chk(`${tag}: no symbol spills outside its box`,r.spill.length===0||r.spill.join(','));
chk(`${tag}: ${r.nks} statuses, ${r.shapes} distinct symbols`,r.shapes===r.nks);
chk(`${tag}: tapping a symbol still shows the explanation`,r.pop===true);
await H.browser.close();}
// party and roster rows outside battle
const H=await open({w:390,h:844,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const q=await ev(()=>{const A=__A,G=A.G,c=G.roster[G.party[0]];c.ail={poison:1,curse:1,wound:1};G.roster.brann=A.newChar('brann',3,0);G.roster.brann.ail={poison:1};const o={};
  for(const tab of ['party','roster','equip']){A.V.modal={type:'menu',tab};A.render();const a=[...document.querySelectorAll('.ail')];o[tab]=a.length?(a.every(e=>e.querySelector('svg.stsym')&&!/[A-Z]{2}/.test(e.textContent))?true:'letters'):'none';}
  return o;});
['party','roster','equip'].forEach(t=>chk(`${t} rows show ailment symbols`,q[t]===true||q[t]));
await done(H);})();
