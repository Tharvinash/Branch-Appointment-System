package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.ServiceAdvisorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceAdvisorRepository extends JpaRepository<ServiceAdvisorEntity, Long> {
}

