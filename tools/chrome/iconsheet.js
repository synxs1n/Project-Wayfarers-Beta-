const {open}=require('./pw');
(async()=>{const H=await open({w:700,h:260,mobile:false,out:'/tmp'});
await H.ev(()=>{const A=__A;document.body.innerHTML='<div style="background:#2a1f2e;padding:12px;display:flex;gap:14px;flex-wrap:wrap">'+['fire','water','earth','wind','lightning','ice','light','shadow'].map(k=>`<div style="text-align:center;color:#fff;font:12px sans-serif"><img style="width:66px;height:66px;image-rendering:pixelated" src="${A.iconURL(k)}"><br>${k}<br><img style="width:14px;height:14px;image-rendering:pixelated" src="${A.iconURL(k)}"><img style="width:22px;height:22px;image-rendering:pixelated" src="${A.iconURL(k)}"></div>`).join('')+'</div>';});
await H.page.screenshot({path:'/tmp/iconsheet.png'});await H.browser.close();})();
