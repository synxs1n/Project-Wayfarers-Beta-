// Jace's head (legends17b.js 6c): the three hair cuts side by side with two other heroes for scale. node l17jace.js <html> <out.png> [zoom, default 4]
// Rows: each hair variant (l17a the pick, l17b, l17c), then REF heroes (default cass,alder). Columns: battle idle, cast, front, back, overworld side,
// front and back, then the portrait at full card size (x8).
const fs=require('fs');const {open}=require('./pw');const [html,out,zoom]=process.argv.slice(2);
(async()=>{const H=await open({html:fs.readFileSync(html,'utf8'),w:800,h:600});
const d=await H.ev(async([Z,REF])=>{const g=__A.TW.get,TPL=g('TPL'),hc=g('heroCanvas'),pc=g('heroPoseCanvas'),wc=g('walkerCanvas'),hl=g('heroLook'),IMG=g('IMG'),pcv=g('portraitCanvas');
  const hairs=Object.keys((window.__L17&&__L17.L17.hair)||{}),rows=hairs.map(h=>({id:'jaeson',hair:h,lab:'Jace '+h+(h===TPL.jaeson.look.hair?' (pick)':'')})).concat(REF.map(id=>({id,lab:id})));
  if(!hairs.length)rows.unshift({id:'jaeson',lab:'Jace'});
  const cols=[['idle',(id,k)=>hc(id,false)],['cast',(id,k)=>pc(id,'cast',1)],['front',(id,k)=>wc('big:j:'+k,hl(id),TPL[id].el,id,'front',0)],['back',(id,k)=>wc('big:j:'+k,hl(id),TPL[id].el,id,'back',0)],
    ['walk side',(id,k)=>wc('j:'+k,hl(id),TPL[id].el,id,'side',0)],['walk front',(id,k)=>wc('j:'+k,hl(id),TPL[id].el,id,'front',0)],['walk back',(id,k)=>wc('j:'+k,hl(id),TPL[id].el,id,'back',0)]];
  const cw=46*Z,ch=60*Z,PW=24*8,W=cols.length*cw+PW+110,Hh=rows.length*ch+18,cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;
  x.fillStyle='#2a2438';x.fillRect(0,0,W,Hh);x.font='12px monospace';cols.forEach((c,j)=>{x.fillStyle='#e8e0f0';x.fillText(c[0],100+j*cw+4,13);});x.fillText('portrait',100+cols.length*cw+4,13);
  rows.forEach((r,n)=>{const oy=18+n*ch,k=r.id+(r.hair||'');if(r.hair){TPL.jaeson.look.hair=r.hair;Object.keys(IMG).forEach(q=>{if(/jaeson/.test(q))delete IMG[q];});}
    x.fillStyle='#e8e0f0';x.fillText(r.lab,4,oy+16);
    cols.forEach((c,j)=>{const fx=100+j*cw;x.fillStyle=j%2?'#3a4a3a':'#46583f';x.fillRect(fx,oy,cw-2,ch-2);let s;try{s=c[1](r.id,k);}catch(e){x.fillStyle='#f66';x.fillText('ERR '+String(e.message).slice(0,12),fx+2,oy+20);return;}
      x.drawImage(s,fx+Math.round((cw-2-s.width*Z)/2),oy+ch-4-s.height*Z,s.width*Z,s.height*Z);});
    try{const p=pcv(r.id);x.fillStyle='#4a3c28';x.fillRect(100+cols.length*cw,oy,PW,PW);x.drawImage(p,100+cols.length*cw,oy,PW,PW);}catch(e){}});
  return cv.toDataURL('image/png');},[+zoom||4,(process.env.REF==null?'cass,alder':process.env.REF).split(',').filter(Boolean)]);
fs.writeFileSync(out,Buffer.from(d.split(',')[1],'base64'));console.log('wrote',out);await H.browser.close();process.exit(0);})();
