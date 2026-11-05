// Phase 7: service worker, tested on localhost only (a secure context). This does NOT prove the claude.ai artifact host allows it.
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const out=path.join(__dirname,'..','out');
const srv=http.createServer((q,s)=>{const u=q.url.split('?')[0];const f=u==='/'||u==='/aurelis3.html'?'aurelis3.html':u==='/sw.js'?'sw.js':null;if(!f){s.writeHead(404);return s.end();}
  s.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html','cache-control':'no-store'});s.end(fs.readFileSync(path.join(out,f)));});
srv.listen(0,async()=>{const port=srv.address().port,base='http://localhost:'+port+'/';let fail=0;const chk=(n,c)=>{console.log((c===true?'PASS ':'FAIL ')+n+(c===true?'':' -> '+c));if(c!==true)fail++;};
  const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:430,height:800}}),p=await ctx.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto(base,{waitUntil:'load'});await p.waitForFunction(()=>window.__A&&__A.OFF&&__A.OFF.sw==='active'&&__A.OFF.cached,{timeout:10000}).catch(()=>{});
  const st=await p.evaluate(()=>({sw:__A.OFF.sw,cached:__A.OFF.cached,ctl:!!navigator.serviceWorker.controller}));console.log(JSON.stringify(st));
  chk('service worker registers and caches the page on localhost',st.sw==='active'&&st.cached);
  await p.reload({waitUntil:'load'});await p.waitForTimeout(500);
  await ctx.setOffline(true);
  let ok=true;try{await p.reload({waitUntil:'load',timeout:8000});}catch(e){ok=false;console.log(e.message.slice(0,100));}
  const t=ok?await p.evaluate(()=>({game:!!window.__A,title:document.title,pill:document.getElementById('offl')&&document.getElementById('offl').className})):null;console.log(JSON.stringify(t));
  chk('offline reload serves the game from the cache',!!(t&&t.game&&/off/.test(t.pill)));
  await b.close();srv.close();console.log(fail?'FAILS '+fail:'ALL PASS');process.exit(fail?1:0);});
