'use strict';
const assert=require('assert');
const {fromMatch,fromSeason,fromWorldCup,combineAndCap}=require('./football-bank');
const match={team1:'Inter',team2:'Milan',date:'2024-01-06',score:{ht:[1,0],ft:[2,1]}};
const qs=fromMatch(match,'2023-24','Serie A','https://example.org/fixture');
assert(qs.length>=7);
for(const q of qs){assert.equal(q.options.length,3);assert.equal(new Set(q.options).size,3);assert(q.answer>=0&&q.answer<3);assert(typeof q.question==='string'&&q.question.length>10)}
assert(qs.some(x=>x.question.includes('punteggio')||x.question.includes('risultato finale')));
assert.equal(fromMatch({...match,date:'2099-01-01'},'2098-99','Serie A','x').length,0);
const games=[];for(let i=0;i<200;i++)games.push({team1:'A'+(i%12),team2:'B'+(i%11),date:'2024-01-'+String(i%27+1).padStart(2,'0'),score:{ft:[i%4,(i+1)%3]}});
const seasons=fromSeason(games,'2023-24','Serie A','src');assert(seasons.length>20);
let wc=fromWorldCup({matches:[{team1:'Italy',team2:'France',date:'2006-07-09',score:{ft:[1,1]},goals1:[{name:'Marco Materazzi'}],goals2:[{name:'Zinedine Zidane'}],ground:'Olympiastadion Berlin'}]},2006,'src');assert(wc.length>=4);
const chosen=combineAndCap([qs,seasons,wc],20);assert.equal(chosen.length,20);
console.log(`OK: ${qs.length} tipologie match, ${seasons.length} domande statistiche, ${wc.length} domande Mondiali; selezione ${chosen.length}`);

const {SWISS_SEASONS,SWISS_EXTRA_FILES,SWISS_CATEGORY}=require('./football-bank');
assert.equal(SWISS_SEASONS.length,6);
assert.equal(SWISS_EXTRA_FILES.length,6);
assert.equal(SWISS_CATEGORY,'Campionato svizzero');
const swissGame={team1:'FC Lugano',team2:'FC Basel 1893',date:'2024-08-18',score:{ht:[1,0],ft:[2,1]}};
assert(fromMatch(swissGame,'2024-25',SWISS_CATEGORY,'openfootball').length>=7);
console.log('OK: sorgenti svizzere e quiz di prova');
