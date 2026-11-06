// v0.8.2 helper: prints the role share table (roles.js roleTable) at a few levels. Not a test.
// Run from tools/chrome: PWHTML=../../out/aurelis3.html node rlmeasure.js   (LVS=20,30,40)
const {open}=require('./pw');
(async()=>{const h=await open();const {ev}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();__A.V.modal=null;});
for(const lv of (process.env.LVS||'20,30,40').split(',').map(Number)){const T=await ev(([lv])=>__A.roleTable(lv,lv>=40?5:lv>=30?3:2),[lv]);
 console.log('lv',lv);Object.keys(T).forEach(k=>console.log('  '+k.padEnd(11),T[k].primary.padEnd(9),JSON.stringify(T[k].share)));}
await h.browser.close();})();
