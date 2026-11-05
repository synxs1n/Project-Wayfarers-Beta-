const {open}=require('./pw');
(async()=>{const H=await open({w:1300,h:1000,mobile:false,out:'/tmp'});
const ids=await H.ev(()=>{const A=__A;const ids=Object.keys(A.TPL).filter(id=>!A.TPL[id].mon);document.body.innerHTML='<div style="background:#2a1f2e;padding:8px;display:flex;flex-wrap:wrap;gap:6px;width:1280px">'+ids.map(id=>`<div style="width:78px;text-align:center;color:#fff;font:10px sans-serif"><img style="width:72px;height:72px;image-rendering:pixelated" src="${A.heroURL(id)}"><br>${A.TPL[id].n}<br>${A.TPL[id].cls.slice(0,4)} ${A.TPL[id].el.map(e=>e.slice(0,2)).join('+')}</div>`).join('')+'</div>';return ids.length;});
console.log(ids);await H.wait(300);await H.page.screenshot({path:'/tmp/rostersheet.png',fullPage:true});await H.browser.close();})();
