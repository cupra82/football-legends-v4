'use strict';
// Football Legends V4.2 — Domande dalle fasi finali di tornei storici (CC0 OpenFootball).
// NON genera quiz sui risultati casuali dei gironi. Fonti verificabili per ogni domanda.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const outFile=path.join(root,'competition-history-generated.json');
const WC=[1930,1934,1938,1950,1954,1958,1962,1966,1970,1974,1978,1982,1986,1990,1994,1998,2002,2006,2010,2014,2018,2022];
const EURO=[1960,1964,1968,1972,1976,1980,1984,1988,1992,1996,2000,2004,2008,2012,2016,2021,2024];
const jobs=[...WC.map(year=>({year,competition:'Mondiali',url:`https://raw.githubusercontent.com/openfootball/worldcup.json/master/${year}/worldcup.json`})),...EURO.map(year=>({year,competition:'Europei',url:`https://openfootball.github.io/internationals/uefa_euro_${year}_uefa_euro.json`}))];
const hash=s=>crypto.createHash('sha1').update(String(s)).digest('hex');
const randomOrder=(arr,key)=>[...arr].sort((a,b)=>hash(key+'|'+a).localeCompare(hash(key+'|'+b)));
const clean=s=>String(s||'').trim();
const scoreArr=s=>Array.isArray(s)?s:Array.isArray(s?.ft)?s.ft:null;
const done=m=>Boolean(m&&m.team1&&m.team2&&scoreArr(m.score)?.length===2&&scoreArr(m.score).every(n=>Number.isFinite(Number(n))));
function stage(round){const r=clean(round).toLowerCase();if(/final round|final group|group stage/.test(r))return null;if(/final/.test(r)&&!/quarter|semi/.test(r))return 'finale';if(/semi|third place/.test(r))return r.includes('third')?'terzo posto':'semifinale';if(/quarter/.test(r))return 'quarti di finale';if(/round of 16|last 16|eighth|ottavi/.test(r))return 'ottavi di finale';return null;}
function buildTournament({year,competition,url,data}){
 const matches=(Array.isArray(data?.matches)?data.matches:[]).filter(done);
 const teams=[...new Set(matches.flatMap(x=>[clean(x.team1),clean(x.team2)]))];
 const rows=[];const used=new Set();const isWorld=competition==='Mondiali';const cat=isWorld?'Mondiali':'Europei';
 const label=isWorld?`Mondiale ${year}`:`Europeo ${year===2021?2020:year}`;
 const scorers=[...new Set(matches.flatMap(m=>[...(m.goals1||[]),...(m.goals2||[])].filter(g=>g&&g.name&&!g.owngoal&&!g.own_goal&&!g.ownGoal).map(g=>clean(g.name))))];
 function put(kind,key,question,correct,wrong,explanation,category=cat,difficulty=2){
  if(!correct||used.has(question))return;
  const ds=randomOrder([...new Set(wrong)].filter(t=>t&&t!==correct),key).slice(0,2);
  if(ds.length!==2)return;
  const options=randomOrder([correct,...ds],key+'|options');
  if(new Set(options.map(x=>x.toLocaleLowerCase())).size!==3)return;
  rows.push({id:'comp42-'+hash(`${competition}|${year}|${key}`).slice(0,20),category,kind,difficulty,question,options,answer:options.indexOf(correct),explanation,source:url,sourceName:'OpenFootball (CC0)'});used.add(question);
 }
 // Una domanda sugli avversari per ogni incontro ad eliminazione (non duplicazioni speculari).
 const finals=matches.filter(m=>stage(m.round));
 const allStages=finals.filter(m=>stage(m.round)!=='terzo posto');
 for(const [i,m] of allStages.entries()){
  const s=stage(m.round),roundText=s==='finale'?'nella finale':s==='semifinale'?'in semifinale':s==='quarti di finale'?'nei quarti di finale':'negli ottavi di finale';
  const pivot=hash(`${year}|${i}|${m.team1}`).charCodeAt(0)%2?m.team1:m.team2;
  const rival=pivot===m.team1?m.team2:m.team1;
  put('Incroci storici',`rival-${m.date}-${i}`,`Quale nazionale affrontò ${pivot} ${roundText} del ${label}?`,rival,teams.filter(t=>t!==pivot&&t!==rival),`${pivot} e ${rival} si affrontarono ${roundText} del ${label}.`,cat,s==='finale'?1:2);
  if(s==='semifinale'||s==='finale'){
    // Domande su protagonisti REALI della semifinale/finale, evitando autoreti e dati mancanti.
    const goals=[...(Array.isArray(m.goals1)?m.goals1:[]).map(x=>({g:x,t:m.team1})),...(Array.isArray(m.goals2)?m.goals2:[]).map(x=>({g:x,t:m.team2}))].filter(x=>x.g?.name&&!x.g.owngoal&&!x.g.own_goal&&!x.g.ownGoal);
    const unique=[...new Map(goals.map(x=>[clean(x.g.name),x])).values()];
    for(const x of unique.slice(0,2)){
      const player=clean(x.g.name),enemy=x.t===m.team1?m.team2:m.team1;
      const wrong=scorers.filter(n=>n!==player&&!unique.some(y=>clean(y.g.name)===n));
      put('Protagonisti delle finali',`scorer-${m.date}-${player}`,`Chi segnò per ${x.t} contro ${enemy} ${roundText} del ${label}?`,player,wrong,`${player} figura tra i marcatori di ${x.t} in ${x.t}–${enemy}, ${s} del ${label}.`,cat,3);
    }
  }
  if(s==='finale'&&m.ground){
    const venue=clean(m.ground),other=[...new Set(matches.map(x=>clean(x.ground)).filter(Boolean))].filter(v=>v!==venue);
    put('Sedi delle grandi finali',`stadium-${m.date}`,`In quale sede si disputò la finale del ${label}?`,venue,other,`La finale del ${label} si disputò a ${venue}.`,'Stadi leggendari',2);
  }
 }
 // Fatti sui semifinalisti e finalisti: solo se le fasi sono esplicitamente indicate nei dati.
 for(const s of ['semifinale','finale']){
  const participants=[...new Set(allStages.filter(m=>stage(m.round)===s).flatMap(m=>[m.team1,m.team2]))];
  if(!participants.length)continue;
  const notPresent=teams.filter(t=>!participants.includes(t));
  if(notPresent.length<2)continue;
  // Cap di 2 per torneo: evita 4-8 domande quasi equivalenti sullo stesso fatto.
  for(const participant of randomOrder(participants,`participant-${year}-${s}`).slice(0,2)){
    put('Percorso nelle fasi finali',`participant-${s}-${participant}`,`Quale nazionale raggiunse ${s==='finale'?'la finale':'le semifinali'} del ${label}?`,participant,notPresent,`${participant} raggiunse ${s==='finale'?'la finale':'le semifinali'} del ${label}.`,cat,2);
  }
 }
 return rows;
}
const read=p=>{try{const o=JSON.parse(fs.readFileSync(p,'utf8'));return Array.isArray(o)?o:o.questions||[]}catch{return []}};
async function getJSON(url,timeout=9000){const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),timeout);try{const r=await fetch(url,{signal:ctl.signal,headers:{'User-Agent':'FootballLegendsV4/4.2 (open data historical quiz)','Accept':'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}}
async function main(){
 const old=read(outFile),existingFiles=['questions.json','classics-questions.json','deep-history.json','history-expansion.json','official-questions.json','people-questions.json','portugal-questions.json'];
 const known=new Set(existingFiles.flatMap(f=>read(path.join(root,f))).map(q=>clean(q.question).toLocaleLowerCase('it')));
 const oldById=new Map(old.filter(q=>q.id).map(q=>[q.id,q]));
 const stats={sourcesSucceeded:0,sourcesFailed:0,newQuestions:0,retained:old.length,byCategory:{},sources:[]};
 const maxMs=Math.max(20000,Math.min(240000,Number(process.env.FL_HISTORY_BUDGET_MS)||150000));const deadline=Date.now()+maxMs;
 let cursor=0;const additions=[];
 async function worker(){while(cursor<jobs.length&&Date.now()<deadline-11000){const job=jobs[cursor++];try{const data=await getJSON(job.url);const rows=buildTournament({...job,data});if(!Array.isArray(data?.matches)||!data.matches.length)throw Error('No matches');stats.sourcesSucceeded++;stats.sources.push({year:job.year,competition:job.competition,questions:rows.length});additions.push(...rows);console.log(`${job.competition} ${job.year}: ${rows.length} domande dalle fasi finali`)}catch(e){stats.sourcesFailed++;console.warn(`${job.competition} ${job.year}: ${e.message}`)}}}
 await Promise.all(Array.from({length:3},()=>worker()));
 for(const q of additions){if(oldById.has(q.id)||known.has(q.question.toLocaleLowerCase('it')))continue;oldById.set(q.id,q);stats.newQuestions++}
 const questions=[...oldById.values()].sort((a,b)=>a.id.localeCompare(b.id));
 for(const q of questions)stats.byCategory[q.category]=(stats.byCategory[q.category]||0)+1;
 if(stats.sourcesSucceeded===0){console.warn('Nessuna fonte accessibile: archivio precedente conservato');return}
 if(questions.length<old.length)throw Error('Protezione archivio: riduzione inattesa');
 const tmp=outFile+'.tmp';fs.writeFileSync(tmp,JSON.stringify({version:'4.2',stats,questions},null,2)+'\n');fs.renameSync(tmp,outFile);
 console.log(`COMPETITION V4.2: ${stats.sourcesSucceeded} fonti riuscite, ${stats.newQuestions} NUOVE domande, ${questions.length} totali archivio storico aggiuntivo`);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={buildTournament,stage,done};
