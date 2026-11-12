'use strict';
// Tournament schedule and rankings, independent from network / database.
function validate(size, format, total){
 size=Number(size);total=Number(total);
 if(!Number.isInteger(size)||size<2||size>12)throw Error('Scegli da 2 a 12 partecipanti.');
 if(!['auto','league','knockout'].includes(format))throw Error('Formato torneo non valido.');
 if(![10,15,20,30].includes(total))throw Error('Durata partita non valida.');
 return {size,format,total};
}
function formatFor(size,format){return format==='auto'?(size===2||size===4||size===8?'knockout':size>=9?'groups':'league-playoff'):format}
function roundRobin(players){
 const group=[...players];if(group.length%2)group.push(null);
 const n=group.length, fixed=group[0], rotating=group.slice(1),rounds=[];
 for(let k=0;k<n-1;k++){
  const arr=[fixed,...rotating],matches=[];
  for(let i=0;i<n/2;i++)if(arr[i]&&arr[n-1-i])matches.push([arr[i],arr[n-1-i]]);
  rounds.push(matches);rotating.unshift(rotating.pop());
 }
 return rounds;
}
function groupWaves(groups){
 const rr=groups.map(g=>roundRobin(g));const waves=[];
 for(let i=0;i<Math.max(...rr.map(x=>x.length));i++)waves.push(rr.flatMap(x=>x[i]||[]));
 return waves;
}
function splitGroups(players){
 const a=[],b=[];players.forEach((p,i)=>(i%2===0?a:b).push(p));return [a,b];
}
function knockoutWave(players){
 // A power-of-two bracket with explicit byes, so no friends are excluded.
 const target=2**Math.floor(Math.log2(players.length));
 const matchesNeeded=players.length===target?players.length/2:players.length-target,byes=players.length===target?0:target-matchesNeeded;
 const matches=[];for(let i=0;i<matchesNeeded;i++)matches.push([players[byes+i*2],players[byes+i*2+1]]);
 return {matches,byes:players.slice(0,byes)};
}
function chooseWinner(a,b){
 if(a.points!==b.points)return a.points>b.points?a:b;
 if(a.correct!==b.correct)return a.correct>b.correct?a:b;
 if(a.elapsed!==b.elapsed)return a.elapsed<b.elapsed?a:b;
 // Tie resolution deterministic for the match. Seeds were shuffled at tournament creation.
 return a.seed<b.seed?a:b;
}
function standings(players,records){
 return players.map(p=>{const s=records.get(p.acc.id)||{wins:0,played:0,points:0,correct:0,score:0};return {player:p,wins:s.wins,played:s.played,points:s.points,correct:s.correct,score:s.score}})
 .sort((a,b)=>b.points-a.points||b.wins-a.wins||b.score-a.score||b.correct-a.correct||a.player.seed-b.player.seed);
}
module.exports={validate,formatFor,roundRobin,groupWaves,splitGroups,knockoutWave,chooseWinner,standings};
