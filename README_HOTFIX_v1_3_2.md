# Football Legends 1.3.2 — Codice di recupero

## Problema risolto
Se il nickname era stato registrato prima che la finestra del codice di recupero fosse aggiunta, il giocatore poteva accedere ma non leggere il codice.

## Soluzione
- In Arena online, con un profilo già salvato su questo browser, compare **Genera nuovo codice di recupero**.
- Richiede conferma; il server verifica il token personale con Supabase.
- Il server sostituisce in un'unica operazione il sale e l'hash di recupero: il vecchio codice non funzionerà più.
- Il nuovo codice compare nella finestra protetta e non viene salvato in chiaro nel database o nei log.
- Il nickname, la classifica e il token dell'attuale dispositivo restano invariati.
- La registrazione di nuovi profili continua a mostrare il codice una volta sola.

## Installazione
1. Apri GitHub Desktop, **Fetch/Pull origin** prima di modificare i file.
2. Estrai lo ZIP; per questa correzione sostituisci **index.html**, **server.js**, **accounts-store.js** e **package.json** nel repository. Gli altri file del gioco e i file `questions-generated.json` / `people-generated.json` devono rimanere al loro posto.
3. **Commit to main → Push origin**.
4. Controlla su Render che la release sia Live e che `/api/version` mostri `1.3.2`.
5. Apri Football Legends → Arena online → `Genera nuovo codice di recupero`. Salva il codice nel gestore password. Non condividerlo.

## Sicurezza e limitazioni
- Chi possiede la sessione già autenticata su quel browser può ruotare il codice: non far usare il tuo browser a persone non fidate.
- Non salvare il codice nei messaggi condivisi o in GitHub.
- Il codice è mostrato una volta per ogni generazione. Se non lo conservi, puoi generarlo nuovamente dallo stesso browser, finché la sessione è valida.
- Se perdi **sia** il codice di recupero **sia** la sessione del dispositivo, non puoi recuperare automaticamente il profilo con questa versione.
- Le statistiche rimangono nel database Supabase. Nessuna migrazione DB richiesta.
