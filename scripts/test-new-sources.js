'use strict';
const assert=require('assert');
const {COUNTRIES,discoverCountriesQuery,discoveredCountries,discoverQuery,discoveredClubs,queryFor,rowsFrom,makeQuestions}=require('./wikidata-bank');
const CLUBS=[{id:'Q1422',name:'Juventus',category:'Calciatori nel mondo'}];
assert(COUNTRIES.length>=20);
assert(discoverCountriesQuery().includes("Q6256"));
assert(discoveredCountries([]).length>=20);
assert(discoverQuery({id:'Q38',name:'Italia'}).includes('Q38'));
assert(discoveredClubs([{club:{value:'http://www.wikidata.org/entity/Q1422'},clubLabel:{value:'Juventus'}}],{name:'Italia'}).length===1);
assert(CLUBS.length===1);
for(const c of CLUBS){assert(/Q\d+/.test(c.id));assert(queryFor(c).includes(`wd:${c.id}`));assert(queryFor(c).includes('LIMIT 450'))}
function row(id,name,year,city,country){return {person:{value:`http://www.wikidata.org/entity/${id}`},personLabel:{value:name},birth:{value:`${year}-01-01T00:00:00Z`},cityLabel:{value:city},countryLabel:{value:country}}}
const mock=[{club:CLUBS[0],bindings:[row('Q10001','Marco Rossi',1980,'Torino','Italia'),row('Q10002','Pedro Costa',1985,'Porto','Portogallo'),row('Q10003','Luca Bianchi',1990,'Milano','Italia'),row('Q10004','Jean Martin',1995,'Parigi','Francia'),row('Q10005','Hans Müller',1982,'Monaco','Germania'),row('Q10006','John Smith',1988,'Londra','Regno Unito')]}];
assert.equal(rowsFrom({results:{bindings:mock[0].bindings}}).length,6);
const q=makeQuestions(mock);assert(q.length>=12);
for(const x of q){assert.equal(x.options.length,3);assert.equal(new Set(x.options).size,3);assert(x.answer>=0&&x.answer<=2);assert(x.options[x.answer]);assert(x.source.startsWith('https://www.wikidata.org/wiki/Q'));assert(x.category==='Calciatori nel mondo')}
assert.equal(new Set(q.map(x=>x.question)).size,q.length);
const official=require('../official-questions.json');assert.equal(official.length,67);
console.log(`TEST OK: ${CLUBS.length} club, ${q.length} domande simulate, ${official.length} storiche esistenti.`);
