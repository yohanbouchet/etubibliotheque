package com.openclassrooms.etudiant.controller;

import com.openclassrooms.etudiant.dto.EtudiantDTO;
import com.openclassrooms.etudiant.service.EtudiantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Controller = la couche des entrées/sorties HTTP : il reçoit la requête, appelle le service, renvoie la réponse.
// Il ne contient aucune règle métier et ne manipule que des DTO (jamais l'entité Etudiant).
// @RequestMapping("/api/etudiants") : préfixe commun à toutes les routes de cette classe.
// Ces routes ne sont PAS dans les permitAll de SpringSecurityConfig : elles exigent d'être authentifié.
@RestController
@RequestMapping("/api/etudiants")
@RequiredArgsConstructor
public class EtudiantController {

    private final EtudiantService etudiantService;

    // POST /api/etudiants : ajouter un étudiant → 201 Created + l'étudiant créé (avec son id)
    // @Valid @RequestBody : le JSON remplit le DTO, puis ses règles (@NotBlank, @Email, @Past...) sont vérifiées
    @PostMapping
    public ResponseEntity<EtudiantDTO> create(@Valid @RequestBody EtudiantDTO etudiantDTO) {
        return new ResponseEntity<>(etudiantService.create(etudiantDTO), HttpStatus.CREATED);
    }

    // GET /api/etudiants : consulter la liste des étudiants → 200 OK
    @GetMapping
    public ResponseEntity<List<EtudiantDTO>> findAll() {
        return ResponseEntity.ok(etudiantService.findAll());
    }

    // GET /api/etudiants/{id} : consulter le détail d'un étudiant → 200 OK (404 s'il n'existe pas)
    // @PathVariable("id") : récupère le {id} de l'URL (ex. /api/etudiants/3 → id = 3)
    @GetMapping("/{id}")
    public ResponseEntity<EtudiantDTO> findById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(etudiantService.findById(id));
    }

    // PUT /api/etudiants/{id} : modifier un étudiant → 200 OK + l'étudiant modifié
    @PutMapping("/{id}")
    public ResponseEntity<EtudiantDTO> update(@PathVariable("id") Long id,
                                              @Valid @RequestBody EtudiantDTO etudiantDTO) {
        return ResponseEntity.ok(etudiantService.update(id, etudiantDTO));
    }

    // DELETE /api/etudiants/{id} : supprimer un étudiant → 204 No Content (succès, sans corps de réponse)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        etudiantService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
