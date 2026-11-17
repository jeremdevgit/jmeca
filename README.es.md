<p align="center"><img src="captures/icone.png" width="112" alt=""></p>

<h1 align="center">JMeca</h1>

<p align="center"><b>Un garaje cifrado para todos tus vehículos: mantenimiento, avisos, libro de mantenimiento, combustible y gastos.</b></p>

<p align="center"><img src="https://img.shields.io/badge/%F0%9F%93%92%20Productivity%20%26%20data-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-1a9a6c?style=flat-square" alt="Productividad y datos"> <a href="https://github.com/jeremdevgit/jmeca/releases"><img src="https://img.shields.io/github/v/release/jeremdevgit/jmeca?include_prereleases&style=flat-square&label=version" alt="version"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--or--later-555?style=flat-square" alt="GPL-3.0-or-later"></a> <a href="https://github.com/jeremdevgit/jmeca/actions/workflows/build.yml"><img src="https://github.com/jeremdevgit/jmeca/actions/workflows/build.yml/badge.svg" alt="CI"></a></p>

<p align="center"><a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <b>Español</b> · <a href="README.de.md">Deutsch</a> · <a href="README.it.md">Italiano</a> · <a href="README.pt.md">Português</a> · <a href="README.zh.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>

<p align="center"><a href="https://github.com/jeremdevgit/jmeca/releases"><b>⬇ Descargar</b></a></p>

![Panel de JMeca con un vehículo en 3D](captures/en/02-dashboard-3d.png)

JMeca es un garaje y registro de mantenimiento de escritorio hecho con Tauri 2, Rust y TypeScript, que usa el motor web del sistema. Está pensado para un hogar o un pequeño taller.

## De un vistazo

| | |
|---|---|
| **Categoría** | 📒 Productividad y datos |
| **Plataformas** | Windows · macOS · Linux |
| **Interfaz** | 8 idiomas (EN, FR, ES, DE, IT, PT, ZH, JA) |
| **Precio** | Gratis, de código abierto, sin anuncios ni telemetría |
| **Estado** | Beta |
| **Licencia** | [GPL-3.0-or-later](LICENSE) |

## Funciones

- **Varios vehículos**, carpetas de clientes o familiares, búsqueda en la flota y cambio rápido.
- **Mantenimiento**: piezas, intervalos personalizados por fecha o kilometraje, avisos próximos y vencidos, cola de mantenimiento de la flota, informe CSV por cliente.
- **Libro de mantenimiento digital** con facturas y fotos, permiso de circulación y notas técnicas.
- **Combustible y gastos**: consumo, presupuesto y precios de gasolineras francesas desde datos abiertos oficiales.
- **Catálogo sin conexión** de 53 596 versiones de 1980 a 2026 (EPA, ADEME y archivos de fabricantes), nueve siluetas 3D genéricas, un modelo Audi A3 8P personalizable e importación GLB.

<p><img src="captures/en/03-fleet-folders.png" alt="Carpetas de clientes y flota" width="49%"> <img src="captures/en/04-parts-reminders.png" alt="Piezas y avisos" width="49%"></p>
<p><img src="captures/en/05-service-log.png" alt="Libro de mantenimiento" width="49%"> <img src="captures/en/06-fuel-consumption.png" alt="Consumo de combustible" width="49%"></p>

*Capturas de demostración con vehículos ficticios y precios ilustrativos. [Todas las capturas](captures/).*

## Tus datos

- La bóveda y los adjuntos se cifran con **AES-256-GCM**; la clave se deriva de tu contraseña (PBKDF2-SHA-256, 600 000 iteraciones). La contraseña nunca se guarda.
- Bloqueo automático por inactividad, **copias cifradas** y restauración.
- Los CSV y adjuntos exportados salen de la bóveda sin cifrar, tras confirmación. Las copias antiguas pueden contener datos borrados o una contraseña antigua.
- Intervalos, referencias de piezas, medidas de neumáticos y bombillas deben comprobarse en el manual del vehículo: los catálogos no son bases certificadas.

## Instalar

| | Windows 10/11 | macOS 12+ | Linux |
|---|---|---|---|
| Archivo | `JMeca-Setup-Windows-x64.exe` | `.pkg` (recomendado) o `.dmg`, universal | `.deb` (Debian/Ubuntu x64) |
| Motor | WebView2 | WebKit | WebKitGTK 4.1 |

Descárgalos en la [página de versiones](https://github.com/jeremdevgit/jmeca/releases) y compáralos con `SHA256SUMS.txt`. Los instaladores no están firmados con un certificado comercial ni notarizados: confirma en SmartScreen en Windows, o usa *Ajustes del Sistema › Privacidad y seguridad › Abrir igualmente* en macOS. Reemplazar la app nunca borra tu bóveda.

## Compilar

```sh
npm ci
npm run desktop:dev        # requiere los requisitos de Tauri; elige la demo para datos ficticios
npm run build && npm test && npx playwright test
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm run desktop:build      # instalador para la plataforma actual
```

`npm run dev` abre una vista previa en el navegador con su propia bóveda IndexedDB cifrada. En macOS, `zsh scripts/package_macos.sh` genera el `.dmg`, el `.pkg` y las sumas de control.

**Límites**: los avisos solo aparecen con JMeca abierto; no hay cuentas multiusuario; toda la bóveda se reescribe al guardar. En Linux, la pila WebKitGTK arrastra un aviso conocido sobre `glib` que JMeca no utiliza y que aún no está corregido aguas arriba ([SECURITY.md](SECURITY.md)).

## Licencia

GPL-3.0-or-later — ver [LICENSE](LICENSE). Fuentes de datos y licencias de terceros: [THIRD_PARTY.md](THIRD_PARTY.md).

---

¿Has encontrado una vulnerabilidad? Infórmala en privado (consulta [SECURITY.md](SECURITY.md)) y no en una incidencia pública.

## Más software libre de jeremdevgit

Todos gratuitos, de código abierto y sin anuncios.

**🛠️ Sistema y hardware** — [Boîte à outils](https://github.com/jeremdevgit/boite-a-outils) · [rJb](https://github.com/jeremdevgit/rjb) · [LJ Hub](https://github.com/jeremdevgit/lj-hub) · [Decklight](https://github.com/jeremdevgit/decklight)

**📒 Productividad y datos** — [Carnet de notes](https://github.com/jeremdevgit/carnet-rust) · [Suite Libre](https://jeremdevgit.github.io/suite-libre/)

**🎮 Música y juegos** — [Pomme](https://github.com/jeremdevgit/pomme) · [Ludothèque](https://github.com/jeremdevgit/ludotheque) · [AutoDex](https://github.com/jeremdevgit/autodex) · [Batailles de France](https://github.com/jeremdevgit/batailles-de-france)
