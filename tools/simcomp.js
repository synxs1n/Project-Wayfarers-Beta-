
// sim only: every party hero has a companion with the base 4% bonus, the element boost and a family perk (rotating by hero)
const SIMFAMS=['beast','flyer','spirit','shell','ooze'];const SIMMON={beast:'frostwolf',flyer:'thunderhawk',spirit:'stormling',shell:'iceknight',ooze:'magmaslime'};
{const cs0=calcStats;calcStats=function(c){const S=cs0.apply(this,arguments);if(c&&c.side==='p'&&!c.isComp&&!(G&&G.daily)&&!globalThis.NOCOMP){const f=SIMFAMS[hashS(c.id)%5],o={mon:SIMMON[f]},k=.04;
  S.mhp=Math.round(S.mhp*(1+k));S.atk*=1+k;S.mag*=1+k;S.def*=1+k;S.res*=1+k;const el=MON[o.mon].el[0];S.elBoost[el]=(S.elBoost[el]||0)+.1;if(!globalThis.NOPERK)applyCompPerk(S,o);}return S;};}
