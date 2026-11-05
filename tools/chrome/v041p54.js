// v0.4.1 5.4: dynamic title screen
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait}=H;
const r=await ev(()=>{const A=__A,o={};A.V.screen='title';A.render();
  const ids=[...document.querySelectorAll('.lineup img')].map(i=>i.src);o.n=ids.length;o.uniq=new Set(ids).size;
  const seen=new Set(),th=new Set(),wx=new Set();for(let i=0;i<60;i++){const s=A.titleMake(A.TTS.scene);s.ids.forEach(x=>seen.add(x));th.add(s.theme);wx.add(s.wx||'none');if(s.ids.length!==6||new Set(s.ids).size!==6)o.bad=1;}
  o.heroes=seen.size;o.themes=th.size;o.wx=[...wx];const before=A.TTS.scene;A.titleAdvance(performance.now());o.changed=A.TTS.scene!==before&&A.TTS.scene.theme!==before.theme;return o;});
console.log(JSON.stringify(r));
chk('5.4 six different wayfarers on screen',r.n===6&&r.uniq===6&&!r.bad);
chk('5.4 many heroes, themes and weather show up over time',r.heroes>=12&&r.themes>=5&&r.wx.includes('rain')&&r.wx.includes('snow'));
chk('5.4 the scene advances to a different backdrop',r.changed===true);
await wait(1800);
const t=await ev(()=>{const c=document.getElementById('tcv');return !!c&&c.width>0;});
chk('5.4 the canvas keeps drawing',t===true);
await done(H);})();
