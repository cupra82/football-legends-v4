const assert=require('assert');
const {fromCompleteStandings}=require('./football-bank');
const teams=Array.from({length:10},(_,i)=>'Club '+String.fromCharCode(65+i));
const matches=[];for(const h of teams)for(const a of teams)if(h!==a){const hi=teams.indexOf(h),ai=teams.indexOf(a);const hg=hi<ai?2:0,ag=hi<ai?0:2;matches.push({team1:h,team2:a,date:'2024-11-11',score:{ft:[hg,ag]}})}
const q=fromCompleteStandings(matches,'2024-25','Campionato di prova','test');
assert(q.length>=5,'Devono essere prodotte domande su campionato completo');
assert(q.every(x=>x.options.length===3&&x.options[x.answer]));
assert(q.every(x=>!/Quanti gol|contro .*\d\d\/|all.intervallo/i.test(x.question)));
assert.strictEqual(fromCompleteStandings(matches.slice(0,-1),'2024-25','Campionato di prova','test').length,0,'Non pubblicare classifiche di stagioni incomplete');
console.log('OK: '+q.length+' domande almanacco; stagione incompleta esclusa');
