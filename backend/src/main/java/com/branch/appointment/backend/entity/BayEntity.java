package com.branch.appointment.backend.entity;

import com.branch.appointment.backend.enums.BayStatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "BAS_Bays")
public class BayEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Bay_Id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "Bay_Name_Id", nullable = false)
  private BayNameEntity bayName;

  @Column(name = "Bay_Number", nullable = false, unique = true)
  private String bayNumber;

  @Enumerated(EnumType.STRING)
  @Column(name = "Status", nullable = false)
  private BayStatusEnum status;

  @OneToOne
  @JoinColumn(name = "Technician_Id", unique = true, nullable = true)
  private TechnicianEntity technician;
}
