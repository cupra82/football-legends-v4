/* Football Legends 4.0.7 — historical matchcenter, no changes to existing scores. */
(()=>{'use strict';
 const screen=document.getElementById('fl403Insights');if(!screen)return;
 const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
 const style=e('style');style.textContent=`
 .fl407-choice{background:linear-gradient(110deg,#152b3f,#122536);padding:15px 17px;border-radius:14px;border:1px solid #38526c;margin:16px 0}
 .fl407-choice label{display:block;margin:0 0 8px;color:#f1d18a;font-weight:900}
 .fl407-history{margin:22px 0 32px;padding:22px;border:1px solid #41566c;background:#102235;border-radius:18px}
 .fl407-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
 .fl407-heading h2{margin:0;color:#f3d18a;font-size:24px}
 .fl407-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:12px;margin:16px 0}
 .fl407-summary>div{background:#192d43;border:1px solid #3f5973;border-radius:12px;padding:14px}
 .fl407-summary strong{color:#f3d18a;font-size:18px;display:block;margin-top:7px}
 .fl407-match{background:#162a40;border:1px solid #3c5873;border-radius:12px;margin:10px 0;padding:15px}
 .fl407-match header{display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap;font-size:12px;color:#b6cadc;margin-bottom:8px}
 .fl407-match h3{margin:5px 0 10px;font-size:19px;color:#fff}
 .fl407-participants{display:flex;flex-wrap:wrap;gap:8px}.fl407-participants span{background:#233c54;border-radius:9px;padding:8px 11px;font-size:13px}
 .fl407-muted{color:#b0c1d5;font-size:13px}
 `;document.head.append(style);
 const wrapper=e('section','fl407-history');wrapper.id='fl407History';
 const header=e('div','fl407-heading');header.append(e('h2','','🗓️ Storico delle partite'));
 const refresh=e('button','btn secondary','↻ Aggiorna storico');header.append(refresh);wrapper.append(header);
 wrapper.append(e('p','fl407-muted','Risultati salvati delle partite Arena e Ranked dalla versione 4.0.7. Data, vincitore, punteggi e distacco.'));
 const message=e('p','fl407-muted','Accedi con il nickname Arena per vedere le tue partite.');wrapper.append(message);
 const summaries=e('div','fl407-summary'),list=e('div');wrapper.append(summaries,list);screen.append(wrapper);
 let active=false,lastFetch=0;
 async function load(){
  const acc=typeof getAccount==='function'?getAccount():null;
  summaries.replaceChildren();list.replaceChildren();
  if(!acc?.token){message.textContent='Per vedere lo storico registra o recupera un nickname nella sezione Arena online.';return}
  if(active)return;active=true;message.textContent='Caricamento dello storico delle partite…';
  try{
   const r=await fetch('/api/v407/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:acc.token}),cache:'no-store'});
   const data=await r.json();if(!r.ok)throw Error(data.error||'Impossibile recuperare lo storico');
   const matches=data.matches||[];message.textContent=matches.length?'Ultime '+matches.length+' partite · in ordine dalla più recente':'Nessuna partita Arena/Ranked ancora registrata dalla 4.0.7.';
   if(matches.length){
    const withMargin=matches.filter(m=>m.winner&&m.players?.length>=2);
    const close=[...withMargin].sort((a,b)=>a.margin-b.margin)[0];const myWins=withMargin.filter(m=>m.winner===data.nickname);const big=[...myWins].sort((a,b)=>b.margin-a.margin)[0];
    const stat=(label,value)=>{const c=e('div');c.append(e('span','fl407-muted',label),e('strong','',value));summaries.append(c)};
    stat('Partite nello storico',matches.length);
    stat('Sfida più combattuta',close?close.margin+' punti di distacco':'—');
    stat('Vittoria più netta',big?big.margin+' punti di distacco':'—');
   }
   for(const m of matches){
    const c=e('article','fl407-match'),bar=e('header');
    const dt=new Date(m.played_at);bar.append(e('span','',Number.isNaN(dt.valueOf())?'Data non disponibile':dt.toLocaleString('it-CH',{dateStyle:'medium',timeStyle:'short'})),e('span','',m.mode+' · '+m.question_count+' domande · '+m.category));
    c.append(bar,e('h3','',m.winner?'🏆 '+m.winner:'⚖️ Pari merito'));
    const p=e('div','fl407-participants');for(const player of m.players||[])p.append(e('span','',(player.position===1?'🥇 ':'')+player.name+' · '+Number(player.score).toLocaleString('it-CH')+' pt'));
    c.append(p,e('p','fl407-muted','Distacco tra primo e secondo: '+Number(m.margin).toLocaleString('it-CH')+' punti'));
    list.append(c);
   }
  }catch(err){message.textContent='⚠️ '+err.message+'. Nessun dato esistente è stato cancellato.'}
  finally{active=false;lastFetch=Date.now()}
 }
 refresh.addEventListener('click',load);
 const previousNet=window.handleNet;
 if(typeof previousNet==='function')window.handleNet=function(data){
  const result=previousNet.apply(this,arguments);
  if(data?.type==='lobby'){
   const details=document.getElementById('lobbyDetails');
   if(details){let tag=document.getElementById('fl407LobbyQuality');
    if(!tag){tag=e('p','fl407-muted');tag.id='fl407LobbyQuality';details.insertAdjacentElement('afterend',tag)}
    tag.textContent=data.quality==='all'?'📚 Domande: archivio completo':'🌟 Domande: grandi campioni e calcio famoso';}
  }
  return result;
 };

 const observer=new MutationObserver(()=>{if(!screen.classList.contains('hidden')&&Date.now()-lastFetch>3000)load()});
 observer.observe(screen,{attributes:true,attributeFilter:['class']});
 // If this script is loaded while the profile is open, render immediately.
 if(!screen.classList.contains('hidden'))load();
})();
