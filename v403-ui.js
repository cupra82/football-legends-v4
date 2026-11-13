/* Football Legends Ultimate Edition 4.0.3 — additive enhancements. */
(()=>{'use strict';
 const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x};
 const button=(text,fn,cls='btn secondary')=>{const b=el('button',cls,text);b.type='button';b.addEventListener('click',fn);return b};
 const appendText=(root,tag,text,cls)=>{const e=el(tag,cls,text);root.appendChild(e);return e};
 const main=document.querySelector('main');if(!main)return;
 const css=el('style');css.textContent=`
 .fl403-tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:12px}
 .fl403-note{padding:18px;border-radius:16px;background:linear-gradient(110deg,#172a3f,#0e2331);border:1px solid #38526a;color:#d9e9fa;margin:18px 0}
 .fl403-note strong{color:#f9d98a;display:block;margin-bottom:8px}
 .fl403-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
 .fl403-card{border:1px solid #324a63;background:#112239;border-radius:16px;padding:18px;min-width:0}
 .fl403-card h3{margin:0 0 10px;color:#e6c67e}
 .fl403-row{display:flex;justify-content:space-between;gap:10px;align-items:center;border-top:1px solid #293e53;padding:9px 0}
 .fl403-row span:last-child{color:#e2bb68;font-weight:800}
 .fl403-chip{display:inline-block;background:#21384d;border:1px solid #566c7b;border-radius:22px;padding:9px 12px;margin:5px}
 .fl403-chip.unlocked{border-color:#d2ad5d;color:#f7db99;background:#49361a}
 .fl403-muted{color:#adbed0;font-size:13px}
 .fl403-report{border:1px solid #35566c;background:#102233;border-radius:14px;margin:12px 0;padding:14px}
 .fl403-report select,.fl403-report textarea{width:100%;max-width:600px;margin:7px 0;border:1px solid #4d647a;background:#142639;color:white;border-radius:8px;padding:10px}
 .fl403-insight-header{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
 `;document.head.append(css);
 const screen=el('section','screen hidden');screen.id='fl403Insights';
 screen.appendChild(button('← Indietro',()=>show('home')));
 appendText(screen,'h1','🏅 Il mio percorso','section-title');
 appendText(screen,'p','Rivalità, statistiche, trofei e progressi. I risultati online vengono salvati sul Supabase V4.','muted');
 const status=appendText(screen,'p','Caricamento…','fl403-note');const cards=el('div','fl403-grid');screen.append(cards);main.append(screen);
 const nav=document.querySelector('.fl-nav');if(nav){const right=nav.querySelector('.fl-nav-right');nav.insertBefore(button('🏅 PERCORSO',showInsights,'btn secondary'),right||null)}
 const home=document.getElementById('home');if(home){const b=button('🏅 Il mio percorso · Trofei, rivalità e statistiche',showInsights);b.style.margin='14px 0';const s=home.querySelector('.section-title')||home.firstElementChild;home.insertBefore(b,s?.nextSibling||null)}
 const TROPHIES=[['debutto-arena','⚽ Esordio Arena'],['veterano-arena','🏆 Veterano (10 sfide)'],['fuoriclasse-punti','⭐ 1.500 punti in una sfida'],['dieci-risposte','🧠 Dieci risposte corrette'],['solo-prima','🎯 Prima carriera solitaria'],['solo-100','📚 100 risposte solitarie'],['solo-10','🔥 Dieci corrette di fila'],['rush-prima','⚡ Prima sfida Rush'],['rush-3000','🚀 Rush oltre 3.000 punti'],['campione-torneo','🏆 Campione di un torneo']];
 const storage='fl403_solo_stats';
 function soloGet(){try{const d=JSON.parse(localStorage.getItem(storage)||'{}');return {games:d.games||0,answered:d.answered||0,correct:d.correct||0,streak:d.streak||0,maxStreak:d.maxStreak||0,categories:d.categories||{}}}catch{return {games:0,answered:0,correct:0,streak:0,maxStreak:0,categories:{}}}}
 function soloSave(d){try{localStorage.setItem(storage,JSON.stringify(d))}catch{}}
 function card(title){const c=el('article','fl403-card');appendText(c,'h3',title);cards.append(c);return c}
 function row(c,a,b){const d=el('div','fl403-row');appendText(d,'span',a);appendText(d,'span',b);c.append(d)}
 async function request(route,data){const r=await fetch('/api/v403/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json();if(!r.ok)throw Error(j.error||'Servizio non disponibile');return j}
 async function showInsights(){show('fl403Insights');cards.replaceChildren();const solo=soloGet();const sc=card('🎯 Carriera solitaria · questo PC');row(sc,'Partite completate',String(solo.games));row(sc,'Risposte corrette',`${solo.correct} / ${solo.answered}`);row(sc,'Percentuale esatte',solo.answered?Math.round(100*solo.correct/solo.answered)+'%':'—');row(sc,'Serie migliore',String(solo.maxStreak));
  const all=card('📊 Statistiche solitarie per argomento');const cs=Object.entries(solo.categories).sort((a,b)=>b[1].answered-a[1].answered);if(!cs.length)appendText(all,'p','Ancora nessuna risposta registrata in Carriera solitaria.','fl403-muted');for(const [k,v] of cs)row(all,k,`${v.correct}/${v.answered} · ${Math.round(100*v.correct/v.answered)}%`);
  const a=typeof getAccount==='function'?getAccount():null;
  if(!a?.token){const trophy=card('🏅 Trofei solitari su questo PC');const soloUnlocked=new Set([...(solo.games>=1?['solo-prima']:[]),...(solo.correct>=100?['solo-100']:[]),...(solo.maxStreak>=10?['solo-10']:[])]);for(const [key,title] of TROPHIES.filter(x=>x[0].startsWith('solo-'))){const chip=el('span','fl403-chip'+(soloUnlocked.has(key)?' unlocked':''),(soloUnlocked.has(key)?'✓ ':'🔒 ')+title);trophy.append(chip)}status.textContent='I dati solitari sono salvati soltanto su questo PC. Per vedere rivalità e trofei Arena, registra il nickname nella sezione Arena online.';return}
  status.textContent='Caricamento delle statistiche Arena dal Supabase V4…';try{const d=await request('profile',{token:a.token});status.textContent='✅ Profilo online: '+d.nickname+' · Statistiche delle partite Arena registrate dalla versione 4.0.3 in poi.';
   const rivals=card('⚔ Rivalità tra amici');if(!d.rivalries.length)appendText(rivals,'p','Nessuno scontro diretto registrato dalla 4.0.3.','fl403-muted');for(const v of d.rivalries)row(rivals,v.opponent,`${v.wins} V · ${v.losses} S · ${v.games} sfide`);
   const cat=card('📈 Precisione per argomento · Arena');if(!d.categories.length)appendText(cat,'p','Le statistiche per categoria inizieranno con le prossime partite Arena.','fl403-muted');for(const v of d.categories)row(cat,v.category,`${v.correct}/${v.answered} · ${Math.round(100*v.correct/v.answered)}%`);
   const trophy=card('🏅 I miei trofei');const unlocked=new Set(d.trophies.map(t=>t.trophy));if(solo.games>=1)unlocked.add('solo-prima');if(solo.correct>=100)unlocked.add('solo-100');if(solo.maxStreak>=10)unlocked.add('solo-10');for(const [key,title] of TROPHIES){const c=el('span','fl403-chip'+(unlocked.has(key)?' unlocked':''),(unlocked.has(key)?'✓ ':'🔒 ')+title);trophy.append(c)}
  }catch(e){status.textContent='⚠️ Le statistiche online non sono disponibili: '+e.message+'. La carriera solitaria rimane consultabile.'}}
 window.fl403ShowInsights=showInsights;
 // Almanacco / issue reporting: only after revealing the answer; never leaks before submission.
 const feedback=document.getElementById('feedback');const toolbox=el('div','fl403-tools');const almanac=el('div','fl403-note');almanac.hidden=true;
 const report=el('div','fl403-report');report.hidden=true;
 feedback?.insertAdjacentElement('afterend',toolbox);toolbox.insertAdjacentElement('afterend',almanac);almanac.insertAdjacentElement('afterend',report);
 let active=null,almanacHistory=[];
 const resultSection=document.getElementById('result');
 const historyPanel=el('details','fl403-note');historyPanel.hidden=true;
 const historySummary=el('summary','','📖 Almanacco delle risposte di questa partita');historyPanel.append(historySummary);
 const historyBody=el('div');historyPanel.append(historyBody);
 const resultList=document.getElementById('resultsList');resultList?.insertAdjacentElement('afterend',historyPanel);
 function displayHistory(){if(!resultList)return;historyBody.replaceChildren();historyPanel.hidden=almanacHistory.length===0;
  for(const item of almanacHistory){const c=el('div','fl403-card');appendText(c,'strong',item.question);appendText(c,'p','✅ '+item.answer);appendText(c,'p',item.explanation||'Nessuna spiegazione disponibile.','fl403-muted');
   if(item.source&&/^https:\/\//.test(item.source)){const a=el('a','','Fonte');a.href=item.source;a.rel='noopener noreferrer';a.target='_blank';c.append(a)}historyBody.append(c)}
 }
 function resetTools(q){active=q;toolbox.replaceChildren();almanac.hidden=true;report.hidden=true;report.replaceChildren()}
 const almanacButton=button('📖 Almanacco della risposta',()=>{almanac.hidden=!almanac.hidden});
 const reportButton=button('🚩 Segnala domanda',()=>{report.hidden=!report.hidden});
 function showTools(q,correctText,explanation){if(!q||!feedback)return;active=q;const last=almanacHistory[almanacHistory.length-1];if(!last||last.question!==q.question){almanacHistory.push({question:q.question,answer:correctText||'',explanation:explanation||'',source:q.source||null});if(almanacHistory.length>30)almanacHistory.shift()}toolbox.replaceChildren();toolbox.append(almanacButton,reportButton);almanac.hidden=false;almanac.replaceChildren();appendText(almanac,'strong','📖 Lo sapevi?');appendText(almanac,'p',explanation||'Questa domanda non dispone ancora di una spiegazione storica verificata.');if(correctText)appendText(almanac,'p','Risposta: '+correctText);if(q.source&&/^https:\/\//.test(q.source)){const a=el('a','','Consulta la fonte');a.href=q.source;a.target='_blank';a.rel='noopener noreferrer';almanac.append(a)}
 }
 function showReport(){if(!active)return;report.replaceChildren();appendText(report,'strong','Segnala un problema con questa domanda');appendText(report,'p','La segnalazione non cambia il risultato della partita. Serve un nickname registrato in Arena.','fl403-muted');const select=el('select');for(const [v,t] of [['errata','Risposta errata'],['ambigua','Domanda ambigua'],['duplicata','Domanda ripetuta'],['altro','Altro problema']]){const o=el('option','',t);o.value=v;select.append(o)}report.append(select);const note=el('textarea');note.placeholder='Dettagli (facoltativo, massimo 500 caratteri)';note.maxLength=500;note.rows=2;report.append(note);const msg=el('p','fl403-muted');report.append(button('Invia segnalazione',async()=>{const a=typeof getAccount==='function'?getAccount():null;if(!a?.token){msg.textContent='Registra prima un nickname nella sezione Arena online.';return}try{const d=await request('report',{token:a.token,questionId:String(active.id||active.question).slice(0,160),reason:select.value,comment:note.value});msg.textContent='✅ '+d.message}catch(e){msg.textContent='⚠️ '+e.message}}));report.append(msg)}
 reportButton.addEventListener('click',()=>{if(!report.hidden)showReport()});
 const oldRender=window.renderBase;window.renderBase=function(q,n,total){if(n===1)almanacHistory=[];resetTools(q);return oldRender.apply(this,arguments)};
 const oldReveal=window.reveal;window.reveal=function(q,pick,msg){const r=oldReveal.apply(this,arguments);const answer=(q.displayOptions||[])[q.correct]?.value;showTools(q,answer,q.explanation||msg);return r};
 // During multiplayer the original question text is sent before the reveal, without correct answer.
 const oldNet=window.handleNet;window.handleNet=function(x){if(x.type==='end'){const out=oldNet.apply(this,arguments);displayHistory();return out}if(x.type==='question'){
  // renderBase runs inside oldNet and takes the question text; add the stable server-side ID after rendering.
  const out=oldNet.apply(this,arguments);if(active){active.id=x.questionId;active.source=null}return out;
 }if(x.type==='reveal'){const out=oldNet.apply(this,arguments);if(active)showTools(active,x.answerText,x.explanation);return out}return oldNet.apply(this,arguments)};
 const oldAnswer=window.answerOffline;window.answerOffline=function(pick){if(lock)return;const current=deck[index];const chosenMode=mode;const got=pick===current.correct;const result=oldAnswer.apply(this,arguments);if(chosenMode==='solo'){const s=soloGet();s.answered++;s.correct+=got?1:0;s.streak=got?s.streak+1:0;s.maxStreak=Math.max(s.maxStreak,s.streak);const c=String(current.category||'Altro');const v=s.categories[c]||(s.categories[c]={answered:0,correct:0});v.answered++;v.correct+=got?1:0;soloSave(s)}return result};
 const oldEnd=window.endOffline;window.endOffline=function(){if(mode==='solo'){const s=soloGet();s.games++;soloSave(s)}const out=oldEnd.apply(this,arguments);displayHistory();return out};
})();
