# FOOTBALL LEGENDS 4.0.3 — Rivali, statistica e Almanacco

## Installazione sicura

1. Apri GitHub Desktop e seleziona SOLO `cupra82/football-legends-v4`.
2. Fetch/Pull origin per recuperare gli ultimi JSON generati prima di copiare.
3. Fai una copia di sicurezza della cartella del repository.
4. Copia i file dello ZIP nella **radice** del repository V4, sostituendo solo i file omonimi.
5. Non cancellare o sovrascrivere `*-generated.json`, `*-progress.json`, i report e la cartella `.git`. I dati delle domande **non sono inclusi** nello ZIP per evitare di tornare a una copia vecchia.
6. Commit to main -> Push origin. Controlla Render `football-legends-v4` in stato Live.
7. Vai su `https://football-legends-v4.onrender.com/api/version`: versione `4.0.3`.
8. Controlla `/api/v403/status`: `databaseReady` deve essere `true` per le statistiche persistenti.

**Nessun Run workflow necessario** per questa release. Non cambiamo le domande o il generatore.

## Nuove funzionalità

- **Il mio percorso** nel menu: percentuali corrette per argomento in Carriera solitaria (salvate nel browser), e scontri diretti / statistiche Arena / trofei (salvati nel Supabase della V4).
- **Rivalità**: V e S e sfide totali contro ogni avversario. Un solo record per partita/avversario, anche dopo i riavvii di Render.
- **Statistiche per argomento**: conteggiate da nuove partite Arena sul server per evitare che il browser inventi punteggi; Carriera solitaria locale per dispositivo.
- **Trofei**: primo accesso Arena, veterano Arena, punteggi, risposte corrette, Rush e torneo; trofei solitari sul browser.
- **Almanacco**: spiegazione della risposta quando la domanda la contiene; storico consultabile dopo una partita classica; almanacco finale Rush e spiegazione durante le partite torneo. Nessuna spiegazione o fonte viene inventata.
- **Segnalazioni**: nella schermata della domanda, dopo aver risposto, premi `Segnala domanda`, scegli un motivo e invia. Serve il proprio nickname Arena registrato. I dati finiscono in Supabase, tabella `fl403_reports`.

## Persistenza / compatibilità

Le nuove tabelle `fl403_*` vengono create automaticamente al primo avvio se `DATABASE_URL` è valido e `FL_V4_DB_ISOLATED=YES` su Render V4. Le tabelle esistenti (profili, classifiche, tornei, Rush) non vengono eliminate né migrate. Il database della versione precedente del gioco non viene usato.

**Importante**: la vecchia classifica è conservata, ma i dettagli per categoria e per avversario iniziano **con le partite disputate dopo l'installazione della 4.0.3**; non possiamo ricostruire lo storico delle singole risposte dagli aggregati precedenti.

Per leggere i report: Supabase V4 -> Table Editor -> `fl403_reports` (connesso al progetto di TEST).

Le segnalazioni sono solo archiviate per revisione. Non correggono automaticamente le domande e non cambiano i risultati già salvati.

## Verifiche effettuate

- Sintassi Node dei file JavaScript modificati.
- Test esistenti per domande, almanacco e formati torneo.
- `node test-v403.js` con database PostgreSQL simulato: categorie, scontri diretti, autenticazione, report e trofei.
- Verifica dell'integrità ZIP.

**Da collaudare dopo il deploy**: database Supabase reale con più PC, partite complete Arena/Ranked/Rush/Torneo, UI nel browser Render (il browser di prova locale non era accessibile in questo ambiente). Non dichiarare questi scenari collaudati prima di provarli.
