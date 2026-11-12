'use strict';
const fs=require('fs'),path=require('path');
const {parsePeople,build}=require('../people-bank');
const URL=process.env.PEOPLE_DATA_URL||'https://raw.githubusercontent.com/withqwerty/reep/main/data/people.csv';
(async()=>{
 let text;
 if(process.env.PEOPLE_CSV_FILE){text=fs.readFileSync(process.env.PEOPLE_CSV_FILE,'utf8')}
 else{const ctrl=new AbortController();const stop=setTimeout(()=>ctrl.abort(),120000);try{const r=await fetch(URL,{signal:ctrl.signal,headers:{'User-Agent':'FootballLegends/1.3'}});if(!r.ok)throw Error(`Scaricamento persone HTTP ${r.status}: ${URL}`);text=await r.text()}finally{clearTimeout(stop)}}
 const profiles=parsePeople(text);const data=build(profiles,{max:18000});
 const min=Number(process.env.MIN_PEOPLE_QUESTIONS||2000);
 if(data.questions.length<min)throw Error(`Troppo poche domande su persone: ${data.questions.length} (minimo ${min}). File esistente preservato.`);
 const dest=path.join(__dirname,'..','people-generated.json');fs.writeFileSync(dest,JSON.stringify(data));
 console.log(JSON.stringify({result:'OK',profiles:profiles.length,questions:data.questions.length,byCategory:data.stats.byCategory,byKind:data.stats.byKind}));
})().catch(e=>{console.error(e.message);process.exitCode=1});
