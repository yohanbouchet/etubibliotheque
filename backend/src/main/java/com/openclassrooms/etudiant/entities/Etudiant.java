package com.openclassrooms.etudiant.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Entité = une classe Java qui représente une table de la base de données (ici la table "etudiant").
// Hibernate crée/met à jour la table automatiquement au démarrage (ddl-auto: update dans application.yml).
// Même structure que l'entité User existante. Lombok (@Data...) génère getters, setters et constructeurs.
@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "etudiant")
public class Etudiant {
    // Clé primaire, auto-incrémentée par MySQL (comme pour User)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // nullable = false : la colonne est NOT NULL en base.
    // Spring convertit les noms en snake_case : la colonne réelle s'appellera first_name (comme dans la table user)
    @Column(name = "firstName", nullable = false)
    private String firstName;

    @Column(name = "lastName", nullable = false)
    private String lastName;

    // unique = true : deux étudiants ne peuvent pas avoir le même e-mail (contrainte UNIQUE en base,
    // comme le login de User). Le service le vérifie aussi avant d'enregistrer, pour renvoyer un message clair.
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    // LocalDate = une date sans heure (colonne de type DATE en MySQL)
    @Column(name = "birthDate", nullable = false)
    private LocalDate birthDate;

    // Formation ou diplôme suivi par l'étudiant
    @Column(name = "training", nullable = false)
    private String training;

    // Dates de création et de dernière modification, remplies automatiquement par Hibernate
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
