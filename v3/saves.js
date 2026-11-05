// =================== SAVE RECOVERY AND ACCOUNT SAVES (Beta v0.3.4) ===================
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
loadRaw=function(slot){const raw=svSlotRaw(slot==null?(META.slot||0):slot);if(!raw)return null;const p=svParse(raw);return p.ok?p.o:null;};
// ---------- progress ----------
function svProg(o){const ro=o.roster||{},party=(o.party||[]).filter(id=>ro[id]),st=o.stats||{};
  return {stage:o.stage||0,cleared:(Array.isArray(o.cleared)?o.cleared:[]).filter(Boolean).length,cycle:(o.run&&o.run.cycle)||0,heroes:Object.keys(ro).length,battles:st.battles||0,play:st.play||0,
    lv:party.length?Math.round(party.reduce((a,id)=>a+(ro[id].lv||0),0)/party.length):0,gold:o.gold||0,saved:o.savedAt||0};}
function svScore(p){return p.cycle*100000+p.stage*10000+p.cleared*2000+p.heroes*100+Math.min(5000,p.battles)+Math.min(999,Math.floor(p.play/60000));}
function svDom(a,b){return ['cycle','stage','cleared','heroes','battles','lv'].every(k=>(a[k]||0)>=(b[k]||0));}
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
  cont(){svLoad(META.slot||0);},
  slotLoad(s){svLoad(+s);},
  slotNew(s){const raw=svSlotRaw(+s);if(raw)svBackup(+s,raw,'before a new journey replaced it');META.slot=+s;saveMeta();V.modal=null;render();},
  slotDel(s){s=+s;const raw=svSlotRaw(s);if(raw)svBackup(s,raw,'before the slot was cleared');svLs.del(slotKey(s));toast(`Slot ${s+1} cleared. A backup stays in Recover Saves.`);svRefreshTitle();render();},
  svRetry(s){svLoad(+s);},
});
// ---------- scanning storage for everything that looks like a save ----------
const SV_SKIP=/^(aurelis-meta-v1|aurelis-daily-|aurelis-legend|aurelis-offline|aurelis-dev-v1|aurelis-bak-idx)/;
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
async function svCap(){
  if(SV.db&&SV.uid)return true;
  const db=await capOf('db'),user=await capOf('user');let uid=null;
  if(user){try{uid=await user.id();}catch(e){}}
  let can=null;if(user&&user.can){try{can=await user.can('data.write');}catch(e){}}
  if(!db||!uid||can===false){SV.status='local';svIcon();return false;}
  SV.db=db;SV.uid=uid;return true;
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
async function svPush(slot,why){
  const raw=svSlotRaw(slot),p=svParse(raw);if(!p.ok)return false;
  const prog=svProg(p.o),b64=await svPack(raw),dev=svDev();
  const cur=await svRef('s',slot).get();let hi=0,prevN=0;
  if(cur.exists){const old=cur.data();hi=old.hi||0;prevN=old.n||1;
    // the version being replaced becomes history entry hi%3 (the last three are kept)
    const prev=await svGet('s',slot).catch(()=>null);
    if(prev){const hk=slot+'-'+(hi%3);let hn=0;try{const hs=await svRef('h',hk).get();if(hs.exists)hn=hs.data().n||1;}catch(e){}
      await svPut('h',hk,Object.assign({},old,{hist:1,replacedAt:Date.now()}),prev.b64,hn);hi=hi+1;}}
  const hash=svHash(raw);
  await svPut('s',slot,{v:1,sv:3,gv:p.o.gv||'older',slot,savedAt:p.o.savedAt||Date.now(),score:svScore(prog),prog,dev:dev.label,hash,hi,pushedAt:Date.now(),why:why||''},b64,prevN);
  SV.base[slot]=hash;return true;
}
async function svPull(slot,why){
  const c=await svGet('s',slot);if(!c)return false;
  const p=svParse(c.raw);if(!p.ok)throw new Error('the cloud copy is damaged: '+p.why);
  const old=svSlotRaw(slot);if(old)svBackup(slot,old,'before the cloud save replaced it');
  if(!svLs.set(slotKey(slot),c.raw))throw new Error('this device has no room to store it');
  SV.base[slot]=c.d.hash||svHash(c.raw);return true;
}
// compare one slot: push, pull, leave alone, or flag a divergence. live = a journey is open on this slot: never pull or prompt mid game.
async function svCheck(slot,live){
  const raw=svSlotRaw(slot),pr=raw?svParse(raw):{ok:false};
  const snap=await svRef('s',slot).get(),cd=snap.exists?snap.data():null;
  if(!pr.ok&&raw)return 'damaged';                                   // never touch a slot we cannot read
  if(!raw&&!cd)return 'none';
  if(raw&&!cd){svBackup(slot,raw,'before the first cloud upload');await svPush(slot,'first upload');return 'pushed';}
  if(!raw&&cd){if(live)return 'skip';await svPull(slot,'restored');SV.restored=(SV.restored||0)+1;return 'pulled';}
  const L=svProg(pr.o),hash=svHash(raw);
  if(cd.hash===hash){SV.base[slot]=hash;return 'same';}
  const dc=(cd.savedAt||0)-(L.saved||0),cD=svDom(cd.prog||{},L),lD=svDom(L,cd.prog||{});
  let act;
  if(dc>2000)act=cD?'pull':'div';else if(dc<-2000)act=lD?'push':'div';else act=lD?'push':cD?'pull':'div';
  if(act==='push'){await svPush(slot,'newer');return 'pushed';}
  if(act==='pull'&&!live){await svPull(slot,'newer');SV.restored=(SV.restored||0)+1;return 'pulled';}
  if(!SV.div.some(d=>d.slot===slot))SV.div.push({slot,L:{prog:L,saved:L.saved},C:cd});
  SV.hold[slot]=1;return 'div';
}
function svStatus(s,msg){SV.status=s;if(msg!==undefined)SV.errMsg=msg;svIcon();}
function svErrKind(e){const c=e&&e.code;if(c==='not_granted'||c==='permission_denied'||c==='not_writer'||c==='forbidden')return 'local';return 'error';}
// autosave marks a slot dirty; one debounced pass pushes it
function svMark(slot){SV.dirty[slot]=1;if(SV.status==='local')return;clearTimeout(SV.timer);SV.timer=setTimeout(svFlush,6000);if(SV.status!=='error')svStatus(navigator.onLine===false?'queued':'syncing');}
async function svFlush(manual){
  if(SV.busy){clearTimeout(SV.timer);SV.timer=setTimeout(svFlush,1500);return;}
  const slots=Object.keys(SV.dirty).map(Number);if(!slots.length&&!manual)return;
  if(navigator.onLine===false){svStatus('queued');return;}
  SV.busy=true;
  try{
    if(!(await svCap())){return;}
    svStatus('syncing');
    for(const s of (slots.length?slots:[META.slot||0])){
      if(SV.hold[s]){continue;}
      const live=!!G&&V.screen!=='title'&&(META.slot||0)===s;
      const r=await svCheck(s,live);delete SV.dirty[s];
      if(r==='div'){try{toast('Your cloud save and this device differ. Pick one on the title screen.');}catch(e){}}
    }
    SV.last=Date.now();svStatus(SV.div.length?'attention':'synced','');clearTimeout(SV.retry);
  }catch(e){
    const k=svErrKind(e);svStatus(k,(e&&e.message)||String(e));
    if(k==='error'){clearTimeout(SV.retry);SV.retry=setTimeout(()=>svFlush(),60000);}
  }finally{SV.busy=false;if(typeof V!=='undefined'&&V.modal&&V.modal.type==='menu')try{render();}catch(e){}}
}
// first load of the session: compare every slot with the cloud
async function svInit(){
  if(SV.busy){setTimeout(svInit,1500);return;}
  if(navigator.onLine===false){svStatus('queued');return;}
  SV.busy=true;
  try{
    if(!(await svCap()))return;
    svStatus('syncing');
    for(const s of [0,1,2]){const live=!!G&&V.screen!=='title'&&(META.slot||0)===s;if(SV.hold[s])continue;const r=await svCheck(s,live);delete SV.dirty[s];}
    svStatus(SV.div.length?'attention':'synced','');SV.last=Date.now();
    if(SV.restored){try{toast('Restored '+SV.restored+' save'+(SV.restored>1?'s':'')+' from your account.');}catch(e){}SV.restored=0;}
  }catch(e){const k=svErrKind(e);svStatus(k,(e&&e.message)||String(e));if(k==='error'){clearTimeout(SV.retry);SV.retry=setTimeout(()=>svFlush(true),60000);}}
  finally{SV.busy=false;svMaybeDiv();svRefreshTitle();}
}
function svRefreshTitle(){try{if(V.screen==='title'){BUILT=null;render();}}catch(e){}}
function svMaybeDiv(){if(SV.div.length&&V.screen==='title'&&!V.modal){V.modal={type:'svdiv',slot:SV.div[0].slot};try{render();}catch(e){}}}
window.addEventListener('online',()=>{svStatus(SV.status==='local'?'local':'syncing');setTimeout(()=>{SV.db?svFlush(true):svInit();},800);});
window.addEventListener('offline',()=>{if(SV.status!=='local')svStatus('queued');});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Object.keys(SV.dirty).length&&SV.status!=='local')svFlush();});
setTimeout(()=>{try{svInit();}catch(e){}},2800);
{const tt0=ACT.toTitle;ACT.toTitle=function(){const r=tt0.apply(this,arguments);setTimeout(svMaybeDiv,50);return r;};}
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
function mSvDel(m){return box('Delete cloud save?',`<p>This removes the cloud copy of slot ${m.slot+1} from your account. The save on this device stays. The last three older cloud versions are kept until you delete them too.</p>`,`<button class="btn gold" data-act="svDelDo" data-arg="${m.slot}">Delete cloud save</button><button class="btn" data-act="closeModal">Keep it</button>`);}
function mSvDelHist(){return box('Delete cloud history?',`<p>This removes the older cloud versions kept as backups, for all slots. Current cloud saves and saves on this device stay.</p>`,'<button class="btn gold" data-act="svDelHistDo">Delete history</button><button class="btn" data-act="recoverOpen">Keep it</button>');}
{const vm0=vModal;vModal=function(m){if(m){switch(m.type){case 'slots':return mSlots(m);case 'svfail':return mSvFail(m);case 'svexport':return mSvExport(m);case 'import':return mSvImport(m);case 'svimpconfirm':return mSvImpConfirm(m);case 'recover':return mRecover(m);case 'svrestore':return mSvRestore(m);case 'svdiv':return mSvDiv(m);case 'svdel':return mSvDel(m);case 'svdelhist':return mSvDelHist();}}return vm0.apply(this,arguments);};}
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
  svKeepLocal(s){s=+s;V.modal=null;SV.div=SV.div.filter(d=>d.slot!==s);SV.hold[s]=0;render();(async()=>{try{if(await svCap()){svStatus('syncing');await svPush(s,'chosen on this device');svStatus(SV.div.length?'attention':'synced','');}}catch(e){svStatus(svErrKind(e),e&&e.message);}svMaybeDiv();})();},
  svUseCloud(s){s=+s;V.modal=null;SV.div=SV.div.filter(d=>d.slot!==s);SV.hold[s]=0;render();(async()=>{try{if(await svCap()){svStatus('syncing');await svPull(s,'chosen');svStatus(SV.div.length?'attention':'synced','');toast('Slot '+(s+1)+' now matches your account. The old copy is in Recover Saves.');}}catch(e){svStatus(svErrKind(e),e&&e.message);toast('Could not read the cloud copy. Nothing changed.');}render();svMaybeDiv();})();},
  svLater(s){V.modal=null;render();},
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
{const r0=render;render=function(){const x=r0.apply(this,arguments);try{svIcon();}catch(e){}return x;};}
// old helpers keep working: importSave now reports through the same checks and never writes anything itself
importSave=function(code){const r=svDecode(code);if(!r.ok)return null;try{return unpackG(r.o);}catch(e){return null;}};
ACT.doImport=function(){ACT.svImportGo();};
// v0.4.3: before playing on a new version, offer to export every save made by an older one (a backup the player keeps)
function svOldSlots(){const out=[];[0,1,2].forEach(s=>{try{const raw=svSlotRaw(s),p=svParse(raw);if(p.ok&&(p.o.gv||'')!==GAME_VERSION)out.push({s,gv:p.o.gv||'an older version'});}catch(e){}});return out;}
function mSvUpdate(){const L=svOldSlots();
  return box(`Updated to ${esc(GAME_VERSION)}`,`<p class="note">The game has updated. Your journeys will load as they are, but it is a good moment to keep a copy. Export a save now and you can bring it back with Import at any time.</p>
    <div class="rows">${L.map(o=>`<div class="row"><div class="grow"><b>Slot ${o.s+1}</b><small>Saved by ${esc(o.gv)}</small></div><button class="btn sm gold" data-act="svExport" data-arg="${o.s}">Export</button></div>`).join('')}</div>`,
    `<button class="btn" data-act="svUpdOk">Continue to the game</button>`);}
{const vm1=vModal;vModal=function(m){if(m&&m.type==='svupdate')return mSvUpdate();return vm1.apply(this,arguments);};}
ACT.svUpdOk=function(){META.cfg=META.cfg||{};META.cfg.updSeen=GAME_VERSION;try{saveMeta();}catch(e){}V.modal=null;render();};
// v0.6.0: no export popup after every update any more: saves are backed up on the account and Export stays in the Journey tab
{const r2=render;render=function(){try{if(false&&V.screen==='title'&&!V.modal&&!G&&(META.cfg||{}).updSeen!==GAME_VERSION&&svOldSlots().length){V.modal={type:'svupdate'};}}catch(e){}return r2.apply(this,arguments);};}
// v0.4.3: Settings has a way back to the main menu (the journey is saved first)
{const sb0=settingsBody;settingsBody=function(){const h=sb0.apply(this,arguments);if(!G||V.screen==='title')return h;
  return h+`<div class="rows"><div class="row"><div><b>Main menu</b><small>${G.daily?'Leave the Daily Trial and go back to the title screen.':'Your journey is saved first. Continue picks it up again.'}</small></div><button class="btn sm" data-act="quitTitle">Back to the main menu</button></div></div>`;};}
ACT.quitTitle=function(){if(V.screen==='battle'){toast('Finish or flee the battle first.');return;}try{if(G&&!G.daily)saveGame();}catch(e){}V.modal=null;WS.held=[];V.screen='title';G=null;B=null;render();};
