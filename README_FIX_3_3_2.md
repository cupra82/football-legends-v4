# Football Legends 3.3.2 — Conteggi reali delle categorie

## Correzione

Il precedente `GET /api/questions` inviava un campione di 2.500 domande, mentre la home mostrava il numero totale sul server (esempio: 22.803). I contatori delle categorie venivano calcolati soltanto sul campione, non sull’intera banca dati.

Ora `/api/topics` fornisce il numero effettivo di domande per ciascun argomento sul server; il frontend mostra quei numeri in ogni scheda. Quando si avvia una partita solitaria o un duello scegliendo una categoria, il browser chiama `/api/questions?category=v3:group:world&limit=3500` (esempio) e recupera le domande pertinenti anziché usare soltanto il campione iniziale. Arena online continua a pescare direttamente dal database del server.

**Nota:** la correzione non genera nuove domande: mette a disposizione le domande che già esistono e non inventa conteggi. Il limite di 3.500 per richiesta è intenzionale; per partite da 10–30 è più che sufficiente. Il Mix totale continua a partire dal campione bilanciato.

## Installazione

Sostituisci solo `server.js`, `index.html`, `package.json` se hai già la 3.3.1 correttamente installata, oppure copia il pacchetto completo nel repository esistente. Mantieni tutti gli archivi `*-generated.json`, i dati di Supabase e le variabili Render. Commit e Push su GitHub Desktop, poi attendi che Render sia Live e ricarica la pagina con Ctrl+Shift+R. Nessun Run workflow necessario per questa correzione.

Verifica `https://football-legends-okp1.onrender.com/api/version` e `https://football-legends-okp1.onrender.com/api/topics`.
