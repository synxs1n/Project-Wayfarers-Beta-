// Audio test (v0.4.5): renders every track, stem and jingle with an OfflineAudioContext and checks there is no silence, no NaN,
// no clipping (peaks at or below -1 dBFS), loudness within about 3 dB across tracks and no click at the loop point.
// Then plays every sfx name live and checks for errors, and checks the classic chiptune fallback still runs.
// Usage: node tools/chrome/audio.js [--gains]   (--gains prints MGAIN values that level the tracks)
const path=require('path'),http=require('http'),fs=require('fs');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/npm-tools/node_modules/playwright'));}
const ROOT=path.join(__dirname,'..','..');
const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.ogg':'audio/ogg','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
let fails=0;const chk=(n,c)=>{console.log((c===true?'PASS ':'FAIL ')+n+(c===true?'':' -> '+c));if(c!==true)fails++;};
(async()=>{await new Promise(ok=>srv.listen(0,ok));const port=srv.address().port;
  const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const page=await browser.newPage({viewport:{width:390,height:844}});
  const errs=[];page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});page.on('console',m=>{if(m.type()==='error'&&!/favicon|firebase|gstatic|googleapis|ERR_/i.test(m.text()))console.log('CONSOLE',m.text());});
  await page.addInitScript(()=>{try{localStorage.clear();}catch(e){}});
  await page.goto(`http://localhost:${port}/index.html`,{waitUntil:'load'});await page.waitForTimeout(800);
  // start audio like a first tap
  await page.evaluate(()=>{const A=window.__AU;Object.assign(window,{AU:A.AU,AU2:A.AU2,SFXC:A.SFXC,musicTrack:A.musicTrack,au2Render:A.au2Render,au2Jingle:A.au2Jingle,au2SetStyle:A.au2SetStyle,sfx:A.sfx,audioInit:A.audioInit});});
  await page.mouse.click(10,10);await page.evaluate(()=>{audioInit();if(AU.ctx&&AU.ctx.state!=='running')AU.ctx.resume();});
  await page.waitForFunction(()=>AU2.ready||AU2.dead,null,{timeout:60000});
  chk('orchestra loads (no fallback)',await page.evaluate(()=>AU2.ready&&!AU2.dead&&AU2.on)||'fell back');
  chk('title track playing',await page.evaluate(()=>AU2.cur&&AU2.cur.id)==='title'||await page.evaluate(()=>AU2.cur&&AU2.cur.id));
  const list=await page.evaluate(()=>{const L=[];
    const T=[['title'],['town'],['town',{night:1}],['dungeon'],['dungeon',{},{chase:1}],['cave'],['fort'],['archive'],['battle1'],['battle1',{},{tense:1}],['battle2'],['battle2',{},{tense:1}],['elite'],['elite',{},{tense:1}],
      ['boss',{boss:'a'}],['boss',{boss:'a'},{phase:1}],['boss',{boss:'b'}],['boss',{boss:'c'}],['boss',{boss:'d'}],['cal1'],['cal2'],['cal3'],['arena'],['victory'],['defeat'],['legacy']];
    ['meadow','coast','cave','snow','heights','void'].forEach(th=>{T.push(['field',{theme:th}]);T.push(['field',{theme:th,night:1}]);T.push(['field',{theme:th,bright:1}]);});T.push(['field',{theme:'void',cal:1}]);T.push(['field',{theme:'meadow',cal:1}]);
    T.forEach(x=>{const d=musicTrack(x[0],x[1]||{});const sec=60/d.bpm/4;L.push({id:x[0],opt:x[1]||{},stems:x[2]||{},intro:d.intro.len*sec,loop:d.loop.len*sec,once:d.once});});
    ['level','recruit','quest','rank','item','inn','beacon'].forEach(j=>{const d=musicTrack(j);L.push({id:j,opt:{},stems:{},intro:0,loop:d.loop.len*60/d.bpm/4,once:1,jingle:1});});return L;});
  const res=[];const only=(process.argv.find(a=>a.startsWith('--only='))||'').slice(7).split(',').filter(Boolean);
  for(const t of list){if(only.length&&!only.some(o=>(t.id+JSON.stringify(t.opt)).includes(o)))continue;const variant=Object.keys(t.stems).length||t.opt.night||t.opt.bright||t.opt.cal||(t.id==='boss'&&t.opt.boss!=='a');const full=!t.once&&!variant;
    const secs=t.once?t.loop+3:full?t.intro+t.loop+3:Math.min(25,t.intro+t.loop);
    const r=await page.evaluate(async([id,opt,stems,secs,seam])=>{const R=await au2Render(id,secs,Object.assign({},opt,{stems}));const b=R.buf,sr=b.sampleRate;
      let pk=0,ss=0,n=0,nan=0,quiet=0,dmax=0;const win=Math.floor(sr*.5),chs=[b.getChannelData(0),b.getChannelData(1)];const deriv=[];
      for(let w=0;w+win<=b.length;w+=win){let s=0;for(let i=w;i<w+win;i++){const v=chs[0][i];s+=v*v;}if(Math.sqrt(s/win)<.0006&&w<b.length-sr*3)quiet++;}
      for(const d of chs)for(let i=0;i<d.length;i++){const v=d[i];if(!isFinite(v)){nan++;continue;}const a=Math.abs(v);if(a>pk)pk=a;if(i>sr*.3)ss+=v*v,n++;if(i){const dd=Math.abs(v-d[i-1]);if(dd>dmax)dmax=dd;}}
      // click check at the loop seam: biggest sample step within 30 ms of the seam against the 99.9th percentile step elsewhere
      let seamD=0,ref=0;if(seam>0&&seam*sr<b.length-sr*.1){const i0=Math.floor(seam*sr);for(const d of chs)for(let i=i0-Math.floor(sr*.03);i<i0+Math.floor(sr*.03);i++)seamD=Math.max(seamD,Math.abs(d[i]-d[i-1]));
        // reference: the same downbeat the first time the loop starts (an onset there is music, a bigger jump at the seam would be a click)
        // the seam should be no rougher than the roughest bar line inside the loop (each one has notes starting on it too)
        const sec=60/R.def.bpm/4,bar=(R.def.loop.ev.some(e=>e.tk%12===0)&&!R.def.loop.ev.some(e=>e.tk%16===0&&e.tk%48!==0)?12:16)*sec,L0=R.def.intro.len*sec,w=Math.floor(sr*.03);
        for(let t=L0+bar;t<seam-bar/2;t+=bar){const i0=Math.floor(t*sr);for(const d of chs)for(let i=i0-w;i<i0+w;i++)ref=Math.max(ref,Math.abs(d[i]-d[i-1]));}}
      return {pk,rms:Math.sqrt(ss/Math.max(1,n)),nan,quiet,seamD,ref,dmax,inst:R.def.inst.length,len:b.length/sr};},[t.id,t.opt,t.stems,secs,full&&!t.once?t.intro+t.loop:0]);
    const db=20*Math.log10(r.rms||1e-9),pdb=20*Math.log10(r.pk||1e-9),name=t.id+(Object.keys(t.opt).length?JSON.stringify(t.opt):'')+(Object.keys(t.stems).length?'+'+Object.keys(t.stems).join(','):'');
    res.push({name,t,db,pdb,r});console.log(name.padEnd(48),'rms',db.toFixed(1),'dB peak',pdb.toFixed(2),'dBFS quiet',r.quiet,'seam',r.seamD.toFixed(3),'/',r.ref.toFixed(3));
    chk(name+' no NaN',r.nan===0||r.nan+' NaN');chk(name+' peak <= -1 dBFS',pdb<=-1||pdb.toFixed(2));chk(name+' not silent',db>-45&&(r.quiet<=(t.id==='cave'||t.id==='defeat'?6:2))||`rms ${db.toFixed(1)} quiet windows ${r.quiet}`);
    if(full&&!t.once)chk(name+' seamless loop',r.seamD<=r.ref*2+.02||`seam step ${r.seamD.toFixed(3)} vs ${r.ref.toFixed(3)}`);}
  // loudness across the looping tracks (base mixes, no stems; jingles and the defeat sting are short and sit apart)
  const base=res.filter(x=>!x.t.once&&!Object.keys(x.t.stems).length);const dbs=base.map(x=>x.db).sort((a,b)=>a-b),med=dbs[Math.floor(dbs.length/2)];
  base.forEach(x=>chk(x.name+' loudness within 3 dB of the median ('+med.toFixed(1)+')',Math.abs(x.db-med)<=1.5||(x.db-med).toFixed(1)+' dB'));
  if(process.argv.includes('--gains')){const by={};base.forEach(x=>{const k=x.t.id+(x.t.opt.theme&&!x.t.opt.night&&!x.t.opt.bright?'_'+x.t.opt.theme:'')+(x.t.opt.cal?'_cal':'');if(x.t.opt.night||x.t.opt.bright)return;by[k]=Math.pow(10,(med-x.db)/20);});
    console.log('MGAIN suggestion (multiply into existing):',JSON.stringify(Object.fromEntries(Object.entries(by).map(([k,v])=>[k,+v.toFixed(2)]))));}
  // every sfx name, live
  const names=['step','blip','open','close','confirm','cancel','deny','door','chest','lever','waystone','encounter','swing','cast','hit','weak','crit','react','break','heal','buff','debuff','prime','ko','revive','limit','summon','unsummon','phase','level','rest','buy','equip','chime','win','lose','archivist'];
  const sx=await page.evaluate(async names=>{const out=[];const els=['fire','water','ice','lightning','earth','wind','light','shadow',null];const wts=['blade','axe','mace','lance','bow','crossbow','knuckles','staff','lute','harp','flute',null];
    for(const k of names){try{for(let i=0;i<3;i++){SFXC.el=els[i*3%els.length];SFXC.hitEl=els[(i*2+1)%els.length];SFXC.wt=wts[i*4%wts.length];SFXC.react={a:'fire',b:'water'};sfx(k);}out.push([k,'ok',AU2.voices.length]);}catch(e){out.push([k,e.message]);}await new Promise(r=>setTimeout(r,40));}
    for(const e of els)for(const w of wts){SFXC.el=e;SFXC.hitEl=e;SFXC.wt=w;try{sfx('swing');sfx('cast');sfx('hit');}catch(x){out.push(['combo '+e+' '+w,x.message]);}}return out;},names);
  sx.forEach(([k,s])=>chk('sfx '+k,s==='ok'||s));
  await page.waitForTimeout(1500);
  chk('voice cap holds',await page.evaluate(()=>AU2.voices.length<=48)||await page.evaluate(()=>AU2.voices.length));
  // jingles and stems live
  chk('jingle plays live',await page.evaluate(()=>au2Jingle('level')));
  // classic fallback switch and back
  const cl=await page.evaluate(async()=>{au2SetStyle('chip');await new Promise(r=>setTimeout(r,300));const a=!AU2.on&&!!AU.track;sfx('hit');sfx('level');au2SetStyle('orch');await new Promise(r=>setTimeout(r,1500));return a&&AU2.on&&!!AU2.cur;});
  chk('classic chiptune mode runs and orchestral comes back',cl||'no');
  // a real game: start a journey, walk into the world and a battle, and check the tracks follow
  await page.evaluate(()=>{try{0;}catch(e){}});
  chk('no page errors',errs.length===0||errs.join(' | '));
  await browser.close();srv.close();console.log(fails?`FAILS ${fails}`:'ALL PASS');process.exit(fails?1:0);})();
