# Plan de tests – EtuBibliothèque

Ce document répond à l'étape 2 de l'exercice « Effectuez des tests unitaires et d'intégration » : lister les cas de tests à écrire, **du plus simple au plus complexe**, avec leurs **entrées** et **sorties attendues**.

## 1. Analyse des tests existants (code de départ)

| Fichier | Type | Ce qui est testé |
|---|---|---|
| `UserServiceTest` | Unitaire (Mockito) | `UserService.register` : utilisateur `null`, login déjà existant, inscription réussie |
| `UserControllerTest` | Intégration (MockMvc + MySQL via Testcontainers) | `POST /api/register` : champs manquants (400), login déjà existant (400), inscription réussie (201) |
| `*.spec.ts` (front) | Jest | Uniquement « le composant ou le service se crée » (`should create`) |

**Non testé** : `/api/login`, `JwtService`, le filtre JWT, toute la gestion des étudiants (back et front), le guard, l'intercepteur. Aucun test E2E.

### Bonnes pratiques à réutiliser

- **Structure GIVEN / WHEN / THEN** : préparer la situation, exécuter l'action, vérifier le résultat.
- **Test unitaire** : la classe testée est réelle (`@InjectMocks`), ses dépendances sont des doublures (`@Mock`) programmées avec `when(...).thenReturn(...)` ; on vérifie les appels avec `verify(...)` et on examine les objets transmis avec `ArgumentCaptor`.
- **Test d'intégration** : toute l'application est démarrée (`@SpringBootTest`), les requêtes HTTP sont simulées par MockMvc, la base est un conteneur MySQL jetable (Testcontainers) branché par `@DynamicPropertySource`.
- **Tests indépendants** : la base est vidée après chaque test (`@AfterEach` → `deleteAll()`).
- **Données de test en constantes** (`FIRST_NAME`, `LOGIN`…).

### Points d'amélioration relevés

- `@ExtendWith(SpringExtension.class)` pour un test unitaire : `MockitoExtension` est l'outil dédié (plus léger, signale les programmations inutiles).
- Test « login déjà existant » : `passwordEncoder.encode` est programmé inutilement (la méthode s'arrête avant).
- `test_create_user` compare l'utilisateur capturé à lui-même : il ne prouve pas que le mot de passe a été haché.
- Nommage incohérent entre les deux fichiers (`snake_case` / `camelCase`). Nos tests utiliseront le camelCase, avec un nom qui décrit le comportement attendu (ex. `findAllReturnsAllStudents`).

## 2. Stratégie

**Pyramide des tests** : beaucoup de tests unitaires (rapides, ciblés), moins de tests d'intégration (toute la chaîne, plus lents), quelques tests E2E (parcours utilisateur complets dans un navigateur).

**Périmètre** : conformément à l'énoncé (« Ne testez pas les cas d'erreur », « Ne vérifiez pas les effets de bord »), le plan couvre les **cas nominaux** (tout se passe bien). Deux exceptions justifiées :

- **Sécurité** : l'accès sans token (API → 401, écrans → redirection vers `/login`) prouve la sécurisation demandée par l'exercice 1.
- **Tests fournis** : ils sont conservés tels quels (ils contiennent des cas d'erreur).

Si un rapport de couverture reste sous 80 % avec les seuls cas nominaux, des cas d'erreur ciblés seront ajoutés et signalés comme tels.

**Priorité** : 1 = simple (une méthode, peu de préparation) → 3 = complexe (plusieurs dépendances ou un parcours complet).

**Identifiants** : `UB` unitaire back · `IB` intégration back · `UF` unitaire front (Jest) · `E2E` bout en bout (Cypress).

## 3. Back-end – tests unitaires (JUnit 5 + Mockito)

| ID | Prio. | Élément testé | Entrée (GIVEN) | Sortie attendue (THEN) |
|---|---|---|---|---|
| UB-01 | 1 | `JwtService.generateToken` | un `UserDetails` de login « agent » | un token non vide, en 3 parties séparées par des points |
| UB-02 | 1 | `JwtService.extractUsername` | un token généré pour « agent » | « agent » |
| UB-03 | 1 | `JwtService.isTokenValid` | un token généré pour « agent » et le même utilisateur | `true` |
| UB-04 | 1 | `EtudiantService.findAll` | le repository renvoie 2 étudiants | une liste de 2 `EtudiantDTO` |
| UB-05 | 1 | `EtudiantService.findById` | le repository trouve l'étudiant d'id 1 | l'`EtudiantDTO` correspondant |
| UB-06 | 2 | `EtudiantService.create` | un DTO valide, e-mail non utilisé | le repository reçoit l'entité (`save` appelé) ; le DTO renvoyé contient l'id attribué |
| UB-07 | 2 | `EtudiantService.update` | l'étudiant d'id 1 existe, nouvel e-mail libre | les nouvelles valeurs sont enregistrées (`save`) et renvoyées |
| UB-08 | 2 | `EtudiantService.delete` | l'étudiant d'id 1 existe | `delete` du repository appelé avec cet étudiant |
| UB-09 | 2 | `UserService.login` | login existant, mot de passe correspondant au hash (`matches` → true) | le token renvoyé par `JwtService` |
| UB-10 | 2 | `CustomUserDetailService.loadUserByUsername` | le repository trouve l'agent « agent » | l'utilisateur correspondant |

## 4. Back-end – tests d'intégration (MockMvc + MySQL via Testcontainers)

Modèle : `UserControllerTest`. Pour les routes protégées, un agent est créé puis connecté en début de test afin d'obtenir un token.

| ID | Prio. | Route | Entrée | Sortie attendue |
|---|---|---|---|---|
| IB-01 | 1 | `POST /api/login` | agent inscrit, bons identifiants | 200 ; le corps contient un champ `token` non vide |
| IB-02 | 1 | `GET /api/etudiants` | **aucun token** | 401 (sécurité) |
| IB-03 | 1 | `GET /api/etudiants` | token valide, 2 étudiants en base | 200 ; tableau de 2 éléments |
| IB-04 | 2 | `GET /api/etudiants/{id}` | token valide, étudiant existant | 200 ; ses champs (`firstName`, `email`…) |
| IB-05 | 2 | `POST /api/etudiants` | token valide, JSON valide | 201 ; l'étudiant renvoyé a un `id` ; il est présent en base |
| IB-06 | 3 | `PUT /api/etudiants/{id}` | token valide, étudiant existant, formation modifiée | 200 ; la nouvelle formation est renvoyée et enregistrée en base |
| IB-07 | 3 | `DELETE /api/etudiants/{id}` | token valide, étudiant existant | 204 ; l'étudiant n'est plus en base |

## 5. Front-end – tests unitaires (Jest)

Les appels HTTP sont simulés avec `HttpTestingController` (services) ou des services doublures (composants).

| ID | Prio. | Élément testé | Entrée | Sortie attendue |
|---|---|---|---|---|
| UF-01 | 1 | `UserService.isLoggedIn` | un token présent dans `sessionStorage` | `true` |
| UF-02 | 1 | `UserService.logout` | un token présent | le token est supprimé de `sessionStorage` |
| UF-03 | 1 | `UserService.register` | un objet `Register` | requête `POST /api/register` avec ce corps |
| UF-04 | 1 | `UserService.login` | identifiants ; réponse `{token: "abc"}` | requête `POST /api/login` ; « abc » rangé dans `sessionStorage` |
| UF-05 | 1 | `EtudiantService.findAll / findById / create / update / delete` | un id et/ou un étudiant | la bonne méthode HTTP (GET, POST, PUT, DELETE) sur la bonne URL, avec le bon corps |
| UF-06 | 2 | `authInterceptor` | un token présent, une requête quelconque | la requête envoyée porte `Authorization: Bearer <token>` |
| UF-07 | 2 | `authGuard` | agent connecté | accès autorisé (`true`) |
| UF-08 | 2 | `authGuard` | **agent non connecté** | redirection vers `/login` (sécurité) |
| UF-09 | 2 | `LoginComponent` | formulaire rempli, le service renvoie un token | état succès, navigation vers `/etudiants` |
| UF-10 | 2 | `RegisterComponent` | formulaire rempli, inscription acceptée | appel du service, navigation vers `/login` |
| UF-11 | 2 | `EtudiantListComponent` | le service renvoie 2 étudiants | 2 lignes dans le tableau |
| UF-12 | 2 | `EtudiantListComponent` (suppression) | `confirm()` → OK | appel de `delete` ; la ligne disparaît de la liste |
| UF-13 | 2 | `EtudiantListComponent` (déconnexion) | clic sur « Se déconnecter » | `logout` appelé, navigation vers `/login` |
| UF-14 | 2 | `EtudiantDetailComponent` | URL `/etudiants/1`, le service renvoie l'étudiant | ses informations affichées |
| UF-15 | 3 | `EtudiantFormComponent` (ajout) | formulaire rempli, sans id dans l'URL | appel de `create`, navigation vers `/etudiants` |
| UF-16 | 3 | `EtudiantFormComponent` (modification) | URL `/etudiants/1/edit` | formulaire pré-rempli ; à l'envoi, appel de `update(1, ...)` puis navigation |

## 6. Bout en bout (Cypress)

Les appels à l'API sont simulés avec `cy.intercept()` : les tests ne dépendent pas du back-end. Ordre recommandé par l'énoncé : formulaires simples d'abord.

| ID | Prio. | Parcours | Entrée | Sortie attendue |
|---|---|---|---|---|
| E2E-01 | 1 | Inscription | formulaire `/register` rempli ; `POST /api/register` → 201 | redirection vers `/login` |
| E2E-02 | 1 | Connexion | login / mot de passe ; `POST /api/login` → `{token}` | redirection vers `/etudiants` |
| E2E-03 | 1 | Sécurité | ouverture de `/etudiants` sans être connecté | redirection vers `/login` |
| E2E-04 | 2 | Liste | agent connecté ; `GET /api/etudiants` → 2 étudiants | tableau de 2 lignes |
| E2E-05 | 2 | Détail | clic sur « Détail » ; `GET /api/etudiants/1` | informations de l'étudiant affichées |
| E2E-06 | 3 | Ajout | formulaire rempli ; `POST /api/etudiants` → 201 | retour à la liste |
| E2E-07 | 3 | Modification | clic sur « Modifier », formulaire pré-rempli, formation changée ; `PUT` → 200 | retour à la liste |
| E2E-08 | 3 | Suppression | clic sur « Supprimer », confirmation acceptée ; `DELETE` → 204 | la ligne disparaît |
| E2E-09 | 2 | Déconnexion | clic sur « Se déconnecter » | retour à `/login` ; `/etudiants` à nouveau inaccessible |

## 7. Rapports de couverture (objectif : 80 % minimum)

| Partie | Outil | Commande prévue |
|---|---|---|
| Back-end | JaCoCo (plugin Maven, à ajouter) | `./mvnw clean verify` → rapport HTML dans `backend/target/site/jacoco/` |
| Front-end (Jest) | Couverture intégrée à Jest (déjà activée) | `npm test` → rapport HTML dans `frontend/coverage/` |
| E2E (Cypress) | `@cypress/code-coverage` (code Angular instrumenté) | à définir à l'étape 5 |

Les classes sans logique (DTO et entités générés par Lombok, classe `main`) pourront être exclues du calcul de couverture, en le justifiant.
