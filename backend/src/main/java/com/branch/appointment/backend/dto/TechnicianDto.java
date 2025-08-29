package com.branch.appointment.backend.dto;

import com.branch.appointment.backend.enums.TechnicianStatusEnum;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class TechnicianDto {
  private Long id;
  private String technicianName;
  private TechnicianStatusEnum status;
}
