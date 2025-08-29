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
@Table(name = "BAS_Blocks")
public class BlockEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Block_Id")
  private long id;

  @Column(name = "Block_Name")
  private String blockName;

  @Column(name = "Block_Duration")
  private Long duration;
}
