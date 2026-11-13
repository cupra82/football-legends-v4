# Football Legends 4.0.4 — Stadium Experience

Aggiornamento cumulativo della 4.0.3. Contiene tutte le funzionalità esistenti e aggiunge effetti cinematografici locali, classifica live dai messaggi WebSocket già presenti, finale scenografico, ultima domanda, combo, presentazione VS e Carta Leggenda basata sulle statistiche V4.

## Installazione
1. GitHub Desktop: seleziona esclusivamente `football-legends-v4` e fai Pull.
2. Crea una copia di sicurezza della cartella.
3. Copia tutti i file dello ZIP nella cartella del repository senza cancellare file già presenti.
4. Conserva tutti i grandi `*-generated.json` (non inclusi nello ZIP).
5. Commit e Push; aspetta `Live` sul servizio Render V4.
6. Apri `/api/version` e verifica `4.0.4`, poi CTRL+SHIFT+R.

Nessun workflow domande necessario. Nessuna modifica allo schema Supabase. Gli effetti Completa/Leggera/Essenziale sono salvati solo nel browser, senza interferire con gli altri giocatori.

**Limiti:** Il podio mostra il risultato ricevuto dal server; non modifica punteggi. La Carta Leggenda riepiloga solo dati effettivamente disponibili nell'API V4. La schermata VS usa i partecipanti dell'ultima lobby ed è soltanto visuale. I test locali non sostituiscono una partita end-to-end su Render con più PC. Lo ZIP esclude gli archivi generati perché questi sono già nel repository V4.
