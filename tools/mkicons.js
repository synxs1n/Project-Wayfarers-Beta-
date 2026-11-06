// v0.7.1: renders the Wayfarers emblem (v3/logo.js, the same code the game draws its logo with) into every app icon.
// Run from the repo root: node tools/mkicons.js   (needs Playwright, as the Chrome tests do). Writes:
//   icons/      icon-192.png, icon-512.png (purpose any), icon-maskable-512.png, apple-touch-icon.png (180), favicon-16.png,
//               favicon-32.png, icon.svg (PWA manifest, the page's favicon and Apple touch icon; icon-512 is also the Electron window icon)
//   assets/     icon-only.png (1024), icon.ico (16 to 256; the Windows app and installer, package.json build.win.icon)
//   android-res/mipmap-*/ic_launcher.png, ic_launcher_round.png (legacy launchers), ic_launcher_foreground.png (adaptive, 108 dp)
//               and android-res/values/ic_launcher_background.xml (the adaptive background colour); release.yml copies android-res/
//               into the Capacitor project's res folder.
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=path.join(__dirname,'..'),src=fs.readFileSync(path.join(ROOT,'v3','logo.js'),'utf8');
const BG='#0E0A1A';// the emblem's outer colour, used as the adaptive icon background
const DENS=[['mdpi',1],['hdpi',1.5],['xhdpi',2],['xxhdpi',3],['xxxhdpi',4]];
const out=(rel,buf)=>{const p=path.join(ROOT,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,buf);console.log(rel,buf.length,'bytes');};
// an .ico holding PNG images (Windows Vista and later, electron-builder needs the 256 px one)
function ico(list){const n=list.length,head=Buffer.alloc(6+16*n);head.writeUInt16LE(0,0);head.writeUInt16LE(1,2);head.writeUInt16LE(n,4);let off=6+16*n;
  list.forEach(([s,b],i)=>{const o=6+16*i;head.writeUInt8(s>=256?0:s,o);head.writeUInt8(s>=256?0:s,o+1);head.writeUInt8(0,o+2);head.writeUInt8(0,o+3);
    head.writeUInt16LE(1,o+4);head.writeUInt16LE(32,o+6);head.writeUInt32LE(b.length,o+8);head.writeUInt32LE(off,o+12);off+=b.length;});
  return Buffer.concat([head,...list.map(x=>x[1])]);}
(async()=>{const br=await chromium.launch(),pg=await br.newPage({viewport:{width:1100,height:1100}});
  await pg.setContent('<!doctype html><html><body style="margin:0;background:transparent"><div id="o" style="display:inline-block;line-height:0"></div></body></html>');
  await pg.addScriptTag({content:src+';window.WF_LOGO=WF_LOGO;'});
  const png=async(size,opt)=>{await pg.evaluate(([s,o])=>{document.getElementById('o').innerHTML=WF_LOGO.emblem(Object.assign({size:s},o));},[size,opt]);
    return await pg.locator('#o svg').screenshot({omitBackground:true});};
  const simple=s=>s<=48;
  out('icons/icon-192.png',await png(192,{scale:.98}));
  out('icons/icon-512.png',await png(512,{scale:.98}));
  out('icons/icon-maskable-512.png',await png(512,{bg:'square',scale:.8}));
  out('icons/apple-touch-icon.png',await png(180,{bg:'square',scale:.88}));
  out('icons/favicon-32.png',await png(32,{simple:1}));
  out('icons/favicon-16.png',await png(16,{simple:1}));
  out('icons/icon.svg',Buffer.from(await pg.evaluate(()=>WF_LOGO.emblem({}).replace(/ width="512" height="512"/,''))));
  out('assets/icon-only.png',await png(1024,{scale:.98}));
  const I=[];for(const s of [16,24,32,48,64,128,256])I.push([s,await png(s,{simple:simple(s),scale:.98})]);out('assets/icon.ico',ico(I));
  for(const [d,m] of DENS){const L=Math.round(48*m),F=Math.round(108*m);
    out(`android-res/mipmap-${d}/ic_launcher.png`,await png(L,{simple:simple(L),scale:.92}));
    out(`android-res/mipmap-${d}/ic_launcher_round.png`,await png(L,{simple:simple(L),scale:.92}));
    out(`android-res/mipmap-${d}/ic_launcher_foreground.png`,await png(F,{scale:.68}));}
  out('android-res/values/ic_launcher_background.xml',Buffer.from(`<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BG}</color>\n</resources>\n`));
  await br.close();})();
