import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantFormComponent } from './etudiant-form.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('EtudiantFormComponent', () => {
  let component: EtudiantFormComponent;
  let fixture: ComponentFixture<EtudiantFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantFormComponent],
      // Le composant a besoin de HttpClient (via EtudiantService) et du Router (ActivatedRoute, routerLink).
      // Les vrais tests viendront à l'exercice 2.
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
