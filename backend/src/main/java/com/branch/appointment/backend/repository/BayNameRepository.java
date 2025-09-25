package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.dto.BayNameDto;
import com.branch.appointment.backend.entity.BayNameEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BayNameRepository extends JpaRepository<BayNameEntity, Long> {
}

