// ===== stsym.js (v0.5.0): status symbols =====
// One symbol per status in place of the old three letter tags, which spilled out of their boxes on the battle stage.
// Each has its own shape as well as its colour, so no two can be told apart by colour alone (colourblind safe):
// drop, drips, flame, hourglass, star, crossed eye, roots, down arrow, cracked block, skull, torn cross, up arrow, shield,
// double chevron, heart, ring, exclamation, crosshair, broken shield. Drawn as inline SVG in a 10x10 box, so it scales with
// whatever box it sits in. Used on battle cards and the stage, the Party, Roster and Equipment rows, the switch list, popups and Lore.
const ST_SYM={
  poison:'<path d="M5 .8C3.4 3.6 2 5.2 2 6.8A3 3 0 0 0 8 6.8C8 5.2 6.6 3.6 5 .8Z"/>',
  bleed:'<path d="M2.5 1h1.6v4.2a.8.8 0 0 1-1.6 0ZM4.2 1h1.6v6.6a.8.8 0 0 1-1.6 0ZM5.9 1h1.6v3.4a.8.8 0 0 1-1.6 0Z"/>',
  burn:'<path d="M5 .6C5.4 2.6 8.2 3.6 8.2 6.4A3.2 3.2 0 0 1 1.8 6.4C1.8 4.8 2.8 4 3.4 3.2 3.6 4.4 4.2 5 4.8 5 4.4 3.6 4.4 2 5 .6Z"/>',
  slow:'<path d="M2 1h6v1.4L5.9 5 8 7.6V9H2V7.6L4.1 5 2 2.4ZM3.6 2.3 5 4l1.4-1.7Z"/>',
  stun:'<path d="M5 .5 6.1 3.9 9.5 5 6.1 6.1 5 9.5 3.9 6.1.5 5 3.9 3.9Z"/>',
  blind:'<path d="M5 2.6C2.8 2.6 1.2 4.1.5 5c.7.9 2.3 2.4 4.5 2.4S8.8 5.9 9.5 5C8.8 4.1 7.2 2.6 5 2.6Zm0 1.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/><path d="M1.4 8.8 8.6 1.2" stroke-width="1.3" stroke="currentColor"/>',
  root:'<path d="M4.3.8h1.4v3.6l2.6 2.3-.9.9L5.7 6V9H4.3V6L2.6 7.6l-.9-.9 2.6-2.3Z"/>',
  weaken:'<path d="M3.8 1h2.4v4.4h2.3L5 9.2 1.5 5.4h2.3Z"/>',
  break:'<path d="M1 1h3.6L3.6 3.6 5.6 5 4.4 9H1ZM5.6 1H9v8H5.4l1.4-4.2-2-1.4Z"/>',
  curse:'<path d="M5 .8a3.9 3.9 0 0 0-3.9 3.9c0 1.4.7 2.5 1.7 3.1V9.2h4.4V7.8c1-.6 1.7-1.7 1.7-3.1A3.9 3.9 0 0 0 5 .8ZM3.5 3.8a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>',
  wound:'<path d="M3.8 1h2.4v2.4l-.9.9.9.9v.6H9v2.4H6.2V9H3.8V7.4L4.7 6.5 3.8 5.6V5.4H1V3h2.8Z"/>',
  might:'<path d="M3.8 9h2.4V4.6h2.3L5 .8 1.5 4.6h2.3Z"/>',
  bulwark:'<path d="M5 .6 9 2v3c0 2.4-1.8 3.8-4 4.6C2.8 8.8 1 7.4 1 5V2Z"/>',
  haste:'<path d="M.8 1.5h2.3L6.6 5 3.1 8.5H.8L4.3 5ZM4.2 1.5h2.3L10 5 6.5 8.5H4.2L7.7 5Z"/>',
  regen:'<path d="M5 9 1.3 5.3A2.3 2.3 0 0 1 5 2.3a2.3 2.3 0 0 1 3.7 3Z"/>',
  ward:'<path d="M5 .8 9.2 5 5 9.2.8 5Zm0 2.4L3.2 5 5 6.8 6.8 5Z"/>',
  taunt:'<path d="M3.8.8h2.4L5.8 6.4H4.2ZM5 7.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>',
  focus:'<path d="M4.4.6h1.2v1.6a2.9 2.9 0 0 1 2.2 2.2h1.6v1.2H7.8a2.9 2.9 0 0 1-2.2 2.2v1.6H4.4V7.8a2.9 2.9 0 0 1-2.2-2.2H.6V4.4h1.6a2.9 2.9 0 0 1 2.2-2.2Zm.6 2.7a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Z"/>',
  broken:'<path d="M1 2 4.4.8 3.4 4.2 5.2 5.4 3.8 9.4C2.2 8.6 1 7.2 1 5ZM5.6.8 9 2v3c0 2-1.1 3.4-2.6 4.2L7 5.2 5 3.8Z"/>'
};
function stSym(k,cls){const p=ST_SYM[k];const d=typeof STS!=='undefined'&&STS[k];
  if(!p)return `<svg class="stsym${cls?' '+cls:''}" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="3.4" fill="currentColor"/></svg>`;
  return `<svg class="stsym${cls?' '+cls:''}" viewBox="0 0 10 10" aria-hidden="true" fill="currentColor"${d&&d.n?` data-st="${k}"`:''}>${p}</svg>`;}
