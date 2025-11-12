package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.TimeExtensionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeExtensionRepository extends JpaRepository<TimeExtensionEntity, Long> {
  List<TimeExtensionEntity> findByBookingIdOrderByExtendedAtDesc(Long bookingId);
}

