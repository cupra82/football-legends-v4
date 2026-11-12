'use strict';
const assert=require('node:assert/strict');const f=require('./tournament-formats');
function people(n){return Array.from({length:n},(_,i)=>({acc:{id:String(i),nickname:'Player '+i},seed:i,points:0,correct:0,elapsed:0}))}
for(let n=2;n<=12;n++){
 for(const mode of ['auto','knockout','league'])assert.deepEqual(f.validate(n,mode,10),{size:n,format:mode,total:10});
 const all=people(n),rr=f.roundRobin(all);const seen=new Set();
 for(const wave of rr){const used=new Set();for(const [a,b] of wave){assert.notEqual(a,b);assert(!used.has(a));assert(!used.has(b));used.add(a);used.add(b);const k=[a.seed,b.seed].sort((x,y)=>x-y).join('-');assert(!seen.has(k));seen.add(k)}}
 assert.equal(seen.size,n*(n-1)/2,`RR ${n}`);
 let players=all,passes=0;
 while(players.length>1){const {matches,byes}=f.knockoutWave(players);assert.equal(new Set([...matches.flat(),...byes]).size,players.length,`KO unique ${n}`);const winners=matches.map(pair=>pair[0]);players=[...byes,...winners];passes++;assert(passes<5,`KO ends ${n}`)}
 assert.equal(players.length,1);
}
for(let n=9;n<=12;n++){
 const groups=f.splitGroups(people(n)),waves=f.groupWaves(groups);const count=waves.reduce((sum,w)=>sum+w.length,0);
 assert.equal(count,groups.reduce((sum,g)=>sum+g.length*(g.length-1)/2,0));
}
assert.throws(()=>f.validate(13,'auto',10));assert.throws(()=>f.validate(2,'random',10));assert.throws(()=>f.validate(2,'auto',42));
assert.equal(f.formatFor(6,'auto'),'league-playoff');assert.equal(f.formatFor(10,'auto'),'groups');assert.equal(f.formatFor(8,'auto'),'knockout');
console.log('OK: 2–12 giocatori, gironi completi, gruppi, KO e bye senza esclusioni');
