import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';

// Tests du composant d'inscription (plan de tests : UF-10).
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
});
