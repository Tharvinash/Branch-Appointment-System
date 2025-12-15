package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.*;
import com.branch.appointment.backend.entity.*;
import com.branch.appointment.backend.enums.BookingStatusEnum;
import com.branch.appointment.backend.repository.*;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import com.branch.appointment.backend.exception.BadRequestException;

@Service
@AllArgsConstructor
@Slf4j
public class BookingService {

  private final BookingRepository bookingRepository;
  private final BookingProcessRepository processRepository;
  private final ServiceAdvisorRepository serviceAdvisorRepository;
  private final BayRepository bayRepository;
  private final ReasonForStoppageRepository reasonForStoppageRepository;
  private final TimeExtensionRepository timeExtensionRepository;

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
    // Validate times if provided
    if (dto.getJobStartTime() != null || dto.getJobEndTime() != null) {
      validateTimes(dto.getJobStartTime(), dto.getJobEndTime());
      
      // Check for booking conflicts if both times are provided
      if (dto.getJobStartTime() != null && dto.getJobEndTime() != null && dto.getBayId() != null) {
        validateNoBookingConflict(dto.getBayId(), dto.getJobStartTime(), dto.getJobEndTime(), null);
      }
    }

    BookingEntity booking = new BookingEntity();
    booking.setCarRegNo(dto.getCarRegNo());
    booking.setCheckinDate(dto.getCheckinDate());
    booking.setPromiseDate(dto.getPromiseDate());
    booking.setJobType(dto.getJobType());
    booking.setStatus(BookingStatusEnum.QUEUING);
    booking.setJobStartTime(dto.getJobStartTime());
    booking.setJobEndTime(dto.getJobEndTime());

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

    booking.setCarRegNo(dto.getCarRegNo());
    booking.setStoppageReason(dto.getStoppageReason());
    booking.setCheckinDate(dto.getCheckinDate());
    booking.setPromiseDate(dto.getPromiseDate());
    if (dto.getServiceAdvisorId() != null) {
      ServiceAdvisorEntity advisor = serviceAdvisorRepository.findById(dto.getServiceAdvisorId())
          .orElseThrow(() -> new RuntimeException("Service Advisor not found with id: " + dto.getServiceAdvisorId()));
      booking.setServiceAdvisor(advisor);
    }

    booking.setJobType(dto.getJobType());



    BookingStatusEnum oldStatus = booking.getStatus();
    Long oldBayId = booking.getBay() != null ? booking.getBay().getId() : null;

    // Update times only if explicitly provided in DTO, otherwise preserve existing times
    if (dto.getJobStartTime() != null || dto.getJobEndTime() != null) {
      // Validate times
      validateTimes(dto.getJobStartTime(), dto.getJobEndTime());
      
      // Check for booking conflicts if both times are provided
      Long bayIdToCheck = dto.getBayId() != null ? dto.getBayId() : 
                          (booking.getBay() != null ? booking.getBay().getId() : null);
      
      if (dto.getJobStartTime() != null && dto.getJobEndTime() != null && bayIdToCheck != null) {
        validateNoBookingConflict(bayIdToCheck, dto.getJobStartTime(), dto.getJobEndTime(), booking.getId());
      }
      
      // Only update times that are explicitly provided, preserve others
      if (dto.getJobStartTime() != null) {
        booking.setJobStartTime(dto.getJobStartTime());
      }
      if (dto.getJobEndTime() != null) {
        booking.setJobEndTime(dto.getJobEndTime());
      }
    }
    // If times are not provided in DTO, existing times are preserved (no else block needed)

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
        if (dto.getJobStartTime() == null || dto.getJobEndTime() == null) {
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

      // Save booking process log with bay information
      BookingProcessEntity process = new BookingProcessEntity();
      process.setBooking(booking);
      process.setFromStatus(oldStatus.toString());
      process.setToStatus(dto.getStatus().toString());
      
      // Set fromProcess and toProcess based on bay changes
      BayEntity currentBay = booking.getBay();
      process.setFromProcess(oldBayId != null ? 
          bayRepository.findById(oldBayId).orElse(null) : null);
      process.setToProcess(currentBay);
      
      process.setJobStartTime(dto.getJobStartTime());
      process.setJobEndTime(dto.getJobEndTime());
      process.setChangedAt(LocalDateTime.now());
      // Delay reason will be set separately when moving to next process
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
            p.getJobEndTime(),
            p.getDelayReason()
        )).toList();
  }

  @Transactional
  public TimeExtensionDto extendTime(Long bookingId, LocalTime newEndTime, String extendedBy, String reason) {
    BookingEntity booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

    if (booking.getJobEndTime() == null) {
      throw new RuntimeException("Booking does not have an end time to extend");
    }

    LocalTime previousEndTime = booking.getJobEndTime();

    if (newEndTime.isBefore(previousEndTime) || newEndTime.equals(previousEndTime)) {
      throw new RuntimeException("New end time must be after the current end time");
    }

    if (reason == null || reason.trim().isEmpty()) {
      throw new RuntimeException("Reason for extending time is required");
    }

    // Create time extension record
    TimeExtensionEntity extension = new TimeExtensionEntity();
    extension.setBooking(booking);
    extension.setBay(booking.getBay());
    extension.setPreviousEndTime(previousEndTime);
    extension.setNewEndTime(newEndTime);
    extension.setExtendedAt(LocalDateTime.now());
    extension.setExtendedBy(extendedBy);
    extension.setReason(reason.trim());
    timeExtensionRepository.save(extension);

    // Update booking end time
    booking.setJobEndTime(newEndTime);
    bookingRepository.save(booking);

    return TimeExtensionDto.builder()
        .id(extension.getId())
        .bookingId(bookingId)
        .bayId(booking.getBay() != null ? booking.getBay().getId() : null)
        .previousEndTime(previousEndTime)
        .newEndTime(newEndTime)
        .extendedAt(extension.getExtendedAt())
        .extendedBy(extendedBy)
        .reason(reason.trim())
        .build();
  }

  public List<TimeExtensionDto> getTimeExtensions(Long bookingId) {
    return timeExtensionRepository.findByBookingIdOrderByExtendedAtDesc(bookingId)
        .stream()
        .map(e -> TimeExtensionDto.builder()
            .id(e.getId())
            .bookingId(bookingId)
            .bayId(e.getBay() != null ? e.getBay().getId() : null)
            .previousEndTime(e.getPreviousEndTime())
            .newEndTime(e.getNewEndTime())
            .extendedAt(e.getExtendedAt())
            .extendedBy(e.getExtendedBy())
            .reason(e.getReason())
            .build())
        .toList();
  }

  @Transactional
  public void updateDelayReason(Long bookingId, String delayReason) {
    // Find the most recent process entry for this booking
    List<BookingProcessEntity> processes = processRepository.findByBookingIdOrderByChangedAtDesc(bookingId);
    if (processes.isEmpty()) {
      throw new RuntimeException("No process history found for booking: " + bookingId);
    }

    // Update the most recent process with delay reason
    BookingProcessEntity latestProcess = processes.get(0);
    latestProcess.setDelayReason(delayReason);
    processRepository.save(latestProcess);
  }

  private BookingDto mapToDto(BookingEntity entity) {
    if (entity == null) {
      return null;
    }

    Long advisorId = entity.getServiceAdvisor() != null
        ? entity.getServiceAdvisor().getId()
        : null;

    Long bayId = entity.getBay() != null
        ? entity.getBay().getId()
        : null;

    return new BookingDto(
        entity.getId(),
        entity.getCarRegNo(),
        entity.getCheckinDate(),
        entity.getPromiseDate(),
        advisorId,
        bayId,
        entity.getJobType(),
        entity.getStatus(),
        entity.getJobStartTime(),
        entity.getJobEndTime(),
        entity.getStoppageReason()
    );
  }



  private BayDto mapBayToDto(BayEntity entity) {
    if (entity == null) return null;

    TechnicianDto technicianDto = null;
    if (entity.getTechnician() != null) {
      ReasonDto reasonDto = null;
      if (entity.getTechnician().getReason() != null) {
        reasonDto = ReasonDto.builder()
            .id(entity.getTechnician().getReason().getId())
            .reason(entity.getTechnician().getReason().getReason())
            .build();
      }
      
      // Map job skills
      List<BayNameDto> jobSkills = null;
      if (entity.getTechnician().getJobSkills() != null && !entity.getTechnician().getJobSkills().isEmpty()) {
        jobSkills = entity.getTechnician().getJobSkills().stream()
            .map(bayName -> BayNameDto.builder()
                .id(bayName.getId())
                .name(bayName.getBayName())
                .build())
            .collect(Collectors.toList());
      }
      
      technicianDto = TechnicianDto.builder()
          .id(entity.getTechnician().getId())
          .name(entity.getTechnician().getName())
          .status(entity.getTechnician().getStatus())
          .reason(reasonDto)
          .jobSkills(jobSkills)
          .build();
    }

    return BayDto.builder()
        .id(entity.getId())
        .name(mapBayNameToDto(entity.getBayName())) // ✅ now returns BayNameDto
        .number(entity.getBayNumber())
        .status(entity.getStatus())
        .technician(technicianDto)
        .build();
  }



  public byte[] generateProcessReport(String carRegNo) {
    List<BookingProcessEntity> processes;

    if (carRegNo != null && !carRegNo.isEmpty()) {
      processes = processRepository.findByBooking_CarRegNoOrderByChangedAtAsc(carRegNo);
    } else {
      processes = processRepository.findAllByOrderByBooking_CarRegNoAscChangedAtAsc();
    }

    try (Workbook workbook = new XSSFWorkbook()) {
      Sheet sheet = workbook.createSheet("Booking Processes");
      int rowIdx = 0;

      // Header row
      Row header = sheet.createRow(rowIdx++);
      header.createCell(0).setCellValue("Car No Plate");
      header.createCell(1).setCellValue("From Status");
      header.createCell(2).setCellValue("To Status");
      header.createCell(3).setCellValue("Changed At");
      header.createCell(4).setCellValue("From Process");
      header.createCell(5).setCellValue("To Process");

      String lastCarNo = null;

      for (BookingProcessEntity process : processes) {
        String currentCarNo = process.getBooking().getCarRegNo();

        // Leave a blank row between different carRegNo
        if (lastCarNo != null && !lastCarNo.equals(currentCarNo)) {
          rowIdx++;
        }

        Row row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue(currentCarNo);
        row.createCell(1).setCellValue(process.getFromStatus());
        row.createCell(2).setCellValue(process.getToStatus());
        row.createCell(3).setCellValue(process.getChangedAt() != null ? process.getChangedAt().toString() : "");
//        row.createCell(4).setCellValue(process.getFromProcess() != null ? process.getFromProcess().getBayName() : "");
//        row.createCell(5).setCellValue(process.getToProcess() != null ? process.getToProcess().getBayName() : "");

        lastCarNo = currentCarNo;
      }

      ByteArrayOutputStream bos = new ByteArrayOutputStream();
      workbook.write(bos);
      return bos.toByteArray();

    } catch (IOException e) {
      throw new RuntimeException("Failed to generate Excel report", e);
    }
  }

  private BayNameDto mapBayNameToDto(BayNameEntity entity) {
    if (entity == null) return null;
    return BayNameDto.builder()
        .id(entity.getId())
        .name(entity.getBayName())
        .build();
  }

  public List<ReasonForStoppageDto> getStoppageReasons() {
    return reasonForStoppageRepository.findAll()
        .stream()
        .map(s -> new ReasonForStoppageDto(s.getId(), s.getReasonName()))
        .toList();
  }

  /**
   * Check if there's a booking conflict for the given bay and time range.
   */
  public CheckConflictResponse checkBookingConflict(Long bayId, LocalTime startTime, LocalTime endTime, Long excludeBookingId) {
    if (bayId == null || startTime == null || endTime == null) {
      return new CheckConflictResponse(false, null);
    }

    List<BookingEntity> conflictingBookings = bookingRepository.findConflictingBookings(
        bayId, startTime, endTime, excludeBookingId
    );

    if (!conflictingBookings.isEmpty()) {
      return new CheckConflictResponse(true, "The selected time conflicts with an existing booking for this bay. Please choose another time.");
    }

    return new CheckConflictResponse(false, null);
  }

  /**
   * Validates that times are within the allowed window (8:00 AM - 7:00 PM)
   * and that end time is after start time.
   */
  private void validateTimes(LocalTime startTime, LocalTime endTime) {
    LocalTime minTime = LocalTime.of(8, 0); // 8:00 AM
    LocalTime maxTime = LocalTime.of(19, 0); // 7:00 PM

    if (startTime != null) {
      if (startTime.isBefore(minTime) || startTime.isAfter(maxTime)) {
        throw new BadRequestException("Please choose a time between 8:00 AM and 7:00 PM.");
      }
    }

    if (endTime != null) {
      if (endTime.isBefore(minTime) || endTime.isAfter(maxTime)) {
        throw new BadRequestException("Please choose a time between 8:00 AM and 7:00 PM.");
      }
    }

    if (startTime != null && endTime != null) {
      if (!endTime.isAfter(startTime)) {
        throw new BadRequestException("Job end time must be after job start time.");
      }
    }
  }

  /**
   * Validates that there are no booking conflicts for the given bay and time range.
   * Excludes the booking with the given bookingId (for updates).
   */
  private void validateNoBookingConflict(Long bayId, LocalTime startTime, LocalTime endTime, Long excludeBookingId) {
    List<BookingEntity> conflictingBookings = bookingRepository.findConflictingBookings(
        bayId, startTime, endTime, excludeBookingId
    );

    if (!conflictingBookings.isEmpty()) {
      throw new BadRequestException("The selected time conflicts with an existing booking for this bay. Please choose another time.");
    }
  }
}

