package com.branch.appointment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterUserDto {
    private String name;
    private String email;
    private String password;
    private int role; // 0 = admin, 1 = technician, 2 = service advisor
}
