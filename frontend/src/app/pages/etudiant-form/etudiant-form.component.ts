import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { EtudiantService } from '../../core/service/etudiant.service';
import { UserService } from '../../core/service/user.service';
import { Etudiant } from '../../core/models/Etudiant';

// Formulaire étudiant, utilisé pour DEUX écrans (routes protégées par authGuard) :
//   /etudiants/new       → ajout (formulaire vide, puis POST)
//   /etudiants/:id/edit  → modification (formulaire pré-rempli, puis PUT)
// Même principe que register/login : formulaire réactif + états chargement/erreur.
@Component({
  selector: 'app-etudiant-form',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './etudiant-form.component.html',
  styleUrl: './etudiant-form.component.css'
})
export class EtudiantFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private etudiantService = inject(EtudiantService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  etudiantForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  errorMessage: string | null = null;
  // id de l'étudiant modifié ; null en mode ajout (l'URL /etudiants/new n'a pas de :id)
  etudiantId: number | null = null;
  // Date du jour au format "AAAA-MM-JJ" : date maximale proposée par le calendrier (naissance dans le passé)
  today: string = new Date().toISOString().slice(0, 10);

  // Vrai en mode modification : sert au titre de l'écran et au choix entre create() et update()
  get isEdit(): boolean {
    return this.etudiantId !== null;
  }

  // Raccourci utilisé dans le HTML : form['email'] au lieu de etudiantForm.controls['email']
  get form() {
    return this.etudiantForm.controls;
  }

  ngOnInit(): void {
    // Mêmes règles que EtudiantDTO côté back-end (@NotBlank, @Email, @NotNull)
    this.etudiantForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required],
      training: ['', Validators.required]
    });

    // Mode modification : l'URL contient un :id → on charge l'étudiant pour pré-remplir le formulaire
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.etudiantId = Number(idParam);
      this.loading = true;
      this.etudiantService.findById(this.etudiantId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (etudiant) => {
            // patchValue remplit les champs du formulaire qui portent le même nom que les champs reçus
            this.etudiantForm.patchValue(etudiant);
            this.loading = false;
          },
          error: (error: HttpErrorResponse) => this.handleError(error)
        });
    }
  }

  // Clic sur "Enregistrer"
  onSubmit(): void {
    this.submitted = true;
    if (this.etudiantForm.invalid) {
      return;
    }
    this.loading = true;
    this.errorMessage = null;

    // Objet envoyé au back-end, au format du modèle Etudiant (= EtudiantDTO côté Java)
    const etudiant: Etudiant = this.etudiantForm.value;
    // Selon le mode : PUT /api/etudiants/{id} (modification) ou POST /api/etudiants (ajout)
    const request$ = this.isEdit
      ? this.etudiantService.update(this.etudiantId!, etudiant)
      : this.etudiantService.create(etudiant);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // Succès : retour à la liste, qui affiche l'étudiant ajouté ou modifié
        next: () => this.router.navigate(['/etudiants']),
        error: (error: HttpErrorResponse) => this.handleError(error)
      });
  }

  // Gestion des erreurs du serveur :
  // 401 → token absent/expiré : déconnexion et retour à /login ;
  // sinon : "message" (nos erreurs, ex. e-mail déjà utilisé, étudiant introuvable),
  //   ou "detail" (erreurs de validation @Valid, format standard de Spring),
  //   ou status 0 = aucune réponse (back-end arrêté).
  private handleError(error: HttpErrorResponse): void {
    this.loading = false;
    if (error.status === 401) {
      this.userService.logout();
      this.router.navigate(['/login']);
      return;
    }
    this.errorMessage = error.error?.message ?? error.error?.detail
      ?? (error.status === 0 ? 'Erreur : le serveur ne répond pas.' : `Erreur ${error.status}`);
  }
}
