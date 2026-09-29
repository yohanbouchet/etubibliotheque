package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
public class UserServiceTest {
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String LOGIN = "LOGIN";
    private static final String PASSWORD = "PASSWORD";
    // Ajout (UB-09) : hash stocké en base et token délivré, simulés par les doublures
    private static final String HASHED_PASSWORD = "$2a$10$hashDeTest";
    private static final String TOKEN = "TOKEN";
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    // Ajout (UB-09) : UserService dépend aussi de JwtService depuis l'étape 2
    @Mock
    private JwtService jwtService;
    @InjectMocks
    private UserService userService;

    @Test
    public void test_create_null_user_throws_IllegalArgumentException() {
        // GIVEN

        // THEN
        Assertions.assertThrows(IllegalArgumentException.class,
                () -> userService.register(null));
    }

    @Test
    public void test_create_already_exist_user_throws_IllegalArgumentException() {
        // GIVEN
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        when(passwordEncoder.encode(PASSWORD)).thenReturn(PASSWORD);
        when(userRepository.findByLogin(any())).thenReturn(Optional.of(user));

        // THEN
        Assertions.assertThrows(IllegalArgumentException.class,
                () -> userService.register(user));
    }

    @Test
    public void test_create_user() {
        // GIVEN
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        when(passwordEncoder.encode(PASSWORD)).thenReturn(PASSWORD);
        when(userRepository.findByLogin(any())).thenReturn(Optional.empty());

        // WHEN
        userService.register(user);

        // THEN
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue()).isEqualTo(user);
    }

    // Ajout – plan de tests UB-09 : une connexion avec de bons identifiants renvoie un token.
    // Ce test aurait échoué avec le code de départ, qui comparait le mot de passe à lui-même
    // (matches(password, password)) : il protège la correction de l'étape 2 contre une régression.
    @Test
    public void test_login_with_valid_credentials_returns_token() {
        // GIVEN : l'agent existe en base avec un mot de passe haché ;
        // l'encodeur confirme que le mot de passe saisi correspond à CE hash ; JwtService délivre un token
        User user = new User();
        user.setLogin(LOGIN);
        user.setPassword(HASHED_PASSWORD);
        when(userRepository.findByLogin(LOGIN)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD, HASHED_PASSWORD)).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn(TOKEN);

        // WHEN
        String token = userService.login(LOGIN, PASSWORD);

        // THEN : le token renvoyé est celui délivré par JwtService pour cet agent
        assertThat(token).isEqualTo(TOKEN);
    }
}
