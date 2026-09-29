package com.openclassrooms.etudiant.repository;

import com.openclassrooms.etudiant.entities.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Repository = la couche d'accès aux données (même modèle que UserRepository).
// En héritant de JpaRepository<Etudiant, Long> (entité gérée, type de son id), on obtient sans écrire de code :
// save (INSERT/UPDATE), findAll (SELECT *), findById (SELECT ... WHERE id = ?), deleteById (DELETE), existsById...
@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {

    // Spring génère le SQL à partir du NOM de la méthode (comme findByLogin dans UserRepository) :
    // "existe-t-il un étudiant avec cet e-mail ?" → utilisé à la création pour garantir l'unicité
    boolean existsByEmail(String email);

    // "existe-t-il un AUTRE étudiant (id différent) avec cet e-mail ?" → utilisé à la modification :
    // l'étudiant modifié peut garder son propre e-mail, mais pas prendre celui d'un autre
    boolean existsByEmailAndIdNot(String email, Long id);
}
