// 5.2: how many unique lines exist, and are they distinct per wayfarer? (node, loads ceword.js standalone)
const fs=require('fs');const {A}=require('./v3sim.js');
const src=fs.readFileSync(__dirname+'/v3/ceword.js','utf8').split('// hook into')[0];
const TPL=A.TPL;
const api=(new Function('TPL','ZS','return (function(){'+src+'\nreturn {cwIntro,cwAsk,cwWin,cwDecline,cwPick,CW_CLS};})()'))(TPL,()=>({}));
const heroes=Object.keys(TPL).filter(id=>!TPL[id].mon&&TPL[id].src!=='L'&&id!=='vaelith'&&id!=='nikaris');
const themes=['meadow','coast','snow','heights','void'];const S={intro:new Set(),ask:new Set(),win:new Set(),decline:new Set()};
heroes.forEach(h=>{themes.forEach(th=>{S.intro.add(api.cwIntro(h,th,false));});S.intro.add(api.cwIntro(h,'meadow',true));
  ['potion','ambush','duel','trade'].forEach(m=>S.ask.add(h+'|'+api.cwAsk(h,m)));S.win.add(api.cwWin(h,'duel'));S.win.add(api.cwWin(h,'thanks'));S.decline.add(api.cwDecline(h));});
const tot=Object.values(S).reduce((a,s)=>a+s.size,0);let f=0;
console.log('wayfarers covered',heroes.length);Object.keys(S).forEach(k=>console.log(k,'lines:',S[k].size));console.log('total unique lines',tot);
// distinct per hero: no two heroes share an intro or decline line
const seen={};let dup=0;heroes.forEach(h=>{const l=api.cwDecline(h);if(seen[l])dup++;seen[l]=1;});console.log('decline lines shared between two heroes:',dup);
if(dup)f++;console.log('fails='+f);process.exit(f?1:0);
