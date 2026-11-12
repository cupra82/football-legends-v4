 'use strict';
const crypto=require('crypto');
const {Pool}=require('pg');
const configured=Boolean(process.env.DATABASE_URL);
let pool,ready=false,lastError=null;
const norm=n=>String(n||'').trim().normalize('NFKC');
function validateName(n){
 const name=norm(n);
 if(name.length<3||name.length>20||!/^[\p{L}\p{N}][\p{L}\p{N} _.-]*$/u.test(name))throw Error('Nickname: da 3 a 20 caratteri, solo lettere, numeri, spazi, _ . e -');
 return name;
}
function digest(value){return crypto.createHash('sha256').update(value).digest('hex')}
function randomToken(){return crypto.randomBytes(32).toString('hex')}
function recoveryCode(){return crypto.randomBytes(18).toString('base64url').toUpperCase()}
function recoveryDigest(code,salt){return crypto.scryptSync(code,salt,64).toString('hex')}
async function init(){
 if(!configured){lastError='DATABASE_URL non configurato';return false}
 try{
  pool=new Pool({connectionString:process.env.DATABASE_URL,max:4,connectionTimeoutMillis:8000,idleTimeoutMillis:30000});
  pool.on('error',e=>{ready=false;lastError=e.message});
  await pool.query(`CREATE TABLE IF NOT EXISTS fl_accounts (
   id CHAR(32) PRIMARY KEY,
   nickname VARCHAR(20) NOT NULL,
   nickname_key TEXT NOT NULL UNIQUE,
   token_hash CHAR(64) NOT NULL UNIQUE,
   recovery_salt CHAR(32) NOT NULL,
   recovery_hash CHAR(128) NOT NULL,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  ready=true;lastError=null;return true;
 }catch(e){ready=false;lastError=e.message;console.error('Account:',e.message);return false}
}
function status(){return {enabled:configured,ready,error:ready?null:'Database account non disponibile'}}
async function register(candidate){
 if(!ready)throw Error('Registrazione non disponibile: controlla Supabase su Render.');
 const nickname=validateName(candidate),id=crypto.randomBytes(16).toString('hex'),token=randomToken(),recovery=recoveryCode(),salt=crypto.randomBytes(16).toString('hex');
 try{await pool.query('INSERT INTO fl_accounts(id,nickname,nickname_key,token_hash,recovery_salt,recovery_hash) VALUES($1,$2,$3,$4,$5,$6)',[id,nickname,nickname.toLocaleLowerCase('und'),digest(token),salt,recoveryDigest(recovery,salt)]);}catch(e){if(e.code==='23505')throw Error('Nickname già utilizzato: scegline un altro.');throw e}
 return {id,nickname,token,recovery};
}
async function authenticate(token){if(!ready||typeof token!=='string'||!/^[0-9a-f]{64}$/i.test(token))return null;
 const r=await pool.query('SELECT id,nickname FROM fl_accounts WHERE token_hash=$1',[digest(token.toLowerCase())]);return r.rows[0]||null;
}
// Il token di sessione viene verificato direttamente dal DB. Una nuova rotazione
// sostituisce in modo atomico salt e hash del codice precedente.
async function rotateRecovery(token){
 if(!ready)throw Error('Database non disponibile. Riprova più tardi.');
 if(typeof token!=='string'||!/^[0-9a-f]{64}$/i.test(token))throw Error('Sessione non valida. Recupera il profilo.');
 const recovery=recoveryCode(),salt=crypto.randomBytes(16).toString('hex');
 const r=await pool.query(`UPDATE fl_accounts SET recovery_salt=$1, recovery_hash=$2
   WHERE token_hash=$3 RETURNING id,nickname`,
   [salt,recoveryDigest(recovery,salt),digest(token.toLowerCase())]);
 if(!r.rowCount)throw Error('Sessione non valida. Recupera il profilo.');
 return {id:r.rows[0].id,nickname:r.rows[0].nickname,recovery};
}
async function recover(candidate,code){
 if(!ready)throw Error('Recupero non disponibile.');
 const nickname=validateName(candidate),r=await pool.query('SELECT * FROM fl_accounts WHERE nickname_key=$1',[nickname.toLocaleLowerCase('und')]);
 if(!r.rowCount)throw Error('Nickname o codice di recupero non validi.');
 const user=r.rows[0],provided=String(code||'').trim().toUpperCase();
 if(!/^[A-Z0-9_-]{24}$/.test(provided))throw Error('Nickname o codice di recupero non validi.');
 const actual=Buffer.from(recoveryDigest(provided,user.recovery_salt),'hex'),expected=Buffer.from(user.recovery_hash,'hex');
 if(!crypto.timingSafeEqual(actual,expected))throw Error('Nickname o codice di recupero non validi.');
 const token=randomToken();await pool.query('UPDATE fl_accounts SET token_hash=$1 WHERE id=$2',[digest(token),user.id]);
 return {id:user.id,nickname:user.nickname,token};
}
module.exports={init,status,register,authenticate,recover,rotateRecovery};
