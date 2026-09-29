import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EtudiantService } from '../../core/service/etudiant.service';
import { UserService } from '../../core/service/user.service';
import { Etudiant } from '../../core/models/Etudiant';

// Écran "détail d'un étudiant" (route /etudiants/:id, protégée par authGuard)
@Component({
  selector: 'app-etudiant-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './etudiant-detail.component.html',
  styleUrl: './etudiant-detail.component.css'
})
export class EtudiantDetailComponent implements OnInit {
  // ActivatedRoute = informations sur l'URL de l'écran affiché (dont le :id de /etudiants/:id)
  private route = inject(ActivatedRoute);
  private etudiantService = inject(EtudiantService);
  private userService = inject(UserService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // L'étudiant affiché (null tant qu'il n'est pas chargé)
  etudiant: Etudiant | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    // snapshot.paramMap.get('id') lit le :id de l'URL (ex. /etudiants/3 → "3", un texte) ;
    // Number(...) le convertit en nombre, le type attendu par findById
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.etudiantService.findById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (etudiant) => {
          this.etudiant = etudiant;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          // 401 = token absent ou expiré → déconnexion et retour à /login (comme sur la liste)
          if (error.status === 401) {
            this.userService.logout();
            this.router.navigate(['/login']);
            return;
          }
          // Ex. 404 → "Student with id 999 not found" (message renvoyé par RestExceptionHandler)
          this.errorMessage = error.error?.message ?? 'Erreur : le serveur ne répond pas.';
        }
      });
  }
}
