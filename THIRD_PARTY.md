# Sources et licences

## Catalogue véhicules

- Producteur : ADEME, « ADEME — Car Labelling ».
- Page : https://data.ademe.fr/datasets/ademe-car-labelling
- API : https://data.ademe.fr/data-fair/api/v1/datasets/ademe-car-labelling/lines
- Licence : Licence Ouverte / Open Licence ; https://www.etalab.gouv.fr/licence-ouverte-open-licence/
- Extraction du 8 novembre 2026 : 3 604 versions, réduites aux champs utiles. La date exacte figure dans `public/catalogue.json`.
- La source décrit le marché du neuf disponible dans cette base ; elle n’est pas un inventaire historique exhaustif. Le libellé commercial et la cylindrée ne constituent pas un code moteur certifié. Aucune donnée d’entretien, dimension de pneu, référence de plaquette ou type d’ampoule n’est déduit de ce jeu de données.

- Producteur : U.S. Department of Energy / EPA, FuelEconomy.gov, données automobiles 1984–2026 : https://www.fueleconomy.gov/feg/ws/ et https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip . Données factuelles gouvernementales américaines ; politique de réutilisation : https://www.energy.gov/web-policies . La base décrit les millésimes et motorisations du marché américain, pas l’homologation européenne ni la compatibilité des pièces. Le script `scripts/build-historic-catalogue.py` conserve les identifiants EPA et les champs utiles, sans recopier les textes éditoriaux.
- Compléments 1980–1983 : archives Volkswagen [Golf](https://www.volkswagen-newsroom.com/en/50-years-of-golf-2024-17906) et [Passat B2](https://www.volkswagen-newsroom.com/en/vehicle-data-passat-b2-profile-19538), archives [Audi](https://www.audi.com/en/company/profile/audi-tradition/product-history/era-premium-class/). Une entrée datée indique une génération ou une motorisation attestée ; aucune finition n’est déduite.
- Audi A3 8P : [gamme allemande publiée dans le rapport annuel Audi 2008](https://www.audi.com/content/dam/gbp2/downloads/report/annual-reports/2008/en/2008_audi_annual_report_financial.pdf), tableau daté de février 2009 ; [rapport 2009](https://www.audi.com/content/dam/gbp2/downloads/report/annual-reports/2009/en/2009_audi_annual_report_financial.pdf) pour 1.2 TFSI et 1.6 TDI ; [histoire officielle de l’A3](https://www.audi.com/en/media-releases/30-years-of-the-audi-a3-three-decades-of-vorsprung-in-the-premium-compact-segment-18368) pour les carrosseries et RS3. Les entrées de gamme sont des instantanés, pas la liste exhaustive de toutes les finitions ou de tous les pays. L’utilisateur doit vérifier son année et son code moteur.
- `public/catalogue-history.json` contient 49 992 entrées ; avec ADEME, JMeca propose 53 596 versions. La date exacte d’extraction figure dans le fichier. Aucune périodicité d’entretien ni référence de pièce n’est inférée.

## Modèles 3D

- Auteur : Kenney, Car Kit 3.1.
- Source : https://kenney.nl/assets/car-kit
- Miroir publié par Kenney : https://opengameart.org/content/car-kit
- Licence : CC0 ; voir `public/models/LICENSE-Kenney.txt`.
- Neuf silhouettes sélectionnées ; textures regroupées dans chaque GLB pour un usage hors ligne. Elles sont génériques et ne représentent pas les marques du catalogue.
- Illustration 3D A3 8P créée dans `src/a3model.ts` : géométrie stylisée originale, avec carrosserie, peinture, calandre et rétroviseurs configurables. Elle n’utilise aucun maillage ni plan propriétaire et ne constitue pas une représentation dimensionnelle certifiée par Audi. JMeca n’est pas affilié à Audi.
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
