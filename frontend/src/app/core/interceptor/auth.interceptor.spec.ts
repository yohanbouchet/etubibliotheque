import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { authInterceptor } from './auth.interceptor';

// Test unitaire de l'intercepteur (plan de tests : UF-06).
// On configure HttpClient AVEC l'intercepteur (comme dans app.config.ts), on envoie une requête quelconque,
// puis on regarde, dans le faux serveur, quels en-têtes elle porte réellement.
describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  // UF-06 : avec un token, la requête part avec "Authorization: Bearer <token>"
  it('adds the Bearer token to requests when a token is stored', () => {
    // GIVEN
    sessionStorage.setItem('token', 'abc');

    // WHEN
    http.get('/api/etudiants').subscribe();

    // THEN
    const req = httpMock.expectOne('/api/etudiants');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush([]);
  });

  // Avant la connexion (pas de token) : la requête part sans en-tête Authorization
  it('sends requests unchanged when no token is stored', () => {
    // WHEN
    http.post('/api/login', {}).subscribe();

    // THEN
    const req = httpMock.expectOne('/api/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
