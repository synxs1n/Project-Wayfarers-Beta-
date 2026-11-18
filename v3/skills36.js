// ===== skills36.js (v0.22.36): a pass over every hero's kit =====
// Asked: "skills given by Legendary relics are bit too strong, all 2 element skills should be dual arts, let's do a bit of skill rebalancing
// and reworking as well, many dual types don't have a good spread of abilities of their different types as they level (we want it mixed
// between primes/detonates of each type and weak/strong skills of each type), some skills on a character are repetitive on the same
// character for example lumens lamp glow and radiant renew and everything has regen (purify shouldn't heal), healing feels a bit too strong
// (it should be a bit stronger when used on undead)".
// The kits come from several generators (skills.js, kits12.js, roster17.js ...). This runs once on each hero's finished kit (classSkills) and
// edits the skill objects in place (they are the hero's own, no two heroes share one):
//  1 every skill with two elements is a Dual art (s.combo): it primes with both and detonates on either (skills12.js)
//  2 dual types: each of the hero's two elements should have a Primer, a Detonator, an early skill (learned by S36.early) and a late one.
//    Where one element lacks one, a skill of the other element that can change hands (its name or text carries the element's word) moves
//    over, as long as the giver keeps all four itself. Name and text follow ("Earth Rain" becomes "Water Rain").
//  3 Regen stays on the skills that are about it (S36.regenKeep); elsewhere it goes, or becomes another boon (S36.regenTo). Lumen's Lampglow
//    heals and gives Bulwark, so it is not Radiant Renew with a heal.
//  4 Purify cures and no longer heals (power 0; engine.js skips the heal).
//  5 heals are S36.heal (0.88) of what they were. config.js raises what a heal does to an Undead foe (HEAL_HURT .95, was .75), so that is
//    about a tenth more than before.
// Relic skills (s.relic) are not touched here; relics25.js has their own cut.
const S36={v:1,early:20,heal:.88,off:false,log:{moved:[],gaps:[]},
  regenKeep:{'Sanctuary':1,'Tidal Renew':1,'Radiant Renew':1,'Meditate':1},
  regenTo:{'Blessing':'focus','Beacon Ward':'bulwark','Aurora':'focus','Spectrum Aria':'might','Cathedral Descant':'bulwark','Kennel Blessing':'focus','Iron Stance':'bulwark','Shield Ally':'ward','Lampglow':'bulwark'},
  elN:{fire:'Fire',water:'Water',ice:'Ice',lightning:'Lightning',earth:'Earth',wind:'Wind',shadow:'Shadow',light:'Light'}};
function s36Regen(s){const drop=L=>{if(!L)return false;const i=L.findIndex(q=>q[0]==='regen');if(i<0)return false;L.splice(i,1);return true;};
  if(s.relic||S36.regenKeep[s.n])return;const had=[s.fx,s.allyFx,s.self].map(drop),any=had.some(Boolean);if(!any)return;
  let to=S36.regenTo[s.n];const L=had[0]?(s.fx=s.fx||[]):had[1]?(s.allyFx=s.allyFx||[]):(s.self=s.self||[]);
  if(s.n==='Lampglow'){const w=L.findIndex(q=>q[0]==='ward');if(w>=0)L.splice(w,1);}
  if(to&&L.some(q=>q[0]===to))to=null;if(to)L.push([to,1]);
  const tn=to&&STS[to]?STS[to].n:null;let d=String(s.d||'');
  if(s.n==='Lampglow')d=d.replace('grants Regen and Ward','grants Bulwark');
  else if(tn)d=d.replace(/\bRegen\b/,tn);
  else d=d.replace(/,? and Regen\b/,'').replace(/\bRegen and /,'').replace(/, Regen\b/,'').replace(/\bRegen, /,'').replace(/\s+and grants\s*\./,'.').replace(/ and grants$/,'');
  s.d=d;s._s36r=1;}
function s36Dual(t,L){const els=t.el||[];if(els.length<2)return;const role=s=>s.role==='primer'?'p':s.role==='det'?'d':'';
  const R=()=>L.filter(s=>!s.relic&&!s.combo&&typeof s.el==='string'&&els.includes(s.el)&&role(s)&&(s.k==='phys'||s.k==='mag'));
  const has=(e,need)=>R().some(s=>s.el===e&&(need==='p'||need==='d'?role(s)===need:need==='w'?s.lv<=S36.early:s.lv>S36.early));
  const gaps=e=>['p','d','w','s'].filter(n=>!has(e,n));
  const can=(s)=>{const n=S36.elN[s.el];return !!n&&(String(s.n).indexOf(n)>=0||(String(s.d||'').indexOf(n)>=0&&!/Fire|Water|Ice|Frost|Lightning|Thunder|Storm|Volt|Earth|Stone|Wind|Gale|Shadow|Umbral|Light|Holy|Radiant|Ember|Inferno|Blizzard|Cyclone|Gust/.test(String(s.n))));};
  for(let pass=0;pass<4;pass++){let did=false;
    for(const e of els){const o=els.find(x=>x!==e),G=gaps(e);if(!G.length)continue;
      for(const need of G){// a giver of the other element that fits the need and can be spared
        const fits=s=>need==='p'||need==='d'?role(s)===need:need==='w'?s.lv<=S36.early:s.lv>S36.early;
        const C=R().filter(s=>s.el===o&&fits(s)&&can(s)).sort((a,b)=>need==='w'?a.lv-b.lv:b.lv-a.lv);let done=false;
        for(const s of C){const was=s.el,a=S36.elN[was],b=S36.elN[e],nn=String(s.n).split(a).join(b);if(L.some(x=>x!==s&&x.n===nn))continue;// the kit already has a skill of that name
          s.el=e;if(gaps(o).length){s.el=was;continue;}// the giver must keep its own four
          s.n=String(s.n).split(a).join(b);if(s.d)s.d=String(s.d).split(a).join(b);s._s36e=was;S36.log.moved.push(t.id+': '+s.n+' ('+was+' to '+e+')');done=did=true;break;}
        if(done)break;}}
    if(!did)break;}
  els.forEach(e=>{const G=gaps(e);if(G.length)S36.log.gaps.push(t.id+' '+e+':'+G.join(''));});}
function s36Kit(t,L){
  L.forEach(s=>{if(!s||s.relic)return;
    if(Array.isArray(s.el)&&s.el.length>1&&!s.combo&&(s.k==='phys'||s.k==='mag'||s.k==='heal')){s._k12c=1;/* keeps its own name and text: kits12.js would rename a new Dual art to the class's generic one, which the kit may already hold */s.combo=1;s._s36c=1;}
    s36Regen(s);
    if(s.k==='heal'&&s.n==='Purify'){s.pw=0;s.d='Cures every ailment on one ally.';}
    else if(s.k==='heal'&&s.pw>0&&!s._s36h){s._s36h=1;s.pw=+(s.pw*S36.heal).toFixed(2);}});
  s36Dual(t,L);}
HOOK.xform('classSkills','skills36','the 0.22.36 kit pass (once per hero)',function(L,t){try{if(S36.off||!L||!t||t.mon||!L.length)return L;const f=L.find(s=>s&&!s.relic);if(!f||f._s36===S36.v)return L;
  L.forEach(s=>{if(s&&!s.relic)s._s36=S36.v;});s36Kit(t,L);}catch(e){S36.err=String(e&&e.message||e);}return L;});
try{window.__S36=S36;}catch(e){}
