package com.branch.appointment.backend.entity;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.enums.BookingStatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "BAS_Booking_Processes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingProcessEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Process_Id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "Booking_Id")
  private BookingEntity booking;

  @Column(name = "From_Status")
  private String fromStatus;

  @Column(name = "To_Status")
  private String toStatus;

  @ManyToOne
  @JoinColumn(name = "From_Process")
  private BayEntity fromProcess;

  @ManyToOne
  @JoinColumn(name = "To_Process")
  private BayEntity toProcess;

  @Column(name = "Changed_At")
  private LocalDateTime changedAt;

  @Column(name = "Job_Start_Time")
  private LocalTime jobStartTime;

  @Column(name = "Job_End_Time")
  private LocalTime jobEndTime;
}

