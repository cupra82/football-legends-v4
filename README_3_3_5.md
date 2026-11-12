# Football Legends 3.3.5 — Tre grandi archivi storici

## Risultato effettivo
Nuove domande in `deep-history.json`: **350**. Suddivisione: **Mondiali: 83, Champions League: 188, Europei: 79**.

Il nuovo archivio è già nel pacchetto, senza necessità di Run workflow. Il generatore del lunedì e gli archivi `*-generated.json` precedenti restano invariati. Grafica e fotografie identiche alla 3.3.4.

## Fonti
- Albi delle finali di Coppa dei Campioni/Champions League: https://www.uefa.com/uefachampionsleague/history/ e https://en.wikipedia.org/wiki/List_of_European_Cup_and_UEFA_Champions_League_finals
- Coppa UEFA/Europa League: https://www.uefa.com/uefaeuropaleague/history/
- Mondiali: https://www.fifa.com/tournaments/mens/worldcup
- Marcatori Mondiali: https://www.fifa.com/en/member-associations/france/articles/top-goalscorers-leading-marksmen-golden-boot-fifa-world-cup-qatar-2022
- Europei e marcatori: https://www.uefa.com/uefaeuro/history/ e https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--every-euro-finals-top-scorer/

## Installazione
Copia i file dello ZIP nella radice del repository esistente, sostituendo gli omonimi. **NON** cancellare `questions-generated.json`, `people-generated.json`, `wikidata-generated.json` e gli altri archivi generati. Commit + Push. Evita di sostituire i `category-report.*` generati da GitHub Actions, così non generi conflitti di merge.

## Limiti
Le nuove domande derivano da una banca dati di fatti storici selezionati e controlli automatici dello schema e delle risposte. Non significa 2.000 per ognuna delle tre categorie. Alcune domande trattano fatti collegati allo stesso torneo da prospettive differenti (allenatore, marcatore, sede, esito); la varietà nel gioco dipende anche dal bilanciamento della selezione.
