'use strict';
const assert=require('node:assert/strict');
const {rankCandidates,enrichmentQuery,applySitelinks,makeQuestions}=require('./wikidata-bank');
const clubs=[
 {id:'Q101',name:'Piccolo Club',country:'Italia'},
 {id:'Q102',name:'Club Storico',country:'Italia'},
 {id:'Q103',name:'Club Spagnolo',country:'Spagna'},
 {id:'Q104',name:'Altro Club',country:'Spagna'}
];
assert.equal(rankCandidates(clubs,3).length,3);
assert.deepEqual(rankCandidates(clubs,4).map(x=>x.country),['Italia','Spagna','Italia','Spagna']);
const query=enrichmentQuery(clubs);
for(const club of clubs)assert.ok(query.includes('wd:'+club.id));
applySitelinks(clubs,[{club:{value:'http://www.wikidata.org/entity/Q102'},sitelinks:{value:'230'}},{club:{value:'http://www.wikidata.org/entity/Q103'},sitelinks:{value:'35'}}]);
assert.equal(rankCandidates(clubs,2,true)[0].name,'Club Storico');
assert.equal(rankCandidates(clubs,2,true)[1].name,'Club Spagnolo');
// I distrattori non devono includere altre squadre dove il giocatore ha militato.
const binding=(id,name,year)=>({person:{value:'http://www.wikidata.org/entity/'+id},personLabel:{value:name},birth:{value:`${year}-01-01T00:00:00Z`}});
const collection=[
 {club:clubs[0],bindings:[binding('Q9001','Giocatore Uno',1980),binding('Q9002','Giocatore Due',1982)]},
 {club:clubs[1],bindings:[binding('Q9001','Giocatore Uno',1980),binding('Q9003','Giocatore Tre',1984)]},
 {club:clubs[2],bindings:[binding('Q9004','Giocatore Quattro',1986)]},
 {club:clubs[3],bindings:[binding('Q9005','Giocatore Cinque',1988)]}
];
const quiz=makeQuestions(collection);
const q=quiz.find(x=>x.question.includes('Giocatore Uno')&&x.kind==='Carriere Wikidata');
assert.ok(q);
const wrong=q.options.filter((_,i)=>i!==q.answer);
assert.ok(!wrong.includes('Piccolo Club')&&!wrong.includes('Club Storico'));
console.log('TEST OK: alternanza geografica, priorità fonti, alternative di carriera.');
