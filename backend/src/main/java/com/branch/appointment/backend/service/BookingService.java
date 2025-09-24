package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.dto.BookingDto;
import com.branch.appointment.backend.dto.BookingProcessDto;
import com.branch.appointment.backend.entity.BayEntity;
import com.branch.appointment.backend.entity.BookingEntity;
import com.branch.appointment.backend.entity.BookingProcessEntity;
import com.branch.appointment.backend.entity.ServiceAdvisorEntity;
import com.branch.appointment.backend.enums.BookingStatusEnum;
import com.branch.appointment.backend.repository.BayRepository;
import com.branch.appointment.backend.repository.BookingProcessRepository;
import com.branch.appointment.backend.repository.BookingRepository;
import com.branch.appointment.backend.repository.ServiceAdvisorRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class BookingService {

  private final BookingRepository bookingRepository;
  private final BookingProcessRepository processRepository;
  private final ServiceAdvisorRepository serviceAdvisorRepository;
  private final BayRepository bayRepository;

  public List<BookingDto> getBookings() {
    return bookingRepository.findAll().stream()
        .map(this::mapToDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public BookingDto getBookingById(Long id) {
    BookingEntity booking = bookingRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    return mapToDto(booking);
  }


  public BookingDto createBooking(BookingDto dto) {
    BookingEntity booking = new BookingEntity();
    booking.setCarRegNo(dto.getCarRegNo());
    booking.setCheckinDate(dto.getCheckinDate());
    booking.setPromiseDate(dto.getPromiseDate());
    booking.setJobType(dto.getJobType());
    booking.setStatus(BookingStatusEnum.QUEUING);

    // ✅ Fetch ServiceAdvisorEntity from DB
    ServiceAdvisorEntity advisor = serviceAdvisorRepository.findById(dto.getServiceAdvisorId())
        .orElseThrow(() -> new RuntimeException("Service Advisor not found with id: " + dto.getServiceAdvisorId()));
    booking.setServiceAdvisor(advisor);

    // ✅ Fetch BayEntity from DB
    BayEntity bay = bayRepository.findById(dto.getBayId())
        .orElseThrow(() -> new RuntimeException("Bay not found with id: " + dto.getBayId()));
    booking.setBay(bay);

    BookingEntity saved = bookingRepository.save(booking);
    return mapToDto(saved);
  }

  @Transactional
  public BookingDto updateBooking(Long id, BookingDto dto) {
    BookingEntity booking = bookingRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Booking not found"));

    BookingStatusEnum oldStatus = booking.getStatus();
    Long oldBayId = booking.getBay() != null ? booking.getBay().getId() : null;

    if (dto.getJobStartTime() != null) {
      booking.setJobStartTime(dto.getJobStartTime());
      booking.setJobEndTime(dto.getJobEndTime());
    }

    // Update bay if provided
    if (dto.getBayId() != null && !dto.getBayId().equals(oldBayId)) {
      BayEntity oldBay = oldBayId != null
          ? bayRepository.findById(oldBayId).orElse(null)
          : null;
      BayEntity newBay = bayRepository.findById(dto.getBayId())
          .orElseThrow(() -> new RuntimeException("Bay not found with id: " + dto.getBayId()));
      booking.setBay(newBay);

      // ✅ If bay changed while status is ACTIVE_BOARD, require new times
      if (oldStatus == BookingStatusEnum.ACTIVE_BOARD) {
        if (dto.getCheckinDate() == null || dto.getPromiseDate() == null) {
          throw new RuntimeException("Start and End times must be provided when moving an active booking to a new bay");
        }

        // Save booking process log
        BookingProcessEntity process = new BookingProcessEntity();
        process.setBooking(booking);
        process.setFromStatus(oldStatus.toString());
        process.setToStatus(oldStatus.toString());
        process.setFromProcess(oldBay);
        process.setToProcess(newBay);
        process.setJobStartTime(dto.getJobStartTime());
        process.setJobEndTime(dto.getJobEndTime());
        processRepository.save(process);
      }
    }

    // Update status if provided
    if (dto.getStatus() != null && dto.getStatus() != oldStatus) {
      booking.setStatus(dto.getStatus());

      if (oldStatus == BookingStatusEnum.NEXT_JOB && dto.getStatus() == BookingStatusEnum.ACTIVE_BOARD) {
        if (dto.getJobStartTime() == null || dto.getJobEndTime() == null) {
          throw new RuntimeException("Start and End times must be provided when moving from NEXT_JOB to ACTIVE_BOARD");
        }
      }

        // Save booking process log
        BookingProcessEntity process = new BookingProcessEntity();
        process.setBooking(booking);
        process.setFromStatus(oldStatus.toString());
        process.setToStatus(dto.getStatus().toString());
        process.setJobStartTime(dto.getJobStartTime());
        process.setJobEndTime(dto.getJobEndTime());
        processRepository.save(process);
    }

    BookingEntity saved = bookingRepository.save(booking);
    return mapToDto(saved);
  }


  public void deleteBooking(Long id) {
    bookingRepository.deleteById(id);
  }

  public List<BookingProcessDto> getHistory(Long bookingId) {
    return processRepository.findByBookingIdOrderByChangedAtAsc(bookingId)
        .stream()
        .map(p -> new BookingProcessDto(
            p.getId(),
            p.getFromStatus(),
            p.getToStatus(),
            mapBayToDto(p.getFromProcess()),   // convert entity → dto
            mapBayToDto(p.getToProcess()),     // convert entity → dto
            p.getChangedAt(),
            p.getJobStartTime(),
            p.getJobEndTime()
        )).toList();
  }

  private BookingDto mapToDto(BookingEntity entity) {
    return new BookingDto(
        entity.getId(),
        entity.getCarRegNo(),
        entity.getCheckinDate(),
        entity.getPromiseDate(),
        entity.getServiceAdvisor() != null ? entity.getServiceAdvisor().getId() : null,
        entity.getBay() != null ? entity.getBay().getId() : null,
        entity.getJobType(),
        entity.getStatus(),
        entity.getJobStartTime(),
        entity.getJobEndTime()
    );
  }


  private BayDto mapBayToDto(BayEntity entity) {
    if (entity == null) return null;
    return new BayDto(entity.getId(), entity.getBayName(), entity.getBayNumber(), entity.getStatus());
  }
}

