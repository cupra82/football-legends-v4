'use strict';
const crypto=require('crypto');
// ID verificati sulle rispettive schede Wikidata. Nessuna ricerca di nomi ambigui.
// Il catalogo dei club viene scoperto via Wikidata, senza elenco fisso delle squadre.
// Paesi usati soltanto per distribuire le richieste; nessuna esclusione per fama o categoria.
const COUNTRIES=[
 ['Q38','Italia'],['Q29','Spagna'],['Q145','Regno Unito'],['Q183','Germania'],
 ['Q142','Francia'],['Q39','Svizzera'],['Q45','Portogallo'],['Q43','Turchia'],
 ['Q55','Paesi Bassi'],['Q31','Belgio'],['Q40','Austria'],['Q35','Danimarca'],
 ['Q20','Norvegia'],['Q34','Svezia'],['Q36','Polonia'],['Q41','Grecia'],
 ['Q224','Croazia'],['Q403','Serbia'],['Q218','Romania'],['Q219','Bulgaria'],
 ['Q213','Cechia'],['Q212','Ucraina'],['Q30','Stati Uniti'],['Q155','Brasile'],
 ['Q414','Argentina'],['Q96','Messico'],['Q408','Australia'],['Q17','Giappone']
];
const CLUBS=[]; // compatibilità: non esiste più un limite di nove società.
function discoverCountriesQuery(){
 return `SELECT DISTINCT ?country ?countryLabel WHERE {
   ?country wdt:P31 wd:Q6256.
   SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
 } LIMIT 300`;
}
function discoveredCountries(bindings){
 const map=new Map(COUNTRIES.map(c=>[c[0],c[1]]));
 for(const r of bindings){
  const id=String(r.country?.value||'').split('/').pop(),name=r.countryLabel?.value;
  if(/^Q\d+$/.test(id)&&valid(name))map.set(id,name);
 }
 return [...map].map(([id,name])=>({id,name}));
}
function discoverQuery(country){
 return `SELECT DISTINCT ?club ?clubLabel WHERE {
   ?club wdt:P31 wd:Q476028; wdt:P17 wd:${country.id}.
   SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
 } ORDER BY ?club LIMIT 10000`;
}
function discoveredClubs(bindings,country){
 const result=new Map();
 for(const r of bindings){
  const id=String(r.club?.value||'').split('/').pop(),name=r.clubLabel?.value;
  if(/^Q\d+$/.test(id)&&valid(name))result.set(id,{id,name,country:country.name,category:'Calciatori nel mondo'});
 }
 return [...result.values()];
}
// Selezione equa fra paesi: ogni gruppo fornisce un candidato a turno.
// Se disponibile, il numero di sitelink Wikipedia favorisce club ben documentati.
function rankCandidates(clubs,limit=240,preferSitelinks=false){
 const groups=new Map();
 for(const c of clubs){const key=c.country||'Altro';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c)}
 for(const xs of groups.values())xs.sort((a,b)=>preferSitelinks?(Number(b.sitelinks||0)-Number(a.sitelinks||0))||a.id.localeCompare(b.id):a.id.localeCompare(b.id));
 const names=[...groups.keys()].sort(),out=[];
 while(out.length<limit){let progressed=false;for(const n of names){const c=groups.get(n).shift();if(c){out.push(c);progressed=true;if(out.length===limit)break}}if(!progressed)break}
 return out;
}
function enrichmentQuery(clubs){
 const ids=clubs.filter(c=>/^Q\d+$/.test(c.id)).map(c=>'wd:'+c.id);
 if(!ids.length)return 'SELECT ?club ?sitelinks WHERE { VALUES ?club { wd:Q1422 } OPTIONAL { ?club wikibase:sitelinks ?sitelinks. } } LIMIT 1';
 return `SELECT ?club ?sitelinks WHERE { VALUES ?club { ${ids.join(' ')} } OPTIONAL { ?club wikibase:sitelinks ?sitelinks. } }`;
}
function applySitelinks(clubs,bindings){
 const byId=new Map(clubs.map(c=>[c.id,c]));
 for(const r of bindings){const id=String(r.club?.value||'').split('/').pop();const c=byId.get(id);const v=Number(r.sitelinks?.value);if(c&&Number.isFinite(v)&&v>=0)c.sitelinks=v}
 return clubs;
}
const sha=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,16);
const norm=s=>String(s||'').normalize('NFKC').toLocaleLowerCase('it').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const valid=s=>typeof s==='string'&&s.length>=3&&s.length<=75&&!/^Q\d+$/.test(s)&&!/[<>\[\]{}]/.test(s);
const order=(a,seed)=>[...a].sort((x,y)=>sha(seed+'|'+x).localeCompare(sha(seed+'|'+y)));
function queryFor(club){
 // Solo proprietà dichiarate: un club alla volta, nessuna ricerca globale di Wikipedia.
 return `SELECT DISTINCT ?person ?personLabel ?birth ?cityLabel ?countryLabel WHERE {
 ?person wdt:P54 wd:${club.id}; wdt:P569 ?birth.
 OPTIONAL { ?person wdt:P19 ?city. }
 OPTIONAL { ?person wdt:P27 ?country. }
 SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
} LIMIT 450`;
}
function rowsFrom(d){if(!Array.isArray(d?.results?.bindings))throw Error('Risposta SPARQL malformata');return d.results.bindings}
function makeQuestions(collection){
 const persons=new Map();
 for(const {club,bindings} of collection){for(const row of bindings){
  const id=String(row.person?.value||'').split('/').pop();const name=row.personLabel?.value;
  const year=Number(String(row.birth?.value||'').slice(0,4));
  const city=row.cityLabel?.value,country=row.countryLabel?.value;
  if(!/^Q\d+$/.test(id)||!valid(name)||!/\p{L}/u.test(name)||!Number.isInteger(year)||year<1880||year>2008)continue;
  let p=persons.get(id);
  if(!p){p={id,name,year,cities:new Set(),countries:new Set(),clubs:new Map()};persons.set(id,p)}
  if(valid(city))p.cities.add(city);
  if(valid(country))p.countries.add(country);
  p.clubs.set(club.id,club);
 }}
 const people=[...persons.values()];
 const years=[...new Set(people.map(p=>p.year))];
 const cities=[...new Set(people.flatMap(p=>[...p.cities]))];
 const countries=[...new Set(people.flatMap(p=>[...p.countries]))];
 const questions=[],used=new Set();
 function add(p,club,kind,text,correct,alternatives,explanation,difficulty=2){
  const distinct=[...new Map(alternatives.map(x=>[norm(x),x])).values()].filter(x=>norm(x)!==norm(correct)&&valid(String(x)));
  if(distinct.length<2)return;
  const wrong=order(distinct,p.id+'|'+club.id+'|'+kind).slice(0,2);
  const options=order([correct,...wrong],p.id+'|'+club.id+'|'+kind+'|options');
  if(new Set(options.map(norm)).size!==3)return;
  const key=norm(text);if(used.has(key))return;used.add(key);
  questions.push({id:'wd32-'+sha(key),category:club.category,kind,difficulty,question:text,options,answer:options.findIndex(x=>norm(x)===norm(correct)),explanation,source:`https://www.wikidata.org/wiki/${p.id}`});
 }
 for(const p of people){
  // Evita di creare una copia per ciascuna squadra: ogni fatto una volta sola.
  // Se un giocatore è passato per più club, distribuire il contenuto fra le leghe.
  const clubs=order([...p.clubs.values()],p.id);
  const club=clubs[0],context=`(ex ${club.name})`,sourceText=`Secondo Wikidata, ${p.name}`;
  const nearYears=years.filter(y=>y!==p.year&&Math.abs(y-p.year)>=2&&Math.abs(y-p.year)<=15).map(String);
  // Fatti di carriera relativi a club scoperti, non soltanto a squadre famose.
  if(clubs.length){
   const owned=new Set(clubs.map(c=>norm(c.name)));
   const alternatives=order([...new Set(collection.map(x=>x.club.name))].filter(n=>!owned.has(norm(n))),p.id+'clubs');
   add(p,club,'Carriere Wikidata',`In quale squadra ha giocato ${p.name} secondo Wikidata?`,club.name,alternatives,`${p.name} risulta aver giocato nel ${club.name}.`,2);
  }
  add(p,club,'Biografie Wikidata',`In quale anno è nato ${p.name} ${context}?`,String(p.year),nearYears,`${sourceText} è nato nel ${p.year}.`);
  if(p.cities.size===1){const c=[...p.cities][0];add(p,club,'Città di nascita Wikidata',`In quale città è nato ${p.name} ${context}?`,c,cities,`${sourceText} è nato a ${c}.`,3)}
  if(p.countries.size===1){const c=[...p.countries][0];add(p,club,'Nazionalità Wikidata',`Quale cittadinanza risulta per ${p.name} ${context}?`,c,countries,`${sourceText} ha cittadinanza ${c}.`,1)}
 }
 return questions;
}
module.exports={COUNTRIES,CLUBS,rankCandidates,enrichmentQuery,applySitelinks,discoverCountriesQuery,discoveredCountries,discoverQuery,discoveredClubs,queryFor,rowsFrom,makeQuestions};
