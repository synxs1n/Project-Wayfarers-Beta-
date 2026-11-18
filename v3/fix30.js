// ===== fix30.js (v0.22.30): Echoes in the realm list, a journey whose boss no longer exists, a larger minimap on computers =====
// Asked: "Echos should be included in the realm completion list. My current playthrough, one of the echos is missing I think because the
// boss of that realm doesn't exist anymore, we need to replace the echo with another in this kind of situation. Mini map should be bigger
// on windows app".
//  1 A journey stores its bosses by key (G.run.bosses, G.run.final). A key that is no longer in GUARDIANS / FINALS (a boss taken out of the
//    game after the journey began) left that realm without an Echo: every lookup of its definition came back empty. f30BossFix swaps such
//    a key for one the journey does not use yet (picked from the seed, so it is the same every time) and keeps the old key in
//    G.run.bossWas. It runs before every bossKeyFor, so the dungeon rune, the Echo Sanctum and the records all see the replacement.
//  2 REALM_DONE lists the realm's story Echo ("Echo of <boss>", done once it is beaten); the Journey tab shows "Echo 0/1".
//  3 The minimap is 196x147 px on a screen at least 900 px wide (was 112x84); the picture is the same, drawn larger.
function f30BossFix(){try{if(!G||!G.run||G.daily)return;const R=G.run,used=()=>new Set((R.bosses||[]).concat([R.final]));
  (R.bosses||[]).forEach((k,s)=>{if(GUARDIANS[k])return;const pool=GPOOL.filter(x=>!used().has(x));if(!pool.length)return;
    (R.bossWas=R.bossWas||{})[s]=k;R.bosses[s]=pool[(hashS(String(R.seed||1)+'bossfix'+s)>>>0)%pool.length];});
  if(R.final&&!FINALS[R.final]&&R.final!=='riftkeeper'){const pool=FPOOL.filter(x=>!used().has(x));if(pool.length){(R.bossWas=R.bossWas||{}).f=R.final;R.final=pool[(hashS(String(R.seed||1)+'bossfixf')>>>0)%pool.length];}}
}catch(e){}}
{const b0=bossKeyFor;bossKeyFor=function(s){f30BossFix();return b0.apply(this,arguments);};}
HOOK.xform('REALM_DONE','fix30','the realm\'s story Echo is part of its list',function(L,s){try{if(!L||!G||G.daily||typeof guardianDef!=='function')return L;const d=guardianDef(bossKeyFor(s));
  if(d&&!L.some(o=>o.k==='echo'))L.push({k:'echo',n:'Echo of '+d.n,done:!!(G.echoStory||{})[s]});}catch(e){}return L;});
//  4 0.22.28 made a Legendary who joins a full six ask where to stand. Nikaris joins inside his fight and then plays a scene on the field
//    (G.l18meet, legends18.js): the question waited for the same moment and got there first, so the scene never played. It waits for the scene.
{const a0=r3Ask;r3Ask=function(){try{if(G&&G.l18meet)return false;}catch(e){}return a0.apply(this,arguments);};}
{const st=document.createElement('style');st.id='f30css';st.textContent='@media (min-width:900px){#mmap.mmap{width:196px!important;height:147px!important}}';document.head.appendChild(st);}
try{window.__F30={fix:f30BossFix};}catch(e){}
