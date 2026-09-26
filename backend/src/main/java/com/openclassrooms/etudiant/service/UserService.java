package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(User user) {
        Assert.notNull(user, "User must not be null");
        log.info("Registering new user");

        Optional<User> optionalUser = userRepository.findByLogin(user.getLogin());
        if (optionalUser.isPresent()) {
            throw new IllegalArgumentException("User with login " + user.getLogin() + " already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public String login(String login, String password) {
        Assert.notNull(login, "Login must not be null");
        Assert.notNull(password, "Password must not be null");
        Optional<User> user = userRepository.findByLogin(login);
        // Correction : on compare le mot de passe saisi (en clair) avec le hash BCrypt stocké en base,
        // et non le mot de passe saisi avec lui-même (matches renvoyait toujours false).
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            // Correction : l'entité User implémente déjà UserDetails, on la transmet directement à JwtService.
            // L'ancien code reconstruisait un UserDetails sans mot de passe : Spring le refusait
            // ("Cannot pass null or empty values to constructor").
            return jwtService.generateToken(user.get());
        } else {
            throw new IllegalArgumentException("Invalid credentials");
        }
    }


}
