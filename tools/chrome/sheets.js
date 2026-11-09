// Contact sheets for the sprite overhaul (docs/art-style.md, Verification).
// Usage: node tools/chrome/sheets.js <html> <out.png> foes|poses   [ONLY=art1,art2 limits the rows; CHUNK=24 splits into out_1.png, out_2.png...]
//   foes  : every MON art as a row: idle 0, idle 1, atk, hit (monCanvas(art,{t,i})), each drawn at 3x on a dark ground with a 2px margin box
//   poses : reserved for the hero pose sheet
const fs=require('fs');const {open}=require('./pw');
const [html,out,kind]=process.argv.slice(2);
if(!html||!out||!kind){console.log('usage: node sheets.js <html> <out.png> foes|poses');process.exit(2);}
if(kind!=='foes'){console.log('sheet kind "'+kind+'" is reserved');process.exit(2);}
(async()=>{
  const H=await open({html:fs.readFileSync(html,'utf8'),dir:'/tmp',w:600,h:400});
  const only=process.env.ONLY?process.env.ONLY.split(','):null,chunk=+process.env.CHUNK||24;
  const data=await H.ev(([only,chunk,zoom])=>{
    const A=window.__A,MON=A.MON,keys=Object.keys(MON).filter(k=>!only||only.includes(k)||only.includes(MON[k].art));
    const Z=+zoom||1,FR=[{t:'idle',i:0},{t:'idle',i:1},{t:'atk',i:0},{t:'hit',i:0}],CELL=124*Z,LAB=96,PERROW=Z>1?1:2;
    const sheets=[];
    for(let s=0;s<keys.length;s+=chunk){
      const ks=keys.slice(s,s+chunk),rows=Math.ceil(ks.length/PERROW),W=PERROW*(LAB+4*CELL)+8,Hh=rows*CELL+8;
      const cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;
      x.fillStyle='#2a2438';x.fillRect(0,0,W,Hh);
      ks.forEach((k,n)=>{const r=Math.floor(n/PERROW),c=n%PERROW,ox=4+c*(LAB+4*CELL),oy=4+r*CELL;
        x.fillStyle='#e8e0f0';x.font='11px monospace';x.fillText(k.slice(0,15),ox+2,oy+14);x.fillStyle='#9a90b0';x.fillText(MON[k].art===k?'':'art:'+MON[k].art.slice(0,10),ox+2,oy+27);
        FR.forEach((f,j)=>{const fx=ox+LAB+j*CELL;x.fillStyle=j%2?'#322a44':'#2e2640';x.fillRect(fx,oy,CELL-2,CELL-2);
          x.strokeStyle='#4a4060';x.beginPath();x.moveTo(fx,oy+CELL-14*Z);x.lineTo(fx+CELL-2,oy+CELL-14*Z);x.stroke();
          let cvs;try{cvs=A.monCanvas(MON[k].art,f);}catch(e){x.fillStyle='#f66';x.fillText('ERR',fx+4,oy+20);return;}
          const sc=120*Z/Math.max(cvs.width,cvs.height);
          const w=Math.round(cvs.width*sc),h=Math.round(cvs.height*sc);x.drawImage(cvs,fx+Math.round((CELL-2-w)/2),oy+CELL-14*Z-h+10*Z,w,h);});
      });
      sheets.push(cv.toDataURL('image/png'));
    }
    return {sheets,n:keys.length};
  },[only,chunk,+process.env.ZOOM||1]);
  const b=d=>Buffer.from(d.split(',')[1],'base64');
  data.sheets.forEach((d,i)=>{fs.writeFileSync(data.sheets.length>1?out.replace(/\.png$/,'_'+(i+1)+'.png'):out,b(d));});
  console.log('sheets:',data.sheets.length,'rows of',data.n,'foes ->',out);
  await H.browser.close();
})();
