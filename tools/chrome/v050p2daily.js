// v0.5.0 phase 2: the Daily Trial is unaffected. Starts today's trial in the pre-phase build (OLDHTML) and in this build and compares
// weather, heroes, foes (names, levels, elements, HP) and the backdrop. v0.6.3: the weekly twist (twists.js) is switched off here so the base
// trial is compared like for like; v063wa.js checks the twist itself and that the trial stays deterministic with it on. Usage: OLDHTML=<old build> PWHTML=<new build> node v050p2daily.js
const fs=require('fs');const {open,chk,done}=require('./pw');
(async()=>{
  const snap=async html=>{const H=await open({w:932,h:430,html:fs.readFileSync(html,'utf8')});const {ev,wait}=H;
    const r=await ev(()=>{const A=__A;if(A.TW)A.TW.off=true;A.ACT.dailyGo();const B=A.B;if(!B)return null;
      return JSON.stringify({w:B.weather,seed:B.seed,front:B.front.concat(B.back).map(c=>[c.id,Math.round(c.S.mhp),Math.round(c.S.atk),Math.round(c.S.mag),Math.round(c.S.spd)]),
        foes:B.en.map(e=>[e.name,e.lv,e.el.join('/'),Math.round(e.S.mhp)]),next:B.front.concat(B.en).map(u=>+u.next.toFixed(3)),th:A.battleTheme(),surprise:!!B.surprise});});
    await wait(500);await H.browser.close();return r;};
  const a=await snap(process.env.OLDHTML),b=await snap(process.env.PWHTML||'../../out/aurelis3.html');
  const A=JSON.parse(a),B=JSON.parse(b);
  console.log('old',a);console.log('new',b);
  chk('Daily Trial: same seed, weather, heroes and foes (with their types) and turn order',A.seed===B.seed&&A.w===B.w&&JSON.stringify(A.front)===JSON.stringify(B.front)&&JSON.stringify(A.foes)===JSON.stringify(B.foes)&&JSON.stringify(A.next)===JSON.stringify(B.next)||'differs');
  chk('Daily Trial: same backdrop and no surprise start',A.th===B.th&&!B.surprise||A.th+' vs '+B.th);
  await done({browser:{close:async()=>{}}});
})();
