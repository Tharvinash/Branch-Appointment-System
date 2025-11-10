package com.branch.appointment.backend.entity;

import com.branch.appointment.backend.enums.TechnicianStatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

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

  @ManyToOne
  @JoinColumn(name = "Reason_Id", nullable = true)
  private ReasonEntity reason;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "BAS_Technician_Job_Skills",
      joinColumns = @JoinColumn(name = "Technician_Id"),
      inverseJoinColumns = @JoinColumn(name = "Bay_Name_Id")
  )
  private Set<BayNameEntity> jobSkills = new HashSet<>();
}
