# EtudiantFrontend

Front-end Angular 19 d'EtuBibliothèque : inscription et connexion des agents, gestion des étudiants.

## Démarrage

Le back-end doit être lancé (voir [`../backend/README.md`](../backend/README.md)).

```bash
npm install      # première fois : installe les dépendances
npm run start    # lance le serveur de développement (ng serve)
```

Ouvrir http://localhost:4200.

- Le serveur de développement transmet les appels `/api/...` au back-end (http://localhost:8080) grâce au proxy défini dans `proxy.conf.json` : le navigateur ne parle qu'au port 4200.
- `ng serve` n'écoute que sur `127.0.0.1`. Pour y accéder depuis un autre poste : utiliser un tunnel SSH (redirection de port de VS Code Remote SSH, ou `ssh -L 4200:localhost:4200 <serveur>`), ou lancer `npm run start -- --host 0.0.0.0`.
- `ng serve` est réservé au développement. En production : `npm run build`, puis servir le dossier `dist/` avec un serveur web (nginx, par exemple).

## Écrans

| URL | Écran | Accès |
|---|---|---|
| `/` | Redirige vers `/login` | public |
| `/register` | Inscription d'un agent | public |
| `/login` | Connexion (login / mot de passe) | public |
| `/etudiants` | Liste des étudiants : détail, modification, suppression (avec confirmation), ajout, déconnexion | agent connecté |
| `/etudiants/new` | Ajout d'un étudiant | agent connecté |
| `/etudiants/:id` | Détail d'un étudiant | agent connecté |
| `/etudiants/:id/edit` | Modification d'un étudiant | agent connecté |

## Organisation du code (`src/app`)

```
core/
├── models/        Interfaces TypeScript, miroirs des DTO du back-end (Register, LoginRequest, LoginResponse, Etudiant)
├── service/       Services Angular qui appellent l'API (UserService, EtudiantService)
├── interceptor/   authInterceptor : ajoute "Authorization: Bearer <token>" à chaque requête
└── guard/         authGuard : écrans étudiants réservés aux agents connectés, sinon redirection vers /login
pages/             Un dossier par écran (login, register, etudiant-list, etudiant-detail, etudiant-form)
shared/            MaterialModule : modules Angular Material et formulaires réactifs
app.routes.ts      Table de routage (URL → écran)
app.config.ts      Configuration globale (HttpClient + intercepteur, Router)
```

**Authentification** : après une connexion réussie, le token JWT est conservé dans le `sessionStorage` du navigateur (effacé à la fermeture de l'onglet). Si le back-end répond 401 (token expiré après 1 heure), l'agent est déconnecté et renvoyé vers `/login`.

## Tests unitaires (Jest)

```bash
npm test             # exécute tous les tests (*.spec.ts) et mesure la couverture
npm run test:watch   # relance les tests à chaque modification
```

- **Rapport de couverture** : `coverage/index.html` (HTML) et résumé affiché dans le terminal.
- **Seuil** : `npm test` échoue si moins de 80 % des lignes ou des instructions sont couvertes (`coverageThreshold` dans `jest.config.js`).
- **Tous les fichiers de `src/app` sont mesurés**, même ceux qu'aucun test ne charge (`collectCoverageFrom`), sauf les fichiers de test, les modèles (interfaces sans code) et `user-mock.service.ts` (doublure du code de départ, plus utilisée).

| Fichier de test | Ce qui est testé |
|---|---|
| `user.service.spec.ts` | inscription, connexion (token rangé dans `sessionStorage`), `isLoggedIn`, `logout` |
| `etudiant.service.spec.ts` | les 5 appels à `/api/etudiants` (méthode HTTP, URL, corps) |
| `auth.interceptor.spec.ts` | ajout de l'en-tête `Authorization: Bearer <token>` |
| `auth.guard.spec.ts` | accès autorisé si connecté, redirection vers `/login` sinon |
| `login.component.spec.ts` | connexion réussie → message de succès, redirection vers `/etudiants` |
| `register.component.spec.ts` | inscription → redirection vers `/login` |
| `etudiant-list.component.spec.ts` | affichage du tableau, suppression confirmée, déconnexion |
| `etudiant-detail.component.spec.ts` | lecture de l'id dans l'URL, affichage des informations |
| `etudiant-form.component.spec.ts` | ajout (`create`) et modification pré-remplie (`update`) |

Les appels HTTP sont simulés : `HttpTestingController` pour les services, doublures `jest.fn()` pour les composants. Le détail des cas figure dans le [plan de tests](../docs/plan-de-tests.md).

## Tests de bout en bout (Cypress)

Les tests E2E pilotent un vrai navigateur (Electron, sans affichage) sur l'application lancée. Les appels à l'API sont simulés avec `cy.intercept()` : **le back-end n'est pas nécessaire**.

Prérequis sous Linux sans écran : `sudo apt install xvfb` (écran virtuel utilisé automatiquement par Cypress).

```bash
# Terminal 1 : l'application
npm run start
# Terminal 2 : les 9 tests E2E
npm run e2e
```

| Fichier (`cypress/e2e/`) | Parcours testés |
|---|---|
| `01-inscription.cy.ts` | inscription d'un agent → redirection vers `/login` |
| `02-connexion.cy.ts` | connexion → token en `sessionStorage`, en-tête `Bearer`, liste des étudiants |
| `03-securite.cy.ts` | accès à `/etudiants` sans être connecté → `/login` |
| `04-gestion-etudiants.cy.ts` | liste, détail, ajout, modification, suppression confirmée, déconnexion |

### Couverture de code des tests E2E

Pour mesurer les lignes exécutées pendant les tests E2E, une **version instrumentée** de l'application (compteurs insérés dans chaque fichier) est servie sur le port 4201. L'application normale (`npm run start`, `npm run build`) n'est pas modifiée.

```bash
# Terminal 1 : la version instrumentée (port 4201)
npm run start:e2e
# Terminal 2 : les tests E2E + rapport + contrôle du seuil de 80 %
npm run e2e:coverage
```

- Rapport HTML : `coverage-e2e/index.html` ; la commande échoue si moins de 80 % des lignes ou des instructions sont couvertes (`.nycrc.json`).
- Outils : `@angular-builders/custom-webpack` (cibles `build-e2e` / `serve-e2e` dans `angular.json`), `@jsdevtools/coverage-istanbul-loader` (instrumentation, `cypress/coverage.webpack.js`), `@cypress/code-coverage` (collecte des compteurs), `nyc` (rapport et seuil).

## Génération de code (Angular CLI)

```bash
npx ng generate component pages/<nom>                  # nouvel écran
npx ng generate guard core/guard/<nom> --functional    # nouveau guard
```
