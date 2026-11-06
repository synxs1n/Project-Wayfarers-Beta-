// ===== v0.7.1: the Wayfarers wordmark and emblem, drawn in code (SVG strings, crisp at any size, no font) =====
// Self contained (no game state): tools/mkicons.js loads this same file to render the app icons, so the logo in the game and the
// icons on the phone, the desktop and the browser tab always match. Letters are polygons on a 100 unit cap height (y down);
// each draws as a drop shadow, a dark outline, a gold gradient fill and a bevel highlight (a mask: the glyph minus itself shifted).
const WF_LOGO=(()=>{
  const r1=n=>Math.round(n*10)/10;
  // a stroke from (x1,y1) to (x2,y2) with flat (horizontal) ends: w1 wide at the top, w2 at the bottom
  const hq=(x1,y1,x2,y2,w1,w2)=>[[x1-w1/2,y1],[x1+w1/2,y1],[x2+w2/2,y2],[x2-w2/2,y2]];
  const rect=(a,b,c,d)=>[[a,b],[c,b],[c,d],[a,d]];
  // a band along an elliptic arc (angles in degrees, 0 = right, 90 = down) whose width follows wf(t), t from 0 to 1
  const band=(cx,cy,rx,ry,a0,a1,wf,n)=>{n=n||18;const o=[],i=[];for(let k=0;k<=n;k++){const t=k/n,a=(a0+(a1-a0)*t)*Math.PI/180,w=wf(t,a)/2,c=Math.cos(a),s=Math.sin(a);
    o.push([cx+(rx+w)*c,cy+(ry+w)*s]);i.push([cx+(rx-w)*c,cy+(ry-w)*s]);}return o.concat(i.reverse());};
  const star=(cx,cy,ry,rx,ri)=>[[cx,cy-ry],[cx+ri,cy-ri],[cx+rx,cy],[cx+ri,cy+ri],[cx,cy+ry],[cx-ri,cy+ri],[cx-rx,cy],[cx-ri,cy-ri]];
  const T=19,t=8;
  // glyphs: {a: advance, p: polygons, s: star polygons (drawn brighter)}
  const G={
    W:{a:100,p:[hq(11,0,31,100,22,9),hq(50,20,33,100,8,7),hq(50,20,69,100,20,9),hq(89,0,71,100,8,7),rect(-3,0,24,6),rect(81,0,99,5)],s:[star(50,3,15,9,2.6)]},
    A:{a:74,p:[hq(35,-6,9,100,7,9),hq(39,-6,63,100,9,T+1),[[30.5,-6],[43.5,-6],[37,-15]],[[18,59],[57,59],[55,67],[43,67],[37,76],[31,67],[20,67]],rect(-1,94,19,100),rect(53,94,75,100)]},
    Y:{a:76,p:[hq(13,0,37,54,T+1,12),hq(64,0,40,54,t,9),hq(38,50,38,100,16,18),rect(1,0,25,6),rect(56,0,74,5),rect(25,94,51,100)]},
    F:{a:58,p:[rect(1.5,0,20.5,100),[[1.5,0],[56,0],[56,24],[50,10],[1.5,10]],[[20,45],[41,45],[41,38],[46,38],[46,61],[41,61],[41,53],[20,53]],rect(-1,94,31,100)]},
    E:{a:60,p:[rect(1.5,0,20.5,100),[[1.5,0],[55,0],[55,22],[49,10],[1.5,10]],[[20,45],[39,45],[39,38],[44,38],[44,61],[39,61],[39,53],[20,53]],[[1.5,90],[50,90],[58,72],[58,100],[1.5,100]]]},
    R:{a:68,p:[rect(1.5,0,20.5,100),rect(-1,0,21,6),rect(20,0,37,10),rect(20,42,37,52),band(36,26,19,21,-90,90,(q,a)=>10+8*Math.cos(a)),hq(36,47,58,100,9,T+1),rect(-1,94,31,100),rect(47,94,70,100)]},
    S:{a:58,p:[band(30,26.5,21.5,21.5,-28,-270,(q,a)=>(8+11*Math.abs(Math.cos(a)))*Math.min(1,.45+q*2.2)),band(30,73.5,21.5,21.5,-90,152,(q,a)=>(8+11*Math.abs(Math.cos(a)))*Math.min(1,.45+(1-q)*2.2)),[[47,4],[53,4],[54,24],[48,22]],[[13,96],[7,96],[6,76],[12,78]]]}
  };
  const KERN={WA:-12,AY:-12,YF:-3,FA:-10,AR:-3,RE:0,ER:0,RS:-2};
  const pts=P=>P.map(q=>r1(q[0])+' '+r1(q[1])).join(' ');
  const layout=word=>{let x=0,prev='';const out=[];for(const ch of word){if(prev)x+=(KERN[prev+ch]||0)+5;const g=G[ch];out.push({g,x});x+=g.a;prev=ch;}return {items:out,w:x};};
  // one glyph run as SVG layers; ids keeps the gradient and mask names unique per SVG on the page
  let uid=0;
  function glyphLayers(items,o){const id='wf'+(++uid)+(o.idp||''),k=o.unit||1;
    const polys=(sh,dx,dy)=>items.map(({g,x})=>g.p.concat(sh?g.s||[]:[]).map(P=>`<polygon points="${pts(P.map(q=>[q[0]+x+(dx||0),q[1]+(dy||0)]))}"/>`).join('')).join('');
    const stars=()=>items.map(({g,x})=>(g.s||[]).map(P=>`<polygon points="${pts(P.map(q=>[q[0]+x,q[1]]))}"/>`).join('')).join('');
    const ow=o.outline!=null?o.outline:7;
    return `<defs><linearGradient id="${id}g" x1="0" y1="-8" x2="0" y2="102" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff6d2"/><stop offset=".32" stop-color="#f6d27c"/><stop offset=".62" stop-color="#df9a36"/><stop offset="1" stop-color="#93501a"/></linearGradient>
<radialGradient id="${id}s"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#fff1b8"/><stop offset="1" stop-color="#f4c25a"/></radialGradient>
<mask id="${id}m" maskUnits="userSpaceOnUse" x="-40" y="-60" width="2000" height="240"><g fill="#fff">${polys(1)}</g><g fill="#000">${polys(1,1.2,2.6)}</g></mask>
${o.glow?`<filter id="${id}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`:''}</defs>
${o.shadow===false?'':`<g fill="#05030a" stroke="#05030a" stroke-width="${ow+4}" stroke-linejoin="round" opacity=".55" transform="translate(${r1(1.5*k)} ${r1(6*k)})">${polys(1)}</g>`}
<g fill="${o.ink||'#2a1406'}" stroke="${o.ink||'#2a1406'}" stroke-width="${ow}" stroke-linejoin="round">${polys(1)}</g>
${o.glow?`<g fill="#ffd77a" opacity=".85" filter="url(#${id}f)">${stars()}</g>`:''}
<g fill="url(#${id}g)">${polys(0)}</g><g fill="url(#${id}s)">${stars()}</g>
<g fill="#fffbe8" opacity=".75" mask="url(#${id}m)">${polys(1)}</g>`;}
  // the wordmark: "WAYFARERS" with the waystar over the W; rule: a gilt rule with a centre diamond under the word
  function wordmark(o){o=o||{};const L=layout('WAYFARERS'),pad=12,w=L.w,top=-22,h=o.rule?150:132;
    const rule=o.rule?`<g fill="none" stroke="#d9b46a" stroke-width="2.2" opacity=".9"><path d="M${r1(w*.18)} 121 H${r1(w*.44)} M${r1(w*.56)} 121 H${r1(w*.82)}"/></g><g fill="#f2cf7c" stroke="#2a1406" stroke-width="1.5"><polygon points="${pts(star(w/2,121,9,13,2.4))}"/><polygon points="${pts(star(w*.18-4,121,4,5,1.2))}"/><polygon points="${pts(star(w*.82+4,121,4,5,1.2))}"/></g>`:'';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${top} ${r1(w+pad*2)} ${h}"${o.cls?` class="${o.cls}"`:''} role="img" aria-label="Wayfarers"${o.style?` style="${o.style}"`:''}><title>Wayfarers</title>${glyphLayers(L.items,o)}${rule}</svg>`;}
  // the emblem: a compass badge with the W and its waystar at the centre. bg: 'square' (full bleed, for maskable and Apple icons),
  // 'none' (transparent). scale: badge size inside the 512 box. simple: drop the fine ticks and minor points (16 to 48 px icons).
  function emblem(o){o=o||{};const S=512,c=256,sc=o.scale||1,simple=!!o.simple,id='we'+(++uid);
    const tf=`translate(${c} ${c}) scale(${sc}) translate(${-c} ${-c})`;
    const P=(a,r)=>[c+Math.cos(a)*r,c+Math.sin(a)*r];
    let ticks='';if(!simple){for(let i=0;i<64;i++){const a=i/64*Math.PI*2,l=i%8===0?14:i%2===0?8:5,p1=P(a,214),p2=P(a,214-l);ticks+=`M${r1(p1[0])} ${r1(p1[1])}L${r1(p2[0])} ${r1(p2[1])}`;}}
    const point=(ang,len,wid,lit,dim)=>{const a=ang*Math.PI/180,tip=P(a,len),l=P(a-Math.PI/2,wid),r=P(a+Math.PI/2,wid);
      return `<polygon fill="${lit}" points="${pts([[c,c],tip,l])}"/><polygon fill="${dim}" points="${pts([[c,c],tip,r])}"/>`;};
    let rose='';if(!simple)[45,135,225,315].forEach(a=>rose+=point(a-90,178,18,'#c9995a','#6e4a24'));
    [0,90,180,270].forEach(a=>rose+=point(a-90,simple?214:204,simple?34:28,'#ffe6a6','#c98a32'));
    const L=layout('W'),g=L.items,wsc=simple?2.35:2.05,ww=L.w*wsc,wx=c-ww/2,wy=c-50*wsc+(simple?14:10);
    const bg=o.bg==='square'?`<rect width="${S}" height="${S}" fill="url(#${id}b)"/>`:'';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${o.size||S}" height="${o.size||S}"${o.cls?` class="${o.cls}"`:''} role="img" aria-label="Wayfarers emblem"><defs>
<radialGradient id="${id}b" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#2c2756"/><stop offset=".6" stop-color="#1a1533"/><stop offset="1" stop-color="#0e0a1a"/></radialGradient>
<radialGradient id="${id}d" cx=".5" cy=".38" r=".7"><stop offset="0" stop-color="#2f2b5e"/><stop offset=".75" stop-color="#16132c"/><stop offset="1" stop-color="#0b0916"/></radialGradient>
<linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0bf"/><stop offset=".45" stop-color="#e0a548"/><stop offset="1" stop-color="#7c4316"/></linearGradient>
<radialGradient id="${id}h" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd77a" stop-opacity=".38"/><stop offset="1" stop-color="#ffd77a" stop-opacity="0"/></radialGradient></defs>${bg}
<g transform="${tf}"><circle cx="${c}" cy="${c}" r="236" fill="#0a0712"/><circle cx="${c}" cy="${c}" r="226" fill="url(#${id}d)"/>
<circle cx="${c}" cy="${c}" r="226" fill="none" stroke="url(#${id}r)" stroke-width="${simple?22:16}"/><circle cx="${c}" cy="${c}" r="${simple?208:203}" fill="none" stroke="#d9b46a" stroke-width="${simple?5:3}" opacity=".85"/>
${ticks?`<path d="${ticks}" stroke="#d9b46a" stroke-width="3" opacity=".7"/>`:''}<circle cx="${c}" cy="${c}" r="200" fill="url(#${id}h)"/>
<g stroke="#2a1406" stroke-width="${simple?4:3}" stroke-linejoin="round">${rose}</g>
<circle cx="${c}" cy="${c+6}" r="${simple?116:122}" fill="#0f0c20" stroke="#2a1406" stroke-width="6"/><circle cx="${c}" cy="${c+6}" r="${simple?116:122}" fill="none" stroke="url(#${id}r)" stroke-width="${simple?8:6}"/>
<g transform="translate(${r1(wx)} ${r1(wy)}) scale(${wsc})">${glyphLayers(g,{outline:simple?9:7,unit:1,glow:!simple,idp:'e'})}</g></g></svg>`;}
  return {wordmark,emblem,layout,G};
})();
