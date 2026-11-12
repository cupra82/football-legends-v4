'use strict';
// Iterazione incrementale Wikidata P115 (stadio di casa), senza scraping di Wikipedia.
// Esegue poche query con timeout; salva sempre il lavoro precedente.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'), catalogFile=path.join(root,'wikidata-clubs.json'),outFile=path.join(root,'stadiums-wikidata-generated.json'),stateFile=path.join(root,'stadiums-wikidata-progress.json');
const read=(file,fallback)=>{try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return fallback}};
const save=(file,obj)=>{const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(obj,null,2)+'\n');fs.renameSync(tmp,file)};
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex').slice(0,20);
const n=s=>String(s||'').trim().replace(/\s+/g,' '),norm=s=>n(s).normalize('NFKC').toLocaleLowerCase('it');
const maxClubs=Math.min(1000,Math.max(30,Number(process.env.FL_STADIUM_CLUBS_PER_RUN||500)));
const maxMs=Math.min(300000,Math.max(30000,Number(process.env.FL_STADIUM_BUDGET_MS||160000)));
const perRequest=Math.min(25000,Math.max(4000,Number(process.env.FL_STADIUM_REQUEST_TIMEOUT_MS||12000)));
const url='https://query.wikidata.org/sparql';
const source='https://www.wikidata.org/wiki/Property:P115';
function makeQuery(ids){return `SELECT ?team ?teamLabel ?stadium ?stadiumLabel WHERE { VALUES ?team { ${ids.map(x=>'wd:'+x).join(' ')} } ?team wdt:P115 ?stadium . SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en,fr,de". } }`}
function qid(x){const m=n(x).match(/(?:^|\/)(Q\d+)$/);return m&&m[1]}
async function ask(ids){const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),perRequest);try{const u=new URL(url);u.searchParams.set('query',makeQuery(ids));const r=await fetch(u,{signal:ctl.signal,headers:{'Accept':'application/sparql-results+json','User-Agent':'FootballLegendsV4/4.4 (https://github.com/cupra82/football-legends-v4; open football quiz project)'}});if(!r.ok)throw Error('HTTP '+r.status);return (await r.json()).results.bindings}finally{clearTimeout(t)}}
function buildFromBindings(rows,clubNames,existing,seenText){
 const list=[],groups=new Map();for(const x of rows){const id=qid(x.team?.value),sId=qid(x.stadium?.value),stadium=n(x.stadiumLabel?.value),club=n(clubNames.get(id)||x.teamLabel?.value);if(!id||!sId||!stadium||!club||/^(Q\d+)$/.test(stadium)||/^(Q\d+)$/.test(club)||stadium.length>75||club.length>80)continue;if(!groups.has(id))groups.set(id,new Map());groups.get(id).set(sId,stadium)}
 const entries=[...groups].filter(([,v])=>v.size===1).map(([id,v])=>({id,club:clubNames.get(id),stadium:[...v.values()][0]})).filter(x=>x.club);
 const choices=[...new Set([...entries.map(x=>x.stadium),...existing.map(x=>x.options?.[x.answer]).filter(Boolean)])];
 for(const {id,club,stadium} of entries){const question=`Quale stadio è indicato da Wikidata come impianto di casa di ${club}?`,key='stadium-wd-'+id;
  if(seenText.has(norm(question))||choices.length<3)continue;
  const wrong=choices.filter(x=>norm(x)!==norm(stadium)).sort((a,b)=>hash(key+a).localeCompare(hash(key+b))).slice(0,2);if(wrong.length!==2)continue;
  const options=[stadium,...wrong].sort((a,b)=>hash(key+'|'+a).localeCompare(hash(key+'|'+b)));
  const item={id:key,category:'Stadi leggendari',kind:'Stadi Wikidata',difficulty:2,question,options,answer:options.indexOf(stadium),explanation:`Wikidata collega ${club} allo stadio ${stadium}.`,source:`https://www.wikidata.org/wiki/${id}`,sourceName:'Wikidata (CC0)'};
  list.push(item);seenText.add(norm(question));
 }return list;
}
async function main(){const catalog=read(catalogFile,{clubs:[]});const old=read(outFile,{questions:[]}),progress=read(stateFile,{checked:[]});let checked=new Set(progress.checked||[]);
 const clubs=(catalog.clubs||[]).map(x=>({id:qid(x.id),name:n(x.name)})).filter(x=>x.id&&x.name);
 if(!clubs.length){console.log('STADIUM WIKIDATA: catalogo club non presente. Nessuna domanda rimossa.');return}
 const existingCurated=read(path.join(root,'themed-generated.json'),{questions:[]}).questions||[];
 const already=new Set(existingCurated.filter(q=>q.kind==='Stadi e club').map(q=>(q.question.match(/associato a (.+)\?$/)||[])[1]).filter(Boolean).map(norm));
 const eligible=clubs.filter(x=>!checked.has(x.id)&&!already.has(norm(x.name))).slice(0,maxClubs);
 const names=new Map(eligible.map(x=>[x.id,x.name])),oldMap=new Map((old.questions||[]).map(x=>[x.id,x]));const seen=new Set([...existingCurated,...oldMap.values()].map(x=>norm(x.question)));const oldOptions=[...oldMap.values(),...existingCurated];
 let newQuestions=0,queries=0,failures=0,done=0;const deadline=Date.now()+maxMs;
 for(let i=0;i<eligible.length&&Date.now()+perRequest+2000<deadline;i+=30){const chunk=eligible.slice(i,i+30),ids=chunk.map(x=>x.id);
  try{const rows=await ask(ids);const additions=buildFromBindings(rows,names,oldOptions,seen);for(const a of additions)if(!oldMap.has(a.id)){oldMap.set(a.id,a);newQuestions++}ids.forEach(id=>checked.add(id));done+=ids.length;queries++;save(stateFile,{checked:[...checked],updatedAt:new Date().toISOString()});save(outFile,{stats:{newQuestions,total:oldMap.size,clubsChecked:checked.size},questions:[...oldMap.values()]});console.log(`Stadi Wikidata: ${ids.length} club controllati, +${additions.length} domande`)}catch(e){failures++;console.warn(`Stadi Wikidata: batch saltato (${e.message})`);if(/HTTP 429/.test(e.message))break}
 }
 console.log(`STADIUM WIKIDATA: ${done} club nuovi, ${newQuestions} nuove domande, ${oldMap.size} totali, ${failures} richieste fallite`);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={makeQuery,buildFromBindings};
