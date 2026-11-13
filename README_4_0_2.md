# Football Legends 4.0.2 — Spiegazioni delle classifiche

Aggiornamento esclusivamente dell’interfaccia per PC.

- Classifica **Generale**: vittorie, sconfitte, punti delle partite Arena online.
- Classifica **Ranked**: rating Elo e divisioni, con partenza da 1.000 Elo; le amichevoli non cambiano Elo.
- Nella scheda Ranked trovi un riquadro espandibile “Cosa significa Elo?”.
- Le spiegazioni rimangono visibili anche quando le classifiche non hanno ancora giocatori.
- Nessuna modifica alle regole, alle credenziali o ai dati Supabase.
- Nessuna modifica agli archivi delle domande.

## Installazione

Scegli il repository **football-legends-v4** su GitHub Desktop, fai Fetch/Pull se necessario, poi copia tutti i file di questo ZIP sul progetto V4. **Non cancellare nessun file `*-generated.json` già presente**, né la cartella `.git`. Commit to main, Push origin. Dopo il deploy Render, aggiorna con CTRL+SHIFT+R.

Per la modifica minima bastano: `v4-ui.js`, `v400.css`, `index.html`, `v400-design.js`, `server.js` e `package.json` (i primi due aggiungono la guida; gli altri aggiornano soltanto la versione). Non serve avviare GitHub Actions.
