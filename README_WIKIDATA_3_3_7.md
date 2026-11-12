# Football Legends 3.3.7 — Generatore Wikidata più robusto

Solo generatore e workflow. Grafica, server e categorie invariati.

- Timeout per richiesta 12 secondi (prima 45); un solo tentativo aggiuntivo se la richiesta fallisce per timeout/errore temporaneo.
- Budget complessivo 4 minuti per lo script; interrompe la ricerca di nuovi club in modo ordinato e completa l’archivio già elaborato.
- Salvataggio atomico della cache dopo ogni club elaborato; se una richiesta successiva fallisce, i club precedenti restano registrati.
- Aggiornamento del lunedì invariato, `25 6 * * 1` (06:25 UTC).
- Numero massimo di nuovi club per run: 24. Se scade il budget, ne completa meno.
- Il job completo GitHub Actions ha ora un limite di 15 minuti.

## Installazione
Sostituisci nel repository solo `scripts/build-wikidata.js` e `.github/workflows/update-questions.yml`, fai Commit e Push. Mantieni tutti i `*-generated.json`, `wikidata-clubs.json` e `wikidata-club-cache.json` già presenti. NON serve cancellare nulla o premere Run workflow per applicare la protezione al prossimo lunedì.

## Limiti
Wikidata può essere lento o indisponibile; questo aggiornamento limita l’attesa e preserva gli avanzamenti, ma non garantisce nuove domande a ogni run. Il salvataggio del repository avviene nel passo GitHub finale: se un job viene cancellato forzatamente prima di quel passo, i dati della run possono comunque non essere pubblicati su GitHub.
