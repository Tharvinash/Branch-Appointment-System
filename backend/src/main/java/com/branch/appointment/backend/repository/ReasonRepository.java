package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.ReasonEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReasonRepository extends JpaRepository<ReasonEntity, Long> {
}

