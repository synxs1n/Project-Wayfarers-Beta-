// v0.13.5: charms9.js (Epic and Heroic charms), holy9.js (healing light burns the undead harder), skillfilt9.js (skill filter chips).
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1280,h:800});const r=await H.ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=g('G'),o={};
 o.gear=['c_ep0','c_ep5','c_hr0','c_hr3'].every(id=>A.GEAR[id]&&A.GEAR[id].slot==='c')&&g('gTierIdx')(A.GEAR.c_ep0)===3&&g('gTierIdx')(A.GEAR.c_hr0)===4;
 G.stage=1;o.stock1=g('shopStock')('charms').filter(x=>/c_ep|c_hr/.test(x)).length;G.stage=2;o.stock2=g('shopStock')('charms').filter(x=>/c_ep/.test(x)).length;G.stage=4;o.stock4=g('shopStock')('charms').filter(x=>/c_hr/.test(x)).length;
 o.rec=g('RECIPES').filter(r=>/c_ep|c_hr/.test(r.id)).length;A.V.modal={type:'workshop',tab:'craft',sec:'charm'};A.render();const t=document.querySelector('#modal').innerText;o.craft=t.includes('Colossus')&&t.includes('Titan');
 let ep=0,hr=0;for(let k=0;k<40;k++){G.bounties=G.bounties.filter(b=>b.stage!==4);g('genBounties')(4);G.bounties.filter(b=>b.stage===4).forEach(b=>{if(/c_ep/.test(b.reward.charm))ep++;if(/c_hr/.test(b.reward.charm))hr++;});}o.bEp=ep;o.bHr=hr;
 // holy light on an undead beats a plain hit by a wide margin
 A.V.modal=null;g('startBattle')({stage:0,kind:'field'});const B=g('B');const e=g('makeEnemy')(A.MON.barrowbones,12);B.en.splice(0,B.en.length,e);const lu=B.front.find(c=>c.id==='lumen');B.cur=lu;B.mode='cmd';
 const heal=g('known')(lu).find(s=>s.k==='heal');const hp0=e.hp;o.holy=g('holyHit')(lu,heal,e,g('HEAL_HURT'));o.drop=hp0-e.hp;o.atk=parseInt(String(g('skNum')(lu,g('atkFor')(lu))).replace(/\D/g,''),10);
 // skill filter chips for a hero with 6+ skills
 G.roster.mira.lv=40;g('refresh')(G.roster.mira);const mi=B.front.find(c=>c.id==='mira');B.cur=mi;B.menu='skills';A.render();
 o.known=g('known')(mi).length;o.chips=[...document.querySelectorAll('#bcmd .skf .chip')].map(c=>c.textContent);o.rows=document.querySelectorAll('#bcmd [data-act=sk]').length;
 A.ACT.skF('dmg');o.rowsDmg=document.querySelectorAll('#bcmd [data-act=sk]').length;o.dmgOk=o.rowsDmg<o.rows&&o.rowsDmg>0;A.ACT.skF('all');o.rowsAll=document.querySelectorAll('#bcmd [data-act=sk]').length;
 const lu2=B.front.find(c=>c.id==='lumen');B.cur=lu2;A.render();o.fewChips=document.querySelectorAll('#bcmd .skf').length;o.fewKnown=g('known')(lu2).length;
 return o;});console.log(JSON.stringify(r));
  chk('Epic (tier 3) and Heroic (tier 4) charms exist',r.gear===true);
  chk('Alchemy sells Epic charms from the third realm and Heroic from the fifth',r.stock1===0&&r.stock2===6&&r.stock4===4||JSON.stringify([r.stock1,r.stock2,r.stock4]));
  chk('ten recipes, open in the craft list at the fifth realm',r.rec===10&&r.craft);
  chk('fifth-realm bounties sometimes post an Epic or Heroic charm',r.bEp>5&&r.bHr>3||JSON.stringify([r.bEp,r.bHr]));
  chk('a Mend on an undead foe deals far more than a plain hit',r.holy>r.atk*3&&r.drop===r.holy||JSON.stringify([r.holy,r.atk,r.drop]));
  chk('a hero with 6+ skills gets filter chips; Damage narrows the list; All restores it',r.known>=6&&r.chips.length>=3&&r.chips[0]==='All'&&r.dmgOk&&r.rowsAll===r.rows||JSON.stringify(r));
  chk('a hero with fewer than 6 skills gets no chips',r.fewKnown<6?r.fewChips===0:true);
  await done(H);})();
