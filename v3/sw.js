// Aurelis offline cache (Beta v0.3.3). Network first, so a fresh build always wins when you are online;
// when the network is gone the last copy of the page is served from the cache instead.
const CACHE='aurelis-offline-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
  // v0.4.5: the orchestra's instrument files are big and rarely change, so they come from the cache first and refresh quietly behind it
  if(/\/audio\/[^/]+\.(ogg|mp3|json)$/.test(new URL(r.url).pathname)){e.respondWith(caches.open(CACHE).then(ca=>ca.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&res.ok)ca.put(r,res.clone()).catch(()=>{});return res;});if(hit){net.catch(()=>{});return hit;}return net;})).catch(()=>fetch(r)));return;}
  e.respondWith(fetch(r).then(res=>{if(res&&res.ok&&(r.mode==='navigate'||/\.(html|css|js|woff2?|png)$/.test(new URL(r.url).pathname))){const c=res.clone();caches.open(CACHE).then(ca=>ca.put(r,c)).catch(()=>{});}return res;})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match(self.registration.scope,{ignoreSearch:true}):undefined)||Response.error())));});
