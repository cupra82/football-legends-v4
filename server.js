'use strict';
// Football Legends 4.0.0: protezione contro il collegamento accidentale a un database esterno alla V4.
if(process.env.DATABASE_URL && process.env.FL_V4_DB_ISOLATED!=='YES'){
  throw new Error('V4 LAB: DATABASE_URL presente. Configura un database Supabase di TEST distinto e imposta FL_V4_DB_ISOLATED=YES. Non riutilizzare la DATABASE_URL di produzione.');
}

const http=require('http'),WebSocket=require('ws'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {generateQuestions}=require('./football-bank');
const ranking=require('./leaderboard-store');
const accounts=require('./accounts-store');
const v4=require('./v4-competitive');
const extras=require('./people-questions.json');
const portugal=require('./portugal-questions.json');
const classics=require('./classics-questions.json');
const official=require('./official-questions.json');
const historyExpansion=require('./history-expansion.json');
const deepHistory=require('./deep-history.json');
let europeanCups=[];try{const f=JSON.parse(fs.readFileSync(path.join(__dirname,'european-cups-generated.json'),'utf8'));europeanCups=Array.isArray(f)?f:f.questions||[]}catch{}
let competitionHistory=[];try{const f=JSON.parse(fs.readFileSync(path.join(__dirname,'competition-history-generated.json'),'utf8'));competitionHistory=Array.isArray(f)?f:f.questions||[]}catch{}
let themedQuestions=[];try{const d=JSON.parse(fs.readFileSync(path.join(__dirname,'themed-generated.json'),'utf8'));themedQuestions=Array.isArray(d)?d:d.questions||[]}catch{}
let famousCareerQuestions=[];try{const d=JSON.parse(fs.readFileSync(path.join(__dirname,'famous-careers-generated.json'),'utf8'));famousCareerQuestions=Array.isArray(d)?d:d.questions||[]}catch{}
let stadiumQuestions=[];try{const d=JSON.parse(fs.readFileSync(path.join(__dirname,'stadiums-wikidata-generated.json'),'utf8'));stadiumQuestions=Array.isArray(d)?d:d.questions||[]}catch{}
let wikiQuestions=[];let wikidataStats={};
try{const d=JSON.parse(fs.readFileSync(path.join(__dirname,'wikidata-generated.json'),'utf8'));if(Array.isArray(d.questions)){wikiQuestions=d.questions;wikidataStats=d.stats||{}}}catch{}
const categoryPolicy=require('./category-policy.json');
const topicFilters=require('./topics-v3');
const ALLOWED_GENERATED=new Set(['Campioni e classifiche','Podio del campionato','Confronti tra club','Record del campionato']);
const qualityFilter=q=>ALLOWED_GENERATED.has(q.kind);

let biographies=[],peopleStats={};
try{const file=JSON.parse(fs.readFileSync(path.join(__dirname,'people-generated.json'),'utf8'));if(Array.isArray(file.questions)){biographies=file.questions;peopleStats=file.stats||{}}}catch{}
const original=JSON.parse(fs.readFileSync(path.join(__dirname,'questions.json'),'utf8'));
const snapshotPath=path.join(__dirname,'questions-generated.json');
let generated=[];let snapshotStats={};
try{const file=JSON.parse(fs.readFileSync(snapshotPath,'utf8'));if(Array.isArray(file.questions)){generated=file.questions;snapshotStats=file.stats||{}}}catch{}
let questions=[...original,...generated.filter(qualityFilter),...extras,...portugal,...classics,...official,...historyExpansion,...deepHistory,...competitionHistory,...europeanCups,...themedQuestions,...stadiumQuestions,...famousCareerQuestions,...wikiQuestions,...biographies].filter(q=>q.category!=='Calcio femminile');let bankStatus={state:generated.length?'ready':'loading',count:questions.length,original:original.length,generated:generated.length,people:extras.length+biographies.length,biographies:biographies.length,hiddenMatchTrivia:generated.filter(q=>!qualityFilter(q)).length,goal:50000,peopleStats,wikidataStats,official:official.length,competitionHistory:competitionHistory.length,europeanCups:europeanCups.length,themed:themedQuestions.length,stadiums:stadiumQuestions.length,famousCareers:famousCareerQuestions.length,wikidata:wikiQuestions.length,stats:snapshotStats,updatedAt:snapshotStats.at||null};
let sampleSerial=0;
function recalc(){const byCategory={},byKind={};for(const q of questions){byCategory[q.category]=(byCategory[q.category]||0)+1;byKind[q.kind||'Storico']=(byKind[q.kind||'Storico']||0)+1}bankStatus.count=questions.length;bankStatus.generated=generated.length;bankStatus.people=extras.length+biographies.length;bankStatus.biographies=biographies.length;bankStatus.hiddenMatchTrivia=generated.filter(q=>!qualityFilter(q)).length;bankStatus.peopleStats=peopleStats;bankStatus.wikidataStats=wikidataStats;bankStatus.official=official.length;bankStatus.competitionHistory=competitionHistory.length;bankStatus.europeanCups=europeanCups.length;bankStatus.themed=themedQuestions.length;bankStatus.stadiums=stadiumQuestions.length;bankStatus.wikidata=wikiQuestions.length;bankStatus.byCategory=byCategory;bankStatus.byKind=byKind;const planned=Object.values(categoryPolicy.groups).flat();const allNames=[...new Set([...planned,...Object.keys(byCategory)])];bankStatus.categoryTargets=Object.fromEntries(allNames.map(name=>{const count=byCategory[name]||0;return [name,{available:count,target:categoryPolicy.minimumPerCategory,missing:Math.max(0,categoryPolicy.minimumPerCategory-count),met:count>=categoryPolicy.minimumPerCategory}]}));}
recalc();
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=crypto.randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function samplePool(max=2500){if(questions.length<=max)return questions;const groups=new Map();for(const q of questions){if(!groups.has(q.category))groups.set(q.category,[]);groups.get(q.category).push(q)}
 const categories=shuffle([...groups.keys()]);const base=Math.max(15,Math.floor(max/categories.length));const chosen=[];const ids=new Set();
 for(const c of categories)for(const q of shuffle(groups.get(c)).slice(0,base)){if(!ids.has(q.id||q.question)){chosen.push(q);ids.add(q.id||q.question)}}
 if(chosen.length<max){const rest=shuffle(questions);for(const q of rest){if(chosen.length>=max)break;if(!ids.has(q.id||q.question)){chosen.push(q);ids.add(q.id||q.question)}}}
 return balancedDeck(chosen,Math.min(max,chosen.length))}

const REPETITIVE_KINDS=new Set(['Nazionalità','Epoca dei protagonisti','Ruolo','Nazionalità Wikidata','Biografie Wikidata','Città di nascita Wikidata','Leggende e nazionali']);
function balancedDeck(pool,total){
 if(pool.length<=total)return shuffle(pool);
 const mechanical=shuffle(pool.filter(q=>REPETITIVE_KINDS.has(q.kind)));
 const rich=pool.filter(q=>!REPETITIVE_KINDS.has(q.kind));
 const groups=new Map();for(const q of rich){if(!groups.has(q.category))groups.set(q.category,[]);groups.get(q.category).push(q)}
 for(const [k,arr] of groups)groups.set(k,shuffle(arr));
 const pick=[],used=new Set();let keys=shuffle([...groups.keys()]);
 while(pick.length<total&&keys.length){const next=[];for(const k of keys){const arr=groups.get(k);while(arr.length&&used.has(arr[arr.length-1].id||arr[arr.length-1].question))arr.pop();if(!arr.length)continue;
  const q=arr.pop(),id=q.id||q.question;pick.push(q);used.add(id);if(arr.length)next.push(k);if(pick.length>=total)break}keys=shuffle(next)}
 const hasRich=rich.length>0;
 const mechanicalLimit=hasRich?Math.max(1,Math.floor(total*.25)):total;
 const mechanicalSlots=Math.min(mechanical.length,mechanicalLimit);
 const targetRich=Math.max(0,total-mechanicalSlots);
 if(pick.length>targetRich)pick.length=targetRich;
 for(const q of mechanical){if(pick.length>=total)break;const id=q.id||q.question;if(!used.has(id)){pick.push(q);used.add(id)}}
 if(pick.length<total)for(const q of shuffle(pool)){if(pick.length>=total)break;const id=q.id||q.question;if(!used.has(id)){pick.push(q);used.add(id)}}
 return shuffle(pick.slice(0,total));
}
let refreshing=false;
async function refresh(){if(refreshing)return;refreshing=true;bankStatus.state=questions.length>1000?'ready':'loading';try{let result=await generateQuestions(()=>{});if(result.questions.length<20)throw Error(`Solo ${result.questions.length} domande da classifiche complete; archivio precedente conservato`);
 generated=result.questions;questions=[...original,...generated.filter(qualityFilter),...extras,...portugal,...classics,...official,...historyExpansion,...deepHistory,...competitionHistory,...europeanCups,...themedQuestions,...stadiumQuestions,...famousCareerQuestions,...wikiQuestions,...biographies].filter(q=>q.category!=='Calcio femminile');bankStatus={...bankStatus,state:'ready',stats:result.stats,updatedAt:new Date().toISOString(),error:null};recalc();console.log(`Football Legends: ${questions.length} domande, ${result.stats.sourcesSuccessful} fonti dati caricate`);
 // Salvataggio locale opportunistico: su Render Free non è persistente ai redeploy.
 try{fs.writeFileSync(snapshotPath,JSON.stringify({stats:result.stats,questions:generated}))}catch{}
 }catch(e){bankStatus.state=questions.length>1000?'ready':'fallback';bankStatus.error=e.message;console.error('Database: '+e.message)}finally{refreshing=false}}
const PORT=process.env.PORT||3000,rooms=new Map(),clients=new Map();
const registerIp=new Map();
function limited(ip){const now=Date.now(),entry=registerIp.get(ip)||{start:now,count:0};if(now-entry.start>3600000){entry.start=now;entry.count=0}entry.count++;registerIp.set(ip,entry);return entry.count>50}
async function accountRequest(req,res,pathname){
 const origin=req.headers.origin;
 if(origin){try{if(new URL(origin).host!==req.headers.host)throw Error('Origine non consentita')}catch{return jsonReply(res,403,{error:'Origine non consentita'})}}
 const ip=req.socket.remoteAddress||'unknown';if(limited(ip))return jsonReply(res,429,{error:'Troppe richieste, riprova più tardi.'});
 let raw='';try{for await(const chunk of req){raw+=chunk;if(raw.length>4096)throw Error('Richiesta troppo grande')}const x=JSON.parse(raw||'{}');
  if(pathname==='/api/account/register')return jsonReply(res,200,await accounts.register(x.nickname));
  if(pathname==='/api/account/recover')return jsonReply(res,200,await accounts.recover(x.nickname,x.code));
  if(pathname==='/api/account/rotate-recovery')return jsonReply(res,200,await accounts.rotateRecovery(x.token));
  if(pathname==='/api/account/me'){const acc=await accounts.authenticate(x.token);return acc?jsonReply(res,200,acc):jsonReply(res,401,{error:'Sessione non valida. Recupera il profilo.'})}
 }catch(e){return jsonReply(res,400,{error:e.message})}
}
function jsonReply(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body))}
const httpServer=http.createServer((req,res)=>{
 const pathname=(req.url||'/').split('?')[0];
 if(pathname.startsWith('/api/v4/'))return v4.handleHttp(req,res,pathname);
 if(pathname==='/api/account/status')return jsonReply(res,200,accounts.status());
 if(pathname.startsWith('/api/account/')){if(req.method!=='POST')return jsonReply(res,405,{error:'Metodo non consentito'});return accountRequest(req,res,pathname)}

 if(pathname==='/api/questions'){
  const u=new URL(req.url,'http://localhost');let limit=Math.min(3500,Math.max(10,Number(u.searchParams.get('limit'))||2500));
  const category=u.searchParams.get('category')||'Tutte';
  if(!topicFilters.valid(category))return jsonReply(res,400,{error:'Categoria non valida'});
  const eligible=category==='Tutte'?questions:questions.filter(q=>topicFilters.matches(category,q));
  const selected=category==='Tutte'?samplePool(limit):balancedDeck(eligible,Math.min(limit,eligible.length));
  return jsonReply(res,200,{questions:selected,available:eligible.length,category,status:bankStatus,served:selected.length});
 }
 if(pathname==='/api/leaderboard/status'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});return res.end(JSON.stringify(ranking.status()))}
 if(pathname==='/api/leaderboard'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});return ranking.leaderboard(30).then(rows=>res.end(JSON.stringify({status:ranking.status(),players:rows}))).catch(e=>res.end(JSON.stringify({status:{...ranking.status(),ready:false},players:[]})))}
 if(pathname==='/api/topics'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});return res.end(JSON.stringify({groups:topicFilters.counts(questions),available:questions.length}));}
 if(pathname==='/api/version'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});return res.end(JSON.stringify({version:'4.0.2',game:'Football Legends Ultimate Edition',state:bankStatus.state,questions:bankStatus.count}))}
 if(pathname==='/api/status'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});return res.end(JSON.stringify(bankStatus))}
 // File immagine locali: serviti dal server Node.js con percorso ristretto e tipo MIME corretto.
 if(/^\/assets\/categories\/[a-z0-9-]+\.webp$/.test(pathname)){
  const asset=path.join(__dirname,pathname.slice(1));
  fs.readFile(asset,(err,data)=>{
   if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Image not found')}
   res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'});
   res.end(data);
  });
  return;
 }
 if(pathname==='/v41.css'||pathname==='/v41-design.js'||pathname==='/v400.css'||pathname==='/v400-design.js'){const f=pathname.slice(1);res.writeHead(200,{'Content-Type':f.endsWith('.css')?'text/css; charset=utf-8':'application/javascript; charset=utf-8','Cache-Control':'no-store'});return res.end(fs.readFileSync(path.join(__dirname,f)))}
 if(pathname==='/assets/stadium-v41.webp'){res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'public, max-age=86400'});return res.end(fs.readFileSync(path.join(__dirname,'assets/stadium-v41.webp')))}
 if(pathname==='/v4-ui.js'){res.writeHead(200,{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store'});return res.end(fs.readFileSync(path.join(__dirname,'v4-ui.js')))}
 if(pathname!=='/'&&pathname!=='/index.html'){res.writeHead(404);return res.end('Not found')}
 const data=fs.readFileSync(path.join(__dirname,'index.html'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(data)
});
const wss=new WebSocket.Server({server:httpServer,maxPayload:4096});
v4.init({wss,accounts,bank:()=>questions,topics:topicFilters}).catch(e=>console.error('V4 competitive:',e.message));
const send=(ws,data)=>{if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(data))};const broadcast=(r,data)=>r.players.forEach(p=>send(p.ws,data));
function code(){let c;do{c=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(c));return c}
function clean(n){return String(n||'Campione').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,20)||'Campione'}
function summary(r){return [...r.players].sort((a,b)=>b.score-a.score).map(p=>({name:p.name,score:p.score}))}
function seriesBoard(r){return [...r.players].map(p=>({name:p.name,wins:p.wins||0,points:p.seriesPoints||0})).sort((a,b)=>b.wins-a.wins||b.points-a.points)}
function lobby(r){const categoryAvailable=questions.filter(q=>topicFilters.matches(r.category,q)).length;const bonusCount=Math.max(0,r.total-categoryAvailable);r.players.forEach(p=>send(p.ws,{type:'lobby',code:r.code,hostForYou:r.host===p,players:r.players.map(q=>({name:q.name,host:q===r.host,ready:!!q.ready})),category:r.category,total:r.total,categoryAvailable,bonusCount,phase:r.state,rounds:r.rounds||0,ranked:!!r.ranked,series:seriesBoard(r)}))}
function clearRoom(r){clearTimeout(r.timer);clearTimeout(r.readyTimer);rooms.delete(r.code);r.players.forEach(p=>clients.delete(p.ws))}
async function finish(r){
 if(!rooms.has(r.code)||r.state==='results'||r.state==='saving')return;
 clearTimeout(r.timer);r.timer=null;r.state='saving';
 r.rounds=(r.rounds||0)+1;
 const best=Math.max(...r.players.map(p=>p.score));const winners=r.players.filter(p=>p.score===best);
 for(const p of r.players){p.seriesPoints=(p.seriesPoints||0)+p.score;if(winners.includes(p))p.wins=(p.wins||0)+1}
 let saved=false,saveError='';let ratingChanges=null;
 try{saved=await ranking.record(r.roundId||crypto.randomUUID(),r.players.map(p=>({id:p.id,name:p.name,score:p.score,correct:p.correct,answered:p.answers})));if(r.ranked){ratingChanges=await v4.rankRound(r.roundId,r.players.map(p=>({id:p.id,name:p.name,score:p.score})))}}
 catch(e){saveError='Le statistiche globali non sono state salvate: '+e.message;console.error(saveError)}
 r.state='results';
 r.players.forEach(p=>send(p.ws,{type:'end',scores:summary(r),category:r.category,total:r.total,code:r.code,hostForYou:r.host===p,rounds:r.rounds,series:seriesBoard(r),ranked:!!r.ranked,ratingChanges,persistent:{...ranking.status(),saved,notice:saveError||(!ranking.status().ready?'Collega DATABASE_URL a Render per salvare vittorie e sconfitte dopo i riavvii.':'')}}))
}
function reveal(r){if(!rooms.has(r.code)||r.state!=='question')return;r.state='reveal';clearTimeout(r.timer);const q=r.current;broadcast(r,{type:'reveal',correct:r.order.indexOf(q.answer),answerText:q.options[q.answer],explanation:q.explanation,scores:summary(r)});r.timer=setTimeout(()=>next(r),3400)}
function next(r){if(!rooms.has(r.code))return;if(r.index>=r.deck.length){finish(r);return}r.state='question';r.current=r.deck[r.index++];r.order=shuffle([0,1,2]);r.started=Date.now();r.answered=new Set();broadcast(r,{type:'question',number:r.index,total:r.deck.length,category:r.current.category,difficulty:r.current.difficulty,question:r.current.question,options:r.order.map(i=>r.current.options[i]),scores:summary(r),seconds:15});r.timer=setTimeout(()=>reveal(r),15500)}
function detach(ws){let p=clients.get(ws);if(!p)return;let r=rooms.get(p.room);clients.delete(ws);if(!r)return;r.players=r.players.filter(q=>q!==p);if(!r.players.length){clearRoom(r);return}if(r.host===p)r.host=r.players[0];if(r.state==='lobby')lobby(r);else if(r.state==='results')r.players.forEach(u=>send(u.ws,{type:'end',scores:summary(r),category:r.category,total:r.total,code:r.code,hostForYou:r.host===u,rounds:r.rounds||0,series:seriesBoard(r)}));else if(r.state==='question'&&r.answered.size>=r.players.length)reveal(r)}
wss.on('connection',ws=>{ws.isAlive=true;ws.on('pong',()=>ws.isAlive=true);ws.on('message',async raw=>{let x;try{x=JSON.parse(raw)}catch{return}if(!x||typeof x.type!=='string')return;let p=clients.get(ws);
 if(x.type==='create'){if(p)return;let acc;try{acc=await accounts.authenticate(x.token)}catch(e){return send(ws,{type:'error',message:'Verifica profilo non disponibile.'})}if(!acc)return send(ws,{type:'error',message:'Devi registrare o recuperare il tuo nickname prima di giocare.'});const candidate=String(x.category||'Tutte');const chosenCategory=topicFilters.valid(candidate)?candidate:'Tutte';const chosenTotal=[10,15,20,30].includes(Number(x.total))?Number(x.total):10;let r={ranked:!!x.ranked,readyTimer:null,code:code(),players:[],state:'lobby',host:null,timer:null,category:chosenCategory,total:chosenTotal,rounds:0};p={ws,room:r.code,id:acc.id,name:acc.nickname,score:0,wins:0,seriesPoints:0,correct:0,answers:0,ready:true};r.host=p;r.players.push(p);rooms.set(r.code,r);clients.set(ws,p);lobby(r);return}
 if(x.type==='join'){if(p)return;let acc;try{acc=await accounts.authenticate(x.token)}catch(e){return send(ws,{type:'error',message:'Verifica profilo non disponibile.'})}if(!acc)return send(ws,{type:'error',message:'Devi registrare o recuperare il tuo nickname prima di giocare.'});let r=rooms.get(String(x.code||'').toUpperCase());if(!r||r.state!=='lobby')return send(ws,{type:'error',message:'Stanza inesistente o partita già iniziata.'});if(r.players.length>=8)return send(ws,{type:'error',message:'Stanza piena (8 giocatori).'});p={ws,room:r.code,id:acc.id,name:acc.nickname,score:0,wins:0,seriesPoints:0,correct:0,answers:0,ready:false};if(r.players.some(u=>u.id===p.id))return send(ws,{type:'error',message:'Questo profilo è già nella stanza.'});r.players.push(p);clients.set(ws,p);lobby(r);return}
 if(!p)return;let r=rooms.get(p.room);if(!r)return;
 if(x.type==='ready'&&r.state==='lobby'){p.ready=!!x.ready;lobby(r);return}
 if(x.type==='profile'){ranking.profile(p.id).then(profile=>send(ws,{type:'profile',profile,status:ranking.status()})).catch(()=>send(ws,{type:'profile',profile:null,status:ranking.status()}));return}
 if(x.type==='rematch'){if(r.host!==p||r.state!=='results')return send(ws,{type:'error',message:'Solo l’organizzatore può preparare una rivincita.'});r.state='lobby';r.deck=[];r.index=0;r.players.forEach(u=>{u.score=0;u.correct=0;u.answers=0;u.ready=u===r.host});lobby(r);return}
 if(x.type==='settings'){if(r.host!==p||r.state!=='lobby')return send(ws,{type:'error',message:'Solo l’organizzatore può cambiare le impostazioni prima della partita.'});const cat=String(x.category||'Tutte');const total=Number(x.total);if(!topicFilters.valid(cat))return send(ws,{type:'error',message:'Categoria non disponibile.'});if(![10,15,20,30].includes(total))return send(ws,{type:'error',message:'Durata non valida.'});r.category=cat;r.total=total;lobby(r);return}
 if(x.type==='start'){if(r.host!==p||r.players.length<2||r.state!=='lobby')return send(ws,{type:'error',message:'Servono almeno 2 giocatori; avvia solo l’host.'});if(r.ranked&&r.players.some(u=>!u.ready))return send(ws,{type:'error',message:'Per la Ranked tutti i giocatori devono essere pronti.'});const selected=r.category,total=r.total;const pool=questions.filter(q=>topicFilters.matches(selected,q));if(!pool.length)return send(ws,{type:'error',message:'Nessuna domanda disponibile in questa categoria.'});if(questions.length<total)return send(ws,{type:'error',message:'Archivio insufficiente per questa durata.'});
 const categoryDeck=selected==='Tutte'?balancedDeck(pool,total):shuffle(pool).slice(0,total);
 if(categoryDeck.length<total){
   const selectedIds=new Set(categoryDeck.map(q=>q.id||q.question));
   const rest=questions.filter(q=>!topicFilters.matches(selected,q)&&!selectedIds.has(q.id||q.question));
   const extra=balancedDeck(rest,total-categoryDeck.length);
   if(extra.length<total-categoryDeck.length)return send(ws,{type:'error',message:'Non ci sono abbastanza domande diverse per questa durata.'});
   categoryDeck.push(...extra);
 }
 r.deck=shuffle(categoryDeck);r.category=selected;r.index=0;r.roundId=crypto.randomUUID();r.players.forEach(u=>{u.score=0;u.correct=0;u.answers=0});r.state='countdown';broadcast(r,{type:'countdown',seconds:3,ranked:!!r.ranked});r.timer=setTimeout(()=>next(r),3000);return}
 if(x.type==='answer'&&r.state==='question'){if(r.answered.has(p))return;const val=x.index;if(!Number.isInteger(val)||val<0||val>2)return;r.answered.add(p);p.answers=(p.answers||0)+1;if(r.order[val]===r.current.answer){p.correct=(p.correct||0)+1;const seconds=Math.max(0,15-(Date.now()-r.started)/1000);p.score+=100+Math.ceil(seconds)*10}send(ws,{type:'answered'});if(r.answered.size===r.players.length)reveal(r)}
 });ws.on('close',()=>detach(ws));ws.on('error',()=>detach(ws))});
setInterval(()=>{for(const ws of wss.clients){if(ws.isAlive===false){ws.terminate();continue}ws.isAlive=false;ws.ping()}},30000).unref();
ranking.init().catch(e=>console.error('Classifiche:',e.message));
accounts.init().catch(e=>console.error('Account:',e.message));
httpServer.listen(PORT,()=>{console.log(`Football Legends 4.0.2 online http://localhost:${PORT} (${questions.length} domande iniziali)`);if(!generated.length||process.env.FORCE_REFRESH==='true')refresh()});
