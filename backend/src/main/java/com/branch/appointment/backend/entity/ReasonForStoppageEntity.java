package com.branch.appointment.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "BAS_Reason_For_Stoppage")
public class ReasonForStoppageEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Reason_Id")
  private Long id;

  @Column(name = "Reason_Name", nullable = false, unique = true)
  private String reasonName;
}

