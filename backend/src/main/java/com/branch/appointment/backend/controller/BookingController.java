package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.BookingDto;
import com.branch.appointment.backend.dto.BookingProcessDto;
import com.branch.appointment.backend.dto.ReasonForStoppageDto;
import com.branch.appointment.backend.dto.TimeExtensionDto;
import com.branch.appointment.backend.service.BookingService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@AllArgsConstructor
public class BookingController {

  private final BookingService bookingService;

  @GetMapping
  public ResponseEntity<List<BookingDto>> getAllBookings() {
    return ResponseEntity.ok(bookingService.getBookings());
  }

  @GetMapping("/{id}")
  public ResponseEntity<BookingDto> getBookingById(@PathVariable Long id) {
    return ResponseEntity.ok(bookingService.getBookingById(id));
  }

  @PostMapping
  public ResponseEntity<BookingDto> createBooking(@RequestBody BookingDto dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(dto));
  }

  @PutMapping("/{id}")
  public ResponseEntity<BookingDto> updateBooking(
      @PathVariable Long id,
      @RequestBody BookingDto dto
  ) {
    return ResponseEntity.ok(bookingService.updateBooking(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
    bookingService.deleteBooking(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/history")
  public ResponseEntity<List<BookingProcessDto>> getBookingHistory(@PathVariable Long id) {
    return ResponseEntity.ok(bookingService.getHistory(id));
  }

  @GetMapping("/processes/download")
  public ResponseEntity<byte[]> downloadBookingProcesses(@RequestParam(required = false) String carRegNo) {
    byte[] excelFile = bookingService.generateProcessReport(carRegNo);

    String fileName = (carRegNo != null ? carRegNo : "all") + "_processes.xlsx";

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .body(excelFile);
  }

  @GetMapping("/stoppage/reasons")
  public List<ReasonForStoppageDto> getStoppageReasons() {
    return bookingService.getStoppageReasons();
  }

  @PostMapping("/{id}/extend-time")
  public ResponseEntity<TimeExtensionDto> extendTime(
      @PathVariable Long id,
      @RequestBody Map<String, Object> request
  ) {
    String newEndTimeStr = (String) request.get("newEndTime");
    String extendedBy = (String) request.getOrDefault("extendedBy", "System");
    String reason = (String) request.getOrDefault("reason", "");
    LocalTime newEndTime = LocalTime.parse(newEndTimeStr);
    return ResponseEntity.ok(bookingService.extendTime(id, newEndTime, extendedBy, reason));
  }

  @GetMapping("/{id}/time-extensions")
  public ResponseEntity<List<TimeExtensionDto>> getTimeExtensions(@PathVariable Long id) {
    return ResponseEntity.ok(bookingService.getTimeExtensions(id));
  }

  @PostMapping("/{id}/delay-reason")
  public ResponseEntity<Void> updateDelayReason(
      @PathVariable Long id,
      @RequestBody Map<String, String> request
  ) {
    String delayReason = request.get("delayReason");
    bookingService.updateDelayReason(id, delayReason);
    return ResponseEntity.ok().build();
  }
}

