# Football Legends V4.3 – Un solo ampliamento storico

## Installazione
1. Repository **football-legends-v4** soltanto (mai quello definitivo).
2. Copia tutti i file di questo ZIP **sopra** quelli già presenti nel repository V4. Non eliminare i grandi archivi `*-generated.json` esistenti.
3. Commit -> Push origin, attendi Render Live.
4. GitHub Actions -> **V4 - MEGA ampliamento storico (tutte le coppe)** -> Run workflow -> main.
5. Alla fine il workflow salva due archivi: `competition-history-generated.json` e `european-cups-generated.json`. Verifica il log delle nuove domande e attendi il nuovo deploy Render.
6. Controlla `/api/status`, `/api/version` e le categorie nella carriera solitaria.

## Cambiamenti
- Unifica in un solo workflow l'espansione di Mondiali, Europei, Champions, Europa League e Conference League.
- Legge fonti CC0 di OpenFootball. Il programma **non inventa risultati**, non produce domande sui risultati casuali dei gironi e non elimina gli archivi esistenti se una fonte fallisce.
- Per Mondiali ed Europei aggiunge percorsi massimi raggiunti quando le fonti riportano almeno tre fasi a eliminazione.
- Per i tornei per club produce domande sugli incroci e le partecipazioni ai turni decisivi, senza duplicare le due gare d'andata e ritorno.
- Timeout e budget per evitare job bloccati, domande con 3 risposte, fonte e spiegazione.
- Programma l'espansione storica **ogni lunedì 06:40 UTC**, oltre a esecuzione manuale.
- **Non modifica la grafica cinematografica**, le classifiche o Supabase.

## Trasparenza
Questo ZIP include il **generatore verificato localmente**, non l'archivio Internet già generato: in questo ambiente l'accesso ai file raw online non è disponibile. Il numero di nuove domande sarà noto **solo dopo il Run workflow**. Non promettiamo che le categorie raggiungano automaticamente 2.000 domande. Non è possibile generare migliaia di domande affidabili per ogni categoria dalle sole fonti dei risultati.

Le fonti principali:
- https://github.com/openfootball/worldcup.json
- https://github.com/openfootball/champions-league
- https://github.com/openfootball/euro

V4.3 = aggiornamento archivio. V4.1 = base grafica, mantenuta.
