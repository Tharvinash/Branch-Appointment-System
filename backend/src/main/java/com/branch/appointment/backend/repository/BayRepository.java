package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.BayEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BayRepository extends JpaRepository<BayEntity, Long> {
}
