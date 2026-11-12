'use strict';
// Football Legends V4: cross-club career links for internationally known footballers.
// Sources: footballer->club direct assertions (Wikidata P54) already collected in wikidata-club-cache.json.
// The generator never invents career facts, and keeps previous output when cache is absent.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const sourceFile=path.join(root,'wikidata-club-cache.json');
const outFile=path.join(root,'famous-careers-generated.json');
const read=(p,def)=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return def}};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,20);
const clean=x=>String(x||'').replace(/\s+/g,' ').trim();
const norm=x=>clean(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').replace(/[^\p{L}\p{N}]+/gu,' ' ).trim();
const qid=x=>(String(x||'').match(/Q\d+$/)||[])[0];
// Priorities are worldwide, multi-era: not an exclusion list. Other documented players can still qualify.
const famous=`Pelé|Diego Maradona|Lionel Messi|Cristiano Ronaldo|Ronaldo|Ronaldinho|Zinedine Zidane|Johan Cruyff|Franz Beckenbauer|Michel Platini|Roberto Baggio|Paolo Maldini|Andrea Pirlo|Gianluigi Buffon|Francesco Totti|Alessandro Del Piero|Filippo Inzaghi|Gennaro Gattuso|Fabio Cannavaro|Giorgio Chiellini|Leonardo Bonucci|Antonio Di Natale|Luca Toni|Mario Balotelli|Giorgio Marchetti|Kaká|Rivaldo|Romário|Neymar|Vinícius Júnior|Rodrygo|Casemiro|Marcelo|Roberto Carlos|Cafu|Thiago Silva|Alisson Becker|Ederson|Gabriel Jesus|Hulk|Oscar|Endrick|Kylian Mbappé|Karim Benzema|Antoine Griezmann|Olivier Giroud|Paul Pogba|N'Golo Kanté|Thierry Henry|Patrick Vieira|Franck Ribéry|Ousmane Dembélé|Kingsley Coman|Hugo Lloris|Lilian Thuram|David Trezeguet|Eric Cantona|William Saliba|Erling Haaland|Martin Ødegaard|Mohamed Salah|Sadio Mané|Riyad Mahrez|Victor Osimhen|Achraf Hakimi|André Onana|Didier Drogba|Yaya Touré|Samuel Eto'o|Pierre-Emerick Aubameyang|Michael Essien|Thomas Partey|Asamoah Gyan|Son Heung-min|Park Ji-sung|Kim Min-jae|Takefusa Kubo|Shinji Kagawa|Keisuke Honda|Kaoru Mitoma|Daichi Kamada|Ali Daei|Mehdi Taremi|Sardar Azmoun|Tim Cahill|Harry Kewell|Héctor Bellerín|Lamine Yamal|Pedri|Gavi|Sergio Busquets|Andrés Iniesta|Xavi|Carles Puyol|Gerard Piqué|Sergio Ramos|Iker Casillas|David de Gea|Álvaro Morata|Fernando Torres|David Villa|Cesc Fàbregas|Juan Mata|Isco|Marco Asensio|Dani Carvajal|Rodri|Mikel Oyarzabal|Jude Bellingham|Harry Kane|Wayne Rooney|David Beckham|Steven Gerrard|Frank Lampard|John Terry|Rio Ferdinand|Paul Scholes|Marcus Rashford|Phil Foden|Bukayo Saka|Cole Palmer|Declan Rice|Trent Alexander-Arnold|Jack Grealish|Jamie Vardy|Raheem Sterling|Jordan Henderson|Alan Shearer|Michael Owen|Gary Lineker|Kevin De Bruyne|Eden Hazard|Romelu Lukaku|Thibaut Courtois|Youri Tielemans|Axel Witsel|Dries Mertens|Jan Vertonghen|Thomas Vermaelen|Toby Alderweireld|Marouane Fellaini|Luka Modrić|Ivan Rakitić|Mario Mandžukić|Ivan Perišić|Joško Gvardiol|Mateo Kovačić|Marcelo Brozović|Edin Džeko|Miralem Pjanić|Dušan Vlahović|Aleksandar Mitrović|Nemanja Vidić|Nemanja Matić|Dusan Tadić|Sergej Milinković-Savić|Robert Lewandowski|Wojciech Szczęsny|Piotr Zieliński|Jakub Błaszczykowski|Arkadiusz Milik|Grzegorz Krychowiak|Arjen Robben|Robin van Persie|Wesley Sneijder|Virgil van Dijk|Memphis Depay|Frenkie de Jong|Matthijs de Ligt|Denzel Dumfries|Cody Gakpo|Ryan Gravenberch|Dirk Kuyt|Ruud van Nistelrooy|Marco van Basten|Dennis Bergkamp|Clarence Seedorf|Edwin van der Sar|Georginio Wijnaldum|Mesut Özil|Toni Kroos|Thomas Müller|Manuel Neuer|Mats Hummels|Mario Götze|Joshua Kimmich|Ilkay Gündogan|Kai Havertz|Jamal Musiala|Florian Wirtz|Serge Gnabry|Marco Reus|Miroslav Klose|Lukas Podolski|Bastian Schweinsteiger|Sami Khedira|Mario Gómez|Rúben Dias|Bernardo Silva|Bruno Fernandes|João Félix|João Cancelo|Rafael Leão|Diogo Jota|Pepe|Ricardo Quaresma|Nani|André Silva|Vitinha|João Neves|Gonçalo Ramos|Luis Suárez|Edinson Cavani|Federico Valverde|Darwin Núñez|Rodrigo Bentancur|José María Giménez|Diego Forlán|Luis Díaz|James Rodríguez|Radamel Falcao|Juan Cuadrado|Jhon Durán|Duván Zapata|David Ospina|Julián Álvarez|Ángel Di María|Paulo Dybala|Lautaro Martínez|Enzo Fernández|Alexis Mac Allister|Emiliano Martínez|Sergio Agüero|Javier Mascherano|Gonzalo Higuaín|Ángel Correa|Nicolás Otamendi|Rodrigo De Paul|Leandro Paredes|Mauro Icardi|Giovani Lo Celso|Lisandro Martínez|Nicolás Tagliafico|Gabriel Batistuta|Juan Román Riquelme|Juan Sebastián Verón|Hernán Crespo|Carlos Tévez|Claudio Bravo|Arturo Vidal|Alexis Sánchez|Eduardo Vargas|Gary Medel|Christian Pulisic|Weston McKennie|Tyler Adams|Tim Weah|Gio Reyna|Matt Turner|Alphonso Davies|Jonathan David|Cyle Larin|Hirving Lozano|Raúl Jiménez|Edson Álvarez|Guillermo Ochoa|Santiago Giménez|Javier Hernández|Andrés Guardado|Rafa Márquez|Salomón Rondón|Keylor Navas|Bryan Ruiz|Joel Campbell|Christian Eriksen|Rasmus Højlund|Pierre-Emile Højbjerg|Kasper Schmeichel|Simon Kjær|Martin Braithwaite|Alexander Isak|Dejan Kulusevski|Zlatan Ibrahimović|Viktor Gyökeres|Emil Forsberg|Victor Lindelöf|Granit Xhaka|Xherdan Shaqiri|Yann Sommer|Manuel Akanji|Breel Embolo|Denis Zakaria|Remo Freuler|Ricardo Rodríguez|Noah Okafor|Fabian Schär|Andi Zeqiri|Arda Güler|Hakan Çalhanoğlu|Kenan Yıldız|Merih Demiral|Cengiz Ünder|Enes Ünal|İlkay Gündoğan|Khvicha Kvaratskhelia|Giorgi Mamardashvili|Victor Boniface`.split('|');
const priority=new Set(famous.map(norm));
const fameScores=read(path.join(root,'famous-index.json'),{counts:{}}).counts||{};
function extract(cache){const persons=new Map(),clubNames=new Map();for(const [clubId,c] of Object.entries(cache.clubs||{})){
 const name=clean(c.club?.name);if(!name||!/^Q\d+$/.test(clubId))continue;clubNames.set(clubId,name);
 for(const r of c.bindings||[]){const id=qid(r.person?.value),person=clean(r.personLabel?.value);if(!id||!person||/^Q\d+$/.test(person))continue;
 let p=persons.get(id);if(!p){p={id,name:person,clubs:new Set()};persons.set(id,p)}p.clubs.add(clubId);
 }}return {persons,clubNames};}
function generate(cache){const {persons,clubNames}=extract(cache);const all=[...persons.values()].filter(p=>p.clubs.size>=2);
 // Factual positive-club questions only: never assert that a distractor never played somewhere.
 const out=[];for(const p of all){const clubs=[...p.clubs].map(id=>({id,name:clubNames.get(id)})).filter(x=>x.name).sort((a,b)=>a.name.localeCompare(b.name));if(clubs.length<2)continue;
 const isFamous=priority.has(norm(p.name))||Number(fameScores[p.id]||0)>=25;
 // Fame is derived from international encyclopedia coverage. Do not create obscure-player trivia.
 if(!isFamous)continue;
 // Positive answer is a *pair of clubs*: all distractor pairs are composed solely of clubs with no overlap with player's verified clubs.
 const others=[...clubNames.entries()].filter(([id])=>!p.clubs.has(id)).map(([id,name])=>({id,name})).sort((a,b)=>sha(p.id+a.id).localeCompare(sha(p.id+b.id)));
 if(others.length<4)continue;
 const pairs=[];for(let i=0;i<Math.min(clubs.length,4);i++)for(let j=i+1;j<Math.min(clubs.length,4);j++)pairs.push([clubs[i],clubs[j]]);
 for(const pair of pairs.slice(0,isFamous?3:1)){
 const validPair=pair.map(x=>x.name).sort().join(' e ');
 const w1=[others[0].name,others[1].name].sort().join(' e '),w2=[others[2].name,others[3].name].sort().join(' e ');
 const text=`Quale coppia di club compare nella carriera di ${p.name}, secondo le schede Wikidata?`;
 // Exactly one per person: don't use many variants with exactly same wording.
 if(out.some(q=>q.question===text))break;
 const options=[validPair,w1,w2].sort((a,b)=>sha(p.id+a).localeCompare(sha(p.id+b)));
 out.push({id:'career-link-'+sha(p.id),category:'Leggende del calcio',kind:'Carriere incrociate Wikidata',difficulty:isFamous?2:3,question:text,options,answer:options.indexOf(validPair),explanation:`Wikidata registra ${p.name} tra i calciatori di ${pair[0].name} e ${pair[1].name}.`,source:`https://www.wikidata.org/wiki/${p.id}`,sourceName:'Wikidata CC0'});
 break;
 }
 }
 return {questions:out,people:persons.size,multiClub:all.length,notedFamous:out.filter(q=>q.category==='Leggende del calcio').length};}
function main(){const cache=read(sourceFile,{clubs:{}}),previous=read(outFile,{questions:[]});if(!Object.keys(cache.clubs||{}).length){console.log('Carriere famose: cache Wikidata non ancora disponibile, archivio conservato.');return;}
 const result=generate(cache),map=new Map((previous.questions||[]).map(q=>[q.id,q])),old=map.size;
 for(const q of result.questions)map.set(q.id,q);const questions=[...map.values()].sort((a,b)=>a.id.localeCompare(b.id));const stats={at:new Date().toISOString(),source:'Wikidata P54 + selezione internazionale',peopleConsidered:result.people,multiClub:result.multiClub,famousQuestions:result.notedFamous,newQuestions:map.size-old,total:questions.length};
 fs.writeFileSync(outFile,JSON.stringify({stats,questions},null,2)+'\n');console.log('CARRIERE FAMOSE:',JSON.stringify(stats));}
if(require.main===module)main();module.exports={extract,generate};
