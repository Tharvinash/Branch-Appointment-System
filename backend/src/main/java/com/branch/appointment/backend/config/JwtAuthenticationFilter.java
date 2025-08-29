package com.branch.appointment.backend.config;

import com.branch.appointment.backend.utils.TokenGeneration;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  @Autowired
  private TokenGeneration tokenGeneration;

  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
    // 1. Extract authorization header
    String authHeader = request.getHeader("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer")) {
      filterChain.doFilter(request, response); //no token, let req pass through
      return;
    }

    String token = authHeader.substring(7);

    try {
      // 2. Parse JWT
      Claims claims = tokenGeneration.parseClaims(token);

      String username = claims.getSubject();

      // 3. If SecurityContext already has auth, skip
      if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        // buing user object
        UserDetails ud = User.builder().username(username).password("").authorities("ROLE_USER").build();
        UsernamePasswordAuthenticationToken upat = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());

        upat.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(upat);
      }

    } catch (Exception e) {
      System.out.println("Invalid JWT: " + e.getMessage());
    }


    filterChain.doFilter(request, response);
  }


}
