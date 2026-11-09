# JMeca

[English](../README.md) · [Français](../README.fr.md)

Desktop-Fahrzeugwartungs-Tracker für Windows, macOS und Linux.

👉 **[Installationsdateien für Windows, macOS und Linux herunterladen](https://github.com/jeremdevgit/jmeca/releases/tag/v0.2.0-beta.1)**. Windows: `.exe`; macOS: universelles `.pkg` oder `.dmg`; Debian/Ubuntu: `.deb`. Die SHA-256-Prüfsummen stehen in `SHA256SUMS.txt`.

Die Benutzeroberfläche folgt beim ersten Start Ihrer Systemsprache. Sie können es in der App ändern.

## Funktionen

- Verwalten Sie mehrere Fahrzeuge in Kundenordnern und durchsuchen Sie Ihre Flotte.
- Verfolgen Sie Ersatzteile und individuelle Wartungserinnerungen nach Datum und Kilometerstand.
- Bewahren Sie Serviceaufzeichnungen, Rechnungen, Fotos und Registrierungsdokumente in einem verschlüsselten Tresor auf.
- Erfassen Sie Kraftstoffverbrauch und -kosten. Durchsuchen Sie französische Tankstellen mithilfe offizieller offener Daten.
- Wählen Sie aus einem Offline-Katalog mit 53.596 Fahrzeugversionen (1980–2026), einem anpassbaren A3-8P-3D-Modell und generischen Silhouetten.

## Probieren Sie die Demo aus

Installieren Sie die Tauri-Voraussetzungen, führen Sie dann `npm ci` und `npm run desktop:dev` aus. Die Demo verwendet fiktive Daten.

Verwenden Sie für persönliche Daten ein Passwort mit mindestens 12 Zeichen und exportieren Sie ein verschlüsseltes Backup auf ein anderes Laufwerk.

## Sicherheit und Einschränkungen

- Tresorinhalte werden im Ruhezustand mit AES-256-GCM verschlüsselt. Ein kompromittierter Computer kann auf einen Tresor zugreifen, während dieser entsperrt ist.
- Überprüfen Sie die Wartungsintervalle und kompatiblen Teile anhand des Handbuchs für Ihr genaues Fahrzeug. Der Katalog ist keine zertifizierte Wartungsdatenbank.
- Die Sendersuche verwendet offizielle französische offene Daten, keine Essence&Co-API. Erinnerungen werden nur angezeigt, während die App geöffnet ist.
- Diese Version eignet sich für eine private Garage oder eine kleine örtliche Werkstatt, nicht für eine große Mehrbenutzerflotte.

Sehen Sie sich die vollständige englische Dokumentation und die Lizenzen von Drittanbietern an. [README.md](../README.md) · [THIRD_PARTY.md](../THIRD_PARTY.md)
