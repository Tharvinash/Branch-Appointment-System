package com.branch.appointment.backend.dto;

import com.branch.appointment.backend.enums.BayStatusEnum;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class BayDto {
  private Long id;
  private BayNameDto name;
  private String number;
  private BayStatusEnum status;
  private TechnicianDto technician;
}
