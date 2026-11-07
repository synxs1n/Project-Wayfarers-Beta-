// v0.9.9: prints the hook lists of the core functions (v3/hooks.js) as Markdown, read from the running game so the docs stay true.
// Usage (repo root, after sh build.sh): node tools/hooksmap.js [build html] > list.md   (docs/CODEMAP.md "Hook lists" is this output)
// For each function: the hooks in registration (load) order, and the order they run in. Hooks compose like the old wrappers:
// the last registered is the outermost, so before parts run from the last registered to the first, then the base, then the
// after parts from the first registered to the last. A wrap (around) hook has both parts.
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{
  const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','out','aurelis3.html'),'utf8');
  const P=path.join(require('os').tmpdir(),'hooksmap_'+process.pid+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"></head><body><script>localStorage.clear();</script>'+html+'</body></html>');
  const browser=await chromium.launch();const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+P,{waitUntil:'load'});await page.waitForTimeout(500);
  const T=await page.evaluate(()=>{const H=window.__A.HOOK,o={};H.list().forEach(n=>{o[n]=H.list(n);});return o;});
  await browser.close();try{fs.unlinkSync(P);}catch(e){}
  const KIND={before:'before',after:'after',xform:'result',wrap:'around'};
  const names=Object.keys(T).sort((a,b)=>T[b].length-T[a].length||a.localeCompare(b));
  const out=[];
  for(const n of names){const L=T[n];out.push(`### ${n} (${L.length} hook${L.length===1?'':'s'})`);
    out.push('Registered (load order; 1 is next to the base):');
    L.forEach((h,i)=>out.push(`${i+1}. \`${h.mod}.js\` ${KIND[h.kind]}: ${h.why}`));
    const pre=[],post=[];for(let i=L.length-1;i>=0;i--)if(L[i].kind==='before'||L[i].kind==='wrap')pre.push(`${i+1} ${L[i].mod}${L[i].kind==='wrap'?' (around)':''}`);
    for(let i=0;i<L.length;i++)if(L[i].kind!=='before')post.push(`${i+1} ${L[i].mod}${L[i].kind==='wrap'?' (around)':L[i].kind==='xform'?' (result)':''}`);
    out.push('','Runs: '+(pre.length?pre.join(' → ')+' → ':'')+'**base**'+(post.length?' → '+post.join(' → '):''),'');}
  console.log(out.join('\n'));
  if(errs.length){console.error('page errors: '+errs.slice(0,3).join(' | '));process.exit(1);}
})();
