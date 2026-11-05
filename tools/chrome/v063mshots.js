// Beta v0.6.3 shops and menus: screenshots of every shop with its tabs and a dropdown open, and the main menu tabs,
// in portrait (390x844), landscape (844x390) and the Galaxy Z Fold open (933x705). PNGs go to tools/chrome/shots-v063m/ (not committed).
// Usage: PWHTML=../../out/aurelis3.html node v063mshots.js [filter]
// A native dropdown cannot be photographed open in headless Chrome, so "open" shots show the select expanded in place (size=N).
const {open,chk,done}=require('./pw');const fs=require('fs');const OUT=__dirname+'/shots-v063m';fs.mkdirSync(OUT,{recursive:true});
const SIZES=[[390,844,'port'],[844,390,'land'],[933,705,'fold']];const only=process.argv[2]||'';
const SCREENS=[
  ['smithy-shop-all',{type:'smithy',tab:'shop'},'sort'],['smithy-shop-weapons',{type:'smithy',tab:'shop',sec:'weapons'}],['smithy-shop-mats',{type:'smithy',tab:'shop',sec:'mats'}],
  ['smithy-forge',{type:'smithy',tab:'craft'},'show'],['smithy-temper',{type:'smithy',tab:'forge'},'t'],['smithy-sell',{type:'smithy',tab:'sell'}],
  ['alch-shop-all',{type:'workshop',tab:'shop'},'rar'],['alch-shop-charms',{type:'workshop',tab:'shop',sec:'charm'}],['alch-craft',{type:'workshop',tab:'craft'}],['alch-sell',{type:'workshop',tab:'sell'}],
  ['tavern',{type:'tavern'}],['tavern-kitchen',{type:'tavern',tab:'kitchen'}],['guild',{type:'guild'}],['guild-quests',{type:'guild',tab:'quests'}],['guild-guilds',{type:'guild',tab:'guilds'}],
  ['board',{type:'board'}],['inn',{type:'inn'}],
  ['menu-party',{type:'menu',tab:'party'}],['menu-roster',{type:'menu',tab:'roster'},'roster'],['menu-items',{type:'menu',tab:'items'},'items'],['menu-pouch',{type:'menu',tab:'pouch'}],
  ['menu-quests',{type:'menu',tab:'quests'}],['menu-records',{type:'menu',tab:'system'}],['menu-beasts',{type:'menu',tab:'beasts'},'beasts'],['menu-codex',{type:'menu',tab:'codex'}],['menu-guides',{type:'menu',tab:'next'}],
  ['eqpick',{type:'eqPick',char:'mira',slot:'w'}]];
(async()=>{for(const [w,h,tag] of SIZES){
  const H=await open({w,h,mobile:true,dpr:1,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off'}}));`});const {ev,wait,page}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=4321;A.G.stage=1;
    ['brann','sable','tess'].forEach(id=>{if(!A.G.roster[id]){A.G.roster[id]=A.newChar(id,3,0);}});['w_blade_0','a_mail_0','k_cape_0','c_vital','w_staff_1'].forEach(g=>A.G.gear.push(g));
    ['healroot','oak','copper','fang'].forEach(k=>A.G.mats[k]=4);A.render();});await wait(400);
  for(const [n,m,dd] of SCREENS){if(only&&!n.includes(only))continue;
    await ev(m=>{__A.V.modal=JSON.parse(JSON.stringify(m));__A.render();},m);await wait(250);
    await page.screenshot({path:`${OUT}/${tag}-${n}.png`});
    if(dd){const ok=await ev(dd=>{const s=[...document.querySelectorAll('#modal select[data-chg]')].find(x=>x.dataset.pre===dd)||document.querySelector('#modal select[data-chg]');if(!s)return false;
      s.size=Math.min(8,s.options.length);s.style.position='relative';s.style.zIndex=5;s.style.height='auto';s.focus();s.scrollIntoView({block:'center'});return true;},dd);
      if(ok){await wait(150);await page.screenshot({path:`${OUT}/${tag}-${n}-dropdown.png`});}}
  }
  await H.browser.close();}
  console.log('shots in',OUT);process.exit(0);})();
