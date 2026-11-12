# Football Legends — generatore Wikidata 3.3.6

## Scopo
Aggiorna solo `scripts/build-wikidata.js`, `scripts/wikidata-bank.js` e il workflow automatico. Grafica, multiplayer, classifiche e archivio storico 3.3.5 rimangono invariati; la voce versione nel gioco resta 3.3.5 perché non sono state apportate modifiche alla pagina.

## Novità
- Elaborazione di **24 club per esecuzione** per impostazione predefinita (prima 12; personalizzabile con `FL_CLUBS_PER_RUN` fino a 30).
- Selezione distribuita tra paesi anziché ordine di ID Wikidata; fra i candidati la presenza di collegamenti a Wikipedia viene usata come indicatore di documentazione disponibile.
- Club senza profili memorizzati in `wikidata-club-cache.json`, evitando richieste ripetute.
- Nessuna perdita di domande preesistenti in caso di indisponibilità del servizio.
- La stampa del log mostra **nuove domande effettivamente aggiunte** rispetto all'archivio precedente, oltre al totale.
- Le alternative errate a una domanda sulla carriera escludono altri club presenti nella carriera nota del giocatore.
- Test automatico delle priorità e dei distrattori.

## Importantissimo
I 24 club non sono 24 club totali: sono 24 nuovi club processati **a ogni esecuzione**, fino ad ampliare il catalogo mondiale. Non promettiamo che generino tutti domande. Una esecuzione riuscita può aggiungere 0 domande se Wikidata non fornisce nuovi dati.

## Installazione senza conflitti
1. Copia nella cartella GitHub **tutti i file del pacchetto**, sostituendo gli omonimi.
2. Non eliminare mai `wikidata-generated.json`, `wikidata-clubs.json`, `wikidata-club-cache.json`, `questions-generated.json`, `people-generated.json` già presenti.
3. Gli archivi generati e `category-report.json`/`.md` **non sono inclusi** nello ZIP, per evitare conflitti con GitHub Actions.
4. Commit to main, Push origin; quindi esegui manualmente `Aggiorna archivio Football Legends` una volta per testare il generatore.
5. Apri il log `Genera quesiti Wikidata`; cerca la riga `nuove domande`.

Nota: non sono state effettuate interrogazioni live al servizio Wikidata in questa sessione; i test sono locali con dati simulati. 
