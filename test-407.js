'use strict';
const assert=require('assert');const quality=require('./fl407-quality');
const examples=[
 {id:'x1',question:'Chi ha vinto la finale di Champions League del 2005?',category:'Champions',kind:'Finali storiche'},
 {id:'x2',question:'In quale città è nato un giocatore minore?',category:'Calciatori nel mondo',kind:'Città di nascita Wikidata'},
 {id:'x3',question:'Quale squadra ha allenato Carlo Ancelotti?',category:'Allenatori',kind:'Carriere'},
 {id:'x4',question:'In quale città è nato Antoine Griezmann?',category:'Calciatori nel mondo',kind:'Città di nascita Wikidata'},
];
assert(quality.score(examples[0])>quality.score(examples[1]));
assert(quality.score(examples[2])>quality.score(examples[1]));
const ds=quality.select(examples,3);assert.equal(ds.length,3);
assert.equal(new Set(ds.map(x=>x.id)).size,3);
const whole=quality.select(examples,4,{mode:'all'});assert.equal(whole.length,4);
console.log('FL407: qualità, archivio completo, alternative e assenza duplicati OK');
