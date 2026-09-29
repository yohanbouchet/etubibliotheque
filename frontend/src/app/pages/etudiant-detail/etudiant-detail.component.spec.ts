import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantDetailComponent } from './etudiant-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('EtudiantDetailComponent', () => {
  let component: EtudiantDetailComponent;
  let fixture: ComponentFixture<EtudiantDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantDetailComponent],
      // Le composant a besoin de HttpClient (via EtudiantService) et du Router (ActivatedRoute, routerLink).
      // Les vrais tests viendront à l'exercice 2.
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
