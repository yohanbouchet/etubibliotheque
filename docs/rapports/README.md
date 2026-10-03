# Rapports de tests et de couverture

Rapports générés le 01/10/2026 sur la version `main` du dépôt (rapports front-end Jest et E2E régénérés le 03/10/2026 après l'ajout de l'affichage des erreurs sur l'écran d'inscription). Chaque dossier contient un rapport HTML : ouvrir son `index.html` dans un navigateur (après avoir cloné ou téléchargé le dépôt).

## Synthèse

| Partie | Outil | Tests | Résultat | Lignes couvertes | Instructions couvertes | Seuil (80 %) |
|---|---|---|---|---|---|---|
| Back-end | JUnit 5 + Mockito, MockMvc + Testcontainers, **JaCoCo** | 23 | 23 réussis | **86,7 %** (156 / 180) | 84,6 % (660 / 780) | ✅ |
| Front-end | **Jest** | 29 | 29 réussis | **83,3 %** (209 / 251) | 84,4 % (228 / 270) | ✅ |
| Bout en bout (E2E) | **Cypress** + `@cypress/code-coverage` / nyc | 9 | 9 réussis | **85,1 %** (148 / 174) | 86,7 % (170 / 196) | ✅ |

Le seuil de 80 % est contrôlé automatiquement : chaque commande ci-dessous **échoue** si la couverture passe sous 80 %.

## Rapports

| Dossier | Rapport | Commande qui le génère |
|---|---|---|
| [`backend-jacoco/`](backend-jacoco/index.html) | Couverture du back-end, par package et par classe | `cd backend && ./mvnw clean verify` (Docker démarré) |
| [`frontend-jest/`](frontend-jest/index.html) | Couverture des tests unitaires Angular, par fichier | `cd frontend && npm test` |
| [`e2e-cypress/`](e2e-cypress/index.html) | Couverture du code Angular par les tests E2E | `cd frontend && npm run start:e2e`, puis dans un second terminal `npm run e2e:coverage` |

## Ce qui n'est pas couvert, et pourquoi

Conformément à l'énoncé (« Ne testez pas les cas d'erreur »), les tests portent sur les cas nominaux (une exception : l'affichage des erreurs serveur à l'inscription, exigé par l'exercice 1, test UF-17). Les lignes non couvertes correspondent essentiellement à la **gestion des erreurs** : gestionnaire d'exceptions du back-end (`RestExceptionHandler`), refus d'un e-mail déjà utilisé, affichage des messages d'erreur et traitement du 401 dans les écrans Angular. Le détail des cas testés figure dans le [plan de tests](../plan-de-tests.md).

Le code généré automatiquement (getters et setters Lombok) et les fichiers sans code exécutable (modèles TypeScript) sont exclus du calcul.
