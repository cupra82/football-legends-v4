# Football Legends 4.0.8 — Pulsante Prossima domanda sempre visibile

## Correzione
- Dopo aver risposto nella Carriera solitaria o Duello, il pulsante “Prossima domanda” resta visibile in basso al centro anche con domande lunghe, feedback e Almanacco.
- Anche “Mostra risultato” e “Passa il dispositivo al secondo giocatore” usano la stessa posizione.
- Nessuna modifica al funzionamento delle partite, ai punti, agli archivi di domande o alle tabelle Supabase.
- Versione 4.0.8 coerente su pagina e `/api/version`.

## Installazione
1. In GitHub Desktop seleziona `football-legends-v4`.
2. Estrai lo ZIP e sostituisci **soltanto** `index.html`, `server.js`, `v400-design.js`, `v400.css` con i file presenti nello ZIP.
3. Fai Commit to main → Push origin. Attendi Render Live, quindi premi CTRL+SHIFT+R.
4. Non avviare workflow per domande e non cancellare alcun JSON generato.

## Test
CSS e sintassi server verificati localmente; test visivo di partita reale online da confermare dopo il deploy.
