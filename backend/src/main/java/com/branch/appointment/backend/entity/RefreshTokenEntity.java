package com.branch.appointment.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "BAS_Refresh_Tokens")
public class RefreshTokenEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Token_Id")
  private Long id;

  @Column(name = "Token", nullable = false, unique = true, length = 500)
  private String token;

  @ManyToOne
  @JoinColumn(name = "User_Id", nullable = false)
  private UserEntity user;

  @Column(name = "Expires_At", nullable = false)
  private LocalDateTime expiresAt;

  @Column(name = "Created_At", nullable = false)
  private LocalDateTime createdAt;
}

