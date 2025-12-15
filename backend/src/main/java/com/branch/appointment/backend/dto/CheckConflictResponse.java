package com.branch.appointment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CheckConflictResponse {
  private boolean hasConflict;
  private String message;
}

