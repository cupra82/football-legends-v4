# Football Legends 4.0.1 — Classifiche e tornei flessibili

Aggiornamento esclusivo del repository `cupra82/football-legends-v4`.

## Nuovo menu

- Un solo pulsante **CLASSIFICHE**, con due schede: **Generale** (vittorie, sconfitte, punti) e **Ranked** (Elo e divisioni).
- La modalità Ranked si avvia sempre da **Arena online**, attivando «Sfida classificata (Elo)»; non viene cancellata.

## Tornei

- Da **2 a 12 giocatori**, ognuno dal proprio PC, con codice stanza.
- Scelta della formula: **Automatica**, **Girone all'italiana**, **Eliminazione diretta**.
- Domande per incontro: **10, 15, 20 o 30**.
- Formula automatica: 2/4/8 eliminazione; 3 girone + finale; 5–7 girone + semifinali e finale; 9–12 due gironi + semifinali e finale.
- Eliminazione diretta: passaggi automatici (bye) quando il numero di giocatori non è potenza di due.
- Classifica gironi: 3 punti per vittoria; spareggi su punti quiz, risposte corrette e ordine iniziale sorteggiato.
- Gli scontri diretti risolvono i pari punti usando risposte corrette, tempo di risposta totale e infine il sorteggio iniziale.
- Tutti i giocatori devono essere presenti e pronti prima dell'avvio; in caso di disconnessione durante il torneo, il torneo viene annullato (limite già esistente).

## Installazione

1. GitHub Desktop: seleziona **football-legends-v4**.
2. Conserva tutti gli archivi `*-generated.json` già importati nel repository e il database Supabase V4.
3. Estrai lo ZIP e copia **tutti i file**, incluse le cartelle `.github`, `scripts` e `assets`, sostituendo gli omonimi.
4. Fai **Commit to main → Push origin**. Render V4 pubblicherà la nuova versione se Auto Deploy è attivo.
5. Apri `/api/version` sul servizio V4: deve rispondere `4.0.1`.
6. Non serve avviare il workflow delle domande: sono cambiate interfaccia e logica tornei, non gli archivi calcistici.

## Test

- `npm test` per generatori e formati di torneo;
- `node test-v4-modes.js` per protocollo base 4 giocatori (richiede `npm install`);
- `node test-tournament-server.js` per creazione/join/pronti/avvio 2–12 giocatori (non richiede credenziali DB).

La versione locale è stata controllata con test automatici e prova browser di navigazione. I tornei completi con vari PC e il salvataggio su Supabase V4 richiedono il collaudo dopo la pubblicazione.
