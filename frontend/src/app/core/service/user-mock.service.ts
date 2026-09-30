import {Register} from '../models/Register';
import {Observable, of} from 'rxjs';

// ⚠️ Fichier du code de départ, CONSERVÉ mais PLUS UTILISÉ (exercice 2, étape 4).
//
// Pourquoi il n'est plus utilisé :
//  - il n'était employé que par register.component.spec.ts, de façon incorrecte :
//    { provide: UserService, useValue: UserMockService } fournissait la CLASSE au lieu d'un objet,
//    la doublure n'était donc jamais réellement utilisable ;
//  - il ne simule que register() : il ne couvre ni login(), ni isLoggedIn(), ni logout() ;
//  - of() sans valeur se termine sans jamais répondre : le code exécuté après une inscription réussie
//    (alert puis redirection vers /login) n'était donc jamais testé.
//
// Ce qui le remplace : des doublures Jest déclarées directement dans chaque fichier de test, par exemple
//  - pages/register/register.component.spec.ts : { register: jest.fn().mockReturnValue(of({})) }
//  - pages/login/login.component.spec.ts        : { login: jest.fn().mockReturnValue(of({ token: 'abc' })) }
// jest.fn() enregistre les appels (vérifiables avec toHaveBeenCalledWith) et répond ce que le test a programmé.
//
// Il est exclu du calcul de couverture (jest.config.js → collectCoverageFrom).
export class UserMockService {

  register(user: Register): Observable<Object> {
    return of();
  }
}
