// ===== Beta v0.6.3: icons part 2: charms, personal rewards, Echoforged, consumables, materials, and the hooks =====
// ----- small glyphs (5x5, '#' takes the glyph key) -----
const IC_GLY={
 cross:['..#..','..#..','#####','..#..','..#..'],eye:['.....','.###.','#.#.#','.###.','.....'],flame:['..#..','.##..','.###.','#####','.###.'],
 drop:['..#..','.###.','.###.','#####','.###.'],leaf:['...##','..###','.###.','###..','#....'],bolt:['...#.','..##.','.###.','.##..','.#...'],
 snow:['#.#.#','.###.','##.##','.###.','#.#.#'],sun:['..#..','.###.','#####','.###.','..#..'],moon:['.###.','##...','#....','##...','.###.'],
 wind:['####.','....#','.###.','#....','.####'],star:['..#..','.###.','#####','.#.#.','#...#'],rock:['..#..','.###.','.####','#####','#####'],
 heart:['.#.#.','#####','#####','.###.','..#..'],fist:['.###.','#####','#####','####.','.##..'],shell:['..#..','.###.','#.#.#','#####','.###.'],
 feather:['...##','..##.','.##..','##...','#....'],clover:['.#.#.','#####','.###.','#####','..#..'],hammer:['####.','####.','.#...','.#...','.#...'],
 wave:['.....','.#..#','#.##.','.....','#####'],key:['.##..','#..#.','.##..','..#..','..##.'],hand:['#.#.#','#####','#####','.####','.###.'],
 page:['####.','#..##','#####','#...#','#####'],paw:['#.#.#','.....','.###.','#####','.###.'],shield:['#####','#####','#####','.###.','..#..'],
 sword:['....#','...#.','#.#..','.#...','#.#..'],arrow:['..###','...##','..#.#','.#...','#....'],note:['..##.','..#.#','..#..','###..','##...'],
 aim:['..#..','.#.#.','##.##','.#.#.','..#..'],quill:['...##','..###','.##..','##...','#....'],orb:['.###.','##..#','#...#','#...#','.###.'],
 thorn:['#...#','.#.#.','..#..','.#.#.','#...#'],spire:['..#..','..#..','.###.','.###.','#####'],crown:['#.#.#','#####','#####','.....','.....'],
 ring:['.###.','#...#','#...#','#...#','.###.']};
function icGlyph(b,x,y,name,k){icArt(b,x,y,(IC_GLY[name]||IC_GLY.star).map(r=>r.replace(/#/g,k)));}
// ----- charm bodies (7x7) -----
const IC_BODY={
 round:['..###..','.#####.','#######','#######','#######','.#####.','..###..'],
 drop:['...#...','..###..','.#####.','#######','#######','.#####.','..###..'],
 shield:['#######','#######','#######','#######','.#####.','..###..','...#...'],
 diamond:['...#...','..###..','.#####.','#######','.#####.','..###..','...#...'],
 heart:['.##.##.','#######','#######','#######','.#####.','..###..','...#...'],
 seal:['.#####.','#######','#######','#######','#######','#######','.#####.'],
 star:['...#...','..###..','#######','.#####.','.#####.','.##.##.','##...##'],
 leaf:['....###','..#####','.######','#######','######.','#####..','.##....'],
 crescent:['..###..','.##....','##.....','##.....','##.....','.##....','..###..'],
 fang:['#######','.#####.','.#####.','..###..','..###..','...#...','...#...'],
 knot:['.##.##.','#..#..#','#..#..#','.##.##.','#..#..#','#..#..#','.##.##.'],
 wing:['......#','....###','..#####','.######','#######','.##.##.','#..#..#'],
 vial:['..###..','...#...','..###..','.#####.','#######','#######','.#####.'],
 page:['######.','#######','#######','#######','#######','#######','#######'],
 hammer:['#######','#######','..###..','...#...','...#...','...#...','..###..'],
 anvil:['#######','.######','...###.','...##..','..####.','.######','.......'],
 paw:['#.#.#..','.......','.###...','#####..','.###...','.......','.......'],
 crest:['#.#.#.#','#######','#######','#######','.#####.','..###..','...#...'],
 pearl:['.......','..###..','.#####.','.#####.','..###..','.......','.......']};
function icBody(b,x,y,name,k){icArt(b,x,y,(IC_BODY[name]||IC_BODY.round).map(r=>r.replace(/#/g,k)));}
function icBodyRim(b,x,y,name,k){const R=IC_BODY[name]||IC_BODY.round;R.forEach((r,j)=>{for(let i=0;i<r.length;i++){if(r[i]!=='#')continue;
  const e=(R[j-1]||'')[i]!=='#'||(R[j+1]||'')[i]!=='#'||r[i-1]!=='#'||r[i+1]!=='#';if(e)icSet(b,x+i,y+j,k);}});}
// a pendant: a cord, chain or pin bar, the body (7x7 at 4,6), an inset glyph and dots
function icPendant(b,s){const cord=s.cord||'chain',by=s.by||6;
  if(cord==='pin'){icRect(b,2,3,12,1,'M');icSet(b,13,2,'M');icSet(b,1,3,'M');icRect(b,7,4,2,2,'M');}
  else if(cord!=='none'){const k=cord==='chain'?'T':'L';icLine(b,3,0,7,4,k);icLine(b,12,0,8,4,k);if(cord==='chain')[1,3].forEach(i=>{icSet(b,3+i,i,'t');icSet(b,12-i,i,'t');});icRect(b,7,4,2,2,'M');}
  icBody(b,4,by,s.body||'round','G');
  if(s.rim)icBodyRim(b,4,by,s.body||'round',s.rim);
  if(s.gly)icGlyph(b,5,by+1,s.gly,s.gk||'S');
  (s.dot||[]).forEach(([a,c,k2])=>icSet(b,a,c,k2||'S'));}
// charm designs per id
const IC_CHARM={
 c_vital:{body:'heart',G:'#e04a5a',cord:'cord',dot:[[6,7]]},
 c_mana:{body:'drop',G:'#4a8aff',cord:'cord',dot:[[6,9],[6,10]]},
 c_swift:{body:'wing',G:'#7ae0a0',cord:'cord',rim:'g'},
 c_clarity:{body:'diamond',G:'#bfe6ff',gly:'eye',gk:'X',cord:'chain'},
 c_fth:{body:'round',G:'#fff2b8',gly:'cross',gk:'T',cord:'chain',rim:'T',halo:1},
 c_str:{body:'shield',G:'#a06a4a',gly:'fist',gk:'E',E:'#f0c090',cord:'cord'},
 c_int:{body:'round',G:'#6a5ad0',gly:'eye',gk:'E',E:'#ffe9a0',cord:'chain'},
 c_vit:{body:'leaf',G:'#5ab04a',cord:'cord',dot:[[6,11,'g'],[7,10,'g'],[8,9,'g'],[9,8,'g']]},
 c_spi:{body:'round',G:'#e8d8b8',gly:'shell',gk:'g',cord:'cord'},
 c_agi:{body:'round',G:'#7ad0c0',gly:'wind',gk:'S',cord:'chain'},
 c_dex:{body:'diamond',G:'#c89a5a',gly:'feather',gk:'E',E:'#f4ecd8',cord:'cord'},
 c_luk:{body:'round',G:'#3aa04a',gly:'clover',gk:'E',E:'#9af07a',cord:'chain'},
 c_cv0:{body:'round',G:'#5a8a3a',gly:'rock',gk:'g',cord:'cord',rim:'L'},
 c_cv1:{body:'pearl',G:'#f4f0ff',cord:'chain',shell:1},
 c_cv2:{body:'seal',G:'#4a2a2a',gly:'bolt',gk:'E',E:'#ff8a3a',cord:'chain'},
 c_cv3:{body:'fang',G:'#d8f0ff',cord:'cord',dot:[[7,7,'E'],[8,8,'E'],[8,10,'E']],E:'#6ac0ff'},
 c_cv4:{body:'star',G:'#ffe27a',cord:'chain',tail:1},
 c_fa0:{body:'shield',G:'#c84a3a',gly:'crown',gk:'T',cord:'pin'},
 c_fa1:{body:'anvil',G:'#8a8a98',cord:'pin',dot:[[6,6,'T'],[7,6,'T']]},
 c_fa2:{body:'vial',G:'#5ad0a0',cord:'pin'},
 c_fa3:{body:'paw',G:'#a06a3a',cord:'cord',by:7},
 c_fa4:{body:'page',G:'#efe6cc',gly:'quill',gk:'X',cord:'pin'},
 c_fa5:{body:'knot',G:'#c8a060',cord:'cord'},
 c_fb0:{body:'seal',G:'#ffd25a',gly:'crown',gk:'X',cord:'chain',rim:'g',aura:1},
 c_fb1:{body:'hammer',G:'#ffd25a',cord:'chain',dot:[[7,7,'E'],[8,7,'E']],E:'#ff6a3a',aura:1},
 c_fb2:{body:'vial',G:'#b06aff',cord:'chain',rim:'T',aura:1},
 c_fb3:{body:'heart',G:'#e04a5a',gly:'leaf',gk:'E',E:'#7ae07a',cord:'chain',aura:1},
 c_fb4:{body:'page',G:'#fff4d8',gly:'star',gk:'T',cord:'chain',rim:'T',aura:1},
 c_fb5:{body:'round',G:'#ffd25a',gly:'hand',gk:'g',cord:'chain',rim:'T',aura:1},
 c_ft0:{body:'crest',G:'#3a6a3a',gly:'thorn',gk:'E',E:'#9ae06a',cord:'pin'},
 c_ft1:{body:'seal',G:'#2a5a8a',gly:'wave',gk:'E',E:'#bfe6ff',cord:'pin'},
 c_ft2:{body:'shield',G:'#8a2a1a',gly:'flame',gk:'E',E:'#ffa040',cord:'pin'},
 c_ft3:{body:'diamond',G:'#6a8aa8',gly:'snow',gk:'S',cord:'pin'},
 c_ft4:{body:'crest',G:'#3a2a5a',gly:'spire',gk:'E',E:'#c890ff',cord:'pin'}};
const IC_ELGLY={fire:'flame',water:'drop',earth:'rock',wind:'wind',lightning:'bolt',ice:'snow',light:'sun',shadow:'moon'};
const IC_ELBODY={fire:'round',water:'drop',earth:'seal',wind:'round',lightning:'diamond',ice:'diamond',light:'star',shadow:'crescent'};
function icCharmDraw(b,id,g,P){const o={};let s=IC_CHARM[id];
  if(!s&&g.el&&ELC[g.el]){const e=g.el;s={body:IC_ELBODY[e],G:shade(ELC[e],.85),cord:'chain'};
    if(e==='fire'){s.gly='flame';s.gk='E';s.E='#ffd06a';}if(e==='earth'){s.gly='rock';s.gk='g';}if(e==='wind'){s.gly='wind';s.gk='S';}
    if(e==='lightning'){s.gly='bolt';s.gk='X';}if(e==='ice'){s.gly='snow';s.gk='S';}if(e==='light'){s.rim='T';s.dot=[[7,9,'S']];}
    if(e==='shadow')s.dot=[[8,9,'S'],[9,8,'S']];if(e==='water')s.dot=[[6,9,'S'],[6,10,'S']];}
  if(!s)s={body:'round',G:TIER_GEM[Math.min(5,g.tier|0)],cord:'chain'};
  P.G=s.G;if(s.E)P.E=s.E;
  icPendant(b,s);
  if(s.halo)icRect(b,5,1,6,1,'T');
  if(s.shell){P.M='#e8b8a8';icArt(b,3,11,['.MMMMMMM.','MMMMMMMMM','.M.M.M.M.']);}
  if(s.tail){P.E='#ffe9a0';icSet(b,12,5,'E');icSet(b,13,4,'E');icSet(b,14,3,'S');}
  if(id==='c_fa2'||id==='c_fb2'){P.E=id==='c_fa2'?'#9af0c0':'#e0b0ff';icRect(b,6,10,3,2,'E');}
  if(s.aura){o.aura='#ffd25a';o.auraA=.32;o.spark=[[14,1]];}
  return o;}
// ----- personal rewards: signature weapons, Oathmantles, Tokens -----
// per-hero variant: the hero's place among heroes with the same reward kind, class or weight and elements, so no two share an icon
let IC_SIGV=null;
function icSigVar(id,kind){if(!IC_SIGV){IC_SIGV={};const B={};RAW.forEach(r=>{const h=r[0],t=TPL[h];if(!t||!t.el)return;['w','a','c'].forEach(k=>{
  const key=k+':'+(k==='a'?(CLS_ARM[t.cls]||'medium'):k==='c'?'':t.cls)+':'+t.el.join('+');(B[key]=B[key]||[]).push(h);IC_SIGV[k+':'+h]=B[key].length-1;});});}
  return IC_SIGV[kind+':'+id]||0;}
function icElc(t,i){const e=t&&t.el&&(t.el[i]||t.el[0]);return ELC[e]||'#ffd25a';}
const IC_SIGF={
 warrior(b,v){icSword(b,{p:1,pr:.75,g:4,gl:2,T:13.5,l:1,r:.5,tp:.9,gk:'G',pk:'T'});icUV(b,'',(s,vv)=>s>12.6&&vv<-.4);
   icUV(b,'E',(s,vv)=>s>5.5&&s<12&&Math.abs(vv+.5)<.01&&Math.floor(s*2)%(3+v%2)===0);icPt(b,1,0,'X');icPt(b,4,0,'G');
   if(v%3===1){icPt(b,4.5,-2.5,'T');icPt(b,4.5,2.5,'T');}if(v%3===2){icPt(b,3.5,-1.5,'G');icPt(b,3.5,1.5,'G');}if(v>=3){icPt(b,.5,-.5,'E');icPt(b,.5,.5,'E');}},
 knight(b,v){icSword(b,{p:1,pr:.5,g:3.5,gl:2.5,T:14.5,l:.5,r:.5,tp:1.5,ful:'E',gk:'G',pk:'T'});icPt(b,4,-3,'T');icPt(b,4,3,'T');icPt(b,4.5,-3.5,'T');icPt(b,4.5,3.5,'T');icPt(b,3.5,0,'G');
   if(v%3===1){icPt(b,2.5,-1,'T');icPt(b,2.5,1,'T');}if(v%3===2){icPt(b,5,-2,'S');icPt(b,5,2,'S');}if(v>=3){icPt(b,13,-1,'S');icPt(b,12.5,1.5,'S');}},
 mage(b,v){icHaft(b,1,9.5,'W');icPt(b,9.5,-1,'T');icPt(b,9.5,1,'T');icPt(b,10,-1.5,'T');icPt(b,10,1.5,'T');icArt(b,11,0,['.E.','EEE','EGE','EGE','.E.']);icSet(b,12,1,'S');
   [[[9,4],[14,4]],[[14,0],[10,1]],[[9,1],[15,3]],[[9,3],[14,5]]][v%4].forEach(([a,c])=>icSet(b,a,c,'S'));if(v>=4)icSet(b,8,2,'E');},
 healer(b,v){icHaft(b,1,10,'W');icPt(b,10.5,.5,'T');icPt(b,11,0,'T');icArt(b,11,3,['TTT','..T']);icArt(b,11,5,['MMMM','MEEM','MEEM','.MM.']);icSet(b,12,7,'G');
   [[3,0],[6,0],[7.5,.5],[5,.5]].slice(0,1+v%4).forEach(([s,vv])=>icPt(b,s,vv,'T'));if(v>=4)icSet(b,15,9,'S');},
 thief(b,v){icSword(b,{p:3,pr:1,g:5,gl:2,T:12.5,l:0,r:.5,tp:1,wave:1,gk:'G',pk:'T'});icPt(b,3,0,'G');icUV(b,'E',(s,vv)=>s>5.5&&s<12&&icGet(b,...icAt(s,vv))==='M'&&!icGet(b,...icAt(s,vv-.5)));
   if(v%3===1)icPt(b,5,-1.5,'G');if(v%3===2)icPt(b,5,1.5,'G');if(v>=3)icPt(b,2,-1,'T');},
 archer(b,v){ICF.bow(b,1);icLine(b,2,8,12,8,'T');icArt(b,12,6,['E..','EEE','EEE','EEE','E..'].map(r=>r.slice(0,3)));icArt(b,0,7,['GG','.G','GG']);icRect(b,3,6,2,4,'G');
   [[9,0],[9,15],[6,1],[6,14]].slice(0,1+v%4).forEach(([a,c])=>icSet(b,a,c,'T'));},
 monk(b,v,P){P.C='#f4f0e8';P.K=P.E;ICF.knuckles(b,0,P,null,{A:'C',B:'C',C:'G'});icArt(b,12,12,['EE.','.EE','..E','.E.']);icSet(b,7,8,'G');
   [[4,3],[13,3],[3,13],[2,13]].slice(0,1+v%4).forEach(([a,c])=>icSet(b,a,c,'T'));},
 bard(b,v){icArt(b,3,2,['T......T','TT....TT','.T....T.','.TRRRRT.','.TRRRRT.','.TRRRRT.','..TRRT..']);icDisc(b,7.5,11,3,'W');icDisc(b,7.5,11,1,'X');icSet(b,7,11,'G');icArt(b,12,0,['.EE','.E.','EE.']);
   [[1,13],[14,13],[2,8],[13,8]].slice(0,1+v%4).forEach(([a,c])=>icSet(b,a,c,'E'));},
 sniper(b){ICF.crossbow(b,5);icRect(b,7,5,2,6,'X');icArt(b,5,7,['..E.','.EE.','..EE','..E.']);icSet(b,8,0,'G');},
 druid(b){ICF.longbow(b,3);icArt(b,2,0,['M.M','MMM']);icArt(b,2,14,['MMM','M.M']);icSet(b,3,7,'G');icSet(b,3,8,'E');},
 archmage(b){icHaft(b,1,9.5,'W');icDisc(b,12,3,2.6,'E');icDisc(b,12,3,1.2,'G');icSet(b,11,2,'S');icArt(b,9,6,['.S','S.']);icSet(b,15,0,'S');},
 chronicler(b,v,P){ICF.tome(b,4,P);icArt(b,10,0,['.PPP','PPPP','.PP.']);icArt(b,0,0,['PP','PP']);}};
const IC_TOKG={warrior:'sword',knight:'shield',mage:'star',healer:'cross',thief:'key',archer:'arrow',monk:'fist',bard:'note',sniper:'aim',druid:'paw',archmage:'orb',chronicler:'quill'};
function icSigDraw(b,id,g,P){const h=g.only,t=TPL[h]||{},kind=id.startsWith('ua_')?'a':id.startsWith('uc_')?'c':'w',v=icSigVar(h,kind),o={};
  const e1=icElc(t,0),e2=t.el&&t.el[1]?icElc(t,1):'#f4f0f8',q=v%4;
  P.E=e1;P.G=e2;P.T=['#ffd25a','#e0e4ec','#ffb060','#fff0b0'][q];P.M=['#f4f0e8','#a8b4d8','#e8c890','#d0f0ff'][q];P.W=shade(e2,[.55,.8,.38,.68][q]);P.L=shade(e2,[.42,.62,.3,.52][q]);
  if(kind==='w'){(IC_SIGF[t.cls]||IC_SIGF.warrior)(b,v,P);o.aura=icElc(t,0);o.auraA=.3;}
  else if(kind==='a'){const wt=g.fam||'mail';P.C=['#f6ecd0','#dfe4f2','#f2d6bc','#d6ead0'][q];P.K=shade(e1,.8);P.T=t.el&&t.el[1]?e2:'#ffd25a';
    const rows=wt==='robe'?['TTT....TTT','CCCCKKCCCC','CCCCKKCCCC','CC.CKKC.CC','C..CKKC..C','...CKKC...','..CCKKCC..','.CCCKKCCC.','.CCCKKCCC.','CCCCKKCCCC','TTTTTTTTTT']
      :wt==='vest'?['TT......TT','CCCC..CCCC','CCCCKKCCCC','.CCCKKCCC.','.CCCKKCCC.','.CCCKKCCC.','.CCCKKCCC.','.CCCKKCCC.','..TTTTTT..']
      :['TTTT..TTTT','TTMMMMMMTT','TMCCKKCCMT','.MCCKKCCM.','.MCCKKCCM.','.MCCKKCCM.','.MCCKKCCM.','.MTTTTTTM.','..MCKKCM..'];
    icArt(b,3,2,rows);icBody(b,4,4,['shield','diamond','seal','crest'][v%4],'X');icGlyph(b,5,5,IC_ELGLY[t.el&&t.el[0]]||'star','E');
    if(t.el&&t.el[1])[[4,4],[10,4]].forEach(([a,c])=>icSet(b,a,c,'G'));
    o.aura='#ffd25a';o.auraA=.3;o.spark=[[14,1]];}
  else{P.M=['#ffd25a','#e0e4ec','#e8a060','#fff0c0'][q];P.C=e1;P.K=e2;const rs=Math.floor(v/4)%3;icRect(b,5,10,2,rs===2?4:5,'C');icRect(b,9,10,2,rs===2?4:5,'K');if(rs===0){icSet(b,5,15,'');icSet(b,10,15,'');}if(rs===1){icSet(b,6,15,'');icSet(b,9,15,'');icSet(b,4,14,'C');icSet(b,11,14,'K');}
    icDisc(b,7.5,6.5,4.6,'M');icDisc(b,7.5,6.5,3.3,'X');P.X=shade(e2,.32);icGlyph(b,5,4,IC_TOKG[t.cls]||'star','E');
    
    o.aura=icElc(t,0);o.auraA=.3;}
  return o;}
// ----- Echoforged: the mythic design of the family in echo colours, with an echo ring -----
function icEfPal(P){Object.assign(P,{M:'#e0c8ff',G:'#b48aff',T:'#ffd9a0',W:'#5a3a8a',L:'#2a1640',E:'#d8b8ff',C:'#6a3aa8',K:'#4a2a7a'});}
// ----- the hooks: drawGearIcon(x,fam,col,tier,glow,id) and the gear icon per item -----
function icFamOf(id,g){const b=baseIdOf(id);if(b==='w_stick')return 'stick';if(g.slot==='c')return 'charm';if(g.fam)return g.fam;const p=b.split('_');return p[1]||'charm';}
function icDrawGear(x,id,glow,glowTier){const g=gearOf(id)||GEAR[baseIdOf(id)];if(!g)return;const bid=baseIdOf(id),fam=icFamOf(id,g),t=Math.min(5,g.tier||0),b=icBuf(),P=icPal(t);let o={};
  if(g.only&&/^u[ac]?_/.test(bid))o=icSigDraw(b,bid,g,P);
  else if(fam==='charm')o=icCharmDraw(b,bid,g,P);
  else if(g.ef){icEfPal(P);o=(ICF[fam]||ICF.blade)(b,5,P,{})||{};o.aura='#b48aff';o.auraA=.5;icArt(b,0,0,['.E.','E.E','.E.']);o.spark=[[13,1]];}
  else{o=(ICF[fam]||ICF.blade)(b,t,P,{glow,glowTier:glowTier||(g.stickP?g.stickP.tier:0)})||{};icSil(b,fam,t);}
  icPaint(x,b,P,o||{});}
// (x, family, colour, tier, Stick glow[, gear id]): with an id, the item's own design; without, the shop design of that family and tier
function drawGearIcon(x,fam,col,tier,glow,id){if(id)return icDrawGear(x,id,glow);const b=icBuf(),P=icPal(tier);const o=fam==='charm'?icCharmDraw(b,'',{tier},P):(ICF[fam]||ICF.blade)(b,Math.min(5,tier||0),P,{glow,glowTier:glow?1:0})||{};icPaint(x,b,P,o);}
// ----- consumables -----
const IC_ITEM={
 campkit(b,P){P.C='#8a5a2a';P.K='#5a3a1a';P.E='#ffb43a';icArt(b,1,4,['..CCCCCCCCCC..','.CCCCCCCCCCCC.','CCKCCCCCCCKCCC','CCKCCCCCCCKCCC','.CCCCCCCCCCCC.','..CCCCCCCCCC..']);icRect(b,4,4,1,6,'L');icRect(b,10,4,1,6,'L');icArt(b,5,10,['..E..','.EEE.','EESEE']);icArt(b,4,13,['WW.WW','.WWW.']);},
 potion(b,P){P.E='#e04a4a';icArt(b,6,1,['LLLL','.MM.']);icArt(b,3,3,['...GGGG...','..GGGGGG..','.GGGGGGGG.','.GEEEEEEG.','GEEEEEEEEG','GEEEEEEEEG','GEEEEEEEEG','.GEEEEEEG.','..GGGGGG..']);icSet(b,5,7,'S');},
 hipotion(b,P){P.E='#ff3a6a';icArt(b,5,0,['.LLLL.','LLLLLL','.TTTT.']);icArt(b,2,3,['...GGGGGG...','..GGGGGGGG..','.GGGGGGGGGG.','.GEEEEEEEEG.','GEEEEEEEEEEG','TTTTTTTTTTTT','GEEEEEEEEEEG','.GEEEEEEEEG.','..GEEEEEEG..','...GGGGGG...']);icSet(b,4,7,'S');icSet(b,5,6,'S');},
 ether(b,P){P.E='#4a8aff';icArt(b,6,0,['LLLL','.MM.']);icArt(b,5,2,['.GGGG.','.GGGG.','GGGGGG','GEEEEG','GEEEEG','GEEEEG','GEEEEG','GEEEEG','GEEEEG','GEEEEG','GEEEEG','.GGGG.']);icSet(b,6,5,'S');icSet(b,6,6,'S');},
 sage(b,P){P.E='#7a5aff';P.W='#7aa04a';icArt(b,6,1,['.WW','WW.']);icArt(b,5,2,['.LLLL','..MM.']);icArt(b,2,4,['...GGGGGG...','..GEEEEEEG..','.GEEEEEEEEG.','GEEEEEEEEEEG','GEEEEEEEEEEG','GEEEEEEEEEEG','.GEEEEEEEEG.','..GGGGGGGG..']);icSet(b,4,7,'S');},
 remedy(b,P){P.E='#5ae07a';icArt(b,6,2,['LLLL','.MM.']);icArt(b,4,4,['GGGGGGGG','GEEEEEEG','GEPPPPEG','GEPXPPEG'.replace('X','P'),'GEPPPPEG','GEEEEEEG','GEEEEEEG','GEEEEEEG','GGGGGGGG']);icSet(b,7,6,'X');icRect(b,6,7,3,1,'X');icSet(b,7,8,'X');P.X='#d83a3a';icSet(b,5,5,'S');},
 elixir(b,P,o){P.E='#ffd04a';P.T='#ffd25a';icArt(b,6,0,['.T.','TST','.T.']);icArt(b,6,3,['.M.']);icArt(b,3,4,['..GGGGG...','.GTTTTTG..','GEEEEEEEG.','GEEEEEEEG.','GEESEEEEG.','GEEEEEEEG.','.GEEEEEG..','..TTTTT...','..T...T...']);icSet(b,4,6,'S');o.aura='#ffd04a';o.spark=[[13,2],[2,12]];},
 vigor(b,P){P.E='#ff9a3a';icArt(b,6,1,['LLLL','.GG.','.GG.']);icArt(b,3,4,['...GG.....','...GG.....','..GEEG....','..GEEG....','.GEEEEG...','.GEEEEEG..','GEEEEEEEG.','GGGGGGGGG.']);icSet(b,5,7,'S');icSet(b,12,4,'E');icSet(b,13,3,'S');},
 holywater(b,P,o){P.E='#bfe6ff';P.T='#f0c050';icArt(b,6,0,['.TT.','TTTT','.MM.']);icArt(b,4,3,['..GGGG..','.GEEEEG.','GEEEEEEG','GEETTEEG','GETTTTEG','GEETTEEG','GEETTEEG','GEEEEEEG','.GEEEEG.','..GGGG..']);o.aura='#fff2b8';o.auraA=.3;},
 plume(b,P,o){P.F='#ff7a3a';P.E='#ffd04a';icUV(b,'F',(s,v)=>s>2&&s<14&&Math.abs(v+ .3)<=Math.min(1.6,(14-s)*.4,(s-2)*.6)+.01);icUV(b,'E',(s,v)=>s>5&&s<13&&Math.abs(v+1.5)<.01&&Math.floor(s)%2===0);icHaft(b,.5,13.5,'B');icPt(b,12,-1,'S');o.spark=[[14,1]];},
 salts(b,P){P.C='#e0d8b0';icArt(b,5,1,['.LL.','LLLL']);icArt(b,3,3,['..CCCCCC..','.CCCCCCCC.','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','.CCCCCCCC.','..CCCCCC..']);icRect(b,5,3,6,1,'L');icArt(b,10,0,['..S','.S.']);icSet(b,13,2,'S');icSet(b,6,7,'K');icSet(b,9,8,'K');},
 ash(b,P){P.M='#a89a8a';P.C='#d8d0c8';icArt(b,4,1,['..MMMM..','.MMMMMM.']);icArt(b,4,3,['MMMMMMMM','.MCCCCM.','MCCCCCCM','MCCXXCCM','MCCCCCCM','MCCCCCCM','.MCCCCM.','..MMMM..','.MMMMMM.']);P.X='#9a7aff';icSet(b,4,7,'M');},
 bandage(b,P){P.C='#f0e8d8';icDisc(b,6,8,4.2,'C');icDisc(b,6,8,1.3,'K');icArt(b,9,9,['CCCCC','CCCCC','.CCCC']);icSet(b,11,10,'X');P.X='#e04a4a';icSet(b,10,10,'X');icSet(b,12,10,'X');},
 porkchop(b,P){P.C='#e0b070';P.E='#c8743a';icArt(b,1,4,['..CCCCCCCCCC..','.CCCCCCCCCCCC.']);icRect(b,1,6,14,1,'G');P.G='#5ac04a';icRect(b,1,7,14,2,'E');icRect(b,2,9,12,1,'X');P.X='#f4d04a';icArt(b,1,10,['CCCCCCCCCCCCCC','.CCCCCCCCCCCC.']);icSet(b,4,4,'S');},
 tent(b,P){P.C='#7aa04a';P.K='#5a7a3a';icArt(b,1,2,['.......M......','......CCC.....','.....CCCKC....','....CCCKKKC...','...CCCKXKKKC..','..CCCKXXXKKKC.','.CCCKXXXXKKKKC','CCCKXXXXXXKKKK']);P.X='#2a1a10';icRect(b,0,10,16,1,'L');icSet(b,7,1,'T');}};
function drawItemIconV3(x,id){const b=icBuf(),P=icPal(1),o={};const f=IC_ITEM[id];if(f)f(b,P,o);else{(String(id).includes('sand')?IC_ITEM.porkchop:IC_ITEM.salts)(b,P,o);}
  P.G=P.G||'#d8e8f0';if(['potion','hipotion','ether','sage','remedy','elixir','vigor','holywater'].includes(id))P.G='#d8e8f0';icPaint(x,b,P,o);}
function drawItemIcon(x,id){return drawItemIconV3(x,id);}
function itemIcon(id){return `<img class="gico iico" alt="" src="${cvURL('ii3:'+id,()=>{const c=mkCv(16,16);drawItemIcon(c.getContext('2d'),id);return c;})}">`;}
// ----- materials -----
const IC_MAT={
 copper:['nug','#c87a4a'],iron:['ingot','#9aa0a8'],mythril:['crys','#7ab0f0'],
 oak:['log','#9a6a3a'],ash:['log2','#c8b090'],elder:['log3','#5a4a3a'],
 healroot:['root','#c8a070'],bluecap:['shroom','#4a7ae0'],sunpetal:['flower','#ffd04a'],starbloom:['starf','#e0c8ff'],
 hide:['pelt','#a8784a'],fang:['fang','#ece2c8'],scale:['scale','#4aa08a'],ichor:['wisp','#7af0d0'],grit:['pebbles','#a89a7a'],
 moss:['moss','#5aa040'],shell:['spiral','#f0c8a8'],ore:['ember','#e8553a'],shard:['icicle','#8fdcf0'],feather:['sfeather','#f2c93a'],dust:['dust','#9a6ae0'],core:['core','#c83a3a'],
 essence:['essence','#b48aff']};
const IC_MATF={
 nug(b){icArt(b,3,4,['...MMM....','.MMMMMMM..','MMMMMMMMM.','MMMmMMMMMM','.MMMMMmMMM','..MMMMMMM.','....MMM...']);icSet(b,5,6,'S');},
 ingot(b){icArt(b,2,5,['...MMMMMMMM.','..MMMMMMMMM.','.MMMMMMMMMMm','MMMMMMMMMMmm','mmmmmmmmmmm.']);icRect(b,2,11,10,1,'X');},
 crys(b){icArt(b,3,2,['....M.....','...MMM.M..','...MMMMMM.','..MMMMMMM.','.MMMMMMMMM','LLMMMMMMLL','LLLLLLLLLL','.LLLLLLLL.']);icSet(b,7,4,'S');icSet(b,10,4,'S');},
 log(b){icArt(b,1,5,['.WWWWWWWWWW...','WWWWWWWWWWWLLL','WWWWWWWWWWLWwL','WWWWWWWWWWLwWL','.WWWWWWWWWWLLL']);icSet(b,13,7,'W');},
 log2(b){icArt(b,2,6,['WWWWWWWWWWLL','WWWWWWWWWWLW','WWWWWWWWWWLL']);icArt(b,3,2,['.E.','EEE','.E.','.W.']);},
 log3(b){icArt(b,1,5,['.WWWWWWWWWW...','WWWWWWWWWWWLLL','WWWWEWWWWWLXXL','WWWWWWWWWWLXXL','.WWWWWWWWWWLLL']);icArt(b,2,4,['GG.G..GG']);},
 root(b){icArt(b,5,1,['G.G.G','.GGG.','..G..']);icArt(b,5,4,['.WWW.','WWWWW','WWWWW','.WWW.','..WW.','.W.W.','W...W']);},
 shroom(b){icArt(b,2,2,['...GGGGGG...','.GGGSGGGGGG.','GGGGGGGSGGGG','GGGGGGGGGGGG','....WWWW....','....WWWW....','....WWWW....','...WWWWWW...']);},
 flower(b){icArt(b,3,1,['...GGG....','..GGGGG...','.GGEEEGG..','.GGEEEGG..','..GGGGG...','...GGG....','....L.....','..LLL.....','....L.LL..','....LL....']);},
 starf(b){icArt(b,3,1,['....G.....','....G.....','..GGGGG...','GGGGEGGGG.','..GGGGG...','..G...G...','.G..L..G..','....L.....','..LLL.....','....LL....']);},
 pelt(b){icArt(b,2,2,['.CC....CC.','CCCCCCCCCC','.CCCCCCCC.','.CCCCCCCC.','.CCCCCCCC.','CCCCCCCCCC','CC.CCCC.CC','...CCCC...','....CC....']);icSet(b,7,6,'K');icSet(b,9,8,'K');},
 fang(b){icArt(b,5,2,['MMMMMM','.MMMMM','.MMMM.','..MMM.','..MM..','..MM..','...M..','...M..']);icSet(b,6,3,'S');},
 scale(b){icArt(b,3,3,['..GGGGG...','.GGGGGGG..','GGGgGgGGG.','GGgGGGgGG.','.GGGGGGG..','..GGGGG...','...GGG....','....G.....']);icSet(b,5,4,'S');},
 wisp(b){icArt(b,5,1,['..E...','.EE...','.EEE..','EEEEE.','EESEE.','EEEEE.','.EEE..']);icArt(b,3,9,['.EE..EE.','..EEEE..']);},
 pebbles(b){icArt(b,2,7,['...MM.....','..MMMM.MM.','.MMMMMMMMM','MMMMMMMMMM','.MMmMMMmM.']);icArt(b,5,4,['.MM','MMM']);},
 moss(b){icArt(b,2,5,['..GG..GG....','.GGGGGGGGG..','GGGGGGGGGGG.','GGGgGGGGgGGG','.GGGGGGGGGG.']);icArt(b,3,10,['MMMMMMMMMM']);},
 spiral(b){icArt(b,3,3,['...GGGG...','.GGGGGGGG.','GGGGgggGGG','GGGgGGGgGG','GGGgGgGGGG','.GGGggGGG.','..GGGGGG..','....GGGG..']);icSet(b,5,4,'S');},
 ember(b){icArt(b,3,4,['..XXXXX...','.XXXXXXXX.','XXXEXXXXXX','XXXXEEXXXX','XXXXXXEXXX','.XXXXXXXX.','..XXXXX...']);},
 icicle(b){icArt(b,5,1,['...G..','..GGG.','..GGG.','.GGGG.','.GGSG.','GGGGG.','GGGG..','GGG...','.GG...','.G....']);icSet(b,11,9,'G');icSet(b,11,10,'G');icSet(b,12,11,'G');},
 sfeather(b){icUV(b,'F',(s,v)=>s>2&&s<14&&Math.abs(v)<=Math.min(1.5,(14-s)*.4,(s-2)*.6)+.01);icHaft(b,.5,13,'B');icArt(b,9,5,['.E','E.','EE']);},
 dust(b){icArt(b,2,8,['...GGGGG...','.GGGGGGGGG.','GGGGgGGGGGG']);[[4,4],[8,2],[11,5],[6,6],[10,7]].forEach(([a,c])=>icSet(b,a,c,'S'));},
 core(b,P){icDisc(b,7.5,7.5,4.8,'X');icDisc(b,7.5,7.5,2.2,'G');icSet(b,7,7,'S');icSet(b,8,8,'X');[[2,2],[13,2],[2,13],[13,13]].forEach(([a,c])=>icSet(b,a,c,'X'));},
 essence(b){icArt(b,4,0,['...E....','..EE....','..EEE...','.EEEE.E.','.EEEEEE.','EEEESEEE','EEEEEEEE','.EEEEEE.','..EEEE..']);icSet(b,3,12,'S');icSet(b,12,13,'S');},
 shardA(b){icArt(b,4,1,['...G...','..GGG..','..GGG..','.GGGGG.','.GGGGG.','GGGGGGG','.GGGGG.','..GGG..','...G...']);},
 shardB(b){icArt(b,3,2,['......G..','.....GG..','....GGG..','...GGGG..','..GGGGG..','.GGGGGG..','GGGGGGG..','.GGGGG...','..GG.....']);},
 shardC(b){icArt(b,3,2,['.G....G.','.GG..GG.','.GGGGGG.','GGGGGGGG','GGGGGGGG','.GGGGGG.','..GGGG..','...GG...']);},
 shardD(b){icArt(b,4,1,['..G.G..','.GGGGG.','.GGGGG.','GGGGGGG','.GGGGG.','.GGGGG.','..GGG..','...G...','...G...']);}};
let IC_ESI=null;
function icMatDraw(x,id){const b=icBuf(),P=icPal(1),o={};const m=IC_MAT[id];
  if(m){const [k,c]=m;P.M=c;P.G=c;P.W=c;P.C=c;P.K=shade(c,.75);P.E=c;P.F=c;
    if(k==='log'||k==='log2'||k==='log3'){P.L=tint(c,.35);P.E='#9ae06a';P.G='#5aa040';if(k==='log3'){P.E='#8af0ff';P.X='#2a2018';}}
    if(k==='ingot')P.X='#6a6a74';if(k==='crys')P.L='#6a6a74';if(k==='root'){P.G='#5ab04a';}if(k==='flower'){P.E='#e07a2a';P.L='#4a9a3a';}if(k==='starf'){P.E='#ffffff';P.L='#4a9a3a';}
    if(k==='wisp')o.aura='#7af0d0';if(k==='moss')P.M='#7a6a4a';if(k==='ember'){P.X='#3a2a2a';P.E='#ff8a3a';o.aura='#e8553a';o.auraA=.3;}
    if(k==='sfeather'){P.F='#d8dcf0';P.E='#f2c93a';}if(k==='dust')o.aura='#9a6ae0';if(k==='core'){P.X='#2a1020';P.G='#ff3a3a';o.aura='#c83a3a';}if(k==='essence'){o.aura='#b48aff';}
    IC_MATF[k](b,P);}
  else if(/^es_/.test(id)){if(!IC_ESI){IC_ESI={};Object.keys(MATS).filter(k=>/^es_/.test(k)).forEach((k,i)=>{IC_ESI[k]=i;});}
    const i=IC_ESI[id]||0,d=guardianDef(id.slice(3))||{},el=(d.el&&d.el[0])||'shadow';P.G=ELC[el]||'#b48aff';P.E=tint(P.G,.6);
    IC_MATF[['shardA','shardB','shardC','shardD'][i%4]](b,P);
    const gl=IC_GLY[['eye','cross','moon','star'][Math.floor(i/4)%4]];gl.forEach((r,j)=>{for(let k=0;k<5;k++)if(r[k]==='#'&&icGet(b,5+k,4+j))icSet(b,5+k,4+j,'S');});o.aura='#b48aff';o.auraA=.35;}
  else{P.C=(MAT_OF[id]||{}).c||'#c4b28c';IC_MATF.pelt(b,P);}
  icPaint(x,b,P,o);}
function matIcon(id){return `<img class="gico iico mico" alt="" src="${cvURL('mi3:'+id,()=>{const c=mkCv(16,16);icMatDraw(c.getContext('2d'),id);return c;})}">`;}
// test hooks (window.__A is built after every module; add getters only for keys it does not have)
setTimeout(()=>{try{const A=window.__A;if(!A)return;const H={matIcon:()=>matIcon,icDrawGear:()=>icDrawGear,icMatDraw:()=>icMatDraw,drawItemIcon:()=>drawItemIcon,IC_MAT:()=>IC_MAT};Object.keys(H).forEach(k=>{if(!Object.getOwnPropertyDescriptor(A,k))Object.defineProperty(A,k,{get:H[k],configurable:true});});}catch(e){}},0);
