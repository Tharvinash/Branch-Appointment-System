package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.TechnicianDto;
import com.branch.appointment.backend.service.TechnicianService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/technicians")
public class TechnicianController {

  private final TechnicianService technicianService;

  @GetMapping
  public ResponseEntity<List<TechnicianDto>> getTechnicians() {
    return ResponseEntity.ok(technicianService.getTechnicians());
  }

  @GetMapping("/{id}")
  public ResponseEntity<TechnicianDto> getTechnician(@PathVariable Long id) {
    return ResponseEntity.ok(technicianService.getTechnician(id));
  }

  @PostMapping
  public ResponseEntity<TechnicianDto> createTechnician(@RequestBody TechnicianDto dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(technicianService.createTechnician(dto));
  }

  @PutMapping("/{id}")
  public ResponseEntity<TechnicianDto> updateTechnician(@PathVariable Long id, @RequestBody TechnicianDto dto) {
    return ResponseEntity.ok(technicianService.updateTechnician(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTechnician(@PathVariable Long id) {
    technicianService.deleteTechnician(id);
    return ResponseEntity.noContent().build();
  }
}

