// v0.22.52 (fix52.js, side48.js): The barred hoard counts an open vault chest; card tags do not lie on the bars.
//  1 a vault chest opened the usual way readies its quest (all five dungeons)
//  2 a save in which the vault chest is marked open (at its spot, or at the spot it was built on before the path guard moved it) but the
//    vault flag is missing: the quest is ready; a vault whose chest was never opened stays sealed
//  3 big screen card column: a foe and a hero with tags (statuses, weakness chips): the tags sit under the card, not on its HP bar
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v229a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v229a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:2,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false,goals:false}}));`;
(async()=>{const H=await open({w:1000,h:755,mobile:true,pre:META,tag:'v229a'});const {ev,wait}=H;
  await ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;Object.values(G.roster).forEach(c=>{c.lv=30;c.S=g('calcStats')(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});});
  const a=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,WS=g('WS'),o={usual:[],fixed:[],sealed:[],from:0};G.stage=4;G.cleared=[1,1,1,1,0];
    const q=s=>{let x=G.quests.find(k=>k.id==='v'+s);if(!x){x={id:'v'+s,stage:s,type:'vault',state:'active',title:'The barred hoard',desc:'',reward:{gold:1,item:'ether'}};G.quests.push(x);}x.state='active';return x;},ready=g('questReady');
    for(let s=0;s<5;s++){const m=g('getMap')('d'+s),vc=m.chests.find(c=>c[2]==='vault'),Q=q(s);
      // never opened
      G.vaults={};Object.keys(G.chests).forEach(k=>{if(k.startsWith('d'+s+':'))delete G.chests[k];});window.__F52.F52.chk={};o.sealed.push(ready(Q));
      // the open mark without the flag (at the built spot when the chest was moved)
      const key=m.id+':'+(vc.from?vc.from[0]+','+vc.from[1]:vc[0]+','+vc[1]);if(vc.from)o.from++;G.chests[key]=1;window.__F52.F52.chk={};o.fixed.push(ready(Q));
      // the usual way
      delete G.chests[key];G.vaults={};const m0=WS.m;WS.m=m;try{g('openChest')(vc[0],vc[1]);}catch(e){o.err=String(e);}WS.m=m0;A.V.modal=null;try{WS.dlg=null;}catch(e){}o.usual.push(ready(Q));}
    return o;});
  chk(`1 the vault chest opened the usual way readies the quest in all five dungeons (${a.usual.join(',')})`,a.usual.length===5&&a.usual.every(Boolean)||JSON.stringify(a));
  chk(`2 an open vault chest without the flag counts (${a.fixed.join(',')}; ${a.from} of them moved by the path guard); a chest never opened leaves it sealed (${a.sealed.join(',')})`,a.fixed.every(Boolean)&&a.sealed.every(x=>x===false)||JSON.stringify(a));
  await ev(()=>{const A=__A,g=A.TW.get;A.G.stage=1;A.G.cleared=[1,0,0,0,0];g('startBattle')({stage:1,kind:'wild'});A.render();});
  for(let i=0;i<80;i++){await wait(300);if(await ev(()=>{const B=__A.B;return !!(B&&B.cur&&B.cur.side==='p'&&B.mode==='cmd'&&B.menu==='root'&&document.querySelector('#bcmd [data-arg="skills"]'));}))break;}
  const t=await ev(()=>{const A=__A,g=A.TW.get,B=A.B;g('b3OnStage=function(){return false;}');/* as when the stage has no room to show them: the cards carry the tags */const T=k=>({t:(g('STS')[k]||{}).t||3});B.en[0].st=Object.assign(B.en[0].st||{},{slow:T('slow'),burn:T('burn'),weaken:T('weaken')});B.front[0].st=Object.assign(B.front[0].st||{},{haste:T('haste'),might:T('might'),ward:T('ward')});g('renderBattle')();
    const out={on:document.querySelector('.battle.b3').classList.contains('b48'),cards:[]};document.querySelectorAll('#bparty .pcw.hastags').forEach(w=>{const c=w.querySelector('.pc,.fc'),tg=w.querySelector('.ptags'),bars=[...w.querySelectorAll('.ucr')].map(e=>e.getBoundingClientRect());if(!c||!tg)return;const r=tg.getBoundingClientRect(),cr=c.getBoundingClientRect();
      out.cards.push({foe:w.classList.contains('fcw'),n:tg.children.length,tagTop:Math.round(r.top),cardBottom:Math.round(cr.bottom),over:bars.some(b=>Math.min(b.bottom,r.bottom)-Math.max(b.top,r.top)>1&&Math.min(b.right,r.right)-Math.max(b.left,r.left)>1),w:Math.round(r.width)});});return out;});
  chk(`3 the column is on (${t.on}); ${t.cards.length} cards carry tags (${t.cards.map(c=>(c.foe?'foe':'hero')+' '+c.n).join(', ')}); none lies on an HP or MP bar, each row of tags starts under its card`,
    t.on&&t.cards.length>=2&&t.cards.some(c=>c.foe)&&t.cards.some(c=>!c.foe)&&t.cards.every(c=>!c.over&&c.tagTop>=c.cardBottom-1&&c.n>0&&c.w>10)||JSON.stringify(t));
  await done(H);})();
