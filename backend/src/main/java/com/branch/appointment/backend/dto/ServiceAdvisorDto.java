package com.branch.appointment.backend.dto;

import com.branch.appointment.backend.enums.ServiceAdvisorStatusEnum;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ServiceAdvisorDto {
  private Long id;
  private String name;
  private ServiceAdvisorStatusEnum status;
}
