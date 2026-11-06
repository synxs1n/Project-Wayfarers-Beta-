// ===== npc2.js (v0.4.1): NPC dialogue =====
// Each NPC keeps their original line (and the re-lit town variant) and gains more: realm flavor, hints that adapt to the journey (no spoilers)
// and lore tied to the realm and the boss waiting in it. Lines cycle through a per-NPC shuffled order and never repeat back to back.
// Lore lines that are heard are saved in G.loreHeard and shown in Guides > Lore.
const NPC_FLAVOR=[
 'I have lived here all my life and I still get lost behind the baker\'s.',
 'If you find a coin on the road, it is not yours. It is mine. I dropped it in spirit.',
 'The weather talks to my knees before it talks to anyone else.',
 'Best advice I ever got: never trust a chest that looks too happy to see you.',
 'My cousin says wayfarers eat nothing but sandwiches. Is that true?',
 'The beacons are lovely, but who pays for the oil? Asking for a friend.',
 'I counted the stars last night. I lost count. I will try again tonight.',
 'Do not wake the cat. The cat has had a day.',
 'They say the roads are safer now. They said that last year too.',
 'A little rest, a little soup, a lot of luck. That is the whole trick.'];
function npcHints(m){
  const H=[],p=(typeof partyChars==='function')?partyChars():[],all=Object.values(G.roster||{});
  const st=m.s|0;
  if(!G.cleared[st])H.push('Dungeon doors do not budge by force. Hunt for a lever in a side room, then the key room.');
  if(p.length<4)H.push('Taverns and the road both have wayfarers looking for work. A fuller party hits harder and survives longer.');
  if(p.some(c=>c.hp<c.S.mhp*.5))H.push('The Inn is cheap compared with a lost battle. Everyone leaves rested.');
  if(all.some(c=>c.hp<=0))H.push('The fallen do not rise on their own now. A healer\'s revive, a plume or the Inn will bring them back.');
  if(all.some(c=>c.ail&&Object.keys(c.ail).length))H.push('Poison, curses and wounds linger after a fight. The apothecary sells salts, ash and bandages for just that.');
  if(G.weather&&G.weather[st]&&G.weather[st]!=='clear')H.push('Mind the sky. Weather nudges elements up and down in battle, and the tag at the top says how.');
  if(typeof partyHi==='function'&&partyHi()<st*8-1)H.push('The road ahead is steeper than it looks. A few more fights before the next big one would not hurt.');
  if((G.gold||0)>=400)H.push('Coins in a pouch do nothing. The smithy and the alchemist turn them into survival.');
  H.push('Auto battle is fine for a quiet road. Elites, minibosses and challenges want your own hands.');
  H.push('A foe that shows a shield wants hitting where it is weak. Break it, then pile on.');
  return H;}
function npcLore(m){
  const k=(typeof bossAtStage==='function')?bossAtStage(m.s|0):null,B=k&&BTHEME[k];if(!B)return [];
  return [B.omen].concat(B.npc||[]).filter(Boolean);}
function npcPool(n,m,orig){
  const rel=m.kind==='town'&&G.cleared[m.s]&&!n.festive&&n.wander?RELIT_LINES[hashS(n.name)%RELIT_LINES.length]:null;
  const out=[{t:orig,k:'f'}];if(rel&&rel!==orig)out.push({t:rel,k:'f'});
  const h=hashS(n.name+m.id);for(let i=0;i<3;i++)out.push({t:NPC_FLAVOR[(h+i*3)%NPC_FLAVOR.length],k:'f'});
  npcHints(m).forEach(t=>out.push({t,k:'h'}));
  npcLore(m).forEach(t=>out.push({t,k:'l'}));
  // lines are unique
  const seen=new Set();return out.filter(o=>o.t&&!seen.has(o.t)&&seen.add(o.t));}
function npcWords(n,m){
  const orig=n.line||'';if(!G||G.daily)return orig;
  G.npcT=G.npcT||{};const key=m.id+':'+n.name,st=G.npcT[key]||(G.npcT[key]={last:-1,n:0}),pool=npcPool(n,m,orig);
  if(pool.length<2)return orig;
  // first conversation is always the original line; afterwards cycle through a name-seeded shuffle
  let i;if(st.n===0)i=0;else{const ord=pool.map((_,j)=>j).sort((a,b)=>hashS(n.name+a)-hashS(n.name+b));i=ord[(st.n-1)%ord.length];if(i===st.last)i=ord[st.n%ord.length];if(i===st.last)i=(i+1)%pool.length;}
  st.n++;st.last=i;const o=pool[i];
  if(o.k==='l'){G.loreHeard=G.loreHeard||[];if(!G.loreHeard.some(x=>x.t===o.t))G.loreHeard.push({s:m.s|0,t:o.t});}
  return o.t;}
