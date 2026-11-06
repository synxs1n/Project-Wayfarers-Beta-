// Beta v0.8.0: personal quest rivals wait, see through, for their wayfarer (v3/rivalghost.js). Checks, at 390x844 and 933x705:
// with the hero out of the six the rival is a ghost (drawn at a lower alpha in 2D and in HD-2D), is not solid, never starts a
// battle when you bump it or walk through it, talking to it names the hero with their portrait, the minimap star is dimmed, and the
// Quests tab, the Personal quests row and Guides > What next? say "needs <hero> in your party"; with the hero in the six it draws
// normally, blocks the way and opens the fight. Nothing clipped, no page errors.
const {open,chk,done}=require('./pw');
const HERO='kage';
const META=g=>`(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${g}',minimap:true,hints:false}}));`;
async function boot(g,w,h,mob){const H=await open({w,h,mobile:mob,pre:META(g)});
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.hints=false;A.render();});await H.wait(400);
  // the rival on field f0, the hero on the roster but out of the six, the player beside the rival with a free tile beyond it
  const s=await H.ev(id=>{const A=__A,G=A.G;if(!G.roster[id])G.roster[id]=A.newChar(id,8,0);G.party=G.party.filter(x=>x!==id);
    const mon=A.MON['rv_'+id]?'rv_'+id:A.ZS(0).pool[0];const q={id:'p_'+id,personal:id,stage:0,mon,mod:A.TW.get('ELITE_MODS')[0].k,name:A.MON[mon].n,lv:5,state:'active',text:'A personal test quest.',reward:{}};G.personal[id]=q;
    const D=[['l',1,0],['r',-1,0],['u',0,1],['d',0,-1]];
    for(let st=0;st<5;st++){q.stage=st;const m=A.getMap('f'+st);G.weather[st]='clear';const a=A.dynActors(m).find(x=>x.b&&x.b.id===q.id);if(!a)continue;
      // stand beside the rival facing it, with the tile beyond it free to walk into after
      const ok=c=>!A.solidAt(m,c[0],c[1])&&!A.dynActors(m).some(o=>o!==a&&o.x===c[0]&&o.y===c[1])&&'.:=,f'.includes(A.tileAt(m,c[0],c[1]));
      for(const [dir,dx,dy] of D){const sx=a.x+dx,sy=a.y+dy,bx=a.x-dx,by=a.y-dy;if(ok([sx,sy])&&ok([bx,by])){const pick={dir,sx,sy,bx,by,mid:m.id};A.placeAt(m.id,sx,sy,dir);A.WS.dir=dir;A.render();return {a:[a.x,a.y],pick,qid:q.id};}}}
    return {nofree:1};},HERO);
  return Object.assign(H,{s});}
const clip=()=>{const bad=[];const W=innerWidth,Hh=innerHeight;const sel=document.querySelector('#modal .panel')?['#modal .panel']:[];
  const d=document.querySelector('#wdlg .dlg');if(d){const r=d.getBoundingClientRect();if(r.left<-1||r.right>W+1||r.top<-1||r.bottom>Hh+1)bad.push('dlg box '+[r.left,r.right,r.top,r.bottom].map(Math.round));
    d.querySelectorAll('span:not(.dlgpor),b').forEach(e=>{if(e.scrollWidth>e.clientWidth+1)bad.push('dlg wide: '+e.textContent.slice(0,30));const q=e.getBoundingClientRect();if(q.right>r.right+1||q.left<r.left-1)bad.push('dlg outside: '+e.textContent.slice(0,30));});}
  sel.forEach(s=>{const pan=document.querySelector(s),pr=pan.getBoundingClientRect();if(pr.left<-1||pr.right>W+1)bad.push('panel x');
    pan.querySelectorAll('small,b,p').forEach(e=>{if(e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible')bad.push('wide: '+e.textContent.slice(0,40));const r=e.getBoundingClientRect();if(r.width&&(r.left<pr.left-1||r.right>pr.right+1))bad.push('outside: '+e.textContent.slice(0,40));});});
  return bad;};
(async()=>{
for(const [w,h,mob] of [[390,844,true],[933,705,false]]){const tag=` (${w}x${h})`;
  // ---------- 2D (Low) ----------
  {const H=await boot('low',w,h,mob);const {ev,wait,s}=H;await ev(`window.__clipF=${clip}`);
    chk('setup: rival placed with free tiles around it'+tag,!!s.pick||JSON.stringify(s));
    const g=await ev(id=>{const A=__A,RG=window.__RG,m=A.WS.m,a=RG.actors().find(x=>x.b&&x.b.personal===id);RG.alpha.d2={};A.worldDraw2(performance.now());
      return {ghost:RG.ghost(a),solid:A.solidAt(m,a.x,a.y),alpha:RG.alpha.d2[a.b.id],hd:A.hdActive(),need:RG.need(a.b)};},HERO);
    chk('2D renderer in use'+tag,g.hd===false||'hd on');
    chk('hero out of the six: the rival is a ghost and needs '+HERO+tag,g.ghost===true&&g.need===HERO||JSON.stringify(g));
    chk('the ghost is drawn see through in 2D (about 45%)'+tag,g.alpha>.35&&g.alpha<.55||JSON.stringify(g));
    chk('the ghost does not block the path'+tag,g.solid===false||JSON.stringify(g));
    // minimap: hollow star, dimmed
    const mm=await ev(()=>{const A=__A,RG=window.__RG,P=CanvasRenderingContext2D.prototype,f0=P.fillText,seen=[];P.fillText=function(t,x,y){if(t==='☆'||t==='★')seen.push([t,this.globalAlpha,this.canvas.id]);return f0.apply(this,arguments);};
      try{A.drawMini();}finally{P.fillText=f0;}return {marks:RG.marks().filter(o=>/quest/.test(o.k)).map(o=>o.k),seen};});
    const gs=mm.seen.filter(x=>x[0]==='☆');
    chk('the map marks the rival with the hollow ghost star'+tag,mm.marks.includes('questghost')&&!mm.marks.includes('quest')||JSON.stringify(mm));
    chk('the minimap draws the ghost star dimmed'+tag,gs.length>0&&gs.every(x=>x[1]<.6)||JSON.stringify(mm));
    // talk (A while facing): the line names the hero, with their portrait, and no battle
    const t=await ev(id=>{const A=__A;A.interact();const d=document.querySelector('#wdlg .dlg'),img=d&&d.querySelector('.dlgpor img');
      return {txt:d&&d.textContent,img:img&&img.getAttribute('src'),want:A.heroURL(id),modal:A.V.modal&&A.V.modal.type,B:!!A.B,name:A.TPL[id].n};},HERO);
    chk('talking names the wayfarer it waits for'+tag,!!t.txt&&t.txt.includes(`This one waits for ${t.name}. Bring ${t.name} in your party to face it.`)||JSON.stringify(t));
    chk('the line shows that wayfarer\'s portrait'+tag,!!t.img&&t.img===t.want||JSON.stringify({img:(t.img||'').slice(0,40)}));
    chk('talking starts no battle and opens no fight window'+tag,!t.B&&!t.modal||JSON.stringify(t));
    const c1=await ev(`(${clip})()`);chk('the line with portrait is not clipped'+tag,c1.length===0||c1.join(';'));
    await ev(()=>__A.nextDlg());
    // walk into it: the first bump repeats the hint, then the hero walks through it and out the other side, no battle
    const walk=async()=>{await ev(()=>{const A=__A,W=A.WS;W.held=[W.dir];W.kbT=performance.now();});await wait(700);
      return ev(()=>{const A=__A,W=A.WS;const o={x:W.x,y:W.y,dlg:!!W.dlg,B:!!A.B,modal:A.V.modal&&A.V.modal.type};W.held=[];if(W.dlg)A.nextDlg();return o;});};
    // fresh map visit so the bump hint shows again
    await ev(s=>{const A=__A;A.WS.rgMap=null;A.placeAt(s.pick.mid,s.pick.sx,s.pick.sy,s.pick.dir);A.WS.dir=s.pick.dir;A.render();},s);
    const w1=await walk();
    chk('bumping the ghost shows the hint once and starts no battle'+tag,w1.dlg&&!w1.B&&!w1.modal&&w1.x===s.pick.sx&&w1.y===s.pick.sy||JSON.stringify(w1));
    const w2=await walk();
    chk('then the hero walks through the ghost'+tag,!w2.B&&!w2.modal&&(w2.x!==s.pick.sx||w2.y!==s.pick.sy)||JSON.stringify(w2));
    // tap walking (pathfinding) goes through without stopping
    const tp=await ev(s=>{const A=__A;A.placeAt(s.pick.mid,s.pick.sx,s.pick.sy,s.pick.dir);const p=A.findPath(A.WS.m,s.pick.sx,s.pick.sy,s.pick.bx,s.pick.by);return p;},s);
    chk('a tap path crosses the ghost tile directly'+tag,Array.isArray(tp)&&tp.length===2||JSON.stringify(tp));
    // Quests tab, Personal quests row, What next?
    const tx=await ev(id=>{const A=__A,o={},n=A.TPL[id].n;A.V.modal={type:'menu',tab:'quests'};A.render();o.q=document.querySelector('#modal').innerText;o.cq=window.__clipF();
      A.V.modal={type:'menu',tab:'next'};A.render();o.n=document.querySelector('#modal').innerText;o.cn=window.__clipF();
      A.V.modal={type:'guild',tab:'personal'};A.render();o.p=(document.querySelector('#modal')||{}).innerText||'';o.cp=window.__clipF();A.V.modal=null;A.render();o.want=`Needs ${n} in your party`;return o;},HERO).catch(e=>({err:String(e)}));
    if(tx.err)chk('menus'+tag,tx.err);else{
      chk('Quests tab: the rival row says it needs the hero'+tag,tx.q.includes(tx.want)||tx.q.slice(0,300));
      chk('What next?: the rival row says it needs the hero'+tag,tx.n.includes(tx.want)||tx.n.slice(0,300));
      chk('Personal quests row says it needs the hero'+tag,tx.p.includes(tx.want)||tx.p.slice(0,300));
      chk('menus not clipped'+tag,tx.cq.length+tx.cn.length+tx.cp.length===0||[tx.cq,tx.cn,tx.cp].flat().join(';'));}
    // hero in the six: drawn normally, solid, A opens the fight, and the fight starts
    const pr=await ev(([id,s])=>{const A=__A,G=A.G,RG=window.__RG;if(G.party.length>=6)G.party.pop();G.party.push(id);A.placeAt(s.pick.mid,s.pick.sx,s.pick.sy,s.pick.dir);A.WS.dir=s.pick.dir;A.render();
      const m=A.WS.m,a=RG.actors().find(x=>x.b&&x.b.personal===id);RG.alpha.d2={};A.worldDraw2(performance.now());const o={ghost:RG.ghost(a),solid:A.solidAt(m,a.x,a.y),alpha:RG.alpha.d2[a.b.id],mark:RG.marks().filter(x=>/quest/.test(x.k)).map(x=>x.k)};
      A.interact();o.modal=A.V.modal&&A.V.modal.type;G.party.forEach(i=>{const c=G.roster[i];if(c&&c.S){c.hp=c.S.mhp;c.mp=c.S.mmp;}});
      A.V.modal={type:'menu',tab:'next'};A.render();o.next=document.querySelector('#modal').innerText;A.V.modal={type:'elite',b:G.personal[id]};A.render();A.ACT.fightElite();o.B=!!A.B&&A.B.spec&&A.B.spec.kind;return o;},[HERO,s]);
    chk('hero in the six: the rival is solid and drawn normally'+tag,pr.ghost===false&&pr.solid===true&&pr.alpha===undefined&&pr.mark.includes('quest')||JSON.stringify(pr));
    chk('hero in the six: talking opens the fight window'+tag,pr.modal==='elite'||JSON.stringify(pr));
    chk('hero in the six: What next? no longer says it needs them'+tag,!pr.next.includes('Needs Kage in your party')||'still says needs');
    chk('hero in the six: the fight starts'+tag,pr.B==='elite'||JSON.stringify(pr));
    await H.browser.close();}
  // ---------- HD-2D (High) ----------
  {const H=await boot('high',w,h,mob);const {ev,wait,s}=H;await wait(900);
    let hd={};for(let i=0;i<20;i++){hd=await ev(id=>{const A=__A,RG=window.__RG;return {on:A.hdActive(),al:RG.alpha.hd['p_'+id],keys:Object.keys(RG.alpha.hd),scr:A.V.screen,modal:A.V.modal&&A.V.modal.type,dlg:!!A.WS.dlg};},HERO);if(hd.al!=null)break;await wait(250);}
    chk('HD-2D renderer in use'+tag,hd.on===true||JSON.stringify(hd));
    chk('the ghost is drawn see through in HD-2D (about 45%)'+tag,hd.al>.35&&hd.al<.55||JSON.stringify(hd));
    const hp=await ev(id=>{const A=__A,G=A.G,RG=window.__RG;if(G.party.length>=6)G.party.pop();G.party.push(id);RG.alpha.hd={};A.render();return null;},HERO);await wait(500);
    const hd2=await ev(id=>window.__RG.alpha.hd['p_'+id],HERO);
    chk('HD-2D: hero in the six, the rival is drawn normally'+tag,hd2===undefined||String(hd2));
    await H.browser.close();}
}
await done({browser:{close:async()=>{}}});
})();
