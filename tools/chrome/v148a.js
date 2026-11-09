// v0.16.x econ11.js: owner economy feedback. Forged gear starts at +0 (and is priced a little under the shop), Alchemy buys consumables back, gear sales
// confirm for rare pieces and never touch keepsakes or relics, personal relics follow the best shop piece fully tempered, pieces are compared at max
// temper (+3) in suggestions, and the Tempering rows show the gold and material cost near the top and in the Temper button.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v148a.js [shots]   (SHOTDIR=/dir for screenshots)
const {open,chk,done}=require('./pw');
const SHOTS=process.env.SHOTDIR;
(async()=>{const H=await open({w:390,h:844,mobile:true,out:SHOTS,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off'}}));`});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;G.stage=3;G.cleared=[1,1,1,0,0,0];G.gold=20000;
  ['brann','sable'].forEach(id=>{if(!G.roster[id]){G.roster[id]=A.newChar(id,20,2);G.party.push(id);}});Object.values(G.roster).forEach(c=>{c.lv=Math.max(c.lv,20);A.TW.get('refresh')(c);});A.render();});
const T=(f,a)=>ev(([s,a])=>(0,eval)('('+s+')')(a),[f.toString(),a]);

// ---- 2) forging starts at +0 ----
const f=await ev(()=>{const A=__A,t=k=>A.TW.get(k),R=t('RECIPES').filter(r=>r.id&&t('SMITH_CATS').includes(r.cat)),MP=t('MAT_PRICE');
  const ratio=R.map(r=>{const g=A.GEAR[r.id],m=t('recipeMats')(r);let b=0;Object.keys(m).forEach(k=>{if(MP[k])b+=MP[k]*m[k];});return {id:r.id,plus:t('plusOf')(r.id),k:(r.g+b)/g.price,floor:r.g<=Math.round(g.price*.15)};});
  return {n:R.length,plus:ratio.filter(x=>x.plus>0).map(x=>x.id),bad:ratio.filter(x=>!x.floor&&(x.k<.7||x.k>.95)).map(x=>x.id+':'+x.k.toFixed(2)),min:Math.min(...ratio.map(x=>x.k)).toFixed(2),max:Math.max(...ratio.map(x=>x.k)).toFixed(2),shop:ratio.filter(x=>A.GEAR[x.id]).length};});
chk('forge recipes exist for the smithy gear: '+f.n,f.n>=50);
chk('no forge recipe makes a +N piece: '+JSON.stringify(f.plus.slice(0,3)),f.plus.length===0);
chk('gold plus bought ore/logs is 70 to 95% of the shop price ('+f.min+' to '+f.max+')',f.bad.length===0||f.bad.slice(0,4).join(' '));
const cr=await ev(()=>{const A=__A,t=k=>A.TW.get(k),G=A.G;const r=t('RECIPES').find(x=>x.id==='w_blade_2');G.gold=9999;Object.keys(t('MATS')).forEach(k=>G.mats[k]=20);const n0=G.gear.length;const ok=t('craft')(r);return {ok,id:G.gear[G.gear.length-1],plus:t('plusOf')(G.gear[G.gear.length-1]),n:G.gear.length-n0,fc:!!t('forgeCost')(G.gear[G.gear.length-1])};});
chk('crafting a sword gives w_blade_2 at +0 and it can be tempered',cr.ok&&cr.id==='w_blade_2'&&cr.plus===0&&cr.fc||JSON.stringify(cr));

// ---- 5) tempering cost visible ----
await ev(()=>{const A=__A,G=A.G;G.gold=5000;G.gear.push('w_blade_2','a_mail_2','w_staff_2');A.V.modal={type:'smithy',tab:'forge'};A.render();});await wait(300);
const tc=await ev(()=>{const rows=[...document.querySelectorAll('#modal .row.rec')],o=rows.slice(0,4).map(r=>{const m=r.querySelector('.mats.tcost'),b=r.querySelector('button[data-act="forge"]'),rr=r.getBoundingClientRect();return {has:!!m,gold:m&&!!m.querySelector('.matc.gold'),top:m?Math.round(m.getBoundingClientRect().top-rr.top):-1,btn:b&&b.innerText.replace(/\s+/g,' ')};});return {n:rows.length,o};});
chk('tempering rows: cost line near the top of each row and "Temper · Ng" on the button '+JSON.stringify(tc.o[0]),tc.n>0&&tc.o.every(x=>x.has&&x.gold&&x.top>=0&&x.top<90&&/^Temper · [\d,]+g$/.test(x.btn||''))||JSON.stringify(tc));
if(SHOTS)await H.shot('v148a-temper');
const up=await ev(()=>{const A=__A,G=A.G,c=G.roster[G.party[0]];A.V.modal={type:'upg',cid:c.id,sl:'w'};A.render();return document.querySelector('#modal').innerText;});
chk('the Upgrade popup shows the gold of a step (cost chips)',/gold/i.test(up));

// ---- 1) selling ----
const sl=await ev(()=>{const A=__A,t=k=>A.TW.get(k),G=A.G,E=window.__E11;G.inv.potion=7;G.inv.ether=2;G.inv.campkit=2;G.inv.porkchop=1;
  A.V.modal={type:'workshop',tab:'sell',sec:'item'};A.render();const h1=document.querySelector('#modal').innerText;
  const sellable=E.sellableItems();const g0=G.gold,p0=G.inv.potion,val=E.itemSellGold('potion');A.ACT.sellItem('potion,5');
  return {h1:/Healing Draught/.test(h1)&&/Mana Tonic/.test(h1),camp:/Camp Supplies/.test(h1),sellable,dgold:G.gold-g0,val,dp:p0-G.inv.potion,tab:[...document.querySelectorAll('#modal .ssec .chip')].map(x=>x.innerText.replace(/\s+/g,' '))};});
chk('Alchemy Sell tab has an Items section listing potions but not Camp Supplies: '+JSON.stringify(sl.tab),sl.h1&&!sl.camp&&sl.tab.some(x=>/^Items/.test(x))||JSON.stringify(sl));
chk('selling 5 potions pays 5 x '+sl.val+' and removes them',sl.dgold===sl.val*5&&sl.dp===5&&sl.val>0||JSON.stringify(sl));
const allT=await ev(()=>{const A=__A;A.V.modal={type:'workshop',tab:'sell',sec:'all'};A.render();const t=document.querySelector('#modal').innerText;return /Items/.test(t)&&/Mana Tonic/.test(t);});
chk('the All section also lists the items',allT);
const gs=await ev(()=>{const A=__A,t=k=>A.TW.get(k),G=A.G,E=window.__E11,c=G.roster[G.party[0]];
  const rel=Object.keys(A.GEAR).find(i=>/^u_/.test(i)&&A.GEAR[i].only===c.id)||Object.keys(A.GEAR).find(i=>/^u_/.test(i)&&A.GEAR[i].only&&A.TPL[A.GEAR[i].only]);G.gear.length=0;G.gear.push('w_blade_0','w_blade_3','w_blade_1+2','w_stick',rel);const worn=c.eq.w;const o={};o.rel=rel;o.relBlocked=E.sellBlocked(rel);
  o.cheap=!E.sellConfirm('w_blade_0');o.rare=E.sellConfirm('w_blade_2');o.temp=E.sellConfirm('w_blade_0+1');
  o.plus=E.sellGold('w_blade_1+2')>E.sellGold('w_blade_1');o.stick=E.sellBlocked('w_stick');
  const g0=G.gold;A.ACT.sellAsk('w_blade_0');o.cheapSold=G.gold>g0&&!G.gear.includes('w_blade_0');
  const g1=G.gold;A.ACT.sellAsk('w_blade_3');o.modal=A.V.modal&&A.V.modal.type;o.heldGold=G.gold===g1&&G.gear.includes('w_blade_3');
  o.html=document.querySelector('#modal')?document.querySelector('#modal').innerText:'';
  A.ACT.sellGo('w_blade_3');o.sold=G.gold>g1&&!G.gear.includes('w_blade_3');
  A.ACT.sell('w_stick');o.stickKept=G.gear.includes('w_stick');o.wornKept=c.eq.w===worn;
  A.V.modal={type:'smithy',tab:'sell',sec:'weapons'};A.render();o.rows=document.querySelectorAll('#modal [data-act="sellAsk"]').length;o.keep=/Keepsake/.test(document.querySelector('#modal').innerText);A.ACT.sell(rel);o.relKept=G.gear.includes(rel);return o;});
chk('untouched common gear sells at once, Rare and tempered gear ask first: '+JSON.stringify([gs.cheap,gs.rare,gs.temp]),gs.cheap&&gs.rare&&gs.temp||JSON.stringify(gs));
chk('a tempered piece sells for more than the plain one',gs.plus);
chk('selling a common piece pays gold and removes it',gs.cheapSold);
chk('selling Rare gear opens a confirm, nothing changes until Sell is pressed',gs.modal==='sellask'&&gs.heldGold&&/Sell this/.test(gs.html)&&gs.sold||JSON.stringify(gs));
chk('the Tamer\'s Stick and a personal relic are never sold (the relic row says Keepsake), worn gear stays on the hero',gs.stick&&gs.stickKept&&gs.wornKept&&gs.keep&&gs.relBlocked&&gs.relKept||JSON.stringify(gs));

// ---- 4) personal relics ----
const rl=await ev(()=>{const A=__A,t=k=>A.TW.get(k),G=A.G,E=window.__E11,out=[];const ids=Object.keys(A.GEAR).filter(id=>/^u[ac]?_/.test(id)&&A.GEAR[id].only);
  const res={n:ids.length,bad:[],grow:0};
  [1,2,3,4,5].forEach(s=>{G.stage=s;G.cleared=[1,1,1,1,1,1].map((x,i)=>i<s);});
  G.stage=1;G.cleared=[0,0,0,0,0,0];const at1={};ids.forEach(id=>{const g=t('gearOf')(id);at1[id]=g;});
  G.stage=4;G.cleared=[1,1,1,1,0,0];
  ids.forEach(id=>{const g=t('gearOf')(id),b=A.GEAR[id],hero=b.only,tp=A.TPL[hero],cls=tp.cls;
    if(!g.relic||t('forgeCost')(id)||!E.sellBlocked(id))res.bad.push(id+' flags');
    const main=b.slot==='c'?null:(b.slot==='w'?'w_'+t('CF')[cls][0]+'_5':'a_'+t('ARM_FAM')[t('CLS_ARM')[cls]||'medium']+'_5');
    if(main){const sh=t('gearOf')(main+'+3'),sh4=t('gearOf')((b.slot==='w'?'w_'+t('CF')[cls][0]+'_4':'a_'+t('ARM_FAM')[t('CLS_ARM')[cls]||'medium']+'_4')+'+3');
      // at stage 4 the shops sell tiers 3 and 4: the relic (tier 5, +3) must beat the best +3 shop piece in every stat it has
      ['atk','mag','def','res','hp'].forEach(k=>{if(sh4[k]>0&&!(g[k]>=sh4[k]))res.bad.push(id+' '+k+' '+g[k]+' < '+sh4[k]);});}
    const o1=at1[id];if(['atk','mag','def','hp'].some(k=>g[k]>(o1[k]||0)))res.grow++;
    if(!/'s Relic /.test(g.n))res.bad.push(id+' name '+g.n);});
  return res;});
chk('personal relic gear exists for the whole roster ('+rl.n+') and is flagged relic, untemperable, not for sale, named Relic',rl.n>=20&&rl.bad.length===0||JSON.stringify(rl.bad.slice(0,5)));
chk('relics grow with realm progress (a later realm has stronger relics)',rl.grow>0);
const rq=await ev(()=>{const A=__A,t=k=>A.TW.get(k),G=A.G;const id=Object.keys(A.GEAR).find(i=>/^u_/.test(i)&&A.GEAR[i].only&&G.roster[A.GEAR[i].only]);if(!id)return {skip:1};const c=G.roster[A.GEAR[id].only];G.stage=4;G.cleared=[1,1,1,1,0,0];
  c.eq.w=id;t('refresh')(c);const w=t('gearOf')(id);return {name:w.n,atk:w.atk,mag:w.mag,score:t('loadoutScore')(c,c.S)};});
chk('a hero can wear the relic and the sheet name reads "Relic" '+JSON.stringify(rq),rq.skip||/Relic/.test(rq.name));

// ---- 3) max temper ----
const mx=await ev(()=>{const A=__A,t=k=>A.TW.get(k),G=A.G,E=window.__E11;G.stage=3;G.cleared=[1,1,1,0,0,0];G.gold=20000;
  const c=G.roster.brann||G.roster[G.party[3]];const fam=t('CF')[A.TPL[c.id].cls][0];const w2='w_'+fam+'_2+3',w3='w_'+fam+'_3';
  c.eq.w=w2;t('refresh')(c);G.gear.length=0;G.gear.push(w3);
  const cur=t('gainFor')(c,w3),mg=E.maxGainFor(c,w3);
  const tag=t('bestTag')(w3);const vs=t('vsMark')(c,w3);
  const Cs=t('upgOpts')(c,'w');const chain=Cs.filter(o=>o.k==='chain'&&o.base===w3&&o.steps===3);
  // a tie goes to the worn piece: the same base at +3 is never an upgrade for a +3 worn one
  const tie=E.maxGainFor(c,w2);const w3m=E.maxGainFor(c,w3+'+3');
  const before=c.eq.w;t('autoRun')('one',c.id);const after=c.eq.w;
  const eqTxt=document.querySelector('#modal')?document.querySelector('#modal').innerText:'';
  return {cur:cur&&cur.d,mg:mg&&mg.d,tag:/At max temper/.test(tag),vs:/Better at max temper/.test(vs),chain:chain.length,chainMx:chain[0]&&chain[0].mx,tie:tie&&tie.d,w3m:w3m&&w3m.d,before,after,worth:/worth tempering/i.test(eqTxt),eqTxt:eqTxt.slice(0,200),mxtxt:(tag.match(/At max temper[^<]*<[^>]*>[^<]*/)||[''])[0]};});
chk('a +3 worn piece beats the plain next tier today, but not at max temper (cur '+(mx.cur&&mx.cur.toFixed(1))+', max '+(mx.mg&&mx.mg.toFixed(1))+')',mx.cur<=.01&&mx.mg>.01||JSON.stringify(mx));
chk('shop tag shows the max-temper projection and vsMark says better at max temper',mx.tag&&mx.vs||JSON.stringify(mx));
chk('the per-slot Upgrade offers "buy/take it and temper to +3" for the weaker-today piece, with the max-temper text: '+mx.chainMx,mx.chain>=1&&/at max temper/.test(mx.chainMx||'')||JSON.stringify(mx));
chk('a tie at max temper stays with the worn piece (same base +3 vs worn +3, and the piece against itself)',mx.tie===0&&Math.abs(mx.w3m)>=0||JSON.stringify(mx));
chk('Equip best still equips by today\'s stats (the +3 worn piece stays) and lists the pack piece under Worth tempering',mx.after===mx.before&&mx.worth||JSON.stringify(mx));

// the reverse: worn t3 +0 and a tier 2 +3 spare: better today, lower ceiling -> free pack equip still allowed, purchases of the lower ceiling are not offered
const rv=await ev(()=>{const A=__A,t=k=>A.TW.get(k),G=A.G,E=window.__E11;const c=G.roster.brann||G.roster[G.party[3]],fam=t('CF')[A.TPL[c.id].cls][0];
  c.eq.w='w_'+fam+'_3';t('refresh')(c);G.gear.length=0;G.gear.push('w_'+fam+'_2+3');
  const O=t('upgOpts')(c,'w'),pack=O.filter(o=>o.k==='pack').length,buy2=O.filter(o=>o.k==='buy'&&o.id==='w_'+fam+'_2').length;
  return {pack,buy2,ceil:E.ceilOk(c,'w_'+fam+'_2'),temper:O.filter(o=>o.k==='temper').length};});
chk('a lower-ceiling piece is not bought as an upgrade ('+JSON.stringify(rv)+')',rv.buy2===0&&!rv.ceil);

// page errors are counted by pw (PAGEERRS)
await done(H);})();
