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
//    over, as long as the giver keeps all four itself and the skill is not one of the hero's own. Name and text follow. A Dual art with a
//    role counts for both of its elements. What is still missing after that is settled by an exchange (see s36Dual, 0.22.40).
//  3 Regen stays on the skills that are about it (S36.regenKeep); elsewhere it goes, or becomes another boon (S36.regenTo). Lumen's Lampglow
//    heals and gives Bulwark, so it is not Radiant Renew with a heal.
//  4 Purify cures and no longer heals (power 0; engine.js skips the heal).
//  5 heals are S36.heal (0.88) of what they were. config.js raises what a heal does to an Undead foe (HEAL_HURT .95, was .75), so that is
//    about a tenth more than before.
// Relic skills (s.relic) are not touched here; relics25.js has their own cut.
const S36={v:1,early:20,bands:[14,28],taken2:/^(Wind Fan|Light Refrain)$/,/* Drift's and Aria's own skills */elAlt:{fire:'Ember',water:'Tide',ice:'Frost',lightning:'Thunder',earth:'Stone',wind:'Gale',shadow:'Umbral',light:'Radiant'},heal:.88,off:false,taken:/^Halo of (Light|Wind)$/,/* Lumen's and Pomona's own skills (v191a) */log:{moved:[],swapped:[],gaps:[],uneven:[]},
  regenKeep:{'Sanctuary':1,'Prayer of Renewal':1,'Prayer of Dawn':1,'Meditate':1},/* the Priest's Regen prayers were Tidal Renew and Radiant Renew until the 0.22.54 text sweep */
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
  else d=d.replace(/, (\w+) and Regen\b/,' and $1').replace(/\s+and grants Regen(?=[.;,]|$)/,'').replace(/\s+and the line gains Regen(?=[.;,]|$)/,'').replace(/,? and Regen\b/,'').replace(/\bRegen and /,'').replace(/, Regen\b/,'').replace(/\bRegen, /,'').replace(/\s+and grants\s*\./,'.').replace(/ and grants$/,'');
  s.d=d;s._s36r=1;}
function s36Dual(t,L){const els=t.el||[];if(els.length<2)return;const role=s=>s.role==='primer'?'p':s.role==='det'?'d':'';
  // what counts for an element: its own Primers and Detonators, and a Dual art with a role (it primes with both elements, or detonates on either)
  const hit=s=>!s.relic&&role(s)&&(s.k==='phys'||s.k==='mag'),of=(s,e)=>s.combo?[].concat(s.el||[]).includes(e):s.el===e;
  const R=()=>L.filter(s=>hit(s)&&!s.combo&&typeof s.el==='string'&&els.includes(s.el));// the single element ones: only these change hands
  const has=(e,need)=>L.some(s=>hit(s)&&of(s,e)&&(need==='p'||need==='d'?role(s)===need:need==='w'?s.lv<=S36.early:s.lv>S36.early));
  const gaps=e=>['p','d','w','s'].filter(n=>!has(e,n)),all=()=>els.reduce((n,e)=>n+gaps(e).length,0);
  const can=(s)=>{if(s.own||s.sig||s.sigFl||/^sg_/.test(String(s.id)))return false;/* a hero's own skill keeps its element: renamed, "Halo of Water" would become another hero's "Halo of Light" (v191a) */const n=S36.elN[s.el];return !!n&&(String(s.n).indexOf(n)>=0||(String(s.d||'').indexOf(n)>=0&&!/Fire|Water|Ice|Frost|Lightning|Thunder|Storm|Volt|Earth|Stone|Wind|Gale|Shadow|Umbral|Light|Holy|Radiant|Ember|Inferno|Blizzard|Cyclone|Gust/.test(String(s.n))));};
  for(let pass=0;pass<4;pass++){let did=false;
    for(const e of els){const o=els.find(x=>x!==e),G=gaps(e);if(!G.length)continue;
      for(const need of G){// a giver of the other element that fits the need and can be spared
        const fits=s=>need==='p'||need==='d'?role(s)===need:need==='w'?s.lv<=S36.early:s.lv>S36.early;
        const C=R().filter(s=>s.el===o&&fits(s)&&can(s)).sort((a,b)=>need==='w'?a.lv-b.lv:b.lv-a.lv);let done=false;
        for(const s of C){const was=s.el,a=S36.elN[was],b=S36.elN[e],nn=String(s.n).split(a).join(b);if(L.some(x=>x!==s&&x.n===nn)||S36.taken.test(nn))continue;// the kit already has a skill of that name, or it is another hero's own skill
          s.el=e;if(gaps(o).length){s.el=was;continue;}// the giver must keep its own four
          s.n=nn;if(s.d)s.d=String(s.d).split(a).join(b);s._s36e=was;S36.log.moved.push(t.id+': '+s.n+' ('+was+' to '+e+')');done=did=true;break;}
        if(done)break;}}
    if(!did)break;}
  // 0.22.40: what is still missing is settled by an exchange. Two skills of the same role, one of each element, trade places in the kit: the
  // early skill goes to the late slot and the other way round (level, power and cost stay with the slot). No skill is
  // renamed, so this also works for a hero's own skills. Taken only when it leaves fewer gaps than before.
  // everything that makes a skill what it is trades places (id, name, element, text, effects, the naming fields of kits12.js); what belongs to
  // the slot stays: the levels, the power and the cost
  const SLOT={lv:1,lv0:1,lv12:1,lvP:1,lvQ:1,lvR:1,lvK:1,lvS:1,pw:1,mp:1,mp0:1,_mp22:1,cost:1,_s36:1},trade=(x,y)=>{const K=new Set(Object.keys(x).concat(Object.keys(y)));K.forEach(k=>{if(SLOT[k])return;const hx=k in x,hy=k in y,v=x[k];if(hy)x[k]=y[k];else delete x[k];if(hx)y[k]=v;else delete y[k];});};
  for(let pass=0;pass<3&&all()>0;pass++){let best=null;const P=R();
    for(const x of P)for(const y of P){if(x===y||x.el===y.el||role(x)!==role(y)||(x.lv<=S36.early)===(y.lv<=S36.early)||x.lv>y.lv)continue;const g0=all();trade(x,y);const g1=all();trade(x,y);
      if(g1<g0&&(!best||g1<best.g))best={x,y,g:g1};}
    if(!best)break;const {x,y}=best;trade(x,y);x._s36x=y._s36x=1;S36.log.swapped.push(t.id+': '+x.n+' (now level '+x.lv+') and '+y.n+' (now level '+y.lv+')');}
  // 0.22.45: an even spread as the hero levels. In each stretch of the kit (S36.bands: by level 14, by 28, after) and over the whole kit, the
  // single element skills of the two elements may differ by one at most (Vex learned Lightning Fan and Shadowstep late and no Wind skill).
  // The stretch's last skill of the fuller element that can change hands is renamed to the other element; where none can, it trades places
  // with a skill of the same role from another stretch. Neither is taken if it opens one of the four gaps above or tips another stretch.
  const band=s=>{const B=S36.bands;for(let i=0;i<B.length;i++)if(s.lv<=B[i])return i;return B.length;},cnt=(e,k)=>R().filter(s=>s.el===e&&(k<0||band(s)===k)).length;
  const diff=k=>cnt(els[0],k)-cnt(els[1],k),over=()=>{let n=0;for(let k=-1;k<=S36.bands.length;k++)n+=Math.max(0,Math.abs(diff(k))-1);return n;};
  for(let pass=0;pass<6&&over()>0;pass++){const o0=over(),g0=all();let did=false;
    for(let k=S36.bands.length;k>=-1&&!did;k--){const d=diff(k);if(Math.abs(d)<2)continue;const hi=d>0?els[0]:els[1],lo=d>0?els[1]:els[0];
      const C=R().filter(s=>s.el===hi&&(k<0||band(s)===k)).sort((x,y)=>y.lv-x.lv);
      for(const s of C){if(!can(s))continue;const a=S36.elN[hi],b=S36.elN[lo],fut=x=>{try{const tb=SK12.slotNames[t.cls],p=tb&&tb[x.id];if(p&&x.role&&!x._k12n){const n=k12El(x);if(n)return p.replace('{n}',n);}}catch(e){}return x.n;},/* kits12.js names a slot skill after this pass (a mage's Gloom becomes Shadow Lance) */free=n=>!L.some(x=>x!==s&&(String(x.n).toLowerCase()===n.toLowerCase()||String(fut(x)).toLowerCase()===n.toLowerCase()))&&!S36.taken.test(n)&&!S36.taken2.test(n);
        if(L.some(x=>x!==s&&x.el===lo&&String(x.n).split(b).join('')===String(s.n).split(a).join('')))continue;/* the kit has this skill's twin in the other element already (a mage's two Lances) */
        let nn=String(s.n).split(a).join(b);if(!free(nn))nn=String(s.n).split(a).join(S36.elAlt[lo]);if(!free(nn))continue;/* the plain name is in the kit or is another hero's own skill: the element's second word (Gale Fan) */
        s.el=lo;if(over()>=o0||all()>g0){s.el=hi;continue;}
        s.n=nn;if(s.d)s.d=String(s.d).split(a).join(b);s._s36e=hi;S36.log.moved.push(t.id+': '+s.n+' ('+hi+' to '+lo+', spread)');did=true;break;}
      if(did)break;
      for(const x of C){let best=null;for(const y of R()){if(y.el!==lo||role(y)!==role(x)||band(y)===band(x))continue;trade(x,y);const o1=over(),g1=all();trade(x,y);if(o1<o0&&g1<=g0&&(!best||o1<best.o))best={y,o:o1};}
        if(best){trade(x,best.y);x._s36x=best.y._s36x=1;S36.log.swapped.push(t.id+': '+x.n+' (now level '+x.lv+') and '+best.y.n+' (now level '+best.y.lv+'), spread');did=true;break;}}}
    if(!did)break;}
  if(over()>0)S36.log.uneven.push(t.id+' '+[-1,0,1,2].map(k=>cnt(els[0],k)+'/'+cnt(els[1],k)).join(' '));
  els.forEach(e=>{const G=gaps(e);if(G.length)S36.log.gaps.push(t.id+' '+e+':'+G.join(''));});}
function s36Kit(t,L){
  L.forEach(s=>{if(!s||s.relic)return;
    if(Array.isArray(s.el)&&s.el.length>1&&!s.combo&&(s.k==='phys'||s.k==='mag'||s.k==='heal')){s._k12c=1;/* keeps its own name and text: kits12.js would rename a new Dual art to the class's generic one, which the kit may already hold */s.combo=1;s._s36c=1;}
    s36Regen(s);
    if(s.k==='heal'&&s.cleanse&&s.t==='ally'&&!s.revive&&s.pw>0&&s.pw<=.7){s.pw=0;s.d='Cures every ailment on one ally.';}/* Purify, and the cures built like it (Joseth's Purge) */
    else if(s.k==='heal'&&s.pw>0&&!s._s36h){s._s36h=1;s.pw=+(s.pw*S36.heal).toFixed(2);}});
  s36Dual(t,L);}
HOOK.xform('classSkills','skills36','the 0.22.36 kit pass (once per hero)',function(L,t){try{if(S36.off||!L||!t||t.mon||!L.length)return L;const f=L.find(s=>s&&!s.relic);if(!f||f._s36===S36.v)return L;
  L.forEach(s=>{if(s&&!s.relic)s._s36=S36.v;});s36Kit(t,L);}catch(e){S36.err=String(e&&e.message||e);}return L;});
// a cure that heals nothing is not offered from the field menu for a hero who is only hurt
{const f0=fsEffect;fsEffect=function(s,t){try{if(s&&s.k==='heal'&&!(s.pw>0)&&!s.revive&&t&&t.hp>0)return !!(s.cleanse&&(Object.keys(t.st||{}).some(k=>STS[k]&&STS[k].bad)||(typeof hasAil==='function'&&hasAil(t))));}catch(e){}return f0.apply(this,arguments);};}
try{window.__S36=S36;}catch(e){}
