package com.branch.appointment.backend.dto;

import com.branch.appointment.backend.enums.TechnicianStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class TechnicianDto {
  private Long id;
  private String name;
  private TechnicianStatusEnum status;
}
