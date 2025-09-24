package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.BookingProcessEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingProcessRepository extends JpaRepository<BookingProcessEntity, Long> {
  List<BookingProcessEntity> findByBookingIdOrderByChangedAtAsc(Long bookingId);
}

