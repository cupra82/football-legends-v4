"use strict";
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const base=path.join(__dirname,'..');
const policy=require(path.join(base,'category-policy.json'));
const files=['questions.json','portugal-questions.json','people-questions.json','classics-questions.json','questions-generated.json','people-generated.json','wikidata-generated.json','official-questions.json','history-expansion.json','deep-history.json'];
const all=[],sourceStats={};
for(const file of files){
 let obj;try{obj=JSON.parse(fs.readFileSync(path.join(base,file),'utf8'))}catch(e){sourceStats[file]={present:false,loaded:0};continue}
 const rows=Array.isArray(obj)?obj:Array.isArray(obj.questions)?obj.questions:[];
 sourceStats[file]={present:true,loaded:rows.length};
 for(const row of rows){all.push({...row,_file:file})}
}
const banned=new Set(policy.excludedKinds);
const allowedGenerated=new Set(['Campioni e classifiche','Podio del campionato','Confronti tra club','Record del campionato']);
const seenId=new Set(),seenQuestion=new Set();
const c={},k={},invalid=[],dupe=[],filtered=[];
function norm(s){return String(s||'').normalize('NFKC').toLocaleLowerCase('it').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
for(const q of all){
 const source=q._file;const id=String(q.id||'');const key=norm(q.question);
 if(q.category==='Calcio femminile'){filtered.push({id,source,kind:'Categoria rimossa'});continue}
 if(!q.category||!q.question||!Array.isArray(q.options)||q.options.length!==3||!Number.isInteger(q.answer)||q.answer<0||q.answer>2||new Set(q.options.map(norm)).size!==3||!String(q.explanation||'').trim()){
 invalid.push({id,source,reason:'schema/alternative/risposta/spiegazione'});continue
 }
 if(banned.has(q.kind)||(source==='questions-generated.json'&&!allowedGenerated.has(q.kind))){filtered.push({id,source,kind:q.kind});continue}
 // Duplicati tra sorgenti, non contati due volte; dati realmente equivalenti.
 if(seenQuestion.has(key)||id&&seenId.has(id)){dupe.push({id,source,reason:'id o testo ripetuto'});continue}
 if(id)seenId.add(id);seenQuestion.add(key);
 c[q.category]=(c[q.category]||0)+1;k[q.kind||'Storico']=(k[q.kind||'Storico']||0)+1;
}
const entries=Object.entries(policy.groups).flatMap(([group,names])=>names.map(category=>({group,category,available:c[category]||0,target:policy.minimumPerCategory,missing:Math.max(0,policy.minimumPerCategory-(c[category]||0)),met:(c[category]||0)>=policy.minimumPerCategory})))
const known=new Set(entries.map(x=>x.category));for(const [category,available] of Object.entries(c).filter(([name])=>!known.has(name)).sort())entries.push({group:'Categorie aggiuntive',category,available,target:policy.minimumPerCategory,missing:Math.max(0,policy.minimumPerCategory-available),met:available>=policy.minimumPerCategory});
const total=Object.values(c).reduce((a,b)=>a+b,0);
const report={version:policy.version,generatedAt:new Date().toISOString(),minimumPerCategory:policy.minimumPerCategory,sourceStats,rawCount:all.length,validUniquePlayable:total,filteredByKind:filtered.length,invalid:invalid.length,duplicates:dupe.length,byKind:k,categories:entries,samples:{invalid:invalid.slice(0,12),duplicates:dupe.slice(0,12)}};
fs.writeFileSync(path.join(base,'category-report.json'),JSON.stringify(report,null,2)+'\n');
let lines=['# Football Legends — Rapporto reale delle domande','','Versione generatore: **'+policy.version+'**','',`Totale sorgenti lette: **${all.length}** · Domande valide, uniche e giocabili: **${total}**`,'',`Filtrate per tipo non desiderato: **${filtered.length}** · Duplicati: **${dupe.length}** · Non valide: **${invalid.length}**`,'','> I conteggi non sono gonfiati con domande duplicate; un argomento assente vale 0.','', '| Gruppo | Categoria | Disponibili | Obiettivo | Mancanti | Esito |','|---|---|---:|---:|---:|---|'];
for(const e of entries)lines.push(`| ${e.group} | ${e.category} | ${e.available} | ${e.target} | ${e.missing} | ${e.met?'OK':'Da ampliare'} |`);
lines.push('','## Fonti','');for(const [file,s] of Object.entries(sourceStats))lines.push(`- ${file}: ${s.present?s.loaded+' elementi':'non presente (verrà contato dopo il workflow su GitHub)'}`);
lines.push('','## Criterio di qualità','',policy.explanations,'','Questo rapporto si aggiorna con il workflow settimanale e **non certifica** la correttezza storica di ogni singola domanda.');
fs.writeFileSync(path.join(base,'category-report.md'),lines.join('\n')+'\n');
console.log(`Audit categorie: ${total} domande valide e uniche, ${entries.filter(e=>e.met).length}/${entries.length} categorie a >= ${policy.minimumPerCategory}; ${invalid.length} non valide; ${dupe.length} duplicati; ${filtered.length} scartate.`);
if(process.env.STRICT_QUALITY==='1' && invalid.length)process.exitCode=2;
