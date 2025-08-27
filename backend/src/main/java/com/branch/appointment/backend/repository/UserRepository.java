package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

  List<UserEntity> findByUserName(String userName);
}
