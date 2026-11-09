// ===== arena9.js (v0.13.4): the arena is the Guild Hall's farm, and the Pit Masters are its guild =====
// 1) The arena is entered only from the Guild Hall (the Menu's Arena tab only reads). Each tier pays gold, the realm's material and a
//    tiered "rare" purse (ore, wood, herb of the tier; Dread Cores, Wisp Ichor and Golem Grit from the Golden Coliseum up) on every win,
//    so it is the place to farm gold and the rare materials tempering wants. 2) A seventh guild, the Pit Masters: standing from arena wins
//    (8 + 6 x tier per win), perks: arena purse +5% / +10%, one more material per win, the Pit counter (Dread Cores, relic bundles, Elixirs),
//    the Pitmark Charm, Champion's Belt and the title Pit Master. 3) The Guild Hall's Guilds tab opens with a Guild shop section listing
//    every counter you have unlocked (and which rank opens the others). No save fields: wins live in G.arena, claims in G.fac.claim.
const ARENA9_REWARD=[{gold:600,mat:3},{gold:1300,mat:4,charm:1},{gold:2600,mat:6,charm:1,core:1},{gold:6000,mat:8,charm:1,core:2},{gold:9500,mat:10,charm:1,core:3}];
const ARENA9_RARE=[[['copper',2],['oak',2],['bluecap',2]],[['iron',2],['ash',2],['sunpetal',2]],[['mythril',1],['elder',1],['starbloom',1],['ichor',2]],[['mythril',2],['elder',2],['starbloom',2],['ichor',2],['grit',2]],[['mythril',3],['elder',3],['starbloom',3],['grit',3],['ichor',3]]];
try{ARENA.forEach((A,i)=>{if(ARENA9_REWARD[i])A.reward=Object.assign({},A.reward,ARENA9_REWARD[i]);});}catch(e){}
// ----- the Pit Masters -----
try{
  const P={id:'pit',n:'Pit Masters',i:'⚔',col:'#d05050',desc:'The arena crowd. Every bout you win in the pit earns its respect, the higher the tier the more.',
    ranks:['Challenger','Brawler','Gladiator','Champion','Crowd Favourite','Pit Master'],
    perks:[{t:'Arena purse +5%',k:'agold',v:.05},{t:'Arena purse +10%',k:'agold',v:.10},{t:'One more material from every arena win',k:'amat',v:1},{t:'Pit counter: Dread Cores, relic bundles and Elixirs at the Pit counter',k:'stock'},
      {t:'Pitmark Charm, a unique charm',k:'charm',id:'c_fa6'},{t:"Signature: Champion's Belt, a strong unique charm, and the title Pit Master",k:'sig',id:'c_fb6'}]};
  FAC.push(P);FACB.pit=P;
  FAC3.pit={n:['Challenger','Brawler','Gladiator','Champion','Pit Master'],t:['Arena purse +5%.','Arena purse +10%.','One more material from every arena win.','The Pit counter (Dread Cores, relic bundles, Elixirs).',"Two unique charms (Pitmark Charm, Champion's Belt) and the title Pit Master."]};
  FSTOCK.pit=[['core','Dread Core',400],['$rel','Realm relic (3)',150,3],['elixir','Elixir',420,1,1]];
  addGear('c_fa6',{n:'Pitmark Charm',slot:'c',tier:3,price:1300,unique:1,hp:100,atk:10,def:8,spd:4});
  addGear('c_fb6',{n:"Champion's Belt",slot:'c',tier:4,price:2000,unique:1,hp:160,atk:16,def:12,spd:6});
  [['p1','pit','First blood','Win 1 arena bout.','arena',1,14,1],['p2','pit','A regular','Win 3 arena bouts.','arena',3,24,1],['p3','pit','Crowd favourite','Win 6 arena bouts.','arena',6,36,2],['p4','pit','Silver and up','Win 3 bouts in the Silver Ring or higher.','arenaHi',3,40,2],['p5','pit','Legend of the pit','Win 12 arena bouts.','arena',12,60,3]]
    .forEach(a=>FMIS.push({id:a[0],f:a[1],t:a[2],d:a[3],k:a[4],n:a[5],rep:a[6],r:a[7]}));
}catch(e){}
function arenaWins(){try{return (G.arena||[]).reduce((a,n)=>a+(n|0),0);}catch(e){return 0;}}
{const fd0=facDerived;facDerived=function(k){if(k==='arena')return arenaWins();if(k==='arenaHi'){try{return (G.arena||[]).reduce((a,n,i)=>a+(i>=1?(n|0):0),0);}catch(e){return 0;}}return fd0.apply(this,arguments);};}
{const fr0=facRaw;facRaw=function(id){if(id==='pit'){try{return (G.arena||[]).reduce((a,n,i)=>a+(n|0)*(8+6*i),0);}catch(e){return 0;}}return fr0.apply(this,arguments);};}
// ----- the win: the rare purse and the Pit Masters' perks -----
HOOK.after('win','arena9','arena rare purse and Pit perks',function(){try{const sp=B&&B.spec;if(!sp||sp.kind!=='arena'||!G||G.daily)return;const t=sp.tier|0,A=ARENA[t];if(!A)return;
  const info=(B&&B.result)||(V.modal&&V.modal.info)||{};info.notes=info.notes||[];const got=[];
  (ARENA9_RARE[t]||[]).forEach(([m,n])=>{G.mats[m]=(G.mats[m]||0)+n;got.push(`${n} ${MATS[m]||m}`);});
  const ag=facSum('agold'),am=facSum('amat');if(ag>0){const g=Math.round(econG(A.reward.gold)*ag);G.gold+=g;info.gold=(info.gold||0)+g;got.push(`${fmt(g)} gold from the Pit Masters`);}
  if(am>0){const mt=ZS(Math.min(G.stage,4)).mat;G.mats[mt]=(G.mats[mt]||0)+am;got.push(`${am} ${MATS[mt]||mt} from the Pit Masters`);}
  if(got.length)info.notes.push(`The pit's purse: ${got.join(', ')}.`);facDirty();}catch(e){}});
// ----- the arena card: enter only from the Guild Hall; the tiers list their rare purse -----
function arena9Rare(t){return (ARENA9_RARE[t]||[]).map(([m,n])=>`${n} ${MATS[m]||m}`).join(', ');}
{const na0=nbArena;nbArena=function(menu){let h=na0.apply(this,arguments);try{
  if(menu){h=h.replace(/<button class="btn sm gold" data-act="arena"[^>]*>Enter<\/button>/g,'');h=h.replace(' Enter it from any town.','').replace('<p class="note">The guild\'s fighting pit.','<p class="note"><b>Enter from the Guild Hall in any town.</b> The guild\'s fighting pit.');}
  h=h.replace('no rest between waves.','no rest between waves. The pit is where gold and rare materials are farmed: every win pays its purse again, and the Pit Masters guild adds to it.');
  ARENA.forEach((A,i)=>{const r=arena9Rare(i);if(r)h=h.replace(`${fmt(A.reward.gold)} gold, ${A.reward.mat} materials`,`${fmt(A.reward.gold)} gold, ${A.reward.mat} materials, ${r}`);});}catch(e){}return h;};}
// ----- the Guild shop section on the Guilds tab -----
function vGuildShop(){try{if(!G||G.daily)return '';const here=inTown();const rows=FAC.map(F=>{const si=F.perks.findIndex(p=>p&&p.k==='stock')+1;if(!si)return '';const open=facTier(F.id)>=facTierOf(si),S=FSTOCK[F.id]||[];
    if(!open)return `<div class="row dim"><div class="grow"><b>${F.i} ${esc(F.n)} counter</b><small>Opens at rank ${facTierOf(si)}, ${esc(facTierName(F.id,facTierOf(si)))}.</small></div></div>`;
    return `<div class="row"><div class="grow"><b>${F.i} ${esc(F.n)} counter</b><small>${S.map(x=>esc(x[1])).join(' · ')}</small></div><div class="btns">${S.map((x,i)=>`<button class="btn sm" data-act="facBuy" data-arg="${F.id}:${i}" title="${esc(x[1])}" ${!here||G.gold<x[2]?'disabled':''}>${esc(x[1].replace(/ \(3\)| bundle/g,''))} ${fmt(x[2])}g</button>`).join('')}</div></div>`;}).filter(Boolean);
  return `${m3H('Guild shop')}<p class="note">Every guild counter you have unlocked, in one place.${here?'':' Buy in town, at the Guild Hall.'}</p><div class="rows compact gshop">${rows.join('')}</div>`;}catch(e){return '';}}
{const ng0=nbGuilds;nbGuilds=function(sec){const h=ng0.apply(this,arguments);try{if(sec==='all'){const k=h.indexOf(m3H('Ranks and perks'));const s=vGuildShop();return k>=0?h.slice(0,k)+s+h.slice(k):h+s;}}catch(e){}return h;};}
{const st=document.createElement('style');st.textContent='.gshop .row.dim{opacity:.6}.gshop .btns{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end;max-width:60%}.gshop .btns .btn.sm{font-size:.72em;padding:4px 7px}';document.head.appendChild(st);}
