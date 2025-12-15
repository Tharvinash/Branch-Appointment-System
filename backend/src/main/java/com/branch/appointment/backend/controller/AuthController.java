package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.LoginResponse;
import com.branch.appointment.backend.dto.LoginUserDto;
import com.branch.appointment.backend.dto.LogoutRequest;
import com.branch.appointment.backend.dto.RefreshTokenRequest;
import com.branch.appointment.backend.dto.RefreshTokenResponse;
import com.branch.appointment.backend.dto.RegisterResponse;
import com.branch.appointment.backend.dto.RegisterUserDto;
import com.branch.appointment.backend.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/auth")
public class AuthController {

  private AuthService authService;


  @PostMapping("/register")
  public ResponseEntity<RegisterResponse> registerUser(@RequestBody RegisterUserDto userInfo) {
    RegisterResponse response = authService.registerUser(userInfo);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> loginUser(@RequestBody LoginUserDto userInfo) {
    LoginResponse response = authService.loginUser(userInfo);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/refresh")
  public ResponseEntity<RefreshTokenResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
    try {
      String newAccessToken = authService.refreshAccessToken(request.getRefreshToken());
      return ResponseEntity.ok(new RefreshTokenResponse(newAccessToken));
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) {
    authService.logout(request.getRefreshToken());
    return ResponseEntity.ok().build();
  }
}
