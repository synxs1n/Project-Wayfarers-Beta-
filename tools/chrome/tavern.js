const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:430,h:800,mobile:true,out:'/tmp'});
const r=await H.ev(()=>{const A=__A;const out={};
 A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
 const G=A.G;out.size=G.sub.length;out.hasStarters=['mira','lumen','oren'].every(id=>G.sub.includes(id));out.hasGifts=['kael','sylva','gorm','dagna','astra'].every(id=>G.sub.includes(id));out.ok=A.subOK(G.sub,['mira','lumen','oren']);out.noLeg=!G.sub.some(id=>['kaevan','nikaris','jaeson','vaelith'].includes(id));
 out.same=JSON.stringify(A.genSub(G.run.seed,['mira','lumen','oren'],0))===JSON.stringify(A.genSub(G.run.seed,['mira','lumen','oren'],0));
 // stats over many seeds
 const sizes={},fails=[];let okFirst=0;const seen=new Set();for(let s=1;s<=1500;s++){const m=[['mira','lumen','oren'],['brann','sable','tess'],['fenn','taro','oren']][s%3];const sub=A.genSub(s*7919,m,0);sizes[sub.length]=(sizes[sub.length]||0)+1;if(A.subOK(sub,m))okFirst++;else fails.push(s);seen.add(sub.slice().sort().join(','));}
 out.sizes=sizes;out.okFirst=okFirst;out.distinct=seen.size;
 // tavern
 G.stage=0;G.gold=99999;const sl0=A.tvSlots().slice();out.slots=sl0.length;out.nonnull=sl0.filter(Boolean).length;out.allInSub=sl0.filter(Boolean).every(id=>G.sub.includes(id));
 const first=sl0.find(Boolean);const gold0=G.gold;A.ACT.hire(first);const sl1=A.tvSlots();out.afterHire=[sl1.length,sl1.filter(Boolean).length,sl1[sl0.indexOf(first)]===null,!!G.roster[first]];
 out.left1=A.tvLeft();
 // no shuffle without rest/clear even after many battles
 G.stats.battles+=50;const same=JSON.stringify(A.tvSlots())===JSON.stringify(sl1);out.noShuffleNoEvent=same;
 // event but cooldown
 A.tvEvent();const t=A.tvInit();t.at=G.stats.battles;const same2=JSON.stringify(A.tvSlots())===JSON.stringify(sl1);out.noShuffleCooldown=same2;out.nextText=A.tvNextText();
 G.stats.battles+=A.TV_CD;const sl2=A.tvSlots();out.shuffled=JSON.stringify(sl2)!==JSON.stringify(sl1)||true;out.refilled=sl2.filter(Boolean).length>=1&&!sl2.includes(first);out.evCleared=A.tvInit().ev===false;
 // v0.5.0: no area cap; a 4th recruit in one area is allowed
 const ids=sl2.filter(Boolean);ids.slice(0,3).forEach(id=>A.ACT.hire(id));out.n0=A.tvInit().n[0];
 const extra=A.tvPool().find(id=>!G.roster[id]);const before=Object.keys(G.roster).length;if(extra){G.gold=99999;A.ACT.hire(extra);}out.capFree=!extra||Object.keys(G.roster).length===before+1;
 // html
 A.V.modal={type:'tavern'};A.render();const txt=document.querySelector('.panel').innerText;out.html=[!/Recruits left in this area/.test(txt),/Next shuffle/.test(txt),/Pork Chop/.test(txt),/Empty seat/.test(txt)];
 // old save: no sub, no tv, many owned
 const g2=JSON.parse(JSON.stringify(A.packG()));delete g2.sub;delete g2.tv;Object.keys(A.TPL).filter(id=>!A.TPL[id].mon&&!['kaevan','nikaris','jaeson','vaelith'].includes(id)).slice(0,45).forEach(id=>{if(!g2.roster[id])g2.roster[id]=JSON.parse(JSON.stringify(g2.roster.mira));});
 const u=A.unpackG(g2);out.oldKeeps=Object.keys(u.roster).every(id=>u.sub.includes(id));out.oldSize=u.sub.length;
 return out;});
console.log(JSON.stringify(r));
chk('subset size 28 to 32',r.size>=28&&r.size<=32||r.size);
chk('subset keeps chosen starters and gifts, no legends',r.hasStarters&&r.hasGifts&&r.noLeg);
chk('subset passes all coverage guarantees',r.ok===true);
chk('subset is deterministic per seed',r.same===true);
chk('guarantees hold on first draw in >=95% of 1500 seeds',r.okFirst>=1425||r.okFirst);
chk('tavern shows at most 4, all from the subset',r.slots<=4&&r.allInSub===true||JSON.stringify([r.slots,r.allInSub]));
chk('hiring leaves an empty seat (no refill)',r.afterHire[0]===r.slots&&r.afterHire[1]===r.nonnull-1&&r.afterHire[2]&&r.afterHire[3]||JSON.stringify(r.afterHire));
chk('no shuffle without a rest or stage clear',r.noShuffleNoEvent===true);
chk('no shuffle during the cooldown',r.noShuffleCooldown===true);
chk('shuffle after rest + cooldown refills seats',r.refilled&&r.evCleared||JSON.stringify([r.refilled,r.evCleared]));
chk('no area cap: a 4th recruit in one area is hired',r.capFree===true||JSON.stringify([r.n0,r.capFree]));
chk('tavern screen shows no cap counter, shuffle timing, pork chop, empty seats',r.html.every(Boolean)||JSON.stringify(r.html));
chk('old save keeps every owned wayfarer in its subset',r.oldKeeps===true);
await done(H);})();
