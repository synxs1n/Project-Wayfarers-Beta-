// ===== Beta v0.4.1 3.5: prices. Runs after every table is built. Sale prices stay on the original value (price0) so selling does not pay double.
(function(){const g=o=>{if(o&&o.price!=null&&!o.__ec){o.price0=o.price;o.price=Math.round(o.price*ECON.gear);o.__ec=1;}};
  Object.values(GEAR).forEach(g);
  Object.values(ITEMS).forEach(o=>{if(o&&o.price!=null&&!o.__ec){o.price0=o.price;o.price=Math.round(o.price*ECON.items);o.__ec=1;}});})();
