'use strict';
// Partite Arena/Ranked salvate nel Supabase V4. Nessuna modifica alle classifiche esistenti.
const {Pool}=require('pg');const crypto=require('crypto');
const hash=id=>crypto.createHash('sha256').update(id.toLowerCase()).digest('hex');
const validId=id=>typeof id==='string'&&/^[a-f0-9]{32}$/i.test(id);
let pool=null,ready=false,error='';
async function init(){
 if(!process.env.DATABASE_URL||process.env.FL_V4_DB_ISOLATED!=='YES')return;
 try{
  pool=new Pool({connectionString:process.env.DATABASE_URL,max:2,connectionTimeoutMillis:8000,query_timeout:12000});pool.on('error',e=>{ready=false;error=e.message});
  await pool.query(`CREATE TABLE IF NOT EXISTS fl407_matches(
    id UUID PRIMARY KEY,played_at TIMESTAMPTZ NOT NULL DEFAULT now(),mode VARCHAR(15) NOT NULL,
    category VARCHAR(120) NOT NULL,question_count INTEGER NOT NULL,winner VARCHAR(20),
    first_score INTEGER NOT NULL,second_score INTEGER NOT NULL,margin INTEGER NOT NULL,player_count INTEGER NOT NULL)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS fl407_match_players(
    match_id UUID NOT NULL REFERENCES fl407_matches(id) ON DELETE CASCADE,
    player_id CHAR(64) NOT NULL,name VARCHAR(20) NOT NULL,score INTEGER NOT NULL,
    position INTEGER NOT NULL,PRIMARY KEY(match_id,player_id))`);
  await pool.query('CREATE INDEX IF NOT EXISTS fl407_match_players_player_idx ON fl407_match_players(player_id,match_id)');
  ready=true;error='';
 }catch(e){ready=false;error=e.message;console.error('FL407 init:',e.message)}
}
async function record(match){
 if(!ready||!match||!match.players?.length||!match.players.every(p=>validId(p.id)))return false;
 const players=[...match.players].sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
 const top=Number(players[0].score),second=Number(players[1]?.score??top);
 const winners=players.filter(p=>Number(p.score)===top);
 const winner=winners.length===1?String(winners[0].name).slice(0,20):null;
 const connection=await pool.connect();try{
  await connection.query('BEGIN');
  const inserted=await connection.query(`INSERT INTO fl407_matches(id,mode,category,question_count,winner,first_score,second_score,margin,player_count) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING RETURNING id`,[match.id,match.ranked?'Ranked':'Arena',String(match.category||'Tutte').slice(0,120),Number(match.total)||10,winner,top,second,top-second,players.length]);
  if(!inserted.rowCount){await connection.query('ROLLBACK');return false}
  for(let i=0;i<players.length;i++){const p=players[i];await connection.query('INSERT INTO fl407_match_players(match_id,player_id,name,score,position) VALUES($1,$2,$3,$4,$5)',[match.id,hash(p.id),String(p.name).slice(0,20),Number(p.score)||0,i+1])}
  await connection.query('COMMIT');return true;
 }catch(e){await connection.query('ROLLBACK').catch(()=>{});console.error('FL407 storico:',e.message);return false}finally{connection.release()}
}
async function handle(req,res,accounts){
 const respond=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))};
 if(req.method!=='POST')return respond(405,{error:'Metodo non consentito'});
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return respond(403,{error:'Origine non consentita'})}catch{return respond(403,{error:'Origine non consentita'})}}
 if(!ready)return respond(503,{error:'Storico temporaneamente non disponibile'});
 let input='';try{for await(const chunk of req){input+=chunk;if(input.length>2048)return respond(413,{error:'Richiesta troppo grande'})}}catch{return respond(400,{error:'Richiesta non valida'})}
 let data;try{data=JSON.parse(input)}catch{return respond(400,{error:'Richiesta non valida'})}
 let acc;try{acc=await accounts.authenticate(data.token)}catch{return respond(503,{error:'Profilo non disponibile'})}
 if(!acc||!validId(acc.id))return respond(401,{error:'Accedi con il tuo nickname Arena'});
 try{
  const rows=await pool.query(`SELECT m.id,m.played_at,m.mode,m.category,m.question_count,m.winner,m.margin,m.first_score,m.second_score,m.player_count,
    json_agg(json_build_object('name',p.name,'score',p.score,'position',p.position) ORDER BY p.position) AS players
    FROM fl407_matches m JOIN fl407_match_players me ON me.match_id=m.id JOIN fl407_match_players p ON p.match_id=m.id
    WHERE me.player_id=$1 GROUP BY m.id ORDER BY m.played_at DESC LIMIT 50`,[hash(acc.id)]);
  return respond(200,{nickname:acc.nickname,matches:rows.rows,scope:'Arena e Ranked dalla versione 4.0.7'});
 }catch(e){console.error('FL407 history:',e.message);return respond(503,{error:'Impossibile caricare lo storico'})}
}
module.exports={init,record,handle,status:()=>({ready,error})};
