package com.branch.appointment.backend.dto;

import com.branch.appointment.backend.enums.BookingStatusEnum;
import com.branch.appointment.backend.enums.JobTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingDto {
  private Long id;
  private String carRegNo;
  private LocalDate checkinDate;
  private LocalDate promiseDate;
  private Long serviceAdvisorId;
  private Long bayId;
  private JobTypeEnum jobType;
  private BookingStatusEnum status;
  private LocalTime jobStartTime;
  private LocalTime jobEndTime;
}

