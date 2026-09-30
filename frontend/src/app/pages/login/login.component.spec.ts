import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';

// Tests du composant de connexion (plan de tests : UF-09).
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  // Doublure de UserService (équivalent Jest d'un @Mock Mockito) :
  // jest.fn() crée une fausse fonction qui enregistre ses appels ;
  // mockReturnValue programme sa réponse : ici un Observable qui renvoie tout de suite un token (of(...))
  const userServiceMock = {
    login: jest.fn().mockReturnValue(of({ token: 'abc' }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        // Quand le composant demande UserService, Angular lui donne la doublure
        { provide: UserService, useValue: userServiceMock },
        provideRouter([])
      ]
    })
    .compileComponents();

    // On "espionne" router.navigate pour vérifier la redirection sans changer réellement de page
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // exécute ngOnInit et affiche le HTML
  });

  // Remet à zéro les compteurs d'appels des doublures entre deux tests
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // UF-09 : connexion réussie → appel du service, état succès, redirection vers /etudiants
  it('logs in and navigates to /etudiants on success', () => {
    // GIVEN : l'agent remplit le formulaire
    component.loginForm.setValue({ login: 'jdoe', password: 'secret' });

    // WHEN : clic sur "Se connecter"
    component.onSubmit();
    fixture.detectChanges(); // met à jour l'affichage après la réponse

    // THEN : le service a reçu les identifiants (au format LoginRequest)…
    expect(userServiceMock.login).toHaveBeenCalledWith({ login: 'jdoe', password: 'secret' });
    // … les états sont corrects et le message de succès est affiché…
    expect(component.loading).toBe(false);
    expect(component.success).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Connexion réussie');
    // … et l'agent est redirigé vers la liste des étudiants
    expect(router.navigate).toHaveBeenCalledWith(['/etudiants']);
  });
});
