package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.EtudiantDTO;
import com.openclassrooms.etudiant.entities.Etudiant;
import com.openclassrooms.etudiant.mapper.EtudiantDtoMapper;
import com.openclassrooms.etudiant.repository.EtudiantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Tests unitaires de EtudiantService (plan de tests : UB-04 à UB-08).
// MockitoExtension (plutôt que SpringExtension, cf. analyse des tests fournis) : Spring n'est pas démarré,
// Mockito crée les doublures et signale les programmations inutiles.
@ExtendWith(MockitoExtension.class)
public class EtudiantServiceTest {

    private static final Long ID = 1L;
    private static final String FIRST_NAME = "Marie";
    private static final String LAST_NAME = "Curie";
    private static final String EMAIL = "marie.curie@test.fr";
    private static final LocalDate BIRTH_DATE = LocalDate.of(2001, 5, 17);
    private static final String TRAINING = "Master Physique";

    // @Mock : doublure du repository → aucune base de données, on programme ses réponses avec when(...)
    @Mock
    private EtudiantRepository etudiantRepository;

    // @Spy : le VRAI mapper (conversion DTO ⇄ entité, sans effet de bord), "espionné" pour pouvoir
    // être injecté dans le service par @InjectMocks. Mappers.getMapper crée l'implémentation générée par MapStruct.
    @Spy
    private EtudiantDtoMapper etudiantDtoMapper = Mappers.getMapper(EtudiantDtoMapper.class);

    // @InjectMocks : le VRAI service testé, construit avec la doublure et le mapper ci-dessus
    @InjectMocks
    private EtudiantService etudiantService;

    // UB-04 : la liste contient tous les étudiants renvoyés par le repository
    @Test
    public void findAllReturnsAllStudents() {
        // GIVEN : le repository contient 2 étudiants
        when(etudiantRepository.findAll()).thenReturn(List.of(buildEtudiant(1L, "a@test.fr"), buildEtudiant(2L, "b@test.fr")));

        // WHEN
        List<EtudiantDTO> result = etudiantService.findAll();

        // THEN : 2 DTO, avec les bons e-mails
        assertThat(result).hasSize(2);
        assertThat(result).extracting(EtudiantDTO::getEmail).containsExactly("a@test.fr", "b@test.fr");
    }

    // UB-05 : le détail renvoie l'étudiant demandé, converti en DTO
    @Test
    public void findByIdReturnsStudent() {
        // GIVEN
        when(etudiantRepository.findById(ID)).thenReturn(Optional.of(buildEtudiant(ID, EMAIL)));

        // WHEN
        EtudiantDTO result = etudiantService.findById(ID);

        // THEN : tous les champs sont recopiés dans le DTO
        assertThat(result.getId()).isEqualTo(ID);
        assertThat(result.getFirstName()).isEqualTo(FIRST_NAME);
        assertThat(result.getLastName()).isEqualTo(LAST_NAME);
        assertThat(result.getEmail()).isEqualTo(EMAIL);
        assertThat(result.getBirthDate()).isEqualTo(BIRTH_DATE);
        assertThat(result.getTraining()).isEqualTo(TRAINING);
    }

    // UB-06 : la création enregistre l'étudiant et renvoie son id
    @Test
    public void createSavesStudentAndReturnsItWithId() {
        // GIVEN : l'e-mail n'est pas encore utilisé ; save() simule MySQL en attribuant l'id 1
        when(etudiantRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(invocation -> {
            Etudiant saved = invocation.getArgument(0);
            saved.setId(ID);
            return saved;
        });

        // WHEN
        EtudiantDTO result = etudiantService.create(buildDto(TRAINING));

        // THEN : l'entité transmise au repository contient les données du DTO…
        ArgumentCaptor<Etudiant> captor = ArgumentCaptor.forClass(Etudiant.class);
        verify(etudiantRepository).save(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo(EMAIL);
        assertThat(captor.getValue().getTraining()).isEqualTo(TRAINING);
        // … et le DTO renvoyé porte l'id attribué
        assertThat(result.getId()).isEqualTo(ID);
    }

    // UB-07 : la modification enregistre les nouvelles valeurs
    @Test
    public void updateSavesNewValues() {
        // GIVEN : l'étudiant existe ; son e-mail n'appartient à aucun autre étudiant ; save() renvoie ce qu'il reçoit
        when(etudiantRepository.findById(ID)).thenReturn(Optional.of(buildEtudiant(ID, EMAIL)));
        when(etudiantRepository.existsByEmailAndIdNot(EMAIL, ID)).thenReturn(false);
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN : la formation change
        EtudiantDTO result = etudiantService.update(ID, buildDto("Doctorat Chimie"));

        // THEN : la nouvelle formation est enregistrée (même id) et renvoyée
        ArgumentCaptor<Etudiant> captor = ArgumentCaptor.forClass(Etudiant.class);
        verify(etudiantRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(ID);
        assertThat(captor.getValue().getTraining()).isEqualTo("Doctorat Chimie");
        assertThat(result.getTraining()).isEqualTo("Doctorat Chimie");
    }

    // UB-08 : la suppression demande au repository de supprimer l'étudiant trouvé
    @Test
    public void deleteRemovesStudent() {
        // GIVEN
        Etudiant existing = buildEtudiant(ID, EMAIL);
        when(etudiantRepository.findById(ID)).thenReturn(Optional.of(existing));

        // WHEN
        etudiantService.delete(ID);

        // THEN : verify() contrôle que delete() a bien été appelé avec cet étudiant
        verify(etudiantRepository).delete(existing);
    }

    // Méthodes utilitaires : fabriquent les données de test (évite de répéter le code dans chaque test)
    private Etudiant buildEtudiant(Long id, String email) {
        Etudiant etudiant = new Etudiant();
        etudiant.setId(id);
        etudiant.setFirstName(FIRST_NAME);
        etudiant.setLastName(LAST_NAME);
        etudiant.setEmail(email);
        etudiant.setBirthDate(BIRTH_DATE);
        etudiant.setTraining(TRAINING);
        return etudiant;
    }

    private EtudiantDTO buildDto(String training) {
        EtudiantDTO dto = new EtudiantDTO();
        dto.setFirstName(FIRST_NAME);
        dto.setLastName(LAST_NAME);
        dto.setEmail(EMAIL);
        dto.setBirthDate(BIRTH_DATE);
        dto.setTraining(training);
        return dto;
    }
}
