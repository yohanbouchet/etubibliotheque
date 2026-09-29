package com.openclassrooms.etudiant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Data;

import java.time.LocalDate;

// DTO = l'objet échangé en JSON entre le front-end et l'API /api/etudiants.
// L'entité Etudiant ne sort jamais du back-end : le controller ne manipule que ce DTO (consigne de l'énoncé).
// Les règles ci-dessous sont vérifiées par @Valid dans le controller, AVANT d'appeler le service :
// si une règle n'est pas respectée, Spring répond directement 400 Bad Request.
@Data
public class EtudiantDTO {
    // Renvoyé par l'API (liste, détail) ; ignoré à la création (c'est MySQL qui attribue l'id)
    private Long id;

    // @NotBlank : ni null, ni vide, ni composé uniquement d'espaces (comme dans RegisterDTO)
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    // @Email : le texte doit avoir le format d'une adresse e-mail (xxx@yyy)
    @NotBlank
    @Email
    private String email;

    // @NotNull (et non @NotBlank, réservé au texte) ; @Past : la date doit être dans le passé.
    // En JSON, la date s'écrit au format "AAAA-MM-JJ", par exemple "2001-05-17"
    @NotNull
    @Past
    private LocalDate birthDate;

    // Formation ou diplôme suivi
    @NotBlank
    private String training;
}
