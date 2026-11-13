'use strict';
/** Football Legends 4.1.0 - expanded football facts, preserving older archives.
 * Sources: Wikidata (CC0), OpenFootball/clubs (CC0).
 * Truthful counts: only confirmed usable, deduplicated records are published.
 */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');
const read=(n,d)=>{try{return JSON.parse(fs.readFileSync(path.join(ROOT,n),'utf8'))}catch{return d}};
const put=(n,o)=>{const f=path.join(ROOT,n),tmp=f+'.tmp';fs.writeFileSync(tmp,JSON.stringify(o,null,2)+'\n');fs.renameSync(tmp,f)};
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const norm=s=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex').slice(0,18);
const id=x=>((String(x||'').match(/Q\d+$/)||[])[0]);
const uniq=a=>[...new Set(a)];
const major=/real madrid|barcelona|barcellona|atletico madrid|athletic bilbao|sevilla|valencia|villarreal|juventus|internazionale|inter milan|inter |ac milan|milan|napoli|roma|lazio|atalanta|fiorentina|torino|bologna|manchester|liverpool|arsenal|chelsea|tottenham|newcastle|aston villa|nottingham forest|everton|leicester|bayern|borussia dortmund|bayer leverkusen|schalke|werder bremen|eintracht frankfurt|paris saint|saint germain|psg|marseille|lyon|monaco|lille|ajax|psv|feyenoord|porto|benfica|sporting|braga|celtic|rangers|galatasaray|fenerbah|besiktas|boca juniors|river plate|flamengo|palmeiras|santos|sao paulo|corinthians|fluminense|gremio|internacional|racing club|independiente|penarol|nacional|al hilal|al nassr|inter miami|la galaxy|los angeles|club america|cruz azul|tigres|monterrey|basel|basilea|young boys|grasshopper|servette|lugano/i;
const famous=read('famous-index.json',{counts:{}}).counts||{};
function candidate(name){return major.test(norm(name));}
function question({key,category,kind,difficulty=2,text,answer,wrong,explanation,source}){
 if(!text||!answer||wrong.length<2)return null;
 const choices=uniq([answer,...wrong].filter(Boolean));if(choices.length!==3)return null;
 choices.sort((a,b)=>hash(key+'|'+a).localeCompare(hash(key+'|'+b)));
 return {id:'v410-'+hash(key),category,kind,difficulty,question:text,options:choices,answer:choices.indexOf(answer),explanation,source,sourceName:source?.includes('wikidata')?'Wikidata CC0':'OpenFootball Clubs CC0'};
}
function buildCareers(cache){const players=new Map(),clubNames=new Map();
 for(const [clubId,c] of Object.entries(cache.clubs||{})){
  const club=clean(c.club?.name);if(!club||!id(clubId))continue;clubNames.set(clubId,club);
  for(const r of c.bindings||[]){const personId=id(r.person?.value),name=clean(r.personLabel?.value);if(!personId||!name||/^Q\d+$/.test(name))continue;
   let p=players.get(personId);if(!p){p={name,id:personId,clubs:new Set()};players.set(personId,p)}p.clubs.add(clubId);
  }
 }
 const out=[];
 for(const p of players.values()){
  const clubs=[...p.clubs].filter(c=>clubNames.has(c)).map(c=>({id:c,name:clubNames.get(c)}));
  if(clubs.length<2||Number(famous[p.id]||0)<20)continue; // notorietà verificata con copertura internazionale
  // Positive pairs only; a distractor is checked against the complete *available* person->club cache.
  // Limit to two distinct facts for a star, avoiding hundreds of near-identical questions.
  const good=clubs.filter(c=>candidate(c.name));if(good.length<2)continue;
  const others=[...clubNames.entries()].filter(([c,n])=>!p.clubs.has(c)&&candidate(n)).map(([c,n])=>({id:c,name:n}));
  if(others.length<4)continue;
  good.sort((a,b)=>hash(p.id+a.id).localeCompare(hash(p.id+b.id)));
  others.sort((a,b)=>hash(p.id+a.id).localeCompare(hash(p.id+b.id)));
  for(let i=0;i<Math.min(2,Math.floor(good.length/2));i++){
   const a=good[2*i],b=good[2*i+1];if(!b)break;
   const yes=[a.name,b.name].sort().join(' e ');
   const w1=[others[0].name,others[1].name].sort().join(' e '),w2=[others[2].name,others[3].name].sort().join(' e ');
   const q=question({key:`career-${p.id}-${a.id}-${b.id}`,category:'Leggende del calcio',kind:'Carriere di grandi protagonisti',text:`Quale coppia di club compare nella carriera di ${p.name} secondo Wikidata?`,answer:yes,wrong:[w1,w2],explanation:`Le schede Wikidata associano ${p.name} sia a ${a.name} sia a ${b.name}.`,source:`https://www.wikidata.org/wiki/${p.id}`});
   // One variant per person: the user's key criticism is repetitive trivia.
   if(q){out.push(q);break}
  }
 }
 return out;
}
function parseClubs(text,origin){const out=[];for(const line of text.split(/\r?\n/)){
 const s=line.trim();if(!s||s.startsWith('#')||s.startsWith('|')||s.startsWith('=')||s.startsWith('//'))continue;
 const m=s.match(/^([^,|]{3,85}),\s*(\d{4})?\s*,?\s*@\s*([^,|]{4,85})(?:,\s*([^,|]{2,75}))?/);
 if(!m)continue;const club=clean(m[1]),year=m[2]?Number(m[2]):null,stadium=clean(m[3]),city=clean(m[4]);
 if(!candidate(club)||/\b(former|previous)\b/i.test(stadium)||/^(none|unknown|n\/a)/i.test(stadium))continue;
 out.push({club,year,stadium,city,origin});
 }return out;
}
function fromClubRecords(records){const byClub=new Map();for(const r of records){const k=norm(r.club);if(!byClub.has(k))byClub.set(k,r)}const all=[...byClub.values()];
 const out=[];const stadiums=uniq(all.map(r=>r.stadium));const years=uniq(all.map(r=>r.year).filter(y=>y>=1850&&y<=2026));
 for(const r of all){const key=norm(r.club);const wrongStadium=stadiums.filter(s=>norm(s)!==norm(r.stadium)).sort((a,b)=>hash(key+a).localeCompare(hash(key+b))).slice(0,2);
  // The source is explicitly named in the question because this may be a historical venue.
  const st=question({key:'stadium-'+key,category:'Stadi leggendari',kind:'Stadi e grandi club',text:`Quale stadio è associato a ${r.club} nell'archivio OpenFootball Clubs?`,answer:r.stadium,wrong:wrongStadium,explanation:`L'archivio OpenFootball Clubs riporta ${r.stadium} per ${r.club}. Il nome può riferirsi allo stadio storico del club.`,source:r.origin});if(st)out.push(st);
  if(r.year>=1850&&r.year<=2026&&years.length>=3){const w=years.filter(y=>y!==r.year&&Math.abs(y-r.year)>=3).sort((a,b)=>hash(key+a).localeCompare(hash(key+b))).slice(0,2).map(String);
   const y=question({key:'founded-'+key,category:'Grandi club',kind:'Fondazione grandi club',text:`Secondo l'archivio OpenFootball Clubs, in quale anno fu fondato ${r.club}?`,answer:String(r.year),wrong:w,explanation:`OpenFootball Clubs indica il ${r.year} come anno di fondazione di ${r.club}.`,source:r.origin});if(y)out.push(y);
  }
 }
 return out;
}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function remote(url,ms=10000){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),ms);try{const r=await fetch(url,{signal:ac.signal,headers:{'User-Agent':'FootballLegends-v4.1.0 (educational football trivia; GitHub cuppa82)','Accept':'application/json, text/plain'}});if(!r.ok)throw Error(`HTTP ${r.status}`);return r}finally{clearTimeout(t)}}
async function fetchClubRecords(){
 const budget=Math.max(30000,Math.min(240000,Number(process.env.FL_V410_SOURCE_BUDGET_MS||145000))),until=Date.now()+budget;
 const old=read('v410-clubs-cache.json',{records:[],done:[]});const done=new Set(old.done),map=new Map((old.records||[]).map(x=>[x.origin+'|'+x.club,x]));
 try{
  const index=await (await remote('https://api.github.com/repos/openfootball/clubs/git/trees/master?recursive=1')).json();
  const files=(index.tree||[]).map(x=>x.path).filter(p=>/^(europe|south-america|north-america|africa|asia|0-world)\//.test(p)&&/\.txt$/i.test(p)&&!done.has(p)).sort((a,b)=>{const priority=p=>p.startsWith('europe/')?0:p.startsWith('south-america/')?1:p.startsWith('0-world/')?2:p.startsWith('north-america/')?3:p.startsWith('asia/')?4:5;return priority(a)-priority(b)||a.localeCompare(b)});
  // Only the most relevant club catalogs, not thousands of arbitrary local competitions.
  const limit=Math.min(180,Math.max(10,Number(process.env.FL_V410_CLUB_FILES||100)));
  let processed=0,failed=0;
  for(const p of files.slice(0,limit)){
   if(Date.now()+14000>until)break;
   try{const url=`https://raw.githubusercontent.com/openfootball/clubs/master/${p}`;const body=await (await remote(url,9500)).text();for(const r of parseClubs(body,url))map.set(r.origin+'|'+r.club,r);done.add(p);processed++;}
   catch(e){failed++;console.log('Club source skipped:',p,e.message)}
   if(processed%10===0)put('v410-clubs-cache.json',{records:[...map.values()],done:[...done]});
  }
  console.log(`OpenFootball Clubs: ${processed} nuovi file, ${map.size} record importanti, ${failed} errori`);
 }catch(e){console.warn('OpenFootball clubs non disponibile:',e.message,'=> cache precedente conservata')}
 put('v410-clubs-cache.json',{records:[...map.values()],done:[...done]});return [...map.values()];
}
async function buildCoaches(catalog){const old=read('v410-coaches-cache.json',{facts:[],checked:[]});const checked=new Set(old.checked),facts=new Map((old.facts||[]).map(x=>[x.clubId+'|'+x.coachId,x]));
 const clubs=(catalog.clubs||[]).filter(x=>id(x.id)&&candidate(x.name)).filter(x=>!checked.has(x.id)).slice(0,Math.max(20,Math.min(300,Number(process.env.FL_V410_COACH_CLUBS||160))));
 const endpoint='https://query.wikidata.org/sparql';let queries=0,failures=0;
 for(let i=0;i<clubs.length;i+=18){const batch=clubs.slice(i,i+18);const query=`SELECT ?club ?coach ?coachLabel WHERE { VALUES ?club { ${batch.map(c=>'wd:'+c.id).join(' ')} } ?club wdt:P286 ?coach . SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en,fr,de". } }`;const u=new URL(endpoint);u.searchParams.set('query',query);
  try{const response=await remote(u,12000);const rows=(await response.json()).results.bindings;
   for(const r of rows){const c=id(r.club?.value),p=id(r.coach?.value),label=clean(r.coachLabel?.value);const item=batch.find(x=>x.id===c);if(item&&p&&label&&!/^Q\d+$/.test(label))facts.set(c+'|'+p,{clubId:c,club:clean(item.name),coachId:p,coach:label});}
   batch.forEach(c=>checked.add(c.id));queries++;
  }catch(e){failures++;console.warn('Wikidata manager batch:',e.message);if(/429/.test(e.message))break}
  put('v410-coaches-cache.json',{facts:[...facts.values()],checked:[...checked]});if(i+18<clubs.length)await pause(700);
 }
 console.log(`Wikidata coach: ${queries} batch, ${facts.size} fatti, ${failures} errori`);
 return [...facts.values()];
}
function fromCoachFacts(facts){const byClub=new Map(),coaches=new Map();for(const f of facts){if(!byClub.has(f.clubId))byClub.set(f.clubId,new Set());byClub.get(f.clubId).add(f.coachId);coaches.set(f.coachId,f.coach)}
 const pool=[...coaches].map(([id,name])=>({id,name}));const out=[];
 for(const f of facts){if(byClub.get(f.clubId)?.size!==1)continue;const distractors=pool.filter(c=>c.id!==f.coachId&&!byClub.get(f.clubId).has(c.id)).sort((a,b)=>hash(f.clubId+a.id).localeCompare(hash(f.clubId+b.id))).slice(0,2).map(c=>c.name);
  const q=question({key:'manager-'+f.clubId,category:'Allenatori e tecnici',kind:'Allenatori grandi squadre',text:`Quale tecnico è registrato come allenatore di ${f.club} nella scheda Wikidata consultata?`,answer:f.coach,wrong:distractors,explanation:`Wikidata associa ${f.coach} a ${f.club} attraverso la proprietà P286.`,source:`https://www.wikidata.org/wiki/${f.clubId}`});if(q)out.push(q);
 }
 return out;
}
async function main(){const old=read('world-v410-generated.json',{questions:[]}),before=old.questions||[],map=new Map(before.map(q=>[q.id,q]));
 const otherFiles=['questions.json','people-questions.json','classics-questions.json','official-questions.json','history-expansion.json','deep-history.json','themed-generated.json','famous-careers-generated.json','stadiums-wikidata-generated.json','wikidata-generated.json'];
 const existingTexts=new Set();for(const name of otherFiles){const data=read(name,[]),rows=Array.isArray(data)?data:(data.questions||[]);for(const row of rows)if(row.question)existingTexts.add(norm(row.question))}
 const usedTexts=new Set([...existingTexts,...map.values()].map(x=>typeof x==='string'?x:norm(x.question)));
 const add=(list)=>{let n=0;for(const q of list){if(!q||map.has(q.id)||usedTexts.has(norm(q.question)))continue;map.set(q.id,q);usedTexts.add(norm(q.question));n++}return n};
 const careers=add(buildCareers(read('wikidata-club-cache.json',{clubs:{}})));
 const clubs=add(fromClubRecords(await fetchClubRecords()));
 const managers=add(fromCoachFacts(await buildCoaches(read('wikidata-clubs.json',{clubs:[]}))));
 const questions=[...map.values()];const categories={};for(const q of questions)categories[q.category]=(categories[q.category]||0)+1;
 const stats={generatedAt:new Date().toISOString(),added:{careers,clubs,managers,total:careers+clubs+managers},total:questions.length,categories,sources:['Wikidata P54','Wikidata P286','openfootball/clubs (CC0)']};
 if(stats.added.total||!fs.existsSync(path.join(ROOT,'world-v410-generated.json')))put('world-v410-generated.json',{stats,questions});console.log('WORLD 4.1.0:',JSON.stringify(stats));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={parseClubs,fromClubRecords,buildCareers,fromCoachFacts};
