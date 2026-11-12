# Football Legends 2.0 — Almanacco divertente

**Focus:** Mondiali, EURO, Champions, stadi famosi, derby, leggende, allenatori, Pallone d’Oro e campionati europei. Sempre tre scelte.

- `classics-questions.json`: 156 domande curate, incluse nella selezione server.
- `people-questions.json`, `portugal-questions.json`, `questions.json`: archivio storico precedente.
- `people-generated.json`: profili da archivio biografico (se presenti nel repository).
- `questions-generated.json`: domande su campionati (rigenerate dal lunedì, solo classifiche complete).
- `football-bank.js`: genera domande su prime posizioni, senza risultati/gol di partite casuali.
- `server.js`: seleziona le domande miste bilanciando argomenti, con massimo circa 25% di nazionalità/ruolo/epoca quando la scelta è “Tutte”.
- `index.html`: applica lo stesso criterio alla carriera solitaria.

## Aggiornamento
1. GitHub Desktop → Fetch/Pull (quando necessario) → copia i file → Commit → Push origin.
2. GitHub Actions → Aggiorna archivio Football Legends → Run workflow per rigenerare subito, senza attendere lunedì.
3. Verifica `/api/version` e `/api/status`. **Non eliminare i JSON generati esistenti prima della prima rigenerazione riuscita.**

Le 156 domande aggiuntive sono dati storici stabili; gli aggiornamenti del lunedì non garantiscono nuove domande se le fonti non sono cambiate. Non sono stati verificati qui i download remoti del workflow.


## v2.1.2
- categorie riordinate: campionati, coppe, altri argomenti
- foto differenziate per Allenatori e tecnici, Calciatori leggendari, Leggende, Curiosità, Europei, Nazionali, Europa/UEFA


# Football Legends 2.3 — Controllo database per categoria

Questo pacchetto **non contiene 2.000 domande per ciascun argomento**. L'obiettivo richiesto è impostato a 2.000, ma il contatore riporta solo le domande effettivamente presenti. Non crea domande fittizie per raggiungere la quota.

## Novità
- Rapporto `category-report.md` per ogni categoria: presenti / obiettivo / mancanti.
- Scarta domande di risultati casuali dall'audit, controlla opzioni, duplicati e risposte valide.
- `GET /api/status` include tutte le categorie, anche quando hanno zero domande, con `target: 2000`.
- GitHub Actions rigenera l'archivio il lunedì e aggiorna il rapporto.
- Prosegue la generazione delle domande sui campionati da fonti OpenFootball e sui profili dal dataset Reep.

## Installazione
1. GitHub Desktop: Fetch/Pull origin; copia i file e le cartelle di questo ZIP nel repository (sovrascrivi i file omonimi).
2. **Non cancellare** `questions-generated.json` e `people-generated.json` se sono già in GitHub.
3. Commit to main e Push origin.
4. GitHub > Actions > Aggiorna archivio Football Legends > Run workflow (una volta).
5. A fine esecuzione guarda il file `category-report.md` nel repository o `/api/status` su Render.
6. Render Auto Deploy aggiorna il sito. DATABASE_URL su Render non va toccata.

## Importante
I campionati storici vengono derivati da calendari completi, non da un archivio di trasferimenti. Nessuna fonte attuale può verificare automaticamente tutte le carriere e i 2.000 fatti ricchi richiesti per ciascuno dei 30+ argomenti. Per quel risultato serviranno ulteriori fonti affidabili, licenze compatibili e controlli redazionali. `Run workflow` non garantisce il raggiungimento della soglia: serve a eseguire il generatore e misurare quanto produce davvero.

Le statistiche globali dipendono dal database Supabase esterno, non dai file JSON del repository.

## 3.0 — 11 macro-categorie + Mix
Menu semplificato per Carriera, Duello, Arena. Sotto Grandi campionati europei puoi selezionare una lega. Il server usa gli stessi filtri e restituisce i conteggi su `/api/topics`. Le domande originali NON vengono duplicate. Obiettivi quantitativi precedenti non ancora raggiunti. Conservare gli archivi generati del repository.
