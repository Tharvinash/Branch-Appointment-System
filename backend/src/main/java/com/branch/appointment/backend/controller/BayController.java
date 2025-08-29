package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.service.BayService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/bays")
public class BayController {
  private BayService bayService;

  @GetMapping("/")
  public ResponseEntity<List<BayDto>> getBays() {
    return ResponseEntity.status(HttpStatus.OK).body(bayService.getBays());
  }
}
