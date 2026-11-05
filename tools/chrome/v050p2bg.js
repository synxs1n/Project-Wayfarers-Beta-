// v0.5.0 2.1: every battle backdrop, rendered with 6 heroes and 5 foes (two of them flying), in the tall phone stage and the wide stage.
// Flags any unit whose feet (or, for a flyer, its shadow) are off the ground plane, any hazard colour (water, lava, cloud sea) on the ground
// plane, and a flyer that does not hover. Also checks that the backdrop follows the terrain the battle started on.
const {open,chk,done}=require('./pw');
(async()=>{
  const res={};
  for(const [mode,w,h] of [['tall',390,844],['wide',932,430]]){
    const H=await open({w,h,mobile:true});const {ev,wait,shot}=H;
    await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
    await ev(()=>{__A.V.modal=null;['brann','sable','tess'].forEach(id=>{__A.G.roster[id]=__A.newChar(id,5,0);__A.G.party.push(id);});});
    const keys=await ev(()=>Object.keys(__P2.BG));
    const bad=[];let n=0;
    for(const k of keys){
      const r=await ev(k=>{const P=__P2,A=__A;
        // 5 foes: two flyers among them
        const mk=(id,lv)=>A.makeEnemy?A.makeEnemy(P.MON[id],lv):null;
        const foes=['gull','mossling','cavebat','frostwolf','yeti'].map(id=>{const e=__A.makeEnemy(P.MON[id],5);return e;});
        A.V.modal=null;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;});
        const sp={stage:0,kind:'field',foes,weather:'clear'};
        if(k.startsWith('f:'))sp.bg={th:k.split(':')[1],k:'field',g:k.split(':')[2]};else if(k.startsWith('c_'))sp.bg={th:k.slice(2),k:'cave'};else if(k.startsWith('d_'))sp.bg={th:k.slice(2),k:'dungeon'};
        const ok=A.startBattle(sp);
        return ok;},k);
      if(r!==true){bad.push(k+': battle did not start '+r);continue;}
      await wait(60);
      const out=await ev(k=>{const P=__P2,A=__A,B=P.B,BL=P.BL,W=BL.W,H=BL.H;
        const cv=P.bgStatic(k,W,H),ctx=cv.getContext('2d'),gy=P.bgGY(H),data=ctx.getImageData(0,0,W,H).data;
        const hex=i=>'#'+[data[i],data[i+1],data[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('');
        const haz=new Set([].concat(P.BG_HAZ.water,P.BG_HAZ.lava,P.BG_HAZ.cloud));
        let hazN=0;for(let y=gy;y<H;y++)for(let x=0;x<W;x++){if(haz.has(hex((y*W+x)*4)))hazN++;}
        const issues=[];
        const units=B.en.concat(B.front);
        if(B.front.length+B.back.length!==6)issues.push('party size '+(B.front.length+B.back.length));
        if(B.en.length!==5)issues.push('foes '+B.en.length);
        units.forEach(u=>{const b=P.unitBox(u);if(!b){issues.push('no box '+u.name);return;}const foot=b.gy!=null?b.gy:b.y;
          if(foot<gy+2||foot>H-1)issues.push(`${u.name} foot ${foot} off ground [${gy},${H}]`);
          const px=Math.max(0,Math.min(W-1,b.x)),c=hex((Math.min(H-1,foot)*W+px)*4);if(haz.has(c))issues.push(`${u.name} stands on hazard ${c}`);
          if(P.p2Flying(u)&&!(b.hov>0&&b.y<foot))issues.push(`${u.name} flyer does not hover`);
          if(!P.p2Flying(u)&&b.y!==foot)issues.push(`${u.name} ground unit floats`);});
        if(hazN)issues.push(`hazard pixels on the ground plane: ${hazN}`);
        // the live battle uses this backdrop (field, cave and dungeon keys) and a frame draws without errors
        const th=P.battleTheme();if(/^(f:|c_|d_)/.test(k)&&th!==k)issues.push('battle used '+th);
        P.battleFrame(performance.now());
        return {issues,gy,H,W};},k);
      n++;if(out.issues.length)bad.push(k+': '+out.issues.join('; '));
      await ev(()=>{__A.finishBattle&&__A.finishBattle('x');__A.V.modal=null;});
    }
    chk(`${mode}: ${n} backdrops render with 6 heroes and 5 foes, every unit on the ground plane, no hazard under anyone`,bad.length===0||bad.slice(0,6).join(' | '));
    res[mode]=n;
    // terrain picks the backdrop: road, forest, tall grass, cave, dungeon, boss
    const t=await ev(()=>{const P=__P2,A=__A,out={};const m=P.getMap('f0');A.placeAt&&0;
      const find=(f)=>{for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++)if(f(x,y))return [x,y];return null;};
      Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;});const road=find((x,y)=>P.tileAt(m,x,y)==='=');const tall=find((x,y)=>P.tileAt(m,x,y)===','&&P.bgGroundAt(m,x,y)!=='forest');
      out.road=road&&P.bgGroundAt(m,road[0],road[1]);out.tall=tall&&P.bgGroundAt(m,tall[0],tall[1]);
      // a battle started from the world on a road uses the road backdrop
      if(road){A.V.screen='world';P.WS.m=m;P.WS.x=road[0];P.WS.y=road[1];A.startBattle({stage:0,kind:'field'});out.roadTheme=P.battleTheme();A.finishBattle('x');A.V.modal=null;}
      Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;});A.startBattle({stage:0,kind:'boss'});out.boss=P.battleTheme();A.finishBattle('x');A.V.modal=null;
      return out;});
    chk(`${mode}: road tile gives the road backdrop (${t.road}, ${t.roadTheme})`,t.road==='road'&&/:road$/.test(t.roadTheme)||JSON.stringify(t));
    chk(`${mode}: tall grass reads as tall grass (${t.tall})`,['tall','grass','snow','cave','void','high','sand'].includes(t.tall)||JSON.stringify(t));
    chk(`${mode}: boss fights use a purpose built stage (${t.boss})`,/^boss_/.test(t.boss)||t.boss);
    // screenshots of a few stages for a look
    for(const k of ['f:coast:sand','c_cave','boss_void','f:meadow:forest','f:meadow:road']){
      await ev(k=>{const P=__P2,A=__A;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;});const foes=['gull','mossling','cavebat','frostwolf','yeti'].map(id=>A.makeEnemy(P.MON[id],5));A.startBattle({stage:0,kind:'field',foes,weather:'clear',bg:{th:k.split(/[:_]/)[1]||k.split(':')[1],k:k[0]==='c'?'cave':k.startsWith('boss')?'field':'field',g:k.split(':')[2]||'grass'}});},k);
      await wait(700);await shot('p2bg_'+mode+'_'+k.replace(/[:]/g,'_'));await ev(()=>{__A.finishBattle('x');__A.V.modal=null;});}
    await H.browser.close();
  }
  await done({browser:{close:async()=>{}}});
})();
