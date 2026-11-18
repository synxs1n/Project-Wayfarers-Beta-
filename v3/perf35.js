// ===== perf35.js (v0.22.35): screens that took long to open =====
// Asked: "some screens are taking extra long too load". Measured on a 390x844 page (docs/handoff-v0111.md, 0.22.35): the Bestiary 750 ms,
// the Smithy's Shop 390, the Codex 320, Party 260 on a desktop CPU, several times that on a phone. Where it went:
//  1 pictures. A screen's sprites and icons are painted to canvases and turned into data URLs the first time they are shown (cvURL): the
//    Bestiary paints 241 monsters before it can show one. Now the first P35.eager of a screen are painted at once and the rest get a
//    one pixel placeholder and are painted over the next frames (P35.ms per frame), in page order. Nothing changes once a picture is cached.
//  2 the max temper lines that shops stopped showing in 0.22.32 were still worked out for every piece and hero (bestTag, upgMax).
//  3 the phone menu and shop passes no longer measure the page inside the render (menus29.js, shops31.js).
const P35={eager:16,ms:9,q:[],on:0,left:0,off:false,ph:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'};
function p35NoMax(){try{return !!(V&&V.modal&&(V.modal.type==='smithy'||V.modal.type==='workshop'));}catch(e){return false;}}
{const u0=upgMax;upgMax=function(){return p35NoMax()?'':u0.apply(this,arguments);};}
// ----- 1 pictures painted after the screen is up -----
{const cu0=cvURL;cvURL=function(key,fn){if(!P35.on||P35.off)return cu0.apply(this,arguments);
  if(URL_CACHE[key]||URL_CACHE[key+'#ch15'])return cu0.apply(this,arguments);
  if(P35.left>0){P35.left--;return cu0.apply(this,arguments);}
  const i=P35.q.push({key,fn})-1;return P35.ph+'#lz'+i;};
 P35.real=function(i){const o=P35.q[i];if(!o)return null;try{return cu0.call(null,o.key,o.fn);}catch(e){return null;}};}
HOOK.wrap('vModal','perf35','pictures not yet painted are left for the next frames',function(next,...a){if(P35.off||P35.on)return next(...a);P35.on=1;P35.left=P35.eager;P35.q=[];P35.gen=(P35.gen||0)+1;
  try{return next(...a);}finally{P35.on=0;}});
function p35Fill(gen){try{if(gen!==P35.gen)return;const md=document.getElementById('modal');if(!md)return;const t0=performance.now();
  const L=md.querySelectorAll('img[src*="#lz"]');let more=false;
  for(const im of L){if(performance.now()-t0>P35.ms){more=true;break;}const m=/#lz(\d+)$/.exec(im.getAttribute('src')||'');if(!m)continue;const u=P35.real(+m[1]);if(u)im.src=u;else im.removeAttribute('src');}
  if(!more){const S=md.querySelectorAll('[style*="#lz"]');for(const el of S){if(performance.now()-t0>P35.ms*2){more=true;break;}
      el.setAttribute('style',el.getAttribute('style').replace(/data:image\/gif;base64,[A-Za-z0-9+/=]+#lz(\d+)/g,(x,i)=>P35.real(+i)||x.replace(/#lz\d+/,'')));}}
  if(more)requestAnimationFrame(()=>p35Fill(gen));}catch(e){P35.err=String(e&&e.message||e);}}
HOOK.after('render','perf35','paint the pictures that were left',function(){try{if(P35.q.length){const g=P35.gen;requestAnimationFrame(()=>p35Fill(g));}}catch(e){}});
// (content-visibility:auto on shop rows was tried and taken out: rows off screen dropped out of innerText, which the tests and screen readers read)
try{window.__P35={P35,fill:()=>p35Fill(P35.gen)};}catch(e){}
