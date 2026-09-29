import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../service/user.service';

// Guard "CanActivate" : Angular l'exécute AVANT d'afficher un écran protégé (déclaré dans app.routes.ts
// avec canActivate: [authGuard]). Il répond à la question "a-t-on le droit d'entrer sur cet écran ?".
// Comme une règle de pare-feu en entrée : connecté → on laisse passer ; sinon → redirection vers /login.
// Remarque : c'est une protection de l'INTERFACE ; la vraie sécurité reste côté back-end (token vérifié → 401).
export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isLoggedIn()) {
    return true;
  }
  // createUrlTree = "va plutôt sur /login" (Angular annule l'accès à l'écran demandé et redirige)
  return router.createUrlTree(['/login']);
};
