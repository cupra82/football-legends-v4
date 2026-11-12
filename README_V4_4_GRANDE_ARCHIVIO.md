# Football Legends V4.4 — Temi, leggende, premi, stadi e derby

## Installazione nel SOLO repository V4

1. GitHub Desktop: selezionare `cupra82/football-legends-v4`, verificare il branch `main`.
2. Estrarre ZIP; copiare i file nella root del repository, sostituendo gli omonimi. **Non cancellare** `people-generated.json`, `wikidata-generated.json`, `questions-generated.json`, `competition-history-generated.json`, `european-cups-generated.json`, `wikidata-clubs.json`, `wikidata-club-cache.json`, database di produzione, `.git`.
3. Fare Commit e Push. Attendere Render Live.
4. GitHub Actions nel repository V4: eseguire una sola volta **V4 - MEGA archivio unico (coppe, stadi, leggende e premi)** su `main` per produrre ulteriori domande da Wikidata e aggiornare gli archivi storici.
5. Dopo la spunta verde e il nuovo deploy Render, premere Ctrl+Shift+R e controllare `/api/status` e i contatori in Carriera solitaria.

## Risultato immediato (domande gia comprese nello ZIP)

- **431** nuove domande candidate, prodotte e verificate strutturalmente: 222 stadi, 135 derby/rivalita, 48 Pallone d'Oro, 26 leggende.
- I testi hanno tre opzioni diverse, risposta valida, spiegazione e fonte; non ci sono duplicati testuali interni. Il rapporto puo trovare duplicati rispetto a file storici gia presenti.
- L'interfaccia cinematografica, le modalita multiplayer e Supabase sono conservati.
- Il server carica i nuovi file `themed-generated.json` e `stadiums-wikidata-generated.json` anche in Duello e Arena.

## Generatore Wikidata P115

- Usa il catalogo `wikidata-clubs.json` creato dal generatore attuale (non lo sovrascrive).
- Per ogni club consulta `home venue (P115)`; genera domande solo quando il collegamento allo stadio e univoco e l'etichetta esiste.
- Controlla 500 club al massimo per esecuzione (modificabile), 30 per query, con timeout per richiesta di 12 secondi e budget di circa 160 secondi.
- Conserva un checkpoint degli ID dei club verificati. Conserva le domande precedenti quando una fonte non risponde.
- Il dato e uno snapshot Wikidata, potrebbe essere aggiornato con ritardo. Le risposte sono da valutare e correggere manualmente se la voce fonte contiene errori.
- Wikidata non copre tutti i club e una esecuzione puo aggiungere zero nuove domande.

## Importantissimo

La V4.4 **non** ha ancora 2.000 domande per categoria. L'espansione immediata e di 431 nuovi quesiti verificati nel formato, non di migliaia. Il numero effettivo caricabile e verificabile dal server dopo il deploy.

L'aggiornamento programmato resta il lunedi alle 06:40 UTC (07:40 in inverno svizzero); e in GitHub Actions, non Render. La nuova sequenza e in un unico workflow; gli altri workflow storici possono ancora comparire nell'elenco GitHub ma non vanno lanciati per questo aggiornamento.
