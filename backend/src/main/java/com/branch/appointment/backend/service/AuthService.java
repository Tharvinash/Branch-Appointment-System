package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.RegisterUserDto;
import com.branch.appointment.backend.entity.UserEntity;
import com.branch.appointment.backend.repository.UserRepository;
import com.branch.appointment.backend.utils.TokenGeneration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class AuthService {
  @Autowired
  private UserRepository userRepository;
  @Autowired
  private PasswordEncoder passwordEncoder;
  @Autowired
  private TokenGeneration tokenGeneration;

  public void registerUser(RegisterUserDto userInfo) {
    log.info("User {}", userInfo);

    UserEntity users = userRepository.findByUserName(userInfo.getUserName());

    if(users != null) {
      throw new RuntimeException("User already exists");
    }

    UserEntity user = new UserEntity();
    user.setUserName(userInfo.getUserName());
    // need to has it before storing it
    user.setPassword(passwordEncoder.encode(userInfo.getPassword()));

    userRepository.save(user);
  }

  public String loginUser (RegisterUserDto userInfo) {
    UserEntity user = userRepository.findByUserName(userInfo.getUserName());

    if(user == null) {
      throw new RuntimeException("Username or Password does not match");
    }

    if(!passwordEncoder.matches(userInfo.getPassword(), user.getPassword())) {
      throw new RuntimeException("Username or Password does not match");
    }

    return tokenGeneration.generateToken(user.getUserName());
  }
}
