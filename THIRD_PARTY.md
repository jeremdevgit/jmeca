# Sources et licences

## Catalogue véhicules

- Producteur : ADEME, « ADEME — Car Labelling ».
- Page : https://data.ademe.fr/datasets/ademe-car-labelling
- API : https://data.ademe.fr/data-fair/api/v1/datasets/ademe-car-labelling/lines
- Licence : Licence Ouverte / Open Licence ; https://www.etalab.gouv.fr/licence-ouverte-open-licence/
- Extraction du 8 novembre 2026 : 3 604 versions, réduites aux champs utiles. La date exacte figure dans `public/catalogue.json`.
- La source décrit le marché du neuf disponible dans cette base ; elle n’est pas un inventaire historique exhaustif. Le libellé commercial et la cylindrée ne constituent pas un code moteur certifié. Aucune donnée d’entretien, dimension de pneu, référence de plaquette ou type d’ampoule n’est déduit de ce jeu de données.

## Modèles 3D

- Auteur : Kenney, Car Kit 3.1.
- Source : https://kenney.nl/assets/car-kit
- Miroir publié par Kenney : https://opengameart.org/content/car-kit
- Licence : CC0 ; voir `public/models/LICENSE-Kenney.txt`.
- Neuf silhouettes sélectionnées ; textures regroupées dans chaque GLB pour un usage hors ligne. Elles sont génériques et ne représentent pas les marques du catalogue.
- L’URL de l’archive et son SHA-256 figurent dans `asset-download.json`.

## Stations

- Ministère de l’Économie, « Prix des carburants en France — Flux instantané — v2 ».
- https://data.economie.gouv.fr/explore/dataset/prix-des-carburants-en-france-flux-instantane-v2/api/
- https://www.prix-carburants.gouv.fr/rubrique/opendata/
- Licence Ouverte. Données interrogées à la demande, non embarquées. Ne suppose pas une mise à jour parfaite ni une disponibilité garantie.
- Aucune API publique documentée d’Essence&Co n’a été identifiée lors de la recherche. JMeca n’est pas affilié à Essence&Co et ne reproduit pas son interface ni ses données privées.

## Recherche de fonctionnalités

Fonctions retenues après consultation des éditeurs (8 novembre 2026) :

- Drivvo : rappels renouvelés à l’intervention, double critère date/kilomètres, préavis, gestion de plusieurs véhicules et dépenses. https://www.drivvo.com/en/vehicle-maintenance/ ; https://www.drivvo.com/en/faq/
- Fuelio : autonomie locale et sauvegarde / restauration sous le contrôle de l’utilisateur. https://fuel.io/faq/is-fuelio-free/ ; https://www.fuel.io/en-US/faq/backup-and-import/

Ces pages ont servi à sélectionner des besoins, sans copie de code, d’interface ou de textes.

## Bibliothèques principales

Rust et Tauri, Serde, Reqwest, rfd, tempfile, Three.js, Zod, TypeScript, Vite. Les versions exactes sont verrouillées dans `package-lock.json` et `src-tauri/Cargo.lock`. Les licences des dépendances restent celles de leurs auteurs ; voir les métadonnées des paquets. Icônes d’interface et icône JMeca dessinées dans le code du projet.

## Chiffrement

PBKDF2-HMAC-SHA-256, 600 000 itérations ; référence de facteur de travail : https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
AES-256-GCM via Web Crypto du moteur web du système. Ce choix n’implique aucune certification FIPS ni audit indépendant du logiciel.
