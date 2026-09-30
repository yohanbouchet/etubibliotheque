import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { EtudiantListComponent } from './etudiant-list.component';
import { EtudiantService } from '../../core/service/etudiant.service';
import { UserService } from '../../core/service/user.service';
import { Etudiant } from '../../core/models/Etudiant';

// Tests de l'écran "liste des étudiants" (plan de tests : UF-11 à UF-13).
describe('EtudiantListComponent', () => {
  let component: EtudiantListComponent;
  let fixture: ComponentFixture<EtudiantListComponent>;
  let router: Router;

  // Deux étudiants de test
  const etudiants: Etudiant[] = [
    { id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie@test.fr', birthDate: '2001-05-17', training: 'Physique' },
    { id: 2, firstName: 'Pierre', lastName: 'Curie', email: 'pierre@test.fr', birthDate: '2000-03-02', training: 'Chimie' }
  ];

  // Doublures des services : findAll renvoie les 2 étudiants, delete répond "supprimé" (réponse vide)
  const etudiantServiceMock = {
    findAll: jest.fn().mockReturnValue(of(etudiants)),
    delete: jest.fn().mockReturnValue(of(undefined))
  };
  const userServiceMock = {
    logout: jest.fn()
  };

  // Nombre de lignes du tableau réellement affichées dans le HTML (les <tr> du <tbody>)
  const displayedRows = (): number => fixture.nativeElement.querySelectorAll('tbody tr').length;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantListComponent],
      providers: [
        { provide: EtudiantService, useValue: etudiantServiceMock },
        { provide: UserService, useValue: userServiceMock },
        provideRouter([])
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(EtudiantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit → loadEtudiants() → affichage du tableau
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // UF-11 : à l'affichage, la liste est chargée et le tableau contient une ligne par étudiant
  it('displays one row per student', () => {
    expect(etudiantServiceMock.findAll).toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(displayedRows()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('marie@test.fr');
  });

  // UF-12 : suppression confirmée → appel de delete() et disparition de la ligne
  it('deletes a student after confirmation', () => {
    // GIVEN : l'agent clique sur "OK" dans la boîte de confirmation
    // (confirm() est remplacée : elle renvoie true au lieu d'ouvrir une vraie fenêtre)
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // WHEN : clic sur "Supprimer" pour Marie (id 1)
    component.deleteEtudiant(etudiants[0]);
    fixture.detectChanges();

    // THEN : la suppression est demandée au service, et il ne reste qu'une ligne
    expect(window.confirm).toHaveBeenCalled();
    expect(etudiantServiceMock.delete).toHaveBeenCalledWith(1);
    expect(displayedRows()).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain('marie@test.fr');
  });

  // UF-13 : déconnexion → token effacé (logout) et retour à /login
  it('logs out and navigates to /login', () => {
    // WHEN : clic sur le bouton "Se déconnecter" du HTML
    const logoutButton: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn-secondary');
    logoutButton.click();

    // THEN
    expect(userServiceMock.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
