<p align="center"><img src="captures/icone.png" width="112" alt=""></p>

<h1 align="center">JMeca</h1>

<p align="center"><b>Uma garagem encriptada para todos os seus veículos: manutenção, lembretes, livro de revisões, combustível e despesas.</b></p>

<p align="center"><img src="https://img.shields.io/badge/%F0%9F%93%92%20Productivity%20%26%20data-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-1a9a6c?style=flat-square" alt="Produtividade e dados"> <a href="https://github.com/jeremdevgit/jmeca/releases"><img src="https://img.shields.io/github/v/release/jeremdevgit/jmeca?include_prereleases&style=flat-square&label=version" alt="version"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--or--later-555?style=flat-square" alt="GPL-3.0-or-later"></a> <a href="https://github.com/jeremdevgit/jmeca/actions/workflows/build.yml"><img src="https://github.com/jeremdevgit/jmeca/actions/workflows/build.yml/badge.svg" alt="CI"></a></p>

<p align="center"><a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.de.md">Deutsch</a> · <a href="README.it.md">Italiano</a> · <b>Português</b> · <a href="README.zh.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>

<p align="center"><a href="https://github.com/jeremdevgit/jmeca/releases"><b>⬇ Transferir</b></a></p>

![Painel do JMeca com um veículo 3D](captures/en/02-dashboard-3d.png)

O JMeca é uma garagem e livro de manutenção para computador, feito com Tauri 2, Rust e TypeScript sobre o motor web do sistema. Indicado para uma família ou uma pequena oficina.

## Em resumo

| | |
|---|---|
| **Categoria** | 📒 Produtividade e dados |
| **Plataformas** | Windows · macOS · Linux |
| **Interface** | 8 idiomas (EN, FR, ES, DE, IT, PT, ZH, JA) |
| **Preço** | Gratuito, de código aberto, sem anúncios nem telemetria |
| **Estado** | Beta |
| **Licença** | [GPL-3.0-or-later](LICENSE) |

## Funções

- **Vários veículos**, pastas de clientes ou familiares, pesquisa na frota e troca rápida.
- **Manutenção**: peças, intervalos personalizados por data ou quilometragem, lembretes próximos e em atraso, fila de manutenção da frota, relatório CSV por cliente.
- **Livro de revisões digital** com faturas e fotos, documento único do veículo e notas técnicas.
- **Combustível e despesas**: consumo, orçamento e preços dos postos franceses a partir de dados abertos oficiais.
- **Catálogo offline** de 53 596 versões de 1980 a 2026 (EPA, ADEME e arquivos de fabricantes), nove silhuetas 3D genéricas, um modelo Audi A3 8P personalizável e importação GLB.

<p><img src="captures/en/03-fleet-folders.png" alt="Pastas de clientes e frota" width="49%"> <img src="captures/en/04-parts-reminders.png" alt="Peças e lembretes" width="49%"></p>
<p><img src="captures/en/05-service-log.png" alt="Livro de revisões" width="49%"> <img src="captures/en/06-fuel-consumption.png" alt="Consumo de combustível" width="49%"></p>

*Capturas de demonstração com veículos fictícios e preços ilustrativos. [Todas as capturas](captures/).*

## Os seus dados

- O cofre e os anexos são encriptados com **AES-256-GCM**; a chave é derivada da sua palavra-passe (PBKDF2-SHA-256, 600 000 iterações). A palavra-passe nunca é guardada.
- Bloqueio automático por inatividade, **cópias de segurança encriptadas** e restauro.
- CSV e anexos exportados saem do cofre sem encriptação, após confirmação. Cópias antigas podem ainda conter dados apagados ou uma palavra-passe antiga.
- Intervalos, referências de peças, medidas de pneus e lâmpadas devem ser confirmados no manual do veículo: os catálogos não são bases certificadas.

## Instalar

| | Windows 10/11 | macOS 12+ | Linux |
|---|---|---|---|
| Ficheiro | `JMeca-Setup-Windows-x64.exe` | `.pkg` (recomendado) ou `.dmg`, universal | `.deb` (Debian/Ubuntu x64) |
| Motor | WebView2 | WebKit | WebKitGTK 4.1 |

Transfira-os na [página de versões](https://github.com/jeremdevgit/jmeca/releases) e compare com `SHA256SUMS.txt`. Os instaladores não têm assinatura comercial nem notarização: confirme no SmartScreen no Windows, ou use *Definições do Sistema › Privacidade e segurança › Abrir mesmo assim* no macOS. Substituir a app nunca apaga o seu cofre.

## Compilar

```sh
npm ci
npm run desktop:dev        # com os pré-requisitos do Tauri; escolha a demo para dados fictícios
npm run build && npm test && npx playwright test
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm run desktop:build      # instalador para a plataforma atual
```

`npm run dev` abre uma pré-visualização no navegador com o seu próprio cofre IndexedDB encriptado. No macOS, `zsh scripts/package_macos.sh` gera o `.dmg`, o `.pkg` e as somas de verificação.

**Limites**: os lembretes só aparecem com o JMeca aberto; não há contas multiutilizador; o cofre inteiro é reescrito a cada gravação. No Linux, a pilha WebKitGTK traz um aviso conhecido sobre `glib` que o JMeca não usa e que ainda não foi corrigido a montante ([SECURITY.md](SECURITY.md)).

## Licença

GPL-3.0-or-later — ver [LICENSE](LICENSE). Fontes de dados e licenças de terceiros: [THIRD_PARTY.md](THIRD_PARTY.md).

---

Encontrou uma vulnerabilidade? Comunique-a em privado (consulte [SECURITY.md](SECURITY.md)) e não num issue público.

## Mais software livre de jeremdevgit

Todos gratuitos, de código aberto e sem anúncios.

**🛠️ Sistema e hardware** — [Boîte à outils](https://github.com/jeremdevgit/boite-a-outils) · [rJb](https://github.com/jeremdevgit/rjb) · [LJ Hub](https://github.com/jeremdevgit/lj-hub) · [Decklight](https://github.com/jeremdevgit/decklight)

**📒 Produtividade e dados** — [Carnet de notes](https://github.com/jeremdevgit/carnet-rust) · [Suite Libre](https://jeremdevgit.github.io/suite-libre/)

**🎮 Música e jogos** — [Pomme](https://github.com/jeremdevgit/pomme) · [Ludothèque](https://github.com/jeremdevgit/ludotheque) · [AutoDex](https://github.com/jeremdevgit/autodex) · [Batailles de France](https://github.com/jeremdevgit/batailles-de-france)
