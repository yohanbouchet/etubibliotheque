import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etudiant } from '../models/Etudiant';

// Service Angular qui appelle les 5 routes de l'API /api/etudiants (même principe que UserService).
// Chaque méthode renvoie un Observable ("réponse à venir") : c'est le composant qui s'y abonne (subscribe).
// Le token JWT n'apparaît pas ici : il est ajouté automatiquement à chaque requête par authInterceptor.
// providedIn: 'root' = une seule instance partagée par toute l'application
@Injectable({
  providedIn: 'root'
})
export class EtudiantService {
  // URL relative : le proxy Angular (proxy.conf.json) la transmet au back-end sur le port 8080
  private readonly apiUrl = '/api/etudiants';

  constructor(private httpClient: HttpClient) { }

  // Consulter la liste des étudiants : GET /api/etudiants
  findAll(): Observable<Etudiant[]> {
    return this.httpClient.get<Etudiant[]>(this.apiUrl);
  }

  // Consulter le détail d'un étudiant : GET /api/etudiants/{id}
  // `${...}` = insère la valeur de id dans le texte (ex. /api/etudiants/3)
  findById(id: number): Observable<Etudiant> {
    return this.httpClient.get<Etudiant>(`${this.apiUrl}/${id}`);
  }

  // Ajouter un étudiant : POST /api/etudiants (le back-end renvoie l'étudiant créé, avec son id)
  create(etudiant: Etudiant): Observable<Etudiant> {
    return this.httpClient.post<Etudiant>(this.apiUrl, etudiant);
  }

  // Modifier un étudiant : PUT /api/etudiants/{id}
  update(id: number, etudiant: Etudiant): Observable<Etudiant> {
    return this.httpClient.put<Etudiant>(`${this.apiUrl}/${id}`, etudiant);
  }

  // Supprimer un étudiant : DELETE /api/etudiants/{id} (réponse 204, sans contenu → void)
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
