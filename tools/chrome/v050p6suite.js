// Runs a list of Chrome tests one after another and prints each one's summary line. Usage: PWHTML=... node v050p6suite.js test1 test2 ...
const {spawnSync}=require('child_process');let bad=0;
for(const t of process.argv.slice(2)){const r=spawnSync(process.execPath,[__dirname+'/'+t.replace(/\.js$/,'')+'.js'],{env:process.env,encoding:'utf8',timeout:600000});
  const out=(r.stdout||'')+(r.stderr||''),lines=out.split('\n').filter(l=>/^FAIL|ALL PASS|FAILS|PAGEERR|Error/.test(l));
  if(r.status!==0)bad++;console.log('== '+t+' (exit '+r.status+')\n  '+(lines.slice(0,8).join('\n  ')||out.split('\n').slice(-3).join(' ')));}
process.exit(bad?1:0);
