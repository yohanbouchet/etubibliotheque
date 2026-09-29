package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.EtudiantDTO;
import com.openclassrooms.etudiant.dto.LoginRequestDTO;
import com.openclassrooms.etudiant.entities.Etudiant;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.EtudiantRepository;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Tests d'intégration de l'API /api/etudiants (plan de tests : IB-02 à IB-07).
// Même configuration que UserControllerTest : toute l'application est démarrée (@SpringBootTest),
// les requêtes HTTP passent par MockMvc (avec les filtres de sécurité, dont le filtre JWT),
// et la base est un conteneur MySQL jetable (Testcontainers).
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class EtudiantControllerTest {

    private static final String URL = "/api/etudiants";
    private static final String AGENT_LOGIN = "agent";
    private static final String AGENT_PASSWORD = "password";
    private static final String EMAIL = "marie.curie@test.fr";

    @Container
    static MySQLContainer<?> mySQLContainer = new MySQLContainer<>("mysql:8.4");

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EtudiantRepository etudiantRepository;

    // En-tête "Authorization: Bearer <token>" obtenu par une vraie connexion avant chaque test
    private String bearerToken;

    // Branche l'application sur le conteneur MySQL de test (et non sur la base de développement)
    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> mySQLContainer.getJdbcUrl());
        registry.add("spring.datasource.username", () -> mySQLContainer.getUsername());
        registry.add("spring.datasource.password", () -> mySQLContainer.getPassword());
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }

    // Avant chaque test : un agent est inscrit puis connecté via POST /api/login, comme dans l'application,
    // pour obtenir un vrai token JWT (le filtre JWT est donc réellement testé à chaque requête)
    @BeforeEach
    public void setUp() throws Exception {
        User agent = new User();
        agent.setFirstName("Agent");
        agent.setLastName("Test");
        agent.setLogin(AGENT_LOGIN);
        agent.setPassword(AGENT_PASSWORD);
        userService.register(agent);

        LoginRequestDTO login = new LoginRequestDTO();
        login.setLogin(AGENT_LOGIN);
        login.setPassword(AGENT_PASSWORD);
        String response = mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andReturn().getResponse().getContentAsString();
        // readTree lit le JSON {"token": "..."} ; on garde la valeur du champ "token"
        bearerToken = "Bearer " + objectMapper.readTree(response).get("token").asText();
    }

    // Après chaque test : base vidée, pour que les tests restent indépendants
    @AfterEach
    public void tearDown() {
        etudiantRepository.deleteAll();
        userRepository.deleteAll();
    }

    // IB-02 (sécurité) : sans token, l'accès aux étudiants est refusé
    @Test
    public void findAllWithoutTokenReturnsUnauthorized() throws Exception {
        // WHEN : aucune en-tête Authorization ; THEN : 401
        mockMvc.perform(get(URL))
                .andExpect(status().isUnauthorized());
    }

    // IB-03 : avec un token, la liste contient les étudiants en base
    @Test
    public void findAllReturnsStudents() throws Exception {
        // GIVEN : 2 étudiants en base
        saveEtudiant("a@test.fr");
        saveEtudiant("b@test.fr");

        // WHEN / THEN : 200 et un tableau JSON de 2 éléments
        mockMvc.perform(get(URL).header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // IB-04 : le détail renvoie les informations de l'étudiant
    @Test
    public void findByIdReturnsStudent() throws Exception {
        // GIVEN
        Etudiant saved = saveEtudiant(EMAIL);

        // WHEN / THEN
        mockMvc.perform(get(URL + "/" + saved.getId()).header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Marie"))
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.birthDate").value("2001-05-17"));
    }

    // IB-05 : la création renvoie 201 et enregistre l'étudiant en base
    @Test
    public void createReturnsCreatedStudent() throws Exception {
        // WHEN : POST d'un JSON valide
        mockMvc.perform(post(URL).header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildDto("Master Physique"))))
                // THEN : 201, l'étudiant renvoyé a un id…
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.email").value(EMAIL));
        // … et il est bien présent en base
        assertThat(etudiantRepository.existsByEmail(EMAIL)).isTrue();
    }

    // IB-06 : la modification renvoie 200 et enregistre la nouvelle valeur en base
    @Test
    public void updateReturnsModifiedStudent() throws Exception {
        // GIVEN
        Etudiant saved = saveEtudiant(EMAIL);

        // WHEN : PUT avec une nouvelle formation
        mockMvc.perform(put(URL + "/" + saved.getId()).header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildDto("Doctorat Chimie"))))
                // THEN : 200 et la nouvelle formation dans la réponse…
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.training").value("Doctorat Chimie"));
        // … et en base
        assertThat(etudiantRepository.findById(saved.getId()).orElseThrow().getTraining()).isEqualTo("Doctorat Chimie");
    }

    // IB-07 : la suppression renvoie 204 et l'étudiant n'est plus en base
    @Test
    public void deleteRemovesStudent() throws Exception {
        // GIVEN
        Etudiant saved = saveEtudiant(EMAIL);

        // WHEN / THEN
        mockMvc.perform(delete(URL + "/" + saved.getId()).header("Authorization", bearerToken))
                .andExpect(status().isNoContent());
        assertThat(etudiantRepository.existsById(saved.getId())).isFalse();
    }

    // Méthodes utilitaires : fabriquent les données de test
    private Etudiant saveEtudiant(String email) {
        Etudiant etudiant = new Etudiant();
        etudiant.setFirstName("Marie");
        etudiant.setLastName("Curie");
        etudiant.setEmail(email);
        etudiant.setBirthDate(LocalDate.of(2001, 5, 17));
        etudiant.setTraining("Master Physique");
        return etudiantRepository.save(etudiant);
    }

    private EtudiantDTO buildDto(String training) {
        EtudiantDTO dto = new EtudiantDTO();
        dto.setFirstName("Marie");
        dto.setLastName("Curie");
        dto.setEmail(EMAIL);
        dto.setBirthDate(LocalDate.of(2001, 5, 17));
        dto.setTraining(training);
        return dto;
    }
}
