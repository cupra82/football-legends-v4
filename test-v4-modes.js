'use strict';
// Lightweight protocol smoke: no DB required, fake account lookup; executes an entire 4-player knockout.
const {EventEmitter}=require('events');
const crypto=require('crypto');
const v4=require('./v4-competitive');
class Socket extends EventEmitter{
 constructor(){super();this.readyState=1;this.messages=[];this.onMessage=null}
 send(raw){const x=JSON.parse(raw);this.messages.push(x);if(this.onMessage)this.onMessage(x)}
 msg(x){this.emit('message',JSON.stringify(x))}
}
async function run(){
 const hub=new EventEmitter(),users={};for(let i=0;i<4;i++)users['test'+i]={id:(i+1).toString(16).padStart(32,'0'),nickname:'User'+i};
 const bank=Array.from({length:50},(_,i)=>({id:'v4test'+i,category:'Mondiali',question:'Domanda test '+i,options:['Corretto','Alternativa B','Alternativa C'],answer:0}));
 await v4.init({wss:hub,accounts:{authenticate:async token=>users[token]||null},bank:()=>bank,topics:{valid:()=>true,matches:()=>true}});
 const players=Array.from({length:4},()=>new Socket());players.forEach(s=>hub.emit('connection',s));
 const settle=()=>new Promise(done=>setTimeout(done,30));
 players[0].msg({type:'v4t:create',size:4,token:'test0'});await settle();
 const code=players[0].messages.at(-1).code;if(!code)throw Error('Codice stanza non creato');
 for(let i=1;i<4;i++){players[i].msg({type:'v4t:join',code,token:'test'+i});await settle()}
 for(let i=1;i<4;i++)players[i].msg({type:'v4t:ready',ready:true});await settle();
 players[0].msg({type:'v4t:start'});await settle();
 if(!players.every(s=>s.messages.some(m=>m.type==='v4t:question')))throw Error('Prima domanda non inviata');
 const first=players[0].messages.find(m=>m.type==='v4t:question');if(!first||first.active.length!==4)throw Error('Giocatori attivi errati');
 // Answer by all participants; verifies server reveals and question index progresses.
 players.forEach(s=>{const q=s.messages.find(m=>m.type==='v4t:question');s.msg({type:'v4t:answer',index:q.options.indexOf('Corretto')})});await settle();
 if(!players.every(s=>s.messages.some(m=>m.type==='v4t:reveal')))throw Error('Reveal non inviato');
 players.forEach(s=>s.emit('close'));
 console.log('PASS V4: stanze, 4 partecipanti, pronti, tabellone, domanda, risposte e reveal.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
