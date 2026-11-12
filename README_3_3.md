# Football Legends 3.3 — tutte le squadre reperibili su Wikidata

- Rimosso il limite artificiale delle 9 squadre.
- Il generatore scopre club per paese da Wikidata (compresi club minori che espongono P31=Q476028 e P17).
- Ogni esecuzione elabora fino a 2 paesi e 12 club nuovi per rispettare i limiti del servizio pubblico; si può rilanciare manualmente GitHub Actions. In futuro si potranno aumentare con cautela `FL_COUNTRIES_PER_RUN` e `FL_CLUBS_PER_RUN`.
- I cataloghi `wikidata-clubs.json` e `wikidata-club-cache.json` sono creati e conservati da GitHub Actions; non eliminare i file generati.
- Le domande sulla storia dei club sono etichettate `Calciatori nel mondo`, non sotto il nome di una prima divisione se la categoria del campionato non è verificata.
- Il codice conserva le domande precedenti quando Wikidata non risponde.
- I 28 paesi iniziali sono soltanto una riserva: viene interrogato anche l'elenco mondiale dei paesi in Wikidata. I club non censiti, senza P17/P31 oppure senza profili P54 non possono essere garantiti.
- Alcuni profili Wikidata possono essere erronei; i quesiti generati non sono tutti verificati editorialmente.
- **La grafica non è stata modificata.**

Installazione: copia tutti i file dello ZIP nel repository tramite GitHub Desktop, commit e push, poi GitHub Actions > Aggiorna archivio Football Legends > Run workflow. La prima esecuzione non può completare tutto il mondo. Consulta `category-report.md` e `wikidata-generated.json` dopo l'esecuzione.
