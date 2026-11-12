 'use strict';
const {Pool}=require('pg');
const crypto=require('crypto');
const configured=Boolean(process.env.DATABASE_URL);
let pool=null,ready=false,lastError=null;
const cleanName=n=>String(n||'Campione').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,20)||'Campione';
const isId=id=>typeof id==='string'&&/^[0-9a-f]{32}$/i.test(id);
const hashId=id=>crypto.createHash('sha256').update(id.toLowerCase()).digest('hex');
async function init(){
 if(!configured){console.warn('Classifiche persistenti DISABILITATE: DATABASE_URL non configurato');return false}
 try {
  pool=new Pool({connectionString:process.env.DATABASE_URL,max:4,connectionTimeoutMillis:8000,idleTimeoutMillis:30000});
  pool.on('error',e=>{ready=false;lastError=e.message;console.error('Database pool:',e.message)});
  await pool.query(`CREATE TABLE IF NOT EXISTS fl_players (
   player_id TEXT PRIMARY KEY, name VARCHAR(20) NOT NULL,
   games INTEGER NOT NULL DEFAULT 0, wins INTEGER NOT NULL DEFAULT 0,
   losses INTEGER NOT NULL DEFAULT 0, draws INTEGER NOT NULL DEFAULT 0,
   points BIGINT NOT NULL DEFAULT 0, correct_answers INTEGER NOT NULL DEFAULT 0,
   answered INTEGER NOT NULL DEFAULT 0, best_score INTEGER NOT NULL DEFAULT 0,
   updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   CONSTRAINT fl_nonnegative CHECK (games>=0 AND wins>=0 AND losses>=0 AND draws>=0)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS fl_recorded_rounds (round_id UUID PRIMARY KEY, recorded_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await pool.query('CREATE INDEX IF NOT EXISTS fl_players_rank ON fl_players(wins DESC,points DESC)');
  ready=true;lastError=null;console.log('Football Legends: database classifiche persistenti pronto');return true;
 } catch(e){ready=false;lastError=e.message;console.error('Classifiche: inizializzazione fallita:',e.message);return false}
}
function status(){return {enabled:configured,ready,error:lastError?'Database non disponibile':null}}
async function leaderboard(limit=30){
 if(!ready)return [];
 const r=await pool.query('SELECT name,games,wins,losses,draws,points,correct_answers AS correct,answered,best_score AS best FROM fl_players WHERE games>0 ORDER BY wins DESC, points DESC, games ASC LIMIT $1',[Math.max(1,Math.min(50,Number(limit)||30))]);
 return r.rows.map(x=>({...x,points:Number(x.points)}));
}
async function profile(id){if(!ready||!isId(id))return null;
 const r=await pool.query('SELECT name,games,wins,losses,draws,points,correct_answers AS correct,answered,best_score AS best FROM fl_players WHERE player_id=$1',[hashId(id)]);
 return r.rows[0]?{...r.rows[0],points:Number(r.rows[0].points)}:null;
}
async function record(roundId,players){
 if(!ready)throw Error('Database classifiche non disponibile');
 const client=await pool.connect();
 try {
  await client.query('BEGIN');
  const check=await client.query('INSERT INTO fl_recorded_rounds(round_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING round_id',[roundId]);
  if(!check.rowCount){await client.query('ROLLBACK');return false}
  const maxScore=Math.max(...players.map(x=>x.score));
  const winners=players.filter(x=>x.score===maxScore);
  for(const p of players){
   if(!isId(p.id))continue;
   const win=p.score===maxScore&&winners.length===1?1:0;
   const draw=p.score===maxScore&&winners.length>1?1:0;
   const loss=p.score<maxScore?1:0;
   await client.query(`INSERT INTO fl_players(player_id,name,games,wins,losses,draws,points,correct_answers,answered,best_score,updated_at)
    VALUES ($1,$2,1,$3,$4,$5,$6,$7,$8,$9,now())
    ON CONFLICT(player_id) DO UPDATE SET name=EXCLUDED.name,games=fl_players.games+1,
    wins=fl_players.wins+EXCLUDED.wins,losses=fl_players.losses+EXCLUDED.losses,
    draws=fl_players.draws+EXCLUDED.draws,points=fl_players.points+EXCLUDED.points,
    correct_answers=fl_players.correct_answers+EXCLUDED.correct_answers,
    answered=fl_players.answered+EXCLUDED.answered,
    best_score=GREATEST(fl_players.best_score,EXCLUDED.best_score),updated_at=now()`,
    [hashId(p.id),cleanName(p.name),win,loss,draw,p.score,p.correct||0,p.answered||0,p.score]);
  }
  await client.query('COMMIT');return true;
 }catch(e){await client.query('ROLLBACK').catch(()=>{});if(/connect|timeout|terminated/i.test(e.message))ready=false;lastError=e.message;throw e}
 finally{client.release()}
}
module.exports={init,status,record,leaderboard,profile,isId};
