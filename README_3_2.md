# Football Legends 3.2 — archivio ampliabile, interfaccia invariata

La grafica, le foto, i menu, il multiplayer e Supabase rimangono invariati rispetto alla 3.1.

## Aggiornamento del generatore Wikidata

- 9 club con ID Wikidata verificati: Juventus, Milan, Inter, Real Madrid, Barcellona, Manchester United, Liverpool, Bayern Monaco, PSG.
- Fino a 450 record per club (prima 120 per 3 club).
- Domande sul luogo e anno di nascita e cittadinanza verificate su Wikidata, associate alle categorie del campionato corretto.
- Niente risultati di singole partite; risposta corretta presa dai dati, distrattori distinti.
- Richieste sequenziali, pausa, timeout, stop su 429 e conservazione snapshot precedente se la fonte risponde male.
- Resta il generatore OpenFootball e l'archivio manuale UEFA/FIFA; **non** esiste scraping automatico di pagine Wikipedia, FIFA e UEFA.

**IMPORTANTE:** i numeri effettivi si conoscono solo dopo l'esecuzione del workflow su GitHub. Questo ZIP non contiene già 2.000 nuovi quiz per ogni argomento. I dati Wikidata possono essere incompleti o non aggiornati.

## Installazione

Sostituire nel repository il contenuto dello ZIP senza cancellare eventuali `*-generated.json`. Commit e Push. In GitHub → Actions → Aggiorna archivio Football Legends → Run workflow. Verificare il report `category-report.md` e l'API `/api/status` una volta completato il deploy Render.

Per generazioni molto grandi serviranno fonti curate per tornei, premi, allenatori e calcio femminile: le sole biografie di 9 club non possono riempire tutte le categorie.
