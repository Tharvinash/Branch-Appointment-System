package com.branch.appointment.backend.dto;

import com.branch.appointment.backend.enums.TechnicianStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TechnicianDto {
  private Long id;
  private String name;
  private TechnicianStatusEnum status;
  private ReasonDto reason;
  private List<BayNameDto> jobSkills;
}
