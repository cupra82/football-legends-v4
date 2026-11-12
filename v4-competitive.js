'use strict';
// Football Legends 4.0.4 LAB — separate features (isolated DB schema), server-authoritative Rush and tournament.
const crypto=require('crypto');
const {Pool}=require('pg');
const WebSocket=require('ws');
let ctx,db=null,ready=false;const rush=new Map(),tournaments=new Map(),sockets=new Map();
const isId=x=>typeof x==='string'&&/^[0-9a-f]{32}$/i.test(x);
const key=x=>crypto.createHash('sha256').update(x.toLowerCase()).digest('hex');
function pick(a){return a[crypto.randomInt(a.length)]}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=crypto.randomInt(i+1);[b[i],b[j]]=[b[j],b[i]]}return b}
function good(q){return q&&typeof q.question==='string'&&Array.isArray(q.options)&&q.options.length===3&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3&&new Set(q.options.map(String)).size===3}
function bank(){const seen=new Set();return ctx.bank().filter(q=>{if(!good(q))return false;const id=String(q.id||q.question);if(seen.has(id))return false;seen.add(id);return true})}
function reply(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))}
async function body(req){let s='';for await(const chunk of req){s+=chunk;if(s.length>4096)throw Error('Richiesta troppo grande')}return JSON.parse(s||'{}')}
function originOk(req){if(!req.headers.origin)return true;try{return new URL(req.headers.origin).host===req.headers.host}catch{return false}}
async function init({wss,accounts,bank,topics}){
 ctx={accounts,bank,topics};
 if(process.env.DATABASE_URL&&process.env.FL_V4_DB_ISOLATED==='YES'){
  try{
   db=new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:7000,idleTimeoutMillis:30000});
   db.on('error',e=>{ready=false;console.error('V4 DB:',e.message)});
   await db.query(`CREATE TABLE IF NOT EXISTS fl_v4_ratings(player_id CHAR(64) PRIMARY KEY,name VARCHAR(20) NOT NULL,rating INTEGER NOT NULL DEFAULT 1000,games INTEGER NOT NULL DEFAULT 0,wins INTEGER NOT NULL DEFAULT 0,updated_at TIMESTAMPTZ DEFAULT now())`);
   await db.query(`CREATE TABLE IF NOT EXISTS fl_v4_ranked_rounds(round_id UUID PRIMARY KEY,created_at TIMESTAMPTZ DEFAULT now())`);
   await db.query(`CREATE TABLE IF NOT EXISTS fl_v4_rush(player_id CHAR(64) PRIMARY KEY,name VARCHAR(20) NOT NULL,best INTEGER NOT NULL DEFAULT 0,games INTEGER NOT NULL DEFAULT 0,correct INTEGER NOT NULL DEFAULT 0,updated_at TIMESTAMPTZ DEFAULT now())`);
   await db.query(`CREATE TABLE IF NOT EXISTS fl_v4_tournaments(id UUID PRIMARY KEY,winner_id CHAR(64),winner_name VARCHAR(20),player_count INTEGER NOT NULL,created_at TIMESTAMPTZ DEFAULT now())`);
   ready=true;console.log('V4: Ranked, Rush e Tornei pronti');
  }catch(e){console.error('V4 DB init:',e.message);ready=false}
 }
 wss.on('connection',(ws)=>{
  ws.on('message',raw=>{let x;try{x=JSON.parse(raw)}catch{return}if(x&&typeof x.type==='string'&&x.type.startsWith('v4t:'))tournamentMessage(ws,x).catch(e=>send(ws,{type:'v4t:error',message:'Errore torneo: '+e.message}))});
  ws.on('close',()=>leaveTournament(ws));
 });
 setInterval(()=>{const now=Date.now();for(const [id,r] of rush)if(r.expires+60000<now)rush.delete(id)},60000).unref();
}
async function handleHttp(req,res,pathname){
 if(!ctx)return reply(res,503,{error:'Motore 4.0 non pronto'});
 if(req.method==='GET'&&['/api/v4/rush/leaderboard','/api/v4/ranked/leaderboard','/api/v4/info'].includes(pathname)){
  if(pathname==='/api/v4/info')return reply(res,200,{version:'4.0.4-lab',features:['tournaments','ranked','rush','ready-lobby'],databaseReady:ready});
  if(!ready)return reply(res,503,{error:'Database LAB non disponibile'});
  try{const table=pathname.includes('ranked')?'fl_v4_ratings':'fl_v4_rush',order=pathname.includes('ranked')?'rating DESC,games DESC':'best DESC,games ASC';const result=await db.query(`SELECT name,${table==='fl_v4_ratings'?'rating,games,wins':'best,games,correct'} FROM ${table} ORDER BY ${order} LIMIT 30`);return reply(res,200,{players:result.rows})}catch(e){return reply(res,503,{error:'Classifica temporaneamente non disponibile'})}
 }
 if(req.method!=='POST')return reply(res,405,{error:'Metodo non consentito'});
 if(!originOk(req))return reply(res,403,{error:'Origine non consentita'});
 try{
  const x=await body(req),acc=await ctx.accounts.authenticate(x.token);
  if(!acc)return reply(res,401,{error:'Prima registra o recupera il profilo nella sezione Arena online.'});
  if(pathname==='/api/v4/rush/start'){
   if(!ready)return reply(res,503,{error:'Database LAB non disponibile'});
   const seconds=[60,90].includes(Number(x.seconds))?Number(x.seconds):60;
   const category=typeof x.category==='string'&&ctx.topics.valid(x.category)?x.category:'Tutte';
   const pool=bank().filter(q=>ctx.topics.matches(category,q));if(pool.length<12)return reply(res,400,{error:'Categoria con meno di 12 domande: scegli Mix totale.'});
   // In-memory sessions are intentional: a Render restart cancels a running Rush but cannot corrupt scores.
   for(const [k,v] of rush)if(v.acc.id===acc.id)rush.delete(k);
   const id=crypto.randomUUID(),deck=shuffle(pool).slice(0,Math.min(180,pool.length));
   const state={id,acc,deck,index:0,score:0,correct:0,combo:0,expires:Date.now()+seconds*1000,answered:false,finished:false,seconds};rush.set(id,state);
   return reply(res,200,{session:id,expires:state.expires,seconds,score:0,correct:0,question:rushQuestion(state)});
  }
  if(pathname==='/api/v4/rush/answer'){
   const state=rush.get(String(x.session||''));if(!state||state.acc.id!==acc.id)return reply(res,404,{error:'Sessione Rush scaduta'});
   if(state.finished)return reply(res,409,{error:'Rush già conclusa'});
   const q=state.deck[state.index];if(!q)return reply(res,409,{error:'Nessuna domanda restante'});
   const chosen=Number(x.answer),expired=Date.now()>=state.expires;
   const wasCorrect=!expired&&Number.isInteger(chosen)&&chosen>=0&&chosen<=2&&state.order[chosen]===q.answer;
   if(wasCorrect){state.combo++;state.correct++;state.score+=100+Math.min(state.combo-1,10)*15}else state.combo=0;
   const answer=q.options[q.answer];state.index++;
   const ended=expired||state.index>=state.deck.length;
   if(ended){state.finished=true;const saved=await saveRush(state);rush.delete(state.id);return reply(res,200,{finished:true,score:state.score,correct:state.correct,answered:state.index,answer,wasCorrect,saved})}
   return reply(res,200,{finished:false,score:state.score,correct:state.correct,answered:state.index,expires:state.expires,answer,wasCorrect,question:rushQuestion(state)});
  }
  if(pathname==='/api/v4/rush/finish'){
   const state=rush.get(String(x.session||''));if(!state||state.acc.id!==acc.id)return reply(res,404,{error:'Sessione non trovata'});
   if(Date.now()<state.expires)return reply(res,409,{error:'Il tempo non è ancora scaduto'});
   state.finished=true;const saved=await saveRush(state);rush.delete(state.id);return reply(res,200,{finished:true,score:state.score,correct:state.correct,answered:state.index,saved});
  }
  return reply(res,404,{error:'API sconosciuta'});
 }catch(e){console.error('V4 request:',e.message);return reply(res,500,{error:'Operazione non riuscita'})}
}
function rushQuestion(state){const q=state.deck[state.index];if(!q)return null;state.order=shuffle([0,1,2]);return {number:state.index+1,category:q.category,question:q.question,options:state.order.map(i=>q.options[i])}}
async function saveRush(r){if(!ready)return false;await db.query(`INSERT INTO fl_v4_rush(player_id,name,best,games,correct) VALUES($1,$2,$3,1,$4) ON CONFLICT(player_id) DO UPDATE SET name=EXCLUDED.name,best=GREATEST(fl_v4_rush.best,EXCLUDED.best),games=fl_v4_rush.games+1,correct=fl_v4_rush.correct+EXCLUDED.correct,updated_at=now()`,[key(r.acc.id),r.acc.nickname,r.score,r.correct]);return true}
async function rankRound(roundId,players){if(!ready)throw Error('Classifica Ranked temporaneamente non disponibile');if(!players.length||players.some(p=>!isId(p.id)))throw Error('Profilo Ranked non valido');
 const cl=await db.connect();try{await cl.query('BEGIN');const insert=await cl.query('INSERT INTO fl_v4_ranked_rounds(round_id) VALUES($1) ON CONFLICT DO NOTHING RETURNING round_id',[roundId]);if(!insert.rowCount){await cl.query('ROLLBACK');return []}
 const before=[];for(const p of players){let r=await cl.query('SELECT rating,games,wins FROM fl_v4_ratings WHERE player_id=$1 FOR UPDATE',[key(p.id)]);before.push({player:p,rating:r.rows[0]?.rating||1000,games:r.rows[0]?.games||0,wins:r.rows[0]?.wins||0})}
 const scores=players.map(p=>p.score),winnerCount=scores.filter(s=>s===Math.max(...scores)).length;
 const changes=[];for(const a of before){let delta=0;for(const b of before){if(a===b)continue;const actual=a.player.score===b.player.score?0.5:(a.player.score>b.player.score?1:0);const exp=1/(1+Math.pow(10,(b.rating-a.rating)/400));delta+=(actual-exp)*24/Math.max(1,players.length-1)}const next=Math.max(100,Math.round(a.rating+delta));await cl.query(`INSERT INTO fl_v4_ratings(player_id,name,rating,games,wins) VALUES($1,$2,$3,1,$4) ON CONFLICT(player_id) DO UPDATE SET name=EXCLUDED.name,rating=EXCLUDED.rating,games=fl_v4_ratings.games+1,wins=fl_v4_ratings.wins+EXCLUDED.wins,updated_at=now()`,[key(a.player.id),a.player.name,next,a.player.score===Math.max(...scores)&&winnerCount===1?1:0]);changes.push({name:a.player.name,previous:a.rating,rating:next,delta:next-a.rating})}
 await cl.query('COMMIT');return changes;
 }catch(e){await cl.query('ROLLBACK').catch(()=>{});throw e}finally{cl.release()}}
function send(ws,x){if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(x))}
function broadcast(r,x){r.players.forEach(p=>send(p.ws,x))}
function tournamentCode(){let c;do{c=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(tournaments.has(c));return c}
function safePlayer(p){return {name:p.acc.nickname,ready:p.ready,active:p.active,host:p===tournaments.get(p.room)?.players[0]}}
function tournamentLobby(r){broadcast(r,{type:'v4t:lobby',code:r.code,players:r.players.map(safePlayer),size:r.size,phase:r.phase,hostId:r.hostId})}
async function tournamentMessage(ws,x){
 if(x.type==='v4t:create'||x.type==='v4t:join'){
  if(sockets.has(ws))return send(ws,{type:'v4t:error',message:'Sei già in un torneo'});
  const acc=await ctx.accounts.authenticate(x.token);if(!acc)return send(ws,{type:'v4t:error',message:'Registra il nickname in Arena online prima di creare il torneo.'});
  let r;
  if(x.type==='v4t:create'){const size=[4,8].includes(Number(x.size))?Number(x.size):4;r={code:tournamentCode(),id:crypto.randomUUID(),size,players:[],phase:'lobby',round:0,bracket:[],timer:null,hostId:acc.id};tournaments.set(r.code,r)}
  else {r=tournaments.get(String(x.code||'').toUpperCase());if(!r||r.phase!=='lobby'||r.players.length>=r.size)return send(ws,{type:'v4t:error',message:'Stanza non disponibile o completa'})}
  if(r.players.some(p=>p.acc.id===acc.id))return send(ws,{type:'v4t:error',message:'Questo nickname è già nel torneo'});
  const p={ws,acc,room:r.code,ready:x.type==='v4t:create',active:true,points:0,correct:0,elapsed:0};r.players.push(p);sockets.set(ws,p);tournamentLobby(r);return;
 }
 const p=sockets.get(ws);if(!p)return;
 const r=tournaments.get(p.room);if(!r)return;
 if(x.type==='v4t:ready'&&r.phase==='lobby'){p.ready=!!x.ready;tournamentLobby(r);return}
 if(x.type==='v4t:start'){if(r.phase!=='lobby'||r.hostId!==p.acc.id)return; if(r.players.length!==r.size||r.players.some(a=>!a.ready))return send(ws,{type:'v4t:error',message:`Servono ${r.size} giocatori pronti per iniziare`});r.active=shuffle(r.players);r.bracket=[];r.phase='playing';r.round=0;startTournamentRound(r);return}
 if(x.type==='v4t:answer'&&r.phase==='question'&&p.active&&!r.answers.has(p.acc.id)){
  const v=Number(x.index);if(!Number.isInteger(v)||v<0||v>2)return;
  r.answers.set(p.acc.id,v);const q=r.deck[r.index];if(r.order[v]===q.answer){p.correct++;p.points+=100+Math.ceil(Math.max(0,15000-(Date.now()-r.started))/1000)*10;p.elapsed+=Date.now()-r.started}
  send(ws,{type:'v4t:answered'});if(r.active.every(a=>r.answers.has(a.acc.id)))revealTournament(r);
 }
}
function startTournamentRound(r){
 if(!tournaments.has(r.code))return;
 r.round++;r.pairs=[];for(let i=0;i<r.active.length;i+=2)r.pairs.push([r.active[i],r.active[i+1]]);
 for(const p of r.players){p.active=r.active.includes(p);p.points=0;p.correct=0;p.elapsed=0}
 const pool=bank();r.deck=shuffle(pool).slice(0,10);r.index=0;r.phase='round';broadcast(r,{type:'v4t:round',round:r.round,rounds:Math.log2(r.size),pairs:r.pairs.map(([a,b])=>[a.acc.nickname,b.acc.nickname])});nextTournament(r);
}
function nextTournament(r){if(!tournaments.has(r.code))return;clearTimeout(r.timer);if(r.index>=r.deck.length){finishTournamentRound(r).catch(e=>console.error('tournament finish:',e.message));return}
 r.phase='question';const q=r.deck[r.index];r.order=shuffle([0,1,2]);r.answers=new Map();r.started=Date.now();broadcast(r,{type:'v4t:question',round:r.round,number:r.index+1,total:r.deck.length,question:q.question,category:q.category,options:r.order.map(j=>q.options[j]),active:r.active.map(p=>p.acc.nickname),scores:r.active.map(p=>({name:p.acc.nickname,score:p.points})),seconds:15});r.timer=setTimeout(()=>revealTournament(r),15500);
}
function revealTournament(r){if(!tournaments.has(r.code)||r.phase!=='question')return;clearTimeout(r.timer);r.phase='reveal';const q=r.deck[r.index];broadcast(r,{type:'v4t:reveal',correct:r.order.indexOf(q.answer),answer:q.options[q.answer],scores:r.active.map(p=>({name:p.acc.nickname,score:p.points}))});r.index++;r.timer=setTimeout(()=>nextTournament(r),1400)}
async function finishTournamentRound(r){
 if(!tournaments.has(r.code))return;r.phase='between';const winners=[];const results=[];
 for(const [a,b] of r.pairs){const winner=a.points!==b.points?(a.points>b.points?a:b):a.correct!==b.correct?(a.correct>b.correct?a:b):a.elapsed!==b.elapsed?(a.elapsed<b.elapsed?a:b):(a.acc.id<b.acc.id?a:b);winners.push(winner);results.push({a:a.acc.nickname,b:b.acc.nickname,scoreA:a.points,scoreB:b.points,winner:winner.acc.nickname})}
 r.bracket.push({round:r.round,matches:results});broadcast(r,{type:'v4t:round_end',bracket:r.bracket,champion:winners.length===1?winners[0].acc.nickname:null});
 if(winners.length===1){r.phase='finished';if(ready){try{await db.query('INSERT INTO fl_v4_tournaments(id,winner_id,winner_name,player_count) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[r.id,key(winners[0].acc.id),winners[0].acc.nickname,r.size])}catch(e){console.error('Torneo salva:',e.message)}}return}
 r.active=winners;r.timer=setTimeout(()=>startTournamentRound(r),6000);
}
function leaveTournament(ws){const p=sockets.get(ws);if(!p)return;sockets.delete(ws);const r=tournaments.get(p.room);if(!r)return;r.players=r.players.filter(x=>x!==p);
 if(r.phase!=='lobby'){clearTimeout(r.timer);broadcast(r,{type:'v4t:error',message:'Un giocatore si è disconnesso. Il torneo è stato annullato.'});for(const a of r.players)sockets.delete(a.ws);tournaments.delete(r.code);return}
 if(!r.players.length){tournaments.delete(r.code);return}
 if(r.hostId===p.acc.id){r.hostId=r.players[0].acc.id;r.players[0].ready=true}
 tournamentLobby(r);
}
module.exports={init,handleHttp,rankRound};
