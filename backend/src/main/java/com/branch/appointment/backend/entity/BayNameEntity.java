package com.branch.appointment.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "BAS_Bay_Names")
public class BayNameEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Bay_Name_Id")
  private Long id;

  @Column(name = "Bay_Name", nullable = false, unique = true)
  private String bayName;
}
