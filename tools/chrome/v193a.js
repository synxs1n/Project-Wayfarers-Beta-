// early17.js (docs/early17.md): a gentle start in the grass of the first field of the first realm.
//  1 over every realm that can come first (thistle, orchard, strand, lakes, moors) and SEEDS maps of each (old plans and the four-sided plans of
//    world16): the field has a near, a middle and a far band by walking distance from the entrance (the entrance is near, the far gate is far);
//    near grass: foes of level 2 to 3 and never above the party's lowest level, one or two of them, no elite, no boss, single types;
//    middle grass: level 3 to 5 and at most one above the party's lowest level, up to three;
//    far grass: the very same fight as with the module switched off (same seed, same foes, levels, HP and attack);
//    roamers: the same places and monsters as with the module off; none is elite in the near and middle bands; a near roamer leads at level 4,
//    a middle one at level 6 (with one mate at most), a far one fights exactly as with the module off
//  2 where it does not apply, the fight is the one the module off gives: New Game+, after the first Scourge, the second realm's field, a fight
//    started from the town, the Mimic; spec.e17 names a band for the sims; the party's lowest level caps the near foes; at night the near rules hold
//  3 nothing is saved (no key in the save, the distance map is not enumerable) and no error was caught
//  4 a fresh party of three from the starter pool at level 3 against near grass with the game's auto (tools/fullsim.js early): wins 97% or
//    more, loses under 35% of its HP on average, in 1.3 to 4 rounds; the middle band is a step up (more foe HP per fight) and still won 95%+
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v193a.js   (SEEDS=8 maps per realm, SIMN=120 fights per row, NOSIM=1 skips 4)
const {open,chk,done}=require('./pw');const path=require('path'),{execFileSync}=require('child_process');
const SEEDS=+process.env.SEEDS||8,SIMN=+process.env.SIMN||120;
setTimeout(()=>{console.log('FAIL watchdog: v193a ran over 900 s');process.exit(1);},900000).unref();
(async()=>{const H=await open({freeze:true,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'low',rmotion:true,hints:false,tips:false}}));`});
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
  const R=await H.det(SEEDS=>{const A=__A,G=A.G,E=window.__E17,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z&&z.key,i]));const FIRST=['thistle','orchard','strand','lakes','moors'];
    const sig=L=>L.map(e=>[e.name,e.lv,e.S.mhp,Math.round(e.S.atk*100),Math.round(e.S.mag*100),e.elite?1:0,e.el.join('+')].join(':')).join('|');
    const off=f=>{E.off=1;try{return f();}finally{E.off=0;}};
    const spawn=m=>{m.roam=null;delete m.__w14ro;return (A.roamSpawn(m)||[]).map(r=>({i:r.i,hx:r.hx,hy:r.hy,mon:r.mon,elite:!!r.elite,mod:r.mod||null,name:r.name,gone:!!r.gone}));};
    const o={maps:0,rev3:0,bad:[],tiles:[0,0,0],near:{n:0,lv:{},pk:{}},mid:{n:0,lv:{},pk:{}},far:{n:0,same:0},roam:{n:[0,0,0],el0:[0,0,0],el1:[0,0,0],same:0,far:0,farSame:0,lead:{0:{},1:{}},softened:0},entry:0,end:0};
    const bad=(w)=>{if(o.bad.length<12)o.bad.push(w);};
    const lo=Math.min(...G.party.map(id=>G.roster[id].lv));o.lo=lo;
    for(const key of FIRST)for(let k=0;k<SEEDS;k++){G.run.order[0]=zi[key];G.run.seed=31000+k*7919+zi[key]*101;G.dunRev=k%2?3:2;if(k%2)o.rev3++;A.resetMaps();try{A.syncPools();}catch(e){}
      const m=A.getMap('f0'),tag=key+'#'+k,c=E.api.dist(m),en=A.mapEntry(m);o.maps++;
      if(E.api.bandAt(m,en[0],en[1])===0)o.entry++;else bad(tag+' entrance not near');
      const g=m.gates&&m.gates.end&&m.gates.end.arrive;if(g&&E.api.bandAt(m,g[0],g[1])===2)o.end++;else bad(tag+' far gate not in the far band');
      const T=[[],[],[]];for(let y=0;y<c.H;y++)for(let x=0;x<c.W;x++)if(m.t[y][x]===','&&c.D[x+y*c.W]>=0)T[E.api.bandAt(m,x,y)].push([x,y]);
      T.forEach((L,b)=>{o.tiles[b]+=L.length;if(!L.length)bad(tag+' no grass in band '+b);});
      const some=(L,n)=>{const out=[];for(let i=0;i<n&&L.length;i++)out.push(L[Math.floor((i+.5)*L.length/n)]);return out;};
      some(T[0],8).forEach(([x,y],ti)=>{A.placeAt(m.id,x,y,'u');for(let j=0;j<10;j++){const L=E.api.foes({stage:0,kind:'field'},k*1000+ti*50+j);o.near.n++;o.near.pk[L.length]=(o.near.pk[L.length]||0)+1;
        if(L.length<1||L.length>2)bad(tag+' near pack of '+L.length);L.forEach(e=>{o.near.lv[e.lv]=(o.near.lv[e.lv]||0)+1;if(e.lv<1||e.lv>3||e.lv>lo)bad(tag+' near level '+e.lv);if(e.elite||e.boss||e.mod)bad(tag+' near elite');if(e.el.length!==1)bad(tag+' near dual type');if(e.e17!==1)bad(tag+' near untagged');});
        if(new Set(L.map(e=>e.name)).size!==L.length)bad(tag+' near names repeat');if(L.length===1&&L[0].name!==L[0].base)bad(tag+' near single keeps a letter: '+L[0].name);}});
      some(T[1],8).forEach(([x,y],ti)=>{A.placeAt(m.id,x,y,'u');for(let j=0;j<10;j++){const L=E.api.foes({stage:0,kind:'field'},k*1000+ti*50+j+7);o.mid.n++;o.mid.pk[L.length]=(o.mid.pk[L.length]||0)+1;
        if(L.length<1||L.length>3)bad(tag+' middle pack of '+L.length);L.forEach(e=>{o.mid.lv[e.lv]=(o.mid.lv[e.lv]||0)+1;if(e.lv<3||e.lv>5||e.lv>lo+1)bad(tag+' middle level '+e.lv);if(e.elite||e.boss)bad(tag+' middle elite');if(e.el.length!==1)bad(tag+' middle dual type');});}});
      some(T[2],8).forEach(([x,y],ti)=>{A.placeAt(m.id,x,y,'u');for(let j=0;j<6;j++){const s=k*1000+ti*50+j+13,a=sig(E.api.foes({stage:0,kind:'field'},s)),b=off(()=>sig(E.api.foes({stage:0,kind:'field'},s)));o.far.n++;if(a===b)o.far.same++;else bad(tag+' far differs: '+a+' / '+b);}});
      // roamers (the party stands at the entrance for both spawns)
      A.placeAt(m.id,en[0],en[1],'d');const r0=off(()=>spawn(m)),r1=spawn(m);
      if(JSON.stringify(r0.map(r=>[r.i,r.hx,r.hy,r.mon,r.gone]))===JSON.stringify(r1.map(r=>[r.i,r.hx,r.hy,r.mon,r.gone])))o.roam.same++;else bad(tag+' roamers moved');
      r1.forEach((r,i)=>{if(r.gone)return;const b=E.api.bandAt(m,r.hx,r.hy),q=r0[i];o.roam.n[b]++;if(q.elite)o.roam.el0[b]++;if(r.elite)o.roam.el1[b]++;if(q.elite&&!r.elite)o.roam.softened++;
        if(b<2&&r.elite)bad(tag+' elite roamer in band '+b);if(b===2&&JSON.stringify(q)!==JSON.stringify(r))bad(tag+' far roamer changed');
        const spec={stage:0,kind:'field',roam:{mid:m.id,i:r.i,mon:r.mon,elite:r.elite,mod:r.mod,name:r.name}},L=E.api.foes(spec,k*77+i);
        if(b<2){o.roam.lead[b][L[0].lv]=(o.roam.lead[b][L[0].lv]||0)+1;if(L.length>2)bad(tag+' band '+b+' roamer with '+L.length+' foes');if(L.some(e=>e.elite))bad(tag+' band '+b+' roamer fight has an elite');if(L.slice(1).some(e=>e.lv>L[0].lv))bad(tag+' roamer mate above the lead');}
        else{o.roam.far++;const s2={stage:0,kind:'field',roam:{mid:m.id,i:q.i,mon:q.mon,elite:q.elite,mod:q.mod,name:q.name}};const a=sig(L),bb=off(()=>{const keep=m.roam;const x=sig(E.api.foes(s2,k*77+i));m.roam=keep;return x;});if(a===bb)o.roam.farSame++;else bad(tag+' far roamer fight differs: '+a+' / '+bb);}});}
    // ----- 2: where it does not apply -----
    G.run.order[0]=zi.thistle;G.run.seed=4242;G.dunRev=2;A.resetMaps();try{A.syncPools();}catch(e){}const m=A.getMap('f0'),c=E.api.dist(m);let nt=null;
    for(let y=0;y<c.H&&!nt;y++)for(let x=0;x<c.W;x++)if(m.t[y][x]===','&&c.D[x+y*c.W]>=0&&E.api.bandAt(m,x,y)===0){nt=[x,y];break;}
    A.placeAt(m.id,nt[0],nt[1],'u');const same=(spec,n)=>{let ok=0;for(let j=0;j<(n||12);j++){if(sig(E.api.foes(Object.assign({},spec),900+j))===off(()=>sig(E.api.foes(Object.assign({},spec),900+j))))ok++;}return ok;};
    const x2={};x2.nearDiffers=12-same({stage:0,kind:'field'});
    G.run.cycle=1;x2.ngp=same({stage:0,kind:'field'});G.run.cycle=0;
    G.cleared[0]=true;x2.cleared=same({stage:0,kind:'field'});G.cleared[0]=false;
    x2.mimic=same({stage:0,kind:'field',mimic:1});x2.stage1=same({stage:1,kind:'field'});x2.dungeon=same({stage:0,kind:'dungeon'});
    // the party's lowest level caps the near foes
    const h=G.roster[G.party[0]],lv0=h.lv;h.lv=2;let top=0;for(let j=0;j<30;j++)E.api.foes({stage:0,kind:'field'},j).forEach(e=>{top=Math.max(top,e.lv);});x2.cap2=top;
    h.lv=1;top=0;for(let j=0;j<30;j++)E.api.foes({stage:0,kind:'field'},j).forEach(e=>{top=Math.max(top,e.lv);});x2.cap1=top;h.lv=lv0;
    // at night
    const ck=G.clock;let night=false;for(let t=0;t<4000&&!night;t+=5){G.clock=t;night=E.api.isNight();}x2.night=night;x2.nightBad=0;x2.nightN=0;
    if(night)for(let j=0;j<40;j++){const L=E.api.foes({stage:0,kind:'field'},j);if(L.length>2||L.some(e=>e.lv>3||e.elite||e.el.length!==1))x2.nightBad++;x2.nightN+=L.filter(e=>e.night).length;}G.clock=ck;
    // the second realm's field, standing at its entrance
    const f1=A.getMap('f1'),e1=A.mapEntry(f1);A.placeAt(f1.id,e1[0],e1[1],'d');x2.f1=same({stage:1,kind:'field'});x2.f1band=E.api.band({stage:1,kind:'field'});
    // from the town: untouched; spec.e17 picks the band
    const t0=A.getMap('t0'),te=A.mapEntry(t0);A.placeAt(t0.id,te[0],te[1],'d');x2.town=same({stage:0,kind:'field'});
    let tb=0;for(let j=0;j<30;j++){const L=E.api.foes({stage:0,kind:'field',e17:0},j);if(L.length>2||L.some(e=>e.lv>3))tb++;}x2.e17spec=tb;x2.e17far=same({stage:0,kind:'field',e17:2});
    // ----- 3 -----
    x2.saved=/e17/i.test(JSON.stringify(G));x2.enum=Object.keys(m).includes('__e17');x2.err=E.err.slice();x2.count=Object.assign({},E.n);
    o.x=x2;return o;},SEEDS,193);
  const n=5*SEEDS;console.log(JSON.stringify(R,null,0).slice(0,1600));
  chk(`${R.maps} first fields (5 realms x ${SEEDS} seeds, ${R.rev3} on the four-sided plan): the entrance is in the near band and the far gate in the far band on every one`,R.entry===n&&R.end===n||`${R.entry} / ${R.end} of ${n}`);
  chk(`grass in every band of every field (tiles near/middle/far ${R.tiles.join('/')})`,R.tiles.every(t=>t>0)&&!R.bad.some(b=>/no grass/.test(b))||R.bad.join('; '));
  chk(`near grass, ${R.near.n} fights: one or two foes (${JSON.stringify(R.near.pk)}), level 2 to 3 and never above the party's lowest (${R.lo}) (${JSON.stringify(R.near.lv)}), no elite, single types, names in order`,R.near.n>0&&!R.bad.some(b=>/ near /.test(b))||R.bad.filter(b=>/ near /.test(b)).join('; '));
  chk(`near grass: both pack sizes turn up, pairs most often`,(R.near.pk[1]||0)>R.near.n*.2&&(R.near.pk[2]||0)>R.near.n*.5||JSON.stringify(R.near.pk));
  chk(`middle grass, ${R.mid.n} fights: up to three foes (${JSON.stringify(R.mid.pk)}), level 3 to 5 and at most one above the party's lowest (${JSON.stringify(R.mid.lv)}), no elite, single types`,R.mid.n>0&&!R.bad.some(b=>/ middle /.test(b))||R.bad.filter(b=>/ middle /.test(b)).join('; '));
  chk(`far grass, ${R.far.n} fights: each the same fight as with the module off`,R.far.n>0&&R.far.same===R.far.n||R.bad.filter(b=>/far differs/.test(b)).join('; '));
  chk(`roamers: the same places and monsters as with the module off on ${R.roam.same}/${n} fields`,R.roam.same===n||R.bad.filter(b=>/moved/.test(b)).join('; '));
  chk(`roamers near/middle/far ${R.roam.n.join('/')}: elites with the module off ${R.roam.el0.join('/')}, with it on ${R.roam.el1.join('/')} (none in the near and middle bands, the far band as before; ${R.roam.softened} made plain)`,R.roam.el1[0]===0&&R.roam.el1[1]===0&&R.roam.el1[2]===R.roam.el0[2]&&R.roam.softened===R.roam.el0[0]+R.roam.el0[1]||JSON.stringify(R.roam));
  chk(`roamer fights: a near roamer leads at level 4 (${JSON.stringify(R.roam.lead[0])}), a middle one at level 6 (${JSON.stringify(R.roam.lead[1])}), two foes at most, no elite`,Object.keys(R.roam.lead[0]).every(l=>+l===4)&&Object.keys(R.roam.lead[1]).every(l=>+l===6)&&!R.bad.some(b=>/roamer (with|fight has|mate)/.test(b))||JSON.stringify(R.roam.lead)+R.bad.join('; '));
  chk(`far roamers: ${R.roam.far} fights, each the same as with the module off`,R.roam.far>0&&R.roam.farSame===R.roam.far||R.bad.filter(b=>/far roamer/.test(b)).join('; '));
  chk('nothing else flagged',R.bad.length===0||R.bad.join('; '));
  const X=R.x;
  chk(`near grass really differs from the module off (${X.nearDiffers}/12 seeded fights)`,X.nearDiffers>=9||X.nearDiffers);
  chk(`unchanged where it does not apply (12 seeded fights each the same as with the module off): New Game+ ${X.ngp}, after the first Scourge ${X.cleared}, the Mimic ${X.mimic}, a dungeon fight ${X.dungeon}, stage 2 ${X.stage1}`,[X.ngp,X.cleared,X.mimic,X.dungeon,X.stage1].every(v=>v===12)||JSON.stringify(X));
  chk(`the second realm's field at its entrance: band ${X.f1band} (far = untouched), ${X.f1}/12 the same`,X.f1band===2&&X.f1===12||JSON.stringify(X));
  chk(`a fight started from the town is untouched (${X.town}/12); spec.e17 0 gives near foes there (${X.e17spec} over the limits), spec.e17 2 the old fight (${X.e17far}/12)`,X.town===12&&X.e17spec===0&&X.e17far===12||JSON.stringify(X));
  chk(`the party's lowest level caps near foes: top level ${X.cap2} with a level 2 hero, ${X.cap1} with a level 1 hero`,X.cap2===2&&X.cap1===1||JSON.stringify(X));
  chk(`at night the near rules hold (night found ${X.night}, ${X.nightBad} over the limits, ${X.nightN} night foes)`,X.night&&X.nightBad===0||JSON.stringify(X));
  chk(`nothing saved (no e17 key in the save: ${!X.saved}; the distance map is not enumerable: ${!X.enum}); no error caught (${X.err.length}); fights counted ${JSON.stringify(X.count)}`,!X.saved&&!X.enum&&X.err.length===0||JSON.stringify(X.err));
  // a real battle started from near grass (the screen builds, no page error)
  const RB=await H.ev(()=>{const A=__A,E=window.__E17,m=A.getMap('f0'),c=E.api.dist(m);let nt=null;for(let y=0;y<c.H&&!nt;y++)for(let x=0;x<c.W;x++)if(m.t[y][x]===','&&c.D[x+y*c.W]>=0&&E.api.bandAt(m,x,y)===0){nt=[x,y];break;}
    A.placeAt(m.id,nt[0],nt[1],'u');A.V.modal=null;A.setPause(5);const ok=A.startBattle({stage:0,kind:'field'});return {ok,screen:A.V.screen,en:A.B.en.map(e=>[e.name,e.lv,e.e17||0]),last:E.last};});
  await H.frames(5);
  chk(`a battle started from near grass: ${JSON.stringify(RB.en)} (one or two foes, level 3 at most, tagged near), the battle screen is up`,RB.ok!==false&&RB.screen==='battle'&&RB.en.length>=1&&RB.en.length<=2&&RB.en.every(e=>e[1]<=3&&e[2]===1)||JSON.stringify(RB));
  // ----- 4: the fights themselves (the journey sim's own loop on the real modules) -----
  if(!process.env.NOSIM){const root=path.join(__dirname,'..','..');
    const out=execFileSync('node',[path.join(root,'tools','fullsim.js'),'early',String(SIMN)],{cwd:root,env:Object.assign({},process.env,{SEED:process.env.SEED||'1',EARLY_ONLY:'1',EARLY_LV:'3',MAPSEEDS:'2'}),maxBuffer:16<<20,timeout:600000}).toString();
    const row=w=>{const l=out.split('\n').find(l=>l.includes('party lv 3 auto')&&l.includes(w))||'';const num=re=>{const q=re.exec(l);return q?+q[1]:NaN;};
      return {l,win:num(/win ([\d.]+)%/),hp:num(/HP lost (\d+)%/),over:num(/over 35% in (\d+)%/),rounds:num(/rounds ([\d.]+)/),fhp:num(/foe HP per fight (\d+)/)};};
    const a=row('near third'),b=row('middle third');console.log(a.l);console.log(b.l);
    chk(`a fresh party of three (level 3, starter pool, auto) in near grass, ${SIMN} fights: wins ${a.win}% (97+), loses ${a.hp}% of its HP on average (under 35; over 35% in ${a.over}% of fights, 15 at most), ${a.rounds} rounds (1.3 to 4)`,a.win>=97&&a.hp<35&&a.over<=15&&a.rounds>=1.3&&a.rounds<=4||a.l);
    chk(`the middle band is a step up (foe HP per fight ${b.fhp} over ${a.fhp}; ${b.rounds} rounds over ${a.rounds}) and still won (${b.win}%, 95+; HP lost ${b.hp}%)`,b.fhp>a.fhp&&b.rounds>a.rounds&&b.win>=95&&b.hp<35||b.l);}
  await done(H);})();
