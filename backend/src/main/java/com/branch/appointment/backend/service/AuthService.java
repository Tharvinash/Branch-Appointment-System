package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.LoginResponse;
import com.branch.appointment.backend.dto.RegisterResponse;
import com.branch.appointment.backend.dto.RegisterUserDto;
import com.branch.appointment.backend.entity.UserEntity;
import com.branch.appointment.backend.repository.UserRepository;
import com.branch.appointment.backend.utils.TokenGeneration;
import com.branch.appointment.backend.enums.UserRoleEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private TokenGeneration tokenGeneration;

  public RegisterResponse registerUser(RegisterUserDto userInfo) {
    log.info("Register request for user: {}", userInfo.getEmail());

    UserEntity existingUser = userRepository.findByEmail(userInfo.getEmail());
    if (existingUser != null) {
      throw new RuntimeException("User already exists");
    }

    UserEntity user = new UserEntity();
    user.setName(userInfo.getName());
    user.setEmail(userInfo.getEmail());
    user.setPassword(passwordEncoder.encode(userInfo.getPassword()));
    user.setRole(UserRoleEnum.fromValue(userInfo.getRole()));

    userRepository.save(user);

    return new RegisterResponse(
        user.getUserId(),
        user.getName(),
        user.getEmail(),
        user.getRole().name(),
        "Successfully Registered"
    );
  }



  public LoginResponse loginUser(RegisterUserDto userInfo) {
    log.info("Login attempt for user: {}", userInfo.getEmail());

    UserEntity user = userRepository.findByEmail(userInfo.getEmail());
    if (user == null || !passwordEncoder.matches(userInfo.getPassword(), user.getPassword())) {
      throw new RuntimeException("Username or Password does not match");
    }

    String token = tokenGeneration.generateToken(user);
    return new LoginResponse(
        token,
        user.getUserId(),
        user.getName(),
        user.getEmail(),
        user.getRole().name() // assuming enum
    );

  }
}
