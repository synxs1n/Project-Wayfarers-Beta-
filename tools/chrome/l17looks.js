// One sheet of the three reworked Legendaries (legends17b.js): battle idle, poses, hit, front, back, the overworld walkers and the portrait. node l17looks.js <html> <out.png> [zoom]   COLS=idle,shoot1 limits the columns, ONLY=ids the rows
const fs=require('fs');const {open}=require('./pw');const [html,out,zoom]=process.argv.slice(2);
(async()=>{const H=await open({html:fs.readFileSync(html,'utf8'),w:800,h:600});
if(process.env.COLS)await H.ev(c=>{window.__COLS=c;},process.env.COLS.split(','));
const d=await H.ev(async([Z,IDS])=>{const g=__A.TW.get,TPL=g('TPL'),hc=g('heroCanvas'),pc=g('heroPoseCanvas'),wc=g('walkerCanvas'),hl=g('heroLook');
  const img=u=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=u;});
  const cols=[['idle',id=>hc(id,false)],['shoot0',id=>pc(id,'shoot',0)],['shoot1',id=>pc(id,'shoot',1)],['cast1',id=>pc(id,'cast',1)],['cheer1',id=>pc(id,'cheer',1)],['guard0',id=>pc(id,'guard',0)],['hit',id=>pc(id,'hit',0)],
    ['front',id=>wc('big:lk:'+id,hl(id),TPL[id].el,id,'front',0)],['front1',id=>wc('big:lk:'+id,hl(id),TPL[id].el,id,'front',1)],['back',id=>wc('big:lk:'+id,hl(id),TPL[id].el,id,'back',0)],
    ['wk side',id=>wc('lk:'+id,hl(id),TPL[id].el,id,'side',0)],['wk side1',id=>wc('lk:'+id,hl(id),TPL[id].el,id,'side',1)],['wk front',id=>wc('lk:'+id,hl(id),TPL[id].el,id,'front',0)],['wk back',id=>wc('lk:'+id,hl(id),TPL[id].el,id,'back',0)]];
  if(window.__COLS){const C=window.__COLS;for(let i=cols.length-1;i>=0;i--)if(!C.includes(cols[i][0]))cols.splice(i,1);}
  const cw=58*Z,ch=60*Z,W=cols.length*cw+40*Z+8,Hh=IDS.length*ch+16,cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;
  x.fillStyle='#2a2438';x.fillRect(0,0,W,Hh);x.font='11px monospace';
  cols.forEach((c,j)=>{x.fillStyle='#e8e0f0';x.fillText(c[0],j*cw+4,12);});
  for(let n=0;n<IDS.length;n++){const id=IDS[n],oy=16+n*ch;
    cols.forEach((c,j)=>{const fx=j*cw;x.fillStyle=j%2?'#3a4a3a':'#46583f';x.fillRect(fx,oy,cw-2,ch-2);let s;try{s=c[1](id);}catch(e){x.fillStyle='#f66';x.fillText('ERR '+String(e.message).slice(0,14),fx+2,oy+20);return;}
      x.drawImage(s,fx+Math.round((cw-2-s.width*Z)/2),oy+ch-4-s.height*Z,s.width*Z,s.height*Z);});
    try{const im=await img(g('portraitURL')(id));x.fillStyle='#4a3c28';x.fillRect(cols.length*cw,oy,40*Z,40*Z);x.drawImage(im,cols.length*cw,oy,40*Z,40*Z);}catch(e){}}
  return cv.toDataURL('image/png');},[+zoom||3,(process.env.ONLY||'nikaris,kaevan,jaeson').split(',')]);
fs.writeFileSync(out,Buffer.from(d.split(',')[1],'base64'));console.log('wrote',out);await H.browser.close();process.exit(0);})();
