package com.branch.appointment.backend.utils;

import com.branch.appointment.backend.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

@Component
public class TokenGeneration {

  @Value("${jwt.secret.key}")
  private String secretKey;

  @Value("${jwt.expiration}")
  private Long expiration;

  private Key key;

  @PostConstruct
  private void init() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    this.key = Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateToken(UserEntity user) {
    return Jwts.builder()
        .subject(user.getEmail()) // or userId if you prefer
        .claim("id", user.getUserId())
        .claim("role", user.getRole().name())
        .claim("name", user.getName())
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(key)
        .compact();
  }


  public Claims parseClaims(String token) {
    return Jwts.parser()
        .verifyWith((SecretKey) key)
        .build()
        .parseSignedClaims(token) // parseSignedClaims automatically check signature and expiry
        .getPayload();
  }

  public boolean isTokenValid(String token) {
    try {
      parseClaims(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }
}
