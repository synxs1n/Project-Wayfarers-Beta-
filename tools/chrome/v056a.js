// Beta v0.5.6 follow up: characters in the HD-2D world were sliced and smeared because the billboard atlas sized each slot by the
// HD sprite's logical size while uploading its 2x bitmap. Checks the atlas slot and UVs follow the real bitmap, and grabs a screenshot.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:933,h:705,mobile:true,dpr:2});const {ev,wait,page}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.gfx='high';A.render();});await wait(600);
const r=await ev(()=>{const A=__A,o={};if(!A.HD||!A.HD.gl)return {nogl:true};const t=A.TPL[A.G.party[0]],c=A.walkerCanvas('t056'+t.id,t.look,t.el,t.id,'front',0);
  o.hd=!!c.hd;o.logical=[c.width,c.height];o.real=[c._rw||c.width,c._rh||c.height];const at=new A.H2Atlas(A.HD.gl,1024),q=at.get('t056',c);
  o.slot=[Math.round((q.u1-q.u0)*1024),Math.round((q.v1-q.v0)*1024)];o.quad=[q.w,q.h];return o;});
console.log(JSON.stringify(r));
chk('WebGL world is active',!r.nogl);
chk('the hero sprite is an HD canvas (2x bitmap, logical size)',r.hd===true&&r.real[0]===r.logical[0]*2||JSON.stringify(r));
chk('the atlas slot covers the whole 2x bitmap',r.slot&&r.slot[0]===r.real[0]&&r.slot[1]===r.real[1]||JSON.stringify(r));
chk('the quad keeps the logical size',r.quad&&r.quad[0]===r.logical[0]&&r.quad[1]===r.logical[1]||JSON.stringify(r));
await ev(()=>{const A=__A,m=A.getMap('d0'),e=A.mapEntry(m);A.placeAt('d0',e[0],e[1]+2,'d');A.render();});await wait(1500);
await page.screenshot({path:__dirname+'/shots-v053/v056_hero_dungeon.png'});
await done(H);})();
