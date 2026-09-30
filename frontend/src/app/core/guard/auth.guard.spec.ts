import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { authGuard } from './auth.guard';

// Tests unitaires du guard (plan de tests : UF-07 et UF-08).
describe('authGuard', () => {
  // Généré par Angular CLI : exécute le guard dans le "contexte d'injection" d'Angular,
  // nécessaire car le guard utilise inject() pour obtenir UserService et Router
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  // Le guard n'utilise pas la route demandée : des objets vides suffisent
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // UserService a besoin de HttpClient ; Router a besoin de provideRouter
      providers: [provideHttpClient(), provideRouter([])]
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  // UF-07 : agent connecté (token présent) → accès autorisé
  it('allows access when the agent is logged in', () => {
    // GIVEN
    sessionStorage.setItem('token', 'abc');

    // WHEN / THEN
    expect(executeGuard(route, state)).toBe(true);
  });

  // UF-08 (sécurité) : agent non connecté → redirection vers /login
  it('redirects to /login when the agent is not logged in', () => {
    // WHEN : aucun token
    const result = executeGuard(route, state);

    // THEN : le guard renvoie un UrlTree ("va plutôt sur...") qui pointe vers /login
    const router = TestBed.inject(Router);
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
