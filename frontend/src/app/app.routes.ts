import { Routes } from '@angular/router';
import {RegisterComponent} from './pages/register/register.component';
import {LoginComponent} from './pages/login/login.component';

// Table de routage : associe chaque URL à l'écran (composant) affiché dans <router-outlet/> (app.component.html)
export const routes: Routes = [
  {
    // Correction : l'URL vide (http://localhost:4200/) redirige vers la page de connexion.
    // Avant, elle affichait AppComponent à l'intérieur de lui-même (incohérence relevée à l'étape 1).
    // pathMatch 'full' = seulement si l'URL est entièrement vide (sinon toutes les URL seraient redirigées)
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    // Nouvel écran de connexion : http://localhost:4200/login
    path: 'login',
    component: LoginComponent
  }

];
