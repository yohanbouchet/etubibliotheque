package com.openclassrooms.etudiant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDTO {
    // Correction : login et mot de passe obligatoires (ni null, ni vides), comme dans RegisterDTO.
    // Ces règles sont vérifiées grâce à @Valid dans UserController.login.
    @NotBlank
    private String login;
    @NotBlank
    private String password;

}
