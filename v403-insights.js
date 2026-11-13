"use strict";
// 4.0.3: isolated analytics; entirely additive to the pre-existing V4 schema.
const {Pool}=require('pg');
const crypto=require('crypto');
let db=null,ready=false,lastError='';
const idOk=s=>typeof s==='string'&&/^[a-f0-9]{32}$/i.test(s);
const sha=s=>crypto.createHash('sha256').update(s.toLowerCase()).digest('hex');
const clean=s=>String(s||'').trim().slice(0,160);
const name=s=>clean(s).slice(0,20);
async function init(){
 if(!process.env.DATABASE_URL||process.env.FL_V4_DB_ISOLATED!=='YES')return;
 try{
 db=new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:8000});
 db.on('error',e=>{ready=false;lastError=e.message});
 await db.query(`CREATE TABLE IF NOT EXISTS fl403_rounds(id UUID PRIMARY KEY,created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
 // Counts per category are stored in the round aggregates, not per-question rows.
 await db.query(`CREATE TABLE IF NOT EXISTS fl403_category_totals(round_id UUID NOT NULL REFERENCES fl403_rounds(id),player_id CHAR(64) NOT NULL,name VARCHAR(20) NOT NULL,category VARCHAR(120) NOT NULL,answered INT NOT NULL,correct INT NOT NULL,PRIMARY KEY(round_id,player_id,category))`);
 await db.query(`CREATE TABLE IF NOT EXISTS fl403_rivalries(round_id UUID NOT NULL REFERENCES fl403_rounds(id),player_a CHAR(64) NOT NULL, player_b CHAR(64) NOT NULL,name_a VARCHAR(20) NOT NULL,name_b VARCHAR(20) NOT NULL,score_a INTEGER NOT NULL,score_b INTEGER NOT NULL,PRIMARY KEY(round_id,player_a,player_b))`);
 await db.query(`CREATE TABLE IF NOT EXISTS fl403_trophies(player_id CHAR(64) NOT NULL,trophy VARCHAR(60) NOT NULL,unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),PRIMARY KEY(player_id,trophy))`);
 await db.query(`CREATE TABLE IF NOT EXISTS fl403_reports(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),player_id CHAR(64) NOT NULL,name VARCHAR(20) NOT NULL,question_id VARCHAR(160) NOT NULL,question_text TEXT NOT NULL,reason VARCHAR(35) NOT NULL,comment VARCHAR(500),created_at TIMESTAMPTZ NOT NULL DEFAULT now(),UNIQUE(player_id,question_id,reason))`);
 ready=true;lastError='';console.log('Football Legends 4.0.3: statistiche, trofei e segnalazioni pronti');
 }catch(e){ready=false;lastError=e.message;console.error('FL403 init:',e.message)}
}
async function recordRound(roundId,players){
 if(!ready||!players?.length)return false;
 const cl=await db.connect();try{
 await cl.query('BEGIN');
 const inserted=await cl.query('INSERT INTO fl403_rounds(id) VALUES($1) ON CONFLICT DO NOTHING RETURNING id',[roundId]);
 if(!inserted.rowCount){await cl.query('ROLLBACK');return false}
 for(const p of players){if(!idOk(p.id))continue;const pid=sha(p.id),n=name(p.name);
  for(const [category,v] of Object.entries(p.categoryStats||{})){
   if(!v||!v.answered||v.correct>v.answered)continue;
   await cl.query('INSERT INTO fl403_category_totals(round_id,player_id,name,category,answered,correct) VALUES ($1,$2,$3,$4,$5,$6)',[roundId,pid,n,clean(category).slice(0,120),v.answered,v.correct]);
  }
 }
 for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){
  const a=players[i],b=players[j];if(!idOk(a.id)||!idOk(b.id))continue;
  const ordered=[a,b].sort((p,q)=>sha(p.id).localeCompare(sha(q.id)));
  await cl.query('INSERT INTO fl403_rivalries(round_id,player_a,player_b,name_a,name_b,score_a,score_b) VALUES ($1,$2,$3,$4,$5,$6,$7)',[roundId,sha(ordered[0].id),sha(ordered[1].id),name(ordered[0].name),name(ordered[1].name),ordered[0].score,ordered[1].score]);
 }
 for(const p of players){if(!idOk(p.id))continue;const pid=sha(p.id);
  const count=await cl.query('SELECT COUNT(*)::int AS games,COALESCE(SUM(CASE WHEN score_a>score_b AND player_a=$1 OR score_b>score_a AND player_b=$1 THEN 1 ELSE 0 END),0)::int AS wins FROM fl403_rivalries WHERE player_a=$1 OR player_b=$1',[pid]);
  const games=count.rows[0]?.games||0;
  const answers=(p.categoryStats||{});const correct=Object.values(answers).reduce((sum,x)=>sum+(x.correct||0),0);
  const badges=[...(games>=1?['debutto-arena']:[]),...(games>=10?['veterano-arena']:[]),...(p.score>=1500?['fuoriclasse-punti']:[]),...(correct>=10?['dieci-risposte']:[])];
  for(const badge of badges)await cl.query('INSERT INTO fl403_trophies(player_id,trophy) VALUES($1,$2) ON CONFLICT DO NOTHING',[pid,badge]);
 }
 await cl.query('COMMIT');return true;
 }catch(e){await cl.query('ROLLBACK').catch(()=>{});console.error('FL403 record:',e.message);return false}finally{cl.release()}
}
async function authenticate(accounts,token){const a=await accounts.authenticate(token);if(!a||!idOk(a.id))return null;return a}
async function handle(req,res,pathname,accounts,bank){
 const reply=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))};
 if(pathname==='/api/v403/status')return reply(200,{version:'4.0.3',databaseReady:ready});
 if(!ready)return reply(503,{error:'Database di statistiche V4 temporaneamente non disponibile'});
 if(req.method!=='POST')return reply(405,{error:'Metodo non consentito'});
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return reply(403,{error:'Origine non consentita'})}catch{return reply(403,{error:'Origine non consentita'})}}
 let body='';try{for await(const chunk of req){body+=chunk;if(body.length>4096)return reply(413,{error:'Richiesta troppo grande'})}}catch{return reply(400,{error:'Richiesta non valida'})}
 let data;try{data=JSON.parse(body||'{}')}catch{return reply(400,{error:'JSON non valido'})}
 let acc;try{acc=await authenticate(accounts,data.token)}catch{return reply(503,{error:'Profilo non disponibile'})}
 if(!acc)return reply(401,{error:'Accedi al tuo nickname in Arena online per usare questa funzione'});
 const pid=sha(acc.id);
 try{
 if(pathname==='/api/v403/report'){
  const reason=String(data.reason||'');if(!['errata','ambigua','duplicata','altro'].includes(reason))return reply(400,{error:'Motivo non valido'});
  const qid=clean(data.questionId);if(!qid)return reply(400,{error:'ID domanda mancante'});
  const q=bank().find(x=>String(x.id||x.question).slice(0,160)===qid);if(!q)return reply(404,{error:'Domanda non riconosciuta'});
  const comment=clean(data.comment).slice(0,500);
  await db.query('INSERT INTO fl403_reports(player_id,name,question_id,question_text,reason,comment) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(player_id,question_id,reason) DO NOTHING',[pid,name(acc.nickname),qid,String(q.question).slice(0,1000),reason,comment]);
  return reply(200,{ok:true,message:'Segnalazione registrata, grazie!'});
 }
 if(pathname==='/api/v403/profile'){
  const cat=await db.query(`SELECT category,SUM(answered)::int AS answered,SUM(correct)::int AS correct FROM fl403_category_totals WHERE player_id=$1 GROUP BY category ORDER BY answered DESC LIMIT 50`,[pid]);
  const rv=await db.query(`SELECT CASE WHEN player_a=$1 THEN name_b ELSE name_a END AS opponent,
  COUNT(*)::int AS games,
  SUM(CASE WHEN player_a=$1 AND score_a>score_b OR player_b=$1 AND score_b>score_a THEN 1 ELSE 0 END)::int AS wins,
  SUM(CASE WHEN player_a=$1 AND score_a<score_b OR player_b=$1 AND score_b<score_a THEN 1 ELSE 0 END)::int AS losses,
  SUM(CASE WHEN score_a=score_b THEN 1 ELSE 0 END)::int AS ties
  FROM fl403_rivalries WHERE player_a=$1 OR player_b=$1 GROUP BY opponent ORDER BY games DESC LIMIT 40`,[pid]);
  const trophies=await db.query('SELECT trophy,unlocked_at FROM fl403_trophies WHERE player_id=$1 ORDER BY unlocked_at',[pid]);
  return reply(200,{nickname:acc.nickname,categories:cat.rows,rivalries:rv.rows,trophies:trophies.rows});
 }
 return reply(404,{error:'Endpoint non trovato'});
 }catch(e){console.error('FL403 query:',e.message);return reply(503,{error:'Statistiche non disponibili'})}
}
async function award(playerId,trophy){if(!ready||!idOk(playerId)||!['rush-prima','rush-3000','campione-torneo','campione-ranked'].includes(trophy))return false;try{await db.query('INSERT INTO fl403_trophies(player_id,trophy) VALUES($1,$2) ON CONFLICT DO NOTHING',[sha(playerId),trophy]);return true}catch(e){console.error('FL403 trophy:',e.message);return false}}
module.exports={init,recordRound,handle,award};
