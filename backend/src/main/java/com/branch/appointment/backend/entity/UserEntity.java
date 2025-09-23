package com.branch.appointment.backend.entity;

import com.branch.appointment.backend.enums.UserRoleEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name= "BAS_Users")
public class UserEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "User_Id")
  private Long userId;

  @Column(name = "Name", nullable = false)
  private String name;

  @Column(name = "Email", nullable = false, unique = true)
  private String email;

  @Column(name = "Password", nullable = false)
  private String password;

  @Enumerated(EnumType.ORDINAL)  // saves 0,1,2 instead of string
  @Column(name = "Role", nullable = false)
  private UserRoleEnum role;
}

