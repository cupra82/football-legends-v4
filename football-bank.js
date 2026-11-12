'use strict';
// Football Legends v0.4. Fonti CC0 OpenFootball football.json e worldcup.json.
// Domande determinate unicamente da risultati e registrazioni osservate, non stimate.
const crypto=require('crypto');
const LEAGUES=[
  ['en.1','Premier League'],['es.1','La Liga'],['it.1','Serie A'],
  ['tr.1','Süper Lig turca'],['de.1','Bundesliga'],['fr.1','Ligue 1'],
  ['en.2','Championship inglese'],['es.2','Segunda División'],
  ['pt.1','Primeira Liga portoghese'],['nl.1','Eredivisie olandese'],
  ['be.1','Campionato belga'],['sc.1','Premiership scozzese'],
  ['gr.1','Super League greca'],['at.1','Bundesliga austriaca'],
  ['de.2','2. Bundesliga tedesca'],['it.2','Serie B italiana'],
  ['fr.2','Ligue 2 francese'],['en.3','League One inglese']
];
const WORLD_YEARS=[1930,1934,1938,1950,1954,1958,1962,1966,1970,1974,1978,1982,1986,1990,1994,1998,2002,2006,2010,2014,2018,2022,2026];
const LEAGUE_ROOT='https://raw.githubusercontent.com/openfootball/football.json/master';
const WC_ROOT='https://raw.githubusercontent.com/openfootball/worldcup.json/master';
// Archivi svizzeri CC0 controllati nell'indice pubblico OpenFootball Europe.
// La disponibilità non implica che siano aggiornati alla stagione 2026/27.
const SWISS_ROOT='https://openfootball.github.io/europe';
const SWISS_SEASONS=['2014-15','2018-19','2019-20','2020-21','2023-24','2024-25'];
const SWISS_CATEGORY='Campionato svizzero';
const SWISS_CHALLENGE_CATEGORY='Challenge League svizzera';
const SWISS_CUP_CATEGORY='Coppa Svizzera';
const SWISS_EXTRA_FILES=[
 ['2019-20','ch2',SWISS_CHALLENGE_CATEGORY],
 ['2020-21','ch2',SWISS_CHALLENGE_CATEGORY],
 ['2023-24','ch2',SWISS_CHALLENGE_CATEGORY],
 ['2024-25','ch2',SWISS_CHALLENGE_CATEGORY],
 ['2023-24','chcup',SWISS_CUP_CATEGORY],
 ['2024-25','chcup',SWISS_CUP_CATEGORY]
];
const TODAY=()=>new Date().toISOString().slice(0,10);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const seed=s=>parseInt(hash(s).slice(0,8),16);
function shuffleDet(a,key){a=[...a];let state=seed(key)||1;for(let i=a.length-1;i>0;i--){state^=state<<13;state^=state>>>17;state^=state<<5;let j=(state>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function validScore(s){return Array.isArray(s)&&s.length===2&&s.every(x=>Number.isInteger(x)&&x>=0&&x<=25)}
function ft(m){if(validScore(m?.score?.ft))return m.score.ft;if(validScore(m?.score))return m.score;return null}
function dateIt(s){const a=s.split('-');return `${a[2]}/${a[1]}/${a[0]}`}
function numberChoices(n,s){let choices=[String(n)];for(const v of [n+1,Math.max(0,n-1),n+2,Math.max(0,n-2),n+3])if(!choices.includes(String(v)))choices.push(String(v));return shuffleDet(choices.slice(0,3),s)}
function q(id,category,kind,difficulty,question,options,answer,explanation,source){if(!Array.isArray(options)||options.length!==3||new Set(options).size!==3||options.indexOf(answer)<0)return null;return {id:'fl-'+hash(id).slice(0,18),category,kind,difficulty,question,options,answer:options.indexOf(answer),explanation,source}}
function info(m){if(!m||typeof m!=='object'||typeof m.team1!=='string'||typeof m.team2!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(m.date||'')||m.date>TODAY())return null;const score=ft(m);if(!score)return null;const home=m.team1.trim(),away=m.team2.trim();if(!home||!away||home===away)return null;return {home,away,h:score[0],a:score[1],ht:validScore(m.score?.ht)?m.score.ht:null,date:m.date}}
function fromMatch(m,season,category,source,kindGroup='club'){
 const x=info(m);if(!x)return [];
 const {home,away,h,a,ht,date}=x,identity=`${category}|${season}|${date}|${home}|${away}`,ctx=`${category}, stagione ${season}, ${dateIt(date)}`,ex=`${home} ${h}–${a} ${away} (${dateIt(date)}). Fonte: OpenFootball.`,out=[];
 const add=(suffix,kind,difficulty,question,options,answer,explanation=ex)=>{const item=q(identity+'|'+suffix,category,kind,difficulty,question,options,answer,explanation,source);if(item)out.push(item)};
 const outcome=h>a?home:h<a?away:'Pareggio';
 add('esito','Esito della partita',2,`Come terminò ${home} – ${away} (${ctx})?`,shuffleDet([home,away,'Pareggio'],identity+'win'),outcome);
 add('punteggio','Risultato esatto',3,`Quale fu il risultato finale di ${home} – ${away} (${ctx})?`,shuffleDet([`${h}–${a}`,`${a}–${h}`,`${h+1}–${a+1}`].filter((v,i,arr)=>arr.indexOf(v)===i).length===3?[`${h}–${a}`,`${a}–${h}`,`${h+1}–${a+1}`]:[`${h}–${a}`,`${h+1}–${a}`,`${h}–${a+1}`],identity+'score'),`${h}–${a}`);
 add('goltot','Gol totali',2,`Quanti gol furono segnati complessivamente in ${home} – ${away} (${ctx})?`,numberChoices(h+a,identity+'total'),String(h+a));
 add('golcasa','Gol della squadra di casa',2,`Quanti gol segnò ${home} contro ${away} in ${ctx}?`,numberChoices(h,identity+'home'),String(h));
 add('golospiti','Gol della squadra ospite',2,`Quanti gol segnò ${away} in trasferta contro ${home} in ${ctx}?`,numberChoices(a,identity+'away'),String(a));
 add('goalboth','Squadre a segno',2,`Quante delle due squadre segnarono almeno un gol in ${home} – ${away} (${ctx})?`,shuffleDet(['0','1','2'],identity+'both'),String(Number(h>0)+Number(a>0)));
 if(ht){const [hh,ha]=ht;const inter=hh>ha?home:hh<ha?away:'Pareggio';add('ht','Risultato all’intervallo',3,`Chi era in vantaggio all’intervallo di ${home} – ${away} (${ctx})?`,shuffleDet([home,away,'Pareggio'],identity+'ht'),inter,`All’intervallo: ${home} ${hh}–${ha} ${away}. ${ex}`)}
 return out;
}
function fromSeason(matches,season,category,source){
 // Dati aggregati su incontri effettivamente registrati e conclusi. Non chiamarli classifiche ufficiali.
 const records=new Map();let counted=0;
 for(const m of matches){const x=info(m);if(!x)continue;counted++;for(const team of [x.home,x.away])if(!records.has(team))records.set(team,{played:0,w:0,d:0,l:0,gf:0,ga:0,homeW:0,awayW:0});const one=records.get(x.home),two=records.get(x.away);one.played++;two.played++;one.gf+=x.h;one.ga+=x.a;two.gf+=x.a;two.ga+=x.h;if(x.h>x.a){one.w++;one.homeW++;two.l++}else if(x.h<x.a){two.w++;two.awayW++;one.l++}else{one.d++;two.d++}}
 if(counted<80)return [];
 const out=[];const names=[...records.keys()];
 for(const [team,r] of records){if(r.played<8)continue;let id=`${category}|${season}|${team}|aggregate`;const context=`nelle ${r.played} partite registrate di ${team} in ${category} ${season}`;
 const explain=`Dalle partite concluse disponibili nell'archivio OpenFootball: ${team} ha ${r.w} vittorie, ${r.d} pareggi, ${r.l} sconfitte e ${r.gf} gol segnati in ${r.played} incontri. Non è la classifica ufficiale.`;
 for(const [kind,n,stem] of [
 ['Vittorie stagionali',r.w,`Quante vittorie ottenne ${team} ${context}?`],
 ['Pareggi stagionali',r.d,`Quanti pareggi ottenne ${team} ${context}?`],
 ['Reti stagionali',r.gf,`Quante reti segnò ${team} ${context}?`],
 ['Vittorie interne',r.homeW,`Quante vittorie casalinghe ottenne ${team} ${context}?`],
 ['Vittorie esterne',r.awayW,`Quante vittorie in trasferta ottenne ${team} ${context}?`]
 ]){const item=q(id+'|'+kind,category,kind,3,stem,numberChoices(n,id+kind),String(n),explain,source);if(item)out.push(item)}
 }
 // Una statistica di club deterministica: massimo numero di vittorie nel campione di partite rilevato.
 if(names.length>=8){const sorted=[...records.entries()].sort((a,b)=>b[1].w-a[1].w);if(sorted[0][1].w>sorted[1][1].w){let good=sorted[0][0];let distract=sorted.slice(1).filter((v,i,arr)=>v[1].w!==sorted[0][1].w).slice(0,2).map(v=>v[0]);if(distract.length===2){let item=q(`${category}|${season}|mostwins`,category,'Statistiche club',3,`Quale squadra registrò più vittorie tra gli incontri disponibili di ${category} ${season}?`,shuffleDet([good,...distract],category+season),good,`Risultato calcolato sui ${counted} incontri conclusi presenti nel dataset, non su eventuali incontri mancanti.`,source);if(item)out.push(item)}}}
 return out;
}
// v1.4: Quiz di almanacco su campionati COMPLETATI. Nessun punteggio di
// partite casuali, nessun dato parziale presentato come classifica ufficiale.
// v2.2: domande verificate sulle classifiche COMPLETATE, mai risultati casuali.
function fromCompleteStandings(matches,season,category,source){
 const played=matches.map(info).filter(Boolean),fixtures=new Set(),teams=new Map();
 for(const m of played){
  const key=m.home+'|'+m.away;if(fixtures.has(key))return [];fixtures.add(key);
  for(const n of [m.home,m.away])if(!teams.has(n))teams.set(n,{name:n,played:0,points:0,w:0,d:0,l:0,gf:0,ga:0,hw:0,aw:0});
  const h=teams.get(m.home),a=teams.get(m.away);h.played++;a.played++;h.gf+=m.h;h.ga+=m.a;a.gf+=m.a;a.ga+=m.h;
  if(m.h>m.a){h.points+=3;h.w++;h.hw++;a.l++}else if(m.h<m.a){a.points+=3;a.w++;a.aw++;h.l++}else{h.points++;a.points++;h.d++;a.d++}
 }
 const n=teams.size;if(n<10||n>24||played.length!==n*(n-1)||[...teams.values()].some(t=>t.played!==2*(n-1)))return [];
 const table=[...teams.values()].sort((a,b)=>b.points-a.points||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
 const out=[],used=new Set(),ctx=category+' '+season;
 function push(key,kind,stem,correct,distractors,difficulty=2){
  const wrong=[...new Set(distractors)].filter(x=>x!==correct);
  if(wrong.length<2||used.has(stem))return;
  const opts=shuffleDet([correct,...wrong.slice(0,2)],ctx+'|'+key);
  const it=q('almanac|'+ctx+'|'+key,category,kind,difficulty,stem,opts,correct,
   'Risposta: '+correct+'. Informazione ricavata dalla classifica completa di '+category+' '+season+' (fonte OpenFootball); non da una singola partita.',source);
  if(it){out.push(it);used.add(stem)}
 }
 // I piazzamenti sono pubblicati soltanto se i PUNTI distinguono chiaramente la posizione.
 const uniqueRank=i=>(i===0||table[i-1].points>table[i].points)&&(i===n-1||table[i].points>table[i+1].points);
 if(uniqueRank(0))push('champion','Campioni e classifiche','Chi vinse '+ctx+'?',table[0].name,table.slice(2).map(x=>x.name),1);
 for(const i of [1,2,3,n-1])if(uniqueRank(i))push('rank'+i,'Podio del campionato','Quale club terminò '+(i===n-1?'ultimo':i===1?'secondo':i===2?'terzo':'quarto')+' in '+ctx+'?',table[i].name,table.filter((_,j)=>j!==i).slice(0,6).map(x=>x.name));
 // Confronti tre squadre della STESSA stagione, usando separazioni nette di punti.
 for(let i=0;i<Math.min(n,12);i++){
  const higher=table.slice(0,i).filter(x=>x.points>table[i].points);
  const lower=table.slice(i+1).filter(x=>x.points<table[i].points);
  if(lower.length>=2){const opponents=shuffleDet(lower,ctx+'lower'+i).slice(0,2).map(x=>x.name);
   push('above'+i,'Confronti tra club','In '+ctx+', quale di questi club terminò più in alto?',table[i].name,opponents,i<4?1:2)}
  if(higher.length>=2){const opponents=shuffleDet(higher,ctx+'higher'+i).slice(0,2).map(x=>x.name);
   push('below'+i,'Confronti tra club','In '+ctx+', quale di questi club terminò più in basso?',table[i].name,opponents,2)}
 }
 // Record di stagione, unici, controllati sui dati completi.
 for(const [metric,word,kind] of [['w','più vittorie','Record del campionato'],['gf','più gol nel torneo','Record del campionato'],['ga','meno reti subite','Record del campionato'],['hw','più vittorie casalinghe','Record del campionato'],['aw','più vittorie esterne','Record del campionato']]){
  const descending=metric!=='ga';const ranked=[...table].sort((a,b)=>descending?b[metric]-a[metric]:a[metric]-b[metric]);
  if(ranked[0][metric]===ranked[1][metric])continue;
  const competitors=ranked.slice(1).filter(x=>x[metric]!==ranked[0][metric]);
  if(competitors.length>=2)push('record-'+metric,kind,'Quale squadra registrò '+word+' in '+ctx+'?',ranked[0].name,shuffleDet(competitors,ctx+metric).slice(0,2).map(x=>x.name),2)
 }
 return out;
}

function fromWorldCup(data,year,url){
 const matches=Array.isArray(data?.matches)?data.matches:[],category='Mondiali storici',out=[];
 const scorers=new Set();for(const m of matches)for(const goals of [m.goals1,m.goals2])if(Array.isArray(goals))for(const g of goals)if(g?.name&&typeof g.name==='string'&&!g.own_goal&&!g.ownGoal)scorers.add(g.name.trim());
 const scorersArr=[...scorers];
 for(const m of matches){const x=info(m);if(!x)continue;out.push(...fromMatch(m,String(year),category,url,'worldcup'));
  if(typeof m.ground==='string'&&m.ground.trim()){const ground=m.ground.trim();const options=['Altra sede','Stadio non registrato',ground]; // venue decoys better only when multiple venues from same tournament
   const grounds=[...new Set(matches.map(z=>z.ground).filter(z=>typeof z==='string'&&z.trim()))].filter(z=>z!==ground);
   if(grounds.length>=2){const ds=shuffleDet(grounds,`${year}|${x.home}|${x.away}|venue`).slice(0,2);let item=q(`wc|${year}|${x.date}|${x.home}|${x.away}|venue`,category,'Stadi dei Mondiali',3,`In quale stadio si giocò ${x.home} – ${x.away} al Mondiale ${year} (${dateIt(x.date)})?`,shuffleDet([ground,...ds],`${year}|venue|${x.date}`),ground,`Sede registrata: ${ground}. Fonte: OpenFootball World Cup.`,url);if(item)out.push(item)}
  }
  for(const [goals,team] of [[m.goals1,x.home],[m.goals2,x.away]]){if(!Array.isArray(goals))continue;const names=[...new Set(goals.filter(g=>g&&typeof g.name==='string'&&!g.own_goal&&!g.ownGoal).map(g=>g.name.trim()).filter(Boolean))];if(!names.length||scorersArr.length<8)continue;const other=new Set([...(Array.isArray(m.goals1)?m.goals1:[]),...(Array.isArray(m.goals2)?m.goals2:[])].map(g=>g?.name?.trim()).filter(Boolean));
   const decoys=shuffleDet(scorersArr.filter(n=>!other.has(n)),`${year}|${team}|${x.date}|decoys`);if(decoys.length<2)continue;
   for(const name of names){let id=`wc|${year}|${team}|${x.date}|${name}|scorer`;const options=shuffleDet([name,...decoys.slice(0,2)],id);const item=q(id,'Marcatori dei Mondiali','Marcatori',3,`Chi segnò almeno un gol per ${team} contro ${team===x.home?x.away:x.home} al Mondiale ${year} (${dateIt(x.date)})?`,options,name,`${name} figura tra i marcatori di ${team} in questa partita. Fonte: OpenFootball World Cup.`,url);if(item)out.push(item)}
  }
 }
 return out;
}
async function getJson(url,timeout=14000){const c=new AbortController(),timer=setTimeout(()=>c.abort(),timeout);try{const res=await fetch(url,{signal:c.signal,headers:{'User-Agent':'FootballLegends/0.4 (+public-CC0-datasets)'}});if(!res.ok)throw Error(`HTTP ${res.status}`);return await res.json()}finally{clearTimeout(timer)}}
function combineAndCap(groups,max=50000){ // Diversità per campionato e tipo, selezione deterministica.
 const unique=new Map();for(const group of groups)for(const x of group){if(!x||unique.has(x.id))continue;unique.set(x.id,x)}
 const all=[...unique.values()];if(all.length<=max)return all;
 const buckets=new Map();for(const x of all){const key=x.category+'|'+x.kind;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(x)}
 const keys=[...buckets.keys()].sort();for(const k of keys)buckets.set(k,shuffleDet(buckets.get(k),'v04|'+k));
 let chosen=[],progress=true;while(chosen.length<max&&progress){progress=false;for(const key of keys){const b=buckets.get(key);if(b.length){chosen.push(b.pop());progress=true;if(chosen.length>=max)break}}}
 return shuffleDet(chosen,'football-legends-50k-v04');
}
async function generateQuestions(progress=()=>{},settings={}){
 const start=settings.firstSeason||1990,end=settings.lastSeason||2026,max=settings.max||50000;
 const jobs=[];for(let y=start;y<=end;y++)for(const [file,category] of LEAGUES){const season=`${y}-${String((y+1)%100).padStart(2,'0')}`;jobs.push({url:`${LEAGUE_ROOT}/${season}/${file}.json`,season,category,type:'league'})}
 for(const season of SWISS_SEASONS){
  jobs.push({url:`${SWISS_ROOT}/switzerland_${season}_ch1.json`,season,category:SWISS_CATEGORY,type:'league'});
 }
 for(const [season,division,category] of SWISS_EXTRA_FILES){
  jobs.push({url:`${SWISS_ROOT}/switzerland_${season}_${division}.json`,season,category,type:division==='chcup'?'cup':'league'});
 }
 // Le finali importanti sono curate in classics-questions.json; non scaricare i risultati casuali dei Mondiali.
 let next=0,ok=0,failed=0,matchCount=0;const groups=[],errors=[],bySource={};
 async function worker(){while(next<jobs.length){const job=jobs[next++];try{const data=await getJson(job.url);if(!Array.isArray(data.matches))throw Error('Missing matches');let qs=[];if(job.type==='league'||job.type==='cup'){const matches=data.matches.filter(m=>info(m));matchCount+=matches.length;if(job.type==='league'){qs.push(...fromCompleteStandings(matches,job.season,job.category,job.url))}qs=combineAndCap([qs],1250)}else{qs=[];matchCount+=data.matches.filter(m=>info(m)).length}
 if(qs.length){groups.push(qs);ok++;bySource[job.type==='league'?job.category:'Mondiali']= (bySource[job.type==='league'?job.category:'Mondiali']||0)+qs.length;progress({source:job.url,questions:qs.length,processed:ok+failed,total:jobs.length})}else failed++}catch(e){failed++;if(errors.length<25)errors.push(`${job.url}: ${e.message}`)}}}
 await Promise.all(Array.from({length:settings.concurrency||10},()=>worker()));// Riserva fino a 5.000 posti alla Super League svizzera senza sacrificare
 // la possibilità di giocare con tutti gli altri campionati. Se la copertura
 // disponibile è inferiore, dichiariamo il numero reale senza inventare nulla.
 const swiss=groups.flat().filter(x=>x.category===SWISS_CATEGORY);
 const others=groups.flat().filter(x=>x.category!==SWISS_CATEGORY);
 const swissTarget=Math.min(300,max);
 const swissChosen=combineAndCap([swiss],swissTarget);
 const challenge=others.filter(x=>x.category===SWISS_CHALLENGE_CATEGORY);
 const cup=others.filter(x=>x.category===SWISS_CUP_CATEGORY);
 const world=others.filter(x=>x.category!==SWISS_CHALLENGE_CATEGORY&&x.category!==SWISS_CUP_CATEGORY);
 const challengeChosen=combineAndCap([challenge],Math.min(100,Math.max(0,max-swissChosen.length)));
 const cupChosen=combineAndCap([cup],Math.min(50,Math.max(0,max-swissChosen.length-challengeChosen.length)));
 const otherChosen=combineAndCap([world],Math.max(0,max-swissChosen.length-challengeChosen.length-cupChosen.length));
 const questions=shuffleDet([...swissChosen,...challengeChosen,...cupChosen,...otherChosen],'swiss-reserved-v06');
 const byCategory={};const byKind={};for(const v of questions){byCategory[v.category]=(byCategory[v.category]||0)+1;byKind[v.kind]=(byKind[v.kind]||0)+1}
 return {questions,stats:{generated:questions.length,uniqueBeforeLimit:groups.reduce((n,g)=>n+g.length,0),matchCount,sourcesSuccessful:ok,sourcesFailed:failed,sourcesTotal:jobs.length,byCategory,byKind,at:new Date().toISOString(),errors}};
}
module.exports={SWISS_SEASONS,SWISS_CATEGORY,SWISS_EXTRA_FILES,SWISS_CHALLENGE_CATEGORY,SWISS_CUP_CATEGORY,LEAGUES,WORLD_YEARS,fromMatch,fromSeason,fromWorldCup,fromCompleteStandings,generateQuestions,combineAndCap,info};
