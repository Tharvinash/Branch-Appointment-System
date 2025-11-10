package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.ReasonDto;
import com.branch.appointment.backend.service.ReasonService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reasons")
@AllArgsConstructor
public class ReasonController {

  private final ReasonService reasonService;

  @GetMapping
  public ResponseEntity<List<ReasonDto>> getAllReasons() {
    return ResponseEntity.ok(reasonService.getAllReasons());
  }
}

