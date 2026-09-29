import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EtudiantService } from '../../core/service/etudiant.service';
import { UserService } from '../../core/service/user.service';
import { Etudiant } from '../../core/models/Etudiant';

// Écran "liste des étudiants" (route /etudiants, protégée par authGuard).
// RouterLink (dans imports) permet au HTML de créer des liens vers les autres écrans (détail, ajout...).
@Component({
  selector: 'app-etudiant-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './etudiant-list.component.html',
  styleUrl: './etudiant-list.component.css'
})
export class EtudiantListComponent implements OnInit {
  // Injection des services : EtudiantService (appels API), UserService (déconnexion), Router (navigation)
  private etudiantService = inject(EtudiantService);
  private userService = inject(UserService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Les étudiants reçus du back-end, affichés dans le tableau du HTML
  etudiants: Etudiant[] = [];
  // Les états (comme sur l'écran de connexion) : chargement et message d'erreur
  loading: boolean = false;
  errorMessage: string | null = null;

  // À l'affichage de l'écran : on charge la liste
  ngOnInit(): void {
    this.loadEtudiants();
  }

  // Appelle GET /api/etudiants (le token est ajouté automatiquement par authInterceptor)
  loadEtudiants(): void {
    this.loading = true;
    this.errorMessage = null;
    this.etudiantService.findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (etudiants) => {
          this.etudiants = etudiants;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.handleError(error);
        }
      });
  }

  // Bouton "Supprimer" d'une ligne : demande de confirmation, puis DELETE /api/etudiants/{id}
  deleteEtudiant(etudiant: Etudiant): void {
    // confirm() = boîte de dialogue du navigateur (OK → true ; Annuler → false : on ne fait rien)
    if (!confirm(`Supprimer l'étudiant ${etudiant.firstName} ${etudiant.lastName} ?`)) {
      return;
    }
    this.errorMessage = null;
    this.etudiantService.delete(etudiant.id!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // Succès (204) : on retire l'étudiant du tableau affiché, sans recharger toute la liste.
        // filter() garde tous les étudiants SAUF celui dont l'id vient d'être supprimé
        next: () => {
          this.etudiants = this.etudiants.filter(e => e.id !== etudiant.id);
        },
        error: (error: HttpErrorResponse) => this.handleError(error)
      });
  }

  // Bouton "Se déconnecter" : efface le token puis retour à l'écran de connexion
  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  // Gestion des erreurs :
  // 401 = token absent ou expiré (au bout d'1 heure) → on déconnecte et on renvoie vers /login ;
  // sinon, on affiche le message du serveur, ou un message générique si le serveur ne répond pas
  private handleError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.logout();
      return;
    }
    this.errorMessage = error.error?.message ?? 'Erreur : le serveur ne répond pas.';
  }
}
