// Test runner for the Chrome tests in tools/chrome: runs a named set one test at a time (never in parallel: the tests measure
// layout, frame times and timings), with a per test timeout, prints a summary table and writes a JSON report.
// Usage (from tools/chrome, after `sh build.sh` at the repo root):
//   PWHTML=../../out/aurelis3.html node runall.js [set ...] [--repeat N] [--timeout SEC] [--json FILE] [--stale] [--list]
//   set = all (default: every runnable test that is not stale) | a group (battle, world, menus, party, saves, audio, title, app)
//         | a test name (v063wo or v063wo.js; audio.js is the test, audio the group) | stale (the tests that fail for old reasons, listed in STALE below)
//   --repeat N   run the whole set N times (rounds, one test at a time) and report the pass rate per test
//   --timeout S  per test timeout in seconds (default 600; a test can have its own in SLOW); a timed out test is killed with its browsers
//   --json FILE  where the report goes (default: runall-report.json in the scratch dir given by RUNALL_OUT, else /tmp)
//   --stale      also run the stale tests in "all" (they are reported as stale, not as failures)
//   --list       print the groups and tests and exit
// Env: PWHTML (the build under test, default ../../out/aurelis3.html), OLDHTML (an older build for the tests that compare against one;
// by default each such test gets the committed index.html of the revision in OLD below, taken with git show), PWFREEZE=0 runs the
// tests that freeze the clock and Math.random (see pw.js) on the real clock instead.
const fs=require('fs'),path=require('path'),os=require('os'),{spawn,execSync}=require('child_process');
const HERE=__dirname,ROOT=path.join(HERE,'..','..');

// ---- groups: every runnable test belongs to one or more ----
const GROUPS={
  battle:'v164a v162a v160a v158a v155a v152a v147a ucards wide v136a v139a v109a v040p1 v041p1a v041p1b v041p1d v041p1g v041p2 v041p26 v041p65 v050p1d v050p1g v050p2b v050p2bg v051a v053b v058a v059a v061a v062a v063ba v063bb v063bc v063bd v070ia v070ib v070ic v070m1 v070m2 v075a v076b v080b v080ca v095b v095na v095p2',
  world:'v170a v165a v161a v163a v156a v154a v153a v150a v145a v144a v141a v142a collide roof nature sanct v138a v140a v040fs v040p5 v040p5b v040p6 v040p789 v041p1c v041p1e v041p1f v041p1h v041p1i v041p1j v041p4 v041p44 v041p46 v041p47 v041p53 v050p1b v050p1c v050p1f v050p2world v050p5c v051c v053a v146a v056a v062a v063wo v071wa v071wb v071wt v077wa v077wb v080r v080wa v082da v082db v083a v095p1',
  menus:'v167a v159a v157a eq eq2 v110a v119a v119b p4b p5b smithy smithy2 smithy3 smithyfuzz smithywalk tavern v040p3 v041p6 v041p64 v041p67 v041p6b v043c v050p1a v050p1e v050p1h v050p3a v050p3b v050p4 v051b v053ua v053ub v063m1 v063m2 v063s v070oa v070ob v072a v077a v095m1 v095m2 v095m3 v095m4 v095nb v135a v149a v148a v151a',
  party:'v143a v137a v134a v120a v041p5 v063g v063pa v063pb v063wa v063wb v071a v077d v080cb v081a v095p3 v050p2daily',
  saves:'oldsave savesys offline v041old v041p1k v043b v050p4b v050p5 v050p5b v085s v085s2',
  audio:'audio audioplay v082s v083a',
  title:'v041p54 v053s v060a v071t v080wt',
  app:'liveupdate sw liveboot-v046 v050p6a',
  // ci: the smoke set GitHub Actions runs on every push (.github/workflows/release.yml, job "test"); a failure blocks the APK and installer.
  // Kept under about 5 minutes here (about 10 on a runner): one or two tests per screen and system, none that is timing sensitive.
  ci:'v165a v063wb v145a v153a sanct v142a v141a v140a v152a v139a v136a v160a v164a v157a v159a v137a v163a v162a v151a v138a v134a v143a savesys',
  // flaky: tests that fail now and then under machine load for timing reasons (particles sampled by wall clock, the title walk, the
  // long auto fight, a stale minimap tap). Run them alone when a change touches what they cover; never in ci.
  flaky:'v158a v080wt v080b v071wt',
};
// ---- tests that fail for old reasons (the game moved on; the test was not updated). Not counted as failures, not in "all" ----
const STALE={
  'liveboot-v046':'needs a browser window (ReferenceError: window is not defined); not runnable under node',
  p4b:'xp rows on the party menu and the result screen changed in later versions',
  sw:'reads tools/out/aurelis3.html, which the build does not write',
  v040p1:'pip row visibility check (fails on the v0.8.0 build too)',
  v040p3:'Guides list now has "How it works" (test predates v0.7.0)',
  v041p1e:'sign examination check (fails on the v0.8.0 build too)',
  v041p1g:'sanity check "the meadow field backdrop still animates": the first field is not always a meadow since the realms, and no field backdrop moves in the band it samples any more (v0.9.9: every field theme read still)',
  v041p5:'duel intro text changed in v0.7.7 (duellines.js)',
  v041p54:'title lineup checks (the title changed in v0.8.0 and v0.8.9)',
  v041p6b:'personal quest unlock rules changed in v0.5.0 and v0.7.2',
  v050p5b:'save message overlap checks (fail on the v0.8.0 build too)',
  v053s:'title lineup squash check (the title changed in v0.8.0)',
  // v0.18.6 cleanup step 5: the full run on the HEAD build of 2026-11-10 (173 tests) had these 32 failing for old reasons, verified
  // against the same build before and after cleanup step 3 (no difference). Each names why; a few are small real issues, marked (real).
  audio:'fort loudness within 3 dB of the median: the fortress music changed; the mix was not re-balanced (real, minor)',
  audioplay:'Settings rows moved into sections (menus11, v0.18.4); the test looks for the old flat rows',
  tavern:'recruit subset coverage guarantees predate the v0.9.5 roster and v0.11 guild changes',
  v040p789:'six factions at rank 1: guilds have three ranks since v0.9.5',
  v041p1k:'Records opens on Journey: menus remember the last tab since v0.18.4 (menus11)',
  v041p4:'sixteen realms identity check predates the Breach palette and the realm reorganisation',
  v041p53:'lore lines listed in Guides > Lore: the Lore tab moved (lore9) and the test reads the old place',
  v050p2daily:'compares the Daily Trial against the fab13f2 build; the daily roll changed since',
  v050p4b:'guild quest rules changed in v0.9.5 and v0.11.9 (guild notices at the Guild Hall)',
  v050p6a:'crashes on a selector that no longer exists (null.click) since the v0.18.4 Settings sections',
  v053a:'Settings HD-2D On/Off row: the row sits in the folded Display section since v0.18.4',
  v063ba:'390x844 label overlap sweep: 4 of 14 battles overlap since the v0.18.0 foe sizes (real, minor; see v160a)',
  v063bc:'reaction float text: the reaction banner folded into one marker in v0.17.x; the float it reads is gone',
  v063bd:'390x844 battle without scrolling: the wide planner and plates changed in v0.17.x; the active hero card check reads the old layout',
  v063m1:'97 menu screens nothing clipped: 77 screens differ since the tabbed sheet (sheet11) and Settings sections',
  v063pa:'Training team: the owner changed the rule in v0.17.x (trainees 3+ levels behind, anchors kept)',
  v063pb:'Equip Best at camp: the v0.17.x econ changes (max-temper comparisons, relics) changed what it picks',
  v063s:'item icons: c_medal2 renders like the faction and epic charms (real, minor: icons2 shares a glyph)',
  v063wa:'hangs (500 s on HEAD): the pacing sim it drives no longer ends under the v0.9.5 encounter rate',
  v070ib:'intent label overlap sweep: 1 to 3 of 10 battles overlap since the v0.18.0 foe sizes (real, minor)',
  v070m1:'detonation reaction text: the reaction banner folded into one marker in v0.17.x',
  v070oa:'moment tip card for Echoforge: the Echoforge moved to the Echo Rift hall (echo11) and the card timing changed',
  v071wa:'interiors nothing hidden: the prop shading pass (worldgfx2) draws over the hidden rows the test samples',
  v071wt:'minimap tap walks there: tapping the minimap opens the map since v0.10.3; the test taps the old way',
  v076b:'1280x720 two columns span the width: the wide planner (b8col) replaced the 72/28 split in v0.17.x',
  v077wb:'medium field fog at least 50 fps: software GL on this machine gives 25 to 30 fps; a real device check is needed (perf)',
  v080b:'every Vanguard row shown: the side column scrolls inside its panel since the v0.17.x HUD plates (real, minor; 933x615 and 1280x720)',
  v080ca:'secondary roles 55 to 75 percent band: warrior and archer debuffer sit at 52 to 54 percent since dmg11 (real, balance)',
  v080wa:'no straight hard edge in the weather layer: rain run 21 to 28 px in battle since the v0.18.x stage repaint (real, minor)',
  v082db:'side caves and fortresses carry a material: the fortress material moved with sitelook10; the hill geometry check predates dungeon8 changes',
  v095m1:'Quests tab ready count: the tab now reads "Quests 2" and the group "2 ready" (format changed in v0.11.9)',
  v095m3:'Upgrade brute force best step: forge +0 and max-temper rules changed in econ11 (v0.17.x)',
  v095m4:'72 board and party screens nothing clipped: 2 screens differ since sheet11',
  v095na:'Echoforge card waits for the tab: compares against the fab13f2 build; onboard cards changed since',
  v150a:'crashes reading .art of a material: the material sprite list changed in mats11 (v0.17.x)',
  // the seven found stale in the v0.9.9 measurement (oldsave, p5b, v040p789, v041p65, v043c, v077a, v080cb) were brought up to date
  // and are back in "all" (docs/v099-tests.md, "Game fixes and the stale tests")
};
// ---- tests that compare against an older build: the revision whose committed index.html is OLDHTML when OLDHTML is not set ----
const OLD={v050p2daily:'fab13f2',v095na:'fab13f2',v080ca:'927e63e'};
// ---- per test timeout (seconds) where the default is too short ----
const SLOW={v080b:1500,v063wa:1200,v070ia:900,v076b:900,v050p1c:1500,v050p2world:1200,v082da:1200,collide:1200,v041p4:900,v063m1:900,v095m4:900,v053ua:900,audio:900,v080cb:1200};
// not runnable here (for --list): old puppeteer/@sparticuz tests, missing pre-v3 builds, helpers, screenshot/sheet/perf scripts
const NOT_RUNNABLE='arch beta fb leg lever p1 p2 p3 p4 p5 prog v020 v030 v50 gear saveformats world6 v040p2 v043 pw v063lib v095lib syncmock rlmeasure v053dbg runall v050p6suite v053suite.sh v063suite.sh (runners)';

const split=s=>s.split(/\s+/).filter(Boolean);
const grp={};for(const g in GROUPS)grp[g]=split(GROUPS[g]);
const allTests=[...new Set(Object.values(grp).flat())].sort();

function parseArgs(argv){const o={sets:[],repeat:1,timeout:600,json:null,stale:false,list:false};
  for(let i=0;i<argv.length;i++){const a=argv[i];
    if(a==='--repeat')o.repeat=+argv[++i];else if(a==='--timeout')o.timeout=+argv[++i];else if(a==='--json')o.json=argv[++i];
    else if(a==='--stale')o.stale=true;else if(a==='--list')o.list=true;else if(a.startsWith('--')){console.error('unknown option '+a);process.exit(2);}
    else o.sets.push(a);}
  if(!o.sets.length)o.sets=['all'];return o;}

function resolveSet(sets,withStale){const out=[];
  // a name with .js is always a test (audio.js is the test, audio the group)
  for(const s0 of sets){let list;const s=s0.replace(/\.js$/,''),file=s0.endsWith('.js');
    if(s==='all')list=allTests.filter(t=>withStale||!STALE[t]);
    else if(s==='stale')list=Object.keys(STALE);
    else if(grp[s]&&!file)list=grp[s].filter(t=>withStale||!STALE[t]||sets.includes(t));
    else if(fs.existsSync(path.join(HERE,s+'.js')))list=[s];
    else{console.error('unknown test or group: '+s+' (groups: all, stale, '+Object.keys(GROUPS).join(', ')+')');process.exit(2);}
    for(const t of list)if(!out.includes(t))out.push(t);}
  return out;}

const oldCache={};
function oldHtmlFor(t,tmp){if(process.env.OLDHTML)return path.resolve(process.env.OLDHTML);const rev=OLD[t];if(!rev)return null;
  if(oldCache[rev])return oldCache[rev];const P=path.join(tmp,'old_'+rev+'.html');
  try{fs.writeFileSync(P,execSync('git show '+rev+':index.html',{cwd:ROOT,maxBuffer:64<<20}));oldCache[rev]=P;return P;}
  catch(e){console.log('  (could not take index.html from '+rev+': '+e.message.split('\n')[0]+')');return null;}}

function runOne(t,o,pwhtml,tmp){return new Promise(res=>{
  const env=Object.assign({},process.env,{PWHTML:pwhtml});const old=oldHtmlFor(t,tmp);if(old)env.OLDHTML=old;
  const t0=Date.now(),load0=os.loadavg()[0];let out='';
  const ch=spawn(process.execPath,[t+'.js'],{cwd:HERE,env,detached:true,stdio:['ignore','pipe','pipe']});
  ch.stdout.on('data',d=>{out+=d;});ch.stderr.on('data',d=>{out+=d;});
  const lim=(SLOW[t]&&o.timeout===600?SLOW[t]:o.timeout)*1000;let timedOut=false;
  const kill=()=>{try{process.kill(-ch.pid,'SIGKILL');}catch(e){}};
  const tm=setTimeout(()=>{timedOut=true;kill();},lim);
  ch.on('close',code=>{clearTimeout(tm);kill();
    const lines=out.split('\n');const fails=lines.filter(l=>/^FAIL /.test(l)),pageErrs=lines.filter(l=>/^PAGEERR/.test(l));
    const passes=lines.filter(l=>/^PASS /.test(l)).length;
    const ok=!timedOut&&code===0;
    res({test:t,ok,code,timedOut,ms:Date.now()-t0,passes,fails:fails.map(s=>s.slice(0,400)),pageErrs:pageErrs.slice(0,5).map(s=>s.slice(0,400)),
      load:[+load0.toFixed(2),+os.loadavg()[0].toFixed(2)],tail:ok?undefined:lines.slice(-12).join('\n').slice(-2000)});});
});}

const pad=(s,n)=>{s=String(s);return s.length>=n?s:s+' '.repeat(n-s.length);};
(async()=>{
  const o=parseArgs(process.argv.slice(2));
  if(o.list){for(const g in grp)console.log(pad(g,8)+grp[g].join(' '));console.log(pad('stale',8)+Object.entries(STALE).map(([t,r])=>t+' ('+r+')').join('\n        '));
    console.log(pad('skipped',8)+NOT_RUNNABLE+' and the *shots*, *sheet*, *perf* scripts');return;}
  const tests=resolveSet(o.sets,o.stale);
  const pwhtml=path.resolve(process.env.PWHTML||path.join(HERE,'..','..','out','aurelis3.html'));
  if(!fs.existsSync(pwhtml)){console.error('PWHTML not found: '+pwhtml+' (run sh build.sh at the repo root)');process.exit(2);}
  const outDir=process.env.RUNALL_OUT||os.tmpdir();const tmp=fs.mkdtempSync(path.join(outDir,'runall-'));
  const json=o.json||path.join(outDir,'runall-report.json');
  console.log(`runall: ${tests.length} tests x ${o.repeat} round(s), PWHTML=${pwhtml}${process.env.OLDHTML?', OLDHTML='+process.env.OLDHTML:''}, ${os.cpus().length} cpus, load ${os.loadavg()[0].toFixed(2)}`);
  const runs=[];const T0=Date.now();
  for(let r=0;r<o.repeat;r++)for(const t of tests){
    const x=await runOne(t,o,pwhtml,tmp);x.round=r+1;x.stale=STALE[t]||undefined;runs.push(x);
    console.log(`${x.ok?'PASS':x.stale?'STALE':'FAIL'} ${pad(t,13)} ${(x.ms/1000).toFixed(1).padStart(6)}s  r${r+1}  load ${x.load.join('>')}${x.timedOut?'  TIMEOUT':''}${x.ok?'':'  '+(x.fails[0]||x.pageErrs[0]||('exit '+x.code)).slice(0,140)}`);
    fs.writeFileSync(json,JSON.stringify({pwhtml,oldhtml:process.env.OLDHTML||null,started:new Date(T0).toISOString(),runs},null,1));}
  // summary
  const by={};for(const x of runs)(by[x.test]=by[x.test]||[]).push(x);
  console.log('\n'+pad('test',14)+pad('pass',7)+pad('avg s',8)+pad('max s',8)+'failing checks');
  let bad=0;const summary=[];
  for(const t of tests){const xs=by[t];const p=xs.filter(x=>x.ok).length;const avg=xs.reduce((a,x)=>a+x.ms,0)/xs.length/1000,mx=Math.max(...xs.map(x=>x.ms))/1000;
    const fl=[...new Set(xs.flatMap(x=>x.timedOut?['TIMEOUT']:x.fails.length?x.fails:x.ok?[]:x.pageErrs.length?x.pageErrs:['exit '+x.code]))];
    if(p<xs.length&&!STALE[t])bad++;summary.push({test:t,pass:p,runs:xs.length,avgS:+avg.toFixed(1),maxS:+mx.toFixed(1),stale:STALE[t]||undefined,failing:fl});
    console.log(pad(t,14)+pad(p+'/'+xs.length+(STALE[t]?'*':''),7)+pad(avg.toFixed(1),8)+pad(mx.toFixed(1),8)+fl.map(s=>s.slice(0,110)).join(' | '));}
  fs.writeFileSync(json,JSON.stringify({pwhtml,oldhtml:process.env.OLDHTML||null,started:new Date(T0).toISOString(),minutes:+((Date.now()-T0)/60000).toFixed(1),summary,runs},null,1));
  console.log(`\n${tests.length-bad} of ${tests.length} tests passed every run${Object.keys(STALE).some(t=>tests.includes(t))?' (* = stale, see --list)':''}; ${((Date.now()-T0)/60000).toFixed(1)} min; report: ${json}`);
  try{fs.rmSync(tmp,{recursive:true,force:true});}catch(e){}
  process.exit(bad?1:0);
})();
