// 2.3: delivery vs archetype table, with the rule check (every delivery best vs >=2 archetypes, weak vs >=1; Beasts per spec)
const {A}=require('./v3sim.js');const ARCH=A.ARCH;
const DL=['slash','blunt','piercing','ranged','magic'];let fails=0;
const m=(k,d)=>(ARCH[k].dl&&ARCH[k].dl[d])||1;
console.log('delivery   '+Object.keys(ARCH).map(k=>k.padEnd(8)).join(''));
DL.forEach(d=>console.log(d.padEnd(11)+Object.keys(ARCH).map(k=>String(m(k,d)).padEnd(8)).join('')));
DL.forEach(d=>{const best=Object.keys(ARCH).filter(k=>m(k,d)>=1.1),weak=Object.keys(ARCH).filter(k=>m(k,d)<=.9);
  const ok=best.length>=2&&weak.length>=1;if(!ok)fails++;console.log((ok?'PASS':'FAIL'),d,'best vs',best.join(','),'| weak vs',weak.join(','));});
const bk=(d,pred,msg)=>{const ok=pred(m('beast',d));if(!ok)fails++;console.log(ok?'PASS':'FAIL','beast',msg);};
bk('blunt',x=>x>1,'takes extra from blunt');bk('piercing',x=>x<1,'resists piercing');bk('ranged',x=>x<1,'resists ranged');
console.log('fails='+fails);process.exit(fails?1:0);
