package com.branch.appointment.backend.entity;

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
  private long id;

  @Column(name = "Bay_Name")
  private String bayName;

  @Column(name = "Bay_Number")
  private String bayNumber;
}
