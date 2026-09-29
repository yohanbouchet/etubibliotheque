package com.openclassrooms.etudiant.service;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    // Clé secrète (encodée en Base64) qui signe les tokens, lue dans application.yml (jwt.secret)
    @Value("${jwt.secret}")
    private String secret;

    // Durée de validité d'un token en millisecondes, lue dans application.yml (jwt.expiration)
    @Value("${jwt.expiration}")
    private long expiration;

    // Délivre un token JWT signé pour l'utilisateur authentifié
    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userDetails.getUsername())               // à qui appartient le token : le login
                .issuedAt(now)                                    // date de création
                .expiration(new Date(now.getTime() + expiration)) // date d'expiration
                .signWith(getSigningKey())                        // signature avec la clé secrète (HMAC-SHA)
                .compact();                                       // assemblage en "en-tête.contenu.signature"
    }

    // Ajout (étape 4) : lit le login (le "subject") contenu dans un token reçu.
    // parseSignedClaims VÉRIFIE la signature avec la clé secrète et la date d'expiration :
    // si le token a été modifié ou a expiré, une exception (JwtException) est levée.
    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())   // clé utilisée pour contrôler la signature
                .build()
                .parseSignedClaims(token)      // décode + vérifie (signature, expiration)
                .getPayload()                  // le contenu : {"sub": ..., "iat": ..., "exp": ...}
                .getSubject();                 // le login
    }

    // Ajout (étape 4) : le token est valide s'il appartient bien à cet utilisateur
    // (la signature et l'expiration sont déjà contrôlées par extractUsername)
    public boolean isTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername());
    }

    // Transforme la clé Base64 de la configuration en clé cryptographique de signature
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

}
