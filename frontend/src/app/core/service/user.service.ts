import { Injectable } from '@angular/core';
import { Register } from '../models/Register';
import { LoginRequest } from '../models/LoginRequest';
import { LoginResponse } from '../models/LoginResponse';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient: HttpClient) { }

  register(user: Register): Observable<Object> {
    return this.httpClient.post('/api/register', user);
  }

  // Appelle POST /api/login avec le login et le mot de passe, et reçoit {"token": "..."}
  // Renvoie un Observable = une "réponse à venir" : c'est le composant qui s'y abonne (subscribe).
  // L'URL commence par /api : le proxy Angular (proxy.conf.json) la transmet au back-end sur le port 8080.
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // post<LoginResponse> indique à TypeScript la forme de la réponse attendue (le modèle LoginResponse)
    return this.httpClient.post<LoginResponse>('/api/login', credentials).pipe(
      // tap() = agir "au passage" sur la réponse sans la modifier (comme un "tee" dans un pipe shell).
      // En cas de succès, le token est conservé dans sessionStorage (effacé à la fermeture de l'onglet).
      // C'est le service (et non le composant) qui s'en charge : respect des couches.
      tap(response => sessionStorage.setItem('token', response.token))
    );
  }
}
