// ===== titles12.js (v0.18.8): the area title banner =====
// One banner per arrival, themed per place. Owner's phone reports: the title was squished into a tall narrow column, fired again after every
// battle, carried the weather and a second line on the Breach, and had the kind word inside the name ("Sanctum: Duskspire Sanctum").
//   1. layout: titles12.css (full view width with a max, small letters on phones, two lines at most, centred, below the minimap on phones)
//   2. arrival only: showLocation also runs after a battle, a weather change, "back at the entrance"... A call for the map the banner last
//      showed (same game) keeps everything else it does (music, header, hints) but does not light the banner again. Arriving at a map from
//      another map, loading a game or starting one shows it.
//   3. the banner is built here: a small kind word above the name (Den, Lair, Sanctum; Relit on a field whose beacon is lit), the name without a
//      trailing Sanctum / Den / Lair, a rule in the kind's shape and a colour from the realm's THEME palette. No weather. WS.locN keeps a
//      plain text form for the tests and the feedback log ("Sanctum: Duskspire"); WS.locX holds the parts; t12Paint (called by the world loop
//      in ui.js) turns them into the markup. The tag word is drawn from data-t (CSS), the plain "Den: " / " (relit)" are hidden text nodes, so textContent equals WS.locN.
//   4. the kind-tagged names in the Records lists, the map markers and the Waystone lists lose the trailing Sanctum (FORT_NAMES).
// The Breach's description text is in records12.js (R12_BREACH_TEXT).
function t12Bare(n){const s=String(n==null?'':n),b=s.replace(/\s+(Sanctum|Den|Lair)$/i,'').trim();return b||s;}
// the Sanctum names carry the kind word the tag already shows; every list and marker that prints one also prints the kind
FORT_NAMES.forEach((n,i)=>{FORT_NAMES[i]=t12Bare(n);});
function t12Rgb(h){h=String(h||'#888888').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16)||0;return [n>>16&255,n>>8&255,n&255];}
function t12Mix(a,b,t){const A=t12Rgb(a),B=t12Rgb(b);return '#'+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*t).toString(16).padStart(2,'0')).join('');}
// what a banner is for this map: kind (look), tag (small word), name
function t12Info(m){
  const k=typeof siteKind==='function'?siteKind(m):'';let look='field',tag='',name=locName(m);
  if(m.breach){look='breach';}
  else if(m.sanctum||m.hub==='The Echo Rift'){look='rift';}
  else if(k){look=k.toLowerCase();tag=k;name=t12Bare(name);}
  else if(m.kind==='town'||m.archive){look='town';}
  else if(m.kind==='field'&&G&&G.cleared&&G.cleared[m.s]){tag='Relit';}
  return {look,tag,name,theme:m.theme||'meadow'};}
// colours: the realm's palette (decorations, then grass shade for the plate) pulled toward the kind's own tint
const T12_TINT={field:null,town:'#ffe0a0',den:'#d9a35a',lair:'#ff7a5a',sanctum:'#f6e6a0',breach:'#c48cff',rift:'#62e8e0'};
function t12Colors(info){
  const T=(typeof THEME!=='undefined'&&THEME[info.theme])||THEME.meadow,dec=T.dec||['#f2c93a','#f6e06a'],base=dec[1]||dec[0]||'#f2c93a',tint=T12_TINT[info.look];
  let a=tint?t12Mix(base,tint,info.look==='breach'||info.look==='rift'?.85:.45):base;a=t12Mix(a,'#ffffff',.12);
  const bg=t12Mix((T.g&&T.g[3])||'#2a2a2a','#05060c',.82);
  return {a,n:t12Mix(a,'#fff4d6',.62),g:t12Mix(a,'#000000',.15)+'aa',bg:bg+'ee'};}
function t12Html(x){
  if(!x)return '';const c=t12Colors(x);
  return `<div class="t12b t12-${x.look}" style="--t12a:${c.a};--t12n:${c.n};--t12g:${c.g};--t12bg:${c.bg}">`
    +`<span class="t12t" data-t="${esc(x.tag)}"></span><span class="t12co">${esc(x.pre)}</span><span class="t12n">${esc(x.name)}</span><span class="t12co">${esc(x.suf)}</span><span class="t12r"><i></i><i></i></span></div>`;}
// called by the world loop when the banner text differs from the element's text
function t12Paint(l,txt){if(!txt||!WS.locX){l.textContent=txt;return;}l.innerHTML=t12Html(WS.locX);if(l.textContent!==txt)l.textContent=txt;}
HOOK.wrap('showLocation','titles12','themed banner built here; lit only on arrival at a map, not after a battle, a weather change or a re-entry of the same map',function(next){
  const prevT=WS.locT,prevId=WS.t12id,prevG=WS.t12g,r=next.apply(this,arguments);
  try{const m=WS.m;if(!m)return r;
    const x=WS.locX=t12Info(m);x.pre=x.tag&&x.tag!=='Relit'?x.tag+': ':'';x.suf=x.tag==='Relit'?' (relit)':'';WS.locN=x.pre+x.name+x.suf;
    const same=prevId===m.id&&prevG===G&&prevT!=null;WS.t12id=m.id;WS.t12g=G;
    if(same)WS.locT=prevT;}catch(e){}
  return r;});
