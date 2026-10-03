import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
// of(...) = Observable qui répond "succès" ; throwError(...) = Observable qui répond "erreur" (cas error du subscribe)
import { of, throwError } from 'rxjs';
// HttpErrorResponse = l'objet que reçoit le composant quand le back-end répond une erreur HTTP (400, 401…)
import { HttpErrorResponse } from '@angular/common/http';

import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';

// Tests du composant d'inscription (plan de tests : UF-10 et UF-17).
// Correction du test fourni : il utilisait { provide: UserService, useValue: UserMockService },
// c'est-à-dire la CLASSE UserMockService au lieu d'un objet ; la doublure n'était donc jamais utilisable.
describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  // Doublure de UserService : register() répond tout de suite (inscription acceptée)
  const userServiceMock = {
    register: jest.fn().mockReturnValue(of({}))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        provideRouter([])
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    // Le composant affiche alert('SUCCESS!!') : jsdom (le navigateur simulé de Jest) ne sait pas afficher
    // de boîte de dialogue, on remplace donc alert par une fonction vide
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // UF-10 : inscription réussie → appel du service puis redirection vers /login
  it('registers the agent and navigates to /login', () => {
    // GIVEN : formulaire rempli
    const agent = { firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'secret' };
    component.registerForm.setValue(agent);

    // WHEN
    component.onSubmit();

    // THEN
    expect(userServiceMock.register).toHaveBeenCalledWith(agent);
    expect(window.alert).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  // UF-17 (ajout, exercice d'entraînement) : inscription refusée par le back (login déjà utilisé)
  // → message d'erreur affiché, pas de redirection
  it('displays the server error message when registration fails', () => {
    // GIVEN : le back répondra une erreur 400 (une seule fois)
    // mockReturnValueOnce : la doublure renvoie cette erreur pour UN seul appel ;
    // les autres tests gardent la réponse "succès" programmée plus haut (of({}))
    // HttpErrorResponse est construite comme celle du vrai back : le texte est dans error.message
    userServiceMock.register.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: "login déjà utilisé" } }))
    );
    component.registerForm.setValue({ firstName: 'Agent', lastName: 'Demo', login: 'agent.demo', password: 'Demo1234!' });

    // WHEN
    component.onSubmit();
    fixture.detectChanges(); // met à jour l'affichage après la réponse

    // THEN : la variable du composant contient le message du back…
    expect(component.errorMessage).toBe("login déjà utilisé");
    // … le message est visible à l'écran (bloc @if (errorMessage) du HTML)…
    expect(fixture.nativeElement.textContent).toContain("login déjà utilisé");
    // … et l'agent n'est PAS redirigé : not.toHaveBeenCalled() = navigate n'a été appelé nulle part
    // (plus strict que not.toHaveBeenCalledWith(['/login']), qui n'exclut que /login)
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
