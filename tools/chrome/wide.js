// 1.4: battle scene keeps a fixed aspect ratio (never stretched) in portrait and landscape phone shapes
const {open,chk,done}=require('./pw');
const SIZES=[['portrait 390x844',390,844,true],['portrait 360x740',360,740,true],['landscape 16:9 640x360',640,360,true],['landscape 16:9 844x475',844,475,true],['landscape 19.5:9 844x390',844,390,true],['landscape 19.5:9 932x430',932,430,true],['landscape 21:9 960x411',960,411,true],['landscape 21:9 1000x430',1000,430,true],['tablet 1024x768',1024,768,false],['desktop 1280x800',1280,800,false]];
(async()=>{for(const [name,w,h,mobile] of SIZES){
  const H=await open({w,h,mobile});const {ev,wait,shot}=H;
  await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(250);
  await ev(()=>{__A.V.modal=null;['brann','sable','tess'].forEach(id=>{__A.G.roster[id]=__A.newChar(id,5,0);__A.G.party.push(id);});__A.startBattle({stage:0,kind:'field'});});await wait(900);
  const r=await ev(()=>{const cv=document.getElementById('bcv'),wr=document.getElementById('bwrap').getBoundingClientRect(),c=cv.getBoundingClientRect(),b=__A.BL;
    const party=document.getElementById('bparty').getBoundingClientRect(),cmd=document.getElementById('bcmd').getBoundingClientRect();
    return {mode:b.mode,sc:b.sc,W:b.W,H:b.H,cw:c.width,ch:c.height,ww:wr.width,wh:wr.height,wl:wr.left,wr:wr.right,wb:wr.bottom,docW:document.documentElement.scrollWidth,vw:innerWidth,vh:innerHeight,cmdVis:cmd.height>0&&cmd.top<innerHeight,partyVis:party.height>0};});
  const asp=r.cw/r.ch,want=r.W/r.H;
  chk(`${name}: mode ${r.mode} sc ${r.sc} canvas ${Math.round(r.cw)}x${Math.round(r.ch)} aspect ${asp.toFixed(2)} (stage ${want.toFixed(2)})`,Math.abs(asp-want)<.02||'STRETCHED');
  if(r.mode!=='tall')chk(`${name}: wide stage is 320x150`,r.W===320&&r.H===150||'bad logical size');
  chk(`${name}: no horizontal overflow`,r.docW<=r.vw+1||'doc '+r.docW+' > '+r.vw);
  chk(`${name}: command panel reachable`,r.cmdVis||'cmd below fold');
  await shot('wide_'+name.replace(/[ :.]/g,'_'));await H.browser.close();}
process.exit(0);})();
