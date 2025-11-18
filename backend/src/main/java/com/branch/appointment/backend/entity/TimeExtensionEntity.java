package com.branch.appointment.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "BAS_Time_Extensions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimeExtensionEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Extension_Id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "Booking_Id", nullable = false)
  private BookingEntity booking;

  @ManyToOne
  @JoinColumn(name = "Bay_Id")
  private BayEntity bay;

  @Column(name = "Previous_End_Time", nullable = false)
  private LocalTime previousEndTime;

  @Column(name = "New_End_Time", nullable = false)
  private LocalTime newEndTime;

  @Column(name = "Extended_At", nullable = false)
  private LocalDateTime extendedAt;

  @Column(name = "Extended_By")
  private String extendedBy; // Could be user ID or username

  @Column(name = "Reason", length = 1000)
  private String reason; // Reason for extending the time
}

