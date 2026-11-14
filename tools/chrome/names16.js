// The names audit (v0.21.x, world16.js section 5): every display name by kind and the word roots they share.
// Prints the roots over the limits: more than 2 names across realms, towns, dungeons (dens and sanctums too) and bosses ("place"), or more
// than 4 across the named things of the world (place + foes, wayfarers, guilds, quests: "world"). Skills and gear are listed for the roots it
// prints, not counted against the limit: their element words and tier families (Frostbitten X, Dawnsteel Y) repeat by design.
// A root counts once per name when one of the name's words is it, starts with it or ends with it (Hollowmere, Reedhollow, The Hollow King).
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node names16.js [DUMP=1] [ALL=1 lists every root with its names]
const {open}=require('./pw');
const PLACE=['realm','town','dungeon','boss'],WORLD=PLACE.concat(['foe','wayfarer','guild','quest']);
// endings and beginnings that are grammar, not roots
const STOP=new Set(['the','and','ing','ers','ter','ion','est','ant','ent','der','ver','ard','den','ton','ell','ine','ate','all','ous','ess','ble','ted','red','led','her','ner','ger','per','ker','ler','ier','ian','ful','wler','ling','ings','less','ness','ward','wards','ight','ther','aster','ster','tion','ering','ound','ance','ence','able','ment']);
let NOT={};
function rootIn(name,root){const no=NOT[root]||[];return String(name).toLowerCase().split(/[^a-z]+/).filter(Boolean).some(w=>!no.includes(w)&&(w===root||w===root+'s'||w===root+'en'||(w.length>=root.length+3&&(w.startsWith(root)||w.endsWith(root)))));}
function audit(N,no){if(no)NOT=no;const all=[];for(const k in N)N[k].forEach(n=>all.push([k,n]));
  const words=new Set();all.forEach(([k,n])=>{if(WORLD.includes(k))n.toLowerCase().split(/[^a-z]+/).filter(w=>w.length>=3).forEach(w=>words.add(w));});
  const cands=new Set();words.forEach(w=>{cands.add(w);for(let l=4;l<=w.length-3;l++){cands.add(w.slice(0,l));cands.add(w.slice(-l));}});
  const rows=[];cands.forEach(r=>{if(STOP.has(r))return;const hit={};let p=0,w=0;all.forEach(([k,n])=>{if(!rootIn(n,r))return;(hit[k]=hit[k]||[]).push(n);if(PLACE.includes(k))p++;if(WORLD.includes(k))w++;});rows.push({r,p,w,hit});});
  // keep the longest root of a family with the same hits (ember over embe), and drop fragments that are not words on their own
  const key=o=>WORLD.map(k=>(o.hit[k]||[]).join('|')).join('#');const best=new Map();
  rows.forEach(o=>{const k=key(o),b=best.get(k);if(!b||o.r.length>b.r.length)best.set(k,o);});
  return [...best.values()].sort((a,b)=>b.p-a.p||b.w-a.w||a.r.localeCompare(b.r));}
module.exports={audit,rootIn,PLACE,WORLD};
if(require.main===module)(async()=>{const H=await open({w:900,h:560,pre:'localStorage.clear();'});
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await H.wait(300);
  const N=await H.ev(()=>__W16.api.names());NOT=await H.ev(()=>__W16.api.NOT);await H.browser.close();
  if(process.env.DUMP)for(const k in N)console.log(k,N[k].length,JSON.stringify(N[k]));
  console.log('names: '+Object.keys(N).map(k=>k+' '+N[k].length).join(', '));
  const R=audit(N),over=R.filter(o=>o.p>2||o.w>4),show=process.env.ALL?R.filter(o=>o.w>1):over;
  console.log((process.env.ALL?'roots in two or more names':'roots over the limit (place > 2 or world > 4)')+': '+show.length);
  show.forEach(o=>console.log(`${o.r.padEnd(12)} place ${o.p}  world ${o.w}  `+Object.keys(o.hit).map(k=>k+': '+o.hit[k].join(', ')).join(' | ')));
  process.exit(0);})();
