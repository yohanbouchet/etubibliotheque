# EtuBibliothèque

Application de gestion des étudiants abonnés à une bibliothèque, réalisée dans le cadre du projet OpenClassrooms « Testez et améliorez une application existante ».

Le code de départ permettait uniquement d'inscrire un agent de bibliothèque. Il a été corrigé et enrichi :

- **connexion des agents** par login / mot de passe, avec délivrance d'un **token JWT** ;
- **gestion des étudiants** (ajouter, lister, consulter, modifier, supprimer), réservée aux agents connectés.

| Partie | Technologies |
|---|---|
| Back-end | Java 21, Spring Boot 3.5 (Web, Data JPA, Security, Validation), jjwt, MapStruct, Lombok |
| Front-end | Angular 19, Angular Material, Bootstrap |
| Base de données | MySQL dans un conteneur Docker |
| Tests | JUnit 5, Mockito, Testcontainers, Jest, Postman / Newman (Cypress à venir) |

## Structure du dépôt

```
etubibliotheque/
├── backend/     API REST Spring Boot           → voir backend/README.md
├── frontend/    Application Angular            → voir frontend/README.md
├── postman/     Collection Postman des routes de l'API
├── docs/        Documentation (architecture, modifications)
└── .vscode/     Configuration de débogage du back-end (VS Code)
```

## Documentation

- [Architecture](docs/architecture.md) : schémas de l'application et du parcours d'authentification JWT.
- [Modifications apportées au code de départ](docs/modifications.md) : anomalies trouvées, corrections, nouvelles fonctionnalités et justification des choix.
- [Plan de tests](docs/plan-de-tests.md) : cas de tests back, front et bout en bout, avec entrées et sorties attendues.

## Prérequis

- Java 21
- Docker et Docker Compose (Docker Engine sous Linux, ou Docker Desktop)
- Node.js 22 et npm
- Maven 3.9.3 ou plus : **facultatif**, le Maven Wrapper `./mvnw` fourni dans `backend/` télécharge la bonne version

## Démarrage rapide

**1. Back-end** (démarre aussi la base MySQL dans Docker) :

```bash
cd backend
./mvnw spring-boot:run
```

L'API écoute sur http://localhost:8080.

**2. Front-end**, dans un second terminal :

```bash
cd frontend
npm install
npm run start
```

Ouvrir http://localhost:4200 : la page de connexion s'affiche.

**3. Premier usage** : créer un agent sur http://localhost:4200/register, se connecter, puis gérer les étudiants.

## Tests

| Commande | Dossier | Ce qui est testé |
|---|---|---|
| `./mvnw clean verify` | `backend/` | Tests unitaires (Mockito) et d'intégration (MockMvc + MySQL dans Docker via Testcontainers), rapport de couverture JaCoCo et contrôle du seuil de 80 %. Docker doit être démarré. |
| `npm test` | `frontend/` | Tests Jest des composants et services Angular |
| `npx newman run postman/EtuBibliotheque.postman_collection.json` | racine | Toutes les routes de l'API, back-end lancé (voir [postman/](postman/)) |

## Sécurité

- Mots de passe des agents hachés en BCrypt.
- Routes `/api/etudiants/**` protégées par token JWT (`Authorization: Bearer <token>`) ; écrans Angular correspondants protégés par un guard.
- La clé de signature des tokens se configure par la variable d'environnement `JWT_SECRET`. La valeur par défaut présente dans `application.yml` est **réservée au développement**.
