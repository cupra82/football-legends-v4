'use strict';
const topics=require('./topics-v3.json');
const groups=Object.fromEntries(topics.groups.map(g=>[g.id,g]));
const bySource=Object.fromEntries(topics.groups.flatMap(g=>g.sources.map(c=>[c,g.id])));
function matches(category,q){ if(category==='Tutte')return true; if(category.startsWith('v3:league:'))return q.category===category.slice(10); if(category.startsWith('v3:group:')){const key=category.slice(9);return key==='trivia' ? (!bySource[q.category]||bySource[q.category]==='trivia') : bySource[q.category]===key;} return q.category===category;}
function valid(category){return category==='Tutte'||(category.startsWith('v3:league:')&&topics.leagues.includes(category.slice(10)))||(category.startsWith('v3:group:')&&!!groups[category.slice(9)]);}
function counts(questions){const totals={Tutte:questions.length};for(const g of topics.groups)totals['v3:group:'+g.id]=0;for(const c of topics.leagues)totals['v3:league:'+c]=0;for(const q of questions){const grp=bySource[q.category]||'trivia';totals['v3:group:'+grp]++;if(topics.leagues.includes(q.category))totals['v3:league:'+q.category]++;}return totals;}
module.exports={topics,matches,valid,counts};
