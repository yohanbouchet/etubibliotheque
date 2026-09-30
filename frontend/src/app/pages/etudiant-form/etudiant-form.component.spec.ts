import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { EtudiantFormComponent } from './etudiant-form.component';
import { EtudiantService } from '../../core/service/etudiant.service';
import { UserService } from '../../core/service/user.service';
import { Etudiant } from '../../core/models/Etudiant';

// Tests du formulaire étudiant (plan de tests : UF-15 et UF-16).
// Le même composant sert à l'ajout (/etudiants/new) et à la modification (/etudiants/:id/edit) :
// RouterTestingHarness ouvre l'une ou l'autre URL, comme le ferait l'agent.
describe('EtudiantFormComponent', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  const etudiant: Etudiant = {
    id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie@test.fr',
    birthDate: '2001-05-17', training: 'Master Physique'
  };

  // Valeurs saisies dans le formulaire (sans id : c'est le back-end qui l'attribue)
  const saisie = {
    firstName: 'Marie', lastName: 'Curie', email: 'marie@test.fr',
    birthDate: '2001-05-17', training: 'Master Physique'
  };

  // Doublures : findById pour le pré-remplissage, create / update répondent avec l'étudiant enregistré
  const etudiantServiceMock = {
    findById: jest.fn().mockReturnValue(of(etudiant)),
    create: jest.fn().mockReturnValue(of(etudiant)),
    update: jest.fn().mockReturnValue(of(etudiant))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: EtudiantService, useValue: etudiantServiceMock },
        { provide: UserService, useValue: { logout: jest.fn() } },
        // Mêmes routes que dans app.routes.ts (sans le guard, testé séparément)
        provideRouter([
          { path: 'etudiants/new', component: EtudiantFormComponent },
          { path: 'etudiants/:id/edit', component: EtudiantFormComponent }
        ])
      ]
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // UF-15 : mode ajout → create() avec la saisie, puis retour à la liste
  it('creates a student and navigates to the list', async () => {
    // GIVEN : l'agent ouvre /etudiants/new et remplit le formulaire
    const component = await harness.navigateByUrl('/etudiants/new', EtudiantFormComponent);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    expect(component.isEdit).toBe(false);
    component.etudiantForm.setValue(saisie);

    // WHEN : clic sur "Enregistrer"
    component.onSubmit();

    // THEN : création demandée au service, sans chargement préalable, puis retour à la liste
    expect(etudiantServiceMock.findById).not.toHaveBeenCalled();
    expect(etudiantServiceMock.create).toHaveBeenCalledWith(saisie);
    expect(router.navigate).toHaveBeenCalledWith(['/etudiants']);
  });

  // UF-16 : mode modification → formulaire pré-rempli, puis update(1, ...) et retour à la liste
  it('pre-fills the form, updates the student and navigates to the list', async () => {
    // GIVEN : l'agent ouvre /etudiants/1/edit
    const component = await harness.navigateByUrl('/etudiants/1/edit', EtudiantFormComponent);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    // THEN (pré-remplissage) : l'étudiant n°1 a été chargé et recopié dans le formulaire
    expect(component.isEdit).toBe(true);
    expect(etudiantServiceMock.findById).toHaveBeenCalledWith(1);
    expect(component.etudiantForm.value).toEqual(saisie);

    // WHEN : l'agent change la formation et enregistre
    component.etudiantForm.patchValue({ training: 'Doctorat Chimie' });
    component.onSubmit();

    // THEN : modification demandée pour l'id 1 avec la nouvelle formation, puis retour à la liste
    expect(etudiantServiceMock.update).toHaveBeenCalledWith(1, { ...saisie, training: 'Doctorat Chimie' });
    expect(router.navigate).toHaveBeenCalledWith(['/etudiants']);
  });
});
