# FOOTBALL LEGENDS 4.1 — CINEMATIC EDITION · LAB

## Pacchetto completo del codice
V4.1 include il gioco V4.0.4 (Arena, Ranked, Rush, tornei), homepage cinematografica **nuova**, stile desktop aggiornato per domande, classifiche e lobby, e un'immagine originale di stadio. È destinato **solo** a `cupra82/football-legends-v4` e al suo Render/Supabase separati.

## Grande archivio domande: importante
**Questo ZIP non contiene i grandi JSON generati**, perché non erano disponibili nell'ambiente in cui è stato assemblato. Contiene invece la procedura **verificabile** per importarli una sola volta dai file pubblici del repository originale e copiarli nel repository V4. Il sito V4 resta autonomo **dopo** questa importazione: non scarica domande dalla V3 ad ogni partita.

### Cosa fare
1. In GitHub Desktop selezionare **football-legends-v4** (non football-legends), effettuare Fetch/Pull, copiare tutti i file di questo ZIP e fare Commit + Push.
2. GitHub → `football-legends-v4` → Actions → **V4 - Importa grande archivio domande (una tantum)** → Run workflow. Il workflow importa `questions-generated.json`, `people-generated.json` e `wikidata-generated.json` dal repository originale pubblico, verifica che abbiano formato corretto, li committa nella V4 e attiva il deploy Render V4 se Auto Deploy è abilitato.
3. Verificare il log: conteggio reale per file e messaggio `Archivio V4 indipendente pronto.`. Verificare `/api/status` sul Render della V4 e il menu categoria.
4. Controllare V4 su https://football-legends-v4.onrender.com/api/version: deve riportare `4.1.0-lab`.
5. Se uno dei file non è accessibile, il workflow fallisce esplicitamente e NON finge il raggiungimento del numero di domande. Correggere l'accesso e ritentare.

### Cosa resta separato
- Database PostgreSQL `DATABASE_URL`: **esclusivamente** quello Supabase della V4.
- `FL_V4_DB_ISOLATED=YES` richiesto dal codice.
- Nickname, partite, classifiche e rating della V4 separati dal gioco stabile.
- Workflow aggiornamento domande della V4 ancora **manuale**: l'importazione una tantum non modifica né disabilita il workflow del repository originale.

### Cosa è verificato e cosa no
- Il codice CSS/JS è incluso; la versione viene aggiornata a 4.1.0-lab.
- Il grande archivio viene importato via rete **da GitHub Actions**, non è incluso nel pacchetto ZIP. L'importazione reale non è stata eseguita qui per assenza di accesso di rete nel container.
- Le funzioni Arena, tornei, Ranked e Rush derivano dalla V4.0.4; il collaudo completo con più PC connessi al servizio Render richiede una prova online.
- Si possono vedere conteggi differenti da quelli pubblicati nella V3, in base alle versioni dei file esportati, ai filtri e a eventuali deduplicazioni.
