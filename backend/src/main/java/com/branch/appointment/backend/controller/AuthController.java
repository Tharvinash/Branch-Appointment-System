package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.LoginResponse;
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
  public ResponseEntity<String> registerUser(@RequestBody RegisterUserDto userInfo) {
    authService.registerUser(userInfo);

    return ResponseEntity.status(HttpStatus.OK).body("Successfully Registered");
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> loginUser(@RequestBody RegisterUserDto userInfo) {
    String token = authService.loginUser(userInfo);

    LoginResponse lr = new LoginResponse(token);
    return ResponseEntity.status(HttpStatus.OK).body(lr);
  }

}
