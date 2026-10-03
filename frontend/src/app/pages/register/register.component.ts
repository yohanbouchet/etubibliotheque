import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Register } from '../../core/models/Register';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [CommonModule, MaterialModule],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  // Router = le service Angular qui change d'écran par programme (ici, vers /login après l'inscription)
  private router = inject(Router);
  registerForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  // Ajout (exercice d'entraînement) : message d'erreur renvoyé par le back-end, affiché en rouge dans le template.
  // null = pas d'erreur → le bloc @if (errorMessage) du HTML reste masqué
  errorMessage: string | null = null;

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        login: ['', Validators.required],
        password: ['', Validators.required]
      },
    );
  }

  get form() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    // Chaque nouvelle tentative repart d'un écran propre : on efface l'erreur de la tentative précédente
    this.errorMessage = null;
    if (this.registerForm.invalid) {
      return;
    }
    const registerUser: Register = {
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      login: this.registerForm.get('login')?.value,
      password: this.registerForm.get('password')?.value
    };
    this.userService.register(registerUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      // subscribe({ next, error }) : avant, seul le succès était traité ; une erreur du back-end
      // (ex. login déjà utilisé → 400) n'était écoutée par personne et rien ne s'affichait
      .subscribe({
        // Succès (201) : alerte puis redirection vers l'écran de connexion
        next: () => {
          alert('SUCCESS!! :-)');
          // TODO traité : après une inscription réussie, le Router affiche l'écran de connexion (/login)
          this.router.navigate(['/login']);
        },
        // Erreur : on affiche le message renvoyé par le back-end (ex. "User with login agent.demo already exists"),
        // ou un message générique si le serveur n'a pas répondu (back-end arrêté, etc.)
        // ?. = "si ça existe" ; ?? = "sinon, prendre la valeur de droite"
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message ?? 'Connexion impossible : le serveur ne répond pas.';
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.registerForm.reset();
  }
}
