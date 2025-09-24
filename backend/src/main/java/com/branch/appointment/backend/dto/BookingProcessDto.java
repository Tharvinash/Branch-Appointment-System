package com.branch.appointment.backend.dto;

import com.branch.appointment.backend.enums.BookingStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingProcessDto {
  private Long id;
  private String fromStatus;
  private String toStatus;
  private BayDto fromProcess;
  private BayDto toProcess;
  private LocalDateTime changedAt;
  private LocalTime jobStartTime;
  private LocalTime jobEndTime;
}

