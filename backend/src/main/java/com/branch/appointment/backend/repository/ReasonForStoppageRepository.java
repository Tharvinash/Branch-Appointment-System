package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.ReasonForStoppageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReasonForStoppageRepository extends JpaRepository<ReasonForStoppageEntity, Long> {
}
