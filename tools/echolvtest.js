// 3.3 echo level tests: below, at and above threshold, story and Sanctum
const {A}=require('./v3sim.js');let f=0;const ck=(n,c)=>{console.log(c?'PASS':'FAIL',n);if(!c)f++;};
A.newGame&&0;
function setHi(hi){A.G.party=['a'];A.G.roster={a:{lv:hi}};}
A.G=A.G||{run:{cycle:0},party:[],roster:{},daily:0};A.G.run=A.G.run||{cycle:0};
const W=2;
for(let s=0;s<5;s++){const base=A.STAGE_BOSS_LV[s]+2;
  [[base-W-3,base],[base-W-1,base],[base-W,base],[base-1,base+1],[base,base+W],[base+5,base+5+W]].forEach(([hi,want])=>{setHi(hi);ck(`story echo stage ${s}: party highest ${hi} -> ${want}`,A.storyEchoLv(s)===want);});}
const fk=Object.keys(A.FINALS)[0],gk=Object.keys(A.GUARDIANS)[0];
[[40,50],[47,50],[48,50],[49,51],[55,57]].forEach(([hi,w])=>{setHi(hi);ck(`sanctum echo (base 50) party ${hi} -> ${w}`,A.echoLv(gk)===w);});
[[50,56],[54,56],[55,57],[60,62]].forEach(([hi,w])=>{setHi(hi);ck(`sanctum final echo (base 56) party ${hi} -> ${w}`,A.echoLv(fk)===w);});
console.log('fails='+f);process.exit(f?1:0);
