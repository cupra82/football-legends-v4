'use strict';
// OpenFootball football.json (CC0) - champions from FULL seasonal match tables, not guesses.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.join(__dirname,'..');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,18);
const leagueFiles={ 'Premier League':'en.1.json','Serie A':'it.1.json','La Liga':'es.1.json','Bundesliga':'de.1.json','Ligue 1':'fr.1.json' };
const saved=(()=>{try{return JSON.parse(fs.readFileSync(path.join(root,'v410-champions-generated.json')))}catch{return {questions:[]}}})();
async function get(url){const a=new AbortController(),t=setTimeout(()=>a.abort(),11000);try{const r=await fetch(url,{signal:a.signal,headers:{'User-Agent':'FootballLegends/4.1.0 (quiz project)','Accept':'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);return r.json()}finally{clearTimeout(t)}}
function champion(matches){if(!Array.isArray(matches)||matches.length<250)return null;const standing=new Map(),pairs=new Set();
 for(const m of matches){const a=m.team1,b=m.team2,s=m.score?.ft;if(!a||!b||a===b||!Array.isArray(s)||s.length!==2||!s.every(x=>Number.isInteger(x)&&x>=0))return null;
 const key=a+'|'+b;if(pairs.has(key))return null;pairs.add(key);
 for(const club of [a,b])if(!standing.has(club))standing.set(club,{points:0,played:0});
 const pa=standing.get(a),pb=standing.get(b);pa.played++;pb.played++;
 if(s[0]>s[1])pa.points+=3;else if(s[0]<s[1])pb.points+=3;else{pa.points++;pb.points++}
 }
 const rows=[...standing.entries()].sort((a,b)=>b[1].points-a[1].points);
 if(rows.length<16||new Set(rows.map(x=>x[1].played)).size!==1||rows[0][1].points===rows[1][1].points)return null;
 if(rows[0][1].played<30)return null;
 return {winner:rows[0][0],other:rows.slice(1,6).map(x=>x[0]),clubs:rows.length};
}
async function main(){const old=new Map((saved.questions||[]).map(x=>[x.id,x])),first=old.size;let success=0,missed=0;
 for(let year=2010;year<=2024;year++)for(const [league,file] of Object.entries(leagueFiles)){
 const season=`${year}-${String(year+1).slice(-2)}`,url=`https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${file}`;
 try{const data=await get(url),result=champion(data.matches);if(!result){missed++;continue}const answer=result.winner,wrong=result.other.slice(0,2);
 const q=`Chi ha conquistato la ${league} nella stagione ${season}?`;
 const opts=[answer,...wrong].sort((a,b)=>hash(season+league+a).localeCompare(hash(season+league+b)));
 const row={id:'v410-title-'+hash(url),category:league,kind:'Albo d’oro campionati',difficulty:2,question:q,options:opts,answer:opts.indexOf(answer),explanation:`La classifica finale ricostruita dai risultati stagionali registra ${answer} al primo posto della ${league} ${season}.`,source:url,sourceName:'OpenFootball Football.JSON CC0'};
 old.set(row.id,row);success++;
 }catch(e){missed++}
 }
 const questions=[...old.values()];if(questions.length!==first)fs.writeFileSync(path.join(root,'v410-champions-generated.json'),JSON.stringify({stats:{newQuestions:questions.length-first,total:questions.length,successfulSeasons:success,missingOrIncomplete:missed},questions},null,2)+'\n');
 console.log(`OPENFOOTBALL LEAGUES: ${success} stagioni complete, ${questions.length-first} nuove domande, ${missed} ignorate`);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});module.exports={champion};
