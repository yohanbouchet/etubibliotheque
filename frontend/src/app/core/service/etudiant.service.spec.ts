import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EtudiantService } from './etudiant.service';
import { Etudiant } from '../models/Etudiant';

// Tests unitaires de EtudiantService (plan de tests : UF-05).
// Chaque test vérifie que la bonne méthode HTTP est envoyée sur la bonne URL, avec le bon corps.
describe('EtudiantService', () => {
  let service: EtudiantService;
  let httpMock: HttpTestingController;

  // Étudiant de test, au format du modèle Etudiant (= EtudiantDTO côté back-end)
  const etudiant: Etudiant = {
    id: 1,
    firstName: 'Marie',
    lastName: 'Curie',
    email: 'marie.curie@test.fr',
    birthDate: '2001-05-17',
    training: 'Master Physique'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(EtudiantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Aucune requête inattendue ne doit rester sans réponse
  afterEach(() => {
    httpMock.verify();
  });

  it('findAll sends GET /api/etudiants and returns the list', () => {
    let result: Etudiant[] | undefined;
    service.findAll().subscribe(res => result = res);

    const req = httpMock.expectOne('/api/etudiants');
    expect(req.request.method).toBe('GET');
    req.flush([etudiant]);
    expect(result).toEqual([etudiant]);
  });

  it('findById sends GET /api/etudiants/{id}', () => {
    let result: Etudiant | undefined;
    service.findById(1).subscribe(res => result = res);

    const req = httpMock.expectOne('/api/etudiants/1');
    expect(req.request.method).toBe('GET');
    req.flush(etudiant);
    expect(result).toEqual(etudiant);
  });

  it('create sends POST /api/etudiants with the student', () => {
    service.create(etudiant).subscribe();

    const req = httpMock.expectOne('/api/etudiants');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(etudiant);
    req.flush(etudiant);
  });

  it('update sends PUT /api/etudiants/{id} with the student', () => {
    service.update(1, etudiant).subscribe();

    const req = httpMock.expectOne('/api/etudiants/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(etudiant);
    req.flush(etudiant);
  });

  it('delete sends DELETE /api/etudiants/{id}', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/etudiants/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null); // 204 : pas de contenu
  });
});
