// Beta v0.8.1: "Build party" (was Best party); the Training team takes the lowest levels (a higher hero only fills a missing tank or
// healer, and then the lowest such hero); areas with flying foes bring a real ranged attacker, an Archer first.
const {open,chk,done}=require('./pw');
(async()=>{const h=await open();const {ev,wait}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();__A.V.modal=null;__A.render();});await wait(300);
const setRoster=`(spec)=>{const A=__A,G=A.G;G.roster={};Object.keys(spec).forEach(id=>{const c=A.newChar(id,spec[id],0);G.roster[id]=c;c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
  G.party=Object.keys(spec).slice(0,6);A.V.modal=null;}`;
const r=await ev(([fn])=>{const A=__A,G=A.G,set=eval(fn),o={};
  // find a stage whose area pool flies a lot, mark those foes seen
  let st=-1,best=0;for(let s=0;s<5;s++){const pool=A.ZS(s).pool||[];const f=pool.filter(k=>A.MON[k]&&A.tyOf(A.MON[k].art).includes('flying')).length/Math.max(1,pool.length);if(f>best){best=f;st=s;}}
  o.flyShare=best;G.stage=st;G.cleared=[1,1,1,1,0].map((v,i)=>i<st);(A.ZS(st).pool||[]).forEach(k=>{const d=A.MON[k];if(d)(A.META.best[d.n]=A.META.best[d.n]||{}).seen=1;});
  const cls=id=>A.TPL[id].cls;const ids=Object.keys(A.TPL).filter(id=>!A.TPL[id].mon);
  const pick=(c,n)=>ids.filter(id=>cls(id)===c).slice(0,n);
  const spec={};pick('knight',2).concat(pick('mage',3),pick('healer',2),pick('warrior',2),pick('monk',1)).forEach(id=>spec[id]=26);pick('archer',1).forEach(id=>spec[id]=22);
  set(spec);o.archer=pick('archer',1)[0];const P=__P6.bestParty();const bal=P.opts[0];o.balIds=bal.ids;o.hasArcher=bal.ids.includes(o.archer);
  A.ACT.bpOpen();A.render();o.title=(document.querySelector('#modal h2')||{}).textContent;A.V.modal={type:'menu',tab:'party'};A.render();o.btn=(document.querySelector('#modal [data-act="bpOpen"]')||{}).textContent;A.V.modal=null;
  return o;},[setRoster]);
console.log(JSON.stringify(r));
chk('an area with flying foes (share '+(r.flyShare||0).toFixed(2)+'): Balanced brings the lower level Archer over a 5th Lv 26 non ranged hero',r.flyShare>0&&r.hasArcher||JSON.stringify(r));
chk('the screen and button say Build party',/Build party/i.test(r.title||'')&&/Build party/i.test(r.btn||'')||JSON.stringify({t:r.title,b:r.btn}));
await done(h);})();
