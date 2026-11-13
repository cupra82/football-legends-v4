# Football Legends 4.0.7 — Calcio famoso e storico delle sfide

Aggiornamento destinato SOLO a `cupra82/football-legends-v4`.

## Funzioni

1. **Domande intelligenti**: nella configurazione delle partite seleziona "Grandi campioni e calcio famoso" (predefinito) oppure "Archivio completo". Il motore mantiene tutte le domande archiviate, ma favorisce titoli, finali, trofei, grandi giocatori e allenatori e penalizza domande ripetitive su città di nascita/nazionalità. Il filtro è euristico: non è una certificazione della notorietà o della correttezza storica di ogni domanda.
2. **Storico Arena e Ranked**: nella sezione **Percorso** appaiono le ultime 50 partite concluse dalla 4.0.7, con data, partecipanti, punteggi, vincitore e distacco tra i primi due. In evidenza la sfida più combattuta e la vittoria più netta del profilo.
3. **Supabase V4**: due nuove tabelle `fl407_matches` e `fl407_match_players` create all'avvio. Il database e le classifiche già presenti non vengono sovrascritti. Nessuna credenziale deve essere copiata dal vecchio progetto.
4. **Arena, Tornei, Rush**: selezione calcio famoso; il creatore della stanza Arena decide la preferenza per tutti i partecipanti. Rush e Tornei usano il filtro intelligente per impostazione predefinita.

## Installazione

1. GitHub Desktop: apri `football-legends-v4` e fai Fetch/Pull origin.
2. Copia nella cartella del repository i file dello ZIP, sovrascrivendo gli omonimi. Non eliminare `*-generated.json`, in particolare i grandi archivi delle domande.
3. Commit to main, Push origin.
4. Attendi il deploy Render V4 su Live, poi CTRL + SHIFT + R.
5. Controlla `/api/version` (deve mostrare 4.0.7) e `/api/v407/status` (per il database `historyReady: true`).

Non occorre avviare GitHub Actions o modificare manualmente Supabase. Lo storico **non ricostruisce le vecchie partite** della 4.0.6 e non include attualmente i singoli incontri dei Tornei, Rush o Carriera solitaria: registra Arena e Ranked completate dalla 4.0.7.

## Test

`npm test` e `node --check` sono passati nell'ambiente di sviluppo. Non sono stati effettuati collaudi reali multi-PC e salvataggi diretti su Supabase in questo ambiente: verificare una partita Arena completa dopo il deploy.

## Privacy e integrità

L'endpoint storico richiede il token del profilo, mostra soltanto le sue partite e salva identificativi pseudonimizzati; i nickname rimangono visibili ai partecipanti alle sfide. L'inserimento per ID di partita previene registrazioni duplicate.
