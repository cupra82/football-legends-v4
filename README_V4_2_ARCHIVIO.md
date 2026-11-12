# Football Legends 4.2 — Archivio storico delle competizioni

Questa release aggiorna SOLO il repository `cupra82/football-legends-v4`.
La grafica Cinematic, gli account e Supabase V4, Rush, Tornei e Ranked restano invariati.

## Che cosa contiene davvero lo ZIP?

- Codice completo V4.2 con grafica desktop della V4.1.
- Nuovo generatore `scripts/build-competition-history.js` che cerca **22 edizioni dei Mondiali** e **17 edizioni degli Europei** nei dataset OpenFootball CC0.
- Domande sulle fasi ad eliminazione diretta: avversari, semifinaliste, finaliste, marcatori di semifinali/finali e sedi delle finali.
- Nessun quesito sui risultati casuali dei gironi, nessun doppione speculare su ogni gara.
- Le domande prodotte saranno salvate in `competition-history-generated.json` nel repository **V4** dopo l'esecuzione su GitHub Actions.
- Controllo per duplicati rispetto alle domande storiche già presenti nello ZIP e contro il file generato in precedenza.
- Preservazione dell'ultimo archivio se le fonti non rispondono.
- I conteggi reali sono riportati da `category-report.json` e `category-report.md` dopo l'esecuzione.

## Installazione senza perdere i 34.564 quesiti importati

1. Apri GitHub Desktop e scegli SOLO `football-legends-v4`.
2. Copia dentro il repository tutto il contenuto dello ZIP V4.2, sostituendo i file omonimi.
3. Non eliminare `people-generated.json`, `wikidata-generated.json`, `questions-generated.json` e altri file `*-generated.json` già presenti. NON copiare una vecchia versione sopra tali archivi.
4. Commit to main -> Push origin; il nuovo Render V4 viene ridistribuito con Auto Deploy.
5. Nelle Actions V4 avvia **V4 - Amplia Mondiali ed Europei (archivio storico)** una volta.
6. Dopo la spunta verde, controlla che `competition-history-generated.json` sia stato creato, poi attendi che il V4 Render mostri Live e ricarica il browser con Ctrl+Shift+R.

L'aggiornamento ordinario dell'archivio rimane **manuale nella V4**: non è stato attivato uno schedule automatico del lunedì. Il workflow esistente "Aggiorna archivio Football Legends V4 LAB (manuale)" ora include anche la generazione delle competizioni.

## Limitazioni dichiarate

- Nello ZIP non sono compresi i file generati di 34.564 domande: sono nel tuo repository e non vanno eliminati.
- I risultati del generatore dipendono dalla disponibilità delle fonti di dati OpenFootball quando gira su GitHub.
- La V4.2 **non raggiunge ancora le 2.000 domande per categoria**. Non è incluso un generatore Champions automatico: le domande esistenti restano disponibili.
- Il test automatico verifica la logica su un piccolo torneo campione; il collaudo live con più PC e il conteggio dopo la generazione richiedono l'esecuzione sul tuo GitHub/Render.

## Fonti e licenza

- OpenFootball World Cup: https://github.com/openfootball/worldcup.json (CC0)
- OpenFootball Internationals, EURO: https://openfootball.github.io/internationals/ (CC0)
- Fonte esatta associata a ciascuna domanda nel campo `source`.
