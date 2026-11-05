// Beta v0.6.3 shops and menus, items 1 to 4: every shop has main tabs and section chips with "All" first, Alchemy has its own
// Charms section, old tab ids still land, back steps one level, every filter is a dropdown that remembers, the new filters work,
// and the regrouped main menu.
// Usage: PWHTML=../../out/aurelis3.html node v063m2.js
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off'}}));`});const {ev,wait,page}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=99999;A.G.stage=1;A.render();});
const nav=()=>ev(()=>({tabs:[...document.querySelectorAll('#modal .stabs .chip')].map(x=>x.textContent.trim()),secs:[...document.querySelectorAll('#modal .ssec .chip')].map(x=>x.textContent.replace(/\s*\d+$/,'').trim()),
  on:[...document.querySelectorAll('#modal .stabs .chip.on,#modal .ssec .chip.on')].map(x=>x.textContent.replace(/\s*\d+$/,'').trim()),h4:[...document.querySelectorAll('#modal h4')].map(x=>x.textContent.replace(/\s*\d+$/,'').trim())}));
const show=m=>ev(m=>{__A.V.modal=m;__A.render();},m);
// ---- item 2: structure
await show({type:'smithy'});let n=await nav();
chk('Smithy main tabs: Shop, Forge, Tempering, Sell',JSON.stringify(n.tabs.slice(0,4))===JSON.stringify(['Shop','Forge','Tempering','Sell'])||JSON.stringify(n.tabs));
chk('Smithy Shop sections: All, Weapons, Armor, Capes, Materials',JSON.stringify(n.secs)===JSON.stringify(['All','Weapons','Armor','Capes','Materials'])||JSON.stringify(n.secs));
chk('Smithy opens on Shop > All with every section under its own heading',n.on.join()==='Shop,All'&&['Weapons','Armor','Capes','Ore and wood','Monster parts'].every(x=>n.h4.includes(x))||JSON.stringify(n));
await show({type:'smithy',tab:'craft'});n=await nav();chk('Forge sections: All, Weapons, Armor',JSON.stringify(n.secs)===JSON.stringify(['All','Weapons','Armor'])||JSON.stringify(n.secs));
await show({type:'smithy',tab:'forge'});n=await nav();chk('Tempering sections: All, Weapons, Armor, Capes, Charms',JSON.stringify(n.secs)===JSON.stringify(['All','Weapons','Armor','Capes','Charms'])||JSON.stringify(n.secs));
await show({type:'smithy',tab:'sell'});n=await nav();chk('Smithy Sell sections: All, Weapons, Armor, Capes, Materials',JSON.stringify(n.secs)===JSON.stringify(['All','Weapons','Armor','Capes','Materials'])||JSON.stringify(n.secs));
await show({type:'workshop'});n=await nav();
chk('Alchemy main tabs: Shop, Brew & craft, Sell, Pouch',JSON.stringify(n.tabs)===JSON.stringify(['Shop','Brew & craft','Sell','Pouch'])||JSON.stringify(n.tabs));
chk('Alchemy Shop sections: All, Potions, Cures, Travel, Charms, Herbs',JSON.stringify(n.secs.slice(0,6))===JSON.stringify(['All','Potions','Cures','Travel','Charms','Herbs'])||JSON.stringify(n.secs));
// ---- item 1: charms have their own section
const ch=await ev(()=>{__A.ACT.sSec('charm');const g=[...document.querySelectorAll('#modal [data-act="buyGear"]')].map(b=>b.dataset.arg),it=document.querySelectorAll('#modal [data-act="buyItem"]').length;return {g,it,on:__A.V.modal.sec};});
chk('1: Alchemy > Shop > Charms lists only charms',ch.on==='charm'&&ch.g.length>0&&ch.g.every(id=>id.startsWith('c_'))&&ch.it===0||JSON.stringify(ch));
const po=await ev(()=>{__A.ACT.sSec('potion');return {g:document.querySelectorAll('#modal [data-act="buyGear"]').length,it:[...document.querySelectorAll('#modal [data-act="buyItem"]')].map(b=>b.dataset.arg)};});
chk('Alchemy > Potions has no charms and no travel gear',po.g===0&&po.it.length>0&&!po.it.includes('tent')&&!po.it.includes('holywater')||JSON.stringify(po));
await show({type:'workshop',tab:'craft'});n=await nav();chk('Alchemy craft sections: All, Potions, Charms, Travel',JSON.stringify(n.secs)===JSON.stringify(['All','Potions','Charms','Travel'])||JSON.stringify(n.secs));
await show({type:'workshop',tab:'sell'});n=await nav();chk('Alchemy Sell sections: All, Charms, Herbs',JSON.stringify(n.secs)===JSON.stringify(['All','Charms','Herbs'])||JSON.stringify(n.secs));
await show({type:'tavern'});n=await nav();chk('Tavern tabs: Hire, Kitchen',JSON.stringify(n.tabs)===JSON.stringify(['Hire','Kitchen'])||JSON.stringify(n.tabs));
const kit=await ev(()=>{__A.ACT.sTab('kitchen');return !!document.querySelector('#modal [data-act="buyItem"][data-arg="porkchop"]');});chk('Tavern > Kitchen sells the sandwiches',kit);
await show({type:'guild'});n=await nav();chk('Guild Hall tabs: Recruits, Quests, Natures, Arena, Guilds',JSON.stringify(n.tabs)===JSON.stringify(['Recruits','Quests','Natures','Arena','Guilds'])||JSON.stringify(n.tabs));
await show({type:'guild',tab:'quests'});n=await nav();chk('Guild Hall > Quests sections: All, Personal quests, Bounties',JSON.stringify(n.secs)===JSON.stringify(['All','Personal quests','Bounties'])||JSON.stringify(n.secs));
await show({type:'board'});n=await nav();chk('Quest Board sections: All, Ready, Active, Open, Done',JSON.stringify(n.secs)===JSON.stringify(['All','Ready','Active','Open','Done'])||JSON.stringify(n.secs));
const hg=await ev(()=>{const o={};for(const t of ['smithy','workshop','tavern','guild','board']){__A.V.modal={type:t};__A.render();o[t]=!!document.querySelector('#modal h2 .hgold');}return o;});
chk('every shop title carries the purse',Object.values(hg).every(Boolean)||JSON.stringify(hg));
// ---- old ids still land
const leg=await ev(()=>{const o={};const t=(m)=>{__A.V.modal=m;__A.render();return __A.V.modal.tab+'/'+__A.V.modal.sec;};
  o.w=t({type:'smithy',tab:'weapons'});o.m=t({type:'smithy',tab:'mats'});o.c=t({type:'smithy',tab:'craft',cat:'armor'});o.r=t({type:'workshop',tab:'herbs'});o.p=t({type:'guild',tab:'personal'});o.b=t({type:'guild',tab:'bounties'});
  o.wOnly=(__A.V.modal={type:'smithy',tab:'weapons'},__A.render(),[...document.querySelectorAll('#modal [data-act="buyGear"]')].every(b=>__A.GEAR[b.dataset.arg].slot==='w'));return o;});
chk('old tab ids map to the new tab and section',leg.w==='shop/weapons'&&leg.m==='shop/mats'&&leg.c==='craft/armor'&&leg.r==='shop/herb'&&leg.p==='quests/personal'&&leg.b==='quests/bounties'&&leg.wOnly||JSON.stringify(leg));
// ---- back: one level at a time
const bk=await ev(()=>{const A=__A,o=[];A.V.modal={type:'smithy'};A.render();A.ACT.sTab('forge');A.ACT.sSec('armor');
  const st=()=>A.V.modal?A.V.modal.tab+'/'+A.V.modal.sec:'closed';o.push(st());for(let i=0;i<3;i++){A.ACT.xBack();o.push(st());}return o;});
chk('back: section to All, tab to Shop, then leave',JSON.stringify(bk)===JSON.stringify(['forge/armor','forge/all','shop/all','closed'])||JSON.stringify(bk));
await show({type:'smithy',tab:'forge',sec:'armor'});await page.keyboard.press('Escape');await wait(150);
chk('Esc is the back arrow in a section',await ev(()=>__A.V.modal&&__A.V.modal.sec==='all'&&__A.V.modal.tab==='forge'));
// ---- item 3: no chip filter rows anywhere, dropdowns that remember
const chips=await ev(()=>{const A=__A,o=[];const L=[{type:'smithy'},{type:'smithy',tab:'craft'},{type:'smithy',tab:'forge'},{type:'workshop'},{type:'workshop',tab:'craft'},{type:'menu',tab:'roster'},{type:'menu',tab:'items'},{type:'menu',tab:'codex'},{type:'menu',tab:'beasts'},{type:'eqPick',char:'mira',slot:'w'}];
  A.G.gear.push('w_staff_1','w_staff_0');
  for(const m of L){A.V.modal=m;A.render();const c=document.querySelectorAll('#modal .chip[data-act="shopF"],#modal .chip[data-act="lSort"],#modal .chip[data-act="lEl"],#modal .chip[data-act="lCl"]').length,s=document.querySelectorAll('#modal select[data-chg]').length;o.push(m.type+':'+(m.tab||'')+' chips '+c+' selects '+s);}return o;});
chk('every filter and sort is a dropdown (no chip rows left)',chips.every(x=>/chips 0 selects [1-9]/.test(x))||chips.join(', '));
// change through the real select element
await show({type:'smithy',tab:'shop',sec:'weapons'});
await page.selectOption('#modal select[data-chg="shopF"][data-pre="sort"]','price');await wait(150);
const pr=await ev(()=>({f:__A.META.cfg.shopF.sort,p:[...document.querySelectorAll('#modal [data-act="buyGear"]')].map(b=>__A.GEAR[b.dataset.arg].price),focus:document.activeElement&&document.activeElement.dataset.pre}));
chk('sort dropdown: Cheapest first, stored, focus kept',pr.f==='price'&&pr.p.every((v,i,a)=>!i||a[i-1]<=v)&&pr.focus==='sort'||JSON.stringify(pr));
await page.selectOption('#modal select[data-chg="shopF"][data-pre="who"]','mira');await wait(150);
const who=await ev(()=>{const A=__A,c=A.G.roster.mira;return {f:A.META.cfg.shopF.who,ok:[...document.querySelectorAll('#modal [data-act="buyGear"]')].every(b=>A.canEquip(c,b.dataset.arg)),n:document.querySelectorAll('#modal [data-act="buyGear"]').length};});
chk('For: Mira shows only what Mira can use',who.f==='mira'&&who.ok&&who.n>0||JSON.stringify(who));
await page.selectOption('#modal select[data-chg="shopF"][data-pre="show"]','upg');await wait(150);
const upg=await ev(()=>{const A=__A,c=A.G.roster.mira;return [...document.querySelectorAll('#modal [data-act="buyGear"]')].map(b=>A.gainFor?A.gainFor(c,b.dataset.arg):null);});
chk('Show: Upgrades only lists upgrades for the chosen hero',upg.length>0&&upg.every(g=>!g||g.pct>0)||JSON.stringify(upg));
await page.selectOption('#modal select[data-chg="shopF"][data-pre="rar"]','1');await wait(150);
const rar=await ev(()=>({f:__A.META.cfg.shopF.rar,t:[...document.querySelectorAll('#modal .shoprow .tchip:not(.craftonly)')].map(x=>x.className)}));
chk('Rarity filter keeps one rarity',rar.f==='1'&&rar.t.every(c=>/\bt1\b/.test(c))||JSON.stringify(rar));
const kept=await ev(()=>{__A.V.modal=null;__A.render();__A.V.modal={type:'smithy',tab:'weapons'};__A.render();return [...document.querySelectorAll('#modal .shopf select')].map(s=>s.dataset.pre+'='+s.value).join(',');});
chk('filters are remembered when the shop reopens',kept==='sort=price,show=upg,who=mira,rar=1'||kept);
await ev(()=>{['sort:best','show:all','who:all','rar:all'].forEach(a=>__A.ACT.shopF(a));});
// roster Show filter
await show({type:'menu',tab:'roster'});await page.selectOption('#modal select[data-chg="lSh"][data-pre="roster"]','party');await wait(150);
const ro=await ev(()=>({sh:__A.META.cfg.lists.roster.sh,n:document.querySelectorAll('#modal .grid.mini .mini').length,p:__A.G.party.length}));
chk('roster Show: In the party, stored in META.cfg.lists',ro.sh==='party'&&ro.n===ro.p||JSON.stringify(ro));
await page.selectOption('#modal select[data-chg="lEl"][data-pre="roster"]','fire');await wait(150);
chk('roster Element dropdown stores like the old chips',await ev(()=>__A.META.cfg.lists.roster.el==='fire'));
await ev(()=>{__A.ACT.lSh('roster:all');__A.ACT.lEl('roster:all');});
// Items and Bestiary filters
await show({type:'menu',tab:'items'});await page.selectOption('#modal select[data-chg="lSh"][data-pre="items"]','travel');await wait(150);
const it=await ev(()=>[...document.querySelectorAll('#modal .rows .row b')].map(b=>b.textContent.trim()));
chk('Items Show: Travel gear',it.length>0&&it.some(t=>/Tent|Holy Water/.test(t))&&!it.some(t=>/Healing Draught/.test(t))||JSON.stringify(it));
await ev(()=>__A.ACT.lSh('items:all'));
await show({type:'menu',tab:'beasts'});await page.selectOption('#modal select[data-chg="lSh"][data-pre="beasts"]','unseen');await wait(150);
chk('Bestiary Show: Not seen yet hides seen ones',await ev(()=>document.querySelectorAll('#modal .btile:not(.unk)').length===0&&document.querySelectorAll('#modal .btile.unk').length>0));
await ev(()=>__A.ACT.lSh('beasts:all'));
// ---- item 4: the regrouped menu
await ev(()=>{__A.V.modal=null;__A.ACT.menu();});await wait(150);
const top=await ev(()=>[...document.querySelectorAll('#modal .mgrp .chip')].map(x=>x.textContent.replace(/\s*\d+ ready$/,'').trim()));
chk('menu groups: Party, Backpack, Quests, Map, Records, Guides, Settings',JSON.stringify(top)===JSON.stringify(['Party','Backpack','Quests','Map','Records','Guides','Settings'])||JSON.stringify(top));
const sub=await ev(()=>{const o={};for(const g of ['gear','quests','records','guides']){__A.ACT.menuGrp(g);o[g]=[...document.querySelectorAll('#modal .msub .chip')].map(x=>x.textContent.trim());}return o;});
chk('Backpack: Equipment, Items, Materials',JSON.stringify(sub.gear)===JSON.stringify(['Equipment','Items','Materials'])||JSON.stringify(sub.gear));
chk('Quests: Quests, Guild missions',JSON.stringify(sub.quests)===JSON.stringify(['Quests','Guild missions'])||JSON.stringify(sub.quests));
chk('Records holds Lore',sub.records.includes('Lore')&&!sub.guides.includes('Lore')||JSON.stringify(sub));
chk('the pinned Save button is still in the menu title',await ev(()=>!!document.querySelector('#modal h2 .savepin [data-act="p5Save"]')));
// ---- Daily Trial: shops still open and no plan button
const daily=await ev(()=>{const A=__A;A.G.daily=1;try{A.V.modal={type:'smithy'};A.render();return {ok:!!document.querySelector('#modal .stabs'),plan:!!document.querySelector('#modal [data-act="p3Smith"]')};}finally{A.G.daily=0;A.V.modal=null;A.render();}});
chk('Daily Trial: the Smithy opens with its tabs and no plan button',daily.ok&&!daily.plan||JSON.stringify(daily));
await done(H);})();
