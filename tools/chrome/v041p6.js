// v0.4.1 Phase 6: 6.1 Backpack, 6.2 rarity sort and filters that remember, 6.3 Craft only tag
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait,page}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.stage=3;A.G.gold=99999;});
await page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
// 6.1
await ev(()=>{__A.ACT.menu();});await wait(150);
const top=await ev(()=>[...document.querySelectorAll('#modal .mgrp .chip')].map(x=>x.textContent));
chk('6.1 the menu group is called Backpack',top.includes('Backpack')&&!top.includes('Gear'));
// 6.2 shop sorted by rarity, descending (v0.5.0 3.1: "Best for party" is the default now, so pick Rarest first)
await ev(()=>{__A.V.modal={type:'smithy',tab:'weapons'};__A.render();__A.ACT.shopF('sort:rarity');});await wait(150);
const t1=await ev(()=>[...document.querySelectorAll('#modal .shoprow')].map(r=>{const m=(r.querySelector('.tchip')||{}).className||'';const x=m.match(/\bt(\d)\b/);return x?+x[1]:-1;}));
console.log('weapons tiers',JSON.stringify(t1));
chk('6.2 the smithy lists the rarest first',t1.length>1&&t1.every((v,i)=>i===0||v<=t1[i-1]));
// filters remember
await ev(()=>{__A.ACT.shopF('show:usable');});await wait(100);
const mem=await ev(()=>({f:__A.SHOPF(),saved:JSON.stringify(__A.META.cfg.shopF)}));
chk('6.2 the filter is stored',mem.f.show==='usable'&&/usable/.test(mem.saved));
await ev(()=>{__A.V.modal=null;__A.render();__A.V.modal={type:'smithy',tab:'weapons'};__A.render();});await wait(100);
const on=await ev(()=>[...document.querySelectorAll('#modal .shopf select option:checked')].map(x=>x.textContent));// v0.6.3: dropdowns
chk('6.2 it is still selected when the shop is reopened',on.includes('Fits my party'));
const usableOnly=await ev(()=>{const A=__A,P=A.G.party.map(i=>A.G.roster[i]);return [...document.querySelectorAll('#modal [data-act="buyGear"]')].every(b=>P.some(c=>A.canEquip(c,b.dataset.arg)));});
chk('6.2 "Fits my party" shows only gear the party can use',usableOnly===true);
await ev(()=>{__A.ACT.shopF('show:all');});
// craft tab sorted too
await ev(()=>{__A.V.modal={type:'smithy',tab:'craft',cat:'weapon'};__A.render();});await wait(150);
const t2=await ev(()=>[...document.querySelectorAll('#modal .rec')].map(r=>{const m=(r.querySelector('.tchip')||{}).className||'';const x=m.match(/\bt(\d)\b/);return x?+x[1]:-1;}));
console.log('craft tiers',JSON.stringify(t2));
chk('6.2 the Forge list is rarest first too',t2.length>1&&t2.every((v,i)=>i===0||v<=t2[i-1]));
// 6.3
const co=await ev(()=>{const A=__A;return {tempered:A.craftOnly('w_blade_1+2'),shopBase:A.craftOnly('w_blade_1'),potion:A.craftOnly('potion'),recipes:A.RECIPES.filter(r=>A.craftOnly(r.id||r.item)).length};});
console.log(JSON.stringify(co));
chk('6.3 tempered shop gear and potions are not craft only',!co.tempered&&!co.shopBase&&!co.potion);
const co2=await ev(()=>{const A=__A;return A.RECIPES.filter(r=>A.craftOnly(r.id||r.item)).map(r=>r.id||r.item);});
console.log('craft only:',JSON.stringify(co2));
chk('6.3 some items are truly craft only (elixir, vigor, sage)',['elixir','vigor','sage'].every(x=>co2.includes(x)));
await done(H);})();
