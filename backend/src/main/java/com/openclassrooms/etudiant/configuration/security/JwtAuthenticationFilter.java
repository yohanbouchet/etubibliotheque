package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Filtre JWT : exécuté AVANT chaque requête, comme un contrôle de badge à l'entrée d'un bâtiment
// (ou un reverse proxy qui vérifie une authentification avant de transmettre à l'application).
// Il lit l'en-tête "Authorization: Bearer <token>", vérifie le token, puis indique à Spring Security
// "cette requête vient de l'agent X". Sans token valide, la requête continue SANS identité :
// les routes protégées (ex. /api/etudiants) répondent alors 401.
// OncePerRequestFilter : garantit une seule exécution par requête.
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailService userDetailService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        // Pas d'en-tête "Bearer ..." (ex. /api/login, /api/register) : on laisse passer sans rien faire
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        // On retire le préfixe "Bearer " (7 caractères) pour ne garder que le token
        String token = authHeader.substring(7);

        try {
            String login = jwtService.extractUsername(token);
            // Si personne n'est encore authentifié pour cette requête, on charge l'agent depuis la base
            if (login != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailService.loadUserByUsername(login);
                if (jwtService.isTokenValid(token, userDetails)) {
                    // On déclare l'agent comme authentifié pour la durée de CETTE requête (mode STATELESS)
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (JwtException | UsernameNotFoundException exception) {
            // Token modifié, expiré, ou agent supprimé : la requête reste non authentifiée (→ 401)
            log.warn("Invalid JWT token: {}", exception.getMessage());
        }
        // Dans tous les cas, on passe la main au filtre suivant (puis au controller si autorisé)
        filterChain.doFilter(request, response);
    }
}
