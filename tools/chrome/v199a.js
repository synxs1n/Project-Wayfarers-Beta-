// smooth20.js: leaving a lair without the long pause (Medium 1000x560, realm 1, three starters).
//  1 a map painted again in the same state is copied from the last paint: the copy is the same picture as a fresh paint (smooth20 off) for the
//    2D base (frame 0 with objects) and the HD-2D ground (frames 0 and 1 without objects), with the same side outputs (lights, bsp, torches)
//  2 any change of state paints again (a tile, the weather, realm cleared, a setting) and that paint is the same as a fresh one
//  3 walking out of the lair to the field you came from: the paints are copies (hits), the change task and the longest frame are within bounds
//  4 right after the lair's boss falls the field is painted ahead behind the rewards screen (lifted look), so the first walk out copies too
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v199a.js
const {open,chk,done,perfChk}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v199a ran over 300 s');process.exit(1);},300000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
// painted ms (fade included) of the walk out, the change task and the longest frame gap after it (the fix18 method)
const STEP=`new Promise(res=>{const A=__A;const t0=performance.now();let task=0;const fr=[];let lf=t0;const rf=n=>{fr.push(n-lf);lf=n;if(n-t0<1800)requestAnimationFrame(rf);};requestAnimationFrame(rf);
  const n0=Object.assign({},window.__S20.S20.n);
  A.TW.get('fadeTo')(()=>{const a=performance.now();A.TW.get('leaveDungeon')(A.WS.m.s);task=performance.now()-a;});
  setTimeout(()=>{const n=window.__S20.S20.n;res({task:Math.round(task),gap:Math.round(Math.max(...fr.slice(1))),hit:n.hit-n0.hit,miss:n.miss-n0.miss,un:(n.unsettled|0)-(n0.unsettled|0),mid:A.WS.m.id});},2000);})`;
(async()=>{const H=await open({w:1000,h:560,pre:META,tag:'v199a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;
    A.G.run.seed=4242;try{A.resetMaps();A.syncPools();}catch(e){}A.placeAt('f0',...A.mapEntry(A.getMap('f0')),'d');A.render();});
  await wait(1500);
  // ---- 1, 2 ----
  const same=await ev(()=>{const A=__A,S=window.__S20.S20,bm=A.TW.get('buildMapCanvas'),m=A.getMap('f0');
    const h=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let a=0,b=0;for(let i=0;i<d.length;i+=4){a=(a+d[i]*3+d[i+1]*5+d[i+2]*7+d[i+3])%2147483647;b=(b*31+d[i]+d[i+1])%1000000007;}return a+':'+b;};
    const side=()=>JSON.stringify([(m.lights||[]).length,(m.bsp||[]).length,(m.smoke||[]).length,(m.torches||[]).length,(m.mills||[]).length]);
    const paint=(fr,obj)=>{const r=window.__S20.paint(m,fr,obj);return {h:h(r),s:side()};};
    const fresh=(fr,obj)=>{S.off=true;try{return paint(fr,obj);}finally{S.off=false;}};
    const out=[];const n0=Object.assign({},S.n);
    for(const [fr,obj] of [[0,1],[0,0],[1,0]]){const a=paint(fr,obj),b=paint(fr,obj),f=fresh(fr,obj);out.push({fr,obj,ok:a.h===f.h&&b.h===f.h&&a.s===f.s&&b.s===f.s});}
    const hits=S.n.hit-n0.hit;
    // 2: changes of state
    const ch=[];const test=(name,set,undo)=>{set();const n1=S.n.miss;const a=paint(0,1),f=fresh(0,1);const miss=S.n.miss-n1;undo();ch.push({name,ok:a.h===f.h&&miss===1,miss});};
    let tx=-1,ty=-1;for(let y=2;y<m.h-2&&tx<0;y++)for(let x=2;x<m.w-2;x++)if(A.tileAt(m,x,y)==='.'){tx=x;ty=y;break;}
    const row=m.t[ty],was=Array.isArray(row)?row[tx]:row[tx];
    const setT=c=>{if(Array.isArray(m.t[ty]))m.t[ty][tx]=c;else m.t[ty]=m.t[ty].slice(0,tx)+c+m.t[ty].slice(tx+1);};
    test('a tile',()=>setT('T'),()=>setT(was));
    const w0=A.G.weather[0];test('the weather',()=>{A.G.weather[0]=w0==='rain'?'clear':'rain';},()=>{A.G.weather[0]=w0;});
    test('realm cleared',()=>{A.G.cleared[0]=true;},()=>{A.G.cleared[0]=false;});
    const M=A.TW.get('META');test('a setting',()=>{M.cfg.s20probe=1;},()=>{delete M.cfg.s20probe;});
    return {out,hits,ch,err:S.err};});
  chk(`1 a repeat paint is a copy and the same picture and side outputs as a fresh paint (${same.out.map(o=>'frame '+o.fr+(o.obj?' objects':' ground')+' '+o.ok).join(', ')}; ${same.hits} hits)`,(same.out.every(o=>o.ok)&&same.hits>=3)||JSON.stringify(same));
  chk(`2 a change of state paints again, the same as a fresh paint (${same.ch.map(c=>c.name+' '+c.ok).join(', ')})`,(same.ch.every(c=>c.ok)&&!same.err.length)||JSON.stringify(same.ch.concat(same.err)));
  // ---- 3 ----
  const T=[];for(let r=0;r<2;r++){await ev(()=>{const A=__A;A.TW.get('enterDungeon')(0);A.render();});await wait(1400);T.push(await ev(STEP));await wait(800);}
  const t=T[1];
  chk(`3 the walk out of the lair to the field copies its paints (second walk: ${T.map(o=>o.hit+' hits / '+o.miss+' paints').join(', ')}, on ${t.mid})`,(t.mid==='f0'&&t.hit>=2&&t.miss===0)||JSON.stringify(T));
  await perfChk(H,`3 the map change task (was 90 to 330 ms)`,t.task,60);
  await perfChk(H,`3 the longest frame after it (was 370 to 670 ms)`,t.gap,300);
  // ---- 4 ----
  await ev(()=>{const A=__A;A.TW.get('enterDungeon')(0);A.render();});await wait(1400);
  await ev(()=>{const A=__A;A.startBattle({stage:0,kind:'boss'});});await wait(1500);
  await ev(()=>{const A=__A;A.B.en.forEach(e=>e.hp=0);try{if(!A.B.over)A.TW.get('checkEnd')();}catch(e){}});await wait(2500);
  const ah=await ev(()=>window.__S20.S20.n.ahead|0);
  for(let k=0;k<30;k++){const ok=await ev(()=>{const A=__A;try{if(A.V.modal&&A.V.modal.type==='result')A.ACT.resultOk();else if(A.V.modal&&A.V.modal.type==='story')A.ACT.storyOk();else if(A.V.modal){A.V.modal=null;A.render();}}catch(e){}return A.V.screen==='world'&&!A.B&&!A.V.modal;});if(ok)break;await wait(600);}
  await wait(1000);const b=await ev(STEP);const cl=await ev(()=>!!__A.G.cleared[0]);
  chk(`4 after the lair boss the field was painted ahead (${ah} paints behind the rewards) and the first walk out copies them (${b.hit} hits / ${b.miss} paints, cleared ${cl})`,(ah>=3&&cl&&b.hit>=2&&b.miss===0)||JSON.stringify({ah,b,cl}));
  await perfChk(H,`4 the longest frame after the first walk out after the boss (was 450 to 580 ms)`,b.gap,300);
  const kc=await ev(()=>{const m=__A.getMap('f0'),t0=performance.now();for(let i=0;i<10;i++)window.__S20.key(m,0);return (performance.now()-t0)/10;});
  await perfChk(H,`5 the state key of a field (${kc.toFixed(1)} ms)`,Math.round(kc),15);
  await done(H);})();
