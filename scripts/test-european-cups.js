'use strict';
const assert=require('assert');const {parse,buildSeason,stageFromLine}=require('./build-european-cups');
const example=`= UEFA Champions League 2023/24
▪ Group, Matchday 1
AC Milan (ITA) v Newcastle United FC (ENG) 0-0
BSC Young Boys (SUI) v RB Leipzig (GER) 1-3
▪ Finals, Round of 16
Paris Saint-Germain FC (FRA) v Real Sociedad de Fútbol (ESP) 2-0
Real Sociedad de Fútbol (ESP) v Paris Saint-Germain FC (FRA) 1-2
▪ Finals, Quarterfinals
Arsenal FC (ENG) v FC Bayern München (GER) 2-2
Real Madrid CF (ESP) v Manchester City FC (ENG) 3-3
Club Atlético de Madrid (ESP) v Borussia Dortmund (GER) 2-1
Paris Saint-Germain FC (FRA) v FC Barcelona (ESP) 2-3
▪ Finals, Semifinals
FC Bayern München (GER) v Real Madrid CF (ESP) 2-2
Borussia Dortmund (GER) v Paris Saint-Germain FC (FRA) 1-0
▪ Finals, Final
Borussia Dortmund (GER) v Real Madrid CF (ESP) 0-2`;
const parsed=parse(example);assert(parsed.allTeams.includes('Manchester City FC'));assert.strictEqual(parsed.matchRows.length,9);assert.strictEqual(stageFromLine('Finals, Quarterfinals'),'quarti di finale');assert.strictEqual(stageFromLine('Finals, Final'),'finale');
const rows=buildSeason({s:'2023-24',type:'cl',name:'Champions League'},example);assert(rows.length>=4,`Too few ${rows.length}`);
for(const r of rows){assert(r.question&&r.options.length===3&&new Set(r.options).size===3&&r.options[r.answer]&&r.source&&r.category==='Champions League');}
assert(rows.some(r=>r.question.includes('Real Madrid CF')));
console.log('Test coppe europee: '+rows.length+' domande verificate sui dati sintetici di test.');
