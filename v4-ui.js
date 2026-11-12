/* Football Legends 4.0.0 Ultimate Edition — desktop modes and isolated database. */
(function(){'use strict';
const $=id=>document.getElementById(id);
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const el=(tag,attrs={},children=[])=>{const x=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>{if(k==='text')x.textContent=v;else x.setAttribute(k,v)});children.forEach(c=>x.append(c));return x};
const style=document.createElement('style');style.textContent=`
.v4badge{font-size:11px;color:#b9f76a;font-weight:800;letter-spacing:.1em}.v4stack{display:grid;gap:12px}.v4buttonRow{display:flex;flex-wrap:wrap;gap:12px}.v4card{background:#102134;border:1px solid #2e4b60;border-radius:17px;padding:18px}.v4status{color:#b9d8ea;margin:10px 0}.v4table{display:grid;gap:8px}.v4table .rank{margin:0}.v4muted{color:#a6bed2;font-size:13px}.v4question{font-size:clamp(19px,3vw,28px);font-weight:800;line-height:1.3;padding:15px 0}.v4choices{display:grid;gap:12px}.v4choices button{padding:16px;text-align:left;background:#162a3d;color:#fff;border:1px solid #446077;border-radius:12px;font-size:17px;cursor:pointer}.v4choices button:hover:not(:disabled){border-color:#b9f76a}.v4choices button:disabled{opacity:.5}.v4split{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.v4winner{color:#b9f76a;font-weight:900}.v4round{padding:13px;border:1px solid #325166;border-radius:12px;margin-top:10px}.v4active{border-color:#b9f76a!important}.v4pill{background:#14324a;padding:7px 10px;border-radius:20px;color:#b9f76a}
`;document.head.append(style);
function placeBefore(parent,newNode,anchor){parent.insertBefore(newNode,anchor)}
const home=$('home');const modes=home.querySelector('.modes');
const links=[['⚡','Modalità Rush','60 o 90 secondi contro il tempo.',()=>showRush()],['🏆','Tornei tra amici','Da 2 a 12 amici · scegli il formato.',()=>showTournament()],['🏅','Classifiche','Generale e Ranked con divisioni Elo.',()=>showClassifiche('general')]];
for(const [emoji,title,desc,cb] of links){const btn=make('button','mode');btn.type='button';btn.append(make('span','emoji',emoji),make('strong','',title),make('small','',desc));btn.onclick=cb;modes.append(btn)}
function section(id,heading){const s=make('section','screen hidden');s.id=id;s.append(el('button',{class:'btn secondary',text:'← Torna al menu'}));s.firstChild.onclick=()=>{if(id==='v4t')closeTournament();if(id==='v4rush')stopRushClock();show('home')};s.append(make('h2','section-title',heading));const p=make('div','v4stack');s.append(p);home.parentNode.append(s);return p}
const rushRoot=section('v4rush','⚡ RUSH — La sfida contro il tempo');
const tourRoot=section('v4t','🏆 TORNEI — Sfide tra amici');
function identity(){const a=typeof getAccount==='function'?getAccount():null;if(!a||!a.token){alert('Prima crea un profilo entrando in Arena online; poi torna qui.');setup('online');return null}return a}
async function api(path,data){const r=await fetch('/api/v4/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'Errore HTTP '+r.status);return j}
async function list(path){const r=await fetch('/api/v4/'+path,{cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'Dati non disponibili');return j}
function addButton(parent,text,cb,klass='btn secondary'){const b=el('button',{class:klass,text});b.onclick=cb;parent.append(b);return b}
function reset(node){node.replaceChildren()}
let rushState=null,rushClock=null,rushBusy=false;
function stopRushClock(){clearInterval(rushClock);rushClock=null}
function showRush(){show('v4rush');reset(rushRoot);const c=make('div','v4card');c.append(make('p','v4muted','Ogni risposta è verificata sul server. 100 punti per risposta corretta, più bonus serie. Richiede un nickname registrato in Arena online.'));
const sel=el('select',{class:'field'});for(const v of [60,90])sel.append(el('option',{value:String(v),text:v+' secondi'}));c.append(make('label','', 'Durata della sfida'),sel);
addButton(c,'⚡ Inizia Rush',()=>startRush(Number(sel.value)),'btn');rushRoot.append(c);addButton(rushRoot,'🏅 Classifica Rush',showRushBoard);}
async function showRushBoard(){show('v4rush');reset(rushRoot);addButton(rushRoot,'← Nuova sfida Rush',showRush);const d=make('div','v4card');rushRoot.append(d);d.textContent='Caricamento…';try{const data=await list('rush/leaderboard');reset(d);d.append(make('h3','','Migliori punteggi Rush'));data.players.forEach((p,i)=>d.append(el('div',{class:'rank'},[make('strong','',(i+1)+'. '+p.name),make('strong','',p.best+' pt · '+p.games+' partite')])));if(!data.players.length)d.append(make('p','v4muted','Ancora nessuna partita Rush.'))}catch(e){d.textContent=e.message}}
async function startRush(seconds){const a=identity();if(!a)return;try{const data=await api('rush/start',{token:a.token,seconds});rushState={...data,token:a.token,busy:false};rushScreen(data.question);stopRushClock();rushClock=setInterval(()=>{if(!rushState)return;const left=Math.max(0,Math.ceil((rushState.expires-Date.now())/1000));const t=$('v4rushRemaining');if(t)t.textContent=left+'s';if(left===0){stopRushClock();finishRush()}},150)}catch(e){alert('Rush: '+e.message)}}
function rushScreen(q){if(!rushState)return;reset(rushRoot);const top=make('div','v4card v4split');top.append(make('strong','', 'Punti: '+(rushState.score||0)+' · Corrette: '+(rushState.correct||0)),el('span',{id:'v4rushRemaining',class:'v4pill',text:Math.max(0,Math.ceil((rushState.expires-Date.now())/1000))+'s'}));rushRoot.append(top);
const d=make('div','v4card');d.append(make('div','v4badge','DOMANDA '+q.number+' · '+q.category),make('div','v4question',q.question));const answers=make('div','v4choices');q.options.forEach((o,i)=>addButton(answers,'ABC'[i]+'. '+o,()=>rushAnswer(i),'v4choice'));d.append(answers);rushRoot.append(d)}
async function rushAnswer(i){if(!rushState||rushBusy)return;rushBusy=true;try{const data=await api('rush/answer',{token:rushState.token,session:rushState.session,answer:i});rushState.score=data.score;rushState.correct=data.correct;if(data.finished){rushResult(data);return}rushScreen(data.question)}catch(e){alert(e.message);stopRushClock()}finally{rushBusy=false}}
async function finishRush(){if(!rushState||rushBusy)return;rushBusy=true;try{const data=await api('rush/finish',{token:rushState.token,session:rushState.session});rushResult(data)}catch(e){if(!/ancora scaduto/.test(e.message))alert(e.message)}finally{rushBusy=false}}
function rushResult(data){stopRushClock();rushState=null;reset(rushRoot);const c=make('div','v4card center');c.append(make('h2','','⚡ RUSH COMPLETATA'),make('h1','v4winner',data.score+' punti'),make('p','v4muted',data.correct+' risposte corrette su '+data.answered+' · Punteggio salvato nel Supabase LAB'));rushRoot.append(c);addButton(rushRoot,'↻ Nuova sfida',showRush,'btn');addButton(rushRoot,'🏅 Classifica Rush',showRushBoard)}
function division(r){return r>=1800?'Leggenda':r>=1600?'Diamante':r>=1400?'Platino':r>=1200?'Oro':r>=1050?'Argento':'Bronzo'}
const lbScreen=$('globalLeaderboard'),lbPanel=$('globalLeaderboardRows')?.parentElement;
const lbTabs=make('div','v4buttonRow');lbTabs.id='flLeaderboardTabs';
const lbGeneral=addButton(lbTabs,'🏆 Generale',()=>showClassifiche('general'),'btn');
const lbRanked=addButton(lbTabs,'💎 Ranked',()=>showClassifiche('ranked'),'btn secondary');
lbPanel?.before(lbTabs);
const lbRankedRows=make('div','v4table');lbRankedRows.id='flRankedRows';lbPanel?.append(lbRankedRows);
const lbOriginalTitle=lbScreen?.querySelector('h2'),lbOriginalDescription=lbScreen?.querySelector('p');
const lbGeneralStatus=$('globalLeaderboardStatus'),lbGeneralRows=$('globalLeaderboardRows');
const lbRefresh=[...lbScreen.querySelectorAll('button')].find(b=>b.textContent.includes('Aggiorna classifica'));
let lbView='general';
async function showClassifiche(tab='general'){
 lbView=tab==='ranked'?'ranked':'general';show('globalLeaderboard');
 lbGeneral.className=lbView==='general'?'btn':'btn secondary';lbRanked.className=lbView==='ranked'?'btn':'btn secondary';
 if(lbOriginalTitle)lbOriginalTitle.textContent='🏆 Classifiche degli amici';
 if(lbOriginalDescription)lbOriginalDescription.textContent=lbView==='ranked'?'💎 Graduatoria competitiva: Elo e divisioni. Le partite amichevoli non cambiano questo rating.':'🏆 Risultati permanenti delle partite Arena: vittorie, sconfitte e punti.';
 const ranked=lbView==='ranked';lbRankedRows.classList.toggle('hidden',!ranked);lbGeneralStatus.classList.toggle('hidden',ranked);lbGeneralRows.classList.toggle('hidden',ranked);
 if(lbRefresh){lbRefresh.textContent='↻ Aggiorna '+(ranked?'Ranked':'classifica');lbRefresh.onclick=()=>showClassifiche(lbView)}
 if(!ranked){await loadLeaderboard();return}
 lbRankedRows.textContent='Caricamento classifica Ranked…';
 try{const data=await list('ranked/leaderboard');lbRankedRows.replaceChildren();for(const [i,p] of data.players.entries())lbRankedRows.append(el('div',{class:'rank'},[make('strong','',(i+1)+'. '+p.name+' · '+division(p.rating)),make('strong','',p.rating+' Elo · '+p.wins+' V')]));if(!data.players.length)lbRankedRows.append(make('p','v4muted','Nessuna partita Ranked conclusa. Crea una stanza Arena e attiva Ranked.'))}
 catch(e){lbRankedRows.textContent='Ranked non disponibile: '+e.message}
}
window.flClassifiche=showClassifiche;
const legacyLeaderboardOpen=window.showLeaderboard;window.showLeaderboard=()=>showClassifiche('general');
// Existing online flow is preserved, and Ranked extends it without changing friendly matches.
const online=$('onlineInputs');const rankedWrap=make('div','v4card');rankedWrap.append(make('h3','','💎 Modalità Ranked'));const checkbox=el('input',{type:'checkbox',id:'v4Ranked'});const lbl=make('label','');lbl.append(checkbox,document.createTextNode(' Sfida classificata (Elo)'));rankedWrap.append(lbl,make('p','v4muted','Nelle Ranked tutti gli amici devono confermare Pronto. Le amichevoli continuano a funzionare come prima.'));online.append(rankedWrap);
// The original final createRoom override sends this setting in its payload (patched in index.html).
const readyRow=make('div','v4card');readyRow.id='v4ReadyRow';readyRow.style.margin='12px 0';readyRow.append(make('h3','','🎮 Sala d’attesa 4.0'));const readyHint=make('div','v4status','');readyRow.append(readyHint);const readyBtn=addButton(readyRow,'✅ Sono pronto',()=>{v4Ready=!v4Ready;send({type:'ready',ready:v4Ready})});$('lobbyPlayers').after(readyRow);let v4Ready=false;
const oldHandle=handleNet;handleNet=function(x){if(x.type==='countdown'){$('lobbyStatus').textContent='🚀 La partita inizia tra '+x.seconds+' secondi!';return}if(x.type==='lobby'){const me=(typeof getAccount==='function'&&getAccount())||{};const self=x.players?.find(p=>p.name===me.nickname);v4Ready=!!self?.ready;readyBtn.textContent=v4Ready?'↩️ Non sono pronto':'✅ Sono pronto';readyBtn.classList.toggle('hidden',!!x.hostForYou);readyHint.textContent=(x.ranked?'💎 RANKED · ':'⚽ AMICHEVOLE · ')+x.players.map(p=>p.name+(p.ready?' ✅':' ⏳')).join(' · ');$('hostStart').textContent=x.ranked?'💎 Avvia Ranked':'⚽ Avvia sfida'}oldHandle(x);if(x.type==='end'&&x.ranked){const d=$('resultSub');d.textContent+=' · Ranked: rating Elo aggiornato nel laboratorio';if(Array.isArray(x.ratingChanges)){const rows=$('resultsList');for(const a of x.ratingChanges){const e=make('div','rank');e.append(make('strong','',a.name+' · '+division(a.rating)),make('strong','',a.rating+' Elo ('+(a.delta>=0?'+':'')+a.delta+')'));rows.append(e)}}}};
// Tournament uses a separate WebSocket and cannot affect legacy Arena room state.
let tws=null,tdata=null,tready=false,timer=null;
function tsend(x){if(tws?.readyState===1)tws.send(JSON.stringify(x))}
function closeTournament(){if(tws){tws.onclose=null;tws.close();tws=null}clearInterval(timer);tdata=null}
function showTournament(){
 closeTournament();show('v4t');reset(tourRoot);
 const card=make('div','v4card');card.append(make('p','v4muted','Torneo privato da 2 a 12 amici. Scegli girone, eliminazione diretta oppure lascia decidere automaticamente. Per partecipare serve un nickname Arena.'));
 const count=el('select',{class:'field'});for(let i=2;i<=12;i++)count.append(el('option',{value:String(i),text:i+' partecipanti'}));count.value='4';
 const format=el('select',{class:'field'});for(const [id,name] of [['auto','⚙️ Automatica (consigliata)'],['league','🔄 Girone all’italiana'],['knockout','🏆 Eliminazione diretta']])format.append(el('option',{value:id,text:name}));
 const total=el('select',{class:'field'});for(const n of [10,15,20,30])total.append(el('option',{value:String(n),text:n+' domande per turno'}));
 const preview=make('p','v4status');const describe=()=>{const n=Number(count.value),f=format.value;preview.textContent=f==='league'?`Girone all’italiana: tutti contro tutti, ${n*(n-1)/2} incontri totali.`:f==='knockout'?`Tabellone a eliminazione con ${n-1} incontri e passaggi automatici (bye) quando necessari.`:n===2||n===4||n===8?'Eliminazione diretta con finale.':n===3?'Girone unico, poi finale tra i primi due.':n<=7?'Girone unico, poi semifinali e finale.':'Due gironi, poi semifinali e finale.'};
 count.onchange=describe;format.onchange=describe;describe();
 card.append(make('label','','Numero di partecipanti'),count,make('label','','Formula del torneo'),format,make('label','','Domande per incontro'),total,preview);
 addButton(card,'🏆 Crea torneo',()=>tconnect({type:'v4t:create',size:Number(count.value),format:format.value,total:Number(total.value)}),'btn');
 const code=el('input',{class:'field',placeholder:'Codice torneo da 6 caratteri',maxlength:'6'});card.append(make('label','','Oppure entra nel torneo di un amico'),code);
 addButton(card,'Entra nel torneo',()=>tconnect({type:'v4t:join',code:code.value.trim().toUpperCase()}));tourRoot.append(card);
}
function tconnect(action){const a=identity();if(!a)return;closeTournament();const proto=location.protocol==='https:'?'wss:':'ws:';tws=new WebSocket(proto+'//'+location.host);tws.onopen=()=>tsend({...action,token:a.token});tws.onmessage=e=>{let x;try{x=JSON.parse(e.data)}catch{return}thandle(x)};tws.onclose=()=>{if(tdata){const alertBox=make('p','v4muted','Connessione torneo interrotta. Torna al menu e rientra con un nuovo codice.');tourRoot.prepend(alertBox)}};tws.onerror=()=>alert('Impossibile collegarsi al server torneo')}
function showTStandings(items){
 for(const group of items||[]){const c=make('div','v4card');c.append(make('h3','',group.name));for(const [i,p] of group.players.entries())c.append(el('div',{class:'rank'},[make('strong','',(i+1)+'. '+p.name),make('strong','',p.points+' pt · '+p.wins+' V · '+p.played+' G')]));tourRoot.append(c)}
}
function thandle(x){
 if(x.type==='v4t:error'){alert(x.message);return}
 if(x.type==='v4t:lobby'){tdata=x;renderTournamentLobby(x);return}
 if(x.type==='v4t:round'){
  tdata={...tdata,round:x.round};reset(tourRoot);tourRoot.append(make('h3','','🏆 '+(x.stage||'Torneo')+' · Incontro '+x.round));
  for(const [a,b] of x.pairs)tourRoot.append(el('div',{class:'v4round',text:a+'  VS  '+b}));
  for(const name of x.byes||[])tourRoot.append(el('div',{class:'v4round',text:'✅ '+name+' · passa automaticamente al turno successivo (bye)'}));
  showTStandings(x.standings);return;
 }
 if(x.type==='v4t:question'){renderTQuestion(x);return}
 if(x.type==='v4t:answered'){const m=$('v4tStatus');if(m)m.textContent='Risposta inviata: attendi gli altri giocatori.';return}
 if(x.type==='v4t:reveal'){clearInterval(timer);const a=$('v4tStatus');if(a)a.textContent='✅ Risposta: '+x.answer+' · '+x.scores.map(s=>s.name+' '+s.score+' pt').join(' · ');return}
 if(x.type==='v4t:round_end'){
  clearInterval(timer);reset(tourRoot);tourRoot.append(make('h2','','🏆 Risultati del torneo'));
  const recent=x.bracket?.slice(-4)||[];
  for(const round of recent){const c=make('div','v4card');c.append(make('h3','',''+(round.stage||'Turno')+' · '+round.round));for(const m of round.matches)c.append(el('div',{class:'v4round',text:m.a+' '+m.scoreA+' — '+m.scoreB+' '+m.b+' · Vince '+m.winner}));for(const b of round.byes||[])c.append(el('div',{class:'v4round',text:'✅ '+b+' · bye'}));tourRoot.append(c)}
  showTStandings(x.standings);
  if(x.champion){tourRoot.prepend(make('h1','v4winner','🏆 CAMPIONE: '+x.champion));tourRoot.append(make('p','v4muted','Torneo concluso. Il risultato viene registrato nel database del laboratorio.'))}
  else tourRoot.append(make('p','v4muted','Il prossimo incontro inizierà automaticamente.'));
 }
}
function renderTQuestion(x){reset(tourRoot);tourRoot.append(make('p','v4badge','TURNO '+x.round+' · DOMANDA '+x.number+' / '+x.total));const box=make('div','v4card');box.append(make('h2','v4question',x.question));const ans=make('div','v4choices');const current=getAccount()?.nickname;const active=x.active.includes(current);x.options.forEach((option,i)=>{const b=addButton(ans,'ABC'[i]+'. '+option,()=>{tsend({type:'v4t:answer',index:i});for(const child of ans.children)child.disabled=true});b.disabled=!active});box.append(ans);tourRoot.append(box);const status=make('p','v4status',active?'Rispondi entro 15 secondi.':'Sei spettatore: osserva la sfida degli altri giocatori.');status.id='v4tStatus';tourRoot.append(status);const remaining=make('p','v4pill','15s');tourRoot.append(remaining);clearInterval(timer);const deadline=Date.now()+15000;timer=setInterval(()=>{remaining.textContent=Math.max(0,Math.ceil((deadline-Date.now())/1000))+'s';if(Date.now()>deadline)clearInterval(timer)},150)}
})();
