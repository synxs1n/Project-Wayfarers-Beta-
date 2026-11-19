// ===== prime43.js (v0.22.43): prime and detonate from the first battle =====
// 0.22.42 opened reactions in the first realm, but most kits only learned their first Primer at level 6 to 14 and their first Detonator
// at 6 to 14 as well, so a fresh party could rarely do both. Here every hero knows their first Primer and their first Detonator from
// level 1 (a Dual art counts as either). Only skills that were learned by level P43.max move, so a late finisher stays late (Dist's
// Undercut at 42, Nikaris's Nightbloom Arrow at 18). Levels only ever go down, so no save loses a skill. The level a skill had before
// stays on it as s.lv43. Off switch for tests: the stored flag aurelis-p43off (pw.js CLASSIC). Test: tools/chrome/v224a.js.
const P43={max:14,off:(()=>{try{return localStorage.getItem('aurelis-p43off')==='1';}catch(e){return false;}})(),n:0};/* the stored flag is for tests that check the plain learn schedule */
function p43Role(s,role){return !!s&&!s.relic&&(s.role===role||!!s.combo)&&(typeof skHitsFoe!=='function'||skHitsFoe(s));}
function p43Pass(L){let ch=0;['primer','det'].forEach(role=>{const C=L.filter(s=>p43Role(s,role));if(!C.length)return;
    const f=C.reduce((a,b)=>((b.lv43!=null?b.lv43:b.lv)<(a.lv43!=null?a.lv43:a.lv)?b:a));
    if(f.lv43==null)f.lv43=f.lv;if(f.lv43<=P43.max&&f.lv>1){f.lv=1;ch++;P43.n++;}});return ch;}
HOOK.xform('classSkills','prime43','the first Primer and the first Detonator are known from level 1',function(L,t){try{if(P43.off||!L||!t||t.mon||!L.length)return L;
    p43Pass(L);let ok=true,last=-1;for(let i=0;i<L.length;i++){const s=L[i];if(!s||s.relic)continue;if(s.lv<last){ok=false;break;}last=s.lv;}
    if(ok)return L;const K=L.filter(s=>s&&!s.relic).map((s,i)=>[s,i]).sort((a,b)=>a[0].lv-b[0].lv||a[1]-b[1]).map(x=>x[0]);return K.concat(L.filter(s=>s&&s.relic));
  }catch(e){P43.err=String(e&&e.message||e);}return L;});
try{window.__P43=P43;}catch(e){}
