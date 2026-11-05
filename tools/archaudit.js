// v0.4.0 2.4: archetype table, delivery coverage per class, and a damage check per archetype.
const {A,run,party}=require('./v3sim.js');
const src=require('fs').readFileSync(__dirname+'/v3sim.js','utf8');
const M=A.MON;
console.log('--- foes by archetype ---');
const by={};Object.keys(M).forEach(k=>{(A.tyOf(k)||[]).forEach(t=>{(by[t]=by[t]||[]).push(k);});});
Object.keys(A.ARCH).forEach(t=>console.log(t.padEnd(8),(by[t]||[]).join(', ')));
console.log('untagged:',Object.keys(M).filter(k=>!(A.tyOf(k)||[]).length&&k!=='mimic').join(', '));
console.log('bosses:',Object.keys(A.BOSS_TY).map(k=>k+':'+A.BOSS_TY[k].join('+')).join(' '));
console.log('\n--- class coverage (deliveries a class can use at level 50) ---');
const need={flying:['ranged','magic'],armored:['piercing','magic'],jelly:['magic','element'],swarm:['area']};
let gaps=0;const seen={};
Object.keys(A.TPL).forEach(id=>{const T=A.TPL[id];if(T.mon||seen[T.cls])return;seen[T.cls]=1;
  const sk=A.classSkills(T).filter(s=>s.k==='phys'||s.k==='mag');const dl=new Set(sk.map(s=>A.dlFor(T.cls,s)));
  (A.CLS_WPN[T.cls]||[]).forEach(w=>dl.add(A.WT_DL[w]));
  const area=sk.some(s=>s.t==='all'||s.t==='rand'),pierceFlag=sk.some(s=>s.pierce);
  const has=k=>k==='area'?area:k==='piercing'?(dl.has('piercing')||pierceFlag):k==='element'?true:dl.has(k);
  const row=Object.keys(need).map(a=>{const ok=need[a].some(has);if(!ok)gaps++;return a+':'+(ok?'ok':'GAP');});
  console.log(T.cls.padEnd(10),[...dl].join(','),'| area',area,'|',row.join(' '));});
console.log('gaps:',gaps);
// ---- multiplier spot checks
const mk=(id,lv)=>{const c=A.newChar(id,lv||30,0);c.S=A.calcStats(c);c.side='p';return c;};
const foe=(k)=>A.makeEnemy(A.MON[k],30);
const SK={slash:{id:'x',k:'phys',pw:1,dl:'slash',t:'one'},blunt:{id:'x',k:'phys',pw:1,dl:'blunt',t:'one'},piercing:{id:'x',k:'phys',pw:1,dl:'piercing',t:'one'},ranged:{id:'x',k:'phys',pw:1,dl:'ranged',t:'one'},magic:{id:'x',k:'mag',pw:1,t:'one'},areaS:{id:'x',k:'phys',pw:1,dl:'slash',t:'all'}};
const a=mk('brann');const tab=[['gull','flying'],['slaggolem','armored'],['magmaslime','jelly'],['barrowbones','undead'],['gnatswarm','swarm'],['frostwolf','beast'],['mossling','plant']];
console.log('\n--- multipliers (attacker with no element on the skill) ---');
tab.forEach(([k,t])=>{const e=foe(k);console.log((k+' ('+t+')').padEnd(26),Object.keys(SK).map(d=>d+' x'+A.archMult(a,SK[d],e).toFixed(2)).join('  '));});
const boss=A.makeEnemy(A.GUARDIANS.bonecolossus,30,{boss:true,stage:2});console.log('bonecolossus (boss, clamped)'.padEnd(26),Object.keys(SK).map(d=>d+' x'+A.archMult(a,SK[d],boss).toFixed(2)).join('  '));
