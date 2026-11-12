'use strict';
// Dati storici curati; nuove domande create da relazioni univoche, senza scraping.
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,18);
const deterministic=(array,seed)=>[...array].sort((a,b)=>hash(seed+'|'+a).localeCompare(hash(seed+'|'+b)));
const output=[], unique=new Set();
function put(category,kind,question,correct,others,explanation,source,difficulty=2){
 const key=question.toLowerCase().replace(/[^a-z0-9à-ÿ]/g,'');if(unique.has(key))return;
 const pool=[...new Set(others.filter(a=>a!==correct))];if(pool.length<2)return;
 const options=deterministic([correct,...deterministic(pool,question).slice(0,2)],question+'|options');
 unique.add(key);output.push({id:'history-'+hash(question),category,kind,difficulty,question,options,answer:options.indexOf(correct),explanation,source,sourceName:'Archivio storico'});
}
const FIFA='https://www.fifa.com/tournaments/mens/worldcup';
const UEFA='https://www.uefa.com/uefachampionsleague/history/';
const EURO='https://www.uefa.com/uefaeuro/history/';
const FRANCE='https://www.francefootball.fr/ballon-d-or/palmares/';
const STAD='https://www.wikidata.org/';
// Anno, campione, finalista, sede. Nel 1950 non ci fu una finale ufficiale (girone finale).
const wc=[
[1930,'Uruguay','Argentina','Uruguay'],[1934,'Italia','Cecoslovacchia','Italia'],[1938,'Italia','Ungheria','Francia'],
[1950,'Uruguay','Brasile','Brasile'],[1954,'Germania Ovest','Ungheria','Svizzera'],[1958,'Brasile','Svezia','Svezia'],
[1962,'Brasile','Cecoslovacchia','Cile'],[1966,'Inghilterra','Germania Ovest','Inghilterra'],[1970,'Brasile','Italia','Messico'],
[1974,'Germania Ovest','Paesi Bassi','Germania Ovest'],[1978,'Argentina','Paesi Bassi','Argentina'],[1982,'Italia','Germania Ovest','Spagna'],
[1986,'Argentina','Germania Ovest','Messico'],[1990,'Germania Ovest','Argentina','Italia'],[1994,'Brasile','Italia','Stati Uniti'],
[1998,'Francia','Brasile','Francia'],[2002,'Brasile','Germania','Corea del Sud e Giappone'],[2006,'Italia','Francia','Germania'],
[2010,'Spagna','Paesi Bassi','Sudafrica'],[2014,'Germania','Argentina','Brasile'],[2018,'Francia','Croazia','Russia'],
[2022,'Argentina','Francia','Qatar']
];
const nations=[...new Set(wc.flatMap(row=>row.slice(1,3)))];const hosts=[...new Set(wc.map(x=>x[3]))];
for(const [year,winner,runner,host] of wc){
 put('Mondiali','Finali mondiali',`Quale nazionale si classificò seconda al Mondiale maschile del ${year}?`,runner,nations,`Il ${year} vide il successo di ${winner} davanti a ${runner}.`,FIFA);
 put('Mondiali','Paesi ospitanti',`Quale paese (o coppia di paesi) ospitò il Mondiale maschile del ${year}?`,host,hosts,`L'edizione del ${year} si disputò in ${host}.`,FIFA,1);
}
// Europei: anno, vincitrice, finalista; esclusi risultati su finali inesistenti.
const euro=[
[1960,'Unione Sovietica','Jugoslavia'],[1964,'Spagna','Unione Sovietica'],[1968,'Italia','Jugoslavia'],
[1972,'Germania Ovest','Unione Sovietica'],[1976,'Cecoslovacchia','Germania Ovest'],[1980,'Germania Ovest','Belgio'],
[1984,'Francia','Spagna'],[1988,'Paesi Bassi','Unione Sovietica'],[1992,'Danimarca','Germania'],
[1996,'Germania','Repubblica Ceca'],[2000,'Francia','Italia'],[2004,'Grecia','Portogallo'],
[2008,'Spagna','Germania'],[2012,'Spagna','Italia'],[2016,'Portogallo','Francia'],
[2020,'Italia','Inghilterra'],[2024,'Spagna','Inghilterra']
];
const euroTeams=[...new Set(euro.flatMap(r=>r.slice(1)))];
for(const [year,winner,runner] of euro){
 put('Europei','Finali Europei',`Chi perse la finale degli Europei del ${year}?`,runner,euroTeams,`Gli Europei del ${year} furono vinti da ${winner}, finalista ${runner}.`,EURO);
 // I vincitori sono gia presenti in official-questions.json: non duplicarli.
}
// Champions League: finalisti storici 1993-2024. Si evitano stagioni recenti non consolidate.
const cl=[
[1993,'Marsiglia','Milan'],[1994,'Milan','Barcellona'],[1995,'Ajax','Milan'],[1996,'Juventus','Ajax'],
[1997,'Borussia Dortmund','Juventus'],[1998,'Real Madrid','Juventus'],[1999,'Manchester United','Bayern Monaco'],
[2000,'Real Madrid','Valencia'],[2001,'Bayern Monaco','Valencia'],[2002,'Real Madrid','Bayer Leverkusen'],
[2003,'Milan','Juventus'],[2004,'Porto','Monaco'],[2005,'Liverpool','Milan'],[2006,'Barcellona','Arsenal'],
[2007,'Milan','Liverpool'],[2008,'Manchester United','Chelsea'],[2009,'Barcellona','Manchester United'],
[2010,'Inter','Bayern Monaco'],[2011,'Barcellona','Manchester United'],[2012,'Chelsea','Bayern Monaco'],
[2013,'Bayern Monaco','Borussia Dortmund'],[2014,'Real Madrid','Atlético Madrid'],[2015,'Barcellona','Juventus'],
[2016,'Real Madrid','Atlético Madrid'],[2017,'Real Madrid','Juventus'],[2018,'Real Madrid','Liverpool'],
[2019,'Liverpool','Tottenham'],[2020,'Bayern Monaco','Paris Saint-Germain'],[2021,'Chelsea','Manchester City'],
[2022,'Real Madrid','Liverpool'],[2023,'Manchester City','Inter'],[2024,'Real Madrid','Borussia Dortmund']
];
const clClubs=[...new Set(cl.flatMap(r=>r.slice(1)))];
for(const [year,winner,runner] of cl){
 put('Champions League','Finali Champions',`Quale club fu finalista perdente della Champions League nel ${year}?`,runner,clClubs,`Nel ${year} ${winner} conquistò il titolo superando ${runner}.`,UEFA);
 // I vincitori sono gia presenti in official-questions.json: non duplicarli.
}
// Premiati Pallone d'Oro maschile: anno, vincitore. Gli anni 2020 (non assegnato) e 2025 esclusi.
const ballon=[
[1956,'Stanley Matthews'],[1957,'Alfredo Di Stéfano'],[1958,'Raymond Kopa'],[1959,'Alfredo Di Stéfano'],
[1960,'Luis Suárez Miramontes'],[1961,'Omar Sívori'],[1962,'Josef Masopust'],[1963,'Lev Jašin'],
[1964,'Denis Law'],[1965,'Eusébio'],[1966,'Bobby Charlton'],[1967,'Flórián Albert'],
[1968,'George Best'],[1969,'Gianni Rivera'],[1970,'Gerd Müller'],[1971,'Johan Cruyff'],
[1972,'Franz Beckenbauer'],[1973,'Johan Cruyff'],[1974,'Johan Cruyff'],[1975,'Oleh Blochin'],
[1976,'Franz Beckenbauer'],[1977,'Allan Simonsen'],[1978,'Kevin Keegan'],[1979,'Kevin Keegan'],
[1980,'Karl-Heinz Rummenigge'],[1981,'Karl-Heinz Rummenigge'],[1982,'Paolo Rossi'],[1983,'Michel Platini'],
[1984,'Michel Platini'],[1985,'Michel Platini'],[1986,'Igor Belanov'],[1987,'Ruud Gullit'],
[1988,'Marco van Basten'],[1989,'Marco van Basten'],[1990,'Lothar Matthäus'],[1991,'Jean-Pierre Papin'],
[1992,'Marco van Basten'],[1993,'Roberto Baggio'],[1994,'Hristo Stoichkov'],[1995,'George Weah'],
[1996,'Matthias Sammer'],[1997,'Ronaldo Nazário'],[1998,'Zinédine Zidane'],[1999,'Rivaldo'],
[2000,'Luís Figo'],[2001,'Michael Owen'],[2002,'Ronaldo Nazário'],[2003,'Pavel Nedvěd'],
[2004,'Andrij Ševčenko'],[2005,'Ronaldinho'],[2006,'Fabio Cannavaro'],[2007,'Kaká'],
[2008,'Cristiano Ronaldo'],[2009,'Lionel Messi'],[2010,'Lionel Messi'],[2011,'Lionel Messi'],
[2012,'Lionel Messi'],[2013,'Cristiano Ronaldo'],[2014,'Cristiano Ronaldo'],[2015,'Lionel Messi'],
[2016,'Cristiano Ronaldo'],[2017,'Cristiano Ronaldo'],[2018,'Luka Modrić'],[2019,'Lionel Messi'],
[2021,'Lionel Messi'],[2022,'Karim Benzema'],[2023,'Lionel Messi'],[2024,'Rodri']
];
const players=[...new Set(ballon.map(x=>x[1]))];
const awardHistory=new Map();for(const [year,winner] of ballon){if(!awardHistory.has(winner))awardHistory.set(winner,[]);awardHistory.get(winner).push(year)}
const awardYears=ballon.map(x=>String(x[0]));
for(const [winner,years] of awardHistory){
 put('Pallone d’Oro','Anni dei premiati',`In quale anno ${winner} conquistò il suo primo Pallone d'Oro maschile?`,String(years[0]),awardYears,`${winner} conquistò il suo primo Pallone d'Oro nel ${years[0]}.`,FRANCE,2);
 if(years.length>1)put('Pallone d’Oro','Record Pallone d’Oro',`Quante volte ${winner} ha vinto il Pallone d'Oro maschile fino al 2024?`,String(years.length),['1','2','3','4','5','6','7','8'],`${winner} ha ricevuto il premio ${years.length} volte: ${years.join(', ')}.`,FRANCE,3);
}
// Club / stadio / città: sedi storiche note (non sempre gli stadi usati nel 2026).
const grounds=[
['Real Madrid','Santiago Bernabéu','Madrid'],['Barcellona','Camp Nou','Barcellona'],['Atlético Madrid','Metropolitano','Madrid'],
['Athletic Bilbao','San Mamés','Bilbao'],['Valencia','Mestalla','Valencia'],['Siviglia','Ramón Sánchez Pizjuán','Siviglia'],
['Real Betis','Benito Villamarín','Siviglia'],['Real Sociedad','Anoeta','San Sebastián'],['Villarreal','Estadio de la Cerámica','Villarreal'],
['Manchester United','Old Trafford','Manchester'],['Manchester City','Etihad Stadium','Manchester'],['Liverpool','Anfield','Liverpool'],
['Everton','Goodison Park','Liverpool'],['Arsenal','Emirates Stadium','Londra'],['Chelsea','Stamford Bridge','Londra'],
['Tottenham','Tottenham Hotspur Stadium','Londra'],['West Ham','London Stadium','Londra'],['Newcastle United','St James’ Park','Newcastle'],
['Aston Villa','Villa Park','Birmingham'],['Leeds United','Elland Road','Leeds'],['Nottingham Forest','City Ground','Nottingham'],
['Juventus','Allianz Stadium','Torino'],['Inter','San Siro','Milano'],['Milan','San Siro','Milano'],
['Roma','Stadio Olimpico','Roma'],['Lazio','Stadio Olimpico','Roma'],['Napoli','Diego Armando Maradona','Napoli'],
['Fiorentina','Artemio Franchi','Firenze'],['Atalanta','Gewiss Stadium','Bergamo'],['Bologna','Renato Dall’Ara','Bologna'],
['Torino','Olimpico Grande Torino','Torino'],['Genoa','Luigi Ferraris','Genova'],['Sampdoria','Luigi Ferraris','Genova'],
['Bayern Monaco','Allianz Arena','Monaco di Baviera'],['Borussia Dortmund','Signal Iduna Park','Dortmund'],
['Schalke 04','Veltins-Arena','Gelsenkirchen'],['Bayer Leverkusen','BayArena','Leverkusen'],
['RB Lipsia','Red Bull Arena','Lipsia'],['Werder Brema','Weserstadion','Brema'],
['Paris Saint-Germain','Parc des Princes','Parigi'],['Olympique Marsiglia','Stade Vélodrome','Marsiglia'],
['Olympique Lione','Groupama Stadium','Lione'],['Lilla','Stade Pierre-Mauroy','Villeneuve-d’Ascq'],
['Monaco','Stade Louis II','Monaco'],['Lens','Stade Bollaert-Delelis','Lens'],
['Porto','Estádio do Dragão','Porto'],['Benfica','Estádio da Luz','Lisbona'],['Sporting CP','Estádio José Alvalade','Lisbona'],
['Braga','Estádio Municipal de Braga','Braga'],['Celtic','Celtic Park','Glasgow'],['Rangers','Ibrox Stadium','Glasgow'],
['Ajax','Johan Cruijff ArenA','Amsterdam'],['PSV Eindhoven','Philips Stadion','Eindhoven'],
['Feyenoord','De Kuip','Rotterdam'],['Galatasaray','RAMS Park','Istanbul'],['Fenerbahçe','Şükrü Saracoğlu','Istanbul'],
['Beşiktaş','Tüpraş Stadyumu','Istanbul'],['Basilea','St. Jakob-Park','Basilea'],['Young Boys','Stadion Wankdorf','Berna'],
['Zurigo','Letzigrund','Zurigo'],['Grasshoppers','Letzigrund','Zurigo'],['Lugano','Cornaredo','Lugano'],
['San Gallo','Kybunpark','San Gallo'],['Lucerna','Swissporarena','Lucerna'],['Sion','Stade de Tourbillon','Sion']
];
const stadiums=[...new Set(grounds.map(x=>x[1]))];const clubs=[...new Set(grounds.map(x=>x[0]))];
for(const [club,stadium,city] of grounds){
 put('Stadi famosi','Club e stadi',`Quale stadio è storicamente associato al ${club}?`,stadium,stadiums,`Il ${club} è storicamente associato allo stadio ${stadium} (${city}).`,STAD,1);
 // Reverse relationship only when a stadium has one club in this curated set.
 if(grounds.filter(x=>x[1]===stadium).length===1)put('Stadi famosi','Club e stadi',`Quale squadra è associata allo stadio ${stadium}?`,club,clubs,`Lo stadio ${stadium} si trova a ${city} ed è associato al ${club}.`,STAD,2);
}
const derbies=[
['Derby della Madonnina','Inter','Milan'],['Derby della Capitale','Roma','Lazio'],['Derby della Mole','Juventus','Torino'],
['Derby della Lanterna','Genoa','Sampdoria'],['Derby d’Italia','Inter','Juventus'],['Derby della Scala','Hellas Verona','Chievo'],
['El Clásico','Real Madrid','Barcellona'],['Derbi madrileño','Real Madrid','Atlético Madrid'],
['Derbi sevillano','Siviglia','Real Betis'],['Derbi vasco','Athletic Bilbao','Real Sociedad'],
['North West Derby','Liverpool','Manchester United'],['Manchester derby','Manchester City','Manchester United'],
['North London derby','Arsenal','Tottenham'],['Merseyside derby','Liverpool','Everton'],
['Tyne-Wear derby','Newcastle United','Sunderland'],['Second City derby','Aston Villa','Birmingham City'],
['Revierderby','Borussia Dortmund','Schalke 04'],['Der Klassiker','Bayern Monaco','Borussia Dortmund'],
['Le Classique','Paris Saint-Germain','Olympique Marsiglia'],['Derby de Lisboa','Benfica','Sporting CP'],
['O Clássico','Porto','Benfica'],['Old Firm','Celtic','Rangers'],
['De Klassieker','Ajax','Feyenoord'],['De Topper','Ajax','PSV Eindhoven'],
['Derby di Istanbul','Galatasaray','Fenerbahçe'],['Derby di Zurigo','Zurigo','Grasshoppers'],
['Derby di Belgrado','Stella Rossa','Partizan'],['Superclásico argentino','Boca Juniors','River Plate'],
['Derby della Ruhr','Borussia Dortmund','Schalke 04'],['Derby di Glasgow','Celtic','Rangers']
];
const derbyNames=[...new Set(derbies.map(x=>x[0]))];const rivals=[...new Set(derbies.flatMap(x=>x.slice(1)))];
for(const [name,a,b] of derbies){
 if(name==='North London derby'||name==='Merseyside derby')continue; // già nell'archivio storico
 put('Derby e rivalità','Rivalità storiche',`Quali club si affrontano nel ${name}?`,`${a} e ${b}`,derbies.map(d=>`${d[1]} e ${d[2]}`),`Il ${name} oppone ${a} e ${b}.`,STAD,2);
}
// Leggende: selezione di calciatori con nazionale e club emblematico. Queste domande non pretendono che sia l'unico club di carriera.
const legends=[
['Pelé','Brasile','Santos'],['Diego Maradona','Argentina','Napoli'],['Johan Cruyff','Paesi Bassi','Ajax'],
['Franz Beckenbauer','Germania Ovest','Bayern Monaco'],['Michel Platini','Francia','Juventus'],
['Zinédine Zidane','Francia','Real Madrid'],['Ronaldo Nazário','Brasile','Inter'],['Ronaldinho','Brasile','Barcellona'],
['Lionel Messi','Argentina','Barcellona'],['Cristiano Ronaldo','Portogallo','Real Madrid'],['Roberto Baggio','Italia','Juventus'],
['Paolo Maldini','Italia','Milan'],['Francesco Totti','Italia','Roma'],['Alessandro Del Piero','Italia','Juventus'],
['Gianluigi Buffon','Italia','Juventus'],['Andrea Pirlo','Italia','Milan'],['Gennaro Gattuso','Italia','Milan'],
['Marco van Basten','Paesi Bassi','Milan'],['Ruud Gullit','Paesi Bassi','Milan'],['Frank Rijkaard','Paesi Bassi','Milan'],
['Dennis Bergkamp','Paesi Bassi','Arsenal'],['Arjen Robben','Paesi Bassi','Bayern Monaco'],
['Wesley Sneijder','Paesi Bassi','Inter'],['Robin van Persie','Paesi Bassi','Arsenal'],
['Thierry Henry','Francia','Arsenal'],['Patrick Vieira','Francia','Arsenal'],['Franck Ribéry','Francia','Bayern Monaco'],
['Karim Benzema','Francia','Real Madrid'],['Antoine Griezmann','Francia','Atlético Madrid'],
['Kylian Mbappé','Francia','Paris Saint-Germain'],['Eusébio','Portogallo','Benfica'],['Luís Figo','Portogallo','Real Madrid'],
['Rui Costa','Portogallo','Fiorentina'],['Deco','Portogallo','Porto'],
['Xavi','Spagna','Barcellona'],['Andrés Iniesta','Spagna','Barcellona'],['Sergio Ramos','Spagna','Real Madrid'],
['Iker Casillas','Spagna','Real Madrid'],['David Villa','Spagna','Valencia'],['Fernando Torres','Spagna','Liverpool'],
['Sergio Busquets','Spagna','Barcellona'],['Carles Puyol','Spagna','Barcellona'],
['Wayne Rooney','Inghilterra','Manchester United'],['Steven Gerrard','Inghilterra','Liverpool'],
['Frank Lampard','Inghilterra','Chelsea'],['John Terry','Inghilterra','Chelsea'],
['David Beckham','Inghilterra','Manchester United'],['Alan Shearer','Inghilterra','Newcastle United'],
['Harry Kane','Inghilterra','Tottenham'],['Jude Bellingham','Inghilterra','Borussia Dortmund'],
['Luka Modrić','Croazia','Real Madrid'],['Ivan Rakitić','Croazia','Siviglia'],
['Robert Lewandowski','Polonia','Bayern Monaco'],['Jakub Błaszczykowski','Polonia','Borussia Dortmund'],
['Zlatan Ibrahimović','Svezia','Paris Saint-Germain'],['Henrik Larsson','Svezia','Celtic'],
['Erling Haaland','Norvegia','Manchester City'],['Martin Ødegaard','Norvegia','Arsenal'],
['Mohamed Salah','Egitto','Liverpool'],['Sadio Mané','Senegal','Liverpool'],
['Didier Drogba','Costa d’Avorio','Chelsea'],['Yaya Touré','Costa d’Avorio','Manchester City'],
['Samuel Eto’o','Camerun','Barcellona'],['André Onana','Camerun','Inter'],
['George Weah','Liberia','Milan'],['Victor Osimhen','Nigeria','Napoli'],
['Son Heung-min','Corea del Sud','Tottenham'],['Park Ji-sung','Corea del Sud','Manchester United'],
['Takefusa Kubo','Giappone','Real Sociedad'],['Shinji Kagawa','Giappone','Borussia Dortmund'],
['Tim Cahill','Australia','Everton'],['Mark Schwarzer','Australia','Fulham'],
['Clint Dempsey','Stati Uniti','Fulham'],['Christian Pulisic','Stati Uniti','Chelsea'],
['Keylor Navas','Costa Rica','Real Madrid'],['Javier Hernández','Messico','Manchester United'],
['Edinson Cavani','Uruguay','Napoli'],['Luis Suárez','Uruguay','Liverpool'],
['Federico Valverde','Uruguay','Real Madrid'],['Darwin Núñez','Uruguay','Benfica'],
['Ángel Di María','Argentina','Real Madrid'],['Sergio Agüero','Argentina','Manchester City'],
['Javier Mascherano','Argentina','Liverpool'],['Lautaro Martínez','Argentina','Inter'],
['Paulo Dybala','Argentina','Juventus'],['Juan Román Riquelme','Argentina','Villarreal'],
['Kaká','Brasile','Milan'],['Rivaldo','Brasile','Barcellona'],['Neymar','Brasile','Barcellona'],
['Dani Alves','Brasile','Siviglia'],['Marcelo','Brasile','Real Madrid'],['Vinícius Júnior','Brasile','Real Madrid']
];
const legendNames=legends.map(x=>x[0]);const legendClubs=[...new Set(legends.map(x=>x[2]))];
for(const [name,country,club] of legends){
 put('Leggende del calcio','Leggende e club',`In quale di queste squadre ha giocato ${name}?`,club,legendClubs,`${name} ha indossato la maglia del ${club}.`,STAD,2);
 // Check nation questions add variety but prevent absurd competition cross-inference.
 put('Leggende del calcio','Leggende e nazionali',`Quale nazionale ha rappresentato ${name}?`,country,[...new Set(legends.map(x=>x[1]))],`${name} ha rappresentato la nazionale di ${country}.`,STAD,1);
}
if(process.argv.includes('--check')){
 const exists=JSON.parse(fs.readFileSync(path.join(ROOT,'history-expansion.json'),'utf8'));
 if(JSON.stringify(exists)!==JSON.stringify(output))throw Error('Archivio storico modificato: rigenerare');
}else fs.writeFileSync(path.join(ROOT,'history-expansion.json'),JSON.stringify(output,null,2)+'\n');
const byCategory=Object.fromEntries([...new Set(output.map(q=>q.category))].map(c=>[c,output.filter(q=>q.category===c).length]));
console.log(JSON.stringify({total:output.length,byCategory,mode:process.argv.includes('--check')?'check':'build'},null,2));
module.exports={output};
