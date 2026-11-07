// ===== saves.js (v0.3.4): save recovery, slots, backups, import and export, account saves =====
// Local keys are unchanged (aurelis-wayfarers-v3, -s1, -s2, aurelis-meta-v1). New and optional only:
//   G.gv                       game version that last wrote the save (a missing value means an older build)
//   aurelis-bak-<slot>-<0..2>  rolling raw backups per slot, written before a migration, an overwrite, a delete, a cloud pull or a restore
//   aurelis-bak-idx            {<slot>:next index}
//   aurelis-dev-v1             {id,label}  device label for cloud saves
// Cloud (db capability, rules: saves read owner write owner; saves/{self} read interact write interact):
//   saves/<uid>/s/<slot>   current save: {v,sv,gv,slot,savedAt,score,prog,dev,hash,hi,n,data}  data = first chunk of the packed save
//   saves/<uid>/h/<slot>-<0..2>  the last three replaced versions of that slot, same shape
//   saves/<uid>/c/<kind><key>-<k>  extra chunks {d,t} when a packed save is longer than SV_CH characters
// Packed = 'z1.'+base64(gzip(raw json)) or 'p1.'+base64(utf8) when CompressionStream is missing.
const SV={status:'idle',uid:null,db:null,busy:false,dirty:{},hold:{},base:{},div:[],timer:null,retry:null,errMsg:'',last:0,werr:0,cloud:null,warnT:0,shown:0};
const SV_CH=180000,BAKP='aurelis-bak-',BAKIDX='aurelis-bak-idx',DEVKEY='aurelis-dev-v1';
// ---------- small helpers ----------
function svHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16)+'-'+s.length;}
function svB64(buf){const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}
function svUnB64(b){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u;}
async function svPack(str){try{if(typeof CompressionStream==='function'){const cs=new CompressionStream('gzip'),w=cs.writable.getWriter();w.write(new TextEncoder().encode(str));w.close();return 'z1.'+svB64(await new Response(cs.readable).arrayBuffer());}}catch(e){}return 'p1.'+btoa(unescape(encodeURIComponent(str)));}
async function svUnpack(s){if(s.startsWith('p1.'))return decodeURIComponent(escape(atob(s.slice(3))));if(s.startsWith('z1.')){const ds=new DecompressionStream('gzip'),w=ds.writable.getWriter();w.write(svUnB64(s.slice(3)));w.close();return await new Response(ds.readable).text();}throw new Error('unknown pack format');}
const svLs={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);return true;}catch(e){return false;}},del(k){try{localStorage.removeItem(k);}catch(e){}}};
function svDev(){let d=null;try{d=JSON.parse(svLs.get(DEVKEY)||'null');}catch(e){}if(!d||!d.label){const ua=navigator.userAgent||'',os=/iPhone|iPad/.test(ua)?'iPhone/iPad':/Android/.test(ua)?'Android':/Mac/.test(ua)?'Mac':/Windows/.test(ua)?'Windows':/Linux/.test(ua)?'Linux':'Device',br=/Edg\//.test(ua)?'Edge':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Browser',id=Math.random().toString(36).slice(2,6);d={id,label:os+' '+br+' '+id};svLs.set(DEVKEY,JSON.stringify(d));}return d;}
// ---------- reading a save without ever throwing it away ----------
// Accepts older shapes: a missing ver is repaired in memory, a missing party/roster field is a problem, not a default.
function svParse(str){
  if(!str)return {ok:false,why:'empty'};let o;
  try{o=JSON.parse(str);}catch(e){return {ok:false,why:'The save text is damaged (it is not valid data).'};}
  if(!o||typeof o!=='object'||Array.isArray(o))return {ok:false,why:'The save is not a journey.'};
  if(o.ver!=null&&o.ver!==3)return {ok:false,why:o.ver>3?'This save is from a newer version of the game.':'Unknown save version '+o.ver+'.'};
  if(!o.roster||typeof o.roster!=='object'||!Object.keys(o.roster).length)return {ok:false,why:'The save has no heroes in it.'};
  if(!Array.isArray(o.party))return {ok:false,why:'The save has no party list.'};
  if(!Array.isArray(o.cleared))return {ok:false,why:'The save has no progress list.'};
  if(o.ver==null)o.ver=3;
  return {ok:true,o};
}
function svSlotRaw(s){return svLs.get(slotKey(s));}
function slotState(s){const raw=svSlotRaw(s);if(!raw)return 'empty';return svParse(raw).ok?'ok':'bad';}
// loadRaw now repairs a missing ver; a damaged slot reads as null here, but the raw text is left alone and shown as damaged
function loadRaw(slot){const raw=svSlotRaw(slot==null?(META.slot||0):slot);if(!raw)return null;const p=svParse(raw);return p.ok?p.o:null;}
// ---------- progress ----------
function svProg(o){const ro=o.roster||{},party=(o.party||[]).filter(id=>ro[id]),st=o.stats||{};
  return {stage:o.stage||0,cleared:(Array.isArray(o.cleared)?o.cleared:[]).filter(Boolean).length,cycle:(o.run&&o.run.cycle)||0,heroes:Object.keys(ro).length,battles:st.battles||0,play:st.play||0,
    lv:party.length?Math.round(party.reduce((a,id)=>a+(ro[id].lv||0),0)/party.length):0,gold:o.gold||0,saved:o.savedAt||0};}
function svScore(p){return p.cycle*100000+p.stage*10000+p.cleared*2000+p.heroes*100+Math.min(5000,p.battles)+Math.min(999,Math.floor(p.play/60000));}
function svDom(a,b){return ['cycle','stage','cleared','heroes','battles','lv','play'].every(k=>(a[k]||0)>=(b[k]||0));}
function svProgText(p){return `Stage ${p.stage+1}, ${p.cleared} of 5 beacons${p.cycle?', NG+'+p.cycle:''}. ${p.heroes} heroes, party level ${p.lv}, ${fmt(p.battles)} battles${p.play?', '+durText(p.play)+' played':''}.`;}
function svHeroLine(o){const ro=o.roster||{};return (o.party||[]).filter(id=>ro[id]).slice(0,6).map(id=>(TPL[id]?TPL[id].n:id)+' '+(ro[id].lv||'?')).join(', ');}
function svWhen(t){return t?new Date(t).toLocaleString():'unknown time';}
// ---------- local backups ----------
function svIdx(){try{return JSON.parse(svLs.get(BAKIDX)||'{}')||{};}catch(e){return {};}}
function svBakKeys(slot){return [0,1,2].map(i=>BAKP+slot+'-'+i);}
function svBackup(slot,raw,why){
  if(!raw)return false;
  const keys=svBakKeys(slot),cur=keys.map(k=>{try{return JSON.parse(svLs.get(k)||'null');}catch(e){return null;}});
  if(cur.some(c=>c&&c.raw===raw))return true;                       // already backed up, no duplicate
  const idx=svIdx(),i=((idx[slot]==null?-1:idx[slot])+1)%3,sp=svParse(raw);
  const rec=JSON.stringify({raw,why,at:Date.now(),gv:sp.ok?sp.o.gv||'older':'damaged',savedAt:sp.ok?sp.o.savedAt||0:0});
  let ok=svLs.set(keys[i],rec);
  if(!ok){[0,1,2].forEach(s=>{if(s!==slot)svBakKeys(s).forEach(k=>svLs.del(k));});ok=svLs.set(keys[i],rec);}   // storage full: free other slots' backups, keep this one
  if(ok){idx[slot]=i;svLs.set(BAKIDX,JSON.stringify(idx));}
  return ok;
}
// ---------- saving: failures are no longer silent ----------
{const sg0=saveGame;saveGame=function(){
  if(G&&!G.daily)G.gv=GAME_VERSION;
  let ok=sg0.apply(this,arguments);
  if(!ok&&G&&!G.daily){try{[0,1,2].forEach(s=>{if(s!==(META.slot||0))svBakKeys(s).forEach(k=>svLs.del(k));});ok=sg0.apply(this,arguments);}catch(e){}}   // one retry after freeing backups
  if(G&&!G.daily){
    if(ok){SV.werr=0;svMark(META.slot||0);}
    else{SV.werr++;if(Date.now()-SV.warnT>45000){SV.warnT=Date.now();try{toast('Could not save on this device. Use Export save now so you do not lose progress.');}catch(e){}}svIcon();}
  }
  return ok;};}
// ---------- loading: keep the raw data, explain, offer retry and export ----------
function svLoad(slot){
  const raw=svSlotRaw(slot);if(!raw){toast('No saved journey found.');return;}
  const pr=svParse(raw);if(!pr.ok){V.modal={type:'svfail',slot,why:pr.why};render();return;}
  const o=pr.o;if(o.gv!==GAME_VERSION)svBackup(slot,raw,'before migrating to '+GAME_VERSION);   // the original is never removed; this copy is the safety net
  let g;try{g=unpackG(o);}catch(e){V.modal={type:'svfail',slot,why:'The game hit an error reading it: '+(e&&e.message||e)};render();return;}
  if(!g||!g.roster||!Object.keys(g.roster).length||!g.party||!g.party.length){V.modal={type:'svfail',slot,why:'The save loaded with no party. It was left untouched.'};render();return;}
  G=g;META.slot=+slot;saveMeta();enterWorldFromSave();
}
Object.assign(ACT,{
  cont(){const s=META.slot||0;svGate(s,()=>svLoad(s));},
  slotLoad(s){s=+s;svGate(s,()=>svLoad(s));},
  slotNew(s){const raw=svSlotRaw(+s);if(raw)svBackup(+s,raw,'before a new journey replaced it');META.slot=+s;saveMeta();V.modal=null;render();},
  slotDel(s){s=+s;const raw=svSlotRaw(s);if(raw)svBackup(s,raw,'before the slot was cleared');svLs.del(slotKey(s));toast(`Slot ${s+1} cleared. A backup stays in Recover Saves.`);svRefreshTitle();render();},
  svRetry(s){svLoad(+s);},
});
// ---------- scanning storage for everything that looks like a save ----------
const SV_SKIP=/^(aurelis-meta-v1|aurelis-sync-v1|aurelis-daily-|aurelis-legend|aurelis-offline|aurelis-dev-v1|aurelis-bak-idx)/;
function svScan(){
  const out=[];let n=0;try{n=localStorage.length;}catch(e){return out;}
  for(let i=0;i<n;i++){let k;try{k=localStorage.key(i);}catch(e){continue;}
    if(!k||SV_SKIP.test(k))continue;const raw=svLs.get(k);if(!raw||raw.length<40)continue;
    let kind=null,slot=null,label='';
    let m;
    if((m=/^aurelis-wayfarers-v3(?:-s(\d+))?$/.exec(k))){slot=m[1]?+m[1]:0;kind=slot<3?'slot':'orphan';label=slot<3?'Slot '+(slot+1):'Orphan slot '+(slot+1);}
    else if((m=/^aurelis-bak-(\d+)-(\d+)$/.exec(k))){slot=+m[1];kind='backup';}
    else if(/aurelis/i.test(k)&&raw[0]==='{'){kind='orphan';label='Other key '+k;}
    else continue;
    let body=raw,rec=null;
    if(kind==='backup'){try{rec=JSON.parse(raw);body=rec.raw;}catch(e){body=null;}label='Backup of slot '+(slot+1);}
    const p=svParse(body);
    if(kind==='orphan'&&!p.ok&&!/wayfarers/.test(k))continue;      // an unrelated key that merely mentions aurelis
    out.push({key:k,kind,slot,label,raw:body,ok:p.ok,why:p.ok?'':p.why,o:p.ok?p.o:null,at:rec?rec.at:0,note:rec?rec.why:'',savedAt:p.ok?p.o.savedAt||0:0});}
  return out.sort((a,b)=>(a.kind==='slot'?0:a.kind==='orphan'?1:2)-(b.kind==='slot'?0:b.kind==='orphan'?1:2)||a.slot-b.slot||(b.at-a.at));
}
// ---------- save codes: export, import, validation ----------
function svCode(raw){return 'AWSAVE1.'+btoa(unescape(encodeURIComponent(raw)));}
function svDecode(txt){
  let t=String(txt||'').trim();if(!t)return {ok:false,why:'Nothing to import.'};
  t=t.replace(/\s+/g,'');
  try{if(/^AWSAVE1\./.test(t))t=decodeURIComponent(escape(atob(t.slice(8))));else if(t[0]!=='{')t=decodeURIComponent(escape(atob(t)));else t=String(txt).trim();}catch(e){return {ok:false,why:'That code could not be decoded. Make sure it was copied whole.'};}
  if(t.length>4000000)return {ok:false,why:'That file is too big to be a save.'};
  const p=svParse(t);if(!p.ok)return {ok:false,why:p.why};
  const o=p.o,bad=Object.values(o.roster).some(c=>!c||typeof c!=='object'||typeof c.lv!=='number');if(bad)return {ok:false,why:'Some heroes in the save are malformed.'};
  if(typeof o.gold!=='number'&&o.gold!=null)return {ok:false,why:'Gold is not a number.'};
  return {ok:true,o,raw:JSON.stringify(o)};
}
async function svDownload(name,text){
  try{const dl=await capOf('downloads');if(dl&&dl.save){await dl.save({filename:name,data:text});return true;}}catch(e){}
  try{const b=new Blob([text],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},800);return true;}catch(e){return false;}
}
function svFileName(slot){const d=new Date();return `aurelis-slot${slot+1}-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}.awsave`;}
// ---------- cloud ----------
// v0.8.5 sync between devices (docs/v085-sync.md):
//   aurelis-sync-v1  {b:{<slot>:hash},k:{<slot>:hash},sk:ms}  b = the cloud version this device last matched (pushed, pulled or found equal),
//                    k = a cloud version the player chose to replace ("Keep this one"), sk = this device's clock offset to the server
//   new optional cloud fields: par (the cloud hash a version replaced), srvAt (server time of the write, Firebase only)
//   Who wins: the side that changed since the last match. Only when both changed (or nothing is known) do progress and time decide,
//   with the time corrected by each device's clock offset, and a journey open on the slot always asks instead of switching.
const SYNCKEY='aurelis-sync-v1';
function svSyncLoad(){let o=null;try{o=JSON.parse(svLs.get(SYNCKEY)||'null');}catch(e){}o=o&&typeof o==='object'?o:{};SV.syncU=o.u||null;SV.base=Object.assign({},o.b||{});SV.keep=Object.assign({},o.k||{});SV.skew=typeof o.sk==='number'&&isFinite(o.sk)?o.sk:0;}
function svSyncSave(){svLs.set(SYNCKEY,JSON.stringify({u:SV.uid||SV.syncU||null,b:SV.base,k:SV.keep,sk:SV.skew||0}));}
function svSetBase(slot,hash){if(SV.base[slot]===hash)return;SV.base[slot]=hash;svSyncSave();}
Object.assign(SV,{again:false,first:null,firstDone:false,newer:null,later:{},keep:{},skew:0,dirtyAt:0,lastCheck:0});
svSyncLoad();
SV.first=new Promise(r=>{SV.firstRes=r;});
function svFirstDone(){if(SV.firstDone)return;SV.firstDone=true;try{SV.firstRes();}catch(e){}}
async function svCap(){
  if(SV.db&&SV.uid)return true;
  const db=await capOf('db'),user=await capOf('user');let uid=null;
  if(user){try{uid=await user.id();}catch(e){}}
  let can=null;if(user&&user.can){try{can=await user.can('data.write');}catch(e){}}
  if(!db||!uid||can===false){SV.status='local';svIcon();return false;}
  SV.db=db;SV.uid=uid;
  if(SV.syncU&&SV.syncU!==uid){SV.base={};SV.keep={};SV.hold={};SV.div=[];SV.newer=null;}   // another account: what we matched before means nothing here
  if(SV.syncU!==uid){SV.syncU=uid;svSyncSave();}
  return true;
}
const svRef=(kind,key)=>SV.db.doc('saves/'+SV.uid+'/'+kind+'/'+key);
async function svPut(kind,key,meta,b64,prevN){
  const n=Math.max(1,Math.ceil(b64.length/SV_CH));
  for(let k=1;k<n;k++)await SV.db.doc('saves/'+SV.uid+'/c/'+kind+key+'-'+k).set({d:b64.slice(k*SV_CH,(k+1)*SV_CH),t:meta.savedAt||0});   // chunks first, so the main doc never points at missing parts
  await svRef(kind,key).set(Object.assign({},meta,{n,data:b64.slice(0,SV_CH)}));
  for(let k=n;k<(prevN||0);k++){try{await SV.db.doc('saves/'+SV.uid+'/c/'+kind+key+'-'+k).delete();}catch(e){}}
}
async function svGet(kind,key){
  const snap=await svRef(kind,key).get();if(!snap.exists)return null;const d=snap.data();let b=d.data||'';
  for(let k=1;k<(d.n||1);k++){const c=await SV.db.doc('saves/'+SV.uid+'/c/'+kind+key+'-'+k).get();if(!c.exists)throw new Error('a part of the cloud save is missing');b+=c.data().d||'';}
  return {d,raw:await svUnpack(b),b64:b};
}
async function svDelDoc(kind,key){
  const snap=await svRef(kind,key).get();if(!snap.exists)return;const n=snap.data().n||1;
  for(let k=1;k<n;k++){try{await SV.db.doc('saves/'+SV.uid+'/c/'+kind+key+'-'+k).delete();}catch(e){}}
  await svRef(kind,key).delete();
}
// push this device's slot. cd = the cloud doc the decision was made on (read again when missing). The replaced version becomes
// history entry hi%3 (the last three are kept). Where the db offers txn (Firebase), history and save are one atomic write that
// only lands if the cloud still holds cd, so a slow or late push can never replace a newer save from another device.
async function svPush(slot,why,cd){
  const raw=svSlotRaw(slot),p=svParse(raw);if(!p.ok)return false;
  if(cd===undefined){const s=await svRef('s',slot).get();cd=s.exists?s.data():null;}
  const pre='saves/'+SV.uid+'/',hk=cd?slot+'-'+((cd.hi||0)%3):null;
  const [b64,prevB64,hn]=await Promise.all([svPack(raw),
    cd?((cd.n||1)>1?svGet('s',slot).then(x=>x&&x.b64).catch(()=>null):Promise.resolve(cd.data||null)):null,
    hk?svRef('h',hk).get().then(s=>s.exists?(s.data().n||1):0).catch(()=>0):0]);
  const prog=svProg(p.o),dev=svDev(),hash=svHash(raw),W=[];
  const put=(kind,key,meta,b,stamp)=>{const n=Math.max(1,Math.ceil(b.length/SV_CH));for(let k=1;k<n;k++)W.push({path:pre+'c/'+kind+key+'-'+k,data:{d:b.slice(k*SV_CH,(k+1)*SV_CH),t:meta.savedAt||0}});
    W.push({path:pre+kind+'/'+key,data:Object.assign({},meta,{n,data:b.slice(0,SV_CH)}),stamp:!!stamp});return n;};
  let hi=cd?cd.hi||0:0,hN=0;
  if(cd&&prevB64){hN=put('h',hk,Object.assign({},cd,{hist:1,replacedAt:Date.now()}),prevB64);hi=hi+1;}
  const sN=put('s',slot,{v:1,sv:3,gv:p.o.gv||'older',slot,savedAt:p.o.savedAt||Date.now(),score:svScore(prog),prog,dev:dev.label,hash,hi,pushedAt:Date.now(),why:why||'',par:cd?cd.hash||null:null},b64,true);
  if(SV.db.txn)await SV.db.txn(pre+'s/'+slot,cd?cd.hash||null:null,W);
  else for(const w of W)await SV.db.doc(w.path).set(w.data);
  for(let k=sN;k<(cd?cd.n||1:0);k++){try{await SV.db.doc(pre+'c/s'+slot+'-'+k).delete();}catch(e){}}
  if(hN)for(let k=hN;k<hn;k++){try{await SV.db.doc(pre+'c/h'+hk+'-'+k).delete();}catch(e){}}
  delete SV.keep[slot];SV.base[slot]=hash;svSyncSave();return true;
}
async function svPull(slot,why){
  const c=await svGet('s',slot);if(!c)return false;
  const p=svParse(c.raw);if(!p.ok)throw new Error('the cloud copy is damaged: '+p.why);
  const old=svSlotRaw(slot);if(old&&old!==c.raw)svBackup(slot,old,'before the cloud save replaced it');
  if(!svLs.set(slotKey(slot),c.raw))throw new Error('this device has no room to store it');
  delete SV.keep[slot];SV.base[slot]=c.d.hash||svHash(c.raw);svSyncSave();return true;
}
// clocks: a doc written through a txn carries the server time (srvAt) and the writer's clock (pushedAt); their difference is that
// device's clock offset. Our own docs teach us ours. Times compared across devices are put on the server clock first.
const SV_SKEWMAX=86400000;
function svDocSkew(cd){const x=cd&&typeof cd.srvAt==='number'&&typeof cd.pushedAt==='number'?cd.srvAt-cd.pushedAt:0;return Math.abs(x)<SV_SKEWMAX?x:0;}
function svLearnSkew(cd){try{if(cd&&typeof cd.srvAt==='number'&&cd.dev===svDev().label){const k=svDocSkew(cd);if(Math.abs(k-(SV.skew||0))>500){SV.skew=k;svSyncSave();}}}catch(e){}}
const svCloudTime=cd=>(cd.savedAt||0)+svDocSkew(cd);
const svLocalTime=t=>(t||0)+(SV.skew||0);
// what to do with a slot whose local and cloud copies differ: 'push', 'pull' or 'div' (both changed and nothing says which is right)
const SV_SKEWWIN=15*60000;
function svDecide(slot,o,hash,cd){
  const base=SV.base[slot];
  if(SV.keep[slot]&&SV.keep[slot]===cd.hash)return 'push';                       // the player already chose this device over that cloud copy
  if(base){const lc=hash!==base,cc=cd.hash!==base;
    if(cc&&!lc)return 'pull';                                                      // only the cloud moved on since we last matched
    if(lc&&!cc)return 'push';}                                                     // only this device moved on
  if(cd.par&&cd.par===hash)return 'pull';                                          // the cloud copy was made from exactly this one
  const L=svProg(o),C=cd.prog||{},cD=svDom(C,L),lD=svDom(L,C),dc=svCloudTime(cd)-svLocalTime(L.saved);
  if(cD&&!lD&&dc>-SV_SKEWWIN)return 'pull';                                        // more progress wins over a clock a few minutes off
  if(lD&&!cD&&dc<SV_SKEWWIN)return 'push';
  if(dc>2000)return cD?'pull':'div';if(dc<-2000)return lD?'push':'div';return lD?'push':cD?'pull':'div';
}
// compare one slot: push, pull, leave alone, or flag it. live = a journey is open on this slot: never switch it under the player, ask.
async function svCheck(slot,live){
  const raw=svSlotRaw(slot),pr=raw?svParse(raw):{ok:false};
  const snap=await svRef('s',slot).get(),cd=snap.exists?snap.data():null;
  if(cd)svLearnSkew(cd);
  if(!pr.ok&&raw)return 'damaged';                                   // never touch a slot we cannot read
  if(!raw&&!cd)return 'none';
  if(SV.hold[slot]){if(cd&&cd.hash===SV.hold[slot])return 'held';svUnhold(slot);}   // waiting for the player; a further cloud change is decided afresh
  if(raw&&!cd){svBackup(slot,raw,'before the first cloud upload');await svPush(slot,'first upload',null);return 'pushed';}
  if(!raw&&cd){if(live)return 'skip';await svPull(slot,'restored');svNote(slot,cd);return 'pulled';}
  const hash=svHash(raw);
  if(cd.hash===hash){svSetBase(slot,hash);return 'same';}
  const act=svDecide(slot,pr.o,hash,cd);
  if(act==='push'){await svPush(slot,'newer',cd);return 'pushed';}
  if(live){SV.hold[slot]=cd.hash;SV.newer={slot,C:cd,kind:act==='pull'?'newer':'differ'};svMaybeNewer();return 'newer';}
  if(act==='pull'){await svPull(slot,'newer');svNote(slot,cd);return 'pulled';}
  const L=svProg(pr.o);SV.div=SV.div.filter(d=>d.slot!==slot);SV.div.push({slot,L:{prog:L,saved:L.saved},C:cd});
  SV.hold[slot]=cd.hash;return 'div';
}
function svUnhold(slot){SV.hold[slot]=0;SV.div=SV.div.filter(d=>d.slot!==slot);
  if(SV.newer&&SV.newer.slot===slot){SV.newer=null;try{if(V.modal&&V.modal.type==='svnewer'){V.modal=null;render();}}catch(e){}}}
function svNote(slot,cd){SV.restored=(SV.restored||0)+1;SV.restoredFrom=cd&&cd.dev||'';}
function svStatus(s,msg){SV.status=s;if(msg!==undefined)SV.errMsg=msg;svIcon();}
function svErrKind(e){const c=e&&e.code;if(c==='not_granted'||c==='permission_denied'||c==='not_writer'||c==='forbidden')return 'local';return 'error';}
function svLive(s){try{return !!G&&!G.daily&&V.screen!=='title'&&(META.slot||0)===s;}catch(e){return false;}}
function svAttn(){return SV.div.length||SV.newer;}
// autosave marks a slot dirty; a short debounce pushes it, and a slot is never left unsynced longer than syncMax while saves keep coming
function svMark(slot){SV.dirty[slot]=1;if(SV.status==='local')return;
  const now=Date.now();if(!SV.dirtyAt)SV.dirtyAt=now;
  const d=Math.max(0,Math.min(SAVE_UI.syncDelay,(SAVE_UI.syncMax||30000)-(now-SV.dirtyAt)));
  clearTimeout(SV.timer);SV.timer=setTimeout(()=>{SV.timer=null;svFlush();},d);
  if(SV.status!=='error')svStatus(navigator.onLine===false?'queued':'syncing');}
// one sync pass. all = compare every slot with the cloud (start, coming back, the periodic check); otherwise only the dirty ones.
// A pass asked for while another runs is chained right after it, never dropped.
async function svFlush(manual,all){
  if(SV.busy){SV.again=SV.again==='all'||all?'all':true;return;}
  const slots=all?[0,1,2]:Object.keys(SV.dirty).map(Number);
  if(!slots.length&&!manual){if(all)svFirstDone();return;}
  if(navigator.onLine===false){svStatus('queued');svFirstDone();return;}
  SV.busy=true;clearTimeout(SV.timer);SV.timer=null;SV.dirtyAt=0;
  try{
    if(!(await svCap()))return;
    svStatus('syncing');
    for(const s of (slots.length?slots:[META.slot||0])){
      const live=svLive(s),was=SV.dirty[s];delete SV.dirty[s];      // cleared before the read: a save made while this pass runs stays dirty
      let r;try{r=await svCheck(s,live);}catch(e){if(was)SV.dirty[s]=1;throw e;}
      if(r==='held'&&was)SV.dirty[s]=1;
      if(r==='div'&&!all){try{toast('Your cloud save and this device differ. Pick one on the title screen.');}catch(e){}}
    }
    SV.last=Date.now();svStatus(svAttn()?'attention':'synced','');clearTimeout(SV.retry);
    if(SV.restored){try{toast(SV.restored>1?'Updated '+SV.restored+' saves from your account.':'Updated a save from your account'+(SV.restoredFrom?' ('+SV.restoredFrom+')':'')+'.');}catch(e){}SV.restored=0;}
  }catch(e){
    if(e&&e.code==='changed'){SV.again='all';svStatus('syncing');}       // the cloud moved on under us: look again at once
    else{const k=svErrKind(e);svStatus(k,(e&&e.message)||String(e));
      if(k==='error'){clearTimeout(SV.retry);SV.retry=setTimeout(()=>svFlush(true,true),60000);}}
  }finally{
    SV.busy=false;SV.lastCheck=Date.now();if(all)svFirstDone();
    svMaybeDiv();svMaybeNewer();if(all)svRefreshTitle();
    if(typeof V!=='undefined'&&V.modal&&V.modal.type==='menu')try{render();}catch(e){}
    if(SV.again){const a=SV.again;SV.again=false;setTimeout(()=>svFlush(a==='all',a==='all'),0);}
  }
}
// first pass of the session: compare every slot with the cloud as soon as the account answers
function svInit(){return svFlush(true,true);}
// leaving this device (hidden, page hide, freeze, window blur, the app pausing or closing): save where it is safe, then push at once
function svSafeSave(){try{return !!G&&!G.daily&&V.screen==='world'&&!B&&!(typeof WS!=='undefined'&&WS.lock);}catch(e){return false;}}
function svLeave(why){
  try{if(svSafeSave()){const slot=META.slot||0;if(JSON.stringify(packG())!==svSlotRaw(slot))saveGame();}}catch(e){}   // in a battle the slot keeps the pre-battle save
  if(SV.status==='local'||!Object.keys(SV.dirty).length)return;
  if(SV.busy){SV.again=SV.again||true;return;}
  clearTimeout(SV.timer);SV.timer=null;svFlush();
}
// coming back to this device: look at every slot again (a newer save from another device shows up here)
function svBack(){if(SV.status==='local'||!SV.firstDone)return;if(!SV.busy&&Date.now()-SV.lastCheck<800&&!Object.keys(SV.dirty).length)return;svFlush(false,true);}   // visible and focus often come together: one pass
// Electron (Windows app) asks before closing its window: push and wait a moment
async function svBeforeClose(){svLeave('close');const t0=Date.now();while((SV.busy||Object.keys(SV.dirty).length&&SV.status!=='local'&&SV.status!=='error'&&SV.status!=='queued')&&Date.now()-t0<3500)await new Promise(r=>setTimeout(r,100));return true;}
try{window.svBeforeClose=svBeforeClose;}catch(e){}
function svRefreshTitle(){try{if(V.screen==='title'){BUILT=null;render();}}catch(e){}}
function svMaybeDiv(){
  try{if(SV.newer&&V.screen==='title'){const n=SV.newer,o=loadRaw(n.slot);SV.newer=null;if(o){const L=svProg(o);SV.div=SV.div.filter(d=>d.slot!==n.slot);SV.div.push({slot:n.slot,L:{prog:L,saved:L.saved},C:n.C});}else SV.hold[n.slot]=0;}}catch(e){}
  const d=SV.div.find(x=>SV.later[x.slot]!==x.C.hash);
  if(d&&V.screen==='title'&&!V.modal){V.modal={type:'svdiv',slot:d.slot};try{render();}catch(e){}}}
// a newer save for the open journey: ask once the player is free (not in a battle, a menu or a transition)
function svMaybeNewer(){try{if(SV.newer&&V.screen==='world'&&!V.modal&&!B&&!(typeof WS!=='undefined'&&WS.lock)){V.modal={type:'svnewer',slot:SV.newer.slot};render();}}catch(e){}}
setInterval(()=>{try{
  svMaybeNewer();if(SV.newer&&V.screen==='title')svMaybeDiv();
  const per=SAVE_UI.recheck||60000;
  if(SV.firstDone&&SV.db&&!SV.busy&&SV.status!=='local'&&document.visibilityState==='visible'&&Date.now()-SV.lastCheck>=per-1000)svFlush(false,true);   // the 1 s tick: a pass at most every recheck ms
}catch(e){}},1000);
window.addEventListener('online',()=>{svStatus(SV.status==='local'?'local':'syncing');setTimeout(()=>svFlush(true,true),800);});
window.addEventListener('offline',()=>{if(SV.status!=='local')svStatus('queued');});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')svLeave('hidden');else svBack();});
window.addEventListener('pagehide',()=>svLeave('pagehide'));
document.addEventListener('freeze',()=>svLeave('freeze'));
window.addEventListener('blur',()=>svLeave('blur'));
window.addEventListener('focus',svBack);
window.addEventListener('pageshow',e=>{if(e.persisted)svBack();});
document.addEventListener('pause',()=>svLeave('pause'),false);          // Capacitor / Cordova lifecycle events on document
document.addEventListener('resume',svBack,false);
setTimeout(()=>{try{const C=window.Capacitor,P=C&&C.Plugins&&C.Plugins.App;if(P&&P.addListener&&(!C.isPluginAvailable||C.isPluginAvailable('App'))){P.addListener('pause',()=>svLeave('pause'));P.addListener('resume',svBack);P.addListener('appStateChange',s=>{if(s&&s.isActive===false)svLeave('pause');else svBack();});}}catch(e){}},0);
// start: once the page has loaded (cloud.js has set up the account by then), not on a fixed delay
{const go=()=>setTimeout(()=>{try{svInit();}catch(e){svFirstDone();}},400);if(document.readyState==='complete')go();else window.addEventListener('load',go,{once:true});}
{const tt0=ACT.toTitle;ACT.toTitle=function(){const r=tt0.apply(this,arguments);setTimeout(svMaybeDiv,50);return r;};}
// Continue and loading a slot wait for the first cloud check (at most SAVE_UI.cloudWait), so an older local copy is not opened by mistake
function svGate(slot,fn){
  const raw=svSlotRaw(slot);
  if(SV.firstDone||SV.status==='local'||navigator.onLine===false||SV.dirty[slot]||!raw||!svParse(raw).ok)return svGateGo(slot,fn);
  V.modal={type:'svwait',slot};render();let done=false;
  const go=()=>{if(done)return;done=true;clearTimeout(t);if(V.modal&&V.modal.type==='svwait')V.modal=null;svGateGo(slot,fn);};
  const t=setTimeout(go,SAVE_UI.cloudWait||6000);SV.first.then(go);SV.gateGo=go;
}
function svGateGo(slot,fn){const d=SV.div.find(x=>x.slot===slot);if(d&&V.screen==='title'){V.modal={type:'svdiv',slot};render();return;}fn();}
// ---------- cloud list, delete ----------
async function svCloudList(){
  if(!(await svCap()))return [];const out=[];
  for(const s of [0,1,2]){try{const m=await svRef('s',s).get();if(m.exists)out.push({kind:'s',key:String(s),slot:s,d:m.data()});}catch(e){}
    for(let i=0;i<3;i++){try{const h=await svRef('h',s+'-'+i).get();if(h.exists)out.push({kind:'h',key:s+'-'+i,slot:s,d:h.data()});}catch(e){}}}
  return out;
}
// ---------- UI ----------
const SV_ICON={synced:'☁✓',syncing:'⟳',queued:'☁…',error:'⚠',local:'▣',attention:'☁!',idle:'☁'};
const SV_TXT={synced:'Synced to your account',syncing:'Syncing…',queued:'Offline: will sync when you are back online',error:'Cloud sync hit a problem',local:'Saved on this device only',attention:'Cloud and device differ: pick one on the title screen',idle:'Not synced yet'};
function svIcon(){
  let el=document.getElementById('svicon');
  if(!el){el=document.createElement('div');el.id='svicon';document.body.appendChild(el);
    const st=document.createElement('style');st.textContent='#svicon{position:fixed;left:6px;bottom:6px;z-index:60;font:12px/1 "Nunito",monospace;color:#d8c9a8;background:rgba(14,10,6,.78);border:2px solid #000;padding:3px 5px;pointer-events:none;opacity:.85}#svicon.error,#svicon.attention{color:#ffb070}#svicon.synced{color:#a8ffb8}#svicon.hide{display:none}.svrow{display:flex;gap:10px;align-items:center;margin:2px 0 8px;padding:8px 10px;border:2px solid #000;background:rgba(0,0,0,.25)}.svi{font-size:18px;min-width:34px;text-align:center}.svi.synced{color:#a8ffb8}.svi.error,.svi.attention{color:#ffb070}.svbtns{flex-wrap:wrap;gap:6px;justify-content:flex-start}.svbtns .btn{flex:0 0 auto}.svbad{color:#ffb070}.svta{width:100%;box-sizing:border-box;font:12px monospace}.svpick{display:grid;gap:6px;margin:8px 0}.svpick label{display:flex;gap:8px;align-items:center;padding:6px;border:2px solid #000;background:rgba(0,0,0,.25)}';document.head.appendChild(st);}
  const s=SV.status;el.className=s;el.textContent=SV_ICON[s]||'☁';el.title=SV_TXT[s]||'';
  el.classList.toggle('hide',s==='idle'||(s==='local'&&V.screen!=='world'));
}
function svTitleNote(){
  const bad=[0,1,2].filter(s=>slotState(s)==='bad');
  return `${bad.length?`<p class="note svbad">${bad.length===1?'Slot '+(bad[0]+1)+' could not be read':bad.length+' slots could not be read'}. They were not touched. Open Recover Saves.</p>`:''}${SV.status==='local'?'<p class="note">Progress is saved on this device only, not synced to an account. Use <b>Export save</b> now and then to keep a copy.</p>':''}`;
}
function svJourneyRow(){
  const s=SV.status,slot=META.slot||0,vis=s==='local';
  return `<div class="svrow"><span class="svi ${s}">${SV_ICON[s]||'☁'}</span><div class="grow"><b>${esc(SV_TXT[s]||'')}</b><small>${vis?'<b>Prominent reminder:</b> this is not synced to an account. Export save is your backup.':SV.last?'Last sync '+esc(agoText(SV.last)):'Waiting for the first sync'}${SV.errMsg&&s==='error'?'<br>'+esc(SV.errMsg):''}${SV.werr?'<br><b class="svbad">The last save did not write on this device. Export now.</b>':''}</small></div></div>
    <div class="btnrow svbtns"><button class="btn sm" data-act="svExport" data-arg="${slot}">Export save</button><button class="btn sm" data-act="recoverOpen">Recover Saves</button>${vis?'':`<button class="btn sm" data-act="svDelAsk" data-arg="${slot}">Delete cloud save</button>`}</div>`;
}
{const vj0=vJourney;vJourney=function(){let h=vj0.apply(this,arguments);
  h=h.replace(/(data-act="saveJ">[^<]*<\/button>)(<\/div>)/,`$1<button class="btn" data-act="svSyncNow" title="${esc(SV_TXT[SV.status]||'')}" ${SV.status==='local'?'disabled':''}>${SV_ICON[SV.status]||'☁'} Sync</button>$2`);
  return h.replace(/(<div class="savebar[\s\S]*?<\/button><\/div>)/,'$1'+svJourneyRow());};}
function mSlots(m){
  const rows=[0,1,2].map(s=>{const o=slotSummary(s),st=slotState(s);
    const info=o?`Stage ${o.stage+1}, ${o.cleared} of 5 beacons relit${o.cycle?', NG+'+o.cycle:''}. Party level ${o.lv}, ${fmt(o.gold)} gold, ${o.battles} battles.${o.savedAt?' Saved '+new Date(o.savedAt).toLocaleString():''}`:st==='bad'?'<span class="svbad">This save could not be read. It is still stored, untouched.</span>':'Empty';
    const btn=m.mode==='load'?(st==='bad'?`<button class="btn sm gold" data-act="slotLoad" data-arg="${s}">Retry</button>`:`<button class="btn sm gold" data-act="slotLoad" data-arg="${s}" ${o?'':'disabled'}>Load</button>`):`<button class="btn sm ${o||st==='bad'?'':'gold'}" data-act="slotNew" data-arg="${s}">${o||st==='bad'?'Overwrite':'Start here'}</button>`;
    return `<div class="row"><div class="grow"><b>Slot ${s+1}${(META.slot||0)===s?' <span class="cyc">last used</span>':''}</b><small>${info}</small>${o?`<div class="els">${o.party.slice(0,6).map(id=>TPL[id]?port(id,'sm'):'').join('')}</div>`:''}</div>${btn}${o||st==='bad'?`<button class="btn sm" data-act="svExport" data-arg="${s}" aria-label="Export slot ${s+1}">⤓</button><button class="btn sm" data-act="slotDel" data-arg="${s}" aria-label="Delete slot ${s+1}">✕</button>`:''}</div>`;}).join('');
  return box(m.mode==='load'?'Continue a journey':'Choose a save slot',`<div class="rows">${rows}</div>${m.mode==='new'?'<p class="note">Overwriting or clearing keeps a backup. Find it under Recover Saves.</p>':''}`,(m.mode==='new'?'<button class="btn" data-act="toTitle">Back</button>':'')+'<button class="btn" data-act="recoverOpen">Recover Saves</button>');
}
function svSumBlock(o,label){const p=svProg(o);return `<div class="row"><div class="grow"><b>${esc(label)}</b><small>${esc(svProgText(p))}</small><small>${esc(svHeroLine(o))}</small><small>Saved ${esc(svWhen(o.savedAt))}</small></div></div>`;}
function mSvFail(m){
  const raw=svSlotRaw(m.slot)||'';
  return box('This save would not load',`<p>Slot ${m.slot+1} did not open, and nothing was changed or replaced.</p><p class="note">${esc(m.why||'')}</p><p class="note">Your original data is still stored exactly as it was. You can try again, copy it out as a code, or look for a backup.</p>`,
    `<button class="btn gold" data-act="svRetry" data-arg="${m.slot}">Retry</button><button class="btn" data-act="svExportRaw" data-arg="${m.slot}">Export raw data</button><button class="btn" data-act="recoverOpen">Recover Saves</button><button class="btn" data-act="closeModal">Close</button>`);
}
function mSvExport(m){
  return box('Export save',`<p class="note">Slot ${m.slot+1}. Copy this code, or save it as a file. Import it on any device or URL to carry the journey over.</p><textarea id="expta" class="svta" readonly rows="6">${esc(m.code)}</textarea>`,
    `<button class="btn gold" data-act="copyExport">Copy</button><button class="btn" data-act="svDown" data-arg="${m.slot}">Download file</button><button class="btn" data-act="closeModal">Close</button>`);
}
function mSvImport(m){
  const picks=[0,1,2].map(s=>{const o=loadRaw(s),st=slotState(s);return `<label><input type="radio" name="svslot" value="${s}" ${(m.slot==null?META.slot||0:m.slot)===s?'checked':''}><span><b>Slot ${s+1}</b> <small>${o?esc(svProgText(svProg(o))):st==='bad'?'unreadable save (kept as a backup)':'empty'}</small></span></label>`;}).join('');
  return box('Import save',`<p class="note">Paste a save code or choose a file. Nothing is replaced until you confirm.</p><textarea id="impta" class="svta" rows="5" placeholder="AWSAVE1....">${esc(m.text||'')}</textarea><p><input type="file" id="svfile" accept=".awsave,.txt,.json,text/plain"></p><h4>Put it in</h4><div class="svpick">${picks}</div>${m.err?`<p class="svbad">${esc(m.err)}</p>`:''}`,
    '<button class="btn gold" data-act="svImportGo">Check it</button><button class="btn" data-act="closeModal">Cancel</button>');
}
function mSvImpConfirm(m){
  const ex=slotSummary(m.slot),st=slotState(m.slot);
  return box('Replace this save?',`${svSumBlock(m.o,'Incoming')}${ex?svSumBlock(loadRaw(m.slot),'Now in slot '+(m.slot+1)):st==='bad'?'<p class="note">Slot '+(m.slot+1)+' holds an unreadable save. It will be kept as a backup.</p>':'<p class="note">Slot '+(m.slot+1)+' is empty.</p>'}<p class="note">${ex||st==='bad'?'What is there now is backed up first and stays in Recover Saves.':'Nothing will be lost.'}</p>`,
    `<button class="btn gold" data-act="svImportDo">${ex||st==='bad'?'Replace slot '+(m.slot+1):'Import into slot '+(m.slot+1)}</button><button class="btn" data-act="importOpen">Back</button>`);
}
function mRecover(m){
  const items=svScan(),inTitle=V.screen==='title';
  const hero=it=>it.ok?`<small>${esc(svHeroLine(it.o))}</small><small>${esc(svProgText(svProg(it.o)))}</small>`:`<small class="svbad">${esc(it.why)}</small>`;
  const local=items.map(it=>{const nm=it.kind==='backup'?`${esc(it.label)} <span class="cyc">${esc(it.note||'backup')}</span>`:esc(it.label);
    return `<div class="row"><div class="grow"><b>${nm}</b>${hero(it)}<small>${it.kind==='backup'?'Backed up '+esc(svWhen(it.at))+(it.savedAt?', saved '+esc(svWhen(it.savedAt)):''):it.savedAt?'Saved '+esc(svWhen(it.savedAt)):''}</small></div>
      ${it.ok?`<button class="btn sm gold" data-act="svRestoreAsk" data-arg="L:${esc(it.key)}" ${inTitle?'':'disabled'}>Restore</button>`:''}<button class="btn sm" data-act="svExportKey" data-arg="${esc(it.key)}">Export</button></div>`;}).join('')||'<p class="note">No saves found on this device.</p>';
  let cloud='';
  if(SV.status==='local')cloud='<p class="note">Not signed in to an account that can store saves, so there are no cloud copies.</p>';
  else if(m.cloud){cloud=m.cloud.length?m.cloud.map(c=>{const d=c.d;return `<div class="row"><div class="grow"><b>${c.kind==='s'?'Cloud save, slot '+(c.slot+1):'Cloud history, slot '+(c.slot+1)}</b><small>${esc(svProgText(d.prog||{stage:0,cleared:0,heroes:0,battles:0,lv:0}))}</small><small>Saved ${esc(svWhen(d.savedAt))} on ${esc(d.dev||'a device')}</small></div><button class="btn sm gold" data-act="svRestoreAsk" data-arg="C:${c.kind}:${esc(c.key)}" ${inTitle?'':'disabled'}>Restore</button></div>`;}).join(''):'<p class="note">No cloud saves yet.</p>';
    cloud+=m.cloud.some(c=>c.kind==='h')?`<p class="btnrow"><button class="btn sm" data-act="svDelHistAsk">Delete all cloud history</button></p>`:'';}
  else cloud='<p class="note">Looking in your account…</p>';
  return box('Recover Saves',`<p class="note">Every save, backup and stray slot found here. Restoring never deletes anything: what it replaces is backed up first.${inTitle?'':' Restoring is only available from the title screen.'}</p><h4>On this device</h4><div class="rows">${local}</div><h4>In your account</h4><div class="rows">${cloud}</div>`,
    `<button class="btn" data-act="importOpen">Import a code or file</button><button class="btn gold" data-act="closeModal">Close</button>`,true);
}
function mSvRestore(m){
  const picks=[0,1,2].map(s=>{const o=loadRaw(s),st=slotState(s);return `<label><input type="radio" name="svslot" value="${s}" ${m.slot===s?'checked':''}><span><b>Slot ${s+1}</b> <small>${o?'has a journey (backed up first): '+esc(svProgText(svProg(o))):st==='bad'?'unreadable save (backed up first)':'empty'}</small></span></label>`;}).join('');
  return box('Restore into which slot?',`${m.o?svSumBlock(m.o,'Restoring'):''}<div class="svpick">${picks}</div>`,'<button class="btn gold" data-act="svRestoreDo">Restore</button><button class="btn" data-act="recoverOpen">Back</button>');
}
function mSvDiv(m){
  const d=SV.div.find(x=>x.slot===m.slot)||SV.div[0];if(!d)return box('All matched','<p>Nothing to decide.</p>','<button class="btn" data-act="closeModal">Close</button>');
  const c=d.C;
  return box(`Slot ${d.slot+1}: which save is right?`,`<p>This device and your account hold different versions of this journey. Neither one is deleted. The one you do not pick is kept as a backup.</p>
    <div class="row"><div class="grow"><b>On this device</b><small>${esc(svProgText(d.L.prog))}</small><small>Saved ${esc(svWhen(d.L.saved))}</small></div></div>
    <div class="row"><div class="grow"><b>In your account</b><small>${esc(svProgText(c.prog||{stage:0,cleared:0,heroes:0,battles:0,lv:0}))}</small><small>Saved ${esc(svWhen(c.savedAt))} on ${esc(c.dev||'another device')}</small></div></div>`,
    `<button class="btn gold" data-act="svKeepLocal" data-arg="${d.slot}">Keep this device</button><button class="btn gold" data-act="svUseCloud" data-arg="${d.slot}">Use my account</button><button class="btn" data-act="svLater" data-arg="${d.slot}">Decide later</button>`);
}
function mSvWait(m){return box(m.load?'Loading the newer save…':'Checking cloud saves…',m.load?'<p>Reading it from your account.</p>':`<p>Looking for a newer save of slot ${(m.slot||0)+1} in your account.</p><p class="note">This takes a moment. If it is slow, the save on this device opens and the check keeps going.</p>`,m.load?' ':'<button class="btn" data-act="svWaitSkip">Use this device now</button>');}
function mSvNewer(m){
  const n=SV.newer;if(!n)return box('All matched','<p>Nothing to decide.</p>','<button class="btn" data-act="closeModal">Close</button>');
  const c=n.C,lo=loadRaw(n.slot),when=svWhen(svCloudTime(c)-(SV.skew||0)),dev=esc(c.dev||'another device');
  return box(n.kind==='newer'?'A newer save exists':'Your account has a different save',`<p>${n.kind==='newer'?'A newer save':'A different save'} from <b>${dev}</b>, ${esc(when)}, exists for slot ${n.slot+1}.</p>
    <div class="row"><div class="grow"><b>In your account</b><small>${esc(svProgText(c.prog||{stage:0,cleared:0,heroes:0,battles:0,lv:0}))}</small><small>Saved ${esc(when)} on ${dev}</small></div></div>
    ${lo?`<div class="row"><div class="grow"><b>Playing now on this device</b><small>${esc(svProgText(svProg(lo)))}</small><small>Saved ${esc(svWhen(lo.savedAt))}</small></div></div>`:''}
    <p class="note">Nothing is lost either way. Load it keeps this device's journey in Recover Saves; Keep this one keeps the other save in your account's history.</p>`,
    `<button class="btn gold" data-act="svNewerLoad">Load it</button><button class="btn" data-act="svNewerKeep">Keep this one</button>`);
}
function mSvDel(m){return box('Delete cloud save?',`<p>This removes the cloud copy of slot ${m.slot+1} from your account. The save on this device stays. The last three older cloud versions are kept until you delete them too.</p>`,`<button class="btn gold" data-act="svDelDo" data-arg="${m.slot}">Delete cloud save</button><button class="btn" data-act="closeModal">Keep it</button>`);}
function mSvDelHist(){return box('Delete cloud history?',`<p>This removes the older cloud versions kept as backups, for all slots. Current cloud saves and saves on this device stay.</p>`,'<button class="btn gold" data-act="svDelHistDo">Delete history</button><button class="btn" data-act="recoverOpen">Keep it</button>');}
HOOK.before('vModal','saves','the save popups (slots, export, import, recover, sync)',function(m){if(m){switch(m.type){case 'slots':return HOOK.stop(mSlots(m));case 'svfail':return HOOK.stop(mSvFail(m));case 'svexport':return HOOK.stop(mSvExport(m));case 'import':return HOOK.stop(mSvImport(m));case 'svimpconfirm':return HOOK.stop(mSvImpConfirm(m));case 'recover':return HOOK.stop(mRecover(m));case 'svrestore':return HOOK.stop(mSvRestore(m));case 'svdiv':return HOOK.stop(mSvDiv(m));case 'svwait':return HOOK.stop(mSvWait(m));case 'svnewer':return HOOK.stop(mSvNewer(m));case 'svdel':return HOOK.stop(mSvDel(m));case 'svdelhist':return HOOK.stop(mSvDelHist());}}});
// run fn while no other sync pass runs (waits up to 10 s for one in flight)
async function svLocked(fn){const t0=Date.now();while(SV.busy&&Date.now()-t0<10000)await new Promise(r=>setTimeout(r,100));
  SV.busy=true;try{return await fn();}finally{SV.busy=false;if(SV.again){const a=SV.again;SV.again=false;setTimeout(()=>svFlush(a==='all',a==='all'),0);}}}
function svPickedSlot(def){const r=document.querySelector('input[name="svslot"]:checked');return r?+r.value:def;}
Object.assign(ACT,{
  svExport(s){s=+s;const raw=svSlotRaw(s),p=svParse(raw);if(!p.ok){toast('That slot has nothing readable to export. Use Recover Saves.');return;}V.modal={type:'svexport',slot:s,code:svCode(JSON.stringify(p.o))};render();},
  svExportRaw(s){s=+s;const raw=svSlotRaw(s);if(!raw){toast('Nothing stored in that slot.');return;}V.modal={type:'svexport',slot:s,code:'AWRAW1.'+btoa(unescape(encodeURIComponent(raw)))};render();},
  svExportKey(k){const it=svScan().find(x=>x.key===k);if(!it||!it.raw){toast('Nothing to export.');return;}V.modal={type:'svexport',slot:it.slot==null?0:it.slot,code:it.ok?svCode(JSON.stringify(it.o)):'AWRAW1.'+btoa(unescape(encodeURIComponent(it.raw)))};render();},
  async svDown(s){const t=$('expta');if(!t)return;const ok=await svDownload(svFileName(+s),t.value);toast(ok?'File saved.':'Could not start the download. Copy the code instead.');},
  importOpen(){V.modal={type:'import',slot:META.slot||0};render();},
  recoverOpen(){V.modal={type:'recover',cloud:null};render();svCloudList().then(l=>{if(V.modal&&V.modal.type==='recover'){V.modal.cloud=l;render();}}).catch(()=>{if(V.modal&&V.modal.type==='recover'){V.modal.cloud=[];render();}});},
  svImportGo(){const t=$('impta'),text=t?t.value:'';const r=svDecode(text);const slot=svPickedSlot(META.slot||0);
    if(!r.ok){V.modal={type:'import',slot,text,err:r.why};render();return;}
    V.modal={type:'svimpconfirm',slot,o:r.o,raw:r.raw};render();},
  svImportDo(){const m=V.modal;if(!m||m.type!=='svimpconfirm')return;const s=m.slot,old=svSlotRaw(s);if(old)svBackup(s,old,'before an import replaced it');
    const o=m.o;if(o.gv==null)o.gv='imported';if(!svLs.set(slotKey(s),JSON.stringify(o))){toast('This device has no room to store that save.');return;}
    META.slot=s;saveMeta();SV.hold[s]=0;V.modal=null;toast('Imported into slot '+(s+1)+'.');svRefreshTitle();render();SV.dirty[s]=1;clearTimeout(SV.timer);SV.timer=setTimeout(svFlush,1500);},
  async svRestoreAsk(a){
    if(a.startsWith('L:')){const it=svScan().find(x=>x.key===a.slice(2));if(!it||!it.ok){toast('That one cannot be restored.');return;}
      V.modal={type:'svrestore',slot:it.slot<3?it.slot:META.slot||0,o:it.o,raw:JSON.stringify(it.o)};render();}
    else{const [,kind,key]=a.split(':');try{const c=await svGet(kind,key);const p=c&&svParse(c.raw);if(!p||!p.ok){toast('That cloud copy cannot be read.');return;}V.modal={type:'svrestore',slot:+key[0],o:p.o,raw:JSON.stringify(p.o)};render();}catch(e){toast('Could not reach your account.');}}},
  svRestoreDo(){const m=V.modal;if(!m||m.type!=='svrestore')return;const s=svPickedSlot(m.slot),old=svSlotRaw(s);if(old)svBackup(s,old,'before a restore replaced it');
    if(!svLs.set(slotKey(s),m.raw)){toast('This device has no room to store that save.');return;}
    META.slot=s;saveMeta();SV.hold[s]=0;SV.dirty[s]=1;clearTimeout(SV.timer);SV.timer=setTimeout(svFlush,1500);toast('Restored into slot '+(s+1)+'.');V.modal=null;svRefreshTitle();render();},
  svKeepLocal(s){s=+s;V.modal=null;const dd=SV.div.find(d=>d.slot===s);if(dd&&dd.C&&dd.C.hash){SV.keep[s]=dd.C.hash;svSyncSave();}SV.div=SV.div.filter(d=>d.slot!==s);SV.hold[s]=0;render();(async()=>{try{if(await svCap()){svStatus('syncing');await svPush(s,'chosen on this device');svStatus(SV.div.length?'attention':'synced','');}}catch(e){svStatus(svErrKind(e),e&&e.message);}svMaybeDiv();})();},
  svUseCloud(s){s=+s;V.modal=null;SV.div=SV.div.filter(d=>d.slot!==s);SV.hold[s]=0;render();(async()=>{try{if(await svCap()){svStatus('syncing');await svPull(s,'chosen');svStatus(SV.div.length?'attention':'synced','');toast('Slot '+(s+1)+' now matches your account. The old copy is in Recover Saves.');}}catch(e){svStatus(svErrKind(e),e&&e.message);toast('Could not read the cloud copy. Nothing changed.');}render();svMaybeDiv();})();},
  svLater(s){s=+s;const d=SV.div.find(x=>x.slot===s);if(d)SV.later[s]=d.C.hash;V.modal=null;render();},
  svWaitSkip(){if(SV.gateGo)SV.gateGo();},
  async svNewerLoad(){const n=SV.newer;if(!n){V.modal=null;render();return;}const s=n.slot;
    try{if(svSafeSave())saveGame();}catch(e){}                              // this device's journey goes into the backup that svPull writes
    V.modal={type:'svwait',slot:s,load:1};render();
    const ok=await svLocked(async()=>{if(!(await svCap()))return false;return await svPull(s,'chosen');}).catch(e=>{toast('Could not read the cloud copy. Nothing changed.');return false;});
    if(V.modal&&V.modal.type==='svwait')V.modal=null;
    if(!ok){render();return;}
    SV.newer=null;svUnhold(s);delete SV.dirty[s];svStatus(svAttn()?'attention':'synced','');
    svLoad(s);toast('Loaded the newer save. This device\'s journey is kept in Recover Saves.');},
  async svNewerKeep(){const n=SV.newer;if(!n){V.modal=null;render();return;}const s=n.slot;SV.keep[s]=n.C.hash;svSyncSave();SV.newer=null;svUnhold(s);V.modal=null;render();
    try{if(svSafeSave())saveGame();}catch(e){}
    try{await svLocked(async()=>{if(await svCap()){svStatus('syncing');await svPush(s,'kept on this device');delete SV.dirty[s];svStatus(svAttn()?'attention':'synced','');}});toast('Kept this device\'s journey. The other save stays in your account history.');}
    catch(e){SV.dirty[s]=1;svStatus(svErrKind(e),e&&e.message);}},
  svSyncNow(){if(SV.status==='local'){toast('Progress is not synced to an account here. Use Export save.');return;}SV.dirty[META.slot||0]=1;svStatus(navigator.onLine===false?'queued':'syncing');render();svFlush(true).then(()=>toast(SV.status==='synced'?'Synced.':SV.status==='error'?'Sync failed. Your local save is safe.':SV.status==='queued'?'Offline. It will sync later.':'Sync done.'));},
  svDelAsk(s){V.modal={type:'svdel',slot:+s};render();},
  async svDelDo(s){s=+s;V.modal=null;render();try{if(await svCap()){await svDelDoc('s',s);SV.base[s]=null;toast('Cloud save for slot '+(s+1)+' deleted. History is kept.');}}catch(e){toast('Could not delete it right now.');}},
  svDelHistAsk(){V.modal={type:'svdelhist'};render();},
  async svDelHistDo(){try{if(await svCap()){for(const s of [0,1,2])for(let i=0;i<3;i++)await svDelDoc('h',s+'-'+i);toast('Cloud history deleted.');}}catch(e){toast('Could not delete it right now.');}ACT.recoverOpen();},
});
// a chosen file fills the import box
document.addEventListener('change',e=>{const f=e.target&&e.target.id==='svfile'&&e.target.files&&e.target.files[0];if(!f)return;
  if(f.size>4000000){toast('That file is too big to be a save.');return;}
  const r=new FileReader();r.onload=()=>{const t=$('impta');if(t)t.value=String(r.result||'');toast('File loaded. Tap Check it.');};r.onerror=()=>toast('Could not read that file.');r.readAsText(f);});
// the status icon follows the screen
HOOK.after('render','saves','save status icon',function(){try{svIcon();}catch(e){}});
// old helpers keep working: importSave now reports through the same checks and never writes anything itself
function importSave(code){const r=svDecode(code);if(!r.ok)return null;try{return unpackG(r.o);}catch(e){return null;}}
ACT.doImport=function(){ACT.svImportGo();};
// v0.4.3: Settings has a way back to the main menu (the journey is saved first)
{const sb0=settingsBody;settingsBody=function(){const h=sb0.apply(this,arguments);if(!G||V.screen==='title')return h;
  return h+`<div class="rows"><div class="row"><div><b>Main menu</b><small>${G.daily?'Leave the Daily Trial and go back to the title screen.':'Your journey is saved first. Continue picks it up again.'}</small></div><button class="btn sm" data-act="quitTitle">Back to the main menu</button></div></div>`;};}
ACT.quitTitle=function(){if(V.screen==='battle'){toast('Finish or flee the battle first.');return;}try{if(G&&!G.daily)saveGame();}catch(e){}V.modal=null;WS.held=[];V.screen='title';G=null;B=null;render();};
// v0.8.5 test hook (tests reach the sync code here; window.__A is left alone)
try{window.__SV85={get SV(){return SV;},svPush:(...a)=>svPush(...a),svPull:(...a)=>svPull(...a),svFlush:(...a)=>svFlush(...a),svCheck:(...a)=>svCheck(...a),svLeave:w=>svLeave(w),svBack:()=>svBack(),svHash:s=>svHash(s),svDecide:(...a)=>svDecide(...a),svDev:()=>svDev()};}catch(e){}
