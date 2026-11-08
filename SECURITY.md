# Security policy

Please report a suspected JMeca vulnerability through GitHub's **private vulnerability reporting** for this repository. If that option is unavailable, contact the maintainer privately through the contact method listed on the GitHub profile. Do not post exploit details or personal vehicle data in a public issue.

The supported code is the latest version on `main`. Include the version, operating system, a minimal reproduction and the security impact. Use fictional data and redact passwords, registration documents, VINs and invoices.

JMeca encrypts its local vault at rest. An unlocked app on a compromised computer is outside that protection. Official station lookup sends the requested French postcode or coordinates and fuel type to the French government service. A user-selected decrypted attachment export leaves the vault.

## Known upstream advisory

The Linux WebKitGTK/GTK3 dependency chain used by Tauri 2 includes `glib 0.18.5`, affected by [RUSTSEC-2024-0429](https://rustsec.org/advisories/RUSTSEC-2024-0429.html). The advisory concerns the `glib::VariantStrIter` iterator implementation. JMeca does not call `VariantStrIter` directly. The compatible Tauri/WebKitGTK stack does not currently permit the patched `glib 0.20` line, so this is an accepted, monitored upstream risk, not a fixed finding. Windows and macOS do not use the Linux GTK dependency chain. The dependency will be revisited when the upstream stack supports a patched version.
