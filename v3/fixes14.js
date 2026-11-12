// ===== fixes14.js (fix pass 14): the owner's four notes after the 0.19.7 to 0.20.0 passes; the CSS half is fixes14.css =====
// 1) Momentum gauge (fixes14.css): hud13.css set "Momentum" in Cinzel with letter spacing, wider than the Nunito word it replaced, so in a
//    Surge or Drained state the label and "Surge +15%" no longer fit one line of the 138 px gauge: the label wrapped to two lines, the gauge
//    needed three rows in a 40 px plate, the bar was pushed onto the bottom edge (under the corner ornaments) and, where the device font draws a
//    little larger, below it, where the log strip (overflow hidden) cut it off. The label stays on one line now and the gauge may be a little wider.
// 2) Primed chip on the foe cards (fixes14.css): the status row is one nowrap line at the card's foot, and its items could shrink. A long
//    chip (the reaction name of an aimed Detonator) squeezed the status buttons until their contents stacked into tall columns; the line grew
//    to their height and the chip stretched with it into a big box over the name and HP. Nothing overflowed, so b3TagFit never wrapped the row.
//    The items keep their own width now (so an overfull row wraps), the row is capped to the space the card reserves for it, and while a foe
//    is being chosen the row lets taps through to the card under it.
// 3) Battle menu memory (menus12.js): a hero who used an item opens their next turn on the main actions, not the Items list. Skills keep
//    their memory. (useItem is HOOK.def'd in engine.js for this.)
// 4) Victory screen, new skills (fixes14.css): each line's tag strip was nowrap in a space-between flex row; on a phone the strip ran out of
//    the panel and squeezed the name into one letter per line. The row wraps now, the tags wrap under the text.
HOOK.wrap('useItem','fixes14','battle menu memory: after an item the next turn opens on the main actions',function(next,...args){
  const a=B&&B.cur,id=args[0],n0=G&&G.inv?G.inv[id]||0:0;const r=next(...args);
  try{if(a&&a.side==='p'&&G&&G.inv&&(G.inv[id]||0)<n0&&typeof m12Mem==='function'){const mm=m12Mem(a);mm.menu='root';}}catch(e){}
  return r;});
