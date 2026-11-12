# Football Legends 3.1 — Sorgenti strutturate e ufficiali

## Fonti integrate

1. **Wikidata SPARQL** (`scripts/build-wikidata.js`, `scripts/wikidata-bank.js`). Dati strutturati CC0. Query con `LIMIT 120` per singolo club (Juventus Q1422, Real Madrid Q8682, FC Barcelona Q7156). Attualmente produce, quando i dati arrivano, domande di anno e città natale per profili associati a quei club. L'integrazione è deliberatamente limitata e incrementale, **non copre già tutti gli undici argomenti**.
2. **UEFA Champions**: https://www.uefa.com/uefachampionsleague/history/ — 28 edizioni 1992/93–2019/20.
3. **UEFA EURO**: https://www.uefa.com/uefaeuro/history/ — 17 edizioni 1960–2024.
4. **FIFA World Cup Archives**: https://www.archives.fifa.com/fifa_world_cup — 22 edizioni maschili concluse dal 1930 al 2022.

I risultati storici sono dati fattuali inseriti e revisionati nel codice: `scripts/build-official.js` genera `official-questions.json`. Nessuna API non documentata UEFA/FIFA viene interrogata e nessun articolo viene copiato.

## Aggiornamento settimanale

Il workflow esistente aggiunge `node scripts/build-wikidata.js` al lunedì e controlla `node scripts/build-official.js --check`.
Wikidata può rispondere lentamente o limitare la richiesta: il codice usa 30 secondi di timeout a richiesta, un User-Agent identificativo e soglie minime. Se il servizio fallisce o restituisce molte meno domande del precedente, il file `wikidata-generated.json` NON viene sostituito. Il gioco funziona anche senza questo file.

**Importante:** l'archivio ufficiale UEFA/FIFA è un elenco storico curato, non un feed live. Le nuove edizioni devono essere verificate e inserite manualmente nel file per evitare errori. Non è stato possibile connettersi a Wikidata dall'ambiente di produzione dello ZIP: i conteggi Wikidata saranno noti solo dopo l'esecuzione del workflow GitHub.

## Verifiche

```bash
node scripts/test-new-sources.js
node scripts/build-official.js --check
node scripts/audit-categories.js
node --check server.js
```

Il report include `official-questions.json` e, quando disponibile, `wikidata-generated.json`, e non finge che l'obiettivo minimo di 2.000 domande sia già stato raggiunto.
