package com.branch.appointment.backend.enums;

public enum UserRoleEnum {
  ADMIN(0),
  TECHNICIAN(1),
  SERVICE_ADVISOR(2);

  private final int value;

  UserRoleEnum(int value) {
    this.value = value;
  }

  public int getValue() {
    return value;
  }

  public static UserRoleEnum fromValue(int value) {
    for (UserRoleEnum role : UserRoleEnum.values()) {
      if (role.getValue() == value) {
        return role;
      }
    }
    throw new IllegalArgumentException("Invalid role value: " + value);
  }
}
