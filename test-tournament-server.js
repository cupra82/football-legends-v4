'use strict';
const assert=require('node:assert/strict'),EventEmitter=require('node:events');
const Module=require('node:module'),original=Module._load;
Module._load=function(name,...rest){if(name==='ws')return {OPEN:1};if(name==='pg')return {Pool:class {}};return original.call(this,name,...rest)};
const {init}=require('./v4-competitive');Module._load=original;
class FakeSocket extends EventEmitter{constructor(){super();this.readyState=1;this.sent=[]}send(x){this.sent.push(JSON.parse(x))}last(t){return [...this.sent].reverse().find(x=>x.type===t)}}
const bank=Array.from({length:75},(_,i)=>({id:i+1,question:'Domanda numero '+i,category:'Mondiali',options:['A','B','C'],answer:0}));
const wss=new EventEmitter(),accounts={authenticate:async token=>({id:String(token).padStart(32,'0'),nickname:'Giocatore '+token})};
async function msg(s,x){s.emit('message',JSON.stringify(x));await new Promise(r=>setTimeout(r,5))}
async function test(n,format){
 const sockets=[];for(let i=0;i<n;i++){const s=new FakeSocket();wss.emit('connection',s);sockets.push(s)}
 await msg(sockets[0],{type:'v4t:create',size:n,format,total:10,token:1});const code=sockets[0].last('v4t:lobby').code;
 for(let i=1;i<n;i++)await msg(sockets[i],{type:'v4t:join',code,token:i+1});
 for(let i=1;i<n;i++)await msg(sockets[i],{type:'v4t:ready',ready:true});
 assert.equal(sockets[0].last('v4t:lobby').players.length,n);
 await msg(sockets[0],{type:'v4t:start'});
 const round=sockets[0].last('v4t:round');assert(round,`round ${n}`);
 const all=[...round.pairs.flat(),...round.byes];assert.equal(new Set(all).size,round.pairs.length*2+round.byes.length);
 assert(round.pairs.length>0);console.log('OK initial round',n,format,round.stage,round.pairs.length,'matches',round.byes.length,'byes');
 // Disconnect all; closes the tournament before its scheduled question.
 sockets[0].emit('close');
}
(async()=>{await init({wss,accounts,bank:()=>bank,topics:{valid:()=>true,matches:()=>true}});for(const [n,f] of [[2,'auto'],[3,'auto'],[4,'auto'],[6,'auto'],[8,'auto'],[10,'auto'],[12,'league'],[7,'knockout']])await test(n,f);console.log('PASS: protocollo multiplayer tornei 2–12')})().catch(e=>{console.error(e);process.exitCode=1});
