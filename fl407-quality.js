'use strict';
// Football Legends 4.0.7: selezione qualitativa, senza eliminare domande dagli archivi.
const ICONIC = `pelé|pele|maradona|messi|cristiano ronaldo|ronaldo nazário|ronaldo nazario|zidane|ronaldinho|neymar|mbappé|mbappe|modrić|modric|kroos|benzema|suárez|suarez|lewandowski|ibrahimović|ibrahimovic|maldini|baresi|buffon|pirlo|totti|del piero|baggio|cannavaro|inzaghi|gattuso|chiellini|bonucci|marchisio|de rossi|vialli|mancini|platini|cruyff|beckenbauer|müller|muller|klose|lahm|schweinsteiger|neuer|kahn|rummenigge|matthäus|matthaus|klinsmann|gullit|van basten|rijkaard|bergkamp|robben|van persie|van dijk|sneijder|van nistelrooy|de bruyne|hazard|lukaku|courtois|drogba|eto'o|eto’o|yaya touré|yaya toure|mané|mane|salah|mahrez|osimhen|hakimi|essien|aubameyang|weah|okochа|okocha|son heung|park ji|kagawa|nakata|mitoma|henry|vieira|kante|kanté|griezmann|giroud|pogba|deschamps|thuram|ribéry|ribery|ben arfa|kantona|cantona|beckham|rooney|lampard|gerrard|scholes|ferdinand|terry|kane|bellingham|foden|saka|rashford|sterling|shearer|owen|gascoigne|lineker|bobby charlton|george best|dalglish|bale|giggs|ramsey|haaland|øдеgaard|odegaard|isak|gyökeres|gyokeres|ibra|kvaratskhelia|osimhen|dybala|higuaín|higuain|di maría|di maria|aguero|agüero|lautaro|martínez|martinez|alvarez|alvaréz|mascherano|verón|veron|batistuta|r iquelme|riquelme|tevez|cavani|forlán|forlan|valverde|darwin núñez|darwin nunez|vinícius|vinicius|rodrygo|casemiro|kaká|kaka|rivaldo|romário|romario|cafú|cafu|roberto carlos|thiago silva|dani alves|marcelo|gabriel jesus|raphinha|alisson|ederson|endrick|james rodríguez|james rodriguez|falcao|cuadrado|luis díaz|luis diaz|alexis sánchez|alexis sanchez|arturo vidal|bravo|medel|benzema|ancelotti|guardiola|mourinho|klopp|klopp|ferguson|wenger|conte|allegri|simeone|inzaghi|spalletti|gasperini|sacchi|capello|lippi|ranieri|del bosque|löw|low|scaloni|dechamps|bielsa|van gaal|ten hag|arteta|nagelsmann|tuchel|flick|hitzfeld|hey nckes|heynckes`;
const majors=`real madrid|barcelona|barcellona|atlético madrid|atletico madrid|athletic bilbao|sevilla|valencia|villarreal|manchester united|manchester city|liverpool|arsenal|chelsea|tottenham|newcastle|aston villa|bayern|borussia dortmund|bayer leverkusen|juventus|internazionale|inter milan|inter |milan|napoli|roma|lazio|atalanta|fiorentina|paris saint-germain|psg|marseille|olympique lyonnais|porto|benfica|sporting|ajax|psv|feyenoord|celtic|rangers|galatasaray|fenerbahçe|fenerbahce|beşiktaş|besiktas|boca juniors|river plate|flamengo|palmeiras|santos|são paulo|sao paulo|corinthians|gremio|grêmio|fluminense|al hilal|inter miami|los angeles galaxy`;
const iconic=ICONIC.split('|').filter(x=>x.length>=4);const clubs=majors.split('|').filter(Boolean);
const richKinds=/finali|semifinali|quarti|campion|trofe|titoli|vincitor|record|allenator|pallone|mondial|europe|derby|rival|triplete|coppe|champions|premi|stadi|leggenda|carriere|trasferiment|marcatori|gol decisiv/i;
const weakKinds=/nazionalit|città di nascita|citta di nascita|luogo di nascita|nato|biografie wikidata|profili|ruolo|epoca dei protagonisti/i;
const weakQuestions=/in quale citt[aà] [eè] nat|dove [eè] nat|in quale anno [eè] nat|di quale nazionalit[aà]|qual [eè] la nazionalit[aà]|in quale nazione [eè] nat|quale citt[aà] (ha dato i natali|di nascita)/i;
const majorQuestions=/mondial|champions|europe[io]|europa league|coppa|pallone d.oro|finale|semifinale|triplete|record|scudett|derby|allenat|titol|vincit|capocannonier/i;
function score(q){const text=String(q.question||'').toLowerCase(),kind=String(q.kind||'').toLowerCase(),cat=String(q.category||'').toLowerCase();let v=0;
 if(majorQuestions.test(text))v+=5;
 if(richKinds.test(kind))v+=4;
 if(/mondial|champions|europe|pallone|leggend|stadi|derby|allenator|stor|curiosit|campionat|coppe/i.test(cat))v+=2;
 if(iconic.some(n=>text.includes(n)))v+=6;
 if(clubs.some(n=>text.includes(n)))v+=3;
 if(weakKinds.test(kind))v-=7;
 if(weakQuestions.test(text))v-=9;
 if(/^(in quale città|in quale paese|dove è nato)/i.test(text))v-=5;
 return v;
}
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function select(pool,n,{mode='famous',balanced=true}={}){
 if(mode==='all')return shuffle(pool).slice(0,n);
 const ranked=[[],[],[]];for(const q of pool){const s=score(q);ranked[s>=5?0:s>=0?1:2].push(q)}
 const targets=[Math.ceil(n*.78),Math.ceil(n*.18),n];const picked=[],ids=new Set();
 const add=(list,limit)=>{for(const q of shuffle(list)){if(picked.length>=limit)break;const id=String(q.id||q.question);if(ids.has(id))continue;ids.add(id);picked.push(q)}};
 add(ranked[0],targets[0]);add(ranked[1],Math.max(targets[1]+picked.length,Math.ceil(n*.95)));add(ranked[2],n);
 if(picked.length<n)add([...ranked[0],...ranked[1],...ranked[2]],n);
 return shuffle(picked.slice(0,n));
}
module.exports={score,select};
