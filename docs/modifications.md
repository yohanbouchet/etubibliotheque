# Modifications apportées au code de départ

Ce document retrace tout ce qui a changé entre le **code de départ fourni par OpenClassrooms** (commit `20e7222`) et l'état actuel du projet : les anomalies trouvées, les corrections, les nouvelles fonctionnalités, et **la raison de chaque choix**.

Il est mis à jour à chaque étape du projet.

| Commit | Étape |
|---|---|
| `20e7222` | Code de départ OpenClassrooms (back-end + front-end), sans modification fonctionnelle |
| `167ee8a` | Exercice 1, étape 2 – Correction de l'API d'authentification `/api/login` |
| `37b470f` | Exercice 1, étape 3 – Écran de connexion (front-end) |
| `798e979` | Exercice 1, étape 4 – API CRUD des étudiants sécurisée par JWT |
| `f542318` | Exercice 1, étape 5 – Écrans CRUD des étudiants (front-end) |
| `38c70ab` | Documentation : README, architecture, modifications |
| `ba8a4e2` | Exercice 2, étape 2 – Plan de tests |
| `ea20e82` | Exercice 2, étape 3 – JaCoCo et tests unitaires back-end |
| `bca1222` | Exercice 2, étape 3 – Tests d'intégration back-end et seuil de couverture |
| `a5af7ff` | Exercice 2, étape 4 – Tests front-end (Jest) |
| `efe2520`, `d21eb19` | Exercice 2, étape 5 – Cypress et tests E2E |
| `ca355e4` | Exercice 2, étape 5 – Couverture de code des tests E2E |
| `b7521e7` | Rapports de tests et de couverture versionnés dans `docs/rapports/` (livrable) |

---

## 1. Anomalies relevées dans le code de départ

| Fichier | Anomalie | Statut |
|---|---|---|
| `UserController.java` | `login()` sans `@RequestBody` : le JSON envoyé était ignoré, login et mot de passe arrivaient à `null` | ✅ Corrigée (étape 2) |
| `LoginRequestDTO.java` | Aucune règle de validation (`NotBlank` importé mais jamais utilisé) | ✅ Corrigée (étape 2) |
| `UserService.java` | `passwordEncoder.matches(password, password)` : le mot de passe saisi était comparé à lui-même au lieu du hash stocké → connexion toujours refusée | ✅ Corrigée (étape 2) |
| `UserService.java` | `User.builder().username(login).build()` sans mot de passe → exception « Cannot pass null or empty values to constructor » | ✅ Corrigée (étape 2) |
| `JwtService.java` | `generateToken()` renvoyait `null` (`// TODO`) | ✅ Implémentée (étape 2) |
| `SpringSecurityConfig.java` | Filtre JWT prévu mais en commentaire (`// .addFilterBefore(...)`) : aucune route ne pouvait être authentifiée par token | ✅ Activé (étape 4) |
| `app.routes.ts` | L'URL vide affichait `AppComponent` à l'intérieur de lui-même | ✅ Corrigée (étape 3) : redirection vers `/login` |
| `register.component.ts` | `// TODO : router l'utilisateur vers la page de login` | ✅ Traité (étape 3) |
| `pom.xml`, `UserControllerTest.java` | Les tests d'intégration fournis ne démarraient plus (voir § 6) | ✅ Corrigée (étape 4) |
| `backend/README.md` | Commandes `mvn` (Maven du poste) au lieu du Maven Wrapper `./mvnw` du projet | ✅ Mis à jour |
| `register.component.ts` / `.html` | Erreurs serveur non affichées (login déjà existant → rien à l'écran) ; mot de passe saisi en `type="text"` (visible) | ⏸ Non corrigée : hors périmètre de l'énoncé |
| `UserService.login` | Mauvais identifiants → `IllegalArgumentException` → **400**, alors que **401** serait le code approprié (un gestionnaire `BadCredentialsException` → 401 existe déjà dans `RestExceptionHandler`) | ⏸ Non corrigée : décision de rester dans le périmètre de l'énoncé |
| `RestExceptionHandler.java` | Import de `java.nio.file.AccessDeniedException` (exception liée aux fichiers) au lieu de celle de Spring Security : le gestionnaire 403 n'est jamais déclenché | ⏸ Non corrigée |
| `RestExceptionHandler.java` | Le gestionnaire de `Exception.class` attend un paramètre `RuntimeException` : une exception « vérifiée » ne serait pas traitée par ce gestionnaire | ⏸ Non corrigée |
| `application.yml` + `SpringSecurityConfig.java` | Tous les endpoints Actuator exposés (`include: '*'`) et accessibles sans authentification | ⏸ Non corrigée : acceptable en développement, à restreindre en production |
| `compose.yaml` | Image `mysql:latest` (version non épinglée) | ⏸ Non corrigée : la base de développement existante a été créée par MySQL 26.7, un retour en 8.4 imposerait de la recréer |
| `User.java` | Champs `created_at` / `updated_at` qui ne respectent pas la convention Java (camelCase) | ⏸ Non corrigée (la nouvelle entité `Etudiant` utilise `createdAt` / `updatedAt`) |
| `SpringSecurityConfig.java` | `new DaoAuthenticationProvider()` et `setUserDetailsService()` sont dépréciés dans Spring Security 6.5 | ⏸ Non corrigée (fonctionne encore) |
| `register.component.spec.ts` | `useValue: UserMockService` fournit la classe au lieu d'une instance | ✅ Corrigée (exercice 2, étape 4) : doublure `jest.fn()` |

---

## 2. Étape 2 – Correction de l'API d'authentification (back-end)

**Méthode** : les bugs ont été trouvés **au débogueur** (points d'arrêt, panneau Variables, expressions Watch), en trois passes : chaque correction faisait apparaître le bug suivant.

| Modification | Pourquoi |
|---|---|
| `@Valid @RequestBody` sur `UserController.login` | Même modèle que `register` : le JSON remplit le DTO, puis ses règles sont vérifiées |
| `@NotBlank` sur les champs de `LoginRequestDTO` | Même modèle que `RegisterDTO` : login et mot de passe obligatoires |
| `matches(password, user.get().getPassword())` | `matches` compare un mot de passe en clair à un **hash BCrypt** (prouvé au débogueur : `false` avant, `true` après) |
| `jwtService.generateToken(user.get())` | L'entité `User` implémente déjà `UserDetails` : inutile (et bogué) de reconstruire un objet incomplet |
| `JwtService.generateToken()` implémenté | Délivre un token signé (HS256) contenant le login (`sub`), la date de création (`iat`) et d'expiration (`exp`, 1 heure) |
| `LoginResponseDTO` : réponse `{"token": "..."}` | Échange en JSON via un DTO (plutôt que du texte brut), exploitable par le front-end |

**Choix techniques**

- **Bibliothèque jjwt 0.13.0** : la signature `generateToken(UserDetails)` et le filtre en commentaire du code de départ correspondent à cette approche « maison » (plutôt qu'au module `oauth2-resource-server` de Spring).
- **Clé secrète** : `jwt.secret: ${JWT_SECRET:<clé de développement>}` dans `application.yml`. En production, la clé vient de la variable d'environnement `JWT_SECRET`. En développement, une clé par défaut clairement identifiée permet de lancer le projet sans configuration. Le dépôt étant public, la clé de développement ne doit jamais servir en production.
- **401 non implémenté** pour les mauvais identifiants (voir § 1) : amélioration identifiée, non réalisée pour rester dans le périmètre de l'énoncé.

---

## 3. Étape 3 – Écran de connexion (front-end)

| Modification | Pourquoi |
|---|---|
| Modèles `LoginRequest.ts` / `LoginResponse.ts` | Miroirs exacts des DTO Java (mêmes noms de champs) |
| `UserService.login()` | Appel `POST /api/login` ; le token est rangé dans `sessionStorage` par le service (respect des couches : le composant ne gère que l'affichage) |
| Composant `pages/login` (généré avec Angular CLI) | Formulaire réactif sur le modèle de `register` ; champs obligatoires ; mot de passe masqué (`type="password"`) |
| États chargement / erreur / succès | Bouton désactivé pendant l'appel ; message d'erreur du serveur affiché (ex. « Invalid credentials ») ; message de succès |
| Route `/login` ; URL vide → `/login` ; `register` → `/login` après inscription | Parcours logique de l'application ; correction de la route vide incohérente et du `TODO` |

**Choix** : `sessionStorage` plutôt que `localStorage`, car le token est effacé à la fermeture de l'onglet (plus prudent sur un poste partagé).

---

## 4. Étape 4 – API CRUD des étudiants (back-end)

**Architecture en couches** : `EtudiantController` (entrées/sorties HTTP) → `EtudiantService` (règles métier) → `EtudiantRepository` (accès aux données). Le controller ne manipule que `EtudiantDTO`, jamais l'entité ; la conversion est faite par `EtudiantDtoMapper` (MapStruct, comme `UserDtoMapper`).

| Route | Réponse |
|---|---|
| `POST /api/etudiants` | 201 + l'étudiant créé (400 si données invalides ou e-mail déjà utilisé) |
| `GET /api/etudiants` | 200 + la liste |
| `GET /api/etudiants/{id}` | 200 (404 si introuvable) |
| `PUT /api/etudiants/{id}` | 200 + l'étudiant modifié (400 / 404) |
| `DELETE /api/etudiants/{id}` | 204 (404 si introuvable) |

Toutes ces routes exigent un en-tête `Authorization: Bearer <token>` (sinon 401).

**Choix**

- **Champs de l'étudiant** : prénom, nom, e-mail, date de naissance, formation ou diplôme suivi (l'énoncé ne les précise pas).
- **Validation dans le DTO** : `@NotBlank`, `@Email`, `@NotNull`, `@Past` (date de naissance dans le passé).
- **E-mail unique** : contrainte `UNIQUE` en base **et** vérification dans le service (pour renvoyer un message clair plutôt qu'une erreur SQL). En modification, un étudiant peut garder son propre e-mail (`existsByEmailAndIdNot`).
- **404 si l'étudiant n'existe pas** : nouveau gestionnaire `EntityNotFoundException` dans `RestExceptionHandler`, écrit sur le modèle des gestionnaires existants. Nouvelle API → bons codes HTTP dès sa création.
- **Sécurité JWT** : `JwtService.extractUsername()` / `isTokenValid()` (vérification de la signature, de l'expiration et du propriétaire), et `JwtAuthenticationFilter` exécuté avant chaque requête, activé à l'endroit prévu par le code de départ.
- **Tests Postman** : collection `postman/EtuBibliotheque.postman_collection.json` (inscription, connexion, sécurité sans token → 401, puis ajout, liste, détail, modification, suppression), exécutable en ligne de commande avec Newman.

---

## 5. Étape 5 – Écrans des étudiants (front-end)

| Élément | Rôle |
|---|---|
| `models/Etudiant.ts`, `service/etudiant.service.ts` | Modèle miroir de `EtudiantDTO` ; les 5 appels à l'API |
| `interceptor/auth.interceptor.ts` | Ajoute automatiquement `Authorization: Bearer <token>` à chaque requête |
| `guard/auth.guard.ts` (`CanActivate`) | Écrans étudiants réservés aux agents connectés, sinon redirection vers `/login` |
| `pages/etudiant-list` | Tableau, boutons Détail / Modifier / Supprimer, « Ajouter un étudiant », « Se déconnecter » |
| `pages/etudiant-detail` | Informations d'un étudiant (lecture de l'`id` dans l'URL) |
| `pages/etudiant-form` | **Un seul formulaire** pour l'ajout (`/etudiants/new`) et la modification (`/etudiants/:id/edit`, pré-rempli) |

**Choix**

- **Intercepteur** plutôt qu'un en-tête ajouté dans chaque méthode : écrit une fois, impossible à oublier.
- **Guard** : protège l'interface ; la vraie sécurité reste le back-end (token vérifié → 401).
- **Token expiré (401)** : l'agent est déconnecté et renvoyé vers `/login` au lieu de voir une erreur incompréhensible.
- **Suppression confirmée** par `confirm()` du navigateur (l'énoncé précise que l'esthétique importe peu).
- **Après la connexion** : redirection vers la liste des étudiants.
- **Bouton « Se déconnecter »** (non demandé par l'énoncé) : utile pour l'agent et pour tester le guard.
- **Route `/etudiants/new` déclarée avant `/etudiants/:id`** : Angular teste les routes dans l'ordre, sinon « new » serait pris pour un identifiant.

---

## 6. Outillage et environnement

| Sujet | Modification | Pourquoi |
|---|---|---|
| Tests d'intégration fournis | Testcontainers **1.20.0 → 1.21.4** | La 1.20.0 dialogue avec Docker via l'API 1.32 ; Docker 29 exige au minimum l'API 1.40 (« client version 1.32 is too old ») |
| Tests d'intégration fournis | Image de test **`mysql:latest` → `mysql:8.4`** (version LTS) | `latest` désignait MySQL 26.7, qui refuse le paramètre `innodb_log_file_size` ajouté par Testcontainers. Épingler les versions rend les tests reproductibles |
| Débogage | `.vscode/launch.json` | Équivalent VS Code d'une « Run Configuration » IntelliJ : lance le back-end en mode débogage depuis le dossier `backend/` (là où se trouvent `.env` et `compose.yaml`) |
| Maven | Utilisation du Maven Wrapper `./mvnw` | La version de Maven (3.9.11) est fixée dans le projet (`.mvn/wrapper/maven-wrapper.properties`) : même version pour tous, sans installation |
| Tests d'API | Newman (`npx newman run ...`) | Lanceur officiel des collections Postman en ligne de commande, utilisable dans une chaîne CI/CD |

---

## 7. Exercice 2 – Tests

| Étape | Réalisation |
|---|---|
| 1 – Analyse des tests fournis | Tests relus et exécutés (`./mvnw clean test` : 6/6, après réparation décrite au § 6). Constat : seule l'inscription est testée. |
| 2 – Plan de tests | [plan-de-tests.md](plan-de-tests.md) : 10 tests unitaires back, 7 d'intégration back, 16 Jest, 9 parcours Cypress, du simple au complexe, avec entrées et sorties attendues. |
| 3 – Tests back-end | 17 tests ajoutés (10 unitaires, 7 d'intégration), 23 au total. Couverture des lignes : **35,9 % → 86,7 %** (instructions : 84,6 %). JaCoCo génère le rapport et fait échouer le build sous 80 % (`./mvnw clean verify`). |

| 4 – Tests front-end (Jest) | 19 tests ajoutés, 28 au total. Couverture des lignes : **58,9 % → 82,7 %** (instructions : 83,9 %). `npm test` échoue sous 80 %. |

| 5 – Tests E2E (Cypress) | 9 parcours (inscription, connexion, sécurité, liste, détail, ajout, modification, suppression, déconnexion), API simulée avec `cy.intercept()`. Couverture de code E2E : **82,3 % des lignes, 83,4 % des instructions** ; `npm run e2e:coverage` échoue sous 80 %. |

**Choix pour les tests back-end**

- **JaCoCo** mesure la couverture ; le code généré par Lombok en est exclu (`lombok.config`) pour ne mesurer que le code écrit à la main.
- **Seuil de 80 % contrôlé automatiquement** (règle `check`) : le seuil devient une garantie vérifiée à chaque build, comme une « quality gate » de CI.
- **Tests unitaires** avec `MockitoExtension` (plutôt que `SpringExtension`) ; le mapper MapStruct est utilisé réellement (`@Spy`) car il ne fait que recopier des champs.
- **Tests d'intégration** : chaque test inscrit et connecte un agent via `/api/login` pour obtenir un vrai token ; le filtre JWT est donc testé en conditions réelles.
- Les tests ajoutés aux fichiers fournis (`UserServiceTest`, `UserControllerTest`) respectent leur style ; le test de connexion protège la correction du bug `matches` contre une régression.

**Choix pour les tests front-end**

- **Mesure honnête** : `collectCoverageFrom` inclut tous les fichiers de `src/app`, même ceux qu'aucun test ne charge (sans ce réglage, l'intercepteur et les routes étaient absents du rapport, qui affichait 64,7 % au lieu de 58,9 %).
- **Seuil de 80 %** contrôlé par Jest (`coverageThreshold`), comme la règle JaCoCo du back-end.
- **Services** testés avec `HttpTestingController` (faux serveur : on vérifie la requête envoyée et on fournit la réponse) ; **composants** testés avec des doublures `jest.fn()` et en vérifiant le HTML affiché (lignes du tableau, messages).
- **Écrans qui lisent l'URL** (détail, formulaire) testés avec `RouterTestingHarness`, qui ouvre une vraie adresse (`/etudiants/1`, `/etudiants/1/edit`).
- **Test fourni corrigé** : `register.component.spec.ts` fournissait la classe `UserMockService` au lieu d'un objet. `user-mock.service.ts` est conservé, avec un commentaire expliquant pourquoi il n'est plus utilisé et ce qui le remplace.

**Choix pour les tests E2E**

- **API simulée** (`cy.intercept()`, demandé par l'énoncé) : les tests ne dépendent ni du back-end ni des données en base, et vérifient aussi le contenu des requêtes envoyées (corps, en-tête `Bearer`).
- **Connexion par formulaire testée une seule fois** (E2E-02) ; les autres parcours rangent directement un token avant le chargement de la page (`onBeforeLoad`).
- **Couverture de code** : Angular 19 compile avec esbuild, pour lequel il n'existe pas d'instrumentation fiable. Une configuration **séparée** utilise donc l'ancien compilateur webpack d'Angular (`@angular-builders/custom-webpack`) avec `coverage-istanbul-loader` ; l'application normale n'est pas modifiée. Toute l'application étant chargée par le navigateur (pas de chargement différé), tous les fichiers de `src/app` figurent dans le rapport.
- **Xvfb** (écran virtuel) est nécessaire pour lancer le navigateur de Cypress sur un serveur Linux sans affichage.

**Choix** : l'énoncé demande de ne pas tester les cas d'erreur ; faute de précision du mentor, le plan se limite aux cas nominaux, avec deux exceptions justifiées (tests de sécurité « sans token → 401 » et tests fournis conservés). Des cas d'erreur ciblés ne seront ajoutés que si la couverture reste sous 80 %.

## 8. Améliorations possibles (non réalisées)

- Répondre **401** (et non 400) en cas de mauvais identifiants sur `/api/login`.
- Afficher les erreurs serveur et masquer le mot de passe sur l'écran d'inscription.
- Corriger l'import `AccessDeniedException` et la signature du gestionnaire `Exception.class` dans `RestExceptionHandler`.
- Restreindre les endpoints Actuator en production.
- Épingler la version de MySQL dans `compose.yaml` (nécessite de recréer la base de développement).
- Moderniser la configuration `DaoAuthenticationProvider` (API dépréciée).
