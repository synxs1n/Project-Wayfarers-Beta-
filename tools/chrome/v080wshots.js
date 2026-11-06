// v0.8.0 weather and title pass: screenshots to tools/chrome/shots-v080w/ (ignored by git).
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v080wshots.js <prefix> [tiers] [groups]
//   tiers: comma list of low,medium,high (default medium,high); groups: bt,wx,title (default all)
const {open}=require('./pw');const fs=require('fs');const path=require('path');
const OUT=path.join(__dirname,'shots-v080w');fs.mkdirSync(OUT,{recursive:true});
const PRE=process.argv[2]||'after',TIERS=(process.argv[3]||'medium,high').split(','),ONLY=process.argv[4]||'bt,wx,title',WXO=process.env.WX?process.env.WX.split(','):null;
const META=(t,hd)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false,tips:false,hd2d:${hd!==false}}}));(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const want=g=>ONLY.split(',').includes(g);
async function boot(t,w,h,hd,dpr){const H=await open({w,h,mobile:true,dpr:dpr||2,pre:META(t,hd)});
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.wait(600);return H;}
const file=n=>path.join(OUT,PRE+'_'+n+'.png');
const FIELD=`(th,wx,clock)=>{const A=__A;let id=null;for(let s=0;s<16&&!id;s++){try{const m=A.getMap('f'+s);if(!th||m.theme===th)id='f'+s;}catch(e){}}if(!id)id='f0';const m=A.getMap(id);
  A.G.clock=clock;A.G.weather[m.s]=wx;let best=null;for(let y=6;y<m.h-6&&!best;y++)for(let x=6;x<m.w-8;x++){let ok=true;for(let j=-2;j<=2&&ok;j++)for(let i=-3;i<=3&&ok;i++)if(A.solidAt(m,x+i,y+j))ok=false;if(ok){best=[x,y];break;}}
  if(!best)best=Object.values(m.gates)[0].arrive;A.V.modal=null;A.placeAt(id,best[0],best[1],'d');A.TR.ph=null;A.TR.wx.key=null;A.render();return {id,th:m.theme};}`;
const WX=WXO||['fog','rain','storm','snow','blizzard','gale','sand','heat','ashfall','aurora','starfall','meteor','bloodmoon','eclipse','surge_water'];
const TH={fog:'meadow',rain:'meadow',storm:'meadow',snow:'snow',blizzard:'snow',gale:'heights',sand:'coast',heat:'cave',ashfall:'cave',aurora:'snow',starfall:'void',meteor:'cave',bloodmoon:'meadow',eclipse:'meadow',surge_water:'coast'};
const NIGHT={fog:1,rain:1,snow:1,aurora:1,starfall:1,meteor:1,bloodmoon:1};
(async()=>{
  for(const T of TIERS){
    if(want('bt')){const H=await boot(T,933,705);const {ev,wait,page}=H;
      for(const wx of WX)for(const clock of NIGHT[wx]?[300,700]:[300]){
        await ev(([wx,clock,th])=>{const A=__A;A.V.modal=null;A.G.clock=clock;const sp={stage:0,kind:'field',weather:wx,bg:{th,k:'field',g:th==='snow'?'snow':'grass'}};sp.foes=['gull','mossling','frostwolf'].map(id=>A.makeEnemy(A.MON[id],5));try{A.startBattle(sp);}catch(e){return String(e);}},[wx,clock,TH[wx]]);
        await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
        await ev(()=>{const B=__A.B;if(B)B.en.concat(B.front).forEach(u=>{u.S.mhp=u.hp=Math.max(u.hp,99999);});});await wait(900);
        const el=await page.$('#bstage')||null;if(el)await el.screenshot({path:file(`bt_${wx}_${clock===700?'night':'day'}_${T}`)});else await page.screenshot({path:file(`bt_${wx}_${T}`)});
        await ev(()=>{try{__A.finishBattle('x');}catch(e){}__A.V.modal=null;});await wait(200);}
      await H.browser.close();}
    if(want('wx'))for(const hd of (T==='low'?[false]:[true,false])){const H=await boot(T,933,705,hd);const {ev,wait,page}=H;
      for(const wx of WX)for(const clock of NIGHT[wx]?[150,700]:[150]){await ev(`(${FIELD})(${JSON.stringify(TH[wx])},${JSON.stringify(wx)},${clock})`);await wait(1500);
        const el=await page.$('.wview');const n=`wx_${wx}_${clock===700?'night':'day'}_${T}${hd?'_hd':'_2d'}`;if(el)await el.screenshot({path:file(n)});else await page.screenshot({path:file(n)});}
      await H.browser.close();}
    if(want('title'))for(const [w,h,mob] of [[800,600],[1024,768],[1280,720],[1920,1080],[390,844,1],[844,390,1],[933,705,1]]){
      const H=await open({w,h,mobile:!!mob,dpr:mob?2:1,pre:META(T)});await H.wait(2500);await H.page.screenshot({path:file(`title_${w}x${h}_${T}`)});
      if(w===1280){await H.wait(9000);await H.page.screenshot({path:file(`title_${w}x${h}_${T}_t2`)});}await H.browser.close();}
  }
  console.log('shots in',OUT);process.exit(0);
})();
