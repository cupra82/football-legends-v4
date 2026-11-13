'use strict';
const assert=require('assert');const {parseClubs,fromClubRecords,fromCoachFacts}=require('./build-v410-world');const {champion}=require('./build-v410-champions');
const rows=parseClubs('= England\nArsenal FC, 1886, @ Emirates Stadium, London\nChelsea FC, 1905, @ Stamford Bridge, London\nManchester United FC, 1878, @ Old Trafford, Manchester\n', 'https://example.org/clubs');
assert.equal(rows.length,3);const quiz=fromClubRecords(rows);assert(quiz.length>=4);for(const q of quiz){assert.equal(q.options.length,3);assert.equal(new Set(q.options).size,3);assert(q.answer>=0&&q.answer<3);assert(q.explanation&&q.source)}
const managers=fromCoachFacts([{clubId:'Q1',club:'Real Madrid',coachId:'Q10',coach:'Carlo Ancelotti'},{clubId:'Q2',club:'Juventus',coachId:'Q11',coach:'Massimiliano Allegri'},{clubId:'Q3',club:'Liverpool',coachId:'Q12',coach:'Jürgen Klopp'}]);assert.equal(managers.length,3);assert.equal(champion([]),null);
const played=[];for(let i=0;i<20;i++)for(let j=0;j<20;j++)if(i!==j)played.push({team1:'T'+i,team2:'T'+j,score:{ft:[i===0?2:0,j===0?2:0]}});
assert.equal(champion(played).winner,'T0'); // reconstructed from a complete fixture list
console.log('V4.1.0 tests passed:',quiz.length,'club examples +',managers.length,'manager examples');
