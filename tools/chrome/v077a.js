// Beta v0.7.7: guild missions count what was done before they were accepted; detonator hints are symbols; no blue tap flash.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.cleared=[1,0,0,0,0];A.G.stage=1;});
const r=await ev(()=>{const A=__A,G=A.G,f=A.facInit(),o={};const m=A.FMIS.find(x=>A.facMissionList(x.f).includes(x));if(!m)return {none:1};
  f.ctr[m.k]=(f.ctr[m.k]||0)+m.n+2;o.before=A.facProg(m);o.n=m.n;A.ACT.facAccept(m.id);o.after=A.facProg(m);
  A.V.modal={type:'menu',tab:'fmis'};A.render();o.claim=!!document.querySelector(`#modal [data-act="facClaim"][data-arg="${m.id}"]`);A.V.modal=null;return o;});
chk('progress done before accepting counts (shown before and after accepting)',r.before===r.n&&r.after===r.n||JSON.stringify(r));
chk('a mission already done can be claimed right after accepting',r.claim===true||JSON.stringify(r));
const t=await ev(()=>{const c=document.querySelector('canvas')||document.body;return getComputedStyle(document.body).webkitTapHighlightColor||getComputedStyle(c).webkitTapHighlightColor;});
chk('no tap highlight colour (Android blue flash)',/rgba\(0, 0, 0, 0\)|transparent/.test(t)||t);
await done(H);})();
