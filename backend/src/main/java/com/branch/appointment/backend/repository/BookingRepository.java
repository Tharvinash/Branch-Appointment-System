package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
  
  /**
   * Find bookings for a specific bay that have time conflicts with the given time range.
   * Excludes the booking with the given bookingId (for updates).
   * Only checks bookings that have both start and end times set.
   */
  @Query("SELECT b FROM BookingEntity b WHERE b.bay.id = :bayId " +
         "AND b.jobStartTime IS NOT NULL AND b.jobEndTime IS NOT NULL " +
         "AND (:bookingId IS NULL OR b.id != :bookingId) " +
         "AND ((b.jobStartTime < :endTime AND b.jobEndTime > :startTime))")
  List<BookingEntity> findConflictingBookings(
      @Param("bayId") Long bayId,
      @Param("startTime") LocalTime startTime,
      @Param("endTime") LocalTime endTime,
      @Param("bookingId") Long bookingId
  );
}

