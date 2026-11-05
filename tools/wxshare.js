const fs=require('fs');const grab=(f,n)=>{const s=fs.readFileSync(__dirname+'/'+f,'utf8'),i=s.indexOf('const '+n+'='),j=s.indexOf('};',i)+2;return s.slice(i+6,j);};
eval('global.'+grab('v3_pre_031/engine2.js','REALM_WEATHER'));eval('global.'+grab('v3/world3.js','WX_TABLE'));
function roll(L,avoid,newRule){const tot=L.reduce((a,b)=>a+b[1],0);let w='clear';for(let k=0;k<4;k++){let r=Math.random()*tot;for(const [n,c] of L){if((r-=c)<0){w=n;break;}}if(w!==avoid||(newRule&&w==='clear'))break;}return w;}
const N=200000;
for(const th of Object.keys(WX_TABLE)){
 // old: every reroll avoided the current weather (exits, dungeon exits, the 4 minute timer), equal time per roll
 let c={},w=roll(REALM_WEATHER[th]);for(let i=0;i<N;i++){w=roll(REALM_WEATHER[th],w);c[w]=(c[w]||0)+1;}
 // new: a roll lasts 300-520 steps, the next roll avoids repeating harsh weather but clear can repeat; weight by duration
 let d={},v='clear',tt=0;for(let i=0;i<N;i++){v=roll(WX_TABLE[th],v,1);const len=300+Math.random()*220;d[v]=(d[v]||0)+len;tt+=len;}
 const keys=[...new Set(Object.keys(c).concat(Object.keys(d)))].sort((a,b)=>(d[b]||0)-(d[a]||0));
 console.log(th.padEnd(8),keys.map(k=>`${k} ${((c[k]||0)/N*100).toFixed(0)}→${((d[k]||0)/tt*100).toFixed(0)}`).join(', '));}
