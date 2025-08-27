package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.RegisterUserDto;
import com.branch.appointment.backend.entity.UserEntity;
import com.branch.appointment.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class AuthService {
  @Autowired
  private UserRepository userRepository;

  public void registerUser(RegisterUserDto userInfo) {
    log.info("User {}", userInfo);

    List<UserEntity> users = userRepository.findByUserName(userInfo.getUserName());

    if(users.size() > 1) {
      throw new RuntimeException("User already exists");
    }

    UserEntity user = new UserEntity();
    user.setUserName(userInfo.getUserName());
    user.setPassword(userInfo.getPassword());

    userRepository.save(user);
  }
}
