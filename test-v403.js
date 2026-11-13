'use strict';
// Minimal isolated tests of V4.0.3 persistence wiring with mocked PostgreSQL.
const assert=require('assert');
const Module=require('module');
const original=Module._load;
const statements=[];
const fakeClient={
  async query(sql,args=[]){statements.push([sql,args]);if(sql.includes('INSERT INTO fl403_rounds'))return {rowCount:1,rows:[{id:args[0]}]};if(sql.startsWith('SELECT COUNT(*)'))return {rows:[{games:1,wins:1}]};if(sql.includes('fl403_category_totals')&&sql.startsWith('SELECT'))return {rows:[{category:'Mondiali',answered:2,correct:1}]};if(sql.includes('fl403_rivalries')&&sql.startsWith('SELECT'))return {rows:[{opponent:'Amico',games:1,wins:1,losses:0,ties:0}]};if(sql.includes('fl403_trophies')&&sql.startsWith('SELECT'))return {rows:[{trophy:'debutto-arena'}]};return {rows:[],rowCount:1}},
  release(){}
};
class FakePool{on(){}async query(...args){return fakeClient.query(...args)}async connect(){return fakeClient}}
Module._load=function(name,parent,isMain){if(name==='pg')return {Pool:FakePool};return original.apply(this,arguments)};
process.env.DATABASE_URL='postgres://test:test@localhost/test';process.env.FL_V4_DB_ISOLATED='YES';
const insights=require('./v403-insights');
Module._load=original;
const id1='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',id2='bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
function response(){return {statusCode:0,headers:{},body:'',writeHead(code,headers){this.statusCode=code;this.headers=headers},end(str){this.body=str||''}}}
function req(body){return {method:'POST',headers:{host:'local.test',origin:'https://local.test'},async *[Symbol.asyncIterator](){yield Buffer.from(JSON.stringify(body))}}}
(async()=>{
 await insights.init();
 const players=[{id:id1,name:'Peppo',score:1200,categoryStats:{Mondiali:{answered:2,correct:1}}},{id:id2,name:'Amico',score:800,categoryStats:{Mondiali:{answered:2,correct:0}}}];
 assert.equal(await insights.recordRound('00000000-0000-4000-8000-000000000001',players),true);
 assert(statements.some(([sql])=>sql.includes('INSERT INTO fl403_rivalries')));
 assert(statements.some(([sql])=>sql.includes('INSERT INTO fl403_category_totals')));
 const acc={authenticate:async token=>token==='valid'?{id:id1,nickname:'Peppo'}:null};
 let res=response();await insights.handle(req({token:'valid'}),res,'/api/v403/profile',acc,()=>[]);assert.equal(res.statusCode,200);const data=JSON.parse(res.body);assert.equal(data.categories[0].category,'Mondiali');
 res=response();await insights.handle(req({token:'valid',questionId:'Q1',reason:'ambigua',comment:'Due risposte corrette'}),res,'/api/v403/report',acc,()=>[{id:'Q1',question:'Domanda di prova'}]);assert.equal(res.statusCode,200);
 res=response();await insights.handle(req({token:'invalid',questionId:'Q1',reason:'ambigua'}),res,'/api/v403/report',acc,()=>[]);assert.equal(res.statusCode,401);
 assert.equal(await insights.award(id1,'campione-torneo'),true);
 console.log('OK: 4.0.3 schema, rivalità, categorie, trofei, segnalazioni e autenticazione');
})().catch(e=>{console.error(e);process.exitCode=1});
