import { HttpInterceptorFn } from '@angular/common/http';

// Intercepteur HTTP : une fonction exécutée AUTOMATIQUEMENT avant chaque requête envoyée par HttpClient
// (comme un reverse proxy qui ajoute un en-tête au passage). On l'écrit une fois, au lieu de répéter
// l'en-tête "Authorization" dans chaque méthode des services.
// Il est activé dans app.config.ts : provideHttpClient(withInterceptors([authInterceptor])).
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Token rangé dans sessionStorage par UserService.login() (étape 3)
  const token = sessionStorage.getItem('token');

  // Pas de token (ex. avant la connexion, sur /api/login ou /api/register) : requête envoyée telle quelle
  if (!token) {
    return next(req);
  }
  // Une requête Angular ne se modifie pas directement : on en fait une copie (clone)
  // à laquelle on ajoute l'en-tête "Authorization: Bearer <token>" attendu par JwtAuthenticationFilter
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  // next() transmet la requête (modifiée) à la suite de la chaîne, puis au serveur
  return next(authReq);
};
