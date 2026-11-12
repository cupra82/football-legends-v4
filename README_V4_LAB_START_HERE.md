# FOOTBALL LEGENDS 4.0 — LAB (progetto separato)

Questa è la **base sperimentale 4.0**, derivata dalla versione 3.3.7, con la grafica conservata e il generatore protetto. Include modalità Rush, Ranked, Tornei e sala d’attesa con conferma di disponibilità.

## Sicurezza / isolamento

- Usa il repository `cupra82/football-legends-v4`. Non caricare questi file in `football-legends`.
- Crea un **secondo servizio Render**; NON cambiare il servizio esistente.
- Crea un **nuovo progetto Supabase di test**, senza condividere la `DATABASE_URL` della produzione.
- Se `DATABASE_URL` è presente, il server V4 rifiuta l'avvio finché non imposti `FL_V4_DB_ISOLATED=YES`. Questo flag conferma che **hai verificato** di usare il DB di test: non separa automaticamente i database.
- Per vedere subito grafica e giocare in solitaria puoi non configurare `DATABASE_URL`; i profili persistenti e la classifica online richiedono invece il DB di test.
- Gli aggiornamenti del lunedì sono **disattivati nella V4**; rimane `Run workflow` manuale.
- Gli archivi `*-generated.json` non sono inclusi in questo pacchetto. Sono conservati nel repository ufficiale e **non vengono modificati** dalla V4. Per avere la stessa quantità di domande in V4, copia nel solo repository V4 i file generati dal repository ufficiale, oppure avvia manualmente il generatore sul repo V4.
- La versione V4 è identificabile da `/api/version`: `4.0.4-lab`.

## Installazione GitHub Desktop

1. In GitHub Desktop: File > Clone repository > `cupra82/football-legends-v4`.
2. Repository > Show in Explorer (assicurati di essere **nel repository v4**, non quello ufficiale).
3. Copia **il contenuto** di questo ZIP nella cartella clonata, non la cartella ZIP stessa.
4. Commit to main e Push origin.

## Render

New > Web Service > repository `cupra82/football-legends-v4`.
- Branch: `main`
- Language: Node
- Build command: `npm install`
- Start command: `npm start`
- Environment: `NODE_ENV=production`
- Environment: NON copiare `DATABASE_URL` del Render ufficiale. Quando il secondo Supabase sarà pronto, inserisci la sua stringa e `FL_V4_DB_ISOLATED=YES`.

## Funzioni incluse in 4.0.4

- **Arena online classica**: resta disponibile con profili, partite e rivincite.
- **Sala d'attesa**: nickname, conferma "Pronto" e countdown di 3 secondi. La conferma è obbligatoria per Ranked.
- **Ranked**: selezione in Arena online prima di creare la stanza; Elo iniziale 1000, aggiornato nel DB test in base al risultato. Classifica separata dalle amichevoli.
- **Tornei 4/8 giocatori**: i partecipanti entrano con codice, confermano Pronto e disputano turni eliminatori con 10 quesiti. I perdenti seguono come spettatori, mentre il vincitore viene registrato nel DB test.
- **Rush 60/90 secondi**: quesiti e risposta gestiti lato server, bonus per serie corrette, record personali e classifica dedicata su Supabase test.
- **Nuove tabelle**: fl_v4_ratings, fl_v4_ranked_rounds, fl_v4_rush, fl_v4_tournaments. Il server le crea all'avvio con la DATABASE_URL del progetto Supabase V4.

## Limiti noti e collaudo

- Non è implementata la riconnessione a tornei interrotti: se un partecipante si disconnette il torneo si annulla. Anche le stanze Arena originali non supportano la ripresa integrale dopo un riavvio Render.
- Il rating è un Elo base senza stagioni; non è un matchmaking pubblico: giochiamo con codici privati.
- Rush e tornei richiedono un nickname registrato in Arena online e il database Supabase LAB configurato.
- Le sessioni Rush e i tornei in corso sono tenuti in memoria sul server; un riavvio Render interrompe la sessione ma non cancella i record già salvati.
- Non esistono ancora vere prove di carico online con otto browser contemporanei: prima di considerarlo stabile, verificare una partita con amici.

**Non modificare** il servizio Render ufficiale, la sua variabile `DATABASE_URL` o il repository `football-legends`.
