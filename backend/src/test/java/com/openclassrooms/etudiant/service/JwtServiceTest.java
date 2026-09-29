package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

// Tests unitaires de JwtService (plan de tests : UB-01 à UB-03).
// JwtService n'a aucune dépendance (ni base de données, ni autre service) : pas besoin de Mockito,
// on crée simplement l'objet avec "new" et on appelle ses méthodes.
public class JwtServiceTest {

    // Clé de test encodée en Base64 (41 octets une fois décodée ; le minimum exigé pour signer en HS256 est 32 octets = 256 bits).
    // Elle ne sert qu'aux tests : elle n'a rien à voir avec la clé de l'application.
    private static final String TEST_SECRET = "dGVzdC1zZWNyZXQtcG91ci1sZXMtdGVzdHMtand0LTEyMzQ1Njc4OTA=";
    private static final long ONE_HOUR = 3600000;
    private static final String LOGIN = "agent";

    private JwtService jwtService;
    private User user;

    // @BeforeEach : exécuté avant CHAQUE test → chaque test repart d'un service et d'un agent neufs
    @BeforeEach
    public void setUp() {
        jwtService = new JwtService();
        // En temps normal, Spring remplit "secret" et "expiration" depuis application.yml (@Value).
        // Ici Spring n'est pas démarré : ReflectionTestUtils remplit ces champs privés à la main.
        ReflectionTestUtils.setField(jwtService, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "expiration", ONE_HOUR);

        // L'entité User implémente UserDetails : c'est ce que reçoit JwtService dans l'application
        user = new User();
        user.setLogin(LOGIN);
    }

    // UB-01 : un token est généré pour l'agent
    @Test
    public void generateTokenReturnsJwtWithThreeParts() {
        // WHEN
        String token = jwtService.generateToken(user);

        // THEN : un JWT est une chaîne "en-tête.contenu.signature" (3 parties séparées par des points)
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    // UB-02 : le login peut être relu dans le token
    @Test
    public void extractUsernameReturnsLoginStoredInToken() {
        // GIVEN
        String token = jwtService.generateToken(user);

        // WHEN
        String username = jwtService.extractUsername(token);

        // THEN
        assertThat(username).isEqualTo(LOGIN);
    }

    // UB-03 : le token est valide pour l'agent à qui il a été délivré
    @Test
    public void isTokenValidReturnsTrueForTokenOwner() {
        // GIVEN
        String token = jwtService.generateToken(user);

        // WHEN
        boolean valid = jwtService.isTokenValid(token, user);

        // THEN
        assertThat(valid).isTrue();
    }
}
