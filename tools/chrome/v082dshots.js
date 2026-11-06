// v0.8.2 themed dungeons and boss lairs: screenshots to tools/chrome/shots-v082d/ (ignored by git).
// For every realm (the six old zones and the sixteen realms) at stage 1: the main dungeon (a room near the stairs and the boss room) and
// the lair entrance on the field (and the relit lair), on Low (2D) and Medium (HD-2D), at 933x705 and 390x844.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v082dshots.js [tag] [only realm keys, comma separated] [sizes: fold,phone]
const {open}=require('./pw');const fs=require('fs');const path=require('path');
const OUT=path.join(__dirname,'shots-v082d');fs.mkdirSync(OUT,{recursive:true});
const TAG=process.argv[2]||'after',ONLY=(process.argv[3]||'').split(',').filter(Boolean),SIZES=(process.argv[4]||'fold,phone').split(',');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:true,hints:false,minimap:true}}));(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const SZ={fold:[933,705],phone:[390,844]};
(async()=>{
  for(const tier of ['low','medium'])for(const sz of SIZES){const [w,h]=SZ[sz];
    const H=await open({w,h,mobile:true,dpr:1,pre:META(tier)});const {ev,wait,page}=H;const errs=[];page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource/.test(m.text()))errs.push(m.text());});
    await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=424242;A.resetMaps();A.render();});await wait(500);
    const realms=await ev(()=>__A.ZONES.map((z,i)=>({i,key:z.key||('zone'+i),n:z.dungeon,th:z.theme})));
    const view=async n=>{const el=await page.$('.wview');if(el)await el.screenshot({path:path.join(OUT,n+'.png')});else{console.log('no world view for',n,await ev(()=>__A.V.screen+' '+(__A.V.modal&&__A.V.modal.type)));await page.screenshot({path:path.join(OUT,n+'.png')});}};
    for(const R of realms){if(ONLY.length&&!ONLY.includes(R.key))continue;const s=1;
      const setup=await ev(([i,s,T])=>{const A=__A,G=A.G;G.run.order[s]=i;G.cleared[s]=0;A.resetMaps();A.G.clock=150;A.G.weather[s]='clear';const d=A.getMap('d'+s),f=A.getMap('f'+s);d.roam=[];
        // a roomy spot near the stairs, and one south of the boss
        const open=(x,y)=>{let n=0;for(let j=-3;j<=3;j++)for(let k=-4;k<=4;k++)if(!A.solidAt(d,x+k,y+j))n++;return n;};
        let best=null,bs=-1;for(let y=d.start[1]-6;y<=d.start[1]+6;y++)for(let x=d.start[0]-2;x<=d.start[0]+10;x++){if(y<1||x<1||y>=d.h-1||x>=d.w-1||A.solidAt(d,x,y))continue;const v=open(x,y)-Math.abs(x-d.start[0]-4)*.3;if(v>bs){bs=v;best=[x,y];}}
        let boss=null;for(let y=0;y<d.h&&!boss;y++)for(let x=0;x<d.w;x++)if(d.t[y][x]==='D'){for(const dx of [3,2,4,1])if(!A.solidAt(d,x-dx,y)){boss=[x-dx,y];break;}break;}
        let lair=null;if(f.ent){for(const dy of (T==='low'?[3,4,2,5]:[5,6,4,3,2]))if(!A.solidAt(f,f.ent[0],f.ent[1]+dy)){lair=[f.ent[0],f.ent[1]+dy];break;}}
        let pool=null;for(let y=2;y<d.h-3&&!pool;y++)for(let x=2;x<d.w-2;x++)if(d.t[y][x]==='~'&&!A.solidAt(d,x,y+2)&&!A.solidAt(d,x,y+1)){pool=[x,y+2];break;}
        return {best,boss,lair,pool};},[R.i,s,tier]);
      const shot=async(name,fn,arg)=>{await ev(fn,arg);await wait(tier==='low'?500:1100);await view(`${TAG}_${R.key}_${name}_${tier}_${sz}`);};
      if(setup.best)await shot('dun',([s,p])=>{const A=__A;A.V.modal=null;A.WS.dlg=null;A.placeAt('d'+s,p[0],p[1],'d');A.render();},[s,setup.best]);
      if(setup.pool)await shot('pool',([s,p])=>{const A=__A;A.V.modal=null;A.WS.dlg=null;A.placeAt('d'+s,p[0],p[1],'u');A.render();},[s,setup.pool]);
      if(setup.boss)await shot('boss',([s,p])=>{const A=__A;A.V.modal=null;A.WS.dlg=null;A.placeAt('d'+s,p[0],p[1],'u');A.render();},[s,setup.boss]);
      if(setup.lair){await shot('lair',([s,p])=>{const A=__A;A.V.modal=null;A.WS.dlg=null;A.G.cleared[s]=0;A.placeAt('f'+s,p[0],p[1],'u');A.render();},[s,setup.lair]);
        await shot('lairlit',([s,p])=>{const A=__A;A.V.modal=null;A.WS.dlg=null;A.G.cleared[s]=1;A.resetMaps();A.placeAt('f'+s,p[0],p[1],'u');A.render();},[s,setup.lair]);
        await ev(s=>{__A.G.cleared[s]=0;__A.resetMaps();},s);}
      console.log('shot',R.key,tier,sz,JSON.stringify(setup));}
    console.log('errors',errs.slice(0,3));await H.browser.close();}
  console.log('shots in',OUT);process.exit(0);
})();
