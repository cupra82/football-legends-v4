'use strict';
// Football Legends V4.3 – Coppe europee, dati strutturati openfootball/champions-league (CC0).
// Domande sui club approdati ai turni decisivi, incroci storici e finali;
// esclude completamente risultati di partite dei gironi, supplementari e rigori.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const base=path.resolve(__dirname,'..');
const output=path.join(base,'european-cups-generated.json');
const sha=s=>crypto.createHash('sha256').update(String(s)).digest('hex');
const season=y=>`${y}-${String(y+1).slice(-2)}`;
const dataSources=[];
for(let y=2011;y<=2025;y++)dataSources.push({s:season(y),type:'cl',name:'Champions League'});
for(let y=2020;y<=2025;y++)dataSources.push({s:season(y),type:'el',name:'Europa League'});
for(let y=2021;y<=2025;y++)dataSources.push({s:season(y),type:'conf',name:'Conference League'});
const stageFromLine=line=>{
 const x=line.toLowerCase().replace(/[- ]/g,'');
 if(/finals?,\s*final\b|^final\b/.test(line.toLowerCase())||/^final$/i.test(line.trim()))return 'finale';
 if(/semifinal/.test(x))return 'semifinale';
 if(/quarterfinal/.test(x))return 'quarti di finale';
 if(/roundof16|last16|eighthfinal/.test(x))return 'ottavi di finale';
 return '';
};
const strippingTeam=s=>s.replace(/\s+\([A-Z]{3}\)\s*$/,'').trim().replace(/\s+/g,' ');
function parse(text){
 const matchRows=[],allTeams=new Set();let activeStage='';let currentCompetition='';
 for(const raw of String(text).split(/\r?\n/)){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  if(/^=\s/.test(line)){currentCompetition=line.slice(1).trim();continue;}
  if(/^[▪»]/.test(line)){activeStage=stageFromLine(line.slice(1).trim());continue;}
  // Optional kick-off; teams identifiable by a standalone v separator, with score following team2.
  const noTime=line.replace(/^\d{1,2}:\d{2}\s+/, '');
  const vIndex=noTime.indexOf(' v ');if(vIndex<0)continue;
  const lhs=noTime.slice(0,vIndex).trim(),rhs=noTime.slice(vIndex+3);
  const scoreMatch=rhs.match(/\s+(\d{1,2})-(\d{1,2})(?=\s|$)/);
  if(!scoreMatch)continue;
  const a=strippingTeam(lhs),b=strippingTeam(rhs.slice(0,scoreMatch.index));
  if(!a||!b||a===b||a.length>85||b.length>85)continue;
  allTeams.add(a);allTeams.add(b);
  if(activeStage)matchRows.push({stage:activeStage,a,b});
 }
 return {matchRows,allTeams:[...allTeams]};
}
function deterministicChoices(correct,candidates,key){
 const opts=[...new Set(candidates)].filter(x=>x!==correct&&x);
 if(opts.length<2)return null;
 const ranked=opts.sort((a,b)=>sha(key+'|'+a).localeCompare(sha(key+'|'+b)));
 return [correct,...ranked.slice(0,2)].sort((a,b)=>sha(key+'|option|'+a).localeCompare(sha(key+'|option|'+b)));
}
function buildSeason(source,text){
 const {matchRows,allTeams}=parse(text);
 if(matchRows.length<5||allTeams.length<12)return [];
 const category='Champions League';
 const event=source.name,seasonLabel=source.s;
 const output=[],seen=new Set(),byStage=new Map();
 const pool=allTeams;
 for(const row of matchRows){if(!byStage.has(row.stage))byStage.set(row.stage,new Map());const key=[row.a,row.b].sort().join('§');byStage.get(row.stage).set(key,[row.a,row.b]);}
 function add(key,kind,question,answer,wrong,explanation,difficulty=2){
  if(seen.has(question))return;
  const options=deterministicChoices(answer,wrong,source.s+'|'+source.type+'|'+key);if(!options)return;
  output.push({id:'cup43-'+sha(source.s+'|'+source.type+'|'+key).slice(0,20),category,kind,difficulty,question,options,answer:options.indexOf(answer),explanation,source:`https://github.com/openfootball/champions-league/blob/master/${source.s}/${source.type}.txt`,sourceName:'OpenFootball CC0'});
  seen.add(question);
 }
 for(const [stage,pairs] of byStage){
  const pairList=[...pairs.values()],stageTeams=new Set(pairList.flat()),nonParticipants=pool.filter(t=>!stageTeams.has(t));
  const limit=stage==='ottavi di finale'?8:stage==='quarti di finale'?4:stage==='semifinale'?2:1;
  for(const [idx,pair] of pairList.slice(0,limit).entries()){
   // One question about each pair, rather than repeating every first/second leg score.
   const protagonist=pair[Number.parseInt(sha(source.s+'|'+source.type+'|'+stage+'|'+idx).slice(0,2),16)%2];
   const rival=pair.find(x=>x!==protagonist);
   const distractors=pool.filter(t=>t!==protagonist&&t!==rival&&!pairList.some(p=>p.includes(protagonist)&&p.includes(t)));
   add(`opponent|${stage}|${protagonist}`,'Incroci nelle coppe europee',`Quale squadra affrontò ${protagonist} ${stage==='finale'?'nella finale':stage==='semifinale'?'in semifinale':stage==='quarti di finale'?'nei quarti di finale':'negli ottavi di finale'} della ${event} ${seasonLabel}?`,rival,distractors,`${protagonist} affrontò ${rival} nei turni conclusivi della ${event} ${seasonLabel}.`,stage==='finale'?1:2);
  }
  // Up to two distinct stage-participation facts, with wrong answers that did not reach the stage.
  if(nonParticipants.length>=2 && stage!=='ottavi di finale'){
   const distinct=[...stageTeams].sort((a,b)=>sha(source.s+'|'+source.type+'|'+stage+'|'+a).localeCompare(sha(source.s+'|'+source.type+'|'+stage+'|'+b)));
   for(const team of distinct.slice(0,2)){
    add(`participant|${stage}|${team}`,'Percorsi nelle coppe europee',`Quale di questi club raggiunse ${stage==='finale'?'la finale':stage==='semifinale'?'la semifinale':'i quarti di finale'} della ${event} ${seasonLabel}?`,team,nonParticipants,`${team} disputò ${stage==='finale'?'la finale':stage==='semifinale'?'la semifinale':'i quarti di finale'} della ${event} ${seasonLabel}.`,2);
   }
  }
 }
 return output;
}
const load=p=>{try{const o=JSON.parse(fs.readFileSync(p,'utf8'));return Array.isArray(o)?o:o.questions||[]}catch{return []}};
async function getText(url,ms=8500){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const response=await fetch(url,{signal:c.signal,headers:{'User-Agent':'FootballLegendsV4HistoricalArchive/4.3','Accept':'text/plain'}});if(!response.ok)throw Error('HTTP '+response.status);return await response.text()}finally{clearTimeout(t)}}
async function main(){
 const old=load(output),map=new Map(old.map(x=>[x.id,x]));
 const existing=['questions.json','classics-questions.json','deep-history.json','history-expansion.json','official-questions.json','competition-history-generated.json'];
 const seen=new Set([...old,...existing.flatMap(f=>load(path.join(base,f)))].map(q=>String(q.question||'').toLocaleLowerCase('it')));
 const stats={attempted:0,succeeded:0,failed:0,newQuestions:0,preserved:old.length,byCompetition:{},perSeason:[]};
 let index=0,failures=[];const deadline=Date.now()+Math.max(25000,Math.min(350000,Number(process.env.FL_CUP_BUDGET_MS)||260000));
 async function worker(){while(index<dataSources.length&&Date.now()<deadline-10000){const source=dataSources[index++];stats.attempted++;const url=`https://raw.githubusercontent.com/openfootball/champions-league/master/${source.s}/${source.type}.txt`;
  try{const txt=await getText(url);const rows=buildSeason(source,txt);if(!rows.length)throw Error('Nessun turno finale riconosciuto');stats.succeeded++;
   let added=0;for(const row of rows){const k=row.question.toLocaleLowerCase('it');if(!map.has(row.id)&&!seen.has(k)){map.set(row.id,row);seen.add(k);added++}}
   stats.newQuestions+=added;stats.byCompetition[source.name]=(stats.byCompetition[source.name]||0)+added;stats.perSeason.push({competition:source.name,season:source.s,newQuestions:added});console.log(`${source.name} ${source.s}: +${added} domande (turni finali)`);
  }catch(e){stats.failed++;failures.push(`${source.name} ${source.s}: ${e.message}`);console.warn(`${source.name} ${source.s}: ${e.message}`)}
 }}
 await Promise.all(Array.from({length:3},worker));
 if(!stats.succeeded){console.warn('Fonti temporaneamente non disponibili: archivio precedentemente salvato conservato');return}
 const rows=[...map.values()].sort((a,b)=>a.id.localeCompare(b.id));
 fs.writeFileSync(output+'.tmp',JSON.stringify({version:'4.3',stats,questions:rows},null,2)+'\n');fs.renameSync(output+'.tmp',output);
 console.log(`COPPE EUROPEE 4.3: ${stats.succeeded} fonti riuscite, +${stats.newQuestions} nuove, ${rows.length} in archivio (precedenti ${old.length})`);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={parse,buildSeason,stageFromLine};
