# Football Legends 4.1.0 — World Football Archive

## Installazione

1. In GitHub Desktop apri esclusivamente `football-legends-v4` e fai Fetch/Pull.
2. **Non eliminare i JSON generati già presenti sul repository**. Questo ZIP contiene il codice, non gli archivi online accumulati.
3. Estrai lo ZIP nella cartella del repository, sovrascrivendo i file omonimi. Esegui Commit to main e Push origin.
4. GitHub → Actions → **V4.1.0 - Espandi calcio mondiale (club stadi giocatori allenatori)** → Run workflow (`main`).
5. Dopo il completamento verifica il commit del bot, il deploy Render e `https://football-legends-v4.onrender.com/api/v410/sources`.
6. Controlla i **conteggi effettivi** della nuova generazione nel log del workflow. Non viene promesso un numero prestabilito di nuove domande.

## Fonti aggiunte

- https://github.com/openfootball/clubs (CC0): grandi club, stadi riportati e anni di fondazione. Gli stadi sono formulati come *associati nell'archivio*, non necessariamente attuali.
- https://github.com/openfootball/football.json (CC0): ricostruzione delle classifiche complete delle maggiori leghe. Una stagione incompleta o con parità di punti in testa viene ignorata.
- https://www.wikidata.org (CC0): giocatori e club (P54), allenatori dei club (P286), sfruttando cataloghi/cache già accumulati dalla V4.

Il lavoro è incrementale: i checkpoint rimangono in GitHub, e se una fonte non risponde le domande precedenti non vengono cancellate. Le nuove domande hanno 3 alternative, risposta, spiegazione e URL della fonte.

## Archivi preservati

`questions-generated.json`, `people-generated.json`, `wikidata-generated.json`, `themed-generated.json`, `famous-careers-generated.json`, tutti gli altri `*-generated.json`, profili e classifiche Supabase.

## Controlli

`node scripts/test-v410-world.js` verifica il parser dei dati e la struttura delle domande. Il rapporto `category-report.md` conta le domande valide per ogni categoria, ma non certifica la correttezza storica di tutti i dati esterni.

## Nota sulle modalità

Le nuove domande di campionati, grandi club, stadi e tecnici sono utilizzabili anche con **Solo calcio famoso** (filtro conservativo). L'archivio completo resta invariato.

## Stato della release

È necessario eseguire il workflow online per scaricare le fonti e conoscere il totale reale. Test multiplayer con più browser e funzionamento su Render devono essere verificati nel progetto V4.
