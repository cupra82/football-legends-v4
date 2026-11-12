'use strict';
/** Offline release inspection. Reads exactly the files the server loads. */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const files=['questions.json','questions-generated.json','people-questions.json','people-generated.json','portugal-questions.json','classics-questions.json','official-questions.json','history-expansion.json','deep-history.json','competition-history-generated.json','european-cups-generated.json','themed-generated.json','stadiums-wikidata-generated.json','famous-careers-generated.json','wikidata-generated.json'];
const generated=new Set(['questions-generated.json','people-generated.json','wikidata-generated.json']);
const allowed=new Set(['Campioni e classifiche','Podio del campionato','Confronti tra club','Record del campionato']);
const bySource=[],seen=new Set(),byCategory={};let raw=0,valid=0,duplicates=0,invalid=0,filtered=0;
for(const name of files){const file=path.join(root,name);if(!fs.existsSync(file)){bySource.push({file:name,present:false,loaded:0});continue}
 try{const obj=JSON.parse(fs.readFileSync(file,'utf8')),items=Array.isArray(obj)?obj:(Array.isArray(obj.questions)?obj.questions:[]);let taken=0;for(const q of items){raw++;if(q.category==='Calcio femminile'){filtered++;continue}if(name==='questions-generated.json'&&!allowed.has(q.kind)){filtered++;continue}
 if(!q||typeof q.question!=='string'||!q.question.trim()||!Array.isArray(q.options)||q.options.length!==3||!Number.isInteger(q.answer)||q.answer<0||q.answer>2||new Set(q.options.map(x=>String(x).trim().toLowerCase())).size!==3){invalid++;continue}
 const id=String(q.id||q.question).trim().toLowerCase();if(seen.has(id)){duplicates++;continue}seen.add(id);valid++;taken++;byCategory[q.category]=(byCategory[q.category]||0)+1}
 bySource.push({file:name,present:true,loaded:taken,raw:items.length})}catch(e){bySource.push({file:name,present:true,error:e.message,loaded:0})}}
const report={release:'4.0.0',raw,uniqueValid:valid,duplicates,invalid,filtered,byCategory,files:bySource,largeArchives:bySource.filter(x=>generated.has(x.file)).map(x=>({file:x.file,present:x.present,loaded:x.loaded})),goalPerTopic:2000};
console.log('FOOTBALL LEGENDS RELEASE 4.0.0 — VERIFICA ARCHIVIO');
console.log('Domande uniche e valide:',valid,'| Duplicati:',duplicates,'| Non valide:',invalid,'| Filtrate:',filtered);
for(const [k,v] of Object.entries(byCategory).sort((a,b)=>b[1]-a[1]))console.log('  '+k+': '+v);
for(const f of report.largeArchives)console.log('Archivio',f.file, f.present?f.loaded+' valide':'MANCANTE — conserva il file nel repository V4');
if(process.argv.includes('--json'))fs.writeFileSync(path.join(root,'release-report.json'),JSON.stringify(report,null,2));
if(process.argv.includes('--strict')){
 const missing=report.largeArchives.filter(x=>!x.present).map(x=>x.file);
 if(missing.length||valid<20000){console.error('BLOCCO RELEASE: archivi assenti o meno di 20.000 domande. Mancanti:',missing.join(', ')||'nessuno');process.exitCode=1}
 else console.log('OK: archivio esteso caricato. Le categorie sotto le 2.000 sono visibili nel rapporto; non vengono inventate.')
}
