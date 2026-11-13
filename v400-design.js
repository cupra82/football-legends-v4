/* Football Legends 4.0.0 — desktop experience enhancements; no change to scoring/DB. */
(function(){'use strict';
const home=document.getElementById('home'),head=document.querySelector('header'),modes=home?.querySelector('.modes');if(!home||!head||!modes)return;
const $=id=>document.getElementById(id);
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
// The original game and all six real mode handlers stay untouched.
const pill=head.querySelector('.pill');if(pill)pill.textContent='VERSIONE 4.0.3 · ULTIMATE EDITION';
const brand=head.querySelector('.brand');if(brand)brand.innerHTML='⚽ FOOTBALL <b>LEGENDS</b>';
const nav=make('nav','fl-nav');nav.setAttribute('aria-label','Navigazione Football Legends');
const navItems=[['⌂ HOME',()=>show('home')],['⚔ ARENA',()=>setup('online')],['🏆 TORNEI',()=>modes.children[4]?.click()],['⚡ RUSH',()=>modes.children[3]?.click()],['♛ CLASSIFICHE',()=>window.flClassifiche?.('general')]];
for(const [txt,action] of navItems){const b=make('button','',txt);b.type='button';b.addEventListener('click',action);nav.append(b)}const tag=make('span','fl-nav-right','● DESKTOP · LIVE ARENA');nav.append(tag);head.after(nav);
const hero=home.querySelector('.hero');const e=hero?.querySelector('.eyebrow');if(e)e.textContent='FOOTBALL LEGENDS 4.0.3 · ULTIMATE EDITION';
const h1=hero?.querySelector('h1');if(h1)h1.innerHTML='NON È SOLO CALCIO.<br><span>È LEGGENDA.</span>';
const lead=hero?.querySelector('p');if(lead)lead.textContent='Conosci la storia. Sfida gli amici. Conquista il torneo. Un unico universo calcistico, sei modalità e un archivio che continua a crescere.';
const shortcuts=make('div','fl-hero-shortcuts');for(const [txt,fn] of [['⚔ CREA UNA SFIDA',()=>setup('online')],['🏆 GIOCA UN TORNEO',()=>modes.children[4]?.click()]]){const b=make('button','',txt);b.type='button';b.onclick=fn;shortcuts.append(b)}hero?.append(shortcuts);
const ticker=make('div','fl-ticker');ticker.innerHTML='<span class="label">● MATCH CENTER</span><span>ARCHIVIO <b id="flCounter">—</b> DOMANDE</span><div class="sep"></div><span>⚔ 8 GIOCATORI</span><div class="sep"></div><span>🏆 TORNEI 2–12</span><div class="sep"></div><span>⚡ RUSH 60 / 90s</span><div class="sep"></div><span>💎 RANKED ELO</span>';hero?.after(ticker);
const section=make('div','fl-section-head');section.innerHTML='<h2>SCEGLI IL TUO CAMPO</h2><small>SEI ESPERIENZE · UNA SOLA LEGGENDA</small>';modes.before(section);
const labels=['SOLO','2 GIOCATORI','ONLINE','60 / 90S','2–12 AMICI','GENERALE / ELO'];[...modes.children].forEach((mode,i)=>{mode.append(make('span','fl-modal-label',labels[i]||'PLAY'));mode.setAttribute('title','Apri '+(mode.querySelector('strong')?.textContent||'modalità'))});
const career=$('careerPanel');const trophy=make('div','fl-trophy-shelf');trophy.setAttribute('aria-label','Traguardi personali del PC');trophy.innerHTML='<div class="fl-trophy" id="flBadgeFirst"><i>🥉</i><strong>PRIMO FISCHIO</strong><small>Completa una sfida solitaria</small></div><div class="fl-trophy" id="flBadgeTen"><i>🏆</i><strong>VETERANO</strong><small>Completa 10 sfide solitarie</small></div><div class="fl-trophy" id="flBadgeAccuracy"><i>🎯</i><strong>CECCHINO</strong><small>Almeno 80% risposte corrette</small></div>';career?.append(trophy);
const sync=()=>{const count=$('countQ')?.textContent;if(count&&$('flCounter'))$('flCounter').textContent=count;const games=Number(($('playedCount')?.textContent||'0').replace(/\D/g,''))||0;const correct=Number(($('correctRate')?.textContent||'0').replace(/[^\d.]/g,''))||0;for(const [id,ok] of [['flBadgeFirst',games>=1],['flBadgeTen',games>=10],['flBadgeAccuracy',games>=1&&correct>=80]])$(id)?.classList.toggle('earned',ok)};
const obs=new MutationObserver(sync);for(const id of ['countQ','playedCount','correctRate']){const node=$(id);if(node)obs.observe(node,{characterData:true,childList:true,subtree:true})}sync();
// Keyboard choices are active only for ordinary quiz questions, not lobby or forms.
document.addEventListener('keydown',ev=>{if(ev.altKey||ev.ctrlKey||ev.metaKey||ev.repeat||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
 const game=$('game');if(!game||game.classList.contains('hidden'))return;const k=ev.key.toUpperCase(),idx={A:0,B:1,C:2,'1':0,'2':1,'3':2}[k];if(idx!==undefined){const b=game.querySelectorAll('#answers button')[idx];if(b&&!b.disabled){ev.preventDefault();b.click()}}else if(k==='ENTER'){const b=$('next');if(b&&!b.classList.contains('hidden')&&!b.disabled){ev.preventDefault();b.click()}}});
const info=make('p','fl-footer','FOOTBALL LEGENDS 4.0.3 · ULTIMATE EDITION · PROGETTO INDIPENDENTE · NON AFFILIATO A FIFA / UEFA');home.append(info);
})();
