'use strict';
// Human-reviewed historical facts with linked official UEFA/FIFA archive pages.
// No scraping, no copying article text, no undocumented API endpoints.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.join(__dirname,'..');
const SOURCES={
 champions:'https://www.uefa.com/uefachampionsleague/history/',
 euros:'https://www.uefa.com/uefaeuro/history/',
 world:'https://www.archives.fifa.com/fifa_world_cup'
};
// UEFA Champions League, editions from 1992/93 to 2019/20 (historic seasons).
const champions=[
 ['1992/93','Marsiglia'],['1993/94','Milan'],['1994/95','Ajax'],['1995/96','Juventus'],
 ['1996/97','Borussia Dortmund'],['1997/98','Real Madrid'],['1998/99','Manchester United'],
 ['1999/00','Real Madrid'],['2000/01','Bayern Monaco'],['2001/02','Real Madrid'],
 ['2002/03','Milan'],['2003/04','Porto'],['2004/05','Liverpool'],['2005/06','Barcellona'],
 ['2006/07','Milan'],['2007/08','Manchester United'],['2008/09','Barcellona'],
 ['2009/10','Inter'],['2010/11','Barcellona'],['2011/12','Chelsea'],['2012/13','Bayern Monaco'],
 ['2013/14','Real Madrid'],['2014/15','Barcellona'],['2015/16','Real Madrid'],
 ['2016/17','Real Madrid'],['2017/18','Real Madrid'],['2018/19','Liverpool'],['2019/20','Bayern Monaco']
];
const euros=[
 [1960,'Unione Sovietica'],[1964,'Spagna'],[1968,'Italia'],[1972,'Germania Ovest'],
 [1976,'Cecoslovacchia'],[1980,'Germania Ovest'],[1984,'Francia'],[1988,'Paesi Bassi'],
 [1992,'Danimarca'],[1996,'Germania'],[2000,'Francia'],[2004,'Grecia'],
 [2008,'Spagna'],[2012,'Spagna'],[2016,'Portogallo'],[2020,'Italia'],[2024,'Spagna']
];
const world=[
 [1930,'Uruguay'],[1934,'Italia'],[1938,'Italia'],[1950,'Uruguay'],[1954,'Germania Ovest'],
 [1958,'Brasile'],[1962,'Brasile'],[1966,'Inghilterra'],[1970,'Brasile'],[1974,'Germania Ovest'],
 [1978,'Argentina'],[1982,'Italia'],[1986,'Argentina'],[1990,'Germania Ovest'],
 [1994,'Brasile'],[1998,'Francia'],[2002,'Brasile'],[2006,'Italia'],[2010,'Spagna'],
 [2014,'Germania'],[2018,'Francia'],[2022,'Argentina']
];
function hash(s){return crypto.createHash('sha256').update(s).digest('hex').slice(0,16)}
function order(list,key){return [...list].sort((a,b)=>hash(key+'|'+a).localeCompare(hash(key+'|'+b)))}
function build(){const all=[];for(const [kind,data,category,uri,stem] of [
 ['Champions League',champions,'Champions League',SOURCES.champions,'Quale club vinse la Champions League nella stagione'],
 ['Europei',euros,'Europei',SOURCES.euros,'Quale nazionale vinse il Campionato Europeo del'],
 ['Mondiali',world,'Mondiali',SOURCES.world,'Quale nazionale vinse il Mondiale maschile del']]){
 const winners=[...new Set(data.map(x=>x[1]))];
 for(const [season,winner] of data){const wrong=order(winners.filter(x=>x!==winner),kind+season).slice(0,2);if(wrong.length!==2)continue;
 const options=order([winner,...wrong],kind+'answer'+season);
 all.push({id:'official-'+hash(kind+'|'+season),category,kind:'Albi d’oro ufficiali',difficulty:2,
 question:`${stem} ${season}?`,options,answer:options.indexOf(winner),
 explanation:`${winner} vinse l’edizione ${season}. Fonte storica: archivio ufficiale ${kind==='Mondiali'?'FIFA':'UEFA'}.`,source:uri,sourceName:kind==='Mondiali'?'FIFA':'UEFA',verifiedEdition:String(season)});
 }}return all}
const questions=build();const out=path.join(ROOT,'official-questions.json');
if(process.argv.includes('--check')){const existing=JSON.parse(fs.readFileSync(out,'utf8'));if(JSON.stringify(existing)!==JSON.stringify(questions))throw new Error('Fonti ufficiali modificate: rigenerare e riesaminare il dataset');}
else fs.writeFileSync(out,JSON.stringify(questions,null,2)+'\n');
console.log(JSON.stringify({officialQuestions:questions.length,champions:champions.length,euros:euros.length,world:world.length,mode:process.argv.includes('--check')?'verified':'generated'}));
module.exports={build};
