package com.branch.appointment.backend.entity;

import com.branch.appointment.backend.enums.TechnicianStatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "BAS_Technicians")
public class TechnicianEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Technician_Id")
  private long id;

  @Column(name = "Technician_Name")
  private String name;

  @Column(name = "Category_Status")
  @Enumerated(EnumType.STRING)
  private TechnicianStatusEnum status;
}
