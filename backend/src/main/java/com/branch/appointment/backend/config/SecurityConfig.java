package com.branch.appointment.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFiler) throws Exception {
    http.csrf(csrf -> csrf.disable()) // Disable CSRF for API endpoints
        .authorizeHttpRequests(authz -> authz.requestMatchers("/auth/register", "/auth/login").permitAll() // Allow these endpoints
            .anyRequest().authenticated() // Protect other endpoints
        ).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS) // For REST API
        ).addFilterBefore(jwtFiler, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
