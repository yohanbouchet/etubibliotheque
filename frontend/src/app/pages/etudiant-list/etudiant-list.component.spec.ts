import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantListComponent } from './etudiant-list.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('EtudiantListComponent', () => {
  let component: EtudiantListComponent;
  let fixture: ComponentFixture<EtudiantListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantListComponent],
      // Le composant a besoin de HttpClient (via EtudiantService) et du Router (liens routerLink).
      // Les vrais tests viendront à l'exercice 2.
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
