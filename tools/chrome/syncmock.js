// v0.8.5 save sync tests: one cloud shared by several "devices" (browser contexts with their own localStorage).
// The store lives in node; each page reaches it through page.exposeFunction. The db offers what cloud.js offers on Firebase:
// doc(path).get/set/delete and txn(path, expectHash, writes) (atomic, refuses when the doc no longer holds expectHash; writes marked
// stamp get pushedAt = the page's clock and srvAt = the "server" clock). Options per device: skew (ms added to Date.now), noTxn.
const {open}=require('./pw');
const fs=require('fs');
function store(){
  const S=new Map();const st={S,delay:0,ops:[],srvSkew:0};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  st.get=p=>S.has(p)?JSON.parse(S.get(p)):null;
  st.dump=()=>[...S.keys()].sort();
  st.bind=async(page,tag)=>{
    await page.exposeFunction('__cget',async p=>{if(st.delay)await sleep(st.delay);st.ops.push([tag,'get',p]);return S.has(p)?S.get(p):null;});
    await page.exposeFunction('__cset',async(p,j)=>{if(st.delay)await sleep(st.delay);st.ops.push([tag,'set',p]);S.set(p,j);return 1;});
    await page.exposeFunction('__cdel',async p=>{if(st.delay)await sleep(st.delay);st.ops.push([tag,'del',p]);S.delete(p);return 1;});
    await page.exposeFunction('__ctxn',async(p,expect,wj,pageNow)=>{if(st.delay)await sleep(st.delay*2);
      const cur=S.has(p)?JSON.parse(S.get(p)).hash||null:null;
      if(cur!==(expect||null)){st.ops.push([tag,'txn-refused',p]);return JSON.stringify({err:'changed'});}
      for(const w of JSON.parse(wj)){const d=w.stamp?Object.assign({},w.data,{pushedAt:pageNow,srvAt:Date.now()+st.srvSkew}):w.data;S.set(w.path,JSON.stringify(d));}
      st.ops.push([tag,'txn',p]);return JSON.stringify({ok:1});});
  };
  return st;
}
const MOCK=opt=>`(()=>{const D=window.__DB={off:false};
const chk=()=>{if(D.off)throw {code:'unavailable',message:'offline'};};
const mk=p=>({path:p,get:async()=>{chk();const v=await window.__cget(p);return {exists:v!=null,data:()=>v==null?undefined:JSON.parse(v)};},
 set:async d=>{chk();await window.__cset(p,JSON.stringify(d));},delete:async()=>{chk();await window.__cdel(p);},update:async d=>{chk();const v=await window.__cget(p);await window.__cset(p,JSON.stringify(Object.assign(v?JSON.parse(v):{},d)));}});
const col={get:async()=>({docs:[],size:0,empty:true}),orderBy(){return col;},limit(){return col;},where(){return col;}};
const db={doc:mk,collection:()=>col};
${opt.noTxn?'':`db.txn=async(path,expect,writes)=>{chk();const r=JSON.parse(await window.__ctxn(path,expect,JSON.stringify(writes),Date.now()));if(r.err)throw Object.assign(new Error('the cloud save changed'),{code:r.err});};`}
const user={id:async()=>'u_dev',can:async()=>true,me:async()=>({id:'u_dev',name:'Dev'}),profiles:async()=>({})};
window.claude={use:async n=>n==='db'?db:n==='user'?user:null};})();`;
const PRE=opt=>`${opt.clear?'localStorage.clear();':''}${opt.seed?`(()=>{const s=${JSON.stringify(opt.seed||{})};for(const k in s)if(localStorage.getItem(k)==null)localStorage.setItem(k,s[k]);})();`:''}${opt.prejs||''}${opt.skew?`(()=>{const n=Date.now.bind(Date);Date.now=()=>n()+${opt.skew};})();`:''}
window.__vis=v=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>v});Object.defineProperty(document,'hidden',{configurable:true,get:()=>v==='hidden'});document.dispatchEvent(new Event('visibilitychange'));};
window.__net=on=>{window.__DB.off=!on;Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>on});window.dispatchEvent(new Event(on?'online':'offline'));};`;
// a device: its own context (localStorage) that can be reopened (same storage) like an app restart
async function device(st,browser,tag,opt={}){
  const dir=process.env.PWDIR||require('os').tmpdir();
  const H=await open(Object.assign({w:430,h:820,mobile:true,browser,tag,dir,mock:MOCK(opt),pre:PRE(opt),before:p=>st.bind(p,tag)},opt.open||{}));
  H.tag=tag;H.url=H.page.url();
  H.reopen=async()=>{const url=H.url;const page=await H.ctx.newPage();page.on('pageerror',e=>{H.errs.push(e.message);console.log('PAGEERR',tag,e.message);});await st.bind(page,tag);if(!H.page.isClosed())await H.page.close();
    H.page=page;await page.goto(url,{waitUntil:'load'});H.ev=(f,a)=>H.page.evaluate(f,a);return H;};
  H.errs=[];H.page.on('pageerror',e=>H.errs.push(e.message));
  H.ev=(f,a)=>H.page.evaluate(f,a);
  return H;
}
// helpers run in the page
const NEWGAME=()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();return true;};
const idle=async H=>{for(let i=0;i<80;i++){const b=await H.ev(()=>{const S=__SV85.SV;return S.firstDone&&!S.busy&&!Object.keys(S.dirty).length&&!S.timer;});if(b)return true;await H.page.waitForTimeout(100);}return false;};
module.exports={store,device,NEWGAME,idle};
