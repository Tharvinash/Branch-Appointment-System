package com.branch.appointment.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterResponse {
  private Long id;
  private String name;
  private String email;
  private String role;
  private String message;
}
