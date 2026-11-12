#!/usr/bin/env node
'use strict';
/* V4 independent archive snapshot. Download publicly published JSON datasets once into V4 itself.
   This uses no production DB credentials and never writes to production repository. */
const fs=require('fs'),path=require('path'),https=require('https');
const base='https://raw.githubusercontent.com/cupra82/football-legends/main/';
const names=['questions-generated.json','people-generated.json','wikidata-generated.json'];
const shouldRefresh=process.argv.includes('--refresh');
const fatal=[];
function fetchFile(url,maxBytes=28*1024*1024){return new Promise((resolve,reject)=>{
 const r=https.get(url,{headers:{'User-Agent':'FootballLegendsV4Snapshot/1.0','Accept':'application/json'},timeout:25000},res=>{
  if(res.statusCode!==200){res.resume();return reject(new Error('HTTP '+res.statusCode))}
  const chunks=[];let size=0;
  res.on('data',b=>{size+=b.length;if(size>maxBytes){res.destroy(new Error('File exceeds 28 MB'))}else chunks.push(b)});
  res.on('end',()=>resolve(Buffer.concat(chunks)));
 });r.on('timeout',()=>r.destroy(new Error('timeout')));r.on('error',reject)
})}
async function main(){for(const name of names){const output=path.join(__dirname,'..',name);
 if(fs.existsSync(output)&&!shouldRefresh){console.log(name+': già presente, mantenuto');continue}
 try{const data=await fetchFile(base+name);const parsed=JSON.parse(data.toString('utf8'));if(!Array.isArray(parsed.questions))throw Error('questions[] mancante');
 const good=parsed.questions.filter(q=>q&&typeof q.question==='string'&&q.question.trim()&&Array.isArray(q.options)&&q.options.length===3&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=2);
 if(good.length<100){throw Error('Archivio troppo piccolo: '+good.length)}
 const unique=new Set(good.map(q=>q.question.trim().toLocaleLowerCase()));if(unique.size<100)throw Error('Pochi quesiti distinti');
 // Keep original format and metadata; the game applies additional filters at runtime.
 const temp=output+'.tmp';fs.writeFileSync(temp,data);fs.renameSync(temp,output);
 console.log(name+': importate '+good.length+' domande, '+unique.size+' testi distinti, '+(data.length/1048576).toFixed(1)+' MB');
 }catch(err){console.error(name+': '+err.message);fatal.push(name)}
 }
 if(fatal.length){console.error('Importazione incompleta: '+fatal.join(', '));process.exitCode=1}else console.log('Archivio V4 indipendente pronto.')}
main();
