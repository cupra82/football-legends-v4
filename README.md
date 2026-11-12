# FOOTBALL LEGENDS 4.0.0 — ULTIMATE EDITION

Gioco browser **desktop-first**, per partite di calcio quiz tra amici. Repository autonomo: `cupra82/football-legends-v4`. Non modificare l'altro repository.

**Modalità reali incluse:** Carriera solitaria, Duello locale, Arena online fino a 8 persone, Rush 60/90 secondi, Tornei da 4/8, Ranked Elo e classifiche Supabase. Stesse tre alternative per domanda. Restyling completo Ultimate Edition, comandi da tastiera per il quiz classico e mini traguardi solitari sul browser.

## Installazione

1. In GitHub Desktop seleziona **football-legends-v4** e fai Pull se necessario.
2. **Conserva** tutti gli archivi già generati: `questions-generated.json`, `people-generated.json`, `wikidata-generated.json`, `competition-history-generated.json`, `european-cups-generated.json`, `stadiums-wikidata-generated.json`, `famous-careers-generated.json`, ecc.
3. Copia **tutti i file di questo ZIP** nella cartella del repository V4, sovrascrivendo quelli omonimi. Lo ZIP non contiene i grandi archivi JSON già importati; non cancellarli!
4. Fai Commit / Push; Render V4 pubblica il sito se Auto Deploy è attivo.
5. Prima di invitare gli amici, vai su **Actions → V4 4.0.0 - Verifica pre-lancio (manuale) → Run workflow**. Se non va a buon fine, esamina il log: non annunciare la release come completa.
6. Apri `/api/version` e `/api/status` sul servizio V4. Devono mostrare `4.0.0` e il totale effettivo delle domande.

## Aggiornamento delle domande

Il workflow **V4 4.0.0 - Aggiorna tutto l'archivio (lunedi + manuale)** è previsto ogni lunedì alle **06:40 UTC**. Cerca dati nelle fonti già integrate e conserva i file precedenti. Le domande nuove dipendono dai dati disponibili, non sono garantite settimanalmente. Per avere tutte le 35.000+ domande attuali, è indispensabile mantenere i JSON grandi già presenti sul repository V4.

## Database V4 separato

Su Render V4 usa solo `DATABASE_URL` del Supabase V4 indipendente e `FL_V4_DB_ISOLATED=YES`. Questa flag **non verifica da sola** l'identità del database: controlla concretamente che l'host della connessione sia quello del progetto Supabase V4. Non copiare mai la URL di produzione di un altro gioco.

## Test e limiti

- `npm test` testa archivi/generatori; `npm run check:release` mostra le categorie. `node scripts/release-preflight.js --strict` interrompe il rilascio se mancano gli archivi grandi.
- Per testare online: due profili distinti per Arena, quattro per un torneo, una Rush completa, una Ranked e verifica della persistenza dopo riavvio Render.
- Le stanze e i tornei sono **in memoria**, quindi riavvii del server/disconnessioni durante un torneo interrompono la sessione. I profili e rating salvati in Supabase restano.
- Non si promettono 2.000 domande per categoria: il rapporto riporta i numeri effettivi.

Non affiliato a FIFA, UEFA o club calcistici.
