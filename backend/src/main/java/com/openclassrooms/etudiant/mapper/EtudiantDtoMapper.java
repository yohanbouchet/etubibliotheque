package com.openclassrooms.etudiant.mapper;

import com.openclassrooms.etudiant.dto.EtudiantDTO;
import com.openclassrooms.etudiant.entities.Etudiant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

// Mapper = convertisseur entre le DTO (échangé avec le front) et l'entité (stockée en base).
// On écrit seulement l'interface : MapStruct génère le code de conversion à la compilation
// (la classe EtudiantDtoMapperImpl, comme UserDtoMapperImpl vue dans le débogueur à l'étape 2).
// componentModel = "spring" : le mapper est injectable dans le service ;
// ReportingPolicy.ERROR : la compilation échoue si un champ est oublié (sécurité, comme UserDtoMapper).
@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface EtudiantDtoMapper {

    // DTO → entité (création). L'id et les dates sont gérés par la base, pas par le client.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Etudiant toEntity(EtudiantDTO etudiantDTO);

    // Entité → DTO (réponse de l'API). Les dates techniques ne sont pas exposées.
    EtudiantDTO toDto(Etudiant etudiant);

    // Liste d'entités → liste de DTO (pour GET /api/etudiants)
    List<EtudiantDTO> toDtoList(List<Etudiant> etudiants);

    // Modification : recopie les champs du DTO DANS l'entité existante (@MappingTarget),
    // sans toucher à son id ni à sa date de création.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(EtudiantDTO etudiantDTO, @MappingTarget Etudiant etudiant);
}
