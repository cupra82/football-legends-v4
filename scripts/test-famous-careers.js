'use strict';
const assert=require('node:assert/strict');const {generate}=require('./build-famous-careers');
const binding=(id,name)=>({person:{value:'http://www.wikidata.org/entity/'+id},personLabel:{value:name}});
const cache={clubs:{Q1:{club:{name:'Inter'},bindings:[binding('Q10','Lionel Messi'),binding('Q11','Luca Campione')]},Q2:{club:{name:'Milan'},bindings:[binding('Q10','Lionel Messi'),binding('Q11','Luca Campione')]},Q3:{club:{name:'Barcelona'},bindings:[binding('Q10','Lionel Messi'),binding('Q11','Luca Campione')]},Q4:{club:{name:'Bayern'},bindings:[binding('Q11','Luca Campione')]},Q5:{club:{name:'Ajax'},bindings:[]},Q6:{club:{name:'Liverpool'},bindings:[]},Q7:{club:{name:'PSG'},bindings:[]},Q8:{club:{name:'Arsenal'},bindings:[]}}};
const result=generate(cache);
assert.equal(result.questions.length,1);
for(const q of result.questions){assert.equal(q.options.length,3);assert.equal(new Set(q.options).size,3);assert.equal(q.options[q.answer].includes(' e '),true);assert.match(q.source,/wikidata.org\/wiki\/Q/)}
assert.equal(result.notedFamous,1);
console.log('OK: carriere incrociate, 3 alternative e selezione internazionale');
