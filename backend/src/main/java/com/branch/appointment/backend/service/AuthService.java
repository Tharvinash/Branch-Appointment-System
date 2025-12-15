package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.LoginResponse;
import com.branch.appointment.backend.dto.LoginUserDto;
import com.branch.appointment.backend.dto.RegisterResponse;
import com.branch.appointment.backend.dto.RegisterUserDto;
import com.branch.appointment.backend.entity.ServiceAdvisorEntity;
import com.branch.appointment.backend.entity.TechnicianEntity;
import com.branch.appointment.backend.entity.UserEntity;
import com.branch.appointment.backend.enums.ServiceAdvisorStatusEnum;
import com.branch.appointment.backend.enums.TechnicianStatusEnum;
import com.branch.appointment.backend.entity.RefreshTokenEntity;
import com.branch.appointment.backend.repository.RefreshTokenRepository;
import com.branch.appointment.backend.repository.ServiceAdvisorRepository;
import com.branch.appointment.backend.repository.TechnicianRepository;
import com.branch.appointment.backend.repository.UserRepository;
import com.branch.appointment.backend.utils.TokenGeneration;
import com.branch.appointment.backend.enums.UserRoleEnum;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Slf4j
@Service
@AllArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final TechnicianRepository technicianRepository;
  private final ServiceAdvisorRepository serviceAdvisorRepository;
  private final PasswordEncoder passwordEncoder;
  private final RefreshTokenRepository refreshTokenRepository;
  @Autowired
  private TokenGeneration tokenGeneration;

  private static final int REFRESH_TOKEN_EXPIRATION_DAYS = 30;
  private static final SecureRandom secureRandom = new SecureRandom();

  public RegisterResponse registerUser(RegisterUserDto userInfo) {
    log.info("Register request for user: {}", userInfo.getEmail());

    UserEntity existingUser = userRepository.findByEmail(userInfo.getEmail());
    if (existingUser != null) {
      throw new RuntimeException("User already exists");
    }

    // Create User
    UserEntity user = new UserEntity();
    user.setName(userInfo.getName());
    user.setEmail(userInfo.getEmail());
    user.setPassword(passwordEncoder.encode(userInfo.getPassword()));
    user.setRole(UserRoleEnum.fromValue(userInfo.getRole()));

    userRepository.save(user);

    // Extra Logic: Create Technician / Service Advisor entry if role matches
    if (user.getRole() == UserRoleEnum.TECHNICIAN) {
      TechnicianEntity technician = new TechnicianEntity();
      technician.setName(user.getName());
      technician.setStatus(TechnicianStatusEnum.AVAILABLE);
      technicianRepository.save(technician);
    }

    if (user.getRole() == UserRoleEnum.SERVICE_ADVISOR) {
      ServiceAdvisorEntity advisor = new ServiceAdvisorEntity();
      advisor.setName(user.getName());
      advisor.setStatus(ServiceAdvisorStatusEnum.AVAILABLE); // or ACTIVE if you prefer
      serviceAdvisorRepository.save(advisor);
    }

    return new RegisterResponse(
        user.getUserId(),
        user.getName(),
        user.getEmail(),
        user.getRole().name(),
        "Successfully Registered"
    );
  }

  @Transactional
  public LoginResponse loginUser(LoginUserDto userInfo) {
    log.info("Login attempt for user: {}", userInfo.getEmail());

    UserEntity user = userRepository.findByEmail(userInfo.getEmail());
    if (user == null || !passwordEncoder.matches(userInfo.getPassword(), user.getPassword())) {
      throw new RuntimeException("Username or Password does not match");
    }

    // Generate access token
    String accessToken = tokenGeneration.generateToken(user);

    // Invalidate old refresh tokens for this user (one token per user)
    refreshTokenRepository.deleteByUser(user);

    // Generate and save new refresh token
    String refreshToken = generateRefreshToken();
    RefreshTokenEntity refreshTokenEntity = new RefreshTokenEntity();
    refreshTokenEntity.setToken(refreshToken);
    refreshTokenEntity.setUser(user);
    refreshTokenEntity.setCreatedAt(LocalDateTime.now());
    refreshTokenEntity.setExpiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_EXPIRATION_DAYS));
    refreshTokenRepository.save(refreshTokenEntity);

    return new LoginResponse(
        accessToken,
        refreshToken,
        user.getUserId(),
        user.getName(),
        user.getEmail(),
        user.getRole().name()
    );
  }

  @Transactional
  public String refreshAccessToken(String refreshToken) {
    RefreshTokenEntity tokenEntity = refreshTokenRepository.findByToken(refreshToken)
        .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

    // Check if token is expired
    if (tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
      refreshTokenRepository.delete(tokenEntity);
      throw new RuntimeException("Refresh token has expired");
    }

    // Generate new access token
    UserEntity user = tokenEntity.getUser();
    return tokenGeneration.generateToken(user);
  }

  @Transactional
  public void logout(String refreshToken) {
    refreshTokenRepository.findByToken(refreshToken)
        .ifPresent(refreshTokenRepository::delete);
  }

  private String generateRefreshToken() {
    byte[] randomBytes = new byte[32];
    secureRandom.nextBytes(randomBytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
  }
}
