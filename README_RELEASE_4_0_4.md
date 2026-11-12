# FOOTBALL LEGENDS 4.0.4 LAB — THE NEXT LEVEL

## Pacchetto esclusivo del repository `cupra82/football-legends-v4`

Non copiare sul repository ufficiale `football-legends` e non riutilizzare il database di produzione.

### Novità effettivamente implementate

1. **Sala d'attesa PC:** nomi dei partecipanti, stato Pronto, countdown di 3 secondi. Nelle Ranked tutti devono confermare Pronto.
2. **Arena Ranked:** checkbox nella sezione Arena online prima di creare una stanza. Elo iniziale 1000, aggiornato dopo la partita solo nel database test. Classifica Ranked separata e divisioni Bronzo, Argento, Oro, Platino, Diamante, Leggenda.
3. **Tornei privati:** stanza con codice per 4 o 8 amici, tutti da computer separati, tabellone eliminatorio, 10 domande per turno e finale. Gli eliminati restano spettatori. Un abbandono di un giocatore annulla il torneo (riconnessione non ancora supportata).
4. **Rush:** partita da 60/90 secondi, correzione e punteggio lato server, punti serie e classifica Rush permanente nel Supabase LAB. Necessita di nickname già registrato in Arena.
5. **Versione visualizzata:** `4.0.4 · THE NEXT LEVEL · LAB` e `/api/version` = `4.0.4-lab`.

Il design, le categorie, le immagini, il gioco classico e gli archivi di domande rimangono invariati.

### Installazione

1. In GitHub Desktop scegli **Current repository: football-legends-v4**, fai Fetch e Pull se disponibili.
2. Esegui **Repository > Show in Explorer**.
3. Estrai lo ZIP e copia il **contenuto**, incluse la cartella `.github` e i nuovi file `v4-competitive.js` e `v4-ui.js`, nella cartella GitHub V4, sostituendo gli omonimi.
4. **Non eliminare** `people-generated.json`, `questions-generated.json`, `wikidata-generated.json`, `wikidata-clubs.json` o gli altri archivi `*-generated.json` presenti nel tuo repository.
5. Fai Commit to main e Push origin.
6. Render `football-legends-v4` deve avere `FL_V4_DB_ISOLATED=YES` e `DATABASE_URL` **del nuovo Supabase V4**, mai quella della produzione. Il codice crea automaticamente le tabelle V4 alla partenza.
7. Al deploy `Live`, apri `https://football-legends-v4.onrender.com/api/version` e `https://football-legends-v4.onrender.com/api/v4/info` (deve indicare `databaseReady: true`). Poi aggiorna il browser con Ctrl+Shift+R.

### Giocare

- Per Rush o Tornei: crea prima un profilo dalla sezione **Arena online**. Poi torna alla home e scegli la modalità desiderata.
- Per Ranked: **Arena online > Sfida classificata (Elo)**, quindi crea la stanza e attendi tutti pronti.
- Per tornei: l'organizzatore sceglie 4/8 partecipanti, copia il codice, gli amici entrano dal loro browser, segnano Pronto, l'organizzatore avvia.
- Per Rush: scegli 60 o 90 secondi, avvia e sfida la classifica personale.

### Isolamento e limiti

- Le nuove tabelle sul **solo DB V4** sono `fl_v4_ratings`, `fl_v4_ranked_rounds`, `fl_v4_rush`, `fl_v4_tournaments`.
- `FL_V4_DB_ISOLATED=YES` è una conferma esplicita ma **non verifica automaticamente** che la connessione Supabase sia diversa da quella della versione ufficiale; è responsabilità di configurazione.
- Il workflow V4 è **manuale**, non gira ogni lunedì.
- I database `*-generated.json` non sono inclusi nello ZIP per non creare conflitti con GitHub Actions; rimangono quelli già presenti nel repository.
- Le partite Rush/tourne in corso non sopravvivono a un riavvio Render. Lo score già salvato su Supabase sì.
- Matchmaking pubblico, reconnessione a torneo, stagioni Ranked e risultati in tempo reale su più processi non sono ancora implementati.

### Verifiche eseguite localmente

- `node --check` su `server.js`, `v4-competitive.js`, `v4-ui.js` e gli script incorporati in `index.html`.
- `test-almanac.js`, `test-bank.js`, `test-people-bank.js`, `scripts/test-deep-history.js` e `scripts/test-wikidata-priority.js` superati.
- Test simulato con quattro WebSocket: creazione stanza torneo, ingressi, conferme Pronto, tabellone, domanda, risposte e rivelazione della soluzione. Il test è incluso come `test-v4-modes.js`.
- **Non** effettuato un collaudo reale con Render e Supabase, perché non abbiamo accesso alle credenziali del servizio né un ambiente PostgreSQL di test in questo runtime.
