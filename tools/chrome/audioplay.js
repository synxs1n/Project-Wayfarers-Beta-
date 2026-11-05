// Audio gameplay check (v0.4.5): over http with the real samples, start a journey and check the music follows the game:
// town, field, battle with a stinger, the tension layer, victory, the field resuming where it left off, Settings rows and the Music Room.
const path=require('path'),http=require('http'),fs=require('fs');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/npm-tools/node_modules/playwright'));}
const ROOT=path.join(__dirname,'..','..');const TY={'.html':'text/html','.js':'text/javascript','.json':'application/json','.ogg':'audio/ogg','.mp3':'audio/mpeg','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':TY[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
let fails=0;const chk=(n,c)=>{console.log((c===true?'PASS ':'FAIL ')+n+(c===true?'':' -> '+c));if(c!==true)fails++;};
(async()=>{await new Promise(ok=>srv.listen(0,ok));const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage({viewport:{width:390,height:844}});const errs=[];page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
  await page.addInitScript(()=>{try{localStorage.clear();}catch(e){}});await page.goto(`http://localhost:${srv.address().port}/index.html`);await page.waitForTimeout(600);
  const ev=(f,a)=>page.evaluate(f,a),wait=ms=>page.waitForTimeout(ms);
  await page.mouse.click(5,5);await ev(()=>{__AU.audioInit();});await page.waitForFunction(()=>__AU.AU2.ready||__AU.AU2.dead,null,{timeout:60000});
  const cur=()=>ev(()=>__AU.AU2.cur&&__AU.AU2.cur.key);
  chk('title plays',/^title/.test(await cur())||await cur());
  await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(1500);
  chk('town plays in town',/^town\|/.test(await cur())||await cur());
  await ev(()=>{__A.G.clock=0;});
  await ev(()=>{__A.placeAt('f0',6,6,'r');__AU.render();});await wait(1400);const fk=await cur();chk('field plays in the field',/^field\|/.test(fk)||fk);
  await wait(3000);const pos0=await ev(()=>__AU.AU2.cur.next);
  await ev(()=>{__A.startBattle({stage:0,kind:'field'});});await wait(1500);
  chk('battle I plays in a stage 1 battle',/^battle1/.test(await cur())||await cur());
  chk('tension layer off at full HP',await ev(()=>!__AU.AU2.cur.stems||!__AU.AU2.cur.stems.tense));
  await ev(()=>{const c=__A.B.front[0];c.hp=Math.max(1,Math.floor(c.S.mhp*.2));});await wait(1300);
  chk('tension layer fades in under 30% HP',await ev(()=>!!(__AU.AU2.cur.stems&&__AU.AU2.cur.stems.tense)));
  await ev(()=>{__A.B.en.forEach(e=>e.hp=0);try{__A.win();}catch(e){}__AU.render();});await wait(1300);
  const vk=await cur();chk('victory plays on the result screen',/^victory/.test(vk)||vk+' modal '+await ev(()=>__A.V.modal&&__A.V.modal.type));
  await ev(()=>{__A.V.modal=null;try{__A.finishBattle('win');}catch(e){}__AU.render();});await wait(1500);
  const fk2=await cur(),pos1=await ev(()=>__AU.AU2.cur.next);chk('field resumes after the battle',fk2===fk||fk2);chk('field picks up where it left off',pos1>pos0&&pos1<pos0+40||`${pos0} -> ${pos1}`);
  await ev(()=>{__A.V.modal={type:'menu',tab:'settings'};__AU.render();});await wait(300);
  const st=await ev(()=>document.getElementById('modal').innerText);chk('Settings has Ambience, Music style and Credits',/Ambience/.test(st)&&/Music style/.test(st)&&/Credits/.test(st)||st.slice(0,200));
  await ev(()=>{__A.V.modal={type:'menu',tab:'music'};__AU.render();});await wait(300);
  const mr=await ev(()=>document.getElementById('modal').innerText);chk('Music Room lists tracks',/Music Room/.test(mr)&&/Title: The Meridian/.test(mr)||mr.slice(0,300));
  await ev(()=>{__A.ACT.mrPlay(15);});await wait(1200);chk('Music Room plays a track on demand',/^battle1/.test(await cur())||await cur());
  await ev(()=>{__A.ACT.mrStop();__A.V.modal=null;__AU.render();});await wait(1500);chk('leaving the Music Room returns to the field',(await cur())===fk||await cur());
  await ev(()=>{__A.ACT.creditsOpen();});await wait(200);chk('Credits name FluidR3 and the CC BY renders',await ev(()=>/FluidR3_GM/.test(document.getElementById('modal').innerText)&&/Attribution 3\.0/.test(document.getElementById('modal').innerText)));
  await ev(()=>{__A.V.modal=null;__AU.render();});
  chk('ambience runs in the field',await ev(()=>!!__AU.AMB.L.wind));
  chk('voices under the cap',await ev(()=>__AU.AU2.voices.length<=48)||await ev(()=>__AU.AU2.voices.length));
  // performance: a heavy battle on a phone sized page, frame times while audio plays
  await ev(()=>{__A.startBattle({stage:2,kind:'field'});});await wait(1500);
  const ft=await ev(()=>new Promise(ok=>{const t=[];let last=performance.now();const f=n=>{t.push(n-last);last=n;if(t.length<180)requestAnimationFrame(f);else{t.sort((a,b)=>a-b);ok({p50:t[90],p95:t[171],max:t[179]});}};requestAnimationFrame(f);}));
  console.log('frame ms',JSON.stringify(ft),'voices',await ev(()=>__AU.AU2.voices.length));chk('frames hold during a battle with music (p95 < 34 ms)',ft.p95<34||JSON.stringify(ft));
  chk('no page errors',errs.length===0||errs.join(' | '));
  await browser.close();srv.close();console.log(fails?`FAILS ${fails}`:'ALL PASS');process.exit(fails?1:0);})();
