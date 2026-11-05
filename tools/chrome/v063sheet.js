// v0.6.3 icon sheet: every gear, item and material icon at 1x, 2x and 3x, grouped, plus a duplicate report.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html TAG=before|after node v063sheet.js
// Writes shots-v063s/icons_<TAG>_<n>.png (not committed) and prints the duplicate groups.
const {open}=require('./pw');const fs=require('fs');
const TAG=process.env.TAG||'after',OUT=__dirname+'/shots-v063s';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const H=await open({w:1400,h:900,mobile:false});await H.wait(600);
const data=await H.ev(()=>{const A=__A,src=h=>{const m=/src="([^"]+)"/.exec(h||'');return m?m[1]:'';};
  const L=[];
  Object.keys(A.GEAR).forEach(id=>{const g=A.GEAR[id];L.push({grp:'gear:'+(g.slot||'?'),id,n:g.n,u:src(A.gearIcon(id))});});
  Object.keys(A.ITEMS).forEach(id=>L.push({grp:'item',id,n:A.ITEMS[id].n,u:src(A.itemIcon(id))}));
  if(typeof window.__A.matIcon==='function')Object.keys(A.MATS).forEach(id=>L.push({grp:'mat',id,n:A.MATS[id],u:src(A.matIcon(id))}));
  return L;});
// duplicates by rendered data URL
const by={};data.forEach(d=>{(by[d.u]=by[d.u]||[]).push(d.id);});
const dups=Object.values(by).filter(a=>a.length>1);
console.log(`icons ${data.length}, distinct ${Object.keys(by).length}, duplicate groups ${dups.length}, items sharing an icon ${dups.reduce((a,b)=>a+b.length,0)}`);
dups.sort((a,b)=>b.length-a.length).forEach(a=>console.log('  '+a.length+': '+a.join(' ')));
fs.writeFileSync(OUT+'/dups_'+TAG+'.txt',dups.map(a=>a.join(' ')).join('\n')+'\n');
// sheets: 3 pages
const groups=[...new Set(data.map(d=>d.grp))];const pages=[];let cur=[];
data.forEach(d=>{cur.push(d);if(cur.length>=120){pages.push(cur);cur=[];}});if(cur.length)pages.push(cur);
for(let p=0;p<pages.length;p++){
  await H.ev(P=>{document.body.innerHTML='<div id="sh" style="background:#1a1118;padding:8px;display:grid;grid-template-columns:repeat(10,136px);gap:4px;font:9px sans-serif;color:#ddd">'+
    P.map(d=>`<div style="display:flex;gap:3px;align-items:center;background:#241a22;padding:2px"><img src="${d.u}" style="width:48px;height:48px;image-rendering:pixelated;background:#2e2430"><div><img src="${d.u}" style="width:16px;height:16px;image-rendering:pixelated"> <img src="${d.u}" style="width:32px;height:32px;image-rendering:pixelated"><br>${d.n.replace(/</g,'')}</div></div>`).join('')+'</div>';document.body.style.margin=0;},pages[p]);
  await H.wait(200);const el=await H.page.$('#sh');await el.screenshot({path:`${OUT}/icons_${TAG}_${p}.png`});}
// zoom pages: 64 px per icon, a row per family (tiers left to right), then the personal rewards, charms, items and materials
const zoom=[];const fams={};data.forEach(d=>{const m=/^[wak]_([a-z]+)_(\d)$/.exec(d.id);if(m)(fams[m[1]]=fams[m[1]]||[]).push(d);});
Object.keys(fams).forEach(f=>zoom.push(fams[f]));
const rest=data.filter(d=>!/^[wak]_([a-z]+)_(\d)$/.test(d.id));for(let i=0;i<rest.length;i+=12)zoom.push(rest.slice(i,i+12));
for(let p=0;p*12<zoom.length;p++){const rows=zoom.slice(p*12,p*12+12);
  await H.ev(R=>{document.body.innerHTML='<div id="sh" style="background:#1a1118;padding:8px;font:10px sans-serif;color:#ddd">'+R.map(r=>'<div style="display:flex;gap:6px;margin-bottom:6px">'+r.map(d=>`<div style="width:74px;text-align:center"><img src="${d.u}" style="width:64px;height:64px;image-rendering:pixelated;background:#2a1f2a;border-radius:6px"><br>${d.n.replace(/</g,'').slice(0,22)}</div>`).join('')+'</div>').join('')+'</div>';},rows);
  await H.wait(150);const el=await H.page.$('#sh');await el.screenshot({path:`${OUT}/zoom_${TAG}_${p}.png`});}
// in game: the Smithy and the Backpack at phone size
{const G2=await open({w:390,h:844,mobile:true});await G2.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.stage=4;A.G.gold=99999;
  ['w_blade_5','u_mira','ua_lumen','uc_oren','c_fb2','k_cape_5','w_staff_ef','a_robe_4'].forEach(id=>A.G.gear.push(id));});
  await G2.page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
  for(const [n,m] of [['smithy',{type:'smithy',tab:'weapons'}],['armor',{type:'smithy',tab:'armor'}]]){await G2.ev(m=>{__A.V.modal=m;__A.render();},m);await G2.wait(300);await G2.page.screenshot({path:`${OUT}/game_${n}_${TAG}.png`});}
  await G2.browser.close();}
console.log('sheets',pages.length,'zoom pages',Math.ceil(zoom.length/12),'in',OUT);
await H.browser.close();})();
