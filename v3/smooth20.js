// ===== smooth20.js (v0.22.9): leaving a lair (and a den, a town, any map you were just on) without the long pause =====
// Owner: "Still a slow transition load when leaving a lair". Measured with tools/chrome/lairtime.js (the fix18 method: painted ms from the
// fade start, 230 ms of fade included, to the second frame on the field; Medium 1000x560, realm 1, three starters):
//   lair -> field 670 to 1060 ms. The map change itself (leaveDungeon, one task) was 90 to 330 ms, then the HD-2D bake of the field in the
//   next frame another 280 to 390 ms: a frame gap of 370 to 670 ms on screen. In the profile 390 ms of that is buildMapCanvas: the 2D base
//   (frame 0, rebuildBase) and the HD-2D ground (frames 0 and 1 without objects, hdBake), all painted again tile by tile although the field
//   is the one the player left a minute ago and nothing on it changed.
// Section 1 keeps the painted canvases of the last two maps (the one you are on and the one you came from) and hands back a copy when the
// same map is painted again in the same state. The state is the key: the map id, a hash of
// everything on it but the paint's own outputs (tiles, theme, entrance lists, caves, props...), the frame, objects drawn or not, chests, levers,
// realm cleared, weather, the realm stage, the Breach, every setting and the graphics quality. Anything else changed paints again as before. The side outputs of a paint (m.lights,
// m.smoke, m.bsp, m.torches, m.mills) are stored with it and restored on a hit. S20.off runs the old path; test tools/chrome/v199a.js
// checks a hit is the same picture as a fresh paint in every state above.
const S20={off:false,max:2,L:[],n:{hit:0,miss:0,pass:0},err:[]};
function s20Err(w,e){try{if(S20.err.length<20)S20.err.push(w+': '+(e&&e.message||e));}catch(_){}}
const S20_DO=drawObjects;// the final drawObjects (hd2d.js stubs it while it bakes its ground)
function s20Cp(cv){const c=mkCv(cv.width,cv.height);c.getContext('2d').drawImage(cv,0,0);return c;}
// everything else the paint reads off the map itself (entrance lists, caves, props, theme fields, caches other modules fill in after the first
// paint): a hash of the map object without the paint's own outputs, the roamers and canvases (null when it cannot be read: no copy then)
// (__wa13: worldart13's entrance list, rebuilt from caves, ent, fortAt and cleared and given each entrance's height profile (prof) later: only its
// key and where each entrance stands count; a null or missing field is one state)
const S20_SKIP=new Set(['lights','smoke','bsp','torches','mills','tl','roam','__t13wg','__w14ro','__l13v']);
function s20Hash(s){let h=2166136261,g=5381;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h^=c;h=Math.imul(h,16777619);g=(Math.imul(g,33)+c)|0;}return (h>>>0).toString(36)+(g>>>0).toString(36)+s.length.toString(36);}
function s20MapPrint(m){const o=[];for(const k of Object.keys(m)){if(S20_SKIP.has(k))continue;let v=m[k];if(typeof v==='function'||v==null)continue;
    if(k==='__wa13')v={key:v.key,list:(v.list||[]).map(q=>[q.kind,q.ex,q.ey,q.sw,q.sh,q.hw])};
    o.push(k+'='+JSON.stringify(v,(kk,x)=>x instanceof HTMLCanvasElement?'cv'+x.width+'x'+x.height:x instanceof Set?[...x]:x instanceof Map?[...x]:(typeof x==='object'&&x&&(x.getContext||x.nodeType))?'obj':x));}
  return s20Hash(o.join('&'));}
// every module switch that changes how a map paints (tests turn modules off to compare)
function s20Offs(){let s='';try{s+=typeof B4!=='undefined'&&B4.off?1:0;}catch(e){}try{s+=typeof CH15!=='undefined'&&CH15.off?1:0;}catch(e){}try{s+=typeof E17!=='undefined'&&E17.off?1:0;}catch(e){}try{s+=typeof F17!=='undefined'&&F17.off?1:0;}catch(e){}try{s+=typeof F18!=='undefined'&&F18.off?1:0;}catch(e){}try{s+=typeof L13!=='undefined'&&L13.off?1:0;}catch(e){}try{s+=typeof L18!=='undefined'&&L18.off?1:0;}catch(e){}try{s+=typeof PARA!=='undefined'&&PARA.off?1:0;}catch(e){}try{s+=typeof T13!=='undefined'&&T13.off?1:0;}catch(e){}try{s+=typeof T14!=='undefined'&&T14.off?1:0;}catch(e){}try{s+=typeof W14!=='undefined'&&W14.off?1:0;}catch(e){}try{s+=typeof W16!=='undefined'&&W16.off?1:0;}catch(e){}try{s+=typeof WA12!=='undefined'&&WA12.off?1:0;}catch(e){}try{s+=typeof WA13!=='undefined'&&WA13.off?1:0;}catch(e){}s+=(window.__D8OFF?1:0)+''+(window.__PGOFF?1:0)+(window.__W71OFF?1:0);return s;}
function s20Key(m,frame){const obj=drawObjects===S20_DO?'o':String(drawObjects).replace(/\s/g,'')==='()=>{}'?'n':null;if(obj==null)return null;
  let lev='',ch='';try{lev=JSON.stringify(G.levers&&G.levers[m.id]||0);}catch(e){}
  try{const p=m.id+':';ch=Object.keys(G.chests||{}).filter(k=>k.startsWith(p)).sort().join(',');}catch(e){}
  let br='';try{if(typeof brIs==='function'&&brIs(m))br=JSON.stringify(G.breach||0);}catch(e){}
  // (sanctlook10.js sncTv: the shrine's tile variants read whether the live HD-2D scene is this map's)
  let live=0;try{live=typeof HD!=='undefined'&&HD.live&&HD.S&&HD.S.m===m?1:0;}catch(e){}
  return [frame|0,obj,live,G.cleared&&G.cleared[m.s]?1:0,G.weather&&G.weather[m.s]||'',typeof HD!=='undefined'?HD.td||1:1,
    G.stage,G.daily?1:0,G.dunRev||0,typeof GFX!=='undefined'?GFX.tier+JSON.stringify(GFX.q):'',JSON.stringify(META.cfg||{}),
    typeof SLX!=='undefined'&&SLX.noAO?1:0,s20Offs(),lev,ch,br,s20MapPrint(m)].join('|');}
function s20Slot(m){let e=S20.L.find(q=>q.id===m.id);if(e){S20.L.splice(S20.L.indexOf(e),1);S20.L.unshift(e);return e;}
  e={id:m.id,c:new Map()};S20.L.unshift(e);while(S20.L.length>S20.max)S20.L.pop();return e;}
const S20_OUT=['lights','smoke','bsp','torches','mills'];
HOOK.wrap('buildMapCanvas','smooth20','a map painted again in the same state is copied from the last paint',function(next,m,frame){
  // a chest's patch (world16.js) paints a clip of tiles into the old base: never cached
  if(S20.off||!m||!m.t||(typeof W16!=='undefined'&&W16.clip)){S20.n.pass++;return next(m,frame);}
  let k=null;try{k=s20Key(m,frame);}catch(e){s20Err('key',e);}
  if(k==null){S20.n.pass++;return next(m,frame);}
  const slot=s20Slot(m),hit=slot.c.get(k);
  if(hit){try{const cv=s20Cp(hit.cv);S20_OUT.forEach(f=>{if(hit.o[f]===undefined)delete m[f];else m[f]=Array.isArray(hit.o[f])?hit.o[f].slice():hit.o[f];});S20.n.hit++;return cv;}catch(e){s20Err('hit',e);}}
  const cv=next(m,frame);S20.n.miss++;
  // a paint that changed the map's own state (a module filling in a cache while it paints, such as the entrance list's shadow profiles on a
  // field's first paint) is not kept: the next paint, in the settled state, is
  let k2=null;try{k2=s20Key(m,frame);}catch(e){}if(k2!==k){S20.n.unsettled=(S20.n.unsettled|0)+1;return cv;}
  try{if(cv&&cv.width){const o={};S20_OUT.forEach(f=>{o[f]=Array.isArray(m[f])?m[f].slice():m[f];});
    // two frames x objects or not: at most four paints a map
    if(slot.c.size>=4)slot.c.delete(slot.c.keys().next().value);slot.c.set(k,{cv:s20Cp(cv),o});}}catch(e){s20Err('store',e);}
  return cv;});
// ----- 2. the field is painted ahead while the lair's boss is beaten -----
// Beating the realm's boss relights the field (cleared) and moves the stage on, so the field's earlier paint no longer matches and the walk out
// paints it again (the long pause the owner saw: about 700 ms of the 1 s). While the rewards screen is up (a still picture: nothing to drop) the
// field is painted ahead in the state it will be in (its lifted look applied now, as liftOverlay will), one paint a task, as rebuildBase and hdBake will ask for it: frame 0 with objects, and in
// HD-2D frames 0 and 1 without objects and without the gatehouse. The walk out then copies them.
function s20Ahead(m){
  // the pall lifts from the realm's maps when the rewards close (realms.js liftOverlay: applyBossTheme on each); the field gets its lifted look now
  try{if(G.cleared[m.s]&&typeof applyBossTheme==='function')applyBossTheme(m);}catch(e){s20Err('theme',e);}
  const hd=typeof GFX!=='undefined'&&GFX.tier&&GFX.tier!=='low'&&!GFX.off;
  const jobs=[()=>buildMapCanvas(m,0)];
  if(hd)[0,1].forEach(fr=>jobs.push(()=>{const d0=drawObjects,fa=m.fortAt;drawObjects=()=>{};m.fortAt=null;try{buildMapCanvas(m,fr);}finally{drawObjects=d0;m.fortAt=fa;}}));
  // the first paint refreshes the map's caches for the new state (entrance list, terrain material, building sprites) and so is not kept;
  // the 2D base is painted again when it was not
  jobs.push(()=>{let k=null;try{k=s20Key(m,0);}catch(e){}const sl=S20.L.find(q=>q.id===m.id);if(k&&!(sl&&sl.c.has(k)))buildMapCanvas(m,0);});
  const sv={};S20_OUT.forEach(f=>{sv[f]=Array.isArray(m[f])?m[f].slice():m[f];});
  const step=()=>{try{if(S20.off||!jobs.length||WS.m===m)return;jobs.shift()();S20.n.ahead=(S20.n.ahead|0)+1;}catch(e){s20Err('ahead',e);jobs.length=0;}
    if(jobs.length)setTimeout(step,60);else S20_OUT.forEach(f=>{if(WS.m!==m){if(sv[f]===undefined)delete m[f];else m[f]=sv[f];}});};
  setTimeout(step,400);}
HOOK.after('win','smooth20','paint the field ahead after the lair boss',function(){try{if(S20.off||!B||!B.spec||B.spec.kind!=='boss'||!WS.m||WS.m.kind!=='dungeon')return;
  const s=WS.m.s;if(!MAPS['f'+s])return;s20Ahead(getMap('f'+s));}catch(e){s20Err('win',e);}});
// tests
try{window.__S20={S20,key:(m,f)=>s20Key(m,f),paint:(m,fr,obj)=>{const d0=drawObjects;if(!obj)drawObjects=()=>{};try{return buildMapCanvas(m,fr);}finally{drawObjects=d0;}}};}catch(e){}
