'use strict';
const assert=require('assert');const {buildTournament,stage,done}=require('./build-competition-history');
assert.equal(stage('Group A'),null);assert.equal(stage('Final round'),null);assert.equal(stage('Quarter-finals'),'quarti di finale');
assert.equal(done({team1:'Argentina',team2:'France',score:{ft:[3,3]}}),true);
const data={matches:[
 {round:'Group A',team1:'Argentina',team2:'Japan',score:[1,0]},
 {round:'Group B',team1:'France',team2:'Brazil',score:[1,0]},
 {round:'Semi-finals',date:'2022-12-13',team1:'Argentina',team2:'Croatia',score:{ft:[3,0]},goals1:[{name:'Lionel Messi'},{name:'Julián Álvarez'}],ground:'Stadio Uno'},
 {round:'Semi-finals',date:'2022-12-14',team1:'France',team2:'Morocco',score:{ft:[2,0]},goals1:[{name:'Theo Hernandez'},{name:'Kolo Muani'}],ground:'Stadio Due'},
 {round:'Final',date:'2022-12-18',team1:'Argentina',team2:'France',score:{ft:[3,3],p:[4,2]},goals1:[{name:'Lionel Messi'}],goals2:[{name:'Kylian Mbappé'}],ground:'Stadio Tre'}
]};
const a=buildTournament({year:2022,competition:'Mondiali',url:'https://example.com',data});
assert(a.length>=5,'Should build a meaningful set');assert(a.some(q=>q.category==='Stadi leggendari'));
assert.equal(new Set(a.map(q=>q.id)).size,a.length);assert.equal(new Set(a.map(q=>q.question)).size,a.length);
for(const q of a){assert.equal(q.options.length,3);assert.equal(new Set(q.options).size,3);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3);assert(q.options[q.answer]);assert(q.source);assert(q.explanation)}
const b=buildTournament({year:2022,competition:'Mondiali',url:'https://example.com',data});assert.deepEqual(a,b);
console.log('Competition history: '+a.length+' fixture questions, no duplicate IDs/prompts, answer/schema valid');
