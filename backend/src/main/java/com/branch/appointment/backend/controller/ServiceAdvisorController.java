package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.ServiceAdvisorDto;
import com.branch.appointment.backend.service.ServiceAdvisorService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/service-advisors")
public class ServiceAdvisorController {

  private final ServiceAdvisorService service;

  @GetMapping
  public ResponseEntity<List<ServiceAdvisorDto>> getAll() {
    return ResponseEntity.ok(service.getAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<ServiceAdvisorDto> getById(@PathVariable Long id) {
    return ResponseEntity.ok(service.getById(id));
  }

  @PostMapping
  public ResponseEntity<ServiceAdvisorDto> create(@RequestBody ServiceAdvisorDto dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ServiceAdvisorDto> update(@PathVariable Long id, @RequestBody ServiceAdvisorDto dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}

