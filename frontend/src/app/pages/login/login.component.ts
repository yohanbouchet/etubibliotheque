import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { LoginRequest } from '../../core/models/LoginRequest';

// @Component déclare un écran Angular : son nom de balise (selector), son HTML et son CSS.
// "imports" = les modules utilisés par le HTML (mêmes que register : formulaires réactifs, etc.)
@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  // inject() = injection de dépendances : Angular fournit au composant les outils dont il a besoin
  // (le service qui parle au back-end, le constructeur de formulaire, la gestion de la destruction)
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  loginForm: FormGroup = new FormGroup({});
  // Passe à true au premier clic : sert à n'afficher les erreurs de saisie qu'après une tentative
  submitted: boolean = false;

  // Les 3 états demandés par l'énoncé, lus par le HTML pour afficher le bon message :
  // loading = appel en cours (bouton désactivé) ; errorMessage = message d'erreur ; success = connecté
  loading: boolean = false;
  errorMessage: string | null = null;
  success: boolean = false;

  // ngOnInit() est appelé automatiquement par Angular à l'affichage de l'écran
  ngOnInit() {
    // Formulaire : login et mot de passe obligatoires (comme les @NotBlank de LoginRequestDTO)
    // ['', Validators.required] = valeur de départ vide + règle "champ obligatoire"
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // Raccourci utilisé dans le HTML : form['login'] au lieu de loginForm.controls['login']
  get form() {
    return this.loginForm.controls;
  }

  // Appelée au clic sur "Se connecter" (ngSubmit dans le HTML)
  onSubmit(): void {
    this.submitted = true;
    // Formulaire incomplet : on s'arrête là, inutile d'interroger le back-end
    if (this.loginForm.invalid) {
      return;
    }
    // Début de l'appel : état "chargement", on efface le résultat précédent
    this.loading = true;
    this.errorMessage = null;
    this.success = false;

    // Construction de l'objet envoyé, au format du modèle LoginRequest (= LoginRequestDTO côté Java)
    const credentials: LoginRequest = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };
    // login() renvoie un Observable : la réponse arrivera plus tard (appel réseau asynchrone).
    // pipe(...) fonctionne comme le "|" du shell : le flux passe par un filtre avant d'être consommé.
    //   réponse HTTP | takeUntilDestroyed | subscribe (next / error)
    this.userService.login(credentials)
      // Si l'utilisateur quitte l'écran avant la réponse, l'abonnement est coupé automatiquement
      // (évite de mettre à jour un composant détruit, comme tuer un "tail -f" quand on ferme son terminal)
      // — même ligne que dans register.component.ts
      .pipe(takeUntilDestroyed(this.destroyRef))
      // subscribe() = s'abonner à la réponse : next en cas de succès, error en cas d'échec
      .subscribe({
        // Succès : le token a été reçu (et rangé dans sessionStorage par le service)
        next: () => {
          this.loading = false;
          this.success = true;
        },
        // Erreur : on affiche le message renvoyé par le back-end (ex. "Invalid credentials"),
        // ou un message générique si le serveur n'a pas répondu (back-end arrêté, etc.)
        // ?. = "si ça existe" ; ?? = "sinon, prendre la valeur de droite"
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = error.error?.message ?? 'Connexion impossible : le serveur ne répond pas.';
        }
      });
  }
}
