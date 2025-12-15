package com.branch.appointment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CheckConflictRequest {
  private Long bayId;
  private LocalTime jobStartTime;
  private LocalTime jobEndTime;
  private Long excludeBookingId; // For updates, exclude current booking
}

