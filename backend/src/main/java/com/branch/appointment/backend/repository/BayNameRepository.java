package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.BayNameEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BayNameRepository extends JpaRepository<BayNameEntity, Long> {
}
