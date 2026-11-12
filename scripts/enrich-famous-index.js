'use strict';
// Incremental discovery of globally notable players using Wikidata sitelinks, no fixed list of clubs/countries.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),cacheFile=path.join(root,'wikidata-club-cache.json'),scoresFile=path.join(root,'famous-index.json');
const read=(p,f)=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return f}};
const save=(p,x)=>{const t=p+'.tmp';fs.writeFileSync(t,JSON.stringify(x,null,2)+'\n');fs.renameSync(t,p)};
const qid=x=>(String(x||'').match(/Q\d+$/)||[])[0];
const pause=t=>new Promise(r=>setTimeout(r,t));
function idsFromCache(cache){const ids=new Set();for(const c of Object.values(cache.clubs||{}))for(const b of c.bindings||[]){const id=qid(b.person?.value);if(id)ids.add(id)}const rank=id=>crypto.createHash('sha256').update(id).digest('hex');return [...ids].sort((a,b)=>rank(a).localeCompare(rank(b)));}
function query(ids){return `SELECT ?person ?links WHERE { VALUES ?person { ${ids.map(x=>'wd:'+x).join(' ')} } ?person wikibase:sitelinks ?links . }`}
async function enrich({cache=read(cacheFile,{clubs:{}}),existing=read(scoresFile,{counts:{}}),fetcher=fetch,budgetMs=140000,maxPerRun=900}={}){
 const counts={...(existing.counts||{})},remaining=idsFromCache(cache).filter(id=>counts[id]===undefined).slice(0,maxPerRun);let completed=0,errors=0;const until=Date.now()+budgetMs;
 for(let i=0;i<remaining.length&&Date.now()+15000<until;i+=30){const batch=remaining.slice(i,i+30),ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),11000);
 try{const url=new URL('https://query.wikidata.org/sparql');url.searchParams.set('query',query(batch));url.searchParams.set('format','json');const response=await fetcher(url,{signal:ctl.signal,headers:{Accept:'application/sparql-results+json','User-Agent':'FootballLegendsV4/4.5 (https://github.com/cupra82/football-legends-v4)'}});if(!response.ok)throw Error('HTTP '+response.status);
 const json=await response.json(),seen=new Set();for(const row of json.results?.bindings||[]){const id=qid(row.person?.value),links=Number(row.links?.value);if(id&&batch.includes(id)&&Number.isInteger(links)){counts[id]=links;seen.add(id)}}
 for(const id of batch)if(!seen.has(id))counts[id]=0;completed+=batch.length;save(scoresFile,{counts,updatedAt:new Date().toISOString()});console.log(`FAMA WIKIDATA: ${completed} calciatori valutati`);
 }catch(e){errors++;console.warn('Indice notorietà:',e.message);if(/HTTP 429/.test(e.message))break;}finally{clearTimeout(timer)}if(Date.now()+15000<until)await pause(500);
 }
 return {counts,completed,errors,total:Object.keys(counts).length};
}
async function main(){const result=await enrich();console.log(`Indice internazionale: ${result.completed} nuovi profili, ${result.total} complessivi, ${result.errors} errori`)}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={idsFromCache,query,enrich};
