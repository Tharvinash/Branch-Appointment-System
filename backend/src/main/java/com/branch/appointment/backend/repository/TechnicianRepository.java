package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.TechnicianEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TechnicianRepository extends JpaRepository<TechnicianEntity, Long> {
}
