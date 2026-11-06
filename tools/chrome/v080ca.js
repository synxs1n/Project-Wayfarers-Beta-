// v0.8.2 class roles (roles.js, ROLES in config.js): every class has a primary role and secondary roles delivered by real skills and
// gear; a secondary lands at 55 to 75% of the dedicated class (roleOut: calcDamage and the heal formula, equal level and gear);
// thrown weapons make a thief's Attack Ranged and catch flyers; the new gear has its own icons; an old save loads and gains the new skills.
// Run from tools/chrome: PWHTML=../../out/aurelis3.html node v080ca.js   (OLDHTML = a v0.8.1 build; default: git show 927e63e:index.html)
const {open,chk,done}=require('./pw');const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
(async()=>{
// ----- 1. an old (v0.8.1) save with a Lv 30 monk, bard, thief and healer -----
let oldHtml=process.env.OLDHTML?fs.readFileSync(process.env.OLDHTML,'utf8'):null;
if(!oldHtml){try{oldHtml=execSync('git show 927e63e:index.html',{cwd:path.join(__dirname,'..','..'),maxBuffer:64<<20}).toString();}catch(e){oldHtml=null;}}
let saved=null;
if(oldHtml){const O=await open({html:oldHtml});
  saved=await O.ev(()=>{const A=__A;A.ACT.new();['dorn','brook','tamsin'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;
    ['dorn','brook','tamsin','lumen'].forEach(id=>{const c=A.newChar(id,30,3);G.roster[id]=c;});G.party=['dorn','brook','tamsin','lumen'];
    A.render();A.saveGame();const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o;});
  await O.browser.close();}
const pre='localStorage.clear();'+(saved?`(function(o){for(const k in o)localStorage.setItem(k,o[k]);})(${JSON.stringify(saved)});`:'');
const H=await open({pre});const {ev,wait}=H;
if(saved){const r=await ev(()=>{const A=__A;A.ACT.cont();const G=A.G,out={};
    ['dorn','brook','tamsin','lumen'].forEach(id=>{const c=G.roster[id];out[id]={lv:c.lv,rl:A.known(c).filter(s=>s.rl).map(s=>s.id)};});return out;});
  await wait(200);await ev(()=>__A.render());await wait(300);
  const note=await ev(()=>{const el=document.getElementById('lnq');return el?el.textContent:'';});
  chk('old v0.8.1 save loads; the Lv 30 Monk knows Chi Mend, Harmony Meditation and Lotus Circle',['r_chimend','r_harmony','r_lotus'].every(k=>r.dorn.rl.includes(k))||JSON.stringify(r.dorn));
  chk('old save: the Bard knows Anthem of Valor, its Aria, Healing Ballad, Restoring Chorus and the Storm Song',['r_anthem','r_aria','r_ballad','r_chorus','r_storm'].every(k=>r.brook.rl.includes(k))||JSON.stringify(r.brook));
  chk('old save: the Thief knows Throwing Stars, Kunai Volley, Hamstring, Toxic Cloud and Fuma Shuriken',['r_stars','r_kunai','r_hamstr','r_toxin','r_fuma'].every(k=>r.tamsin.rl.includes(k))||JSON.stringify(r.tamsin));
  chk('old save: a "learned" notice announces the new skills',/learned/.test(note)||note);
}else chk('old build available (OLDHTML or git show 927e63e:index.html)',false);
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.stage=2;});
// ----- 2. roles: primary and secondaries, the 55 to 75% band -----
const T=await ev(()=>({t30:__A.roleTable(30,3),t40:__A.roleTable(40,5),band:__A.ROLES.band,cls:Object.keys(__A.TW.get('CLS'))}));
chk('every class (legends and the Chronicler too) has a primary and one or two secondary roles',T.cls.every(k=>T.t30[k]&&T.t30[k].primary&&T.t30[k].secondary.length>=1&&T.t30[k].secondary.length<=2)||T.cls.filter(k=>!T.t30[k]).join(','));
for(const [lv,tab] of [[30,T.t30],[40,T.t40]]){
  const out=[],prim=[];Object.keys(tab).forEach(k=>{const R=tab[k];R.secondary.forEach(r=>{const v=R.share[r];if(!(v>=T.band[0]&&v<=T.band[1]))out.push(k+' '+r+' '+v);});if(!(R.share[R.primary]>=.8))prim.push(k+' '+R.share[R.primary]);});
  console.log('lv '+lv+': '+Object.keys(tab).map(k=>k+' '+Object.entries(tab[k].share).map(([r,v])=>r+' '+Math.round(v*100)+'%').join(' ')).join(' | '));
  chk(`Lv ${lv}: every secondary role delivers 55 to 75% of the dedicated class's output`,out.length===0||out.join('; '));
  chk(`Lv ${lv}: every primary role delivers at least 80% of the dedicated class's`,prim.length===0||prim.join('; '));}
// ----- 3. real skills and gear behind each secondary -----
const kit=await ev(()=>{const A=__A,R=A.ROLES,o={};Object.keys(R.cls).forEach(cls=>{const id=Object.keys(A.TPL).find(i=>A.TPL[i].cls===cls&&!A.TPL[i].mon);if(!id)return;
    const L=A.classSkills(A.TPL[id]);o[cls]={id,miss:R.cls[cls].s.filter(r=>!L.some(s=>s.rl===r)),wpn:(A.CLS_WPN[cls]||[]).slice()};});
  const fams=['thrown','beads','wand','censer','warhammer','standard','lyre'];
  o._fam=fams.map(f=>({f,tiers:[0,1,2,3,4,5].filter(t=>A.GEAR['w_'+f+'_'+t]).length,perk:!!A.WPERK[f],name:!!A.WT_NAME[f],dl:A.TW.get('WT_DL')[f]}));
  A.G.stage=2;o._shop=A.shopStock('charms');o._charms=R.charms.map(c=>c.id);
  const c=A.newChar('lumen',20,2);const h0=c.S.healUp||0;c.eq.c='c_rl_mend';c.S=A.calcStats(c);o._mend=[h0,c.S.healUp];
  const m=A.newChar('mira',20,2);m.eq.c='c_rl_hex';m.S=A.calcStats(m);o._hex=[m.S.status,m.S.debT];
  o._desc=A.gearDesc('w_thrown_2')+' | '+A.gearDesc('c_rl_herald');return o;});
const roleW={warrior:'warhammer',knight:'standard',mage:'wand',healer:'censer',thief:'thrown',monk:'beads',bard:'lyre'};
chk('every secondary role comes with a real class skill that carries it (rl tag)',Object.keys(kit).filter(k=>k[0]!=='_'&&kit[k].miss.length).map(k=>k+': '+kit[k].miss).join('; ')||true);
chk('each standard class has a role weapon family (thrown, beads, wand, censer, warhammer, standard, lyre)',Object.keys(roleW).every(k=>kit[k].wpn.includes(roleW[k]))||JSON.stringify(roleW));
chk('the role weapons have 6 tiers, a perk, a name and a delivery (thrown is Ranged)',kit._fam.every(f=>f.tiers===6&&f.perk&&f.name&&f.dl)&&kit._fam.find(f=>f.f==='thrown').dl==='ranged'||JSON.stringify(kit._fam));
chk('role charms are sold at the charm stall from the second realm',kit._charms.every(id=>kit._shop.includes(id))||kit._shop.join(','));
chk("Mender's Locket adds +12% healing, Hexer's Eye +20% debuff chance and +1 turn",Math.abs(kit._mend[1]-kit._mend[0]-.12)<1e-9&&Math.abs(kit._hex[0]-1.2)<1e-9&&kit._hex[1]===1||JSON.stringify([kit._mend,kit._hex]));
chk('gear text names the perks',/Ranged/.test(kit._desc)&&/1 turn longer/.test(kit._desc)||kit._desc);
// ----- 4. thrown attacks are Ranged and catch flyers -----
const fly=await ev(()=>{const A=__A,G=A.G;G.roster.sable=A.newChar('sable',26,2);G.party=['sable','lumen','oren'];const c=G.roster.sable;
  A.startBattle({stage:1,kind:'field'});const B=A.B,t=B.en[0];t.ty=['flying'];const me=B.front.find(u=>u.id==='sable');const o={};
  const atk=A.TW.get('ATTACK');o.dagger=[A.deliveryOf(me,atk),A.TW.get('archMult')(me,atk,t)];
  c.eq.w='w_thrown_2';me.S=A.calcStats(me);o.thrown=[A.deliveryOf(me,atk),A.TW.get('archMult')(me,atk,t)];
  const sk=A.known(me).filter(s=>s.rl==='ranged');o.skills=sk.map(s=>[s.id,A.deliveryOf(me,s),A.TW.get('archMult')(me,s,t)]);
  const r=A.TW.get('calcDamage')(me,atk,t);o.am=r.am;
  // chi heals draw on attack
  G.roster.dorn=A.newChar('dorn',30,3);const d=G.roster.dorn,cm=A.known(d).find(s=>s.id==='r_chimend');o.chi=[cm&&cm.chi,Math.round(d.S.healP),Math.round(A.ROLES.w.chiK*d.S.atk)];
  A.V.modal=null;A.TW.get('finishBattle')('x');return o;});
console.log(JSON.stringify(fly));
chk('a thief with a dagger attacks with Piercing (glances off flyers less than Ranged)',fly.dagger[0]==='piercing'&&fly.dagger[1]<1.4||JSON.stringify(fly.dagger));
chk('a thief with throwing stars attacks with Ranged and hits a flying foe for x1.4',fly.thrown[0]==='ranged'&&Math.abs(fly.thrown[1]-1.4)<1e-9&&Math.abs((fly.am||0)-1.4)<1e-9||JSON.stringify(fly.thrown)+' am '+fly.am);
chk('Throwing Stars, Kunai Volley and Fuma Shuriken are Ranged and catch flyers (x1.4)',fly.skills.length>=3&&fly.skills.every(s=>s[1]==='ranged'&&Math.abs(s[2]-1.4)<1e-9)||JSON.stringify(fly.skills));
chk('Monk chi heals use the better of healing power and chiK x attack',fly.chi[0]===1&&fly.chi[2]>fly.chi[1]||JSON.stringify(fly.chi));
// ----- 5. a battle heal with Chi Mend actually heals by the chi power -----
const heal=await ev(()=>{const A=__A,G=A.G;G.roster.oren=A.newChar('oren',40,3);G.party=['dorn','lumen','oren'];A.startBattle({stage:1,kind:'field'});const B=A.B,d=B.front.find(u=>u.id==='dorn'),o=B.front.find(u=>u.id==='oren');
  o.hp=Math.max(1,Math.round(o.S.mhp*.2));const h0=o.hp;const sk=A.known(d).find(s=>s.id==='r_chimend');A.perform(d,sk,[o]);const got=o.hp-h0;const exp=sk.pw*Math.max(d.S.healP,A.ROLES.w.chiK*d.S.atk);
  A.V.modal=null;A.TW.get('finishBattle')('x');return {got,exp:Math.round(exp),hp:d.S.healP};});
chk('Chi Mend in battle heals about pw x chi power ('+heal.got+' vs '+heal.exp+')',heal.got>=heal.exp*.9&&heal.got<=heal.exp*1.1||JSON.stringify(heal));
// ----- 6. new gear icons are their own -----
const ic=await ev(async()=>{const A=__A,src=h=>(/src="([^"]+)"/.exec(h||'')||[])[1]||'';const ids=Object.keys(A.GEAR).filter(id=>/^w_(thrown|beads|wand|censer|warhammer|standard|lyre)_\d$/.test(id)||/^c_rl_/.test(id));
  const all=Object.keys(A.GEAR).map(id=>[id,src(A.gearIcon(id))]);const m={};all.forEach(([id,u])=>{(m[u]=m[u]||[]).push(id);});
  return {n:ids.length,dup:ids.filter(id=>m[src(A.gearIcon(id))].length>1).map(id=>m[src(A.gearIcon(id))].join('=')),empty:ids.filter(id=>!src(A.gearIcon(id)))};});
chk(`the ${ic.n} new gear pieces (42 role weapons, 6 charms) each have a unique icon`,ic.n===48&&!ic.dup.length&&!ic.empty.length||JSON.stringify(ic));
// ----- 7. party scoring hook and the class card -----
const hr=await ev(()=>{const A=__A,c=A.G.roster.dorn||A.newChar('dorn',30,3);const r=A.heroRoleSet(c);A.V.modal={type:'char',id:'lumen'};A.render();const card=(document.querySelector('#modal .rlline')||{}).textContent||'';A.V.modal=null;A.render();
  return {r,card,leak:Object.keys(A.TPL).filter(k=>/^_rl_/.test(k))};});
chk('heroRoleSet(c) gives primary, secondaries, has and output shares (Monk: phys; healer, buffer)',hr.r&&hr.r.primary==='phys'&&hr.r.secondary.join()==='healer,buffer'&&hr.r.has.healer&&hr.r.out.healer>0||JSON.stringify(hr.r));
chk('the measuring templates never stay in TPL',hr.leak.length===0||hr.leak.join(','));
chk('the hero sheet class card names the roles',/Role/.test(hr.card)&&/Also/.test(hr.card)||hr.card);
await done(H);})();
