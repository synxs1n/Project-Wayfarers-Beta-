// v0.11.0: Sell junk (strictly useless gear only, kept gear never), the keep lock. v0.11.4: a beaten story Echo stays gone (respawn reverted).
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1280,h:800});
  const r=await H.ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=g('G');
    // two tier 0 blades are beaten by the tier 2 blade (ATK only) if there are enough copies for everyone who can wear it
    const C=g('canEquip'),R=Object.values(G.roster),users=R.filter(c=>C(c,'w_blade_0')).length;
    G.gear=['w_blade_0','w_blade_0','c_medal0'];for(let i=0;i<users;i++)G.gear.push('w_blade_2');
    const L1=g('junkList')(['w','a','k','c']);
    G.keepG={w_blade_0:1};const L2=g('junkList')(['w','a','k','c']);G.keepG={};
    G.gear=G.gear.filter(x=>x!=='w_blade_2');G.gear.push('w_blade_2');const L3=users>1?g('junkList')(['w']):{w_blade_0:null};
    G.gear=['w_blade_0','w_blade_0'];for(let i=0;i<users;i++)G.gear.push('w_blade_2');const gold0=G.gold;A.V.modal={type:'junk',slots:['w']};A.ACT.junkGo();
    return {users,L1:Object.keys(L1),n1:(L1.w_blade_0||{}).n,L2:Object.keys(L2),L3:Object.keys(L3),sold:G.gear.filter(x=>x==='w_blade_0').length,gold:G.gold-gold0,left:G.gear.filter(x=>x==='w_blade_2').length};});
  chk(`outclassed blades are junk, both copies (${JSON.stringify(r)})`,r.L1.includes('w_blade_0')&&r.n1===2);
  chk('a Medal is never junk',!r.L1.includes('c_medal0'));
  chk('kept (locked) gear is never junk',!r.L2.includes('w_blade_0'));
  chk('not junk when the better piece has too few copies for everyone who could wear it',r.users<2||!r.L3.includes('w_blade_0'));
  chk(`Sell junk sells them for gold and keeps the better pieces (${r.gold} gold)`,r.sold===0&&r.gold>0&&r.left===r.users);
  // Echo respawn
  const e=await H.ev(()=>{const g=__A.TW.get,G=g('G');G.cleared=[1,0,0,0,0];G.echoStory={0:1};G.echoReady={0:0};const a=g('storyEchoUp')(0);G.echoReady[0]=1;const b=g('storyEchoUp')(0);return {held:a,back:b};});
  chk(`v0.11.4: a beaten story Echo stays gone, even after you leave (${JSON.stringify(e)})`,e.held===false&&e.back===false);
  await done(H);})();
