package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.dto.ReasonForStoppageDto;
import com.branch.appointment.backend.entity.ReasonForStoppageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReasonForStoppageRepository extends JpaRepository<ReasonForStoppageEntity, Long> {
}
