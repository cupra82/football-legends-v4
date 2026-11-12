# FOOTBALL LEGENDS 4.0 — LAB (progetto separato)

Questa è la **base sperimentale 4.0**, derivata dalla versione 3.3.7, con la grafica conservata e il generatore protetto. È uno starter funzionante, **non** un rilascio finale delle nuove modalità 4.0.

## Sicurezza / isolamento

- Usa il repository `cupra82/football-legends-v4`. Non caricare questi file in `football-legends`.
- Crea un **secondo servizio Render**; NON cambiare il servizio esistente.
- Crea un **nuovo progetto Supabase di test**, senza condividere la `DATABASE_URL` della produzione.
- Se `DATABASE_URL` è presente, il server V4 rifiuta l'avvio finché non imposti `FL_V4_DB_ISOLATED=YES`. Questo flag conferma che **hai verificato** di usare il DB di test: non separa automaticamente i database.
- Per vedere subito grafica e giocare in solitaria puoi non configurare `DATABASE_URL`; i profili persistenti e la classifica online richiedono invece il DB di test.
- Gli aggiornamenti del lunedì sono **disattivati nella V4**; rimane `Run workflow` manuale.
- Gli archivi `*-generated.json` non sono inclusi in questo pacchetto. Sono conservati nel repository ufficiale e **non vengono modificati** dalla V4. Per avere la stessa quantità di domande in V4, copia nel solo repository V4 i file generati dal repository ufficiale, oppure avvia manualmente il generatore sul repo V4.
- La versione V4 è identificabile da `/api/version`: `4.0.0-lab`.

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

## Roadmap 4.0 (non ancora implementata)

1. Sala d'attesa evoluta: avatar/nickname, presenza, host, configurazione stanza e cronologia incontri.
2. Tornei a eliminazione per 4/8 amici, tabellone e gestione riconnessioni.
3. Ranking ELO con stagione e divisioni, separato dalle statistiche storiche.
4. Modalità Rush (60/90 secondi), classifica dedicata.
5. Statistiche per argomento e domande viste per account.
6. Archivio di domande con qualità verificata, distribuzione equilibrata e nessuna ripetizione frequente.

**Non modificare** il servizio Render ufficiale, la sua variabile `DATABASE_URL`, o il repository `football-legends`.
