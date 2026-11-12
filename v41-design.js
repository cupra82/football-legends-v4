/* Football Legends 4.1 — presentation only. No modification to rules, DB or questions. */
(function(){'use strict';
const h=document.querySelector('#home'),m=h?.querySelector('.modes');if(!m)return;
const title=document.createElement('div');title.className='v41-section-head';title.innerHTML='<h2>⚡ SCEGLI IL TUO CAMPO</h2><p>SEI MODALITÀ · UNA SOLA LEGGENDA</p>';m.before(title);
const strip=document.createElement('div');strip.className='v41-badge-strip';strip.innerHTML='<span>⚔ SFIDE TRA AMICI</span><span>🏆 TORNEI 4 / 8</span><span>💎 RATING ELO</span><span>⚡ RUSH 60 / 90s</span><span>🔐 DATABASE LAB SEPARATO</span>';m.after(strip);
const header=h.parentNode.querySelector('header');const brand=header?.querySelector('.brand');if(brand)brand.innerHTML='⚽ FOOTBALL <b>LEGENDS</b> <span style="font-size:10px;color:#d4b46a;letter-spacing:1px;margin-left:9px">V4 EXPERIENCE</span>';
const stats=h.querySelector('.panel');if(stats){const label=document.createElement('div');label.className='panel-title';label.style.marginBottom='15px';label.textContent='LIVE MATCH CENTER · ARCHIVIO DELLE LEGGENDE';stats.prepend(label)}
})();
