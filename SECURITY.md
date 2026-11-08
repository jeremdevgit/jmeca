# Security policy

Please report a suspected JMeca vulnerability through GitHub's **private vulnerability reporting** for this repository. If that option is unavailable, contact the maintainer privately through the contact method listed on the GitHub profile. Do not post exploit details or personal vehicle data in a public issue.

The supported code is the latest version on `main`. Include the version, operating system, a minimal reproduction and the security impact. Use fictional data and redact passwords, registration documents, VINs and invoices.

JMeca encrypts its local vault at rest. An unlocked app on a compromised computer is outside that protection. Official station lookup sends the requested French postcode or coordinates and fuel type to the French government service. A user-selected decrypted attachment export leaves the vault.
