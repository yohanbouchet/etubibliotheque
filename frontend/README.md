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
npm test             # exécute tous les tests (*.spec.ts)
npm run test:watch   # relance les tests à chaque modification
```

Le rapport de couverture HTML est généré dans `coverage/` (configuration dans `jest.config.js`).

## Génération de code (Angular CLI)

```bash
npx ng generate component pages/<nom>                  # nouvel écran
npx ng generate guard core/guard/<nom> --functional    # nouveau guard
```
