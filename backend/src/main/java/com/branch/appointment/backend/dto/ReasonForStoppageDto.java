package com.branch.appointment.backend.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ReasonForStoppageDto {
  private Long id;
  private String reasonName;
}
