// Beta v0.5.0 1.6: the minimap shows in every field, town, dungeon, cave and fortress (phone default stays off, the toggle turns it on)
const {open,chk,done}=require('./pw');
(async()=>{for(const [w,h,mob] of [[1280,800,false],[844,390,true],[390,844,true]]){
const H=await open({w,h,mobile:mob});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.minimap=true;A.render();});await wait(400);
const ids=await ev(()=>{const A=__A,o=[];for(let s=0;s<5;s++){o.push('t'+s,'f'+s,'d'+s);(A.getMap('f'+s).caves||[]).forEach(c=>o.push(c.id));}return o;});
const miss=[];
for(const id of ids){
  await ev(id=>{const A=__A,m=A.getMap(id);A.G.been=A.G.been||{};A.G.been[id]=1;const e=A.mapEntry(m)||[2,2];A.placeAt(id,e[0],e[1],'d');A.V.modal=null;A.V.screen='world';A.render();},id);await wait(120);
  const r=await ev(()=>{const c=document.getElementById('mmap');if(!c)return 'no canvas';const b=c.getBoundingClientRect(),st=getComputedStyle(c);
    if(st.display==='none'||st.visibility==='hidden'||+st.opacity===0)return 'hidden '+st.display;if(b.width<20||b.height<20)return 'tiny';if(b.right>innerWidth+1||b.bottom>innerHeight+1||b.left<0||b.top<0)return 'offscreen';return true;});
  if(r!==true)miss.push(id+':'+r);}
chk(`${w}x${h}: minimap visible in all ${ids.length} areas`,miss.length===0||miss.join(' '));
{const r=await ev(()=>{const A=__A,m=A.getMap('f1');const e=A.mapEntry(m);A.G.weather[1]='no_such_sky';A.placeAt('f1',e[0],e[1],'d');A.render();A.wkwUpdate&&A.wkwUpdate();const c=document.getElementById('mmap');return c&&getComputedStyle(c).display!=='none'?true:'missing';});
 chk(`${w}x${h}: minimap still shows under a sky the HUD does not know`,r===true||r);}
if(w<560){const r=await ev(()=>{const A=__A;A.META.cfg.minimap=null;A.render();const c=document.getElementById('mmap');return !c||getComputedStyle(c).display==='none';});chk(`${w}x${h}: small phone default stays off`,r===true);}
await H.browser.close();}
const H=await open({});await done(H);})();
