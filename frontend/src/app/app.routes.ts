import { Routes } from '@angular/router';
import {RegisterComponent} from './pages/register/register.component';
import {LoginComponent} from './pages/login/login.component';
import {EtudiantListComponent} from './pages/etudiant-list/etudiant-list.component';
import {EtudiantDetailComponent} from './pages/etudiant-detail/etudiant-detail.component';
import {EtudiantFormComponent} from './pages/etudiant-form/etudiant-form.component';
import {authGuard} from './core/guard/auth.guard';

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
  },
  // Étape 5 : écrans des étudiants, tous protégés par authGuard (accès réservé aux agents connectés)
  {
    // Liste des étudiants
    path: 'etudiants',
    component: EtudiantListComponent,
    canActivate: [authGuard]
  },
  {
    // Formulaire d'ajout. Placée AVANT 'etudiants/:id' : sinon "new" serait pris pour un id
    path: 'etudiants/new',
    component: EtudiantFormComponent,
    canActivate: [authGuard]
  },
  {
    // Détail d'un étudiant. ":id" = partie variable de l'URL (ex. /etudiants/3 → id = 3)
    path: 'etudiants/:id',
    component: EtudiantDetailComponent,
    canActivate: [authGuard]
  },
  {
    // Formulaire de modification : même composant que l'ajout, pré-rempli grâce à l'id
    path: 'etudiants/:id/edit',
    component: EtudiantFormComponent,
    canActivate: [authGuard]
  }

];
