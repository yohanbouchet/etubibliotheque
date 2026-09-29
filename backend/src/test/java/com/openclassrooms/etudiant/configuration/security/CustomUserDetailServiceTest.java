package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

// Test unitaire de CustomUserDetailService (plan de tests : UB-10).
// Ce service est utilisé par le filtre JWT pour retrouver l'agent correspondant au login lu dans le token.
@ExtendWith(MockitoExtension.class)
public class CustomUserDetailServiceTest {

    private static final String LOGIN = "agent";

    // Doublure du repository : aucune base de données
    @Mock
    private UserRepository userRepository;

    // Le vrai service testé
    @InjectMocks
    private CustomUserDetailService customUserDetailService;

    // UB-10 : l'agent est retrouvé à partir de son login
    @Test
    public void loadUserByUsernameReturnsUserFoundByLogin() {
        // GIVEN : le repository trouve l'agent "agent"
        User user = new User();
        user.setLogin(LOGIN);
        when(userRepository.findByLogin(LOGIN)).thenReturn(Optional.of(user));

        // WHEN
        UserDetails result = customUserDetailService.loadUserByUsername(LOGIN);

        // THEN : c'est bien cet agent qui est renvoyé (getUsername() renvoie le login)
        assertThat(result).isSameAs(user);
        assertThat(result.getUsername()).isEqualTo(LOGIN);
    }
}
