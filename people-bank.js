'use strict';
// Football Legends v1.3. Dataset di persone CC0 da Reep/Wikidata.
// Genera esclusivamente quesiti relativi a campi disponibili e con alternative distinte.
const fs=require('fs'),crypto=require('crypto');
const SOURCE='https://github.com/withqwerty/reep/blob/main/data/people.csv';
const FORBIDDEN=new Set(['unknown','none','null','n/a','-','?', 'united states minor outlying islands']);
function hash(s){return crypto.createHash('sha256').update(s).digest('hex').slice(0,18)}
function shuffled(items,key){let a=[...items],state=parseInt(hash(key).slice(0,8),16)||1;for(let i=a.length-1;i>0;i--){state^=state<<13;state^=state>>>17;state^=state<<5;let j=(state>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function parseCsv(text){let rows=[],record=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){record.push(field);field=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;record.push(field);field='';if(record.length>1)rows.push(record);record=[]}else field+=c}if(field||record.length){record.push(field);rows.push(record)}return rows}
function normalizeNation(v){v=String(v||'').trim();if(!v||FORBIDDEN.has(v.toLowerCase())||/[|;/]/.test(v)||v.length>38)return null;const special={'United Kingdom':'Regno Unito','United States':'Stati Uniti','Czech Republic':'Repubblica Ceca','Czechia':'Repubblica Ceca','Netherlands':'Paesi Bassi','Ivory Coast':'Costa d’Avorio','Côte d’Ivoire':'Costa d’Avorio','South Korea':'Corea del Sud','North Macedonia':'Macedonia del Nord','Bosnia and Herzegovina':'Bosnia ed Erzegovina','Switzerland':'Svizzera','Germany':'Germania','Italy':'Italia','Spain':'Spagna','France':'Francia','Portugal':'Portogallo','Brazil':'Brasile','Argentina':'Argentina','Belgium':'Belgio','Turkey':'Turchia','Turkiye':'Turchia','Türkiye':'Turchia','Croatia':'Croazia','Serbia':'Serbia','Uruguay':'Uruguay','Poland':'Polonia','England':'Inghilterra','Scotland':'Scozia','Wales':'Galles','Austria':'Austria','Denmark':'Danimarca','Norway':'Norvegia','Sweden':'Svezia','Morocco':'Marocco','Senegal':'Senegal','Nigeria':'Nigeria','Ghana':'Ghana','Cameroon':'Camerun','Japan':'Giappone','Colombia':'Colombia','Mexico':'Messico','Chile':'Cile','Greece':'Grecia','Egypt':'Egitto','Australia':'Australia','Canada':'Canada','Ireland':'Irlanda','Republic of Ireland':'Irlanda'};return special[v]||v}
function broadRole(position,detail){const s=(String(detail||'')+' '+String(position||'')).toLowerCase();if(/goalkeeper|goalie|portiere|keeper|torwart/.test(s))return 'Portiere';if(/defender|back|difesa|defensive|centre-back|center-back|full-back/.test(s))return 'Difensore';if(/midfield|centrocamp|wing-back|centremid|center mid/.test(s))return 'Centrocampista';if(/forward|striker|attacker|attacc|centre-forward|center-forward|left winger|right winger|winger/.test(s))return 'Attaccante';return null}
function validName(name){return typeof name==='string'&&name.length>=5&&name.length<=38&&!/[0-9<>|{}\[\]]/.test(name)&&name.includes(' ')}
function parsePeople(csv){const lines=parseCsv(csv);if(lines.length<2)throw Error('CSV vuoto');const header=lines.shift().map(v=>v.trim());for(const need of ['name','type','nationality','date_of_birth','position'])if(!header.includes(need))throw Error('Colonna mancante: '+need);const values=[];for(const line of lines){if(line.length!==header.length)continue;let p=Object.fromEntries(header.map((h,i)=>[h,line[i]?.trim()||'']));if(!validName(p.name)||!['player','coach'].includes(p.type))continue;if(!p.reep_id&&!p.key_wikidata)continue;const providers=['key_transfermarkt','key_fbref','key_sofascore','key_fotmob','key_soccerway','key_premier_league','key_opta','key_api_football','key_11v11','key_whoscored'].filter(k=>p[k]).length;let d=/^(19[0-9]{2}|20[0-1][0-9])-\d{2}-\d{2}$/.test(p.date_of_birth)?p.date_of_birth:null;
 // Keep recognizable / sufficiently cross-referenced profiles, not obscure one-off names.
 if(providers<(p.type==='coach'?2:3))continue;
 values.push({id:p.reep_id||p.key_wikidata,name:p.name,type:p.type,nation:normalizeNation(p.nationality),role:broadRole(p.position,p.position_detail),birth:d,providers})}
 const seen=new Set();return values.filter(p=>{const k=p.type+'|'+p.name.toLocaleLowerCase('en');if(seen.has(k))return false;seen.add(k);return true})}
function question(id,category,kind,question,options,correct,explanation,difficulty){if(options.length!==3||new Set(options).size!==3||!options.includes(correct))return null;return {id:'bio-'+hash(id),category,kind,difficulty,question,options,answer:options.indexOf(correct),explanation,source:SOURCE}}
function build(people,{max=18000}={}){
 const players=people.filter(p=>p.type==='player');const coaches=people.filter(p=>p.type==='coach');
 let questions=[];const sorted=shuffled([...people],'fl13-players');
 const nations=['Italia','Francia','Germania','Spagna','Portogallo','Brasile','Argentina','Svizzera','Inghilterra','Regno Unito','Paesi Bassi','Belgio','Croazia','Uruguay','Turchia','Serbia','Polonia','Svezia','Danimarca','Norvegia','Austria','Marocco','Senegal','Nigeria','Ghana','Giappone','Colombia','Messico','Cile','Grecia','Egitto','Canada','Australia'];
 const roleOptions={Portiere:['Difensore','Attaccante'],Difensore:['Portiere','Centrocampista'],Centrocampista:['Difensore','Attaccante'],Attaccante:['Portiere','Centrocampista']};
 function add(x){if(x)questions.push(x)}
 for(const p of sorted){if(questions.length>=max*2)break;const category=p.type==='coach'?'Allenatori e tecnici':'Calciatori nel mondo';
 if(p.nation&&nations.includes(p.nation)){
   const others=shuffled(nations.filter(n=>n!==p.nation&&n!=='Regno Unito'&&n!=='Inghilterra').filter(n=>n!==p.nation),p.id+'nation').slice(0,2);
   if(others.length===2){const options=shuffled([p.nation,...others],p.id+'natopt');add(question(p.id+'|nationality',category,'Nazionalità',`Quale nazionalità è associata a ${p.name}?`,options,p.nation,`Nel registro dei profili calcistici, ${p.name} risulta associato a ${p.nation}.`,2))}
 }
 if(p.type==='player'&&p.role){const options=shuffled([p.role,...roleOptions[p.role]],p.id+'role');add(question(p.id+'|role',category,'Ruolo',`Quale ruolo principale viene attribuito a ${p.name}?`,options,p.role,`${p.name} è classificato principalmente come ${p.role.toLowerCase()} nella banca dati dei calciatori.`,1))}
 // Birth-decade is accessible reasoning, but restricted to higher-coverage famous profiles.
 if(p.birth&&p.providers>=5){const decade=Math.floor(Number(p.birth.slice(0,4))/10)*10;const other=[decade-10,decade+10].filter(v=>v>=1900&&v<=2010);if(other.length===2){let good=`Anni ${decade}`,options=shuffled([good,...other.map(y=>`Anni ${y}`)],p.id+'dec');add(question(p.id+'|decade',category,'Epoca dei protagonisti',`In quale decennio è nato ${p.name}?`,options,good,`${p.name} è nato nel ${p.birth.slice(0,4)}.`,2))}}
 }
 // Quality over quantity: unique records and distinct questions; no inverted clones.
 const unique=new Map();for(const q of questions)if(!unique.has(q.id))unique.set(q.id,q);
 const candidates=[...unique.values()];const groups=new Map();for(const q of candidates){const key=q.category+'|'+q.kind; if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q)}
 const output=[];const ordered=[...groups.keys()].sort();for(const key of ordered)groups.set(key,shuffled(groups.get(key),key));let progressed=true;while(output.length<max&&progressed){progressed=false;for(const key of ordered){const arr=groups.get(key);if(arr.length){output.push(arr.pop());progressed=true;if(output.length>=max)break}}}
 let byCategory={},byKind={};for(const q of output){byCategory[q.category]=(byCategory[q.category]||0)+1;byKind[q.kind]=(byKind[q.kind]||0)+1}
 return {questions:shuffled(output,'fl13-final'),stats:{generated:output.length,playersIndexed:players.length,coachesIndexed:coaches.length,byCategory,byKind,source:SOURCE,at:new Date().toISOString()}}
}
module.exports={parseCsv,parsePeople,build,normalizeNation,broadRole};
