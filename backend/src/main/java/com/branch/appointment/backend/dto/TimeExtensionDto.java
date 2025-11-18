package com.branch.appointment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimeExtensionDto {
  private Long id;
  private Long bookingId;
  private Long bayId;
  private LocalTime previousEndTime;
  private LocalTime newEndTime;
  private LocalDateTime extendedAt;
  private String extendedBy;
  private String reason;
}

