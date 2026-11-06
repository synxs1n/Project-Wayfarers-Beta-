// ===== economy.js (v0.4.1): prices: ECON multipliers applied once every table is built =====
(function(){const g=o=>{if(o&&o.price!=null&&!o.__ec){o.price0=o.price;o.price=Math.round(o.price*ECON.gear);o.__ec=1;}};
  Object.values(GEAR).forEach(g);
  Object.values(ITEMS).forEach(o=>{if(o&&o.price!=null&&!o.__ec){o.price0=o.price;o.price=Math.round(o.price*ECON.items);o.__ec=1;}});})();
