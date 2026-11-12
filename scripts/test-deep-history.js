"use strict";
const assert=require('assert');
const questions=require('../deep-history.json');
const topics=require('../topics-v3');
const counts={};const seen=new Set();
for(const q of questions){
 assert(q.id && q.question && q.explanation && q.source);
 assert(q.options.length===3 && new Set(q.options).size===3);
 assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3);
 assert(!seen.has(q.question),'Duplicate question '+q.question);seen.add(q.question);
 const group=q.category==='Mondiali'?'worldcup':q.category==='Europei'?'national':'europe';
 counts[q.category]=(counts[q.category]||0)+1;
}
assert.equal(questions.length,350);
console.log('PASS storico: '+JSON.stringify(counts));
