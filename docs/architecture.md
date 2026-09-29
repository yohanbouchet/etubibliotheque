# Architecture d'EtuBibliothèque

Les schémas ci-dessous sont écrits en [Mermaid](https://mermaid.js.org/) : GitHub les affiche automatiquement sous forme de diagrammes.

## 1. Vue d'ensemble

```mermaid
flowchart LR
    subgraph Poste["Navigateur de l'agent"]
        UI["Front-end Angular 19<br/>(localhost:4200)"]
    end
    subgraph Dev["Serveur de développement Angular (ng serve)"]
        Proxy["Proxy /api<br/>(proxy.conf.json)"]
    end
    subgraph Back["Back-end Spring Boot 3.5 / Java 21 (localhost:8080)"]
        Filtre["Filtres Spring Security<br/>+ JwtAuthenticationFilter"]
        Ctrl["Controllers<br/>(UserController, EtudiantController)"]
        Svc["Services<br/>(UserService, EtudiantService, JwtService)"]
        Repo["Repositories<br/>(Spring Data JPA)"]
    end
    DB[("MySQL<br/>conteneur Docker<br/>(compose.yaml)")]

    UI -- "HTTP /api/..." --> Proxy
    Proxy -- "redirige vers :8080" --> Filtre
    Filtre --> Ctrl --> Svc --> Repo --> DB
```

- Le navigateur ne parle qu'au port 4200 ; le proxy Angular transmet les appels `/api/...` au back-end (pas de problème de CORS en développement).
- Au démarrage du back-end, la dépendance `spring-boot-docker-compose` lance le conteneur MySQL décrit dans `compose.yaml` (identifiants dans `.env`).
- Hibernate crée ou met à jour les tables (`user`, `etudiant`) à partir des entités Java (`ddl-auto: update`).

## 2. Couches du back-end

```mermaid
flowchart TB
    C["Controller<br/>entrées/sorties HTTP, validation @Valid<br/>ne manipule que des DTO"]
    M["Mapper MapStruct<br/>DTO ⇄ entité"]
    S["Service<br/>règles métier (e-mail unique, 404...)<br/>@Transactional"]
    R["Repository<br/>JpaRepository : save, findAll, findById, delete..."]
    E["Entité JPA<br/>= une table MySQL"]
    H["RestExceptionHandler<br/>exception → code HTTP + JSON d'erreur"]

    C --> S
    S --> M
    S --> R --> E
    S -. "exceptions" .-> H
```

## 3. Couches du front-end

```mermaid
flowchart TB
    Routes["app.routes.ts<br/>URL → écran ; authGuard sur /etudiants/**"]
    Comp["Composants (écrans)<br/>login, register, etudiant-list, -detail, -form"]
    Svc["Services Angular<br/>UserService, EtudiantService"]
    Int["authInterceptor<br/>ajoute l'en-tête Authorization: Bearer + token"]
    API["API back-end /api/..."]
    SS[("sessionStorage<br/>token JWT")]

    Routes --> Comp --> Svc --> Int --> API
    Svc -- "login() range le token" --> SS
    Int -- "lit le token" --> SS
```

## 4. Parcours d'authentification JWT

```mermaid
sequenceDiagram
    actor Agent
    participant Front as Front-end Angular
    participant Filtre as JwtAuthenticationFilter
    participant API as Controllers / Services
    participant DB as MySQL

    Agent->>Front: saisit login + mot de passe
    Front->>API: POST /api/login (login, mot de passe)
    API->>DB: SELECT user WHERE login = ?
    API->>API: BCrypt : mot de passe saisi = hash stocké ?
    API-->>Front: 200 + token JWT (signé HS256, valable 1 h)
    Front->>Front: token rangé dans sessionStorage, affichage de /etudiants

    Agent->>Front: consulte la liste des étudiants
    Front->>Filtre: GET /api/etudiants + en-tête Authorization Bearer
    Filtre->>Filtre: vérifie signature, expiration et propriétaire du token
    alt token valide
        Filtre->>API: requête authentifiée
        API->>DB: SELECT * FROM etudiant
        API-->>Front: 200 + liste des étudiants
    else token absent, modifié ou expiré
        Filtre-->>Front: 401 Unauthorized
        Front->>Front: déconnexion, retour à /login
    end
```

**À retenir** : le serveur ne garde aucune session (`STATELESS`) ; c'est le token, présenté à chaque requête, qui prouve l'identité. Son contenu est lisible par tous (encodé en Base64, pas chiffré), mais il ne peut pas être modifié sans la clé secrète du serveur.
