const {open,chk,done}=require('./pw');
(async()=>{const h=await open({mobile:true});const {ev,wait,page}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
const pos=await ev(()=>{const m=__A.WS.m,b=m.bld.find(b=>b.k==='smithy');__A.placeAt(m.id,b.door[0],b.door[1]+1,'u');return [b.door[0],b.door[1]+1];});await wait(300);
await page.keyboard.down('ArrowUp');await wait(400);await page.keyboard.up('ArrowUp');await wait(300);
chk('walking up into the door opens the Smithy',await ev(()=>__A.V.modal&&__A.V.modal.type==='smithy')||'no modal');
for(const tab of ['weapons','forge','craft','mats','sell']){await ev(t=>{__A.V.modal.tab=t;__A.render();},tab);}
// v0.5.0 1.5: Esc is the back arrow: from a sub tab it goes to the first tab, then it closes the shop
await page.keyboard.press('Escape');await wait(300);
// v0.6.3: the first tab is Shop (sections All, Weapons, Armor, Capes, Materials)
// v0.17.8: Esc is the menu history: it returns to the view before (Shop > Materials), then back through craft, forge and the Weapons section to the first tab (the Materials tab is a Shop section)
chk('Esc from a sub tab goes back to the tab viewed before it',await ev(()=>__A.V.modal&&__A.V.modal.type==='smithy'&&__A.V.modal.tab==='shop'&&__A.V.modal.sec==='mats')||'no');
for(let i=0;i<4;i++){await page.keyboard.press('Escape');await wait(120);}
chk('and four more reach the first tab',await ev(()=>__A.V.modal&&__A.V.modal.type==='smithy'&&(__A.V.modal.tab||'shop')==='shop')||'no');
await page.keyboard.press('Escape');await wait(300);
chk('Esc closes it',await ev(()=>!__A.V.modal));
const s0=await ev(()=>[__A.WS.x,__A.WS.y]);
// walk in whichever direction is open (layouts differ by realm)
const key=await ev(()=>{const m=__A.WS.m,x=__A.WS.x,y=__A.WS.y;for(const [k,dx,dy] of [['ArrowDown',0,1],['ArrowLeft',-1,0],['ArrowRight',1,0]]){if(__A.walkable(m,x+dx,y+dy,k))return k;}return 'ArrowDown';});
await page.keyboard.down(key);await wait(450);await page.keyboard.up(key);await wait(300);
const s1=await ev(()=>[__A.WS.x,__A.WS.y,__A.WS.lock,!!__A.WS.dlg]);
chk('can walk again after leaving ('+JSON.stringify(s0)+'->'+JSON.stringify(s1)+')',(s1[0]!==s0[0]||s1[1]!==s0[1])&&!s1[2]&&!s1[3]);
// open from touch tap on the door: tap far then at door
await done(h);})();
