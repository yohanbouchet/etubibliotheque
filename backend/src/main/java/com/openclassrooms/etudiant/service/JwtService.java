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

    // Transforme la clé Base64 de la configuration en clé cryptographique de signature
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

}
