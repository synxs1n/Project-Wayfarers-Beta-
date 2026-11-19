// v0.22.40: every dual type has both elements covered, and a click to walk shows its marker.
//  1 for each of the 28 dual types and each of their two elements: a Primer, a Detonator, a skill learned by level 20 and one after
//    (a Dual art with a role counts for both elements); kits are still 14 skills with no two names alike
//  2 a real mouse click on the field shows the ring at the click and the diamond within one tile's width of it, and the party walks
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v223a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v223a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false,goals:false}}));`;
(async()=>{const H=await open({w:1280,h:800,pre:META,tag:'v223a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(2200);
  const a=await ev(()=>{const g=__A.TW.get,TPL=g('TPL'),CLS=g('CLS'),cs=g('classSkills'),o={n:0,miss:[],size:[],dup:[]};window.__R25.R25.off=true;
    for(const id in TPL){const t=TPL[id];if(t.mon||!CLS[t.cls])continue;const L=cs(t);if(L.length!==14)o.size.push(id+' '+L.length);const N={};L.forEach(s=>{if(N[s.n])o.dup.push(id+' '+s.n);N[s.n]=1;});
      if((t.el||[]).length<2)continue;o.n++;t.el.forEach(e=>{const R=L.filter(s=>(s.role==='primer'||s.role==='det')&&(s.k==='phys'||s.k==='mag')&&(s.combo?[].concat(s.el||[]).includes(e):s.el===e));
        [['primer',s=>s.role==='primer'],['detonator',s=>s.role==='det'],['early',s=>s.lv<=20],['late',s=>s.lv>20]].forEach(([k,f])=>{if(!R.some(f))o.miss.push(id+' '+e+' no '+k);});});}
    window.__R25.R25.off=false;o.log=window.__S36.log;return o;});
  chk(`1 ${a.n} dual types, both elements covered four ways (${a.miss.length} missing); swapped: ${a.log.swapped.length}`,(a.n>=27&&!a.miss.length&&!a.size.length&&!a.dup.length)||JSON.stringify([a.miss.slice(0,8),a.size,a.dup]));
  const r=await ev(()=>{const cv=__A.TW.get('WS').cv.getBoundingClientRect();return [cv.left+cv.width*.68,cv.top+cv.height*.62];});
  await H.page.mouse.move(r[0]-2,r[1]-1);await H.page.mouse.down();await wait(50);await H.page.mouse.up();await wait(120);
  const b=await ev(()=>{const N=window.__N40.N40.last,at=document.querySelector('.n40.at'),to=document.querySelector('.n40.to'),WS=__A.TW.get('WS'),cv=WS.cv.getBoundingClientRect(),tile=cv.width/(WS.cv.width/16);
    return {at:!!at,to:!!to,last:N,gap:N&&N.to?Math.hypot(N.at[0]-N.to[0],N.at[1]-N.to[1]):null,tile,target:WS.target||(N&&N.tile)};});
  await wait(3500);const c=await ev(()=>{const WS=__A.TW.get('WS');return [WS.x,WS.y];});
  chk(`2 the click shows a ring and a diamond ${b.gap!=null?Math.round(b.gap):'?'} px apart (a tile is about ${Math.round(b.tile)} px), and the party walks to ${c}`,(b.at&&b.to&&b.gap!=null&&b.gap<=b.tile*1.2&&b.last&&c[0]===b.last.tile[0]&&c[1]===b.last.tile[1])||JSON.stringify([b,c]));
  await done(H);})();
