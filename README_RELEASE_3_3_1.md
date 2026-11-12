# Football Legends 3.3.1 — release completa

Release completa da copiare **nella radice** di `cupra82/football-legends`. Conserva tutti gli archivi `*-generated.json` già pubblicati sul repository: **non** sono inclusi nello ZIP perché non disponibili nell’istantanea locale.

## Correzioni
- Numero di versione nella pagina HTML corretto da 3.0 a 3.3.1 (titolo, intestazione, slogan).
- Endpoint `/api/version` allineato a `3.3.1`, come `package.json`.
- Log di avvio allineato.
- Tutti i file applicativi, gli asset e gli script inclusi nel pacchetto.

## Controllo distribuzione
1. Dopo Commit e Push, verifica che siano presenti i file nuovi su GitHub.
2. Render deve completare il deployment sul commit corretto.
3. `/api/version` deve riportare `3.3.1`; in caso contrario Render non sta servendo questo commit.
4. Se l’API è aggiornata ma la pagina no, ricarica con Ctrl+Shift+R o controlla l’URL della pagina.

## Domande
Il dataset completo si ottiene dall’unione degli archivi presenti nel repository e dei file curati qui inclusi. La v3.3.1 **non aggiunge automaticamente** migliaia di domande: per aggiornare gli archivi esegui il workflow di GitHub Actions.
