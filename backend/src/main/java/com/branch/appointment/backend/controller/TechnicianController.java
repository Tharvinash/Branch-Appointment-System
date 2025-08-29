package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.TechnicianDto;
import com.branch.appointment.backend.service.TechnicianService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/technicians")
public class TechnicianController {

  private TechnicianService technicianService;

  @GetMapping
  public ResponseEntity<List<TechnicianDto>> getTechnicians() {
    return ResponseEntity.status(HttpStatus.OK).body(technicianService.getTechnicianService());
  }
}
