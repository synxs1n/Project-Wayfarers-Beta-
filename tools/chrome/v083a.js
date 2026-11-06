// Beta v0.8.3: an opened chest plays its opening (lid, glint), stays while the loot text shows, then fades away; the chest sound is
// softer; the Equipment tab lists only the party.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:933,h:705});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.META.cfg.hints=false;});
const c=await ev(()=>{const A=__A;for(let s=0;s<5;s++){const m=A.getMap('f'+s);for(const [x,y] of m.chests||[]){if(A.G.chests[m.id+':'+x+','+y]||A.tileAt(m,x,y)!=='C')continue;if(!A.solidAt(m,x,y+1)){A.placeAt(m.id,x,y+1,'u');A.render();return {id:m.id,x,y};}}}return null;});
chk('found a closed chest',!!c);
await ev(c=>{__A.openChest(c.x,c.y);},c);await wait(150);
const a=await ev(c=>{const k=c.id+':'+c.x+','+c.y,o=window.__WFXO[k];return {anim:!!o,dlg:!!__A.WS.dlg};},c);
chk('the opening animation starts with the loot text',a.anim&&a.dlg||JSON.stringify(a));
await wait(1500);
chk('the open chest stays while the loot text is up',await ev(c=>!!window.__WFXO[c.id+':'+c.x+','+c.y],c));
await ev(()=>{const A=__A;while(A.WS.dlg)A.nextDlg();A.V.modal=null;A.render();});await wait(1400);
chk('then it fades out and is gone',await ev(c=>!window.__WFXO[c.id+':'+c.x+','+c.y],c));
const e=await ev(()=>{const A=__A,G=A.G;G.roster.brann=A.newChar('brann',3,0);A.V.modal={type:'menu',tab:'equip'};A.render();const n=document.querySelectorAll('#modal .eqlist .eqrow').length;A.V.modal=null;return {n,party:G.party.length};});
chk('Equipment lists only the party',e.n===e.party||JSON.stringify(e));
await done(H);})();
