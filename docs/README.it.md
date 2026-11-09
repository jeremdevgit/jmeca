# JMeca

[English](../README.md) · [Français](../README.fr.md)

Tracker desktop per la manutenzione dei veicoli per Windows, macOS e Linux.

👉 **[Scarica gli installer per Windows, macOS e Linux](https://github.com/jeremdevgit/jmeca/releases/tag/v0.2.0-beta.1)**. Windows: `.exe`; macOS universale: `.pkg` o `.dmg`; Debian/Ubuntu: `.deb`. Le impronte SHA-256 sono in `SHA256SUMS.txt`.

L'interfaccia segue la lingua del sistema al primo avvio. Puoi modificarlo nell'app.

## Caratteristiche

- Gestisci più veicoli nelle cartelle dei clienti e cerca la tua flotta.
- Tieni traccia delle parti e dei promemoria di manutenzione personalizzata per data e chilometraggio.
- Conserva i registri di servizio, le fatture, le foto e i documenti di registrazione in un deposito crittografato.
- Registra il consumo di carburante e le spese. Cerca le stazioni di rifornimento francesi utilizzando i dati aperti ufficiali.
- Scegli da un catalogo offline di 53.596 versioni (1980–2026), un A3 8P 3D personalizzabile e sagome generiche.

## Prova la demo

Installa i prerequisiti Tauri, quindi esegui `npm ci` e `npm run desktop:dev`. La demo utilizza dati fittizi.

Per i dati personali, utilizzare una password di almeno 12 caratteri ed esportare un backup crittografato su un'altra unità.

## Sicurezza e limitazioni

- I contenuti del vault vengono crittografati quando sono inattivi con AES-256-GCM. Un computer compromesso può accedere a un deposito mentre è sbloccato.
- Controlla gli intervalli di manutenzione e le parti compatibili rispetto al manuale del tuo veicolo esatto. Il catalogo non è un database di manutenzione certificato.
- La ricerca delle stazioni utilizza i dati aperti ufficiali francesi, non un'API Essence&Co. I promemoria vengono visualizzati solo mentre l'app è aperta.
- Questa versione è adatta per un garage personale o una piccola officina locale, non per una grande flotta multiutente.

Consulta la documentazione completa in inglese e le licenze di terze parti. [README.md](../README.md) · [THIRD_PARTY.md](../THIRD_PARTY.md)
