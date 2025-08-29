package com.branch.appointment.backend.dto;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class BlockTimeDto {
  private Long id;
  private String blockName;
  private long duration;
}
