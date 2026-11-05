// v0.4.1 1.3: shield pips keep their own slot; a boss with every status applied must not overlap them (phone sizes)
const {open,chk,done}=require('./pw');
(async()=>{
for(const [w,h] of [[360,640],[390,844],[430,800],[412,915]]){
 const H=await open({w,h,mobile:true});
 await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(150);A.G.stage=4;A.startBattle({stage:4,kind:'boss'});A.B.front.concat(A.B.back).forEach(c=>{c.S.mhp=99999;c.hp=99999;});});
 await H.page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:20000}).catch(async e=>{console.log('STUCK',JSON.stringify(await H.ev(()=>({b:!!__A.B,mode:__A.B&&__A.B.mode,over:__A.B&&__A.B.over,modal:__A.V.modal&&__A.V.modal.type,screen:__A.V.screen,cur:__A.B&&__A.B.cur&&__A.B.cur.name,wd:window.__WD}))));throw e;});
 await H.ev(()=>{const A=__A,B=A.B;B.en.forEach(e=>{if(!e.maxShield){e.maxShield=3;e.shield=3;}Object.keys(A.STS).forEach(k=>{e.st[k]={t:3,src:null};});e.primed={t:2,k:'x',n:'Primed'};e.broken=0;});
   B.front.forEach(c=>Object.keys(A.STS).forEach(k=>{c.st[k]={t:3,src:null};}));A.render&&A.render();});
 await H.wait(400);
 const r=await H.ev(()=>{const inter=(a,b)=>a.left<b.right-.5&&b.left<a.right-.5&&a.top<b.bottom-.5&&b.top<a.bottom-.5;
   const out={pips:0,overlaps:[],hidden:0,off:0};
   const pips=[...document.querySelectorAll('.spips')];out.pips=pips.length;pips.forEach(p=>p.scrollIntoView({block:'center'}));
   pips.forEach(p=>{const pr=p.getBoundingClientRect();if(pr.width<10||pr.height<6||getComputedStyle(p).visibility==='hidden')out.hidden++;
     if(pr.left<-1||pr.right>innerWidth+1||pr.top<-1||pr.bottom>innerHeight+1)out.off++;
     const scope=p.closest('.fc')||p.closest('.unit')||p.parentElement;
     const el=document.elementFromPoint(pr.x+pr.width/2,pr.y+pr.height/2);if(el&&!(p===el||p.contains(el)))out.overlaps.push('covered by '+el.className);
     scope.querySelectorAll('*').forEach(o=>{if(o===p||p.contains(o)||o.contains(p))return;const orc=o.getBoundingClientRect();if(orc.width<1||orc.height<1)return;const cs=getComputedStyle(o);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return;
       if(!o.children.length&&!o.textContent.trim()&&!/ico|st|tag|hp|bar/i.test(o.className+''))return;
       if(inter(pr,orc))out.overlaps.push((o.className||o.tagName)+'');});});
   return out;});
 console.log(w+'x'+h,JSON.stringify(r).slice(0,300));
 chk(`1.3 ${w}x${h} pips visible, unclipped, nothing overlaps`,r.pips>0&&r.hidden===0&&r.off===0&&r.overlaps.length===0||JSON.stringify(r).slice(0,200));
 await H.shot('v041_pips_'+w);await H.browser.close();}
process.exit(0);})();
