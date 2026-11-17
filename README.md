<p align="center"><img src="captures/icone.png" width="112" alt=""></p>

<h1 align="center">JMeca</h1>

<p align="center"><b>An encrypted garage for all your vehicles: maintenance, reminders, service log, fuel and costs.</b></p>

<p align="center"><img src="https://img.shields.io/badge/%F0%9F%93%92%20Productivity%20%26%20data-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-1a9a6c?style=flat-square" alt="Productivity & data"> <a href="https://github.com/jeremdevgit/jmeca/releases"><img src="https://img.shields.io/github/v/release/jeremdevgit/jmeca?include_prereleases&style=flat-square&label=version" alt="version"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--or--later-555?style=flat-square" alt="GPL-3.0-or-later"></a> <a href="https://github.com/jeremdevgit/jmeca/actions/workflows/build.yml"><img src="https://github.com/jeremdevgit/jmeca/actions/workflows/build.yml/badge.svg" alt="CI"></a></p>

<p align="center"><b>English</b> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.de.md">Deutsch</a> · <a href="README.it.md">Italiano</a> · <a href="README.pt.md">Português</a> · <a href="README.zh.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>

<p align="center"><a href="https://github.com/jeremdevgit/jmeca/releases"><b>⬇ Download</b></a></p>

![JMeca dashboard with a 3D vehicle](captures/en/02-dashboard-3d.png)

JMeca is a desktop garage and maintenance tracker built with Tauri 2, Rust and TypeScript, using your system's web engine. It suits a household or a small local workshop.

## At a glance

| | |
|---|---|
| **Category** | 📒 Productivity & data |
| **Platforms** | Windows · macOS · Linux |
| **Interface** | 8 languages (EN, FR, ES, DE, IT, PT, ZH, JA) |
| **Price** | Free, open source, no ads, no telemetry |
| **Status** | Beta |
| **License** | [GPL-3.0-or-later](LICENSE) |

## Features

- **Several vehicles**, client or household folders, fleet search and quick switching.
- **Maintenance**: parts, custom intervals by date or mileage, upcoming and overdue reminders, fleet-wide queue, CSV report per client folder.
- **Digital service log** with invoices and photos, registration document and technical notes.
- **Fuel and costs**: consumption, expenses, and French fuel station prices from official open data.
- **Offline catalog** of 53,596 versions from 1980–2026 (EPA, ADEME and manufacturer archives), nine generic 3D silhouettes, a customizable Audi A3 8P model and GLB import.

<p><img src="captures/en/03-fleet-folders.png" alt="Client folders and fleet" width="49%"> <img src="captures/en/04-parts-reminders.png" alt="Parts and reminders" width="49%"></p>
<p><img src="captures/en/05-service-log.png" alt="Service log" width="49%"> <img src="captures/en/06-fuel-consumption.png" alt="Fuel consumption" width="49%"></p>

*Demo screenshots with fictional vehicles and illustrative prices. [All screenshots](captures/).*

## Your data

- The vault and attachments are encrypted with **AES-256-GCM**; the key is derived from your password (PBKDF2-SHA-256, 600,000 iterations). The password is never stored.
- Automatic lock after inactivity, **encrypted backups** and restore.
- Exported CSV files and attachments leave the vault unencrypted, after confirmation. Old backups may still contain deleted data or an old password.
- Intervals, part references, tire sizes and bulbs must be checked against your vehicle's manual: the catalogs are not certified fitment databases.

## Install

| | Windows 10/11 | macOS 12+ | Linux |
|---|---|---|---|
| File | `JMeca-Setup-Windows-x64.exe` | `.pkg` (recommended) or `.dmg`, universal | `.deb` (Debian/Ubuntu x64) |
| Engine | WebView2 | WebKit | WebKitGTK 4.1 |

Get them from the [releases page](https://github.com/jeremdevgit/jmeca/releases) and compare with `SHA256SUMS.txt`. Installers are not signed with a commercial certificate or notarized: confirm in SmartScreen on Windows, or use *System Settings › Privacy & Security › Open Anyway* on macOS. Replacing the app never erases your vault.

## Build from source

```sh
npm ci
npm run desktop:dev        # needs the Tauri prerequisites; choose the demo for fictional data
npm run build && npm test && npx playwright test
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm run desktop:build      # installer for the current platform
```

`npm run dev` starts a browser preview with its own encrypted IndexedDB vault. On macOS, `zsh scripts/package_macos.sh` builds the `.dmg`, `.pkg` and checksums.

**Limits**: reminders appear only while JMeca is open; no multi-user accounts; the whole vault is rewritten on each save. On Linux, the WebKitGTK stack carries a known `glib` advisory that JMeca does not reach and that upstream has not fixed yet ([SECURITY.md](SECURITY.md)).

## License

GPL-3.0-or-later — see [LICENSE](LICENSE). Data sources and third-party licenses: [THIRD_PARTY.md](THIRD_PARTY.md).

---

Found a vulnerability? Please report it privately (see [SECURITY.md](SECURITY.md)) rather than in a public issue.

## More free software by jeremdevgit

All free, open source and ad-free.

**🛠️ System & hardware** — [Boîte à outils](https://github.com/jeremdevgit/boite-a-outils) · [rJb](https://github.com/jeremdevgit/rjb) · [LJ Hub](https://github.com/jeremdevgit/lj-hub) · [Decklight](https://github.com/jeremdevgit/decklight)

**📒 Productivity & data** — [Carnet de notes](https://github.com/jeremdevgit/carnet-rust) · [Suite Libre](https://jeremdevgit.github.io/suite-libre/)

**🎮 Music & games** — [Pomme](https://github.com/jeremdevgit/pomme) · [Ludothèque](https://github.com/jeremdevgit/ludotheque) · [AutoDex](https://github.com/jeremdevgit/autodex) · [Batailles de France](https://github.com/jeremdevgit/batailles-de-france)
