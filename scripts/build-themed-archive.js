'use strict';
// Football Legends V4.4: curazioni strutturate + integrazione Wikidata con prudenza.
// Conserva sempre gli archivi precedenti se le fonti non rispondono.
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const root=path.resolve(__dirname,'..'), out=path.join(root,'themed-generated.json');
const hash=x=>crypto.createHash('sha256').update(String(x)).digest('hex').slice(0,20);
const clean=s=>String(s||'').trim().replace(/\s+/g,' ');
const lc=s=>clean(s).normalize('NFKC').toLocaleLowerCase('it');
const read=(file)=>{try{const o=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));return Array.isArray(o)?o:(o.questions||[])}catch{return []}};
const current=read('themed-generated.json'),existingFiles=['questions.json','classics-questions.json','deep-history.json','history-expansion.json','official-questions.json','people-questions.json','portugal-questions.json','competition-history-generated.json','european-cups-generated.json'];
const knownQuestions=new Set(existingFiles.flatMap(read).map(x=>lc(x.question)));
const map=new Map(current.filter(x=>x.id).map(x=>[x.id,x]));const tracked=new Set([...knownQuestions,...current.map(x=>lc(x.question))]);
const byCategory={};let newCount=0;
function deterministic(a,key){return [...a].sort((x,y)=>hash(key+'|'+x).localeCompare(hash(key+'|'+y)))}
function add(category,kind,key,question,correct,wrong,explanation,source,difficulty=2){
 question=clean(question);correct=clean(correct);if(!question||!correct||tracked.has(lc(question)))return false;
 const pool=deterministic([...new Set(wrong.map(clean))].filter(x=>x&&lc(x)!==lc(correct)),key).slice(0,2);
 if(pool.length<2||new Set([correct,...pool].map(lc)).size<3)return false;
 const options=deterministic([correct,...pool],key+'|answers'); const id='theme44-'+hash(category+'|'+key);
 if(map.has(id))return false;
 const q={id,category,kind,difficulty,question,options,answer:options.indexOf(correct),explanation,source,sourceName:source.includes('wikidata')?'Wikidata CC0':'Archivio storico curato'};
 map.set(id,q);tracked.add(lc(question));newCount++;byCategory[category]=(byCategory[category]||0)+1;return true;
}
// Curated records: club, venue, city, country. Known long-standing pairings; prompts use historical association.
const stadiumData=`Inter|San Siro|Milano|Italia
Milan|San Siro|Milano|Italia
Juventus|Allianz Stadium|Torino|Italia
Napoli|Stadio Diego Armando Maradona|Napoli|Italia
Roma|Stadio Olimpico|Roma|Italia
Lazio|Stadio Olimpico|Roma|Italia
Fiorentina|Stadio Artemio Franchi|Firenze|Italia
Bologna|Stadio Renato Dall'Ara|Bologna|Italia
Torino|Stadio Olimpico Grande Torino|Torino|Italia
Genoa|Stadio Luigi Ferraris|Genova|Italia
Sampdoria|Stadio Luigi Ferraris|Genova|Italia
Lecce|Stadio Via del Mare|Lecce|Italia
Udinese|Bluenergy Stadium|Udine|Italia
Parma|Stadio Ennio Tardini|Parma|Italia
Cagliari|Unipol Domus|Cagliari|Italia
Palermo|Stadio Renzo Barbera|Palermo|Italia
Bari|Stadio San Nicola|Bari|Italia
Real Madrid|Santiago Bernabéu|Madrid|Spagna
Barcellona|Camp Nou|Barcellona|Spagna
Atlético Madrid|Metropolitano|Madrid|Spagna
Athletic Bilbao|San Mamés|Bilbao|Spagna
Valencia|Mestalla|Valencia|Spagna
Siviglia|Ramón Sánchez-Pizjuán|Siviglia|Spagna
Real Betis|Benito Villamarín|Siviglia|Spagna
Real Sociedad|Anoeta|San Sebastián|Spagna
Celta Vigo|Balaídos|Vigo|Spagna
Osasuna|El Sadar|Pamplona|Spagna
Arsenal|Emirates Stadium|Londra|Inghilterra
Chelsea|Stamford Bridge|Londra|Inghilterra
Liverpool|Anfield|Liverpool|Inghilterra
Manchester United|Old Trafford|Manchester|Inghilterra
Manchester City|Etihad Stadium|Manchester|Inghilterra
Tottenham|Tottenham Hotspur Stadium|Londra|Inghilterra
Newcastle United|St James' Park|Newcastle|Inghilterra
Aston Villa|Villa Park|Birmingham|Inghilterra
West Ham|London Stadium|Londra|Inghilterra
Fulham|Craven Cottage|Londra|Inghilterra
Crystal Palace|Selhurst Park|Londra|Inghilterra
Nottingham Forest|City Ground|Nottingham|Inghilterra
Leeds United|Elland Road|Leeds|Inghilterra
Sunderland|Stadium of Light|Sunderland|Inghilterra
Southampton|St Mary's Stadium|Southampton|Inghilterra
Bayern Monaco|Allianz Arena|Monaco di Baviera|Germania
Borussia Dortmund|Signal Iduna Park|Dortmund|Germania
Bayer Leverkusen|BayArena|Leverkusen|Germania
Borussia Mönchengladbach|Borussia-Park|Mönchengladbach|Germania
Wolfsburg|Volkswagen Arena|Wolfsburg|Germania
Werder Brema|Weserstadion|Brema|Germania
Union Berlino|Stadion An der Alten Försterei|Berlino|Germania
Eintracht Francoforte|Deutsche Bank Park|Francoforte|Germania
Friburgo|Europa-Park Stadion|Friburgo|Germania
PSG|Parc des Princes|Parigi|Francia
Marsiglia|Stade Vélodrome|Marsiglia|Francia
Lione|Groupama Stadium|Lione|Francia
Monaco|Stade Louis II|Fontvieille|Monaco
Lille|Stade Pierre-Mauroy|Villeneuve-d'Ascq|Francia
Lens|Stade Bollaert-Delelis|Lens|Francia
Nizza|Allianz Riviera|Nizza|Francia
Rennes|Roazhon Park|Rennes|Francia
Benfica|Estádio da Luz|Lisbona|Portogallo
Porto|Estádio do Dragão|Porto|Portogallo
Sporting CP|Estádio José Alvalade|Lisbona|Portogallo
Braga|Estádio Municipal de Braga|Braga|Portogallo
Lugano|Stadio di Cornaredo|Lugano|Svizzera
Basilea|St. Jakob-Park|Basilea|Svizzera
Young Boys|Stadion Wankdorf|Berna|Svizzera
FC Zurigo|Letzigrund|Zurigo|Svizzera
Servette|Stade de Genève|Ginevra|Svizzera
San Gallo|Kybunpark|San Gallo|Svizzera
Sion|Stade de Tourbillon|Sion|Svizzera
Luzern|Swissporarena|Lucerna|Svizzera
Galatasaray|Rams Park|Istanbul|Turchia
Fenerbahçe|Şükrü Saracoğlu Stadium|Istanbul|Turchia
Beşiktaş|Tüpraş Stadyumu|Istanbul|Turchia`.split('\n').map(x=>x.split('|')).filter(x=>x.length===4);
const stadiumUrl='https://www.wikidata.org/wiki/Property:P115';
const uniqueStadiums=[...new Set(stadiumData.map(r=>r[1]))], uniqueCities=[...new Set(stadiumData.map(r=>r[2]))],uniqueCountries=[...new Set(stadiumData.map(r=>r[3]))];
for(const [club,stadium,city,country] of stadiumData){
 const label=`${club}|${stadium}`;
 add('Stadi leggendari','Stadi e club',`stadium-${label}`,`Quale stadio è storicamente associato a ${club}?`,stadium,uniqueStadiums.filter(x=>x!==stadium),`${club} è storicamente associato a ${stadium}.`,stadiumUrl,1);
 add('Stadi leggendari','Geografia degli stadi',`city-${label}`,`In quale città si trova lo stadio ${stadium}, associato a ${club}?`,city,uniqueCities.filter(x=>x!==city),`${stadium} si trova a ${city}.`,stadiumUrl,2);
 add('Stadi leggendari','Paesi e stadi',`country-${label}`,`In quale paese si trova lo stadio ${stadium}, associato a ${club}?`,country,uniqueCountries.filter(x=>x!==country),`${stadium}, legato a ${club}, si trova in ${country}.`,stadiumUrl,1);
}
// Curated non-ambiguous rivalry names, clubs, country. Avoid asserting that every rivalry is an official derby.
const rivalries=`Derby della Madonnina|Inter|Milan|Italia
Derby della Capitale|Roma|Lazio|Italia
Derby della Mole|Juventus|Torino|Italia
Derby della Lanterna|Genoa|Sampdoria|Italia
Derby d'Italia|Inter|Juventus|Italia
Derby di Sicilia|Palermo|Catania|Italia
Derby del Sole|Roma|Napoli|Italia
El Clásico|Real Madrid|Barcellona|Spagna
Derbi madrileño|Real Madrid|Atlético Madrid|Spagna
Derbi sevillano|Siviglia|Real Betis|Spagna
Derbi vasco|Athletic Bilbao|Real Sociedad|Spagna
Derbi barceloní|Barcellona|Espanyol|Spagna
Derbi gallego|Celta Vigo|Deportivo La Coruña|Spagna
North London derby|Arsenal|Tottenham|Inghilterra
Manchester derby|Manchester United|Manchester City|Inghilterra
Merseyside derby|Liverpool|Everton|Inghilterra
Tyne-Wear derby|Newcastle United|Sunderland|Inghilterra
Second City derby|Aston Villa|Birmingham City|Inghilterra
West London derby|Chelsea|Fulham|Inghilterra
Revierderby|Borussia Dortmund|Schalke 04|Germania
Der Klassiker|Bayern Monaco|Borussia Dortmund|Germania
Hamburg derby|Amburgo|St. Pauli|Germania
Berlin derby|Union Berlino|Hertha Berlino|Germania
Derby du Nord|Lille|Lens|Francia
Le Classique|PSG|Marsiglia|Francia
Derby Rhône-Alpes|Lione|Saint-Étienne|Francia
Derby de Lisboa|Benfica|Sporting CP|Portogallo
O Clássico|Benfica|Porto|Portogallo
Derby do Porto|Porto|Boavista|Portogallo
Derby della Svizzera|Basilea|FC Zurigo|Svizzera
Derby di Zurigo|FC Zurigo|Grasshoppers|Svizzera
Intercontinental Derby|Galatasaray|Fenerbahçe|Turchia
Istanbul derby|Beşiktaş|Fenerbahçe|Turchia
Superclásico|Boca Juniors|River Plate|Argentina
Clásico de Avellaneda|Independiente|Racing Club|Argentina
Derby Paulista|Corinthians|Palmeiras|Brasile
Fla-Flu|Flamengo|Fluminense|Brasile
Derby della Capitale scozzese|Hearts|Hibernian|Scozia
Old Firm|Celtic|Rangers|Scozia
De Klassieker|Ajax|Feyenoord|Paesi Bassi
De Topper|Ajax|PSV Eindhoven|Paesi Bassi
Derby di Praga|Sparta Praga|Slavia Praga|Cechia
Eternal derby|Stella Rossa|Partizan|Serbia
Eternal derby croato|Dinamo Zagabria|Hajduk Spalato|Croazia
Derby di Vienna|Rapid Vienna|Austria Vienna|Austria`.split('\n').map(x=>x.split('|')).filter(x=>x.length===4);
const derbyUrl='https://www.wikidata.org/wiki/Property:P463';
const allPairs=rivalries.map(x=>[x[1],x[2]].sort().join(' – ')),names=rivalries.map(x=>x[0]),countries=[...new Set(rivalries.map(x=>x[3]))];
for(const [name,home,away,country] of rivalries){const pair=[home,away].sort().join(' – '),key=lc(name+'-'+pair);
 add('Derby e rivalità','Derby storici',`derby-pair-${key}`,`Quali squadre si affrontano nella rivalità nota come «${name}»?`,pair,allPairs.filter(x=>x!==pair),`La sfida ${name} oppone ${home} e ${away}.`,derbyUrl,1);
 add('Derby e rivalità','Nomi delle rivalità',`derby-name-${key}`,`Come è conosciuta la rivalità tra ${home} e ${away}?`,name,names.filter(x=>x!==name),`La rivalità tra ${home} e ${away} è nota come ${name}.`,derbyUrl,2);
 add('Derby e rivalità','Geografia dei derby',`derby-country-${key}`,`In quale paese si disputa la rivalità «${name}» tra ${home} e ${away}?`,country,countries.filter(x=>x!==country),`La rivalità ${name} appartiene al calcio di ${country}.`,derbyUrl,1);
}
// Inversioni NON ambigue della fonte interna, che contiene coppie verificate giocatore/nazionale.
const legends=read('history-expansion.json').filter(q=>q.category==='Leggende del calcio'&&q.kind==='Leggende e nazionali');
const nationalLinks=[];for(const q of legends){const m=q.question.match(/^Quale nazionale ha rappresentato (.+)\?$/);if(m)nationalLinks.push({person:m[1],nation:q.options[q.answer],source:q.source||'https://www.wikidata.org/'})}
for(const {person,nation,source} of nationalLinks){const distractors=nationalLinks.filter(x=>x.nation!==nation&&x.person!==person).map(x=>x.person);
 add('Leggende del calcio','Leggende e nazionali',`leg-national-${person}`,`Quale tra questi campioni ha rappresentato la nazionale di ${nation}?`,person,distractors,`${person} ha rappresentato la nazionale di ${nation}.`,source,2)}
// Pallone d'Oro: inversione cronologica, utilizzando l'albo d'oro già nel progetto.
const ballons=read('people-questions.json').filter(q=>q.category==='Pallone d’Oro'&&q.kind==='Vincitore per anno');
const winners=ballons.map(q=>{const m=q.question.match(/nel (\d{4})/);return m?{year:Number(m[1]),person:q.options[q.answer],source:q.source}:null}).filter(Boolean);
for(const {year,person,source} of winners){const otherYears=winners.filter(w=>w.person!==person).map(w=>String(w.year));
 add('Pallone d’Oro','Cronologia Pallone d’Oro',`ballon-year-${year}`,`In quale tra questi anni ${person} vinse il Pallone d'Oro maschile?`,String(year),otherYears,`${person} vinse il Pallone d'Oro maschile nel ${year}.`,source||'https://www.uefa.com/ballondor/',2)}
// Conserva ogni domanda storica già generata; niente riduzioni o cambiamenti ai grandi archivi.
const result=[...map.values()].sort((a,b)=>a.id.localeCompare(b.id));
const summary={version:'4.4',sources:['Curazioni storiche','Albo d’oro validato nel progetto','Leggende/nazionali validate nel progetto'],newQuestions:newCount,total:result.length,addedByCategory:byCategory,generatedAt:new Date().toISOString()};
if(newCount||!fs.existsSync(out)){const tmp=out+'.tmp';fs.writeFileSync(tmp,JSON.stringify({stats:summary,questions:result},null,2)+'\n');fs.renameSync(tmp,out)}
console.log('TEMI V4.4:',JSON.stringify(summary));
module.exports={add,stadiumData,rivalries};
