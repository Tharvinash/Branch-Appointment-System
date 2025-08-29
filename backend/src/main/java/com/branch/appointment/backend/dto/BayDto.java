package com.branch.appointment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BayDto {
  private Long id;
  private String bayName;
  private String bayNumber;
}
