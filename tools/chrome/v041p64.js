// v0.4.1 6.4: richer gear and item sprites, palettes follow rarity, the Tamer's Stick still glows
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(async()=>{const A=__A,o={};const src=h=>(h.match(/src="([^"]+)"/)||[])[1];
  const load=u=>new Promise(res=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=16;c.height=16;const x=c.getContext('2d');x.drawImage(i,0,0);const d=x.getImageData(0,0,16,16).data;const s=new Set();for(let k=0;k<d.length;k+=4)if(d[k+3])s.add(d[k]+','+d[k+1]+','+d[k+2]);res(s);};i.src=u;});
  const s0=await load(src(A.gearIcon('w_blade_0'))),s4=await load(src(A.gearIcon('w_blade_4')));o.colors=s4.size;o.differ=[...s4].some(c=>!s0.has(c));
  const ar=await load(src(A.gearIcon('a_mail_3')));o.armor=ar.size;
  o.items=Object.keys(A.ITEMS).every(id=>/^<img/.test(A.itemIcon(id)));const pot=await load(src(A.itemIcon('potion')));o.potion=pot.size;
  // stick glow: two different glow colours give different icons
  const mk=gl=>{const c=document.createElement('canvas');c.width=16;c.height=16;A.drawGearIcon(c.getContext('2d'),'stick','#fff',2,gl);return c.toDataURL();};o.stick=mk('#ff00ff')!==mk('#00ff00');
  A.V.modal={type:'menu',tab:'items'};A.render();o.tab=document.querySelectorAll('.iico').length>0;return o;});
console.log(JSON.stringify(r));
chk('6.4 gear icons are shaded (many colours) and tiers look different',r.colors>=6&&r.differ&&r.armor>=6);
chk('6.4 every consumable has an icon and the Items tab shows them',r.items&&r.potion>=6&&r.tab);
chk("6.4 the Tamer's Stick keeps its glow colour",r.stick===true);
await done(H);})();
