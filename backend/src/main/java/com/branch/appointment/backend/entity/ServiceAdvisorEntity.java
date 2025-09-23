package com.branch.appointment.backend.entity;

import com.branch.appointment.backend.enums.ServiceAdvisorStatusEnum;
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
@Table(name = "BAS_Service_Advisors")
public class ServiceAdvisorEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "SA_Id")
  private Long id;

  @Column(name = "SA_Name", nullable = false)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(name = "SA_Status", nullable = false)
  private ServiceAdvisorStatusEnum status;
}

