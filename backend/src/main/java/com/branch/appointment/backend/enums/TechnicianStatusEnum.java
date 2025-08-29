package com.branch.appointment.backend.enums;

import lombok.Getter;

@Getter
public enum TechnicianStatusEnum {
  ON_LEAVE("On Leave"),
  ON_TRAINING("On Training"),
  ON_MEDICAL_LEAVE("On Medical Leave"),
  AVAILABLE("Available");

  private final String displayName;

  TechnicianStatusEnum(String displayName) {
    this.displayName = displayName;
  }
}
