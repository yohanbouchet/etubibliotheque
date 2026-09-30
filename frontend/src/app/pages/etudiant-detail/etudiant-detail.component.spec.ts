import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { EtudiantDetailComponent } from './etudiant-detail.component';
import { EtudiantService } from '../../core/service/etudiant.service';
import { UserService } from '../../core/service/user.service';
import { Etudiant } from '../../core/models/Etudiant';

// Tests de l'écran "détail d'un étudiant" (plan de tests : UF-14).
// Le composant lit l'id dans l'URL (/etudiants/:id). Pour le tester dans des conditions réelles,
// RouterTestingHarness (outil de test fourni par Angular) "navigue" vers une vraie URL et affiche l'écran.
describe('EtudiantDetailComponent', () => {
  let harness: RouterTestingHarness;

  const etudiant: Etudiant = {
    id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie@test.fr',
    birthDate: '2001-05-17', training: 'Master Physique'
  };

  // Doublure : findById renvoie l'étudiant
  const etudiantServiceMock = {
    findById: jest.fn().mockReturnValue(of(etudiant))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: EtudiantService, useValue: etudiantServiceMock },
        { provide: UserService, useValue: { logout: jest.fn() } },
        // Même route que dans app.routes.ts (sans le guard, testé séparément)
        provideRouter([{ path: 'etudiants/:id', component: EtudiantDetailComponent }])
      ]
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // UF-14 : l'URL /etudiants/1 affiche les informations de l'étudiant n°1
  it('loads the student from the URL id and displays it', async () => {
    // WHEN : l'agent ouvre /etudiants/1
    const component = await harness.navigateByUrl('/etudiants/1', EtudiantDetailComponent);
    harness.detectChanges();

    // THEN : l'id "1" de l'URL a été lu et transmis au service (en nombre)…
    expect(etudiantServiceMock.findById).toHaveBeenCalledWith(1);
    expect(component.etudiant).toEqual(etudiant);
    // … et les informations sont affichées, la date au format français (pipe date)
    const text: string = harness.routeNativeElement!.textContent ?? '';
    expect(text).toContain('Marie');
    expect(text).toContain('marie@test.fr');
    expect(text).toContain('17/05/2001');
    expect(text).toContain('Master Physique');
  });
});
