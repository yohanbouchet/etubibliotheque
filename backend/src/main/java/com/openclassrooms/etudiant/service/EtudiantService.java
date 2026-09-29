package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.EtudiantDTO;
import com.openclassrooms.etudiant.entities.Etudiant;
import com.openclassrooms.etudiant.mapper.EtudiantDtoMapper;
import com.openclassrooms.etudiant.repository.EtudiantRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.List;

// Service = la couche des traitements (règles métier), entre le controller et le repository.
// Même modèle que UserService : @Transactional (tout ou rien en base), @RequiredArgsConstructor (Lombok
// génère le constructeur qui reçoit le repository et le mapper, injectés par Spring), @Slf4j (logs).
// Le service reçoit et renvoie des DTO : la conversion avec l'entité se fait ici, grâce au mapper.
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class EtudiantService {
    private final EtudiantRepository etudiantRepository;
    private final EtudiantDtoMapper etudiantDtoMapper;

    // Ajouter un étudiant : refus si l'e-mail est déjà utilisé (400, comme le login en double dans register)
    public EtudiantDTO create(EtudiantDTO etudiantDTO) {
        Assert.notNull(etudiantDTO, "Student must not be null");
        log.info("Creating new student");
        if (etudiantRepository.existsByEmail(etudiantDTO.getEmail())) {
            throw new IllegalArgumentException("Student with email " + etudiantDTO.getEmail() + " already exists");
        }
        // DTO → entité, enregistrement (INSERT), puis entité enregistrée (avec son id) → DTO
        Etudiant saved = etudiantRepository.save(etudiantDtoMapper.toEntity(etudiantDTO));
        return etudiantDtoMapper.toDto(saved);
    }

    // Consulter la liste des étudiants
    public List<EtudiantDTO> findAll() {
        return etudiantDtoMapper.toDtoList(etudiantRepository.findAll());
    }

    // Consulter le détail d'un étudiant (404 s'il n'existe pas)
    public EtudiantDTO findById(Long id) {
        return etudiantDtoMapper.toDto(getEtudiantOrThrow(id));
    }

    // Modifier un étudiant : 404 s'il n'existe pas ; 400 si son nouvel e-mail appartient à un AUTRE étudiant
    public EtudiantDTO update(Long id, EtudiantDTO etudiantDTO) {
        Assert.notNull(etudiantDTO, "Student must not be null");
        Etudiant etudiant = getEtudiantOrThrow(id);
        if (etudiantRepository.existsByEmailAndIdNot(etudiantDTO.getEmail(), id)) {
            throw new IllegalArgumentException("Student with email " + etudiantDTO.getEmail() + " already exists");
        }
        // Recopie les nouvelles valeurs dans l'étudiant existant, puis enregistre (UPDATE)
        etudiantDtoMapper.updateEntity(etudiantDTO, etudiant);
        return etudiantDtoMapper.toDto(etudiantRepository.save(etudiant));
    }

    // Supprimer un étudiant (404 s'il n'existe pas)
    public void delete(Long id) {
        etudiantRepository.delete(getEtudiantOrThrow(id));
    }

    // Méthode interne réutilisée par findById, update et delete :
    // findById renvoie un Optional ("une boîte peut-être vide") ; orElseThrow lève l'exception si elle est vide.
    // EntityNotFoundException est transformée en réponse 404 par RestExceptionHandler.
    private Etudiant getEtudiantOrThrow(Long id) {
        return etudiantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student with id " + id + " not found"));
    }
}
