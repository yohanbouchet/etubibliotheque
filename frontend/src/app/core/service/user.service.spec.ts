import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Register } from '../models/Register';

// Tests unitaires de UserService (plan de tests : UF-01 à UF-04).
// provideHttpClientTesting remplace le vrai réseau par un "faux serveur" (HttpTestingController) :
// aucune requête ne part réellement ; le test vérifie la requête envoyée puis fournit lui-même la réponse.
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  // beforeEach : exécuté avant CHAQUE test (même rôle que @BeforeEach en Java)
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // afterEach : après chaque test, on vérifie qu'aucune requête inattendue n'est restée sans réponse,
  // et on vide sessionStorage pour que les tests restent indépendants
  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // UF-01 : avec un token dans sessionStorage, l'agent est considéré comme connecté
  it('isLoggedIn returns true when a token is stored', () => {
    // GIVEN
    sessionStorage.setItem('token', 'abc');

    // WHEN / THEN
    expect(service.isLoggedIn()).toBe(true);
  });

  // UF-02 : la déconnexion supprime le token
  it('logout removes the token', () => {
    // GIVEN
    sessionStorage.setItem('token', 'abc');

    // WHEN
    service.logout();

    // THEN
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  // UF-03 : l'inscription envoie POST /api/register avec les données de l'agent
  it('register sends POST /api/register with the user', () => {
    // GIVEN
    const user: Register = { firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'secret' };

    // WHEN : subscribe() déclenche l'envoi de la requête
    service.register(user).subscribe();

    // THEN : exactement une requête vers /api/register, en POST, avec ce corps
    const req = httpMock.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush(null); // le faux serveur répond (réponse vide, comme le vrai back-end : 201 sans corps)
  });

  // UF-04 : la connexion envoie POST /api/login et range le token reçu dans sessionStorage
  it('login sends POST /api/login and stores the token', () => {
    // WHEN
    let response: { token: string } | undefined;
    service.login({ login: 'jdoe', password: 'secret' }).subscribe(res => response = res);

    // THEN : la requête est correcte…
    const req = httpMock.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ login: 'jdoe', password: 'secret' });
    // … le faux serveur répond avec un token…
    req.flush({ token: 'abc' });
    // … qui est transmis au composant ET rangé dans sessionStorage
    expect(response).toEqual({ token: 'abc' });
    expect(sessionStorage.getItem('token')).toBe('abc');
  });
});
