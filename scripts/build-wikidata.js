'use strict';
const fs=require('fs'),path=require('path');
const {COUNTRIES,discoverCountriesQuery,discoveredCountries,discoverQuery,discoveredClubs,queryFor,rowsFrom,makeQuestions,rankCandidates,enrichmentQuery,applySitelinks}=require('./wikidata-bank');
const root=path.join(__dirname,'..');
const file=path.join(root,'wikidata-generated.json');
const catalogPath=path.join(root,'wikidata-clubs.json');
const cachePath=path.join(root,'wikidata-club-cache.json');
const agent='FootballLegendsBot/3.3.7 (https://github.com/cupra82/football-legends; trivia database)';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const read=(p,fallback)=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return fallback}};
const write=(p,obj)=>{const tmp=p+'.tmp';fs.writeFileSync(tmp,JSON.stringify(obj,null,2)+'\n');fs.renameSync(tmp,p)};
const REQUEST_TIMEOUT_MS=Math.max(3000,Math.min(30000,Number(process.env.FL_WIKIDATA_REQUEST_TIMEOUT_MS||12000)));
const MAX_RUNTIME_MS=Math.max(30000,Math.min(900000,Number(process.env.FL_WIKIDATA_BUDGET_MS||240000)));
const RETRY_DELAY_MS=Math.max(1000,Math.min(15000,Number(process.env.FL_WIKIDATA_RETRY_DELAY_MS||2500)));
const started=Date.now(), deadline=started+MAX_RUNTIME_MS;
const remainingMs=()=>deadline-Date.now();
const canContinue=(reserve=4000)=>remainingMs()>reserve;
const transient=e=>/HTTP (429|500|502|503|504)|AbortError|timeout/i.test(String(e?.message||e?.name||e));

async function fetchSparql(query){
 const u=new URL('https://query.wikidata.org/sparql');u.searchParams.set('query',query);u.searchParams.set('format','json');
 let last;
 for(let attempt=0;attempt<2;attempt++){
  if(!canContinue(2000))throw Error('Budget di tempo Wikidata esaurito');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),Math.min(REQUEST_TIMEOUT_MS,Math.max(1000,remainingMs()-1500)));
  try{
   const res=await fetch(u,{headers:{'User-Agent':agent,'Accept':'application/sparql-results+json'},signal:controller.signal});
   if(!res.ok)throw Error('HTTP '+res.status);
   return rowsFrom(await res.json());
  }catch(e){
   last=e;
   if(attempt===1||!transient(e)||!canContinue(RETRY_DELAY_MS+4000))break;
   console.warn(`Wikidata: richiesta fallita (${e.message}); riprovo una sola volta`);
   await pause(RETRY_DELAY_MS);
  }finally{clearTimeout(timeout)}
 }
 throw last;
}

(async()=>{
 const catalog=read(catalogPath,{countriesDone:[],countriesFailed:[],clubs:[]});
 const cache=read(cachePath,{clubs:{}});
 let dirty=0;
 const saveCache=()=>{if(dirty){write(cachePath,cache);dirty=0}};
 if(!cache.clubs||typeof cache.clubs!=='object')cache.clubs={};
 const known=new Map((catalog.clubs||[]).map(c=>[c.id,c]));
 if(!catalog.countriesCatalog?.length){
  try{catalog.countriesCatalog=discoveredCountries(await fetchSparql(discoverCountriesQuery()));}
  catch(e){console.warn(`Paesi non disponibili (${e.message}); elenco iniziale`);catalog.countriesCatalog=COUNTRIES.map(([id,name])=>({id,name}));}
 }
 const done=new Set(catalog.countriesDone||[]);
 const perRun=Math.max(1,Math.min(3,Number(process.env.FL_COUNTRIES_PER_RUN||2)));
 let attempted=0;
 for(const {id,name} of catalog.countriesCatalog){
  if(done.has(id)||attempted>=perRun||!canContinue(16000))continue;
  attempted++;
  try{
   const bindings=await fetchSparql(discoverQuery({id,name}));
   if(!bindings.length)throw Error('Risposta vuota');
   const clubs=discoveredClubs(bindings,{id,name});
   if(!clubs.length)throw Error('Nessun club verificato');
   for(const club of clubs)known.set(club.id,{...(known.get(club.id)||{}),...club});
   done.add(id);console.log(`Scoperti ${clubs.length} club in ${name}`);
  }catch(e){console.warn(`Scoperta ${name}: ${e.message}`)}
  if(canContinue(3500))await pause(800);
 }
 catalog.clubs=[...known.values()].sort((a,b)=>a.id.localeCompare(b.id));
 catalog.countriesDone=[...done];
 // Persistiamo la scoperta anche quando il servizio non consente nuovi profili.
 if(catalog.clubs.length)write(catalogPath,catalog);

 // I club gia esaminati, inclusi quelli senza profili, non vengono interrogati di nuovo.
 const remaining=catalog.clubs.filter(c=>!Object.prototype.hasOwnProperty.call(cache.clubs,c.id));
 const maxClubs=Math.max(1,Math.min(30,Number(process.env.FL_CLUBS_PER_RUN||24)));
 // Rotazione deterministica fra paesi: non privilegia per sempre il primo paese nel catalogo.
 // Misuriamo la copertura Wikipedia dei candidati piu promettenti in un'unica query SPARQL.
 const shortlist=rankCandidates(remaining,Math.max(maxClubs*12,240));
 if(canContinue(16000))try{
  const rows=await fetchSparql(enrichmentQuery(shortlist));
  applySitelinks(shortlist,rows);
  console.log(`Valutata copertura Wikidata di ${shortlist.length} club`);
 }catch(e){console.warn(`Copertura Wikidata non disponibile (${e.message}); selezione equilibrata per paese`)}
 const candidates=rankCandidates(shortlist,maxClubs,true);
 let success=0,empty=0,failures=0,produced=0;
 for(const club of candidates){
  if(!canContinue(16000)){console.warn('Budget Wikidata quasi esaurito: chiudo in modo sicuro');break;}
  try{
   const bindings=await fetchSparql(queryFor(club));
   // Registra anche 0 profili: niente richieste sprecate nei lunedi successivi.
   cache.clubs[club.id]={club,bindings,checkedAt:new Date().toISOString(),count:bindings.length};
   dirty++;success++;if(!bindings.length)empty++;else produced+=bindings.length;
   // Checkpoint dopo ogni club: gli avanzamenti non vanno persi neppure in caso di interruzione successiva.
   saveCache();
   console.log(`${club.name}: ${bindings.length} profili`);
  }catch(e){failures++;console.warn(`${club.name}: ${e.message}`);if(/HTTP 429/.test(e.message))break}
  if(canContinue(3500))await pause(800);
 }
 saveCache();
 // Non rigenerare le domande quando non sono arrivati dati nuovi.
 const previous=read(file,{questions:[]});
 if(!success){console.log(`Wikidata: nessun nuovo club processato, ${previous.questions?.length||0} domande conservate`);return}
 const collection=Object.values(cache.clubs).filter(x=>x.club&&Array.isArray(x.bindings)&&x.bindings.length);
 const questions=makeQuestions(collection);
 // Mantiene gli ID originali e le domande storiche anche se fonti esterne falliscono.
 const byId=new Map((previous.questions||[]).map(q=>[q.id,q]));
 let added=0;
 for(const q of questions){if(!byId.has(q.id))added++;byId.set(q.id,q)}
 const merged=[...byId.values()];
 write(file,{stats:{at:new Date().toISOString(),source:'Wikidata SPARQL CC0',countriesDone:done.size,catalogClubs:catalog.clubs.length,clubsProcessed:Object.keys(cache.clubs).length,newlyProcessed:success,emptyClubs:empty,failures,profilesRead:produced,newQuestions:added,count:merged.length},questions:merged});
 console.log(`Wikidata: ${catalog.clubs.length} censiti, ${success} elaborati (${empty} vuoti), ${added} nuove domande, ${merged.length} totali; tempo ${(Date.now()-started)/1000|0}s`);
})().catch(e=>{console.error(e);process.exitCode=1});
