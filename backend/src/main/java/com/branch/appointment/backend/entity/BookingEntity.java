package com.branch.appointment.backend.entity;

import com.branch.appointment.backend.enums.BookingStatusEnum;
import com.branch.appointment.backend.enums.JobTypeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "BAS_Bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Booking_Id")
  private Long id;

  @Column(name = "Car_Reg_No")
  private String carRegNo;

  @Column(name = "Checkin_Date")
  private LocalDate checkinDate;

  @Column(name = "Promise_Date")
  private LocalDate promiseDate;

  @ManyToOne
  @JoinColumn(name = "Service_Advisor_Id")
  private ServiceAdvisorEntity serviceAdvisor;

  @ManyToOne
  @JoinColumn(name = "Bay_Id")
  private BayEntity bay;

  @Enumerated(EnumType.STRING)
  @Column(name = "Job_Type")
  private JobTypeEnum jobType; // LIGHT, MEDIUM, HEAVY

  @Enumerated(EnumType.STRING)
  @Column(name = "Status")
  private BookingStatusEnum status;

  @Column(name = "Job_Start_Time")
  private LocalTime jobStartTime;

  @Column(name = "Job_End_Time")
  private LocalTime jobEndTime;

  @Column(name = "Stoppage_Reason")
  private String stoppageReason;
}

