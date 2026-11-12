# Football Legends 3.3.4 — Archivio storico ampliato

## Aggiornamento
- Grafica/fotografie e layout invariati.
- Rimossa la categoria **Calcio femminile** dal menu e dalle domande servite.
- 483 nuove domande storiche contenute in `history-expansion.json` e caricate dal server nelle modalità solitaria, duello e online.
- Le nuove domande possono essere rigenerate/controllate con `node scripts/build-history-expansion.js --check` (il workflow GitHub le verifica).
- Nessuna modifica a Supabase, nickname, account e punteggi.

## Conteggio nuove domande incluse
- Leggende del calcio: 184
- Stadi famosi: 122
- Derby e rivalità: 28
- Pallone d'Oro e record: 56
- Mondiali di calcio: 44
- Champions e coppe europee: 32
- Europei e nazionali: 17
- **Totale: 483**

Questi numeri sono nuove domande del pacchetto: i conteggi complessivi nel gioco comprendono anche gli archivi già generati, non inclusi nello ZIP. Non sono state create 2.000 nuove domande per categoria.

## Installazione
Estrarre lo ZIP e copiare tutto il contenuto nella cartella radice del repository GitHub, sostituendo i file omonimi. Conservare `people-generated.json`, `questions-generated.json`, `wikidata-generated.json`, `wikidata-clubs.json` e `wikidata-club-cache.json` già presenti. Commit + Push; Render esegue il deploy. Non è necessario avviare il workflow per vedere subito le 483 nuove domande, perché sono già incluse nel file JSON del pacchetto.

## Fonti e limiti
Le domande sono basate su fatti storici ricostruiti da elenchi di vincitori e finaliste FIFA e UEFA, dall'albo d'oro di France Football, e da relazioni club–stadio, rivalità e carriere verificabili tramite Wikidata. Il controllo automatico verifica schema e duplicati testuali, **non certifica ogni fatto storico**; eventuali errori andranno corretti nell'archivio sorgente.
